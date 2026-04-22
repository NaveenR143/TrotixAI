"""
Profile Repository - Database queries for user profile data
Handles all database operations related to user profiles
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import joinedload, selectinload
from uuid import UUID
from typing import Optional

from ai.models.orm_models import (
    User,
    JobseekerProfile,
    WorkExperience,
    Education,
    Certification,
    JobseekerSkill,
    Skill,
    UserLanguage,
    Language,
    Company,
    Project,
    Industry,
)


class ProfileRepository:
    """Database queries for user profile information"""

    @staticmethod
    async def get_user_profile_by_phone(
        phone: str, session: AsyncSession
    ) -> Optional[dict]:
        """
        Fetch complete user profile by phone number

        Args:
            phone: User phone number
            session: Async database session

        Returns:
            Dictionary with complete profile data or None
        """
        try:
            query = (
                select(User)
                .where(User.phone == phone)
                .options(
                    joinedload(User.jobseeker_profile),
                    joinedload(User.work_experiences).joinedload(WorkExperience.company),
                    joinedload(User.projects),
                    joinedload(User.education),
                    joinedload(User.certifications),
                    joinedload(User.jobseeker_skills).joinedload(JobseekerSkill.skill),
                    joinedload(User.user_languages).joinedload(UserLanguage.language),
                    joinedload(User.industry),
                )
            )

            result = await session.execute(query)
            user = result.scalars().first()

            if not user:
                return None

            return await ProfileRepository._build_profile_response(user, session)

        except Exception as e:
            print(f"Error fetching profile by phone: {str(e)}")
            raise

    @staticmethod
    async def get_user_profile_by_id(
        user_id: UUID, session: AsyncSession
    ) -> Optional[dict]:
        """
        Fetch complete user profile by user ID

        Args:
            user_id: UUID of the user
            session: Async database session

        Returns:
            Dictionary with complete profile data or None
        """
        try:
            query = (
                select(User)
                .where(User.id == user_id)
                .options(
                    joinedload(User.jobseeker_profile),
                    joinedload(User.work_experiences).joinedload(WorkExperience.company),
                    joinedload(User.projects),
                    joinedload(User.education),
                    joinedload(User.certifications),
                    joinedload(User.jobseeker_skills).joinedload(JobseekerSkill.skill),
                    joinedload(User.user_languages).joinedload(UserLanguage.language),
                    joinedload(User.industry),
                )
            )

            result = await session.execute(query)
            user = result.scalars().first()

            if not user:
                return None

            return await ProfileRepository._build_profile_response(user, session)

        except Exception as e:
            print(f"Error fetching profile by ID: {str(e)}")
            raise

    @staticmethod
    async def _build_profile_response(user: User, session: AsyncSession) -> dict:
        """
        Build complete profile response from user and related entities

        Args:
            user: User ORM object
            session: Async database session

        Returns:
            Dictionary with complete profile data
        """
        profile = user.jobseeker_profile if hasattr(user, "jobseeker_profile") else None

        # Extract basic user data
        user_data = {
            "id": user.id,
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "is_email_verified": user.is_email_verified,
            "is_phone_verified": user.is_phone_verified,
            "industry_id": user.industry_id,
            "industry_name": user.industry.name if user.industry else None,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
        }

        # Extract profile data
        if profile:
            user_data.update(
                {
                    "headline": profile.headline,
                    "summary": profile.summary,
                    "gender": profile.gender,
                    "date_of_birth": profile.date_of_birth,
                    "current_location": profile.current_location,
                    "preferred_locations": profile.preferred_locations or [],
                    "years_of_experience": profile.years_of_experience,
                    "notice_period_days": profile.notice_period_days,
                    "current_salary": profile.current_salary,
                    "expected_salary": profile.expected_salary,
                    "salary_currency": profile.salary_currency,
                    "is_actively_looking": profile.is_actively_looking,
                    "profile_completion": profile.profile_completion or 0,
                    "linkedin_url": profile.linkedin_url,
                    "github_url": profile.github_url,
                    "portfolio_url": profile.portfolio_url,
                    "marital_status": profile.marital_status,
                }
            )
        else:
            # Default values if profile doesn't exist
            user_data.update(
                {
                    "headline": None,
                    "summary": None,
                    "gender": None,
                    "date_of_birth": None,
                    "current_location": None,
                    "preferred_locations": [],
                    "years_of_experience": None,
                    "notice_period_days": None,
                    "current_salary": None,
                    "expected_salary": None,
                    "salary_currency": "INR",
                    "is_actively_looking": True,
                    "profile_completion": 0,
                    "linkedin_url": None,
                    "github_url": None,
                    "portfolio_url": None,
                    "marital_status": None,
                }
            )

        # Extract experience
        experience_list = []
        if hasattr(user, "work_experiences"):
            for exp in user.work_experiences:
                experience_list.append(
                    {
                        "id": exp.id,
                        "company_id": exp.company_id,
                        "company_name": exp.company.name if exp.company else None,
                        "title": exp.title,
                        "location": exp.location,
                        "start_date": exp.start_date,
                        "end_date": exp.end_date,
                        "is_current": exp.is_current,
                        "description": exp.description,
                        "skills_used": exp.skills_used or [],
                    }
                )
        user_data["experience"] = experience_list

        # Extract education
        education_list = []
        if hasattr(user, "education"):
            for edu in user.education:
                education_list.append(
                    {
                        "id": edu.id,
                        "institution": edu.institution,
                        "degree": edu.degree,
                        "field_of_study": edu.field_of_study,
                        "start_year": edu.start_year,
                        "end_year": edu.end_year,
                        "is_current": edu.is_current,
                        "description": edu.description,
                    }
                )
        user_data["education"] = education_list

        # Extract certifications
        certifications_list = []
        if hasattr(user, "certifications"):
            for cert in user.certifications:
                certifications_list.append(
                    {
                        "id": cert.id,
                        "name": cert.name,
                        "issuer": cert.issuer,
                        "issue_date": cert.issue_date,
                        "expiry_date": cert.expiry_date,
                        "credential_url": cert.credential_url,
                    }
                )
        user_data["certifications"] = certifications_list

        # Extract skills
        skills_list = []
        if hasattr(user, "jobseeker_skills"):
            for job_skill in user.jobseeker_skills:
                if job_skill.skill:
                    skills_list.append(
                        {
                            "id": job_skill.id,
                            "name": job_skill.skill.name,
                            "level": job_skill.level,
                            "years": job_skill.years,
                            "is_primary": job_skill.is_primary,
                        }
                    )
        user_data["skills"] = skills_list

        # Extract projects
        projects_list = []
        if hasattr(user, "projects"):
            for project in user.projects:
                projects_list.append(
                    {
                        "id": project.id,
                        "work_experience_id": project.work_experience_id,
                        "title": project.title,
                        "description": project.description,
                        "url": project.url,
                        "repo_url": project.repo_url,
                        "skills_used": project.skills_used or [],
                        "start_date": project.start_date,
                        "end_date": project.end_date,
                    }
                )
        user_data["projects"] = projects_list

        # Extract languages
        languages_list = []
        if hasattr(user, "user_languages"):
            for user_lang in user.user_languages:
                if user_lang.language:
                    languages_list.append(
                        {
                            "language": user_lang.language.language,
                        }
                    )
        user_data["languages"] = languages_list

        return user_data

    # ─────────────────────────────────────────────────────────────────────────
    # Update Methods for Block-by-Block Editing
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    async def update_personal_information(
        user_id: UUID, update_data: dict, session: AsyncSession
    ) -> dict:
        """
        Update user personal information (User + JobseekerProfile)

        Args:
            user_id: User UUID
            update_data: Dictionary with fields to update
            session: Async database session

        Returns:
            Updated profile data
        """
        try:
            # Fetch user
            user_query = select(User).where(User.id == user_id)
            result = await session.execute(user_query)
            user = result.scalars().first()

            if not user:
                raise ValueError("User not found")

            # Update user fields
            if "email" in update_data and update_data["email"]:
                user.email = update_data["email"]
            if "phone" in update_data and update_data["phone"]:
                user.phone = update_data["phone"]
            if "full_name" in update_data and update_data["full_name"]:
                user.full_name = update_data["full_name"]

            # Ensure jobseeker profile exists
            if not user.jobseeker_profile:
                jobseeker_profile = JobseekerProfile(user_id=user_id)
                session.add(jobseeker_profile)
                user.jobseeker_profile = jobseeker_profile

            # Update profile fields
            profile = user.jobseeker_profile
            profile_fields = [
                "headline",
                "current_location",
                "preferred_locations",
                "date_of_birth",
                "gender",
                "portfolio_url",
                "linkedin_url",
                "github_url",
            ]

            for field in profile_fields:
                if field in update_data and update_data[field] is not None:
                    setattr(profile, field, update_data[field])

            await session.commit()

            # Fetch and return updated profile
            return await ProfileRepository.get_user_profile_by_id(user_id, session)

        except Exception as e:
            await session.rollback()
            raise

    @staticmethod
    async def update_work_experience(
        user_id: UUID,
        experience_data: dict,
        session: AsyncSession,
        experience_id: Optional[int] = None,
    ) -> dict:
        """
        Add or update work experience

        Args:
            user_id: User UUID
            experience_data: Experience details
            session: Async database session
            experience_id: ID of existing experience (for updates)

        Returns:
            Updated profile data
        """
        try:
            if experience_id:
                # Update existing experience
                query = select(WorkExperience).where(
                    WorkExperience.id == experience_id,
                    WorkExperience.user_id == user_id,
                )
                result = await session.execute(query)
                experience = result.scalars().first()

                if not experience:
                    raise ValueError("Experience not found")

                # Update fields
                for field, value in experience_data.items():
                    if field != "experience_id" and hasattr(experience, field):
                        setattr(experience, field, value)
            else:
                # Create new experience
                experience = WorkExperience(
                    user_id=user_id,
                    **{
                        k: v for k, v in experience_data.items() if k != "experience_id"
                    },
                )
                session.add(experience)

            await session.commit()
            return await ProfileRepository.get_user_profile_by_id(user_id, session)

        except Exception as e:
            await session.rollback()
            raise

    @staticmethod
    async def update_education(
        user_id: UUID,
        education_data: dict,
        session: AsyncSession,
        education_id: Optional[str] = None,
    ) -> dict:
        """
        Add or update education

        Args:
            user_id: User UUID
            education_data: Education details
            session: Async database session
            education_id: ID of existing education (for updates)

        Returns:
            Updated profile data
        """
        try:
            if education_id:
                # Update existing education
                query = select(Education).where(
                    Education.id == education_id, Education.user_id == user_id
                )
                result = await session.execute(query)
                education = result.scalars().first()

                if not education:
                    raise ValueError("Education not found")

                # Update fields
                for field, value in education_data.items():
                    if field != "education_id" and hasattr(education, field):
                        setattr(education, field, value)
            else:
                # Create new education
                education = Education(
                    user_id=user_id,
                    **{k: v for k, v in education_data.items() if k != "education_id"},
                )
                session.add(education)

            await session.commit()
            return await ProfileRepository.get_user_profile_by_id(user_id, session)

        except Exception as e:
            await session.rollback()
            raise

    @staticmethod
    async def update_project(
        user_id: UUID,
        project_data: dict,
        session: AsyncSession,
        project_id: Optional[int] = None,
    ) -> dict:
        """
        Add or update project

        Args:
            user_id: User UUID
            project_data: Project details
            session: Async database session
            project_id: ID of existing project (for updates)

        Returns:
            Updated profile data
        """
        try:
            if project_id:
                # Update existing project
                query = select(Project).where(
                    Project.id == project_id, Project.user_id == user_id
                )
                result = await session.execute(query)
                project = result.scalars().first()

                if not project:
                    raise ValueError("Project not found")

                # Update fields
                for field, value in project_data.items():
                    if field != "project_id" and hasattr(project, field):
                        setattr(project, field, value)
            else:
                # Create new project
                project = Project(
                    user_id=user_id,
                    **{k: v for k, v in project_data.items() if k != "project_id"},
                )
                session.add(project)

            await session.commit()
            return await ProfileRepository.get_user_profile_by_id(user_id, session)

        except Exception as e:
            await session.rollback()
            raise

    @staticmethod
    async def update_skills(
        user_id: UUID, skill_names: list, session: AsyncSession
    ) -> dict:
        """
        Update user skills (replace all existing skills)

        Args:
            user_id: User UUID
            skill_names: List of skill names
            session: Async database session

        Returns:
            Updated profile data
        """
        try:
            # Delete existing skills for this user
            await session.execute(
                select(JobseekerSkill).where(JobseekerSkill.user_id == user_id)
            )
            existings = (
                (
                    await session.execute(
                        select(JobseekerSkill).where(JobseekerSkill.user_id == user_id)
                    )
                )
                .scalars()
                .all()
            )

            for existing in existings:
                await session.delete(existing)

            # Add new skills
            for skill_name in skill_names:
                # Get or create skill
                skill_query = select(Skill).where(Skill.name == skill_name)
                result = await session.execute(skill_query)
                skill = result.scalars().first()

                if not skill:
                    skill = Skill(name=skill_name)
                    session.add(skill)
                    await session.flush()

                # Create jobseeker_skill association
                jobseeker_skill = JobseekerSkill(
                    user_id=user_id, skill_id=skill.id, level="intermediate"
                )
                session.add(jobseeker_skill)

            await session.commit()
            return await ProfileRepository.get_user_profile_by_id(user_id, session)

        except Exception as e:
            await session.rollback()
            raise

    @staticmethod
    async def update_languages(
        user_id: UUID, language_names: list, session: AsyncSession
    ) -> dict:
        """
        Update user languages (replace all existing languages)

        Args:
            user_id: User UUID
            language_names: List of language names
            session: Async database session

        Returns:
            Updated profile data
        """
        try:
            # Delete existing languages for this user
            await session.execute(
                select(UserLanguage).where(UserLanguage.user_id == user_id)
            )
            existings = (
                (
                    await session.execute(
                        select(UserLanguage).where(UserLanguage.user_id == user_id)
                    )
                )
                .scalars()
                .all()
            )

            for existing in existings:
                await session.delete(existing)

            # Add new languages
            for language_name in language_names:
                # Get or create language
                lang_query = select(Language).where(Language.language == language_name)
                result = await session.execute(lang_query)
                language = result.scalars().first()

                if not language:
                    language = Language(language=language_name)
                    session.add(language)
                    await session.flush()

                # Create user_language association
                user_language = UserLanguage(user_id=user_id, language_id=language.id)
                session.add(user_language)

            await session.commit()
            return await ProfileRepository.get_user_profile_by_id(user_id, session)

        except Exception as e:
            await session.rollback()
            raise

    @staticmethod
    async def update_personal_info(
        user_id: UUID, update_data: dict, session: AsyncSession
    ) -> dict:
        """
        Update user personal information (User + JobseekerProfile)

        Args:
            user_id: User UUID
            update_data: Dictionary with fields to update
            session: Async database session

        Returns:
            Updated profile data
        """
        try:
            # Fetch user
            user_query = (
                select(User)
                .options(selectinload(User.jobseeker_profile))
                .where(User.id == user_id)
            )
            result = await session.execute(user_query)
            user = result.scalars().first()

            if not user:
                raise ValueError("User not found")

            # Update user fields

            # Ensure jobseeker profile exists
            if not user.jobseeker_profile:
                jobseeker_profile = JobseekerProfile(user_id=user_id)
                session.add(jobseeker_profile)
                user.jobseeker_profile = jobseeker_profile

            # Update profile fields
            profile = user.jobseeker_profile
            profile_fields = ["current_location", "date_of_birth", "marital_status", "gender"]

            for field in profile_fields:
                if field in update_data and update_data[field] is not None:
                    setattr(profile, field, update_data[field])

            await session.commit()

            # Fetch and return updated profile
            return await ProfileRepository.get_user_profile_by_id(user_id, session)

        except Exception as e:
            print(f"Error updating personal information: {str(e)}")
            await session.rollback()
            raise

    @staticmethod
    async def get_skills_dropdown(session: AsyncSession) -> list:
        """
        Get all available skills for dropdown

        Args:
            session: Async database session

        Returns:
            List of skills
        """
        try:
            query = select(Skill).order_by(Skill.name)
            result = await session.execute(query)
            skills = result.scalars().all()

            return [
                {
                    "id": str(skill.id),
                    "name": skill.name,
                    "category": skill.category,
                    "is_trending": skill.is_trending,
                }
                for skill in skills
            ]

        except Exception as e:
            print(f"Error fetching skills dropdown: {str(e)}")
            raise

    @staticmethod
    async def get_languages_dropdown(session: AsyncSession) -> list:
        """
        Get all available languages for dropdown

        Args:
            session: Async database session

        Returns:
            List of languages
        """
        try:
            query = select(Language).order_by(Language.language)
            result = await session.execute(query)
            languages = result.scalars().all()

            return [
                {"id": str(lang.id), "language": lang.language} for lang in languages
            ]

        except Exception as e:
            print(f"Error fetching languages dropdown: {str(e)}")
            raise
