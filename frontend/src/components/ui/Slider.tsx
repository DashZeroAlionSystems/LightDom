/**
 * Slider Component
 * Material Design 3 compliant range slider component
 */

import React, { useState, useRef, useEffect } from 'react';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Label for the slider */
  label?: string;
  /** Helper text displayed below the label */
  helperText?: string;
  /** Show value above the slider */
  showValue?: boolean;
  /** Format value for display */
  formatValue?: (value: number) => string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Marks to display */
  marks?: Array<{ value: number; label?: string }>;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      label,
      helperText,
      showValue = false,
      formatValue = (v) => String(v),
      size = 'md',
      marks,
      min = 0,
      max = 100,
      step = 1,
      value = 50,
      className = '',
      disabled,
      onChange,
      ...props
    },
    ref
  ) => {
    const [localValue, setLocalValue] = useState(Number(value));
    const [isFocused, setIsFocused] = useState(false);
    const sliderRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setLocalValue(Number(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      setLocalValue(newValue);
      onChange?.(e);
    };

    const percentage = ((localValue - Number(min)) / (Number(max) - Number(min))) * 100;

    const sizeConfig = {
      sm: { track: 'h-1', thumb: 'h-3 w-3' },
      md: { track: 'h-1.5', thumb: 'h-4 w-4' },
      lg: { track: 'h-2', thumb: 'h-5 w-5' },
    };

    const config = sizeConfig[size];

    return (
      <div className={className}>
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label className="text-label-md font-medium text-on-surface">
              {label}
            </label>
            {showValue && (
              <span className="text-label-md font-medium text-primary">
                {formatValue(localValue)}
              </span>
            )}
          </div>
        )}

        <div className="relative pt-6 pb-2">
          {/* Value indicator (tooltip) */}
          {isFocused && (
            <div
              className="absolute top-0 transform -translate-x-1/2 -translate-y-full mb-2"
              style={{ left: `${percentage}%` }}
            >
              <div className="bg-primary text-on-primary px-2 py-1 rounded text-label-sm font-medium whitespace-nowrap">
                {formatValue(localValue)}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary" />
              </div>
            </div>
          )}

          {/* Track */}
          <div className={`relative ${config.track} bg-surface-variant rounded-full`}>
            {/* Filled track */}
            <div
              className={`absolute ${config.track} bg-primary rounded-full transition-all`}
              style={{ width: `${percentage}%` }}
            />

            {/* Marks */}
            {marks && marks.map((mark) => {
              const markPercentage =
                ((mark.value - Number(min)) / (Number(max) - Number(min))) * 100;
              return (
                <div
                  key={mark.value}
                  className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${markPercentage}%` }}
                >
                  <div className="w-1 h-1 bg-on-surface-variant rounded-full" />
                </div>
              );
            })}
          </div>

          {/* Input range */}
          <input
            ref={ref || sliderRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={localValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            className={`
              absolute
              inset-0
              w-full
              h-full
              opacity-0
              cursor-pointer
              ${disabled ? 'cursor-not-allowed' : ''}
            `}
            {...props}
          />

          {/* Thumb */}
          <div
            className={`
              absolute
              top-1/2
              ${config.thumb}
              bg-primary
              rounded-full
              shadow-lg
              transform
              -translate-y-1/2
              -translate-x-1/2
              pointer-events-none
              transition-all
              ${isFocused ? 'ring-4 ring-primary/20' : ''}
              ${disabled ? 'opacity-50' : ''}
            `}
            style={{ left: `${percentage}%` }}
          />
        </div>

        {/* Marks labels */}
        {marks && (
          <div className="relative mt-2">
            {marks.map((mark) => {
              const markPercentage =
                ((mark.value - Number(min)) / (Number(max) - Number(min))) * 100;
              return (
                <div
                  key={mark.value}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${markPercentage}%` }}
                >
                  {mark.label && (
                    <span className="text-label-sm text-on-surface-variant whitespace-nowrap">
                      {mark.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {helperText && (
          <p className="mt-2 text-label-sm text-on-surface-variant">{helperText}</p>
        )}
      </div>
    );
  }
);

Slider.displayName = 'Slider';
