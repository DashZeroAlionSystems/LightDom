import React from 'react';
import { cn } from '../../lib/utils';

export interface ServiceActionBarProps {
  /** Optional title displayed on the left */
  title?: string;
  /** Optional supporting description */
  description?: string;
  /** Primary actions rendered (usually ServiceActionButton components) */
  children: React.ReactNode;
  /** Node rendered on the far right (e.g., filters, link) */
  trailing?: React.ReactNode;
  className?: string;
}

export const ServiceActionBar: React.FC<ServiceActionBarProps> = ({
  title,
  description,
  children,
  trailing,
  className,
}) => {
  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-surface-container-low p-4 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          {title && <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground/80">{description}</p>}
        </div>
        {trailing && <div className="shrink-0">{trailing}</div>}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {children}
      </div>
    </section>
  );
};

ServiceActionBar.displayName = 'ServiceActionBar';
