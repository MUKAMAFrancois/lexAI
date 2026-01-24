# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import audit, chat

app = FastAPI(title="LexAI Backend")
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audit.router)
app.include_router(chat.router)

@app.get("/")
def health_check():
    return {"status": "LexAI Backend is running", "model": "Gemini 1.5 Flash"}