from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import logging
import os
import json
import base64
from urllib.parse import unquote
import hmac
import hashlib

from ai.db.database import get_db
from ai.models.orm_models import (
    User,
    PremiumOrder,
    ReportGeneration,
    PremiumReportStatusEnum,
    PremiumReportTypeEnum,
)
from ai.utils.auth import get_current_user
from ai.api.routes.credits import get_razorpay_client, get_payu_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/premium", tags=["Premium Reports"])

# ─── Schema Models ────────────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    gateway: str  # 'razorpay' or 'payu'

class CheckoutResponse(BaseModel):
    success: bool
    order_id: int
    gateway: str
    amount: float
    checkout_url: Optional[str] = None
    payment_params: Optional[dict] = None
    razorpay_order_id: Optional[str] = None
    razorpay_key_id: Optional[str] = None

class VerifyPaymentRequest(BaseModel):
    order_id: int
    gateway: str
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    payu_txnid: Optional[str] = None
    payu_status: Optional[str] = None

class ReportStatusDetail(BaseModel):
    id: int
    report_type: str
    status: str
    progress: int
    download_url: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

class OrderStatusResponse(BaseModel):
    order_id: int
    amount: float
    payment_status: str
    created_at: datetime
    reports: List[ReportStatusDetail]

class DashboardOrderInfo(BaseModel):
    order_id: int
    purchase_date: datetime
    payment_status: str
    overall_status: str
    reports: List[ReportStatusDetail]

# ─── Queue Helper ─────────────────────────────────────────────────────────────

def enqueue_report_job(report_gen_id: int, order_id: int, user_id: UUID, report_type: PremiumReportTypeEnum):
    """
    Push a task to reportgeneration-queue in Azure Queue Storage
    """
    conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    if not conn_str:
        logger.error("AZURE_STORAGE_CONNECTION_STRING is not set. Unable to enqueue job.")
        return False
    
    try:
        from azure.storage.queue import QueueServiceClient
        queue_name = "reportgeneration-queue"
        service_client = QueueServiceClient.from_connection_string(conn_str)
        
        # Ensure queue exists
        try:
            service_client.create_queue(queue_name)
        except Exception as e:
            if "QueueAlreadyExists" not in str(e):
                logger.debug(f"Queue {queue_name} already exists.")
                
        queue_client = service_client.get_queue_client(queue_name)
        
        payload = {
            "report_generation_id": report_gen_id,
            "order_id": order_id,
            "user_id": str(user_id),
            "report_type": report_type.value
        }
        
        message_json = json.dumps(payload)
        encoded_message = base64.b64encode(message_json.encode("utf-8")).decode("utf-8")
        
        queue_client.send_message(encoded_message)
        logger.info(f"Successfully enqueued job for report {report_gen_id} (type: {report_type})")
        return True
    except Exception as e:
        logger.error(f"Failed to enqueue report job to queue: {e}", exc_info=True)
        return False

# ─── Outbound Template Notification Trigger ────────────────────────────────────

def trigger_whatsapp_notification(phone: str, template_type: str, variables: list):
    """
    Invokes WhatsApp Notification webhook / Mock logger.
    """
    logger.info(f"Outbound WhatsApp template triggered: template={template_type}, recipient={phone}, variables={variables}")

# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/checkout", response_model=CheckoutResponse)
async def create_premium_checkout(
    req: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Initiate ₹99 Premium Booster Pack order.
    """
    user_id = UUID(current_user_id)
    gateway = req.gateway.lower().strip()
    
    if gateway not in ["razorpay", "payu"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid gateway. Supported gateways: 'razorpay', 'payu'"
        )
        
    try:
        # Create pending order in DB
        db_order = PremiumOrder(
            user_id=user_id,
            amount=1.00,
            payment_status="pending",
            gateway=gateway
        )
        db.add(db_order)
        await db.commit()
        await db.refresh(db_order)
        
        if gateway == "razorpay":
            client, razorpay_key_id = get_razorpay_client()
            if not razorpay_key_id or not os.getenv("RAZORPAY_KEY_SECRET"):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Razorpay credentials are not configured on the backend"
                )
                
            amount_paise = int(db_order.amount * 100)
            receipt_id = f"premium_rcpt_{db_order.id}"
            
            notes = {
                "user_id": str(user_id),
                "order_type": "premium_reports_booster",
                "premium_order_id": str(db_order.id)
            }
            
            order_data = {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": receipt_id,
                "notes": notes
            }
            
            razorpay_order = client.order.create(data=order_data)
            
            db_order.gateway_order_id = razorpay_order.get("id")
            await db.commit()
            
            return CheckoutResponse(
                success=True,
                order_id=db_order.id,
                gateway=gateway,
                amount=float(db_order.amount),
                razorpay_order_id=razorpay_order.get("id"),
                razorpay_key_id=razorpay_key_id,
                payment_params=razorpay_order
            )
            
        elif gateway == "payu":
            # Fetch user info
            stmt = select(User).where(User.id == user_id)
            res = await db.execute(stmt)
            user_record = res.scalars().first()
            if not user_record:
                raise HTTPException(status_code=404, detail="User not found")
                
            payu_client, payu_key, payu_salt, payu_env = get_payu_client()
            if not payu_key or not payu_salt:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="PayU credentials are not configured on the backend"
                )
                
            txnid = f"tx_premium_{db_order.id}_{int(datetime.utcnow().timestamp())}"
            db_order.gateway_order_id = txnid
            await db.commit()
            
            import re
            firstname = (user_record.full_name or "User").split()[0]
            firstname = re.sub(r'[^a-zA-Z0-9]', '', firstname) or "User"
            email = user_record.email or "user@example.com"
            phone = user_record.phone or "9999999999"
            
            surl = os.getenv("PAYU_CALLBACK_URL", "http://localhost:8000/credits/payu/callback")
            furl = os.getenv("PAYU_CALLBACK_URL", "http://localhost:8000/credits/payu/callback")
            
            params = {
                "txnid": txnid,
                "amount": f"{db_order.amount:.2f}",
                "productinfo": "Career Booster Pack",
                "firstname": firstname,
                "email": email,
                "phone": phone,
                "surl": surl,
                "furl": furl,
                "udf1": str(user_id),
                "udf2": str(db_order.id), # premium_order_id
                "udf3": "premium_reports_booster",
                "udf4": "",
                "udf5": ""
            }
            
            payu_hash = payu_client.generatePaymentHash(params)
            
            payment_params = {
                "key": payu_key,
                "txnid": txnid,
                "amount": f"{db_order.amount:.2f}",
                "productinfo": "Career Booster Pack",
                "firstname": firstname,
                "email": email,
                "phone": phone,
                "surl": surl,
                "furl": furl,
                "hash": payu_hash,
                "udf1": str(user_id),
                "udf2": str(db_order.id),
                "udf3": "premium_reports_booster"
            }
            
            return CheckoutResponse(
                success=True,
                order_id=db_order.id,
                gateway=gateway,
                amount=float(db_order.amount),
                checkout_url=payu_client.paymentURL,
                payment_params=payment_params
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create premium checkout session: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Checkout failed: {str(e)}"
        )

@router.post("/verify")
async def verify_premium_payment(
    req: VerifyPaymentRequest,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Direct payment verification for Razorpay or PayU. Marks order paid and queues jobs.
    """
    user_id = UUID(current_user_id)
    
    stmt = select(PremiumOrder).where(PremiumOrder.id == req.order_id)
    res = await db.execute(stmt)
    db_order = res.scalars().first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if db_order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You cannot modify this order")
        
    if db_order.payment_status in ["paid", "completed"]:
        return {"success": True, "message": "Payment verified and reports enqueued."}
        
    # Verify Gateway Signature
    if req.gateway == "razorpay":
        if not req.razorpay_payment_id or not req.razorpay_signature or not req.razorpay_order_id:
            raise HTTPException(status_code=400, detail="Missing Razorpay signature fields")
            
        client, _ = get_razorpay_client()
        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": req.razorpay_order_id,
                "razorpay_payment_id": req.razorpay_payment_id,
                "razorpay_signature": req.razorpay_signature
            })
        except Exception as sig_err:
            logger.error(f"Razorpay signature verification failed: {sig_err}")
            raise HTTPException(status_code=400, detail="Invalid payment signature")
            
    elif req.gateway == "payu":
        if req.payu_status != "success":
            raise HTTPException(status_code=400, detail="PayU transaction status is not success")
            
    # Process Success Payment
    async with db.begin_nested():
        db_order.payment_status = "paid"
        
        # Idempotently create report generations
        report_types = [
            PremiumReportTypeEnum.ATS_RESUME,
            # PremiumReportTypeEnum.ENHANCED_RESUME,
            PremiumReportTypeEnum.SKILL_ANALYSIS,
            PremiumReportTypeEnum.CAREER_ENHANCEMENT
        ]
        
        created_reports = []
        for r_type in report_types:
            stmt_r = select(ReportGeneration).where(
                ReportGeneration.order_id == db_order.id,
                ReportGeneration.report_type == r_type
            )
            res_r = await db.execute(stmt_r)
            existing_report = res_r.scalars().first()
            
            if not existing_report:
                new_report = ReportGeneration(
                    order_id=db_order.id,
                    user_id=user_id,
                    report_type=r_type,
                    status=PremiumReportStatusEnum.QUEUED,
                    progress=0
                )
                db.add(new_report)
                created_reports.append(new_report)
                
        await db.commit()
        
        # Queue Jobs
        for report in created_reports:
            await db.refresh(report)
            enqueue_report_job(
                report_gen_id=report.id,
                order_id=db_order.id,
                user_id=user_id,
                report_type=report.report_type
            )
            
        # Send Webhook payment success alert (Mock or real)
        stmt_u = select(User).where(User.id == user_id)
        res_u = await db.execute(stmt_u)
        user_record = res_u.scalars().first()

        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000") 

        if user_record and user_record.phone:
            track_link = f"{frontend_url}/orders/{db_order.id}/status"
            trigger_whatsapp_notification(
                phone=user_record.phone,
                template_type="premium_payment_success",
                variables=[user_record.full_name or "Candidate", track_link]
            )
            
    return {"success": True, "message": "Payment verified and report tasks enqueued successfully."}

