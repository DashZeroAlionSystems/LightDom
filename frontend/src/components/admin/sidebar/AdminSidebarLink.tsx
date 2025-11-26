import { SidebarNavItem } from '@/components/ui/sidebar';
import type { AdminSidebarLinkConfig } from '@/config/adminSidebarConfig';
import React from 'react';
import { resolveLucideIcon } from './iconResolver';

interface AdminSidebarLinkProps {
  item: AdminSidebarLinkConfig;
}

export const AdminSidebarLink: React.FC<AdminSidebarLinkProps> = ({ item }) => {
  const Icon = resolveLucideIcon(item.icon);

  if (item.external) {
    return (
      <a
        href={item.path}
        target='_blank'
        rel='noreferrer'
        className='flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors duration-150 hover:bg-accent'
      >
        <Icon className='h-5 w-5 text-muted-foreground' />
        <span className='flex-1 min-w-0'>
          <span className='block font-medium truncate'>{item.label}</span>
          {item.description && (
            <span className='block text-xs text-muted-foreground truncate'>{item.description}</span>
          )}
        </span>
        {item.badge && (
          <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary'>
            {item.badge}
          </span>
        )}
      </a>
    );
  }

  return (
    <SidebarNavItem
      to={item.path}
      icon={<Icon className='h-5 w-5' />}
      label={item.label}
      description={item.description}
      badge={
        item.badge ? (
          <span className='rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary'>
            {item.badge}
          </span>
        ) : undefined
      }
      className='rounded-xl'
    />
  );
};
