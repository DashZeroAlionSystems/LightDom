#!/usr/bin/env node

/**
 * LightDom Enhanced Startup Script
 * 
 * Comprehensive startup system with:
 * - Blockchain algorithm optimization demo
 * - Self-generating workload containers
 * - Data mining containerization
 * - SEO optimization workflows
 * - Multi-environment support
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

class LightDomEnhancedStarter {
  constructor(options = {}) {
    this.processes = new Map();
    this.containers = new Map();
    this.isShuttingDown = false;
    this.startTime = Date.now();
    
    this.options = {
      runDemo: options.runDemo !== false,
      enableContainers: options.enableContainers !== false,
      enableDataMining: options.enableDataMining !== false,
      workloadType: options.workloadType || 'seo', // seo, crawling, mining, all
      environment: options.environment || process.env.NODE_ENV || 'development',
      ...options
    };
    
    this.ports = {
      postgres: 5434,
      redis: 6380,
      api: 3001,
      frontend: 3000,
      monitoring: 3005,
      blockchain: 8545,
      datamining: 3010,
      crawler: 3011
    };
    
    this.setupShutdownHandlers();
  }

  setupShutdownHandlers() {
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      this.shutdown();
    });
  }

  async start() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 LightDom Enhanced Startup System');
    console.log('='.repeat(80));
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log(`🔧 Environment: ${this.options.environment}`);
    console.log(`📦 Workload Type: ${this.options.workloadType}`);
    console.log(`🐳 Containers: ${this.options.enableContainers ? 'Enabled' : 'Disabled'}`);
    console.log(`🤖 Demo: ${this.options.runDemo ? 'Enabled' : 'Disabled'}`);
    console.log('='.repeat(80));
    console.log();

    try {
      // 1. Check prerequisites
      await this.checkPrerequisites();
      
      // 2. Initialize database schema
      await this.initializeDatabaseSchema();
      
      // 3. Start blockchain node
      await this.startBlockchainNode();
      
      // 4. Start core services (with auto-generated APIs)
      await this.startCoreServices();
      
      // 5. Run blockchain algorithm demo if enabled
      if (this.options.runDemo) {
        await this.runBlockchainAlgorithmDemo();
      }
      
      // 6. Start workload-specific containers
      if (this.options.enableContainers) {
        await this.startWorkloadContainers();
      }
      
      // 7. Start data mining containers
      if (this.options.enableDataMining) {
        await this.startDataMiningContainers();
      }
      
      // 8. Display system status
      this.displaySystemStatus();
      
      // 9. Keep alive
      await this.keepAlive();

    } catch (error) {
      console.error('❌ Failed to start system:', error.message);
      console.error(error.stack);
      await this.shutdown();
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...\n');
    
    const checks = [];
    
    // Check Docker
    try {
      const { stdout } = await execAsync('docker --version');
      console.log(`✅ Docker: ${stdout.trim()}`);
      checks.push({ name: 'Docker', status: 'available' });
    } catch (error) {
      console.log('⚠️  Docker not available');
      checks.push({ name: 'Docker', status: 'unavailable' });
      this.options.enableContainers = false;
    }
    
    // Check Docker Compose
    if (this.options.enableContainers) {
      try {
        const { stdout } = await execAsync('docker-compose --version');
        console.log(`✅ Docker Compose: ${stdout.trim()}`);
        checks.push({ name: 'Docker Compose', status: 'available' });
      } catch (error) {
        console.log('⚠️  Docker Compose not available');
        checks.push({ name: 'Docker Compose', status: 'unavailable' });
      }
    }
    
    // Check Node.js
    console.log(`✅ Node.js: ${process.version}`);
    checks.push({ name: 'Node.js', status: 'available' });
    
    // Check required files
    const requiredFiles = [
      'api-server-express.js',
      'demo-blockchain-algorithm-optimization.js',
      'services/blockchain-algorithm-benchmark-service.js',
      'services/deepseek-dom-optimization-engine.js',
      'services/realtime-client-api-service.js'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        checks.push({ name: file, status: 'found' });
      } else {
        console.log(`⚠️  Missing file: ${file}`);
        checks.push({ name: file, status: 'missing' });
      }
    }
    
    console.log();
    return checks;
  }

  async initializeDatabaseSchema() {
    console.log('💾 Initializing Database Schema...\n');
    
    try {
      // Check if PostgreSQL is available
      const { Pool } = await import('pg');
      const pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'dom_space_harvester',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      });

      // Test connection
      try {
        await pool.query('SELECT 1');
        console.log('✅ Database connection established');
      } catch (error) {
        console.log('⚠️  Database not available, skipping schema initialization');
        console.log('   To enable database, ensure PostgreSQL is running');
        await pool.end();
        return;
      }

      // Execute comprehensive schema
      console.log('📝 Creating tables...');
      const schemaPath = path.join(__dirname, 'database', 'comprehensive-system-schema.sql');
      
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('✅ Database schema initialized successfully');
        
        // Count created tables
        const result = await pool.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `);
        console.log(`   ${result.rows[0].count} tables ready`);
      } else {
        console.log('⚠️  Schema file not found, skipping');
      }

      await pool.end();
      console.log();
    } catch (error) {
      console.log('⚠️  Database initialization skipped:', error.message);
      console.log();
    }
  }

  async startBlockchainNode() {
    console.log('⛓️  Starting Blockchain Node...\n');
    
    try {
      // Check if Hardhat/Ganache is available
      const hasHardhat = fs.existsSync(path.join(__dirname, 'hardhat.config.js')) || 
                         fs.existsSync(path.join(__dirname, 'hardhat.config.cjs'));
      
      if (!hasHardhat) {
        console.log('⚠️  Hardhat config not found, skipping blockchain startup');
        console.log();
        return;
      }

      // Start Hardhat node in the background
      console.log('🔗 Starting Hardhat local blockchain...');
      const hardhatProcess = spawn('npx', ['hardhat', 'node'], {
        cwd: __dirname,
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true
      });
      
      hardhatProcess.stdout.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg && msg.includes('Started HTTP')) {
          console.log(`✅ Blockchain node started on port ${this.ports.blockchain}`);
        }
      });
      
      hardhatProcess.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg && !msg.includes('ExperimentalWarning')) {
          console.error(`   [BLOCKCHAIN ERROR] ${msg}`);
        }
      });
      
      this.processes.set('blockchain', hardhatProcess);
      
      // Wait for blockchain to be ready
      await this.waitForPort(this.ports.blockchain, 15000);
      console.log('✅ Blockchain node ready');
      console.log();
    } catch (error) {
      console.log('⚠️  Blockchain node startup failed:', error.message);
      console.log('   Continuing without blockchain...');
      console.log();
    }
  }

  async waitForPort(port, timeout = 10000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        await new Promise((resolve, reject) => {
          const net = await import('net');
          const socket = new net.Socket();
          socket.setTimeout(1000);
          socket.once('connect', () => {
            socket.destroy();
            resolve();
          });
          socket.once('error', reject);
          socket.once('timeout', reject);
          socket.connect(port, '127.0.0.1');
        });
        return true;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    throw new Error(`Port ${port} not available after ${timeout}ms`);
  }

  async startCoreServices() {
    console.log('🔧 Starting Core Services...\n');
    
    // Start API Server
    console.log('🔌 Starting API Server...');
    const apiProcess = spawn('node', ['api-server-express.js'], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { 
        ...process.env, 
        PORT: this.ports.api,
        NODE_ENV: this.options.environment,
        BLOCKCHAIN_ENABLED: 'true',
        DB_DISABLED: 'true' // Start without DB initially for faster startup
      }
    });
    
    apiProcess.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) console.log(`   [API] ${msg}`);
    });
    
    apiProcess.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg && !msg.includes('ExperimentalWarning')) {
        console.error(`   [API ERROR] ${msg}`);
      }
    });
    
    this.processes.set('api', apiProcess);
    
    // Wait for API to be ready
    await this.waitForService('API Server', `http://localhost:${this.ports.api}/api/health`, 30000);
    
    console.log('✅ API Server started on port ' + this.ports.api);
    console.log();
  }

  async runBlockchainAlgorithmDemo() {
    console.log('🎯 Running Component Dashboard Generator Demo...\n');
    
    return new Promise((resolve, reject) => {
      const demoProcess = spawn('node', ['demo-component-dashboard-generator.js'], {
        cwd: __dirname,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      let output = '';
      
      demoProcess.stdout.on('data', (data) => {
        const msg = data.toString();
        output += msg;
        console.log(msg.trim());
      });
      
      demoProcess.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg && !msg.includes('ExperimentalWarning')) {
          console.error(`   [DEMO ERROR] ${msg}`);
        }
      });
      
      demoProcess.on('close', (code) => {
        console.log();
        if (code === 0) {
          console.log('✅ Component Dashboard Generator Demo completed successfully');
          console.log();
          
          // Extract and display key results
          this.displayDemoResults(output);
          resolve();
        } else {
          console.error(`❌ Demo exited with code ${code}`);
          reject(new Error(`Demo failed with code ${code}`));
        }
      });
      
      // Timeout after 3 minutes (component generation can take longer)
      setTimeout(() => {
        demoProcess.kill();
        reject(new Error('Demo timeout'));
      }, 180000);
    });
  }

  displayDemoResults(output) {
    console.log('📊 Demo Results Summary:');
    console.log('-'.repeat(60));
    
    // Extract component count
    const componentMatch = output.match(/Generated (\d+) dashboard components/);
    if (componentMatch) {
      console.log(`   ⭐ Components Generated: ${componentMatch[1]}`);
    }
    
    // Extract generated features
    const features = ['Workflow', 'Service', 'Component', 'Data', 'Campaign', 'Mining', 'Seeding'];
    features.forEach(feature => {
      if (output.includes(`${feature} Management`) || output.includes(`${feature} Configuration`)) {
        console.log(`   ✓ ${feature} component ready`);
      }
    });
    }
    
    console.log('-'.repeat(60));
    console.log();
  }

  async startWorkloadContainers() {
    console.log('🐳 Starting Workload-Specific Containers...\n');
    
    const workloads = this.getWorkloadConfig();
    
    for (const [name, config] of Object.entries(workloads)) {
      if (this.shouldStartWorkload(name)) {
        await this.startWorkloadContainer(name, config);
      }
    }
    
    console.log();
  }

  getWorkloadConfig() {
    return {
      seo: {
        image: 'lightdom-seo-worker',
        dockerfile: 'Dockerfile.workflow',
        ports: ['3010:3010'],
        environment: {
          WORKLOAD_TYPE: 'seo',
          API_URL: `http://host.docker.internal:${this.ports.api}`
        },
        command: 'node services/automated-seo-campaign-service.js'
      },
      crawling: {
        image: 'lightdom-crawler-worker',
        dockerfile: 'Dockerfile.workflow',
        ports: ['3011:3011'],
        environment: {
          WORKLOAD_TYPE: 'crawling',
          API_URL: `http://host.docker.internal:${this.ports.api}`
        },
        command: 'node crawler/RealWebCrawlerSystem.js'
      },
      mining: {
        image: 'lightdom-mining-worker',
        dockerfile: 'Dockerfile.workflow',
        ports: ['3012:3012'],
        environment: {
          WORKLOAD_TYPE: 'mining',
          API_URL: `http://host.docker.internal:${this.ports.api}`,
          BLOCKCHAIN_RPC_URL: `http://host.docker.internal:${this.ports.blockchain}`
        },
        command: 'node blockchain/LightDomMiningSystem.js'
      },
      datamining: {
        image: 'lightdom-datamining-worker',
        dockerfile: 'Dockerfile.workflow',
        ports: ['3013:3013'],
        environment: {
          WORKLOAD_TYPE: 'datamining',
          API_URL: `http://host.docker.internal:${this.ports.api}`
        },
        command: 'node services/background-mining-service.js'
      }
    };
  }

  shouldStartWorkload(name) {
    if (this.options.workloadType === 'all') return true;
    if (this.options.workloadType === name) return true;
    return false;
  }

  async startWorkloadContainer(name, config) {
    console.log(`🔧 Starting ${name} container...`);
    
    try {
      // Build container if needed
      const imageExists = await this.checkDockerImage(config.image);
      if (!imageExists) {
        console.log(`   📦 Building ${config.image}...`);
        await this.buildDockerImage(config.image, config.dockerfile);
      }
      
      // Run container
      const containerName = `lightdom-${name}-${Date.now()}`;
      const runCmd = this.buildDockerRunCommand(containerName, config);
      
      const { stdout } = await execAsync(runCmd);
      const containerId = stdout.trim();
      
      this.containers.set(name, {
        id: containerId,
        name: containerName,
        config
      });
      
      console.log(`✅ ${name} container started: ${containerId.substring(0, 12)}`);
      
    } catch (error) {
      console.error(`❌ Failed to start ${name} container:`, error.message);
    }
  }

  async checkDockerImage(imageName) {
    try {
      await execAsync(`docker image inspect ${imageName}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async buildDockerImage(imageName, dockerfile) {
    const buildCmd = `docker build -t ${imageName} -f ${dockerfile} .`;
    await execAsync(buildCmd, { cwd: __dirname });
  }

  buildDockerRunCommand(containerName, config) {
    const parts = [
      'docker run -d',
      `--name ${containerName}`,
      '--network host'
    ];
    
    // Add ports
    if (config.ports) {
      config.ports.forEach(port => {
        parts.push(`-p ${port}`);
      });
    }
    
    // Add environment variables
    if (config.environment) {
      Object.entries(config.environment).forEach(([key, value]) => {
        parts.push(`-e ${key}="${value}"`);
      });
    }
    
    // Add image and command
    parts.push(config.image);
    if (config.command) {
      parts.push(config.command);
    }
    
    return parts.join(' ');
  }

  async startDataMiningContainers() {
    console.log('⛏️  Starting Data Mining Containers...\n');
    
    const dataMiningConfig = {
      'datamining-1': {
        image: 'lightdom-datamining-worker',
        dockerfile: 'Dockerfile.workflow',
        environment: {
          WORKER_ID: '1',
          WORKLOAD_TYPE: 'seo-datamining',
          API_URL: `http://host.docker.internal:${this.ports.api}`
        }
      },
      'datamining-2': {
        image: 'lightdom-datamining-worker',
        dockerfile: 'Dockerfile.workflow',
        environment: {
          WORKER_ID: '2',
          WORKLOAD_TYPE: 'seo-datamining',
          API_URL: `http://host.docker.internal:${this.ports.api}`
        }
      },
      'datamining-3': {
        image: 'lightdom-datamining-worker',
        dockerfile: 'Dockerfile.workflow',
        environment: {
          WORKER_ID: '3',
          WORKLOAD_TYPE: 'seo-datamining',
          API_URL: `http://host.docker.internal:${this.ports.api}`
        }
      }
    };
    
    for (const [name, config] of Object.entries(dataMiningConfig)) {
      await this.startWorkloadContainer(name, config);
    }
    
    console.log(`✅ Started ${Object.keys(dataMiningConfig).length} data mining containers`);
    console.log();
  }

  displaySystemStatus() {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ LightDom System Status');
    console.log('='.repeat(80));
    console.log(`⏱️  Uptime: ${uptime}s`);
    console.log();
    
    console.log('🔌 Core Services:');
    console.log(`   ✓ API Server          http://localhost:${this.ports.api}`);
    console.log(`   ✓ Health Check        http://localhost:${this.ports.api}/api/health`);
    console.log();
    
    console.log('🎯 Blockchain Optimization:');
    console.log(`   ✓ Benchmark API       http://localhost:${this.ports.api}/api/blockchain-optimization/benchmark`);
    console.log(`   ✓ DOM Optimization    http://localhost:${this.ports.api}/api/blockchain-optimization/dom/optimize`);
    console.log(`   ✓ Real-time Client    http://localhost:${this.ports.api}/api/realtime/status`);
    console.log();
    
    if (this.containers.size > 0) {
      console.log('🐳 Active Containers:');
      this.containers.forEach((container, name) => {
        console.log(`   ✓ ${name.padEnd(20)} ${container.id.substring(0, 12)}`);
      });
      console.log();
    }
    
    console.log('📚 Documentation:');
    console.log('   • Blockchain Optimization: BLOCKCHAIN_ALGORITHM_OPTIMIZATION_README.md');
    console.log('   • Implementation Summary:  IMPLEMENTATION_SUMMARY.md');
    console.log('   • Client Integration:      client-integration-example.html');
    console.log();
    
    console.log('🧪 Testing:');
    console.log('   node test-blockchain-optimization.js     - Run tests');
    console.log('   node demo-blockchain-algorithm-optimization.js - Run demo');
    console.log();
    
    console.log('='.repeat(80));
    console.log('Press Ctrl+C to stop all services');
    console.log('='.repeat(80));
    console.log();
  }

  async waitForService(name, url, timeout = 30000) {
    const startTime = Date.now();
    const checkInterval = 1000;
    
    while (Date.now() - startTime < timeout) {
      try {
        await new Promise((resolve, reject) => {
          const req = http.get(url, (res) => {
            if (res.statusCode === 200) {
              resolve();
            } else {
              reject(new Error(`Status ${res.statusCode}`));
            }
          });
          
          req.on('error', reject);
          req.setTimeout(2000, () => {
            req.destroy();
            reject(new Error('Timeout'));
          });
        });
        
        return; // Service is ready
      } catch (error) {
        // Service not ready, wait and retry
        await this.sleep(checkInterval);
      }
    }
    
    throw new Error(`${name} failed to start within ${timeout}ms`);
  }

  async keepAlive() {
    return new Promise(() => {
      // Keep process alive until shutdown
    });
  }

  async shutdown() {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    
    console.log('\n🛑 Shutting down LightDom System...');
    
    // Stop containers
    if (this.containers.size > 0) {
      console.log('🐳 Stopping containers...');
      for (const [name, container] of this.containers) {
        try {
          await execAsync(`docker stop ${container.id}`);
          await execAsync(`docker rm ${container.id}`);
          console.log(`   ✓ Stopped ${name}`);
        } catch (error) {
          console.error(`   ✗ Failed to stop ${name}:`, error.message);
        }
      }
    }
    
    // Stop processes
    if (this.processes.size > 0) {
      console.log('🔌 Stopping processes...');
      for (const [name, process] of this.processes) {
        try {
          process.kill('SIGTERM');
          console.log(`   ✓ Stopped ${name}`);
        } catch (error) {
          console.error(`   ✗ Failed to stop ${name}:`, error.message);
        }
      }
    }
    
    console.log('✅ Shutdown complete');
    process.exit(0);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI interface
const args = process.argv.slice(2);
const options = {};

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  if (arg === '--no-demo') {
    options.runDemo = false;
  } else if (arg === '--no-containers') {
    options.enableContainers = false;
  } else if (arg === '--no-datamining') {
    options.enableDataMining = false;
  } else if (arg === '--workload' && args[i + 1]) {
    options.workloadType = args[i + 1];
    i++;
  } else if (arg === '--env' && args[i + 1]) {
    options.environment = args[i + 1];
    i++;
  } else if (arg === '--help') {
    console.log(`
LightDom Enhanced Startup Script

Usage: node start-lightdom-enhanced.js [options]

Options:
  --no-demo              Disable blockchain algorithm demo
  --no-containers        Disable container orchestration
  --no-datamining        Disable data mining containers
  --workload <type>      Specify workload type: seo, crawling, mining, datamining, all (default: seo)
  --env <environment>    Set environment: development, staging, production (default: development)
  --help                 Show this help message

Examples:
  node start-lightdom-enhanced.js
  node start-lightdom-enhanced.js --workload all
  node start-lightdom-enhanced.js --no-demo --workload datamining
  node start-lightdom-enhanced.js --env production --no-containers
`);
    process.exit(0);
  }
}

// Start the system
const starter = new LightDomEnhancedStarter(options);
starter.start().catch(console.error);
