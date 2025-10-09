import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { HeadlessChromeService } from './HeadlessChromeService';
import { Logger } from '../../utils/Logger';

export interface Task {
  id: string;
  type: 'dom_analysis' | 'optimization' | 'crawl' | 'custom_js' | 'n8n_workflow';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  parameters: any;
  result?: any;
  error?: string;
  progress?: number;
  metadata?: any;
}

export interface JavaScriptTask extends Task {
  type: 'custom_js';
  parameters: {
    script: string;
    args?: any[];
    pageId?: string;
    url?: string;
    timeout?: number;
  };
}

export interface N8nWorkflowTask extends Task {
  type: 'n8n_workflow';
  parameters: {
    workflowId: string;
    inputData?: any;
    webhookUrl?: string;
    timeout?: number;
  };
}

export interface DOMAnalysisTask extends Task {
  type: 'dom_analysis';
  parameters: {
    url: string;
    pageId?: string;
    analysisType: 'full' | 'performance' | 'structure' | 'resources';
    options?: any;
  };
}

export class TaskManager extends EventEmitter {
  private tasks: Map<string, Task> = new Map();
  private taskQueue: Task[] = [];
  private runningTasks: Set<string> = new Set();
  private maxConcurrentTasks = 5;
  private headlessChromeService: HeadlessChromeService;
  private logger: Logger;
  private isProcessing = false;

  constructor(headlessChromeService: HeadlessChromeService) {
    super();
    this.headlessChromeService = headlessChromeService;
    this.logger = new Logger('TaskManager');
    this.startTaskProcessor();
  }

  /**
   * Create a new task
   */
  createTask(taskData: Omit<Task, 'id' | 'status' | 'createdAt'>): string {
    const task: Task = {
      id: uuidv4(),
      status: 'pending',
      createdAt: new Date(),
      ...taskData
    };

    this.tasks.set(task.id, task);
    this.taskQueue.push(task);
    
    // Sort by priority (higher number = higher priority)
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    this.logger.info(`Task created: ${task.id} (${task.type})`);
    this.emit('taskCreated', task);
    
    return task.id;
  }

  /**
   * Create a JavaScript execution task
   */
  createJavaScriptTask(script: string, options: {
    args?: any[];
    pageId?: string;
    url?: string;
    timeout?: number;
    priority?: number;
  } = {}): string {
    const task: JavaScriptTask = {
      id: uuidv4(),
      type: 'custom_js',
      status: 'pending',
      priority: options.priority || 5,
      createdAt: new Date(),
      parameters: {
        script,
        args: options.args || [],
        pageId: options.pageId,
        url: options.url,
        timeout: options.timeout || 30000
      }
    };

    this.tasks.set(task.id, task);
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    this.logger.info(`JavaScript task created: ${task.id}`);
    this.emit('taskCreated', task);
    
    return task.id;
  }

  /**
   * Create an n8n workflow task
   */
  createN8nWorkflowTask(workflowId: string, options: {
    inputData?: any;
    webhookUrl?: string;
    timeout?: number;
    priority?: number;
  } = {}): string {
    const task: N8nWorkflowTask = {
      id: uuidv4(),
      type: 'n8n_workflow',
      status: 'pending',
      priority: options.priority || 5,
      createdAt: new Date(),
      parameters: {
        workflowId,
        inputData: options.inputData || {},
        webhookUrl: options.webhookUrl,
        timeout: options.timeout || 60000
      }
    };

    this.tasks.set(task.id, task);
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    this.logger.info(`N8n workflow task created: ${task.id}`);
    this.emit('taskCreated', task);
    
    return task.id;
  }

