#!/usr/bin/env node

/**
 * LightDom Functionality Test
 * Tests actual functionality, not just code structure
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import http from 'http';
import fs from 'fs/promises';

const execAsync = promisify(exec);

class FunctionalityTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      critical: 0,
      total: 0
    };
    this.criticalIssues = [];
  }

  log(message, type = 'info') {
    const prefix = {
      info: '✅',
      error: '❌',
      critical: '🚨',
      success: '🎉'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  async testElectron() {
    this.log('Testing Electron functionality...');
    
    try {
      // Try to run electron --version
      let stdout;
      try {
        ({ stdout } = await execAsync('npx electron --version'));
      } catch {
        ({ stdout } = await execAsync('electron --version'));
      }
      this.log(`  ✓ Electron installed: ${stdout.trim()}`, 'success');
      this.results.passed++;
    } catch (error) {
      this.log('  🚨 CRITICAL: Electron not working', 'critical');
      this.criticalIssues.push('Electron not installed or not in PATH');
      this.results.critical++;
    }
    this.results.total++;
  }

  async testAPIServer() {
    this.log('Testing API server...');
    
    try {
      // Check if simple-api-server.js exists and is being used
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const scripts = packageJson.scripts || {};
      
      if (scripts.start?.includes('simple-api-server') || 
          scripts['start:dev']?.includes('simple-api-server')) {
        this.log('  🚨 CRITICAL: Using fake API server', 'critical');
        this.criticalIssues.push('Using mock API server instead of real one');
        this.results.critical++;
      } else {
        this.log('  ✓ Using real API server', 'success');
        this.results.passed++;
      }
      this.results.total++;

      // Test if API server can start (prefer real server)
      try {
        const prefersReal = true;
        const target = prefersReal && await fs.stat('api-server-express.js').then(() => true).catch(() => false)
          ? 'api-server-express.js'
          : 'simple-api-server.js';
        const apiProcess = spawn('node', [target], { 
          stdio: 'pipe',
          cwd: process.cwd()
        });
        
        await new Promise((resolve, reject) => {
          let output = '';
          apiProcess.stdout.on('data', (data) => {
            output += data.toString();
            if (output.includes('LightDom API Server running') || output.includes('DOM Space Harvester API running')) {
              resolve();
            }
          });
          apiProcess.on('error', reject);
          setTimeout(() => {
            apiProcess.kill();
            reject(new Error('API server startup timeout'));
          }, 5000);
        });
        
        this.log('  ✓ API server can start', 'success');
        this.results.passed++;
        apiProcess.kill();
      } catch (error) {
        this.log('  🚨 CRITICAL: API server cannot start', 'critical');
        this.criticalIssues.push('API server startup failed');
        this.results.critical++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`API server test failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async testFrontend() {
    this.log('Testing frontend...');
    
    try {
      // Test if frontend is accessible
      const ports = [Number(process.env.VITE_PORT || 3000), 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010];
      let frontendFound = false;
      
      for (const port of ports) {
        try {
          await new Promise((resolve, reject) => {
            const req = http.get(`http://localhost:${port}`, (res) => {
              if (res.statusCode === 200) {
                frontendFound = true;
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
        this.log('  ✓ Frontend is accessible', 'success');
        this.results.passed++;
      } else {
        this.log('  🚨 CRITICAL: Frontend not accessible', 'critical');
        this.criticalIssues.push('Frontend not accessible - app unusable');
        this.results.critical++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`Frontend test failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async testMockData() {
    this.log('Testing for mock data usage...');
    
    try {
      // Check if API server is using mock data
      const apiServerContent = await fs.readFile('simple-api-server.js', 'utf8');
      
      if (apiServerContent.includes('mockData') || 
          apiServerContent.includes('mock') ||
          apiServerContent.includes('res.json({') && apiServerContent.includes('success: true')) {
        this.log('  🚨 CRITICAL: API server using mock/fake data', 'critical');
        this.criticalIssues.push('API server returns fake data - no real functionality');
        this.results.critical++;
      } else {
        this.log('  ✓ API server not using mock data', 'success');
        this.results.passed++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`Mock data test failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async runAllTests() {
    console.log('🚀 LightDom Functionality Test');
    console.log('==============================');
    console.log('Testing actual functionality, not just code structure...\n');

    await this.testElectron();
    await this.testAPIServer();
    await this.testFrontend();
    await this.testMockData();

    this.generateReport();
  }

  generateReport() {
    const totalChecks = this.results.passed + this.results.failed + this.results.critical;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 FUNCTIONALITY TEST REPORT');
    console.log('='.repeat(50));
    
    console.log(`📈 Total Checks: ${totalChecks}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`🚨 CRITICAL: ${this.results.critical}`);
    
    const successRate = ((this.results.passed / totalChecks) * 100).toFixed(1);
    console.log(`📊 Success Rate: ${successRate}%`);
    
    if (this.criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES FOUND:');
      this.criticalIssues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    if (this.results.critical > 0) {
      console.log('\n❌ PROJECT STATUS: NOT WORKING - CRITICAL ISSUES');
      console.log('   The application has critical functionality issues.');
    } else if (this.results.failed > 0) {
      console.log('\n⚠️  PROJECT STATUS: PARTIALLY WORKING - ISSUES FOUND');
      console.log('   The application has some issues that need attention.');
    } else {
      console.log('\n✅ PROJECT STATUS: WORKING - NO CRITICAL ISSUES');
      console.log('   The application appears to be functioning correctly.');
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

// Run the functionality test
const tester = new FunctionalityTester();
tester.runAllTests().catch(console.error);
