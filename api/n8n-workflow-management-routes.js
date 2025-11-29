/**
 * Enhanced N8N Workflow Management API Routes
 * 
 * Comprehensive API for managing n8n workflows with database persistence
 * 
 * Features:
 * - Full CRUD operations with database backing
 * - N8N engine health checking
 * - Workflow execution tracking
 * - Template management
 * - Service status monitoring
 * - DeepSeek integration for workflow generation
 */

import express from 'express';
import axios from 'axios';
import { randomBytes } from 'crypto';
import { N8NWorkflowsDAL } from './data-access/n8n-workflows-dal.js';
import { listTemplates, getTemplate, createWorkflowFromTemplate } from '../services/n8n-workflow-templates.js';

const router = express.Router();

/**
 * Initialize routes with database pool
 * @param {import('pg').Pool} pool - PostgreSQL connection pool
 */
export function initializeN8NWorkflowRoutes(pool) {
  const workflowDAL = new N8NWorkflowsDAL(pool);

  // N8N API client factory
  const createN8NClient = (apiKey) => axios.create({
    baseURL: process.env.N8N_API_URL || 'http://localhost:5678',
    headers: {
      'X-N8N-API-KEY': apiKey || process.env.N8N_API_KEY || '',
      'Content-Type': 'application/json'
    },
    timeout: 60000
  });

  // ============================================================================
  // SERVICE HEALTH & STATUS
  // ============================================================================

  /**
   * GET /api/n8n-workflows/health
   * Check n8n service health
   */
  router.get('/health', async (req, res) => {
    try {
      const client = createN8NClient();
      const response = await client.get('/api/v1/workflows', { params: { limit: 1 } });
      
      const dbMetrics = await workflowDAL.getSystemMetrics();
      
      res.json({
        service: 'n8n',
        status: 'healthy',
        connected: true,
        level: 'info',
        message: '[workflow][n8n][engine] - info - N8N engine is running and accessible',
        baseUrl: process.env.N8N_API_URL || 'http://localhost:5678',
        metrics: {
          workflows_in_db: parseInt(dbMetrics.total_workflows) || 0,
          active_workflows: parseInt(dbMetrics.active_workflows) || 0,
          running_executions: parseInt(dbMetrics.running_executions) || 0,
          executions_24h: parseInt(dbMetrics.executions_last_24h) || 0
        }
      });
    } catch (error) {
      console.error('[workflow][n8n][engine] - error - N8N health check failed:', error.message);
      res.status(503).json({
        service: 'n8n',
        status: 'unhealthy',
        connected: false,
        level: 'error',
        message: `[workflow][n8n][engine] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * GET /api/n8n-workflows/service-status
   * Get comprehensive service status for dashboard display
   */
  router.get('/service-status', async (req, res) => {
    const services = [];
    
    // Check N8N Engine
    try {
      const client = createN8NClient();
      await client.get('/api/v1/workflows', { params: { limit: 1 } });
      services.push({
        name: 'N8N Engine',
        id: 'n8n-engine',
        status: 'running',
        required_for: ['workflow_creation', 'workflow_execution', 'automation'],
        message: '[workflow][n8n][engine] - info - Service is running'
      });
    } catch (error) {
      services.push({
        name: 'N8N Engine',
        id: 'n8n-engine',
        status: 'stopped',
        required_for: ['workflow_creation', 'workflow_execution', 'automation'],
        message: `[workflow][n8n][engine] - error - ${error.message}`
      });
    }

    // Check Database
    try {
      await pool.query('SELECT 1');
      services.push({
        name: 'PostgreSQL Database',
        id: 'postgres',
        status: 'running',
        required_for: ['workflow_storage', 'execution_tracking', 'metrics'],
        message: '[workflow][database][postgres] - info - Database connection is healthy'
      });
    } catch (error) {
      services.push({
        name: 'PostgreSQL Database',
        id: 'postgres',
        status: 'stopped',
        required_for: ['workflow_storage', 'execution_tracking', 'metrics'],
        message: `[workflow][database][postgres] - error - ${error.message}`
      });
    }

    // Check DeepSeek (optional)
    if (process.env.DEEPSEEK_API_KEY) {
      try {
        await axios.get('https://api.deepseek.com/v1/models', {
          headers: { 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` },
          timeout: 5000
        });
        services.push({
          name: 'DeepSeek AI',
          id: 'deepseek',
          status: 'running',
          required_for: ['ai_workflow_generation', 'template_suggestions'],
          message: '[workflow][ai][deepseek] - info - AI service is available'
        });
      } catch (error) {
        services.push({
          name: 'DeepSeek AI',
          id: 'deepseek',
          status: 'stopped',
          required_for: ['ai_workflow_generation', 'template_suggestions'],
          message: `[workflow][ai][deepseek] - warning - ${error.message}`
        });
      }
    }

    res.json({
      services,
      overall_status: services.every(s => s.status === 'running') ? 'healthy' : 'degraded'
    });
  });

  // ============================================================================
  // WORKFLOW CRUD OPERATIONS
  // ============================================================================

  /**
   * GET /api/n8n-workflows/
   * List all workflows from database
   */
  router.get('/', async (req, res) => {
    try {
      const { workflow_type, is_active, limit, offset } = req.query;
      
      const workflows = await workflowDAL.listWorkflows({
        workflow_type,
        is_active: is_active !== undefined ? is_active === 'true' : undefined,
        limit: limit ? parseInt(limit) : 100,
        offset: offset ? parseInt(offset) : 0
      });

      // Get stats for each workflow
      const workflowsWithStats = await Promise.all(
        workflows.map(async (workflow) => {
          const stats = await workflowDAL.getWorkflowStats(workflow.workflow_id);
          return {
            ...workflow,
            stats: {
              total_executions: parseInt(stats.total_executions) || 0,
              successful_executions: parseInt(stats.successful_executions) || 0,
              failed_executions: parseInt(stats.failed_executions) || 0,
              running_executions: parseInt(stats.running_executions) || 0,
              avg_execution_time_ms: parseFloat(stats.avg_execution_time_ms) || 0,
              last_execution_at: stats.last_execution_at
            }
          };
        })
      );

      res.json({
        success: true,
        count: workflows.length,
        workflows: workflowsWithStats
      });
    } catch (error) {
      console.error('[workflow][n8n][list] - error - Failed to list workflows:', error);
      res.status(500).json({
        success: false,
        message: `[workflow][n8n][list] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * GET /api/n8n-workflows/:id
   * Get specific workflow
   */
  router.get('/:id', async (req, res) => {
    try {
      const workflow = await workflowDAL.getWorkflowById(req.params.id);
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: `[workflow][n8n][get] - error - Workflow not found: ${req.params.id}`
        });
      }

      const stats = await workflowDAL.getWorkflowStats(workflow.workflow_id);
      const executions = await workflowDAL.listExecutions(workflow.workflow_id, 10);

      res.json({
        success: true,
        workflow: {
          ...workflow,
          stats: {
            total_executions: parseInt(stats.total_executions) || 0,
            successful_executions: parseInt(stats.successful_executions) || 0,
            failed_executions: parseInt(stats.failed_executions) || 0,
            running_executions: parseInt(stats.running_executions) || 0,
            avg_execution_time_ms: parseFloat(stats.avg_execution_time_ms) || 0,
            last_execution_at: stats.last_execution_at
          },
          recent_executions: executions
        }
      });
    } catch (error) {
      console.error('[workflow][n8n][get] - error - Failed to get workflow:', error);
      res.status(500).json({
        success: false,
        message: `[workflow][n8n][get] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * POST /api/n8n-workflows/
   * Create new workflow
   */
  router.post('/', async (req, res) => {
    try {
      const { name, description, workflow_type, workflow_definition, tags, sync_to_n8n = true } = req.body;

      if (!name || !workflow_definition) {
        return res.status(400).json({
          success: false,
          message: '[workflow][n8n][create] - error - Name and workflow definition are required'
        });
      }

      const workflow_id = `wf_${randomBytes(16).toString('hex')}`;
      
      let n8n_id = null;
      
      // Sync to N8N if requested
      if (sync_to_n8n) {
        try {
          const client = createN8NClient();
          const n8nResponse = await client.post('/api/v1/workflows', workflow_definition);
          n8n_id = n8nResponse.data.data?.id || n8nResponse.data.id;
          console.log(`[workflow][n8n][create] - info - Synced to N8N with ID: ${n8n_id}`);
        } catch (n8nError) {
          console.warn(`[workflow][n8n][create] - warning - Failed to sync to N8N: ${n8nError.message}`);
        }
      }

      // Save to database
      const workflow = await workflowDAL.createWorkflow({
        workflow_id,
        n8n_id,
        name,
        description,
        workflow_type: workflow_type || 'automation',
        workflow_definition,
        tags: tags || [],
        is_active: true,
        created_by: req.user?.id || null
      });

      if (n8n_id) {
        await workflowDAL.markAsSynced(workflow_id, n8n_id);
      }

      console.log(`[workflow][n8n][create] - info - Workflow created: ${workflow_id}`);

      res.json({
        success: true,
        message: `[workflow][n8n][create] - info - Workflow created successfully`,
        workflow
      });
    } catch (error) {
      console.error('[workflow][n8n][create] - error - Failed to create workflow:', error);
      res.status(500).json({
        success: false,
        message: `[workflow][n8n][create] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * PUT /api/n8n-workflows/:id
   * Update workflow
   */
  router.put('/:id', async (req, res) => {
    try {
      const { name, description, workflow_type, workflow_definition, tags, is_active, sync_to_n8n = true } = req.body;

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (workflow_type !== undefined) updates.workflow_type = workflow_type;
      if (workflow_definition !== undefined) updates.workflow_definition = workflow_definition;
      if (tags !== undefined) updates.tags = tags;
      if (is_active !== undefined) updates.is_active = is_active;

      const workflow = await workflowDAL.updateWorkflow(req.params.id, updates);

      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: `[workflow][n8n][update] - error - Workflow not found: ${req.params.id}`
        });
      }

      // Sync to N8N if it has an n8n_id
      if (sync_to_n8n && workflow.n8n_id && workflow_definition) {
        try {
          const client = createN8NClient();
          await client.patch(`/api/v1/workflows/${workflow.n8n_id}`, workflow_definition);
          console.log(`[workflow][n8n][update] - info - Synced to N8N: ${workflow.n8n_id}`);
        } catch (n8nError) {
          console.warn(`[workflow][n8n][update] - warning - Failed to sync to N8N: ${n8nError.message}`);
        }
      }

      console.log(`[workflow][n8n][update] - info - Workflow updated: ${req.params.id}`);

      res.json({
        success: true,
        message: `[workflow][n8n][update] - info - Workflow updated successfully`,
        workflow
      });
    } catch (error) {
      console.error('[workflow][n8n][update] - error - Failed to update workflow:', error);
      res.status(500).json({
        success: false,
        message: `[workflow][n8n][update] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/n8n-workflows/:id
   * Delete workflow
   */
  router.delete('/:id', async (req, res) => {
    try {
      const workflow = await workflowDAL.getWorkflowById(req.params.id);
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: `[workflow][n8n][delete] - error - Workflow not found: ${req.params.id}`
        });
      }

      // Delete from N8N if synced
      if (workflow.n8n_id) {
        try {
          const client = createN8NClient();
          await client.delete(`/api/v1/workflows/${workflow.n8n_id}`);
          console.log(`[workflow][n8n][delete] - info - Deleted from N8N: ${workflow.n8n_id}`);
        } catch (n8nError) {
          console.warn(`[workflow][n8n][delete] - warning - Failed to delete from N8N: ${n8nError.message}`);
        }
      }

      // Delete from database
      await workflowDAL.deleteWorkflow(req.params.id);

      console.log(`[workflow][n8n][delete] - info - Workflow deleted: ${req.params.id}`);

      res.json({
        success: true,
        message: `[workflow][n8n][delete] - info - Workflow deleted successfully`
      });
    } catch (error) {
      console.error('[workflow][n8n][delete] - error - Failed to delete workflow:', error);
      res.status(500).json({
        success: false,
        message: `[workflow][n8n][delete] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  // ============================================================================
  // WORKFLOW EXECUTION
  // ============================================================================

  /**
   * POST /api/n8n-workflows/:id/execute
   * Execute workflow
   */
  router.post('/:id/execute', async (req, res) => {
    try {
      const workflow = await workflowDAL.getWorkflowById(req.params.id);
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: `[workflow][n8n][execute] - error - Workflow not found: ${req.params.id}`
        });
      }

      if (!workflow.n8n_id) {
        return res.status(400).json({
          success: false,
          message: '[workflow][n8n][execute] - error - Workflow is not synced with N8N'
        });
      }

      const execution_id = `exec_${randomBytes(16).toString('hex')}`;
      const executionData = req.body.data || {};

      // Record execution start in database
      await workflowDAL.recordExecution({
        execution_id,
        workflow_id: workflow.workflow_id,
        status: 'running',
        mode: 'manual',
        data: { input: executionData }
      });

      // Execute in N8N
      try {
        const client = createN8NClient();
        const n8nResponse = await client.post(`/api/v1/workflows/${workflow.n8n_id}/execute`, {
          data: executionData
        });

        const n8nExecution = n8nResponse.data.data || n8nResponse.data;
        
        // Update execution with N8N ID
        await workflowDAL.updateExecutionStatus(
          execution_id,
          'success',
          { input: executionData, output: n8nExecution },
          null
        );

        console.log(`[workflow][n8n][execute] - info - Workflow executed: ${workflow.workflow_id}`);

        res.json({
          success: true,
          message: `[workflow][n8n][execute] - info - Workflow executed successfully`,
          execution: {
            execution_id,
            workflow_id: workflow.workflow_id,
            n8n_execution: n8nExecution
          }
        });
      } catch (n8nError) {
        // Update execution as failed
        await workflowDAL.updateExecutionStatus(
          execution_id,
          'failed',
          { input: executionData },
          n8nError.message
        );

        throw n8nError;
      }
    } catch (error) {
      console.error('[workflow][n8n][execute] - error - Failed to execute workflow:', error);
      res.status(500).json({
        success: false,
        message: `[workflow][n8n][execute] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * POST /api/n8n-workflows/:id/start
   * Activate workflow
   */
  router.post('/:id/start', async (req, res) => {
    try {
      const workflow = await workflowDAL.updateWorkflow(req.params.id, { is_active: true });
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: `[workflow][n8n][start] - error - Workflow not found: ${req.params.id}`
        });
      }

      if (workflow.n8n_id) {
        try {
          const client = createN8NClient();
          await client.patch(`/api/v1/workflows/${workflow.n8n_id}`, { active: true });
          console.log(`[workflow][n8n][start] - info - Workflow activated in N8N: ${workflow.n8n_id}`);
        } catch (n8nError) {
          console.warn(`[workflow][n8n][start] - warning - Failed to activate in N8N: ${n8nError.message}`);
        }
      }

      res.json({
        success: true,
        message: `[workflow][n8n][start] - info - Workflow started successfully`,
        workflow
      });
    } catch (error) {
      console.error('[workflow][n8n][start] - error - Failed to start workflow:', error);
      res.status(500).json({
        success: false,
        message: `[workflow][n8n][start] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * POST /api/n8n-workflows/:id/stop
   * Deactivate workflow
   */
  router.post('/:id/stop', async (req, res) => {
    try {
      const workflow = await workflowDAL.updateWorkflow(req.params.id, { is_active: false });
      
      if (!workflow) {
        return res.status(404).json({
          success: false,
          message: `[workflow][n8n][stop] - error - Workflow not found: ${req.params.id}`
        });
      }

      if (workflow.n8n_id) {
        try {
          const client = createN8NClient();
          await client.patch(`/api/v1/workflows/${workflow.n8n_id}`, { active: false });
          console.log(`[workflow][n8n][stop] - info - Workflow deactivated in N8N: ${workflow.n8n_id}`);
        } catch (n8nError) {
          console.warn(`[workflow][n8n][stop] - warning - Failed to deactivate in N8N: ${n8nError.message}`);
        }
      }

      res.json({
        success: true,
        message: `[workflow][n8n][stop] - info - Workflow stopped successfully`,
        workflow
      });
    } catch (error) {
      console.error('[workflow][n8n][stop] - error - Failed to stop workflow:', error);
      res.status(500).json({
        success: false,
        message: `[workflow][n8n][stop] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * GET /api/n8n-workflows/:id/executions
   * Get workflow execution history
   */
  router.get('/:id/executions', async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const executions = await workflowDAL.listExecutions(req.params.id, parseInt(limit));

      res.json({
        success: true,
        count: executions.length,
        executions
      });
    } catch (error) {
      console.error('[workflow][n8n][executions] - error - Failed to get executions:', error);
      res.status(500).json({
        success: false,
        message: `[workflow][n8n][executions] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * GET /api/n8n-workflows/metrics/system
   * Get system-wide metrics
   */
  router.get('/metrics/system', async (req, res) => {
    try {
      const metrics = await workflowDAL.getSystemMetrics();

      res.json({
        success: true,
        metrics: {
          total_workflows: parseInt(metrics.total_workflows) || 0,
          active_workflows: parseInt(metrics.active_workflows) || 0,
          workflow_types: parseInt(metrics.workflow_types) || 0,
          running_executions: parseInt(metrics.running_executions) || 0,
          executions_last_24h: parseInt(metrics.executions_last_24h) || 0
        }
      });
    } catch (error) {
      console.error('[workflow][n8n][metrics] - error - Failed to get metrics:', error);
      res.status(500).json({
        success: false,
        message: `[workflow][n8n][metrics] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  // ============================================================================
  // WORKFLOW TEMPLATES
  // ============================================================================

  /**
   * GET /api/n8n-workflows/templates
   * List available workflow templates
   */
  router.get('/templates', (req, res) => {
    try {
      const { category } = req.query;
      const templates = listTemplates(category);

      // Format templates for response
      const formattedTemplates = templates.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        requiredServices: template.requiredServices,
        configOptions: template.configOptions
      }));

      res.json({
        success: true,
        count: formattedTemplates.length,
        templates: formattedTemplates
      });
    } catch (error) {
      console.error('[workflow][n8n][templates] - error - Failed to list templates:', error);
      res.status(500).json({
        success: false,
        message: `[workflow][n8n][templates] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * GET /api/n8n-workflows/templates/:id
   * Get specific template details
   */
  router.get('/templates/:id', (req, res) => {
    try {
      const template = getTemplate(req.params.id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: `[workflow][n8n][templates] - error - Template not found: ${req.params.id}`
        });
      }

      res.json({
        success: true,
        template: {
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          tags: template.tags,
          requiredServices: template.requiredServices,
          configOptions: template.configOptions
        }
      });
    } catch (error) {
      console.error('[workflow][n8n][templates] - error - Failed to get template:', error);
      res.status(500).json({
        success: false,
        message: `[workflow][n8n][templates] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * POST /api/n8n-workflows/from-template
   * Create workflow from template
   */
  router.post('/from-template', async (req, res) => {
    try {
      const { templateId, config, name, description, sync_to_n8n = true } = req.body;

      if (!templateId) {
        return res.status(400).json({
          success: false,
          message: '[workflow][n8n][from-template] - error - Template ID is required'
        });
      }

      // Create workflow from template
      const workflowDef = createWorkflowFromTemplate(templateId, config);
      
      // Override name/description if provided
      if (name) workflowDef.name = name;
      if (description) workflowDef.description = description;

      const workflow_id = `wf_${randomBytes(16).toString('hex')}`;
      
      let n8n_id = null;
      
      // Sync to N8N if requested
      if (sync_to_n8n) {
        try {
          const client = createN8NClient();
          const n8nResponse = await client.post('/api/v1/workflows', workflowDef);
          n8n_id = n8nResponse.data.data?.id || n8nResponse.data.id;
          console.log(`[workflow][n8n][from-template] - info - Synced to N8N with ID: ${n8n_id}`);
        } catch (n8nError) {
          console.warn(`[workflow][n8n][from-template] - warning - Failed to sync to N8N: ${n8nError.message}`);
        }
      }

      // Save to database
      const workflow = await workflowDAL.createWorkflow({
        workflow_id,
        n8n_id,
        name: workflowDef.name,
        description: workflowDef.description || workflowDef.templateName,
        workflow_type: workflowDef.category || 'automation',
        workflow_definition: workflowDef,
        tags: workflowDef.tags || [],
        is_active: true,
        created_by: req.user?.id || null
      });

      if (n8n_id) {
        await workflowDAL.markAsSynced(workflow_id, n8n_id);
      }

      console.log(`[workflow][n8n][from-template] - info - Workflow created from template ${templateId}: ${workflow_id}`);

      res.json({
        success: true,
        message: `[workflow][n8n][from-template] - info - Workflow created from template successfully`,
        workflow,
        template: {
          id: templateId,
          name: workflowDef.templateName
        }
      });
    } catch (error) {
      console.error('[workflow][n8n][from-template] - error - Failed to create workflow from template:', error);
      res.status(500).json({
        success: false,
        message: `[workflow][n8n][from-template] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  return router;
}

export default initializeN8NWorkflowRoutes;
