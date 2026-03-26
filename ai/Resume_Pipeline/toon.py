from __future__ import annotations

import re
from decimal import Decimal
from typing import Sequence
from uuid import UUID

from .models import DeterministicResumeData, JobSeekerProfile


class TOONFormatter:
    """
    Builds and parses a TOON payload.

    TOON (Typed Object-Oriented Notation) is represented as a strict tagged format:
      JobSeekerProfileTOON(
        headline: "..."
        skills: ["python", "fastapi"]
        ...
      )
    """

    @staticmethod
    def build_input(data: DeterministicResumeData, chunks: Sequence[str]) -> str:
        skill_blob = ", ".join(data.skills)
        titles_blob = ", ".join(data.job_titles)
        edu_blob = " | ".join(data.education_lines[:5])
        safe = lambda value: (value or "").replace('"', "'")
        return (
            "DeterministicResumeTOON(\n"
            f"  name: \"{safe(data.name)}\"\n"
            f"  email: \"{safe(data.email)}\"\n"
            f"  phone: \"{safe(data.phone)}\"\n"
            f"  skills: [{skill_blob}]\n"
            f"  experience_years: \"{data.experience_years or ''}\"\n"
            f"  job_titles: [{titles_blob}]\n"
            f"  education_lines: \"{edu_blob}\"\n"
            f"  summary: \"{safe(data.summary)}\"\n"
            f"  location: \"{safe(data.current_location)}\"\n"
            f"  linkedin_url: \"{safe(data.linkedin_url)}\"\n"
            f"  github_url: \"{safe(data.github_url)}\"\n"
            f"  portfolio_url: \"{safe(data.portfolio_url)}\"\n"
            f"  chunks: {len(chunks)}\n"
            ")\n"
        )

    @staticmethod
    def build_schema_instructions() -> str:
        return (
            "Return ONLY this TOON object and nothing else:\n"
            "JobSeekerProfileTOON(\n"
            "  headline: \"str\"\n"
            "  summary: \"str\"\n"
            "  current_location: \"str\"\n"
            "  preferred_locations: [\"str\", ...]\n"
            "  years_of_experience: \"number\"\n"
            "  notice_period_days: \"int|empty\"\n"
            "  current_salary: \"number|empty\"\n"
            "  expected_salary: \"number|empty\"\n"
            "  salary_currency: \"INR|USD|EUR|...\"\n"
            "  linkedin_url: \"str|empty\"\n"
            "  github_url: \"str|empty\"\n"
            "  portfolio_url: \"str|empty\"\n"
            "  skills: [\"str\", ...]\n"
            "  parsed_job_titles: [\"str\", ...]\n"
            "  work_experiences: [\n"
            "    ExperienceTOON(company_name:\"str\", title:\"str\", location:\"str|empty\", start_date:\"YYYY-MM-DD|empty\", end_date:\"YYYY-MM-DD|empty\", is_current:\"true|false\", description:\"str|empty\", skills_used:[\"str\"], achievements:[\"str\"])\n"
            "  ]\n"
            "  education: [\n"
            "    EducationTOON(institution:\"str\", degree:\"str|empty\", field_of_study:\"str|empty\", grade:\"str|empty\", start_year:\"int|empty\", end_year:\"int|empty\", is_current:\"true|false\", description:\"str|empty\")\n"
            "  ]\n"
            ")\n"
            "Rules: keep missing fields empty, do not invent employers/dates, normalize skills to lowercase."
        )

    def parse_profile(self, user_id: UUID, toon_text: str, fallback: DeterministicResumeData) -> JobSeekerProfile:
        def extract_scalar(key: str) -> str | None:
            match = re.search(rf"{re.escape(key)}:\s*\"([^\"]*)\"", toon_text)
            return match.group(1).strip() if match else None

        def extract_list(key: str) -> list[str]:
            match = re.search(rf"{re.escape(key)}:\s*\[([^\]]*)\]", toon_text, flags=re.DOTALL)
            if not match:
                return []
            body = match.group(1)
            items = [item.strip().strip("\"'") for item in body.split(",")]
            return sorted({i for i in items if i})

        years = self._to_decimal(extract_scalar("years_of_experience")) or fallback.experience_years
        headline = extract_scalar("headline") or (fallback.job_titles[0] if fallback.job_titles else None)
        summary = extract_scalar("summary") or fallback.summary
        parsed_summary = summary
        location = extract_scalar("current_location") or fallback.current_location
        skills = extract_list("skills") or fallback.skills
        parsed_titles = extract_list("parsed_job_titles") or fallback.job_titles

        return JobSeekerProfile(
            user_id=user_id,
            headline=headline,
            summary=summary,
            current_location=location,
            preferred_locations=extract_list("preferred_locations"),
            years_of_experience=years,
            notice_period_days=self._to_int(extract_scalar("notice_period_days")),
            current_salary=self._to_decimal(extract_scalar("current_salary")),
            expected_salary=self._to_decimal(extract_scalar("expected_salary")),
            salary_currency=(extract_scalar("salary_currency") or "INR"),
            linkedin_url=extract_scalar("linkedin_url") or fallback.linkedin_url,
            github_url=extract_scalar("github_url") or fallback.github_url,
            portfolio_url=extract_scalar("portfolio_url") or fallback.portfolio_url,
            skills=skills,
            work_experiences=[],
            education=[],
            parsed_job_titles=parsed_titles,
            parsed_summary=parsed_summary,
            raw_text=fallback.clean_text,
        )

    @staticmethod
    def _to_decimal(value: str | None) -> Decimal | None:
        if not value:
            return None
        try:
            return Decimal(value)
        except Exception:
            return None

    @staticmethod
    def _to_int(value: str | None) -> int | None:
        if not value:
            return None
        try:
            return int(value)
        except Exception:
            return None

