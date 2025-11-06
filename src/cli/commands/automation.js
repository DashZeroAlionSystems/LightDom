/**
 * Automation command implementation
 */

import { execSync, spawn } from 'child_process';
import chalk from 'chalk';
import { existsSync } from 'fs';

export async function runAutomation(options) {
  console.log(chalk.blue('🤖 LightDom Blockchain Automation Manager'));
  
  if (options.start) {
    console.log(chalk.cyan('🚀 Starting automation system...'));
    
    // Check if automation.env exists
    if (!existsSync('automation.env')) {
      console.log(chalk.yellow('⚠️ automation.env not found, using default configuration'));
    }
    
    if (options.debug) {
      execSync('npm run automation:debug', { stdio: 'inherit' });
    } else {
      execSync('npm run automation:start', { stdio: 'inherit' });
    }
    return;
  }
  
  if (options.stop) {
    console.log(chalk.cyan('🛑 Stopping automation system...'));
    try {
      // Kill automation processes
      execSync('pkill -f "start-blockchain-automation"', { stdio: 'pipe' });
      console.log(chalk.green('✅ Automation system stopped'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ No automation processes found running'));
    }
    return;
  }
  
  if (options.status) {
    console.log(chalk.cyan('📊 Checking automation system status...'));
    try {
      const processes = execSync('pgrep -f "start-blockchain-automation"', { encoding: 'utf8' });
      if (processes.trim()) {
        console.log(chalk.green('✅ Automation system is running'));
        console.log(chalk.gray(`Process IDs: ${processes.trim()}`));
      } else {
        console.log(chalk.yellow('⚠️ Automation system is not running'));
      }
    } catch (error) {
      console.log(chalk.yellow('⚠️ Automation system is not running'));
    }
    
    // Check automation health via API
    try {
      const response = await fetch('http://localhost:3000/api/automation/status');
      if (response.ok) {
        const status = await response.json();
        console.log(chalk.green('✅ Automation API is responsive'));
        console.log(chalk.gray(`Workflows active: ${status.activeWorkflows || 0}`));
        console.log(chalk.gray(`Nodes managed: ${status.managedNodes || 0}`));
      }
    } catch (error) {
      console.log(chalk.yellow('⚠️ Automation API is not responsive'));
    }
    return;
  }
  
  // Default: show automation info
  console.log(chalk.cyan('🤖 LightDom Blockchain Automation System'));
  console.log(chalk.gray('Available commands:'));
  console.log(chalk.gray('  --start    Start the automation system'));
  console.log(chalk.gray('  --stop     Stop the automation system'));
  console.log(chalk.gray('  --status   Check automation system status'));
  console.log(chalk.gray('  --debug    Start with debug logging'));
  console.log(chalk.gray(''));
  console.log(chalk.gray('Direct npm scripts:'));
  console.log(chalk.gray('  npm run automation         Start automation'));
  console.log(chalk.gray('  npm run automation:dev     Start dev mode'));
  console.log(chalk.gray('  npm run automation:debug   Start debug mode'));
  console.log(chalk.gray('  npm run automation:dry-run Dry run mode'));
}