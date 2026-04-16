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

from ai.models.orm_models import Resume, JobPosting, JobSkill, JobseekerSkill


class JobMatcherService:
    """Service for matching job seekers with job postings"""

    @staticmethod
    async def get_matching_jobs(user_id: str, session: AsyncSession, limit: int = 10) -> List[Dict[str, Any]]:
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
        candidate_jobs = await JobMatcherService._fetch_candidate_jobs(user_data, session, limit=100)

        # Step 3: Compute full scores for candidate jobs
        scored_jobs = await JobMatcherService._compute_job_scores(user_data, candidate_jobs, session)

        # Step 4: Sort by final score and return top results
        scored_jobs.sort(key=lambda x: x["final_score"], reverse=True)
        return scored_jobs[:limit]

    @staticmethod
    async def _fetch_user_data(user_id: str, session: AsyncSession) -> Optional[Dict[str, Any]]:
        """Fetch user resume data and skills"""
        try:
            # Get user resume data
            resume_query = select(Resume).where(
                Resume.user_id == UUID(user_id),
                Resume.is_primary == True
            )
            resume_result = await session.execute(resume_query)
            resume = resume_result.scalars().first()

            if not resume:
                return None

            # Get user skills
            skills_query = select(JobseekerSkill.skill_name).where(
                JobseekerSkill.user_id == UUID(user_id)
            )
            skills_result = await session.execute(skills_query)
            user_skills = [row[0] for row in skills_result.all()]

            return {
                "user_id": user_id,
                "summary": resume.summary or resume.parsed_summary or "",
                "experience_years": float(resume.experience_years or resume.parsed_experience_years or 0),
                "embedding": resume.embedding,
                "skills": user_skills
            }

        except Exception as e:
            print(f"Error fetching user data for {user_id}: {str(e)}")
            return None

    @staticmethod
    async def _fetch_candidate_jobs(user_data: Dict[str, Any], session: AsyncSession, limit: int = 100) -> List[Dict[str, Any]]:
        """Fetch candidate jobs with their skills, ranked by embedding similarity"""
        try:
            if not user_data.get("embedding"):
                # Fallback: get all jobs if no embedding
                jobs_query = select(JobPosting).limit(limit)
            else:
                # Use pgvector cosine similarity to get top jobs
                jobs_query = select(JobPosting).order_by(
                    text("embedding <=> :user_embedding")
                ).limit(limit)
                jobs_query = jobs_query.params(user_embedding=user_data["embedding"])

            jobs_result = await session.execute(jobs_query)
            jobs = jobs_result.scalars().all()

            candidate_jobs = []
            for job in jobs:
                # Get job skills
                skills_query = select(JobSkill.skill_name).where(JobSkill.job_id == job.id)
                skills_result = await session.execute(skills_query)
                job_skills = [row[0] for row in skills_result.all()]

                candidate_jobs.append({
                    "id": job.id,
                    "title": job.title,
                    "description": job.description or "",
                    "min_experience": job.min_experience or 0,
                    "embedding": job.embedding,
                    "skills": job_skills
                })

            return candidate_jobs

        except Exception as e:
            print(f"Error fetching candidate jobs: {str(e)}")
            return []

    @staticmethod
    async def _compute_job_scores(user_data: Dict[str, Any], jobs: List[Dict[str, Any]], session: AsyncSession) -> List[Dict[str, Any]]:
        """Compute detailed scores for each job"""
        scored_jobs = []

        for job in jobs:
            try:
                # Embedding Score (cosine similarity)
                embedding_score = 0.0
                if user_data.get("embedding") and job.get("embedding"):
                    # Using pgvector cosine similarity: 1 - (a <=> b)
                    similarity_query = select(
                        func.cast(1.0, type_=func.Float) - func.cast(
                            func.text(":job_emb <=> :user_emb"), type_=func.Float
                        )
                    ).params(
                        job_emb=job["embedding"],
                        user_emb=user_data["embedding"]
                    )
                    result = await session.execute(similarity_query)
                    embedding_score = max(0.0, min(1.0, result.scalar() or 0.0))
                else:
                    embedding_score = 0.5  # Default neutral score

                # Skills Score
                skill_score, matched_skills, missing_skills = JobMatcherService._compute_skill_score(
                    user_data["skills"], job["skills"]
                )

                # Experience Score
                experience_score = JobMatcherService._compute_experience_score(
                    user_data["experience_years"], job["min_experience"]
                )

                # Final Score
                final_score = (
                    0.5 * embedding_score +
                    0.3 * skill_score +
                    0.2 * experience_score
                )

                # Generate reason
                reason = JobMatcherService._generate_match_reason(
                    embedding_score, skill_score, experience_score, matched_skills
                )

                scored_jobs.append({
                    "job_id": str(job["id"]),
                    "title": job["title"],
                    "final_score": round(final_score, 3),
                    "scores": {
                        "embedding": round(embedding_score, 3),
                        "skills": round(skill_score, 3),
                        "experience": round(experience_score, 3)
                    },
                    "matched_skills": matched_skills,
                    "missing_skills": missing_skills,
                    "reason": reason
                })

            except Exception as e:
                print(f"Error computing score for job {job['id']}: {str(e)}")
                continue

        return scored_jobs

    @staticmethod
    def _compute_skill_score(user_skills: List[str], job_skills: List[str]) -> tuple[float, List[str], List[str]]:
        """Compute skill matching score"""
        if not job_skills:
            return 1.0, [], []  # Perfect score if no skills required

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
                    if (job_skill_lower in user_skill or
                        user_skill in job_skill_lower or
                        JobMatcherService._skills_similar(job_skill_lower, user_skill)):
                        matched_skills.append(job_skill)
                        found_match = True
                        break
                if not found_match:
                    missing_skills.append(job_skill)

        skill_score = len(matched_skills) / len(job_skills) if job_skills else 1.0
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
    def _generate_match_reason(embedding_score: float, skill_score: float, experience_score: float, matched_skills: List[str]) -> str:
        """Generate a short explanation for the match"""
        reasons = []

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
            reasons.append("Experience exceeds requirements")
        elif experience_score > 0.7:
            reasons.append("Good experience match")
        elif experience_score > 0.0:
            reasons.append("Some experience match")
        else:
            reasons.append("Experience below requirements")

        return " • ".join(reasons)


# Convenience function for external use
async def get_matching_jobs(user_id: str, session: AsyncSession, limit: int = 10) -> List[Dict[str, Any]]:
    """Get matching jobs for a user"""
    return await JobMatcherService.get_matching_jobs(user_id, session, limit)
