/**
 * Select Component - Material Design 3
 * Accessible select dropdown with Material Design 3 styling
 */

import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { ChevronDown, Check } from 'lucide-react';

const selectVariants = cva(
  [
    'flex items-center justify-between w-full rounded-lg border border-outline',
    'bg-surface-container-highest text-on-surface-container-highest',
    'px-3 py-2 text-body-md',
    'transition-all duration-medium-2 ease-standard',
    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
    'hover:border-on-surface/50',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-outline'
  ]
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLButtonElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  /**
   * Array of options to display
   */
  options: SelectOption[];
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;
  /**
   * Whether the select is in an error state
   */
  error?: boolean;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({
    className,
    options,
    placeholder = 'Select an option',
    value,
    onChange,
    disabled,
    error,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<SelectOption | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);

    // Find selected option
    useEffect(() => {
      const option = options.find(opt => opt.value === value);
      setSelectedOption(option || null);
    }, [value, options]);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node) &&
          listboxRef.current &&
          !listboxRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsOpen(!isOpen);
      } else if (event.key === 'Escape') {
        setIsOpen(false);
      } else if (event.key === 'ArrowDown' && !isOpen) {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    const handleOptionClick = (option: SelectOption) => {
      if (option.disabled) return;

      setSelectedOption(option);
      setIsOpen(false);

      // Create synthetic event for onChange
      const syntheticEvent = {
        target: { value: option.value, name: props.name }
      } as React.ChangeEvent<HTMLSelectElement>;

      onChange?.(syntheticEvent);
    };

    const handleOptionKeyDown = (event: React.KeyboardEvent, option: SelectOption) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleOptionClick(option);
      }
    };

    return (
      <div className="relative">
        <button
          ref={ref || buttonRef}
          type="button"
          className={cn(
            selectVariants({ className }),
            error && 'border-error focus:border-error focus:ring-error',
            isOpen && 'ring-2 ring-primary border-primary'
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          {...props}
        >
          <span className={cn(
            'truncate',
            !selectedOption && 'text-on-surface-variant'
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              'w-5 h-5 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <ul
            ref={listboxRef}
            className={cn(
              'absolute z-50 w-full mt-1',
              'bg-surface-container-highest border border-outline rounded-lg',
              'shadow-level-3 max-h-60 overflow-auto',
              'py-1'
            )}
            role="listbox"
            aria-label="Options"
          >
            {options.map((option, index) => (
              <li key={option.value}>
                <button
                  type="button"
                  className={cn(
                    'w-full px-3 py-2 text-left text-body-md',
                    'flex items-center justify-between',
                    'hover:bg-on-surface/8 focus:bg-on-surface/8',
                    'focus:outline-none transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    selectedOption?.value === option.value && 'bg-primary/12 text-primary'
                  )}
                  onClick={() => handleOptionClick(option)}
                  onKeyDown={(e) => handleOptionKeyDown(e, option)}
                  disabled={option.disabled}
                  role="option"
                  aria-selected={selectedOption?.value === option.value}
                >
                  <span>{option.label}</span>
                  {selectedOption?.value === option.value && (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select, selectVariants };
export type { SelectProps, SelectOption };


