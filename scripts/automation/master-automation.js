#!/usr/bin/env node

/**
 * Master Automation Script
 * Runs all automation systems safely with Git protection
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

class MasterAutomation {
  constructor() {
    this.round = 1;
    this.maxRounds = 5;
    this.results = {
      appTests: [],
      startupTests: [],
      organizationTasks: [],
      gitOperations: []
    };
  }

  log(message, type = 'info') {
    const prefix = {
      info: '✅',
      error: '❌',
      critical: '🚨',
      success: '🎉',
      automation: '🤖',
      git: '📦',
      test: '🧪',
      organize: '🗂️'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  async gitCommit(message) {
    try {
      await execAsync('git add .');
      await execAsync(`git commit -m "${message}"`);
      this.log(`Git commit: ${message}`, 'git');
      return true;
    } catch (error) {
      this.log(`Git commit failed: ${error.message}`, 'error');
      return false;
    }
  }

  async gitCreateBranch(branchName) {
    try {
      await execAsync(`git checkout -b ${branchName}`);
      this.log(`Created branch: ${branchName}`, 'git');
      return true;
    } catch (error) {
      this.log(`Branch creation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAppStartupTester() {
    this.log('Running app and startup services tester...', 'test');
    
    try {
      const { spawn } = await import('child_process');
      const testerProcess = spawn('node', ['scripts/app-startup-tester.js'], {
        stdio: 'inherit'
      });
      
      await new Promise((resolve, reject) => {
        testerProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`App startup tester failed with code ${code}`));
          }
        });
      });
      
      this.log('App startup tester completed successfully', 'success');
      return true;
    } catch (error) {
      this.log(`App startup tester failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runEnterpriseOrganizer() {
    this.log('Running enterprise organizer...', 'organize');
    
    try {
      const { spawn } = await import('child_process');
      const organizerProcess = spawn('node', ['scripts/enterprise-organizer.js'], {
        stdio: 'inherit'
      });
      
      await new Promise((resolve, reject) => {
        organizerProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Enterprise organizer failed with code ${code}`));
          }
        });
      });
      
      this.log('Enterprise organizer completed successfully', 'success');
      return true;
    } catch (error) {
      this.log(`Enterprise organizer failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runEnhancedAutomation() {
    this.log('Running enhanced automation system...', 'automation');
    
    try {
      const { spawn } = await import('child_process');
      const automationProcess = spawn('node', ['scripts/enhanced-automation-system.js'], {
        stdio: 'inherit'
      });
      
      await new Promise((resolve, reject) => {
        automationProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Enhanced automation failed with code ${code}`));
          }
        });
      });
      
      this.log('Enhanced automation completed successfully', 'success');
      return true;
    } catch (error) {
      this.log(`Enhanced automation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async generateMasterReport() {
    this.log('Generating master automation report...', 'automation');
    
    const report = `
# Master Automation Report - Round ${this.round}

## Overview
This report summarizes the results of the master automation system that runs:
1. App and Startup Services Testing
2. Enterprise Self-Organization
3. Enhanced Automation System
4. Git-Safe Operations

## Test Results
- **App Tests**: ${this.results.appTests.filter(t => t.status === 'passed').length}/${this.results.appTests.length} passed
- **Startup Tests**: ${this.results.startupTests.filter(t => t.status === 'passed').length}/${this.results.startupTests.length} passed
- **Organization Tasks**: ${this.results.organizationTasks.filter(t => t.status === 'completed').length}/${this.results.organizationTasks.length} completed
- **Git Operations**: ${this.results.gitOperations.filter(g => g.status === 'success').length}/${this.results.gitOperations.length} successful

## App Functionality Tests
${this.results.appTests.map(test => `- **${test.name}**: ${test.status} - ${test.message}`).join('\n')}

## Startup Services Tests
${this.results.startupTests.map(test => `- **${test.name}**: ${test.status} - ${test.message}`).join('\n')}

## Organization Tasks
${this.results.organizationTasks.map(task => `- **${task.action}**: ${task.path} - ${task.status}`).join('\n')}

## Git Operations
${this.results.gitOperations.map(op => `- **${op.action}**: ${op.status}`).join('\n')}

## Files Generated
- \`app-startup-test-report.md\` - App and startup services test results
- \`enterprise-organization-report.md\` - Enterprise organization results
- \`enhanced-automation-report-${this.round}.md\` - Enhanced automation results
- \`master-automation-report-${this.round}.md\` - This master report

## Next Steps
1. Review all generated reports
2. Apply any remaining manual fixes
3. Run \`npm run compliance:check\` to verify final status
4. Run \`node scripts/master-automation.js\` for next round

## Timestamp: ${new Date().toISOString()}
`;

    await fs.writeFile(`master-automation-report-${this.round}.md`, report);
    this.log('Master report saved: master-automation-report-${this.round}.md', 'success');
  }

  async runMasterAutomation() {
    this.log('🚀 Starting Master Automation System', 'automation');
    console.log('='.repeat(60));
    
    // Step 1: Create backup branch
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupBranch = `master-automation-backup-${timestamp}`;
    await this.gitCreateBranch(backupBranch);
    
    // Step 2: Run app and startup services tester
    const appTestSuccess = await this.runAppStartupTester();
    if (appTestSuccess) {
      await this.gitCommit('App and startup services testing completed');
    }
    
    // Step 3: Run enterprise organizer
    const orgSuccess = await this.runEnterpriseOrganizer();
    if (orgSuccess) {
      await this.gitCommit('Enterprise organization completed');
    }
    
    // Step 4: Run enhanced automation
    const automationSuccess = await this.runEnhancedAutomation();
    if (automationSuccess) {
      await this.gitCommit('Enhanced automation completed');
    }
    
    // Step 5: Generate master report
    await this.generateMasterReport();
    
    // Step 6: Final commit
    await this.gitCommit(`Master automation round ${this.round} completed`);
    
    this.log('Master automation completed successfully!', 'success');
    this.log(`Backup branch created: ${backupBranch}`, 'git');
    this.log(`Master report saved: master-automation-report-${this.round}.md`, 'success');
    
    return {
      round: this.round,
      backupBranch,
      appTestSuccess,
      orgSuccess,
      automationSuccess,
      timestamp: new Date().toISOString()
    };
  }
}

// Run master automation
const masterAutomation = new MasterAutomation();
masterAutomation.runMasterAutomation().catch(console.error);
