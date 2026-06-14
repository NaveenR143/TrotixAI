from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional
import logging

from ai.db.database import get_db
from ai.db.credit_repository import CreditRepository
from ai.models.credit_models import CreditOperationRequest, CreditResponse, CreditWalletResponse
from ai.models.orm_models import CreditTxTypeEnum
from ai.utils.auth import get_current_user

logger = logging.getLogger(__name__)

# ─── Constants ─────────────────────────────────────────────────────────────
AI_FEATURE_CREDIT_COST = 20

# Map feature names to transaction types and descriptions
FEATURE_CONFIG = {
    "enhance_resume": {
        "tx_type": CreditTxTypeEnum.ai_resume_improve,
        "description": "AI Resume Enhancement",
        "cost": 20,
    },
    "skill_analysis": {
        "tx_type": CreditTxTypeEnum.skills_enhancement,
        "description": "AI Missing Skills Analysis",
        "cost": 20,
    },
    "learning_path": {
        "tx_type": CreditTxTypeEnum.ai_content_write,
        "description": "AI Learning Path Generation",
        "cost": 20,
    },
    "resume_download": {
        "tx_type": CreditTxTypeEnum.purchase,
        "description": "Premium Resume Template Download",
        "cost": 10,
    },
    "apply_with_ai": {
        "tx_type": CreditTxTypeEnum.ai_email_write,
        "description": "AI Apply (Generate Email)",
        "cost": 5,
    },
}

class FeatureUsageRequest(BaseModel):
    feature: str = Field(..., description="Feature name: enhance_resume, skill_analysis, or learning_path")

class FeatureUsageResponse(BaseModel):
    success: bool
    message: str
    balance: Optional[int] = None
    credits_deducted: int = 0

router = APIRouter(prefix="/credits", tags=["Credits"])

@router.get("/{user_id}", response_model=CreditWalletResponse)
async def get_wallet_balance(
    user_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Fetch the credit wallet balance for a user.
    """
    if str(user_id) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only access your own credit wallet"
        )
    try:
        wallet = await CreditRepository.get_wallet(user_id, db)
        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Credit wallet not found for user"
            )
        return CreditWalletResponse(**wallet)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/add/{user_id}", response_model=CreditResponse)
async def add_credits(
    user_id: UUID,
    request: CreditOperationRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Add credits to a user's wallet.
    """
    if str(user_id) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only add credits to your own wallet"
        )
    try:
        new_balance = await CreditRepository.add_credits(
            user_id=user_id,
            amount=request.amount,
            tx_type=request.type,
            description=request.description,
            session=db,
        )
        return CreditResponse(
            success=True,
            message=f"Successfully added {request.amount} credits.",
            balance=new_balance
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/deduct/{user_id}", response_model=CreditResponse)
async def deduct_credits(
    user_id: UUID,
    request: CreditOperationRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Deduct credits from a user's wallet.
    """
    if str(user_id) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only deduct credits from your own wallet"
        )
    try:
        # Step 1: Check wallet balance first
        wallet = await CreditRepository.get_wallet(user_id, db)
        if not wallet:
            return CreditResponse(
                success=False,
                message="Credit wallet not found for user.",
                balance=None
            )
        
        current_balance = wallet["balance"]
        
        # Step 2: Check if sufficient credits
        if current_balance < request.amount:
            return CreditResponse(
                success=False,
                message=f"Insufficient credits. You need {request.amount} credits but have {current_balance}.",
                balance=current_balance
            )
        
        # Step 3: Deduct credits
        success = await CreditRepository.deduct_credits(
            user_id=user_id,
            amount=request.amount,
            tx_type=request.type,
            description=request.description,
            session=db,
        )
        
        if not success:
            return CreditResponse(
                success=False,
                message="Credit deduction failed.",
                balance=current_balance
            )
            
        wallet = await CreditRepository.get_wallet(user_id, db)
        new_balance = wallet["balance"] if wallet else None
            
        return CreditResponse(
            success=True,
            message=f"Successfully deducted {request.amount} credits.",
            balance=new_balance
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/use-feature/{user_id}", response_model=FeatureUsageResponse)
async def use_ai_feature(
    user_id: UUID,
    request: FeatureUsageRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Deduct credits for an AI feature or premium template download.
    
    Accepts feature names with their respective costs:
    - enhance_resume: 20 credits
    - skill_analysis: 20 credits
    - learning_path: 20 credits
    - resume_download: 10 credits (for premium templates)
    
    Validates wallet existence, checks balance, deducts credits, and returns updated balance.
    """
    try:
        if str(user_id) != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You can only use features for your own account"
            )
        # Validate feature name
        feature_name = request.feature.lower().strip()
        if feature_name not in FEATURE_CONFIG:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid feature: '{feature_name}'. Valid features: {', '.join(FEATURE_CONFIG.keys())}"
            )

        config = FEATURE_CONFIG[feature_name]
        credits_cost = config.get("cost", AI_FEATURE_CREDIT_COST)

        # Validate user wallet exists
        wallet = await CreditRepository.get_wallet(user_id, db)
        if not wallet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Credit wallet not found for user. Please contact support."
            )

        # Check available balance
        current_balance = wallet["balance"]
        if current_balance < credits_cost:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient credits. You need {credits_cost} credits but have {current_balance}. Please purchase more credits."
            )

        # Deduct credits
        success = await CreditRepository.deduct_credits(
            user_id=user_id,
            amount=credits_cost,
            tx_type=config["tx_type"],
            description=config["description"],
            session=db,
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Credit deduction failed. Insufficient balance."
            )

        # Fetch updated balance
        updated_wallet = await CreditRepository.get_wallet(user_id, db)
        new_balance = updated_wallet["balance"] if updated_wallet else None

        logger.info(f"Deducted {credits_cost} credits for {feature_name} from user {user_id}. New balance: {new_balance}")

        return FeatureUsageResponse(
            success=True,
            message=f"Successfully deducted {credits_cost} credits for {config['description']}.",
            balance=new_balance,
            credits_deducted=credits_cost,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deducting credits for feature {request.feature}, user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
