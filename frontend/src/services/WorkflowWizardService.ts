/**
 * Workflow Wizard Service
 * Schema-driven workflow execution engine
 * 
 * Features:
 * - Load workflows from JSON schemas
 * - Execute tasks with dependency resolution
 * - Support for parallel and sequential execution
 * - Built-in error handling and retries
 * - Monitoring and logging
 * - Type-safe workflow definitions
 */

import { EventEmitter } from 'events';
import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

export interface WorkflowSchema {
  '@context': string;
  '@type': 'Workflow';
  '@id': string;
  name: string;
  description: string;
  version: string;
  category: string;
  priority: number;
  trigger: WorkflowTrigger;
  input?: InputSchema;
  tasks: TaskReference[];
  errorHandling: ErrorHandlingConfig;
  monitoring: MonitoringConfig;
  permissions: PermissionsConfig;
  metadata: WorkflowMetadata;
}

export interface TaskSchema {
  '@context': string;
  '@type': string;
  '@id': string;
  name: string;
  description: string;
  version: string;
  category: string;
  input: TaskInput;
  execution: TaskExecution;
  output: TaskOutput;
  conditions?: TaskConditions;
  dependencies?: TaskDependencies;
  monitoring?: TaskMonitoring;
}

export interface WorkflowTrigger {
  type: 'webhook' | 'schedule' | 'manual' | 'event';
  config: Record<string, any>;
}

export interface InputSchema {
  schema: Record<string, any>;
}

export interface TaskReference {
  $ref?: string;
  '@type'?: string;
  name?: string;
  execution?: TaskExecution;
  dependsOn?: string[];
  parallel?: boolean;
  forEach?: string;
  as?: string;
  maxConcurrency?: number;
  conditions?: TaskConditions;
  config?: Record<string, any>;
}

export interface TaskInput {
  schema: Record<string, any>;
  source: string;
  transform?: string | null;
}

