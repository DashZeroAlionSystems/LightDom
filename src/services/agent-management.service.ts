/**
 * Agent Management CRUD Service
 * Comprehensive CRUD operations for the agent management system
 */

import { Pool, PoolClient } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import {
  AgentSession,
  AgentInstance,
  AgentMessage,
  AgentTool,
  AgentService,
  AgentWorkflow,
  WorkflowStep,
  AgentCampaign,
  DataStream,
  StreamAttribute,
  CreateAgentSessionRequest,
  CreateAgentInstanceRequest,
  SendPromptRequest,
  CreateToolRequest,
  CreateServiceRequest,
  CreateWorkflowRequest,
  CreateCampaignRequest,
  CreateDataStreamRequest,
  ExecuteWorkflowRequest,
  AgentExecution
} from '../types/agent-management';

export class AgentManagementService {
  constructor(private db: Pool) {}

  // ============================================================================
  // AGENT SESSIONS
  // ============================================================================

  async createSession(data: CreateAgentSessionRequest): Promise<AgentSession> {
    const query = `
      INSERT INTO agent_sessions (name, description, agent_type, configuration, context_data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      data.name,
      data.description || null,
      data.agent_type || 'deepseek',
      JSON.stringify(data.configuration || {}),
      JSON.stringify(data.context_data || {})
    ];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getSession(session_id: string): Promise<AgentSession | null> {
    const query = 'SELECT * FROM agent_sessions WHERE session_id = $1';
    const result = await this.db.query(query, [session_id]);
    return result.rows[0] || null;
  }

  async listSessions(filters?: { status?: string; agent_type?: string }): Promise<AgentSession[]> {
    let query = 'SELECT * FROM agent_sessions WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.status) {
      query += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }
    if (filters?.agent_type) {
      query += ` AND agent_type = $${paramCount++}`;
      values.push(filters.agent_type);
    }

    query += ' ORDER BY created_at DESC';
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async updateSession(session_id: string, updates: Partial<AgentSession>): Promise<AgentSession | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.configuration !== undefined) {
      fields.push(`configuration = $${paramCount++}`);
      values.push(JSON.stringify(updates.configuration));
    }
    if (updates.context_data !== undefined) {
      fields.push(`context_data = $${paramCount++}`);
      values.push(JSON.stringify(updates.context_data));
    }

    if (fields.length === 0) return null;

    values.push(session_id);
    const query = `
      UPDATE agent_sessions 
      SET ${fields.join(', ')}
      WHERE session_id = $${paramCount}
      RETURNING *
    `;
    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteSession(session_id: string): Promise<boolean> {
    const query = 'DELETE FROM agent_sessions WHERE session_id = $1';
    const result = await this.db.query(query, [session_id]);
    return result.rowCount > 0;
  }

  // ============================================================================
  // AGENT INSTANCES
  // ============================================================================

  async createInstance(data: CreateAgentInstanceRequest): Promise<AgentInstance> {
    const query = `
      INSERT INTO agent_instances (
        session_id, name, model_name, model_version, fine_tune_config,
        tools_enabled, services_enabled, max_tokens, temperature
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      data.session_id,
      data.name,
      data.model_name || 'deepseek-coder',
      data.model_version || null,
      JSON.stringify(data.fine_tune_config || {}),
      JSON.stringify(data.tools_enabled || []),
      JSON.stringify(data.services_enabled || []),
      data.max_tokens || 4096,
      data.temperature || 0.7
    ];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getInstance(instance_id: string): Promise<AgentInstance | null> {
    const query = 'SELECT * FROM agent_instances WHERE instance_id = $1';
    const result = await this.db.query(query, [instance_id]);
    return result.rows[0] || null;
  }

  async listInstances(session_id?: string): Promise<AgentInstance[]> {
    let query = 'SELECT * FROM agent_instances';
    const values: any[] = [];

    if (session_id) {
      query += ' WHERE session_id = $1';
      values.push(session_id);
    }

    query += ' ORDER BY created_at DESC';
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async updateInstance(instance_id: string, updates: Partial<AgentInstance>): Promise<AgentInstance | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.schema_map !== undefined) {
      fields.push(`schema_map = $${paramCount++}`);
      values.push(JSON.stringify(updates.schema_map));
    }
    if (updates.pattern_rules !== undefined) {
      fields.push(`pattern_rules = $${paramCount++}`);
      values.push(JSON.stringify(updates.pattern_rules));
    }
    if (updates.tools_enabled !== undefined) {
      fields.push(`tools_enabled = $${paramCount++}`);
      values.push(JSON.stringify(updates.tools_enabled));
    }
    if (updates.services_enabled !== undefined) {
      fields.push(`services_enabled = $${paramCount++}`);
      values.push(JSON.stringify(updates.services_enabled));
    }

    if (fields.length === 0) return null;

    fields.push(`last_active_at = CURRENT_TIMESTAMP`);
    values.push(instance_id);
    const query = `
      UPDATE agent_instances 
      SET ${fields.join(', ')}
      WHERE instance_id = $${paramCount}
      RETURNING *
    `;
    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteInstance(instance_id: string): Promise<boolean> {
    const query = 'DELETE FROM agent_instances WHERE instance_id = $1';
    const result = await this.db.query(query, [instance_id]);
    return result.rowCount > 0;
  }

  // ============================================================================
  // AGENT MESSAGES
  // ============================================================================

  async sendMessage(data: SendPromptRequest): Promise<AgentMessage> {
    const query = `
      INSERT INTO agent_messages (session_id, instance_id, role, content, attachments)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      data.session_id,
      data.instance_id || null,
      'user',
      data.content,
      JSON.stringify(data.attachments || [])
    ];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getMessages(session_id: string, limit: number = 50): Promise<AgentMessage[]> {
    const query = `
      SELECT * FROM agent_messages 
      WHERE session_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await this.db.query(query, [session_id, limit]);
    return result.rows.reverse(); // Return in chronological order
  }

  // ============================================================================
  // TOOLS
  // ============================================================================

  async createTool(data: CreateToolRequest): Promise<AgentTool> {
    const query = `
      INSERT INTO agent_tools (
        name, description, category, service_type, handler_function,
        input_schema, output_schema, configuration
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      data.name,
      data.description || null,
      data.category || null,
      data.service_type || null,
      data.handler_function,
      JSON.stringify(data.input_schema),
      JSON.stringify(data.output_schema),
      JSON.stringify(data.configuration || {})
    ];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getTool(tool_id: string): Promise<AgentTool | null> {
    const query = 'SELECT * FROM agent_tools WHERE tool_id = $1';
    const result = await this.db.query(query, [tool_id]);
    return result.rows[0] || null;
  }

  async listTools(filters?: { category?: string; service_type?: string }): Promise<AgentTool[]> {
    let query = 'SELECT * FROM agent_tools WHERE is_active = true';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.category) {
      query += ` AND category = $${paramCount++}`;
      values.push(filters.category);
    }
    if (filters?.service_type) {
      query += ` AND service_type = $${paramCount++}`;
      values.push(filters.service_type);
    }

    query += ' ORDER BY name';
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async updateTool(tool_id: string, updates: Partial<AgentTool>): Promise<AgentTool | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.configuration !== undefined) {
      fields.push(`configuration = $${paramCount++}`);
      values.push(JSON.stringify(updates.configuration));
    }
    if (updates.is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.is_active);
    }

    if (fields.length === 0) return null;

    values.push(tool_id);
    const query = `
      UPDATE agent_tools 
      SET ${fields.join(', ')}
      WHERE tool_id = $${paramCount}
      RETURNING *
    `;
    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteTool(tool_id: string): Promise<boolean> {
    const query = 'DELETE FROM agent_tools WHERE tool_id = $1';
    const result = await this.db.query(query, [tool_id]);
    return result.rowCount > 0;
  }

  // ============================================================================
  // SERVICES
  // ============================================================================

  async createService(data: CreateServiceRequest): Promise<AgentService> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      const insertServiceQuery = `
        INSERT INTO agent_services (name, description, category, configuration)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const serviceValues = [
        data.name,
        data.description || null,
        data.category || null,
        JSON.stringify(data.configuration || {})
      ];
      const serviceResult = await client.query(insertServiceQuery, serviceValues);
      const service = serviceResult.rows[0];

      if (data.tool_ids && data.tool_ids.length > 0) {
        const insertToolsQuery = `
          INSERT INTO service_tools (service_id, tool_id, ordering)
          VALUES ($1, $2, $3)
        `;
        for (let i = 0; i < data.tool_ids.length; i++) {
          await client.query(insertToolsQuery, [service.service_id, data.tool_ids[i], i + 1]);
        }
      }

      await client.query('COMMIT');
      return service;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getService(service_id: string): Promise<AgentService | null> {
    const query = `
      SELECT s.*, json_agg(t.*) as tools
      FROM agent_services s
      LEFT JOIN service_tools st ON s.service_id = st.service_id
      LEFT JOIN agent_tools t ON st.tool_id = t.tool_id
      WHERE s.service_id = $1
      GROUP BY s.service_id
    `;
    const result = await this.db.query(query, [service_id]);
    return result.rows[0] || null;
  }

  async listServices(category?: string): Promise<AgentService[]> {
    let query = `
      SELECT s.*, json_agg(t.*) FILTER (WHERE t.tool_id IS NOT NULL) as tools
      FROM agent_services s
      LEFT JOIN service_tools st ON s.service_id = st.service_id
      LEFT JOIN agent_tools t ON st.tool_id = t.tool_id
      WHERE s.is_active = true
    `;
    const values: any[] = [];

    if (category) {
      query += ' AND s.category = $1';
      values.push(category);
    }

    query += ' GROUP BY s.service_id ORDER BY s.name';
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async updateService(service_id: string, updates: Partial<AgentService>): Promise<AgentService | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.configuration !== undefined) {
      fields.push(`configuration = $${paramCount++}`);
      values.push(JSON.stringify(updates.configuration));
    }
    if (updates.is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.is_active);
    }

    if (fields.length === 0) return null;

    values.push(service_id);
    const query = `
      UPDATE agent_services 
      SET ${fields.join(', ')}
      WHERE service_id = $${paramCount}
      RETURNING *
    `;
    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteService(service_id: string): Promise<boolean> {
    const query = 'DELETE FROM agent_services WHERE service_id = $1';
    const result = await this.db.query(query, [service_id]);
    return result.rowCount > 0;
  }

  // ============================================================================
  // WORKFLOWS
  // ============================================================================

  async createWorkflow(data: CreateWorkflowRequest): Promise<AgentWorkflow> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      const insertWorkflowQuery = `
        INSERT INTO agent_workflows (name, description, workflow_type, configuration)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const workflowValues = [
        data.name,
        data.description || null,
        data.workflow_type,
        JSON.stringify(data.configuration || {})
      ];
      const workflowResult = await client.query(insertWorkflowQuery, workflowValues);
      const workflow = workflowResult.rows[0];

      if (data.steps && data.steps.length > 0) {
        const insertStepQuery = `
          INSERT INTO workflow_steps (
            workflow_id, name, step_type, service_id, tool_id, ordering,
            dependencies, configuration, conditional_logic, retry_policy,
            timeout_seconds, is_optional
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `;
        for (const step of data.steps) {
          await client.query(insertStepQuery, [
            workflow.workflow_id,
            step.name,
            step.step_type,
            step.service_id || null,
            step.tool_id || null,
            step.ordering,
            JSON.stringify(step.dependencies || []),
            JSON.stringify(step.configuration || {}),
            JSON.stringify(step.conditional_logic || {}),
            JSON.stringify(step.retry_policy || {}),
            step.timeout_seconds || 300,
            step.is_optional || false
          ]);
        }
      }

      await client.query('COMMIT');
      return workflow;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getWorkflow(workflow_id: string): Promise<AgentWorkflow | null> {
    const workflowQuery = 'SELECT * FROM agent_workflows WHERE workflow_id = $1';
    const stepsQuery = 'SELECT * FROM workflow_steps WHERE workflow_id = $1 ORDER BY ordering';

    const workflowResult = await this.db.query(workflowQuery, [workflow_id]);
    if (workflowResult.rows.length === 0) return null;

    const workflow = workflowResult.rows[0];
    const stepsResult = await this.db.query(stepsQuery, [workflow_id]);
    workflow.steps = stepsResult.rows;

    return workflow;
  }

  async listWorkflows(filters?: { workflow_type?: string; is_template?: boolean }): Promise<AgentWorkflow[]> {
    let query = 'SELECT * FROM agent_workflows WHERE is_active = true';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.workflow_type) {
      query += ` AND workflow_type = $${paramCount++}`;
      values.push(filters.workflow_type);
    }
    if (filters?.is_template !== undefined) {
      query += ` AND is_template = $${paramCount++}`;
      values.push(filters.is_template);
    }

    query += ' ORDER BY created_at DESC';
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async updateWorkflow(workflow_id: string, updates: Partial<AgentWorkflow>): Promise<AgentWorkflow | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.configuration !== undefined) {
      fields.push(`configuration = $${paramCount++}`);
      values.push(JSON.stringify(updates.configuration));
    }
    if (updates.is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.is_active);
    }

    if (fields.length === 0) return null;

    values.push(workflow_id);
    const query = `
      UPDATE agent_workflows 
      SET ${fields.join(', ')}
      WHERE workflow_id = $${paramCount}
      RETURNING *
    `;
    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteWorkflow(workflow_id: string): Promise<boolean> {
    const query = 'DELETE FROM agent_workflows WHERE workflow_id = $1';
    const result = await this.db.query(query, [workflow_id]);
    return result.rowCount > 0;
  }

  // ============================================================================
  // CAMPAIGNS
  // ============================================================================

  async createCampaign(data: CreateCampaignRequest): Promise<AgentCampaign> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      const insertCampaignQuery = `
        INSERT INTO agent_campaigns (
          name, description, campaign_type, schedule_config, configuration
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const campaignValues = [
        data.name,
        data.description || null,
        data.campaign_type || null,
        JSON.stringify(data.schedule_config || {}),
        JSON.stringify(data.configuration || {})
      ];
      const campaignResult = await client.query(insertCampaignQuery, campaignValues);
      const campaign = campaignResult.rows[0];

      if (data.workflow_ids && data.workflow_ids.length > 0) {
        const insertWorkflowsQuery = `
          INSERT INTO campaign_workflows (campaign_id, workflow_id, ordering)
          VALUES ($1, $2, $3)
        `;
        for (let i = 0; i < data.workflow_ids.length; i++) {
          await client.query(insertWorkflowsQuery, [campaign.campaign_id, data.workflow_ids[i], i + 1]);
        }
      }

      await client.query('COMMIT');
      return campaign;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getCampaign(campaign_id: string): Promise<AgentCampaign | null> {
    const query = `
      SELECT c.*, json_agg(w.*) FILTER (WHERE w.workflow_id IS NOT NULL) as workflows
      FROM agent_campaigns c
      LEFT JOIN campaign_workflows cw ON c.campaign_id = cw.campaign_id
      LEFT JOIN agent_workflows w ON cw.workflow_id = w.workflow_id
      WHERE c.campaign_id = $1
      GROUP BY c.campaign_id
    `;
    const result = await this.db.query(query, [campaign_id]);
    return result.rows[0] || null;
  }

  async listCampaigns(status?: string): Promise<AgentCampaign[]> {
    let query = 'SELECT * FROM agent_campaigns';
    const values: any[] = [];

    if (status) {
      query += ' WHERE status = $1';
      values.push(status);
    }

    query += ' ORDER BY created_at DESC';
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async updateCampaign(campaign_id: string, updates: Partial<AgentCampaign>): Promise<AgentCampaign | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.configuration !== undefined) {
      fields.push(`configuration = $${paramCount++}`);
      values.push(JSON.stringify(updates.configuration));
    }

    if (fields.length === 0) return null;

    values.push(campaign_id);
    const query = `
      UPDATE agent_campaigns 
      SET ${fields.join(', ')}
      WHERE campaign_id = $${paramCount}
      RETURNING *
    `;
    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteCampaign(campaign_id: string): Promise<boolean> {
    const query = 'DELETE FROM agent_campaigns WHERE campaign_id = $1';
    const result = await this.db.query(query, [campaign_id]);
    return result.rowCount > 0;
  }

  // ============================================================================
  // DATA STREAMS
  // ============================================================================

  async createDataStream(data: CreateDataStreamRequest): Promise<DataStream> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      const insertStreamQuery = `
        INSERT INTO data_streams (
          campaign_id, name, description, stream_type, source_config, target_config, transformation_rules
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const streamValues = [
        data.campaign_id || null,
        data.name,
        data.description || null,
        data.stream_type,
        JSON.stringify(data.source_config),
        JSON.stringify(data.target_config || {}),
        JSON.stringify(data.transformation_rules || [])
      ];
      const streamResult = await client.query(insertStreamQuery, streamValues);
      const stream = streamResult.rows[0];

      if (data.attributes && data.attributes.length > 0) {
        const insertAttrQuery = `
          INSERT INTO stream_attributes (
            stream_id, name, description, data_type, extraction_config,
            enrichment_prompt, search_algorithm, validation_rules, is_required, is_included, default_value
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        for (const attr of data.attributes) {
          await client.query(insertAttrQuery, [
            stream.stream_id,
            attr.name,
            attr.description || null,
            attr.data_type,
            JSON.stringify(attr.extraction_config),
            attr.enrichment_prompt || null,
            attr.search_algorithm || null,
            JSON.stringify(attr.validation_rules || {}),
            attr.is_required || false,
            attr.is_included !== undefined ? attr.is_included : true,
            attr.default_value || null
          ]);
        }
      }

      await client.query('COMMIT');
      return stream;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getDataStream(stream_id: string): Promise<DataStream | null> {
    const streamQuery = 'SELECT * FROM data_streams WHERE stream_id = $1';
    const attrsQuery = 'SELECT * FROM stream_attributes WHERE stream_id = $1';

    const streamResult = await this.db.query(streamQuery, [stream_id]);
    if (streamResult.rows.length === 0) return null;

    const stream = streamResult.rows[0];
    const attrsResult = await this.db.query(attrsQuery, [stream_id]);
    stream.attributes = attrsResult.rows;

    return stream;
  }

  async listDataStreams(campaign_id?: string): Promise<DataStream[]> {
    let query = 'SELECT * FROM data_streams';
    const values: any[] = [];

    if (campaign_id) {
      query += ' WHERE campaign_id = $1';
      values.push(campaign_id);
    }

    query += ' ORDER BY created_at DESC';
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async updateDataStream(stream_id: string, updates: Partial<DataStream>): Promise<DataStream | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.source_config !== undefined) {
      fields.push(`source_config = $${paramCount++}`);
      values.push(JSON.stringify(updates.source_config));
    }

    if (fields.length === 0) return null;

    values.push(stream_id);
    const query = `
      UPDATE data_streams 
      SET ${fields.join(', ')}
      WHERE stream_id = $${paramCount}
      RETURNING *
    `;
    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteDataStream(stream_id: string): Promise<boolean> {
    const query = 'DELETE FROM data_streams WHERE stream_id = $1';
    const result = await this.db.query(query, [stream_id]);
    return result.rowCount > 0;
  }

  // ============================================================================
  // WORKFLOW EXECUTION
  // ============================================================================

  async executeWorkflow(data: ExecuteWorkflowRequest): Promise<AgentExecution> {
    const query = `
      INSERT INTO agent_executions (
        workflow_id, execution_type, status, input_data
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      data.workflow_id,
      'workflow',
      'pending',
      JSON.stringify(data.input_data || {})
    ];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getExecution(execution_id: string): Promise<AgentExecution | null> {
    const query = 'SELECT * FROM agent_executions WHERE execution_id = $1';
    const result = await this.db.query(query, [execution_id]);
    return result.rows[0] || null;
  }

  async listExecutions(filters?: { session_id?: string; status?: string }): Promise<AgentExecution[]> {
    let query = 'SELECT * FROM agent_executions WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.session_id) {
      query += ` AND session_id = $${paramCount++}`;
      values.push(filters.session_id);
    }
    if (filters?.status) {
      query += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }

    query += ' ORDER BY started_at DESC';
    const result = await this.db.query(query, values);
    return result.rows;
  }
}
