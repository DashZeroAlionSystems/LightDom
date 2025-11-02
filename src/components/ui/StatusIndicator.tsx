import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { 
  PlayCircle, 
  PauseCircle, 
  StopCircle, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Circle
} from 'lucide-react';

const statusIndicatorVariants = cva(
  'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200',
  {
    variants: {
      status: {
        running: 'bg-primary-container/30 text-primary border border-primary/30',
        paused: 'bg-warning-container/30 text-warning border border-warning/30',
        stopped: 'bg-surface-container text-on-surface-variant border border-outline-variant',
        completed: 'bg-success-container/30 text-success border border-success/30',
        error: 'bg-error-container/30 text-error border border-error/30',
        pending: 'bg-surface-container-highest text-on-surface-variant border border-outline',
        idle: 'bg-surface-container text-on-surface-variant/60 border border-outline-variant/60',
      },
      size: {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
      },
      animated: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      status: 'idle',
      size: 'md',
      animated: true,
    },
  }
);

const statusIcons = {
  running: PlayCircle,
  paused: PauseCircle,
  stopped: StopCircle,
  completed: CheckCircle2,
  error: AlertCircle,
  pending: Clock,
  idle: Circle,
};

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusIndicatorVariants> {
  label?: string;
  showIcon?: boolean;
  pulse?: boolean;
}

export const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ status = 'idle', size, animated, label, showIcon = true, pulse = false, className, children, ...props }, ref) => {
    const Icon = status ? statusIcons[status] : Circle;
    const displayLabel = label || children || status?.charAt(0).toUpperCase() + status?.slice(1);

    return (
      <div
        ref={ref}
        className={cn(statusIndicatorVariants({ status, size, animated }), className)}
        {...props}
      >
        {showIcon && (
          <Icon 
            className={cn(
              'h-4 w-4',
              pulse && status === 'running' && 'animate-pulse',
              size === 'sm' && 'h-3 w-3',
              size === 'lg' && 'h-5 w-5'
            )} 
          />
        )}
        {displayLabel && <span>{displayLabel}</span>}
      </div>
    );
  }
);

StatusIndicator.displayName = 'StatusIndicator';

export default StatusIndicator;
