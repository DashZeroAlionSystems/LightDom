/**
 * Worker Pool Manager
 * Manages a pool of headless browser workers for efficient task execution
 * Supports Puppeteer and Playwright workers with load balancing
 */

import { EventEmitter } from 'events';
import { fork, ChildProcess } from 'child_process';
import path from 'path';
import { Logger } from '../utils/Logger';

export interface WorkerConfig {
  type: 'puppeteer' | 'playwright' | 'custom';
  maxWorkers: number;
  minWorkers: number;
  workerScript?: string;
  timeout: number;
  retries: number;
  poolingStrategy: 'round-robin' | 'least-busy' | 'random';
}

export interface Task {
  id: string;
  type: string;
  data: any;
  priority: number;
  timeout?: number;
  retries?: number;
}

export interface WorkerStatus {
  id: string;
  pid: number;
  status: 'idle' | 'busy' | 'error' | 'starting';
  tasksCompleted: number;
  tasksActive: number;
  lastActivity: number;
  errors: number;
}

export class WorkerPoolManager extends EventEmitter {
  private config: WorkerConfig;
  private workers: Map<string, ChildProcess> = new Map();
  private workerStatus: Map<string, WorkerStatus> = new Map();
  private taskQueue: Task[] = [];
  private activeTasks: Map<string, Task> = new Map();
  private logger: Logger;
  private currentWorkerIndex = 0;
  private isShuttingDown = false;

  constructor(config: Partial<WorkerConfig> = {}) {
    super();
    
    this.config = {
      type: config.type || 'puppeteer',
      maxWorkers: config.maxWorkers || 4,
      minWorkers: config.minWorkers || 1,
      workerScript: config.workerScript || this.getDefaultWorkerScript(config.type || 'puppeteer'),
      timeout: config.timeout || 60000,
      retries: config.retries || 3,
      poolingStrategy: config.poolingStrategy || 'least-busy',
    };

    this.logger = new Logger('WorkerPoolManager');
  }

  private getDefaultWorkerScript(type: string): string {
    const scriptsPath = path.resolve(__dirname, '../../electron/workers');
    
    switch (type) {
      case 'puppeteer':
        return path.join(scriptsPath, 'puppeteer-worker.js');
      case 'playwright':
        return path.join(scriptsPath, 'playwright-worker.js');
      default:
        return path.join(scriptsPath, 'puppeteer-worker.js');
    }
  }

