/**
 * Codebase Embedding Indexer
 * 
 * Indexes a codebase using high-quality embeddings (mxbai-embed-large by default)
 * and makes the index available for semantic search and context retrieval.
 * 
 * Features:
 * - Uses mxbai-embed-large for highest quality embeddings
 * - Model switching support for different use cases
 * - Incremental indexing with change detection
 * - AST-aware code chunking
 * - Semantic search across codebase
 * - Context retrieval for AI models
 * - Export/import index for sharing
 * 
 * Tools for working with the index:
 * - search: Semantic search across codebase
 * - getContext: Get relevant context for a query
 * - getSimilarFiles: Find similar files
 * - getRelatedCode: Find related code snippets
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { glob } from 'glob';
import { OllamaEmbeddingService, EMBEDDING_MODELS, DEFAULT_MODELS } from './ollama-embedding-service.js';

/**
 * Code file types with their chunking strategies
 */
const FILE_TYPES = {
  javascript: { extensions: ['.js', '.jsx', '.mjs', '.cjs'], chunkSize: 1500 },
  typescript: { extensions: ['.ts', '.tsx'], chunkSize: 1500 },
  python: { extensions: ['.py'], chunkSize: 1500 },
  markdown: { extensions: ['.md', '.mdx'], chunkSize: 2000 },
  json: { extensions: ['.json'], chunkSize: 1000 },
  yaml: { extensions: ['.yml', '.yaml'], chunkSize: 1000 },
  css: { extensions: ['.css', '.scss', '.less'], chunkSize: 1000 },
  html: { extensions: ['.html', '.htm'], chunkSize: 1500 },
  other: { extensions: [], chunkSize: 1500 },
};

/**
 * Default ignore patterns
 */
const DEFAULT_IGNORE = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  'coverage/**',
  '*.min.js',
  '*.min.css',
  '*.map',
  '*.lock',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '.next/**',
  '.cache/**',
  '__pycache__/**',
  '*.pyc',
  '.env*',
  '*.log',
];

/**
 * Indexed chunk structure
 */
