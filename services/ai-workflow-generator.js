/**
 * AI Prompt-to-Schema Workflow Generator
 * 
 * Phase 3: Natural language workflow generation using Ollama
 * Converts user prompts into validated workflow schemas
 */

import { spawn } from 'child_process';
import templateManager from './workflow-template-manager.js';

/**
 * Ollama integration for AI-powered workflow generation
 */
export class AIWorkflowGenerator {
  constructor(model = 'llama2') {
    this.model = model;
    this.availableModels = ['llama2', 'codellama', 'mistral', 'mixtral'];
  }

  /**
   * Generate workflow schema from natural language prompt
   */
  async generateWorkflowFromPrompt(userPrompt, options = {}) {
    console.log(`\n🤖 Generating workflow from prompt using ${this.model}...`);
    console.log(`📝 Prompt: "${userPrompt}"\n`);

    // Build the AI prompt with context
    const systemPrompt = this.buildSystemPrompt();
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${userPrompt}\n\nGenerate a workflow schema:`;

    try {
      // Call Ollama to generate the schema
      const aiResponse = await this.callOllama(fullPrompt, options);
      
      // Parse and validate the generated schema
      const workflowSchema = this.parseAIResponse(aiResponse);
      
      // Validate against JSON schema
      const validation = templateManager.validate(workflowSchema);
      
      if (!validation.valid) {
        console.warn('⚠️  AI generated invalid schema, attempting to fix...');
        const fixedSchema = await this.fixInvalidSchema(workflowSchema, validation.errors);
        return fixedSchema;
      }

      console.log('✅ Valid workflow schema generated!\n');
      return workflowSchema;
      
    } catch (error) {
      console.error('❌ Failed to generate workflow:', error.message);
      
      // Fallback to template-based generation
      return this.fallbackToTemplate(userPrompt);
    }
  }

  /**
   * Build system prompt with workflow schema context
   */
  buildSystemPrompt() {
    return `You are a workflow schema generator. Generate valid JSON workflow schemas based on user requests.

WORKFLOW SCHEMA FORMAT:
{
  "id": "workflow-<unique-id>",
  "name": "Workflow Name",
  "description": "What the workflow does",
  "type": "datamining" | "seo" | "component-generation" | "ml-training" | "custom",
  "version": "1.0.0",
  "tasks": [
    {
      "id": "task-<unique-id>",
      "label": "Task Name",
      "description": "What this task does",
      "handler": {
        "type": "data-source" | "crawler" | "schema-linking" | "component-generation" | "seo-optimization" | "ml-training" | "api-call" | "custom",
        "config": { /* handler-specific config */ }
      },
      "dependencies": ["task-id-that-must-run-first"],
      "optional": false
    }
  ],
  "attributes": [
    {
      "id": "attr-<unique-id>",
      "label": "Attribute Name",
      "type": "meta" | "content" | "media" | "technical" | "custom",
      "enrichmentPrompt": "How to enrich this attribute"
    }
  ],
  "config": {
    "parallel": false,
    "retryOnFailure": true,
    "maxRetries": 3,
    "timeout": 3600
  }
}

AVAILABLE TASK HANDLERS:
- data-source: Connect to databases and query data
- crawler: Web scraping and DOM extraction
- schema-linking: Link data to schema.org vocabularies
- component-generation: Generate React components
- seo-optimization: SEO analysis and optimization
- ml-training: Train machine learning models
- api-call: Call external APIs
- custom: Custom task execution

RULES:
1. Generate ONLY valid JSON (no markdown, no explanation)
2. All IDs must be unique and follow the pattern shown
3. Tasks can depend on other tasks (use dependencies array)
4. Choose appropriate handler types for the workflow goal
5. Include relevant attributes for data enrichment
6. Set reasonable timeout and retry values

Generate the workflow schema as pure JSON:`;
  }

  /**
   * Call Ollama LLM with prompt
   */
  async callOllama(prompt, options = {}) {
    return new Promise((resolve, reject) => {
      const args = ['run', this.model];
      
      if (options.temperature !== undefined) {
        args.push('--temperature', options.temperature.toString());
      }

      const ollama = spawn('ollama', args);
      
      let output = '';
      let errorOutput = '';

      ollama.stdout.on('data', (data) => {
        output += data.toString();
      });

      ollama.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ollama.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Ollama exited with code ${code}: ${errorOutput}`));
        } else {
          resolve(output);
        }
      });

      ollama.on('error', (error) => {
        reject(new Error(`Failed to spawn Ollama: ${error.message}`));
      });

      // Send the prompt
      ollama.stdin.write(prompt);
      ollama.stdin.end();
    });
  }

  /**
   * Parse AI response and extract JSON schema
   */
  parseAIResponse(response) {
    // Try to extract JSON from the response
    let jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    try {
      const schema = JSON.parse(jsonMatch[0]);
      
      // Ensure required fields exist
      if (!schema.id) {
        schema.id = `workflow-${Date.now()}`;
      }
      if (!schema.version) {
        schema.version = '1.0.0';
      }
      if (!schema.tasks) {
        schema.tasks = [];
      }
      
      return schema;
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error.message}`);
    }
  }

  /**
   * Attempt to fix invalid schema based on validation errors
   */
  async fixInvalidSchema(schema, errors) {
    console.log('🔧 Attempting to fix schema validation errors...');
    
    // Apply common fixes
    errors.forEach(error => {
      console.log(`  - Fixing: ${error.instancePath} ${error.message}`);
    });

    // Ensure required fields
    if (!schema.type) {
      schema.type = 'custom';
    }
    if (!Array.isArray(schema.tasks)) {
      schema.tasks = [];
    }

    // Validate task structure
    schema.tasks = schema.tasks.map((task, index) => ({
      id: task.id || `task-${index}`,
      label: task.label || `Task ${index + 1}`,
      description: task.description || '',
      handler: {
        type: task.handler?.type || 'custom',
        config: task.handler?.config || {}
      },
      dependencies: Array.isArray(task.dependencies) ? task.dependencies : [],
      optional: task.optional || false
    }));

    // Validate again
    const validation = templateManager.validate(schema);
    
    if (!validation.valid) {
      console.warn('⚠️  Could not fix all validation errors');
      return this.fallbackToTemplate('Custom workflow');
    }

    console.log('✅ Schema fixed and validated');
    return schema;
  }

  /**
   * Fallback to template-based generation if AI fails
   */
  fallbackToTemplate(prompt) {
    console.log('📋 Falling back to template-based generation...');
    
    // Analyze prompt to choose best template
    const promptLower = prompt.toLowerCase();
    
    let templateId = 'datamining'; // default
    
    if (promptLower.includes('seo') || promptLower.includes('optimize')) {
      templateId = 'seoOptimization';
    } else if (promptLower.includes('component') || promptLower.includes('react')) {
      templateId = 'componentGeneration';
    }

    console.log(`  Using template: ${templateId}`);
    
    return templateManager.instantiateFromTemplate(templateId, {
      name: this.extractWorkflowName(prompt),
      description: prompt
    });
  }

  /**
   * Extract workflow name from prompt
   */
  extractWorkflowName(prompt) {
    // Simple extraction - could be enhanced with NLP
    const words = prompt.split(' ').slice(0, 5);
    return words.join(' ').replace(/[^a-zA-Z0-9 ]/g, '');
  }

  /**
   * Generate task suggestions based on workflow goal
   */
  async suggestTasks(workflowGoal) {
    const prompt = `Given the workflow goal: "${workflowGoal}"
    
Suggest 3-6 specific tasks needed to achieve this goal. For each task, provide:
- A clear label
- A brief description
- The appropriate handler type from: data-source, crawler, schema-linking, component-generation, seo-optimization, ml-training, api-call, custom

Return ONLY a JSON array of tasks.`;

    try {
      const response = await this.callOllama(prompt);
      const tasks = JSON.parse(response);
      return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
      console.error('Failed to suggest tasks:', error.message);
      return [];
    }
  }

  /**
   * Enhance workflow with AI suggestions
   */
  async enhanceWorkflow(workflow) {
    console.log('✨ Enhancing workflow with AI suggestions...\n');

    // Generate better descriptions
    if (!workflow.description || workflow.description.length < 20) {
      const descPrompt = `Generate a detailed description (2-3 sentences) for a workflow named "${workflow.name}" that performs these tasks: ${workflow.tasks.map(t => t.label).join(', ')}. Return only the description text.`;
      
      try {
        const description = await this.callOllama(descPrompt);
        workflow.description = description.trim();
        console.log(`  ✅ Generated description`);
      } catch (error) {
        console.log(`  ⚠️  Could not generate description`);
      }
    }

    // Enhance task descriptions
    for (const task of workflow.tasks) {
      if (!task.description || task.description.length < 10) {
        const taskPrompt = `Describe in one sentence what the task "${task.label}" should do in a workflow. Return only the description.`;
        
        try {
          const description = await this.callOllama(taskPrompt);
          task.description = description.trim();
          console.log(`  ✅ Enhanced task: ${task.label}`);
        } catch (error) {
          console.log(`  ⚠️  Could not enhance task: ${task.label}`);
        }
      }
    }

    console.log('\n✨ Workflow enhancement complete');
    return workflow;
  }

  /**
   * Check if Ollama is available
   */
  async checkOllamaAvailability() {
    return new Promise((resolve) => {
      const ollama = spawn('ollama', ['list']);
      
      ollama.on('close', (code) => {
        resolve(code === 0);
      });

      ollama.on('error', () => {
        resolve(false);
      });
    });
  }
}

export default AIWorkflowGenerator;
