# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import audit, chat

app = FastAPI(
    title="LexAI API",
    description="AI-powered legal contract audit and chat assistant.",
    version="1.0.0"
)

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

from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
def welcome():
    return """
    <!DOCTYPE html>
    <html>
        <head>
            <title>LexAI API</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    background-color: #f0f2f5;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .container {
                    background-color: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    max-width: 400px;
                }
                h1 {
                    color: #1a73e8;
                    margin-bottom: 1rem;
                }
                p {
                    color: #5f6368;
                    margin-bottom: 2rem;
                }
                .btn {
                    display: inline-block;
                    background-color: #1a73e8;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: 500;
                    transition: background-color 0.2s;
                }
                .btn:hover {
                    background-color: #1557b0;
                }
                .server-info {
                    margin-top: 2rem;
                    font-size: 0.8rem;
                    color: #9aa0a6;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>LexAI API</h1>
                <p>Welcome to the AI-powered legal contract audit assistant.</p>
                <a href="/docs" class="btn">View API Documentation</a>
                <div class="server-info">
                    Status: Running &bull; Model: Gemini 2.5 Flash
                </div>
            </div>
        </body>
    </html>
    """