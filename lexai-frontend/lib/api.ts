// src/lib/api.ts
import axios from 'axios';
import { AuditResponse } from '@/types';

// Create a configured instance of Axios
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000', // when running locally we use port 8000
  timeout: 60000, // 60 seconds (AI takes time to think)
});

// Helper function to upload the two PDFs
export const uploadAuditFiles = async (policy: File, contract: File) => {
  const formData = new FormData();
  formData.append('policy_file', policy);
  formData.append('contract_file', contract);

  // We use the generic <AuditResponse> to tell TypeScript what comes back
  const response = await api.post<AuditResponse>('/audit-contract', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Helper function to send chat messages (text or audio)
export const sendChatMessage = async (
  contextText: string,
  history: Array<{ role: string; content: string }> = [],
  message?: string,
  audioFile?: Blob
) => {
  const formData = new FormData();
  formData.append('context_text', contextText);
  formData.append('history', JSON.stringify(history));
  
  if (message) {
    formData.append('message', message);
  }
  
  if (audioFile) {
    formData.append('audio_file', audioFile, 'recording.webm');
  }

  const response = await api.post<{ role: string; content: string }>('/chat', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};