from datetime import datetime
from ai.services.message_service import MessageService
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from typing import List, Dict, Any
import uuid

from ai.services.job_matcher_service import JobMatcherService
from ai.db.database import get_db
from ai.models.orm_models import (
    JobPosting,
    Industry,
    EducationLevel,
    Department,
    Company,
    Recruiter,
    RecruiterProfile,
    JobStatusEnum,
    JobTypeEnum,
    WorkModeEnum,
)
from ai.models.job_models import (
    JobMetadataResponse,
    JobCreateRequest,
    JobCreateResponse,
)

router = APIRouter()


@router.get("/fetch-jobs")
async def fetch_jobs(user_id: str, db: AsyncSession = Depends(get_db)):
    jobs = await JobMatcherService.get_matching_jobs(user_id, db)

    return {"status": "completed", "jobs": jobs}


@router.get("/fetch-recruiter-posted-jobs")
async def fetch_recruiter_posted_jobs(user_id: str, db: AsyncSession = Depends(get_db)):
    try:
        try:
            recruiter_uuid = uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=400, detail="Invalid user_id format. Must be a valid UUID."
            )

        stmt = (
            select(JobPosting)
            .options(
                joinedload(JobPosting.company),
                joinedload(JobPosting.industry),
                joinedload(JobPosting.dept),
            )
            .where(JobPosting.recruiter_id == recruiter_uuid)
            .order_by(JobPosting.created_at.desc())
        )

        result = await db.execute(stmt)
        jobs = result.scalars().all()

        jobs_data = []
        for job in jobs:
            job_dict = {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "summary": job.summary,
                "status": job.status.value if job.status else None,
                "experience_min_yrs": job.experience_min_yrs,
                "experience_max_yrs": job.experience_max_yrs,
                "experience_level": (
                    job.experience_level.value if job.experience_level else None
                ),
                "salary_min": (
                    float(job.salary_min) if job.salary_min is not None else None
                ),
                "salary_max": (
                    float(job.salary_max) if job.salary_max is not None else None
                ),
                "job_type": job.job_type.value if job.job_type else None,
                "work_mode": job.work_mode.value if job.work_mode else None,
                "openings": job.openings,
                "location": job.location,
                "state": job.state,
                "city": job.city,
                "country": job.country,
                "view_count": job.view_count,
                "apply_count": job.apply_count,
                "posted_at": job.posted_at,
                "company": (
                    {
                        "id": job.company.id,
                        "name": job.company.name,
                        "website": job.company.website,
                        "description": job.company.description,
                        "headquarters": job.company.headquarters,
                        "linkedin_url": job.company.linkedin_url,
                    }
                    if job.company
                    else None
                ),
                "industry": (
                    {
                        "id": job.industry.id,
                        "name": job.industry.name,
                    }
                    if job.industry
                    else None
                ),
                "department": (
                    {
                        "id": job.dept.id,
                        "name": job.dept.name,
                    }
                    if job.dept
                    else None
                ),
            }
            jobs_data.append(job_dict)

        return {"status": "success", "data": jobs_data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching recruiter jobs: {str(e)}"
        )


@router.get("/metadata", response_model=JobMetadataResponse)
async def get_job_metadata(db: AsyncSession = Depends(get_db)):
    """Fetch metadata for job posting dropdowns"""
    try:
        # Fetch industries
        industries_result = await db.execute(select(Industry.id, Industry.name))
        industries = [
            {"id": row.id, "name": row.name} for row in industries_result.all()
        ]

        # Fetch education levels
        edu_result = await db.execute(select(EducationLevel.id, EducationLevel.name))
        education_levels = [
            {"id": row.id, "name": row.name} for row in edu_result.all()
        ]

        # Fetch departments
        dept_result = await db.execute(select(Department.id, Department.name))
        departments = [{"id": row.id, "name": row.name} for row in dept_result.all()]

        return JobMetadataResponse(
            industries=industries,
            education_levels=education_levels,
            departments=departments,
            work_modes=[mode.value for mode in WorkModeEnum],
            job_types=[jt.value for jt in JobTypeEnum],
            experience_levels=[el.value for el in ExpLevelEnum],
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching metadata: {str(e)}"
        )


@router.post("/create", response_model=JobCreateResponse)
async def create_job(request: JobCreateRequest, db: AsyncSession = Depends(get_db)):
    """Create a new job posting"""
    try:
        # 1. Resolve company_id by name
        company_result = await db.execute(
            select(Company).where(Company.name == request.company)
        )
        company = company_result.scalar_one_or_none()

        if not company:
            # Auto-insert a new company record and use its generated id
            company = Company(name=request.company)
            db.add(company)
            await db.flush()  # populate company.id without committing yet

        # 2. Resolve department_id — only use if it exists in DB
        resolved_department_id: int | None = None
        if request.department_id is not None:
            dept_result = await db.execute(
                select(Department).where(Department.id == request.department_id)
            )
            dept = dept_result.scalar_one_or_none()
            if dept:
                resolved_department_id = dept.id

        # 3. Resolve industry_id — only use if it exists in DB
        resolved_industry_id: int | None = None
        if request.industry_id is not None:
            industry_result = await db.execute(
                select(Industry).where(Industry.id == request.industry_id)
            )
            industry = industry_result.scalar_one_or_none()
            if industry:
                resolved_industry_id = industry.id

        # 5. Build and insert the job posting
        new_job = JobPosting(
            title=request.title,
            description=request.description,
            status=JobStatusEnum.active,
            experience_min_yrs=request.experience_min,
            experience_max_yrs=request.experience_max,
            experience_level=(
                request.experience_level if request.experience_level else None
            ),
            salary_min=(
                request.salary_min
                if request.salary_min and request.salary_min > 0
                else None
            ),
            salary_max=(
                request.salary_max
                if request.salary_max and request.salary_max > 0
                else None
            ),
            work_mode=request.work_mode,
            openings=request.openings,
            education_requirement=request.education_requirement,
            company_id=company.id,
            location=request.location,
            # Only set FKs when the records were found
            industry_id=resolved_industry_id,
            department_id=resolved_department_id,
            recruiter_id=uuid.UUID(str(request.userid)) if request.userid else None,
            posted_at=datetime.now().isoformat(),
        )

        db.add(new_job)
        await db.commit()
        await db.refresh(new_job)

        message_service = MessageService()
        message_service.send_jobid_to_queue(str(request.userid), str(new_job.id))

        return JobCreateResponse(
            status="success", message="Job posted successfully", job_id=new_job.id
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating job: {str(e)}")
