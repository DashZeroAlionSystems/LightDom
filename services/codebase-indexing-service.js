/**
 * Advanced Codebase Indexing Service
 * 
 * Features:
 * - Semantic code understanding with embeddings
 * - Knowledge graph construction
 * - Call graph analysis
 * - Dead code detection
 * - Dependency mapping
 * - AI-powered insights
 * - Integration with DeepSeek for analysis
 * 
 * Based on research:
 * - Microsoft's CodeBERT and GraphCodeBERT
 * - Facebook's Aroma code search
 * - GitHub's Semantic code search
 * - Tree-sitter for AST parsing
 * - Sourcegraph's code intelligence
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import TypeScript from 'tree-sitter-typescript';
import crypto from 'crypto';

export class CodebaseIndexingService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      rootDir: config.rootDir || process.cwd(),
      ignorePaths: config.ignorePaths || [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**',
        'coverage/**',
        '*.min.js',
      ],
      maxFileSize: config.maxFileSize || 1024 * 1024, // 1MB
      enableEmbeddings: config.enableEmbeddings !== false,
      ...config,
    };

    this.db = config.db;
    this.deepseekService = config.deepseekService;
    
    // Parser setup
    this.parsers = {
      javascript: new Parser(),
      typescript: new Parser(),
    };
    
    this.parsers.javascript.setLanguage(JavaScript);
    this.parsers.typescript.setLanguage(TypeScript.typescript);
    
    // Caches
    this.entityCache = new Map();
    this.relationshipCache = new Map();
    
    this.stats = {
      filesProcessed: 0,
      entitiesFound: 0,
      relationshipsFound: 0,
      issuesDetected: 0,
      startTime: null,
      endTime: null,
    };
  }

  /**
   * Start full codebase indexing
   */
  async indexCodebase(options = {}) {
    console.log('🔍 Starting codebase indexing...');
    this.stats.startTime = Date.now();
    
    const {
      incremental = false,
      targetFiles = null,
      sessionId = null,
    } = options;
    
    // Create analysis session
    const session = await this.createAnalysisSession({
      analysisType: incremental ? 'incremental' : 'full',
      targetFiles,
    });
    
    try {
      // Step 1: Find all source files
      const files = targetFiles || await this.findSourceFiles();
      console.log(`📁 Found ${files.length} files to index`);
      
      // Step 2: Parse and extract entities
      for (const file of files) {
        await this.indexFile(file);
        this.stats.filesProcessed++;
        
        if (this.stats.filesProcessed % 50 === 0) {
          console.log(`Progress: ${this.stats.filesProcessed}/${files.length} files`);
        }
      }
      
      // Step 3: Build relationships
      console.log('🔗 Building relationships...');
      await this.buildRelationships();
      
      // Step 4: Generate embeddings
      if (this.config.enableEmbeddings) {
        console.log('🧠 Generating embeddings...');
        await this.generateEmbeddings();
      }
      
      // Step 5: Detect issues
      console.log('🔍 Detecting issues...');
      await this.detectIssues();
      
      // Step 6: Update analysis session
      await this.completeAnalysisSession(session.session_id);
      
      this.stats.endTime = Date.now();
      const duration = (this.stats.endTime - this.stats.startTime) / 1000;
      
      console.log(`\n✅ Indexing complete in ${duration.toFixed(2)}s`);
      console.log(`📊 Statistics:`);
      console.log(`   Files: ${this.stats.filesProcessed}`);
      console.log(`   Entities: ${this.stats.entitiesFound}`);
      console.log(`   Relationships: ${this.stats.relationshipsFound}`);
      console.log(`   Issues: ${this.stats.issuesDetected}`);
      
      return {
        sessionId: session.session_id,
        stats: this.stats,
      };
      
    } catch (error) {
      console.error('❌ Indexing failed:', error);
      await this.failAnalysisSession(session.session_id, error.message);
      throw error;
    }
  }

  /**
   * Find all source files to index
   */
  async findSourceFiles() {
    const patterns = [
      '**/*.js',
      '**/*.jsx',
      '**/*.ts',
      '**/*.tsx',
      '**/*.mjs',
      '**/*.cjs',
    ];
    
    const files = await glob(patterns, {
      cwd: this.config.rootDir,
      ignore: this.config.ignorePaths,
      absolute: true,
    });
    
    // Filter by file size
    const validFiles = [];
    for (const file of files) {
      const stats = await fs.stat(file);
      if (stats.size <= this.config.maxFileSize) {
        validFiles.push(file);
      }
    }
    
    return validFiles;
  }

  /**
   * Index a single file
   */
  async indexFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const ext = path.extname(filePath);
      
      // Choose parser
      let parser;
      if (ext === '.ts' || ext === '.tsx') {
        parser = this.parsers.typescript;
      } else {
        parser = this.parsers.javascript;
      }
      
      const tree = parser.parse(content);
      const rootNode = tree.rootNode;
      
      // Extract entities
      await this.extractEntities(rootNode, filePath, content);
      
    } catch (error) {
      console.error(`Failed to index ${filePath}:`, error.message);
    }
  }

  /**
   * Extract code entities from AST
   */
  async extractEntities(node, filePath, content) {
    const entities = [];
    
    // Extract functions
    const functions = this.findNodesByType(node, [
      'function_declaration',
      'function_expression',
      'arrow_function',
      'method_definition',
    ]);
    
    for (const funcNode of functions) {
      const entity = await this.extractFunction(funcNode, filePath, content);
      if (entity) {
        entities.push(entity);
        await this.saveEntity(entity);
      }
    }
    
    // Extract classes
    const classes = this.findNodesByType(node, ['class_declaration']);
    for (const classNode of classes) {
      const entity = await this.extractClass(classNode, filePath, content);
      if (entity) {
        entities.push(entity);
        await this.saveEntity(entity);
      }
    }
    
    // Extract imports
    const imports = this.findNodesByType(node, ['import_statement']);
    for (const importNode of imports) {
      await this.extractImport(importNode, filePath, content);
    }
    
    // Extract exports
    const exports = this.findNodesByType(node, ['export_statement']);
    for (const exportNode of exports) {
      await this.extractExport(exportNode, filePath, content);
    }
    
    return entities;
  }

  /**
   * Extract function entity
   */
  async extractFunction(node, filePath, content) {
    try {
      const nameNode = node.childForFieldName('name');
      if (!nameNode) return null;
      
      const name = content.substring(nameNode.startIndex, nameNode.endIndex);
      const entityId = this.generateEntityId('function', filePath, name);
      
      const signature = content.substring(node.startIndex, node.endIndex)
        .split('\n')[0]
        .trim();
      
      const entity = {
        entity_id: entityId,
        entity_type: 'function',
        name,
        file_path: filePath,
        line_start: node.startPosition.row + 1,
        line_end: node.endPosition.row + 1,
        signature,
        language: path.extname(filePath).substring(1),
        properties: {
          async: this.isAsyncFunction(node),
          exported: this.isExported(node),
          parameters: this.extractParameters(node, content),
        },
      };
      
      this.entityCache.set(entityId, entity);
      this.stats.entitiesFound++;
      
      return entity;
      
    } catch (error) {
      console.error('Failed to extract function:', error);
      return null;
    }
  }

  /**
   * Extract class entity
   */
  async extractClass(node, filePath, content) {
    try {
      const nameNode = node.childForFieldName('name');
      if (!nameNode) return null;
      
      const name = content.substring(nameNode.startIndex, nameNode.endIndex);
      const entityId = this.generateEntityId('class', filePath, name);
      
      const entity = {
        entity_id: entityId,
        entity_type: 'class',
        name,
        file_path: filePath,
        line_start: node.startPosition.row + 1,
        line_end: node.endPosition.row + 1,
        language: path.extname(filePath).substring(1),
        properties: {
          exported: this.isExported(node),
          methods: this.extractMethods(node, content),
          extends: this.extractSuperClass(node, content),
        },
      };
      
      this.entityCache.set(entityId, entity);
      this.stats.entitiesFound++;
      
      return entity;
      
    } catch (error) {
      console.error('Failed to extract class:', error);
      return null;
    }
  }

  /**
   * Build relationships between entities
   */
  async buildRelationships() {
    const entities = Array.from(this.entityCache.values());
    
    for (const entity of entities) {
      // Find function calls
      if (entity.entity_type === 'function') {
        await this.findFunctionCalls(entity);
      }
      
      // Find class inheritance
      if (entity.entity_type === 'class' && entity.properties.extends) {
        await this.createInheritanceRelationship(entity);
      }
    }
  }

  /**
   * Find function calls in entity
   */
  async findFunctionCalls(entity) {
    try {
      const content = await fs.readFile(entity.file_path, 'utf-8');
      const parser = this.getParser(entity.file_path);
      const tree = parser.parse(content);
      
      // Find the function node
      const functionNode = this.findFunctionNode(tree.rootNode, entity, content);
      if (!functionNode) return;
      
      // Find call expressions
      const calls = this.findNodesByType(functionNode, ['call_expression']);
      
      for (const call of calls) {
        const calleeName = this.extractCalleeName(call, content);
        if (!calleeName) continue;
        
        // Find matching entity
        const targetEntity = this.findEntityByName(calleeName);
        if (targetEntity) {
          await this.createRelationship({
            from_entity_id: entity.entity_id,
            to_entity_id: targetEntity.entity_id,
            relationship_type: 'calls',
            weight: 1.0,
          });
        }
      }
      
    } catch (error) {
      console.error('Failed to find function calls:', error);
    }
  }

  /**
   * Detect code issues
   */
  async detectIssues() {
    // Detect orphaned code
    await this.detectOrphanedCode();
    
    // Detect high complexity
    await this.detectHighComplexity();
    
    // Detect missing documentation
    await this.detectMissingDocumentation();
    
    // Use DeepSeek for advanced analysis
    if (this.deepseekService) {
      await this.deepAnalysis();
    }
  }

  /**
   * Detect orphaned/dead code
   */
  async detectOrphanedCode() {
    if (!this.db) return;
    
    try {
      const result = await this.db.query(`
        SELECT entity_id, name, entity_type, file_path
        FROM code_entities
        WHERE entity_type = 'function'
        AND entity_id NOT IN (
          SELECT DISTINCT to_entity_id 
          FROM code_relationships 
          WHERE relationship_type = 'calls'
        )
        AND name NOT LIKE 'test%'
        AND name NOT LIKE '%Test'
      `);
      
      for (const orphan of result.rows) {
        await this.createIssue({
          severity: 'low',
          category: 'performance',
          file_path: orphan.file_path,
          title: `Potentially unused function: ${orphan.name}`,
          description: `Function "${orphan.name}" is not called from anywhere in the codebase`,
          suggestion: 'Consider removing if truly unused, or add documentation explaining why it exists',
          related_entity_id: orphan.entity_id,
          ai_detected: false,
        });
        
        this.stats.issuesDetected++;
      }
      
    } catch (error) {
      console.error('Failed to detect orphaned code:', error);
    }
  }

  /**
   * Detect high complexity code
   */
  async detectHighComplexity() {
    if (!this.db) return;
    
    try {
      const result = await this.db.query(`
        SELECT entity_id, name, file_path, complexity_score
        FROM code_entities
        WHERE complexity_score > 10
        ORDER BY complexity_score DESC
      `);
      
      for (const complex of result.rows) {
        await this.createIssue({
          severity: 'medium',
          category: 'performance',
          file_path: complex.file_path,
          title: `High complexity: ${complex.name}`,
          description: `Function has complexity score of ${complex.complexity_score}`,
          suggestion: 'Consider refactoring into smaller functions',
          related_entity_id: complex.entity_id,
          ai_detected: false,
        });
        
        this.stats.issuesDetected++;
      }
      
    } catch (error) {
      console.error('Failed to detect high complexity:', error);
    }
  }

  /**
   * DeepSeek-powered deep analysis
   */
  async deepAnalysis() {
    console.log('🤖 Running DeepSeek analysis...');
    
    // Get all entities
    const entities = Array.from(this.entityCache.values());
    
    // Analyze in batches
    const batchSize = 10;
    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);
      
      // Create context for DeepSeek
      const context = batch.map(e => ({
        name: e.name,
        type: e.entity_type,
        file: e.file_path,
        signature: e.signature,
      }));
      
      try {
        const analysis = await this.deepseekService.analyze({
          task: 'code_review',
          context,
          focus: ['bugs', 'performance', 'security'],
        });
        
        // Process findings
        if (analysis.issues) {
          for (const issue of analysis.issues) {
            await this.createIssue({
              ...issue,
              ai_detected: true,
              ai_confidence: issue.confidence || 0.8,
            });
            
            this.stats.issuesDetected++;
          }
        }
        
      } catch (error) {
        console.error('DeepSeek analysis failed:', error);
      }
    }
  }

  /**
   * Generate embeddings for semantic search
   */
  async generateEmbeddings() {
    if (!this.deepseekService) {
      console.log('⚠️  DeepSeek service not available, skipping embeddings');
      return;
    }
    
    const entities = Array.from(this.entityCache.values());
    
    for (const entity of entities) {
      try {
        // Create text representation
        const text = this.createEntityText(entity);
        
        // Generate embedding
        const embedding = await this.deepseekService.generateEmbedding(text);
        
        // Update entity
        if (this.db && embedding) {
          await this.db.query(
            `UPDATE code_entities SET embedding = $1 WHERE entity_id = $2`,
            [JSON.stringify(embedding), entity.entity_id]
          );
        }
        
      } catch (error) {
        console.error(`Failed to generate embedding for ${entity.name}:`, error);
      }
    }
  }

  /**
   * Create text representation for embedding
   */
  createEntityText(entity) {
    let text = `${entity.entity_type} ${entity.name}`;
    
    if (entity.signature) {
      text += ` ${entity.signature}`;
    }
    
    if (entity.description) {
      text += ` ${entity.description}`;
    }
    
    if (entity.properties) {
      const props = Object.entries(entity.properties)
        .map(([k, v]) => `${k}:${v}`)
        .join(' ');
      text += ` ${props}`;
    }
    
    return text;
  }

  /**
   * Helper methods
   */
  
  generateEntityId(type, filePath, name) {
    const hash = crypto
      .createHash('md5')
      .update(`${filePath}:${name}`)
      .digest('hex');
    return `${type}_${hash}`;
  }

  getParser(filePath) {
    const ext = path.extname(filePath);
    return (ext === '.ts' || ext === '.tsx') 
      ? this.parsers.typescript 
      : this.parsers.javascript;
  }

  findNodesByType(node, types) {
    const results = [];
    
    const traverse = (n) => {
      if (types.includes(n.type)) {
        results.push(n);
      }
      
      for (let child of n.children) {
        traverse(child);
      }
    };
    
    traverse(node);
    return results;
  }

  isAsyncFunction(node) {
    return node.text.includes('async ');
  }

  isExported(node) {
    return node.parent && node.parent.type === 'export_statement';
  }

  extractParameters(node, content) {
    const params = node.childForFieldName('parameters');
    if (!params) return [];
    
    return params.children
      .filter(c => c.type === 'identifier')
      .map(c => content.substring(c.startIndex, c.endIndex));
  }

  extractMethods(node, content) {
    const body = node.childForFieldName('body');
    if (!body) return [];
    
    return this.findNodesByType(body, ['method_definition'])
      .map(m => {
        const name = m.childForFieldName('name');
        return name ? content.substring(name.startIndex, name.endIndex) : null;
      })
      .filter(Boolean);
  }

  extractSuperClass(node, content) {
    const heritage = node.childForFieldName('heritage');
    if (!heritage) return null;
    
    return content.substring(heritage.startIndex, heritage.endIndex);
  }

  extractCalleeName(node, content) {
    const func = node.childForFieldName('function');
    if (!func) return null;
    
    return content.substring(func.startIndex, func.endIndex);
  }

  findFunctionNode(rootNode, entity, content) {
    const functions = this.findNodesByType(rootNode, [
      'function_declaration',
      'function_expression',
      'arrow_function',
      'method_definition',
    ]);
    
    for (const func of functions) {
      if (func.startPosition.row + 1 === entity.line_start) {
        return func;
      }
    }
    
    return null;
  }

  findEntityByName(name) {
    for (const entity of this.entityCache.values()) {
      if (entity.name === name) {
        return entity;
      }
    }
    return null;
  }

  /**
   * Database operations
   */
  
  async saveEntity(entity) {
    if (!this.db) return;
    
    try {
      await this.db.query(
        `INSERT INTO code_entities (
          entity_id, entity_type, name, file_path, line_start, line_end,
          signature, language, properties
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (entity_id) DO UPDATE SET
          name = EXCLUDED.name,
          file_path = EXCLUDED.file_path,
          line_start = EXCLUDED.line_start,
          line_end = EXCLUDED.line_end,
          signature = EXCLUDED.signature,
          properties = EXCLUDED.properties,
          updated_at = CURRENT_TIMESTAMP`,
        [
          entity.entity_id,
          entity.entity_type,
          entity.name,
          entity.file_path,
          entity.line_start,
          entity.line_end,
          entity.signature,
          entity.language,
          JSON.stringify(entity.properties || {}),
        ]
      );
    } catch (error) {
      console.error('Failed to save entity:', error);
    }
  }

  async createRelationship(rel) {
    if (!this.db) return;
    
    const relationshipId = `${rel.from_entity_id}_${rel.relationship_type}_${rel.to_entity_id}`;
    
    try {
      await this.db.query(
        `INSERT INTO code_relationships (
          relationship_id, from_entity_id, to_entity_id, relationship_type, weight
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (relationship_id) DO NOTHING`,
        [relationshipId, rel.from_entity_id, rel.to_entity_id, rel.relationship_type, rel.weight]
      );
      
      this.stats.relationshipsFound++;
    } catch (error) {
      // Ignore foreign key violations (entity might not exist yet)
      if (!error.message.includes('foreign key')) {
        console.error('Failed to create relationship:', error);
      }
    }
  }

  async createIssue(issue) {
    if (!this.db) return;
    
    const issueId = crypto.randomBytes(16).toString('hex');
    
    try {
      await this.db.query(
        `INSERT INTO code_issues (
          issue_id, severity, category, file_path, title, description,
          suggestion, related_entity_id, ai_detected, ai_confidence
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          issueId,
          issue.severity,
          issue.category,
          issue.file_path,
          issue.title,
          issue.description,
          issue.suggestion,
          issue.related_entity_id,
          issue.ai_detected,
          issue.ai_confidence || 0,
        ]
      );
    } catch (error) {
      console.error('Failed to create issue:', error);
    }
  }

  async createAnalysisSession(options) {
    if (!this.db) {
      return { session_id: crypto.randomBytes(16).toString('hex') };
    }
    
    const sessionId = crypto.randomBytes(16).toString('hex');
    
    await this.db.query(
      `INSERT INTO code_analysis_sessions (
        session_id, repository, analysis_type, status, started_at
      ) VALUES ($1, $2, $3, $4, $5)`,
      [sessionId, this.config.rootDir, options.analysisType, 'running', new Date()]
    );
    
    return { session_id: sessionId };
  }

  async completeAnalysisSession(sessionId) {
    if (!this.db) return;
    
    await this.db.query(
      `UPDATE code_analysis_sessions SET
        status = 'complete',
        completed_at = $1,
        entities_found = $2,
        relationships_found = $3,
        issues_found = $4
      WHERE session_id = $5`,
      [
        new Date(),
        this.stats.entitiesFound,
        this.stats.relationshipsFound,
        this.stats.issuesDetected,
        sessionId,
      ]
    );
  }

  async failAnalysisSession(sessionId, error) {
    if (!this.db) return;
    
    await this.db.query(
      `UPDATE code_analysis_sessions SET
        status = 'error',
        completed_at = $1,
        metadata = $2
      WHERE session_id = $3`,
      [new Date(), JSON.stringify({ error }), sessionId]
    );
  }
}

export default CodebaseIndexingService;
