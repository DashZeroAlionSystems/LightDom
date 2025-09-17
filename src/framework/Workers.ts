/**
 * Workers Service - Background task processing and optimization workers
 * Handles concurrent processing of optimization tasks using worker threads
 */

import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { EventEmitter } from 'events';
import { headlessBrowserService } from './HeadlessBrowserService';
import { spaceOptimizationEngine } from '../core/SpaceOptimizationEngine';
import { urlQueueManager } from './URLQueueManager';

export interface WorkerConfig {
  maxWorkers: number;
  workerTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableHeadlessBrowser: boolean;
  enableServiceWorker: boolean;
  enableCaching: boolean;
  enableMetrics: boolean;
}

export interface WorkerTask {
  id: string;
  type: 'optimization' | 'analysis' | 'simulation' | 'cleanup';
  data: any;
  priority: 'high' | 'medium' | 'low';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface WorkerMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  activeWorkers: number;
  averageProcessingTime: number;
  successRate: number;
  throughput: number; // tasks per minute
}

export class WorkersService extends EventEmitter {
  private workers: Map<string, Worker> = new Map();
  private tasks: Map<string, WorkerTask> = new Map();
  private taskQueue: WorkerTask[] = [];
  private config: WorkerConfig;
  private isRunning = false;
  private metrics: WorkerMetrics;
  private processingInterval?: NodeJS.Timeout;

