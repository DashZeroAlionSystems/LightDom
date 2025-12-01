import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { AdminSidebar } from '@/components/admin/sidebar/AdminSidebar';
import {
  adminSidebarDefaults,
  getAdminSidebarSections,
} from '@/config/adminSidebarConfig';

const defaultSections = getAdminSidebarSections({
  featureToggles: adminSidebarDefaults.featureToggles,
});

const meta = {
  title: 'Navigation/AdminSidebar',
  component: AdminSidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The **AdminSidebar** renders the configuration-driven navigation surface used across the LightDom admin suite.
It composes Material-inspired atoms, action triggers, and feature toggles to provide a minimal-yet-powerful
side navigation experience.

Key capabilities:

- **Configuration first**: sections resolved from adminSidebarConfig.ts
- **Action pipelines**: built-in triggers for page and dashboard creation
- **Feature toggles**: runtime enable/disable via include/exclude arrays
- **Lucide icons**: resolved dynamically with graceful fallbacks
- **Profile footer**: consistent auth-aware footer controls
        `,
      },
    },
  },
  decorators: [
    Story => (
      <div className='flex h-screen bg-background'>
        <Story />
      </div>
    ),
  ],
  args: {
    sections: defaultSections,
    user: {
      name: 'Alicia Navarro',
      email: 'alicia@lightdom.xyz',
      role: 'Administrator',
      avatar: 'https://avatars.dicebear.com/api/initials/AN.svg',
    },
    notificationCount: 3,
    onCreatePage: action('create-page'),
    onCreateDashboard: action('create-dashboard'),
    onSettingsClick: action('settings'),
    onNotificationsClick: action('notifications'),
    onLogoutClick: action('logout'),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AdminSidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFeatureToggles: Story = {
  args: {
    sections: getAdminSidebarSections({
      featureToggles: {
        ...adminSidebarDefaults.featureToggles,
        analytics: false,
        automation: true,
      },
    }),
  },
  parameters: {
    docs: {
      description: {
        story: 'Feature toggles can disable entire sections at runtime, keeping the navigation minimal when certain systems are offline.',
      },
    },
  },
};

export const MinimalSurface: Story = {
  args: {
    sections: getAdminSidebarSections({
      include: ['overview.analytics', 'build.playbooks'],
      featureToggles: {
        ...adminSidebarDefaults.featureToggles,
        automation: false,
        pipelines: true,
      },
    }),
    notificationCount: 0,
  },
  parameters: {
    docs: {
      description: {
        story: 'Use include/exclude filters to curate specific navigation atoms for purpose-built admin workspaces.',
      },
    },
  },
};
