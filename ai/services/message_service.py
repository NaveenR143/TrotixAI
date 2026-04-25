import os
import logging
import json
import base64
from dotenv import load_dotenv
from pathlib import Path
from azure.storage.queue import QueueServiceClient

# Setup logging
LOGGER = logging.getLogger(__name__)

# Force correct path
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)


class MessageService:
    """Service for sending messages to Azure Queue Storage."""

    def __init__(self):
        self.connection_string = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.queue_name = "resumes-queue"

        if not self.connection_string:
            raise ValueError(
                "AZURE_STORAGE_CONNECTION_STRING environment variable not set"
            )

    def _get_queue_client(self):
        """Get or create queue service client and ensure queue exists."""
        try:
            queue_service_client = QueueServiceClient.from_connection_string(
                self.connection_string
            )

            # Create queue if it doesn't exist
            try:
                queue_service_client.create_queue(self.queue_name)
                LOGGER.info(f"Queue '{self.queue_name}' created.")
            except Exception as e:
                if "QueueAlreadyExists" not in str(e):
                    LOGGER.debug(f"Queue '{self.queue_name}' already exists.")

            return queue_service_client.get_queue_client(self.queue_name)
        except Exception as e:
            LOGGER.error(f"Failed to create queue service client: {str(e)}")
            raise

    def send_to_queue(self, user_id: str, blob_url: str) -> str:
        """
        Send a message to the queue with user_id and blob_url.

        Args:
            user_id: The user's unique identifier
            blob_url: The uploaded blob URL

        Returns:
            Message ID if successful, error message otherwise
        """
        try:
            # Create message payload
            message_payload = {"user_id": user_id, "blob_url": blob_url}

            # Convert to JSON string
            message_json = json.dumps(message_payload)

            # Encode as UTF-8 bytes, then base64
            encoded_message = base64.b64encode(message_json.encode("utf-8")).decode(
                "utf-8"
            )

            # Get queue client and send message
            queue_client = self._get_queue_client()
            response = queue_client.send_message(encoded_message)

            print(
                f"Successfully sent message to queue '{self.queue_name}' "
                f"for user_id: {user_id}, Message ID: {response.id}"
            )
            return response.id

        except Exception as e:
            print(f"Error sending message to queue: {str(e)}")
            raise

    def send_jobid_to_queue(self, user_id: str, job_id: str) -> str:
        """
        Send a message to the queue with user_id and job_id.

        Args:
            user_id: The user's unique identifier
            job_id: The job's unique identifier

        Returns:
            Message ID if successful, error message otherwise
        """
        try:
            # Create message payload
            message_payload = {"user_id": user_id, "job_id": job_id}

            # Convert to JSON string
            message_json = json.dumps(message_payload)

            # Encode as UTF-8 bytes, then base64
            encoded_message = base64.b64encode(message_json.encode("utf-8")).decode(
                "utf-8"
            )

            # Get queue client and send message
            queue_client = self._get_queue_client()
            response = queue_client.send_message(encoded_message)

            print(
                f"Successfully sent message to queue '{self.queue_name}' "
                f"for user_id: {user_id}, Message ID: {response.id}"
            )
            return response.id

        except Exception as e:
            print(f"Error sending message to queue: {str(e)}")
            raise
