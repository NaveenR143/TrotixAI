from pydantic import BaseModel, Field

class ATSContentResponse(BaseModel):
    project_details: str = Field(..., description="Optimized project description/accomplishments tailored to the job description.")
    experience_details: str = Field(..., description="Optimized current/recent experience details tailored to the job description.")
    skills: str = Field(..., description="Tailored skills list optimized for ATS readability.")

class ATSGenerationResponse(BaseModel):
    status: str
    data: ATSContentResponse
