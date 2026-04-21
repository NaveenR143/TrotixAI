from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class CareerPaths(BaseModel):
    current_role: Optional[str] = None
    next_role: Optional[str] = None
    future_role: Optional[str] = None

class SkillGap(BaseModel):
    skill: str
    current_level: Optional[str] = None
    required_level: Optional[str] = None
    importance: float = Field(..., ge=0, le=10)

class CareerRecommendationItem(BaseModel):
    title: str
    provider: str
    url: Optional[str] = None

class CareerRecommendations(BaseModel):
    courses: List[CareerRecommendationItem] = []
    certifications: List[CareerRecommendationItem] = []

class ActionPlanStep(BaseModel):
    phase: str
    action: str

class CareerAdvisorResponse(BaseModel):
    career_paths: CareerPaths
    skill_gaps: List[SkillGap] = []
    recommendations: CareerRecommendations
    action_plan: List[ActionPlanStep] = []

class CareerAdvisorSuccessResponse(BaseModel):
    status: str = "success"
    data: CareerAdvisorResponse
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CareerAdvisorErrorResponse(BaseModel):
    status: str = "error"
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
