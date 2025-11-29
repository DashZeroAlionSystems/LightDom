/**
 * Extended Workflow Monitoring API Routes
 * 
 * Provides endpoints for:
 * - Campaign training monitoring
 * - Client status overview
 * - Workflow state machine management
 * - 3D DOM mining with rich snippets
 * - Component data library
 * - Training data models
 */

import { Router } from 'express';
import { Pool } from 'pg';
import CampaignTrainingMonitor from '../../src/services/ai/CampaignTrainingMonitor';
import WorkflowStateMachine from '../../src/services/ai/WorkflowStateMachine';
import ChromeLayers3DRichSnippetMiner from '../../src/services/ai/ChromeLayers3DRichSnippetMiner';

/**
 * @param {Pool} dbPool
 * @returns {import('express').Router}
 */
export function createExtendedWorkflowRoutes(dbPool) {
  const router = Router();

  // Initialize services
  const trainingMonitor = new CampaignTrainingMonitor(dbPool);
  const miner = new ChromeLayers3DRichSnippetMiner(dbPool);

  // Start monitoring
  trainingMonitor.startMonitoring().catch(console.error);

  // Initialize miner
  miner.initialize().catch(console.error);

  // ==================== Campaign Training Monitoring ====================

  /**
   * GET /api/workflow/monitoring/campaigns
   * Get training status for all campaigns
   */
  router.get('/monitoring/campaigns', async (req, res) => {
    try {
      const statuses = trainingMonitor.getAllCachedStatuses();
      res.json(statuses);
    } catch (error) {
      console.error('Error getting campaign statuses:', error);
      res.status(500).json({ error: 'Failed to get campaign statuses' });
    }
  });

  /**
   * GET /api/workflow/monitoring/campaigns/:id
   * Get training status for a specific campaign
   */
  router.get('/monitoring/campaigns/:id', async (req, res) => {
    try {
      const status = await trainingMonitor.getCampaignStatus(req.params.id);
      res.json(status);
    } catch (error) {
      console.error('Error getting campaign status:', error);
      res.status(500).json({ error: 'Failed to get campaign status' });
    }
  });

  /**
   * GET /api/workflow/monitoring/clients
   * Get all client statuses
   */
  router.get('/monitoring/clients', async (req, res) => {
    try {
      const statuses = await trainingMonitor.getAllClientStatuses();
      res.json(statuses);
    } catch (error) {
      console.error('Error getting client statuses:', error);
      res.status(500).json({ error: 'Failed to get client statuses' });
    }
  });

  /**
   * GET /api/workflow/monitoring/clients/:clientId
   * Get status for a specific client
   */
  router.get('/monitoring/clients/:clientId', async (req, res) => {
    try {
      const status = await trainingMonitor.getClientStatus(req.params.clientId);
      res.json(status);
    } catch (error) {
      console.error('Error getting client status:', error);
      res.status(500).json({ error: 'Failed to get client status' });
    }
  });

  // ==================== Workflow State Machine ====================

  /**
   * POST /api/workflow/state-machine/initialize
   * Initialize state machine for a workflow
   */
  router.post('/state-machine/initialize', async (req, res) => {
    try {
      const { workflowId } = req.body;
      const stateMachine = new WorkflowStateMachine(dbPool);
      await stateMachine.initialize(workflowId);
      
      const states = stateMachine.getStates();
      res.json({ workflowId, states });
    } catch (error) {
      console.error('Error initializing state machine:', error);
      res.status(500).json({ error: 'Failed to initialize state machine' });
    }
  });

  /**
   * POST /api/workflow/state-machine/execute
   * Start workflow execution with state machine
   */
  router.post('/state-machine/execute', async (req, res) => {
    try {
      const { workflowId, context } = req.body;
      const stateMachine = new WorkflowStateMachine(dbPool);
      await stateMachine.initialize(workflowId);
      
      const executionId = await stateMachine.startExecution(workflowId, context || {});
      res.json({ executionId, status: 'started' });
    } catch (error) {
      console.error('Error executing workflow:', error);
      res.status(500).json({ error: 'Failed to execute workflow' });
    }
  });

  /**
   * POST /api/workflow/state-machine/simulate
   * Generate simulation plan using DeepSeek
   */
  router.post('/state-machine/simulate', async (req, res) => {
    try {
      const { workflowId, requirements } = req.body;
      const stateMachine = new WorkflowStateMachine(dbPool);
      
      const plan = await stateMachine.generateSimulationPlan(workflowId, requirements);
      res.json(plan);
    } catch (error) {
      console.error('Error generating simulation:', error);
      res.status(500).json({ error: 'Failed to generate simulation' });
    }
  });

  // ==================== 3D DOM Mining with Rich Snippets ====================

  /**
   * POST /api/workflow/mining/3d-dom
   * Mine URL for 3D DOM structure and rich snippets
   */
  router.post('/mining/3d-dom', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const result = await miner.mineURL(url);
      res.json(result);
    } catch (error) {
      console.error('Error mining URL:', error);
      res.status(500).json({ error: 'Failed to mine URL' });
    }
  });

  /**
   * GET /api/workflow/mining/results
   * Get all mining results
   */
  router.get('/mining/results', async (req, res) => {
    try {
      const { limit = 50, offset = 0 } = req.query;
      
      const result = await dbPool.query(`
        SELECT id, url, seo_score, created_at,
               jsonb_array_length(rich_snippets) as snippet_count
        FROM dom_3d_mining_results
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      res.json(result.rows);
    } catch (error) {
      console.error('Error getting mining results:', error);
      res.status(500).json({ error: 'Failed to get mining results' });
    }
  });

  /**
   * GET /api/workflow/mining/results/:id
   * Get specific mining result
   */
  router.get('/mining/results/:id', async (req, res) => {
    try {
      const result = await dbPool.query(
        'SELECT * FROM dom_3d_mining_results WHERE id = $1',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Mining result not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error getting mining result:', error);
      res.status(500).json({ error: 'Failed to get mining result' });
    }
  });

  // ==================== Component Data Library ====================

  /**
   * GET /api/workflow/components/library
   * Get all reusable component data
   */
  router.get('/components/library', async (req, res) => {
    try {
      const { category, type } = req.query;
      
      let query = 'SELECT * FROM component_data_library WHERE 1=1';
      const params = [];
      
      if (category) {
        params.push(category);
        query += ` AND category = $${params.length}`;
      }
      
      if (type) {
        params.push(type);
        query += ` AND component_type = $${params.length}`;
      }
      
      query += ' ORDER BY usage_count DESC, created_at DESC';
      
      const result = await dbPool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting component library:', error);
      res.status(500).json({ error: 'Failed to get component library' });
    }
  });

  /**
   * POST /api/workflow/components/library
   * Save new component data to library
   */
  router.post('/components/library', async (req, res) => {
    try {
      const {
        name,
        category,
        componentType,
        schema,
        dataTemplate,
        exampleUsage,
        tags,
      } = req.body;

      const id = `comp-${Date.now()}`;

      await dbPool.query(`
        INSERT INTO component_data_library 
        (id, name, category, component_type, schema, data_template, example_usage, tags, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      `, [
        id,
        name,
        category,
        componentType,
        JSON.stringify(schema),
        JSON.stringify(dataTemplate),
        JSON.stringify(exampleUsage || {}),
        JSON.stringify(tags || []),
      ]);

      res.status(201).json({ id, name });
    } catch (error) {
      console.error('Error saving component data:', error);
      res.status(500).json({ error: 'Failed to save component data' });
    }
  });

  // ==================== Workflow Tasks ====================

  /**
   * GET /api/workflow/tasks/:workflowId
   * Get all tasks for a workflow
   */
  router.get('/tasks/:workflowId', async (req, res) => {
    try {
      const result = await dbPool.query(`
        WITH RECURSIVE task_tree AS (
          -- Base case: top-level tasks
          SELECT *, 0 as level
          FROM workflow_tasks
          WHERE workflow_id = $1 AND parent_task_id IS NULL
          
          UNION ALL
          
          -- Recursive case: subtasks
          SELECT t.*, tt.level + 1
          FROM workflow_tasks t
          INNER JOIN task_tree tt ON t.parent_task_id = tt.id
        )
        SELECT * FROM task_tree
        ORDER BY level, created_at
      `, [req.params.workflowId]);

      res.json(result.rows);
    } catch (error) {
      console.error('Error getting workflow tasks:', error);
      res.status(500).json({ error: 'Failed to get workflow tasks' });
    }
  });

  /**
   * POST /api/workflow/tasks
   * Create a new workflow task
   */
  router.post('/tasks', async (req, res) => {
    try {
      const {
        workflowId,
        parentTaskId,
        name,
        description,
        taskType,
        schemaConfig,
        linkedSchemas,
        priority,
        estimatedDuration,
      } = req.body;

      const id = `task-${Date.now()}`;

      await dbPool.query(`
        INSERT INTO workflow_tasks 
        (id, workflow_id, parent_task_id, name, description, task_type, schema_config, linked_schemas, priority, estimated_duration, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      `, [
        id,
        workflowId,
        parentTaskId || null,
        name,
        description,
        taskType,
        JSON.stringify(schemaConfig),
        JSON.stringify(linkedSchemas || []),
        priority || 0,
        estimatedDuration,
      ]);

      res.status(201).json({ id, name });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  // ==================== Training Data Models ====================

  /**
   * GET /api/workflow/training-models
   * Get all training data models
   */
  router.get('/training-models', async (req, res) => {
    try {
      const { isTemplate, modelType } = req.query;
      
      let query = 'SELECT * FROM training_data_models WHERE 1=1';
      const params = [];
      
      if (isTemplate !== undefined) {
        params.push(isTemplate === 'true');
        query += ` AND is_template = $${params.length}`;
      }
      
      if (modelType) {
        params.push(modelType);
        query += ` AND model_type = $${params.length}`;
      }
      
      query += ' ORDER BY usage_count DESC, created_at DESC';
      
      const result = await dbPool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting training models:', error);
      res.status(500).json({ error: 'Failed to get training models' });
    }
  });

  /**
   * GET /api/workflow/schema-links
   * Get all schema linking configurations
   */
  router.get('/schema-links', async (req, res) => {
    try {
      const { active } = req.query;
      
      let query = 'SELECT * FROM schema_linking_configs WHERE 1=1';
      const params = [];
      
      if (active !== undefined) {
        params.push(active === 'true');
        query += ` AND active = $${params.length}`;
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await dbPool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error getting schema links:', error);
      res.status(500).json({ error: 'Failed to get schema links' });
    }
  });

  // ==================== Health & Status ====================

  /**
   * GET /api/workflow/health
   * Health check endpoint
   */
  router.get('/health', async (req, res) => {
    res.json({
      status: 'healthy',
      services: {
        trainingMonitor: 'running',
        miner: 'initialized',
      },
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}

export default createExtendedWorkflowRoutes;
