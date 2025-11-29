/**
 * Storybook Stories for Campaign Setup Wizard
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ConfigProvider } from 'antd';
import CampaignSetupWizard from './CampaignSetupWizard';
import axios from 'axios';

// Mock axios
const mockAxios = {
  post: async (url: string, data: any) => {
    console.log('Mock POST:', url, data);
    
    if (url.includes('/create-from-prompt')) {
      return {
        data: {
          success: true,
          data: {
            id: `campaign_${Date.now()}`,
            name: data.options.name || 'Test Campaign',
            status: 'created',
            clientSiteUrl: data.clientSiteUrl,
            createdAt: new Date().toISOString()
          }
        }
      };
    }
    
    if (url.includes('/clusters')) {
      return {
        data: {
          success: true,
          data: {
            id: `cluster_${Date.now()}`,
            ...data
          }
        }
      };
    }
    
    if (url.includes('/seeding-services')) {
      return {
        data: {
          success: true,
          data: {
            id: `service_${Date.now()}`,
            ...data
          }
        }
      };
    }
    
    if (url.includes('/start')) {
      return {
        data: {
          success: true,
          message: 'Campaign started'
        }
      };
    }
    
    return { data: { success: true } };
  },
  get: async (url: string) => {
    return { data: { success: true, data: [] } };
  }
};

Object.assign(axios, mockAxios);

const meta: Meta<typeof CampaignSetupWizard> = {
  title: 'Crawler/CampaignSetupWizard',
  component: CampaignSetupWizard,
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
# Campaign Setup Wizard

Complete step-by-step wizard for setting up crawler campaigns with full enterprise features.

## Features

### 6-Step Configuration

1. **Campaign Configuration**
   - Campaign type selection (default, SEO, content, custom)
   - Basic settings (name, URL, depth, concurrency)
   - AI-powered configuration

2. **Cluster Setup**
   - Crawler clustering for coordinated operations
   - Load balancing strategies
   - Auto-scaling configuration

3. **Seeding Services**
   - Sitemap parser
   - Search engine integration
   - Custom API support

4. **Advanced Features**
   - Rotating proxies
   - robots.txt compliance
   - 3D layers mining
   - OCR for image text extraction

5. **Output Configuration**
   - Database storage with relationships
   - JSON export
   - Schema linking and drill-downs

6. **Review & Launch**
   - Campaign summary
   - One-click launch

### Default Campaign Mode

The "Default (Mine Everything)" campaign type automatically:
- Enables all advanced features
- Sets up clustering with smart load balancing
- Configures all seeding methods
- Enables 3D layers and OCR
- Creates full schema relationships
- Sets up drill-down views

## Usage

\`\`\`tsx
import CampaignSetupWizard from './components/CampaignSetupWizard';

function App() {
  const handleComplete = (campaign) => {
    console.log('Campaign created:', campaign);
  };

  return <CampaignSetupWizard onComplete={handleComplete} />;
}
\`\`\`

## API Integration

The wizard automatically calls these endpoints:
- \`POST /api/campaigns/create-from-prompt\` - Create campaign
- \`POST /api/campaigns/clusters\` - Create cluster
- \`POST /api/campaigns/seeding-services\` - Create seeding services
- \`POST /api/campaigns/:id/3d-layers/enable\` - Enable 3D layers
- \`POST /api/campaigns/:id/ocr/enable\` - Enable OCR
- \`POST /api/campaigns/:id/start\` - Launch campaign
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CampaignSetupWizard>;

/**
 * Default wizard view
 */
export const Default: Story = {
  args: {},
};

/**
 * Wizard with completion handler
 */
export const WithHandler: Story = {
  args: {
    onComplete: (campaign) => {
      console.log('Campaign completed:', campaign);
      alert(`Campaign "${campaign.name}" created successfully!`);
    },
  },
};

/**
 * Interactive demo showing full workflow
 */
export const InteractiveDemo: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Complete the wizard to see all steps and create a mock campaign.',
      },
    },
  },
};
