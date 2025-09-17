#!/usr/bin/env node

/**
 * LightDom Cursor Rules Validation Script
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
      total: 0,
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '✅',
      warn: '⚠️',
      error: '❌',
      success: '🎉',
    }[type];
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkTypeScriptConfig() {
    this.log('Checking TypeScript configuration...');

    try {
      const tsconfigPath = 'tsconfig.json';
      const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf8'));

      const checks = [
        { name: 'Strict mode enabled', check: tsconfig.compilerOptions?.strict === true },
        { name: 'No unused locals', check: tsconfig.compilerOptions?.noUnusedLocals === true },
        {
          name: 'No unused parameters',
          check: tsconfig.compilerOptions?.noUnusedParameters === true,
        },
        {
          name: 'No fallthrough cases',
          check: tsconfig.compilerOptions?.noFallthroughCasesInSwitch === true,
        },
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
        this.log('  ⚠ ESLint configuration missing - should be created', 'warn');
        this.results.warnings++;
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
      const prettierFiles = [
        '.prettierrc',
        '.prettierrc.js',
        '.prettierrc.json',
        '.prettierrc.yml',
      ];
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
        this.log('  ⚠ Prettier configuration missing - should be created', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

      // Check if Prettier is in package.json
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const hasPrettier =
        packageJson.devDependencies?.prettier || packageJson.dependencies?.prettier;

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
      const testScripts = Object.keys(packageJson.scripts || {}).filter(
        script => script.includes('test') || script.includes('coverage')
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
      const foundTestingDeps = testingDeps.filter(
        dep => packageJson.devDependencies?.[dep] || packageJson.dependencies?.[dep]
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
      const hasCoverage =
        packageJson.scripts &&
        Object.keys(packageJson.scripts).some(script => script.includes('coverage'));

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
      const foundSecurityDeps = securityDeps.filter(
        dep => packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
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
      // Check for TODO/FIXME comments
      const { stdout } = await execAsync(
        'grep -r "TODO\\|FIXME\\|HACK\\|XXX" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ || true'
      );

      if (stdout.trim()) {
        const todoCount = stdout.split('\n').filter(line => line.trim()).length;
        this.log(`  ⚠ Found ${todoCount} TODO/FIXME comments in codebase`, 'warn');
        this.results.warnings++;
      } else {
        this.log('  ✓ No TODO/FIXME comments found', 'success');
        this.results.passed++;
      }
      this.results.total++;

      // Check for console.log statements in production code
      const { stdout: consoleLogs } = await execAsync(
        'grep -r "console\\.log\\|console\\.warn\\|console\\.error" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ || true'
      );

      if (consoleLogs.trim()) {
        const consoleCount = consoleLogs.split('\n').filter(line => line.trim()).length;
        this.log(`  ⚠ Found ${consoleCount} console statements in production code`, 'warn');
        this.results.warnings++;
      } else {
        this.log('  ✓ No console statements found in production code', 'success');
        this.results.passed++;
      }
      this.results.total++;

      // Check for 'any' type usage
      const { stdout: anyTypes } = await execAsync(
        'grep -r ": any\\|as any" --include="*.ts" --include="*.tsx" src/ || true'
      );

      if (anyTypes.trim()) {
        const anyCount = anyTypes.split('\n').filter(line => line.trim()).length;
        this.log(`  ⚠ Found ${anyCount} 'any' type usages`, 'warn');
        this.results.warnings++;
      } else {
        this.log("  ✓ No 'any' type usages found", 'success');
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
      // Check for class components
      const { stdout: classComponents } = await execAsync(
        'grep -r "class.*extends.*Component\\|React\\.Component" --include="*.tsx" --include="*.jsx" src/ || true'
      );

      if (classComponents.trim()) {
        const classCount = classComponents.split('\n').filter(line => line.trim()).length;
        this.log(
          `  ⚠ Found ${classCount} class components (should use functional components)`,
          'warn'
        );
        this.results.warnings++;
      } else {
        this.log('  ✓ No class components found (using functional components)', 'success');
        this.results.passed++;
      }
      this.results.total++;

      // Check for proper hook usage
      const { stdout: hooks } = await execAsync(
        'grep -r "use[A-Z]" --include="*.tsx" --include="*.jsx" src/ || true'
      );

      if (hooks.trim()) {
        const hookCount = hooks.split('\n').filter(line => line.trim()).length;
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
      // Check for OpenZeppelin imports
      const { stdout: openzeppelin } = await execAsync(
        'grep -r "@openzeppelin" --include="*.sol" contracts/ || true'
      );

      if (openzeppelin.trim()) {
        this.log('  ✓ OpenZeppelin imports found', 'success');
        this.results.passed++;
      } else {
        this.log('  ⚠ No OpenZeppelin imports found', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

      // Check for reentrancy guards
      const { stdout: reentrancy } = await execAsync(
        'grep -r "ReentrancyGuard\\|nonReentrant" --include="*.sol" contracts/ || true'
      );

      if (reentrancy.trim()) {
        this.log('  ✓ Reentrancy guards found', 'success');
        this.results.passed++;
      } else {
        this.log('  ⚠ No reentrancy guards found', 'warn');
        this.results.warnings++;
      }
      this.results.total++;

      // Check for events
      const { stdout: events } = await execAsync(
        'grep -r "event " --include="*.sol" contracts/ || true'
      );

      if (events.trim()) {
        const eventCount = events.split('\n').filter(line => line.trim()).length;
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
      // Check for .env files in git
      const { stdout: envFiles } = await execAsync('git ls-files | grep "\\.env" || true');

      if (envFiles.trim()) {
        this.log('  ✗ .env files found in git repository (security risk)', 'error');
        this.results.failed++;
      } else {
        this.log('  ✓ No .env files in git repository', 'success');
        this.results.passed++;
      }
      this.results.total++;

      // Check for hardcoded secrets
      const { stdout: secrets } = await execAsync(
        'grep -r "password\\|secret\\|key\\|token" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ | grep -v "process\\.env" || true'
      );

      if (secrets.trim()) {
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

      // Check for API documentation
      const { stdout: apiDocs } = await execAsync(
        'find . -name "*.md" -exec grep -l "API\\|endpoint\\|swagger\\|openapi" {} \\; || true'
      );

      if (apiDocs.trim()) {
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
      successRate: parseFloat(successRate),
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
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].includes('rule-validation.js')
) {
  const validator = new RuleValidator();
  validator
    .runAllChecks()
    .then(report => {
      process.exit(report.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

export default RuleValidator;
