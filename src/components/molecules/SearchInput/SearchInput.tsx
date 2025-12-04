import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Search, X } from 'lucide-react';
import React, { forwardRef, useState, useCallback } from 'react';
import { Icon, IconButton } from '../atoms/Icon';
import { Spinner } from '../atoms/Spinner';

const searchInputVariants = cva(
  'flex items-center gap-2 w-full rounded-lg border transition-all duration-200',
  {
    variants: {
      size: {
        sm: 'h-8 px-2 text-sm',
        md: 'h-10 px-3 text-base',
        lg: 'h-12 px-4 text-lg',
      },
      variant: {
        default:
          'bg-background border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
        filled:
          'bg-muted border-transparent focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
        outline:
          'bg-transparent border-gray-300 dark:border-gray-700 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof searchInputVariants> {
  /** Callback when search is submitted */
  onSearch?: (value: string) => void;
  /** Callback when input is cleared */
  onClear?: () => void;
  /** Show loading indicator */
  loading?: boolean;
  /** Custom icon */
  icon?: React.ReactNode;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      size = 'md',
      variant = 'default',
      onSearch,
      onClear,
      loading,
      icon,
      value,
      onChange,
      className,
      placeholder = 'Search...',
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState('');
    const inputValue = value !== undefined ? value : internalValue;
    const hasValue = String(inputValue).length > 0;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (value === undefined) {
          setInternalValue(e.target.value);
        }
        onChange?.(e);
      },
      [value, onChange]
    );

    const handleClear = useCallback(() => {
      if (value === undefined) {
        setInternalValue('');
      }
      onClear?.();
    }, [value, onClear]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onSearch) {
          onSearch(String(inputValue));
        }
      },
      [inputValue, onSearch]
    );

    const iconSizes = {
      sm: 'sm' as const,
      md: 'md' as const,
      lg: 'lg' as const,
    };

    return (
      <div className={cn(searchInputVariants({ size, variant }), className)}>
        {loading ? (
          <Spinner size={iconSizes[size || 'md']} />
        ) : (
          icon || <Icon icon={Search} size={iconSizes[size || 'md']} color="muted" />
        )}
        <input
          ref={ref}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          {...props}
        />
        {hasValue && (
          <IconButton
            icon={X}
            label="Clear search"
            size="sm"
            variant="ghost"
            onClick={handleClear}
            className="h-6 w-6"
          />
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
