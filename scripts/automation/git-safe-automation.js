#!/usr/bin/env node

/**
 * Git-Safe Automation Runner
 * Ensures no code is lost or overwritten during automation
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

class GitSafeAutomation {
  constructor() {
    this.backupBranches = [];
    this.originalBranch = '';
  }

  log(message, type = 'info') {
    const prefix = {
      info: '✅',
      error: '❌',
      critical: '🚨',
      success: '🎉',
      git: '📦',
      automation: '🤖'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  async getCurrentBranch() {
    try {
      const { stdout } = await execAsync('git branch --show-current');
      return stdout.trim();
    } catch (error) {
      this.log(`Failed to get current branch: ${error.message}`, 'error');
      return 'main';
    }
  }

  async createBackupBranch() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const branchName = `automation-backup-${timestamp}`;
    
    try {
      await execAsync(`git checkout -b ${branchName}`);
      this.backupBranches.push(branchName);
      this.log(`Created backup branch: ${branchName}`, 'git');
      return branchName;
    } catch (error) {
      this.log(`Failed to create backup branch: ${error.message}`, 'error');
      return null;
    }
  }

  async stashChanges() {
    try {
      await execAsync('git stash push -m "Automation system backup"');
      this.log('Stashed current changes', 'git');
      return true;
    } catch (error) {
      this.log(`Failed to stash changes: ${error.message}`, 'error');
      return false;
    }
  }

  async commitChanges(message) {
    try {
      await execAsync('git add .');
      await execAsync(`git commit -m "${message}"`);
      this.log(`Committed: ${message}`, 'git');
      return true;
    } catch (error) {
      this.log(`Failed to commit: ${error.message}`, 'error');
      return false;
    }
  }

  async runAutomationSafely() {
    this.log('🚀 Starting Git-Safe Automation', 'automation');
    
    // Step 1: Save current state
    this.originalBranch = await this.getCurrentBranch();
    this.log(`Current branch: ${this.originalBranch}`, 'info');
    
    // Step 2: Create backup branch
    const backupBranch = await this.createBackupBranch();
    if (!backupBranch) {
      this.log('Failed to create backup branch. Aborting automation.', 'critical');
      return false;
    }
    
    // Step 3: Stash any uncommitted changes
    await this.stashChanges();
    
    // Step 4: Run enhanced automation
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
            reject(new Error(`Automation failed with code ${code}`));
          }
        });
      });
      
      this.log('Enhanced automation completed successfully', 'success');
    } catch (error) {
      this.log(`Enhanced automation failed: ${error.message}`, 'error');
    }
    
    // Step 5: Commit automation results
    await this.commitChanges('Enhanced automation system results');
    
    // Step 6: Return to original branch
    try {
      await execAsync(`git checkout ${this.originalBranch}`);
      this.log(`Returned to original branch: ${this.originalBranch}`, 'git');
    } catch (error) {
      this.log(`Failed to return to original branch: ${error.message}`, 'error');
    }
    
    // Step 7: Merge automation results
    try {
      await execAsync(`git merge ${backupBranch} --no-ff -m "Merge automation results from ${backupBranch}"`);
      this.log(`Merged automation results from ${backupBranch}`, 'git');
    } catch (error) {
      this.log(`Failed to merge automation results: ${error.message}`, 'error');
    }
    
    this.log('Git-safe automation completed!', 'success');
    this.log(`Backup branches created: ${this.backupBranches.join(', ')}`, 'info');
    
    return true;
  }

  async restoreFromBackup(backupBranch) {
    try {
      await execAsync(`git checkout ${backupBranch}`);
      this.log(`Restored from backup: ${backupBranch}`, 'git');
      return true;
    } catch (error) {
      this.log(`Failed to restore from backup: ${error.message}`, 'error');
      return false;
    }
  }

  async listBackupBranches() {
    try {
      const { stdout } = await execAsync('git branch -a | grep automation-backup');
      const branches = stdout.split('\n').filter(b => b.trim()).map(b => b.trim().replace('* ', ''));
      this.log(`Available backup branches: ${branches.join(', ')}`, 'info');
      return branches;
    } catch (error) {
      this.log(`Failed to list backup branches: ${error.message}`, 'error');
      return [];
    }
  }
}

// Run git-safe automation
const gitSafeAutomation = new GitSafeAutomation();
gitSafeAutomation.runAutomationSafely().catch(console.error);
