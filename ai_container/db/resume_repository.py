"""
Resume Repository Module
Handles all database operations for resume data insertion.
"""

import asyncio
import logging
import re
from datetime import date
from typing import Optional
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from ProcessPDF.resume_pipeline.errors import DatabaseIntegrityError, UserNotFoundError

LOGGER = logging.getLogger(__name__)


class ResumeRepository:
    """Repository for resume-related database operations."""

    def __init__(self, session: AsyncSession):
        """Initialize repository with database session."""
        self.session = session

    def _parse_date(self, date_val: Optional[str | date]) -> Optional[date]:
        """
        Safely parse date string or return date object.

        Args:
            date_val: Date string (YYYY-MM-DD) or date object

        Returns:
            date object if valid, None otherwise
        """
        if not date_val:
            return None

        if isinstance(date_val, date):
            return date_val

        try:
            if isinstance(date_val, str):
                # Handle cases like "2012-10-01T00:00:00" or just "2012-10-01"
                return date.fromisoformat(date_val.split("T")[0])
        except (ValueError, TypeError) as e:
            LOGGER.warning(f"Failed to parse date '{date_val}': {str(e)}")

        return None

    # ══════════════════════════════════════════════════════════════════════════════
    # USER OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def get_user_id_by_phone(self, phone: str) -> Optional[UUID]:
        """
        Fetch user ID from users table using phone number.

        Args:
            phone: Phone number to search for

        Returns:
            UUID of the user if found, None otherwise
        """
        try:
            query = text("SELECT id FROM users WHERE phone = :phone LIMIT 1")
            result = await self.session.execute(query, {"phone": phone})
            row = result.fetchone()

            if row:
                return UUID(str(row[0]))

            LOGGER.warning(f"No user found with phone: {phone}")
            return None

        except Exception as e:
            LOGGER.error(f"Error fetching user by phone: {str(e)}")
            raise

    async def user_exists(self, user_id: UUID) -> bool:
        """
        Check if a user exists in the database.

        Args:
            user_id: User UUID to check

        Returns:
            True if user exists, False otherwise
        """
        try:
            query = text("SELECT id FROM users WHERE id = :user_id LIMIT 1")
            result = await self.session.execute(query, {"user_id": str(user_id)})
            return result.fetchone() is not None
        except Exception as e:
            LOGGER.error(f"Error checking user existence: {str(e)}")
            raise

    # ══════════════════════════════════════════════════════════════════════════════
    # COMPANY OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    @staticmethod
    def _normalize_company_name(company_name: str) -> str:
        """
        Normalize company name by removing common suffixes and converting to lowercase.

        Removes common suffixes: pvt, ltd, co, company, inc, llc, corp, corporation, etc.
        Converts to lowercase and strips whitespace.

        Args:
            company_name: Original company name

        Returns:
            Normalized company name
        """
        if not company_name or not isinstance(company_name, str):
            return ""

        # Convert to lowercase and strip whitespace
        normalized = company_name.lower().strip()

        # List of common suffixes to remove
        suffixes = [
            r"\bpvt\.?\s*(ltd\.)?\b",
            r"\bltd\.?\b",
            r"\bco\.?\b",
            r"\bcompany\b",
            r"\binc\.?\b",
            r"\bincorporated\b",
            r"\bllc\b",
            r"\bllp\b",
            r"\bcorp\.?\b",
            r"\bcorporation\b",
            r"\bpch?\b",
            r"\bpvt\.?\bltd\.?\b",
            r",\s*inc\.?\b",
            r",\s*ltd\.?\b",
            r",\s*limited\.?\b",
            r",\s*private\.?\b",
        ]

        for suffix in suffixes:
            normalized = re.sub(suffix, "", normalized, flags=re.IGNORECASE)

        # Remove extra spaces and commas at the end
        normalized = re.sub(r"[,\s]+$", "", normalized)
        normalized = " ".join(normalized.split())  # Normalize internal spaces

        return normalized

    async def get_or_create_company(
        self, company_name: str, commit: bool = True
    ) -> int:
        """
        Fetch company ID from the companies table. If no matching record exists,
        insert the normalized company name and retrieve the newly created ID.

        Args:
            company_name: Original company name
            commit: Whether to commit the transaction

        Returns:
            Integer ID of the company (existing or newly created)
        """
        try:
            if not company_name:
                raise ValueError("Company name cannot be empty")

            # Normalize the company name
            normalized_name = self._normalize_company_name(company_name)

            if not normalized_name:
                raise ValueError(
                    f"Company name '{company_name}' cannot be normalized to empty string"
                )

            # Check if company already exists
            query = text(
                """
                SELECT id FROM companies WHERE LOWER(name) = LOWER(:name) LIMIT 1
            """
            )
            result = await self.session.execute(query, {"name": normalized_name})
            row = result.fetchone()

            if row:
                company_id = int(row[0])
                LOGGER.debug(
                    f"Found existing company: {normalized_name} (ID: {company_id})"
                )
                return company_id

            # Company doesn't exist, create it
            insert_query = text(
                """
                INSERT INTO companies (name, created_at)
                VALUES (:name, NOW())
                RETURNING id
            """
            )
            insert_result = await self.session.execute(
                insert_query, {"name": normalized_name}
            )
            row = insert_result.fetchone()

            if commit:
                await self.session.commit()

            company_id = int(row[0])
            LOGGER.info(f"Created new company: {normalized_name} (ID: {company_id})")
            return company_id

        except Exception as e:
            LOGGER.error(
                f"Error in get_or_create_company for '{company_name}': {str(e)}"
            )
            if commit:
                await self.session.rollback()
            raise

    # ══════════════════════════════════════════════════════════════════════════════
    # SKILL OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def get_skill_by_name(self, skill_name: str) -> Optional[int]:
        """
        Get skill ID by normalized name.

        Args:
            skill_name: Skill name to search for

        Returns:
            Integer ID of the skill if found, None otherwise
        """
        try:
            skill_name_normalized = skill_name.lower().strip()

            query = text("SELECT id FROM skills WHERE name = :name LIMIT 1")
            result = await self.session.execute(query, {"name": skill_name_normalized})
            row = result.fetchone()

            return int(row[0]) if row else None

        except Exception as e:
            LOGGER.error(f"Error fetching skill: {str(e)}")
            raise

    async def create_skill(
        self, skill_name: str, category: Optional[str] = None
    ) -> int:
        """
        Create a new skill.

        Args:
            skill_name: Name of the skill
            category: Optional category (e.g., "backend", "frontend")

        Returns:
            Integer ID of the created skill
        """
        try:
            skill_name_normalized = skill_name.lower().strip()

            query = text(
                """
                INSERT INTO skills (name, category, is_trending, created_at)
                VALUES (:name, :category, FALSE, NOW())
                RETURNING id
            """
            )

            result = await self.session.execute(
                query, {"name": skill_name_normalized, "category": category}
            )
            row = result.fetchone()
            await self.session.commit()

            skill_id = int(row[0])
            LOGGER.info(f"Created skill: {skill_name} (ID: {skill_id})")
            return skill_id

        except Exception as e:
            LOGGER.error(f"Error creating skill '{skill_name}': {str(e)}")
            await self.session.rollback()
            raise

    async def get_or_create_skill(
        self, skill_name: str, category: Optional[str] = None
    ) -> int:
        """
        Get existing skill or create new one.

        Args:
            skill_name: Name of the skill
            category: Optional category

        Returns:
            Integer ID of the skill
        """
        skill_id = await self.get_skill_by_name(skill_name)

        if skill_id:
            return skill_id

        return await self.create_skill(skill_name, category)

    # ══════════════════════════════════════════════════════════════════════════════
    # JOBSEEKER PROFILE OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def upsert_jobseeker_profile(
        self, user_id: UUID, profile_data: dict, commit: bool = True
    ) -> None:
        """
        Insert or update jobseeker profile.

        Args:
            user_id: User UUID
            profile_data: Dictionary containing profile information
            commit: Whether to commit the transaction

        Raises:
            UserNotFoundError: If user doesn't exist in database
            DatabaseIntegrityError: If database integrity constraint is violated
        """
        try:
            if not self.session:
                raise RuntimeError("Database session is not initialized")

            # Validate user exists before attempting profile upsert
            user_exists = await self.user_exists(user_id)
            if not user_exists:
                error_msg = (
                    f"Cannot save profile: User {user_id} does not exist in database"
                )
                LOGGER.error(error_msg)
                raise UserNotFoundError(error_msg)

            query = text(
                """
                INSERT INTO jobseeker_profiles (
                    user_id, headline, summary, current_location,
                    preferred_locations, years_of_experience, notice_period_days,
                    current_salary, expected_salary, salary_currency,
                    linkedin_url, github_url, portfolio_url, created_at, updated_at
                ) VALUES (
                    :user_id, :headline, :summary, :current_location,
                    :preferred_locations, :years_of_experience, :notice_period_days,
                    :current_salary, :expected_salary, :salary_currency,
                    :linkedin_url, :github_url, :portfolio_url, NOW(), NOW()
                )
                ON CONFLICT (user_id) DO UPDATE SET
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
            """
            )

            await self.session.execute(
                query,
                {
                    "user_id": str(user_id),
                    "headline": profile_data.get("headline"),
                    "summary": profile_data.get("summary"),
                    "current_location": profile_data.get("current_location"),
                    "preferred_locations": profile_data.get("preferred_locations", []),
                    "years_of_experience": profile_data.get("years_of_experience"),
                    "notice_period_days": profile_data.get("notice_period_days"),
                    "current_salary": profile_data.get("current_salary"),
                    "expected_salary": profile_data.get("expected_salary"),
                    "salary_currency": "INR",
                    "linkedin_url": profile_data.get("linkedin_url"),
                    "github_url": profile_data.get("github_url"),
                    "portfolio_url": profile_data.get("portfolio_url"),
                },
            )
            if commit:
                await self.session.commit()
            LOGGER.info(f"Successfully upserted jobseeker profile for user {user_id}")

        except UserNotFoundError:
            # Re-raise UserNotFoundError without rollback (no transaction started)
            raise
        except Exception as e:
            error_msg = str(e)
            # Check for foreign key or integrity errors
            if "ForeignKeyViolationError" in str(type(e)) or "IntegrityError" in str(
                type(e)
            ):
                if (
                    "jobseeker_profiles_user_id_fkey" in error_msg
                    or "users" in error_msg
                ):
                    user_error = (
                        f"User {user_id} does not exist. Cannot create profile."
                    )
                    LOGGER.error(user_error)
                    await self.session.rollback()
                    raise DatabaseIntegrityError(user_error) from e
                else:
                    LOGGER.error(
                        f"Database integrity constraint violation: {error_msg}"
                    )
                    await self.session.rollback()
                    raise DatabaseIntegrityError(
                        f"Database integrity error: {error_msg}"
                    ) from e
            else:
                LOGGER.error(f"Error upserting jobseeker profile: {error_msg}")
                await self.session.rollback()
                raise

    # ══════════════════════════════════════════════════════════════════════════════
    # SKILL ASSIGNMENT OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def add_user_skill(
        self,
        user_id: UUID,
        skill_id: int,
        level: str = "intermediate",
        years: Optional[float] = None,
        commit: bool = True,
    ) -> None:
        """
        Add skill to user (with upsert).

        Args:
            user_id: User UUID
            skill_id: Skill
            level: Proficiency level (beginner, intermediate, advanced)
            years: Years of experience with this skill
            commit: Whether to commit the transaction
        """
        try:
            query = text(
                """
                INSERT INTO jobseeker_skills (user_id, skill_id, level, years, created_at)
                VALUES (:user_id, :skill_id, :level, :years, NOW())
                ON CONFLICT (user_id, skill_id) DO UPDATE SET
                    level = EXCLUDED.level,
                    years = EXCLUDED.years
            """
            )

            await self.session.execute(
                query,
                {
                    "user_id": str(user_id),
                    "skill_id": skill_id,
                    "level": level,
                    "years": years,
                },
            )
            if commit:
                await self.session.commit()
            LOGGER.debug(f"Added skill {skill_id} to user {user_id}")

        except Exception as e:
            LOGGER.error(f"Error adding user skill: {str(e)}")
            await self.session.rollback()
            raise

    # ══════════════════════════════════════════════════════════════════════════════
    # EDUCATION OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def add_education(
        self,
        user_id: UUID,
        institution: str,
        degree: Optional[str | list] = None,
        field_of_study: Optional[str | list] = None,
        grade: Optional[str] = None,
        start_year: Optional[int] = None,
        end_year: Optional[int] = None,
        is_current: bool = False,
        description: Optional[str] = None,
        sort_order: int = 0,
        commit: bool = True,
    ) -> UUID:
        """
        Add education record for user.

        Args:
            user_id: User UUID
            institution: Name of institution
            degree: Degree obtained (str or list)
            field_of_study: Field of study (str or list)
            grade: Grade/GPA
            start_year: Start year
            end_year: End year
            is_current: Whether currently studying
            description: Additional description
            sort_order: Display order
            commit: Whether to commit the transaction

        Returns:
            UUID of the created education record
        """
        try:
            # Handle field_of_study and degree as list or string
            if isinstance(degree, list):
                degree = ", ".join(degree) if degree else None

            if isinstance(field_of_study, list):
                field_of_study = ", ".join(field_of_study) if field_of_study else None

            query = text(
                """
                INSERT INTO education (
                    user_id, institution, degree, field_of_study, grade,
                    start_year, end_year, is_current, description, sort_order, created_at
                ) VALUES (
                    :user_id, :institution, :degree, :field_of_study, :grade,
                    :start_year, :end_year, :is_current, :description, :sort_order, NOW()
                )
                RETURNING id
            """
            )

            result = await self.session.execute(
                query,
                {
                    "user_id": str(user_id),
                    "institution": institution,
                    "degree": degree,
                    "field_of_study": field_of_study,
                    "grade": grade,
                    "start_year": start_year,
                    "end_year": end_year,
                    "is_current": is_current,
                    "description": description,
                    "sort_order": sort_order,
                },
            )
            row = result.fetchone()
            if commit:
                await self.session.commit()

            education_id = int(row[0])
            LOGGER.debug(f"Added education for user {user_id}")
            return education_id

        except Exception as e:
            LOGGER.error(f"Error adding education: {str(e)}")
            await self.session.rollback()
            raise

    # ══════════════════════════════════════════════════════════════════════════════
    # WORK EXPERIENCE OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def add_work_experience(
        self,
        user_id: UUID,
        company_name: str,
        title: str,
        location: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        is_current: bool = False,
        description: Optional[str] = None,
        skills_used: Optional[list] = None,
        achievements: Optional[list] = None,
        sort_order: int = 0,
        commit: bool = True,
    ) -> UUID:
        """
        Add work experience record for user.

        Fetches or creates the company from the companies table (with normalization),
        then uses the company_id to populate the work_experiences record.

        Args:
            user_id: User UUID
            company_name: Company name (will be normalized)
            title: Job title
            location: Job location
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            is_current: Whether currently working
            description: Job description
            skills_used: List of skills used
            achievements: List of achievements
            sort_order: Display order
            commit: Whether to commit the transaction

        Returns:
            UUID of the created work experience record
        """
        try:
            # Get or create company and retrieve company_id (integer)
            company_id = await self.get_or_create_company(company_name, commit=False)

            query = text(
                """
                INSERT INTO work_experiences (
                    user_id, company_id, title, location, start_date, end_date,
                    is_current, description, skills_used, achievements, sort_order, created_at
                ) VALUES (
                    :user_id, :company_id, :title, :location, :start_date, :end_date,
                    :is_current, :description, :skills_used, :achievements, :sort_order, NOW()
                )
                RETURNING id
            """
            )

            result = await self.session.execute(
                query,
                {
                    "user_id": str(user_id),
                    "company_id": company_id,
                    "title": title,
                    "location": location,
                    "start_date": self._parse_date(start_date),
                    "end_date": self._parse_date(end_date),
                    "is_current": is_current,
                    "description": description,
                    "skills_used": skills_used or [],
                    "achievements": achievements or [],
                    "sort_order": sort_order,
                },
            )
            row = result.fetchone()
            if commit:
                await self.session.commit()

            exp_id = int(row[0])
            LOGGER.debug(
                f"Added work experience for user {user_id} with company ID {company_id}"
            )
            return exp_id

        except Exception as e:
            LOGGER.error(f"Error adding work experience: {str(e)}")
            await self.session.rollback()
            raise

    # ══════════════════════════════════════════════════════════════════════════════
    # PROJECT OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def add_project(
        self,
        user_id: UUID,
        title: str,
        work_experience_id: Optional[int] = None,
        description: Optional[str] = None,
        url: Optional[str] = None,
        repo_url: Optional[str] = None,
        skills_used: Optional[list] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        sort_order: int = 0,
        commit: bool = True,
    ) -> UUID:
        """
        Add project record for user.

        Args:
            user_id: User UUID
            title: Project title
            work_experience_id: Optional work experience UUID
            description: Project description
            url: Project URL
            repo_url: Repository URL
            skills_used: List of technologies/skills used
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            sort_order: Display order
            commit: Whether to commit the transaction

        Returns:
            UUID of the created project record
        """
        try:
            query = text(
                """
                INSERT INTO projects (
                    user_id, work_experience_id, title, description, url, repo_url, skills_used,
                    start_date, end_date, sort_order, created_at
                ) VALUES (
                    :user_id, :work_experience_id, :title, :description, :url, :repo_url, :skills_used,
                    :start_date, :end_date, :sort_order, NOW()
                )
                RETURNING id
            """
            )

            result = await self.session.execute(
                query,
                {
                    "user_id": str(user_id),
                    "work_experience_id": (
                        int(work_experience_id) if work_experience_id else None
                    ),
                    "title": title,
                    "description": description,
                    "url": url,
                    "repo_url": repo_url,
                    "skills_used": skills_used or [],
                    "start_date": self._parse_date(start_date),
                    "end_date": self._parse_date(end_date),
                    "sort_order": sort_order,
                },
            )
            row = result.fetchone()
            if commit:
                await self.session.commit()

            project_id = int(row[0])
            LOGGER.debug(f"Added project for user {user_id}")
            return project_id

        except Exception as e:
            LOGGER.error(f"Error adding project: {str(e)}")
            await self.session.rollback()
            raise

    # ══════════════════════════════════════════════════════════════════════════════
    # RESUME FILE OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def add_resume(
        self,
        user_id: UUID,
        file_name: str,
        file_url: str,
        mime_type: str,
        parsed_summary: Optional[str] = None,
        resume_embedding: list[float] | None = None,
        commit: bool = True,
    ) -> UUID:
        """
        Add resume file record.

        Args:
            user_id: User UUID
            file_name: Original file name
            file_url: S3 or cloud storage URL
            mime_type: MIME type of file
            parsed_summary: Extracted summary
            resume_embedding: Vector embedding of the resume (list of floats)
            commit: Whether to commit the transaction

        Returns:
            UUID of the created resume record
        """
        try:
            query = text(
                """
                INSERT INTO resumes (
                    user_id, file_name, file_url,  mime_type,
                     parsed_summary,
                    parsed_at, resume_embedding
                ) VALUES (
                    :user_id, :file_name, :file_url, :mime_type,
                    :parsed_summary,
                     NOW(),:resume_embedding
                )
                RETURNING id
            """
            )

            print(
                f"Resume embedding length: {len(resume_embedding) if resume_embedding else 'None'}"
            )

            result = await self.session.execute(
                query,
                {
                    "user_id": str(user_id),
                    "file_name": file_name,
                    "file_url": file_url,
                    "mime_type": mime_type,
                    "parsed_summary": parsed_summary,
                    "resume_embedding": (
                        str(resume_embedding) if resume_embedding else None
                    ),
                },
            )
            row = result.fetchone()
            if commit:
                await self.session.commit()

            resume_id = int(row[0])
            print(f"Added/Updated resume for user {user_id}")
            return resume_id

        except Exception as e:
            print(f"Error adding resume: {str(e)}")
            await self.session.rollback()
            raise

    # ══════════════════════════════════════════════════════════════════════════════
    # BULK SKILL OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def bulk_add_user_skills(
        self,
        user_id: UUID,
        skill_names: list,
        level: str = "intermediate",
        commit: bool = True,
    ) -> None:
        """
        Bulk add multiple skills to user with deduplication and normalization.

        Features:
        - Normalizes skill names (lowercase, strip spaces, remove extra spaces)
        - Deduplicates skills automatically
        - Checks for existing skills
        - Creates new skills if needed
        - Bulk assigns all skills to user

        Args:
            user_id: User UUID
            skill_names: List of skill names to add
            level: Proficiency level (beginner, intermediate, advanced)
        """
        try:
            if not skill_names:
                LOGGER.info(f"No skills provided for user {user_id}")
                return

            # Normalize and deduplicate skills
            normalized_skills = set()
            for skill in skill_names:
                if isinstance(skill, str) and skill.strip():
                    # Normalize: lowercase, strip, and replace multiple spaces with single space
                    normalized = " ".join(skill.lower().split())
                    normalized_skills.add(normalized)

            if not normalized_skills:
                LOGGER.info(f"No valid skills after normalization for user {user_id}")
                return

            LOGGER.info(
                f"Processing {len(normalized_skills)} unique skills for user {user_id}"
            )

            # Get existing skills in one query
            skill_list = list(normalized_skills)
            placeholders = ", ".join([f"'{s}'" for s in skill_list])

            query = text(
                f"""
                SELECT id, name FROM skills WHERE name IN ({placeholders})
            """
            )
            result = await self.session.execute(query)
            existing_skills = {row[1]: row[0] for row in result.fetchall()}

            # Find skills to create
            skills_to_create = [
                skill for skill in normalized_skills if skill not in existing_skills
            ]

            # Create new skills in bulk
            created_skill_ids = {}
            if skills_to_create:
                for skill_name in skills_to_create:
                    insert_query = text(
                        """
                        INSERT INTO skills (name, is_trending, created_at)
                        VALUES (:name, FALSE, NOW())
                        RETURNING id
                    """
                    )
                    insert_result = await self.session.execute(
                        insert_query, {"name": skill_name}
                    )
                    row = insert_result.fetchone()
                    if row:
                        created_skill_ids[skill_name] = int(row[0])

                LOGGER.info(f"Created {len(created_skill_ids)} new skills")

            # Combine existing and newly created skills
            all_skill_ids = {**existing_skills, **created_skill_ids}

            # Bulk insert user skills (upsert) using single multi-row query
            if all_skill_ids:
                skill_id_list = list(all_skill_ids.values())
                # SQLAlchemy doesn't support easy multi-row text() values mapping
                # for varied params easily, so we use a list of dicts with execute(many=True equivalent)
                # or manually construct the values string if it's many.
                # Actually, await self.session.execute(upsert_query, list_of_params) is well supported.

                upsert_query = text(
                    """
                    INSERT INTO jobseeker_skills (user_id, skill_id, level, created_at)
                    VALUES (:user_id, :skill_id, :level, NOW())
                    ON CONFLICT (user_id, skill_id) DO UPDATE SET
                        level = EXCLUDED.level
                """
                )

                params = [
                    {
                        "user_id": str(user_id),
                        "skill_id": skill_id,
                        "level": level,
                    }
                    for skill_id in skill_id_list
                ]

                await self.session.execute(upsert_query, params)

            if commit:
                await self.session.commit()
            LOGGER.info(
                f"Successfully added {len(all_skill_ids)} skills to user {user_id}"
            )

        except Exception as e:
            LOGGER.error(f"Error bulk adding user skills: {str(e)}")
            await self.session.rollback()
            raise

    async def add_project_skills(
        self,
        project_id: UUID,
        skill_names: list,
        commit: bool = True,
    ) -> None:
        """
        Add skills to a project with deduplication and normalization.

        Args:
            project_id: Project UUID
            skill_names: List of skill names to add
        """
        try:
            if not skill_names:
                return

            # Normalize and deduplicate skills
            normalized_skills = set()
            for skill in skill_names:
                if isinstance(skill, str) and skill.strip():
                    normalized = " ".join(skill.lower().split())
                    normalized_skills.add(normalized)

            if not normalized_skills:
                return

            # Get existing skills
            skill_list = list(normalized_skills)
            placeholders = ", ".join([f"'{s}'" for s in skill_list])

            query = text(
                f"""
                SELECT id, name FROM skills WHERE name IN ({placeholders})
            """
            )
            result = await self.session.execute(query)
            existing_skills = {row[1]: row[0] for row in result.fetchall()}

            # Find skills to create
            skills_to_create = [
                skill for skill in normalized_skills if skill not in existing_skills
            ]

            # Create new skills
            created_skill_ids = {}
            if skills_to_create:
                for skill_name in skills_to_create:
                    insert_query = text(
                        """
                        INSERT INTO skills (name, is_trending, created_at)
                        VALUES (:name, FALSE, NOW())
                        RETURNING id
                    """
                    )
                    insert_result = await self.session.execute(
                        insert_query, {"name": skill_name}
                    )
                    row = insert_result.fetchone()
                    if row:
                        created_skill_ids[skill_name] = int(row[0])

            # Combine existing and newly created skills
            all_skill_ids = {**existing_skills, **created_skill_ids}

            # Bulk insert project skills (upsert)
            for skill_name, skill_id in all_skill_ids.items():
                upsert_query = text(
                    """
                    INSERT INTO project_skills (project_id, skill_id, created_at)
                    VALUES (:project_id, :skill_id, NOW())
                    ON CONFLICT (project_id, skill_id) DO NOTHING
                """
                )
                await self.session.execute(
                    upsert_query,
                    {
                        "project_id": str(project_id),
                        "skill_id": skill_id,
                    },
                )

            if commit:
                await self.session.commit()
            LOGGER.debug(f"Added {len(all_skill_ids)} skills to project {project_id}")

        except Exception as e:
            LOGGER.error(f"Error adding project skills: {str(e)}")
            await self.session.rollback()
            raise

    async def add_work_experience_skills(
        self,
        work_experience_id: UUID,
        skill_names: list,
        commit: bool = True,
    ) -> None:
        """
        Add skills to a work experience with deduplication and normalization.

        Args:
            work_experience_id: Work experience UUID
            skill_names: List of skill names to add
        """
        try:
            if not skill_names:
                return

            # Normalize and deduplicate skills
            normalized_skills = set()
            for skill in skill_names:
                if isinstance(skill, str) and skill.strip():
                    normalized = " ".join(skill.lower().split())
                    normalized_skills.add(normalized)

            if not normalized_skills:
                return

            # Get existing skills
            skill_list = list(normalized_skills)
            placeholders = ", ".join([f"'{s}'" for s in skill_list])

            query = text(
                f"""
                SELECT id, name FROM skills WHERE name IN ({placeholders})
            """
            )
            result = await self.session.execute(query)
            existing_skills = {row[1]: row[0] for row in result.fetchall()}

            # Find skills to create
            skills_to_create = [
                skill for skill in normalized_skills if skill not in existing_skills
            ]

            # Create new skills
            created_skill_ids = {}
            if skills_to_create:
                for skill_name in skills_to_create:
                    insert_query = text(
                        """
                        INSERT INTO skills (name, is_trending, created_at)
                        VALUES (:name, FALSE, NOW())
                        RETURNING id
                    """
                    )
                    insert_result = await self.session.execute(
                        insert_query, {"name": skill_name}
                    )
                    row = insert_result.fetchone()
                    if row:
                        created_skill_ids[skill_name] = int(row[0])

            # Combine existing and newly created skills
            all_skill_ids = {**existing_skills, **created_skill_ids}

            # Bulk insert work experience skills (upsert)
            for skill_name, skill_id in all_skill_ids.items():
                upsert_query = text(
                    """
                    INSERT INTO work_experience_skills (work_experience_id, skill_id, created_at)
                    VALUES (:work_experience_id, :skill_id, NOW())
                    ON CONFLICT (work_experience_id, skill_id) DO NOTHING
                """
                )
                await self.session.execute(
                    upsert_query,
                    {
                        "work_experience_id": str(work_experience_id),
                        "skill_id": skill_id,
                    },
                )

            if commit:
                await self.session.commit()
            LOGGER.debug(
                f"Added {len(all_skill_ids)} skills to work experience {work_experience_id}"
            )

        except Exception as e:
            LOGGER.error(f"Error adding work experience skills: {str(e)}")
            await self.session.rollback()
            raise

    async def bulk_add_user_languages(
        self,
        user_id: UUID,
        language_names: list,
        commit: bool = True,
    ) -> None:
        """
        Bulk add multiple languages to user with deduplication and normalization.

        Features:
        - Normalizes language names (lowercase, strip spaces, remove extra spaces)
        - Deduplicates languages automatically
        - Checks for existing languages
        - Creates new languages if needed
        - Bulk assigns all languages to user

        Args:
            user_id: User UUID
            language_names: List of language names to add
            commit: Whether to commit the transaction
        """
        try:
            if not language_names:
                LOGGER.info(f"No languages provided for user {user_id}")
                return

            # Normalize and deduplicate languages
            normalized_languages = set()
            for language in language_names:
                if isinstance(language, str) and language.strip():
                    # Normalize: lowercase, strip, and replace multiple spaces with single space
                    normalized = " ".join(language.lower().split())
                    normalized_languages.add(normalized)

            if not normalized_languages:
                LOGGER.info(
                    f"No valid languages after normalization for user {user_id}"
                )
                return

            LOGGER.info(
                f"Processing {len(normalized_languages)} unique languages for user {user_id}"
            )

            # Get existing languages in one query
            language_list = list(normalized_languages)
            placeholders = ", ".join([f"'{lang}'" for lang in language_list])

            query = text(
                f"""
                SELECT id, language FROM languages WHERE language IN ({placeholders})
            """
            )
            result = await self.session.execute(query)
            existing_languages = {row[1]: row[0] for row in result.fetchall()}

            # Find languages to create
            languages_to_create = [
                lang for lang in normalized_languages if lang not in existing_languages
            ]

            # Create new languages in bulk
            created_language_ids = {}
            if languages_to_create:
                for language_name in languages_to_create:
                    insert_query = text(
                        """
                        INSERT INTO languages (language, created_at)
                        VALUES (:language, NOW())
                        RETURNING id
                    """
                    )
                    insert_result = await self.session.execute(
                        insert_query, {"language": language_name}
                    )
                    row = insert_result.fetchone()
                    if row:
                        created_language_ids[language_name] = int(row[0])

                LOGGER.info(f"Created {len(created_language_ids)} new languages")

            # Combine existing and newly created languages
            all_language_ids = {**existing_languages, **created_language_ids}

            # Bulk insert user languages (upsert) using multi-row query
            if all_language_ids:
                language_id_list = list(all_language_ids.values())

                upsert_query = text(
                    """
                    INSERT INTO user_languages (user_id, language_id, created_at)
                    VALUES (:user_id, :language_id, NOW())
                    ON CONFLICT (user_id, language_id) DO NOTHING
                """
                )

                params = [
                    {
                        "user_id": str(user_id),
                        "language_id": language_id,
                    }
                    for language_id in language_id_list
                ]

                await self.session.execute(upsert_query, params)

            if commit:
                await self.session.commit()
            LOGGER.info(
                f"Successfully added {len(all_language_ids)} languages to user {user_id}"
            )

        except Exception as e:
            LOGGER.error(f"Error bulk adding user languages: {str(e)}")
            await self.session.rollback()
            raise

    async def update_user_resume_status(
        self,
        user_id: UUID,
        resume_status: str,
        commit: bool = True,
    ) -> None:
        """
        Update the status of a user.

        Args:
            user_id: User UUID
            resume_status: New status for the user
        """
        try:

            query = text(
                f"""
                UPDATE users SET resume_status = :resume_status WHERE id = :user_id
            """
            )
            result = await self.session.execute(
                query, {"resume_status": resume_status, "user_id": str(user_id)}
            )

            await self.session.commit()

            LOGGER.debug(f"Updated resume_status for user {user_id} to {resume_status}")

        except Exception as e:
            LOGGER.error(f"Error updating resume_status for user {user_id}: {str(e)}")
            await self.session.rollback()
            raise

    async def update_user_name_and_email(
        self,
        user_id: UUID,
        profile_data: dict,
        commit: bool = True,
    ) -> None:
        """
        Update user name and email from profile data.

        Args:
            user_id: User UUID
            profile_data: Dictionary containing user profile information
            commit: Whether to commit the transaction
        """
        try:
            # Extract and normalize email
            email = profile_data.get("email")
            if email and isinstance(email, str):
                email = email.strip() or None
            else:
                email = None

            # Extract and normalize name (try 'name' first, then 'full_name')
            name = profile_data.get("name") or profile_data.get("full_name")
            if name and isinstance(name, str):
                name = name.strip() or None
            else:
                name = None

            # Only update if at least one field has a value
            if email or name:
                update_query = text(
                    """
                    UPDATE users SET 
                        email = COALESCE(:email, email),
                        full_name = COALESCE(:full_name, full_name)
                    WHERE id = :user_id
                """
                )
                await self.session.execute(
                    update_query,
                    {
                        "email": email,
                        "full_name": name,
                        "user_id": str(user_id),
                    },
                )

                if commit:
                    await self.session.commit()

                LOGGER.debug(f"Updated name and/or email for user {user_id}")
        except Exception as e:
            LOGGER.error(f"Error updating user name and email for {user_id}: {str(e)}")
            if commit:
                await self.session.rollback()
            raise

    # ══════════════════════════════════════════════════════════════════════════════
    # COMPREHENSIVE PROFILE & RESUME OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def save_profile_and_resume(
        self,
        user_id,
        profile_data: dict,
        file_name: str,
        file_url: str,
        file_size_bytes: int,
        mime_type: str,
        education_details: list | None = None,
        resume_embedding: list[float] | None = None,
    ) -> None:
        try:
            # -------------------------
            # 1. Core operations (SEQUENTIAL - safer for DB session)
            # -------------------------
            await self.upsert_jobseeker_profile(user_id, profile_data, commit=False)

            # Update users table with email and name from profile_data
            await self.update_user_name_and_email(user_id, profile_data, commit=False)

            await self.add_resume(
                user_id=user_id,
                file_name=file_name,
                file_url=file_url,
                mime_type=mime_type,
                parsed_summary=profile_data.get("summary"),
                resume_embedding=resume_embedding,
                commit=False,
            )

            skills = profile_data.get("skills", [])
            if skills:
                await self.bulk_add_user_skills(
                    user_id=user_id,
                    skill_names=skills,
                    level="intermediate",
                    commit=False,
                )

            languages = profile_data.get("languages", [])
            if languages:
                await self.bulk_add_user_languages(
                    user_id=user_id,
                    language_names=languages,
                    commit=False,
                )

            LOGGER.info(f"Basic profile, resume, and skills saved for user {user_id}")

            # -------------------------
            # 2. Education (can parallelize if using separate sessions)
            # -------------------------
            if education_details:
                for idx, edu in enumerate(education_details):
                    await self.add_education(
                        user_id=user_id,
                        institution=edu.get("institution", ""),
                        degree=edu.get("degree"),
                        field_of_study=edu.get("field_of_study"),
                        grade=edu.get("grade"),
                        start_year=edu.get("start_year"),
                        end_year=edu.get("end_year"),
                        is_current=edu.get("is_current", False),
                        description=edu.get("description"),
                        sort_order=idx,
                        commit=False,
                    )

            # -------------------------
            # 3. Work Experience + Projects
            # -------------------------
            work_experiences = profile_data.get("work_experiences", [])

            for idx, work_exp in enumerate(work_experiences):
                exp_id = await self.add_work_experience(
                    user_id=user_id,
                    company_name=work_exp.get("company_name", ""),
                    title=work_exp.get("title", ""),
                    location=work_exp.get("location"),
                    start_date=work_exp.get("start_date"),
                    end_date=work_exp.get("end_date") or None,
                    is_current=work_exp.get("is_current", False),
                    description=work_exp.get("description"),
                    skills_used=work_exp.get("skills_used", []),
                    achievements=work_exp.get("achievements", []),
                    sort_order=idx,
                    commit=False,
                )

                projects = work_exp.get("projects", [])
                for p_idx, project in enumerate(projects):
                    await self.add_project(
                        user_id=user_id,
                        work_experience_id=exp_id,
                        title=project.get("name", project.get("title", "")),
                        description=project.get("description"),
                        url=project.get("url"),
                        skills_used=project.get("technologies", []),
                        start_date=project.get("start_date"),
                        end_date=project.get("end_date") or None,
                        sort_order=p_idx,
                        commit=False,
                    )

            # -------------------------
            # 4. Commit once
            # -------------------------
            await self.session.commit()
            LOGGER.info(f"Successfully saved complete profile for user {user_id}")

            await self.update_user_resume_status(user_id, "completed")

        except Exception as e:
            LOGGER.error(
                f"Error saving profile and resume for user {user_id}: {str(e)}"
            )
            try:
                await self.session.rollback()
            except Exception as rollback_error:
                LOGGER.warning(f"Error during rollback: {str(rollback_error)}")
            raise

    # ══════════════════════════════════════════════════════════════════════════════
    # JSON PROFILE IMPORT OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def import_profile_from_json(
        self,
        user_id: UUID,
        json_file_path: str,
    ) -> dict:
        """
        Comprehensive method to import and insert complete profile from JSON file.

        Maps JSON fields to database tables:
        - jobseeker_profiles: personal profile information
        - skills + jobseeker_skills: skill extraction and assignment
        - work_experiences: employment history
        - projects: projects from work experience
        - education: educational background

        Args:
            user_id: User UUID to associate data with
            json_file_path: Path to parsed resume JSON file

        Returns:
            Dictionary with insertion statistics:
            {
                'profile_id': UUID,
                'skills_count': int,
                'work_experiences_count': int,
                'projects_count': int,
                'education_count': int,
                'status': 'success' | 'partial' | 'failed'
            }
        """
        import json
        from pathlib import Path

        try:
            # 1. Read and parse JSON file
            json_path = Path(json_file_path)
            if not json_path.exists():
                raise FileNotFoundError(f"JSON file not found: {json_file_path}")

            with open(json_path, "r", encoding="utf-8") as f:
                profile_data = json.load(f)

            LOGGER.info(f"Loaded JSON profile from {json_file_path}")

            # 2. Insert/Update jobseeker profile
            await self.upsert_jobseeker_profile(user_id, profile_data)
            LOGGER.info(f"Upserted jobseeker profile for user {user_id}")

            # 3. Insert skills
            skills_count = await self._insert_skills(user_id, profile_data)

            # 4. Insert languages
            languages = profile_data.get("languages", [])
            languages_count = (
                len(
                    set(
                        lang.lower().strip()
                        for lang in languages
                        if isinstance(lang, str) and lang.strip()
                    )
                )
                if languages
                else 0
            )
            if languages:
                await self.bulk_add_user_languages(
                    user_id=user_id,
                    language_names=languages,
                    commit=False,
                )

            # 5. Insert work experiences with nested projects
            work_exp_count, projects_count = await self._insert_work_experiences(
                user_id, profile_data
            )

            # 6. Insert education
            education_count = await self._insert_education(user_id, profile_data)

            # 7. Insert standalone projects (if any)
            standalone_projects = profile_data.get("projects", [])
            if standalone_projects:
                for idx, project in enumerate(standalone_projects):
                    try:
                        await self.add_project(
                            user_id=user_id,
                            title=project.get("name", project.get("title", "")),
                            description=project.get("description"),
                            url=project.get("url"),
                            repo_url=project.get("repo_url"),
                            skills_used=project.get("technologies", []),
                            start_date=project.get("start_date"),
                            end_date=project.get("end_date") or None,
                            sort_order=idx,
                        )
                        projects_count += 1
                    except Exception as e:
                        LOGGER.warning(f"Failed to add project: {str(e)}")

            status = "success"
            LOGGER.info(
                f"Successfully imported profile for user {user_id}. "
                f"Skills: {skills_count}, Languages: {languages_count}, Work Experience: {work_exp_count}, "
                f"Projects: {projects_count}, Education: {education_count}"
            )

            return {
                "user_id": str(user_id),
                "skills_count": skills_count,
                "languages_count": languages_count,
                "work_experiences_count": work_exp_count,
                "projects_count": projects_count,
                "education_count": education_count,
                "status": status,
            }

        except FileNotFoundError as e:
            LOGGER.error(f"File error: {str(e)}")
            raise
        except json.JSONDecodeError as e:
            LOGGER.error(f"JSON parsing error: {str(e)}")
            raise
        except Exception as e:
            LOGGER.error(f"Error importing profile from JSON: {str(e)}", exc_info=True)
            await self.session.rollback()
            raise

    async def _insert_skills(self, user_id: UUID, profile_data: dict) -> int:
        """Extract and insert skills from profile data."""
        try:
            skills = profile_data.get("skills", [])
            if not skills:
                return 0

            await self.bulk_add_user_skills(
                user_id=user_id,
                skill_names=skills,
                level="intermediate",
            )
            LOGGER.info(f"Inserted {len(skills)} skills for user {user_id}")
            return len(skills)

        except Exception as e:
            LOGGER.warning(f"Error inserting skills: {str(e)}")
            return 0

    async def _insert_work_experiences(
        self, user_id: UUID, profile_data: dict
    ) -> tuple[int, int]:
        """Extract and insert work experiences with nested projects."""
        work_exp_count = 0
        projects_count = 0

        try:
            work_experiences = profile_data.get("work_experiences", [])

            for exp_idx, exp in enumerate(work_experiences):
                try:
                    # Insert work experience
                    exp_id = await self.add_work_experience(
                        user_id=user_id,
                        company_name=exp.get("company_name", ""),
                        title=exp.get("title", ""),
                        location=exp.get("location"),
                        start_date=exp.get("start_date"),
                        end_date=exp.get("end_date") or None,
                        is_current=exp.get("is_current", False),
                        description=exp.get("description"),
                        skills_used=exp.get("skills_used", []),
                        achievements=exp.get("achievements", []),
                        sort_order=exp_idx,
                    )
                    work_exp_count += 1
                    LOGGER.info(f"Inserted work experience {exp_id} for user {user_id}")

                    # Insert nested projects from this work experience
                    nested_projects = exp.get("projects", [])
                    for proj_idx, project in enumerate(nested_projects):
                        try:
                            proj_id = await self.add_project(
                                user_id=user_id,
                                work_experience_id=exp_id,
                                title=project.get("name", project.get("title", "")),
                                description=project.get("description"),
                                url=project.get("url"),
                                repo_url=project.get("repo_url"),
                                skills_used=project.get("technologies", []),
                                start_date=project.get("start_date"),
                                end_date=project.get("end_date") or None,
                                sort_order=proj_idx,
                            )
                            projects_count += 1
                            LOGGER.debug(
                                f"Inserted project {proj_id} for work exp {exp_id}"
                            )

                            # Add project skills
                            if project.get("technologies"):
                                await self.add_project_skills(
                                    project_id=proj_id,
                                    skill_names=project.get("technologies", []),
                                )
                        except Exception as e:
                            LOGGER.warning(f"Failed to insert project: {str(e)}")

                except Exception as e:
                    LOGGER.warning(f"Failed to insert work experience: {str(e)}")

            if work_exp_count > 0:
                LOGGER.info(
                    f"Inserted {work_exp_count} work experiences and "
                    f"{projects_count} projects for user {user_id}"
                )
            return work_exp_count, projects_count

        except Exception as e:
            LOGGER.warning(f"Error inserting work experiences: {str(e)}")
            return 0, 0

    async def _insert_education(self, user_id: UUID, profile_data: dict) -> int:
        """Extract and insert education records from profile data."""
        education_count = 0

        try:
            education_list = profile_data.get("education", [])

            for edu_idx, edu in enumerate(education_list):
                try:
                    # field_of_study conversion is now handled in add_education repository method
                    field_of_study = edu.get("field_of_study")

                    edu_id = await self.add_education(
                        user_id=user_id,
                        institution=edu.get("institution", ""),
                        degree=edu.get("degree"),
                        field_of_study=field_of_study,
                        grade=edu.get("grade"),
                        start_year=edu.get("start_year"),
                        end_year=edu.get("end_year"),
                        is_current=edu.get("is_current", False),
                        description=edu.get("description"),
                        sort_order=edu_idx,
                    )
                    education_count += 1
                    LOGGER.debug(f"Inserted education {edu_id} for user {user_id}")

                except Exception as e:
                    LOGGER.warning(f"Failed to insert education record: {str(e)}")

            if education_count > 0:
                LOGGER.info(
                    f"Inserted {education_count} education records for user {user_id}"
                )
            return education_count

        except Exception as e:
            LOGGER.warning(f"Error inserting education: {str(e)}")
            return 0

    async def get_job_description_by_job_id(self, id: int) -> Optional[str]:
        """
        Fetch job description from jobs table using job ID.

        Args:
            id: Job ID to search for

        Returns:
            Job description if found, None otherwise
        """
        try:
            query = text("SELECT description FROM job_postings WHERE id = :id LIMIT 1")
            result = await self.session.execute(query, {"id": int(id)})
            row = result.fetchone()

            if row:
                return row[0]

            LOGGER.warning(f"No job description found for Job ID: {id}")
            return None

        except Exception as e:
            LOGGER.error(f"Error fetching job description by job ID: {str(e)}")
            raise

    async def save_job_embedding(
        self, job_id: int, job_embedding: list[float]
    ) -> bool:
        """
        Add or update job embedding in the database.

        Args:
            job_id: ID of the job
            job_embedding: List of floats representing the job embedding

        Returns:
            True if job embedding was saved successfully, False otherwise
        """
        try:

            query = text(
                f"""
                UPDATE job_postings SET job_embedding = :job_embedding WHERE id = :job_id
            """
            )
            result = await self.session.execute(
                query, {"job_embedding": str(job_embedding), "job_id": int(job_id)}
            )

            await self.session.commit()

            LOGGER.debug(f"Saved job embedding for job {job_id}")

        except Exception as e:
            LOGGER.error(f"Error saving job embedding for job {job_id}: {str(e)}")
            await self.session.rollback()
            raise
