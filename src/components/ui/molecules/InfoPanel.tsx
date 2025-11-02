/**
 * InfoPanel - Molecule composed from atoms
 * Panel for displaying information with icon, title, and description
 */

import React from 'react';
import { Card, CardHeader } from '../atoms/Card';
import { Text } from '../atoms/Typography';
import { StatusBadge } from '../atoms/Badge';

export interface InfoPanelProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status?: 'online' | 'offline' | 'active' | 'inactive' | 'pending' | 'error' | 'success';
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const InfoPanel = React.forwardRef<HTMLDivElement, InfoPanelProps>(
  ({ title, description, icon, status, children, action, className }, ref) => {
    const headerAction = (
      <div className="flex items-center gap-2">
        {status && <StatusBadge status={status} />}
        {action}
      </div>
    );

    return (
      <Card
        ref={ref}
        variant="elevated"
        padding="none"
        className={className}
      >
        <CardHeader
          title={title}
          subtitle={description}
          icon={icon}
          action={headerAction}
        />
        {children && (
          <div className="p-4">
            {children}
          </div>
        )}
      </Card>
    );
  }
);

InfoPanel.displayName = 'InfoPanel';

/**
 * DetailRow - Row for displaying label-value pairs
 */
export interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const DetailRow = React.forwardRef<HTMLDivElement, DetailRowProps>(
  ({ label, value, icon, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between py-2 border-b border-gray-100 last:border-0',
          className
        )}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className="text-gray-400 w-5 h-5 flex items-center justify-center">
              {icon}
            </span>
          )}
          <Text size="sm" color="muted" weight="medium">
            {label}
          </Text>
        </div>
        <div className="text-right">
          {typeof value === 'string' || typeof value === 'number' ? (
            <Text size="sm" weight="medium">
              {value}
            </Text>
          ) : (
            value
          )}
        </div>
      </div>
    );
  }
);

DetailRow.displayName = 'DetailRow';

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
