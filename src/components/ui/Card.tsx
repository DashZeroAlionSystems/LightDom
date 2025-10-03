import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  'rounded-xl border border-border bg-surface-elevated shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'hover:shadow-md',
        elevated: 'shadow-md hover:shadow-lg',
        outlined: 'border-2 shadow-none hover:shadow-sm',
        filled: 'bg-surface border-0 shadow-none',
        gradient: 'bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      interactive: {
        true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
        false: '',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      interactive: false,
      fullWidth: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  fullWidth?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      padding,
      interactive,
      fullWidth,
      header,
      footer,
      title,
      description,
      icon,
      badge,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(cardVariants({ variant, padding, interactive, fullWidth }), className)}
        ref={ref}
        {...props}
      >
        {(header || title || description || icon || badge) && (
          <div className="card-header mb-4 pb-4 border-b border-border-light">
            {header ? (
              header
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {icon && (
                    <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
                      {icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {title && (
                      <h3 className="text-lg font-semibold text-text truncate">
                        {title}
                      </h3>
                    )}
                    {description && (
                      <p className="mt-1 text-sm text-text-secondary line-clamp-2">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
                {badge && (
                  <div className="flex-shrink-0 ml-2">
                    {badge}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="card-content">
          {children}
        </div>

        {footer && (
          <div className="card-footer mt-4 pt-4 border-t border-border-light">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components for better composition
const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('card-header mb-4 pb-4 border-b border-border-light', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg font-semibold text-text', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-text-secondary mt-1', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('card-content', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('card-footer mt-4 pt-4 border-t border-border-light', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };