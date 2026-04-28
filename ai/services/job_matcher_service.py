"""
Job Matcher Service - Match users with jobs using embeddings, skills, and experience
"""

import json
import math
from typing import List, Dict, Any, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
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
)


class JobMatcherService:
    """Service for matching job seekers with job postings"""

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

        # Step 2: Fetch top 100 jobs by embedding similarity
        candidate_jobs = await JobMatcherService._fetch_candidate_jobs(
            user_data, session, limit=100
        )

        # Step 3: Compute full scores for candidate jobs
        scored_jobs = await JobMatcherService._compute_job_scores(
            user_data, candidate_jobs, session
        )

        # Step 4: Sort by final score and return top results
        scored_jobs.sort(key=lambda x: x["final_score"], reverse=True)
        return scored_jobs[:limit]

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
        filtered_candidates = [
            c for c in scored_candidates if c.get("matched_skills")
        ]
        filtered_candidates.sort(key=lambda x: x["final_score"], reverse=True)
        return filtered_candidates[:limit]

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

            return {
                "user_id": user_id,
                "summary": resume.parsed_summary or "",
                "experience_years": experience_years,
                "embedding": resume.resume_embedding,
                "skills": user_skills,
            }

        except Exception as e:
            print(f"Error fetching user data for {user_id}: {str(e)}")
            return None

    @staticmethod
    async def _fetch_candidate_jobs(
        user_data: Dict[str, Any], session: AsyncSession, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Fetch candidate jobs with their skills, ranked by embedding similarity"""
        try:
            if not user_data.get("embedding"):
                # Fallback: get all jobs if no embedding
                jobs_query = select(JobPosting, Company).join(
                    Company, JobPosting.company_id == Company.id
                ).limit(limit)
            else:
                # Use pgvector cosine similarity to get top jobs
                jobs_query = (
                    select(JobPosting, Company)
                    .join(Company, JobPosting.company_id == Company.id)
                    .order_by(text("job_embedding <=> :user_embedding"))
                    .limit(limit)
                )
                jobs_query = jobs_query.params(
                    user_embedding=user_data["embedding"])

            jobs_result = await session.execute(jobs_query)
            jobs_rows = jobs_result.all()

            candidate_jobs = []
            for job, company in jobs_rows:
                # Get job skills by joining JobSkill with Skill table
                skills_query = (
                    select(Skill.name)
                    .join(
                        JobSkill,
                        Skill.id == JobSkill.skills_id,
                    )
                    .where(JobSkill.job_posting_id == job.id)
                )
                skills_result = await session.execute(skills_query)
                job_skills = [row[0] for row in skills_result.all()]

                candidate_jobs.append(
                    {
                        "id": job.id,
                        "title": job.title,
                        "description": job.description or "",
                        "experience_min_yrs": job.experience_min_yrs or 0,
                        "job_embedding": job.job_embedding,
                        "company_name": company.name,
                        "skills": job_skills,
                        "location": job.location,
                        "state": job.state,
                        "city": job.city,
                        "posted_date": job.posted_at.isoformat() if job.posted_at else None,
                        "department": job.department,
                        "work_mode": job.work_mode,
                        "job_type": job.job_type,
                        "experience_level": job.experience_level,
                        "summary": job.summary,
                        "description": job.description,

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

        for job in jobs:
            try:
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
                        }
                    )

                    embedding_score = max(
                        0.0, min(1.0, result.scalar() or 0.0))
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
                    user_data["experience_years"], job["experience_min_yrs"]
                )

                # Final Score
                final_score = (
                    0.5 * embedding_score + 0.3 * skill_score + 0.2 * experience_score
                )

                # Generate reason
                reason = JobMatcherService._generate_match_reason(
                    embedding_score, skill_score, experience_score, matched_skills
                )

                scored_jobs.append(
                    {
                        "job_id": str(job["id"]),
                        "title": job["title"],
                        "final_score": round(final_score, 3),
                        "scores": {
                            "embedding": round(embedding_score, 3),
                            "skills": round(skill_score, 3),
                            "experience": round(experience_score, 3),
                        },
                        "matched_skills": matched_skills,
                        "missing_skills": missing_skills,
                        "reason": reason,
                        
                        "description": job["description"],
                        "experience_min_yrs": job["experience_min_yrs"],
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
            if not job_data.get("embedding"):
                # Fallback: get all users with resumes
                users_query = (
                    select(Resume, JobseekerProfile, User)
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
                    .limit(limit)
                )
            else:
                users_query = (
                    select(Resume, JobseekerProfile, User)
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
                    .order_by(text("resume_embedding <=> :job_embedding"))
                    .limit(limit)
                )
                users_query = users_query.params(
                    job_embedding=job_data["embedding"]
                )

            users_result = await session.execute(users_query)
            users_rows = users_result.all()

            candidate_users = []
            for resume, profile, user in users_rows:
                # Get user skills
                skills_query = (
                    select(Skill.name)
                    .join(
                        JobseekerSkill,
                        Skill.id == JobseekerSkill.skill_id,
                    )
                    .where(JobseekerSkill.user_id == resume.user_id)
                )
                skills_result = await session.execute(skills_query)
                user_skills = [row[0] for row in skills_result.all()]

                candidate_users.append(
                    {
                        "user_id": str(resume.user_id),
                        "summary": resume.parsed_summary or "",
                        "experience_years": float(profile.years_of_experience or 0) if profile else 0.0,
                        "resume_embedding": resume.resume_embedding,
                        "skills": user_skills,
                        "full_name": user.full_name if user else "",
                        "phone": user.phone if user else "",
                        "headline": profile.headline if profile else "",
                        "current_location": profile.current_location if profile else "",

                    }
                )

            return candidate_users

        except Exception as e:
            print(f"Error fetching candidate users: {str(e)}")
            return []

    @staticmethod
    async def _compute_candidate_scores(
        job_data: Dict[str, Any], candidates: List[Dict[str, Any]], session: AsyncSession
    ) -> List[Dict[str, Any]]:
        """Compute detailed scores for each candidate"""
        scored_candidates = []

        for candidate in candidates:
            try:
                # Embedding Score (cosine similarity)
                embedding_score = 0.0
                if job_data.get("embedding") and candidate.get("resume_embedding"):
                    # Using pgvector cosine similarity
                    similarity_query = text(
                        "SELECT 1.0 - ((:resume_emb)::vector <=> (:job_emb)::vector)"
                    )
                    result = await session.execute(
                        similarity_query,
                        {
                            "resume_emb": candidate["resume_embedding"],
                            "job_emb": job_data["embedding"],
                        }
                    )
                    embedding_score = max(0.0, min(1.0, result.scalar() or 0.0))
                else:
                    embedding_score = 0.5  # Default neutral score

                # Skills Score
                skill_score, matched_skills, missing_skills = (
                    JobMatcherService._compute_skill_score(
                        candidate["skills"], job_data["skills"], job_data.get("description", "")
                    )
                )

                # Experience Score
                experience_score = JobMatcherService._compute_experience_score(
                    candidate["experience_years"], job_data["experience_min_yrs"]
                )

                # Final Score
                final_score = (
                    0.5 * embedding_score + 0.3 * skill_score + 0.2 * experience_score
                )

                # Generate reason
                reason = JobMatcherService._generate_match_reason(
                    embedding_score, skill_score, experience_score, matched_skills
                )

                scored_candidates.append(
                    {
                        "user_id": candidate["user_id"],
                        "full_name": candidate["full_name"],
                        "phone": candidate["phone"],
                        "headline": candidate["headline"],
                        "current_location": candidate["current_location"],

                        "final_score": round(final_score, 3),
                        "scores": {
                            "embedding": round(embedding_score, 3),
                            "skills": round(skill_score, 3),
                            "experience": round(experience_score, 3),
                        },
                        "matched_skills": matched_skills,
                        "missing_skills": missing_skills,
                        "reason": reason,
                        "experience_years": candidate["experience_years"],
                        "skills": candidate["skills"],
                        "job_skills": job_data["skills"],
                        "summary": candidate["summary"],
                    }
                )

            except Exception as e:
                print(f"Error computing score for candidate {candidate['user_id']}: {str(e)}")
                continue

        return scored_candidates

    @staticmethod
    def _compute_skill_score(
        user_skills: List[str], job_skills: List[str], job_description: str = ""
    ) -> tuple[float, List[str], List[str]]:
        """Compute skill matching score"""
        if not job_skills:
            if not job_description:
                return 1.0, [], []  # Perfect score if no skills required and no description

            # Fallback: Check if user skills are mentioned in the job description
            matched_skills = []
            desc_lower = job_description.lower()
            for skill in user_skills:
                if skill.lower().strip() in desc_lower:
                    matched_skills.append(skill)
            
            # Score based on number of matched skills (e.g., 0.5 base + 0.1 per matched skill, up to 1.0)
            if matched_skills:
                skill_score = min(1.0, 0.5 + (len(matched_skills) * 0.1))
            else:
                skill_score = 0.5  # Neutral score if no skills matched
                
            return skill_score, matched_skills, []

        user_skills_lower = [skill.lower().strip() for skill in user_skills]
        job_skills_lower = [skill.lower().strip() for skill in job_skills]

        matched_skills = []
        missing_skills = []

        for job_skill in job_skills:
            job_skill_lower = job_skill.lower().strip()

            # Check for exact match or close variations
            if job_skill_lower in user_skills_lower:
                matched_skills.append(job_skill)
            else:
                # Check for partial matches (e.g., "python" matches "python programming")
                found_match = False
                for user_skill in user_skills_lower:
                    if (
                        job_skill_lower in user_skill
                        or user_skill in job_skill_lower
                        or JobMatcherService._skills_similar(
                            job_skill_lower, user_skill
                        )
                    ):
                        matched_skills.append(job_skill)
                        found_match = True
                        break
                if not found_match:
                    missing_skills.append(job_skill)

        skill_score = len(matched_skills) / \
            len(job_skills) if job_skills else 1.0
        return skill_score, matched_skills, missing_skills

    @staticmethod
    def _skills_similar(skill1: str, skill2: str) -> bool:
        """Check if two skills are similar (basic implementation)"""
        # Simple similarity check - can be enhanced with more sophisticated matching
        skill1_words = set(skill1.split())
        skill2_words = set(skill2.split())

        # If they share significant common words
        common_words = skill1_words.intersection(skill2_words)
        total_words = skill1_words.union(skill2_words)

        return len(common_words) / len(total_words) > 0.5 if total_words else False

    @staticmethod
    def _compute_experience_score(user_experience: float, min_experience: int) -> float:
        """Compute experience matching score"""
        if min_experience <= 0:
            return 1.0  # No experience requirement

        if user_experience <= 0:
            return 0.0  # No experience

        # Score based on ratio, capped at 1.0
        return min(user_experience / min_experience, 1.0)

    @staticmethod
    def _generate_match_reason(
        embedding_score: float,
        skill_score: float,
        experience_score: float,
        matched_skills: List[str],
    ) -> str:
        """Generate a short explanation for the match"""
        reasons = []

        if embedding_score > 0.7:
            reasons.append("Strong content match")
        elif embedding_score > 0.4:
            reasons.append("Moderate content match")
        else:
            reasons.append("Limited content match")

        if skill_score > 0.8:
            reasons.append(
                f"Excellent skill match ({len(matched_skills)} skills)")
        elif skill_score > 0.5:
            reasons.append(f"Good skill match ({len(matched_skills)} skills)")
        elif skill_score > 0.2:
            reasons.append(
                f"Partial skill match ({len(matched_skills)} skills)")
        else:
            reasons.append("Limited skill match")

        if experience_score >= 1.0:
            reasons.append("Experience exceeds requirements")
        elif experience_score > 0.7:
            reasons.append("Good experience match")
        elif experience_score > 0.0:
            reasons.append("Some experience match")
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
