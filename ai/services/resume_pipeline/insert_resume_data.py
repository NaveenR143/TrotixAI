"""
Resume Data Insertion Service
Reads parsed resume data from JSON and inserts into database tables:
- jobseeker_profiles
- skills & jobseeker_skills
- education
- projects
- work_experiences
"""

import json
import logging
import asyncio
from pathlib import Path
from typing import Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

# Import database connection
from ai.db.database import AsyncSessionLocal
from ai.db.resume_repository import ResumeRepository

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
LOGGER = logging.getLogger(__name__)


class ResumeDataInserter:
    """Handles insertion of parsed resume data into database."""

    def __init__(self):
        self.session: Optional[AsyncSession] = None
        self.repository: Optional[ResumeRepository] = None

    async def __aenter__(self):
        self.session = AsyncSessionLocal()
        self.repository = ResumeRepository(self.session)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def process_resume_json(
        self,
        merged_data: dict,
        phone_number: str,
        file_name: str = "resume.pdf",
        file_url: str = None,
        file_size_bytes: int = 0,
        mime_type: str = "application/pdf",
    ) -> bool:
        """
        Main method to process and insert resume data.

        Args:
            merged_data: Merged dictionary with profile data ({**profile_dict, **deterministic_dict})
            phone_number: Phone number to identify the user
            file_name: Original resume file name
            file_url: S3 or cloud storage URL
            file_size_bytes: File size in bytes
            mime_type: MIME type of the file

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            profile_data = merged_data
            LOGGER.info(f"Processing resume data for phone {phone_number}")

            # Get user ID by phone number
            user_id = await self.repository.get_user_id_by_phone(phone_number)
            if not user_id:
                LOGGER.error(f"Could not find user with phone: {phone_number}")
                return False

            LOGGER.info(f"Found user {user_id} for phone {phone_number}")

            # Insert jobseeker profile and bulk add skills in parallel
            skills = profile_data.get("skills", [])
            await asyncio.gather(
                self.repository.upsert_jobseeker_profile(
                    user_id, profile_data),
                self.repository.bulk_add_user_skills(user_id, skills)
            )

            # Insert education in parallel
            education = profile_data.get("education", [])
            projects_from_education = []

            education_tasks = []
            for idx, edu in enumerate(education):
                field_of_study = ", ".join(edu.get("field_of_study", []))
                education_tasks.append(
                    self.repository.add_education(
                        user_id=user_id,
                        institution=edu.get("institution"),
                        degree=edu.get("degree"),
                        field_of_study=field_of_study,
                        grade=edu.get("grade"),
                        start_year=edu.get("start_year"),
                        end_year=edu.get("end_year"),
                        is_current=edu.get("is_current", False),
                        description=edu.get("description"),
                        sort_order=idx,
                    )
                )
                # Collect projects from education
                projects = edu.get("projects", [])
                projects_from_education.extend(projects)

            # Run all education insertions in parallel
            if education_tasks:
                await asyncio.gather(*education_tasks)

            # Prepare all projects (from education + standalone)
            all_projects = projects_from_education.copy()
            standalone_projects = profile_data.get("projects", [])
            all_projects.extend(standalone_projects)

            # Define helper functions for parallel processing
            async def insert_project_with_skills(idx: int, project: dict) -> None:
                """Insert project and its associated skills."""
                technologies = project.get("technologies", [])
                project_id = await self.repository.add_project(
                    user_id=user_id,
                    title=project.get("name"),
                    description=project.get("description"),
                    url=project.get("url"),
                    repo_url=project.get("repo_url"),
                    skills_used=technologies,
                    start_date=project.get("start_date"),
                    end_date=project.get("end_date"),
                    sort_order=idx,
                )
                if technologies:
                    await self.repository.add_project_skills(project_id, technologies)

            async def insert_work_experience_with_skills(idx: int, exp: dict) -> None:
                """Insert work experience and its associated skills."""
                exp_id = await self.repository.add_work_experience(
                    user_id=user_id,
                    company_name=exp.get("company_name"),
                    title=exp.get("job_title"),
                    location=exp.get("location"),
                    start_date=exp.get("start_date"),
                    end_date=exp.get("end_date"),
                    is_current=exp.get("is_current", False),
                    description=exp.get("description"),
                    skills_used=exp.get("skills", []),
                    achievements=exp.get("achievements", []),
                    sort_order=idx,
                )
                skills_used = exp.get("skills", [])
                if skills_used:
                    await self.repository.add_work_experience_skills(exp_id, skills_used)

            # Prepare parallel tasks for projects and work experiences
            project_tasks = [
                insert_project_with_skills(idx, project)
                for idx, project in enumerate(all_projects)
            ]

            work_experiences = profile_data.get("work_experiences", [])
            work_tasks = [
                insert_work_experience_with_skills(idx, exp)
                for idx, exp in enumerate(work_experiences)
            ]

            # Prepare resume insertion task
            parsed_experience_years = profile_data.get(
                "years_of_experience", 0)
            parsed_summary = profile_data.get("summary", "")

            resume_task = None
            if file_url:
                resume_task = self.repository.add_resume(
                    user_id=user_id,
                    file_name=file_name,
                    file_url=file_url,
                    file_size_bytes=file_size_bytes,
                    mime_type=mime_type,
                    parsed_skills=skills,
                    parsed_experience_years=parsed_experience_years,
                    parsed_summary=parsed_summary,
                )

            # Run projects, work experiences, and resume in parallel
            all_tasks = project_tasks + work_tasks
            if resume_task:
                all_tasks.append(resume_task)

            if all_tasks:
                await asyncio.gather(*all_tasks)

            LOGGER.info(f"Successfully processed resume for user {user_id}")
            return True

        except Exception as e:
            LOGGER.error(f"Error processing resume: {str(e)}")
            return False


async def main():
    """Example usage of the ResumeDataInserter."""

    # Example: load and merge data
    json_file = r"C:\Naveen\Jobs\Source\TrotixAI\profile_b60aef5c-dc67-458c-8fc3-ce3f442cb248.json"
    phone_number = "+91-9876543210"  # Replace with actual phone number

    # Load JSON file and create merged_data
    with open(json_file, "r", encoding="utf-8") as f:
        profile_dict = json.load(f)

    deterministic_dict = {}  # Add your deterministic data here
    merged_data = {**profile_dict, **deterministic_dict}

    async with ResumeDataInserter() as inserter:
        success = await inserter.process_resume_json(
            merged_data=merged_data,
            phone_number=phone_number,
            file_name="resume.pdf",
            file_url="s3://bucket/resume.pdf",  # Optional
            file_size_bytes=102400,  # Optional
            mime_type="application/pdf",
        )

        if success:
            print("✓ Resume data inserted successfully!")
        else:
            print("✗ Failed to insert resume data.")


if __name__ == "__main__":
    asyncio.run(main())
