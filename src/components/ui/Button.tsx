/**
 * Button Component - Material Design 3
 * Accessible, themeable button component with multiple variants and states
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  // Base styles - Material Design 3 button foundation
  [
    'inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium',
    'transition-all duration-medium-2 ease-emphasized',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'relative overflow-hidden'
  ],
  {
    variants: {
      variant: {
        // Filled - High emphasis
        filled: [
          'bg-primary text-on-primary shadow-level-1',
          'hover:bg-primary/90 hover:shadow-level-2',
          'active:bg-primary/80 active:shadow-level-1',
          'state-layer-hover state-layer-focus state-layer-pressed'
        ],
        // Filled Tonal - Medium emphasis  
        'filled-tonal': [
          'bg-secondary-container text-on-secondary-container shadow-level-1',
          'hover:bg-secondary-container/90 hover:shadow-level-2',
          'active:bg-secondary-container/80 active:shadow-level-1',
          'state-layer-hover state-layer-focus state-layer-pressed'
        ],
        // Outlined - Medium emphasis
        outlined: [
          'border border-outline text-primary bg-transparent',
          'hover:bg-primary/8 hover:border-primary',
          'active:bg-primary/12',
          'state-layer-hover state-layer-focus state-layer-pressed'
        ],
        // Text - Low emphasis
        text: [
          'text-primary bg-transparent',
          'hover:bg-primary/8',
          'active:bg-primary/12',
          'state-layer-hover state-layer-focus state-layer-pressed'
        ],
        // Elevated - Low emphasis with elevation
        elevated: [
          'bg-surface-container-low text-primary shadow-level-1',
          'hover:bg-surface-container-low/90 hover:shadow-level-2',
          'active:bg-surface-container-low/80 active:shadow-level-1',
          'state-layer-hover state-layer-focus state-layer-pressed'
        ]
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-sm',
        md: 'h-10 px-4 text-sm rounded-md', 
        lg: 'h-12 px-6 text-base rounded-lg'
      },
      fullWidth: {
        true: 'w-full'
      }
    },
    defaultVariants: {
      variant: 'filled',
      size: 'md'
    }
  }
);

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Icon to display on the left side of the button
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display on the right side of the button
   */
  rightIcon?: React.ReactNode;
  /**
   * Loading state - shows spinner and disables button
   */
  isLoading?: boolean;
  /**
   * Component to render as (for polymorphic behavior)
   */
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    leftIcon, 
    rightIcon, 
    isLoading = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        
        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className="w-4 h-4 flex items-center justify-center">
            {leftIcon}
          </span>
        )}
        
        {/* Button text */}
        {children && (
          <span className={cn(isLoading && 'opacity-0')}>
            {children}
          </span>
        )}
        
        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="w-4 h-4 flex items-center justify-center">
            {rightIcon}
          </span>
        )}

        {/* State layer for Material Design 3 interactions */}
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none state-layer" />
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
export type { ButtonProps };