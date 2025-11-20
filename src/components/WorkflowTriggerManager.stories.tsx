import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import WorkflowTriggerManager from './WorkflowTriggerManager';
import axios from 'axios';

// Mock axios for Storybook
const mockTriggers = [
  {
    id: 'trigger_1',
    campaignId: 'campaign_123',
    eventType: 'campaign.schema.discovered',
    workflowId: 'workflow_1',
    condition: '{{schema.type}} === "Product"',
    description: 'Process product schema discoveries',
    enabled: true,
    createdAt: '2025-11-18T10:00:00Z',
    executionCount: 45,
    lastExecuted: '2025-11-18T14:30:00Z'
  },
  {
    id: 'trigger_2',
    campaignId: 'campaign_123',
    eventType: 'campaign.seeder.urls_collected',
    workflowId: 'workflow_2',
    condition: '{{urls.length}} > 10',
    description: 'Validate and queue collected URLs',
    enabled: true,
    createdAt: '2025-11-18T10:15:00Z',
    executionCount: 128,
    lastExecuted: '2025-11-18T14:35:00Z'
  },
  {
    id: 'trigger_3',
    campaignId: 'campaign_123',
    eventType: 'campaign.error.threshold_exceeded',
    workflowId: 'workflow_3',
    condition: '{{errors.rate}} > 0.1',
    description: 'Alert on high error rate',
    enabled: false,
    createdAt: '2025-11-18T10:30:00Z',
    executionCount: 2,
    lastExecuted: '2025-11-17T18:45:00Z'
  }
];

const mockTemplates = [
  {
    key: 'schema-discovered',
    name: 'Schema Discovery Trigger',
    description: 'Triggers when a new schema type is discovered during crawling',
    event: 'campaign.schema.discovered',
    condition: '{{schema.type}} !== null',
    defaultActions: [
      'Send notification',
      'Update seeding configuration',
      'Start specialized crawler',
      'Generate training data'
    ]
  },
  {
    key: 'url-collected',
    name: 'URL Collection Trigger',
    description: 'Triggers when new URLs are collected by seeding service',
    event: 'campaign.seeder.urls_collected',
    condition: '{{urls.length}} > 0',
    defaultActions: [
      'Validate URLs',
      'Filter by robots.txt',
      'Add to crawler queue',
      'Update statistics'
    ]
  },
  {
    key: 'data-mined',
    name: 'Data Mining Complete Trigger',
    description: 'Triggers when data mining completes for a URL',
    event: 'campaign.crawler.data_mined',
    condition: '{{data.success}} === true',
    defaultActions: [
      'Store in database',
      'Extract schemas',
      'Run OCR if images',
      'Update analytics'
    ]
  }
];

const mockStats = {
  total: 3,
  enabled: 2,
  disabled: 1,
  totalExecutions: 175,
  recentExecutions: 50,
  successRate: 96
};

const mockExecutionHistory = [
  {
    triggerId: 'trigger_1',
    workflowId: 'workflow_1',
    executionId: 'exec_1',
    eventData: {
      schema: { type: 'Product', fields: ['name', 'price', 'sku'] },
      url: 'https://example.com/product-1'
    },
    timestamp: '2025-11-18T14:30:00Z',
    success: true
  },
  {
    triggerId: 'trigger_2',
    workflowId: 'workflow_2',
    executionId: 'exec_2',
    eventData: {
      urls: ['https://example.com/page1', 'https://example.com/page2'],
      count: 2
    },
    timestamp: '2025-11-18T14:35:00Z',
    success: true
  },
  {
    triggerId: 'trigger_1',
    workflowId: 'workflow_1',
    executionId: 'exec_3',
    eventData: {
      schema: { type: 'Article', fields: ['title', 'content', 'author'] },
      url: 'https://example.com/article-1'
    },
    timestamp: '2025-11-18T14:32:00Z',
    success: false,
    error: 'Workflow execution timed out'
  }
];

const mockWorkflows = [
  { id: 'workflow_1', name: 'Product Schema Processor', active: true },
  { id: 'workflow_2', name: 'URL Validator', active: true },
  { id: 'workflow_3', name: 'Error Alert System', active: false }
];

// Setup axios mocks
const setupMocks = () => {
  (axios.get as any) = jest.fn((url: string) => {
    if (url.includes('/api/n8n/triggers?')) {
      return Promise.resolve({ data: { triggers: mockTriggers } });
    }
    if (url.includes('/api/n8n/trigger-templates')) {
      return Promise.resolve({ data: { templates: mockTemplates } });
    }
    if (url.includes('/api/n8n/triggers/stats')) {
      return Promise.resolve({ data: { stats: mockStats } });
    }
    if (url.includes('/api/n8n/workflows')) {
      return Promise.resolve({ data: { workflows: mockWorkflows } });
    }
    if (url.includes('/api/n8n/triggers/executions')) {
      return Promise.resolve({ data: { history: mockExecutionHistory } });
    }
    return Promise.resolve({ data: {} });
  });

  (axios.post as any) = jest.fn((url: string) => {
    if (url.includes('/api/n8n/triggers')) {
      return Promise.resolve({
        data: {
          trigger: {
            ...mockTriggers[0],
            id: `trigger_${Date.now()}`,
            createdAt: new Date().toISOString()
          }
        }
      });
    }
    return Promise.resolve({ data: {} });
  });

  (axios.patch as any) = jest.fn(() => {
    return Promise.resolve({ data: { success: true } });
  });

  (axios.delete as any) = jest.fn(() => {
    return Promise.resolve({ data: { success: true } });
  });
};

