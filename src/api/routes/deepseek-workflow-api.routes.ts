/**
 * DeepSeek Workflow API Routes
 * 
 * RESTful API endpoints for workflow management, execution, and monitoring
 */

import { Router } from 'express';
import { Pool } from 'pg';
import { DeepSeekWorkflowCRUDService } from '../services/deepseek-workflow-crud-service.js';
import { DeepSeekWorkflowOrchestrator } from '../services/deepseek-workflow-orchestrator.js';
import { WorkflowTemplateService } from '../services/workflow-template-service.js';

export function createDeepSeekWorkflowRoutes(
  db: Pool,
  deepseekConfig: { apiUrl: string; apiKey: string; model: string },
  n8nConfig: { apiUrl: string; apiKey?: string; webhookUrl: string }
): Router {
  const router = Router();
  const crudService = new DeepSeekWorkflowCRUDService(db);
  const orchestrator = new DeepSeekWorkflowOrchestrator(db, deepseekConfig, n8nConfig);
  const templateService = new WorkflowTemplateService(db);

  // Load workflow templates
  templateService.loadTemplates().catch(err => {
    console.error('Failed to load templates:', err);
  });

  // Start polling service
  orchestrator.startPollingService(5000);

  // =========================================================================
  // PROMPT TEMPLATE ROUTES
  // =========================================================================

  /**
   * Create a new prompt template
   * POST /api/prompts/templates
   */
  router.post('/prompts/templates', async (req, res) => {
    try {
      const template = await crudService.createPromptTemplate(req.body);
      res.status(201).json({ success: true, data: template });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Get prompt template by ID
   * GET /api/prompts/templates/:id
   */
  router.get('/prompts/templates/:id', async (req, res) => {
    try {
      const template = await crudService.getPromptTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }
      res.json({ success: true, data: template });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * List prompt templates
   * GET /api/prompts/templates
   */
  router.get('/prompts/templates', async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };

      const result = await crudService.listPromptTemplates(filters);
      res.json({ success: true, data: result.templates, total: result.total });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Update prompt template
   * PUT /api/prompts/templates/:id
   */
  router.put('/prompts/templates/:id', async (req, res) => {
    try {
      const template = await crudService.updatePromptTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }
      res.json({ success: true, data: template });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Delete prompt template
   * DELETE /api/prompts/templates/:id
   */
  router.delete('/prompts/templates/:id', async (req, res) => {
    try {
      const deleted = await crudService.deletePromptTemplate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }
      res.json({ success: true, message: 'Template deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // SCHEMA GENERATION ROUTES
  // =========================================================================

  /**
   * Create a new schema
   * POST /api/schemas
   */
  router.post('/schemas', async (req, res) => {
    try {
      const schema = await crudService.createSchema(req.body);
      res.status(201).json({ success: true, data: schema });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Get schema by ID
   * GET /api/schemas/:id
   */
  router.get('/schemas/:id', async (req, res) => {
    try {
      const schema = await crudService.getSchema(req.params.id);
      if (!schema) {
        return res.status(404).json({ success: false, error: 'Schema not found' });
      }
      res.json({ success: true, data: schema });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * List schemas
   * GET /api/schemas
   */
  router.get('/schemas', async (req, res) => {
    try {
      const filters = {
        schema_type: req.query.schema_type as string | undefined,
        is_validated: req.query.is_validated === 'true' ? true : req.query.is_validated === 'false' ? false : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };

      const result = await crudService.listSchemas(filters);
      res.json({ success: true, data: result.schemas, total: result.total });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Link two schemas
   * POST /api/schemas/link
   */
  router.post('/schemas/link', async (req, res) => {
    try {
      const { from_schema_id, to_schema_id, relationship_type, relationship_name } = req.body;
      
      if (!from_schema_id || !to_schema_id || !relationship_type) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      await crudService.linkSchemas(from_schema_id, to_schema_id, relationship_type, relationship_name);
      res.json({ success: true, message: 'Schemas linked successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // WORKFLOW ROUTES
  // =========================================================================

  /**
   * Create a new workflow
   * POST /api/workflows
   */
  router.post('/workflows', async (req, res) => {
    try {
      const workflow = await crudService.createWorkflow(req.body);
      res.status(201).json({ success: true, data: workflow });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Get workflow by ID
   * GET /api/workflows/:id
   */
  router.get('/workflows/:id', async (req, res) => {
    try {
      const workflow = await crudService.getWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      // Also get tasks
      const tasks = await crudService.listTasksForWorkflow(req.params.id);
      
      res.json({ success: true, data: { ...workflow, tasks } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * List workflows
   * GET /api/workflows
   */
  router.get('/workflows', async (req, res) => {
    try {
      const filters = {
        workflow_type: req.query.workflow_type as string | undefined,
        status: req.query.status as string | undefined,
        is_template: req.query.is_template === 'true' ? true : req.query.is_template === 'false' ? false : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };

      const result = await crudService.listWorkflows(filters);
      res.json({ success: true, data: result.workflows, total: result.total });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Update workflow
   * PUT /api/workflows/:id
   */
  router.put('/workflows/:id', async (req, res) => {
    try {
      const workflow = await crudService.updateWorkflow(req.params.id, req.body);
      if (!workflow) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }
      res.json({ success: true, data: workflow });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Delete workflow
   * DELETE /api/workflows/:id
   */
  router.delete('/workflows/:id', async (req, res) => {
    try {
      const deleted = await crudService.deleteWorkflow(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }
      res.json({ success: true, message: 'Workflow deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // TASK ROUTES
  // =========================================================================

  /**
   * Create a new task
   * POST /api/workflows/:workflowId/tasks
   */
  router.post('/workflows/:workflowId/tasks', async (req, res) => {
    try {
      const task = await crudService.createTask({
        ...req.body,
        workflow_id: req.params.workflowId
      });
      res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Get task by ID
   * GET /api/tasks/:id
   */
  router.get('/tasks/:id', async (req, res) => {
    try {
      const task = await crudService.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      res.json({ success: true, data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * List tasks for workflow
   * GET /api/workflows/:workflowId/tasks
   */
  router.get('/workflows/:workflowId/tasks', async (req, res) => {
    try {
      const tasks = await crudService.listTasksForWorkflow(req.params.workflowId);
      res.json({ success: true, data: tasks });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Update task
   * PUT /api/tasks/:id
   */
  router.put('/tasks/:id', async (req, res) => {
    try {
      const task = await crudService.updateTask(req.params.id, req.body);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      res.json({ success: true, data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Delete task
   * DELETE /api/tasks/:id
   */
  router.delete('/tasks/:id', async (req, res) => {
    try {
      const deleted = await crudService.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      res.json({ success: true, message: 'Task deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // WORKFLOW EXECUTION ROUTES
  // =========================================================================

  /**
   * Execute a workflow
   * POST /api/workflows/:id/execute
   */
  router.post('/workflows/:id/execute', async (req, res) => {
    try {
      const { triggerData, executionMode } = req.body;
      
      const run = await orchestrator.executeWorkflow(
        req.params.id,
        triggerData || {},
        executionMode || 'manual'
      );

      res.status(202).json({ 
        success: true, 
        data: run,
        message: 'Workflow execution started'
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Get workflow run status
   * GET /api/workflows/runs/:runId
   */
  router.get('/workflows/runs/:runId', async (req, res) => {
    try {
      const run = await crudService.getWorkflowRun(req.params.runId);
      if (!run) {
        return res.status(404).json({ success: false, error: 'Workflow run not found' });
      }
      res.json({ success: true, data: run });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * List workflow runs
   * GET /api/workflows/:id/runs
   */
  router.get('/workflows/:id/runs', async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };

      const result = await crudService.listWorkflowRuns(req.params.id, filters);
      res.json({ success: true, data: result.runs, total: result.total });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Callback endpoint for long-running tasks
   * POST /api/workflows/callback/:taskId
   */
  router.post('/workflows/callback/:taskId', async (req, res) => {
    try {
      const { status, result, error } = req.body;

      await crudService.updateLongRunningTask(req.params.taskId, {
        status: status || 'completed',
        result_data: result,
        error
      });

      res.json({ success: true, message: 'Callback received' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // MONITORING & METRICS ROUTES
  // =========================================================================

  /**
   * Get workflow metrics
   * GET /api/workflows/:id/metrics
   */
  router.get('/workflows/:id/metrics', async (req, res) => {
    try {
      const startDate = req.query.start_date ? new Date(req.query.start_date as string) : undefined;
      const endDate = req.query.end_date ? new Date(req.query.end_date as string) : undefined;

      const metrics = await crudService.getWorkflowMetrics(req.params.id, startDate, endDate);
      res.json({ success: true, data: metrics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Get system health metrics
   * GET /api/system/health
   */
  router.get('/system/health', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const metrics = await crudService.getSystemHealthMetrics(limit);
      res.json({ success: true, data: metrics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Record system health
   * POST /api/system/health
   */
  router.post('/system/health', async (req, res) => {
    try {
      await crudService.recordSystemHealth(req.body);
      res.json({ success: true, message: 'Health metrics recorded' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // =========================================================================
  // WORKFLOW TEMPLATE ROUTES
  // =========================================================================

  /**
   * List all workflow templates
   * GET /api/templates
   */
  router.get('/templates', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const templates = templateService.listTemplates(category);
      res.json({ success: true, data: templates });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Get a specific template
   * GET /api/templates/:templateId
   */
  router.get('/templates/:templateId', async (req, res) => {
    try {
      const template = templateService.getTemplate(req.params.templateId);
      if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }
      res.json({ success: true, data: template });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Get template categories
   * GET /api/templates/categories
   */
  router.get('/templates/meta/categories', async (req, res) => {
    try {
      const categories = templateService.getCategories();
      res.json({ success: true, data: categories });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Search templates
   * GET /api/templates/search?q=seo
   */
  router.get('/templates/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ success: false, error: 'Query parameter required' });
      }
      const templates = templateService.searchTemplates(query);
      res.json({ success: true, data: templates });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Instantiate a template
   * POST /api/templates/:templateId/instantiate
   */
  router.post('/templates/:templateId/instantiate', async (req, res) => {
    try {
      const { name, description, schedule, tags, customConfig } = req.body;
      
      const workflowId = await templateService.instantiateTemplate(
        req.params.templateId,
        { name, description, schedule, tags, customConfig }
      );

      res.status(201).json({ 
        success: true, 
        data: { workflow_id: workflowId },
        message: 'Template instantiated successfully' 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Validate template input
   * POST /api/templates/:templateId/validate
   */
  router.post('/templates/:templateId/validate', async (req, res) => {
    try {
      const validation = templateService.validateTemplateInput(
        req.params.templateId,
        req.body
      );

      res.json({ success: true, data: validation });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Get template statistics
   * GET /api/templates/:templateId/stats
   */
  router.get('/templates/:templateId/stats', async (req, res) => {
    try {
      const stats = await templateService.getTemplateStats(req.params.templateId);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  /**
   * Save workflow as template
   * POST /api/workflows/:workflowId/save-as-template
   */
  router.post('/workflows/:workflowId/save-as-template', async (req, res) => {
    try {
      const { id, name, description, category, inputSchema } = req.body;
      
      if (!id || !name || !category) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields: id, name, category' 
        });
      }

      await templateService.saveWorkflowAsTemplate(req.params.workflowId, {
        id, name, description, category, inputSchema
      });

      res.json({ success: true, message: 'Workflow saved as template' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
