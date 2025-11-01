/**
 * Badge Component - Material Design 3
 * Semantic status indicators and labels
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  // Base styles - Material Design 3 badge foundation
  [
    'inline-flex items-center justify-center rounded-full text-label-sm font-medium',
    'transition-all duration-medium-2 ease-standard',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
  ],
  {
    variants: {
      variant: {
        // Primary - High emphasis
        primary: [
          'bg-primary text-on-primary',
          'hover:bg-primary/90',
          'focus-visible:ring-primary'
        ],
        // Secondary - Medium emphasis
        secondary: [
          'bg-secondary text-on-secondary',
          'hover:bg-secondary/90',
          'focus-visible:ring-secondary'
        ],
        // Tertiary - Lower emphasis
        tertiary: [
          'bg-tertiary text-on-tertiary',
          'hover:bg-tertiary/90',
          'focus-visible:ring-tertiary'
        ],
        // Success - Positive state
        success: [
          'bg-success text-on-success',
          'hover:bg-success/90',
          'focus-visible:ring-success'
        ],
        // Warning - Caution state
        warning: [
          'bg-warning text-on-warning',
          'hover:bg-warning/90',
          'focus-visible:ring-warning'
        ],
        // Error - Negative state
        error: [
          'bg-error text-on-error',
          'hover:bg-error/90',
          'focus-visible:ring-error'
        ],
        // Outline - Low emphasis with border
        outline: [
          'border border-outline text-on-surface bg-transparent',
          'hover:bg-surface-container-highest',
          'focus-visible:ring-primary'
        ]
      },
      size: {
        sm: 'h-5 px-2 text-xs',
        md: 'h-6 px-2.5 text-sm',
        lg: 'h-7 px-3 text-sm'
      },
      dot: {
        true: 'w-2 h-2 p-0 rounded-full'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md'
    }
  }
);

export interface BadgeProps 
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Icon to display inside the badge
   */
  icon?: React.ReactNode;
  /**
   * Whether the badge should have a dot style (small circular indicator)
   */
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, dot, className }))}
        {...props}
      >
        {icon && !dot && (
          <span className="w-3 h-3 mr-1 flex items-center justify-center">
            {icon}
          </span>
        )}
        {!dot && children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };
export type { BadgeProps };