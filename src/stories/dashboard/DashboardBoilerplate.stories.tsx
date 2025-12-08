import type { Meta, StoryObj } from '@storybook/react';
import DashboardBoilerplate from '../../components/ui/dashboard/DashboardBoilerplate';
import { DashboardCard } from '../../components/ui/dashboard/atoms';
import { 
  ExperimentOutlined, 
  DatabaseOutlined, 
  RocketOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Table, Button } from 'antd';

/**
 * # DashboardBoilerplate
 * 
 * A complete Material Design 3.0 dashboard template.
 * 
 * ## Features
 * - Automatic header with breadcrumbs
 * - Stats grid layout
 * - Loading and error states
 * - API integration support
 * - Standard CRUD actions
 * - Responsive design
 * 
 * ## When to Use
 * - Creating new category dashboards
 * - Building admin panels
 * - Displaying data with statistics
 * - Implementing CRUD interfaces
 */
const meta = {
  title: 'Dashboard/Templates/DashboardBoilerplate',
  component: DashboardBoilerplate,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Complete Material Design 3.0 dashboard template with header, stats, and content areas.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardBoilerplate>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleStats = [
  {
    title: 'Total Items',
    value: 1234,
    icon: <DatabaseOutlined />,
    trend: 'up' as const,
    trendValue: '+12%',
    description: 'vs last month',
  },
  {
    title: 'Active',
    value: 856,
    icon: <ThunderboltOutlined />,
    trend: 'up' as const,
    trendValue: '+5',
    description: 'Currently active',
  },
  {
    title: 'Processing',
    value: 42,
    icon: <RocketOutlined />,
    description: 'In progress',
  },
  {
    title: 'Success Rate',
    value: '94.2%',
    icon: <ExperimentOutlined />,
    trend: 'up' as const,
    trendValue: '+2.1%',
    description: 'Performance',
  },
];

const sampleColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Created',
    dataIndex: 'created',
    key: 'created',
  },
];

const sampleData = [
  { key: '1', name: 'Item 1', status: 'Active', created: '2024-01-01' },
  { key: '2', name: 'Item 2', status: 'Active', created: '2024-01-02' },
  { key: '3', name: 'Item 3', status: 'Inactive', created: '2024-01-03' },
];

/**
 * Complete dashboard with all features
 */
export const Complete: Story = {
  args: {
    categoryId: 'example',
    categoryName: 'examples',
    categoryDisplayName: 'Example Dashboard',
    categoryIcon: <ExperimentOutlined />,
    categoryDescription: 'A complete example dashboard with all features',
    breadcrumbs: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Example' },
    ],
    stats: sampleStats,
    children: (
      <DashboardCard title="Data Table" icon={<DatabaseOutlined />}>
        <Table columns={sampleColumns} dataSource={sampleData} />
      </DashboardCard>
    ),
  },
};

/**
 * Dashboard with tabs
 */
export const WithTabs: Story = {
  args: {
    categoryId: 'example',
    categoryName: 'examples',
    categoryDisplayName: 'Tabbed Dashboard',
    categoryIcon: <DatabaseOutlined />,
    categoryDescription: 'Dashboard with multiple tabs',
    tabs: [
      { key: 'overview', label: 'Overview' },
      { key: 'details', label: 'Details' },
      { key: 'settings', label: 'Settings' },
    ],
    activeTab: 'overview',
    stats: sampleStats,
    children: <div>Tab content goes here</div>,
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    categoryId: 'example',
    categoryName: 'examples',
    categoryDisplayName: 'Loading Dashboard',
    categoryIcon: <DatabaseOutlined />,
    loading: true,
  },
};

/**
 * Error state
 */
export const Error: Story = {
  args: {
    categoryId: 'example',
    categoryName: 'examples',
    categoryDisplayName: 'Error Dashboard',
    categoryIcon: <DatabaseOutlined />,
    error: 'Failed to load dashboard data. Please try again.',
  },
};

/**
 * Minimal dashboard (no stats)
 */
export const Minimal: Story = {
  args: {
    categoryId: 'example',
    categoryName: 'examples',
    categoryDisplayName: 'Minimal Dashboard',
    categoryIcon: <DatabaseOutlined />,
    categoryDescription: 'A minimal dashboard without stats',
    children: (
      <DashboardCard>
        <p>Simple content without statistics</p>
      </DashboardCard>
    ),
  },
};

/**
 * Dashboard with custom actions
 */
export const WithCustomActions: Story = {
  args: {
    categoryId: 'example',
    categoryName: 'examples',
    categoryDisplayName: 'Custom Actions',
    categoryIcon: <RocketOutlined />,
    stats: sampleStats.slice(0, 2),
    customActions: (
      <>
        <Button type="primary">Custom Action 1</Button>
        <Button>Custom Action 2</Button>
      </>
    ),
    children: <div>Content with custom actions</div>,
  },
};
