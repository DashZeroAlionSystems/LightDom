/**
 * N8N Workflow Lifecycle Manager
 * 
 * Manages complete workflow lifecycle with all stages:
 * - Triggers (webhook, schedule, manual, event)
 * - Actions (HTTP, database, function, etc.)
 * - Conditions (IF, Switch, Error Router)
 * - Error Handling (Try-Catch, Retry, Fallback)
 * - Sub-workflows (Execute Workflow, Wait)
 * 
 * Enables DeepSeek to manage workflows and handle errors
 */

import { EventEmitter } from 'events';
import { N8NWorkflowsDAL } from '../api/data-access/n8n-workflows-dal.js';

export class N8NWorkflowLifecycleManager extends EventEmitter {
  constructor(pool, deepseekService = null) {
    super();
    this.workflowDAL = new N8NWorkflowsDAL(pool);
    this.deepseekService = deepseekService;
    this.activeWorkflows = new Map();
    this.errorLog = [];
  }

  /**
   * Workflow Stage Types - Complete N8N Node Categories
   */
  static STAGE_TYPES = {
    // Triggers
    TRIGGERS: {
      WEBHOOK: 'n8n-nodes-base.webhook',
      SCHEDULE: 'n8n-nodes-base.cron',
      MANUAL: 'n8n-nodes-base.manualTrigger',
      EMAIL_TRIGGER: 'n8n-nodes-base.emailReadImap',
      FILE_TRIGGER: 'n8n-nodes-base.localFileTrigger',
      DATABASE_TRIGGER: 'n8n-nodes-base.postgresTrigger',
      SSE: 'n8n-nodes-base.sse'
    },

    // Actions
    ACTIONS: {
      HTTP_REQUEST: 'n8n-nodes-base.httpRequest',
      DATABASE: 'n8n-nodes-base.postgres',
      FUNCTION: 'n8n-nodes-base.function',
      CODE: 'n8n-nodes-base.code',
      EMAIL_SEND: 'n8n-nodes-base.emailSend',
      FILE_WRITE: 'n8n-nodes-base.writeBinaryFile',
      EXECUTE_COMMAND: 'n8n-nodes-base.executeCommand'
    },

    // Flow Control
    FLOW_CONTROL: {
      IF: 'n8n-nodes-base.if',
      SWITCH: 'n8n-nodes-base.switch',
      MERGE: 'n8n-nodes-base.merge',
      SPLIT_IN_BATCHES: 'n8n-nodes-base.splitInBatches',
      LOOP_OVER_ITEMS: 'n8n-nodes-base.splitOut'
    },

    // Error Handling
    ERROR_HANDLING: {
      ERROR_TRIGGER: 'n8n-nodes-base.errorTrigger',
      STOP_AND_ERROR: 'n8n-nodes-base.stopAndError',
      NO_OP: 'n8n-nodes-base.noOp'
    },

    // Sub-workflows
    SUB_WORKFLOWS: {
      EXECUTE_WORKFLOW: 'n8n-nodes-base.executeWorkflow',
      WAIT: 'n8n-nodes-base.wait',
      STICKY_NOTE: 'n8n-nodes-base.stickyNote'
    },

    // Data Transformation
    DATA: {
      SET: 'n8n-nodes-base.set',
      ITEM_LISTS: 'n8n-nodes-base.itemLists',
      AGGREGATE: 'n8n-nodes-base.aggregate',
      SORT: 'n8n-nodes-base.sort',
      FILTER: 'n8n-nodes-base.filter'
    },

    // Response
    RESPONSE: {
      RESPOND_TO_WEBHOOK: 'n8n-nodes-base.respondToWebhook',
      RETURN: 'n8n-nodes-base.returnNodeOutput'
    }
  };

