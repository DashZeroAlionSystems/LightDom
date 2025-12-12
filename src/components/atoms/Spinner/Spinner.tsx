import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    variant: {
      default: 'text-primary',
      secondary: 'text-secondary',
      white: 'text-white',
      muted: 'text-muted-foreground',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
});

export interface SpinnerProps
  extends React.HTMLAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {
  /** Label for accessibility */
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size,
  variant,
  label = 'Loading',
  className,
  ...props
}) => {
  return (
    <svg
      className={cn(spinnerVariants({ size, variant }), className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label={label}
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

Spinner.displayName = 'Spinner';

// Dots Spinner variant
export interface DotsSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  label?: string;
}

export const DotsSpinner: React.FC<DotsSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  label = 'Loading',
  className,
}) => {
  const dotSizes = {
    xs: 'h-1 w-1',
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
  };

  const gapSizes = {
    xs: 'gap-0.5',
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
    xl: 'gap-3',
  };

  const colorClasses = {
    default: 'bg-primary',
    secondary: 'bg-secondary',
    white: 'bg-white',
    muted: 'bg-muted-foreground',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div
      className={cn('flex items-center', gapSizes[size || 'md'], className)}
      role="status"
      aria-label={label}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full animate-bounce',
            dotSizes[size || 'md'],
            colorClasses[variant || 'default']
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.6s',
          }}
        />
      ))}
    </div>
  );
};

DotsSpinner.displayName = 'DotsSpinner';

// Pulse Spinner variant
export const PulseSpinner: React.FC<DotsSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  label = 'Loading',
  className,
}) => {
  const sizes = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    default: 'bg-primary',
    secondary: 'bg-secondary',
    white: 'bg-white',
    muted: 'bg-muted-foreground',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div
      className={cn(
        'relative rounded-full animate-pulse',
        sizes[size || 'md'],
        colorClasses[variant || 'default'],
        'opacity-75',
        className
      )}
      role="status"
      aria-label={label}
    >
      <div
        className={cn(
          'absolute inset-0 rounded-full animate-ping',
          colorClasses[variant || 'default'],
          'opacity-50'
        )}
      />
    </div>
  );
};

PulseSpinner.displayName = 'PulseSpinner';
