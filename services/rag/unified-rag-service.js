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
 * Enhanced Features:
 * - Multimodal support (images via DeepSeek OCR)
 * - Hybrid search (keyword + semantic)
 * - Document versioning
 * - Streaming tool execution
 * - Agent mode with planning
 * 
 * @module services/rag/unified-rag-service
 */

import crypto from 'node:crypto';
import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

// Import deepseek tools with fallback for environments where it may not be available
let deepseekTools = null;
try {
  const toolsModule = await import('./deepseek-tools.js');
  deepseekTools = toolsModule.deepseekTools || toolsModule.default;
} catch (error) {
  console.warn('DeepSeek tools not available:', error.message);
  deepseekTools = {
    command: () => Promise.resolve({ success: false, error: 'Tools not available' }),
    git: {},
    file: {},
    project: {},
    system: {},
  };
}

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
    supportedFormats: ['text', 'markdown', 'code', 'json', 'html', 'image'],
  },
  
  // Vector Store
  vectorStore: {
    tableName: 'rag_documents',
    versionsTableName: 'rag_document_versions', // NEW: for versioning
    topK: 5,
    minScore: 0.6,
  },
  
  // Hybrid Search Configuration (NEW)
  hybridSearch: {
    enabled: true,
    semanticWeight: 0.7, // Weight for semantic search
    keywordWeight: 0.3,  // Weight for keyword search
    minKeywordScore: 0.3,
  },
  
  // Multimodal Configuration (NEW)
  multimodal: {
    enabled: true,
    ocrEndpoint: process.env.OCR_WORKER_ENDPOINT || 'http://localhost:8000',
    supportedImageTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    maxImageSize: 25 * 1024 * 1024, // 25MB
  },
  
  // Docling Configuration (NEW)
  docling: {
    enabled: true,
    endpoint: process.env.DOCLING_ENDPOINT || 'http://localhost:8001',
    supportedFormats: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
      'text/html',
      'text/markdown',
      'text/asciidoc',
      'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/tiff', 'image/bmp',
    ],
    chunkSize: 1000,
    chunkOverlap: 200,
    extractTables: true,
    extractFigures: true,
  },
  
  // Document Versioning (NEW)
  versioning: {
    enabled: true,
    maxVersions: 10, // Keep last 10 versions per document
    trackChanges: true,
  },
  
  // Agent Configuration (NEW)
  agent: {
    enabled: true,
    planningEnabled: true,
    maxSteps: 10, // Maximum planning steps
    tools: ['file', 'git', 'project', 'system'], // Available tool categories
  },
  
  // Context Sources
  context: {
    enableDatabase: true,
    enableCodebase: true,
    enableFileSystem: true,
    maxContextTokens: 32000, // Max tokens for context
  },
  
  // Endpoints - check multiple env var names for compatibility
  endpoints: {
    ollama: process.env.OLLAMA_ENDPOINT || process.env.OLLAMA_API_URL || 'http://127.0.0.1:11434',
    deepseek: process.env.DEEPSEEK_API_URL || process.env.DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1',
  },
};

/**
 * Image Processor - Multimodal support via DeepSeek OCR
 */
class ImageProcessor {
  constructor(config) {
    this.config = config;
  }