  /**
   * Initialize the worker pool
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing worker pool...', {
      type: this.config.type,
      minWorkers: this.config.minWorkers,
      maxWorkers: this.config.maxWorkers,
    });

    // Create minimum number of workers
    for (let i = 0; i < this.config.minWorkers; i++) {
      await this.createWorker();
    }

    // Start health monitoring
    this.startHealthMonitoring();

    this.logger.info('Worker pool initialized', {
      activeWorkers: this.workers.size,
    });
  }

  /**
   * Create a new worker process
   */
  private async createWorker(): Promise<string> {
    const workerId = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.logger.debug('Creating worker', { workerId });

    const worker = fork(this.config.workerScript!, {
      env: {
        ...process.env,
        WORKER_ID: workerId,
      },
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    // Initialize worker status
    this.workerStatus.set(workerId, {
      id: workerId,
      pid: worker.pid!,
      status: 'starting',
      tasksCompleted: 0,
      tasksActive: 0,
      lastActivity: Date.now(),
      errors: 0,
    });

    // Setup worker event handlers
    this.setupWorkerHandlers(workerId, worker);

    this.workers.set(workerId, worker);

    // Wait for worker to be ready
    await this.waitForWorkerReady(workerId);

    this.logger.info('Worker created', { workerId, pid: worker.pid });

    this.emit('workerCreated', workerId);

    return workerId;
  }

  /**
   * Setup event handlers for a worker
   */
  private setupWorkerHandlers(workerId: string, worker: ChildProcess): void {
    worker.on('message', (message: any) => {
      this.handleWorkerMessage(workerId, message);
    });

    worker.on('error', (error) => {
      this.logger.error('Worker error', { workerId, error });
      this.handleWorkerError(workerId, error);
    });

    worker.on('exit', (code, signal) => {
      this.logger.warn('Worker exited', { workerId, code, signal });
      this.handleWorkerExit(workerId, code, signal);
    });

    // Pipe stdout and stderr for debugging
    worker.stdout?.on('data', (data) => {
      this.logger.debug(`Worker ${workerId} stdout: ${data}`);
    });

    worker.stderr?.on('data', (data) => {
      this.logger.error(`Worker ${workerId} stderr: ${data}`);
    });
  }

  /**
   * Handle messages from workers
   */
  private handleWorkerMessage(workerId: string, message: any): void {
    const status = this.workerStatus.get(workerId);
    if (!status) return;

    // Update last activity
    status.lastActivity = Date.now();

    if (message.type === 'ready') {
      status.status = 'idle';
      this.logger.debug('Worker ready', { workerId });
      this.emit('workerReady', workerId);
      
      // Process queued tasks
      this.processQueue();
    } else if (message.type === 'result') {
      // Task completed
      const task = this.activeTasks.get(message.taskId);
      if (task) {
        status.tasksActive--;
        status.tasksCompleted++;
        status.status = 'idle';
        
        this.activeTasks.delete(message.taskId);
        this.emit('taskCompleted', { taskId: message.taskId, result: message.result });
        
        // Process next task
        this.processQueue();
      }
    } else if (message.type === 'error') {
      // Task failed
      const task = this.activeTasks.get(message.taskId);
      if (task) {
        status.tasksActive--;
        status.errors++;
        status.status = 'error';
        
        this.handleTaskError(task, message.error);
      }
    }
  }

  /**
   * Handle worker errors
   */
  private handleWorkerError(workerId: string, error: Error): void {
    const status = this.workerStatus.get(workerId);
    if (status) {
      status.errors++;
      status.status = 'error';
    }

    this.emit('workerError', { workerId, error });

    // Restart worker if too many errors
    if (status && status.errors > 5) {
      this.logger.warn('Worker has too many errors, restarting', { workerId });
      this.restartWorker(workerId);
    }
  }

  /**
   * Handle worker exit
   */
  private handleWorkerExit(workerId: string, code: number | null, signal: string | null): void {
    this.workers.delete(workerId);
    this.workerStatus.delete(workerId);

    this.emit('workerExited', { workerId, code, signal });

    // Replace worker if not shutting down
    if (!this.isShuttingDown && this.workers.size < this.config.minWorkers) {
      this.logger.info('Replacing exited worker', { workerId });
      this.createWorker().catch((err) => {
        this.logger.error('Failed to create replacement worker', { error: err });
      });
    }
  }

  /**
   * Wait for worker to be ready
   */
  private waitForWorkerReady(workerId: string, timeout: number = 30000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Worker ${workerId} did not become ready within ${timeout}ms`));
      }, timeout);

      const checkReady = () => {
        const status = this.workerStatus.get(workerId);
        if (status?.status === 'idle') {
          clearTimeout(timer);
          this.removeListener('workerReady', checkReady);
          resolve();
        }
      };

      this.on('workerReady', checkReady);
      checkReady(); // Check immediately in case already ready
    });
  }

  /**
   * Add a task to the queue
   */
  async addTask(task: Omit<Task, 'id'>): Promise<string> {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const fullTask: Task = {
      ...task,
      id: taskId,
      priority: task.priority || 0,
    };

    this.taskQueue.push(fullTask);
    
    // Sort by priority (higher priority first)
    this.taskQueue.sort((a, b) => b.priority - a.priority);

    this.logger.debug('Task added to queue', { taskId, queueSize: this.taskQueue.length });

    // Try to process immediately
    this.processQueue();

    return taskId;
  }

  /**
   * Process queued tasks
   */
  private async processQueue(): Promise<void> {
    if (this.taskQueue.length === 0) return;

    const worker = await this.getAvailableWorker();
    if (!worker) {
      // No available workers, scale up if possible
      if (this.workers.size < this.config.maxWorkers) {
        this.logger.debug('Scaling up worker pool');
        await this.createWorker();
      }
      return;
    }

    const task = this.taskQueue.shift();
    if (!task) return;

    await this.executeTask(worker, task);

    // Continue processing if there are more tasks
    if (this.taskQueue.length > 0) {
      setImmediate(() => this.processQueue());
    }
  }

  /**
   * Get an available worker based on pooling strategy
   */
  private async getAvailableWorker(): Promise<string | null> {
    const idleWorkers = Array.from(this.workerStatus.entries())
      .filter(([_, status]) => status.status === 'idle')
      .map(([id, _]) => id);

    if (idleWorkers.length === 0) return null;

    switch (this.config.poolingStrategy) {
      case 'round-robin':
        this.currentWorkerIndex = (this.currentWorkerIndex + 1) % idleWorkers.length;
        return idleWorkers[this.currentWorkerIndex];

      case 'least-busy':
        const leastBusy = Array.from(this.workerStatus.entries())
          .filter(([_, status]) => status.status === 'idle')
          .sort((a, b) => a[1].tasksCompleted - b[1].tasksCompleted)[0];
        return leastBusy ? leastBusy[0] : null;

      case 'random':
        return idleWorkers[Math.floor(Math.random() * idleWorkers.length)];

      default:
        return idleWorkers[0];
    }
  }

  /**
   * Execute a task on a worker
   */
  private async executeTask(workerId: string, task: Task): Promise<void> {
    const worker = this.workers.get(workerId);
    const status = this.workerStatus.get(workerId);

    if (!worker || !status) {
      this.logger.error('Worker not found', { workerId });
      this.taskQueue.unshift(task); // Put task back in queue
      return;
    }

    status.status = 'busy';
    status.tasksActive++;
    this.activeTasks.set(task.id, task);

    this.logger.debug('Executing task', { taskId: task.id, workerId });

    // Send task to worker
    worker.send({
      type: task.type,
      taskId: task.id,
      options: task.data,
    });

    // Setup timeout
    const timeout = task.timeout || this.config.timeout;
    setTimeout(() => {
      if (this.activeTasks.has(task.id)) {
        this.logger.warn('Task timeout', { taskId: task.id });
        this.handleTaskError(task, new Error('Task timeout'));
      }
    }, timeout);
  }

  /**
   * Handle task error
   */
  private async handleTaskError(task: Task, error: any): Promise<void> {
    this.activeTasks.delete(task.id);

    const retries = task.retries !== undefined ? task.retries : this.config.retries;

    if (retries > 0) {
      this.logger.info('Retrying task', { taskId: task.id, retriesLeft: retries });
      
      // Add back to queue with reduced retries
      this.taskQueue.unshift({
        ...task,
        retries: retries - 1,
      });
      
      this.processQueue();
    } else {
      this.logger.error('Task failed after all retries', { taskId: task.id, error });
      this.emit('taskFailed', { taskId: task.id, error });
    }
  }

  /**
   * Restart a worker
   */
  private async restartWorker(workerId: string): Promise<void> {
    this.logger.info('Restarting worker', { workerId });

    const worker = this.workers.get(workerId);
    if (worker) {
      worker.kill();
    }

    this.workers.delete(workerId);
    this.workerStatus.delete(workerId);

    // Create new worker
    await this.createWorker();
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    setInterval(() => {
      this.checkWorkerHealth();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Check worker health
   */
  private checkWorkerHealth(): void {
    const now = Date.now();
    const staleThreshold = 300000; // 5 minutes

    for (const [workerId, status] of this.workerStatus.entries()) {
      // Check if worker is stale
      if (now - status.lastActivity > staleThreshold && status.status === 'idle') {
        this.logger.warn('Worker is stale, restarting', { workerId });
        this.restartWorker(workerId);
      }

      // Check if worker has too many errors
      if (status.errors > 10) {
        this.logger.warn('Worker has too many errors, restarting', { workerId });
        this.restartWorker(workerId);
      }
    }

    // Scale down if too many idle workers
    const idleWorkers = Array.from(this.workerStatus.values())
      .filter(status => status.status === 'idle').length;

    if (idleWorkers > this.config.minWorkers && this.taskQueue.length === 0) {
      // Remove oldest idle worker
      const oldestIdle = Array.from(this.workerStatus.entries())
        .filter(([_, status]) => status.status === 'idle')
        .sort((a, b) => a[1].lastActivity - b[1].lastActivity)[0];

      if (oldestIdle) {
        this.logger.debug('Scaling down worker pool', { workerId: oldestIdle[0] });
        const worker = this.workers.get(oldestIdle[0]);
        if (worker) {
          worker.send({ type: 'shutdown' });
        }
      }
    }
  }

  /**
   * Get pool status
   */
  getStatus(): {
    config: WorkerConfig;
    workers: WorkerStatus[];
    queueSize: number;
    activeTasks: number;
    totalCompleted: number;
    totalErrors: number;
  } {
    const workers = Array.from(this.workerStatus.values());
    
    return {
      config: this.config,
      workers,
      queueSize: this.taskQueue.length,
      activeTasks: this.activeTasks.size,
      totalCompleted: workers.reduce((sum, w) => sum + w.tasksCompleted, 0),
      totalErrors: workers.reduce((sum, w) => sum + w.errors, 0),
    };
  }

  /**
   * Shutdown the worker pool
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down worker pool...');
    this.isShuttingDown = true;

    // Send shutdown message to all workers
    for (const [workerId, worker] of this.workers.entries()) {
      worker.send({ type: 'shutdown' });
    }

    // Wait for workers to exit
    await new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.workers.size === 0) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Force kill after timeout
      setTimeout(() => {
        for (const worker of this.workers.values()) {
          worker.kill('SIGKILL');
        }
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });

    this.logger.info('Worker pool shutdown complete');
  }
}

export default WorkerPoolManager;
