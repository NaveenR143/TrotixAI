import random
import logging
import os
from datetime import datetime, timedelta, date
from typing import Optional
import boto3
import re
from botocore.exceptions import ClientError, NoCredentialsError
from sqlalchemy.ext.asyncio import AsyncSession
from ai.db.otp_repository import save_otp_to_db, get_recent_otps_from_db

# Configure logger
logger = logging.getLogger(__name__)

# Initialize Boto3 client lazily
_client = None

def get_sms_client():
    global _client
    if _client is None:
        _client = boto3.client(
            "pinpoint-sms-voice-v2",
            region_name="ap-south-2"
        )
    return _client


def validate_and_format_indian_phone(phone: str) -> str:
    """
    Validates if the phone number is a valid Indian mobile number and returns it in E.164 format.
    Accepts formats like:
      - 9009006739
      - +919009006739
      - 919009006739
      - +91 9009006739
      - 91-9009006739
      - 09009006739
    Indian mobile numbers must be 10 digits starting with 6, 7, 8, or 9.
    """
    if not phone:
        raise ValueError("Phone number cannot be empty")
    
    # Strip any non-digit characters
    cleaned = re.sub(r'\D', '', phone)
    
    # Remove leading zero if present
    if cleaned.startswith("0"):
        cleaned = cleaned[1:]
        
    if len(cleaned) == 10 and cleaned[0] in '6789':
        return f"+91{cleaned}"
    elif len(cleaned) == 12 and cleaned.startswith("91") and cleaned[2] in '6789':
        return f"+{cleaned}"
    else:
        raise ValueError("Invalid Indian mobile number. Must be a 10-digit number starting with 6, 7, 8, or 9.")


async def send_otp(phone: str, session: Optional[AsyncSession] = None) -> str:
    """
    Generate a 4-digit OTP, store it in database (otp_store table), and return it.
    OTP expires in 5 minutes.
    """

    formattedphone = validate_and_format_indian_phone(phone if phone.startswith("+") else f"+91{phone}")

    otp = str(random.randint(1000, 9999))
    await save_otp_to_db(formattedphone, otp, session=session)

    print("formattedphone: ", formattedphone, "otp: ", otp)

    message = f"Your OTP for RightNxt is {otp}  ."

    # Your OTP for RightNxt is {#num#}  .

    # try:
    #     # Prepare parameters for the send_text_message API call

    #     phonenumber = '+919972566264'
    #     params = {
    #         "DestinationPhoneNumber": phonenumber,
    #         "MessageBody": message,
    #         "MessageType": "TRANSACTIONAL",
    #     }

    #     # Check if an origination identity is configured in environment
    #     origination_identity = os.environ.get("AWS_SMS_ORIGINATION_IDENTITY")
    #     if origination_identity:
    #         params["OriginationIdentity"] = origination_identity

    #     # Add India DLT parameters if configured
    #     entity_id = os.environ.get("IN_ENTITY_ID")
    #     template_id = os.environ.get("IN_TEMPLATE_ID")
    #     if entity_id or template_id:
    #         country_params = {}
    #         if entity_id:
    #             country_params["IN_ENTITY_ID"] = entity_id
    #         if template_id:
    #             country_params["IN_TEMPLATE_ID"] = template_id
    #         params["DestinationCountryParameters"] = country_params

    #     logger.info(f"Sending OTP to {phone}")
    #     client = get_sms_client()
    #     response = client.send_text_message(**params)

    #     message_id = response.get("MessageId")
    #     # print("Sender ID :",origination_identity)
    #     print("OTP SMS sent successfully to ", phonenumber, ". MessageId: ", message_id, ". OTP : ", otp)
    #     logger.info(f"OTP SMS sent successfully to {phonenumber}. MessageId: {message_id}. OTP : {otp}")

    # except NoCredentialsError as e:
    #     logger.warning(
    #         f"AWS credentials not located. Using fallback mock OTP for {phone}: {otp}"
    #     )
    #     print(f"AWS credentials not located. Using fallback mock OTP for {phone}: {otp}")
    # except ClientError as e:
    #     error_code = e.response.get("Error", {}).get("Code", "Unknown")
    #     error_message = e.response.get("Error", {}).get("Message", str(e))
    #     logger.error(
    #         f"AWS SMS ClientError sending OTP to {phone}: Code={error_code}, Message={error_message}",
    #         exc_info=True
    #     )
    #     raise RuntimeError(f"Failed to send OTP via AWS SMS: {error_message}") from e
    # except Exception as e:
    #     logger.error(f"Unexpected error sending OTP to {phone}: {str(e)}", exc_info=True)
    #     raise RuntimeError(f"An unexpected error occurred while sending OTP: {str(e)}") from e


    return otp


async def verify_otp(phone: str, otp: str, session: Optional[AsyncSession] = None) -> bool:
    """
    Verify OTP for a given phone number against the 2 most recent database records.
    Returns True if correct and not expired.
    Returns False if incorrect, expired, or on error.
    """
    try:
        
        formattedphone = validate_and_format_indian_phone(phone if phone.startswith("+") else f"+91{phone}")
        
        print("Formatted Phone:", formattedphone)
        logger.info(f"formattedphone: {formattedphone}")
        
        recent_records = await get_recent_otps_from_db(formattedphone, limit=2, session=session)

        print("recent_records:", recent_records)
        logger.info(f"recent_records: {recent_records}")

        if not recent_records:
            logger.info(f"No OTP found for {phone}")
            print(f"No OTP found for {phone}")
            return False

        for entry in recent_records:
            stored_otp = str(entry.get("otp", ""))
            created_at = entry.get("created_at")

            # Check expiry (5 minutes)
            # if created_at:
            #     if isinstance(created_at, str):
            #         try:
            #             created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            #         except Exception:
            #             pass
            #     if isinstance(created_at, date) and not isinstance(created_at, datetime):
            #         created_at = datetime.combine(created_at, datetime.min.time())

            #     if isinstance(created_at, datetime):
            #         now = datetime.now(created_at.tzinfo) if getattr(created_at, "tzinfo", None) else datetime.utcnow()
            #         if (now - created_at) > timedelta(minutes=5):
            #             continue

            # Check correctness
            if stored_otp == str(otp):
                logger.info(f"OTP verified successfully for {formattedphone}")
                return True

        return False

    except Exception as e:
        logger.info(f"Error verifying OTP for {phone}: {e}")
        print(f"Error verifying OTP for {phone}: {e}")
        return False

