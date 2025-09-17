#!/usr/bin/env node

/**
 * LightDom Cursor Rules Validation Script - Windows Compatible
 * Continuously tests and validates rule compliance across the codebase
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

class RuleValidator {
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
      info: '✅',
      warn: '⚠️',
      error: '❌',
      success: '🎉'
    }[type];
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkTypeScriptConfig() {
    this.log('Checking TypeScript configuration...');
    
    try {
      const tsconfigPath = 'tsconfig.json';
      const tsconfigContent = await fs.readFile(tsconfigPath, 'utf8');
      // Remove comments from TypeScript config for JSON parsing
      const cleanContent = tsconfigContent
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
        .replace(/\/\/.*$/gm, '') // Remove // comments
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
      const tsconfig = JSON.parse(cleanContent);
      
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
        this.log('  ✗ ESLint configuration missing', 'error');
        this.results.failed++;
      }
      this.results.total++;

      // Check if ESLint is in package.json
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const hasESLint = packageJson.devDependencies?.eslint || packageJson.dependencies?.eslint;
      
      if (hasESLint) {
        this.log('  ✓ ESLint dependency found', 'success');
        this.results.passed++;
      } else {
        this.log('  ✗ ESLint dependency missing', 'error');
        this.results.failed++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`ESLint config check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async checkPrettierConfig() {
    this.log('Checking Prettier configuration...');
    
    try {
      const prettierFiles = ['.prettierrc', '.prettierrc.js', '.prettierrc.json', '.prettierrc.yml'];
      let prettierExists = false;
      
      for (const file of prettierFiles) {
        try {
          await fs.access(file);
          prettierExists = true;
          break;
        } catch {
          // File doesn't exist, continue
        }
      }

      if (prettierExists) {
        this.log('  ✓ Prettier configuration found', 'success');
        this.results.passed++;
      } else {
        this.log('  ✗ Prettier configuration missing', 'error');
        this.results.failed++;
      }
      this.results.total++;

      // Check if Prettier is in package.json
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const hasPrettier = packageJson.devDependencies?.prettier || packageJson.dependencies?.prettier;
      
      if (hasPrettier) {
        this.log('  ✓ Prettier dependency found', 'success');
        this.results.passed++;
      } else {
        this.log('  ✗ Prettier dependency missing', 'error');
        this.results.failed++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`Prettier config check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async checkTestConfiguration() {
    this.log('Checking test configuration...');
    
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      
      // Check for test scripts
      const testScripts = Object.keys(packageJson.scripts || {}).filter(script => 
        script.includes('test') || script.includes('coverage')
      );

      if (testScripts.length > 0) {
        this.log(`  ✓ Test scripts found: ${testScripts.join(', ')}`, 'success');
        this.results.passed++;
      } else {
        this.log('  ✗ No test scripts found in package.json', 'error');
        this.results.failed++;
      }
      this.results.total++;

      // Check for testing dependencies
      const testingDeps = ['jest', 'vitest', 'mocha', 'chai', 'supertest'];
      const foundTestingDeps = testingDeps.filter(dep => 
        packageJson.devDependencies?.[dep] || packageJson.dependencies?.[dep]
      );

      if (foundTestingDeps.length > 0) {
        this.log(`  ✓ Testing dependencies found: ${foundTestingDeps.join(', ')}`, 'success');
        this.results.passed++;
      } else {
        this.log('  ✗ No testing dependencies found', 'error');
        this.results.failed++;
      }
      this.results.total++;

      // Check for coverage configuration
      const hasCoverage = packageJson.scripts && Object.keys(packageJson.scripts).some(script => 
        script.includes('coverage')
      );

      if (hasCoverage) {
        this.log('  ✓ Coverage configuration found', 'success');
        this.results.passed++;
      } else {
        this.log('  ⚠ Coverage configuration missing', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`Test configuration check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async checkSecurityConfiguration() {
    this.log('Checking security configuration...');
    
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      
      // Check for security-related dependencies
      const securityDeps = ['helmet', 'cors', 'express-rate-limit', 'bcryptjs', 'jsonwebtoken'];
      const foundSecurityDeps = securityDeps.filter(dep => 
        packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
      );

      if (foundSecurityDeps.length > 0) {
        this.log(`  ✓ Security dependencies found: ${foundSecurityDeps.join(', ')}`, 'success');
        this.results.passed++;
      } else {
        this.log('  ⚠ Limited security dependencies found', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

      // Check for lint-staged configuration
      if (packageJson['lint-staged']) {
        this.log('  ✓ lint-staged configuration found', 'success');
        this.results.passed++;
      } else {
        this.log('  ⚠ lint-staged configuration missing', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

      // Check for husky configuration
      if (packageJson.husky) {
        this.log('  ✓ Husky configuration found', 'success');
        this.results.passed++;
      } else {
        this.log('  ⚠ Husky configuration missing', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`Security configuration check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async checkCodeQuality() {
    this.log('Checking code quality patterns...');
    
    try {
      // Use Node.js to search for TODO/FIXME comments instead of grep
      const srcFiles = await this.findFiles('src', ['.ts', '.tsx', '.js', '.jsx']);
      let todoCount = 0;
      
      for (const file of srcFiles) {
        try {
          const content = await fs.readFile(file, 'utf8');
          const matches = content.match(/TODO|FIXME|HACK|XXX/gi);
          if (matches) {
            todoCount += matches.length;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
      if (todoCount > 0) {
        this.log(`  ⚠ Found ${todoCount} TODO/FIXME comments in codebase`, 'warn');
        this.results.warnings++;
      } else {
        this.log('  ✓ No TODO/FIXME comments found', 'success');
        this.results.passed++;
      }
      this.results.total++;

      // Check for console.log statements
      let consoleCount = 0;
      for (const file of srcFiles) {
        try {
          const content = await fs.readFile(file, 'utf8');
          const matches = content.match(/console\.(log|warn|error)/gi);
          if (matches) {
            consoleCount += matches.length;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
      if (consoleCount > 0) {
        this.log(`  ⚠ Found ${consoleCount} console statements in production code`, 'warn');
        this.results.warnings++;
      } else {
        this.log('  ✓ No console statements found in production code', 'success');
        this.results.passed++;
      }
      this.results.total++;

      // Check for 'any' type usage
      let anyCount = 0;
      for (const file of srcFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))) {
        try {
          const content = await fs.readFile(file, 'utf8');
          const matches = content.match(/: any|as any/gi);
          if (matches) {
            anyCount += matches.length;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
      if (anyCount > 0) {
        this.log(`  ⚠ Found ${anyCount} 'any' type usages`, 'warn');
        this.results.warnings++;
      } else {
        this.log('  ✓ No \'any\' type usages found', 'success');
        this.results.passed++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`Code quality check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async checkReactPatterns() {
    this.log('Checking React patterns...');
    
    try {
      const reactFiles = await this.findFiles('src', ['.tsx', '.jsx']);
      
      // Check for class components
      let classCount = 0;
      for (const file of reactFiles) {
        try {
          const content = await fs.readFile(file, 'utf8');
          if (content.match(/class.*extends.*Component|React\.Component/gi)) {
            classCount++;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
      if (classCount > 0) {
        this.log(`  ⚠ Found ${classCount} class components (should use functional components)`, 'warn');
        this.results.warnings++;
      } else {
        this.log('  ✓ No class components found (using functional components)', 'success');
        this.results.passed++;
      }
      this.results.total++;

      // Check for proper hook usage
      let hookCount = 0;
      for (const file of reactFiles) {
        try {
          const content = await fs.readFile(file, 'utf8');
          const matches = content.match(/use[A-Z]/gi);
          if (matches) {
            hookCount += matches.length;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
      if (hookCount > 0) {
        this.log(`  ✓ Found ${hookCount} React hooks usage`, 'success');
        this.results.passed++;
      } else {
        this.log('  ⚠ No React hooks found', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`React patterns check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async checkSmartContractPatterns() {
    this.log('Checking smart contract patterns...');
    
    try {
      const solFiles = await this.findFiles('contracts', ['.sol']);
      
      // Check for OpenZeppelin imports
      let openzeppelinCount = 0;
      for (const file of solFiles) {
        try {
          const content = await fs.readFile(file, 'utf8');
          if (content.includes('@openzeppelin')) {
            openzeppelinCount++;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
      if (openzeppelinCount > 0) {
        this.log('  ✓ OpenZeppelin imports found', 'success');
        this.results.passed++;
      } else {
        this.log('  ⚠ No OpenZeppelin imports found', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

      // Check for reentrancy guards
      let reentrancyCount = 0;
      for (const file of solFiles) {
        try {
          const content = await fs.readFile(file, 'utf8');
          if (content.match(/ReentrancyGuard|nonReentrant/gi)) {
            reentrancyCount++;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
      if (reentrancyCount > 0) {
        this.log('  ✓ Reentrancy guards found', 'success');
        this.results.passed++;
      } else {
        this.log('  ⚠ No reentrancy guards found', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

      // Check for events
      let eventCount = 0;
      for (const file of solFiles) {
        try {
          const content = await fs.readFile(file, 'utf8');
          const matches = content.match(/event /gi);
          if (matches) {
            eventCount += matches.length;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
      if (eventCount > 0) {
        this.log(`  ✓ Found ${eventCount} events in smart contracts`, 'success');
        this.results.passed++;
      } else {
        this.log('  ⚠ No events found in smart contracts', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`Smart contract patterns check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async checkEnvironmentSecurity() {
    this.log('Checking environment security...');
    
    try {
      // Check for .env files in git using Node.js
      const { stdout: gitFiles } = await execAsync('git ls-files');
      const envFiles = gitFiles.split('\n').filter(file => file.includes('.env'));
      
      if (envFiles.length > 0) {
        this.log('  ✗ .env files found in git repository (security risk)', 'error');
        this.results.failed++;
      } else {
        this.log('  ✓ No .env files in git repository', 'success');
        this.results.passed++;
      }
      this.results.total++;

      // Check for hardcoded secrets using Node.js
      const srcFiles = await this.findFiles('src', ['.ts', '.tsx', '.js', '.jsx']);
      let secretCount = 0;
      
      for (const file of srcFiles) {
        try {
          const content = await fs.readFile(file, 'utf8');
          if (content.match(/password|secret|key|token/gi) && !content.includes('process.env')) {
            secretCount++;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
      if (secretCount > 0) {
        this.log('  ⚠ Potential hardcoded secrets found', 'warn');
        this.results.warnings++;
      } else {
        this.log('  ✓ No hardcoded secrets found', 'success');
        this.results.passed++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`Environment security check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async checkDocumentation() {
    this.log('Checking documentation...');
    
    try {
      // Check for README files
      const readmeFiles = ['README.md', 'README-COMPLETE.md'];
      let readmeExists = false;
      
      for (const file of readmeFiles) {
        try {
          await fs.access(file);
          readmeExists = true;
          break;
        } catch {
          // File doesn't exist, continue
        }
      }

      if (readmeExists) {
        this.log('  ✓ README files found', 'success');
        this.results.passed++;
      } else {
        this.log('  ✗ No README files found', 'error');
        this.results.failed++;
      }
      this.results.total++;

      // Check for API documentation using Node.js
      const mdFiles = await this.findFiles('.', ['.md']);
      let apiDocsFound = false;
      
      for (const file of mdFiles) {
        try {
          const content = await fs.readFile(file, 'utf8');
          if (content.match(/API|endpoint|swagger|openapi/gi)) {
            apiDocsFound = true;
            break;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }
      
      if (apiDocsFound) {
        this.log('  ✓ API documentation found', 'success');
        this.results.passed++;
      } else {
        this.log('  ⚠ No API documentation found', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

    } catch (error) {
      this.log(`Documentation check failed: ${error.message}`, 'error');
      this.results.failed++;
      this.results.total++;
    }
  }

  async findFiles(dir, extensions) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          const subFiles = await this.findFiles(fullPath, extensions);
          files.push(...subFiles);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  generateReport() {
    const duration = Date.now() - this.startTime;
    const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    
    this.log('\n' + '='.repeat(60));
    this.log('RULE VALIDATION REPORT');
    this.log('='.repeat(60));
    this.log(`Total checks: ${this.results.total}`);
    this.log(`Passed: ${this.results.passed} ✅`);
    this.log(`Failed: ${this.results.failed} ❌`);
    this.log(`Warnings: ${this.results.warnings} ⚠️`);
    this.log(`Success rate: ${successRate}%`);
    this.log(`Duration: ${duration}ms`);
    
    if (this.results.failed > 0) {
      this.log('\n❌ CRITICAL ISSUES FOUND - Please address failed checks');
    } else if (this.results.warnings > 0) {
      this.log('\n⚠️  WARNINGS FOUND - Consider addressing warning items');
    } else {
      this.log('\n🎉 ALL CHECKS PASSED - Excellent rule compliance!');
    }
    
    this.log('='.repeat(60));
    
    return {
      success: this.results.failed === 0,
      results: this.results,
      duration,
      successRate: parseFloat(successRate)
    };
  }

  async runAllChecks() {
    this.log('Starting LightDom Cursor Rules Validation...\n');
    
    await this.checkTypeScriptConfig();
    await this.checkESLintConfig();
    await this.checkPrettierConfig();
    await this.checkTestConfiguration();
    await this.checkSecurityConfiguration();
    await this.checkCodeQuality();
    await this.checkReactPatterns();
    await this.checkSmartContractPatterns();
    await this.checkEnvironmentSecurity();
    await this.checkDocumentation();
    
    return this.generateReport();
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].includes('rule-validation-windows.js')) {
  const validator = new RuleValidator();
  validator.runAllChecks().then(report => {
    process.exit(report.success ? 0 : 1);
  }).catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

export default RuleValidator;
