#!/usr/bin/env node

/**
 * Neural Crawler Service Startup Script
 * 
 * Starts the complete neural network web crawler service with:
 * - TensorFlow.js integration
 * - Data stream management
 * - Campaign orchestration
 * - Real-time monitoring
 */

import IntegratedSEOCampaignService from './services/integrated-seo-campaign-service.js';
import NeuralCrawlerMonitoringDashboard from './services/neural-crawler-monitoring-dashboard.js';
import { Pool } from 'pg';

console.log('🚀 Starting Neural Crawler Service...\n');

// Configuration
const config = {
  // Database
  database: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lightdom',
    max: 20
  },
  
  // Service Configuration
  service: {
    campaignName: process.env.CAMPAIGN_NAME || 'default-campaign',
    enableNeuralNetwork: process.env.ENABLE_NEURAL !== 'false',
    enableDataStreams: process.env.ENABLE_STREAMS !== 'false',
    enableMonitoring: process.env.ENABLE_MONITORING !== 'false',
    continuousCrawling: process.env.CONTINUOUS_CRAWLING !== 'false',
    maxConcurrentCrawls: parseInt(process.env.MAX_CONCURRENT_CRAWLS || '10'),
    crawlInterval: parseInt(process.env.CRAWL_INTERVAL || '3600000'), // 1 hour
  },
  
  // Monitoring
  monitoring: {
    updateInterval: parseInt(process.env.MONITORING_INTERVAL || '30000'),
    enableAlerts: process.env.ENABLE_ALERTS !== 'false'
  }
};

// Create database pool
const db = new Pool(config.database);

// Initialize services
let seoCampaignService;
let monitoringDashboard;

async function initialize() {
  console.log('📊 Configuration:');
  console.log(`   Database: ${config.database.connectionString}`);
  console.log(`   Neural Network: ${config.service.enableNeuralNetwork ? 'Enabled' : 'Disabled'}`);
  console.log(`   Data Streams: ${config.service.enableDataStreams ? 'Enabled' : 'Disabled'}`);
  console.log(`   Monitoring: ${config.service.enableMonitoring ? 'Enabled' : 'Disabled'}`);
  console.log(`   Continuous Crawling: ${config.service.continuousCrawling ? 'Enabled' : 'Disabled'}`);
  console.log(`   Max Concurrent Crawls: ${config.service.maxConcurrentCrawls}`);
  console.log('');

  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    await db.query('SELECT 1');
    console.log('✅ Database connected\n');

    // Initialize integrated SEO campaign service
    console.log('🌐 Initializing SEO Campaign Service...');
    seoCampaignService = new IntegratedSEOCampaignService({
      db,
      ...config.service
    });
    await seoCampaignService.initialize();
    console.log('');

    // Initialize monitoring dashboard
    if (config.service.enableMonitoring) {
      console.log('📈 Initializing Monitoring Dashboard...');
      monitoringDashboard = new NeuralCrawlerMonitoringDashboard({
        db,
        ...config.monitoring
      });
      await monitoringDashboard.initialize();
      console.log('');
    }

    // Setup event listeners
    setupEventListeners();

    // Display status
    displayStatus();

    // Setup graceful shutdown
    setupGracefulShutdown();

    console.log('\n✅ Neural Crawler Service is running!');
    console.log('\n📚 API Documentation:');
    console.log('   Visit: http://localhost:3001/api/neural-seo/health');
    console.log('   Status: http://localhost:3001/api/neural-seo/status');
    console.log('   Monitoring: http://localhost:3001/api/neural-seo/monitoring');
    console.log('\n🛑 Press Ctrl+C to stop\n');

  } catch (error) {
    console.error('\n❌ Failed to initialize service:', error);
    process.exit(1);
  }
}

function setupEventListeners() {
  // SEO Campaign Service events
  if (seoCampaignService) {
    seoCampaignService.on('initialized', () => {
      console.log('✓ SEO Campaign Service initialized');
    });

    seoCampaignService.on('campaignCreated', (campaign) => {
      console.log(`✓ Campaign created: ${campaign.name} (${campaign.id})`);
    });

    seoCampaignService.on('urlCrawled', (event) => {
      console.log(`✓ Crawled: ${event.url} (Score: ${event.seoScore})`);
    });

    seoCampaignService.on('monitoringUpdate', (metrics) => {
      // Periodic updates logged in displayStatus
    });
  }

  // Monitoring Dashboard events
  if (monitoringDashboard) {
    monitoringDashboard.on('alerts', (alerts) => {
      console.log(`\n⚠️  ${alerts.length} new alert(s):`);
      alerts.forEach(alert => {
        console.log(`   [${alert.severity.toUpperCase()}] ${alert.message}`);
      });
      console.log('');
    });

    monitoringDashboard.on('metricsUpdated', (metrics) => {
      // Updates handled in displayStatus
    });
  }
}

function displayStatus() {
  // Display status every 30 seconds
  setInterval(() => {
    const status = seoCampaignService.getStatus();
    const monitoring = seoCampaignService.getMonitoring();

    console.log('\n📊 Status Update:');
    console.log(`   Campaigns Active: ${monitoring.campaignsActive}`);
    console.log(`   Crawls in Progress: ${monitoring.crawlsInProgress}`);
    console.log(`   Attributes Mined: ${monitoring.totalAttributesMined}`);
    if (status.capabilities.neuralNetworks) {
      console.log(`   Neural Network Accuracy: ${(monitoring.neuralNetworkAccuracy * 100).toFixed(1)}%`);
    }
    if (status.capabilities.dataStreams) {
      console.log(`   Data Stream Throughput: ${monitoring.dataStreamsThroughput} msg/s`);
    }
    console.log(`   System Health: ${monitoring.systemHealth}`);
    console.log('');
  }, 30000);
}

function setupGracefulShutdown() {
  const shutdown = async (signal) => {
    console.log(`\n\n🛑 Received ${signal}, shutting down gracefully...`);

    try {
      // Shutdown services
      if (seoCampaignService) {
        console.log('   Stopping SEO Campaign Service...');
        await seoCampaignService.shutdown();
      }

      if (monitoringDashboard) {
        console.log('   Stopping Monitoring Dashboard...');
        await monitoringDashboard.shutdown();
      }

      console.log('   Closing database connection...');
      await db.end();

      console.log('✅ Shutdown complete\n');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('\n❌ Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('\n❌ Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('UNHANDLED_REJECTION');
  });
}

// Start the service
initialize().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
