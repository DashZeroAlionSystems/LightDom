/**
 * StatCard Component - Material Design 3
 * Reusable stat card for dashboards
 */

import { Card, CardContent } from './Card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  description?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  description,
  className,
}: StatCardProps) {
  return (
    <Card variant="elevated" className={cn('hover:shadow-level-3 transition-all', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-body-sm text-on-surface-variant mb-1">{title}</p>
            <h3 className="text-headline-md font-semibold mb-2">{value}</h3>
            {change && (
              <div className="flex items-center gap-1">
                {trend === 'up' && <ArrowUpRight className="h-4 w-4 text-success" />}
                {trend === 'down' && <ArrowDownRight className="h-4 w-4 text-error" />}
                <span
                  className={cn(
                    'text-label-md font-medium',
                    trend === 'up' && 'text-success',
                    trend === 'down' && 'text-error',
                    trend === 'neutral' && 'text-on-surface-variant'
                  )}
                >
                  {change}
                </span>
                {description && (
                  <span className="text-label-sm text-on-surface-variant ml-1">
                    {description}
                  </span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-6 w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;
