#!/usr/bin/env node

/**
 * RAG Service Integration Test
 * 
 * Tests the standalone RAG service for:
 * - Service startup and shutdown
 * - Health checks
 * - Readiness checks
 * - Metrics endpoint
 * - Database connectivity
 * - Error handling
 */

import fetch from 'node-fetch';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:3002';
const STARTUP_TIMEOUT = 30000; // 30 seconds
const TEST_TIMEOUT = 60000; // 60 seconds

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

/**
 * Run a single test
 */
async function runTest(name, testFn) {
  info(`Running test: ${name}`);
  try {
    await testFn();
    success(`Test passed: ${name}`);
    results.passed++;
    results.tests.push({ name, status: 'passed' });
    return true;
  } catch (err) {
    error(`Test failed: ${name}`);
    error(`  Error: ${err.message}`);
    results.failed++;
    results.tests.push({ name, status: 'failed', error: err.message });
    return false;
  }
}

/**
 * Wait for service to be ready
 */
async function waitForService(maxAttempts = 30, interval = 1000) {
  info(`Waiting for service at ${SERVICE_URL}...`);
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${SERVICE_URL}/health`, {
        timeout: 2000
      });
      
      if (response.ok) {
        success('Service is ready!');
        return true;
      }
    } catch (err) {
      // Service not ready yet
      process.stdout.write('.');
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Service did not start within timeout period');
}

/**
 * Test: Health Check
 */
async function testHealthCheck() {
  const response = await fetch(`${SERVICE_URL}/health`);
  
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  
  const data = await response.json();
  
  // Verify required fields
  if (!data.status || data.status !== 'healthy') {
    throw new Error('Service reports unhealthy status');
  }
  
  if (!data.service || data.service !== 'rag-standalone') {
    throw new Error('Invalid service identifier');
  }
  
  if (!data.timestamp) {
    throw new Error('Missing timestamp in health response');
  }
  
  info(`  Uptime: ${data.uptime}`);
  info(`  Requests: ${data.requests}`);
  info(`  Errors: ${data.errors}`);
}

/**
 * Test: Readiness Check
 */
async function testReadinessCheck() {
  const response = await fetch(`${SERVICE_URL}/ready`);
  
  if (!response.ok) {
    throw new Error(`Readiness check failed with status ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.status !== 'ready') {
    throw new Error('Service reports not ready');
  }
  
  if (data.database !== 'ok') {
    throw new Error('Database not ready');
  }
}

/**
 * Test: Metrics Endpoint
 */
