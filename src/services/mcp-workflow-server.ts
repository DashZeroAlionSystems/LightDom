/**
 * MCP Workflow Server
 * 
 * Model Context Protocol server for managing LightDom workflows.
 * Inspired by salacoste/mcp-n8n-workflow-builder
 * 
 * Features:
 * - AI-powered workflow creation via Claude/Cursor
 * - Multi-instance environment support
 * - Natural language workflow management
 * - Workflow templates and prompts
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

interface WorkflowConfig {
  apiUrl: string;
  apiKey?: string;
  environment?: string;
}

interface EnvironmentConfig {
  [key: string]: WorkflowConfig;
}

interface MCPWorkflowServerConfig {
  environments?: EnvironmentConfig;
  defaultEnv?: string;
  apiUrl?: string;
  apiKey?: string;
}

export class MCPWorkflowServer {
  private server: Server;
  private config: MCPWorkflowServerConfig;
  private apiClients: Map<string, AxiosInstance>;
  private defaultEnv: string;

  constructor(config: MCPWorkflowServerConfig = {}) {
    this.config = config;
    this.apiClients = new Map();
    this.defaultEnv = config.defaultEnv || 'default';

    // Initialize MCP server
    this.server = new Server(
      {
        name: 'lightdom-workflow-builder',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
    this.initializeApiClients();
  }

  /**
   * Initialize API clients for each environment
   */
  private initializeApiClients(): void {
    if (this.config.environments) {
      // Multi-instance configuration
      Object.entries(this.config.environments).forEach(([name, envConfig]) => {
        this.apiClients.set(name, this.createApiClient(envConfig));
      });
    } else {
      // Single instance configuration (backward compatible)
      const defaultConfig: WorkflowConfig = {
        apiUrl: this.config.apiUrl || process.env.LIGHTDOM_API_URL || 'http://localhost:3001',
        apiKey: this.config.apiKey || process.env.LIGHTDOM_API_KEY,
      };
      this.apiClients.set('default', this.createApiClient(defaultConfig));
    }
  }

  /**
   * Create an Axios client for API communication
   */
  private createApiClient(config: WorkflowConfig): AxiosInstance {
    return axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
      },
    });
  }

  /**
   * Get API client for specific environment
   */
  private getApiClient(instance?: string): AxiosInstance {
    const envName = instance || this.defaultEnv;
    const client = this.apiClients.get(envName);
    
    if (!client) {
      throw new Error(`Environment '${envName}' not configured`);
    }
    
    return client;
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'list_workflows',
          description: 'List all workflows with metadata',
          inputSchema: {
            type: 'object',
            properties: {
              instance: {
                type: 'string',
                description: 'Environment instance (production, staging, development)',
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Filter by tags',
              },
            },
          },
        },
        {
          name: 'create_workflow',
          description: 'Create a new workflow from description or schema',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Workflow name',
              },
              description: {
                type: 'string',
                description: 'Workflow description',
              },
              nodes: {
                type: 'array',
                description: 'Workflow nodes',
              },
              edges: {
                type: 'array',
                description: 'Workflow connections',
              },
              instance: {
                type: 'string',
                description: 'Target environment',
              },
            },
            required: ['name'],
          },
        },
        {
          name: 'get_workflow',
          description: 'Get complete workflow details by ID',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Workflow ID',
              },
              instance: {
                type: 'string',
                description: 'Environment instance',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'update_workflow',
          description: 'Update an existing workflow',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Workflow ID',
              },
              name: {
                type: 'string',
                description: 'Workflow name',
              },
              description: {
                type: 'string',
                description: 'Workflow description',
              },
              nodes: {
                type: 'array',
                description: 'Updated workflow nodes',
              },
              edges: {
                type: 'array',
                description: 'Updated workflow connections',
              },
              instance: {
                type: 'string',
                description: 'Environment instance',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'delete_workflow',
          description: 'Delete a workflow by ID',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Workflow ID',
              },
              instance: {
                type: 'string',
                description: 'Environment instance',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'execute_workflow',
          description: 'Execute a workflow',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Workflow ID',
              },
              input: {
                type: 'object',
                description: 'Input data for workflow execution',
              },
              instance: {
                type: 'string',
                description: 'Environment instance',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'ai_generate_workflow',
          description: 'Generate a workflow using AI from natural language description',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'Natural language description of the workflow',
              },
              instance: {
                type: 'string',
                description: 'Target environment',
              },
            },
            required: ['prompt'],
          },
        },
      ],
    }));

    // List available prompts (workflow templates)
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: 'seo_workflow',
          description: 'Create an SEO optimization workflow',
          arguments: [
            {
              name: 'target_url',
              description: 'URL to analyze',
              required: true,
            },
          ],
        },
        {
          name: 'data_mining_workflow',
          description: 'Create a data mining workflow',
          arguments: [
            {
              name: 'source_url',
              description: 'Data source URL',
              required: true,
            },
            {
              name: 'mining_type',
              description: 'Type of data to mine',
              required: false,
            },
          ],
        },
        {
          name: 'ai_processing_workflow',
          description: 'Create an AI processing workflow',
          arguments: [
            {
              name: 'model_type',
              description: 'AI model to use',
              required: true,
            },
          ],
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_workflows':
            return await this.listWorkflows(args.instance);

          case 'create_workflow':
            return await this.createWorkflow(args);

          case 'get_workflow':
            return await this.getWorkflow(args.id, args.instance);

          case 'update_workflow':
            return await this.updateWorkflow(args);

          case 'delete_workflow':
            return await this.deleteWorkflow(args.id, args.instance);

          case 'execute_workflow':
            return await this.executeWorkflow(args.id, args.input, args.instance);

          case 'ai_generate_workflow':
            return await this.aiGenerateWorkflow(args.prompt, args.instance);

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
        };
      }
    });
  }

  /**
   * List all workflows
   */
  private async listWorkflows(instance?: string) {
    const client = this.getApiClient(instance);
    const response = await client.get('/api/workflow-generator/config/summary');
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  /**
   * Create a new workflow
   */
  private async createWorkflow(args: any) {
    const client = this.getApiClient(args.instance);
    const response = await client.post('/api/workflow-generator/create', {
      name: args.name,
      description: args.description,
      nodes: args.nodes || [],
      edges: args.edges || [],
    });

    return {
      content: [
        {
          type: 'text',
          text: `Workflow created successfully: ${JSON.stringify(response.data, null, 2)}`,
        },
      ],
    };
  }

  /**
   * Get workflow details
   */
  private async getWorkflow(id: string, instance?: string) {
    const client = this.getApiClient(instance);
    const response = await client.get(`/api/workflow-generator/config/${id}`);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data, null, 2),
        },
      ],
    };
  }

  /**
   * Update an existing workflow
   */
  private async updateWorkflow(args: any) {
    const client = this.getApiClient(args.instance);
    const response = await client.put(`/api/workflow-generator/config/${args.id}`, {
      name: args.name,
      description: args.description,
      nodes: args.nodes,
      edges: args.edges,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Workflow updated successfully: ${JSON.stringify(response.data, null, 2)}`,
        },
      ],
    };
  }

  /**
   * Delete a workflow
   */
  private async deleteWorkflow(id: string, instance?: string) {
    const client = this.getApiClient(instance);
    await client.delete(`/api/workflow-generator/config/${id}`);

    return {
      content: [
        {
          type: 'text',
          text: `Workflow ${id} deleted successfully`,
        },
      ],
    };
  }

  /**
   * Execute a workflow
   */
  private async executeWorkflow(id: string, input: any, instance?: string) {
    const client = this.getApiClient(instance);
    const response = await client.post(`/api/workflow-generator/execute/${id}`, {
      input: input || {},
    });

    return {
      content: [
        {
          type: 'text',
          text: `Workflow execution started: ${JSON.stringify(response.data, null, 2)}`,
        },
      ],
    };
  }

  /**
   * AI-powered workflow generation
   */
  private async aiGenerateWorkflow(prompt: string, instance?: string) {
    const client = this.getApiClient(instance);
    const response = await client.post('/api/workflow-generator/ai-generate', {
      prompt,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Workflow generated: ${JSON.stringify(response.data, null, 2)}`,
        },
      ],
    };
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('LightDom MCP Workflow Server running on stdio');
  }
}

// Export for use in other modules
export default MCPWorkflowServer;

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const config: MCPWorkflowServerConfig = {
    // Try to load from environment or config file
    apiUrl: process.env.LIGHTDOM_API_URL,
    apiKey: process.env.LIGHTDOM_API_KEY,
  };

  const server = new MCPWorkflowServer(config);
  server.start().catch(console.error);
}
