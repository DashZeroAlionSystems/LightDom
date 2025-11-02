#!/usr/bin/env node

/**
 * n8n Workflow Builder with Ollama Integration
 * 
 * This tool builds n8n workflows using natural language prompts
 * processed through Ollama AI models.
 */

const OllamaPromptEngine = require('./ollama-prompt-engine');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class N8nWorkflowBuilder {
  constructor(n8nBaseUrl = 'http://localhost:5678', n8nApiKey = null) {
    this.n8nBaseUrl = n8nBaseUrl;
    this.n8nApiKey = n8nApiKey;
    this.promptEngine = new OllamaPromptEngine();
    this.workflowTemplates = {};
  }

  /**
   * Initialize the builder
   */
  async initialize() {
    console.log('🔧 Initializing n8n Workflow Builder...\n');
    
    // Load prompt templates
    await this.promptEngine.loadTemplates();
    
    // Load workflow examples
    await this.loadWorkflowExamples();
    
    console.log('✅ Initialization complete\n');
  }

  /**
   * Load workflow examples for reference
   */
  async loadWorkflowExamples() {
    try {
      const examplesPath = path.join(__dirname, '..', '..', 'workflows', 'automation', 'n8n-workflow-templates.json');
      const content = await fs.readFile(examplesPath, 'utf8');
      this.workflowTemplates = JSON.parse(content);
      console.log('✅ Loaded workflow examples');
    } catch (error) {
      console.warn('⚠️  Could not load workflow examples:', error.message);
    }
  }

  /**
   * Generate workflow from natural language description using Ollama
   */
  async generateWorkflowFromDescription(description, options = {}) {
    console.log('🤖 Generating workflow from description...\n');
    console.log('Description:', description, '\n');

    // Enhance the prompt with workflow examples
    const exampleWorkflows = JSON.stringify(this.workflowTemplates, null, 2);
    
    const enhancedDescription = `${description}

Here are some example n8n workflow structures for reference:
${exampleWorkflows.substring(0, 2000)}... (truncated)

Use these examples to understand the structure, but create a new workflow based on the description above.`;

    // Use the workflow generation template
    const result = await this.promptEngine.executeTemplate(
      'create_workflow_from_description',
      { description: enhancedDescription },
      {
        model: options.model || 'codellama:7b',
        stream: options.stream || false,
        verbose: options.verbose || false,
        timeout: options.timeout || 120000 // 2 minutes for complex workflows
      }
    );

    if (result.parsed) {
      console.log('✅ Workflow generated successfully\n');
      return result.parsed;
    } else {
      console.log('⚠️  Raw output (could not parse as JSON):\n');
      console.log(result.output);
      
      // Try to extract JSON manually
      const jsonMatch = result.output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const workflow = JSON.parse(jsonMatch[0]);
          console.log('\n✅ Extracted workflow from response\n');
          return workflow;
        } catch (e) {
          throw new Error('Could not parse workflow JSON from Ollama response');
        }
      } else {
        throw new Error('No valid JSON workflow found in Ollama response');
      }
    }
  }

  /**
   * Validate workflow structure
   */
  validateWorkflow(workflow) {
    const errors = [];

    if (!workflow.name) {
      errors.push('Workflow must have a name');
    }

    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Workflow must have nodes array');
    }

    if (!workflow.connections || typeof workflow.connections !== 'object') {
      errors.push('Workflow must have connections object');
    }

    // Check node structure
    if (workflow.nodes) {
      workflow.nodes.forEach((node, index) => {
        if (!node.id) {
          errors.push(`Node ${index} missing ID`);
        }
        if (!node.type) {
          errors.push(`Node ${index} (${node.id || 'unknown'}) missing type`);
        }
        if (!node.name) {
          errors.push(`Node ${index} (${node.id || 'unknown'}) missing name`);
        }
        if (!node.position || !Array.isArray(node.position) || node.position.length !== 2) {
          errors.push(`Node ${index} (${node.id || 'unknown'}) has invalid position`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Enhance workflow with AI-suggested improvements
   */
  async enhanceWorkflow(workflow, options = {}) {
    console.log('🔧 Enhancing workflow with AI suggestions...\n');

    const result = await this.promptEngine.executeTemplate(
      'optimize_existing_workflow',
      { workflow: JSON.stringify(workflow, null, 2) },
      {
        model: options.model || 'llama2:7b',
        stream: false,
        verbose: options.verbose || false
      }
    );

    if (result.parsed && result.parsed.improved_workflow) {
      console.log('✅ Workflow enhanced\n');
      
      if (result.parsed.optimizations && result.parsed.optimizations.length > 0) {
        console.log('Suggested optimizations:');
        result.parsed.optimizations.forEach((opt, i) => {
          console.log(`  ${i + 1}. ${opt.type}: ${opt.description}`);
          console.log(`     Impact: ${opt.impact}\n`);
        });
      }

      return result.parsed.improved_workflow;
    }

    console.log('⚠️  Could not enhance workflow, returning original\n');
    return workflow;
  }

  /**
   * Save workflow to file
   */
  async saveWorkflowToFile(workflow, filename) {
    const outputDir = path.join(__dirname, '..', '..', 'workflows', 'automation', 'generated');
    await fs.mkdir(outputDir, { recursive: true });

    const filepath = path.join(outputDir, filename);
    await fs.writeFile(filepath, JSON.stringify(workflow, null, 2));
    
    console.log(`💾 Workflow saved to: ${filepath}\n`);
    return filepath;
  }

  /**
   * Deploy workflow to n8n server
   */
  async deployWorkflow(workflow, activate = false) {
    console.log('📤 Deploying workflow to n8n server...\n');

    try {
      const headers = {
        'Content-Type': 'application/json'
      };

      if (this.n8nApiKey) {
        headers['X-N8N-API-KEY'] = this.n8nApiKey;
      }

      const response = await axios.post(
        `${this.n8nBaseUrl}/api/v1/workflows`,
        {
          ...workflow,
          active: activate
        },
        { headers }
      );

      console.log('✅ Workflow deployed successfully');
      console.log(`   ID: ${response.data.id}`);
      console.log(`   Name: ${response.data.name}`);
      console.log(`   Active: ${response.data.active}\n`);

      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('❌ Failed to deploy workflow:', error.response.data);
      } else if (error.code === 'ECONNREFUSED') {
        console.error('❌ Could not connect to n8n server at', this.n8nBaseUrl);
        console.error('   Make sure n8n is running: npm run n8n:start');
      } else {
        console.error('❌ Failed to deploy workflow:', error.message);
      }
      throw error;
    }
  }

  /**
   * Interactive workflow builder
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
      console.log('\n' + '='.repeat(60));
      console.log('🏗️  n8n WORKFLOW BUILDER (Interactive Mode)');
      console.log('='.repeat(60) + '\n');

      console.log('This tool will help you create n8n workflows using AI.\n');

      const description = await question('Describe the workflow you want to create:\n> ');
      
      if (!description.trim()) {
        console.log('❌ Description cannot be empty');
        rl.close();
        return;
      }

      const model = await question('\nWhich Ollama model to use? (default: codellama:7b):\n> ') || 'codellama:7b';
      const enhance = (await question('\nEnhance with AI optimizations? (y/n, default: n):\n> ')).toLowerCase() === 'y';
      
      // Generate workflow
      let workflow = await this.generateWorkflowFromDescription(description, { 
        model,
        verbose: true,
        stream: false
      });

      // Validate
      const validation = this.validateWorkflow(workflow);
      if (!validation.valid) {
        console.log('❌ Generated workflow has errors:\n');
        validation.errors.forEach(err => console.log(`  - ${err}`));
        
        const fix = (await question('\nTry to fix automatically? (y/n):\n> ')).toLowerCase() === 'y';
        
        if (fix) {
          // Add basic fixes
          if (!workflow.name) workflow.name = 'Generated Workflow';
          if (!workflow.nodes) workflow.nodes = [];
          if (!workflow.connections) workflow.connections = {};
          
          // Revalidate
          const revalidation = this.validateWorkflow(workflow);
          if (!revalidation.valid) {
            console.log('❌ Could not fix all errors. Please review manually.');
          } else {
            console.log('✅ Workflow fixed\n');
          }
        }
      } else {
        console.log('✅ Workflow structure is valid\n');
      }

      // Enhance
      if (enhance) {
        workflow = await this.enhanceWorkflow(workflow, { model });
      }

      // Show summary
      console.log('Workflow Summary:');
      console.log(`  Name: ${workflow.name}`);
      console.log(`  Nodes: ${workflow.nodes ? workflow.nodes.length : 0}`);
      console.log(`  Connections: ${workflow.connections ? Object.keys(workflow.connections).length : 0}\n`);

      // Save
      const save = (await question('Save workflow to file? (y/n):\n> ')).toLowerCase() === 'y';
      
      if (save) {
        const filename = await question('Filename (default: workflow-<timestamp>.json):\n> ') || 
                        `workflow-${Date.now()}.json`;
        await this.saveWorkflowToFile(workflow, filename);
      }

      // Deploy
      const deploy = (await question('\nDeploy to n8n server? (y/n):\n> ')).toLowerCase() === 'y';
      
      if (deploy) {
        const activate = (await question('Activate immediately? (y/n):\n> ')).toLowerCase() === 'y';
        
        try {
          await this.deployWorkflow(workflow, activate);
        } catch (error) {
          console.log('\n⚠️  Deployment failed, but workflow is saved locally');
        }
      }

      console.log('\n✅ Done!\n');

    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      rl.close();
    }
  }

  /**
   * Batch workflow generation from file
   */
  async batchGenerate(descriptionsFile) {
    console.log('📦 Batch workflow generation...\n');

    const content = await fs.readFile(descriptionsFile, 'utf8');
    const descriptions = content.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));

    console.log(`Found ${descriptions.length} workflow descriptions\n`);

    const results = [];

    for (let i = 0; i < descriptions.length; i++) {
      console.log(`\n[${ i + 1}/${descriptions.length}] Processing: ${descriptions[i].substring(0, 50)}...`);
      
      try {
        const workflow = await this.generateWorkflowFromDescription(descriptions[i], {
          verbose: false,
          stream: false
        });

        const filename = `batch-workflow-${i + 1}-${Date.now()}.json`;
        await this.saveWorkflowToFile(workflow, filename);

        results.push({
          description: descriptions[i],
          success: true,
          filename
        });

      } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        results.push({
          description: descriptions[i],
          success: false,
          error: error.message
        });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('BATCH GENERATION SUMMARY');
    console.log('='.repeat(60) + '\n');
    
    const successful = results.filter(r => r.success).length;
    console.log(`✅ Successful: ${successful}/${results.length}`);
    console.log(`❌ Failed: ${results.length - successful}/${results.length}\n`);

    return results;
  }
}

// CLI
async function main() {
  const args = process.argv.slice(2);
  
  // Load config from environment
  const n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
  const n8nApiKey = process.env.N8N_API_KEY || null;

  const builder = new N8nWorkflowBuilder(n8nBaseUrl, n8nApiKey);
  await builder.initialize();

  if (args.length === 0 || args[0] === '--interactive' || args[0] === '-i') {
    await builder.interactive();
  } else if (args[0] === '--generate' || args[0] === '-g') {
    const description = args.slice(1).join(' ');
    if (!description) {
      console.error('❌ Description required');
      process.exit(1);
    }

    const workflow = await builder.generateWorkflowFromDescription(description, {
      verbose: true,
      stream: true
    });

    const filename = `workflow-${Date.now()}.json`;
    await builder.saveWorkflowToFile(workflow, filename);

  } else if (args[0] === '--batch' || args[0] === '-b') {
    const file = args[1];
    if (!file) {
      console.error('❌ File path required');
      process.exit(1);
    }

    await builder.batchGenerate(file);

  } else {
    console.log('Usage:');
    console.log('  node n8n-workflow-builder.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  -i, --interactive              Interactive mode');
    console.log('  -g, --generate <description>   Generate single workflow');
    console.log('  -b, --batch <file>             Batch generate from file');
    console.log('');
    console.log('Examples:');
    console.log('  node n8n-workflow-builder.js -i');
    console.log('  node n8n-workflow-builder.js -g "Create a workflow that monitors GitHub for new issues"');
    console.log('  node n8n-workflow-builder.js -b descriptions.txt');
    console.log('');
    console.log('Environment:');
    console.log('  N8N_BASE_URL     n8n server URL (default: http://localhost:5678)');
    console.log('  N8N_API_KEY      n8n API key (optional)');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = N8nWorkflowBuilder;
