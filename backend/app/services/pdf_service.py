# backend/app/services/pdf_service.py
import io
from fastapi import UploadFile
from pypdf import PdfReader

async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Reads an uploaded PDF file and extracts all text content.
    """
    # 1. Read the file bytes into memory
    content = await file.read()
    
    # 2. Create a file-like object for pypdf
    pdf_stream = io.BytesIO(content)
    
    # 3. Initialize PDF Reader
    reader = PdfReader(pdf_stream)
    
    full_text = []
    
    # 4. Extract text page by page
    for page in reader.pages:
        text = page.extract_text()
        if text:
            full_text.append(text)
            
    # 5. Join with newlines to preserve some structure
    return "\n".join(full_text)