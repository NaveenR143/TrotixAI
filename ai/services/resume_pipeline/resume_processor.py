"""
Backward-compatible entrypoint for the resume processing pipeline.

The implementation has been split into multiple modules under `ai/services/resume_pipeline/`.
Importing from this file continues to work:

  from ai.services.resume_pipeline.resume_processor import ResumeProcessor
"""

from __future__ import annotations
from io import BytesIO

# When executed directly (python resume_processor.py) Python doesn't set
# a package context so relative imports (from .errors import ...) fail
# with "attempted relative import with no known parent package".
# This small bootstrap makes the package importable when run as a script by
# adding the project root to sys.path and setting __package__.
if __name__ == "__main__":
    import sys
    from pathlib import Path as _Path

    # project root is three levels up: .../ai/services/resume_pipeline/resume_processor.py
    _project_root = str(_Path(__file__).resolve().parents[3])
    if _project_root not in sys.path:
        sys.path.insert(0, _project_root)
    # Ensure package is set so relative imports within the package can work if any
    __package__ = "ai.services.resume_pipeline"

import asyncio
import logging
from pathlib import Path
from uuid import uuid4

# Use absolute package imports so the module works both when imported
# as a package and when executed directly as a script.
from ai.services.resume_pipeline.ai_refiner import AzureOpenAIResumeRefiner
from ai.services.resume_pipeline.errors import (
    AIRefinementError,
    FileValidationError,
    ParsingError,
    RepositoryError,
    ResumeProcessingError,
)
from ai.services.resume_pipeline.extractor import DeterministicExtractor
from ai.services.resume_pipeline.models import (
    DeterministicResumeData,
    EducationEntry,
    JobSeekerProfile,
    WorkExperience,
)
from ai.services.resume_pipeline.parsers import (
    CsvResumeParser,
    DocResumeParser,
    DocxResumeParser,
    PdfResumeParser,
    ResumeParserStrategy,
)
from ai.services.resume_pipeline.preprocessing import ResumePreprocessor
from ai.services.resume_pipeline.repository import JobSeekerRepository
from ai.services.resume_pipeline.service import ResumeProcessor, configure_logging
from ai.services.resume_pipeline.toon import TOONFormatter
from ai.services.resume_pipeline.validation import FileValidator

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
        Path.cwd() / "SampleResumes/SaranKumarNM.pdf",
        Path(__file__).resolve().parent / "SampleResumes/SaranKumarNM.pdf",
    ]

    print(f"File Path : {demo_candidates[1]}")
    demo_file = next((p for p in demo_candidates if p.exists()), demo_candidates[0])
    if not demo_file.exists():
        LOGGER.warning(
            "Demo skipped: sample_resume.pdf not found. Looked in: %s",
            ", ".join(str(p) for p in demo_candidates),
        )
        return

    print(f"Using demo file: {Path(demo_file)}")

    pdf_bytes = Path(demo_file).read_bytes()

    MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

    if len(pdf_bytes) > MAX_FILE_SIZE_BYTES:
        raise FileValidationError("File too large. Max size is 10 MB.")

    pdf_stream = BytesIO(pdf_bytes)

    repository = JobSeekerRepository()
    await repository.connect()
    try:
        processor = ResumeProcessor(
            repository=repository,
            ai_refiner=AzureOpenAIResumeRefiner(),
        )
        await processor.process_resume(
            user_id="41e9a27d-4768-4520-a1b2-425faca3c823",  # uuid4(),
            file_name=demo_file.name,
            file_bytes=pdf_stream,
            raw_bytes=demo_file.read_bytes(),
            mime_type="application/pdf",
        )
        LOGGER.info("Resume processing demo completed.")
    finally:
        await repository.close()


if __name__ == "__main__":
    asyncio.run(_demo())
