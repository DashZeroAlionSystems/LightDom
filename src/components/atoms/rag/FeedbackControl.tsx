import { cn } from '@/lib/utils';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';
import type { HTMLAttributes } from 'react';

export type FeedbackValue = 'positive' | 'negative' | null;

export interface FeedbackControlProps extends HTMLAttributes<HTMLDivElement> {
  /** Initial feedback value */
  value?: FeedbackValue;
  /** Callback when feedback changes */
  onChange?: (value: FeedbackValue) => void;
  /** Size of the controls */
  size?: 'sm' | 'md' | 'lg';
  /** Show labels on buttons */
  showLabels?: boolean;
  /** Disable controls */
  disabled?: boolean;
}

export const FeedbackControl = ({
  value: initialValue,
  onChange,
  size = 'md',
  showLabels = false,
  disabled = false,
  className,
  ...props
}: FeedbackControlProps) => {
  const [value, setValue] = useState<FeedbackValue>(initialValue || null);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base',
  };

  const handleFeedback = (newValue: 'positive' | 'negative') => {
    if (disabled) return;
    
    // Toggle off if clicking the same value
    const finalValue = value === newValue ? null : newValue;
    setValue(finalValue);
    onChange?.(finalValue);
  };

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="group"
      aria-label="Provide feedback"
      {...props}
    >
      <button
        onClick={() => handleFeedback('positive')}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg transition-all duration-200',
          'hover:bg-surface-container-highest',
          value === 'positive'
            ? 'text-success bg-success/10'
            : 'text-on-surface-variant hover:text-on-surface',
          disabled && 'opacity-50 cursor-not-allowed',
          buttonSizeClasses[size]
        )}
        title="Good response"
        aria-label="Good response"
        aria-pressed={value === 'positive'}
      >
        <ThumbsUp
          className={cn(
            sizeClasses[size],
            value === 'positive' && 'fill-current'
          )}
        />
        {showLabels && <span className="font-medium">Good</span>}
      </button>

      <button
        onClick={() => handleFeedback('negative')}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg transition-all duration-200',
          'hover:bg-surface-container-highest',
          value === 'negative'
            ? 'text-error bg-error/10'
            : 'text-on-surface-variant hover:text-on-surface',
          disabled && 'opacity-50 cursor-not-allowed',
          buttonSizeClasses[size]
        )}
        title="Bad response"
        aria-label="Bad response"
        aria-pressed={value === 'negative'}
      >
        <ThumbsDown
          className={cn(
            sizeClasses[size],
            value === 'negative' && 'fill-current'
          )}
        />
        {showLabels && <span className="font-medium">Bad</span>}
      </button>
    </div>
  );
};

FeedbackControl.displayName = 'FeedbackControl';
