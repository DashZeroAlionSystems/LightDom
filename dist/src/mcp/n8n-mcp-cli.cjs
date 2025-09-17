#!/usr/bin/env node
'use strict';
/**
 * n8n MCP CLI Tool
 *
 * Command-line interface for managing n8n MCP server integration
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.N8nMCPCLI = void 0;
const commander_1 = require('commander');
const n8n_mcp_server_js_1 = require('./n8n-mcp-server.js');
const fs = __importStar(require('fs/promises'));
const chalk_1 = __importDefault(require('chalk'));
const ora_1 = __importDefault(require('ora'));
const axios_1 = __importDefault(require('axios'));
class N8nMCPCLI {
  constructor(config) {
    this.config = config;
  }
  async testConnection() {
    const spinner = (0, ora_1.default)('Testing n8n connection...').start();
    try {
      const response = await axios_1.default.get(`${this.config.baseUrl}/api/v1/workflows`, {
        headers: this.config.apiKey ? { 'X-N8N-API-KEY': this.config.apiKey } : {},
        timeout: this.config.timeout,
      });
      spinner.succeed('n8n connection successful');
      console.log(chalk_1.default.green(`Connected to n8n at ${this.config.baseUrl}`));
      console.log(chalk_1.default.blue(`Found ${response.data?.data?.length || 0} workflows`));
      return true;
    } catch (error) {
      spinner.fail('n8n connection failed');
      console.error(
        chalk_1.default.red(`Error: ${error instanceof Error ? error.message : String(error)}`)
      );
      return false;
    }
  }
  async listWorkflows() {
    const spinner = (0, ora_1.default)('Fetching workflows...').start();
    try {
      const response = await axios_1.default.get(`${this.config.baseUrl}/api/v1/workflows`, {
        headers: this.config.apiKey ? { 'X-N8N-API-KEY': this.config.apiKey } : {},
        timeout: this.config.timeout,
      });
      spinner.succeed('Workflows fetched');
      const workflows = response.data?.data || response.data || [];
      if (workflows.length === 0) {
        console.log(chalk_1.default.yellow('No workflows found'));
        return;
      }
      console.log(chalk_1.default.blue('\n📋 Available Workflows:'));
      console.log(chalk_1.default.gray('─'.repeat(80)));
      workflows.forEach(workflow => {
        const status = workflow.active
          ? chalk_1.default.green('● Active')
          : chalk_1.default.gray('○ Inactive');
        const nodes = workflow.nodes?.length || 0;
        console.log(`${chalk_1.default.bold(workflow.name)} (${workflow.id})`);
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
      console.error(
        chalk_1.default.red(`Error: ${error instanceof Error ? error.message : String(error)}`)
      );
    }
  }
  async createSampleWorkflow() {
    const spinner = (0, ora_1.default)('Creating sample workflow...').start();
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
      const response = await axios_1.default.post(
        `${this.config.baseUrl}/api/v1/workflows`,
        sampleWorkflow,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey ? { 'X-N8N-API-KEY': this.config.apiKey } : {}),
          },
          timeout: this.config.timeout,
        }
      );
      spinner.succeed('Sample workflow created');
      console.log(chalk_1.default.green(`Workflow ID: ${response.data.id}`));
      console.log(chalk_1.default.blue('You can now use this workflow with the MCP server'));
    } catch (error) {
      spinner.fail('Failed to create sample workflow');
      console.error(
        chalk_1.default.red(`Error: ${error instanceof Error ? error.message : String(error)}`)
      );
    }
  }
  async exportWorkflow(workflowId, outputPath) {
    const spinner = (0, ora_1.default)(`Exporting workflow ${workflowId}...`).start();
    try {
      const response = await axios_1.default.get(
        `${this.config.baseUrl}/api/v1/workflows/${workflowId}`,
        {
          headers: this.config.apiKey ? { 'X-N8N-API-KEY': this.config.apiKey } : {},
          timeout: this.config.timeout,
        }
      );
      const exportData = {
        workflow: response.data,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };
      const fileName = outputPath || `workflow-${workflowId}-${Date.now()}.json`;
      await fs.writeFile(fileName, JSON.stringify(exportData, null, 2));
      spinner.succeed('Workflow exported');
      console.log(chalk_1.default.green(`Exported to: ${fileName}`));
    } catch (error) {
      spinner.fail('Failed to export workflow');
      console.error(
        chalk_1.default.red(`Error: ${error instanceof Error ? error.message : String(error)}`)
      );
    }
  }
  async importWorkflow(filePath, newName) {
    const spinner = (0, ora_1.default)(`Importing workflow from ${filePath}...`).start();
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const importData = JSON.parse(fileContent);
      const workflowData = {
        name: newName || importData.workflow.name || `Imported-${Date.now()}`,
        nodes: importData.workflow.nodes,
        connections: importData.workflow.connections,
        active: false,
      };
      const response = await axios_1.default.post(
        `${this.config.baseUrl}/api/v1/workflows`,
        workflowData,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.apiKey ? { 'X-N8N-API-KEY': this.config.apiKey } : {}),
          },
          timeout: this.config.timeout,
        }
      );
      spinner.succeed('Workflow imported');
      console.log(chalk_1.default.green(`Imported workflow ID: ${response.data.id}`));
    } catch (error) {
      spinner.fail('Failed to import workflow');
      console.error(
        chalk_1.default.red(`Error: ${error instanceof Error ? error.message : String(error)}`)
      );
    }
  }
  async generateConfig() {
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
      console.log(chalk_1.default.green(`MCP configuration saved to ${configPath}`));
      console.log(chalk_1.default.blue('Add this file to your Cursor MCP settings'));
    } catch (error) {
      console.error(
        chalk_1.default.red(
          `Failed to save config: ${error instanceof Error ? error.message : String(error)}`
        )
      );
    }
  }
  async startServer() {
    console.log(chalk_1.default.blue('Starting n8n MCP Server...'));
    const server = new n8n_mcp_server_js_1.N8nMCPServer({
      baseUrl: this.config.baseUrl,
      apiKey: this.config.apiKey,
      timeout: this.config.timeout,
    });
    await server.run();
  }
}
exports.N8nMCPCLI = N8nMCPCLI;
// CLI Program Setup
commander_1.program
  .name('n8n-mcp-cli')
  .description('CLI tool for n8n MCP integration')
  .version('1.0.0');
commander_1.program
  .option('-u, --url <url>', 'n8n base URL', 'http://localhost:5678')
  .option('-k, --api-key <key>', 'n8n API key')
  .option('-t, --timeout <ms>', 'Request timeout in milliseconds', '30000');
commander_1.program
  .command('test')
  .description('Test connection to n8n instance')
  .action(async options => {
    const config = {
      baseUrl: options.url || 'http://localhost:5678',
      apiKey: options.apiKey,
      timeout: parseInt(options.timeout),
    };
    const cli = new N8nMCPCLI(config);
    await cli.testConnection();
  });
commander_1.program
  .command('list')
  .description('List all workflows')
  .action(async options => {
    const config = {
      baseUrl: options.url || 'http://localhost:5678',
      apiKey: options.apiKey,
      timeout: parseInt(options.timeout),
    };
    const cli = new N8nMCPCLI(config);
    await cli.listWorkflows();
  });
commander_1.program
  .command('create-sample')
  .description('Create a sample workflow for testing')
  .action(async options => {
    const config = {
      baseUrl: options.url || 'http://localhost:5678',
      apiKey: options.apiKey,
      timeout: parseInt(options.timeout),
    };
    const cli = new N8nMCPCLI(config);
    await cli.createSampleWorkflow();
  });
commander_1.program
  .command('export <workflowId>')
  .description('Export a workflow to JSON file')
  .option('-o, --output <path>', 'Output file path')
  .action(async (workflowId, options) => {
    const config = {
      baseUrl: options.url || 'http://localhost:5678',
      apiKey: options.apiKey,
      timeout: parseInt(options.timeout),
    };
    const cli = new N8nMCPCLI(config);
    await cli.exportWorkflow(workflowId, options.output);
  });
commander_1.program
  .command('import <filePath>')
  .description('Import a workflow from JSON file')
  .option('-n, --name <name>', 'New name for the imported workflow')
  .action(async (filePath, options) => {
    const config = {
      baseUrl: options.url || 'http://localhost:5678',
      apiKey: options.apiKey,
      timeout: parseInt(options.timeout),
    };
    const cli = new N8nMCPCLI(config);
    await cli.importWorkflow(filePath, options.name);
  });
commander_1.program
  .command('generate-config')
  .description('Generate MCP configuration file')
  .action(async options => {
    const config = {
      baseUrl: options.url || 'http://localhost:5678',
      apiKey: options.apiKey,
      timeout: parseInt(options.timeout),
    };
    const cli = new N8nMCPCLI(config);
    await cli.generateConfig();
  });
commander_1.program
  .command('start-server')
  .description('Start the MCP server')
  .action(async options => {
    const config = {
      baseUrl: options.url || 'http://localhost:5678',
      apiKey: options.apiKey,
      timeout: parseInt(options.timeout),
    };
    const cli = new N8nMCPCLI(config);
    await cli.startServer();
  });
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(
    chalk_1.default.red('Unhandled Rejection at:'),
    promise,
    chalk_1.default.red('reason:'),
    reason
  );
  process.exit(1);
});
// Parse command line arguments
commander_1.program.parse();