  /**
   * Create a complete workflow with all stages
   */
  async createCompleteWorkflow(config) {
    const {
      name,
      description,
      trigger,
      actions = [],
      conditions = [],
      errorHandling = {},
      subWorkflows = [],
      dataTransformations = [],
      response = null
    } = config;

    const workflowDefinition = {
      name,
      description,
      nodes: [],
      connections: {},
      settings: {
        executionOrder: 'v1',
        saveManualExecutions: true,
        saveExecutionProgress: true,
        saveDataSuccessExecution: 'all',
        saveDataErrorExecution: 'all',
        callerPolicy: 'workflowsFromSameOwner',
        errorWorkflow: errorHandling.errorWorkflowId || null,
        timezone: 'America/New_York'
      },
      staticData: null,
      tags: config.tags || [],
      meta: {
        createdWith: 'lightdom-workflow-manager',
        version: '1.0',
        stages: {
          trigger: trigger.type,
          actionCount: actions.length,
          conditionCount: conditions.length,
          hasErrorHandling: !!errorHandling.enabled,
          hasSubWorkflows: subWorkflows.length > 0
        }
      }
    };

    let position = [250, 300];
    let previousNode = null;

    // 1. Add Trigger Node
    const triggerNode = this.createTriggerNode(trigger, position);
    workflowDefinition.nodes.push(triggerNode);
    previousNode = triggerNode.name;
    position = [position[0] + 200, position[1]];

    // 2. Add Error Handler (if enabled)
    if (errorHandling.enabled) {
      const errorTrigger = this.createErrorHandlerNode(errorHandling, [position[0], position[1] + 200]);
      workflowDefinition.nodes.push(errorTrigger);
    }

    // 3. Add Data Transformations (initial)
    for (const transform of dataTransformations.filter(t => t.stage === 'pre')) {
      const transformNode = this.createDataTransformNode(transform, position);
      workflowDefinition.nodes.push(transformNode);
      workflowDefinition.connections[previousNode] = {
        main: [[{ node: transformNode.name, type: 'main', index: 0 }]]
      };
      previousNode = transformNode.name;
      position = [position[0] + 200, position[1]];
    }

    // 4. Add Actions with Conditions
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      
      // Add condition before action if specified
      if (action.condition) {
        const conditionNode = this.createConditionNode(action.condition, position);
        workflowDefinition.nodes.push(conditionNode);
        workflowDefinition.connections[previousNode] = {
          main: [[{ node: conditionNode.name, type: 'main', index: 0 }]]
        };
        previousNode = conditionNode.name;
        position = [position[0] + 200, position[1]];
      }

      // Add the action node
      const actionNode = this.createActionNode(action, position);
      workflowDefinition.nodes.push(actionNode);
      
      // Connect with error handling
      if (errorHandling.enabled && action.canFail) {
        workflowDefinition.connections[previousNode] = {
          main: [[{ node: actionNode.name, type: 'main', index: 0 }]],
          error: [[{ node: 'Error Handler', type: 'main', index: 0 }]]
        };
      } else {
        workflowDefinition.connections[previousNode] = {
          main: [[{ node: actionNode.name, type: 'main', index: 0 }]]
        };
      }

      previousNode = actionNode.name;
      position = [position[0] + 200, position[1]];

      // Add retry logic if specified
      if (action.retry) {
        actionNode.retry = {
          enabled: true,
          maxAttempts: action.retry.maxAttempts || 3,
          waitTime: action.retry.waitTime || 1000
        };
      }
    }

    // 5. Add Sub-workflows
    for (const subWorkflow of subWorkflows) {
      const subNode = this.createSubWorkflowNode(subWorkflow, position);
      workflowDefinition.nodes.push(subNode);
      workflowDefinition.connections[previousNode] = {
        main: [[{ node: subNode.name, type: 'main', index: 0 }]]
      };
      previousNode = subNode.name;
      position = [position[0] + 200, position[1]];
    }

    // 6. Add Data Transformations (post)
    for (const transform of dataTransformations.filter(t => t.stage === 'post')) {
      const transformNode = this.createDataTransformNode(transform, position);
      workflowDefinition.nodes.push(transformNode);
      workflowDefinition.connections[previousNode] = {
        main: [[{ node: transformNode.name, type: 'main', index: 0 }]]
      };
      previousNode = transformNode.name;
      position = [position[0] + 200, position[1]];
    }

    // 7. Add Response Node (if applicable)
    if (response) {
      const responseNode = this.createResponseNode(response, position);
      workflowDefinition.nodes.push(responseNode);
      workflowDefinition.connections[previousNode] = {
        main: [[{ node: responseNode.name, type: 'main', index: 0 }]]
      };
    }

    // Save to database
    const workflow = await this.workflowDAL.createWorkflow({
      workflow_id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      workflow_type: config.type || 'automation',
      workflow_definition: workflowDefinition,
      tags: config.tags || [],
      is_active: false,
      created_by: config.createdBy || 'system'
    });

    // Emit event for DeepSeek
    this.emit('workflow:created', {
      workflow,
      stages: workflowDefinition.meta.stages,
      message: `[workflow][lifecycle][create] - info - Workflow created with ${workflowDefinition.nodes.length} nodes`
    });

