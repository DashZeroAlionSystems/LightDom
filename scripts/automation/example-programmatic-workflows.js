#!/usr/bin/env node

/**
 * Example: Programmatically Building n8n Workflows
 * 
 * This example demonstrates how to:
 * 1. Use the n8n MCP server to create workflows
 * 2. Build workflows programmatically with reusable patterns
 * 3. Deploy and manage workflows via API
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

/**
 * Workflow Pattern Builder
 * Provides reusable patterns for common workflow structures
 */
class WorkflowPatternBuilder {
  constructor() {
    this.nodeIdCounter = 0;
  }

  /**
   * Generate unique node ID
   */
  generateNodeId(prefix = 'node') {
    return `${prefix}-${++this.nodeIdCounter}`;
  }

  /**
   * Create a webhook trigger node
   */
  createWebhookTrigger(path, method = 'POST', options = {}) {
    return {
      id: this.generateNodeId('webhook'),
      type: 'n8n-nodes-base.webhook',
      name: options.name || 'Webhook Trigger',
      parameters: {
        httpMethod: method,
        path: path,
        responseMode: options.responseMode || 'responseNode',
        ...options.parameters
      },
      position: options.position || [100, 200]
    };
  }

  /**
   * Create a function node
   */
  createFunctionNode(code, options = {}) {
    return {
      id: this.generateNodeId('function'),
      type: 'n8n-nodes-base.function',
      name: options.name || 'Function',
      parameters: {
        functionCode: code,
        ...options.parameters
      },
      position: options.position || [300, 200]
    };
  }

  /**
   * Create an HTTP request node
   */
  createHttpRequestNode(url, method = 'GET', options = {}) {
    return {
      id: this.generateNodeId('http'),
      type: 'n8n-nodes-base.httpRequest',
      name: options.name || 'HTTP Request',
      parameters: {
        method: method,
        url: url,
        ...options.parameters
      },
      position: options.position || [500, 200]
    };
  }

  /**
   * Create a database node (PostgreSQL)
   */
  createDatabaseNode(operation, options = {}) {
    return {
      id: this.generateNodeId('db'),
      type: 'n8n-nodes-base.postgres',
      name: options.name || 'Database',
      parameters: {
        operation: operation,
        ...options.parameters
      },
      position: options.position || [700, 200]
    };
  }

  /**
   * Create a response node
   */
  createResponseNode(options = {}) {
    return {
      id: this.generateNodeId('response'),
      type: 'n8n-nodes-base.respondToWebhook',
      name: options.name || 'Response',
      parameters: {
        respondWith: options.respondWith || 'json',
        responseBody: options.responseBody || '={{ JSON.stringify($json) }}',
        ...options.parameters
      },
      position: options.position || [900, 200]
    };
  }

  /**
   * Create connections between nodes
   */
  createConnections(nodeSequence) {
    const connections = {};
    
    for (let i = 0; i < nodeSequence.length - 1; i++) {
      const currentNode = nodeSequence[i];
      const nextNode = nodeSequence[i + 1];
      
      connections[currentNode.id] = {
        main: [[nextNode.id]]
      };
    }
    
    return connections;
  }

  /**
   * Build complete workflow
   */
  buildWorkflow(name, nodes, connections, options = {}) {
    return {
      name: name,
      nodes: nodes,
      connections: connections,
      active: options.active || false,
      settings: options.settings || {},
      staticData: options.staticData || null,
      tags: options.tags || []
    };
  }
}

/**
 * Example Workflow Builders
 */
class ExampleWorkflows {
  constructor() {
    this.builder = new WorkflowPatternBuilder();
  }

