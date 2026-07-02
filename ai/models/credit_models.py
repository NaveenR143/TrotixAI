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


class CreatePaymentOrderRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount in INR, e.g. 99.00")
    credits_to_add: int = Field(..., gt=0, description="Number of credits to add, e.g. 100")
    package_name: str = Field(..., description="Name of the package")


class RazorpayOrderDetails(BaseModel):
    id: str
    entity: str
    amount: int
    amount_paid: int
    amount_due: int
    currency: str
    receipt: Optional[str] = None
    offer_id: Optional[str] = None
    status: str
    attempts: int
    notes: dict
    created_at: int


class CreatePaymentOrderResponse(BaseModel):
    success: bool
    message: str
    order: Optional[RazorpayOrderDetails] = None
    razorpay_key_id: Optional[str] = None


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentVerificationResponse(BaseModel):
    success: bool
    message: str
    order_id: str
    payment_id: str
    credits_added: int
    balance: int


class CreatePayUPaymentRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Amount in INR, e.g. 99.00")
    credits_to_add: int = Field(..., gt=0, description="Number of credits to add, e.g. 100")
    package_name: str = Field(..., description="Name of the package")


class PayUPaymentParams(BaseModel):
    key: str
    txnid: str
    amount: str
    productinfo: str
    firstname: str
    email: str
    phone: str
    surl: str
    furl: str
    hash: str
    udf1: str
    udf2: str
    udf3: str


class InitiatePayUPaymentResponse(BaseModel):
    success: bool
    message: str
    payment_params: Optional[PayUPaymentParams] = None
    payment_url: Optional[str] = None


class PayUTxnStatusResponse(BaseModel):
    success: bool
    txnid: str
    status: Optional[str] = None
    amount: Optional[float] = None
    credits_to_add: Optional[int] = None
    request_status: Optional[str] = None

