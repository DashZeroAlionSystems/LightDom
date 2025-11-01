/**
 * Alert Component - Material Design 3
 * Feedback component for displaying messages to users
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  X
} from 'lucide-react';

const alertVariants = cva(
  [
    'relative w-full rounded-lg border p-4',
    'text-body-md'
  ],
  {
    variants: {
      variant: {
        default: 'bg-surface text-on-surface border-outline',
        destructive:
          'border-error bg-error-container text-on-error-container dark:border-error',
        success:
          'border-success bg-success-container text-on-success-container',
        warning:
          'border-warning bg-warning-container text-on-warning-container',
        info:
          'border-info bg-info-container text-on-info-container'
      },
      size: {
        sm: 'p-3 text-body-sm',
        md: 'p-4 text-body-md',
        lg: 'p-6 text-body-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
);

const alertIcons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /**
   * Whether the alert can be dismissed
   */
  dismissible?: boolean;
  /**
   * Callback when alert is dismissed
   */
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', size, dismissible, onDismiss, children, ...props }, ref) => {
    const Icon = alertIcons[variant || 'default'];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant, size }), className)}
        {...props}
      >
        <div className="flex items-start">
          <Icon className="mt-0.5 shrink-0 h-5 w-5" />
          <div className="flex-1 pl-3">{children}</div>
          {dismissible && onDismiss && (
            <button
              type="button"
              className={cn(
                'ml-3 shrink-0 rounded-sm opacity-70 ring-offset-background',
                'transition-opacity hover:opacity-100',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:pointer-events-none'
              )}
              onClick={onDismiss}
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

// Alert Title Component
export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const AlertTitle = React.forwardRef<HTMLParagraphElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
);

AlertTitle.displayName = 'AlertTitle';

// Alert Description Component
export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
);

AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription, alertVariants };
export type { AlertProps, AlertTitleProps, AlertDescriptionProps };


