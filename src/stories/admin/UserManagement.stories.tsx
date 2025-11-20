/**
 * User Management Components - Storybook Stories
 * Interactive documentation and testing for user management UI
 */

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import UserList from '../../components/admin/UserList';
import UserDetail from '../../components/admin/UserDetail';
import UserForm from '../../components/admin/UserForm';
import UserManagementPage from '../../pages/admin/UserManagementPage';

// UserList Stories
export default {
  title: 'Admin/UserManagement/UserList',
  component: UserList,
  decorators: [
    (Story: any) => (
      <MemoryRouter>
        <div style={{ padding: '24px' }}>
          <Story />
        </div>
      </MemoryRouter>
    )
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'User list component with filtering, sorting, and pagination. Shows all users with their roles, plans, and status.'
      }
    }
  }
} as Meta<typeof UserList>;

type Story = StoryObj<typeof UserList>;

export const Default: Story = {
  args: {}
};

export const WithSelection: Story = {
  args: {
    onUserSelect: (user: any) => console.log('Selected user:', user),
    onCreateUser: () => console.log('Create user clicked')
  }
};

// UserDetail Stories
const userDetailMeta: Meta<typeof UserDetail> = {
  title: 'Admin/UserManagement/UserDetail',
  component: UserDetail,
  decorators: [
    (Story: any) => (
      <MemoryRouter>
        <div style={{ padding: '24px' }}>
          <Story />
        </div>
      </MemoryRouter>
    )
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Detailed view of a single user showing all profile information, statistics, and management options.'
      }
    }
  }
};

export const AdminUserDetail: Story = {
  ...userDetailMeta,
  args: {
    userId: '1'
  }
};

// UserForm Stories
const userFormMeta: Meta<typeof UserForm> = {
  title: 'Admin/UserManagement/UserForm',
  component: UserForm,
  decorators: [
    (Story: any) => (
      <MemoryRouter>
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          <Story />
        </div>
      </MemoryRouter>
    )
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Form for creating new users or editing existing ones. Supports all user fields, role and plan assignment.'
      }
    }
  }
};

export const CreateUserForm: Story = {
  ...userFormMeta,
  args: {
    onSuccess: (user: any) => console.log('User created:', user),
    onCancel: () => console.log('Create cancelled')
  }
};

export const EditUserForm: Story = {
  ...userFormMeta,
  args: {
    userId: '4',
    onSuccess: (user: any) => console.log('User updated:', user),
    onCancel: () => console.log('Edit cancelled')
  }
};

export const CreateAdminUser: Story = {
  ...userFormMeta,
  args: {
    initialData: {
      role_name: 'admin',
      plan_name: 'admin'
    },
    onSuccess: (user: any) => console.log('Admin created:', user),
    onCancel: () => console.log('Create cancelled')
  }
};

export const CreateDeepSeekUser: Story = {
  ...userFormMeta,
  args: {
    initialData: {
      role_name: 'deepseek',
      plan_name: 'deepseek',
      username: 'deepseek_bot'
    },
    onSuccess: (user: any) => console.log('DeepSeek user created:', user),
    onCancel: () => console.log('Create cancelled')
  }
};

// Full Page Stories
const userManagementPageMeta: Meta<typeof UserManagementPage> = {
  title: 'Admin/UserManagement/FullPage',
  component: UserManagementPage,
  decorators: [
    (Story: any) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    )
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete user management page with statistics, list view, detail view, and forms all integrated.'
      }
    }
  }
};

export const CompleteUserManagementPage: Story = {
  ...userManagementPageMeta
};
