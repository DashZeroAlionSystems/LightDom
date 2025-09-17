import { Worker, Queue, Job } from 'bull';
import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';
import HeadlessChromeService from './HeadlessChromeService';
import WebCrawlerService from './WebCrawlerService';
import OptimizationEngine from './OptimizationEngine';
import Redis from 'ioredis';
import cron from 'node-cron';

export class BackgroundWorkerService extends EventEmitter {
  private logger: Logger;
  private redis: Redis;
  private workers: Map<string, Worker> = new Map();
  private queues: Map<string, Queue> = new Map();
  private services: Map<string, any> = new Map();
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();
  private isRunning = false;

  constructor() {
    super();
    this.logger = new Logger('BackgroundWorkerService');
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  /**
   * Initialize the background worker service
   */
  async initialize(): Promise<void> {
    try {
      // Initialize services
      const headlessService = new HeadlessChromeService();
      const crawlerService = new WebCrawlerService();
      const optimizationEngine = new OptimizationEngine();

      await headlessService.initialize();
      await crawlerService.initialize();
      await optimizationEngine.initialize();

      this.services.set('headless', headlessService);
      this.services.set('crawler', crawlerService);
      this.services.set('optimization', optimizationEngine);

      // Setup queues
      await this.setupQueues();

      // Setup workers
      await this.setupWorkers();

      // Setup cron jobs
      await this.setupCronJobs();

      this.isRunning = true;
      this.logger.info('BackgroundWorkerService initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize BackgroundWorkerService:', error);
      throw error;
    }
  }

  /**
   * Setup Redis queues
   */
  private async setupQueues(): Promise<void> {
    const queueConfig = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    };

    // Crawl queue
    const crawlQueue = new Queue('crawl-queue', queueConfig);
    this.queues.set('crawl', crawlQueue);

    // Optimization queue
    const optimizationQueue = new Queue('optimization-queue', queueConfig);
    this.queues.set('optimization', optimizationQueue);

    // Monitoring queue
    const monitoringQueue = new Queue('monitoring-queue', queueConfig);
    this.queues.set('monitoring', monitoringQueue);

    // Cleanup queue
    const cleanupQueue = new Queue('cleanup-queue', queueConfig);
    this.queues.set('cleanup', cleanupQueue);

    this.logger.info('Queues setup completed');
  }

  /**
   * Setup background workers
   */
  private async setupWorkers(): Promise<void> {
    // Crawl worker
    const crawlWorker = new Worker(
      'crawl-queue',
      async (job: Job) => {
        return await this.processCrawlJob(job);
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        },
        concurrency: 5,
      }
    );

    crawlWorker.on('completed', job => {
      this.logger.info(`Crawl job ${job.id} completed`);
      this.emit('crawlCompleted', { jobId: job.id, data: job.returnvalue });
    });

    crawlWorker.on('failed', (job, err) => {
      this.logger.error(`Crawl job ${job.id} failed:`, err);
      this.emit('crawlFailed', { jobId: job.id, error: err });
    });

    this.workers.set('crawl', crawlWorker);

