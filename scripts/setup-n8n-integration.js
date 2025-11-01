#!/usr/bin/env node

/**
 * n8n Integration Setup Script
 * 
 * Sets up n8n workflow engine integration with LightDom platform.
 * Includes Docker setup, API configuration, and workflow templates.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class N8nSetupService {
  constructor() {
    this.n8nDir = path.join(process.cwd(), 'workflows', 'n8n');
    this.credentialsDir = path.join(this.n8nDir, 'credentials');
    this.templatesDir = path.join(this.n8nDir, 'templates');
  }

  async run() {
    console.log('🚀 Setting up n8n Workflow Engine Integration\n');
    console.log('='.repeat(50));
    console.log('\n');

    try {
      // Create directories
      await this.createDirectories();

      // Generate n8n configuration
      await this.generateN8nConfig();

      // Create workflow templates
      await this.createWorkflowTemplates();

      // Create credentials templates
      await this.createCredentialTemplates();

      // Setup Docker environment
      await this.setupDockerEnvironment();

      // Create API integration
      await this.createApiIntegration();

      // Generate documentation
      await this.generateDocumentation();

      console.log('\n✅ n8n Integration Setup Complete!\n');
      this.printNextSteps();
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Create required directories
   */
  async createDirectories() {
    console.log('📁 Creating directories...');

    const dirs = [
      this.n8nDir,
      this.credentialsDir,
      this.templatesDir,
      path.join(process.cwd(), 'data', 'workflow-patterns'),
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`  ✓ Created ${dir}`);
      }
    }

    console.log('');
  }

  /**
   * Generate n8n configuration
   */
  async generateN8nConfig() {
    console.log('⚙️  Generating n8n configuration...');

    const config = {
      database: {
        type: 'postgresdb',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: 'n8n',
        user: process.env.DB_USER || 'lightdom_user',
        password: process.env.DB_PASSWORD || 'lightdom_password',
      },
      endpoints: {
        rest: 'http://localhost:5678',
        webhook: 'http://localhost:5678/',
        webhookTest: 'http://localhost:5678/',
      },
      security: {
        basicAuth: {
          active: true,
          user: 'admin',
          password: process.env.N8N_PASSWORD || 'lightdom_n8n_password',
        },
      },
      executions: {
        process: 'main',
        saveDataOnError: 'all',
        saveDataOnSuccess: 'all',
        saveManualExecutions: true,
      },
    };

    fs.writeFileSync(
      path.join(this.n8nDir, 'config.json'),
      JSON.stringify(config, null, 2)
    );

    console.log('  ✓ Configuration generated\n');
  }

  /**
   * Create workflow templates
   */
  async createWorkflowTemplates() {
    console.log('📝 Creating workflow templates...');

    // DOM Optimization Workflow
    const domOptimizationWorkflow = {
      name: 'LightDom - DOM Optimization Pipeline',
      nodes: [
        {
          parameters: {
            path: 'dom-optimize',
            options: {},
            responseMode: 'onReceived',
            responseData: 'firstEntryJson',
          },
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300],
          webhookId: 'dom-optimize',
        },
        {
          parameters: {
            functionCode: `// Validate input URL
const url = items[0].json.url;
if (!url) {
  throw new Error('URL is required');
}

return items.map(item => ({
  json: {
    ...item.json,
    validated: true,
    timestamp: new Date().toISOString()
  }
}));`,
          },
          name: 'Validate Input',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [450, 300],
        },
        {
          parameters: {
            url: '=http://app:3001/api/crawler/start',
            sendBody: true,
            bodyParameters: {
              parameters: [
                {
                  name: 'url',
                  value: '={{$json.url}}',
                },
              ],
            },
            options: {},
          },
          name: 'Crawl Website',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 3,
          position: [650, 300],
        },
        {
          parameters: {
            functionCode: `// Optimize DOM
const crawlData = items[0].json;

return items.map(item => ({
  json: {
    ...item.json,
    optimization: {
      score: 85,
      improvements: ['Reduced DOM depth', 'Removed unused CSS', 'Optimized images'],
      performanceGain: 32.5
    }
  }
}));`,
          },
          name: 'Optimize DOM',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [850, 300],
        },
        {
          parameters: {
            url: '=http://app:3001/api/blockchain/mine',
            sendBody: true,
            bodyParameters: {
              parameters: [
                {
                  name: 'data',
                  value: '={{$json}}',
                },
              ],
            },
            options: {},
          },
          name: 'Record on Blockchain',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 3,
          position: [1050, 300],
        },
        {
          parameters: {
            url: '=http://app:3001/api/headless/notifications/test',
            sendBody: true,
            bodyParameters: {
              parameters: [
                {
                  name: 'type',
                  value: 'optimization',
                },
                {
                  name: 'message',
                  value: '=Optimization completed for {{$json.url}}',
                },
              ],
            },
            options: {},
          },
          name: 'Send Notification',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 3,
          position: [1250, 300],
        },
      ],
      connections: {
        Webhook: {
          main: [[{ node: 'Validate Input', type: 'main', index: 0 }]],
        },
        'Validate Input': {
          main: [[{ node: 'Crawl Website', type: 'main', index: 0 }]],
        },
        'Crawl Website': {
          main: [[{ node: 'Optimize DOM', type: 'main', index: 0 }]],
        },
        'Optimize DOM': {
          main: [[{ node: 'Record on Blockchain', type: 'main', index: 0 }]],
        },
        'Record on Blockchain': {
          main: [[{ node: 'Send Notification', type: 'main', index: 0 }]],
        },
      },
      active: false,
      settings: {},
      id: 'dom-optimization-pipeline',
    };

    fs.writeFileSync(
      path.join(this.templatesDir, 'dom-optimization-workflow.json'),
      JSON.stringify(domOptimizationWorkflow, null, 2)
    );

    // Data Sync Workflow
    const dataSyncWorkflow = {
      name: 'LightDom - Data Synchronization',
      nodes: [
        {
          parameters: {
            rule: {
              interval: [
                {
                  field: 'cronExpression',
                  expression: '0 * * * *',
                },
              ],
            },
          },
          name: 'Schedule Trigger',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [250, 300],
        },
        {
          parameters: {
            operation: 'executeQuery',
            query: 'SELECT * FROM optimizations WHERE synced = false LIMIT 100',
          },
          name: 'Fetch Unsynced Data',
          type: 'n8n-nodes-base.postgres',
          typeVersion: 2,
          position: [450, 300],
          credentials: {
            postgres: {
              id: '1',
              name: 'LightDom PostgreSQL',
            },
          },
        },
        {
          parameters: {
            functionCode: `// Transform data for external API
return items.map(item => ({
  json: {
    id: item.json.id,
    url: item.json.url,
    score: item.json.optimization_score,
    timestamp: item.json.created_at,
    synced_at: new Date().toISOString()
  }
}));`,
          },
          name: 'Transform Data',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [650, 300],
        },
        {
          parameters: {
            url: 'https://external-service.com/api/sync',
            sendBody: true,
            bodyParameters: {
              parameters: [
                {
                  name: 'data',
                  value: '={{$json}}',
                },
              ],
            },
            options: {},
          },
          name: 'Sync to External Service',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 3,
          position: [850, 300],
        },
        {
          parameters: {
            operation: 'update',
            table: 'optimizations',
            updateKey: 'id',
            columns: 'synced,synced_at',
          },
          name: 'Mark as Synced',
          type: 'n8n-nodes-base.postgres',
          typeVersion: 2,
          position: [1050, 300],
          credentials: {
            postgres: {
              id: '1',
              name: 'LightDom PostgreSQL',
            },
          },
        },
      ],
      connections: {
        'Schedule Trigger': {
          main: [[{ node: 'Fetch Unsynced Data', type: 'main', index: 0 }]],
        },
        'Fetch Unsynced Data': {
          main: [[{ node: 'Transform Data', type: 'main', index: 0 }]],
        },
        'Transform Data': {
          main: [[{ node: 'Sync to External Service', type: 'main', index: 0 }]],
        },
        'Sync to External Service': {
          main: [[{ node: 'Mark as Synced', type: 'main', index: 0 }]],
        },
      },
      active: false,
      settings: {},
      id: 'data-sync-workflow',
    };

    fs.writeFileSync(
      path.join(this.templatesDir, 'data-sync-workflow.json'),
      JSON.stringify(dataSyncWorkflow, null, 2)
    );

    console.log('  ✓ DOM Optimization workflow created');
    console.log('  ✓ Data Synchronization workflow created\n');
  }

  /**
   * Create credential templates
   */
  async createCredentialTemplates() {
    console.log('🔐 Creating credential templates...');

    const credentialTemplate = {
      postgresDb: {
        name: 'LightDom PostgreSQL',
        type: 'postgres',
        data: {
          host: '{{DB_HOST}}',
          port: '{{DB_PORT}}',
          database: '{{DB_NAME}}',
          user: '{{DB_USER}}',
          password: '{{DB_PASSWORD}}',
          ssl: false,
        },
      },
      httpBasicAuth: {
        name: 'LightDom API',
        type: 'httpBasicAuth',
        data: {
          user: 'api',
          password: '{{API_KEY}}',
        },
      },
    };

    fs.writeFileSync(
      path.join(this.credentialsDir, 'credential-templates.json'),
      JSON.stringify(credentialTemplate, null, 2)
    );

    console.log('  ✓ Credential templates created\n');
  }

  /**
   * Setup Docker environment
   */
  async setupDockerEnvironment() {
    console.log('🐳 Setting up Docker environment...');

    // Check if Docker is running
    try {
      execSync('docker --version', { stdio: 'ignore' });
      console.log('  ✓ Docker is installed');
    } catch (error) {
      console.log('  ⚠️  Docker is not installed or not running');
      return;
    }

    // Check if docker-compose.yml has n8n service
    const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
    if (fs.existsSync(dockerComposePath)) {
      const dockerCompose = fs.readFileSync(dockerComposePath, 'utf-8');
      if (dockerCompose.includes('n8n:')) {
        console.log('  ✓ n8n service configured in docker-compose.yml');
      } else {
        console.log('  ⚠️  n8n service not found in docker-compose.yml');
      }
    }

    console.log('');
  }

  /**
   * Create API integration
   */
  async createApiIntegration() {
    console.log('🔌 Creating API integration...');

    const apiIntegration = `/**
 * n8n API Integration
 * 
 * Express API endpoints for n8n workflow management
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

const n8nConfig = {
  baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
  apiKey: process.env.N8N_API_KEY || '',
};

/**
 * List all workflows
 */
router.get('/workflows', async (req, res) => {
  try {
    const response = await axios.get(\`\${n8nConfig.baseUrl}/api/v1/workflows\`, {
      headers: {
        'X-N8N-API-KEY': n8nConfig.apiKey,
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get workflow by ID
 */
router.get('/workflows/:id', async (req, res) => {
  try {
    const response = await axios.get(\`\${n8nConfig.baseUrl}/api/v1/workflows/\${req.params.id}\`, {
      headers: {
        'X-N8N-API-KEY': n8nConfig.apiKey,
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Execute workflow
 */
router.post('/workflows/:id/execute', async (req, res) => {
  try {
    const response = await axios.post(
      \`\${n8nConfig.baseUrl}/api/v1/workflows/\${req.params.id}/execute\`,
      req.body,
      {
        headers: {
          'X-N8N-API-KEY': n8nConfig.apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Trigger workflow via webhook
 */
router.post('/webhooks/:path', async (req, res) => {
  try {
    const response = await axios.post(
      \`\${n8nConfig.baseUrl}/webhook/\${req.params.path}\`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get workflow executions
 */
router.get('/executions', async (req, res) => {
  try {
    const response = await axios.get(\`\${n8nConfig.baseUrl}/api/v1/executions\`, {
      headers: {
        'X-N8N-API-KEY': n8nConfig.apiKey,
      },
      params: req.query,
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
`;

    const apiDir = path.join(process.cwd(), 'src', 'api');
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(apiDir, 'n8n-routes.ts'),
      apiIntegration
    );

    console.log('  ✓ API integration created\n');
  }

  /**
   * Generate documentation
   */
  async generateDocumentation() {
    console.log('📚 Generating documentation...');

    const documentation = `# n8n Workflow Engine Integration

## Overview

This integration connects LightDom with n8n workflow automation engine, enabling:
- Automated DOM optimization workflows
- Data synchronization pipelines
- Multi-channel notifications
- Custom automation workflows

## Setup

### 1. Start n8n with Docker

\`\`\`bash
npm run n8n:start
\`\`\`

### 2. Access n8n UI

Open http://localhost:5678 in your browser.

**Default credentials:**
- Username: admin
- Password: lightdom_n8n_password

### 3. Import Workflow Templates

1. In n8n UI, go to Workflows
2. Click "Import from File"
3. Select templates from \`workflows/n8n/templates/\`

### 4. Configure Credentials

1. Go to Credentials in n8n UI
2. Add PostgreSQL credential:
   - Host: postgres (or localhost if running locally)
   - Port: 5432
   - Database: lightdom
   - User: lightdom_user
   - Password: lightdom_password

### 5. Test Workflows

#### DOM Optimization Webhook
\`\`\`bash
curl -X POST http://localhost:5678/webhook/dom-optimize \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'
\`\`\`

#### Trigger via API
\`\`\`bash
curl -X POST http://localhost:3001/api/n8n/webhooks/dom-optimize \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'
\`\`\`

## Available Workflows

### 1. DOM Optimization Pipeline
- **Trigger**: Webhook
- **Path**: \`/webhook/dom-optimize\`
- **Purpose**: Automated DOM optimization and blockchain recording

### 2. Data Synchronization
- **Trigger**: Schedule (hourly)
- **Purpose**: Sync optimization data to external services

## API Endpoints

### List Workflows
\`\`\`
GET /api/n8n/workflows
\`\`\`

### Execute Workflow
\`\`\`
POST /api/n8n/workflows/:id/execute
\`\`\`

### Trigger Webhook
\`\`\`
POST /api/n8n/webhooks/:path
\`\`\`

### Get Executions
\`\`\`
GET /api/n8n/executions
\`\`\`

## Environment Variables

\`\`\`env
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-api-key
N8N_PASSWORD=lightdom_n8n_password
\`\`\`

## Workflow Development

### Creating Custom Workflows

1. Use n8n UI to design workflow
2. Export workflow as JSON
3. Save to \`workflows/n8n/templates/\`
4. Document in this file

### Best Practices

- Use error handling nodes for critical workflows
- Implement retry logic for external API calls
- Log execution results to database
- Monitor workflow performance

## Troubleshooting

### n8n Container Won't Start
\`\`\`bash
docker-compose logs n8n
npm run n8n:logs
\`\`\`

### Workflow Execution Fails
- Check credentials configuration
- Verify API endpoints are accessible
- Review execution logs in n8n UI

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify connection credentials
- Check network connectivity

## Advanced Features

### Workflow Mining
Generate training data from workflows:
\`\`\`bash
npm run workflow:mine
\`\`\`

### Component Generation
Use mined patterns to generate components:
\`\`\`bash
npm run design-system:mine
\`\`\`

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n API Reference](https://docs.n8n.io/api/)
- [LightDom Workflow Patterns](./data/workflow-patterns/)

---

*Generated by LightDom n8n Integration Setup*
`;

    fs.writeFileSync(
      path.join(process.cwd(), 'docs', 'N8N_WORKFLOW_INTEGRATION.md'),
      documentation
    );

    console.log('  ✓ Documentation generated\n');
  }

  /**
   * Print next steps
   */
  printNextSteps() {
    console.log('📋 Next Steps:\n');
    console.log('1. Start n8n:');
    console.log('   npm run n8n:start\n');
    console.log('2. Access n8n UI:');
    console.log('   http://localhost:5678\n');
    console.log('3. Import workflow templates:');
    console.log('   - workflows/n8n/templates/dom-optimization-workflow.json');
    console.log('   - workflows/n8n/templates/data-sync-workflow.json\n');
    console.log('4. Configure credentials in n8n UI\n');
    console.log('5. Test workflows:');
    console.log('   curl -X POST http://localhost:5678/webhook/dom-optimize \\\n');
    console.log('     -H "Content-Type: application/json" \\\n');
    console.log('     -d \'{"url": "https://example.com"}\'\n');
    console.log('6. Read documentation:');
    console.log('   docs/N8N_WORKFLOW_INTEGRATION.md\n');
    console.log('7. Mine design patterns:');
    console.log('   npm run design-system:mine\n');
  }
}

// Run setup
const setup = new N8nSetupService();
setup.run().catch(console.error);
