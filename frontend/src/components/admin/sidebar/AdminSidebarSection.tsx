import { SidebarCategory, SidebarDivider } from '@/components/ui/sidebar';
import type {
  AdminSidebarActionConfig,
  AdminSidebarItemConfig,
  AdminSidebarSectionConfig,
} from '@/config/adminSidebarConfig';
import React from 'react';
import { AdminSidebarAction } from './AdminSidebarAction';
import { AdminSidebarLink } from './AdminSidebarLink';

interface AdminSidebarSectionProps {
  section: AdminSidebarSectionConfig;
  onAction?: (item: AdminSidebarActionConfig) => void;
  showDivider?: boolean;
}

const renderItem = (
  item: AdminSidebarItemConfig,
  onAction?: (item: AdminSidebarActionConfig) => void
) => {
  if (item.type === 'action') {
    return <AdminSidebarAction key={item.id} item={item} onSelect={onAction} />;
  }

  return <AdminSidebarLink key={item.id} item={item} />;
};

export const AdminSidebarSection: React.FC<AdminSidebarSectionProps> = ({
  section,
  onAction,
  showDivider = false,
}) => {
  return (
    <div className='space-y-3'>
      {showDivider && <SidebarDivider />}
      <SidebarCategory title={section.title} defaultOpen={section.defaultOpen ?? true}>
        <div className='flex flex-col gap-1.5'>
          {section.items.map(item => renderItem(item, onAction))}
        </div>
      </SidebarCategory>
    </div>
  );
};
