#!/usr/bin/env node

/**
 * n8n MCP Server for Cursor Integration
 *
 * This MCP server provides integration between Cursor and n8n workflows,
 * allowing developers to create, manage, and execute n8n workflows directly
 * from the Cursor IDE.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import * as fs from 'fs/promises';

// n8n MCP Server Configuration
interface N8nConfig {
  baseUrl: string;
  apiKey?: string;
  webhookUrl?: string;
  timeout: number;
}

// Removed unused interfaces

class N8nMCPServer {
  private server: Server;
  private config: N8nConfig;

  constructor(config: N8nConfig) {
    this.config = config;
    this.server = new Server(
      {
        name: 'n8n-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_workflows',
            description: 'List all n8n workflows',
            inputSchema: {
              type: 'object',
              properties: {
                active: {
                  type: 'boolean',
                  description: 'Filter by active status',
                },
              },
            },
          },
          {
            name: 'get_workflow',
            description: 'Get a specific workflow by ID',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'The workflow ID',
                },
              },
              required: ['workflowId'],
            },
          },
          {
            name: 'create_workflow',
            description: 'Create a new n8n workflow',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Workflow name',
                },
                nodes: {
                  type: 'array',
                  description: 'Workflow nodes',
                },
                connections: {
                  type: 'object',
                  description: 'Node connections',
                },
                active: {
                  type: 'boolean',
                  description: 'Whether to activate the workflow',
                  default: false,
                },
              },
              required: ['name', 'nodes', 'connections'],
            },
          },
          {
            name: 'update_workflow',
            description: 'Update an existing workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'The workflow ID to update',
                },
                name: {
                  type: 'string',
                  description: 'New workflow name',
                },
                nodes: {
                  type: 'array',
                  description: 'Updated workflow nodes',
                },
                connections: {
                  type: 'object',
                  description: 'Updated node connections',
                },
                active: {
                  type: 'boolean',
                  description: 'Whether to activate the workflow',
                },
              },
              required: ['workflowId'],
            },
          },
          {
            name: 'delete_workflow',
            description: 'Delete a workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'The workflow ID to delete',
                },
              },
              required: ['workflowId'],
            },
          },
          {
            name: 'execute_workflow',
            description: 'Execute a workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'The workflow ID to execute',
                },
                inputData: {
                  type: 'object',
                  description: 'Input data for the workflow',
                },
              },
              required: ['workflowId'],
            },
          },
          {
            name: 'get_execution',
            description: 'Get execution details',
            inputSchema: {
              type: 'object',
              properties: {
                executionId: {
                  type: 'string',
                  description: 'The execution ID',
                },
              },
              required: ['executionId'],
            },
          },
          {
            name: 'list_executions',
            description: 'List workflow executions',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'Filter by workflow ID',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of executions to return',
                  default: 20,
                },
              },
            },
          },
          {
            name: 'create_webhook',
            description: 'Create a webhook for a workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'The workflow ID',
                },
                httpMethod: {
                  type: 'string',
                  enum: ['GET', 'POST', 'PUT', 'DELETE'],
                  description: 'HTTP method for the webhook',
                  default: 'POST',
                },
                path: {
                  type: 'string',
                  description: 'Webhook path',
                },
              },
              required: ['workflowId'],
            },
          },
          {
            name: 'trigger_webhook',
            description: 'Trigger a workflow via webhook',
            inputSchema: {
              type: 'object',
              properties: {
                webhookUrl: {
                  type: 'string',
                  description: 'The webhook URL',
                },
                method: {
                  type: 'string',
                  enum: ['GET', 'POST', 'PUT', 'DELETE'],
                  description: 'HTTP method',
                  default: 'POST',
                },
                data: {
                  type: 'object',
                  description: 'Data to send to the webhook',
                },
                headers: {
                  type: 'object',
                  description: 'Additional headers',
                },
              },
              required: ['webhookUrl'],
            },
          },
          {
            name: 'export_workflow',
            description: 'Export workflow as JSON',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'The workflow ID to export',
                },
                filePath: {
                  type: 'string',
                  description: 'File path to save the export',
                },
              },
              required: ['workflowId'],
            },
          },
          {
            name: 'import_workflow',
            description: 'Import workflow from JSON file',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the workflow JSON file',
                },
                name: {
                  type: 'string',
                  description: 'New name for the imported workflow',
                },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'validate_workflow',
            description: 'Validate workflow configuration',
            inputSchema: {
              type: 'object',
              properties: {
                workflow: {
                  type: 'object',
                  description: 'Workflow definition to validate',
                },
              },
              required: ['workflow'],
            },
          },
          {
            name: 'get_workflow_statistics',
            description: 'Get workflow execution statistics',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'The workflow ID',
                },
                timeRange: {
                  type: 'string',
                  enum: ['hour', 'day', 'week', 'month'],
                  description: 'Time range for statistics',
                  default: 'day',
                },
              },
              required: ['workflowId'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_workflows':
            return await this.listWorkflows(args as any);
          case 'get_workflow':
            return await this.getWorkflow(args as any);
          case 'create_workflow':
            return await this.createWorkflow(args as any);
          case 'update_workflow':
            return await this.updateWorkflow(args as any);
          case 'delete_workflow':
            return await this.deleteWorkflow(args as any);
          case 'execute_workflow':
            return await this.executeWorkflow(args as any);
          case 'get_execution':
            return await this.getExecution(args as any);
          case 'list_executions':
            return await this.listExecutions(args as any);
          case 'create_webhook':
            return await this.createWebhook(args as any);
          case 'trigger_webhook':
            return await this.triggerWebhook(args as any);
          case 'export_workflow':
            return await this.exportWorkflow(args as any);
          case 'import_workflow':
            return await this.importWorkflow(args as any);
          case 'validate_workflow':
            return await this.validateWorkflow(args as any);
          case 'get_workflow_statistics':
            return await this.getWorkflowStatistics(args as any);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async makeRequest(endpoint: string, options: any = {}) {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.config.apiKey) {
      headers['X-N8N-API-KEY'] = this.config.apiKey;
    }

    const response = await axios({
      url,
      method: options.method || 'GET',
      headers,
      data: options.data,
      timeout: this.config.timeout,
    });

    return response.data;
  }

  private async listWorkflows(args: { active?: boolean }) {
    const workflows = await this.makeRequest('/api/v1/workflows');
    let filteredWorkflows = workflows.data || workflows;

    if (args.active !== undefined) {
      filteredWorkflows = filteredWorkflows.filter((w: any) => w.active === args.active);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(filteredWorkflows, null, 2),
        },
      ],
    };
  }

  private async getWorkflow(args: { workflowId: string }) {
    const workflow = await this.makeRequest(`/api/v1/workflows/${args.workflowId}`);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(workflow, null, 2),
        },
      ],
    };
  }

  private async createWorkflow(args: {
    name: string;
    nodes: any[];
    connections: any;
    active?: boolean;
  }) {
    const workflowData = {
      name: args.name,
      nodes: args.nodes,
      connections: args.connections,
      active: args.active || false,
    };

    const workflow = await this.makeRequest('/api/v1/workflows', {
      method: 'POST',
      data: workflowData,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Workflow created successfully: ${JSON.stringify(workflow, null, 2)}`,
        },
      ],
    };
  }

  private async updateWorkflow(args: {
    workflowId: string;
    name?: string;
    nodes?: any[];
    connections?: any;
    active?: boolean;
  }) {
    const updateData: any = {};
    if (args.name) updateData.name = args.name;
    if (args.nodes) updateData.nodes = args.nodes;
    if (args.connections) updateData.connections = args.connections;
    if (args.active !== undefined) updateData.active = args.active;

    const workflow = await this.makeRequest(`/api/v1/workflows/${args.workflowId}`, {
      method: 'PUT',
      data: updateData,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Workflow updated successfully: ${JSON.stringify(workflow, null, 2)}`,
        },
      ],
    };
  }

  private async deleteWorkflow(args: { workflowId: string }) {
    await this.makeRequest(`/api/v1/workflows/${args.workflowId}`, {
      method: 'DELETE',
    });

    return {
      content: [
        {
          type: 'text',
          text: `Workflow ${args.workflowId} deleted successfully`,
        },
      ],
    };
  }

  private async executeWorkflow(args: { workflowId: string; inputData?: any }) {
    const execution = await this.makeRequest(`/api/v1/workflows/${args.workflowId}/execute`, {
      method: 'POST',
      data: args.inputData || {},
    });

    return {
      content: [
        {
          type: 'text',
          text: `Workflow execution started: ${JSON.stringify(execution, null, 2)}`,
        },
      ],
    };
  }

  private async getExecution(args: { executionId: string }) {
    const execution = await this.makeRequest(`/api/v1/executions/${args.executionId}`);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(execution, null, 2),
        },
      ],
    };
  }

  private async listExecutions(args: { workflowId?: string; limit?: number }) {
    let endpoint = '/api/v1/executions';
    const params = new URLSearchParams();

    if (args.workflowId) {
      params.append('workflowId', args.workflowId);
    }
    if (args.limit) {
      params.append('limit', args.limit.toString());
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    const executions = await this.makeRequest(endpoint);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(executions.data || executions, null, 2),
        },
      ],
    };
  }

  private async createWebhook(args: { workflowId: string; httpMethod?: string; path?: string }) {
    const webhookData = {
      httpMethod: args.httpMethod || 'POST',
      path: args.path || `webhook-${args.workflowId}`,
    };

    const webhook = await this.makeRequest(`/api/v1/workflows/${args.workflowId}/webhook`, {
      method: 'POST',
      data: webhookData,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Webhook created: ${JSON.stringify(webhook, null, 2)}`,
        },
      ],
    };
  }

  private async triggerWebhook(args: {
    webhookUrl: string;
    method?: string;
    data?: any;
    headers?: any;
  }) {
    const response = await axios({
      url: args.webhookUrl,
      method: (args.method || 'POST') as any,
      data: args.data || {},
      headers: args.headers || {},
      timeout: this.config.timeout,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Webhook triggered successfully: ${JSON.stringify(response.data, null, 2)}`,
        },
      ],
    };
  }

  private async exportWorkflow(args: { workflowId: string; filePath?: string }) {
    const workflow = await this.makeRequest(`/api/v1/workflows/${args.workflowId}`);
    const exportData = {
      workflow,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };

    if (args.filePath) {
      await fs.writeFile(args.filePath, JSON.stringify(exportData, null, 2));
      return {
        content: [
          {
            type: 'text',
            text: `Workflow exported to ${args.filePath}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(exportData, null, 2),
        },
      ],
    };
  }

  private async importWorkflow(args: { filePath: string; name?: string }) {
    const fileContent = await fs.readFile(args.filePath, 'utf-8');
    const importData = JSON.parse(fileContent);

    const workflowData = {
      name: args.name || importData.workflow.name || `Imported-${Date.now()}`,
      nodes: importData.workflow.nodes,
      connections: importData.workflow.connections,
      active: false,
    };

    const workflow = await this.makeRequest('/api/v1/workflows', {
      method: 'POST',
      data: workflowData,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Workflow imported successfully: ${JSON.stringify(workflow, null, 2)}`,
        },
      ],
    };
  }

  private async validateWorkflow(args: { workflow: any }) {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Basic validation
    if (!args.workflow.name) {
      (validation.errors as string[]).push('Workflow name is required');
      validation.valid = false;
    }

    if (!args.workflow.nodes || !Array.isArray(args.workflow.nodes)) {
      (validation.errors as string[]).push('Workflow must have nodes array');
      validation.valid = false;
    }

    if (!args.workflow.connections) {
      (validation.errors as string[]).push('Workflow must have connections object');
      validation.valid = false;
    }

    // Check for at least one trigger node
    const hasTrigger = args.workflow.nodes?.some(
      (node: any) => node.type && node.type.includes('Trigger')
    );

    if (!hasTrigger) {
      (validation.warnings as string[]).push('Workflow should have at least one trigger node');
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(validation, null, 2),
        },
      ],
    };
  }

  private async getWorkflowStatistics(args: { workflowId: string; timeRange?: string }) {
    // Get executions for the time range
    const executions = await this.listExecutions({
      workflowId: args.workflowId,
      limit: 1000,
    });

    const executionData = JSON.parse(executions.content[0].text);
    const executionsList = executionData.data || executionData;

    // Calculate statistics
    const stats = {
      totalExecutions: executionsList.length,
      successfulExecutions: executionsList.filter((e: any) => e.finished && !e.stoppedAt).length,
      failedExecutions: executionsList.filter((e: any) => e.finished && e.stoppedAt).length,
      averageExecutionTime: 0,
      timeRange: args.timeRange || 'day',
    };

    // Calculate average execution time
    const finishedExecutions = executionsList.filter((e: any) => e.finished);
    if (finishedExecutions.length > 0) {
      const totalTime = finishedExecutions.reduce((sum: number, e: any) => {
        const start = new Date(e.startedAt).getTime();
        const end = new Date(e.finishedAt || e.stoppedAt).getTime();
        return sum + (end - start);
      }, 0);
      stats.averageExecutionTime = totalTime / finishedExecutions.length;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(stats, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('n8n MCP Server running on stdio');
  }
}

// Main execution
async function main() {
  const config: N8nConfig = {
    baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
    apiKey: process.env.N8N_API_KEY,
    webhookUrl: process.env.N8N_WEBHOOK_URL,
    timeout: parseInt(process.env.N8N_TIMEOUT || '30000'),
  };

  const server = new N8nMCPServer(config);
  await server.run();
}

if (require.main === module) {
  main().catch(error => {
    console.error('Failed to start n8n MCP Server:', error);
    process.exit(1);
  });
}

export { N8nMCPServer };
