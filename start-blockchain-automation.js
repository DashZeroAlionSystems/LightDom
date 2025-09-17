#!/usr/bin/env node

/**
 * Blockchain Automation Startup Script
 * Enterprise-grade startup script for automated blockchain operations
 * Uses Puppeteer and @puppeteer/browsers for comprehensive automation
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { BlockchainStartupOrchestrator } from './src/automation/BlockchainStartupOrchestrator.ts';
import { BlockchainAutomationManager } from './src/automation/BlockchainAutomationManager.ts';
import { ProjectManagementFramework } from './src/automation/ProjectManagementFramework.ts';
import { BlockchainNodeManager } from './src/automation/BlockchainNodeManager.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
  blockchain: {
    network: process.env.BLOCKCHAIN_NETWORK || 'mainnet',
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
    privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
    gasPrice: process.env.BLOCKCHAIN_GAS_PRICE || '20000000000',
    gasLimit: parseInt(process.env.BLOCKCHAIN_GAS_LIMIT || '500000')
  },
  automation: {
    enabled: process.env.AUTOMATION_ENABLED !== 'false',
    maxConcurrency: parseInt(process.env.AUTOMATION_MAX_CONCURRENCY || '10'),
    retryAttempts: parseInt(process.env.AUTOMATION_RETRY_ATTEMPTS || '3'),
    timeout: parseInt(process.env.AUTOMATION_TIMEOUT || '30000')
  },
  monitoring: {
    enabled: process.env.MONITORING_ENABLED !== 'false',
    interval: parseInt(process.env.MONITORING_INTERVAL || '30000'),
    metrics: process.env.MONITORING_METRICS !== 'false',
    alerts: process.env.MONITORING_ALERTS !== 'false'
  },
  scaling: {
    enabled: process.env.SCALING_ENABLED !== 'false',
    autoScale: process.env.SCALING_AUTO_SCALE !== 'false',
    minNodes: parseInt(process.env.SCALING_MIN_NODES || '1'),
    maxNodes: parseInt(process.env.SCALING_MAX_NODES || '10')
  },
  projects: {
    loadOnStartup: process.env.PROJECTS_LOAD_ON_STARTUP !== 'false',
    autoStart: process.env.PROJECTS_AUTO_START !== 'false',
    maxConcurrent: parseInt(process.env.PROJECTS_MAX_CONCURRENT || '5')
  },
  security: {
    enabled: process.env.SECURITY_ENABLED !== 'false',
    encryption: process.env.SECURITY_ENCRYPTION !== 'false',
    authentication: process.env.SECURITY_AUTHENTICATION !== 'false',
    rateLimiting: process.env.SECURITY_RATE_LIMITING !== 'false'
  }
};

// Global variables
let orchestrator = null;
let isShuttingDown = false;

// Signal handlers for graceful shutdown
process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);
process.on('SIGUSR2', handleShutdown); // For nodemon

// Error handlers
process.on('uncaughtException', handleError);
process.on('unhandledRejection', handleError);

/**
 * Main startup function
 */
async function main() {
  try {
    console.log('🚀 Starting LightDom Blockchain Automation System...');
    console.log('================================================');
    
    // Display configuration
    displayConfiguration();
    
    // Create and start orchestrator
    orchestrator = new BlockchainStartupOrchestrator(config);
    
    // Setup event listeners
    setupEventListeners(orchestrator);
    
    // Start the system
    await orchestrator.start();
    
    // Keep the process running
    await keepAlive();
    
  } catch (error) {
    console.error('❌ Fatal error during startup:', error);
    process.exit(1);
  }
}

/**
 * Display configuration
 */
function displayConfiguration() {
  console.log('\n📋 Configuration:');
  console.log('================');
  console.log(`Blockchain Network: ${config.blockchain.network}`);
  console.log(`RPC URL: ${config.blockchain.rpcUrl}`);
  console.log(`Automation Enabled: ${config.automation.enabled}`);
  console.log(`Max Concurrency: ${config.automation.maxConcurrency}`);
  console.log(`Monitoring Enabled: ${config.monitoring.enabled}`);
  console.log(`Scaling Enabled: ${config.scaling.enabled}`);
  console.log(`Security Enabled: ${config.security.enabled}`);
  console.log('');
}

/**
 * Setup event listeners
 */
