/**
 * SEO Campaign Management API Routes
 * 
 * Manages SEO campaigns, campaign attributes, and campaign workflows
 */

import express from 'express';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';

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

// ============================================================================
// CAMPAIGN CRUD OPERATIONS
// ============================================================================

/**
 * GET /api/seo/campaigns
 * List all campaigns with optional filtering
 */
router.get('/campaigns', async (req, res) => {
  try {
    const {
      status,
      client_id,
      active_mining,
      page = 1,
      limit = 20
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let whereConditions = [];
    let queryParams = [];
    let paramCounter = 1;
    
    if (status) {
      whereConditions.push(`status = $${paramCounter++}`);
      queryParams.push(status);
    }
    
    if (client_id) {
      whereConditions.push(`client_id = $${paramCounter++}`);
      queryParams.push(parseInt(client_id));
    }
    
    if (active_mining !== undefined) {
      whereConditions.push(`active_mining = $${paramCounter++}`);
      queryParams.push(active_mining === 'true' || active_mining === true);
    }
    
    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';
    
    const countQuery = `SELECT COUNT(*) FROM seo_campaigns ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);
    
    queryParams.push(limit, offset);
    const dataQuery = `
      SELECT c.*,
        COUNT(DISTINCT ca.attribute_key) as total_attributes,
        COUNT(DISTINCT sw.workflow_id) as total_workflows,
        COUNT(DISTINCT asu.url) as total_seed_urls
      FROM seo_campaigns c
      LEFT JOIN campaign_attributes ca ON c.campaign_id = ca.campaign_id
      LEFT JOIN seo_workflows sw ON c.campaign_id = sw.campaign_id
      LEFT JOIN attribute_seed_urls asu ON c.campaign_id = asu.campaign_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC
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
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaigns',
      message: error.message
    });
  }
});

/**
 * GET /api/seo/campaigns/:campaignId
 * Get a specific campaign by ID
 */
router.get('/campaigns/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const query = `
      SELECT c.*,
        COUNT(DISTINCT ca.attribute_key) as total_attributes,
        COUNT(DISTINCT ca.attribute_key) FILTER (WHERE ca.enabled = TRUE) as enabled_attributes,
        COUNT(DISTINCT ca.attribute_key) FILTER (WHERE ca.mine_actively = TRUE) as actively_mined_attributes,
        COUNT(DISTINCT sw.workflow_id) as total_workflows,
        COUNT(DISTINCT sw.workflow_id) FILTER (WHERE sw.status = 'active') as active_workflows,
        COUNT(DISTINCT asu.url) as total_seed_urls
      FROM seo_campaigns c
      LEFT JOIN campaign_attributes ca ON c.campaign_id = ca.campaign_id
      LEFT JOIN seo_workflows sw ON c.campaign_id = sw.campaign_id
      LEFT JOIN attribute_seed_urls asu ON c.campaign_id = asu.campaign_id
      WHERE c.campaign_id = $1
      GROUP BY c.id
    `;
    
    const result = await pool.query(query, [campaignId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
        campaignId
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign',
      message: error.message
    });
  }
});

/**
 * POST /api/seo/campaigns
 * Create a new SEO campaign
 */
router.post('/campaigns', async (req, res) => {
  try {
    const {
      name,
      description,
      client_id,
      target_keywords = [],
      target_urls = [],
      industry,
      status = 'draft',
      priority = 'medium',
      start_date,
      end_date,
      schedule_cron,
      neural_network_enabled = false,
      neural_network_config = {},
      active_mining = false,
      mining_rules = {},
      created_by
    } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: name'
      });
    }
    
    const campaign_id = `campaign_${uuidv4()}`;
    
    const query = `
      INSERT INTO seo_campaigns (
        campaign_id, name, description, client_id,
        target_keywords, target_urls, industry,
        status, priority,
        start_date, end_date, schedule_cron,
        neural_network_enabled, neural_network_config,
        active_mining, mining_rules,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *;
    `;
    
    const values = [
      campaign_id, name, description, client_id,
      target_keywords, target_urls, industry,
      status, priority,
      start_date, end_date, schedule_cron,
      neural_network_enabled, JSON.stringify(neural_network_config),
      active_mining, JSON.stringify(mining_rules),
      created_by
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create campaign',
      message: error.message
    });
  }
});

/**
 * PUT /api/seo/campaigns/:campaignId
 * Update a campaign
 */
router.put('/campaigns/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    const updates = req.body;
    
    const allowedFields = [
      'name', 'description', 'client_id',
      'target_keywords', 'target_urls', 'industry',
      'status', 'priority',
      'start_date', 'end_date', 'schedule_cron',
      'neural_network_enabled', 'neural_network_config',
      'active_mining', 'mining_rules'
    ];
    
    const setClauses = [];
    const values = [];
    let paramCounter = 1;
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        const jsonFields = ['neural_network_config', 'mining_rules'];
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
    
    values.push(campaignId);
    const query = `
      UPDATE seo_campaigns
      SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE campaign_id = $${paramCounter}
      RETURNING *;
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
        campaignId
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update campaign',
      message: error.message
    });
  }
});

