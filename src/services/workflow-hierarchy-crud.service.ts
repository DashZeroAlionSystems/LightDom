/**
 * Workflow Hierarchy CRUD Service with DeepSeek Integration
 * 
 * Features:
 * - Complete CRUD for workflows, services, streams, and dashboards
 * - Automatic schema generation
 * - DeepSeek-powered workflow creation from natural language
 * - Real-time data stream management
 * - Hierarchy management and navigation
 */

import { Pool } from 'pg';
import { DeepSeekIntegrationService } from './deepseek-integration.service';

export interface WorkflowHierarchy {
  workflow_id: string;
  name: string;
  description?: string;
  parent_workflow_id?: string;
  hierarchy_level: number;
  hierarchy_path?: string;
  workflow_type: 'root' | 'composite' | 'atomic';
  category?: string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
  tags?: string[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  version: string;
  is_template: boolean;
  template_id?: string;
  auto_schema?: Record<string, any>;
  schema_version?: string;
}

export interface WorkflowService {
  service_id: string;
  workflow_id: string;
  name: string;
  description?: string;
  service_type: 'api' | 'data-processor' | 'ai-engine' | 'database' | 'notification';
  api_config?: Record<string, any>;
  bundled_endpoints?: any[];
  input_attributes?: any[];
  output_attributes?: any[];
  attribute_mappings?: Record<string, any>;
  supports_realtime: boolean;
  realtime_config?: Record<string, any>;
  stream_direction: 'inbound' | 'outbound' | 'bidirectional';
  auto_schema?: Record<string, any>;
  service_order: number;
  is_active: boolean;
}

export interface DataStream {
  stream_id: string;
  name: string;
  description?: string;
  source_service_id: string;
  destination_service_id: string;
  stream_type: 'websocket' | 'sse' | 'polling' | 'webhook';
  direction: 'source-to-destination' | 'destination-to-source' | 'bidirectional';
  data_format: 'json' | 'xml' | 'binary' | 'text';
  data_schema?: Record<string, any>;
  attribute_bindings?: any[];
  realtime_protocol?: string;
  polling_interval_ms?: number;
  buffer_size: number;
  retry_policy?: Record<string, any>;
  is_active: boolean;
}

export interface WorkflowDashboard {
  dashboard_id: string;
  workflow_id: string;
  name: string;
  description?: string;
  dashboard_type: 'monitoring' | 'analytics' | 'control' | 'reporting';
  layout_config?: Record<string, any>;
  widget_config?: any[];
  connected_services?: string[];
  data_refresh_interval_ms: number;
  supports_realtime: boolean;
  realtime_update_config?: Record<string, any>;
  auto_schema?: Record<string, any>;
  is_public: boolean;
  allowed_roles?: string[];
}

export class WorkflowHierarchyCRUDService {
  private db: Pool;
  private deepseek?: DeepSeekIntegrationService;

  constructor(db: Pool, deepseek?: DeepSeekIntegrationService) {
    this.db = db;
    this.deepseek = deepseek;
  }

  // ===================================================================
  // WORKFLOW CRUD OPERATIONS
  // ===================================================================

