import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-solid',
  {
    variants: {
      variant: {
        default: 'border-primary border-t-transparent',
        secondary: 'border-secondary border-t-transparent',
        accent: 'border-accent border-t-transparent',
        success: 'border-success border-t-transparent',
        warning: 'border-warning border-t-transparent',
        error: 'border-error border-t-transparent',
        muted: 'border-text-tertiary border-t-transparent',
      },
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
        '2xl': 'h-16 w-16',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  text?: string;
  centered?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className,
  variant,
  size,
  text,
  centered = false,
  ...props
}) => {
  const spinner = (
    <div
      className={cn(spinnerVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (text) {
    return (
      <div className={cn('flex items-center gap-2', centered && 'justify-center')}>
        {spinner}
        <span className="text-sm text-text-secondary">{text}</span>
      </div>
    );
  }

  if (centered) {
    return (
      <div className="flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Pulse loading animation
const PulseSpinner: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div
        className={cn(
          'rounded-full bg-primary animate-pulse',
          sizeClasses[size]
        )}
        style={{ animationDelay: '0ms' }}
      />
      <div
        className={cn(
          'rounded-full bg-primary animate-pulse',
          sizeClasses[size]
        )}
        style={{ animationDelay: '150ms' }}
      />
      <div
        className={cn(
          'rounded-full bg-primary animate-pulse',
          sizeClasses[size]
        )}
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
};

// Dots loading animation
const DotsSpinner: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-1 w-1',
    md: 'h-2 w-2',
    lg: 'h-3 w-3',
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div
        className={cn(
          'rounded-full bg-primary animate-bounce',
          sizeClasses[size]
        )}
        style={{ animationDelay: '0ms' }}
      />
      <div
        className={cn(
          'rounded-full bg-primary animate-bounce',
          sizeClasses[size]
        )}
        style={{ animationDelay: '150ms' }}
      />
      <div
        className={cn(
          'rounded-full bg-primary animate-bounce',
          sizeClasses[size]
        )}
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
};

// Skeleton loading component
const Skeleton: React.FC<{
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}> = ({ className, width, height, rounded = true }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-surface rounded',
        rounded && 'rounded-lg',
        className
      )}
      style={{
        width: width || '100%',
        height: height || '1rem',
      }}
    />
  );
};

// Loading overlay component
const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  className?: string;
}> = ({ isLoading, children, text = 'Loading...', className }) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={cn('relative', className)}>
      {children}
      <div className="absolute inset-0 bg-overlay-light backdrop-blur-sm flex items-center justify-center z-10">
        <div className="bg-surface-elevated rounded-lg p-6 shadow-lg flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <span className="text-sm text-text-secondary">{text}</span>
        </div>
      </div>
    </div>
  );
};

export { LoadingSpinner, PulseSpinner, DotsSpinner, Skeleton, LoadingOverlay, spinnerVariants };