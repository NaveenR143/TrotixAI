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

from .PDFDocumentAnalyzer import DocumentAnalyzer

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
        raw_bytes: bytes,
        mime_type: str,
    ) -> JobSeekerProfile:
        LOGGER.info(
            "Starting resume processing",
            extra={"user_id": str(user_id), "file_name": file_name},
        )

        extension = self._validator.validate(file_name, file_bytes)
        parser = self._strategy_map.get(extension)
        if parser is None:
            raise FileValidationError(
                f"No parser strategy registered for extension {extension}"
            )

        try:
            main_text = parser.parse_text(raw_bytes)
            analyzer = DocumentAnalyzer(file_bytes)
            analysis_result = analyzer.analyze()

            # print(f"Analysis Result: {analysis_result}")

            raw_text = ""
            SECTION_DIVIDER = "=" * 50

            # Extract from tables (priority), then content sections
            if analysis_result.tables.is_valid():
                raw_text += analysis_result.tables.raw_output
                raw_text += f"\n{SECTION_DIVIDER}\n"

            if analysis_result.content and analysis_result.content.sections:
                for section in analysis_result.content.sections:
                    raw_text += f"{section.title}\n"
                    raw_text += f"{SECTION_DIVIDER}\n"
                    raw_text += "\n".join(section.content)
                    raw_text += f"\n{SECTION_DIVIDER}\n"

            debug_path = Path.cwd() / f"output_generated.txt"
            debug_path.write_text(raw_text, encoding="utf-8")

            print("Preprocess Completed")

            # if not raw_text.strip():
            #     raise ParsingError("No text extracted from resume.")
            # clean_text = self._preprocessor.preprocess(raw_text)

            token_count = self._preprocessor.count_tokens(raw_text)
            print(f"Token count for user {user_id}: {token_count}")

            # # Debug output
            # print(f"Cleaned text for user {user_id}:\n{clean_text[:500]}...")

            # Extract deterministic data first (name, email, phone, skills, etc.)
            deterministic = self._extractor.extract(raw_text)
            # Debug output
            print(
                f"Deterministic data for user {user_id}:\n{asdict(deterministic)}")

            # # Remove PII from clean text to reduce tokens sent to model
            # clean_text_without_pii = self._preprocessor.remove_pii(
            #     clean_text, deterministic)
            # print(
            #     f"Clean text after PII removal for user {user_id}:\n{clean_text_without_pii[:500]}...")

            profile = ""

            # Pass complete clean_text (without PII) to AI refiner
            profile = self._ai_refiner.refine(
                user_id=user_id, clean_text=raw_text)

            print(f"AI refinement completed for user {user_id}:\n{profile}")

            # Convert deterministic (dataclass) to dict
            deterministic_dict = asdict(
                deterministic
            )  # Converts DeterministicResumeData → dict

            # Remove 'languages' key from deterministic
            # safe removal if key exists
            deterministic_dict.pop("languages", None)

            # Extract the inner 'profile' from the profile dictionary
            profile_dict = profile.get("profile", {})

            # Merge the two dicts
            merged_data = {**profile_dict, **deterministic_dict}
            
            

            # Optional: if you want to keep the UUID mapping as well
            # merged_data = {"profile": merged_data, "uuids": {k.hex: v.hex for k, v in profile.items() if isinstance(k, UUID)}}

            # Save to JSON
            file_path = Path.cwd() / f"profile_{user_id}.json"
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(merged_data, f, ensure_ascii=False, indent=2)

            print(f"Profile saved for user {user_id}")

            # # Debug output
            # print(
            #     f"Refined profile for user {user_id}:\n{json.dumps(asdict(profile), indent=2, default=str)}"
            # )

            # await self._repository.save_profile_and_resume(
            #     profile=profile,
            #     file_name=file_name,
            #     file_url=file_url,
            #     file_size_bytes=len(file_bytes),
            #     mime_type=mime_type,
            # )
            LOGGER.info("Resume processing completed",
                        extra={"user_id": str(user_id)})
            return profile
        except ResumeProcessingError:
            LOGGER.exception("Resume processing error",
                             extra={"user_id": str(user_id)})
            raise
        except Exception as exc:
            LOGGER.exception(
                "Unhandled resume processing error", extra={"user_id": str(user_id)}
            )
            raise ResumeProcessingError(
                f"Unhandled processing error: {exc}") from exc


def configure_logging(level: int = logging.INFO) -> None:
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
