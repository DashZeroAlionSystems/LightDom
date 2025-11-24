/**
 * API Routes for Data Streams
 * Manages data flow configuration between services with transformation rules
 */

import { Router } from 'express';

/**
 * @param {Pool} dbPool
 * @returns {import('express').Router}
 */
export function createDataStreamRoutes(dbPool) {
  const router = Router();

  /**
   * GET /api/data-streams
   * List all data streams
   */
  router.get('/', async (req, res) => {
    try {
      const { status, workflow_id } = req.query;
      
      let query = 'SELECT * FROM data_stream_instances WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (status) {
        query += ` AND status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }

      if (workflow_id) {
        query += ` AND workflow_instance_id = $${paramCount}`;
        params.push(workflow_id);
        paramCount++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await dbPool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Error listing data streams:', error);
      res.status(500).json({ error: 'Failed to list data streams', message: error.message });
    }
  });

  /**
   * GET /api/data-streams/:id
   * Get a specific data stream
   */
  router.get('/:id', async (req, res) => {
    try {
      const result = await dbPool.query(
        'SELECT * FROM data_stream_instances WHERE id = $1',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Data stream not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error getting data stream:', error);
      res.status(500).json({ error: 'Failed to get data stream' });
    }
  });

  /**
   * POST /api/data-streams
   * Create a new data stream
   */
  router.post('/', async (req, res) => {
    try {
      const {
        workflow_instance_id,
        name,
        description,
        source_type,
        source_config,
        destination_type,
        destination_config,
        transformation_rules,
        attribute_ids,
        data_format,
        throughput_limit,
      } = req.body;

      const result = await dbPool.query(
        `INSERT INTO data_stream_instances (
          workflow_instance_id, name, description, source_type, source_config,
          destination_type, destination_config, transformation_rules, attribute_ids,
          data_format, throughput_limit, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          workflow_instance_id,
          name,
          description,
          source_type,
          source_config || {},
          destination_type,
          destination_config || {},
          transformation_rules || [],
          attribute_ids || [],
          data_format,
          throughput_limit,
          'inactive',
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating data stream:', error);
      res.status(500).json({ error: 'Failed to create data stream', message: error.message });
    }
  });

  /**
   * PUT /api/data-streams/:id
   * Update a data stream
   */
  router.put('/:id', async (req, res) => {
    try {
      const {
        name,
        description,
        source_config,
        destination_config,
        transformation_rules,
        attribute_ids,
        status,
        data_format,
        throughput_limit,
      } = req.body;

      const result = await dbPool.query(
        `UPDATE data_stream_instances SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          source_config = COALESCE($3, source_config),
          destination_config = COALESCE($4, destination_config),
          transformation_rules = COALESCE($5, transformation_rules),
          attribute_ids = COALESCE($6, attribute_ids),
          status = COALESCE($7, status),
          data_format = COALESCE($8, data_format),
          throughput_limit = COALESCE($9, throughput_limit),
          updated_at = NOW()
        WHERE id = $10
        RETURNING *`,
        [
          name,
          description,
          source_config,
          destination_config,
          transformation_rules,
          attribute_ids,
          status,
          data_format,
          throughput_limit,
          req.params.id,
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Data stream not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating data stream:', error);
      res.status(500).json({ error: 'Failed to update data stream' });
    }
  });

  /**
   * DELETE /api/data-streams/:id
   * Delete a data stream
   */
  router.delete('/:id', async (req, res) => {
    try {
      const result = await dbPool.query(
        'DELETE FROM data_stream_instances WHERE id = $1 RETURNING id',
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Data stream not found' });
      }

      res.json({ message: 'Data stream deleted successfully', id: result.rows[0].id });
    } catch (error) {
      console.error('Error deleting data stream:', error);
      res.status(500).json({ error: 'Failed to delete data stream' });
    }
  });

  /**
   * POST /api/data-streams/:id/start
   * Start a data stream
   */
  router.post('/:id/start', async (req, res) => {
    try {
      const result = await dbPool.query(
        `UPDATE data_stream_instances SET
          status = 'active',
          updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Data stream not found' });
      }

      res.json({ message: 'Data stream started', dataStream: result.rows[0] });
    } catch (error) {
      console.error('Error starting data stream:', error);
      res.status(500).json({ error: 'Failed to start data stream' });
    }
  });

  /**
   * POST /api/data-streams/:id/stop
   * Stop a data stream
   */
  router.post('/:id/stop', async (req, res) => {
    try {
      const result = await dbPool.query(
        `UPDATE data_stream_instances SET
          status = 'inactive',
          updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Data stream not found' });
      }

      res.json({ message: 'Data stream stopped', dataStream: result.rows[0] });
    } catch (error) {
      console.error('Error stopping data stream:', error);
      res.status(500).json({ error: 'Failed to stop data stream' });
    }
  });

  /**
   * GET /api/data-streams/:id/metrics
   * Get metrics for a data stream
   */
  router.get('/:id/metrics', async (req, res) => {
    try {
      const result = await dbPool.query(
        `SELECT 
          id, name, status,
          total_records_processed,
          last_processed_at,
          created_at,
          updated_at
        FROM data_stream_instances 
        WHERE id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Data stream not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error getting data stream metrics:', error);
      res.status(500).json({ error: 'Failed to get metrics' });
    }
  });

  return router;
}

export default createDataStreamRoutes;
