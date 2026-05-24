from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from ai.models.orm_models import CreditTxTypeEnum

class CreditOperationRequest(BaseModel):
    amount: int = Field(..., gt=0, description="Amount of credits")
    type: CreditTxTypeEnum = Field(..., description="Transaction type")
    description: str = Field(..., description="Description of the transaction")

class CreditResponse(BaseModel):
    success: bool
    message: str
    balance: Optional[int] = None

class CreditWalletResponse(BaseModel):
    user_id: UUID
    balance: int
    used_credits: Optional[int] = None
    updated_at: datetime
