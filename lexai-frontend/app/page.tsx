"use client";

import React, { useState, useMemo } from 'react';
import { WelcomeScreen } from '@/components/dashboard/WelcomeScreen';
import { DocumentSidebar } from '@/components/dashboard/DocumentSidebar';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
import { ChatInput } from '@/components/dashboard/ChatInput';
import { AuditResponse } from '@/types';
import { ShieldCheck, Menu, X, ArrowLeft } from 'lucide-react';
import '@/styles/layout.css';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [policyFiles, setPolicyFiles] = useState<File[]>([]);
  const [contractFiles, setContractFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResponse | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    setIsLoading(true);
    setChatHistory([]); 
    
    // Simulate a brief loading delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock data for demonstration (no backend required)
    const mockData: AuditResponse = {
      audit_summary: {
        risk_score: 65,
        critical_violations: 2,
        total_clauses_checked: 5
      },
      clause_analysis: [
        {
          clause_name: "Payment Terms",
          contract_text: "Payment is due upon receipt of invoice.",
          policy_rule: "All payments must be Net 30 or greater.",
          status: "CRITICAL",
          remediation_suggestion: "Change payment terms to Net 30."
        },
        {
          clause_name: "Liability Cap",
          contract_text: "Liability is limited to the contract value.",
          policy_rule: "Liability cap must not exceed 2x annual contract value.",
          status: "PASS"
        },
        {
          clause_name: "Termination Clause",
          contract_text: "Either party may terminate with 7 days notice.",
          policy_rule: "Minimum 30 days notice required for termination.",
          status: "WARNING",
          remediation_suggestion: "Extend notice period to at least 30 days."
        },
        {
          clause_name: "Intellectual Property",
          contract_text: "All IP created during engagement belongs to the client.",
          policy_rule: "IP ownership must be clearly defined with mutual rights.",
          status: "CRITICAL",
          remediation_suggestion: "Add clause for shared IP rights or licensing terms."
        },
        {
          clause_name: "Confidentiality",
          contract_text: "Both parties agree to maintain confidentiality for 2 years.",
          policy_rule: "Confidentiality period must be at least 2 years.",
          status: "PASS"
        }
      ]
    };
    
    setAuditResult(mockData);
    setChatHistory([{
      role: 'assistant',
      content: `Analysis complete! Found ${mockData.audit_summary.critical_violations} critical violations with a risk score of ${mockData.audit_summary.risk_score}/100. Ask me anything about the contract.`
    }]);
    setIsLoading(false);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    setChatHistory(prev => [...prev, { role: 'user', content: chatMessage }]);
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'This is a placeholder response. Connect this to your AI backend to get real contract analysis answers.' 
      }]);
    }, 500);
    setChatMessage('');
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
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
    </main>
  );
}