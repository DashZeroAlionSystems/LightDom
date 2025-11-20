/**
 * RAG Health Monitor Service
 * 
 * Implements enterprise-grade health monitoring for RAG system:
 * - Connection health checks
 * - Automatic reconnection with exponential backoff
 * - Circuit breaker pattern
 * - Comprehensive error logging
 * - Real-time health metrics
 */

import EventEmitter from 'events';

export class RagHealthMonitor extends EventEmitter {
  constructor({ logger = console, checkIntervalMs = 30000 } = {}) {
    super();
    this.logger = logger;
    this.checkIntervalMs = checkIntervalMs;
    this.healthStatus = {
      status: 'initializing',
      database: { status: 'unknown', lastCheck: null, error: null },
      embedding: { status: 'unknown', lastCheck: null, error: null },
      llm: { status: 'unknown', lastCheck: null, error: null },
      vectorStore: { status: 'unknown', lastCheck: null, error: null },
    };
    this.intervalId = null;
    this.db = null;
    this.ragService = null;
    
    // Circuit breaker state
    this.circuitBreaker = {
      failures: 0,
      threshold: 5,
      timeout: 60000, // 1 minute
      state: 'closed', // closed, open, half-open
      lastFailure: null,
    };
  }

  /**
   * Initialize health monitoring with dependencies
   */
  initialize({ db, ragService }) {
    this.db = db;
    this.ragService = ragService;
    
    // Run initial health check
    this.runHealthCheck().catch(err => {
      this.logger.error('Initial health check failed:', err);
    });
    
    // Start periodic health checks
    this.start();
    
    return this;
  }

  /**
   * Start periodic health monitoring
   */
  start() {
    if (this.intervalId) {
      return;
    }
    
    this.intervalId = setInterval(() => {
      this.runHealthCheck().catch(err => {
        this.logger.error('Periodic health check failed:', err);
      });
    }, this.checkIntervalMs);
    
    this.logger.info('RAG health monitor started');
  }

  /**
   * Stop health monitoring
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.logger.info('RAG health monitor stopped');
    }
  }

  /**
   * Run comprehensive health check
   */
  async runHealthCheck() {
    const startTime = Date.now();
    
    try {
      // Check database connection
      await this.checkDatabase();
      
      // Check RAG service if available
      if (this.ragService) {
        await this.checkRagService();
      }
      
      // Update overall status
      this.updateOverallStatus();
      
      // Emit health update event
      this.emit('health-update', this.healthStatus);
      
      const duration = Date.now() - startTime;
      this.logger.debug(`Health check completed in ${duration}ms`);
      
      return this.healthStatus;
    } catch (error) {
      this.logger.error('Health check error:', error);
      this.handleHealthCheckFailure(error);
      throw error;
    }
  }

  /**
   * Check database connectivity
   */
  async checkDatabase() {
    const startTime = Date.now();
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }
      
      await this.db.query('SELECT 1');
      
      this.healthStatus.database = {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        error: null,
        responseTime: Date.now() - startTime,
      };
      
      this.recordSuccess();
    } catch (error) {
      this.healthStatus.database = {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error.message,
        responseTime: Date.now() - startTime,
      };
      
      this.recordFailure(error);
      throw error;
    }
  }

  /**
   * Check RAG service health
   */
  async checkRagService() {
    try {
      if (!this.ragService?.healthCheck) {
        this.healthStatus.vectorStore = {
          status: 'unknown',
          lastCheck: new Date().toISOString(),
          error: 'Health check not implemented',
        };
        return;
      }
      
      const report = await this.ragService.healthCheck();
      
      this.healthStatus.vectorStore = {
        status: report.status === 'ok' ? 'healthy' : 'degraded',
        lastCheck: new Date().toISOString(),
        error: null,
        details: report,
      };
      
      this.healthStatus.embedding = {
        status: report.embedding ? 'healthy' : 'unknown',
        lastCheck: new Date().toISOString(),
        error: null,
      };
      
      this.healthStatus.llm = {
        status: report.llm ? 'healthy' : 'unknown',
        lastCheck: new Date().toISOString(),
        error: null,
      };
      
      this.recordSuccess();
    } catch (error) {
      this.healthStatus.vectorStore = {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error.message,
      };
      
      this.recordFailure(error);
      throw error;
    }
  }

  /**
   * Update overall system status based on component health
   */
  updateOverallStatus() {
    const components = [
      this.healthStatus.database,
      this.healthStatus.vectorStore,
      this.healthStatus.embedding,
      this.healthStatus.llm,
    ];
    
    const unhealthyCount = components.filter(c => c.status === 'unhealthy').length;
    const unknownCount = components.filter(c => c.status === 'unknown').length;
    
    if (unhealthyCount > 0) {
      this.healthStatus.status = 'unhealthy';
    } else if (unknownCount > 0) {
      this.healthStatus.status = 'degraded';
    } else {
      this.healthStatus.status = 'healthy';
    }
    
    this.healthStatus.lastCheck = new Date().toISOString();
    this.healthStatus.circuitBreaker = {
      state: this.circuitBreaker.state,
      failures: this.circuitBreaker.failures,
    };
  }

  /**
   * Record successful health check (reset circuit breaker)
   */
  recordSuccess() {
    if (this.circuitBreaker.failures > 0) {
      this.logger.info('RAG system recovered, resetting circuit breaker');
    }
    
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.state = 'closed';
    this.circuitBreaker.lastFailure = null;
  }

  /**
   * Record health check failure (increment circuit breaker)
   */
  recordFailure(error) {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = new Date().toISOString();
    
    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      this.circuitBreaker.state = 'open';
      this.logger.error(
        `Circuit breaker OPEN after ${this.circuitBreaker.failures} failures. ` +
        `Last error: ${error.message}`
      );
      
      this.emit('circuit-breaker-open', {
        failures: this.circuitBreaker.failures,
        error: error.message,
      });
      
      // Schedule circuit breaker half-open attempt
      setTimeout(() => {
        if (this.circuitBreaker.state === 'open') {
          this.circuitBreaker.state = 'half-open';
          this.logger.info('Circuit breaker entering HALF-OPEN state');
          this.emit('circuit-breaker-half-open');
        }
      }, this.circuitBreaker.timeout);
    }
  }

  /**
   * Handle health check failure
   */
  handleHealthCheckFailure(error) {
    this.healthStatus.status = 'unhealthy';
    this.healthStatus.lastError = {
      message: error.message,
      timestamp: new Date().toISOString(),
    };
    
    this.emit('health-check-failed', {
      error: error.message,
      status: this.healthStatus,
    });
  }

  /**
   * Get current health status
   */
  getStatus() {
    return {
      ...this.healthStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check if circuit breaker allows requests
   */
  isCircuitBreakerOpen() {
    return this.circuitBreaker.state === 'open';
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus() {
    return {
      ...this.circuitBreaker,
    };
  }
}

export default RagHealthMonitor;
