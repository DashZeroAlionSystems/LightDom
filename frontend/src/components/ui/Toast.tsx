import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/validation/cn';
import { Button } from './Button';

const toastVariants = cva(
  'relative flex w-full items-center gap-3 rounded-lg border border-border bg-surface-elevated p-4 shadow-lg transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'border-border',
        success: 'border-success bg-success/5',
        warning: 'border-warning bg-warning/5',
        error: 'border-error bg-error/5',
        info: 'border-primary bg-primary/5',
      },
      position: {
        'top-left': 'animate-slideInLeft',
        'top-right': 'animate-slideInRight',
        'top-center': 'animate-slideInDown',
        'bottom-left': 'animate-slideInLeft',
        'bottom-right': 'animate-slideInRight',
        'bottom-center': 'animate-slideInUp',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'top-right',
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  id: string;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  onClose?: () => void;
}

interface ToastState {
  toasts: ToastProps[];
}

type ToastAction =
  | { type: 'ADD_TOAST'; toast: ToastProps }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'UPDATE_TOAST'; toast: Partial<ToastProps> & { id: string } };

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        toasts: [...state.toasts, action.toast],
      };
    case 'REMOVE_TOAST':
      return {
        toasts: state.toasts.filter((toast) => toast.id !== action.id),
      };
    case 'UPDATE_TOAST':
      return {
        toasts: state.toasts.map((toast) =>
          toast.id === action.id ? { ...toast, ...action.toast } : toast
        ),
      };
    default:
      return state;
  }
};

const ToastContext = createContext<{
  toasts: ToastProps[];
  toast: (props: Omit<ToastProps, 'id'>) => string;
  dismiss: (id: string) => void;
} | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const toast = (props: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...props, id };
    dispatch({ type: 'ADD_TOAST', toast: newToast });

    // Auto dismiss after duration
    if (props.duration !== 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id });
      }, props.duration || 5000);
    }

    return id;
  };

  const dismiss = (id: string) => {
    dispatch({ type: 'REMOVE_TOAST', id });
  };

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={state.toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{
  toasts: ToastProps[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  return createPortal(
    <div className="fixed top-4 right-4 z-toast flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => onDismiss(toast.id)} />
      ))}
    </div>,
    document.body
  );
};

const Toast: React.FC<ToastProps> = ({
  id,
  title,
  description,
  action,
  variant,
  position,
  onClose,
  className,
  ...props
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return (
          <svg className="h-5 w-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(toastVariants({ variant, position }), className)}
      {...props}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="text-sm font-medium text-text">{title}</div>
        )}
        {description && (
          <div className="text-sm text-text-secondary mt-1">{description}</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            className="text-xs"
          >
            {action.label}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-6 w-6 text-text-tertiary hover:text-text"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

// Convenience functions for different toast types
export const toast = {
  success: (props: Omit<ToastProps, 'id' | 'variant'>) => {
    const { toast } = useToast();
    return toast({ ...props, variant: 'success' });
  },
  warning: (props: Omit<ToastProps, 'id' | 'variant'>) => {
    const { toast } = useToast();
    return toast({ ...props, variant: 'warning' });
  },
  error: (props: Omit<ToastProps, 'id' | 'variant'>) => {
    const { toast } = useToast();
    return toast({ ...props, variant: 'error' });
  },
  info: (props: Omit<ToastProps, 'id' | 'variant'>) => {
    const { toast } = useToast();
    return toast({ ...props, variant: 'info' });
  },
  default: (props: Omit<ToastProps, 'id' | 'variant'>) => {
    const { toast } = useToast();
    return toast({ ...props, variant: 'default' });
  },
};

export { ToastProvider, Toast, toastVariants };