/**
 * Agent Mode Service for Error Investigation
 * 
 * Uses knowledge graph and indexed DB to give agents a subset of codebase data
 * related to errors or development features.
 * 
 * Features:
 * - Queries knowledge graph for relevant code context
 * - Extracts error-related code snippets from indexed DB
 * - Creates focused context for agent investigation
 * - Integrates with error orchestration system
 * 
 * @module services/agent-mode-investigation
 */

import { EventEmitter } from 'events';
import path from 'path';
import crypto from 'crypto';

export class AgentModeInvestigationService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      db: config.db,
      knowledgeGraphService: config.knowledgeGraphService,
      maxContextSize: config.maxContextSize || 10000, // lines of code
      maxFileDepth: config.maxFileDepth || 3, // how many dependency levels to include
      includeTests: config.includeTests !== false,
      ...config,
    };
    
    if (!this.config.db) {
      throw new Error('Database connection required for AgentModeInvestigationService');
    }
  }
  
  /**
   * Create an investigation context for an error
   */
  async createErrorInvestigationContext(errorReportId) {
    console.log(`🔍 Creating investigation context for error ${errorReportId}...`);
    
    // Get error details from database
    const error = await this.getErrorReport(errorReportId);
    
    if (!error) {
      throw new Error(`Error report ${errorReportId} not found`);
    }
    
    // Extract relevant context from error
    const context = {
      errorId: errorReportId,
      errorHash: error.error_hash,
      errorType: error.error_type,
      severity: error.severity,
      component: error.component,
      service: error.service,
      message: error.message,
      stackTrace: error.stack_trace,
      context: error.context,
      timestamp: error.last_seen_at,
    };
    
    // Build knowledge graph query from error context
    const relevantFiles = await this.findRelevantFiles(context);
    
    // Get code snippets for relevant files
    const codeContext = await this.extractCodeContext(relevantFiles);
    
    // Get related errors (pattern detection)
    const relatedErrors = await this.findRelatedErrors(error);
    
    // Get schema information if available
    const schemaContext = await this.getSchemaContext(context);
    
    // Build complete investigation package
    const investigationContext = {
      error: context,
      files: codeContext,
      relatedErrors,
      schemas: schemaContext,
      metadata: {
        totalFiles: relevantFiles.length,
        totalLines: codeContext.reduce((sum, f) => sum + (f.content?.split('\n').length || 0), 0),
        generatedAt: new Date().toISOString(),
      },
    };
    
    // Save investigation context to database
    await this.saveInvestigationContext(errorReportId, investigationContext);
    
    console.log(`✅ Investigation context created: ${investigationContext.files.length} files, ${investigationContext.metadata.totalLines} lines`);
    
    this.emit('context:created', { errorReportId, context: investigationContext });
    
    return investigationContext;
  }
  
  /**
   * Create an investigation context for a feature request
   */
  async createFeatureInvestigationContext(featureDescription, relatedComponents = []) {
    console.log(`🔍 Creating investigation context for feature: ${featureDescription.substring(0, 50)}...`);
    
    // Parse feature description to extract relevant components
    const componentContext = {
      description: featureDescription,
      components: relatedComponents,
      type: 'feature',
    };
    
    // Find relevant files from knowledge graph
    const relevantFiles = await this.findRelevantFilesForFeature(componentContext);
    
    // Get code context
    const codeContext = await this.extractCodeContext(relevantFiles);
    
    // Get related patterns from similar features
    const similarFeatures = await this.findSimilarFeatures(featureDescription);
    
    // Build investigation package
    const investigationContext = {
      feature: componentContext,
      files: codeContext,
      similarFeatures,
      metadata: {
        totalFiles: relevantFiles.length,
        totalLines: codeContext.reduce((sum, f) => sum + (f.content?.split('\n').length || 0), 0),
        generatedAt: new Date().toISOString(),
      },
    };
    
    console.log(`✅ Feature investigation context created: ${investigationContext.files.length} files`);
    
    return investigationContext;
  }
  
  /**
   * Get error report from database
   */
  async getErrorReport(errorReportId) {
    const query = `
      SELECT * FROM error_reports
      WHERE id = $1
    `;
    
    const result = await this.config.db.query(query, [errorReportId]);
    return result.rows[0] || null;
  }
  
  /**
   * Find files relevant to an error using knowledge graph
   */
  async findRelevantFiles(errorContext) {
    const relevantFiles = new Set();
    
    // Extract file paths from stack trace
    if (errorContext.stackTrace) {
      const fileMatches = errorContext.stackTrace.match(/(?:at|in)\s+([^\s:]+(?:\.js|\.ts|\.jsx|\.tsx|\.cjs|\.mjs))/gi);
      if (fileMatches) {
        fileMatches.forEach(match => {
          const filePath = match.replace(/(?:at|in)\s+/i, '').split(':')[0];
          relevantFiles.add(filePath);
        });
      }
    }
    
    // Add component file if available
    if (errorContext.component) {
      const componentFiles = await this.findComponentFiles(errorContext.component);
      componentFiles.forEach(f => relevantFiles.add(f));
    }
    
    // Query knowledge graph for related files
    if (this.config.knowledgeGraphService && relevantFiles.size > 0) {
      for (const file of relevantFiles) {
        const related = await this.getRelatedFilesFromKnowledgeGraph(file);
        related.forEach(f => relevantFiles.add(f));
      }
    }
    
    // If no files found, try to find by service/component
    if (relevantFiles.size === 0) {
      const serviceFiles = await this.findServiceFiles(errorContext.service || errorContext.component);
      serviceFiles.forEach(f => relevantFiles.add(f));
    }
    
    return Array.from(relevantFiles);
  }
  
  /**
   * Find files for a component
   */
  async findComponentFiles(componentName) {
    const query = `
      SELECT DISTINCT file_path
      FROM codebase_index
      WHERE file_path ILIKE $1
         OR content ILIKE $2
      LIMIT 20
    `;
    
    try {
      const result = await this.config.db.query(query, [
        `%${componentName}%`,
        `%${componentName}%`
      ]);
      
      return result.rows.map(r => r.file_path);
    } catch (error) {
      // If codebase_index doesn't exist, return empty array
      console.debug('codebase_index table not available:', error.message);
      return [];
    }
  }
  
  /**
   * Find files for a service
   */
  async findServiceFiles(serviceName) {
    if (!serviceName) return [];
    
    // Common service file patterns
    const patterns = [
      `services/${serviceName}`,
      `src/services/${serviceName}`,
      `api/${serviceName}`,
      `src/api/${serviceName}`,
    ];
    
    const files = [];
    
    for (const pattern of patterns) {
      try {
        const query = `
          SELECT file_path
          FROM codebase_index
          WHERE file_path ILIKE $1
          LIMIT 10
        `;
        
        const result = await this.config.db.query(query, [`%${pattern}%`]);
        files.push(...result.rows.map(r => r.file_path));
      } catch (error) {
        // Ignore if table doesn't exist
      }
    }
    
    return files;
  }
  
  /**
   * Get related files from knowledge graph
   */
  async getRelatedFilesFromKnowledgeGraph(filePath) {
    if (!this.config.knowledgeGraphService) {
      return [];
    }
    
    try {
      // Query knowledge graph for dependencies and dependents
      const related = await this.config.knowledgeGraphService.getRelatedFiles(filePath, {
        maxDepth: this.config.maxFileDepth,
        includeTests: this.config.includeTests,
      });
      
      return related;
    } catch (error) {
      console.debug('Knowledge graph query failed:', error.message);
      return [];
    }
  }
  
  /**
   * Extract code context for files
   */
  async extractCodeContext(filePaths) {
    const codeContext = [];
    
    for (const filePath of filePaths) {
      try {
        const query = `
          SELECT file_path, content, last_modified, size_bytes
          FROM codebase_index
          WHERE file_path = $1
        `;
        
        const result = await this.config.db.query(query, [filePath]);
        
        if (result.rows.length > 0) {
          const file = result.rows[0];
          codeContext.push({
            path: file.file_path,
            content: file.content,
            lastModified: file.last_modified,
            size: file.size_bytes,
          });
        }
      } catch (error) {
        console.debug(`Failed to get content for ${filePath}:`, error.message);
      }
    }
    
    return codeContext;
  }
  
  /**
   * Find related errors (pattern detection)
   */
  async findRelatedErrors(error) {
    const query = `
      SELECT id, error_type, message, component, occurrence_count, last_seen_at
      FROM error_reports
      WHERE (
        error_type = $1
        OR component = $2
        OR error_hash IN (
          SELECT error_hash FROM error_aggregations
          WHERE pattern_hash = (
            SELECT pattern_hash FROM error_aggregations
            WHERE error_pattern->>'error_type' = $1
            LIMIT 1
          )
        )
      )
      AND id != $3
      ORDER BY occurrence_count DESC, last_seen_at DESC
      LIMIT 10
    `;
    
    try {
      const result = await this.config.db.query(query, [
        error.error_type,
        error.component,
        error.id
      ]);
      
      return result.rows;
    } catch (error) {
      console.debug('Failed to find related errors:', error.message);
      return [];
    }
  }
  
  /**
   * Get schema context if available
   */
  async getSchemaContext(errorContext) {
    try {
      const query = `
        SELECT schema_name, schema_definition, version
        FROM schemas
        WHERE schema_name ILIKE $1
           OR schema_definition::text ILIKE $2
        LIMIT 5
      `;
      
      const result = await this.config.db.query(query, [
        `%${errorContext.component}%`,
        `%${errorContext.component}%`
      ]);
      
      return result.rows.map(r => ({
        name: r.schema_name,
        definition: r.schema_definition,
        version: r.version,
      }));
    } catch (error) {
      console.debug('Schema context not available:', error.message);
      return [];
    }
  }
  
  /**
   * Find files relevant to a feature
   */
  async findRelevantFilesForFeature(featureContext) {
    const relevantFiles = new Set();
    
    // Find files related to specified components
    for (const component of featureContext.components) {
      const files = await this.findComponentFiles(component);
      files.forEach(f => relevantFiles.add(f));
    }
    
    // Search for similar features in codebase
    try {
      const query = `
        SELECT DISTINCT file_path
        FROM codebase_index
        WHERE content ILIKE $1
        LIMIT 20
      `;
      
      // Extract key terms from feature description
      const keyTerms = featureContext.description
        .split(/\s+/)
        .filter(word => word.length > 4)
        .slice(0, 5)
        .join('|');
      
      const result = await this.config.db.query(query, [`%${keyTerms}%`]);
      result.rows.forEach(r => relevantFiles.add(r.file_path));
    } catch (error) {
      console.debug('Feature file search failed:', error.message);
    }
    
    return Array.from(relevantFiles);
  }
  
  /**
   * Find similar features
   */
  async findSimilarFeatures(featureDescription) {
    // This would query a features/tickets database
    // For now, return empty array
    return [];
  }
  
  /**
   * Save investigation context to database
   */
  async saveInvestigationContext(errorReportId, context) {
    const query = `
      INSERT INTO agent_investigation_contexts
        (error_report_id, context_data, file_count, line_count, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id
    `;
    
    try {
      const result = await this.config.db.query(query, [
        errorReportId,
        JSON.stringify(context),
        context.metadata.totalFiles,
        context.metadata.totalLines
      ]);
      
      return result.rows[0].id;
    } catch (error) {
      // Table might not exist yet
      console.debug('Failed to save investigation context:', error.message);
      return null;
    }
  }
  
  /**
   * Get investigation context from database
   */
  async getInvestigationContext(errorReportId) {
    const query = `
      SELECT * FROM agent_investigation_contexts
      WHERE error_report_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    try {
      const result = await this.config.db.query(query, [errorReportId]);
      
      if (result.rows.length > 0) {
        return result.rows[0].context_data;
      }
    } catch (error) {
      console.debug('Failed to get investigation context:', error.message);
    }
    
    return null;
  }
}

export default AgentModeInvestigationService;
