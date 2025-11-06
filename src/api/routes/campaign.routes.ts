/**
 * Campaign Management API Routes
 * 
 * RESTful API endpoints for managing SEO campaigns with DeepSeek integration.
 */

import express from 'express';
import { Pool } from 'pg';
import { ollamaService } from '../../services/ollama-service';

const router = express.Router();

// Database connection
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lightdom',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

/**
 * GET /api/campaigns
 * List all campaigns
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        c.*,
        COUNT(DISTINCT w.id) as workflows,
        COUNT(DISTINCT i.id) as insights,
        COUNT(DISTINCT a.id) as anomalies,
        COALESCE(SUM(dm.records_count), 0) as data_mined
      FROM campaigns c
      LEFT JOIN workflows w ON w.campaign_id = c.id
      LEFT JOIN insights i ON i.campaign_id = c.id
      LEFT JOIN anomalies a ON a.campaign_id = c.id AND a.resolved = false
      LEFT JOIN data_mining_stats dm ON dm.campaign_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    const campaigns = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      progress: row.progress || 0,
      dataMined: parseInt(row.data_mined) || 0,
      workflows: parseInt(row.workflows) || 0,
      insights: parseInt(row.insights) || 0,
      anomalies: parseInt(row.anomalies) || 0,
      createdAt: row.created_at,
      lastActivity: row.last_activity,
    }));

    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

/**
 * GET /api/campaigns/stats
 * Get aggregate statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        COALESCE(SUM(records_count), 0) as total_records,
        COALESCE(SUM(CASE WHEN DATE(created_at) = CURRENT_DATE THEN records_count ELSE 0 END), 0) as today_records,
        COALESCE(AVG(quality_score), 0) as avg_quality,
        COUNT(DISTINCT a.id) as anomalies_detected
      FROM data_mining_stats dm
      LEFT JOIN anomalies a ON a.created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);

    const stats = {
      totalRecords: parseInt(result.rows[0].total_records) || 0,
      todayRecords: parseInt(result.rows[0].today_records) || 0,
      avgQuality: Math.round(parseFloat(result.rows[0].avg_quality) || 0),
      anomaliesDetected: parseInt(result.rows[0].anomalies_detected) || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * POST /api/campaigns
 * Create a new campaign
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, config } = req.body;

    const result = await db.query(
      `INSERT INTO campaigns (name, description, status, config, created_at, last_activity)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [name, description || '', 'active', JSON.stringify(config || {})]
    );

    const campaign = result.rows[0];

    res.status(201).json({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      createdAt: campaign.created_at,
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

/**
 * GET /api/campaigns/:id
 * Get campaign details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT c.*, 
              COUNT(DISTINCT w.id) as workflows,
              COUNT(DISTINCT i.id) as insights,
              COALESCE(SUM(dm.records_count), 0) as data_mined
       FROM campaigns c
       LEFT JOIN workflows w ON w.campaign_id = c.id
       LEFT JOIN insights i ON i.campaign_id = c.id
       LEFT JOIN data_mining_stats dm ON dm.campaign_id = c.id
       WHERE c.id = $1
       GROUP BY c.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = result.rows[0];
    res.json({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      progress: campaign.progress || 0,
      dataMined: parseInt(campaign.data_mined) || 0,
      workflows: parseInt(campaign.workflows) || 0,
      insights: parseInt(campaign.insights) || 0,
      config: campaign.config,
      createdAt: campaign.created_at,
      lastActivity: campaign.last_activity,
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

/**
 * POST /api/campaigns/:id/pause
 * Pause a campaign
 */
router.post('/:id/pause', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `UPDATE campaigns SET status = $1, last_activity = NOW() WHERE id = $2`,
      ['paused', id]
    );

    res.json({ success: true, message: 'Campaign paused' });
  } catch (error) {
    console.error('Error pausing campaign:', error);
    res.status(500).json({ error: 'Failed to pause campaign' });
  }
});

/**
 * POST /api/campaigns/:id/resume
 * Resume a paused campaign
 */
router.post('/:id/resume', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `UPDATE campaigns SET status = $1, last_activity = NOW() WHERE id = $2`,
      ['active', id]
    );

    res.json({ success: true, message: 'Campaign resumed' });
  } catch (error) {
    console.error('Error resuming campaign:', error);
    res.status(500).json({ error: 'Failed to resume campaign' });
  }
});

/**
 * DELETE /api/campaigns/:id
 * Delete a campaign
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM campaigns WHERE id = $1', [id]);

    res.json({ success: true, message: 'Campaign deleted' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

/**
 * POST /api/deepseek/generate-workflow
 * Generate workflow configuration using DeepSeek
 */
router.post('/deepseek/generate-workflow', async (req, res) => {
  try {
    const { prompt, selectedParts } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Generate workflow using Ollama service
    const workflowConfig = await ollamaService.generateWorkflowConfig(
      prompt,
      selectedParts || []
    );

    res.json(workflowConfig);
  } catch (error) {
    console.error('Error generating workflow:', error);
    res.status(500).json({ error: 'Failed to generate workflow' });
  }
});

/**
 * POST /api/workflows
 * Save a workflow
 */
router.post('/workflows', async (req, res) => {
  try {
    const { name, description, nodes, edges, campaignId } = req.body;

    const result = await db.query(
      `INSERT INTO workflows (name, description, config, campaign_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [
        name,
        description || '',
        JSON.stringify({ nodes, edges }),
        campaignId || null,
      ]
    );

    const workflow = result.rows[0];
    res.status(201).json({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      createdAt: workflow.created_at,
    });
  } catch (error) {
    console.error('Error saving workflow:', error);
    res.status(500).json({ error: 'Failed to save workflow' });
  }
});

/**
 * POST /api/workflows/execute
 * Execute a workflow
 */
router.post('/workflows/execute', async (req, res) => {
  try {
    const { nodes, edges, name } = req.body;

    // Create execution record
    const result = await db.query(
      `INSERT INTO workflow_executions (workflow_name, config, status, started_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [name, JSON.stringify({ nodes, edges }), 'running']
    );

    const execution = result.rows[0];

    // Trigger workflow execution asynchronously
    executeWorkflowAsync(execution.id, nodes, edges).catch(err =>
      console.error('Workflow execution error:', err)
    );

    res.status(202).json({
      executionId: execution.id,
      status: 'running',
      message: 'Workflow execution started',
    });
  } catch (error) {
    console.error('Error executing workflow:', error);
    res.status(500).json({ error: 'Failed to execute workflow' });
  }
});

/**
 * Execute workflow asynchronously
 */
async function executeWorkflowAsync(executionId: string, nodes: any[], edges: any[]) {
  try {
    // Execute nodes in order based on edges
    for (const node of nodes) {
      console.log(`Executing node: ${node.id} (${node.type})`);
      
      // Simulate node execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update progress
      await db.query(
        `UPDATE workflow_executions 
         SET progress = $1, last_activity = NOW() 
         WHERE id = $2`,
        [((nodes.indexOf(node) + 1) / nodes.length) * 100, executionId]
      );
    }

    // Mark as completed
    await db.query(
      `UPDATE workflow_executions 
       SET status = $1, completed_at = NOW() 
       WHERE id = $2`,
      ['completed', executionId]
    );

    console.log(`Workflow execution ${executionId} completed`);
  } catch (error) {
    console.error(`Workflow execution ${executionId} failed:`, error);
    
    await db.query(
      `UPDATE workflow_executions 
       SET status = $1, error = $2, completed_at = NOW() 
       WHERE id = $3`,
      ['failed', error instanceof Error ? error.message : 'Unknown error', executionId]
    );
  }
}

export default router;
