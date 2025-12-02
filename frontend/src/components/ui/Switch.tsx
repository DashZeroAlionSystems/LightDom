/**
 * Switch Component
 * Material Design 3 compliant toggle switch component
 */

import React from 'react';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label for the switch */
  label?: string;
  /** Helper text displayed below the label */
  helperText?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Label position */
  labelPosition?: 'left' | 'right';
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      label,
      helperText,
      size = 'md',
      labelPosition = 'right',
      className = '',
      checked,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeConfig = {
      sm: {
        track: 'h-5 w-9',
        thumb: 'h-4 w-4',
        translate: checked ? 'translate-x-4' : 'translate-x-0',
      },
      md: {
        track: 'h-6 w-11',
        thumb: 'h-5 w-5',
        translate: checked ? 'translate-x-5' : 'translate-x-0',
      },
      lg: {
        track: 'h-7 w-14',
        thumb: 'h-6 w-6',
        translate: checked ? 'translate-x-7' : 'translate-x-0',
      },
    };

    const config = sizeConfig[size];

    const switchElement = (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`
          ${config.track}
          relative
          inline-flex
          flex-shrink-0
          rounded-full
          transition-colors
          duration-200
          ease-in-out
          focus:outline-none
          focus:ring-2
          focus:ring-primary
          focus:ring-offset-2
          focus:ring-offset-surface
          ${
            checked
              ? 'bg-primary'
              : 'bg-surface-variant border-2 border-outline'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onClick={() => {
          if (!disabled && props.onChange) {
            const event = {
              target: { checked: !checked },
            } as React.ChangeEvent<HTMLInputElement>;
            props.onChange(event);
          }
        }}
      >
        <span
          className={`
            ${config.thumb}
            ${config.translate}
            inline-block
            rounded-full
            bg-on-primary
            shadow-lg
            transform
            transition-transform
            duration-200
            ease-in-out
            ${checked ? '' : 'translate-y-0.5'}
          `}
        />
        {/* Hidden input for form integration */}
        <input
          ref={ref}
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          {...props}
        />
      </button>
    );

    if (!label && !helperText) {
      return <div className={className}>{switchElement}</div>;
    }

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        {labelPosition === 'left' && (
          <div className="flex-1">
            {label && (
              <label
                className={`
                  block
                  text-label-md
                  font-medium
                  text-on-surface
                  ${disabled ? 'opacity-50' : 'cursor-pointer'}
                `}
                onClick={() => {
                  if (!disabled && props.onChange) {
                    const event = {
                      target: { checked: !checked },
                    } as React.ChangeEvent<HTMLInputElement>;
                    props.onChange(event);
                  }
                }}
              >
                {label}
              </label>
            )}
            {helperText && (
              <p className="mt-1 text-label-sm text-on-surface-variant">
                {helperText}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center">{switchElement}</div>

        {labelPosition === 'right' && (
          <div className="flex-1">
            {label && (
              <label
                className={`
                  block
                  text-label-md
                  font-medium
                  text-on-surface
                  ${disabled ? 'opacity-50' : 'cursor-pointer'}
                `}
                onClick={() => {
                  if (!disabled && props.onChange) {
                    const event = {
                      target: { checked: !checked },
                    } as React.ChangeEvent<HTMLInputElement>;
                    props.onChange(event);
                  }
                }}
              >
                {label}
              </label>
            )}
            {helperText && (
              <p className="mt-1 text-label-sm text-on-surface-variant">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = 'Switch';
