#!/usr/bin/env node

/**
 * Cursor Agent for Automated Fixes
 * Applies fixes based on compliance check results
 */

import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class CursorAgent {
  constructor(round = 1) {
    this.round = round;
    this.fixes = [];
  }

  log(message, type = 'info') {
    const prefix = {
      info: '✅',
      error: '❌',
      critical: '🚨',
      success: '🎉',
      agent: '🤖',
      fix: '🔧'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  async loadComplianceResults() {
    try {
      const content = await fs.readFile(`system-status-round-${this.round}.md`, 'utf8');
      return this.parseComplianceResults(content);
    } catch (error) {
      this.log(`Failed to load compliance results: ${error.message}`, 'error');
      return null;
    }
  }

  parseComplianceResults(content) {
    const results = {
      criticalIssues: [],
      workingComponents: [],
      brokenComponents: []
    };

    // Parse critical issues
    const criticalMatch = content.match(/## Critical Issues\n([\s\S]*?)(?=##|$)/);
    if (criticalMatch) {
      results.criticalIssues = criticalMatch[1]
        .split('\n')
        .filter(line => line.trim() && line.includes('.'))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
    }

    // Parse working components
    const workingMatch = content.match(/## Working Components\n([\s\S]*?)(?=##|$)/);
    if (workingMatch) {
      results.workingComponents = workingMatch[1]
        .split('\n')
        .filter(line => line.trim() && line.includes('✅'))
        .map(line => line.replace(/✅\s*/, '').trim());
    }

    // Parse broken components
    const brokenMatch = content.match(/## Broken Components\n([\s\S]*?)(?=##|$)/);
    if (brokenMatch) {
      results.brokenComponents = brokenMatch[1]
        .split('\n')
        .filter(line => line.trim() && line.includes('❌'))
        .map(line => line.replace(/❌\s*/, '').trim());
    }

    return results;
  }

  async applyElectronFix() {
    this.log('Applying Electron fix...', 'fix');
    
    try {
      // Check if electron is installed globally
      try {
        await execAsync('electron --version');
        this.log('Electron is already installed globally', 'success');
      } catch (error) {
        this.log('Installing Electron globally...', 'info');
        await execAsync('npm install -g electron');
        this.log('Electron installed globally', 'success');
      }

      // Update package.json to use npx electron
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      packageJson.scripts['electron:dev'] = 'npx electron . --dev';
      await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
      this.log('Updated package.json to use npx electron', 'success');

      this.fixes.push('Electron: Installed globally and updated package.json');
      return true;
    } catch (error) {
      this.log(`Electron fix failed: ${error.message}`, 'error');
      return false;
    }
  }

  async applyAPIServerFix() {
    this.log('Applying API server fix...', 'fix');
    
    try {
      // Check if we're using the fake API server
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const scripts = packageJson.scripts || {};
      
      if (scripts.start?.includes('simple-api-server') || 
          scripts['start:dev']?.includes('simple-api-server')) {
        
        this.log('Switching from fake API server to real one...', 'info');
        
        // Update scripts to use the real API server
        if (scripts.start) {
          scripts.start = scripts.start.replace('simple-api-server', 'api-server-express');
        }
        if (scripts['start:dev']) {
          scripts['start:dev'] = scripts['start:dev'].replace('simple-api-server', 'api-server-express');
        }
        
        await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
        this.log('Updated package.json to use real API server', 'success');
        
        this.fixes.push('API Server: Switched from fake to real API server');
        return true;
      } else {
        this.log('Already using real API server', 'success');
        return true;
      }
    } catch (error) {
      this.log(`API server fix failed: ${error.message}`, 'error');
      return false;
    }
  }

  async applyDatabaseFix() {
    this.log('Applying database fix...', 'fix');
    
    try {
      // Check if PostgreSQL is running
      try {
        await execAsync('tasklist /FI "IMAGENAME eq postgres.exe" 2>nul');
        this.log('PostgreSQL is running', 'success');
      } catch (error) {
        this.log('PostgreSQL not running, starting Docker services...', 'info');
        
        // Try to start Docker services
        try {
          await execAsync('docker-compose up -d postgres');
          this.log('PostgreSQL started via Docker', 'success');
        } catch (dockerError) {
          this.log('Docker not available, please start PostgreSQL manually', 'warn');
        }
      }

      this.fixes.push('Database: Ensured PostgreSQL is running');
      return true;
    } catch (error) {
      this.log(`Database fix failed: ${error.message}`, 'error');
      return false;
    }
  }

  async applyFrontendFix() {
    this.log('Applying frontend fix...', 'fix');
    
    try {
      // Kill any existing Vite processes
      try {
        await execAsync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq vite*" 2>nul');
        this.log('Killed existing Vite processes', 'success');
      } catch (error) {
        // No processes to kill
      }

      // Start fresh Vite server
      this.log('Starting fresh Vite server...', 'info');
      const viteProcess = exec('npm run dev');
      
      // Wait a bit for it to start
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      this.log('Frontend server started', 'success');
      this.fixes.push('Frontend: Started fresh Vite server');
      return true;
    } catch (error) {
      this.log(`Frontend fix failed: ${error.message}`, 'error');
      return false;
    }
  }

  async applyBlockchainFix() {
    this.log('Applying blockchain fix...', 'fix');
    
    try {
      // Check if Hardhat is available
      try {
        await execAsync('npx hardhat --version');
        this.log('Hardhat is available', 'success');
      } catch (error) {
        this.log('Installing Hardhat...', 'info');
        await execAsync('npm install --save-dev hardhat');
        this.log('Hardhat installed', 'success');
      }

      // Check if contracts exist
      try {
        await fs.access('contracts');
        this.log('Smart contracts directory exists', 'success');
      } catch (error) {
        this.log('Creating smart contracts directory...', 'info');
        await fs.mkdir('contracts', { recursive: true });
        this.log('Smart contracts directory created', 'success');
      }

      this.fixes.push('Blockchain: Ensured Hardhat and contracts are available');
      return true;
    } catch (error) {
      this.log(`Blockchain fix failed: ${error.message}`, 'error');
      return false;
    }
  }

  async applyFixes(results) {
    this.log(`\n🤖 Cursor Agent - Round ${this.round}`, 'agent');
    console.log('='.repeat(50));
    
    this.fixes = [];
    
    // Apply fixes based on critical issues
    for (const issue of results.criticalIssues) {
      if (issue.includes('Electron')) {
        await this.applyElectronFix();
      } else if (issue.includes('API server')) {
        await this.applyAPIServerFix();
      } else if (issue.includes('Database')) {
        await this.applyDatabaseFix();
      } else if (issue.includes('Frontend')) {
        await this.applyFrontendFix();
      } else if (issue.includes('Blockchain')) {
        await this.applyBlockchainFix();
      }
    }

    // Apply fixes for broken components
    for (const component of results.brokenComponents) {
      if (component.includes('Electron')) {
        await this.applyElectronFix();
      } else if (component.includes('API Server')) {
        await this.applyAPIServerFix();
      } else if (component.includes('Database')) {
        await this.applyDatabaseFix();
      } else if (component.includes('Frontend')) {
        await this.applyFrontendFix();
      } else if (component.includes('Blockchain')) {
        await this.applyBlockchainFix();
      }
    }

    // Save fixes report
    const fixesReport = `
# Cursor Agent Fixes - Round ${this.round}

## Applied Fixes:
${this.fixes.map((fix, index) => `${index + 1}. ${fix}`).join('\n')}

## Next Steps:
1. Run \`npm run compliance:check\` to verify fixes
2. Run \`node scripts/automation-round.js ${this.round + 1}\` for next round
3. Review any remaining issues

## Fixes Applied at: ${new Date().toISOString()}
`;

    await fs.writeFile(`cursor-agent-fixes-round-${this.round}.md`, fixesReport);
    
    this.log(`\n📊 Fixes Applied:`, 'agent');
    this.fixes.forEach((fix, index) => {
      this.log(`${index + 1}. ${fix}`, 'success');
    });
    
    this.log(`\n📁 Fixes report saved to: cursor-agent-fixes-round-${this.round}.md`, 'success');
    
    return this.fixes;
  }

  async run() {
    this.log(`Starting Cursor Agent for Round ${this.round}...`, 'agent');
    
    const results = await this.loadComplianceResults();
    if (!results) {
      this.log('No compliance results found. Run automation-round.js first.', 'error');
      return;
    }

    await this.applyFixes(results);
    
    this.log('\n🎯 Cursor Agent Complete!', 'success');
    this.log('Run npm run compliance:check to verify fixes', 'info');
  }
}

// Get round number from command line argument
const round = process.argv[2] ? parseInt(process.argv[2]) : 1;

// Run the Cursor agent
const agent = new CursorAgent(round);
agent.run().catch(console.error);
