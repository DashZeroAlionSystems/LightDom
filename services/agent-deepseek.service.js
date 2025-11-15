/**
 * Agent DeepSeek Service
 * Complete CRUD service for managing AI agents with DeepSeek integration.
 */

import axios from 'axios';

const DEFAULT_MODEL = 'deepseek-chat';

const jsonOrNull = value => (value === undefined ? null : value);

export class AgentDeepSeekService {
  constructor(db) {
    if (!db) {
      throw new Error('Database pool instance is required');
    }

    this.db = db;
  }

  // ========================================================================
  // AGENT MODES - Define functional roles for agents
  // ========================================================================

  async createAgentMode(data) {
    const query = `
      INSERT INTO agent_modes
        (name, description, mode_type, function_definition, capabilities, knowledge_graph,
         configuration_schema, default_config, deepseek_prompt_template, rules, constraints)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      data.name,
      jsonOrNull(data.description),
      data.mode_type,
      data.function_definition,
      data.capabilities || [],
      data.knowledge_graph || {},
      data.configuration_schema || {},
      data.default_config || {},
      jsonOrNull(data.deepseek_prompt_template),
      data.rules || [],
      data.constraints || {},
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getAgentMode(modeId) {
    const result = await this.db.query('SELECT * FROM agent_modes WHERE mode_id = $1', [modeId]);
    return result.rows[0] || null;
  }

  async listAgentModes(filters = {}) {
    const conditions = [];
    const values = [];

    if (filters.mode_type) {
      conditions.push(`mode_type = $${values.length + 1}`);
      values.push(filters.mode_type);
    }
    if (filters.is_active !== undefined) {
      conditions.push(`is_active = $${values.length + 1}`);
      values.push(filters.is_active);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM agent_modes ${whereClause} ORDER BY created_at DESC`;
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async updateAgentMode(modeId, updates = {}) {
    const fields = [];
    const values = [];

    const setField = (column, value) => {
      fields.push(`${column} = $${values.length + 1}`);
      values.push(value);
    };

    if (updates.name !== undefined) setField('name', updates.name);
    if (updates.description !== undefined) setField('description', updates.description);
    if (updates.mode_type !== undefined) setField('mode_type', updates.mode_type);
    if (updates.function_definition !== undefined) setField('function_definition', updates.function_definition);
    if (updates.capabilities !== undefined) setField('capabilities', updates.capabilities);
    if (updates.knowledge_graph !== undefined) setField('knowledge_graph', updates.knowledge_graph);
    if (updates.configuration_schema !== undefined) setField('configuration_schema', updates.configuration_schema);
    if (updates.default_config !== undefined) setField('default_config', updates.default_config);
    if (updates.deepseek_prompt_template !== undefined)
      setField('deepseek_prompt_template', updates.deepseek_prompt_template);
    if (updates.rules !== undefined) setField('rules', updates.rules);
    if (updates.constraints !== undefined) setField('constraints', updates.constraints);
    if (updates.is_active !== undefined) setField('is_active', updates.is_active);

    if (fields.length === 0) {
      return this.getAgentMode(modeId);
    }

    values.push(modeId);
    const query = `
      UPDATE agent_modes
      SET ${fields.join(', ')}
      WHERE mode_id = $${values.length}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteAgentMode(modeId) {
    const result = await this.db.query('DELETE FROM agent_modes WHERE mode_id = $1', [modeId]);
    return result.rowCount > 0;
  }

  // ========================================================================
  // AGENT INSTANCES - Create and manage actual agent instances
  // ========================================================================

  async createAgentInstance(data) {
    const query = `
      INSERT INTO agent_instances
        (name, description, mode_id, configuration, deepseek_config,
         tools_enabled, services_enabled, model_name, temperature, max_tokens)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      data.name,
      jsonOrNull(data.description),
      data.mode_id,
      data.configuration || {},
      data.deepseek_config || {},
      data.tools_enabled || [],
      data.services_enabled || [],
      data.model_name || DEFAULT_MODEL,
      data.temperature ?? 0.7,
      data.max_tokens ?? 4000,
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getAgentInstance(agentId) {
    const result = await this.db.query('SELECT * FROM agent_instances WHERE agent_id = $1', [agentId]);
    return result.rows[0] || null;
  }

  async listAgentInstances(filters = {}) {
    const conditions = [];
    const values = [];

    if (filters.mode_id) {
      conditions.push(`mode_id = $${values.length + 1}`);
      values.push(filters.mode_id);
    }
    if (filters.status) {
      conditions.push(`status = $${values.length + 1}`);
      values.push(filters.status);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT * FROM agent_instances ${whereClause} ORDER BY created_at DESC`;
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async updateAgentInstance(agentId, updates = {}) {
    const fields = [];
    const values = [];

    const setField = (column, value) => {
      fields.push(`${column} = $${values.length + 1}`);
      values.push(value);
    };

    if (updates.name !== undefined) setField('name', updates.name);
    if (updates.description !== undefined) setField('description', updates.description);
    if (updates.status !== undefined) setField('status', updates.status);
    if (updates.configuration !== undefined) setField('configuration', updates.configuration);
    if (updates.deepseek_config !== undefined) setField('deepseek_config', updates.deepseek_config);
    if (updates.tools_enabled !== undefined) setField('tools_enabled', updates.tools_enabled);
    if (updates.services_enabled !== undefined) setField('services_enabled', updates.services_enabled);
    if (updates.model_name !== undefined) setField('model_name', updates.model_name);
    if (updates.temperature !== undefined) setField('temperature', updates.temperature);
    if (updates.max_tokens !== undefined) setField('max_tokens', updates.max_tokens);
    if (updates.knowledge_graph !== undefined) setField('knowledge_graph', updates.knowledge_graph);
    if (updates.learning_data !== undefined) setField('learning_data', updates.learning_data);

    if (fields.length === 0) {
      return this.getAgentInstance(agentId);
    }

    setField('last_active_at', new Date());

    values.push(agentId);
    const query = `
      UPDATE agent_instances
      SET ${fields.join(', ')}
      WHERE agent_id = $${values.length}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteAgentInstance(agentId) {
    const result = await this.db.query('DELETE FROM agent_instances WHERE agent_id = $1', [agentId]);
    return result.rowCount > 0;
  }

  // ========================================================================
  // AGENT SESSIONS - Manage conversation sessions
  // ========================================================================

  async createSession(data) {
    const query = `
      INSERT INTO agent_sessions (agent_id, name, description, session_context)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [
      data.agent_id,
      jsonOrNull(data.name),
      jsonOrNull(data.description),
      data.session_context || {},
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getSession(sessionId) {
    const result = await this.db.query('SELECT * FROM agent_sessions WHERE session_id = $1', [sessionId]);
    return result.rows[0] || null;
  }

  async listSessions(agentId) {
    const values = [];
    let query = 'SELECT * FROM agent_sessions';

    if (agentId) {
      query += ' WHERE agent_id = $1';
      values.push(agentId);
    }

    query += ' ORDER BY created_at DESC';
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async updateSession(sessionId, updates = {}) {
    const fields = [];
    const values = [];

    const setField = (column, value) => {
      fields.push(`${column} = $${values.length + 1}`);
      values.push(value);
    };

    if (updates.status !== undefined) setField('status', updates.status);
    if (updates.session_context !== undefined) setField('session_context', updates.session_context);
    if (updates.knowledge_updates !== undefined) setField('knowledge_updates', updates.knowledge_updates);
    if (updates.summary !== undefined) setField('session_summary', updates.summary);

    if (fields.length === 0) {
      return this.getSession(sessionId);
    }

    values.push(sessionId);
    const query = `
      UPDATE agent_sessions
      SET ${fields.join(', ')}
      WHERE session_id = $${values.length}
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  // ========================================================================
  // KNOWLEDGE GRAPH - Manage knowledge nodes and relationships
  // ========================================================================

  async createKnowledgeNode(data) {
    const query = `
      INSERT INTO knowledge_nodes
        (agent_id, mode_id, node_type, name, description, properties)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      jsonOrNull(data.agent_id),
      jsonOrNull(data.mode_id),
      data.node_type,
      data.name,
      jsonOrNull(data.description),
      data.properties || {},
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getKnowledgeGraph(agentId, modeId) {
    const nodeConditions = [];
    const nodeValues = [];

    if (agentId) {
      nodeConditions.push(`agent_id = $${nodeValues.length + 1}`);
      nodeValues.push(agentId);
    }
    if (modeId) {
      nodeConditions.push(`mode_id = $${nodeValues.length + 1}`);
      nodeValues.push(modeId);
    }

    const whereClause = nodeConditions.length ? `WHERE ${nodeConditions.join(' AND ')}` : '';
    const nodesQuery = `SELECT * FROM knowledge_nodes ${whereClause}`;
    const nodesResult = await this.db.query(nodesQuery, nodeValues);
    const nodes = nodesResult.rows;

    if (nodes.length === 0) {
      return { nodes: [], relationships: [] };
    }

    const nodeIds = nodes.map(node => node.node_id);
    const relsQuery = `
      SELECT *
      FROM knowledge_relationships
      WHERE from_node_id = ANY($1) OR to_node_id = ANY($1)
    `;
    const relsResult = await this.db.query(relsQuery, [nodeIds]);

    return { nodes, relationships: relsResult.rows };
  }

  // ========================================================================
  // AGENT RULES - Manage behavioral rules
  // ========================================================================

  async createAgentRule(data) {
    const query = `
      INSERT INTO agent_rules
        (mode_id, agent_id, rule_name, description, rule_type, condition, action, priority, is_mandatory)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      jsonOrNull(data.mode_id),
      jsonOrNull(data.agent_id),
      data.rule_name,
      jsonOrNull(data.description),
      data.rule_type,
      data.condition || {},
      data.action || {},
      data.priority ?? 0,
      data.is_mandatory ?? false,
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async listAgentRules(filters = {}) {
    const conditions = ['is_active = true'];
    const values = [];

    if (filters.agent_id) {
      conditions.push(`agent_id = $${values.length + 1}`);
      values.push(filters.agent_id);
    }
    if (filters.mode_id) {
      conditions.push(`mode_id = $${values.length + 1}`);
      values.push(filters.mode_id);
    }

    const query = `
      SELECT *
      FROM agent_rules
      WHERE ${conditions.join(' AND ')}
      ORDER BY priority DESC, created_at ASC
    `;

    const result = await this.db.query(query, values);
    return result.rows;
  }

  // ========================================================================
  // DEEPSEEK INTEGRATION - Prompt execution and learning
  // ========================================================================

  async executeDeepSeekPrompt(data) {
    const agent = await this.getAgentInstance(data.agent_id);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const deepseekConfig = agent.deepseek_config || {};
    const apiUrl = deepseekConfig.api_url || process.env.DEEPSEEK_API_URL || 'http://localhost:11434';
    const model = data.model || agent.model_name || DEFAULT_MODEL;

    try {
      const response = await axios.post(
        `${apiUrl}/api/generate`,
        {
          model,
          prompt: data.prompt_text,
          stream: false,
          options: deepseekConfig.options || {},
        },
        { timeout: deepseekConfig.timeout || 60000 }
      );

      const responseText = response.data?.response || '';
      const tokensUsed = response.data?.tokens_used || 0;
      const processingTime = response.data?.processing_time_ms || 0;

      const executionQuery = `
        INSERT INTO prompt_executions
          (template_id, agent_id, session_id, prompt_text, response_text, status, tokens_used, processing_time_ms)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING execution_id
      `;

      const executionValues = [
        jsonOrNull(data.template_id),
        data.agent_id,
        jsonOrNull(data.session_id),
        data.prompt_text,
        responseText,
        'success',
        tokensUsed,
        processingTime,
      ];

      const executionResult = await this.db.query(executionQuery, executionValues);

      return {
        execution_id: executionResult.rows[0].execution_id,
        response_text: responseText,
        tokens_used: tokensUsed,
      };
    } catch (error) {
      const errorQuery = `
        INSERT INTO prompt_executions
          (template_id, agent_id, session_id, prompt_text, status, error_message)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      const errorValues = [
        jsonOrNull(data.template_id),
        data.agent_id,
        jsonOrNull(data.session_id),
        data.prompt_text,
        'error',
        error.message || 'Unknown error',
      ];

      await this.db.query(errorQuery, errorValues);
      throw error;
    }
  }

  // ========================================================================
  // LEARNING & OPTIMIZATION
  // ========================================================================

  async recordLearningEvent(data) {
    const query = `
      INSERT INTO agent_learning_events
        (agent_id, session_id, event_type, event_data, confidence_score)
      VALUES ($1, $2, $3, $4, $5)
    `;

    const values = [
      data.agent_id,
      jsonOrNull(data.session_id),
      data.event_type,
      data.event_data || {},
      jsonOrNull(data.confidence_score),
    ];

    await this.db.query(query, values);
  }

  async recordPerformanceMetric(data) {
    const query = `
      INSERT INTO agent_performance_metrics
        (agent_id, session_id, metric_type, metric_value, benchmark_value, measurement_context)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const values = [
      data.agent_id,
      jsonOrNull(data.session_id),
      data.metric_type,
      data.metric_value,
      jsonOrNull(data.benchmark_value),
      data.measurement_context || {},
    ];

    await this.db.query(query, values);
  }
}

