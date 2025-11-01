/**
 * FormField Component - Material Design 3
 * Compound component for form inputs with label, helper text, and error handling
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const formFieldVariants = cva(
  'space-y-2',
  {
    variants: {
      layout: {
        vertical: 'flex flex-col',
        horizontal: 'flex items-center gap-4'
      },
      required: {
        true: ''
      }
    },
    defaultVariants: {
      layout: 'vertical'
    }
  }
);

export interface FormFieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formFieldVariants> {
  /**
   * The label text for the form field
   */
  label?: string;
  /**
   * Helper text displayed below the input
   */
  helperText?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({
    className,
    layout,
    label,
    helperText,
    error,
    required,
    disabled,
    children,
    ...props
  }, ref) => {
    const hasError = !!error;
    const showHelperText = helperText && !hasError;

    return (
      <div
        ref={ref}
        className={cn(formFieldVariants({ layout, required, className }))}
        {...props}
      >
        {/* Label */}
        {label && (
          <label className={cn(
            'text-body-lg font-medium text-on-surface',
            disabled && 'text-on-surface/38',
            required && "after:content-['*'] after:text-error after:ml-1"
          )}>
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {React.cloneElement(children as React.ReactElement, {
            'aria-describedby': showHelperText ? 'helper-text' : hasError ? 'error-text' : undefined,
            'aria-invalid': hasError,
            disabled,
            className: cn(
              (children as React.ReactElement).props.className,
              hasError && 'border-error focus:border-error focus:ring-error'
            )
          })}
        </div>

        {/* Helper Text or Error */}
        {(showHelperText || hasError) && (
          <div className={cn(
            'text-body-sm',
            hasError ? 'text-error' : 'text-on-surface-variant'
          )}>
            {hasError ? (
              <span id="error-text" className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </span>
            ) : (
              <span id="helper-text">{helperText}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export { FormField, formFieldVariants };
export type { FormFieldProps };
