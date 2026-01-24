// src/types/index.ts

export type RiskLevel = "CRITICAL" | "WARNING" | "PASS";

export interface ClauseAnalysis {
  clause_name: string;      // e.g., "Payment Terms"
  contract_text: string;    // e.g., "Payment due upon receipt"
  policy_rule: string;      // e.g., "Must be Net 30"
  status: RiskLevel;        // The "Traffic Light" status
  remediation_suggestion?: string; // Optional: Only exists if status is NOT "PASS"
}

export interface AuditSummary {
  risk_score: number;       // 0-100 (Where 100 is Safe)
  critical_violations: number;
  total_clauses_checked: number;
}

export interface AuditResponse {
  audit_summary: AuditSummary;
  clause_analysis: ClauseAnalysis[];
}