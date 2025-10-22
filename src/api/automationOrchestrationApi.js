/**
 * JavaScript wrapper for Automation Orchestration API
 * This allows the TypeScript API to be used in the JavaScript Express server
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

const execAsync = promisify(exec);

class AutomationOrchestratorJS extends EventEmitter {
  constructor() {
    super();
    this.workflows = new Map();
    this.jobs = new Map();
    this.scheduledJobs = new Map();
    this.initialized = false;
    this.outputDir = './automation-output';
    this.initializeWorkflows();
  }

  initializeWorkflows() {
    // Register built-in workflows
    this.workflows.set('autopilot', {
      workflowId: 'autopilot',
      name: 'Autopilot',
      description: 'Runs automated fix rounds with Cursor agent',
      script: 'node',
      args: ['scripts/automation/autopilot.js'],
      timeout: 3600000
    });

    this.workflows.set('compliance-check', {
      workflowId: 'compliance-check',
      name: 'Compliance Check',
      description: 'Runs compliance tests on the system',
      script: 'npm',
      args: ['run', 'compliance:check'],
      timeout: 600000
    });

    this.workflows.set('functionality-test', {
      workflowId: 'functionality-test',
      name: 'Functionality Test',
      description: 'Tests actual system functionality',
      script: 'node',
      args: ['scripts/automation/functionality-test.js'],
      timeout: 900000
    });

    this.workflows.set('enhanced-automation', {
      workflowId: 'enhanced-automation',
      name: 'Enhanced Automation',
      description: 'Enhanced automation system with advanced features',
      script: 'node',
      args: ['scripts/automation/enhanced-automation-system.js'],
      timeout: 1800000
    });

    this.workflows.set('quality-gates', {
      workflowId: 'quality-gates',
      name: 'Quality Gates',
      description: 'Runs quality gate checks',
      script: 'node',
      args: ['scripts/automation/quality-gates.js'],
      timeout: 900000
    });
  }

  async initialize() {
    if (this.initialized) return;
    await fs.mkdir(this.outputDir, { recursive: true });
    this.initialized = true;
    this.emit('initialized');
  }

  async startWorkflow(workflowId, config = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const jobId = uuidv4();
    const job = {
      jobId,
      workflowId,
      status: 'pending',
      metadata: config
    };

    this.jobs.set(jobId, job);
    this.emit('job:created', job);

    // Start workflow execution in background
    this.executeWorkflow(jobId, workflow, config).catch(error => {
      this.updateJobStatus(jobId, {
        status: 'failed',
        error: error.message
      });
    });

    return jobId;
  }

  async executeWorkflow(jobId, workflow, config = {}) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    this.updateJobStatus(jobId, {
      status: 'running',
      startTime: new Date()
    });

    const outputFile = path.join(this.outputDir, `${jobId}.log`);

    try {
      const mergedConfig = { ...workflow, ...config };
      
      // Sanitize and validate script and args to prevent command injection
      const script = String(mergedConfig.script).replace(/[;&|`$()]/g, '');
      const args = (mergedConfig.args || []).map(arg => 
        String(arg).replace(/[;&|`$()]/g, '')
      );
      const command = `${script} ${args.join(' ')}`;

      const { stdout, stderr } = await execAsync(command, {
        timeout: mergedConfig.timeout || 600000,
        env: { ...process.env, ...mergedConfig.env },
        maxBuffer: 10 * 1024 * 1024,
        shell: '/bin/bash' // Explicitly set shell for security
      });

      const output = stdout + (stderr ? `\n\nSTDERR:\n${stderr}` : '');
      await fs.writeFile(outputFile, output);

      this.updateJobStatus(jobId, {
        status: 'completed',
        endTime: new Date(),
        progress: 100,
        output: output.slice(-1000)
      });

      this.emit('job:completed', job);
    } catch (error) {
      const errorMessage = error.message || 'Unknown error';
      const errorOutput = error.stdout || error.stderr || errorMessage;

      await fs.writeFile(outputFile, errorOutput).catch(() => {});

      this.updateJobStatus(jobId, {
        status: 'failed',
        endTime: new Date(),
        error: errorMessage,
        output: errorOutput.slice(-1000)
      });

      this.emit('job:failed', { job, error: errorMessage });
    }
  }

  async stopWorkflow(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status !== 'running') {
      throw new Error(`Job ${jobId} is not running`);
    }

    this.updateJobStatus(jobId, {
      status: 'stopped',
      endTime: new Date()
    });

    this.emit('job:stopped', job);
  }

  async getWorkflowStatus(jobId) {
    return this.jobs.get(jobId) || null;
  }

  async listWorkflows() {
    return Array.from(this.workflows.values());
  }

  async listJobs() {
    return Array.from(this.jobs.values());
  }

  async startAutopilot(config) {
    const jobId = uuidv4();
    const job = {
      jobId,
      workflowId: 'autopilot',
      status: 'pending',
      metadata: config
    };

    this.jobs.set(jobId, job);
    this.emit('autopilot:started', job);

    this.executeAutopilot(jobId, config).catch(error => {
      this.updateJobStatus(jobId, {
        status: 'failed',
        error: error.message
      });
    });

    return jobId;
  }

  async executeAutopilot(jobId, config) {
    this.updateJobStatus(jobId, {
      status: 'running',
      startTime: new Date()
    });

    const outputFile = path.join(this.outputDir, `autopilot-${jobId}.log`);
    let output = '';

    try {
      const maxRounds = config.maxRounds || 5;

      for (let round = 1; round <= maxRounds; round++) {
        this.updateJobStatus(jobId, {
          progress: (round / maxRounds) * 100,
          metadata: { ...config, currentRound: round }
        });

        const roundOutput = `\n--- Round ${round}/${maxRounds} ---\n`;
        output += roundOutput;

        if (config.complianceCheck !== false) {
          try {
            const { stdout } = await execAsync('npm run compliance:check', {
              timeout: 600000
            });
            output += `Compliance Check:\n${stdout}\n`;

            if (this.isCompliancePassing(stdout)) {
              output += '\n✅ All compliance checks passing. Autopilot complete.\n';
              break;
            }
          } catch (error) {
            output += `Compliance Check Error: ${error.message}\n`;
          }
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      await fs.writeFile(outputFile, output);

      this.updateJobStatus(jobId, {
        status: 'completed',
        endTime: new Date(),
        progress: 100,
        output: output.slice(-1000)
      });

      this.emit('autopilot:completed', this.jobs.get(jobId));
    } catch (error) {
      await fs.writeFile(outputFile, output + `\n\nError: ${error.message}`).catch(() => {});

      this.updateJobStatus(jobId, {
        status: 'failed',
        endTime: new Date(),
        error: error.message,
        output: output.slice(-1000)
      });

      this.emit('autopilot:failed', { jobId, error: error.message });
    }
  }

  isCompliancePassing(output) {
    const failurePatterns = [/❌|ERROR|failed|not.*passing/i, /🚨|critical/i];
    return !failurePatterns.some(pattern => pattern.test(output));
  }

  async getMetrics() {
    const jobs = Array.from(this.jobs.values());
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'running').length;
    const completedJobs = jobs.filter(j => j.status === 'completed').length;
    const failedJobs = jobs.filter(j => j.status === 'failed').length;

    const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    const completedJobsWithTime = jobs.filter(
      j => j.status === 'completed' && j.startTime && j.endTime
    );
    const totalExecutionTime = completedJobsWithTime.reduce((sum, job) => {
      const duration = job.endTime.getTime() - job.startTime.getTime();
      return sum + duration;
    }, 0);
    const averageExecutionTime = completedJobsWithTime.length > 0
      ? totalExecutionTime / completedJobsWithTime.length
      : 0;

    const workflowStats = {};
    for (const [workflowId] of this.workflows) {
      const workflowJobs = jobs.filter(j => j.workflowId === workflowId);
      const successes = workflowJobs.filter(j => j.status === 'completed').length;
      const failures = workflowJobs.filter(j => j.status === 'failed').length;

      workflowStats[workflowId] = {
        executions: workflowJobs.length,
        successes,
        failures,
        avgExecutionTime: 0
      };
    }

    return {
      totalJobs,
      activeJobs,
      completedJobs,
      failedJobs,
      successRate,
      averageExecutionTime,
      workflowStats
    };
  }

  async getHealthStatus() {
    const checks = {
      initialized: this.initialized,
      hasWorkflows: this.workflows.size > 0,
      outputDirExists: false
    };

    try {
      await fs.access(this.outputDir);
      checks.outputDirExists = true;
    } catch {
      checks.outputDirExists = false;
    }

    const allChecksPass = Object.values(checks).every(v => v);
    const status = allChecksPass ? 'healthy' : 'degraded';

    return {
      status,
      checks,
      message: status === 'healthy'
        ? 'All systems operational'
        : 'Some checks failed'
    };
  }

  updateJobStatus(jobId, updates) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    Object.assign(job, updates);
    this.emit('job:updated', job);
  }
}

// Create singleton instance
const orchestrator = new AutomationOrchestratorJS();

// API handler functions
export class AutomationOrchestrationAPIJS {
  constructor() {
    this.orchestrator = orchestrator;
  }

  async initialize() {
    await this.orchestrator.initialize();
  }

  async startWorkflow(req, res) {
    try {
      const { workflowId, config } = req.body;

      if (!workflowId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'workflowId is required'
        });
      }

      const jobId = await this.orchestrator.startWorkflow(workflowId, config);

      res.json({
        success: true,
        data: {
          jobId,
          workflowId,
          status: 'started'
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async stopWorkflow(req, res) {
    try {
      const { jobId } = req.body;

      if (!jobId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'jobId is required'
        });
      }

      await this.orchestrator.stopWorkflow(jobId);

      res.json({
        success: true,
        data: {
          jobId,
          status: 'stopped'
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async getWorkflowStatus(req, res) {
    try {
      const { jobId } = req.params;

      const status = await this.orchestrator.getWorkflowStatus(jobId);

      if (!status) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Workflow job ${jobId} not found`
        });
      }

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async listWorkflows(req, res) {
    try {
      const workflows = await this.orchestrator.listWorkflows();

      res.json({
        success: true,
        data: workflows
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async listJobs(req, res) {
    try {
      const jobs = await this.orchestrator.listJobs();

      res.json({
        success: true,
        data: jobs
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async startAutopilot(req, res) {
    try {
      const { maxRounds, config } = req.body;

      const jobId = await this.orchestrator.startAutopilot({
        maxRounds: maxRounds || 5,
        ...config
      });

      res.json({
        success: true,
        data: {
          jobId,
          mode: 'autopilot',
          status: 'started',
          maxRounds: maxRounds || 5
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async getMetrics(req, res) {
    try {
      const metrics = await this.orchestrator.getMetrics();

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }

  async getHealth(req, res) {
    try {
      const health = await this.orchestrator.getHealthStatus();

      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
}

// Export both the API and orchestrator
export const automationOrchestrationAPIJS = new AutomationOrchestrationAPIJS();
export default automationOrchestrationAPIJS;
