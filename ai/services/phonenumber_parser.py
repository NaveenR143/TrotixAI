import re
import io
from pdfminer.high_level import extract_text as extract_pdf_text
import docx
import mammoth


def extract_phone_numbers_from_file(file_bytes: bytes, filename: str):
    """
    Returns a list of unique 10-digit phone numbers from PDF/DOCX/DOC
    """
    text = ""
    fname = filename.lower()

    if fname.endswith(".pdf"):
        with io.BytesIO(file_bytes) as f:
            text = extract_pdf_text(f)
    elif fname.endswith(".docx"):
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join([p.text for p in doc.paragraphs])
    elif fname.endswith(".doc"):
        text = mammoth.extract_raw_text(io.BytesIO(file_bytes)).value
    else:
        return []

    numbers = re.findall(r"\b\d{10}\b", text)
    return list(set(numbers))  # remove duplicates
