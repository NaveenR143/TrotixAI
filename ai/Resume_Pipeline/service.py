from __future__ import annotations

import logging
import asyncio
import json
from dataclasses import asdict
from typing import Sequence
from uuid import UUID

from .ai_refiner import AzureOpenAIResumeRefiner
from .errors import (
    AIRefinementError,
    FileValidationError,
    ParsingError,
    RepositoryError,
    ResumeProcessingError,
)
from .extractor import DeterministicExtractor
from .parsers import (
    CsvResumeParser,
    DocResumeParser,
    DocxResumeParser,
    PdfResumeParser,
    ResumeParserStrategy,
)
from .preprocessing import ResumePreprocessor
from .repository import JobSeekerRepository
from .models import JobSeekerProfile
from .validation import FileValidator

from pathlib import Path

LOGGER = logging.getLogger("resume_processor")


class ResumeProcessor:
    """Main orchestrator coordinating validation, extraction, AI, and persistence."""

    def __init__(
        self,
        repository: JobSeekerRepository,
        ai_refiner: AzureOpenAIResumeRefiner,
        preprocessor: ResumePreprocessor | None = None,
        extractor: DeterministicExtractor | None = None,
        validator: FileValidator | None = None,
    ) -> None:
        self._repository = repository
        self._ai_refiner = ai_refiner
        self._preprocessor = preprocessor or ResumePreprocessor()
        self._extractor = extractor or DeterministicExtractor()
        self._validator = validator or FileValidator()

        self._strategy_map: dict[str, ResumeParserStrategy] = {
            ".pdf": PdfResumeParser(),
            ".csv": CsvResumeParser(),
            ".docx": DocxResumeParser(),
            ".doc": DocResumeParser(),
        }

    async def process_resume(
        self,
        user_id: UUID,
        file_name: str,
        file_bytes: bytes,
        file_url: str,
        mime_type: str,
    ) -> JobSeekerProfile:
        LOGGER.info("Starting resume processing", extra={"user_id": str(user_id), "file_name": file_name})

        extension = self._validator.validate(file_name, file_bytes)
        parser = self._strategy_map.get(extension)
        if parser is None:
            raise FileValidationError(f"No parser strategy registered for extension {extension}")

        try:
            raw_text = parser.parse_text(file_bytes)
            if not raw_text.strip():
                raise ParsingError("No text extracted from resume.")
            clean_text = self._preprocessor.preprocess(raw_text)
            chunks = self._preprocessor.chunk(clean_text)
            deterministic = self._extractor.extract(clean_text)
            profile = self._ai_refiner.refine(user_id=user_id, deterministic_data=deterministic, chunks=chunks)
            
            print(f"Refined profile for user {user_id}:\n{json.dumps(asdict(profile), indent=2, default=str)}")  # Debug output
            # await self._repository.save_profile_and_resume(
            #     profile=profile,
            #     file_name=file_name,
            #     file_url=file_url,
            #     file_size_bytes=len(file_bytes),
            #     mime_type=mime_type,
            # )
            LOGGER.info("Resume processing completed", extra={"user_id": str(user_id)})
            return profile
        except ResumeProcessingError:
            LOGGER.exception("Resume processing error", extra={"user_id": str(user_id)})
            raise
        except Exception as exc:
            LOGGER.exception("Unhandled resume processing error", extra={"user_id": str(user_id)})
            raise ResumeProcessingError(f"Unhandled processing error: {exc}") from exc


def configure_logging(level: int = logging.INFO) -> None:
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )

