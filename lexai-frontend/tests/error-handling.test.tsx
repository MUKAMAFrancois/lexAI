
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatInterface } from '@/components/dashboard/ChatInterface';
import React from 'react';

vi.mock('@/components/dashboard/AuditTable', () => ({
  AuditTable: () => <div data-testid="audit-table">Audit Table</div>
}));

vi.mock('lucide-react', () => ({
  MessageSquare: () => <div data-testid="icon-message-square" />,
  Loader2: () => <div data-testid="icon-loader" />,
  RotateCcw: () => <div data-testid="icon-rotate-ccw" />
}));

describe('ChatInterface Error Handling', () => {
  const defaultProps = {
    chatHistory: [],
    isLoading: false,
    auditResult: null,
    setAuditResult: vi.fn(),
    error: null
  };

  it('renders healthy state correctly', () => {
    // Empty state
    render(<ChatInterface {...defaultProps} />);
    expect(screen.getByText('Ready to Analyze')).toBeDefined();
  });

  it('renders generic error message when error prop is present', () => {
    // Error state
    render(<ChatInterface {...defaultProps} error="Internal Server Error 500" />);
    
    expect(screen.getByText('Oops, Something went Wrong')).toBeDefined();
    expect(screen.getByText('Please try running the analysis again.')).toBeDefined();
    
    expect(screen.queryByText('Internal Server Error 500')).toBeNull();
  });

  it('prioritizes loading state over error state', () => {
    render(<ChatInterface {...defaultProps} isLoading={true} error="Some Error" />);
  });

  it('renders generic error instead of specific API errors', () => {
    const specificErrors = [
      '404 Not Found',
      '500 Server Error',
      'Timeout',
      'Network Error'
    ];

    specificErrors.forEach(err => {
      const { unmount } = render(<ChatInterface {...defaultProps} error={err} />);
      expect(screen.getByText('Oops, Something went Wrong')).toBeDefined();
      expect(screen.queryByText(err)).toBeNull();
      unmount();
    });
  });
});
