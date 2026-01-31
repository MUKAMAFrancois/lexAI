from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
from app.services.llm_service import chat_with_gemini

router = APIRouter(tags=["Chat Assistant"])

@router.post("/chat")
async def chat_endpoint(
    message: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    context_text: str = Form(...),
    history: str = Form("[]") 
):
    
    if not message and not audio_file:
        raise HTTPException(status_code=400, detail="Must provide text or audio")

    audio_bytes = None
    if audio_file:
        audio_bytes = await audio_file.read()

    chat_history = [] 

    response_text = chat_with_gemini(
        context_text=context_text,
        chat_history=chat_history,
        user_text=message,
        user_audio_bytes=audio_bytes
    )
    
    return {"role": "assistant", "content": response_text}