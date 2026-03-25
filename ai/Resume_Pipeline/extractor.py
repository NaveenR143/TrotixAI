from __future__ import annotations

import re
from decimal import Decimal
from typing import Sequence

from .models import DeterministicResumeData


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

    EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
    PHONE_RE = re.compile(r"\+?\d[\d\-\s()]{7,}\d")
    EXPERIENCE_RE = re.compile(r"(\d+(?:\.\d+)?)\+?\s*(years?|yrs?)", re.IGNORECASE)

    def extract(self, clean_text: str) -> DeterministicResumeData:
        lowered = clean_text.lower()
        lines = clean_text.splitlines()

        email = self._first_match(self.EMAIL_RE, clean_text)
        phone = self._first_match(self.PHONE_RE, clean_text)
        name = self._extract_name(lines, email)
        years = self._extract_experience_years(clean_text)
        skills = sorted(skill for skill in self.SKILL_DICTIONARY if skill in lowered)
        education_lines = [line for line in lines if any(keyword in line.lower() for keyword in self.EDUCATION_KEYWORDS)]
        job_titles = self._extract_job_titles(lowered, lines)
        summary = " ".join(lines[:3])[:500] if lines else None
        current_location = self._extract_location(lines)

        return DeterministicResumeData(
            name=name,
            email=email,
            phone=phone,
            skills=skills,
            experience_years=years,
            education_lines=education_lines[:8],
            job_titles=job_titles,
            summary=summary,
            current_location=current_location,
            linkedin_url=self._extract_url(clean_text, "linkedin.com"),
            github_url=self._extract_url(clean_text, "github.com"),
            portfolio_url=self._extract_portfolio_url(clean_text),
            clean_text=clean_text,
        )

    @staticmethod
    def _first_match(pattern: re.Pattern[str], text: str) -> str | None:
        match = pattern.search(text)
        return match.group(0).strip() if match else None

    def _extract_name(self, lines: Sequence[str], email: str | None) -> str | None:
        for line in lines[:8]:
            if email and email in line:
                continue
            if len(line.split()) in (2, 3) and len(line) < 50 and not any(ch.isdigit() for ch in line):
                return line.strip()
        return None

    def _extract_experience_years(self, text: str) -> Decimal | None:
        matches = self.EXPERIENCE_RE.findall(text)
        if not matches:
            return None
        values = [Decimal(value) for value, _ in matches]
        return max(values)

    def _extract_job_titles(self, lowered: str, lines: Sequence[str]) -> list[str]:
        found: set[str] = set()
        for pattern in self.TITLE_PATTERNS:
            found.update(match.group(0) for match in re.finditer(pattern, lowered))

        # Generic fallback: infer from common role labels in resumes.
        label_patterns = (
            re.compile(r"^(current|target|desired)?\s*(role|position|title|designation)\s*[:\-]\s*(.+)$", re.IGNORECASE),
            re.compile(r"^(professional\s+title)\s*[:\-]\s*(.+)$", re.IGNORECASE),
        )
        for line in lines[:80]:
            stripped = line.strip()
            if len(stripped) > 120:
                continue
            for pattern in label_patterns:
                match = pattern.match(stripped)
                if match:
                    candidate = match.group(match.lastindex or 1).strip().lower()
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
        url_re = re.compile(rf"https?://[^\s]*{re.escape(domain)}[^\s]*", re.IGNORECASE)
        match = url_re.search(text)
        return match.group(0) if match else None

    def _extract_portfolio_url(self, text: str) -> str | None:
        url_re = re.compile(r"https?://[^\s]+", re.IGNORECASE)
        for match in url_re.findall(text):
            low = match.lower()
            if "linkedin.com" not in low and "github.com" not in low:
                return match
        return None

