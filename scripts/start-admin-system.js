#!/usr/bin/env node

/**
 * LightDom Complete Admin & Management System Startup
 * Launches all production management, admin dashboard, analytics, and monitoring systems
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class LightDomAdminSystemLauncher {
  constructor() {
    this.services = {
      productionDashboard: null,
      adminDashboard: null,
      analyticsSystem: null,
      healthMonitor: null,
      securityAudit: null,
      performanceTests: null,
      systemIntegration: null
    };
    
    this.servicePorts = {
      productionDashboard: 8080,
      adminDashboard: 8081,
      analyticsSystem: 8082,
      healthMonitor: 8083,
      systemIntegration: 8084
    };
    
    this.serviceStatus = {};
    this.isRunning = false;
  }

  async startAllServices() {
    console.log('🚀 Starting LightDom Complete Admin & Management System...');
    console.log('========================================================');
    
    try {
      // Start services in order
      await this.startService('productionDashboard');
      await this.delay(2000);
      
      await this.startService('adminDashboard');
      await this.delay(2000);
      
      await this.startService('analyticsSystem');
      await this.delay(2000);
      
      await this.startService('healthMonitor');
      await this.delay(2000);
      
      await this.startService('systemIntegration');
      await this.delay(2000);
      
      this.isRunning = true;
      
      // Start monitoring
      this.startServiceMonitoring();
      
      // Display service information
      this.displayServiceInformation();
      
      console.log('✅ All LightDom Admin & Management services started successfully!');
      
    } catch (error) {
      console.error('❌ Failed to start services:', error);
      process.exit(1);
    }
  }

  async startService(serviceName) {
    console.log(`🚀 Starting ${serviceName}...`);
    
    const scriptPath = this.getServiceScript(serviceName);
    if (!scriptPath) {
      throw new Error(`Unknown service: ${serviceName}`);
    }
    
    try {
      const service = spawn('node', [scriptPath], {
        cwd: projectRoot,
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      this.services[serviceName] = service;
      this.serviceStatus[serviceName] = {
        status: 'starting',
        pid: service.pid,
        port: this.servicePorts[serviceName],
        startedAt: new Date().toISOString()
      };
      
      // Handle service output
      service.stdout.on('data', (data) => {
        console.log(`[${serviceName}] ${data.toString().trim()}`);
      });
      
      service.stderr.on('data', (data) => {
        console.error(`[${serviceName}] ERROR: ${data.toString().trim()}`);
      });
      
      service.on('close', (code) => {
        console.log(`[${serviceName}] Process exited with code ${code}`);
        this.serviceStatus[serviceName].status = 'stopped';
        this.serviceStatus[serviceName].stoppedAt = new Date().toISOString();
      });
      
      service.on('error', (error) => {
        console.error(`[${serviceName}] Process error:`, error);
        this.serviceStatus[serviceName].status = 'error';
        this.serviceStatus[serviceName].error = error.message;
      });
      
      // Wait for service to be ready
      await this.waitForServiceReady(serviceName);
      
      console.log(`✅ ${serviceName} started successfully on port ${this.servicePorts[serviceName]}`);
      
    } catch (error) {
      console.error(`❌ Failed to start ${serviceName}:`, error.message);
      throw error;
    }
  }

  getServiceScript(serviceName) {
    const scripts = {
      productionDashboard: 'scripts/production-dashboard.js',
      adminDashboard: 'scripts/admin-dashboard.js',
      analyticsSystem: 'scripts/analytics-system.js',
      healthMonitor: 'scripts/health-monitor.js',
      systemIntegration: 'scripts/system-integration.js'
    };
    return scripts[serviceName];
  }

  async waitForServiceReady(serviceName) {
    const port = this.servicePorts[serviceName];
    const maxAttempts = 30;
    const delay = 1000;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`http://localhost:${port}/health`, {
          timeout: 1000
        });
        
        if (response.ok) {
          this.serviceStatus[serviceName].status = 'running';
          this.serviceStatus[serviceName].readyAt = new Date().toISOString();
          return;
        }
      } catch (error) {
        // Service not ready yet
      }
      
      await this.delay(delay);
    }
    
    // If we get here, the service didn't respond
    this.serviceStatus[serviceName].status = 'timeout';
    throw new Error(`Service ${serviceName} failed to start within timeout period`);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  startServiceMonitoring() {
    // Monitor services every 30 seconds
    setInterval(async () => {
      await this.checkServiceHealth();
    }, 30000);
    
    // Display status every 5 minutes
    setInterval(() => {
      this.displayServiceStatus();
    }, 300000);
  }

  async checkServiceHealth() {
    for (const [serviceName, service] of Object.entries(this.services)) {
      if (service && service.pid) {
        try {
          const port = this.servicePorts[serviceName];
          const response = await fetch(`http://localhost:${port}/health`, {
            timeout: 5000
          });
          
          if (response.ok) {
            this.serviceStatus[serviceName].status = 'running';
            this.serviceStatus[serviceName].lastHealthCheck = new Date().toISOString();
          } else {
            this.serviceStatus[serviceName].status = 'unhealthy';
          }
        } catch (error) {
          this.serviceStatus[serviceName].status = 'unhealthy';
          this.serviceStatus[serviceName].lastError = error.message;
        }
      }
    }
  }

  displayServiceInformation() {
    console.log('\n📊 LightDom Admin & Management System Information');
    console.log('==================================================');
    console.log('🔧 Production Dashboard: http://localhost:8080');
    console.log('🔐 Admin Dashboard: http://localhost:8081/admin');
    console.log('📈 Analytics Dashboard: http://localhost:8082/analytics');
    console.log('🏥 Health Monitor: http://localhost:8083');
    console.log('🚀 System Integration: http://localhost:8084');
    console.log('\n🔑 Default Admin Login: admin / admin123');
    console.log('\n📋 Available Commands:');
    console.log('  - npm run admin:start    - Start all admin services');
    console.log('  - npm run admin:stop     - Stop all admin services');
    console.log('  - npm run admin:restart  - Restart all admin services');
    console.log('  - npm run admin:status   - Check service status');
    console.log('\n🛠️ Individual Service Commands:');
    console.log('  - npm run admin:production  - Start production dashboard');
    console.log('  - npm run admin:dashboard   - Start admin dashboard');
    console.log('  - npm run admin:analytics   - Start analytics system');
    console.log('  - npm run admin:health      - Start health monitor');
    console.log('  - npm run admin:integration - Start system integration');
  }

  displayServiceStatus() {
    console.log('\n📊 Service Status Update');
    console.log('========================');
    
    for (const [serviceName, status] of Object.entries(this.serviceStatus)) {
      const statusIcon = this.getStatusIcon(status.status);
      const uptime = status.startedAt ? 
        Math.floor((Date.now() - new Date(status.startedAt).getTime()) / 1000) : 0;
      
      console.log(`${statusIcon} ${serviceName}: ${status.status} (PID: ${status.pid}, Port: ${status.port}, Uptime: ${uptime}s)`);
      
      if (status.error) {
        console.log(`   Error: ${status.error}`);
      }
    }
  }

  getStatusIcon(status) {
    const icons = {
      'running': '✅',
      'starting': '🔄',
      'stopped': '⏹️',
      'unhealthy': '⚠️',
      'error': '❌',
      'timeout': '⏰'
    };
    return icons[status] || '❓';
  }

  async stopAllServices() {
    console.log('\n🛑 Stopping all LightDom Admin & Management services...');
    
    for (const [serviceName, service] of Object.entries(this.services)) {
      if (service && service.pid) {
        try {
          console.log(`🛑 Stopping ${serviceName}...`);
          service.kill('SIGTERM');
          
          // Wait for graceful shutdown
          await new Promise(resolve => {
            service.on('close', resolve);
            setTimeout(resolve, 5000); // Force close after 5 seconds
          });
          
          this.serviceStatus[serviceName].status = 'stopped';
          this.serviceStatus[serviceName].stoppedAt = new Date().toISOString();
          
          console.log(`✅ ${serviceName} stopped`);
        } catch (error) {
          console.error(`❌ Failed to stop ${serviceName}:`, error.message);
        }
      }
    }
    
    this.isRunning = false;
    console.log('✅ All services stopped');
  }

  async restartAllServices() {
    console.log('\n🔄 Restarting all LightDom Admin & Management services...');
    await this.stopAllServices();
    await this.delay(5000);
    await this.startAllServices();
  }

  async getServiceStatus() {
    return {
      isRunning: this.isRunning,
      services: this.serviceStatus,
      timestamp: new Date().toISOString()
    };
  }

  // Handle graceful shutdown
  async handleShutdown() {
    console.log('\n🛑 Received shutdown signal, stopping all services...');
    await this.stopAllServices();
    process.exit(0);
  }
}

// Create launcher instance
const launcher = new LightDomAdminSystemLauncher();

// Handle process signals
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down...');
  await launcher.handleShutdown();
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  await launcher.handleShutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('❌ Uncaught Exception:', error);
  await launcher.handleShutdown();
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  await launcher.handleShutdown();
});

// Start all services
launcher.startAllServices().catch(async (error) => {
  console.error('❌ Failed to start services:', error);
  await launcher.handleShutdown();
});

export { LightDomAdminSystemLauncher };
