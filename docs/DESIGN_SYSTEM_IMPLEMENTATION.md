# LightDom Design System Implementation Guide

## Quick Start

This guide provides practical implementation instructions for the LightDom design system, which combines Material Design 3 principles with Tailwind CSS utility classes.

## Prerequisites

```bash
npm install class-variance-authority clsx tailwind-merge
```

## Core Utilities

### 1. Class Name Utility (cn)

Create `src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Component Examples

### Button Component

Create `src/components/ui/Button.tsx`:

```typescript
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define button variants using CVA
const buttonVariants = cva(
  // Base styles (always applied)
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-medium-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-border-focus disabled:pointer-events-none disabled:opacity-38',
  {
    variants: {
      variant: {
        filled: 'bg-gradient-primary text-on-primary shadow-level-1 hover:shadow-level-2 active:shadow-level-1',
        'filled-tonal': 'bg-surface-container-high text-primary hover:bg-surface-container-highest',
        outlined: 'border border-outline bg-transparent text-primary hover:bg-primary/8',
        text: 'text-primary hover:bg-primary/8',
        elevated: 'bg-surface-container-low text-primary shadow-level-1 hover:shadow-level-2',
      },
      size: {
        sm: 'h-8 px-3 text-label-md',
        md: 'h-10 px-6 text-label-lg',
        lg: 'h-14 px-8 text-label-lg',
      },
      shape: {
        rounded: 'rounded-lg',
        pill: 'rounded-full',
      },
    },
    compoundVariants: [
      {
        variant: 'filled',
        size: 'lg',
        className: 'shadow-glow hover:shadow-glow-lg',
      },
    ],
    defaultVariants: {
      variant: 'filled',
      size: 'md',
      shape: 'pill',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, shape }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Card Component (Compound Component Pattern)

Create `src/components/ui/Card.tsx`:

```typescript
import { forwardRef, createContext, useContext } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Card context for shared state
const CardContext = createContext<{ variant: string }>({ variant: 'filled' });

// Card variants
const cardVariants = cva('rounded-lg overflow-hidden', {
  variants: {
    variant: {
      filled: 'bg-surface-container-highest text-on-surface',
      elevated: 'bg-surface-container-low text-on-surface shadow-level-1',
      outlined: 'bg-surface text-on-surface border border-outline',
    },
    padding: {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'filled',
    padding: 'md',
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, children, ...props }, ref) => {
    return (
      <CardContext.Provider value={{ variant: variant || 'filled' }}>
        <div
          ref={ref}
          className={cn(cardVariants({ variant, padding }), className)}
          {...props}
        >
          {children}
        </div>
      </CardContext.Provider>
    );
  }
);
Card.displayName = 'Card';

// Card Header
export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// Card Title
export const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-title-lg font-heading', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// Card Description
export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-body-md text-on-surface-variant', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// Card Content
export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// Card Footer
export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-6', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';
```

### Input Component

Create `src/components/ui/Input.tsx`:

```typescript
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'filled' | 'outlined';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      variant = 'outlined',
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1 block text-label-lg text-on-surface-variant">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border px-3 py-2 text-body-md transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              variant === 'filled' &&
                'border-0 border-b-2 rounded-t-md rounded-b-none bg-surface-container-highest',
              variant === 'outlined' && 'border-outline bg-transparent',
              error
                ? 'border-error focus-visible:ring-error'
                : 'border-outline focus-visible:ring-border-focus',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={cn(
              'mt-1 text-label-md',
              error ? 'text-error' : 'text-on-surface-variant'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### Badge Component

Create `src/components/ui/Badge.tsx`:

```typescript
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary',
        secondary: 'bg-secondary text-on-secondary',
        success: 'bg-success text-white',
        warning: 'bg-warning text-white',
        error: 'bg-error text-on-error',
        outline: 'border border-outline text-primary',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
```

### FAB (Floating Action Button)

Create `src/components/ui/FAB.tsx`:

```typescript
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const fabVariants = cva(
  'inline-flex items-center justify-center font-medium shadow-level-3 hover:shadow-level-4 transition-all duration-medium-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary',
        secondary: 'bg-surface-container-high text-primary',
        tertiary: 'bg-tertiary text-on-tertiary',
      },
      size: {
        small: 'h-10 w-10 rounded-md',
        medium: 'h-14 w-14 rounded-lg',
        large: 'h-24 w-24 rounded-xl',
      },
      extended: {
        true: 'px-4 w-auto',
        false: '',
      },
    },
    compoundVariants: [
      {
        extended: true,
        size: 'small',
        className: 'h-10',
      },
      {
        extended: true,
        size: 'medium',
        className: 'h-14',
      },
      {
        extended: true,
        size: 'large',
        className: 'h-24',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
      extended: false,
    },
  }
);

