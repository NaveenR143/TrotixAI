import random
import logging
import os
from datetime import datetime, timedelta
import boto3
import re
from botocore.exceptions import ClientError, NoCredentialsError

# Configure logger
logger = logging.getLogger(__name__)

# In-memory store for OTPs
# Format: {phone: (otp, expiry_time)}
otp_store = {}

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


def send_otp(phone: str) -> str:
    """
    Generate a 4-digit OTP, store it in-memory, and return it.
    OTP expires in 5 minutes.
    """

    formattedphone = validate_and_format_indian_phone(phone if phone.startswith("+") else f"+91{phone}")

    otp = str(random.randint(1000, 9999))
    expiry_time = datetime.utcnow() + timedelta(minutes=5)
    otp_store[formattedphone] = (otp, expiry_time)

    print("formattedphone: ", formattedphone)

    message = f"Your OTP for RightNxt is {otp}."

    try:
        # Prepare parameters for the send_text_message API call

        phonenumber = '+919972566264'
        params = {
            "DestinationPhoneNumber": phonenumber,
            "MessageBody": message,
            "MessageType": "TRANSACTIONAL",
        }

        # # Check if an origination identity is configured in environment
        # origination_identity = os.environ.get("AWS_SMS_ORIGINATION_IDENTITY")
        # if origination_identity:
        #     params["OriginationIdentity"] = origination_identity

        # # Add India DLT parameters if configured
        # entity_id = os.environ.get("IN_ENTITY_ID")
        # template_id = os.environ.get("IN_TEMPLATE_ID")
        # if entity_id or template_id:
        #     country_params = {}
        #     if entity_id:
        #         country_params["IN_ENTITY_ID"] = entity_id
        #     if template_id:
        #         country_params["IN_TEMPLATE_ID"] = template_id
        #     params["DestinationCountryParameters"] = country_params

        logger.info(f"Sending OTP to {phone}")
        client = get_sms_client()
        response = client.send_text_message(**params)

        message_id = response.get("MessageId")
        # print("Sender ID :",origination_identity)
        print("OTP SMS sent successfully to ", phone, ". MessageId: ", message_id)
        logger.info(f"OTP SMS sent successfully to {phone}. MessageId: {message_id}")

    except NoCredentialsError as e:
        logger.warning(
            f"AWS credentials not located. Using fallback mock OTP for {phone}: {otp}"
        )
        print(f"AWS credentials not located. Using fallback mock OTP for {phone}: {otp}")
    except ClientError as e:
        error_code = e.response.get("Error", {}).get("Code", "Unknown")
        error_message = e.response.get("Error", {}).get("Message", str(e))
        logger.error(
            f"AWS SMS ClientError sending OTP to {phone}: Code={error_code}, Message={error_message}",
            exc_info=True
        )
        raise RuntimeError(f"Failed to send OTP via AWS SMS: {error_message}") from e
    except Exception as e:
        logger.error(f"Unexpected error sending OTP to {phone}: {str(e)}", exc_info=True)
        raise RuntimeError(f"An unexpected error occurred while sending OTP: {str(e)}") from e


    return otp


def verify_otp(phone: str, otp: str) -> bool:
    """
    Verify OTP for a given phone number.
    Returns True if correct and deletes it from memory.
    Returns False if incorrect, expired, or on error.
    """
    try:
        phone_key = phone if phone.startswith("+") else f"+91{phone}"

        entry = otp_store.get(phone_key)

        print("entry:", entry)

        if not entry:
            return False

        stored_otp, expiry_time = entry

        # Check expiry
        if datetime.utcnow() > expiry_time:
            otp_store.pop(phone_key, None)  # safely remove expired OTP
            return False

        # Check correctness
        if stored_otp == otp:
            otp_store.pop(phone_key, None)  # delete OTP after successful verification
            return True

        return False

    except Exception as e:
        print(f"Error verifying OTP for {phone}: {e}")
        return False
