/**
 * Service Management API Routes
 * 
 * Provides CRUD operations for services with bundled data streams and endpoints
 * Features:
 * - Create, Read, Update, Delete services
 * - Bundle data streams with API endpoints
 * - Manage service-endpoint bindings
 * - Dynamic routing for service-based endpoint access
 */

import express from 'express';
import { randomUUID } from 'crypto';

export function createServiceManagementRouter(db) {
  const router = express.Router();

  // ============================================================================
  // SERVICES CRUD
  // ============================================================================

  /**
   * GET /api/services
   * List all services with their bundled endpoints
   */
  router.get('/', async (req, res) => {
    try {
      const { 
        service_type, 
        status,
        page = 1, 
        limit = 50,
        search 
      } = req.query;

      let query = `
        SELECT 
          ws.*,
          wh.name as workflow_name,
          wh.category as workflow_category,
          COUNT(DISTINCT seb.id) as endpoint_count
        FROM workflow_services ws
        LEFT JOIN workflow_hierarchy wh ON ws.workflow_id = wh.workflow_id
        LEFT JOIN service_endpoint_bindings seb ON ws.service_id = seb.service_id
        WHERE 1=1
      `;
      
      const params = [];
      let paramCount = 1;

      // Apply filters
      if (service_type) {
        query += ` AND ws.service_type = $${paramCount}`;
        params.push(service_type);
        paramCount++;
      }

      if (status === 'active') {
        query += ` AND ws.is_active = true`;
      } else if (status === 'inactive') {
        query += ` AND ws.is_active = false`;
      }

      if (search) {
        query += ` AND (ws.name ILIKE $${paramCount} OR ws.description ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      query += ` GROUP BY ws.id, ws.service_id, wh.name, wh.category`;
      query += ` ORDER BY ws.created_at DESC`;

      // Pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);
      query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(parseInt(limit), offset);

      const result = await db.query(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(DISTINCT ws.id) as count
        FROM workflow_services ws
        WHERE 1=1
      `;
      const countParams = [];
      let countParamIdx = 1;

      if (service_type) {
        countQuery += ` AND ws.service_type = $${countParamIdx}`;
        countParams.push(service_type);
        countParamIdx++;
      }

      if (status === 'active') {
        countQuery += ` AND ws.is_active = true`;
      } else if (status === 'inactive') {
        countQuery += ` AND ws.is_active = false`;
      }

      if (search) {
        countQuery += ` AND (ws.name ILIKE $${countParamIdx} OR ws.description ILIKE $${countParamIdx})`;
        countParams.push(`%${search}%`);
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
      console.error('Error fetching services:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/services/:id
   * Get a single service with its bundled endpoints and data streams
   */
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Get service details
      const serviceResult = await db.query(`
        SELECT 
          ws.*,
          wh.name as workflow_name,
          wh.category as workflow_category
        FROM workflow_services ws
        LEFT JOIN workflow_hierarchy wh ON ws.workflow_id = wh.workflow_id
        WHERE ws.service_id = $1
      `, [id]);

      if (serviceResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      const service = serviceResult.rows[0];

      // Get bundled endpoints
      const endpointsResult = await db.query(`
        SELECT 
          seb.*,
          ae.title,
          ae.path,
          ae.method,
          ae.description,
          ae.category as endpoint_category
        FROM service_endpoint_bindings seb
        JOIN api_endpoints ae ON seb.endpoint_id = ae.endpoint_id
        WHERE seb.service_id = $1
        ORDER BY seb.binding_order
      `, [id]);

      service.bundled_endpoints = endpointsResult.rows;

      // Get associated data streams
      const streamsResult = await db.query(`
        SELECT ds.*
        FROM data_streams ds
        WHERE ds.source_service_id = $1 OR ds.destination_service_id = $1
      `, [id]);

      service.data_streams = streamsResult.rows;

      res.json({
        success: true,
        data: service
      });
    } catch (error) {
      console.error('Error fetching service:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/services
   * Create a new service with bundled endpoints
   */
  router.post('/', async (req, res) => {
    try {
      const {
        name,
        description,
        service_type,
        workflow_id,
        bundled_endpoints = [],
        data_streams = [],
        api_config = {},
        input_attributes = [],
        output_attributes = [],
        supports_realtime = false,
        realtime_config = {}
      } = req.body;

      // Validate required fields
      if (!name || !service_type) {
        return res.status(400).json({
          success: false,
          error: 'Name and service_type are required'
        });
      }

      // Start transaction
      await db.query('BEGIN');

      try {
        const serviceId = `service-${randomUUID()}`;

        // Ensure workflow exists or create a default one
        let workflowIdToUse = workflow_id;
        if (!workflowIdToUse) {
          const defaultWorkflowId = `workflow-${randomUUID()}`;
          await db.query(`
            INSERT INTO workflow_hierarchy (workflow_id, name, description, workflow_type, status)
            VALUES ($1, $2, $3, 'composite', 'active')
            ON CONFLICT (workflow_id) DO NOTHING
          `, [defaultWorkflowId, `${name} Workflow`, `Auto-generated workflow for ${name}`, 'composite']);
          workflowIdToUse = defaultWorkflowId;
        }

        // Create service
        const serviceResult = await db.query(`
          INSERT INTO workflow_services (
            service_id, workflow_id, name, description, service_type,
            api_config, bundled_endpoints, input_attributes, output_attributes,
            supports_realtime, realtime_config, is_active
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
          RETURNING *
        `, [
          serviceId,
          workflowIdToUse,
          name,
          description,
          service_type,
          JSON.stringify(api_config),
          JSON.stringify(bundled_endpoints.map(e => e.endpoint_id || e)),
          JSON.stringify(input_attributes),
          JSON.stringify(output_attributes),
          supports_realtime,
          JSON.stringify(realtime_config)
        ]);

        const service = serviceResult.rows[0];

        // Bind endpoints to service
        if (bundled_endpoints.length > 0) {
          for (let i = 0; i < bundled_endpoints.length; i++) {
            const endpoint = bundled_endpoints[i];
            const endpointId = typeof endpoint === 'string' ? endpoint : endpoint.endpoint_id;
            
            await db.query(`
              INSERT INTO service_endpoint_bindings (
                binding_id, service_id, endpoint_id, binding_order,
                is_required, input_mapping, output_mapping, is_active
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, true)
            `, [
              `binding-${randomUUID()}`,
              serviceId,
              endpointId,
              endpoint.order || i,
              endpoint.is_required !== undefined ? endpoint.is_required : true,
              JSON.stringify(endpoint.input_mapping || {}),
              JSON.stringify(endpoint.output_mapping || {})
            ]);
          }
        }

        // Create data streams if provided
        if (data_streams.length > 0) {
          for (const stream of data_streams) {
            const streamId = `stream-${randomUUID()}`;
            await db.query(`
              INSERT INTO data_streams (
                stream_id, name, description, source_service_id,
                destination_service_id, stream_type, direction,
                data_format, is_active
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
            `, [
              streamId,
              stream.name || `${name} Stream`,
              stream.description,
              serviceId,
              stream.destination_service_id,
              stream.stream_type || 'websocket',
              stream.direction || 'bidirectional',
              stream.data_format || 'json'
            ]);
          }
        }

        await db.query('COMMIT');

        // Fetch the complete service with associations
        const completeResult = await db.query(`
          SELECT 
            ws.*,
            wh.name as workflow_name
          FROM workflow_services ws
          LEFT JOIN workflow_hierarchy wh ON ws.workflow_id = wh.workflow_id
          WHERE ws.service_id = $1
        `, [serviceId]);

        res.status(201).json({
          success: true,
          data: completeResult.rows[0]
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error creating service:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PUT /api/services/:id
   * Update a service
   */
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        service_type,
        bundled_endpoints,
        api_config,
        input_attributes,
        output_attributes,
        supports_realtime,
        realtime_config,
        is_active
      } = req.body;

      // Check if service exists
      const checkResult = await db.query(
        'SELECT id FROM workflow_services WHERE service_id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
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

      if (service_type !== undefined) {
        updates.push(`service_type = $${paramCount}`);
        params.push(service_type);
        paramCount++;
      }

      if (bundled_endpoints !== undefined) {
        updates.push(`bundled_endpoints = $${paramCount}`);
        params.push(JSON.stringify(bundled_endpoints));
        paramCount++;
      }

      if (api_config !== undefined) {
        updates.push(`api_config = $${paramCount}`);
        params.push(JSON.stringify(api_config));
        paramCount++;
      }

      if (input_attributes !== undefined) {
        updates.push(`input_attributes = $${paramCount}`);
        params.push(JSON.stringify(input_attributes));
        paramCount++;
      }

      if (output_attributes !== undefined) {
        updates.push(`output_attributes = $${paramCount}`);
        params.push(JSON.stringify(output_attributes));
        paramCount++;
      }

      if (supports_realtime !== undefined) {
        updates.push(`supports_realtime = $${paramCount}`);
        params.push(supports_realtime);
        paramCount++;
      }

      if (realtime_config !== undefined) {
        updates.push(`realtime_config = $${paramCount}`);
        params.push(JSON.stringify(realtime_config));
        paramCount++;
      }

      if (is_active !== undefined) {
        updates.push(`is_active = $${paramCount}`);
        params.push(is_active);
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
        UPDATE workflow_services 
        SET ${updates.join(', ')}
        WHERE service_id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, params);

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error updating service:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/services/:id
   * Delete a service
   */
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      // Check if service exists
      const checkResult = await db.query(
        'SELECT id, name FROM workflow_services WHERE service_id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      const serviceName = checkResult.rows[0].name;

      // Delete (cascade will handle related records)
      await db.query('DELETE FROM workflow_services WHERE service_id = $1', [id]);

      res.json({
        success: true,
        message: `Service "${serviceName}" deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================================================
  // ENDPOINT BINDING MANAGEMENT
  // ============================================================================

  /**
   * POST /api/services/:id/endpoints
   * Add an endpoint to a service
   */
  router.post('/:id/endpoints', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        endpoint_id,
        binding_order,
        is_required = true,
        input_mapping = {},
        output_mapping = {}
      } = req.body;

      if (!endpoint_id) {
        return res.status(400).json({
          success: false,
          error: 'endpoint_id is required'
        });
      }

      // Check if service exists
      const serviceCheck = await db.query(
        'SELECT id FROM workflow_services WHERE service_id = $1',
        [id]
      );

      if (serviceCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      // Check if endpoint exists
      const endpointCheck = await db.query(
        'SELECT id FROM api_endpoints WHERE endpoint_id = $1',
        [endpoint_id]
      );

      if (endpointCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Endpoint not found'
        });
      }

      // Add binding
      const bindingId = `binding-${randomUUID()}`;
      const result = await db.query(`
        INSERT INTO service_endpoint_bindings (
          binding_id, service_id, endpoint_id, binding_order,
          is_required, input_mapping, output_mapping, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        RETURNING *
      `, [
        bindingId,
        id,
        endpoint_id,
        binding_order || 0,
        is_required,
        JSON.stringify(input_mapping),
        JSON.stringify(output_mapping)
      ]);

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error adding endpoint to service:', error);
      if (error.code === '23505') { // Unique violation
        res.status(409).json({
          success: false,
          error: 'Endpoint already bound to this service'
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
   * DELETE /api/services/:serviceId/endpoints/:bindingId
   * Remove an endpoint binding from a service
   */
  router.delete('/:serviceId/endpoints/:bindingId', async (req, res) => {
    try {
      const { serviceId, bindingId } = req.params;

      const result = await db.query(
        'DELETE FROM service_endpoint_bindings WHERE binding_id = $1 AND service_id = $2 RETURNING binding_id',
        [bindingId, serviceId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Endpoint binding not found in this service'
        });
      }

      res.json({
        success: true,
        message: 'Endpoint binding removed from service'
      });
    } catch (error) {
      console.error('Error removing endpoint binding:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ============================================================================
  // AVAILABLE ENDPOINTS
  // ============================================================================

  /**
   * GET /api/services/available-endpoints
   * Get all available endpoints that can be bundled
   */
  router.get('/available/endpoints', async (req, res) => {
    try {
      const { category, service_type, method } = req.query;

      let query = 'SELECT * FROM api_endpoints WHERE is_active = true';
      const params = [];
      let paramCount = 1;

      if (category) {
        query += ` AND category = $${paramCount}`;
        params.push(category);
        paramCount++;
      }

      if (service_type) {
        query += ` AND service_type = $${paramCount}`;
        params.push(service_type);
        paramCount++;
      }

      if (method) {
        query += ` AND method = $${paramCount}`;
        params.push(method);
        paramCount++;
      }

      query += ' ORDER BY category, path';

      const result = await db.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching available endpoints:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

export default createServiceManagementRouter;
