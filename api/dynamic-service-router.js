/**
 * Dynamic Service Router
 * 
 * Provides dynamic routing for service-based endpoint access
 * Pattern: /api/:serviceName/data-stream/:endpointName
 * 
 * This allows services to expose their bundled endpoints through a unified interface
 */

import express from 'express';

export function createDynamicServiceRouter(db) {
  const router = express.Router();

  /**
   * Dynamic route handler for service-based endpoint access
   * GET/POST/PUT/DELETE /api/service/:serviceName/data-stream/:endpointName
   */
  router.all('/:serviceName/data-stream/:endpointName', async (req, res) => {
    try {
      const { serviceName, endpointName } = req.params;

      // Find the service by name
      const serviceResult = await db.query(`
        SELECT ws.*, ae.path, ae.method, ae.endpoint_id
        FROM workflow_services ws
        JOIN service_endpoint_bindings seb ON ws.service_id = seb.service_id
        JOIN api_endpoints ae ON seb.endpoint_id = ae.endpoint_id
        WHERE LOWER(ws.name) = LOWER($1) 
          AND (LOWER(ae.title) = LOWER($2) OR ae.endpoint_id = $2)
          AND ws.is_active = true
          AND seb.is_active = true
      `, [serviceName, endpointName]);

      if (serviceResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: `Service "${serviceName}" with endpoint "${endpointName}" not found`
        });
      }

      const binding = serviceResult.rows[0];

      // Verify method matches
      if (binding.method.toUpperCase() !== req.method.toUpperCase()) {
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} not allowed for this endpoint. Expected ${binding.method}`
        });
      }

      // Log the access
      await db.query(`
        INSERT INTO endpoint_execution_logs (
          execution_id, endpoint_id, workflow_id, request_method,
          request_path, request_params, request_body, started_at, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'success')
      `, [
        `exec-${Date.now()}`,
        binding.endpoint_id,
        binding.workflow_id,
        req.method,
        req.path,
        JSON.stringify(req.params),
        JSON.stringify(req.body)
      ]).catch(err => console.error('Failed to log execution:', err));

      // For demonstration, return metadata about the endpoint
      // In a real implementation, this would proxy to the actual endpoint
      res.json({
        success: true,
        message: `Endpoint "${endpointName}" accessed through service "${serviceName}"`,
        data: {
          service: {
            name: binding.name,
            service_id: binding.service_id,
            service_type: binding.service_type
          },
          endpoint: {
            endpoint_id: binding.endpoint_id,
            path: binding.path,
            method: binding.method
          },
          request: {
            method: req.method,
            params: req.params,
            query: req.query,
            body: req.body
          }
        }
      });

    } catch (error) {
      console.error('Error in dynamic service router:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * List all endpoints for a service
   * GET /api/service/:serviceName/endpoints
   */
  router.get('/:serviceName/endpoints', async (req, res) => {
    try {
      const { serviceName } = req.params;

      const result = await db.query(`
        SELECT 
          ws.name as service_name,
          ws.service_type,
          ae.endpoint_id,
          ae.title,
          ae.path,
          ae.method,
          ae.description,
          ae.category,
          seb.binding_order,
          seb.is_required
        FROM workflow_services ws
        JOIN service_endpoint_bindings seb ON ws.service_id = seb.service_id
        JOIN api_endpoints ae ON seb.endpoint_id = ae.endpoint_id
        WHERE LOWER(ws.name) = LOWER($1) 
          AND ws.is_active = true
          AND seb.is_active = true
        ORDER BY seb.binding_order
      `, [serviceName]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: `Service "${serviceName}" not found or has no endpoints`
        });
      }

      res.json({
        success: true,
        data: {
          service: {
            name: result.rows[0].service_name,
            service_type: result.rows[0].service_type,
          },
          endpoints: result.rows.map(row => ({
            endpoint_id: row.endpoint_id,
            title: row.title,
            path: row.path,
            method: row.method,
            description: row.description,
            category: row.category,
            binding_order: row.binding_order,
            is_required: row.is_required,
            access_url: `/api/service/${serviceName}/data-stream/${row.endpoint_id}`
          }))
        }
      });
    } catch (error) {
      console.error('Error listing service endpoints:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

export default createDynamicServiceRouter;
