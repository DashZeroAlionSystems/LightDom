/**
 * Data Access Layer for N8N Workflows
 * 
 * Provides database operations for n8n workflow management
 * All workflow data is persisted to PostgreSQL
 */

import { Pool } from 'pg';

export class N8NWorkflowsDAL {
  /**
   * @param {Pool} pool - PostgreSQL connection pool
   */
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Create a new n8n workflow record
   */
  async createWorkflow(workflowData) {
    const {
      workflow_id,
      n8n_id,
      name,
      description,
      workflow_type = 'automation',
      workflow_definition,
      lightdom_workflow_id = null,
      tags = [],
      is_active = true,
      created_by = null
    } = workflowData;

    const query = `
      INSERT INTO n8n_workflows (
        workflow_id, n8n_id, name, description, workflow_type,
        workflow_definition, lightdom_workflow_id, tags, is_active, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      workflow_id,
      n8n_id,
      name,
      description,
      workflow_type,
      JSON.stringify(workflow_definition),
      lightdom_workflow_id,
      JSON.stringify(tags),
      is_active,
      created_by
    ];

    const result = await this.pool.query(query, values);
    return this.transformWorkflowRow(result.rows[0]);
  }

  /**
   * Get workflow by ID
   */
  async getWorkflowById(workflow_id) {
    const query = 'SELECT * FROM n8n_workflows WHERE workflow_id = $1';
    const result = await this.pool.query(query, [workflow_id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformWorkflowRow(result.rows[0]);
  }

  /**
   * Get workflow by n8n instance ID
   */
  async getWorkflowByN8nId(n8n_id) {
    const query = 'SELECT * FROM n8n_workflows WHERE n8n_id = $1';
    const result = await this.pool.query(query, [n8n_id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformWorkflowRow(result.rows[0]);
  }

  /**
   * List all workflows with optional filters
   */
  async listWorkflows(filters = {}) {
    let query = 'SELECT * FROM n8n_workflows WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.workflow_type) {
      query += ` AND workflow_type = $${paramCount}`;
      values.push(filters.workflow_type);
      paramCount++;
    }

    if (filters.is_active !== undefined) {
      query += ` AND is_active = $${paramCount}`;
      values.push(filters.is_active);
      paramCount++;
    }

    if (filters.created_by) {
      query += ` AND created_by = $${paramCount}`;
      values.push(filters.created_by);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      values.push(filters.offset);
    }

    const result = await this.pool.query(query, values);
    return result.rows.map(row => this.transformWorkflowRow(row));
  }

  /**
   * Update workflow
   */
  async updateWorkflow(workflow_id, updates) {
    const allowedFields = [
      'n8n_id', 'name', 'description', 'workflow_type',
      'workflow_definition', 'tags', 'is_active', 'is_synced'
    ];

    const setStatements = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setStatements.push(`${key} = $${paramCount}`);
        
        // Handle JSONB fields
        if (key === 'workflow_definition' || key === 'tags') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
        paramCount++;
      }
    }

    if (setStatements.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Add updated_at
    setStatements.push(`updated_at = NOW()`);
    
    // Add workflow_id parameter
    values.push(workflow_id);

    const query = `
      UPDATE n8n_workflows
      SET ${setStatements.join(', ')}
      WHERE workflow_id = $${paramCount}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformWorkflowRow(result.rows[0]);
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflow_id) {
    const query = 'DELETE FROM n8n_workflows WHERE workflow_id = $1 RETURNING workflow_id';
    const result = await this.pool.query(query, [workflow_id]);
    return result.rows.length > 0;
  }

  /**
   * Mark workflow as synced with n8n
   */
  async markAsSynced(workflow_id, n8n_id) {
    const query = `
      UPDATE n8n_workflows
      SET is_synced = true, n8n_id = $2, last_sync_at = NOW()
      WHERE workflow_id = $1
      RETURNING *
    `;
    const result = await this.pool.query(query, [workflow_id, n8n_id]);
    return result.rows.length > 0 ? this.transformWorkflowRow(result.rows[0]) : null;
  }

