/**
 * Unified RAG Service - Complete Redesign
 * 
 * This is a clean, unified RAG implementation inspired by Docling's approach:
 * - Document processing with structure preservation
 * - Semantic chunking with context awareness  
 * - Direct integration with prompt input
 * - Database and codebase access for context
 * - Support for multiple LLM backends (DeepSeek, Llama, Qwen)
 * 
 * @module services/rag/unified-rag-service
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

/**
 * Unified RAG Service Configuration
 */
const DEFAULT_CONFIG = {
  // LLM Configuration
  llm: {
    provider: 'ollama', // 'ollama' | 'deepseek-api' | 'openai'
    model: 'deepseek-r1:latest', // Recommended: deepseek-r1 for RAG
    alternativeModels: ['qwen2.5:14b', 'llama3.3:70b'], // Fallbacks
    temperature: 0.7,
    maxTokens: 4096,
    contextWindow: 128000, // DeepSeek R1 supports 128K
  },
  
  // Embedding Configuration
  embedding: {
    provider: 'ollama',
    model: 'nomic-embed-text',
    dimension: 768,
  },
  
  // Document Processing (Docling-style)
  processing: {
    chunkSize: 1000, // Larger chunks for better context
    chunkOverlap: 200,
    preserveStructure: true, // Keep document structure
    extractMetadata: true,
    supportedFormats: ['text', 'markdown', 'code', 'json', 'html'],
  },
  
  // Vector Store
  vectorStore: {
    tableName: 'rag_documents',
    topK: 5,
    minScore: 0.6,
  },
  
  // Context Sources
  context: {
    enableDatabase: true,
    enableCodebase: true,
    enableFileSystem: true,
    maxContextTokens: 32000, // Max tokens for context
  },
  
  // Endpoints
  endpoints: {
    ollama: process.env.OLLAMA_ENDPOINT || 'http://127.0.0.1:11434',
    deepseek: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
  },
};

/**
 * Document Processor - Docling-style structured extraction
 */
class DocumentProcessor {
  constructor(config) {
    this.config = config;
  }

  /**
   * Process document into structured chunks
   * Preserves semantic structure like Docling
   */
  async process(content, options = {}) {
    const type = options.type || this.detectContentType(content);
    const metadata = options.metadata || {};
    
    let structure;
    switch (type) {
      case 'code':
        structure = this.processCode(content, options);
        break;
      case 'markdown':
        structure = this.processMarkdown(content, options);
        break;
      case 'json':
        structure = this.processJSON(content, options);
        break;
      default:
        structure = this.processText(content, options);
    }
    
    return {
      type,
      metadata: {
        ...metadata,
        processedAt: new Date().toISOString(),
        contentLength: content.length,
      },
      structure,
      chunks: this.createChunks(structure),
    };
  }

  /**
   * Detect content type from content
   */
  detectContentType(content) {
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      try {
        JSON.parse(content);
        return 'json';
      } catch {
        // Not valid JSON
      }
    }
    
    if (content.includes('```') || content.includes('# ')) {
      return 'markdown';
    }
    
    // Check for code patterns
    const codePatterns = [
      /^(import|export|const|let|var|function|class|async)\s/m,
      /^(def|class|import|from)\s/m, // Python
      /^(package|import|public|private)\s/m, // Java
    ];
    
    for (const pattern of codePatterns) {
      if (pattern.test(content)) {
        return 'code';
      }
    }
    
