#!/usr/bin/env node

/**
 * Test Complete Integration
 * Verifies all overlooked code is now connected and running
 */

import axios from 'axios';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:3001';
const TESTS = [];
let electronProcess = null;
let apiProcess = null;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

// Test runner
async function runTest(name, testFn) {
  try {
    log(`Testing ${name}...`, 'yellow');
    const result = await testFn();
    log(`✅ ${name} - PASSED`, 'green');
    TESTS.push({ name, status: 'PASSED', result });
    return true;
  } catch (error) {
    log(`❌ ${name} - FAILED: ${error.message}`, 'red');
    TESTS.push({ name, status: 'FAILED', error: error.message });
    return false;
  }
}

// Start the API server
async function startAPIServer() {
  return new Promise((resolve, reject) => {
    log('Starting API server...', 'cyan');
    
    apiProcess = spawn('node', ['api-server-express.js'], {
      env: {
        ...process.env,
        DB_DISABLED: 'true',
        BLOCKCHAIN_ENABLED: 'true',
        ENABLE_ALL_SERVICES: 'true'
      },
      cwd: process.cwd()
    });
    
    apiProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('DOM Space Harvester API running on port')) {
        log('API server started successfully', 'green');
        setTimeout(resolve, 2000); // Give it time to fully initialize
      }
    });
    
    apiProcess.stderr.on('data', (data) => {
      console.error(`API Error: ${data}`);
    });
    
    apiProcess.on('error', reject);
    
    // Timeout after 30 seconds
    setTimeout(() => reject(new Error('API server failed to start')), 30000);
  });
}

// Start Electron app
async function startElectron() {
  return new Promise((resolve, reject) => {
    log('Starting Electron app...', 'cyan');
    
    const electronPath = 'electron';
    electronProcess = spawn(electronPath, ['electron/main.js'], {
      env: {
        ...process.env,
        NODE_ENV: 'production'
      },
      cwd: process.cwd()
    });
    
    electronProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`Electron: ${output}`);
      if (output.includes('LightDom backend services with all integrated features')) {
        log('Electron app started successfully', 'green');
        setTimeout(resolve, 3000); // Give it time to fully load
      }
    });
    
    electronProcess.stderr.on('data', (data) => {
      console.error(`Electron Error: ${data}`);
    });
    
    electronProcess.on('error', reject);
    
    // Timeout after 30 seconds
    setTimeout(() => resolve(), 30000); // Resolve anyway for headless testing
  });
}

// API Tests
async function testAPIs() {
  logSection('Testing Integrated APIs');
  
  // Test unused APIs that were connected
  await runTest('Gamification API', async () => {
    const response = await axios.get(`${API_BASE}/api/gamification/stats`);
    if (!response.data.success || !response.data.data.points) {
      throw new Error('Invalid gamification response');
    }
    return response.data;
  });
  
  await runTest('Metaverse Alchemy API', async () => {
    const response = await axios.get(`${API_BASE}/api/metaverse-alchemy/items`);
    if (!response.data.success || !response.data.data.items) {
      throw new Error('Invalid metaverse response');
    }
    return response.data;
  });
  
  await runTest('Space Mining API', async () => {
    const response = await axios.get(`${API_BASE}/api/space-mining/status`);
    if (!response.data.success || !response.data.data.currentMiningRate) {
      throw new Error('Invalid space mining response');
    }
    return response.data;
  });
  
  await runTest('Tasks API', async () => {
    const response = await axios.get(`${API_BASE}/api/tasks/list`);
    if (!response.data.success || !response.data.data.tasks) {
      throw new Error('Invalid tasks response');
    }
    return response.data;
  });
  
  await runTest('Advanced Nodes API', async () => {
    const response = await axios.get(`${API_BASE}/api/advanced-nodes/list`);
    if (!response.data.success || !response.data.data.nodes) {
      throw new Error('Invalid nodes response');
    }
    return response.data;
  });
  
  await runTest('BrowserBase API', async () => {
    const response = await axios.get(`${API_BASE}/api/browserbase/status`);
    if (!response.data.success || !response.data.data.browsers) {
      throw new Error('Invalid browserbase response');
    }
    return response.data;
  });
}

