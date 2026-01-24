// src/components/dashboard/RiskBadge.tsx
import React from 'react';
import { RiskLevel } from '@/types';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import '@/styles/components/risk-badge.css';

interface RiskBadgeProps {
  status: RiskLevel;
  showIcon?: boolean;
}

export const RiskBadge = ({ status, showIcon = false }: RiskBadgeProps) => {
  const statusLower = status.toLowerCase();
  
  const icons = {
    CRITICAL: AlertCircle,
    WARNING: AlertTriangle,
    PASS: CheckCircle,
  };
  
  const Icon = icons[status];

  return (
    <span className={`risk-badge risk-badge--${statusLower}`}>
      {showIcon && <Icon className="risk-badge__icon" />}
      {status}
    </span>
  );
};