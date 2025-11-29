/**
 * RAG Service Automation Workflow
 * 
 * Ensures RAG service is always running and automatically recovers from failures
 */

const WORKFLOW_CONFIG = {
  name: 'RAG Service Health Monitor',
  description: 'Automated monitoring and recovery for RAG service',
  version: '1.0.0',
  
  // Monitoring configuration
  monitoring: {
    healthCheckInterval: 30000,      // 30 seconds
    alertThreshold: 3,                // Alert after 3 consecutive failures
    criticalThreshold: 5,             // Critical alert after 5 consecutive failures
    recoveryCheckInterval: 60000,    // Check recovery every 60 seconds
  },
  
  // Automatic actions
  actions: {
    onHealthCheckFail: {
      enabled: true,
      actions: [
        {
          type: 'retry',
          maxAttempts: 3,
          delay: 5000,
        },
        {
          type: 'notify',
          level: 'warning',
          channels: ['console', 'log'],
        },
      ],
    },
    
    onCircuitBreakerOpen: {
      enabled: true,
      actions: [
        {
          type: 'notify',
          level: 'critical',
          channels: ['console', 'log', 'alert'],
          message: 'RAG service circuit breaker opened - automatic recovery disabled',
        },
        {
          type: 'schedule_recovery',
          delay: 60000,  // Wait 1 minute before attempting recovery
        },
      ],
    },
    
    onRecovery: {
      enabled: true,
      actions: [
        {
          type: 'notify',
          level: 'info',
          channels: ['console', 'log'],
          message: 'RAG service recovered successfully',
        },
        {
          type: 'reset_counters',
        },
      ],
    },
  },
  
  // Dependencies to check
  dependencies: [
    {
      name: 'database',
      type: 'postgresql',
      required: true,
      healthCheck: 'SELECT 1',
    },
    {
      name: 'ollama',
      type: 'http',
      required: false,
      url: 'http://127.0.0.1:11434/api/tags',
      fallback: 'deepseek-api',
    },
    {
      name: 'deepseek-api',
      type: 'api-key',
      required: false,
      envVar: 'DEEPSEEK_API_KEY',
      fallback: 'ollama',
    },
  ],
  
  // Recovery strategies
  recovery: {
    strategies: [
      {
        name: 'database_reconnect',
        condition: 'database.status === "unhealthy"',
        steps: [
          'close_existing_connections',
          'wait_5_seconds',
          'establish_new_connection',
          'verify_connection',
        ],
      },
      {
        name: 'service_restart',
        condition: 'circuitBreaker.state === "open" && elapsed > 120000',
        steps: [
          'graceful_shutdown',
          'wait_10_seconds',
          'reinitialize_services',
          'verify_health',
        ],
      },
      {
        name: 'fallback_provider',
        condition: 'ollama.status === "unhealthy" && deepseek.available',
        steps: [
          'switch_to_deepseek',
          'update_configuration',
          'verify_functionality',
        ],
      },
    ],
  },
  
  // Logging and metrics
  metrics: {
    enabled: true,
    retention: 86400000,  // 24 hours
    aggregation: 300000,  // 5 minutes
    metrics: [
      'health_check_duration',
      'failure_count',
      'recovery_count',
      'circuit_breaker_state_changes',
      'component_response_times',
      'request_count',
      'error_rate',
    ],
  },
};

/**
 * RAG Service Monitor Implementation
 */
class RagServiceMonitor {
  constructor(config) {
    this.config = config;
    this.metrics = {
      healthChecks: 0,
      failures: 0,
      consecutiveFailures: 0,
      recoveries: 0,
      lastHealthCheck: null,
      lastFailure: null,
      lastRecovery: null,
    };
    this.monitoring = false;
    this.monitorInterval = null;
  }
  
  async start() {
    if (this.monitoring) {
      console.log('RAG service monitor already running');
      return;
    }
    
    console.log('Starting RAG service monitor...');
    this.monitoring = true;
    
    // Initial health check
    await this.performHealthCheck();
    
    // Schedule periodic health checks
    this.monitorInterval = setInterval(
      () => this.performHealthCheck(),
      this.config.monitoring.healthCheckInterval
    );
    
    console.log('RAG service monitor started');
  }
  
  async stop() {
    if (!this.monitoring) {
      return;
    }
    
    console.log('Stopping RAG service monitor...');
    this.monitoring = false;
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    console.log('RAG service monitor stopped');
  }
  
  async performHealthCheck() {
    this.metrics.healthChecks++;
    this.metrics.lastHealthCheck = new Date().toISOString();
    
    try {
      const response = await fetch('http://localhost:3001/api/rag/health');
      const health = await response.json();
      
      if (response.status === 200 && health.status === 'healthy') {
        await this.handleHealthy(health);
      } else if (response.status === 206) {
        await this.handleDegraded(health);
      } else {
        await this.handleUnhealthy(health);
      }
    } catch (error) {
      await this.handleError(error);
    }
  }
  
