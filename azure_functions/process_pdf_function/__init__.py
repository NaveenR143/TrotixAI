import azure.functions as func
import logging
import sys
from pathlib import Path
from datetime import datetime
import base64

# Configure logging to print INFO messages immediately
logging.basicConfig(
    level=logging.INFO,
    stream=sys.stdout,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

def main(msg: func.QueueMessage):
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
        logging.info(f"[{timestamp}] FUNCTION TRIGGERED")
        
        logging.info(f"Message ID: {msg.id}")
        logging.info(f"Dequeue count: {msg.dequeue_count}")

        # Directly decode bytes as UTF-8
        content = msg.get_body().decode("utf-8")
        logging.info(f"Received message: {content}")
        
        output_file = Path(__file__).parent / "output.txt"
        logging.info(f"Writing to: {output_file}")
        
        with open(output_file, "a", encoding="utf-8") as f:
            f.write(f"[{timestamp}] {content}\n")
            f.flush()
        
        logging.info("✅ Write successful")

    except Exception as e:
        logging.error(f"❌ Error: {str(e)}", exc_info=True)
        raise