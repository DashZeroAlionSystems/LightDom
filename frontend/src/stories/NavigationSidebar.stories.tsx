import type { Meta, StoryObj } from '@storybook/react';
import { NavigationSidebar } from '../components/NavigationSidebar';

/**
 * NavigationSidebar Component
 *
 * A comprehensive, collapsible navigation sidebar with categorized menu items,
 * user profile section, and smooth transitions. Built with atomic components
 * for maximum reusability.
 */
const meta = {
  title: 'Navigation/NavigationSidebar',
  component: NavigationSidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
The NavigationSidebar is a full-featured navigation component that includes:

- **Collapsible Design**: Toggle between expanded and collapsed states
- **Categorized Navigation**: Organized menu items in logical groups
- **User Profile**: Integrated user section with actions
- **Responsive**: Adapts to different screen sizes
- **Accessible**: Keyboard navigation and ARIA labels
- **Smooth Transitions**: Animated state changes

## Usage

\`\`\`tsx
import { NavigationSidebar } from '@/components/NavigationSidebar';

function App() {
  return (
    <div className="flex min-h-screen">
      <NavigationSidebar />
      <main className="flex-1">
        {/* Your content */}
      </main>
    </div>
  );
}
\`\`\`

## Atomic Components

The sidebar is built from smaller, reusable atoms:

- **SidebarContainer**: Wrapper with collapse state management
- **SidebarHeader**: Logo, brand name, and toggle button
- **SidebarNavItem**: Individual navigation links
- **SidebarCategory**: Collapsible category sections
- **SidebarProfile**: User profile with actions
- **SidebarChatItem**: Chat/session items
- **SidebarDivider**: Visual separators
- **SidebarIcon**: Icon wrapper with variants
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
  tags: ['autodocs'],
} satisfies Meta<typeof NavigationSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default expanded sidebar with all navigation items and user profile
 */
export const Default: Story = {};

/**
 * The sidebar can be controlled programmatically or by user interaction
 */
export const WithInteraction: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Click the toggle button in the header to collapse/expand the sidebar.',
      },
    },
  },
};
