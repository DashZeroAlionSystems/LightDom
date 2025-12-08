import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import type { HTMLAttributes } from 'react';

export interface BusyIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  /** Size variant of the busy indicator */
  size?: 'sm' | 'md' | 'lg';
  /** Display message during processing */
  message?: string;
  /** Type of animation */
  variant?: 'spinner' | 'pulse' | 'dots';
}

export const BusyIndicator = ({
  size = 'md',
  message,
  variant = 'spinner',
  className,
  ...props
}: BusyIndicatorProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  if (variant === 'dots') {
    return (
      <div
        className={cn('flex items-center gap-2', className)}
        role="status"
        aria-label="Processing"
        {...props}
      >
        <div className="flex gap-1">
          <span
            className={cn(
              'rounded-full bg-primary animate-bounce',
              size === 'sm' && 'h-2 w-2',
              size === 'md' && 'h-3 w-3',
              size === 'lg' && 'h-4 w-4'
            )}
            style={{ animationDelay: '0ms' }}
          />
          <span
            className={cn(
              'rounded-full bg-primary animate-bounce',
              size === 'sm' && 'h-2 w-2',
              size === 'md' && 'h-3 w-3',
              size === 'lg' && 'h-4 w-4'
            )}
            style={{ animationDelay: '150ms' }}
          />
          <span
            className={cn(
              'rounded-full bg-primary animate-bounce',
              size === 'sm' && 'h-2 w-2',
              size === 'md' && 'h-3 w-3',
              size === 'lg' && 'h-4 w-4'
            )}
            style={{ animationDelay: '300ms' }}
          />
        </div>
        {message && (
          <span className="text-sm text-on-surface-variant animate-pulse">
            {message}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div
        className={cn('flex items-center gap-2', className)}
        role="status"
        aria-label="Processing"
        {...props}
      >
        <div
          className={cn(
            'rounded-full bg-primary animate-pulse',
            sizeClasses[size]
          )}
        />
        {message && (
          <span className="text-sm text-on-surface-variant">{message}</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="status"
      aria-label="Processing"
      {...props}
    >
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {message && (
        <span className="text-sm text-on-surface-variant">{message}</span>
      )}
    </div>
  );
};

BusyIndicator.displayName = 'BusyIndicator';
