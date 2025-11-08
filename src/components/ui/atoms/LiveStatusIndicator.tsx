/**
 * LiveStatusIndicator - Atomic Component
 * Real-time status indicator with pulsing animation and live data updates
 * Following Material Design 3 principles and IDE-styled UX patterns
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const liveStatusVariants = cva(
  'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
  {
    variants: {
      status: {
        active: 'bg-green-50 text-green-700 border border-green-200',
        idle: 'bg-gray-50 text-gray-600 border border-gray-200',
        warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
        error: 'bg-red-50 text-red-700 border border-red-200',
        processing: 'bg-blue-50 text-blue-700 border border-blue-200',
      },
      size: {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2',
      },
      animate: {
        true: 'animate-pulse-subtle',
        false: '',
      },
    },
    defaultVariants: {
      status: 'idle',
      size: 'md',
      animate: false,
    },
  }
);

const dotVariants = cva(
  'inline-block rounded-full',
  {
    variants: {
      status: {
        active: 'bg-green-500',
        idle: 'bg-gray-400',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
        processing: 'bg-blue-500',
      },
      size: {
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-2.5 h-2.5',
      },
      pulse: {
        true: 'animate-pulse',
        false: '',
      },
    },
    defaultVariants: {
      status: 'idle',
      size: 'md',
      pulse: false,
    },
  }
);

export interface LiveStatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof liveStatusVariants> {
  label: string;
  count?: number;
  showDot?: boolean;
  pulse?: boolean;
}

export const LiveStatusIndicator = React.forwardRef<
  HTMLDivElement,
  LiveStatusIndicatorProps
>(
  (
    {
      className,
      status,
      size,
      animate,
      label,
      count,
      showDot = true,
      pulse = false,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(liveStatusVariants({ status, size, animate, className }))}
        {...props}
      >
        {showDot && (
          <span className={cn(dotVariants({ status, size, pulse }))} />
        )}
        <span>{label}</span>
        {count !== undefined && (
          <span className="ml-1 font-bold">{count}</span>
        )}
      </div>
    );
  }
);

LiveStatusIndicator.displayName = 'LiveStatusIndicator';

/**
 * LiveMetricCard - Shows live updating metrics with trend indicators
 */
export interface LiveMetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number | string | React.ReactNode;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  status?: 'active' | 'idle' | 'warning' | 'error';
  icon?: React.ReactNode;
}

const metricCardVariants = cva(
  'rounded-lg border p-4 transition-all duration-200 hover:shadow-md',
  {
    variants: {
      status: {
        active: 'border-green-200 bg-green-50/50',
        idle: 'border-gray-200 bg-white',
        warning: 'border-yellow-200 bg-yellow-50/50',
        error: 'border-red-200 bg-red-50/50',
      },
    },
    defaultVariants: {
      status: 'idle',
    },
  }
);

export const LiveMetricCard = React.forwardRef<HTMLDivElement, LiveMetricCardProps>(
  (
    {
      className,
      label,
      value,
      unit,
      trend,
      trendValue,
      status = 'idle',
      icon,
      ...props
    },
    ref
  ) => {
    const getTrendColor = () => {
      switch (trend) {
        case 'up':
          return 'text-green-600';
        case 'down':
          return 'text-red-600';
        default:
          return 'text-gray-600';
      }
    };

    const getTrendIcon = () => {
      switch (trend) {
        case 'up':
          return '↑';
        case 'down':
          return '↓';
        default:
          return '→';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(metricCardVariants({ status }), className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {value}
              </span>
              {unit && <span className="text-sm text-gray-600">{unit}</span>}
            </div>
            {trendValue && (
              <div className={cn('text-sm mt-1 flex items-center gap-1', getTrendColor())}>
                <span>{getTrendIcon()}</span>
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="ml-2 text-gray-400">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

LiveMetricCard.displayName = 'LiveMetricCard';

/**
 * ActivityPulse - Minimal animated activity indicator
 */
export interface ActivityPulseProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const activityPulseVariants = cva(
  'rounded-full',
  {
    variants: {
      size: {
        sm: 'w-2 h-2',
        md: 'w-3 h-3',
        lg: 'w-4 h-4',
      },
      color: {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        red: 'bg-red-500',
      },
      active: {
        true: 'animate-pulse',
        false: 'opacity-40',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'blue',
      active: false,
    },
  }
);

export const ActivityPulse = React.forwardRef<HTMLDivElement, ActivityPulseProps>(
  ({ className, active = false, size, color, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(activityPulseVariants({ size, color, active }), className)}
        {...props}
      />
    );
  }
);

ActivityPulse.displayName = 'ActivityPulse';
