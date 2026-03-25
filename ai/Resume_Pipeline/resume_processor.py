"""
Backward-compatible entrypoint for the resume processing pipeline.

The implementation has been split into multiple modules under `ai/Resume_Pipeline/`.
Importing from this file continues to work:

  from ai.Resume_Pipeline.resume_processor import ResumeProcessor
"""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path
from uuid import uuid4

from .ai_refiner import AzureOpenAIResumeRefiner
from .errors import (
    AIRefinementError,
    FileValidationError,
    ParsingError,
    RepositoryError,
    ResumeProcessingError,
)
from .extractor import DeterministicExtractor
from .models import (
    DeterministicResumeData,
    EducationEntry,
    JobSeekerProfile,
    WorkExperience,
)
from .parsers import (
    CsvResumeParser,
    DocResumeParser,
    DocxResumeParser,
    PdfResumeParser,
    ResumeParserStrategy,
)
from .preprocessing import ResumePreprocessor
from .repository import JobSeekerRepository
from .service import ResumeProcessor, configure_logging
from .toon import TOONFormatter
from .validation import FileValidator

LOGGER = logging.getLogger("resume_processor")

__all__ = [
    "ResumeProcessor",
    "configure_logging",
    "JobSeekerRepository",
    "AzureOpenAIResumeRefiner",
    "ResumeProcessingError",
    "FileValidationError",
    "ParsingError",
    "AIRefinementError",
    "RepositoryError",
    # Models / pipeline building blocks
    "WorkExperience",
    "EducationEntry",
    "JobSeekerProfile",
    "DeterministicResumeData",
    "ResumeParserStrategy",
    "PdfResumeParser",
    "CsvResumeParser",
    "DocxResumeParser",
    "DocResumeParser",
    "ResumePreprocessor",
    "DeterministicExtractor",
    "TOONFormatter",
    "FileValidator",
]


async def _demo() -> None:
    """Local usage example for manual verification."""
    configure_logging()

    demo_file = Path("sample_resume.pdf")
    if not demo_file.exists():
        LOGGER.warning("Demo skipped: sample_resume.pdf not found in current directory.")
        return

    repository = JobSeekerRepository()
    await repository.connect()
    try:
        processor = ResumeProcessor(
            repository=repository,
            ai_refiner=AzureOpenAIResumeRefiner(),
        )
        await processor.process_resume(
            user_id=uuid4(),
            file_name=demo_file.name,
            file_bytes=demo_file.read_bytes(),
            file_url=f"local://{demo_file.name}",
            mime_type="application/pdf",
        )
        LOGGER.info("Resume processing demo completed.")
    finally:
        await repository.close()

if __name__ == "__main__":
    asyncio.run(_demo())
