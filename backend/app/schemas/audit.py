from pydantic import BaseModel
from typing import List, Optional

class ClauseAnalysis(BaseModel):
    clause_name: str
    contract_text: str
    policy_rule: str
    status: str  # "PASS", "WARNING", "CRITICAL"
    remediation_suggestion: Optional[str] = None

class AuditSummary(BaseModel):
    risk_score: int
    critical_violations: int
    total_clauses_checked: int

class AuditResponse(BaseModel):
    audit_summary: AuditSummary
    clause_analysis: List[ClauseAnalysis]