  constructor(config: Partial<WorkerConfig> = {}) {
    super();
    this.config = {
      maxWorkers: 5,
      workerTimeout: 300000, // 5 minutes
      retryAttempts: 3,
      retryDelay: 5000,
      enableHeadlessBrowser: true,
      enableServiceWorker: true,
      enableCaching: true,
      enableMetrics: true,
      ...config,
    };

    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      activeWorkers: 0,
      averageProcessingTime: 0,
      successRate: 0,
      throughput: 0,
    };
  }

  /**
   * Start the workers service
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Workers service is already running');
      return;
    }

    try {
      console.log('🚀 Starting workers service...');

      // Initialize headless browser if enabled
      if (this.config.enableHeadlessBrowser) {
        await headlessBrowserService.initialize();
      }

      // Start worker processing
      this.startWorkerProcessing();

      this.isRunning = true;
      this.emit('started');

      console.log(`✅ Workers service started with ${this.config.maxWorkers} workers`);
    } catch (error) {
      console.error('❌ Failed to start workers service:', error);
      throw error;
    }
  }

  /**
   * Stop the workers service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping workers service...');

    // Stop worker processing
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    // Terminate all workers
    for (const [workerId, worker] of this.workers) {
      try {
        await worker.terminate();
      } catch (error) {
        console.error(`Error terminating worker ${workerId}:`, error);
      }
    }
    this.workers.clear();

    // Close headless browser
    if (this.config.enableHeadlessBrowser) {
      await headlessBrowserService.close();
    }

    this.isRunning = false;
    this.emit('stopped');

    console.log('✅ Workers service stopped');
  }

  /**
   * Add task to worker queue
   */
  addTask(task: Omit<WorkerTask, 'id' | 'createdAt' | 'status' | 'retryCount'>): string {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const workerTask: WorkerTask = {
      id: taskId,
      createdAt: Date.now(),
      status: 'pending',
      retryCount: 0,
      maxRetries: this.config.retryAttempts,
      ...task,
    };

    this.tasks.set(taskId, workerTask);
    this.taskQueue.push(workerTask);
    this.metrics.totalTasks++;

    // Sort queue by priority
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    this.emit('taskAdded', workerTask);
    console.log(`📝 Task added to queue: ${taskId} (${task.type})`);

    return taskId;
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): WorkerTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Cancel task
   */
  cancelTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task || task.status !== 'pending') {
      return false;
    }

    task.status = 'failed';
    task.error = 'Task cancelled';
    this.metrics.failedTasks++;

    // Remove from queue
    const index = this.taskQueue.findIndex(t => t.id === taskId);
    if (index !== -1) {
      this.taskQueue.splice(index, 1);
    }

    this.emit('taskCancelled', task);
    return true;
  }

  /**
   * Get worker metrics
   */
  getMetrics(): WorkerMetrics {
    return { ...this.metrics };
  }

  /**
   * Start worker processing
   */
  private startWorkerProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processTaskQueue();
    }, 1000); // Process every second
  }

  /**
   * Process task queue
   */
  private async processTaskQueue(): Promise<void> {
    // Check if we can start more workers
    if (this.workers.size >= this.config.maxWorkers) {
      return;
    }

    // Get next task
    const task = this.taskQueue.shift();
    if (!task) {
      return;
    }

    // Start worker for task
    await this.startWorker(task);
  }

  /**
   * Start worker for task
   */
  private async startWorker(task: WorkerTask): Promise<void> {
    const workerId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Create worker
      const worker = new Worker(__filename, {
        workerData: {
          task,
          config: this.config,
        },
      });

      // Store worker
      this.workers.set(workerId, worker);
      this.metrics.activeWorkers++;

      // Update task status
      task.status = 'running';
      task.startedAt = Date.now();

      // Set up worker event handlers
      worker.on('message', result => {
        this.handleWorkerMessage(workerId, task, result);
      });

      worker.on('error', error => {
        this.handleWorkerError(workerId, task, error);
      });

      worker.on('exit', code => {
        this.handleWorkerExit(workerId, task, code);
      });

      // Set timeout
      setTimeout(() => {
        if (this.workers.has(workerId)) {
          this.handleWorkerTimeout(workerId, task);
        }
      }, this.config.workerTimeout);

      this.emit('workerStarted', { workerId, task });
    } catch (error) {
      console.error(`❌ Failed to start worker for task ${task.id}:`, error);
      this.handleTaskFailure(task, error);
    }
  }

  /**
   * Handle worker message
   */
  private handleWorkerMessage(workerId: string, task: WorkerTask, result: any): void {
    if (result.type === 'completed') {
      this.handleTaskCompletion(workerId, task, result.data);
    } else if (result.type === 'error') {
      this.handleTaskFailure(task, new Error(result.error));
    } else if (result.type === 'progress') {
      this.emit('taskProgress', { task, progress: result.progress });
    }
  }

  /**
   * Handle worker error
   */
  private handleWorkerError(workerId: string, task: WorkerTask, error: Error): void {
    console.error(`❌ Worker error for task ${task.id}:`, error);
    this.handleTaskFailure(task, error);
  }

  /**
   * Handle worker exit
   */
  private handleWorkerExit(workerId: string, task: WorkerTask, code: number): void {
    this.workers.delete(workerId);
    this.metrics.activeWorkers--;

    if (code !== 0 && task.status === 'running') {
      this.handleTaskFailure(task, new Error(`Worker exited with code ${code}`));
    }

    this.emit('workerExited', { workerId, task, code });
  }

  /**
   * Handle worker timeout
   */
  private handleWorkerTimeout(workerId: string, task: WorkerTask): void {
    console.error(`⏰ Worker timeout for task ${task.id}`);

    // Terminate worker
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.terminate();
      this.workers.delete(workerId);
      this.metrics.activeWorkers--;
    }

    this.handleTaskFailure(task, new Error('Worker timeout'));
  }

  /**
   * Handle task completion
   */
  private handleTaskCompletion(workerId: string, task: WorkerTask, result: any): void {
    task.status = 'completed';
    task.completedAt = Date.now();
    task.result = result;

    // Update metrics
    this.metrics.completedTasks++;
    this.updateProcessingTime(task);
    this.updateSuccessRate();

    // Terminate worker
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.terminate();
      this.workers.delete(workerId);
      this.metrics.activeWorkers--;
    }

    this.emit('taskCompleted', task);
    console.log(`✅ Task completed: ${task.id} (${task.type})`);
  }

  /**
   * Handle task failure
   */
  private handleTaskFailure(task: WorkerTask, error: Error): void {
    task.retryCount++;
    task.error = error.message;

    if (task.retryCount < task.maxRetries) {
      // Retry task
      task.status = 'pending';
      task.startedAt = undefined;
      task.error = undefined;

      // Add back to queue with delay
      setTimeout(() => {
        this.taskQueue.unshift(task); // Add to front of queue
      }, this.config.retryDelay);

      this.emit('taskRetry', task);
      console.log(`🔄 Retrying task: ${task.id} (attempt ${task.retryCount + 1})`);
    } else {
      // Task failed permanently
      task.status = 'failed';
      task.completedAt = Date.now();

      this.metrics.failedTasks++;
      this.updateSuccessRate();

      this.emit('taskFailed', task);
      console.log(`❌ Task failed permanently: ${task.id} - ${error.message}`);
    }
  }

  /**
   * Update processing time metrics
   */
  private updateProcessingTime(task: WorkerTask): void {
    if (task.startedAt && task.completedAt) {
      const processingTime = task.completedAt - task.startedAt;
      const currentAvg = this.metrics.averageProcessingTime;
      const totalCompleted = this.metrics.completedTasks;

      this.metrics.averageProcessingTime =
        (currentAvg * (totalCompleted - 1) + processingTime) / totalCompleted;
    }
  }

  /**
   * Update success rate metrics
   */
  private updateSuccessRate(): void {
    const total = this.metrics.completedTasks + this.metrics.failedTasks;
    this.metrics.successRate = total > 0 ? (this.metrics.completedTasks / total) * 100 : 0;
  }

  /**
   * Get service status
   */
  getStatus(): {
    running: boolean;
    workers: number;
    maxWorkers: number;
    tasks: number;
    queue: number;
    metrics: WorkerMetrics;
  } {
    return {
      running: this.isRunning,
      workers: this.workers.size,
      maxWorkers: this.config.maxWorkers,
      tasks: this.tasks.size,
      queue: this.taskQueue.length,
      metrics: this.metrics,
    };
  }
}

