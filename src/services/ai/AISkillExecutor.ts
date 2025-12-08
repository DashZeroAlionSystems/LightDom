import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import Handlebars from 'handlebars';
import { EventEmitter } from 'events';

/**
 * AI Skill Executor
 * 
 * Loads AI skill configurations from YAML files and executes them with the appropriate AI model.
 * Supports retry logic, feedback loops, and result validation.
 */

export interface SkillVariable {
  type: string;
  required: boolean;
  default?: any;
  description: string;
}

export interface SkillConfig {
  skillId: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  metadata: {
    tags: string[];
    difficulty: string;
    estimatedTime: string;
    requirements: string[];
  };
  model: {
    provider: string;
    name: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
  };
  prompt: {
    system: string;
    user: string;
  };
  variables: Record<string, SkillVariable>;
  output: {
    format: string;
    validation: {
      enabled: boolean;
      schema?: any;
    };
    postProcessing: Array<{
      type: string;
      enabled: boolean;
      [key: string]: any;
    }>;
  };
  execution: {
    retryOnFailure: boolean;
    maxRetries: number;
    retryDelay: number;
    timeout: number;
    feedbackLoop?: {
      enabled: boolean;
      iterations: number;
      evaluationCriteria: string[];
    };
  };
  integrations: {
    database?: { enabled: boolean; table: string };
    queue?: { enabled: boolean; topic: string };
    webhooks?: { enabled: boolean; urls: string[] };
    filesystem?: { enabled: boolean; outputDir: string };
  };
  training?: {
    enabled: boolean;
    collectData: boolean;
    feedbackRequired: boolean;
    minimumRating: number;
  };
  dependencies: string[];
  successCriteria: Array<{
    type: string;
    [key: string]: any;
  }>;
}

export interface ExecutionContext {
  variables: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ExecutionResult {
  success: boolean;
  output: any;
  metadata: {
    skillId: string;
    executionTime: number;
    retries: number;
    tokensUsed?: number;
    cost?: number;
  };
  error?: string;
  validationResults?: any;
}

export class AISkillExecutor extends EventEmitter {
  private skills: Map<string, SkillConfig> = new Map();
  private skillsDir: string;
  private modelProviders: Map<string, any> = new Map();

  constructor(skillsDir?: string) {
    super();
    this.skillsDir = skillsDir || path.join(process.cwd(), 'config', 'ai-skills');
  }

  /**
   * Initialize the executor by loading all skills
   */
  async initialize(): Promise<void> {
    console.log(`🤖 Initializing AI Skill Executor from ${this.skillsDir}`);
    
    try {
      const files = await fs.readdir(this.skillsDir);
      const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));

      for (const file of yamlFiles) {
        const filePath = path.join(this.skillsDir, file);
        await this.loadSkill(filePath);
      }

