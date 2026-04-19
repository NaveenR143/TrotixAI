from ai.db.phone_service import save_phone_to_db
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from ai.services.otp_service import verify_otp, send_otp
from ai.db.phone_service import mark_phone_verified
from ai.db.database import AsyncSessionLocal

router = APIRouter()


class OTPVerifyRequest(BaseModel):
    phone: str
    otp: str


class OTPSendRequest(BaseModel):
    phone: str
    name: str = None



@router.post("/verify-otp-update")
async def validate_otp(req: OTPVerifyRequest):
    """
    Verify OTP sent to the user.
    Returns success if OTP matches and deletes it from memory.
    Updates user status in database is_phone_verified = True.
    """
    if not verify_otp(req.phone, req.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    try:
        async with AsyncSessionLocal() as session:
            user_id, role = await mark_phone_verified(req.phone, session)
            if not user_id:
                raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to verify phone: {str(e)}")

    return {
        "status": "success",
        "user_id": user_id,
        "user_type": role,
        "message": "Phone verified successfully",
    }


@router.post("/verify-otp")
async def validate_otp_alt(req: OTPVerifyRequest):
    """
    Verify OTP sent to the user.
    Returns success if OTP matches and deletes it from memory.
    """
    if not verify_otp(req.phone, req.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    return {
        "status": "success",
        "user_id": req.phone,
        "message": "OTP verified successfully",
    }


@router.post("/send-otp")
def send_otp_to_primary(req: OTPSendRequest):
    print(f"DEBUG: Received OTP send request for: {req.phone}")
    if not req.phone:
        raise HTTPException(status_code=400, detail="Phone number is required")

    send_otp(req.phone)
    return {"message": f"OTP sent to {req.phone}"}


@router.post("/new-recruiter-otp")
async def validate_otp(req: OTPSendRequest):
    """
    Create a new user "recruiter" in the user table
    Send otp to the new user
    """
    try:
        async with AsyncSessionLocal() as session:
            user_id, is_existing = await save_phone_to_db(
                req.phone, "recruiter", session, name=req.name
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    # Send OTP
    try:
        send_otp(req.phone)
    except Exception as e:
        # We might still want to proceed if OTP fails, or fail the request.
        # Given it's a critical step, let's fail it.
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")

    return {
        "message": "OTP sent",
        "user_id": user_id,
        "phone": req.phone,
        "new_user": not is_existing,
    }
