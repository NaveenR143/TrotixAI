from __future__ import annotations

import re

from decimal import Decimal
from typing import Sequence

from .models import DeterministicResumeData

# import spacy
# name_nlp = spacy.load("en_core_web_sm")


class DeterministicExtractor:
    """Extracts structured fields using regex and deterministic rules."""

    SKILL_DICTIONARY = {
        # Technology
        "python",
        "java",
        "javascript",
        "typescript",
        "go",
        "rust",
        "c#",
        "c++",
        "react",
        "angular",
        "vue",
        "node.js",
        "fastapi",
        "django",
        "flask",
        "sql",
        "postgresql",
        "mysql",
        "mongodb",
        "redis",
        "aws",
        "azure",
        "gcp",
        "docker",
        "kubernetes",
        "terraform",
        "git",
        "github",
        "ci/cd",
        "pandas",
        "numpy",
        "scikit-learn",
        "pytorch",
        "tensorflow",
        "nlp",
        "llm",
        # Business / operations
        "sales",
        "negotiation",
        "crm",
        "lead generation",
        "business development",
        "marketing",
        "digital marketing",
        "seo",
        "sem",
        "content strategy",
        "operations",
        "supply chain",
        "procurement",
        "inventory management",
        "quality assurance",
        "lean",
        "six sigma",
        # Finance / analytics
        "accounting",
        "bookkeeping",
        "financial analysis",
        "budgeting",
        "auditing",
        "excel",
        "power bi",
        "tableau",
        "data analysis",
        # Healthcare / life sciences
        "patient care",
        "clinical research",
        "medical coding",
        "phlebotomy",
        "nursing",
        "ehr",
        # Education / HR / support
        "teaching",
        "curriculum development",
        "classroom management",
        "recruitment",
        "talent acquisition",
        "employee engagement",
        "customer service",
        "call center",
        "conflict resolution",
    }

    TITLE_PATTERNS = (
        r"\bsoftware engineer\b",
        r"\bfull[- ]stack (developer|engineer)\b",
        r"\bbackend (developer|engineer)\b",
        r"\bfrontend (developer|engineer)\b",
        r"\bdata (engineer|scientist|analyst)\b",
        r"\bmachine learning engineer\b",
        r"\bdevops engineer\b",
        r"\bproduct manager\b",
        r"\bproject manager\b",
        r"\bbusiness analyst\b",
        r"\bsales (executive|manager|representative)\b",
        r"\bmarketing (executive|manager|specialist)\b",
        r"\baccountant\b",
        r"\bfinancial analyst\b",
        r"\bhr (executive|manager|generalist)\b",
        r"\brecruiter\b",
        r"\bteacher\b",
        r"\blecturer\b",
        r"\bnurse\b",
        r"\bpharmacist\b",
        r"\bcustomer support (executive|specialist|representative)\b",
        r"\boperations (executive|manager|specialist)\b",
    )

    EDUCATION_KEYWORDS = (
        "university",
        "college",
        "school",
        "institute",
        "academy",
        "bachelor",
        "master",
        "phd",
        "doctorate",
        "diploma",
        "certificate",
        "b.tech",
        "m.tech",
        "b.e",
        "m.e",
        "mba",
        "bba",
        "b.com",
        "m.com",
        "mbbs",
        "b.sc",
        "m.sc",
        "b.a.",
        "b.s.",
        "m.a.",
        "m.s.",
        "b.s.c",
        "m.s.c",
        "degree",
        "graduation",
        "qualification",
        "academic",
    )

    PROJECT_KEYWORDS = (
        "project",
        "academic project",
        "mini project",
        "major project",
        "capstone",
        "thesis",
        "dissertation",
        "portfolio project",
        "freelance project",
        "research project",
        "development project",
        "duration",
    )

    LOCATION_KEYWORDS = (
        "remote",
        "hybrid",
        "onsite",
        "india",
        "usa",
        "uk",
        "uae",
        "singapore",
        "canada",
        "australia",
        "bangalore",
        "bengaluru",
        "hyderabad",
        "chennai",
        "pune",
        "mumbai",
        "delhi",
        "noida",
        "gurgaon",
        "kolkata",
        "ahmedabad",
    )

    EMAIL_RE = re.compile(
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
    PHONE_RE = re.compile(
        r"""
        (?<!\d)           # not preceded by a digit
        (?<!\/)           # not preceded by / (inside a URL)
        \+?
        (?:91[-\s]?)?     # optional India country code
        [6-9]\d{9}        # Indian mobile: starts 6-9, exactly 10 digits
        (?!\d)            # not followed by a digit
        """,
        re.VERBOSE,
    )
    EXPERIENCE_RE = re.compile(
        r"(\d+(?:\.\d+)?)\+?\s*(years?|yrs?)", re.IGNORECASE)

    def _extract_phone_numbers(self, text: str) -> list[str]:
        if not text:
            return []

        matches = self.PHONE_RE.findall(text)

        cleaned_numbers = []
        seen = set()

        for num in matches:
            # Remove +91, 91-, 91 , etc.
            num = re.sub(r"^\+?91[-\s]?", "", num)

            if num not in seen:
                seen.add(num)
                cleaned_numbers.append(num)

        return cleaned_numbers

    def extract(self, clean_text: str, first_five_lines: str) -> DeterministicResumeData:
        lowered = clean_text.lower()
        lines = first_five_lines.splitlines()

        email = self._first_match(self.EMAIL_RE, clean_text)
        phone = self._extract_phone_numbers(clean_text)
        name = self._extract_name(lines, email)
        languages = self._extract_languages(lowered)
        # years = self._extract_experience_years(clean_text)
        # skills = sorted(skill for skill in self.SKILL_DICTIONARY if skill in lowered)
        # education_lines = self._extract_education_lines(lines)
        # project_lines = self._extract_project_lines(lines)
        # job_titles = self._extract_job_titles(lowered, lines)
        # summary = " ".join(lines[:3])[:500] if lines else None
        current_location = self._extract_location(lines)

        return DeterministicResumeData(
            name=name,
            email=email,
            phone=phone,
            languages=languages,
            # education_lines=education_lines,
            # project_lines=project_lines,
            # skills=skills,
            # experience_years=years,
            # job_titles=job_titles,
            # summary=summary,
            # current_location=current_location,
            # linkedin_url=self._extract_url(clean_text, "linkedin.com"),
            # github_url=self._extract_url(clean_text, "github.com"),
            # portfolio_url=self._extract_portfolio_url(clean_text),
            # clean_text=clean_text,
        )

    @staticmethod
    def _first_match(pattern: re.Pattern[str], text: str) -> str | None:
        match = pattern.search(text)
        return match.group(0).strip() if match else None

    NAME_RE = re.compile(r"^[A-Za-z][A-Za-z\s.'-]{1,49}$")

    def _extract_name(self, lines: Sequence[str], email: str | None) -> str | None:
        for line in lines[:8]:
            line = line.strip()

            if not line:
                continue

            # Skip if contains email
            if email and email in line:
                continue

            # Skip structured lines (key-value pairs, tables)
            if "\t" in line or ":" in line:
                continue

            # Skip lines with digits or special chars
            if not self.NAME_RE.match(line):
                continue

            if len(line) >= 50:
                continue

            words = line.split()

            # 2–5 words: covers "John Smith", "Saran Kumar N M", "A. B. Kumar Das"
            if not (2 <= len(words) <= 5):
                continue

            # Each word must be a non-empty alpha token (allows initials like "N", "M")
            if not all(re.match(r"^[A-Za-z.'-]+$", w) for w in words):
                continue

            # All words must start uppercase (handles both Title Case and ALLCAPS)
            if not all(w[0].isupper() for w in words):
                continue

            return line

        return None

    # def _extract_name(self, text: str) -> str | None:
    #     doc = name_nlp(text)  # limit for performance
    #     for ent in doc.ents:
    #         if ent.label_ == "PERSON":
    #             return ent.text
    #     return None

    def _extract_education_lines(self, lines: Sequence[str]) -> list[str]:
        """Extract lines from the education section of the resume."""
        education_lines = []

        # Strategy 1: Try to find structured education section headers
        edu_section_start = None
        for i, line in enumerate(lines):
            line_lower = line.lower()
            if any(
                keyword in line_lower
                for keyword in (
                    "educational qualification",
                    "qualification",
                    "education",
                )
            ):
                edu_section_start = i
                break

        if edu_section_start is not None:
            # Extract lines after education section header
            # Skip the header itself and empty lines
            for i in range(
                edu_section_start + 1, min(edu_section_start + 30, len(lines))
            ):
                line = lines[i].strip()
                if not line:
                    continue

                line_lower = line.lower()

                # Skip section headers (lines that are ONLY section titles, not data)
                # But keep lines with table separators (|) or dates
                if any(
                    header in line_lower
                    for header in (
                        "academic project",
                        "additional qualification",
                        "experience",
                        "skill",
                        "certification",
                        "declaration",
                        "personal",
                        "area",
                        "strength",
                    )
                ) and not ("|" in line or re.match(r"^\d{4}", line)):
                    continue

                # Include lines that look like qualifications, dates, or table data
                if (
                    any(keyword in line_lower for keyword in self.EDUCATION_KEYWORDS)
                    or re.match(r"^\d{4}", line)
                    or "|" in line
                ):
                    education_lines.append(line)

        # Strategy 2 (Fallback): Find all lines with education keywords
        if len(education_lines) < 3:
            fallback_lines = [
                line
                for line in lines
                if any(keyword in line.lower() for keyword in self.EDUCATION_KEYWORDS)
            ]
            # Prefer fallback if it finds more lines
            if len(fallback_lines) > len(education_lines):
                education_lines = fallback_lines

        return education_lines[:12]

    def _extract_languages(self, resume_text: str) -> list[str]:
        """
        Extract spoken languages from resume text.
        Supports Indian languages and major international languages.
        """
        # Comprehensive language list: Indian languages + major international languages
        language_list = [
            # Indian languages (official + widely spoken)
            "hindi",
            "english",
            "bengali",
            "telugu",
            "marathi",
            "tamil",
            "gujarati",
            "urdu",
            "kannada",
            "odia",
            "odiya",
            "malayalam",
            "punjabi",
            "assamese",
            "maithili",
            "santali",
            "sanskrit",
            "sindhi",
            "kashmiri",
            "manipuri",
            "mizo",
            "nagamese",
            "konkani",
            "dogri",
            "khasi",
            "angika",
            "magahi",
            # Major international languages
            "spanish",
            "french",
            "german",
            "chinese",
            "mandarin",
            "cantonese",
            "japanese",
            "korean",
            "arabic",
            "russian",
            "portuguese",
            "italian",
            "dutch",
            "swedish",
            "polish",
            "turkish",
            "thai",
            "vietnamese",
            "indonesian",
            "malay",
            "tagalog",
            "czech",
            "greek",
            "hebrew",
            "farsi",
            "persian",
            "hungarian",
            "finnish",
            "romanian",
            "bulgarian",
            "serbian",
            "croatian",
            "slovene",
            "slovak",
            "ukrainian",
            "belarusian",
        ]

        text = resume_text.lower()

        # 1. Try to extract "Languages" section
        section_match = re.search(
            r"(languages|language skills)\s*[:\-]?\s*(.+?)(\n\n|\n[A-Z]|$)",
            text,
            re.DOTALL,
        )

        extracted = set()

        if section_match:
            lang_section = section_match.group(2)
        else:
            lang_section = text  # fallback to full text

        # 2. Match languages
        for lang in language_list:
            pattern = r"\b" + re.escape(lang) + r"\b"
            if re.search(pattern, lang_section):
                extracted.add(lang.capitalize())

        return sorted(extracted)

    def _extract_project_lines(self, lines: Sequence[str]) -> list[str]:
        """Extract lines from the academic/project section of the resume."""
        project_lines = []

        # Find project/academic project section
        project_section_start = None
        for i, line in enumerate(lines):
            if any(
                keyword in line.lower()
                for keyword in (
                    "academic project",
                    "project",
                    "mini project",
                    "major project",
                    "capstone",
                )
            ):
                project_section_start = i
                break

        if project_section_start is None:
            # Fallback: find lines with project keywords
            project_lines = [
                line
                for line in lines
                if any(keyword in line.lower() for keyword in self.PROJECT_KEYWORDS)
            ]
            return project_lines[:10]

        # Extract lines after project section header (limit to next 15 lines)
        for i in range(
            project_section_start +
                1, min(project_section_start + 15, len(lines))
        ):
            line = lines[i].strip()
            if not line:
                continue
            # Stop if we hit another major section (but allow some subsections)
            if any(
                section in line.lower()
                for section in (
                    "experience",
                    "education",
                    "qualification",
                    "certification",
                    "declaration",
                    "personal",
                    "strength",
                )
            ):
                break
            project_lines.append(line)

        return project_lines[:10]

    def _extract_experience_years(self, text: str) -> Decimal | None:
        matches = self.EXPERIENCE_RE.findall(text)
        if not matches:
            return None
        values = [Decimal(value) for value, _ in matches]
        return max(values)

    def _extract_job_titles(self, lowered: str, lines: Sequence[str]) -> list[str]:
        found: set[str] = set()
        for pattern in self.TITLE_PATTERNS:
            found.update(match.group(0)
                         for match in re.finditer(pattern, lowered))

        # Generic fallback: infer from common role labels in resumes.
        label_patterns = (
            re.compile(
                r"^(current|target|desired)?\s*(role|position|title|designation)\s*[:\-]\s*(.+)$",
                re.IGNORECASE,
            ),
            re.compile(
                r"^(professional\s+title)\s*[:\-]\s*(.+)$", re.IGNORECASE),
        )
        for line in lines[:80]:
            stripped = line.strip()
            if len(stripped) > 120:
                continue
            for pattern in label_patterns:
                match = pattern.match(stripped)
                if match:
                    candidate = match.group(
                        match.lastindex or 1).strip().lower()
                    if candidate and len(candidate) <= 80:
                        found.add(candidate)

        return sorted(found)

    def _extract_location(self, lines: Sequence[str]) -> str | None:
        for line in lines[:25]:
            low = line.lower()
            if any(token in low for token in self.LOCATION_KEYWORDS):
                return line
        return None

    @staticmethod
    def _extract_url(text: str, domain: str) -> str | None:
        url_re = re.compile(
            rf"https?://[^\s]*{re.escape(domain)}[^\s]*", re.IGNORECASE)
        match = url_re.search(text)
        return match.group(0) if match else None

    def _extract_portfolio_url(self, text: str) -> str | None:
        url_re = re.compile(r"https?://[^\s]+", re.IGNORECASE)
        for match in url_re.findall(text):
            low = match.lower()
            if "linkedin.com" not in low and "github.com" not in low:
                return match
        return None
