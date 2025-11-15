import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

/**
 * Advanced Task Queue System
 * 
 * Features:
 * - Priority-based task scheduling
 * - Retry logic with exponential backoff
 * - Task dependencies
 * - Parallel execution with concurrency limits
 * - Progress tracking and feedback
 * - Persistent queue state
 * - Dead letter queue for failed tasks
 */

export enum TaskStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  CRITICAL = 0,
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3,
}

export interface Task {
  id: string;
  name: string;
  type: string;
  priority: TaskPriority;
  status: TaskStatus;
  dependencies: string[];
  payload: any;
  retries: number;
  maxRetries: number;
  retryDelay: number; // milliseconds
  timeout: number; // milliseconds
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
  metadata?: Record<string, any>;
}

export interface TaskHandler {
  (task: Task): Promise<any>;
}

export interface QueueOptions {
  concurrency?: number;
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  persistPath?: string;
  autoStart?: boolean;
}

export interface QueueStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  retrying: number;
  cancelled: number;
}

export class AdvancedTaskQueue extends EventEmitter {
  private tasks: Map<string, Task> = new Map();
  private handlers: Map<string, TaskHandler> = new Map();
  private running: Set<string> = new Set();
  private deadLetterQueue: Task[] = [];
  
  private concurrency: number;
  private maxRetries: number;
  private retryDelay: number;
  private timeout: number;
  private persistPath?: string;
  private isRunning: boolean = false;
  private processingInterval?: NodeJS.Timeout;

  constructor(options: QueueOptions = {}) {
    super();
    
    this.concurrency = options.concurrency || 5;
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 5000;
    this.timeout = options.timeout || 300000; // 5 minutes
    this.persistPath = options.persistPath;

    if (options.autoStart) {
      this.start();
    }
  }

  /**
   * Initialize queue from persistent storage
   */
  async initialize(): Promise<void> {
    if (this.persistPath) {
      try {
        const data = await fs.readFile(this.persistPath, 'utf8');
        const saved = JSON.parse(data);
        
        for (const task of saved.tasks || []) {
          task.createdAt = new Date(task.createdAt);
          if (task.startedAt) task.startedAt = new Date(task.startedAt);
          if (task.completedAt) task.completedAt = new Date(task.completedAt);
          
          // Reset running tasks to pending
          if (task.status === TaskStatus.RUNNING) {
            task.status = TaskStatus.PENDING;
          }
          
          this.tasks.set(task.id, task);
        }

        this.deadLetterQueue = saved.deadLetterQueue || [];
        
        console.log(`📦 Loaded ${this.tasks.size} tasks from persistent storage`);
      } catch (error) {
        console.log('📦 No previous queue state found, starting fresh');
      }
    }
  }

  /**
   * Start processing tasks
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('▶️ Task queue started');
    
    this.emit('started');
    
    // Process tasks at regular intervals
    this.processingInterval = setInterval(() => {
      this.processTasks();
    }, 1000);
  }

  /**
   * Stop processing tasks
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    // Wait for running tasks to complete
    const waitForCompletion = Array.from(this.running).map(taskId => {
      return new Promise<void>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!this.running.has(taskId)) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 500);
      });
    });

    await Promise.all(waitForCompletion);
    
    // Persist state
    await this.persist();
    
    console.log('⏸️ Task queue stopped');
    this.emit('stopped');
  }

  /**
   * Register a task handler
   */
  registerHandler(type: string, handler: TaskHandler): void {
    this.handlers.set(type, handler);
    console.log(`🔧 Registered handler for task type: ${type}`);
  }

  /**
   * Add a task to the queue
   */
  async addTask(taskConfig: Partial<Task>): Promise<string> {
    const task: Task = {
      id: taskConfig.id || this.generateTaskId(),
      name: taskConfig.name || 'Unnamed Task',
      type: taskConfig.type || 'default',
      priority: taskConfig.priority ?? TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      dependencies: taskConfig.dependencies || [],
      payload: taskConfig.payload || {},
      retries: 0,
      maxRetries: taskConfig.maxRetries ?? this.maxRetries,
      retryDelay: taskConfig.retryDelay ?? this.retryDelay,
      timeout: taskConfig.timeout ?? this.timeout,
      createdAt: new Date(),
      metadata: taskConfig.metadata || {},
    };

    this.tasks.set(task.id, task);
    
    console.log(`➕ Added task: ${task.name} (${task.id}) [Priority: ${TaskPriority[task.priority]}]`);
    
    this.emit('taskAdded', task);
    await this.persist();

    return task.id;
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      return false;
    }

    if (task.status === TaskStatus.RUNNING) {
      console.warn(`⚠️ Cannot cancel running task: ${taskId}`);
      return false;
    }

    task.status = TaskStatus.CANCELLED;
    task.completedAt = new Date();
    
    console.log(`🚫 Cancelled task: ${task.name} (${taskId})`);
    
    this.emit('taskCancelled', task);
    await this.persist();

