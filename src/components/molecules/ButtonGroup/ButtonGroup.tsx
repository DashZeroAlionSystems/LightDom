import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React, { Children, cloneElement, forwardRef, isValidElement } from 'react';

const buttonGroupVariants = cva('inline-flex', {
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
    attached: {
      true: '',
      false: 'gap-1',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    attached: true,
  },
});

export interface ButtonGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof buttonGroupVariants> {
  /** Size for all buttons in group */
  size?: 'sm' | 'md' | 'lg';
  /** Variant for all buttons in group */
  variant?: 'primary' | 'secondary' | 'outlined' | 'ghost';
  /** Disable all buttons */
  disabled?: boolean;
}

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  (
    {
      orientation = 'horizontal',
      attached = true,
      size,
      variant,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const childrenArray = Children.toArray(children);
    const childCount = childrenArray.length;

    return (
      <div
        ref={ref}
        role="group"
        className={cn(buttonGroupVariants({ orientation, attached }), className)}
        {...props}
      >
        {Children.map(children, (child, index) => {
          if (!isValidElement(child)) return child;

          const isFirst = index === 0;
          const isLast = index === childCount - 1;

          // Classes for attached button group
          const attachedClasses = attached
            ? cn(
                // Horizontal attached
                orientation === 'horizontal' && [
                  !isFirst && 'border-l-0 rounded-l-none',
                  !isLast && 'rounded-r-none',
                ],
                // Vertical attached
                orientation === 'vertical' && [
                  !isFirst && 'border-t-0 rounded-t-none',
                  !isLast && 'rounded-b-none',
                ]
              )
            : '';

          return cloneElement(child as React.ReactElement<any>, {
            size: size || (child as React.ReactElement<any>).props.size,
            variant: variant || (child as React.ReactElement<any>).props.variant,
            disabled: disabled || (child as React.ReactElement<any>).props.disabled,
            className: cn(
              (child as React.ReactElement<any>).props.className,
              attachedClasses
            ),
          });
        })}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';
