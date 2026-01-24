// src/components/ui/Button.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import '@/styles/ui/button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({ 
  children, 
  className = '', 
  isLoading, 
  variant = 'primary',
  size = 'md',
  disabled, 
  ...props 
}: ButtonProps) => {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={classes}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="btn__spinner" />}
      {children}
    </button>
  );
};