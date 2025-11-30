/**
 * Linked Schema to N8N Workflow Converter
 * 
 * Converts linked schema relationships into executable n8n workflows
 * with support for:
 * - Template-based workflow generation
 * - DeepSeek AI-powered configuration
 * - Dynamic node composition
 * - Status indicators and animations
 * 
 * @module services/linked-schema-n8n-converter
 */

import { EventEmitter } from 'events';
import { NeuralRelationshipPredictor } from './neural-relationship-predictor.js';

/**
 * N8N Node Templates
 */
const N8N_NODE_TEMPLATES = {
  // Trigger nodes
  webhook: {
    type: 'n8n-nodes-base.webhook',
    name: 'Webhook Trigger',
    parameters: {
      httpMethod: 'POST',
      path: '{{path}}',
      responseMode: 'responseNode',
    },
  },
  
  schedule: {
    type: 'n8n-nodes-base.scheduleTrigger',
    name: 'Schedule Trigger',
    parameters: {
      rule: {
        interval: [
          {
            field: 'cronExpression',
            expression: '{{cron}}',
          },
        ],
      },
    },
  },
  
  // Processing nodes
  function: {
    type: 'n8n-nodes-base.function',
    name: '{{name}}',
    parameters: {
      functionCode: '{{code}}',
    },
  },
  
  httpRequest: {
    type: 'n8n-nodes-base.httpRequest',
    name: '{{name}}',
    parameters: {
      method: '{{method}}',
      url: '{{url}}',
      headers: '{{headers}}',
      body: '{{body}}',
    },
  },
  
  // Database nodes
  postgres: {
    type: 'n8n-nodes-base.postgres',
    name: '{{name}}',
    parameters: {
      operation: '{{operation}}',
      query: '{{query}}',
    },
  },
  
  // Response nodes
  respondWebhook: {
    type: 'n8n-nodes-base.respondToWebhook',
    name: 'Response',
    parameters: {
      respondWith: 'json',
      responseBody: '={{JSON.stringify($json)}}',
    },
  },
  
  // Conditional nodes
  ifNode: {
    type: 'n8n-nodes-base.if',
    name: '{{name}}',
    parameters: {
      conditions: {
        string: [
          {
            value1: '={{$json["{{field}}"]}}',
            operation: '{{operation}}',
            value2: '{{value}}',
          },
        ],
      },
    },
  },
  
  // Set node
  set: {
    type: 'n8n-nodes-base.set',
    name: '{{name}}',
    parameters: {
      values: {
        string: '{{values}}',
      },
    },
  },
  
  // Code node (for complex logic)
  code: {
    type: 'n8n-nodes-base.code',
    name: '{{name}}',
    parameters: {
      jsCode: '{{code}}',
    },
  },
};

/**
 * Workflow Templates
 */
const WORKFLOW_TEMPLATES = {
  // CRUD workflow
  crud: {
    name: '{{entity}} CRUD Operations',
    description: 'CRUD operations for {{entity}}',
    nodes: ['webhook', 'function', 'postgres', 'respondWebhook'],
    defaultConfig: {
      operations: ['create', 'read', 'update', 'delete'],
    },
  },
  
  // Data processing workflow
  dataProcessing: {
    name: '{{name}} Data Pipeline',
    description: 'Process and transform data from {{source}}',
    nodes: ['webhook', 'function', 'httpRequest', 'function', 'postgres', 'respondWebhook'],
    defaultConfig: {
      transformations: ['validate', 'transform', 'enrich'],
    },
  },
  
  // Notification workflow
  notification: {
    name: '{{name}} Notification',
    description: 'Send notifications via {{channels}}',
    nodes: ['webhook', 'ifNode', 'httpRequest', 'respondWebhook'],
    defaultConfig: {
      channels: ['email', 'slack', 'webhook'],
    },
  },
  
  // Component status workflow
  componentStatus: {
    name: '{{component}} Status Monitor',
    description: 'Monitor status of {{component}} and trigger updates',
    nodes: ['schedule', 'httpRequest', 'ifNode', 'function', 'httpRequest'],
    defaultConfig: {
      checkInterval: '*/5 * * * *',
      statusEndpoint: '/api/status',
    },
  },
  
  // Schema validation workflow
  schemaValidation: {
    name: '{{schema}} Validation',
    description: 'Validate data against {{schema}} schema',
    nodes: ['webhook', 'function', 'ifNode', 'respondWebhook'],
    defaultConfig: {
      strictMode: true,
    },
  },
  
  // AI-powered workflow
  aiPowered: {
    name: 'AI {{purpose}}',
    description: 'AI-powered {{purpose}} using DeepSeek',
    nodes: ['webhook', 'function', 'httpRequest', 'function', 'respondWebhook'],
    defaultConfig: {
      aiModel: 'deepseek-chat',
      maxTokens: 4000,
    },
  },
};

