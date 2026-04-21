from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from decimal import Decimal
from uuid import UUID


@dataclass(slots=True)
class WorkExperience:
    company_name: str
    title: str
    location: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool = False
    description: str | None = None
    skills_used: list[str] = field(default_factory=list)
    achievements: list[str] = field(default_factory=list)


@dataclass(slots=True)
class EducationEntry:
    institution: str
    degree: str | None = None
    field_of_study: str | None = None
    grade: str | None = None
    start_year: int | None = None
    end_year: int | None = None
    is_current: bool = False
    description: str | None = None


@dataclass(slots=True)
class JobSeekerProfile:
    user_id: UUID
    headline: str | None
    summary: str | None
    current_location: str | None
    preferred_locations: list[str]
    years_of_experience: Decimal | None
    notice_period_days: int | None
    current_salary: Decimal | None
    expected_salary: Decimal | None
    salary_currency: str
    linkedin_url: str | None
    github_url: str | None
    portfolio_url: str | None
    skills: list[str]
    work_experiences: list[WorkExperience]
    education: list[EducationEntry]
    parsed_job_titles: list[str]
    parsed_summary: str | None
    raw_text: str


@dataclass(slots=True)
class DeterministicResumeData:
    name: str | None
    email: str | None
    phone: list[str] | None
    languages: list[str]
    # education_lines: list[str] = field(default_factory=list)
    # project_lines: list[str] = field(default_factory=list)
    # skills: list[str]
    # experience_years: Decimal | None
    # job_titles: list[str]
    # summary: str | None
    # current_location: str | None
    # linkedin_url: str | None
    # github_url: str | None
    # portfolio_url: str | None
    # clean_text: str
