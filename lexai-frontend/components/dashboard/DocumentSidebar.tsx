"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Trash2, Plus, ShieldCheck, Loader2, X, Menu, GripVertical } from 'lucide-react';
import '@/styles/components/document-sidebar.css';

interface DocumentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  policyFiles: File[];
  contractFiles: File[];
  addPolicy: (file: File) => void;
  addContract: (file: File) => void;
  removePolicy: (index: number) => void;
  removeContract: (index: number) => void;
  handleAudit: () => void;
  isLoading: boolean;
  totalSizeMB: number;
  isOverLimit: boolean;
}

export const DocumentSidebar = ({
  isOpen,
  onClose,
  policyFiles,
  contractFiles,
  addPolicy,
  addContract,
  removePolicy,
  removeContract,
  handleAudit,
  isLoading,
  totalSizeMB,
  isOverLimit
}: DocumentSidebarProps) => {
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(200, Math.min(500, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);
  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      {/* LEFT SIDEBAR - Content Management */}
      <aside 
        ref={sidebarRef}
        className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--closed'}`}
        style={{ width: isOpen ? `${sidebarWidth}px` : undefined }}
      >
        
        {/* Resize Handle */}
        <div 
          className={`sidebar__resize-handle ${isResizing ? 'sidebar__resize-handle--active' : ''}`}
          onMouseDown={() => setIsResizing(true)}
        >
          <GripVertical size={12} />
        </div>
        
        {/* Sidebar Header */}
        <div className="sidebar__header">
          <div className="sidebar__header-row">
            <h2 className="sidebar__title">Document Manager</h2>
            <button 
              onClick={onClose}
              className="sidebar__close-btn"
              title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isOpen ? <X className="sidebar__close-icon" /> : <Menu className="sidebar__close-icon" />}
            </button>
          </div>
          <div className="sidebar__storage">
            <span>Storage Used</span>
            <span className={isOverLimit ? 'sidebar__storage-value--overlimit' : 'sidebar__storage-value'}>
              {totalSizeMB.toFixed(1)} / 50 MB
            </span>
          </div>
          <div className="sidebar__progress-bar">
            <div 
              className={`sidebar__progress-fill ${isOverLimit ? 'sidebar__progress-fill--overlimit' : ''}`}
              style={{ width: `${Math.min((totalSizeMB / 50) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Scrollable File Lists */}
        <div className="sidebar__content">
          
          {/* SECTION: Ground Truths */}
          <div className="sidebar__section">
            <div className="sidebar__section-header">
              <h3 className="sidebar__section-title">Ground Truths</h3>
              <label className="sidebar__add-btn">
                <Plus className="sidebar__add-icon" />
                <input 
                  type="file" 
                  accept=".pdf" 
                  multiple 
                  className="sidebar__hidden-input" 
                  onChange={(e) => {
                    Array.from(e.target.files || []).forEach(file => addPolicy(file));
                    e.target.value = '';
                  }} 
                />
              </label>
            </div>
            <div className="sidebar__file-list">
              {policyFiles.length === 0 ? (
                <p className="sidebar__empty-text">No policies uploaded</p>
              ) : (
                policyFiles.map((file, idx) => (
                  <div key={idx} className="sidebar__file-item">
                    <FileText className="sidebar__file-icon sidebar__file-icon--policy" />
                    <div className="sidebar__file-info">
                      <p className="sidebar__file-name">{file.name}</p>
                      <p className="sidebar__file-size">{(file.size/1024/1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={() => removePolicy(idx)} className="sidebar__file-delete">
                      <Trash2 className="sidebar__file-delete-icon" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION: Contracts */}
          <div className="sidebar__section">
            <div className="sidebar__section-header">
              <h3 className="sidebar__section-title">Contracts</h3>
              <label className="sidebar__add-btn">
                <Plus className="sidebar__add-icon" />
                <input 
                  type="file" 
                  accept=".pdf" 
                  multiple 
                  className="sidebar__hidden-input" 
                  onChange={(e) => {
                    Array.from(e.target.files || []).forEach(file => addContract(file));
                    e.target.value = '';
                  }} 
                />
              </label>
            </div>
            <div className="sidebar__file-list">
              {contractFiles.length === 0 ? (
                <p className="sidebar__empty-text">No contracts uploaded</p>
              ) : (
                contractFiles.map((file, idx) => (
                  <div key={idx} className="sidebar__file-item">
                    <FileText className="sidebar__file-icon sidebar__file-icon--contract" />
                    <div className="sidebar__file-info">
                      <p className="sidebar__file-name">{file.name}</p>
                      <p className="sidebar__file-size">{(file.size/1024/1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={() => removeContract(idx)} className="sidebar__file-delete">
                      <Trash2 className="sidebar__file-delete-icon" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Footer: Run Button */}
        <div className="sidebar__footer">
          <button
            onClick={handleAudit}
            disabled={policyFiles.length === 0 || contractFiles.length === 0 || isLoading}
            className="sidebar__run-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="sidebar__run-icon animate-spin" /> Please wait...
              </>
            ) : (
              <>
                <ShieldCheck className="sidebar__run-icon" /> Run Analysis
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