  /**
   * Create a DOM analysis task
   */
  createDOMAnalysisTask(url: string, options: {
    pageId?: string;
    analysisType?: 'full' | 'performance' | 'structure' | 'resources';
    priority?: number;
  } = {}): string {
    const task: DOMAnalysisTask = {
      id: uuidv4(),
      type: 'dom_analysis',
      status: 'pending',
      priority: options.priority || 5,
      createdAt: new Date(),
      parameters: {
        url,
        pageId: options.pageId,
        analysisType: options.analysisType || 'full',
        options: {}
      }
    };

    this.tasks.set(task.id, task);
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    this.logger.info(`DOM analysis task created: ${task.id}`);
    this.emit('taskCreated', task);
    
    return task.id;
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks with optional filtering
   */
  getTasks(filter?: {
    status?: Task['status'];
    type?: Task['type'];
    limit?: number;
  }): Task[] {
    let tasks = Array.from(this.tasks.values());

    if (filter?.status) {
      tasks = tasks.filter(task => task.status === filter.status);
    }

    if (filter?.type) {
      tasks = tasks.filter(task => task.type === filter.type);
    }

    if (filter?.limit) {
      tasks = tasks.slice(0, filter.limit);
    }

    return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    if (task.status === 'running') {
      // Try to stop the running task
      try {
        await this.stopRunningTask(taskId);
      } catch (error) {
        this.logger.error(`Failed to stop task ${taskId}:`, error);
      }
    }

    task.status = 'cancelled';
    task.completedAt = new Date();
    
    this.logger.info(`Task cancelled: ${taskId}`);
    this.emit('taskCancelled', task);
    
    return true;
  }

  /**
   * Start the task processor
   */
  private startTaskProcessor(): void {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.processTasks();
  }

  /**
   * Stop the task processor
   */
  private stopTaskProcessor(): void {
    this.isProcessing = false;
  }

  /**
   * Process tasks from the queue
   */
  private async processTasks(): Promise<void> {
    while (this.isProcessing) {
      try {
        // Check if we can run more tasks
        if (this.runningTasks.size >= this.maxConcurrentTasks) {
          await this.sleep(1000);
          continue;
        }

        // Get next task from queue
        const task = this.taskQueue.shift();
        if (!task) {
          await this.sleep(1000);
          continue;
        }

        // Start the task
        this.runTask(task);
      } catch (error) {
        this.logger.error('Error in task processor:', error);
        await this.sleep(5000);
      }
    }
  }

  /**
   * Run a specific task
   */
  private async runTask(task: Task): Promise<void> {
    try {
      this.runningTasks.add(task.id);
      task.status = 'running';
      task.startedAt = new Date();
      task.progress = 0;

      this.logger.info(`Starting task: ${task.id} (${task.type})`);
      this.emit('taskStarted', task);

      let result: any;

      switch (task.type) {
        case 'custom_js':
          result = await this.executeJavaScriptTask(task as JavaScriptTask);
          break;
        case 'n8n_workflow':
          result = await this.executeN8nWorkflowTask(task as N8nWorkflowTask);
          break;
        case 'dom_analysis':
          result = await this.executeDOMAnalysisTask(task as DOMAnalysisTask);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      // Task completed successfully
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;
      task.progress = 100;

      this.logger.info(`Task completed: ${task.id}`);
      this.emit('taskCompleted', task);

    } catch (error) {
      // Task failed
      task.status = 'failed';
      task.completedAt = new Date();
      task.error = error instanceof Error ? error.message : String(error);

      this.logger.error(`Task failed: ${task.id}`, error);
      this.emit('taskFailed', task);
    } finally {
      this.runningTasks.delete(task.id);
    }
  }

  /**
   * Execute a JavaScript task
   */
  private async executeJavaScriptTask(task: JavaScriptTask): Promise<any> {
    const { script, args = [], pageId, url, timeout = 30000 } = task.parameters;

    let targetPageId = pageId;

    // Create a new page if URL is provided but no pageId
    if (url && !pageId) {
      targetPageId = `task_${task.id}`;
      await this.headlessChromeService.createPage(targetPageId);
      await this.headlessChromeService.navigateToPage(targetPageId, url);
    }

    if (!targetPageId) {
      throw new Error('Either pageId or url must be provided for JavaScript execution');
    }

    try {
      // Execute the script with timeout
      const result = await Promise.race([
        this.headlessChromeService.executeScript(targetPageId, script, ...args),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Script execution timeout')), timeout)
        )
      ]);

      // Clean up page if we created it
      if (url && !pageId) {
        await this.headlessChromeService.closePage(targetPageId);
      }

      return result;
    } catch (error) {
      // Clean up page if we created it
      if (url && !pageId && targetPageId) {
        try {
          await this.headlessChromeService.closePage(targetPageId);
        } catch (cleanupError) {
          this.logger.error(`Failed to cleanup page ${targetPageId}:`, cleanupError);
        }
      }
      throw error;
    }
  }

  /**
   * Execute an n8n workflow task
   */
  private async executeN8nWorkflowTask(task: N8nWorkflowTask): Promise<any> {
    const { workflowId, inputData = {} } = task.parameters;

    // For now, we'll simulate n8n workflow execution
    // In a real implementation, this would integrate with n8n's API
    this.logger.info(`Executing n8n workflow: ${workflowId}`);
    
    // Simulate workflow execution time
    await this.sleep(Math.random() * 5000 + 1000);

    // Return mock result
    return {
      workflowId,
      executed: true,
      inputData,
      result: {
        message: 'Workflow executed successfully',
        timestamp: new Date().toISOString(),
        outputData: inputData
      }
    };
  }

  /**
   * Execute a DOM analysis task
   */
  private async executeDOMAnalysisTask(task: DOMAnalysisTask): Promise<any> {
    const { url, pageId } = task.parameters;

    let targetPageId = pageId;

    // Create a new page if no pageId provided
    if (!pageId) {
      targetPageId = `task_${task.id}`;
      await this.headlessChromeService.createPage(targetPageId);
      await this.headlessChromeService.navigateToPage(targetPageId, url);
    }

    try {
      const result = await this.headlessChromeService.analyzeDOM(targetPageId);

      // Clean up page if we created it
      if (!pageId) {
        await this.headlessChromeService.closePage(targetPageId);
      }

      return result;
    } catch (error) {
      // Clean up page if we created it
      if (!pageId && targetPageId) {
        try {
          await this.headlessChromeService.closePage(targetPageId);
        } catch (cleanupError) {
          this.logger.error(`Failed to cleanup page ${targetPageId}:`, cleanupError);
        }
      }
      throw error;
    }
  }

  /**
   * Stop a running task
   */
  private async stopRunningTask(taskId: string): Promise<void> {
    // This is a simplified implementation
    // In a real scenario, you'd need to implement proper task cancellation
    const task = this.tasks.get(taskId);
    if (task && task.status === 'running') {
      // Mark as cancelled and clean up resources
      task.status = 'cancelled';
      task.completedAt = new Date();
      
      // Clean up any resources (pages, etc.)
      if (task.type === 'custom_js' || task.type === 'dom_analysis') {
        const pageId = `task_${taskId}`;
        try {
          await this.headlessChromeService.closePage(pageId);
        } catch (error) {
          this.logger.error(`Failed to cleanup page ${pageId}:`, error);
        }
      }
    }
  }

  /**
   * Get task statistics
   */
  getStats(): any {
    const tasks = Array.from(this.tasks.values());
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
      queueLength: this.taskQueue.length,
      maxConcurrent: this.maxConcurrentTasks,
      activeTasks: this.runningTasks.size
    };
  }

  /**
   * Clean up old tasks
   */
  cleanupOldTasks(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - maxAge);
    const toDelete: string[] = [];

    for (const [id, task] of this.tasks) {
      if (task.createdAt < cutoff && 
          (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled')) {
        toDelete.push(id);
      }
    }

    for (const id of toDelete) {
      this.tasks.delete(id);
    }

    this.logger.info(`Cleaned up ${toDelete.length} old tasks`);
  }

  /**
   * Utility method for sleeping
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Shutdown the task manager
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down task manager...');
    
    this.stopTaskProcessor();
    
    // Cancel all running tasks
    for (const taskId of this.runningTasks) {
      await this.cancelTask(taskId);
    }
    
    // Clear all tasks
    this.tasks.clear();
    this.taskQueue = [];
    this.runningTasks.clear();
    
    this.logger.info('Task manager shutdown complete');
  }
}

export default TaskManager;
