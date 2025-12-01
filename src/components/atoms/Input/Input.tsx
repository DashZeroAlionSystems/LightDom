import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import type { InputProps } from './Input.types';

/**
 * Input Component
 *
 * Accessible form input with Material Design 3 styling
 * Supports validation, icons, and various states
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'outlined',
      size = 'md',
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn('input-wrapper', fullWidth && 'w-full', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1.5',
              error ? 'text-error' : 'text-foreground/90',
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}
        <div className='relative'>
          {leftIcon && (
            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50'>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full rounded-lg transition-all duration-200',
              'focus:outline-none focus:ring-2',
              // Variant styles
              variant === 'outlined' && [
                'border-2 bg-background',
                error
                  ? 'border-error focus:ring-error/20'
                  : 'border-border focus:border-primary focus:ring-primary/20',
              ],
              variant === 'filled' && [
                'border-0 bg-surface',
                error
                  ? 'ring-1 ring-error focus:ring-2 focus:ring-error'
                  : 'focus:ring-2 focus:ring-primary',
              ],
              // Size styles
              size === 'sm' && 'px-3 py-1.5 text-sm',
              size === 'md' && 'px-4 py-2.5 text-base',
              size === 'lg' && 'px-5 py-3 text-lg',
              // Icon padding
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              // Disabled state
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className='absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50'>
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p className={cn('mt-1.5 text-sm', error ? 'text-error' : 'text-foreground/60')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
