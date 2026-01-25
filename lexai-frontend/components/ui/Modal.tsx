"use client";

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import '@/styles/components/modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
}

export function Modal({ isOpen, onClose, title, message, type = 'warning' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>
        
        <div className={`modal-icon modal-icon--${type}`}>
          <AlertTriangle size={32} />
        </div>
        
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        
        <button className="modal-button" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