export interface TaskExecution {
  type: 'function' | 'api' | 'database' | 'ai';
  handler?: string;
  timeout?: number;
  retryPolicy?: RetryPolicy;
  config?: Record<string, any>;
  method?: string;
  url?: string;
  headers?: Record<string, any>;
  body?: any;
  operation?: string;
  table?: string;
  data?: Record<string, any>;
  where?: Record<string, any>;
  returning?: string;
  model?: string;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface RetryPolicy {
  enabled: boolean;
  maxAttempts: number;
  backoff: 'linear' | 'exponential';
  initialDelay: number;
}

export interface TaskOutput {
  schema: Record<string, any>;
  destination: string;
  persist: boolean;
  persistLocation?: string;
}

export interface TaskConditions {
  executeIf?: string;
  skipIf?: string;
  failIf?: string;
}

export interface TaskDependencies {
  tasks: string[];
  services: string[];
  external: string[];
}

export interface TaskMonitoring {
  logExecution: boolean;
  captureInput: boolean;
  captureOutput: boolean;
  metrics: {
    duration: boolean;
    errorRate: boolean;
    customMetrics: string[];
  };
}

export interface ErrorHandlingConfig {
  strategy: 'rollback' | 'continue' | 'retry';
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
  fallbackWorkflow?: string | null;
  rollbackTasks?: RollbackTask[];
}

export interface RollbackTask {
  if: string;
  action: string;
  handler?: string;
  params?: Record<string, any>;
}

export interface MonitoringConfig {
  enabled: boolean;
  logLevel: 'info' | 'debug' | 'error';
  metrics: string[];
  alerts: {
    onFailure?: AlertConfig;
    onSuccess?: boolean;
    onSlowExecution?: AlertConfig;
  };
}

export interface AlertConfig {
  enabled: boolean;
  channels: string[];
  threshold?: number;
  thresholdMs?: number;
}

export interface PermissionsConfig {
  execute: string[];
  view: string[];
  edit: string[];
}

export interface WorkflowMetadata {
  author: string;
  createdAt: string;
  updatedAt?: string;
  tags: string[];
  documentation?: string;
  examples?: WorkflowExample[];
}

export interface WorkflowExample {
  name: string;
  input: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflow: WorkflowSchema;
  input: any;
  startedAt: Date;
  completedAt?: Date;
  status: 'running' | 'completed' | 'failed';
  context: Record<string, any>;
  results: TaskResult[];
  errors: ExecutionError[];
}

export interface TaskResult {
  taskId: string;
  taskName: string;
  status: 'completed' | 'failed' | 'skipped';
  output?: any;
  error?: string;
  duration?: number;
  reason?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ExecutionError {
  message: string;
  stack?: string;
  timestamp: Date;
  taskId?: string;
}

export interface WorkflowResult {
  success: boolean;
  executionId: string;
  results?: TaskResult[];
  error?: string;
  duration: number;
  context?: Record<string, any>;
}

export interface ExecutionOptions {
  skipTriggerValidation?: boolean;
  dryRun?: boolean;
  context?: Record<string, any>;
  user?: { id: string; roles: string[] };
}

export interface WizardConfig {
  taskHandlers?: Record<string, TaskHandler>;
  database?: DatabaseService;
  aiService?: AIService;
  logger?: Logger;
}

export type TaskHandler = (input: any, context: any, config: any) => Promise<any>;

export interface DatabaseService {
  query(sql: string, params: any[]): Promise<any>;
  insert(table: string, data: Record<string, any>, returning?: string): Promise<any>;
  update(table: string, data: Record<string, any>, where: Record<string, any>, returning?: string): Promise<any>;
  delete(table: string, where: Record<string, any>): Promise<any>;
  select(table: string, where?: Record<string, any>): Promise<any>;
}

export interface AIService {
  generate(options: {
    model: string;
    prompt: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{ text: string }>;
}

export interface Logger {
  info(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
}

// ============================================================================
// Workflow Wizard Service
// ============================================================================

export class WorkflowWizardService extends EventEmitter {
  private workflows: Map<string, WorkflowSchema> = new Map();
  private tasks: Map<string, TaskSchema> = new Map();
  private executingWorkflows: Map<string, WorkflowExecution> = new Map();
  private logger: Logger;

  constructor(private config: WizardConfig = {}) {
    super();
    this.logger = config.logger || this.createDefaultLogger();
    this.loadBuiltInTasks();
  }

  /**
   * Register a workflow schema
   */
  registerWorkflow(schema: WorkflowSchema): void {
    this.logger.info(`Registering workflow: ${schema.name}`, { id: schema['@id'] });
    this.workflows.set(schema['@id'], schema);
    this.emit('workflow-registered', schema);
  }

  /**
   * Register a task schema
   */
  registerTask(schema: TaskSchema): void {
    this.logger.info(`Registering task: ${schema.name}`, { id: schema['@id'] });
    this.tasks.set(schema['@id'], schema);
    this.emit('task-registered', schema);
  }

  /**
   * Get all registered workflows
   */
  getWorkflows(): WorkflowSchema[] {
    return Array.from(this.workflows.values());
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): WorkflowSchema | undefined {
    return this.workflows.get(workflowId);
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflowId: string,
    input: any,
    options: ExecutionOptions = {}
  ): Promise<WorkflowResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    // Check permissions
    if (options.user && !this.checkPermission(workflow, 'execute', options.user.roles)) {
      throw new Error('Permission denied: User cannot execute this workflow');
    }

    // Create execution instance
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      workflow,
      input,
      startedAt: new Date(),
      status: 'running',
      context: options.context || {},
      results: [],
      errors: []
    };

    this.executingWorkflows.set(execution.id, execution);
    this.emit('workflow-started', execution);
    this.logger.info(`Workflow started: ${workflow.name}`, {
      executionId: execution.id,
      workflowId
    });

    try {
      // Validate input schema
      if (workflow.input?.schema) {
        this.validateInput(input, workflow.input.schema);
      }

      // Execute tasks
      const taskResults = await this.executeTasks(
        workflow.tasks,
        input,
        execution.context,
        execution.id
      );

      execution.results = taskResults;
      execution.status = 'completed';
      execution.completedAt = new Date();

      const duration = execution.completedAt.getTime() - execution.startedAt.getTime();

      this.emit('workflow-completed', execution);
      this.logger.info(`Workflow completed: ${workflow.name}`, {
        executionId: execution.id,
        duration
      });

      return {
        success: true,
        executionId: execution.id,
        results: taskResults,
        context: execution.context,
        duration
      };

    } catch (error: any) {
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      });

      const duration = execution.completedAt.getTime() - execution.startedAt.getTime();

      this.emit('workflow-failed', execution, error);
      this.logger.error(`Workflow failed: ${workflow.name}`, {
        executionId: execution.id,
        error: error.message,
        duration
      });

      // Handle error based on workflow's error handling strategy
      if (workflow.errorHandling.strategy === 'rollback') {
        await this.rollbackWorkflow(execution);
      }

      return {
        success: false,
        executionId: execution.id,
        error: error.message,
        duration
      };

    } finally {
      this.executingWorkflows.delete(execution.id);
    }
  }

