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
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

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
POLL_INTERVAL = 3000         # seconds
MAX_RETRIES = 5


# ----------------------------
# Queue Worker
# ----------------------------
class QueueWorker:

    def __init__(self, max_workers=MAX_WORKERS):
        self.queue_client = QueueClient.from_connection_string(
            conn_str=QUEUE_CONNECTION_STRING,
            queue_name=QUEUE_NAME
        )
        self.executor = ThreadPoolExecutor(max_workers=max_workers)

    # ----------------------------
    # Async Runner (SAFE for threads)
    # ----------------------------
    def _run_async(self, coro):
        """
        Runs async coroutine safely inside a thread.
        Creates a fresh event loop per execution.
        """
        loop = asyncio.new_event_loop()
        try:
            asyncio.set_event_loop(loop)
            return loop.run_until_complete(coro)
        finally:
            loop.close()

    # ----------------------------
    # Process Message (Business Logic)
    # ----------------------------
    def process_message(self, message_text: str):
        try:
            data = json.loads(message_text)

            blob_url = data.get("blob_url")
            user_id = data.get("user_id")

            logger.info(f"📄 Processing user_id={user_id}")
            logger.info(f"📦 Blob URL: {blob_url}")

            handler = ProcessPDFHandler(
                blob_url=blob_url,
                user_id=user_id
            )

            # ✅ SAFE async execution
            # self._run_async(handler.process_file())

            db_queue.put({
                "user_id": user_id, "update_status": "processing"
            })

            # Run async processing
            result = self._run_async(handler.process_file())

            # 👉 PUSH to DB queue (instead of saving directly)
            db_queue.put(result)

            logger.info("✅ Resume processed successfully")

        except json.JSONDecodeError as e:
            logger.exception(f"❌ JSON parsing failed: {e}")
            raise

        except Exception as e:
            logger.exception(f"❌ Processing failed: {e}")
            raise

    # ----------------------------
    # Handle Each Queue Message
    # ----------------------------
    def _handle_message(self, msg):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        logger.info(f"[{timestamp}] Processing message ID: {msg.id}")
        logger.info(f"Dequeue count: {msg.dequeue_count}")

        # ----------------------------
        # Retry / Poison Message Handling
        # ----------------------------
        if msg.dequeue_count > MAX_RETRIES:
            logger.error(f"☠️ Poison message detected: {msg.id}")
            self.queue_client.delete_message(msg)
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
            self.queue_client.delete_message(msg)
            logger.info(f"🗑️ Message deleted: {msg.id}")

        except Exception as e:
            logger.exception(f"❌ Failed processing message {msg.id}")
            # Do NOT delete → Azure will retry automatically

    # ----------------------------
    # Start Worker
    # ----------------------------
    def start(self):
        logger.info("🚀 Worker started. Listening to queue...")

        while True:
            try:
                messages = self.queue_client.receive_messages(
                    messages_per_page=10,
                    visibility_timeout=VISIBILITY_TIMEOUT
                )

                for msg_batch in messages.by_page():
                    for msg in msg_batch:
                        # Submit to thread pool
                        self.executor.submit(self._handle_message, msg)

                time.sleep(POLL_INTERVAL)

            except Exception as e:
                logger.exception(f"❌ Error in polling loop: {e}")
                time.sleep(5)


# ----------------------------
# Main Entry
# ----------------------------
if __name__ == "__main__":

    db_worker = DBWorker()
    db_worker.start()

    worker = QueueWorker(max_workers=MAX_WORKERS)
    worker.start()
