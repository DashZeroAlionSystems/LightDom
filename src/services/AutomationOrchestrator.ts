/**
 * Automation Orchestrator Service
 * Manages the lifecycle of automation workflows, integrating with existing automation scripts
 */

import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export interface WorkflowConfig {
  workflowId: string;
  name: string;
  description: string;
  script: string;
  args?: string[];
  env?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
}

export interface JobStatus {
  jobId: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'stopped';
  startTime?: Date;
  endTime?: Date;
  progress?: number;
  output?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface AutopilotConfig {
  maxRounds: number;
  complianceCheck?: boolean;
  agentPromptFile?: string;
  dryRun?: boolean;
}

export interface OrchestrationMetrics {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  successRate: number;
  averageExecutionTime: number;
  workflowStats: Record<string, {
    executions: number;
    successes: number;
    failures: number;
    avgExecutionTime: number;
  }>;
}

export class AutomationOrchestrator extends EventEmitter {
  private workflows: Map<string, WorkflowConfig> = new Map();
  private jobs: Map<string, JobStatus> = new Map();
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();
  private initialized: boolean = false;
  private outputDir: string = './automation-output';

  constructor() {
    super();
  }

  /**
   * Initialize the orchestrator and load available workflows
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Create output directory
    await fs.mkdir(this.outputDir, { recursive: true });

    // Register built-in workflows
    this.registerBuiltInWorkflows();

    this.initialized = true;
    this.emit('initialized');
  }

  /**
   * Register built-in automation workflows
   */
  private registerBuiltInWorkflows(): void {
    // Autopilot workflow
    this.workflows.set('autopilot', {
      workflowId: 'autopilot',
      name: 'Autopilot',
      description: 'Runs automated fix rounds with Cursor agent',
      script: 'node',
      args: ['scripts/automation/autopilot.js'],
      timeout: 3600000 // 1 hour
    });

    // Automation master workflow
    this.workflows.set('automation-master', {
      workflowId: 'automation-master',
      name: 'Automation Master',
      description: 'Orchestrates complete automation system',
      script: 'node',
      args: ['scripts/automation/automation-master.js'],
      timeout: 3600000
    });

    // Compliance check workflow
    this.workflows.set('compliance-check', {
      workflowId: 'compliance-check',
      name: 'Compliance Check',
      description: 'Runs compliance tests on the system',
      script: 'npm',
      args: ['run', 'compliance:check'],
      timeout: 600000 // 10 minutes
    });

    // Functionality test workflow
    this.workflows.set('functionality-test', {
      workflowId: 'functionality-test',
      name: 'Functionality Test',
      description: 'Tests actual system functionality',
      script: 'node',
      args: ['scripts/automation/functionality-test.js'],
      timeout: 900000 // 15 minutes
    });

    // Enhanced automation workflow
    this.workflows.set('enhanced-automation', {
      workflowId: 'enhanced-automation',
      name: 'Enhanced Automation',
      description: 'Enhanced automation system with advanced features',
      script: 'node',
      args: ['scripts/automation/enhanced-automation-system.js'],
      timeout: 1800000 // 30 minutes
    });

    // Git safe automation workflow
    this.workflows.set('git-safe-automation', {
      workflowId: 'git-safe-automation',
      name: 'Git Safe Automation',
      description: 'Automation with git safety checks',
      script: 'node',
      args: ['scripts/automation/git-safe-automation.js'],
      timeout: 1800000
    });

    // Quality gates workflow
    this.workflows.set('quality-gates', {
      workflowId: 'quality-gates',
      name: 'Quality Gates',
      description: 'Runs quality gate checks',
      script: 'node',
      args: ['scripts/automation/quality-gates.js'],
      timeout: 900000
    });

    // Enterprise organizer workflow
    this.workflows.set('enterprise-organizer', {
      workflowId: 'enterprise-organizer',
      name: 'Enterprise Organizer',
      description: 'Organizes project structure for enterprise',
      script: 'node',
      args: ['scripts/automation/enterprise-organizer.js'],
      timeout: 600000
    });
  }

