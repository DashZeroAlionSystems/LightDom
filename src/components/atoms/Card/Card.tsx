import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

const cardVariants = cva('rounded-xl transition-all duration-200', {
  variants: {
    variant: {
      elevated: 'bg-background shadow-md hover:shadow-lg',
      outlined: 'bg-background border border-border',
      filled: 'bg-surface',
      gradient: 'bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20',
      glass: 'bg-white/10 backdrop-blur-md border border-white/20',
    },
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
    interactive: {
      true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
    },
  },
  defaultVariants: {
    variant: 'elevated',
    padding: 'md',
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Card header content */
  header?: React.ReactNode;
  /** Card footer content */
  footer?: React.ReactNode;
  /** Highlight/accent color on left edge */
  accent?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  /** Loading state */
  loading?: boolean;
}

const accentColors = {
  primary: 'border-l-4 border-l-primary',
  success: 'border-l-4 border-l-green-500',
  warning: 'border-l-4 border-l-yellow-500',
  error: 'border-l-4 border-l-red-500',
  info: 'border-l-4 border-l-blue-500',
};

export const Card: React.FC<CardProps> = ({
  variant,
  padding,
  interactive,
  header,
  footer,
  accent,
  loading,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        cardVariants({ variant, padding: header || footer ? 'none' : padding, interactive }),
        accent && accentColors[accent],
        loading && 'animate-pulse',
        className
      )}
      {...props}
    >
      {header && (
        <div className="px-4 py-3 border-b border-border">{header}</div>
      )}
      <div className={cn(padding && (header || footer) && `p-${padding === 'sm' ? '3' : padding === 'md' ? '4' : padding === 'lg' ? '6' : padding === 'xl' ? '8' : '0'}`)}>
        {children}
      </div>
      {footer && (
        <div className="px-4 py-3 border-t border-border bg-muted/50">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.displayName = 'Card';

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between',
        className
      )}
      {...props}
    >
      {(title || subtitle || children) && (
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {children}
        </div>
      )}
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
};

CardHeader.displayName = 'CardHeader';

// Card Content Component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent: React.FC<CardContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('text-foreground', className)} {...props}>
      {children}
    </div>
  );
};

CardContent.displayName = 'CardContent';

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  align = 'right',
  className,
  children,
  ...props
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={cn('flex items-center gap-2', alignClasses[align], className)}
      {...props}
    >
      {children}
    </div>
  );
};

CardFooter.displayName = 'CardFooter';
