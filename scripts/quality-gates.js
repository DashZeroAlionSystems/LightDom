#!/usr/bin/env node

/**
 * Quality Gates Script
 * Runs all quality checks required before deployment
 * Adheres to enterprise coding rules
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class QualityGates {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, options.args || [], {
        stdio: 'pipe',
        shell: true,
        ...options
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          code,
          stdout,
          stderr
        });
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async checkCodeFormatting() {
    this.log('Running code formatting check...');
    try {
      const result = await this.runCommand('npm run format:check');
      if (result.code === 0) {
        this.log('Code formatting check passed', 'success');
        this.results.passed++;
      } else {
        this.log('Code formatting check failed', 'error');
        this.results.failed++;
      }
    } catch (error) {
      this.log(`Code formatting check error: ${error.message}`, 'error');
      this.results.failed++;
    }
    this.results.total++;
  }

  async runLinting() {
    this.log('Running ESLint...');
    try {
      const result = await this.runCommand('npm run lint');
      if (result.code === 0) {
        this.log('Linting passed', 'success');
        this.results.passed++;
      } else {
        this.log('Linting failed', 'error');
        this.results.failed++;
      }
    } catch (error) {
      this.log(`Linting error: ${error.message}`, 'error');
      this.results.failed++;
    }
    this.results.total++;
  }

  async runTypeChecking() {
    this.log('Running TypeScript type checking...');
    try {
      const result = await this.runCommand('npm run type-check');
      if (result.code === 0) {
        this.log('Type checking passed', 'success');
        this.results.passed++;
      } else {
        this.log('Type checking failed', 'error');
        this.results.failed++;
      }
    } catch (error) {
      this.log(`Type checking error: ${error.message}`, 'error');
      this.results.failed++;
    }
    this.results.total++;
  }

  async runUnitTests() {
    this.log('Running unit tests...');
    try {
      const result = await this.runCommand('npm run test:unit:coverage');
      if (result.code === 0) {
        this.log('Unit tests passed', 'success');
        this.results.passed++;
      } else {
        this.log('Unit tests failed', 'error');
        this.results.failed++;
      }
    } catch (error) {
      this.log(`Unit tests error: ${error.message}`, 'error');
      this.results.failed++;
    }
    this.results.total++;
  }

  async checkTestCoverage() {
    this.log('Checking test coverage...');
    try {
      const result = await this.runCommand('npm run test:coverage:check');
      if (result.code === 0) {
        this.log('Test coverage check passed', 'success');
        this.results.passed++;
      } else {
        this.log('Test coverage check failed', 'error');
        this.results.failed++;
      }
    } catch (error) {
      this.log(`Test coverage check error: ${error.message}`, 'error');
      this.results.failed++;
    }
    this.results.total++;
  }

  async runSecurityScan() {
    this.log('Running security scan...');
    try {
      const result = await this.runCommand('npm run security:scan');
      if (result.code === 0) {
        this.log('Security scan passed', 'success');
        this.results.passed++;
      } else {
        this.log('Security scan failed', 'error');
        this.results.failed++;
      }
    } catch (error) {
      this.log(`Security scan error: ${error.message}`, 'error');
      this.results.failed++;
    }
    this.results.total++;
  }

  async runPerformanceTests() {
    this.log('Running performance tests...');
    try {
      const result = await this.runCommand('npm run test:performance');
      if (result.code === 0) {
        this.log('Performance tests passed', 'success');
        this.results.passed++;
      } else {
        this.log('Performance tests failed', 'error');
        this.results.failed++;
      }
    } catch (error) {
      this.log(`Performance tests error: ${error.message}`, 'error');
      this.results.failed++;
    }
    this.results.total++;
  }

  async runIntegrationTests() {
    this.log('Running integration tests...');
    try {
      const result = await this.runCommand('npm run test:integration');
      if (result.code === 0) {
        this.log('Integration tests passed', 'success');
        this.results.passed++;
      } else {
        this.log('Integration tests failed', 'error');
        this.results.failed++;
      }
    } catch (error) {
      this.log(`Integration tests error: ${error.message}`, 'error');
      this.results.failed++;
    }
    this.results.total++;
  }

  async runE2ETests() {
    this.log('Running end-to-end tests...');
    try {
      const result = await this.runCommand('npm run test:e2e');
      if (result.code === 0) {
        this.log('E2E tests passed', 'success');
        this.results.passed++;
      } else {
        this.log('E2E tests failed', 'error');
        this.results.failed++;
      }
    } catch (error) {
      this.log(`E2E tests error: ${error.message}`, 'error');
      this.results.failed++;
    }
    this.results.total++;
  }

  async checkAccessibility() {
    this.log('Running accessibility tests...');
    try {
      const result = await this.runCommand('npm run test:accessibility');
      if (result.code === 0) {
        this.log('Accessibility tests passed', 'success');
        this.results.passed++;
      } else {
        this.log('Accessibility tests failed', 'error');
        this.results.failed++;
      }
    } catch (error) {
      this.log(`Accessibility tests error: ${error.message}`, 'error');
      this.results.failed++;
    }
    this.results.total++;
  }

  async checkCompliance() {
    this.log('Checking enterprise compliance...');
    try {
      // Check for required files
      const requiredFiles = [
        '.cursorrules',
        'package.json',
        'tsconfig.json',
        'jest.config.js',
        '.eslintrc.js',
        '.prettierrc'
      ];

      let compliancePassed = true;
      for (const file of requiredFiles) {
        if (!fs.existsSync(file)) {
          this.log(`Missing required file: ${file}`, 'error');
          compliancePassed = false;
        }
      }

      // Check package.json for required scripts
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const requiredScripts = [
        'test',
        'test:unit',
        'test:integration',
        'test:e2e',
        'lint',
        'format',
        'type-check',
        'build'
      ];

      for (const script of requiredScripts) {
        if (!packageJson.scripts[script]) {
          this.log(`Missing required script: ${script}`, 'error');
          compliancePassed = false;
        }
      }

      if (compliancePassed) {
        this.log('Compliance check passed', 'success');
        this.results.passed++;
      } else {
        this.log('Compliance check failed', 'error');
        this.results.failed++;
      }
    } catch (error) {
      this.log(`Compliance check error: ${error.message}`, 'error');
      this.results.failed++;
    }
    this.results.total++;
  }

  async runAllGates() {
    this.log('Starting quality gates...');
    
    // Pre-commit gates
    await this.checkCodeFormatting();
    await this.runLinting();
    await this.runTypeChecking();
    await this.runUnitTests();
    await this.runSecurityScan();

    // Pre-merge gates
    await this.checkTestCoverage();
    await this.runIntegrationTests();
    await this.runPerformanceTests();
    await this.checkCompliance();

    // Pre-deployment gates
    await this.runE2ETests();
    await this.checkAccessibility();

    this.generateReport();
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(2);

    this.log('\n' + '='.repeat(50), 'info');
    this.log('QUALITY GATES REPORT', 'info');
    this.log('='.repeat(50), 'info');
    this.log(`Total checks: ${this.results.total}`, 'info');
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'info');
    this.log(`Warnings: ${this.results.warnings}`, this.results.warnings > 0 ? 'warning' : 'info');
    this.log(`Success rate: ${successRate}%`, 'info');
    this.log(`Duration: ${(duration / 1000).toFixed(2)}s`, 'info');
    this.log('='.repeat(50), 'info');

    if (this.results.failed > 0) {
      this.log('❌ Quality gates failed!', 'error');
      process.exit(1);
    } else {
      this.log('✅ All quality gates passed!', 'success');
      process.exit(0);
    }
  }
}

// Run quality gates
if (require.main === module) {
  const qualityGates = new QualityGates();
  qualityGates.runAllGates().catch(error => {
    console.error('Quality gates execution failed:', error);
    process.exit(1);
  });
}

module.exports = QualityGates;
