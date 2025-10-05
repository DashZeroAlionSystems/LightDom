#!/usr/bin/env node

/**
 * Enhanced LightDom Cursor Rules Validation Script
 * Tests BOTH code structure AND actual functionality
 */

import fs from 'fs/promises';
import path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

class EnhancedRuleValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0,
      critical: 0
    };
    this.startTime = Date.now();
    this.criticalIssues = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '✅',
      warn: '⚠️',
      error: '❌',
      success: '🎉',
      critical: '🚨'
    }[type];
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  // =====================================================
  // FUNCTIONALITY TESTS (NEW - THE MISSING PIECE)
  // =====================================================

  async checkElectronFunctionality() {
    this.log('Testing Electron functionality...');
    
    try {
      // Check if electron is installed
      const { stdout: electronVersion } = await execAsync('electron --version');
      this.log(`  ✓ Electron installed: ${electronVersion.trim()}`, 'success');
      this.results.passed++;
    } catch (error) {
      this.log('  🚨 CRITICAL: Electron not installed or not in PATH', 'critical');
      this.criticalIssues.push('Electron not working - main app cannot start');
      this.results.critical++;
    }
    this.results.total++;

    // Check if electron can start
    try {
      const electronProcess = spawn('electron', ['--version'], { stdio: 'pipe' });
      await new Promise((resolve, reject) => {
        electronProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Electron exited with code ${code}`));
          }
        });
        electronProcess.on('error', reject);
        setTimeout(() => reject(new Error('Electron startup timeout')), 5000);
      });
      this.log('  ✓ Electron can start successfully', 'success');
      this.results.passed++;
    } catch (error) {
      this.log('  🚨 CRITICAL: Electron cannot start', 'critical');
      this.criticalIssues.push('Electron startup failed');
      this.results.critical++;
    }
    this.results.total++;
  }

  async checkAPIServerFunctionality() {
    this.log('Testing API server functionality...');
    
    // Check which API server is being used
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const scripts = packageJson.scripts || {};
      
      // Check if using simple-api-server (fake) vs api-server-express (real)
      const isUsingFakeAPI = scripts.start?.includes('simple-api-server') || 
                           scripts['start:dev']?.includes('simple-api-server');
      
      if (isUsingFakeAPI) {
        this.log('  🚨 CRITICAL: Using fake API server (simple-api-server.js)', 'critical');
        this.criticalIssues.push('Using mock API server instead of real one');
        this.results.critical++;
      } else {
        this.log('  ✓ Using real API server', 'success');
        this.results.passed++;
      }
      this.results.total++;

      // Test if API server can start
      try {
        const apiProcess = spawn('node', ['simple-api-server.js'], { 
          stdio: 'pipe',
          cwd: process.cwd()
        });
        
        await new Promise((resolve, reject) => {
          let output = '';
          apiProcess.stdout.on('data', (data) => {
            output += data.toString();
            if (output.includes('LightDom API Server running')) {
              resolve();
            }
          });
          apiProcess.on('error', reject);
          setTimeout(() => {
            apiProcess.kill();
            reject(new Error('API server startup timeout'));
          }, 10000);
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
      this.log(`API server check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async checkDatabaseConnectivity() {
    this.log('Testing database connectivity...');
    
    try {
      // Check if PostgreSQL is running
      const { stdout: pgProcesses } = await execAsync('tasklist /FI "IMAGENAME eq postgres.exe" 2>nul || echo "No PostgreSQL"');
      
      if (pgProcesses.includes('postgres.exe')) {
        this.log('  ✓ PostgreSQL is running', 'success');
        this.results.passed++;
      } else {
        this.log('  🚨 CRITICAL: PostgreSQL not running', 'critical');
        this.criticalIssues.push('Database not connected - no persistence');
        this.results.critical++;
      }
      this.results.total++;

      // Check if Redis is running
      const { stdout: redisProcesses } = await execAsync('tasklist /FI "IMAGENAME eq redis-server.exe" 2>nul || echo "No Redis"');
      
      if (redisProcesses.includes('redis-server.exe')) {
        this.log('  ✓ Redis is running', 'success');
        this.results.passed++;
      } else {
        this.log('  ⚠ Redis not running (optional but recommended)', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`Database connectivity check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async checkFrontendFunctionality() {
    this.log('Testing frontend functionality...');
    
    try {
      // Check for multiple Vite instances
      const { stdout: nodeProcesses } = await execAsync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV');
      const viteInstances = (nodeProcesses.match(/vite/g) || []).length;
      
      if (viteInstances > 1) {
        this.log(`  🚨 CRITICAL: Multiple Vite instances running (${viteInstances})`, 'critical');
        this.criticalIssues.push('Multiple frontend servers causing port conflicts');
        this.results.critical++;
      } else if (viteInstances === 1) {
        this.log('  ✓ Single Vite instance running', 'success');
        this.results.passed++;
      } else {
        this.log('  ⚠ No Vite instances running', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

      // Test if frontend can be accessed
      const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009, 3010];
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
      this.log(`Frontend functionality check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async checkBlockchainFunctionality() {
    this.log('Testing blockchain functionality...');
    
    try {
      // Check if blockchain services are actually connected
      const { stdout: blockchainProcesses } = await execAsync('tasklist /FI "IMAGENAME eq geth.exe" 2>nul || echo "No Geth"');
      
      if (blockchainProcesses.includes('geth.exe')) {
        this.log('  ✓ Blockchain node running', 'success');
        this.results.passed++;
      } else {
        this.log('  🚨 CRITICAL: No blockchain node running', 'critical');
        this.criticalIssues.push('Blockchain not connected - all features fake');
        this.results.critical++;
      }
      this.results.total++;

      // Check for hardhat or other blockchain tools
      try {
        await execAsync('npx hardhat --version');
        this.log('  ✓ Hardhat available', 'success');
        this.results.passed++;
      } catch (error) {
        this.log('  ⚠ Hardhat not available', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`Blockchain functionality check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async checkMockDataUsage() {
    this.log('Checking for mock/fake data usage...');
    
    try {
      // Check if API responses are real or mocked
      const apiServerContent = await fs.readFile('simple-api-server.js', 'utf8');
      
      if (apiServerContent.includes('mockData') || apiServerContent.includes('mock')) {
        this.log('  🚨 CRITICAL: API server using mock data', 'critical');
        this.criticalIssues.push('API server returns fake data - no real functionality');
        this.results.critical++;
      } else {
        this.log('  ✓ API server not using mock data', 'success');
        this.results.passed++;
      }
      this.results.total++;

      // Check for hardcoded fake responses
      if (apiServerContent.includes('res.json({') && apiServerContent.includes('success: true')) {
        this.log('  🚨 CRITICAL: API server has hardcoded fake responses', 'critical');
        this.criticalIssues.push('API endpoints return fake responses');
        this.results.critical++;
      } else {
        this.log('  ✓ API server not using hardcoded responses', 'success');
        this.results.passed++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`Mock data check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  // =====================================================
  // EXISTING CODE STRUCTURE TESTS
  // =====================================================

  async checkTypeScriptConfig() {
    this.log('Checking TypeScript configuration...');
    
    try {
      const tsconfigPath = 'tsconfig.json';
      const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf8'));
      
      const checks = [
        { name: 'Strict mode enabled', check: tsconfig.compilerOptions?.strict === true },
        { name: 'No unused locals', check: tsconfig.compilerOptions?.noUnusedLocals === true },
        { name: 'No unused parameters', check: tsconfig.compilerOptions?.noUnusedParameters === true },
        { name: 'No fallthrough cases', check: tsconfig.compilerOptions?.noFallthroughCasesInSwitch === true }
      ];

      for (const check of checks) {
        if (check.check) {
          this.log(`  ✓ ${check.name}`, 'success');
          this.results.passed++;
        } else {
          this.log(`  ✗ ${check.name}`, 'error');
          this.results.failed++;
        }
        this.results.total++;
      }
    } catch (error) {
      this.log(`TypeScript config check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async checkESLintConfig() {
    this.log('Checking ESLint configuration...');
    
    try {
      const eslintFiles = ['.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', '.eslintrc.yaml'];
      let eslintExists = false;
      
      for (const file of eslintFiles) {
        try {
          await fs.access(file);
          eslintExists = true;
          break;
        } catch {
          // File doesn't exist, continue
        }
      }

      if (eslintExists) {
        this.log('  ✓ ESLint configuration found', 'success');
        this.results.passed++;
      } else {
        this.log('  ⚠ ESLint configuration missing', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`ESLint config check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async checkSecurityConfiguration() {
    this.log('Checking security configuration...');
    
    try {
      // Check for .env files in git
      const { stdout: envFiles } = await execAsync('git ls-files | findstr "\\.env" 2>nul || echo "No .env files"');
      
      if (envFiles.includes('.env')) {
        this.log('  🚨 CRITICAL: .env files found in git repository', 'critical');
        this.criticalIssues.push('Secrets exposed in git repository');
        this.results.critical++;
      } else {
        this.log('  ✓ No .env files in git repository', 'success');
        this.results.passed++;
      }
      this.results.total++;

      // Check for hardcoded secrets
      const { stdout: secrets } = await execAsync('findstr /R /S "password\\|secret\\|key\\|token" src\\*.ts src\\*.tsx src\\*.js src\\*.jsx 2>nul | findstr /V "process\\.env" || echo "No hardcoded secrets"');
      
      if (secrets.includes('password') || secrets.includes('secret') || secrets.includes('key')) {
        this.log('  ⚠ Potential hardcoded secrets found', 'warn');
        this.results.warnings++;
      } else {
        this.log('  ✓ No hardcoded secrets found', 'success');
        this.results.passed++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`Security check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  // =====================================================
  // MAIN VALIDATION RUNNER
  // =====================================================

  async runAllChecks() {
    console.log('🚀 Enhanced LightDom Cursor Rules Validation');
    console.log('==========================================');
    console.log('Testing BOTH code structure AND functionality...\n');

    // Functionality tests (NEW - the missing piece)
    await this.checkElectronFunctionality();
    await this.checkAPIServerFunctionality();
    await this.checkDatabaseConnectivity();
    await this.checkFrontendFunctionality();
    await this.checkBlockchainFunctionality();
    await this.checkMockDataUsage();

    // Code structure tests (existing)
    await this.checkTypeScriptConfig();
    await this.checkESLintConfig();
    await this.checkSecurityConfiguration();

    this.generateReport();
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    const totalChecks = this.results.passed + this.results.failed + this.results.warnings + this.results.critical;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 ENHANCED VALIDATION REPORT');
    console.log('='.repeat(60));
    
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📈 Total Checks: ${totalChecks}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
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
    
    console.log('\n' + '='.repeat(60));
  }
}

// Run the enhanced validation
const validator = new EnhancedRuleValidator();
validator.runAllChecks().catch(console.error);
