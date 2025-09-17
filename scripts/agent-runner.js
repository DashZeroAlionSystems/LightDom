#!/usr/bin/env node

/**
 * Agent Runner Script
 * Manages and executes Cursor background agents
 * Adheres to enterprise coding rules
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

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
    const prefix =
      {
        info: 'ℹ️',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        agent: '🤖',
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
          ...workflowsConfig.globalConfig,
        },
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
      errorCount: 0,
    };

    this.agents.set(agentId, agent);
    this.emit('agentStarted', agent);

    // Start the agent process
    try {
      const agentProcess = spawn('node', ['scripts/agent-executor.js', agentId], {
        stdio: 'pipe',
        env: { ...process.env, AGENT_CONFIG: JSON.stringify(agentConfig) },
      });

      agent.process = agentProcess;
      agent.status = 'running';

      agentProcess.stdout.on('data', data => {
        this.log(`[${agentConfig.name}] ${data.toString().trim()}`, 'info');
      });

      agentProcess.stderr.on('data', data => {
        this.log(`[${agentConfig.name}] ERROR: ${data.toString().trim()}`, 'error');
        agent.errorCount++;
      });

      agentProcess.on('close', code => {
        agent.status = 'stopped';
        this.log(`Agent ${agentConfig.name} stopped with code ${code}`, 'warning');
        this.emit('agentStopped', agent);
      });

      agentProcess.on('error', error => {
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
        ...options,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', data => {
        stdout += data.toString();
        if (options.verbose) {
          console.log(data.toString());
        }
      });

      child.stderr.on('data', data => {
        stderr += data.toString();
        if (options.verbose) {
          console.error(data.toString());
        }
      });

      child.on('close', code => {
        const duration = Date.now() - startTime;

        if (code === 0) {
          this.log(`Task ${taskName} completed successfully in ${duration}ms`, 'success');
          resolve({ code, stdout, stderr, duration });
        } else {
          this.log(`Task ${taskName} failed with code ${code}`, 'error');
          reject(new Error(`Task ${taskName} failed: ${stderr}`));
        }
      });

      child.on('error', error => {
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
      status: 'running',
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
        errorCount: agent.errorCount,
      })),
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
      '.md': ['Documentation Agent'],
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

  // Health check for agents
  async healthCheck() {
    const health = {
      status: 'healthy',
      agents: {},
      timestamp: new Date().toISOString(),
    };

    for (const [agentId, agent] of this.agents) {
      health.agents[agentId] = {
        status: agent.status,
        lastRun: agent.lastRun,
        errorCount: agent.errorCount,
        healthy: agent.status === 'running' && agent.errorCount < 5,
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
if (require.main === module) {
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

        default:
          console.log('Usage: node agent-runner.js [start|stop|status|health|task|workflow]');
          process.exit(1);
      }
    } catch (error) {
      console.error('Agent runner error:', error.message);
      process.exit(1);
    }
  }

  main();
}

module.exports = AgentRunner;