    return 'text';
  }

  /**
   * Process code with structure awareness
   */
  processCode(content, options = {}) {
    const language = options.language || this.detectLanguage(content);
    const sections = [];
    
    // Split by function/class definitions
    const functionPattern = /(?:^|\n)((?:export\s+)?(?:async\s+)?(?:function|const|class)\s+\w+[^{]*\{)/g;
    let lastIndex = 0;
    let match;
    
    while ((match = functionPattern.exec(content)) !== null) {
      if (match.index > lastIndex) {
        sections.push({
          type: 'imports_or_preamble',
          content: content.slice(lastIndex, match.index).trim(),
          startIndex: lastIndex,
        });
      }
      
      // Find the matching closing brace
      const start = match.index;
      let braceCount = 0;
      let end = match.index + match[1].length;
      
      for (let i = match.index + match[1].length; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        else if (content[i] === '}') {
          if (braceCount === 0) {
            end = i + 1;
            break;
          }
          braceCount--;
        }
      }
      
      sections.push({
        type: 'function_or_class',
        content: content.slice(start, end).trim(),
        startIndex: start,
        name: match[1].match(/\w+/g)?.[1] || 'unknown',
      });
      
      lastIndex = end;
    }
    
    // Handle remaining content
    if (lastIndex < content.length) {
      const remaining = content.slice(lastIndex).trim();
      if (remaining) {
        sections.push({
          type: 'remaining',
          content: remaining,
          startIndex: lastIndex,
        });
      }
    }
    
    return {
      type: 'code',
      language,
      sections,
    };
  }

  /**
   * Process markdown with section awareness
   */
  processMarkdown(content, options = {}) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = { type: 'content', content: '', level: 0 };
    
    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
      
      if (headingMatch) {
        // Save previous section
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection, content: currentSection.content.trim() });
        }
        
        currentSection = {
          type: 'heading',
          level: headingMatch[1].length,
          title: headingMatch[2],
          content: '',
        };
      } else if (line.startsWith('```')) {
        // Code block
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection, content: currentSection.content.trim() });
        }
        currentSection = { type: 'code_block', content: line + '\n' };
      } else {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection.content.trim()) {
      sections.push({ ...currentSection, content: currentSection.content.trim() });
    }
    
    return {
      type: 'markdown',
      sections,
    };
  }

  /**
   * Process JSON with structure preservation
   */
  processJSON(content, options = {}) {
    try {
      const parsed = JSON.parse(content);
      return {
        type: 'json',
        structure: this.flattenJSON(parsed),
        original: content,
      };
    } catch {
      return {
        type: 'invalid_json',
        content,
      };
    }
  }

  /**
   * Process plain text
   */
  processText(content, options = {}) {
    // Split into paragraphs
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    
    return {
      type: 'text',
      paragraphs: paragraphs.map((p, i) => ({
        index: i,
        content: p.trim(),
      })),
    };
  }

  /**
   * Flatten JSON for embedding
   */
  flattenJSON(obj, prefix = '') {
    const result = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result.push(...this.flattenJSON(value, path));
      } else {
        result.push({
          path,
          value: JSON.stringify(value),
        });
      }
    }
    
    return result;
  }

  /**
   * Detect programming language
   */
  detectLanguage(content) {
    const patterns = {
      javascript: /(?:import|export|const|let|var|function|=>\s*\{)/,
      typescript: /(?:interface|type\s+\w+\s*=|:\s*\w+\[\]|<\w+>)/,
      python: /(?:def\s+\w+|import\s+\w+|from\s+\w+\s+import|class\s+\w+:)/,
      java: /(?:public\s+class|private\s+|protected\s+|void\s+)/,
      go: /(?:func\s+\w+|package\s+\w+|import\s+\()/,
      rust: /(?:fn\s+\w+|pub\s+fn|impl\s+\w+|struct\s+\w+)/,
    };
    
    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(content)) {
        return lang;
      }
    }
    
    return 'unknown';
  }

  /**
   * Create semantic chunks from structure
   */
  createChunks(structure) {
    const chunks = [];
    const { chunkSize, chunkOverlap } = this.config;
    
    const addChunk = (content, metadata = {}) => {
      if (!content || content.length < 10) return;
      
      const id = crypto.randomUUID();
      chunks.push({
        id,
        content: content.trim(),
        metadata: {
          ...metadata,
          structureType: structure.type,
        },
      });
    };
    
    switch (structure.type) {
      case 'code':
        // Keep functions/classes as units when possible
        for (const section of structure.sections || []) {
          if (section.content.length <= chunkSize) {
            addChunk(section.content, {
              sectionType: section.type,
              name: section.name,
              language: structure.language,
            });
          } else {
            // Split large sections with overlap
            this.splitWithOverlap(section.content, chunkSize, chunkOverlap).forEach((chunk, i) => {
              addChunk(chunk, {
                sectionType: section.type,
                name: section.name,
                partIndex: i,
                language: structure.language,
              });
            });
          }
        }
        break;
        
      case 'markdown':
        // Keep sections with headings together
        let buffer = '';
        let bufferMetadata = {};
        
        for (const section of structure.sections || []) {
          const sectionContent = section.title 
            ? `${'#'.repeat(section.level)} ${section.title}\n${section.content}`
            : section.content;
            
          if (buffer.length + sectionContent.length <= chunkSize) {
            buffer += (buffer ? '\n\n' : '') + sectionContent;
            if (section.title) bufferMetadata.lastHeading = section.title;
          } else {
            if (buffer) addChunk(buffer, bufferMetadata);
            buffer = sectionContent;
            bufferMetadata = section.title ? { lastHeading: section.title } : {};
          }
        }
        
        if (buffer) addChunk(buffer, bufferMetadata);
        break;
        
      case 'json':
        // Group related JSON paths
        const paths = structure.structure || [];
        let jsonBuffer = '';
        
        for (const item of paths) {
          const line = `${item.path}: ${item.value}`;
          if (jsonBuffer.length + line.length <= chunkSize) {
            jsonBuffer += (jsonBuffer ? '\n' : '') + line;
          } else {
            addChunk(jsonBuffer, { type: 'json_paths' });
            jsonBuffer = line;
          }
        }
        
        if (jsonBuffer) addChunk(jsonBuffer, { type: 'json_paths' });
        break;
        
      default:
        // Text - group paragraphs
        const paragraphs = structure.paragraphs || [];
        let textBuffer = '';
        
        for (const para of paragraphs) {
          if (textBuffer.length + para.content.length <= chunkSize) {
            textBuffer += (textBuffer ? '\n\n' : '') + para.content;
          } else {
            addChunk(textBuffer);
            textBuffer = para.content;
          }
        }
        
        if (textBuffer) addChunk(textBuffer);
    }
    
    return chunks;
  }

  /**
   * Split content with overlap
   */
  splitWithOverlap(content, size, overlap) {
    const chunks = [];
    let start = 0;
    
    while (start < content.length) {
      const end = Math.min(start + size, content.length);
      chunks.push(content.slice(start, end));
      start = end - overlap;
      if (start >= content.length - overlap) break;
    }
    
    return chunks;
  }
}

