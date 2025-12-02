import { cn } from '@/lib/utils';
import React, { forwardRef } from 'react';
import { Typography } from '../atoms/Typography';
import { Input } from '../atoms/Input';

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Label text */
  label?: string;
  /** Label position */
  labelPosition?: 'top' | 'left' | 'inline';
  /** Helper text below the input */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Is the field required */
  required?: boolean;
  /** Disable the entire form group */
  disabled?: boolean;
  /** Input element or custom children */
  children: React.ReactNode;
  /** ID for connecting label to input */
  htmlFor?: string;
}

export const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  (
    {
      label,
      labelPosition = 'top',
      helperText,
      error,
      required,
      disabled,
      children,
      htmlFor,
      className,
      ...props
    },
    ref
  ) => {
    const layoutClasses = {
      top: 'flex flex-col gap-1.5',
      left: 'flex flex-row items-center gap-3',
      inline: 'flex flex-row items-center gap-2',
    };

    return (
      <div
        ref={ref}
        className={cn(
          layoutClasses[labelPosition],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {label && (
          <label
            htmlFor={htmlFor}
            className={cn(
              'text-sm font-medium text-foreground',
              labelPosition === 'left' && 'w-32 shrink-0',
              labelPosition === 'inline' && 'whitespace-nowrap'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className={cn('flex-1', labelPosition === 'top' && 'w-full')}>
          {children}
          {(helperText || error) && (
            <Typography
              variant="caption"
              color={error ? 'error' : 'muted'}
              className="mt-1.5"
            >
              {error || helperText}
            </Typography>
          )}
        </div>
      </div>
    );
  }
);

FormGroup.displayName = 'FormGroup';