  /**
   * Execute tasks with dependency resolution
   */
  private async executeTasks(
    taskRefs: TaskReference[],
    input: any,
    context: Record<string, any>,
    executionId: string
  ): Promise<TaskResult[]> {
    const results: TaskResult[] = [];

    for (const taskRef of taskRefs) {
      // Handle forEach loops
      if (taskRef.forEach) {
        const items = this.getValueByPath({ input, context }, taskRef.forEach);
        if (Array.isArray(items)) {
          const loopResults = await this.executeForEachTask(
            taskRef,
            items,
            input,
            context,
            executionId
          );
          results.push(...loopResults);
        }
        continue;
      }

      // Check conditions
      if (taskRef.conditions && !this.evaluateConditions(taskRef.conditions, input, context)) {
        results.push({
          taskId: taskRef.$ref || taskRef.name || 'unknown',
          taskName: taskRef.name || 'Unknown',
          status: 'skipped',
          reason: 'Conditions not met'
        });
        continue;
      }

      // Execute task
      try {
        const result = await this.executeTask(taskRef, input, context, executionId);
        results.push(result);

        // Update context with output
        if (result.output !== undefined) {
          // Store result in context for next tasks
          const taskId = taskRef.$ref || taskRef.name || 'unknown';
          context[taskId] = result.output;
        }

      } catch (error: any) {
        this.logger.error(`Task failed: ${taskRef.name}`, {
          executionId,
          error: error.message
        });
        
        results.push({
          taskId: taskRef.$ref || taskRef.name || 'unknown',
          taskName: taskRef.name || 'Unknown',
          status: 'failed',
          error: error.message
        });

        // Throw error to stop workflow execution
        throw error;
      }
    }

    return results;
  }

