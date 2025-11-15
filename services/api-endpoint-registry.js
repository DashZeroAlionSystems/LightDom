/**
 * API Endpoint Registry Service
 * 
 * Manages the API endpoint registry database operations.
 * Provides CRUD operations for endpoints, service bindings, and chains.
 */

import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

class APIEndpointRegistry {
  constructor(dbPool) {
    this.db = dbPool;
  }

  /**
   * Register a new API endpoint
   */
  async registerEndpoint(endpointData) {
    const query = `
      INSERT INTO api_endpoints (
        endpoint_id, title, path, method, description, category, tags,
        route_file, handler_function, middleware,
        request_schema, response_schema, query_params, path_params, headers,
        example_request, example_response, curl_example,
        service_type, requires_auth, rate_limit, timeout_ms,
        is_public, is_active, version,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24, $25, $26
      )
      ON CONFLICT (endpoint_id) 
      DO UPDATE SET
        title = EXCLUDED.title,
        path = EXCLUDED.path,
        method = EXCLUDED.method,
        description = EXCLUDED.description,
        category = EXCLUDED.category,
        tags = EXCLUDED.tags,
        route_file = EXCLUDED.route_file,
        handler_function = EXCLUDED.handler_function,
        request_schema = EXCLUDED.request_schema,
        response_schema = EXCLUDED.response_schema,
        query_params = EXCLUDED.query_params,
        path_params = EXCLUDED.path_params,
        service_type = EXCLUDED.service_type,
        requires_auth = EXCLUDED.requires_auth,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      endpointData.endpoint_id,
      endpointData.title,
      endpointData.path,
      endpointData.method,
      endpointData.description || null,
      endpointData.category || null,
      endpointData.tags || [],
      endpointData.route_file || null,
      endpointData.handler_function || null,
      JSON.stringify(endpointData.middleware || []),
      JSON.stringify(endpointData.request_schema || null),
      JSON.stringify(endpointData.response_schema || null),
      JSON.stringify(endpointData.query_params || []),
      JSON.stringify(endpointData.path_params || []),
      JSON.stringify(endpointData.headers || []),
      JSON.stringify(endpointData.example_request || null),
      JSON.stringify(endpointData.example_response || null),
      endpointData.curl_example || null,
      endpointData.service_type || 'api',
      endpointData.requires_auth || false,
      endpointData.rate_limit || null,
      endpointData.timeout_ms || 30000,
      endpointData.is_public || false,
      endpointData.is_active !== undefined ? endpointData.is_active : true,
      endpointData.version || '1.0.0',
      endpointData.created_by || null
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * Bulk register multiple endpoints
   */
  async bulkRegisterEndpoints(endpoints) {
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const result = await this.registerEndpoint(endpoint);
        results.push({ success: true, endpoint: result });
      } catch (error) {
        results.push({ 
          success: false, 
          endpoint_id: endpoint.endpoint_id, 
          error: error.message 
        });
      }
    }
    
    return results;
  }

  /**
   * Get all endpoints with optional filters
   */
  async getEndpoints(filters = {}) {
    let query = 'SELECT * FROM api_endpoints WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    if (filters.category) {
      query += ` AND category = $${paramIndex}`;
      values.push(filters.category);
      paramIndex++;
    }

    if (filters.method) {
      query += ` AND method = $${paramIndex}`;
      values.push(filters.method);
      paramIndex++;
    }

    if (filters.service_type) {
      query += ` AND service_type = $${paramIndex}`;
      values.push(filters.service_type);
      paramIndex++;
    }

    if (filters.requires_auth !== undefined) {
      query += ` AND requires_auth = $${paramIndex}`;
      values.push(filters.requires_auth);
      paramIndex++;
    }

    if (filters.is_active !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      values.push(filters.is_active);
      paramIndex++;
    }

    if (filters.tags && filters.tags.length > 0) {
      query += ` AND tags && $${paramIndex}`;
      values.push(filters.tags);
      paramIndex++;
    }

    query += ' ORDER BY category, path';

    const result = await this.db.query(query, values);
    return result.rows;
  }

  /**
   * Get endpoint by ID
   */
  async getEndpointById(endpointId) {
    const query = 'SELECT * FROM api_endpoints WHERE endpoint_id = $1';
    const result = await this.db.query(query, [endpointId]);
    return result.rows[0];
  }

  /**
   * Search endpoints by text
   */
  async searchEndpoints(searchTerm) {
    const query = `
      SELECT * FROM api_endpoints 
      WHERE 
        title ILIKE $1 OR
        description ILIKE $1 OR
        path ILIKE $1 OR
        category ILIKE $1 OR
        $2 = ANY(tags)
      ORDER BY 
        CASE 
          WHEN title ILIKE $1 THEN 1
          WHEN path ILIKE $1 THEN 2
          WHEN description ILIKE $1 THEN 3
          ELSE 4
        END
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const result = await this.db.query(query, [searchPattern, searchTerm.toLowerCase()]);
    return result.rows;
  }