@router.post("/webhook")
async def payment_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Webhook handler for Razorpay / PayU payment alerts
    """
    body = await request.body()
    # Log webhook body
    logger.info(f"Premium Webhook received payload: {body.decode('utf-8')}")
    
    # In a real environment, verify signature based on headers and call verify payment logic.
    # For now, return success to let the provider know we received it.
    return {"status": "success"}

@router.get("/orders/{order_id}", response_model=OrderStatusResponse)
async def get_order_status(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Fetch statuses of all reports for a specific order.
    """
    user_id = UUID(current_user_id)
    
    stmt_order = select(PremiumOrder).where(PremiumOrder.id == order_id)
    res_order = await db.execute(stmt_order)
    db_order = res_order.scalars().first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    if db_order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You cannot access this order")
        
    stmt_reports = select(ReportGeneration).where(ReportGeneration.order_id == order_id)
    res_reports = await db.execute(stmt_reports)
    reports = res_reports.scalars().all()
    
    report_details = [
        ReportStatusDetail(
            id=r.id,
            report_type=r.report_type.value,
            status=r.status.value,
            progress=r.progress,
            download_url=f"/api/premium/reports/{r.id}/download" if r.status == PremiumReportStatusEnum.COMPLETED else None,
            started_at=r.started_at,
            completed_at=r.completed_at,
            error_message=r.error_message
        )
        for r in reports
    ]
    
    return OrderStatusResponse(
        order_id=db_order.id,
        amount=float(db_order.amount),
        payment_status=db_order.payment_status,
        created_at=db_order.created_at,
        reports=report_details
    )

