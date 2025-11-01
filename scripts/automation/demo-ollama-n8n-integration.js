#!/usr/bin/env node

/**
 * Ollama & n8n Integration Demo/Quickstart
 * 
 * This script demonstrates the complete integration of Ollama AI
 * with n8n workflow automation in the LightDom project.
 */

const chalk = require('chalk');
const readline = require('readline');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class IntegrationDemo {
  constructor() {
    this.rl = null;
  }

  /**
   * Print section header
   */
  header(title) {
    console.log('\n' + '='.repeat(70));
    console.log(chalk.bold.cyan(title));
    console.log('='.repeat(70) + '\n');
  }

  /**
   * Print step
   */
  step(number, description) {
    console.log(chalk.bold.yellow(`\n📋 Step ${number}: ${description}`));
    console.log('─'.repeat(70));
  }

  /**
   * Print success message
   */
  success(message) {
    console.log(chalk.green('✅ ' + message));
  }

  /**
   * Print error message
   */
  error(message) {
    console.log(chalk.red('❌ ' + message));
  }

  /**
   * Print info message
   */
  info(message) {
    console.log(chalk.blue('ℹ️  ' + message));
  }

  /**
   * Print warning message
   */
  warn(message) {
    console.log(chalk.yellow('⚠️  ' + message));
  }

  /**
   * Ask user a question
   */
  async question(prompt) {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    }

    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  /**
   * Run a command and show output
   */
  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      console.log(chalk.gray(`$ ${command} ${args.join(' ')}\n`));

      const proc = spawn(command, args, {
        stdio: options.silent ? 'pipe' : 'inherit',
        ...options
      });

      let output = '';
      
      if (options.silent) {
        proc.stdout.on('data', (data) => {
          output += data.toString();
        });
        
        proc.stderr.on('data', (data) => {
          output += data.toString();
        });
      }

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          resolve({ success: false, output, code });
        }
      });

      proc.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Introduction
   */
  async introduction() {
    this.header('🚀 OLLAMA & n8n INTEGRATION DEMO');

    console.log(chalk.bold('Welcome to the LightDom Ollama & n8n Integration!'));
    console.log('\nThis demo will walk you through:\n');
    console.log('  1. Testing your Ollama installation');
    console.log('  2. Using prompt engineering templates');
    console.log('  3. Generating n8n workflows with AI');
    console.log('  4. Reviewing workflow patterns and examples\n');

    const proceed = await this.question(chalk.bold('Ready to begin? (y/n): '));
    
    if (proceed.toLowerCase() !== 'y') {
      console.log('\nDemo cancelled. Run again when ready!\n');
      process.exit(0);
    }
  }

  /**
   * Step 1: Test Ollama
   */
  async testOllama() {
    this.step(1, 'Test Ollama Installation');

    console.log('\nFirst, let\'s verify your Ollama setup is working correctly.\n');

    const runTest = await this.question('Run Ollama setup tests? (y/n): ');
    
    if (runTest.toLowerCase() === 'y') {
      console.log('');
      const result = await this.runCommand('node', [
        'scripts/automation/test-ollama-setup.js'
      ]);

      if (result.success) {
        this.success('Ollama tests completed!');
        this.info('Check ollama-test-report.json for detailed results\n');
      } else {
        this.warn('Some tests may have failed. Review the output above.');
        this.info('You may need to install Ollama or pull models.\n');
      }
    } else {
      this.info('Skipped Ollama testing.\n');
    }
  }

  /**
   * Step 2: Prompt Templates
   */
  async explorePromptTemplates() {
    this.step(2, 'Explore Prompt Engineering Templates');

    console.log('\nWe have several pre-built prompt templates for different tasks.\n');

    const list = await this.question('List available templates? (y/n): ');
    
    if (list.toLowerCase() === 'y') {
      console.log('');
      await this.runCommand('node', [
        'scripts/automation/ollama-prompt-engine.js',
        '--list'
      ]);
    }

    const tryTemplate = await this.question('\nTry executing a template? (y/n): ');
    
    if (tryTemplate.toLowerCase() === 'y') {
      console.log('\nLet\'s try the "analyze_dom_structure" template as an example.\n');
      
      const sampleData = JSON.stringify({
        elements: 150,
        depth: 8,
        scripts: 12,
        stylesheets: 5,
        images: 25
      });

      console.log('Sample DOM data:', sampleData, '\n');

      const execute = await this.question('Execute this template with sample data? (y/n): ');
      
      if (execute.toLowerCase() === 'y') {
        this.warn('Note: This requires Ollama to be running with a model installed.\n');
        
        const result = await this.runCommand('node', [
          'scripts/automation/ollama-prompt-engine.js',
          '--execute',
          'analyze_dom_structure',
          `dom_data=${sampleData}`
        ]);

        if (result.success) {
          this.success('Template executed successfully!');
          this.info('Results saved in outputs/ollama-results/\n');
        } else {
          this.warn('Execution failed. Make sure Ollama is running and models are available.\n');
        }
      }
    }
  }

  /**
   * Step 3: Workflow Builder
   */
  async demonstrateWorkflowBuilder() {
    this.step(3, 'Generate n8n Workflows with AI');

    console.log('\nThe workflow builder uses Ollama to create complete n8n workflows');
    console.log('from natural language descriptions.\n');

    const mode = await this.question('Choose mode:\n  1. Interactive\n  2. Single workflow\n  3. Batch generation\n  4. Skip\nChoice (1-4): ');

    if (mode === '1') {
      console.log('\nStarting interactive workflow builder...\n');
      await this.runCommand('node', [
        'scripts/automation/n8n-workflow-builder.js',
        '--interactive'
      ]);
    } else if (mode === '2') {
      console.log('\nGenerating a sample workflow...\n');
      
      const description = 'Create a workflow that receives a webhook, validates the input has a URL field, and returns a success message';
      
      console.log('Description:', description, '\n');
      
      this.warn('Note: This requires Ollama with codellama:7b or similar model.\n');
      
      const generate = await this.question('Generate this workflow? (y/n): ');
      
      if (generate.toLowerCase() === 'y') {
        await this.runCommand('node', [
          'scripts/automation/n8n-workflow-builder.js',
          '--generate',
          description
        ]);
      }
    } else if (mode === '3') {
      console.log('\nBatch workflow generation uses a text file with workflow descriptions.\n');
      
      this.info('Example file: workflows/automation/example-workflow-descriptions.txt\n');
      
      const viewExample = await this.question('View example descriptions? (y/n): ');
      
      if (viewExample.toLowerCase() === 'y') {
        const content = await fs.readFile(
          'workflows/automation/example-workflow-descriptions.txt',
          'utf8'
        );
        
        console.log('\nExample workflow descriptions:\n');
        console.log(chalk.gray(content));
      }

      const runBatch = await this.question('\nRun batch generation with example file? (y/n): ');
      
      if (runBatch.toLowerCase() === 'y') {
        this.warn('This will generate multiple workflows and may take several minutes.\n');
        
        await this.runCommand('node', [
          'scripts/automation/n8n-workflow-builder.js',
          '--batch',
          'workflows/automation/example-workflow-descriptions.txt'
        ]);
      }
    }
  }

  /**
   * Step 4: Review Patterns
   */
  async reviewPatterns() {
    this.step(4, 'Review Workflow Patterns and Examples');

    console.log('\nWe have several workflow patterns and examples documented.\n');

    const items = [
      {
        name: 'Workflow Templates',
        file: 'workflows/automation/n8n-workflow-templates.json',
        description: 'Pre-built workflow templates'
      },
      {
        name: 'Workflow README',
        file: 'workflows/automation/README.md',
        description: 'Patterns, best practices, and examples'
      },
      {
        name: 'Integration Guide',
        file: 'OLLAMA_N8N_INTEGRATION_GUIDE.md',
        description: 'Complete integration documentation'
      }
    ];

    console.log('Available documentation:\n');
    items.forEach((item, i) => {
      console.log(`  ${i + 1}. ${chalk.bold(item.name)}`);
      console.log(`     ${chalk.gray(item.description)}`);
      console.log(`     ${chalk.gray(item.file)}\n`);
    });

    const view = await this.question('Enter number to view (or press Enter to skip): ');
    
    if (view && parseInt(view) > 0 && parseInt(view) <= items.length) {
      const selected = items[parseInt(view) - 1];
      
      console.log(`\nOpening ${selected.name}...\n`);
      
      const content = await fs.readFile(selected.file, 'utf8');
      
      // Show first 50 lines
      const lines = content.split('\n').slice(0, 50);
      console.log(lines.join('\n'));
      
      if (content.split('\n').length > 50) {
        console.log(chalk.gray('\n... (file continues) ...\n'));
        this.info(`View full file: ${selected.file}\n`);
      }
    }
  }

  /**
   * Conclusion
   */
  async conclusion() {
    this.header('✨ DEMO COMPLETE');

    console.log(chalk.bold('You\'ve seen the key features of the Ollama & n8n integration!\n'));

    console.log('Next steps:\n');
    console.log('  📚 Read the integration guide: OLLAMA_N8N_INTEGRATION_GUIDE.md');
    console.log('  🔧 Customize prompt templates: workflows/automation/ollama-prompts/');
    console.log('  🏗️  Build your own workflows: npm run n8n:workflow:build:interactive');
    console.log('  🧪 Test with your Ollama models: npm run ollama:test');
    console.log('  📖 Review examples: workflows/automation/README.md\n');

    console.log(chalk.bold.green('Happy automating! 🚀\n'));
  }

  /**
   * Run the complete demo
   */
  async run() {
    try {
      await this.introduction();
      await this.testOllama();
      await this.explorePromptTemplates();
      await this.demonstrateWorkflowBuilder();
      await this.reviewPatterns();
      await this.conclusion();
    } catch (error) {
      console.error('\n❌ Demo error:', error.message);
    } finally {
      if (this.rl) {
        this.rl.close();
      }
    }
  }
}

// Run demo
if (require.main === module) {
  // Check if chalk is available
  try {
    require.resolve('chalk');
  } catch (e) {
    console.log('Note: Install chalk for better formatting: npm install chalk\n');
    // Continue anyway
  }

  const demo = new IntegrationDemo();
  demo.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = IntegrationDemo;
