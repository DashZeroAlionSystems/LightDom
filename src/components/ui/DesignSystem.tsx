/**
 * LightDom Design System - Utility Components
 * Provides consistent styling and behavior across all components
 */

import React from 'react';
import { cn } from '@/utils/validation/cn';

// Button Component with Design System
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'ld-btn',
        `ld-btn--${variant}`,
        `ld-btn--${size}`,
        loading && 'ld-btn--loading',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      <span className="ld-btn__content">{children}</span>
      {loading && <div className="ld-btn__spinner" />}
    </button>
  );
};

// Card Component with Design System
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'outlined';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'ld-card',
        `ld-card--${variant}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Input Component with Design System
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  size?: 'sm' | 'md' | 'lg';
  error?: boolean;
  label?: string;
  help?: string;
  errorMessage?: string;
}

export const Input: React.FC<InputProps> = ({
  size = 'md',
  error = false,
  label,
  help,
  errorMessage,
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="ld-input-group">
      {label && (
        <label htmlFor={inputId} className="ld-input-group__label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'ld-input',
          `ld-input--${size}`,
          error && 'ld-input--error',
          className
        )}
        {...props}
      />
      {error && errorMessage && (
        <div className="ld-input-group__error">{errorMessage}</div>
      )}
      {help && !error && (
        <div className="ld-input-group__help">{help}</div>
      )}
    </div>
  );
};

// Badge Component with Design System
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'ld-badge',
        `ld-badge--${variant}`,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// Container Component with Design System
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ({
  size = 'xl',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'ld-container',
        `ld-container--${size}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Grid Component with Design System
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Grid: React.FC<GridProps> = ({
  cols = 3,
  gap = 'md',
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'ld-grid',
        `ld-grid--cols-${cols}`,
        `ld-grid--gap-${gap}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Flex Component with Design System
interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: 'wrap' | 'nowrap';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  align,
  justify,
  wrap = 'nowrap',
  gap,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'ld-flex',
        `ld-flex--${direction}`,
        align && `ld-flex--${align}`,
        justify && `ld-flex--${justify}`,
        `ld-flex--${wrap}`,
        gap && `ld-grid--gap-${gap}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Modal Component with Design System
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer
}) => {
  if (!isOpen) return null;

  return (
    <div className="ld-modal">
      <div className="ld-modal__backdrop" onClick={onClose} />
      <div className="ld-modal__content">
        {title && (
          <div className="ld-modal__header">
            <h2 className="ld-modal__title">{title}</h2>
            <button
              className="ld-modal__close"
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
        )}
        <div className="ld-modal__body">{children}</div>
        {footer && <div className="ld-modal__footer">{footer}</div>}
      </div>
    </div>
  );
};

// Toast Component with Design System
interface ToastProps {
  type?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  duration = 5000
}) => {
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={`ld-toast ld-toast--${type}`}>
      <div className="ld-toast__content">
        <div className="ld-toast__body">
          {title && <div className="ld-toast__title">{title}</div>}
          <div className="ld-toast__message">{message}</div>
        </div>
        {onClose && (
          <button
            className="ld-toast__close"
            onClick={onClose}
            aria-label="Close toast"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// Progress Component with Design System
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showValue?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  showValue = false,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('ld-progress', className)} {...props}>
      <div
        className="ld-progress__bar"
        style={{ width: `${percentage}%` }}
      />
      {showValue && (
        <div className="ld-text-xs ld-text-center ld-mt-1">
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

// Skeleton Component with Design System
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rect';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  size = 'md',
  width,
  height,
  className,
  ...props
}) => {
  const sizeClass = variant === 'text' ? `ld-skeleton--text--${size}` : '';
  
  return (
    <div
      className={cn(
        'ld-skeleton',
        `ld-skeleton--${variant}`,
        sizeClass,
        className
      )}
      style={{
        width: width || (variant === 'circle' ? '1rem' : '100%'),
        height: height || (variant === 'circle' ? '1rem' : undefined),
        ...props.style
      }}
      {...props}
    />
  );
};

// Spinner Component with Design System
interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'ld-spinner',
        `ld-spinner--${size}`,
        className
      )}
      {...props}
    />
  );
};

// Divider Component with Design System
interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className,
  ...props
}) => {
  return (
    <hr
      className={cn(
        'ld-divider',
        `ld-divider--${orientation}`,
        className
      )}
      {...props}
    />
  );
};

// Export all components
export {
  Button,
  Card,
  Input,
  Badge,
  Container,
  Grid,
  Flex,
  Modal,
  Toast,
  Progress,
  Skeleton,
  Spinner,
  Divider
};
