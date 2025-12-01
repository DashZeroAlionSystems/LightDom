/**
 * DeepSeek Workflow Management Service
 *
 * Enables DeepSeek AI to:
 * - Create, edit, and run n8n workflows
 * - Use workflow templates
 * - Generate custom workflows based on natural language
 * - Monitor and manage workflow executions
 */

import axios from 'axios';
import { Pool } from 'pg';
import headerScriptWorkflowTemplates from './header-script-workflow-templates.js';
import seoWorkflowTemplates from './n8n-workflow-templates.js';

class DeepSeekWorkflowManager {
  constructor(config = {}) {
    this.config = {
      deepseekApiKey: config.deepseekApiKey || process.env.DEEPSEEK_API_KEY,
      deepseekApiUrl:
        config.deepseekApiUrl || process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
      n8nApiUrl: config.n8nApiUrl || process.env.N8N_API_URL || 'http://localhost:5678/api/v1',
      n8nApiKey: config.n8nApiKey || process.env.N8N_API_KEY,
      ...config,
    };

    // Database connection
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // N8N client
    this.n8nClient = axios.create({
      baseURL: this.config.n8nApiUrl,
      headers: {
        'X-N8N-API-KEY': this.config.n8nApiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // DeepSeek client
    this.deepseekClient = axios.create({
      baseURL: this.config.deepseekApiUrl,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.deepseekApiKey}`,
      },
    });

    // Available workflow templates
    this.templates = {
      ...headerScriptWorkflowTemplates,
      ...seoWorkflowTemplates,
    };

    // DeepSeek tools for workflow management
    this.workflowTools = this.initializeWorkflowTools();
  }

  /**
   * Initialize tool definitions for DeepSeek
   */
  initializeWorkflowTools() {
    return [
      {
        type: 'function',
        function: {
          name: 'list_workflow_templates',
          description: 'List all available n8n workflow templates',
          parameters: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                enum: ['header-script', 'seo', 'monitoring', 'optimization', 'all'],
                description: 'Filter templates by category',
              },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_workflow_from_template',
          description: 'Create a new n8n workflow from a template',
          parameters: {
            type: 'object',
            properties: {
              templateName: {
                type: 'string',
                description: 'Name of the template to use',
              },
              customName: {
                type: 'string',
                description: 'Custom name for the workflow',
              },
              clientId: {
                type: 'string',
                description: 'Client ID to associate with the workflow',
              },
              activate: {
                type: 'boolean',
                description: 'Whether to activate the workflow immediately',
                default: true,
              },
            },
            required: ['templateName'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_custom_workflow',
          description: 'Create a custom n8n workflow from scratch',
          parameters: {
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
                description: 'Node connections object',
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Workflow tags',
              },
            },
            required: ['name', 'nodes', 'connections'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'edit_workflow',
          description: 'Edit an existing n8n workflow',
          parameters: {
            type: 'object',
            properties: {
              workflowId: {
                type: 'string',
                description: 'ID of the workflow to edit',
              },
              updates: {
                type: 'object',
                description: 'Fields to update',
                properties: {
                  name: { type: 'string' },
                  active: { type: 'boolean' },
                  nodes: { type: 'array' },
                  connections: { type: 'object' },
                  settings: { type: 'object' },
                },
              },
            },
            required: ['workflowId', 'updates'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'execute_workflow',
          description: 'Execute an n8n workflow with input data',
          parameters: {
            type: 'object',
            properties: {
              workflowId: {
                type: 'string',
                description: 'ID of the workflow to execute',
              },
              inputData: {
                type: 'object',
                description: 'Input data for the workflow',
              },
              logExecution: {
                type: 'boolean',
                description: 'Whether to log execution to database',
                default: true,
              },
            },
            required: ['workflowId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'get_workflow_status',
          description: 'Get status and details of a workflow',
          parameters: {
            type: 'object',
            properties: {
              workflowId: {
                type: 'string',
                description: 'ID of the workflow',
              },
            },
            required: ['workflowId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'delete_workflow',
          description: 'Delete an n8n workflow',
          parameters: {
            type: 'object',
            properties: {
              workflowId: {
                type: 'string',
                description: 'ID of the workflow to delete',
              },
            },
            required: ['workflowId'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'add_workflow_node',
          description: 'Add a new node to an existing workflow',
          parameters: {
            type: 'object',
            properties: {
              workflowId: {
                type: 'string',
                description: 'ID of the workflow',
              },
              node: {
                type: 'object',
                description: 'Node configuration',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string' },
                  parameters: { type: 'object' },
                  position: { type: 'array' },
                },
              },
              connectTo: {
                type: 'string',
                description: 'Name of the node to connect to',
              },
            },
            required: ['workflowId', 'node'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'generate_workflow_from_description',
          description: 'Generate a complete n8n workflow from natural language description',
          parameters: {
            type: 'object',
            properties: {
              description: {
                type: 'string',
                description: 'Natural language description of what the workflow should do',
              },
              requirements: {
                type: 'array',
                items: { type: 'string' },
                description: 'Specific requirements or constraints',
              },
              context: {
                type: 'object',
                description: 'Additional context (client info, etc.)',
              },
            },
            required: ['description'],
          },
        },
      },
    ];
  }

  /**
   * Process DeepSeek request to manage workflows
   */
  async processWorkflowRequest(userMessage, conversationHistory = []) {
    try {
      const messages = [
        {
          role: 'system',
          content: `You are an expert n8n workflow automation specialist. You can:
          
1. Create workflows from templates or from scratch
2. Edit existing workflows
3. Execute workflows with custom data
4. Monitor workflow status
5. Generate workflows from natural language descriptions

You have access to tools for all these operations. Use them to help users manage their workflows efficiently.

Always follow n8n best practices:
- Use proper node types
- Include error handling
- Set appropriate timeouts
- Add meaningful node names
- Use connections correctly
- Include tags for organization

When generating workflows, ensure they follow the n8n JSON schema format.`,
        },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      const response = await this.deepseekClient.post('/chat/completions', {
        model: this.config.deepseekModel || 'deepseek-reasoner',
        messages,
        tools: this.workflowTools,
        tool_choice: 'auto',
        temperature: 0.3,
        max_tokens: 4000,
      });

      const result = {
        message: response.data.choices[0].message.content,
        toolCalls: response.data.choices[0].message.tool_calls || [],
        conversationId: response.data.id,
      };

      // Execute tool calls
      if (result.toolCalls.length > 0) {
        result.executedTools = await this.executeToolCalls(result.toolCalls);
      }

      return result;
    } catch (error) {
      console.error('Error processing workflow request:', error);
      throw error;
    }
  }

  /**
   * Execute tool calls from DeepSeek
   */
  async executeToolCalls(toolCalls) {
    const results = {};

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      try {
        switch (functionName) {
          case 'list_workflow_templates':
            results[functionName] = await this.listWorkflowTemplates(args.category);
            break;

          case 'create_workflow_from_template':
            results[functionName] = await this.createWorkflowFromTemplate(args);
            break;

          case 'create_custom_workflow':
            results[functionName] = await this.createCustomWorkflow(args);
            break;

          case 'edit_workflow':
            results[functionName] = await this.editWorkflow(args.workflowId, args.updates);
            break;

          case 'execute_workflow':
            results[functionName] = await this.executeWorkflow(
              args.workflowId,
              args.inputData,
              args.logExecution
            );
            break;

          case 'get_workflow_status':
            results[functionName] = await this.getWorkflowStatus(args.workflowId);
            break;

          case 'delete_workflow':
            results[functionName] = await this.deleteWorkflow(args.workflowId);
            break;

          case 'add_workflow_node':
            results[functionName] = await this.addWorkflowNode(
              args.workflowId,
              args.node,
              args.connectTo
            );
            break;

          case 'generate_workflow_from_description':
            results[functionName] = await this.generateWorkflowFromDescription(
              args.description,
              args.requirements,
              args.context
            );
            break;

          default:
            results[functionName] = { error: `Unknown function: ${functionName}` };
        }
      } catch (error) {
        console.error(`Error executing ${functionName}:`, error);
        results[functionName] = { error: error.message };
      }
    }

    return results;
  }

  /**
   * List available workflow templates
   */
  async listWorkflowTemplates(category = 'all') {
    const templates = Object.entries(this.templates).map(([key, template]) => ({
      key,
      name: template.name,
      description: template.description,
      tags: template.tags || [],
      nodeCount: template.nodes?.length || 0,
    }));

    if (category === 'all') {
      return templates;
    }

    return templates.filter(t => t.tags.includes(category));
  }

  /**
   * Create workflow from template
   */
  async createWorkflowFromTemplate({ templateName, customName, clientId, activate = true }) {
    const template = this.templates[templateName];

    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    const workflowData = {
      name: customName || template.name,
      nodes: template.nodes,
      connections: template.connections,
      settings: template.settings,
      tags: template.tags || [],
      active: activate,
    };

    const response = await this.n8nClient.post('/workflows', workflowData);
    const workflow = response.data.data || response.data;

    // If clientId provided, associate with client
    if (clientId) {
      await this.pool.query(
        `
        UPDATE seo_clients
        SET 
          injection_workflow_id = COALESCE(injection_workflow_id, $1),
          updated_at = NOW()
        WHERE id = $2::uuid
      `,
        [workflow.id, clientId]
      );
    }

    return {
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        active: workflow.active,
      },
    };
  }

  /**
   * Create custom workflow
   */
  async createCustomWorkflow({ name, description, nodes, connections, tags = [] }) {
    const workflowData = {
      name,
      nodes: nodes.map((node, index) => ({
        id: `node_${index}`,
        name: node.name,
        type: node.type,
        typeVersion: 1,
        position: node.position || [250, 300 + index * 100],
        parameters: node.parameters || {},
      })),
      connections,
      settings: {
        saveExecutionProgress: true,
        saveManualExecutions: true,
        saveDataSuccessExecution: 'all',
        saveDataErrorExecution: 'all',
        executionTimeout: 3600,
        timezone: 'America/New_York',
      },
      tags,
      active: true,
    };

    const response = await this.n8nClient.post('/workflows', workflowData);
    const workflow = response.data.data || response.data;

    return {
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        active: workflow.active,
        nodeCount: workflow.nodes?.length || 0,
      },
    };
  }

  /**
   * Edit workflow
   */
  async editWorkflow(workflowId, updates) {
    const response = await this.n8nClient.patch(`/workflows/${workflowId}`, updates);
    const workflow = response.data.data || response.data;

    return {
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        active: workflow.active,
      },
    };
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(workflowId, inputData = {}, logExecution = true) {
    const startTime = Date.now();

    const response = await this.n8nClient.post(`/workflows/${workflowId}/execute`, {
      data: inputData,
    });

    const execution = response.data.data || response.data;
    const executionTime = Date.now() - startTime;

    // Log to database if requested
    if (logExecution) {
      await this.pool.query(
        `
        INSERT INTO workflow_execution_logs (
          workflow_id, execution_id, status, 
          input_data, output_data, execution_time_ms, completed_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `,
        [
          workflowId,
          execution.id,
          'completed',
          JSON.stringify(inputData),
          JSON.stringify(execution.data || {}),
          executionTime,
        ]
      );
    }

    return {
      success: true,
      execution: {
        id: execution.id,
        workflowId,
        status: 'completed',
        executionTime,
      },
    };
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowId) {
    const response = await this.n8nClient.get(`/workflows/${workflowId}`);
    const workflow = response.data.data || response.data;

    return {
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
      nodeCount: workflow.nodes?.length || 0,
      tags: workflow.tags || [],
      updatedAt: workflow.updatedAt,
    };
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId) {
    await this.n8nClient.delete(`/workflows/${workflowId}`);

    return {
      success: true,
      message: `Workflow ${workflowId} deleted successfully`,
    };
  }

  /**
   * Add node to workflow
   */
  async addWorkflowNode(workflowId, node, connectTo) {
    // Get existing workflow
    const getResponse = await this.n8nClient.get(`/workflows/${workflowId}`);
    const workflow = getResponse.data.data || getResponse.data;

    // Add new node
    const newNode = {
      id: `node_${workflow.nodes.length}`,
      name: node.name,
      type: node.type,
      typeVersion: 1,
      position: node.position || [250, 300 + workflow.nodes.length * 100],
      parameters: node.parameters || {},
    };

    workflow.nodes.push(newNode);

    // Update connections if specified
    if (connectTo) {
      if (!workflow.connections[connectTo]) {
        workflow.connections[connectTo] = { main: [[]] };
      }
      workflow.connections[connectTo].main[0].push({
        node: newNode.name,
        type: 'main',
        index: 0,
      });
    }

    // Update workflow
    const updateResponse = await this.n8nClient.patch(`/workflows/${workflowId}`, {
      nodes: workflow.nodes,
      connections: workflow.connections,
    });

    return {
      success: true,
      node: newNode,
      workflow: {
        id: workflow.id,
        nodeCount: workflow.nodes.length,
      },
    };
  }

  /**
   * Generate workflow from natural language description
   */
  async generateWorkflowFromDescription(description, requirements = [], context = {}) {
    const prompt = `Generate a complete n8n workflow based on this description:

${description}

Requirements:
${requirements.map((req, i) => `${i + 1}. ${req}`).join('\n')}

Context: ${JSON.stringify(context, null, 2)}

Generate a valid n8n workflow JSON with:
1. Appropriate node types (webhook, httpRequest, function, postgres, etc.)
2. Proper connections between nodes
3. Error handling where appropriate
4. Settings for execution logging
5. Tags for organization

Return ONLY the JSON workflow configuration, no explanations.`;

    const response = await this.deepseekClient.post('/chat/completions', {
      model: this.config.deepseekModel || 'deepseek-reasoner',
      messages: [
        {
          role: 'system',
          content:
            'You are an n8n workflow expert. Generate valid n8n workflow JSON configurations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 4000,
    });

    const workflowJSON = response.data.choices[0].message.content;

    // Extract JSON from markdown if present
    let workflowData;
    try {
      const jsonMatch =
        workflowJSON.match(/```json\n([\s\S]*?)\n```/) ||
        workflowJSON.match(/```\n([\s\S]*?)\n```/);
      workflowData = JSON.parse(jsonMatch ? jsonMatch[1] : workflowJSON);
    } catch (parseError) {
      throw new Error(`Failed to parse generated workflow JSON: ${parseError.message}`);
    }

    // Create the workflow in n8n
    const createResponse = await this.n8nClient.post('/workflows', workflowData);
    const workflow = createResponse.data.data || createResponse.data;

    return {
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        active: workflow.active,
        nodeCount: workflow.nodes?.length || 0,
      },
      generatedFrom: description,
    };
  }
}

export default DeepSeekWorkflowManager;