  /**
   * Process image using OCR
   * @param {Buffer|string} imageData - Image buffer or base64 string
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Extracted text and metadata
   */
  async processImage(imageData, options = {}) {
    const ocrEndpoint = this.config.multimodal?.ocrEndpoint || 'http://localhost:8000';
    
    try {
      // Prepare base64 data
      let base64Data;
      if (Buffer.isBuffer(imageData)) {
        base64Data = `data:image/png;base64,${imageData.toString('base64')}`;
      } else if (typeof imageData === 'string') {
        base64Data = imageData.startsWith('data:') ? imageData : `data:image/png;base64,${imageData}`;
      } else {
        throw new Error('Invalid image data format');
      }

      const response = await fetch(`${ocrEndpoint}/ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data,
          languageHint: options.language || 'en',
          compressionRatio: options.compressionRatio || 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OCR request failed: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        text: result.text || '',
        confidence: result.confidence || 0,
        language: result.language,
        blocks: result.blocks || [],
        metadata: {
          type: 'image',
          processedAt: new Date().toISOString(),
          ocrModel: result.model || 'unknown',
          latencyMs: result.latencyMs,
        },
      };
    } catch (error) {
      console.warn('OCR processing failed:', error.message);
      return {
        text: '',
        confidence: 0,
        error: error.message,
        metadata: { type: 'image', error: true },
      };
    }
  }

  /**
   * Check if OCR service is available
   */
  async checkOCRAvailability() {
    try {
      const ocrEndpoint = this.config.multimodal?.ocrEndpoint || 'http://localhost:8000';
      const response = await fetch(`${ocrEndpoint}/health`, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Docling Client - Document conversion via Docling service
 * Supports: PDF, DOCX, PPTX, XLSX, HTML, Images, Markdown, AsciiDoc
 */
class DoclingClient {
  constructor(config) {
    this.config = config;
    this.endpoint = config.docling?.endpoint || 'http://localhost:8001';
  }

  /**
   * Check if Docling service is available
   */
  async checkAvailability() {
    try {
      const response = await fetch(`${this.endpoint}/health`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        return {
          available: true,
          doclingAvailable: data.docling_available,
          supportedFormats: data.supported_formats,
        };
      }
      return { available: false };
    } catch {
      return { available: false };
    }
  }

  /**
   * Get supported document formats
   */
  async getSupportedFormats() {
    try {
      const response = await fetch(`${this.endpoint}/formats`, { method: 'GET' });
      if (response.ok) {
        return await response.json();
      }
      return { formats: {}, all_mimetypes: [] };
    } catch {
      return { formats: {}, all_mimetypes: [] };
    }
  }

  /**
   * Convert a document using Docling
   * @param {Buffer|Blob} fileData - File data
   * @param {string} filename - Original filename
   * @param {string} contentType - MIME type
   * @param {Object} options - Conversion options
   */
  async convertDocument(fileData, filename, contentType, options = {}) {
    const formData = new FormData();
    
    // Create blob from buffer if needed
    const blob = fileData instanceof Blob ? fileData : new Blob([fileData], { type: contentType });
    formData.append('file', blob, filename);
    formData.append('chunk_size', String(options.chunkSize || this.config.docling?.chunkSize || 1000));
    formData.append('chunk_overlap', String(options.chunkOverlap || this.config.docling?.chunkOverlap || 200));
    formData.append('extract_tables', String(options.extractTables ?? this.config.docling?.extractTables ?? true));
    formData.append('extract_figures', String(options.extractFigures ?? this.config.docling?.extractFigures ?? true));

    try {
      const response = await fetch(`${this.endpoint}/convert`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Docling conversion failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      return {
        success: result.success,
        documentId: result.document_id,
        format: result.format,
        text: result.text,
        markdown: result.markdown,
        chunks: result.chunks || [],
        tables: result.tables || [],
        figures: result.figures || [],
        sections: result.sections || [],
        metadata: result.metadata || {},
        processingTimeMs: result.processing_time_ms,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        text: '',
        chunks: [],
      };
    }
  }

  /**
   * Convert a document from URL
   */
  async convertFromUrl(url, options = {}) {
    const formData = new FormData();
    formData.append('url', url);
    formData.append('chunk_size', String(options.chunkSize || this.config.docling?.chunkSize || 1000));

    try {
      const response = await fetch(`${this.endpoint}/convert/url`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Docling URL conversion failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if a file type is supported
   */
  isSupported(contentType) {
    const supportedFormats = this.config.docling?.supportedFormats || [];
    return supportedFormats.includes(contentType);
  }
}

/**
 * Hybrid Search Engine - Combines keyword and semantic search
 */
class HybridSearchEngine {
  constructor(config, db) {
    this.config = config;
    this.db = db;
  }

  /**
   * Perform keyword search using PostgreSQL full-text search
   */
  async keywordSearch(query, options = {}) {
    if (!this.db) return [];
    
    const limit = options.limit || this.config.vectorStore.topK;
    // Table name is from configuration, not user input - sanitize for safety
    const tableName = this.sanitizeIdentifier(this.config.vectorStore.tableName);
    
    // Use PostgreSQL's to_tsquery for keyword search
    const sql = `
      SELECT id, document_id, chunk_index, content, metadata,
             ts_rank(to_tsvector('english', content), plainto_tsquery('english', $1)) AS score
      FROM ${tableName}
      WHERE to_tsvector('english', content) @@ plainto_tsquery('english', $1)
      ORDER BY score DESC
      LIMIT $2
    `;
    
    try {
      const { rows } = await this.db.query(sql, [query, limit]);
      return rows;
    } catch (error) {
      console.warn('Keyword search failed:', error.message);
      return [];
    }
  }
  
  /**
   * Sanitize SQL identifier (table/column name)
   */
  sanitizeIdentifier(name) {
    // Only allow alphanumeric characters and underscores
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      throw new Error(`Invalid SQL identifier: ${name}`);
    }
    return name;
  }

  /**
   * Combine semantic and keyword search results
   */
  combineResults(semanticResults, keywordResults, options = {}) {
    const semanticWeight = options.semanticWeight ?? this.config.hybridSearch?.semanticWeight ?? 0.7;
    const keywordWeight = options.keywordWeight ?? this.config.hybridSearch?.keywordWeight ?? 0.3;
    
    // Create a map to combine scores
    const combined = new Map();
    
    // Add semantic results
    for (const result of semanticResults) {
      combined.set(result.id, {
        ...result,
        semanticScore: result.score,
        keywordScore: 0,
        combinedScore: result.score * semanticWeight,
      });
    }
    
    // Add/update with keyword results
    for (const result of keywordResults) {
      const existing = combined.get(result.id);
      if (existing) {
        existing.keywordScore = result.score;
        existing.combinedScore = 
          existing.semanticScore * semanticWeight + result.score * keywordWeight;
      } else {
        combined.set(result.id, {
          ...result,
          semanticScore: 0,
          keywordScore: result.score,
          combinedScore: result.score * keywordWeight,
        });
      }
    }
    
    // Sort by combined score and return
    return Array.from(combined.values())
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, options.limit || this.config.vectorStore.topK);
  }
}

/**
 * Document Version Manager - Track document changes
 */
class DocumentVersionManager {
  constructor(config, db) {
    this.config = config;
    this.db = db;
  }

  /**
   * Initialize versioning tables
   */
  async initializeVersionTable() {
    if (!this.db || !this.config.versioning?.enabled) return;
    
    const tableName = this.config.vectorStore.versionsTableName || 'rag_document_versions';
    
    const ddl = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        content_hash TEXT NOT NULL,
        chunk_count INTEGER DEFAULT 0,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(document_id, version)
      )
    `;
    
    try {
      await this.db.query(ddl);
    } catch (error) {
      console.warn('Version table creation failed:', error.message);
    }
  }

  /**
   * Create a new version for a document
   */
  async createVersion(documentId, content, metadata = {}) {
    if (!this.db || !this.config.versioning?.enabled) {
      return { version: 1, isNew: true };
    }
    
    const tableName = this.config.vectorStore.versionsTableName || 'rag_document_versions';
    const contentHash = crypto.createHash('sha256').update(content).digest('hex');
    
    // Get current version
    const versionResult = await this.db.query(
      `SELECT MAX(version) as max_version, content_hash 
       FROM ${tableName} 
       WHERE document_id = $1
       GROUP BY content_hash
       ORDER BY MAX(version) DESC
       LIMIT 1`,
      [documentId]
    );
    
    const currentVersion = versionResult.rows[0]?.max_version || 0;
    const lastHash = versionResult.rows[0]?.content_hash;
    
    // Check if content has changed
    if (lastHash === contentHash) {
      return { version: currentVersion, isNew: false, unchanged: true };
    }
    
    const newVersion = currentVersion + 1;
    const versionId = `${documentId}::v${newVersion}`;
    
    // Insert new version
    await this.db.query(
      `INSERT INTO ${tableName} (id, document_id, version, content_hash, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [versionId, documentId, newVersion, contentHash, JSON.stringify(metadata)]
    );
    
    // Cleanup old versions if exceeding limit
    const maxVersions = this.config.versioning?.maxVersions || 10;
    await this.db.query(
      `DELETE FROM ${tableName} 
       WHERE document_id = $1 
         AND version <= $2 - $3`,
      [documentId, newVersion, maxVersions]
    );
    
    return { version: newVersion, isNew: true, contentHash };
  }

  /**
   * Get version history for a document
   */
  async getVersionHistory(documentId) {
    if (!this.db) return [];
    
    const tableName = this.config.vectorStore.versionsTableName || 'rag_document_versions';
    
    const { rows } = await this.db.query(
      `SELECT version, content_hash, chunk_count, metadata, created_at
       FROM ${tableName}
       WHERE document_id = $1
       ORDER BY version DESC`,
      [documentId]
    );
    
    return rows;
  }
}

/**
 * Agent Planner - Planning and tool execution for agent mode
 */
class AgentPlanner {
  constructor(config, llmClient) {
    this.config = config;
    this.llmClient = llmClient;
    this.tools = deepseekTools;
  }

  /**
   * Create an execution plan for a task
   */
  async createPlan(task, context = {}) {
    const planningPrompt = `You are an AI agent that can execute tasks using available tools.

AVAILABLE TOOLS:
1. file.read(filePath) - Read a file
2. file.write(filePath, content) - Write to a file
3. file.list(dirPath) - List directory contents
4. git.status() - Get git status
5. git.diff() - Get git diff
6. git.log() - Get commit log
7. project.getInfo() - Get project information
8. system.getInfo() - Get system information

TASK: ${task}

CONTEXT: ${JSON.stringify(context)}

Create a step-by-step plan to accomplish this task. For each step, specify:
1. The action to take
2. The tool to use (if any)
3. The expected outcome

Return your plan as a JSON array with this structure:
[
  {
    "step": 1,
    "action": "description of action",
    "tool": "tool.method" or null,
    "params": {} or null,
    "expectedOutcome": "what we expect to happen"
  }
]

Only return the JSON array, no other text.`;

    try {
      const response = await this.llmClient.chat([
        { role: 'system', content: 'You are a planning agent. Always respond with valid JSON.' },
        { role: 'user', content: planningPrompt },
      ], { temperature: 0.3 });

      // Robust JSON extraction with multiple strategies
      let plan = null;
      
      // Strategy 1: Try to parse the entire response as JSON
      try {
        plan = JSON.parse(response.trim());
        if (!Array.isArray(plan)) plan = null;
      } catch {
        // Not valid JSON, try extraction strategies
      }
      
      // Strategy 2: Extract JSON array using regex
      if (!plan) {
        // Find the outermost matching brackets
        const startIdx = response.indexOf('[');
        if (startIdx !== -1) {
          let bracketCount = 0;
          let endIdx = -1;
          
          for (let i = startIdx; i < response.length; i++) {
            if (response[i] === '[') bracketCount++;
            else if (response[i] === ']') {
              bracketCount--;
              if (bracketCount === 0) {
                endIdx = i + 1;
                break;
              }
            }
          }
          
          if (endIdx !== -1) {
            try {
              plan = JSON.parse(response.slice(startIdx, endIdx));
            } catch {
              // Failed to parse extracted JSON
            }
          }
        }
      }
      
      // Strategy 3: Look for JSON in code blocks
      if (!plan) {
        const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
          try {
            plan = JSON.parse(codeBlockMatch[1].trim());
          } catch {
            // Failed to parse code block content
          }
        }
      }
      
      if (Array.isArray(plan) && plan.length > 0) {
        return {
          success: true,
          plan,
          totalSteps: plan.length,
        };
      }
      
      throw new Error('Could not parse valid plan from response');
    } catch (error) {
      return {
        success: false,
        error: error.message,
        plan: [],
      };
    }
  }

  /**
   * Execute a single step of the plan
   */
  async executeStep(step) {
    if (!step.tool) {
      return {
        success: true,
        result: 'No tool execution required',
        step: step.step,
      };
    }

    try {
      // Parse tool path (e.g., "file.read" -> ["file", "read"])
      const toolPath = step.tool.split('.');
      
      // Validate tool path (whitelist approach for security)
      const allowedToolCategories = ['file', 'git', 'project', 'system'];
      if (!allowedToolCategories.includes(toolPath[0])) {
        throw new Error(`Tool category not allowed: ${toolPath[0]}`);
      }
      
      let tool = this.tools;
      
      for (const part of toolPath) {
        // Validate part contains only safe characters
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(part)) {
          throw new Error(`Invalid tool path component: ${part}`);
        }
        tool = tool[part];
        if (!tool) {
          throw new Error(`Tool not found: ${step.tool}`);
        }
      }

      if (typeof tool !== 'function') {
        throw new Error(`${step.tool} is not a function`);
      }

      // Validate and sanitize parameters
      const params = step.params || {};
      const sanitizedParams = {};
      
      // Only allow known parameter types
      for (const [key, value] of Object.entries(params)) {
        if (typeof key !== 'string' || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key)) {
          throw new Error(`Invalid parameter name: ${key}`);
        }
        // Only allow primitive types and arrays
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || Array.isArray(value)) {
          sanitizedParams[key] = value;
        } else {
          throw new Error(`Invalid parameter type for ${key}`);
        }
      }
      
      // Execute the tool with sanitized parameters
      const result = await tool(...Object.values(sanitizedParams));
      
      return {
        success: true,
        result,
        step: step.step,
        tool: step.tool,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        step: step.step,
        tool: step.tool,
      };
    }
  }

  /**
   * Execute a full plan with streaming updates
   */
  async *executePlan(plan) {
    const maxSteps = this.config.agent?.maxSteps || 10;
    const results = [];

    for (let i = 0; i < Math.min(plan.length, maxSteps); i++) {
      const step = plan[i];
      
      yield {
        type: 'step_start',
        step: step.step,
        action: step.action,
        tool: step.tool,
      };

      const result = await this.executeStep(step);
      results.push(result);

      yield {
        type: 'step_complete',
        step: step.step,
        success: result.success,
        result: result.result,
        error: result.error,
      };

      // Stop on error if critical
      if (!result.success && step.critical) {
        yield {
          type: 'plan_aborted',
          reason: `Critical step ${step.step} failed: ${result.error}`,
        };
        break;
      }
    }

    yield {
      type: 'plan_complete',
      totalSteps: plan.length,
      executedSteps: results.length,
      successfulSteps: results.filter(r => r.success).length,
      results,
    };
  }
}

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
      let braceCount = 1; // Start at 1 because the declaration already has an opening brace
      let end = match.index + match[1].length;
      
      for (let i = match.index + match[1].length; i < content.length; i++) {
        if (content[i] === '{') {
          braceCount++;
        } else if (content[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            end = i + 1;
            break;
          }
        }
      }
      
      // Extract name from declaration (e.g., "function myFunc" -> "myFunc", "class MyClass" -> "MyClass")
      const wordMatches = match[1].match(/\b(function|class|const|async)\s+(\w+)/);
      const name = wordMatches?.[2] || 'unknown';
      
      sections.push({
        type: 'function_or_class',
        content: content.slice(start, end).trim(),
        startIndex: start,
        name,
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
   * Detect programming language with priority ordering
   * More specific patterns are checked first to avoid false positives
   */
  detectLanguage(content) {
    // Ordered by specificity - more specific patterns first
    const patterns = [
      // TypeScript - check before JavaScript (has more specific syntax)
      { lang: 'typescript', pattern: /(?:interface\s+\w+|type\s+\w+\s*=|:\s*\w+\[\]|<\w+>|:\s*string|:\s*number|:\s*boolean)/ },
      // Rust - very specific syntax
      { lang: 'rust', pattern: /(?:fn\s+\w+\s*\(|pub\s+fn|impl\s+\w+|struct\s+\w+\s*\{|let\s+mut\s+)/ },
      // Go - specific patterns
      { lang: 'go', pattern: /(?:func\s+\w+\s*\(|package\s+\w+\s*\n|import\s+\()/ },
      // Python - indentation-based syntax
      { lang: 'python', pattern: /(?:def\s+\w+\s*\(.*\)\s*:|from\s+\w+\s+import|class\s+\w+.*:)/ },
      // Java - class-based with modifiers
      { lang: 'java', pattern: /(?:public\s+class|private\s+\w+\s+\w+|protected\s+|void\s+\w+\s*\()/ },
      // JavaScript - general patterns (checked last among specific languages)
      { lang: 'javascript', pattern: /(?:import\s+\{|export\s+(?:default\s+)?(?:function|class|const)|const\s+\w+\s*=|let\s+\w+\s*=|=>\s*\{)/ },
    ];
    
    for (const { lang, pattern } of patterns) {
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
      
      // If we've reached the end of content, stop
      if (end >= content.length) break;
      
      // Move start forward, ensuring we make progress
      const nextStart = end - overlap;
      
      // Prevent infinite loop by ensuring start always increases
      start = Math.max(nextStart, start + 1);
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
 * Supports automatic fallback from Ollama to DeepSeek API
 */
class LLMClient {
  constructor(config) {
    this.config = config;
    this.currentProvider = config.llm.provider;
    this.currentModel = config.llm.model;
    this._providerAvailability = null;
    this._lastAvailabilityCheck = 0;
    this._fallbackAttempted = false; // Flag to prevent infinite fallback loops
    this.AVAILABILITY_CACHE_MS = 30000; // Cache availability for 30 seconds
    this.OLLAMA_TIMEOUT_MS = 5000; // Timeout for Ollama availability check
  }

  /**
   * Check if DeepSeek API key is configured
   */
  hasDeepSeekApiKey() {
    return Boolean(process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY);
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
   * Switch to DeepSeek API provider
   * Centralized method to avoid code duplication
   */
  switchToDeepSeekProvider() {
    this.currentProvider = 'deepseek-api';
    this.currentModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    this._fallbackAttempted = true;
  }

  /**
   * Check if Ollama is available locally
   */
  async checkOllamaAvailability() {
    const ollamaUrl = this.config.endpoints.ollama;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.OLLAMA_TIMEOUT_MS);
      const response = await fetch(`${ollamaUrl}/api/tags`, { 
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Check if DeepSeek API is available
   */
  async checkDeepSeekAvailability() {
    if (!this.hasDeepSeekApiKey()) {
      return false;
    }
    // For API providers, assume available if key is configured
    return true;
  }

  /**
   * Check if provider is available with automatic fallback detection
   * Returns detailed availability info
   */
  async checkAvailability() {
    const now = Date.now();
    
    // Return cached result if still valid
    if (this._providerAvailability !== null && 
        (now - this._lastAvailabilityCheck) < this.AVAILABILITY_CACHE_MS) {
      return this._providerAvailability.available;
    }
    
    const ollamaAvailable = await this.checkOllamaAvailability();
    const deepseekAvailable = await this.checkDeepSeekAvailability();
    
    // Update provider based on availability (only if not already switched)
    if (this.currentProvider === 'ollama' && !ollamaAvailable && deepseekAvailable && !this._fallbackAttempted) {
      console.warn('[LLMClient] Ollama not available, falling back to DeepSeek API');
      this.switchToDeepSeekProvider();
    }
    
    this._providerAvailability = {
      available: ollamaAvailable || deepseekAvailable,
      ollama: ollamaAvailable,
      deepseek: deepseekAvailable,
      activeProvider: this.currentProvider,
      activeModel: this.currentModel,
    };
    this._lastAvailabilityCheck = now;
    
    return this._providerAvailability.available;
  }

  /**
   * Get detailed availability information
   */
  async getAvailabilityDetails() {
    await this.checkAvailability();
    return this._providerAvailability;
  }

  /**
   * Chat completion (non-streaming) with automatic fallback
   */
  async chat(messages, options = {}) {
    // Check availability and potentially switch providers
    await this.checkAvailability();
    
    const baseUrl = this.getBaseUrl();
    const model = options.model || this.currentModel;
    const temperature = options.temperature ?? this.config.llm.temperature;
    const maxTokens = options.maxTokens ?? this.config.llm.maxTokens;
    
    if (this.currentProvider === 'ollama') {
      try {
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
          const errorText = await response.text().catch(() => '');
          throw new Error(`Ollama request failed: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        return data.message?.content || '';
      } catch (error) {
        // If Ollama fails and we have DeepSeek API key and haven't tried fallback yet
        if (this.hasDeepSeekApiKey() && !this._fallbackAttempted) {
          console.warn(`[LLMClient] Ollama failed: ${error.message}. Falling back to DeepSeek API.`);
          this.switchToDeepSeekProvider();
          return this.chat(messages, options); // Retry with DeepSeek (only once due to flag)
        }
        throw error;
      }
    } else {
      // DeepSeek API or OpenAI-compatible
      const apiKey = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_KEY;
      
      if (!apiKey) {
        throw new Error('DeepSeek API key not configured. Set DEEPSEEK_API_KEY environment variable.');
      }
      
      const deepseekUrl = this.config.endpoints.deepseek;
      const response = await fetch(`${deepseekUrl}/chat/completions`, {
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
        const errorText = await response.text().catch(() => '');
        throw new Error(`DeepSeek API request failed: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    }
  }

  /**
   * Streaming chat completion with automatic fallback
   */
  async *streamChat(messages, options = {}) {
    // Check availability and potentially switch providers
    await this.checkAvailability();
    
    const model = options.model || this.currentModel;
    const temperature = options.temperature ?? this.config.llm.temperature;
    const maxTokens = options.maxTokens ?? this.config.llm.maxTokens;
    
    if (this.currentProvider === 'ollama') {
      const baseUrl = this.config.endpoints.ollama;
      
      let response;
      try {
        response = await fetch(`${baseUrl}/api/chat`, {
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
      } catch (error) {
        // If Ollama fails and we have DeepSeek API key and haven't tried fallback yet
        if (this.hasDeepSeekApiKey() && !this._fallbackAttempted) {
          console.warn(`[LLMClient] Ollama stream failed: ${error.message}. Falling back to DeepSeek API.`);
          this.switchToDeepSeekProvider();
          yield* this.streamChat(messages, options); // Retry with DeepSeek (only once due to flag)
          return;
        }
        throw error;
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
      
      if (!apiKey) {
        throw new Error('DeepSeek API key not configured. Set DEEPSEEK_API_KEY environment variable.');
      }
      
      const deepseekUrl = this.config.endpoints.deepseek;
      const response = await fetch(`${deepseekUrl}/chat/completions`, {
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
        const errorText = await response.text().catch(() => '');
        throw new Error(`DeepSeek API streaming request failed: ${response.status} ${errorText}`);
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
    
    // Core components
    this.documentProcessor = new DocumentProcessor(this.config.processing);
    this.contextBuilder = new ContextBuilder(this.config, this.db);
    this.llmClient = new LLMClient(this.config);
    
    // Enhanced components (NEW)
    this.imageProcessor = new ImageProcessor(this.config);
    this.hybridSearch = new HybridSearchEngine(this.config, this.db);
    this.versionManager = new DocumentVersionManager(this.config, this.db);
    this.agentPlanner = new AgentPlanner(this.config, this.llmClient);
    
    // Docling client for document conversion
    this.doclingClient = new DoclingClient(this.config);
    
    // Conversation state
    this.conversations = new Map();
    this.lastCleanupTime = Date.now();
    
    // Stats
    this.stats = {
      queriesProcessed: 0,
      documentsIndexed: 0,
      documentsConverted: 0,
      imagesProcessed: 0,
      toolExecutions: 0,
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
      
      // Initialize versioning table (NEW)
      if (this.config.versioning?.enabled) {
        await this.versionManager.initializeVersionTable();
      }
    }
    
    // Check LLM availability
    const available = await this.llmClient.checkAvailability();
    if (!available) {
      this.logger.warn('LLM provider not available. Some features may not work.');
    }
    
    // Check Docling availability
    if (this.config.docling?.enabled) {
      const doclingStatus = await this.doclingClient.checkAvailability();
      if (!doclingStatus.available) {
        this.logger.warn('Docling service not available. Document conversion will be limited.');
      } else {
        this.logger.info('✅ Docling service available. Supported formats:', doclingStatus.supportedFormats);
      }
    }
    
    // Check OCR availability (NEW)
    if (this.config.multimodal?.enabled) {
      const ocrAvailable = await this.imageProcessor.checkOCRAvailability();
      if (!ocrAvailable) {
        this.logger.warn('OCR service not available. Image processing will be disabled.');
      }
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
    
    // Create version if versioning is enabled (NEW)
    let versionInfo = { version: 1, isNew: true };
    if (this.config.versioning?.enabled && this.db) {
      versionInfo = await this.versionManager.createVersion(documentId, content, {
        title,
        type: options.type,
      });
      
      // If content hasn't changed, skip re-indexing
      if (versionInfo.unchanged) {
        return {
          documentId,
          chunksIndexed: 0,
          metadata: { unchanged: true, version: versionInfo.version },
          version: versionInfo.version,
        };
      }
    }
    
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
                version: versionInfo.version, // Include version in metadata
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
      version: versionInfo.version,
    };
  }

  /**
   * Search for relevant documents (supports hybrid search)
   */
  async search(query, options = {}) {
    if (!this.db) {
      return [];
    }
    
    const limit = options.limit || this.config.vectorStore.topK;
    const minScore = options.minScore ?? this.config.vectorStore.minScore;
    const useHybrid = options.hybrid ?? this.config.hybridSearch?.enabled ?? false;
    
    // Generate query embedding for semantic search
    const [queryEmbedding] = await this.llmClient.embed([query]);
    
    // Semantic search
    const sql = `
      SELECT id, document_id, chunk_index, content, metadata,
             1 - (embedding <=> $1) AS score
      FROM ${this.config.vectorStore.tableName}
      ORDER BY embedding <-> $1
      LIMIT $2
    `;
    
    const { rows: semanticResults } = await this.db.query(sql, [
      `[${queryEmbedding.join(',')}]`,
      limit * 2, // Get more for hybrid combination
    ]);
    
    // If hybrid search is enabled, combine with keyword search
    if (useHybrid) {
      const keywordResults = await this.hybridSearch.keywordSearch(query, { limit: limit * 2 });
      const combinedResults = this.hybridSearch.combineResults(
        semanticResults,
        keywordResults,
        { limit, ...options }
      );
      return combinedResults.filter(row => row.combinedScore >= minScore);
    }
    
    return semanticResults.filter(row => row.score >= minScore).slice(0, limit);
  }

  /**
   * Index an image using OCR (NEW)
   */
  async indexImage(imageData, options = {}) {
    if (!this.config.multimodal?.enabled) {
      throw new Error('Multimodal support is not enabled');
    }
    
    // Process image with OCR
    const ocrResult = await this.imageProcessor.processImage(imageData, options);
    
    if (!ocrResult.text) {
      return {
        success: false,
        error: ocrResult.error || 'No text extracted from image',
      };
    }
    
    // Index the extracted text
    const indexResult = await this.indexDocument(ocrResult.text, {
      ...options,
      type: 'image',
      metadata: {
        ...options.metadata,
        ...ocrResult.metadata,
        confidence: ocrResult.confidence,
      },
    });
    
    this.stats.imagesProcessed++;
    
    return {
      ...indexResult,
      ocrConfidence: ocrResult.confidence,
      extractedBlocks: ocrResult.blocks?.length || 0,
    };
  }

  /**
   * Convert and index a document using Docling (NEW)
   * Supports: PDF, DOCX, PPTX, XLSX, HTML, Images, Markdown, AsciiDoc
   * @param {Buffer} fileData - File data buffer
   * @param {string} filename - Original filename
   * @param {string} contentType - MIME type
   * @param {Object} options - Conversion and indexing options
   */
  async convertAndIndexDocument(fileData, filename, contentType, options = {}) {
    if (!this.config.docling?.enabled) {
      throw new Error('Docling document conversion is not enabled');
    }

    // Convert using Docling
    const conversionResult = await this.doclingClient.convertDocument(
      fileData, 
      filename, 
      contentType,
      {
        chunkSize: options.chunkSize || this.config.docling.chunkSize,
        chunkOverlap: options.chunkOverlap || this.config.docling.chunkOverlap,
        extractTables: options.extractTables ?? this.config.docling.extractTables,
        extractFigures: options.extractFigures ?? this.config.docling.extractFigures,
      }
    );

    if (!conversionResult.success) {
      return {
        success: false,
        error: conversionResult.error || 'Document conversion failed',
      };
    }

    this.stats.documentsConverted++;

    // Index the converted text
    const indexResult = await this.indexDocument(conversionResult.text, {
      documentId: options.documentId || conversionResult.documentId,
      title: options.title || filename,
      type: conversionResult.format,
      metadata: {
        ...options.metadata,
        originalFilename: filename,
        contentType,
        format: conversionResult.format,
        tableCount: conversionResult.tables?.length || 0,
        figureCount: conversionResult.figures?.length || 0,
        processingTimeMs: conversionResult.processingTimeMs,
      },
    });

    return {
      success: true,
      ...indexResult,
      conversion: {
        format: conversionResult.format,
        markdown: conversionResult.markdown,
        tables: conversionResult.tables,
        figures: conversionResult.figures,
        sections: conversionResult.sections,
        originalMetadata: conversionResult.metadata,
      },
    };
  }

  /**
   * Convert document from URL using Docling (NEW)
   */
  async convertAndIndexFromUrl(url, options = {}) {
    if (!this.config.docling?.enabled) {
      throw new Error('Docling document conversion is not enabled');
    }

    const conversionResult = await this.doclingClient.convertFromUrl(url, options);

    if (!conversionResult.success) {
      return {
        success: false,
        error: conversionResult.error || 'URL conversion failed',
      };
    }

    this.stats.documentsConverted++;

    // Index the converted text
    const indexResult = await this.indexDocument(conversionResult.text, {
      documentId: conversionResult.document_id,
      title: options.title || url,
      type: 'url',
      metadata: {
        sourceUrl: url,
        ...conversionResult.metadata,
      },
    });

    return {
      success: true,
      ...indexResult,
      conversion: {
        markdown: conversionResult.markdown,
        chunks: conversionResult.chunks,
      },
    };
  }

  /**
   * Get supported document formats from Docling
   */
  async getSupportedFormats() {
    return this.doclingClient.getSupportedFormats();
  }

  /**
   * Check if a content type is supported for conversion
   */
  isDocumentTypeSupported(contentType) {
    return this.doclingClient.isSupported(contentType);
  }

  /**
   * Get document version history (NEW)
   */
  async getDocumentVersions(documentId) {
    return this.versionManager.getVersionHistory(documentId);
  }

  /**
   * Execute agent task with planning (NEW)
   */
  async executeAgentTask(task, options = {}) {
    if (!this.config.agent?.enabled) {
      throw new Error('Agent mode is not enabled');
    }
    
    // Create a plan for the task
    const { success, plan, error } = await this.agentPlanner.createPlan(task, options.context || {});
    
    if (!success) {
      return {
        success: false,
        error: `Planning failed: ${error}`,
      };
    }
    
    // Execute the plan
    const results = [];
    for await (const event of this.agentPlanner.executePlan(plan)) {
      results.push(event);
      this.emit('agent-event', event);
      
      if (event.type === 'step_complete') {
        this.stats.toolExecutions++;
      }
    }
    
    return {
      success: true,
      plan,
      execution: results,
    };
  }

  /**
   * Stream agent task execution (NEW)
   */
  async *streamAgentTask(task, options = {}) {
    if (!this.config.agent?.enabled) {
      throw new Error('Agent mode is not enabled');
    }
    
    yield {
      type: 'planning_start',
      task,
    };
    
    // Create a plan for the task
    const planResult = await this.agentPlanner.createPlan(task, options.context || {});
    
    yield {
      type: 'planning_complete',
      success: planResult.success,
      plan: planResult.plan,
      error: planResult.error,
    };
    
    if (!planResult.success) {
      return;
    }
    
    // Execute the plan with streaming
    for await (const event of this.agentPlanner.executePlan(planResult.plan)) {
      yield event;
      
      if (event.type === 'step_complete') {
        this.stats.toolExecutions++;
      }
    }
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
    
    // Search for relevant documents (with optional hybrid search)
    const retrieved = await this.search(prompt, {
      limit: options.topK || 5,
      hybrid: options.hybridSearch,
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
    
    // Update conversation with timestamps
    const timestamp = new Date().toISOString();
    conversation.messages.push({ ...userMessage, timestamp });
    conversation.messages.push({
      role: 'assistant',
      content: response,
      timestamp,
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
    
    // Update conversation with timestamps
    const timestamp = new Date().toISOString();
    conversation.messages.push({ ...userMessage, timestamp });
    conversation.messages.push({
      role: 'assistant',
      content: fullResponse,
      timestamp,
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
   * Clear old conversations to prevent memory leaks
   * Removes conversations older than maxAge (default: 1 hour)
   */
  cleanupOldConversations(maxAgeMs = 60 * 60 * 1000) {
    const now = Date.now();
    for (const [id, conversation] of this.conversations.entries()) {
      const lastMessage = conversation.messages[conversation.messages.length - 1];
      if (lastMessage?.timestamp) {
        const messageTime = new Date(lastMessage.timestamp).getTime();
        if (now - messageTime > maxAgeMs) {
          this.conversations.delete(id);
        }
      }
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    // Cleanup old conversations periodically (max once every 5 minutes)
    const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    if (now - this.lastCleanupTime > CLEANUP_INTERVAL) {
      this.cleanupOldConversations();
      this.lastCleanupTime = now;
    }
    
    const status = {
      status: 'healthy',
      llm: { status: 'unknown' },
      vectorStore: { status: 'unknown' },
      ocr: { status: 'unknown' },
      agent: { status: 'unknown' },
      features: {
        multimodal: this.config.multimodal?.enabled || false,
        hybridSearch: this.config.hybridSearch?.enabled || false,
        versioning: this.config.versioning?.enabled || false,
        agentMode: this.config.agent?.enabled || false,
      },
      stats: this.stats,
    };
    
    // Check LLM with detailed provider information
    try {
      const availabilityDetails = await this.llmClient.getAvailabilityDetails();
      const isAvailable = availabilityDetails?.available || false;
      
      status.llm = {
        status: isAvailable ? 'healthy' : 'unavailable',
        activeProvider: availabilityDetails?.activeProvider || this.llmClient.currentProvider,
        activeModel: availabilityDetails?.activeModel || this.llmClient.currentModel,
        configuredProvider: this.config.llm.provider,
        configuredModel: this.config.llm.model,
        providers: {
          ollama: {
            available: availabilityDetails?.ollama || false,
            endpoint: this.config.endpoints.ollama,
          },
          deepseek: {
            available: availabilityDetails?.deepseek || false,
            hasApiKey: this.llmClient.hasDeepSeekApiKey(),
            endpoint: this.config.endpoints.deepseek,
          },
        },
      };
      
      if (!isAvailable) {
        status.status = 'degraded';
        status.llm.error = 'No LLM provider available. Start Ollama locally or configure DEEPSEEK_API_KEY.';
      }
    } catch (error) {
      status.llm = { 
        status: 'error', 
        error: error.message,
        configuredProvider: this.config.llm.provider,
        configuredModel: this.config.llm.model,
      };
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
    
    // Check OCR service
    if (this.config.multimodal?.enabled) {
      try {
        const ocrAvailable = await this.imageProcessor.checkOCRAvailability();
        status.ocr = {
          status: ocrAvailable ? 'healthy' : 'unavailable',
          endpoint: this.config.multimodal.ocrEndpoint,
        };
      } catch (error) {
        status.ocr = { status: 'error', error: error.message };
      }
    } else {
      status.ocr = { status: 'disabled' };
    }
    
    // Check agent tools
    if (this.config.agent?.enabled) {
      status.agent = {
        status: 'healthy',
        planningEnabled: this.config.agent.planningEnabled,
        availableTools: this.config.agent.tools,
        maxSteps: this.config.agent.maxSteps,
      };
    } else {
      status.agent = { status: 'disabled' };
    }
    
    // Check Docling service (NEW)
    if (this.config.docling?.enabled) {
      try {
        const doclingStatus = await this.doclingClient.checkAvailability();
        status.docling = {
          status: doclingStatus.available ? 'healthy' : 'unavailable',
          endpoint: this.config.docling.endpoint,
          supportedFormats: doclingStatus.supportedFormats || [],
        };
        // Add docling to features
        status.features.docling = true;
      } catch (error) {
        status.docling = { status: 'error', error: error.message };
      }
    } else {
      status.docling = { status: 'disabled' };
      status.features.docling = false;
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
    this.imageProcessor = new ImageProcessor(this.config);
    this.hybridSearch = new HybridSearchEngine(this.config, this.db);
    this.agentPlanner = new AgentPlanner(this.config, this.llmClient);
    this.doclingClient = new DoclingClient(this.config);
    
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
