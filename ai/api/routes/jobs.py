from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ai.services.job_matcher_service import JobMatcherService
from ai.db.database import get_db

router = APIRouter()


@router.get("/fetch-jobs")
async def fetch_jobs(user_id: str, db: AsyncSession = Depends(get_db)):
    jobs = await JobMatcherService.get_matching_jobs(user_id, db)

    return {
        "status": "completed",
        "jobs": jobs
    }
