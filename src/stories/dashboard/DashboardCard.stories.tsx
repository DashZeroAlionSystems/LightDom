import type { Meta, StoryObj } from '@storybook/react';
import DashboardCard from '../../../components/ui/dashboard/atoms/DashboardCard';
import { 
  ThunderboltOutlined, 
  DatabaseOutlined, 
  RocketOutlined 
} from '@ant-design/icons';
import { Button } from 'antd';

/**
 * # DashboardCard
 * 
 * A Material Design 3.0 compliant card component for dashboard layouts.
 * 
 * ## Design Principles
 * - **Elevation**: Uses Material elevation system (1-5) for depth perception
 * - **Spacing**: Consistent internal padding using Material spacing scale
 * - **Typography**: Material Design type scale for titles and subtitles
 * - **Motion**: Smooth transitions and hover effects
 * 
 * ## When to Use
 * - To group related dashboard content
 * - To display statistics or metrics
 * - To contain charts, tables, or forms
 * - As a clickable navigation element
 * 
 * ## Accessibility
 * - Keyboard navigable when clickable
 * - Proper heading hierarchy
 * - Sufficient color contrast
 */
const meta = {
  title: 'Dashboard/Atoms/DashboardCard',
  component: DashboardCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Material Design 3.0 card component for dashboard layouts with elevation, spacing, and interactive states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    elevation: {
      control: { type: 'range', min: 1, max: 5, step: 1 },
      description: 'Material elevation level (1-5)',
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
      description: 'Card size preset',
    },
    hoverable: {
      control: 'boolean',
      description: 'Enable hover effects',
    },
    bordered: {
      control: 'boolean',
      description: 'Show card border',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading skeleton',
    },
  },
} satisfies Meta<typeof DashboardCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default card with title and content
 */
export const Default: Story = {
  args: {
    title: 'Dashboard Card',
    children: <p>This is the card content. It can contain any React component.</p>,
  },
};

/**
 * Card with icon, title, and subtitle
 */
export const WithIcon: Story = {
  args: {
    title: 'Performance Metrics',
    subtitle: 'Real-time system statistics',
    icon: <ThunderboltOutlined />,
    children: <p>Your performance data goes here</p>,
  },
};

/**
 * Card with actions in the header
 */
export const WithActions: Story = {
  args: {
    title: 'Database Status',
    icon: <DatabaseOutlined />,
    actions: (
      <Button size="small" type="link">
        View Details
      </Button>
    ),
    children: <p>Database connection status and metrics</p>,
  },
};

/**
 * Clickable card (useful for navigation)
 */
export const Clickable: Story = {
  args: {
    title: 'Neural Network',
    subtitle: 'Click to manage',
    icon: <RocketOutlined />,
    onClick: () => alert('Card clicked!'),
    children: <p>Navigate to neural network dashboard</p>,
  },
};

/**
 * Small size card
 */
export const SmallSize: Story = {
  args: {
    title: 'Compact Card',
    size: 'small',
    children: <p>Small card for compact layouts</p>,
  },
};

/**
 * Large size card
 */
export const LargeSize: Story = {
  args: {
    title: 'Large Card',
    subtitle: 'More space for content',
    size: 'large',
    icon: <DatabaseOutlined />,
    children: <p>Large card with more padding and prominent typography</p>,
  },
};

/**
 * Card with high elevation
 */
export const HighElevation: Story = {
  args: {
    title: 'Elevated Card',
    subtitle: 'Maximum depth',
    elevation: 5,
    children: <p>Card with maximum elevation for emphasis</p>,
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    title: 'Loading Data',
    loading: true,
  },
};

/**
 * Bordered style
 */
export const Bordered: Story = {
  args: {
    title: 'Bordered Card',
    bordered: true,
    children: <p>Card with visible border</p>,
  },
};

/**
 * Non-hoverable card (for static content)
 */
export const NonHoverable: Story = {
  args: {
    title: 'Static Card',
    hoverable: false,
    children: <p>This card does not respond to hover</p>,
  },
};
