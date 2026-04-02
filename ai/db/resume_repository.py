"""
Resume Repository Module
Handles all database operations for resume data insertion.
"""

import logging
from typing import Optional
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

LOGGER = logging.getLogger(__name__)


class ResumeRepository:
    """Repository for resume-related database operations."""

    def __init__(self, session: AsyncSession):
        """Initialize repository with database session."""
        self.session = session

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
            query = text(
                "SELECT id FROM users WHERE phone = :phone LIMIT 1"
            )
            result = await self.session.execute(query, {"phone": phone})
            row = result.fetchone()
            
            if row:
                return UUID(str(row[0]))
            
            LOGGER.warning(f"No user found with phone: {phone}")
            return None
            
        except Exception as e:
            LOGGER.error(f"Error fetching user by phone: {str(e)}")
            raise

    # ══════════════════════════════════════════════════════════════════════════════
    # SKILL OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def get_skill_by_name(self, skill_name: str) -> Optional[UUID]:
        """
        Get skill ID by normalized name.
        
        Args:
            skill_name: Skill name to search for
            
        Returns:
            UUID of the skill if found, None otherwise
        """
        try:
            skill_name_normalized = skill_name.lower().strip()
            
            query = text(
                "SELECT id FROM skills WHERE name = :name LIMIT 1"
            )
            result = await self.session.execute(query, {"name": skill_name_normalized})
            row = result.fetchone()
            
            return UUID(str(row[0])) if row else None
            
        except Exception as e:
            LOGGER.error(f"Error fetching skill: {str(e)}")
            raise

    async def create_skill(self, skill_name: str, category: Optional[str] = None) -> UUID:
        """
        Create a new skill.
        
        Args:
            skill_name: Name of the skill
            category: Optional category (e.g., "backend", "frontend")
            
        Returns:
            UUID of the created skill
        """
        try:
            skill_name_normalized = skill_name.lower().strip()
            
            query = text("""
                INSERT INTO skills (name, category, is_trending, created_at)
                VALUES (:name, :category, FALSE, NOW())
                RETURNING id
            """)
            
            result = await self.session.execute(
                query,
                {"name": skill_name_normalized, "category": category}
            )
            row = result.fetchone()
            await self.session.commit()
            
            skill_id = UUID(str(row[0]))
            LOGGER.info(f"Created skill: {skill_name} ({skill_id})")
            return skill_id
            
        except Exception as e:
            LOGGER.error(f"Error creating skill '{skill_name}': {str(e)}")
            await self.session.rollback()
            raise

    async def get_or_create_skill(self, skill_name: str, category: Optional[str] = None) -> UUID:
        """
        Get existing skill or create new one.
        
        Args:
            skill_name: Name of the skill
            category: Optional category
            
        Returns:
            UUID of the skill
        """
        skill_id = await self.get_skill_by_name(skill_name)
        
        if skill_id:
            return skill_id
        
        return await self.create_skill(skill_name, category)

    # ══════════════════════════════════════════════════════════════════════════════
    # JOBSEEKER PROFILE OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def upsert_jobseeker_profile(self, user_id: UUID, profile_data: dict) -> None:
        """
        Insert or update jobseeker profile.
        
        Args:
            user_id: User UUID
            profile_data: Dictionary containing profile information
        """
        try:
            query = text("""
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
            """)
            
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
                    "salary_currency": profile_data.get("salary_currency", "INR"),
                    "linkedin_url": profile_data.get("linkedin_url"),
                    "github_url": profile_data.get("github_url"),
                    "portfolio_url": profile_data.get("portfolio_url"),
                }
            )
            await self.session.commit()
            LOGGER.info(f"Upserted jobseeker profile for user {user_id}")
            
        except Exception as e:
            LOGGER.error(f"Error upserting jobseeker profile: {str(e)}")
            await self.session.rollback()
            raise

    # ══════════════════════════════════════════════════════════════════════════════
    # SKILL ASSIGNMENT OPERATIONS
    # ══════════════════════════════════════════════════════════════════════════════

    async def add_user_skill(
        self,
        user_id: UUID,
        skill_id: UUID,
        level: str = "intermediate",
        years: Optional[float] = None,
    ) -> None:
        """
        Add skill to user (with upsert).
        
        Args:
            user_id: User UUID
            skill_id: Skill UUID
            level: Proficiency level (beginner, intermediate, advanced)
            years: Years of experience with this skill
        """
        try:
            query = text("""
                INSERT INTO jobseeker_skills (user_id, skill_id, level, years, created_at)
                VALUES (:user_id, :skill_id, :level, :years, NOW())
                ON CONFLICT (user_id, skill_id) DO UPDATE SET
                    level = EXCLUDED.level,
                    years = EXCLUDED.years
            """)
            
            await self.session.execute(
                query,
                {
                    "user_id": str(user_id),
                    "skill_id": str(skill_id),
                    "level": level,
                    "years": years,
                }
            )
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
        degree: Optional[str] = None,
        field_of_study: Optional[str] = None,
        grade: Optional[str] = None,
        start_year: Optional[int] = None,
        end_year: Optional[int] = None,
        is_current: bool = False,
        description: Optional[str] = None,
        sort_order: int = 0,
    ) -> UUID:
        """
        Add education record for user.
        
        Args:
            user_id: User UUID
            institution: Name of institution
            degree: Degree obtained
            field_of_study: Field of study
            grade: Grade/GPA
            start_year: Start year
            end_year: End year
            is_current: Whether currently studying
            description: Additional description
            sort_order: Display order
            
        Returns:
            UUID of the created education record
        """
        try:
            query = text("""
                INSERT INTO education (
                    user_id, institution, degree, field_of_study, grade,
                    start_year, end_year, is_current, description, sort_order, created_at
                ) VALUES (
                    :user_id, :institution, :degree, :field_of_study, :grade,
                    :start_year, :end_year, :is_current, :description, :sort_order, NOW()
                )
                RETURNING id
            """)
            
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
                }
            )
            row = result.fetchone()
            await self.session.commit()
            
            education_id = UUID(str(row[0]))
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
    ) -> UUID:
        """
        Add work experience record for user.
        
        Args:
            user_id: User UUID
            company_name: Company name
            title: Job title
            location: Job location
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            is_current: Whether currently working
            description: Job description
            skills_used: List of skills used
            achievements: List of achievements
            sort_order: Display order
            
        Returns:
            UUID of the created work experience record
        """
        try:
            query = text("""
                INSERT INTO work_experiences (
                    user_id, company_name, title, location, start_date, end_date,
                    is_current, description, skills_used, achievements, sort_order, created_at
                ) VALUES (
                    :user_id, :company_name, :title, :location, :start_date, :end_date,
                    :is_current, :description, :skills_used, :achievements, :sort_order, NOW()
                )
                RETURNING id
            """)
            
            result = await self.session.execute(
                query,
                {
                    "user_id": str(user_id),
                    "company_name": company_name,
                    "title": title,
                    "location": location,
                    "start_date": start_date,
                    "end_date": end_date,
                    "is_current": is_current,
                    "description": description,
                    "skills_used": skills_used or [],
                    "achievements": achievements or [],
                    "sort_order": sort_order,
                }
            )
            row = result.fetchone()
            await self.session.commit()
            
            exp_id = UUID(str(row[0]))
            LOGGER.debug(f"Added work experience for user {user_id}")
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
        description: Optional[str] = None,
        url: Optional[str] = None,
        repo_url: Optional[str] = None,
        skills_used: Optional[list] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        sort_order: int = 0,
    ) -> UUID:
        """
        Add project record for user.
        
        Args:
            user_id: User UUID
            title: Project title
            description: Project description
            url: Project URL
            repo_url: Repository URL
            skills_used: List of technologies/skills used
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            sort_order: Display order
            
        Returns:
            UUID of the created project record
        """
        try:
            query = text("""
                INSERT INTO projects (
                    user_id, title, description, url, repo_url, skills_used,
                    start_date, end_date, sort_order, created_at
                ) VALUES (
                    :user_id, :title, :description, :url, :repo_url, :skills_used,
                    :start_date, :end_date, :sort_order, NOW()
                )
                RETURNING id
            """)
            
            result = await self.session.execute(
                query,
                {
                    "user_id": str(user_id),
                    "title": title,
                    "description": description,
                    "url": url,
                    "repo_url": repo_url,
                    "skills_used": skills_used or [],
                    "start_date": start_date,
                    "end_date": end_date,
                    "sort_order": sort_order,
                }
            )
            row = result.fetchone()
            await self.session.commit()
            
            project_id = UUID(str(row[0]))
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
        file_size_bytes: int,
        mime_type: str,
        parsed_skills: Optional[list] = None,
        parsed_experience_years: Optional[float] = None,
        parsed_summary: Optional[str] = None,
        is_primary: bool = False,
    ) -> UUID:
        """
        Add resume file record.
        
        Args:
            user_id: User UUID
            file_name: Original file name
            file_url: S3 or cloud storage URL
            file_size_bytes: File size in bytes
            mime_type: MIME type of file
            parsed_skills: Extracted skills from resume
            parsed_experience_years: Extracted years of experience
            parsed_summary: Extracted summary
            is_primary: Whether this is the primary resume
            
        Returns:
            UUID of the created resume record
        """
        try:
            query = text("""
                INSERT INTO resumes (
                    user_id, file_name, file_url, file_size_bytes, mime_type,
                    parsed_skills, parsed_experience_years, parsed_summary,
                    is_primary, parsed_at, created_at, updated_at
                ) VALUES (
                    :user_id, :file_name, :file_url, :file_size_bytes, :mime_type,
                    :parsed_skills, :parsed_experience_years, :parsed_summary,
                    :is_primary, NOW(), NOW(), NOW()
                )
                ON CONFLICT (user_id, file_url) DO UPDATE SET
                    file_name = EXCLUDED.file_name,
                    file_size_bytes = EXCLUDED.file_size_bytes,
                    mime_type = EXCLUDED.mime_type,
                    parsed_skills = EXCLUDED.parsed_skills,
                    parsed_experience_years = EXCLUDED.parsed_experience_years,
                    parsed_summary = EXCLUDED.parsed_summary,
                    is_primary = EXCLUDED.is_primary,
                    parsed_at = NOW(),
                    updated_at = NOW()
                RETURNING id
            """)
            
            result = await self.session.execute(
                query,
                {
                    "user_id": str(user_id),
                    "file_name": file_name,
                    "file_url": file_url,
                    "file_size_bytes": file_size_bytes,
                    "mime_type": mime_type,
                    "parsed_skills": parsed_skills or [],
                    "parsed_experience_years": parsed_experience_years,
                    "parsed_summary": parsed_summary,
                    "is_primary": is_primary,
                }
            )
            row = result.fetchone()
            await self.session.commit()
            
            resume_id = UUID(str(row[0]))
            LOGGER.info(f"Added/Updated resume for user {user_id}")
            return resume_id
            
        except Exception as e:
            LOGGER.error(f"Error adding resume: {str(e)}")
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
            
            LOGGER.info(f"Processing {len(normalized_skills)} unique skills for user {user_id}")
            
            # Get existing skills in one query
            skill_list = list(normalized_skills)
            placeholders = ", ".join([f"'{s}'" for s in skill_list])
            
            query = text(f"""
                SELECT id, name FROM skills WHERE name IN ({placeholders})
            """)
            result = await self.session.execute(query)
            existing_skills = {row[1]: row[0] for row in result.fetchall()}
            
            # Find skills to create
            skills_to_create = [
                skill for skill in normalized_skills 
                if skill not in existing_skills
            ]
            
            # Create new skills in bulk
            created_skill_ids = {}
            if skills_to_create:
                for skill_name in skills_to_create:
                    insert_query = text("""
                        INSERT INTO skills (name, is_trending, created_at)
                        VALUES (:name, FALSE, NOW())
                        RETURNING id
                    """)
                    insert_result = await self.session.execute(
                        insert_query,
                        {"name": skill_name}
                    )
                    row = insert_result.fetchone()
                    if row:
                        created_skill_ids[skill_name] = UUID(str(row[0]))
                
                LOGGER.info(f"Created {len(created_skill_ids)} new skills")
            
            # Combine existing and newly created skills
            all_skill_ids = {**existing_skills, **created_skill_ids}
            
            # Bulk insert user skills (upsert)
            for skill_name, skill_id in all_skill_ids.items():
                upsert_query = text("""
                    INSERT INTO jobseeker_skills (user_id, skill_id, level, created_at)
                    VALUES (:user_id, :skill_id, :level, NOW())
                    ON CONFLICT (user_id, skill_id) DO UPDATE SET
                        level = EXCLUDED.level
                """)
                await self.session.execute(
                    upsert_query,
                    {
                        "user_id": str(user_id),
                        "skill_id": str(skill_id),
                        "level": level,
                    }
                )
            
            await self.session.commit()
            LOGGER.info(f"Successfully added {len(all_skill_ids)} skills to user {user_id}")
            
        except Exception as e:
            LOGGER.error(f"Error bulk adding user skills: {str(e)}")
            await self.session.rollback()
            raise

    async def add_project_skills(
        self,
        project_id: UUID,
        skill_names: list,
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
            
            query = text(f"""
                SELECT id, name FROM skills WHERE name IN ({placeholders})
            """)
            result = await self.session.execute(query)
            existing_skills = {row[1]: row[0] for row in result.fetchall()}
            
            # Find skills to create
            skills_to_create = [
                skill for skill in normalized_skills 
                if skill not in existing_skills
            ]
            
            # Create new skills
            created_skill_ids = {}
            if skills_to_create:
                for skill_name in skills_to_create:
                    insert_query = text("""
                        INSERT INTO skills (name, is_trending, created_at)
                        VALUES (:name, FALSE, NOW())
                        RETURNING id
                    """)
                    insert_result = await self.session.execute(
                        insert_query,
                        {"name": skill_name}
                    )
                    row = insert_result.fetchone()
                    if row:
                        created_skill_ids[skill_name] = UUID(str(row[0]))
            
            # Combine existing and newly created skills
            all_skill_ids = {**existing_skills, **created_skill_ids}
            
            # Bulk insert project skills (upsert)
            for skill_name, skill_id in all_skill_ids.items():
                upsert_query = text("""
                    INSERT INTO project_skills (project_id, skill_id, created_at)
                    VALUES (:project_id, :skill_id, NOW())
                    ON CONFLICT (project_id, skill_id) DO NOTHING
                """)
                await self.session.execute(
                    upsert_query,
                    {
                        "project_id": str(project_id),
                        "skill_id": str(skill_id),
                    }
                )
            
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
            
            query = text(f"""
                SELECT id, name FROM skills WHERE name IN ({placeholders})
            """)
            result = await self.session.execute(query)
            existing_skills = {row[1]: row[0] for row in result.fetchall()}
            
            # Find skills to create
            skills_to_create = [
                skill for skill in normalized_skills 
                if skill not in existing_skills
            ]
            
            # Create new skills
            created_skill_ids = {}
            if skills_to_create:
                for skill_name in skills_to_create:
                    insert_query = text("""
                        INSERT INTO skills (name, is_trending, created_at)
                        VALUES (:name, FALSE, NOW())
                        RETURNING id
                    """)
                    insert_result = await self.session.execute(
                        insert_query,
                        {"name": skill_name}
                    )
                    row = insert_result.fetchone()
                    if row:
                        created_skill_ids[skill_name] = UUID(str(row[0]))
            
            # Combine existing and newly created skills
            all_skill_ids = {**existing_skills, **created_skill_ids}
            
            # Bulk insert work experience skills (upsert)
            for skill_name, skill_id in all_skill_ids.items():
                upsert_query = text("""
                    INSERT INTO work_experience_skills (work_experience_id, skill_id, created_at)
                    VALUES (:work_experience_id, :skill_id, NOW())
                    ON CONFLICT (work_experience_id, skill_id) DO NOTHING
                """)
                await self.session.execute(
                    upsert_query,
                    {
                        "work_experience_id": str(work_experience_id),
                        "skill_id": str(skill_id),
                    }
                )
            
            await self.session.commit()
            LOGGER.debug(f"Added {len(all_skill_ids)} skills to work experience {work_experience_id}")
            
        except Exception as e:
            LOGGER.error(f"Error adding work experience skills: {str(e)}")
            await self.session.rollback()
            raise