// Worker thread code
if (!isMainThread) {
  const { task, config } = workerData;

  // Process task based on type
  processTask(task, config)
    .then(result => {
      parentPort?.postMessage({
        type: 'completed',
        data: result,
      });
    })
    .catch(error => {
      parentPort?.postMessage({
        type: 'error',
        error: error.message,
      });
    });
}

/**
 * Process task in worker thread
 */
async function processTask(task: WorkerTask, config: WorkerConfig): Promise<any> {
  switch (task.type) {
    case 'optimization':
      return await processOptimizationTask(task, config);
    case 'analysis':
      return await processAnalysisTask(task, config);
    case 'simulation':
      return await processSimulationTask(task, config);
    case 'cleanup':
      return await processCleanupTask(task, config);
    default:
      throw new Error(`Unknown task type: ${task.type}`);
  }
}

/**
 * Process optimization task
 */
async function processOptimizationTask(task: WorkerTask, config: WorkerConfig): Promise<any> {
  const { url, siteType, priority } = task.data;

  try {
    // Initialize headless browser if needed
    if (config.enableHeadlessBrowser) {
      await headlessBrowserService.initialize();
    }

    // Create page for optimization
    const page = await headlessBrowserService.createPage(url);

    // Navigate to URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Analyze page for optimization opportunities
    const optimizations = await analyzePageForOptimizations(page);

    // Calculate space savings
    const totalSpaceSaved = optimizations.reduce((sum, opt) => sum + opt.spaceSaved, 0);

    // Create optimization result
    const result = {
      url,
      originalSize: task.data.originalSize || 0,
      optimizedSize: Math.max(0, (task.data.originalSize || 0) - totalSpaceSaved),
      spaceSaved: totalSpaceSaved,
      spaceSavedPercentage: task.data.originalSize
        ? (totalSpaceSaved / task.data.originalSize) * 100
        : 0,
      optimizations,
      timestamp: Date.now(),
    };

    // Close page
    await page.close();

    return result;
  } catch (error) {
    throw new Error(`Optimization task failed: ${error.message}`);
  }
}

/**
 * Process analysis task
 */
async function processAnalysisTask(task: WorkerTask, config: WorkerConfig): Promise<any> {
  const { url, analysisType } = task.data;

  try {
    // Perform different types of analysis
    switch (analysisType) {
      case 'performance':
        return await analyzePerformance(url);
      case 'accessibility':
        return await analyzeAccessibility(url);
      case 'seo':
        return await analyzeSEO(url);
      case 'security':
        return await analyzeSecurity(url);
      default:
        throw new Error(`Unknown analysis type: ${analysisType}`);
    }
  } catch (error) {
    throw new Error(`Analysis task failed: ${error.message}`);
  }
}

/**
 * Process simulation task
 */
