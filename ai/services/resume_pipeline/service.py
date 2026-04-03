from __future__ import annotations

import io
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
from pdfminer.high_level import extract_text as extract_pdf_text

import os

from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"
LOCAL_MODEL_PATH = "./model"

LOGGER = logging.getLogger("resume_processor")


def load_model():
    # Check if model exists locally
    if os.path.exists(LOCAL_MODEL_PATH):
        print("✅ Loading model from local path...")
        return SentenceTransformer(LOCAL_MODEL_PATH)

    # Otherwise download and save
    print("⬇️ Downloading model from Hugging Face...")
    model = SentenceTransformer(MODEL_NAME)

    # Save locally for future use
    os.makedirs(LOCAL_MODEL_PATH, exist_ok=True)
    model.save(LOCAL_MODEL_PATH)

    print("💾 Model saved locally")
    return model


# Load once (global)
_model = load_model()


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

    def _generate_embedding(self, text: str) -> list[float] | None:
        """Generate embedding using SentenceTransformers (open-source)."""
        try:
            if not text or not text.strip():
                LOGGER.warning("Empty text provided for embedding generation")
                return None

            # Generate embedding
            embedding = _model.encode(
                text,
                convert_to_numpy=True,
                normalize_embeddings=True,  # good for cosine similarity
            )

            embedding_list = embedding.tolist()

            print(f"Generated embedding with {len(embedding_list)} dimensions")
            return embedding_list

        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None

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

            main_text = ""

            # if extension.endswith(".pdf"):
            #     with io.BytesIO(file_bytes) as f:
            #         main_text = extract_pdf_text(f)

            main_text = parser.parse_plain_text(raw_bytes)

            # Store first 5 lines from extracted PDF in a variable
            lines = main_text.split("\n")
            first_five_lines = "\n".join(lines[:5])

            # print("=== First 5 lines from extracted PDF ===")
            # for i, line in enumerate(lines[:5], 1):
            #     print(f"{i}. {line}")
            # print("=" * 50)

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
            deterministic = self._extractor.extract(raw_text, first_five_lines)
            # Debug output
            print(f"Deterministic data for user {user_id}:\n{asdict(deterministic)}")

            # # Remove PII from clean text to reduce tokens sent to model
            # clean_text_without_pii = self._preprocessor.remove_pii(
            #     clean_text, deterministic)
            # print(
            #     f"Clean text after PII removal for user {user_id}:\n{clean_text_without_pii[:500]}...")

            profile = ""

            # Pass complete clean_text (without PII) to AI refiner
            profile = self._ai_refiner.refine(user_id=user_id, clean_text=raw_text)

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

            # Generate embedding from resume summary
            resume_summary = merged_data.get("summary", "")
            resume_embedding = self._generate_embedding(resume_summary)

            # Save profile and resume with embedding
            await self._repository.save_profile_and_resume(
                profile=merged_data,
                file_name=file_name,
                file_url="https://example.com/resume.pdf",  # Placeholder URL
                file_size_bytes=len(raw_bytes),
                mime_type=mime_type,
                resume_embedding=resume_embedding,
            )
            LOGGER.info("Resume processing completed", extra={"user_id": str(user_id)})
            return profile
        except ResumeProcessingError:
            LOGGER.exception("Resume processing error", extra={"user_id": str(user_id)})
            raise
        except Exception as exc:
            LOGGER.exception(
                "Unhandled resume processing error", extra={"user_id": str(user_id)}
            )
            raise ResumeProcessingError(f"Unhandled processing error: {exc}") from exc


def configure_logging(level: int = logging.INFO) -> None:
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
