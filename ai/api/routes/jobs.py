from datetime import datetime, date
from ai.services.message_service import MessageService
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from sqlalchemy.orm import joinedload
from sqlalchemy.exc import IntegrityError
from typing import List, Dict, Any
import uuid

from ai.services.job_matcher_service import JobMatcherService
from ai.db.database import get_db
from ai.utils.auth import get_current_user
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
    ExpLevelEnum,
    Skill,
    JobSkill,
    User,
    JobApplication,
    GovtJob,
    JobsViewed,
)
from ai.models.job_models import (
    JobMetadataResponse,
    JobCreateRequest,
    JobCreateResponse,
    JobApplicationRequest,
    JobViewRequest,
)
from ai.services.profile_service import ProfileService
from ai.services.ai_refiner_service import AzureOpenAIResumeRefiner

router = APIRouter()


@router.get("/govt-jobs")
async def list_govt_jobs(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Public endpoint to fetch government jobs.
    Returns only active and non-expired jobs.
    """
    today = date.today()

    stmt = (
        select(GovtJob)
        .where(GovtJob.status == JobStatusEnum.active)
        .where(GovtJob.expired_date >= today)
        .order_by(GovtJob.posted_date.desc())
        .limit(limit)
        .offset(offset)
    )

    result = await db.execute(stmt)
    jobs = result.scalars().all()

    # Count for pagination
    count_stmt = (
        select(func.count())
        .select_from(GovtJob)
        .where(GovtJob.status == JobStatusEnum.active)
        .where(GovtJob.expired_date >= today)
    )
    count_result = await db.execute(count_stmt)
    total_count = count_result.scalar()

    return {
        "status": "success",
        "data": jobs,
        "total": total_count,
        "limit": limit,
        "offset": offset,
    }


@router.get("/govt-jobs/{job_id}")
async def get_govt_job_details(job_id: int, db: AsyncSession = Depends(get_db)):
    """
    Protected endpoint to fetch complete details of a specific government job.
    Requires authentication.
    """
    stmt = select(GovtJob).where(GovtJob.id == job_id)
    result = await db.execute(stmt)
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Government job not found")

    return {"status": "success", "data": job}


@router.get("/fetch-jobs")
async def fetch_jobs(
    user_id: str = None,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    if not user_id:
        user_id = current_user_id
    jobs = await JobMatcherService.get_matching_jobs(user_id, db)

    return {"status": "completed", "jobs": jobs}


@router.get("/fetch-job-matching-candidates")
async def fetch_job_matching_candidates(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    candidates = await JobMatcherService.get_matching_candidates(job_id, db)

    return {"status": "completed", "candidates": candidates}


@router.get("/fetch-job-applicants")
async def fetch_job_applicants(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    try:
        candidates = await JobMatcherService.get_job_applicants(job_id, db)

        return {"status": "completed", "candidates": candidates}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching job applicants: {str(e)}"
        )


@router.get("/fetch-recruiter-posted-jobs")
async def fetch_recruiter_posted_jobs(
    user_id: str = None,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    if not user_id:
        user_id = current_user_id
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
async def create_job(
    request: JobCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """Create a new job posting"""
    # Use authenticated user if request.userid is missing
    if not request.userid:
        request.userid = current_user_id
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
            posted_at=datetime.now(),
        )

        db.add(new_job)
        await db.commit()
        await db.refresh(new_job)

        # 6. Insert skills
        if request.skills:
            unique_skills = set()
            for skill_name in request.skills:
                skill_name_lower = skill_name.strip().lower()
                if not skill_name_lower or skill_name_lower in unique_skills:
                    continue
                unique_skills.add(skill_name_lower)

                # Check if skill exists
                skill_result = await db.execute(
                    select(Skill)
                    .where(func.lower(Skill.name) == skill_name_lower)
                    .limit(1)
                )
                skill_obj = skill_result.scalar_one_or_none()

                if not skill_obj:
                    # Create new skill if it doesn't exist
                    skill_obj = Skill(name=skill_name.strip())
                    db.add(skill_obj)
                    await db.flush()

                # Link skill to job
                job_skill = JobSkill(job_posting_id=new_job.id, skills_id=skill_obj.id)
                db.add(job_skill)

            await db.commit()

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


@router.post("/apply-job")
async def apply_job(
    request: JobApplicationRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """
    Handle job applications by inserting a record into job_applications.
    """
    # Ensure user_id in request matches authenticated user or set it if missing
    if not request.user_id:
        request.user_id = current_user_id
    try:
        # 1. Check if job exists
        job_result = await db.execute(
            select(JobPosting).where(JobPosting.id == request.job_id)
        )
        job = job_result.scalar_one_or_none()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # 2. Check if user exists
        user_result = await db.execute(select(User).where(User.id == request.user_id))
        user = user_result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # 3. Create application
        new_application = JobApplication(
            job_posting_id=request.job_id, user_id=request.user_id
        )
        db.add(new_application)

        # 4. Increment apply_count in JobPosting
        job.apply_count += 1

        await db.commit()

        return {
            "status": "success",
            "message": "Job application submitted successfully",
        }

    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Duplicate application: User has already applied for this job",
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Database insertion failure: {str(e)}"
        )


@router.post("/record-view")
async def record_view(
    request: JobViewRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """
    Record that a user has viewed a job.
    """
    if not request.user_id:
        request.user_id = current_user_id

    try:
        # 1. Check if job exists
        # job_result = await db.execute(
        #     select(JobPosting).where(JobPosting.id == request.job_id)
        # )
        # job = job_result.scalar_one_or_none()
        # if not job:
        #     raise HTTPException(status_code=404, detail="Job not found")

        # 2. Check if user exists
        # user_result = await db.execute(select(User).where(User.id == request.user_id))
        # user = user_result.scalar_one_or_none()
        # if not user:
        #     raise HTTPException(status_code=404, detail="User not found")

        # 3. Create view record
        new_view = JobsViewed(job_id=request.job_id, user_id=request.user_id)
        db.add(new_view)

        # # 4. Increment view_count in JobPosting
        # job.view_count += 1

        await db.commit()

        return {
            "status": "success",
            "message": "Job view recorded successfully",
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error recording job view: {str(e)}"
        )


@router.get("/tailoring-job-email")
async def tailoring_job_email(
    job_id: str,
    user_id: str = None,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    if not user_id:
        user_id = current_user_id
    try:
        # 1. Retrieve job details
        job_result = await db.execute(
            select(JobPosting)
            .options(
                joinedload(JobPosting.company),
                joinedload(JobPosting.industry),
                joinedload(JobPosting.dept),
            )
            .where(JobPosting.id == int(job_id))
        )
        job = job_result.scalar_one_or_none()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        job_data = {
            "title": job.title,
            "description": job.description,
            "summary": job.summary,
            "company": job.company.name if job.company else None,
            "location": job.location,
            "industry": job.industry.name if job.industry else None,
            "department": job.dept.name if job.dept else None,
        }

        # 2. Fetch user profile
        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid user_id format")

        profile_data = await ProfileService.fetch_user_profile(
            user_id=user_uuid, session=db
        )

        # 3. Generate email content using Azure OpenAI
        refiner = AzureOpenAIResumeRefiner()
        email_content = await refiner.generate_application_email(
            user_profile=profile_data, job_details=job_data
        )

        return {
            "status": "success",
            "subject": email_content.get("subject"),
            "body": email_content.get("body"),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating application email: {str(e)}"
        )


@router.get("/{job_id}")
async def get_job_by_id(job_id: int, db: AsyncSession = Depends(get_db)):
    """
    Fetch complete job details for a specific job ID.
    This endpoint is public and does not require authentication.
    """
    try:
        stmt = (
            select(JobPosting)
            .options(
                joinedload(JobPosting.company),
                joinedload(JobPosting.industry),
                joinedload(JobPosting.dept),
            )
            .where(JobPosting.id == job_id)
        )

        result = await db.execute(stmt)
        job = result.scalar_one_or_none()

        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Fetch skills
        skills_query = (
            select(Skill.name)
            .join(JobSkill, Skill.id == JobSkill.skills_id)
            .where(JobSkill.job_posting_id == job_id)
        )
        skills_result = await db.execute(skills_query)
        skills = [row[0] for row in skills_result.all()]

        job_data = {
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
            "posted_at": job.posted_at.isoformat() if job.posted_at else None,
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
            "skills": skills,
            "recruiter_id": str(job.recruiter_id) if job.recruiter_id else None,
            "careers_url": job.company.careers_url if job.company else None,
            "hiring_email": job.company.hiring_email if job.company else None,
        }

        return {"status": "success", "data": job_data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching job details: {str(e)}"
        )


@router.post("/deactivate-job")
async def deactivate_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """
    Deactivate a job posting by setting its status to 'closed'.
    """
    try:
        # Check if job exists
        job_result = await db.execute(select(JobPosting).where(JobPosting.id == job_id))
        job = job_result.scalar_one_or_none()

        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        # Verify if the current user is the recruiter who posted the job
        if str(job.recruiter_id) != current_user_id:
            print(
                f"DEBUG: Auth failure for deactivate. job.recruiter_id={job.recruiter_id}, current_user_id={current_user_id}"
            )
            raise HTTPException(
                status_code=403, detail="You are not authorized to deactivate this job"
            )

        job.status = JobStatusEnum.closed
        await db.commit()

        return {"status": "success", "message": "Job deactivated successfully"}
    except HTTPException as e:
        print(f"DEBUG: Deactivate job failed for job_id={job_id}: {e.detail}")
        raise
    except Exception as e:
        print(f"DEBUG: Deactivate job unexpected error: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deactivating job: {str(e)}")
