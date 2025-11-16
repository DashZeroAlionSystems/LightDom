/**
 * System Startup Orchestrator
 * 
 * Comprehensive system that:
 * - Starts all services in correct order
 * - Monitors service health
 * - Restarts failed services
 * - Provides dashboard
 * - Manages process flows
 * 
 * Services managed:
 * - Database
 * - API Server
 * - Codebase Indexer
 * - TensorFlow Model
 * - Autonomous Agent
 * - Data Mining
 * - Frontend
 */

import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import axios from 'axios';

export class SystemStartupOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      autoRestart: config.autoRestart !== false,
      healthCheckInterval: config.healthCheckInterval || 30000,
      maxRestarts: config.maxRestarts || 3,
      startupTimeout: config.startupTimeout || 60000,
      ...config,
    };

    this.services = new Map();
    this.isRunning = false;
    this.healthCheckTimer = null;
    
    this.defineServices();
  }

  /**
   * Define all system services
   */
  defineServices() {
    // Database
    this.services.set('database', {
      name: 'PostgreSQL Database',
      command: 'pg_ctl',
      args: ['start', '-D', process.env.PGDATA || '/var/lib/postgresql/data'],
      healthCheck: async () => {
        try {
          const { Pool } = await import('pg');
          const pool = new Pool({ connectionString: process.env.DATABASE_URL });
          await pool.query('SELECT 1');
          await pool.end();
          return true;
        } catch (error) {
          return false;
        }
      },
      priority: 1,
      critical: true,
    });

    // API Server
    this.services.set('api', {
      name: 'API Server',
      command: 'node',
      args: ['api-server-express.js'],
      healthCheck: async () => {
        try {
          const response = await axios.get('http://localhost:3001/health');
          return response.status === 200;
        } catch (error) {
          return false;
        }
      },
      priority: 2,
      critical: true,
      dependsOn: ['database'],
    });

    // Frontend
    this.services.set('frontend', {
      name: 'Frontend Dev Server',
      command: 'npm',
      args: ['run', 'dev'],
      healthCheck: async () => {
        try {
          const response = await axios.get('http://localhost:3000');
          return response.status === 200;
        } catch (error) {
          return false;
        }
      },
      priority: 3,
      critical: false,
      dependsOn: ['api'],
    });

    // Codebase Indexer
    this.services.set('indexer', {
      name: 'Codebase Indexer',
      command: 'node',
      args: ['examples/codebase-indexing-example.js'],
      healthCheck: async () => true, // One-time job
      priority: 4,
      critical: false,
      dependsOn: ['database'],
      oneTime: true,
    });

    // TensorFlow Model Training
    this.services.set('tensorflow', {
      name: 'TensorFlow Model',
      command: 'node',
      args: ['scripts/train-tensorflow-model.js'],
      healthCheck: async () => true,
      priority: 5,
      critical: false,
      dependsOn: ['database', 'indexer'],
      oneTime: true,
    });

    // Autonomous Agent
    this.services.set('agent', {
      name: 'Autonomous Agent',
      command: 'node',
      args: ['examples/autonomous-agent-example.js'],
      healthCheck: async () => {
        try {
          const response = await axios.get('http://localhost:3001/api/agents/status');
          return response.status === 200;
        } catch (error) {
          return false;
        }
      },
      priority: 6,
      critical: false,
      dependsOn: ['api', 'tensorflow'],
    });
  }

  /**
   * Start all services
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  System already running');
      return;
    }
    
    console.log('🚀 Starting LightDom System...\n');
    this.isRunning = true;
    
    try {
      // Sort services by priority
      const sortedServices = Array.from(this.services.entries())
        .sort((a, b) => a[1].priority - b[1].priority);
      
      // Start services in order
      for (const [serviceId, service] of sortedServices) {
        await this.startService(serviceId, service);
      }
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      console.log('\n✅ System startup complete!');
      console.log('\n📊 Service Status:');
      await this.printStatus();
      
      this.emit('system:started');
      
    } catch (error) {
      console.error('\n❌ System startup failed:', error);
      await this.stop();
      throw error;
    }
  }

  /**
   * Start individual service
   */
  async startService(serviceId, service) {
    console.log(`🔧 Starting ${service.name}...`);
    
    // Check dependencies
    if (service.dependsOn) {
      for (const depId of service.dependsOn) {
        const dep = this.services.get(depId);
        if (!dep.process && !dep.healthy) {
          throw new Error(`Dependency ${dep.name} not running`);
        }
      }
    }
    
    // Start process
    const process = spawn(service.command, service.args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
      env: { ...process.env },
    });
    
    service.process = process;
    service.restarts = 0;
    service.startedAt = Date.now();
    
    // Handle output
    process.stdout.on('data', (data) => {
      this.emit('service:output', { serviceId, data: data.toString() });
    });
    
    process.stderr.on('data', (data) => {
      this.emit('service:error', { serviceId, data: data.toString() });
    });
    
    // Handle exit
    process.on('exit', (code) => {
      this.handleServiceExit(serviceId, service, code);
    });
    
    // Wait for service to be healthy
    if (!service.oneTime) {
      const healthy = await this.waitForHealthy(serviceId, service);
      
      if (healthy) {
        console.log(`✅ ${service.name} started`);
        service.healthy = true;
      } else {
        console.log(`⚠️  ${service.name} started but health check failed`);
      }
    } else {
      console.log(`✅ ${service.name} started (one-time job)`);
    }
  }

  /**
   * Wait for service to become healthy
   */
  async waitForHealthy(serviceId, service, timeout = this.config.startupTimeout) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const healthy = await service.healthCheck();
        if (healthy) {
          return true;
        }
      } catch (error) {
        // Ignore errors during startup
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return false;
  }

  /**
   * Handle service exit
   */
  async handleServiceExit(serviceId, service, code) {
    console.log(`⚠️  ${service.name} exited with code ${code}`);
    
    service.healthy = false;
    
    if (service.oneTime) {
      // One-time jobs don't need restart
      return;
    }
    
    if (this.config.autoRestart && service.restarts < this.config.maxRestarts) {
      console.log(`🔄 Restarting ${service.name}...`);
      service.restarts++;
      
      setTimeout(async () => {
        await this.startService(serviceId, service);
      }, 5000);
    } else {
      console.log(`❌ ${service.name} failed to restart`);
      
      if (service.critical) {
        console.log('⚠️  Critical service failed, stopping system');
        await this.stop();
      }
    }
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    this.healthCheckTimer = setInterval(async () => {
      await this.checkAllHealth();
    }, this.config.healthCheckInterval);
    
    console.log(`💓 Health monitoring started (interval: ${this.config.healthCheckInterval}ms)`);
  }

  /**
   * Check health of all services
   */
  async checkAllHealth() {
    for (const [serviceId, service] of this.services) {
      if (service.oneTime || !service.process) continue;
      
      try {
        const healthy = await service.healthCheck();
        
        if (!healthy && service.healthy) {
          console.log(`⚠️  ${service.name} health check failed`);
          service.healthy = false;
          
          this.emit('service:unhealthy', { serviceId, service });
        } else if (healthy && !service.healthy) {
          console.log(`✅ ${service.name} recovered`);
          service.healthy = true;
          
          this.emit('service:recovered', { serviceId, service });
        }
      } catch (error) {
        console.error(`Health check error for ${service.name}:`, error.message);
      }
    }
  }

  /**
   * Stop all services
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }
    
    console.log('\n🛑 Stopping system...');
    this.isRunning = false;
    
    // Stop health monitoring
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    
    // Stop services in reverse priority
    const sortedServices = Array.from(this.services.entries())
      .sort((a, b) => b[1].priority - a[1].priority);
    
    for (const [serviceId, service] of sortedServices) {
      if (service.process) {
        console.log(`Stopping ${service.name}...`);
        
        service.process.kill('SIGTERM');
        
        // Wait for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Force kill if still running
        if (!service.process.killed) {
          service.process.kill('SIGKILL');
        }
        
        service.process = null;
        service.healthy = false;
      }
    }
    
    console.log('✅ System stopped');
    this.emit('system:stopped');
  }

  /**
   * Get system status
   */
  getStatus() {
    const status = {
      isRunning: this.isRunning,
      services: {},
    };
    
    for (const [serviceId, service] of this.services) {
      status.services[serviceId] = {
        name: service.name,
        healthy: service.healthy || false,
        running: !!service.process,
        restarts: service.restarts || 0,
        uptime: service.startedAt ? Date.now() - service.startedAt : 0,
      };
    }
    
    return status;
  }

  /**
   * Print status to console
   */
  async printStatus() {
    const status = this.getStatus();
    
    for (const [serviceId, serviceStatus] of Object.entries(status.services)) {
      const icon = serviceStatus.healthy ? '✅' : (serviceStatus.running ? '⚠️' : '❌');
      const uptime = serviceStatus.uptime ? `${(serviceStatus.uptime / 1000).toFixed(0)}s` : 'N/A';
      
      console.log(`${icon} ${serviceStatus.name}: ${serviceStatus.running ? 'Running' : 'Stopped'} (uptime: ${uptime})`);
    }
  }

  /**
   * Restart specific service
   */
  async restartService(serviceId) {
    const service = this.services.get(serviceId);
    
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }
    
    console.log(`🔄 Restarting ${service.name}...`);
    
    // Stop service
    if (service.process) {
      service.process.kill('SIGTERM');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Start service
    await this.startService(serviceId, service);
  }
}

export default SystemStartupOrchestrator;