export interface FABProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  icon: React.ReactNode;
  label?: string;
}

export const FAB = forwardRef<HTMLButtonElement, FABProps>(
  ({ className, variant, size, extended, icon, label, ...props }, ref) => {
    const isExtended = extended || !!label;

    return (
      <button
        ref={ref}
        className={cn(fabVariants({ variant, size, extended: isExtended }), className)}
        {...props}
      >
        <span className={cn(isExtended && label && 'mr-2')}>{icon}</span>
        {isExtended && label && <span className="text-label-lg">{label}</span>}
      </button>
    );
  }
);

FAB.displayName = 'FAB';
```

## Usage Examples

### Button Usage

```tsx
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

function Example() {
  return (
    <div className="flex gap-4">
      {/* Filled button (default) */}
      <Button>Click me</Button>

      {/* Outlined button with icon */}
      <Button variant="outlined" leftIcon={<Plus />}>
        Add Item
      </Button>

      {/* Loading state */}
      <Button isLoading>Submitting...</Button>

      {/* Different sizes */}
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}
```

### Card Usage

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function Example() {
  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle>Dashboard Overview</CardTitle>
        <CardDescription>Your key metrics at a glance</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-body-md">Card content goes here</p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="text">Cancel</Button>
        <Button>Confirm</Button>
      </CardFooter>
    </Card>
  );
}
```

### Form Usage

```tsx
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Lock } from 'lucide-react';

function LoginForm() {
  return (
    <form className="space-y-4">
      <Input
        type="email"
        label="Email"
        placeholder="Enter your email"
        leftIcon={<Mail className="h-4 w-4" />}
      />
      <Input
        type="password"
        label="Password"
        placeholder="Enter your password"
        leftIcon={<Lock className="h-4 w-4" />}
      />
      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  );
}
```

## Design Tokens Reference

### Colors

```tsx
// Primary color
<div className="bg-primary text-on-primary">Primary</div>

// Secondary color
<div className="bg-secondary text-on-secondary">Secondary</div>

// Surface colors
<div className="bg-surface-container-low">Container Low</div>
<div className="bg-surface-container-high">Container High</div>

// Semantic colors
<div className="bg-success text-white">Success</div>
<div className="bg-error text-on-error">Error</div>
```

### Typography

```tsx
// Display
<h1 className="text-display-lg">Display Large</h1>

// Headline
<h2 className="text-headline-md">Headline Medium</h2>

// Title
<h3 className="text-title-lg">Title Large</h3>

// Body
<p className="text-body-md">Body Medium</p>

// Label
<span className="text-label-lg">Label Large</span>
```

### Elevation

```tsx
// Using shadows
<div className="shadow-level-1">Level 1 Elevation</div>
<div className="shadow-level-3">Level 3 Elevation</div>

// With hover effect
<div className="shadow-level-1 hover:shadow-level-2 transition-shadow">
  Hover for more elevation
</div>
```

### Animation

```tsx
// Fade in
<div className="animate-fade-in">Fades in</div>

// Slide up
<div className="animate-slide-up">Slides up</div>

// With custom duration
<div className="animate-fade-in duration-medium-3">Custom duration</div>

// With custom easing
<div className="transition-all ease-emphasized">Emphasized easing</div>
```

## Responsive Design

```tsx
// Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>

// Responsive typography
<h1 className="text-headline-sm md:text-headline-md lg:text-headline-lg">
  Responsive Heading
</h1>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">Responsive padding</div>
```

## Dark Mode

```tsx
// Dark mode variants
<div className="bg-surface text-on-surface dark:bg-surface-dim dark:text-on-surface">
  Supports dark mode
</div>

// Dark mode specific styles
<Button className="dark:shadow-glow">
  Glows in dark mode
</Button>
```

## Accessibility

```tsx
// Proper ARIA labels
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Keyboard accessible
</div>

// Focus indicators (built into components)
<Button>Has visible focus indicator</Button>
```

## Best Practices

1. **Always use the cn() utility** when combining classes
2. **Use design tokens** from Tailwind config instead of arbitrary values
3. **Follow Material Design 3** component specifications
4. **Test accessibility** with keyboard navigation and screen readers
5. **Support dark mode** using Tailwind's dark: prefix
6. **Use semantic color names** (primary, error, success) not color names (red, blue)
7. **Implement loading states** for async operations
8. **Provide proper error handling** and validation feedback
9. **Write TypeScript interfaces** for all component props
10. **Document components** with JSDoc comments

## Additional Resources

- [Material Design 3 Guidelines](../research/material-design-3-guidelines.md)
- [UI/UX Component Patterns](../research/ui-ux-component-patterns.md)
- [Tailwind Best Practices](../research/tailwind-best-practices.md)
- [Design System Research Summary](../research/design-system-research-summary.md)
