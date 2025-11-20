/**
 * Storybook Stories for Seeding Service Management Component
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ConfigProvider } from 'antd';
import SeedingServiceManagement from '../components/SeedingServiceManagement';
import axios from 'axios';

// Mock seeding services
const mockServices = [
  {
    id: 'seeding_1',
    name: 'Main Sitemap Collector',
    type: 'sitemap',
    description: 'Collects URLs from the main sitemap',
    config: {
      sitemapUrl: 'https://example.com/sitemap.xml',
      followSubSitemaps: true,
      maxUrls: 1000
    },
    status: 'active',
    enabled: true,
    urls_collected: 1547,
    last_run_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'seeding_2',
    name: 'Google Search Collector',
    type: 'search-results',
    description: 'Collects URLs from Google search results',
    config: {
      searchEngine: 'google',
      query: 'site:example.com',
      maxResults: 100,
      language: 'en'
    },
    status: 'active',
    enabled: true,
    urls_collected: 342,
    last_run_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'seeding_3',
    name: 'Custom API Collector',
    type: 'api',
    description: 'Fetches URLs from custom API endpoint',
    config: {
      apiUrl: 'https://api.example.com/urls',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer token123',
        'Content-Type': 'application/json'
      },
      authentication: 'bearer'
    },
    status: 'active',
    enabled: false,
    urls_collected: 0,
    last_run_at: null,
    created_at: new Date(Date.now() - 259200000).toISOString()
  }
];

// Mock axios implementation
const mockAxios = {
  get: async (url: string) => {
    if (url.includes('/api/campaigns/seeding-services')) {
      return {
        data: {
          success: true,
          data: mockServices,
          count: mockServices.length
        }
      };
    }
    return { data: { success: false } };
  },
  post: async (url: string, data: any) => {
    if (url.includes('/collect')) {
      return {
        data: {
          success: true,
          data: {
            serviceId: data.serviceId,
            campaignId: data.campaignId,
            urlsCollected: Math.floor(Math.random() * 100) + 50,
            timestamp: new Date().toISOString()
          }
        }
      };
    }
    return {
      data: {
        success: true,
        data: {
          id: `seeding_${Date.now()}`,
          ...data,
          created_at: new Date().toISOString(),
          urls_collected: 0,
          enabled: true,
          status: 'active'
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
        message: 'Seeding service deleted successfully'
      }
    };
  }
};

// Replace axios with mock
Object.assign(axios, mockAxios);

const meta: Meta<typeof SeedingServiceManagement> = {
  title: 'Crawler/SeedingServiceManagement',
  component: SeedingServiceManagement,
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
# Seeding Service Management

A component for managing seeding services that automatically collect URLs from various sources
for crawler campaigns.

## Features

- **Multiple Service Types**: Support for sitemaps, search results, and custom APIs
- **Flexible Configuration**: Each service type has specific configuration options
- **Enable/Disable**: Control which services are active
- **Run on Demand**: Manually trigger URL collection
- **Statistics**: Track how many URLs each service has collected

## Service Types

### Sitemap Parser
- Parses XML sitemaps to extract URLs
- Can follow sub-sitemaps automatically
- Configurable maximum URL limit

### Search Results
- Collects URLs from search engine results
- Supports Google, Bing, DuckDuckGo
- Query-based URL discovery

### Custom API
- Integrates with any URL-providing API
- Configurable authentication
- Custom headers support

## Usage

\`\`\`tsx
import SeedingServiceManagement from './components/SeedingServiceManagement';

function App() {
  return <SeedingServiceManagement campaignId="campaign_123" />;
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SeedingServiceManagement>;

/**
 * Default view of the Seeding Service Management component
 */
export const Default: Story = {
  args: {},
};

/**
 * With campaign ID for attaching services
 */
export const WithCampaign: Story = {
  args: {
    campaignId: 'campaign_123',
  },
};

/**
 * Demo showing sitemap service configuration
 */
export const SitemapServiceDemo: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Example showing how to configure a sitemap-based seeding service.',
      },
    },
  },
};

/**
 * Demo showing search results service
 */
export const SearchResultsDemo: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Example showing how to configure a search engine-based seeding service.',
      },
    },
  },
};

/**
 * Demo showing custom API service
 */
export const CustomAPIDemo: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Example showing how to configure a custom API-based seeding service.',
      },
    },
  },
};