      console.log(`✅ Loaded ${this.skills.size} AI skills`);
      this.emit('initialized', { skillCount: this.skills.size });
    } catch (error: any) {
      console.error(`❌ Failed to initialize: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load a skill from a YAML file
   */
  async loadSkill(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const skill = yaml.load(content) as SkillConfig;

      // Validate skill configuration
      this.validateSkillConfig(skill);

      this.skills.set(skill.skillId, skill);
      console.log(`📦 Loaded skill: ${skill.name} (${skill.skillId})`);
      
      this.emit('skillLoaded', { skillId: skill.skillId, name: skill.name });
    } catch (error: any) {
      console.error(`❌ Failed to load skill from ${filePath}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Register a model provider
   */
  registerModelProvider(name: string, provider: any): void {
    this.modelProviders.set(name, provider);
    console.log(`🔌 Registered model provider: ${name}`);
  }

  /**
   * Execute a skill with given context
   */
  async executeSkill(
    skillId: string,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const skill = this.skills.get(skillId);

    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🚀 Executing skill: ${skill.name}`);
    console.log(`${'='.repeat(80)}\n`);

    this.emit('executionStart', { skillId, skill: skill.name });

    // Validate input variables
    this.validateContext(skill, context);

    let retries = 0;
    let lastError: string | undefined;

    while (retries <= skill.execution.maxRetries) {
      try {
        // Check dependencies
        await this.checkDependencies(skill);

        // Render prompts with variables
        const prompts = this.renderPrompts(skill, context);

        // Execute with model provider
        const output = await this.executeWithModel(skill, prompts);

        // Validate output
        const validationResults = await this.validateOutput(skill, output);

        if (!validationResults.valid) {
          throw new Error(`Output validation failed: ${validationResults.errors.join(', ')}`);
        }

        // Post-process output
        const processedOutput = await this.postProcessOutput(skill, output);

        // Check success criteria
        const meetsSuccess = await this.checkSuccessCriteria(skill, processedOutput);

        if (!meetsSuccess) {
          throw new Error('Output does not meet success criteria');
        }

        // Save results
        await this.saveResults(skill, processedOutput, context);

        const executionTime = Date.now() - startTime;

        const result: ExecutionResult = {
          success: true,
          output: processedOutput,
          metadata: {
            skillId: skill.skillId,
            executionTime,
            retries,
          },
          validationResults,
        };

        console.log(`\n✅ Skill executed successfully in ${executionTime}ms`);
        this.emit('executionComplete', result);

        // Collect training data if enabled
        if (skill.training?.enabled && skill.training?.collectData) {
          await this.collectTrainingData(skill, context, result);
        }

        return result;
      } catch (error: any) {
        lastError = error.message;
        retries++;

        if (retries <= skill.execution.maxRetries && skill.execution.retryOnFailure) {
          console.log(`⚠️ Attempt ${retries} failed: ${error.message}`);
          console.log(`🔄 Retrying in ${skill.execution.retryDelay}ms...`);
          
          this.emit('executionRetry', { skillId, retries, error: error.message });
          
          await new Promise(resolve => setTimeout(resolve, skill.execution.retryDelay));
        } else {
          console.error(`❌ Skill execution failed after ${retries} attempts: ${error.message}`);
          
          const result: ExecutionResult = {
            success: false,
            output: null,
            metadata: {
              skillId: skill.skillId,
              executionTime: Date.now() - startTime,
              retries: retries - 1,
            },
            error: lastError,
          };

          this.emit('executionFailed', result);
          
          return result;
        }
      }
    }

    // Should never reach here, but TypeScript needs it
    throw new Error('Unexpected execution flow');
  }

  /**
   * List all available skills
   */
  listSkills(): SkillConfig[] {
    return Array.from(this.skills.values());
  }

  /**
   * Get a specific skill
   */
  getSkill(skillId: string): SkillConfig | undefined {
    return this.skills.get(skillId);
  }

  /**
   * Validate skill configuration
   */
  private validateSkillConfig(skill: SkillConfig): void {
    if (!skill.skillId || !skill.name || !skill.version) {
      throw new Error('Skill must have skillId, name, and version');
    }

    if (!skill.model || !skill.model.provider || !skill.model.name) {
      throw new Error('Skill must have valid model configuration');
    }

    if (!skill.prompt || !skill.prompt.system || !skill.prompt.user) {
      throw new Error('Skill must have system and user prompts');
    }
  }

  /**
   * Validate execution context
   */
  private validateContext(skill: SkillConfig, context: ExecutionContext): void {
    for (const [varName, varConfig] of Object.entries(skill.variables)) {
      if (varConfig.required && !(varName in context.variables)) {
        if (varConfig.default !== undefined) {
          context.variables[varName] = varConfig.default;
        } else {
          throw new Error(`Required variable missing: ${varName}`);
        }
      }
    }
  }

  /**
   * Check skill dependencies
   */
  private async checkDependencies(skill: SkillConfig): Promise<void> {
    if (skill.dependencies.length > 0) {
      console.log(`📋 Checking dependencies: ${skill.dependencies.join(', ')}`);
      
      for (const depId of skill.dependencies) {
        if (!this.skills.has(depId)) {
          throw new Error(`Dependency not found: ${depId}`);
        }
      }
    }
  }

  /**
   * Render prompts with variables using Handlebars
   */
  private renderPrompts(skill: SkillConfig, context: ExecutionContext): { system: string; user: string } {
    const systemTemplate = Handlebars.compile(skill.prompt.system);
    const userTemplate = Handlebars.compile(skill.prompt.user);

    return {
      system: systemTemplate(context.variables),
      user: userTemplate(context.variables),
    };
  }

  /**
   * Execute with the configured model provider
   */
  private async executeWithModel(skill: SkillConfig, prompts: { system: string; user: string }): Promise<any> {
    const provider = this.modelProviders.get(skill.model.provider);

    if (!provider) {
      throw new Error(`Model provider not found: ${skill.model.provider}`);
    }

    console.log(`🤖 Executing with ${skill.model.provider} - ${skill.model.name}`);

    const result = await provider.execute({
      model: skill.model.name,
      systemPrompt: prompts.system,
      userPrompt: prompts.user,
      temperature: skill.model.temperature,
      maxTokens: skill.model.maxTokens,
      timeout: skill.model.timeout,
    });

    return result;
  }

  /**
   * Validate output against schema
   */
  private async validateOutput(skill: SkillConfig, output: any): Promise<{ valid: boolean; errors: string[] }> {
    if (!skill.output.validation.enabled) {
      return { valid: true, errors: [] };
    }

    const errors: string[] = [];

    // Basic format validation
    if (skill.output.format === 'json') {
      try {
        if (typeof output === 'string') {
          JSON.parse(output);
        }
      } catch {
        errors.push('Output is not valid JSON');
      }
    }

    // TODO: Implement JSON Schema validation if schema is provided

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Post-process the output
   */
  private async postProcessOutput(skill: SkillConfig, output: any): Promise<any> {
    let processed = output;

    for (const step of skill.output.postProcessing) {
      if (!step.enabled) continue;

      console.log(`🔧 Post-processing: ${step.type}`);

      switch (step.type) {
        case 'extractCode':
          processed = this.extractCode(processed, step.languages);
          break;
        case 'formatCode':
          // TODO: Implement code formatting
          break;
        case 'validateSyntax':
          // TODO: Implement syntax validation
          break;
      }
    }

    return processed;
  }

  /**
   * Extract code blocks from markdown output
   */
  private extractCode(output: string, languages: string[]): string {
    if (typeof output !== 'string') return output;

    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
    const matches = [...output.matchAll(codeBlockRegex)];

    if (matches.length === 0) return output;

    // Return the first matching code block
    for (const match of matches) {
      const lang = match[1];
      const code = match[2];

      if (!languages || languages.length === 0 || (lang && languages.includes(lang))) {
        return code;
      }
    }

    return output;
  }

  /**
   * Check if output meets success criteria
   */
  private async checkSuccessCriteria(skill: SkillConfig, output: any): Promise<boolean> {
    for (const criteria of skill.successCriteria) {
      switch (criteria.type) {
        case 'outputLength':
          const length = JSON.stringify(output).length;
          if (criteria.min && length < criteria.min) return false;
          if (criteria.max && length > criteria.max) return false;
          break;

        case 'containsKeywords':
          const outputStr = JSON.stringify(output).toLowerCase();
          for (const keyword of criteria.keywords || []) {
            if (!outputStr.includes(keyword.toLowerCase())) {
              return false;
            }
          }
          break;

        case 'validFormat':
          // Already validated in validateOutput
          break;
      }
    }

    return true;
  }

  /**
   * Save results to configured integrations
   */
  private async saveResults(skill: SkillConfig, output: any, context: ExecutionContext): Promise<void> {
    // Save to filesystem if enabled
    if (skill.integrations.filesystem?.enabled) {
      const outputDir = skill.integrations.filesystem.outputDir;
      await fs.mkdir(outputDir, { recursive: true });

      const filename = `${skill.skillId}-${Date.now()}.json`;
      const filepath = path.join(outputDir, filename);

      await fs.writeFile(
        filepath,
        JSON.stringify({ output, context, timestamp: new Date().toISOString() }, null, 2),
        'utf8'
      );

      console.log(`💾 Saved results to: ${filepath}`);
    }

    // TODO: Implement database, queue, and webhook integrations
  }

  /**
   * Collect training data
   */
  private async collectTrainingData(
    skill: SkillConfig,
    context: ExecutionContext,
    result: ExecutionResult
  ): Promise<void> {
    const trainingData = {
      skillId: skill.skillId,
      input: context.variables,
      output: result.output,
      success: result.success,
      metadata: result.metadata,
      timestamp: new Date().toISOString(),
    };

    // Save training data
    const trainingDir = path.join(process.cwd(), 'training_data', 'skills');
    await fs.mkdir(trainingDir, { recursive: true });

    const filename = `${skill.skillId}-training-${Date.now()}.json`;
    await fs.writeFile(
      path.join(trainingDir, filename),
      JSON.stringify(trainingData, null, 2),
      'utf8'
    );

    console.log(`📚 Collected training data: ${filename}`);
  }
}

export default AISkillExecutor;
