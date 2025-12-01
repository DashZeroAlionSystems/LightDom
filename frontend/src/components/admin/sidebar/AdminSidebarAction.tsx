import type { AdminSidebarActionConfig } from '@/config/adminSidebarConfig';
import { cn } from '@/lib/utils';
import React from 'react';
import { resolveLucideIcon } from './iconResolver';

interface AdminSidebarActionProps {
  item: AdminSidebarActionConfig;
  onSelect?: (item: AdminSidebarActionConfig) => void;
}

export const AdminSidebarAction: React.FC<AdminSidebarActionProps> = ({ item, onSelect }) => {
  const Icon = resolveLucideIcon(item.icon);

  return (
    <button
      type='button'
      onClick={() => onSelect?.(item)}
      className={cn(
        'w-full text-left rounded-xl border border-transparent bg-primary/5',
        'hover:bg-primary/10 hover:border-primary/20 transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'px-3 py-2 flex gap-3 items-start group'
      )}
      aria-label={item.label}
    >
      <span className='mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary'>
        <Icon className='h-4 w-4' />
      </span>
      <span className='flex-1 min-w-0'>
        <span className='block text-sm font-semibold text-foreground truncate'>{item.label}</span>
        {item.description && (
          <span className='mt-1 block text-xs text-muted-foreground leading-snug line-clamp-2'>
            {item.description}
          </span>
        )}
      </span>
      <span className='mt-1 text-xs text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity'>
        Launch
      </span>
    </button>
  );
};
