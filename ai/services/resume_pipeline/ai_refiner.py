from __future__ import annotations

import os
from uuid import UUID

from .errors import AIRefinementError
from .models import DeterministicResumeData, JobSeekerProfile
from .toon import TOONFormatter

try:
    from openai import AzureOpenAI  # type: ignore
except Exception:  # pragma: no cover
    AzureOpenAI = None  # type: ignore


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
        self._deployment = deployment or os.getenv(
            "AZURE_OPENAI_DEPLOYMENT", "")
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

    def refine(
        self,
        user_id: UUID,
        clean_text: str,
    ) -> JobSeekerProfile:
        schema_instruction = self._formatter.build_schema_instructions()

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a strict resume normalization engine.\n"
                    "Output ONLY valid TOON format.\n"
                    "Do NOT explain, do NOT add extra text.\n"
                    "Do NOT hallucinate missing data.\n"
                    "Prefer provided deterministic data when available.\n"
                ),
            },
            {
                "role": "user",
                "content": (
                    f"{schema_instruction}\n\n"
                    "Resume text (PII already removed, cleaned and deduplicated):\n"
                    f"{clean_text}\n"
                ),
            },
        ]

        try:
            response = self._client.chat.completions.create(
                model=self._deployment,
                messages=messages,
                temperature=0.0,  # 🔥 deterministic output
            )

            content = (response.choices[0].message.content or "").strip()

            print("AI Content Generated : ", content)

            # 🔴 Strong validation
            if not content.startswith("JobSeekerProfileTOON("):
                raise AIRefinementError(
                    "Invalid TOON format (missing root object)")

            if not content.endswith(")"):
                raise AIRefinementError(
                    "Malformed TOON response (missing closing bracket)"
                )

            profile_json = self._formatter.toon_to_json(content)

            return {
                user_id: user_id,
                "profile": profile_json,
            }

            # return self._formatter.parse_profile(
            #     user_id=user_id,
            #     profile=content,
            # )

        except AIRefinementError:
            raise

        except Exception as exc:
            raise AIRefinementError(f"LLM refinement failed: {exc}") from exc
