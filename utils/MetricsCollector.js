/**
 * Metrics Collector
 * Collects and aggregates system metrics
 */

import { EventEmitter } from 'events';

class MetricsCollector extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0
      },
      crawler: {
        activeCrawlers: 0,
        totalPagesCrawled: 0,
        totalOptimizations: 0,
        totalSpaceSaved: 0
      },
      blockchain: {
        totalBlocksMined: 0,
        totalOptimizationsSubmitted: 0,
        activeMiners: 0,
        networkHashRate: 0
      },
      system: {
        memoryUsage: 0,
        cpuUsage: 0,
        uptime: 0,
        errorRate: 0
      }
    };
    
    this.historicalData = [];
    this.maxHistorySize = 1000;
    this.collectionInterval = 5000; // 5 seconds
    this.isCollecting = false;
    
    this.startCollection();
  }

  startCollection() {
    if (this.isCollecting) return;
    
    this.isCollecting = true;
    this.collectionTimer = setInterval(() => {
      this.collectMetrics();
    }, this.collectionInterval);
    
    console.log('Metrics collection started');
  }

  stopCollection() {
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = null;
    }
    
    this.isCollecting = false;
    console.log('Metrics collection stopped');
  }

  async collectMetrics() {
    try {
      const timestamp = Date.now();
      const newMetrics = await this.gatherCurrentMetrics();
      
      // Update current metrics
      this.updateMetrics(newMetrics);
      
      // Store historical data
      this.storeHistoricalData(timestamp, newMetrics);
      
      // Emit metrics update event
      this.emit('metricsUpdated', {
        timestamp,
        metrics: this.metrics,
        delta: this.calculateDelta(newMetrics)
      });
      
    } catch (error) {
      console.error('Failed to collect metrics:', error);
      this.emit('error', error);
    }
  }

  async gatherCurrentMetrics() {
    const metrics = {};
    
    // System metrics
    metrics.system = await this.collectSystemMetrics();
    
    // Request metrics
    metrics.requests = this.collectRequestMetrics();
    
    // Crawler metrics
    metrics.crawler = this.collectCrawlerMetrics();
    
    // Blockchain metrics
    metrics.blockchain = this.collectBlockchainMetrics();
    
    return metrics;
  }

  async collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    
    return {
      memoryUsage: memUsage.heapUsed / 1024 / 1024, // MB
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      errorRate: this.calculateErrorRate()
    };
  }

  collectRequestMetrics() {
    return {
      total: this.metrics.requests.total,
      successful: this.metrics.requests.successful,
      failed: this.metrics.requests.failed,
      averageResponseTime: this.metrics.requests.averageResponseTime
    };
  }

  collectCrawlerMetrics() {
    return {
      activeCrawlers: this.metrics.crawler.activeCrawlers,
      totalPagesCrawled: this.metrics.crawler.totalPagesCrawled,
      totalOptimizations: this.metrics.crawler.totalOptimizations,
      totalSpaceSaved: this.metrics.crawler.totalSpaceSaved
    };
  }

  collectBlockchainMetrics() {
    return {
      totalBlocksMined: this.metrics.blockchain.totalBlocksMined,
      totalOptimizationsSubmitted: this.metrics.blockchain.totalOptimizationsSubmitted,
      activeMiners: this.metrics.blockchain.activeMiners,
      networkHashRate: this.metrics.blockchain.networkHashRate
    };
  }

  calculateErrorRate() {
    const total = this.metrics.requests.total;
    if (total === 0) return 0;
    return (this.metrics.requests.failed / total) * 100;
  }

  updateMetrics(newMetrics) {
    // Update each category of metrics
    Object.keys(newMetrics).forEach(category => {
      if (this.metrics[category]) {
        Object.keys(newMetrics[category]).forEach(key => {
          this.metrics[category][key] = newMetrics[category][key];
        });
      }
    });
  }

  storeHistoricalData(timestamp, metrics) {
    this.historicalData.push({
      timestamp,
      metrics: JSON.parse(JSON.stringify(metrics)) // Deep copy
    });
    
    // Keep only recent data
    if (this.historicalData.length > this.maxHistorySize) {
      this.historicalData = this.historicalData.slice(-this.maxHistorySize);
    }
  }

  calculateDelta(newMetrics) {
    const delta = {};
    
    Object.keys(newMetrics).forEach(category => {
      delta[category] = {};
      Object.keys(newMetrics[category]).forEach(key => {
        const oldValue = this.metrics[category]?.[key] || 0;
        const newValue = newMetrics[category][key];
        delta[category][key] = newValue - oldValue;
      });
    });
    
    return delta;
  }

  // Event handlers for real-time updates
  onRequestReceived() {
    this.metrics.requests.total++;
  }

  onRequestSuccessful(responseTime) {
    this.metrics.requests.successful++;
    this.updateAverageResponseTime(responseTime);
  }

  onRequestFailed() {
    this.metrics.requests.failed++;
  }

  onCrawlerStarted() {
    this.metrics.crawler.activeCrawlers++;
  }

  onCrawlerStopped() {
    this.metrics.crawler.activeCrawlers = Math.max(0, this.metrics.crawler.activeCrawlers - 1);
  }

  onPageCrawled() {
    this.metrics.crawler.totalPagesCrawled++;
  }

  onOptimizationFound(spaceSaved) {
    this.metrics.crawler.totalOptimizations++;
    this.metrics.crawler.totalSpaceSaved += spaceSaved;
  }

  onBlockMined() {
    this.metrics.blockchain.totalBlocksMined++;
  }

  onOptimizationSubmitted() {
    this.metrics.blockchain.totalOptimizationsSubmitted++;
  }

  onMinerStarted() {
    this.metrics.blockchain.activeMiners++;
  }

  onMinerStopped() {
    this.metrics.blockchain.activeMiners = Math.max(0, this.metrics.blockchain.activeMiners - 1);
  }

  updateAverageResponseTime(newResponseTime) {
    const current = this.metrics.requests.averageResponseTime;
    const count = this.metrics.requests.successful;
    
    if (count === 1) {
      this.metrics.requests.averageResponseTime = newResponseTime;
    } else {
      this.metrics.requests.averageResponseTime = 
        ((current * (count - 1)) + newResponseTime) / count;
    }
  }

  getCurrentMetrics() {
    return JSON.parse(JSON.stringify(this.metrics));
  }

  getHistoricalData(timeRange = 3600000) { // 1 hour default
    const cutoff = Date.now() - timeRange;
    return this.historicalData.filter(entry => entry.timestamp > cutoff);
  }

  getSummary() {
    return {
      timestamp: Date.now(),
      uptime: process.uptime(),
      metrics: this.getCurrentMetrics(),
      trends: this.calculateTrends(),
      alerts: this.checkAlerts()
    };
  }

  calculateTrends() {
    const recent = this.getHistoricalData(300000); // Last 5 minutes
    const trends = {};
    
    if (recent.length < 2) return trends;
    
    Object.keys(this.metrics).forEach(category => {
      trends[category] = {};
      Object.keys(this.metrics[category]).forEach(key => {
        const values = recent.map(entry => entry.metrics[category]?.[key] || 0);
        if (values.length > 1) {
          const trend = values[values.length - 1] - values[0];
          trends[category][key] = trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable';
        }
      });
    });
    
    return trends;
  }

  checkAlerts() {
    const alerts = [];
    
    // Check for critical metrics
    if (this.metrics.system.memoryUsage > 1000) { // > 1GB
      alerts.push({
        level: 'warning',
        category: 'system',
        metric: 'memoryUsage',
        value: this.metrics.system.memoryUsage,
        message: 'High memory usage detected'
      });
    }
    
    if (this.metrics.system.errorRate > 10) { // > 10%
      alerts.push({
        level: 'critical',
        category: 'system',
        metric: 'errorRate',
        value: this.metrics.system.errorRate,
        message: 'High error rate detected'
      });
    }
    
    if (this.metrics.requests.averageResponseTime > 5000) { // > 5 seconds
      alerts.push({
        level: 'warning',
        category: 'requests',
        metric: 'averageResponseTime',
        value: this.metrics.requests.averageResponseTime,
        message: 'High response time detected'
      });
    }
    
    return alerts;
  }

  getPrometheusMetrics() {
    // Convert metrics to Prometheus format
    let prometheus = '';
    
    Object.keys(this.metrics).forEach(category => {
      Object.keys(this.metrics[category]).forEach(key => {
        const value = this.metrics[category][key];
        const metricName = `lightdom_${category}_${key}`;
        prometheus += `${metricName} ${value}\n`;
      });
    });
    
    return prometheus;
  }
}

export default MetricsCollector;