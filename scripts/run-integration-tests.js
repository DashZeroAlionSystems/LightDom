#!/usr/bin/env node

/**
 * LightDom Integration Test Suite
 * Comprehensive testing of all system components
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

class LightDomIntegrationTest {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
    this.services = new Map();
    this.isRunning = false;
  }

  async runAllTests() {
    console.log('🧪 Starting LightDom Integration Tests...');
    console.log('==========================================');

    try {
      // Start services
      await this.startServices();
      
      // Wait for services to be ready
      await this.waitForServices();
      
      // Run test suite
      await this.runTestSuite();
      
      // Generate report
      this.generateReport();
      
      // Cleanup
      await this.cleanup();
      
    } catch (error) {
      console.error('❌ Integration tests failed:', error);
      await this.cleanup();
      process.exit(1);
    }
  }

  async startServices() {
    console.log('🚀 Starting services for testing...');
    
    // Start API server
    await this.startService('api-server', 'node', ['api-server-express.js'], {
      PORT: '3001',
      NODE_ENV: 'test'
    });
    
    // Start enhanced systems
    await this.startService('enhanced-systems', 'node', ['scripts/start-enhanced-systems.js'], {
      BLOCKCHAIN_RPC_URL: 'http://localhost:8545',
      CRAWLER_MAX_CONCURRENCY: '3'
    });
    
    console.log('✅ Services started');
  }

  async startService(name, command, args, env = {}) {
    const process = spawn(command, args, {
      cwd: projectRoot,
      env: { ...process.env, ...env },
      stdio: 'pipe',
      shell: true
    });

    this.services.set(name, process);

    process.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('node_modules')) {
        console.log(`[${name}] ${output}`);
      }
    });

    process.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('node_modules')) {
        console.error(`[${name}] ${output}`);
      }
    });

    return new Promise((resolve) => {
      setTimeout(resolve, 2000); // Give services time to start
    });
  }

  async waitForServices() {
    console.log('⏳ Waiting for services to be ready...');
    
    const maxWaitTime = 60000; // 60 seconds
    const checkInterval = 2000; // 2 seconds
    let elapsed = 0;

    while (elapsed < maxWaitTime) {
      try {
        const apiReady = await this.checkServiceHealth('api-server');
        if (apiReady) {
          console.log('✅ Services are ready');
          return;
        }
      } catch (error) {
        // Continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
      elapsed += checkInterval;
    }
    
    throw new Error('Services failed to start within timeout');
  }

  async checkServiceHealth(serviceName) {
    switch (serviceName) {
      case 'api-server':
        try {
          const response = await fetch('http://localhost:3001/api/health');
          return response.ok;
        } catch (error) {
          return false;
        }
      default:
        return false;
    }
  }

  async runTestSuite() {
    console.log('🧪 Running integration tests...');
    
    const tests = [
      { name: 'API Health Check', test: () => this.testAPIHealth() },
      { name: 'Database Connection', test: () => this.testDatabaseConnection() },
      { name: 'Blockchain System', test: () => this.testBlockchainSystem() },
      { name: 'Crawler System', test: () => this.testCrawlerSystem() },
      { name: 'Wallet API', test: () => this.testWalletAPI() },
      { name: 'Metaverse API', test: () => this.testMetaverseAPI() },
      { name: 'Headless API', test: () => this.testHeadlessAPI() },
      { name: 'PWA Features', test: () => this.testPWAFeatures() },
      { name: 'System Integration', test: () => this.testSystemIntegration() },
      { name: 'Performance Metrics', test: () => this.testPerformanceMetrics() }
    ];

    for (const { name, test } of tests) {
      await this.runTest(name, test);
    }
  }

  async runTest(name, testFunction) {
    this.testResults.total++;
    console.log(`\n🔍 Testing: ${name}`);
    
    try {
      await testFunction();
      this.testResults.passed++;
      this.testResults.details.push({ name, status: 'PASSED', error: null });
      console.log(`✅ ${name}: PASSED`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push({ name, status: 'FAILED', error: error.message });
      console.log(`❌ ${name}: FAILED - ${error.message}`);
    }
  }

  async testAPIHealth() {
    const response = await fetch('http://localhost:3001/api/health');
    if (!response.ok) {
      throw new Error(`API health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error('API health check returned failure');
    }
  }

  async testDatabaseConnection() {
    const response = await fetch('http://localhost:3001/api/db/health');
    if (!response.ok) {
      throw new Error(`Database health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error('Database health check returned failure');
    }
  }

  async testBlockchainSystem() {
    const response = await fetch('http://localhost:3001/api/blockchain/stats');
    if (!response.ok) {
      throw new Error(`Blockchain API failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error('Blockchain API returned failure');
    }
    
    // Check if enhanced system is available
    if (global.blockchainSystem) {
      const stats = global.blockchainSystem.getMiningStats();
      if (!stats) {
        throw new Error('Enhanced blockchain system not properly initialized');
      }
    }
  }

  async testCrawlerSystem() {
    const response = await fetch('http://localhost:3001/api/crawler/stats');
    if (!response.ok) {
      throw new Error(`Crawler API failed: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error('Crawler API returned failure');
    }
    
    // Check if enhanced system is available
    if (global.crawlerSystem) {
      const stats = global.crawlerSystem.getCrawlerStats();
      if (!stats) {
        throw new Error('Enhanced crawler system not properly initialized');
      }
    }
  }

  async testWalletAPI() {
    const endpoints = [
      '/api/wallet/balance',
      '/api/wallet/transactions',
      '/api/wallet/items',
      '/api/wallet/stats'
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`http://localhost:3001${endpoint}`);
      if (!response.ok) {
        throw new Error(`Wallet API ${endpoint} failed: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(`Wallet API ${endpoint} returned failure`);
      }
    }
  }

  async testMetaverseAPI() {
    const endpoints = [
      '/api/metaverse/stats',
      '/api/metaverse/bridges',
      '/api/metaverse/chatrooms',
      '/api/metaverse/economy'
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`http://localhost:3001${endpoint}`);
      if (!response.ok) {
        throw new Error(`Metaverse API ${endpoint} failed: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(`Metaverse API ${endpoint} returned failure`);
      }
    }
  }

  async testHeadlessAPI() {
    const endpoints = [
      '/api/headless/status',
      '/api/headless/blockchain/stats',
      '/api/headless/crawler/stats'
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`http://localhost:3001${endpoint}`);
      if (!response.ok) {
        throw new Error(`Headless API ${endpoint} failed: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(`Headless API ${endpoint} returned failure`);
      }
    }
  }

  async testPWAFeatures() {
    // Test PWA manifest
    const manifestResponse = await fetch('http://localhost:3001/manifest.json');
    if (!manifestResponse.ok) {
      throw new Error('PWA manifest not accessible');
    }
    
    const manifest = await manifestResponse.json();
    if (!manifest.name || !manifest.short_name) {
      throw new Error('PWA manifest missing required fields');
    }
    
    // Test service worker
    const swResponse = await fetch('http://localhost:3001/sw.js');
    if (!swResponse.ok) {
      throw new Error('Service worker not accessible');
    }
  }

  async testSystemIntegration() {
    const response = await fetch('http://localhost:3001/api/headless/status');
    if (!response.ok) {
      throw new Error('System integration status check failed');
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error('System integration status returned failure');
    }
    
    // Check if all systems are integrated
    const status = data.data;
    if (!status.enhanced || !status.pwa) {
      throw new Error('System integration incomplete');
    }
  }

  async testPerformanceMetrics() {
    const response = await fetch('http://localhost:3001/api/integrated/dashboard');
    if (!response.ok) {
      throw new Error('Performance metrics API failed');
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error('Performance metrics API returned failure');
    }
    
    // Check if performance data is present
    const dashboard = data.data;
    if (!dashboard.blockchain || !dashboard.crawler || !dashboard.optimization) {
      throw new Error('Performance metrics incomplete');
    }
  }

  generateReport() {
    console.log('\n📊 Integration Test Report');
    console.log('========================');
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed}`);
    console.log(`Failed: ${this.testResults.failed}`);
    console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    
    if (this.testResults.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.details
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n✅ Passed Tests:');
    this.testResults.details
      .filter(test => test.status === 'PASSED')
      .forEach(test => {
        console.log(`  - ${test.name}`);
      });
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.testResults.total,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        successRate: (this.testResults.passed / this.testResults.total) * 100
      },
      details: this.testResults.details
    };
    
    fs.writeFile('integration-test-report.json', JSON.stringify(report, null, 2))
      .then(() => console.log('\n📄 Report saved to integration-test-report.json'))
      .catch(err => console.error('Failed to save report:', err));
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    for (const [serviceName, process] of this.services) {
      if (process && !process.killed) {
        console.log(`🛑 Stopping ${serviceName}...`);
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
      }
    }
    
    console.log('✅ Cleanup complete');
  }
}

// Run integration tests
const integrationTest = new LightDomIntegrationTest();

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down...');
  await integrationTest.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  await integrationTest.cleanup();
  process.exit(0);
});

// Start tests
integrationTest.runAllTests().catch(async (error) => {
  console.error('💥 Integration tests failed:', error);
  await integrationTest.cleanup();
  process.exit(1);
});

export { LightDomIntegrationTest };
