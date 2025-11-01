import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import type { ButtonProps } from './Button';

interface AsyncStateBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  actionVariant?: ButtonProps['variant'];
}

const containerClasses = 'flex w-full flex-col items-center justify-center gap-3 text-center rounded-3xl border border-outline-variant bg-surface-container-high p-8';

export const AsyncStateEmpty: React.FC<AsyncStateBaseProps> = ({
  title = 'Nothing here yet',
  description = 'Start by adding items or configuring your workflow.',
  icon,
  actionLabel,
  onAction,
  compact = false,
  actionVariant = 'filled',
  className,
  children,
  ...props
}) => (
  <div className={cn(containerClasses, compact && 'p-6', 'bg-surface-container text-on-surface', className)} {...props}>
    {icon}
    <div className="md3-title-large text-on-surface">{title}</div>
    <p className="md3-body-medium max-w-lg text-on-surface-variant">{description}</p>
    {children}
    {actionLabel && onAction && (
      <Button variant={actionVariant} onClick={onAction} fullWidth={compact}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export const AsyncStateError: React.FC<AsyncStateBaseProps> = ({
  title = 'Something went wrong',
  description = 'We were unable to load this section. Please try again.',
  icon,
  actionLabel = 'Retry',
  onAction,
  compact = false,
  actionVariant = 'filled',
  className,
  children,
  ...props
}) => (
  <div
    className={cn(containerClasses, compact && 'p-6', 'bg-error-container text-on-error-container', className)}
    {...props}
  >
    {icon}
    <div className="md3-title-large">{title}</div>
    <p className="md3-body-medium max-w-lg">{description}</p>
    {children}
    {onAction && (
      <Button variant={actionVariant} onClick={onAction} fullWidth={compact}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export const AsyncStateLoading: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn(containerClasses, 'bg-surface-container text-on-surface-variant/80', className)} {...props}>
    <div className="flex items-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <span className="md3-body-medium">Loading data…</span>
    </div>
    {children}
  </div>
);
