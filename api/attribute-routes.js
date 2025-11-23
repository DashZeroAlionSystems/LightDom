/**
 * API Routes for Attributes
 * Manages metadata attribute definitions bundled in data streams
 */

import { Router } from 'express';

/**
 * @param {Pool} dbPool
 * @returns {import('express').Router}
 */
export function createAttributeRoutes(dbPool) {
  const router = Router();

  /**
   * GET /api/attributes
   * List all attributes
   */
  router.get('/', async (req, res) => {
    try {
      const { entity_type, attribute_type, is_required } = req.query;
      
      let query = 'SELECT * FROM attribute_instances WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (entity_type) {
        query += ` AND entity_type = $${paramCount}`;
        params.push(entity_type);
        paramCount++;
      }

      if (attribute_type) {
        query += ` AND attribute_type = $${paramCount}`;
        params.push(attribute_type);
        paramCount++;
      }

      if (is_required !== undefined) {
        query += ` AND is_required = $${paramCount}`;
        params.push(is_required === 'true');
        paramCount++;
      }

      query += ' ORDER BY entity_type, attribute_name';

      const result = await dbPool.query(query, params);
      
      // Transform to match frontend expectations
      const attributes = result.rows.map(row => ({
        id: row.id,
        name: row.attribute_name,
        type: row.attribute_type || 'metadata',
        config: {
          algorithm: row.validation_rules?.algorithm,
          drillDown: row.display_config?.drillDown || false,
          dataMining: row.validation_rules?.dataMining || false,
          training: row.validation_rules?.training || false,
        },
        relatedItems: row.data_stream_ids || [],
        ...row,
      }));

      res.json(attributes);
    } catch (error) {
      console.error('Error listing attributes:', error);
      res.status(500).json({ error: 'Failed to list attributes', message: error.message });
    }
  });

  /**
   * GET /api/attributes/:id
   * Get a specific attribute
   */
  router.get('/:id', async (req, res) => {
    try {
      const result = await dbPool.query(
        'SELECT * FROM attribute_instances WHERE id = $1',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Attribute not found' });
      }

      const row = result.rows[0];
      const attribute = {
        id: row.id,
        name: row.attribute_name,
        type: row.attribute_type || 'metadata',
        config: {
          algorithm: row.validation_rules?.algorithm,
          drillDown: row.display_config?.drillDown || false,
          dataMining: row.validation_rules?.dataMining || false,
          training: row.validation_rules?.training || false,
        },
        relatedItems: row.data_stream_ids || [],
        ...row,
      };

      res.json(attribute);
    } catch (error) {
      console.error('Error getting attribute:', error);
      res.status(500).json({ error: 'Failed to get attribute' });
    }
  });

  /**
   * POST /api/attributes
   * Create a new attribute
   */
  router.post('/', async (req, res) => {
    try {
      const {
        app_id,
        entity_type,
        name,
        type,
        description,
        is_required,
        default_value,
        config,
        data_stream_ids,
      } = req.body;

      // Build validation_rules from config
      const validation_rules = {
        algorithm: config?.algorithm,
        dataMining: config?.dataMining || false,
        training: config?.training || false,
      };

      // Build display_config from config
      const display_config = {
        drillDown: config?.drillDown || false,
      };

      const result = await dbPool.query(
        `INSERT INTO attribute_instances (
          app_id, entity_type, attribute_name, attribute_type,
          description, is_required, default_value,
          validation_rules, display_config, data_stream_ids
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          app_id || null,
          entity_type || 'generic',
          name,
          type || 'metadata',
          description,
          is_required || false,
          default_value,
          validation_rules,
          display_config,
          data_stream_ids || [],
        ]
      );

      const row = result.rows[0];
      const attribute = {
        id: row.id,
        name: row.attribute_name,
        type: row.attribute_type,
        config: {
          algorithm: row.validation_rules?.algorithm,
          drillDown: row.display_config?.drillDown || false,
          dataMining: row.validation_rules?.dataMining || false,
          training: row.validation_rules?.training || false,
        },
        relatedItems: row.data_stream_ids || [],
        ...row,
      };

      res.status(201).json(attribute);
    } catch (error) {
      console.error('Error creating attribute:', error);
      res.status(500).json({ error: 'Failed to create attribute', message: error.message });
    }
  });

  /**
   * PUT /api/attributes/:id
   * Update an attribute
   */
  router.put('/:id', async (req, res) => {
    try {
      const {
        attribute_name,
        attribute_type,
        description,
        is_required,
        default_value,
        config,
        data_stream_ids,
      } = req.body;

      // Build validation_rules from config
      const validation_rules = config ? {
        algorithm: config.algorithm,
        dataMining: config.dataMining,
        training: config.training,
      } : undefined;

      // Build display_config from config
      const display_config = config ? {
        drillDown: config.drillDown,
      } : undefined;

      const result = await dbPool.query(
        `UPDATE attribute_instances SET
          attribute_name = COALESCE($1, attribute_name),
          attribute_type = COALESCE($2, attribute_type),
          description = COALESCE($3, description),
          is_required = COALESCE($4, is_required),
          default_value = COALESCE($5, default_value),
          validation_rules = COALESCE($6, validation_rules),
          display_config = COALESCE($7, display_config),
          data_stream_ids = COALESCE($8, data_stream_ids),
          updated_at = NOW()
        WHERE id = $9
        RETURNING *`,
        [
          attribute_name,
          attribute_type,
          description,
          is_required,
          default_value,
          validation_rules,
          display_config,
          data_stream_ids,
          req.params.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Attribute not found' });
      }

      const row = result.rows[0];
      const attribute = {
        id: row.id,
        name: row.attribute_name,
        type: row.attribute_type,
        config: {
          algorithm: row.validation_rules?.algorithm,
          drillDown: row.display_config?.drillDown || false,
          dataMining: row.validation_rules?.dataMining || false,
          training: row.validation_rules?.training || false,
        },
        relatedItems: row.data_stream_ids || [],
        ...row,
      };

      res.json(attribute);
    } catch (error) {
      console.error('Error updating attribute:', error);
      res.status(500).json({ error: 'Failed to update attribute' });
    }
  });

  /**
   * DELETE /api/attributes/:id
   * Delete an attribute
   */
  router.delete('/:id', async (req, res) => {
    try {
      const result = await dbPool.query(
        'DELETE FROM attribute_instances WHERE id = $1 RETURNING id',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Attribute not found' });
      }

      res.json({ message: 'Attribute deleted successfully', id: result.rows[0].id });
    } catch (error) {
      console.error('Error deleting attribute:', error);
      res.status(500).json({ error: 'Failed to delete attribute' });
    }
  });

  /**
   * GET /api/attributes/:id/related
   * Get related items for drill-down
   */
  router.get('/:id/related', async (req, res) => {
    try {
      const result = await dbPool.query(
        'SELECT data_stream_ids FROM attribute_instances WHERE id = $1',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Attribute not found' });
      }

      const streamIds = result.rows[0].data_stream_ids || [];
      
      if (streamIds.length === 0) {
        return res.json({ relatedItems: [] });
      }

      // Get related data streams
      const streams = await dbPool.query(
        'SELECT id, name, status FROM data_stream_instances WHERE id = ANY($1)',
        [streamIds]
      );

      res.json({ relatedItems: streams.rows });
    } catch (error) {
      console.error('Error getting related items:', error);
      res.status(500).json({ error: 'Failed to get related items' });
    }
  });

  /**
   * POST /api/attributes/:id/drill-down
   * Perform drill-down operation on an attribute
   */
  router.post('/:id/drill-down', async (req, res) => {
    try {
      const { filters, depth = 1 } = req.body;

      const result = await dbPool.query(
        `SELECT a.*, 
          ds.id as stream_id, ds.name as stream_name, ds.status as stream_status
        FROM attribute_instances a
        LEFT JOIN LATERAL unnest(a.data_stream_ids) AS stream_id ON true
        LEFT JOIN data_stream_instances ds ON ds.id = stream_id
        WHERE a.id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Attribute not found' });
      }

      // Group streams by attribute
      const attribute = result.rows[0];
      const streams = result.rows
        .filter(r => r.stream_id)
        .map(r => ({
          id: r.stream_id,
          name: r.stream_name,
          status: r.stream_status,
        }));

      res.json({
        attribute: {
          id: attribute.id,
          name: attribute.attribute_name,
          type: attribute.attribute_type,
        },
        relatedStreams: streams,
        depth,
      });
    } catch (error) {
      console.error('Error performing drill-down:', error);
      res.status(500).json({ error: 'Failed to perform drill-down' });
    }
  });

  return router;
}

export default createAttributeRoutes;
