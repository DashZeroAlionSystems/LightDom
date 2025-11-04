/**
 * DeepSeek Workflow Orchestrator
 * 
 * Orchestrates workflow execution with:
 * - Long-running task support
 * - Task polling mechanism
 * - DeepSeek AI integration
 * - n8n workflow execution
 * - Step-by-step workflow management
 */

import { Pool } from 'pg';
import axios from 'axios';
import { EventEmitter } from 'events';
import {
  DeepSeekWorkflowCRUDService,
  OrchestratedWorkflow,
  OrchestratedTask,
  WorkflowRun,
  LongRunningTask
} from './deepseek-workflow-crud-service.js';

export interface OrchestrationContext {
  workflowId: string;
  runId: string;
  triggerData: Record<string, any>;
  variables: Record<string, any>;
  taskResults: Map<string, any>;
}

export interface TaskHandler {
  type: string;
  execute: (task: OrchestratedTask, context: OrchestrationContext) => Promise<any>;
}

export class DeepSeekWorkflowOrchestrator extends EventEmitter {
  private db: Pool;
  private crudService: DeepSeekWorkflowCRUDService;
  private taskHandlers: Map<string, TaskHandler>;
  private activeRuns: Map<string, OrchestrationContext>;
  private pollingInterval: NodeJS.Timeout | null = null;
  private deepseekConfig: {
    apiUrl: string;
    apiKey: string;
    model: string;
  };
  private n8nConfig: {
    apiUrl: string;
    apiKey?: string;
    webhookUrl: string;
  };

  constructor(
    db: Pool,
    deepseekConfig: { apiUrl: string; apiKey: string; model: string },
    n8nConfig: { apiUrl: string; apiKey?: string; webhookUrl: string }
  ) {
    super();
    this.db = db;
    this.crudService = new DeepSeekWorkflowCRUDService(db);
    this.taskHandlers = new Map();
    this.activeRuns = new Map();
    this.deepseekConfig = deepseekConfig;
    this.n8nConfig = n8nConfig;

    this.registerDefaultHandlers();
  }

  /**
   * Register default task handlers
   */
  private registerDefaultHandlers(): void {
    // DeepSeek AI task handler
    this.registerTaskHandler({
      type: 'deepseek',
      execute: async (task, context) => {
        return await this.executeDeepSeekTask(task, context);
      }
    });

    // n8n workflow task handler
    this.registerTaskHandler({
      type: 'n8n',
      execute: async (task, context) => {
        return await this.executeN8nTask(task, context);
      }
    });

    // API call task handler
    this.registerTaskHandler({
      type: 'api',
      execute: async (task, context) => {
        return await this.executeApiTask(task, context);
      }
    });

    // Database task handler
    this.registerTaskHandler({
      type: 'database',
      execute: async (task, context) => {
        return await this.executeDatabaseTask(task, context);
      }
    });
  }

  /**
   * Register a custom task handler
   */
  registerTaskHandler(handler: TaskHandler): void {
    this.taskHandlers.set(handler.type, handler);
  }

  /**
   * Start workflow execution
   */
  async executeWorkflow(
    workflowId: string,
    triggerData: Record<string, any> = {},
    executionMode: 'auto' | 'manual' | 'scheduled' | 'triggered' = 'auto'
  ): Promise<WorkflowRun> {
    // Get workflow definition
    const workflow = await this.crudService.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (workflow.status !== 'active') {
      throw new Error(`Workflow is not active: ${workflow.status}`);
    }

    // Create workflow run
    const run = await this.crudService.createWorkflowRun({
      workflow_id: workflowId,
      status: 'pending',
      execution_mode: executionMode,
      trigger_data: triggerData
    });

    // Initialize orchestration context
    const context: OrchestrationContext = {
      workflowId,
      runId: run.run_id,
      triggerData,
      variables: {},
      taskResults: new Map()
    };

    this.activeRuns.set(run.run_id, context);

    // Start execution asynchronously
    this.executeWorkflowAsync(workflow, run, context).catch(error => {
      console.error(`Workflow execution failed: ${error.message}`, error);
    });

    return run;
  }

