from fastapi import APIRouter, Depends, HTTPException, status, Form, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import logging
import os

from ai.db.database import get_db
from ai.db.credit_repository import CreditRepository
from ai.models.credit_models import (
    CreditOperationRequest,
    CreditResponse,
    CreditWalletResponse,
    CreatePaymentOrderRequest,
    CreatePaymentOrderResponse,
    RazorpayOrderDetails,
    VerifyPaymentRequest,
    PaymentVerificationResponse,
    CreatePayUPaymentRequest,
    InitiatePayUPaymentResponse,
    PayUPaymentParams,
    PayUTxnStatusResponse,
)
from ai.models.orm_models import CreditTxTypeEnum, PaymentOrder, User
from ai.utils.auth import get_current_user
from payu_websdk.payuClient import Client as PayUClient

logger = logging.getLogger(__name__)


import razorpay

def get_razorpay_client():
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        logger.error("Razorpay keys are not configured in environment variables")
    return razorpay.Client(auth=(key_id, key_secret)), key_id


def get_payu_client():
    payu_key = os.getenv("PAYU_KEY")
    payu_salt = os.getenv("PAYU_SALT")
    payu_env = os.getenv("PAYU_ENV")
    if not payu_key or not payu_salt:
        logger.error("PayU keys are not configured in environment variables")
    
    return PayUClient(key=payu_key, salt=payu_salt, env=payu_env), payu_key, payu_salt, payu_env


# ─── Constants ─────────────────────────────────────────────────────────────
AI_FEATURE_CREDIT_COST = 20

# Map feature names to transaction types and descriptions
FEATURE_CONFIG = {
    "enhance_resume": {
        "tx_type": CreditTxTypeEnum.ai_resume_improve,
        "description": "AI Resume Enhancement",
        "cost": 20,
    },
    "skill_analysis": {
        "tx_type": CreditTxTypeEnum.skills_enhancement,
        "description": "AI Missing Skills Analysis",
        "cost": 20,
    },
    "learning_path": {
        "tx_type": CreditTxTypeEnum.ai_content_write,
        "description": "AI Learning Path Generation",
        "cost": 20,
    },
    "resume_download": {
        "tx_type": CreditTxTypeEnum.purchase,
        "description": "Premium Resume Template Download",
        "cost": 10,
    },
    "apply_with_ai": {
        "tx_type": CreditTxTypeEnum.ai_email_write,
        "description": "AI Apply (Generate Email)",
        "cost": 5,
    },
    "unlock_candidate": {
        "tx_type": CreditTxTypeEnum.purchase,
        "description": "Unlock Candidate Contact Details",
        "cost": 20,
    },
}

class FeatureUsageRequest(BaseModel):
    feature: str = Field(..., description="Feature name: enhance_resume, skill_analysis, or learning_path")

class FeatureUsageResponse(BaseModel):
    success: bool
    message: str
    balance: Optional[int] = None
    credits_deducted: int = 0

router = APIRouter(prefix="/credits", tags=["Credits"])

