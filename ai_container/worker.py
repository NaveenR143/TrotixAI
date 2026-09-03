from ProcessPDF.process_job import ProcessJobHandler
from ProcessPDF.process_update_resume import UpdateResumeHandler
from datetime import datetime
import os
import time
import json
import logging
import base64
import asyncio
from concurrent.futures import ThreadPoolExecutor
from azure.storage.queue import QueueClient
from dotenv import load_dotenv

from ProcessPDF.process_pdf import ProcessPDFHandler

from db.db_worker import DBWorker, db_queue

# ----------------------------
# Logging Configuration
# ----------------------------
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("azure").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("aiohttp").setLevel(logging.WARNING)

# ----------------------------
# Load Environment Variables
# ----------------------------
load_dotenv()

QUEUE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
QUEUE_NAME = "resumes-queue"

# ----------------------------
# Config
# ----------------------------
MAX_WORKERS = 5
VISIBILITY_TIMEOUT = 120  # seconds
POLL_INTERVAL = 3  # seconds
MAX_RETRIES = 5


# ----------------------------
# Queue Worker
# ----------------------------
class QueueWorker:

    def __init__(self, max_workers=MAX_WORKERS):
        self.queue_client = QueueClient.from_connection_string(
            conn_str=QUEUE_CONNECTION_STRING, queue_name=QUEUE_NAME
        )
        self.report_queue_client = QueueClient.from_connection_string(
            conn_str=QUEUE_CONNECTION_STRING, queue_name="reportgeneration-queue"
        )
        
        # Ensure report queue exists
        try:
            self.report_queue_client.create_queue()
        except Exception as e:
            if "QueueAlreadyExists" not in str(e):
                logger.debug("reportgeneration-queue already exists.")
                
        self.executor = ThreadPoolExecutor(max_workers=max_workers)

    # ----------------------------
    # Async Runner (SAFE for threads)
    # ----------------------------
    def _run_async(self, coro):
        """
        Runs async coroutine safely inside a thread.
        Retrieves and reuses the thread's event loop to utilize connection pooling.
        """
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        # If loop is closed, create a new one
        if loop.is_closed():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

        return loop.run_until_complete(coro)

    # ----------------------------
    # Process Message (Business Logic)
    # ----------------------------
    def process_message(self, message_text: str):
        try:
            data = json.loads(message_text)

            # Check if this is a premium report generation task
            report_gen_id = data.get("report_generation_id")
            if report_gen_id:
                logger.info(f"📊 Processing report generation request ID={report_gen_id}")
                
                from ProcessPDF.premium_report_service import PremiumReportService
                
                async def run_report_generation():
                    service = PremiumReportService()
                    await service.process_report_generation(report_gen_id)
                        
                self._run_async(run_report_generation())
                logger.info("✅ Premium report task processed.")
                return

            blob_url = data.get("blob_url")
            user_id = data.get("user_id")
            job_id = data.get("job_id")
            resume_id = data.get("resume_id")

            logger.info(f"📄 Processing user_id={user_id}")
            logger.info(f"📦 Blob URL: {blob_url}")
            logger.info(f"📦 Job ID: {job_id}")

            if blob_url:
                handler = ProcessPDFHandler(blob_url=blob_url, user_id=user_id)

                db_queue.put({"user_id": user_id, "update_status": "processing"})

                # Run async processing
                result = self._run_async(handler.process_file())

                # 👉 PUSH to DB queue (instead of saving directly)
                db_queue.put(result)

                logger.info("✅ Resume processed successfully")
            elif job_id:
                job_handler = ProcessJobHandler(job_id=job_id, user_id=user_id)

                # Execute job processing logic safely asynchronously
                self._run_async(job_handler.save_embedding())

                logger.info(
                    f"✅ Job handler processed successfully for job_id={job_id}"
                )
            else:
                resume_handler = UpdateResumeHandler(
                    resume_id=resume_id, user_id=user_id
                )

                # Execute job processing logic safely asynchronously
                self._run_async(resume_handler.save_embedding())

                logger.info(
                    f"✅ Resume handler processed successfully for resume_id={resume_id}"
                )

        except json.JSONDecodeError as e:
            logger.exception(f"❌ JSON parsing failed: {e}")
            raise
        except Exception as e:
            logger.exception(f"❌ Processing failed: {e}")
            raise

    # ----------------------------
    # Handle Each Queue Message
    # ----------------------------
    def _handle_message(self, msg, queue_client):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        logger.info(f"[{timestamp}] Processing message ID: {msg.id}")
        logger.info(f"Dequeue count: {msg.dequeue_count}")

        # ----------------------------
        # Retry / Poison Message Handling
        # ----------------------------
        if msg.dequeue_count > MAX_RETRIES:
            logger.error(f"☠️ Poison message detected: {msg.id}")
            queue_client.delete_message(msg)
            return

        # ----------------------------
        # Decode Base64 Message
        # ----------------------------
        try:
            decoded_content = base64.b64decode(msg.content).decode("utf-8")
        except Exception as e:
            logger.exception("❌ Base64 decode failed")
            return

        logger.info(f"📩 Message content: {decoded_content}")

        try:
            # ----------------------------
            # Process Message
            # ----------------------------
            self.process_message(decoded_content)

            # ----------------------------
            # Delete only if SUCCESS
            # ----------------------------
            queue_client.delete_message(msg)
            logger.info(f"🗑️ Message deleted: {msg.id}")

        except Exception as e:
            logger.exception(f"❌ Failed processing message {msg.id}")
            # Do NOT delete → Azure will retry automatically

    # ----------------------------
    # Start Worker
    # ----------------------------
    def start(self):
        logger.info("🚀 Worker started. Listening to queues (resumes-queue, reportgeneration-queue)...")

        while True:
            try:
                # 1. Check resumes-queue
                messages = self.queue_client.receive_messages(
                    messages_per_page=10, visibility_timeout=VISIBILITY_TIMEOUT
                )

                for msg_batch in messages.by_page():
                    for msg in msg_batch:
                        self.executor.submit(self._handle_message, msg, self.queue_client)

                # 2. Check reportgeneration-queue
                report_messages = self.report_queue_client.receive_messages(
                    messages_per_page=10, visibility_timeout=VISIBILITY_TIMEOUT
                )

                for msg_batch in report_messages.by_page():
                    for msg in msg_batch:
                        self.executor.submit(self._handle_message, msg, self.report_queue_client)

                time.sleep(POLL_INTERVAL)

            except Exception as e:
                logger.exception(f"❌ Error in polling loop: {e}")
                time.sleep(5)


# ----------------------------
# Main Entry
# ----------------------------
if __name__ == "__main__":
    from db.session_manager import db_session_manager

    logger.info("Checking database connection...")
    try:
        asyncio.run(db_session_manager.init())
    except Exception as e:
        logger.critical(f"Database connection check failed: {e}")
        import sys
        sys.exit(1)

    db_worker = DBWorker()
    db_worker.start()

    worker = QueueWorker(max_workers=MAX_WORKERS)
    worker.start()