function setupEventListeners(orchestrator) {
  orchestrator.on('startupStarted', (status) => {
    console.log(`🔄 Startup started: ${status.message}`);
  });
  
  orchestrator.on('statusUpdate', (status) => {
    console.log(`📊 [${status.progress}%] ${status.message}`);
  });
  
  orchestrator.on('componentAdded', (component) => {
    console.log(`➕ Component added: ${component.name}`);
  });
  
  orchestrator.on('componentUpdated', (component) => {
    const status = component.status === 'running' ? '✅' : 
                 component.status === 'error' ? '❌' : 
                 component.status === 'starting' ? '🔄' : '⏸️';
    console.log(`${status} ${component.name}: ${component.message}`);
  });
  
  orchestrator.on('error', (error) => {
    console.error(`❌ Error in ${error.component}: ${error.error}`);
  });
  
  orchestrator.on('startupCompleted', (status) => {
    console.log('\n🎉 Blockchain system startup completed!');
    console.log(`⏱️ Total startup time: ${status.readyTime - status.startTime}ms`);
  });
  
  orchestrator.on('startupFailed', ({ status, error }) => {
    console.error('\n❌ Blockchain system startup failed!');
    console.error('Error:', error.message);
    console.error('Status:', status);
  });
}

/**
 * Keep the process alive
 */
async function keepAlive() {
  console.log('\n🔄 System is running. Press Ctrl+C to stop.');
  
  // Health check interval
  setInterval(async () => {
    if (orchestrator && !isShuttingDown) {
      const health = orchestrator.getSystemHealth();
      if (!health.healthy) {
        console.warn('⚠️ System health check failed');
        console.warn('Components:', health.components.map(c => `${c.name}: ${c.status}`));
        console.warn('Errors:', health.errors.map(e => `${e.component}: ${e.error}`));
      }
    }
  }, 60000); // Check every minute
  
  // Keep the process running
  return new Promise((resolve) => {
    // This promise never resolves, keeping the process alive
    // The process will be terminated by signal handlers
  });
}

/**
 * Handle shutdown signals
 */
async function handleShutdown(signal) {
  if (isShuttingDown) {
    console.log('\n⚠️ Shutdown already in progress...');
    return;
  }
  
  isShuttingDown = true;
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  
  try {
    if (orchestrator) {
      await orchestrator.shutdown();
    }
    
    console.log('✅ Shutdown completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

/**
 * Handle errors
 */
function handleError(error) {
  console.error('❌ Unhandled error:', error);
  
  if (orchestrator && !isShuttingDown) {
    console.log('🔄 Attempting graceful shutdown...');
    orchestrator.shutdown().then(() => {
      process.exit(1);
    }).catch((shutdownError) => {
      console.error('❌ Error during emergency shutdown:', shutdownError);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
}

/**
 * Display help information
 */
function displayHelp() {
  console.log(`
LightDom Blockchain Automation System

Usage: node start-blockchain-automation.js [options]

Options:
  --help, -h          Display this help message
  --version, -v       Display version information
  --config <file>     Load configuration from file
  --dry-run           Run in dry-run mode (no actual operations)
  --verbose           Enable verbose logging
  --debug             Enable debug logging

Environment Variables:
  BLOCKCHAIN_NETWORK          Blockchain network (default: mainnet)
  BLOCKCHAIN_RPC_URL          RPC URL (default: http://localhost:8545)
  BLOCKCHAIN_PRIVATE_KEY      Private key for blockchain operations
  BLOCKCHAIN_GAS_PRICE        Gas price in wei (default: 20000000000)
  BLOCKCHAIN_GAS_LIMIT        Gas limit (default: 500000)
  AUTOMATION_ENABLED          Enable automation (default: true)
  AUTOMATION_MAX_CONCURRENCY  Max concurrent operations (default: 10)
  MONITORING_ENABLED          Enable monitoring (default: true)
  SCALING_ENABLED             Enable auto-scaling (default: true)
  SECURITY_ENABLED            Enable security features (default: true)

Examples:
  node start-blockchain-automation.js
  node start-blockchain-automation.js --verbose
  BLOCKCHAIN_NETWORK=testnet node start-blockchain-automation.js
  `);
}

/**
 * Display version information
 */
function displayVersion() {
  console.log(`
LightDom Blockchain Automation System v1.0.0

Built with:
- Node.js ${process.version}
- Puppeteer with @puppeteer/browsers
- Enterprise-grade automation framework
- Large-scale project management capabilities
- Intelligent blockchain node management
- Comprehensive monitoring and alerting
  `);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  displayHelp();
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  displayVersion();
  process.exit(0);
}

if (args.includes('--verbose')) {
  process.env.LOG_LEVEL = 'verbose';
}

if (args.includes('--debug')) {
  process.env.LOG_LEVEL = 'debug';
}

if (args.includes('--dry-run')) {
  console.log('🔍 Running in dry-run mode');
  process.env.DRY_RUN = 'true';
}

// Start the application
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
