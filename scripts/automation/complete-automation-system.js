#!/usr/bin/env node

/**
 * Complete Automation System for LightDom
 * Orchestrates all automation workflows to completion
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const execAsync = promisify(exec);

class CompleteAutomationSystem {
  constructor() {
    this.config = {
      maxRounds: 10,
      roundDelay: 5000,
      autoFix: true,
      parallelExecution: true,
      services: {
        frontend: { port: 3000, process: null },
        api: { port: 3001, process: null },
        database: { port: 5432, process: null },
        blockchain: { port: 8545, process: null }
      }
    };
    this.results = {
      rounds: [],
      startTime: new Date(),
      endTime: null,
      totalIssuesFixed: 0,
      finalStatus: 'pending'
    };
  }

  // Utility methods
  log(message, type = 'info') {
    const emojis = {
      info: '📝',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      critical: '🚨',
      fix: '🔧',
      test: '🧪',
      deploy: '🚀',
      complete: '🎉',
      round: '🔄',
      automation: '🤖'
    };
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${emojis[type] || '📌'} ${message}`);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async executeCommand(command, options = {}) {
    try {
      const result = await execAsync(command, { cwd: rootDir, ...options });
      return { success: true, output: result.stdout, error: null };
    } catch (error) {
      return { success: false, output: error.stdout || '', error: error.message };
    }
  }

  // Pre-flight checks
  async performPreflightChecks() {
    this.log('Performing pre-flight checks...', 'automation');
    
    const checks = [
      { name: 'Node.js version', command: 'node --version', minVersion: '18' },
      { name: 'npm availability', command: 'npm --version' },
      { name: 'Git status', command: 'git status --porcelain' },
      { name: 'Disk space', command: 'powershell -Command "Get-PSDrive C | Select-Object Free"' }
    ];

    for (const check of checks) {
      const result = await this.executeCommand(check.command);
      if (result.success) {
        this.log(`${check.name}: ${result.output.trim()}`, 'success');
      } else {
        this.log(`${check.name}: Failed - ${result.error}`, 'error');
        if (check.name === 'Git status' && result.output) {
          this.log('Uncommitted changes detected. Creating backup...', 'warning');
          await this.createBackup();
        }
      }
    }
  }

  // Backup system
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(rootDir, `backup_automation_${timestamp}`);
    
    this.log(`Creating backup at: ${backupDir}`, 'info');
    
    try {
      await fs.mkdir(backupDir, { recursive: true });
      
      // Backup critical files
      const filesToBackup = [
        'package.json',
        'package-lock.json',
        '.env',
        'tsconfig.json',
        'vite.config.ts',
        'hardhat.config.js'
      ];
      
      for (const file of filesToBackup) {
        try {
          await fs.copyFile(
            path.join(rootDir, file),
            path.join(backupDir, file)
          );
        } catch (error) {
          // File might not exist
        }
      }
      
      this.log('Backup created successfully', 'success');
      return backupDir;
    } catch (error) {
      this.log(`Backup failed: ${error.message}`, 'error');
      return null;
    }
  }

  // Environment setup
  async setupEnvironment() {
    this.log('Setting up environment...', 'automation');
    
    // Check and create .env if missing
    try {
      await fs.access(path.join(rootDir, '.env'));
      this.log('.env file exists', 'success');
    } catch {
      this.log('Creating .env file...', 'info');
      const envContent = `# LightDom Environment Configuration
NODE_ENV=development
PORT=3000
API_PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/lightdom
BLOCKCHAIN_NETWORK=localhost
BLOCKCHAIN_PORT=8545
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
VITE_API_URL=http://localhost:3001
`;
      await fs.writeFile(path.join(rootDir, '.env'), envContent);
      this.log('.env file created', 'success');
    }

    // Install dependencies if needed
    this.log('Checking dependencies...', 'info');
    const { success } = await this.executeCommand('npm list --depth=0');
    if (!success) {
      this.log('Installing dependencies...', 'info');
      await this.executeCommand('npm install --legacy-peer-deps');
      this.log('Dependencies installed', 'success');
    }
  }

  // Service management
  async startService(name, command, port) {
    this.log(`Starting ${name} service...`, 'automation');
    
    // Check if port is already in use
    const portCheck = await this.executeCommand(`netstat -an | findstr :${port}`);
    if (portCheck.success && portCheck.output.includes('LISTENING')) {
      this.log(`Port ${port} already in use, attempting to free it...`, 'warning');
      await this.executeCommand(`taskkill /F /IM node.exe /FI "COMMANDLINE like %${port}%"`);
      await this.delay(2000);
    }

    // Start the service
    const service = spawn('cmd', ['/c', command], {
      cwd: rootDir,
      stdio: 'pipe',
      shell: true,
      detached: false
    });

    service.stdout.on('data', (data) => {
      this.log(`[${name}] ${data.toString().trim()}`, 'info');
    });

    service.stderr.on('data', (data) => {
      this.log(`[${name}] ERROR: ${data.toString().trim()}`, 'error');
    });

    service.on('error', (error) => {
      this.log(`[${name}] Failed to start: ${error.message}`, 'error');
    });

    this.config.services[name].process = service;
    
    // Wait for service to start
    await this.delay(5000);
    
    // Verify service is running
    const verification = await this.executeCommand(`netstat -an | findstr :${port}`);
    if (verification.success && verification.output.includes('LISTENING')) {
      this.log(`${name} service started successfully on port ${port}`, 'success');
      return true;
    } else {
      this.log(`${name} service failed to start on port ${port}`, 'error');
      return false;
    }
  }

  async startAllServices() {
    this.log('Starting all services...', 'automation');
    
    const services = [
      { name: 'database', command: 'docker-compose up -d postgres redis', port: 5432 },
      { name: 'api', command: 'node api-server-express.js', port: 3001 },
      { name: 'frontend', command: 'npm run dev', port: 3000 },
      { name: 'blockchain', command: 'npx hardhat node', port: 8545 }
    ];

    const results = [];
    for (const service of services) {
      const result = await this.startService(service.name, service.command, service.port);
      results.push({ ...service, success: result });
    }

    return results.every(r => r.success);
  }

  // Compliance testing
  async runComplianceTest() {
    this.log('Running compliance test...', 'test');
    
    const result = await this.executeCommand('npm run compliance:check');
    
    // Parse results
    const output = result.output || result.error || '';
    const results = {
      passed: (output.match(/✅/g) || []).length,
      failed: (output.match(/❌/g) || []).length,
      critical: (output.match(/🚨/g) || []).length,
      total: 0
    };
    results.total = results.passed + results.failed + results.critical;
    
    return { ...results, output };
  }

  // Automated fixing
  async applyAutomatedFixes(issues) {
    this.log('Applying automated fixes...', 'fix');
    
    const fixes = [];
    
    // Fix Electron issues
    if (issues.output.includes('Electron not')) {
      this.log('Fixing Electron...', 'fix');
      await this.executeCommand('npm install -g electron');
      fixes.push('Installed Electron globally');
    }

    // Fix API server issues
    if (issues.output.includes('fake API server')) {
      this.log('Switching to real API server...', 'fix');
      const packageJson = JSON.parse(await fs.readFile(path.join(rootDir, 'package.json'), 'utf8'));
      
      // Update scripts to use real API server
      if (packageJson.scripts) {
        Object.keys(packageJson.scripts).forEach(key => {
          if (packageJson.scripts[key].includes('simple-api-server')) {
            packageJson.scripts[key] = packageJson.scripts[key].replace('simple-api-server', 'api-server-express');
          }
        });
      }
      
      await fs.writeFile(
        path.join(rootDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      fixes.push('Switched to real API server');
    }

    // Fix database connectivity
    if (issues.output.includes('Database')) {
      this.log('Fixing database connection...', 'fix');
      await this.executeCommand('docker-compose up -d postgres');
      fixes.push('Started PostgreSQL via Docker');
    }

    // Fix missing dependencies
    if (issues.output.includes('Cannot find module')) {
      this.log('Installing missing dependencies...', 'fix');
      await this.executeCommand('npm install --legacy-peer-deps');
      fixes.push('Installed missing dependencies');
    }

    return fixes;
  }

  // Main automation round
  async runAutomationRound(roundNumber) {
    this.log(`Starting automation round ${roundNumber}...`, 'round');
    
    const roundResult = {
      round: roundNumber,
      startTime: new Date(),
      endTime: null,
      complianceResults: null,
      fixes: [],
      success: false
    };

    // Run compliance test
    const testResults = await this.runComplianceTest();
    roundResult.complianceResults = testResults;
    
    this.log(`Round ${roundNumber} Results:`, 'info');
    this.log(`✅ Passed: ${testResults.passed}`, 'success');
    this.log(`❌ Failed: ${testResults.failed}`, 'error');
    this.log(`🚨 Critical: ${testResults.critical}`, 'critical');
    
    // Check if all tests pass
    if (testResults.failed === 0 && testResults.critical === 0) {
      this.log('All tests passed!', 'complete');
      roundResult.success = true;
      roundResult.endTime = new Date();
      return roundResult;
    }

    // Apply automated fixes
    if (this.config.autoFix) {
      const fixes = await this.applyAutomatedFixes(testResults);
      roundResult.fixes = fixes;
      this.results.totalIssuesFixed += fixes.length;
      
      if (fixes.length > 0) {
        this.log(`Applied ${fixes.length} fixes:`, 'fix');
        fixes.forEach(fix => this.log(`  - ${fix}`, 'success'));
        
        // Wait before next test
        await this.delay(this.config.roundDelay);
      }
    }

    roundResult.endTime = new Date();
    return roundResult;
  }

  // Main orchestration
  async orchestrate() {
    this.log('🚀 Starting Complete Automation System', 'deploy');
    this.log('=' .repeat(60), 'info');
    
    try {
      // Pre-flight checks
      await this.performPreflightChecks();
      
      // Setup environment
      await this.setupEnvironment();
      
      // Start services
      const servicesStarted = await this.startAllServices();
      if (!servicesStarted) {
        this.log('Failed to start all services', 'error');
        return false;
      }
      
      // Run automation rounds
      let allTestsPass = false;
      for (let round = 1; round <= this.config.maxRounds; round++) {
        const roundResult = await this.runAutomationRound(round);
        this.results.rounds.push(roundResult);
        
        if (roundResult.success) {
          allTestsPass = true;
          break;
        }
        
        // Don't continue if no fixes were applied
        if (roundResult.fixes.length === 0) {
          this.log('No automated fixes available, manual intervention required', 'warning');
          break;
        }
      }
      
      // Generate final report
      await this.generateFinalReport(allTestsPass);
      
      // Cleanup
      await this.cleanup();
      
      this.results.endTime = new Date();
      this.results.finalStatus = allTestsPass ? 'success' : 'partial';
      
      return allTestsPass;
      
    } catch (error) {
      this.log(`Automation failed: ${error.message}`, 'error');
      this.results.finalStatus = 'failed';
      await this.cleanup();
      return false;
    }
  }

  // Report generation
  async generateFinalReport(success) {
    this.log('Generating final report...', 'automation');
    
    const duration = (this.results.endTime || new Date()) - this.results.startTime;
    const durationMinutes = Math.round(duration / 1000 / 60);
    
    const report = `# LightDom Complete Automation Report

## Summary
- **Status**: ${success ? '✅ SUCCESS' : '⚠️ PARTIAL SUCCESS'}
- **Total Rounds**: ${this.results.rounds.length}
- **Total Fixes Applied**: ${this.results.totalIssuesFixed}
- **Duration**: ${durationMinutes} minutes
- **Timestamp**: ${new Date().toISOString()}

## Round Details
${this.results.rounds.map(round => `
### Round ${round.round}
- **Duration**: ${Math.round((round.endTime - round.startTime) / 1000)}s
- **Tests Passed**: ${round.complianceResults.passed}
- **Tests Failed**: ${round.complianceResults.failed}
- **Critical Issues**: ${round.complianceResults.critical}
- **Fixes Applied**: ${round.fixes.length}
${round.fixes.map(fix => `  - ${fix}`).join('\n')}
`).join('\n')}

## Final Status
${success ? 
  '✅ All tests are now passing. The LightDom system is fully operational!' : 
  '⚠️ Some tests are still failing. Manual intervention may be required.'}

## Next Steps
${success ? 
  `1. Run \`npm run build\` to create production build
2. Run \`npm run test\` to verify all tests pass
3. Deploy using \`npm run deploy\`
4. Monitor logs for any issues` :
  `1. Review the remaining issues in the compliance test
2. Apply manual fixes as needed
3. Re-run the automation system: \`npm run automation:complete\`
4. Check logs for detailed error information`}

## Service Status
- Frontend: ${this.config.services.frontend.process ? '✅ Running' : '❌ Stopped'}
- API: ${this.config.services.api.process ? '✅ Running' : '❌ Stopped'}
- Database: ${this.config.services.database.process ? '✅ Running' : '❌ Stopped'}
- Blockchain: ${this.config.services.blockchain.process ? '✅ Running' : '❌ Stopped'}

---
Generated by LightDom Complete Automation System
`;

    await fs.writeFile(
      path.join(rootDir, `automation-complete-report-${Date.now()}.md`),
      report
    );
    
    this.log('Report saved', 'success');
  }

  // Cleanup
  async cleanup() {
    this.log('Cleaning up...', 'automation');
    
    // Stop services
    for (const [name, config] of Object.entries(this.config.services)) {
      if (config.process) {
        this.log(`Stopping ${name} service...`, 'info');
        try {
          config.process.kill();
        } catch (error) {
          // Process might already be dead
        }
      }
    }
    
    // Clear temporary files
    const tempFiles = [
      'cursor-prompt-round-*.md',
      'system-status-round-*.md',
      'cursor-agent-fixes-round-*.md'
    ];
    
    for (const pattern of tempFiles) {
      const files = await fs.readdir(rootDir);
      const matches = files.filter(f => f.match(new RegExp(pattern.replace('*', '.*'))));
      for (const file of matches) {
        try {
          await fs.unlink(path.join(rootDir, file));
        } catch (error) {
          // File might not exist
        }
      }
    }
    
    this.log('Cleanup complete', 'success');
  }
}

// Run the complete automation system
async function main() {
  const automation = new CompleteAutomationSystem();
  
  try {
    const success = await automation.orchestrate();
    
    if (success) {
      automation.log('🎉 Complete Automation System finished successfully!', 'complete');
      process.exit(0);
    } else {
      automation.log('⚠️ Automation completed with some issues remaining', 'warning');
      process.exit(1);
    }
  } catch (error) {
    automation.log(`Fatal error: ${error.message}`, 'critical');
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Automation interrupted by user');
  const automation = new CompleteAutomationSystem();
  await automation.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Automation terminated');
  const automation = new CompleteAutomationSystem();
  await automation.cleanup();
  process.exit(0);
});

// Execute
main().catch(console.error);
