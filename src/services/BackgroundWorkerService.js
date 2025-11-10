/**
 * Background Worker Service
 * Handles background tasks for LightDom application
 * - Database maintenance
 * - Cache cleanup
 * - Scheduled crawling jobs
 * - Optimization tasks
 * - Metrics aggregation
 */

import { Pool } from 'pg';
import { createClient } from 'redis';
import winston from 'winston';

class BackgroundWorkerService {
  constructor() {
    this.isRunning = false;
    this.dbDisabled = process.env.DB_DISABLED === 'true';

    // Setup logger
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({ filename: 'logs/worker.log' })
      ]
    });

    // Database connection pool
    this.db = this.dbDisabled
      ? {
          query: async () => ({ rows: [], rowCount: 0 }),
          end: async () => {}
        }
      : new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          database: process.env.DB_NAME || 'dom_space_harvester', || 'lightdom_blockchain',
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        });

    // Redis client
    this.redis = null;

    // Task intervals
    this.intervals = new Map();

    // Setup graceful shutdown
    this.setupShutdownHandlers();
  }

  setupShutdownHandlers() {
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught Exception:', error);
      this.shutdown();
    });
    process.on('unhandledRejection', (reason) => {
      this.logger.error('Unhandled Rejection:', reason);
      this.shutdown();
    });
  }

  async start() {
    this.logger.info('Starting Background Worker Service...');

    try {
      // Initialize Redis
      await this.initializeRedis();

      // Test database connection
      if (!this.dbDisabled) {
        await this.testDatabaseConnection();
      }

      // Start background tasks
      this.startDatabaseMaintenance();
      this.startCacheCleanup();
      this.startMetricsAggregation();
      this.startOptimizationTasks();

      this.isRunning = true;
      this.logger.info('Background Worker Service started successfully');

      // Keep the process alive
      await this.keepAlive();

    } catch (error) {
      this.logger.error('Failed to start Background Worker Service:', error);
      await this.shutdown();
      process.exit(1);
    }
  }

  async initializeRedis() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.logger.info(`Connecting to Redis: ${redisUrl}`);

    try {
      this.redis = createClient({
        url: redisUrl,
        password: process.env.REDIS_PASSWORD || undefined
      });

      this.redis.on('error', (err) => {
        this.logger.error('Redis error:', err);
      });

      this.redis.on('connect', () => {
        this.logger.info('Connected to Redis');
      });

      await this.redis.connect();
    } catch (error) {
      this.logger.warn('Redis connection failed, continuing without cache:', error.message);
      this.redis = null;
    }
  }

  async testDatabaseConnection() {
    try {
      const result = await this.db.query('SELECT NOW()');
      this.logger.info('Database connection successful:', result.rows[0].now);
    } catch (error) {
      this.logger.error('Database connection failed:', error.message);
      throw error;
    }
  }

  startDatabaseMaintenance() {
    if (this.dbDisabled) return;

    this.logger.info('Starting database maintenance tasks');

    // Run every hour
    const interval = setInterval(async () => {
      try {
        this.logger.info('Running database maintenance...');

        // Vacuum analyze to optimize query performance
        await this.db.query('VACUUM ANALYZE');

        // Clean up old session data (older than 30 days)
        await this.db.query(`
          DELETE FROM sessions
          WHERE created_at < NOW() - INTERVAL '30 days'
        `).catch(() => {
          // Table might not exist
        });

        // Clean up expired cache entries
        await this.db.query(`
          DELETE FROM cache
          WHERE expires_at < NOW()
        `).catch(() => {
          // Table might not exist
        });

        this.logger.info('Database maintenance completed');
      } catch (error) {
        this.logger.error('Database maintenance error:', error.message);
      }
    }, 60 * 60 * 1000); // Every hour

    this.intervals.set('database-maintenance', interval);
  }

  startCacheCleanup() {
    if (!this.redis) return;

    this.logger.info('Starting cache cleanup tasks');

    // Run every 15 minutes
    const interval = setInterval(async () => {
      try {
        this.logger.info('Running cache cleanup...');

        // Get all keys
        const keys = await this.redis.keys('*');
        let cleaned = 0;

        for (const key of keys) {
          // Check TTL
          const ttl = await this.redis.ttl(key);

          // If expired or no TTL set and key is old, delete it
          if (ttl === -2 || (ttl === -1 && key.includes('temp'))) {
            await this.redis.del(key);
            cleaned++;
          }
        }

        this.logger.info(`Cache cleanup completed. Removed ${cleaned} keys`);
      } catch (error) {
        this.logger.error('Cache cleanup error:', error.message);
      }
    }, 15 * 60 * 1000); // Every 15 minutes

    this.intervals.set('cache-cleanup', interval);
  }

  startMetricsAggregation() {
    this.logger.info('Starting metrics aggregation tasks');

    // Run every 5 minutes
    const interval = setInterval(async () => {
      try {
        this.logger.info('Aggregating metrics...');

        if (!this.dbDisabled) {
          // Aggregate hourly metrics
          await this.db.query(`
            INSERT INTO metrics_hourly (hour, metric_type, value, aggregated_at)
            SELECT
              date_trunc('hour', created_at) as hour,
              metric_type,
              AVG(value) as value,
              NOW() as aggregated_at
            FROM metrics
            WHERE created_at >= NOW() - INTERVAL '1 hour'
              AND created_at < date_trunc('hour', NOW())
            GROUP BY date_trunc('hour', created_at), metric_type
            ON CONFLICT (hour, metric_type) DO UPDATE
            SET value = EXCLUDED.value, aggregated_at = EXCLUDED.aggregated_at
          `).catch(() => {
            // Tables might not exist
          });
        }

        if (this.redis) {
          // Store aggregated metrics in Redis for quick access
          const timestamp = Date.now();
          await this.redis.set(
            `metrics:latest:${timestamp}`,
            JSON.stringify({
              timestamp,
              uptime: process.uptime(),
              memory: process.memoryUsage(),
              cpu: process.cpuUsage()
            }),
            { EX: 3600 } // Expire in 1 hour
          );
        }

        this.logger.info('Metrics aggregation completed');
      } catch (error) {
        this.logger.error('Metrics aggregation error:', error.message);
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    this.intervals.set('metrics-aggregation', interval);
  }

  startOptimizationTasks() {
    this.logger.info('Starting optimization tasks');

    // Run every 30 minutes
    const interval = setInterval(async () => {
      try {
        this.logger.info('Running optimization tasks...');

        if (!this.dbDisabled) {
          // Find and process pending optimization jobs
          const result = await this.db.query(`
            SELECT * FROM optimization_queue
            WHERE status = 'pending'
            ORDER BY created_at ASC
            LIMIT 10
          `).catch(() => ({ rows: [] }));

          for (const job of result.rows) {
            await this.processOptimizationJob(job);
          }
        }

        this.logger.info('Optimization tasks completed');
      } catch (error) {
        this.logger.error('Optimization tasks error:', error.message);
      }
    }, 30 * 60 * 1000); // Every 30 minutes

    this.intervals.set('optimization-tasks', interval);
  }

  async processOptimizationJob(job) {
    try {
      this.logger.info(`Processing optimization job: ${job.id}`);

      // Update status to processing
      if (!this.dbDisabled) {
        await this.db.query(
          'UPDATE optimization_queue SET status = $1, started_at = NOW() WHERE id = $2',
          ['processing', job.id]
        );

        // Simulate optimization work
        // In real implementation, this would call actual optimization logic
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update status to completed
        await this.db.query(
          'UPDATE optimization_queue SET status = $1, completed_at = NOW() WHERE id = $2',
          ['completed', job.id]
        );
      }

      this.logger.info(`Completed optimization job: ${job.id}`);
    } catch (error) {
      this.logger.error(`Failed to process optimization job ${job.id}:`, error.message);

      if (!this.dbDisabled) {
        await this.db.query(
          'UPDATE optimization_queue SET status = $1, error = $2 WHERE id = $3',
          ['failed', error.message, job.id]
        );
      }
    }
  }

  async keepAlive() {
    return new Promise((resolve) => {
      // Health check interval
      const healthCheck = setInterval(async () => {
        if (!this.isRunning) {
          clearInterval(healthCheck);
          resolve();
          return;
        }

        // Log health status
        this.logger.debug('Background worker is running', {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          activeIntervals: this.intervals.size
        });
      }, 60000); // Every minute
    });
  }

  async shutdown() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.logger.info('Shutting down Background Worker Service...');

    // Clear all intervals
    for (const [name, interval] of this.intervals) {
      this.logger.info(`Stopping ${name}...`);
      clearInterval(interval);
    }
    this.intervals.clear();

    // Close Redis connection
    if (this.redis) {
      await this.redis.quit();
      this.logger.info('Redis connection closed');
    }

    // Close database connection
    if (!this.dbDisabled) {
      await this.db.end();
      this.logger.info('Database connection closed');
    }

    this.logger.info('Background Worker Service shutdown complete');
    process.exit(0);
  }
}

// Start the worker
const worker = new BackgroundWorkerService();
worker.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export default BackgroundWorkerService;