/**
 * Linked Schema to N8N Workflow Converter
 */
export class LinkedSchemaN8nConverter extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      apiBaseUrl: options.apiBaseUrl || 'http://localhost:3001',
      n8nBaseUrl: options.n8nBaseUrl || 'http://localhost:5678',
      deepseekApiUrl: options.deepseekApiUrl || 'https://api.deepseek.com/v1',
      deepseekApiKey: options.deepseekApiKey || process.env.DEEPSEEK_API_KEY,
      ...options,
    };
    
    // Neural relationship predictor
    this.predictor = new NeuralRelationshipPredictor();
    
    // Generated workflows cache
    this.workflowCache = new Map();
    
    // Metrics
    this.metrics = {
      workflowsGenerated: 0,
      nodesGenerated: 0,
      templatesUsed: 0,
    };
  }

  /**
   * Convert linked schema to n8n workflow
   */
  async convertSchemaToWorkflow(linkedSchema, options = {}) {
    const {
      templateType = 'dataProcessing',
      includeStatusIndicators = true,
      includeAnimations = true,
      generateDeepSeekConfig = false,
    } = options;
    
    // Get relationship predictions
    const relationships = await this.predictor.predictRelationships(linkedSchema, {
      preferN8n: true,
      preferAnimations: includeAnimations,
    });
    
    // Select template
    const template = WORKFLOW_TEMPLATES[templateType] || WORKFLOW_TEMPLATES.dataProcessing;
    
    // Generate workflow configuration
    let workflowConfig = this._generateWorkflowConfig(linkedSchema, template, relationships);
    
    // Optionally enhance with DeepSeek
    if (generateDeepSeekConfig && this.options.deepseekApiKey) {
      workflowConfig = await this._enhanceWithDeepSeek(workflowConfig, linkedSchema);
    }
    
    // Build workflow nodes
    const workflow = this._buildWorkflow(workflowConfig, linkedSchema, relationships);
    
    // Add status indicator nodes if requested
    if (includeStatusIndicators) {
      this._addStatusIndicatorNodes(workflow, linkedSchema);
    }
    
    // Cache workflow
    this.workflowCache.set(linkedSchema.id || linkedSchema.name, workflow);
    this.metrics.workflowsGenerated++;
    
    this.emit('workflow:converted', {
      schema: linkedSchema.id || linkedSchema.name,
      nodeCount: workflow.nodes.length,
    });
    
    return workflow;
  }

  /**
   * Generate workflow configuration from schema and template
   */
  _generateWorkflowConfig(schema, template, relationships) {
    const schemaName = schema.name || schema.id || 'Unknown';
    
    const config = {
      name: this._interpolate(template.name, { 
        entity: schemaName,
        name: schemaName,
        component: schemaName,
        schema: schemaName,
        purpose: schema.purpose || 'Processing',
      }),
      description: this._interpolate(template.description, {
        entity: schemaName,
        source: schema.dataSource || 'API',
        channels: schema.channels?.join(', ') || 'webhook',
        component: schemaName,
        schema: schemaName,
      }),
      nodeTypes: template.nodes,
      defaultConfig: template.defaultConfig,
      schema,
      relationships,
    };
    
    return config;
  }

  /**
   * Interpolate template variables
   */
  _interpolate(template, variables) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  /**
   * Enhance workflow configuration with DeepSeek
   */
  async _enhanceWithDeepSeek(config, schema) {
    try {
      const prompt = `Given this schema and workflow configuration, generate enhanced n8n node configurations.

Schema: ${JSON.stringify(schema, null, 2)}
Configuration: ${JSON.stringify(config, null, 2)}

Generate JSON with:
1. Enhanced node parameters
2. Validation logic
3. Error handling
4. Data transformations

Output JSON only.`;

      const response = await fetch(`${this.options.deepseekApiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.options.deepseekApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const data = await response.json();
      const enhancedConfig = JSON.parse(data.choices[0].message.content);
      
      return {
        ...config,
        enhanced: enhancedConfig,
        deepseekEnhanced: true,
      };
    } catch (error) {
      console.error('DeepSeek enhancement failed:', error);
      return config;
    }
  }

  /**
   * Build workflow from configuration
   */
  _buildWorkflow(config, schema, relationships) {
    const nodes = [];
    const connections = {};
    let position = [100, 200];
    let previousNodeId = null;
    
    config.nodeTypes.forEach((nodeType, index) => {
      const template = N8N_NODE_TEMPLATES[nodeType];
      if (!template) return;
      
      const nodeId = `node_${index}`;
      const node = this._createNode(template, nodeType, schema, config, nodeId, position);
      
      nodes.push(node);
      
      // Create connection from previous node
      if (previousNodeId) {
        connections[previousNodeId] = {
          main: [[{ node: nodeId }]],
        };
      }
      
      previousNodeId = nodeId;
      position = [position[0] + 200, position[1]];
      this.metrics.nodesGenerated++;
    });
    
    const workflow = {
      name: config.name,
      description: config.description,
      nodes,
      connections,
      active: false,
      settings: {
        saveExecutionProgress: true,
        saveManualExecutions: true,
      },
      tags: this._generateTags(schema),
      staticData: null,
      meta: {
        generatedFrom: 'linked-schema-converter',
        schemaId: schema.id || schema.name,
        relationships: relationships.map(r => ({ type: r.type, confidence: r.confidence })),
        generatedAt: new Date().toISOString(),
      },
    };
    
    this.metrics.templatesUsed++;
    
    return workflow;
  }

  /**
   * Create a node from template
   */
  _createNode(template, nodeType, schema, config, nodeId, position) {
    const schemaName = schema.name || schema.id || 'data';
    const node = {
      id: nodeId,
      name: this._interpolate(template.name, { 
        name: this._getNodeName(nodeType, schemaName),
      }),
      type: template.type,
      position: [...position],
      parameters: {},
    };
    
    // Process parameters
    Object.entries(template.parameters).forEach(([key, value]) => {
      if (typeof value === 'string') {
        node.parameters[key] = this._interpolateParameter(value, schema, config, nodeType);
      } else {
        node.parameters[key] = value;
      }
    });
    
    return node;
  }

  /**
   * Get node name based on type
   */
  _getNodeName(nodeType, schemaName) {
    const names = {
      webhook: `${schemaName} Webhook`,
      schedule: `${schemaName} Schedule`,
      function: `Process ${schemaName}`,
      httpRequest: `API Request`,
      postgres: `Store ${schemaName}`,
      respondWebhook: 'Response',
      ifNode: `Check ${schemaName}`,
      set: `Set ${schemaName} Data`,
      code: `${schemaName} Logic`,
    };
    return names[nodeType] || schemaName;
  }

  /**
   * Interpolate parameter value
   */
  _interpolateParameter(value, schema, config, nodeType) {
    const schemaName = schema.name || schema.id || 'data';
    
    const replacements = {
      '{{path}}': schemaName.toLowerCase().replace(/\s+/g, '-'),
      '{{cron}}': config.defaultConfig?.checkInterval || '0 * * * *',
      '{{name}}': this._getNodeName(nodeType, schemaName),
      '{{method}}': 'POST',
      '{{url}}': `${this.options.apiBaseUrl}/api/${schemaName.toLowerCase()}`,
      '{{headers}}': JSON.stringify({ 'Content-Type': 'application/json' }),
      '{{body}}': '={{ JSON.stringify($json) }}',
      '{{operation}}': 'insert',
      '{{query}}': this._generateQuery(schema, config),
      '{{code}}': this._generateFunctionCode(schema, nodeType),
      '{{field}}': 'status',
      '{{value}}': 'success',
    };
    
    Object.entries(replacements).forEach(([key, replacement]) => {
      value = value.replace(key, replacement);
    });
    
    return value;
  }

  /**
   * Generate SQL query for schema
   */
  _generateQuery(schema, config) {
    const tableName = (schema.name || schema.id || 'data').toLowerCase().replace(/\s+/g, '_');
    const operation = config.defaultConfig?.operations?.[0] || 'insert';
    
    if (operation === 'insert') {
      return `INSERT INTO ${tableName} (data, created_at) VALUES ($1, NOW()) RETURNING *`;
    } else if (operation === 'read') {
      return `SELECT * FROM ${tableName} WHERE id = $1`;
    }
    
    return `SELECT * FROM ${tableName}`;
  }

  /**
   * Generate function code for schema processing
   */
  _generateFunctionCode(schema, nodeType) {
    if (nodeType === 'function') {
      return `// Process ${schema.name || 'data'}
const items = $input.all();

return items.map(item => {
  const data = item.json;
  
  // Validate required fields
  const required = ${JSON.stringify(schema.required || [])};
  for (const field of required) {
    if (!data[field]) {
      throw new Error(\`Missing required field: \${field}\`);
    }
  }
  
  // Transform data
  return {
    json: {
      ...data,
      processed: true,
      processedAt: new Date().toISOString(),
    }
  };
});`;
    }
    
    return 'return items;';
  }

  /**
   * Generate tags for workflow
   */
  _generateTags(schema) {
    const tags = ['auto-generated', 'linked-schema'];
    
    if (schema.category) tags.push(schema.category);
    if (schema.type) tags.push(schema.type);
    if (schema.domain) tags.push(schema.domain);
    
    return tags;
  }

  /**
   * Add status indicator nodes to workflow
   */
  _addStatusIndicatorNodes(workflow, schema) {
    const statusNodeId = `status_indicator`;
    const lastNodeId = workflow.nodes[workflow.nodes.length - 1]?.id;
    
    // Add status update node
    const statusNode = {
      id: statusNodeId,
      name: 'Update Status Indicator',
      type: 'n8n-nodes-base.function',
      position: [workflow.nodes[workflow.nodes.length - 1].position[0] + 200, 200],
      parameters: {
        functionCode: `// Status indicator update
const result = $input.first().json;
const success = !result.error;

return [{
  json: {
    status: success ? 'success' : 'error',
    icon: success ? 'CheckCircle' : 'CloseCircle',
    color: success ? '#52c41a' : '#ff4d4f',
    animation: {
      animejs: success ? {
        targets: 'element',
        scale: [0.8, 1.1, 1],
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutElastic(1, .5)',
      } : {
        targets: 'element',
        translateX: [-5, 5, -5, 5, 0],
        duration: 400,
        easing: 'easeInOutQuad',
      },
    },
    message: success ? 'Operation completed' : result.error || 'Operation failed',
    timestamp: new Date().toISOString(),
  }
}];`,
      },
    };
    
    workflow.nodes.push(statusNode);
    
    // Update connections
    if (lastNodeId) {
      workflow.connections[lastNodeId] = {
        main: [[{ node: statusNodeId }]],
      };
    }
  }

  /**
   * Create workflow from multiple linked schemas
   */
  async createCompositeWorkflow(schemas, options = {}) {
    const {
      name = 'Composite Workflow',
      description = 'Workflow combining multiple linked schemas',
      executionMode = 'sequential', // 'sequential' | 'parallel'
    } = options;
    
    const nodes = [];
    const connections = {};
    let position = [100, 200];
    let previousNodeId = null;
    
    // Add trigger node
    const triggerId = 'trigger';
    nodes.push({
      id: triggerId,
      name: 'Composite Trigger',
      type: 'n8n-nodes-base.webhook',
      position: [...position],
      parameters: {
        httpMethod: 'POST',
        path: name.toLowerCase().replace(/\s+/g, '-'),
        responseMode: 'responseNode',
      },
    });
    previousNodeId = triggerId;
    position[0] += 200;
    
    // Process each schema
    for (let i = 0; i < schemas.length; i++) {
      const schema = schemas[i];
      const schemaWorkflow = await this.convertSchemaToWorkflow(schema, {
        templateType: 'dataProcessing',
        includeStatusIndicators: false,
      });
      
      // Add schema processing nodes
      schemaWorkflow.nodes.forEach((node, nodeIndex) => {
        // Skip webhook triggers from sub-workflows
        if (node.type === 'n8n-nodes-base.webhook') return;
        
        const nodeId = `schema_${i}_node_${nodeIndex}`;
        nodes.push({
          ...node,
          id: nodeId,
          name: `[${schema.name || schema.id}] ${node.name}`,
          position: [...position],
        });
        
        if (executionMode === 'sequential' && previousNodeId) {
          connections[previousNodeId] = {
            main: [[{ node: nodeId }]],
          };
        }
        
        previousNodeId = nodeId;
        position[0] += 200;
      });
    }
    
    // Add final response node
    const responseId = 'response';
    nodes.push({
      id: responseId,
      name: 'Response',
      type: 'n8n-nodes-base.respondToWebhook',
      position: [...position],
      parameters: {
        respondWith: 'json',
        responseBody: '={{ JSON.stringify($json) }}',
      },
    });
    
    if (previousNodeId) {
      connections[previousNodeId] = {
        main: [[{ node: responseId }]],
      };
    }
    
    const workflow = {
      name,
      description,
      nodes,
      connections,
      active: false,
      settings: {
        saveExecutionProgress: true,
        saveManualExecutions: true,
      },
      tags: ['composite', 'auto-generated', 'linked-schema'],
      meta: {
        generatedFrom: 'linked-schema-converter',
        schemasIncluded: schemas.map(s => s.id || s.name),
        executionMode,
        generatedAt: new Date().toISOString(),
      },
    };
    
    this.emit('composite:created', {
      name,
      schemaCount: schemas.length,
      nodeCount: nodes.length,
    });
    
    return workflow;
  }

  /**
   * Generate DeepSeek-compatible tool definitions for workflows
   */
  generateDeepSeekTools(workflows) {
    return workflows.map(workflow => ({
      type: 'function',
      function: {
        name: workflow.name.toLowerCase().replace(/\s+/g, '_'),
        description: workflow.description,
        parameters: {
          type: 'object',
          properties: this._extractWorkflowInputSchema(workflow),
          required: this._extractRequiredInputs(workflow),
        },
      },
      n8nWorkflowId: workflow.id,
      meta: workflow.meta,
    }));
  }

  /**
   * Extract input schema from workflow
   */
  _extractWorkflowInputSchema(workflow) {
    const properties = {};
    
    // Find webhook trigger parameters
    const webhookNode = workflow.nodes.find(n => n.type === 'n8n-nodes-base.webhook');
    if (webhookNode) {
      properties.data = {
        type: 'object',
        description: 'Input data for the workflow',
      };
    }
    
    // Add common parameters
    properties.options = {
      type: 'object',
      description: 'Execution options',
      properties: {
        timeout: { type: 'number', description: 'Timeout in milliseconds' },
        async: { type: 'boolean', description: 'Run asynchronously' },
      },
    };
    
    return properties;
  }

  /**
   * Extract required inputs from workflow
   */
  _extractRequiredInputs(workflow) {
    return ['data'];
  }

  /**
   * Get cached workflow
   */
  getCachedWorkflow(schemaId) {
    return this.workflowCache.get(schemaId);
  }

  /**
   * Clear workflow cache
   */
  clearCache() {
    this.workflowCache.clear();
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      cachedWorkflows: this.workflowCache.size,
      predictorMetrics: this.predictor.getMetrics(),
    };
  }

  /**
   * Get available templates
   */
  getTemplates() {
    return Object.entries(WORKFLOW_TEMPLATES).map(([key, template]) => ({
      key,
      name: template.name,
      description: template.description,
      nodeCount: template.nodes.length,
      defaultConfig: template.defaultConfig,
    }));
  }

  /**
   * Get available node templates
   */
  getNodeTemplates() {
    return Object.entries(N8N_NODE_TEMPLATES).map(([key, template]) => ({
      key,
      type: template.type,
      name: template.name,
    }));
  }
}

export { WORKFLOW_TEMPLATES, N8N_NODE_TEMPLATES };
export default LinkedSchemaN8nConverter;
