/**
 * DeepSeek Workflow CRUD Service
 * 
 * Comprehensive CRUD operations for DeepSeek-powered n8n workflow system
 * Features:
 * - Self-generating schemas
 * - Workflow orchestration
 * - Long-running task management
 * - Prompt template management
 * - Real-time monitoring
 */

import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export interface PromptTemplate {
  template_id: string;
  name: string;
  description?: string;
  category: 'workflow' | 'schema' | 'component' | 'analysis' | 'optimization';
  template_content: string;
  variables: string[];
  examples?: Array<{ input: Record<string, any>; output: string }>;
  metadata?: Record<string, any>;
  version?: string;
  is_active?: boolean;
}

export interface GeneratedSchema {
  schema_id: string;
  name: string;
  description?: string;
  schema_type: 'json-schema' | 'graphql' | 'database' | 'component';
  schema_content: Record<string, any>;
  relationships?: Array<{ to_schema_id: string; type: string }>;
  validation_rules?: Record<string, any>;
}

export interface OrchestratedWorkflow {
  workflow_id: string;
  name: string;
  description?: string;
  workflow_type: 'sequential' | 'parallel' | 'dag' | 'event-driven';
  configuration: Record<string, any>;
  schedule?: Record<string, any>;
  retry_policy?: Record<string, any>;
  timeout_seconds?: number;
  priority?: number;
  tags?: string[];
  is_template?: boolean;
  status?: 'draft' | 'active' | 'paused' | 'archived';
}

export interface OrchestratedTask {
  task_id: string;
  workflow_id: string;
  name: string;
  description?: string;
  task_type: 'deepseek' | 'n8n' | 'crawler' | 'api' | 'database' | 'custom';
  handler_config: Record<string, any>;
  dependencies?: string[];
  retry_policy?: Record<string, any>;
  timeout_seconds?: number;
  ordering: number;
  is_optional?: boolean;
  conditional_logic?: Record<string, any>;
}

export interface WorkflowRun {
  run_id: string;
  workflow_id: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'waiting';
  execution_mode: 'auto' | 'manual' | 'scheduled' | 'triggered';
  trigger_data?: Record<string, any>;
  progress_percentage?: number;
  current_task_id?: string;
  started_at?: Date;
  completed_at?: Date;
  execution_time_ms?: number;
  result_data?: Record<string, any>;
  error?: string;
}

export interface LongRunningTask {
  task_id: string;
  execution_id: string;
  task_type: string;
  external_id?: string;
  status: 'submitted' | 'processing' | 'completed' | 'failed';
  status_url?: string;
  polling_interval_seconds?: number;
  max_polling_attempts?: number;
  current_polling_attempts?: number;
  result_data?: Record<string, any>;
}

export class DeepSeekWorkflowCRUDService {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  // =========================================================================
  // PROMPT TEMPLATE CRUD
  // =========================================================================

  async createPromptTemplate(template: Partial<PromptTemplate>): Promise<PromptTemplate> {
    const template_id = template.template_id || `prompt_${uuidv4()}`;
    
    const query = `
      INSERT INTO prompt_templates 
        (template_id, name, description, category, template_content, variables, examples, metadata, version, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      template_id,
      template.name,
      template.description,
      template.category,
      template.template_content,
      JSON.stringify(template.variables || []),
      JSON.stringify(template.examples || []),
      JSON.stringify(template.metadata || {}),
      template.version || '1.0.0',
      template.is_active !== false
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getPromptTemplate(template_id: string): Promise<PromptTemplate | null> {
    const query = 'SELECT * FROM prompt_templates WHERE template_id = $1';
    const result = await this.db.query(query, [template_id]);
    return result.rows[0] || null;
  }

  async listPromptTemplates(filters?: {
    category?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ templates: PromptTemplate[]; total: number }> {
    let whereClause = '';
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.category) {
      whereClause += `WHERE category = $${paramCount}`;
      params.push(filters.category);
      paramCount++;
    }

    if (filters?.is_active !== undefined) {
      whereClause += (whereClause ? ' AND ' : 'WHERE ') + `is_active = $${paramCount}`;
      params.push(filters.is_active);
      paramCount++;
    }

    const countQuery = `SELECT COUNT(*) FROM prompt_templates ${whereClause}`;
    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    params.push(limit, offset);

    const query = `
      SELECT * FROM prompt_templates ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await this.db.query(query, params);
    return { templates: result.rows, total };
  }