    // Optimization worker
    const optimizationWorker = new Worker(
      'optimization-queue',
      async (job: Job) => {
        return await this.processOptimizationJob(job);
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        },
        concurrency: 3,
      }
    );

    optimizationWorker.on('completed', job => {
      this.logger.info(`Optimization job ${job.id} completed`);
      this.emit('optimizationCompleted', { jobId: job.id, data: job.returnvalue });
    });

    optimizationWorker.on('failed', (job, err) => {
      this.logger.error(`Optimization job ${job.id} failed:`, err);
      this.emit('optimizationFailed', { jobId: job.id, error: err });
    });

    this.workers.set('optimization', optimizationWorker);

    // Monitoring worker
    const monitoringWorker = new Worker(
      'monitoring-queue',
      async (job: Job) => {
        return await this.processMonitoringJob(job);
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        },
        concurrency: 10,
      }
    );

    monitoringWorker.on('completed', job => {
      this.logger.info(`Monitoring job ${job.id} completed`);
    });

    monitoringWorker.on('failed', (job, err) => {
      this.logger.error(`Monitoring job ${job.id} failed:`, err);
    });

    this.workers.set('monitoring', monitoringWorker);

    // Cleanup worker
    const cleanupWorker = new Worker(
      'cleanup-queue',
      async (job: Job) => {
        return await this.processCleanupJob(job);
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
        },
        concurrency: 2,
      }
    );

    cleanupWorker.on('completed', job => {
      this.logger.info(`Cleanup job ${job.id} completed`);
    });

    cleanupWorker.on('failed', (job, err) => {
      this.logger.error(`Cleanup job ${job.id} failed:`, err);
    });

    this.workers.set('cleanup', cleanupWorker);

    this.logger.info('Workers setup completed');
  }

  /**
   * Setup cron jobs for scheduled tasks
   */
  private async setupCronJobs(): Promise<void> {
    // Health check every 5 minutes
    const healthCheckJob = cron.schedule('*/5 * * * *', async () => {
      await this.performHealthCheck();
    });
    this.cronJobs.set('healthCheck', healthCheckJob);

    // Cleanup old data every hour
    const cleanupJob = cron.schedule('0 * * * *', async () => {
      await this.scheduleCleanup();
    });
    this.cronJobs.set('cleanup', cleanupJob);

    // Performance monitoring every 15 minutes
    const performanceJob = cron.schedule('*/15 * * * *', async () => {
      await this.schedulePerformanceMonitoring();
    });
    this.cronJobs.set('performance', performanceJob);

    // Queue monitoring every minute
    const queueJob = cron.schedule('* * * * *', async () => {
      await this.monitorQueues();
    });
    this.cronJobs.set('queue', queueJob);

    this.logger.info('Cron jobs setup completed');
  }

  /**
   * Process crawl job
   */
  private async processCrawlJob(job: Job): Promise<any> {
    const { url, options, crawlId } = job.data;
    const crawlerService = this.services.get('crawler');

    try {
      this.logger.info(`Processing crawl job for ${url}`);

      // Update job progress
      await job.progress(10);

      // Start crawling
      const result = await crawlerService.crawlWebsite(url, options);

      await job.progress(50);

      // Wait for completion
      let crawlData;
      let attempts = 0;
      while (attempts < 60) {
        // 1 minute timeout
        crawlData = await crawlerService.getCrawlResult(result);
        if (crawlData) break;
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      await job.progress(100);

      if (!crawlData) {
        throw new Error('Crawl data not available');
      }

      return crawlData;
    } catch (error) {
      this.logger.error(`Crawl job failed for ${url}:`, error);
      throw error;
    }
  }

  /**
   * Process optimization job
   */
  private async processOptimizationJob(job: Job): Promise<any> {
    const { url, options, optimizationId } = job.data;
    const optimizationEngine = this.services.get('optimization');

    try {
      this.logger.info(`Processing optimization job for ${url}`);

      await job.progress(10);

      // Start optimization
      const result = await optimizationEngine.optimizeWebsite(url, options);

      await job.progress(50);

      // Wait for completion
      let optimizationData;
      let attempts = 0;
      while (attempts < 120) {
        // 2 minute timeout
        optimizationData = await optimizationEngine.getOptimizationResult(result);
        if (optimizationData) break;
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      await job.progress(100);

      if (!optimizationData) {
        throw new Error('Optimization data not available');
      }

      return optimizationData;
    } catch (error) {
      this.logger.error(`Optimization job failed for ${url}:`, error);
      throw error;
    }
  }

  /**
   * Process monitoring job
   */
  private async processMonitoringJob(job: Job): Promise<any> {
    const { type, data } = job.data;

    try {
      switch (type) {
        case 'health-check':
          return await this.performHealthCheck();

        case 'performance-monitor':
          return await this.monitorPerformance(data);

        case 'queue-monitor':
          return await this.monitorQueues();

        default:
          throw new Error(`Unknown monitoring job type: ${type}`);
      }
    } catch (error) {
      this.logger.error(`Monitoring job failed:`, error);
      throw error;
    }
  }

  /**
   * Process cleanup job
   */
  private async processCleanupJob(job: Job): Promise<any> {
    const { type, data } = job.data;

    try {
      switch (type) {
        case 'old-results':
          return await this.cleanupOldResults(data);

        case 'temp-files':
          return await this.cleanupTempFiles();

        case 'browser-instances':
          return await this.cleanupBrowserInstances();

        default:
          throw new Error(`Unknown cleanup job type: ${type}`);
      }
    } catch (error) {
      this.logger.error(`Cleanup job failed:`, error);
      throw error;
    }
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<any> {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      services: {},
      queues: {},
      workers: {},
      system: {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        cpu: process.cpuUsage(),
      },
    };

    // Check services
    for (const [name, service] of this.services) {
      try {
        healthStatus.services[name] = {
          status: 'healthy',
          details: service.getStatus ? service.getStatus() : 'No status available',
        };
      } catch (error) {
        healthStatus.services[name] = {
          status: 'unhealthy',
          error: error.message,
        };
      }
    }

    // Check queues
    for (const [name, queue] of this.queues) {
      try {
        const waiting = await queue.getWaiting();
        const active = await queue.getActive();
        const completed = await queue.getCompleted();
        const failed = await queue.getFailed();

        healthStatus.queues[name] = {
          status: 'healthy',
          counts: {
            waiting: waiting.length,
            active: active.length,
            completed: completed.length,
            failed: failed.length,
          },
        };
      } catch (error) {
        healthStatus.queues[name] = {
          status: 'unhealthy',
          error: error.message,
        };
      }
    }

    // Check workers
    for (const [name, worker] of this.workers) {
      try {
        healthStatus.workers[name] = {
          status: 'healthy',
          isRunning: worker.isRunning(),
        };
      } catch (error) {
        healthStatus.workers[name] = {
          status: 'unhealthy',
          error: error.message,
        };
      }
    }

    // Store health status
    await this.redis.setex('health:status', 300, JSON.stringify(healthStatus));

    this.logger.info('Health check completed');
    return healthStatus;
  }

  /**
   * Monitor performance
   */
  private async monitorPerformance(data: any): Promise<any> {
    const performanceData = {
      timestamp: new Date().toISOString(),
      metrics: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
      },
      services: {},
    };

    // Monitor each service
    for (const [name, service] of this.services) {
      try {
        const status = service.getStatus ? service.getStatus() : {};
        performanceData.services[name] = {
          status: 'monitored',
          metrics: status,
        };
      } catch (error) {
        performanceData.services[name] = {
          status: 'error',
          error: error.message,
        };
      }
    }

    // Store performance data
    await this.redis.setex('performance:latest', 900, JSON.stringify(performanceData));

    this.logger.info('Performance monitoring completed');
    return performanceData;
  }

  /**
   * Monitor queues
   */
  private async monitorQueues(): Promise<any> {
    const queueStatus = {
      timestamp: new Date().toISOString(),
      queues: {},
    };

    for (const [name, queue] of this.queues) {
      try {
        const waiting = await queue.getWaiting();
        const active = await queue.getActive();
        const completed = await queue.getCompleted();
        const failed = await queue.getFailed();

        queueStatus.queues[name] = {
          waiting: waiting.length,
          active: active.length,
          completed: completed.length,
          failed: failed.length,
          total: waiting.length + active.length + completed.length + failed.length,
        };

        // Alert if queue is backed up
        if (waiting.length > 100) {
          this.logger.warn(`Queue ${name} has ${waiting.length} waiting jobs`);
          this.emit('queueBackedUp', { queueName: name, waitingCount: waiting.length });
        }
      } catch (error) {
        this.logger.error(`Failed to monitor queue ${name}:`, error);
      }
    }

    // Store queue status
    await this.redis.setex('queues:status', 60, JSON.stringify(queueStatus));

    return queueStatus;
  }

  /**
   * Schedule cleanup
   */
  private async scheduleCleanup(): Promise<void> {
    const cleanupQueue = this.queues.get('cleanup');
    if (!cleanupQueue) return;

    // Cleanup old results (older than 7 days)
    await cleanupQueue.add('old-results', {
      type: 'old-results',
      data: { olderThan: 7 * 24 * 60 * 60 * 1000 }, // 7 days in milliseconds
    });

    // Cleanup temp files
    await cleanupQueue.add('temp-files', {
      type: 'temp-files',
      data: {},
    });

    // Cleanup browser instances
    await cleanupQueue.add('browser-instances', {
      type: 'browser-instances',
      data: {},
    });

    this.logger.info('Cleanup jobs scheduled');
  }

  /**
   * Schedule performance monitoring
   */
  private async schedulePerformanceMonitoring(): Promise<void> {
    const monitoringQueue = this.queues.get('monitoring');
    if (!monitoringQueue) return;

    await monitoringQueue.add('performance-monitor', {
      type: 'performance-monitor',
      data: {},
    });

    this.logger.info('Performance monitoring scheduled');
  }

  /**
   * Cleanup old results
   */
  private async cleanupOldResults(data: any): Promise<any> {
    const { olderThan } = data;
    const cutoffTime = Date.now() - olderThan;

    // Get all keys with crawl: or optimization: prefix
    const keys = await this.redis.keys('crawl:*');
    const optimizationKeys = await this.redis.keys('optimization:*');
    const allKeys = [...keys, ...optimizationKeys];

    let cleanedCount = 0;
    for (const key of allKeys) {
      try {
        const result = await this.redis.get(key);
        if (result) {
          const data = JSON.parse(result);
          if (data.timestamp && new Date(data.timestamp).getTime() < cutoffTime) {
            await this.redis.del(key);
            cleanedCount++;
          }
        }
      } catch (error) {
        this.logger.error(`Error cleaning up key ${key}:`, error);
      }
    }

    this.logger.info(`Cleaned up ${cleanedCount} old results`);
    return { cleanedCount };
  }

  /**
   * Cleanup temp files
   */
  private async cleanupTempFiles(): Promise<any> {
    // In a real implementation, you would clean up temporary files
    // For now, we'll just log the action
    this.logger.info('Temp files cleanup completed');
    return { status: 'completed' };
  }

  /**
   * Cleanup browser instances
   */
  private async cleanupBrowserInstances(): Promise<any> {
    const headlessService = this.services.get('headless');
    if (headlessService) {
      try {
        await headlessService.cleanup();
        this.logger.info('Browser instances cleaned up');
        return { status: 'completed' };
      } catch (error) {
        this.logger.error('Error cleaning up browser instances:', error);
        throw error;
      }
    }
    return { status: 'no-service' };
  }

  /**
   * Add job to queue
   */
  async addJob(queueName: string, jobType: string, data: any, options: any = {}): Promise<Job> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return await queue.add(jobType, data, options);
  }

  /**
   * Get queue status
   */
  async getQueueStatus(queueName: string): Promise<any> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      total: waiting.length + active.length + completed.length + failed.length,
    };
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      workers: Array.from(this.workers.keys()),
      queues: Array.from(this.queues.keys()),
      services: Array.from(this.services.keys()),
      cronJobs: Array.from(this.cronJobs.keys()),
    };
  }

  /**
   * Cleanup all resources
   */
  async cleanup(): Promise<void> {
    try {
      // Stop cron jobs
      for (const [name, job] of this.cronJobs) {
        job.stop();
        this.logger.info(`Stopped cron job: ${name}`);
      }
      this.cronJobs.clear();

      // Close workers
      for (const [name, worker] of this.workers) {
        await worker.close();
        this.logger.info(`Closed worker: ${name}`);
      }
      this.workers.clear();

      // Close queues
      for (const [name, queue] of this.queues) {
        await queue.close();
        this.logger.info(`Closed queue: ${name}`);
      }
      this.queues.clear();

      // Cleanup services
      for (const [name, service] of this.services) {
        if (service.cleanup) {
          await service.cleanup();
          this.logger.info(`Cleaned up service: ${name}`);
        }
      }
      this.services.clear();

      // Close Redis connection
      await this.redis.quit();

      this.isRunning = false;
      this.logger.info('BackgroundWorkerService cleaned up');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
      throw error;
    }
  }
}

export default BackgroundWorkerService;
