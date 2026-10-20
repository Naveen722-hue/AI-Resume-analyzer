from pathlib import Path

from docx import Document
from pypdf import PdfReader

from app.utils.text_cleaner import clean_text


class UnsupportedFileError(Exception):
    pass


def _read_pdf(path: Path) -> str:
    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def _read_docx(path: Path) -> str:
    doc = Document(str(path))
    return "\n".join(p.text for p in doc.paragraphs)


def _read_txt(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def extract_text(path) -> str:
    """Pull plain text out of a resume file (pdf, docx or txt)."""
    path = Path(path)
    ext = path.suffix.lower()

    if ext == ".pdf":
        raw = _read_pdf(path)
    elif ext == ".docx":
        raw = _read_docx(path)
    elif ext == ".txt":
        raw = _read_txt(path)
    else:
        raise UnsupportedFileError(f"Unsupported file type: {ext}")

    return clean_text(raw)
