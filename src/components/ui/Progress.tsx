import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const progressVariants = cva(
  'relative overflow-hidden rounded-full bg-surface',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
        xl: 'h-4',
      },
      variant: {
        default: 'bg-primary',
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error',
        secondary: 'bg-secondary',
        accent: 'bg-accent',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const progressBarVariants = cva(
  'h-full transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error',
        secondary: 'bg-secondary',
        accent: 'bg-accent',
      },
      animated: {
        true: 'animate-pulse',
        false: '',
      },
      striped: {
        true: 'bg-stripes',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      animated: false,
      striped: false,
    },
  }
);

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
  showValue?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'secondary' | 'accent';
  animated?: boolean;
  striped?: boolean;
  fullWidth?: boolean;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      showValue = false,
      label,
      size,
      variant,
      animated,
      striped,
      fullWidth = true,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {(label || showValue) && (
          <div className="flex items-center justify-between text-sm">
            {label && (
              <span className="font-medium text-text">{label}</span>
            )}
            {showValue && (
              <span className="text-text-secondary">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        
        <div
          ref={ref}
          className={cn(progressVariants({ size }), className)}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
          {...props}
        >
          <div
            className={cn(
              progressBarVariants({ variant, animated, striped }),
              'bg-stripes' // Add CSS for stripes if needed
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Circular Progress Component
export interface CircularProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'secondary' | 'accent';
  showValue?: boolean;
  label?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showValue = true,
  label,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: 'stroke-primary',
    success: 'stroke-success',
    warning: 'stroke-warning',
    error: 'stroke-error',
    secondary: 'stroke-secondary',
    accent: 'stroke-accent',
  };

  return (
    <div className={cn('flex flex-col items-center space-y-2', className)} {...props}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-surface"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn('transition-all duration-300 ease-out', variantColors[variant])}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {showValue && (
            <span className="text-lg font-semibold text-text">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
      
      {label && (
        <span className="text-sm text-text-secondary text-center">
          {label}
        </span>
      )}
    </div>
  );
};

// Step Progress Component
export interface StepProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  steps: Array<{
    id: string;
    label: string;
    description?: string;
    completed?: boolean;
    current?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'secondary' | 'accent';
}

const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  orientation = 'horizontal',
  variant = 'default',
  className,
  ...props
}) => {
  const variantColors = {
    default: 'text-primary bg-primary',
    success: 'text-success bg-success',
    warning: 'text-warning bg-warning',
    error: 'text-error bg-error',
    secondary: 'text-secondary bg-secondary',
    accent: 'text-accent bg-accent',
  };

  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'flex-row items-center' : 'flex-col',
        className
      )}
      {...props}
    >
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            'flex items-center',
            orientation === 'horizontal' ? 'flex-row' : 'flex-col'
          )}
        >
          {/* Step circle */}
          <div className="flex items-center">
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200',
                step.completed
                  ? variantColors[variant]
                  : step.current
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-surface text-text-tertiary'
              )}
            >
              {step.completed ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
          </div>

          {/* Step content */}
          <div className={cn('flex-1', orientation === 'horizontal' ? 'ml-3' : 'mt-2 text-center')}>
            <div className="text-sm font-medium text-text">{step.label}</div>
            {step.description && (
              <div className="text-xs text-text-secondary mt-1">{step.description}</div>
            )}
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'flex-1',
                orientation === 'horizontal'
                  ? 'h-0.5 bg-border mx-3'
                  : 'w-0.5 h-8 bg-border mx-auto mt-2'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export { Progress, CircularProgress, StepProgress, progressVariants };