import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const progressIndicatorVariants = cva(
  'relative overflow-hidden rounded-full bg-surface-container',
  {
    variants: {
      size: {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
      },
      variant: {
        default: '',
        success: '',
        warning: '',
        error: '',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const progressBarVariants = cva(
  'h-full transition-all duration-500 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error',
      },
      animated: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      animated: false,
    },
  }
);

export interface ProgressIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressIndicatorVariants> {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  animated?: boolean;
}

export const ProgressIndicator = React.forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  ({ 
    value, 
    max = 100, 
    size, 
    variant, 
    showLabel = false, 
    animated = false,
    className, 
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    return (
      <div className="w-full space-y-1">
        <div
          ref={ref}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          className={cn(progressIndicatorVariants({ size, variant }), className)}
          {...props}
        >
          <div
            className={cn(progressBarVariants({ variant, animated }))}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span>{value}</span>
            <span>{max}</span>
          </div>
        )}
      </div>
    );
  }
);

ProgressIndicator.displayName = 'ProgressIndicator';

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  strokeWidth?: number;
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ value, size = 'md', strokeWidth = 4, showValue = true, variant = 'default', className, ...props }, ref) => {
    const percentage = Math.min(Math.max(value, 0), 100);
    
    const sizes = {
      sm: 40,
      md: 60,
      lg: 80,
    };
    
    const dimension = sizes[size];
    const radius = (dimension - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    const colors = {
      default: 'stroke-primary',
      success: 'stroke-success',
      warning: 'stroke-warning',
      error: 'stroke-error',
    };

    return (
      <div
        ref={ref}
        className={cn('relative inline-flex items-center justify-center', className)}
        style={{ width: dimension, height: dimension }}
        {...props}
      >
        <svg
          className="transform -rotate-90"
          width={dimension}
          height={dimension}
        >
          <circle
            className="stroke-surface-container-highest"
            strokeWidth={strokeWidth}
            fill="none"
            r={radius}
            cx={dimension / 2}
            cy={dimension / 2}
          />
          <circle
            className={cn(colors[variant], 'transition-all duration-500 ease-out')}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
            r={radius}
            cx={dimension / 2}
            cy={dimension / 2}
          />
        </svg>
        {showValue && (
          <span className="absolute text-sm font-medium text-on-surface">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);

CircularProgress.displayName = 'CircularProgress';

export { ProgressIndicator as default };
