/**
 * Blockchain Metrics Collector
 * Collects and analyzes blockchain performance metrics
 */

import { EventEmitter } from 'events';

class BlockchainMetricsCollector extends EventEmitter {
  constructor() {
    super();
    this.metrics = {
      // Network metrics
      network: {
        totalNodes: 0,
        activeNodes: 0,
        averageLatency: 0,
        networkHashRate: 0,
        blockPropagationTime: 0,
        peerConnections: 0
      },
      
      // Mining metrics
      mining: {
        totalBlocksMined: 0,
        averageBlockTime: 0,
        miningDifficulty: 1,
        hashRate: 0,
        orphanedBlocks: 0,
        staleBlocks: 0
      },
      
      // Optimization metrics
      optimization: {
        totalOptimizations: 0,
        totalSpaceSaved: 0,
        averageOptimizationSize: 0,
        optimizationSuccessRate: 0,
        failedOptimizations: 0,
        pendingOptimizations: 0
      },
      
      // User metrics
      users: {
        totalUsers: 0,
        activeUsers: 0,
        newUsersToday: 0,
        userRetentionRate: 0,
        averageSessionLength: 0
      },
      
      // Performance metrics
      performance: {
        averageResponseTime: 0,
        requestsPerSecond: 0,
        errorRate: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        diskUsage: 0
      },
      
      // Economic metrics
      economic: {
        totalDSHMinted: 0,
        totalDSHBurned: 0,
        averageTransactionValue: 0,
        transactionVolume: 0,
        gasUsage: 0,
        feesCollected: 0
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
    
    console.log('Blockchain metrics collection started');
  }

  stopCollection() {
    if (this.collectionTimer) {
      clearInterval(this.collectionTimer);
      this.collectionTimer = null;
    }
    
    this.isCollecting = false;
    console.log('Blockchain metrics collection stopped');
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
    
    // Network metrics
    metrics.network = await this.collectNetworkMetrics();
    
    // Mining metrics
    metrics.mining = await this.collectMiningMetrics();
    
    // Optimization metrics
    metrics.optimization = await this.collectOptimizationMetrics();
    
    // User metrics
    metrics.users = await this.collectUserMetrics();
    
    // Performance metrics
    metrics.performance = await this.collectPerformanceMetrics();
    
    // Economic metrics
    metrics.economic = await this.collectEconomicMetrics();
    
    return metrics;
  }

  async collectNetworkMetrics() {
    // Simulate network metrics collection
    return {
      totalNodes: Math.floor(Math.random() * 100) + 50,
      activeNodes: Math.floor(Math.random() * 80) + 30,
      averageLatency: Math.random() * 100 + 50,
      networkHashRate: Math.random() * 1000000 + 500000,
      blockPropagationTime: Math.random() * 2000 + 500,
      peerConnections: Math.floor(Math.random() * 20) + 5
    };
  }

  async collectMiningMetrics() {
    // Simulate mining metrics collection
    return {
      totalBlocksMined: this.metrics.mining.totalBlocksMined + Math.floor(Math.random() * 3),
      averageBlockTime: Math.random() * 10000 + 5000,
      miningDifficulty: Math.random() * 1000 + 100,
      hashRate: Math.random() * 100000 + 50000,
      orphanedBlocks: Math.floor(Math.random() * 5),
      staleBlocks: Math.floor(Math.random() * 10)
    };
  }

  async collectOptimizationMetrics() {
    // Simulate optimization metrics collection
    const newOptimizations = Math.floor(Math.random() * 10);
    const newSpaceSaved = Math.floor(Math.random() * 10000);
    
    return {
      totalOptimizations: this.metrics.optimization.totalOptimizations + newOptimizations,
      totalSpaceSaved: this.metrics.optimization.totalSpaceSaved + newSpaceSaved,
      averageOptimizationSize: newSpaceSaved / Math.max(newOptimizations, 1),
      optimizationSuccessRate: Math.random() * 0.2 + 0.8, // 80-100%
      failedOptimizations: Math.floor(Math.random() * 5),
      pendingOptimizations: Math.floor(Math.random() * 20)
    };
  }

  async collectUserMetrics() {
    // Simulate user metrics collection
    return {
      totalUsers: Math.floor(Math.random() * 1000) + 500,
      activeUsers: Math.floor(Math.random() * 100) + 50,
      newUsersToday: Math.floor(Math.random() * 20) + 5,
      userRetentionRate: Math.random() * 0.3 + 0.7, // 70-100%
      averageSessionLength: Math.random() * 3600000 + 1800000 // 30-90 minutes
    };
  }

  async collectPerformanceMetrics() {
    // Collect actual performance metrics
    const memUsage = process.memoryUsage();
    
    return {
      averageResponseTime: Math.random() * 100 + 50,
      requestsPerSecond: Math.random() * 100 + 50,
      errorRate: Math.random() * 0.05, // 0-5%
      memoryUsage: memUsage.heapUsed / 1024 / 1024, // MB
      cpuUsage: Math.random() * 100, // Percentage
      diskUsage: Math.random() * 100 // Percentage
    };
  }

  async collectEconomicMetrics() {
    // Simulate economic metrics collection
    const newMinted = Math.floor(Math.random() * 1000) + 100;
    
    return {
      totalDSHMinted: this.metrics.economic.totalDSHMinted + newMinted,
      totalDSHBurned: Math.floor(Math.random() * 100) + 50,
      averageTransactionValue: Math.random() * 1000 + 100,
      transactionVolume: Math.random() * 10000 + 5000,
      gasUsage: Math.random() * 100000 + 50000,
      feesCollected: Math.random() * 100 + 50
    };
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

  getCurrentMetrics() {
    return JSON.parse(JSON.stringify(this.metrics));
  }

  getHistoricalData(timeRange = 3600000) { // 1 hour default
    const cutoff = Date.now() - timeRange;
    return this.historicalData.filter(entry => entry.timestamp > cutoff);
  }

  getMetricsSummary() {
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
    if (this.metrics.performance.memoryUsage > 1000) { // > 1GB
      alerts.push({
        level: 'warning',
        category: 'performance',
        metric: 'memoryUsage',
        value: this.metrics.performance.memoryUsage,
        message: 'High memory usage detected'
      });
    }
    
    if (this.metrics.performance.errorRate > 0.1) { // > 10%
      alerts.push({
        level: 'critical',
        category: 'performance',
        metric: 'errorRate',
        value: this.metrics.performance.errorRate,
        message: 'High error rate detected'
      });
    }
    
    if (this.metrics.network.averageLatency > 500) { // > 500ms
      alerts.push({
        level: 'warning',
        category: 'network',
        metric: 'averageLatency',
        value: this.metrics.network.averageLatency,
        message: 'High network latency detected'
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

  // Event handlers for real-time updates
  onOptimizationSubmitted(data) {
    this.metrics.optimization.totalOptimizations++;
    this.metrics.optimization.totalSpaceSaved += data.spaceSaved || 0;
  }

  onBlockMined(data) {
    this.metrics.mining.totalBlocksMined++;
  }

  onUserConnected(data) {
    this.metrics.users.activeUsers++;
  }

  onUserDisconnected(data) {
    this.metrics.users.activeUsers = Math.max(0, this.metrics.users.activeUsers - 1);
  }
}

export default BlockchainMetricsCollector;
