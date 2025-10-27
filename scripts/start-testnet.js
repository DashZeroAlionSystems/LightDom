#!/usr/bin/env node

/**
 * LightDom Testnet Starter
 *
 * Comprehensive testnet startup script that:
 * 1. Starts Hardhat local blockchain
 * 2. Deploys all contracts (NFT, Metaverse, Gamification, SEO)
 * 3. Starts mining service for SEO data
 * 4. Initializes all services
 * 5. Starts API server and frontend
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n${colors.cyan}${msg}${colors.reset}\n${colors.cyan}${'='.repeat(60)}${colors.reset}\n`),
  process: (name, msg) => console.log(`${colors.magenta}[${name}]${colors.reset} ${msg}`)
};

// Load testnet configuration
const configPath = path.join(__dirname, '../config/testnet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Process management
const processes = {};

/**
 * Check if port is in use
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

/**
 * Wait for port to be available
 */
function waitForPort(port, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const check = setInterval(async () => {
      attempts++;
      const inUse = await checkPort(port);

      if (inUse) {
        clearInterval(check);
        log.success(`Port ${port} is ready`);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(check);
        reject(new Error(`Port ${port} not ready after ${maxAttempts} attempts`));
      }
    }, 1000);
  });
}

/**
 * Start a process
 */
function startProcess(name, command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    log.info(`Starting ${name}...`);

    const proc = spawn(command, args, {
      cwd: options.cwd || path.join(__dirname, '..'),
      stdio: options.stdio || 'pipe',
      shell: true,
      env: { ...process.env, ...options.env }
    });

    processes[name] = proc;

    // Log output
    if (proc.stdout) {
      proc.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean);
        lines.forEach(line => log.process(name, line));
      });
    }

    if (proc.stderr) {
      proc.stderr.on('data', (data) => {
        const lines = data.toString().split('\n').filter(Boolean);
        lines.forEach(line => log.process(name, line));
      });
    }

    proc.on('error', (error) => {
      log.error(`${name} error: ${error.message}`);
      reject(error);
    });

    proc.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        log.error(`${name} exited with code ${code}`);
      }
    });

    // Consider process started after a short delay
    setTimeout(() => {
      log.success(`${name} started (PID: ${proc.pid})`);
      resolve(proc);
    }, 2000);
  });
}

/**
 * Compile contracts
 */
async function compileContracts() {
  log.section('Compiling Smart Contracts');

  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['hardhat', 'compile'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

    proc.on('exit', (code) => {
      if (code === 0) {
        log.success('Contracts compiled successfully');
        resolve();
      } else {
        log.error('Contract compilation failed');
        reject(new Error('Contract compilation failed'));
      }
    });
  });
}

/**
 * Deploy contracts
 */
async function deployContracts() {
  log.section('Deploying Smart Contracts');

  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['scripts/testnet-deploy-all-contracts.js'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

    proc.on('exit', (code) => {
      if (code === 0) {
        log.success('All contracts deployed successfully');
        resolve();
      } else {
        log.error('Contract deployment failed');
        reject(new Error('Contract deployment failed'));
      }
    });
  });
}

/**
 * Cleanup processes on exit
 */
