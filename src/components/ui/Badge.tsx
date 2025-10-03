import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-hover',
        secondary: 'bg-secondary text-white hover:bg-secondary-hover',
        accent: 'bg-accent text-white hover:bg-accent-hover',
        success: 'bg-success text-white hover:bg-success-hover',
        warning: 'bg-warning text-white hover:bg-warning-hover',
        error: 'bg-error text-white hover:bg-error-hover',
        outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
        ghost: 'text-text-secondary hover:bg-surface',
        muted: 'bg-surface text-text-secondary',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      dot: {
        true: 'pl-1.5',
        false: '',
      },
      removable: {
        true: 'pr-1',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      dot: false,
      removable: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  removeLabel?: string;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      dot,
      removable,
      onRemove,
      removeLabel = 'Remove',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        className={cn(badgeVariants({ variant, size, dot, removable }), className)}
        ref={ref}
        {...props}
      >
        {dot && (
          <div className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
        {children}
        {removable && onRemove && (
          <button
            type="button"
            className="ml-1 inline-flex h-3 w-3 items-center justify-center rounded-full hover:bg-black/20 focus:outline-none focus:ring-1 focus:ring-white/50"
            onClick={onRemove}
            aria-label={removeLabel}
          >
            <svg
              className="h-2 w-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };