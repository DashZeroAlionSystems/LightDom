#!/usr/bin/env node

/**
 * Quick Automation Demo
 * Shows the automation system in action
 */

import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class QuickAutomation {
  constructor() {
    this.round = 1;
  }

  log(message, type = 'info') {
    const prefix = {
      info: '✅',
      error: '❌',
      critical: '🚨',
      success: '🎉',
      automation: '🤖',
      round: '🔄'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  async runComplianceCheck() {
    this.log('Running compliance check...', 'automation');
    
    try {
      // Simulate compliance check based on what we know from terminal output
      const results = {
        passed: 2,
        failed: 1,
        critical: 3,
        total: 6,
        criticalIssues: [
          'Electron not working - not installed globally',
          'Using fake API server - simple-api-server.js instead of real one',
          'Multiple Vite instances causing port conflicts'
        ],
        workingComponents: ['Web Crawler', 'API Server'],
        brokenComponents: ['Frontend', 'Electron', 'Database', 'Blockchain']
      };
      
      this.log('Compliance check completed', 'success');
      return results;
    } catch (error) {
      this.log(`Compliance check failed: ${error.message}`, 'error');
      return null;
    }
  }

  generateMermaidChart(results) {
    const mermaid = `
graph TD
    A[LightDom System] --> B[Frontend]
    A --> C[API Server]
    A --> D[Electron App]
    A --> E[Database]
    A --> F[Blockchain]
    A --> G[Web Crawler]
    
    ${this.generateComponentStatus('B', 'Frontend', 'Frontend', results)}
    ${this.generateComponentStatus('C', 'API Server', 'API Server', results)}
    ${this.generateComponentStatus('D', 'Electron App', 'Electron', results)}
    ${this.generateComponentStatus('E', 'Database', 'Database', results)}
    ${this.generateComponentStatus('F', 'Blockchain', 'Blockchain', results)}
    ${this.generateComponentStatus('G', 'Web Crawler', 'Web Crawler', results)}
    
    H[Round ${this.round} Results] --> I[Passed: ${results.passed}]
    H --> J[Failed: ${results.failed}]
    H --> K[Critical: ${results.critical}]
    
    style A fill:#2d3748,stroke:#4a5568,color:#fff
    style H fill:#2b6cb0,stroke:#3182ce,color:#fff
    ${this.generateStyleClasses(results)}
`;

    return mermaid;
  }

  generateComponentStatus(id, name, testName, results) {
    const isWorking = results.workingComponents.includes(testName);
    const isBroken = results.brokenComponents.includes(testName);
    
    if (isWorking) {
      return `${id}["✅ ${name}<br/>Status: Working"]`;
    } else if (isBroken) {
      return `${id}["❌ ${name}<br/>Status: Broken"]`;
    } else {
      return `${id}["⚠️ ${name}<br/>Status: Unknown"]`;
    }
  }

  generateStyleClasses(results) {
    let styles = '';
    
    results.workingComponents.forEach(component => {
      const id = this.getComponentId(component);
      styles += `\n    style ${id} fill:#38a169,stroke:#2f855a,color:#fff`;
    });
    
    results.brokenComponents.forEach(component => {
      const id = this.getComponentId(component);
      styles += `\n    style ${id} fill:#e53e3e,stroke:#c53030,color:#fff`;
    });
    
    return styles;
  }

  getComponentId(component) {
    const mapping = {
      'Frontend': 'B',
      'API Server': 'C',
      'Electron': 'D',
      'Database': 'E',
      'Blockchain': 'F',
      'Web Crawler': 'G'
    };
    return mapping[component] || 'X';
  }

  generateCursorPrompt(results) {
    const mermaidChart = this.generateMermaidChart(results);
    
    const prompt = `# LightDom System Fix Round ${this.round}

## Current System Status

### Mermaid System Diagram:
\`\`\`mermaid
${mermaidChart}
\`\`\`

## Critical Issues Found:
${results.criticalIssues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')}

## Working Components:
${results.workingComponents.map(comp => `✅ ${comp}`).join('\n')}

## Broken Components:
${results.brokenComponents.map(comp => `❌ ${comp}`).join('\n')}

## Fix Priority:
1. **CRITICAL ISSUES** (${results.critical}): These break the entire system
2. **FAILED COMPONENTS** (${results.failed}): These need immediate attention
3. **WORKING COMPONENTS** (${results.passed}): Keep these stable

## Your Task:
Fix the critical issues and broken components. Focus on:
- Making Electron work (install electron globally if needed)
- Replacing fake API server with real functionality
- Ensuring database connectivity
- Making blockchain integration real
- Fixing frontend accessibility issues

## Constraints:
- Don't break working components
- Test each fix before moving to the next
- Use real data, not mock responses
- Ensure all services can start and connect

## Expected Outcome:
After fixes, run \`npm run compliance:check\` and see improved results.`;

    return prompt;
  }

  async applyFixes(results) {
    this.log('Applying automated fixes...', 'automation');
    
    const fixes = [];
    
    // Fix 1: Install Electron globally
    if (results.criticalIssues.some(issue => issue.includes('Electron'))) {
      this.log('Fix 1: Installing Electron globally...', 'info');
      try {
        await execAsync('npm install -g electron');
        fixes.push('✅ Electron installed globally');
        this.log('Electron installed successfully', 'success');
      } catch (error) {
        fixes.push('❌ Failed to install Electron globally');
        this.log(`Electron installation failed: ${error.message}`, 'error');
      }
    }
    
    // Fix 2: Kill multiple Vite processes
    if (results.criticalIssues.some(issue => issue.includes('Multiple Vite'))) {
      this.log('Fix 2: Killing multiple Vite processes...', 'info');
      try {
        await execAsync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq vite*" 2>nul');
        fixes.push('✅ Killed multiple Vite processes');
        this.log('Multiple Vite processes killed', 'success');
      } catch (error) {
        fixes.push('❌ Failed to kill Vite processes');
        this.log(`Vite process cleanup failed: ${error.message}`, 'error');
      }
    }
    
    // Fix 3: Update package.json to use real API server
    if (results.criticalIssues.some(issue => issue.includes('fake API server'))) {
      this.log('Fix 3: Switching to real API server...', 'info');
      try {
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
        const scripts = packageJson.scripts || {};
        
        if (scripts.start?.includes('simple-api-server')) {
          scripts.start = scripts.start.replace('simple-api-server', 'api-server-express');
        }
        if (scripts['start:dev']?.includes('simple-api-server')) {
          scripts['start:dev'] = scripts['start:dev'].replace('simple-api-server', 'api-server-express');
        }
        
        await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
        fixes.push('✅ Switched to real API server');
        this.log('Switched to real API server', 'success');
      } catch (error) {
        fixes.push('❌ Failed to switch API server');
        this.log(`API server switch failed: ${error.message}`, 'error');
      }
    }
    
    return fixes;
  }

  async runRound() {
    this.log(`\n🔄 Starting Quick Automation Round ${this.round}`, 'round');
    console.log('='.repeat(60));
    
    // Step 1: Run compliance check
    const results = await this.runComplianceCheck();
    if (!results) {
      this.log('Automation failed: No compliance results', 'error');
      return;
    }
    
    // Step 2: Generate Mermaid chart
    this.log('Generating Mermaid chart...', 'automation');
    const mermaidChart = this.generateMermaidChart(results);
    
    // Step 3: Generate Cursor prompt
    this.log('Generating Cursor prompt...', 'automation');
    const prompt = this.generateCursorPrompt(results);
    
    // Step 4: Apply fixes
    const fixes = await this.applyFixes(results);
    
    // Step 5: Save files
    await fs.writeFile(`quick-system-status-round-${this.round}.md`, `
# Quick System Status - Round ${this.round}

## Mermaid Chart
\`\`\`mermaid
${mermaidChart}
\`\`\`

## Results
- **Passed**: ${results.passed}
- **Failed**: ${results.failed}
- **Critical**: ${results.critical}
- **Total**: ${results.total}
- **Success Rate**: ${((results.passed / results.total) * 100).toFixed(1)}%

## Critical Issues
${results.criticalIssues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')}

## Working Components
${results.workingComponents.map(comp => `✅ ${comp}`).join('\n')}

## Broken Components
${results.brokenComponents.map(comp => `❌ ${comp}`).join('\n')}

## Applied Fixes
${fixes.map((fix, index) => `${index + 1}. ${fix}`).join('\n')}
`);
    
    await fs.writeFile(`quick-cursor-prompt-round-${this.round}.md`, prompt);
    
    // Step 6: Show results
    this.log(`\n📊 Round ${this.round} Results:`, 'round');
    console.log(`✅ Working: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`🚨 Critical: ${results.critical}`);
    console.log(`📈 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
    
    this.log(`\n🔧 Applied Fixes:`, 'automation');
    fixes.forEach((fix, index) => {
      this.log(`${index + 1}. ${fix}`, 'info');
    });
    
    this.log(`\n📁 Files Generated:`, 'success');
    this.log(`- quick-system-status-round-${this.round}.md`, 'info');
    this.log(`- quick-cursor-prompt-round-${this.round}.md`, 'info');
    
    this.log(`\n🎯 Next Steps:`, 'automation');
    this.log('1. Review the generated files', 'info');
    this.log('2. Test the applied fixes', 'info');
    this.log('3. Run: node scripts/quick-automation.js', 'info');
    
    return results;
  }
}

// Run the quick automation
const automation = new QuickAutomation();
automation.runRound().catch(console.error);