@router.get("/dashboard", response_model=List[DashboardOrderInfo])
async def get_dashboard_premium_purchases(
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    List all premium purchases for the candidate.
    """
    user_id = UUID(current_user_id)
    
    stmt = select(PremiumOrder).where(PremiumOrder.user_id == user_id).order_by(PremiumOrder.created_at.desc())
    res = await db.execute(stmt)
    orders = res.scalars().all()
    
    dashboard_orders = []
    for order in orders:
        stmt_reports = select(ReportGeneration).where(ReportGeneration.order_id == order.id)
        res_reports = await db.execute(stmt_reports)
        reports = res_reports.scalars().all()
        
        # Calculate overall status
        statuses = [r.status for r in reports]
        if not statuses:
            overall = "Queued"
        elif all(s == PremiumReportStatusEnum.COMPLETED for s in statuses):
            overall = "Completed"
        elif any(s == PremiumReportStatusEnum.FAILED for s in statuses):
            overall = "Failed"
        elif any(s == PremiumReportStatusEnum.PROCESSING for s in statuses):
            overall = "Processing"
        else:
            overall = "Queued"
            
        report_details = [
            ReportStatusDetail(
                id=r.id,
                report_type=r.report_type.value,
                status=r.status.value,
                progress=r.progress,
                download_url=f"/api/premium/reports/{r.id}/download" if r.status == PremiumReportStatusEnum.COMPLETED else None,
                started_at=r.started_at,
                completed_at=r.completed_at,
                error_message=r.error_message
            )
            for r in reports
        ]
        
        dashboard_orders.append(
            DashboardOrderInfo(
                order_id=order.id,
                purchase_date=order.created_at,
                payment_status=order.payment_status,
                overall_status=overall,
                reports=report_details
            )
        )
        
    return dashboard_orders

@router.get("/reports/{report_id}/download")
async def download_premium_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Secure download endpoint for completed PDF reports. Streams content from Azure.
    """
    user_id = UUID(current_user_id)
    
    stmt = select(ReportGeneration).where(ReportGeneration.id == report_id)
    res = await db.execute(stmt)
    report = res.scalars().first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if report.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this report")
        
    if report.status != PremiumReportStatusEnum.COMPLETED:
        raise HTTPException(status_code=400, detail="Report is not completed yet")
        
    if not report.download_url:
        raise HTTPException(status_code=404, detail="Download link is unavailable")
        
    try:
        from ai.services.azure_storage_service import AzureStorageService
        azure_service = AzureStorageService()
        
        # Stream the blob file securely
        chunk_generator, content_type, content_length = azure_service.stream_blob(report.download_url)
        
        filename = f"{report.report_type.value.lower()}_{report.id}.pdf"
        
        headers = {
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(content_length),
            "Content-Type": content_type
        }
        
        return StreamingResponse(chunk_generator, headers=headers)
        
    except Exception as e:
        logger.error(f"Error streaming premium report file: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to stream report file: {str(e)}")

@router.post("/reports/{report_id}/retry")
async def retry_premium_report(
    report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user_id: str = Depends(get_current_user)
):
    """
    Retry a failed report generation job.
    """
    user_id = UUID(current_user_id)
    
    stmt = select(ReportGeneration).where(ReportGeneration.id == report_id)
    res = await db.execute(stmt)
    report = res.scalars().first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if report.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden: You cannot modify this report")
        
    if report.status != PremiumReportStatusEnum.FAILED:
        raise HTTPException(status_code=400, detail="Only failed reports can be retried")
        
    async with db.begin_nested():
        report.status = PremiumReportStatusEnum.QUEUED
        report.progress = 0
        report.error_message = None
        report.started_at = None
        report.completed_at = None
        await db.commit()
        
    # Queue task again
    enqueue_report_job(
        report_gen_id=report.id,
        order_id=report.order_id,
        user_id=user_id,
        report_type=report.report_type
    )
    
    return {"success": True, "message": "Report generation job enqueued for retry."}