/**
 * Context Builder - Builds context from multiple sources
 */
class ContextBuilder {
  constructor(config, db = null) {
    this.config = config;
    this.db = db;
  }

  /**
   * Build context from query and available sources
   */
  async buildContext(query, options = {}) {
    const context = {
      query,
      sources: [],
      totalTokens: 0,
    };
    
    // Add retrieved documents (from vector search)
    if (options.retrievedDocs?.length) {
      context.sources.push({
        type: 'retrieved',
        content: this.formatRetrievedDocs(options.retrievedDocs),
        priority: 1,
      });
    }
    
    // Add database context if enabled and relevant
    if (this.config.context.enableDatabase && this.db && options.includeDatabase) {
      const dbContext = await this.getRelevantDatabaseContext(query);
      if (dbContext) {
        context.sources.push({
          type: 'database',
          content: dbContext,
          priority: 2,
        });
      }
    }
    
    // Add codebase context if enabled
    if (this.config.context.enableCodebase && options.includeCodebase) {
      const codeContext = await this.getRelevantCodebaseContext(query, options.codebasePath);
      if (codeContext) {
        context.sources.push({
          type: 'codebase',
          content: codeContext,
          priority: 2,
        });
      }
    }
    
    // Sort by priority and build final context
    context.sources.sort((a, b) => a.priority - b.priority);
    
    return context;
  }

