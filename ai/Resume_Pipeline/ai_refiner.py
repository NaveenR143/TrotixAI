from __future__ import annotations

import os
from typing import Sequence
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
        self._api_version = api_version or os.getenv("AZURE_OPENAI_API_VERSION", "2024-06-01")
        self._deployment = deployment or os.getenv("AZURE_OPENAI_DEPLOYMENT", "")
        self._formatter = TOONFormatter()

        if not self._endpoint or not self._api_key or not self._deployment:
            raise AIRefinementError(
                "Azure OpenAI configuration missing. Set AZURE_OPENAI_ENDPOINT, "
                "AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT."
            )

        if AzureOpenAI is None:
            raise AIRefinementError("`openai` package is required for Azure OpenAI calls.")

        self._client = AzureOpenAI(
            azure_endpoint=self._endpoint,
            api_key=self._api_key,
            api_version=self._api_version,
        )

    def refine(
        self,
        user_id: UUID,
        deterministic_data: DeterministicResumeData,
        chunks: Sequence[str],
    ) -> JobSeekerProfile:
        toon_input = self._formatter.build_input(deterministic_data, chunks)
        schema_instruction = self._formatter.build_schema_instructions()
        chunk_preview = "\n\n".join(chunks[:3])

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a resume normalization engine. "
                    "Respond with strict TOON only, matching the requested schema."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"{schema_instruction}\n\n"
                    f"Input TOON:\n{toon_input}\n"
                    "Resume chunks (already cleaned and deduplicated):\n"
                    f"{chunk_preview}\n"
                ),
            },
        ]

        try:
            response = self._client.chat.completions.create(
                model=self._deployment,
                messages=messages,
                temperature=0.1,
            )
            content = response.choices[0].message.content or ""
            if "JobSeekerProfileTOON(" not in content:
                raise AIRefinementError("Model response is not valid TOON format.")
            return self._formatter.parse_profile(
                user_id=user_id,
                toon_text=content,
                fallback=deterministic_data,
            )
        except AIRefinementError:
            raise
        except Exception as exc:
            raise AIRefinementError(f"Azure OpenAI refinement failed: {exc}") from exc

