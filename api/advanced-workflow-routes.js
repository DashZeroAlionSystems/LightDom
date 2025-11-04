/**
 * Advanced Workflow Orchestration API Routes
 * 
 * Endpoints for:
 * - Paint timeline profiling and viewing
 * - MCP server tool execution
 * - Prompt-to-schema generation
 * - Google Analytics integration
 * - Enrichment component library
 * - Workflow chaining
 */

import express from 'express';
import { Pool } from 'pg';
import { PaintProfiler } from '../src/services/ai/PaintProfiler';
import { MCPServer } from '../src/services/ai/MCPServer';
import { PromptToSchemaGenerator } from '../src/services/ai/PromptToSchemaGenerator';
import { GoogleAnalyticsIntegration } from '../src/services/ai/GoogleAnalyticsIntegration';

const router = express.Router();
let db: Pool;
let paintProfiler: PaintProfiler;
let mcpServer: MCPServer;
let promptGenerator: PromptToSchemaGenerator;
let gaIntegration: GoogleAnalyticsIntegration;

export function initializeAdvancedWorkflowRoutes(pool: Pool) {
  db = pool;
  paintProfiler = new PaintProfiler(db);
  mcpServer = new MCPServer(db);
  promptGenerator = new PromptToSchemaGenerator(db);
  gaIntegration = new GoogleAnalyticsIntegration(db);

  return router;
}

// ===== Paint Timeline Routes =====

/**
 * Profile a URL and create paint timeline snapshot
 */
router.post('/paint-timeline/profile', async (req, res) => {
  try {
    const { url, config } = req.body;
    const snapshot = await paintProfiler.profileURL(url, config);
    res.json(snapshot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get paint timeline snapshot by ID
 */
router.get('/paint-timeline/snapshots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM paint_timeline_snapshots WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Snapshot not found' });
    }

    const row = result.rows[0];
    const snapshot = {
      id: row.id,
      timestamp: new Date(row.timestamp).getTime(),
      url: row.url,
      events: JSON.parse(row.events),
      layerTree: JSON.parse(row.layer_tree),
      paintedElements: JSON.parse(row.painted_elements),
      unpaintedElements: JSON.parse(row.unpainted_elements),
      metadata: JSON.parse(row.metadata),
    };

    res.json(snapshot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get snapshots for URL
 */
router.get('/paint-timeline/snapshots', async (req, res) => {
  try {
    const { url, limit = 10 } = req.query;
    const snapshots = await paintProfiler.getSnapshots(url as string, Number(limit));
    res.json(snapshots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get paint timeline viewing models
 */
router.get('/paint-timeline/models', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM paint_timeline_models ORDER BY name');
    const models = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      filterType: row.filter_type,
      filterConfig: row.filter_config,
    }));

    res.json(models);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== MCP Server Routes =====

/**
 * Get all registered tools
 */
router.get('/mcp/tools', async (req, res) => {
  try {
    const tools = mcpServer.getTools();
    res.json(tools);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get tools by category
 */
router.get('/mcp/tools/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const tools = mcpServer.getToolsByCategory(category);
    res.json(tools);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Execute a tool
 */
router.post('/mcp/tools/:toolName/execute', async (req, res) => {
  try {
    const { toolName } = req.params;
    const { args, context } = req.body;

    const result = await mcpServer.executeTool(toolName, args, context);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all sub-agents
 */
router.get('/mcp/sub-agents', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM deepseek_sub_agents ORDER BY name');
    const subAgents = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      expertise: row.expertise,
      tools: row.tools,
      apiEndpoint: row.api_endpoint,
      trainedOn: row.trained_on,
    }));

    res.json(subAgents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get tool execution history
 */
router.get('/mcp/executions', async (req, res) => {
  try {
    const { toolName, limit = 50 } = req.query;

    let query = 'SELECT * FROM mcp_tool_executions';
    const params: any[] = [];

    if (toolName) {
      query += ' WHERE tool_name = $1';
      params.push(toolName);
    }

    query += ' ORDER BY timestamp DESC LIMIT $' + (params.length + 1);
    params.push(Number(limit));

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Prompt-to-Schema Routes =====

/**
 * Generate workflow from natural language prompt
 */
router.post('/prompt-to-schema/generate', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    const workflow = await promptGenerator.generateFromPrompt(prompt, context);
    res.json(workflow);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get generated workflow by ID
 */
router.get('/prompt-to-schema/workflows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await promptGenerator.getWorkflow(id);

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    res.json(workflow);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all generated workflows
 */
router.get('/prompt-to-schema/workflows', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const result = await db.query(
      'SELECT * FROM schema_templates ORDER BY created_at DESC LIMIT $1',
      [Number(limit)]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Google Analytics Routes =====

/**
 * Configure GA4 for campaign
 */
router.post('/ga4/configure/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const config = req.body;

    await gaIntegration.configureCampaign(campaignId, config);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Collect metrics for campaign
 */
router.post('/ga4/collect/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const report = await gaIntegration.collectMetrics(campaignId);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get historical data
 */
router.get('/ga4/history/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { days = 30 } = req.query;

    const data = await gaIntegration.getHistoricalData(
      campaignId,
      Number(days)
    );
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Start monitoring campaign
 */
router.post('/ga4/monitor/:campaignId/start', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { intervalMinutes = 15 } = req.body;

    await gaIntegration.startMonitoring(campaignId, intervalMinutes);
    res.json({ success: true, message: 'Monitoring started' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get change detections
 */
router.get('/ga4/changes/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { limit = 50 } = req.query;

    const result = await db.query(
      `SELECT * FROM ga4_change_detections 
       WHERE campaign_id = $1 
       ORDER BY timestamp DESC 
       LIMIT $2`,
      [campaignId, Number(limit)]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Enrichment Component Library Routes =====

/**
 * Get all enrichment components
 */
router.get('/enrichment/components', async (req, res) => {
  try {
    const { category, componentType } = req.query;

    let query = 'SELECT * FROM enrichment_components';
    const params: any[] = [];
    const conditions: string[] = [];

    if (category) {
      conditions.push(`category = $${params.length + 1}`);
      params.push(category);
    }

    if (componentType) {
      conditions.push(`component_type = $${params.length + 1}`);
      params.push(componentType);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY usage_count DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get component by ID
 */
router.get('/enrichment/components/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT * FROM enrichment_components WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Component not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Increment component usage
 */
router.post('/enrichment/components/:id/use', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      'UPDATE enrichment_components SET usage_count = usage_count + 1 WHERE id = $1',
      [id]
    );

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Workflow Chain Routes =====

/**
 * Create workflow chain
 */
router.post('/workflow-chains', async (req, res) => {
  try {
    const { name, description, triggerType, triggerConfig, workflows } = req.body;

    const id = `chain-${Date.now()}`;
    await db.query(
      `INSERT INTO workflow_chains (id, name, description, trigger_type, trigger_config, workflows)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, name, description, triggerType, JSON.stringify(triggerConfig), JSON.stringify(workflows)]
    );

    res.json({ id, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all workflow chains
 */
router.get('/workflow-chains', async (req, res) => {
  try {
    const { status } = req.query;

    let query = 'SELECT * FROM workflow_chains';
    const params: any[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    services: {
      paintProfiler: !!paintProfiler,
      mcpServer: !!mcpServer,
      promptGenerator: !!promptGenerator,
      gaIntegration: !!gaIntegration,
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