    return workflow;
  }

  /**
   * Create trigger node
   */
  createTriggerNode(trigger, position) {
    const nodeType = N8NWorkflowLifecycleManager.STAGE_TYPES.TRIGGERS[trigger.type] || 
                     N8NWorkflowLifecycleManager.STAGE_TYPES.TRIGGERS.MANUAL;

    return {
      name: 'Trigger',
      type: nodeType,
      typeVersion: 1,
      position,
      parameters: trigger.parameters || {},
      webhookId: trigger.type === 'WEBHOOK' ? `webhook_${Date.now()}` : undefined
    };
  }

  /**
   * Create action node
   */
  createActionNode(action, position) {
    const nodeType = N8NWorkflowLifecycleManager.STAGE_TYPES.ACTIONS[action.type] || 
                     N8NWorkflowLifecycleManager.STAGE_TYPES.ACTIONS.FUNCTION;

    return {
      name: action.name || `Action ${Date.now()}`,
      type: nodeType,
      typeVersion: 1,
      position,
      parameters: action.parameters || {},
      continueOnFail: action.continueOnFail || false,
      alwaysOutputData: action.alwaysOutputData || false,
      executeOnce: action.executeOnce || false,
      retryOnFail: action.retry?.enabled || false,
      maxTries: action.retry?.maxAttempts || 3,
      waitBetweenTries: action.retry?.waitTime || 1000
    };
  }

  /**
   * Create condition node
   */
  createConditionNode(condition, position) {
    return {
      name: condition.name || `Condition ${Date.now()}`,
      type: N8NWorkflowLifecycleManager.STAGE_TYPES.FLOW_CONTROL.IF,
      typeVersion: 1,
      position,
      parameters: {
        conditions: {
          boolean: [],
          number: [],
          string: condition.rules || []
        }
      }
    };
  }

  /**
   * Create error handler node
   */
  createErrorHandlerNode(errorHandling, position) {
    return {
      name: 'Error Handler',
      type: N8NWorkflowLifecycleManager.STAGE_TYPES.ERROR_HANDLING.ERROR_TRIGGER,
      typeVersion: 1,
      position,
      parameters: {
        errorWorkflow: errorHandling.errorWorkflowId,
        notifyOnError: errorHandling.notify || true,
        errorMessage: errorHandling.customMessage || '{{$json.error.message}}'
      }
    };
  }

  /**
   * Create sub-workflow node
   */
  createSubWorkflowNode(subWorkflow, position) {
    return {
      name: subWorkflow.name || `Sub-Workflow ${Date.now()}`,
      type: N8NWorkflowLifecycleManager.STAGE_TYPES.SUB_WORKFLOWS.EXECUTE_WORKFLOW,
      typeVersion: 1,
      position,
      parameters: {
        workflowId: subWorkflow.workflowId,
        source: 'database',
        waitForSubWorkflow: subWorkflow.waitForCompletion !== false
      }
    };
  }

  /**
   * Create data transformation node
   */
  createDataTransformNode(transform, position) {
    const nodeType = transform.type === 'FILTER' 
      ? N8NWorkflowLifecycleManager.STAGE_TYPES.DATA.FILTER
      : N8NWorkflowLifecycleManager.STAGE_TYPES.DATA.SET;

    return {
      name: transform.name || `Transform ${Date.now()}`,
      type: nodeType,
      typeVersion: 1,
      position,
      parameters: transform.parameters || {}
    };
  }

  /**
   * Create response node
   */
  createResponseNode(response, position) {
    return {
      name: 'Response',
      type: N8NWorkflowLifecycleManager.STAGE_TYPES.RESPONSE.RESPOND_TO_WEBHOOK,
      typeVersion: 1,
      position,
      parameters: {
        respondWith: response.type || 'json',
        responseBody: response.body || '={{$json}}',
        responseHeaders: response.headers || {}
      }
    };
  }

  /**
   * Log error for DeepSeek to review
   */
  async logError(workflowId, executionId, error, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      workflowId,
      executionId,
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code,
        type: error.constructor.name
      },
      context,
      severity: this.determineErrorSeverity(error),
      message: `[workflow][execution][error] - error - Workflow ${workflowId} failed: ${error.message}`
    };

    this.errorLog.push(errorEntry);

    // Keep only last 1000 errors
    if (this.errorLog.length > 1000) {
      this.errorLog = this.errorLog.slice(-1000);
    }

    // Emit for DeepSeek
    this.emit('workflow:error', errorEntry);

    // Store in database
    await this.workflowDAL.updateExecutionStatus(
      executionId,
      'failed',
      context,
      error.message
    );

    // Notify DeepSeek service if available
    if (this.deepseekService) {
      await this.notifyDeepSeekAboutError(errorEntry);
    }

    return errorEntry;
  }

  /**
   * Determine error severity
   */
  determineErrorSeverity(error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return 'critical';
    }
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return 'medium';
    }
    if (error.message.includes('warning') || error.message.includes('deprecated')) {
      return 'low';
    }
    return 'high';
  }

  /**
   * Notify DeepSeek about error for analysis and potential fix
   */
  async notifyDeepSeekAboutError(errorEntry) {
    if (!this.deepseekService) return;

    try {
      const prompt = `
Workflow Error Analysis:
Workflow ID: ${errorEntry.workflowId}
Execution ID: ${errorEntry.executionId}
Error: ${errorEntry.error.message}
Severity: ${errorEntry.severity}

Context:
${JSON.stringify(errorEntry.context, null, 2)}

Please analyze this workflow error and provide:
1. Root cause analysis
2. Suggested fix or workaround
3. Prevention strategies for future
4. Priority level for fixing (1-5)

Format your response as JSON.
      `;

      const analysis = await this.deepseekService.analyze(prompt);
      
      errorEntry.deepseekAnalysis = analysis;
      
      this.emit('deepseek:error-analysis', {
        errorEntry,
        analysis,
        message: `[workflow][deepseek][analysis] - info - Error analyzed by DeepSeek`
      });

      return analysis;
    } catch (err) {
      console.error('[workflow][deepseek][analysis] - error - Failed to get DeepSeek analysis:', err);
      return null;
    }
  }

  /**
   * Get errors for DeepSeek to review
   */
  getErrorsForDeepSeek(filters = {}) {
    let errors = [...this.errorLog];

    if (filters.severity) {
      errors = errors.filter(e => e.severity === filters.severity);
    }

    if (filters.workflowId) {
      errors = errors.filter(e => e.workflowId === filters.workflowId);
    }

    if (filters.since) {
      const sinceDate = new Date(filters.since);
      errors = errors.filter(e => new Date(e.timestamp) >= sinceDate);
    }

    return errors.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Enable DeepSeek to manage workflow
   */
  async enableDeepSeekManagement(workflowId) {
    const workflow = await this.workflowDAL.getWorkflowById(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // Add DeepSeek management metadata
    const updated = await this.workflowDAL.updateWorkflow(workflowId, {
      workflow_definition: {
        ...workflow.workflow_definition,
        meta: {
          ...workflow.workflow_definition.meta,
          deepseekManaged: true,
          deepseekEnabledAt: new Date().toISOString(),
          deepseekCapabilities: [
            'error_analysis',
            'performance_optimization',
            'auto_fixing',
            'proactive_monitoring'
          ]
        }
      }
    });

    this.emit('deepseek:management-enabled', {
      workflowId,
      message: `[workflow][deepseek][management] - info - DeepSeek management enabled for workflow ${workflowId}`
    });

    return updated;
  }

  /**
   * Get workflow statistics for DeepSeek
   */
  async getWorkflowStatsForDeepSeek(workflowId) {
    const stats = await this.workflowDAL.getWorkflowStats(workflowId);
    const errors = this.getErrorsForDeepSeek({ workflowId });

    return {
      workflowId,
      stats: {
        totalExecutions: parseInt(stats.total_executions) || 0,
        successfulExecutions: parseInt(stats.successful_executions) || 0,
        failedExecutions: parseInt(stats.failed_executions) || 0,
        runningExecutions: parseInt(stats.running_executions) || 0,
        avgExecutionTimeMs: parseFloat(stats.avg_execution_time_ms) || 0,
        lastExecutionAt: stats.last_execution_at
      },
      errors: {
        total: errors.length,
        critical: errors.filter(e => e.severity === 'critical').length,
        high: errors.filter(e => e.severity === 'high').length,
        medium: errors.filter(e => e.severity === 'medium').length,
        low: errors.filter(e => e.severity === 'low').length,
        recentErrors: errors.slice(0, 10)
      },
      healthScore: this.calculateHealthScore(stats, errors),
      recommendations: this.generateRecommendations(stats, errors)
    };
  }

  /**
   * Calculate workflow health score (0-100)
   */
  calculateHealthScore(stats, errors) {
    const successRate = stats.successful_executions / (stats.total_executions || 1);
    const errorRate = errors.length / (stats.total_executions || 1);
    const criticalErrors = errors.filter(e => e.severity === 'critical').length;

    let score = 100;
    score -= (1 - successRate) * 50; // Success rate impacts up to 50 points
    score -= Math.min(errorRate * 100, 30); // Error rate impacts up to 30 points
    score -= criticalErrors * 5; // Each critical error reduces 5 points

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generate recommendations for workflow improvement
   */
  generateRecommendations(stats, errors) {
    const recommendations = [];

    const successRate = stats.successful_executions / (stats.total_executions || 1);
    if (successRate < 0.9) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: `Success rate is ${(successRate * 100).toFixed(1)}% (target: >90%)`,
        action: 'Review error logs and add retry logic to failing nodes'
      });
    }

    if (stats.avg_execution_time_ms > 30000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: `Average execution time is ${(stats.avg_execution_time_ms / 1000).toFixed(1)}s (target: <30s)`,
        action: 'Optimize slow nodes or consider parallel execution'
      });
    }

    const criticalErrors = errors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      recommendations.push({
        type: 'critical',
        priority: 'critical',
        message: `${criticalErrors.length} critical errors detected`,
        action: 'Immediate attention required - check error logs'
      });
    }

    return recommendations;
  }
}

export default N8NWorkflowLifecycleManager;
