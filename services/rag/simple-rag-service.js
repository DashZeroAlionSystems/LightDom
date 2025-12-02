/**
 * Simple RAG Service for LightDom
 * 
 * A clean, minimal RAG implementation that:
 * - Works with Ollama out of the box
 * - Uses pgvector for vector storage
 * - Saves all interactions to database
 * - Supports MCP tool calling
 * 
 * @module services/rag/simple-rag-service
 */

import crypto from 'crypto';

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  // Ollama settings
  ollamaEndpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
  llmModel: process.env.OLLAMA_MODEL || 'deepseek-r1:latest',
  embeddingModel: process.env.EMBEDDING_MODEL || 'nomic-embed-text',
  embeddingDimension: 768,
  
  // RAG settings
  chunkSize: parseInt(process.env.RAG_CHUNK_SIZE || '1000', 10),
  chunkOverlap: parseInt(process.env.RAG_CHUNK_OVERLAP || '200', 10),
  topK: parseInt(process.env.RAG_TOP_K || '5', 10),
  minScore: parseFloat(process.env.RAG_MIN_SCORE || '0.6'),
  
  // Database table names
  documentsTable: 'rag_documents',
  queryLogTable: 'rag_query_log',
  sessionsTable: 'rag_sessions',
};

/**
 * Simple text chunker
 */
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  const cleanText = text.replace(/\r\n/g, '\n').trim();
  
  if (cleanText.length <= chunkSize) {
    return [{ index: 0, content: cleanText }];
  }
  
  let start = 0;
  let index = 0;
  
  while (start < cleanText.length) {
    const end = Math.min(start + chunkSize, cleanText.length);
    const chunk = cleanText.slice(start, end);
    
    chunks.push({
      index,
      content: chunk,
    });
    
    start = end - overlap;
    index++;
    
    if (start >= cleanText.length - overlap) {
      break;
    }
  }
  
  return chunks;
}

/**
 * Format embedding as PostgreSQL vector literal
 */
function toVectorLiteral(embedding) {
  if (!Array.isArray(embedding)) {
    throw new Error('Embedding must be an array');
  }
  return `[${embedding.join(',')}]`;
}

/**
 * Create Simple RAG Service
 */
