from fastapi import UploadFile
from PyPDF2 import PdfReader
import docx
import io
from typing import Union, List

async def parse_document(file: UploadFile) -> str:
    """Parse different document types and extract text content."""
    content = await file.read()
    file_extension = file.filename.lower().split('.')[-1]
    
    if file_extension == 'pdf':
        return await parse_pdf(content)
    elif file_extension in ['doc', 'docx']:
        return await parse_docx(content)
    elif file_extension == 'txt':
        return content.decode('utf-8')
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")

async def parse_pdf(content: bytes) -> str:
    """Extract text from PDF files."""
    pdf = PdfReader(io.BytesIO(content))
    text = []
    for page in pdf.pages:
        text.append(page.extract_text())
    return '\n'.join(text)

async def parse_docx(content: bytes) -> str:
    """Extract text from DOCX files."""
    doc = docx.Document(io.BytesIO(content))
    return '\n'.join([paragraph.text for paragraph in doc.paragraphs])