import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const dividerVariants = cva('', {
  variants: {
    orientation: {
      horizontal: 'w-full h-px',
      vertical: 'h-full w-px',
    },
    variant: {
      solid: 'bg-border',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
      gradient: 'bg-gradient-to-r from-transparent via-border to-transparent',
    },
    spacing: {
      none: '',
      sm: '',
      md: '',
      lg: '',
    },
  },
  compoundVariants: [
    {
      orientation: 'horizontal',
      spacing: 'sm',
      class: 'my-2',
    },
    {
      orientation: 'horizontal',
      spacing: 'md',
      class: 'my-4',
    },
    {
      orientation: 'horizontal',
      spacing: 'lg',
      class: 'my-6',
    },
    {
      orientation: 'vertical',
      spacing: 'sm',
      class: 'mx-2',
    },
    {
      orientation: 'vertical',
      spacing: 'md',
      class: 'mx-4',
    },
    {
      orientation: 'vertical',
      spacing: 'lg',
      class: 'mx-6',
    },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'solid',
    spacing: 'md',
  },
});

export interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  /** Label text to show in the middle of the divider */
  label?: string;
  /** Label position */
  labelPosition?: 'left' | 'center' | 'right';
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant,
  spacing,
  label,
  labelPosition = 'center',
  className,
  ...props
}) => {
  if (label && orientation === 'horizontal') {
    const labelClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    };

    return (
      <div
        className={cn(
          'flex items-center',
          spacing === 'sm' && 'my-2',
          spacing === 'md' && 'my-4',
          spacing === 'lg' && 'my-6',
          className
        )}
        role="separator"
        {...props}
      >
        <div
          className={cn(
            'flex-1 h-px',
            variant === 'gradient'
              ? 'bg-gradient-to-r from-transparent to-border'
              : 'bg-border',
            labelPosition !== 'left' && 'flex-1'
          )}
        />
        <span
          className={cn(
            'px-3 text-sm text-muted-foreground whitespace-nowrap',
            labelPosition === 'left' && 'pl-0',
            labelPosition === 'right' && 'pr-0'
          )}
        >
          {label}
        </span>
        <div
          className={cn(
            'flex-1 h-px',
            variant === 'gradient'
              ? 'bg-gradient-to-r from-border to-transparent'
              : 'bg-border',
            labelPosition !== 'right' && 'flex-1'
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(dividerVariants({ orientation, variant, spacing }), className)}
      role="separator"
      aria-orientation={orientation}
      {...props}
    />
  );
};

Divider.displayName = 'Divider';
