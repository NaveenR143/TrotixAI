from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
import logging
import os

from ai.db.database import get_db
from ai.db.credit_repository import CreditRepository
from ai.models.credit_models import (
    CreditOperationRequest,
    CreditResponse,
    CreditWalletResponse,
    CreatePaymentOrderRequest,
    CreatePaymentOrderResponse,
    RazorpayOrderDetails,
    VerifyPaymentRequest,
    PaymentVerificationResponse,
)
from ai.models.orm_models import CreditTxTypeEnum, PaymentOrder
from ai.utils.auth import get_current_user

logger = logging.getLogger(__name__)


import razorpay

def get_razorpay_client():
    key_id = os.getenv("RAZORPAY_KEY_ID")
    key_secret = os.getenv("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        logger.error("Razorpay keys are not configured in environment variables")
    return razorpay.Client(auth=(key_id, key_secret)), key_id

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

        DATA = {
            "amount": 99,
            "currency": "INR",
            "receipt": user_id,
            "notes": {
                "key1": "value3",
                "key2": "value2"
            }
        }

        # success response 
        # {
        #     "id": "order_IluGWxBm9U8zJ8",
        #     "entity": "order",
        #     "amount": 50000,
        #     "amount_paid": 0,
        #     "amount_due": 50000,
        #     "currency": "INR",
        #     "receipt": "rcptid_11",
        #     "offer_id": null,
        #     "status": "created",
        #     "attempts": 0,
        #     "notes": [],
        #     "created_at": 1642662092
        # }

        # failure response
        # {
        #     "error": {
        #         "code": "BAD_REQUEST_ERROR",
        #         "description": "Order amount less than minimum amount allowed",
        #         "source": "business",
        #         "step": "payment_initiation",
        #         "reason": "input_validation_failed",
        #         "metadata": {},
        #         "field": "amount"
        #     }
        # }

        

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


@router.post("/create-order/{user_id}", response_model=CreatePaymentOrderResponse)
async def create_payment_order(
    user_id: UUID,
    request: CreatePaymentOrderRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Create a payment order via Razorpay and persist it in `payment_orders`.
    """
    if str(user_id) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only create payment orders for your own account"
        )
    
    # 1. Resolve client dynamically and verify credentials exist
    client, razorpay_key_id = get_razorpay_client()
    if not razorpay_key_id or not os.getenv("RAZORPAY_KEY_SECRET"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed: Razorpay credentials are not configured on the backend"
        )

    # 2. Validate amount >= 100 paise (minimum allowed by Razorpay)
    amount_paise = int(request.amount * 100)
    if amount_paise < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order amount must be at least 100 paise (1 INR)"
        )
    
    receipt_id = f"rcpt_{user_id.hex[:10]}_{int(datetime.now().timestamp())}"
    
    notes = {
        "user_id": str(user_id),
        "credits_to_add": str(request.credits_to_add),
        "package_name": request.package_name
    }
    
    order_data = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": receipt_id,
        "notes": notes
    }
    
    # 3. Call Razorpay API
    try:
        razorpay_order = client.order.create(data=order_data)
        
        # Parse provider_created_at
        provider_created_at = None
        if "created_at" in razorpay_order:
            provider_created_at = datetime.fromtimestamp(razorpay_order["created_at"], tz=timezone.utc)
        
        # Create database entry
        db_order = PaymentOrder(
            user_id=user_id,
            request_status="success",
            order_id=razorpay_order.get("id"),
            entity=razorpay_order.get("entity"),
            amount=razorpay_order.get("amount"),
            amount_paid=razorpay_order.get("amount_paid"),
            amount_due=razorpay_order.get("amount_due"),
            currency=razorpay_order.get("currency"),
            receipt=razorpay_order.get("receipt"),
            offer_id=razorpay_order.get("offer_id"),
            order_status=razorpay_order.get("status"),
            attempts=razorpay_order.get("attempts"),
            notes=razorpay_order.get("notes"),
            provider_created_at=provider_created_at
        )
        db.add(db_order)
        await db.commit()
        
        order_details = RazorpayOrderDetails(
            id=razorpay_order.get("id"),
            entity=razorpay_order.get("entity"),
            amount=razorpay_order.get("amount"),
            amount_paid=razorpay_order.get("amount_paid"),
            amount_due=razorpay_order.get("amount_due"),
            currency=razorpay_order.get("currency"),
            receipt=razorpay_order.get("receipt"),
            offer_id=razorpay_order.get("offer_id"),
            status=razorpay_order.get("status"),
            attempts=razorpay_order.get("attempts"),
            notes=razorpay_order.get("notes") or {},
            created_at=razorpay_order.get("created_at")
        )
        return CreatePaymentOrderResponse(
            success=True,
            message="Payment order created successfully",
            order=order_details,
            razorpay_key_id=razorpay_key_id
        )
        
    except Exception as e:
        # Log error
        logger.error(f"Razorpay order creation failed for user {user_id}: {str(e)}")
        
        # Extract error details if razorpay error format is dictionary-like
        error_code = "GATEWAY_ERROR"
        error_description = str(e)
        error_source = "gateway"
        error_step = "order_creation"
        error_reason = "internal_error"
        error_metadata = {}
        error_field = None
        
        # If we got a structured error from Razorpay
        if hasattr(e, 'error') and isinstance(e.error, dict):
            err_dict = e.error
            error_code = err_dict.get("code", error_code)
            error_description = err_dict.get("description", error_description)
            error_source = err_dict.get("source", error_source)
            error_step = err_dict.get("step", error_step)
            error_reason = err_dict.get("reason", error_reason)
            error_metadata = err_dict.get("metadata", {})
            error_field = err_dict.get("field")
        
        db_order = PaymentOrder(
            user_id=user_id,
            request_status="failure",
            error_code=error_code,
            error_description=error_description,
            error_source=error_source,
            error_step=error_step,
            error_reason=error_reason,
            error_metadata=error_metadata,
            error_field=error_field
        )
        db.add(db_order)
        await db.commit()
        
        # Determine status code based on error content
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        if any(keyword in error_description.lower() for keyword in ["auth", "credential", "unauthorized", "key_secret", "key_id"]):
            status_code = status.HTTP_401_UNAUTHORIZED
        elif "amount" in error_description.lower():
            status_code = status.HTTP_400_BAD_REQUEST

        raise HTTPException(
            status_code=status_code,
            detail=f"Failed to create payment order: {error_description}"
        )


@router.post("/verify-payment/{user_id}", response_model=PaymentVerificationResponse)
async def verify_payment(
    user_id: UUID,
    request: VerifyPaymentRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Verify Razorpay payment signature and atomically credit the user's wallet.
    """
    if str(user_id) != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only verify payments for your own account"
        )
        
    # Validate missing fields explicitly
    if not request.razorpay_order_id or not request.razorpay_payment_id or not request.razorpay_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required"
        )
        
    # 1. Verify payment signature using dynamic client
    client, _ = get_razorpay_client()
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": request.razorpay_order_id,
            "razorpay_payment_id": request.razorpay_payment_id,
            "razorpay_signature": request.razorpay_signature
        })
    except Exception as e:
        logger.error(f"Signature verification failed for order {request.razorpay_order_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature. Verification failed."
        )

    # 2. Process order and add credits atomically
    from sqlalchemy import select
    
    try:
        async with db.begin_nested():
            order_query = select(PaymentOrder).where(PaymentOrder.order_id == request.razorpay_order_id).with_for_update()
            order_result = await db.execute(order_query)
            db_order = order_result.scalars().first()
            
            if not db_order:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Payment order not found."
                )
            
            # Idempotency check: if order is already completed/paid, don't credit again
            if db_order.order_status in ["paid", "completed"]:
                wallet = await CreditRepository.get_wallet(user_id, db)
                balance = wallet["balance"] if wallet else 0
                return PaymentVerificationResponse(
                    success=True,
                    message="Payment already processed and credits added.",
                    order_id=request.razorpay_order_id,
                    payment_id=request.razorpay_payment_id,
                    credits_added=0,
                    balance=balance
                )
            
            # Calculate credits to add
            credits_to_add = 0
            if db_order.notes and "credits_to_add" in db_order.notes:
                try:
                    credits_to_add = int(db_order.notes["credits_to_add"])
                except ValueError:
                    pass
            
            if credits_to_add <= 0:
                if db_order.amount == 9900:
                    credits_to_add = 100
                else:
                    credits_to_add = 0
            
            if credits_to_add <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid credit amount detected in order metadata."
                )
                
            # Update order details
            db_order.order_status = "paid"
            db_order.amount_paid = db_order.amount
            db_order.amount_due = 0
            
            # Add payment ID to notes
            if db_order.notes is None:
                db_order.notes = {}
            if isinstance(db_order.notes, dict):
                notes_copy = dict(db_order.notes)
                notes_copy["razorpay_payment_id"] = request.razorpay_payment_id
                db_order.notes = notes_copy
            
            # Add credits atomically
            description = f"Credits purchase: Order {request.razorpay_order_id}"
            new_balance = await CreditRepository.add_credits(
                user_id=user_id,
                amount=credits_to_add,
                tx_type=CreditTxTypeEnum.purchase,
                description=description,
                session=db
            )
            
            return PaymentVerificationResponse(
                success=True,
                message=f"Payment verified successfully! Added {credits_to_add} credits.",
                order_id=request.razorpay_order_id,
                payment_id=request.razorpay_payment_id,
                credits_added=credits_to_add,
                balance=new_balance
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing payment verification for order {request.razorpay_order_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Verification failed: {str(e)}"
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

