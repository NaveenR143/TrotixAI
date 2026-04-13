from fastapi import APIRouter
from ai.api.routes import resume_upload, otp, jobs, profile

router = APIRouter()

router.include_router(resume_upload.router,
                      prefix="/resume-process", tags=["Upload,ResumeStatus"])
router.include_router(otp.router, prefix="/otp", tags=["OTP"])
router.include_router(jobs.router, prefix="/jobs", tags=["Jobs"])
router.include_router(profile.router, prefix="/profile", tags=["User Profile"])
