#!/usr/bin/env node

/**
 * Workflow Automation with Real-Time Feedback
 * 
 * Executes n8n workflows with progress monitoring and change detection
 */

const axios = require('axios');
const EventEmitter = require('events');
const fs = require('fs').promises;
const path = require('path');

class WorkflowAutomationMonitor extends EventEmitter {
  constructor(n8nBaseUrl = 'http://localhost:5678', apiKey = null) {
    super();
    this.n8nBaseUrl = n8nBaseUrl;
    this.apiKey = apiKey;
    this.activeExecutions = new Map();
    this.feedbackLog = [];
  }

  /**
   * Get headers for n8n API
   */
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['X-N8N-API-KEY'] = this.apiKey;
    return headers;
  }

  /**
   * Execute workflow with real-time feedback
   */
  async executeWorkflowWithFeedback(workflowId, inputData = {}, options = {}) {
    console.log(`\n🚀 Starting workflow execution: ${workflowId}\n`);

    const feedback = {
      workflowId,
      startTime: new Date().toISOString(),
      status: 'starting',
      steps: []
    };

    this.feedbackLog.push(feedback);
    this.emit('start', feedback);

    try {
      // Start execution
      const response = await axios.post(
        `${this.n8nBaseUrl}/api/v1/workflows/${workflowId}/execute`,
        { data: inputData },
        { headers: this.getHeaders() }
      );

      const executionId = response.data.id || response.data.executionId;
      
      feedback.executionId = executionId;
      feedback.status = 'running';
      this.emit('executing', feedback);

      // Monitor execution
      const result = await this.monitorExecution(executionId, feedback, options);

      feedback.endTime = new Date().toISOString();
      feedback.status = result.finished ? 'completed' : 'failed';
      feedback.result = result;

      this.emit('complete', feedback);

      return { success: true, feedback };

    } catch (error) {
      feedback.status = 'error';
      feedback.error = error.message;
      feedback.endTime = new Date().toISOString();

      this.emit('error', feedback);

      return { success: false, feedback, error: error.message };
    }
  }

  /**
   * Monitor execution progress
   */
  async monitorExecution(executionId, feedback, options = {}) {
    const maxAttempts = options.maxAttempts || 60;
    const pollInterval = options.pollInterval || 2000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(
          `${this.n8nBaseUrl}/api/v1/executions/${executionId}`,
          { headers: this.getHeaders() }
        );

        const execution = response.data;

        // Update feedback
        if (execution.data && execution.data.resultData) {
          const { runData } = execution.data.resultData;
          
          if (runData) {
            const stepFeedback = this.extractStepFeedback(runData);
            feedback.steps = stepFeedback;
            this.emit('progress', { executionId, steps: stepFeedback });
          }
        }

        // Check if finished
        if (execution.finished) {
          return execution;
        }

        // Check if failed
        if (execution.stoppedAt && !execution.finished) {
          return execution;
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));

      } catch (error) {
        console.error(`⚠️  Error monitoring execution:`, error.message);
      }
    }

    throw new Error('Execution monitoring timeout');
  }

  /**
   * Extract feedback from execution steps
   */
  extractStepFeedback(runData) {
    const steps = [];

    for (const [nodeName, nodeData] of Object.entries(runData)) {
      if (Array.isArray(nodeData)) {
        nodeData.forEach((run, index) => {
          steps.push({
            node: nodeName,
            run: index,
            startTime: run.startTime,
            executionTime: run.executionTime,
            status: run.error ? 'failed' : 'completed',
            error: run.error || null,
            data: run.data ? run.data.length : 0
          });
        });
      }
    }

    return steps;
  }

  /**
   * Watch workflow file for changes
   */
  async watchWorkflowFile(filePath, options = {}) {
    console.log(`\n👀 Watching workflow file: ${filePath}\n`);

    try {
      const chokidar = require('chokidar');
      
      const watcher = chokidar.watch(filePath, {
        persistent: true,
        ignoreInitial: options.triggerInitial !== false
      });

      watcher.on('change', async (path) => {
        console.log(`\n🔄 Workflow file changed: ${path}`);
        
        this.emit('file-change', { path, timestamp: new Date().toISOString() });

        if (options.autoExecute) {
          try {
            const content = await fs.readFile(filePath, 'utf8');
            const workflow = JSON.parse(content);

            console.log(`♻️  Auto-executing workflow: ${workflow.name}\n`);

            const result = await this.executeWorkflowWithFeedback(
              workflow.id || workflow.name,
              options.inputData || {}
            );

            if (result.success) {
              console.log('✅ Workflow executed successfully\n');
            } else {
              console.log('❌ Workflow execution failed\n');
            }
          } catch (error) {
            console.error('❌ Error processing workflow:', error.message);
          }
        }
      });

      return watcher;

    } catch (error) {
      console.error('❌ Failed to watch file:', error.message);
      throw error;
    }
  }

  /**
   * Stream feedback to console
   */
  startConsoleFeedback() {
    this.on('start', (feedback) => {
      console.log(`\n📍 Workflow started: ${feedback.workflowId}`);
    });

    this.on('executing', (feedback) => {
      console.log(`⚙️  Execution ID: ${feedback.executionId}`);
    });

    this.on('progress', (data) => {
      console.log(`\n📊 Progress Update:`);
      data.steps.forEach(step => {
        const icon = step.status === 'completed' ? '✅' : '❌';
        console.log(`   ${icon} ${step.node} (${step.executionTime}ms)`);
      });
    });

    this.on('complete', (feedback) => {
      console.log(`\n✅ Workflow completed: ${feedback.workflowId}`);
      console.log(`   Duration: ${new Date(feedback.endTime) - new Date(feedback.startTime)}ms`);
    });

    this.on('error', (feedback) => {
      console.log(`\n❌ Workflow error: ${feedback.error}`);
    });
  }

  /**
   * Stream feedback to file
   */
  async startFileFeedback(outputFile) {
    const writeUpdate = async (data) => {
      try {
        await fs.appendFile(
          outputFile,
          JSON.stringify({ timestamp: new Date().toISOString(), ...data }) + '\n'
        );
      } catch (error) {
        console.error('⚠️  Failed to write feedback:', error.message);
      }
    };

    this.on('start', (feedback) => writeUpdate({ event: 'start', feedback }));
    this.on('executing', (feedback) => writeUpdate({ event: 'executing', feedback }));
    this.on('progress', (data) => writeUpdate({ event: 'progress', data }));
    this.on('complete', (feedback) => writeUpdate({ event: 'complete', feedback }));
    this.on('error', (feedback) => writeUpdate({ event: 'error', feedback }));
  }

  /**
   * Get feedback summary
   */
  getFeedbackSummary() {
    return {
      total: this.feedbackLog.length,
      completed: this.feedbackLog.filter(f => f.status === 'completed').length,
      failed: this.feedbackLog.filter(f => f.status === 'failed').length,
      running: this.feedbackLog.filter(f => f.status === 'running').length,
      log: this.feedbackLog
    };
  }

  /**
   * Interactive monitoring
   */
  async interactive() {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise((resolve) => {
      rl.question(prompt, resolve);
    });

    try {
      console.log('\n' + '='.repeat(70));
      console.log('🔄 WORKFLOW AUTOMATION MONITOR');
      console.log('='.repeat(70) + '\n');

      this.startConsoleFeedback();

      const mode = await question('Choose mode:\n  1. Execute workflow\n  2. Watch and auto-execute\n  3. Monitor existing execution\nChoice (1-3): ');

      if (mode === '1') {
        const workflowId = await question('\nWorkflow ID: ');
        const inputData = await question('Input data (JSON, or Enter for empty): ');

        const data = inputData.trim() ? JSON.parse(inputData) : {};

        await this.executeWorkflowWithFeedback(workflowId, data);

      } else if (mode === '2') {
        const filePath = await question('\nWorkflow file path: ');
        const autoExecute = (await question('Auto-execute on change? (y/n): ')).toLowerCase() === 'y';

        await this.watchWorkflowFile(filePath, { autoExecute });

        console.log('\nPress Ctrl+C to stop watching\n');
        await new Promise(() => {}); // Keep alive

      } else if (mode === '3') {
        const executionId = await question('\nExecution ID: ');

        const feedback = { executionId, status: 'monitoring' };
        const result = await this.monitorExecution(executionId, feedback);

        console.log('\n📊 Execution Result:\n');
        console.log(JSON.stringify(result, null, 2));
      }

    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      rl.close();
    }
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  const n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
  const apiKey = process.env.N8N_API_KEY || null;

  const monitor = new WorkflowAutomationMonitor(n8nBaseUrl, apiKey);

  if (args.length === 0 || args[0] === '--interactive' || args[0] === '-i') {
    await monitor.interactive();
  } else if (args[0] === '--execute' || args[0] === '-e') {
    const workflowId = args[1];
    const inputData = args[2] ? JSON.parse(args[2]) : {};

    monitor.startConsoleFeedback();
    
    const result = await monitor.executeWorkflowWithFeedback(workflowId, inputData);

    if (result.success) {
      console.log('\n✅ Success\n');
      process.exit(0);
    } else {
      console.log('\n❌ Failed\n');
      process.exit(1);
    }
  } else if (args[0] === '--watch' || args[0] === '-w') {
    const filePath = args[1];
    const autoExecute = args.includes('--auto');

    monitor.startConsoleFeedback();
    
    await monitor.watchWorkflowFile(filePath, { autoExecute });

    console.log('\nPress Ctrl+C to stop\n');
    await new Promise(() => {});
  } else {
    console.log('Usage:');
    console.log('  node workflow-automation-monitor.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  -i, --interactive                Interactive mode');
    console.log('  -e, --execute <id> [data]        Execute workflow');
    console.log('  -w, --watch <file> [--auto]      Watch file for changes');
    console.log('');
    console.log('Examples:');
    console.log('  node workflow-automation-monitor.js -i');
    console.log('  node workflow-automation-monitor.js -e workflow-123');
    console.log('  node workflow-automation-monitor.js -w workflow.json --auto');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = WorkflowAutomationMonitor;
