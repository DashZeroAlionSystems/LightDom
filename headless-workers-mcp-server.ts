/**
 * MCP Server for Headless Workers Development
 * Provides development assistance through Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import WorkerPoolManager from './src/services/WorkerPoolManager';
import SchemaComponentMapper from './src/schema/SchemaComponentMapper';
import NeuralComponentBuilder from './src/schema/NeuralComponentBuilder';
import SchemaServiceFactory from './src/services/SchemaServiceFactory';
import ServiceLinker from './src/services/ServiceLinker';

class HeadlessWorkersMCPServer {
  private server: Server;
  private workerPool?: WorkerPoolManager;
  private schemaMapper?: SchemaComponentMapper;
  private componentBuilder?: NeuralComponentBuilder;
  private serviceFactory?: SchemaServiceFactory;
  private serviceLinker?: ServiceLinker;

  constructor() {
    this.server = new Server(
      {
        name: 'lightdom-headless-workers',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'worker_pool_status',
          description: 'Get the current status of the worker pool',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'add_worker_task',
          description: 'Add a new task to the worker pool',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                description: 'Task type (e.g., crawl, analyze)',
              },
              data: {
                type: 'object',
                description: 'Task data object',
              },
              priority: {
                type: 'number',
                description: 'Task priority (0-10)',
                default: 5,
              },
            },
            required: ['type', 'data'],
          },
        },
        {
          name: 'select_component',
          description: 'Select best component for a use case',
          inputSchema: {
            type: 'object',
            properties: {
              useCase: {
                type: 'string',
                description: 'Use case description',
              },
              context: {
                type: 'object',
                description: 'Additional context for selection',
              },
            },
            required: ['useCase'],
          },
        },
        {
          name: 'generate_component',
          description: 'Generate a React component from a use case',
          inputSchema: {
            type: 'object',
            properties: {
              useCase: {
                type: 'string',
                description: 'Use case description',
              },
              context: {
                type: 'object',
                description: 'Generation context (framework, typescript, etc.)',
              },
            },
            required: ['useCase'],
          },
        },
        {
          name: 'list_services',
          description: 'List all available services',
          inputSchema: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                description: 'Filter by status (running, stopped)',
                enum: ['running', 'stopped', 'all'],
                default: 'all',
              },
            },
          },
        },
        {
          name: 'start_service',
          description: 'Start a service by ID',
          inputSchema: {
            type: 'object',
            properties: {
              serviceId: {
                type: 'string',
                description: 'Service ID (e.g., lightdom:crawler-service)',
              },
            },
            required: ['serviceId'],
          },
        },
        {
          name: 'service_health',
          description: 'Check service health including dependencies',
          inputSchema: {
            type: 'object',
            properties: {
              serviceId: {
                type: 'string',
                description: 'Service ID to check',
              },
            },
            required: ['serviceId'],
          },
        },
        {
          name: 'dependency_graph',
          description: 'Get service dependency graph visualization',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'worker_pool_status':
            return await this.handleWorkerPoolStatus();

          case 'add_worker_task':
            return await this.handleAddWorkerTask(args);

          case 'select_component':
            return await this.handleSelectComponent(args);

          case 'generate_component':
            return await this.handleGenerateComponent(args);

          case 'list_services':
            return await this.handleListServices(args);

          case 'start_service':
            return await this.handleStartService(args);

          case 'service_health':
            return await this.handleServiceHealth(args);

          case 'dependency_graph':
            return await this.handleDependencyGraph();

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

  private async handleWorkerPoolStatus() {
    if (!this.workerPool) {
      this.workerPool = new WorkerPoolManager({
        type: 'puppeteer',
        maxWorkers: 4,
        minWorkers: 2,
      });
      await this.workerPool.initialize();
    }

    const status = this.workerPool.getStatus();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(status, null, 2),
        },
      ],
    };
  }

  private async handleAddWorkerTask(args: any) {
    if (!this.workerPool) {
      this.workerPool = new WorkerPoolManager({
        type: 'puppeteer',
        maxWorkers: 4,
      });
      await this.workerPool.initialize();
    }

    const taskId = await this.workerPool.addTask({
      type: args.type,
      data: args.data,
      priority: args.priority || 5,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Task added successfully: ${taskId}`,
        },
      ],
    };
  }

  private async handleSelectComponent(args: any) {
    if (!this.schemaMapper) {
      this.schemaMapper = new SchemaComponentMapper();
      await this.schemaMapper.initialize();
    }

    const match = await this.schemaMapper.selectComponent(
      args.useCase,
      args.context
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(match, null, 2),
        },
      ],
    };
  }

  private async handleGenerateComponent(args: any) {
    if (!this.schemaMapper) {
      this.schemaMapper = new SchemaComponentMapper();
      await this.schemaMapper.initialize();
    }

    if (!this.componentBuilder) {
      this.componentBuilder = new NeuralComponentBuilder(this.schemaMapper);
      await this.componentBuilder.initialize();
    }

    const component = await this.componentBuilder.generateComponent({
      useCase: args.useCase,
      context: args.context || {},
    });

    return {
      content: [
        {
          type: 'text',
          text: `Generated Component: ${component.schema.name}\n\n` +
                `Code:\n${component.code}\n\n` +
                `Tests:\n${component.tests || 'N/A'}\n\n` +
                `Styles:\n${component.styles || 'N/A'}`,
        },
      ],
    };
  }

  private async handleListServices(args: any) {
    if (!this.serviceFactory) {
      this.serviceFactory = new SchemaServiceFactory();
      await this.serviceFactory.initialize();
    }

    let services;
    if (args.status === 'running') {
      services = this.serviceFactory.getRunningServices();
    } else {
      services = this.serviceFactory.getAllServices();
      if (args.status === 'stopped') {
        services = services.filter(s => s.status === 'stopped');
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(services, null, 2),
        },
      ],
    };
  }

  private async handleStartService(args: any) {
    if (!this.serviceFactory) {
      this.serviceFactory = new SchemaServiceFactory();
      await this.serviceFactory.initialize();
    }

    const service = await this.serviceFactory.createService(args.serviceId);

    return {
      content: [
        {
          type: 'text',
          text: `Service started: ${service.id} (${service.status})`,
        },
      ],
    };
  }

  private async handleServiceHealth(args: any) {
    if (!this.serviceFactory) {
      this.serviceFactory = new SchemaServiceFactory();
      await this.serviceFactory.initialize();
    }

    if (!this.serviceLinker) {
      this.serviceLinker = new ServiceLinker(this.serviceFactory);
      await this.serviceLinker.initialize();
    }

    const health = this.serviceLinker.getServiceHealth(args.serviceId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(health, null, 2),
        },
      ],
    };
  }

  private async handleDependencyGraph() {
    if (!this.serviceFactory) {
      this.serviceFactory = new SchemaServiceFactory();
      await this.serviceFactory.initialize();
    }

    if (!this.serviceLinker) {
      this.serviceLinker = new ServiceLinker(this.serviceFactory);
      await this.serviceLinker.initialize();
    }

    const graph = this.serviceLinker.getGraphVisualization();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(graph, null, 2),
        },
      ],
    };
  }

  private setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.cleanup();
      process.exit(0);
    });
  }

  private async cleanup() {
    if (this.workerPool) {
      await this.workerPool.shutdown();
    }
    if (this.serviceLinker) {
      await this.serviceLinker.stopServicesInOrder();
    }
    if (this.serviceFactory) {
      await this.serviceFactory.shutdown();
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('LightDom Headless Workers MCP Server running on stdio');
  }
}

// Start server
const server = new HeadlessWorkersMCPServer();
server.run().catch(console.error);
