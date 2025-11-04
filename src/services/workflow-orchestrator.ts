/**
 * Workflow Orchestrator
 * Multi-step workflow execution engine with live data streams and monitoring
 */

import { EventEmitter } from 'events';
import { DeepSeekSystemConfig } from '../config/deepseek-config.js';
import { DeepSeekPromptEngine } from './deepseek-prompt-engine.js';
import { SchemaGeneratorService, GeneratedSchema } from './schema-generator.js';

export interface WorkflowTask {
  id: string;
  name: string;
  service: string;
  action: string;
  input: Record<string, any>;
  output?: {
    schema?: string;
    destination?: string | string[];
  };
  dependencies: string[];
  parallel?: boolean;
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
  condition?: string; // JavaScript expression
}

export interface WorkflowService {
  id: string;
  type: string;
  config: Record<string, any>;
  schema?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  metadata?: Record<string, any>;
  services: WorkflowService[];
  tasks: WorkflowTask[];
  schedule?: {
    type: 'cron' | 'interval' | 'manual';
    expression?: string;
    intervalMs?: number;
    enabled: boolean;
  };
  errorHandling?: {
    strategy: 'retry-then-skip' | 'retry-then-fail' | 'fail-fast';
    notifications?: string[];
  };
  monitoring?: {
    enabled: boolean;
    metrics: string[];
    alerts?: Array<{
      condition: string;
      action: string;
    }>;
  };
  state?: {
    persistenceType: 'memory' | 'database' | 'redis';
    checkpointFrequency: 'per-task' | 'per-service' | 'end';
    resumable: boolean;
  };
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  startedAt: Date;
  completedAt?: Date;
  currentTask?: string;
  taskResults: Map<string, any>;
  errors: Array<{
    taskId: string;
    error: string;
    timestamp: Date;
  }>;
  metrics: {
    tasksCompleted: number;
    tasksFailed: number;
    totalDuration?: number;
  };
}

export interface WorkflowMonitoringData {
  workflowId: string;
  executionId: string;
  timestamp: Date;
  metrics: Record<string, any>;
  status: string;
  currentStep: string;
}

/**
 * Workflow Orchestrator Service
 */
export class WorkflowOrchestrator extends EventEmitter {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private services: Map<string, any> = new Map();
  private config: DeepSeekSystemConfig;
  private promptEngine: DeepSeekPromptEngine;
  private schemaGenerator: SchemaGeneratorService;
  private dataStreams: Map<string, any> = new Map();

  constructor(config: DeepSeekSystemConfig) {
    super();
    this.config = config;
    this.promptEngine = new DeepSeekPromptEngine(config);
    this.schemaGenerator = new SchemaGeneratorService();
  }

  /**
   * Register a workflow definition
   */
  registerWorkflow(workflow: WorkflowDefinition): void {
    // Validate workflow
    this.validateWorkflow(workflow);
    
    this.workflows.set(workflow.id, workflow);
    this.emit('workflow:registered', { workflowId: workflow.id });
  }

  /**
   * Generate workflow from natural language using DeepSeek
   */
  async generateWorkflow(description: string, context?: Record<string, any>): Promise<WorkflowDefinition> {
    const prompt = this.promptEngine.generatePrompt('workflow-generation', {
      userRequest: description,
      domainContext: JSON.stringify(context || {}),
    });

    // In production, this would call DeepSeek API
    // For now, return a template
    const workflow: WorkflowDefinition = {
      id: `workflow-${Date.now()}`,
      name: description.substring(0, 50),
      version: '1.0.0',
      description,
      services: [],
      tasks: [],
      schedule: {
        type: 'manual',
        enabled: false,
      },
      errorHandling: {
        strategy: 'retry-then-skip',
      },
      monitoring: {
        enabled: true,
        metrics: ['duration', 'success_rate', 'error_count'],
      },
      state: {
        persistenceType: 'database',
        checkpointFrequency: 'per-task',
        resumable: true,
      },
    };

    return workflow;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    input?: Record<string, any>
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Create execution record
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      workflowId,
      status: 'running',
      startedAt: new Date(),
      taskResults: new Map(),
      errors: [],
      metrics: {
        tasksCompleted: 0,
        tasksFailed: 0,
      },
    };