function setupCleanup() {
  const cleanup = () => {
    log.section('Shutting Down Testnet');

    for (const [name, proc] of Object.entries(processes)) {
      if (proc && !proc.killed) {
        log.info(`Stopping ${name}...`);
        proc.kill('SIGTERM');
      }
    }

    setTimeout(() => {
      process.exit(0);
    }, 2000);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}

/**
 * Main startup function
 */
async function main() {
  try {
    log.section('LightDom Testnet Starter');
    log.info(`Network: ${config.network.name}`);
    log.info(`Chain ID: ${config.network.chainId}`);
    log.info(`RPC URL: ${config.network.rpcUrl}`);

    // Setup cleanup handlers
    setupCleanup();

    // Step 1: Check if blockchain is already running
    const blockchainRunning = await checkPort(8545);
    let blockchainProc;

    if (!blockchainRunning) {
      log.section('Starting Hardhat Blockchain');
      blockchainProc = await startProcess(
        'Blockchain',
        'npx',
        ['hardhat', 'node'],
        { stdio: 'pipe' }
      );

      // Wait for blockchain to be ready
      await waitForPort(8545);
      log.success('Blockchain is ready');

      // Give it extra time to fully initialize
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      log.warning('Blockchain already running on port 8545');
    }

    // Step 2: Compile contracts
    await compileContracts();

    // Step 3: Deploy contracts
    if (config.testnet.autoDeployContracts) {
      await deployContracts();
    }

    // Step 4: Start Mining Service
    if (config.mining.enabled && config.testnet.autoStartMining) {
      log.section('Starting Mining Service');

      await startProcess(
        'Mining',
        'node',
        ['blockchain/IntegratedOptimizationMiner.js'],
        {
          env: {
            MINING_ENABLED: 'true',
            SEO_DATA_MINING: 'true',
            AUTO_OPTIMIZATION: 'true'
          }
        }
      );
    }

    // Step 5: Start Database (if not running)
    if (config.services.database.enabled) {
      log.section('Database Service');

      const dbRunning = await checkPort(config.services.database.port);
      if (!dbRunning) {
        log.info('Starting PostgreSQL...');
        await startProcess(
          'Database',
          'docker',
          ['run', '--rm', '-d', '-p', '5432:5432', '-e', 'POSTGRES_PASSWORD=postgres', 'postgres:15'],
          { stdio: 'pipe' }
        );
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        log.success('Database already running');
      }
    }

    // Step 6: Start Redis (if not running)
    if (config.services.redis.enabled) {
      log.section('Redis Service');

      const redisRunning = await checkPort(config.services.redis.port);
      if (!redisRunning) {
        log.info('Starting Redis...');
        await startProcess(
          'Redis',
          'docker',
          ['run', '--rm', '-d', '-p', '6379:6379', 'redis:7-alpine'],
          { stdio: 'pipe' }
        );
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        log.success('Redis already running');
      }
    }

    // Step 7: Start API Server
    if (config.services.apiServer.enabled) {
      log.section('Starting API Server');

      await startProcess(
        'API Server',
        'node',
        ['api-server-express.js'],
        {
          env: {
            PORT: config.services.apiServer.port.toString(),
            BLOCKCHAIN_ENABLED: 'true',
            MINING_ENABLED: config.mining.enabled.toString(),
            NFT_ENABLED: config.features.nfts.enabled.toString(),
            METAVERSE_ENABLED: config.features.metaverse.enabled.toString(),
            GAMIFICATION_ENABLED: config.features.gamification.enabled.toString(),
            SEO_SERVICES_ENABLED: config.features.seoServices.enabled.toString()
          }
        }
      );

      await waitForPort(config.services.apiServer.port);
    }

    // Step 8: Start Crawler (if enabled)
    if (config.services.crawler.enabled) {
      log.section('Starting Web Crawler');

      await startProcess(
        'Crawler',
        'node',
        ['crawler/crawler-main.js'],
        {
          env: {
            AUTO_OPTIMIZATION: 'true',
            BLOCKCHAIN_ENABLED: 'true'
          }
        }
      );
    }

    // Step 9: Start Frontend
    if (config.services.frontend.enabled) {
      log.section('Starting Frontend');

      await startProcess(
        'Frontend',
        'npm',
        ['run', 'dev'],
        {
          env: {
            VITE_API_URL: `http://localhost:${config.services.apiServer.port}`,
            VITE_BLOCKCHAIN_ENABLED: 'true'
          }
        }
      );

      await waitForPort(config.services.frontend.port);
    }

    // Step 10: Start Monitoring (if enabled)
    if (config.services.monitoring.enabled) {
      log.section('Starting Monitoring');

      await startProcess(
        'Monitoring',
        'node',
        ['scripts/monitoring-system.js']
      );
    }

    // Final Summary
    log.section('Testnet Started Successfully');
    log.success('All services are running');

    console.log('\n📊 Service Status:');
    console.log(`  ${colors.green}•${colors.reset} Blockchain: http://localhost:8545`);
    console.log(`  ${colors.green}•${colors.reset} API Server: http://localhost:${config.services.apiServer.port}`);
    console.log(`  ${colors.green}•${colors.reset} Frontend: http://localhost:${config.services.frontend.port}`);
    if (config.services.monitoring.enabled) {
      console.log(`  ${colors.green}•${colors.reset} Monitoring: http://localhost:${config.services.monitoring.port}`);
    }

    console.log('\n🎮 Features Enabled:');
    console.log(`  ${colors.green}•${colors.reset} Mining: ${config.mining.enabled ? 'Yes' : 'No'}`);
    console.log(`  ${colors.green}•${colors.reset} NFTs: ${config.features.nfts.enabled ? 'Yes' : 'No'}`);
    console.log(`  ${colors.green}•${colors.reset} Metaverse: ${config.features.metaverse.enabled ? 'Yes' : 'No'}`);
    console.log(`  ${colors.green}•${colors.reset} Gamification: ${config.features.gamification.enabled ? 'Yes' : 'No'}`);
    console.log(`  ${colors.green}•${colors.reset} SEO Services: ${config.features.seoServices.enabled ? 'Yes' : 'No'}`);

    console.log('\n💡 Quick Commands:');
    console.log(`  ${colors.cyan}•${colors.reset} View deployments: cat deployments/testnet-${config.network.chainId}.json`);
    console.log(`  ${colors.cyan}•${colors.reset} Monitor mining: curl http://localhost:${config.services.apiServer.port}/api/mining/stats`);
    console.log(`  ${colors.cyan}•${colors.reset} Check health: curl http://localhost:${config.services.apiServer.port}/health`);

    log.info('\nPress Ctrl+C to stop all services');

    // Keep the process running
    await new Promise(() => {});
  } catch (error) {
    log.error(`Startup failed: ${error.message}`);
    console.error(error);

    // Cleanup on error
    for (const [name, proc] of Object.entries(processes)) {
      if (proc && !proc.killed) {
        proc.kill('SIGTERM');
      }
    }

    process.exit(1);
  }
}

// Run startup
main().catch((error) => {
  log.error(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
