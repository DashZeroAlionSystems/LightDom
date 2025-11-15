/**
 * Conversation History Service
 * 
 * Manages DeepSeek conversation persistence with:
 * - Database storage of conversation history
 * - Knowledge graph integration
 * - Context and metadata tracking
 * - Session management
 * - Learning and pattern recognition
 */

import { Pool } from 'pg';

/**
 * @typedef {Object} ConversationMessage
 * @property {'user'|'assistant'|'system'|'tool'} role
 * @property {string} content
 * @property {any[]=} tool_calls
 * @property {string=} timestamp
 */

/**
 * @typedef {Object} SessionContext
 * @property {string} sessionId
 * @property {string=} agentId
 * @property {string=} hierarchy
 * @property {string=} userId
 * @property {string=} role
 * @property {string[]=} activeWorkflows
 * @property {string[]=} activeCampaigns
 */

/**
 * @typedef {Object} ConversationMetadata
 * @property {string[]=} toolsUsed
 * @property {string[]=} workflowsCreated
 * @property {string[]=} campaignsStarted
 * @property {string[]=} apisGenerated
 * @property {string[]=} schemasQueried
 */

export class ConversationHistoryService {
  /**
   * @param {Pool} db
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Initialize conversation history tables
   */
  async initializeSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS deepseek_conversations (
        id SERIAL PRIMARY KEY,
        conversation_id TEXT UNIQUE NOT NULL,
        session_context JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS deepseek_messages (
        id SERIAL PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES deepseek_conversations(conversation_id) ON DELETE CASCADE,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        tool_calls JSONB,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}'
      );

      CREATE TABLE IF NOT EXISTS deepseek_knowledge_graph (
        id SERIAL PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        entity_data JSONB NOT NULL,
        relationships JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(conversation_id, entity_type, entity_id)
      );

      CREATE TABLE IF NOT EXISTS deepseek_learning_patterns (
        id SERIAL PRIMARY KEY,
        pattern_type TEXT NOT NULL,
        pattern_data JSONB NOT NULL,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(pattern_type, pattern_data)
      );

      CREATE INDEX IF NOT EXISTS idx_conversations_session 
        ON deepseek_conversations(((session_context->>'sessionId')::text));
      
      CREATE INDEX IF NOT EXISTS idx_messages_conversation 
        ON deepseek_messages(conversation_id);
      
      CREATE INDEX IF NOT EXISTS idx_knowledge_graph_conversation 
        ON deepseek_knowledge_graph(conversation_id);
      
      CREATE INDEX IF NOT EXISTS idx_learning_patterns_type 
        ON deepseek_learning_patterns(pattern_type);
    `);

    console.log('✅ Conversation history schema initialized');
  }

  /**
   * Create or update conversation
   */
  async upsertConversation(conversationId, sessionContext, metadata) {
    await this.db.query(
      `INSERT INTO deepseek_conversations (conversation_id, session_context, metadata, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (conversation_id) 
       DO UPDATE SET 
         session_context = $2,
         metadata = $3,
         updated_at = CURRENT_TIMESTAMP`,
      [conversationId, JSON.stringify(sessionContext), JSON.stringify(metadata || {})]
    );
  }

  /**
   * Add message to conversation
   */
  async addMessage(conversationId, message) {
    await this.db.query(
      `INSERT INTO deepseek_messages (conversation_id, role, content, tool_calls, timestamp, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        conversationId,
        message.role,
        message.content,
        JSON.stringify(message.tool_calls || []),
        message.timestamp || new Date().toISOString(),
        JSON.stringify({}),
      ]
    );
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(conversationId) {
    const result = await this.db.query(
      `SELECT role, content, tool_calls, timestamp 
       FROM deepseek_messages 
       WHERE conversation_id = $1 
       ORDER BY timestamp ASC`,
      [conversationId]
    );

    return result.rows.map(row => ({
      role: row.role,
      content: row.content,
      tool_calls: row.tool_calls,
      timestamp: row.timestamp,
    }));
  }

  /**
   * Get full conversation with context
   */
  async getFullConversation(conversationId) {
    const convResult = await this.db.query(
      `SELECT * FROM deepseek_conversations WHERE conversation_id = $1`,
      [conversationId]
    );

    if (convResult.rows.length === 0) {
      return null;
    }

    const messages = await this.getConversationHistory(conversationId);
    const knowledgeGraph = await this.getKnowledgeGraphForConversation(conversationId);

    return {
      ...convResult.rows[0],
      messages,
      knowledgeGraph,
    };
  }

  /**
   * Add entity to knowledge graph
   */
  async addToKnowledgeGraph(conversationId, entityType, entityId, entityData, relationships = []) {
    await this.db.query(
      `INSERT INTO deepseek_knowledge_graph 
         (conversation_id, entity_type, entity_id, entity_data, relationships)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (conversation_id, entity_type, entity_id)
       DO UPDATE SET
         entity_data = $4,
         relationships = $5`,
      [
        conversationId,
        entityType,
        entityId,
        JSON.stringify(entityData),
        JSON.stringify(relationships),
      ]
    );
  }

