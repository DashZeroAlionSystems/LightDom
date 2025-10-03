import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const inputVariants = cva(
  'flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'border-border focus:border-primary',
        error: 'border-error focus:border-error focus:ring-error',
        success: 'border-success focus:border-success focus:ring-success',
        warning: 'border-warning focus:border-warning focus:ring-warning',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      fullWidth: true,
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  warning?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      label,
      helperText,
      error,
      success,
      warning,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine variant based on state
    let inputVariant = variant;
    if (error) inputVariant = 'error';
    else if (success) inputVariant = 'success';
    else if (warning) inputVariant = 'warning';

    const hasAddons = leftAddon || rightAddon;
    const hasIcons = leftIcon || rightIcon;

    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {hasAddons ? (
            <div className="flex">
              {leftAddon && (
                <span className="inline-flex items-center px-3 text-sm text-text-tertiary bg-surface border border-r-0 border-border rounded-l-lg">
                  {leftAddon}
                </span>
              )}
              <input
                id={inputId}
                className={cn(
                  inputVariants({ variant: inputVariant, size, fullWidth }),
                  hasAddons && 'rounded-none',
                  leftAddon && 'rounded-l-none',
                  rightAddon && 'rounded-r-none',
                  hasIcons && 'pl-10',
                  rightIcon && 'pr-10',
                  className
                )}
                ref={ref}
                {...props}
              />
              {rightAddon && (
                <span className="inline-flex items-center px-3 text-sm text-text-tertiary bg-surface border border-l-0 border-border rounded-r-lg">
                  {rightAddon}
                </span>
              )}
            </div>
          ) : (
            <div className="relative">
              {leftIcon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-text-tertiary">{leftIcon}</span>
                </div>
              )}
              <input
                id={inputId}
                className={cn(
                  inputVariants({ variant: inputVariant, size, fullWidth }),
                  hasIcons && 'pl-10',
                  rightIcon && 'pr-10',
                  className
                )}
                ref={ref}
                {...props}
              />
              {rightIcon && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-text-tertiary">{rightIcon}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {(helperText || error || success || warning) && (
          <div className="text-sm">
            {error && (
              <p className="text-error flex items-center gap-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </p>
            )}
            {success && (
              <p className="text-success flex items-center gap-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {success}
              </p>
            )}
            {warning && (
              <p className="text-warning flex items-center gap-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                {warning}
              </p>
            )}
            {helperText && !error && !success && !warning && (
              <p className="text-text-secondary">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };