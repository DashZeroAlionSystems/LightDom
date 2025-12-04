import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React, { forwardRef } from 'react';

const toggleTrackVariants = cva(
  'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-11',
        lg: 'h-7 w-14',
      },
      variant: {
        default: 'bg-gray-300 dark:bg-gray-600 focus:ring-primary/30',
        success: 'bg-gray-300 dark:bg-gray-600 focus:ring-green-500/30',
        warning: 'bg-gray-300 dark:bg-gray-600 focus:ring-yellow-500/30',
        error: 'bg-gray-300 dark:bg-gray-600 focus:ring-red-500/30',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const toggleThumbVariants = cva(
  'pointer-events-none inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const checkedTrackColors = {
  default: 'bg-primary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

const thumbTranslate = {
  sm: { off: 'translate-x-0.5', on: 'translate-x-[18px]' },
  md: { off: 'translate-x-0.5', on: 'translate-x-[22px]' },
  lg: { off: 'translate-x-0.5', on: 'translate-x-[30px]' },
};

export interface ToggleProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof toggleTrackVariants> {
  /** Label text */
  label?: string;
  /** Description/helper text */
  description?: string;
  /** Label position */
  labelPosition?: 'left' | 'right';
  /** Show on/off text in track */
  showState?: boolean;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      size = 'md',
      variant = 'default',
      label,
      description,
      labelPosition = 'right',
      showState,
      checked,
      disabled,
      className,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const [isChecked, setIsChecked] = React.useState(checked ?? false);

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (checked === undefined) {
        setIsChecked(e.target.checked);
      }
      onChange?.(e);
    };

    const LabelContent = () =>
      (label || description) && (
        <div className="flex flex-col">
          {label && (
            <span
              className={cn(
                'text-sm font-medium',
                disabled && 'opacity-50',
                'text-foreground'
              )}
            >
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      );

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'inline-flex items-center gap-3 cursor-pointer',
          disabled && 'cursor-not-allowed',
          className
        )}
      >
        {labelPosition === 'left' && <LabelContent />}
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={isChecked}
            disabled={disabled}
            onChange={handleChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              toggleTrackVariants({ size, variant }),
              isChecked && checkedTrackColors[variant || 'default']
            )}
          >
            {showState && (
              <span className="flex items-center justify-between px-1 text-[10px] font-medium text-white select-none h-full">
                <span className={cn('opacity-0', isChecked && 'opacity-100')}>
                  ON
                </span>
                <span className={cn('opacity-0', !isChecked && 'opacity-100')}>
                  OFF
                </span>
              </span>
            )}
          </div>
          <span
            className={cn(
              'absolute top-0.5 left-0',
              toggleThumbVariants({ size }),
              isChecked
                ? thumbTranslate[size || 'md'].on
                : thumbTranslate[size || 'md'].off
            )}
          />
        </div>
        {labelPosition === 'right' && <LabelContent />}
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';
