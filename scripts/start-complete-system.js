#!/usr/bin/env node

/**
 * LightDom Complete System Startup Script
 * Automatically starts all services: API server, blockchain, crawler, and frontend
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class LightDomSystemManager {
  constructor() {
    this.processes = new Map();
    this.isShuttingDown = false;
    this.startupOrder = [
      'database',
      'api-server',
      'enhanced-systems',
      'frontend'
    ];
  }

  async start() {
    console.log('🚀 Starting LightDom Complete System...');
    console.log('=====================================');

    try {
      // Check prerequisites
      await this.checkPrerequisites();

      // Start services in order
      for (const service of this.startupOrder) {
        await this.startService(service);
        await this.waitForService(service);
      }

      console.log('✅ All services started successfully!');
      console.log('🌐 Frontend: http://localhost:3000');
      console.log('🔧 API Server: http://localhost:3001');
      console.log('⛏️ Blockchain: Running on port 8545');
      console.log('🕷️ Crawler: Active and monitoring');
      console.log('📊 Database: Connected and ready');

      // Setup graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      console.error('❌ Failed to start system:', error);
      await this.shutdown();
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');

    // Check if Node.js is available
    try {
      const { execSync } = await import('child_process');
      execSync('node --version', { stdio: 'pipe' });
      console.log('✅ Node.js is available');
    } catch (error) {
      throw new Error('Node.js is not installed or not in PATH');
    }

    // Check if npm is available
    try {
      const { execSync } = await import('child_process');
      execSync('npm --version', { stdio: 'pipe' });
      console.log('✅ npm is available');
    } catch (error) {
      throw new Error('npm is not installed or not in PATH');
    }

    // Check if PostgreSQL is running (optional)
    try {
      const { execSync } = await import('child_process');
      execSync('pg_isready', { stdio: 'pipe' });
      console.log('✅ PostgreSQL is running');
    } catch (error) {
      console.log('⚠️ PostgreSQL not detected - will use mock data');
    }

    console.log('✅ Prerequisites check complete');
  }

  async startService(serviceName) {
    console.log(`🚀 Starting ${serviceName}...`);

    let command, args, cwd, env;

    switch (serviceName) {
      case 'database':
        command = 'node';
        args = ['scripts/db-health-check.cjs'];
        cwd = projectRoot;
        env = { ...process.env };
        break;

      case 'api-server':
        command = 'node';
        args = ['api-server-express.js'];
        cwd = projectRoot;
        env = { 
          ...process.env,
          PORT: '3001',
          NODE_ENV: 'development'
        };
        break;

      case 'enhanced-systems':
        command = 'node';
        args = ['scripts/start-enhanced-systems.js'];
        cwd = projectRoot;
        env = { 
          ...process.env,
          BLOCKCHAIN_RPC_URL: 'http://localhost:8545',
          CRAWLER_MAX_CONCURRENCY: '5'
        };
        break;

      case 'frontend':
        command = 'npm';
        args = ['run', 'dev'];
        cwd = projectRoot;
        env = { 
          ...process.env,
          VITE_PORT: '3000'
        };
        break;

      default:
        throw new Error(`Unknown service: ${serviceName}`);
    }

    const process = spawn(command, args, {
      cwd,
      env,
      stdio: 'pipe',
      shell: true
    });

    // Store process reference
    this.processes.set(serviceName, process);

    // Handle process output
    process.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.log(`[${serviceName}] ${output}`);
      }
    });

    process.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        console.error(`[${serviceName}] ${output}`);
      }
    });

    process.on('error', (error) => {
      console.error(`❌ Failed to start ${serviceName}:`, error);
    });

    process.on('exit', (code) => {
      if (!this.isShuttingDown) {
        console.error(`❌ ${serviceName} exited with code ${code}`);
        if (code !== 0) {
          this.shutdown();
        }
      }
    });
  }

  async waitForService(serviceName) {
    console.log(`⏳ Waiting for ${serviceName} to be ready...`);

    const maxWaitTime = 30000; // 30 seconds
    const checkInterval = 1000; // 1 second
    let elapsed = 0;

    return new Promise((resolve, reject) => {
      const checkService = async () => {
        try {
          const isReady = await this.checkServiceHealth(serviceName);
          if (isReady) {
            console.log(`✅ ${serviceName} is ready`);
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
      case 'database':
        try {
          const { execSync } = await import('child_process');
          execSync('node scripts/db-health-check.cjs', { stdio: 'pipe' });
          return true;
        } catch (error) {
          return false;
        }

      case 'api-server':
        try {
          const response = await fetch('http://localhost:3001/api/health');
          return response.ok;
        } catch (error) {
          return false;
        }

      case 'enhanced-systems':
        // Enhanced systems don't have a specific health endpoint
        // Just check if the process is still running
        const process = this.processes.get(serviceName);
        return process && !process.killed;

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
    console.log('🛑 Shutting down all services...');

    // Shutdown services in reverse order
    const shutdownOrder = [...this.startupOrder].reverse();

    for (const serviceName of shutdownOrder) {
      const process = this.processes.get(serviceName);
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

    console.log('✅ All services stopped');
  }

  getStatus() {
    const status = {};
    for (const [serviceName, process] of this.processes) {
      status[serviceName] = {
        running: process && !process.killed,
        pid: process ? process.pid : null
      };
    }
    return status;
  }
}

// Create and start the system manager
const systemManager = new LightDomSystemManager();

// Start the system
systemManager.start().catch((error) => {
  console.error('💥 System startup failed:', error);
  process.exit(1);
});

export { systemManager };
