#!/usr/bin/env node

/**
 * Chrome React Dev Container - Complete Troubleshooting Guide
 * Tests all components and provides working solutions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ChromeReactTroubleshooter {
  constructor() {
    this.issues = [];
    this.solutions = [];
  }

  async runFullDiagnosis() {
    console.log('🔍 CHROME REACT DEV CONTAINER - FULL DIAGNOSIS');
    console.log('==============================================');
    console.log('');

    const tests = [
      { name: 'Node.js Installation', test: () => this.testNodeJs() },
      { name: 'Project Files', test: () => this.testProjectFiles() },
      { name: 'Dependencies', test: () => this.testDependencies() },
      { name: 'Puppeteer Setup', test: () => this.testPuppeteer() },
      { name: 'Port Availability', test: () => this.testPorts() },
      { name: 'Component Loading', test: () => this.testComponentLoading() },
      { name: 'Workflow Script', test: () => this.testWorkflowScript() }
    ];

    console.log('Running comprehensive diagnostic tests...\n');

    for (const test of tests) {
      console.log(`🔍 Testing: ${test.name}`);
      try {
        const result = await test.test();
        if (result.success) {
          console.log(`   ✅ PASS: ${result.message}`);
        } else {
          console.log(`   ❌ FAIL: ${result.message}`);
          this.issues.push({
            test: test.name,
            error: result.message,
            solutions: result.solutions || []
          });
        }
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
        this.issues.push({
          test: test.name,
          error: error.message,
          solutions: []
        });
      }
      console.log('');
    }

    this.provideSolutions();
  }

  async testNodeJs() {
    try {
      const version = await this.runCommand('node --version');
      return {
        success: true,
        message: `Node.js ${version.trim()} is installed`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Node.js is not installed or not in PATH',
        solutions: [
          'Install Node.js from https://nodejs.org/',
          'Add Node.js to your system PATH',
          'Use full path: "C:\\Program Files\\nodejs\\node.exe"'
        ]
      };
    }
  }

  async testProjectFiles() {
    const requiredFiles = [
      'chrome-react-dev-container.js',
      'admin-dashboard.html',
      'enterprise-chrome-react-workflow.js'
    ];

    const missingFiles = [];
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(__dirname, file))) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length === 0) {
      return {
        success: true,
        message: 'All required project files are present'
      };
    } else {
      return {
        success: false,
        message: `Missing files: ${missingFiles.join(', ')}`,
        solutions: [
          'Ensure you are running from the project root directory',
          'Check if files were created during setup',
          'Re-run the enterprise container creation scripts'
        ]
      };
    }
  }

  async testDependencies() {
    if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
      return {
        success: false,
        message: 'node_modules directory not found',
        solutions: [
          'Run: npm install',
          'Check your internet connection',
          'Verify npm permissions'
        ]
      };
    }

    try {
      await this.runCommand('npm list --depth=0');
      return {
        success: true,
        message: 'Dependencies are installed'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Dependencies check failed',
        solutions: [
          'Run: npm install',
          'Delete node_modules and package-lock.json, then npm install'
        ]
      };
    }
  }

  async testPuppeteer() {
    try {
      await this.runCommand('node -e "require(\'puppeteer\')"');
      return {
        success: true,
        message: 'Puppeteer is properly installed'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Puppeteer is not available',
        solutions: [
          'Run: npm install puppeteer',
          'If that fails: npm install puppeteer --save-dev',
          'For global install: npm install -g puppeteer'
        ]
      };
    }
  }

  async testPorts() {
    const ports = [3001, 3002, 3003];
    const busyPorts = [];

    for (const port of ports) {
      if (await this.isPortBusy(port)) {
        busyPorts.push(port);
      }
    }

    if (busyPorts.length === 0) {
      return {
        success: true,
        message: 'All required ports are available'
      };
    } else {
      return {
        success: false,
        message: `Ports in use: ${busyPorts.join(', ')}`,
        solutions: [
          'Close applications using these ports',
          'Use different ports in the configuration',
          'Kill processes: taskkill /f /im node.exe (Windows)'
        ]
      };
    }
  }

  async testComponentLoading() {
    try {
      // Test loading the main container module
      await this.runCommand('node -e "require(\'./chrome-react-dev-container.js\'); console.log(\'Container loads\')"');
      return {
        success: true,
        message: 'Container components load successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Component loading failed',
        solutions: [
          'Check for syntax errors in the JavaScript files',
          'Verify all imports are correct',
          'Run: node -c chrome-react-dev-container.js (syntax check)'
        ]
      };
    }
  }

  async testWorkflowScript() {
    try {
      // Test if the workflow script can start (but don't let it run fully)
      const child = spawn('node', ['enterprise-chrome-react-workflow.js'], {
        cwd: __dirname,
        stdio: 'pipe',
        timeout: 5000
      });

      return new Promise((resolve) => {
        let output = '';
        let hasError = false;

        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.stderr.on('data', (data) => {
          hasError = true;
          output += data.toString();
        });

        child.on('close', (code) => {
          if (code === 0 && !hasError) {
            resolve({
              success: true,
              message: 'Workflow script starts successfully'
            });
          } else {
            resolve({
              success: false,
              message: `Workflow script failed: ${output.substring(0, 200)}...`,
              solutions: [
                'Check the workflow script for errors',
                'Run diagnostic: node cross-platform-chrome-react-demo.js',
                'Use manual startup: start-manual.bat'
              ]
            });
          }
        });

        // Kill after 3 seconds to prevent full startup
        setTimeout(() => {
          child.kill();
          if (!hasError) {
            resolve({
              success: true,
              message: 'Workflow script starts successfully (killed after 3s)'
            });
          }
        }, 3000);
      });

    } catch (error) {
      return {
        success: false,
        message: `Workflow test failed: ${error.message}`,
        solutions: [
          'Check file permissions',
          'Verify script syntax',
          'Use manual startup method'
        ]
      };
    }
  }

  async runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, {
        cwd: __dirname,
        stdio: 'pipe',
        ...options
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(errorOutput || `Command failed with code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async isPortBusy(port) {
    return new Promise((resolve) => {
      const net = require('net');
      const server = net.createServer();

      server.listen(port, () => {
        server.close();
        resolve(false); // Port is free
      });

      server.on('error', () => {
        resolve(true); // Port is busy
      });

      // Timeout after 1 second
      setTimeout(() => {
        server.close();
        resolve(false);
      }, 1000);
    });
  }

  provideSolutions() {
    if (this.issues.length === 0) {
      console.log('🎊 ALL TESTS PASSED!');
      console.log('===================');
      console.log('');
      console.log('✅ Your Chrome React Dev Container is ready to run!');
      console.log('');
      console.log('🚀 START NOW:');
      console.log('   node enterprise-chrome-react-workflow.js');
      console.log('');
      console.log('🌐 Access at:');
      console.log('   🔴 http://localhost:3001 (React Editor)');
      console.log('   🔵 http://localhost:3003 (Admin Dashboard)');
      console.log('');
      return;
    }

    console.log('⚠️ ISSUES FOUND');
    console.log('==============');
    console.log('');

    this.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.test}`);
      console.log(`   ❌ ${issue.error}`);
      if (issue.solutions && issue.solutions.length > 0) {
        console.log('   🔧 Solutions:');
        issue.solutions.forEach(solution => {
          console.log(`      • ${solution}`);
        });
      }
      console.log('');
    });

    this.provideWorkingAlternatives();
  }

  provideWorkingAlternatives() {
    console.log('🔧 WORKING ALTERNATIVES');
    console.log('=======================');
    console.log('');

    console.log('METHOD 1: Manual Component Startup');
    console.log('----------------------------------');
    console.log('start-manual.bat');
    console.log('   • Starts components individually');
    console.log('   • Easier to debug');
    console.log('   • Opens browser windows automatically');
    console.log('');

    console.log('METHOD 2: Simple Batch Script');
    console.log('----------------------------');
    console.log('start-chrome-react-simple.bat');
    console.log('   • Detailed error reporting');
    console.log('   • Step-by-step diagnostics');
    console.log('   • Better troubleshooting output');
    console.log('');

    console.log('METHOD 3: PowerShell Script');
    console.log('---------------------------');
    console.log('.\\Start-ChromeReactWorkflow.ps1');
    console.log('   • Advanced PowerShell startup');
    console.log('   • Better process management');
    console.log('   • Integrated error handling');
    console.log('');

    console.log('METHOD 4: Direct Node Commands');
    console.log('------------------------------');
    console.log('node chrome-react-dev-container.js    # Start container');
    console.log('start admin-dashboard.html           # Open dashboard');
    console.log('   • Manual control over each component');
    console.log('   • Best for debugging');
    console.log('');

    console.log('🔍 DIAGNOSTIC TOOLS');
    console.log('===================');
    console.log('');
    console.log('node cross-platform-chrome-react-demo.js');
    console.log('   • Comprehensive system diagnostics');
    console.log('   • Identifies specific issues');
    console.log('   • Provides targeted solutions');
    console.log('');

    console.log('📞 SUPPORT');
    console.log('==========');
    console.log('');
    console.log('If all methods fail:');
    console.log('1. Run: node cross-platform-chrome-react-demo.js');
    console.log('2. Share the diagnostic output');
    console.log('3. Check the troubleshooting section');
    console.log('4. Verify Node.js installation');
    console.log('');

    console.log('🛠️ COMMON FIXES');
    console.log('================');
    console.log('');
    console.log('• Reinstall dependencies: rm -rf node_modules && npm install');
    console.log('• Clear npm cache: npm cache clean --force');
    console.log('• Update npm: npm install -g npm@latest');
    console.log('• Check permissions: Run as administrator (Windows)');
    console.log('• Verify ports: Close other Node.js processes');
    console.log('');

    console.log('💡 REMEMBER');
    console.log('===========');
    console.log('');
    console.log('The Chrome React Dev Container includes:');
    console.log('• Live React code execution in browser');
    console.log('• Self-healing error recovery');
    console.log('• Real-time performance monitoring');
    console.log('• Enterprise-grade admin dashboard');
    console.log('• WebSocket live synchronization');
    console.log('• Cross-platform compatibility');
    console.log('');

    console.log('🎯 Once working, you get the ultimate live coding experience!');
    console.log('');
  }
}

// Run the troubleshooter
const troubleshooter = new ChromeReactTroubleshooter();
troubleshooter.runFullDiagnosis().catch(error => {
  console.error('❌ Diagnostic failed:', error.message);
  process.exit(1);
});