export class CodebaseEmbeddingIndexer extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      rootPath: config.rootPath || process.cwd(),
      model: config.model || DEFAULT_MODELS['codebase-indexing'],
      filePatterns: config.filePatterns || ['**/*'],
      ignorePatterns: config.ignorePatterns || DEFAULT_IGNORE,
      chunkOverlap: config.chunkOverlap || 200,
      maxFileSize: config.maxFileSize || 500 * 1024, // 500KB
      indexPath: config.indexPath || '.codebase-index',
      ...config,
    };
    
    // Initialize embedding service with mxbai-embed-large for highest quality
    this.embeddingService = new OllamaEmbeddingService({
      model: this.config.model,
      baseUrl: config.ollamaUrl || process.env.OLLAMA_BASE_URL,
      cacheEnabled: true,
    });
    
    // Index storage
    this.index = {
      version: '1.0',
      model: this.config.model,
      dimensions: EMBEDDING_MODELS[this.config.model]?.dimensions || 1024,
      createdAt: null,
      updatedAt: null,
      rootPath: this.config.rootPath,
      files: new Map(),
      chunks: [],
      embeddings: [],
      metadata: {},
    };
    
    // File hashes for change detection
    this.fileHashes = new Map();
    
    // Statistics
    this.stats = {
      totalFiles: 0,
      totalChunks: 0,
      totalTokens: 0,
      indexedAt: null,
      indexDuration: 0,
    };
    
    this.initialized = false;
  }

  /**
   * Initialize the indexer
   */
  async initialize() {
    console.log('🔄 Initializing CodebaseEmbeddingIndexer...');
    console.log(`📂 Root path: ${this.config.rootPath}`);
    console.log(`🧠 Embedding model: ${this.config.model}`);
    
    try {
      // Initialize embedding service
      await this.embeddingService.initialize();
      
      // Load existing index if available
      await this.loadIndex();
      
      this.initialized = true;
      this.emit('initialized');
      console.log('✅ CodebaseEmbeddingIndexer initialized');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize CodebaseEmbeddingIndexer:', error.message);
      throw error;
    }
  }

  /**
   * Switch embedding model
   */
  async switchModel(modelName, options = {}) {
    const result = await this.embeddingService.switchModel(modelName, options);
    
    // Update index metadata
    this.index.model = modelName;
    this.index.dimensions = EMBEDDING_MODELS[modelName]?.dimensions || 1024;
    
    // Clear embeddings if model changed (dimensions may differ)
    if (options.reindex) {
      await this.clearIndex();
      await this.buildIndex();
    }
    
    return result;
  }

  /**
   * Build the complete codebase index
   */
  async buildIndex(options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const { incremental = false, patterns = null } = options;
    
    console.log(`📊 Building codebase index (${incremental ? 'incremental' : 'full'})...`);
    const startTime = Date.now();
    
    this.emit('indexing:start', { incremental });
    
    try {
      // Find all files
      const files = await this.findFiles(patterns);
      console.log(`📁 Found ${files.length} files to process`);
      
      let processedFiles = 0;
      let skippedFiles = 0;
      let newChunks = [];
      
      for (const filePath of files) {
        try {
          // Check if file changed (for incremental)
          if (incremental) {
            const currentHash = await this.getFileHash(filePath);
            const storedHash = this.fileHashes.get(filePath);
            
            if (storedHash === currentHash) {
              skippedFiles++;
              continue;
            }
            
            this.fileHashes.set(filePath, currentHash);
          }
          
          // Process file
          const chunks = await this.processFile(filePath);
          
          if (chunks.length > 0) {
            // Generate embeddings for chunks
            const texts = chunks.map(c => c.content);
            const embeddings = await this.embeddingService.embedBatch(texts);
            
            // Store chunks with embeddings
            for (let i = 0; i < chunks.length; i++) {
              const chunk = chunks[i];
              chunk.embedding = embeddings[i];
              chunk.embeddingModel = this.config.model;
              newChunks.push(chunk);
            }
            
            // Update file index
            this.index.files.set(filePath, {
              path: filePath,
              relativePath: path.relative(this.config.rootPath, filePath),
              chunkCount: chunks.length,
              lastIndexed: new Date().toISOString(),
            });
            
            processedFiles++;
          }
          
          // Progress update
          if (processedFiles % 10 === 0) {
            this.emit('indexing:progress', {
              processed: processedFiles,
              total: files.length,
              percent: Math.round((processedFiles / files.length) * 100),
            });
          }
          
        } catch (error) {
          console.warn(`⚠️ Failed to process ${filePath}:`, error.message);
          this.emit('indexing:error', { file: filePath, error });
        }
      }
      
      // Update index
      if (!incremental) {
        this.index.chunks = newChunks;
        this.index.embeddings = newChunks.map(c => c.embedding);
      } else {
        // Merge new chunks with existing
        this.index.chunks.push(...newChunks);
        this.index.embeddings.push(...newChunks.map(c => c.embedding));
      }
      
      // Update metadata
      const now = new Date().toISOString();
      if (!this.index.createdAt) {
        this.index.createdAt = now;
      }
      this.index.updatedAt = now;
      
      // Update stats
      this.stats = {
        totalFiles: this.index.files.size,
        totalChunks: this.index.chunks.length,
        indexedAt: now,
        indexDuration: Date.now() - startTime,
      };
      
      // Save index
      await this.saveIndex();
      
      console.log(`\n✅ Indexing complete!`);
      console.log(`📊 Stats:`);
      console.log(`   Files processed: ${processedFiles}`);
      console.log(`   Files skipped: ${skippedFiles}`);
      console.log(`   Total chunks: ${this.index.chunks.length}`);
      console.log(`   Duration: ${(this.stats.indexDuration / 1000).toFixed(2)}s`);
      
      this.emit('indexing:complete', this.stats);
      
      return this.stats;
      
    } catch (error) {
      console.error('❌ Indexing failed:', error);
      this.emit('indexing:failed', { error });
      throw error;
    }
  }

  /**
   * Find files matching patterns
   */
  async findFiles(patterns = null) {
    const searchPatterns = patterns || this.config.filePatterns;
    
    const files = await glob(searchPatterns, {
      cwd: this.config.rootPath,
      ignore: this.config.ignorePatterns,
      absolute: true,
      nodir: true,
    });
    
    // Filter by file size
    const validFiles = [];
    for (const file of files) {
      try {
        const stats = await fs.stat(file);
        if (stats.size <= this.config.maxFileSize) {
          validFiles.push(file);
        }
      } catch (error) {
        // Skip files that can't be stat'd
      }
    }
    
    return validFiles;
  }

  /**
   * Get file hash for change detection
   */
  async getFileHash(filePath) {
    const content = await fs.readFile(filePath);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Process a single file into chunks
   */
  async processFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const ext = path.extname(filePath).toLowerCase();
    const relativePath = path.relative(this.config.rootPath, filePath);
    
    // Determine file type and chunk size
    let fileType = 'other';
    let chunkSize = FILE_TYPES.other.chunkSize;
    
    for (const [type, config] of Object.entries(FILE_TYPES)) {
      if (config.extensions.includes(ext)) {
        fileType = type;
        chunkSize = config.chunkSize;
        break;
      }
    }
    
    // Create chunks
    const chunks = this.chunkContent(content, {
      filePath,
      relativePath,
      fileType,
      chunkSize,
    });
    
    return chunks;
  }

  /**
   * Chunk content with context awareness
   */
  chunkContent(content, options) {
    const { filePath, relativePath, fileType, chunkSize } = options;
    const overlap = this.config.chunkOverlap;
    
    const chunks = [];
    const lines = content.split('\n');
    
    let currentChunk = [];
    let currentSize = 0;
    let chunkIndex = 0;
    let startLine = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineSize = line.length + 1; // +1 for newline
      
      // Check if adding this line would exceed chunk size
      if (currentSize + lineSize > chunkSize && currentChunk.length > 0) {
        // Save current chunk
        const chunkContent = currentChunk.join('\n');
        
        chunks.push({
          id: `${relativePath}:${chunkIndex}`,
          filePath,
          relativePath,
          fileType,
          chunkIndex,
          startLine,
          endLine: i - 1,
          content: chunkContent,
          metadata: {
            fileType,
            lineCount: currentChunk.length,
          },
        });
        
        chunkIndex++;
        
        // Start new chunk with overlap (avoid division by zero)
        const avgLineSize = currentChunk.length > 0 ? chunkSize / currentChunk.length : chunkSize;
        const overlapLines = avgLineSize > 0 ? Math.ceil(overlap / avgLineSize) : 0;
        currentChunk = currentChunk.slice(-Math.max(overlapLines, 1));
        currentSize = currentChunk.join('\n').length;
        startLine = i - Math.min(overlapLines, currentChunk.length);
      }
      
      currentChunk.push(line);
      currentSize += lineSize;
    }
    
    // Save last chunk
    if (currentChunk.length > 0) {
      const chunkContent = currentChunk.join('\n');
      
      chunks.push({
        id: `${relativePath}:${chunkIndex}`,
        filePath,
        relativePath,
        fileType,
        chunkIndex,
        startLine,
        endLine: lines.length - 1,
        content: chunkContent,
        metadata: {
          fileType,
          lineCount: currentChunk.length,
        },
      });
    }
    
    return chunks;
  }

  /**
   * Search the index for relevant code
   */
  async search(query, options = {}) {
    const { topK = 10, threshold = 0.5, fileTypes = null, files = null } = options;
    
    if (this.index.chunks.length === 0) {
      return { results: [], message: 'Index is empty. Run buildIndex() first.' };
    }
    
    // Get query embedding
    const queryEmbedding = await this.embeddingService.embed(query);
    
    // Calculate similarities
    const results = [];
    
    for (let i = 0; i < this.index.chunks.length; i++) {
      const chunk = this.index.chunks[i];
      
      // Apply filters
      if (fileTypes && !fileTypes.includes(chunk.fileType)) continue;
      if (files && !files.some(f => chunk.relativePath.includes(f))) continue;
      
      const similarity = this.embeddingService.cosineSimilarity(
        queryEmbedding,
        chunk.embedding
      );
      
      if (similarity >= threshold) {
        results.push({
          ...chunk,
          similarity,
          embedding: undefined, // Don't return embedding in results
        });
      }
    }
    
    // Sort by similarity and return top K
    results.sort((a, b) => b.similarity - a.similarity);
    
    return {
      query,
      results: results.slice(0, topK),
      totalMatches: results.length,
      model: this.index.model,
    };
  }

  /**
   * Get context for a query (for AI models)
   */
  async getContext(query, options = {}) {
    const { maxTokens = 4000, topK = 5 } = options;
    
    const searchResults = await this.search(query, { topK: topK * 2, ...options });
    
    let context = '';
    let tokenEstimate = 0;
    const includedFiles = new Set();
    
    for (const result of searchResults.results) {
      const chunkText = `\n--- ${result.relativePath} (lines ${result.startLine}-${result.endLine}) ---\n${result.content}\n`;
      const chunkTokens = Math.ceil(chunkText.length / 4); // Rough token estimate
      
      if (tokenEstimate + chunkTokens > maxTokens) break;
      
      context += chunkText;
      tokenEstimate += chunkTokens;
      includedFiles.add(result.relativePath);
    }
    
    return {
      context,
      tokenEstimate,
      files: Array.from(includedFiles),
      chunksIncluded: searchResults.results.slice(0, includedFiles.size).length,
    };
  }

  /**
   * Find files similar to a given file
   */
  async getSimilarFiles(filePath, options = {}) {
    const { topK = 5, threshold = 0.7 } = options;
    
    // Get all chunks from the target file
    const targetChunks = this.index.chunks.filter(c => c.filePath === filePath);
    
    if (targetChunks.length === 0) {
      return { results: [], message: 'File not found in index' };
    }
    
    // Average embeddings from target file
    const avgEmbedding = this.averageEmbeddings(targetChunks.map(c => c.embedding));
    
    // Group chunks by file and calculate similarity
    const fileSimilarities = new Map();
    
    for (const chunk of this.index.chunks) {
      if (chunk.filePath === filePath) continue;
      
      const similarity = this.embeddingService.cosineSimilarity(avgEmbedding, chunk.embedding);
      
      const current = fileSimilarities.get(chunk.filePath) || { similarities: [], relativePath: chunk.relativePath };
      current.similarities.push(similarity);
      fileSimilarities.set(chunk.filePath, current);
    }
    
    // Calculate average similarity per file
    const results = Array.from(fileSimilarities.entries())
      .map(([file, data]) => ({
        filePath: file,
        relativePath: data.relativePath,
        similarity: data.similarities.reduce((a, b) => a + b, 0) / data.similarities.length,
        chunkCount: data.similarities.length,
      }))
      .filter(r => r.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
    
    return { results, sourceFile: filePath };
  }

  /**
   * Get related code snippets
   */
  async getRelatedCode(codeSnippet, options = {}) {
    const { topK = 5, threshold = 0.6, excludeFile = null } = options;
    
    // Get embedding for the code snippet
    const embedding = await this.embeddingService.embed(codeSnippet);
    
    const results = [];
    
    for (const chunk of this.index.chunks) {
      if (excludeFile && chunk.filePath === excludeFile) continue;
      
      const similarity = this.embeddingService.cosineSimilarity(embedding, chunk.embedding);
      
      if (similarity >= threshold) {
        results.push({
          ...chunk,
          similarity,
          embedding: undefined,
        });
      }
    }
    
    results.sort((a, b) => b.similarity - a.similarity);
    
    return {
      results: results.slice(0, topK),
      totalMatches: results.length,
    };
  }

  /**
   * Average multiple embeddings
   */
  averageEmbeddings(embeddings) {
    if (embeddings.length === 0) return [];
    
    const dimensions = embeddings[0].length;
    const avg = new Array(dimensions).fill(0);
    
    for (const embedding of embeddings) {
      for (let i = 0; i < dimensions; i++) {
        avg[i] += embedding[i];
      }
    }
    
    for (let i = 0; i < dimensions; i++) {
      avg[i] /= embeddings.length;
    }
    
    return avg;
  }

  /**
   * Save index to disk
   */
  async saveIndex() {
    const indexPath = path.join(this.config.rootPath, this.config.indexPath);
    
    // Create directory if not exists
    await fs.mkdir(indexPath, { recursive: true });
    
    // Prepare index data (convert Maps to objects)
    const indexData = {
      version: this.index.version,
      model: this.index.model,
      dimensions: this.index.dimensions,
      createdAt: this.index.createdAt,
      updatedAt: this.index.updatedAt,
      rootPath: this.index.rootPath,
      files: Object.fromEntries(this.index.files),
      chunks: this.index.chunks.map(c => ({
        ...c,
        embedding: undefined, // Store embeddings separately
      })),
      stats: this.stats,
    };
    
    // Save index metadata
    await fs.writeFile(
      path.join(indexPath, 'index.json'),
      JSON.stringify(indexData, null, 2)
    );
    
    // Save embeddings separately (binary format for efficiency)
    const embeddingsData = {
      model: this.index.model,
      dimensions: this.index.dimensions,
      count: this.index.embeddings.length,
      embeddings: this.index.embeddings,
    };
    
    await fs.writeFile(
      path.join(indexPath, 'embeddings.json'),
      JSON.stringify(embeddingsData)
    );
    
    // Save file hashes for incremental updates
    await fs.writeFile(
      path.join(indexPath, 'hashes.json'),
      JSON.stringify(Object.fromEntries(this.fileHashes))
    );
    
    console.log(`💾 Index saved to ${indexPath}`);
  }

  /**
   * Load index from disk
   */
  async loadIndex() {
    const indexPath = path.join(this.config.rootPath, this.config.indexPath);
    
    try {
      // Load index metadata
      const indexData = JSON.parse(
        await fs.readFile(path.join(indexPath, 'index.json'), 'utf-8')
      );
      
      // Load embeddings
      const embeddingsData = JSON.parse(
        await fs.readFile(path.join(indexPath, 'embeddings.json'), 'utf-8')
      );
      
      // Load file hashes
      const hashesData = JSON.parse(
        await fs.readFile(path.join(indexPath, 'hashes.json'), 'utf-8')
      );
      
      // Restore index
      this.index = {
        version: indexData.version,
        model: indexData.model,
        dimensions: indexData.dimensions,
        createdAt: indexData.createdAt,
        updatedAt: indexData.updatedAt,
        rootPath: indexData.rootPath,
        files: new Map(Object.entries(indexData.files)),
        chunks: indexData.chunks.map((c, i) => ({
          ...c,
          embedding: embeddingsData.embeddings[i],
        })),
        embeddings: embeddingsData.embeddings,
      };
      
      this.fileHashes = new Map(Object.entries(hashesData));
      this.stats = indexData.stats;
      
      console.log(`📂 Loaded existing index (${this.index.chunks.length} chunks)`);
      
      return true;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('⚠️ Failed to load index:', error.message);
      }
      return false;
    }
  }

  /**
   * Clear the index
   */
  async clearIndex() {
    this.index = {
      version: '1.0',
      model: this.config.model,
      dimensions: EMBEDDING_MODELS[this.config.model]?.dimensions || 1024,
      createdAt: null,
      updatedAt: null,
      rootPath: this.config.rootPath,
      files: new Map(),
      chunks: [],
      embeddings: [],
      metadata: {},
    };
    
    this.fileHashes.clear();
    
    // Remove saved index
    const indexPath = path.join(this.config.rootPath, this.config.indexPath);
    try {
      await fs.rm(indexPath, { recursive: true });
    } catch (error) {
      // Ignore if doesn't exist
    }
    
    console.log('🗑️ Index cleared');
    this.emit('index:cleared');
  }

  /**
   * Export index for sharing
   */
  async exportIndex(outputPath) {
    const exportData = {
      version: this.index.version,
      model: this.index.model,
      dimensions: this.index.dimensions,
      createdAt: this.index.createdAt,
      updatedAt: this.index.updatedAt,
      stats: this.stats,
      chunks: this.index.chunks,
      embeddings: this.index.embeddings,
    };
    
    await fs.writeFile(outputPath, JSON.stringify(exportData));
    console.log(`📤 Index exported to ${outputPath}`);
    
    return outputPath;
  }

  /**
   * Import index from file
   */
  async importIndex(inputPath) {
    const importData = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
    
    this.index = {
      version: importData.version,
      model: importData.model,
      dimensions: importData.dimensions,
      createdAt: importData.createdAt,
      updatedAt: importData.updatedAt,
      rootPath: this.config.rootPath,
      files: new Map(),
      chunks: importData.chunks,
      embeddings: importData.embeddings,
    };
    
    // Rebuild file map
    for (const chunk of this.index.chunks) {
      if (!this.index.files.has(chunk.filePath)) {
        this.index.files.set(chunk.filePath, {
          path: chunk.filePath,
          relativePath: chunk.relativePath,
          chunkCount: 0,
          lastIndexed: this.index.updatedAt,
        });
      }
      this.index.files.get(chunk.filePath).chunkCount++;
    }
    
    this.stats = importData.stats;
    
    console.log(`📥 Index imported from ${inputPath}`);
    
    return this.stats;
  }

  /**
   * Get index statistics
   */
  getStats() {
    return {
      ...this.stats,
      model: this.index.model,
      dimensions: this.index.dimensions,
      chunkCount: this.index.chunks.length,
      fileCount: this.index.files.size,
      createdAt: this.index.createdAt,
      updatedAt: this.index.updatedAt,
    };
  }

  /**
   * Get list of indexed files
   */
  getIndexedFiles() {
    return Array.from(this.index.files.values());
  }
}

/**
 * Factory function
 */
export function createCodebaseEmbeddingIndexer(config = {}) {
  return new CodebaseEmbeddingIndexer(config);
}

export default CodebaseEmbeddingIndexer;
