"use client";

import React from 'react';
import { MessageSquare, Loader2, RotateCcw } from 'lucide-react';
import { AuditResponse } from '@/types';
import { AuditTable } from './AuditTable';
import '@/styles/components/chat-interface.css';

interface ChatInterfaceProps {
  chatHistory: Array<{ role: 'user' | 'assistant', content: string }>;
  isLoading: boolean;
  auditResult: AuditResponse | null;
  setAuditResult: (res: AuditResponse | null) => void;
}

export const ChatInterface = ({
  chatHistory,
  isLoading,
  auditResult,
  setAuditResult
}: ChatInterfaceProps) => {
  return (
    <div className="chat">
      {/* Empty State */}
      {chatHistory.length === 0 && !isLoading && !auditResult && (
        <div className="chat__empty">
          <div className="chat__empty-icon-wrapper">
            <MessageSquare className="chat__empty-icon" />
          </div>
          <div className="chat__empty-text">
            <p className="chat__empty-title">Ready to Analyze</p>
            <p className="chat__empty-subtitle">Upload documents and click &quot;Run Analysis&quot; to start</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="chat__loading">
          <Loader2 className="chat__loading-spinner" />
          <div className="chat__loading-text">
            <p className="chat__loading-title">Analyzing contracts...</p>
            <p className="chat__loading-subtitle">Comparing against your policies</p>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="chat__messages">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`chat__message chat__message--${msg.role}`}>
            <div className={`chat__bubble chat__bubble--${msg.role}`}>
              <p className="chat__bubble-text">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Audit Results Table (if available) */}
      {auditResult && (
        <div className="chat__results">
          <div className="chat__results-header">
            <h3 className="chat__results-title">Detailed Analysis</h3>
            <button onClick={() => setAuditResult(null)} className="chat__results-reset">
              <RotateCcw className="chat__results-reset-icon" /> Reset
            </button>
          </div>

          {/* Summary Cards */}
          <div className="chat__summary">
            <div className="chat__summary-card">
              <p className="chat__summary-label">Risk Score</p>
              <p className={`chat__summary-value ${auditResult.audit_summary.risk_score < 50 ? 'chat__summary-value--danger' : 'chat__summary-value--success'}`}>
                {auditResult.audit_summary.risk_score}/100
              </p>
            </div>
            <div className="chat__summary-card">
              <p className="chat__summary-label">Violations</p>
              <p className="chat__summary-value chat__summary-value--neutral">
                {auditResult.audit_summary.critical_violations}
              </p>
            </div>
          </div>

          {/* Audit Table */}
          <AuditTable clauses={auditResult.clause_analysis} />
        </div>
      )}
    </div>
  );
};
