#!/usr/bin/env node

/**
 * Automated Deployment Script
 * Handles automated deployments with quality gates and rollback capabilities
 * Adheres to enterprise coding rules
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutomatedDeployment {
  constructor(environment = 'staging') {
    this.environment = environment;
    this.deploymentId = `deploy-${Date.now()}`;
    this.startTime = Date.now();
    this.rollbackData = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        info: 'ℹ️',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        deploy: '🚀',
      }[type] || 'ℹ️';

    console.log(`${prefix} [${timestamp}] [${this.deploymentId}] ${message}`);
  }

  async runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, options.args || [], {
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
        resolve({
          code,
          stdout,
          stderr,
        });
      });

      child.on('error', error => {
        reject(error);
      });
    });
  }

  async validateEnvironment() {
    this.log(`Validating deployment environment: ${this.environment}`);

    const environments = {
      development: {
        url: 'http://localhost:3000',
        qualityGates: ['preCommit'],
      },
      staging: {
        url: 'https://staging.lightdom.com',
        qualityGates: ['preCommit', 'preMerge'],
      },
      production: {
        url: 'https://lightdom.com',
        qualityGates: ['preCommit', 'preMerge', 'preDeployment'],
      },
    };

    if (!environments[this.environment]) {
      throw new Error(`Invalid environment: ${this.environment}`);
    }

    this.envConfig = environments[this.environment];
    this.log(`Environment validated: ${this.environment}`, 'success');
  }

  async runQualityGates() {
    this.log('Running quality gates...');

    try {
      const result = await this.runCommand('node scripts/quality-gates.js', {
        verbose: true,
      });

      if (result.code === 0) {
        this.log('Quality gates passed', 'success');
      } else {
        throw new Error('Quality gates failed');
      }
    } catch (error) {
      this.log(`Quality gates failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async buildApplication() {
    this.log('Building application...');

    try {
      const result = await this.runCommand('npm run build', {
        verbose: true,
      });

      if (result.code === 0) {
        this.log('Application built successfully', 'success');
      } else {
        throw new Error('Build failed');
      }
    } catch (error) {
      this.log(`Build failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async runTests() {
    this.log('Running test suite...');

    const testCommands = ['npm run test:unit', 'npm run test:integration', 'npm run test:e2e'];

    for (const command of testCommands) {
      try {
        const result = await this.runCommand(command, { verbose: true });
        if (result.code !== 0) {
          throw new Error(`Test failed: ${command}`);
        }
      } catch (error) {
        this.log(`Test failed: ${command} - ${error.message}`, 'error');
        throw error;
      }
    }

    this.log('All tests passed', 'success');
  }

  async createBackup() {
    this.log('Creating backup...');

    const backupData = {
      deploymentId: this.deploymentId,
      timestamp: new Date().toISOString(),
      environment: this.environment,
      gitCommit: execSync('git rev-parse HEAD').toString().trim(),
      gitBranch: execSync('git branch --show-current').toString().trim(),
    };

    this.rollbackData = backupData;

    // Save backup data
    fs.writeFileSync(
      `.deployments/${this.deploymentId}-backup.json`,
      JSON.stringify(backupData, null, 2)
    );

    this.log('Backup created', 'success');
  }

  async deployToEnvironment() {
    this.log(`Deploying to ${this.environment}...`, 'deploy');

    const deployCommands = {
      development: 'npm run dev',
      staging: 'npm run deploy:staging',
      production: 'npm run deploy:production',
    };

    try {
      const result = await this.runCommand(deployCommands[this.environment], {
        verbose: true,
      });

      if (result.code === 0) {
        this.log(`Deployment to ${this.environment} successful`, 'success');
      } else {
        throw new Error(`Deployment to ${this.environment} failed`);
      }
    } catch (error) {
      this.log(`Deployment failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async runSmokeTests() {
    this.log('Running smoke tests...');

    try {
      const result = await this.runCommand('npm run test:smoke', {
        verbose: true,
      });

      if (result.code === 0) {
        this.log('Smoke tests passed', 'success');
      } else {
        throw new Error('Smoke tests failed');
      }
    } catch (error) {
      this.log(`Smoke tests failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async monitorDeployment() {
    this.log('Monitoring deployment health...');

    const healthCheckUrl = `${this.envConfig.url}/health`;
    const maxAttempts = 30;
    const interval = 10000; // 10 seconds

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const result = await this.runCommand(`curl -f ${healthCheckUrl}`);
        if (result.code === 0) {
          this.log('Health check passed', 'success');
          return;
        }
      } catch (error) {
        this.log(`Health check attempt ${i + 1} failed, retrying...`, 'warning');
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Health check failed after maximum attempts');
  }

  async rollback() {
    this.log('Initiating rollback...', 'warning');

    if (!this.rollbackData) {
      this.log('No rollback data available', 'error');
      return;
    }

    try {
      // Restore previous version
      execSync(`git checkout ${this.rollbackData.gitCommit}`);

      // Redeploy
      await this.deployToEnvironment();

      this.log('Rollback completed', 'success');
    } catch (error) {
      this.log(`Rollback failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async sendNotification(status, message) {
    this.log(`Sending notification: ${status} - ${message}`);

    // Send to Slack
    const slackMessage = {
      text: `Deployment ${status}`,
      attachments: [
        {
          color: status === 'success' ? 'good' : 'danger',
          fields: [
            {
              title: 'Environment',
              value: this.environment,
              short: true,
            },
            {
              title: 'Deployment ID',
              value: this.deploymentId,
              short: true,
            },
            {
              title: 'Message',
              value: message,
              short: false,
            },
          ],
        },
      ],
    };

    // In a real implementation, you would send this to Slack
    this.log(`Slack notification: ${JSON.stringify(slackMessage)}`);
  }

  async deploy() {
    try {
      this.log(`Starting deployment to ${this.environment}`, 'deploy');

      // Validate environment
      await this.validateEnvironment();

      // Run quality gates
      await this.runQualityGates();

      // Build application
      await this.buildApplication();

      // Run tests
      await this.runTests();

      // Create backup
      await this.createBackup();

      // Deploy to environment
      await this.deployToEnvironment();

      // Run smoke tests
      await this.runSmokeTests();

      // Monitor deployment
      await this.monitorDeployment();

      const duration = Date.now() - this.startTime;
      this.log(`Deployment completed successfully in ${(duration / 1000).toFixed(2)}s`, 'success');

      await this.sendNotification('success', 'Deployment completed successfully');
    } catch (error) {
      this.log(`Deployment failed: ${error.message}`, 'error');

      try {
        await this.rollback();
        await this.sendNotification('rollback', 'Deployment failed and rolled back');
      } catch (rollbackError) {
        this.log(`Rollback failed: ${rollbackError.message}`, 'error');
        await this.sendNotification('failed', 'Deployment failed and rollback failed');
      }

      process.exit(1);
    }
  }
}

// Run deployment
if (require.main === module) {
  const environment = process.argv[2] || 'staging';
  const deployment = new AutomatedDeployment(environment);
  deployment.deploy().catch(error => {
    console.error('Deployment script failed:', error);
    process.exit(1);
  });
}

module.exports = AutomatedDeployment;
