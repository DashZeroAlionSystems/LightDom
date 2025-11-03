/**
 * Workflow Schema Validator
 * 
 * Validates workflow definitions against JSON Schema
 * Provides type-safe workflow creation and validation
 */

import Ajv from 'ajv';
import { WorkflowSchema, WorkflowTemplates } from '../schemas/workflow-schemas.js';

const ajv = new Ajv({ allErrors: true, strict: false });

// Compile the workflow schema
const validateWorkflow = ajv.compile(WorkflowSchema);

/**
 * Workflow Template Manager
 * Handles loading, validating, and instantiating workflow templates
 */
export class WorkflowTemplateManager {
  constructor() {
    this.templates = new Map();
    this.loadDefaultTemplates();
  }

  /**
   * Load default workflow templates
   */
  loadDefaultTemplates() {
    Object.entries(WorkflowTemplates).forEach(([key, template]) => {
      this.registerTemplate(key, template);
    });
    console.log(`📋 Loaded ${this.templates.size} default workflow templates`);
  }

  /**
   * Register a workflow template
   */
  registerTemplate(id, template) {
    // Validate template against schema
    const isValid = validateWorkflow(template);
    
    if (!isValid) {
      const errors = validateWorkflow.errors;
      throw new Error(`Invalid workflow template "${id}": ${JSON.stringify(errors, null, 2)}`);
    }

    this.templates.set(id, template);
    console.log(`✅ Registered template: ${id}`);
    return template;
  }

  /**
   * Get a workflow template by ID
   */
  getTemplate(id) {
    const template = this.templates.get(id);
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }
    return JSON.parse(JSON.stringify(template)); // Deep copy
  }

  /**
   * List all available templates
   */
  listTemplates() {
    return Array.from(this.templates.entries()).map(([id, template]) => ({
      id,
      name: template.name,
      description: template.description,
      type: template.type,
      version: template.version,
      taskCount: template.tasks.length,
      attributeCount: template.attributes?.length || 0
    }));
  }

  /**
   * Instantiate a workflow from template
   * Creates a new workflow instance with unique IDs
   */
  instantiateFromTemplate(templateId, customization = {}) {
    const template = this.getTemplate(templateId);
    
    const workflowId = customization.id || `workflow-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Merge template with customization
    const workflow = {
      ...template,
      id: workflowId,
      name: customization.name || template.name,
      description: customization.description || template.description,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'draft',
      
      // Generate unique task IDs
      tasks: template.tasks.map((task, index) => ({
        ...task,
        id: `${workflowId}-task-${index}`,
        taskId: `${workflowId}-task-${index}`,
        status: 'pending',
        ordering: index
      })),

      // Generate unique attribute IDs
      attributes: (template.attributes || []).map((attr, index) => ({
        ...attr,
        id: `${workflowId}-attr-${index}`,
        attributeId: `${workflowId}-attr-${index}`
      })),

      // Apply custom configuration
      config: {
        ...template.config,
        ...customization.config
      },

      // Merge metadata
      metadata: {
        ...template.metadata,
        ...customization.metadata,
        instantiatedFrom: templateId,
        instantiatedAt: timestamp
      }
    };

    // Validate the instantiated workflow
    const isValid = validateWorkflow(workflow);
    if (!isValid) {
      throw new Error(`Invalid workflow instance: ${JSON.stringify(validateWorkflow.errors, null, 2)}`);
    }

    return workflow;
  }

  /**
   * Validate a workflow definition
   */
  validate(workflow) {
    const isValid = validateWorkflow(workflow);
    
    return {
      valid: isValid,
      errors: isValid ? null : validateWorkflow.errors
    };
  }

  /**
   * Create a custom workflow from scratch
   */
  createCustomWorkflow(definition) {
    // Ensure required fields
    const workflow = {
      version: '1.0.0',
      type: 'custom',
      config: {
        parallel: false,
        retryOnFailure: true,
        maxRetries: 3,
        timeout: 3600
      },
      ...definition,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };

    // Validate
    const validation = this.validate(workflow);
    if (!validation.valid) {
      throw new Error(`Invalid workflow: ${JSON.stringify(validation.errors, null, 2)}`);
    }

    return workflow;
  }

  /**
   * Convert workflow instance to database format
   */
  toDatabase(workflow) {
    return {
      workflow_id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      type: workflow.type,
      version: workflow.version,
      config: JSON.stringify(workflow.config || {}),
      metadata: JSON.stringify(workflow.metadata || {}),
      status: workflow.status || 'draft',
      
      tasks: workflow.tasks.map(task => ({
        task_id: task.id || task.taskId,
        workflow_id: workflow.id,
        label: task.label,
        description: task.description,
        handler_type: task.handler.type,
        handler_config: JSON.stringify(task.handler.config || {}),
        dependencies: JSON.stringify(task.dependencies || []),
        is_optional: task.optional || false,
        ordering: task.ordering !== undefined ? task.ordering : 0,
        condition: task.condition ? JSON.stringify(task.condition) : null,
        output_mapping: task.output ? JSON.stringify(task.output) : null,
        status: task.status || 'pending'
      })),

      attributes: (workflow.attributes || []).map(attr => ({
        attribute_id: attr.id || attr.attributeId,
        workflow_id: workflow.id,
        label: attr.label,
        type: attr.type,
        enrichment_prompt: attr.enrichmentPrompt,
        drilldown_prompts: JSON.stringify(attr.drilldownPrompts || []),
        validation: attr.validation ? JSON.stringify(attr.validation) : null
      }))
    };
  }

  /**
   * Convert database format to workflow instance
   */
  fromDatabase(dbWorkflow) {
    return {
      id: dbWorkflow.workflow_id,
      name: dbWorkflow.name,
      description: dbWorkflow.description,
      type: dbWorkflow.type,
      version: dbWorkflow.version,
      config: typeof dbWorkflow.config === 'string' ? JSON.parse(dbWorkflow.config) : dbWorkflow.config,
      metadata: typeof dbWorkflow.metadata === 'string' ? JSON.parse(dbWorkflow.metadata) : dbWorkflow.metadata,
      status: dbWorkflow.status,
      createdAt: dbWorkflow.created_at,
      updatedAt: dbWorkflow.updated_at,
      
      tasks: (dbWorkflow.tasks || []).map(task => ({
        id: task.task_id,
        taskId: task.task_id,
        label: task.label,
        description: task.description,
        handler: {
          type: task.handler_type,
          config: typeof task.handler_config === 'string' ? JSON.parse(task.handler_config) : task.handler_config
        },
        dependencies: typeof task.dependencies === 'string' ? JSON.parse(task.dependencies) : task.dependencies,
        optional: task.is_optional,
        ordering: task.ordering,
        condition: task.condition ? (typeof task.condition === 'string' ? JSON.parse(task.condition) : task.condition) : null,
        output: task.output_mapping ? (typeof task.output_mapping === 'string' ? JSON.parse(task.output_mapping) : task.output_mapping) : null,
        status: task.status
      })),

      attributes: (dbWorkflow.attributes || []).map(attr => ({
        id: attr.attribute_id,
        attributeId: attr.attribute_id,
        label: attr.label,
        type: attr.type,
        enrichmentPrompt: attr.enrichment_prompt,
        drilldownPrompts: typeof attr.drilldown_prompts === 'string' ? JSON.parse(attr.drilldown_prompts) : attr.drilldown_prompts,
        validation: attr.validation ? (typeof attr.validation === 'string' ? JSON.parse(attr.validation) : attr.validation) : null
      }))
    };
  }
}

// Singleton instance
export const templateManager = new WorkflowTemplateManager();

export default templateManager;
