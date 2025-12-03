import type { Meta, StoryObj } from '@storybook/react';
import { WorkflowOrchestrationDashboard } from './WorkflowOrchestrationDashboard';

/**
 * WorkflowOrchestrationDashboard - Hierarchical CRUD Dashboard
 * 
 * Manages the complete workflow hierarchy:
 * - **Campaigns**: Top-level containers for multiple workflows
 * - **Workflows**: n8n-compatible with triggers (start/stop)
 * - **Services**: Bundled APIs and integrations
 * - **Data Streams**: Data flow configurations
 * - **Attributes**: Individual data items (e.g., SEO h1)
 * 
 * Features:
 * - Hierarchical navigation with breadcrumbs
 * - CRUD operations for all entity types
 * - DeepSeek integration for attribute auto-generation
 * - Statistics dashboard
 */
const meta: Meta<typeof WorkflowOrchestrationDashboard> = {
  title: 'Orchestration/WorkflowOrchestrationDashboard',
  component: WorkflowOrchestrationDashboard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
A comprehensive CRUD dashboard for managing the hierarchical workflow system:

## Entity Hierarchy

\`\`\`
Campaign
└── Workflow (with triggers: manual, schedule, webhook)
    └── Service (bundled API)
        └── Data Stream (data flow)
            └── Attribute (single data item)
\`\`\`

## Features

- **Hierarchical Navigation**: Click to drill down, breadcrumbs to navigate back
- **Full CRUD**: Create, Read, Update, Delete for all entity types
- **DeepSeek Integration**: Auto-generate related attributes for a topic
- **n8n Compatible**: Workflow triggers (manual, schedule, webhook, cron)
- **Statistics Dashboard**: Real-time counts for all entities

## API Endpoints

All operations are performed via \`/api/workflow-orchestration/*\`:
- \`GET/POST /campaigns\` - Campaign management
- \`GET/POST /workflows\` - Workflow management with triggers
- \`GET/POST /services\` - Service management
- \`GET/POST /data-streams\` - Data stream management
- \`GET/POST /attributes\` - Attribute management
- \`POST /data-streams/:id/generate-attributes\` - DeepSeek attribute generation
- \`POST /bundles\` - Create complete workflow bundle
        `
      }
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default view starting at Campaigns level
 */
export const Default: Story = {
  args: {}
};

/**
 * Mobile responsive view
 */
export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
};

/**
 * Tablet responsive view
 */
export const Tablet: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'tablet'
    }
  }
};

/**
 * Dark mode appearance
 */
export const DarkMode: Story = {
  args: {},
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
};
