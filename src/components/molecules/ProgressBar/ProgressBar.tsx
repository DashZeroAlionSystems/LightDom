import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Typography } from '../../atoms/Typography';

const progressBarStyles = cva('relative overflow-hidden rounded-full bg-secondary', {
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3',
      xl: 'h-4',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const progressFillStyles = cva(
  'h-full rounded-full transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
      },
      animated: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      animated: false,
    },
  }
);

export interface ProgressBarProps extends VariantProps<typeof progressBarStyles> {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gradient';
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  label,
  size,
  variant,
  animated,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getVariantByValue = (): typeof variant => {
    if (variant) return variant;
    if (percentage >= 100) return 'success';
    if (percentage >= 75) return 'info';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  const displayLabel = label || `${Math.round(percentage)}%`;

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between mb-2">
          <Typography variant="caption" className="font-medium">
            {displayLabel}
          </Typography>
        </div>
      )}
      <div className={progressBarStyles({ size })}>
        <div
          className={progressFillStyles({ variant: getVariantByValue(), animated })}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
};
