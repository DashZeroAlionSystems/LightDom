#!/usr/bin/env node

/**
 * LightDom Complete System Startup Script
 * Comprehensive startup script that launches all required services:
 * - PostgreSQL Database
 * - Redis Cache
 * - API Server
 * - Web Crawler Service
 * - Frontend (Vite)
 * - Electron Desktop App
 * - Blockchain Services
 * - Monitoring Services
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LightDomCompleteStarter {
  constructor() {
    this.processes = new Map();
    this.isShuttingDown = false;
    this.startTime = Date.now();
    this.ports = {
      postgres: 5434,
      redis: 6380,
      api: 3001,
      frontend: 3000,
      monitoring: 3005
    };
    
    // Setup graceful shutdown
    this.setupShutdownHandlers();
  }

  setupShutdownHandlers() {
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
    console.log('🚀 Starting LightDom Complete System...\n');
    console.log('='.repeat(80));
    console.log('🌐 LightDom - Blockchain DOM Optimization Platform');
    console.log('='.repeat(80));
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Working Directory: ${__dirname}`);
    console.log('='.repeat(80));
    console.log();

    try {
      // Check prerequisites
      await this.checkPrerequisites();
      
      // Start services in order
      await this.startDatabaseServices();
      await this.startAPIServer();
      await this.startWebCrawler();
      await this.startStorybook();
      await this.startFrontend();
      await this.startElectronApp();
      await this.startMonitoring();
      
      this.displaySystemStatus();
      await this.keepAlive();

    } catch (error) {
      console.error('❌ Failed to start system:', error.message);
      await this.shutdown();
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    // Check if Docker is running
    try {
      await execAsync('docker --version');
      console.log('✅ Docker is available');
    } catch (error) {
      console.log('⚠️  Docker not available, will use local services');
    }

    // Check if Node.js version is compatible
    const nodeVersion = process.version;
    console.log(`✅ Node.js version: ${nodeVersion}`);

    // Check if required files exist
    const requiredFiles = [
      'package.json',
      'simple-api-server.js',
      'web-crawler-service.js',
      'electron/main.cjs'
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(__dirname, file))) {
        throw new Error(`Required file not found: ${file}`);
      }
    }
    console.log('✅ All required files found');
    console.log();
  }

  async startDatabaseServices() {
    console.log('🗄️  Starting database services...');
    
    try {
      // Try to start Docker services first
      console.log('🐳 Attempting to start Docker services...');
      await execAsync('docker-compose up -d postgres redis', { cwd: __dirname });
      console.log('✅ Docker services started');
      
      // Wait for services to be ready
      await this.waitForService('postgres', this.ports.postgres, 'PostgreSQL');
      await this.waitForService('redis', this.ports.redis, 'Redis');
      
    } catch (error) {
      console.log('⚠️  Docker services failed, checking for local services...');
      
      // Check if services are already running locally
      const postgresRunning = await this.isPortInUse(this.ports.postgres);
      const redisRunning = await this.isPortInUse(this.ports.redis);
      
      if (postgresRunning) {
        console.log('✅ PostgreSQL already running on port', this.ports.postgres);
      } else {
        console.log('⚠️  PostgreSQL not running - some features may not work');
      }
      
      if (redisRunning) {
        console.log('✅ Redis already running on port', this.ports.redis);
      } else {
        console.log('⚠️  Redis not running - caching features may not work');
      }
    }
    
    console.log();
  }

  async startAPIServer() {
    console.log('🔌 Starting API Server...');
    
    const apiProcess = spawn('node', ['simple-api-server.js'], {
      cwd: __dirname,
      stdio: 'pipe',
      env: {
        ...process.env,
        PORT: this.ports.api,
        NODE_ENV: 'development'
      }
    });

    this.processes.set('api', apiProcess);

    // Handle API server output
    apiProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('LightDom API Server running')) {
        console.log('✅ API Server started on port', this.ports.api);
      }
    });

    apiProcess.stderr.on('data', (data) => {
      console.error('API Server Error:', data.toString());
    });

    apiProcess.on('exit', (code) => {
      if (code !== 0 && !this.isShuttingDown) {
        console.error('❌ API Server exited with code', code);
      }
    });

    // Wait for API server to be ready
    await this.waitForService('api', this.ports.api, 'API Server');
    console.log();
  }

  async startWebCrawler() {
    console.log('🕷️  Starting Web Crawler Service...');
    
    // The web crawler is integrated into the API server
    // Just verify it's working
    try {
      const response = await this.makeHttpRequest(`http://localhost:${this.ports.api}/api/crawler/stats`);
      if (response) {
        console.log('✅ Web Crawler Service is active');
      }
    } catch (error) {
      console.log('⚠️  Web Crawler Service not responding');
    }
    console.log();
  }

  async startStorybook() {
    console.log('📚 Starting Storybook...');
    
    const storybookProcess = spawn('npm', ['run', 'storybook'], {
      cwd: __dirname,
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development'
      }
    });

    this.processes.set('storybook', storybookProcess);
    this.ports.storybook = 6006;

    storybookProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Storybook') && output.includes('started')) {
        console.log('✅ Storybook started on port 6006');
      }
    });

    storybookProcess.stderr.on('data', (data) => {
      const output = data.toString();
      // Filter out common warnings
      if (!output.includes('ExperimentalWarning') && 
          !output.includes('punycode') &&
          !output.includes('DEP0040')) {
        console.error('Storybook Warning:', output);
      }
    });

    storybookProcess.on('exit', (code) => {
      if (code !== 0 && !this.isShuttingDown) {
        console.error('❌ Storybook exited with code', code);
      }
    });

    // Wait for Storybook to be ready
    await this.waitForService('storybook', 6006, 'Storybook');
    console.log();
  }

  async startFrontend() {
    console.log('🌐 Starting Frontend (Vite)...');
    
    const frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: __dirname,
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        VITE_PORT: this.ports.frontend,
        NODE_ENV: 'development'
      }
    });

    this.processes.set('frontend', frontendProcess);

    // Handle frontend output
    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:')) {
        const portMatch = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
        if (portMatch) {
          this.ports.frontend = parseInt(portMatch[1]);
          console.log('✅ Frontend started on port', this.ports.frontend);
        }
      }
    });

    frontendProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (!output.includes('warnings') && !output.includes('deprecation')) {
        console.error('Frontend Error:', output);
      }
    });

    frontendProcess.on('exit', (code) => {
      if (code !== 0 && !this.isShuttingDown) {
        console.error('❌ Frontend exited with code', code);
      }
    });

    // Wait for frontend to be ready
    await this.waitForService('frontend', this.ports.frontend, 'Frontend');
    console.log();
  }

  async startElectronApp() {
    console.log('🖥️  Starting Electron Desktop App...');
    
    const electronProcess = spawn('npm', ['run', 'electron:dev'], {
      cwd: __dirname,
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development'
      }
    });

    this.processes.set('electron', electronProcess);

    // Handle Electron output
    electronProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Electron app started')) {
        console.log('✅ Electron Desktop App started');
      }
    });

    electronProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (!output.includes('DevTools') && !output.includes('Autofill')) {
        console.error('Electron Error:', output);
      }
    });

    electronProcess.on('exit', (code) => {
      if (code !== 0 && !this.isShuttingDown) {
        console.error('❌ Electron exited with code', code);
      }
    });

    // Give Electron time to start
    await this.sleep(5000);
    console.log('✅ Electron Desktop App launched');
    console.log();
  }

  async startMonitoring() {
    console.log('📊 Starting Monitoring Services...');
    
    // Check if monitoring is available
    try {
      const response = await this.makeHttpRequest(`http://localhost:${this.ports.api}/api/health`);
      if (response) {
        console.log('✅ Health monitoring active');
      }
    } catch (error) {
      console.log('⚠️  Health monitoring not available');
    }
    console.log();
  }

  async waitForService(name, port, displayName) {
    const maxAttempts = 30;
    const delay = 1000;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await this.makeHttpRequest(`http://localhost:${port}${name === 'api' ? '/api/health' : '/'}`);
        if (response) {
          return true;
        }
      } catch (error) {
        // Service not ready yet
      }
      
      await this.sleep(delay);
    }
    
    console.log(`⚠️  ${displayName} may not be fully ready`);
    return false;
  }

  async isPortInUse(port) {
    try {
      const response = await this.makeHttpRequest(`http://localhost:${port}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      const req = http.get(url, (res) => {
        resolve(res);
      });
      
      req.on('error', reject);
      req.setTimeout(2000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  displaySystemStatus() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    
    console.log('🎉 LightDom System Started Successfully!');
    console.log('='.repeat(80));
    console.log('📊 System Status:');
    console.log(`   🗄️  Database: PostgreSQL (port ${this.ports.postgres})`);
    console.log(`   🚀 Cache: Redis (port ${this.ports.redis})`);
    console.log(`   🔌 API Server: http://localhost:${this.ports.api}`);
    console.log(`   🌐 Frontend: http://localhost:${this.ports.frontend}`);
    console.log(`   📚 Storybook: http://localhost:${this.ports.storybook || 6006}`);
    console.log(`   🖥️  Desktop App: Electron (launched)`);
    console.log(`   🕷️  Web Crawler: Active`);
    console.log(`   📊 Monitoring: Active`);
    console.log('='.repeat(80));
    console.log('🎯 Available Services:');
    console.log(`   • Main Dashboard: http://localhost:${this.ports.frontend}`);
    console.log(`   • Design System: http://localhost:${this.ports.storybook || 6006}`);
    console.log(`   • API Health: http://localhost:${this.ports.api}/api/health`);
    console.log(`   • Crawler Stats: http://localhost:${this.ports.api}/api/crawler/stats`);
    console.log(`   • Mining Data: http://localhost:${this.ports.api}/api/metaverse/mining-data`);
    console.log('='.repeat(80));
    console.log(`⏱️  Startup Time: ${uptime} seconds`);
    console.log('🔄 Press Ctrl+C to stop all services');
    console.log('='.repeat(80));
    console.log();
  }

  async keepAlive() {
    // Keep the process alive and monitor services
    setInterval(() => {
      if (!this.isShuttingDown) {
        this.monitorServices();
      }
    }, 30000); // Check every 30 seconds

    // Keep the main process alive
    return new Promise(() => {
      // This promise never resolves, keeping the process alive
    });
  }

  async monitorServices() {
    const services = [
      { name: 'API', port: this.ports.api, path: '/api/health' },
      { name: 'Frontend', port: this.ports.frontend, path: '/' }
    ];

    for (const service of services) {
      try {
        await this.makeHttpRequest(`http://localhost:${service.port}${service.path}`);
      } catch (error) {
        console.log(`⚠️  ${service.name} service may be down`);
      }
    }
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    console.log('\n🛑 Shutting down LightDom system...');
    
    // Stop all processes
    for (const [name, process] of this.processes) {
      console.log(`   Stopping ${name}...`);
      try {
        process.kill('SIGTERM');
        
        // Force kill after 5 seconds
        setTimeout(() => {
          if (!process.killed) {
            process.kill('SIGKILL');
          }
        }, 5000);
      } catch (error) {
        console.log(`   ⚠️  Error stopping ${name}:`, error.message);
      }
    }

    // Stop Docker services
    try {
      await execAsync('docker-compose down', { cwd: __dirname });
      console.log('   ✅ Docker services stopped');
    } catch (error) {
      console.log('   ⚠️  Docker services may not be running');
    }

    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    console.log(`\n✅ LightDom system stopped (uptime: ${uptime}s)`);
    process.exit(0);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start the system
const starter = new LightDomCompleteStarter();
starter.start().catch(console.error);
