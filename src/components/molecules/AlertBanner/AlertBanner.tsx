import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { AlertCircle, CheckCircle, Info, XCircle, X, LucideIcon } from 'lucide-react';
import React, { forwardRef, useState } from 'react';
import { Typography } from '../atoms/Typography';
import { IconButton } from '../atoms/Icon';

const alertBannerVariants = cva(
  'flex items-start gap-3 rounded-lg border p-4 transition-all duration-200',
  {
    variants: {
      variant: {
        info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
        success: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
        warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800',
        error: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconColors = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
};

const defaultIcons: Record<string, LucideIcon> = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

export interface AlertBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertBannerVariants> {
  /** Alert title */
  title?: string;
  /** Alert description */
  description?: string;
  /** Custom icon */
  icon?: LucideIcon;
  /** Whether the alert can be dismissed */
  dismissible?: boolean;
  /** Callback when alert is dismissed */
  onDismiss?: () => void;
  /** Action buttons */
  action?: React.ReactNode;
}

export const AlertBanner = forwardRef<HTMLDivElement, AlertBannerProps>(
  (
    {
      variant = 'info',
      title,
      description,
      icon,
      dismissible,
      onDismiss,
      action,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const IconComponent = icon || defaultIcons[variant || 'info'];

    const handleDismiss = () => {
      setDismissed(true);
      onDismiss?.();
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertBannerVariants({ variant }), className)}
        {...props}
      >
        <IconComponent
          className={cn('w-5 h-5 shrink-0 mt-0.5', iconColors[variant || 'info'])}
        />
        <div className="flex-1 min-w-0">
          {title && (
            <Typography variant="subtitle2" className="font-semibold">
              {title}
            </Typography>
          )}
          {description && (
            <Typography variant="body2" color="muted" className="mt-0.5">
              {description}
            </Typography>
          )}
          {children}
          {action && <div className="mt-3">{action}</div>}
        </div>
        {dismissible && (
          <IconButton
            icon={X}
            label="Dismiss alert"
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="shrink-0 -mt-1 -mr-1"
          />
        )}
      </div>
    );
  }
);

AlertBanner.displayName = 'AlertBanner';
