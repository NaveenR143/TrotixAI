from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime
from uuid import UUID

class JobMetadataResponse(BaseModel):
    industries: List[dict]
    education_levels: List[dict]
    departments: List[dict]
    work_modes: List[str]
    job_types: List[str]

class JobCreateRequest(BaseModel):
    userid: UUID
    title: str
    company: str
    location: str
    work_mode: str
    openings: int
    industry_id: int
    department_id: Optional[int] = None
    education_requirement: str
    experience_min: int
    experience_max: int
    description: str
    skills: List[str]
    email: str
    mobile: str
    salary: Optional[str] = None

class JobCreateResponse(BaseModel):
    status: str
    message: str
    job_id: Optional[int] = None