  /**
   * Get knowledge graph for conversation
   */
  async getKnowledgeGraphForConversation(conversationId) {
    const result = await this.db.query(
      `SELECT * FROM deepseek_knowledge_graph WHERE conversation_id = $1`,
      [conversationId]
    );

    return result.rows.map(row => ({
      entityType: row.entity_type,
      entityId: row.entity_id,
      entityData: row.entity_data,
      relationships: row.relationships,
      createdAt: row.created_at,
    }));
  }

  /**
   * Record learning pattern
   */
  async recordLearningPattern(patternType, patternData, success) {
    await this.db.query(
      `INSERT INTO deepseek_learning_patterns (pattern_type, pattern_data, success_count, failure_count)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT ON CONSTRAINT deepseek_learning_patterns_pattern_type_pattern_data_key
       DO UPDATE SET
         success_count = deepseek_learning_patterns.success_count + $3,
         failure_count = deepseek_learning_patterns.failure_count + $4,
         last_used = CURRENT_TIMESTAMP`,
      [
        patternType,
        JSON.stringify(patternData),
        success ? 1 : 0,
        success ? 0 : 1,
      ]
    );
  }

  /**
   * Get successful learning patterns
   */
  async getSuccessfulPatterns(patternType, minSuccessRate = 0.7, limit = 10) {
    let query = `
      SELECT 
        pattern_type,
        pattern_data,
        success_count,
        failure_count,
        CAST(success_count AS FLOAT) / NULLIF(success_count + failure_count, 0) as success_rate,
        last_used
      FROM deepseek_learning_patterns
      WHERE CAST(success_count AS FLOAT) / NULLIF(success_count + failure_count, 0) >= $1
    `;
    
    const params = [minSuccessRate];

    if (patternType) {
      query += ` AND pattern_type = $2`;
      params.push(patternType);
      query += ` ORDER BY success_rate DESC, last_used DESC LIMIT $3`;
      params.push(limit);
    } else {
      query += ` ORDER BY success_rate DESC, last_used DESC LIMIT $2`;
      params.push(limit);
    }

    const result = await this.db.query(query, params);
    return result.rows;
  }

  /**
   * Get conversation summaries for a session
   */
  async getSessionConversations(sessionId, limit = 10) {
    const result = await this.db.query(
      `SELECT 
         c.conversation_id,
         c.session_context,
         c.created_at,
         c.updated_at,
         c.metadata,
         COUNT(m.id) as message_count
       FROM deepseek_conversations c
       LEFT JOIN deepseek_messages m ON c.conversation_id = m.conversation_id
       WHERE c.session_context->>'sessionId' = $1
       GROUP BY c.conversation_id, c.session_context, c.created_at, c.updated_at, c.metadata
       ORDER BY c.updated_at DESC
       LIMIT $2`,
      [sessionId, limit]
    );

    return result.rows;
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId) {
    const result = await this.db.query(
      `DELETE FROM deepseek_conversations WHERE conversation_id = $1`,
      [conversationId]
    );

    return result.rowCount > 0;
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(conversationId) {
    const result = await this.db.query(
      `SELECT 
         COUNT(*) FILTER (WHERE role = 'user') as user_messages,
         COUNT(*) FILTER (WHERE role = 'assistant') as assistant_messages,
         COUNT(*) FILTER (WHERE tool_calls IS NOT NULL AND tool_calls != '[]') as tool_calls,
         MIN(timestamp) as first_message,
         MAX(timestamp) as last_message
       FROM deepseek_messages
       WHERE conversation_id = $1`,
      [conversationId]
    );

    return result.rows[0] || {};
  }

  /**
   * Search conversations by content
   */
  async searchConversations(searchQuery, sessionId, limit = 10) {
    let query = `
      SELECT DISTINCT
        c.conversation_id,
        c.session_context,
        c.created_at,
        c.metadata,
        m.content,
        m.timestamp
      FROM deepseek_conversations c
      JOIN deepseek_messages m ON c.conversation_id = m.conversation_id
      WHERE m.content ILIKE $1
    `;

    const params = [`%${searchQuery}%`];

    if (sessionId) {
      query += ` AND c.session_context->>'sessionId' = $2`;
      params.push(sessionId);
      query += ` ORDER BY m.timestamp DESC LIMIT $3`;
      params.push(limit);
    } else {
      query += ` ORDER BY m.timestamp DESC LIMIT $2`;
      params.push(limit);
    }

    const result = await this.db.query(query, params);
    return result.rows;
  }
}

export default ConversationHistoryService;
