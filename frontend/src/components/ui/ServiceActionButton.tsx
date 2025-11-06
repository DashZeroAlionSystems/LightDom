import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Circle } from 'lucide-react';

import { cn } from '../../lib/utils';

export type ServiceActionStatus = 'idle' | 'running' | 'success' | 'error';

export interface ServiceActionButtonProps {
  /** Unique id for React keying */
  id?: string;
  /** Primary label shown at the top */
  label: string;
  /** Optional short description rendered beneath the label */
  description?: string;
  /** Icon rendered inside the circular badge */
  icon?: React.ReactNode;
  /** Async action that will be executed when the button is pressed */
  onAction: () => Promise<void> | void;
  /** Disable user interaction */
  disabled?: boolean;
  /** Visual emphasis variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Automatically reset status state back to idle after X milliseconds */
  autoResetMs?: number;
  /** Optional external status control */
  status?: ServiceActionStatus;
  /** Called whenever the internal status changes */
  onStatusChange?: (status: ServiceActionStatus) => void;
  /** Additional class names */
  className?: string;
  /** Optional footer slot (e.g. keyboard hints) */
  footer?: React.ReactNode;
}

interface StatusMeta {
  label: string;
  tone: string;
  icon: React.ReactNode;
}

const STATUS_META: Record<ServiceActionStatus, StatusMeta> = {
  idle: {
    label: 'Ready',
    tone: 'text-muted-foreground',
    icon: <Circle className="h-4 w-4" />,
  },
  running: {
    label: 'Running',
    tone: 'text-primary',
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
  },
  success: {
    label: 'Completed',
    tone: 'text-emerald-500',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  error: {
    label: 'Failed',
    tone: 'text-destructive',
    icon: <AlertCircle className="h-4 w-4" />,
  },
};

const VARIANT_STYLES: Record<NonNullable<ServiceActionButtonProps['variant']>, string> = {
  primary: 'border-primary/30 bg-primary/5 hover:border-primary/60 hover:bg-primary/10',
  secondary: 'border-border bg-card hover:border-primary/40 hover:bg-primary/5',
  danger: 'border-destructive/40 bg-destructive/5 hover:border-destructive hover:bg-destructive/10',
};

/**
 * Interactive action button styled as a dashboard tile. Designed for triggering
 * service actions (crawler start/stop, training jobs, etc.) while providing
 * built-in async feedback and status indicators.
 */
export const ServiceActionButton: React.FC<ServiceActionButtonProps> = ({
  id,
  label,
  description,
  icon,
  onAction,
  disabled,
  variant = 'primary',
  autoResetMs = 2500,
  status: controlledStatus,
  onStatusChange,
  className,
  footer,
}) => {
  const [internalStatus, setInternalStatus] = useState<ServiceActionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const status: ServiceActionStatus = controlledStatus ?? internalStatus;

  useEffect(() => {
    if (controlledStatus) {
      setInternalStatus(controlledStatus);
    }
  }, [controlledStatus]);

  const updateStatus = useCallback(
    (nextStatus: ServiceActionStatus, error?: string | null) => {
      if (!controlledStatus) {
        setInternalStatus(nextStatus);
      }
      setErrorMessage(error ?? null);
      onStatusChange?.(nextStatus);
    },
    [controlledStatus, onStatusChange],
  );

  const resetTimer = useMemo(() => {
    if (!autoResetMs) return null;
    return status === 'success' || status === 'error'
      ? window.setTimeout(() => updateStatus('idle'), autoResetMs)
      : null;
  }, [status, autoResetMs, updateStatus]);

  useEffect(() => {
    return () => {
      if (resetTimer) {
        window.clearTimeout(resetTimer);
      }
    };
  }, [resetTimer]);

  const handleAction = useCallback(async () => {
    if (disabled || status === 'running') {
      return;
    }

    try {
      updateStatus('running');
      await Promise.resolve(onAction?.());
      updateStatus('success');
    } catch (error: any) {
      const message = error?.message ?? 'Action failed';
      updateStatus('error', message);
    }
  }, [disabled, onAction, status, updateStatus]);

  const statusMeta = STATUS_META[status];

  return (
    <button
      id={id}
      type="button"
      onClick={handleAction}
      disabled={disabled || status === 'running'}
      className={cn(
        'group relative flex w-full flex-col gap-3 rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60',
        VARIANT_STYLES[variant],
        status === 'running' && 'ring-2 ring-primary/40',
        status === 'success' && 'border-emerald-400/50',
        status === 'error' && 'border-destructive',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/60 text-primary shadow-sm">
              {icon}
            </span>
          )}
          <div>
            <div className="text-sm font-semibold tracking-wide text-foreground">{label}</div>
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        <div className={cn('flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', statusMeta.tone)}>
          {statusMeta.icon}
          <span>{statusMeta.label}</span>
        </div>
      </div>

      {errorMessage && status === 'error' && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Click to execute</span>
        {footer}
      </div>

      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-primary/0 transition group-hover:bg-primary/5 group-active:bg-primary/10" />
    </button>
  );
};

ServiceActionButton.displayName = 'ServiceActionButton';
