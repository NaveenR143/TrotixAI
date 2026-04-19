from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any
import uuid

from ai.services.job_matcher_service import JobMatcherService
from ai.db.database import get_db
from ai.models.orm_models import JobPosting, Industry, EducationLevel, Department, Company, JobStatusEnum, JobTypeEnum, WorkModeEnum
from ai.models.job_models import JobMetadataResponse, JobCreateRequest, JobCreateResponse

router = APIRouter()


@router.get("/fetch-jobs")
async def fetch_jobs(user_id: str, db: AsyncSession = Depends(get_db)):
    jobs = await JobMatcherService.get_matching_jobs(user_id, db)

    return {
        "status": "completed",
        "jobs": jobs
    }


@router.get("/metadata", response_model=JobMetadataResponse)
async def get_job_metadata(db: AsyncSession = Depends(get_db)):
    """Fetch metadata for job posting dropdowns"""
    try:
        # Fetch industries
        industries_result = await db.execute(select(Industry.id, Industry.name))
        industries = [{"id": row.id, "name": row.name} for row in industries_result.all()]

        # Fetch education levels
        edu_result = await db.execute(select(EducationLevel.id, EducationLevel.name))
        education_levels = [{"id": row.id, "name": row.name} for row in edu_result.all()]

        # Fetch departments
        dept_result = await db.execute(select(Department.id, Department.name))
        departments = [{"id": row.id, "name": row.name} for row in dept_result.all()]

        return JobMetadataResponse(
            industries=industries,
            education_levels=education_levels,
            departments=departments,
            work_modes=[mode.value for mode in WorkModeEnum],
            job_types=[jt.value for jt in JobTypeEnum]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching metadata: {str(e)}")


@router.post("/create", response_model=JobCreateResponse)
async def create_job(request: JobCreateRequest, db: AsyncSession = Depends(get_db)):
    """Create a new job posting"""
    try:
        # 1. Find or create company (simplified for now - using first company if not found)
        # In a real app, recruiters belong to a company.
        company_result = await db.execute(select(Company).limit(1))
        company = company_result.scalar_one_or_none()
        
        if not company:
            raise HTTPException(status_code=400, detail="No company found in database. Please create a company first.")

        # 2. Create Job Posting
        new_job = JobPosting(
            slug=f"job-{uuid.uuid4().hex[:8]}",
            title=request.title,
            description=request.description,
            status=JobStatusEnum.active,
            experience_min_yrs=request.experience_min,
            experience_max_yrs=request.experience_max,
            work_mode=request.work_mode,
            openings=request.openings,
            industry_id=request.industry_id,
            department_id=request.department_id,
            education_requirement=request.education_requirement,
            company_id=company.id,
            location=request.location,
            salary_display=request.salary
        )
        
        db.add(new_job)
        await db.commit()
        await db.refresh(new_job)

        return JobCreateResponse(
            status="success",
            message="Job posted successfully",
            job_id=new_job.id
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating job: {str(e)}")
