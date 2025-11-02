/**
 * Input Component - Material Design 3
 * Accessible form input with validation support and Material Design styling
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  // Base styles - Material Design 3 text field foundation
  [
    'flex w-full rounded-md transition-all duration-medium-2 ease-standard',
    'text-body-lg text-on-surface placeholder:text-on-surface-variant',
    'focus:outline-none focus-visible:outline-none',
    'disabled:cursor-not-allowed disabled:opacity-50'
  ],
  {
    variants: {
      variant: {
        // Outlined - Default Material Design 3 text field
        outlined: [
          'border border-outline bg-transparent px-4 py-3',
          'hover:border-outline-variant',
          'focus:border-primary focus:border-2',
          'focus:px-[15px] focus:py-[11px]' // Compensate for thicker border
        ],
        // Filled - Alternate style with background
        filled: [
          'border-0 border-b border-outline bg-surface-container-highest px-4 pt-6 pb-2',
          'rounded-t-md rounded-b-none',
          'hover:border-on-surface',
          'focus:border-primary focus:border-b-2',
          'focus:pb-[7px]' // Compensate for thicker border
        ]
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-12 text-body-lg',
        lg: 'h-14 px-4 text-body-lg'
      },
      state: {
        default: '',
        error: 'border-error focus:border-error',
        success: 'border-success focus:border-success', 
        disabled: 'opacity-50 cursor-not-allowed'
      }
    },
    defaultVariants: {
      variant: 'outlined',
      size: 'md',
      state: 'default'
    }
  }
);

const labelVariants = cva(
  [
    'absolute left-4 transition-all duration-medium-2 ease-standard',
    'text-on-surface-variant pointer-events-none'
  ],
  {
    variants: {
      variant: {
        outlined: [
          'top-1/2 -translate-y-1/2 bg-surface px-1',
          'peer-focus:top-0 peer-focus:text-xs peer-focus:text-primary',
          'peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:text-xs'
        ],
        filled: [
          'top-6 text-body-lg',
          'peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary',
          'peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs'
        ]
      }
    },
    defaultVariants: {
      variant: 'outlined'
    }
  }
);

export interface InputProps 
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Label text for the input
   */
  label?: string;
  /**
   * Helper text displayed below the input
   */
  helperText?: string;
  /**
   * Error message - overrides helperText and applies error styling
   */
  error?: string;
  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display on the right side
   */
  rightIcon?: React.ReactNode;
  /**
   * Whether the input takes full width
   */
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    state,
    label,
    helperText,
    error,
    leftIcon,
    rightIcon,
    fullWidth = true,
    disabled,
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const finalState = error ? 'error' : disabled ? 'disabled' : state;
    const hasLabel = Boolean(label);
    const hasHelperText = Boolean(helperText || error);

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              inputVariants({ variant, size, state: finalState }),
              hasLabel && 'peer',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            placeholder={hasLabel ? ' ' : props.placeholder} // Space for floating label
            disabled={disabled}
            {...props}
          />

          {/* Floating Label */}
          {hasLabel && (
            <label
              htmlFor={inputId}
              className={cn(labelVariants({ variant }))}
            >
              {label}
            </label>
          )}

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Helper Text / Error Message */}
        {hasHelperText && (
          <div className={cn(
            'flex items-start gap-1 text-body-sm px-4',
            error ? 'text-error' : 'text-on-surface-variant'
          )}>
            {error && (
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <span>{error || helperText}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };
export type { InputProps };