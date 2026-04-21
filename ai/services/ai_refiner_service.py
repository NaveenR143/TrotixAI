from __future__ import annotations

import json
import os
from pathlib import Path
from uuid import UUID
from dotenv import load_dotenv

from ai.utils.errors import AIRefinementError, CareerAdvisorError
from ai.utils.toon import TOONFormatter
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)




try:
    from openai import AzureOpenAI  # type: ignore
except Exception:  # pragma: no cover
    AzureOpenAI = None  # type: ignore

load_dotenv()


class AzureOpenAIResumeRefiner:
    """Refines deterministic extraction using Azure OpenAI mini model via TOON."""

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
            raise AIRefinementError(
                "Azure OpenAI configuration missing. Set AZURE_OPENAI_ENDPOINT, "
                "AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT."
            )

        if AzureOpenAI is None:
            raise AIRefinementError(
                "`openai` package is required for Azure OpenAI calls."
            )

        self._client = AzureOpenAI(
            azure_endpoint=self._endpoint,
            api_key=self._api_key,
            api_version=self._api_version,
        )


    async def generate_career_advice(
        self,
        profile_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generate structured career advice using Azure OpenAI
        """

        schema_instruction = self._formatter.build_career_schema_instructions()

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a strict career advisor engine.\n"
                    "Output MUST follow EXACT TOON syntax.\n"
                    "STRICT RULES:\n"
                    '1. Use only double quotes (") for all strings.\n'
                    '2. Escape all internal quotes using \\".\n'
                    "3. Do NOT use } inside string values.\n"
                    "4. Use parentheses () ONLY for objects.\n"
                    "5. Every key MUST be followed by a colon.\n"
                    "6. Separate all fields with commas.\n"
                    "7. Do NOT produce trailing commas.\n"
                    "8. URLs must be valid and start with https://\n"
                    "9. Do NOT break strings across lines.\n"
                    "10. If unsure, return null instead of invalid syntax.\n"
                    "11. Keep recommendations realistic and relevant.\n"
                ),
            },
            {
                "role": "user",
                "content": (
                    f"{schema_instruction}\n\n"
                    "User profile data:\n"
                    f"{json.dumps(profile_data, ensure_ascii=False)}\n"
                ),
            },
        ]

        try:
            response = self._client.chat.completions.create(
                model=self._deployment,
                messages=messages,
                temperature=0.2,  # slight creativity for recommendations
            )

            content = (response.choices[0].message.content or "").strip()

            # 🔍 Debug (optional)
            # print("Career Advice Raw Output:", content)

            # 🔴 Strong validation
            if not content.startswith("CareerAdviceTOON("):
                raise CareerAdvisorError("Invalid TOON format (missing root object)")

            if not content.endswith(")"):
                raise CareerAdvisorError(
                    "Malformed TOON response (missing closing bracket)"
                )

            # 🧩 Convert TOON → JSON
            advice_json = self._formatter.toon_to_json(content)

            # 🔍 Optional debug dump
            # with open(f"career_advice_{user_id}.json", "w", encoding="utf-8") as f:
            #     json.dump(advice_json, f, indent=2, ensure_ascii=False)

            return advice_json

        except CareerAdvisorError:
            raise

        except Exception as exc:
            logger.error(f"Career advice generation failed: {exc}", exc_info=True)
            raise CareerAdvisorError(f"LLM career advice failed: {exc}") from exc
