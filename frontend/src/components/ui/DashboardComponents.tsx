import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const dashboardCardVariants = cva(
  'bg-card border border-border rounded-2xl transition-all',
  {
    variants: {
      variant: {
        default: '',
        elevated: 'shadow-level-1 hover:shadow-level-2',
        outlined: 'border-2',
        filled: 'bg-primary/5 border-primary/20',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface DashboardCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dashboardCardVariants> {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const DashboardCard = React.forwardRef<HTMLDivElement, DashboardCardProps>(
  ({ className, variant, size, title, subtitle, icon, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(dashboardCardVariants({ variant, size }), className)}
        {...props}
      >
        {(title || subtitle || icon || action) && (
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {icon && <div className="text-muted-foreground">{icon}</div>}
              <div>
                {title && <h3 className="text-lg font-semibold">{title}</h3>}
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
            {action && <div>{action}</div>}
          </div>
        )}
        {children}
      </div>
    );
  }
);

DashboardCard.displayName = 'DashboardCard';

// MetricCard using dashboard style guide
export const MetricCard: React.FC<{
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}> = ({ title, value, icon, subtitle, trend, className }) => {
  return (
    <DashboardCard className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground text-sm">{title}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      {subtitle && (
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      )}
    </DashboardCard>
  );
};

// StatusBadge component
export const StatusBadge: React.FC<{
  status: 'healthy' | 'warning' | 'error' | 'inactive';
  label?: string;
  animated?: boolean;
  className?: string;
}> = ({ status, label, animated = false, className }) => {
  const statusStyles = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    inactive: 'bg-gray-500',
  };

  return (
    <div className={cn('flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border', className)}>
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          statusStyles[status],
          animated && 'animate-pulse'
        )}
      />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
};

// ServiceActionButton with variants
export const ServiceActionButton: React.FC<{
  label: string;
  description: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  onAction: () => Promise<void> | void;
  disabled?: boolean;
}> = ({ label, description, icon, variant = 'secondary', onAction, disabled }) => {
  const variantStyles = {
    primary: 'bg-primary text-on-primary hover:bg-primary/90',
    secondary: 'bg-secondary text-on-secondary hover:bg-secondary/80',
    danger: 'bg-error text-on-error hover:bg-error/90',
  };

  return (
    <button
      type="button"
      onClick={onAction}
      disabled={disabled}
      className={cn(
        'flex flex-col items-start gap-2 p-4 rounded-xl border border-border transition-all',
        'hover:border-primary/60 hover:shadow-level-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        variantStyles[variant],
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <div className="flex items-center gap-3 w-full">
        {icon}
        <div className="text-left">
          <div className="font-semibold">{label}</div>
          <div className="text-sm opacity-80">{description}</div>
        </div>
      </div>
    </button>
  );
};
