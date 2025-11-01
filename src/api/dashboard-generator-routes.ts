/**
 * Dashboard Generator API Routes
 * Handles AI-powered dashboard generation, CRUD operations, and analytics
 */

import express, { Request, Response } from 'express';
import { pool } from '../db/connection'; // Adjust path as needed

const router = express.Router();

// Ollama API configuration
const OLLAMA_API_URL = process.env.VITE_OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.VITE_OLLAMA_MODEL || 'deepseek-r1:latest';

/**
 * Generate dashboard from prompt using AI
 * POST /api/dashboards/generate
 */
router.post('/generate', async (req: Request, res: Response) => {
  const { subject, prompt, dashboardType = 'analytics' } = req.body;

  if (!subject || !prompt) {
    return res.status(400).json({
      error: 'Subject and prompt are required',
    });
  }

  const startTime = Date.now();

  try {
    // Construct AI prompt for dashboard generation
    const aiPrompt = `You are an expert dashboard designer. Generate a complete dashboard schema for the following requirements:

Subject: ${subject}
Type: ${dashboardType}
Requirements: ${prompt}

Generate a dashboard with the following structure in JSON format:
{
  "name": "Dashboard Name",
  "description": "Brief description",
  "subject": "${subject}",
  "layoutType": "grid|flex|tabs",
  "layoutConfig": {
    "columns": 4,
    "gap": "md",
    "theme": "material-you"
  },
  "widgets": [
    {
      "type": "stat_card|chart|table|list|calendar|timeline|kanban|form|map",
      "name": "Widget name",
      "title": "Display title",
      "description": "Widget purpose",
      "config": {
        "icon": "icon name",
        "chartType": "line|bar|pie|donut|area|scatter" (if type is chart),
        "format": "number|percentage|currency",
        "threshold": 80 (for alerts),
        "refreshInterval": 30 (seconds),
        "dataSource": {
          "endpoint": "/api/endpoint",
          "method": "GET",
          "params": {}
        }
      },
      "gridPosition": {
        "row": 1,
        "column": 1,
        "rowSpan": 1,
        "columnSpan": 1
      }
    }
  ],
  "reasoning": "Explanation of design decisions"
}

Design an intuitive, data-driven dashboard that follows Material Design 3 principles. Include appropriate widgets for the use case.`;

    // Call Ollama API
    const ollamaResponse = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: aiPrompt,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Ollama API error: ${ollamaResponse.statusText}`);
    }

    const ollamaData = await ollamaResponse.json();
    const generatedText = ollamaData.response || ollamaData.text || '';

    // Extract JSON from response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const dashboard = JSON.parse(jsonMatch[0]);
    const generationTime = Date.now() - startTime;

    // Save generation history
    const historyQuery = `
      INSERT INTO ai_dashboard_generations 
      (prompt, subject, generated_schema, ai_reasoning, ai_model, generation_time_ms)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;

    await pool.query(historyQuery, [
      prompt,
      subject,
      dashboard,
      dashboard.reasoning || '',
      OLLAMA_MODEL,
      generationTime,
    ]);

    res.json({
      success: true,
      dashboard,
      reasoning: dashboard.reasoning,
      generationTime,
    });
  } catch (error: any) {
    console.error('Dashboard generation error:', error);
    res.status(500).json({
      error: 'Failed to generate dashboard',
      details: error.message,
    });
  }
});

/**
 * Create/save a dashboard
 * POST /api/dashboards
 */
