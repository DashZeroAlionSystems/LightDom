import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const appBarVariants = cva(
  [
    'relative flex items-center gap-4 px-4',
    'bg-surface-container-high text-on-surface shadow-level-2',
    'transition-all duration-medium-2 ease-emphasized'
  ],
  {
    variants: {
      density: {
        default: 'min-h-[64px] py-3',
        comfortable: 'min-h-[72px] py-4',
        compact: 'min-h-[56px] py-2'
      },
      elevated: {
        true: 'shadow-level-3',
        false: 'shadow-level-1'
      },
      border: {
        true: 'border-b border-outline-variant',
        false: ''
      }
    },
    defaultVariants: {
      density: 'default',
      elevated: false,
      border: true
    }
  }
);

export interface AppBarProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof appBarVariants> {
  title?: string;
  subtitle?: string;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
}

const AppBar = React.forwardRef<HTMLElement, AppBarProps>(
  (
    {
      title,
      subtitle,
      leading,
      actions,
      className,
      density,
      elevated,
      border,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <header
        ref={ref}
        className={cn(appBarVariants({ density, elevated, border }), className)}
        {...props}
      >
        {leading && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-on-surface-variant">
            {leading}
          </div>
        )}

        <div className="flex flex-1 flex-col justify-center">
          {title && (
            <span className="md3-title-large leading-none text-on-surface truncate">
              {title}
            </span>
          )}
          {subtitle && (
            <span className="md3-body-medium text-on-surface-variant truncate">
              {subtitle}
            </span>
          )}
          {children}
        </div>

        {actions && (
          <div className="flex items-center gap-2 text-on-surface-variant">{actions}</div>
        )}
      </header>
    );
  }
);

AppBar.displayName = 'AppBar';

export default AppBar;
