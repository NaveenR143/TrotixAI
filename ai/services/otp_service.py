import random
import logging
import os
from datetime import datetime, timedelta
import boto3
from botocore.exceptions import ClientError

# Configure logger
logger = logging.getLogger(__name__)

# In-memory store for OTPs
# Format: {phone: (otp, expiry_time)}
otp_store = {}

# Initialize Boto3 client
client = boto3.client(
    "pinpoint-sms-voice-v2",
    region_name="ap-south-2"
)


def send_otp(phone: str) -> str:
    """
    Generate a 4-digit OTP, store it in-memory, and return it.
    OTP expires in 5 minutes.
    """
    otp = str(random.randint(1000, 9999))
    expiry_time = datetime.utcnow() + timedelta(minutes=5)
    otp_store[phone] = (otp, expiry_time)

    message = f"Your OTP code sent by RightNxt is {otp}."

    try:
        # Prepare parameters for the send_text_message API call
        params = {
            "DestinationPhoneNumber": "+919972566264",
            "MessageBody": message,
            "MessageType": "TRANSACTIONAL",
        }

        # Check if an origination identity is configured in environment
        origination_identity = os.environ.get("AWS_SMS_ORIGINATION_IDENTITY")
        if origination_identity:
            params["OriginationIdentity"] = origination_identity

        logger.info(f"Sending OTP to {phone}")
        response = client.send_text_message(**params)

        message_id = response.get("MessageId")
        logger.info(f"OTP SMS sent successfully to {phone}. MessageId: {message_id}")

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
    Returns False if incorrect or expired.
    """
    entry = otp_store.get(phone)

    if not entry:
        return False

    stored_otp, expiry_time = entry

    # Check expiry
    if datetime.utcnow() > expiry_time:
        del otp_store[phone]  # remove expired OTP
        return False

    # Check correctness
    if stored_otp == otp:
        del otp_store[phone]  # delete OTP after successful verification
        return True

    return False
