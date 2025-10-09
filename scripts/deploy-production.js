#!/usr/bin/env node

/**
 * LightDom Production Deployment Script
 * Handles production deployment with monitoring, scaling, and health checks
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class LightDomProductionDeployment {
  constructor() {
    this.environment = process.env.NODE_ENV || 'production';
    this.config = {
      api: {
        port: process.env.PORT || 3001,
        host: process.env.HOST || '0.0.0.0',
        workers: process.env.API_WORKERS || os.cpus().length
      },
      frontend: {
        port: process.env.FRONTEND_PORT || 3000,
        buildPath: './dist'
      },
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME || 'dom_space_harvester',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.DB_SSL === 'true'
      },
      blockchain: {
        rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
        chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID) || 1337,
        miningInterval: parseInt(process.env.MINING_INTERVAL) || 30000
      },
      crawler: {
        maxConcurrency: parseInt(process.env.CRAWLER_MAX_CONCURRENCY) || 5,
        requestDelay: parseInt(process.env.CRAWLER_REQUEST_DELAY) || 2000,
        maxDepth: parseInt(process.env.CRAWLER_MAX_DEPTH) || 2
      },
      monitoring: {
        enabled: process.env.MONITORING_ENABLED === 'true',
        port: process.env.MONITORING_PORT || 9090,
        metricsPath: process.env.METRICS_PATH || '/metrics'
      },
      security: {
        corsOrigin: process.env.CORS_ORIGIN || '*',
        rateLimit: parseInt(process.env.RATE_LIMIT) || 100,
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
        encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key'
      }
    };
    
    this.processes = new Map();
    this.healthChecks = new Map();
    this.isDeployed = false;
  }

  async deploy() {
    console.log('🚀 Starting LightDom Production Deployment...');
    console.log('==============================================');
    
    try {
      // Pre-deployment checks
      await this.preDeploymentChecks();
      
      // Build frontend
      await this.buildFrontend();
      
      // Setup database
      await this.setupDatabase();
      
      // Start services
      await this.startServices();
      
      // Setup monitoring
      await this.setupMonitoring();
      
      // Setup health checks
      await this.setupHealthChecks();
      
      // Setup graceful shutdown
      this.setupGracefulShutdown();
      
      this.isDeployed = true;
      console.log('✅ Production deployment completed successfully!');
      
      // Display deployment info
      this.displayDeploymentInfo();
      
    } catch (error) {
      console.error('❌ Production deployment failed:', error);
      await this.cleanup();
      process.exit(1);
    }
  }

  async preDeploymentChecks() {
    console.log('🔍 Running pre-deployment checks...');
    
    const checks = [
      { name: 'Node.js Version', check: () => this.checkNodeVersion() },
      { name: 'Database Connection', check: () => this.checkDatabaseConnection() },
      { name: 'Environment Variables', check: () => this.checkEnvironmentVariables() },
      { name: 'Port Availability', check: () => this.checkPortAvailability() },
      { name: 'Disk Space', check: () => this.checkDiskSpace() },
      { name: 'Memory Available', check: () => this.checkMemoryAvailable() }
    ];

    for (const { name, check } of checks) {
      try {
        await check();
        console.log(`✅ ${name}: OK`);
      } catch (error) {
        throw new Error(`${name} check failed: ${error.message}`);
      }
    }
    
    console.log('✅ Pre-deployment checks completed');
  }

  async checkNodeVersion() {
    const { execSync } = await import('child_process');
    const version = execSync('node --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      throw new Error(`Node.js version ${version} is not supported. Minimum version is 18.0.0`);
    }
  }

  async checkDatabaseConnection() {
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: this.config.database.host,
      port: this.config.database.port,
      database: this.config.database.name,
      user: this.config.database.user,
      password: this.config.database.password,
      ssl: this.config.database.ssl ? { rejectUnauthorized: false } : false
    });

    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    } finally {
      await pool.end();
    }
  }

  async checkEnvironmentVariables() {
    const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  async checkPortAvailability() {
    const netstat = await import('net');
    const ports = [this.config.api.port, this.config.frontend.port, this.config.monitoring.port];
    
    for (const port of ports) {
      const isAvailable = await new Promise((resolve) => {
        const server = netstat.createServer();
        server.listen(port, () => {
          server.close(() => resolve(true));
        });
        server.on('error', () => resolve(false));
      });
      
      if (!isAvailable) {
        throw new Error(`Port ${port} is not available`);
      }
    }
  }

  async checkDiskSpace() {
    const { execSync } = await import('child_process');
    try {
      const output = execSync('df -h .', { encoding: 'utf8' });
      const lines = output.split('\n');
      const dataLine = lines[1];
      const available = dataLine.split(/\s+/)[3];
      
      console.log(`💾 Available disk space: ${available}`);
    } catch (error) {
      console.warn('⚠️ Could not check disk space');
    }
  }

  async checkMemoryAvailable() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;
    
    console.log(`🧠 Memory usage: ${memUsagePercent.toFixed(1)}%`);
    
    if (memUsagePercent > 90) {
      throw new Error('Memory usage is too high (>90%)');
    }
  }

  async buildFrontend() {
    console.log('🏗️ Building frontend for production...');
    
    try {
      const { execSync } = await import('child_process');
      execSync('npm run build', { 
        cwd: projectRoot, 
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      console.log('✅ Frontend build completed');
    } catch (error) {
      throw new Error(`Frontend build failed: ${error.message}`);
    }
  }

  async setupDatabase() {
    console.log('🗄️ Setting up production database...');
    
    try {
      const { execSync } = await import('child_process');
      execSync('npm run db:migrate', { 
        cwd: projectRoot, 
        stdio: 'inherit' 
      });
      
      console.log('✅ Database setup completed');
    } catch (error) {
      console.warn('⚠️ Database migration failed, continuing...');
    }
  }

  async startServices() {
    console.log('🚀 Starting production services...');
    
    // Start API server with clustering
    await this.startAPIServer();
    
    // Start enhanced systems
    await this.startEnhancedSystems();
    
    // Start frontend server
    await this.startFrontendServer();
    
    console.log('✅ All services started');
  }

  async startAPIServer() {
    console.log('🔧 Starting API server...');
    
    const process = spawn('node', ['api-server-express.js'], {
      cwd: projectRoot,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: this.config.api.port,
        HOST: this.config.api.host
      },
      stdio: 'pipe'
    });

    this.processes.set('api-server', process);

    process.stdout.on('data', (data) => {
      console.log(`[API] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[API] ${data.toString().trim()}`);
    });

    process.on('exit', (code) => {
      if (!this.isDeployed) return;
      console.error(`❌ API server exited with code ${code}`);
    });

    // Wait for API server to be ready
    await this.waitForService('api-server', `http://localhost:${this.config.api.port}/api/health`);
  }

  async startEnhancedSystems() {
    console.log('⛏️ Starting enhanced systems...');
    
    const process = spawn('node', ['scripts/start-enhanced-systems.js'], {
      cwd: projectRoot,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        BLOCKCHAIN_RPC_URL: this.config.blockchain.rpcUrl,
        CRAWLER_MAX_CONCURRENCY: this.config.crawler.maxConcurrency
      },
      stdio: 'pipe'
    });

    this.processes.set('enhanced-systems', process);

    process.stdout.on('data', (data) => {
      console.log(`[Enhanced] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[Enhanced] ${data.toString().trim()}`);
    });

    process.on('exit', (code) => {
      if (!this.isDeployed) return;
      console.error(`❌ Enhanced systems exited with code ${code}`);
    });

    // Give enhanced systems time to start
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  async startFrontendServer() {
    console.log('🌐 Starting frontend server...');
    
    const process = spawn('node', ['scripts/serve-frontend.js'], {
      cwd: projectRoot,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: this.config.frontend.port
      },
      stdio: 'pipe'
    });

    this.processes.set('frontend-server', process);

    process.stdout.on('data', (data) => {
      console.log(`[Frontend] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[Frontend] ${data.toString().trim()}`);
    });

    process.on('exit', (code) => {
      if (!this.isDeployed) return;
      console.error(`❌ Frontend server exited with code ${code}`);
    });

    // Wait for frontend server to be ready
    await this.waitForService('frontend-server', `http://localhost:${this.config.frontend.port}`);
  }

  async waitForService(serviceName, healthUrl) {
    const maxWaitTime = 30000; // 30 seconds
    const checkInterval = 1000; // 1 second
    let elapsed = 0;

    while (elapsed < maxWaitTime) {
      try {
        const response = await fetch(healthUrl);
        if (response.ok) {
          console.log(`✅ ${serviceName} is ready`);
          return;
        }
      } catch (error) {
        // Continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      elapsed += checkInterval;
    }
    
    throw new Error(`${serviceName} failed to start within ${maxWaitTime}ms`);
  }

  async setupMonitoring() {
    if (!this.config.monitoring.enabled) {
      console.log('📊 Monitoring disabled, skipping...');
      return;
    }

    console.log('📊 Setting up monitoring...');
    
    // Start monitoring server
    await this.startMonitoringServer();
    
    // Setup metrics collection
    await this.setupMetricsCollection();
    
    console.log('✅ Monitoring setup completed');
  }

  async startMonitoringServer() {
    const process = spawn('node', ['scripts/monitoring-server.js'], {
      cwd: projectRoot,
      env: {
        ...process.env,
        MONITORING_PORT: this.config.monitoring.port,
        METRICS_PATH: this.config.monitoring.metricsPath
      },
      stdio: 'pipe'
    });

    this.processes.set('monitoring-server', process);

    process.stdout.on('data', (data) => {
      console.log(`[Monitoring] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[Monitoring] ${data.toString().trim()}`);
    });
  }

  async setupMetricsCollection() {
    // Setup metrics collection for all services
    const metricsInterval = setInterval(async () => {
      try {
        await this.collectMetrics();
      } catch (error) {
        console.error('Metrics collection failed:', error);
      }
    }, 30000); // Every 30 seconds

    this.healthChecks.set('metrics-collection', metricsInterval);
  }

  async collectMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: os.platform(),
        arch: os.arch()
      },
      services: {}
    };

    // Collect service-specific metrics
    for (const [serviceName, process] of this.processes) {
      if (process && !process.killed) {
        metrics.services[serviceName] = {
          running: true,
          pid: process.pid
        };
      }
    }

    // Save metrics to file
    await fs.writeFile(
      join(projectRoot, 'logs', 'metrics.json'),
      JSON.stringify(metrics, null, 2)
    );
  }

  async setupHealthChecks() {
    console.log('🏥 Setting up health checks...');
    
    const healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthChecks();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 30000); // Every 30 seconds

    this.healthChecks.set('health-checks', healthCheckInterval);
    
    console.log('✅ Health checks setup completed');
  }

  async performHealthChecks() {
    const healthStatus = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      services: {}
    };

    // Check API server
    try {
      const response = await fetch(`http://localhost:${this.config.api.port}/api/health`);
      healthStatus.services.api = {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime: Date.now()
      };
    } catch (error) {
      healthStatus.services.api = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // Check frontend server
    try {
      const response = await fetch(`http://localhost:${this.config.frontend.port}`);
      healthStatus.services.frontend = {
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime: Date.now()
      };
    } catch (error) {
      healthStatus.services.frontend = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // Check enhanced systems
    try {
      const response = await fetch(`http://localhost:${this.config.api.port}/api/headless/status`);
      const data = await response.json();
      healthStatus.services.enhanced = {
        status: data.success ? 'healthy' : 'unhealthy',
        blockchain: data.data?.enhanced?.blockchain ? 'connected' : 'disconnected',
        crawler: data.data?.enhanced?.crawler ? 'connected' : 'disconnected'
      };
    } catch (error) {
      healthStatus.services.enhanced = {
        status: 'unhealthy',
        error: error.message
      };
    }

    // Determine overall health
    const unhealthyServices = Object.values(healthStatus.services)
      .filter(service => service.status === 'unhealthy');
    
    if (unhealthyServices.length > 0) {
      healthStatus.overall = 'unhealthy';
    }

    // Save health status
    await fs.writeFile(
      join(projectRoot, 'logs', 'health.json'),
      JSON.stringify(healthStatus, null, 2)
    );

    // Log health status
    if (healthStatus.overall === 'unhealthy') {
      console.warn('⚠️ System health check failed:', healthStatus);
    }
  }

  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
      await this.cleanup();
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGHUP', () => shutdown('SIGHUP'));
  }

  displayDeploymentInfo() {
    console.log('\n🎉 LightDom Production Deployment Complete!');
    console.log('==========================================');
    console.log(`🌐 Frontend: http://localhost:${this.config.frontend.port}`);
    console.log(`🔧 API Server: http://localhost:${this.config.api.port}`);
    console.log(`📊 Health Check: http://localhost:${this.config.api.port}/api/health`);
    
    if (this.config.monitoring.enabled) {
      console.log(`📈 Monitoring: http://localhost:${this.config.monitoring.port}${this.config.monitoring.metricsPath}`);
    }
    
    console.log(`⛏️ Blockchain: ${this.config.blockchain.rpcUrl}`);
    console.log(`🕷️ Crawler: Active with ${this.config.crawler.maxConcurrency} workers`);
    console.log(`🗄️ Database: ${this.config.database.host}:${this.config.database.port}/${this.config.database.name}`);
    console.log(`🔒 Security: CORS=${this.config.security.corsOrigin}, Rate Limit=${this.config.security.rateLimit}/min`);
    console.log(`📊 Environment: ${this.environment}`);
    console.log(`👥 Workers: ${this.config.api.workers}`);
    
    console.log('\n📋 Management Commands:');
    console.log('  Health Check: curl http://localhost:3001/api/health');
    console.log('  System Status: curl http://localhost:3001/api/headless/status');
    console.log('  Blockchain Stats: curl http://localhost:3001/api/blockchain/stats');
    console.log('  Crawler Stats: curl http://localhost:3001/api/crawler/stats');
    
    console.log('\n📁 Log Files:');
    console.log('  System Logs: ./logs/system.log');
    console.log('  Health Status: ./logs/health.json');
    console.log('  Metrics: ./logs/metrics.json');
    console.log('  Error Logs: ./logs/errors.log');
  }

  async cleanup() {
    console.log('🧹 Cleaning up production deployment...');
    
    // Clear health check intervals
    for (const [name, interval] of this.healthChecks) {
      clearInterval(interval);
      console.log(`✅ Cleared ${name}`);
    }
    
    // Stop all processes
    for (const [serviceName, process] of this.processes) {
      if (process && !process.killed) {
        console.log(`🛑 Stopping ${serviceName}...`);
        
        try {
          process.kill('SIGTERM');
          
          // Wait for graceful shutdown
          await new Promise((resolve) => {
            const timeout = setTimeout(() => {
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
    
    console.log('✅ Cleanup completed');
  }
}

// Create and run deployment
const deployment = new LightDomProductionDeployment();

// Run deployment
deployment.deploy().catch(async (error) => {
  console.error('💥 Production deployment failed:', error);
  await deployment.cleanup();
  process.exit(1);
});

export { LightDomProductionDeployment };
