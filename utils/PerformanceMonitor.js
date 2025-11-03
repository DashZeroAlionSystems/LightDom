/**
 * Performance Monitor for Headless Chrome Operations
 * 
 * Tracks performance metrics and provides adaptive recommendations
 * using learning rate concepts for dynamic optimization.
 * 
 * Based on research from GPU_HEADLESS_CHROME_LEARNING_RATE_RESEARCH.md
 */

export class PerformanceMonitor {
  constructor(options = {}) {
    this.learningRate = options.learningRate || 0.1;
    this.services = new Map();
    this.globalMetrics = {
      totalRequests: 0,
      totalErrors: 0,
      totalResponseTime: 0,
      startTime: Date.now()
    };
  }

  /**
   * Record a performance metric for a service
   * @param {string} serviceName - Name of the service
   * @param {Object} metric - Metric data
   */
  record(serviceName, metric) {
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, {
        samples: [],
        stats: {
          avgResponseTime: 0,
          p95ResponseTime: 0,
          p99ResponseTime: 0,
          errorRate: 0,
          successRate: 100,
          throughput: 0,
          currentConcurrency: metric.concurrency || 5,
          targetConcurrency: metric.concurrency || 5
        },
        recommendations: {
          adjustConcurrency: 0,
          adjustLearningRate: 0
        }
      });
    }

    const service = this.services.get(serviceName);
    
    // Add timestamp if not present
    const metricWithTimestamp = {
      ...metric,
      timestamp: metric.timestamp || Date.now()
    };
    
    service.samples.push(metricWithTimestamp);

    // Update global metrics
    this.globalMetrics.totalRequests++;
    if (metric.error) {
      this.globalMetrics.totalErrors++;
    }
    if (metric.responseTime) {
      this.globalMetrics.totalResponseTime += metric.responseTime;
    }

    // Keep last 1000 samples per service
    if (service.samples.length > 1000) {
      service.samples.shift();
    }

    // Update statistics
    this.updateStats(serviceName);
  }

  /**
   * Update statistics for a service
   */
  updateStats(serviceName) {
    const service = this.services.get(serviceName);
    if (!service || service.samples.length === 0) {
      return;
    }

    const samples = service.samples;
    const responseTimes = samples
      .filter(s => s.responseTime)
      .map(s => s.responseTime)
      .sort((a, b) => a - b);
    
    const errors = samples.filter(s => s.error).length;
    const successes = samples.length - errors;

    // Calculate statistics
    service.stats.avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    service.stats.p95ResponseTime = responseTimes.length > 0
      ? responseTimes[Math.floor(responseTimes.length * 0.95)]
      : 0;

    service.stats.p99ResponseTime = responseTimes.length > 0
      ? responseTimes[Math.floor(responseTimes.length * 0.99)]
      : 0;

    service.stats.errorRate = samples.length > 0
      ? (errors / samples.length) * 100
      : 0;

    service.stats.successRate = samples.length > 0
      ? (successes / samples.length) * 100
      : 100;

    // Calculate throughput (requests per minute)
    const timeWindow = Date.now() - samples[0].timestamp;
    service.stats.throughput = timeWindow > 0
      ? (samples.length / timeWindow) * 60000
      : 0;
  }

  /**
   * Get recommended concurrency level using adaptive learning
   * @param {string} serviceName - Service name
   * @returns {number} Recommended concurrency
   */
  getRecommendedConcurrency(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) {
      return 5; // Default
    }

    const { avgResponseTime, errorRate, currentConcurrency } = service.stats;

    // Performance scoring
    const performanceScore = this.calculatePerformanceScore({
      avgResponseTime,
      errorRate
    });

    let adjustment = 0;

    if (performanceScore > 0.8 && errorRate < 5) {
      // System performing well - increase concurrency
      adjustment = Math.ceil(this.learningRate * currentConcurrency);
      service.stats.targetConcurrency = Math.min(20, currentConcurrency + adjustment);
    } else if (performanceScore < 0.5 || errorRate > 15) {
      // System struggling - decrease concurrency
      adjustment = -Math.ceil(this.learningRate * currentConcurrency);
      service.stats.targetConcurrency = Math.max(1, currentConcurrency - Math.abs(adjustment));
    } else {
      // Maintain current level
      service.stats.targetConcurrency = currentConcurrency;
    }

    service.recommendations.adjustConcurrency = adjustment;

    return service.stats.targetConcurrency;
  }

  /**
   * Calculate performance score (0-1)
   */
  calculatePerformanceScore(metrics) {
    const { avgResponseTime, errorRate, cpuUsage = 50, memoryUsage = 50 } = metrics;

    // Component scores (0-1)
    const speedScore = Math.max(0, 1 - (avgResponseTime / 10000)); // 10s baseline
    const reliabilityScore = Math.max(0, 1 - (errorRate / 100));
    const cpuScore = Math.max(0, 1 - (cpuUsage / 100));
    const memoryScore = Math.max(0, 1 - (memoryUsage / 100));

    // Weighted combination
    return (
      speedScore * 0.35 +
      reliabilityScore * 0.35 +
      cpuScore * 0.15 +
      memoryScore * 0.15
    );
  }

  /**
   * Get adaptive learning rate recommendation
   */
  getAdaptiveLearningRate(serviceName) {
    const service = this.services.get(serviceName);
    if (!service || service.samples.length < 20) {
      return this.learningRate; // Use default
    }

    // Check if performance is stable (low variance)
    const recentSamples = service.samples.slice(-20);
    const performanceScores = recentSamples.map(s => 
      this.calculatePerformanceScore({
        avgResponseTime: s.responseTime || 0,
        errorRate: s.error ? 100 : 0
      })
    );

    const variance = this.calculateVariance(performanceScores);

    // Adjust learning rate based on stability
    let newLearningRate = this.learningRate;
    
    if (variance < 0.05) {
      // Stable performance - can increase learning rate
      newLearningRate = Math.min(0.2, this.learningRate * 1.05);
    } else if (variance > 0.2) {
      // Unstable performance - decrease learning rate
      newLearningRate = Math.max(0.05, this.learningRate * 0.95);
    }

    service.recommendations.adjustLearningRate = newLearningRate - this.learningRate;

    return newLearningRate;
  }

  /**
   * Calculate variance of an array
   */
  calculateVariance(values) {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Get comprehensive metrics report for a service
   */
  getMetricsReport(serviceName) {
    const service = this.services.get(serviceName);
    if (!service) {
      return null;
    }

    const recommendedConcurrency = this.getRecommendedConcurrency(serviceName);
    const recommendedLearningRate = this.getAdaptiveLearningRate(serviceName);

    return {
      service: serviceName,
      stats: service.stats,
      sampleCount: service.samples.length,
      recommendations: {
        concurrency: {
          current: service.stats.currentConcurrency,
          target: service.stats.targetConcurrency,
          recommended: recommendedConcurrency,
          adjustment: service.recommendations.adjustConcurrency
        },
        learningRate: {
          current: this.learningRate,
          recommended: recommendedLearningRate,
          adjustment: service.recommendations.adjustLearningRate
        }
      },
      performanceScore: this.calculatePerformanceScore({
        avgResponseTime: service.stats.avgResponseTime,
        errorRate: service.stats.errorRate
      }),
      lastUpdate: service.samples[service.samples.length - 1]?.timestamp
    };
  }

  /**
   * Get global metrics report
   */
  getGlobalReport() {
    const uptime = Date.now() - this.globalMetrics.startTime;
    const avgResponseTime = this.globalMetrics.totalRequests > 0
      ? this.globalMetrics.totalResponseTime / this.globalMetrics.totalRequests
      : 0;
    const errorRate = this.globalMetrics.totalRequests > 0
      ? (this.globalMetrics.totalErrors / this.globalMetrics.totalRequests) * 100
      : 0;

    return {
      uptime,
      totalRequests: this.globalMetrics.totalRequests,
      totalErrors: this.globalMetrics.totalErrors,
      avgResponseTime,
      errorRate,
      successRate: 100 - errorRate,
      servicesTracked: this.services.size,
      services: Array.from(this.services.keys())
    };
  }

  /**
   * Get performance trends for a service
   */
  getPerformanceTrends(serviceName, windowSize = 50) {
    const service = this.services.get(serviceName);
    if (!service || service.samples.length < windowSize) {
      return null;
    }

    const recent = service.samples.slice(-windowSize);
    const older = service.samples.slice(-windowSize * 2, -windowSize);

    const recentAvgResponseTime = recent
      .filter(s => s.responseTime)
      .reduce((sum, s) => sum + s.responseTime, 0) / recent.length;

    const olderAvgResponseTime = older.length > 0
      ? older
          .filter(s => s.responseTime)
          .reduce((sum, s) => sum + s.responseTime, 0) / older.length
      : recentAvgResponseTime;

    const recentErrorRate = (recent.filter(s => s.error).length / recent.length) * 100;
    const olderErrorRate = older.length > 0
      ? (older.filter(s => s.error).length / older.length) * 100
      : recentErrorRate;

    return {
      service: serviceName,
      window: windowSize,
      responseTime: {
        recent: recentAvgResponseTime,
        older: olderAvgResponseTime,
        trend: recentAvgResponseTime < olderAvgResponseTime ? 'improving' : 'degrading',
        change: ((recentAvgResponseTime - olderAvgResponseTime) / olderAvgResponseTime) * 100
      },
      errorRate: {
        recent: recentErrorRate,
        older: olderErrorRate,
        trend: recentErrorRate < olderErrorRate ? 'improving' : 'degrading',
        change: recentErrorRate - olderErrorRate
      }
    };
  }

  /**
   * Export metrics for external analysis
   */
  exportMetrics(serviceName = null) {
    if (serviceName) {
      return {
        service: serviceName,
        data: this.services.get(serviceName)
      };
    }

    const allMetrics = {};
    for (const [name, service] of this.services.entries()) {
      allMetrics[name] = service;
    }

    return {
      global: this.globalMetrics,
      services: allMetrics,
      exportTime: Date.now()
    };
  }

  /**
   * Reset metrics for a service or all services
   */
  reset(serviceName = null) {
    if (serviceName) {
      this.services.delete(serviceName);
    } else {
      this.services.clear();
      this.globalMetrics = {
        totalRequests: 0,
        totalErrors: 0,
        totalResponseTime: 0,
        startTime: Date.now()
      };
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export function recordMetric(serviceName, metric) {
  performanceMonitor.record(serviceName, metric);
}

export function getServiceReport(serviceName) {
  return performanceMonitor.getMetricsReport(serviceName);
}

export function getGlobalMetrics() {
  return performanceMonitor.getGlobalReport();
}

export default PerformanceMonitor;