  /**
   * Example 1: Simple Webhook API
   */
  createWebhookAPI() {
    const webhook = this.builder.createWebhookTrigger('api/hello', 'POST', {
      name: 'API Endpoint'
    });

    const validate = this.builder.createFunctionNode(
      `// Validate input
const { name } = $json;
if (!name) {
  throw new Error('Name is required');
}
return [{ json: { name, timestamp: new Date().toISOString() } }];`,
      { name: 'Validate Input', position: [300, 200] }
    );

    const process = this.builder.createFunctionNode(
      `// Process request
const { name, timestamp } = $json;
return [{ 
  json: { 
    message: \`Hello, \${name}!\`,
    receivedAt: timestamp,
    processedAt: new Date().toISOString()
  } 
}];`,
      { name: 'Process Request', position: [500, 200] }
    );

    const response = this.builder.createResponseNode({
      position: [700, 200]
    });

    const nodes = [webhook, validate, process, response];
    const connections = this.builder.createConnections(nodes);

    return this.builder.buildWorkflow(
      'Simple Webhook API',
      nodes,
      connections,
      { tags: ['api', 'example'] }
    );
  }

  /**
   * Example 2: Data Processing Pipeline
   */
  createDataPipeline() {
    const webhook = this.builder.createWebhookTrigger('api/process-data', 'POST', {
      name: 'Data Input'
    });

    const validate = this.builder.createFunctionNode(
      `// Validate data format
const { data, type } = $json;
if (!data || !type) {
  throw new Error('Data and type are required');
}
return [{ json: $json }];`,
      { name: 'Validate', position: [300, 200] }
    );

    const transform = this.builder.createFunctionNode(
      `// Transform data
const { data, type } = $json;
const transformed = {
  type,
  records: data.map(item => ({
    ...item,
    processed: true,
    timestamp: new Date().toISOString()
  }))
};
return [{ json: transformed }];`,
      { name: 'Transform', position: [500, 200] }
    );

    const store = this.builder.createDatabaseNode('insert', {
      name: 'Store in DB',
      position: [700, 200],
      parameters: {
        operation: 'insert',
        table: 'processed_data',
        columns: 'type, data, created_at',
        returnFields: '*'
      }
    });

    const response = this.builder.createResponseNode({
      position: [900, 200],
      responseBody: '={{ JSON.stringify({ success: true, recordsProcessed: $json.records.length }) }}'
    });

    const nodes = [webhook, validate, transform, store, response];
    const connections = this.builder.createConnections(nodes);

    return this.builder.buildWorkflow(
      'Data Processing Pipeline',
      nodes,
      connections,
      { tags: ['data', 'pipeline'] }
    );
  }

  /**
   * Example 3: API Integration Workflow
   */
  createAPIIntegration() {
    const webhook = this.builder.createWebhookTrigger('api/fetch-data', 'POST');

    const fetchExternal = this.builder.createHttpRequestNode(
      '={{ $json.apiUrl }}',
      'GET',
      {
        name: 'Fetch External Data',
        position: [300, 200],
        parameters: {
          method: 'GET',
          url: '={{ $json.apiUrl }}',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': '={{ $json.apiKey }}'
          }
        }
      }
    );

    const process = this.builder.createFunctionNode(
      `// Process API response
const data = $json;
const processed = {
  fetchedAt: new Date().toISOString(),
  source: 'external-api',
  data: data,
  itemCount: Array.isArray(data) ? data.length : 1
};
return [{ json: processed }];`,
      { name: 'Process Response', position: [500, 200] }
    );

    const store = this.builder.createDatabaseNode('insert', {
      name: 'Cache Result',
      position: [700, 200],
      parameters: {
        operation: 'insert',
        table: 'api_cache',
        columns: 'source, data, fetched_at'
      }
    });

    const response = this.builder.createResponseNode({
      position: [900, 200]
    });

    const nodes = [webhook, fetchExternal, process, store, response];
    const connections = this.builder.createConnections(nodes);

