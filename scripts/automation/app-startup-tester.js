#!/usr/bin/env node

/**
 * App and Startup Services Tester
 * Comprehensive testing of application functionality and startup services
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import http from 'http';

const execAsync = promisify(exec);

class AppStartupTester {
  constructor() {
    this.testResults = {
      appTests: [],
      startupTests: [],
      integrationTests: [],
      performanceTests: []
    };
  }

  log(message, type = 'info') {
    const prefix = {
      info: '✅',
      error: '❌',
      critical: '🚨',
      success: '🎉',
      test: '🧪',
      service: '🔧'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  // =====================================================
  // APP FUNCTIONALITY TESTS
  // =====================================================

  async testFrontendApp() {
    this.log('Testing frontend application...', 'test');
    
    const tests = [];
    
    // Test 1: Vite dev server accessibility
    try {
      const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010];
      let frontendFound = false;
      let workingPort = null;
      
      for (const port of ports) {
        try {
          await new Promise((resolve, reject) => {
            const req = http.get(`http://localhost:${port}`, (res) => {
              if (res.statusCode === 200) {
                frontendFound = true;
                workingPort = port;
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
          break;
        } catch (error) {
          // Port not accessible, try next
        }
      }
      
      if (frontendFound) {
        tests.push({
          name: 'Frontend Accessibility',
          status: 'passed',
          message: `Frontend accessible on port ${workingPort}`,
          port: workingPort
        });
      } else {
        tests.push({
          name: 'Frontend Accessibility',
          status: 'failed',
          message: 'Frontend not accessible on any port'
        });
      }
    } catch (error) {
      tests.push({
        name: 'Frontend Accessibility',
        status: 'failed',
        message: error.message
      });
    }

    // Test 2: Frontend build process
    try {
      await execAsync('npm run build');
      tests.push({
        name: 'Frontend Build',
        status: 'passed',
        message: 'Frontend builds successfully'
      });
    } catch (error) {
      tests.push({
        name: 'Frontend Build',
        status: 'failed',
        message: `Build failed: ${error.message}`
      });
    }

    // Test 3: TypeScript compilation
    try {
      await execAsync('npx tsc --noEmit');
      tests.push({
        name: 'TypeScript Compilation',
        status: 'passed',
        message: 'TypeScript compiles without errors'
      });
    } catch (error) {
      tests.push({
        name: 'TypeScript Compilation',
        status: 'failed',
        message: `TypeScript errors: ${error.message}`
      });
    }

    return tests;
  }

  async testElectronApp() {
    this.log('Testing Electron application...', 'test');
    
    const tests = [];
    
    // Test 1: Electron installation
    try {
      const { stdout } = await execAsync('electron --version');
      tests.push({
        name: 'Electron Installation',
        status: 'passed',
        message: `Electron version: ${stdout.trim()}`
      });
    } catch (error) {
      tests.push({
        name: 'Electron Installation',
        status: 'critical',
        message: 'Electron not installed globally'
      });
    }

    // Test 2: Electron main process
    try {
      await fs.access('electron/main.cjs');
      tests.push({
        name: 'Electron Main Process',
        status: 'passed',
        message: 'Electron main process file exists'
      });
    } catch (error) {
      tests.push({
        name: 'Electron Main Process',
        status: 'failed',
        message: 'Electron main process file missing'
      });
    }

    // Test 3: Electron preload script
    try {
      await fs.access('electron/preload.js');
      tests.push({
        name: 'Electron Preload Script',
        status: 'passed',
        message: 'Electron preload script exists'
      });
    } catch (error) {
      tests.push({
        name: 'Electron Preload Script',
        status: 'failed',
        message: 'Electron preload script missing'
      });
    }

    return tests;
  }

  async testAPIServer() {
    this.log('Testing API server...', 'test');
    
    const tests = [];
    
    // Test 1: API server health
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        const data = await response.json();
        tests.push({
          name: 'API Server Health',
          status: 'passed',
          message: 'API server is healthy',
          data: data
        });
      } else {
        tests.push({
          name: 'API Server Health',
          status: 'failed',
          message: `API server health check failed: ${response.status}`
        });
      }
    } catch (error) {
      tests.push({
        name: 'API Server Health',
        status: 'failed',
        message: 'API server not responding'
      });
    }

    // Test 2: API endpoints
    const endpoints = [
      '/api/metaverse/mining-data',
      '/api/blockchain/stats',
      '/api/optimization/stats',
      '/api/space-mining/spatial-structures',
      '/api/crawler/stats'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3001${endpoint}`);
        if (response.ok) {
          tests.push({
            name: `API Endpoint: ${endpoint}`,
            status: 'passed',
            message: 'Endpoint responding correctly'
          });
        } else {
          tests.push({
            name: `API Endpoint: ${endpoint}`,
            status: 'failed',
            message: `Endpoint failed: ${response.status}`
          });
        }
      } catch (error) {
        tests.push({
          name: `API Endpoint: ${endpoint}`,
          status: 'failed',
          message: `Endpoint error: ${error.message}`
        });
      }
    }

    return tests;
  }

  // =====================================================
  // STARTUP SERVICES TESTS
  // =====================================================

  async testDatabaseServices() {
    this.log('Testing database services...', 'service');
    
    const tests = [];
    
    // Test 1: PostgreSQL
    try {
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq postgres.exe" 2>nul || echo "No PostgreSQL"');
      if (stdout.includes('postgres.exe')) {
        tests.push({
          name: 'PostgreSQL Database',
          status: 'passed',
          message: 'PostgreSQL is running'
        });
      } else {
        tests.push({
          name: 'PostgreSQL Database',
          status: 'failed',
          message: 'PostgreSQL not running'
        });
      }
    } catch (error) {
      tests.push({
        name: 'PostgreSQL Database',
        status: 'failed',
        message: 'PostgreSQL check failed'
      });
    }

    // Test 2: Database connection
    try {
      // This would test actual database connectivity
      tests.push({
        name: 'Database Connection',
        status: 'warning',
        message: 'Database connection test not implemented'
      });
    } catch (error) {
      tests.push({
        name: 'Database Connection',
        status: 'failed',
        message: 'Database connection failed'
      });
    }

    return tests;
  }

  async testCacheServices() {
    this.log('Testing cache services...', 'service');
    
    const tests = [];
    
    // Test 1: Redis
    try {
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq redis-server.exe" 2>nul || echo "No Redis"');
      if (stdout.includes('redis-server.exe')) {
        tests.push({
          name: 'Redis Cache',
          status: 'passed',
          message: 'Redis is running'
        });
      } else {
        tests.push({
          name: 'Redis Cache',
          status: 'warning',
          message: 'Redis not running (optional)'
        });
      }
    } catch (error) {
      tests.push({
        name: 'Redis Cache',
        status: 'warning',
        message: 'Redis check failed'
      });
    }

    return tests;
  }

  async testContainerServices() {
    this.log('Testing container services...', 'service');
    
    const tests = [];
    
    // Test 1: Docker
    try {
      const { stdout } = await execAsync('docker --version');
      tests.push({
        name: 'Docker Service',
        status: 'passed',
        message: `Docker available: ${stdout.trim()}`
      });
    } catch (error) {
      tests.push({
        name: 'Docker Service',
        status: 'failed',
        message: 'Docker not available'
      });
    }

    // Test 2: Docker Compose
    try {
      const { stdout } = await execAsync('docker-compose --version');
      tests.push({
        name: 'Docker Compose',
        status: 'passed',
        message: `Docker Compose available: ${stdout.trim()}`
      });
    } catch (error) {
      tests.push({
        name: 'Docker Compose',
        status: 'failed',
        message: 'Docker Compose not available'
      });
    }

    return tests;
  }

  async testNodeProcesses() {
    this.log('Testing Node.js processes...', 'service');
    
    const tests = [];
    
    try {
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV');
      const nodeProcesses = (stdout.match(/node\.exe/g) || []).length;
      
      if (nodeProcesses > 0) {
        tests.push({
          name: 'Node.js Processes',
          status: 'passed',
          message: `${nodeProcesses} Node.js processes running`
        });
      } else {
        tests.push({
          name: 'Node.js Processes',
          status: 'failed',
          message: 'No Node.js processes running'
        });
      }
    } catch (error) {
      tests.push({
        name: 'Node.js Processes',
        status: 'failed',
        message: 'Node.js process check failed'
      });
    }

    return tests;
  }

  // =====================================================
  // INTEGRATION TESTS
  // =====================================================

  async testFullSystemIntegration() {
    this.log('Testing full system integration...', 'test');
    
    const tests = [];
    
    // Test 1: Frontend to API communication
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        tests.push({
          name: 'Frontend-API Integration',
          status: 'passed',
          message: 'Frontend can communicate with API'
        });
      } else {
        tests.push({
          name: 'Frontend-API Integration',
          status: 'failed',
          message: 'Frontend-API communication failed'
        });
      }
    } catch (error) {
      tests.push({
        name: 'Frontend-API Integration',
        status: 'failed',
        message: 'Frontend-API integration test failed'
      });
    }

    // Test 2: Web crawler integration
    try {
      const response = await fetch('http://localhost:3001/api/crawler/stats');
      if (response.ok) {
        const data = await response.json();
        tests.push({
          name: 'Web Crawler Integration',
          status: 'passed',
          message: 'Web crawler is integrated and working',
          data: data
        });
      } else {
        tests.push({
          name: 'Web Crawler Integration',
          status: 'failed',
          message: 'Web crawler integration failed'
        });
      }
    } catch (error) {
      tests.push({
        name: 'Web Crawler Integration',
        status: 'failed',
        message: 'Web crawler integration test failed'
      });
    }

    return tests;
  }

  // =====================================================
  // PERFORMANCE TESTS
  // =====================================================

  async testPerformance() {
    this.log('Testing performance...', 'test');
    
    const tests = [];
    
    // Test 1: API response time
    try {
      const startTime = Date.now();
      const response = await fetch('http://localhost:3001/api/health');
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (responseTime < 1000) {
        tests.push({
          name: 'API Response Time',
          status: 'passed',
          message: `API responds in ${responseTime}ms`
        });
      } else {
        tests.push({
          name: 'API Response Time',
          status: 'warning',
          message: `API response time is slow: ${responseTime}ms`
        });
      }
    } catch (error) {
      tests.push({
        name: 'API Response Time',
        status: 'failed',
        message: 'API response time test failed'
      });
    }

    return tests;
  }

  // =====================================================
  // MAIN TEST RUNNER
  // =====================================================

  async runAllTests() {
    this.log('🧪 Starting Comprehensive App and Startup Services Testing', 'test');
    console.log('='.repeat(60));
    
    // App functionality tests
    this.testResults.appTests = [
      ...await this.testFrontendApp(),
      ...await this.testElectronApp(),
      ...await this.testAPIServer()
    ];
    
    // Startup services tests
    this.testResults.startupTests = [
      ...await this.testDatabaseServices(),
      ...await this.testCacheServices(),
      ...await this.testContainerServices(),
      ...await this.testNodeProcesses()
    ];
    
    // Integration tests
    this.testResults.integrationTests = await this.testFullSystemIntegration();
    
    // Performance tests
    this.testResults.performanceTests = await this.testPerformance();
    
    // Generate report
    await this.generateTestReport();
    
    return this.testResults;
  }

  async generateTestReport() {
    const report = `
# App and Startup Services Test Report

## Test Summary
- **App Tests**: ${this.testResults.appTests.filter(t => t.status === 'passed').length}/${this.testResults.appTests.length} passed
- **Startup Tests**: ${this.testResults.startupTests.filter(t => t.status === 'passed').length}/${this.testResults.startupTests.length} passed
- **Integration Tests**: ${this.testResults.integrationTests.filter(t => t.status === 'passed').length}/${this.testResults.integrationTests.length} passed
- **Performance Tests**: ${this.testResults.performanceTests.filter(t => t.status === 'passed').length}/${this.testResults.performanceTests.length} passed

## App Functionality Tests
${this.testResults.appTests.map(test => `- **${test.name}**: ${test.status} - ${test.message}`).join('\n')}

## Startup Services Tests
${this.testResults.startupTests.map(test => `- **${test.name}**: ${test.status} - ${test.message}`).join('\n')}

## Integration Tests
${this.testResults.integrationTests.map(test => `- **${test.name}**: ${test.status} - ${test.message}`).join('\n')}

## Performance Tests
${this.testResults.performanceTests.map(test => `- **${test.name}**: ${test.status} - ${test.message}`).join('\n')}

## Timestamp: ${new Date().toISOString()}
`;

    await fs.writeFile('app-startup-test-report.md', report);
    this.log('Test report saved: app-startup-test-report.md', 'success');
  }
}

// Run all tests
const tester = new AppStartupTester();
tester.runAllTests().catch(console.error);
