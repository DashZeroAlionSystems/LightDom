/**
 * DeepSeek Workflow Management Routes
 * 
 * API endpoints that enable DeepSeek to manage workflows, analyze errors,
 * and optimize workflow performance
 */

import express from 'express';
import { N8NWorkflowLifecycleManager } from '../services/n8n-workflow-lifecycle-manager.js';
import { getAllEnhancedTemplates, getEnhancedTemplate, createWorkflowFromEnhancedTemplate } from '../services/n8n-enhanced-workflow-templates.js';

const router = express.Router();

/**
 * Initialize routes with database pool and DeepSeek service
 */
export function initializeDeepSeekWorkflowRoutes(pool, deepseekService = null) {
  const lifecycleManager = new N8NWorkflowLifecycleManager(pool, deepseekService);

  // Listen to lifecycle events and log them
  lifecycleManager.on('workflow:created', (data) => {
    console.log(data.message);
  });

  lifecycleManager.on('workflow:error', (data) => {
    console.error(data.message);
  });

  lifecycleManager.on('deepseek:error-analysis', (data) => {
    console.log(data.message);
  });

  // ============================================================================
  // DEEPSEEK WORKFLOW MANAGEMENT
  // ============================================================================

  /**
   * POST /api/deepseek-workflows/create-complete
   * Create a complete workflow with all stages (for DeepSeek)
   */
  router.post('/create-complete', async (req, res) => {
    try {
      const workflow = await lifecycleManager.createCompleteWorkflow(req.body);

      res.json({
        success: true,
        message: `[workflow][deepseek][create] - info - Complete workflow created`,
        workflow: {
          id: workflow.workflow_id,
          name: workflow.name,
          stages: workflow.workflow_definition.meta.stages,
          nodeCount: workflow.workflow_definition.nodes.length
        }
      });
    } catch (error) {
      console.error('[workflow][deepseek][create] - error -', error);
      res.status(500).json({
        success: false,
        message: `[workflow][deepseek][create] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * GET /api/deepseek-workflows/errors
   * Get error log for DeepSeek to review and analyze
   */
  router.get('/errors', (req, res) => {
    try {
      const { severity, workflowId, since, limit = 100 } = req.query;

      const errors = lifecycleManager.getErrorsForDeepSeek({
        severity,
        workflowId,
        since
      }).slice(0, parseInt(limit));

      res.json({
        success: true,
        count: errors.length,
        errors,
        summary: {
          total: errors.length,
          critical: errors.filter(e => e.severity === 'critical').length,
          high: errors.filter(e => e.severity === 'high').length,
          medium: errors.filter(e => e.severity === 'medium').length,
          low: errors.filter(e => e.severity === 'low').length
        },
        message: `[workflow][deepseek][errors] - info - Retrieved ${errors.length} error(s)`
      });
    } catch (error) {
      console.error('[workflow][deepseek][errors] - error -', error);
      res.status(500).json({
        success: false,
        message: `[workflow][deepseek][errors] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * POST /api/deepseek-workflows/:id/analyze-error
   * Request DeepSeek to analyze a specific error
   */
  router.post('/:id/analyze-error', async (req, res) => {
    try {
      const { errorId } = req.body;

      if (!errorId) {
        return res.status(400).json({
          success: false,
          message: '[workflow][deepseek][analyze] - error - errorId is required'
        });
      }

      const errors = lifecycleManager.getErrorsForDeepSeek({ workflowId: req.params.id });
      const error = errors.find(e => e.executionId === errorId);

      if (!error) {
        return res.status(404).json({
          success: false,
          message: '[workflow][deepseek][analyze] - error - Error not found'
        });
      }

      const analysis = await lifecycleManager.notifyDeepSeekAboutError(error);

      res.json({
        success: true,
        message: `[workflow][deepseek][analyze] - info - Error analyzed`,
        error,
        analysis
      });
    } catch (error) {
      console.error('[workflow][deepseek][analyze] - error -', error);
      res.status(500).json({
        success: false,
        message: `[workflow][deepseek][analyze] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * GET /api/deepseek-workflows/:id/stats
   * Get comprehensive workflow statistics for DeepSeek
   */
  router.get('/:id/stats', async (req, res) => {
    try {
      const stats = await lifecycleManager.getWorkflowStatsForDeepSeek(req.params.id);

      res.json({
        success: true,
        message: `[workflow][deepseek][stats] - info - Statistics retrieved`,
        stats
      });
    } catch (error) {
      console.error('[workflow][deepseek][stats] - error -', error);
      res.status(500).json({
        success: false,
        message: `[workflow][deepseek][stats] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * POST /api/deepseek-workflows/:id/enable-management
   * Enable DeepSeek to manage a workflow
   */
  router.post('/:id/enable-management', async (req, res) => {
    try {
      const workflow = await lifecycleManager.enableDeepSeekManagement(req.params.id);

      res.json({
        success: true,
        message: `[workflow][deepseek][management] - info - DeepSeek management enabled`,
        workflow: {
          id: workflow.workflow_id,
          name: workflow.name,
          deepseekManaged: true,
          capabilities: workflow.workflow_definition.meta.deepseekCapabilities
        }
      });
    } catch (error) {
      console.error('[workflow][deepseek][management] - error -', error);
      res.status(500).json({
        success: false,
        message: `[workflow][deepseek][management] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  // ============================================================================
  // ENHANCED TEMPLATES
  // ============================================================================

  /**
   * GET /api/deepseek-workflows/enhanced-templates
   * Get all enhanced workflow templates with complete stages
   */
  router.get('/enhanced-templates', (req, res) => {
    try {
      const templates = getAllEnhancedTemplates();

      res.json({
        success: true,
        count: templates.length,
        message: `[workflow][deepseek][templates] - info - Retrieved ${templates.length} enhanced template(s)`,
        templates: templates.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description,
          category: t.category,
          tags: t.tags,
          stages: t.stages,
          configOptions: t.configOptions,
          requiredServices: t.requiredServices
        }))
      });
    } catch (error) {
      console.error('[workflow][deepseek][templates] - error -', error);
      res.status(500).json({
        success: false,
        message: `[workflow][deepseek][templates] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * GET /api/deepseek-workflows/enhanced-templates/:id
   * Get specific enhanced template
   */
  router.get('/enhanced-templates/:id', (req, res) => {
    try {
      const template = getEnhancedTemplate(req.params.id);

      if (!template) {
        return res.status(404).json({
          success: false,
          message: `[workflow][deepseek][templates] - error - Template not found: ${req.params.id}`
        });
      }

      res.json({
        success: true,
        message: `[workflow][deepseek][templates] - info - Template retrieved`,
        template
      });
    } catch (error) {
      console.error('[workflow][deepseek][templates] - error -', error);
      res.status(500).json({
        success: false,
        message: `[workflow][deepseek][templates] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * POST /api/deepseek-workflows/from-enhanced-template
   * Create workflow from enhanced template
   */
  router.post('/from-enhanced-template', async (req, res) => {
    try {
      const { templateId, config, name, description } = req.body;

      if (!templateId) {
        return res.status(400).json({
          success: false,
          message: '[workflow][deepseek][template-create] - error - templateId is required'
        });
      }

      // Create workflow from template
      const workflowDef = createWorkflowFromEnhancedTemplate(templateId, config);
      
      // Override name/description if provided
      if (name) workflowDef.name = name;
      if (description) workflowDef.description = description;

      // Save to database
      const workflow = await lifecycleManager.workflowDAL.createWorkflow({
        workflow_id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: workflowDef.name,
        description: workflowDef.description || workflowDef.templateName,
        workflow_type: workflowDef.category || 'automation',
        workflow_definition: workflowDef,
        tags: workflowDef.tags || [],
        is_active: false,
        created_by: req.user?.id || 'deepseek'
      });

      console.log(`[workflow][deepseek][template-create] - info - Workflow created from enhanced template ${templateId}`);

      res.json({
        success: true,
        message: `[workflow][deepseek][template-create] - info - Workflow created from enhanced template`,
        workflow: {
          id: workflow.workflow_id,
          name: workflow.name,
          templateId,
          stages: workflowDef.stages,
          nodeCount: workflowDef.nodes.length
        }
      });
    } catch (error) {
      console.error('[workflow][deepseek][template-create] - error -', error);
      res.status(500).json({
        success: false,
        message: `[workflow][deepseek][template-create] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * GET /api/deepseek-workflows/stage-types
   * Get all available workflow stage types for DeepSeek to learn
   */
  router.get('/stage-types', (req, res) => {
    try {
      const stageTypes = N8NWorkflowLifecycleManager.STAGE_TYPES;

      res.json({
        success: true,
        message: '[workflow][deepseek][stages] - info - Stage types retrieved',
        stageTypes,
        categories: Object.keys(stageTypes),
        totalStages: Object.values(stageTypes).reduce((sum, category) => sum + Object.keys(category).length, 0)
      });
    } catch (error) {
      console.error('[workflow][deepseek][stages] - error -', error);
      res.status(500).json({
        success: false,
        message: `[workflow][deepseek][stages] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  /**
   * POST /api/deepseek-workflows/log-error
   * Log an error for DeepSeek to review (called by workflow execution)
   */
  router.post('/log-error', async (req, res) => {
    try {
      const { workflowId, executionId, error, context } = req.body;

      if (!workflowId || !executionId || !error) {
        return res.status(400).json({
          success: false,
          message: '[workflow][deepseek][log-error] - error - workflowId, executionId, and error are required'
        });
      }

      const errorEntry = await lifecycleManager.logError(
        workflowId,
        executionId,
        new Error(error.message || error),
        context
      );

      res.json({
        success: true,
        message: `[workflow][deepseek][log-error] - info - Error logged`,
        errorEntry: {
          timestamp: errorEntry.timestamp,
          severity: errorEntry.severity,
          hasAnalysis: !!errorEntry.deepseekAnalysis
        }
      });
    } catch (error) {
      console.error('[workflow][deepseek][log-error] - error -', error);
      res.status(500).json({
        success: false,
        message: `[workflow][deepseek][log-error] - error - ${error.message}`,
        error: error.message
      });
    }
  });

  return router;
}

export default initializeDeepSeekWorkflowRoutes;
