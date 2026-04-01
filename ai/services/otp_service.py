import random
from datetime import datetime, timedelta

# In-memory store for OTPs
# Format: {phone: (otp, expiry_time)}
otp_store = {}


def send_otp(phone: str) -> str:
    """
    Generate a 4-digit OTP, store it in-memory, and return it.
    OTP expires in 5 minutes.
    """
    otp = str(random.randint(1000, 9999))
    expiry_time = datetime.utcnow() + timedelta(minutes=5)
    otp_store[phone] = (otp, expiry_time)

    print(f"OTP for {phone}: {otp}")  # Replace this with real SMS API
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
