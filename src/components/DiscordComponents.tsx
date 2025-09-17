/**
 * Discord-Style UI Components
 * Reusable components that match Discord's design system
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, X, Check, AlertCircle } from 'lucide-react';

interface DiscordButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const DiscordButton: React.FC<DiscordButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  onClick,
  className = ''
}) => {
  const baseClasses = 'discord-btn';
  const variantClasses = {
    primary: 'discord-btn-primary',
    secondary: 'discord-btn-secondary',
    success: 'discord-btn-success',
    danger: 'discord-btn-danger',
    ghost: 'discord-btn-ghost'
  };
  const sizeClasses = {
    sm: 'discord-btn-sm',
    md: '',
    lg: 'discord-btn-lg'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
    >
      {children}
    </button>
  );
};

interface DiscordInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'password' | 'email';
  disabled?: boolean;
  className?: string;
}

export const DiscordInput: React.FC<DiscordInputProps> = ({
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  className = ''
}) => {
  return (
    <input
      type={type}
      className={`discord-input ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'text'
      }}
    />
  );
};

interface DiscordCardProps {
  children: React.ReactNode;
  title?: string;
  header?: React.ReactNode;
  className?: string;
}

export const DiscordCard: React.FC<DiscordCardProps> = ({
  children,
  title,
  header,
  className = ''
}) => {
  return (
    <div className={`discord-card ${className}`}>
      {(title || header) && (
        <div className="discord-card-header">
          {title && <h3 className="discord-card-title">{title}</h3>}
          {header}
        </div>
      )}
      {children}
    </div>
  );
};

interface DiscordCollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const DiscordCollapsible: React.FC<DiscordCollapsibleProps> = ({
  title,
  children,
  defaultOpen = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`discord-collapsible ${className}`}>
      <div
        className="discord-collapsible-header"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--discord-spacing-sm)',
          padding: 'var(--discord-spacing-sm) var(--discord-spacing-md)',
          cursor: 'pointer',
          borderRadius: 'var(--discord-radius-sm)',
          transition: 'background-color 0.2s ease',
          userSelect: 'none'
        }}
      >
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span style={{ fontWeight: '600', fontSize: '14px' }}>{title}</span>
      </div>
      {isOpen && (
        <div className="discord-collapsible-content" style={{ padding: '0 var(--discord-spacing-md)' }}>
          {children}
        </div>
      )}
    </div>
  );
};

interface DiscordModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const DiscordModal: React.FC<DiscordModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        className="discord-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--discord-bg-secondary)',
          borderRadius: 'var(--discord-radius-lg)',
          padding: 'var(--discord-spacing-lg)',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: 'var(--discord-shadow-lg)'
        }}
      >
        <div
          className="discord-modal-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--discord-spacing-md)'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--discord-text-muted)',
              cursor: 'pointer',
              padding: 'var(--discord-spacing-xs)',
              borderRadius: 'var(--discord-radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="discord-modal-content" style={{ marginBottom: 'var(--discord-spacing-md)' }}>
          {children}
        </div>
        {footer && (
          <div
            className="discord-modal-footer"
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--discord-spacing-sm)',
              borderTop: '1px solid var(--discord-border)',
              paddingTop: 'var(--discord-spacing-md)'
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

interface DiscordToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  duration?: number;
}

export const DiscordToast: React.FC<DiscordToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <Check size={16} />;
      case 'error': return <X size={16} />;
      case 'warning': return <AlertCircle size={16} />;
      default: return null;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return 'var(--discord-success)';
      case 'error': return 'var(--discord-danger)';
      case 'warning': return 'var(--discord-warning)';
      default: return 'var(--discord-primary)';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="discord-toast"
      style={{
        position: 'fixed',
        top: 'var(--discord-spacing-md)',
        right: 'var(--discord-spacing-md)',
        backgroundColor: 'var(--discord-bg-secondary)',
        border: `1px solid ${getColor()}`,
        borderRadius: 'var(--discord-radius-md)',
        padding: 'var(--discord-spacing-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--discord-spacing-sm)',
        boxShadow: 'var(--discord-shadow-md)',
        zIndex: 1001,
        animation: 'discord-fade-in 0.3s ease-out'
      }}
    >
      <div style={{ color: getColor() }}>{getIcon()}</div>
      <span style={{ fontSize: '14px' }}>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--discord-text-muted)',
          cursor: 'pointer',
          padding: 'var(--discord-spacing-xs)',
          marginLeft: 'var(--discord-spacing-sm)'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

interface DiscordProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const DiscordProgressBar: React.FC<DiscordProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`discord-progress ${className}`}>
      {(label || showPercentage) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--discord-spacing-xs)'
          }}
        >
          {label && <span style={{ fontSize: '12px', fontWeight: '500' }}>{label}</span>}
          {showPercentage && (
            <span style={{ fontSize: '12px', color: 'var(--discord-text-muted)' }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--discord-bg-quaternary)',
          borderRadius: 'var(--discord-radius-sm)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: 'var(--discord-primary)',
            borderRadius: 'var(--discord-radius-sm)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  );
};
