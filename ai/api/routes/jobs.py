from fastapi import APIRouter
from ai.services.job_matcher_service import get_matching_jobs

router = APIRouter()


@router.get("/fetch-jobs")
def fetch_jobs(user_id: str):
    jobs = get_matching_jobs(user_id)

    return {
        "status": "completed",
        "jobs": jobs
    }
