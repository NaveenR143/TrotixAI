from __future__ import annotations

import json
import os
from pathlib import Path
from uuid import UUID
from dotenv import load_dotenv

from ai.utils.errors import AIRefinementError, CareerAdvisorError
from ai.utils.toon import TOONFormatter
from ai.utils.data_utils import clean_dict
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
                    "11. ALL sections must be filled with realistic data.\n"
                    "12. ALWAYS include resource URLs in courses, certifications, and action_plan.\n"
                    "13. ALWAYS include globally recognized or top regional universities.\n"
                    "14. Prefer universities offering online or flexible programs where applicable.\n"
                    "15. hiring_companies MUST be real well-known companies relevant to the field.\n"
                    "16. entrance_exams MUST be realistic (e.g., GATE, GRE, CAT, IELTS).\n"
                    "17. Strongly prefer FREE, open-source, or high-quality free resources.\n"
                    "18. recommendations.courses MUST contain at least 2 valid courses.\n"
                    "19. recommendations.certifications MUST contain at least 2 valid certifications.\n"
                    "20. Empty arrays are STRICTLY forbidden.\n"
                    "21. If unsure, generate the most relevant real-world options instead of leaving blank.\n"
                    "22. Prefer well-known platforms like Coursera, edX, Udemy, Kaggle, freeCodeCamp, AWS, Google, Microsoft.\n"
                    "23. Use real and verifiable course/certification names.\n"
                ),
            },
            {
                "role": "user",
                "content": (
                    f"{schema_instruction}\n\n"
                    "User profile data:\n"
                    f"{json.dumps(clean_dict(profile_data), ensure_ascii=False)}\n"
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
            advice_json = self._formatter.career_toon_to_json(content)

            # 🔍 Optional debug dump
            # with open(f"career_advice_{user_id}.json", "w", encoding="utf-8") as f:
            #     json.dump(advice_json, f, indent=2, ensure_ascii=False)

            return advice_json

        except CareerAdvisorError:
            raise

        except Exception as exc:
            logger.error(f"Career advice generation failed: {exc}", exc_info=True)
            raise CareerAdvisorError(f"LLM career advice failed: {exc}") from exc

    async def generate_skill_development_analysis(
        self,
        profile_data: Dict[str, Any],
        market_skills: List[str],
    ) -> Dict[str, Any]:
        """
        Generate structured skill development analysis using Azure OpenAI
        """
        schema_instruction = self._formatter.build_skill_development_instructions()

        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert career and skill development advisor.\n"
                    "Your task is to analyze the user's profile and the provided market trend skills to recommend a personalized skill development path.\n"
                    "Output MUST follow EXACT TOON syntax.\n"
                    "STRICT RULES:\n"
                    '1. Use only double quotes (") for all strings.\n'
                    '2. Escape all internal quotes using \\".\n'
                    "3. Parentheses () are for objects.\n"
                    "4. Separate all fields with commas.\n"
                    "5. Do NOT add any extra text outside the TOON object.\n"
                    "CONTENT RULES:\n"
                    "6. Categorize skills as 'technical', 'soft', or 'domain-specific'.\n"
                    "7. Identify 8-10 skills most relevant to the user's background and industry trends.\n"
                    "8. Provide a clear importance rationale for each skill.\n"
                    "9. Include practical learning suggestions (projects, practice, etc.).\n"
                    "RESOURCE RULES (MANDATORY):\n"
                    "10. For EACH skill, include a 'resources' field.\n"
                    "11. Each skill MUST have at least 2 resources.\n"
                    "12. Resources MUST include real, specific items such as:\n"
                    "    - Course names\n"
                    "    - Certification programs\n"
                    "    - Learning platforms\n"
                    "    - URLs (valid-looking links)\n"
                    "13. Each resource must include: name, type, provider, url, cost, description.\n"
                    "14. Ensure a mix of 'free' and 'paid' resources where possible.\n"
                    "15. Avoid generic placeholders like 'search online' or 'various courses'.\n"
                    "ROADMAP RULE:\n"
                    "16. Assign 'short-term' or 'long-term' priority for each skill.\n"
                ),
            },
            {
                "role": "user",
                "content": (
                    f"{schema_instruction}\n\n"
                    "User profile data:\n"
                    f"{json.dumps(clean_dict(profile_data), ensure_ascii=False)}\n\n"
                    "Top in-demand skills in user's industry that they lack:\n"
                    f"{json.dumps(clean_dict(market_skills), ensure_ascii=False)}\n"
                ),
            },
        ]

        try:
            response = self._client.chat.completions.create(
                model=self._deployment,
                messages=messages,
                temperature=0.3,
            )

            content = (response.choices[0].message.content or "").strip()

            if not content.startswith("SkillDevelopmentTOON("):
                raise CareerAdvisorError(
                    "Invalid TOON format for skill development analysis"
                )

            # Convert TOON → JSON
            analysis_json = self._formatter.career_toon_to_json(content)

            return analysis_json

        except Exception as exc:
            logger.error(f"Skill development analysis failed: {exc}", exc_info=True)
            raise CareerAdvisorError(f"LLM skill analysis failed: {exc}") from exc