  async handleHealthy(health) {
    // Service is healthy
    if (this.metrics.consecutiveFailures > 0) {
      // Recovery detected
      console.log('✅ RAG service recovered after', this.metrics.consecutiveFailures, 'failures');
      this.metrics.recoveries++;
      this.metrics.lastRecovery = new Date().toISOString();
      
      // Execute recovery actions
      await this.executeActions(this.config.actions.onRecovery.actions);
    }
    
    this.metrics.consecutiveFailures = 0;
  }
  
  async handleDegraded(health) {
    // Service is degraded but functional
    console.warn('⚠️ RAG service degraded:', health.status);
    
    // Log component issues
    if (health.components) {
      Object.entries(health.components).forEach(([name, component]) => {
        if (component.status !== 'healthy') {
          console.warn(`  - ${name}: ${component.status}`, component.error || '');
        }
      });
    }
  }
  
  async handleUnhealthy(health) {
    this.metrics.failures++;
    this.metrics.consecutiveFailures++;
    this.metrics.lastFailure = new Date().toISOString();
    
    console.error('❌ RAG service unhealthy');
    
    if (this.metrics.consecutiveFailures >= this.config.monitoring.criticalThreshold) {
      console.error(
        `🚨 CRITICAL: ${this.metrics.consecutiveFailures} consecutive failures`
      );
      
      if (health.circuitBreaker?.state === 'open') {
        await this.executeActions(this.config.actions.onCircuitBreakerOpen.actions);
      }
    } else if (this.metrics.consecutiveFailures >= this.config.monitoring.alertThreshold) {
      console.warn(
        `⚠️ WARNING: ${this.metrics.consecutiveFailures} consecutive failures`
      );
      await this.executeActions(this.config.actions.onHealthCheckFail.actions);
    }
  }
  
  async handleError(error) {
    this.metrics.failures++;
    this.metrics.consecutiveFailures++;
    this.metrics.lastFailure = new Date().toISOString();
    
    console.error('❌ RAG health check error:', error.message);
    
    if (this.metrics.consecutiveFailures >= this.config.monitoring.alertThreshold) {
      await this.executeActions(this.config.actions.onHealthCheckFail.actions);
    }
  }
  
  async executeActions(actions) {
    for (const action of actions) {
      try {
        switch (action.type) {
          case 'retry':
            await this.retryHealthCheck(action);
            break;
          case 'notify':
            await this.notify(action);
            break;
          case 'schedule_recovery':
            await this.scheduleRecovery(action);
            break;
          case 'reset_counters':
            this.resetCounters();
            break;
          default:
            console.warn('Unknown action type:', action.type);
        }
      } catch (error) {
        console.error('Action execution failed:', action.type, error.message);
      }
    }
  }
  
  async retryHealthCheck(action) {
    console.log(`Retrying health check (max ${action.maxAttempts} attempts)...`);
    
    for (let i = 0; i < action.maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, action.delay));
      
      try {
        const response = await fetch('http://localhost:3001/api/rag/health');
        if (response.ok) {
          console.log('✅ Retry succeeded');
          return;
        }
      } catch (error) {
        console.warn(`Retry ${i + 1}/${action.maxAttempts} failed:`, error.message);
      }
    }
    
    console.error('❌ All retries failed');
  }
  
  async notify(action) {
    const message = action.message || 'RAG service health check notification';
    
    if (action.channels.includes('console')) {
      console.log(`[${action.level.toUpperCase()}] ${message}`);
    }
    
    if (action.channels.includes('log')) {
      // Log to file or external logging service
      // Implementation depends on logging infrastructure
    }
    
    if (action.channels.includes('alert')) {
      // Send alert to monitoring system (PagerDuty, Slack, etc.)
      // Implementation depends on alerting infrastructure
    }
  }
  
  async scheduleRecovery(action) {
    console.log(`Scheduling recovery attempt in ${action.delay}ms...`);
    
    setTimeout(async () => {
      console.log('Attempting automatic recovery...');
      
      try {
        const response = await fetch('http://localhost:3001/api/rag/reconnect', {
          method: 'POST',
        });
        
        if (response.ok) {
          console.log('✅ Automatic recovery successful');
        } else {
          console.error('❌ Automatic recovery failed');
        }
      } catch (error) {
        console.error('❌ Automatic recovery error:', error.message);
      }
    }, action.delay);
  }
  
  resetCounters() {
    this.metrics.consecutiveFailures = 0;
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      monitoring: this.monitoring,
      uptime: this.metrics.lastHealthCheck 
        ? Date.now() - new Date(this.metrics.lastHealthCheck).getTime()
        : 0,
    };
  }
}

// Export for use in automation scripts
export { WORKFLOW_CONFIG, RagServiceMonitor };

// Auto-start if running as main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new RagServiceMonitor(WORKFLOW_CONFIG);
  
  monitor.start().catch(error => {
    console.error('Failed to start RAG service monitor:', error);
    process.exit(1);
  });
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT, shutting down...');
    await monitor.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM, shutting down...');
    await monitor.stop();
    process.exit(0);
  });
}
