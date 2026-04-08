"""
Integration Examples: Using ResumeRepository and ResumeDataInserter

This module shows how to use the refactored database-agnostic components.
"""

from __future__ import annotations

import logging
from uuid import UUID

from ai.db.database import AsyncSessionLocal
from ai.db.resume_repository import ResumeRepository

LOGGER = logging.getLogger(__name__)


class ResumeProcessorWithDatabaseInsertion:
    """
    Extended ResumeProcessor that also inserts data into the database.
    
    This example shows how to integrate ResumeRepository into your
    existing resume processing pipeline.
    """

    def __init__(self):
        # ... existing init code ...
        pass

    async def process_resume_with_db_insertion(
        self,
        user_id: UUID,
        phone_number: str,
        file_name: str,
        file_bytes: bytes,
        raw_bytes: bytes,
        mime_type: str,
        file_url: str | None = None,
        file_size_bytes: int = 0,
    ) -> dict:
        """
        Process resume and insert data into database.
        
        Args:
            user_id: User UUID
            phone_number: User's phone number (for lookup)
            file_name: Original resume file name
            file_bytes: File bytes
            raw_bytes: Raw file bytes
            mime_type: MIME type of file
            file_url: Optional S3/cloud storage URL
            file_size_bytes: File size in bytes
            
        Returns:
            dict: Processed profile data
        """
        
        # Step 1: Process resume as usual
        profile = await self._process_resume_internal(
            user_id=user_id,
            file_name=file_name,
            file_bytes=file_bytes,
            raw_bytes=raw_bytes,
            mime_type=mime_type,
        )
        
        # Step 2: Insert data into database using repository
        async with AsyncSessionLocal() as session:
            repo = ResumeRepository(session)
            
            try:
                # Get user or verify exists
                user_from_db = await repo.get_user_id_by_phone(phone_number)
                if not user_from_db:
                    LOGGER.error(f"User not found with phone {phone_number}")
                    raise Exception("User not found")
                
                # Insert profile data
                profile_dict = profile.get("profile", {})
                await repo.upsert_jobseeker_profile(user_from_db, profile_dict)
                
                # Insert skills
                skills = profile_dict.get("skills", [])
                for skill_name in skills:
                    skill_id = await repo.get_or_create_skill(skill_name)
                    await repo.add_user_skill(user_from_db, skill_id)
                
                # Insert other data as needed...
                
                LOGGER.info(f"Database insertion completed for user {user_from_db}")
                
            except Exception as e:
                LOGGER.error(f"Error during database insertion: {str(e)}")
                raise
        
        return profile

    async def _process_resume_internal(self, **kwargs) -> dict:
        """Existing resume processing logic."""
        pass


# ============================================================================
# USAGE EXAMPLES
# ============================================================================

async def example_1_direct_repository_usage():
    """
    Example 1: Use ResumeRepository directly
    (Cleanest approach for direct database operations)
    """
    from ai.db.database import AsyncSessionLocal
    from ai.db.resume_repository import ResumeRepository
    
    async with AsyncSessionLocal() as session:
        repo = ResumeRepository(session)
        
        # Fetch user
        user_id = await repo.get_user_id_by_phone("+91-9876543210")
        if not user_id:
            print("User not found")
            return
        
        # Add profile data
        profile_data = {
            "headline": "Senior Software Engineer",
            "summary": "Experienced developer...",
            "current_location": "Bangalore",
        }
        await repo.upsert_jobseeker_profile(user_id, profile_data)
        
        # Add skills
        skill_id = await repo.get_or_create_skill("Python")
        await repo.add_user_skill(user_id, skill_id)
        
        # Add education
        await repo.add_education(
            user_id=user_id,
            institution="MIT",
            degree="Bachelor of Science",
            field_of_study="Computer Science",
            end_year=2020,
        )
        
        # Add work experience
        await repo.add_work_experience(
            user_id=user_id,
            company_name="Google",
            title="Software Engineer",
            start_date="2020-01-01",
        )
        
        print("✓ Data inserted successfully")


