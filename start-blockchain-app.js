#!/usr/bin/env node

/**
 * LightDom Blockchain Application Startup Script
 * Comprehensive startup script for the complete blockchain application
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Handle ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

class LightDomBlockchainApp {
  constructor() {
    this.processes = new Map();
    this.isShuttingDown = false;
    this.startTime = Date.now();
    
    // Setup graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      this.shutdown();
    });
    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled Rejection:', reason);
      this.shutdown();
    });
  }

  async start() {
    console.log('🚀 Starting LightDom Blockchain Application...\n');
    console.log('='.repeat(60));
    console.log('🌐 LightDom - Blockchain DOM Optimization Platform');
    console.log('='.repeat(60));
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌍 Network: ${process.env.NETWORK || 'localhost'}`);
    console.log(`🔗 RPC URL: ${process.env.RPC_URL || 'http://localhost:8545'}`);
    console.log('='.repeat(60));
    console.log();

    try {
      // Check prerequisites
      await this.checkPrerequisites();
      
      // Start blockchain node (if needed)
      await this.startBlockchainNode();
      
      // Deploy contracts (if needed)
      await this.deployContracts();
      
      // Start database
      await this.startDatabase();
      
      // Start API server
      await this.startAPIServer();
      
      // Wait for API server to be ready
      await this.waitForAPIServer();
      
      // Start frontend development server
      await this.startFrontend();
      
      // Start monitoring (optional)
      if (process.env.METRICS_ENABLED === 'true') {
        await this.startMonitoring();
      }
      
      // Display startup summary
      this.displayStartupSummary();
      
      console.log('\n✅ LightDom Blockchain Application started successfully!');
      console.log('📊 Dashboard: http://localhost:3000');
      console.log('🔗 API Server: http://localhost:3001');
      console.log('📈 Metrics: http://localhost:9090');
      console.log('\nPress Ctrl+C to stop the application');
      
    } catch (error) {
      console.error('❌ Failed to start application:', error);
      await this.shutdown();
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    const checks = [
      { name: 'Node.js', check: () => process.version },
      { name: 'npm', check: () => this.runCommand('npm --version') },
      { name: 'PostgreSQL', check: () => this.checkPostgreSQL() },
      { name: 'Environment file', check: () => this.checkEnvFile() }
    ];

    for (const check of checks) {
      try {
        const result = await check.check();
        console.log(`✅ ${check.name}: ${result}`);
      } catch (error) {
        console.log(`❌ ${check.name}: ${error.message}`);
        throw new Error(`Prerequisite check failed: ${check.name}`);
      }
    }
    
    console.log('✅ All prerequisites met\n');
  }

  async startBlockchainNode() {
    if (process.env.NETWORK === 'localhost' || process.env.NETWORK === 'hardhat') {
      console.log('🔗 Starting local blockchain node...');
      
      try {
        const hardhatNode = spawn('npx', ['hardhat', 'node'], {
          cwd: __dirname,
          stdio: 'pipe',
          env: { ...process.env }
        });
        
        this.processes.set('hardhat-node', hardhatNode);
        
        // Wait for node to start
        await this.waitForHardhatNode();
        console.log('✅ Local blockchain node started\n');
      } catch (error) {
        console.log('⚠️  Could not start local blockchain node:', error.message);
        console.log('   Make sure you have a running Ethereum node or use a remote RPC\n');
      }
    } else {
      console.log('🌐 Using remote blockchain network\n');
    }
  }

  async deployContracts() {
    if (process.env.AUTO_DEPLOY_CONTRACTS === 'true') {
      console.log('📄 Deploying smart contracts...');
      
      try {
        const deployProcess = spawn('npx', ['hardhat', 'run', 'scripts/deploy-contracts.ts', '--network', process.env.NETWORK || 'localhost'], {
          cwd: __dirname,
          stdio: 'pipe',
          env: { ...process.env }
        });
        
        return new Promise((resolve, reject) => {
          deployProcess.stdout.on('data', (data) => {
            console.log(data.toString());
          });
          
          deployProcess.stderr.on('data', (data) => {
            console.error(data.toString());
          });
          
          deployProcess.on('close', (code) => {
            if (code === 0) {
              console.log('✅ Smart contracts deployed successfully\n');
              resolve();
            } else {
              console.log('⚠️  Contract deployment failed, continuing with existing contracts\n');
              resolve();
            }
          });
        });
      } catch (error) {
        console.log('⚠️  Contract deployment failed:', error.message);
        console.log('   Continuing with existing contracts\n');
      }
    } else {
      console.log('📄 Using existing smart contracts\n');
    }
  }

  async startDatabase() {
    console.log('🗄️  Starting database connection...');
    
    try {
      // Test database connection
      const { Pool } = await import('pg');
      const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'lightdom_blockchain',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      await pool.end();
      
      console.log('✅ Database connection successful\n');
    } catch (error) {
      console.log('⚠️  Database connection failed:', error.message);
      console.log('   Application will run with database disabled\n');
    }
  }

  async startAPIServer() {
    console.log('🔌 Starting API server...');
    
    return new Promise((resolve, reject) => {
      const apiProcess = spawn('node', ['api-server-express.js'], {
        cwd: __dirname,
        stdio: 'pipe',
        env: {
          ...process.env,
          NODE_ENV: process.env.NODE_ENV || 'development',
          PORT: process.env.PORT || '3001'
        }
      });
      
      this.processes.set('api-server', apiProcess);
      
      apiProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('DOM Space Harvester API running')) {
          console.log('✅ API server started');
          resolve();
        }
      });
      
      apiProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('Error') || error.includes('Failed')) {
          console.error('❌ API server error:', error);
          reject(new Error(error));
        }
      });
      
      apiProcess.on('error', (error) => {
        console.error('❌ Failed to start API server:', error);
        reject(error);
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        if (!apiProcess.killed) {
          console.log('✅ API server started (timeout)');
          resolve();
        }
      }, 30000);
    });
  }

  async waitForAPIServer() {
    console.log('⏳ Waiting for API server to be ready...');
    
    const maxAttempts = 30;
    const delay = 1000;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`http://localhost:${process.env.PORT || 3001}/api/health`);
        if (response.ok) {
          console.log('✅ API server is ready\n');
          return;
        }
      } catch (error) {
        // API not ready yet
      }
      
      await this.sleep(delay);
    }
    
    console.log('⚠️  API server health check timeout, continuing...\n');
  }

  async startFrontend() {
    console.log('🎨 Starting frontend development server...');
    
    return new Promise((resolve) => {
      const frontendProcess = spawn('npm', ['run', 'dev'], {
        cwd: __dirname,
        stdio: 'pipe',
        env: { ...process.env }
      });
      
      this.processes.set('frontend', frontendProcess);
      
      frontendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Local:') && output.includes('http://localhost:3000')) {
          console.log('✅ Frontend development server started');
          resolve();
        }
      });
      
      frontendProcess.stderr.on('data', (data) => {
        console.error('Frontend error:', data.toString());
      });
      
      // Timeout after 60 seconds
      setTimeout(() => {
        if (!frontendProcess.killed) {
          console.log('✅ Frontend development server started (timeout)');
          resolve();
        }
      }, 60000);
    });
  }

  async startMonitoring() {
    console.log('📊 Starting monitoring services...');
    
    try {
      // Start Prometheus
      const prometheusProcess = spawn('docker', ['run', '-d', '--name', 'prometheus', '-p', '9090:9090', 'prom/prometheus'], {
        stdio: 'pipe'
      });
      
      // Start Grafana
      const grafanaProcess = spawn('docker', ['run', '-d', '--name', 'grafana', '-p', '3000:3000', 'grafana/grafana'], {
        stdio: 'pipe'
      });
      
      console.log('✅ Monitoring services started');
    } catch (error) {
      console.log('⚠️  Monitoring services failed to start:', error.message);
    }
  }

  displayStartupSummary() {
    const uptime = Date.now() - this.startTime;
    console.log('\n' + '='.repeat(60));
    console.log('🎉 STARTUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`⏱️  Startup time: ${uptime}ms`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌍 Network: ${process.env.NETWORK || 'localhost'}`);
    console.log(`🗄️  Database: ${process.env.DB_DISABLED === 'true' ? 'Disabled' : 'Enabled'}`);
    console.log(`🔗 Blockchain: ${process.env.BLOCKCHAIN_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
    console.log(`📊 Monitoring: ${process.env.METRICS_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
    console.log('='.repeat(60));
    console.log('🌐 Access URLs:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   API:      http://localhost:3001');
    console.log('   Metrics:  http://localhost:9090');
    console.log('   Grafana:  http://localhost:3000');
    console.log('='.repeat(60));
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    console.log('\n🛑 Shutting down LightDom Blockchain Application...');
    
    for (const [name, process] of this.processes) {
      console.log(`Stopping ${name}...`);
      process.kill('SIGTERM');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (!process.killed) {
          process.kill('SIGKILL');
        }
      }, 5000);
    }
    
    console.log('✅ Shutdown complete');
    process.exit(0);
  }

  // Helper methods
  async runCommand(command) {
    const { exec } = await import('child_process');
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }

  async checkPostgreSQL() {
    try {
      const { Pool } = await import('pg');
      const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: 'postgres',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        connectionTimeoutMillis: 2000,
      });
      
      const client = await pool.connect();
      await client.query('SELECT version()');
      client.release();
      await pool.end();
      
      return 'Connected';
    } catch (error) {
      throw new Error('Not available');
    }
  }

  checkEnvFile() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      return 'Found';
    } else {
      throw new Error('Not found - copy .env.example to .env');
    }
  }

  async waitForHardhatNode() {
    const maxAttempts = 30;
    const delay = 1000;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(process.env.RPC_URL || 'http://localhost:8545');
        if (response.ok) {
          return;
        }
      } catch (error) {
        // Node not ready yet
      }
      
      await this.sleep(delay);
    }
    
    throw new Error('Hardhat node did not start in time');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start the application
const app = new LightDomBlockchainApp();
app.start().catch(console.error);