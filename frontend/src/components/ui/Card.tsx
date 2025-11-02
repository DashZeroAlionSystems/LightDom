/**
 * Card Component - Material Design 3
 * Flexible compound component for grouping related content
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const cardVariants = cva(
  // Base styles - Material Design 3 card foundation
  [
    'rounded-xl bg-surface text-on-surface',
    'transition-all duration-medium-2 ease-standard'
  ],
  {
    variants: {
      variant: {
        // Filled - Highest emphasis
        filled: [
          'bg-surface-container-highest shadow-none',
          'border border-outline-variant'
        ],
        // Elevated - Medium emphasis with shadow
        elevated: [
          'bg-surface-container-low shadow-level-1',
          'hover:shadow-level-2'
        ],
        // Outlined - Lower emphasis with border
        outlined: [
          'bg-surface border border-outline',
          'hover:shadow-level-1'
        ]
      },
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4', 
        lg: 'p-6'
      },
      hoverable: {
        true: 'cursor-pointer hover:shadow-level-2 transition-shadow'
      }
    },
    defaultVariants: {
      variant: 'elevated',
      padding: 'md'
    }
  }
);

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hoverable, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, hoverable, className }))}
      {...props}
    />
  )
);

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6 pb-0', className)}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

// Card Title Component
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-title-lg font-medium leading-none tracking-tight text-on-surface',
        className
      )}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

// Card Description Component
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-body-md text-on-surface-variant', className)}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

// Card Content Component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn('p-6 pt-0', className)} 
      {...props} 
    />
  )
);

CardContent.displayName = 'CardContent';

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
};