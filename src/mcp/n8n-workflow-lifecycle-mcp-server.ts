/**
 * N8N Workflow MCP Server
 * 
 * Model Context Protocol server for complete n8n workflow lifecycle management
 * 
 * Features:
 * - Workflow creation with all stages (triggers, actions, conditions, error handling)
 * - Stage-based workflow execution
 * - DeepSeek error analysis integration
 * - Real-time execution monitoring
 * - Workflow health tracking
 * - Template-based workflow creation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Pool } from 'pg';
import { N8NWorkflowLifecycleManager } from '../services/n8n-workflow-lifecycle-manager.js';
import { getAllEnhancedTemplates, createWorkflowFromEnhancedTemplate } from '../services/n8n-enhanced-workflow-templates.js';

interface WorkflowMCPConfig {
  databaseUrl: string;
  n8nApiUrl?: string;
  n8nApiKey?: string;
  deepseekService?: any;
}

class N8NWorkflowMCPServer {
  private server: Server;
  private pool: Pool;
  private lifecycleManager: N8NWorkflowLifecycleManager;
  private config: WorkflowMCPConfig;

  constructor(config: WorkflowMCPConfig) {
    this.config = config;
    
    // Initialize database pool
    this.pool = new Pool({
      connectionString: config.databaseUrl,
      max: 10
    });

    // Initialize lifecycle manager
    this.lifecycleManager = new N8NWorkflowLifecycleManager(
      this.pool,
      config.deepseekService
    );

    // Initialize MCP server
    this.server = new Server(
      {
        name: 'n8n-workflow-lifecycle-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen to workflow events
    this.lifecycleManager.on('workflow:created', (data) => {
      console.log(`[MCP] ${data.message}`);
    });

    this.lifecycleManager.on('workflow:error', (data) => {
      console.error(`[MCP] ${data.message}`);
    });

    this.lifecycleManager.on('deepseek:error-analysis', (data) => {
      console.log(`[MCP] ${data.message}`);
    });
  }

  private setupHandlers() {
    // List all available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'create_complete_workflow',
            description: 'Create a complete workflow with all stages (triggers, actions, conditions, error handling, sub-workflows, response)',
            inputSchema: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Workflow name'
                },
                description: {
                  type: 'string',
                  description: 'Workflow description'
                },
                trigger: {
                  type: 'object',
                  description: 'Trigger configuration (WEBHOOK, SCHEDULE, MANUAL, etc.)',
                  properties: {
                    type: { type: 'string' },
                    parameters: { type: 'object' }
                  },
                  required: ['type']
                },
                actions: {
                  type: 'array',
                  description: 'Array of action configurations',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string' },
                      parameters: { type: 'object' },
                      retry: { type: 'object' },
                      canFail: { type: 'boolean' }
                    }
                  }
                },
                errorHandling: {
                  type: 'object',
                  description: 'Error handling configuration',
                  properties: {
                    enabled: { type: 'boolean' },
                    notify: { type: 'boolean' }
                  }
                },
                response: {
                  type: 'object',
                  description: 'Response configuration for webhook triggers'
                }
              },
              required: ['name', 'trigger']
            }
          },
          {
            name: 'create_from_template',
            description: 'Create workflow from enhanced template (complete_api_workflow, scheduled_data_processor, event_driven_router)',
            inputSchema: {
              type: 'object',
              properties: {
                templateId: {
                  type: 'string',
                  description: 'Template ID to use',
                  enum: ['complete_api_workflow', 'scheduled_data_processor', 'event_driven_router']
                },
                config: {
                  type: 'object',
                  description: 'Template configuration options'
                },
                name: {
                  type: 'string',
                  description: 'Custom workflow name (optional)'
                }
              },
              required: ['templateId', 'config']
            }
          },
          {
            name: 'list_templates',
            description: 'List all available enhanced workflow templates with complete stage information',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'get_stage_types',
            description: 'Get all available N8N workflow stage types (triggers, actions, flow control, error handling, etc.)',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'execute_workflow',
            description: 'Execute a workflow by ID with input data',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'Workflow ID to execute'
                },
                data: {
                  type: 'object',
                  description: 'Input data for workflow execution'
                }
              },
              required: ['workflowId']
            }
          },
          {
            name: 'execute_at_stage',
            description: 'Execute workflow starting at a specific stage (for partial execution or testing)',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'Workflow ID'
                },
                stageName: {
                  type: 'string',
                  description: 'Name of the stage/node to start from'
                },
                data: {
                  type: 'object',
                  description: 'Input data for execution'
                }
              },
              required: ['workflowId', 'stageName']
            }
          },
          {
            name: 'get_workflow_errors',
            description: 'Get error log for a workflow (for DeepSeek analysis)',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'Workflow ID (optional - if not provided, returns all errors)'
                },
                severity: {
                  type: 'string',
                  description: 'Filter by severity',
                  enum: ['critical', 'high', 'medium', 'low']
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of errors to return',
                  default: 50
                }
              }
            }
          },
          {
            name: 'analyze_error',
            description: 'Request DeepSeek to analyze a workflow error and provide fixes',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'Workflow ID'
                },
                errorId: {
                  type: 'string',
                  description: 'Execution ID of the error'
                }
              },
              required: ['workflowId', 'errorId']
            }
          },
          {
            name: 'get_workflow_stats',
            description: 'Get comprehensive workflow statistics including health score and recommendations',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'Workflow ID'
                }
              },
              required: ['workflowId']
            }
          },
          {
            name: 'enable_deepseek_management',
            description: 'Enable DeepSeek AI to proactively manage a workflow (error analysis, optimization, auto-fixing)',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'Workflow ID'
                }
              },
              required: ['workflowId']
            }
          },
          {
            name: 'list_workflows',
            description: 'List all workflows with execution statistics',
            inputSchema: {
              type: 'object',
              properties: {
                workflowType: {
                  type: 'string',
                  description: 'Filter by workflow type'
                },
                isActive: {
                  type: 'boolean',
                  description: 'Filter by active status'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum workflows to return',
                  default: 50
                }
              }
            }
          },
          {
            name: 'start_workflow',
            description: 'Activate a workflow (for scheduled or event-based triggers)',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'Workflow ID to start'
                }
              },
              required: ['workflowId']
            }
          },
          {
            name: 'stop_workflow',
            description: 'Deactivate a workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'Workflow ID to stop'
                }
              },
              required: ['workflowId']
            }
          },
          {
            name: 'get_execution_history',
            description: 'Get execution history for a workflow',
            inputSchema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'Workflow ID'
                },
                limit: {
                  type: 'number',
                  description: 'Maximum executions to return',
                  default: 50
                }
              },
              required: ['workflowId']
            }
          }
        ]
      };
    });

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_complete_workflow':
            return await this.handleCreateCompleteWorkflow(args);
          
          case 'create_from_template':
            return await this.handleCreateFromTemplate(args);
          
          case 'list_templates':
            return await this.handleListTemplates();
          
          case 'get_stage_types':
            return await this.handleGetStageTypes();
          
          case 'execute_workflow':
            return await this.handleExecuteWorkflow(args);
          
          case 'execute_at_stage':
            return await this.handleExecuteAtStage(args);
          
          case 'get_workflow_errors':
            return await this.handleGetWorkflowErrors(args);
          
          case 'analyze_error':
            return await this.handleAnalyzeError(args);
          
          case 'get_workflow_stats':
            return await this.handleGetWorkflowStats(args);
          
          case 'enable_deepseek_management':
            return await this.handleEnableDeepSeekManagement(args);
          
          case 'list_workflows':
            return await this.handleListWorkflows(args);
          
          case 'start_workflow':
            return await this.handleStartWorkflow(args);
          
          case 'stop_workflow':
            return await this.handleStopWorkflow(args);
          
          case 'get_execution_history':
            return await this.handleGetExecutionHistory(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  private async handleCreateCompleteWorkflow(args: any) {
    const workflow = await this.lifecycleManager.createCompleteWorkflow(args);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            workflow: {
              id: workflow.workflow_id,
              name: workflow.name,
              stages: workflow.workflow_definition.meta?.stages,
              nodeCount: workflow.workflow_definition.nodes.length
            },
            message: '[workflow][mcp][create] - info - Complete workflow created'
          }, null, 2)
        }
      ]
    };
  }

  private async handleCreateFromTemplate(args: any) {
    const { templateId, config, name } = args;
    
    const workflowDef = createWorkflowFromEnhancedTemplate(templateId, config);
    if (name) workflowDef.name = name;

    const workflow = await this.lifecycleManager.workflowDAL.createWorkflow({
      workflow_id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: workflowDef.name,
      description: workflowDef.description || workflowDef.templateName,
      workflow_type: workflowDef.category || 'automation',
      workflow_definition: workflowDef,
      tags: workflowDef.tags || [],
      is_active: false,
      created_by: 'mcp-server'
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            workflow: {
              id: workflow.workflow_id,
              name: workflow.name,
              templateId,
              stages: workflowDef.stages,
              nodeCount: workflowDef.nodes.length
            },
            message: '[workflow][mcp][template] - info - Workflow created from template'
          }, null, 2)
        }
      ]
    };
  }

  private async handleListTemplates() {
    const templates = getAllEnhancedTemplates();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            count: templates.length,
            templates: templates.map(t => ({
              id: t.id,
              name: t.name,
              description: t.description,
              category: t.category,
              stages: t.stages,
              configOptions: t.configOptions
            }))
          }, null, 2)
        }
      ]
    };
  }

  private async handleGetStageTypes() {
    const stageTypes = N8NWorkflowLifecycleManager.STAGE_TYPES;
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            stageTypes,
            categories: Object.keys(stageTypes),
            totalStages: Object.values(stageTypes).reduce((sum, category: any) => 
              sum + Object.keys(category).length, 0)
          }, null, 2)
        }
      ]
    };
  }

  private async handleExecuteWorkflow(args: any) {
    const { workflowId, data = {} } = args;
    
    const workflow = await this.lifecycleManager.workflowDAL.getWorkflowById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const execution_id = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.lifecycleManager.workflowDAL.recordExecution({
      execution_id,
      workflow_id: workflowId,
      status: 'running',
      mode: 'manual',
      data: { input: data }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            execution_id,
            workflow_id: workflowId,
            message: '[workflow][mcp][execute] - info - Workflow execution started'
          }, null, 2)
        }
      ]
    };
  }

  private async handleExecuteAtStage(args: any) {
    const { workflowId, stageName, data = {} } = args;
    
    const workflow = await this.lifecycleManager.workflowDAL.getWorkflowById(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const execution_id = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.lifecycleManager.workflowDAL.recordExecution({
      execution_id,
      workflow_id: workflowId,
      status: 'running',
      mode: 'partial',
      data: { input: data, startStage: stageName }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            execution_id,
            workflow_id: workflowId,
            startStage: stageName,
            message: `[workflow][mcp][execute-stage] - info - Workflow execution started at stage: ${stageName}`
          }, null, 2)
        }
      ]
    };
  }

  private async handleGetWorkflowErrors(args: any) {
    const { workflowId, severity, limit = 50 } = args;
    
    const errors = this.lifecycleManager.getErrorsForDeepSeek({
      workflowId,
      severity
    }).slice(0, limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            count: errors.length,
            errors,
            summary: {
              total: errors.length,
              critical: errors.filter(e => e.severity === 'critical').length,
              high: errors.filter(e => e.severity === 'high').length,
              medium: errors.filter(e => e.severity === 'medium').length,
              low: errors.filter(e => e.severity === 'low').length
            }
          }, null, 2)
        }
      ]
    };
  }

  private async handleAnalyzeError(args: any) {
    const { workflowId, errorId } = args;
    
    const errors = this.lifecycleManager.getErrorsForDeepSeek({ workflowId });
    const error = errors.find(e => e.executionId === errorId);

    if (!error) {
      throw new Error(`Error not found: ${errorId}`);
    }

    const analysis = await this.lifecycleManager.notifyDeepSeekAboutError(error);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            error,
            analysis,
            message: '[workflow][mcp][analyze] - info - Error analyzed by DeepSeek'
          }, null, 2)
        }
      ]
    };
  }

  private async handleGetWorkflowStats(args: any) {
    const { workflowId } = args;
    const stats = await this.lifecycleManager.getWorkflowStatsForDeepSeek(workflowId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            stats
          }, null, 2)
        }
      ]
    };
  }

  private async handleEnableDeepSeekManagement(args: any) {
    const { workflowId } = args;
    const workflow = await this.lifecycleManager.enableDeepSeekManagement(workflowId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            workflow: {
              id: workflow.workflow_id,
              name: workflow.name,
              deepseekManaged: true,
              capabilities: workflow.workflow_definition.meta?.deepseekCapabilities
            },
            message: '[workflow][mcp][deepseek] - info - DeepSeek management enabled'
          }, null, 2)
        }
      ]
    };
  }

  private async handleListWorkflows(args: any) {
    const { workflowType, isActive, limit = 50 } = args;
    
    const workflows = await this.lifecycleManager.workflowDAL.listWorkflows({
      workflow_type: workflowType,
      is_active: isActive,
      limit
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            count: workflows.length,
            workflows
          }, null, 2)
        }
      ]
    };
  }

  private async handleStartWorkflow(args: any) {
    const { workflowId } = args;
    const workflow = await this.lifecycleManager.workflowDAL.updateWorkflow(workflowId, { is_active: true });

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            workflow: {
              id: workflow.workflow_id,
              name: workflow.name,
              is_active: true
            },
            message: '[workflow][mcp][start] - info - Workflow started'
          }, null, 2)
        }
      ]
    };
  }

  private async handleStopWorkflow(args: any) {
    const { workflowId } = args;
    const workflow = await this.lifecycleManager.workflowDAL.updateWorkflow(workflowId, { is_active: false });

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            workflow: {
              id: workflow.workflow_id,
              name: workflow.name,
              is_active: false
            },
            message: '[workflow][mcp][stop] - info - Workflow stopped'
          }, null, 2)
        }
      ]
    };
  }

  private async handleGetExecutionHistory(args: any) {
    const { workflowId, limit = 50 } = args;
    const executions = await this.lifecycleManager.workflowDAL.listExecutions(workflowId, limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            count: executions.length,
            executions
          }, null, 2)
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.log('[MCP] N8N Workflow Lifecycle MCP Server running');
  }

  async cleanup() {
    await this.pool.end();
  }
}

// Main execution
const config: WorkflowMCPConfig = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/lightdom',
  n8nApiUrl: process.env.N8N_API_URL,
  n8nApiKey: process.env.N8N_API_KEY
};

const server = new N8NWorkflowMCPServer(config);

server.run().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await server.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.cleanup();
  process.exit(0);
});
