import { SidebarContainer, SidebarHeader, SidebarProfile } from '@/components/ui/sidebar';
import type {
  AdminSidebarActionConfig,
  AdminSidebarFeatureToggles,
  AdminSidebarSectionConfig,
} from '@/config/adminSidebarConfig';
import { adminSidebarDefaults, getAdminSidebarSections } from '@/config/adminSidebarConfig';
import { cn } from '@/lib/utils';
import React, { useMemo } from 'react';
import { AdminSidebarSection } from './AdminSidebarSection';

const ACTION_HANDLERS: Record<string, keyof AdminSidebarEventHandlers> = {
  'create-page': 'onCreatePage',
  'create-dashboard': 'onCreateDashboard',
};

export interface AdminSidebarEventHandlers {
  onCreatePage?: () => void;
  onCreateDashboard?: () => void;
}

export interface AdminSidebarProps extends AdminSidebarEventHandlers {
  brandName?: string;
  brandSubtitle?: string;
  sections?: AdminSidebarSectionConfig[];
  featureToggles?: AdminSidebarFeatureToggles;
  include?: string[];
  exclude?: string[];
  defaultCollapsed?: boolean;
  className?: string;
  contentClassName?: string;
  user?: {
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
  };
  notificationCount?: number;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  onLogoutClick?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  brandName = 'LightDom',
  brandSubtitle = 'Admin Suite',
  sections,
  featureToggles = adminSidebarDefaults.featureToggles,
  include,
  exclude,
  defaultCollapsed,
  className,
  contentClassName,
  user,
  notificationCount,
  onSettingsClick,
  onNotificationsClick,
  onLogoutClick,
  ...eventHandlers
}) => {
  const resolvedSections = useMemo(() => {
    if (sections && sections.length > 0) {
      return sections;
    }

    return getAdminSidebarSections({
      featureToggles,
      include,
      exclude,
    });
  }, [sections, featureToggles, include, exclude]);

  const handleAction = (item: AdminSidebarActionConfig) => {
    const handlerName = ACTION_HANDLERS[item.actionId];
    const handler = handlerName ? eventHandlers[handlerName] : undefined;
    handler?.();
  };

  return (
    <SidebarContainer
      defaultCollapsed={defaultCollapsed}
      className={cn('bg-surface-elevated', className)}
    >
      <SidebarHeader brandName={brandName} brandSubtitle={brandSubtitle} />

      <div className={cn('flex-1 overflow-y-auto px-3 py-4 space-y-4', contentClassName)}>
        {resolvedSections.map((section, index) => (
          <AdminSidebarSection
            key={section.id}
            section={section}
            onAction={handleAction}
            showDivider={index > 0}
          />
        ))}
      </div>

      <SidebarProfile
        user={user}
        notificationCount={notificationCount}
        onSettingsClick={onSettingsClick}
        onNotificationsClick={onNotificationsClick}
        onLogoutClick={onLogoutClick}
      />
    </SidebarContainer>
  );
};
