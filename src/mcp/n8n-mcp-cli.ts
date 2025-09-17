#!/usr/bin/env node

/**
 * n8n MCP CLI Tool
 *
 * Command-line interface for managing n8n MCP server integration
 */

import { program } from 'commander';
import { N8nMCPServer } from './n8n-mcp-server.js';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import ora from 'ora';
import axios from 'axios';

interface CLIConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
}

class N8nMCPCLI {
  private config: CLIConfig;

  constructor(config: CLIConfig) {
    this.config = config;
  }

  async testConnection(): Promise<boolean> {
    const spinner = ora('Testing n8n connection...').start();

    try {
      const response = await axios.get(`${this.config.baseUrl}/api/v1/workflows`, {
        headers: this.config.apiKey ? { 'X-N8N-API-KEY': this.config.apiKey } : {},
        timeout: this.config.timeout,
      });

      spinner.succeed('n8n connection successful');
      console.log(chalk.green(`Connected to n8n at ${this.config.baseUrl}`));
      console.log(chalk.blue(`Found ${response.data?.data?.length || 0} workflows`));
      return true;
    } catch (error) {
      spinner.fail('n8n connection failed');
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
      return false;
    }
  }

  async listWorkflows(): Promise<void> {
    const spinner = ora('Fetching workflows...').start();

    try {
      const response = await axios.get(`${this.config.baseUrl}/api/v1/workflows`, {
        headers: this.config.apiKey ? { 'X-N8N-API-KEY': this.config.apiKey } : {},
        timeout: this.config.timeout,
      });

      spinner.succeed('Workflows fetched');

      const workflows = response.data?.data || response.data || [];

      if (workflows.length === 0) {
        console.log(chalk.yellow('No workflows found'));
        return;
      }

      console.log(chalk.blue('\n📋 Available Workflows:'));
      console.log(chalk.gray('─'.repeat(80)));

      workflows.forEach((workflow: any) => {
        const status = workflow.active ? chalk.green('● Active') : chalk.gray('○ Inactive');
        const nodes = workflow.nodes?.length || 0;
        console.log(`${chalk.bold(workflow.name)} (${workflow.id})`);
        console.log(
          `  ${status} | ${nodes} nodes | Created: ${new Date(workflow.createdAt).toLocaleDateString()}`
        );
        if (workflow.tags?.length > 0) {
          console.log(`  Tags: ${workflow.tags.join(', ')}`);
        }
        console.log('');
      });
    } catch (error) {
      spinner.fail('Failed to fetch workflows');
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async createSampleWorkflow(): Promise<void> {
    const spinner = ora('Creating sample workflow...').start();

    const sampleWorkflow = {
      name: 'Sample Webhook Workflow',
      nodes: [
        {
          id: 'webhook-trigger',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
          parameters: {
            httpMethod: 'POST',
            path: 'sample-webhook',
          },
        },
        {
          id: 'set-data',
          name: 'Set Data',
          type: 'n8n-nodes-base.set',
          typeVersion: 1,
          position: [460, 300],
          parameters: {
            values: {
              string: [
                {
                  name: 'message',
                  value: 'Hello from n8n MCP!',
                },
              ],
            },
          },
        },
      ],
      connections: {
        'webhook-trigger': {
          main: [[{ node: 'set-data', type: 'main', index: 0 }]],
        },
      },
      active: false,
    };

    try {
      const response = await axios.post(`${this.config.baseUrl}/api/v1/workflows`, sampleWorkflow, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'X-N8N-API-KEY': this.config.apiKey } : {}),
        },
        timeout: this.config.timeout,
      });

