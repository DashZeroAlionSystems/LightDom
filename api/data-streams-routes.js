/**
 * Data Streams API Routes
 * 
 * Provides CRUD operations for data streams with attribute management
 * Features:
 * - Create, Read, Update, Delete data streams
 * - Manage attribute associations
 * - Include/exclude attributes from streams
 * - Manage attribute lists
 * - Stream metrics and monitoring
 */

import express from 'express';

export function createDataStreamsRouter(db) {
  const router = express.Router();

  // ============================================================================
  // DATA STREAMS CRUD
  // ============================================================================

  /**
   * GET /api/data-streams
   * List all data streams with their attributes
   */
  router.get('/', async (req, res) => {
    try {
      const { 
        status, 
        source_type, 
        destination_type, 
        page = 1, 
        limit = 50,
        search 
      } = req.query;

      let query = 'SELECT * FROM data_streams_with_attributes WHERE 1=1';
      const params = [];
      let paramCount = 1;

      // Apply filters
      if (status) {
        query += ` AND status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (source_type) {
        query += ` AND source_type = $${paramCount}`;
        params.push(source_type);
        paramCount++;
      }

      if (destination_type) {
        query += ` AND destination_type = $${paramCount}`;
        params.push(destination_type);
        paramCount++;
      }

      if (search) {
        query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      // Pagination
      query += ` ORDER BY created_at DESC`;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(parseInt(limit), offset);

      const result = await db.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM data_streams WHERE 1=1';
      const countParams = [];
      let countParamIdx = 1;

      if (status) {
        countQuery += ` AND status = $${countParamIdx}`;
        countParams.push(status);
        countParamIdx++;
      }

      if (source_type) {
        countQuery += ` AND source_type = $${countParamIdx}`;
        countParams.push(source_type);
        countParamIdx++;
      }

      if (destination_type) {
        countQuery += ` AND destination_type = $${countParamIdx}`;
        countParams.push(destination_type);
        countParamIdx++;
      }

      if (search) {
        countQuery += ` AND (name ILIKE $${countParamIdx} OR description ILIKE $${countParamIdx})`;
        countParams.push(`%${search}%`);
        countParamIdx++;
      }

      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching data streams:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/data-streams/:id
   * Get a single data stream with its attributes
   */
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const result = await db.query(
        'SELECT * FROM data_streams_with_attributes WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Data stream not found'
        });
      }

      // Get attribute lists associated with this stream
      const listsResult = await db.query(`
        SELECT 
          al.id,
          al.name,
          al.description,
          dsal.is_active,
          dsal.override_config
        FROM data_stream_attribute_lists dsal
        JOIN attribute_lists al ON dsal.list_id = al.id
        WHERE dsal.data_stream_id = $1
      `, [id]);

      const dataStream = result.rows[0];
      dataStream.attribute_lists = listsResult.rows;

      res.json({
        success: true,
        data: dataStream
      });
    } catch (error) {
      console.error('Error fetching data stream:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/data-streams
   * Create a new data stream
   */
  router.post('/', async (req, res) => {
    try {
      const {
        name,
        description,
        source_type,
        source_config,
        destination_type,
        destination_config,
        transformation_rules,
        data_format,
        throughput_limit,
        attributes = []
      } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Name is required'
        });
      }

      // Start transaction
      await db.query('BEGIN');

      try {
        // Create data stream
        const streamResult = await db.query(`
          INSERT INTO data_streams (
            name, description, source_type, source_config,
            destination_type, destination_config, transformation_rules,
            data_format, throughput_limit, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'inactive')
          RETURNING *
        `, [
          name,
          description,
          source_type,
          JSON.stringify(source_config || {}),
          destination_type,
          JSON.stringify(destination_config || {}),
          JSON.stringify(transformation_rules || []),
          data_format,
          throughput_limit
        ]);

        const dataStream = streamResult.rows[0];

        // Add attributes if provided
        if (attributes && attributes.length > 0) {
          for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            await db.query(`
              INSERT INTO data_stream_attributes (
                data_stream_id, attribute_id, attribute_name,
                attribute_type, is_required, transformation_config,
                validation_config, position, is_included
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
              dataStream.id,
              attr.attribute_id || null,
              attr.attribute_name,
              attr.attribute_type,
              attr.is_required || false,
              JSON.stringify(attr.transformation_config || {}),
              JSON.stringify(attr.validation_config || {}),
              attr.position !== undefined ? attr.position : i,
              attr.is_included !== undefined ? attr.is_included : true
            ]);
          }
        }

        // Log the creation
        await db.query(`
          INSERT INTO data_stream_processing_log (
            data_stream_id, action, status, metadata
          )
          VALUES ($1, 'created', 'success', $2)
        `, [dataStream.id, JSON.stringify({ created_by: req.user?.id || 'system' })]);

        await db.query('COMMIT');

        // Fetch the complete data stream with attributes
        const completeResult = await db.query(
          'SELECT * FROM data_streams_with_attributes WHERE id = $1',
          [dataStream.id]
        );

        res.status(201).json({
          success: true,
          data: completeResult.rows[0]
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error creating data stream:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PUT /api/data-streams/:id
   * Update a data stream
   */
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        source_type,
        source_config,
        destination_type,
        destination_config,
        transformation_rules,
        data_format,
        throughput_limit,
        status
      } = req.body;

      // Check if stream exists
      const checkResult = await db.query(
        'SELECT id FROM data_streams WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Data stream not found'
        });
      }

      // Build update query dynamically
      const updates = [];
      const params = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount}`);
        params.push(name);
        paramCount++;
      }

      if (description !== undefined) {
        updates.push(`description = $${paramCount}`);
        params.push(description);
        paramCount++;
      }

      if (source_type !== undefined) {
        updates.push(`source_type = $${paramCount}`);
        params.push(source_type);
        paramCount++;
      }

      if (source_config !== undefined) {
        updates.push(`source_config = $${paramCount}`);
        params.push(JSON.stringify(source_config));
        paramCount++;
      }

      if (destination_type !== undefined) {
        updates.push(`destination_type = $${paramCount}`);
        params.push(destination_type);
        paramCount++;
      }

      if (destination_config !== undefined) {
        updates.push(`destination_config = $${paramCount}`);
        params.push(JSON.stringify(destination_config));
        paramCount++;
      }

      if (transformation_rules !== undefined) {
        updates.push(`transformation_rules = $${paramCount}`);
        params.push(JSON.stringify(transformation_rules));
        paramCount++;
      }

      if (data_format !== undefined) {
        updates.push(`data_format = $${paramCount}`);
        params.push(data_format);
        paramCount++;
      }

      if (throughput_limit !== undefined) {
        updates.push(`throughput_limit = $${paramCount}`);
        params.push(throughput_limit);
        paramCount++;
      }

      if (status !== undefined) {
        updates.push(`status = $${paramCount}`);
        params.push(status);
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      updates.push(`updated_at = NOW()`);
      params.push(id);

      const query = `
        UPDATE data_streams 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, params);

      // Log the update
      await db.query(`
        INSERT INTO data_stream_processing_log (
          data_stream_id, action, status, metadata
        )
        VALUES ($1, 'updated', 'success', $2)
      `, [id, JSON.stringify({ updated_by: req.user?.id || 'system' })]);

      // Fetch complete data stream with attributes
      const completeResult = await db.query(
        'SELECT * FROM data_streams_with_attributes WHERE id = $1',
        [id]
      );

      res.json({
        success: true,
        data: completeResult.rows[0]
      });
    } catch (error) {
      console.error('Error updating data stream:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/data-streams/:id
   * Delete a data stream
   */
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Check if stream exists
      const checkResult = await db.query(
        'SELECT id, name FROM data_streams WHERE id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Data stream not found'
        });
      }

      const streamName = checkResult.rows[0].name;

      // Delete (cascade will handle related records)
      await db.query('DELETE FROM data_streams WHERE id = $1', [id]);

      res.json({
        success: true,
        message: `Data stream "${streamName}" deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting data stream:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================================================
  // ATTRIBUTE MANAGEMENT
  // ============================================================================

  /**
   * GET /api/data-streams/:id/attributes
   * Get all attributes for a data stream
   */
  router.get('/:id/attributes', async (req, res) => {
    try {
      const { id } = req.params;

      const result = await db.query(`
        SELECT * FROM data_stream_attributes
        WHERE data_stream_id = $1
        ORDER BY position
      `, [id]);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching stream attributes:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/data-streams/:id/attributes
   * Add an attribute to a data stream
   */
  router.post('/:id/attributes', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        attribute_id,
        attribute_name,
        attribute_type,
        is_required,
        transformation_config,
        validation_config,
        position,
        is_included
      } = req.body;

      // Validate required fields
      if (!attribute_name) {
        return res.status(400).json({
          success: false,
          error: 'Attribute name is required'
        });
      }

      // Check if stream exists
      const streamCheck = await db.query(
        'SELECT id FROM data_streams WHERE id = $1',
        [id]
      );

      if (streamCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Data stream not found'
        });
      }

      // Add attribute
      const result = await db.query(`
        INSERT INTO data_stream_attributes (
          data_stream_id, attribute_id, attribute_name,
          attribute_type, is_required, transformation_config,
          validation_config, position, is_included
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        id,
        attribute_id || null,
        attribute_name,
        attribute_type,
        is_required || false,
        JSON.stringify(transformation_config || {}),
        JSON.stringify(validation_config || {}),
        position,
        is_included !== undefined ? is_included : true
      ]);

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error adding attribute to stream:', error);
      if (error.code === '23505') { // Unique violation
        res.status(409).json({
          success: false,
          error: 'Attribute already exists in this stream'
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  });

  /**
   * PUT /api/data-streams/:streamId/attributes/:attrId
   * Update an attribute in a data stream
   */
  router.put('/:streamId/attributes/:attrId', async (req, res) => {
    try {
      const { streamId, attrId } = req.params;
      const {
        is_required,
        transformation_config,
        validation_config,
        position,
        is_included
      } = req.body;

      // Build update query
      const updates = [];
      const params = [];
      let paramCount = 1;

      if (is_required !== undefined) {
        updates.push(`is_required = $${paramCount}`);
        params.push(is_required);
        paramCount++;
      }

      if (transformation_config !== undefined) {
        updates.push(`transformation_config = $${paramCount}`);
        params.push(JSON.stringify(transformation_config));
        paramCount++;
      }

      if (validation_config !== undefined) {
        updates.push(`validation_config = $${paramCount}`);
        params.push(JSON.stringify(validation_config));
        paramCount++;
      }

      if (position !== undefined) {
        updates.push(`position = $${paramCount}`);
        params.push(position);
        paramCount++;
      }

      if (is_included !== undefined) {
        updates.push(`is_included = $${paramCount}`);
        params.push(is_included);
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }

      updates.push(`updated_at = NOW()`);
      params.push(attrId, streamId);

      const query = `
        UPDATE data_stream_attributes 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount} AND data_stream_id = $${paramCount + 1}
        RETURNING *
      `;

      const result = await db.query(query, params);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Attribute not found in this stream'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating stream attribute:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/data-streams/:streamId/attributes/:attrId
   * Remove an attribute from a data stream
   */
  router.delete('/:streamId/attributes/:attrId', async (req, res) => {
    try {
      const { streamId, attrId } = req.params;

      const result = await db.query(
        'DELETE FROM data_stream_attributes WHERE id = $1 AND data_stream_id = $2 RETURNING attribute_name',
        [attrId, streamId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Attribute not found in this stream'
        });
      }

      res.json({
        success: true,
        message: `Attribute "${result.rows[0].attribute_name}" removed from stream`
      });
    } catch (error) {
      console.error('Error removing attribute from stream:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================================================
  // ATTRIBUTE LISTS CRUD
  // ============================================================================

  /**
   * GET /api/data-streams/attribute-lists
   * Get all attribute lists
   */
  router.get('/lists/all', async (req, res) => {
    try {
      const { category, is_active, search } = req.query;

      let query = 'SELECT * FROM attribute_lists_with_items WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (category) {
        query += ` AND category = $${paramCount}`;
        params.push(category);
        paramCount++;
      }

      if (is_active !== undefined) {
        query += ` AND is_active = $${paramCount}`;
        params.push(is_active === 'true');
        paramCount++;
      }

      if (search) {
        query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await db.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching attribute lists:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/data-streams/attribute-lists
   * Create a new attribute list
   */
  router.post('/lists', async (req, res) => {
    try {
      const {
        name,
        description,
        category,
        is_system,
        items = []
      } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Name is required'
        });
      }

      await db.query('BEGIN');

      try {
        // Create list
        const listResult = await db.query(`
          INSERT INTO attribute_lists (name, description, category, is_system, created_by)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [name, description, category, is_system || false, req.user?.id || null]);

        const list = listResult.rows[0];

        // Add items
        if (items.length > 0) {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            await db.query(`
              INSERT INTO attribute_list_items (
                list_id, attribute_id, attribute_name,
                attribute_type, position, default_config
              )
              VALUES ($1, $2, $3, $4, $5, $6)
            `, [
              list.id,
              item.attribute_id || null,
              item.attribute_name,
              item.attribute_type,
              item.position !== undefined ? item.position : i,
              JSON.stringify(item.default_config || {})
            ]);
          }
        }

        await db.query('COMMIT');

        // Fetch complete list
        const completeResult = await db.query(
          'SELECT * FROM attribute_lists_with_items WHERE id = $1',
          [list.id]
        );

        res.status(201).json({
          success: true,
          data: completeResult.rows[0]
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error creating attribute list:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/data-streams/:streamId/attribute-lists/:listId
   * Associate an attribute list with a data stream
   */
  router.post('/:streamId/attribute-lists/:listId', async (req, res) => {
    try {
      const { streamId, listId } = req.params;
      const { override_config } = req.body;

      // Check if both exist
      const streamCheck = await db.query('SELECT id FROM data_streams WHERE id = $1', [streamId]);
      const listCheck = await db.query('SELECT id FROM attribute_lists WHERE id = $1', [listId]);

      if (streamCheck.rows.length === 0 || listCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Data stream or attribute list not found'
        });
      }

      // Associate
      const result = await db.query(`
        INSERT INTO data_stream_attribute_lists (data_stream_id, list_id, override_config)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [streamId, listId, JSON.stringify(override_config || {})]);

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error associating attribute list:', error);
      if (error.code === '23505') {
        res.status(409).json({
          success: false,
          error: 'Attribute list already associated with this stream'
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  });

  // ============================================================================
  // STREAM CONTROL
  // ============================================================================

  /**
   * POST /api/data-streams/:id/start
   * Start a data stream
   */
  router.post('/:id/start', async (req, res) => {
    try {
      const { id } = req.params;

      const result = await db.query(`
        UPDATE data_streams
        SET status = 'active', updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Data stream not found'
        });
      }

      // Log the action
      await db.query(`
        INSERT INTO data_stream_processing_log (data_stream_id, action, status)
        VALUES ($1, 'start', 'success')
      `, [id]);

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Data stream started'
      });
    } catch (error) {
      console.error('Error starting data stream:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/data-streams/:id/stop
   * Stop a data stream
   */
  router.post('/:id/stop', async (req, res) => {
    try {
      const { id } = req.params;

      const result = await db.query(`
        UPDATE data_streams
        SET status = 'inactive', updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Data stream not found'
        });
      }

      // Log the action
      await db.query(`
        INSERT INTO data_stream_processing_log (data_stream_id, action, status)
        VALUES ($1, 'stop', 'success')
      `, [id]);

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Data stream stopped'
      });
    } catch (error) {
      console.error('Error stopping data stream:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/data-streams/:id/metrics
   * Get metrics for a data stream
   */
  router.get('/:id/metrics', async (req, res) => {
    try {
      const { id } = req.params;

      // Get stream info
      const streamResult = await db.query(
        'SELECT * FROM data_streams WHERE id = $1',
        [id]
      );

      if (streamResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Data stream not found'
        });
      }

      const stream = streamResult.rows[0];

      // Get processing log summary
      const logResult = await db.query(`
        SELECT 
          action,
          COUNT(*) as count,
          MAX(processed_at) as last_occurrence
        FROM data_stream_processing_log
        WHERE data_stream_id = $1
        GROUP BY action
      `, [id]);

      res.json({
        success: true,
        data: {
          id: stream.id,
          name: stream.name,
          status: stream.status,
          total_records_processed: stream.total_records_processed,
          last_processed_at: stream.last_processed_at,
          created_at: stream.created_at,
          processing_log: logResult.rows
        }
      });
    } catch (error) {
      console.error('Error fetching stream metrics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

export default createDataStreamsRouter;