  /**
   * Execute workflow asynchronously
   */
  private async executeWorkflowAsync(
    workflow: OrchestratedWorkflow,
    run: WorkflowRun,
    context: OrchestrationContext
  ): Promise<void> {
    try {
      // Update status to running
      await this.crudService.updateWorkflowRun(run.run_id, {
        status: 'running',
        started_at: new Date()
      });

      this.emit('workflow:started', { runId: run.run_id, workflowId: workflow.workflow_id });

      // Get all tasks for workflow
      const tasks = await this.crudService.listTasksForWorkflow(workflow.workflow_id);

      // Execute based on workflow type
      if (workflow.workflow_type === 'sequential') {
        await this.executeSequential(tasks, context);
      } else if (workflow.workflow_type === 'parallel') {
        await this.executeParallel(tasks, context);
      } else if (workflow.workflow_type === 'dag') {
        await this.executeDAG(tasks, context);
      } else {
        throw new Error(`Unsupported workflow type: ${workflow.workflow_type}`);
      }

      // Mark as completed
      await this.crudService.updateWorkflowRun(run.run_id, {
        status: 'success',
        completed_at: new Date(),
        progress_percentage: 100
      });

      this.emit('workflow:completed', { runId: run.run_id, workflowId: workflow.workflow_id });
    } catch (error: any) {
      await this.crudService.updateWorkflowRun(run.run_id, {
        status: 'failed',
        completed_at: new Date(),
        error: error.message
      });

      this.emit('workflow:failed', { runId: run.run_id, workflowId: workflow.workflow_id, error: error.message });
    } finally {
      this.activeRuns.delete(run.run_id);
    }
  }

