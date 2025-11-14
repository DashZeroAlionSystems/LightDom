/**
 * N8N MCP Server
 * 
 * Model Context Protocol server for n8n workflow management
 * Exposes n8n workflows as tools for AI agents (DeepSeek, Claude, etc.)
 * 
 * Features:
 * - MCP-compliant tool definitions
 * - Workflow execution via MCP
 * - Real-time workflow monitoring
 * - Schema-based validation
 * - SSE streaming support
 */

import { EventEmitter } from 'events';
import express from 'express';
import axios from 'axios';
import { n8nSchemaGenerator } from './n8n-schema-generator.js';

class N8NMCPServer extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      port: config.port || process.env.MCP_PORT || 8090,
      n8nBaseUrl: config.n8nBaseUrl || process.env.N8N_API_URL || 'http://localhost:5678',
      n8nApiKey: config.n8nApiKey || process.env.N8N_API_KEY,
      mcpBasePath: config.mcpBasePath || '/mcp',
      authToken: config.authToken || process.env.MCP_AUTH_TOKEN,
      ...config
    };

    this.app = express();
    this.server = null;
    
    // N8N client
    this.n8nClient = axios.create({
      baseURL: this.config.n8nBaseUrl,
      headers: {
        'X-N8N-API-KEY': this.config.n8nApiKey || '',
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    // Tool registry
    this.tools = new Map();
    
    // Execution tracking
    this.executions = new Map();

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    this.app.use(express.json());
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      
      next();
    });

    // Authentication middleware
    this.app.use((req, res, next) => {
      if (req.path === `${this.config.mcpBasePath}/health`) {
        return next();
      }

      const authHeader = req.headers.authorization;
      
      if (this.config.authToken && authHeader !== `Bearer ${this.config.authToken}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      next();
    });

    // Logging
    this.app.use((req, res, next) => {
      console.log(`[MCP] ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup MCP routes
   */
  setupRoutes() {
    const basePath = this.config.mcpBasePath;

    // Health check
    this.app.get(`${basePath}/health`, (req, res) => {
      res.json({ 
        status: 'healthy',
        version: '1.0.0',
        protocol: 'mcp',
        tools: this.tools.size
      });
    });

    // List available tools
    this.app.get(`${basePath}/tools`, async (req, res) => {
      try {
        const toolsList = Array.from(this.tools.values());
        res.json({ tools: toolsList });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get specific tool definition
    this.app.get(`${basePath}/tools/:toolName`, async (req, res) => {
      try {
        const tool = this.tools.get(req.params.toolName);
        
        if (!tool) {
          return res.status(404).json({ error: 'Tool not found' });
        }

        res.json({ tool });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Execute tool (invoke workflow)
    this.app.post(`${basePath}/tools/:toolName/execute`, async (req, res) => {
      try {
        const toolName = req.params.toolName;
        const tool = this.tools.get(toolName);
        
        if (!tool) {
          return res.status(404).json({ error: 'Tool not found' });
        }

        const input = req.body.input || {};
        
        // Validate input against schema
        const validation = await this.validateInput(tool, input);
        if (!validation.valid) {
          return res.status(400).json({ 
            error: 'Invalid input',
            details: validation.errors
          });
        }

        // Execute workflow
        const result = await this.executeWorkflow(tool.workflowId, input);
        
        res.json({
          success: true,
          executionId: result.executionId,
          result: result.data
        });
      } catch (error) {
        res.status(500).json({ 
          error: error.message,
          success: false
        });
      }
    });

    // Get execution status
    this.app.get(`${basePath}/executions/:executionId`, async (req, res) => {
      try {
        const { executionId } = req.params;
        const execution = await this.getExecutionStatus(executionId);
        
        res.json({ execution });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // SSE endpoint for real-time updates
    this.app.get(`${basePath}/stream`, (req, res) => {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      // Send initial connection message
      res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

      // Handle execution events
      const executionHandler = (data) => {
        res.write(`data: ${JSON.stringify({ type: 'execution', ...data })}\n\n`);
      };

      this.on('execution_update', executionHandler);

      // Cleanup on disconnect
      req.on('close', () => {
        this.off('execution_update', executionHandler);
        res.end();
      });
    });

    // Refresh tools from n8n
    this.app.post(`${basePath}/refresh`, async (req, res) => {
      try {
        await this.refreshTools();
        res.json({ 
          success: true,
          tools: this.tools.size
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  /**
   * Start MCP server
   */
  async start() {
    try {
      // Load tools from n8n
      await this.refreshTools();

      // Start server
      this.server = this.app.listen(this.config.port, () => {
        console.log(`✅ N8N MCP Server running on port ${this.config.port}`);
        console.log(`📊 Loaded ${this.tools.size} tools from n8n workflows`);
        console.log(`🔗 MCP endpoint: http://localhost:${this.config.port}${this.config.mcpBasePath}`);
      });

      return this.server;
    } catch (error) {
      console.error('Failed to start MCP server:', error);
      throw error;
    }
  }

  /**
   * Stop MCP server
   */
  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('MCP server stopped');
          resolve();
        });
      });
    }
  }

  /**
   * Refresh tools from n8n workflows
   */
  async refreshTools() {
    try {
      console.log('🔄 Refreshing tools from n8n...');
      
      // Generate schemas for all workflows
      const { schemas } = await n8nSchemaGenerator.generateAllSchemas();
      
      // Clear existing tools
      this.tools.clear();
      
      // Register each workflow as an MCP tool
      for (const schema of schemas) {
        const tool = this.createToolFromSchema(schema);
        this.tools.set(tool.name, tool);
      }

      console.log(`✅ Loaded ${this.tools.size} tools`);
      
      this.emit('tools_refreshed', { count: this.tools.size });
    } catch (error) {
      console.error('Failed to refresh tools:', error);
      throw error;
    }
  }

  /**
   * Create MCP tool definition from workflow schema
   */
  createToolFromSchema(schema) {
    return {
      name: schema.mcpTool.name,
      description: schema.mcpTool.description,
      inputSchema: schema.mcpTool.inputSchema,
      outputSchema: schema.mcpTool.outputSchema,
      workflowId: schema.workflowId,
      workflowName: schema.workflowName,
      metadata: {
        ...schema.metadata,
        mcpVersion: '1.0.0'
      }
    };
  }

  /**
   * Validate tool input
   */
  async validateInput(tool, input) {
    const errors = [];
    
    // Check required fields
    if (tool.inputSchema.required) {
      for (const field of tool.inputSchema.required) {
        if (!input[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Type checking (basic)
    if (tool.inputSchema.properties) {
      for (const [field, schema] of Object.entries(tool.inputSchema.properties)) {
        if (input[field] !== undefined) {
          const actualType = Array.isArray(input[field]) ? 'array' : typeof input[field];
          if (schema.type && schema.type !== actualType) {
            errors.push(`Field ${field} should be type ${schema.type}, got ${actualType}`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Execute n8n workflow
   */
  async executeWorkflow(workflowId, input) {
    try {
      console.log(`🚀 Executing workflow ${workflowId}`);
      
      // Execute workflow via n8n API
      const response = await this.n8nClient.post(`/api/v1/workflows/${workflowId}/execute`, {
        data: input
      });

      const executionId = response.data.data.executionId;
      
      // Track execution
      this.executions.set(executionId, {
        workflowId,
        startTime: Date.now(),
        status: 'running',
        input
      });

      // Emit event
      this.emit('execution_update', {
        executionId,
        workflowId,
        status: 'started',
        timestamp: Date.now()
      });

      // Wait for completion (with timeout)
      const result = await this.waitForExecution(executionId);
      
      return {
        executionId,
        data: result
      };
    } catch (error) {
      console.error('Workflow execution failed:', error);
      throw error;
    }
  }

  /**
   * Wait for workflow execution to complete
   */
  async waitForExecution(executionId, timeout = 60000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const status = await this.getExecutionStatus(executionId);
        
        if (status.finished) {
          this.emit('execution_update', {
            executionId,
            status: 'completed',
            timestamp: Date.now()
          });
          
          return status.data;
        }

        // Wait before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error checking execution status:', error);
      }
    }

    throw new Error('Execution timeout');
  }

  /**
   * Get execution status from n8n
   */
  async getExecutionStatus(executionId) {
    try {
      const response = await this.n8nClient.get(`/api/v1/executions/${executionId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Failed to get execution status:', error);
      throw error;
    }
  }

  /**
   * Get all registered tools
   */
  getTools() {
    return Array.from(this.tools.values());
  }

  /**
   * Get specific tool
   */
  getTool(toolName) {
    return this.tools.get(toolName);
  }
}

export default N8NMCPServer;

// Export singleton instance
export const n8nMCPServer = new N8NMCPServer();
