import asyncio
from urllib.parse import urlparse, unquote
import os
import re
from bs4 import BeautifulSoup
import html

from ProcessPDF.resume_pipeline.service import ResumeProcessor
from db.resume_repository import ResumeRepository
from db.session_manager import db_session_manager

# Set Windows event loop policy once at module load time
if os.name == "nt":  # Windows
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    except Exception as e:
        print(f"Warning: Could not set event loop policy: {e}")


from ProcessPDF.resume_pipeline.ai_refiner import AzureOpenAIResumeRefiner


class FileValidationError(Exception):
    pass


class UpdateResumeHandler:
    MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
    CONTAINER_NAME = "rightnxtstorage"

    def __init__(self, resume_id: int = None, user_id: str = None):
        self.user_id = str(user_id) if user_id is not None else None
        self.resume_id = int(resume_id) if resume_id is not None else None
        # ai_refiner is required by ResumeProcessor
        self.resume_processor = ResumeProcessor(ai_refiner=AzureOpenAIResumeRefiner())

    async def fetch_resume_summary(self, session):
        try:
            from sqlalchemy import text
            query = text("SELECT parsed_summary FROM resumes WHERE id = :resume_id LIMIT 1")
            result = await session.execute(query, {"resume_id": self.resume_id})
            row = result.fetchone()
            if row:
                return row[0]
            return None
        except Exception as e:
            raise Exception(f"Failed to fetch resume summary: {str(e)}")

    async def generate_embeddings(self, session):
        try:
            summary = await self.fetch_resume_summary(session)
            if not summary or not str(summary).strip():
                print(
                    f"⚠️ Resume summary is missing or empty for resume ID {self.resume_id}. Skipping embedding generation."
                )
                return None, None

            profile_embedding = self.resume_processor._generate_embedding(summary)
            return summary, profile_embedding
        except Exception as e:
            raise Exception(f"Failed to generate embeddings: {str(e)}")

    async def save_embedding(self):
        try:
            async with db_session_manager.session() as session:
                summary, profile_embedding = await self.generate_embeddings(session)
                if profile_embedding:
                    from sqlalchemy import text
                    query = text("""
                        UPDATE jobseeker_profiles 
                        SET summary = :summary, profile_embedding = :profile_embedding
                        WHERE user_id = CAST(:user_id AS UUID)
                    """)
                    await session.execute(query, {
                        "summary": summary,
                        "profile_embedding": str(profile_embedding),
                        "user_id": self.user_id
                    })
                    await session.commit()
                    print(f"✅ Successfully updated profile summary and embedding for user {self.user_id}")
        except Exception as e:
            raise Exception(f"Failed to save embedding: {str(e)}")
