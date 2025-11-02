/**
 * StatCard - Molecule composed from atoms
 * Displays a statistic with icon, label, value, and trend
 */

import React from 'react';
import { Card } from '../atoms/Card';
import { Heading, Text } from '../atoms/Typography';
import { CircularIcon } from '../atoms/Icon';
import { Badge } from '../atoms/Badge';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    label?: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantIconMap = {
  default: 'default' as const,
  primary: 'primary' as const,
  success: 'success' as const,
  warning: 'warning' as const,
  danger: 'danger' as const,
};

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, icon, trend, variant = 'default', className }, ref) => {
    const getTrendColor = () => {
      if (!trend) return '';
      switch (trend.direction) {
        case 'up':
          return 'text-green-600';
        case 'down':
          return 'text-red-600';
        default:
          return 'text-gray-600';
      }
    };

    const getTrendIcon = () => {
      if (!trend) return null;
      switch (trend.direction) {
        case 'up':
          return '↑';
        case 'down':
          return '↓';
        default:
          return '→';
      }
    };

    return (
      <Card ref={ref} variant="elevated" padding="md" className={className}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Text size="sm" color="muted" weight="medium">
              {label}
            </Text>
            <Heading level="h3" as="div" className="text-2xl">
              {value}
            </Heading>
            {trend && (
              <div className={cn('flex items-center gap-1 text-sm', getTrendColor())}>
                <span className="font-semibold">
                  {getTrendIcon()} {trend.value}
                </span>
                {trend.label && (
                  <Text size="sm" color="muted" as="span">
                    {trend.label}
                  </Text>
                )}
              </div>
            )}
          </div>
          {icon && (
            <CircularIcon
              icon={icon}
              variant={variantIconMap[variant]}
              size="lg"
            />
          )}
        </div>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';
