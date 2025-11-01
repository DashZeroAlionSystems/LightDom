/**
 * Spacer Component - Material Design 3
 * Utility component for consistent spacing between elements
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const spacerVariants = cva('', {
  variants: {
    size: {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-4',
      lg: 'h-6',
      xl: 'h-8',
      '2xl': 'h-12',
      '3xl': 'h-16',
      '4xl': 'h-24'
    },
    axis: {
      vertical: 'w-auto',
      horizontal: 'h-auto w-2'
    }
  },
  compoundVariants: [
    {
      axis: 'horizontal',
      size: 'xs',
      class: 'w-1'
    },
    {
      axis: 'horizontal',
      size: 'sm',
      class: 'w-2'
    },
    {
      axis: 'horizontal',
      size: 'md',
      class: 'w-4'
    },
    {
      axis: 'horizontal',
      size: 'lg',
      class: 'w-6'
    },
    {
      axis: 'horizontal',
      size: 'xl',
      class: 'w-8'
    },
    {
      axis: 'horizontal',
      size: '2xl',
      class: 'w-12'
    },
    {
      axis: 'horizontal',
      size: '3xl',
      class: 'w-16'
    },
    {
      axis: 'horizontal',
      size: '4xl',
      class: 'w-24'
    }
  ],
  defaultVariants: {
    size: 'md',
    axis: 'vertical'
  }
});

export interface SpacerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spacerVariants> {}

const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ className, size, axis, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(spacerVariants({ size, axis }), className)}
      {...props}
    />
  )
);

Spacer.displayName = 'Spacer';

export { Spacer, spacerVariants };
export type { SpacerProps };
