# api/models.py
# SQLAlchemy ORM models — maps to PostgreSQL tables

from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, ARRAY, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from db.database import Base


class Job(Base):
    """
    jobs table — stores all available job listings.

    SQL equivalent (also in migrations/001_create_jobs.sql):

    CREATE TABLE jobs (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title         TEXT NOT NULL,
        company       TEXT NOT NULL,
        location      TEXT,
        type          TEXT,                          -- Full-time, Part-time, Contract
        experience    TEXT,                          -- e.g. "2–5 yrs"
        remote        BOOLEAN DEFAULT FALSE,
        salary        TEXT,
        summary       TEXT,
        description   TEXT,
        skills        TEXT[],                        -- PostgreSQL array of skill strings
        responsibilities TEXT[],
        requirements  TEXT[],
        benefits      TEXT[],
        about_company TEXT,
        department    TEXT,
        website       TEXT,
        apply_url     TEXT,
        openings      INTEGER DEFAULT 1,
        posted        TEXT,
        is_active     BOOLEAN DEFAULT TRUE,
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_jobs_skills  ON jobs USING GIN (skills);
    CREATE INDEX idx_jobs_active  ON jobs (is_active);
    CREATE INDEX idx_jobs_remote  ON jobs (remote);
    """

    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(Text, nullable=False)
    company = Column(Text, nullable=False)
    location = Column(Text)
    type = Column(String(50))
    experience = Column(String(50))
    remote = Column(Boolean, default=False)
    salary = Column(Text)
    summary = Column(Text)
    description = Column(Text)
    skills = Column(ARRAY(Text), default=list)
    responsibilities = Column(ARRAY(Text), default=list)
    requirements = Column(ARRAY(Text), default=list)
    benefits = Column(ARRAY(Text), default=list)
    about_company = Column(Text)
    department = Column(Text)
    website = Column(Text)
    apply_url = Column(Text)
    openings = Column(Integer, default=1)
    posted = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "type": self.type,
            "experience": self.experience,
            "remote": self.remote,
            "salary": self.salary,
            "summary": self.summary,
            "description": self.description,
            "skills": self.skills or [],
            "responsibilities": self.responsibilities or [],
            "requirements": self.requirements or [],
            "benefits": self.benefits or [],
            "about_company": self.about_company,
            "department": self.department,
            "website": self.website,
            "apply_url": self.apply_url,
            "openings": self.openings,
            "posted": self.posted,
        }
