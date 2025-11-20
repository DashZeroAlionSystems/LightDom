/**
 * SEO Attribute CRUD API Routes
 * 
 * Provides comprehensive REST API for creating, reading, updating, and deleting SEO attributes
 */

import express from 'express';
import pg from 'pg';

const { Pool } = pg;
const router = express.Router();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'lightdom',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

/**
 * GET /api/seo/attributes
 * List all SEO attributes with optional filtering
 */
router.get('/attributes', async (req, res) => {
  try {
    const {
      category,
      importance,
      active,
      search,
      page = 1,
      limit = 50,
      sortBy = 'id',
      sortOrder = 'ASC'
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const validSortColumns = ['id', 'attribute_key', 'category', 'importance', 'ml_weight', 'created_at'];
    const orderBy = validSortColumns.includes(sortBy) ? sortBy : 'id';
    const order = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Build query with filters
    let whereConditions = [];
    let queryParams = [];
    let paramCounter = 1;
    
    if (category) {
      whereConditions.push(`category = $${paramCounter++}`);
      queryParams.push(category);
    }
    
    if (importance) {
      whereConditions.push(`importance = $${paramCounter++}`);
      queryParams.push(importance);
    }
    
    if (active !== undefined) {
      whereConditions.push(`active = $${paramCounter++}`);
      queryParams.push(active === 'true' || active === true);
    }
    
    if (search) {
      whereConditions.push(`(attribute_key ILIKE $${paramCounter} OR name ILIKE $${paramCounter} OR description ILIKE $${paramCounter})`);
      queryParams.push(`%${search}%`);
      paramCounter++;
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) FROM seo_attribute_definitions ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);
    
    // Get paginated results
    queryParams.push(limit, offset);
    const dataQuery = `
      SELECT *
      FROM seo_attribute_definitions
      ${whereClause}
      ORDER BY ${orderBy} ${order}
      LIMIT $${paramCounter++} OFFSET $${paramCounter}
    `;
    
    const result = await pool.query(dataQuery, queryParams);
    
    res.json({
      success: true,
      data: result.rows,
      meta: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching attributes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attributes',
      message: error.message
    });
  }
});

/**
 * GET /api/seo/attributes/:key
 * Get a specific attribute by key
 */
router.get('/attributes/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    const query = 'SELECT * FROM seo_attribute_definitions WHERE attribute_key = $1';
    const result = await pool.query(query, [key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Attribute not found',
        attributeKey: key
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching attribute:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attribute',
      message: error.message
    });
  }
});

/**
 * POST /api/seo/attributes
 * Create a new SEO attribute
 */
router.post('/attributes', async (req, res) => {
  try {
    const {
      attribute_key,
      attribute_id,
      name,
      category,
      selector,
      type,
      ml_weight = 0.05,
      validation_rules = {},
      required = false,
      scraping_method,
      scraping_config = {},
      feature_type,
      importance,
      normalization,
      seeding_source = 'crawler',
      refresh_frequency = 'daily',
      quality_threshold = 0.85,
      description,
      seo_rules = [],
      active = true
    } = req.body;
    
    // Validate required fields
    if (!attribute_key || !attribute_id || !category || !selector || !type || !scraping_method) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['attribute_key', 'attribute_id', 'category', 'selector', 'type', 'scraping_method']
      });
    }
    
    const query = `
      INSERT INTO seo_attribute_definitions (
        attribute_key, attribute_id, name, category, selector, type, ml_weight,
        validation_rules, required, scraping_method, scraping_config,
        feature_type, importance, normalization,
        seeding_source, refresh_frequency, quality_threshold,
        description, seo_rules, active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *;
    `;
    
    const values = [
      attribute_key, attribute_id, name || attribute_key, category, selector, type, ml_weight,
      JSON.stringify(validation_rules), required, scraping_method, JSON.stringify(scraping_config),
      feature_type, importance, normalization,
      seeding_source, refresh_frequency, quality_threshold,
      description, JSON.stringify(seo_rules), active
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Attribute created successfully'
    });
  } catch (error) {
    console.error('Error creating attribute:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({
        success: false,
        error: 'Attribute already exists',
        message: 'An attribute with this key or ID already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create attribute',
      message: error.message
    });
  }
});

/**
 * PUT /api/seo/attributes/:key
 * Update an existing attribute
 */
router.put('/attributes/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const updates = req.body;
    
    // Check if attribute exists
    const checkQuery = 'SELECT id FROM seo_attribute_definitions WHERE attribute_key = $1';
    const checkResult = await pool.query(checkQuery, [key]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Attribute not found',
        attributeKey: key
      });
    }
    
    // Build update query dynamically
    const allowedFields = [
      'name', 'category', 'selector', 'type', 'ml_weight',
      'validation_rules', 'required', 'scraping_method', 'scraping_config',
      'feature_type', 'importance', 'normalization',
      'seeding_source', 'refresh_frequency', 'quality_threshold',
      'description', 'seo_rules', 'active'
    ];
    
    const setClauses = [];
    const values = [];
    let paramCounter = 1;
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        // JSON fields need to be stringified
        const jsonFields = ['validation_rules', 'scraping_config', 'seo_rules'];
        const value = jsonFields.includes(field) 
          ? JSON.stringify(updates[field])
          : updates[field];
        
        setClauses.push(`${field} = $${paramCounter++}`);
        values.push(value);
      }
    }
    
    if (setClauses.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    values.push(key);
    const query = `
      UPDATE seo_attribute_definitions
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE attribute_key = $${paramCounter}
      RETURNING *;
    `;
    
    const result = await pool.query(query, values);
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Attribute updated successfully'
    });
  } catch (error) {
    console.error('Error updating attribute:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update attribute',
      message: error.message
    });
  }
});

