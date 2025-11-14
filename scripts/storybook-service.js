#!/usr/bin/env node

/**
 * Storybook Service Integration
 * 
 * This script ensures Storybook is started alongside other services in the LightDom platform.
 * It provides:
 * - Auto-start capability when services are launched
 * - Health check monitoring
 * - Integration with the main service orchestrator
 * - Graceful shutdown handling
 */

import { spawn } from 'child_process';
import http from 'http';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

class StorybookService {
  constructor(options = {}) {
    this.port = options.port || 6006;
    this.autoStart = options.autoStart !== false;
    this.process = null;
    this.healthCheckInterval = null;
    this.startTime = null;
  }

  async checkHealth() {
    return new Promise((resolve) => {
      const req = http.get(`http://localhost:${this.port}`, (res) => {
        resolve(res.statusCode === 200);
        req.destroy();
      });

      req.on('error', () => {
        resolve(false);
      });

      req.setTimeout(2000, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  async waitForHealth(maxAttempts = 30, delayMs = 1000) {
    console.log(`⏳ Waiting for Storybook to become healthy...`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const isHealthy = await this.checkHealth();
      
      if (isHealthy) {
        console.log(`✅ Storybook is healthy (attempt ${attempt}/${maxAttempts})`);
        return true;
      }
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    console.error(`❌ Storybook failed to become healthy after ${maxAttempts} attempts`);
    return false;
  }

  async start() {
    if (this.process) {
      console.log('⚠️  Storybook is already running');
      return false;
    }

    console.log('🚀 Starting Storybook...');
    console.log(`   Port: ${this.port}`);
    console.log(`   Directory: ${rootDir}`);
    console.log();

    this.startTime = Date.now();

    return new Promise((resolve, reject) => {
      this.process = spawn('npm', ['run', 'storybook'], {
        cwd: rootDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
        shell: true
      });

      let output = '';

      this.process.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // Look for success indicators
        if (text.includes('Storybook') && text.includes('started')) {
          console.log('📚 Storybook started successfully');
          console.log(`   URL: http://localhost:${this.port}`);
          console.log(`   Time: ${Date.now() - this.startTime}ms`);
          console.log();
          resolve(true);
        }
        
        // Stream important logs
        if (text.includes('Error') || text.includes('Warning')) {
          console.log(text);
        }
      });

      this.process.stderr.on('data', (data) => {
        const text = data.toString();
        
        // Filter out common noise
        if (!text.includes('ExperimentalWarning') && 
            !text.includes('punycode') &&
            !text.includes('DEP0040')) {
          console.error(text);
        }
      });

      this.process.on('error', (error) => {
        console.error('❌ Failed to start Storybook:', error.message);
        this.process = null;
        reject(error);
      });

      this.process.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          console.error(`❌ Storybook exited with code ${code}`);
        }
        this.process = null;
      });

      // Timeout fallback
      setTimeout(() => {
        if (this.process) {
          console.log('⏰ Storybook startup timeout - checking health...');
          this.waitForHealth(10, 1000).then(healthy => {
            if (healthy) {
              resolve(true);
            } else {
              reject(new Error('Storybook failed to start within timeout'));
            }
          });
        }
      }, 60000); // 60 second timeout
    });
  }

  async stop() {
    if (!this.process) {
      console.log('⚠️  Storybook is not running');
      return false;
    }

    console.log('🛑 Stopping Storybook...');

    return new Promise((resolve) => {
      this.process.on('exit', () => {
        console.log('✅ Storybook stopped');
        this.process = null;
        resolve(true);
      });

      // Try graceful shutdown first
      this.process.kill('SIGTERM');

      // Force kill after 5 seconds if still running
      setTimeout(() => {
        if (this.process) {
          console.log('⚠️  Forcing Storybook shutdown...');
          this.process.kill('SIGKILL');
        }
      }, 5000);
    });
  }

  async restart() {
    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 2000));
    return await this.start();
  }

  startHealthMonitoring(intervalMs = 30000) {
    if (this.healthCheckInterval) {
      return;
    }

    console.log(`🏥 Starting health monitoring (interval: ${intervalMs}ms)`);

    this.healthCheckInterval = setInterval(async () => {
      const isHealthy = await this.checkHealth();
      
      if (!isHealthy && this.process) {
        console.error('⚠️  Storybook health check failed - attempting restart...');
        await this.restart();
      }
    }, intervalMs);
  }

  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('🏥 Health monitoring stopped');
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || 'start';
  const service = new StorybookService();

  const commands = {
    start: async () => {
      try {
        await service.start();
        await service.waitForHealth();
        service.startHealthMonitoring();
        
        // Keep process alive
        console.log('✅ Storybook service is running');
        console.log('   Press Ctrl+C to stop\n');
        
        process.on('SIGINT', async () => {
          console.log('\n📝 Received SIGINT, shutting down...');
          service.stopHealthMonitoring();
          await service.stop();
          process.exit(0);
        });
        
      } catch (error) {
        console.error('❌ Failed to start Storybook service:', error.message);
        process.exit(1);
      }
    },
    
    stop: async () => {
      await service.stop();
      process.exit(0);
    },
    
    restart: async () => {
      await service.restart();
      await service.waitForHealth();
      console.log('✅ Storybook restarted successfully');
      process.exit(0);
    },
    
    health: async () => {
      const isHealthy = await service.checkHealth();
      if (isHealthy) {
        console.log('✅ Storybook is healthy');
        process.exit(0);
      } else {
        console.log('❌ Storybook is not healthy');
        process.exit(1);
      }
    },
    
    help: () => {
      console.log(`
Storybook Service Manager

Usage: node scripts/storybook-service.js [command]

Commands:
  start     Start Storybook with health monitoring (default)
  stop      Stop Storybook
  restart   Restart Storybook
  health    Check if Storybook is healthy
  help      Show this help message

Examples:
  node scripts/storybook-service.js start
  node scripts/storybook-service.js health
      `);
      process.exit(0);
    }
  };

  const handler = commands[command] || commands.help;
  handler();
}

export { StorybookService };
