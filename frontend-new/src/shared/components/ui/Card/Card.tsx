import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const cardVariants = cva(
  'rounded-lg border transition-all',
  {
    variants: {
      variant: {
        default: 'bg-color-background-secondary border-color-border',
        elevated: 'bg-color-background-elevated border-color-border shadow-md',
        outlined: 'bg-transparent border-color-border',
        gradient: 'bg-gradient-surface border-color-border',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
      hoverable: {
        true: 'hover:shadow-lg hover:border-color-primary-500 cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hoverable: false,
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

/**
 * Card Component
 *
 * A versatile container component for grouping related content.
 *
 * @example
 * ```tsx
 * <Card variant="elevated" padding="lg">
 *   <h3>Card Title</h3>
 *   <p>Card content goes here</p>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hoverable, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, hoverable, className }))}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
