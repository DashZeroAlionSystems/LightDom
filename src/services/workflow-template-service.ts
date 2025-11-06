/**
 * Workflow Template Service
 * 
 * Loads and instantiates workflow templates
 * Provides template management and customization
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { DeepSeekWorkflowCRUDService } from './deepseek-workflow-crud-service.js';
import { Pool } from 'pg';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  workflow: any;
  tasks: any[];
  inputSchema: Record<string, any>;
}

export interface TemplateInstantiationOptions {
  name?: string;
  description?: string;
  schedule?: Record<string, any>;
  tags?: string[];
  customConfig?: Record<string, any>;
}

export class WorkflowTemplateService {
  private db: Pool;
  private crudService: DeepSeekWorkflowCRUDService;
  private templates: Map<string, WorkflowTemplate>;

  constructor(db: Pool) {
    this.db = db;
    this.crudService = new DeepSeekWorkflowCRUDService(db);
    this.templates = new Map();
  }

  /**
   * Load templates from JSON file
   */
  async loadTemplates(templatePath?: string): Promise<void> {
    const path = templatePath || join(process.cwd(), 'workflows/deepseek-workflow-templates.json');
    
    try {
      const content = await readFile(path, 'utf-8');
      const data = JSON.parse(content);

      if (data.templates && Array.isArray(data.templates)) {
        for (const template of data.templates) {
          this.templates.set(template.id, template);
        }
      }

      console.log(`✓ Loaded ${this.templates.size} workflow templates`);
    } catch (error: any) {
      console.error('Error loading templates:', error.message);
      throw error;
    }
  }

  /**
   * Get all available templates
   */
  listTemplates(category?: string): WorkflowTemplate[] {
    const templates = Array.from(this.templates.values());
    
    if (category) {
      return templates.filter(t => t.category === category);
    }

    return templates;
  }

  /**
   * Get a specific template
   */
  getTemplate(templateId: string): WorkflowTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Instantiate a template to create a new workflow
   */
  async instantiateTemplate(
    templateId: string,
    options: TemplateInstantiationOptions = {}
  ): Promise<string> {
    const template = this.templates.get(templateId);
    
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Create workflow from template
    const workflow = await this.crudService.createWorkflow({
      name: options.name || template.workflow.name,
      description: options.description || template.workflow.description,
      workflow_type: template.workflow.workflow_type,
      configuration: {
        ...template.workflow.configuration,
        ...options.customConfig
      },
      schedule: options.schedule || template.workflow.schedule,
      retry_policy: template.workflow.retry_policy,
      timeout_seconds: template.workflow.timeout_seconds,
      priority: template.workflow.priority,
      tags: options.tags || template.workflow.tags,
      is_template: false,
      parent_template_id: template.workflow.workflow_id,
      status: 'draft'
    });

    // Create tasks from template
    for (const taskTemplate of template.tasks) {
      await this.crudService.createTask({
        workflow_id: workflow.workflow_id,
        name: taskTemplate.name,
        description: taskTemplate.description,
        task_type: taskTemplate.task_type,
        handler_config: taskTemplate.handler_config,
        dependencies: taskTemplate.dependencies || [],
        retry_policy: taskTemplate.retry_policy,
        timeout_seconds: taskTemplate.timeout_seconds,
        ordering: taskTemplate.ordering,
        is_optional: taskTemplate.is_optional || false,
        conditional_logic: taskTemplate.conditional_logic
      });
    }

    console.log(`✓ Instantiated template '${templateId}' as workflow '${workflow.workflow_id}'`);

    return workflow.workflow_id;
  }

  /**
   * Create a custom template from an existing workflow
   */
  async saveWorkflowAsTemplate(
    workflowId: string,
    templateMetadata: {
      id: string;
      name: string;
      description: string;
      category: string;
      inputSchema?: Record<string, any>;
    }
  ): Promise<void> {
    // Get workflow
    const workflow = await this.crudService.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Get tasks
    const tasks = await this.crudService.listTasksForWorkflow(workflowId);

    // Create template
    const template: WorkflowTemplate = {
      id: templateMetadata.id,
      name: templateMetadata.name,
      description: templateMetadata.description,
      category: templateMetadata.category,
      workflow: {
        ...workflow,
        workflow_id: `template_${templateMetadata.id}`
      },
      tasks: tasks,
      inputSchema: templateMetadata.inputSchema || {
        type: 'object',
        properties: {}
      }
    };

    this.templates.set(template.id, template);

    console.log(`✓ Saved workflow '${workflowId}' as template '${template.id}'`);
  }

  /**
   * Validate template input against schema
   */
  validateTemplateInput(templateId: string, input: Record<string, any>): {
    valid: boolean;
    errors: string[];
  } {
    const template = this.templates.get(templateId);
    
    if (!template) {
      return { valid: false, errors: ['Template not found'] };
    }

    const errors: string[] = [];
    const schema = template.inputSchema;

    // Check required fields
    if (schema.required && Array.isArray(schema.required)) {
      for (const field of schema.required) {
        if (!(field in input)) {
          errors.push(`Missing required field: ${field}`);
        }
      }
    }

    // Validate field types
    if (schema.properties) {
      for (const [field, value] of Object.entries(input)) {
        const fieldSchema = schema.properties[field];
        
        if (!fieldSchema) {
          continue; // Allow extra fields
        }

        if (fieldSchema.type === 'array' && !Array.isArray(value)) {
          errors.push(`Field '${field}' must be an array`);
        } else if (fieldSchema.type === 'object' && typeof value !== 'object') {
          errors.push(`Field '${field}' must be an object`);
        } else if (fieldSchema.type === 'string' && typeof value !== 'string') {
          errors.push(`Field '${field}' must be a string`);
        } else if (fieldSchema.type === 'number' && typeof value !== 'number') {
          errors.push(`Field '${field}' must be a number`);
        } else if (fieldSchema.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`Field '${field}' must be a boolean`);
        }

        // Check enum values
        if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
          errors.push(`Field '${field}' must be one of: ${fieldSchema.enum.join(', ')}`);
        }

        // Check min/max for arrays
        if (fieldSchema.type === 'array' && Array.isArray(value)) {
          if (fieldSchema.minItems && value.length < fieldSchema.minItems) {
            errors.push(`Field '${field}' must have at least ${fieldSchema.minItems} items`);
          }
          if (fieldSchema.maxItems && value.length > fieldSchema.maxItems) {
            errors.push(`Field '${field}' must have at most ${fieldSchema.maxItems} items`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get template categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    
    for (const template of this.templates.values()) {
      categories.add(template.category);
    }

    return Array.from(categories).sort();
  }

  /**
   * Search templates
   */
  searchTemplates(query: string): WorkflowTemplate[] {
    const lowerQuery = query.toLowerCase();
    
    return Array.from(this.templates.values()).filter(template => {
      return (
        template.name.toLowerCase().includes(lowerQuery) ||
        template.description.toLowerCase().includes(lowerQuery) ||
        template.category.toLowerCase().includes(lowerQuery) ||
        (template.workflow.tags && template.workflow.tags.some((tag: string) => 
          tag.toLowerCase().includes(lowerQuery)
        ))
      );
    });
  }

  /**
   * Get template usage statistics
   */
  async getTemplateStats(templateId: string): Promise<{
    instantiationCount: number;
    activeWorkflows: number;
    successRate: number;
    avgExecutionTime: number;
  }> {
    const template = this.templates.get(templateId);
    
    if (!template) {
      throw new Error('Template not found');
    }

    // Query workflows created from this template
    const query = `
      SELECT 
        COUNT(*) as instantiation_count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
      FROM orchestrated_workflows
      WHERE parent_template_id = $1
    `;

    const result = await this.db.query(query, [template.workflow.workflow_id]);
    const workflowStats = result.rows[0];

    // Get execution stats
    const execQuery = `
      SELECT 
        COUNT(CASE WHEN status = 'success' THEN 1 END)::float / NULLIF(COUNT(*), 0) as success_rate,
        AVG(execution_time_ms) as avg_execution_time
      FROM orchestrated_workflow_runs r
      JOIN orchestrated_workflows w ON r.workflow_id = w.workflow_id
      WHERE w.parent_template_id = $1
    `;

    const execResult = await this.db.query(execQuery, [template.workflow.workflow_id]);
    const execStats = execResult.rows[0];

    return {
      instantiationCount: parseInt(workflowStats.instantiation_count) || 0,
      activeWorkflows: parseInt(workflowStats.active_count) || 0,
      successRate: parseFloat(execStats.success_rate) || 0,
      avgExecutionTime: parseFloat(execStats.avg_execution_time) || 0
    };
  }
}
