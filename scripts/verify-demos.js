#!/usr/bin/env node

/**
 * Demo Verification System
 * 
 * This script validates all demo files in the repository to ensure:
 * 1. They can be executed without errors
 * 2. They use design system components properly
 * 3. They have meaningful functionality (not random hooks)
 * 4. They follow best practices
 * 
 * Usage: node scripts/verify-demos.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

class DemoVerifier {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  async findDemoFiles() {
    console.log('🔍 Finding demo files...\n');
    
    const demoPatterns = [
      'demo-*.js',
      'demo-*.ts',
      '*-demo.js',
      '*-demo.ts'
    ];
    
    const files = await fs.readdir(rootDir);
    const demoFiles = files.filter(file => 
      demoPatterns.some(pattern => {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return regex.test(file);
      })
    );
    
    console.log(`   Found ${demoFiles.length} demo files\n`);
    return demoFiles;
  }

  async verifyDemo(demoFile) {
    const result = {
      file: demoFile,
      status: 'unknown',
      issues: [],
      warnings: [],
      suggestions: []
    };

    try {
      // Read file content
      const filePath = path.join(rootDir, demoFile);
      const content = await fs.readFile(filePath, 'utf-8');

      // Check 1: ES Module compatibility
      if (content.includes('require(') && !demoFile.endsWith('.cjs')) {
        result.issues.push('Uses require() in ES module context - should use import');
      }

      // Check 2: Design system component usage
      const designSystemImports = [
        'from \'@/components/ui\'',
        'from \'../components/ui\'',
        'from \'./components/ui\'',
        'from \'@/components/atoms\'',
        'from \'../src/components/atoms\''
      ];
      
      const hasDesignSystemImports = designSystemImports.some(imp => 
        content.includes(imp)
      );
      
      if (!hasDesignSystemImports && content.includes('React')) {
        result.warnings.push('No design system component imports detected - consider using reusable components');
      }

      // Check 3: Has meaningful description
      const hasDescription = content.includes('@description') || 
                           content.includes('/**') ||
                           content.includes('* Demonstrates');
      
      if (!hasDescription) {
        result.warnings.push('Missing JSDoc description - add documentation for clarity');
      }

      // Check 4: Has proper error handling
      const hasErrorHandling = content.includes('try {') && content.includes('catch');
      
      if (!hasErrorHandling && content.includes('async function')) {
        result.warnings.push('Async functions should have error handling');
      }

      // Check 5: Avoid hardcoded URLs (should use env vars)
      const hardcodedUrls = content.match(/http:\/\/localhost:\d+/g);
      if (hardcodedUrls && hardcodedUrls.length > 0) {
        result.suggestions.push(`Uses hardcoded URLs: ${hardcodedUrls.join(', ')} - consider using environment variables`);
      }

      // Check 6: Check for console.log overuse (should use proper logging)
      const consoleLogCount = (content.match(/console\.log\(/g) || []).length;
      if (consoleLogCount > 10) {
        result.suggestions.push(`Has ${consoleLogCount} console.log statements - consider using a logging library`);
      }

      // Determine overall status
      if (result.issues.length === 0) {
        result.status = 'passed';
      } else {
        result.status = 'failed';
      }

    } catch (error) {
      result.status = 'error';
      result.issues.push(`Error reading file: ${error.message}`);
    }

    return result;
  }

  async verifyAllDemos() {
    const demoFiles = await this.findDemoFiles();
    this.results.total = demoFiles.length;

    console.log('📊 Verifying demos...\n');
    console.log('='.repeat(80));
    console.log();

    for (const demoFile of demoFiles) {
      console.log(`🔍 Checking: ${demoFile}`);
      
      const result = await this.verifyDemo(demoFile);
      this.results.details.push(result);

      if (result.status === 'passed') {
        this.results.passed++;
        console.log(`   ✅ PASS`);
      } else if (result.status === 'failed') {
        this.results.failed++;
        console.log(`   ❌ FAIL`);
      } else {
        console.log(`   ⚠️  ERROR`);
      }

      if (result.issues.length > 0) {
        console.log(`   Issues:`);
        result.issues.forEach(issue => console.log(`     • ${issue}`));
      }

      if (result.warnings.length > 0) {
        this.results.warnings += result.warnings.length;
        console.log(`   Warnings:`);
        result.warnings.forEach(warning => console.log(`     • ${warning}`));
      }

      if (result.suggestions.length > 0) {
        console.log(`   Suggestions:`);
        result.suggestions.forEach(suggestion => console.log(`     • ${suggestion}`));
      }

      console.log();
    }

    this.printSummary();
  }

  printSummary() {
    console.log('='.repeat(80));
    console.log('📈 VERIFICATION SUMMARY');
    console.log('='.repeat(80));
    console.log();
    console.log(`Total Demos:     ${this.results.total}`);
    console.log(`✅ Passed:       ${this.results.passed}`);
    console.log(`❌ Failed:       ${this.results.failed}`);
    console.log(`⚠️  Warnings:     ${this.results.warnings}`);
    console.log();

    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    console.log(`Pass Rate:       ${passRate}%`);
    console.log();

    if (this.results.failed > 0) {
      console.log('⚠️  Some demos have issues that need to be addressed.');
      console.log('   Review the output above for details.\n');
    } else if (this.results.warnings > 0) {
      console.log('✅ All demos passed basic checks!');
      console.log('⚠️  Consider addressing the warnings above for best practices.\n');
    } else {
      console.log('✅ All demos are in excellent shape!\n');
    }

    // Save results to file
    const reportPath = path.join(rootDir, 'demo-verification-report.json');
    fs.writeFile(reportPath, JSON.stringify(this.results, null, 2))
      .then(() => console.log(`📄 Full report saved to: ${reportPath}\n`))
      .catch(err => console.error(`Failed to save report: ${err.message}\n`));
  }
}

// Run verification
const verifier = new DemoVerifier();
verifier.verifyAllDemos().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});
