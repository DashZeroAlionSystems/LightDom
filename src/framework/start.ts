#!/usr/bin/env node

/**
 * LightDom Framework - Unified Start Script
 * Single entry point that initializes and starts all services and workers
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

const execAsync = promisify(exec);

interface ServiceConfig {
  name: string;
  command: string;
  args: string[];
  cwd?: string;
  env?: Record<string, string>;
  restartOnFailure?: boolean;
  healthCheck?: {
    url?: string;
    port?: number;
    interval?: number;
    timeout?: number;
  };
}

interface FrameworkServices {
  database: ServiceConfig;
  redis: ServiceConfig;
  framework: ServiceConfig;
  api: ServiceConfig;
  simulation: ServiceConfig;
  workers: ServiceConfig;
  storage: ServiceConfig;
  mining: ServiceConfig;
  monitoring: ServiceConfig;
}

class LightDomFrameworkLauncher extends EventEmitter {
  private services: Map<string, any> = new Map();
  private isRunning = false;
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private config: FrameworkServices;

  constructor() {
    super();
    this.config = this.getDefaultConfig();
  }

  /**
   * Get default service configuration
   */
  private getDefaultConfig(): FrameworkServices {
    return {
      database: {
        name: 'postgresql',
        command: 'docker',
        args: ['run', '--name', 'lightdom-postgres', '-e', 'POSTGRES_PASSWORD=lightdom', '-e', 'POSTGRES_DB=lightdom', '-p', '5432:5432', '-d', 'postgres:15'],
        restartOnFailure: true,
        healthCheck: {
          port: 5432,
          interval: 5000,
          timeout: 10000
        }
      },
      redis: {
        name: 'redis',
        command: 'docker',
        args: ['run', '--name', 'lightdom-redis', '-p', '6379:6379', '-d', 'redis:7-alpine'],
        restartOnFailure: true,
        healthCheck: {
          port: 6379,
          interval: 5000,
          timeout: 10000
        }
      },
      framework: {
        name: 'lightdom-framework',
        command: 'node',
        args: ['dist/framework/FrameworkRunner.js'],
        cwd: process.cwd(),
        env: {
          NODE_ENV: 'production',
          LIGHTDOM_PORT: '3000',
          LIGHTDOM_DB_HOST: 'localhost',
          LIGHTDOM_DB_PORT: '5432',
          LIGHTDOM_REDIS_HOST: 'localhost',
          LIGHTDOM_REDIS_PORT: '6379'
        },
        restartOnFailure: true,
        healthCheck: {
          url: 'http://localhost:3000/health',
          interval: 10000,
          timeout: 5000
        }
      },
      api: {
        name: 'lightdom-api',
        command: 'node',
        args: ['dist/framework/APIGateway.js'],
        cwd: process.cwd(),
        env: {
          NODE_ENV: 'production',
          API_PORT: '3001',
          FRAMEWORK_URL: 'http://localhost:3000'
        },
        restartOnFailure: true,
        healthCheck: {
          url: 'http://localhost:3001/health',
          interval: 10000,
          timeout: 5000
        }
      },
      simulation: {
        name: 'lightdom-simulation',
        command: 'node',
        args: ['dist/framework/SimulationEngine.js'],
        cwd: process.cwd(),
        env: {
          NODE_ENV: 'production',
          SIMULATION_INTERVAL: '60000',
          FRAMEWORK_URL: 'http://localhost:3000'
        },
        restartOnFailure: true,
        healthCheck: {
          port: 3002,
          interval: 15000,
          timeout: 5000
        }
      },
      workers: {
        name: 'lightdom-workers',
        command: 'node',
        args: ['dist/framework/Workers.js'],
        cwd: process.cwd(),
        env: {
          NODE_ENV: 'production',
          WORKER_CONCURRENCY: '5',
          FRAMEWORK_URL: 'http://localhost:3000'
        },
        restartOnFailure: true,
        healthCheck: {
          port: 3003,
          interval: 15000,
          timeout: 5000
        }
      },
      storage: {
        name: 'lightdom-storage',
        command: 'node',
        args: ['dist/framework/StorageNodeManager.js'],
        cwd: process.cwd(),
        env: {
          NODE_ENV: 'production',
          STORAGE_MAX_NODES: '10',
          STORAGE_DEFAULT_CAPACITY: '10000',
          FRAMEWORK_URL: 'http://localhost:3000'
        },
        restartOnFailure: true,
        healthCheck: {
          port: 3005,
          interval: 15000,
          timeout: 5000
        }
      },
      mining: {
        name: 'lightdom-mining',
        command: 'node',
        args: ['dist/framework/WebAddressMiner.js'],
        cwd: process.cwd(),
        env: {
          NODE_ENV: 'production',
          MINING_MAX_CONCURRENT: '5',
          MINING_TIMEOUT: '60000',
          FRAMEWORK_URL: 'http://localhost:3000'
        },
        restartOnFailure: true,
        healthCheck: {
          port: 3006,
          interval: 15000,
          timeout: 5000
        }
      },
      monitoring: {
        name: 'lightdom-monitoring',
        command: 'node',
        args: ['dist/framework/MonitoringService.js'],
        cwd: process.cwd(),
        env: {
          NODE_ENV: 'production',
          MONITORING_PORT: '3004',
          FRAMEWORK_URL: 'http://localhost:3000'
        },
        restartOnFailure: true,
        healthCheck: {
          url: 'http://localhost:3004/health',
          interval: 15000,
          timeout: 5000
        }
      }
    };
  }

  /**
   * Start all services
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ LightDom Framework is already running');
      return;
    }

    try {
      console.log('🚀 Starting LightDom Framework...');
      console.log('=====================================');

      // Check prerequisites
      await this.checkPrerequisites();

      // Start services in order
      await this.startService('database');
      await this.startService('redis');
      await this.startService('framework');
      await this.startService('api');
      await this.startService('simulation');
      await this.startService('workers');
      await this.startService('storage');
      await this.startService('mining');
      await this.startService('monitoring');

      this.isRunning = true;
      this.emit('started');

      console.log('✅ LightDom Framework started successfully!');
      console.log('📊 Framework: http://localhost:3000');
      console.log('🌐 API Gateway: http://localhost:3001');
      console.log('📈 Monitoring: http://localhost:3004');
      console.log('📚 Documentation: http://localhost:3001/api/v1/docs');

      // Start health monitoring
      this.startHealthMonitoring();

    } catch (error) {
      console.error('❌ Failed to start LightDom Framework:', error);
      await this.stop();
      throw error;
    }
  }

  /**
   * Stop all services
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping LightDom Framework...');

    // Stop health monitoring
    this.stopHealthMonitoring();

    // Stop services in reverse order
    const serviceOrder = ['monitoring', 'workers', 'simulation', 'api', 'framework', 'redis', 'database'];
    
    for (const serviceName of serviceOrder) {
      await this.stopService(serviceName);
    }

    this.isRunning = false;
    this.emit('stopped');

    console.log('✅ LightDom Framework stopped successfully!');
  }

  /**
   * Restart all services
   */
  async restart(): Promise<void> {
    console.log('🔄 Restarting LightDom Framework...');
    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await this.start();
  }

  /**
   * Check prerequisites
   */
  private async checkPrerequisites(): Promise<void> {
    console.log('🔍 Checking prerequisites...');

    // Check if Docker is installed
    try {
      await execAsync('docker --version');
      console.log('✅ Docker is installed');
    } catch (error) {
      throw new Error('Docker is not installed. Please install Docker to run the framework.');
    }

    // Check if Node.js version is compatible
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 18) {
      throw new Error(`Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`);
    }
    console.log(`✅ Node.js ${nodeVersion} is compatible`);

    // Check if required files exist
    const requiredFiles = [
      'dist/framework/FrameworkRunner.js',
      'dist/framework/APIGateway.js',
      'dist/framework/SimulationEngine.js'
    ];

    for (const file of requiredFiles) {
      try {
        await fs.access(file);
        console.log(`✅ ${file} exists`);
      } catch (error) {
        throw new Error(`Required file ${file} not found. Please build the project first.`);
      }
    }

    console.log('✅ All prerequisites met');
  }

  /**
   * Start a specific service
   */
  private async startService(serviceName: string): Promise<void> {
    const config = this.config[serviceName as keyof FrameworkServices];
    if (!config) {
      throw new Error(`Unknown service: ${serviceName}`);
    }

    console.log(`🚀 Starting ${config.name}...`);

    try {
      const child = spawn(config.command, config.args, {
        cwd: config.cwd || process.cwd(),
        env: { ...process.env, ...config.env },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Store service process
      this.services.set(serviceName, child);

      // Handle service output
      child.stdout?.on('data', (data) => {
        console.log(`[${config.name}] ${data.toString().trim()}`);
      });

      child.stderr?.on('data', (data) => {
        console.error(`[${config.name}] ${data.toString().trim()}`);
      });

      // Handle service exit
      child.on('exit', (code) => {
        console.log(`[${config.name}] Process exited with code ${code}`);
        if (config.restartOnFailure && code !== 0) {
          console.log(`[${config.name}] Restarting due to failure...`);
          setTimeout(() => this.startService(serviceName), 5000);
        }
      });

      // Wait for service to be ready
      if (config.healthCheck) {
        await this.waitForService(serviceName, config.healthCheck);
      }

      console.log(`✅ ${config.name} started successfully`);

    } catch (error) {
      console.error(`❌ Failed to start ${config.name}:`, error);
      throw error;
    }
  }

  /**
   * Stop a specific service
   */
  private async stopService(serviceName: string): Promise<void> {
    const child = this.services.get(serviceName);
    if (!child) {
      return;
    }

    console.log(`🛑 Stopping ${serviceName}...`);

    try {
      child.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise((resolve) => {
        child.on('exit', resolve);
        setTimeout(() => {
          child.kill('SIGKILL');
          resolve(undefined);
        }, 10000); // Force kill after 10 seconds
      });

      this.services.delete(serviceName);
      console.log(`✅ ${serviceName} stopped`);

    } catch (error) {
      console.error(`❌ Error stopping ${serviceName}:`, error);
    }
  }

  /**
   * Wait for service to be ready
   */
  private async waitForService(serviceName: string, healthCheck: any): Promise<void> {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        if (healthCheck.url) {
          const response = await fetch(healthCheck.url);
          if (response.ok) {
            return;
          }
        } else if (healthCheck.port) {
          // Simple port check
          const net = await import('net');
          const socket = new net.Socket();
          await new Promise((resolve, reject) => {
            socket.connect(healthCheck.port, 'localhost', resolve);
            socket.on('error', reject);
          });
          socket.destroy();
          return;
        }
      } catch (error) {
        // Service not ready yet
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
    }

    throw new Error(`Service ${serviceName} failed to start within timeout period`);
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    console.log('📊 Starting health monitoring...');

    for (const [serviceName, config] of Object.entries(this.config)) {
      if (config.healthCheck) {
        const interval = setInterval(async () => {
          try {
            await this.checkServiceHealth(serviceName, config.healthCheck!);
          } catch (error) {
            console.error(`❌ Health check failed for ${serviceName}:`, error);
            if (config.restartOnFailure) {
              console.log(`🔄 Restarting ${serviceName} due to health check failure...`);
              await this.stopService(serviceName);
              await this.startService(serviceName);
            }
          }
        }, config.healthCheck.interval || 30000);

        this.healthCheckIntervals.set(serviceName, interval);
      }
    }
  }

  /**
   * Stop health monitoring
   */
  private stopHealthMonitoring(): void {
    for (const [serviceName, interval] of this.healthCheckIntervals) {
      clearInterval(interval);
    }
    this.healthCheckIntervals.clear();
  }

  /**
   * Check service health
   */
  private async checkServiceHealth(serviceName: string, healthCheck: any): Promise<void> {
    if (healthCheck.url) {
      const response = await fetch(healthCheck.url);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
    } else if (healthCheck.port) {
      const net = await import('net');
      const socket = new net.Socket();
      await new Promise((resolve, reject) => {
        socket.connect(healthCheck.port, 'localhost', resolve);
        socket.on('error', reject);
        setTimeout(() => reject(new Error('Health check timeout')), healthCheck.timeout || 5000);
      });
      socket.destroy();
    }
  }

  /**
   * Get service status
   */
  getStatus(): { running: boolean; services: Record<string, any> } {
    const services: Record<string, any> = {};
    
    for (const [serviceName, child] of this.services) {
      services[serviceName] = {
        running: !child.killed,
        pid: child.pid,
        exitCode: child.exitCode
      };
    }

    return {
      running: this.isRunning,
      services
    };
  }

  /**
   * Get service logs
   */
  async getServiceLogs(serviceName: string): Promise<string[]> {
    const child = this.services.get(serviceName);
    if (!child) {
      return [];
    }

    // In a real implementation, you would collect logs from the service
    return [`Service ${serviceName} logs would be here`];
  }
}

// Create launcher instance
const launcher = new LightDomFrameworkLauncher();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM. Shutting down gracefully...');
  await launcher.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT. Shutting down gracefully...');
  await launcher.stop();
  process.exit(0);
});

// Export launcher
export default launcher;

// If running directly
if (require.main === module) {
  launcher.start().catch(error => {
    console.error('❌ Failed to start framework:', error);
    process.exit(1);
  });
}
