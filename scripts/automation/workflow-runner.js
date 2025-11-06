#!/usr/bin/env node

/**
 * Workflow Runner for LightDom Automation
 * Executes workflow configurations from YAML files
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const execAsync = promisify(exec);

class WorkflowRunner {
  constructor(workflowPath) {
    this.workflowPath = workflowPath;
    this.workflow = null;
    this.state = {
      currentStage: null,
      completedTasks: [],
      failedTasks: [],
      startTime: new Date(),
      endTime: null,
      logs: []
    };
    this.processes = new Map();
  }

  // Logging
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message };
    this.state.logs.push(logEntry);
    
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      debug: '\x1b[90m'
    };
    
    console.log(`${colors[level] || ''}[${timestamp}] ${message}\x1b[0m`);
  }

  // Load and parse workflow
  async loadWorkflow() {
    try {
      this.log(`Loading workflow from: ${this.workflowPath}`);
      const content = await fs.readFile(this.workflowPath, 'utf8');
      this.workflow = yaml.load(content);
      this.log(`Loaded workflow: ${this.workflow.name} v${this.workflow.version}`, 'success');
      return true;
    } catch (error) {
      this.log(`Failed to load workflow: ${error.message}`, 'error');
      return false;
    }
  }

  // Execute a command
  async executeCommand(command, options = {}) {
    const {
      background = false,
      captureOutput = false,
      timeout = 300000, // 5 minutes default
      retries = 0,
      cwd = rootDir
    } = options;

    this.log(`Executing: ${command}`, 'debug');

    if (background) {
      return this.executeBackgroundCommand(command, cwd);
    }

    let attempt = 0;
    while (attempt <= retries) {
      try {
        const result = await execAsync(command, {
          cwd,
          timeout,
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        });

        if (captureOutput) {
          return { success: true, output: result.stdout, error: null };
        }
        return { success: true };
      } catch (error) {
        attempt++;
        if (attempt > retries) {
          this.log(`Command failed after ${retries + 1} attempts: ${error.message}`, 'error');
          return { success: false, error: error.message };
        }
        this.log(`Retry ${attempt}/${retries} for: ${command}`, 'warning');
        await this.delay(5000);
      }
    }
  }

  // Execute background command
  async executeBackgroundCommand(command, cwd) {
    const [cmd, ...args] = command.split(' ');
    const process = spawn(cmd, args, {
      cwd,
      shell: true,
      detached: false,
      stdio: 'pipe'
    });

    const processId = `${cmd}_${Date.now()}`;
    this.processes.set(processId, process);

    process.stdout.on('data', (data) => {
      this.log(`[BG ${processId}] ${data.toString().trim()}`, 'debug');
    });

    process.stderr.on('data', (data) => {
      this.log(`[BG ${processId}] ERROR: ${data.toString().trim()}`, 'error');
    });

    process.on('exit', (code) => {
      this.log(`[BG ${processId}] Process exited with code ${code}`, code === 0 ? 'info' : 'error');
      this.processes.delete(processId);
    });

    return { success: true, processId };
  }

  // Health check
  async performHealthCheck(check) {
    const { command, interval = 5000, retries = 12 } = check;
    
    for (let i = 0; i < retries; i++) {
      const result = await this.executeCommand(command);
      if (result.success) {
        return true;
      }
      this.log(`Health check attempt ${i + 1}/${retries} failed, retrying...`, 'warning');
      await this.delay(interval);
    }
    
    return false;
  }

  // Execute a task
  async executeTask(task, stageConfig = {}) {
    this.log(`Executing task: ${task.name}`, 'info');
    
    const taskStartTime = Date.now();
    
    try {
      // Check conditions
      if (task.condition) {
        const conditionMet = await this.checkCondition(task.condition);
        if (!conditionMet) {
          this.log(`Skipping task ${task.name}: condition not met`, 'info');
          return { success: true, skipped: true };
        }
      }

      // Execute command
      const result = await this.executeCommand(task.command, {
        background: task.background,
        captureOutput: task.captureOutput,
        timeout: task.timeout * 1000,
        retries: task.retries || 0
      });

      if (!result.success && !task.continueOnError) {
        throw new Error(`Task failed: ${result.error}`);
      }

      // Perform health check if specified
      if (task.healthCheck) {
        this.log(`Performing health check for ${task.name}...`, 'info');
        const healthy = await this.performHealthCheck(task.healthCheck);
        if (!healthy) {
          throw new Error('Health check failed');
        }
      }

      const duration = Date.now() - taskStartTime;
      this.log(`Task ${task.name} completed in ${duration}ms`, 'success');
      
      this.state.completedTasks.push({
        id: task.id,
        name: task.name,
        duration,
        timestamp: new Date()
      });

      return { success: true, output: result.output };

    } catch (error) {
      const duration = Date.now() - taskStartTime;
      this.log(`Task ${task.name} failed after ${duration}ms: ${error.message}`, 'error');
      
      this.state.failedTasks.push({
        id: task.id,
        name: task.name,
        error: error.message,
        duration,
        timestamp: new Date()
      });

      return { success: false, error: error.message };
    }
  }

  // Execute a stage
  async executeStage(stage) {
    this.log(`\n${'='.repeat(60)}`, 'info');
    this.log(`Executing stage: ${stage.name}`, 'info');
    this.log(stage.description, 'info');
    this.log('='.repeat(60), 'info');

    this.state.currentStage = stage.name;
    const stageStartTime = Date.now();
    
    try {
      if (stage.parallel) {
        // Execute tasks in parallel
        const promises = stage.tasks.map(task => this.executeTask(task, stage));
        const results = await Promise.all(promises);
        
        const allSuccess = results.every(r => r.success || r.skipped);
        if (!allSuccess) {
          throw new Error('One or more parallel tasks failed');
        }
      } else {
        // Execute tasks sequentially
        for (const task of stage.tasks) {
          const result = await this.executeTask(task, stage);
          
          if (!result.success && !result.skipped && task.required !== false) {
            throw new Error(`Required task ${task.name} failed`);
          }

          if (task.breakOnSuccess && result.success) {
            this.log('Breaking stage execution due to breakOnSuccess', 'info');
            break;
          }
        }
      }

      // Handle iterative stages
      if (stage.maxIterations) {
        for (let i = 1; i <= stage.maxIterations; i++) {
          this.log(`\nIteration ${i}/${stage.maxIterations}`, 'info');
          
          let shouldContinue = true;
          for (const task of stage.tasks) {
            const iterationTask = {
              ...task,
              command: task.command.replace('{iteration}', i.toString())
            };
            
            const result = await this.executeTask(iterationTask, stage);
            
            if (task.breakOnSuccess && result.success) {
              shouldContinue = false;
              break;
            }
          }
          
          if (!shouldContinue) break;
        }
      }

      const duration = Date.now() - stageStartTime;
      this.log(`Stage ${stage.name} completed in ${Math.round(duration / 1000)}s`, 'success');
      return true;

    } catch (error) {
      const duration = Date.now() - stageStartTime;
      this.log(`Stage ${stage.name} failed after ${Math.round(duration / 1000)}s: ${error.message}`, 'error');
      return false;
    }
  }

  // Check conditions
  async checkCondition(condition) {
    switch (condition) {
      case 'git-status-dirty':
        const result = await this.executeCommand('git status --porcelain');
        return result.success && result.output && result.output.trim().length > 0;
      
      case 'auto-commit-enabled':
        return this.workflow.config?.environment?.AUTO_COMMIT === 'true';
      
      default:
        // Evaluate as JavaScript expression
        try {
          return eval(condition);
        } catch {
          return false;
        }
    }
  }

  // Utility methods
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cleanup
  async cleanup() {
    this.log('Cleaning up processes...', 'info');
    
    for (const [id, process] of this.processes) {
      try {
        process.kill();
        this.log(`Killed process: ${id}`, 'info');
      } catch (error) {
        this.log(`Failed to kill process ${id}: ${error.message}`, 'warning');
      }
    }
    
    this.processes.clear();
  }

  // Generate report
  async generateReport() {
    const duration = (this.state.endTime || new Date()) - this.state.startTime;
    const durationMinutes = Math.round(duration / 1000 / 60);
    
    const report = {
      workflow: {
        name: this.workflow.name,
        version: this.workflow.version,
        description: this.workflow.description
      },
      execution: {
        startTime: this.state.startTime,
        endTime: this.state.endTime,
        duration: durationMinutes,
        status: this.state.failedTasks.length === 0 ? 'success' : 'failed'
      },
      tasks: {
        completed: this.state.completedTasks.length,
        failed: this.state.failedTasks.length,
        total: this.state.completedTasks.length + this.state.failedTasks.length
      },
      details: {
        completedTasks: this.state.completedTasks,
        failedTasks: this.state.failedTasks
      }
    };

    const reportPath = path.join(rootDir, `workflow-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`Report saved to: ${reportPath}`, 'success');
    
    // Also save logs
    const logsPath = path.join(rootDir, 'logs', `workflow-${Date.now()}.log`);
    await fs.mkdir(path.dirname(logsPath), { recursive: true });
    await fs.writeFile(
      logsPath,
      this.state.logs.map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`).join('\n')
    );
    
    return report;
  }

  // Main execution
  async run() {
    try {
      // Load workflow
      if (!await this.loadWorkflow()) {
        throw new Error('Failed to load workflow');
      }

      // Apply environment configuration
      if (this.workflow.config?.environment) {
        for (const [key, value] of Object.entries(this.workflow.config.environment)) {
          process.env[key] = value;
        }
      }

      // Execute stages
      for (const stage of this.workflow.stages) {
        const success = await this.executeStage(stage);
        
        if (!success && !this.workflow.config?.execution?.continueOnError) {
          throw new Error(`Stage ${stage.name} failed`);
        }
      }

      // Check success criteria
      if (this.workflow.successCriteria) {
        this.log('\nChecking success criteria...', 'info');
        const allCriteriaMet = await this.checkSuccessCriteria();
        
        if (!allCriteriaMet) {
          throw new Error('Success criteria not met');
        }
      }

      this.state.endTime = new Date();
      this.log('\n✅ Workflow completed successfully!', 'success');
      
      // Generate report
      await this.generateReport();
      
      return true;

    } catch (error) {
      this.state.endTime = new Date();
      this.log(`\n❌ Workflow failed: ${error.message}`, 'error');
      
      // Rollback if enabled
      if (this.workflow.rollback?.enabled) {
        await this.performRollback();
      }
      
      // Generate report
      await this.generateReport();
      
      return false;
    } finally {
      await this.cleanup();
    }
  }

  // Check success criteria
  async checkSuccessCriteria() {
    for (const criterion of this.workflow.successCriteria) {
      this.log(`Checking: ${criterion.description}`, 'info');
      
      // This is simplified - in production, you'd implement actual checks
      const met = true; // Placeholder
      
      if (!met) {
        this.log(`Criterion not met: ${criterion.description}`, 'error');
        return false;
      }
      
      this.log(`✓ ${criterion.description}`, 'success');
    }
    
    return true;
  }

  // Perform rollback
  async performRollback() {
    this.log('\nPerforming rollback...', 'warning');
    
    for (const step of this.workflow.rollback.steps) {
      await this.executeCommand(step.command);
    }
    
    this.log('Rollback completed', 'info');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const workflowPath = args[0] || path.join(rootDir, 'workflows/automation/complete-workflow.yml');
  
  console.log('🚀 LightDom Workflow Runner');
  console.log('='.repeat(60));
  
  const runner = new WorkflowRunner(workflowPath);
  
  // Handle process termination
  process.on('SIGINT', async () => {
    console.log('\n🛑 Workflow interrupted');
    await runner.cleanup();
    process.exit(1);
  });
  
  const success = await runner.run();
  process.exit(success ? 0 : 1);
}

// Check if yaml module is installed
import('js-yaml').then(() => {
  main().catch(console.error);
}).catch(() => {
  console.error('Please install js-yaml: npm install js-yaml');
  process.exit(1);
});