  /**
   * Update endpoint
   */
  async updateEndpoint(endpointId, updates) {
    const allowedFields = [
      'title', 'path', 'method', 'description', 'category', 'tags',
      'route_file', 'handler_function', 'middleware',
      'request_schema', 'response_schema', 'query_params', 'path_params',
      'service_type', 'requires_auth', 'rate_limit', 'timeout_ms',
      'is_public', 'is_active', 'version', 'deprecated', 'deprecation_note'
    ];

    const setClause = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramIndex}`);
        
        // Handle JSONB fields
        if (['request_schema', 'response_schema', 'query_params', 'path_params', 'middleware'].includes(key)) {
          values.push(JSON.stringify(updates[key]));
        } else {
          values.push(updates[key]);
        }
        
        paramIndex++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(endpointId);
    const query = `
      UPDATE api_endpoints 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE endpoint_id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete endpoint
   */
  async deleteEndpoint(endpointId) {
    const query = 'DELETE FROM api_endpoints WHERE endpoint_id = $1 RETURNING *';
    const result = await this.db.query(query, [endpointId]);
    return result.rows[0];
  }

  /**
   * Bind endpoint to service
   */
  async bindEndpointToService(serviceId, endpointId, config = {}) {
    const bindingId = config.binding_id || `binding_${uuidv4()}`;
    
    const query = `
      INSERT INTO service_endpoint_bindings (
        binding_id, service_id, endpoint_id,
        binding_order, is_required, condition,
        input_mapping, output_mapping, transform_script,
        retry_policy, fallback_endpoint_id, on_error,
        is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
      RETURNING *
    `;

    const values = [
      bindingId,
      serviceId,
      endpointId,
      config.binding_order || 0,
      config.is_required !== undefined ? config.is_required : true,
      JSON.stringify(config.condition || null),
      JSON.stringify(config.input_mapping || {}),
      JSON.stringify(config.output_mapping || {}),
      config.transform_script || null,
      JSON.stringify(config.retry_policy || { maxRetries: 3, backoff: 'exponential' }),
      config.fallback_endpoint_id || null,
      config.on_error || 'continue',
      config.is_active !== undefined ? config.is_active : true
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get service bindings
   */
  async getServiceBindings(serviceId) {
    const query = `
      SELECT 
        seb.*,
        ae.title as endpoint_title,
        ae.path as endpoint_path,
        ae.method as endpoint_method
      FROM service_endpoint_bindings seb
      JOIN api_endpoints ae ON seb.endpoint_id = ae.endpoint_id
      WHERE seb.service_id = $1
      ORDER BY seb.binding_order
    `;
    
    const result = await this.db.query(query, [serviceId]);
    return result.rows;
  }

  /**
   * Create endpoint chain
   */
  async createEndpointChain(workflowId, chainData) {
    const chainId = chainData.chain_id || `chain_${uuidv4()}`;
    
    const query = `
      INSERT INTO workflow_endpoint_chains (
        chain_id, workflow_id, name, description, chain_type,
        endpoints, data_flow,
        timeout_ms, retry_strategy, rollback_on_error,
        is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
      RETURNING *
    `;

    const values = [
      chainId,
      workflowId,
      chainData.name,
      chainData.description || null,
      chainData.chain_type || 'sequential',
      JSON.stringify(chainData.endpoints),
      JSON.stringify(chainData.data_flow || {}),
      chainData.timeout_ms || 60000,
      JSON.stringify(chainData.retry_strategy || {}),
      chainData.rollback_on_error || false,
      chainData.is_active !== undefined ? chainData.is_active : true
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get endpoint chains for workflow
   */
  async getWorkflowChains(workflowId) {
    const query = `
      SELECT * FROM workflow_endpoint_chains
      WHERE workflow_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await this.db.query(query, [workflowId]);
    return result.rows;
  }

  /**
   * Execute endpoint chain (returns execution plan)
   */
  async getChainExecutionPlan(chainId) {
    const query = 'SELECT * FROM workflow_endpoint_chains WHERE chain_id = $1';
    const result = await this.db.query(query, [chainId]);
    
    if (!result.rows[0]) {
      throw new Error('Chain not found');
    }
    
    const chain = result.rows[0];
    const endpointDetails = [];
    
    // Get details for each endpoint in the chain
    for (const endpointConfig of chain.endpoints) {
      const endpoint = await this.getEndpointById(endpointConfig.endpoint_id);
      if (endpoint) {
        endpointDetails.push({
          ...endpoint,
          config: endpointConfig
        });
      }
    }
    
    return {
      chain,
      endpoints: endpointDetails,
      execution_type: chain.chain_type,
      total_timeout: chain.timeout_ms
    };
  }

  /**
   * Log endpoint execution
   */
  async logExecution(executionData) {
    const query = `
      INSERT INTO endpoint_execution_logs (
        execution_id, endpoint_id, workflow_id, chain_id,
        request_method, request_path, request_params, request_body, request_headers,
        response_status, response_body, response_time_ms,
        started_at, completed_at, status, error_message, error_stack,
        user_id, ip_address, user_agent
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
      RETURNING *
    `;

    const values = [
      executionData.execution_id || `exec_${uuidv4()}`,
      executionData.endpoint_id,
      executionData.workflow_id || null,
      executionData.chain_id || null,
      executionData.request_method,
      executionData.request_path,
      JSON.stringify(executionData.request_params || {}),
      JSON.stringify(executionData.request_body || {}),
      JSON.stringify(executionData.request_headers || {}),
      executionData.response_status || null,
      JSON.stringify(executionData.response_body || {}),
      executionData.response_time_ms || null,
      executionData.started_at,
      executionData.completed_at || null,
      executionData.status,
      executionData.error_message || null,
      executionData.error_stack || null,
      executionData.user_id || null,
      executionData.ip_address || null,
      executionData.user_agent || null
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get endpoint statistics
   */
  async getEndpointStats() {
    const query = `
      SELECT 
        COUNT(*) as total_endpoints,
        COUNT(DISTINCT category) as total_categories,
        COUNT(DISTINCT service_type) as total_service_types,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_endpoints,
        COUNT(CASE WHEN requires_auth = true THEN 1 END) as auth_required_endpoints,
        jsonb_object_agg(method, method_count) as by_method
      FROM (
        SELECT 
          method,
          COUNT(*) as method_count,
          category,
          service_type,
          is_active,
          requires_auth
        FROM api_endpoints
        GROUP BY method, category, service_type, is_active, requires_auth
      ) subquery
    `;
    
    const result = await this.db.query(query);
    return result.rows[0];
  }

  /**
   * Get categories with endpoint counts
   */
  async getCategoriesWithCounts() {
    const query = `
      SELECT 
        category,
        COUNT(*) as endpoint_count,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
      FROM api_endpoints
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY endpoint_count DESC
    `;
    
    const result = await this.db.query(query);
    return result.rows;
  }
}

export default APIEndpointRegistry;
