import type { Meta, StoryObj } from '@storybook/react';
import * as LucideIcons from 'lucide-react';
import {
  SidebarCategory,
  SidebarChatItem,
  SidebarContainer,
  SidebarDivider,
  SidebarHeader,
  SidebarNavItem,
  SidebarProfile,
} from '../components/ui/sidebar';

/**
 * Sidebar Atomic Components
 *
 * Individual building blocks for creating custom sidebar layouts.
 * Each component is designed to be composable and reusable.
 */
const meta = {
  title: 'Navigation/Sidebar Atoms',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
These atomic components can be combined to create custom sidebar layouts:

## SidebarContainer
The root wrapper that provides collapse state management via context.

\`\`\`tsx
<SidebarContainer defaultCollapsed={false}>
  {/* sidebar content */}
</SidebarContainer>
\`\`\`

## SidebarHeader
Logo, brand name, and collapse toggle button.

\`\`\`tsx
<SidebarHeader
  brandName="LightDom"
  brandSubtitle="Platform"
/>
\`\`\`

## SidebarNavItem
Individual navigation link with icon, label, and optional badge.

\`\`\`tsx
<SidebarNavItem
  to="/dashboard"
  icon={<LayoutIcon />}
  label="Dashboard"
  description="Overview"
/>
\`\`\`

## SidebarCategory
Collapsible category section for organizing nav items.

\`\`\`tsx
<SidebarCategory title="Main" defaultOpen={true}>
  <SidebarNavItem ... />
  <SidebarNavItem ... />
</SidebarCategory>
\`\`\`

## SidebarProfile
User profile section with avatar, name, and action buttons.

\`\`\`tsx
<SidebarProfile
  user={{ name: 'John Doe', email: 'john@example.com' }}
  onSettingsClick={handleSettings}
  onLogoutClick={handleLogout}
/>
\`\`\`

## SidebarChatItem
Chat or session item with edit/delete actions.

\`\`\`tsx
<SidebarChatItem
  id="chat-1"
  title="Recent Chat"
  isActive={true}
  onClick={handleClick}
/>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Complete sidebar with all atom components
 */
export const CompleteExample: Story = {
  render: () => (
    <div className='flex h-screen bg-background'>
      <SidebarContainer>
        <SidebarHeader brandName='LightDom' brandSubtitle='Platform' />

        <div className='flex-1 overflow-y-auto px-3 py-4 space-y-1'>
          <SidebarCategory title='Main' defaultOpen={true}>
            <SidebarNavItem
              to='/dashboard'
              icon={<LucideIcons.Layout className='w-5 h-5' />}
              label='Dashboard'
              description='Overview and stats'
            />
            <SidebarNavItem
              to='/files'
              icon={<LucideIcons.FolderOpen className='w-5 h-5' />}
              label='Files'
              description='File management'
            />
          </SidebarCategory>

          <SidebarDivider />

          <SidebarCategory title='Chats' defaultOpen={true}>
            <SidebarChatItem
              id='chat-1'
              title='Project Discussion'
              timestamp={new Date()}
              isActive={true}
            />
            <SidebarChatItem
              id='chat-2'
              title='Team Meeting Notes'
              timestamp={new Date(Date.now() - 86400000)}
            />
          </SidebarCategory>
        </div>

        <SidebarProfile
          user={{
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Administrator',
          }}
          onSettingsClick={() => alert('Settings clicked')}
          onLogoutClick={() => alert('Logout clicked')}
          notificationCount={3}
        />
      </SidebarContainer>
    </div>
  ),
};

/**
 * Collapsed sidebar showing compact view
 */
export const CollapsedView: Story = {
  render: () => (
    <div className='flex h-screen bg-background'>
      <SidebarContainer defaultCollapsed={true}>
        <SidebarHeader brandName='LightDom' brandSubtitle='Platform' />

        <div className='flex-1 overflow-y-auto px-3 py-4 space-y-1'>
          <SidebarNavItem
            to='/dashboard'
            icon={<LucideIcons.Layout className='w-5 h-5' />}
            label='Dashboard'
          />
          <SidebarNavItem
            to='/files'
            icon={<LucideIcons.FolderOpen className='w-5 h-5' />}
            label='Files'
          />
        </div>

        <SidebarProfile
          user={{
            name: 'John Doe',
            email: 'john@example.com',
          }}
        />
      </SidebarContainer>
    </div>
  ),
};

/**
 * Navigation items with different states
 */
export const NavigationItems: Story = {
  render: () => (
    <div className='flex h-screen bg-background'>
      <SidebarContainer>
        <SidebarHeader />

        <div className='flex-1 overflow-y-auto px-3 py-4 space-y-2'>
          <SidebarNavItem
            to='/active'
            icon={<LucideIcons.Home className='w-5 h-5' />}
            label='Active Item'
            description='Currently selected'
          />
          <SidebarNavItem
            to='/other'
            icon={<LucideIcons.FileText className='w-5 h-5' />}
            label='Regular Item'
            description='Not selected'
          />
          <SidebarNavItem
            to='/badge'
            icon={<LucideIcons.Bell className='w-5 h-5' />}
            label='With Badge'
            badge={<span className='px-1.5 py-0.5 text-xs bg-red-500 text-white rounded'>3</span>}
          />
        </div>
      </SidebarContainer>
    </div>
  ),
};

/**
 * Chat items with actions
 */
export const ChatItems: Story = {
  render: () => (
    <div className='flex h-screen bg-background'>
      <SidebarContainer>
        <SidebarHeader />

        <div className='flex-1 overflow-y-auto px-3 py-4 space-y-2'>
          <SidebarChatItem
            id='1'
            title='Active Chat Session'
            timestamp={new Date()}
            isActive={true}
            onEdit={() => alert('Edit')}
            onDelete={() => alert('Delete')}
          />
          <SidebarChatItem
            id='2'
            title='Previous Conversation'
            timestamp={new Date(Date.now() - 86400000)}
            onEdit={() => alert('Edit')}
            onDelete={() => alert('Delete')}
          />
          <SidebarChatItem id='3' title='Older Chat' timestamp={new Date(Date.now() - 172800000)} />
        </div>
      </SidebarContainer>
    </div>
  ),
};

/**
 * Collapsible categories
 */
export const Categories: Story = {
  render: () => (
    <div className='flex h-screen bg-background'>
      <SidebarContainer>
        <SidebarHeader />

        <div className='flex-1 overflow-y-auto px-3 py-4 space-y-2'>
          <SidebarCategory title='Main' defaultOpen={true}>
            <SidebarNavItem
              to='/dashboard'
              icon={<LucideIcons.Layout className='w-5 h-5' />}
              label='Dashboard'
            />
            <SidebarNavItem
              to='/files'
              icon={<LucideIcons.FolderOpen className='w-5 h-5' />}
              label='Files'
            />
          </SidebarCategory>

          <SidebarCategory title='Advanced' defaultOpen={false}>
            <SidebarNavItem
              to='/settings'
              icon={<LucideIcons.Settings className='w-5 h-5' />}
              label='Settings'
            />
            <SidebarNavItem
              to='/admin'
              icon={<LucideIcons.Shield className='w-5 h-5' />}
              label='Admin'
            />
          </SidebarCategory>
        </div>
      </SidebarContainer>
    </div>
  ),
};
