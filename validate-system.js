#!/usr/bin/env node

/**
 * LightDom System Validation Script
 * Validates that all components are properly integrated and working
 */

import http from 'http';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

class SystemValidator {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async validate() {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║           LightDom System Validation                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log();

    await this.validateEnvironment();
    await this.validateDependencies();
    await this.validateConfiguration();
    await this.validateDocumentation();
    await this.generateReport();
  }

  async validateEnvironment() {
    console.log('📋 Validating Environment...');
    
    // Check Node.js version
    try {
      const { stdout } = await execAsync('node --version');
      const version = stdout.trim();
      const majorVersion = parseInt(version.match(/v(\d+)/)[1]);
      
      if (majorVersion >= 18) {
        this.pass(`Node.js version: ${version}`);
      } else {
        this.fail(`Node.js version ${version} is too old (need 18+)`);
      }
    } catch (error) {
      this.fail('Node.js not found');
    }

    // Check npm
    try {
      const { stdout } = await execAsync('npm --version');
      this.pass(`npm version: ${stdout.trim()}`);
    } catch (error) {
      this.fail('npm not found');
    }

    // Check git
    try {
      const { stdout } = await execAsync('git --version');
      this.pass(`Git: ${stdout.trim()}`);
    } catch (error) {
      this.warn('Git not found (optional for running)');
    }

    console.log();
  }

  async validateDependencies() {
    console.log('📦 Validating Dependencies...');

    // Check node_modules
    if (fs.existsSync('node_modules')) {
      this.pass('node_modules directory exists');
      
      // Check key dependencies
      const keyDeps = ['express', 'react', 'vite', 'socket.io'];
      for (const dep of keyDeps) {
        if (fs.existsSync(`node_modules/${dep}`)) {
          this.pass(`${dep} installed`);
        } else {
          this.fail(`${dep} not installed`);
        }
      }
    } else {
      this.fail('node_modules not found - run: npm install --legacy-peer-deps');
    }

    // Check package.json
    if (fs.existsSync('package.json')) {
      this.pass('package.json exists');
      
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (pkg.scripts['start:integrated']) {
          this.pass('start:integrated script defined');
        } else {
          this.fail('start:integrated script not found');
        }
      } catch (error) {
        this.fail('package.json is invalid');
      }
    } else {
      this.fail('package.json not found');
    }

    console.log();
  }

  async validateConfiguration() {
    console.log('⚙️  Validating Configuration...');

    // Check .env file
    if (fs.existsSync('.env')) {
      this.pass('.env file exists');
      
      try {
        const envContent = fs.readFileSync('.env', 'utf8');
        
        // Check key variables
        const requiredVars = ['PORT', 'NODE_ENV', 'DB_DISABLED'];
        for (const varName of requiredVars) {
          if (envContent.includes(varName)) {
            this.pass(`${varName} configured`);
          } else {
            this.warn(`${varName} not found in .env`);
          }
        }
      } catch (error) {
        this.fail('.env file is not readable');
      }
    } else {
      this.warn('.env file not found - will be created from .env.example');
    }

    // Check .env.example
    if (fs.existsSync('.env.example')) {
      this.pass('.env.example exists');
    } else {
      this.fail('.env.example not found');
    }

    // Check vite.config.ts
    if (fs.existsSync('vite.config.ts')) {
      this.pass('vite.config.ts exists');
    } else {
      this.fail('vite.config.ts not found');
    }

    // Check API server
    if (fs.existsSync('api-server-express.js')) {
      this.pass('api-server-express.js exists');
    } else {
      this.fail('api-server-express.js not found');
    }

    // Check startup script
    if (fs.existsSync('start-integrated-system.js')) {
      this.pass('start-integrated-system.js exists');
    } else {
      this.fail('start-integrated-system.js not found');
    }

    console.log();
  }

  async validateDocumentation() {
    console.log('📚 Validating Documentation...');

    const docs = [
      'README.md',
      'START_GUIDE.md',
      'SYSTEM_INTEGRATION_GUIDE.md',
      'COMPLETE_SYSTEM_DOCUMENTATION.md'
    ];

    for (const doc of docs) {
      if (fs.existsSync(doc)) {
        this.pass(`${doc} exists`);
      } else {
        this.warn(`${doc} not found`);
      }
    }

    console.log();
  }

  async generateReport() {
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    Validation Report                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log();

    console.log(`✅ Passed: ${this.results.passed.length}`);
    console.log(`❌ Failed: ${this.results.failed.length}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    console.log();

    if (this.results.failed.length > 0) {
      console.log('❌ Failed Checks:');
      this.results.failed.forEach(msg => console.log(`   - ${msg}`));
      console.log();
    }

    if (this.results.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      this.results.warnings.forEach(msg => console.log(`   - ${msg}`));
      console.log();
    }

    // Overall status
    if (this.results.failed.length === 0) {
      console.log('🎉 System validation passed!');
      console.log();
      console.log('Next steps:');
      console.log('  1. Run: npm run start:integrated');
      console.log('  2. Open: http://localhost:3000');
      console.log('  3. Check API: http://localhost:3001/api/health');
      console.log();
      return true;
    } else {
      console.log('❌ System validation failed!');
      console.log();
      console.log('Please fix the failed checks above before starting the system.');
      console.log();
      return false;
    }
  }

  pass(message) {
    console.log(`  ✅ ${message}`);
    this.results.passed.push(message);
  }

  fail(message) {
    console.log(`  ❌ ${message}`);
    this.results.failed.push(message);
  }

  warn(message) {
    console.log(`  ⚠️  ${message}`);
    this.results.warnings.push(message);
  }
}

// Run validation
const validator = new SystemValidator();
validator.validate().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('Validation error:', error);
  process.exit(1);
});
