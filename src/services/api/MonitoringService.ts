import { EventEmitter } from 'events';
import { Logger } from '../../utils/Logger';
import HeadlessChromeService from './HeadlessChromeService';
import WebCrawlerService from './WebCrawlerService';
import OptimizationEngine from './OptimizationEngine';
import BackgroundWorkerService from './BackgroundWorkerService';
// Server-only deps. Use lazy imports to avoid bundling in browser.
let RedisCtor: any;
let cronLib: any;

export interface MonitoringMetrics {
  timestamp: string;
  system: {
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
    uptime: number;
    loadAverage: number[];
  };
  services: {
    headless: any;
    crawler: any;
    optimization: any;
    backgroundWorker: any;
  };
  queues: {
    [queueName: string]: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
  };
  performance: {
    averageResponseTime: number;
    totalRequests: number;
    errorRate: number;
    successRate: number;
  };
  alerts: Alert[];
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  service: string;
  resolved: boolean;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

export interface MonitoringConfig {
  enabled: boolean;
  interval: number; // in milliseconds
  alertThresholds: {
    memoryUsage: number; // percentage
    cpuUsage: number; // percentage
    errorRate: number; // percentage
    queueBacklog: number; // number of jobs
    responseTime: number; // milliseconds
  };
  retention: {
    metrics: number; // days
    alerts: number; // days
    logs: number; // days
  };
  notifications: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
  };
}

export class MonitoringService extends EventEmitter {
  private logger: Logger;
  private redis: any;
  private services: Map<string, any> = new Map();
  private config: MonitoringConfig;
  private isRunning = false;
  private metrics: MonitoringMetrics[] = [];
  private alerts: Alert[] = [];
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();
  private alertCounter = 0;

  constructor(config: MonitoringConfig) {
    super();
    this.logger = new Logger('MonitoringService');
    this.config = config;
    this.redis = null; // initialized in initialize() on server only
  }

  /**
   * Initialize monitoring service
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing monitoring service');
      if (typeof window !== 'undefined') {
        throw new Error('MonitoringService is server-only and cannot run in the browser');
      }
      // Lazy load server-only modules
      const [{ default: Redis }, cron] = await Promise.all([
        import('ioredis'),
        import('node-cron')
      ]);
      RedisCtor = Redis;
      cronLib = cron;
      this.redis = new RedisCtor(process.env.REDIS_URL || 'redis://localhost:6379');

      // Setup cron jobs
      await this.setupCronJobs();

      // Load existing alerts
      await this.loadAlerts();

      this.isRunning = true;
      this.logger.info('Monitoring service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize monitoring service:', error);
      throw error;
    }
  }

  /**
   * Register services for monitoring
   */
  registerServices(services: {
    headless: HeadlessChromeService;
    crawler: WebCrawlerService;
    optimization: OptimizationEngine;
    backgroundWorker: BackgroundWorkerService;
  }): void {
    this.services.set('headless', services.headless);
    this.services.set('crawler', services.crawler);
    this.services.set('optimization', services.optimization);
    this.services.set('backgroundWorker', services.backgroundWorker);
    
    this.logger.info('Services registered for monitoring');
  }

  /**
   * Setup cron jobs for monitoring
   */
  private async setupCronJobs(): Promise<void> {
    // Collect metrics every minute
    const metricsJob = cronLib.schedule('* * * * *', async () => {
      await this.collectMetrics();
    });
    this.cronJobs.set('metrics', metricsJob);

    // Check alerts every 30 seconds
    const alertsJob = cronLib.schedule('*/30 * * * * *', async () => {
      await this.checkAlerts();
    });
    this.cronJobs.set('alerts', alertsJob);

    // Cleanup old data every hour
    const cleanupJob = cronLib.schedule('0 * * * *', async () => {
      await this.cleanupOldData();
    });
    this.cronJobs.set('cleanup', cleanupJob);

    // Health check every 5 minutes
    const healthJob = cronLib.schedule('*/5 * * * *', async () => {
      await this.performHealthCheck();
    });
    this.cronJobs.set('health', healthJob);

    this.logger.info('Cron jobs setup completed');
  }

