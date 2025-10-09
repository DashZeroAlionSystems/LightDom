#!/usr/bin/env node

/**
 * Automation Round System
 * Runs one round of compliance check, generates prompts, and prepares for fixes
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execAsync = promisify(exec);

class AutomationRound {
  constructor(round = 1) {
    this.round = round;
    this.results = {
      passed: 0,
      failed: 0,
      critical: 0,
      total: 0
    };
    this.criticalIssues = [];
    this.workingComponents = [];
    this.brokenComponents = [];
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
    this.log(`Running compliance check (Round ${this.round})...`, 'round');
    
    try {
      const { stdout } = await execAsync('npm run compliance:check');
      this.parseComplianceResults(stdout);
      return stdout;
    } catch (error) {
      this.log(`Compliance check failed: ${error.message}`, 'error');
      return error.stdout || '';
    }
  }

  parseComplianceResults(output) {
    this.results = { passed: 0, failed: 0, critical: 0, total: 0 };
    this.criticalIssues = [];
    this.workingComponents = [];
    this.brokenComponents = [];

    const lines = output.split('\n');
    let currentTest = '';
    
    for (const line of lines) {
      if (line.includes('Testing')) {
        currentTest = line.replace(/✅|❌|🚨/g, '').trim();
      }
      
      if (line.includes('🚨 CRITICAL:')) {
        const issue = line.replace(/🚨 CRITICAL:/g, '').trim();
        this.criticalIssues.push(issue);
        this.brokenComponents.push(currentTest);
        this.results.critical++;
      } else if (line.includes('✓')) {
        this.workingComponents.push(currentTest);
        this.results.passed++;
      } else if (line.includes('❌')) {
        this.brokenComponents.push(currentTest);
        this.results.failed++;
      }
    }
    
    this.results.total = this.results.passed + this.results.failed + this.results.critical;
  }

  generateMermaidChart() {
    const mermaid = `
graph TD
    A[LightDom System] --> B[Frontend]
    A --> C[API Server]
    A --> D[Electron App]
    A --> E[Database]
    A --> F[Blockchain]
    A --> G[Web Crawler]
    
    ${this.generateComponentStatus('B', 'Frontend', 'Frontend')}
    ${this.generateComponentStatus('C', 'API Server', 'API Server')}
    ${this.generateComponentStatus('D', 'Electron App', 'Electron')}
    ${this.generateComponentStatus('E', 'Database', 'Database')}
    ${this.generateComponentStatus('F', 'Blockchain', 'Blockchain')}
    ${this.generateComponentStatus('G', 'Web Crawler', 'Web Crawler')}
    
    H[Round ${this.round} Results] --> I[Passed: ${this.results.passed}]
    H --> J[Failed: ${this.results.failed}]
    H --> K[Critical: ${this.results.critical}]
    
    style A fill:#2d3748,stroke:#4a5568,color:#fff
    style H fill:#2b6cb0,stroke:#3182ce,color:#fff
    ${this.generateStyleClasses()}
`;

    return mermaid;
  }

  generateComponentStatus(id, name, testName) {
    const isWorking = this.workingComponents.includes(testName);
    const isBroken = this.brokenComponents.includes(testName);
    
    if (isWorking) {
      return `${id}["✅ ${name}<br/>Status: Working"]`;
    } else if (isBroken) {
      return `${id}["❌ ${name}<br/>Status: Broken"]`;
    } else {
      return `${id}["⚠️ ${name}<br/>Status: Unknown"]`;
    }
  }

  generateStyleClasses() {
    let styles = '';
    
    this.workingComponents.forEach(component => {
      const id = this.getComponentId(component);
      styles += `\n    style ${id} fill:#38a169,stroke:#2f855a,color:#fff`;
    });
    
    this.brokenComponents.forEach(component => {
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

  generateCursorPrompt() {
    const mermaidChart = this.generateMermaidChart();
    
    const prompt = `# LightDom System Fix Round ${this.round}

## Current System Status

### Mermaid System Diagram:
\`\`\`mermaid
${mermaidChart}
\`\`\`

## Critical Issues Found:
${this.criticalIssues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')}

## Working Components:
${this.workingComponents.map(comp => `✅ ${comp}`).join('\n')}

## Broken Components:
${this.brokenComponents.map(comp => `❌ ${comp}`).join('\n')}

## Fix Priority:
1. **CRITICAL ISSUES** (${this.results.critical}): These break the entire system
2. **FAILED COMPONENTS** (${this.results.failed}): These need immediate attention
3. **WORKING COMPONENTS** (${this.results.passed}): Keep these stable

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

  async runRound() {
    this.log(`\n🔄 Starting Automation Round ${this.round}`, 'round');
    console.log('='.repeat(60));
    
    // Step 1: Run compliance check
    const complianceOutput = await this.runComplianceCheck();
    
    // Step 2: Generate Mermaid chart
    const mermaidChart = this.generateMermaidChart();
    
    // Step 3: Generate Cursor prompt
    const prompt = this.generateCursorPrompt();
    
    // Step 4: Save all files
    await fs.writeFile(`system-status-round-${this.round}.md`, `
# System Status - Round ${this.round}

## Mermaid Chart
\`\`\`mermaid
${mermaidChart}
\`\`\`

## Compliance Results
\`\`\`
${complianceOutput}
\`\`\`

## Critical Issues
${this.criticalIssues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')}

## Working Components
${this.workingComponents.map(comp => `✅ ${comp}`).join('\n')}

## Broken Components
${this.brokenComponents.map(comp => `❌ ${comp}`).join('\n')}
`);
    
    await fs.writeFile(`cursor-prompt-round-${this.round}.md`, prompt);
    
    // Step 5: Show results
    this.log(`\n📊 Round ${this.round} Results:`, 'round');
    console.log(`✅ Working: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`🚨 Critical: ${this.results.critical}`);
    console.log(`📈 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    this.log(`\n📁 Files Generated:`, 'success');
    this.log(`- system-status-round-${this.round}.md`, 'info');
    this.log(`- cursor-prompt-round-${this.round}.md`, 'info');
    
    this.log(`\n🔧 Next Steps:`, 'automation');
    this.log('1. Review the generated files', 'info');
    this.log('2. Apply the fixes from cursor-prompt-round-' + this.round + '.md', 'info');
    this.log('3. Run: node scripts/automation-round.js ' + (this.round + 1), 'info');
    
    return {
      round: this.round,
      results: this.results,
      criticalIssues: this.criticalIssues,
      workingComponents: this.workingComponents,
      brokenComponents: this.brokenComponents,
      mermaidChart,
      prompt
    };
  }
}

// Get round number from command line argument
const round = process.argv[2] ? parseInt(process.argv[2]) : 1;

// Run the automation round
const automation = new AutomationRound(round);
automation.runRound().catch(console.error);