/**
 * DELETE /api/seo/campaigns/:campaignId
 * Delete a campaign
 */
router.delete('/campaigns/:campaignId', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const query = 'DELETE FROM seo_campaigns WHERE campaign_id = $1 RETURNING campaign_id, name';
    const result = await pool.query(query, [campaignId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
        campaignId
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete campaign',
      message: error.message
    });
  }
});

// ============================================================================
// CAMPAIGN ATTRIBUTES MANAGEMENT
// ============================================================================

/**
 * GET /api/seo/campaigns/:campaignId/attributes
 * Get all attributes for a campaign
 */
router.get('/campaigns/:campaignId/attributes', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const query = `
      SELECT ca.*, ad.name, ad.category, ad.importance, ad.ml_weight
      FROM campaign_attributes ca
      JOIN seo_attribute_definitions ad ON ca.attribute_key = ad.attribute_key
      WHERE ca.campaign_id = $1
      ORDER BY ad.category, ad.importance DESC;
    `;
    
    const result = await pool.query(query, [campaignId]);
    
    res.json({
      success: true,
      data: result.rows,
      meta: {
        campaignId,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching campaign attributes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign attributes',
      message: error.message
    });
  }
});

/**
 * POST /api/seo/campaigns/:campaignId/attributes
 * Add attributes to a campaign
 */
router.post('/campaigns/:campaignId/attributes', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { campaignId } = req.params;
    const { attributes } = req.body; // Array of attribute configurations
    
    if (!Array.isArray(attributes) || attributes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        message: 'Expected an array of attribute configurations'
      });
    }
    
    await client.query('BEGIN');
    
    const results = [];
    const errors = [];
    
    for (const attr of attributes) {
      try {
        const {
          attribute_key,
          enabled = true,
          weight_override,
          custom_validation,
          custom_scraping_config,
          data_stream_id,
          stream_enabled = true,
          mine_actively = false,
          mining_priority = 5,
          mining_algorithm = 'rule-based'
        } = attr;
        
        if (!attribute_key) {
          errors.push({ error: 'Missing attribute_key', attr });
          continue;
        }
        
        const query = `
          INSERT INTO campaign_attributes (
            campaign_id, attribute_key, enabled, weight_override,
            custom_validation, custom_scraping_config,
            data_stream_id, stream_enabled,
            mine_actively, mining_priority, mining_algorithm
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (campaign_id, attribute_key) DO UPDATE SET
            enabled = EXCLUDED.enabled,
            weight_override = EXCLUDED.weight_override,
            custom_validation = EXCLUDED.custom_validation,
            custom_scraping_config = EXCLUDED.custom_scraping_config,
            data_stream_id = EXCLUDED.data_stream_id,
            stream_enabled = EXCLUDED.stream_enabled,
            mine_actively = EXCLUDED.mine_actively,
            mining_priority = EXCLUDED.mining_priority,
            mining_algorithm = EXCLUDED.mining_algorithm,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *;
        `;
        
        const values = [
          campaignId, attribute_key, enabled, weight_override,
          custom_validation ? JSON.stringify(custom_validation) : null,
          custom_scraping_config ? JSON.stringify(custom_scraping_config) : null,
          data_stream_id, stream_enabled,
          mine_actively, mining_priority, mining_algorithm
        ];
        
        const result = await client.query(query, values);
        results.push(result.rows[0]);
      } catch (error) {
        errors.push({ attribute_key: attr.attribute_key, error: error.message });
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      data: {
        added: results.length,
        errors: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding campaign attributes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add campaign attributes',
      message: error.message
    });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/seo/campaigns/:campaignId/attributes/:attributeKey
 * Remove an attribute from a campaign
 */
router.delete('/campaigns/:campaignId/attributes/:attributeKey', async (req, res) => {
  try {
    const { campaignId, attributeKey } = req.params;
    
    const query = `
      DELETE FROM campaign_attributes
      WHERE campaign_id = $1 AND attribute_key = $2
      RETURNING attribute_key;
    `;
    
    const result = await pool.query(query, [campaignId, attributeKey]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign attribute not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Attribute removed from campaign successfully'
    });
  } catch (error) {
    console.error('Error removing campaign attribute:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove campaign attribute',
      message: error.message
    });
  }
});

