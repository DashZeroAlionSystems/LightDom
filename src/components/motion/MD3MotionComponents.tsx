/**
 * Reusable Material Design 3 Motion Components
 * Pre-built components with built-in animations following MD3 spec
 */

import React, { HTMLAttributes, ReactNode, useState, useEffect } from 'react';
import '../styles/md3-motion-tokens.css';

// ============================================================================
// ANIMATED CONTAINER
// ============================================================================

interface AnimatedContainerProps extends HTMLAttributes<HTMLDivElement> {
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'shared-axis-x' | 'shared-axis-y';
  duration?: 'short' | 'medium' | 'long';
  delay?: number;
  triggerOnMount?: boolean;
  children: ReactNode;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  animation = 'fade',
  duration = 'medium',
  delay = 0,
  triggerOnMount = true,
  children,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(!triggerOnMount);

  useEffect(() => {
    if (triggerOnMount) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [triggerOnMount, delay]);

  const animationClass = isVisible ? `md3-${animation}-in` : '';
  const durationClass = `md3-duration-${duration}`;

  return (
    <div className={`${animationClass} ${durationClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

// ============================================================================
// STAGGERED LIST
// ============================================================================

interface StaggeredListProps extends HTMLAttributes<HTMLUListElement> {
  items: ReactNode[];
  staggerDelay?: number;
  animation?: 'fade' | 'slide-up';
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  items,
  staggerDelay = 30,
  animation = 'fade',
  className = '',
  ...props
}) => {
  return (
    <ul className={`md3-stagger-children ${className}`} {...props}>
      {items.map((item, index) => (
        <li
          key={index}
          className={`md3-${animation}-in`}
          style={{
            '--stagger-index': index,
            animationDelay: `${index * staggerDelay}ms`
          } as React.CSSProperties}
        >
          {item}
        </li>
      ))}
    </ul>
  );
};

// ============================================================================
// INTERACTIVE BUTTON
// ============================================================================

interface InteractiveButtonProps extends HTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  ripple?: boolean;
}

export const InteractiveButton: React.FC<InteractiveButtonProps> = ({
  variant = 'filled',
  size = 'md',
  ripple = true,
  children,
  className = '',
  ...props
}) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();
      
      setRipples([...ripples, { x, y, id }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    }
    
    props.onClick?.(e);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    filled: 'bg-purple-600 text-white hover:bg-purple-700',
    outlined: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50',
    text: 'text-purple-600 hover:bg-purple-50'
  };

  return (
    <button
      className={`
        relative overflow-hidden rounded-lg font-semibold
        md3-interactive md3-gpu-accelerated
        ${sizeClasses[size]} ${variantClasses[variant]} ${className}
      `}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripple && ripples.map(({ x, y, id }) => (
        <span
          key={id}
          className="absolute w-4 h-4 bg-white rounded-full pointer-events-none"
          style={{
            left: x,
            top: y,
            transform: 'translate(-50%, -50%)',
            animation: 'md3-ripple 600ms var(--md-motion-easing-emphasized) forwards'
          }}
        />
      ))}
    </button>
  );
};

// ============================================================================
// COLLAPSIBLE PANEL
// ============================================================================

interface CollapsiblePanelProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  children,
  defaultOpen = false,
  icon
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 md3-transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL DIALOG
// ============================================================================

interface ModalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const ModalDialog: React.FC<ModalDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 md3-fade-in"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden md3-scale-in md3-gpu-accelerated">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full md3-transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// TOAST NOTIFICATION
// ============================================================================

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  return (
    <div
      className={`
        fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg text-white
        ${typeStyles[type]} ${isVisible ? 'md3-slide-in-up' : 'md3-slide-out-down'}
      `}
    >
      {message}
    </div>
  );
};

// ============================================================================
// LOADING SPINNER
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'purple'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} border-${color}-600 border-t-transparent
        rounded-full animate-spin
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// ============================================================================
// PROGRESS BAR
// ============================================================================

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = true,
  color = 'purple',
  animated = true
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-${color}-600 ${animated ? 'md3-transition-all' : ''} rounded-full`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};

// ============================================================================
// SKELETON LOADER
// ============================================================================

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1
}) => {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded'
  };

  const skeleton = (
    <div
      className={`bg-gray-200 animate-pulse ${variantClasses[variant]}`}
      style={{
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'text' ? '1rem' : variant === 'circular' ? '40px' : '100px')
      }}
    />
  );

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={i < count - 1 ? 'mb-2' : ''}>
          {skeleton}
        </div>
      ))}
    </>
  );
};

// ============================================================================
// FADE IN VIEW (Intersection Observer)
// ============================================================================

interface FadeInViewProps {
  children: ReactNode;
  threshold?: number;
  className?: string;
}

export const FadeInView: React.FC<FadeInViewProps> = ({
  children,
  threshold = 0.1,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`${isVisible ? 'md3-fade-in' : 'opacity-0'} ${className}`}
    >
      {children}
    </div>
  );
};

export default {
  AnimatedContainer,
  StaggeredList,
  InteractiveButton,
  CollapsiblePanel,
  ModalDialog,
  Toast,
  LoadingSpinner,
  ProgressBar,
  Skeleton,
  FadeInView
};
