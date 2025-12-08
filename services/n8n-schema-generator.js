/**
 * N8N Schema Generator Service
 * 
 * Generates real schemas from n8n workflows for DeepSeek integration
 * Provides schema validation, type definitions, and workflow metadata extraction
 * 
 * Features:
 * - Automatic schema extraction from n8n workflows
 * - OpenAPI/JSON Schema generation
 * - Workflow node analysis and documentation
 * - Type-safe schema definitions
 * - MCP-compatible schema format
 */

import axios from 'axios';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

class N8NSchemaGenerator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      n8nBaseUrl: config.n8nBaseUrl || process.env.N8N_API_URL || 'http://localhost:5678',
      n8nApiKey: config.n8nApiKey || process.env.N8N_API_KEY,
      outputDir: config.outputDir || './schemas/n8n',
      ...config
    };

    // N8N API client
    this.client = axios.create({
      baseURL: this.config.n8nBaseUrl,
      headers: {
        'X-N8N-API-KEY': this.config.n8nApiKey || '',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    // Schema cache
    this.schemaCache = new Map();
    
    // Node type definitions
    this.nodeTypeDefinitions = new Map();
  }

  /**
   * Generate schemas from all workflows in n8n
   */
  async generateAllSchemas() {
    try {
      console.log('📊 Fetching workflows from n8n...');
      
      // Fetch all workflows
      const workflows = await this.fetchAllWorkflows();
      console.log(`✅ Found ${workflows.length} workflows`);

      const schemas = [];
      
      for (const workflow of workflows) {
        try {
          const schema = await this.generateWorkflowSchema(workflow);
          schemas.push(schema);
          
          // Cache schema
          this.schemaCache.set(workflow.id, schema);
          
          this.emit('schema_generated', { workflowId: workflow.id, schema });
        } catch (error) {
          console.error(`❌ Failed to generate schema for workflow ${workflow.id}:`, error.message);
        }
      }

      // Save schemas to files
      await this.saveSchemas(schemas);

      console.log(`✅ Generated ${schemas.length} schemas`);
      
      return {
        success: true,
        schemas,
        count: schemas.length
      };
    } catch (error) {
      console.error('❌ Schema generation failed:', error);
      throw error;
    }
  }

  /**
   * Fetch all workflows from n8n
   */
  async fetchAllWorkflows() {
    try {
      const response = await this.client.get('/api/v1/workflows');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Failed to fetch workflows:', error.message);
      return [];
    }
  }

  /**
   * Generate schema for a specific workflow
   */
  async generateWorkflowSchema(workflow) {
    const nodes = workflow.nodes || [];
    const connections = workflow.connections || {};
    
    // Extract input/output parameters
    const inputs = this.extractInputParameters(nodes);
    const outputs = this.extractOutputParameters(nodes);
    const nodeSchemas = this.generateNodeSchemas(nodes);
    
    // Generate OpenAPI-compatible schema
    const schema = {
      workflowId: workflow.id,
      workflowName: workflow.name,
      version: '1.0.0',
      description: workflow.description || `Auto-generated schema for ${workflow.name}`,
      tags: workflow.tags || [],
      active: workflow.active,
      
      // Input schema
      input: {
        type: 'object',
        properties: inputs,
        required: Object.keys(inputs).filter(key => inputs[key].required)
      },
      
      // Output schema
      output: {
        type: 'object',
        properties: outputs
      },
      
      // Node definitions
      nodes: nodeSchemas,
      
      // Workflow graph
      graph: {
        nodes: nodes.map(node => ({
          id: node.id,
          name: node.name,
          type: node.type,
          position: node.position
        })),
        connections
      },
      
      // MCP tool definition
      mcpTool: this.generateMCPToolDefinition(workflow, inputs, outputs),
      
      // DeepSeek function calling schema
      deepseekFunction: this.generateDeepSeekFunctionSchema(workflow, inputs, outputs),
      
      metadata: {
        createdAt: workflow.createdAt,
        updatedAt: workflow.updatedAt,
        nodeCount: nodes.length,
        triggerType: this.detectTriggerType(nodes),
        categories: this.categorizeWorkflow(nodes)
      }
    };

    return schema;
  }

  /**
   * Extract input parameters from workflow nodes
   */
  extractInputParameters(nodes) {
    const inputs = {};
    
    // Find trigger/start nodes
    const triggerNodes = nodes.filter(node => 
      node.type.includes('trigger') || 
      node.type.includes('webhook') ||
      node.type.includes('manual')
    );

    for (const node of triggerNodes) {
      if (node.parameters) {
        // Extract parameters from trigger nodes
        Object.entries(node.parameters).forEach(([key, value]) => {
          inputs[key] = this.inferParameterSchema(key, value);
        });
      }
    }

    // Add common workflow inputs
    if (Object.keys(inputs).length === 0) {
      inputs.data = {
        type: 'object',
        description: 'Input data for the workflow',
        required: false
      };
    }

    return inputs;
  }

  /**
   * Extract output parameters from workflow nodes
   */
  extractOutputParameters(nodes) {
    const outputs = {};
    
    // Find end nodes or nodes without connections
    const endNodes = nodes.filter(node => {
      // Check if node has no outgoing connections
      return !node.type.includes('trigger');
    });

    // Define standard outputs
    outputs.result = {
      type: 'object',
      description: 'Workflow execution result'
    };

    outputs.success = {
      type: 'boolean',
      description: 'Workflow execution status'
    };

    outputs.executionId = {
      type: 'string',
      description: 'Unique workflow execution identifier'
    };

    return outputs;
  }

  /**
   * Generate schemas for individual nodes
   */
  generateNodeSchemas(nodes) {
    return nodes.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      typeVersion: node.typeVersion,
      position: node.position,
      parameters: node.parameters || {},
      credentials: node.credentials ? Object.keys(node.credentials) : [],
      schema: this.generateNodeParameterSchema(node)
    }));
  }

  /**
   * Generate parameter schema for a node
   */
  generateNodeParameterSchema(node) {
    const schema = {
      type: 'object',
      properties: {}
    };

    if (node.parameters) {
      Object.entries(node.parameters).forEach(([key, value]) => {
        schema.properties[key] = this.inferParameterSchema(key, value);
      });
    }

    return schema;
  }

  /**
   * Infer parameter schema from value
   */
  inferParameterSchema(key, value) {
    const schema = {
      description: this.generateParameterDescription(key)
    };

    if (typeof value === 'string') {
      schema.type = 'string';
      // Check if it's a URL
      if (value.startsWith('http://') || value.startsWith('https://')) {
        schema.format = 'uri';
      }
    } else if (typeof value === 'number') {
      schema.type = Number.isInteger(value) ? 'integer' : 'number';
    } else if (typeof value === 'boolean') {
      schema.type = 'boolean';
    } else if (Array.isArray(value)) {
      schema.type = 'array';
      schema.items = value.length > 0 ? this.inferParameterSchema('item', value[0]) : { type: 'string' };
    } else if (typeof value === 'object' && value !== null) {
      schema.type = 'object';
    } else {
      schema.type = 'string';
    }

    return schema;
  }

  /**
   * Generate human-readable parameter description
   */
  generateParameterDescription(key) {
    // Convert camelCase or snake_case to readable format
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase());
  }

  /**
   * Detect trigger type from nodes
   */
  detectTriggerType(nodes) {
    const triggerNode = nodes.find(node => 
      node.type.includes('trigger') || 
      node.type.includes('webhook')
    );

    if (!triggerNode) return 'manual';
    
    if (triggerNode.type.includes('webhook')) return 'webhook';
    if (triggerNode.type.includes('schedule')) return 'schedule';
    if (triggerNode.type.includes('manual')) return 'manual';
    
    return 'trigger';
  }

  /**
   * Categorize workflow based on nodes
   */
  categorizeWorkflow(nodes) {
    const categories = new Set();

    nodes.forEach(node => {
      if (node.type.includes('http')) categories.add('api');
      if (node.type.includes('postgres') || node.type.includes('mysql')) categories.add('database');
      if (node.type.includes('email')) categories.add('notification');
      if (node.type.includes('slack') || node.type.includes('discord')) categories.add('communication');
      if (node.type.includes('openai') || node.type.includes('ai')) categories.add('ai');
      if (node.type.includes('function') || node.type.includes('code')) categories.add('processing');
    });

    return Array.from(categories);
  }

  /**
   * Generate MCP tool definition
   */
  generateMCPToolDefinition(workflow, inputs, outputs) {
    return {
      name: workflow.name.toLowerCase().replace(/\s+/g, '_'),
      description: workflow.description || `Execute workflow: ${workflow.name}`,
      inputSchema: {
        type: 'object',
        properties: inputs,
        required: Object.keys(inputs).filter(key => inputs[key].required)
      },
      outputSchema: {
        type: 'object',
        properties: outputs
      }
    };
  }

  /**
   * Generate DeepSeek function calling schema
   */
  generateDeepSeekFunctionSchema(workflow, inputs, outputs) {
    return {
      type: 'function',
      function: {
        name: workflow.name.toLowerCase().replace(/\s+/g, '_'),
        description: workflow.description || `Execute n8n workflow: ${workflow.name}`,
        parameters: {
          type: 'object',
          properties: inputs,
          required: Object.keys(inputs).filter(key => inputs[key].required)
        }
      }
    };
  }

  /**
   * Save generated schemas to files
   */
  async saveSchemas(schemas) {
    try {
      // Ensure output directory exists
      await fs.mkdir(this.config.outputDir, { recursive: true });

      // Save individual schema files
      for (const schema of schemas) {
        const filename = `${schema.workflowName.toLowerCase().replace(/\s+/g, '-')}-schema.json`;
        const filepath = path.join(this.config.outputDir, filename);
        
        await fs.writeFile(
          filepath,
          JSON.stringify(schema, null, 2),
          'utf8'
        );
        
        console.log(`✅ Saved schema: ${filepath}`);
      }

      // Save combined schemas file
      const combinedPath = path.join(this.config.outputDir, 'all-workflows-schemas.json');
      await fs.writeFile(
        combinedPath,
        JSON.stringify({
          version: '1.0.0',
          generatedAt: new Date().toISOString(),
          count: schemas.length,
          schemas
        }, null, 2),
        'utf8'
      );

      console.log(`✅ Saved combined schemas: ${combinedPath}`);
    } catch (error) {
      console.error('Failed to save schemas:', error);
      throw error;
    }
  }

  /**
   * Get cached schema for a workflow
   */
  getCachedSchema(workflowId) {
    return this.schemaCache.get(workflowId);
  }

  /**
   * Clear schema cache
   */
  clearCache() {
    this.schemaCache.clear();
  }

  /**
   * Validate workflow against schema
   */
  async validateWorkflow(workflowId, data) {
    const schema = this.getCachedSchema(workflowId);
    
    if (!schema) {
      throw new Error(`Schema not found for workflow: ${workflowId}`);
    }

    // Basic validation
    const errors = [];
    
    // Check required inputs
    if (schema.input.required) {
      for (const field of schema.input.required) {
        if (!data[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default N8NSchemaGenerator;

// Export singleton instance
export const n8nSchemaGenerator = new N8NSchemaGenerator();
