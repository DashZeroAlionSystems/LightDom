import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const kpiGridVariants = cva('grid gap-4', {
  variants: {
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    },
  },
  defaultVariants: {
    columns: 3,
  },
});

export interface KpiGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof kpiGridVariants> {}

export const KpiGrid: React.FC<KpiGridProps> = ({ columns, className, children, ...props }) => {
  return (
    <div className={cn(kpiGridVariants({ columns }), className)} {...props}>
      {children}
    </div>
  );
};

const kpiCardVariants = cva(
  [
    'flex flex-col gap-2 rounded-3xl border border-outline-variant bg-surface-container-high p-6 shadow-level-1',
    'transition-all duration-medium-2 ease-emphasized hover:border-outline hover:shadow-level-2',
  ],
  {
    variants: {
      tone: {
        neutral: 'bg-surface-container-high text-on-surface',
        primary: 'bg-primary-container text-on-primary-container',
        success: 'bg-success-container text-on-success-container',
        warning: 'bg-warning-container text-on-warning-container',
        error: 'bg-error-container text-on-error-container',
      },
      align: {
        start: 'items-start text-left',
        center: 'items-center text-center',
        end: 'items-end text-right',
      },
    },
    defaultVariants: {
      tone: 'neutral',
      align: 'start',
    },
  }
);

export interface KpiCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof kpiCardVariants> {
  label: string;
  value: React.ReactNode;
  delta?: React.ReactNode;
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  delta,
  icon,
  tone,
  align,
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn(kpiCardVariants({ tone, align }), className)} {...props}>
      <div className='flex w-full items-center justify-between gap-2'>
        <span className='md3-label-large text-on-surface-variant/80'>{label}</span>
        {icon && <span className='text-on-surface-variant/70'>{icon}</span>}
      </div>
      <div className='flex w-full flex-wrap items-baseline justify-between gap-3'>
        <span className='md3-headline-medium text-on-surface leading-tight'>{value}</span>
        {delta && <span className='md3-label-medium text-on-surface-variant'>{delta}</span>}
      </div>
      {children && <div className='md3-body-small text-on-surface-variant/90'>{children}</div>}
    </div>
  );
};