      spinner.succeed('Sample workflow created');
      console.log(chalk.green(`Workflow ID: ${response.data.id}`));
      console.log(chalk.blue('You can now use this workflow with the MCP server'));
    } catch (error) {
      spinner.fail('Failed to create sample workflow');
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async exportWorkflow(workflowId: string, outputPath?: string): Promise<void> {
    const spinner = ora(`Exporting workflow ${workflowId}...`).start();

    try {
      const response = await axios.get(`${this.config.baseUrl}/api/v1/workflows/${workflowId}`, {
        headers: this.config.apiKey ? { 'X-N8N-API-KEY': this.config.apiKey } : {},
        timeout: this.config.timeout,
      });

      const exportData = {
        workflow: response.data,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      const fileName = outputPath || `workflow-${workflowId}-${Date.now()}.json`;
      await fs.writeFile(fileName, JSON.stringify(exportData, null, 2));

      spinner.succeed('Workflow exported');
      console.log(chalk.green(`Exported to: ${fileName}`));
    } catch (error) {
      spinner.fail('Failed to export workflow');
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async importWorkflow(filePath: string, newName?: string): Promise<void> {
    const spinner = ora(`Importing workflow from ${filePath}...`).start();

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const importData = JSON.parse(fileContent);

      const workflowData = {
        name: newName || importData.workflow.name || `Imported-${Date.now()}`,
        nodes: importData.workflow.nodes,
        connections: importData.workflow.connections,
        active: false,
      };

      const response = await axios.post(`${this.config.baseUrl}/api/v1/workflows`, workflowData, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey ? { 'X-N8N-API-KEY': this.config.apiKey } : {}),
        },
        timeout: this.config.timeout,
      });

      spinner.succeed('Workflow imported');
      console.log(chalk.green(`Imported workflow ID: ${response.data.id}`));
    } catch (error) {
      spinner.fail('Failed to import workflow');
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async generateConfig(): Promise<void> {
    const configPath = 'mcp-config.json';
    const config = {
      mcpServers: {
        n8n: {
          command: 'node',
          args: ['dist/src/mcp/n8n-mcp-server.js'],
          env: {
            N8N_BASE_URL: this.config.baseUrl,
            N8N_API_KEY: this.config.apiKey || '',
            N8N_WEBHOOK_URL: '',
            N8N_TIMEOUT: this.config.timeout.toString(),
          },
        },
      },
    };

    try {
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      console.log(chalk.green(`MCP configuration saved to ${configPath}`));
      console.log(chalk.blue('Add this file to your Cursor MCP settings'));
    } catch (error) {
      console.error(
        chalk.red(
          `Failed to save config: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  }

  async startServer(): Promise<void> {
    console.log(chalk.blue('Starting n8n MCP Server...'));
    const server = new N8nMCPServer({
      baseUrl: this.config.baseUrl,
      apiKey: this.config.apiKey,
      timeout: this.config.timeout,
    });

    await server.run();
  }
}

// CLI Program Setup
program.name('n8n-mcp-cli').description('CLI tool for n8n MCP integration').version('1.0.0');

program
  .option('-u, --url <url>', 'n8n base URL', 'http://localhost:5678')
  .option('-k, --api-key <key>', 'n8n API key')
  .option('-t, --timeout <ms>', 'Request timeout in milliseconds', '30000');

program
  .command('test')
  .description('Test connection to n8n instance')
  .action(async options => {
    const config: CLIConfig = {
      baseUrl: options.url || 'http://localhost:5678',
      apiKey: options.apiKey,
      timeout: parseInt(options.timeout),
    };

    const cli = new N8nMCPCLI(config);
    await cli.testConnection();
  });

program
  .command('list')
  .description('List all workflows')
  .action(async options => {
    const config: CLIConfig = {
      baseUrl: options.url || 'http://localhost:5678',
      apiKey: options.apiKey,
      timeout: parseInt(options.timeout),
    };

    const cli = new N8nMCPCLI(config);
    await cli.listWorkflows();
  });

program
  .command('create-sample')
  .description('Create a sample workflow for testing')
  .action(async options => {
    const config: CLIConfig = {
      baseUrl: options.url || 'http://localhost:5678',
      apiKey: options.apiKey,
      timeout: parseInt(options.timeout),
    };

    const cli = new N8nMCPCLI(config);
    await cli.createSampleWorkflow();
  });

program
  .command('export <workflowId>')
  .description('Export a workflow to JSON file')
  .option('-o, --output <path>', 'Output file path')
  .action(async (workflowId, options) => {
    const config: CLIConfig = {
      baseUrl: options.url || 'http://localhost:5678',
      apiKey: options.apiKey,
      timeout: parseInt(options.timeout),
    };

    const cli = new N8nMCPCLI(config);
    await cli.exportWorkflow(workflowId, options.output);
  });

program
  .command('import <filePath>')
  .description('Import a workflow from JSON file')
  .option('-n, --name <name>', 'New name for the imported workflow')
  .action(async (filePath, options) => {
    const config: CLIConfig = {
      baseUrl: options.url || 'http://localhost:5678',
      apiKey: options.apiKey,
      timeout: parseInt(options.timeout),
    };

    const cli = new N8nMCPCLI(config);
    await cli.importWorkflow(filePath, options.name);
  });

program
  .command('generate-config')
  .description('Generate MCP configuration file')
  .action(async options => {
    const config: CLIConfig = {
      baseUrl: options.url || 'http://localhost:5678',
      apiKey: options.apiKey,
      timeout: parseInt(options.timeout),
    };

    const cli = new N8nMCPCLI(config);
    await cli.generateConfig();
  });

program
  .command('start-server')
  .description('Start the MCP server')
  .action(async options => {
    const config: CLIConfig = {
      baseUrl: options.url || 'http://localhost:5678',
      apiKey: options.apiKey,
      timeout: parseInt(options.timeout),
    };

    const cli = new N8nMCPCLI(config);
    await cli.startServer();
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();

export { N8nMCPCLI };