    return true;
  }

  /**
   * Get task by ID
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const stats: QueueStats = {
      total: this.tasks.size,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      retrying: 0,
      cancelled: 0,
    };

    for (const task of this.tasks.values()) {
      switch (task.status) {
        case TaskStatus.PENDING:
          stats.pending++;
          break;
        case TaskStatus.RUNNING:
          stats.running++;
          break;
        case TaskStatus.COMPLETED:
          stats.completed++;
          break;
        case TaskStatus.FAILED:
          stats.failed++;
          break;
        case TaskStatus.RETRYING:
          stats.retrying++;
          break;
        case TaskStatus.CANCELLED:
          stats.cancelled++;
          break;
      }
    }

    return stats;
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === status);
  }

  /**
   * Get dead letter queue
   */
  getDeadLetterQueue(): Task[] {
    return [...this.deadLetterQueue];
  }

  /**
   * Clear completed tasks
   */
  async clearCompleted(): Promise<number> {
    const completed = Array.from(this.tasks.values())
      .filter(t => t.status === TaskStatus.COMPLETED);

    for (const task of completed) {
      this.tasks.delete(task.id);
    }

    await this.persist();

    console.log(`🧹 Cleared ${completed.length} completed tasks`);
    
    return completed.length;
  }

  /**
   * Process tasks (internal)
   */
  private async processTasks(): Promise<void> {
    if (!this.isRunning || this.running.size >= this.concurrency) {
      return;
    }

    // Get runnable tasks (pending, no dependencies, sorted by priority)
    const runnableTasks = Array.from(this.tasks.values())
      .filter(task => 
        task.status === TaskStatus.PENDING &&
        this.areDependenciesMet(task)
      )
      .sort((a, b) => a.priority - b.priority);

    const availableSlots = this.concurrency - this.running.size;
    const tasksToRun = runnableTasks.slice(0, availableSlots);

    for (const task of tasksToRun) {
      this.executeTask(task);
    }
  }

  /**
   * Check if task dependencies are met
   */
  private areDependenciesMet(task: Task): boolean {
    for (const depId of task.dependencies) {
      const depTask = this.tasks.get(depId);
      
      if (!depTask || depTask.status !== TaskStatus.COMPLETED) {
        return false;
      }
    }

    return true;
  }

  /**
   * Execute a task
   */
  private async executeTask(task: Task): Promise<void> {
    const handler = this.handlers.get(task.type);

    if (!handler) {
      console.error(`❌ No handler registered for task type: ${task.type}`);
      task.status = TaskStatus.FAILED;
      task.error = `No handler for task type: ${task.type}`;
      task.completedAt = new Date();
      this.emit('taskFailed', task);
      return;
    }

    this.running.add(task.id);
    task.status = TaskStatus.RUNNING;
    task.startedAt = new Date();

    console.log(`🏃 Executing task: ${task.name} (${task.id}) [Attempt ${task.retries + 1}/${task.maxRetries + 1}]`);
    
    this.emit('taskStarted', task);

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(handler, task);

      task.status = TaskStatus.COMPLETED;
      task.result = result;
      task.completedAt = new Date();

      console.log(`✅ Completed task: ${task.name} (${task.id})`);
      
      this.emit('taskCompleted', task);
    } catch (error: any) {
      task.error = error.message;

      console.error(`❌ Task failed: ${task.name} (${task.id}) - ${error.message}`);

      // Retry logic
      if (task.retries < task.maxRetries) {
        task.retries++;
        task.status = TaskStatus.RETRYING;

        const delay = this.calculateRetryDelay(task.retries, task.retryDelay);

        console.log(`🔄 Retrying task in ${delay}ms (attempt ${task.retries + 1}/${task.maxRetries + 1})`);
        
        this.emit('taskRetrying', task);

        setTimeout(() => {
          task.status = TaskStatus.PENDING;
        }, delay);
      } else {
        task.status = TaskStatus.FAILED;
        task.completedAt = new Date();

        // Move to dead letter queue
        this.deadLetterQueue.push(task);

        console.error(`💀 Task moved to dead letter queue: ${task.name} (${task.id})`);
        
        this.emit('taskFailed', task);
      }
    } finally {
      this.running.delete(task.id);
      await this.persist();
    }
  }

  /**
   * Execute task with timeout
   */
  private async executeWithTimeout(handler: TaskHandler, task: Task): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Task timeout after ${task.timeout}ms`));
      }, task.timeout);

      handler(task)
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number, baseDelay: number): number {
    return baseDelay * Math.pow(2, retryCount - 1);
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Persist queue state
   */
  private async persist(): Promise<void> {
    if (!this.persistPath) return;

    try {
      const data = {
        tasks: Array.from(this.tasks.values()),
        deadLetterQueue: this.deadLetterQueue,
        timestamp: new Date().toISOString(),
      };

      await fs.mkdir(path.dirname(this.persistPath), { recursive: true });
      await fs.writeFile(this.persistPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error: any) {
      console.error(`Failed to persist queue state: ${error.message}`);
    }
  }
}

export default AdvancedTaskQueue;
