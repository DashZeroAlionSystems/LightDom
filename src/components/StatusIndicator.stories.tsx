/**
 * StatusIndicator Stories
 * 
 * Storybook documentation for the StatusIndicator component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { StatusIndicator, ServiceStatusGrid, StatusIndicatorWithWorkflow } from './StatusIndicator';
import { RocketOutlined } from '@ant-design/icons';

const meta: Meta<typeof StatusIndicator> = {
  title: 'Components/StatusIndicator',
  component: StatusIndicator,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# StatusIndicator

Animated status indicator component with anime.js animations for showing service status.

## Features
- Multiple status states: success, loading, error, warning, idle, syncing
- Smooth anime.js animations
- Style guide driven styling
- Tooltip support
- Badge indicators
- Customizable sizes

## Usage

\`\`\`tsx
import { StatusIndicator } from './components/StatusIndicator';

<StatusIndicator 
  status="success" 
  serviceName="API Server" 
  message="All systems operational"
/>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['success', 'loading', 'error', 'warning', 'idle', 'syncing'],
      description: 'Current status state',
    },
    size: {
      control: 'select',
      options: ['small', 'default', 'large'],
      description: 'Size of the indicator',
    },
    showBadge: {
      control: 'boolean',
      description: 'Show badge dot',
    },
    showTooltip: {
      control: 'boolean',
      description: 'Show tooltip on hover',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusIndicator>;

/**
 * Default success state
 */
export const Success: Story = {
  args: {
    status: 'success',
    serviceName: 'API Server',
    message: 'All systems operational',
  },
};

/**
 * Loading state with spinning animation
 */
export const Loading: Story = {
  args: {
    status: 'loading',
    serviceName: 'Data Pipeline',
    message: 'Processing data...',
  },
};

/**
 * Error state with shake animation
 */
export const Error: Story = {
  args: {
    status: 'error',
    serviceName: 'Database',
    message: 'Connection failed',
  },
};

/**
 * Warning state with pulse animation
 */
export const Warning: Story = {
  args: {
    status: 'warning',
    serviceName: 'Cache',
    message: 'Memory usage high',
  },
};

/**
 * Idle state
 */
export const Idle: Story = {
  args: {
    status: 'idle',
    serviceName: 'Scheduler',
    message: 'Waiting for jobs',
  },
};

/**
 * Syncing state with rotation animation
 */
export const Syncing: Story = {
  args: {
    status: 'syncing',
    serviceName: 'N8N Workflow',
    message: 'Syncing configuration...',
  },
};

/**
 * Small size variant
 */
export const SmallSize: Story = {
  args: {
    status: 'success',
    serviceName: 'API',
    size: 'small',
  },
};

/**
 * Large size variant
 */
export const LargeSize: Story = {
  args: {
    status: 'success',
    serviceName: 'Main Service',
    message: 'Running smoothly',
    size: 'large',
  },
};

/**
 * With badge indicator
 */
export const WithBadge: Story = {
  args: {
    status: 'loading',
    serviceName: 'Workflow Engine',
    showBadge: true,
  },
};

/**
 * With custom icon
 */
export const CustomIcon: Story = {
  args: {
    status: 'success',
    serviceName: 'Deployment',
    message: 'Deployed successfully',
    customIcon: <RocketOutlined />,
  },
};

/**
 * Clickable indicator
 */
export const Clickable: Story = {
  args: {
    status: 'warning',
    serviceName: 'Neural Network',
    message: 'Click for details',
    onClick: () => alert('Status indicator clicked!'),
  },
};

/**
 * All statuses showcase
 */
export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <StatusIndicator status="success" serviceName="Success" message="Operation completed" />
      <StatusIndicator status="loading" serviceName="Loading" message="Processing..." />
      <StatusIndicator status="error" serviceName="Error" message="Operation failed" />
      <StatusIndicator status="warning" serviceName="Warning" message="Action required" />
      <StatusIndicator status="idle" serviceName="Idle" message="Waiting..." />
      <StatusIndicator status="syncing" serviceName="Syncing" message="Updating..." />
    </div>
  ),
};

/**
 * Service Status Grid
 */
export const StatusGrid: Story = {
  render: () => (
    <ServiceStatusGrid
      services={[
        { id: '1', name: 'API Server', status: 'success', message: 'Running' },
        { id: '2', name: 'Database', status: 'success', message: 'Connected' },
        { id: '3', name: 'Cache', status: 'warning', message: 'High memory' },
        { id: '4', name: 'Scheduler', status: 'loading', message: 'Processing jobs' },
        { id: '5', name: 'N8N Workflows', status: 'syncing', message: 'Syncing' },
        { id: '6', name: 'DeepSeek API', status: 'success', message: 'Available' },
      ]}
      onServiceClick={(service) => console.log('Clicked:', service)}
      columns={3}
    />
  ),
};

/**
 * N8N Workflow Integration
 * 
 * Shows status indicator connected to n8n workflow status
 */
export const WorkflowIntegration: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
      <h3>Workflow Status Indicators</h3>
      <p style={{ color: '#666', marginBottom: '16px' }}>
        These indicators show real-time status of n8n workflows generated from linked schemas.
      </p>
      
      <ServiceStatusGrid
        services={[
          { id: 'wf1', name: 'Schema Processing', status: 'success', message: 'Completed' },
          { id: 'wf2', name: 'Data Pipeline', status: 'loading', message: 'Processing' },
          { id: 'wf3', name: 'DeepSeek Analysis', status: 'syncing', message: 'Generating' },
        ]}
        columns={1}
      />
    </div>
  ),
};

/**
 * Dark mode compatible
 */
export const DarkModeCompatible: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: () => (
    <div style={{ 
      background: '#1f1f1f', 
      padding: '20px', 
      borderRadius: '8px' 
    }}>
      <ServiceStatusGrid
        services={[
          { id: '1', name: 'API Server', status: 'success' },
          { id: '2', name: 'Database', status: 'loading' },
          { id: '3', name: 'Cache', status: 'error' },
        ]}
        columns={1}
      />
    </div>
  ),
};