    this.executions.set(execution.id, execution);
    this.emit('execution:started', { executionId: execution.id, workflowId });

    try {
      // Execute tasks in order
      await this.executeTasks(workflow, execution, input);

      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.metrics.totalDuration = 
        execution.completedAt.getTime() - execution.startedAt.getTime();

      this.emit('execution:completed', { executionId: execution.id });
    } catch (error) {
      execution.status = 'failed';
      execution.errors.push({
        taskId: execution.currentTask || 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });

      this.emit('execution:failed', { executionId: execution.id, error });
    }

    return execution;
  }

  /**
   * Execute workflow tasks
   */
  private async executeTasks(
    workflow: WorkflowDefinition,
    execution: WorkflowExecution,
    input?: Record<string, any>
  ): Promise<void> {
    const taskQueue = this.buildTaskQueue(workflow.tasks);

    for (const taskBatch of taskQueue) {
      // Execute tasks in parallel if marked as parallel
      const promises = taskBatch.map((task) =>
        this.executeTask(workflow, task, execution, input)
      );

      await Promise.all(promises);
    }
  }

  /**
   * Build task execution queue respecting dependencies
   */
  private buildTaskQueue(tasks: WorkflowTask[]): WorkflowTask[][] {
    const queue: WorkflowTask[][] = [];
    const completed = new Set<string>();
    const remaining = [...tasks];

    while (remaining.length > 0) {
      const batch = remaining.filter((task) =>
        task.dependencies.every((dep) => completed.has(dep))
      );

      if (batch.length === 0) {
        throw new Error('Circular dependency detected in workflow tasks');
      }

      queue.push(batch);
      batch.forEach((task) => {
        completed.add(task.id);
        const index = remaining.indexOf(task);
        remaining.splice(index, 1);
      });
    }

    return queue;
  }

  /**
   * Execute a single task
   */
  private async executeTask(
    workflow: WorkflowDefinition,
    task: WorkflowTask,
    execution: WorkflowExecution,
    workflowInput?: Record<string, any>
  ): Promise<void> {
    execution.currentTask = task.id;
    
    this.emit('task:started', {
      executionId: execution.id,
      taskId: task.id,
      taskName: task.name,
    });

    try {
      // Resolve input variables
      const resolvedInput = this.resolveTaskInput(task, execution, workflowInput);

      // Check condition if specified
      if (task.condition && !this.evaluateCondition(task.condition, resolvedInput)) {
        this.emit('task:skipped', { executionId: execution.id, taskId: task.id });
        return;
      }

      // Execute task with timeout
      const result = await this.executeTaskWithTimeout(
        task,
        resolvedInput,
        task.timeout || 60000
      );

      // Store result
      execution.taskResults.set(task.id, result);
      execution.metrics.tasksCompleted++;

      this.emit('task:completed', {
        executionId: execution.id,
        taskId: task.id,
        result,
      });

      // Emit monitoring data
      this.emitMonitoringData(workflow.id, execution.id, task.id);
    } catch (error) {
      execution.metrics.tasksFailed++;
      
      // Handle retry
      if (task.retryPolicy) {
        await this.retryTask(task, execution, workflowInput);
      } else {
        throw error;
      }
    }
  }

  /**
   * Execute task with timeout
   */
  private async executeTaskWithTimeout(
    task: WorkflowTask,
    input: Record<string, any>,
    timeout: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Task ${task.id} timed out after ${timeout}ms`));
      }, timeout);

      this.executeTaskAction(task, input)
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Execute the actual task action
   */
  private async executeTaskAction(
    task: WorkflowTask,
    input: Record<string, any>
  ): Promise<any> {
    // Get service
    const service = this.services.get(task.service);
    if (!service) {
      throw new Error(`Service not found: ${task.service}`);
    }

    // Execute action
    if (typeof service[task.action] !== 'function') {
      throw new Error(`Action not found: ${task.service}.${task.action}`);
    }

    return await service[task.action](input);
  }

  /**
   * Resolve task input variables
   */
  private resolveTaskInput(
    task: WorkflowTask,
    execution: WorkflowExecution,
    workflowInput?: Record<string, any>
  ): Record<string, any> {
    const input = { ...task.input };

    // Replace variable references
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        input[key] = this.resolveVariable(value, execution, workflowInput);
      }
    }

    return input;
  }

  /**
   * Resolve variable references like ${task:taskId.output}
   */
  private resolveVariable(
    value: string,
    execution: WorkflowExecution,
    workflowInput?: Record<string, any>
  ): any {
    const match = value.match(/\$\{([^}]+)\}/);
    if (!match) return value;

    const path = match[1];
    
    // Handle task output references
    if (path.startsWith('task:')) {
      const [, taskId, ...rest] = path.split(/[:.]/);
      const taskResult = execution.taskResults.get(taskId);
      return this.getNestedValue(taskResult, rest);
    }

    // Handle input references
    if (path.startsWith('input.')) {
      const key = path.substring(6);
      return workflowInput?.[key];
    }

    return value;
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string[]): any {
    return path.reduce((current, key) => current?.[key], obj);
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: string, context: Record<string, any>): boolean {
    try {
      // Simple evaluation (in production, use a safe expression evaluator)
      const func = new Function(...Object.keys(context), `return ${condition}`);
      return func(...Object.values(context));
    } catch (error) {
      console.error('Failed to evaluate condition:', error);
      return false;
    }
  }

  /**
   * Retry task
   */
  private async retryTask(
    task: WorkflowTask,
    execution: WorkflowExecution,
    workflowInput?: Record<string, any>
  ): Promise<void> {
    if (!task.retryPolicy) return;

    for (let i = 0; i < task.retryPolicy.maxRetries; i++) {
      await new Promise((resolve) => setTimeout(resolve, task.retryPolicy!.backoffMs));
      
      try {
        await this.executeTask(
          this.workflows.get(execution.workflowId)!,
          task,
          execution,
          workflowInput
        );
        return; // Success
      } catch (error) {
        if (i === task.retryPolicy.maxRetries - 1) {
          throw error; // Final retry failed
        }
      }
    }
  }

  /**
   * Emit monitoring data
   */
  private emitMonitoringData(
    workflowId: string,
    executionId: string,
    taskId: string
  ): void {
    const execution = this.executions.get(executionId);
    if (!execution) return;

    const monitoringData: WorkflowMonitoringData = {
      workflowId,
      executionId,
      timestamp: new Date(),
      metrics: {
        tasksCompleted: execution.metrics.tasksCompleted,
        tasksFailed: execution.metrics.tasksFailed,
      },
      status: execution.status,
      currentStep: taskId,
    };

    this.emit('monitoring:data', monitoringData);
  }

  /**
   * Validate workflow definition
   */
  private validateWorkflow(workflow: WorkflowDefinition): void {
    if (!workflow.id || !workflow.name) {
      throw new Error('Workflow must have id and name');
    }

    if (!workflow.tasks || workflow.tasks.length === 0) {
      throw new Error('Workflow must have at least one task');
    }

    // Validate task dependencies
    const taskIds = new Set(workflow.tasks.map((t) => t.id));
    for (const task of workflow.tasks) {
      for (const dep of task.dependencies) {
        if (!taskIds.has(dep)) {
          throw new Error(`Task ${task.id} depends on non-existent task: ${dep}`);
        }
      }
    }
  }

  /**
   * Register a service
   */
  registerService(serviceId: string, service: any): void {
    this.services.set(serviceId, service);
  }

  /**
   * Create live data stream
   */
  createDataStream(streamId: string, config: Record<string, any>): void {
    this.dataStreams.set(streamId, {
      id: streamId,
      config,
      active: true,
      subscribers: new Set(),
    });
  }

  /**
   * Subscribe to data stream
   */
  subscribeToStream(streamId: string, callback: (data: any) => void): void {
    const stream = this.dataStreams.get(streamId);
    if (stream) {
      stream.subscribers.add(callback);
    }
  }

  /**
   * Publish to data stream
   */
  publishToStream(streamId: string, data: any): void {
    const stream = this.dataStreams.get(streamId);
    if (stream && stream.active) {
      for (const callback of stream.subscribers) {
        callback(data);
      }
    }
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * List all workflows
   */
  listWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  /**
   * List all executions
   */
  listExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }
}

export default WorkflowOrchestrator;
