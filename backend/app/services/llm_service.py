from google import genai
from google.genai import types
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Initialize Client
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

def analyze_contract_with_gemini(policy_text: str, contract_text: str) -> dict:
    """
    Analyzes a contract against a policy using Gemini AI.
    Returns a structured audit response.
    """
    prompt = f"""
    You are an expert legal auditor.
    
    1. GROUND TRUTH POLICY:
    {policy_text}
    
    2. CONTRACT TO AUDIT:
    {contract_text}
    
    TASK:
    Compare the CONTRACT against the POLICY. Identify clauses that violate the policy.
    
    OUTPUT FORMAT (JSON ONLY):
    Return a JSON object that strictly matches this structure:
    {{
        "audit_summary": {{
            "risk_score": (integer 0-100, where 100 is perfectly safe),
            "critical_violations": (integer count of CRITICAL issues),
            "total_clauses_checked": (integer)
        }},
        "clause_analysis": [
            {{
                "clause_name": "Name of clause (e.g. Payment Terms)",
                "contract_text": "Exact text from contract",
                "policy_rule": "The specific policy rule being violated",
                "status": "PASS" or "WARNING" or "CRITICAL",
                "remediation_suggestion": "How to fix it"
            }}
        ]
    }}
    """
    
    # Use 1.5 Flash
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    
    # Clean and parse JSON
    try:
        return json.loads(response.text)
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        return {"error": "Failed to parse AI response"}


def chat_with_gemini(context_text: str, chat_history: list, user_text: str = None, user_audio_bytes: bytes = None):
    """
    Sends text OR audio to Gemini along with the contract context.
    """
    contents = []
    
    system_instruction = f"""
    You are LexAI, an intelligent contract assistant. 
    User Context (Contract & Policy): 
    {context_text}
    
    Answer the user's question based strictly on the context above.
    If the user sends audio, transcribe it in your thought process but answer the question directly.
    """
    
    # In V2 SDK, system instruction is passed in config, but we can also prepend it to prompts if we want
    # For chat, best to just include it as context or first message
    
    # Construct message history for the new SDK
    # New SDK structure is simplified
    
    # 1. Add System/Context
    contents.append(types.Content(
        role="user",
        parts=[types.Part.from_text(text=system_instruction)]
    ))
    
    # 2. Add History
    for msg in chat_history[-5:]:
        role = "user" if msg['role'] == "user" else "model"
        contents.append(types.Content(
            role=role,
            parts=[types.Part.from_text(text=msg['content'])]
        ))
        
    # 3. Add Current Input (Text or Audio)
    parts = []
    if user_audio_bytes:
        parts.append(types.Part.from_bytes(data=user_audio_bytes, mime_type="audio/mp3"))
        parts.append(types.Part.from_text(text="The user sent an audio question. Listen to it and answer."))
    elif user_text:
        parts.append(types.Part.from_text(text=f"User Question: {user_text}"))
    
    contents.append(types.Content(
        role="user",
        parts=parts
    ))

    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=contents
    )
    return response.text