// ============================================================================
// SEED URL MANAGEMENT
// ============================================================================

/**
 * GET /api/seo/campaigns/:campaignId/seed-urls
 * Get all seed URLs for a campaign
 */
router.get('/campaigns/:campaignId/seed-urls', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const query = `
      SELECT *
      FROM attribute_seed_urls
      WHERE campaign_id = $1
      ORDER BY priority DESC, created_at DESC;
    `;
    
    const result = await pool.query(query, [campaignId]);
    
    res.json({
      success: true,
      data: result.rows,
      meta: {
        campaignId,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching seed URLs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seed URLs',
      message: error.message
    });
  }
});

/**
 * POST /api/seo/campaigns/:campaignId/seed-urls
 * Add seed URLs to a campaign
 */
router.post('/campaigns/:campaignId/seed-urls', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { campaignId } = req.params;
    const { urls } = req.body; // Array of URL configurations
    
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        message: 'Expected an array of URL configurations'
      });
    }
    
    await client.query('BEGIN');
    
    const results = [];
    const errors = [];
    
    for (const urlConfig of urls) {
      try {
        const {
          url,
          url_type = 'target',
          priority = 5,
          depth_limit = 3,
          target_attributes,
          exclude_attributes,
          crawl_frequency = 'daily'
        } = urlConfig;
        
        if (!url) {
          errors.push({ error: 'Missing url', urlConfig });
          continue;
        }
        
        const query = `
          INSERT INTO attribute_seed_urls (
            url, campaign_id, url_type, priority, depth_limit,
            target_attributes, exclude_attributes, crawl_frequency
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (url, campaign_id) DO UPDATE SET
            url_type = EXCLUDED.url_type,
            priority = EXCLUDED.priority,
            depth_limit = EXCLUDED.depth_limit,
            target_attributes = EXCLUDED.target_attributes,
            exclude_attributes = EXCLUDED.exclude_attributes,
            crawl_frequency = EXCLUDED.crawl_frequency,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *;
        `;
        
        const values = [
          url, campaignId, url_type, priority, depth_limit,
          target_attributes, exclude_attributes, crawl_frequency
        ];
        
        const result = await client.query(query, values);
        results.push(result.rows[0]);
      } catch (error) {
        errors.push({ url: urlConfig.url, error: error.message });
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      data: {
        added: results.length,
        errors: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding seed URLs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add seed URLs',
      message: error.message
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/seo/campaigns/:campaignId/stats
 * Get campaign statistics
 */
router.get('/campaigns/:campaignId/stats', async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const queries = {
      campaign: 'SELECT * FROM seo_campaigns WHERE campaign_id = $1',
      attributes: `
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE enabled = TRUE) as enabled,
          COUNT(*) FILTER (WHERE mine_actively = TRUE) as actively_mined
        FROM campaign_attributes WHERE campaign_id = $1
      `,
      workflows: `
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active,
          SUM(total_runs) as total_runs,
          SUM(successful_runs) as successful_runs
        FROM seo_workflows WHERE campaign_id = $1
      `,
      seedUrls: `
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'error') as error
        FROM attribute_seed_urls WHERE campaign_id = $1
      `
    };
    
    const [campaign, attributes, workflows, seedUrls] = await Promise.all([
      pool.query(queries.campaign, [campaignId]),
      pool.query(queries.attributes, [campaignId]),
      pool.query(queries.workflows, [campaignId]),
      pool.query(queries.seedUrls, [campaignId])
    ]);
    
    if (campaign.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found',
        campaignId
      });
    }
    
    res.json({
      success: true,
      data: {
        campaign: campaign.rows[0],
        attributes: attributes.rows[0],
        workflows: workflows.rows[0],
        seedUrls: seedUrls.rows[0]
      }
    });
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign statistics',
      message: error.message
    });
  }
});

export default router;
