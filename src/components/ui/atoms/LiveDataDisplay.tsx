/**
 * LiveDataDisplay - Atomic Component
 * Real-time data display components with auto-updating values
 * Implements modern dashboard UX patterns with smooth transitions
 */

import React, { useEffect, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * LiveCounter - Animated counter that smoothly transitions between values
 */
export interface LiveCounterProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  format?: 'number' | 'compact' | 'bytes';
}

export const LiveCounter: React.FC<LiveCounterProps> = ({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  format = 'number',
  className,
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const startTime = Date.now();
    const difference = endValue - startValue;

    const updateValue = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Quadratic ease-in-out function for smooth acceleration and deceleration
      // This provides natural-feeling counter animations that start slow,
      // accelerate in the middle, and slow down at the end
      const eased = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;
      
      const newValue = startValue + (difference * eased);
      setDisplayValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    requestAnimationFrame(updateValue);
  }, [value, duration]);

  const formatValue = (val: number): string => {
    switch (format) {
      case 'compact':
        // Use Intl.NumberFormat for better locale-aware compact notation
        return new Intl.NumberFormat('en-US', {
          notation: 'compact',
          compactDisplay: 'short',
          maximumFractionDigits: decimals,
        }).format(val);
      
      case 'bytes':
        if (val === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        // Ensure index doesn't exceed array bounds
        const i = Math.min(Math.floor(Math.log(val) / Math.log(k)), sizes.length - 1);
        return (val / Math.pow(k, i)).toFixed(decimals) + ' ' + sizes[i];
      
      default:
        return val.toFixed(decimals);
    }
  };

  return (
    <span className={cn('tabular-nums', className)} {...props}>
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  );
};

/**
 * LiveProgressBar - Animated progress bar with real-time updates
 */
const progressBarVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-gray-200',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3',
      },
      status: {
        default: '',
        success: 'bg-green-100',
        warning: 'bg-yellow-100',
        error: 'bg-red-100',
      },
    },
    defaultVariants: {
      size: 'md',
      status: 'default',
    },
  }
);

const progressFillVariants = cva(
  'h-full transition-all duration-300 ease-out',
  {
    variants: {
      status: {
        default: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
      },
      animated: {
        true: 'animate-pulse-subtle',
        false: '',
      },
    },
    defaultVariants: {
      status: 'default',
      animated: false,
    },
  }
);

export interface LiveProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressBarVariants> {
  value: number;
  max?: number;
  showLabel?: boolean;
  animated?: boolean;
}

export const LiveProgressBar: React.FC<LiveProgressBarProps> = ({
  value,
  max = 100,
  size,
  status,
  showLabel = false,
  animated = false,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm text-gray-600">
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={cn(progressBarVariants({ size, status }), className)} {...props}>
        <div
          className={cn(progressFillVariants({ status, animated }))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * LiveBadge - Status badge with live update capability
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
        info: 'bg-cyan-100 text-cyan-800',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-base px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface LiveBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  pulse?: boolean;
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({
  variant,
  size,
  icon,
  pulse = false,
  className,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        badgeVariants({ variant, size }),
        pulse && 'animate-pulse',
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

/**
 * LiveTimestamp - Auto-updating relative timestamp
 */
export interface LiveTimestampProps extends React.HTMLAttributes<HTMLSpanElement> {
  timestamp: Date | string | number;
  format?: 'relative' | 'absolute' | 'both';
  updateInterval?: number;
}

export const LiveTimestamp: React.FC<LiveTimestampProps> = ({
  timestamp,
  format = 'relative',
  updateInterval = 1000,
  className,
  ...props
}) => {
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      let relative = '';
      if (days > 0) {
        relative = `${days}d ago`;
      } else if (hours > 0) {
        relative = `${hours}h ago`;
      } else if (minutes > 0) {
        relative = `${minutes}m ago`;
      } else if (seconds > 5) {
        relative = `${seconds}s ago`;
      } else {
        relative = 'just now';
      }

      const absolute = date.toLocaleString();

      switch (format) {
        case 'relative':
          setDisplayTime(relative);
          break;
        case 'absolute':
          setDisplayTime(absolute);
          break;
        case 'both':
          setDisplayTime(`${relative} (${absolute})`);
          break;
      }
    };

    updateTime();
    const interval = setInterval(updateTime, updateInterval);

    return () => clearInterval(interval);
  }, [timestamp, format, updateInterval]);

  return (
    <span className={cn('text-sm text-gray-600', className)} {...props}>
      {displayTime}
    </span>
  );
};