  async updatePromptTemplate(template_id: string, updates: Partial<PromptTemplate>): Promise<PromptTemplate | null> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = ['name', 'description', 'template_content', 'variables', 'examples', 'metadata', 'is_active'];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(['variables', 'examples', 'metadata'].includes(key) ? JSON.stringify(value) : value);
        paramCount++;
      }
    }

    if (setClause.length === 0) return null;

    values.push(template_id);
    const query = `
      UPDATE prompt_templates
      SET ${setClause.join(', ')}
      WHERE template_id = $${paramCount}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deletePromptTemplate(template_id: string): Promise<boolean> {
    const query = 'DELETE FROM prompt_templates WHERE template_id = $1';
    const result = await this.db.query(query, [template_id]);
    return result.rowCount > 0;
  }

  // =========================================================================
  // SCHEMA GENERATION CRUD
  // =========================================================================

  async createSchema(schema: Partial<GeneratedSchema>): Promise<GeneratedSchema> {
    const schema_id = schema.schema_id || `schema_${uuidv4()}`;
    
    const query = `
      INSERT INTO generated_schemas 
        (schema_id, name, description, schema_type, schema_content, relationships, validation_rules)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      schema_id,
      schema.name,
      schema.description,
      schema.schema_type,
      JSON.stringify(schema.schema_content),
      JSON.stringify(schema.relationships || []),
      JSON.stringify(schema.validation_rules || {})
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getSchema(schema_id: string): Promise<GeneratedSchema | null> {
    const query = 'SELECT * FROM generated_schemas WHERE schema_id = $1';
    const result = await this.db.query(query, [schema_id]);
    return result.rows[0] || null;
  }

  async listSchemas(filters?: {
    schema_type?: string;
    is_validated?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ schemas: GeneratedSchema[]; total: number }> {
    let whereClause = '';
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.schema_type) {
      whereClause += `WHERE schema_type = $${paramCount}`;
      params.push(filters.schema_type);
      paramCount++;
    }

    if (filters?.is_validated !== undefined) {
      whereClause += (whereClause ? ' AND ' : 'WHERE ') + `is_validated = $${paramCount}`;
      params.push(filters.is_validated);
      paramCount++;
    }

    const countQuery = `SELECT COUNT(*) FROM generated_schemas ${whereClause}`;
    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    params.push(limit, offset);

    const query = `
      SELECT * FROM generated_schemas ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await this.db.query(query, params);
    return { schemas: result.rows, total };
  }

  async linkSchemas(from_schema_id: string, to_schema_id: string, relationship_type: string, relationship_name?: string): Promise<void> {
    const query = `
      INSERT INTO schema_relationships (from_schema_id, to_schema_id, relationship_type, relationship_name, metadata)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (from_schema_id, to_schema_id, relationship_type) DO NOTHING
    `;
    
    await this.db.query(query, [from_schema_id, to_schema_id, relationship_type, relationship_name, JSON.stringify({})]);
  }

  // =========================================================================
  // WORKFLOW CRUD
  // =========================================================================

  async createWorkflow(workflow: Partial<OrchestratedWorkflow>): Promise<OrchestratedWorkflow> {
    const workflow_id = workflow.workflow_id || `workflow_${uuidv4()}`;
    
    const query = `
      INSERT INTO orchestrated_workflows 
        (workflow_id, name, description, workflow_type, configuration, schedule, retry_policy, 
         timeout_seconds, priority, tags, is_template, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const values = [
      workflow_id,
      workflow.name,
      workflow.description,
      workflow.workflow_type || 'sequential',
      JSON.stringify(workflow.configuration || {}),
      JSON.stringify(workflow.schedule || {}),
      JSON.stringify(workflow.retry_policy || {}),
      workflow.timeout_seconds || 3600,
      workflow.priority || 5,
      JSON.stringify(workflow.tags || []),
      workflow.is_template || false,
      workflow.status || 'draft'
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getWorkflow(workflow_id: string): Promise<OrchestratedWorkflow | null> {
    const query = 'SELECT * FROM orchestrated_workflows WHERE workflow_id = $1';
    const result = await this.db.query(query, [workflow_id]);
    return result.rows[0] || null;
  }

  async listWorkflows(filters?: {
    workflow_type?: string;
    status?: string;
    is_template?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ workflows: OrchestratedWorkflow[]; total: number }> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.workflow_type) {
      conditions.push(`workflow_type = $${paramCount}`);
      params.push(filters.workflow_type);
      paramCount++;
    }

    if (filters?.status) {
      conditions.push(`status = $${paramCount}`);
      params.push(filters.status);
      paramCount++;
    }

    if (filters?.is_template !== undefined) {
      conditions.push(`is_template = $${paramCount}`);
      params.push(filters.is_template);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) FROM orchestrated_workflows ${whereClause}`;
    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    params.push(limit, offset);

    const query = `
      SELECT * FROM orchestrated_workflows ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await this.db.query(query, params);
    return { workflows: result.rows, total };
  }

  async updateWorkflow(workflow_id: string, updates: Partial<OrchestratedWorkflow>): Promise<OrchestratedWorkflow | null> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = ['name', 'description', 'workflow_type', 'configuration', 'schedule', 
                           'retry_policy', 'timeout_seconds', 'priority', 'tags', 'status'];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(['configuration', 'schedule', 'retry_policy', 'tags'].includes(key) ? JSON.stringify(value) : value);
        paramCount++;
      }
    }

    if (setClause.length === 0) return null;

    values.push(workflow_id);
    const query = `
      UPDATE orchestrated_workflows
      SET ${setClause.join(', ')}
      WHERE workflow_id = $${paramCount}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteWorkflow(workflow_id: string): Promise<boolean> {
    const query = 'DELETE FROM orchestrated_workflows WHERE workflow_id = $1';
    const result = await this.db.query(query, [workflow_id]);
    return result.rowCount > 0;
  }

  // =========================================================================
  // TASK CRUD
  // =========================================================================

  async createTask(task: Partial<OrchestratedTask>): Promise<OrchestratedTask> {
    const task_id = task.task_id || `task_${uuidv4()}`;
    
    const query = `
      INSERT INTO orchestrated_tasks 
        (task_id, workflow_id, name, description, task_type, handler_config, dependencies, 
         retry_policy, timeout_seconds, ordering, is_optional, conditional_logic)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    
    const values = [
      task_id,
      task.workflow_id,
      task.name,
      task.description,
      task.task_type,
      JSON.stringify(task.handler_config),
      JSON.stringify(task.dependencies || []),
      JSON.stringify(task.retry_policy || {}),
      task.timeout_seconds || 600,
      task.ordering,
      task.is_optional || false,
      JSON.stringify(task.conditional_logic || {})
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getTask(task_id: string): Promise<OrchestratedTask | null> {
    const query = 'SELECT * FROM orchestrated_tasks WHERE task_id = $1';
    const result = await this.db.query(query, [task_id]);
    return result.rows[0] || null;
  }

  async listTasksForWorkflow(workflow_id: string): Promise<OrchestratedTask[]> {
    const query = `
      SELECT * FROM orchestrated_tasks 
      WHERE workflow_id = $1 
      ORDER BY ordering ASC
    `;
    const result = await this.db.query(query, [workflow_id]);
    return result.rows;
  }

  async updateTask(task_id: string, updates: Partial<OrchestratedTask>): Promise<OrchestratedTask | null> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = ['name', 'description', 'task_type', 'handler_config', 'dependencies', 
                           'retry_policy', 'timeout_seconds', 'ordering', 'is_optional', 'conditional_logic'];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        const jsonFields = ['handler_config', 'dependencies', 'retry_policy', 'conditional_logic'];
        values.push(jsonFields.includes(key) ? JSON.stringify(value) : value);
        paramCount++;
      }
    }

    if (setClause.length === 0) return null;

    values.push(task_id);
    const query = `
      UPDATE orchestrated_tasks
      SET ${setClause.join(', ')}
      WHERE task_id = $${paramCount}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteTask(task_id: string): Promise<boolean> {
    const query = 'DELETE FROM orchestrated_tasks WHERE task_id = $1';
    const result = await this.db.query(query, [task_id]);
    return result.rowCount > 0;
  }

  // =========================================================================
  // WORKFLOW EXECUTION
  // =========================================================================

  async createWorkflowRun(run: Partial<WorkflowRun>): Promise<WorkflowRun> {
    const run_id = run.run_id || `run_${uuidv4()}`;
    
    const query = `
      INSERT INTO orchestrated_workflow_runs 
        (run_id, workflow_id, status, execution_mode, trigger_data, progress_percentage)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      run_id,
      run.workflow_id,
      run.status || 'pending',
      run.execution_mode || 'auto',
      JSON.stringify(run.trigger_data || {}),
      run.progress_percentage || 0
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getWorkflowRun(run_id: string): Promise<WorkflowRun | null> {
    const query = 'SELECT * FROM orchestrated_workflow_runs WHERE run_id = $1';
    const result = await this.db.query(query, [run_id]);
    return result.rows[0] || null;
  }

  async updateWorkflowRun(run_id: string, updates: Partial<WorkflowRun>): Promise<WorkflowRun | null> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = ['status', 'progress_percentage', 'current_task_id', 'completed_at', 
                           'execution_time_ms', 'result_data', 'error'];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(['result_data'].includes(key) ? JSON.stringify(value) : value);
        paramCount++;
      }
    }

    if (setClause.length === 0) return null;

    values.push(run_id);
    const query = `
      UPDATE orchestrated_workflow_runs
      SET ${setClause.join(', ')}
      WHERE run_id = $${paramCount}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async listWorkflowRuns(workflow_id: string, filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ runs: WorkflowRun[]; total: number }> {
    const conditions: string[] = [`workflow_id = $1`];
    const params: any[] = [workflow_id];
    let paramCount = 2;

    if (filters?.status) {
      conditions.push(`status = $${paramCount}`);
      params.push(filters.status);
      paramCount++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const countQuery = `SELECT COUNT(*) FROM orchestrated_workflow_runs ${whereClause}`;
    const countResult = await this.db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    params.push(limit, offset);

    const query = `
      SELECT * FROM orchestrated_workflow_runs ${whereClause}
      ORDER BY started_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await this.db.query(query, params);
    return { runs: result.rows, total };
  }

  // =========================================================================
  // LONG-RUNNING TASK MANAGEMENT
  // =========================================================================

  async createLongRunningTask(task: Partial<LongRunningTask>): Promise<LongRunningTask> {
    const task_id = task.task_id || `lrt_${uuidv4()}`;
    
    const query = `
      INSERT INTO long_running_tasks 
        (task_id, execution_id, task_type, external_id, status, status_url, 
         polling_interval_seconds, max_polling_attempts, next_poll_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() + ($7 || ' seconds')::interval)
      RETURNING *
    `;
    
    const polling_interval = task.polling_interval_seconds || 5;
    
    const values = [
      task_id,
      task.execution_id,
      task.task_type,
      task.external_id,
      task.status || 'submitted',
      task.status_url,
      polling_interval,
      task.max_polling_attempts || 1000
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getLongRunningTask(task_id: string): Promise<LongRunningTask | null> {
    const query = 'SELECT * FROM long_running_tasks WHERE task_id = $1';
    const result = await this.db.query(query, [task_id]);
    return result.rows[0] || null;
  }

  async getTasksReadyForPolling(limit: number = 10): Promise<LongRunningTask[]> {
    const query = `
      SELECT * FROM long_running_tasks 
      WHERE status IN ('submitted', 'processing')
        AND next_poll_at <= NOW()
        AND current_polling_attempts < max_polling_attempts
      ORDER BY next_poll_at ASC
      LIMIT $1
    `;
    const result = await this.db.query(query, [limit]);
    return result.rows;
  }

  async updateLongRunningTask(task_id: string, updates: Partial<LongRunningTask>): Promise<LongRunningTask | null> {
    const setClause: string[] = ['current_polling_attempts = current_polling_attempts + 1', 'last_polled_at = NOW()'];
    const values: any[] = [];
    let paramCount = 1;

    const allowedFields = ['status', 'result_data', 'error'];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(['result_data'].includes(key) ? JSON.stringify(value) : value);
        paramCount++;
      }
    }

    // Update next_poll_at if still polling
    if (updates.status === 'processing' || updates.status === 'submitted') {
      setClause.push(`next_poll_at = NOW() + (polling_interval_seconds || ' seconds')::interval`);
    }

    values.push(task_id);
    const query = `
      UPDATE long_running_tasks
      SET ${setClause.join(', ')}
      WHERE task_id = $${paramCount}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async recordPollingAttempt(task_id: string, status: string, response_data: any, http_status_code?: number, error?: string): Promise<void> {
    const query = `
      INSERT INTO task_polling_history 
        (task_id, status, response_data, http_status_code, error)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    await this.db.query(query, [
      task_id,
      status,
      JSON.stringify(response_data),
      http_status_code,
      error
    ]);
  }

  // =========================================================================
  // METRICS & MONITORING
  // =========================================================================

  async getWorkflowMetrics(workflow_id: string, start_date?: Date, end_date?: Date): Promise<any[]> {
    const query = `
      SELECT * FROM workflow_metrics 
      WHERE workflow_id = $1
        AND metric_date >= $2
        AND metric_date <= $3
      ORDER BY metric_date DESC
    `;
    
    const startDate = start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = end_date || new Date();
    
    const result = await this.db.query(query, [workflow_id, startDate, endDate]);
    return result.rows;
  }

  async getSystemHealthMetrics(limit: number = 10): Promise<any[]> {
    const query = `
      SELECT * FROM system_health_metrics 
      ORDER BY metric_timestamp DESC
      LIMIT $1
    `;
    const result = await this.db.query(query, [limit]);
    return result.rows;
  }

  async recordSystemHealth(metrics: {
    active_workflows?: number;
    running_tasks?: number;
    queued_tasks?: number;
    deepseek_queue_size?: number;
    avg_response_time_ms?: number;
    error_rate_percentage?: number;
    cpu_usage_percentage?: number;
    memory_usage_mb?: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const query = `
      INSERT INTO system_health_metrics 
        (active_workflows, running_tasks, queued_tasks, deepseek_queue_size, 
         avg_response_time_ms, error_rate_percentage, cpu_usage_percentage, 
         memory_usage_mb, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    
    await this.db.query(query, [
      metrics.active_workflows,
      metrics.running_tasks,
      metrics.queued_tasks,
      metrics.deepseek_queue_size,
      metrics.avg_response_time_ms,
      metrics.error_rate_percentage,
      metrics.cpu_usage_percentage,
      metrics.memory_usage_mb,
      JSON.stringify(metrics.metadata || {})
    ]);
  }
}
