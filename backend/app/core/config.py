# backend/app/core/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application settings loaded from environment variables."""
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    APP_NAME: str = "LexAI Backend"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

settings = Settings()
