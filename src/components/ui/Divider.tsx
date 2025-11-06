/**
 * Divider Component - Material Design 3
 * Visual separator component with flexible orientation and styling
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const dividerVariants = cva(
  [
    'shrink-0 bg-outline-variant',
    'transition-all duration-medium-2 ease-standard'
  ],
  {
    variants: {
      orientation: {
        horizontal: 'h-px w-full',
        vertical: 'h-full w-px'
      },
      variant: {
        fullWidth: '',
        inset: '',
        middle: ''
      },
      thickness: {
        thin: 'h-px',
        medium: 'h-0.5',
        thick: 'h-1'
      }
    },
    compoundVariants: [
      {
        orientation: 'horizontal',
        variant: 'inset',
        class: 'mx-4'
      },
      {
        orientation: 'vertical',
        variant: 'inset',
        class: 'my-4'
      },
      {
        orientation: 'horizontal',
        variant: 'middle',
        class: 'mx-auto max-w-md'
      }
    ],
    defaultVariants: {
      orientation: 'horizontal',
      variant: 'fullWidth',
      thickness: 'thin'
    }
  }
);

export interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  /**
   * Text content to display in the middle of the divider
   */
  text?: string;
  /**
   * Position of the text when using horizontal orientation
   */
  textAlign?: 'start' | 'center' | 'end';
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({
    className,
    orientation = 'horizontal',
    variant,
    thickness,
    text,
    textAlign = 'center',
    ...props
  }, ref) => {
    if (text && orientation === 'vertical') {
      console.warn('Divider: text prop is not supported with vertical orientation');
    }

    if (text) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative flex items-center',
            orientation === 'horizontal' && 'w-full',
            className
          )}
          {...props}
        >
          <div
            className={cn(
              dividerVariants({ orientation, variant, thickness }),
              'flex-1'
            )}
          />
          <span
            className={cn(
              'px-3 text-body-sm text-on-surface-variant bg-surface',
              textAlign === 'start' && 'order-first',
              textAlign === 'end' && 'order-last'
            )}
          >
            {text}
          </span>
          <div
            className={cn(
              dividerVariants({ orientation, variant, thickness }),
              'flex-1'
            )}
          />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(dividerVariants({ orientation, variant, thickness }), className)}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

export { Divider, dividerVariants };
export type { DividerProps };
