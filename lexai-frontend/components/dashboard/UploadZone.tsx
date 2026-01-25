// src/components/dashboard/UploadZone.tsx
"use client";

import React, { useCallback } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import '@/styles/components/upload-zone.css';

interface UploadZoneProps {
  label: string;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export const UploadZone = ({ label, onFileSelect, selectedFile, onClear }: UploadZoneProps) => {
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    maxFiles: 1,
    accept: { 'application/pdf': ['.pdf'] }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  if (selectedFile) {
    return (
      <div className="upload-zone upload-zone--selected">
        <div className="upload-zone__file-info">
          <div className="upload-zone__file-icon-wrapper">
            <FileText className="upload-zone__file-icon" />
          </div>
          <div>
            <p className="upload-zone__file-name">{label} Uploaded</p>
            <p className="upload-zone__file-size">{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
          </div>
        </div>
        <button onClick={onClear} className="upload-zone__clear-btn">
          <X className="upload-zone__clear-icon" />
        </button>
      </div>
    );
  }

  return (
    <div 
      {...getRootProps()} 
      className={`upload-zone ${isDragActive ? 'upload-zone--active' : ''}`}
    >
      <input {...getInputProps()} />
      <div className="upload-zone__content">
        <div className="upload-zone__icon-wrapper">
          <UploadCloud className="upload-zone__icon" />
        </div>
        <p className="upload-zone__label">Click to upload {label}</p>
        <p className="upload-zone__hint">PDF only (Max 50MB)</p>
      </div>
    </div>
  );
};