  /**
   * Format retrieved documents for context
   */
  formatRetrievedDocs(docs) {
    if (!docs?.length) return '';
    
    return docs.map((doc, i) => {
      const header = `[Document ${i + 1}] (Score: ${doc.score?.toFixed(3) || 'N/A'})`;
      const metadata = doc.metadata ? `Metadata: ${JSON.stringify(doc.metadata)}` : '';
      return `${header}\n${metadata}\n${doc.content}`;
    }).join('\n\n---\n\n');
  }

  /**
   * Get relevant database schema/data context
   */
  async getRelevantDatabaseContext(query) {
    if (!this.db) return null;
    
    try {
      // Get table schemas that might be relevant
      const schemaQuery = `
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
        LIMIT 100
      `;
      
      const { rows } = await this.db.query(schemaQuery);
      
      if (!rows.length) return null;
      
      // Group by table
      const tables = {};
      for (const row of rows) {
        if (!tables[row.table_name]) {
          tables[row.table_name] = [];
        }
        tables[row.table_name].push(`${row.column_name}: ${row.data_type}`);
      }
      
      let context = 'DATABASE SCHEMA:\n';
      for (const [table, columns] of Object.entries(tables)) {
        context += `\nTable: ${table}\n  ${columns.join('\n  ')}\n`;
      }
      
      return context;
    } catch (error) {
      console.warn('Failed to get database context:', error.message);
      return null;
    }
  }

  /**
   * Get relevant codebase context
   */
  async getRelevantCodebaseContext(query, codebasePath = process.cwd()) {
    try {
      // Read project structure
      const packageJsonPath = path.join(codebasePath, 'package.json');
      let context = 'CODEBASE CONTEXT:\n';
      
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        context += `\nProject: ${packageJson.name} v${packageJson.version}`;
        context += `\nDescription: ${packageJson.description || 'N/A'}`;
        context += `\nMain scripts: ${Object.keys(packageJson.scripts || {}).slice(0, 10).join(', ')}`;
      } catch {
        // No package.json
      }
      
      // List key directories
      const entries = await fs.readdir(codebasePath, { withFileTypes: true });
      const dirs = entries
        .filter(e => e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules')
        .map(e => e.name);
      
      context += `\nKey directories: ${dirs.slice(0, 15).join(', ')}`;
      
      return context;
    } catch (error) {
      console.warn('Failed to get codebase context:', error.message);
      return null;
    }
  }

  /**
   * Build the final context string for LLM
   */
  buildContextString(context) {
    if (!context.sources?.length) {
      return 'No relevant context available.';
    }
    
    const parts = context.sources.map(source => {
      const header = `--- ${source.type.toUpperCase()} CONTEXT ---`;
      return `${header}\n${source.content}`;
    });
    
    return parts.join('\n\n');
  }
}

/**
 * LLM Client - Unified interface for multiple LLM providers
 */
class LLMClient {
  constructor(config) {
    this.config = config;
    this.currentProvider = config.llm.provider;
    this.currentModel = config.llm.model;
  }

  /**
   * Get the base URL for current provider
   */
  getBaseUrl() {
    switch (this.currentProvider) {
      case 'ollama':
        return this.config.endpoints.ollama;
      case 'deepseek-api':
        return this.config.endpoints.deepseek;
      default:
        return this.config.endpoints.ollama;
    }
  }

  /**
   * Check if provider is available
   */
  async checkAvailability() {
    const baseUrl = this.getBaseUrl();
    
    try {
      if (this.currentProvider === 'ollama') {
        const response = await fetch(`${baseUrl}/api/tags`, { method: 'GET' });
        return response.ok;
      } else {
        // For API providers, we can't easily check without making a request
        return true;
      }
    } catch {
      return false;
    }
  }

  /**
   * Chat completion (non-streaming)
   */
  async chat(messages, options = {}) {
    const baseUrl = this.getBaseUrl();
    const model = options.model || this.currentModel;
    const temperature = options.temperature ?? this.config.llm.temperature;
    const maxTokens = options.maxTokens ?? this.config.llm.maxTokens;
    
    if (this.currentProvider === 'ollama') {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            temperature,
            num_predict: maxTokens,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.message?.content || '';
    } else {
      // DeepSeek API or OpenAI-compatible
      const apiKey = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY;
      
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    }
  }

