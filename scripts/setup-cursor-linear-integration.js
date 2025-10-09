#!/usr/bin/env node

/**
 * Setup Script for Cursor Background Agent and Linear Integration
 * Configures environment and provides setup instructions
 */

import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class CursorLinearSetup {
  constructor() {
    this.setupSteps = [];
  }

  log(message, type = 'info') {
    const prefix = {
      info: '✅',
      error: '❌',
      critical: '🚨',
      success: '🎉',
      setup: '🔧',
      cursor: '🎯',
      linear: '📋'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  async setupEnvironment() {
    this.log('Setting up Cursor and Linear integration environment...', 'setup');
    
    // Step 1: Create .env file for API keys
    await this.createEnvFile();
    
    // Step 2: Install required dependencies
    await this.installDependencies();
    
    // Step 3: Create Cursor environment configuration
    await this.createCursorEnvironment();
    
    // Step 4: Create Linear configuration
    await this.createLinearConfiguration();
    
    // Step 5: Update package.json scripts
    await this.updatePackageScripts();
    
    // Step 6: Generate setup instructions
    await this.generateSetupInstructions();
    
    this.log('Setup complete!', 'success');
  }

  async createEnvFile() {
    this.log('Creating environment configuration file...', 'setup');
    
    const envContent = `# Cursor Background Agent Configuration
CURSOR_API_KEY=your_cursor_api_key_here

# Linear Integration Configuration
LINEAR_API_KEY=your_linear_api_key_here
LINEAR_TEAM_ID=your_team_id_here

# Optional: Linear Webhook Configuration
LINEAR_WEBHOOK_URL=your_webhook_url_here

# Automation Configuration
AUTOMATION_MAX_ROUNDS=5
AUTOMATION_BACKUP_ENABLED=true
AUTOMATION_GIT_SAFE=true

# Testing Configuration
TEST_TIMEOUT=30000
TEST_RETRY_COUNT=3
TEST_PARALLEL=true

# Organization Configuration
ORGANIZE_CREATE_MISSING=true
ORGANIZE_MOVE_EXISTING=true
ORGANIZE_GENERATE_INDEX=true
`;

    await fs.writeFile('.env.automation', envContent);
    this.setupSteps.push('✅ Created .env.automation file');
    this.log('Environment file created: .env.automation', 'success');
  }

  async installDependencies() {
    this.log('Installing required dependencies...', 'setup');
    
    const dependencies = [
      '@linear/sdk',
      'node-fetch',
      'dotenv'
    ];

    for (const dep of dependencies) {
      try {
        await execAsync(`npm install ${dep}`);
        this.setupSteps.push(`✅ Installed ${dep}`);
        this.log(`Installed: ${dep}`, 'success');
      } catch (error) {
        this.setupSteps.push(`❌ Failed to install ${dep}`);
        this.log(`Failed to install ${dep}: ${error.message}`, 'error');
      }
    }
  }

  async createCursorEnvironment() {
    this.log('Creating Cursor environment configuration...', 'cursor');
    
    const cursorConfig = {
      "snapshot": "POPULATED_FROM_SETTINGS",
      "install": "npm install && npm install -g electron",
      "start": "sudo service docker start",
      "terminals": [
        {
          "name": "API Server",
          "command": "node simple-api-server.js",
          "cwd": "."
        },
        {
          "name": "Frontend Dev",
          "command": "npm run dev",
          "cwd": "."
        },
        {
          "name": "Electron App",
          "command": "electron . --dev",
          "cwd": "."
        },
        {
          "name": "Database Services",
          "command": "docker-compose up -d postgres redis",
          "cwd": "."
        },
        {
          "name": "Automation Monitor",
          "command": "npm run automation:monitor",
          "cwd": "."
        }
      ],
      "environment": {
        "NODE_ENV": "development",
        "AUTOMATION_ENABLED": "true",
        "CURSOR_INTEGRATION": "true"
      }
    };

    await fs.mkdir('.cursor', { recursive: true });
    await fs.writeFile('.cursor/environment.json', JSON.stringify(cursorConfig, null, 2));
    
    this.setupSteps.push('✅ Created Cursor environment configuration');
    this.log('Cursor environment configuration created', 'cursor');
  }

  async createLinearConfiguration() {
    this.log('Creating Linear configuration...', 'linear');
    
    const linearConfig = {
      "team": {
        "name": "LightDom Development",
        "description": "LightDom Space-Bridge Platform Development Team"
      },
      "labels": [
        {
          "name": "automation",
          "color": "#FF6B6B",
          "description": "Issues created by automation system"
        },
        {
          "name": "lightdom",
          "color": "#4ECDC4",
          "description": "LightDom platform related issues"
        },
        {
          "name": "critical",
          "color": "#FF4757",
          "description": "Critical issues requiring immediate attention"
        },
        {
          "name": "enhancement",
          "color": "#2ED573",
          "description": "Feature enhancements and improvements"
        },
        {
          "name": "bug",
          "color": "#FFA502",
          "description": "Bug fixes and corrections"
        }
      ],
      "workflows": [
        {
          "name": "Automation Pipeline",
          "description": "Automated issue creation and tracking",
          "states": ["Todo", "In Progress", "Done"]
        }
      ],
      "automation": {
        "autoAssign": true,
        "autoLabel": true,
        "webhookEnabled": false,
        "syncWithGit": true
      }
    };

    await fs.writeFile('linear-config.json', JSON.stringify(linearConfig, null, 2));
    
    this.setupSteps.push('✅ Created Linear configuration');
    this.log('Linear configuration created', 'linear');
  }

  async updatePackageScripts() {
    this.log('Updating package.json scripts...', 'setup');
    
    try {
      const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
      
      const newScripts = {
        "automation:cursor-linear": "node scripts/enhanced-automation-with-cursor-linear.js",
        "automation:setup": "node scripts/setup-cursor-linear-integration.js",
        "automation:monitor": "node scripts/automation-monitor.js",
        "cursor:launch-agent": "node scripts/cursor-agent-launcher.js",
        "linear:create-issue": "node scripts/linear-issue-creator.js",
        "linear:sync": "node scripts/linear-sync.js"
      };
      
      packageJson.scripts = { ...packageJson.scripts, ...newScripts };
      
      await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
      
      this.setupSteps.push('✅ Updated package.json scripts');
      this.log('Package.json scripts updated', 'success');
    } catch (error) {
      this.setupSteps.push('❌ Failed to update package.json');
      this.log(`Failed to update package.json: ${error.message}`, 'error');
    }
  }

  async generateSetupInstructions() {
    this.log('Generating setup instructions...', 'setup');
    
    const instructions = `
# Cursor Background Agent & Linear Integration Setup

## 🎯 **Setup Complete!**

The following components have been configured:

${this.setupSteps.map(step => `- ${step}`).join('\n')}

## 🔑 **Required API Keys**

### 1. Cursor Background Agent API Key
1. Go to [Cursor Dashboard](https://cursor.com/dashboard)
2. Navigate to API Keys section
3. Generate a new API key
4. Add it to your environment:
   \`\`\`bash
   export CURSOR_API_KEY="your_cursor_api_key_here"
   \`\`\`

### 2. Linear API Key
1. Go to [Linear Settings](https://linear.app/settings/api)
2. Generate a personal API key
3. Add it to your environment:
   \`\`\`bash
   export LINEAR_API_KEY="your_linear_api_key_here"
   \`\`\`

## 🚀 **Usage**

### Run Enhanced Automation with Cursor & Linear
\`\`\`bash
npm run automation:cursor-linear
\`\`\`

### Launch Cursor Background Agent
\`\`\`bash
npm run cursor:launch-agent
\`\`\`

### Create Linear Issue
\`\`\`bash
npm run linear:create-issue
\`\`\`

### Monitor Automation
\`\`\`bash
npm run automation:monitor
\`\`\`

## 📋 **Features**

### Cursor Background Agent Integration
- ✅ Autonomous code editing and fixes
- ✅ Remote environment management
- ✅ Automated issue detection and resolution
- ✅ Background task execution

### Linear Integration
- ✅ Automated issue creation
- ✅ Issue tracking and management
- ✅ Team collaboration
- ✅ Progress monitoring

### Enhanced Automation Pipeline
- ✅ Real-time issue detection
- ✅ Automated fix application
- ✅ Actionable recommendations
- ✅ Comprehensive reporting

## 🔧 **Configuration Files**

- \`.env.automation\` - Environment variables
- \`.cursor/environment.json\` - Cursor environment configuration
- \`linear-config.json\` - Linear team and workflow configuration

## 📊 **Monitoring**

The automation system will:
1. Detect issues in real-time
2. Apply fixes automatically
3. Create Linear issues for tracking
4. Launch Cursor agents for complex tasks
5. Generate comprehensive reports

## 🎯 **Next Steps**

1. **Set API Keys**: Add your Cursor and Linear API keys to environment
2. **Test Integration**: Run \`npm run automation:cursor-linear\`
3. **Monitor Progress**: Check Linear for created issues
4. **Review Reports**: Check generated automation reports
5. **Customize**: Modify configurations as needed

## 📚 **Documentation**

- [Cursor Background Agent Docs](https://cursor.com/docs/background-agent)
- [Linear API Documentation](https://developers.linear.app/docs)
- [Automation System Guide](./ENHANCED_AUTOMATION_SYSTEM.md)

## 🆘 **Troubleshooting**

### Common Issues

1. **API Key Not Working**
   - Verify API key is correct
   - Check environment variable is set
   - Ensure API key has required permissions

2. **Cursor Agent Not Launching**
   - Check Cursor API key
   - Verify repository access
   - Check network connectivity

3. **Linear Issues Not Creating**
   - Verify Linear API key
   - Check team ID is correct
   - Ensure API key has write permissions

### Support

For issues or questions:
1. Check the generated reports
2. Review environment configuration
3. Verify API key permissions
4. Check network connectivity

---

**Setup completed at**: ${new Date().toISOString()}
`;

    await fs.writeFile('CURSOR_LINEAR_SETUP_INSTRUCTIONS.md', instructions);
    this.log('Setup instructions saved: CURSOR_LINEAR_SETUP_INSTRUCTIONS.md', 'success');
  }
}

// Run the setup
const setup = new CursorLinearSetup();
setup.setupEnvironment().catch(console.error);
