#!/usr/bin/env node

/**
 * Master Automation Script
 * Orchestrates the complete automation system
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

class MasterAutomation {
  constructor() {
    this.round = 1;
    this.maxRounds = 5;
    this.history = [];
  }

  log(message, type = 'info') {
    const prefix = {
      info: '✅',
      error: '❌',
      critical: '🚨',
      success: '🎉',
      automation: '🤖',
      round: '🔄',
      master: '🎯'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  async runComplianceCheck() {
    this.log('Running compliance check...', 'automation');
    
    try {
      const { stdout } = await execAsync('npm run compliance:check');
      return stdout;
    } catch (error) {
      this.log(`Compliance check failed: ${error.message}`, 'error');
      return error.stdout || '';
    }
  }

  async runAutomationRound() {
    this.log(`\n🔄 Running Automation Round ${this.round}`, 'round');
    console.log('='.repeat(60));
    
    try {
      // Step 1: Run automation round
      this.log('Step 1: Running automation round...', 'info');
      await execAsync(`node scripts/automation-round.js ${this.round}`);
      
      // Step 2: Run Cursor agent
      this.log('Step 2: Running Cursor agent...', 'info');
      await execAsync(`node scripts/cursor-agent.js ${this.round}`);
      
      // Step 3: Wait for user to review fixes
      this.log('\n⏳ Please review the generated files:', 'info');
      this.log(`- system-status-round-${this.round}.md`, 'info');
      this.log(`- cursor-prompt-round-${this.round}.md`, 'info');
      this.log(`- cursor-agent-fixes-round-${this.round}.md`, 'info');
      
      this.log('\n🔧 Apply any additional fixes if needed', 'info');
      this.log('Press Enter when ready to continue to next round...', 'info');
      
      await new Promise(resolve => {
        process.stdin.once('data', () => resolve());
      });
      
      // Step 4: Run compliance check again
      this.log('Step 4: Running compliance check after fixes...', 'info');
      const newResults = await this.runComplianceCheck();
      
      // Step 5: Parse results
      const results = this.parseResults(newResults);
      this.history.push({
        round: this.round,
        results: results,
        timestamp: new Date().toISOString()
      });
      
      // Step 6: Check if we should continue
      if (results.critical === 0 && results.failed === 0) {
        this.log('🎉 All issues resolved!', 'success');
        return false;
      }
      
      if (this.round >= this.maxRounds) {
        this.log(`⚠️ Reached maximum rounds (${this.maxRounds})`, 'warn');
        return false;
      }
      
      this.round++;
      return true;
      
    } catch (error) {
      this.log(`Round ${this.round} failed: ${error.message}`, 'error');
      return false;
    }
  }

  parseResults(output) {
    const results = { passed: 0, failed: 0, critical: 0, total: 0 };
    
    const lines = output.split('\n');
    for (const line of lines) {
      if (line.includes('✅')) results.passed++;
      if (line.includes('❌')) results.failed++;
      if (line.includes('🚨')) results.critical++;
    }
    
    results.total = results.passed + results.failed + results.critical;
    return results;
  }

  async generateFinalReport() {
    this.log('Generating final automation report...', 'master');
    
    const report = `
# LightDom Automation Report

## Summary
- **Total Rounds**: ${this.round - 1}
- **Max Rounds**: ${this.maxRounds}
- **Final Status**: ${this.history.length > 0 ? 'Completed' : 'Failed'}

## Round History
${this.history.map(round => `
### Round ${round.round}
- **Timestamp**: ${round.timestamp}
- **Passed**: ${round.results.passed}
- **Failed**: ${round.results.failed}
- **Critical**: ${round.results.critical}
- **Success Rate**: ${((round.results.passed / round.results.total) * 100).toFixed(1)}%
`).join('\n')}

## Generated Files
${this.history.map(round => `
### Round ${round.round}
- \`system-status-round-${round.round}.md\`
- \`cursor-prompt-round-${round.round}.md\`
- \`cursor-agent-fixes-round-${round.round}.md\`
`).join('\n')}

## Next Steps
1. Review all generated files
2. Apply any remaining manual fixes
3. Run \`npm run compliance:check\` to verify final status
4. Commit changes to git if satisfied

## Automation Completed: ${new Date().toISOString()}
`;

    await fs.writeFile('automation-report.md', report);
    this.log('Final report saved to: automation-report.md', 'success');
  }

  async run() {
    this.log('🚀 Starting Master Automation System', 'master');
    console.log('='.repeat(60));
    
    while (this.round <= this.maxRounds) {
      const shouldContinue = await this.runAutomationRound();
      
      if (!shouldContinue) {
        break;
      }
    }
    
    await this.generateFinalReport();
    
    this.log('\n🎯 Master Automation Complete!', 'success');
    this.log(`Total rounds completed: ${this.round - 1}`, 'info');
    
    if (this.history.length > 0) {
      const finalResults = this.history[this.history.length - 1].results;
      this.log(`Final success rate: ${((finalResults.passed / finalResults.total) * 100).toFixed(1)}%`, 'info');
    }
  }
}

// Run the master automation
const automation = new MasterAutomation();
automation.run().catch(console.error);
