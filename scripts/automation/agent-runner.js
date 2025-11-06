#!/usr/bin/env node

/**
 * Agent Runner Script
 * Manages and executes Cursor background agents
 * Adheres to enterprise coding rules
 */

import { spawn, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';

class AgentRunner extends EventEmitter {
  constructor() {
    super();
    this.agents = new Map();
    this.tasks = new Map();
    this.workflows = new Map();
    this.config = null;
    this.isRunning = false;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      agent: '🤖'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async loadConfig() {
    try {
      const agentsConfig = JSON.parse(fs.readFileSync('.cursor/agents.json', 'utf8'));
      const tasksConfig = JSON.parse(fs.readFileSync('.cursor/tasks.json', 'utf8'));
      const workflowsConfig = JSON.parse(fs.readFileSync('.cursor/workflows.json', 'utf8'));

      this.config = {
        agents: agentsConfig.agents,
        tasks: tasksConfig.tasks,
        workflows: workflowsConfig.workflows,
        global: {
          ...agentsConfig.globalConfig,
          ...workflowsConfig.globalConfig
        }
      };

      this.log('Configuration loaded successfully', 'success');
    } catch (error) {
      this.log(`Failed to load configuration: ${error.message}`, 'error');
      throw error;
    }
  }

  async startAgent(agentConfig) {
    const agentId = `agent-${agentConfig.name.toLowerCase().replace(/\s+/g, '-')}`;
    
    this.log(`Starting agent: ${agentConfig.name}`, 'agent');
    
    const agent = {
      id: agentId,
      config: agentConfig,
      status: 'starting',
      process: null,
      lastRun: null,
      runCount: 0,
      errorCount: 0
    };

    this.agents.set(agentId, agent);
    this.emit('agentStarted', agent);

    // Start the agent process
    try {
      const agentProcess = spawn('node', ['scripts/agent-executor.js', agentId], {
        stdio: 'pipe',
        env: { ...process.env, AGENT_CONFIG: JSON.stringify(agentConfig) }
      });

      agent.process = agentProcess;
      agent.status = 'running';

      agentProcess.stdout.on('data', (data) => {
        this.log(`[${agentConfig.name}] ${data.toString().trim()}`, 'info');
      });

      agentProcess.stderr.on('data', (data) => {
        this.log(`[${agentConfig.name}] ERROR: ${data.toString().trim()}`, 'error');
        agent.errorCount++;
      });

      agentProcess.on('close', (code) => {
        agent.status = 'stopped';
        this.log(`Agent ${agentConfig.name} stopped with code ${code}`, 'warning');
        this.emit('agentStopped', agent);
      });

      agentProcess.on('error', (error) => {
        agent.status = 'error';
        agent.errorCount++;
        this.log(`Agent ${agentConfig.name} error: ${error.message}`, 'error');
        this.emit('agentError', agent, error);
      });

      this.log(`Agent ${agentConfig.name} started successfully`, 'success');
    } catch (error) {
      agent.status = 'error';
      agent.errorCount++;
      this.log(`Failed to start agent ${agentConfig.name}: ${error.message}`, 'error');
      this.emit('agentError', agent, error);
    }
  }

  async stopAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) {
      this.log(`Agent ${agentId} not found`, 'warning');
      return;
    }

    this.log(`Stopping agent: ${agent.config.name}`, 'agent');
    
    if (agent.process) {
      agent.process.kill('SIGTERM');
      agent.status = 'stopping';
    }

    this.emit('agentStopped', agent);
  }

  async executeTask(taskName, options = {}) {
    const task = this.config.tasks.find(t => t.name === taskName);
    if (!task) {
      throw new Error(`Task ${taskName} not found`);
    }

    this.log(`Executing task: ${taskName}`, 'agent');
    
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const child = spawn('npm', ['run', taskName], {
        stdio: 'pipe',
        shell: true,
        ...options
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        if (options.verbose) {
          console.log(data.toString());
        }
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        if (options.verbose) {
          console.error(data.toString());
        }
      });

      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        if (code === 0) {
          this.log(`Task ${taskName} completed successfully in ${duration}ms`, 'success');
          resolve({ code, stdout, stderr, duration });
        } else {
          this.log(`Task ${taskName} failed with code ${code}`, 'error');
          reject(new Error(`Task ${taskName} failed: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        this.log(`Task ${taskName} error: ${error.message}`, 'error');
        reject(error);
      });

      // Set timeout
      if (task.timeout) {
        setTimeout(() => {
          child.kill('SIGTERM');
          reject(new Error(`Task ${taskName} timed out after ${task.timeout}ms`));
        }, task.timeout);
      }
    });
  }

  async executeWorkflow(workflowName, options = {}) {
    const workflow = this.config.workflows.find(w => w.name === workflowName);
    if (!workflow) {
      throw new Error(`Workflow ${workflowName} not found`);
    }

    this.log(`Executing workflow: ${workflowName}`, 'agent');
    
    const startTime = Date.now();
    const results = {
      workflow: workflowName,
      startTime: new Date().toISOString(),
      tasks: [],
      status: 'running'
    };

    try {
      if (workflow.phases) {
        // Execute phases sequentially
        for (const phase of workflow.phases) {
          this.log(`Executing phase: ${phase.name}`, 'agent');
          
          if (phase.continuous) {
            // Start continuous tasks
            for (const taskName of phase.tasks) {
              this.executeTask(taskName, { ...options, background: true });
            }
          } else {
            // Execute tasks in parallel or sequentially
            if (workflow.parallel) {
              const promises = phase.tasks.map(taskName => this.executeTask(taskName, options));
              await Promise.all(promises);
            } else {
              for (const taskName of phase.tasks) {
                await this.executeTask(taskName, options);
              }
            }
          }
        }
      } else {
        // Execute tasks directly
        if (workflow.parallel) {
          const promises = workflow.tasks.map(taskName => this.executeTask(taskName, options));
          await Promise.all(promises);
        } else {
          for (const taskName of workflow.tasks) {
            await this.executeTask(taskName, options);
          }
        }
      }

      results.status = 'completed';
      results.endTime = new Date().toISOString();
      results.duration = Date.now() - startTime;
      
      this.log(`Workflow ${workflowName} completed successfully`, 'success');
    } catch (error) {
      results.status = 'failed';
      results.error = error.message;
      results.endTime = new Date().toISOString();
      results.duration = Date.now() - startTime;
      
      this.log(`Workflow ${workflowName} failed: ${error.message}`, 'error');
      throw error;
    }

    return results;
  }

  async startAllAgents() {
    this.log('Starting all agents...', 'agent');
    
    for (const agentConfig of this.config.agents) {
      if (agentConfig.enabled !== false) {
        await this.startAgent(agentConfig);
        // Add delay between agent starts
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.isRunning = true;
    this.log('All agents started', 'success');
  }

  async stopAllAgents() {
    this.log('Stopping all agents...', 'agent');
    
    for (const [agentId, agent] of this.agents) {
      await this.stopAgent(agentId);
    }

    this.isRunning = false;
    this.log('All agents stopped', 'success');
  }

  getAgentStatus() {
    const status = {
      running: this.isRunning,
      agents: Array.from(this.agents.values()).map(agent => ({
        id: agent.id,
        name: agent.config.name,
        status: agent.status,
        lastRun: agent.lastRun,
        runCount: agent.runCount,
        errorCount: agent.errorCount
      }))
    };

    return status;
  }

  async handleFileChange(filePath) {
    this.log(`File changed: ${filePath}`, 'info');
    
    // Trigger relevant agents based on file type
    const fileExt = path.extname(filePath);
    const triggers = {
      '.ts': ['Code Quality Agent', 'Test Automation Agent'],
      '.tsx': ['Code Quality Agent', 'Test Automation Agent'],
      '.js': ['Code Quality Agent', 'Test Automation Agent'],
      '.jsx': ['Code Quality Agent', 'Test Automation Agent'],
      '.sol': ['Code Quality Agent', 'Security Agent'],
      '.json': ['Code Quality Agent'],
      '.md': ['Documentation Agent']
    };

    const relevantAgents = triggers[fileExt] || [];
    
    for (const agentName of relevantAgents) {
      const agent = Array.from(this.agents.values()).find(a => a.config.name === agentName);
      if (agent && agent.status === 'running') {
        this.log(`Triggering ${agentName} for file change`, 'agent');
        // Trigger agent-specific file change handling
        this.emit('fileChange', { filePath, agent });
      }
    }
  }

  async handlePreCommit() {
    this.log('Pre-commit triggered', 'agent');
    await this.executeWorkflow('PreCommitWorkflow');
  }

  async handlePullRequest() {
    this.log('Pull request triggered', 'agent');
    await this.executeWorkflow('PullRequestWorkflow');
  }

  async handleDeployment(environment) {
    this.log(`Deployment to ${environment} triggered`, 'agent');
    await this.executeWorkflow('DeploymentWorkflow');
  }

  // Handle merge conflicts
  async handleMergeConflict() {
    this.log('Merge conflict detected', 'warning');
    await this.executeWorkflow('MergeConflictWorkflow');
  }

  // Detect merge conflicts in git repository
  async detectMergeConflicts() {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      // Check for merge conflicts using git status
      const { stdout: statusOutput } = await execAsync('git status --porcelain');
      const conflictFiles = statusOutput
        .split('\n')
        .filter(line => line.startsWith('UU') || line.startsWith('AA') || line.startsWith('DU') || line.startsWith('UD'))
        .map(line => line.substring(3).trim())
        .filter(Boolean);

      if (conflictFiles.length > 0) {
        this.log(`Found ${conflictFiles.length} files with merge conflicts: ${conflictFiles.join(', ')}`, 'warning');
        return {
          hasConflicts: true,
          conflictFiles,
          conflictDetails: await this.analyzeConflicts(conflictFiles)
        };
      }

      return { hasConflicts: false, conflictFiles: [], conflictDetails: [] };
    } catch (error) {
      this.log(`Error detecting merge conflicts: ${error.message}`, 'error');
      return { hasConflicts: false, conflictFiles: [], conflictDetails: [], error: error.message };
    }
  }

  // Analyze conflict details in files
  async analyzeConflicts(conflictFiles) {
    const conflicts = [];
    
    for (const file of conflictFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const conflictMarkers = this.parseConflictMarkers(content, file);
        conflicts.push({
          file,
          conflicts: conflictMarkers,
          suggestions: await this.generateResolutionSuggestions(file, conflictMarkers)
        });
      } catch (error) {
        this.log(`Error analyzing conflicts in ${file}: ${error.message}`, 'error');
        conflicts.push({
          file,
          error: error.message,
          conflicts: [],
          suggestions: []
        });
      }
    }
    
    return conflicts;
  }

  // Parse conflict markers in file content
  parseConflictMarkers(content, fileName) {
    const lines = content.split('\n');
    const conflicts = [];
    let currentConflict = null;
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;
      
      if (line.startsWith('<<<<<<<')) {
        currentConflict = {
          startLine: lineNumber,
          currentBranch: line.substring(7).trim(),
          currentContent: [],
          incomingContent: [],
          incomingBranch: '',
          endLine: 0
        };
      } else if (line.startsWith('=======') && currentConflict) {
        currentConflict.separatorLine = lineNumber;
      } else if (line.startsWith('>>>>>>>') && currentConflict) {
        currentConflict.incomingBranch = line.substring(7).trim();
        currentConflict.endLine = lineNumber;
        conflicts.push(currentConflict);
        currentConflict = null;
      } else if (currentConflict) {
        if (currentConflict.separatorLine) {
          currentConflict.incomingContent.push(line);
        } else {
          currentConflict.currentContent.push(line);
        }
      }
    }

    return conflicts;
  }

  // Generate resolution suggestions for conflicts
  async generateResolutionSuggestions(fileName, conflicts) {
    const suggestions = [];
    
    for (const conflict of conflicts) {
      const suggestion = {
        type: this.determineConflictType(conflict),
        strategy: this.suggestResolutionStrategy(conflict, fileName),
        resolution: this.generateResolution(conflict, fileName),
        confidence: this.calculateConfidence(conflict, fileName)
      };
      
      suggestions.push(suggestion);
    }
    
    return suggestions;
  }

  // Determine the type of conflict
  determineConflictType(conflict) {
    const currentLines = conflict.currentContent.join('\n');
    const incomingLines = conflict.incomingContent.join('\n');
    
    if (currentLines.trim() === '' && incomingLines.trim() !== '') {
      return 'addition';
    } else if (currentLines.trim() !== '' && incomingLines.trim() === '') {
      return 'deletion';
    } else if (currentLines.includes('import') || incomingLines.includes('import')) {
      return 'import_conflict';
    } else if (currentLines.includes('function') || incomingLines.includes('function')) {
      return 'function_conflict';
    } else if (currentLines.includes('const') || currentLines.includes('let') || currentLines.includes('var')) {
      return 'variable_conflict';
    } else {
      return 'content_modification';
    }
  }

  // Suggest resolution strategy
  suggestResolutionStrategy(conflict, fileName) {
    const conflictType = this.determineConflictType(conflict);
    const fileExt = path.extname(fileName);
    
    switch (conflictType) {
      case 'import_conflict':
        return 'merge_imports';
      case 'addition':
        return 'accept_incoming';
      case 'deletion':
        return 'manual_review';
      case 'function_conflict':
        return fileExt === '.ts' || fileExt === '.js' ? 'intelligent_merge' : 'manual_review';
      case 'variable_conflict':
        return 'rename_and_merge';
      default:
        return 'manual_review';
    }
  }

  // Generate automatic resolution
  generateResolution(conflict, fileName) {
    const strategy = this.suggestResolutionStrategy(conflict, fileName);
    
    switch (strategy) {
      case 'merge_imports':
        return this.mergeImports(conflict);
      case 'accept_incoming':
        return conflict.incomingContent.join('\n');
      case 'intelligent_merge':
        return this.intelligentMerge(conflict);
      case 'rename_and_merge':
        return this.renameAndMerge(conflict);
      default:
        return null; // Requires manual resolution
    }
  }

  // Merge import statements
  mergeImports(conflict) {
    const currentImports = this.extractImports(conflict.currentContent);
    const incomingImports = this.extractImports(conflict.incomingContent);
    
    // Merge and deduplicate imports
    const allImports = [...currentImports, ...incomingImports];
    const uniqueImports = [...new Set(allImports)];
    
    return uniqueImports.join('\n');
  }

  // Extract import statements
  extractImports(lines) {
    return lines.filter(line => line.trim().startsWith('import'));
  }

  // Intelligent merge for functions and code blocks
  intelligentMerge(conflict) {
    // Simple heuristic: if both sides have similar content, prefer the longer version
    const currentContent = conflict.currentContent.join('\n');
    const incomingContent = conflict.incomingContent.join('\n');
    
    if (currentContent.length > incomingContent.length) {
      return currentContent;
    } else {
      return incomingContent;
    }
  }

  // Rename and merge variables
  renameAndMerge(conflict) {
    const currentContent = conflict.currentContent.join('\n');
    const incomingContent = conflict.incomingContent.join('\n');
    
    // Simple implementation: append both with comments
    return `// From current branch (${conflict.currentBranch})\n${currentContent}\n\n// From incoming branch (${conflict.incomingBranch})\n${incomingContent}`;
  }

  // Calculate confidence in automatic resolution
  calculateConfidence(conflict, fileName) {
    const conflictType = this.determineConflictType(conflict);
    const strategy = this.suggestResolutionStrategy(conflict, fileName);
    
    if (strategy === 'manual_review') return 0;
    if (conflictType === 'import_conflict') return 0.9;
    if (conflictType === 'addition') return 0.8;
    if (conflictType === 'intelligent_merge') return 0.6;
    
    return 0.5;
  }

  // Apply automatic resolutions
  async applyAutomaticResolutions(conflictDetails) {
    const resolvedFiles = [];
    const manualFiles = [];
    
    for (const detail of conflictDetails) {
      if (detail.error) {
        manualFiles.push(detail.file);
        continue;
      }
      
      let canAutoResolve = true;
      let resolvedContent = fs.readFileSync(detail.file, 'utf8');
      
      // Apply resolutions from bottom to top to maintain line numbers
      const sortedConflicts = detail.conflicts
        .map((conflict, index) => ({ ...conflict, suggestions: detail.suggestions[index] }))
        .sort((a, b) => b.startLine - a.startLine);
      
      for (const conflict of sortedConflicts) {
        if (conflict.suggestions.confidence < 0.7) {
          canAutoResolve = false;
          break;
        }
        
        if (conflict.suggestions.resolution) {
          resolvedContent = this.replaceConflictWithResolution(
            resolvedContent,
            conflict,
            conflict.suggestions.resolution
          );
        } else {
          canAutoResolve = false;
          break;
        }
      }
      
      if (canAutoResolve) {
        fs.writeFileSync(detail.file, resolvedContent);
        resolvedFiles.push(detail.file);
        this.log(`Auto-resolved conflicts in ${detail.file}`, 'success');
      } else {
        manualFiles.push(detail.file);
        this.log(`${detail.file} requires manual resolution`, 'warning');
      }
    }
    
    return { resolvedFiles, manualFiles };
  }

  // Replace conflict markers with resolution
  replaceConflictWithResolution(content, conflict, resolution) {
    const lines = content.split('\n');
    const beforeConflict = lines.slice(0, conflict.startLine - 1);
    const afterConflict = lines.slice(conflict.endLine);
    
    return [
      ...beforeConflict,
      resolution,
      ...afterConflict
    ].join('\n');
  }

  // Generate detailed merge conflict report
  async generateMergeConflictReport() {
    const conflicts = await this.detectMergeConflicts();
    const reportData = {
      timestamp: new Date().toISOString(),
      repository: process.cwd(),
      summary: {
        totalFiles: conflicts.conflictFiles.length,
        hasConflicts: conflicts.hasConflicts,
        autoResolvable: 0,
        manualReview: 0
      },
      details: []
    };

    if (conflicts.hasConflicts) {
      for (const detail of conflicts.conflictDetails) {
        const fileReport = {
          file: detail.file,
          conflictCount: detail.conflicts.length,
          suggestions: detail.suggestions,
          autoResolvable: detail.suggestions.every(s => s.confidence >= 0.7),
          conflictTypes: detail.conflicts.map(c => this.determineConflictType(c))
        };

        if (fileReport.autoResolvable) {
          reportData.summary.autoResolvable++;
        } else {
          reportData.summary.manualReview++;
        }

        reportData.details.push(fileReport);
      }
    }

    // Write report to file
    const reportPath = `merge-conflict-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    
    console.log('📋 Merge Conflict Report Generated');
    console.log(`   Report saved to: ${reportPath}`);
    console.log(`   Total conflicts: ${reportData.summary.totalFiles}`);
    console.log(`   Auto-resolvable: ${reportData.summary.autoResolvable}`);
    console.log(`   Manual review: ${reportData.summary.manualReview}`);
    
    return reportData;
  }

  // Health check for agents
  async healthCheck() {
    const health = {
      status: 'healthy',
      agents: {},
      timestamp: new Date().toISOString()
    };

    for (const [agentId, agent] of this.agents) {
      health.agents[agentId] = {
        status: agent.status,
        lastRun: agent.lastRun,
        errorCount: agent.errorCount,
        healthy: agent.status === 'running' && agent.errorCount < 5
      };

      if (!health.agents[agentId].healthy) {
        health.status = 'unhealthy';
      }
    }

    return health;
  }

  // Graceful shutdown
  async shutdown() {
    this.log('Shutting down agent runner...', 'agent');
    await this.stopAllAgents();
    this.log('Agent runner shutdown complete', 'success');
  }
}

// CLI interface
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const command = process.argv[2];
  const agentRunner = new AgentRunner();

  async function main() {
    try {
      await agentRunner.loadConfig();

      switch (command) {
        case 'start':
          await agentRunner.startAllAgents();
          // Keep running
          process.on('SIGINT', async () => {
            await agentRunner.shutdown();
            process.exit(0);
          });
          break;

        case 'stop':
          await agentRunner.stopAllAgents();
          break;

        case 'status':
          console.log(JSON.stringify(agentRunner.getAgentStatus(), null, 2));
          break;

        case 'health':
          console.log(JSON.stringify(await agentRunner.healthCheck(), null, 2));
          break;

        case 'task':
          const taskName = process.argv[3];
          if (!taskName) {
            console.error('Task name required');
            process.exit(1);
          }
          await agentRunner.executeTask(taskName, { verbose: true });
          break;

        case 'workflow':
          const workflowName = process.argv[3];
          if (!workflowName) {
            console.error('Workflow name required');
            process.exit(1);
          }
          await agentRunner.executeWorkflow(workflowName, { verbose: true });
          break;

        case 'merge-conflicts':
          const action = process.argv[3] || 'detect';
          if (action === 'detect') {
            const conflicts = await agentRunner.detectMergeConflicts();
            if (conflicts.hasConflicts) {
              console.log(JSON.stringify(conflicts, null, 2));
              console.log(`\n🔍 Found ${conflicts.conflictFiles.length} files with merge conflicts.`);
              console.log('Run with "resolve" to attempt automatic resolution.');
            } else {
              console.log('✅ No merge conflicts detected.');
            }
          } else if (action === 'resolve') {
            const conflicts = await agentRunner.detectMergeConflicts();
            if (conflicts.hasConflicts) {
              const results = await agentRunner.applyAutomaticResolutions(conflicts.conflictDetails);
              console.log(`✅ Auto-resolved: ${results.resolvedFiles.length} files`);
              console.log(`⚠️  Manual review needed: ${results.manualFiles.length} files`);
              if (results.manualFiles.length > 0) {
                console.log('Files requiring manual resolution:');
                results.manualFiles.forEach(file => console.log(`  - ${file}`));
              }
            } else {
              console.log('✅ No merge conflicts detected.');
            }
          } else if (action === 'analyze') {
            const fileName = process.argv[4];
            if (!fileName) {
              console.error('File name required for analysis');
              process.exit(1);
            }
            const content = fs.readFileSync(fileName, 'utf8');
            const conflicts = agentRunner.parseConflictMarkers(content, fileName);
            const suggestions = await agentRunner.generateResolutionSuggestions(fileName, conflicts);
            
            console.log(`📊 Analysis for ${fileName}:`);
            console.log(`   Conflicts found: ${conflicts.length}`);
            conflicts.forEach((conflict, index) => {
              console.log(`   Conflict ${index + 1}:`);
              console.log(`     - Type: ${agentRunner.determineConflictType(conflict)}`);
              console.log(`     - Strategy: ${suggestions[index].strategy}`);
              console.log(`     - Confidence: ${suggestions[index].confidence}`);
            });
          } else if (action === 'report') {
            await agentRunner.generateMergeConflictReport();
          } else {
            console.error('Invalid action. Use "detect", "resolve", "analyze", or "report"');
            process.exit(1);
          }
          break;

        default:
          console.log('Usage: node agent-runner.js [start|stop|status|health|task|workflow|merge-conflicts]');
          console.log('  merge-conflicts [detect|resolve|analyze <file>|report] - Manage merge conflicts');
          console.log('    detect     - Detect merge conflicts in the repository');
          console.log('    resolve    - Automatically resolve conflicts where possible');
          console.log('    analyze    - Analyze conflicts in a specific file');
          console.log('    report     - Generate detailed conflict resolution report');
          process.exit(1);
      }
    } catch (error) {
      console.error('Agent runner error:', error.message);
      process.exit(1);
    }
  }

  main();
}

export default AgentRunner;
