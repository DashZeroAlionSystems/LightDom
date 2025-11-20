/**
 * Storybook Stories for Crawler Cluster Management Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ConfigProvider } from 'antd';
import CrawlerClusterManagement from '../components/CrawlerClusterManagement';
import axios from 'axios';

// Mock axios for Storybook
const mockClusters = [
  {
    id: 'cluster_1',
    name: 'E-commerce Crawlers',
    description: 'Cluster for crawling e-commerce websites',
    reason: 'Group related e-commerce campaigns for coordinated data collection',
    strategy: 'load-balanced',
    max_crawlers: 10,
    auto_scale: true,
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'cluster_2',
    name: 'News Aggregation',
    description: 'Cluster for news website crawling',
    reason: 'Coordinate news collection from multiple sources',
    strategy: 'priority-based',
    max_crawlers: 15,
    auto_scale: true,
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 'cluster_3',
    name: 'SEO Analysis',
    description: 'SEO data collection cluster',
    reason: 'Gather SEO metrics for training ML models',
    strategy: 'least-busy',
    max_crawlers: 8,
    auto_scale: false,
    status: 'paused',
    created_at: new Date().toISOString()
  }
];

// Mock axios implementation
const mockAxios = {
  get: async (url: string) => {
    if (url.includes('/api/campaigns/clusters')) {
      return {
        data: {
          success: true,
          data: mockClusters,
          count: mockClusters.length
        }
      };
    }
    return { data: { success: false } };
  },
  post: async (url: string, data: any) => {
    return {
      data: {
        success: true,
        data: {
          id: `cluster_${Date.now()}`,
          ...data,
          created_at: new Date().toISOString()
        }
      }
    };
  },
  put: async (url: string, data: any) => {
    return {
      data: {
        success: true,
        data: { ...data, updated_at: new Date().toISOString() }
      }
    };
  },
  delete: async (url: string) => {
    return {
      data: {
        success: true,
        message: 'Cluster deleted successfully'
      }
    };
  }
};

// Replace axios with mock
Object.assign(axios, mockAxios);

const meta: Meta<typeof CrawlerClusterManagement> = {
  title: 'Crawler/ClusterManagement',
  component: CrawlerClusterManagement,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ConfigProvider>
        <div style={{ padding: '20px', background: '#f0f2f5', minHeight: '100vh' }}>
          <Story />
        </div>
      </ConfigProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Crawler Cluster Management

A comprehensive UI component for managing crawler clusters. Clusters allow you to group multiple 
crawler campaigns together for coordinated operations.

## Features

- **Create & Edit Clusters**: Define cluster name, strategy, and configuration
- **List All Clusters**: View all clusters with status and metrics
- **Delete Clusters**: Remove clusters when no longer needed
- **Load Balancing Strategies**: Choose from multiple strategies
- **Auto-Scaling**: Enable automatic scaling based on workload

## Usage

\`\`\`tsx
import CrawlerClusterManagement from './components/CrawlerClusterManagement';

function App() {
  const handleSelectCluster = (cluster) => {
    console.log('Selected cluster:', cluster);
  };

  return <CrawlerClusterManagement onSelectCluster={handleSelectCluster} />;
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CrawlerClusterManagement>;

/**
 * Default view of the Crawler Cluster Management component
 */
export const Default: Story = {
  args: {},
};

/**
 * Component with cluster selection handler
 */
export const WithSelectionHandler: Story = {
  args: {
    onSelectCluster: (cluster) => {
      console.log('Cluster selected:', cluster);
      alert(`Selected cluster: ${cluster.name}`);
    },
  },
};

/**
 * Interactive demo showing create cluster flow
 */
export const InteractiveDemo: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    // This would include interactions for testing
    // For now, just render the component
  },
};
