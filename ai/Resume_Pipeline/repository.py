from __future__ import annotations

import asyncio
import logging
import os

import psycopg2
from psycopg2 import pool
from dotenv import load_dotenv

from .errors import RepositoryError
from .models import JobSeekerProfile

load_dotenv()
LOGGER = logging.getLogger("resume_repository")


class JobSeekerRepository:
    """Repository for profile and resume persistence."""

    def __init__(self, database_url: str | None = None) -> None:
        try:
            self._host = os.getenv("PGHOST") or os.getenv("DB_HOST") or "localhost"
            self._dbname = (
                os.getenv("PGDATABASE")
                or os.getenv("DB_NAME")
                or os.getenv("DATABASE")
                or "trotixai"
            )
            self._user = os.getenv("PGUSER") or os.getenv("DB_USER") or "postgres"
            self._password = os.getenv("PGPASSWORD") or os.getenv("DB_PASSWORD") or "sa123"
            self._port = int(os.getenv("PGPORT") or os.getenv("DB_PORT") or 5432)

            # Allow DATABASE_URL override when explicitly supplied.
            self._database_url = (database_url or os.getenv("DATABASE_URL", "")).replace(
                "postgresql+asyncpg://", "postgresql://"
            )
            self._pool: pool.AbstractConnectionPool | None = None

            if self._database_url:
                LOGGER.info(
                    "Configured database connection using DATABASE_URL"
                )
            else:
                LOGGER.info(
                    "Configured database connection to %s@%s:%s/%s",
                    self._user,
                    self._host,
                    self._port,
                    self._dbname,
                )
        except RepositoryError:
            raise
        except Exception as exc:
            LOGGER.exception("Error initializing JobSeekerRepository")
            raise RepositoryError("Failed to initialize repository") from exc

    async def connect(self) -> None:
        try:
            if self._database_url:
                self._pool = await asyncio.to_thread(
                    pool.ThreadedConnectionPool,
                    1,
                    5,
                    dsn=self._database_url,
                )
            else:
                self._pool = await asyncio.to_thread(
                    pool.ThreadedConnectionPool,
                    1,
                    5,
                    host=self._host,
                    dbname=self._dbname,
                    user=self._user,
                    password=self._password,
                    port=self._port,
                )
            LOGGER.info("Database connection pool created")
        except Exception as exc:
            LOGGER.exception("Failed to create psycopg2 pool", exc_info=True)
            raise RepositoryError("Failed to connect to database") from exc

    async def close(self) -> None:
        if self._pool is None:
            return

        try:
            await asyncio.to_thread(self._pool.closeall)
            self._pool = None
            LOGGER.info("Database connection pool closed")
        except Exception as exc:
            LOGGER.exception("Error closing psycopg2 pool")
            raise RepositoryError(
                "Failed to close database connection") from exc

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

        try:
            await asyncio.to_thread(
                self._save_profile_and_resume_sync,
                profile,
                file_name,
                file_url,
                file_size_bytes,
                mime_type,
            )

            LOGGER.info("Saved profile and resume for user %s",
                        profile.user_id)
        except RepositoryError:
            raise
        except Exception as exc:
            LOGGER.exception(
                "Failed to save profile and resume for user %s",
                getattr(profile, "user_id", None),
            )
            raise RepositoryError("Failed to save profile and resume") from exc

    def _save_profile_and_resume_sync(
        self,
        profile: JobSeekerProfile,
        file_name: str,
        file_url: str,
        file_size_bytes: int,
        mime_type: str,
    ) -> None:
        if self._pool is None:
            raise RepositoryError("Repository not connected.")

        conn = None
        try:
            conn = self._pool.getconn()
            with conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO jobseeker_profiles (
                            user_id, headline, summary, current_location, preferred_locations,
                            years_of_experience, notice_period_days, current_salary,
                            expected_salary, salary_currency, linkedin_url, github_url,
                            portfolio_url, updated_at
                        )
                        VALUES (
                            %s, %s, %s, %s, %s, %s, %s, %s,
                            %s, %s, %s, %s, %s, NOW()
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
                        (
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
                        ),
                    )

                    cur.execute(
                        """
                        INSERT INTO resumes (
                            user_id, file_name, file_url, file_size_bytes, mime_type,
                            parsed_at, raw_text, parsed_skills, parsed_experience_years,
                            parsed_job_titles, parsed_summary, updated_at
                        )
                        VALUES (
                            %s, %s, %s, %s, %s, NOW(), %s, %s, %s, %s, %s, NOW()
                        )
                        """,
                        (
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
                        ),
                    )

                    cur.execute(
                        "DELETE FROM jobseeker_skills WHERE user_id = %s",
                        (profile.user_id,),
                    )

                    if profile.skills:
                        for skill in profile.skills:
                            cur.execute(
                                """
                                INSERT INTO skills (name)
                                VALUES (%s)
                                ON CONFLICT (name)
                                DO UPDATE SET name = EXCLUDED.name
                                RETURNING id
                                """,
                                (skill.lower(),),
                            )
                            row = cur.fetchone()
                            if row is None:
                                raise RepositoryError("Failed to fetch skill id")
                            skill_id = row[0]
                            cur.execute(
                                """
                                INSERT INTO jobseeker_skills (user_id, skill_id, level, is_primary)
                                VALUES (%s, %s, 'intermediate', FALSE)
                                ON CONFLICT (user_id, skill_id) DO NOTHING
                                """,
                                (profile.user_id, skill_id),
                            )
        except (Exception, psycopg2.DatabaseError) as exc:
            LOGGER.exception(
                "Failed to save profile and resume for user %s",
                getattr(profile, "user_id", None),
            )
            raise RepositoryError("Failed to save profile and resume") from exc
        finally:
            if conn is not None and self._pool is not None:
                self._pool.putconn(conn)
