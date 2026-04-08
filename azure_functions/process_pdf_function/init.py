import logging
import json
import asyncio
import time
from io import BytesIO
import azure.functions as func
import requests

from ai.services.resume_pipeline.service import ResumeProcessor, configure_logging
from ai.services.resume_pipeline.ai_refiner import AzureOpenAIResumeRefiner
from ai.db.session_manager import db_session_manager


LOGGER = logging.getLogger("process_pdf_function")


async def process_resume_from_blob(user_id: str, blob_url: str) -> None:
    """
    Process a resume PDF from a blob URL.
    
    Args:
        user_id: The unique identifier for the job seeker
        blob_url: The URL of the PDF file in blob storage
    """
    configure_logging()
    
    try:
        # Download PDF from blob URL
        LOGGER.info(f"Downloading PDF from blob URL for user {user_id}")
        response = requests.get(blob_url)
        response.raise_for_status()
        
        pdf_bytes = response.content
        
        # Extract filename from URL
        file_name = blob_url.split("/")[-1] or "resume.pdf"
        
        # Create BytesIO stream from bytes
        pdf_stream = BytesIO(pdf_bytes)
        
        # Process resume using ResumeProcessor
        async with db_session_manager.session() as session:
            start_time = time.perf_counter()
            processor = ResumeProcessor(
                session=session,
                ai_refiner=AzureOpenAIResumeRefiner(),
            )
            
            await processor.process_resume(
                user_id=user_id,
                file_name=file_name,
                file_bytes=pdf_stream,
                raw_bytes=pdf_bytes,
                mime_type="application/pdf",
            )
            
            end_time = time.perf_counter()
            duration = end_time - start_time
            LOGGER.info(f"Resume processing completed in {duration:.2f} seconds for user {user_id}")
    
    except requests.RequestException as e:
        LOGGER.error(f"Failed to download PDF from blob URL: {str(e)}")
        raise
    except Exception as e:
        LOGGER.exception(f"Error processing resume for user {user_id}: {str(e)}")
        raise


def main(msg: func.QueueMessage) -> None:
    # Read message (JSON string) from queue
    message_body = msg.get_body().decode("utf-8")
    logging.info(f"Queue message received: {message_body}")

    # Parse JSON payload
    data = json.loads(message_body)

    # Get user ID and blob URL
    user_id = data.get("user_id")
    blob_url = data.get("blob_url")

    logging.info(f"Processing PDF for user {user_id} from blob {blob_url}")

    try:
        # Run async resume processing
        asyncio.run(process_resume_from_blob(user_id, blob_url))
        logging.info("Processing completed!")
    except Exception as e:
        logging.error(f"Processing failed: {str(e)}")
        raise
