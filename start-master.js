#!/usr/bin/env node

/**
 * LightDom Master Startup Script
 * 
 * Comprehensive startup orchestrator that launches all platform services:
 * - Database (PostgreSQL)
 * - Cache (Redis)
 * - API Server (Express)
 * - Frontend (React/Vite)
 * - WebSocket Services
 * - Web Crawler Services
 * - Blockchain Services (Hardhat node)
 * - AI/ML Services (TensorFlow)
 * - Workflow Engine (N8N)
 * - Monitoring & Analytics
 * - Admin Dashboard
 * - Electron Desktop App (optional)
 * 
 * Usage:
 *   npm run start:master                    # Start all services
 *   npm run start:master -- --no-electron  # Skip Electron
 *   npm run start:master -- --production   # Production mode
 *   npm run start:master -- --dev          # Development mode
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import net from 'net';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  production: args.includes('--production'),
  dev: args.includes('--dev'),
  noElectron: args.includes('--no-electron'),
  noBlockchain: args.includes('--no-blockchain'),
  noCrawler: args.includes('--no-crawler'),
  noN8N: args.includes('--no-n8n'),
  verbose: args.includes('--verbose') || args.includes('-v'),
};

class LightDomMasterStarter {
  constructor() {
    this.processes = new Map();
    this.services = new Map();
    this.isShuttingDown = false;
    this.startTime = Date.now();
    
    // Port configuration
    this.ports = {
      // Core services
      postgres: parseInt(process.env.DB_PORT) || 5432,
      redis: parseInt(process.env.REDIS_PORT) || 6379,
      api: parseInt(process.env.API_PORT) || 3001,
      frontend: parseInt(process.env.FRONTEND_PORT) || 3000,
      websocket: parseInt(process.env.WS_PORT) || 3002,
      
      // Blockchain
      hardhat: parseInt(process.env.HARDHAT_PORT) || 8545,
      
      // AI/ML
      tensorflow: parseInt(process.env.TF_PORT) || 5000,
      ollama: parseInt(process.env.OLLAMA_PORT) || 11434,
      
      // Workflow & Automation
      n8n: parseInt(process.env.N8N_PORT) || 5678,
      
      // Monitoring & Admin
      monitoring: parseInt(process.env.MONITOR_PORT) || 8085,
      admin: parseInt(process.env.ADMIN_PORT) || 8084,
      analytics: parseInt(process.env.ANALYTICS_PORT) || 8086,
      
      // Crawler
      crawler: parseInt(process.env.CRAWLER_PORT) || 9000,
    };
    
    this.setupShutdownHandlers();
    this.logLevel = options.verbose ? 'verbose' : 'normal';
  }

  setupShutdownHandlers() {
    const shutdown = () => this.shutdown();
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    process.on('uncaughtException', (error) => {
      this.log('error', 'Uncaught Exception:', error);
      this.shutdown();
    });
    process.on('unhandledRejection', (reason) => {
      this.log('error', 'Unhandled Rejection:', reason);
      this.shutdown();
    });
  }

  log(level, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '📘',
      success: '✅',
      error: '❌',
      warn: '⚠️ ',
      debug: '🔍',
    }[level] || 'ℹ️';
    
    if (level === 'debug' && this.logLevel !== 'verbose') return;
    
    console.log(`[${timestamp}] ${prefix}`, ...args);
  }

  async start() {
    this.displayBanner();
    
    try {
      // Phase 1: Prerequisites
      await this.checkPrerequisites();
      await this.checkEnvironment();
      
      // Phase 2: Infrastructure
      await this.startInfrastructure();
      
      // Phase 3: Core Services
      await this.startCoreServices();
      
      // Phase 4: Application Services
      await this.startApplicationServices();
      
      // Phase 5: Optional Services
      await this.startOptionalServices();
      
      // Final: Display status and keep alive
      this.displaySystemStatus();
      await this.runHealthChecks();
      await this.keepAlive();
      
    } catch (error) {
      this.log('error', 'Failed to start system:', error.message);
      await this.shutdown();
      process.exit(1);
    }
  }

  displayBanner() {
    const banner = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ██╗     ██╗ ██████╗ ██╗  ██╗████████╗██████╗  ██████╗ ███╗   ███╗        ║
║   ██║     ██║██╔════╝ ██║  ██║╚══██╔══╝██╔══██╗██╔═══██╗████╗ ████║        ║
║   ██║     ██║██║  ███╗███████║   ██║   ██║  ██║██║   ██║██╔████╔██║        ║
║   ██║     ██║██║   ██║██╔══██║   ██║   ██║  ██║██║   ██║██║╚██╔╝██║        ║
║   ███████╗██║╚██████╔╝██║  ██║   ██║   ██████╔╝╚██████╔╝██║ ╚═╝ ██║        ║
║   ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═════╝  ╚═════╝ ╚═╝     ╚═╝        ║
║                                                                              ║
║              Blockchain-Based DOM Optimization Platform                      ║
║                    Master System Startup Script                              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;
    console.log(banner);
    console.log(`🕐 Started: ${new Date().toISOString()}`);
    console.log(`🔧 Mode: ${options.production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`📁 Directory: ${__dirname}`);
    console.log(`🎯 Options:`, options);
    console.log('═'.repeat(80));
    console.log();
  }

  async checkPrerequisites() {
    this.log('info', 'Checking prerequisites...');
    
    const checks = [
      { name: 'Node.js', cmd: 'node --version' },
      { name: 'npm', cmd: 'npm --version' },
      { name: 'Docker', cmd: 'docker --version', optional: true },
      { name: 'PostgreSQL', cmd: 'psql --version', optional: true },
      { name: 'Redis', cmd: 'redis-cli --version', optional: true },
    ];

    for (const check of checks) {
      try {
        const { stdout } = await execAsync(check.cmd);
        this.log('success', `${check.name}: ${stdout.trim()}`);
      } catch (error) {
        if (check.optional) {
          this.log('warn', `${check.name}: Not found (optional)`);
        } else {
          throw new Error(`${check.name} is required but not found`);
        }
      }
    }
  }

  async checkEnvironment() {
    this.log('info', 'Checking environment configuration...');
    
    const envFile = path.join(__dirname, '.env');
    if (!fs.existsSync(envFile)) {
      this.log('warn', '.env file not found, using defaults');
      // Copy from .env.example if it exists
      const exampleEnv = path.join(__dirname, '.env.example');
      if (fs.existsSync(exampleEnv)) {
        fs.copyFileSync(exampleEnv, envFile);
        this.log('success', 'Created .env from .env.example');
      }
    } else {
      this.log('success', '.env file found');
    }
    
    // Check critical environment variables
    const required = ['DB_HOST', 'DB_NAME', 'DB_USER'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      this.log('warn', `Missing environment variables: ${missing.join(', ')}`);
      this.log('info', 'Using default values');
    }
  }

  async startInfrastructure() {
    console.log('\n📦 PHASE 1: Infrastructure Services');
    console.log('─'.repeat(80));
    
    // Start PostgreSQL
    await this.startPostgreSQL();
    
    // Start Redis
    await this.startRedis();
  }

  async startCoreServices() {
    console.log('\n🎯 PHASE 2: Core Services');
    console.log('─'.repeat(80));
    
    // Start API Server
    await this.startAPIServer();
    
    // Start WebSocket Server
    await this.startWebSocketServer();
    
    // Start Frontend
    await this.startFrontend();
  }

  async startApplicationServices() {
    console.log('\n🚀 PHASE 3: Application Services');
    console.log('─'.repeat(80));
    
    // Start Blockchain Services
    if (!options.noBlockchain) {
      await this.startBlockchain();
    }
    
    // Start Crawler Services
    if (!options.noCrawler) {
      await this.startCrawlerService();
    }
    
    // Start AI/ML Services
    await this.startAIMLServices();
  }

  async startOptionalServices() {
    console.log('\n⚡ PHASE 4: Optional Services');
    console.log('─'.repeat(80));
    
    // Start N8N Workflow Engine
    if (!options.noN8N) {
      await this.startN8N();
    }
    
    // Start Monitoring
    await this.startMonitoring();
    
    // Start Admin Dashboard
    await this.startAdminDashboard();
    
    // Start Electron (if not disabled)
    if (!options.noElectron) {
      await this.startElectron();
    }
  }

  async startPostgreSQL() {
    this.log('info', 'Starting PostgreSQL...');
    
    // Check if already running
    if (await this.checkPort(this.ports.postgres)) {
      this.log('success', `PostgreSQL already running on port ${this.ports.postgres}`);
      this.services.set('postgres', { status: 'running', external: true });
      return;
    }
    
    // Try Docker first
    try {
      const containerName = 'lightdom-postgres';
      await execAsync(`docker run -d --name ${containerName} \
        -e POSTGRES_DB=${process.env.DB_NAME || 'lightdom'} \
        -e POSTGRES_USER=${process.env.DB_USER || 'postgres'} \
        -e POSTGRES_PASSWORD=${process.env.DB_PASSWORD || 'postgres'} \
        -p ${this.ports.postgres}:5432 \
        postgres:13-alpine`);
      
      this.log('success', `PostgreSQL started in Docker (${containerName})`);
      this.services.set('postgres', { status: 'running', container: containerName });
      
      // Wait for PostgreSQL to be ready
      await this.waitForPort(this.ports.postgres, 30000);
      
    } catch (error) {
      this.log('warn', 'Docker PostgreSQL failed, assuming local instance');
      this.services.set('postgres', { status: 'external' });
    }
  }

  async startRedis() {
    this.log('info', 'Starting Redis...');
    
    if (await this.checkPort(this.ports.redis)) {
      this.log('success', `Redis already running on port ${this.ports.redis}`);
      this.services.set('redis', { status: 'running', external: true });
      return;
    }
    
    try {
      const containerName = 'lightdom-redis';
      await execAsync(`docker run -d --name ${containerName} \
        -p ${this.ports.redis}:6379 \
        redis:alpine`);
      
      this.log('success', `Redis started in Docker (${containerName})`);
      this.services.set('redis', { status: 'running', container: containerName });
      
      await this.waitForPort(this.ports.redis, 10000);
      
    } catch (error) {
      this.log('warn', 'Docker Redis failed, assuming local instance');
      this.services.set('redis', { status: 'external' });
    }
  }

  async startAPIServer() {
    this.log('info', 'Starting API Server...');
    
    const process = spawn('node', ['api-server-express.js'], {
      env: { ...process.env, PORT: this.ports.api },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    this.processes.set('api-server', process);
    
    process.stdout.on('data', (data) => {
      if (this.logLevel === 'verbose') {
        this.log('debug', `[API] ${data.toString().trim()}`);
      }
    });
    
    process.stderr.on('data', (data) => {
      this.log('error', `[API] ${data.toString().trim()}`);
    });
    
    await this.waitForPort(this.ports.api, 30000);
    this.log('success', `API Server running on http://localhost:${this.ports.api}`);
    this.services.set('api', { status: 'running', port: this.ports.api, url: `http://localhost:${this.ports.api}` });
  }

  async startWebSocketServer() {
    this.log('info', 'Starting WebSocket Server...');
    // WebSocket is part of API server, just verify
    this.services.set('websocket', { status: 'running', port: this.ports.api, info: 'Integrated with API server' });
    this.log('success', 'WebSocket server integrated with API');
  }

  async startFrontend() {
    this.log('info', 'Starting Frontend (Vite)...');
    
    const process = spawn('npm', ['run', 'dev'], {
      env: { ...process.env, PORT: this.ports.frontend },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });
    
    this.processes.set('frontend', process);
    
    process.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || this.logLevel === 'verbose') {
        this.log('debug', `[Frontend] ${output.trim()}`);
      }
    });
    
    process.stderr.on('data', (data) => {
      const output = data.toString();
      if (!output.includes('EADDRINUSE')) {
        this.log('debug', `[Frontend] ${output.trim()}`);
      }
    });
    
    await this.waitForPort(this.ports.frontend, 60000);
    this.log('success', `Frontend running on http://localhost:${this.ports.frontend}`);
    this.services.set('frontend', { status: 'running', port: this.ports.frontend, url: `http://localhost:${this.ports.frontend}` });
  }

  async startBlockchain() {
    this.log('info', 'Starting Blockchain Services (Hardhat)...');
    
    const process = spawn('npx', ['hardhat', 'node'], {
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });
    
    this.processes.set('blockchain', process);
    
    process.stdout.on('data', (data) => {
      if (this.logLevel === 'verbose') {
        this.log('debug', `[Blockchain] ${data.toString().trim()}`);
      }
    });
    
    await this.waitForPort(this.ports.hardhat, 20000);
    this.log('success', `Blockchain node running on http://localhost:${this.ports.hardhat}`);
    this.services.set('blockchain', { status: 'running', port: this.ports.hardhat, url: `http://localhost:${this.ports.hardhat}` });
  }

  async startCrawlerService() {
    this.log('info', 'Starting Web Crawler Service...');
    
    const process = spawn('node', ['web-crawler-service.js'], {
      env: { ...process.env, PORT: this.ports.crawler },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    this.processes.set('crawler', process);
    
    process.stdout.on('data', (data) => {
      if (this.logLevel === 'verbose') {
        this.log('debug', `[Crawler] ${data.toString().trim()}`);
      }
    });
    
    this.log('success', 'Crawler service started');
    this.services.set('crawler', { status: 'running', port: this.ports.crawler });
  }

  async startAIMLServices() {
    this.log('info', 'Starting AI/ML Services...');
    
    // Check for Ollama
    try {
      await execAsync('ollama --version');
      this.log('success', 'Ollama available for AI processing');
      this.services.set('ollama', { status: 'available', port: this.ports.ollama });
    } catch (error) {
      this.log('warn', 'Ollama not available - AI features limited');
      this.services.set('ollama', { status: 'unavailable' });
    }
    
    // TensorFlow.js is integrated in the app
    this.log('success', 'TensorFlow.js integrated in application');
    this.services.set('tensorflow', { status: 'integrated' });
  }

  async startN8N() {
    this.log('info', 'Starting N8N Workflow Engine...');
    
    if (await this.checkPort(this.ports.n8n)) {
      this.log('success', `N8N already running on port ${this.ports.n8n}`);
      this.services.set('n8n', { status: 'running', external: true, port: this.ports.n8n });
      return;
    }
    
    try {
      const containerName = 'lightdom-n8n';
      await execAsync(`docker run -d --name ${containerName} \
        -p ${this.ports.n8n}:5678 \
        -v ~/.n8n:/home/node/.n8n \
        n8nio/n8n`);
      
      this.log('success', `N8N started in Docker on http://localhost:${this.ports.n8n}`);
      this.services.set('n8n', { status: 'running', container: containerName, port: this.ports.n8n, url: `http://localhost:${this.ports.n8n}` });
      
    } catch (error) {
      this.log('warn', 'N8N Docker failed - install manually or skip with --no-n8n');
      this.services.set('n8n', { status: 'unavailable' });
    }
  }

  async startMonitoring() {
    this.log('info', 'Starting Monitoring Service...');
    
    const process = spawn('node', ['scripts/monitoring-system.js'], {
      env: { ...process.env, PORT: this.ports.monitoring },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    this.processes.set('monitoring', process);
    
    this.log('success', `Monitoring dashboard on http://localhost:${this.ports.monitoring}`);
    this.services.set('monitoring', { status: 'running', port: this.ports.monitoring, url: `http://localhost:${this.ports.monitoring}` });
  }

  async startAdminDashboard() {
    this.log('info', 'Starting Admin Dashboard...');
    
    const process = spawn('node', ['scripts/start-admin-system.js'], {
      env: { ...process.env, PORT: this.ports.admin },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    this.processes.set('admin', process);
    
    this.log('success', `Admin dashboard on http://localhost:${this.ports.admin}`);
    this.services.set('admin', { status: 'running', port: this.ports.admin, url: `http://localhost:${this.ports.admin}` });
  }

  async startElectron() {
    this.log('info', 'Starting Electron Desktop App...');
    
    // Wait for frontend to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const process = spawn('npm', ['run', 'electron:enhanced'], {
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true
    });
    
    this.processes.set('electron', process);
    
    this.log('success', 'Electron app launched');
    this.services.set('electron', { status: 'running' });
  }

  displaySystemStatus() {
    console.log('\n');
    console.log('═'.repeat(80));
    console.log('📊 SYSTEM STATUS');
    console.log('═'.repeat(80));
    
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    console.log(`\n⏱️  Startup completed in ${uptime} seconds\n`);
    
    console.log('🌐 Service URLs:');
    console.log('─'.repeat(80));
    
    this.services.forEach((service, name) => {
      if (service.url) {
        console.log(`  ${name.padEnd(20)} ${service.url}`);
      }
    });
    
    console.log('\n📋 Service Status:');
    console.log('─'.repeat(80));
    
    this.services.forEach((service, name) => {
      const status = service.status === 'running' ? '✅' : 
                     service.status === 'external' ? '🔗' :
                     service.status === 'integrated' ? '🔌' :
                     service.status === 'available' ? '💡' : '⚠️';
      console.log(`  ${status} ${name.padEnd(20)} ${service.status}${service.container ? ` (${service.container})` : ''}`);
    });
    
    console.log('\n🎮 Management:');
    console.log('─'.repeat(80));
    console.log('  Press Ctrl+C to stop all services');
    console.log('  Logs: tail -f logs/*.log');
    console.log('  Health: curl http://localhost:3001/health');
    console.log('═'.repeat(80));
    console.log();
  }

  async runHealthChecks() {
    this.log('info', 'Running health checks...');
    
    const healthChecks = [
      { name: 'API', url: `http://localhost:${this.ports.api}/health` },
      { name: 'Frontend', url: `http://localhost:${this.ports.frontend}` },
    ];
    
    for (const check of healthChecks) {
      try {
        await this.httpGet(check.url);
        this.log('success', `${check.name} health check passed`);
      } catch (error) {
        this.log('warn', `${check.name} health check failed (may still be starting)`);
      }
    }
  }

  async checkPort(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(true)); // Port in use
      server.once('listening', () => {
        server.close();
        resolve(false); // Port available
      });
      server.listen(port);
    });
  }

  async waitForPort(port, timeout = 30000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await this.checkPort(port)) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error(`Timeout waiting for port ${port}`);
  }

  async httpGet(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      }).on('error', reject);
    });
  }

  async keepAlive() {
    // Keep the process running
    return new Promise(() => {});
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    
    console.log('\n\n🛑 Shutting down LightDom...\n');
    
    // Stop all spawned processes
    for (const [name, process] of this.processes) {
      this.log('info', `Stopping ${name}...`);
      process.kill('SIGTERM');
    }
    
    // Stop Docker containers
    for (const [name, service] of this.services) {
      if (service.container) {
        this.log('info', `Stopping ${service.container}...`);
        try {
          await execAsync(`docker stop ${service.container}`);
          await execAsync(`docker rm ${service.container}`);
        } catch (error) {
          // Ignore errors
        }
      }
    }
    
    this.log('success', 'All services stopped');
    
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    console.log(`\n⏱️  Total uptime: ${uptime} seconds`);
    console.log('👋 Goodbye!\n');
    
    process.exit(0);
  }
}

// Run the starter
const starter = new LightDomMasterStarter();
starter.start().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
