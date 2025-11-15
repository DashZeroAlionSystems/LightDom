/**
 * SeedItem - Small atom to render a single URL seed row with badges and meta
 */

import { cn } from '@/lib/utils';
import React from 'react';
import { Badge } from './Badge';
import { LiveBadge } from './LiveDataDisplay';

export interface SeedItemProps extends React.HTMLAttributes<HTMLDivElement> {
  url: string;
  domain?: string;
  priority?: number;
  cadence?: string;
}

export const SeedItem: React.FC<SeedItemProps> = ({
  url,
  domain,
  priority = 5,
  cadence = 'daily',
  className,
  ...props
}) => {
  const priorityVariant = priority > 7 ? 'danger' : priority > 4 ? 'warning' : 'success';

  return (
    <div
      className={cn(
        'p-3 rounded-md border border-gray-200 bg-surface-container-highest flex items-center gap-3',
        className
      )}
      {...props}
    >
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-on-surface truncate'>{url}</p>
        {domain && (
          <div className='flex items-center gap-2 mt-1'>
            <LiveBadge variant='default' size='sm'>
              {domain}
            </LiveBadge>
            <Badge variant={priorityVariant as any} size='sm'>
              P{priority}
            </Badge>
            <Badge variant='info' size='sm'>
              {cadence}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeedItem;
