from datetime import datetime
import os
from pathlib import Path
import time
import json
import logging
import base64
from azure.storage.queue import QueueClient
from dotenv import load_dotenv

from ProcessPDF.process_pdf import ProcessPDFHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load .env
load_dotenv()

# ENV VARIABLES (set in Azure)
QUEUE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
QUEUE_NAME = "resumes-queue"


class QueueWorker:

    def __init__(self):
        self.queue_client = QueueClient.from_connection_string(
            conn_str=QUEUE_CONNECTION_STRING,
            queue_name=QUEUE_NAME
        )

    def process_message(self, message_text):
        """
        Process a single queue message with structured logging and file handling.
        """
        try:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
            print(f"[{timestamp}] Started processing message")

            # Parse message JSON
            data = json.loads(message_text)
            blob_url = data.get("blob_url")
            user_id = data.get("user_id")

            print(f"User ID: {user_id}")
            print(f"Blob URL: {blob_url}")

            # 👉 Replace this with your actual processing logic
            handler = ProcessPDFHandler(blob_url,user_id)
            result = handler.process_file()
            print(f"Processing file: {blob_url}")

            # # Extract results
            # file_name = result["file_name"]
            # mime_type = result["mime_type"]
            # file_stream = result["file_stream"]

            # # Display results
            # print("=" * 60)
            # print("✓ Processing Completed Successfully")
            # print("=" * 60)
            # print(f"File Name: {file_name}")
            # print(f"MIME Type: {mime_type}")
            # print(f"File Size: {len(file_stream.getvalue())} bytes")
            # print("=" * 60)

            # Simulate processing delay
            time.sleep(2)
            print("✅ Resume initiated successfully")

        except json.JSONDecodeError as e:
            logger.exception(f"❌ Failed to parse JSON: {e}")

        except Exception as e:
            logger.exception(f"❌ Error during message processing: {e}")

    def start(self):
        print("Worker started. Listening to queue...")

        while True:
            try:
                # Receive up to 32 messages (max per page) but we'll process them one by one
                messages = self.queue_client.receive_messages(messages_per_page=1, visibility_timeout=60)
                
                for msg in messages:
                    try:
                        # Process each message sequentially (wait and proceed)
                        self._handle_message(msg)
                    except Exception as e:
                        logger.exception(f"❌ Error in message processing: {e}")

                # Small sleep between batches if no messages found
                time.sleep(1)

            except Exception as e:
                logger.error(f"❌ Queue error: {e}")
                time.sleep(5)  # Back off on error

    def _handle_message(self, msg):
        """
        Internal method to process a message and delete it after successful processing.
        """
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
        print(f"[{timestamp}] Processing message")
        print(f"Message ID: {msg.id}")
        print(f"Dequeue count: {msg.dequeue_count}")

        content=msg.content
        print(f"Received message: {content}")

        # Decode base64 content
        try:
            decoded_content=base64.b64decode(content).decode('utf-8')
        except Exception as e:
            logger.exception(f"❌ Failed to decode base64 content: {e}")
            return

        print(f"Decoded message: {decoded_content}")

        # Write to output file
        output_file=Path(__file__).parent / "output.txt"
        print(f"Writing to: {output_file}")
        with open(output_file, "a", encoding="utf-8") as f:
            f.write(f"[{timestamp}] {decoded_content}\n")
            f.flush()
        print("✅ Write successful")

        # Process message
        self.process_message(decoded_content)

        # Delete from queue
        self.queue_client.delete_message(msg)
        print("✅ Message deleted from queue")


if __name__ == "__main__":
    worker=QueueWorker()
    worker.start()
