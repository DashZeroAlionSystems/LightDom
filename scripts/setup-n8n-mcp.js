#!/usr/bin/env node

/**
 * Setup script for n8n MCP integration
 *
 * This script helps set up the n8n MCP server integration
 * for the LightDom project.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up n8n MCP integration for LightDom...\n');

// Check if required dependencies are installed
function checkDependencies() {
  console.log('📦 Checking dependencies...');

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['@modelcontextprotocol/sdk', 'axios', 'commander', 'chalk', 'ora'];

  const missingDeps = requiredDeps.filter(
    dep => !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  );

  if (missingDeps.length > 0) {
    console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
    console.log('Installing missing dependencies...');

    try {
      execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
      console.log('✅ Dependencies installed successfully');
    } catch (error) {
      console.error('❌ Failed to install dependencies:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ All dependencies are already installed');
  }
}

// Create environment configuration
function createEnvConfig() {
  console.log('\n🔧 Creating environment configuration...');

  const envExample = `# n8n MCP Configuration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_api_key_here
N8N_WEBHOOK_URL=
N8N_TIMEOUT=30000

# Optional: Enable debug mode
N8N_DEBUG=false
`;

  if (!fs.existsSync('.env.example')) {
    fs.writeFileSync('.env.example', envExample);
    console.log('✅ Created .env.example file');
  } else {
    console.log('ℹ️  .env.example already exists');
  }

  if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', envExample);
    console.log('✅ Created .env file');
    console.log('⚠️  Please update the .env file with your n8n configuration');
  } else {
    console.log('ℹ️  .env file already exists');
  }
}

// Create MCP configuration
function createMCPConfig() {
  console.log('\n⚙️  Creating MCP configuration...');

  const mcpConfig = {
    mcpServers: {
      n8n: {
        command: 'node',
        args: ['dist/src/mcp/n8n-mcp-server.js'],
        env: {
          N8N_BASE_URL: 'http://localhost:5678',
          N8N_API_KEY: '',
          N8N_WEBHOOK_URL: '',
          N8N_TIMEOUT: '30000',
        },
      },
    },
  };

  fs.writeFileSync('mcp-config.json', JSON.stringify(mcpConfig, null, 2));
  console.log('✅ Created mcp-config.json');
  console.log('ℹ️  Add this file to your Cursor MCP settings');
}

// Create build script
function createBuildScript() {
  console.log('\n🔨 Creating build script...');

  const buildScript = `#!/bin/bash

# Build n8n MCP server
echo "Building n8n MCP server..."
npx tsc src/mcp/n8n-mcp-server.ts --outDir dist --target es2020 --module commonjs --esModuleInterop --skipLibCheck
npx tsc src/mcp/n8n-mcp-cli.ts --outDir dist --target es2020 --module commonjs --esModuleInterop --skipLibCheck

echo "✅ Build completed"
echo "You can now use the MCP server with Cursor"
`;

  fs.writeFileSync('scripts/build-n8n-mcp.sh', buildScript);

  // Make it executable on Unix systems
  try {
    execSync('chmod +x scripts/build-n8n-mcp.sh', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Could not make build script executable (this is normal on Windows)');
  }

  console.log('✅ Created build script at scripts/build-n8n-mcp.sh');
}

// Update package.json scripts
function updatePackageScripts() {
  console.log('\n📝 Updating package.json scripts...');

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  packageJson.scripts['build:n8n-mcp'] =
    'npx tsc src/mcp/*.ts --outDir dist --target es2020 --module commonjs --esModuleInterop --skipLibCheck';
  packageJson.scripts['start:n8n-mcp'] = 'node dist/src/mcp/n8n-mcp-server.js';
  packageJson.scripts['cli:n8n-mcp'] = 'node dist/src/mcp/n8n-mcp-cli.js';
  packageJson.scripts['test:n8n-mcp'] = 'node dist/src/mcp/n8n-mcp-cli.js test';

  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Updated package.json with n8n MCP scripts');
}

// Create documentation
function createDocumentation() {
  console.log('\n📚 Creating documentation...');

  const docs = `# n8n MCP Integration

This directory contains the n8n MCP (Model Context Protocol) integration for the LightDom project.

## Overview

The n8n MCP server provides seamless integration between Cursor IDE and n8n workflows, allowing developers to:

- Create, read, update, and delete n8n workflows
- Execute workflows and monitor their execution
- Create and manage webhooks
- Export and import workflow configurations
- Validate workflow definitions
- Get workflow statistics and analytics

## Files

- \`n8n-mcp-server.ts\` - Main MCP server implementation
- \`n8n-mcp-cli.ts\` - Command-line interface for managing the integration
- \`../types/N8nTypes.ts\` - TypeScript type definitions

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Configure environment variables in \`.env\`:
   \`\`\`
   N8N_BASE_URL=http://localhost:5678
   N8N_API_KEY=your_api_key_here
   N8N_TIMEOUT=30000
   \`\`\`

3. Build the MCP server:
   \`\`\`bash
   npm run build:n8n-mcp
   \`\`\`

4. Test the connection:
   \`\`\`bash
   npm run test:n8n-mcp
   \`\`\`

5. Add the MCP configuration to Cursor:
   - Copy \`mcp-config.json\` to your Cursor MCP settings
   - Restart Cursor

## Usage

### MCP Tools Available

The MCP server provides the following tools:

- \`list_workflows\` - List all workflows
- \`get_workflow\` - Get a specific workflow
- \`create_workflow\` - Create a new workflow
- \`update_workflow\` - Update an existing workflow
- \`delete_workflow\` - Delete a workflow
- \`execute_workflow\` - Execute a workflow
- \`get_execution\` - Get execution details
- \`list_executions\` - List workflow executions
- \`create_webhook\` - Create a webhook
- \`trigger_webhook\` - Trigger a webhook
- \`export_workflow\` - Export workflow as JSON
- \`import_workflow\` - Import workflow from JSON
- \`validate_workflow\` - Validate workflow configuration
- \`get_workflow_statistics\` - Get workflow statistics

### CLI Usage

You can also use the CLI directly:

\`\`\`bash
# Test connection
npm run cli:n8n-mcp test

# List workflows
npm run cli:n8n-mcp list

# Create sample workflow
npm run cli:n8n-mcp create-sample

# Export workflow
npm run cli:n8n-mcp export <workflow-id>

# Import workflow
npm run cli:n8n-mcp import <file-path>
\`\`\`

## Configuration

The MCP server can be configured through environment variables:

- \`N8N_BASE_URL\` - Base URL of your n8n instance (default: http://localhost:5678)
- \`N8N_API_KEY\` - API key for authentication (optional)
- \`N8N_WEBHOOK_URL\` - Base URL for webhooks (optional)
- \`N8N_TIMEOUT\` - Request timeout in milliseconds (default: 30000)

## Security

- API keys are stored in environment variables, not in code
- All requests are made over HTTPS in production
- Input validation is performed on all workflow data
- Workflow execution is sandboxed by n8n

## Troubleshooting

### Connection Issues

1. Verify n8n is running: \`curl http://localhost:5678/api/v1/workflows\`
2. Check API key configuration
3. Verify firewall settings

### Build Issues

1. Ensure TypeScript is installed: \`npm install -g typescript\`
2. Check Node.js version (requires 16+)
3. Clear node_modules and reinstall: \`rm -rf node_modules && npm install\`

### MCP Issues

1. Verify mcp-config.json is correctly formatted
2. Check Cursor MCP settings
3. Restart Cursor after configuration changes

## Examples

### Creating a Simple Workflow

\`\`\`typescript
const workflow = {
  name: 'My Workflow',
  nodes: [
    {
      id: 'webhook',
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [240, 300],
      parameters: {
        httpMethod: 'POST',
        path: 'my-webhook',
      },
    },
  ],
  connections: {},
  active: false,
};
\`\`\`

### Executing a Workflow

\`\`\`typescript
const result = await executeWorkflow({
  workflowId: 'workflow-id',
  inputData: { message: 'Hello World' },
});
\`\`\`

## Contributing

When contributing to the n8n MCP integration:

1. Follow the existing code style
2. Add TypeScript types for new features
3. Update documentation
4. Add tests for new functionality
5. Follow security best practices

## License

This integration is part of the LightDom project and follows the same license terms.
`;

  fs.writeFileSync('src/mcp/README.md', docs);
  console.log('✅ Created documentation at src/mcp/README.md');
}

// Main setup function
async function main() {
  try {
    checkDependencies();
    createEnvConfig();
    createMCPConfig();
    createBuildScript();
    updatePackageScripts();
    createDocumentation();

    console.log('\n🎉 n8n MCP integration setup completed!');
    console.log('\nNext steps:');
    console.log('1. Update .env with your n8n configuration');
    console.log('2. Run: npm run build:n8n-mcp');
    console.log('3. Run: npm run test:n8n-mcp');
    console.log('4. Add mcp-config.json to your Cursor MCP settings');
    console.log('5. Restart Cursor');
    console.log('\nFor more information, see src/mcp/README.md');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
main();