  /**
   * Execute forEach task
   */
  private async executeForEachTask(
    taskRef: TaskReference,
    items: any[],
    input: any,
    context: Record<string, any>,
    executionId: string
  ): Promise<TaskResult[]> {
    const results: TaskResult[] = [];
    const itemVar = taskRef.as || 'item';
    const maxConcurrency = taskRef.maxConcurrency || (taskRef.parallel ? 5 : 1);

    // Process items in batches if parallel
    if (taskRef.parallel) {
      for (let i = 0; i < items.length; i += maxConcurrency) {
        const batch = items.slice(i, i + maxConcurrency);
        const batchResults = await Promise.all(
          batch.map(async (item) => {
            const itemContext = { ...context, [itemVar]: item };
            return this.executeTask(taskRef, input, itemContext, executionId);
          })
        );
        results.push(...batchResults);
      }
    } else {
      // Sequential processing
      for (const item of items) {
        const itemContext = { ...context, [itemVar]: item };
        const result = await this.executeTask(taskRef, input, itemContext, executionId);
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Execute a single task
   */
  private async executeTask(
    taskRef: TaskReference,
    input: any,
    context: Record<string, any>,
    executionId: string
  ): Promise<TaskResult> {
    const startTime = Date.now();
    const taskName = taskRef.name || taskRef.$ref || 'Unknown Task';
    const taskId = taskRef.$ref || taskRef.name || `task-${Date.now()}`;

    this.logger.debug(`Task started: ${taskName}`, { executionId, taskId });
    this.emit('task-started', { taskId, taskName, executionId });

    try {
      let output: any;

      // Execute based on task type (inline or referenced)
      if (taskRef.execution) {
        // Inline task execution
        output = await this.executeTaskExecution(
          taskRef.execution,
          input,
          context,
          taskRef.config
        );
      } else if (taskRef.$ref) {
        // Referenced task
        const taskSchema = this.tasks.get(taskRef.$ref);
        if (!taskSchema) {
          throw new Error(`Task schema not found: ${taskRef.$ref}`);
        }
        output = await this.executeTaskExecution(
          taskSchema.execution,
          input,
          context,
          taskRef.config
        );
      } else {
        throw new Error('Task must have either execution or $ref');
      }

      const duration = Date.now() - startTime;

      this.logger.debug(`Task completed: ${taskName}`, {
        executionId,
        taskId,
        duration
      });
      this.emit('task-completed', { taskId, taskName, output, duration, executionId });

      return {
        taskId,
        taskName,
        status: 'completed',
        output,
        duration,
        startedAt: new Date(startTime),
        completedAt: new Date()
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;

      this.logger.error(`Task failed: ${taskName}`, {
        executionId,
        taskId,
        error: error.message,
        duration
      });
      this.emit('task-failed', { taskId, taskName, error, duration, executionId });

      return {
        taskId,
        taskName,
        status: 'failed',
        error: error.message,
        duration,
        startedAt: new Date(startTime),
        completedAt: new Date()
      };
    }
  }

  /**
   * Execute task based on execution type
   */
  private async executeTaskExecution(
    execution: TaskExecution,
    input: any,
    context: Record<string, any>,
    config?: Record<string, any>
  ): Promise<any> {
    const timeout = execution.timeout || 30000;
    const mergedConfig = { ...execution.config, ...config };

    switch (execution.type) {
      case 'function':
        return await this.executeFunctionTask(execution, input, context, mergedConfig, timeout);
      case 'api':
        return await this.executeAPITask(execution, input, context, timeout);
      case 'database':
        return await this.executeDatabaseTask(execution, input, context);
      case 'ai':
        return await this.executeAITask(execution, input, context, timeout);
      default:
        throw new Error(`Unknown task type: ${execution.type}`);
    }
  }

  /**
   * Execute function-type task
   */
  private async executeFunctionTask(
    execution: TaskExecution,
    input: any,
    context: Record<string, any>,
    config: any,
    timeout: number
  ): Promise<any> {
    if (!execution.handler) {
      throw new Error('Function task requires a handler');
    }

    const handler = this.config.taskHandlers?.[execution.handler];
    if (!handler) {
      throw new Error(`Handler not found: ${execution.handler}`);
    }

    return await Promise.race([
      handler(input, context, config),
      this.createTimeout(timeout, `Task timeout after ${timeout}ms`)
    ]);
  }

  /**
   * Execute API-type task
   */
  private async executeAPITask(
    execution: TaskExecution,
    input: any,
    context: Record<string, any>,
    timeout: number
  ): Promise<any> {
    const { method = 'GET', url, headers = {}, body } = execution;

    if (!url) {
      throw new Error('API task requires a URL');
    }

    // Interpolate variables
    const interpolatedUrl = this.interpolate(url, { input, context, env: process.env });
    const interpolatedHeaders = this.interpolateObject(headers, { input, context, env: process.env });
    const interpolatedBody = body ? this.interpolateObject(body, { input, context, env: process.env }) : undefined;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(interpolatedUrl, {
        method,
        headers: interpolatedHeaders as HeadersInit,
        body: interpolatedBody ? JSON.stringify(interpolatedBody) : undefined,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Execute database-type task
   */
  private async executeDatabaseTask(
    execution: TaskExecution,
    input: any,
    context: Record<string, any>
  ): Promise<any> {
    if (!this.config.database) {
      throw new Error('Database service not configured');
    }

    const { operation, table, data, where, returning } = execution;

    if (!operation || !table) {
      throw new Error('Database task requires operation and table');
    }

    // Interpolate data
    const interpolatedData = data ? this.interpolateObject(data, { input, context }) : {};
    const interpolatedWhere = where ? this.interpolateObject(where, { input, context }) : null;

    switch (operation) {
      case 'insert':
        return await this.config.database.insert(table, interpolatedData, returning);
      case 'update':
        return await this.config.database.update(table, interpolatedData, interpolatedWhere!, returning);
      case 'delete':
        return await this.config.database.delete(table, interpolatedWhere!);
      case 'select':
        return await this.config.database.select(table, interpolatedWhere || undefined);
      default:
        throw new Error(`Unknown database operation: ${operation}`);
    }
  }

  /**
   * Execute AI-type task
   */
  private async executeAITask(
    execution: TaskExecution,
    input: any,
    context: Record<string, any>,
    timeout: number
  ): Promise<any> {
    if (!this.config.aiService) {
      throw new Error('AI service not configured');
    }

    const { model = 'gpt-4', prompt, temperature, maxTokens } = execution;

    if (!prompt) {
      throw new Error('AI task requires a prompt');
    }

    // Interpolate prompt
    const interpolatedPrompt = this.interpolate(prompt, { input, context });

    return await Promise.race([
      this.config.aiService.generate({
        model,
        prompt: interpolatedPrompt,
        temperature,
        maxTokens
      }),
      this.createTimeout(timeout, `AI task timeout after ${timeout}ms`)
    ]);
  }

  /**
   * Helper: Create timeout promise
   */
  private createTimeout(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    );
  }

  /**
   * Helper: String interpolation with ${} syntax
   */
  private interpolate(template: string, data: Record<string, any>): string {
    return template.replace(/\$\{([^}]+)\}/g, (match, path) => {
      const value = this.getValueByPath(data, path);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Helper: Object interpolation
   */
  private interpolateObject(obj: any, data: Record<string, any>): any {
    if (typeof obj === 'string') {
      return this.interpolate(obj, data);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.interpolateObject(item, data));
    }
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.interpolateObject(value, data);
      }
      return result;
    }
    return obj;
  }

  /**
   * Get value from object by dot-notation path
   */
  private getValueByPath(obj: any, path: string): any {
    // Handle special functions like Date.now()
    if (path === 'Date.now()') {
      return Date.now();
    }
    if (path.startsWith('crypto.hash(')) {
      // Simplified crypto hash (in real implementation, use actual crypto)
      const innerPath = path.match(/crypto\.hash\(([^)]+)\)/)?.[1];
      if (innerPath) {
        const value = this.getValueByPath(obj, innerPath);
        return `hashed_${value}`; // Placeholder
      }
    }

    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Evaluate conditions
   */
  private evaluateConditions(
    conditions: TaskConditions,
    input: any,
    context: Record<string, any>
  ): boolean {
    const data = { input, context };

    if (conditions.executeIf) {
      return this.evaluateExpression(conditions.executeIf, data);
    }
    if (conditions.skipIf) {
      return !this.evaluateExpression(conditions.skipIf, data);
    }
    return true;
  }

  /**
   * Evaluate expression (simplified - in production use a safe expression evaluator)
   */
  private evaluateExpression(expression: string, data: Record<string, any>): boolean {
    try {
      // Very simplified evaluation - in production, use a safe expression evaluator
      const interpolated = this.interpolate(expression, data);
      
      // Simple comparisons
      if (interpolated.includes('===')) {
        const [left, right] = interpolated.split('===').map(s => s.trim());
        return left === right;
      }
      if (interpolated.includes('!==')) {
        const [left, right] = interpolated.split('!==').map(s => s.trim());
        return left !== right;
      }
      if (interpolated.includes('>=')) {
        const [left, right] = interpolated.split('>=').map(s => s.trim());
        return Number(left) >= Number(right);
      }
      
      // Boolean values
      if (interpolated === 'true') return true;
      if (interpolated === 'false') return false;

      return !!interpolated;
    } catch (error) {
      this.logger.warn(`Failed to evaluate expression: ${expression}`, { error });
      return false;
    }
  }

  /**
   * Validate input against schema
   */
  private validateInput(input: any, schema: Record<string, any>): void {
    // Simplified validation - in production, use JSON Schema validator or Zod
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in input)) {
          throw new Error(`Required field missing: ${field}`);
        }
      }
    }
  }

  /**
   * Check permissions
   */
  private checkPermission(workflow: WorkflowSchema, action: string, userRoles: string[]): boolean {
    const allowedRoles = workflow.permissions[action as keyof PermissionsConfig] as string[];
    if (allowedRoles.includes('*')) return true;
    return userRoles.some(role => allowedRoles.includes(role));
  }

  /**
   * Rollback workflow
   */
  private async rollbackWorkflow(execution: WorkflowExecution): Promise<void> {
    this.logger.info(`Rolling back workflow: ${execution.workflow.name}`, {
      executionId: execution.id
    });

    const rollbackTasks = execution.workflow.errorHandling.rollbackTasks || [];

    for (const rollbackTask of rollbackTasks) {
      try {
        // Execute rollback action
        if (rollbackTask.handler && this.config.taskHandlers?.[rollbackTask.handler]) {
          await this.config.taskHandlers[rollbackTask.handler](
            execution.input,
            execution.context,
            rollbackTask.params
          );
        }
      } catch (error: any) {
        this.logger.error(`Rollback task failed: ${rollbackTask.action}`, {
          executionId: execution.id,
          error: error.message
        });
      }
    }
  }

  /**
   * Load built-in task handlers
   */
  private loadBuiltInTasks(): void {
    // This would load default task handlers
    this.logger.debug('Loading built-in tasks');
  }

  /**
   * Create default logger
   */
  private createDefaultLogger(): Logger {
    return {
      info: (message: string, meta?: any) => console.log(`[INFO] ${message}`, meta || ''),
      debug: (message: string, meta?: any) => console.log(`[DEBUG] ${message}`, meta || ''),
      error: (message: string, meta?: any) => console.error(`[ERROR] ${message}`, meta || ''),
      warn: (message: string, meta?: any) => console.warn(`[WARN] ${message}`, meta || '')
    };
  }

  /**
   * Get execution status
   */
  getExecutionStatus(executionId: string): WorkflowExecution | undefined {
    return this.executingWorkflows.get(executionId);
  }

  /**
   * Get all executing workflows
   */
  getExecutingWorkflows(): WorkflowExecution[] {
    return Array.from(this.executingWorkflows.values());
  }
}

export default WorkflowWizardService;
