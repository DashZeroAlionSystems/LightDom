/**
 * Enhanced N8N Workflow Templates with Complete Stages
 * 
 * Comprehensive workflow templates covering all n8n stages:
 * - Triggers (Webhook, Schedule, Manual, Event)
 * - Actions (HTTP, Database, Functions)
 * - Conditions (IF, Switch)
 * - Error Handling (Try-Catch, Retry)
 * - Sub-workflows
 * - Data Transformations
 * 
 * Templates designed for DeepSeek to understand and modify
 */

export const enhancedWorkflowTemplates = {
  /**
   * Complete Webhook-based API Integration Workflow
   * Shows all stages: trigger, validation, actions, conditions, error handling, response
   */
  complete_api_workflow: {
    id: 'complete_api_workflow',
    name: 'Complete API Integration Workflow',
    description: 'Full-featured workflow demonstrating all n8n stages',
    category: 'integration',
    tags: ['api', 'webhook', 'complete', 'error-handling'],
    requiredServices: ['n8n', 'database'],
    stages: {
      trigger: {
        type: 'WEBHOOK',
        description: 'Webhook trigger that accepts POST requests'
      },
      validation: {
        type: 'CONDITION',
        description: 'Validate incoming data before processing'
      },
      actions: [
        {
          type: 'HTTP_REQUEST',
          description: 'Fetch data from external API'
        },
        {
          type: 'DATABASE',
          description: 'Store results in database'
        }
      ],
      errorHandling: {
        type: 'ERROR_TRIGGER',
        description: 'Catch and handle errors'
      },
      response: {
        type: 'RESPOND_TO_WEBHOOK',
        description: 'Send response back to caller'
      }
    },
    configOptions: {
      webhookPath: {
        type: 'string',
        required: true,
        default: 'api-integration',
        description: 'Webhook URL path'
      },
      apiUrl: {
        type: 'string',
        required: true,
        description: 'External API URL to call'
      },
      validateSchema: {
        type: 'boolean',
        default: true,
        description: 'Validate input against schema'
      },
      enableRetry: {
        type: 'boolean',
        default: true,
        description: 'Enable automatic retry on failure'
      },
      maxRetries: {
        type: 'number',
        default: 3,
        minimum: 1,
        maximum: 10,
        description: 'Maximum retry attempts'
      },
      notifyOnError: {
        type: 'boolean',
        default: true,
        description: 'Send notifications on errors'
      }
    },
    workflowDefinition: (config) => ({
      name: `API Integration - ${config.webhookPath}`,
      nodes: [
        // 1. Trigger: Webhook
        {
          name: 'Webhook Trigger',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            httpMethod: 'POST',
            path: config.webhookPath,
            responseMode: 'responseNode',
            options: {}
          },
          webhookId: `webhook_${Date.now()}`
        },

        // 2. Validation: Check Input
        {
          name: 'Validate Input',
          type: 'n8n-nodes-base.if',
          typeVersion: 1,
          position: [450, 300],
          parameters: {
            conditions: {
              string: [
                {
                  value1: '={{$json.body}}',
                  operation: 'isNotEmpty'
                }
              ]
            }
          }
        },

        // 3. Action: Call External API
        {
          name: 'Call External API',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 3,
          position: [650, 250],
          parameters: {
            method: 'POST',
            url: config.apiUrl,
            authentication: 'none',
            options: {
              timeout: 30000,
              redirect: {
                follow: true
              }
            },
            sendBody: true,
            bodyParameters: {
              parameters: [
                {
                  name: 'data',
                  value: '={{$json.body}}'
                }
              ]
            }
          },
          retryOnFail: config.enableRetry,
          maxTries: config.maxRetries,
          waitBetweenTries: 1000,
          continueOnFail: false,
          alwaysOutputData: false
        },

        // 4. Action: Store in Database
        {
          name: 'Store Results',
          type: 'n8n-nodes-base.postgres',
          typeVersion: 2,
          position: [850, 250],
          parameters: {
            operation: 'insert',
            schema: 'public',
            table: 'api_results',
            columns: 'request_data,response_data,created_at',
            additionalFields: {},
            options: {
              queryBatching: 'single'
            }
          },
          continueOnFail: true  // Don't fail workflow if DB insert fails
        },

        // 5. Data Transformation: Format Response
        {
          name: 'Format Response',
          type: 'n8n-nodes-base.set',
          typeVersion: 2,
          position: [1050, 250],
          parameters: {
            mode: 'manual',
            duplicateItem: false,
            assignments: {
              assignments: [
                {
                  name: 'success',
                  value: true,
                  type: 'boolean'
                },
                {
                  name: 'data',
                  value: '={{$json}}',
                  type: 'object'
                },
                {
                  name: 'timestamp',
                  value: '={{new Date().toISOString()}}',
                  type: 'string'
                }
              ]
            },
            options: {}
          }
        },

        // 6. Response: Send Back to Caller
        {
          name: 'Success Response',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [1250, 250],
          parameters: {
            respondWith: 'json',
            responseBody: '={{$json}}',
            options: {
              responseHeaders: {
                entries: [
                  {
                    name: 'Content-Type',
                    value: 'application/json'
                  }
                ]
              }
            }
          }
        },

        // 7. Error Handler: Validation Failed
        {
          name: 'Validation Error',
          type: 'n8n-nodes-base.set',
          typeVersion: 2,
          position: [650, 400],
          parameters: {
            mode: 'manual',
            assignments: {
              assignments: [
                {
                  name: 'success',
                  value: false,
                  type: 'boolean'
                },
                {
                  name: 'error',
                  value: 'Invalid input: body is required',
                  type: 'string'
                },
                {
                  name: 'timestamp',
                  value: '={{new Date().toISOString()}}',
                  type: 'string'
                }
              ]
            }
          }
        },

        // 8. Error Response
        {
          name: 'Error Response',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [850, 400],
          parameters: {
            respondWith: 'json',
            responseBody: '={{$json}}',
            options: {
              responseCode: 400,
              responseHeaders: {
                entries: [
                  {
                    name: 'Content-Type',
                    value: 'application/json'
                  }
                ]
              }
            }
          }
        },

        // 9. Error Handler: Global Error Catcher
        {
          name: 'Error Handler',
          type: 'n8n-nodes-base.errorTrigger',
          typeVersion: 1,
          position: [450, 550],
          parameters: {}
        },

        // 10. Log Error
        {
          name: 'Log Error to Database',
          type: 'n8n-nodes-base.postgres',
          typeVersion: 2,
          position: [650, 550],
          parameters: {
            operation: 'insert',
            schema: 'public',
            table: 'workflow_errors',
            columns: 'workflow_id,error_message,error_stack,created_at',
            additionalFields: {}
          },
          continueOnFail: true
        },

        // 11. Notify on Error (if enabled)
        ...(config.notifyOnError ? [{
          name: 'Notify on Error',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 3,
          position: [850, 550],
          parameters: {
            method: 'POST',
            url: 'http://localhost:3001/api/messages/error-notification',
            sendBody: true,
            bodyParameters: {
              parameters: [
                {
                  name: 'workflowId',
                  value: '={{$workflow.id}}'
                },
                {
                  name: 'error',
                  value: '={{$json.error.message}}'
                },
                {
                  name: 'severity',
                  value: 'high'
                }
              ]
            }
          }
        }] : [])
      ].filter(Boolean),
      connections: {
        'Webhook Trigger': {
          main: [[{ node: 'Validate Input', type: 'main', index: 0 }]]
        },
        'Validate Input': {
          main: [
            [{ node: 'Call External API', type: 'main', index: 0 }],  // True path
            [{ node: 'Validation Error', type: 'main', index: 0 }]   // False path
          ]
        },
        'Call External API': {
          main: [[{ node: 'Store Results', type: 'main', index: 0 }]]
        },
        'Store Results': {
          main: [[{ node: 'Format Response', type: 'main', index: 0 }]]
        },
        'Format Response': {
          main: [[{ node: 'Success Response', type: 'main', index: 0 }]]
        },
        'Validation Error': {
          main: [[{ node: 'Error Response', type: 'main', index: 0 }]]
        },
        'Error Handler': {
          main: [[{ node: 'Log Error to Database', type: 'main', index: 0 }]]
        },
        ...(config.notifyOnError ? {
          'Log Error to Database': {
            main: [[{ node: 'Notify on Error', type: 'main', index: 0 }]]
          }
        } : {})
      },
      settings: {
        executionOrder: 'v1',
        saveManualExecutions: true,
        saveExecutionProgress: true,
        saveDataSuccessExecution: 'all',
        saveDataErrorExecution: 'all'
      }
    })
  },

  /**
   * Scheduled Data Processing Workflow
   * Shows: Schedule trigger, parallel processing, sub-workflows, aggregation
   */
  scheduled_data_processor: {
    id: 'scheduled_data_processor',
    name: 'Scheduled Data Processor',
    description: 'Process data on schedule with parallel tasks and sub-workflows',
    category: 'automation',
    tags: ['schedule', 'parallel', 'sub-workflow'],
    requiredServices: ['n8n', 'database'],
    stages: {
      trigger: {
        type: 'SCHEDULE',
        description: 'Cron-based schedule trigger'
      },
      parallel: {
        type: 'PARALLEL_ACTIONS',
        description: 'Execute multiple tasks in parallel'
      },
      subWorkflows: {
        type: 'EXECUTE_WORKFLOW',
        description: 'Call other workflows for specialized tasks'
      },
      aggregation: {
        type: 'MERGE',
        description: 'Combine results from parallel tasks'
      }
    },
    configOptions: {
      schedule: {
        type: 'string',
        required: true,
        default: '0 * * * *',  // Every hour
        description: 'Cron expression for schedule'
      },
      dataSources: {
        type: 'array',
        required: true,
        description: 'List of data sources to process'
      },
      processingWorkflowId: {
        type: 'string',
        required: false,
        description: 'Sub-workflow ID for processing each item'
      },
      aggregationType: {
        type: 'string',
        enum: ['sum', 'average', 'concat', 'merge'],
        default: 'merge',
        description: 'How to combine results'
      }
    },
    workflowDefinition: (config) => ({
      name: `Scheduled Processor - ${config.schedule}`,
      nodes: [
        // 1. Trigger: Schedule
        {
          name: 'Schedule Trigger',
          type: 'n8n-nodes-base.cron',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            triggerTimes: {
              item: [
                {
                  mode: 'custom',
                  cronExpression: config.schedule
                }
              ]
            }
          }
        },

        // 2. Split Data Sources for Parallel Processing
        {
          name: 'Split Data Sources',
          type: 'n8n-nodes-base.splitInBatches',
          typeVersion: 2,
          position: [450, 300],
          parameters: {
            batchSize: 1,
            options: {}
          }
        },

        // 3. Process Each Source (can call sub-workflow)
        ...(config.processingWorkflowId ? [{
          name: 'Process via Sub-Workflow',
          type: 'n8n-nodes-base.executeWorkflow',
          typeVersion: 1,
          position: [650, 300],
          parameters: {
            source: 'database',
            workflowId: config.processingWorkflowId,
            waitForSubWorkflow: true
          }
        }] : [{
          name: 'Process Data',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [650, 300],
          parameters: {
            functionCode: `
// Process data from source
const source = items[0].json;

// Your processing logic here
const result = {
  source: source.name,
  processed: true,
  timestamp: new Date().toISOString(),
  data: source.data
};

return [{ json: result }];
            `
          }
        }]),

        // 4. Aggregate Results
        {
          name: 'Aggregate Results',
          type: 'n8n-nodes-base.aggregate',
          typeVersion: 1,
          position: [850, 300],
          parameters: {
            aggregate: config.aggregationType,
            fieldsToAggregate: {
              fieldToAggregate: [
                {
                  fieldToAggregate: 'data'
                }
              ]
            }
          }
        },

        // 5. Store Aggregated Results
        {
          name: 'Store Results',
          type: 'n8n-nodes-base.postgres',
          typeVersion: 2,
          position: [1050, 300],
          parameters: {
            operation: 'insert',
            schema: 'public',
            table: 'scheduled_results',
            columns: 'schedule,results,created_at'
          }
        }
      ],
      connections: {
        'Schedule Trigger': {
          main: [[{ node: 'Split Data Sources', type: 'main', index: 0 }]]
        },
        'Split Data Sources': {
          main: [[{ node: config.processingWorkflowId ? 'Process via Sub-Workflow' : 'Process Data', type: 'main', index: 0 }]]
        },
        [config.processingWorkflowId ? 'Process via Sub-Workflow' : 'Process Data']: {
          main: [[{ node: 'Aggregate Results', type: 'main', index: 0 }]]
        },
        'Aggregate Results': {
          main: [[{ node: 'Store Results', type: 'main', index: 0 }]]
        }
      },
      settings: {
        executionOrder: 'v1'
      }
    })
  },

  /**
   * Event-Driven Workflow with Conditions
   * Shows: Event trigger, multiple conditions (Switch), different action paths
   */
  event_driven_router: {
    id: 'event_driven_router',
    name: 'Event-Driven Router',
    description: 'Route events to different actions based on conditions',
    category: 'automation',
    tags: ['event', 'switch', 'routing'],
    requiredServices: ['n8n'],
    stages: {
      trigger: {
        type: 'WEBHOOK',
        description: 'Receive events via webhook'
      },
      routing: {
        type: 'SWITCH',
        description: 'Route to different actions based on event type'
      },
      actions: {
        type: 'MULTIPLE_PATHS',
        description: 'Different actions for different event types'
      }
    },
    configOptions: {
      eventTypes: {
        type: 'array',
        required: true,
        default: ['create', 'update', 'delete'],
        description: 'Event types to handle'
      },
      webhookPath: {
        type: 'string',
        default: 'events',
        description: 'Webhook path for events'
      }
    },
    workflowDefinition: (config) => ({
      name: `Event Router - ${config.webhookPath}`,
      nodes: [
        // 1. Trigger: Event Webhook
        {
          name: 'Event Trigger',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            httpMethod: 'POST',
            path: config.webhookPath,
            responseMode: 'responseNode'
          }
        },

        // 2. Router: Switch on Event Type
        {
          name: 'Route by Event Type',
          type: 'n8n-nodes-base.switch',
          typeVersion: 1,
          position: [450, 300],
          parameters: {
            rules: {
              rules: config.eventTypes.map((type, index) => ({
                output: index,
                conditions: {
                  string: [
                    {
                      value1: '={{$json.eventType}}',
                      value2: type,
                      operation: 'equals'
                    }
                  ]
                }
              }))
            }
          }
        },

        // 3. Actions for each event type
        ...config.eventTypes.map((type, index) => ({
          name: `Handle ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [650, 200 + (index * 150)],
          parameters: {
            functionCode: `
// Handle ${type} event
const event = items[0].json;

console.log('Processing ${type} event:', event);

return [{
  json: {
    eventType: '${type}',
    processed: true,
    timestamp: new Date().toISOString(),
    data: event
  }
}];
            `
          }
        })),

        // 4. Response
        {
          name: 'Response',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [850, 300],
          parameters: {
            respondWith: 'json',
            responseBody: '={{$json}}'
          }
        }
      ],
      connections: {
        'Event Trigger': {
          main: [[{ node: 'Route by Event Type', type: 'main', index: 0 }]]
        },
        'Route by Event Type': {
          main: config.eventTypes.map((type, index) => [
            { node: `Handle ${type.charAt(0).toUpperCase() + type.slice(1)}`, type: 'main', index: 0 }
          ])
        },
        ...Object.fromEntries(
          config.eventTypes.map(type => [
            `Handle ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            {
              main: [[{ node: 'Response', type: 'main', index: 0 }]]
            }
          ])
        )
      }
    })
  }
};