  /**
   * Streaming chat completion
   */
  async *streamChat(messages, options = {}) {
    const baseUrl = this.getBaseUrl();
    const model = options.model || this.currentModel;
    const temperature = options.temperature ?? this.config.llm.temperature;
    const maxTokens = options.maxTokens ?? this.config.llm.maxTokens;
    
    if (this.currentProvider === 'ollama') {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          options: {
            temperature,
            num_predict: maxTokens,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Ollama streaming request failed: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.message?.content) {
                yield {
                  type: 'content',
                  content: data.message.content,
                };
              }
              if (data.done) {
                yield { type: 'done' };
              }
            } catch {
              // Skip unparseable lines
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } else {
      // DeepSeek/OpenAI streaming
      const apiKey = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY;
      
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature,
          max_tokens: maxTokens,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API streaming request failed: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));
          
          for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              yield { type: 'done' };
              continue;
            }
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield {
                  type: 'content',
                  content,
                };
              }
            } catch {
              // Skip unparseable
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  }

  /**
   * Generate embeddings
   */
  async embed(texts) {
    if (!Array.isArray(texts) || texts.length === 0) return [];
    
    const baseUrl = this.config.endpoints.ollama;
    const model = this.config.embedding.model;
    
    const response = await fetch(`${baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        input: texts,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Embedding request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data?.map(item => item.embedding) || [];
  }
}

/**
 * Unified RAG Service
 */
export class UnifiedRAGService extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = this.mergeConfig(DEFAULT_CONFIG, options.config || {});
    this.db = options.db || null;
    this.logger = options.logger || console;
    
    this.documentProcessor = new DocumentProcessor(this.config.processing);
    this.contextBuilder = new ContextBuilder(this.config, this.db);
    this.llmClient = new LLMClient(this.config);
    
    // Conversation state
    this.conversations = new Map();
    
    // Stats
    this.stats = {
      queriesProcessed: 0,
      documentsIndexed: 0,
      averageResponseTime: 0,
    };
  }

  /**
   * Merge config with defaults
   */
  mergeConfig(defaults, overrides) {
    const result = { ...defaults };
    
    for (const key of Object.keys(overrides)) {
      if (typeof overrides[key] === 'object' && !Array.isArray(overrides[key])) {
        result[key] = { ...defaults[key], ...overrides[key] };
      } else {
        result[key] = overrides[key];
      }
    }
    
    return result;
  }

  /**
   * Initialize the RAG service
   */
  async initialize() {
    if (this.db) {
      await this.initializeVectorStore();
    }
    
    // Check LLM availability
    const available = await this.llmClient.checkAvailability();
    if (!available) {
      this.logger.warn('LLM provider not available. Some features may not work.');
    }
    
    this.emit('initialized');
  }

  /**
   * Initialize vector store tables
   */
  async initializeVectorStore() {
    const { tableName } = this.config.vectorStore;
    const dimension = this.config.embedding.dimension;
    
    try {
      await this.db.query('CREATE EXTENSION IF NOT EXISTS vector');
    } catch (error) {
      this.logger.warn('Vector extension check failed:', error.message);
    }
    
    const ddl = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        embedding vector(${dimension}),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    
    await this.db.query(ddl);
    
    try {
      await this.db.query(`
        CREATE INDEX IF NOT EXISTS ${tableName}_embedding_idx
        ON ${tableName} USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
      `);
    } catch (error) {
      this.logger.warn('Vector index creation failed:', error.message);
    }
  }

  /**
   * Index a document into the vector store
   */
  async indexDocument(content, options = {}) {
    const documentId = options.documentId || crypto.randomUUID();
    const title = options.title || 'Untitled';
    
    // Process document
    const processed = await this.documentProcessor.process(content, options);
    
    // Generate embeddings for chunks
    const chunkTexts = processed.chunks.map(c => c.content);
    const embeddings = await this.llmClient.embed(chunkTexts);
    
    // Store in vector store
    if (this.db) {
      const client = await this.db.connect();
      
      try {
        await client.query('BEGIN');
        
        // Delete existing chunks for this document
        await client.query(
          `DELETE FROM ${this.config.vectorStore.tableName} WHERE document_id = $1`,
          [documentId]
        );
        
        // Insert new chunks
        for (let i = 0; i < processed.chunks.length; i++) {
          const chunk = processed.chunks[i];
          const embedding = embeddings[i];
          
          await client.query(
            `INSERT INTO ${this.config.vectorStore.tableName} 
             (id, document_id, chunk_index, content, metadata, embedding)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              chunk.id,
              documentId,
              i,
              chunk.content,
              JSON.stringify({
                ...chunk.metadata,
                ...processed.metadata,
                title,
              }),
              `[${embedding.join(',')}]`,
            ]
          );
        }
        
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }
    
    this.stats.documentsIndexed++;
    
    return {
      documentId,
      chunksIndexed: processed.chunks.length,
      metadata: processed.metadata,
    };
  }

  /**
   * Search for relevant documents
   */
  async search(query, options = {}) {
    if (!this.db) {
      return [];
    }
    
    const limit = options.limit || this.config.vectorStore.topK;
    const minScore = options.minScore ?? this.config.vectorStore.minScore;
    
    // Generate query embedding
    const [queryEmbedding] = await this.llmClient.embed([query]);
    
    const sql = `
      SELECT id, document_id, chunk_index, content, metadata,
             1 - (embedding <=> $1) AS score
      FROM ${this.config.vectorStore.tableName}
      ORDER BY embedding <-> $1
      LIMIT $2
    `;
    
    const { rows } = await this.db.query(sql, [
      `[${queryEmbedding.join(',')}]`,
      limit,
    ]);
    
    return rows.filter(row => row.score >= minScore);
  }

  /**
   * Chat with RAG - The main entry point for prompt input
   */
  async chat(prompt, options = {}) {
    const startTime = Date.now();
    const conversationId = options.conversationId || 'default';
    
    // Get or create conversation
    let conversation = this.conversations.get(conversationId) || {
      messages: [],
      context: {},
    };
    
    // Search for relevant documents
    const retrieved = await this.search(prompt, {
      limit: options.topK || 5,
    });
    
    // Build context
    const context = await this.contextBuilder.buildContext(prompt, {
      retrievedDocs: retrieved,
      includeDatabase: options.includeDatabase ?? true,
      includeCodebase: options.includeCodebase ?? true,
      codebasePath: options.codebasePath,
    });
    
    const contextString = this.contextBuilder.buildContextString(context);
    
    // Build messages
    const systemMessage = {
      role: 'system',
      content: this.buildSystemPrompt(contextString, options),
    };
    
    const userMessage = {
      role: 'user',
      content: prompt,
    };
    
    const messages = [
      systemMessage,
      ...conversation.messages.slice(-10), // Last 10 messages for context
      userMessage,
    ];
    
    // Get response
    const response = await this.llmClient.chat(messages, {
      temperature: options.temperature,
      maxTokens: options.maxTokens,
    });
    
    // Update conversation
    conversation.messages.push(userMessage);
    conversation.messages.push({
      role: 'assistant',
      content: response,
    });
    this.conversations.set(conversationId, conversation);
    
    // Update stats
    const responseTime = Date.now() - startTime;
    this.stats.queriesProcessed++;
    this.stats.averageResponseTime = (
      (this.stats.averageResponseTime * (this.stats.queriesProcessed - 1) + responseTime) /
      this.stats.queriesProcessed
    );
    
    return {
      response,
      retrieved,
      conversationId,
      responseTime,
    };
  }

  /**
   * Stream chat response - For real-time UI updates
   */
  async *streamChat(prompt, options = {}) {
    const conversationId = options.conversationId || 'default';
    
    // Get or create conversation
    let conversation = this.conversations.get(conversationId) || {
      messages: [],
      context: {},
    };
    
    // Search for relevant documents
    const retrieved = await this.search(prompt, {
      limit: options.topK || 5,
    });
    
    // Emit context event
    yield {
      type: 'context',
      retrieved,
    };
    
    // Build context
    const context = await this.contextBuilder.buildContext(prompt, {
      retrievedDocs: retrieved,
      includeDatabase: options.includeDatabase ?? true,
      includeCodebase: options.includeCodebase ?? true,
    });
    
    const contextString = this.contextBuilder.buildContextString(context);
    
    // Build messages
    const systemMessage = {
      role: 'system',
      content: this.buildSystemPrompt(contextString, options),
    };
    
    const userMessage = {
      role: 'user',
      content: prompt,
    };
    
    const messages = [
      systemMessage,
      ...conversation.messages.slice(-10),
      userMessage,
    ];
    
    // Stream response
    let fullResponse = '';
    
    for await (const event of this.llmClient.streamChat(messages, options)) {
      if (event.type === 'content') {
        fullResponse += event.content;
        yield {
          type: 'chunk',
          content: event.content,
        };
      } else if (event.type === 'done') {
        yield {
          type: 'done',
          fullResponse,
          conversationId,
        };
      }
    }
    
    // Update conversation
    conversation.messages.push(userMessage);
    conversation.messages.push({
      role: 'assistant',
      content: fullResponse,
    });
    this.conversations.set(conversationId, conversation);
    
    this.stats.queriesProcessed++;
  }

  /**
   * Build system prompt with context
   */
  buildSystemPrompt(contextString, options = {}) {
    const mode = options.mode || 'assistant';
    
    const basePrompt = `You are LightDom RAG Assistant, an AI that helps developers understand and work with their codebase.

You have access to the following context from the knowledge base:

${contextString}

Guidelines:
- Use the provided context to give accurate, relevant answers
- When referencing specific information, mention the source
- If the context doesn't contain enough information, say so honestly
- For code-related questions, provide clear examples when helpful
- Be concise but thorough`;

    const modePrompts = {
      assistant: basePrompt,
      developer: `${basePrompt}

Additional Developer Mode Instructions:
- Focus on practical, actionable advice
- Suggest code improvements and best practices
- Help with debugging and troubleshooting`,
      codebase: `${basePrompt}

Additional Codebase Expert Mode:
- Provide deep insights into code structure and patterns
- Explain architectural decisions
- Help navigate the codebase efficiently`,
    };
    
    return modePrompts[mode] || basePrompt;
  }

  /**
   * Clear conversation history
   */
  clearConversation(conversationId) {
    this.conversations.delete(conversationId);
  }

  /**
   * Get conversation history
   */
  getConversation(conversationId) {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Health check
   */
  async healthCheck() {
    const status = {
      status: 'healthy',
      llm: { status: 'unknown' },
      vectorStore: { status: 'unknown' },
      stats: this.stats,
    };
    
    // Check LLM
    try {
      const available = await this.llmClient.checkAvailability();
      status.llm = {
        status: available ? 'healthy' : 'unavailable',
        provider: this.config.llm.provider,
        model: this.config.llm.model,
      };
    } catch (error) {
      status.llm = { status: 'error', error: error.message };
      status.status = 'degraded';
    }
    
    // Check vector store
    if (this.db) {
      try {
        await this.db.query('SELECT 1');
        status.vectorStore = { status: 'healthy' };
      } catch (error) {
        status.vectorStore = { status: 'error', error: error.message };
        status.status = 'degraded';
      }
    } else {
      status.vectorStore = { status: 'not_configured' };
    }
    
    return status;
  }

  /**
   * Get configuration
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates) {
    this.config = this.mergeConfig(this.config, updates);
    
    // Re-initialize clients with new config
    this.llmClient = new LLMClient(this.config);
    this.contextBuilder = new ContextBuilder(this.config, this.db);
    
    this.emit('config-updated', this.config);
  }
}

/**
 * Create Unified RAG Service instance
 */
export function createUnifiedRAGService(options = {}) {
  return new UnifiedRAGService(options);
}

export default UnifiedRAGService;
