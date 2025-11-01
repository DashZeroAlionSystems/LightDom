/**
 * Radio Component
 * Material Design 3 compliant radio button component
 */

import React from 'react';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label for the radio button */
  label?: string;
  /** Helper text displayed below the label */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, helperText, error, size = 'md', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    const labelSizeClasses = {
      sm: 'text-label-sm',
      md: 'text-label-md',
      lg: 'text-label-lg',
    };

    return (
      <div className={`flex items-start gap-2 ${className}`}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="radio"
            className={`
              ${sizeClasses[size]}
              rounded-full
              border-2
              border-outline
              text-primary
              focus:ring-2
              focus:ring-primary
              focus:ring-offset-2
              focus:ring-offset-surface
              disabled:opacity-50
              disabled:cursor-not-allowed
              cursor-pointer
              transition-colors
              ${error ? 'border-error' : ''}
            `}
            {...props}
          />
        </div>
        {(label || helperText || error) && (
          <div className="flex-1">
            {label && (
              <label
                className={`
                  ${labelSizeClasses[size]}
                  block
                  font-medium
                  ${error ? 'text-error' : 'text-on-surface'}
                  ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                onClick={() => {
                  if (!props.disabled && props.id) {
                    document.getElementById(props.id)?.click();
                  }
                }}
              >
                {label}
              </label>
            )}
            {helperText && !error && (
              <p className="mt-1 text-label-sm text-on-surface-variant">{helperText}</p>
            )}
            {error && (
              <p className="mt-1 text-label-sm text-error">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

/**
 * Radio Group Component
 * Groups multiple radio buttons together
 */
export interface RadioGroupProps {
  /** Radio options */
  options: Array<{
    value: string;
    label: string;
    helperText?: string;
    disabled?: boolean;
  }>;
  /** Currently selected value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Group name */
  name: string;
  /** Error message for the group */
  error?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Group label */
  label?: string;
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  value,
  onChange,
  name,
  error,
  size = 'md',
  label,
  direction = 'vertical',
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-label-lg font-medium text-on-surface mb-3">
          {label}
        </label>
      )}
      <div
        className={`
          flex
          ${direction === 'vertical' ? 'flex-col gap-3' : 'flex-row flex-wrap gap-6'}
        `}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            label={option.label}
            helperText={option.helperText}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={option.disabled}
            size={size}
            error={value === option.value ? error : undefined}
          />
        ))}
      </div>
      {error && !options.some((opt) => opt.value === value) && (
        <p className="mt-2 text-label-sm text-error">{error}</p>
      )}
    </div>
  );
};
