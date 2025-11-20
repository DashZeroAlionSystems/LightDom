/**
 * Multi-Step Prompt Engineering Service
 * 
 * Allows complex prompts to be broken down into multiple steps
 * with context preservation and iterative refinement
 */

import deepSeekService from './deepseek-api-service.js';
import { EventEmitter } from 'events';

class MultiStepPromptService extends EventEmitter {
  constructor() {
    super();
    
    this.sessions = new Map();
  }

  /**
   * Create a new multi-step prompt session
   */
  createSession(config = {}) {
    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: config.name || 'Untitled Session',
      description: config.description,
      createdAt: new Date().toISOString(),
      steps: [],
      context: {
        conversationHistory: [],
        insights: [],
        artifacts: {},
        variables: {}
      },
      systemPrompt: config.systemPrompt || 'You are a helpful AI assistant.',
      status: 'active'
    };

    this.sessions.set(session.id, session);
    this.emit('session:created', session);

    return session;
  }

  /**
   * Add a step to the session
   */
  async addStep(sessionId, stepConfig) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const step = {
      id: `step_${Date.now()}`,
      number: session.steps.length + 1,
      name: stepConfig.name || `Step ${session.steps.length + 1}`,
      purpose: stepConfig.purpose,
      prompt: stepConfig.prompt,
      extractors: stepConfig.extractors || [],
      validators: stepConfig.validators || [],
      transformers: stepConfig.transformers || [],
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    session.steps.push(step);
    this.emit('step:added', { sessionId, step });

    return step;
  }

  /**
   * Execute a single step
   */
  async executeStep(sessionId, stepId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const step = session.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error('Step not found');
    }

    step.status = 'running';
    step.startedAt = new Date().toISOString();

    try {
      // Substitute variables in prompt
      const processedPrompt = this.substituteVariables(step.prompt, session.context.variables);

      // Execute with DeepSeek
      const response = await deepSeekService.chat({
        message: processedPrompt,
        context: session.context.conversationHistory,
        systemPrompt: session.systemPrompt
      });

      // Store in conversation history
      session.context.conversationHistory.push({
        role: 'user',
        content: processedPrompt
      });
      session.context.conversationHistory.push({
        role: 'assistant',
        content: response.content
      });

      // Extract insights using extractors
      const extracted = this.extractInsights(response.content, step.extractors);

      // Validate extracted data
      const validated = this.validateData(extracted, step.validators);

      // Transform data
      const transformed = this.transformData(validated, step.transformers);

      // Store results
      step.result = {
        raw: response.content,
        extracted,
        validated,
        transformed
      };

      // Update context variables
      Object.assign(session.context.variables, transformed);

      // Store artifacts
      if (transformed.artifact) {
        session.context.artifacts[step.id] = transformed.artifact;
      }

      // Store insights
      session.context.insights.push({
        stepId: step.id,
        stepNumber: step.number,
        purpose: step.purpose,
        insights: transformed
      });

      step.status = 'completed';
      step.completedAt = new Date().toISOString();

      this.emit('step:completed', { sessionId, step });

      return step.result;
    } catch (error) {
      step.status = 'error';
      step.error = error.message;
      step.completedAt = new Date().toISOString();

      this.emit('step:error', { sessionId, step, error });

      throw error;
    }
  }

  /**
   * Execute all steps in sequence
   */
  async executeAllSteps(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const results = [];

    for (const step of session.steps) {
      const result = await this.executeStep(sessionId, step.id);
      results.push(result);
    }

    session.status = 'completed';
    this.emit('session:completed', session);

    return {
      sessionId,
      results,
      context: session.context
    };
  }

  /**
   * Substitute variables in prompt
   */
  substituteVariables(prompt, variables) {
    let processed = prompt;

    // Replace {{variable}} with values
    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processed = processed.replace(pattern, String(value));
    }

    return processed;
  }

  /**
   * Extract insights from response
   */
  extractInsights(content, extractors) {
    const extracted = {};

    for (const extractor of extractors) {
      const { name, pattern, type } = extractor;

      if (type === 'regex') {
        const match = content.match(new RegExp(pattern));
        extracted[name] = match ? match[1] || match[0] : null;
      } else if (type === 'json') {
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            extracted[name] = parsed[name] || parsed;
          }
        } catch (error) {
          console.error('JSON extraction error:', error);
          extracted[name] = null;
        }
      } else if (type === 'list') {
        // Extract list items
        const lines = content.split('\n');
        const items = lines
          .filter(line => line.match(/^[\-\*\d]+\.?\s/))
          .map(line => line.replace(/^[\-\*\d]+\.?\s+/, '').trim());
        extracted[name] = items;
      } else if (type === 'code') {
        // Extract code blocks
        const codeMatch = content.match(/```[\s\S]*?```/g);
        extracted[name] = codeMatch ? codeMatch.map(m => m.replace(/```\w*\n?/g, '')) : [];
      }
    }

    return extracted;
  }

  /**
   * Validate extracted data
   */
  validateData(data, validators) {
    const validated = { ...data };

    for (const validator of validators) {
      const { field, rule, message } = validator;

      if (!validated[field]) {
        if (rule.required) {
          throw new Error(message || `${field} is required`);
        }
        continue;
      }

      if (rule.type && typeof validated[field] !== rule.type) {
        throw new Error(message || `${field} must be of type ${rule.type}`);
      }

      if (rule.min !== undefined && validated[field] < rule.min) {
        throw new Error(message || `${field} must be at least ${rule.min}`);
      }

      if (rule.max !== undefined && validated[field] > rule.max) {
        throw new Error(message || `${field} must be at most ${rule.max}`);
      }

      if (rule.pattern && !new RegExp(rule.pattern).test(validated[field])) {
        throw new Error(message || `${field} does not match required pattern`);
      }
    }

    return validated;
  }

  /**
   * Transform data
   */
  transformData(data, transformers) {
    let transformed = { ...data };

    for (const transformer of transformers) {
      const { field, operation, params } = transformer;

      if (operation === 'lowercase') {
        transformed[field] = String(transformed[field]).toLowerCase();
      } else if (operation === 'uppercase') {
        transformed[field] = String(transformed[field]).toUpperCase();
      } else if (operation === 'trim') {
        transformed[field] = String(transformed[field]).trim();
      } else if (operation === 'split') {
        transformed[field] = String(transformed[field]).split(params.delimiter);
      } else if (operation === 'join') {
        transformed[field] = Array.isArray(transformed[field]) 
          ? transformed[field].join(params.delimiter)
          : transformed[field];
      } else if (operation === 'map') {
        transformed[field] = params.mapping[transformed[field]] || transformed[field];
      } else if (operation === 'parse_int') {
        transformed[field] = parseInt(transformed[field]);
      } else if (operation === 'parse_float') {
        transformed[field] = parseFloat(transformed[field]);
      } else if (operation === 'parse_json') {
        try {
          transformed[field] = JSON.parse(transformed[field]);
        } catch (e) {
          console.error('JSON parse error:', e);
        }
      }
    }

    return transformed;
  }

  /**
   * Create a pre-defined workflow
   */
  createWorkflow(workflowType, params) {
    const workflows = {
      'schema-analysis': this.createSchemaAnalysisWorkflow(params),
      'url-generation': this.createUrlGenerationWorkflow(params),
      'config-generation': this.createConfigGenerationWorkflow(params),
      'data-extraction': this.createDataExtractionWorkflow(params)
    };

    return workflows[workflowType] || this.createCustomWorkflow(params);
  }

  /**
   * Schema analysis workflow
   */
  createSchemaAnalysisWorkflow(params) {
    const session = this.createSession({
      name: 'Schema Analysis Workflow',
      description: 'Analyze and extract schema relationships',
      systemPrompt: 'You are a data schema expert.'
    });

    // Step 1: Identify schema types
    this.addStep(session.id, {
      name: 'Identify Schemas',
      purpose: 'Find all schema types in the data',
      prompt: `Analyze this URL/page: ${params.url}\n\nWhat schema types are present? List them.`,
      extractors: [
        { name: 'schemaTypes', type: 'list', pattern: null }
      ]
    });

    // Step 2: Extract relationships
    this.addStep(session.id, {
      name: 'Extract Relationships',
      purpose: 'Find relationships between schemas',
      prompt: `For these schema types: {{schemaTypes}}\n\nWhat relationships exist between them?`,
      extractors: [
        { name: 'relationships', type: 'json', pattern: null }
      ]
    });

    // Step 3: Generate config
    this.addStep(session.id, {
      name: 'Generate Config',
      purpose: 'Create configuration based on relationships',
      prompt: `Based on these relationships: {{relationships}}\n\nGenerate a seeding configuration as JSON.`,
      extractors: [
        { name: 'config', type: 'json', pattern: null }
      ]
    });

    return session;
  }

  /**
   * Get session
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * List all sessions
   */
  listSessions(filters = {}) {
    let sessions = Array.from(this.sessions.values());

    if (filters.status) {
      sessions = sessions.filter(s => s.status === filters.status);
    }

    return sessions;
  }

  /**
   * Delete session
   */
  deleteSession(sessionId) {
    return this.sessions.delete(sessionId);
  }
}

// Export singleton
const multiStepPromptService = new MultiStepPromptService();

export default multiStepPromptService;
export { MultiStepPromptService };
