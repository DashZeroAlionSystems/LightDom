import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown, Check } from 'lucide-react';
import React, { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { Typography } from '../atoms/Typography';
import { Icon } from '../atoms/Icon';

const selectTriggerVariants = cva(
  'flex items-center justify-between gap-2 w-full rounded-lg border transition-all duration-200 cursor-pointer',
  {
    variants: {
      size: {
        sm: 'h-8 px-2 text-sm',
        md: 'h-10 px-3 text-base',
        lg: 'h-12 px-4 text-lg',
      },
      variant: {
        default:
          'bg-background border-input hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20',
        filled:
          'bg-muted border-transparent hover:bg-muted/80 focus:border-primary focus:ring-2 focus:ring-primary/20',
        outline:
          'bg-transparent border-gray-300 dark:border-gray-700 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof selectTriggerVariants> {
  /** Select options */
  options: SelectOption[];
  /** Current value */
  value?: string;
  /** Default value for uncontrolled mode */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      value,
      defaultValue,
      placeholder = 'Select an option',
      disabled,
      error,
      onChange,
      label,
      helperText,
      errorMessage,
      size = 'md',
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedValue = value !== undefined ? value : internalValue;
    const selectedOption = options.find((opt) => opt.value === selectedValue);

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on escape
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
      }
    }, [isOpen]);

    const handleSelect = useCallback(
      (option: SelectOption) => {
        if (option.disabled) return;

        if (value === undefined) {
          setInternalValue(option.value);
        }
        onChange?.(option.value);
        setIsOpen(false);
      },
      [value, onChange]
    );

    const toggleOpen = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={toggleOpen}
            disabled={disabled}
            className={cn(
              selectTriggerVariants({ size, variant }),
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              disabled && 'opacity-50 cursor-not-allowed',
              isOpen && 'border-primary ring-2 ring-primary/20'
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <span
              className={cn(
                'flex-1 text-left truncate',
                !selectedOption && 'text-muted-foreground'
              )}
            >
              {selectedOption ? (
                <span className="flex items-center gap-2">
                  {selectedOption.icon}
                  {selectedOption.label}
                </span>
              ) : (
                placeholder
              )}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-muted-foreground transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {isOpen && (
            <div
              className={cn(
                'absolute z-50 w-full mt-1 py-1 rounded-lg border bg-background shadow-lg',
                'max-h-60 overflow-auto'
              )}
              role="listbox"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  disabled={option.disabled}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-left transition-colors',
                    'hover:bg-muted focus:bg-muted focus:outline-none',
                    option.disabled && 'opacity-50 cursor-not-allowed',
                    selectedValue === option.value && 'bg-primary/10 text-primary'
                  )}
                  role="option"
                  aria-selected={selectedValue === option.value}
                >
                  {option.icon}
                  <span className="flex-1 truncate">{option.label}</span>
                  {selectedValue === option.value && (
                    <Icon icon={Check} size="sm" color="primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        {(helperText || errorMessage) && (
          <Typography
            variant="caption"
            color={errorMessage ? 'error' : 'muted'}
            className="mt-1.5"
          >
            {errorMessage || helperText}
          </Typography>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