// Test mining integration
async function testMiningIntegration() {
  logSection('Testing Mining Integration');
  
  await runTest('Mining Stats', async () => {
    const response = await axios.get(`${API_BASE}/api/mining/stats`);
    return response.data;
  });
  
  await runTest('Blockchain Mining Stats', async () => {
    const response = await axios.get(`${API_BASE}/api/blockchain/mining/stats`);
    return response.data;
  });
}

// Test extension bridge
async function testExtensionBridge() {
  logSection('Testing Extension Bridge');
  
  await runTest('Extension Auth', async () => {
    const response = await axios.post(`${API_BASE}/api/extension/auth`, {
      extensionId: 'test-extension-123',
      token: 'test-token'
    });
    if (!response.data.success || !response.data.sessionToken) {
      throw new Error('Extension auth failed');
    }
    return response.data;
  });
}

// Test utility integration
async function testUtilityIntegration() {
  logSection('Testing Utility Integration');
  
  await runTest('Utility Metrics', async () => {
    const response = await axios.get(`${API_BASE}/api/utils/metrics`);
    if (!response.data.success) {
      throw new Error('Failed to get utility metrics');
    }
    return response.data;
  });
  
  await runTest('Store Artifact', async () => {
    const response = await axios.post(`${API_BASE}/api/utils/store-artifact`, {
      url: 'https://example.com',
      savings: 1024,
      optimizations: ['css', 'js'],
      timestamp: new Date().toISOString()
    });
    return response.data;
  });
}

// Test frontend assets
async function testFrontendAssets() {
  logSection('Testing Frontend Assets');
  
  await runTest('Service Worker', async () => {
    const response = await axios.get(`${API_BASE}/sw.js`);
    if (!response.data.includes('ServiceWorker')) {
      throw new Error('Service worker not found');
    }
    return 'Service worker loaded';
  });
  
  await runTest('PWA Manifest', async () => {
    const response = await axios.get(`${API_BASE}/manifest.json`);
    if (!response.data.name || !response.data.icons) {
      throw new Error('Invalid manifest');
    }
    return response.data;
  });
}

// Generate test report
function generateReport() {
  logSection('Test Results Summary');
  
  const passed = TESTS.filter(t => t.status === 'PASSED').length;
  const failed = TESTS.filter(t => t.status === 'FAILED').length;
  const total = TESTS.length;
  
  console.log(`\nTotal Tests: ${total}`);
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  console.log(`\nSuccess Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\nFailed Tests:');
    TESTS.filter(t => t.status === 'FAILED').forEach(test => {
      log(`  - ${test.name}: ${test.error}`, 'red');
    });
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    total,
    passed,
    failed,
    successRate: ((passed / total) * 100).toFixed(1) + '%',
    tests: TESTS
  };
  
  fs.writeFile('integration-test-report.json', JSON.stringify(report, null, 2))
    .then(() => log('\nReport saved to integration-test-report.json', 'cyan'))
    .catch(err => log(`Failed to save report: ${err.message}`, 'red'));
}

// Cleanup function
function cleanup() {
  log('\nCleaning up...', 'yellow');
  
  if (apiProcess) {
    apiProcess.kill();
    log('API server stopped', 'cyan');
  }
  
  if (electronProcess) {
    electronProcess.kill();
    log('Electron app stopped', 'cyan');
  }
}

// Main test runner
async function main() {
  console.clear();
  log('🚀 LightDOM Complete Integration Test', 'bright');
  log('Testing all connected features and services\n', 'cyan');
  
  try {
    // Start services
    await startAPIServer();
    
    // Note: Electron might not start in headless CI environment
    // But we can still test the API endpoints
    try {
      await startElectron();
    } catch (error) {
      log('Note: Electron app could not be started (expected in headless environment)', 'yellow');
    }
    
    // Run tests
    await testAPIs();
    await testMiningIntegration();
    await testExtensionBridge();
    await testUtilityIntegration();
    await testFrontendAssets();
    
  } catch (error) {
    log(`\nFatal error: ${error.message}`, 'red');
  } finally {
    // Generate report
    generateReport();
    
    // Cleanup
    cleanup();
    
    // Exit with appropriate code
    const failed = TESTS.filter(t => t.status === 'FAILED').length;
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\nInterrupted by user', 'yellow');
  cleanup();
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`\nUncaught exception: ${error.message}`, 'red');
  cleanup();
  process.exit(1);
});

// Run the tests
main();
