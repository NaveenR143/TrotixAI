import logging
import azure.functions as func
import base64
import json
import asyncio
from io import BytesIO
from uuid import uuid4
from ai.services.resume_pipeline.repository import JobSeekerRepository
from ai.services.resume_pipeline.service import ResumeProcessor
from ai.services.resume_pipeline.ai_refiner import AzureOpenAIResumeRefiner


async def process_resume_async(filename: str, file_bytes: bytes, phone_numbers: list):
    pdf_stream = BytesIO(file_bytes)

    repository = JobSeekerRepository()
    await repository.connect()
    try:
        processor = ResumeProcessor(
            repository=repository,
            ai_refiner=AzureOpenAIResumeRefiner()
        )
        await processor.process_resume(
            user_id=uuid4(),
            file_name=filename,
            file_bytes=pdf_stream,
            raw_bytes=file_bytes,
            mime_type="application/pdf"
        )
        logging.info(f"Resume processing completed for {filename}")
    finally:
        await repository.close()


def main(msg: func.QueueMessage):
    logging.info('Queue trigger function received a resume.')

    try:
        payload = json.loads(msg.get_body().decode('utf-8'))
        filename = payload['filename']
        file_bytes = base64.b64decode(payload['content'])
        phone_numbers = payload['phone_numbers']

        # Run the async processor
        asyncio.run(process_resume_async(filename, file_bytes, phone_numbers))

    except Exception as e:
        logging.error(f"Error processing resume: {str(e)}")
