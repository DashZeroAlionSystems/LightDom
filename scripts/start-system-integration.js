#!/usr/bin/env node

/**
 * LightDom System Integration Script
 * Integrates blockchain, crawler, PWA, and notification systems
 */

import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LightDomSystemIntegration extends EventEmitter {
  constructor() {
    super();
    
    this.services = new Map();
    this.isRunning = false;
    this.healthCheckInterval = null;
    this.notificationInterval = null;
    
    // System health tracking
    this.systemHealth = {
      blockchain: { status: 'unknown', lastCheck: null, errors: 0 },
      crawler: { status: 'unknown', lastCheck: null, errors: 0 },
      api: { status: 'unknown', lastCheck: null, errors: 0 },
      frontend: { status: 'unknown', lastCheck: null, errors: 0 },
      overall: 'unknown'
    };
    
    // Performance metrics
    this.performanceMetrics = {
      uptime: 0,
      requestsProcessed: 0,
      errorsEncountered: 0,
      lastOptimization: null,
      lastMiningReward: null
    };
  }

  async initialize() {
    console.log('🚀 Initializing LightDom System Integration...');
    
    try {
      // Start core services
      await this.startCoreServices();
      
      // Setup health monitoring
      this.setupHealthMonitoring();
      
      // Setup performance tracking
      this.setupPerformanceTracking();
      
      // Setup notification system
      this.setupNotificationSystem();
      
      // Setup graceful shutdown
      this.setupGracefulShutdown();
      
      this.isRunning = true;
      console.log('✅ LightDom System Integration initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize system integration:', error);
      return false;
    }
  }

  async startCoreServices() {
    console.log('🔧 Starting core services...');
    
    // Start API server
    await this.startService('api-server', 'node', ['api-server-express.js'], {
      PORT: '3001',
      NODE_ENV: 'development'
    });
    
    // Start enhanced systems
    await this.startService('enhanced-systems', 'node', ['scripts/start-enhanced-systems.js'], {
      BLOCKCHAIN_RPC_URL: 'http://localhost:8545',
      CRAWLER_MAX_CONCURRENCY: '5'
    });
    
    // Start frontend
    await this.startService('frontend', 'npm', ['run', 'dev'], {
      VITE_PORT: '3000'
    });
    
    console.log('✅ Core services started');
  }

  async startService(name, command, args, env = {}) {
    console.log(`🚀 Starting ${name}...`);
    
    const process = spawn(command, args, {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, ...env },
      stdio: 'pipe',
      shell: true
    });

    this.services.set(name, process);

    // Handle process output
    process.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`[${name}] ${output}`);
        this.emit('serviceOutput', { service: name, output });
      }
    });

    process.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.error(`[${name}] ${output}`);
        this.emit('serviceError', { service: name, error: output });
      }
    });

    process.on('exit', (code) => {
      if (!this.isShuttingDown) {
        console.error(`❌ ${name} exited with code ${code}`);
        this.systemHealth[name] = { status: 'error', lastCheck: Date.now(), errors: this.systemHealth[name]?.errors + 1 || 1 };
        this.emit('serviceExit', { service: name, code });
      }
    });

    // Wait for service to be ready
    await this.waitForServiceReady(name);
  }

  async waitForServiceReady(serviceName) {
    const maxWaitTime = 30000; // 30 seconds
    const checkInterval = 1000; // 1 second
    let elapsed = 0;

    return new Promise((resolve, reject) => {
      const checkService = async () => {
        try {
          const isReady = await this.checkServiceHealth(serviceName);
          if (isReady) {
            console.log(`✅ ${serviceName} is ready`);
            this.systemHealth[serviceName] = { status: 'healthy', lastCheck: Date.now(), errors: 0 };
            resolve();
            return;
          }

          elapsed += checkInterval;
          if (elapsed >= maxWaitTime) {
            reject(new Error(`${serviceName} failed to start within ${maxWaitTime}ms`));
            return;
          }

          setTimeout(checkService, checkInterval);
        } catch (error) {
          reject(error);
        }
      };

      checkService();
    });
  }

  async checkServiceHealth(serviceName) {
    switch (serviceName) {
      case 'api-server':
        try {
          const response = await fetch('http://localhost:3001/api/health');
          return response.ok;
        } catch (error) {
          return false;
        }

      case 'enhanced-systems':
        // Check if enhanced systems are available globally
        return global.blockchainSystem && global.crawlerSystem;

      case 'frontend':
        try {
          const response = await fetch('http://localhost:3000');
          return response.ok;
        } catch (error) {
          return false;
        }

      default:
        return false;
    }
  }

  setupHealthMonitoring() {
    console.log('🏥 Setting up health monitoring...');
    
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000); // Check every 30 seconds
  }

  async performHealthCheck() {
    try {
      // Check each service
      for (const [serviceName, process] of this.services) {
        if (process && !process.killed) {
          const isHealthy = await this.checkServiceHealth(serviceName);
          this.systemHealth[serviceName] = {
            status: isHealthy ? 'healthy' : 'error',
            lastCheck: Date.now(),
            errors: isHealthy ? 0 : (this.systemHealth[serviceName]?.errors || 0) + 1
          };
        }
      }

      // Update overall health
      this.updateOverallHealth();
      
      // Emit health update
      this.emit('healthUpdate', this.systemHealth);
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  updateOverallHealth() {
    const services = Object.values(this.systemHealth).filter(h => h.status !== 'unknown');
    const healthyServices = services.filter(h => h.status === 'healthy').length;
    const totalServices = services.length;

    if (healthyServices === totalServices) {
      this.systemHealth.overall = 'excellent';
    } else if (healthyServices > totalServices / 2) {
      this.systemHealth.overall = 'warning';
    } else {
      this.systemHealth.overall = 'critical';
    }
  }

  setupPerformanceTracking() {
    console.log('📊 Setting up performance tracking...');
    
    // Track uptime
    this.startTime = Date.now();
    setInterval(() => {
      this.performanceMetrics.uptime = Date.now() - this.startTime;
    }, 1000);

    // Listen for system events
    this.on('serviceOutput', () => {
      this.performanceMetrics.requestsProcessed++;
    });

    this.on('serviceError', () => {
      this.performanceMetrics.errorsEncountered++;
    });
  }

  setupNotificationSystem() {
    console.log('🔔 Setting up notification system...');
    
    // Listen for blockchain events
    if (global.blockchainSystem) {
      global.blockchainSystem.on('blockMined', (block) => {
        this.performanceMetrics.lastMiningReward = Date.now();
        this.emit('blockMined', block);
        this.sendNotification('mining', `Block #${block.blockNumber} mined!`);
      });

      global.blockchainSystem.on('healthUpdate', (health) => {
        this.systemHealth.blockchain = {
          status: health.isHealthy ? 'healthy' : 'error',
          lastCheck: Date.now(),
          errors: health.isHealthy ? 0 : (this.systemHealth.blockchain?.errors || 0) + 1
        };
      });
    }

    // Listen for crawler events
    if (global.crawlerSystem) {
      global.crawlerSystem.on('optimizationComplete', (result) => {
        this.performanceMetrics.lastOptimization = Date.now();
        this.emit('optimizationComplete', result);
        this.sendNotification('optimization', `Optimized ${result.url} - saved ${result.spaceSaved}MB`);
      });

      global.crawlerSystem.on('healthUpdate', (health) => {
        this.systemHealth.crawler = {
          status: health.isHealthy ? 'healthy' : 'error',
          lastCheck: Date.now(),
          errors: health.isHealthy ? 0 : (this.systemHealth.crawler?.errors || 0) + 1
        };
      });
    }

    // Periodic system notifications
    this.notificationInterval = setInterval(() => {
      this.sendPeriodicNotifications();
    }, 300000); // Every 5 minutes
  }

  sendNotification(type, message) {
    // In a real implementation, this would send push notifications
    console.log(`🔔 [${type.toUpperCase()}] ${message}`);
    this.emit('notification', { type, message });
  }

  sendPeriodicNotifications() {
    const uptime = Math.floor(this.performanceMetrics.uptime / 60000); // minutes
    if (uptime > 0 && uptime % 30 === 0) { // Every 30 minutes
      this.sendNotification('system', `System running for ${uptime} minutes`);
    }
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      if (this.isShuttingDown) return;
      
      this.isShuttingDown = true;
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      
      await this.shutdown();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGHUP', () => shutdown('SIGHUP'));
  }

  async shutdown() {
    console.log('🛑 Shutting down LightDom System Integration...');

    // Clear intervals
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }

    // Stop services
    for (const [serviceName, process] of this.services) {
      if (process && !process.killed) {
        console.log(`🛑 Stopping ${serviceName}...`);
        
        try {
          process.kill('SIGTERM');
          
          // Wait for graceful shutdown
          await new Promise((resolve) => {
            const timeout = setTimeout(() => {
              console.log(`⚠️ Force killing ${serviceName}...`);
              process.kill('SIGKILL');
              resolve();
            }, 5000);

            process.on('exit', () => {
              clearTimeout(timeout);
              resolve();
            });
          });
          
          console.log(`✅ ${serviceName} stopped`);
        } catch (error) {
          console.error(`❌ Error stopping ${serviceName}:`, error);
        }
      }
    }

    console.log('✅ LightDom System Integration shutdown complete');
  }

  getSystemStatus() {
    return {
      isRunning: this.isRunning,
      health: this.systemHealth,
      performance: this.performanceMetrics,
      services: Array.from(this.services.keys()).map(name => ({
        name,
        running: this.services.get(name) && !this.services.get(name).killed
      }))
    };
  }

  getHealthReport() {
    return {
      overall: this.systemHealth.overall,
      services: this.systemHealth,
      uptime: this.performanceMetrics.uptime,
      requestsProcessed: this.performanceMetrics.requestsProcessed,
      errorsEncountered: this.performanceMetrics.errorsEncountered,
      lastOptimization: this.performanceMetrics.lastOptimization,
      lastMiningReward: this.performanceMetrics.lastMiningReward
    };
  }
}

// Create and start the system integration
const systemIntegration = new LightDomSystemIntegration();

// Start the system
systemIntegration.initialize().then((success) => {
  if (success) {
    console.log('🎉 LightDom System Integration is running!');
    console.log('🌐 Frontend: http://localhost:3000');
    console.log('🔧 API Server: http://localhost:3001');
    console.log('⛏️ Blockchain: Enhanced mining system active');
    console.log('🕷️ Crawler: Enhanced web crawler active');
    console.log('🔔 Notifications: PWA notification system active');
    console.log('📊 Monitoring: Health monitoring and performance tracking active');
    
    // Log system status every 5 minutes
    setInterval(() => {
      const status = systemIntegration.getSystemStatus();
      console.log('📊 System Status:', status.health.overall);
    }, 300000);
    
  } else {
    console.error('💥 Failed to start LightDom System Integration');
    process.exit(1);
  }
});

export { systemIntegration, LightDomSystemIntegration };
