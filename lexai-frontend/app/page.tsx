"use client";

import React, { useState, useMemo, useRef } from 'react';
import { WelcomeScreen } from '@/components/dashboard/WelcomeScreen';
import { DocumentSidebar } from '@/components/dashboard/DocumentSidebar';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
import { ChatInput } from '@/components/dashboard/ChatInput';
import { Modal } from '@/components/ui/Modal';
import { AuditResponse } from '@/types';
import { ShieldCheck, Menu, X, ArrowLeft } from 'lucide-react';
import { uploadAuditFiles, sendChatMessage } from '@/lib/api';
import '@/styles/layout.css';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [policyFiles, setPolicyFiles] = useState<File[]>([]);
  const [contractFiles, setContractFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResponse | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: '', message: '' });
  
  // Voice recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const totalSizeMB = useMemo(() => {
    const allFiles = [...policyFiles, ...contractFiles];
    return allFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024);
  }, [policyFiles, contractFiles]);

  const isOverLimit = totalSizeMB > 50;

  const addPolicy = (file: File) => {
    if (totalSizeMB + (file.size / 1024 / 1024) > 50) {
      alert("Total file size cannot exceed 50MB");
      return;
    }
    setPolicyFiles(prev => [...prev, file]);
  };

  const addContract = (file: File) => {
    if (totalSizeMB + (file.size / 1024 / 1024) > 50) {
      alert("Total file size cannot exceed 50MB");
      return;
    }
    setContractFiles(prev => [...prev, file]);
  };

  const removePolicy = (index: number) => {
    setPolicyFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeContract = (index: number) => {
    setContractFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    setCurrentStep(2);
    setIsSidebarOpen(true);
  };

  const handleAudit = async () => {
    if (policyFiles.length === 0 || contractFiles.length === 0) return;
    
    // Check for duplicate documents
    const hasDuplicates = policyFiles.some(policyFile => 
      contractFiles.some(contractFile => 
        policyFile.name === contractFile.name && 
        policyFile.size === contractFile.size &&
        policyFile.lastModified === contractFile.lastModified
      )
    );
    
    if (hasDuplicates) {
      alert("⚠️ Duplicate Document Detected\n\nYou've uploaded the same document for both Policy and Contract. Please ensure you upload different documents.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setChatHistory([]); 
    
    try {
        // Call real backend API
        const result = await uploadAuditFiles(policyFiles[0], contractFiles[0]);
        
        setAuditResult(result);
        setChatHistory([{
          role: 'assistant',
          content: `Analysis complete! Found ${result.audit_summary.critical_violations} critical violations with a risk score of ${result.audit_summary.risk_score}/100. Ask me anything about the contract.`
        }]);
    } catch (err: unknown) {
        // Check if this is an axios error with a response
        const axiosError = err as { response?: { status?: number; data?: { detail?: { error_type?: string; message?: string } } } };
        
        if (axiosError.response?.status === 422 && 
            axiosError.response?.data?.detail?.error_type === "UNRELATED_DOCUMENTS") {
          // Show modal for unrelated documents (expected behavior, no console error)
          setModalInfo({
            isOpen: true,
            title: "Invalid Documents",
            message: axiosError.response.data.detail.message || "The uploaded documents do not appear to be internal policies or contracts."
          });
        } else {
          // Unexpected error - log it
          console.error("Analysis failed:", err);
          setError("Oops, Something went Wrong");
        }
        setAuditResult(null);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    
    try {
      // Build context from audit result
      const contextText = auditResult 
        ? JSON.stringify(auditResult) 
        : 'No contract analysis available yet.';
      
      // Call real backend chat API with text message
      const response = await sendChatMessage(contextText, chatHistory, userMessage);
      
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: response.content 
      }]);
    } catch (err) {
      console.error('Chat failed:', err);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      console.log('Stopping recording...');
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    } else {
      // Start recording
      try {
        console.log('Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone access granted, starting MediaRecorder...');
        
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          console.log('Audio chunk received:', event.data.size, 'bytes');
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          console.log('MediaRecorder stopped, processing audio...');
          console.log('Total chunks:', audioChunksRef.current.length);
          
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          console.log('Audio blob created:', audioBlob.size, 'bytes');
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
          
          if (audioBlob.size === 0) {
            console.error('Audio blob is empty!');
            setChatHistory(prev => [...prev, { 
              role: 'assistant', 
              content: 'No audio was recorded. Please try again and speak into your microphone.' 
            }]);
            return;
          }
          
          // Send audio to backend
          setChatHistory(prev => [...prev, { role: 'user', content: '🎤 Voice message sent...' }]);
          
          try {
            const contextText = auditResult 
              ? JSON.stringify(auditResult) 
              : 'No contract analysis available yet.';
            
            console.log('Sending audio to backend...');
            const response = await sendChatMessage(contextText, chatHistory, undefined, audioBlob);
            console.log('Backend response received:', response);
            
            setChatHistory(prev => [...prev, { 
              role: 'assistant', 
              content: response.content 
            }]);
          } catch (err) {
            console.error('Voice chat failed:', err);
            setChatHistory(prev => [...prev, { 
              role: 'assistant', 
              content: 'Sorry, I couldn\'t process your voice message. Please try again.' 
            }]);
          }
        };

        // Request data every 250ms to ensure we get chunks
        mediaRecorder.start(250);
        setIsRecording(true);
        console.log('Recording started!');
      } catch (err) {
        console.error('Microphone access denied:', err);
        alert('Please allow microphone access to use voice input.');
      }
    }
  };

  return (
    <main className="app">
      
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar__left">
          {currentStep === 2 && (
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="navbar__menu-btn"
            >
              {isSidebarOpen ? <X className="navbar__menu-icon" /> : <Menu className="navbar__menu-icon" />}
            </button>
          )}
          <div className="navbar__logo">
            <ShieldCheck className="navbar__logo-icon" />
          </div>
          <span className="navbar__brand">LexAI</span>
        </div>
        
        {currentStep === 2 && (
          <button 
            onClick={() => setCurrentStep(1)}
            className="navbar__back-btn"
            title="Back to Welcome"
          >
            <ArrowLeft className="navbar__back-icon" />
            <span className="navbar__back-text">Back</span>
          </button>
        )}
      </nav>

      {/* BODY CONTENT */}
      <div className="body">
        {currentStep === 1 && (
          <WelcomeScreen onNext={handleNext} />
        )}

        {currentStep === 2 && (
          <div className="workspace">
            <DocumentSidebar 
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              policyFiles={policyFiles}
              contractFiles={contractFiles}
              addPolicy={addPolicy}
              addContract={addContract}
              removePolicy={removePolicy}
              removeContract={removeContract}
              handleAudit={handleAudit}
              isLoading={isLoading}
              totalSizeMB={totalSizeMB}
              isOverLimit={isOverLimit}
            />

            <section className={`workspace__main ${isSidebarOpen ? 'workspace__main--sidebar-open' : ''}`}>
              <ChatInterface 
                chatHistory={chatHistory}
                isLoading={isLoading}
                auditResult={auditResult}
                setAuditResult={setAuditResult}
                error={error}
                onUpdateMessage={async (index, newContent) => {
                  // 1. Slice history to keep messages BEFORE the edited one
                  const prevHistory = chatHistory.slice(0, index);
                  
                  // 2. Add the edited message
                  const updatedHistory = [...prevHistory, { role: 'user' as const, content: newContent }];
                  setChatHistory(updatedHistory);
                  
                  // 3. Trigger new AI response based on updated history
                  try {
                    const contextText = auditResult 
                      ? JSON.stringify(auditResult) 
                      : 'No contract analysis available yet.';
                    
                    // Add loading state placeholder if needed, or just let the API call resolve
                    const response = await sendChatMessage(contextText, updatedHistory, newContent);
                    
                    setChatHistory(prev => [...prev, { 
                      role: 'assistant', 
                      content: response.content 
                    }]);
                  } catch (err) {
                    console.error('Update chat failed:', err);
                    setChatHistory(prev => [...prev, { 
                      role: 'assistant', 
                      content: 'Sorry, I encounted an error while updating. Please try again.' 
                    }]);
                  }
                }}
              />
              
              <ChatInput 
                chatMessage={chatMessage}
                setChatMessage={setChatMessage}
                handleSendMessage={handleSendMessage}
                toggleRecording={toggleRecording}
                isRecording={isRecording}
                isLoading={isLoading}
              />
            </section>
          </div>
        )}
      </div>

      {/* Error Modal for Unrelated Documents */}
      <Modal
        isOpen={modalInfo.isOpen}
        onClose={() => setModalInfo({ isOpen: false, title: '', message: '' })}
        title={modalInfo.title}
        message={modalInfo.message}
        type="warning"
      />
    </main>
  );
}