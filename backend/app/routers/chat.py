from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
from app.services.llm_service import chat_with_gemini

router = APIRouter()

@router.post("/chat")
async def chat_endpoint(
    message: Optional[str] = Form(None),
    # We accept audio as a file upload
    audio_file: Optional[UploadFile] = File(None),
    # The frontend must send the context back (hidden state)
    context_text: str = Form(...),
    # We can pass history as a JSON string and parse it, or simplified for now
    history: str = Form("[]") 
):
    
    if not message and not audio_file:
        raise HTTPException(status_code=400, detail="Must provide text or audio")

    audio_bytes = None
    if audio_file:
        audio_bytes = await audio_file.read()

    # Parse history string to list (if you implement history parsing)
    # import json
    # chat_history = json.loads(history)
    chat_history = [] 

    response_text = chat_with_gemini(
        context_text=context_text,
        chat_history=chat_history,
        user_text=message,
        user_audio_bytes=audio_bytes
    )
    
    return {"role": "assistant", "content": response_text}