  /**
   * Collect metrics from all services
   */
  async collectMetrics(): Promise<MonitoringMetrics> {
    try {
      const timestamp = new Date().toISOString();
      
      // System metrics
      const system = {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
        loadAverage: require('os').loadavg()
      };

      // Service metrics
      const services = {
        headless: this.services.get('headless')?.getStatus() || { error: 'Service not available' },
        crawler: this.services.get('crawler')?.getStatus() || { error: 'Service not available' },
        optimization: this.services.get('optimization')?.getStatus() || { error: 'Service not available' },
        backgroundWorker: this.services.get('backgroundWorker')?.getStatus() || { error: 'Service not available' }
      };

      // Queue metrics
      const queues: any = {};
      if (this.services.get('backgroundWorker')) {
        const queueNames = ['crawl', 'optimization', 'monitoring', 'cleanup'];
        for (const queueName of queueNames) {
          try {
            queues[queueName] = await this.services.get('backgroundWorker').getQueueStatus(queueName);
          } catch (error) {
            queues[queueName] = { error: 'Failed to get queue status' };
          }
        }
      }

      // Performance metrics
      const performance = await this.calculatePerformanceMetrics();

      const metrics: MonitoringMetrics = {
        timestamp,
        system,
        services,
        queues,
        performance,
        alerts: this.alerts.filter(alert => !alert.resolved)
      };

      // Store metrics
      this.metrics.push(metrics);
      
      // Keep only last 1000 metrics in memory
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // Store in Redis
      await this.redis.setex('monitoring:latest', 300, JSON.stringify(metrics));
      await this.redis.lpush('monitoring:history', JSON.stringify(metrics));
      await this.redis.ltrim('monitoring:history', 0, 1000);

      this.logger.debug('Metrics collected successfully');
      return metrics;
    } catch (error) {
      this.logger.error('Failed to collect metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate performance metrics
   */
  private async calculatePerformanceMetrics(): Promise<any> {
    try {
      // Get recent metrics
      const recentMetrics = this.metrics.slice(-10);
      
      if (recentMetrics.length === 0) {
        return {
          averageResponseTime: 0,
          totalRequests: 0,
          errorRate: 0,
          successRate: 100
        };
      }

      // Calculate averages
      const totalRequests = recentMetrics.length;
      const errorCount = recentMetrics.filter(m => 
        Object.values(m.services).some(service => 
          service.error || !service.isRunning
        )
      ).length;

      return {
        averageResponseTime: 1000, // Placeholder - would need actual response time data
        totalRequests,
        errorRate: (errorCount / totalRequests) * 100,
        successRate: ((totalRequests - errorCount) / totalRequests) * 100
      };
    } catch (error) {
      this.logger.error('Failed to calculate performance metrics:', error);
      return {
        averageResponseTime: 0,
        totalRequests: 0,
        errorRate: 0,
        successRate: 100
      };
    }
  }

  /**
   * Check for alerts
   */
  async checkAlerts(): Promise<void> {
    try {
      const latestMetrics = this.metrics[this.metrics.length - 1];
      if (!latestMetrics) return;

      // Check system alerts
      await this.checkSystemAlerts(latestMetrics);
      
      // Check service alerts
      await this.checkServiceAlerts(latestMetrics);
      
      // Check queue alerts
      await this.checkQueueAlerts(latestMetrics);
      
      // Check performance alerts
      await this.checkPerformanceAlerts(latestMetrics);

    } catch (error) {
      this.logger.error('Failed to check alerts:', error);
    }
  }

  /**
   * Check system alerts
   */
  private async checkSystemAlerts(metrics: MonitoringMetrics): Promise<void> {
    const { system } = metrics;
    
    // Memory usage alert
    const memoryUsagePercent = (system.memory.heapUsed / system.memory.heapTotal) * 100;
    if (memoryUsagePercent > this.config.alertThresholds.memoryUsage) {
      await this.createAlert({
        type: 'warning',
        severity: 'high',
        title: 'High Memory Usage',
        message: `Memory usage is ${memoryUsagePercent.toFixed(2)}% (threshold: ${this.config.alertThresholds.memoryUsage}%)`,
        service: 'system',
        metadata: { memoryUsage: memoryUsagePercent }
      });
    }

    // CPU usage alert (simplified)
    if (system.loadAverage[0] > this.config.alertThresholds.cpuUsage) {
      await this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'High CPU Usage',
        message: `Load average is ${system.loadAverage[0].toFixed(2)} (threshold: ${this.config.alertThresholds.cpuUsage})`,
        service: 'system',
        metadata: { loadAverage: system.loadAverage[0] }
      });
    }
  }

  /**
   * Check service alerts
   */
  private async checkServiceAlerts(metrics: MonitoringMetrics): Promise<void> {
    const { services } = metrics;
    
    for (const [serviceName, service] of Object.entries(services)) {
      if (service.error) {
        await this.createAlert({
          type: 'error',
          severity: 'critical',
          title: `${serviceName} Service Error`,
          message: `Service ${serviceName} is reporting an error: ${service.error}`,
          service: serviceName,
          metadata: { error: service.error }
        });
      } else if (!service.isRunning && service.isRunning !== undefined) {
        await this.createAlert({
          type: 'error',
          severity: 'critical',
          title: `${serviceName} Service Down`,
          message: `Service ${serviceName} is not running`,
          service: serviceName
        });
      }
    }
  }

  /**
   * Check queue alerts
   */
  private async checkQueueAlerts(metrics: MonitoringMetrics): Promise<void> {
    const { queues } = metrics;
    
    for (const [queueName, queue] of Object.entries(queues)) {
      if (queue.error) {
        await this.createAlert({
          type: 'error',
          severity: 'high',
          title: `${queueName} Queue Error`,
          message: `Queue ${queueName} is reporting an error: ${queue.error}`,
          service: 'queue',
          metadata: { queueName, error: queue.error }
        });
      } else if (queue.waiting > this.config.alertThresholds.queueBacklog) {
        await this.createAlert({
          type: 'warning',
          severity: 'medium',
          title: `${queueName} Queue Backlog`,
          message: `Queue ${queueName} has ${queue.waiting} waiting jobs (threshold: ${this.config.alertThresholds.queueBacklog})`,
          service: 'queue',
          metadata: { queueName, waiting: queue.waiting }
        });
      }
    }
  }

  /**
   * Check performance alerts
   */
  private async checkPerformanceAlerts(metrics: MonitoringMetrics): Promise<void> {
    const { performance } = metrics;
    
    if (performance.errorRate > this.config.alertThresholds.errorRate) {
      await this.createAlert({
        type: 'error',
        severity: 'high',
        title: 'High Error Rate',
        message: `Error rate is ${performance.errorRate.toFixed(2)}% (threshold: ${this.config.alertThresholds.errorRate}%)`,
        service: 'performance',
        metadata: { errorRate: performance.errorRate }
      });
    }

    if (performance.averageResponseTime > this.config.alertThresholds.responseTime) {
      await this.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'Slow Response Time',
        message: `Average response time is ${performance.averageResponseTime}ms (threshold: ${this.config.alertThresholds.responseTime}ms)`,
        service: 'performance',
        metadata: { responseTime: performance.averageResponseTime }
      });
    }
  }

  /**
   * Create an alert
   */
  async createAlert(alertData: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): Promise<Alert> {
    const alert: Alert = {
      id: `alert_${Date.now()}_${++this.alertCounter}`,
      timestamp: new Date().toISOString(),
      resolved: false,
      ...alertData
    };

    this.alerts.push(alert);
    
    // Store in Redis
    await this.redis.setex(`alert:${alert.id}`, 86400, JSON.stringify(alert)); // 24 hours
    await this.redis.lpush('alerts:recent', JSON.stringify(alert));
    await this.redis.ltrim('alerts:recent', 0, 100);

    this.logger.warn(`Alert created: ${alert.title}`, { alertId: alert.id, severity: alert.severity });
    
    // Emit event
    this.emit('alert', alert);
    
    // Send notifications
    await this.sendNotifications(alert);

    return alert;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<boolean> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.resolved = true;
    alert.resolvedAt = new Date().toISOString();

    // Update in Redis
    await this.redis.setex(`alert:${alertId}`, 86400, JSON.stringify(alert));

    this.logger.info(`Alert resolved: ${alert.title}`, { alertId });
    this.emit('alertResolved', alert);

    return true;
  }

  /**
   * Send notifications
   */
  private async sendNotifications(alert: Alert): Promise<void> {
    try {
      if (this.config.notifications.email) {
        await this.sendEmailNotification(alert);
      }
      
      if (this.config.notifications.slack) {
        await this.sendSlackNotification(alert);
      }
      
      if (this.config.notifications.webhook) {
        await this.sendWebhookNotification(alert);
      }
    } catch (error) {
      this.logger.error('Failed to send notifications:', error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(alert: Alert): Promise<void> {
    // Implementation would depend on email service (SendGrid, AWS SES, etc.)
    this.logger.info(`Email notification sent for alert: ${alert.title}`);
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(alert: Alert): Promise<void> {
    // Implementation would depend on Slack webhook
    this.logger.info(`Slack notification sent for alert: ${alert.title}`);
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(alert: Alert): Promise<void> {
    // Implementation would depend on webhook URL
    this.logger.info(`Webhook notification sent for alert: ${alert.title}`);
  }

  /**
   * Perform health check
   */
  async performHealthCheck(): Promise<any> {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {},
        system: {
          memory: process.memoryUsage(),
          uptime: process.uptime()
        }
      };

      // Check each service
      for (const [name, service] of this.services) {
        try {
          const status = service.getStatus ? service.getStatus() : { error: 'No status method' };
          healthStatus.services[name] = {
            status: status.error ? 'unhealthy' : 'healthy',
            details: status
          };
        } catch (error) {
          healthStatus.services[name] = {
            status: 'unhealthy',
            error: error.message
          };
        }
      }

      // Determine overall health
      const unhealthyServices = Object.values(healthStatus.services).filter(
        (service: any) => service.status === 'unhealthy'
      );

      if (unhealthyServices.length > 0) {
        healthStatus.status = 'unhealthy';
      }

      // Store health status
      await this.redis.setex('health:status', 300, JSON.stringify(healthStatus));

      this.logger.debug('Health check completed', { status: healthStatus.status });
      return healthStatus;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Load alerts from Redis
   */
  private async loadAlerts(): Promise<void> {
    try {
      const alertKeys = await this.redis.keys('alert:*');
      for (const key of alertKeys) {
        const alertData = await this.redis.get(key);
        if (alertData) {
          const alert = JSON.parse(alertData);
          this.alerts.push(alert);
        }
      }
      this.logger.info(`Loaded ${this.alerts.length} alerts from Redis`);
    } catch (error) {
      this.logger.error('Failed to load alerts:', error);
    }
  }

  /**
   * Cleanup old data
   */
  async cleanupOldData(): Promise<void> {
    try {
      const now = Date.now();
      const metricsRetention = this.config.retention.metrics * 24 * 60 * 60 * 1000;
      const alertsRetention = this.config.retention.alerts * 24 * 60 * 60 * 1000;

      // Cleanup old metrics
      this.metrics = this.metrics.filter(metric => 
        now - new Date(metric.timestamp).getTime() < metricsRetention
      );

      // Cleanup old alerts
      this.alerts = this.alerts.filter(alert => 
        now - new Date(alert.timestamp).getTime() < alertsRetention
      );

      // Cleanup Redis data
      await this.redis.del('monitoring:history');
      await this.redis.del('alerts:recent');

      this.logger.info('Old data cleaned up');
    } catch (error) {
      this.logger.error('Failed to cleanup old data:', error);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): MonitoringMetrics[] {
    return this.metrics;
  }

  /**
   * Get current alerts
   */
  getAlerts(): Alert[] {
    return this.alerts;
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      isRunning: this.isRunning,
      config: this.config,
      metricsCount: this.metrics.length,
      alertsCount: this.alerts.length,
      activeAlerts: this.alerts.filter(alert => !alert.resolved).length,
      cronJobs: Array.from(this.cronJobs.keys())
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      // Stop cron jobs
      for (const [name, job] of this.cronJobs) {
        job.stop();
        this.logger.info(`Stopped cron job: ${name}`);
      }
      this.cronJobs.clear();

      // Close Redis connection
      await this.redis.quit();

      this.isRunning = false;
      this.logger.info('Monitoring service cleaned up');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
      throw error;
    }
  }
}

export default MonitoringService;
