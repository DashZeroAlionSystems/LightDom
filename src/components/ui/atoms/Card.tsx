/**
 * Card Atoms - Foundational card components
 * Building blocks for dashboard panels and content containers
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-lg transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white border border-gray-200 shadow-sm',
        elevated: 'bg-white shadow-md hover:shadow-lg',
        flat: 'bg-white border border-gray-200',
        outlined: 'bg-transparent border-2 border-gray-300',
        filled: 'bg-gray-50 border border-gray-200',
        gradient: 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200',
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      interactive: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      interactive,
      header,
      footer,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding: header || footer ? 'none' : padding, interactive }), className)}
        {...props}
      >
        {header && (
          <div className="px-4 py-3 border-b border-gray-200 font-semibold">
            {header}
          </div>
        )}
        <div className={cn(header || footer ? 'p-4' : '')}>
          {children}
        </div>
        {footer && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * CardHeader - Standardized card header component
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between p-4 border-b border-gray-200', className)}
        {...props}
      >
        <div className="flex items-start gap-3 flex-1">
          {icon && (
            <div className="mt-0.5 text-gray-600">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        {action && (
          <div className="ml-4">
            {action}
          </div>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * CardSection - Reusable card section with optional title
 */
export interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

export const CardSection = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {(title || description) && (
          <div>
            {title && (
              <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            )}
            {description && (
              <p className="text-sm text-gray-600 mt-0.5">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    );
  }
);

CardSection.displayName = 'CardSection';
