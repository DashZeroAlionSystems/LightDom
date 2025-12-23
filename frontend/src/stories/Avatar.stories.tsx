import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Avatar } from '@/components/ui/Avatar';

/**
 * # Avatar Component
 * 
 * Material Design 3 avatar for user profile images with
 * fallback initials and status indicators.
 * 
 * ## Styleguide Rules
 * - Use consistent sizes within context (e.g., list items)
 * - Always provide alt text or name for accessibility
 * - Status indicators should be clearly visible
 * - Use initials as fallback when no image available
 */
const meta: Meta<typeof Avatar> = {
  title: 'DESIGN SYSTEM/Atoms/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Avatar size',
    },
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'tertiary', 'surface'],
      description: 'Color variant for fallback background',
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'offline', 'away', 'busy'],
      description: 'Status indicator',
    },
    name: {
      control: 'text',
      description: 'Name to generate initials from',
    },
    src: {
      control: 'text',
      description: 'Image source URL',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic
// ============================================================================

export const Default: Story = {
  args: {
    name: 'John Doe',
  },
};

export const WithImage: Story = {
  args: {
    src: 'https://avatars.githubusercontent.com/u/1?v=4',
    name: 'GitHub User',
  },
};

export const WithInitials: Story = {
  args: {
    name: 'Jane Smith',
  },
};

export const WithCustomInitials: Story = {
  args: {
    initials: 'AB',
  },
};

export const NoNameOrImage: Story = {
  args: {},
};

// ============================================================================
// Sizes
// ============================================================================

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar size="sm" name="SM" />
      <Avatar size="md" name="MD" />
      <Avatar size="lg" name="LG" />
      <Avatar size="xl" name="XL" />
      <Avatar size="2xl" name="2XL" />
    </div>
  ),
};

export const SizesWithImages: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar size="sm" src="https://avatars.githubusercontent.com/u/1?v=4" />
      <Avatar size="md" src="https://avatars.githubusercontent.com/u/2?v=4" />
      <Avatar size="lg" src="https://avatars.githubusercontent.com/u/3?v=4" />
      <Avatar size="xl" src="https://avatars.githubusercontent.com/u/4?v=4" />
      <Avatar size="2xl" src="https://avatars.githubusercontent.com/u/5?v=4" />
    </div>
  ),
};

// ============================================================================
// Variants
// ============================================================================

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar variant="default" name="John Doe" />
      <Avatar variant="secondary" name="Jane Smith" />
      <Avatar variant="tertiary" name="Bob Wilson" />
      <Avatar variant="surface" name="Alice Brown" />
    </div>
  ),
};

// ============================================================================
// Status Indicators
// ============================================================================

export const WithStatus: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <Avatar name="Online User" status="online" />
        <span className="text-xs mt-1 block">Online</span>
      </div>
      <div className="text-center">
        <Avatar name="Away User" status="away" />
        <span className="text-xs mt-1 block">Away</span>
      </div>
      <div className="text-center">
        <Avatar name="Busy User" status="busy" />
        <span className="text-xs mt-1 block">Busy</span>
      </div>
      <div className="text-center">
        <Avatar name="Offline User" status="offline" />
        <span className="text-xs mt-1 block">Offline</span>
      </div>
    </div>
  ),
};

export const StatusWithSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar size="sm" name="SM" status="online" />
      <Avatar size="md" name="MD" status="online" />
      <Avatar size="lg" name="LG" status="online" />
      <Avatar size="xl" name="XL" status="online" />
      <Avatar size="2xl" name="2XL" status="online" />
    </div>
  ),
};

// ============================================================================
// Avatar Groups
// ============================================================================

export const AvatarGroup: Story = {
  render: () => (
    <div className="flex -space-x-3">
      <Avatar 
        src="https://avatars.githubusercontent.com/u/1?v=4" 
        className="ring-2 ring-background" 
      />
      <Avatar 
        src="https://avatars.githubusercontent.com/u/2?v=4" 
        className="ring-2 ring-background" 
      />
      <Avatar 
        src="https://avatars.githubusercontent.com/u/3?v=4" 
        className="ring-2 ring-background" 
      />
      <Avatar 
        initials="+5" 
        variant="surface" 
        className="ring-2 ring-background" 
      />
    </div>
  ),
};

export const AvatarGroupWithNames: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar name="Alice Johnson" className="ring-2 ring-background" />
      <Avatar name="Bob Smith" variant="secondary" className="ring-2 ring-background" />
      <Avatar name="Carol White" variant="tertiary" className="ring-2 ring-background" />
      <Avatar name="David Brown" className="ring-2 ring-background" />
    </div>
  ),
};

// ============================================================================
// In Context
// ============================================================================

export const UserList: Story = {
  render: () => (
    <div className="space-y-4 max-w-sm">
      {[
        { name: 'Alice Johnson', role: 'Designer', status: 'online' as const },
        { name: 'Bob Smith', role: 'Developer', status: 'away' as const },
        { name: 'Carol White', role: 'Manager', status: 'busy' as const },
        { name: 'David Brown', role: 'Analyst', status: 'offline' as const },
      ].map((user) => (
        <div key={user.name} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
          <Avatar name={user.name} status={user.status} />
          <div>
            <p className="font-medium text-on-surface">{user.name}</p>
            <p className="text-sm text-on-surface-variant">{user.role}</p>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const CommentThread: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div className="flex gap-3">
        <Avatar name="Alice Johnson" size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">Alice Johnson</span>
            <span className="text-sm text-on-surface-variant">2 hours ago</span>
          </div>
          <p className="mt-1 text-on-surface">
            This design system is looking great! Love the attention to detail.
          </p>
        </div>
      </div>
      <div className="flex gap-3 pl-12">
        <Avatar name="Bob Smith" size="md" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">Bob Smith</span>
            <span className="text-sm text-on-surface-variant">1 hour ago</span>
          </div>
          <p className="mt-1 text-on-surface">
            Agreed! The component API is really intuitive.
          </p>
        </div>
      </div>
    </div>
  ),
};

// ============================================================================
// All Variants Showcase
// ============================================================================

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Sizes</h3>
        <div className="flex items-end gap-4">
          <Avatar size="sm" name="Small" />
          <Avatar size="md" name="Medium" />
          <Avatar size="lg" name="Large" />
          <Avatar size="xl" name="XLarge" />
          <Avatar size="2xl" name="XXL" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Color Variants</h3>
        <div className="flex items-center gap-4">
          <Avatar variant="default" name="Default" />
          <Avatar variant="secondary" name="Secondary" />
          <Avatar variant="tertiary" name="Tertiary" />
          <Avatar variant="surface" name="Surface" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Status Indicators</h3>
        <div className="flex items-center gap-4">
          <Avatar name="Online" status="online" />
          <Avatar name="Away" status="away" />
          <Avatar name="Busy" status="busy" />
          <Avatar name="Offline" status="offline" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Avatar Group</h3>
        <div className="flex -space-x-3">
          <Avatar name="User 1" className="ring-2 ring-background" />
          <Avatar name="User 2" variant="secondary" className="ring-2 ring-background" />
          <Avatar name="User 3" variant="tertiary" className="ring-2 ring-background" />
          <Avatar initials="+3" variant="surface" className="ring-2 ring-background" />
        </div>
      </div>
    </div>
  ),
};
