/**
 * 24/7 Continuous Scraping Service with Resource Management
 * 
 * Features:
 * - Continuous scraping with configurable intervals
 * - CPU and memory monitoring
 * - Resource throttling when limits exceeded
 * - No duplicate URL scraping
 * - Database-first architecture
 * - Health monitoring and auto-recovery
 * - Graceful shutdown
 */

import { EventEmitter } from 'events';
import os from 'os';
import pidusage from 'pidusage';
import { Pool } from 'pg';

interface ResourceLimits {
  maxCpuPercent: number;
  maxMemoryMB: number;
  maxConcurrentScrapes: number;
  minDelayMs: number;
  maxDelayMs: number;
}

interface ScrapingJob {
  id: string;
  url: string;
  priority: number;
  metadata?: any;
  retries: number;
  lastError?: string;
}

export class ContinuousScrapingService extends EventEmitter {
  private db: Pool;
  private isRunning: boolean = false;
  private activeJobs: Map<string, any> = new Map();
  private resourceLimits: ResourceLimits;
  private stats = {
    totalScraped: 0,
    successCount: 0,
    errorCount: 0,
    skippedDuplicates: 0,
    throttledCount: 0,
    startTime: Date.now()
  };

  constructor(db: Pool, limits?: Partial<ResourceLimits>) {
    super();
    this.db = db;
    this.resourceLimits = {
      maxCpuPercent: limits?.maxCpuPercent || 70,
      maxMemoryMB: limits?.maxMemoryMB || 2048,
      maxConcurrentScrapes: limits?.maxConcurrentScrapes || 5,
      minDelayMs: limits?.minDelayMs || 1000,
      maxDelayMs: limits?.maxDelayMs || 10000
    };
  }

  /**
   * Start the continuous scraping service
   */
  async start() {
    if (this.isRunning) {
      console.log('Scraping service already running');
      return;
    }

    this.isRunning = true;
    this.stats.startTime = Date.now();
    
    console.log('🚀 Starting 24/7 Scraping Service');
    console.log('Resource Limits:', this.resourceLimits);

    // Setup graceful shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());

    // Start monitoring loop
    this.monitoringLoop();

    // Start scraping loop
    this.scrapingLoop();
  }