  /**
   * Record workflow execution
   */
  async recordExecution(executionData) {
    const {
      execution_id,
      workflow_id,
      n8n_execution_id = null,
      status = 'running',
      mode = 'trigger',
      data = {},
      error = null,
      retry_count = 0
    } = executionData;

    const query = `
      INSERT INTO n8n_workflow_executions (
        execution_id, workflow_id, n8n_execution_id, status, mode,
        data, error, retry_count, started_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;

    const values = [
      execution_id,
      workflow_id,
      n8n_execution_id,
      status,
      mode,
      JSON.stringify(data),
      error,
      retry_count
    ];

    const result = await this.pool.query(query, values);
    return this.transformExecutionRow(result.rows[0]);
  }

  /**
   * Update execution status
   */
  async updateExecutionStatus(execution_id, status, data = {}, error = null) {
    const query = `
      UPDATE n8n_workflow_executions
      SET status = $2, data = $3, error = $4, finished_at = NOW(),
          execution_time_ms = EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000
      WHERE execution_id = $1
      RETURNING *
    `;

    const values = [execution_id, status, JSON.stringify(data), error];
    const result = await this.pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformExecutionRow(result.rows[0]);
  }

  /**
   * Get execution by ID
   */
  async getExecutionById(execution_id) {
    const query = 'SELECT * FROM n8n_workflow_executions WHERE execution_id = $1';
    const result = await this.pool.query(query, [execution_id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.transformExecutionRow(result.rows[0]);
  }

  /**
   * List executions for a workflow
   */
  async listExecutions(workflow_id, limit = 50) {
    const query = `
      SELECT * FROM n8n_workflow_executions
      WHERE workflow_id = $1
      ORDER BY started_at DESC
      LIMIT $2
    `;
    const result = await this.pool.query(query, [workflow_id, limit]);
    return result.rows.map(row => this.transformExecutionRow(row));
  }

  /**
   * Get workflow statistics
   */
  async getWorkflowStats(workflow_id) {
    const query = `
      SELECT 
        COUNT(*) as total_executions,
        COUNT(*) FILTER (WHERE status = 'success') as successful_executions,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_executions,
        COUNT(*) FILTER (WHERE status = 'running') as running_executions,
        AVG(execution_time_ms) as avg_execution_time_ms,
        MAX(started_at) as last_execution_at
      FROM n8n_workflow_executions
      WHERE workflow_id = $1
    `;
    const result = await this.pool.query(query, [workflow_id]);
    return result.rows[0];
  }

  /**
   * Get system-wide workflow metrics
   */
  async getSystemMetrics() {
    const query = `
      SELECT 
        COUNT(*) as total_workflows,
        COUNT(*) FILTER (WHERE is_active = true) as active_workflows,
        COUNT(DISTINCT workflow_type) as workflow_types,
        (SELECT COUNT(*) FROM n8n_workflow_executions WHERE status = 'running') as running_executions,
        (SELECT COUNT(*) FROM n8n_workflow_executions WHERE started_at >= NOW() - INTERVAL '24 hours') as executions_last_24h
      FROM n8n_workflows
    `;
    const result = await this.pool.query(query);
    return result.rows[0];
  }

  /**
   * Transform database row to workflow object
   */
  transformWorkflowRow(row) {
    if (!row) return null;
    
    return {
      id: row.id,
      workflow_id: row.workflow_id,
      n8n_id: row.n8n_id,
      name: row.name,
      description: row.description,
      workflow_type: row.workflow_type,
      workflow_definition: typeof row.workflow_definition === 'string' 
        ? JSON.parse(row.workflow_definition) 
        : row.workflow_definition,
      lightdom_workflow_id: row.lightdom_workflow_id,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
      is_active: row.is_active,
      is_synced: row.is_synced,
      last_sync_at: row.last_sync_at,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  /**
   * Transform database row to execution object
   */
  transformExecutionRow(row) {
    if (!row) return null;
    
    return {
      id: row.id,
      execution_id: row.execution_id,
      workflow_id: row.workflow_id,
      n8n_execution_id: row.n8n_execution_id,
      status: row.status,
      mode: row.mode,
      started_at: row.started_at,
      finished_at: row.finished_at,
      execution_time_ms: row.execution_time_ms,
      data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
      error: row.error,
      retry_count: row.retry_count,
      created_at: row.created_at
    };
  }
}

export default N8NWorkflowsDAL;
