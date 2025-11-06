/**
 * MCP Server Management CRUD API Routes
 * Handles agent instances with schema linking
 */

import express from 'express';

export function createMCPServerRoutes(db, io) {
  const router = express.Router();

  // ====================================
  // MCP SERVER CRUD OPERATIONS
  // ====================================

  /**
   * GET /api/mcp/servers
   * List all MCP server instances
   */
  router.get('/servers', async (req, res) => {
    try {
      const { active, agentType } = req.query;
      
      let query = `
        SELECT 
          ms.*,
          COUNT(DISTINCT msl.schema_id) as linked_schemas_count,
          json_agg(
            DISTINCT jsonb_build_object(
              'id', s.id,
              'name', s.name,
              'category', s.category
            )
          ) FILTER (WHERE s.id IS NOT NULL) as linked_schemas
        FROM mcp_servers ms
        LEFT JOIN mcp_server_schemas msl ON ms.id = msl.server_id
        LEFT JOIN schemas s ON msl.schema_id = s.id
      `;
      
      const conditions = [];
      const params = [];
      
      if (active !== undefined) {
        conditions.push(`ms.active = $${params.length + 1}`);
        params.push(active === 'true');
      }
      
      if (agentType) {
        conditions.push(`ms.agent_type = $${params.length + 1}`);
        params.push(agentType);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' GROUP BY ms.id ORDER BY ms.created_at DESC';
      
      const result = await db.query(query, params);
      
      res.json({
        success: true,
        servers: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error fetching MCP servers:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/mcp/servers/:id
   * Get a specific MCP server instance
   */
  router.get('/servers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await db.query(
        `SELECT 
          ms.*,
          json_agg(
            DISTINCT jsonb_build_object(
              'id', s.id,
              'name', s.name,
              'category', s.category,
              'schema', s.schema_definition
            )
          ) FILTER (WHERE s.id IS NOT NULL) as linked_schemas,
          json_agg(
            DISTINCT jsonb_build_object(
              'id', mte.id,
              'tool_name', mte.tool_name,
              'timestamp', mte.timestamp,
              'duration', mte.duration,
              'success', mte.error IS NULL
            )
          ) FILTER (WHERE mte.id IS NOT NULL) as recent_executions
        FROM mcp_servers ms
        LEFT JOIN mcp_server_schemas msl ON ms.id = msl.server_id
        LEFT JOIN schemas s ON msl.schema_id = s.id
        LEFT JOIN mcp_tool_executions mte ON ms.id = mte.server_id
        WHERE ms.id = $1
        GROUP BY ms.id`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'MCP server not found'
        });
      }
      
      res.json({
        success: true,
        server: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching MCP server:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/mcp/servers
   * Create a new MCP server instance
   */
  router.post('/servers', async (req, res) => {
    try {
      const {
        name,
        description,
        agent_type,
        model_name,
        endpoint_url,
        topic,
        schema_ids,
        config,
        active
      } = req.body;
      
      // Validate required fields
      if (!name || !agent_type) {
        return res.status(400).json({
          success: false,
          error: 'Name and agent_type are required'
        });
      }
      
      // Insert MCP server
      const serverResult = await db.query(
        `INSERT INTO mcp_servers (
          name, description, agent_type, model_name, endpoint_url,
          topic, config, active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *`,
        [
          name,
          description || null,
          agent_type,
          model_name || 'deepseek-r1',
          endpoint_url || null,
          topic || null,
          JSON.stringify(config || {}),
          active !== false
        ]
      );
      
      const server = serverResult.rows[0];
      
      // Link schemas if provided
      if (schema_ids && Array.isArray(schema_ids) && schema_ids.length > 0) {
        const linkValues = schema_ids.map((schemaId, idx) => 
          `($1, $${idx + 2})`
        ).join(', ');
        
        await db.query(
          `INSERT INTO mcp_server_schemas (server_id, schema_id, linked_at)
           VALUES ${linkValues}`,
          [server.id, ...schema_ids]
        );
      }
      
      // Emit socket event
      if (io) {
        io.emit('mcp-server-created', { server });
      }
      
      res.status(201).json({
        success: true,
        server,
        message: 'MCP server created successfully'
      });
    } catch (error) {
      console.error('Error creating MCP server:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * PUT /api/mcp/servers/:id
   * Update an existing MCP server instance
   */
  router.put('/servers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        description,
        model_name,
        endpoint_url,
        topic,
        schema_ids,
        config,
        active
      } = req.body;
      
      // Update server
      const updateFields = [];
      const updateParams = [id];
      let paramIndex = 2;
      
      if (name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        updateParams.push(name);
      }
      if (description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        updateParams.push(description);
      }
      if (model_name !== undefined) {
        updateFields.push(`model_name = $${paramIndex++}`);
        updateParams.push(model_name);
      }
      if (endpoint_url !== undefined) {
        updateFields.push(`endpoint_url = $${paramIndex++}`);
        updateParams.push(endpoint_url);
      }
      if (topic !== undefined) {
        updateFields.push(`topic = $${paramIndex++}`);
        updateParams.push(topic);
      }
      if (config !== undefined) {
        updateFields.push(`config = $${paramIndex++}`);
        updateParams.push(JSON.stringify(config));
      }
      if (active !== undefined) {
        updateFields.push(`active = $${paramIndex++}`);
        updateParams.push(active);
      }
      
      updateFields.push('updated_at = NOW()');
      
      const result = await db.query(
        `UPDATE mcp_servers 
         SET ${updateFields.join(', ')}
         WHERE id = $1
         RETURNING *`,
        updateParams
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'MCP server not found'
        });
      }
      
      // Update schema links if provided
      if (schema_ids !== undefined && Array.isArray(schema_ids)) {
        // Remove existing links
        await db.query('DELETE FROM mcp_server_schemas WHERE server_id = $1', [id]);
        
        // Add new links
        if (schema_ids.length > 0) {
          const linkValues = schema_ids.map((schemaId, idx) => 
            `($1, $${idx + 2})`
          ).join(', ');
          
          await db.query(
            `INSERT INTO mcp_server_schemas (server_id, schema_id, linked_at)
             VALUES ${linkValues}`,
            [id, ...schema_ids]
          );
        }
      }
      
      // Emit socket event
      if (io) {
        io.emit('mcp-server-updated', { server: result.rows[0] });
      }
      
      res.json({
        success: true,
        server: result.rows[0],
        message: 'MCP server updated successfully'
      });
    } catch (error) {
      console.error('Error updating MCP server:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/mcp/servers/:id
   * Delete an MCP server instance
   */
  router.delete('/servers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Delete schema links first
      await db.query('DELETE FROM mcp_server_schemas WHERE server_id = $1', [id]);
      
      // Delete server
      const result = await db.query(
        'DELETE FROM mcp_servers WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'MCP server not found'
        });
      }
      
      // Emit socket event
      if (io) {
        io.emit('mcp-server-deleted', { id });
      }
      
      res.json({
        success: true,
        message: 'MCP server deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting MCP server:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ====================================
  // SCHEMA MANAGEMENT
  // ====================================

  /**
   * GET /api/mcp/schemas
   * List available schemas for linking
   */
  router.get('/schemas', async (req, res) => {
    try {
      const { category, search } = req.query;
      
      let query = 'SELECT * FROM schemas';
      const conditions = [];
      const params = [];
      
      if (category) {
        conditions.push(`category = $${params.length + 1}`);
        params.push(category);
      }
      
      if (search) {
        conditions.push(`(name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`);
        params.push(`%${search}%`);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY category, name';
      
      const result = await db.query(query, params);
      
      res.json({
        success: true,
        schemas: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error fetching schemas:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * POST /api/mcp/servers/:id/schemas
   * Link schemas to an MCP server
   */
  router.post('/servers/:id/schemas', async (req, res) => {
    try {
      const { id } = req.params;
      const { schema_ids } = req.body;
      
      if (!schema_ids || !Array.isArray(schema_ids)) {
        return res.status(400).json({
          success: false,
          error: 'schema_ids array is required'
        });
      }
      
      // Verify server exists
      const serverCheck = await db.query('SELECT id FROM mcp_servers WHERE id = $1', [id]);
      if (serverCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'MCP server not found'
        });
      }
      
      // Link schemas (ignore duplicates)
      const linkValues = schema_ids.map((schemaId, idx) => 
        `($1, $${idx + 2}, NOW())`
      ).join(', ');
      
      await db.query(
        `INSERT INTO mcp_server_schemas (server_id, schema_id, linked_at)
         VALUES ${linkValues}
         ON CONFLICT (server_id, schema_id) DO NOTHING`,
        [id, ...schema_ids]
      );
      
      res.json({
        success: true,
        message: 'Schemas linked successfully'
      });
    } catch (error) {
      console.error('Error linking schemas:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * DELETE /api/mcp/servers/:id/schemas/:schema_id
   * Unlink a schema from an MCP server
   */
  router.delete('/servers/:id/schemas/:schema_id', async (req, res) => {
    try {
      const { id, schema_id } = req.params;
      
      await db.query(
        'DELETE FROM mcp_server_schemas WHERE server_id = $1 AND schema_id = $2',
        [id, schema_id]
      );
      
      res.json({
        success: true,
        message: 'Schema unlinked successfully'
      });
    } catch (error) {
      console.error('Error unlinking schema:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // ====================================
  // AGENT INSTANCE OPERATIONS
  // ====================================

  /**
   * POST /api/mcp/servers/:id/execute
   * Execute a tool on an MCP server instance
   */
  router.post('/servers/:id/execute', async (req, res) => {
    try {
      const { id } = req.params;
      const { tool_name, args, context } = req.body;
      
      if (!tool_name) {
        return res.status(400).json({
          success: false,
          error: 'tool_name is required'
        });
      }
      
      // Get server details
      const serverResult = await db.query(
        'SELECT * FROM mcp_servers WHERE id = $1 AND active = true',
        [id]
      );
      
      if (serverResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Active MCP server not found'
        });
      }
      
      const server = serverResult.rows[0];
      
      // Get linked schemas for context
      const schemasResult = await db.query(
        `SELECT s.* FROM schemas s
         JOIN mcp_server_schemas msl ON s.id = msl.schema_id
         WHERE msl.server_id = $1`,
        [id]
      );
      
      const linkedSchemas = schemasResult.rows;
      
      // Execute the tool (this would call the actual MCP server endpoint)
      // For now, we'll simulate the execution
      const executionId = `exec-${Date.now()}`;
      const startTime = Date.now();
      
      let result = {
        executionId,
        serverId: id,
        serverName: server.name,
        toolName: tool_name,
        linkedSchemas: linkedSchemas.map(s => ({ id: s.id, name: s.name })),
        timestamp: new Date().toISOString(),
        status: 'success',
        message: `Tool ${tool_name} executed successfully on ${server.name}`
      };
      
      // If server has endpoint, call it
      if (server.endpoint_url) {
        try {
          const response = await fetch(server.endpoint_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tool: tool_name,
              args,
              context: {
                ...context,
                serverId: id,
                topic: server.topic,
                linkedSchemas
              }
            })
          });
          
          if (response.ok) {
            result.data = await response.json();
          } else {
            result.status = 'error';
            result.error = `Server returned ${response.status}`;
          }
        } catch (err) {
          result.status = 'error';
          result.error = err.message;
        }
      }
      
      const duration = Date.now() - startTime;
      
      // Log execution
      await db.query(
        `INSERT INTO mcp_tool_executions 
         (id, server_id, tool_name, args, context, result, error, timestamp, duration)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)`,
        [
          executionId,
          id,
          tool_name,
          JSON.stringify(args || {}),
          JSON.stringify(context || {}),
          JSON.stringify(result.data || {}),
          result.error || null,
          duration
        ]
      );
      
      // Emit socket event
      if (io) {
        io.emit('mcp-tool-executed', { executionId, serverId: id, result });
      }
      
      res.json({
        success: result.status === 'success',
        result
      });
    } catch (error) {
      console.error('Error executing tool:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/mcp/servers/:id/executions
   * Get execution history for an MCP server
   */
  router.get('/servers/:id/executions', async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      const result = await db.query(
        `SELECT * FROM mcp_tool_executions
         WHERE server_id = $1
         ORDER BY timestamp DESC
         LIMIT $2 OFFSET $3`,
        [id, limit, offset]
      );
      
      const countResult = await db.query(
        'SELECT COUNT(*) as total FROM mcp_tool_executions WHERE server_id = $1',
        [id]
      );
      
      res.json({
        success: true,
        executions: result.rows,
        total: parseInt(countResult.rows[0].total)
      });
    } catch (error) {
      console.error('Error fetching executions:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  /**
   * GET /api/mcp/health
   * Get MCP system health status
   */
  router.get('/health', async (req, res) => {
    try {
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total_servers,
          COUNT(*) FILTER (WHERE active = true) as active_servers,
          COUNT(DISTINCT mte.server_id) as servers_with_executions,
          COUNT(mte.id) as total_executions,
          AVG(mte.duration) as avg_execution_time
        FROM mcp_servers ms
        LEFT JOIN mcp_tool_executions mte ON ms.id = mte.server_id
      `);
      
      res.json({
        success: true,
        health: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          stats: stats.rows[0]
        }
      });
    } catch (error) {
      console.error('Error checking health:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

export default createMCPServerRoutes;
