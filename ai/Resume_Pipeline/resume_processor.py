"""
Backward-compatible entrypoint for the resume processing pipeline.

The implementation has been split into multiple modules under `ai/Resume_Pipeline/`.
Importing from this file continues to work:

  from ai.Resume_Pipeline.resume_processor import ResumeProcessor
"""
from __future__ import annotations

# When executed directly (python resume_processor.py) Python doesn't set
# a package context so relative imports (from .errors import ...) fail
# with "attempted relative import with no known parent package".
# This small bootstrap makes the package importable when run as a script by
# adding the project root to sys.path and setting __package__.
if __name__ == "__main__" and __package__ is None:
    import sys
    from pathlib import Path as _Path

    # project root is two levels up: .../ai/Resume_Pipeline/resume_processor.py
    _project_root = _Path(__file__).resolve().parents[2]
    sys.path.insert(0, str(_project_root))
    __package__ = "ai.Resume_Pipeline"

import asyncio
import logging
from pathlib import Path
from uuid import uuid4

# Use absolute package imports so the module works both when imported
# as a package and when executed directly as a script.
from ai.Resume_Pipeline.ai_refiner import AzureOpenAIResumeRefiner
from ai.Resume_Pipeline.errors import (
    AIRefinementError,
    FileValidationError,
    ParsingError,
    RepositoryError,
    ResumeProcessingError,
)
from ai.Resume_Pipeline.extractor import DeterministicExtractor
from ai.Resume_Pipeline.models import (
    DeterministicResumeData,
    EducationEntry,
    JobSeekerProfile,
    WorkExperience,
)
from ai.Resume_Pipeline.parsers import (
    CsvResumeParser,
    DocResumeParser,
    DocxResumeParser,
    PdfResumeParser,
    ResumeParserStrategy,
)
from ai.Resume_Pipeline.preprocessing import ResumePreprocessor
from ai.Resume_Pipeline.repository import JobSeekerRepository
from ai.Resume_Pipeline.service import ResumeProcessor, configure_logging
from ai.Resume_Pipeline.toon import TOONFormatter
from ai.Resume_Pipeline.validation import FileValidator

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

    demo_candidates = [
        Path.cwd() / "sample_resume.docx",
        Path(__file__).resolve().parent / "sample_resume.docx",
    ]
    demo_file = next(
        (p for p in demo_candidates if p.exists()), demo_candidates[0])
    if not demo_file.exists():
        LOGGER.warning(
            "Demo skipped: sample_resume.pdf not found. Looked in: %s",
            ", ".join(str(p) for p in demo_candidates),
        )
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
