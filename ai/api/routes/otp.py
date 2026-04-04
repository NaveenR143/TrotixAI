from fastapi import APIRouter, HTTPException, Body
from ai.services.otp_service import verify_otp, send_otp
from ai.db.phone_service import mark_phone_verified
from ai.db.database import AsyncSessionLocal

router = APIRouter()


@router.post("/verify-otp-update")
async def validate_otp(phone: str = Body(...), otp: str = Body(...)):
    """
    Verify OTP sent to the user.
    Returns success if OTP matches and deletes it from memory.
    Updates user status in database is_phone_verified = True.
    """
    if not verify_otp(phone, otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    try:
        async with AsyncSessionLocal() as session:
            success = await mark_phone_verified(phone, session)
            if not success:
                raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to verify phone: {str(e)}")

    return {
        "status": "success",
        "user_id": phone,
        "message": "Phone verified successfully"
    }


@router.post("/verify-otp")
async def validate_otp_alt(phone: str = Body(...), otp: str = Body(...)):
    """
    Verify OTP sent to the user.
    Returns success if OTP matches and deletes it from memory.
    Updates user status in database is_phone_verified = True.
    """
    if not verify_otp(phone, otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    return {
        "status": "success",
        "user_id": phone,
        "message": "OTP verified successfully"
    }


@router.post("/send-otp")
def send_otp_to_primary(phone: str = Body(...)):
    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")

    send_otp(phone)
    return {"message": f"OTP sent to {phone}"}
