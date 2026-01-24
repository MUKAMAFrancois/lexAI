# 1. virtual environment
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate

- Installations:
pip install fastapi uvicorn python-multipart google-genai pypdf pydantic python-dotenv

# 2. folder structure

backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Entry point of the app
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py        # Environment variables (API Keys)
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── audit.py         # Pydantic models (matches frontend interfaces)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── pdf_service.py   # logic to extract text from PDFs
│   │   └── llm_service.py   # Logic to talk to Gemini 1.5 Flash
│   └── routers/
│       ├── __init__.py
│       └── audit.py         # The /audit-contract endpoint
├── .env                     # Store your GOOGLE_API_KEY here
├── requirements.txt         # Python dependencies
└── run.py                   # Simple script to start the server

# 3. get api key 
- get it here: https://aistudio.google.com/api-keys
