/**
 * Agent DeepSeek Service
 * Complete CRUD service for managing AI agents with DeepSeek integration
 */

import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class AgentDeepSeekService {
  constructor(db) {
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
      data.description || null,
      data.mode_type,
      data.function_definition,
      JSON.stringify(data.capabilities || []),
      JSON.stringify(data.knowledge_graph || {}),
      JSON.stringify(data.configuration_schema || {}),
      JSON.stringify(data.default_config || {}),
      data.deepseek_prompt_template || null,
      JSON.stringify(data.rules || []),
      JSON.stringify(data.constraints || {})
    ];
    
    ];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getAgentMode(mode_id) {
    const query = 'SELECT * FROM agent_modes WHERE mode_id = $1';
    const result = await this.db.query(query, [mode_id]);
    return result.rows[0] || null;
  }

  async listAgentModes(filters) {
    let query = 'SELECT * FROM agent_modes WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (mode_type) {
      query += ` AND mode_type = $${paramCount++}`;
      values.push(filters.mode_type);
    }
    if (is_active !== undefined) {
      query += ` AND is_active = $${paramCount++}`;
      values.push(filters.is_active);
    }

    query += ' ORDER BY created_at DESC';
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async updateAgentMode(mode_id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.function_definition !== undefined) {
      fields.push(`function_definition = $${paramCount++}`);
      values.push(updates.function_definition);
    }
    if (updates.capabilities !== undefined) {
      fields.push(`capabilities = $${paramCount++}`);
      values.push(JSON.stringify(updates.capabilities));
    }
    if (updates.knowledge_graph !== undefined) {
      fields.push(`knowledge_graph = $${paramCount++}`);
      values.push(JSON.stringify(updates.knowledge_graph));
    }
    if (updates.rules !== undefined) {
      fields.push(`rules = $${paramCount++}`);
      values.push(JSON.stringify(updates.rules));
    }
    if (updates.is_active !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.is_active);
    }

    if (fields.length === 0) return this.getAgentMode(mode_id);

    const query = `
      UPDATE agent_modes
      SET ${fields.join(', ')}
      WHERE mode_id = $${paramCount}
      RETURNING *
    values.push(mode_id);
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteAgentMode(mode_id) {
    const query = 'DELETE FROM agent_modes WHERE mode_id = $1';
    const result = await this.db.query(query, [mode_id]);
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
      data.description || null,
      data.mode_id,
      JSON.stringify(data.configuration || {}),
      JSON.stringify(data.deepseek_config || {}),
      data.tools_enabled || [],
      data.services_enabled || [],
      data.model_name || 'deepseek-chat',
      data.temperature || 0.7,
      data.max_tokens || 4000
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getAgentInstance(agent_id) {
    const query = 'SELECT * FROM agent_instances WHERE agent_id = $1';
    const result = await this.db.query(query, [agent_id]);
    return result.rows[0] || null;
  }

  async listAgentInstances(filters) {
    let query = 'SELECT * FROM agent_instances WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (mode_id) {
      query += ` AND mode_id = $${paramCount++}`;
      values.push(filters.mode_id);
    }
    if (status) {
      query += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }

    query += ' ORDER BY created_at DESC';
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async updateAgentInstance(agent_id) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.configuration !== undefined) {
      fields.push(`configuration = $${paramCount++}`);
      values.push(JSON.stringify(updates.configuration));
    }
    if (updates.knowledge_graph !== undefined) {
      fields.push(`knowledge_graph = $${paramCount++}`);
      values.push(JSON.stringify(updates.knowledge_graph));
    }
    if (updates.learning_data !== undefined) {
      fields.push(`learning_data = $${paramCount++}`);
      values.push(JSON.stringify(updates.learning_data));
    }

    if (fields.length === 0) return this.getAgentInstance(agent_id);

    fields.push(`last_active_at = $${paramCount++}`);
    values.push(new Date());

    const query = `
      UPDATE agent_instances
      SET ${fields.join(', ')}
      WHERE agent_id = $${paramCount}
      RETURNING *
    values.push(agent_id);
    `;

    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }

  async deleteAgentInstance(agent_id) {
    const query = 'DELETE FROM agent_instances WHERE agent_id = $1';
    const result = await this.db.query(query, [agent_id]);
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
      data.name || null,
      data.description || null,
      JSON.stringify(data.session_context || {})
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getSession(session_id) {
    const query = 'SELECT * FROM agent_sessions WHERE session_id = $1';
    const result = await this.db.query(query, [session_id]);
    return result.rows[0] || null;
  }

  async listSessions(agent_id) {
    let query = 'SELECT * FROM agent_sessions WHERE 1=1';
    const values = [];

    if (agent_id) {
      query += ' AND agent_id = $1';
      values.push(agent_id);
    }

    query += ' ORDER BY created_at DESC';
    const result = await this.db.query(query, values);
    return result.rows;
  }

  async updateSession(session_id) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.session_context !== undefined) {
      fields.push(`session_context = $${paramCount++}`);
      values.push(JSON.stringify(updates.session_context));
    }
    if (updates.knowledge_updates !== undefined) {
      fields.push(`knowledge_updates = $${paramCount++}`);
      values.push(JSON.stringify(updates.knowledge_updates));
    }

    if (fields.length === 0) return this.getSession(session_id);

    const query = `
      UPDATE agent_sessions
      SET ${fields.join(', ')}
      WHERE session_id = $${paramCount}
      RETURNING *
    values.push(session_id);
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
      data.agent_id || null,
      data.mode_id || null,
      data.node_type,
      data.name,
      data.description || null,
      JSON.stringify(data.properties || {})
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getKnowledgeGraph(agent_id) {
    let nodesQuery = 'SELECT * FROM knowledge_nodes WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (agent_id) {
      nodesQuery += ` AND agent_id = $${paramCount++}`;
      values.push(agent_id);
    }
    if (mode_id) {
      nodesQuery += ` AND mode_id = $${paramCount++}`;
      values.push(mode_id);
    }

    const nodesResult = await this.db.query(nodesQuery, values);
    const nodes = nodesResult.rows;

    // Get relationships
    const nodeIds = nodes.map(n => n.node_id);
    let relsQuery = 'SELECT * FROM knowledge_relationships WHERE 1=1';
    if (nodeIds.length > 0) {
      relsQuery += ` AND (from_node_id = ANY($1) OR to_node_id = ANY($1))`;
      const relsResult = await this.db.query(relsQuery, [nodeIds]);
      return { nodes, relationships: relsResult.rows };
    }

    return { nodes, relationships: [] };
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
      data.mode_id || null,
      data.agent_id || null,
      data.rule_name,
      data.description || null,
      data.rule_type,
      JSON.stringify(data.condition),
      JSON.stringify(data.action),
      data.priority || 0,
      data.is_mandatory || false
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async listAgentRules(agent_id) {
    let query = 'SELECT * FROM agent_rules WHERE is_active = true';
    const values = [];
    let paramCount = 1;

    if (agent_id) {
      query += ` AND agent_id = $${paramCount++}`;
      values.push(agent_id);
    }
    if (mode_id) {
      query += ` AND mode_id = $${paramCount++}`;
      values.push(mode_id);
    }

    query += ' ORDER BY priority DESC, created_at ASC';
    const result = await this.db.query(query, values);
    return result.rows;
  }

  // ========================================================================
  // DEEPSEEK INTEGRATION - Prompt execution and learning
  // ========================================================================

  async executeDeepSeekPrompt(data) {
    // Get agent configuration
    const agent = await this.getAgentInstance(data.agent_id);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const deepseekConfig = agent.deepseek_config || {};
    const apiUrl = deepseekConfig.api_url || process.env.DEEPSEEK_API_URL || 'http://localhost:11434';
    const model = agent.model_name || 'deepseek-chat';

    try {
      // Call DeepSeek API
      const response = await axios.post(`${apiUrl}/api/generate`, {

      const responseText = response.data.response || '';
      const tokensUsed = response.data.tokens_used || 0;

      // Save execution record
      const executionQuery = `
        INSERT INTO prompt_executions
          (template_id, agent_id, session_id, prompt_text, response_text, status, tokens_used, processing_time_ms)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING execution_id
      const executionValues = [
        data.template_id || null,
        data.agent_id,
        data.session_id || null,
        data.prompt_text,
        responseText,
        'success',
        tokensUsed,
        response.data.processing_time_ms || 0

      const executionResult = await this.db.query(executionQuery, executionValues);

      return {
        execution_id: executionResult.rows[0].execution_id,
        response_text: responseText,
        tokens_used: tokensUsed
    } catch (error) {
      // Save error execution record
      const executionQuery = `
        INSERT INTO prompt_executions
          (template_id, agent_id, session_id, prompt_text, status, error_message)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING execution_id
      const executionValues = [
        data.template_id || null,
        data.agent_id,
        data.session_id || null,
        data.prompt_text,
        'error',
        error.message

      await this.db.query(executionQuery, executionValues);
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
      data.session_id || null,
      data.event_type,
      JSON.stringify(data.event_data),
      data.confidence_score || null

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
      data.session_id || null,
      data.metric_type,
      data.metric_value,
      data.benchmark_value || null,
      JSON.stringify(data.measurement_context || {})

    await this.db.query(query, values);
  }
}

