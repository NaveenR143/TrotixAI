from fastapi import APIRouter, Request, HTTPException, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import os
import json
import logging
import hmac
import hashlib
from ai.db.database import get_db
from ai.models.orm_models import User

# Configure logging
LOGGER = logging.getLogger("whatsapp_webhook")
LOGGER.setLevel(logging.INFO)

# Stream handler to write to stdout for console logs
if not LOGGER.handlers:
    import sys
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(
        "[%(asctime)s] %(levelname)s in %(name)s: %(message)s"
    ))
    LOGGER.addHandler(handler)

router = APIRouter()


@router.get("/webhook")
async def verify_whatsapp_webhook(
    request: Request,
    hub_mode: str = None,
    hub_challenge: str = None,
    hub_verify_token: str = None
):
    """
    Verify token from Meta.
    It receives the GET request parameters:
    - hub.mode
    - hub.challenge
    - hub.verify_token
    """
    # Meta passes these query parameters with dots in their names:
    # hub.mode, hub.challenge, hub.verify_token
    # FastAPI can't parse dotted parameters directly as function parameters unless we get them from request.query_params
    query_params = request.query_params
    mode = query_params.get("hub.mode")
    challenge = query_params.get("hub.challenge")
    verify_token = query_params.get("hub.verify_token")

    LOGGER.info(f"Verification request: mode={mode}, challenge={challenge}, verify_token={verify_token}")

    # Fallback to function params if query params didn't have dots (e.g. for testing)
    mode = mode or hub_mode
    challenge = challenge or hub_challenge
    verify_token = verify_token or hub_verify_token

    if not mode or not verify_token:
        LOGGER.warning("Missing mode or verify_token in verification request")
        raise HTTPException(status_code=400, detail="Missing hub.mode or hub.verify_token")

    if mode == "subscribe":
        # Get configured token from environment
        local_token = os.getenv("WATSAPP_VERIFY_TOKEN") or os.getenv("WHATSAPP_VERIFY_TOKEN")
        if not local_token:
            LOGGER.error("WATSAPP_VERIFY_TOKEN is not configured in the environment variables")
            raise HTTPException(status_code=500, detail="Verify token not configured on server")

        if verify_token == local_token:
            LOGGER.info("Verification successful!")
            return Response(content=challenge, media_type="text/plain")
        else:
            LOGGER.warning("Verification failed: tokens do not match")
            raise HTTPException(status_code=403, detail="Verification token mismatch")

    raise HTTPException(status_code=400, detail="Unsupported hub.mode")


@router.post("/webhook")
async def receive_whatsapp_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Receive WhatsApp Webhook notification events.
    """
    # 1. Read Raw Body for Signature Verification
    body = await request.body()
    
    # 2. Verify signature if WATSAPP_APP_SECRET is set
    app_secret = os.getenv("WATSAPP_APP_SECRET") or os.getenv("WHATSAPP_APP_SECRET")
    signature_header = request.headers.get("X-Hub-Signature-256")
    
    if app_secret and signature_header:
        # Signature header is expected to be format: sha256=xxxx
        expected_sig = signature_header.replace("sha256=", "").strip()
        computed_sig = hmac.new(
            app_secret.encode("utf-8"),
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(expected_sig, computed_sig):
            LOGGER.warning("WhatsApp Webhook signature verification failed!")
            raise HTTPException(status_code=403, detail="Signature verification failed")
            
    # 3. Parse JSON Body
    try:
        payload = json.loads(body)
    except Exception as e:
        LOGGER.error(f"Failed to parse WhatsApp Webhook body as JSON: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON")
        
    LOGGER.info(f"Received WhatsApp webhook event payload: {payload}")
    
    # 4. Extract entries and changes
    if payload.get("object") == "whatsapp_business_account":
        for entry in payload.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                
                # A. Handle statuses (delivery/read updates)
                if "statuses" in value:
                    for status in value["statuses"]:
                        msg_id = status.get("id")
                        msg_status = status.get("status")
                        recipient_id = status.get("recipient_id")
                        timestamp = status.get("timestamp")
                        
                        LOGGER.info(f"WhatsApp message status update: message_id={msg_id}, status={msg_status}, recipient={recipient_id}, time={timestamp}")
                        
                        if msg_status == "failed" and "errors" in status:
                            errors = status.get("errors", [])
                            LOGGER.error(f"WhatsApp delivery failure for message {msg_id}: {errors}")
                            
                # B. Handle messages (incoming replies/notifications from user)
                if "messages" in value:
                    for msg in value["messages"]:
                        sender_phone = msg.get("from")  # This is their WhatsApp number (wa_id)
                        msg_id = msg.get("id")
                        timestamp = msg.get("timestamp")
                        msg_type = msg.get("type")
                        
                        LOGGER.info(f"Incoming WhatsApp message received: from={sender_phone}, type={msg_type}, msg_id={msg_id}")
                        
                        message_content = ""
                        if msg_type == "text":
                            message_content = msg.get("text", {}).get("body", "")
                            LOGGER.info(f"Text body: {message_content}")
                        elif msg_type == "button":
                            message_content = msg.get("button", {}).get("text", "")
                            LOGGER.info(f"Button click text: {message_content}")
                        elif msg_type == "interactive":
                            interactive = msg.get("interactive", {})
                            int_type = interactive.get("type")
                            if int_type == "button_reply":
                                message_content = interactive.get("button_reply", {}).get("title", "")
                            elif int_type == "list_reply":
                                message_content = interactive.get("list_reply", {}).get("title", "")
                            LOGGER.info(f"Interactive selection: {message_content}")
                        else:
                            LOGGER.info(f"Media or other message type: {msg_type}")
                            
                        # Try to resolve user in the database
                        try:
                            # WhatsApp provides sender's phone number as a string containing country code (e.g. 919972566264)
                            # We check different variations against User.phone in the database
                            phone_variants = [sender_phone, f"+{sender_phone}"]
                            if len(sender_phone) >= 10:
                                phone_variants.append(sender_phone[-10:])
                                
                            query = select(User).where(User.phone.in_(phone_variants))
                            result = await db.execute(query)
                            user = result.scalar_one_or_none()
                            
                            if user:
                                LOGGER.info(f"WhatsApp sender resolved to DB user={user.id}, name={user.full_name}, role={user.role}")
                            else:
                                LOGGER.info(f"No database user matching phone variants: {phone_variants}")
                        except Exception as db_err:
                            LOGGER.error(f"Error checking user for WhatsApp phone {sender_phone}: {db_err}")

    return {"status": "success", "message": "Event received and logged"}
