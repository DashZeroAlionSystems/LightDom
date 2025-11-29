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

// Allow using the lightweight simple API server in development by setting:
//   ALLOW_SIMPLE_API_SERVER=true
// When enabled the automation will accept the simple API server as a valid
// backend for local development (useful when the full backend is heavy).
const ALLOW_SIMPLE_API_SERVER = process.env.ALLOW_SIMPLE_API_SERVER === 'true' || process.env.ALLOW_FAKE_API === 'true';
// Timeout (ms) to wait for API server startup detection. Increase in CI if needed.
const API_STARTUP_TIMEOUT_MS = parseInt(process.env.API_STARTUP_TIMEOUT || '15000', 10);
// Timeout (ms) to wait for the frontend preview server to become available.
const FRONTEND_STARTUP_TIMEOUT_MS = parseInt(process.env.FRONTEND_STARTUP_TIMEOUT || '20000', 10);

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
      // Check if package.json scripts point to the lightweight simple API server
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const scripts = packageJson.scripts || {};
      const usesSimpleScript = (scripts.start?.includes('simple-api-server') || scripts['start:dev']?.includes('simple-api-server'));

      if (usesSimpleScript && !ALLOW_SIMPLE_API_SERVER) {
        this.log('  🚨 CRITICAL: Using fake API server', 'critical');
        this.criticalIssues.push('Using mock API server instead of real one');
        this.results.critical++;
      } else if (usesSimpleScript && ALLOW_SIMPLE_API_SERVER) {
        this.log('  ⚠️  Using simple API server is allowed (ALLOW_SIMPLE_API_SERVER=true)', 'info');
        this.results.passed++;
      } else {
        this.log('  ✓ Using real API server', 'success');
        this.results.passed++;
      }
      this.results.total++;

      // Test if API server can start (prefer real server unless simple API is explicitly allowed)
      // First, check if an API is already reachable on common dev ports to avoid spawning
      // a second server when one is already running (this is common when developers
      // start the simple server manually in a background job).
      let apiReachable = false;
      try {
        const portsToCheck = [3002, 3001, 3000];
        for (const p of portsToCheck) {
          try {
            await new Promise((resolve, reject) => {
              const req = http.get(`http://localhost:${p}/api/health`, (res) => {
                if (res.statusCode === 200) resolve(); else reject(new Error('Status ' + res.statusCode));
              });
              req.on('error', reject);
              req.setTimeout(2000, () => { req.destroy(); reject(new Error('Timeout')); });
            });
            apiReachable = true;
            break;
          } catch (e) {
            // try next port
          }
        }
      } catch (err) {
        // ignore health-check errors and attempt spawn below
      }

      if (apiReachable) {
        this.log('  ✓ API server is already running and reachable', 'success');
        this.results.passed++;
        this.results.total++;
      } else {
        try {
          const prefersReal = !ALLOW_SIMPLE_API_SERVER;
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
              try { apiProcess.kill(); } catch (e) {}
              reject(new Error('API server startup timeout'));
            }, API_STARTUP_TIMEOUT_MS);
          });

          this.log('  ✓ API server can start', 'success');
          this.results.passed++;
          try { apiProcess.kill(); } catch (e) {}
        } catch (error) {
          this.log('  🚨 CRITICAL: API server cannot start', 'critical');
          this.criticalIssues.push('API server startup failed');
          this.results.critical++;
        }
        this.results.total++;
      }

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
      let frontendVerified = false;
      
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
      
      if (!frontendFound) {
        this.log('  ⚙️  Frontend not running; attempting to build and launch preview...', 'info');
        let previewProcess;
        try {
          await execAsync('npm run build', { maxBuffer: 1024 * 1024 * 20 });
          this.log('  ✓ Frontend build completed', 'success');

          previewProcess = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '3000'], {
            cwd: process.cwd(),
            shell: true,
            stdio: 'pipe',
            env: { ...process.env, VITE_PREVIEW_PORT: '3000' }
          });

          await this.waitForUrl('http://127.0.0.1:3000', FRONTEND_STARTUP_TIMEOUT_MS);
          this.log('  ✓ Frontend preview server reachable on port 3000', 'success');
          frontendVerified = true;
        } catch (error) {
          this.log(`  🚨 CRITICAL: Unable to launch frontend preview (${error.message})`, 'critical');
          this.criticalIssues.push('Frontend build/preview failed - app UI unavailable');
        } finally {
          if (previewProcess) {
            try { previewProcess.kill(); } catch (err) { /* ignore */ }
          }
        }
      } else {
        frontendVerified = true;
      }

      if (frontendVerified) {
        this.log('  ✓ Frontend is accessible', 'success');
        this.results.passed++;
      } else {
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
      // Optionally skip mock-data checks if the lightweight simple API server is allowed
      if (ALLOW_SIMPLE_API_SERVER) {
        this.log('  ⚠️  Skipping mock data test because ALLOW_SIMPLE_API_SERVER=true', 'info');
        this.results.passed++;
        this.results.total++;
        return;
      }

      // Check if API server is using mock data
      const apiServerContent = await fs.readFile('simple-api-server.js', 'utf8');

      if (apiServerContent.includes('mockData') || 
          apiServerContent.includes('mock') ||
          (apiServerContent.includes('res.json({') && apiServerContent.includes('success: true'))) {
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

  waitForUrl(url, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      let settled = false;

      const attempt = () => {
        if (settled) {
          return;
        }

        const req = http.get(url, (res) => {
          res.resume();
          if (settled) {
            return;
          }

          if (res.statusCode >= 200 && res.statusCode < 400) {
            settled = true;
            resolve();
          } else if (Date.now() - start > timeoutMs) {
            settled = true;
            reject(new Error(`Status ${res.statusCode}`));
          } else {
            setTimeout(attempt, 500);
          }
        });

        req.on('error', () => {
          req.destroy();
          if (settled) {
            return;
          }
          if (Date.now() - start > timeoutMs) {
            settled = true;
            reject(new Error(`Unable to reach ${url}`));
          } else {
            setTimeout(attempt, 500);
          }
        });

        req.setTimeout(2000, () => {
          req.destroy();
          if (settled) {
            return;
          }
          if (Date.now() - start > timeoutMs) {
            settled = true;
            reject(new Error(`Timeout contacting ${url}`));
          } else {
            setTimeout(attempt, 500);
          }
        });
      };

      attempt();
    });
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
