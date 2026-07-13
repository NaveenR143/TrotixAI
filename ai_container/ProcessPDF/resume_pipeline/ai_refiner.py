from __future__ import annotations

import json
import os
from pathlib import Path
from uuid import UUID
from dotenv import load_dotenv

from .errors import AIRefinementError
from .models import DeterministicResumeData, JobSeekerProfile
from .toon import TOONFormatter

try:
    from openai import AzureOpenAI,OpenAI  # type: ignore
except Exception:  # pragma: no cover
    AzureOpenAI = None  # type: ignore
    OpenAI = None  # type: ignore

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
            "AZURE_OPENAI_API_VERSION", "2025-04-14"
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

        # self._client = AzureOpenAI(
        #     azure_endpoint=self._endpoint,
        #     api_key=self._api_key,
        #     api_version=self._api_version,
        # )
        self._client = OpenAI(
            base_url=self._endpoint,
            api_key=self._api_key,
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
                    "Your job is to convert unstructured resume text into the exact TOON schema provided.\n\n"
                    "CORE OBJECTIVE:\n"
                    "Extract accurate structured data from noisy, inconsistent, or poorly formatted resume text.\n\n"
                    "SUMMARY GENERATION RULES:\n"
                    "1. Extract two separate summary fields:\n"
                    "   - resume_summary:\n"
                    "     * Extract the summary/objective/profile/about/description section exactly as written in the resume.\n"
                    "     * Preserve the original wording as much as possible.\n"
                    "     * Do NOT rewrite, optimize, or paraphrase.\n"
                    "     * If multiple summary-like sections exist, merge them coherently.\n"
                    "     * If no explicit summary exists, return null.\n"
                    "   - summary:\n"
                    "     * Generate a concise professional summary based on the COMPLETE resume data.\n"
                    "     * Use experience, skills, education, projects, achievements, and technologies.\n"
                    "     * Write in clear professional language.\n"
                    "     * Keep it concise but informative (3-6 sentences).\n"
                    "     * Do NOT copy resume_summary directly unless it is the only available information.\n"
                    "     * Avoid hallucinations or unsupported claims.\n\n"
                    "GENERIC PARSING RULES:\n"
                    "1. Input may contain tables, bullet points, broken lines, or merged text.\n"
                    "2. Do NOT rely on formatting (columns, spacing, alignment).\n"
                    "3. Always prioritize semantic meaning over visual structure.\n"
                    "4. Merge related information even if split across multiple lines.\n"
                    "5. Treat nearby lines as related unless a clear section or entity boundary is detected.\n"
                    "6. Ignore noise such as:\n"
                    "   - Serial numbers, bullet symbols, table headers\n"
                    "   - Repeated labels or formatting artifacts\n"
                    "7. Prefer fewer, complete entities over many fragmented ones.\n\n"
                    "ENTITY DETECTION RULES:\n"
                    "1. Identify sections implicitly (experience, education, projects, skills, etc.) even if headers are inconsistent.\n"
                    "2. A valid entity (job, project, education) usually contains:\n"
                    "   - A name/title\n"
                    "   - Supporting details (dates, description, location, etc.)\n"
                    "3. If multiple lines describe the same entity, merge them.\n"
                    "4. If boundaries are unclear, group by proximity and meaning.\n\n"
                    "EXPERIENCE INTERPRETATION:\n"
                    "1. Extract company_name, title, and location even if written in a single sentence.\n"
                    "2. Separate company and location when combined.\n"
                    "3. Detect roles even if phrased in free text.\n"
                    "4. Infer is_current from context (e.g., 'present', 'current', 'since').\n"
                    "5. Ignore duration-only expressions unless exact dates can be derived.\n"
                    "6. All bullet points listed directly underneath a Company Name and Job Title MUST be retained completely inside the experience object's description or highlights field. Do NOT strip them out to create standalone entities in the projects array.\n"
                    "7. Format the experience description as valid HTML. Convert bullet points and sentences into an HTML unordered list (<ul>) with each point wrapped in a list item (<li>).\n\n"
                    "PROJECT INTERPRETATION:\n"
                    "1. Only extract an item into the standalone 'projects' array if it resides under an explicit, separate 'Projects', 'Key Engagements', or 'Academic Portfolios' header.\n"
                    "2. Do NOT treat standard client assignments, daily tasks, or bullet points found directly within a chronological 'Work Experience' section as separate entities for the 'projects' array.\n"
                    "3. If an initiative is executed as part of an official job role, its details belong strictly inside the 'experience' array, not the 'projects' array.\n"
                    "4. A valid project entity typically contains a dedicated, standalone project title, an independent date range independent of the company tenure, or an external repository link (e.g., GitHub).\n"
                    "5. Format the project description as valid HTML. Convert bullet points and sentences into an HTML unordered list (<ul>) with each point wrapped in a list item (<li>).\n\n"
                    "EDUCATION INTERPRETATION:\n"
                    "1. Extract institution, degree, and dates even if loosely formatted.\n"
                    "2. Map common academic terms to structured fields.\n"
                    "3. Infer missing structure from context where reasonable.\n\n"
                    "ACCOMPLISHMENTS, ACHIEVEMENTS & CERTIFICATIONS INTERPRETATION:\n"
                    "1. Extract all certifications, awards, achievements, and notable accomplishments into their respective arrays based on the schema.\n"
                    "2. For certifications and awards, extract the name/title, issuing organization, and issue date if available.\n"
                    "3. Distinguish between official certifications (e.g., 'AWS Certified Solutions Architect') and general professional achievements (e.g., 'Employee of the Month' or 'Published a paper').\n\n"
                    "NORMALIZATION RULES:\n"
                    "1. Remove duplicate entries across all arrays.\n"
                    "2. Normalize skills, technologies, and keywords to lowercase.\n"
                    "3. Keep text concise but meaningful.\n"
                    "4. Do NOT hallucinate missing data—use empty or null values.\n\n"
                    "OUTPUT CONSTRAINTS:\n"
                    "1. Output MUST strictly follow the provided TOON schema.\n"
                    "2. Do NOT add extra fields or text.\n"
                    "3. Ensure all values conform to required formats (dates, URLs, enums).\n\n"
                    "STRICT SYNTAX RULES:\n"
                    '1. Use only double quotes (") for all strings.\n'
                    '2. Escape internal quotes using \\".\n'
                    "3. Do NOT use } inside string values.\n"
                    "4. Use parentheses () ONLY for objects.\n"
                    "5. Every key MUST be followed by a colon.\n"
                    "6. Separate all fields with commas.\n"
                    "7. Do NOT produce trailing commas.\n"
                    "8. URLs must start with https://n"
                    "9. Do NOT break strings across lines.\n"
                    "10. If unsure, return null instead of invalid syntax.\n"
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
            if hasattr(response, "usage") and response.usage:
                print(f"Input tokens: {response.usage.prompt_tokens}, Output tokens: {response.usage.completion_tokens}")

            content = (response.choices[0].message.content or "").strip()

            # print("AI Content Generated : ", content)

            # 🔴 Strong validation
            if not content.startswith("JobSeekerProfileTOON("):
                raise AIRefinementError("Invalid TOON format (missing root object)")

            if not content.endswith(")"):
                raise AIRefinementError(
                    "Malformed TOON response (missing closing bracket)"
                )

            # with open("toon.txt", "w", encoding="utf-8") as _debug_file:
            #     _debug_file.write(content)

            profile_json = self._formatter.toon_to_json(content)

            # with open(
            #     Path.cwd() / f"profile_{user_id}.json", "w", encoding="utf-8"
            # ) as debug_file:
            #     json.dump(profile_json, debug_file, ensure_ascii=False, indent=2)

            # print(f"Profile saved for user {user_id}")

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
