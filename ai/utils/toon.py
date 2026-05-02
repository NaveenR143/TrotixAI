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
            "  ],\n"
            '   resume_summary: "str|empty"\n'
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
            "RESUME SUMMARY RULES (FOR EMBEDDING):\n"
            "- Generate a single-paragraph resume_summary optimized for semantic search.\n"
            "- Length: 60–120 words.\n"
            "- Use natural, professional English.\n"
            "- Do NOT use bullet points or labels.\n"
            "- Combine and prioritize meaning over structure.\n"
            "- Avoid repeating similar skills or terms.\n"
            "- Expand abbreviations where useful (e.g., sql → structured query language, etl → extract transform load).\n"
            "- Mention experience level:\n"
            "  * If years_of_experience = 0 → explicitly say 'fresher' or 'entry-level'.\n"
            "  * Otherwise include total years of experience.\n"
            "- Include the following if available:\n"
            "  * summary\n"
            "  * years_of_experience\n"
            "  * key skills (group logically)\n"
            "  * languages\n"
            "  * education (degree + field_of_study)\n"
            "  * preferred_locations\n"
            "- Ensure the summary is embedding-friendly (clear, descriptive, semantically rich).\n\n"
        )

    @staticmethod
    def build_career_schema_instructions() -> str:
        return (
            "Return ONLY this TOON object and nothing else.\n"
            "All fields MUST be populated. Use null ONLY if absolutely unavoidable.\n"
            "Each list MUST contain at least 2 items. NEVER return empty arrays.\n"
            "If data is missing, infer realistic and relevant entries.\n"
            "recommendations.courses and recommendations.certifications MUST NOT be empty.\n"
            "Every resource MUST include a valid https:// URL.\n"
            "Include handpicked free or open-source learning resources wherever possible.\n\n"
            "CareerAdviceTOON(\n"
            "  career_paths: [\n"
            "    CareerPathTOON(\n"
            '      title: "str",\n'
            '      description: "str",\n'
            "      match_score: number,\n"
            '      market_demand: "High|Medium|Low",\n'
            '      top_skills_needed: ["str", "str"]\n'
            "    )\n"
            "  ],\n"
            "  skill_gaps: [\n"
            "    SkillGapTOON(\n"
            '      skill: "str",\n'
            '      current_level: "str",\n'
            '      required_level: "str",\n'
            "      importance: number\n"
            "    )\n"
            "  ],\n"
            "  recommendations: (\n"
            "    courses: [\n"
            "      CourseTOON(\n"
            '        title: "str",\n'
            '        provider: "str",\n'
            '        url: "https://example.com"\n'
            "      )\n"
            "    ],\n"
            "    certifications: [\n"
            "      CertificationTOON(\n"
            '        title: "str",\n'
            '        provider: "str",\n'
            '        url: "https://example.com"\n'
            "      )\n"
            "    ],\n"
            "    higher_studies: [\n"
            "      HigherStudyTOON(\n"
            '        degree: "str",\n'
            '        specialization: "str",\n'
            '        mode: "Full-time|Part-time|Online",\n'
            '        duration: "str",\n'
            "        target_universities: [\n"
            "          UniversityTOON(\n"
            '            name: "str",\n'
            '            program: "str",\n'
            '            industry_alignment: "High|Medium|Low",\n'
            '            hiring_companies: ["str", "str"],\n'
            '            url: "https://example.com"\n'
            "          )\n"
            "        ],\n"
            '        entrance_exams: ["str", "str"],\n'
            '        url: "https://example.com"\n'
            "      )\n"
            "    ]\n"
            "  ),\n"
            "  action_plan: [\n"
            "    StepTOON(\n"
            '      phase: "str",\n'
            '      action: "str",\n'
            '      timeline: "str",\n'
            '      resources: ["https://example.com", "https://example.com"]\n'
            "    )\n"
            "  ]\n"
            ")\n"
        )

    @staticmethod
    def build_skill_development_instructions() -> str:
        return (
            "Return ONLY this TOON object and nothing else.\n"
            "Identify 8-10 key skills the user should develop to stay competitive based on market trends.\n"
            "Categorize each skill as 'technical', 'soft', or 'domain-specific'.\n"
            "Provide a clear rationale for why each skill is important.\n"
            "Suggest practical ways to learn each skill (projects, practice, courses, certifications).\n"
            "Additionally, include concrete learning resources such as URLs, course names, certifications, and institutions.\n"
            "Ensure resources include a mix of free and paid options where possible.\n"
            "Recommend a priority for the learning roadmap (short-term vs long-term).\n\n"
            "SkillDevelopmentTOON(\n"
            "  skills_analysis: [\n"
            "    SkillAnalysisTOON(\n"
            '      skill: "str",\n'
            '      category: "technical|soft|domain-specific",\n'
            '      importance_rationale: "str",\n'
            '      learning_suggestions: ["str", "str"],\n'
            "      resources: [\n"
            "        ResourceTOON(\n"
            '          name: "str",\n'
            '          type: "course|certification|website|book|project",\n'
            '          provider: "str",\n'
            '          url: "str",\n'
            '          cost: "free|paid",\n'
            '          description: "str"\n'
            "        )\n"
            "      ],\n"
            '      roadmap_priority: "short-term|long-term"\n'
            "    )\n"
            "  ]\n"
            ")\n"
        )

    @staticmethod
    def build_application_email_instructions() -> str:
        return (
            "Return ONLY this TOON object and nothing else.\n"
            "Generate a highly personalized application email based on the user's profile and the job description.\n"
            "The subject line should be professional and catchy.\n"
            "The body should highlight the user's most relevant skills and experiences that match the job requirements.\n\n"
            "ApplicationEmailTOON(\n"
            '  subject: "str",\n'
            '  body: "str"\n'
            ")\n"
        )

    @staticmethod
    def build_resume_enhancement_instructions() -> str:
        return (
            "You are a resume enhancement engine.\n"
            "STRICT OUTPUT RULES:\n"
            "- Output ONLY a valid EnhancedResumeTOON object.\n"
            "- Do NOT include explanations, markdown, or extra text.\n"
            "- Do NOT invent or assume any user experience, skills, or achievements.\n"
            "- Only rewrite or improve what is explicitly provided.\n\n"
            "TASK:\n"
            "Improve the user's resume content for ATS optimization, clarity, and impact while preserving factual accuracy.\n\n"
            "GUIDELINES:\n"
            "- Summary must be 60–100 words, professional, and concise.\n"
            "- Skills must be grouped, relevant, and industry-standard.\n"
            "- Work experience must use strong action verbs and quantify impact where present.\n"
            "- Projects must highlight technologies, outcomes, and real impact.\n"
            "- If data is missing, do NOT fabricate it—keep it minimal or reuse original meaning.\n\n"
            "OUTPUT SCHEMA (must match exactly):\n"
            "EnhancedResumeTOON(\n"
            "  summary: str,\n"
            "  skills: list[str],\n"
            "  workExperience: list[ExperienceEnhancementTOON],\n"
            "  projects: list[ProjectEnhancementTOON],\n"
            ")\n\n"
            "ExperienceEnhancementTOON(\n"
            "  company_name: str,\n"
            "  title: str,\n"
            "  original_description: str,\n"
            "  enhanced_description: str,\n"
            "  key_achievements: list[str]\n"
            ")\n\n"
            "ProjectEnhancementTOON(\n"
            "  name: str,\n"
            "  original_description: str,\n"
            "  enhanced_description: str,\n"
            "  technologies: list[str],\n"
            "  impact: str\n"
            ")\n"
        )

    def toon_to_json(self, toon_str: str) -> dict:
        """
        Convert a TOON-formatted string to a Python dict.

        The TOON format looks like Python dataclass constructors:
            JobSeekerProfileTOON(
                key: "value",
                nested: SomeOtherTOON(x: 1),
            )

        Key fixes vs. the original:
        1. String values are extracted into placeholders BEFORE any structural
        transformation — this prevents parens, colons, or keywords inside
        string values (e.g. "BBA LLB (Hons.)", "https://...") from being
        mangled by the regex steps that follow.
        2. Step 2 (`)` → `}`) now also matches the root-object closing `)` at
        end-of-string, not just `)` followed by `,`/`}`/`]`.
        3. Steps 2.1 and 3.1/3.2 from the original are removed — they are
        unnecessary (and harmful) once strings are protected by placeholders.
        """
        original = toon_str
        try:
            toon_str = toon_str.strip()

            # ── Step 1 ──────────────────────────────────────────────────────────
            # Replace *TOON( wrappers with {
            # e.g. JobSeekerProfileTOON( → {   ExperienceTOON( → {
            toon_str = re.sub(r"\b\w+TOON\(", "{", toon_str)

            # ── Step 2 ──────────────────────────────────────────────────────────
            # Protect ALL quoted string values with opaque placeholder tokens
            # BEFORE touching any parentheses or keys.
            # This is the critical fix: parens/colons inside strings (e.g.
            # "BBA LLB (Hons.)", "https://...", "Sections 230–232") are hidden
            # from every subsequent regex step.
            placeholders: dict[str, str] = {}
            counter = [0]

            def _extract_string(m: re.Match) -> str:
                token = f'"__STR{counter[0]}__"'
                placeholders[token] = m.group(0)
                counter[0] += 1
                return token

            toon_str = re.sub(r'"(?:[^"\\]|\\.)*"', _extract_string, toon_str)

            # ── Step 3 ──────────────────────────────────────────────────────────
            # Replace structural closing ) with }
            # Matches ) followed by: ,  }  ]  or end-of-string (handles the root
            # object's closing paren which has nothing after it).
            toon_str = re.sub(r"\)(?=\s*[,\}\]]|\s*$)", "}", toon_str)

            # ── Step 4 ──────────────────────────────────────────────────────────
            # Quote bare identifier keys.
            # Safe to run now — all string content is replaced by __STRn__ tokens
            # so there's no risk of mangling URLs, empty strings, or colons inside
            # values.
            toon_str = re.sub(r"(\b\w+\b)\s*:", r'"\1":', toon_str)

            # ── Step 5 ──────────────────────────────────────────────────────────
            # Restore original string values from placeholders
            for token, original_val in placeholders.items():
                toon_str = toon_str.replace(token, original_val)

            # ── Step 6 ──────────────────────────────────────────────────────────
            # Normalize TOON / Python literals → valid JSON
            toon_str = re.sub(r"\bempty\b", "null", toon_str)  # TOON empty
            toon_str = re.sub(r"\bNone\b", "null", toon_str)  # Python None
            toon_str = toon_str.replace("True", "true")  # Python True
            toon_str = toon_str.replace("False", "false")  # Python False

            # ── Step 7 ──────────────────────────────────────────────────────────
            # Remove trailing commas before } or ] (common LLM output artifact)
            toon_str = re.sub(r",\s*(\}|\])", r"\1", toon_str)

            # Step 8 — replace both \r\n and lone \r
            toon_str = (
                toon_str.replace("\r\n", " ").replace("\r", " ").replace("\n", " ")
            )

            return json.loads(toon_str)

        except json.JSONDecodeError as e:
            print(
                "TOON→JSON parse failed | %s | line %d col %d | context: %r",
                e.msg,
                e.lineno,
                e.colno,
                toon_str[max(0, e.pos - 120) : e.pos + 120],
            )
            raise ValueError(
                f"Failed to parse TOON string: {e.msg} "
                f"at line {e.lineno}, col {e.colno}"
            ) from e

    def career_toon_to_json(self, toon_str: str) -> dict:
        """
        Convert a TOON-formatted string to a Python dict.

        Fixes:
        - Handles TOON(...) → {}
        - Handles non-TOON object parentheses like: key: (...)
        - Protects strings before transformations
        - Cleans trailing commas and literals
        """

        try:
            toon_str = toon_str.strip()

            # ── Step 1 ──────────────────────────────────────────────────────────
            # Replace TOON constructors → {
            toon_str = re.sub(r"\b\w+TOON\(", "{", toon_str)

            # Handle non-TOON parentheses used as objects (e.g. key: (...))
            toon_str = re.sub(r"([:,]\s*)\(", r"\1{", toon_str)

            # ── Step 2 ──────────────────────────────────────────────────────────
            # Extract and protect all string literals
            placeholders = {}
            counter = [0]

            def _extract_string(m: re.Match) -> str:
                token = f'"__STR{counter[0]}__"'
                placeholders[token] = m.group(0)
                counter[0] += 1
                return token

            toon_str = re.sub(r'"(?:[^"\\]|\\.)*"', _extract_string, toon_str)

            # ── Step 3 ──────────────────────────────────────────────────────────
            # Replace closing ) → }
            toon_str = re.sub(r"\)(?=\s*[,\}\]]|\s*$)", "}", toon_str)

            # ── Step 4 ──────────────────────────────────────────────────────────
            # Quote keys
            toon_str = re.sub(r"(\b\w+\b)\s*:", r'"\1":', toon_str)

            # ── Step 5 ──────────────────────────────────────────────────────────
            # Restore strings
            for token, original_val in placeholders.items():
                toon_str = toon_str.replace(token, original_val)

            # ── Step 6 ──────────────────────────────────────────────────────────
            # Normalize literals
            toon_str = re.sub(r"\bempty\b", "null", toon_str)
            toon_str = re.sub(r"\bNone\b", "null", toon_str)
            toon_str = toon_str.replace("True", "true")
            toon_str = toon_str.replace("False", "false")

            # ── Step 7 ──────────────────────────────────────────────────────────
            # Remove trailing commas
            toon_str = re.sub(r",\s*(\}|\])", r"\1", toon_str)

            # ── Step 8 ──────────────────────────────────────────────────────────
            # Normalize whitespace
            toon_str = (
                toon_str.replace("\r\n", " ").replace("\r", " ").replace("\n", " ")
            )

            # ── Final parse ─────────────────────────────────────────────────────
            return json.loads(toon_str)

        except Exception as e:
            raise ValueError(
                f"Failed to parse TOON string.\nError: {e}\nProcessed string:\n{toon_str}"
            )

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