async function testMetricsEndpoint() {
  const response = await fetch(`${SERVICE_URL}/metrics`);
  
  if (!response.ok) {
    throw new Error(`Metrics endpoint failed with status ${response.status}`);
  }
  
  const data = await response.json();
  
  // Verify required metrics
  const requiredFields = [
    'uptime_seconds',
    'requests_total',
    'errors_total',
    'requests_per_second',
    'error_rate',
    'memory',
    'timestamp'
  ];
  
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required metric: ${field}`);
    }
  }
  
  info(`  Uptime: ${data.uptime_seconds}s`);
  info(`  Total requests: ${data.requests_total}`);
  info(`  Error rate: ${(data.error_rate * 100).toFixed(2)}%`);
  info(`  Memory (heap): ${(data.memory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
}

/**
 * Test: 404 Not Found
 */
async function test404Response() {
  const response = await fetch(`${SERVICE_URL}/nonexistent-endpoint`);
  
  if (response.status !== 404) {
    throw new Error(`Expected 404, got ${response.status}`);
  }
  
  const data = await response.json();
  
  if (!data.error) {
    throw new Error('404 response should include error message');
  }
  
  if (!data.availableRoutes || !Array.isArray(data.availableRoutes)) {
    throw new Error('404 response should list available routes');
  }
}

/**
 * Test: RAG API Availability
 */
async function testRagApiAvailability() {
  // Test that RAG endpoints are mounted
  // We don't test actual RAG functionality as it requires DB/Ollama setup
  
  const endpoints = [
    '/api/rag',
    '/api/enhanced-rag'
  ];
  
  for (const endpoint of endpoints) {
    const response = await fetch(`${SERVICE_URL}${endpoint}`);
    
    // We expect either 200 (OK), 400 (Bad Request), or 405 (Method Not Allowed)
    // but not 404 (Not Found) which would mean the route isn't mounted
    if (response.status === 404) {
      throw new Error(`RAG endpoint not found: ${endpoint}`);
    }
  }
}

/**
 * Test: Concurrent Requests
 */
async function testConcurrentRequests() {
  const numRequests = 10;
  const requests = [];
  
  for (let i = 0; i < numRequests; i++) {
    requests.push(fetch(`${SERVICE_URL}/health`));
  }
  
  const responses = await Promise.all(requests);
  
  const allSuccessful = responses.every(r => r.ok);
  
  if (!allSuccessful) {
    throw new Error('Some concurrent requests failed');
  }
  
  info(`  Successfully handled ${numRequests} concurrent requests`);
}

/**
 * Test: Response Time
 */
async function testResponseTime() {
  const maxResponseTime = 1000; // 1 second
  
  const start = Date.now();
  const response = await fetch(`${SERVICE_URL}/health`);
  const duration = Date.now() - start;
  
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  
  if (duration > maxResponseTime) {
    throw new Error(`Response time ${duration}ms exceeds maximum ${maxResponseTime}ms`);
  }
  
  info(`  Response time: ${duration}ms`);
}

/**
 * Test: CORS Headers
 */
async function testCorsHeaders() {
  const response = await fetch(`${SERVICE_URL}/health`, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:3000',
      'Access-Control-Request-Method': 'POST'
    }
  });
  
  const corsHeader = response.headers.get('Access-Control-Allow-Origin');
  
  if (!corsHeader) {
    throw new Error('CORS headers not present');
  }
  
  info(`  CORS header: ${corsHeader}`);
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  log('RAG Service Integration Tests', 'cyan');
  console.log('='.repeat(60) + '\n');
  
  info(`Testing service at: ${SERVICE_URL}`);
  info(`Timeout: ${TEST_TIMEOUT / 1000}s\n`);
  
  try {
    // Wait for service to be ready
    await waitForService();
    console.log('');
    
    // Run tests
    await runTest('Health Check', testHealthCheck);
    await runTest('Readiness Check', testReadinessCheck);
    await runTest('Metrics Endpoint', testMetricsEndpoint);
    await runTest('404 Not Found Response', test404Response);
    await runTest('RAG API Availability', testRagApiAvailability);
    await runTest('Concurrent Requests', testConcurrentRequests);
    await runTest('Response Time', testResponseTime);
    await runTest('CORS Headers', testCorsHeaders);
    
  } catch (err) {
    error(`\nFatal error: ${err.message}`);
    results.failed++;
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  log('Test Summary', 'cyan');
  console.log('='.repeat(60));
  
  success(`Passed: ${results.passed}`);
  if (results.failed > 0) {
    error(`Failed: ${results.failed}`);
  }
  if (results.skipped > 0) {
    warn(`Skipped: ${results.skipped}`);
  }
  
  const total = results.passed + results.failed + results.skipped;
  const successRate = total > 0 ? (results.passed / total * 100).toFixed(1) : 0;
  
  console.log(`\nTotal: ${total} tests`);
  console.log(`Success rate: ${successRate}%`);
  
  // Print failed tests
  if (results.failed > 0) {
    console.log('\n' + '='.repeat(60));
    log('Failed Tests', 'red');
    console.log('='.repeat(60));
    
    results.tests
      .filter(t => t.status === 'failed')
      .forEach(t => {
        error(`${t.name}`);
        error(`  ${t.error}`);
      });
  }
  
  console.log('');
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Handle timeout
const timeoutHandle = setTimeout(() => {
  error('Tests timed out');
  process.exit(1);
}, TEST_TIMEOUT);

// Run tests
runAllTests()
  .then(() => {
    clearTimeout(timeoutHandle);
  })
  .catch(err => {
    clearTimeout(timeoutHandle);
    error(`Unhandled error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });
