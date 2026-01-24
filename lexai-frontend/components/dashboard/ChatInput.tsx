"use client";

import React from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import '@/styles/components/chat-input.css';

interface ChatInputProps {
  chatMessage: string;
  setChatMessage: (msg: string) => void;
  handleSendMessage: () => void;
  toggleRecording: () => void;
  isRecording: boolean;
  isLoading: boolean;
}

export const ChatInput = ({
  chatMessage,
  setChatMessage,
  handleSendMessage,
  toggleRecording,
  isRecording,
  isLoading
}: ChatInputProps) => {
  return (
    <div className="chat-input">
      <div className="chat-input__container">
        <div className={`chat-input__wrapper ${isRecording ? 'chat-input__wrapper--recording' : ''}`}>
          <textarea 
            placeholder="Ask about clauses, risks, or get clarifications..." 
            className="chat-input__textarea"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
          />
          <div className="chat-input__actions">
            <button 
              onClick={toggleRecording}
              className={`chat-input__btn ${isRecording ? 'chat-input__btn--mic-active' : 'chat-input__btn--mic'}`}
              title={isRecording ? "Stop Recording" : "Voice Input"}
            >
              {isRecording ? <MicOff className="chat-input__btn-icon" /> : <Mic className="chat-input__btn-icon" />}
            </button>
            <button 
              onClick={handleSendMessage}
              disabled={!chatMessage.trim() || isLoading}
              className="chat-input__btn chat-input__btn--send"
            >
              <Send className="chat-input__btn-icon" />
            </button>
          </div>
        </div>
        <p className="chat-input__hint">
          {isRecording 
            ? <span className="chat-input__hint--recording">
                <span className="chat-input__recording-dot"></span>
                Recording Voice... Click to Stop
              </span> 
            : <span className="chat-input__hint--normal">Press Enter to send • Shift + Enter for new line</span>
          }
        </p>
      </div>
    </div>
  );
};
