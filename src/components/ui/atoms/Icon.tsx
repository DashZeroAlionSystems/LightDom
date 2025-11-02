/**
 * Icon Atoms - Foundational icon components
 * Wrappers and utilities for consistent icon usage
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const iconVariants = cva(
  'inline-flex items-center justify-center flex-shrink-0',
  {
    variants: {
      size: {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
        '2xl': 'w-10 h-10',
      },
      color: {
        default: 'text-gray-600',
        primary: 'text-blue-600',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        danger: 'text-red-600',
        muted: 'text-gray-400',
        white: 'text-white',
      },
    },
    defaultVariants: {
      size: 'md',
      color: 'default',
    },
  }
);

export interface IconWrapperProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof iconVariants> {
  children: React.ReactNode;
}

export const IconWrapper = React.forwardRef<HTMLSpanElement, IconWrapperProps>(
  ({ className, size, color, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(iconVariants({ size, color }), className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

IconWrapper.displayName = 'IconWrapper';

/**
 * StatusIcon - Icon with status indicator dot
 */
export interface StatusIconProps extends IconWrapperProps {
  status?: 'active' | 'inactive' | 'warning' | 'error';
  showDot?: boolean;
}

const statusColorMap = {
  active: 'bg-green-500',
  inactive: 'bg-gray-400',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export const StatusIcon = React.forwardRef<HTMLSpanElement, StatusIconProps>(
  ({ className, status = 'inactive', showDot = true, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn('relative inline-flex', className)}>
        <IconWrapper {...props}>{children}</IconWrapper>
        {showDot && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white',
              statusColorMap[status]
            )}
          />
        )}
      </span>
    );
  }
);

StatusIcon.displayName = 'StatusIcon';

/**
 * CircularIcon - Icon in a circular background
 */
const circularIconVariants = cva(
  'rounded-full flex items-center justify-center',
  {
    variants: {
      size: {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
      },
      variant: {
        default: 'bg-gray-100 text-gray-600',
        primary: 'bg-blue-100 text-blue-600',
        success: 'bg-green-100 text-green-600',
        warning: 'bg-yellow-100 text-yellow-600',
        danger: 'bg-red-100 text-red-600',
        info: 'bg-cyan-100 text-cyan-600',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface CircularIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof circularIconVariants> {
  icon: React.ReactNode;
}

export const CircularIcon = React.forwardRef<HTMLDivElement, CircularIconProps>(
  ({ className, size, variant, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(circularIconVariants({ size, variant }), className)}
        {...props}
      >
        {icon}
      </div>
    );
  }
);

CircularIcon.displayName = 'CircularIcon';

/**
 * NavigationIcon - Icon for navigation items with consistent styling
 */
export interface NavigationIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: React.ReactNode;
  active?: boolean;
}

export const NavigationIcon = React.forwardRef<HTMLSpanElement, NavigationIconProps>(
  ({ className, icon, active = false, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center w-5 h-5 transition-colors duration-200',
          active ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-900',
          className
        )}
        {...props}
      >
        {icon}
      </span>
    );
  }
);

NavigationIcon.displayName = 'NavigationIcon';
