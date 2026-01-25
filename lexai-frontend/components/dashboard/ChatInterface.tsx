"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Loader2, RotateCcw, Minimize2, Maximize2, X, GripHorizontal, Copy, Check, Pencil } from 'lucide-react';
import { AuditResponse } from '@/types';
import { AuditTable } from './AuditTable';
import '@/styles/components/chat-interface.css';

interface ChatInterfaceProps {
  chatHistory: Array<{ role: 'user' | 'assistant', content: string }>;
  isLoading: boolean;
  auditResult: AuditResponse | null;
  setAuditResult: (res: AuditResponse | null) => void;
  error: string | null;
  onUpdateMessage?: (index: number, content: string) => void;
}

export const ChatInterface = ({
  chatHistory,
  isLoading,
  auditResult,
  setAuditResult,
  error,
  onUpdateMessage
}: ChatInterfaceProps) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [position, setPosition] = useState(() => ({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 240 : 100, 
    y: 80 
  }));
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const startEditing = (index: number, content: string) => {
    setEditingIndex(index);
    setEditContent(content);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditContent("");
  };

  const saveEdit = (index: number) => {
    if (onUpdateMessage && editContent.trim()) {
      onUpdateMessage(index, editContent);
      setEditingIndex(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    setIsDragging(true);
    const rect = dragRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 220));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 100));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

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


      
      {/* Error State */}
      {error && !isLoading && (
        <div className="chat__empty">
            <div className="chat__empty-icon-wrapper" style={{ borderColor: 'var(--color-danger-200)', color: 'var(--color-danger-500)' }}>
                <MessageSquare className="chat__empty-icon" />
            </div>
            <div className="chat__empty-text">
                <p className="chat__empty-title" style={{ color: 'var(--color-danger-600)' }}>Oops, Something went Wrong</p>
                <p className="chat__empty-subtitle">Please try running the analysis again.</p>
            </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="chat__loading">
          <Loader2 className="chat__loading-spinner" />
          <div className="chat__loading-text">
            <p className="chat__loading-title">Please wait...</p>
            <p className="chat__loading-subtitle">Analyzing contracts against your policies</p>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="chat__messages">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`chat__message chat__message--${msg.role}`}>
            <div className={`chat__bubble chat__bubble--${msg.role}`}>
              {editingIndex === idx ? (
                <div className="chat__edit-area">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="chat__edit-input"
                    rows={Math.max(2, Math.ceil(editContent.length / 50))}
                  />
                  <div className="chat__edit-actions">
                    <button onClick={() => saveEdit(idx)} className="chat__edit-btn chat__edit-btn--save">
                      Save & Submit
                    </button>
                    <button onClick={cancelEditing} className="chat__edit-btn chat__edit-btn--cancel">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="chat__bubble-text">{msg.content}</p>
              )}
            </div>
            
            {/* Message Actions (Below Bubble) */}
            {!msg.content.includes('🎤 Voice message') && editingIndex !== idx && (
              <div className="chat__message-actions">
                <button 
                  onClick={async () => {
                    await navigator.clipboard.writeText(msg.content);
                    setCopiedIndex(idx);
                    setTimeout(() => setCopiedIndex(null), 2000);
                  }}
                  className="chat__action-btn"
                  title="Copy message"
                >
                  {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                </button>
                {msg.role === 'user' && onUpdateMessage && (
                  <button 
                    onClick={() => startEditing(idx, msg.content)}
                    className="chat__action-btn"
                    title="Edit message"
                  >
                    <Pencil size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Audit Results - Minimized Floating Version (Draggable) */}
      {auditResult && isMinimized && (
        <div 
          ref={dragRef}
          className={`chat__results-minimized ${isDragging ? 'chat__results-minimized--dragging' : ''}`}
          style={{ 
            left: position.x, 
            top: position.y,
            right: 'auto',
            bottom: 'auto'
          }}
        >
          <div 
            className="chat__results-minimized-header"
            onMouseDown={handleMouseDown}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div className="chat__results-minimized-drag">
              <GripHorizontal size={14} />
              <span className="chat__results-minimized-title">Analysis Results</span>
            </div>
            <div className="chat__results-minimized-actions">
              <button 
                onClick={() => setIsMinimized(false)} 
                className="chat__results-minimized-btn"
                title="Expand"
              >
                <Maximize2 size={16} />
              </button>
              <button 
                onClick={() => setAuditResult(null)} 
                className="chat__results-minimized-btn chat__results-minimized-btn--close"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="chat__results-minimized-content">
            <div className="chat__results-minimized-stat">
              <span className="chat__results-minimized-label">Risk</span>
              <span className={`chat__results-minimized-value ${auditResult.audit_summary.risk_score < 50 ? 'chat__results-minimized-value--danger' : ''}`}>
                {auditResult.audit_summary.risk_score}/100
              </span>
            </div>
            <div className="chat__results-minimized-stat">
              <span className="chat__results-minimized-label">Violations</span>
              <span className="chat__results-minimized-value chat__results-minimized-value--warning">
                {auditResult.audit_summary.critical_violations}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Audit Results Table - Expanded Version */}
      {auditResult && !isMinimized && (
        <div className="chat__results">
          <div className="chat__results-header">
            <h3 className="chat__results-title">Detailed Analysis</h3>
            <div className="chat__results-actions">
              <button 
                onClick={() => setIsMinimized(true)} 
                className="chat__results-minimize-btn"
                title="Minimize to corner"
              >
                <Minimize2 size={16} />
              </button>
              <button onClick={() => setAuditResult(null)} className="chat__results-reset">
                <RotateCcw className="chat__results-reset-icon" /> Reset
              </button>
            </div>
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
