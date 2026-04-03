from fastapi import APIRouter
from ai.api.routes import resume_upload, otp, jobs

router = APIRouter()

router.include_router(resume_upload.router, prefix="/resume-upload", tags=["Upload"])
router.include_router(otp.router, prefix="/otp", tags=["OTP"])
router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