async function processSimulationTask(task: WorkerTask, config: WorkerConfig): Promise<any> {
  const { simulationType, parameters } = task.data;

  try {
    // Run simulation based on type
    switch (simulationType) {
      case 'network':
        return await simulateNetworkOptimization(parameters);
      case 'token':
        return await simulateTokenDistribution(parameters);
      case 'load':
        return await simulateLoadBalancing(parameters);
      default:
        throw new Error(`Unknown simulation type: ${simulationType}`);
    }
  } catch (error) {
    throw new Error(`Simulation task failed: ${error.message}`);
  }
}

/**
 * Process cleanup task
 */
async function processCleanupTask(task: WorkerTask, config: WorkerConfig): Promise<any> {
  const { cleanupType } = task.data;

  try {
    switch (cleanupType) {
      case 'cache':
        return await cleanupCache();
      case 'logs':
        return await cleanupLogs();
      case 'temp':
        return await cleanupTempFiles();
      default:
        throw new Error(`Unknown cleanup type: ${cleanupType}`);
    }
  } catch (error) {
    throw new Error(`Cleanup task failed: ${error.message}`);
  }
}

/**
 * Analyze page for optimization opportunities
 */
async function analyzePageForOptimizations(page: any): Promise<any[]> {
  // This would contain the actual optimization analysis logic
  // For now, return mock data
  return [
    {
      type: 'html',
      description: 'Remove unnecessary whitespace',
      spaceSaved: 1024,
      impact: 'medium',
      implementation: 'Minify HTML',
    },
    {
      type: 'css',
      description: 'Minify CSS',
      spaceSaved: 2048,
      impact: 'high',
      implementation: 'Use CSS minifier',
    },
  ];
}

/**
 * Analyze performance
 */
async function analyzePerformance(url: string): Promise<any> {
  // Mock performance analysis
  return {
    loadTime: 1500,
    firstContentfulPaint: 800,
    largestContentfulPaint: 1200,
    cumulativeLayoutShift: 0.1,
  };
}

/**
 * Analyze accessibility
 */
async function analyzeAccessibility(url: string): Promise<any> {
  // Mock accessibility analysis
  return {
    score: 85,
    issues: [{ type: 'color-contrast', severity: 'medium', description: 'Low color contrast' }],
  };
}

/**
 * Analyze SEO
 */
async function analyzeSEO(url: string): Promise<any> {
  // Mock SEO analysis
  return {
    score: 90,
    issues: [
      { type: 'meta-description', severity: 'low', description: 'Missing meta description' },
    ],
  };
}

/**
 * Analyze security
 */
async function analyzeSecurity(url: string): Promise<any> {
  // Mock security analysis
  return {
    score: 95,
    issues: [{ type: 'https', severity: 'high', description: 'Not using HTTPS' }],
  };
}

/**
 * Simulate network optimization
 */
async function simulateNetworkOptimization(parameters: any): Promise<any> {
  // Mock network optimization simulation
  return {
    efficiency: 85.5,
    recommendations: ['Add more optimization nodes', 'Implement load balancing'],
  };
}

/**
 * Simulate token distribution
 */
async function simulateTokenDistribution(parameters: any): Promise<any> {
  // Mock token distribution simulation
  return {
    totalDistributed: 1000,
    averagePerOptimization: 50,
    distributionVariance: 0.15,
  };
}

/**
 * Simulate load balancing
 */
async function simulateLoadBalancing(parameters: any): Promise<any> {
  // Mock load balancing simulation
  return {
    loadDistribution: 0.8,
    recommendations: ['Redistribute storage allocations', 'Scale up underutilized nodes'],
  };
}

/**
 * Cleanup cache
 */
async function cleanupCache(): Promise<any> {
  // Mock cache cleanup
  return {
    cleanedFiles: 150,
    spaceFreed: 50 * 1024 * 1024, // 50MB
  };
}

/**
 * Cleanup logs
 */
async function cleanupLogs(): Promise<any> {
  // Mock log cleanup
  return {
    cleanedFiles: 25,
    spaceFreed: 10 * 1024 * 1024, // 10MB
  };
}

/**
 * Cleanup temp files
 */
async function cleanupTempFiles(): Promise<any> {
  // Mock temp file cleanup
  return {
    cleanedFiles: 100,
    spaceFreed: 5 * 1024 * 1024, // 5MB
  };
}

// Export singleton instance
export const workersService = new WorkersService();
