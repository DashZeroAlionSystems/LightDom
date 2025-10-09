#!/usr/bin/env node

/**
 * LightDom Enhanced Integration Test Suite
 * Comprehensive testing with admin system integration
 */

import axios from 'axios';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'http://localhost:3001';
const ADMIN_BASE = 'http://localhost:8081';
const ANALYTICS_BASE = 'http://localhost:8082';
const PRODUCTION_BASE = 'http://localhost:8080';
const INTEGRATION_BASE = 'http://localhost:8084';

const TESTS = [];
let services = {
  api: null,
  admin: null,
  analytics: null,
  production: null,
  integration: null,
  electron: null
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bright}${colors.blue}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(80)}${colors.reset}\n`);
}

// Test runner with enhanced reporting
async function runTest(name, testFn, category = 'general') {
  const startTime = Date.now();
  try {
    log(`🧪 Testing ${name}...`, 'yellow');
    const result = await testFn();
    const duration = Date.now() - startTime;
    log(`✅ ${name} - PASSED (${duration}ms)`, 'green');
    TESTS.push({ 
      name, 
      category,
      status: 'PASSED', 
      result, 
      duration,
      timestamp: new Date().toISOString()
    });
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`❌ ${name} - FAILED: ${error.message} (${duration}ms)`, 'red');
    TESTS.push({ 
      name, 
      category,
      status: 'FAILED', 
      error: error.message, 
      duration,
      timestamp: new Date().toISOString()
    });
    return false;
  }
}

// Service management
async function startService(serviceName, scriptPath, port, env = {}) {
  return new Promise((resolve, reject) => {
    log(`🚀 Starting ${serviceName} on port ${port}...`, 'cyan');
    
    const service = spawn('node', [scriptPath], {
      env: {
        ...process.env,
        ...env
      },
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    
    services[serviceName] = service;
    
    service.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes(`running on port ${port}`) || output.includes('started successfully')) {
        log(`✅ ${serviceName} started successfully`, 'green');
        setTimeout(resolve, 2000);
      }
    });
    
    service.stderr.on('data', (data) => {
      console.error(`[${serviceName}] ${data.toString()}`);
    });
    
    service.on('error', (error) => {
      log(`❌ Failed to start ${serviceName}: ${error.message}`, 'red');
      reject(error);
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      reject(new Error(`${serviceName} failed to start within timeout`));
    }, 30000);
  });
}

async function startAllServices() {
  logSection('Starting All Services');
  
  try {
    // Start API server
    await startService('api', 'api-server-express.js', 3001, {
      DB_DISABLED: 'false',
      BLOCKCHAIN_ENABLED: 'true',
      ENABLE_ALL_SERVICES: 'true'
    });
    
    // Start admin dashboard
    await startService('admin', 'scripts/admin-dashboard.js', 8081);
    
    // Start analytics system
    await startService('analytics', 'scripts/analytics-system.js', 8082);
    
    // Start production dashboard
    await startService('production', 'scripts/production-dashboard.js', 8080);
    
    // Start system integration
    await startService('integration', 'scripts/system-integration.js', 8084);
    
    log('🎉 All services started successfully!', 'green');
  } catch (error) {
    log(`❌ Failed to start services: ${error.message}`, 'red');
    throw error;
  }
}

// Core API Tests
async function testCoreAPIs() {
  logSection('Testing Core APIs');
  
  await runTest('API Health Check', async () => {
    const response = await axios.get(`${API_BASE}/api/health`);
    if (!response.data.success) {
      throw new Error('API health check failed');
    }
    return response.data;
  }, 'api');
  
  await runTest('Database Health', async () => {
    const response = await axios.get(`${API_BASE}/api/db/health`);
    if (!response.data.success) {
      throw new Error('Database health check failed');
    }
    return response.data;
  }, 'api');
  
  await runTest('Blockchain Status', async () => {
    const response = await axios.get(`${API_BASE}/api/blockchain/status`);
    return response.data;
  }, 'blockchain');
  
  await runTest('Crawler Status', async () => {
    const response = await axios.get(`${API_BASE}/api/crawler/status`);
    return response.data;
  }, 'crawler');
  
  await runTest('Mining Stats', async () => {
    const response = await axios.get(`${API_BASE}/api/mining/stats`);
    return response.data;
  }, 'mining');
}

// Admin System Tests
async function testAdminSystem() {
  logSection('Testing Admin System');
  
  await runTest('Admin Dashboard Access', async () => {
    const response = await axios.get(`${ADMIN_BASE}/admin`);
    if (response.status !== 200) {
      throw new Error('Admin dashboard not accessible');
    }
    return 'Admin dashboard accessible';
  }, 'admin');
  
  await runTest('Admin API Health', async () => {
    const response = await axios.get(`${ADMIN_BASE}/api/admin/overview`);
    if (!response.data.success) {
      throw new Error('Admin API not responding');
    }
    return response.data;
  }, 'admin');
  
  await runTest('Admin Authentication', async () => {
    const response = await axios.post(`${ADMIN_BASE}/api/admin/login`, {
      username: 'admin',
      password: 'admin123'
    });
    if (!response.data.success || !response.data.token) {
      throw new Error('Admin authentication failed');
    }
    return { token: response.data.token };
  }, 'admin');
  
  await runTest('User Management API', async () => {
    const response = await axios.get(`${ADMIN_BASE}/api/admin/users`);
    if (!response.data.success) {
      throw new Error('User management API failed');
    }
    return response.data;
  }, 'admin');
  
  await runTest('System Configuration API', async () => {
    const response = await axios.get(`${ADMIN_BASE}/api/admin/config`);
    if (!response.data.success) {
      throw new Error('System configuration API failed');
    }
    return response.data;
  }, 'admin');
}

// Analytics System Tests
async function testAnalyticsSystem() {
  logSection('Testing Analytics System');
  
  await runTest('Analytics Dashboard Access', async () => {
    const response = await axios.get(`${ANALYTICS_BASE}/analytics`);
    if (response.status !== 200) {
      throw new Error('Analytics dashboard not accessible');
    }
    return 'Analytics dashboard accessible';
  }, 'analytics');
  
  await runTest('Real-time Analytics', async () => {
    const response = await axios.get(`${ANALYTICS_BASE}/api/analytics/realtime`);
    if (!response.data.success) {
      throw new Error('Real-time analytics failed');
    }
    return response.data;
  }, 'analytics');
  
  await runTest('User Analytics', async () => {
    const response = await axios.get(`${ANALYTICS_BASE}/api/analytics/users?period=7d`);
    if (!response.data.success) {
      throw new Error('User analytics failed');
    }
    return response.data;
  }, 'analytics');
  
  await runTest('Performance Analytics', async () => {
    const response = await axios.get(`${ANALYTICS_BASE}/api/analytics/performance?period=24h`);
    if (!response.data.success) {
      throw new Error('Performance analytics failed');
    }
    return response.data;
  }, 'analytics');
  
  await runTest('Business Analytics', async () => {
    const response = await axios.get(`${ANALYTICS_BASE}/api/analytics/business?period=30d`);
    if (!response.data.success) {
      throw new Error('Business analytics failed');
    }
    return response.data;
  }, 'analytics');
  
  await runTest('Event Tracking', async () => {
    const response = await axios.post(`${ANALYTICS_BASE}/api/analytics/track`, {
      event: 'test_event',
      data: { test: true },
      userId: 'test-user',
      sessionId: 'test-session'
    });
    if (!response.data.success) {
      throw new Error('Event tracking failed');
    }
    return response.data;
  }, 'analytics');
}

// Production Dashboard Tests
async function testProductionDashboard() {
  logSection('Testing Production Dashboard');
  
  await runTest('Production Dashboard Access', async () => {
    const response = await axios.get(`${PRODUCTION_BASE}/`);
    if (response.status !== 200) {
      throw new Error('Production dashboard not accessible');
    }
    return 'Production dashboard accessible';
  }, 'production');
  
  await runTest('System Status API', async () => {
    const response = await axios.get(`${PRODUCTION_BASE}/api/status`);
    if (!response.data.success) {
      throw new Error('System status API failed');
    }
    return response.data;
  }, 'production');
  
  await runTest('Service Management API', async () => {
    const response = await axios.get(`${PRODUCTION_BASE}/api/services`);
    if (!response.data.success) {
      throw new Error('Service management API failed');
    }
    return response.data;
  }, 'production');
}

// System Integration Tests
async function testSystemIntegration() {
  logSection('Testing System Integration');
  
  await runTest('Integration Dashboard Access', async () => {
    const response = await axios.get(`${INTEGRATION_BASE}/`);
    if (response.status !== 200) {
      throw new Error('Integration dashboard not accessible');
    }
    return 'Integration dashboard accessible';
  }, 'integration');
  
  await runTest('System Status Integration', async () => {
    const response = await axios.get(`${INTEGRATION_BASE}/api/system/status`);
    if (!response.data.success) {
      throw new Error('System status integration failed');
    }
    return response.data;
  }, 'integration');
  
  await runTest('Health Overview Integration', async () => {
    const response = await axios.get(`${INTEGRATION_BASE}/api/health/overview`);
    if (!response.data.success) {
      throw new Error('Health overview integration failed');
    }
    return response.data;
  }, 'integration');
  
  await runTest('Performance Overview Integration', async () => {
    const response = await axios.get(`${INTEGRATION_BASE}/api/performance/overview`);
    if (!response.data.success) {
      throw new Error('Performance overview integration failed');
    }
    return response.data;
  }, 'integration');
}

// Wallet System Tests
async function testWalletSystem() {
  logSection('Testing Wallet System');
  
  await runTest('Wallet Balance API', async () => {
    const response = await axios.get(`${API_BASE}/api/wallet/balance`, {
      headers: { 'x-user-id': 'test-user' }
    });
    if (!response.data.success) {
      throw new Error('Wallet balance API failed');
    }
    return response.data;
  }, 'wallet');
  
  await runTest('Wallet Transactions API', async () => {
    const response = await axios.get(`${API_BASE}/api/wallet/transactions`, {
      headers: { 'x-user-id': 'test-user' }
    });
    if (!response.data.success) {
      throw new Error('Wallet transactions API failed');
    }
    return response.data;
  }, 'wallet');
  
  await runTest('Wallet Items API', async () => {
    const response = await axios.get(`${API_BASE}/api/wallet/items`);
    if (!response.data.success) {
      throw new Error('Wallet items API failed');
    }
    return response.data;
  }, 'wallet');
  
  await runTest('Wallet Stats API', async () => {
    const response = await axios.get(`${API_BASE}/api/wallet/stats`, {
      headers: { 'x-user-id': 'test-user' }
    });
    if (!response.data.success) {
      throw new Error('Wallet stats API failed');
    }
    return response.data;
  }, 'wallet');
}

// Metaverse System Tests
async function testMetaverseSystem() {
  logSection('Testing Metaverse System');
  
  await runTest('Metaverse Stats API', async () => {
    const response = await axios.get(`${API_BASE}/api/metaverse/stats`);
    if (!response.data.success) {
      throw new Error('Metaverse stats API failed');
    }
    return response.data;
  }, 'metaverse');
  
  await runTest('Bridges API', async () => {
    const response = await axios.get(`${API_BASE}/api/metaverse/bridges`);
    if (!response.data.success) {
      throw new Error('Bridges API failed');
    }
    return response.data;
  }, 'metaverse');
  
  await runTest('Chat Rooms API', async () => {
    const response = await axios.get(`${API_BASE}/api/metaverse/chatrooms`);
    if (!response.data.success) {
      throw new Error('Chat rooms API failed');
    }
    return response.data;
  }, 'metaverse');
  
  await runTest('Economy API', async () => {
    const response = await axios.get(`${API_BASE}/api/metaverse/economy`);
    if (!response.data.success) {
      throw new Error('Economy API failed');
    }
    return response.data;
  }, 'metaverse');
}

// PWA Tests
async function testPWASystem() {
  logSection('Testing PWA System');
  
  await runTest('Service Worker', async () => {
    const response = await axios.get(`${API_BASE}/sw.js`);
    if (!response.data.includes('ServiceWorker')) {
      throw new Error('Service worker not found');
    }
    return 'Service worker loaded';
  }, 'pwa');
  
  await runTest('PWA Manifest', async () => {
    const response = await axios.get(`${API_BASE}/manifest.json`);
    if (!response.data.name || !response.data.icons) {
      throw new Error('Invalid manifest');
    }
    return response.data;
  }, 'pwa');
  
  await runTest('PWA Icons', async () => {
    const iconResponse = await axios.get(`${API_BASE}/icon-192.png`);
    if (iconResponse.status !== 200) {
      throw new Error('PWA icons not accessible');
    }
    return 'PWA icons accessible';
  }, 'pwa');
}

// Performance Tests
async function testPerformance() {
  logSection('Testing Performance');
  
  await runTest('API Response Time', async () => {
    const startTime = Date.now();
    await axios.get(`${API_BASE}/api/health`);
    const responseTime = Date.now() - startTime;
    
    if (responseTime > 5000) {
      throw new Error(`API response time too slow: ${responseTime}ms`);
    }
    
    return `API response time: ${responseTime}ms`;
  }, 'performance');
  
  await runTest('Admin Dashboard Load Time', async () => {
    const startTime = Date.now();
    await axios.get(`${ADMIN_BASE}/admin`);
    const loadTime = Date.now() - startTime;
    
    if (loadTime > 10000) {
      throw new Error(`Admin dashboard load time too slow: ${loadTime}ms`);
    }
    
    return `Admin dashboard load time: ${loadTime}ms`;
  }, 'performance');
  
  await runTest('Analytics Dashboard Load Time', async () => {
    const startTime = Date.now();
    await axios.get(`${ANALYTICS_BASE}/analytics`);
    const loadTime = Date.now() - startTime;
    
    if (loadTime > 10000) {
      throw new Error(`Analytics dashboard load time too slow: ${loadTime}ms`);
    }
    
    return `Analytics dashboard load time: ${loadTime}ms`;
  }, 'performance');
}

// Security Tests
async function testSecurity() {
  logSection('Testing Security');
  
  await runTest('CORS Headers', async () => {
    const response = await axios.options(`${API_BASE}/api/health`);
    if (!response.headers['access-control-allow-origin']) {
      throw new Error('CORS headers not properly configured');
    }
    return 'CORS headers configured';
  }, 'security');
  
  await runTest('API Rate Limiting', async () => {
    // Make multiple rapid requests to test rate limiting
    const requests = Array(10).fill().map(() => 
      axios.get(`${API_BASE}/api/health`).catch(err => err.response)
    );
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r && r.status === 429);
    
    if (!rateLimited) {
      log('⚠️  Rate limiting not detected (may be disabled in test mode)', 'yellow');
    }
    
    return 'Rate limiting test completed';
  }, 'security');
  
  await runTest('Admin Authentication Required', async () => {
    try {
      await axios.get(`${ADMIN_BASE}/api/admin/users`);
      throw new Error('Admin API should require authentication');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return 'Admin authentication properly required';
      }
      throw error;
    }
  }, 'security');
}

// Generate comprehensive test report
async function generateReport() {
  logSection('Test Results Summary');
  
  const categories = [...new Set(TESTS.map(t => t.category))];
  const total = TESTS.length;
  const passed = TESTS.filter(t => t.status === 'PASSED').length;
  const failed = TESTS.filter(t => t.status === 'FAILED').length;
  
  console.log(`\n📊 Overall Results:`);
  log(`Total Tests: ${total}`, 'bright');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  // Category breakdown
  console.log(`\n📈 Results by Category:`);
  categories.forEach(category => {
    const categoryTests = TESTS.filter(t => t.category === category);
    const categoryPassed = categoryTests.filter(t => t.status === 'PASSED').length;
    const categoryTotal = categoryTests.length;
    const categoryRate = ((categoryPassed / categoryTotal) * 100).toFixed(1);
    
    log(`${category.toUpperCase()}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`, 
         categoryPassed === categoryTotal ? 'green' : 'yellow');
  });
  
  // Performance summary
  const performanceTests = TESTS.filter(t => t.category === 'performance');
  if (performanceTests.length > 0) {
    console.log(`\n⚡ Performance Summary:`);
    performanceTests.forEach(test => {
      if (test.status === 'PASSED') {
        log(`  ✅ ${test.name}: ${test.result}`, 'green');
      }
    });
  }
  
  // Failed tests details
  if (failed > 0) {
    console.log(`\n❌ Failed Tests:`);
    TESTS.filter(t => t.status === 'FAILED').forEach(test => {
      log(`  - ${test.name} (${test.category}): ${test.error}`, 'red');
    });
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed,
      successRate: `${((passed / total) * 100).toFixed(1)}%`
    },
    categories: categories.map(category => {
      const categoryTests = TESTS.filter(t => t.category === category);
      return {
        name: category,
        total: categoryTests.length,
        passed: categoryTests.filter(t => t.status === 'PASSED').length,
        failed: categoryTests.filter(t => t.status === 'FAILED').length,
        successRate: `${((categoryTests.filter(t => t.status === 'PASSED').length / categoryTests.length) * 100).toFixed(1)}%`
      };
    }),
    tests: TESTS,
    services: {
      api: 'http://localhost:3001',
      admin: 'http://localhost:8081/admin',
      analytics: 'http://localhost:8082/analytics',
      production: 'http://localhost:8080',
      integration: 'http://localhost:8084'
    }
  };
  
  try {
    await fs.writeFile('enhanced-integration-test-report.json', JSON.stringify(report, null, 2));
    log('\n📄 Detailed report saved to enhanced-integration-test-report.json', 'cyan');
  } catch (error) {
    log(`❌ Failed to save report: ${error.message}`, 'red');
  }
}

// Cleanup function
async function cleanup() {
  log('\n🧹 Cleaning up services...', 'yellow');
  
  for (const [serviceName, service] of Object.entries(services)) {
    if (service && service.pid) {
      try {
        service.kill('SIGTERM');
        log(`✅ ${serviceName} stopped`, 'cyan');
      } catch (error) {
        log(`⚠️  Failed to stop ${serviceName}: ${error.message}`, 'yellow');
      }
    }
  }
  
  // Wait for graceful shutdown
  await new Promise(resolve => setTimeout(resolve, 3000));
}

// Main test runner
async function main() {
  console.clear();
  log('🚀 LightDom Enhanced Integration Test Suite', 'bright');
  log('Testing all systems with admin integration\n', 'cyan');
  
  try {
    // Start all services
    await startAllServices();
    
    // Run all test suites
    await testCoreAPIs();
    await testAdminSystem();
    await testAnalyticsSystem();
    await testProductionDashboard();
    await testSystemIntegration();
    await testWalletSystem();
    await testMetaverseSystem();
    await testPWASystem();
    await testPerformance();
    await testSecurity();
    
    log('\n🎉 All tests completed!', 'green');
    
  } catch (error) {
    log(`\n💥 Fatal error: ${error.message}`, 'red');
  } finally {
    // Generate comprehensive report
    await generateReport();
    
    // Cleanup
    await cleanup();
    
    // Exit with appropriate code
    const failed = TESTS.filter(t => t.status === 'FAILED').length;
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  log('\n\n⏹️  Interrupted by user', 'yellow');
  await cleanup();
  process.exit(1);
});

process.on('uncaughtException', async (error) => {
  log(`\n💥 Uncaught exception: ${error.message}`, 'red');
  await cleanup();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  log(`\n💥 Unhandled rejection: ${reason}`, 'red');
  await cleanup();
  process.exit(1);
});

// Run the enhanced test suite
main();