router.post('/', async (req: Request, res: Response) => {
  const {
    name,
    description,
    subject,
    prompt,
    layoutType = 'grid',
    layoutConfig = {},
    schema = {},
    widgets = [],
    createdBy,
    isPublished = false,
    tags = [],
  } = req.body;

  if (!name || !subject) {
    return res.status(400).json({
      error: 'Name and subject are required',
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert dashboard
    const dashboardQuery = `
      INSERT INTO generated_dashboards 
      (name, description, subject, prompt, layout_type, layout_config, schema, widgets, created_by, is_published, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const dashboardResult = await client.query(dashboardQuery, [
      name,
      description,
      subject,
      prompt,
      layoutType,
      layoutConfig,
      schema,
      widgets,
      createdBy,
      isPublished,
      tags,
    ]);

    const dashboard = dashboardResult.rows[0];

    // Insert widgets
    if (widgets && widgets.length > 0) {
      const widgetQuery = `
        INSERT INTO dashboard_widgets 
        (dashboard_id, widget_type, name, title, description, grid_row, grid_column, 
         grid_row_span, grid_column_span, order_index, config, data_source, chart_type, chart_config)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `;

      for (let i = 0; i < widgets.length; i++) {
        const widget = widgets[i];
        await client.query(widgetQuery, [
          dashboard.id,
          widget.type,
          widget.name,
          widget.title || widget.name,
          widget.description,
          widget.gridPosition?.row || 0,
          widget.gridPosition?.column || 0,
          widget.gridPosition?.rowSpan || 1,
          widget.gridPosition?.columnSpan || 1,
          i,
          widget.config || {},
          widget.config?.dataSource || {},
          widget.config?.chartType || null,
          widget.config?.chartConfig || {},
        ]);
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      dashboard,
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Dashboard creation error:', error);
    res.status(500).json({
      error: 'Failed to create dashboard',
      details: error.message,
    });
  } finally {
    client.release();
  }
});

/**
 * Get all dashboards
 * GET /api/dashboards
 */
router.get('/', async (req: Request, res: Response) => {
  const {
    page = 1,
    perPage = 20,
    subject,
    isPublished,
    createdBy,
    search,
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = req.query;

  try {
    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (subject) {
      whereConditions.push(`subject = $${paramIndex++}`);
      params.push(subject);
    }

    if (isPublished !== undefined) {
      whereConditions.push(`is_published = $${paramIndex++}`);
      params.push(isPublished === 'true');
    }

    if (createdBy) {
      whereConditions.push(`created_by = $${paramIndex++}`);
      params.push(createdBy);
    }

    if (search) {
      whereConditions.push(
        `to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(subject, '')) @@ plainto_tsquery('english', $${paramIndex++})`
      );
      params.push(search);
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const offset = (Number(page) - 1) * Number(perPage);

    const countQuery = `SELECT COUNT(*) FROM generated_dashboards ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const dataQuery = `
      SELECT * FROM generated_dashboards
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(Number(perPage), offset);
    const dataResult = await pool.query(dataQuery, params);

    res.json({
      success: true,
      dashboards: dataResult.rows,
      pagination: {
        page: Number(page),
        perPage: Number(perPage),
        total,
        totalPages: Math.ceil(total / Number(perPage)),
      },
    });
  } catch (error: any) {
    console.error('Get dashboards error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboards',
      details: error.message,
    });
  }
});

/**
 * Get dashboard by ID with widgets
 * GET /api/dashboards/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const dashboardQuery = 'SELECT * FROM generated_dashboards WHERE id = $1';
    const dashboardResult = await pool.query(dashboardQuery, [id]);

    if (dashboardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const dashboard = dashboardResult.rows[0];

    // Get widgets
    const widgetsQuery = `
      SELECT * FROM dashboard_widgets 
      WHERE dashboard_id = $1 
      ORDER BY order_index ASC
    `;
    const widgetsResult = await pool.query(widgetsQuery, [id]);

    // Update view count
    await pool.query(
      'UPDATE generated_dashboards SET view_count = view_count + 1 WHERE id = $1',
      [id]
    );

    // Track analytics
    await pool.query(
      'INSERT INTO dashboard_analytics (dashboard_id, event_type) VALUES ($1, $2)',
      [id, 'view']
    );

    res.json({
      success: true,
      dashboard: {
        ...dashboard,
        widgets: widgetsResult.rows,
      },
    });
  } catch (error: any) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard',
      details: error.message,
    });
  }
});

/**
 * Update dashboard
 * PUT /api/dashboards/:id
 */
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, layoutConfig, schema, widgets, isPublished } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updateQuery = `
      UPDATE generated_dashboards 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          layout_config = COALESCE($3, layout_config),
          schema = COALESCE($4, schema),
          widgets = COALESCE($5, widgets),
          is_published = COALESCE($6, is_published),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    const result = await client.query(updateQuery, [
      name,
      description,
      layoutConfig,
      schema,
      widgets,
      isPublished,
      id,
    ]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    // Track edit event
    await client.query(
      'INSERT INTO dashboard_analytics (dashboard_id, event_type) VALUES ($1, $2)',
      [id, 'edit']
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      dashboard: result.rows[0],
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Update dashboard error:', error);
    res.status(500).json({
      error: 'Failed to update dashboard',
      details: error.message,
    });
  } finally {
    client.release();
  }
});

/**
 * Delete dashboard
 * DELETE /api/dashboards/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM generated_dashboards WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    res.json({
      success: true,
      message: 'Dashboard deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete dashboard error:', error);
    res.status(500).json({
      error: 'Failed to delete dashboard',
      details: error.message,
    });
  }
});

/**
 * Clone dashboard
 * POST /api/dashboards/:id/clone
 */
router.post('/:id/clone', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, createdBy } = req.body;

  try {
    const result = await pool.query('SELECT clone_dashboard($1, $2, $3)', [
      id,
      name,
      createdBy,
    ]);

    const newDashboardId = result.rows[0].clone_dashboard;

    const dashboardQuery = 'SELECT * FROM generated_dashboards WHERE id = $1';
    const dashboardResult = await pool.query(dashboardQuery, [newDashboardId]);

    res.json({
      success: true,
      dashboard: dashboardResult.rows[0],
    });
  } catch (error: any) {
    console.error('Clone dashboard error:', error);
    res.status(500).json({
      error: 'Failed to clone dashboard',
      details: error.message,
    });
  }
});

/**
 * Get dashboard templates
 * GET /api/dashboards/templates
 */
router.get('/templates/list', async (req: Request, res: Response) => {
  const { category, isOfficial } = req.query;

  try {
    let whereConditions = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (category) {
      whereConditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }

    if (isOfficial !== undefined) {
      whereConditions.push(`is_official = $${paramIndex++}`);
      params.push(isOfficial === 'true');
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT * FROM dashboard_templates
      ${whereClause}
      ORDER BY usage_count DESC, rating DESC NULLS LAST
    `;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      templates: result.rows,
    });
  } catch (error: any) {
    console.error('Get templates error:', error);
    res.status(500).json({
      error: 'Failed to fetch templates',
      details: error.message,
    });
  }
});

/**
 * Get dashboard analytics
 * GET /api/dashboards/:id/analytics
 */
router.get('/:id/analytics', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        event_type,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users,
        MAX(created_at) as last_event
      FROM dashboard_analytics
      WHERE dashboard_id = $1
      GROUP BY event_type
    `;

    const result = await pool.query(query, [id]);

    res.json({
      success: true,
      analytics: result.rows,
    });
  } catch (error: any) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      details: error.message,
    });
  }
});

/**
 * Refresh analytics views
 * POST /api/dashboards/analytics/refresh
 */
router.post('/analytics/refresh', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT refresh_dashboard_analytics()');

    res.json({
      success: true,
      message: 'Analytics refreshed successfully',
    });
  } catch (error: any) {
    console.error('Refresh analytics error:', error);
    res.status(500).json({
      error: 'Failed to refresh analytics',
      details: error.message,
    });
  }
});

export default router;