/**
 * Get all enhanced templates
 */
export function getAllEnhancedTemplates() {
  return Object.values(enhancedWorkflowTemplates);
}

/**
 * Get template by ID
 */
export function getEnhancedTemplate(templateId) {
  return enhancedWorkflowTemplates[templateId] || null;
}

/**
 * Get templates by stage type
 */
export function getTemplatesByStage(stageType) {
  return Object.values(enhancedWorkflowTemplates).filter(template => 
    template.stages.trigger?.type === stageType ||
    template.stages.actions?.some(a => a.type === stageType) ||
    template.stages.errorHandling?.type === stageType
  );
}

/**
 * Create workflow from enhanced template
 */
export function createWorkflowFromEnhancedTemplate(templateId, config) {
  const template = getEnhancedTemplate(templateId);
  
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }
  
  // Validate required config options
  for (const [key, option] of Object.entries(template.configOptions)) {
    if (option.required && !config[key]) {
      throw new Error(`Missing required config option: ${key}`);
    }
    
    // Apply defaults
    if (config[key] === undefined && option.default !== undefined) {
      config[key] = option.default;
    }
  }
  
  // Generate workflow definition
  const workflowDef = template.workflowDefinition(config);
  
  return {
    ...workflowDef,
    templateId: template.id,
    templateName: template.name,
    tags: [...(template.tags || []), 'from-enhanced-template'],
    requiredServices: template.requiredServices,
    stages: template.stages
  };
}

export default {
  enhancedWorkflowTemplates,
  getAllEnhancedTemplates,
  getEnhancedTemplate,
  getTemplatesByStage,
  createWorkflowFromEnhancedTemplate
};
