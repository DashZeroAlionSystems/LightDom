/**
 * Typography Atoms - Foundational text and heading components
 * Building blocks for consistent text styling across the application
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const headingVariants = cva(
  'font-semibold text-gray-900 tracking-tight',
  {
    variants: {
      level: {
        h1: 'text-4xl md:text-5xl lg:text-6xl',
        h2: 'text-3xl md:text-4xl lg:text-5xl',
        h3: 'text-2xl md:text-3xl lg:text-4xl',
        h4: 'text-xl md:text-2xl lg:text-3xl',
        h5: 'text-lg md:text-xl lg:text-2xl',
        h6: 'text-base md:text-lg lg:text-xl',
      },
      weight: {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
    },
    defaultVariants: {
      level: 'h2',
      weight: 'semibold',
    },
  }
);

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  /**
   * Override the semantic HTML element while preserving visual styling.
   * Use with caution: ensure the override maintains proper document outline and accessibility.
   * For example: level="h2" as="h3" renders an h3 that looks like h2.
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 'h2', weight, as, children, ...props }, ref) => {
    const Component = (as || level) as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    
    return (
      <Component
        ref={ref}
        className={cn(headingVariants({ level, weight }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';

const textVariants = cva(
  'text-gray-700',
  {
    variants: {
      size: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
      },
      weight: {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      },
      color: {
        default: 'text-gray-700',
        muted: 'text-gray-500',
        primary: 'text-blue-600',
        success: 'text-green-600',
        warning: 'text-yellow-600',
        danger: 'text-red-600',
        white: 'text-white',
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify',
      },
    },
    defaultVariants: {
      size: 'base',
      weight: 'normal',
      color: 'default',
      align: 'left',
    },
  }
);

export interface TextProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div' | 'label';
}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, size, weight, color, align, as = 'p', children, ...props }, ref) => {
    const Component = as as 'p' | 'span' | 'div' | 'label';
    
    return (
      <Component
        ref={ref}
        className={cn(textVariants({ size, weight, color, align }), className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';

/**
 * Label - Form label component
 */
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  disabled?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, disabled, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-sm font-medium text-gray-700 mb-1',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';

/**
 * Caption - Small supporting text
 */
export interface CaptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  error?: boolean;
}

export const Caption = React.forwardRef<HTMLSpanElement, CaptionProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'text-xs',
          error ? 'text-red-600' : 'text-gray-500',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Caption.displayName = 'Caption';

/**
 * Code - Inline code snippet
 */
export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  block?: boolean;
}

export const Code = React.forwardRef<HTMLElement, CodeProps>(
  ({ className, block = false, children, ...props }, ref) => {
    return (
      <code
        ref={ref}
        className={cn(
          'font-mono text-sm',
          block
            ? 'block p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto'
            : 'px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded',
          className
        )}
        {...props}
      >
        {children}
      </code>
    );
  }
);

Code.displayName = 'Code';