/**
 * DELETE /api/seo/attributes/:key
 * Delete an attribute (soft delete by setting active = false)
 */
router.delete('/attributes/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { hard = false } = req.query;
    
    if (hard === 'true' || hard === true) {
      // Hard delete
      const query = 'DELETE FROM seo_attribute_definitions WHERE attribute_key = $1 RETURNING attribute_key';
      const result = await pool.query(query, [key]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Attribute not found',
          attributeKey: key
        });
      }
    } else {
      // Soft delete
      const query = `
        UPDATE seo_attribute_definitions
        SET active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE attribute_key = $1
        RETURNING attribute_key;
      `;
      const result = await pool.query(query, [key]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Attribute not found',
          attributeKey: key
        });
      }
    }
    
    res.json({
      success: true,
      message: `Attribute ${hard ? 'deleted' : 'deactivated'} successfully`,
      attributeKey: key
    });
  } catch (error) {
    console.error('Error deleting attribute:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete attribute',
      message: error.message
    });
  }
});

/**
 * GET /api/seo/attributes/stats
 * Get attribute statistics
 */
router.get('/attributes-stats', async (req, res) => {
  try {
    const queries = {
      total: 'SELECT COUNT(*) as count FROM seo_attribute_definitions WHERE active = TRUE',
      byCategory: 'SELECT category, COUNT(*) as count FROM seo_attribute_definitions WHERE active = TRUE GROUP BY category ORDER BY category',
      byImportance: `
        SELECT importance, COUNT(*) as count
        FROM seo_attribute_definitions
        WHERE active = TRUE
        GROUP BY importance
        ORDER BY CASE importance
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END
      `,
      highWeight: 'SELECT COUNT(*) as count FROM seo_attribute_definitions WHERE active = TRUE AND ml_weight >= 0.10'
    };
    
    const [total, byCategory, byImportance, highWeight] = await Promise.all([
      pool.query(queries.total),
      pool.query(queries.byCategory),
      pool.query(queries.byImportance),
      pool.query(queries.highWeight)
    ]);
    
    res.json({
      success: true,
      data: {
        totalAttributes: parseInt(total.rows[0].count),
        highWeightAttributes: parseInt(highWeight.rows[0].count),
        byCategory: byCategory.rows.reduce((acc, row) => {
          acc[row.category] = parseInt(row.count);
          return acc;
        }, {}),
        byImportance: byImportance.rows.reduce((acc, row) => {
          acc[row.importance] = parseInt(row.count);
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

/**
 * PATCH /api/seo/attributes/:key/toggle
 * Toggle attribute active status
 */
router.patch('/attributes/:key/toggle', async (req, res) => {
  try {
    const { key } = req.params;
    
    const query = `
      UPDATE seo_attribute_definitions
      SET active = NOT active, updated_at = CURRENT_TIMESTAMP
      WHERE attribute_key = $1
      RETURNING attribute_key, active;
    `;
    
    const result = await pool.query(query, [key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Attribute not found',
        attributeKey: key
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: `Attribute ${result.rows[0].active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error toggling attribute:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle attribute',
      message: error.message
    });
  }
});

/**
 * POST /api/seo/attributes/bulk-update
 * Bulk update multiple attributes
 */
router.post('/attributes/bulk-update', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        message: 'Expected an array of updates'
      });
    }
    
    await client.query('BEGIN');
    
    const results = [];
    const errors = [];
    
    for (const update of updates) {
      try {
        const { attribute_key, ...fields } = update;
        
        if (!attribute_key) {
          errors.push({ error: 'Missing attribute_key', update });
          continue;
        }
        
        // Build update query
        const allowedFields = ['ml_weight', 'importance', 'active', 'seo_rules'];
        const setClauses = [];
        const values = [];
        let paramCounter = 1;
        
        for (const field of allowedFields) {
          if (fields[field] !== undefined) {
            const value = field === 'seo_rules' 
              ? JSON.stringify(fields[field])
              : fields[field];
            
            setClauses.push(`${field} = $${paramCounter++}`);
            values.push(value);
          }
        }
        
        if (setClauses.length > 0) {
          values.push(attribute_key);
          const query = `
            UPDATE seo_attribute_definitions
            SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE attribute_key = $${paramCounter}
            RETURNING attribute_key;
          `;
          
          const result = await client.query(query, values);
          if (result.rows.length > 0) {
            results.push(result.rows[0]);
          }
        }
      } catch (error) {
        errors.push({ attribute_key: update.attribute_key, error: error.message });
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      data: {
        updated: results.length,
        errors: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in bulk update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform bulk update',
      message: error.message
    });
  } finally {
    client.release();
  }
});

export default router;
