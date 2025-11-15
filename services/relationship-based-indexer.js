/**
 * Relationship-Based Code Indexer
 * 
 * Advanced indexing by relationships:
 * - Same error patterns across files
 * - Bad coding structure patterns
 * - Too many files in directories
 * - Duplicate code detection
 * - Process flow analysis
 * 
 * Provides reasoning on where to start with existing codebase
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

export class RelationshipBasedIndexer extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      duplicateThreshold: config.duplicateThreshold || 0.85,
      maxFilesPerDir: config.maxFilesPerDir || 50,
      complexityThreshold: config.complexityThreshold || 10,
      ...config,
    };

    this.db = config.db;
    this.relationships = new Map();
    
    this.stats = {
      errorPatterns: 0,
      structuralIssues: 0,
      duplicates: 0,
      recommendations: 0,
    };
  }

  /**
   * Analyze codebase by relationships
   */
  async analyzeByRelationships() {
    console.log('🔍 Analyzing codebase by relationships...\n');
    
    // 1. Error pattern relationships
    console.log('📊 Phase 1: Error Pattern Analysis');
    await this.analyzeErrorPatterns();
    
    // 2. Structural issues
    console.log('\n🏗️  Phase 2: Structural Analysis');
    await this.analyzeStructure();
    
    // 3. Duplicate code
    console.log('\n📝 Phase 3: Duplicate Detection');
    await this.analyzeDuplicates();
    
    // 4. Process flows
    console.log('\n🔄 Phase 4: Process Flow Analysis');
    await this.analyzeProcessFlows();
    
    // 5. Generate recommendations
    console.log('\n💡 Phase 5: Generating Recommendations');
    const recommendations = await this.generateRecommendations();
    
    console.log('\n✅ Relationship analysis complete!');
    console.log(`📊 Statistics:`);
    console.log(`   Error patterns found: ${this.stats.errorPatterns}`);
    console.log(`   Structural issues: ${this.stats.structuralIssues}`);
    console.log(`   Duplicate groups: ${this.stats.duplicates}`);
    console.log(`   Recommendations: ${this.stats.recommendations}`);
    
    return recommendations;
  }

  /**
   * Analyze error patterns across codebase
   */
  async analyzeErrorPatterns() {
    if (!this.db) return;
    
    // Group issues by pattern
    const result = await this.db.query(`
      SELECT 
        category,
        severity,
        COUNT(*) as count,
        ARRAY_AGG(DISTINCT file_path) as files,
        ARRAY_AGG(DISTINCT related_entity_id) as entities
      FROM code_issues
      WHERE status = 'open'
      GROUP BY category, severity
      HAVING COUNT(*) > 1
      ORDER BY 
        CASE severity 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          ELSE 4
        END,
        count DESC
    `);
    
    for (const pattern of result.rows) {
      this.relationships.set(`error_pattern_${pattern.category}`, {
        type: 'error_pattern',
        category: pattern.category,
        severity: pattern.severity,
        count: pattern.count,
        affectedFiles: pattern.files,
        affectedEntities: pattern.entities,
        reasoning: this.getErrorPatternReasoning(pattern),
      });
      
      this.stats.errorPatterns++;
    }
    
    console.log(`✅ Found ${this.stats.errorPatterns} error patterns`);
  }

  /**
   * Analyze code structure
   */
  async analyzeStructure() {
    if (!this.db) return;
    
    // Check for overcrowded directories
    const dirCounts = await this.db.query(`
      SELECT 
        SUBSTRING(file_path FROM '^[^/]+(/[^/]+)*') as directory,
        COUNT(*) as file_count
      FROM code_entities
      WHERE entity_type = 'file'
      GROUP BY directory
      HAVING COUNT(*) > $1
      ORDER BY file_count DESC
    `, [this.config.maxFilesPerDir]);
    
    for (const dir of dirCounts.rows) {
      this.relationships.set(`structure_crowded_${dir.directory}`, {
        type: 'structural_issue',
        issue: 'overcrowded_directory',
        directory: dir.directory,
        fileCount: dir.file_count,
        threshold: this.config.maxFilesPerDir,
        reasoning: `Directory "${dir.directory}" has ${dir.file_count} files (threshold: ${this.config.maxFilesPerDir}). Consider splitting into subdirectories.`,
      });
      
      this.stats.structuralIssues++;
    }
    
    // Check for deep nesting
    const deepNesting = await this.db.query(`
      SELECT 
        file_path,
        LENGTH(file_path) - LENGTH(REPLACE(file_path, '/', '')) as depth
      FROM code_entities
      WHERE entity_type = 'file'
      HAVING LENGTH(file_path) - LENGTH(REPLACE(file_path, '/', '')) > 5
      ORDER BY depth DESC
    `);
    
    for (const file of deepNesting.rows) {
      this.relationships.set(`structure_deep_${file.file_path}`, {
        type: 'structural_issue',
        issue: 'deep_nesting',
        filePath: file.file_path,
        depth: file.depth,
        reasoning: `File at depth ${file.depth} may indicate overly complex structure. Consider flattening.`,
      });
      
      this.stats.structuralIssues++;
    }
    
    console.log(`✅ Found ${this.stats.structuralIssues} structural issues`);
  }

  /**
   * Analyze duplicate code
   */
  async analyzeDuplicates() {
    if (!this.db) return;
    
    // Find similar functions by name and signature
    const entities = await this.db.query(`
      SELECT entity_id, name, signature, file_path
      FROM code_entities
      WHERE entity_type IN ('function', 'class')
      AND signature IS NOT NULL
    `);
    
    // Group by signature hash
    const signatureGroups = new Map();
    
    for (const entity of entities.rows) {
      const hash = this.hashSignature(entity.signature);
      
      if (!signatureGroups.has(hash)) {
        signatureGroups.set(hash, []);
      }
      signatureGroups.get(hash).push(entity);
    }
    
    // Find duplicates
    for (const [hash, group] of signatureGroups) {
      if (group.length > 1) {
        this.relationships.set(`duplicate_${hash}`, {
          type: 'duplicate_code',
          signatureHash: hash,
          count: group.length,
          entities: group.map(e => ({
            id: e.entity_id,
            name: e.name,
            file: e.file_path,
          })),
          reasoning: `Found ${group.length} functions with similar signatures. Consider refactoring into shared utility.`,
        });
        
        this.stats.duplicates++;
      }
    }
    
    console.log(`✅ Found ${this.stats.duplicates} duplicate groups`);
  }

  /**
   * Analyze process flows
   */
  async analyzeProcessFlows() {
    if (!this.db) return;
    
    // Find entry points (functions that are never called)
    const entryPoints = await this.db.query(`
      SELECT ce.entity_id, ce.name, ce.file_path
      FROM code_entities ce
      WHERE ce.entity_type = 'function'
      AND NOT EXISTS (
        SELECT 1 FROM code_relationships cr
        WHERE cr.to_entity_id = ce.entity_id
        AND cr.relationship_type = 'calls'
      )
      AND ce.name LIKE '%main%' OR ce.name LIKE '%start%' OR ce.name LIKE '%init%'
    `);
    
    // Analyze flow from each entry point
    for (const entry of entryPoints.rows) {
      const flow = await this.traceProcessFlow(entry.entity_id);
      
      this.relationships.set(`flow_${entry.entity_id}`, {
        type: 'process_flow',
        entryPoint: entry.name,
        file: entry.file_path,
        depth: flow.depth,
        totalFunctions: flow.functions.length,
        functions: flow.functions,
        reasoning: `Process flow starting from "${entry.name}" involves ${flow.functions.length} functions across ${flow.depth} levels.`,
      });
    }
  }

  /**
   * Trace process flow from entity
   */
  async traceProcessFlow(entityId, visited = new Set(), depth = 0, maxDepth = 10) {
    if (visited.has(entityId) || depth > maxDepth) {
      return { depth, functions: [] };
    }
    
    visited.add(entityId);
    
    // Get calls from this entity
    const calls = await this.db.query(`
      SELECT cr.to_entity_id, ce.name
      FROM code_relationships cr
      JOIN code_entities ce ON cr.to_entity_id = ce.entity_id
      WHERE cr.from_entity_id = $1
      AND cr.relationship_type = 'calls'
    `, [entityId]);
    
    const functions = [entityId];
    let maxSubDepth = depth;
    
    for (const call of calls.rows) {
      const subFlow = await this.traceProcessFlow(call.to_entity_id, visited, depth + 1, maxDepth);
      functions.push(...subFlow.functions);
      maxSubDepth = Math.max(maxSubDepth, subFlow.depth);
    }
    
    return { depth: maxSubDepth, functions };
  }

  /**
   * Generate recommendations
   */
  async generateRecommendations() {
    const recommendations = [];
    
    // Prioritize by impact
    const priorities = {
      error_pattern: 10,
      structural_issue: 7,
      duplicate_code: 5,
      process_flow: 3,
    };
    
    for (const [id, relationship] of this.relationships) {
      const priority = priorities[relationship.type] || 1;
      
      recommendations.push({
        id,
        type: relationship.type,
        priority,
        title: this.getRecommendationTitle(relationship),
        description: relationship.reasoning,
        actionItems: this.getActionItems(relationship),
        estimatedEffort: this.estimateEffort(relationship),
        impact: this.estimateImpact(relationship),
      });
    }
    
    // Sort by priority and impact
    recommendations.sort((a, b) => {
      const scoreA = a.priority * a.impact;
      const scoreB = b.priority * b.impact;
      return scoreB - scoreA;
    });
    
    this.stats.recommendations = recommendations.length;
    
    // Save to database
    if (this.db) {
      for (const rec of recommendations) {
        await this.saveRecommendation(rec);
      }
    }
    
    return recommendations;
  }

  /**
   * Get recommendation title
   */
  getRecommendationTitle(relationship) {
    switch (relationship.type) {
      case 'error_pattern':
        return `Fix recurring ${relationship.category} errors (${relationship.count} instances)`;
      case 'structural_issue':
        if (relationship.issue === 'overcrowded_directory') {
          return `Reorganize overcrowded directory (${relationship.fileCount} files)`;
        }
        return `Reduce nesting depth`;
      case 'duplicate_code':
        return `Refactor duplicate code (${relationship.count} instances)`;
      case 'process_flow':
        return `Document process flow: ${relationship.entryPoint}`;
      default:
        return 'Code improvement opportunity';
    }
  }

  /**
   * Get action items
   */
  getActionItems(relationship) {
    const actions = [];
    
    switch (relationship.type) {
      case 'error_pattern':
        actions.push('Review all affected files');
        actions.push('Identify root cause');
        actions.push('Create fix template');
        actions.push('Apply fix across codebase');
        actions.push('Add tests to prevent recurrence');
        break;
        
      case 'structural_issue':
        actions.push('Analyze current structure');
        actions.push('Design improved organization');
        actions.push('Create migration plan');
        actions.push('Move files incrementally');
        actions.push('Update import paths');
        break;
        
      case 'duplicate_code':
        actions.push('Compare duplicate implementations');
        actions.push('Design shared abstraction');
        actions.push('Create utility function/class');
        actions.push('Replace duplicates');
        actions.push('Add tests');
        break;
        
      case 'process_flow':
        actions.push('Document entry point');
        actions.push('Map function calls');
        actions.push('Add inline comments');
        actions.push('Create flow diagram');
        break;
    }
    
    return actions;
  }

  /**
   * Estimate effort
   */
  estimateEffort(relationship) {
    switch (relationship.type) {
      case 'error_pattern':
        return relationship.count * 0.5; // 30 min per instance
      case 'structural_issue':
        return relationship.fileCount ? relationship.fileCount * 0.1 : 2;
      case 'duplicate_code':
        return relationship.count * 1; // 1 hour per duplicate
      case 'process_flow':
        return relationship.totalFunctions * 0.2; // 12 min per function
      default:
        return 1;
    }
  }

  /**
   * Estimate impact
   */
  estimateImpact(relationship) {
    switch (relationship.type) {
      case 'error_pattern':
        const severity = relationship.severity;
        return severity === 'critical' ? 10 : severity === 'high' ? 8 : 5;
      case 'structural_issue':
        return 7;
      case 'duplicate_code':
        return relationship.count > 5 ? 8 : 5;
      case 'process_flow':
        return 3;
      default:
        return 1;
    }
  }

  /**
   * Get error pattern reasoning
   */
  getErrorPatternReasoning(pattern) {
    return `Found ${pattern.count} instances of ${pattern.category} errors with ${pattern.severity} severity across ${pattern.files.length} files. This indicates a systemic issue that should be addressed at the root cause level.`;
  }

  /**
   * Hash signature for duplicate detection
   */
  hashSignature(signature) {
    // Normalize signature
    const normalized = signature
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[{}()\[\]]/g, '');
    
    return crypto
      .createHash('md5')
      .update(normalized)
      .digest('hex');
  }

  /**
   * Save recommendation to database
   */
  async saveRecommendation(recommendation) {
    if (!this.db) return;
    
    await this.db.query(`
      INSERT INTO code_recommendations (
        recommendation_id, type, priority, title, description,
        action_items, estimated_effort, impact
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (recommendation_id) DO UPDATE SET
        priority = EXCLUDED.priority,
        updated_at = CURRENT_TIMESTAMP
    `, [
      recommendation.id,
      recommendation.type,
      recommendation.priority,
      recommendation.title,
      recommendation.description,
      JSON.stringify(recommendation.actionItems),
      recommendation.estimatedEffort,
      recommendation.impact,
    ]);
  }
}

export default RelationshipBasedIndexer;
