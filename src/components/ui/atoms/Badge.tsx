/**
 * Badge Atoms - Foundational badge and tag components
 * Building blocks for status indicators and labels
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-cyan-100 text-cyan-800',
        purple: 'bg-purple-100 text-purple-800',
        pink: 'bg-pink-100 text-pink-800',
      },
      size: {
        xs: 'px-2 py-0.5 text-xs',
        sm: 'px-2.5 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
      outlined: {
        true: 'bg-transparent border-2',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        outlined: true,
        className: 'border-gray-300 text-gray-700',
      },
      {
        variant: 'primary',
        outlined: true,
        className: 'border-blue-500 text-blue-700',
      },
      {
        variant: 'success',
        outlined: true,
        className: 'border-green-500 text-green-700',
      },
      {
        variant: 'warning',
        outlined: true,
        className: 'border-yellow-500 text-yellow-700',
      },
      {
        variant: 'danger',
        outlined: true,
        className: 'border-red-500 text-red-700',
      },
      {
        variant: 'info',
        outlined: true,
        className: 'border-cyan-500 text-cyan-700',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'sm',
      outlined: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      outlined,
      icon,
      iconPosition = 'left',
      dot = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, outlined }), className)}
        {...props}
      >
        {dot && (
          <span className="w-2 h-2 rounded-full bg-current" />
        )}
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * StatusBadge - Specialized badge for status display
 */
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'online' | 'offline' | 'active' | 'inactive' | 'pending' | 'error' | 'success';
}

const statusMap = {
  online: { variant: 'success' as const, label: 'Online' },
  offline: { variant: 'default' as const, label: 'Offline' },
  active: { variant: 'success' as const, label: 'Active' },
  inactive: { variant: 'default' as const, label: 'Inactive' },
  pending: { variant: 'warning' as const, label: 'Pending' },
  error: { variant: 'danger' as const, label: 'Error' },
  success: { variant: 'success' as const, label: 'Success' },
};

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, children, ...props }, ref) => {
    const { variant, label } = statusMap[status];
    
    return (
      <Badge ref={ref} variant={variant} dot {...props}>
        {children || label}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

/**
 * NotificationBadge - Small badge for notification counts
 */
export interface NotificationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
  max?: number;
  showZero?: boolean;
}

export const NotificationBadge = React.forwardRef<HTMLSpanElement, NotificationBadgeProps>(
  ({ className, count, max = 99, showZero = false, ...props }, ref) => {
    if (count === 0 && !showZero) return null;

    const displayCount = count > max ? `${max}+` : count;

    return (
      <span
        ref={ref}
        className={cn(
          'absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1',
          className
        )}
        {...props}
      >
        {displayCount}
      </span>
    );
  }
);

NotificationBadge.displayName = 'NotificationBadge';
