import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React, { forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';

const checkboxVariants = cva(
  'peer relative shrink-0 appearance-none cursor-pointer border-2 rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
      variant: {
        default:
          'border-border bg-background hover:border-primary checked:border-primary checked:bg-primary focus:ring-primary/30',
        success:
          'border-border bg-background hover:border-green-500 checked:border-green-500 checked:bg-green-500 focus:ring-green-500/30',
        error:
          'border-red-300 bg-background hover:border-red-500 checked:border-red-500 checked:bg-red-500 focus:ring-red-500/30',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof checkboxVariants> {
  /** Label text */
  label?: string;
  /** Description/helper text */
  description?: string;
  /** Indeterminate state for partial selection */
  indeterminate?: boolean;
  /** Error message */
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      size = 'md',
      variant,
      label,
      description,
      indeterminate,
      error,
      className,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = !!indeterminate;
      }
    }, [indeterminate]);

    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current!, []);

    const effectiveVariant = error ? 'error' : variant;

    return (
      <div className={cn('flex items-start gap-3', className)}>
        <div className="relative flex items-center justify-center">
          <input
            ref={inputRef}
            type="checkbox"
            id={inputId}
            disabled={disabled}
            className={cn(checkboxVariants({ size, variant: effectiveVariant }))}
            {...props}
          />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-100 transition-opacity">
            {indeterminate ? (
              <Minus className={cn(iconSizes[size || 'md'])} strokeWidth={3} />
            ) : (
              <Check className={cn(iconSizes[size || 'md'])} strokeWidth={3} />
            )}
          </span>
        </div>
        {(label || description || error) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  'text-sm font-medium cursor-pointer',
                  disabled && 'opacity-50 cursor-not-allowed',
                  error ? 'text-red-600' : 'text-foreground'
                )}
              >
                {label}
              </label>
            )}
            {(description || error) && (
              <span
                className={cn(
                  'text-xs mt-0.5',
                  error ? 'text-red-500' : 'text-muted-foreground'
                )}
              >
                {error || description}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
