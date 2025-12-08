/**
 * N8N Workflow Builder Component Story
 * 
 * Demonstrates the N8N Workflow Builder component with various states and interactions
 */

import type { Meta, StoryObj } from '@storybook/react';
import N8NWorkflowBuilder from './N8NWorkflowBuilder';

const meta: Meta<typeof N8NWorkflowBuilder> = {
  title: 'Automation/N8NWorkflowBuilder',
  component: N8NWorkflowBuilder,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# N8N Workflow Builder

A comprehensive visual workflow builder for creating and editing n8n workflows.

## Features

- **Visual Canvas**: Drag-and-drop interface for building workflows
- **Node Palette**: Browse and add different types of nodes (Triggers, Actions, Logic, Processing)
- **AI Generation**: Use DeepSeek AI to generate workflows from natural language descriptions
- **Configuration**: Configure individual nodes with custom parameters
- **Execution**: Test workflows directly from the builder
- **Import/Export**: Save and load workflow definitions

## Integration

This component integrates with:
- N8N API for workflow management
- DeepSeek AI for intelligent workflow generation
- MCP Server for exposing workflows as tools
- LightDom API for persistence and execution

## Usage

The workflow builder is accessible at \`/workflows/builder\` and provides a complete interface
for creating automation workflows without writing code.

## Node Types

### Triggers
- Manual Trigger: Start workflow manually
- Webhook: HTTP webhook trigger
- Schedule: Time-based trigger
- HTTP Request Trigger: API endpoint trigger

### Actions
- HTTP Request: Make API calls
- PostgreSQL: Database operations
- Send Email: Email notifications
- Slack: Team communication

### Logic
- IF Condition: Conditional branching
- Switch: Multi-way branching
- Merge: Combine data streams
- Wait: Delay execution

### Processing
- Function: JavaScript code execution
- Set: Data transformation
- Code: Custom code execution
- Aggregate: Data aggregation

## DeepSeek Integration

The AI workflow generation feature uses DeepSeek to:
1. Understand natural language workflow descriptions
2. Generate appropriate node configurations
3. Connect nodes logically
4. Add error handling
5. Optimize workflow structure

## Examples

### SEO Data Mining Workflow
Automatically extract SEO attributes from web pages, store in database,
and send notifications.

### API Integration Workflow
Connect to external APIs, transform data, and trigger actions based on responses.

### Data Processing Pipeline
Fetch data from multiple sources, process and validate, then store results.
        `
      }
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof N8NWorkflowBuilder>;

/**
 * Default state showing the workflow builder interface
 */
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'The default workflow builder interface with node palette, canvas, and toolbar.'
      }
    }
  }
};

/**
 * Shows the workflow builder with some example nodes
 */
export const WithNodes: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Workflow builder with example nodes demonstrating a simple automation flow.'
      }
    },
    mockData: {
      workflows: [
        {
          id: 'workflow-1',
          name: 'SEO Data Mining',
          active: true,
          tags: ['seo', 'data-mining'],
          nodes: [
            {
              id: 'node1',
              name: 'Webhook Trigger',
              type: 'n8n-nodes-base.webhook',
              position: [250, 300],
              parameters: {}
            },
            {
              id: 'node2',
              name: 'Fetch Page',
              type: 'n8n-nodes-base.httpRequest',
              position: [450, 300],
              parameters: { method: 'GET' }
            },
            {
              id: 'node3',
              name: 'Extract SEO Data',
              type: 'n8n-nodes-base.function',
              position: [650, 300],
              parameters: {}
            },
            {
              id: 'node4',
              name: 'Save to Database',
              type: 'n8n-nodes-base.postgres',
              position: [850, 300],
              parameters: { operation: 'insert' }
            }
          ],
          connections: {
            'node1': { main: [[{ node: 'node2', type: 'main', index: 0 }]] },
            'node2': { main: [[{ node: 'node3', type: 'main', index: 0 }]] },
            'node3': { main: [[{ node: 'node4', type: 'main', index: 0 }]] }
          }
        }
      ]
    }
  }
};

/**
 * AI Generation modal open
 */
export const AIGenerationModal: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Shows the AI workflow generation modal where users can describe workflows in natural language.'
      }
    }
  }
};

/**
 * Node configuration drawer
 */
export const NodeConfiguration: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Shows the node configuration drawer for editing node parameters and settings.'
      }
    }
  }
};

/**
 * Mobile view (responsive layout)
 */
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Responsive mobile view of the workflow builder with adapted UI.'
      }
    }
  }
};

/**
 * Dark mode theme
 */
export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark'
    },
    docs: {
      description: {
        story: 'Workflow builder with dark theme applied.'
      }
    }
  }
};

/**
 * Empty state
 */
export const EmptyState: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Shows the empty state when no workflow is loaded, encouraging users to create or load a workflow.'
      }
    }
  }
};

/**
 * Loading state
 */
export const LoadingState: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Shows loading indicator while fetching workflow data or executing operations.'
      }
    }
  }
};

/**
 * Complex workflow example
 */
export const ComplexWorkflow: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Example of a complex workflow with multiple branches, conditions, and processing nodes.'
      }
    }
  }
};
