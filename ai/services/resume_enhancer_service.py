from __future__ import annotations

import json
import os
import logging
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from ai.utils.errors import CareerAdvisorError
from ai.utils.toon import TOONFormatter
from ai.utils.data_utils import clean_dict

logger = logging.getLogger(__name__)

try:
    from openai import AzureOpenAI  # type: ignore
except Exception:
    AzureOpenAI = None  # type: ignore


class ResumeEnhancerService:
    """Service to enhance user resumes using AI."""

    def __init__(
        self,
        endpoint: str | None = None,
        api_key: str | None = None,
        api_version: str | None = None,
        deployment: str | None = None,
    ) -> None:
        self._endpoint = endpoint or os.getenv("AZURE_OPENAI_ENDPOINT", "")
        self._api_key = api_key or os.getenv("AZURE_OPENAI_API_KEY", "")
        self._api_version = api_version or os.getenv(
            "AZURE_OPENAI_API_VERSION", "2024-06-01"
        )
        self._deployment = deployment or os.getenv("AZURE_OPENAI_DEPLOYMENT", "")
        self._formatter = TOONFormatter()

        if not self._endpoint or not self._api_key or not self._deployment:
            # Fallback for local development if env vars are missing
            logger.warning(
                "Azure OpenAI configuration missing for ResumeEnhancerService."
            )

    async def enhance_resume(
        self,
        profile_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Enhance resume content using Azure OpenAI.
        """
        if AzureOpenAI is None:
            raise CareerAdvisorError(
                "`openai` package is required for AI resume enhancement."
            )

        if not self._endpoint or not self._api_key or not self._deployment:
            raise CareerAdvisorError("Azure OpenAI configuration missing.")

        client = AzureOpenAI(
            azure_endpoint=self._endpoint,
            api_key=self._api_key,
            api_version=self._api_version,
        )

        schema_instruction = self._formatter.build_resume_enhancement_instructions()

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a professional resume writer and ATS optimization engine.\n"
                    "Your job is to rewrite and enhance resume content while preserving factual accuracy.\n\n"
                    "CRITICAL OUTPUT RULES (NON-NEGOTIABLE):\n"
                    "1. Output ONLY a valid TOON object.\n"
                    "2. Do NOT include explanations, markdown, notes, or extra text.\n"
                    "3. Follow TOON syntax EXACTLY.\n"
                    '4. Use ONLY double quotes (") for all strings.\n'
                    '5. Escape internal quotes using \\".\n'
                    "6. Use parentheses () only for object definitions.\n"
                    "7. Separate all fields correctly with commas.\n"
                    "8. Output must be syntactically complete and parsable.\n\n"
                    "CONTENT TRANSFORMATION RULES:\n"
                    "9. Rewrite content to be clear, professional, and ATS-friendly.\n"
                    "10. Use strong action verbs (e.g., Developed, Led, Designed, Managed, Optimized).\n"
                    "11. Improve clarity, structure, and impact without changing meaning.\n"
                    "12. Quantify achievements ONLY if numbers or metrics are explicitly provided.\n"
                    "13. NEVER invent skills, roles, companies, technologies, or achievements.\n"
                    "14. Keep all information strictly grounded in user input.\n\n"
                    "STRUCTURE RULES:\n"
                    "15. Summary must be concise and professionally written.\n"
                    "16. Skills must be relevant, grouped logically, and industry-aligned.\n"
                    "17. Work experience must be a list of Experience objects.\n"
                    "18. Projects must be a list of Project objects with impact and technologies.\n"
                    "19. Preserve original meaning while improving presentation.\n\n"
                    "OUTPUT FORMAT (TOON SCHEMA):\n"
                    "Return a single TOON object only."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"{schema_instruction}\n\n"
                    "User profile data to enhance:\n"
                    f"{json.dumps(clean_dict(profile_data), ensure_ascii=False)}\n"
                ),
            },
        ]

        try:
            response = client.chat.completions.create(
                model=self._deployment,
                messages=messages,
                temperature=0.3,
            )

            content = (response.choices[0].message.content or "").strip()

            if not content.startswith("EnhancedResumeTOON("):
                raise CareerAdvisorError("Invalid TOON format for resume enhancement")

            # Convert TOON → JSON
            enhanced_json = self._formatter.career_toon_to_json(content)

            return enhanced_json

        except Exception as exc:
            logger.error(f"Resume enhancement failed: {exc}", exc_info=True)
            raise CareerAdvisorError(f"LLM resume enhancement failed: {exc}") from exc
