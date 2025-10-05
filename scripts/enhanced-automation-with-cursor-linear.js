#!/usr/bin/env node

/**
 * Enhanced Automation System with Cursor Background Agent and Linear Integration
 * Provides actionable advice, shows actual fixes, and integrates with external tools
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

class EnhancedAutomationWithCursorLinear {
  constructor() {
    this.round = 1;
    this.results = {
      issues: [],
      fixes: [],
      recommendations: [],
      cursorAgentTasks: [],
      linearIssues: []
    };
    this.cursorApiKey = process.env.CURSOR_API_KEY;
    this.linearApiKey = process.env.LINEAR_API_KEY;
  }

  log(message, type = 'info') {
    const prefix = {
      info: '✅',
      error: '❌',
      critical: '🚨',
      success: '🎉',
      automation: '🤖',
      cursor: '🎯',
      linear: '📋',
      fix: '🔧'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  // =====================================================
  // CURSOR BACKGROUND AGENT INTEGRATION
  // =====================================================

  async setupCursorEnvironment() {
    this.log('Setting up Cursor environment configuration...', 'cursor');
    
    const environmentConfig = {
      "snapshot": "POPULATED_FROM_SETTINGS",
      "install": "npm install && npm install -g electron",
      "start": "sudo service docker start",
      "terminals": [
        {
          "name": "API Server",
          "command": "node simple-api-server.js"
        },
        {
          "name": "Frontend Dev",
          "command": "npm run dev"
        },
        {
          "name": "Electron App",
          "command": "electron . --dev"
        },
        {
          "name": "Database",
          "command": "docker-compose up -d postgres redis"
        }
      ]
    };

    await fs.mkdir('.cursor', { recursive: true });
    await fs.writeFile('.cursor/environment.json', JSON.stringify(environmentConfig, null, 2));
    
    this.log('Cursor environment configuration created', 'cursor');
  }

  async launchCursorAgent(task, priority = 'medium') {
    if (!this.cursorApiKey) {
      this.log('Cursor API key not found. Set CURSOR_API_KEY environment variable.', 'error');
      return null;
    }

    this.log(`Launching Cursor agent for: ${task}`, 'cursor');
    
    const agentPayload = {
      "prompt": {
        "text": task
      },
      "source": {
        "repository": "file://" + process.cwd(),
        "ref": "main"
      },
      "priority": priority
    };

    try {
      const response = await fetch('https://api.cursor.com/v0/agents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.cursorApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(agentPayload)
      });

      if (response.ok) {
        const result = await response.json();
        this.results.cursorAgentTasks.push({
          task,
          priority,
          agentId: result.id,
          status: 'launched',
          timestamp: new Date().toISOString()
        });
        this.log(`Cursor agent launched successfully: ${result.id}`, 'cursor');
        return result;
      } else {
        this.log(`Failed to launch Cursor agent: ${response.statusText}`, 'error');
        return null;
      }
    } catch (error) {
      this.log(`Cursor agent launch failed: ${error.message}`, 'error');
      return null;
    }
  }

  // =====================================================
  // LINEAR INTEGRATION
  // =====================================================

  async setupLinearClient() {
    if (!this.linearApiKey) {
      this.log('Linear API key not found. Set LINEAR_API_KEY environment variable.', 'error');
      return null;
    }

    try {
      // Install Linear SDK if not already installed
      await execAsync('npm install @linear/sdk');
      
      const { LinearClient } = await import('@linear/sdk');
      const client = new LinearClient({
        apiKey: this.linearApiKey
      });
      
      this.log('Linear client initialized successfully', 'linear');
      return client;
    } catch (error) {
      this.log(`Failed to setup Linear client: ${error.message}`, 'error');
      return null;
    }
  }

  async createLinearIssue(title, description, priority = 'Medium', teamId = null) {
    const client = await this.setupLinearClient();
    if (!client) return null;

    try {
      // Get teams if teamId not provided
      if (!teamId) {
        const teams = await client.teams();
        teamId = teams.nodes[0]?.id;
      }

      const issue = await client.createIssue({
        teamId,
        title,
        description,
        priority: priority.toLowerCase(),
        labels: ['automation', 'lightdom']
      });

      this.results.linearIssues.push({
        title,
        description,
        priority,
        issueId: issue.id,
        status: 'created',
        timestamp: new Date().toISOString()
      });

      this.log(`Linear issue created: ${issue.id}`, 'linear');
      return issue;
    } catch (error) {
      this.log(`Failed to create Linear issue: ${error.message}`, 'error');
      return null;
    }
  }

  // =====================================================
  // ENHANCED ISSUE DETECTION AND FIXES
  // =====================================================

  async detectAndFixIssues() {
    this.log('Detecting and fixing issues...', 'automation');
    
    const issues = await this.detectIssues();
    const fixes = await this.applyFixes(issues);
    const recommendations = await this.generateRecommendations(issues, fixes);
    
    this.results.issues = issues;
    this.results.fixes = fixes;
    this.results.recommendations = recommendations;
    
    return { issues, fixes, recommendations };
  }

  async detectIssues() {
    const issues = [];
    
    // Issue 1: Electron not working
    try {
      await execAsync('electron --version');
    } catch (error) {
      issues.push({
        id: 'electron-not-installed',
        type: 'critical',
        title: 'Electron not installed globally',
        description: 'Electron is not available in PATH, preventing the desktop app from running.',
        impact: 'Desktop application cannot start',
        solution: 'Install Electron globally using npm install -g electron',
        command: 'npm install -g electron',
        estimatedTime: '2 minutes'
      });
    }

    // Issue 2: Multiple Vite instances
    try {
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV');
      const nodeProcesses = (stdout.match(/node\.exe/g) || []).length;
      if (nodeProcesses > 5) {
        issues.push({
          id: 'multiple-vite-instances',
          type: 'warning',
          title: 'Multiple Vite instances running',
          description: `${nodeProcesses} Node.js processes detected, causing port conflicts.`,
          impact: 'Port conflicts and resource waste',
          solution: 'Kill unnecessary Node.js processes',
          command: 'taskkill /F /IM node.exe /FI "WINDOWTITLE eq vite*"',
          estimatedTime: '1 minute'
        });
      }
    } catch (error) {
      // Process check failed, continue
    }

    // Issue 3: Database not running
    try {
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq postgres.exe" 2>nul || echo "No PostgreSQL"');
      if (!stdout.includes('postgres.exe')) {
        issues.push({
          id: 'database-not-running',
          type: 'critical',
          title: 'PostgreSQL database not running',
          description: 'PostgreSQL service is not running, preventing database operations.',
          impact: 'Database operations will fail',
          solution: 'Start PostgreSQL service or use Docker',
          command: 'docker-compose up -d postgres',
          estimatedTime: '3 minutes'
        });
      }
    } catch (error) {
      // Process check failed, continue
    }

    // Issue 4: API server using mock data
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        const data = await response.json();
        if (data.environment === 'mock') {
          issues.push({
            id: 'mock-api-server',
            type: 'warning',
            title: 'API server using mock data',
            description: 'API server is returning mock data instead of real functionality.',
            impact: 'Limited functionality and testing',
            solution: 'Switch to real API server implementation',
            command: 'Update package.json scripts to use api-server-express.js',
            estimatedTime: '5 minutes'
          });
        }
      }
    } catch (error) {
      // API check failed, continue
    }

    return issues;
  }

  async applyFixes(issues) {
    const fixes = [];
    
    for (const issue of issues) {
      this.log(`Applying fix for: ${issue.title}`, 'fix');
      
      try {
        if (issue.command) {
          await execAsync(issue.command);
          fixes.push({
            issueId: issue.id,
            title: issue.title,
            command: issue.command,
            status: 'applied',
            timestamp: new Date().toISOString(),
            estimatedTime: issue.estimatedTime
          });
          this.log(`✅ Fixed: ${issue.title}`, 'success');
        }
      } catch (error) {
        fixes.push({
          issueId: issue.id,
          title: issue.title,
          command: issue.command,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString(),
          estimatedTime: issue.estimatedTime
        });
        this.log(`❌ Failed to fix: ${issue.title} - ${error.message}`, 'error');
      }
    }
    
    return fixes;
  }

  async generateRecommendations(issues, fixes) {
    const recommendations = [];
    
    // Recommendation 1: Set up proper development environment
    if (issues.some(i => i.type === 'critical')) {
      recommendations.push({
        priority: 'high',
        category: 'Environment Setup',
        title: 'Set up complete development environment',
        description: 'Install all required dependencies and services for full functionality.',
        steps: [
          'Install Electron globally: npm install -g electron',
          'Start PostgreSQL: docker-compose up -d postgres',
          'Start Redis: docker-compose up -d redis',
          'Install all dependencies: npm install'
        ],
        estimatedTime: '10 minutes',
        impact: 'Enables full application functionality'
      });
    }

    // Recommendation 2: Implement proper error handling
    recommendations.push({
      priority: 'medium',
      category: 'Code Quality',
      title: 'Implement comprehensive error handling',
      description: 'Add proper error handling and logging throughout the application.',
      steps: [
        'Add try-catch blocks to all async operations',
        'Implement proper logging with Winston',
        'Add error boundaries in React components',
        'Set up error monitoring with Sentry'
      ],
      estimatedTime: '30 minutes',
      impact: 'Improves application stability and debugging'
    });

    // Recommendation 3: Set up automated testing
    recommendations.push({
      priority: 'medium',
      category: 'Testing',
      title: 'Implement automated testing pipeline',
      description: 'Set up comprehensive testing for all components and services.',
      steps: [
        'Write unit tests for all services',
        'Add integration tests for API endpoints',
        'Set up E2E tests for critical user flows',
        'Configure CI/CD pipeline with testing'
      ],
      estimatedTime: '2 hours',
      impact: 'Ensures code quality and prevents regressions'
    });

    return recommendations;
  }

  // =====================================================
  // AUTOMATION PIPELINE WITH CURSOR AND LINEAR
  // =====================================================

  async runAutomationPipeline() {
    this.log('🚀 Starting Enhanced Automation Pipeline with Cursor & Linear', 'automation');
    console.log('='.repeat(70));
    
    // Step 1: Setup Cursor environment
    await this.setupCursorEnvironment();
    
    // Step 2: Detect and fix issues
    const { issues, fixes, recommendations } = await this.detectAndFixIssues();
    
    // Step 3: Launch Cursor agents for complex fixes
    for (const recommendation of recommendations) {
      if (recommendation.priority === 'high') {
        await this.launchCursorAgent(
          `Implement: ${recommendation.title}. ${recommendation.description}`,
          'high'
        );
      }
    }
    
    // Step 4: Create Linear issues for tracking
    for (const issue of issues.filter(i => i.type === 'critical')) {
      await this.createLinearIssue(
        issue.title,
        `${issue.description}\n\nSolution: ${issue.solution}\nEstimated time: ${issue.estimatedTime}`,
        'High'
      );
    }
    
    // Step 5: Generate comprehensive report
    await this.generateComprehensiveReport();
    
    this.log('🎉 Enhanced Automation Pipeline Complete!', 'success');
    
    return {
      issues,
      fixes,
      recommendations,
      cursorAgentTasks: this.results.cursorAgentTasks,
      linearIssues: this.results.linearIssues
    };
  }

  async generateComprehensiveReport() {
    const report = `
# Enhanced Automation Report with Cursor & Linear Integration

## 🎯 **Issues Detected and Fixed**

### Critical Issues (${this.results.issues.filter(i => i.type === 'critical').length})
${this.results.issues.filter(i => i.type === 'critical').map(issue => `
#### ${issue.title}
- **Impact**: ${issue.impact}
- **Solution**: ${issue.solution}
- **Command**: \`${issue.command}\`
- **Estimated Time**: ${issue.estimatedTime}
- **Status**: ${this.results.fixes.find(f => f.issueId === issue.id)?.status || 'pending'}
`).join('')}

### Warning Issues (${this.results.issues.filter(i => i.type === 'warning').length})
${this.results.issues.filter(i => i.type === 'warning').map(issue => `
#### ${issue.title}
- **Impact**: ${issue.impact}
- **Solution**: ${issue.solution}
- **Command**: \`${issue.command}\`
- **Estimated Time**: ${issue.estimatedTime}
- **Status**: ${this.results.fixes.find(f => f.issueId === issue.id)?.status || 'pending'}
`).join('')}

## 🔧 **Applied Fixes**

${this.results.fixes.map(fix => `
### ${fix.title}
- **Command**: \`${fix.command}\`
- **Status**: ${fix.status}
- **Time**: ${fix.estimatedTime}
- **Timestamp**: ${fix.timestamp}
${fix.error ? `- **Error**: ${fix.error}` : ''}
`).join('')}

## 📋 **Recommendations**

${this.results.recommendations.map(rec => `
### ${rec.title} (${rec.priority} priority)
- **Category**: ${rec.category}
- **Description**: ${rec.description}
- **Estimated Time**: ${rec.estimatedTime}
- **Impact**: ${rec.impact}

**Steps:**
${rec.steps.map(step => `1. ${step}`).join('\n')}
`).join('')}

## 🎯 **Cursor Background Agent Tasks**

${this.results.cursorAgentTasks.map(task => `
### ${task.task}
- **Priority**: ${task.priority}
- **Agent ID**: ${task.agentId}
- **Status**: ${task.status}
- **Timestamp**: ${task.timestamp}
`).join('')}

## 📋 **Linear Issues Created**

${this.results.linearIssues.map(issue => `
### ${issue.title}
- **Priority**: ${issue.priority}
- **Issue ID**: ${issue.issueId}
- **Status**: ${issue.status}
- **Timestamp**: ${issue.timestamp}
`).join('')}

## 🚀 **Next Steps**

1. **Review Applied Fixes**: Check that all fixes were applied successfully
2. **Monitor Cursor Agents**: Track progress of background agent tasks
3. **Update Linear Issues**: Mark issues as resolved when fixes are verified
4. **Run Tests**: Verify that all functionality is working correctly
5. **Deploy Changes**: Deploy fixes to staging/production environments

## 📊 **Success Metrics**

- **Issues Detected**: ${this.results.issues.length}
- **Fixes Applied**: ${this.results.fixes.filter(f => f.status === 'applied').length}
- **Cursor Agents Launched**: ${this.results.cursorAgentTasks.length}
- **Linear Issues Created**: ${this.results.linearIssues.length}
- **Success Rate**: ${((this.results.fixes.filter(f => f.status === 'applied').length / this.results.issues.length) * 100).toFixed(1)}%

## 🔗 **Integration Status**

- **Cursor Background Agent**: ${this.cursorApiKey ? '✅ Configured' : '❌ API Key Missing'}
- **Linear Integration**: ${this.linearApiKey ? '✅ Configured' : '❌ API Key Missing'}

## 📝 **Environment Variables Required**

\`\`\`bash
# Cursor Background Agent
export CURSOR_API_KEY="your_cursor_api_key"

# Linear Integration
export LINEAR_API_KEY="your_linear_api_key"
\`\`\`

## Timestamp: ${new Date().toISOString()}
`;

    await fs.writeFile(`enhanced-automation-cursor-linear-report-${this.round}.md`, report);
    this.log('Comprehensive report saved: enhanced-automation-cursor-linear-report-${this.round}.md', 'success');
  }
}

// Run the enhanced automation pipeline
const automation = new EnhancedAutomationWithCursorLinear();
automation.runAutomationPipeline().catch(console.error);
