import type { Meta, StoryObj } from '@storybook/react';
import DashboardStat from '../../../components/ui/dashboard/atoms/DashboardStat';
import { 
  UserOutlined, 
  DollarOutlined, 
  ShoppingCartOutlined,
  RiseOutlined,
} from '@ant-design/icons';

/**
 * # DashboardStat
 * 
 * A Material Design 3.0 statistic display component for dashboards.
 * 
 * ## Design Principles
 * - **Typography**: Clear hierarchy with large values and small labels
 * - **Color**: Semantic colors for trends (green=up, red=down)
 * - **Icons**: Visual anchors for quick recognition
 * - **Spacing**: Consistent vertical rhythm
 * 
 * ## When to Use
 * - To display key performance indicators (KPIs)
 * - To show metrics with trends
 * - To highlight important numbers
 * - In stat grid layouts
 * 
 * ## Accessibility
 * - Semantic HTML structure
 * - Screen reader friendly
 * - Color not sole indicator (uses icons too)
 */
const meta = {
  title: 'Dashboard/Atoms/DashboardStat',
  component: DashboardStat,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Material Design 3.0 statistic component with trend indicators and formatting options.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    trend: {
      control: { type: 'radio' },
      options: ['up', 'down', 'neutral'],
      description: 'Trend direction (affects color)',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading skeleton',
    },
    precision: {
      control: { type: 'number', min: 0, max: 4 },
      description: 'Decimal places for numbers',
    },
  },
} satisfies Meta<typeof DashboardStat>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic statistic with just title and value
 */
export const Default: Story = {
  args: {
    title: 'Total Users',
    value: 1234,
  },
};

/**
 * Stat with icon for visual recognition
 */
export const WithIcon: Story = {
  args: {
    title: 'Active Users',
    value: 856,
    icon: <UserOutlined />,
  },
};

/**
 * Stat showing upward trend (positive)
 */
export const TrendingUp: Story = {
  args: {
    title: 'Revenue',
    value: 12450,
    icon: <DollarOutlined />,
    prefix: '$',
    trend: 'up',
    trendValue: '+12.5%',
    description: 'vs last month',
  },
};

/**
 * Stat showing downward trend (negative)
 */
export const TrendingDown: Story = {
  args: {
    title: 'Bounce Rate',
    value: 34.2,
    suffix: '%',
    trend: 'down',
    trendValue: '-2.3%',
    description: 'improvement',
  },
};

/**
 * Stat with neutral trend
 */
export const TrendingNeutral: Story = {
  args: {
    title: 'Orders',
    value: 423,
    icon: <ShoppingCartOutlined />,
    trend: 'neutral',
    description: 'stable',
  },
};

/**
 * Large currency value with formatting
 */
export const Currency: Story = {
  args: {
    title: 'Total Sales',
    value: 1234567.89,
    prefix: '$',
    icon: <DollarOutlined />,
    precision: 2,
    groupSeparator: ',',
    trend: 'up',
    trendValue: '+$125K',
    description: 'this quarter',
  },
};

/**
 * Percentage with precision
 */
export const Percentage: Story = {
  args: {
    title: 'Conversion Rate',
    value: 3.456,
    suffix: '%',
    precision: 2,
    icon: <RiseOutlined />,
    trend: 'up',
    trendValue: '+0.5%',
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    title: 'Loading...',
    value: 0,
    loading: true,
  },
};

/**
 * With description only (no trend)
 */
export const WithDescription: Story = {
  args: {
    title: 'Total Projects',
    value: 42,
    description: 'across all teams',
  },
};

/**
 * Large number with thousands separator
 */
export const LargeNumber: Story = {
  args: {
    title: 'Page Views',
    value: 1234567,
    groupSeparator: ',',
    trend: 'up',
    trendValue: '+234K',
    description: 'this month',
  },
};
