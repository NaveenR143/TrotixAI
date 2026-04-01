from fastapi import APIRouter, HTTPException, Body
from ai.services.otp_service import verify_otp, send_otp

router = APIRouter()


@router.post("/verify-otp")
def validate_otp(phone: str = Body(...), otp: str = Body(...)):
    """
    Verify OTP sent to the user.
    Returns success if OTP matches and deletes it from memory.
    """
    if not verify_otp(phone, otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    return {
        "status": "success",
        "user_id": phone
    }


@router.post("/send-otp")
def send_otp_to_primary(phone: str = Body(...)):
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")

    send_otp(phone)
    return {"message": f"OTP sent to {phone}"}
