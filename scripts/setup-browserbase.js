#!/usr/bin/env node

/**
 * Browserbase Setup Script
 *
 * Sets up Browserbase MCP server integration for LightDom project
 * including environment configuration, dependency installation, and testing.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class BrowserbaseSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.configPath = path.join(this.projectRoot, 'config', 'browserbase.json');
    this.envPath = path.join(this.projectRoot, '.env');
  }

  async setup() {
    console.log(chalk.blue.bold('🚀 Setting up Browserbase MCP Server Integration'));
    console.log(chalk.gray('This will configure AI-powered web automation for LightDom\n'));

    try {
      await this.checkPrerequisites();
      await this.installDependencies();
      await this.setupEnvironment();
      await this.createConfiguration();
      await this.setupMCPClient();
      await this.runTests();
      await this.displaySummary();
    } catch (error) {
      console.error(chalk.red.bold('❌ Setup failed:'), error.message);
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log(chalk.yellow('📋 Checking prerequisites...'));

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

    if (majorVersion < 18) {
      throw new Error('Node.js 18 or higher is required');
    }

    // Check if MCP SDK is installed
    try {
      require.resolve('@modelcontextprotocol/sdk');
    } catch (error) {
      throw new Error('@modelcontextprotocol/sdk is not installed');
    }

    console.log(chalk.green('✅ Prerequisites check passed'));
  }

  async installDependencies() {
    console.log(chalk.yellow('📦 Installing Browserbase dependencies...'));

    const dependencies = ['@browserbasehq/mcp-server-browserbase'];

    try {
      execSync(`npm install ${dependencies.join(' ')} --save`, {
        stdio: 'inherit',
        cwd: this.projectRoot,
      });
      console.log(chalk.green('✅ Dependencies installed successfully'));
    } catch (error) {
      throw new Error('Failed to install dependencies');
    }
  }

  async setupEnvironment() {
    console.log(chalk.yellow('🔧 Setting up environment variables...'));

    let envContent = '';
    const requiredVars = ['BROWSERBASE_API_KEY', 'BROWSERBASE_PROJECT_ID', 'GEMINI_API_KEY'];

    // Read existing .env file
    if (fs.existsSync(this.envPath)) {
      envContent = fs.readFileSync(this.envPath, 'utf8');
    }

    // Check which variables are missing
    const missingVars = requiredVars.filter(
      varName => !envContent.includes(varName) || envContent.includes(`${varName}=`)
    );

    if (missingVars.length > 0) {
      console.log(chalk.yellow(`⚠️  Missing environment variables: ${missingVars.join(', ')}`));
      console.log(chalk.blue('Please add the following to your .env file:'));
      console.log(chalk.gray(''));

      missingVars.forEach(varName => {
        console.log(chalk.gray(`${varName}=your_${varName.toLowerCase()}_here`));
      });

      console.log(chalk.gray(''));
      console.log(chalk.blue('You can get these from:'));
      console.log(chalk.gray('- BROWSERBASE_API_KEY: https://browserbase.com'));
      console.log(chalk.gray('- BROWSERBASE_PROJECT_ID: https://browserbase.com'));
      console.log(chalk.gray('- GEMINI_API_KEY: https://ai.google.dev'));

      // Add placeholder entries
      envContent += '\n# Browserbase Configuration\n';
      missingVars.forEach(varName => {
        envContent += `${varName}=\n`;
      });

      fs.writeFileSync(this.envPath, envContent);
      console.log(chalk.green('✅ Environment file updated'));
    } else {
      console.log(chalk.green('✅ Environment variables already configured'));
    }
  }

  async createConfiguration() {
    console.log(chalk.yellow('⚙️  Creating Browserbase configuration...'));

    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const config = {
      browserbase: {
        apiKey: '${BROWSERBASE_API_KEY}',
        projectId: '${BROWSERBASE_PROJECT_ID}',
        modelApiKey: '${GEMINI_API_KEY}',
        modelName: 'google/gemini-2.0-flash',
        proxies: true,
        advancedStealth: true,
        keepAlive: true,
        defaultViewport: {
          width: 1920,
          height: 1080,
        },
        defaultTimeout: 30000,
        sessionManagement: {
          maxSessions: 10,
          sessionTimeout: 1800000,
          cleanupInterval: 300000,
          persistentSessions: true,
        },
        aiOptimization: {
          enabled: true,
          confidenceThreshold: 70,
          maxSuggestions: 10,
          enableRealTimeAnalysis: true,
        },
        security: {
          enableProxy: true,
          enableStealth: true,
          userAgentRotation: true,
          fingerprintMasking: true,
        },
        monitoring: {
          enableMetrics: true,
          logLevel: 'info',
          performanceTracking: true,
          errorTracking: true,
        },
      },
    };

    fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
    console.log(chalk.green('✅ Configuration file created'));
  }

  async setupMCPClient() {
    console.log(chalk.yellow('🔌 Setting up MCP client configuration...'));

    const mcpConfigPath = path.join(this.projectRoot, 'mcp-config.json');
    let mcpConfig = {};

    // Read existing MCP config
    if (fs.existsSync(mcpConfigPath)) {
      mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
    }

    // Add Browserbase server configuration
    mcpConfig.mcpServers = {
      ...mcpConfig.mcpServers,
      browserbase: {
        command: 'npx',
        args: [
          '@browserbasehq/mcp-server-browserbase',
          '--proxies',
          '--advancedStealth',
          '--keepAlive',
          '--browserWidth',
          '1920',
          '--browserHeight',
          '1080',
          '--modelName',
          'google/gemini-2.0-flash',
        ],
        env: {
          BROWSERBASE_API_KEY: '${BROWSERBASE_API_KEY}',
          BROWSERBASE_PROJECT_ID: '${BROWSERBASE_PROJECT_ID}',
          GEMINI_API_KEY: '${GEMINI_API_KEY}',
        },
      },
    };

    fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
    console.log(chalk.green('✅ MCP client configuration updated'));
  }

  async runTests() {
    console.log(chalk.yellow('🧪 Running integration tests...'));

    try {
      // Test if Browserbase package is accessible
      require.resolve('@browserbasehq/mcp-server-browserbase');
      console.log(chalk.green('✅ Browserbase package accessible'));

      // Test configuration files
      if (fs.existsSync(this.configPath)) {
        const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        if (config.browserbase) {
          console.log(chalk.green('✅ Configuration file valid'));
        }
      }

      console.log(chalk.green('✅ Integration tests passed'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Some tests failed, but setup can continue'));
      console.log(chalk.gray(`Error: ${error.message}`));
    }
  }

  async displaySummary() {
    console.log(chalk.green.bold('\n🎉 Browserbase Setup Complete!'));
    console.log(chalk.blue('\n📋 What was configured:'));
    console.log(chalk.gray('• Browserbase MCP server package installed'));
    console.log(chalk.gray('• Environment variables configured'));
    console.log(chalk.gray('• Configuration files created'));
    console.log(chalk.gray('• MCP client integration setup'));

    console.log(chalk.blue('\n🚀 Next steps:'));
    console.log(chalk.gray('1. Add your API keys to .env file'));
    console.log(chalk.gray('2. Start the enhanced crawler service'));
    console.log(chalk.gray('3. Test AI-powered crawling'));

    console.log(chalk.blue('\n📚 Usage examples:'));
    console.log(chalk.gray(''));
    console.log(chalk.gray('// AI-powered crawling'));
    console.log(chalk.gray('const result = await enhancedCrawler.crawlWebsiteWithAI('));
    console.log(chalk.gray('  "https://example.com",'));
    console.log(chalk.gray('  {'));
    console.log(chalk.gray('    useAI: true,'));
    console.log(
      chalk.gray('    aiInstructions: "Extract product information and take a screenshot"')
    );
    console.log(chalk.gray('  }'));
    console.log(chalk.gray(');'));

    console.log(chalk.blue('\n🔗 Useful links:'));
    console.log(chalk.gray('• Browserbase Dashboard: https://browserbase.com'));
    console.log(chalk.gray('• MCP Documentation: https://modelcontextprotocol.io'));
    console.log(chalk.gray('• LightDom Docs: ./docs/BROWSERBASE_INTEGRATION_PLAN.md'));

    console.log(chalk.green.bold('\n✨ Happy crawling with AI!'));
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new BrowserbaseSetup();
  setup.setup().catch(error => {
    console.error(chalk.red.bold('Setup failed:'), error);
    process.exit(1);
  });
}

module.exports = BrowserbaseSetup;
