/**
 * API Routes for Workflow Processes and Task Management
 * 
 * Handles workflow process execution, scheduling, URL seeding, and task management
 */

import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

let pool: Pool;

export function initializeWorkflowProcessRoutes(dbPool: Pool) {
  pool = dbPool;
  return router;
}

// ============================================================================
// Workflow Process Definitions
// ============================================================================

/**
 * GET /api/workflow-processes
 * List all workflow process definitions
 */
router.get('/', async (req, res) => {
  try {
    const { process_type, is_active, tags, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT wpd.*, 
             (SELECT COUNT(*) FROM task_definitions WHERE process_id = wpd.id) AS task_count,
             (SELECT COUNT(*) FROM workflow_process_instances WHERE process_definition_id = wpd.id) AS instance_count
      FROM workflow_process_definitions wpd
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (process_type) {
      query += ` AND process_type = $${paramCount++}`;
      params.push(process_type);
    }

    if (is_active !== undefined) {
      query += ` AND is_active = $${paramCount++}`;
      params.push(is_active === 'true');
    }

    if (tags) {
      query += ` AND tags && $${paramCount++}`;
      params.push(Array.isArray(tags) ? tags : [tags]);
    }

    query += ` ORDER BY name ASC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      processes: result.rows,
      total: result.rowCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    console.error('Error fetching workflow processes:', error);
    res.status(500).json({ error: 'Failed to fetch workflow processes', details: error.message });
  }
});

/**
 * GET /api/workflow-processes/:id
 * Get a specific workflow process with its tasks
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const processResult = await pool.query(
      'SELECT * FROM workflow_process_definitions WHERE id = $1',
      [id]
    );

    if (processResult.rows.length === 0) {
      return res.status(404).json({ error: 'Process not found' });
    }

    const process = processResult.rows[0];

    // Get associated tasks
    const tasksResult = await pool.query(
      `SELECT * FROM task_definitions 
       WHERE process_id = $1 
       ORDER BY execution_order ASC`,
      [id]
    );

    process.tasks = tasksResult.rows;

    res.json(process);
  } catch (error: any) {
    console.error('Error fetching process:', error);
    res.status(500).json({ error: 'Failed to fetch process', details: error.message });
  }
});

/**
 * POST /api/workflow-processes
 * Create a new workflow process definition
 */
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      name,
      process_type,
      description,
      schema,
      input_schema,
      output_schema,
      config_schema,
      default_config,
      handler_service,
      handler_method,
      n8n_workflow_id,
      tasks,
      tags,
    } = req.body;

    if (!name || !process_type) {
      return res.status(400).json({ error: 'Name and process_type are required' });
    }

    // Create process definition
    const processResult = await client.query(
      `INSERT INTO workflow_process_definitions 
       (name, process_type, description, schema, input_schema, output_schema, 
        config_schema, default_config, handler_service, handler_method, n8n_workflow_id, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        name,
        process_type,
        description,
        schema || {},
        input_schema || {},
        output_schema || {},
        config_schema || {},
        default_config || {},
        handler_service,
        handler_method,
        n8n_workflow_id,
        tags || [],
      ]
    );

    const processId = processResult.rows[0].id;

    // Create task definitions if provided
    if (tasks && Array.isArray(tasks)) {
      for (const task of tasks) {
        await client.query(
          `INSERT INTO task_definitions 
           (process_id, name, description, execution_order, schema, input_schema, output_schema, 
            timeout_seconds, retry_count, can_run_parallel, handler_function)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            processId,
            task.name,
            task.description,
            task.execution_order || 0,
            task.schema || {},
            task.input_schema || {},
            task.output_schema || {},
            task.timeout_seconds || 300,
            task.retry_count || 3,
            task.can_run_parallel || false,
            task.handler_function,
          ]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json(processResult.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating process:', error);
    res.status(500).json({ error: 'Failed to create process', details: error.message });
  } finally {
    client.release();
  }
});

// ============================================================================
// Workflow Process Instances (Executions)
// ============================================================================

/**
 * POST /api/workflow-processes/:id/execute
 * Execute a workflow process
 */
router.post('/:id/execute', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { input_data, config, workflow_instance_id, name } = req.body;

    // Get process definition
    const processResult = await client.query(
      'SELECT * FROM workflow_process_definitions WHERE id = $1',
      [id]
    );

    if (processResult.rows.length === 0) {
      return res.status(404).json({ error: 'Process not found' });
    }

    const process = processResult.rows[0];

    // Create process instance
    const instanceResult = await client.query(
      `INSERT INTO workflow_process_instances 
       (process_definition_id, workflow_instance_id, name, status, input_data, config, started_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [
        id,
        workflow_instance_id,
        name || `${process.name} - ${new Date().toISOString()}`,
        'running',
        input_data || {},
        config || process.default_config || {},
      ]
    );

    const instanceId = instanceResult.rows[0].id;

    // Get tasks for this process
    const tasksResult = await client.query(
      'SELECT * FROM task_definitions WHERE process_id = $1 ORDER BY execution_order ASC',
      [id]
    );

    // Create task instances
    for (const task of tasksResult.rows) {
      await client.query(
        `INSERT INTO task_instances 
         (process_instance_id, task_definition_id, name, status, input_data)
         VALUES ($1, $2, $3, $4, $5)`,
        [instanceId, task.id, task.name, 'pending', {}]
      );
    }

    await client.query('COMMIT');

    // TODO: Trigger actual execution (via queue or direct call)
    // For now, return the created instance
    res.status(201).json({
      instance: instanceResult.rows[0],
      message: 'Process execution initiated',
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error executing process:', error);
    res.status(500).json({ error: 'Failed to execute process', details: error.message });
  } finally {
    client.release();
  }
});

/**
 * GET /api/workflow-processes/instances
 * List workflow process instances
 */
router.get('/instances/list', async (req, res) => {
  try {
    const { process_id, status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT wpi.*, wpd.name AS process_name, wpd.process_type
      FROM workflow_process_instances wpi
      JOIN workflow_process_definitions wpd ON wpd.id = wpi.process_definition_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (process_id) {
      query += ` AND wpi.process_definition_id = $${paramCount++}`;
      params.push(process_id);
    }

    if (status) {
      query += ` AND wpi.status = $${paramCount++}`;
      params.push(status);
    }

    query += ` ORDER BY wpi.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      instances: result.rows,
      total: result.rowCount,
    });
  } catch (error: any) {
    console.error('Error fetching instances:', error);
    res.status(500).json({ error: 'Failed to fetch instances', details: error.message });
  }
});

/**
 * GET /api/workflow-processes/instances/:id
 * Get instance details with tasks
 */
router.get('/instances/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const instanceResult = await pool.query(
      `SELECT wpi.*, wpd.name AS process_name, wpd.process_type
       FROM workflow_process_instances wpi
       JOIN workflow_process_definitions wpd ON wpd.id = wpi.process_definition_id
       WHERE wpi.id = $1`,
      [id]
    );

    if (instanceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Instance not found' });
    }

    const instance = instanceResult.rows[0];

    // Get task instances
    const tasksResult = await pool.query(
      `SELECT ti.*, td.description, td.execution_order
       FROM task_instances ti
       JOIN task_definitions td ON td.id = ti.task_definition_id
       WHERE ti.process_instance_id = $1
       ORDER BY td.execution_order ASC`,
      [id]
    );

    instance.tasks = tasksResult.rows;

    res.json(instance);
  } catch (error: any) {
    console.error('Error fetching instance:', error);
    res.status(500).json({ error: 'Failed to fetch instance', details: error.message });
  }
});

// ============================================================================
// URL Seeding
// ============================================================================

/**
 * POST /api/workflow-processes/url-seeds
 * Add URL seeds for workflow
 */
router.post('/url-seeds', async (req, res) => {
  try {
    const { workflow_instance_id, urls } = req.body;

    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertedSeeds = [];

      for (const urlData of urls) {
        const { url, category, priority = 5, max_depth = 3, metadata = {} } = urlData;

        if (!url) continue;

        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        const normalized = urlObj.href;

        const result = await client.query(
          `INSERT INTO url_seeds 
           (workflow_instance_id, url, domain, normalized_url, category, priority, max_depth, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (url, workflow_instance_id) DO UPDATE
           SET priority = EXCLUDED.priority, metadata = EXCLUDED.metadata, updated_at = NOW()
           RETURNING *`,
          [workflow_instance_id, url, domain, normalized, category, priority, max_depth, metadata]
        );

        insertedSeeds.push(result.rows[0]);
      }

      await client.query('COMMIT');

      res.status(201).json({
        seeds: insertedSeeds,
        count: insertedSeeds.length,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error adding URL seeds:', error);
    res.status(500).json({ error: 'Failed to add URL seeds', details: error.message });
  }
});

/**
 * GET /api/workflow-processes/url-seeds
 * List URL seeds
 */
router.get('/url-seeds', async (req, res) => {
  try {
    const { workflow_instance_id, category, is_active, limit = 100, offset = 0 } = req.query;

    let query = 'SELECT * FROM url_seeds WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (workflow_instance_id) {
      query += ` AND workflow_instance_id = $${paramCount++}`;
      params.push(workflow_instance_id);
    }

    if (category) {
      query += ` AND category = $${paramCount++}`;
      params.push(category);
    }

    if (is_active !== undefined) {
      query += ` AND is_active = $${paramCount++}`;
      params.push(is_active === 'true');
    }

    query += ` ORDER BY priority DESC, created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      seeds: result.rows,
      total: result.rowCount,
    });
  } catch (error: any) {
    console.error('Error fetching URL seeds:', error);
    res.status(500).json({ error: 'Failed to fetch URL seeds', details: error.message });
  }
});

// ============================================================================
// Workflow Scheduling
// ============================================================================

/**
 * POST /api/workflow-processes/schedules
 * Create a workflow schedule
 */
router.post('/schedules', async (req, res) => {
  try {
    const {
      name,
      description,
      workflow_instance_id,
      process_definition_id,
      frequency,
      cron_expression,
      start_date,
      end_date,
      max_executions,
      config,
    } = req.body;

    if (!name || !frequency) {
      return res.status(400).json({ error: 'Name and frequency are required' });
    }

    if (frequency === 'custom_cron' && !cron_expression) {
      return res.status(400).json({ error: 'Cron expression required for custom frequency' });
    }

    const result = await pool.query(
      `INSERT INTO workflow_schedules 
       (name, description, workflow_instance_id, process_definition_id, frequency, 
        cron_expression, start_date, end_date, max_executions, config, next_execution_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        name,
        description,
        workflow_instance_id,
        process_definition_id,
        frequency,
        cron_expression,
        start_date || new Date(),
        end_date,
        max_executions,
        config || {},
        start_date || new Date(),
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: 'Failed to create schedule', details: error.message });
  }
});

/**
 * GET /api/workflow-processes/schedules
 * List workflow schedules
 */
router.get('/schedules', async (req, res) => {
  try {
    const { is_active, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT ws.*, 
             wpd.name AS process_name,
             wpd.process_type,
             wi.name AS workflow_name
      FROM workflow_schedules ws
      LEFT JOIN workflow_process_definitions wpd ON wpd.id = ws.process_definition_id
      LEFT JOIN workflow_instances wi ON wi.id = ws.workflow_instance_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (is_active !== undefined) {
      query += ` AND ws.is_active = $${paramCount++}`;
      params.push(is_active === 'true');
    }

    query += ` ORDER BY ws.next_execution_at ASC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      schedules: result.rows,
      total: result.rowCount,
    });
  } catch (error: any) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch schedules', details: error.message });
  }
});

// ============================================================================
// Analytics and Summary
// ============================================================================

/**
 * GET /api/workflow-processes/analytics
 * Get workflow process analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const [processStats, instanceStats, taskStats] = await Promise.all([
      // Process stats by type
      pool.query(`
        SELECT 
          process_type,
          COUNT(*) AS total_processes,
          COUNT(*) FILTER (WHERE is_active = TRUE) AS active_processes
        FROM workflow_process_definitions
        GROUP BY process_type
      `),
      // Instance stats
      pool.query(`
        SELECT 
          status,
          COUNT(*) AS count,
          AVG(execution_time_ms) AS avg_execution_time
        FROM workflow_process_instances
        GROUP BY status
      `),
      // Task stats
      pool.query(`
        SELECT 
          COUNT(*) AS total_tasks,
          COUNT(*) FILTER (WHERE status = 'completed') AS completed_tasks,
          COUNT(*) FILTER (WHERE status = 'failed') AS failed_tasks,
          AVG(execution_time_ms) AS avg_execution_time
        FROM task_instances
      `),
    ]);

    res.json({
      processesByType: processStats.rows,
      instancesByStatus: instanceStats.rows,
      taskSummary: taskStats.rows[0],
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
  }
});

export default router;