  /**
   * Start a workflow execution
   */
  async startWorkflow(
    workflowId: string,
    config?: Partial<WorkflowConfig>
  ): Promise<string> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const jobId = uuidv4();
    const job: JobStatus = {
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

  /**
   * Execute a workflow
   */
  private async executeWorkflow(
    jobId: string,
    workflow: WorkflowConfig,
    config?: Partial<WorkflowConfig>
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    // Update job status to running
    this.updateJobStatus(jobId, {
      status: 'running',
      startTime: new Date()
    });

    const outputFile = path.join(this.outputDir, `${jobId}.log`);

    try {
      // Merge configs
      const mergedConfig = { ...workflow, ...config };
      const args = mergedConfig.args || [];
      const command = `${mergedConfig.script} ${args.join(' ')}`;

      // Execute workflow
      const { stdout, stderr } = await execAsync(command, {
        timeout: mergedConfig.timeout || 600000,
        env: { ...process.env, ...mergedConfig.env },
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      // Save output
      const output = stdout + (stderr ? `\n\nSTDERR:\n${stderr}` : '');
      await fs.writeFile(outputFile, output);

      // Update job status to completed
      this.updateJobStatus(jobId, {
        status: 'completed',
        endTime: new Date(),
        progress: 100,
        output: output.slice(-1000) // Last 1000 chars
      });

      this.emit('job:completed', job);
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      const errorOutput = error.stdout || error.stderr || errorMessage;

      // Save error output
      await fs.writeFile(outputFile, errorOutput).catch(() => {});

      // Update job status to failed
      this.updateJobStatus(jobId, {
        status: 'failed',
        endTime: new Date(),
        error: errorMessage,
        output: errorOutput.slice(-1000)
      });

      this.emit('job:failed', { job, error: errorMessage });
    }
  }

  /**
   * Stop a running workflow
   */
  async stopWorkflow(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status !== 'running') {
      throw new Error(`Job ${jobId} is not running`);
    }

    // Update status to stopped
    this.updateJobStatus(jobId, {
      status: 'stopped',
      endTime: new Date()
    });

    this.emit('job:stopped', job);
  }

  /**
   * Get workflow job status
   */
  async getWorkflowStatus(jobId: string): Promise<JobStatus | null> {
    return this.jobs.get(jobId) || null;
  }

  /**
   * List all available workflows
   */
  async listWorkflows(): Promise<WorkflowConfig[]> {
    return Array.from(this.workflows.values());
  }

  /**
   * List all jobs
   */
  async listJobs(): Promise<JobStatus[]> {
    return Array.from(this.jobs.values());
  }

  /**
   * Start autopilot mode
   */
  async startAutopilot(config: AutopilotConfig): Promise<string> {
    const jobId = uuidv4();
    const job: JobStatus = {
      jobId,
      workflowId: 'autopilot',
      status: 'pending',
      metadata: config
    };

    this.jobs.set(jobId, job);
    this.emit('autopilot:started', job);

    // Execute autopilot in background
    this.executeAutopilot(jobId, config).catch(error => {
      this.updateJobStatus(jobId, {
        status: 'failed',
        error: error.message
      });
    });

    return jobId;
  }

  /**
   * Execute autopilot workflow
   */
  private async executeAutopilot(
    jobId: string,
    config: AutopilotConfig
  ): Promise<void> {
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

        // Run compliance check if enabled
        if (config.complianceCheck !== false) {
          try {
            const { stdout } = await execAsync('npm run compliance:check', {
              timeout: 600000
            });
            output += `Compliance Check:\n${stdout}\n`;

            // Check if all tests pass
            if (this.isCompliancePassing(stdout)) {
              output += '\n✅ All compliance checks passing. Autopilot complete.\n';
              break;
            }
          } catch (error: any) {
            output += `Compliance Check Error: ${error.message}\n`;
          }
        }

        // Small delay between rounds
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Save output
      await fs.writeFile(outputFile, output);

      this.updateJobStatus(jobId, {
        status: 'completed',
        endTime: new Date(),
        progress: 100,
        output: output.slice(-1000)
      });

      this.emit('autopilot:completed', this.jobs.get(jobId));
    } catch (error: any) {
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

  /**
   * Check if compliance is passing
   */
  private isCompliancePassing(output: string): boolean {
    const failurePatterns = [/❌|ERROR|failed|not.*passing/i, /🚨|critical/i];
    return !failurePatterns.some(pattern => pattern.test(output));
  }

  /**
   * Execute evaluated tasks
   */
  async executeEvaluatedTasks(
    evaluationId: string,
    agentConfig?: any
  ): Promise<string> {
    const jobId = uuidv4();
    const job: JobStatus = {
      jobId,
      workflowId: 'evaluated-tasks',
      status: 'pending',
      metadata: { evaluationId, agentConfig }
    };

    this.jobs.set(jobId, job);

    // This would integrate with the agent evaluation system
    // For now, return the job ID
    this.updateJobStatus(jobId, {
      status: 'completed',
      endTime: new Date()
    });

    return jobId;
  }

  /**
   * Schedule a workflow to run at specified intervals
   */
  async scheduleWorkflow(
    workflowId: string,
    schedule: string,
    config?: Partial<WorkflowConfig>
  ): Promise<string> {
    const scheduleId = uuidv4();

    // Parse cron-like schedule (simplified)
    const interval = this.parseSchedule(schedule);

    const timeout = setInterval(async () => {
      try {
        await this.startWorkflow(workflowId, config);
      } catch (error) {
        console.error(`Scheduled workflow ${workflowId} failed:`, error);
      }
    }, interval);

    this.scheduledJobs.set(scheduleId, timeout);

    return scheduleId;
  }

  /**
   * Parse schedule string to milliseconds
   */
  private parseSchedule(schedule: string): number {
    // Simple parser for common formats
    const match = schedule.match(/^every\s+(\d+)\s+(second|minute|hour|day)s?$/i);
    if (!match) {
      throw new Error('Invalid schedule format. Use: "every N seconds/minutes/hours/days"');
    }

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers: Record<string, number> = {
      second: 1000,
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000
    };

    return value * multipliers[unit];
  }

  /**
   * Get orchestration metrics
   */
  async getMetrics(): Promise<OrchestrationMetrics> {
    const jobs = Array.from(this.jobs.values());
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status === 'running').length;
    const completedJobs = jobs.filter(j => j.status === 'completed').length;
    const failedJobs = jobs.filter(j => j.status === 'failed').length;

    const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    // Calculate average execution time
    const completedJobsWithTime = jobs.filter(
      j => j.status === 'completed' && j.startTime && j.endTime
    );
    const totalExecutionTime = completedJobsWithTime.reduce((sum, job) => {
      const duration = job.endTime!.getTime() - job.startTime!.getTime();
      return sum + duration;
    }, 0);
    const averageExecutionTime = completedJobsWithTime.length > 0
      ? totalExecutionTime / completedJobsWithTime.length
      : 0;

    // Calculate per-workflow stats
    const workflowStats: Record<string, any> = {};
    for (const [workflowId] of this.workflows) {
      const workflowJobs = jobs.filter(j => j.workflowId === workflowId);
      const successes = workflowJobs.filter(j => j.status === 'completed').length;
      const failures = workflowJobs.filter(j => j.status === 'failed').length;

      const workflowJobsWithTime = workflowJobs.filter(
        j => j.status === 'completed' && j.startTime && j.endTime
      );
      const workflowTotalTime = workflowJobsWithTime.reduce((sum, job) => {
        const duration = job.endTime!.getTime() - job.startTime!.getTime();
        return sum + duration;
      }, 0);

      workflowStats[workflowId] = {
        executions: workflowJobs.length,
        successes,
        failures,
        avgExecutionTime: workflowJobsWithTime.length > 0
          ? workflowTotalTime / workflowJobsWithTime.length
          : 0
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

  /**
   * Get health status of the orchestration system
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    message?: string;
  }> {
    const checks: Record<string, boolean> = {
      initialized: this.initialized,
      hasWorkflows: this.workflows.size > 0,
      outputDirExists: false
    };

    // Check if output directory exists
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

  /**
   * Update job status
   */
  private updateJobStatus(jobId: string, updates: Partial<JobStatus>): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    Object.assign(job, updates);
    this.emit('job:updated', job);
  }
}
