/**
 * n8n MCP Server Integration
 * 
 * Connects DeepSeek AI to n8n via Model Context Protocol (MCP)
 * Enables AI agents to create, manage, and execute n8n workflows
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

export interface N8nMCPConfig {
  n8nApiUrl: string;
  n8nApiKey?: string;
  n8nWebhookUrl: string;
}

export class N8nMCPServer {
  private server: Server;
  private config: N8nMCPConfig;
  private axiosInstance: ReturnType<typeof axios.create>;

  constructor(config: N8nMCPConfig) {
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

    this.axiosInstance = axios.create({
      baseURL: config.n8nApiUrl,
      headers: config.n8nApiKey ? {
        'X-N8N-API-KEY': config.n8nApiKey,
      } : {},
    });

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getAvailableTools(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'n8n_list_workflows':
            return await this.listWorkflows(args);
          case 'n8n_get_workflow':
            return await this.getWorkflow(args);
          case 'n8n_create_workflow':
            return await this.createWorkflow(args);
          case 'n8n_update_workflow':
            return await this.updateWorkflow(args);
          case 'n8n_delete_workflow':
            return await this.deleteWorkflow(args);
          case 'n8n_activate_workflow':
            return await this.activateWorkflow(args);
          case 'n8n_deactivate_workflow':
            return await this.deactivateWorkflow(args);
          case 'n8n_execute_workflow':
            return await this.executeWorkflow(args);
          case 'n8n_get_execution':
            return await this.getExecution(args);
          case 'n8n_list_executions':
            return await this.listExecutions(args);
          case 'n8n_get_workflow_stats':
            return await this.getWorkflowStats(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getAvailableTools(): Tool[] {
    return [
      {
        name: 'n8n_list_workflows',
        description: 'List all n8n workflows',
        inputSchema: {
          type: 'object',
          properties: {
            active: {
              type: 'boolean',
              description: 'Filter by active status',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of workflows to return',
            },
          },
        },
      },
      {
        name: 'n8n_get_workflow',
        description: 'Get details of a specific n8n workflow',
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
        name: 'n8n_create_workflow',
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
              description: 'Array of workflow nodes',
            },
            connections: {
              type: 'object',
              description: 'Node connections',
            },
            active: {
              type: 'boolean',
              description: 'Whether to activate the workflow',
            },
          },
          required: ['name', 'nodes', 'connections'],
        },
      },
      {
        name: 'n8n_update_workflow',
        description: 'Update an existing n8n workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'The workflow ID to update',
            },
            updates: {
              type: 'object',
              description: 'Fields to update',
            },
          },
          required: ['workflowId', 'updates'],
        },
      },
      {
        name: 'n8n_delete_workflow',
        description: 'Delete an n8n workflow',
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
        name: 'n8n_activate_workflow',
        description: 'Activate an n8n workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'The workflow ID to activate',
            },
          },
          required: ['workflowId'],
        },
      },
      {
        name: 'n8n_deactivate_workflow',
        description: 'Deactivate an n8n workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'The workflow ID to deactivate',
            },
          },
          required: ['workflowId'],
        },
      },
      {
        name: 'n8n_execute_workflow',
        description: 'Execute an n8n workflow',
        inputSchema: {
          type: 'object',
          properties: {
            workflowId: {
              type: 'string',
              description: 'The workflow ID to execute',
            },
            data: {
              type: 'object',
              description: 'Input data for the workflow',
            },
          },
          required: ['workflowId'],
        },
      },
      {
        name: 'n8n_get_execution',
        description: 'Get details of a workflow execution',
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
        name: 'n8n_list_executions',
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
            },
          },
        },
      },
      {
        name: 'n8n_get_workflow_stats',
        description: 'Get statistics for a workflow',
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
    ];
  }

  // Tool implementations

  private async listWorkflows(args: any) {
    const { active, limit } = args;
    const params: any = {};
    
    if (active !== undefined) params.active = active;
    if (limit) params.limit = limit;

    const response = await this.axiosInstance.get('/workflows', { params });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async getWorkflow(args: any) {
    const { workflowId } = args;
    const response = await this.axiosInstance.get(`/workflows/${workflowId}`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async createWorkflow(args: any) {
    const { name, nodes, connections, active } = args;
    
    const workflow = {
      name,
      nodes,
      connections,
      active: active !== false,
      settings: {
        executionOrder: 'v1',
      },
    };

    const response = await this.axiosInstance.post('/workflows', workflow);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async updateWorkflow(args: any) {
    const { workflowId, updates } = args;
    const response = await this.axiosInstance.patch(`/workflows/${workflowId}`, updates);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async deleteWorkflow(args: any) {
    const { workflowId } = args;
    await this.axiosInstance.delete(`/workflows/${workflowId}`);
    
    return {
      content: [
        {
          type: 'text',
          text: `Workflow ${workflowId} deleted successfully`,
        },
      ],
    };
  }

  private async activateWorkflow(args: any) {
    const { workflowId } = args;
    const response = await this.axiosInstance.patch(`/workflows/${workflowId}`, {
      active: true,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Workflow ${workflowId} activated`,
        },
      ],
    };
  }

  private async deactivateWorkflow(args: any) {
    const { workflowId } = args;
    const response = await this.axiosInstance.patch(`/workflows/${workflowId}`, {
      active: false,
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `Workflow ${workflowId} deactivated`,
        },
      ],
    };
  }

  private async executeWorkflow(args: any) {
    const { workflowId, data } = args;
    const response = await this.axiosInstance.post(`/workflows/${workflowId}/execute`, {
      data: data || {},
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async getExecution(args: any) {
    const { executionId } = args;
    const response = await this.axiosInstance.get(`/executions/${executionId}`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async listExecutions(args: any) {
    const { workflowId, limit } = args;
    const params: any = {};
    
    if (workflowId) params.workflowId = workflowId;
    if (limit) params.limit = limit;

    const response = await this.axiosInstance.get('/executions', { params });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  private async getWorkflowStats(args: any) {
    const { workflowId } = args;
    
    // Get recent executions
    const executions = await this.axiosInstance.get('/executions', {
      params: { workflowId, limit: 100 },
    });

    const stats = {
      total: executions.data.count || 0,
      successful: 0,
      failed: 0,
      running: 0,
    };

    if (executions.data.data) {
      executions.data.data.forEach((exec: any) => {
        if (exec.finished) {
          if (exec.status === 'success') stats.successful++;
          else if (exec.status === 'error') stats.failed++;
        } else {
          stats.running++;
        }
      });
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

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('n8n MCP server started');
  }
}

// Start the server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new N8nMCPServer({
    n8nApiUrl: process.env.N8N_API_URL || 'http://localhost:5678/api/v1',
    n8nApiKey: process.env.N8N_API_KEY,
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook',
  });

  server.start().catch(console.error);
}
