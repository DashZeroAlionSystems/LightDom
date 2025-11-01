/**
 * API Routes for Design System Component Schema Management
 * 
 * Handles CRUD operations for atoms, components, dashboards, and AI-generated schemas.
 * Includes training data collection for improving component generation.
 */

import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

// Database pool (assumes it's passed in or available globally)
let pool: Pool;

export function initializeComponentSchemaRoutes(dbPool: Pool) {
  pool = dbPool;
  return router;
}

// ============================================================================
// Atom Definitions
// ============================================================================

/**
 * GET /api/components/atoms
 * List all atom definitions with optional filtering
 */
router.get('/atoms', async (req, res) => {
  try {
    const { category, tags, search, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT id, name, category, description, schema, design_tokens, 
             props, a11y_metadata, usage_count, version, tags, 
             created_at, updated_at
      FROM atom_definitions
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount++}`;
      params.push(category);
    }

    if (tags) {
      query += ` AND tags && $${paramCount++}`;
      params.push(Array.isArray(tags) ? tags : [tags]);
    }

    if (search) {
      query += ` AND to_tsvector('english', name || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', $${paramCount++})`;
      params.push(search);
    }

    query += ` ORDER BY usage_count DESC, name ASC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      atoms: result.rows,
      total: result.rowCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    console.error('Error fetching atoms:', error);
    res.status(500).json({ error: 'Failed to fetch atoms', details: error.message });
  }
});

/**
 * POST /api/components/atoms
 * Create a new atom definition
 */
router.post('/atoms', async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      schema,
      design_tokens,
      template,
      styles,
      props,
      a11y_metadata,
      tags,
      metadata,
      created_by,
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const result = await pool.query(
      `INSERT INTO atom_definitions 
       (name, category, description, schema, design_tokens, template, styles, props, a11y_metadata, tags, metadata, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        name,
        category,
        description || null,
        schema || {},
        design_tokens || {},
        template || null,
        styles || {},
        props || [],
        a11y_metadata || {},
        tags || [],
        metadata || {},
        created_by || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating atom:', error);
    res.status(500).json({ error: 'Failed to create atom', details: error.message });
  }
});

// ============================================================================
// Component Definitions
// ============================================================================

/**
 * GET /api/components/schema
 * List all component schemas with optional filtering
 */
router.get('/schema', async (req, res) => {
  try {
    const { type, category, tags, search, published_only, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT id, name, type, variant, description, schema, metadata, 
             props_schema, category, usage_count, version, tags, 
             is_published, created_at, updated_at
      FROM component_definitions
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (type) {
      query += ` AND type = $${paramCount++}`;
      params.push(type);
    }

    if (category) {
      query += ` AND category = $${paramCount++}`;
      params.push(category);
    }

    if (tags) {
      query += ` AND tags && $${paramCount++}`;
      params.push(Array.isArray(tags) ? tags : [tags]);
    }

    if (published_only === 'true') {
      query += ` AND is_published = true`;
    }

    if (search) {
      query += ` AND to_tsvector('english', name || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', $${paramCount++})`;
      params.push(search);
    }

    query += ` ORDER BY usage_count DESC, name ASC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      components: result.rows,
      total: result.rowCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    console.error('Error fetching components:', error);
    res.status(500).json({ error: 'Failed to fetch components', details: error.message });
  }
});

/**
 * GET /api/components/schema/:id
 * Get a specific component schema with its atoms
 */
router.get('/schema/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const componentResult = await pool.query(
      `SELECT * FROM component_definitions WHERE id = $1`,
      [id]
    );

    if (componentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Component not found' });
    }

    const component = componentResult.rows[0];

    // Get associated atoms
    const atomsResult = await pool.query(
      `SELECT a.*, ca.role, ca.binding, ca.slot, ca.position
       FROM atom_definitions a
       JOIN component_atoms ca ON ca.atom_id = a.id
       WHERE ca.component_id = $1
       ORDER BY ca.position`,
      [id]
    );

    component.atoms = atomsResult.rows;

    res.json(component);
  } catch (error: any) {
    console.error('Error fetching component:', error);
    res.status(500).json({ error: 'Failed to fetch component', details: error.message });
  }
});

/**
 * POST /api/components/schema
 * Create a new component schema (from AI generation or manual)
 */
router.post('/schema', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      prompt,
      schema,
      userEdits,
      reasoning,
      accepted,
      rating,
      feedback,
      model_name,
      model_version,
      generation_time_ms,
      created_by,
    } = req.body;

    if (!schema || !schema.name) {
      return res.status(400).json({ error: 'Schema with name is required' });
    }

    // Create component definition
    const componentResult = await client.query(
      `INSERT INTO component_definitions 
       (name, type, variant, description, schema, metadata, props_schema, category, tags, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        schema.name,
        schema.type || 'component',
        schema.variant || 'default',
        schema.description || null,
        schema,
        schema.metadata || {},
        schema.props_schema || {},
        schema.metadata?.category || null,
        schema.metadata?.tags || [],
        created_by || null,
      ]
    );

    const componentId = componentResult.rows[0].id;

    // Create schema fields
    if (schema.fields && Array.isArray(schema.fields)) {
      for (const field of schema.fields) {
        await client.query(
          `INSERT INTO schema_fields 
           (parent_id, parent_type, field_key, field_label, field_type, description, options, default_value, validations, ui_hints)
           VALUES ($1, 'component', $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            componentId,
            field.key,
            field.label,
            field.type,
            field.description || null,
            field.options ? JSON.stringify(field.options) : null,
            field.defaultValue ? JSON.stringify(field.defaultValue) : null,
            field.validations ? JSON.stringify(field.validations) : null,
            field.uiHints ? JSON.stringify(field.uiHints) : null,
          ]
        );
      }
    }

    // Record AI generation if applicable
    if (prompt) {
      await client.query(
        `INSERT INTO ai_component_generations 
         (prompt, component_id, generated_schema, user_edits, accepted, rejected, feedback, rating, model_name, model_version, generation_time_ms, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          prompt,
          componentId,
          schema,
          userEdits || {},
          accepted || false,
          !accepted,
          feedback || null,
          rating || null,
          model_name || null,
          model_version || null,
          generation_time_ms || null,
          created_by || null,
        ]
      );

      // Add to training data if accepted
      if (accepted && userEdits && Object.keys(userEdits).length > 0) {
        await client.query(
          `INSERT INTO component_training_data 
           (component_id, category, input, output, context, quality_score)
           VALUES ($1, 'attribute_mapping', $2, $3, $4, $5)`,
          [
            componentId,
            { prompt, originalSchema: schema },
            { editedSchema: userEdits.changes || userEdits },
            { reasoning, model: model_name },
            rating ? rating / 5 : 0.8,
          ]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      component: componentResult.rows[0],
      message: 'Component schema created successfully',
    });
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating component schema:', error);
    res.status(500).json({ error: 'Failed to create component schema', details: error.message });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/components/schema/:id
 * Update an existing component schema
 */
router.put('/schema/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, schema, metadata, props_schema, tags, is_published } = req.body;

    const result = await pool.query(
      `UPDATE component_definitions 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           schema = COALESCE($3, schema),
           metadata = COALESCE($4, metadata),
           props_schema = COALESCE($5, props_schema),
           tags = COALESCE($6, tags),
           is_published = COALESCE($7, is_published)
       WHERE id = $8
       RETURNING *`,
      [name, description, schema, metadata, props_schema, tags, is_published, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Component not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating component:', error);
    res.status(500).json({ error: 'Failed to update component', details: error.message });
  }
});

// ============================================================================
// Dashboard Definitions
// ============================================================================

/**
 * GET /api/components/dashboards
 * List all dashboard definitions
 */
router.get('/dashboards', async (req, res) => {
  try {
    const { domain, access_level, published_only, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT id, name, description, domain, layout, grid_config, 
             access_level, is_published, usage_count, version, tags, 
             created_at, updated_at
      FROM dashboard_definitions
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (domain) {
      query += ` AND domain = $${paramCount++}`;
      params.push(domain);
    }

    if (access_level) {
      query += ` AND access_level = $${paramCount++}`;
      params.push(access_level);
    }

    if (published_only === 'true') {
      query += ` AND is_published = true`;
    }

    query += ` ORDER BY usage_count DESC, name ASC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      dashboards: result.rows,
      total: result.rowCount,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    console.error('Error fetching dashboards:', error);
    res.status(500).json({ error: 'Failed to fetch dashboards', details: error.message });
  }
});

/**
 * GET /api/components/dashboards/:id
 * Get a specific dashboard with its components
 */
router.get('/dashboards/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const dashboardResult = await pool.query(
      `SELECT * FROM dashboard_definitions WHERE id = $1`,
      [id]
    );

    if (dashboardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const dashboard = dashboardResult.rows[0];

    // Get associated components
    const componentsResult = await pool.query(
      `SELECT c.*, dc.position, dc.settings, dc.data_bindings, dc.sort_order
       FROM component_definitions c
       JOIN dashboard_components dc ON dc.component_id = c.id
       WHERE dc.dashboard_id = $1
       ORDER BY dc.sort_order`,
      [id]
    );

    dashboard.components = componentsResult.rows;

    res.json(dashboard);
  } catch (error: any) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard', details: error.message });
  }
});

// ============================================================================
// Training Data & Analytics
// ============================================================================

/**
 * GET /api/components/training-data
 * Get training data for improving component generation
 */
router.get('/training-data', async (req, res) => {
  try {
    const { category, limit = 100 } = req.query;

    let query = `
      SELECT id, component_id, category, input, output, context, quality_score, usage_count, created_at
      FROM component_training_data
      WHERE quality_score >= 0.6
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount++}`;
      params.push(category);
    }

    query += ` ORDER BY quality_score DESC, usage_count DESC LIMIT $${paramCount++}`;
    params.push(limit);

    const result = await pool.query(query, params);

    res.json({
      trainingData: result.rows,
      total: result.rowCount,
    });
  } catch (error: any) {
    console.error('Error fetching training data:', error);
    res.status(500).json({ error: 'Failed to fetch training data', details: error.message });
  }
});

/**
 * GET /api/components/analytics
 * Get analytics on component usage and generation
 */
router.get('/analytics', async (req, res) => {
  try {
    const [atomStats, componentStats, generationStats] = await Promise.all([
      pool.query(`
        SELECT category, COUNT(*) as count, AVG(usage_count) as avg_usage
        FROM atom_definitions
        GROUP BY category
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT type, COUNT(*) as count, AVG(usage_count) as avg_usage
        FROM component_definitions
        GROUP BY type
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT 
          COUNT(*) as total_generations,
          SUM(CASE WHEN accepted THEN 1 ELSE 0 END) as accepted_count,
          AVG(rating) as avg_rating,
          AVG(generation_time_ms) as avg_generation_time
        FROM ai_component_generations
      `),
    ]);

    res.json({
      atoms: atomStats.rows,
      components: componentStats.rows,
      generations: generationStats.rows[0],
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics', details: error.message });
  }
});

export default router;