@router.get("/{user_id}", response_model=CreditWalletResponse)
async def get_wallet_balance(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Fetch the credit wallet balance for a user.
    """
    if str(user_id) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only access your own credit wallet"
        )
    try:
        wallet = await CreditRepository.get_wallet(user_id, db)
        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Credit wallet not found for user"
            )
        return CreditWalletResponse(**wallet)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/add/{user_id}", response_model=CreditResponse)
async def add_credits(
    user_id: UUID,
    request: CreditOperationRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Add credits to a user's wallet.
    """
    if str(user_id) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only add credits to your own wallet"
        )
    try:

        DATA = {
            "amount": 99,
            "currency": "INR",
            "receipt": user_id,
            "notes": {
                "key1": "value3",
                "key2": "value2"
            }
        }

        # success response 
        # {
        #     "id": "order_IluGWxBm9U8zJ8",
        #     "entity": "order",
        #     "amount": 50000,
        #     "amount_paid": 0,
        #     "amount_due": 50000,
        #     "currency": "INR",
        #     "receipt": "rcptid_11",
        #     "offer_id": null,
        #     "status": "created",
        #     "attempts": 0,
        #     "notes": [],
        #     "created_at": 1642662092
        # }

        # failure response
        # {
        #     "error": {
        #         "code": "BAD_REQUEST_ERROR",
        #         "description": "Order amount less than minimum amount allowed",
        #         "source": "business",
        #         "step": "payment_initiation",
        #         "reason": "input_validation_failed",
        #         "metadata": {},
        #         "field": "amount"
        #     }
        # }

        

        new_balance = await CreditRepository.add_credits(
            user_id=user_id,
            amount=request.amount,
            tx_type=request.type,
            description=request.description,
            session=db,
        )
        return CreditResponse(
            success=True,
            message=f"Successfully added {request.amount} credits.",
            balance=new_balance
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/create-order/{user_id}", response_model=CreatePaymentOrderResponse)
async def create_payment_order(
    user_id: UUID,
    request: CreatePaymentOrderRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Create a payment order via Razorpay and persist it in `payment_orders`.
    """
    if str(user_id) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only create payment orders for your own account"
        )
    
    # 1. Resolve client dynamically and verify credentials exist
    client, razorpay_key_id = get_razorpay_client()
    if not razorpay_key_id or not os.getenv("RAZORPAY_KEY_SECRET"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed: Razorpay credentials are not configured on the backend"
        )

    # 2. Validate amount >= 100 paise (minimum allowed by Razorpay)
    amount_paise = int(request.amount * 100)
    if amount_paise < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order amount must be at least 100 paise (1 INR)"
        )
    
    receipt_id = f"rcpt_{user_id.hex[:10]}_{int(datetime.now().timestamp())}"
    
    notes = {
        "user_id": str(user_id),
        "credits_to_add": str(request.credits_to_add),
        "package_name": request.package_name
    }
    
    order_data = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": receipt_id,
        "notes": notes
    }
    
    # 3. Call Razorpay API
    try:
        razorpay_order = client.order.create(data=order_data)
        
        # Parse provider_created_at
        provider_created_at = None
        if "created_at" in razorpay_order:
            provider_created_at = datetime.fromtimestamp(razorpay_order["created_at"], tz=timezone.utc)
        
        # Create database entry
        db_order = PaymentOrder(
            user_id=user_id,
            request_status="success",
            order_id=razorpay_order.get("id"),
            entity=razorpay_order.get("entity"),
            amount=razorpay_order.get("amount"),
            amount_paid=razorpay_order.get("amount_paid"),
            amount_due=razorpay_order.get("amount_due"),
            currency=razorpay_order.get("currency"),
            receipt=razorpay_order.get("receipt"),
            offer_id=razorpay_order.get("offer_id"),
            order_status=razorpay_order.get("status"),
            attempts=razorpay_order.get("attempts"),
            notes=razorpay_order.get("notes"),
            provider_created_at=provider_created_at
        )
        db.add(db_order)
        await db.commit()
        
        order_details = RazorpayOrderDetails(
            id=razorpay_order.get("id"),
            entity=razorpay_order.get("entity"),
            amount=razorpay_order.get("amount"),
            amount_paid=razorpay_order.get("amount_paid"),
            amount_due=razorpay_order.get("amount_due"),
            currency=razorpay_order.get("currency"),
            receipt=razorpay_order.get("receipt"),
            offer_id=razorpay_order.get("offer_id"),
            status=razorpay_order.get("status"),
            attempts=razorpay_order.get("attempts"),
            notes=razorpay_order.get("notes") or {},
            created_at=razorpay_order.get("created_at")
        )
        return CreatePaymentOrderResponse(
            success=True,
            message="Payment order created successfully",
            order=order_details,
            razorpay_key_id=razorpay_key_id
        )
        
    except Exception as e:
        # Log error
        logger.error(f"Razorpay order creation failed for user {user_id}: {str(e)}")
        
        # Extract error details if razorpay error format is dictionary-like
        error_code = "GATEWAY_ERROR"
        error_description = str(e)
        error_source = "gateway"
        error_step = "order_creation"
        error_reason = "internal_error"
        error_metadata = {}
        error_field = None
        
        # If we got a structured error from Razorpay
        if hasattr(e, 'error') and isinstance(e.error, dict):
            err_dict = e.error
            error_code = err_dict.get("code", error_code)
            error_description = err_dict.get("description", error_description)
            error_source = err_dict.get("source", error_source)
            error_step = err_dict.get("step", error_step)
            error_reason = err_dict.get("reason", error_reason)
            error_metadata = err_dict.get("metadata", {})
            error_field = err_dict.get("field")
        
        db_order = PaymentOrder(
            user_id=user_id,
            request_status="failure",
            error_code=error_code,
            error_description=error_description,
            error_source=error_source,
            error_step=error_step,
            error_reason=error_reason,
            error_metadata=error_metadata,
            error_field=error_field
        )
        db.add(db_order)
        await db.commit()
        
        # Determine status code based on error content
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        if any(keyword in error_description.lower() for keyword in ["auth", "credential", "unauthorized", "key_secret", "key_id"]):
            status_code = status.HTTP_401_UNAUTHORIZED
        elif "amount" in error_description.lower():
            status_code = status.HTTP_400_BAD_REQUEST

        raise HTTPException(
            status_code=status_code,
            detail=f"Failed to create payment order: {error_description}"
        )


@router.post("/verify-payment/{user_id}", response_model=PaymentVerificationResponse)
async def verify_payment(
    user_id: UUID,
    request: VerifyPaymentRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Verify Razorpay payment signature and atomically credit the user's wallet.
    """
    if str(user_id) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only verify payments for your own account"
        )
        
    # Validate missing fields explicitly
    if not request.razorpay_order_id or not request.razorpay_payment_id or not request.razorpay_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required"
        )
        
    # 1. Verify payment signature using dynamic client
    client, _ = get_razorpay_client()
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": request.razorpay_order_id,
            "razorpay_payment_id": request.razorpay_payment_id,
            "razorpay_signature": request.razorpay_signature
        })
    except Exception as e:
        logger.error(f"Signature verification failed for order {request.razorpay_order_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature. Verification failed."
        )

    # 2. Process order and add credits atomically
    from sqlalchemy import select
    
    try:
        async with db.begin_nested():
            order_query = select(PaymentOrder).where(PaymentOrder.order_id == request.razorpay_order_id).with_for_update()
            order_result = await db.execute(order_query)
            db_order = order_result.scalars().first()
            
            if not db_order:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Payment order not found."
                )
            
            # Idempotency check: if order is already completed/paid, don't credit again
            if db_order.order_status in ["paid", "completed"]:
                wallet = await CreditRepository.get_wallet(user_id, db)
                balance = wallet["balance"] if wallet else 0
                return PaymentVerificationResponse(
                    success=True,
                    message="Payment already processed and credits added.",
                    order_id=request.razorpay_order_id,
                    payment_id=request.razorpay_payment_id,
                    credits_added=0,
                    balance=balance
                )
            
            # Calculate credits to add
            credits_to_add = 0
            if db_order.notes and "credits_to_add" in db_order.notes:
                try:
                    credits_to_add = int(db_order.notes["credits_to_add"])
                except ValueError:
                    pass
            
            if credits_to_add <= 0:
                if db_order.amount == 9900:
                    credits_to_add = 100
                else:
                    credits_to_add = 0
            
            if credits_to_add <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid credit amount detected in order metadata."
                )
                
            # Update order details
            db_order.order_status = "paid"
            db_order.amount_paid = db_order.amount
            db_order.amount_due = 0
            
            # Add payment ID to notes
            if db_order.notes is None:
                db_order.notes = {}
            if isinstance(db_order.notes, dict):
                notes_copy = dict(db_order.notes)
                notes_copy["razorpay_payment_id"] = request.razorpay_payment_id
                db_order.notes = notes_copy
            
            # Add credits atomically
            description = f"Credits purchase: Order {request.razorpay_order_id}"
            new_balance = await CreditRepository.add_credits(
                user_id=user_id,
                amount=credits_to_add,
                tx_type=CreditTxTypeEnum.purchase,
                description=description,
                session=db
            )
            
            return PaymentVerificationResponse(
                success=True,
                message=f"Payment verified successfully! Added {credits_to_add} credits.",
                order_id=request.razorpay_order_id,
                payment_id=request.razorpay_payment_id,
                credits_added=credits_to_add,
                balance=new_balance
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing payment verification for order {request.razorpay_order_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification failed: {str(e)}"
        )


@router.post("/deduct/{user_id}", response_model=CreditResponse)
async def deduct_credits(
    user_id: UUID,
    request: CreditOperationRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Deduct credits from a user's wallet.
    """
    if str(user_id) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only deduct credits from your own wallet"
        )
    try:
        # Step 1: Check wallet balance first
        wallet = await CreditRepository.get_wallet(user_id, db)
        if not wallet:
            return CreditResponse(
                success=False,
                message="Credit wallet not found for user.",
                balance=None
            )
        
        current_balance = wallet["balance"]
        
        # Step 2: Check if sufficient credits
        if current_balance < request.amount:
            return CreditResponse(
                success=False,
                message=f"Insufficient credits. You need {request.amount} credits but have {current_balance}.",
                balance=current_balance
            )
        
        # Step 3: Deduct credits
        success = await CreditRepository.deduct_credits(
            user_id=user_id,
            amount=request.amount,
            tx_type=request.type,
            description=request.description,
            session=db,
        )
        
        if not success:
            return CreditResponse(
                success=False,
                message="Credit deduction failed.",
                balance=current_balance
            )
            
        wallet = await CreditRepository.get_wallet(user_id, db)
        new_balance = wallet["balance"] if wallet else None
            
        return CreditResponse(
            success=True,
            message=f"Successfully deducted {request.amount} credits.",
            balance=new_balance
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/use-feature/{user_id}", response_model=FeatureUsageResponse)
async def use_ai_feature(
    user_id: UUID,
    request: FeatureUsageRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Deduct credits for an AI feature or premium template download.
    
    Accepts feature names with their respective costs:
    - enhance_resume: 20 credits
    - skill_analysis: 20 credits
    - learning_path: 20 credits
    - resume_download: 10 credits (for premium templates)
    
    Validates wallet existence, checks balance, deducts credits, and returns updated balance.
    """
    try:
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You can only use features for your own account"
            )
        # Validate feature name
        feature_name = request.feature.lower().strip()
        if feature_name not in FEATURE_CONFIG:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid feature: '{feature_name}'. Valid features: {', '.join(FEATURE_CONFIG.keys())}"
            )

        config = FEATURE_CONFIG[feature_name]
        credits_cost = config.get("cost", AI_FEATURE_CREDIT_COST)

        # Validate user wallet exists
        wallet = await CreditRepository.get_wallet(user_id, db)
        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Credit wallet not found for user. Please contact support."
            )

        # Check available balance
        current_balance = wallet["balance"]
        if current_balance < credits_cost:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient credits. You need {credits_cost} credits but have {current_balance}. Please purchase more credits."
            )

        # Deduct credits
        success = await CreditRepository.deduct_credits(
            user_id=user_id,
            amount=credits_cost,
            tx_type=config["tx_type"],
            description=config["description"],
            session=db,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Credit deduction failed. Insufficient balance."
            )

        # Fetch updated balance
        updated_wallet = await CreditRepository.get_wallet(user_id, db)
        new_balance = updated_wallet["balance"] if updated_wallet else None

        logger.info(f"Deducted {credits_cost} credits for {feature_name} from user {user_id}. New balance: {new_balance}")

        return FeatureUsageResponse(
            success=True,
            message=f"Successfully deducted {credits_cost} credits for {config['description']}.",
            balance=new_balance,
            credits_deducted=credits_cost,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deducting credits for feature {request.feature}, user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/payu/initiate/{user_id}", response_model=InitiatePayUPaymentResponse)
async def initiate_payu_payment(
    user_id: UUID,
    request: CreatePayUPaymentRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Initiate a PayU payment order and return required signature parameters.
    """
    if str(user_id) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only purchase credits for your own account"
        )
        
    try:
        stmt = select(User).where(User.id == user_id)
        res = await db.execute(stmt)
        user_record = res.scalars().first()
        if not user_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        import re
        full_name = user_record.full_name or "User"
        firstname = full_name.split()[0] if full_name.strip() else "User"
        firstname = re.sub(r'[^a-zA-Z0-9]', '', firstname) or "User"
        email = user_record.email or "user@example.com"
        phone = user_record.phone or "9999999999"
        
        payu_client, payu_key, payu_salt, payu_env = get_payu_client()
        if not payu_key or not payu_salt:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="PayU keys are not configured on the backend"
            )
            
        import time
        import uuid
        txnid = f"tx_payu_{int(time.time())}_{uuid.uuid4().hex[:6]}"
        amount_str = f"{request.amount:.2f}"
        
        surl = os.getenv("PAYU_CALLBACK_URL", "http://localhost:8000/credits/payu/callback")
        furl = os.getenv("PAYU_CALLBACK_URL", "http://localhost:8000/credits/payu/callback")
        
        params = {
            "txnid": txnid,
            "amount": amount_str,
            "productinfo": request.package_name,
            "firstname": firstname,
            "email": email,
            "phone": phone,
            "surl": surl,
            "furl": furl,
            "udf1": str(user_id),
            "udf2": str(request.credits_to_add),
            "udf3": request.package_name,
            "udf4": "",
            "udf5": ""
        }
        
        payu_hash = payu_client.generatePaymentHash(params)
        
        # Save pending order in DB (amount stored as paise)
        amount_paise = int(request.amount * 100)
        
        db_order = PaymentOrder(
            user_id=user_id,
            request_status="success",
            order_id=txnid,
            entity="payu_order",
            amount=amount_paise,
            amount_paid=0,
            amount_due=amount_paise,
            currency="INR",
            receipt=txnid,
            order_status="created",
            attempts=1,
            notes={
                "user_id": str(user_id),
                "credits_to_add": str(request.credits_to_add),
                "package_name": request.package_name,
                "payment_gateway": "payu",
                "env": payu_env
            }
        )
        db.add(db_order)
        await db.commit()
        
        payment_params = PayUPaymentParams(
            key=payu_key,
            txnid=txnid,
            amount=amount_str,
            productinfo=request.package_name,
            firstname=firstname,
            email=email,
            phone=phone,
            surl=surl,
            furl=furl,
            hash=payu_hash,
            udf1=str(user_id),
            udf2=str(request.credits_to_add),
            udf3=request.package_name
        )
        
        return InitiatePayUPaymentResponse(
            success=True,
            message="PayU payment initiated successfully",
            payment_params=payment_params,
            payment_url=payu_client.paymentURL
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PayU payment initiation failed for user {user_id}: {str(e)}")
        try:
            db_order = PaymentOrder(
                user_id=user_id,
                request_status="failure",
                entity="payu_order",
                error_code="INITIATION_ERROR",
                error_description=str(e),
                error_source="gateway",
                error_step="order_creation",
                error_reason="internal_error"
            )
            db.add(db_order)
            await db.commit()
        except Exception as db_err:
            logger.error(f"Failed to record initiation failure to DB: {db_err}")
            
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate PayU payment: {str(e)}"
        )


@router.post("/payu/callback")
async def payu_callback(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Public endpoint for PayU POST callback/redirect logic.
    Verifies payment signature and updates credits atomically.
    """
    try:
        form_data = await request.form()
        params = dict(form_data)
        
        logger.info(f"PayU Callback received params: {params}")
        
        payu_client, _, _, _ = get_payu_client()
        is_valid_hash = False
        try:
            is_valid_hash = payu_client.validateReverseHash(params)
        except Exception as hash_err:
            logger.error(f"Error validating PayU reverse hash: {hash_err}")
            
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        
        if not is_valid_hash:
            logger.error(f"PayU payment hash validation failed for params: {params}")
            return RedirectResponse(
                url=f"{frontend_url}/membership?status=failure&message=Payment validation failed. Invalid signature.",
                status_code=303
            )
            
        txnid = params.get("txnid")
        status_val = params.get("status")
        amount = params.get("amount", "0.0")
        mihpayid = params.get("mihpayid")
        user_id_str = params.get("udf1")
        credits_to_add_str = params.get("udf2")
        
        if not txnid or not user_id_str or not credits_to_add_str:
            logger.error(f"Missing essential parameters in PayU callback: {params}")
            return RedirectResponse(
                url=f"{frontend_url}/membership?status=failure&message=Missing callback parameters",
                status_code=303
            )
            
        user_id = UUID(user_id_str)
        credits_to_add = int(credits_to_add_str)
        
        async with db.begin_nested():
            order_query = select(PaymentOrder).where(PaymentOrder.order_id == txnid).with_for_update()
            order_result = await db.execute(order_query)
            db_order = order_result.scalars().first()
            
            if not db_order:
                logger.error(f"PayU PaymentOrder not found for txnid {txnid}")
                return RedirectResponse(
                    url=f"{frontend_url}/membership?status=failure&message=Order not found",
                    status_code=303
                )
                
            if db_order.order_status in ["paid", "completed"]:
                logger.info(f"PayU payment already processed for txnid {txnid}")
                return RedirectResponse(
                    url=f"{frontend_url}/membership?status=success&txnid={txnid}&credits={credits_to_add}",
                    status_code=303
                )
                
            if status_val == "success":
                db_order.order_status = "paid"
                db_order.amount_paid = int(float(amount) * 100)
                db_order.amount_due = 0
                
                notes_copy = dict(db_order.notes or {})
                notes_copy["mihpayid"] = mihpayid
                notes_copy["bank_ref_num"] = params.get("bank_ref_num")
                notes_copy["payu_status"] = status_val
                db_order.notes = notes_copy
                
                description = f"PayU Credits purchase: Txn {txnid}"
                new_balance = await CreditRepository.add_credits(
                    user_id=user_id,
                    amount=credits_to_add,
                    tx_type=CreditTxTypeEnum.purchase,
                    description=description,
                    session=db
                )
                
                logger.info(f"Successfully processed PayU payment for user {user_id}. Added {credits_to_add} credits. New balance: {new_balance}")
                
                return RedirectResponse(
                    url=f"{frontend_url}/membership?status=success&txnid={txnid}&credits={credits_to_add}",
                    status_code=303
                )
            else:
                db_order.order_status = "failed"
                notes_copy = dict(db_order.notes or {})
                notes_copy["payu_status"] = status_val
                notes_copy["error_code"] = params.get("error")
                notes_copy["error_message"] = params.get("error_Message")
                db_order.notes = notes_copy
                db_order.error_code = params.get("error") or "PAYMENT_FAILED"
                db_order.error_description = params.get("error_Message") or f"Payment failed with status {status_val}"
                
                logger.warning(f"PayU payment failed for txnid {txnid}: status={status_val}, error={params.get('error_Message')}")
                
                return RedirectResponse(
                    url=f"{frontend_url}/membership?status=failure&txnid={txnid}&message={params.get('error_Message') or 'Payment failed'}",
                    status_code=303
                )
    except Exception as e:
        logger.error(f"Error handling PayU callback redirect: {str(e)}")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(
            url=f"{frontend_url}/membership?status=failure&message=An error occurred during callback verification",
            status_code=303
        )


@router.get("/payu/status/{txnid}", response_model=PayUTxnStatusResponse)
async def get_payu_transaction_status(
    txnid: str,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Fetch the database state of a transaction. Synchronizes with PayU postservice API if pending.
    """
    try:
        stmt = select(PaymentOrder).where(PaymentOrder.order_id == txnid)
        res = await db.execute(stmt)
        db_order = res.scalars().first()
        
        if not db_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction order not found"
            )
            
        if str(db_order.user_id) != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You can only view status of your own transactions"
            )
            
        credits_to_add = 0
        if db_order.notes and "credits_to_add" in db_order.notes:
            try:
                credits_to_add = int(db_order.notes["credits_to_add"])
            except ValueError:
                pass
                
        if db_order.order_status in ["created", "pending"]:
            try:
                payu_client, _, _, _ = get_payu_client()
                response_text = payu_client.verifyPayment(txnid)
                logger.info(f"Manual PayU verification response for {txnid}: {response_text}")
                
                import json
                res_data = json.loads(response_text)
                
                if res_data.get("status") == 1:
                    details = res_data.get("transaction_details", {})
                    txn_details = details.get(txnid, {})
                    payu_status = txn_details.get("status")
                    
                    if payu_status == "success":
                        async with db.begin_nested():
                            stmt_lock = select(PaymentOrder).where(PaymentOrder.order_id == txnid).with_for_update()
                            res_lock = await db.execute(stmt_lock)
                            db_order_locked = res_lock.scalars().first()
                            
                            if db_order_locked and db_order_locked.order_status not in ["paid", "completed"]:
                                db_order_locked.order_status = "paid"
                                db_order_locked.amount_paid = db_order_locked.amount
                                db_order_locked.amount_due = 0
                                
                                notes_copy = dict(db_order_locked.notes or {})
                                notes_copy["mihpayid"] = txn_details.get("mihpayid")
                                notes_copy["bank_ref_num"] = txn_details.get("bank_ref_num")
                                notes_copy["payu_status"] = payu_status
                                notes_copy["synced_via_api"] = "true"
                                db_order_locked.notes = notes_copy
                                
                                description = f"PayU Credits purchase sync: Txn {txnid}"
                                await CreditRepository.add_credits(
                                    user_id=db_order_locked.user_id,
                                    amount=credits_to_add,
                                    tx_type=CreditTxTypeEnum.purchase,
                                    description=description,
                                    session=db
                                )
                                await db.commit()
                                db_order.order_status = "paid"
                                db_order.request_status = "success"
                                
                    elif payu_status in ["failure", "failed"]:
                        async with db.begin_nested():
                            stmt_lock = select(PaymentOrder).where(PaymentOrder.order_id == txnid).with_for_update()
                            res_lock = await db.execute(stmt_lock)
                            db_order_locked = res_lock.scalars().first()
                            if db_order_locked and db_order_locked.order_status not in ["paid", "completed", "failed"]:
                                db_order_locked.order_status = "failed"
                                notes_copy = dict(db_order_locked.notes or {})
                                notes_copy["payu_status"] = payu_status
                                notes_copy["synced_via_api"] = "true"
                                db_order_locked.notes = notes_copy
                                db_order_locked.error_description = txn_details.get("error_Message") or "Payment failed"
                                await db.commit()
                                db_order.order_status = "failed"
            except Exception as e:
                logger.error(f"Error syncing PayU transaction status for {txnid}: {e}")
                
        return PayUTxnStatusResponse(
            success=True,
            txnid=txnid,
            status=db_order.order_status,
            amount=float(db_order.amount / 100) if db_order.amount else 0.0,
            credits_to_add=credits_to_add,
            request_status=db_order.request_status
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch PayU transaction status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking transaction status: {str(e)}"
        )