  /**
   * Create a new workflow in the hierarchy
   */
  async createWorkflow(workflow: Partial<WorkflowHierarchy>): Promise<WorkflowHierarchy> {
    const workflowId = workflow.workflow_id || `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate hierarchy level and path
    let hierarchyLevel = 0;
    let hierarchyPath = `/${workflowId}`;
    
    if (workflow.parent_workflow_id) {
      const parent = await this.getWorkflow(workflow.parent_workflow_id);
      if (parent) {
        hierarchyLevel = parent.hierarchy_level + 1;
        hierarchyPath = `${parent.hierarchy_path}/${workflowId}`;
      }
    }

    // Generate auto-schema
    const autoSchema = await this.generateWorkflowSchema(workflow);

    const query = `
      INSERT INTO workflow_hierarchy (
        workflow_id, name, description, parent_workflow_id, hierarchy_level, hierarchy_path,
        workflow_type, category, config, metadata, tags, status, version, is_template,
        template_id, auto_schema, schema_version, schema_last_generated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const values = [
      workflowId,
      workflow.name,
      workflow.description,
      workflow.parent_workflow_id,
      hierarchyLevel,
      hierarchyPath,
      workflow.workflow_type || 'atomic',
      workflow.category,
      JSON.stringify(workflow.config || {}),
      JSON.stringify(workflow.metadata || {}),
      workflow.tags || [],
      workflow.status || 'draft',
      workflow.version || '1.0.0',
      workflow.is_template || false,
      workflow.template_id,
      JSON.stringify(autoSchema),
      '1.0.0',
      new Date()
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * Get workflow by ID with complete hierarchy info
   */
  async getWorkflow(workflowId: string): Promise<WorkflowHierarchy | null> {
    const query = `SELECT * FROM workflow_hierarchy WHERE workflow_id = $1`;
    const result = await this.db.query(query, [workflowId]);
    return result.rows[0] || null;
  }

  /**
   * Get complete workflow with all related entities
   */
  async getWorkflowComplete(workflowId: string): Promise<any> {
    const query = `SELECT * FROM workflow_complete_hierarchy WHERE workflow_id = $1`;
    const result = await this.db.query(query, [workflowId]);
    return result.rows[0] || null;
  }

  /**
   * Update workflow
   */
  async updateWorkflow(workflowId: string, updates: Partial<WorkflowHierarchy>): Promise<WorkflowHierarchy> {
    // Regenerate schema if config or structure changed
    if (updates.config || updates.metadata) {
      updates.auto_schema = await this.generateWorkflowSchema({ workflow_id: workflowId, ...updates });
      updates.schema_version = this.incrementVersion(updates.schema_version || '1.0.0');
    }

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'workflow_id') {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(typeof value === 'object' && value !== null ? JSON.stringify(value) : value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(workflowId);
    const query = `
      UPDATE workflow_hierarchy 
      SET ${updateFields.join(', ')}
      WHERE workflow_id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete workflow and all related entities
   */
  async deleteWorkflow(workflowId: string): Promise<boolean> {
    const query = `DELETE FROM workflow_hierarchy WHERE workflow_id = $1`;
    const result = await this.db.query(query, [workflowId]);
    return result.rowCount > 0;
  }

  /**
   * List workflows with filtering and pagination
   */
  async listWorkflows(filters?: {
    parent_id?: string;
    category?: string;
    status?: string;
    hierarchy_level?: number;
    limit?: number;
    offset?: number;
  }): Promise<WorkflowHierarchy[]> {
    let query = `SELECT * FROM workflow_hierarchy WHERE 1=1`;
    const values: any[] = [];
    let paramIndex = 1;

    if (filters?.parent_id) {
      query += ` AND parent_workflow_id = $${paramIndex}`;
      values.push(filters.parent_id);
      paramIndex++;
    }

    if (filters?.category) {
      query += ` AND category = $${paramIndex}`;
      values.push(filters.category);
      paramIndex++;
    }

    if (filters?.status) {
      query += ` AND status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }

    if (filters?.hierarchy_level !== undefined) {
      query += ` AND hierarchy_level = $${paramIndex}`;
      values.push(filters.hierarchy_level);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC`;

    if (filters?.limit) {
      query += ` LIMIT $${paramIndex}`;
      values.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      query += ` OFFSET $${paramIndex}`;
      values.push(filters.offset);
    }

    const result = await this.db.query(query, values);
    return result.rows;
  }

  // ===================================================================
  // SERVICE CRUD OPERATIONS
  // ===================================================================

  async createService(service: Partial<WorkflowService>): Promise<WorkflowService> {
    const serviceId = service.service_id || `svc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const autoSchema = await this.generateServiceSchema(service);

    const query = `
      INSERT INTO workflow_services (
        service_id, workflow_id, name, description, service_type, api_config,
        bundled_endpoints, input_attributes, output_attributes, attribute_mappings,
        supports_realtime, realtime_config, stream_direction, auto_schema,
        service_order, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;

    const values = [
      serviceId,
      service.workflow_id,
      service.name,
      service.description,
      service.service_type,
      JSON.stringify(service.api_config || {}),
      JSON.stringify(service.bundled_endpoints || []),
      JSON.stringify(service.input_attributes || []),
      JSON.stringify(service.output_attributes || []),
      JSON.stringify(service.attribute_mappings || {}),
      service.supports_realtime || false,
      JSON.stringify(service.realtime_config || {}),
      service.stream_direction || 'bidirectional',
      JSON.stringify(autoSchema),
      service.service_order || 0,
      service.is_active !== false
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async listServices(workflowId: string): Promise<WorkflowService[]> {
    const query = `
      SELECT * FROM workflow_services 
      WHERE workflow_id = $1 
      ORDER BY service_order, created_at
    `;
    const result = await this.db.query(query, [workflowId]);
    return result.rows;
  }

  async updateService(serviceId: string, updates: Partial<WorkflowService>): Promise<WorkflowService> {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'service_id') {
        updateFields.push(`${key} = $${paramIndex}`);
        values.push(typeof value === 'object' && value !== null ? JSON.stringify(value) : value);
        paramIndex++;
      }
    });

    values.push(serviceId);
    const query = `
      UPDATE workflow_services 
      SET ${updateFields.join(', ')}
      WHERE service_id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async deleteService(serviceId: string): Promise<boolean> {
    const query = `DELETE FROM workflow_services WHERE service_id = $1`;
    const result = await this.db.query(query, [serviceId]);
    return result.rowCount > 0;
  }

  // ===================================================================
  // DATA STREAM CRUD OPERATIONS
  // ===================================================================

  async createDataStream(stream: Partial<DataStream>): Promise<DataStream> {
    const streamId = stream.stream_id || `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const query = `
      INSERT INTO data_streams (
        stream_id, name, description, source_service_id, destination_service_id,
        stream_type, direction, data_format, data_schema, attribute_bindings,
        realtime_protocol, polling_interval_ms, buffer_size, retry_policy, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      streamId,
      stream.name,
      stream.description,
      stream.source_service_id,
      stream.destination_service_id,
      stream.stream_type,
      stream.direction,
      stream.data_format || 'json',
      JSON.stringify(stream.data_schema || {}),
      JSON.stringify(stream.attribute_bindings || []),
      stream.realtime_protocol,
      stream.polling_interval_ms,
      stream.buffer_size || 100,
      JSON.stringify(stream.retry_policy || {}),
      stream.is_active !== false
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async listDataStreams(workflowId?: string): Promise<DataStream[]> {
    let query = `
      SELECT ds.* FROM data_streams ds
      LEFT JOIN workflow_services ws ON ds.source_service_id = ws.service_id
    `;
    
    if (workflowId) {
      query += ` WHERE ws.workflow_id = $1`;
      const result = await this.db.query(query, [workflowId]);
      return result.rows;
    }

    const result = await this.db.query(query);
    return result.rows;
  }

  // ===================================================================
  // DASHBOARD CRUD OPERATIONS
  // ===================================================================

  async createDashboard(dashboard: Partial<WorkflowDashboard>): Promise<WorkflowDashboard> {
    const dashboardId = dashboard.dashboard_id || `dash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const autoSchema = await this.generateDashboardSchema(dashboard);

    const query = `
      INSERT INTO workflow_dashboards (
        dashboard_id, workflow_id, name, description, dashboard_type, layout_config,
        widget_config, connected_services, data_refresh_interval_ms, supports_realtime,
        realtime_update_config, auto_schema, is_public, allowed_roles
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      dashboardId,
      dashboard.workflow_id,
      dashboard.name,
      dashboard.description,
      dashboard.dashboard_type,
      JSON.stringify(dashboard.layout_config || {}),
      JSON.stringify(dashboard.widget_config || []),
      JSON.stringify(dashboard.connected_services || []),
      dashboard.data_refresh_interval_ms || 5000,
      dashboard.supports_realtime !== false,
      JSON.stringify(dashboard.realtime_update_config || {}),
      JSON.stringify(autoSchema),
      dashboard.is_public || false,
      dashboard.allowed_roles || []
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async listDashboards(workflowId: string): Promise<WorkflowDashboard[]> {
    const query = `SELECT * FROM workflow_dashboards WHERE workflow_id = $1`;
    const result = await this.db.query(query, [workflowId]);
    return result.rows;
  }

  // ===================================================================
  // DEEPSEEK INTEGRATION
  // ===================================================================

  /**
   * Create complete workflow from natural language using DeepSeek
   */
  async createWorkflowFromPrompt(
    userPrompt: string,
    contextData?: Record<string, any>
  ): Promise<{
    workflow: WorkflowHierarchy;
    services: WorkflowService[];
    streams: DataStream[];
    dashboard?: WorkflowDashboard;
  }> {
    if (!this.deepseek) {
      throw new Error('DeepSeek integration not available');
    }

    // Build system prompt for workflow generation
    const systemPrompt = `You are an expert workflow architect. Generate a complete workflow specification from the user's description.

Return a JSON object with this structure:
{
  "workflow": {
    "name": "Workflow Name",
    "description": "Description",
    "workflow_type": "atomic|composite|root",
    "category": "seo|data-mining|ai-content|etc",
    "config": {},
    "metadata": {}
  },
  "services": [
    {
      "name": "Service Name",
      "service_type": "api|data-processor|ai-engine|database|notification",
      "description": "Service description",
      "api_config": {},
      "input_attributes": [{"name": "attr1", "type": "string"}],
      "output_attributes": [{"name": "result", "type": "object"}],
      "supports_realtime": true|false,
      "stream_direction": "bidirectional"
    }
  ],
  "streams": [
    {
      "name": "Stream Name",
      "source_service_index": 0,
      "destination_service_index": 1,
      "stream_type": "websocket|sse|polling|webhook",
      "direction": "bidirectional",
      "attribute_bindings": ["attr1", "attr2"]
    }
  ],
  "dashboard": {
    "name": "Dashboard Name",
    "dashboard_type": "monitoring|analytics|control|reporting",
    "widget_config": [],
    "supports_realtime": true
  }
}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    const response = await this.deepseek.chat(messages);
    const content = response.choices[0].message.content;

    // Parse DeepSeek response
    let generatedSpec;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      generatedSpec = JSON.parse(jsonMatch ? jsonMatch[1] : content);
    } catch (error) {
      throw new Error(`Failed to parse DeepSeek response: ${error}`);
    }

    // Create workflow
    const workflow = await this.createWorkflow({
      ...generatedSpec.workflow,
      metadata: {
        ...generatedSpec.workflow.metadata,
        generated_by: 'deepseek',
        user_prompt: userPrompt
      }
    });

    // Create services
    const services: WorkflowService[] = [];
    for (const svcSpec of generatedSpec.services || []) {
      const service = await this.createService({
        ...svcSpec,
        workflow_id: workflow.workflow_id
      });
      services.push(service);
    }

    // Create data streams
    const streams: DataStream[] = [];
    for (const streamSpec of generatedSpec.streams || []) {
      const stream = await this.createDataStream({
        ...streamSpec,
        source_service_id: services[streamSpec.source_service_index]?.service_id,
        destination_service_id: services[streamSpec.destination_service_index]?.service_id
      });
      streams.push(stream);
    }

    // Create dashboard if specified
    let dashboard;
    if (generatedSpec.dashboard) {
      dashboard = await this.createDashboard({
        ...generatedSpec.dashboard,
        workflow_id: workflow.workflow_id,
        connected_services: services.map(s => s.service_id)
      });
    }

    // Log the generation
    await this.logDeepSeekGeneration(workflow.workflow_id, userPrompt, generatedSpec, response.usage.total_tokens);

    return { workflow, services, streams, dashboard };
  }

  // ===================================================================
  // AUTO-SCHEMA GENERATION
  // ===================================================================

  private async generateWorkflowSchema(workflow: Partial<WorkflowHierarchy>): Promise<Record<string, any>> {
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: workflow.name || 'Workflow',
      description: workflow.description,
      properties: {
        config: {
          type: 'object',
          properties: workflow.config || {}
        },
        metadata: {
          type: 'object',
          properties: workflow.metadata || {}
        }
      },
      generated_at: new Date().toISOString(),
      generated_by: 'auto-schema-generator',
      version: '1.0.0'
    };
  }

  private async generateServiceSchema(service: Partial<WorkflowService>): Promise<Record<string, any>> {
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: service.name || 'Service',
      properties: {
        input: {
          type: 'array',
          items: {
            type: 'object'
          },
          description: 'Input attributes',
          examples: service.input_attributes || []
        },
        output: {
          type: 'array',
          items: {
            type: 'object'
          },
          description: 'Output attributes',
          examples: service.output_attributes || []
        }
      },
      generated_at: new Date().toISOString()
    };
  }

  private async generateDashboardSchema(dashboard: Partial<WorkflowDashboard>): Promise<Record<string, any>> {
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      title: dashboard.name || 'Dashboard',
      properties: {
        layout: dashboard.layout_config || {},
        widgets: {
          type: 'array',
          items: {
            type: 'object'
          },
          description: 'Dashboard widgets',
          examples: dashboard.widget_config || []
        }
      },
      generated_at: new Date().toISOString()
    };
  }

  private async logDeepSeekGeneration(
    workflowId: string,
    userPrompt: string,
    generatedSpec: any,
    tokenUsage: number
  ): Promise<void> {
    const query = `
      INSERT INTO deepseek_workflow_generations (
        generation_id, workflow_id, user_prompt, generated_workflow,
        generated_services, generated_streams, generated_dashboard,
        token_usage, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    const values = [
      `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      userPrompt,
      JSON.stringify(generatedSpec.workflow),
      JSON.stringify(generatedSpec.services || []),
      JSON.stringify(generatedSpec.streams || []),
      JSON.stringify(generatedSpec.dashboard),
      tokenUsage,
      new Date()
    ];

    await this.db.query(query, values);
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    parts[parts.length - 1] = String(parseInt(parts[parts.length - 1]) + 1);
    return parts.join('.');
  }

  // ===================================================================
  // HIERARCHY NAVIGATION
  // ===================================================================

  async getWorkflowChildren(parentId: string): Promise<WorkflowHierarchy[]> {
    const query = `SELECT * FROM workflow_hierarchy WHERE parent_workflow_id = $1 ORDER BY name`;
    const result = await this.db.query(query, [parentId]);
    return result.rows;
  }

  async getWorkflowAncestors(workflowId: string): Promise<WorkflowHierarchy[]> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow || !workflow.hierarchy_path) return [];

    const pathParts = workflow.hierarchy_path.split('/').filter(Boolean);
    const query = `
      SELECT * FROM workflow_hierarchy 
      WHERE workflow_id = ANY($1)
      ORDER BY hierarchy_level
    `;
    const result = await this.db.query(query, [pathParts]);
    return result.rows;
  }

  async getRootWorkflows(): Promise<WorkflowHierarchy[]> {
    const query = `SELECT * FROM workflow_hierarchy WHERE parent_workflow_id IS NULL ORDER BY name`;
    const result = await this.db.query(query);
    return result.rows;
  }
}

export default WorkflowHierarchyCRUDService;
