/**
 * DeepSeek Chat Service
 * Manages real-time chat with DeepSeek AI model via Ollama
 */

import { EventEmitter } from 'events';
import fetch from 'node-fetch';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export class DeepSeekChatService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.db = config.db || new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });
    
    this.ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'deepseek-r1:latest';
    this.timeout = parseInt(process.env.OLLAMA_TIMEOUT || '60000');
    
    this.conversations = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🚀 Initializing DeepSeek Chat Service...');
      
      // Ensure database tables exist
      await this.ensureTables();
      
      // Test Ollama connection
      await this.testOllamaConnection();
      
      // Load recent conversations
      await this.loadConversations();
      
      this.isInitialized = true;
      console.log('✅ DeepSeek Chat Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize DeepSeek Chat Service:', error.message);
      throw error;
    }
  }

  async ensureTables() {
    const createTablesSQL = `
      -- Chat conversations table
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255),
        user_id VARCHAR(255),
        context JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        archived BOOLEAN DEFAULT false
      );

      -- Chat messages table
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        tokens INTEGER,
        model VARCHAR(100)
      );

      -- Chat context for prompt engineering
      CREATE TABLE IF NOT EXISTS chat_context (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
        context_type VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        priority INTEGER DEFAULT 5,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_chat_context_conversation ON chat_context(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated ON chat_conversations(updated_at DESC);
      CREATE INDEX IF NOT EXISTS idx_chat_conversations_archived ON chat_conversations(archived);
    `;

    await this.db.query(createTablesSQL);
  }

  async testOllamaConnection() {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`, {
        timeout: 5000,
      });
      
      if (!response.ok) {
        throw new Error(`Ollama API returned ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ Ollama connected: ${data.models?.length || 0} models available`);
      
      // Check if our model is available
      const hasModel = data.models?.some(m => m.name === this.model);
      if (!hasModel) {
        console.warn(`⚠️  Model ${this.model} not found. Available models:`, 
          data.models?.map(m => m.name).join(', '));
      }
    } catch (error) {
      console.warn('⚠️  Ollama connection test failed:', error.message);
      console.warn('   Make sure Ollama is running: ollama serve');
      throw error;
    }
  }

  async loadConversations() {
    const result = await this.db.query(
      `SELECT * FROM chat_conversations 
       WHERE archived = false 
       ORDER BY updated_at DESC 
       LIMIT 100`
    );
    
    for (const row of result.rows) {
      this.conversations.set(row.id, {
        ...row,
        messages: [],
      });
    }
    
    console.log(`📦 Loaded ${this.conversations.size} conversations`);
  }

  async createConversation(title = null, userId = null, context = {}) {
    const id = uuidv4();
    
    await this.db.query(
      `INSERT INTO chat_conversations (id, title, user_id, context)
       VALUES ($1, $2, $3, $4)`,
      [id, title, userId, JSON.stringify(context)]
    );
    
    const conversation = {
      id,
      title,
      user_id: userId,
      context,
      created_at: new Date(),
      updated_at: new Date(),
      archived: false,
      messages: [],
    };
    
    this.conversations.set(id, conversation);
    this.emit('conversation:created', conversation);
    
    console.log(`✅ Created conversation: ${title || id}`);
    return conversation;
  }

  async getConversation(conversationId) {
    let conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      // Load from database
      const result = await this.db.query(
        'SELECT * FROM chat_conversations WHERE id = $1',
        [conversationId]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Conversation ${conversationId} not found`);
      }
      
      conversation = {
        ...result.rows[0],
        messages: [],
      };
      
      this.conversations.set(conversationId, conversation);
    }
    
    // Load messages if not already loaded
    if (conversation.messages.length === 0) {
      const messagesResult = await this.db.query(
        `SELECT * FROM chat_messages 
         WHERE conversation_id = $1 
         ORDER BY created_at ASC`,
        [conversationId]
      );
      
      conversation.messages = messagesResult.rows;
    }
    
    return conversation;
  }

  async sendMessage(conversationId, message, role = 'user') {
    const conversation = await this.getConversation(conversationId);
    
    // Save user message
    const messageId = uuidv4();
    await this.db.query(
      `INSERT INTO chat_messages (id, conversation_id, role, content, model)
       VALUES ($1, $2, $3, $4, $5)`,
      [messageId, conversationId, role, message, this.model]
    );
    
    const userMessage = {
      id: messageId,
      conversation_id: conversationId,
      role,
      content: message,
      created_at: new Date(),
      model: this.model,
    };
    
    conversation.messages.push(userMessage);
    this.emit('message:sent', userMessage);
    
    // Get AI response
    try {
      const response = await this.getAIResponse(conversation);
      
      // Save AI response
      const responseId = uuidv4();
      await this.db.query(
        `INSERT INTO chat_messages (id, conversation_id, role, content, model, tokens)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [responseId, conversationId, 'assistant', response.content, this.model, response.tokens]
      );
      
      const aiMessage = {
        id: responseId,
        conversation_id: conversationId,
        role: 'assistant',
        content: response.content,
        created_at: new Date(),
        model: this.model,
        tokens: response.tokens,
      };
      
      conversation.messages.push(aiMessage);
      this.emit('message:received', aiMessage);
      
      // Update conversation timestamp
      await this.db.query(
        'UPDATE chat_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [conversationId]
      );
      
      return {
        userMessage,
        aiMessage,
      };
    } catch (error) {
      console.error('Failed to get AI response:', error);
      throw error;
    }
  }

  async getAIResponse(conversation) {
    // Build message history for context
    const messages = conversation.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
    
    // Call Ollama API
    const response = await fetch(`${this.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        stream: false,
      }),
      timeout: this.timeout,
    });
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      content: data.message?.content || '',
      tokens: data.eval_count || 0,
    };
  }

  async listConversations(limit = 50, archived = false) {
    const result = await this.db.query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = c.id) as message_count,
        (SELECT content FROM chat_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
       FROM chat_conversations c
       WHERE archived = $1
       ORDER BY updated_at DESC
       LIMIT $2`,
      [archived, limit]
    );
    
    return result.rows;
  }

  async archiveConversation(conversationId) {
    await this.db.query(
      'UPDATE chat_conversations SET archived = true WHERE id = $1',
      [conversationId]
    );
    
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.archived = true;
    }
    
    this.emit('conversation:archived', conversationId);
  }

  async deleteConversation(conversationId) {
    await this.db.query(
      'DELETE FROM chat_conversations WHERE id = $1',
      [conversationId]
    );
    
    this.conversations.delete(conversationId);
    this.emit('conversation:deleted', conversationId);
  }

  async getStatus() {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`, { timeout: 3000 });
      const data = await response.json();
      
      return {
        initialized: this.isInitialized,
        ollamaConnected: true,
        ollamaUrl: this.ollamaUrl,
        model: this.model,
        availableModels: data.models?.map(m => m.name) || [],
        conversations: this.conversations.size,
      };
    } catch (error) {
      return {
        initialized: this.isInitialized,
        ollamaConnected: false,
        ollamaUrl: this.ollamaUrl,
        model: this.model,
        error: error.message,
      };
    }
  }

  async close() {
    console.log('🛑 Closing DeepSeek Chat Service...');
    await this.db.end();
    console.log('✅ DeepSeek Chat Service closed');
  }
}

export default DeepSeekChatService;
