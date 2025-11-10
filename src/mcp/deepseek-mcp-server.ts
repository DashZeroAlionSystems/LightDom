#!/usr/bin/env node

/**
 * DeepSeek MCP Server
 * MCP server implementation specifically for DeepSeek integration
 * Provides tools for schema management, workflow automation, and code analysis
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { Pool } from 'pg';
import { DeepSeekConfigLoader } from '../config/deepseek-config.js';
import { DeepSeekToolsRegistry, ToolContext } from './deepseek-tools-registry.js';

/**
 * DeepSeek MCP Server Class
 */
class DeepSeekMCPServer {
  private server: Server;
  private db: Pool;
  private toolsRegistry: DeepSeekToolsRegistry;
  private configLoader: DeepSeekConfigLoader;

  constructor() {
    // Initialize MCP server
    this.server = new Server(
      {
        name: 'deepseek-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize database connection
    this.db = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    // Initialize tools registry
    this.toolsRegistry = new DeepSeekToolsRegistry(this.db);

    // Initialize config loader
    this.configLoader = new DeepSeekConfigLoader();

    // Setup handlers
    this.setupHandlers();
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers(): void {
    // Handle list tools request
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = this.toolsRegistry.listTools();
      
      return {
        tools: tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    // Handle tool execution request
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Create tool context
        const context: ToolContext = {
          db: this.db,
          config: this.configLoader.getConfig(),
          sessionId: this.generateSessionId(),
        };

        // Execute tool
        const result = await this.toolsRegistry.executeTool(name, args, context);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: error.message,
                stack: error.stack,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    try {
      // Test database connection
      await this.db.query('SELECT NOW()');
      console.error('✅ Connected to database');

      // Start MCP server with stdio transport
      const transport = new StdioServerTransport();
      await this.server.connect(transport);

      console.error('🚀 DeepSeek MCP Server started successfully');
      console.error('📦 Tools registered:', this.toolsRegistry.listTools().length);
      console.error('⚙️  Configuration loaded');
    } catch (error: any) {
      console.error('❌ Failed to start DeepSeek MCP Server:', error.message);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    await this.db.end();
    await this.server.close();
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new DeepSeekMCPServer();
  
  // Handle shutdown signals
  process.on('SIGINT', async () => {
    console.error('\n📴 Shutting down DeepSeek MCP Server...');
    await server.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('\n📴 Shutting down DeepSeek MCP Server...');
    await server.shutdown();
    process.exit(0);
  });

  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default DeepSeekMCPServer;
