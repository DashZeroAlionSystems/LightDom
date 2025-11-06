#!/usr/bin/env node

/**
 * Enhanced Systems Startup Script
 * Initializes blockchain mining and web crawler systems with real-time monitoring
 */

import { LightDomMiningSystem } from '../blockchain/LightDomMiningSystem.js';
import { RealWebCrawlerSystem } from '../crawler/RealWebCrawlerSystem.js';
import { EventEmitter } from 'events';

class EnhancedSystemsManager extends EventEmitter {
  constructor() {
    super();
    
    this.blockchainSystem = null;
    this.crawlerSystem = null;
    this.isInitialized = false;
    this.healthCheckInterval = null;
    
    // System health status
    this.systemHealth = {
      blockchain: { isHealthy: false, lastCheck: null },
      crawler: { isHealthy: false, lastCheck: null },
      overall: 'unknown'
    };
  }

  async initialize() {
    console.log('🚀 Initializing Enhanced Systems Manager...');
    
    try {
      // Initialize blockchain system
      await this.initializeBlockchain();
      
      // Initialize crawler system
      await this.initializeCrawler();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      // Start real-time data integration
      this.startDataIntegration();
      
      this.isInitialized = true;
      console.log('✅ Enhanced Systems Manager initialized successfully');
      
      // Make systems globally available
      global.blockchainSystem = this.blockchainSystem;
      global.crawlerSystem = this.crawlerSystem;
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Systems Manager:', error);
      return false;
    }
  }