  /**
   * Stop the scraping service gracefully
   */
  async stop() {
    if (!this.isRunning) return;

    console.log('🛑 Stopping scraping service...');
    this.isRunning = false;

    // Wait for active jobs to complete
    const timeout = setTimeout(() => {
      console.log('⚠️  Force stopping active jobs');
      this.activeJobs.clear();
    }, 30000); // 30 second timeout

    while (this.activeJobs.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    clearTimeout(timeout);
    console.log('✅ Scraping service stopped');
    this.printStats();
  }

  /**
   * Main scraping loop
   */
  private async scrapingLoop() {
    while (this.isRunning) {
      try {
        // Check resource availability
        const resources = await this.checkResources();
        
        if (!resources.available) {
          this.stats.throttledCount++;
          await this.throttle(resources);
          continue;
        }

        // Get next job from queue
        const job = await this.getNextJob();
        
        if (!job) {
          // No jobs available, wait before checking again
          await new Promise(resolve => setTimeout(resolve, 5000));
          continue;
        }

        // Check if URL was already scraped
        if (await this.isAlreadyScraped(job.url)) {
          this.stats.skippedDuplicates++;
          await this.markJobAsSkipped(job.id, 'Already scraped');
          continue;
        }

        // Execute scraping job
        await this.executeJob(job);

        // Delay between jobs
        await new Promise(resolve => 
          setTimeout(resolve, this.calculateDelay(resources))
        );

      } catch (error) {
        console.error('Error in scraping loop:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  /**
   * Monitoring loop for stats and health
   */
  private async monitoringLoop() {
    while (this.isRunning) {
      try {
        // Print stats every minute
        if (Date.now() - this.stats.startTime > 60000) {
          this.printStats();
          this.stats.startTime = Date.now();
        }

        // Check system health
        const resources = await this.checkResources();
        this.emit('health', {
          resources,
          stats: this.stats,
          activeJobs: this.activeJobs.size
        });

        await new Promise(resolve => setTimeout(resolve, 10000));
      } catch (error) {
        console.error('Error in monitoring loop:', error);
      }
    }
  }

  /**
   * Check system resources
   */
  private async checkResources() {
    try {
      const usage = await pidusage(process.pid);
      const cpuPercent = usage.cpu;
      const memoryMB = usage.memory / 1024 / 1024;
      const totalMemoryMB = os.totalmem() / 1024 / 1024;
      const freeMemoryMB = os.freemem() / 1024 / 1024;

      const available = 
        cpuPercent < this.resourceLimits.maxCpuPercent &&
        memoryMB < this.resourceLimits.maxMemoryMB &&
        this.activeJobs.size < this.resourceLimits.maxConcurrentScrapes;

      return {
        available,
        cpu: cpuPercent,
        memory: memoryMB,
        totalMemory: totalMemoryMB,
        freeMemory: freeMemoryMB,
        activeJobs: this.activeJobs.size
      };
    } catch (error) {
      console.error('Error checking resources:', error);
      return { available: false, cpu: 100, memory: 0, activeJobs: 0 };
    }
  }

  /**
   * Throttle execution when resources are constrained
   */
  private async throttle(resources: any) {
    const reason = !resources.available ? 
      `CPU: ${resources.cpu.toFixed(1)}%, Memory: ${resources.memory.toFixed(0)}MB, Active: ${resources.activeJobs}` :
      'Resource limits exceeded';

    console.log(`⚠️  Throttling: ${reason}`);
    
    // Wait longer when throttled
    await new Promise(resolve => 
      setTimeout(resolve, this.resourceLimits.maxDelayMs)
    );
  }

  /**
   * Calculate delay based on current resources
   */
  private calculateDelay(resources: any): number {
    const { minDelayMs, maxDelayMs } = this.resourceLimits;
    
    // Scale delay based on CPU usage
    const cpuFactor = resources.cpu / 100;
    const delay = minDelayMs + (maxDelayMs - minDelayMs) * cpuFactor;
    
    return Math.floor(delay);
  }

  /**
   * Get next job from database queue
   */
  private async getNextJob(): Promise<ScrapingJob | null> {
    try {
      const result = await this.db.query(`
        SELECT * FROM scraping_queue 
        WHERE status = 'pending' 
        AND (scheduled_at IS NULL OR scheduled_at <= NOW())
        ORDER BY priority DESC, created_at ASC 
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `);

      if (result.rows.length === 0) return null;

      const job = result.rows[0];
      
      // Mark as in-progress
      await this.db.query(
        'UPDATE scraping_queue SET status = $1, started_at = NOW() WHERE id = $2',
        ['in_progress', job.id]
      );

      return {
        id: job.id,
        url: job.url,
        priority: job.priority || 0,
        metadata: job.metadata,
        retries: job.retries || 0,
        lastError: job.last_error
      };
    } catch (error) {
      console.error('Error getting next job:', error);
      return null;
    }
  }

  /**
   * Check if URL was already scraped
   */
  private async isAlreadyScraped(url: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        'SELECT id FROM scraped_urls WHERE url = $1 AND status = $2',
        [url, 'completed']
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error checking if URL scraped:', error);
      return false;
    }
  }

  /**
   * Execute scraping job
   */
  private async executeJob(job: ScrapingJob) {
    const jobId = `job_${Date.now()}_${Math.random()}`;
    this.activeJobs.set(jobId, job);

    try {
      console.log(`🔄 Scraping: ${job.url}`);
      
      // TODO: Implement actual scraping logic
      // This is a placeholder - integrate with your crawler
      const data = await this.scrapeUrl(job.url, job.metadata);

      // Save results
      await this.saveScrapedData(job, data);

      // Mark job as completed
      await this.markJobAsCompleted(job.id);

      this.stats.successCount++;
      this.stats.totalScraped++;
      
      console.log(`✅ Completed: ${job.url}`);
      this.emit('jobCompleted', { job, data });

    } catch (error) {
      console.error(`❌ Error scraping ${job.url}:`, error);
      
      // Handle retry logic
      if (job.retries < 3) {
        await this.requeueJob(job, error.message);
      } else {
        await this.markJobAsFailed(job.id, error.message);
      }

      this.stats.errorCount++;
      this.emit('jobFailed', { job, error });

    } finally {
      this.activeJobs.delete(jobId);
    }
  }

  /**
   * Actual scraping implementation
   */
  private async scrapeUrl(url: string, metadata?: any): Promise<any> {
    // TODO: Implement with Puppeteer/Playwright
    // For now, returning mock data
    return {
      url,
      title: 'Sample Title',
      content: 'Sample content',
      metadata,
      scrapedAt: new Date()
    };
  }

  /**
   * Save scraped data to database
   */
  private async saveScrapedData(job: ScrapingJob, data: any) {
    await this.db.query(`
      INSERT INTO scraped_data (url, data, scraped_at, job_id)
      VALUES ($1, $2, NOW(), $3)
      ON CONFLICT (url) DO UPDATE SET 
        data = $2,
        scraped_at = NOW(),
        update_count = scraped_data.update_count + 1
    `, [job.url, JSON.stringify(data), job.id]);

    await this.db.query(`
      INSERT INTO scraped_urls (url, status, completed_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (url) DO UPDATE SET
        status = $2,
        completed_at = NOW()
    `, [job.url, 'completed']);
  }

  /**
   * Mark job as completed
   */
  private async markJobAsCompleted(jobId: string) {
    await this.db.query(`
      UPDATE scraping_queue 
      SET status = $1, completed_at = NOW()
      WHERE id = $2
    `, ['completed', jobId]);
  }

  /**
   * Mark job as skipped
   */
  private async markJobAsSkipped(jobId: string, reason: string) {
    await this.db.query(`
      UPDATE scraping_queue 
      SET status = $1, completed_at = NOW(), notes = $2
      WHERE id = $3
    `, ['skipped', reason, jobId]);
  }

  /**
   * Mark job as failed
   */
  private async markJobAsFailed(jobId: string, error: string) {
    await this.db.query(`
      UPDATE scraping_queue 
      SET status = $1, last_error = $2, completed_at = NOW()
      WHERE id = $3
    `, ['failed', error, jobId]);
  }

  /**
   * Requeue job for retry
   */
  private async requeueJob(job: ScrapingJob, error: string) {
    await this.db.query(`
      UPDATE scraping_queue 
      SET status = $1, retries = $2, last_error = $3, 
          scheduled_at = NOW() + INTERVAL '5 minutes'
      WHERE id = $4
    `, ['pending', job.retries + 1, error, job.id]);
  }

  /**
   * Print statistics
   */
  private printStats() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Scraping Statistics');
    console.log('='.repeat(60));
    console.log(`Total Scraped: ${this.stats.totalScraped}`);
    console.log(`Successful: ${this.stats.successCount}`);
    console.log(`Errors: ${this.stats.errorCount}`);
    console.log(`Skipped Duplicates: ${this.stats.skippedDuplicates}`);
    console.log(`Throttled: ${this.stats.throttledCount}`);
    console.log(`Active Jobs: ${this.activeJobs.size}`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Get current statistics
   */
  getStats() {
    return {
      ...this.stats,
      activeJobs: this.activeJobs.size,
      uptime: Date.now() - this.stats.startTime
    };
  }
}

// CLI usage
if (require.main === module) {
  const db = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'lightdom',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  });

  const service = new ContinuousScrapingService(db, {
    maxCpuPercent: parseInt(process.env.MAX_CPU_PERCENT || '70'),
    maxMemoryMB: parseInt(process.env.MAX_MEMORY_MB || '2048'),
    maxConcurrentScrapes: parseInt(process.env.MAX_CONCURRENT || '5')
  });

  service.start().catch(console.error);
}
