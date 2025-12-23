import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const fabVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-3 rounded-full font-medium',
    'transition-all duration-medium-2 ease-emphasized focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50 overflow-hidden'
  ],
  {
    variants: {
      tone: {
        primary: 'bg-primary text-on-primary shadow-level-3 hover:bg-primary/90',
        secondary: 'bg-secondary-container text-on-secondary-container shadow-level-2 hover:bg-secondary-container/90',
        tertiary: 'bg-tertiary-container text-on-tertiary-container shadow-level-2 hover:bg-tertiary-container/90',
        surface: 'bg-surface-container-high text-primary shadow-level-1 hover:bg-surface-container-high/90'
      },
      size: {
        small: 'h-10 w-10 text-label-large',
        medium: 'h-14 w-14 text-title-medium',
        large: 'h-16 w-16 text-title-medium'
      },
      extended: {
        true: 'w-auto px-6',
        false: ''
      }
    },
    defaultVariants: {
      tone: 'primary',
      size: 'medium',
      extended: false
    }
  }
);

export interface FabProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  icon?: React.ReactNode;
  asChild?: boolean;
}

const Fab = React.forwardRef<HTMLButtonElement, FabProps>(
  ({ icon, children, tone, size, extended, className, disabled, ...props }, ref) => {
    const isExtended = extended ?? Boolean(children);

    return (
      <button
        ref={ref}
        className={cn(fabVariants({ tone, size, extended: isExtended }), className)}
        disabled={disabled}
        {...props}
      >
        {/* Icon slot */}
        {icon && <span className="flex h-6 w-6 items-center justify-center text-current">{icon}</span>}

        {/* Label slot (extended only) */}
        {isExtended && children && (
          <span className="md3-title-medium whitespace-nowrap text-current">{children}</span>
        )}

        {/* State layer */}
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] state-layer" />
      </button>
    );
  }
);

Fab.displayName = 'Fab';

export default Fab;
