from __future__ import annotations

import os

import asyncpg

from .errors import RepositoryError
from .models import JobSeekerProfile


class JobSeekerRepository:
    """Repository for profile and resume persistence."""

    def __init__(self, database_url: str | None = None) -> None:
        raw_url = database_url or os.getenv("DATABASE_URL", "")
        if not raw_url:
            raise RepositoryError("DATABASE_URL is required.")

        # asyncpg expects postgresql:// style URLs.
        self._database_url = raw_url.replace("postgresql+asyncpg://", "postgresql://")
        self._pool: asyncpg.Pool | None = None

    async def connect(self) -> None:
        self._pool = await asyncpg.create_pool(dsn=self._database_url, min_size=1, max_size=5)

    async def close(self) -> None:
        if self._pool is not None:
            await self._pool.close()
            self._pool = None

    async def save_profile_and_resume(
        self,
        profile: JobSeekerProfile,
        file_name: str,
        file_url: str,
        file_size_bytes: int,
        mime_type: str,
    ) -> None:
        if self._pool is None:
            raise RepositoryError("Repository not connected.")

        async with self._pool.acquire() as conn:
            async with conn.transaction():
                await conn.execute(
                    """
                    INSERT INTO jobseeker_profiles (
                        user_id, headline, summary, current_location, preferred_locations,
                        years_of_experience, notice_period_days, current_salary,
                        expected_salary, salary_currency, linkedin_url, github_url,
                        portfolio_url, updated_at
                    )
                    VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8,
                        $9, $10, $11, $12, $13, NOW()
                    )
                    ON CONFLICT (user_id)
                    DO UPDATE SET
                        headline = EXCLUDED.headline,
                        summary = EXCLUDED.summary,
                        current_location = EXCLUDED.current_location,
                        preferred_locations = EXCLUDED.preferred_locations,
                        years_of_experience = EXCLUDED.years_of_experience,
                        notice_period_days = EXCLUDED.notice_period_days,
                        current_salary = EXCLUDED.current_salary,
                        expected_salary = EXCLUDED.expected_salary,
                        salary_currency = EXCLUDED.salary_currency,
                        linkedin_url = EXCLUDED.linkedin_url,
                        github_url = EXCLUDED.github_url,
                        portfolio_url = EXCLUDED.portfolio_url,
                        updated_at = NOW()
                    """,
                    profile.user_id,
                    profile.headline,
                    profile.summary,
                    profile.current_location,
                    profile.preferred_locations,
                    profile.years_of_experience,
                    profile.notice_period_days,
                    profile.current_salary,
                    profile.expected_salary,
                    profile.salary_currency,
                    profile.linkedin_url,
                    profile.github_url,
                    profile.portfolio_url,
                )

                await conn.execute(
                    """
                    INSERT INTO resumes (
                        user_id, file_name, file_url, file_size_bytes, mime_type,
                        parsed_at, raw_text, parsed_skills, parsed_experience_years,
                        parsed_job_titles, parsed_summary, updated_at
                    )
                    VALUES (
                        $1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10, NOW()
                    )
                    """,
                    profile.user_id,
                    file_name,
                    file_url,
                    file_size_bytes,
                    mime_type,
                    profile.raw_text,
                    profile.skills,
                    profile.years_of_experience,
                    profile.parsed_job_titles,
                    profile.parsed_summary,
                )

                await conn.execute("DELETE FROM jobseeker_skills WHERE user_id = $1", profile.user_id)
                if profile.skills:
                    for skill in profile.skills:
                        skill_id = await conn.fetchval(
                            """
                            INSERT INTO skills (name)
                            VALUES ($1)
                            ON CONFLICT (name)
                            DO UPDATE SET name = EXCLUDED.name
                            RETURNING id
                            """,
                            skill.lower(),
                        )
                        await conn.execute(
                            """
                            INSERT INTO jobseeker_skills (user_id, skill_id, level, is_primary)
                            VALUES ($1, $2, 'intermediate', FALSE)
                            ON CONFLICT (user_id, skill_id) DO NOTHING
                            """,
                            profile.user_id,
                            skill_id,
                        )

