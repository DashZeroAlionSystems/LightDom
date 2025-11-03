/**
 * N8N Workflow Creator API Service
 * 
 * Schema-driven N8N workflow generation with:
 * - Natural language to N8N workflow conversion
 * - Sub-task orchestration
 * - Schema-based workflow control
 * - Webhook integration
 * - API-based workflow management
 */

import axios from 'axios';
import { EventEmitter } from 'events';
import workflowOrchestrator from './workflow-orchestrator.js';

class N8NWorkflowCreatorService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      n8nBaseUrl: config.n8nBaseUrl || process.env.N8N_API_URL || 'http://localhost:5678',
      n8nApiKey: config.n8nApiKey || process.env.N8N_API_KEY,
      webhookUrl: config.webhookUrl || process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook',
      autoActivate: config.autoActivate !== false,
      ...config
    };

    // N8N API client
    this.client = axios.create({
      baseURL: this.config.n8nBaseUrl,
      headers: {
        'X-N8N-API-KEY': this.config.n8nApiKey || '',
        'Content-Type': 'application/json'
      }
    });

    // Workflow templates
    this.templates = new Map();
    
    // Schema mappings for N8N node types
    this.schemaMappings = this.initializeSchemaMappings();
  }

  /**
   * Initialize schema to N8N node mappings
   */
  initializeSchemaMappings() {
    return {
      'crawler': {
        nodeType: 'n8n-nodes-base.httpRequest',
        category: 'data-source',
        config: {
          method: 'GET',
          responseFormat: 'json'
        }
      },
      'ai': {
        nodeType: 'n8n-nodes-base.httpRequest',
        category: 'ai-processing',
        config: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      },
      'seo-analyzer': {
        nodeType: 'n8n-nodes-base.function',
        category: 'processing',
        config: {
          functionCode: `// SEO Analysis
return items.map(item => {
  // Add SEO analysis logic
  return item;
});`
        }
      },
      'data-processor': {
        nodeType: 'n8n-nodes-base.set',
        category: 'transformation',
        config: {
          options: {}
        }
      },
      'database': {
        nodeType: 'n8n-nodes-base.postgres',
        category: 'storage',
        config: {
          operation: 'insert'
        }
      },
      'notification': {
        nodeType: 'n8n-nodes-base.emailSend',
        category: 'notification',
        config: {}
      },
      'webhook-trigger': {
        nodeType: 'n8n-nodes-base.webhook',
        category: 'trigger',
        config: {
          httpMethod: 'POST',
          responseMode: 'onReceived'
        }
      },
      'schedule-trigger': {
        nodeType: 'n8n-nodes-base.scheduleTrigger',
        category: 'trigger',
        config: {
          rule: {}
        }
      }
    };
  }

  /**
   * Create N8N workflow from schema
   */
  async createWorkflowFromSchema(workflowSchema, options = {}) {
    console.log(`🔧 Creating N8N workflow from schema: ${workflowSchema.name || 'Unnamed'}`);

    try {
      // Convert LightDom schema to N8N format
      const n8nWorkflow = this.convertSchemaToN8N(workflowSchema);
      
      // Create workflow via N8N API
      const response = await this.client.post('/api/v1/workflows', n8nWorkflow);
      
      const workflow = response.data;
      
      console.log(`✅ N8N workflow created: ${workflow.id}`);
      
      // Auto-activate if configured
      if (this.config.autoActivate && !workflow.active) {
        await this.activateWorkflow(workflow.id);
      }
      
      this.emit('workflowCreated', workflow);
      
      return workflow;
    } catch (error) {
      console.error('Error creating N8N workflow:', error.message);
      
      // Fallback to mock mode
      return this.createMockWorkflow(workflowSchema);
    }
  }

  /**
   * Convert LightDom workflow schema to N8N format
   */
  convertSchemaToN8N(schema) {
    const nodes = [];
    const connections = {};
    let yPosition = 250;

    // Add trigger node first
    const triggerNode = {
      id: 'trigger',
      name: 'Workflow Trigger',
      type: schema.schedule?.type === 'cron' 
        ? 'n8n-nodes-base.scheduleTrigger'
        : 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [250, yPosition],
      parameters: schema.schedule?.type === 'cron'
        ? {
            rule: {
              interval: [{
                field: 'cronExpression',
                expression: schema.schedule.expression
              }]
            }
          }
        : {
            httpMethod: 'POST',
            path: `lightdom-${schema.id}`,
            responseMode: 'onReceived'
          }
    };
    
    nodes.push(triggerNode);
    yPosition += 150;

    // Convert tasks to nodes
    let previousNodeId = 'trigger';
    
    for (const task of schema.tasks || []) {
      const nodeConfig = this.createNodeFromTask(task, yPosition);
      nodes.push(nodeConfig.node);
      
      // Create connection from previous node
      if (!connections[previousNodeId]) {
        connections[previousNodeId] = { main: [[]] };
      }
      connections[previousNodeId].main[0].push({
        node: nodeConfig.node.id,
        type: 'main',
        index: 0
      });
      
      previousNodeId = nodeConfig.node.id;
      yPosition = nodeConfig.nextY;
    }

    // Build final N8N workflow
    return {
      name: schema.name || 'LightDom Workflow',
      nodes,
      connections,
      active: false,
      settings: {
        saveDataErrorExecution: 'all',
        saveDataSuccessExecution: 'all',
        saveManualExecutions: true,
        timezone: schema.schedule?.timezone || 'UTC'
      },
      tags: schema.metadata?.tags || []
    };
  }

  /**
   * Create N8N node from LightDom task
   */
  createNodeFromTask(task, yPosition) {
    const serviceType = task.service || task.handler?.type || 'data-processor';
    const mapping = this.schemaMappings[serviceType] || this.schemaMappings['data-processor'];
    
    const node = {
      id: task.id,
      name: task.label || task.id,
      type: mapping.nodeType,
      typeVersion: 1,
      position: [250, yPosition],
      parameters: this.convertTaskParametersToN8N(task, mapping)
    };

    return {
      node,
      nextY: yPosition + 150
    };
  }

  /**
   * Convert task parameters to N8N node parameters
   */
  convertTaskParametersToN8N(task, mapping) {
    const params = { ...mapping.config };
    
    // Handle different node types
    if (mapping.nodeType === 'n8n-nodes-base.httpRequest') {
      params.url = task.input?.url || task.input?.seedUrl || '';
      params.method = task.action === 'crawl_pages' ? 'GET' : 'POST';
      params.options = {
        response: {
          response: {
            fullResponse: false,
            neverError: false,
            responseFormat: 'json'
          }
        }
      };
    } else if (mapping.nodeType === 'n8n-nodes-base.function') {
      params.functionCode = this.generateFunctionCode(task);
    } else if (mapping.nodeType === 'n8n-nodes-base.set') {
      params.values = this.convertInputToSetValues(task.input);
    }
    
    return params;
  }

  /**
   * Generate function code for N8N function node
   */
  generateFunctionCode(task) {
    return `// ${task.description || task.label}
// Generated from LightDom workflow

const items = $input.all();

return items.map(item => {
  // Task: ${task.id}
  // Service: ${task.service}
  // Action: ${task.action}
  
  const data = item.json;
  
  // Process data
  const result = {
    ...data,
    taskId: '${task.id}',
    processed: true,
    timestamp: new Date().toISOString()
  };
  
  return { json: result };
});`;
  }

  /**
   * Convert input parameters to N8N Set node values
   */
  convertInputToSetValues(input) {
    const values = {};
    
    for (const [key, value] of Object.entries(input || {})) {
      values[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    
    return values;
  }

  /**
   * Create workflow from natural language prompt
   */
  async createWorkflowFromPrompt(prompt, options = {}) {
    console.log(`🤖 Creating N8N workflow from prompt: "${prompt.substring(0, 50)}..."`);

    try {
      // Generate workflow schema using DeepSeek/Ollama
      const workflow = await workflowOrchestrator.createWorkflowFromPrompt(prompt, options);
      
      // Convert to N8N workflow
      const n8nWorkflow = await this.createWorkflowFromSchema(workflow.schema, options);
      
      return {
        lightdomWorkflow: workflow,
        n8nWorkflow: n8nWorkflow
      };
    } catch (error) {
      console.error('Error creating workflow from prompt:', error);
      throw error;
    }
  }

  /**
   * Create sub-task workflow
   */
  async createSubTaskWorkflow(parentWorkflowId, subTasks, options = {}) {
    console.log(`📋 Creating sub-task workflow for parent: ${parentWorkflowId}`);

    const subWorkflowSchema = {
      id: `${parentWorkflowId}_subtasks`,
      name: `${parentWorkflowId} - Sub Tasks`,
      description: 'Auto-generated sub-task workflow',
      tasks: subTasks,
      schedule: options.schedule,
      state: {
        persistenceType: 'database',
        parentWorkflowId
      }
    };

    return await this.createWorkflowFromSchema(subWorkflowSchema, options);
  }

  /**
   * Activate N8N workflow
   */
  async activateWorkflow(workflowId) {
    try {
      await this.client.patch(`/api/v1/workflows/${workflowId}`, {
        active: true
      });
      
      console.log(`✅ Activated N8N workflow: ${workflowId}`);
      this.emit('workflowActivated', { workflowId });
    } catch (error) {
      console.error('Error activating workflow:', error.message);
      throw error;
    }
  }

  /**
   * Deactivate N8N workflow
   */
  async deactivateWorkflow(workflowId) {
    try {
      await this.client.patch(`/api/v1/workflows/${workflowId}`, {
        active: false
      });
      
      console.log(`⏸️  Deactivated N8N workflow: ${workflowId}`);
      this.emit('workflowDeactivated', { workflowId });
    } catch (error) {
      console.error('Error deactivating workflow:', error.message);
      throw error;
    }
  }

  /**
   * Execute N8N workflow manually
   */
  async executeWorkflow(workflowId, data = {}) {
    try {
      const response = await this.client.post(`/api/v1/workflows/${workflowId}/execute`, {
        data
      });
      
      console.log(`▶️  Executed N8N workflow: ${workflowId}`);
      this.emit('workflowExecuted', { workflowId, execution: response.data });
      
      return response.data;
    } catch (error) {
      console.error('Error executing workflow:', error.message);
      throw error;
    }
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId) {
    try {
      const response = await this.client.get(`/api/v1/executions/${executionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting execution status:', error.message);
      throw error;
    }
  }

  /**
   * List all N8N workflows
   */
  async listWorkflows() {
    try {
      const response = await this.client.get('/api/v1/workflows');
      return response.data;
    } catch (error) {
      console.error('Error listing workflows:', error.message);
      return [];
    }
  }

  /**
   * Delete N8N workflow
   */
  async deleteWorkflow(workflowId) {
    try {
      await this.client.delete(`/api/v1/workflows/${workflowId}`);
      console.log(`🗑️  Deleted N8N workflow: ${workflowId}`);
      this.emit('workflowDeleted', { workflowId });
    } catch (error) {
      console.error('Error deleting workflow:', error.message);
      throw error;
    }
  }

  /**
   * Create mock workflow (fallback when N8N API is unavailable)
   */
  createMockWorkflow(schema) {
    console.log('⚠️  N8N API unavailable, creating mock workflow');
    
    return {
      id: `mock_${Date.now()}`,
      name: schema.name || 'Mock Workflow',
      active: false,
      nodes: [],
      connections: {},
      createdAt: new Date().toISOString(),
      mock: true
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/healthz');
      return {
        status: 'healthy',
        n8nVersion: response.data.version || 'unknown',
        available: true
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        available: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const n8nService = new N8NWorkflowCreatorService();

export default n8nService;
export { N8NWorkflowCreatorService };
