"""
Job Matcher Service - Match users with jobs using embeddings, skills, and experience
"""

from ai.models.orm_models import JobApplication
import json
import math
import re
import difflib
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from collections import defaultdict
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text, or_, not_, desc, cast, String
from sqlalchemy.orm import selectinload

from ai.models.orm_models import (
    User,
    Resume,
    JobPosting,
    JobSkill,
    JobseekerSkill,
    JobseekerProfile,
    Skill,
    Company,
    JobStatusEnum,
    Industry,
    JobsViewed,
    WorkExperience,
    ExpLevelEnum,
)

from sqlalchemy.dialects import postgresql


class JobMatcherService:
    """Service for matching job seekers with job postings"""

    SYNONYM_GROUPS = [
        {"software engineer", "software developer", "backend developer", "frontend developer", "fullstack developer", "programmer", "coder", "application developer", "web developer", "systems engineer"},
        {"data scientist", "data analyst", "machine learning engineer", "ai engineer", "business intelligence analyst", "bi analyst", "data engineer", "analytics engineer"},
        {"devops engineer", "site reliability engineer", "sre", "system administrator", "sysadmin", "infrastructure engineer", "cloud engineer"},
        {"product manager", "project manager", "program manager", "scrum master", "product owner", "project coordinator"},
        {"quality assurance engineer", "qa engineer", "software test engineer", "tester", "automation engineer", "qa analyst"},
        {"sales executive", "business development associate", "sales manager", "account manager", "business development executive", "sales representative"},
        {"hr manager", "human resources specialist", "hr executive", "recruiter", "talent acquisition specialist"},
    ]

    @staticmethod
    def _normalize_title(title: str) -> str:
        """Normalize job title string for similarity matching"""
        if not title:
            return ""
        s = title.lower().strip()
        # Remove common noise words/phrases
        noise = [
            "senior", "junior", "lead", "principal", "associate", "trainee", "intern", "staff",
            "executive", "assistant", "head of", "director of", "manager of", "chief"
        ]
        for word in noise:
            s = re.sub(rf"\b{word}\b", "", s)
        # Remove special characters
        s = re.sub(r"[^a-z0-9 ]", "", s)
        # Remove extra spaces
        s = re.sub(r"\s+", " ", s).strip()
        return s

    @staticmethod
    def _compute_title_similarities(anchor_title: str, comparison_titles: List[str]) -> List[float]:
        if not anchor_title or not comparison_titles:
            return [0.0] * len(comparison_titles)

        # Normalize anchor
        anchor_normalized = JobMatcherService._normalize_title(anchor_title)
        anchor_tokens = set(anchor_normalized.split())

        similarities = []
        for title in comparison_titles:
            if not title:
                similarities.append(0.0)
                continue

            comp_normalized = JobMatcherService._normalize_title(title)
            if anchor_normalized == comp_normalized:
                similarities.append(1.0)
                continue

            # Check if they share any synonym group
            shared_group = False
            for group in JobMatcherService.SYNONYM_GROUPS:
                anchor_in_group = any(term in anchor_normalized or anchor_normalized in term for term in group)
                comp_in_group = any(term in comp_normalized or comp_normalized in term for term in group)
                if anchor_in_group and comp_in_group:
                    shared_group = True
                    break

            # Calculate token Jaccard similarity
            comp_tokens = set(comp_normalized.split())
            jaccard = 0.0
            if anchor_tokens or comp_tokens:
                intersection = anchor_tokens.intersection(comp_tokens)
                union = anchor_tokens.union(comp_tokens)
                jaccard = len(intersection) / len(union)

            # SequenceMatcher ratio
            fuzzy_ratio = difflib.SequenceMatcher(None, anchor_normalized, comp_normalized).ratio()

            # Combine similarity metrics
            if shared_group:
                # If they are synonyms, base similarity is high
                score = max(0.85, fuzzy_ratio, jaccard)
            else:
                # Weighted average of fuzzy ratio and token overlap
                score = 0.7 * fuzzy_ratio + 0.3 * jaccard

            similarities.append(max(0.0, min(1.0, score)))

        return similarities

    @staticmethod
    async def get_matching_jobs(
        user_id: str, session: AsyncSession, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Retrieve and rank jobs for a given user_id using embeddings, skills, and experience.

        Args:
            user_id: UUID of the user
            session: Async database session
            limit: Maximum number of jobs to return

        Returns:
            List of matched jobs with scores and details
        """

        # Step 1: Fetch User Data
        user_data = await JobMatcherService._fetch_user_data(user_id, session)
        if not user_data:
            return []

        # Step 2: Fetch top 200 jobs by embedding similarity (increased pool for filtering)
        candidate_jobs = await JobMatcherService._fetch_candidate_jobs(
            user_data, session, limit=200
        )

        # Step 3: Compute full scores for candidate jobs
        scored_jobs = await JobMatcherService._compute_job_scores(
            user_data, candidate_jobs, session
        )

        # Step 4: Filter jobs with no matched skills, sort by final score
        filtered_jobs = [j for j in scored_jobs if j.get("matched_skills")]
        filtered_jobs.sort(key=lambda x: x["final_score"], reverse=True)
        return filtered_jobs[:limit]

    @staticmethod
    async def get_matching_candidates(
        job_id: str, session: AsyncSession, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Retrieve and rank candidates for a given job_id using embeddings, skills, and experience.
        """
        # Step 1: Fetch Job Data
        job_data = await JobMatcherService._fetch_job_data(job_id, session)
        if not job_data:
            return []

        # Step 2: Fetch top candidates by embedding similarity
        candidates = await JobMatcherService._fetch_candidate_users(
            job_data, session, limit=100
        )

        # Step 3: Compute full scores for candidates
        scored_candidates = await JobMatcherService._compute_candidate_scores(
            job_data, candidates, session
        )

        # Step 4: Filter candidates with no matched skills, sort by final score
        filtered_candidates = [c for c in scored_candidates if c.get("matched_skills")]
        filtered_candidates.sort(key=lambda x: x["final_score"], reverse=True)
        return filtered_candidates[:limit]

    @staticmethod
    async def get_job_applicants(
        job_id: str, session: AsyncSession, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Retrieve and rank candidates who have applied for a given job_id.
        """
        # Step 1: Fetch Job Data
        job_data = await JobMatcherService._fetch_job_data(job_id, session)
        if not job_data:
            return []

        # Step 2: Fetch candidates from JobApplication table
        try:
            job_id_int = int(job_id)
            # Subqueries to aggregate skills and industries for each user to avoid N+1 queries
            user_skills_subquery = (
                select(
                    JobseekerSkill.user_id, func.array_agg(Skill.name).label("skills")
                )
                .join(Skill, JobseekerSkill.skill_id == Skill.id)
                .group_by(JobseekerSkill.user_id)
            ).subquery()

            user_industries_subquery = (
                select(
                    text("ui.user_id").label("user_id"),
                    func.array_agg(Industry.name).label("industries"),
                )
                .select_from(Industry)
                .join(text("user_industries ui"), Industry.id == text("ui.industry_id"))
                .group_by(text("ui.user_id"))
            ).subquery()

            # Subquery to rank work experiences per user
            latest_exp_subquery = (
                select(
                    WorkExperience.user_id,
                    WorkExperience.title,
                    func.row_number().over(
                        partition_by=WorkExperience.user_id,
                        order_by=[
                            desc(WorkExperience.is_current),
                            desc(WorkExperience.end_date),
                            desc(WorkExperience.start_date)
                        ]
                    ).label("rn")
                )
            ).subquery()

            user_latest_title_subquery = (
                select(latest_exp_subquery.c.user_id, latest_exp_subquery.c.title)
                .where(latest_exp_subquery.c.rn == 1)
            ).subquery()

            applicants_query = (
                select(
                    JobApplication,
                    Resume,
                    JobseekerProfile,
                    User,
                    user_skills_subquery.c.skills,
                    user_industries_subquery.c.industries,
                    user_latest_title_subquery.c.title.label("recent_job_title"),
                )
                .join(User, JobApplication.user_id == User.id)
                .join(Resume, JobApplication.user_id == Resume.user_id, isouter=True)
                .join(
                    JobseekerProfile,
                    JobApplication.user_id == JobseekerProfile.user_id,
                    isouter=True,
                )
                .join(
                    user_skills_subquery,
                    JobApplication.user_id == user_skills_subquery.c.user_id,
                    isouter=True,
                )
                .join(
                    user_industries_subquery,
                    JobApplication.user_id == user_industries_subquery.c.user_id,
                    isouter=True,
                )
                .join(
                    user_latest_title_subquery,
                    JobApplication.user_id == user_latest_title_subquery.c.user_id,
                    isouter=True,
                )
                .where(JobApplication.job_posting_id == job_id_int)
                .limit(limit)
            )

            result = await session.execute(applicants_query)
            rows = result.all()

            candidate_users = []
            for (
                application,
                resume,
                profile,
                user,
                user_skills,
                user_industries,
                recent_job_title,
            ) in rows:
                candidate_users.append(
                    {
                        "user_id": str(user.id),
                        "summary": resume.parsed_summary if resume else "",
                        "experience_years": (
                            float(profile.years_of_experience or 0) if profile else 0.0
                        ),
                        "profile_embedding": (
                            resume.profile_embedding if resume else None
                        ),
                        "skills": user_skills or [],
                        "industries": user_industries or [],
                        "full_name": user.full_name if user else "",
                        "phone": user.phone if user else "",
                        "headline": profile.headline if profile else "",
                        "current_location": profile.current_location if profile else "",
                        "recent_job_title": recent_job_title or "",
                    }
                )

            # Step 3: Compute scores
            scored_candidates = await JobMatcherService._compute_candidate_scores(
                job_data, candidate_users, session
            )

            # Map application metadata by user_id to re-attach after scoring
            app_meta = {
                str(user.id): {
                    "application_status": (
                        application.application_status.value
                        if application.application_status
                        else None
                    ),
                    "applied_date": (
                        application.applied_date.isoformat()
                        if application.applied_date
                        else None
                    ),
                }
                for application, resume, profile, user, skills, industries, recent_job_title in rows
            }

            for cand in scored_candidates:
                meta = app_meta.get(cand["user_id"], {})
                cand.update(meta)

            scored_candidates.sort(key=lambda x: x["final_score"], reverse=True)
            return scored_candidates

        except Exception as e:
            print(f"Error fetching job applicants: {str(e)}")
            return []

    @staticmethod
    async def _fetch_user_data(
        user_id: str, session: AsyncSession
    ) -> Optional[Dict[str, Any]]:
        """Fetch user resume data, profile, and skills with optimized queries"""
        try:
            user_uuid = UUID(user_id)

            # Optimized Query 1: Combine Resume and JobseekerProfile data using join
            # This reduces 2 separate queries into 1
            resume_profile_query = (
                select(Resume, JobseekerProfile)
                .join(
                    JobseekerProfile,
                    Resume.user_id == JobseekerProfile.user_id,
                    isouter=True,
                )
                .where(Resume.user_id == user_uuid)
            )

            resume_profile_result = await session.execute(resume_profile_query)
            row = resume_profile_result.first()

            if not row:
                return None

            resume, profile = row
            experience_years = (
                float(profile.years_of_experience or 0) if profile else 0.0
            )

            # Optimized Query 2: Join JobseekerSkill with Skill to get skill names
            # JobseekerSkill.skill_id -> Skill.id -> Skill.name
            skills_query = (
                select(Skill.name)
                .join(
                    JobseekerSkill,
                    Skill.id == JobseekerSkill.skill_id,
                )
                .where(JobseekerSkill.user_id == user_uuid)
            )
            skills_result = await session.execute(skills_query)
            user_skills = [row[0] for row in skills_result.all()]

            # Fetch User Industries
            user_industries = await JobMatcherService._fetch_user_industries(
                user_uuid, session
            )

            # Fetch user's most recent job title
            recent_job_title = ""
            try:
                experience_query = (
                    select(WorkExperience.title)
                    .where(WorkExperience.user_id == user_uuid)
                    .order_by(
                        desc(WorkExperience.is_current),
                        desc(WorkExperience.end_date),
                        desc(WorkExperience.start_date)
                    )
                    .limit(1)
                )
                exp_result = await session.execute(experience_query)
                exp_row = exp_result.first()
                if exp_row:
                    recent_job_title = exp_row[0] or ""
            except Exception as e:
                print(f"Error fetching recent job title for user {user_id}: {str(e)}")

            return {
                "user_id": user_id,
                "summary": resume.parsed_summary or "",
                "experience_years": experience_years,
                "embedding": profile.profile_embedding,
                "skills": user_skills,
                "industries": user_industries,
                "recent_job_title": recent_job_title,
            }

        except Exception as e:
            print(f"Error fetching user data for {user_id}: {str(e)}")
            return None

    @staticmethod
    async def _fetch_user_industries(user_id: UUID, session: AsyncSession) -> List[str]:
        """Fetch industry names for a user"""
        try:
            query = text(
                """
                SELECT i.name 
                FROM industries i
                JOIN user_industries ui ON i.id = ui.industry_id
                WHERE ui.user_id = :user_id
                """
            )
            result = await session.execute(query, {"user_id": str(user_id)})
            return [row[0] for row in result.all()]
        except Exception as e:
            print(f"Error fetching industries for user {user_id}: {str(e)}")
            return []

    @staticmethod
    async def _fetch_candidate_jobs(
        user_data: Dict[str, Any], session: AsyncSession, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Fetch candidate jobs with their skills, ranked by embedding similarity"""
        try:
            user_id = UUID(user_data["user_id"])

            # Industry filter: return empty if user has no industries
            user_industries = user_data.get("industries", [])
            if not user_industries:
                return []

            # Subquery to get jobs the user has already applied for
            applied_jobs_subquery = (
                select(JobApplication.job_posting_id).where(
                    JobApplication.user_id == user_id
                )
            ).scalar_subquery()

            # Fetch jobs the user has already viewed
            viewed_jobs_query = select(JobsViewed.job_id).where(
                JobsViewed.user_id == user_id
            )
            viewed_jobs_result = await session.execute(viewed_jobs_query)
            viewed_job_ids = {row[0] for row in viewed_jobs_result.all()}

            # Base filters: Active, Not Applied, Not Viewed, and Has Valid Application Path
            ten_days_ago = datetime.now(timezone.utc) - timedelta(days=15)
            base_filters = [
                # JobPosting.status == JobStatusEnum.active,
                Industry.name.in_(user_industries),
                not_(JobPosting.id.in_(applied_jobs_subquery)),
                or_(
                    JobPosting.recruiter_id.isnot(None),
                    Company.careers_url.isnot(None),
                    Company.hiring_email.isnot(None),
                ),
                JobPosting.created_at >= ten_days_ago,
            ]

            # Dynamic Filter Refinement based on experience and seniority
            candidate_exp = user_data.get("experience_years") or 0.0
            recent_title = user_data.get("recent_job_title", "").lower()

            # Seniority check based on title keywords and experience
            is_senior = any(term in recent_title for term in ["senior", "lead", "principal", "manager", "director", "vp", "head"]) or candidate_exp >= 8.0
            is_entry = any(term in recent_title for term in ["junior", "entry", "intern", "fresher", "trainee"]) or (candidate_exp < 2.0 and not is_senior)

            # Limit jobs based on experience requirements
            if candidate_exp > 0:
                base_filters.append(
                    or_(
                        JobPosting.experience_min_yrs.is_(None),
                        JobPosting.experience_min_yrs <= int(candidate_exp + 3)
                    )
                )

            # Restrict seniority mismatch
            if is_senior:
                # Senior candidates: avoid entry/junior roles
                base_filters.append(
                    or_(
                        JobPosting.experience_level.is_(None),
                        not_(cast(JobPosting.experience_level, String).in_(["entry", "junior"]))
                    )
                )
            elif is_entry:
                # Entry candidates: avoid lead/executive roles
                base_filters.append(
                    or_(
                        JobPosting.experience_level.is_(None),
                        not_(cast(JobPosting.experience_level, String).in_(["lead", "executive"]))
                    )
                )

            # Subquery to aggregate skills for each job to avoid N+1 queries
            skills_subquery = (
                select(
                    JobSkill.job_posting_id, func.array_agg(Skill.name).label("skills")
                )
                .join(Skill, JobSkill.skills_id == Skill.id)
                .group_by(JobSkill.job_posting_id)
            ).subquery()

            if not user_data.get("embedding"):
                # Fallback: get all filtered active jobs if no embedding
                jobs_query = (
                    select(JobPosting, Company, skills_subquery.c.skills)
                    .join(Company, JobPosting.company_id == Company.id)
                    .join(Industry, JobPosting.industry_id == Industry.id)
                    .join(
                        skills_subquery,
                        JobPosting.id == skills_subquery.c.job_posting_id,
                        isouter=True,
                    )
                    .where(*base_filters)
                    .limit(limit)
                )
            else:
                # Use pgvector cosine similarity to get top active jobs
                jobs_query = (
                    select(JobPosting, Company, skills_subquery.c.skills)
                    .join(Company, JobPosting.company_id == Company.id)
                    .join(Industry, JobPosting.industry_id == Industry.id)
                    .join(
                        skills_subquery,
                        JobPosting.id == skills_subquery.c.job_posting_id,
                        isouter=True,
                    )
                    .where(*base_filters)
                    .order_by(text("job_embedding <=> :user_embedding"))
                    .limit(limit)
                )
                jobs_query = jobs_query.params(user_embedding=user_data["embedding"])

            jobs_result = await session.execute(jobs_query)
            jobs_rows = jobs_result.all()

            candidate_jobs = []
            for job, company, job_skills in jobs_rows:
                # Ensure job_skills is a list (could be None if no skills associated)
                job_skills = job_skills or []

                candidate_jobs.append(
                    {
                        "id": job.id,
                        "is_viewed": job.id in viewed_job_ids,
                        "title": job.title,
                        "description": job.description or "",
                        "experience_min_yrs": job.experience_min_yrs or 0,
                        "experience_max_yrs": job.experience_max_yrs or 0,
                        "job_embedding": job.job_embedding,
                        "company_name": company.name,
                        "careers_url": company.careers_url,
                        "hiring_email": company.hiring_email,
                        "skills": job_skills,
                        "location": job.location,
                        "state": job.state,
                        "city": job.city,
                        "posted_date": (
                            job.posted_at.isoformat() if job.posted_at else None
                        ),
                        "department": job.department,
                        "work_mode": job.work_mode,
                        "job_type": job.job_type,
                        "experience_level": job.experience_level,
                        "summary": job.summary,
                        "recruiter_id": job.recruiter_id,
                    }
                )

            return candidate_jobs

        except Exception as e:
            print(f"Error fetching candidate jobs: {str(e)}")
            return []

    @staticmethod
    async def _compute_job_scores(
        user_data: Dict[str, Any], jobs: List[Dict[str, Any]], session: AsyncSession
    ) -> List[Dict[str, Any]]:
        """Compute detailed scores for each job"""
        scored_jobs = []

        # Batch-compute title similarities
        user_title = user_data.get("recent_job_title", "")
        job_titles = [job.get("title", "") for job in jobs]
        title_scores = JobMatcherService._compute_title_similarities(user_title, job_titles)

        for idx, job in enumerate(jobs):
            try:
                title_score = title_scores[idx]

                # Embedding Score (cosine similarity)
                embedding_score = 0.0
                if user_data.get("embedding") and job.get("job_embedding"):
                    # Using pgvector cosine similarity: 1 - (a <=> b)
                    # Cast string embeddings to vectors for comparison
                    similarity_query = text(
                        "SELECT 1.0 - ((:job_emb)::vector <=> (:user_emb)::vector)"
                    )

                    result = await session.execute(
                        similarity_query,
                        {
                            "job_emb": job["job_embedding"],
                            "user_emb": user_data["embedding"],
                        },
                    )

                    embedding_score = max(0.0, min(1.0, result.scalar() or 0.0))
                else:
                    embedding_score = 0.5  # Default neutral score

                # Skills Score
                skill_score, matched_skills, missing_skills = (
                    JobMatcherService._compute_skill_score(
                        user_data["skills"], job["skills"], job.get("description", "")
                    )
                )

                # Experience Score
                experience_score = JobMatcherService._compute_experience_score(
                    user_data["experience_years"],
                    job["experience_min_yrs"],
                    job.get("experience_max_yrs"),
                )

                # Define Dynamic Weights
                # Default: Skills: 0.5, Embedding: 0.3, Experience: 0.2
                has_embedding = bool(
                    user_data.get("embedding") and job.get("job_embedding")
                )
                has_recent_title = bool(user_title)

                if has_recent_title:
                    # Default weights when title is present: Skills 0.4, Title 0.25, Embedding 0.2, Experience 0.15
                    if title_score >= 0.7:
                        # High alignment: prioritize title match
                        w_skill, w_title, w_emb, w_exp = 0.35, 0.35, 0.15, 0.15
                    else:
                        w_skill, w_title, w_emb, w_exp = 0.4, 0.25, 0.2, 0.15

                    if skill_score >= 1.0 and not missing_skills:
                        # 100% Skills Match: shift embedding weight to skill/title
                        w_skill, w_title, w_emb, w_exp = 0.5, 0.3, 0.0, 0.2
                    elif not has_embedding:
                        w_skill, w_title, w_emb, w_exp = 0.5, 0.3, 0.05, 0.15
                        embedding_score = 0.2
                    elif user_data.get("experience_years", 0) <= 0:
                        w_skill, w_title, w_emb, w_exp = 0.6, 0.0, 0.3, 0.1
                        title_score = 0.0
                else:
                    w_title = 0.0
                    w_skill, w_emb, w_exp = 0.5, 0.3, 0.2
                    if skill_score >= 1.0 and not missing_skills:
                        w_skill, w_emb, w_exp = 0.7, 0.0, 0.3
                    elif not has_embedding:
                        w_skill, w_emb, w_exp = 0.6, 0.1, 0.3
                        embedding_score = 0.2
                    elif user_data.get("experience_years", 0) <= 0:
                        w_skill, w_emb, w_exp = 0.6, 0.3, 0.1

                # Final Score
                final_score = (
                    w_skill * skill_score
                    + w_title * title_score
                    + w_emb * embedding_score
                    + w_exp * experience_score
                )

                # Generate reason
                reason = JobMatcherService._generate_match_reason(
                    embedding_score, skill_score, experience_score, matched_skills, title_score
                )

                scored_jobs.append(
                    {
                        "job_id": str(job["id"]),
                        "is_viewed": job.get("is_viewed", False),
                        "title": job["title"],
                        "final_score": round(final_score, 3),
                        "scores": {
                            "embedding": round(embedding_score, 3),
                            "skills": round(skill_score, 3),
                            "experience": round(experience_score, 3),
                            "title_similarity": round(title_score, 3),
                        },
                        "matched_skills": matched_skills,
                        "missing_skills": missing_skills,
                        "reason": reason,
                        "description": job["description"],
                        "experience_min_yrs": job["experience_min_yrs"],
                        "experience_max_yrs": job["experience_max_yrs"],
                        # "job_embedding": job["job_embedding"],
                        "company_name": job["company_name"],
                        "skills": job["skills"],
                        "location": job["location"],
                        "state": job["state"],
                        "city": job["city"],
                        "posted_date": job["posted_date"],
                        "department": job["department"],
                        "work_mode": job["work_mode"],
                        "job_type": job["job_type"],
                        "experience_level": job["experience_level"],
                        "summary": job["summary"],
                        "careers_url": job["careers_url"],
                        "hiring_email": job["hiring_email"],
                        "recruiter_id": job["recruiter_id"],
                    }
                )

            except Exception as e:
                print(f"Error computing score for job {job['id']}: {str(e)}")
                continue

        return scored_jobs

    @staticmethod
    async def _fetch_job_data(
        job_id: str, session: AsyncSession
    ) -> Optional[Dict[str, Any]]:
        """Fetch job posting data and skills"""
        try:
            job_id_int = int(job_id)

            # Fetch job posting
            job_query = select(JobPosting).where(JobPosting.id == job_id_int)
            job_result = await session.execute(job_query)
            job = job_result.scalar_one_or_none()

            if not job:
                return None

            # Fetch job skills
            skills_query = (
                select(Skill.name)
                .join(
                    JobSkill,
                    Skill.id == JobSkill.skills_id,
                )
                .where(JobSkill.job_posting_id == job_id_int)
            )
            skills_result = await session.execute(skills_query)
            job_skills = [row[0] for row in skills_result.all()]

            return {
                "job_id": job_id,
                "title": job.title,
                "description": job.description or "",
                "experience_min_yrs": job.experience_min_yrs or 0,
                "experience_max_yrs": job.experience_max_yrs or 0,
                "embedding": job.job_embedding,
                "skills": job_skills,
            }

        except Exception as e:
            print(f"Error fetching job data for {job_id}: {str(e)}")
            return None

    @staticmethod
    async def _fetch_candidate_users(
        job_data: Dict[str, Any], session: AsyncSession, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Fetch candidate users with their skills, ranked by embedding similarity"""
        try:
            # Subqueries to aggregate skills and industries for each user to avoid N+1 queries
            user_skills_subquery = (
                select(
                    JobseekerSkill.user_id, func.array_agg(Skill.name).label("skills")
                )
                .join(Skill, JobseekerSkill.skill_id == Skill.id)
                .group_by(JobseekerSkill.user_id)
            ).subquery()

            user_industries_subquery = (
                select(
                    text("ui.user_id").label("user_id"),
                    func.array_agg(Industry.name).label("industries"),
                )
                .select_from(Industry)
                .join(text("user_industries ui"), Industry.id == text("ui.industry_id"))
                .group_by(text("ui.user_id"))
            ).subquery()

            # Subquery to rank work experiences per user
            latest_exp_subquery = (
                select(
                    WorkExperience.user_id,
                    WorkExperience.title,
                    func.row_number().over(
                        partition_by=WorkExperience.user_id,
                        order_by=[
                            desc(WorkExperience.is_current),
                            desc(WorkExperience.end_date),
                            desc(WorkExperience.start_date)
                        ]
                    ).label("rn")
                )
            ).subquery()

            # Subquery to select only the top (rn = 1) work experience for each user
            user_latest_title_subquery = (
                select(latest_exp_subquery.c.user_id, latest_exp_subquery.c.title)
                .where(latest_exp_subquery.c.rn == 1)
            ).subquery()

            candidate_filters = []
            job_min_exp = job_data.get("experience_min_yrs") or 0
            job_exp_level = job_data.get("experience_level")

            # 1. Experience filter: candidate experience should be within reasonable range of job min experience
            if job_min_exp > 0:
                min_threshold = max(0.0, float(job_min_exp) - 3.0)
                candidate_filters.append(
                    or_(
                        JobseekerProfile.years_of_experience.is_(None),
                        JobseekerProfile.years_of_experience >= min_threshold
                    )
                )

            # 2. Seniority check:
            if job_exp_level in [ExpLevelEnum.senior, ExpLevelEnum.lead, ExpLevelEnum.executive]:
                candidate_filters.append(
                    or_(
                        JobseekerProfile.years_of_experience.is_(None),
                        JobseekerProfile.years_of_experience >= 2.0
                    )
                )
            elif job_exp_level == ExpLevelEnum.entry:
                candidate_filters.append(
                    or_(
                        JobseekerProfile.years_of_experience.is_(None),
                        JobseekerProfile.years_of_experience <= 8.0
                    )
                )

            if not job_data.get("embedding"):
                # Fallback: get all users with resumes
                users_query = (
                    select(
                        Resume,
                        JobseekerProfile,
                        User,
                        user_skills_subquery.c.skills,
                        user_industries_subquery.c.industries,
                        user_latest_title_subquery.c.title.label("recent_job_title"),
                    )
                    .join(
                        JobseekerProfile,
                        Resume.user_id == JobseekerProfile.user_id,
                        isouter=True,
                    )
                    .join(
                        User,
                        Resume.user_id == User.id,
                        isouter=True,
                    )
                    .join(
                        user_skills_subquery,
                        Resume.user_id == user_skills_subquery.c.user_id,
                        isouter=True,
                    )
                    .join(
                        user_industries_subquery,
                        Resume.user_id == user_industries_subquery.c.user_id,
                        isouter=True,
                    )
                    .join(
                        user_latest_title_subquery,
                        Resume.user_id == user_latest_title_subquery.c.user_id,
                        isouter=True,
                    )
                    .where(*candidate_filters)
                    .limit(limit)
                )
            else:
                users_query = (
                    select(
                        Resume,
                        JobseekerProfile,
                        User,
                        user_skills_subquery.c.skills,
                        user_industries_subquery.c.industries,
                        user_latest_title_subquery.c.title.label("recent_job_title"),
                    )
                    .join(
                        JobseekerProfile,
                        Resume.user_id == JobseekerProfile.user_id,
                        isouter=True,
                    )
                    .join(
                        User,
                        Resume.user_id == User.id,
                        isouter=True,
                    )
                    .join(
                        user_skills_subquery,
                        Resume.user_id == user_skills_subquery.c.user_id,
                        isouter=True,
                    )
                    .join(
                        user_industries_subquery,
                        Resume.user_id == user_industries_subquery.c.user_id,
                        isouter=True,
                    )
                    .join(
                        user_latest_title_subquery,
                        Resume.user_id == user_latest_title_subquery.c.user_id,
                        isouter=True,
                    )
                    .where(*candidate_filters)
                    .order_by(text("profile_embedding <=> :job_embedding"))
                    .limit(limit)
                )
                users_query = users_query.params(job_embedding=job_data["embedding"])

            users_result = await session.execute(users_query)
            users_rows = users_result.all()

            candidate_users = []
            for resume, profile, user, user_skills, user_industries, recent_job_title in users_rows:
                candidate_users.append(
                    {
                        "user_id": str(resume.user_id),
                        "summary": resume.parsed_summary or "",
                        "experience_years": (
                            float(profile.years_of_experience or 0) if profile else 0.0
                        ),
                        "profile_embedding": resume.profile_embedding,
                        "skills": user_skills or [],
                        "industries": user_industries or [],
                        "full_name": user.full_name if user else "",
                        "phone": user.phone if user else "",
                        "headline": profile.headline if profile else "",
                        "current_location": profile.current_location if profile else "",
                        "recent_job_title": recent_job_title or "",
                    }
                )

            return candidate_users

        except Exception as e:
            print(f"Error fetching candidate users: {str(e)}")
            return []

    @staticmethod
    async def _compute_candidate_scores(
        job_data: Dict[str, Any],
        candidates: List[Dict[str, Any]],
        session: AsyncSession,
    ) -> List[Dict[str, Any]]:
        """Compute detailed scores for each candidate"""
        scored_candidates = []

        # Batch-compute title similarities
        job_title = job_data.get("title", "")
        candidate_titles = [candidate.get("recent_job_title", "") for candidate in candidates]
        title_scores = JobMatcherService._compute_title_similarities(job_title, candidate_titles)

        for idx, candidate in enumerate(candidates):
            try:
                title_score = title_scores[idx]

                # Embedding Score (cosine similarity)
                embedding_score = 0.0
                if job_data.get("embedding") and candidate.get("profile_embedding"):
                    # Using pgvector cosine similarity
                    similarity_query = text(
                        "SELECT 1.0 - ((:resume_emb)::vector <=> (:job_emb)::vector)"
                    )
                    result = await session.execute(
                        similarity_query,
                        {
                            "resume_emb": candidate["profile_embedding"],
                            "job_emb": job_data["embedding"],
                        },
                    )
                    embedding_score = max(0.0, min(1.0, result.scalar() or 0.0))
                else:
                    embedding_score = 0.5  # Default neutral score

                # Skills Score
                skill_score, matched_skills, missing_skills = (
                    JobMatcherService._compute_skill_score(
                        candidate["skills"],
                        job_data["skills"],
                        job_data.get("description", ""),
                    )
                )

                experience_score = JobMatcherService._compute_experience_score(
                    candidate["experience_years"],
                    job_data["experience_min_yrs"],
                    job_data.get("experience_max_yrs"),
                )

                # Define Dynamic Weights
                # Default: Skills: 0.5, Embedding: 0.3, Experience: 0.2
                has_embedding = bool(
                    job_data.get("embedding") and candidate.get("profile_embedding")
                )
                has_recent_title = bool(candidate.get("recent_job_title"))

                if has_recent_title:
                    # Default weights when title is present: Skills 0.4, Title 0.25, Embedding 0.2, Experience 0.15
                    if title_score >= 0.7:
                        # High alignment: prioritize title match
                        w_skill, w_title, w_emb, w_exp = 0.35, 0.35, 0.15, 0.15
                    else:
                        w_skill, w_title, w_emb, w_exp = 0.4, 0.25, 0.2, 0.15

                    if skill_score >= 1.0 and not missing_skills:
                        # 100% Skills Match: shift embedding weight to skill/title
                        w_skill, w_title, w_emb, w_exp = 0.5, 0.3, 0.0, 0.2
                    elif not has_embedding:
                        w_skill, w_title, w_emb, w_exp = 0.5, 0.3, 0.05, 0.15
                        embedding_score = 0.2
                    elif candidate.get("experience_years", 0) <= 0:
                        w_skill, w_title, w_emb, w_exp = 0.6, 0.0, 0.3, 0.1
                        title_score = 0.0
                else:
                    w_title = 0.0
                    w_skill, w_emb, w_exp = 0.5, 0.3, 0.2
                    if skill_score >= 1.0 and not missing_skills:
                        w_skill, w_emb, w_exp = 0.7, 0.0, 0.3
                    elif not has_embedding:
                        w_skill, w_emb, w_exp = 0.6, 0.1, 0.3
                        embedding_score = 0.2
                    elif candidate.get("experience_years", 0) <= 0:
                        w_skill, w_emb, w_exp = 0.6, 0.3, 0.1

                # Final Score
                final_score = (
                    w_skill * skill_score
                    + w_title * title_score
                    + w_emb * embedding_score
                    + w_exp * experience_score
                )

                # Generate reason
                reason = JobMatcherService._generate_match_reason(
                    embedding_score, skill_score, experience_score, matched_skills, title_score
                )

                scored_candidates.append(
                    {
                        "user_id": candidate["user_id"],
                        "full_name": candidate["full_name"],
                        "phone": candidate["phone"],
                        "headline": candidate["headline"],
                        "current_location": candidate["current_location"],
                        "recent_job_title": candidate.get("recent_job_title", ""),
                        "final_score": round(final_score, 3),
                        "scores": {
                            "embedding": round(embedding_score, 3),
                            "skills": round(skill_score, 3),
                            "experience": round(experience_score, 3),
                            "title_similarity": round(title_score, 3),
                        },
                        "matched_skills": matched_skills,
                        "missing_skills": missing_skills,
                        "reason": reason,
                        "experience_years": candidate["experience_years"],
                        "skills": candidate["skills"],
                        "industries": candidate.get("industries", []),
                        "job_skills": job_data["skills"],
                        "summary": candidate["summary"],
                    }
                )

            except Exception as e:
                print(
                    f"Error computing score for candidate {candidate['user_id']}: {str(e)}"
                )
                continue

        return scored_candidates

    @staticmethod
    def _compute_skill_score(
        user_skills: List[str], job_skills: List[str], job_description: str = ""
    ) -> tuple[float, List[str], List[str]]:
        """Compute skill matching score"""
        if not job_skills:
            if not job_description:
                return (
                    1.0,
                    [],
                    [],
                )  # Perfect score if no skills required and no description

            # Fallback: Check if user skills are mentioned in the job description
            matched_skills = []
            desc_normalized = JobMatcherService._normalize_skill(job_description)
            for skill in user_skills:
                norm_skill = JobMatcherService._normalize_skill(skill)
                if norm_skill and norm_skill in desc_normalized:
                    matched_skills.append(skill)

            # Score based on number of matched skills (e.g., 0.5 base + 0.1 per matched skill, up to 1.0)
            if matched_skills:
                skill_score = min(1.0, 0.5 + (len(matched_skills) * 0.1))
            else:
                skill_score = 0.5  # Neutral score if no skills matched

            return skill_score, matched_skills, []

        matched_skills = []
        missing_skills = []

        for job_skill in job_skills:
            found_match = False
            for user_skill in user_skills:
                if JobMatcherService._skills_similar(job_skill, user_skill):
                    matched_skills.append(job_skill)
                    found_match = True
                    break

            if not found_match:
                missing_skills.append(job_skill)

        skill_score = len(matched_skills) / len(job_skills) if job_skills else 1.0
        return skill_score, matched_skills, missing_skills

    @staticmethod
    def _normalize_skill(skill: str) -> str:
        """Normalize skill string for better matching"""
        if not skill:
            return ""
        # Lowercase
        s = skill.lower().strip()
        # Remove common noise words/phrases
        noise_words = [
            "language",
            "skills",
            "tools",
            "experience",
            "proficient",
            "knowledge",
            "basic",
            "advanced",
            "certified",
        ]
        for word in noise_words:
            s = re.sub(rf"\b{word}\b", "", s)

        # Handle common abbreviations
        abbreviations = {
            "ms": "microsoft",
            "sql server": "sqlserver",  # normalize space in common skills
            "power center": "powercenter",
            "dot net": "dotnet",
            ".net": "dotnet",
        }
        for abbr, full in abbreviations.items():
            s = s.replace(abbr, full)

        # Remove special characters except common ones like '+' (C++), '#' (C#)
        s = re.sub(r"[^a-z0-9+# ]", "", s)
        # Remove extra spaces
        s = re.sub(r"\s+", " ", s).strip()
        return s

    @staticmethod
    def _skills_similar(skill1: str, skill2: str) -> bool:
        """Check if two skills are similar using token overlap and fuzzy matching"""
        s1 = JobMatcherService._normalize_skill(skill1)
        s2 = JobMatcherService._normalize_skill(skill2)

        if not s1 or not s2:
            return False

        # Exact match after normalization
        if s1 == s2:
            return True

        # Token-based overlap
        s1_tokens = set(s1.split())
        s2_tokens = set(s2.split())

        if not s1_tokens or not s2_tokens:
            return False

        common_tokens = s1_tokens.intersection(s2_tokens)

        # 1. One is a subset of the other (significant tokens)
        # e.g., "oracle" and "oracle sql"
        # Use regex to check for word boundaries to avoid java matching javascript
        if re.search(rf"\b{re.escape(s1)}\b", s2) or re.search(
            rf"\b{re.escape(s2)}\b", s1
        ):
            return True

        # 2. Jaccard similarity threshold (0.4 instead of 0.5 for better recall)
        union_tokens = s1_tokens.union(s2_tokens)
        jaccard = len(common_tokens) / len(union_tokens)
        if jaccard >= 0.4:
            return True

        # 3. Fuzzy similarity for single tokens or consolidated names
        # e.g., "powercenter" vs "power center" handled by normalization,
        # but typos like "informatica" vs "informtica"
        fuzzy_ratio = difflib.SequenceMatcher(None, s1, s2).ratio()
        if fuzzy_ratio >= 0.85:
            return True

        return False

    @staticmethod
    def _compute_experience_score(
        user_experience: float,
        min_experience: int,
        max_experience: Optional[int] = None,
    ) -> float:
        """Compute experience matching score"""
        if min_experience <= 0 and (not max_experience or max_experience <= 0):
            return 1.0  # No experience requirement

        # Within range
        if user_experience >= min_experience and (
            not max_experience or user_experience <= max_experience
        ):
            return 1.0

        # Underqualified
        if user_experience < min_experience:
            if min_experience <= 0:
                return 1.0
            # Score based on ratio
            ratio = user_experience / min_experience
            return max(0.0, min(1.0, ratio))

        # Overqualified
        if max_experience and user_experience > max_experience:
            # Slight penalty for overqualified candidates
            diff = user_experience - max_experience
            # -0.05 per year over max, floor at 0.7
            score = 1.0 - (diff * 0.05)
            return max(0.7, score)

        return 1.0

    @staticmethod
    def _generate_match_reason(
        embedding_score: float,
        skill_score: float,
        experience_score: float,
        matched_skills: List[str],
        title_score: float = 0.0,
    ) -> str:
        """Generate a short explanation for the match"""
        reasons = []

        if title_score > 0.8:
            reasons.append("Excellent role alignment")
        elif title_score > 0.6:
            reasons.append("Strong role alignment")
        elif title_score > 0.4:
            reasons.append("Moderate role alignment")

        if embedding_score > 0.7:
            reasons.append("Strong content match")
        elif embedding_score > 0.4:
            reasons.append("Moderate content match")
        else:
            reasons.append("Limited content match")

        if skill_score > 0.8:
            reasons.append(f"Excellent skill match ({len(matched_skills)} skills)")
        elif skill_score > 0.5:
            reasons.append(f"Good skill match ({len(matched_skills)} skills)")
        elif skill_score > 0.2:
            reasons.append(f"Partial skill match ({len(matched_skills)} skills)")
        else:
            reasons.append("Limited skill match")

        if experience_score >= 1.0:
            reasons.append("Experience meets requirements")
        elif experience_score >= 0.8:
            reasons.append("Strong experience match")
        elif experience_score >= 0.7:
            reasons.append("Good experience match")
        elif experience_score > 0.0:
            reasons.append("Partial experience match")
        else:
            reasons.append("Experience below requirements")

        return " • ".join(reasons)


# Convenience function for external use
async def get_matching_jobs(
    user_id: str, session: AsyncSession, limit: int = 10
) -> List[Dict[str, Any]]:
    """Get matching jobs for a user"""
    return await JobMatcherService.get_matching_jobs(user_id, session, limit)


# Convenience function for external use
async def get_matching_candidates(
    job_id: str, session: AsyncSession, limit: int = 10
) -> List[Dict[str, Any]]:
    """Get matching candidates for a job"""
    return await JobMatcherService.get_matching_candidates(job_id, session, limit)