    return this.builder.buildWorkflow(
      'API Integration Workflow',
      nodes,
      connections,
      { tags: ['api', 'integration', 'cache'] }
    );
  }

  /**
   * Example 4: Error Handling Workflow
   */
  createErrorHandlingWorkflow() {
    const webhook = this.builder.createWebhookTrigger('api/safe-process', 'POST');

    const mainProcess = this.builder.createFunctionNode(
      `// Main processing logic
const { value } = $json;
if (Math.random() > 0.5) {
  throw new Error('Random processing error');
}
return [{ json: { result: value * 2, success: true } }];`,
      { 
        name: 'Main Process', 
        position: [300, 200],
        onError: 'continueErrorOutput'
      }
    );

    const errorHandler = this.builder.createFunctionNode(
      `// Handle errors gracefully
const error = $json.error || $json;
return [{ 
  json: { 
    success: false, 
    error: error.message || 'Unknown error',
    timestamp: new Date().toISOString()
  } 
}];`,
      { name: 'Error Handler', position: [500, 400] }
    );

    const response = this.builder.createResponseNode({
      position: [700, 300]
    });

    const nodes = [webhook, mainProcess, errorHandler, response];
    
    // Custom connections for error handling
    const connections = {
      [webhook.id]: { main: [[mainProcess.id]] },
      [mainProcess.id]: { 
        main: [[response.id]],
        error: [[errorHandler.id]]
      },
      [errorHandler.id]: { main: [[response.id]] }
    };

    return this.builder.buildWorkflow(
      'Error Handling Workflow',
      nodes,
      connections,
      { tags: ['error-handling', 'resilience'] }
    );
  }
}

/**
 * n8n API Client
 */
class N8nAPIClient {
  constructor(baseUrl = 'http://localhost:5678', apiKey = null) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Get headers
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['X-N8N-API-KEY'] = this.apiKey;
    }

    return headers;
  }

  /**
   * Create workflow
   */
  async createWorkflow(workflow) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/api/v1/workflows`,
        workflow,
        { headers: this.getHeaders() }
      );

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * List workflows
   */
  async listWorkflows() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v1/workflows`,
        { headers: this.getHeaders() }
      );

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  /**
   * Check n8n health
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseUrl}/healthz`);
      return { success: true, healthy: response.status === 200 };
    } catch (error) {
      return { success: false, healthy: false };
    }
  }
}

/**
 * Main demo function
 */
async function main() {
  console.log('🏗️  n8n Workflow Programmatic Builder Demo\n');

  // Initialize
  const examples = new ExampleWorkflows();
  const client = new N8nAPIClient(
    process.env.N8N_BASE_URL || 'http://localhost:5678',
    process.env.N8N_API_KEY
  );

  // Generate example workflows
  console.log('📝 Generating example workflows...\n');

  const workflows = [
    examples.createWebhookAPI(),
    examples.createDataPipeline(),
    examples.createAPIIntegration(),
    examples.createErrorHandlingWorkflow()
  ];

  workflows.forEach((workflow, i) => {
    console.log(`${i + 1}. ${workflow.name}`);
    console.log(`   Nodes: ${workflow.nodes.length}`);
    console.log(`   Tags: ${workflow.tags.join(', ')}\n`);
  });

  // Save to files
  console.log('💾 Saving workflows to files...\n');

  const outputDir = path.join(__dirname, '..', '..', 'workflows', 'automation', 'generated', 'examples');
  await fs.mkdir(outputDir, { recursive: true });

  for (const workflow of workflows) {
    const filename = workflow.name.toLowerCase().replace(/\s+/g, '-') + '.json';
    const filepath = path.join(outputDir, filename);
    
    await fs.writeFile(filepath, JSON.stringify(workflow, null, 2));
    console.log(`   ✅ ${filename}`);
  }

  console.log('\n📤 Deployment options:\n');

  // Check if n8n is running
  const health = await client.checkHealth();

  if (health.healthy) {
    console.log('✅ n8n server is running!\n');
    console.log('Deploy workflows with:');
    workflows.forEach((workflow, i) => {
      console.log(`   ${i + 1}. Import ${workflow.name} via n8n UI`);
    });
    console.log('\nOr deploy programmatically using the n8n API client.\n');
  } else {
    console.log('⚠️  n8n server not detected at', client.baseUrl);
    console.log('\nStart n8n with: npm run n8n:start');
    console.log('Then import the generated JSON files via the n8n UI.\n');
  }

  console.log('📚 Workflow files saved to:', outputDir);
  console.log('\n✨ Done!\n');
}

// Run demo
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  WorkflowPatternBuilder,
  ExampleWorkflows,
  N8nAPIClient
};
