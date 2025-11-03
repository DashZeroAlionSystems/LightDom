/**
 * Prompt to Schema Generator
 * 
 * Converts natural language prompts into executable schemas with:
 * - Hierarchical task instructions
 * - Dependency mapping
 * - Schema configurations
 * - Workflow generation
 */

import { Pool } from 'pg';

export interface PromptAnalysis {
  intent: string;
  entities: Entity[];
  tasks: Task[];
  dependencies: Dependency[];
  schemas: SchemaDefinition[];
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedEffort: string;
}

export interface Entity {
  type: string; // url, keyword, client, campaign, etc.
  value: string;
  confidence: number;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  type: string; // crawl, analyze, optimize, generate, etc.
  priority: number;
  dependencies: string[]; // Task IDs this depends on
  schema: SchemaDefinition;
  config: Record<string, any>;
  subtasks?: Task[];
}

export interface Dependency {
  from: string; // Task ID
  to: string; // Task ID
  type: 'sequential' | 'parallel' | 'conditional';
  condition?: string;
}

export interface SchemaDefinition {
  id: string;
  name: string;
  type: string; // workflow, task, enrichment, component, etc.
  version: string;
  properties: Record<string, PropertyDefinition>;
  required: string[];
  transformations?: Transformation[];
  linkedSchemas?: string[]; // IDs of schemas this links to
}

export interface PropertyDefinition {
  type: string;
  description: string;
  default?: any;
  enum?: any[];
  format?: string;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  rule: string; // regex, min, max, custom, etc.
  value: any;
  message: string;
}

export interface Transformation {
  source: string; // Property path
  target: string; // Property path  
  function: string; // concat, map, filter, etc.
  args?: any[];
}

export interface GeneratedWorkflow {
  id: string;
  name: string;
  description: string;
  prompt: string;
  tasks: Task[];
  schemas: SchemaDefinition[];
  dependencies: Dependency[];
  hierarchy: WorkflowHierarchy;
  metadata: {
    generated: Date;
    complexity: string;
    estimatedDuration: string;
    requiredServices: string[];
  };
}

export interface WorkflowHierarchy {
  root: Task;
  levels: {
    level: number;
    tasks: Task[];
  }[];
}

export class PromptToSchemaGenerator {
  private db: Pool;
  private ollamaEndpoint: string;

  constructor(db: Pool, ollamaEndpoint = 'http://localhost:11434') {
    this.db = db;
    this.ollamaEndpoint = ollamaEndpoint;
  }

  /**
   * Generate workflow schema from natural language prompt
   */
  async generateFromPrompt(
    prompt: string,
    context: Record<string, any> = {}
  ): Promise<GeneratedWorkflow> {
    // Analyze prompt using DeepSeek
    const analysis = await this.analyzePrompt(prompt, context);

    // Generate task hierarchy
    const hierarchy = this.buildTaskHierarchy(analysis.tasks);

    // Generate schemas for each task
    const schemas = await this.generateSchemas(analysis.tasks);

    // Extract dependencies
    const dependencies = this.extractDependencies(analysis.tasks);

    // Create workflow
    const workflow: GeneratedWorkflow = {
      id: `workflow-${Date.now()}`,
      name: this.generateWorkflowName(analysis.intent),
      description: prompt,
      prompt,
      tasks: analysis.tasks,
      schemas,
      dependencies,
      hierarchy,
      metadata: {
        generated: new Date(),
        complexity: analysis.complexity,
        estimatedDuration: analysis.estimatedEffort,
        requiredServices: this.extractRequiredServices(analysis.tasks),
      },
    };

    // Save to database
    await this.saveWorkflow(workflow);

    return workflow;
  }

  /**
   * Analyze prompt using DeepSeek
   */
  private async analyzePrompt(
    prompt: string,
    context: Record<string, any>
  ): Promise<PromptAnalysis> {
    const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1',
        prompt: `Analyze the following workflow request and break it down into structured tasks:

Request: ${prompt}
Context: ${JSON.stringify(context, null, 2)}

Return a JSON object with:
1. intent - The main goal (e.g., "SEO optimization", "data collection")
2. entities - Extracted entities like URLs, keywords, clients
3. tasks - List of tasks needed with dependencies
4. complexity - simple, moderate, or complex
5. estimatedEffort - Time estimate (e.g., "2-4 hours")

Format as valid JSON.`,
        stream: false,
      }),
    });

    const result = await response.json();
    const analysis = JSON.parse(result.response);

    // Enhance tasks with IDs and schemas
    analysis.tasks = analysis.tasks.map((task: any, index: number) => ({
      id: `task-${index + 1}`,
      ...task,
      schema: {
        id: `schema-task-${index + 1}`,
        name: `${task.type}Schema`,
        type: 'task',
        version: '1.0.0',
        properties: {},
        required: [],
      },
      subtasks: task.subtasks?.map((st: any, stIndex: number) => ({
        id: `task-${index + 1}-${stIndex + 1}`,
        ...st,
      })),
    }));

    return analysis;
  }

  /**
   * Build task hierarchy
   */
  private buildTaskHierarchy(tasks: Task[]): WorkflowHierarchy {
    // Find root tasks (no dependencies)
    const rootTasks = tasks.filter((t) => !t.dependencies || t.dependencies.length === 0);

    if (rootTasks.length === 0) {
      throw new Error('No root task found - circular dependency detected');
    }

    // Build levels
    const levels: { level: number; tasks: Task[] }[] = [];
    const processed = new Set<string>();
    let currentLevel = 0;
    let currentTasks = rootTasks;

    while (currentTasks.length > 0) {
      levels.push({ level: currentLevel, tasks: currentTasks });
      currentTasks.forEach((t) => processed.add(t.id));

      // Find next level tasks
      const nextTasks = tasks.filter(
        (t) =>
          !processed.has(t.id) &&
          t.dependencies?.every((dep) => processed.has(dep))
      );

      currentTasks = nextTasks;
      currentLevel++;
    }

    return {
      root: rootTasks[0],
      levels,
    };
  }

  /**
   * Generate schemas for tasks
   */
  private async generateSchemas(tasks: Task[]): Promise<SchemaDefinition[]> {
    const schemas: SchemaDefinition[] = [];

    for (const task of tasks) {
      const schema = await this.generateTaskSchema(task);
      schemas.push(schema);

      // Generate schemas for subtasks
      if (task.subtasks) {
        for (const subtask of task.subtasks) {
          const subtaskSchema = await this.generateTaskSchema(subtask);
          schemas.push(subtaskSchema);
        }
      }
    }

    return schemas;
  }

  /**
   * Generate schema for a single task
   */
  private async generateTaskSchema(task: Task): Promise<SchemaDefinition> {
    // Use DeepSeek to generate appropriate schema
    const response = await fetch(`${this.ollamaEndpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1',
        prompt: `Generate a JSON schema for the following task:

Task: ${task.name}
Description: ${task.description}
Type: ${task.type}

Return a schema with properties, required fields, and validation rules.
Format as valid JSON.`,
        stream: false,
      }),
    });

    const result = await response.json();
    const schemaData = JSON.parse(result.response);

    return {
      id: task.schema.id,
      name: task.schema.name,
      type: 'task',
      version: '1.0.0',
      properties: schemaData.properties || {},
      required: schemaData.required || [],
      transformations: schemaData.transformations,
      linkedSchemas: task.dependencies,
    };
  }

  /**
   * Extract dependencies from tasks
   */
  private extractDependencies(tasks: Task[]): Dependency[] {
    const dependencies: Dependency[] = [];

    for (const task of tasks) {
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          dependencies.push({
            from: depId,
            to: task.id,
            type: 'sequential', // Can be enhanced with analysis
          });
        }
      }
    }

    return dependencies;
  }

  /**
   * Extract required services from tasks
   */
  private extractRequiredServices(tasks: Task[]): string[] {
    const services = new Set<string>();

    for (const task of tasks) {
      switch (task.type) {
        case 'crawl':
          services.add('crawler');
          services.add('puppeteer');
          break;
        case 'analyze':
          services.add('analysis-engine');
          break;
        case 'optimize':
          services.add('seo-optimizer');
          break;
        case 'train':
          services.add('tensorflow');
          services.add('training-service');
          break;
      }
    }

    return Array.from(services);
  }

  /**
   * Generate workflow name from intent
   */
  private generateWorkflowName(intent: string): string {
    return intent
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Save workflow to database
   */
  private async saveWorkflow(workflow: GeneratedWorkflow) {
    await this.db.query(
      `INSERT INTO schema_templates 
       (id, name, description, prompt, tasks, schemas, dependencies, hierarchy, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        workflow.id,
        workflow.name,
        workflow.description,
        workflow.prompt,
        JSON.stringify(workflow.tasks),
        JSON.stringify(workflow.schemas),
        JSON.stringify(workflow.dependencies),
        JSON.stringify(workflow.hierarchy),
        JSON.stringify(workflow.metadata),
      ]
    );
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(id: string): Promise<GeneratedWorkflow | null> {
    const result = await this.db.query(
      'SELECT * FROM schema_templates WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      prompt: row.prompt,
      tasks: JSON.parse(row.tasks),
      schemas: JSON.parse(row.schemas),
      dependencies: JSON.parse(row.dependencies),
      hierarchy: JSON.parse(row.hierarchy),
      metadata: JSON.parse(row.metadata),
    };
  }
}