  async initializeBlockchain() {
    console.log('⛏️ Initializing Blockchain Mining System...');
    
    try {
      this.blockchainSystem = new LightDomMiningSystem({
        rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
        chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID) || 1337,
        miningInterval: parseInt(process.env.MINING_INTERVAL) || 30000,
        healthCheckInterval: parseInt(process.env.BLOCKCHAIN_HEALTH_CHECK_INTERVAL) || 10000
      });

      // Generate a mock private key for testing
      const mockPrivateKey = '0x' + '1'.repeat(64);
      
      await this.blockchainSystem.initialize(mockPrivateKey);
      
      // Start mining
      await this.blockchainSystem.startMining();
      
      // Subscribe to blockchain events
      this.blockchainSystem.on('blockMined', (block) => {
        console.log(`⛏️ Block mined: ${block.blockNumber} (${block.optimizations.length} optimizations)`);
        this.emit('blockchainUpdate', block);
      });

      this.blockchainSystem.on('healthUpdate', (health) => {
        this.systemHealth.blockchain = {
          isHealthy: health.isHealthy,
          lastCheck: Date.now(),
          status: health.networkStatus
        };
        this.updateOverallHealth();
      });

      console.log('✅ Blockchain Mining System initialized');
    } catch (error) {
      console.error('❌ Failed to initialize blockchain system:', error);
      throw error;
    }
  }

  async initializeCrawler() {
    console.log('🕷️ Initializing Web Crawler System...');
    
    try {
      this.crawlerSystem = new RealWebCrawlerSystem({
        maxConcurrency: parseInt(process.env.CRAWLER_MAX_CONCURRENCY) || 5,
        requestDelay: parseInt(process.env.CRAWLER_REQUEST_DELAY) || 2000,
        maxDepth: parseInt(process.env.CRAWLER_MAX_DEPTH) || 2,
        healthCheckInterval: parseInt(process.env.CRAWLER_HEALTH_CHECK_INTERVAL) || 15000,
        performanceUpdateInterval: parseInt(process.env.CRAWLER_PERFORMANCE_UPDATE_INTERVAL) || 5000
      });

      await this.crawlerSystem.initialize();
      
      // Start crawling with some sample URLs
      const sampleUrls = [
        'https://example.com',
        'https://httpbin.org',
        'https://jsonplaceholder.typicode.com'
      ];
      
      await this.crawlerSystem.startCrawling(sampleUrls);
      
      // Subscribe to crawler events
      this.crawlerSystem.on('optimizationComplete', (result) => {
        console.log(`🕷️ Optimization complete: ${result.url} (${result.spaceSaved}MB saved)`);
        this.emit('crawlerUpdate', result);
      });

      this.crawlerSystem.on('healthUpdate', (health) => {
        this.systemHealth.crawler = {
          isHealthy: health.isHealthy,
          lastCheck: Date.now(),
          status: health.crawlerStatus
        };
        this.updateOverallHealth();
      });

      console.log('✅ Web Crawler System initialized');
    } catch (error) {
      console.error('❌ Failed to initialize crawler system:', error);
      throw error;
    }
  }

  startHealthMonitoring() {
    console.log('🏥 Starting health monitoring...');
    
    this.healthCheckInterval = setInterval(async () => {
      await this.performSystemHealthCheck();
    }, 30000); // Check every 30 seconds
  }

  async performSystemHealthCheck() {
    try {
      // Check blockchain health
      if (this.blockchainSystem) {
        const blockchainHealth = this.blockchainSystem.getHealthStatus();
        this.systemHealth.blockchain = {
          isHealthy: blockchainHealth.isHealthy,
          lastCheck: Date.now(),
          status: blockchainHealth.miningActive ? 'mining' : 'idle'
        };
      }

      // Check crawler health
      if (this.crawlerSystem) {
        const crawlerHealth = this.crawlerSystem.getHealthStatus();
        this.systemHealth.crawler = {
          isHealthy: crawlerHealth.isHealthy,
          lastCheck: Date.now(),
          status: crawlerHealth.isRunning ? 'running' : 'idle'
        };
      }

      this.updateOverallHealth();
      
      // Emit system health update
      this.emit('systemHealthUpdate', this.systemHealth);
      
    } catch (error) {
      console.error('❌ System health check failed:', error);
    }
  }

  updateOverallHealth() {
    const blockchainHealthy = this.systemHealth.blockchain.isHealthy;
    const crawlerHealthy = this.systemHealth.crawler.isHealthy;
    
    if (blockchainHealthy && crawlerHealthy) {
      this.systemHealth.overall = 'excellent';
    } else if (blockchainHealthy || crawlerHealthy) {
      this.systemHealth.overall = 'warning';
    } else {
      this.systemHealth.overall = 'critical';
    }
  }

  startDataIntegration() {
    console.log('📊 Starting real-time data integration...');
    
    // Subscribe to blockchain data updates
    if (this.blockchainSystem) {
      this.blockchainSystem.subscribe((data) => {
        this.emit('blockchainDataUpdate', data);
      });
    }

    // Subscribe to crawler data updates
    if (this.crawlerSystem) {
      this.crawlerSystem.subscribe((data) => {
        this.emit('crawlerDataUpdate', data);
      });
    }
  }

  getSystemStatus() {
    return {
      isInitialized: this.isInitialized,
      blockchain: this.blockchainSystem ? this.blockchainSystem.getMiningStats() : null,
      crawler: this.crawlerSystem ? this.crawlerSystem.getCrawlerStats() : null,
      health: this.systemHealth
    };
  }

  async shutdown() {
    console.log('🛑 Shutting down Enhanced Systems Manager...');
    
    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      if (this.blockchainSystem) {
        await this.blockchainSystem.stopMining();
      }

      if (this.crawlerSystem) {
        await this.crawlerSystem.stopCrawling();
      }

      console.log('✅ Enhanced Systems Manager shutdown complete');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }
}

// Create and export the systems manager
const systemsManager = new EnhancedSystemsManager();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await systemsManager.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await systemsManager.shutdown();
  process.exit(0);
});

// Initialize systems
systemsManager.initialize().then((success) => {
  if (success) {
    console.log('🎉 Enhanced Systems Manager is running!');
    console.log('📊 Real-time data integration active');
    console.log('🏥 Health monitoring active');
  } else {
    console.error('💥 Failed to start Enhanced Systems Manager');
    process.exit(1);
  }
});

export { systemsManager, EnhancedSystemsManager };
