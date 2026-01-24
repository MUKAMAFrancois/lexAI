// src/components/dashboard/AuditTable.tsx
"use client";

import React, { useState } from 'react';
import { ClauseAnalysis, RiskLevel } from '@/types';
import { AlertCircle, CheckCircle, AlertTriangle, X, HelpCircle } from 'lucide-react';
import '@/styles/components/audit-table.css';

interface AuditTableProps {
  clauses: ClauseAnalysis[];
}

// Status badge component
const StatusBadge = ({ status }: { status: RiskLevel }) => {
  const statusLower = status.toLowerCase();
  const labels = {
    CRITICAL: 'Critical',
    WARNING: 'Warning',
    PASS: 'Pass'
  };
  const icons = {
    CRITICAL: AlertCircle,
    WARNING: AlertTriangle,
    PASS: CheckCircle
  };
  const Icon = icons[status];

  return (
    <span className={`audit-table__badge audit-table__badge--${statusLower}`}>
      <Icon className="audit-table__badge-icon" />
      {labels[status]}
    </span>
  );
};

// Popup modal component - displays AI explanation text
const ExplanationModal = ({ 
  clause, 
  onClose 
}: { 
  clause: ClauseAnalysis; 
  onClose: () => void;
}) => {
  const isCritical = clause.status === 'CRITICAL';
  const statusClass = isCritical ? 'critical' : 'warning';

  return (
    <div className="modal-overlay">
      <div className="modal">
        
        {/* Header */}
        <div className={`modal__header modal__header--${statusClass}`}>
          <div className="modal__header-content">
            <div className={`modal__icon-wrapper modal__icon-wrapper--${statusClass}`}>
              {isCritical ? (
                <AlertCircle className={`modal__icon modal__icon--${statusClass}`} />
              ) : (
                <AlertTriangle className={`modal__icon modal__icon--${statusClass}`} />
              )}
            </div>
            <div>
              <h3 className="modal__title">{clause.clause_name}</h3>
              <StatusBadge status={clause.status} />
            </div>
          </div>
          <button onClick={onClose} className="modal__close-btn">
            <X className="modal__close-icon" />
          </button>
        </div>

        {/* Content - Two Sections */}
        <div className="modal__body">
          
          {/* Section 1: What Went Wrong */}
          <div className="modal__section">
            <h4 className="modal__section-title">
              <span className={`modal__section-dot modal__section-dot--${statusClass}`}></span>
              What Went Wrong
            </h4>
            <div className={`modal__section-content modal__section-content--${statusClass}`}>
              <p className={`modal__section-text modal__section-text--${statusClass}`}>
                {clause.policy_rule}
              </p>
            </div>
          </div>

          {/* Section 2: Advice */}
          <div className="modal__section">
            <h4 className="modal__section-title">
              <span className="modal__section-dot modal__section-dot--advice"></span>
              Advice
            </h4>
            <div className="modal__section-content modal__section-content--advice">
              <p className="modal__section-text modal__section-text--advice">
                {clause.remediation_suggestion || "No specific remediation advice available yet. Consult with your legal team for guidance on this clause."}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="modal__footer">
          <button onClick={onClose} className="modal__confirm-btn">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export const AuditTable = ({ clauses }: AuditTableProps) => {
  const [selectedClause, setSelectedClause] = useState<ClauseAnalysis | null>(null);

  const getRowClass = (status: RiskLevel) => {
    const base = 'audit-table__row';
    if (status === 'CRITICAL') return `${base} audit-table__row--critical`;
    if (status === 'WARNING') return `${base} audit-table__row--warning`;
    return `${base} audit-table__row--pass`;
  };

  return (
    <>
      <div className="audit-table">
        <table className="audit-table__table">
          <thead className="audit-table__head">
            <tr>
              <th className="audit-table__th">Cases Analysed</th>
              <th className="audit-table__th audit-table__th--center">Decision</th>
            </tr>
          </thead>
          <tbody className="audit-table__body">
            {clauses.map((clause, idx) => (
              <tr key={idx} className={getRowClass(clause.status)}>
                {/* Cases Analysed Column */}
                <td className="audit-table__td">
                  <div className="audit-table__clause-cell">
                    <span className="audit-table__clause-name">{clause.clause_name}</span>
                    
                    {/* "Understand Why" indicator for non-PASS statuses */}
                    {clause.status !== 'PASS' && (
                      <button
                        onClick={() => setSelectedClause(clause)}
                        className={`audit-table__why-btn audit-table__why-btn--${clause.status.toLowerCase()}`}
                        title="Click to understand why"
                      >
                        <HelpCircle className="audit-table__why-icon" />
                        Understand Why
                      </button>
                    )}
                  </div>
                </td>

                {/* Decision Column */}
                <td className="audit-table__td audit-table__td--center">
                  <StatusBadge status={clause.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup Modal */}
      {selectedClause && (
        <ExplanationModal 
          clause={selectedClause} 
          onClose={() => setSelectedClause(null)} 
        />
      )}
    </>
  );
};