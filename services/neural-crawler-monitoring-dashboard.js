/**
 * Neural Crawler Monitoring Dashboard
 * 
 * Comprehensive monitoring and observability for:
 * - Campaign health and performance
 * - Neural network training metrics
 * - Data stream throughput
 * - Crawler activity and errors
 * - System resource usage
 */

import EventEmitter from 'events';
import { Pool } from 'pg';

class NeuralCrawlerMonitoringDashboard extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      updateInterval: config.updateInterval || 5000,
      historyRetention: config.historyRetention || 86400000, // 24 hours
      alertThresholds: {
        errorRate: config.errorRateThreshold || 0.1, // 10%
        crawlSpeed: config.crawlSpeedThreshold || 10, // URLs per minute
        modelAccuracy: config.modelAccuracyThreshold || 0.7,
        systemHealth: config.systemHealthThreshold || 0.8,
        ...config.alertThresholds
      },
      enableAlerts: config.enableAlerts !== false,
      enableMetrics: config.enableMetrics !== false,
      ...config
    };

    this.db = config.db || new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20
    });

    // Monitoring state
    this.metrics = {
      campaigns: {
        total: 0,
        active: 0,
        paused: 0,
        completed: 0
      },
      crawlers: {
        active: 0,
        idle: 0,
        errors: 0,
        urlsPerMinute: 0,
        averageResponseTime: 0
      },
      neuralNetworks: {
        instances: 0,
        training: 0,
        averageAccuracy: 0,
        totalTrainings: 0
      },
      dataStreams: {
        active: 0,
        messagesPerSecond: 0,
        totalMessages: 0,
        errors: 0
      },
      system: {
        health: 'healthy',
        uptime: 0,
        memoryUsage: 0,
        cpuUsage: 0
      }
    };

    this.alerts = [];
    this.metricsHistory = [];
    this.isRunning = false;
  }

  /**
   * Initialize monitoring dashboard
   */
  async initialize() {
    console.log('📊 Initializing Neural Crawler Monitoring Dashboard...');
    
    try {
      // Initialize database tables
      await this.initializeDatabase();
      
      // Load historical data
      await this.loadHistoricalMetrics();
      
      // Start monitoring
      this.startMonitoring();
      
      this.isRunning = true;
      
      console.log('✅ Monitoring Dashboard initialized');
      console.log(`   Update interval: ${this.config.updateInterval}ms`);
      console.log(`   Alerts: ${this.config.enableAlerts ? 'Enabled' : 'Disabled'}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to initialize monitoring:', error);
      throw error;
    }
  }

  /**
   * Initialize database tables
   */
  async initializeDatabase() {
    const migrations = [
      // Monitoring metrics table
      `CREATE TABLE IF NOT EXISTS monitoring_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category VARCHAR(50) NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        metric_value FLOAT NOT NULL,
        metadata JSONB,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_category_metric (category, metric_name),
        INDEX idx_recorded_at (recorded_at)
      )`,
      
      // Monitoring alerts table
      `CREATE TABLE IF NOT EXISTS monitoring_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        alert_type VARCHAR(50) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB,
        resolved BOOLEAN DEFAULT false,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_alert_type (alert_type),
        INDEX idx_severity (severity),
        INDEX idx_resolved (resolved)
      )`,
      
      // System health checks table
      `CREATE TABLE IF NOT EXISTS system_health_checks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        component VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL,
        response_time_ms INTEGER,
        error_message TEXT,
        checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_component (component),
        INDEX idx_status (status),
        INDEX idx_checked_at (checked_at)
      )`
    ];

    for (const migration of migrations) {
      try {
        await this.db.query(migration);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('Migration error:', error);
        }
      }
    }
  }

  /**
   * Load historical metrics
   */
  async loadHistoricalMetrics() {
    try {
      const cutoff = new Date(Date.now() - this.config.historyRetention);
      
      const result = await this.db.query(
        `SELECT * FROM monitoring_metrics 
         WHERE recorded_at > $1 
         ORDER BY recorded_at DESC 
         LIMIT 1000`,
        [cutoff]
      );

      this.metricsHistory = result.rows;
      
      console.log(`   Loaded ${result.rows.length} historical metrics`);
    } catch (error) {
      console.error('Failed to load historical metrics:', error);
    }
  }

  /**
   * Start monitoring loop
   */
  startMonitoring() {
    console.log('🔄 Starting monitoring loop...');
    
    this.monitoringInterval = setInterval(async () => {
      await this.updateMetrics();
      await this.checkAlerts();
      this.emit('metricsUpdated', this.metrics);
    }, this.config.updateInterval);
  }

  /**
   * Update all metrics
   */
  async updateMetrics() {
    const startTime = Date.now();
    
    try {
      // Update campaign metrics
      await this.updateCampaignMetrics();
      
      // Update crawler metrics
      await this.updateCrawlerMetrics();
      
      // Update neural network metrics
      await this.updateNeuralNetworkMetrics();
      
      // Update data stream metrics
      await this.updateDataStreamMetrics();
      
      // Update system metrics
      await this.updateSystemMetrics();
      
      // Save to history
      this.metricsHistory.unshift({
        timestamp: new Date().toISOString(),
        metrics: { ...this.metrics },
        updateTime: Date.now() - startTime
      });
      
      // Trim history
      if (this.metricsHistory.length > 1000) {
        this.metricsHistory = this.metricsHistory.slice(0, 1000);
      }
      
      // Save to database
      await this.saveMetricsToDatabase();
      
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }

  /**
   * Update campaign metrics
   */
  async updateCampaignMetrics() {
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
          COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
        FROM seo_campaigns
      `);

      if (result.rows.length > 0) {
        this.metrics.campaigns = {
          total: parseInt(result.rows[0].total),
          active: parseInt(result.rows[0].active),
          paused: parseInt(result.rows[0].paused),
          completed: parseInt(result.rows[0].completed)
        };
      }
    } catch (error) {
      console.error('Failed to update campaign metrics:', error);
    }
  }

  /**
   * Update crawler metrics
   */
  async updateCrawlerMetrics() {
    try {
      // Active crawlers
      const activeResult = await this.db.query(`
        SELECT COUNT(*) as count 
        FROM seo_campaign_urls 
        WHERE status = 'crawling'
      `);

      // Error count
      const errorResult = await this.db.query(`
        SELECT COUNT(*) as count 
        FROM seo_campaign_urls 
        WHERE status = 'error'
        AND last_crawl_at > NOW() - INTERVAL '1 hour'
      `);

      // URLs per minute (last 5 minutes)
      const rateResult = await this.db.query(`
        SELECT COUNT(*) as count 
        FROM seo_campaign_urls 
        WHERE status = 'completed'
        AND last_crawl_at > NOW() - INTERVAL '5 minutes'
      `);

      this.metrics.crawlers.active = parseInt(activeResult.rows[0]?.count || 0);
      this.metrics.crawlers.errors = parseInt(errorResult.rows[0]?.count || 0);
      this.metrics.crawlers.urlsPerMinute = Math.round(
        parseInt(rateResult.rows[0]?.count || 0) / 5
      );
    } catch (error) {
      console.error('Failed to update crawler metrics:', error);
    }
  }

  /**
   * Update neural network metrics
   */
  async updateNeuralNetworkMetrics() {
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(*) as instances,
          AVG(accuracy) as avg_accuracy,
          COUNT(CASE WHEN last_trained_at > NOW() - INTERVAL '1 hour' THEN 1 END) as training
        FROM neural_crawler_instances
        WHERE status != 'terminated'
      `);

      if (result.rows.length > 0) {
        this.metrics.neuralNetworks.instances = parseInt(result.rows[0].instances);
        this.metrics.neuralNetworks.averageAccuracy = parseFloat(result.rows[0].avg_accuracy || 0);
        this.metrics.neuralNetworks.training = parseInt(result.rows[0].training);
      }
    } catch (error) {
      console.error('Failed to update neural network metrics:', error);
    }
  }

  /**
   * Update data stream metrics
   */
  async updateDataStreamMetrics() {
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(*) as active,
          SUM(messages_count) as total_messages
        FROM attribute_data_streams
        WHERE status = 'active'
      `);

      // Messages per second (last minute)
      const rateResult = await this.db.query(`
        SELECT COUNT(*) as count
        FROM attribute_stream_messages
        WHERE created_at > NOW() - INTERVAL '1 minute'
      `);

      if (result.rows.length > 0) {
        this.metrics.dataStreams.active = parseInt(result.rows[0].active || 0);
        this.metrics.dataStreams.totalMessages = parseInt(result.rows[0].total_messages || 0);
      }

      this.metrics.dataStreams.messagesPerSecond = Math.round(
        parseInt(rateResult.rows[0]?.count || 0) / 60
      );
    } catch (error) {
      console.error('Failed to update data stream metrics:', error);
    }
  }

  /**
   * Update system metrics
   */
  async updateSystemMetrics() {
    try {
      // Memory usage
      const memUsage = process.memoryUsage();
      this.metrics.system.memoryUsage = Math.round(
        (memUsage.heapUsed / memUsage.heapTotal) * 100
      );

      // Uptime
      this.metrics.system.uptime = process.uptime();

      // Calculate health score
      const healthScore = this.calculateSystemHealth();
      this.metrics.system.health = 
        healthScore > 0.8 ? 'healthy' : 
        healthScore > 0.5 ? 'degraded' : 'unhealthy';

    } catch (error) {
      console.error('Failed to update system metrics:', error);
    }
  }

  /**
   * Calculate overall system health
   */
  calculateSystemHealth() {
    let score = 1.0;

    // Penalize high error rate
    const errorRate = this.metrics.crawlers.errors / 
      (this.metrics.crawlers.active + this.metrics.crawlers.errors || 1);
    if (errorRate > this.config.alertThresholds.errorRate) {
      score -= 0.2;
    }

    // Penalize low crawl speed
    if (this.metrics.crawlers.urlsPerMinute < this.config.alertThresholds.crawlSpeed) {
      score -= 0.1;
    }

    // Penalize low model accuracy
    if (this.metrics.neuralNetworks.averageAccuracy < this.config.alertThresholds.modelAccuracy) {
      score -= 0.2;
    }

    // Penalize high memory usage
    if (this.metrics.system.memoryUsage > 90) {
      score -= 0.3;
    }

    return Math.max(0, score);
  }

  /**
   * Check for alert conditions
   */
  async checkAlerts() {
    if (!this.config.enableAlerts) return;

    const newAlerts = [];

    // Check error rate
    const errorRate = this.metrics.crawlers.errors / 
      (this.metrics.crawlers.active + this.metrics.crawlers.errors || 1);
    
    if (errorRate > this.config.alertThresholds.errorRate) {
      newAlerts.push({
        type: 'high_error_rate',
        severity: 'warning',
        message: `Crawler error rate is ${(errorRate * 100).toFixed(1)}%`,
        metadata: { errorRate, threshold: this.config.alertThresholds.errorRate }
      });
    }

    // Check crawl speed
    if (this.metrics.crawlers.urlsPerMinute < this.config.alertThresholds.crawlSpeed) {
      newAlerts.push({
        type: 'low_crawl_speed',
        severity: 'info',
        message: `Crawl speed is ${this.metrics.crawlers.urlsPerMinute} URLs/min`,
        metadata: { 
          speed: this.metrics.crawlers.urlsPerMinute,
          threshold: this.config.alertThresholds.crawlSpeed 
        }
      });
    }

    // Check model accuracy
    if (this.metrics.neuralNetworks.averageAccuracy < this.config.alertThresholds.modelAccuracy) {
      newAlerts.push({
        type: 'low_model_accuracy',
        severity: 'warning',
        message: `Average model accuracy is ${(this.metrics.neuralNetworks.averageAccuracy * 100).toFixed(1)}%`,
        metadata: { 
          accuracy: this.metrics.neuralNetworks.averageAccuracy,
          threshold: this.config.alertThresholds.modelAccuracy 
        }
      });
    }

    // Check system health
    if (this.metrics.system.health === 'unhealthy') {
      newAlerts.push({
        type: 'system_unhealthy',
        severity: 'critical',
        message: 'System health is critical',
        metadata: { health: this.metrics.system.health }
      });
    }

    // Save new alerts
    for (const alert of newAlerts) {
      await this.saveAlert(alert);
    }

    this.alerts.unshift(...newAlerts);
    
    // Trim alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    // Emit alerts
    if (newAlerts.length > 0) {
      this.emit('alerts', newAlerts);
    }
  }

  /**
   * Save metrics to database
   */
  async saveMetricsToDatabase() {
    try {
      const metrics = [
        // Campaign metrics
        { category: 'campaigns', name: 'total', value: this.metrics.campaigns.total },
        { category: 'campaigns', name: 'active', value: this.metrics.campaigns.active },
        
        // Crawler metrics
        { category: 'crawlers', name: 'active', value: this.metrics.crawlers.active },
        { category: 'crawlers', name: 'errors', value: this.metrics.crawlers.errors },
        { category: 'crawlers', name: 'urls_per_minute', value: this.metrics.crawlers.urlsPerMinute },
        
        // Neural network metrics
        { category: 'neural', name: 'instances', value: this.metrics.neuralNetworks.instances },
        { category: 'neural', name: 'accuracy', value: this.metrics.neuralNetworks.averageAccuracy },
        
        // Data stream metrics
        { category: 'streams', name: 'active', value: this.metrics.dataStreams.active },
        { category: 'streams', name: 'messages_per_second', value: this.metrics.dataStreams.messagesPerSecond },
        
        // System metrics
        { category: 'system', name: 'memory_usage', value: this.metrics.system.memoryUsage },
        { category: 'system', name: 'uptime', value: this.metrics.system.uptime }
      ];

      for (const metric of metrics) {
        await this.db.query(
          'INSERT INTO monitoring_metrics (category, metric_name, metric_value) VALUES ($1, $2, $3)',
          [metric.category, metric.name, metric.value]
        );
      }
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * Save alert to database
   */
  async saveAlert(alert) {
    try {
      await this.db.query(
        `INSERT INTO monitoring_alerts (alert_type, severity, message, metadata)
         VALUES ($1, $2, $3, $4)`,
        [alert.type, alert.severity, alert.message, JSON.stringify(alert.metadata)]
      );
    } catch (error) {
      console.error('Failed to save alert:', error);
    }
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return this.metrics;
  }

  /**
   * Get metrics history
   */
  getHistory(limit = 100) {
    return this.metricsHistory.slice(0, limit);
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit = 50) {
    return this.alerts.slice(0, limit);
  }

  /**
   * Get dashboard summary
   */
  getDashboard() {
    return {
      metrics: this.metrics,
      recentAlerts: this.getAlerts(10),
      systemHealth: this.metrics.system.health,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Shutdown monitoring
   */
  async shutdown() {
    console.log('🛑 Shutting down monitoring dashboard...');
    
    this.isRunning = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    await this.db.end();
    
    console.log('✅ Monitoring shutdown complete');
  }
}

export default NeuralCrawlerMonitoringDashboard;
