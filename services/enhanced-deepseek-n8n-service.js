/**
 * Enhanced DeepSeek Service with N8N Tool Chain Integration
 *
 * Provides:
 * - Tool chain creation for N8N workflows
 * - Algorithm search and generation for SEO attributes
 * - Prompt-driven workflow generation following N8N standards
 * - Schema generation for workflow inputs/outputs
 * - Component generation for dashboard visualization
 */

import axios from 'axios';
import { EventEmitter } from 'events';

class EnhancedDeepSeekN8NService extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      deepseekApiKey: config.deepseekApiKey || process.env.DEEPSEEK_API_KEY,
      deepseekApiUrl:
        config.deepseekApiUrl || process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
      deepseekModel: config.deepseekModel || process.env.DEEPSEEK_MODEL || 'deepseek-reasoner',
      n8nApiUrl: config.n8nApiUrl || process.env.N8N_API_URL || 'http://localhost:5678/api/v1',
      n8nApiKey: config.n8nApiKey || process.env.N8N_API_KEY,
      n8nWebhookUrl: config.n8nWebhookUrl || process.env.N8N_WEBHOOK_URL,
      timeout: config.timeout || 60000,
      ...config,
    };

    // DeepSeek client
    this.deepseekClient = axios.create({
      baseURL: this.config.deepseekApiUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.deepseekApiKey}`,
      },
    });

    // N8N client
    this.n8nClient = axios.create({
      baseURL: this.config.n8nApiUrl,
      headers: {
        'X-N8N-API-KEY': this.config.n8nApiKey,
        'Content-Type': 'application/json',
      },
    });

    // N8N tools available for DeepSeek to call
    this.n8nTools = this.initializeN8NTools();

    // Cache for generated algorithms
    this.algorithmCache = new Map();
  }

  /**
   * Initialize N8N tool definitions for DeepSeek function calling
   */
  initializeN8NTools() {
    return [
      {
        type: 'function',
        function: {
          name: 'create_n8n_workflow',
          description: 'Create a new N8N workflow with specified nodes and connections',
          parameters: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Workflow name' },
              description: { type: 'string', description: 'Workflow description' },
              nodes: {
                type: 'array',
                description: 'Array of workflow nodes',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    type: { type: 'string' },
                    parameters: { type: 'object' },
                    position: { type: 'array', items: { type: 'number' } },
                  },
                },
              },
              connections: {
                type: 'object',
                description: 'Node connections',
              },
            },
            required: ['name', 'nodes', 'connections'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'add_workflow_node',
          description: 'Add a node to an existing N8N workflow',
          parameters: {
            type: 'object',
            properties: {
              workflowId: { type: 'string', description: 'Workflow ID' },
              nodeType: {
                type: 'string',
                description: 'Node type (e.g., httpRequest, function, set)',
              },
              nodeName: { type: 'string', description: 'Node name' },
              parameters: { type: 'object', description: 'Node parameters' },
              connectTo: { type: 'string', description: 'Node to connect to' },
            },
            required: ['workflowId', 'nodeType', 'nodeName'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'execute_n8n_workflow',
          description: 'Execute an N8N workflow with input data',
          parameters: {
            type: 'object',
            properties: {
              workflowId: { type: 'string', description: 'Workflow ID to execute' },
              inputData: { type: 'object', description: 'Input data for workflow' },
            },
            required: ['workflowId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_webhook_trigger',
          description: 'Create a webhook trigger for N8N workflow',
          parameters: {
            type: 'object',
            properties: {
              workflowId: { type: 'string', description: 'Workflow ID' },
              path: { type: 'string', description: 'Webhook path' },
              method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'HTTP method',
              },
            },
            required: ['workflowId', 'path'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'search_algorithm',
          description: 'Search for or generate an algorithm to extract a specific SEO attribute',
          parameters: {
            type: 'object',
            properties: {
              attributeName: { type: 'string', description: 'SEO attribute name' },
              attributeType: {
                type: 'string',
                description: 'Data type (string, number, boolean, array, object)',
              },
              extractionContext: {
                type: 'string',
                description: 'Context for extraction (e.g., DOM, API, computed)',
              },
            },
            required: ['attributeName', 'attributeType'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'generate_component_schema',
          description: 'Generate a React component schema for visualizing an SEO attribute',
          parameters: {
            type: 'object',
            properties: {
              attributeName: { type: 'string', description: 'SEO attribute name' },
              visualizationType: {
                type: 'string',
                enum: ['chart', 'table', 'card', 'badge', 'progress', 'list'],
                description: 'Type of visualization',
              },
              dataStructure: { type: 'object', description: 'Data structure of the attribute' },
            },
            required: ['attributeName', 'visualizationType'],
          },
        },
      },
    ];
  }

  /**
   * Generate SEO data mining workflow with all 192 attributes
   */
  async generateCompleteSEOWorkflow(targetUrl, options = {}) {
    try {
      const prompt = `Create a comprehensive SEO data mining workflow for analyzing ${targetUrl}.

The workflow must:
1. Extract all 192 SEO attributes across these categories:
   - SEO Core (30 attributes)
   - Structured Data (25 attributes)
   - Performance (20 attributes)
   - Content Quality (25 attributes)
   - Technical SEO (22 attributes)
   - 3D Layer Analysis (20 attributes)
   - Visual Design (20 attributes)
   - User Experience (15 attributes)
   - Competitor Metrics (15 attributes)

2. For each attribute:
   - Search or generate the optimal extraction algorithm
   - Create a workflow node to execute the algorithm
   - Generate a component schema for dashboard display
   - Store results in database

3. Follow N8N standards:
   - Use proper node types (httpRequest, function, set, postgres, etc.)
   - Set up error handling and retries
   - Implement rate limiting
   - Use webhook triggers for automation
   - Enable monitoring and logging

4. Generate the complete N8N workflow JSON with all nodes and connections.

Options: ${JSON.stringify(options, null, 2)}`;

      // Call DeepSeek with tool calling enabled
      const response = await this.deepseekClient.post('/chat/completions', {
        model: this.config.deepseekModel,
        messages: [
          {
            role: 'system',
            content: `You are an expert N8N workflow architect specializing in SEO data mining.
You have access to tools for creating N8N workflows, adding nodes, and generating algorithms.
Use the tools to build a complete, production-ready workflow following N8N best practices.
Always include error handling, retries, and monitoring.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        tools: this.n8nTools,
        tool_choice: 'auto',
        temperature: 0.3,
        max_tokens: 4000,
      });

      // Process tool calls
      const toolCalls = response.data.choices[0].message.tool_calls || [];
      const results = await this.executeToolCalls(toolCalls);

      return {
        success: true,
        workflow: results.workflow,
        algorithms: results.algorithms,
        components: results.components,
        conversationId: response.data.id,
      };
    } catch (error) {
      console.error('Error generating SEO workflow:', error);
      throw error;
    }
  }

  /**
   * Search or generate algorithm for specific SEO attribute
   */
  async searchOrGenerateAlgorithm(attributeName, attributeType, extractionContext = 'DOM') {
    const cacheKey = `${attributeName}_${attributeType}_${extractionContext}`;

    // Check cache first
    if (this.algorithmCache.has(cacheKey)) {
      return this.algorithmCache.get(cacheKey);
    }

    try {
      const prompt = `Generate a JavaScript algorithm to extract the SEO attribute "${attributeName}" (type: ${attributeType}) from ${extractionContext}.

Requirements:
1. The algorithm should work in a browser environment (Puppeteer/Playwright)
2. Handle edge cases and errors gracefully
3. Return data in the specified type: ${attributeType}
4. Be performant and efficient
5. Include JSDoc comments

Context: ${extractionContext === 'DOM' ? 'Parse DOM structure' : extractionContext === 'API' ? 'Make API calls' : 'Compute from available data'}

Return only the JavaScript function code.`;

      const response = await this.deepseekClient.post('/chat/completions', {
        model: this.config.deepseekModel,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert JavaScript developer specializing in web scraping and SEO analysis. Generate clean, efficient, production-ready code.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 1000,
      });

      const algorithm = response.data.choices[0].message.content;

      // Cache the result
      this.algorithmCache.set(cacheKey, algorithm);

      return algorithm;
    } catch (error) {
      console.error(`Error generating algorithm for ${attributeName}:`, error);
      throw error;
    }
  }

  /**
   * Generate React component schema for visualizing attribute
   */
  async generateComponentSchema(attributeName, visualizationType, dataStructure) {
    try {
      const prompt = `Generate a React component schema for visualizing the SEO attribute "${attributeName}".

Visualization Type: ${visualizationType}
Data Structure: ${JSON.stringify(dataStructure, null, 2)}

The schema should include:
1. Component name (following naming conventions)
2. Props definition with TypeScript types
3. Ant Design component to use (e.g., Card, Statistic, Progress, Table)
4. Layout configuration
5. Data transformation logic
6. Styling/theming hints

Return as a JSON schema that can be used to auto-generate the component.`;

      const response = await this.deepseekClient.post('/chat/completions', {
        model: this.config.deepseekModel,
        messages: [
          {
            role: 'system',
            content:
              'You are an expert React developer. Generate component schemas following best practices and Ant Design patterns.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error(`Error generating component schema for ${attributeName}:`, error);
      throw error;
    }
  }

  /**
   * Execute N8N tool calls from DeepSeek
   */
  async executeToolCalls(toolCalls) {
    const results = {
      workflow: null,
      algorithms: [],
      components: [],
    };

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      try {
        switch (functionName) {
          case 'create_n8n_workflow':
            results.workflow = await this.createN8NWorkflow(args);
            break;

          case 'add_workflow_node':
            await this.addWorkflowNode(args);
            break;

          case 'execute_n8n_workflow':
            await this.executeN8NWorkflow(args.workflowId, args.inputData);
            break;

          case 'create_webhook_trigger':
            await this.createWebhookTrigger(args);
            break;

          case 'search_algorithm':
            const algorithm = await this.searchOrGenerateAlgorithm(
              args.attributeName,
              args.attributeType,
              args.extractionContext
            );
            results.algorithms.push({
              attributeName: args.attributeName,
              algorithm,
            });
            break;

          case 'generate_component_schema':
            const componentSchema = await this.generateComponentSchema(
              args.attributeName,
              args.visualizationType,
              args.dataStructure
            );
            results.components.push(componentSchema);
            break;

          default:
            console.warn(`Unknown tool: ${functionName}`);
        }
      } catch (error) {
        console.error(`Error executing tool ${functionName}:`, error);
        // Continue with other tool calls
      }
    }

    return results;
  }

  /**
   * Create N8N workflow via API
   */
  async createN8NWorkflow(workflowData) {
    try {
      // Convert to N8N workflow format
      const n8nWorkflow = {
        name: workflowData.name,
        nodes: workflowData.nodes.map((node, index) => ({
          id: `node_${index}`,
          name: node.name,
          type: node.type,
          typeVersion: 1,
          position: node.position || [250, 300 + index * 100],
          parameters: node.parameters || {},
        })),
        connections: workflowData.connections || {},
        settings: {
          saveExecutionProgress: true,
          saveManualExecutions: true,
          saveDataSuccessExecution: 'all',
          saveDataErrorExecution: 'all',
          executionTimeout: 3600,
          timezone: 'America/New_York',
        },
        staticData: null,
        tags: ['seo', 'data-mining', 'automated'],
        active: true,
      };

      const response = await this.n8nClient.post('/workflows', n8nWorkflow);

      this.emit('workflow_created', response.data);

      return response.data;
    } catch (error) {
      console.error('Error creating N8N workflow:', error);
      throw error;
    }
  }

  /**
   * Add node to existing workflow
   */
  async addWorkflowNode(nodeData) {
    try {
      // Get existing workflow
      const workflow = await this.n8nClient.get(`/workflows/${nodeData.workflowId}`);

      // Add new node
      const newNode = {
        id: `node_${workflow.data.nodes.length}`,
        name: nodeData.nodeName,
        type: nodeData.nodeType,
        typeVersion: 1,
        position: [250, 300 + workflow.data.nodes.length * 100],
        parameters: nodeData.parameters || {},
      };

      workflow.data.nodes.push(newNode);

      // Update connections if specified
      if (nodeData.connectTo) {
        if (!workflow.data.connections[nodeData.connectTo]) {
          workflow.data.connections[nodeData.connectTo] = { main: [[]] };
        }
        workflow.data.connections[nodeData.connectTo].main[0].push({
          node: newNode.name,
          type: 'main',
          index: 0,
        });
      }

      // Update workflow
      await this.n8nClient.patch(`/workflows/${nodeData.workflowId}`, workflow.data);

      return newNode;
    } catch (error) {
      console.error('Error adding workflow node:', error);
      throw error;
    }
  }

  /**
   * Execute N8N workflow
   */
  async executeN8NWorkflow(workflowId, inputData = {}) {
    try {
      const response = await this.n8nClient.post(`/workflows/${workflowId}/execute`, {
        data: inputData,
      });

      this.emit('workflow_executed', { workflowId, executionId: response.data.id });

      return response.data;
    } catch (error) {
      console.error('Error executing N8N workflow:', error);
      throw error;
    }
  }

  /**
   * Create webhook trigger for workflow
   */
  async createWebhookTrigger(webhookData) {
    try {
      const webhook = {
        workflowId: webhookData.workflowId,
        path: webhookData.path,
        method: webhookData.method || 'POST',
        responseMode: 'onReceived',
        responseData: 'firstEntryJson',
      };

      // Add webhook node to workflow
      await this.addWorkflowNode({
        workflowId: webhookData.workflowId,
        nodeType: 'n8n-nodes-base.webhook',
        nodeName: 'Webhook Trigger',
        parameters: webhook,
      });

      const webhookUrl = `${this.config.n8nWebhookUrl}/${webhookData.path}`;

      this.emit('webhook_created', { webhookUrl, workflowId: webhookData.workflowId });

      return { webhookUrl, ...webhook };
    } catch (error) {
      console.error('Error creating webhook trigger:', error);
      throw error;
    }
  }

  /**
   * Generate workflow with interactive prompts (multi-step conversation)
   */
  async interactiveWorkflowGeneration(userMessages, sessionContext = {}) {
    try {
      const messages = [
        {
          role: 'system',
          content: `You are an interactive N8N workflow design assistant. Guide users through creating SEO data mining workflows.
          
Ask clarifying questions about:
- Target URL and scope
- Which SEO attributes to prioritize
- Frequency of data collection
- Integration requirements
- Notification preferences
- Budget/resource constraints

Once you have enough information, use the available tools to generate the workflow.
Session context: ${JSON.stringify(sessionContext)}`,
        },
        ...userMessages.map(msg => ({
          role: msg.role || 'user',
          content: msg.content,
        })),
      ];

      const response = await this.deepseekClient.post('/chat/completions', {
        model: this.config.deepseekModel,
        messages,
        tools: this.n8nTools,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 2000,
      });

      const result = {
        message: response.data.choices[0].message.content,
        toolCalls: response.data.choices[0].message.tool_calls || [],
        conversationId: response.data.id,
        needsMoreInfo: !response.data.choices[0].message.tool_calls,
      };

      // Execute any tool calls
      if (result.toolCalls.length > 0) {
        result.executedTools = await this.executeToolCalls(result.toolCalls);
      }

      return result;
    } catch (error) {
      console.error('Error in interactive workflow generation:', error);
      throw error;
    }
  }
}

export default EnhancedDeepSeekN8NService;
