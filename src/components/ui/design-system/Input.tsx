/**
 * Input Component - Design System
 * Modern input fields with focus states and icons
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon: Icon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const inputId = props.id || label?.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-text-secondary mb-2"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          id={inputId}
          className={`
            w-full px-4 py-3 bg-surface border border-border rounded-xl
            text-text-primary placeholder-text-tertiary
            focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-semantic-error' : ''}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-semantic-error">{error}</p>
      )}
    </div>
  );
};

export default Input;