const meta: Meta<typeof WorkflowTriggerManager> = {
  title: 'Campaign/WorkflowTriggerManager',
  component: WorkflowTriggerManager,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Workflow Trigger Manager

Complete n8n workflow automation management component with:
- Event-based trigger creation
- Template library integration
- Execution history and statistics
- Real-time trigger management

## Features

- **6 Pre-built Templates**: Schema discovery, URL collection, data mining, cluster scaling, error handling, training readiness
- **Conditional Execution**: JavaScript expressions with {{variable}} syntax
- **DeepSeek AI Integration**: Auto-generate workflows from templates
- **Execution Tracking**: View success rates and execution history
- **Real-time Statistics**: Monitor trigger performance

## Usage

\`\`\`tsx
import WorkflowTriggerManager from './components/WorkflowTriggerManager';

<WorkflowTriggerManager campaignId="campaign_123" />
\`\`\`

## Event Types

- \`campaign.schema.discovered\` - When new schema type is found
- \`campaign.seeder.urls_collected\` - When URLs are collected
- \`campaign.crawler.data_mined\` - When crawling completes
- \`campaign.cluster.scale_needed\` - When cluster needs scaling
- \`campaign.error.threshold_exceeded\` - When error rate is high
- \`campaign.training.ready\` - When training dataset is ready
        `
      }
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      setupMocks();
      return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
          <Story />
        </div>
      );
    }
  ]
};

export default meta;
type Story = StoryObj<typeof WorkflowTriggerManager>;

/**
 * Default view showing all trigger management features
 */
export const Default: Story = {
  args: {
    campaignId: 'campaign_123'
  }
};

/**
 * Shows the trigger manager with active triggers
 */
export const WithActiveTriggers: Story = {
  args: {
    campaignId: 'campaign_123'
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates trigger manager with active triggers processing events'
      }
    }
  }
};

/**
 * Shows the template library view
 */
export const TemplateLibrary: Story = {
  args: {
    campaignId: 'campaign_123'
  },
  parameters: {
    docs: {
      description: {
        story: 'Browse and use pre-built workflow templates from awesome-n8n'
      }
    }
  },
  play: async ({ canvasElement }) => {
    // Switch to templates tab
    const templatesTab = canvasElement.querySelector('[data-node-key="templates"]') as HTMLElement;
    if (templatesTab) {
      templatesTab.click();
    }
  }
};

/**
 * Shows execution history tracking
 */
export const ExecutionHistory: Story = {
  args: {
    campaignId: 'campaign_123'
  },
  parameters: {
    docs: {
      description: {
        story: 'View execution history with success/failure tracking'
      }
    }
  },
  play: async ({ canvasElement }) => {
    // Switch to history tab
    const historyTab = canvasElement.querySelector('[data-node-key="history"]') as HTMLElement;
    if (historyTab) {
      historyTab.click();
    }
  }
};

/**
 * High success rate scenario
 */
export const HighSuccessRate: Story = {
  args: {
    campaignId: 'campaign_123'
  },
  decorators: [
    (Story) => {
      (axios.get as any) = jest.fn((url: string) => {
        if (url.includes('/api/n8n/triggers/stats')) {
          return Promise.resolve({
            data: {
              stats: {
                ...mockStats,
                successRate: 99,
                totalExecutions: 1250
              }
            }
          });
        }
        return (axios.get as any)(url);
      });
      return <Story />;
    }
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows statistics with high success rate (99%)'
      }
    }
  }
};

/**
 * Low success rate scenario (needs attention)
 */
export const LowSuccessRate: Story = {
  args: {
    campaignId: 'campaign_123'
  },
  decorators: [
    (Story) => {
      (axios.get as any) = jest.fn((url: string) => {
        if (url.includes('/api/n8n/triggers/stats')) {
          return Promise.resolve({
            data: {
              stats: {
                ...mockStats,
                successRate: 65,
                totalExecutions: 450
              }
            }
          });
        }
        return (axios.get as any)(url);
      });
      return <Story />;
    }
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows statistics with low success rate (65%) - needs investigation'
      }
    }
  }
};

/**
 * Empty state - no triggers yet
 */
export const EmptyState: Story = {
  args: {
    campaignId: 'campaign_new'
  },
  decorators: [
    (Story) => {
      (axios.get as any) = jest.fn((url: string) => {
        if (url.includes('/api/n8n/triggers?')) {
          return Promise.resolve({ data: { triggers: [] } });
        }
        if (url.includes('/api/n8n/triggers/stats')) {
          return Promise.resolve({
            data: {
              stats: {
                total: 0,
                enabled: 0,
                disabled: 0,
                totalExecutions: 0,
                recentExecutions: 0,
                successRate: 100
              }
            }
          });
        }
        if (url.includes('/api/n8n/triggers/executions')) {
          return Promise.resolve({ data: { history: [] } });
        }
        return (axios.get as any)(url);
      });
      return <Story />;
    }
  ],
  parameters: {
    docs: {
      description: {
        story: 'Initial state with no triggers configured - shows templates to get started'
      }
    }
  }
};
