/**
 * Storybook Stories for RAG Connection Status Component
 * 
 * Demonstrates the RAG connection status indicator in various states
 */

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import RagConnectionStatus from '../components/RagConnectionStatus';

const meta: Meta<typeof RagConnectionStatus> = {
  title: 'Components/RAG/ConnectionStatus',
  component: RagConnectionStatus,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays the real-time connection status and health of the RAG service with automatic monitoring and retry capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    showDetails: {
      control: 'boolean',
      description: 'Show detailed component health information',
    },
    onReconnect: {
      description: 'Callback when reconnect is triggered',
    },
  },
  args: {
    onReconnect: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Healthy connection status
 */
export const Healthy: Story = {
  args: {
    showDetails: false,
  },
};

/**
 * Connection with detailed component health
 */
export const HealthyWithDetails: Story = {
  args: {
    showDetails: true,
  },
};

/**
 * Degraded connection
 */
export const Degraded: Story = {
  args: {
    showDetails: false,
  },
};

/**
 * Degraded with details
 */
export const DegradedWithDetails: Story = {
  args: {
    showDetails: true,
  },
};

/**
 * Unhealthy/Offline connection
 */
export const Offline: Story = {
  args: {
    showDetails: false,
  },
};

/**
 * Offline with details
 */
export const OfflineWithDetails: Story = {
  args: {
    showDetails: true,
  },
};

/**
 * Reconnecting state
 */
export const Reconnecting: Story = {
  args: {
    showDetails: false,
  },
};

/**
 * Circuit breaker open state
 */
export const CircuitBreakerOpen: Story = {
  args: {
    showDetails: true,
  },
};
