from fastapi import APIRouter, UploadFile, File, HTTPException
from services.pdf_service import extract_text_from_pdf
from services.llm_service import analyze_contract_with_gemini
from schemas.audit import AuditResponse

router = APIRouter(tags=["Contract Audit"])

@router.post("/audit-contract", response_model=AuditResponse)
async def audit_contract(
    policy_file: UploadFile = File(...),
    contract_file: UploadFile = File(...)
):
    # 1. Read files
    try:
        policy_text = await extract_text_from_pdf(policy_file)
        contract_text = await extract_text_from_pdf(contract_file)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid PDF files")

    # 2. Analyze with Gemini
    analysis_result = analyze_contract_with_gemini(policy_text, contract_text)
    
    # 3. Check for validation errors (unrelated documents)
    if "error_type" in analysis_result:
        if analysis_result["error_type"] == "UNRELATED_DOCUMENTS":
            raise HTTPException(
                status_code=422, 
                detail={
                    "error_type": "UNRELATED_DOCUMENTS",
                    "message": analysis_result.get("error", "The uploaded documents are not relevant for contract auditing.")
                }
            )
    
    return analysis_result