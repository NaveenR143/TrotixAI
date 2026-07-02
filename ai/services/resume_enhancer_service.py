from __future__ import annotations

import json
import os
import re
import logging
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from ai.utils.errors import CareerAdvisorError
from ai.utils.toon import TOONFormatter
from ai.utils.data_utils import clean_dict

logger = logging.getLogger(__name__)

try:
    from openai import AzureOpenAI, OpenAI  # type: ignore
except Exception:
    AzureOpenAI = None  # type: ignore
    OpenAI = None  # type: ignore


class ResumeEnhancerService:
    """Service to enhance user resumes using AI."""

    def __init__(
        self,
        endpoint: str | None = None,
        api_key: str | None = None,
        api_version: str | None = None,
        deployment: str | None = None,
    ) -> None:
        self._endpoint = (endpoint or os.getenv("AZURE_OPENAI_ENDPOINT", "")).split("#")[0].strip()
        self._api_key = (api_key or os.getenv("AZURE_OPENAI_API_KEY", "")).split("#")[0].strip()
        self._api_version = (api_version or os.getenv(
            "AZURE_OPENAI_API_VERSION", "2025-04-14"
        )).split("#")[0].strip()
        self._deployment = (deployment or os.getenv("AZURE_OPENAI_DEPLOYMENT", "")).split("#")[0].strip()
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
        if AzureOpenAI is None or OpenAI is None:
            raise CareerAdvisorError(
                "`openai` package is required for AI resume enhancement."
            )

        if not self._endpoint or not self._api_key or not self._deployment:
            raise CareerAdvisorError("Azure OpenAI configuration missing.")

        if "openai/v1" in self._endpoint or "services.ai.azure.com" in self._endpoint:
            client = OpenAI(
                base_url=self._endpoint,
                api_key=self._api_key,
            )
        else:
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
                    "You are an ATS-safe resume enhancement system."
                    "Your task is to:"
                    "1. Improve recruiter readability"
                    "2. Improve ATS compatibility"
                    "3. Strengthen professional phrasing"
                    "4. Enhance clarity and impact"
                    "5. Preserve factual accuracy"
                    "6. Maintain strict schema compliance"
                    "7. Keep content aligned with the candidate's actual experience and seniority"
                    "CRITICAL OUTPUT RULES (NON-NEGOTIABLE):"
                    "1. Output ONLY a valid TOON object."
                    "2. Do NOT include explanations, markdown, notes, comments, or extra text."
                    "3. Follow TOON syntax EXACTLY."
                    '4. Use ONLY double quotes (") for all strings.'
                    '5. Escape internal quotes using \\".'
                    "6. Use parentheses () only for object definitions."
                    "7. Separate all fields correctly with commas."
                    "8. Do NOT wrap output in markdown code fences."
                    "9. Maintain strict schema consistency."
                    "10. Do NOT omit required fields."
                    "11. Use empty arrays instead of null values where applicable."
                    "12. Every key MUST be followed by a colon."
                    "FACTUAL ACCURACY RULES:"
                    "1. Never invent companies, job titles, degrees, certifications, or technologies."
                    "2. Never fabricate years of experience."
                    "3. Never create fake projects or responsibilities."
                    "4. Do NOT generate unrealistic leadership claims."
                    "5. Only enhance information present or strongly implied in the input."
                    "6. Do NOT add technologies unrelated to the candidate's background."
                    "7. Use measurable impact ONLY when clearly supported by the input context."
                    "8. If metrics are unclear, improve wording without inventing numbers."
                    "9. Maintain achievement scope appropriate to the candidate's seniority level."
                    "ATS OPTIMIZATION RULES:"
                    "1. Use ATS-friendly, industry-standard terminology."
                    "2. Use standard resume section naming conventions."
                    "3. Improve keyword readability naturally."
                    "4. Avoid keyword stuffing."
                    "5. Keep formatting recruiter-friendly and ATS-safe."
                    "6. Prioritize clarity, relevance, and scannability."
                    "7. Ensure technical skills are grouped logically."
                    "8. Use concise, impactful phrasing throughout."
                    "CONTENT TRANSFORMATION RULES:"
                    "PROFESSIONAL SUMMARY:"
                    "1. Rewrite the summary into a compelling 3-4 sentence professional paragraph."
                    "2. Highlight core expertise, strengths, technologies, and professional value."
                    "3. Use confident and professional language."
                    "4. Maintain alignment with the candidate's actual experience level."
                    "5. Avoid generic buzzwords and repetition."
                    "SKILLS ENHANCEMENT:"
                    "1. Preserve all existing skills from the input."
                    "2. Add complementary skills ONLY if directly supported or strongly implied by the candidate's experience, projects, or technologies."
                    "3. Group skills logically where appropriate."
                    "4. Keep skill names industry-standard and ATS-friendly."
                    "5. Avoid duplicate or redundant skills."
                    "EXPERIENCE ENHANCEMENT:"
                    "1. Rewrite experience descriptions to be achievement-oriented."
                    "2. Use strong action verbs at the beginning of each bullet point."
                    "3. Emphasize ownership, contribution, optimization, implementation, collaboration, or impact where applicable."
                    "4. Include technologies naturally when relevant."
                    "5. Keep bullet points concise and recruiter-friendly."
                    "6. Avoid overly long or repetitive descriptions."
                    "7. Preserve factual accuracy at all times."
                    "PROJECT ENHANCEMENT:"
                    "1. Rewrite project descriptions professionally."
                    "2. Highlight technical implementation, functionality, and impact."
                    "3. Mention technologies used naturally."
                    "4. Emphasize problem-solving and practical outcomes."
                    "5. Avoid exaggerated claims."
                    "LANGUAGE AND TONE RULES:"
                    "1. Maintain a professional, polished, executive tone."
                    "2. Use active voice wherever possible."
                    "3. Keep content concise and impactful."
                    "4. Avoid filler phrases and unnecessary adjectives."
                    "5. Ensure readability for both ATS systems and human recruiters."
                    "STRUCTURE RULES:"
                    "1. Summary must be concise and professionally written."
                    "2. Skills must be relevant and logically grouped."
                    "3. Work experience must be a list of Experience objects."
                    "4. Projects must be a list of Project objects."
                    "5. Include all languages provided in the input."
                    "6. Preserve all important candidate information."
                    "7. Ensure the final output is clean, consistent, and ATS-compatible."
                    "OUTPUT FORMAT:"
                    "Return a single EnhancedResumeTOON object only."
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

            # Remove markdown code fences if present
            if content.startswith("```"):
                content = re.sub(r"^```[^\n]*\n", "", content)
                content = re.sub(r"\n```$", "", content).strip()

            if not content.startswith("EnhancedResumeTOON("):
                raise CareerAdvisorError("Invalid TOON format for resume enhancement")

            # Convert TOON → JSON
            enhanced_json = self._formatter.career_toon_to_json(content)

            return enhanced_json

        except Exception as exc:
            logger.error(f"Resume enhancement failed: {exc}", exc_info=True)
            raise CareerAdvisorError(f"LLM resume enhancement failed: {exc}") from exc
