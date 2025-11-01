#!/usr/bin/env node

/**
 * Ollama Prompt Template Engine
 * 
 * This utility helps use prompt engineering templates with Ollama.
 * It loads templates, processes them with parameters, and sends them to Ollama.
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class OllamaPromptEngine {
  constructor(templatesPath = null) {
    this.templatesPath = templatesPath || path.join(__dirname, '..', '..', 'workflows', 'automation', 'ollama-prompts', 'prompt-templates.json');
    this.templates = null;
  }

  /**
   * Load prompt templates
   */
  async loadTemplates() {
    try {
      const content = await fs.readFile(this.templatesPath, 'utf8');
      this.templates = JSON.parse(content);
      console.log('✅ Loaded prompt templates');
      return this.templates;
    } catch (error) {
      console.error('❌ Failed to load templates:', error.message);
      throw error;
    }
  }

  /**
   * List all available templates
   */
  listTemplates() {
    if (!this.templates) {
      throw new Error('Templates not loaded. Call loadTemplates() first.');
    }

    console.log('\n📋 Available Prompt Templates:\n');
    
    for (const [categoryKey, category] of Object.entries(this.templates.categories)) {
      console.log(`\n${category.name}`);
      console.log(`${'─'.repeat(50)}`);
      console.log(`${category.description}\n`);
      
      category.templates.forEach((template, index) => {
        console.log(`  ${index + 1}. ${template.name} (ID: ${template.id})`);
        console.log(`     Model: ${template.model_recommendation}`);
        console.log(`     Parameters: ${template.parameters.join(', ')}`);
        console.log(`     Output: ${template.output_format}`);
      });
    }
    
    console.log('\n');
  }

  /**
   * Get a specific template by ID
   */
  getTemplate(templateId) {
    if (!this.templates) {
      throw new Error('Templates not loaded. Call loadTemplates() first.');
    }

    for (const category of Object.values(this.templates.categories)) {
      const template = category.templates.find(t => t.id === templateId);
      if (template) {
        return template;
      }
    }

    throw new Error(`Template not found: ${templateId}`);
  }

  /**
   * Process a template with parameters
   */
  processTemplate(template, parameters) {
    let prompt = template.prompt;

    // Replace all parameters
    for (const [key, value] of Object.entries(parameters)) {
      const placeholder = `{{${key}}}`;
      prompt = prompt.split(placeholder).join(value);
    }

    // Check for unreplaced parameters
    const unreplaced = prompt.match(/\{\{[^}]+\}\}/g);
    if (unreplaced) {
      console.warn('⚠️  Warning: Unreplaced parameters:', unreplaced);
    }

    return prompt;
  }

  /**
   * Execute a prompt with Ollama
   */
  async executePrompt(prompt, model = 'llama2:7b', options = {}) {
    return new Promise((resolve, reject) => {
      console.log(`\n🤖 Executing prompt with ${model}...`);
      
      if (options.verbose) {
        console.log('\nPrompt:');
        console.log('─'.repeat(60));
        console.log(prompt);
        console.log('─'.repeat(60) + '\n');
      }

      const ollama = spawn('ollama', ['run', model, prompt], {
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      // Set timeout
      const timeout = setTimeout(() => {
        ollama.kill();
        reject(new Error('Prompt execution timed out'));
      }, options.timeout || 60000);

      ollama.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        
        if (options.stream) {
          process.stdout.write(chunk);
        }
      });

      ollama.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ollama.on('close', (code) => {
        clearTimeout(timeout);
        
        if (code === 0) {
          console.log('\n✅ Prompt executed successfully\n');
          resolve({
            success: true,
            output: output.trim(),
            raw: output
          });
        } else {
          reject(new Error(`Ollama exited with code ${code}: ${errorOutput}`));
        }
      });

      ollama.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Execute a template with parameters
   */
  async executeTemplate(templateId, parameters, options = {}) {
    const template = this.getTemplate(templateId);
    
    console.log(`\n📝 Using template: ${template.name}`);
    console.log(`   Recommended model: ${template.model_recommendation}`);
    console.log(`   Output format: ${template.output_format}\n`);

    // Validate parameters
    const missingParams = template.parameters.filter(p => !parameters[p]);
    if (missingParams.length > 0) {
      throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
    }

    // Process template
    const prompt = this.processTemplate(template, parameters);

    // Use recommended model unless overridden
    const model = options.model || template.model_recommendation;

    // Execute
    const result = await this.executePrompt(prompt, model, options);

    // Parse output if JSON
    if (template.output_format === 'json' && result.success) {
      try {
        // Extract JSON from output (it might have extra text)
        const jsonMatch = result.output.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result.parsed = JSON.parse(jsonMatch[0]);
        } else {
          console.warn('⚠️  Warning: Could not extract JSON from output');
        }
      } catch (error) {
        console.warn('⚠️  Warning: Failed to parse JSON output:', error.message);
      }
    }

    return result;
  }

  /**
   * Save result to file
   */
  async saveResult(result, filename) {
    const outputDir = path.join(__dirname, '..', '..', 'outputs', 'ollama-results');
    
    try {
      await fs.mkdir(outputDir, { recursive: true });
      
      const filepath = path.join(outputDir, filename);
      const data = {
        timestamp: new Date().toISOString(),
        ...result
      };
      
      await fs.writeFile(filepath, JSON.stringify(data, null, 2));
      console.log(`💾 Result saved to: ${filepath}`);
      
      return filepath;
    } catch (error) {
      console.error('❌ Failed to save result:', error.message);
      throw error;
    }
  }

  /**
   * Interactive mode - select and execute templates
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
      this.listTemplates();

      const templateId = await question('Enter template ID: ');
      const template = this.getTemplate(templateId);

      console.log(`\nTemplate: ${template.name}`);
      console.log(`Required parameters: ${template.parameters.join(', ')}\n`);

      const parameters = {};
      for (const param of template.parameters) {
        parameters[param] = await question(`${param}: `);
      }

      const stream = (await question('Stream output? (y/n): ')).toLowerCase() === 'y';
      const saveOutput = (await question('Save output? (y/n): ')).toLowerCase() === 'y';

      const result = await this.executeTemplate(templateId, parameters, { 
        stream,
        verbose: true 
      });

      if (!stream) {
        console.log('\n' + '─'.repeat(60));
        console.log('Output:');
        console.log('─'.repeat(60));
        console.log(result.output);
        console.log('─'.repeat(60) + '\n');
      }

      if (result.parsed) {
        console.log('\nParsed JSON:');
        console.log(JSON.stringify(result.parsed, null, 2));
      }

      if (saveOutput) {
        const filename = `${templateId}-${Date.now()}.json`;
        await this.saveResult(result, filename);
      }

    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      rl.close();
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const engine = new OllamaPromptEngine();

  try {
    await engine.loadTemplates();

    if (args.length === 0 || args[0] === '--interactive' || args[0] === '-i') {
      // Interactive mode
      await engine.interactive();
    } else if (args[0] === '--list' || args[0] === '-l') {
      // List templates
      engine.listTemplates();
    } else if (args[0] === '--execute' || args[0] === '-e') {
      // Execute specific template
      const templateId = args[1];
      if (!templateId) {
        console.error('❌ Template ID required');
        process.exit(1);
      }

      const template = engine.getTemplate(templateId);
      
      // Parse parameters from command line (format: key=value)
      const parameters = {};
      for (let i = 2; i < args.length; i++) {
        const [key, ...valueParts] = args[i].split('=');
        if (key && valueParts.length > 0) {
          parameters[key] = valueParts.join('=');
        }
      }

      const result = await engine.executeTemplate(templateId, parameters, {
        stream: true,
        verbose: true
      });

      // Save automatically
      const filename = `${templateId}-${Date.now()}.json`;
      await engine.saveResult(result, filename);

    } else {
      console.log('Usage:');
      console.log('  node ollama-prompt-engine.js [options]');
      console.log('');
      console.log('Options:');
      console.log('  -i, --interactive         Interactive mode');
      console.log('  -l, --list               List all templates');
      console.log('  -e, --execute <id>       Execute template with ID');
      console.log('');
      console.log('Examples:');
      console.log('  node ollama-prompt-engine.js -i');
      console.log('  node ollama-prompt-engine.js -l');
      console.log('  node ollama-prompt-engine.js -e analyze_dom_structure dom_data=\'{"elements": 150}\'');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = OllamaPromptEngine;
