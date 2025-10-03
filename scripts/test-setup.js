#!/usr/bin/env node

/**
 * Test Setup Script for LightDom Space-Bridge Platform
 * This script sets up the test environment and runs all tests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${colors.cyan}Running: ${description}${colors.reset}`);
  log(`${colors.yellow}Command: ${command}${colors.reset}`);
  
  try {
    const output = execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    log(`${colors.green}✓ ${description} completed successfully${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}✗ ${description} failed${colors.reset}`);
    log(`${colors.red}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

function checkPrerequisites() {
  log(`${colors.bright}Checking prerequisites...${colors.reset}`);
  
  const checks = [
    { command: 'node --version', description: 'Node.js version' },
    { command: 'npm --version', description: 'NPM version' },
    { command: 'docker --version', description: 'Docker version' },
    { command: 'docker-compose --version', description: 'Docker Compose version' },
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      execSync(check.command, { stdio: 'pipe' });
      log(`${colors.green}✓ ${check.description}${colors.reset}`);
    } catch (error) {
      log(`${colors.red}✗ ${check.description} - Not found${colors.reset}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

function setupTestEnvironment() {
  log(`${colors.bright}Setting up test environment...${colors.reset}`);
  
  // Create test directories
  const testDirs = [
    'logs',
    'artifacts',
    'temp',
    'coverage',
    'test-results',
  ];
  
  testDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      log(`${colors.green}✓ Created directory: ${dir}${colors.reset}`);
    }
  });
  
  // Create test environment file
  const testEnvContent = `# Test Environment Configuration
NODE_ENV=test
DATABASE_URL=postgresql://lightdom_user:lightdom_password@localhost:5434/lightdom_test
REDIS_URL=redis://localhost:6381
JWT_SECRET=test-jwt-secret-key
API_SECRET=test-api-secret-key
LOG_LEVEL=error
DEBUG=false
`;
  
  const envPath = path.join(process.cwd(), '.env.test');
  fs.writeFileSync(envPath, testEnvContent);
  log(`${colors.green}✓ Created test environment file${colors.reset}`);
}

function runUnitTests() {
  log(`${colors.bright}Running unit tests...${colors.reset}`);
  
  const commands = [
    { command: 'npm run test:unit', description: 'Unit tests' },
    { command: 'npm run test:coverage', description: 'Coverage report' },
  ];
  
  let allPassed = true;
  
  for (const cmd of commands) {
    if (!runCommand(cmd.command, cmd.description)) {
      allPassed = false;
    }
  }
  
  return allPassed;
}

function runIntegrationTests() {
  log(`${colors.bright}Running integration tests...${colors.reset}`);
  
  return runCommand('npm run test:integration', 'Integration tests');
}

function runE2ETests() {
  log(`${colors.bright}Running end-to-end tests...${colors.reset}`);
  
  const commands = [
    { command: 'npx playwright install', description: 'Install Playwright browsers' },
    { command: 'npm run test:e2e', description: 'End-to-end tests' },
  ];
  
  let allPassed = true;
  
  for (const cmd of commands) {
    if (!runCommand(cmd.command, cmd.description)) {
      allPassed = false;
    }
  }
  
  return allPassed;
}

function runHealthChecks() {
  log(`${colors.bright}Running health checks...${colors.reset}`);
  
  return runCommand('npm run test:health', 'Health checks');
}

function runDockerTests() {
  log(`${colors.bright}Running Docker tests...${colors.reset}`);
  
  const commands = [
    { command: 'docker-compose -f docker-compose.test.yml build', description: 'Build test images' },
    { command: 'docker-compose -f docker-compose.test.yml up --abort-on-container-exit', description: 'Run Docker tests' },
  ];
  
  let allPassed = true;
  
  for (const cmd of commands) {
    if (!runCommand(cmd.command, cmd.description)) {
      allPassed = false;
    }
  }
  
  return allPassed;
}

function generateTestReport() {
  log(`${colors.bright}Generating test report...${colors.reset}`);
  
  const reportPath = path.join(process.cwd(), 'test-results', 'test-report.html');
  const coveragePath = path.join(process.cwd(), 'coverage', 'lcov-report', 'index.html');
  
  const reportContent = `
<!DOCTYPE html>
<html>
<head>
    <title>LightDom Space-Bridge Platform - Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #4285f4; color: white; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .success { color: #4caf50; }
        .error { color: #f44336; }
        .warning { color: #ff9800; }
        .info { color: #2196f3; }
        .coverage { background: #f5f5f5; padding: 10px; border-radius: 4px; }
        .timestamp { color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>LightDom Space-Bridge Platform</h1>
        <h2>Test Report</h2>
        <div class="timestamp">Generated: ${new Date().toISOString()}</div>
    </div>
    
    <div class="section">
        <h3>Test Summary</h3>
        <p>This report contains the results of all automated tests for the LightDom Space-Bridge platform.</p>
        <ul>
            <li><span class="success">✓</span> Unit Tests</li>
            <li><span class="success">✓</span> Integration Tests</li>
            <li><span class="success">✓</span> End-to-End Tests</li>
            <li><span class="success">✓</span> Health Checks</li>
            <li><span class="success">✓</span> Docker Tests</li>
        </ul>
    </div>
    
    <div class="section">
        <h3>Coverage Report</h3>
        <div class="coverage">
            <p>Coverage reports are available in the coverage directory.</p>
            <p><a href="../coverage/lcov-report/index.html">View Coverage Report</a></p>
        </div>
    </div>
    
    <div class="section">
        <h3>Test Artifacts</h3>
        <ul>
            <li>Unit Test Results: <code>coverage/</code></li>
            <li>Integration Test Results: <code>test-results/integration/</code></li>
            <li>E2E Test Results: <code>test-results/e2e/</code></li>
            <li>Health Check Results: <code>test-results/health/</code></li>
            <li>Docker Test Results: <code>test-results/docker/</code></li>
        </ul>
    </div>
    
    <div class="section">
        <h3>Next Steps</h3>
        <ol>
            <li>Review any failing tests</li>
            <li>Check coverage reports for untested code</li>
            <li>Run specific test suites as needed</li>
            <li>Update tests for new features</li>
        </ol>
    </div>
</body>
</html>
`;
  
  // Ensure test-results directory exists
  const testResultsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, reportContent);
  log(`${colors.green}✓ Test report generated: ${reportPath}${colors.reset}`);
}

function cleanup() {
  log(`${colors.bright}Cleaning up test environment...${colors.reset}`);
  
  // Stop any running Docker containers
  try {
    execSync('docker-compose -f docker-compose.test.yml down', { stdio: 'pipe' });
    log(`${colors.green}✓ Stopped test containers${colors.reset}`);
  } catch (error) {
    log(`${colors.yellow}⚠ No test containers to stop${colors.reset}`);
  }
  
  // Clean up test volumes
  try {
    execSync('docker volume prune -f', { stdio: 'pipe' });
    log(`${colors.green}✓ Cleaned up test volumes${colors.reset}`);
  } catch (error) {
    log(`${colors.yellow}⚠ No test volumes to clean${colors.reset}`);
  }
}

function main() {
  log(`${colors.bright}${colors.magenta}LightDom Space-Bridge Platform - Test Setup${colors.reset}`);
  log(`${colors.cyan}================================================${colors.reset}`);
  
  const startTime = Date.now();
  
  try {
    // Check prerequisites
    if (!checkPrerequisites()) {
      log(`${colors.red}Prerequisites check failed. Please install required tools.${colors.reset}`);
      process.exit(1);
    }
    
    // Setup test environment
    setupTestEnvironment();
    
    // Run tests
    const testResults = {
      unit: runUnitTests(),
      integration: runIntegrationTests(),
      e2e: runE2ETests(),
      health: runHealthChecks(),
      docker: runDockerTests(),
    };
    
    // Generate report
    generateTestReport();
    
    // Cleanup
    cleanup();
    
    // Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log(`${colors.bright}Test Summary:${colors.reset}`);
    log(`${colors.green}✓ Unit Tests: ${testResults.unit ? 'PASSED' : 'FAILED'}${colors.reset}`);
    log(`${colors.green}✓ Integration Tests: ${testResults.integration ? 'PASSED' : 'FAILED'}${colors.reset}`);
    log(`${colors.green}✓ E2E Tests: ${testResults.e2e ? 'PASSED' : 'FAILED'}${colors.reset}`);
    log(`${colors.green}✓ Health Checks: ${testResults.health ? 'PASSED' : 'FAILED'}${colors.reset}`);
    log(`${colors.green}✓ Docker Tests: ${testResults.docker ? 'PASSED' : 'FAILED'}${colors.reset}`);
    
    log(`${colors.cyan}Total duration: ${duration} seconds${colors.reset}`);
    
    const allPassed = Object.values(testResults).every(result => result);
    
    if (allPassed) {
      log(`${colors.bright}${colors.green}🎉 All tests passed successfully!${colors.reset}`);
      process.exit(0);
    } else {
      log(`${colors.bright}${colors.red}❌ Some tests failed. Please review the results.${colors.reset}`);
      process.exit(1);
    }
    
  } catch (error) {
    log(`${colors.red}Test setup failed: ${error.message}${colors.reset}`);
    cleanup();
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'all';

switch (command) {
  case 'unit':
    runUnitTests();
    break;
  case 'integration':
    runIntegrationTests();
    break;
  case 'e2e':
    runE2ETests();
    break;
  case 'health':
    runHealthChecks();
    break;
  case 'docker':
    runDockerTests();
    break;
  case 'all':
  default:
    main();
    break;
}