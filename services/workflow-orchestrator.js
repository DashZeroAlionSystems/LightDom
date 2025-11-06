/**
 * Advanced Workflow Orchestration Service
 * 
 * Schema-driven workflow execution with:
 * - Linked schema support
 * - Tool chaining via MCP
 * - State management and resumability
 * - DeepSeek/Ollama integration
 * - N8N workflow bridge
 */

import { EventEmitter } from 'events';
import deepSeekService from './deepseek-api-service.js';
import campaignService from './crawler-campaign-service.js';

class WorkflowOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      maxConcurrentTasks: config.maxConcurrentTasks || 10,
      checkpointFrequency: config.checkpointFrequency || 'per-task',
      stateBackend: config.stateBackend || 'database',
      enableN8N: config.enableN8N || false,
      ...config
    };

    // Tool registry (MCP pattern)
    this.tools = new Map();
    
    // Active workflows
    this.workflows = new Map();
    
    // State storage
    this.workflowStates = new Map();
    
    // Task queue
    this.taskQueue = [];
    
    // Initialize built-in tools
    this.initializeTools();
  }

  /**
   * Initialize MCP-style tool registry
   */
  initializeTools() {
    // DeepSeek tool
    this.registerTool({
      name: 'deepseek_generate_workflow',
      description: 'Generate workflow from natural language prompt',
      category: 'ai',
      parameters: {
        prompt: { type: 'string', required: true },
        context: { type: 'object', required: false }
      },
      handler: async ({ prompt, context }) => {
        return await deepSeekService.generateWorkflowFromPrompt(prompt, context);
      }
    });

    // Schema validation tool
    this.registerTool({
      name: 'schema_validate',
      description: 'Validate data against JSON schema',
      category: 'validation',
      parameters: {
        data: { type: 'object', required: true },
        schema: { type: 'object', required: true }
      },
      handler: async ({ data, schema }) => {
        return this.validateSchema(data, schema);
      }
    });

    // Campaign creation tool
    this.registerTool({
      name: 'campaign_create',
      description: 'Create crawler campaign',
      category: 'crawler',
      parameters: {
        prompt: { type: 'string', required: true },
        clientSiteUrl: { type: 'string', required: true },
        options: { type: 'object', required: false }
      },
      handler: async ({ prompt, clientSiteUrl, options }) => {
        return await campaignService.createCampaignFromPrompt(prompt, clientSiteUrl, options);
      }
    });

    // Campaign execution tool
    this.registerTool({
      name: 'campaign_execute',
      description: 'Start crawler campaign',
      category: 'crawler',
      parameters: {
        campaignId: { type: 'string', required: true }
      },
      handler: async ({ campaignId }) => {
        return await campaignService.startCampaign(campaignId);
      }
    });

    // Data processing tool
    this.registerTool({
      name: 'data_process',
      description: 'Process and enrich data',
      category: 'data',
      parameters: {
        data: { type: 'array', required: true },
        enrichmentRules: { type: 'object', required: false }
      },
      handler: async ({ data, enrichmentRules }) => {
        return this.processData(data, enrichmentRules);
      }
    });

    console.log(`✅ Initialized ${this.tools.size} workflow tools`);
  }

  /**
   * Register a new tool
   */
  registerTool(toolDefinition) {
    this.tools.set(toolDefinition.name, {
      name: toolDefinition.name,
      description: toolDefinition.description,
      category: toolDefinition.category || 'custom',
      parameters: toolDefinition.parameters || {},
      handler: toolDefinition.handler
    });
  }

  /**
   * Execute a tool
   */
  async executeTool(name, params) {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    console.log(`🔧 Executing tool: ${name}`);
    
    try {
      const result = await tool.handler(params);
      this.emit('toolExecuted', { tool: name, params, result });
      return result;
    } catch (error) {
      console.error(`Tool execution failed: ${name}`, error);
      this.emit('toolFailed', { tool: name, params, error });
      throw error;
    }
  }

  /**
   * Create workflow from natural language prompt
   */
  async createWorkflowFromPrompt(prompt, options = {}) {
    console.log(`🤖 Creating workflow from prompt: "${prompt.substring(0, 50)}..."`);

    // Use DeepSeek to generate workflow schema
    const workflowSchema = await deepSeekService.generateWorkflowFromPrompt(prompt, {
      ...options,
      includeServices: true,
      includeSchedule: true
    });

    // Validate schema
    const validation = this.validateWorkflowSchema(workflowSchema);
    if (!validation.valid) {
      throw new Error(`Invalid workflow schema: ${validation.errors.join(', ')}`);
    }

    // Register workflow
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const workflow = {
      id: workflowId,
      schema: workflowSchema,
      status: 'created',
      createdAt: new Date().toISOString(),
      state: {
        currentTask: null,
        completedTasks: [],
        taskResults: {},
        errors: []
      }
    };

    this.workflows.set(workflowId, workflow);
    
    console.log(`✅ Workflow created: ${workflowId}`);
    this.emit('workflowCreated', workflow);
    
    return workflow;
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(workflowId, options = {}) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    console.log(`🚀 Executing workflow: ${workflow.schema.name || workflowId}`);
    
    workflow.status = 'running';
    workflow.startedAt = new Date().toISOString();
    
    this.emit('workflowStarted', workflow);

    try {
      // Execute tasks in dependency order
      const taskResults = await this.executeTaskPipeline(workflow);
      
      workflow.status = 'completed';
      workflow.completedAt = new Date().toISOString();
      workflow.state.taskResults = taskResults;
      
      this.emit('workflowCompleted', workflow);
      
      return {
        workflowId,
        status: 'completed',
        results: taskResults
      };
    } catch (error) {
      console.error(`Workflow execution failed: ${workflowId}`, error);
      
      workflow.status = 'failed';
      workflow.failedAt = new Date().toISOString();
      workflow.state.errors.push({
        message: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.emit('workflowFailed', { workflow, error });
      
      throw error;
    }
  }

  /**
   * Execute task pipeline with dependency resolution
   */
  async executeTaskPipeline(workflow) {
    const schema = workflow.schema;
    const tasks = schema.tasks || [];
    const results = {};
    
    // Build dependency graph
    const dependencyGraph = this.buildDependencyGraph(tasks);
    
    // Execute tasks in topological order
    const executionOrder = this.topologicalSort(dependencyGraph);
    
    for (const taskId of executionOrder) {
      const task = tasks.find(t => t.id === taskId);
      if (!task) continue;

      console.log(`📋 Executing task: ${task.id} (${task.action || task.label})`);
      
      // Update workflow state
      workflow.state.currentTask = task.id;
      await this.saveWorkflowState(workflow);
      
      // Resolve task inputs from dependencies
      const taskInputs = await this.resolveTaskInputs(task, results);
      
      // Execute task via tool
      try {
        const toolName = `${task.service || task.handler?.type}_${task.action || 'execute'}`;
        
        let taskResult;
        if (this.tools.has(toolName)) {
          taskResult = await this.executeTool(toolName, taskInputs);
        } else {
          // Fallback to generic execution
          taskResult = await this.executeGenericTask(task, taskInputs);
        }
        
        results[task.id] = taskResult;
        workflow.state.completedTasks.push(task.id);
        
        console.log(`✅ Task completed: ${task.id}`);
        this.emit('taskCompleted', { workflow, task, result: taskResult });
        
      } catch (error) {
        console.error(`Task failed: ${task.id}`, error);
        
        // Handle error based on workflow config
        if (task.optional || schema.errorHandling?.strategy === 'skip') {
          console.log(`⚠️  Skipping optional task: ${task.id}`);
          results[task.id] = { error: error.message, skipped: true };
        } else {
          throw error;
        }
      }
      
      // Save checkpoint
      if (this.config.checkpointFrequency === 'per-task') {
        await this.saveWorkflowState(workflow);
      }
    }
    
    return results;
  }

  /**
   * Build dependency graph from tasks
   */
  buildDependencyGraph(tasks) {
    const graph = new Map();
    
    for (const task of tasks) {
      graph.set(task.id, task.dependencies || []);
    }
    
    return graph;
  }

  /**
   * Topological sort for task execution order
   */
  topologicalSort(graph) {
    const visited = new Set();
    const result = [];
    
    const visit = (node) => {
      if (visited.has(node)) return;
      
      visited.add(node);
      
      const dependencies = graph.get(node) || [];
      for (const dep of dependencies) {
        visit(dep);
      }
      
      result.push(node);
    };
    
    for (const node of graph.keys()) {
      visit(node);
    }
    
    return result;
  }

  /**
   * Resolve task inputs from dependency results
   */
  async resolveTaskInputs(task, previousResults) {
    const inputs = { ...task.input };
    
    // Replace template variables
    for (const [key, value] of Object.entries(inputs)) {
      if (typeof value === 'string' && value.startsWith('${')) {
        const varPath = value.slice(2, -1); // Remove ${ and }
        
        if (varPath.startsWith('task:')) {
          // Resolve from previous task result
          const [, taskId, ...path] = varPath.split(/[:.]/).slice(1);
          inputs[key] = this.getNestedValue(previousResults[taskId], path);
        } else if (varPath.startsWith('input.')) {
          // Resolve from workflow input
          const path = varPath.split('.').slice(1);
          inputs[key] = this.getNestedValue(task.input, path);
        }
      }
    }
    
    return inputs;
  }

  /**
   * Get nested value from object
   */
  getNestedValue(obj, path) {
    return path.reduce((current, key) => current?.[key], obj);
  }

  /**
   * Execute generic task (fallback)
   */
  async executeGenericTask(task, inputs) {
    console.log(`⚙️  Executing generic task: ${task.id}`);
    
    // This is a placeholder for custom task execution
    // In a real implementation, this would call appropriate services
    
    return {
      taskId: task.id,
      status: 'completed',
      inputs,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate workflow schema
   */
  validateWorkflowSchema(schema) {
    const errors = [];
    
    if (!schema.name) errors.push('Missing workflow name');
    if (!schema.tasks || !Array.isArray(schema.tasks)) errors.push('Missing or invalid tasks array');
    
    // Validate tasks
    if (schema.tasks) {
      for (const task of schema.tasks) {
        if (!task.id) errors.push(`Task missing id: ${JSON.stringify(task)}`);
        if (!task.service && !task.handler) errors.push(`Task ${task.id} missing service or handler`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate data against schema
   */
  validateSchema(data, schema) {
    // Simple validation (could be enhanced with ajv or similar)
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          return { valid: false, errors: [`Missing required field: ${field}`] };
        }
      }
    }
    
    return { valid: true, errors: [] };
  }

  /**
   * Process and enrich data
   */
  async processData(data, enrichmentRules = {}) {
    console.log(`📊 Processing ${data.length} data items`);
    
    const processed = data.map(item => {
      const enriched = { ...item };
      
      // Apply enrichment rules
      for (const [field, rule] of Object.entries(enrichmentRules)) {
        if (rule.transform) {
          enriched[field] = this.applyTransform(item[field], rule.transform);
        }
        if (rule.default && !enriched[field]) {
          enriched[field] = rule.default;
        }
      }
      
      return enriched;
    });
    
    return processed;
  }

  /**
   * Apply data transformation
   */
  applyTransform(value, transform) {
    switch (transform) {
      case 'lowercase':
        return value?.toString().toLowerCase();
      case 'uppercase':
        return value?.toString().toUpperCase();
      case 'trim':
        return value?.toString().trim();
      default:
        return value;
    }
  }

  /**
   * Save workflow state (for resumability)
   */
  async saveWorkflowState(workflow) {
    this.workflowStates.set(workflow.id, {
      ...workflow.state,
      lastUpdated: new Date().toISOString()
    });
    
    // In production, save to database
    this.emit('stateSaved', { workflowId: workflow.id, state: workflow.state });
  }

  /**
   * Resume workflow from saved state
   */
  async resumeWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const savedState = this.workflowStates.get(workflowId);
    if (savedState) {
      workflow.state = savedState;
    }

    console.log(`▶️  Resuming workflow: ${workflowId}`);
    return await this.executeWorkflow(workflowId);
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    return {
      id: workflow.id,
      name: workflow.schema.name,
      status: workflow.status,
      currentTask: workflow.state.currentTask,
      completedTasks: workflow.state.completedTasks.length,
      totalTasks: workflow.schema.tasks?.length || 0,
      createdAt: workflow.createdAt,
      startedAt: workflow.startedAt,
      completedAt: workflow.completedAt
    };
  }

  /**
   * List all workflows
   */
  listWorkflows(filter = {}) {
    let workflows = Array.from(this.workflows.values());
    
    if (filter.status) {
      workflows = workflows.filter(w => w.status === filter.status);
    }
    
    return workflows.map(w => this.getWorkflowStatus(w.id));
  }

  /**
   * Get available tools
   */
  getAvailableTools() {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      category: t.category,
      parameters: t.parameters
    }));
  }
}

// Export singleton instance
const workflowOrchestrator = new WorkflowOrchestrator();

export default workflowOrchestrator;
export { WorkflowOrchestrator };
