from __future__ import annotations

import abc
import io
import logging
import csv
import os
import tempfile

from .errors import ParsingError

LOGGER = logging.getLogger("resume_processor")

try:
    import pdfplumber  # type: ignore
except Exception:  # pragma: no cover
    pdfplumber = None

try:
    import fitz  # PyMuPDF  # type: ignore
except Exception:  # pragma: no cover
    fitz = None

try:
    from docx import Document as DocxDocument  # type: ignore
except Exception:  # pragma: no cover
    DocxDocument = None  # type: ignore

try:
    import textract  # type: ignore
except Exception:  # pragma: no cover
    textract = None


class ResumeParserStrategy(abc.ABC):
    """Strategy interface for file-type-specific text extraction."""

    @abc.abstractmethod
    def parse_text(self, file_bytes: bytes) -> str:
        raise NotImplementedError


class PdfResumeParser(ResumeParserStrategy):
    """Extracts PDF text using pdfplumber first, then PyMuPDF fallback."""

    def parse_text(self, file_bytes: bytes) -> str:
        if pdfplumber is not None:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                pages = [page.extract_text() or "" for page in pdf.pages]
                text = "\n".join(pages).strip()
                if text:
                    return text

        if fitz is not None:
            document = fitz.open(stream=file_bytes, filetype="pdf")
            try:
                text = "\n".join(page.get_text("text") for page in document).strip()
            finally:
                document.close()
            if text:
                return text

        raise ParsingError("Unable to extract PDF text. Install `pdfplumber` or `PyMuPDF`.")


class CsvResumeParser(ResumeParserStrategy):
    """Extracts text from CSV resumes by flattening records into lines."""

    def parse_text(self, file_bytes: bytes) -> str:
        try:
            decoded = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            decoded = file_bytes.decode("latin-1", errors="ignore")

        reader = csv.DictReader(io.StringIO(decoded))
        rows = list(reader)
        if not rows:
            raise ParsingError("CSV resume appears empty.")

        lines: list[str] = []
        for row in rows:
            for key, value in row.items():
                if value is None:
                    continue
                cleaned = str(value).strip()
                if cleaned:
                    lines.append(f"{key}: {cleaned}")

        if not lines:
            raise ParsingError("CSV resume has no readable text values.")
        return "\n".join(lines)


class DocxResumeParser(ResumeParserStrategy):
    """Extracts text from DOCX resumes using python-docx."""

    def parse_text(self, file_bytes: bytes) -> str:
        if DocxDocument is None:
            raise ParsingError("DOCX parsing requires `python-docx`.")

        try:
            document = DocxDocument(io.BytesIO(file_bytes))
            lines = [para.text.strip() for para in document.paragraphs if para.text.strip()]
            text = "\n".join(lines).strip()
            if text:
                return text
        except Exception as exc:
            raise ParsingError(f"Failed to parse DOCX file: {exc}") from exc

        raise ParsingError("DOCX file parsed but no readable text was found.")


class DocResumeParser(ResumeParserStrategy):
    """Extracts text from legacy DOC resumes using textract."""

    def parse_text(self, file_bytes: bytes) -> str:
        if textract is None:
            raise ParsingError("DOC parsing requires `textract` and system parsers (e.g., antiword).")

        temp_path: str | None = None
        try:
            with tempfile.NamedTemporaryFile(suffix=".doc", delete=False) as temp_file:
                temp_file.write(file_bytes)
                temp_path = temp_file.name
            payload = textract.process(temp_path)
            text = payload.decode("utf-8", errors="ignore").strip()
            if text:
                return text
        except Exception as exc:
            raise ParsingError(f"Failed to parse DOC file: {exc}") from exc
        finally:
            if temp_path:
                try:
                    os.remove(temp_path)
                except OSError:
                    LOGGER.warning("Failed to remove temp DOC file: %s", temp_path)

        raise ParsingError("DOC file parsed but no readable text was found.")