async def example_2_using_inserter():
    """
    Example 2: Use ResumeDataInserter (High-level API)
    (Recommended for orchestrated resume insertion)
    """
    from insert_resume_data import ResumeDataInserter
    
    async with ResumeDataInserter() as inserter:
        success = await inserter.process_resume_json(
            json_file_path="profile_data.json",
            phone_number="+91-9876543210",
            file_name="resume.pdf",
            file_url="s3://bucket/resume.pdf",
            file_size_bytes=102400,
        )
        
        if success:
            print("✓ Resume inserted successfully!")
        else:
            print("✗ Failed to insert resume")


async def example_3_fastapi_integration():
    """
    Example 3: Integration with FastAPI route
    """
    from fastapi import UploadFile
    from ai.db.database import AsyncSessionLocal
    from ai.db.resume_repository import ResumeRepository
    
    async def upload_resume(
        user_id: UUID,
        phone_number: str,
        file: UploadFile,
    ):
        file_bytes = await file.read()
        
        # Process resume (your existing logic)
        # profile = await processor.process_resume(...)
        
        # Insert to database
        async with AsyncSessionLocal() as session:
            repo = ResumeRepository(session)
            
            # Verify user
            user_from_db = await repo.get_user_id_by_phone(phone_number)
            if not user_from_db:
                return {"error": "User not found"}
            
            # Insert profile
            # await repo.upsert_jobseeker_profile(user_from_db, profile_data)
            # ... more insertions ...
            
            return {"status": "success", "user_id": str(user_from_db)}


async def example_4_multiple_resumes():
    """
    Example 4: Processing multiple resumes with repository
    """
    from ai.db.database import AsyncSessionLocal
    from ai.db.resume_repository import ResumeRepository
    import json
    
    async with AsyncSessionLocal() as session:
        repo = ResumeRepository(session)
        
        # Load multiple resumes
        resumes = [
            {"phone": "+91-9876543210", "file": "resume1.json"},
            {"phone": "+91-9876543211", "file": "resume2.json"},
        ]
        
        for resume_info in resumes:
            try:
                # Get user
                user_id = await repo.get_user_id_by_phone(resume_info["phone"])
                if not user_id:
                    print(f"User not found: {resume_info['phone']}")
                    continue
                
                # Load JSON
                with open(resume_info["file"]) as f:
                    profile = json.load(f)
                
                # Insert profile
                await repo.upsert_jobseeker_profile(user_id, profile)
                
                # Insert skills
                for skill_name in profile.get("skills", []):
                    skill_id = await repo.get_or_create_skill(skill_name)
                    await repo.add_user_skill(user_id, skill_id)
                
                print(f"✓ Processed {resume_info['file']}")
                
            except Exception as e:
                print(f"✗ Error processing {resume_info['file']}: {e}")


async def example_5_custom_error_handling():
    """
    Example 5: Custom error handling with repository
    """
    from insert_resume_data import ResumeDataInserter
    
    try:
        async with ResumeDataInserter() as inserter:
            success = await inserter.process_resume_json(
                json_file_path="profile_data.json",
                phone_number="+91-9876543210",
            )
            
            if not success:
                print("Resume insertion failed - check logs")
                return False
            
            return True
            
    except Exception as e:
        print(f"Unhandled error: {e}")
        return False


# ============================================================================
# REPOSITORY PATTERN BENEFITS
# ============================================================================

"""
The Repository pattern (used in ResumeRepository) provides:

1. **Separation of Concerns**
   - Database logic isolated in repository layer
   - Business logic separate from data access
   
2. **Reusability**
   - Repository can be used in multiple places
   - Consistent database operations across codebase
   
3. **Testability**
   - Easy to mock repository for testing
   - Can inject different implementations
   
4. **Maintainability**
   - Changes to database queries in one place
   - Clear method names and documentation
   
5. **Type Safety**
   - Return types are explicit (UUID, etc.)
   - Better IDE support and autocomplete

Usage Pattern:
    async with AsyncSessionLocal() as session:
        repo = ResumeRepository(session)
        # Use repo.method() for database operations
"""

