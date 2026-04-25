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


class ProcessJobHandler:
    MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
    CONTAINER_NAME = "trotixai"

    def __init__(self, job_id: int = None, user_id: int = None):
        self.user_id = user_id
        self.job_id = job_id
        # ai_refiner is required by ResumeProcessor
        self.resume_processor = ResumeProcessor(ai_refiner=AzureOpenAIResumeRefiner())

    async def fetch_job_description(self, repo: ResumeRepository):
        try:
            job_description = await repo.get_job_description_by_job_id(self.job_id)
            return job_description

        except Exception as e:
            raise Exception(
                f"Failed to fetch job description: {str(e)}"
            )

    @staticmethod
    def html_to_embedding_text(text):
        if not text:
            return ""
        # Parse HTML
        soup = BeautifulSoup(text, "html.parser")

        # Get raw text with spacing
        text = soup.get_text(separator=" ")

        # Decode HTML entities (&nbsp;, &amp;, etc.)
        text = html.unescape(text)

        # Normalize whitespace
        text = re.sub(r"\s+", " ", text)

        # Optional: remove extra symbols
        text = re.sub(r"[^\w\s.,:/()-]", "", text)

        return text.strip()

    async def generate_embeddings(self, repo: ResumeRepository):
        try:
            job_description = await self.fetch_job_description(repo)
            if not job_description or not str(job_description).strip():
                print(f"⚠️ Job description is missing or empty for job ID {self.job_id}. Skipping embedding generation.")
                return None
            
            clean_description = ProcessJobHandler.html_to_embedding_text(
                job_description
            )

            if not clean_description:
                print(f"⚠️ Cleaned job description is empty for job ID {self.job_id}. Skipping embedding generation.")
                return None

            job_embedding = self.resume_processor._generate_embedding(clean_description)

            return job_embedding
        except Exception as e:
            raise Exception(f"Failed to generate embeddings: {str(e)}")

    async def save_embedding(self):
        try:
            async with db_session_manager.session() as session:
                repo = ResumeRepository(session=session)
                job_embedding = await self.generate_embeddings(repo)
                if job_embedding:
                    await repo.save_job_embedding(self.job_id, job_embedding)
        except Exception as e:
            raise Exception(f"Failed to save embedding: {str(e)}")