export function createSimpleRagService(db, config = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  /**
   * Initialize database tables
   */
  async function init() {
    // Ensure pgvector extension
    try {
      await db.query('CREATE EXTENSION IF NOT EXISTS vector');
    } catch (e) {
      console.warn('pgvector extension check:', e.message);
    }
    
    // Create documents table
    await db.query(`
      CREATE TABLE IF NOT EXISTS ${cfg.documentsTable} (
        id SERIAL PRIMARY KEY,
        doc_id TEXT NOT NULL,
        namespace TEXT DEFAULT 'default',
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        embedding vector(${cfg.embeddingDimension}),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(doc_id, namespace, chunk_index)
      )
    `);
    
    // Create vector index
    try {
      await db.query(`
        CREATE INDEX IF NOT EXISTS ${cfg.documentsTable}_embedding_idx
        ON ${cfg.documentsTable} USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
      `);
    } catch (e) {
      console.warn('Vector index creation:', e.message);
    }
    
    // Create query log table
    await db.query(`
      CREATE TABLE IF NOT EXISTS ${cfg.queryLogTable} (
        id SERIAL PRIMARY KEY,
        session_id TEXT,
        query TEXT NOT NULL,
        namespace TEXT DEFAULT 'default',
        context_doc_ids TEXT[],
        context_scores REAL[],
        response TEXT,
        model_used TEXT,
        retrieval_time_ms INTEGER,
        generation_time_ms INTEGER,
        total_time_ms INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    // Create sessions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS ${cfg.sessionsTable} (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        namespace TEXT DEFAULT 'default',
        messages JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    
    console.log('[SimpleRAG] Database initialized');
  }
  
  /**
   * Generate embeddings via Ollama
   */
  async function embed(texts) {
    if (!Array.isArray(texts) || texts.length === 0) {
      return [];
    }
    
    const embeddings = [];
    
    for (const text of texts) {
      const response = await fetch(`${cfg.ollamaEndpoint}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: cfg.embeddingModel,
          prompt: text,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Embedding failed: ${response.status}`);
      }
      
      const data = await response.json();
      embeddings.push(data.embedding);
    }
    
    return embeddings;
  }
  
  /**
   * Index a document
   */
  async function indexDocument(doc) {
    const { id, content, namespace = 'default', metadata = {} } = doc;
    
    if (!id || !content) {
      throw new Error('Document requires id and content');
    }
    
    // Chunk the document
    const chunks = chunkText(content, cfg.chunkSize, cfg.chunkOverlap);
    
    // Generate embeddings
    const embeddings = await embed(chunks.map(c => c.content));
    
    // Store in database
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      
      // Delete existing chunks for this doc
      await client.query(
        `DELETE FROM ${cfg.documentsTable} WHERE doc_id = $1 AND namespace = $2`,
        [id, namespace]
      );
      
      // Insert new chunks
      for (let i = 0; i < chunks.length; i++) {
        await client.query(
          `INSERT INTO ${cfg.documentsTable} 
           (doc_id, namespace, chunk_index, content, metadata, embedding)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            id,
            namespace,
            chunks[i].index,
            chunks[i].content,
            JSON.stringify(metadata),
            toVectorLiteral(embeddings[i]),
          ]
        );
      }
      
      await client.query('COMMIT');
      
      console.log(`[SimpleRAG] Indexed document ${id}: ${chunks.length} chunks`);
      
      return {
        docId: id,
        chunks: chunks.length,
        namespace,
      };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
  
  /**
   * Search for relevant documents
   */
  async function search(query, options = {}) {
    const { namespace = 'default', topK = cfg.topK, minScore = cfg.minScore } = options;
    
    const startTime = Date.now();
    
    // Generate query embedding
    const [queryEmbedding] = await embed([query]);
    
    // Search database
    const { rows } = await db.query(
      `SELECT 
        doc_id,
        chunk_index,
        content,
        metadata,
        1 - (embedding <=> $1) AS score
       FROM ${cfg.documentsTable}
       WHERE namespace = $2
       ORDER BY embedding <=> $1
       LIMIT $3`,
      [toVectorLiteral(queryEmbedding), namespace, topK]
    );
    
    const results = rows
      .filter(row => row.score >= minScore)
      .map(row => ({
        docId: row.doc_id,
        chunkIndex: row.chunk_index,
        content: row.content,
        metadata: row.metadata,
        score: row.score,
      }));
    
    const elapsed = Date.now() - startTime;
    console.log(`[SimpleRAG] Search: ${results.length} results in ${elapsed}ms`);
    
    return {
      results,
      timeMs: elapsed,
    };
  }
  
  /**
   * Chat with RAG context
   */
  async function chat(messages, options = {}) {
    const { namespace = 'default', sessionId, topK = cfg.topK } = options;
    
    const startTime = Date.now();
    
    // Get the last user message
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const query = lastUserMsg?.content || '';
    
    // Search for context
    let retrievalTime = 0;
    let contextDocs = [];
    let contextScores = [];
    let contextText = '';
    
    if (query) {
      const searchStart = Date.now();
      const searchResults = await search(query, { namespace, topK });
      retrievalTime = Date.now() - searchStart;
      
      contextDocs = searchResults.results.map(r => r.docId);
      contextScores = searchResults.results.map(r => r.score);
      
      if (searchResults.results.length > 0) {
        contextText = searchResults.results
          .map((r, i) => `[Document ${i + 1}] (score: ${r.score.toFixed(3)})\n${r.content}`)
          .join('\n\n---\n\n');
      }
    }
    
    // Build augmented messages
    const systemPrompt = `You are LightDom AI Assistant. Use the provided context to answer questions accurately.
If the context doesn't contain relevant information, say so honestly.
Always cite the document number when referencing information from context.`;
    
    const augmentedMessages = [
      { role: 'system', content: systemPrompt },
    ];
    
    if (contextText) {
      augmentedMessages.push({
        role: 'system',
        content: `Context Documents:\n\n${contextText}`,
      });
    }
    
    augmentedMessages.push(...messages);
    
    // Call Ollama
    const genStart = Date.now();
    const response = await fetch(`${cfg.ollamaEndpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: cfg.llmModel,
        messages: augmentedMessages,
        stream: false,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Chat failed: ${response.status}`);
    }
    
    const data = await response.json();
    const generationTime = Date.now() - genStart;
    const totalTime = Date.now() - startTime;
    
    const assistantMessage = data.message?.content || '';
    
    // Log the query
    await db.query(
      `INSERT INTO ${cfg.queryLogTable}
       (session_id, query, namespace, context_doc_ids, context_scores, response, model_used, retrieval_time_ms, generation_time_ms, total_time_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        sessionId || null,
        query,
        namespace,
        contextDocs,
        contextScores,
        assistantMessage,
        cfg.llmModel,
        retrievalTime,
        generationTime,
        totalTime,
      ]
    );
    
    console.log(`[SimpleRAG] Chat: retrieval=${retrievalTime}ms, generation=${generationTime}ms, total=${totalTime}ms`);
    
    return {
      message: assistantMessage,
      context: {
        documents: contextDocs,
        scores: contextScores,
      },
      timing: {
        retrieval: retrievalTime,
        generation: generationTime,
        total: totalTime,
      },
    };
  }
  
  /**
   * Stream chat with RAG context
   */
  async function streamChat(messages, options = {}) {
    const { namespace = 'default', topK = cfg.topK } = options;
    
    // Get the last user message
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const query = lastUserMsg?.content || '';
    
    // Search for context
    let contextText = '';
    if (query) {
      const searchResults = await search(query, { namespace, topK });
      if (searchResults.results.length > 0) {
        contextText = searchResults.results
          .map((r, i) => `[Document ${i + 1}]\n${r.content}`)
          .join('\n\n---\n\n');
      }
    }
    
    // Build augmented messages
    const systemPrompt = `You are LightDom AI Assistant. Use the provided context to answer questions accurately.`;
    
    const augmentedMessages = [
      { role: 'system', content: systemPrompt },
    ];
    
    if (contextText) {
      augmentedMessages.push({
        role: 'system',
        content: `Context:\n${contextText}`,
      });
    }
    
    augmentedMessages.push(...messages);
    
    // Stream from Ollama
    const response = await fetch(`${cfg.ollamaEndpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: cfg.llmModel,
        messages: augmentedMessages,
        stream: true,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Stream chat failed: ${response.status}`);
    }
    
    return response.body;
  }
  
  /**
   * Health check
   */
  async function healthCheck() {
    const report = {
      status: 'ok',
      components: {},
    };
    
    // Check database
    try {
      await db.query('SELECT 1');
      report.components.database = { status: 'ok' };
    } catch (e) {
      report.components.database = { status: 'error', error: e.message };
      report.status = 'error';
    }
    
    // Check Ollama
    try {
      const res = await fetch(`${cfg.ollamaEndpoint}/api/tags`);
      if (res.ok) {
        report.components.ollama = { status: 'ok' };
      } else {
        report.components.ollama = { status: 'error', httpStatus: res.status };
        report.status = 'error';
      }
    } catch (e) {
      report.components.ollama = { status: 'error', error: e.message };
      report.status = 'error';
    }
    
    // Check embedding model
    try {
      await embed(['test']);
      report.components.embedding = { status: 'ok', model: cfg.embeddingModel };
    } catch (e) {
      report.components.embedding = { status: 'error', error: e.message };
      report.status = 'error';
    }
    
    return report;
  }
  
  /**
   * Get statistics
   */
  async function getStats() {
    const docCount = await db.query(
      `SELECT COUNT(DISTINCT doc_id) as count FROM ${cfg.documentsTable}`
    );
    
    const chunkCount = await db.query(
      `SELECT COUNT(*) as count FROM ${cfg.documentsTable}`
    );
    
    const queryCount = await db.query(
      `SELECT COUNT(*) as count FROM ${cfg.queryLogTable}`
    );
    
    const avgTimes = await db.query(
      `SELECT 
        AVG(retrieval_time_ms) as avg_retrieval,
        AVG(generation_time_ms) as avg_generation,
        AVG(total_time_ms) as avg_total
       FROM ${cfg.queryLogTable}
       WHERE created_at > NOW() - INTERVAL '24 hours'`
    );
    
    return {
      documents: parseInt(docCount.rows[0]?.count || 0),
      chunks: parseInt(chunkCount.rows[0]?.count || 0),
      queries: parseInt(queryCount.rows[0]?.count || 0),
      avgTiming: {
        retrieval: parseFloat(avgTimes.rows[0]?.avg_retrieval || 0),
        generation: parseFloat(avgTimes.rows[0]?.avg_generation || 0),
        total: parseFloat(avgTimes.rows[0]?.avg_total || 0),
      },
    };
  }
  
  /**
   * Delete document
   */
  async function deleteDocument(docId, namespace = 'default') {
    await db.query(
      `DELETE FROM ${cfg.documentsTable} WHERE doc_id = $1 AND namespace = $2`,
      [docId, namespace]
    );
    console.log(`[SimpleRAG] Deleted document ${docId}`);
  }
  
  /**
   * List documents
   */
  async function listDocuments(namespace = 'default') {
    const { rows } = await db.query(
      `SELECT 
        doc_id,
        COUNT(*) as chunk_count,
        MAX(created_at) as last_indexed
       FROM ${cfg.documentsTable}
       WHERE namespace = $1
       GROUP BY doc_id
       ORDER BY last_indexed DESC`,
      [namespace]
    );
    
    return rows.map(row => ({
      docId: row.doc_id,
      chunks: parseInt(row.chunk_count),
      lastIndexed: row.last_indexed,
    }));
  }
  
  return {
    init,
    indexDocument,
    search,
    chat,
    streamChat,
    healthCheck,
    getStats,
    deleteDocument,
    listDocuments,
    config: cfg,
  };
}

export default createSimpleRagService;