  /**
   * Execute tasks sequentially
   */
  private async executeSequential(tasks: OrchestratedTask[], context: OrchestrationContext): Promise<void> {
    const totalTasks = tasks.length;
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      
      // Check if task should be executed based on conditional logic
      if (task.conditional_logic && !this.evaluateCondition(task.conditional_logic, context)) {
        continue;
      }

      await this.executeTask(task, context);

      // Update progress
      const progress = Math.round(((i + 1) / totalTasks) * 100);
      await this.crudService.updateWorkflowRun(context.runId, {
        progress_percentage: progress,
        current_task_id: task.task_id
      });
    }
  }

  /**
   * Execute tasks in parallel
   */
  private async executeParallel(tasks: OrchestratedTask[], context: OrchestrationContext): Promise<void> {
    const promises = tasks.map(task => {
      if (task.conditional_logic && !this.evaluateCondition(task.conditional_logic, context)) {
        return Promise.resolve();
      }
      return this.executeTask(task, context);
    });

    await Promise.all(promises);
  }

  /**
   * Execute tasks as DAG (Directed Acyclic Graph)
   */
  private async executeDAG(tasks: OrchestratedTask[], context: OrchestrationContext): Promise<void> {
    const taskMap = new Map<string, OrchestratedTask>();
    const completedTasks = new Set<string>();
    const pendingTasks = new Set<string>();

    // Build task map
    tasks.forEach(task => {
      taskMap.set(task.task_id, task);
      pendingTasks.add(task.task_id);
    });

    // Execute tasks based on dependencies
    while (pendingTasks.size > 0) {
      const readyTasks: OrchestratedTask[] = [];

      // Find tasks with all dependencies completed
      for (const taskId of pendingTasks) {
        const task = taskMap.get(taskId)!;
        const dependencies = task.dependencies || [];

        if (dependencies.every(dep => completedTasks.has(dep))) {
          readyTasks.push(task);
        }
      }

      if (readyTasks.length === 0) {
        throw new Error('Circular dependency detected or unresolvable dependencies');
      }

      // Execute ready tasks in parallel
      await Promise.all(
        readyTasks.map(async task => {
          if (task.conditional_logic && !this.evaluateCondition(task.conditional_logic, context)) {
            completedTasks.add(task.task_id);
            pendingTasks.delete(task.task_id);
            return;
          }

          await this.executeTask(task, context);
          completedTasks.add(task.task_id);
          pendingTasks.delete(task.task_id);
        })
      );

      // Update progress
      const progress = Math.round((completedTasks.size / tasks.length) * 100);
      await this.crudService.updateWorkflowRun(context.runId, {
        progress_percentage: progress
      });
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: OrchestratedTask, context: OrchestrationContext): Promise<void> {
    const handler = this.taskHandlers.get(task.task_type);
    if (!handler) {
      throw new Error(`No handler registered for task type: ${task.task_type}`);
    }

    this.emit('task:started', { taskId: task.task_id, runId: context.runId });

    try {
      const result = await handler.execute(task, context);
      context.taskResults.set(task.task_id, result);

      this.emit('task:completed', { taskId: task.task_id, runId: context.runId, result });
    } catch (error: any) {
      this.emit('task:failed', { taskId: task.task_id, runId: context.runId, error: error.message });

      if (!task.is_optional) {
        throw error;
      }
    }
  }

  /**
   * Execute DeepSeek AI task
   */
  private async executeDeepSeekTask(task: OrchestratedTask, context: OrchestrationContext): Promise<any> {
    const config = task.handler_config;
    const promptTemplateId = config.promptTemplateId;

    let prompt = config.prompt;

    // Load template if specified
    if (promptTemplateId) {
      const template = await this.crudService.getPromptTemplate(promptTemplateId);
      if (template) {
        prompt = this.interpolateTemplate(template.template_content, {
          ...context.variables,
          ...config.variables
        });
      }
    }

    // Call DeepSeek API
    const response = await axios.post(
      `${this.deepseekConfig.apiUrl}/chat/completions`,
      {
        model: this.deepseekConfig.model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.deepseekConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data.choices[0].message.content;

    // Try to parse JSON if expected
    if (config.parseJson) {
      try {
        return JSON.parse(result);
      } catch {
        return result;
      }
    }

    return result;
  }

  /**
   * Execute n8n workflow task
   */
  private async executeN8nTask(task: OrchestratedTask, context: OrchestrationContext): Promise<any> {
    const config = task.handler_config;
    const workflowId = config.n8nWorkflowId;

    if (!workflowId) {
      throw new Error('n8n workflow ID is required');
    }

    // Create long-running task for polling
    const lrt = await this.crudService.createLongRunningTask({
      execution_id: context.runId,
      task_type: 'n8n-workflow',
      external_id: workflowId,
      status: 'submitted',
      polling_interval_seconds: 5
    });

    // Trigger n8n workflow via webhook
    const webhookUrl = `${this.n8nConfig.webhookUrl}/${workflowId}`;
    const response = await axios.post(webhookUrl, {
      ...config.input,
      ...context.variables,
      _callbackUrl: `${process.env.API_URL}/api/workflows/callback/${lrt.task_id}`
    });

    // Wait for completion via polling
    return await this.waitForTaskCompletion(lrt.task_id, config.timeout || 3600);
  }

  /**
   * Execute API call task
   */
  private async executeApiTask(task: OrchestratedTask, context: OrchestrationContext): Promise<any> {
    const config = task.handler_config;
    
    const response = await axios({
      method: config.method || 'GET',
      url: config.url,
      headers: config.headers || {},
      data: config.body,
      timeout: config.timeout || 30000
    });

    return response.data;
  }

  /**
   * Execute database task
   */
  private async executeDatabaseTask(task: OrchestratedTask, context: OrchestrationContext): Promise<any> {
    const config = task.handler_config;
    const query = this.interpolateTemplate(config.query, context.variables);
    
    const result = await this.db.query(query, config.params || []);
    return result.rows;
  }

  /**
   * Wait for long-running task completion
   */
  private async waitForTaskCompletion(taskId: string, timeoutSeconds: number): Promise<any> {
    const startTime = Date.now();
    const timeout = timeoutSeconds * 1000;

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(async () => {
        try {
          const task = await this.crudService.getLongRunningTask(taskId);
          
          if (!task) {
            clearInterval(checkInterval);
            reject(new Error('Task not found'));
            return;
          }

          if (task.status === 'completed') {
            clearInterval(checkInterval);
            resolve(task.result_data);
            return;
          }

          if (task.status === 'failed') {
            clearInterval(checkInterval);
            reject(new Error(task.error || 'Task failed'));
            return;
          }

          if (Date.now() - startTime > timeout) {
            clearInterval(checkInterval);
            reject(new Error('Task timeout'));
            return;
          }
        } catch (error) {
          clearInterval(checkInterval);
          reject(error);
        }
      }, 2000); // Check every 2 seconds
    });
  }

  /**
   * Start polling service for long-running tasks
   */
  startPollingService(intervalMs: number = 5000): void {
    if (this.pollingInterval) {
      return; // Already running
    }

    this.pollingInterval = setInterval(async () => {
      await this.pollLongRunningTasks();
    }, intervalMs);

    console.log('✓ Polling service started');
  }

  /**
   * Stop polling service
   */
  stopPollingService(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('✓ Polling service stopped');
    }
  }

  /**
   * Poll long-running tasks
   */
  private async pollLongRunningTasks(): Promise<void> {
    try {
      const tasks = await this.crudService.getTasksReadyForPolling(10);

      for (const task of tasks) {
        await this.pollTask(task);
      }
    } catch (error: any) {
      console.error('Error polling tasks:', error.message);
    }
  }

  /**
   * Poll a single task
   */
  private async pollTask(task: LongRunningTask): Promise<void> {
    try {
      if (!task.status_url) {
        // If no status URL, check via n8n API
        const execution = await this.checkN8nExecution(task.external_id!);
        
        await this.crudService.updateLongRunningTask(task.task_id, {
          status: execution.status === 'success' ? 'completed' : execution.status === 'error' ? 'failed' : 'processing',
          result_data: execution.data,
          error: execution.error
        });

        await this.crudService.recordPollingAttempt(
          task.task_id,
          execution.status,
          execution.data,
          200
        );
      } else {
        // Poll status URL
        const response = await axios.get(task.status_url);
        
        await this.crudService.updateLongRunningTask(task.task_id, {
          status: response.data.status,
          result_data: response.data.result,
          error: response.data.error
        });

        await this.crudService.recordPollingAttempt(
          task.task_id,
          response.data.status,
          response.data,
          response.status
        );
      }

      this.emit('task:polled', { taskId: task.task_id, status: task.status });
    } catch (error: any) {
      console.error(`Error polling task ${task.task_id}:`, error.message);
      
      await this.crudService.recordPollingAttempt(
        task.task_id,
        'error',
        {},
        error.response?.status,
        error.message
      );
    }
  }

  /**
   * Check n8n workflow execution status
   */
  private async checkN8nExecution(executionId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.n8nConfig.apiUrl}/executions/${executionId}`,
        {
          headers: this.n8nConfig.apiKey ? {
            'X-N8N-API-KEY': this.n8nConfig.apiKey
          } : {}
        }
      );

      return {
        status: response.data.finished ? (response.data.success ? 'success' : 'error') : 'running',
        data: response.data.data,
        error: response.data.error
      };
    } catch (error: any) {
      return {
        status: 'error',
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Evaluate conditional logic
   */
  private evaluateCondition(condition: Record<string, any>, context: OrchestrationContext): boolean {
    // Simple condition evaluation - can be extended
    const { variable, operator, value } = condition;
    
    const contextValue = context.variables[variable];

    switch (operator) {
      case '==':
        return contextValue == value;
      case '!=':
        return contextValue != value;
      case '>':
        return contextValue > value;
      case '<':
        return contextValue < value;
      case '>=':
        return contextValue >= value;
      case '<=':
        return contextValue <= value;
      default:
        return true;
    }
  }

  /**
   * Interpolate template with variables
   */
  private interpolateTemplate(template: string, variables: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(runId: string): Promise<any> {
    const run = await this.crudService.getWorkflowRun(runId);
    
    return {
      runId: run?.run_id,
      status: run?.status,
      progress: run?.progress_percentage,
      startedAt: run?.started_at,
      completedAt: run?.completed_at,
      error: run?.error
    };
  }
}
