from __future__ import annotations

import re
from decimal import Decimal
from typing import Sequence
from uuid import UUID
import json

from .models import (
    DeterministicResumeData,
    JobSeekerProfile,
    EducationEntry,
    WorkExperience,
)


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

        def safe(value):
            return (value or "").replace('"', "'")

        return (
            "DeterministicResumeTOON(\n"
            f'  name: "{safe(data.name)}"\n'
            f'  email: "{safe(data.email)}"\n'
            f'  phone: "{safe(data.phone)}"\n'
            f"  skills: [{skill_blob}]\n"
            f"  experience_years: \"{data.experience_years or ''}\"\n"
            f"  job_titles: [{titles_blob}]\n"
            f'  education_lines: "{edu_blob}"\n'
            f'  summary: "{safe(data.summary)}"\n'
            f'  location: "{safe(data.current_location)}"\n'
            f'  linkedin_url: "{safe(data.linkedin_url)}"\n'
            f'  github_url: "{safe(data.github_url)}"\n'
            f'  portfolio_url: "{safe(data.portfolio_url)}"\n'
            f"  chunks: {len(chunks)}\n"
            ")\n"
        )

    @staticmethod
    def build_schema_instructions() -> str:
        return (
            "Return ONLY this TOON object and nothing else:\n\n"
            "JobSeekerProfileTOON(\n"
            '  headline: "str",\n'
            '  summary: "str",\n'
            '  current_location: "str",\n'
            '  preferred_locations: ["str", ...],\n'
            "  years_of_experience: number,\n"
            "  notice_period_days: int|empty,\n"
            "  current_salary: number|empty,\n"
            "  expected_salary: number|empty,\n"
            '  salary_currency: "INR|USD|EUR|...",\n'
            '  linkedin_url: "str|empty",\n'
            '  github_url: "str|empty",\n'
            '  portfolio_url: "str|empty",\n'
            '  languages: ["str", ...],\n'
            '  skills: ["str", ...],\n'
            '  parsed_job_titles: ["str", ...],\n\n'
            "  work_experiences: [\n"
            "    ExperienceTOON(\n"
            '      company_name: "str",\n'
            '      title: "str",\n'
            '      location: "str|empty",\n'
            '      start_date: "YYYY-MM-DD|empty",\n'
            '      end_date: "YYYY-MM-DD|empty",\n'
            "      is_current: true|false,\n"
            '      description: "str|empty",\n'
            '      skills_used: ["str", ...],\n'
            '      achievements: ["str", ...],\n'
            '      keywords: ["str", ...],\n'
            "      projects: [\n"
            "        ProjectTOON(\n"
            '          name: "str",\n'
            '          description: "str|empty",\n'
            '          technologies: ["str", ...],\n'
            '          role: "str|empty",\n'
            '          start_date: "YYYY-MM-DD|empty",\n'
            '          end_date: "YYYY-MM-DD|empty",\n'
            "          is_current: true|false,\n"
            '          achievements: ["str", ...],\n'
            '          keywords: ["str", ...]\n'
            "        )\n"
            "      ]\n"
            "    )\n"
            "  ],\n\n"
            "  education: [\n"
            "    EducationTOON(\n"
            '      institution: "str",\n'
            '      institution_type: "college|university|school|board|empty",\n'
            '      degree: "str|empty",\n'
            '      qualification: "str|empty",\n'
            '      field_of_study: ["str", ...],\n'
            '      grade: "str|empty",\n'
            '      grade_type: "cgpa|percentage|gpa|rank|empty",\n'
            "      start_year: int|empty,\n"
            "      end_year: int|empty,\n"
            "      is_current: true|false,\n"
            '      description: "str|empty",\n'
            '      keywords: ["str", ...],\n'
            "      projects: [\n"
            "        ProjectTOON(\n"
            '          name: "str",\n'
            '          description: "str|empty",\n'
            '          technologies: ["str", ...],\n'
            '          role: "str|empty",\n'
            '          start_date: "YYYY-MM-DD|empty",\n'
            '          end_date: "YYYY-MM-DD|empty",\n'
            "          is_current: true|false,\n"
            '          achievements: ["str", ...],\n'
            '          keywords: ["str", ...]\n'
            "        )\n"
            "      ]\n"
            "    )\n"
            "  ],\n\n"
            "  projects: [\n"
            "    ProjectTOON(\n"
            '      name: "str",\n'
            '      description: "str|empty",\n'
            '      technologies: ["str", ...],\n'
            '      role: "str|empty",\n'
            '      start_date: "YYYY-MM-DD|empty",\n'
            '      end_date: "YYYY-MM-DD|empty",\n'
            "      is_current: true|false,\n"
            '      achievements: ["str", ...],\n'
            '      keywords: ["str", ...],\n'
            '      project_type: "professional|academic|personal|unknown"\n'
            "    )\n"
            "  ]\n"
            ")\n\n"
            "STRICT RULES:\n"
            "- Return ONLY the object. No explanation.\n"
            "- Do NOT hallucinate data.\n"
            "- Use empty values when missing.\n"
            "- Normalize all skills, technologies, and keywords to lowercase.\n"
            "- Remove duplicates in arrays.\n\n"
            "PROJECT EXTRACTION RULES:\n"
            "- Extract projects from ANY section: experience, education, or separate 'projects' section.\n"
            "- Classify project_type:\n"
            "  * professional → if part of job/company\n"
            "  * academic → if part of degree/college\n"
            "  * personal → side/self projects\n"
            "- If project belongs to a job → include inside that experience.projects\n"
            "- If project belongs to education → include inside education.projects\n"
            "- If standalone → include in top-level projects array\n"
            "- Always extract technologies used in projects\n"
            "- Infer technologies from description if not explicitly listed\n"
            "- Extract achievements like impact, metrics, improvements\n\n"
            "EDUCATION RULES:\n"
            "- 'board', 'cbse', 'icse' → institution_type=board\n"
            "- '12th', '10th' → degree\n"
            "- 'year of completion', 'passed out' → end_year\n"
            "- Extract cgpa/percentage properly\n\n"
            "DATE RULES:\n"
            "- Use YYYY-MM-DD format\n"
            "- If only year is available → YYYY-01-01\n"
        )

    # Remove trailing commas recursively inside objects and arrays
    def remove_trailing_commas(self, json_str):
        # Remove trailing commas in objects and arrays
        json_str = re.sub(r",\s*([\]}])", r"\1", json_str)
        return json_str

    def toon_to_json(self, toon_str: str) -> dict:
        try:
            # 1️⃣ Replace class-like wrappers
            toon_str = re.sub(r"\b\w+TOON\(", "{", toon_str)

            # 2️⃣ Replace closing parentheses with }
            toon_str = toon_str.replace(")", "}")

            # 3️⃣ Convert keys to JSON strings
            toon_str = re.sub(r"(\b\w+\b)\s*:", r'"\1":', toon_str)

            # 4️⃣ Replace standalone empty with null
            toon_str = re.sub(r"\bempty\b", "null", toon_str)

            # 5️⃣ Convert Python booleans to JSON booleans
            toon_str = toon_str.replace("True", "true").replace("False", "false")

            toon_str = self.remove_trailing_commas(toon_str)

            # 6️⃣ Remove trailing commas before } or ]
            toon_str = re.sub(r",\s*(\}|])", r"\1", toon_str)

            # ✅ Convert to dict
            return json.loads(toon_str)

        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {e}")
            print(f"Invalid JSON at line {e.lineno}, col {e.colno}: {e.msg}")
            print(f"Attempted JSON (first 500 chars):\n{toon_str[:500]}...")
            raise

    def parse_profile(self, user_id: UUID, toon_text: str) -> JobSeekerProfile:
        with open("toon.txt", "w", encoding="utf-8") as _debug_file:
            _debug_file.write(toon_text)

        def normalize(value: str | None) -> str | None:
            if value is None:
                return None
            value = value.strip().strip('"').strip("'")
            return None if value.lower() == "empty" or value == "" else value

        def extract_scalar(key: str) -> str | None:
            match = re.search(rf"{re.escape(key)}:\s*(\"([^\"]*)\"|[^,\n]+)", toon_text)
            if not match:
                return None
            raw = match.group(1)
            return normalize(raw)

        def extract_list(key: str) -> list[str]:
            match = re.search(
                rf"{re.escape(key)}:\s*\[(.*?)\]",
                toon_text,
                flags=re.DOTALL,
            )
            if not match:
                return []

            body = match.group(1)

            items = re.findall(r'"([^"]*)"|\'([^\']*)\'|([^,\n]+)', body)

            cleaned = []
            for g1, g2, g3 in items:
                val = g1 or g2 or g3
                val = normalize(val)
                if val:
                    cleaned.append(val)

            return sorted(set(cleaned))

        years = self._to_decimal(extract_scalar("years_of_experience"))
        headline = extract_scalar("headline")
        summary = extract_scalar("summary")
        parsed_summary = summary
        location = extract_scalar("current_location")
        skills = extract_list("skills")
        parsed_titles = extract_list("parsed_job_titles")

        education = self._parse_education_entries(toon_text)

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
            salary_currency=extract_scalar("salary_currency") or "INR",
            linkedin_url=extract_scalar("linkedin_url"),
            github_url=extract_scalar("github_url"),
            portfolio_url=extract_scalar("portfolio_url"),
            skills=skills,
            work_experiences=[],
            education=education,
            parsed_job_titles=parsed_titles,
            parsed_summary=parsed_summary,
            raw_text=None,
        )

    def _parse_education_entries(self, toon_text: str) -> list[EducationEntry]:
        """Parse EducationTOON objects from the TOON response."""
        education_list = []

        # Find the education array in the TOON response
        match = re.search(r"education:\s*\[(.*?)\](?=\s*[\),])", toon_text, re.DOTALL)
        if not match:
            return education_list

        education_block = match.group(1)

        # Find all EducationTOON(...) entries
        for edu_match in re.finditer(
            r"EducationTOON\((.*?)\)", education_block, re.DOTALL
        ):
            edu_content = edu_match.group(1)

            # Extract fields from EducationTOON
            institution = self._extract_field(edu_content, "institution")
            degree = self._extract_field(edu_content, "degree")
            field_of_study = self._extract_field(edu_content, "field_of_study")
            grade = self._extract_field(edu_content, "grade")
            start_year_str = self._extract_field(edu_content, "start_year")
            end_year_str = self._extract_field(edu_content, "end_year")
            is_current_str = self._extract_field(edu_content, "is_current")
            description = self._extract_field(edu_content, "description")

            # Only add if institution is present
            if institution:
                education_list.append(
                    EducationEntry(
                        institution=institution,
                        degree=degree,
                        field_of_study=field_of_study,
                        grade=grade,
                        start_year=self._to_int(start_year_str),
                        end_year=self._to_int(end_year_str),
                        is_current=is_current_str and is_current_str.lower() == "true",
                        description=description,
                    )
                )

        return education_list

    @staticmethod
    def _extract_field(content: str, field_name: str) -> str | None:
        """Extract a field value from TOON object content."""
        # Match field_name:"value" or field_name:value (for non-strings)
        pattern = rf'{re.escape(field_name)}:\s*"?([^",\)]*)"?'
        match = re.search(pattern, content)
        if match:
            value = match.group(1).strip()
            return value if value else None
        return None

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
