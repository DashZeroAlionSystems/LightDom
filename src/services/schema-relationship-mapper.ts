/**
 * Schema Relationship Mapping Algorithms
 * Advanced algorithms for discovering and mapping relationships between schemas
 */

import { Pool } from 'pg';

export interface SchemaNode {
  id: string;
  name: string;
  category: string;
  definition: any;
  properties: string[];
}

export interface SchemaRelationship {
  sourceId: string;
  targetId: string;
  type: string;
  confidence: number;
  metadata: any;
  algorithm: string;
}

export interface SchemaGraph {
  nodes: SchemaNode[];
  edges: SchemaRelationship[];
}

/**
 * Schema Relationship Mapper
 * Implements various algorithms for discovering schema relationships
 */
export class SchemaRelationshipMapper {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  /**
   * Generate complete schema map using all algorithms
   */
  async generateCompleteSchemaMap(options?: {
    minConfidence?: number;
    includeInferred?: boolean;
    algorithms?: string[];
  }): Promise<SchemaGraph> {
    const minConfidence = options?.minConfidence || 0.3;
    const includeInferred = options?.includeInferred !== false;
    const algorithms = options?.algorithms || [
      'property-match',
      'naming-convention',
      'type-compatibility',
      'structural-similarity',
      'semantic-analysis'
    ];

    // Load all schemas
    const schemas = await this.loadAllSchemas();
    const nodes: SchemaNode[] = schemas;
    const edges: SchemaRelationship[] = [];

    // Run each algorithm
    for (const algorithm of algorithms) {
      const relationships = await this.runAlgorithm(algorithm, schemas);
      edges.push(...relationships.filter(r => r.confidence >= minConfidence));
    }

    // Deduplicate edges (keep highest confidence)
    const deduplicatedEdges = this.deduplicateEdges(edges);

    // Add inferred relationships if enabled
    if (includeInferred) {
      const inferred = this.inferTransitiveRelationships(deduplicatedEdges);
      deduplicatedEdges.push(...inferred);
    }

    return { nodes, edges: deduplicatedEdges };
  }

  /**
   * Load all schemas from database
   */
  private async loadAllSchemas(): Promise<SchemaNode[]> {
    const result = await this.db.query(`
      SELECT id, name, category, schema_definition
      FROM schemas
      ORDER BY name
    `);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      definition: row.schema_definition,
      properties: this.extractProperties(row.schema_definition)
    }));
  }

  /**
   * Extract property names from schema definition
   */
  private extractProperties(definition: any): string[] {
    if (!definition || !definition.properties) {
      return [];
    }
    return Object.keys(definition.properties);
  }

  /**
   * Run specific algorithm to find relationships
   */
  private async runAlgorithm(
    algorithm: string,
    schemas: SchemaNode[]
  ): Promise<SchemaRelationship[]> {
    switch (algorithm) {
      case 'property-match':
        return this.propertyMatchAlgorithm(schemas);
      case 'naming-convention':
        return this.namingConventionAlgorithm(schemas);
      case 'type-compatibility':
        return this.typeCompatibilityAlgorithm(schemas);
      case 'structural-similarity':
        return this.structuralSimilarityAlgorithm(schemas);
      case 'semantic-analysis':
        return this.semanticAnalysisAlgorithm(schemas);
      default:
        return [];
    }
  }

  /**
   * Algorithm 1: Property Name Matching
   * Finds relationships based on common property names
   */
  private propertyMatchAlgorithm(schemas: SchemaNode[]): SchemaRelationship[] {
    const relationships: SchemaRelationship[] = [];

    for (let i = 0; i < schemas.length; i++) {
      for (let j = i + 1; j < schemas.length; j++) {
        const schema1 = schemas[i];
        const schema2 = schemas[j];

        const commonProps = schema1.properties.filter(p => 
          schema2.properties.includes(p)
        );

        if (commonProps.length > 0) {
          const confidence = commonProps.length / 
            Math.max(schema1.properties.length, schema2.properties.length);

          relationships.push({
            sourceId: schema1.id,
            targetId: schema2.id,
            type: 'property-match',
            confidence,
            metadata: { commonProperties: commonProps },
            algorithm: 'property-match'
          });
        }
      }
    }

    return relationships;
  }

  /**
   * Algorithm 2: Naming Convention Analysis
   * Detects references based on naming patterns (e.g., userId -> User)
   */
  private namingConventionAlgorithm(schemas: SchemaNode[]): SchemaRelationship[] {
    const relationships: SchemaRelationship[] = [];
    const refPatterns = [
      /(.+)Id$/,          // userId, productId
      /(.+)_id$/,         // user_id, product_id
      /(.+)Ref$/,         // userRef, productRef
      /(.+)_ref$/,        // user_ref, product_ref
      /(.+)Key$/,         // userKey, productKey
    ];

    for (const schema of schemas) {
      for (const prop of schema.properties) {
        // Check each pattern
        for (const pattern of refPatterns) {
          const match = prop.match(pattern);
          if (match) {
            const baseName = match[1];
            
            // Find schemas that match the base name
            const targetSchemas = schemas.filter(s => 
              s.name.toLowerCase().includes(baseName.toLowerCase()) ||
              baseName.toLowerCase().includes(s.name.toLowerCase())
            );

            for (const target of targetSchemas) {
              if (target.id !== schema.id) {
                relationships.push({
                  sourceId: schema.id,
                  targetId: target.id,
                  type: 'foreign-key',
                  confidence: 0.8,
                  metadata: { 
                    referenceField: prop,
                    pattern: pattern.source,
                    inferredRelation: 'references'
                  },
                  algorithm: 'naming-convention'
                });
              }
            }
          }
        }
      }
    }

    return relationships;
  }

  /**
   * Algorithm 3: Type Compatibility Analysis
   * Finds relationships based on compatible property types
   */
  private typeCompatibilityAlgorithm(schemas: SchemaNode[]): SchemaRelationship[] {
    const relationships: SchemaRelationship[] = [];

    for (let i = 0; i < schemas.length; i++) {
      for (let j = i + 1; j < schemas.length; j++) {
        const schema1 = schemas[i];
        const schema2 = schemas[j];

        const compatibility = this.calculateTypeCompatibility(
          schema1.definition,
          schema2.definition
        );

        if (compatibility.score > 0.4) {
          relationships.push({
            sourceId: schema1.id,
            targetId: schema2.id,
            type: 'type-compatible',
            confidence: compatibility.score,
            metadata: { 
              compatibleTypes: compatibility.details 
            },
            algorithm: 'type-compatibility'
          });
        }
      }
    }

    return relationships;
  }

  /**
   * Calculate type compatibility between two schemas
   */
  private calculateTypeCompatibility(def1: any, def2: any): {
    score: number;
    details: any[];
  } {
    if (!def1?.properties || !def2?.properties) {
      return { score: 0, details: [] };
    }

    const details: any[] = [];
    let compatibleCount = 0;
    let totalComparisons = 0;

    for (const [prop1, type1] of Object.entries(def1.properties)) {
      for (const [prop2, type2] of Object.entries(def2.properties)) {
        totalComparisons++;
        
        if (this.areTypesCompatible(type1 as any, type2 as any)) {
          compatibleCount++;
          details.push({ prop1, prop2, type1, type2 });
        }
      }
    }

    const score = totalComparisons > 0 ? compatibleCount / totalComparisons : 0;
    return { score, details };
  }

  /**
   * Check if two type definitions are compatible
   */
  private areTypesCompatible(type1: any, type2: any): boolean {
    if (type1.type === type2.type) {
      return true;
    }

    // Check for compatible type pairs
    const compatiblePairs = [
      ['string', 'text'],
      ['integer', 'number'],
      ['int', 'number'],
      ['boolean', 'bool'],
    ];

    const type1Str = (type1.type || '').toLowerCase();
    const type2Str = (type2.type || '').toLowerCase();

    return compatiblePairs.some(([t1, t2]) => 
      (type1Str === t1 && type2Str === t2) ||
      (type1Str === t2 && type2Str === t1)
    );
  }

  /**
   * Algorithm 4: Structural Similarity
   * Analyzes overall structure similarity between schemas
   */
  private structuralSimilarityAlgorithm(schemas: SchemaNode[]): SchemaRelationship[] {
    const relationships: SchemaRelationship[] = [];

    for (let i = 0; i < schemas.length; i++) {
      for (let j = i + 1; j < schemas.length; j++) {
        const schema1 = schemas[i];
        const schema2 = schemas[j];

        const similarity = this.calculateStructuralSimilarity(
          schema1.definition,
          schema2.definition
        );

        if (similarity > 0.5) {
          relationships.push({
            sourceId: schema1.id,
            targetId: schema2.id,
            type: 'structural-similar',
            confidence: similarity,
            metadata: { 
              similarityScore: similarity 
            },
            algorithm: 'structural-similarity'
          });
        }
      }
    }

    return relationships;
  }

  /**
   * Calculate structural similarity using Jaccard index
   */
  private calculateStructuralSimilarity(def1: any, def2: any): number {
    if (!def1 || !def2) return 0;

    const features1 = this.extractStructuralFeatures(def1);
    const features2 = this.extractStructuralFeatures(def2);

    const intersection = features1.filter(f => features2.includes(f)).length;
    const union = new Set([...features1, ...features2]).size;

    return union > 0 ? intersection / union : 0;
  }

  /**
   * Extract structural features from schema
   */
  private extractStructuralFeatures(def: any): string[] {
    const features: string[] = [];

    if (def.type) features.push(`type:${def.type}`);
    if (def.required) {
      def.required.forEach((r: string) => features.push(`required:${r}`));
    }
    if (def.properties) {
      Object.entries(def.properties).forEach(([key, value]: [string, any]) => {
        features.push(`prop:${key}`);
        if (value.type) features.push(`prop:${key}:${value.type}`);
      });
    }

    return features;
  }

  /**
   * Algorithm 5: Semantic Analysis
   * Uses semantic similarity for property names and descriptions
   */
  private semanticAnalysisAlgorithm(schemas: SchemaNode[]): SchemaRelationship[] {
    const relationships: SchemaRelationship[] = [];

    // This would typically use word embeddings or NLP
    // For now, using simple string similarity

    for (let i = 0; i < schemas.length; i++) {
      for (let j = i + 1; j < schemas.length; j++) {
        const schema1 = schemas[i];
        const schema2 = schemas[j];

        const similarity = this.calculateSemanticSimilarity(
          schema1.name,
          schema2.name
        );

        if (similarity > 0.6) {
          relationships.push({
            sourceId: schema1.id,
            targetId: schema2.id,
            type: 'semantic-similar',
            confidence: similarity,
            metadata: { 
              nameSimilarity: similarity 
            },
            algorithm: 'semantic-analysis'
          });
        }
      }
    }

    return relationships;
  }

  /**
   * Calculate semantic similarity using Levenshtein distance
   */
  private calculateSemanticSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(
      str1.toLowerCase(),
      str2.toLowerCase()
    );
    const maxLen = Math.max(str1.length, str2.length);
    return maxLen > 0 ? 1 - (distance / maxLen) : 0;
  }

  /**
   * Levenshtein distance algorithm
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Deduplicate edges keeping highest confidence
   */
  private deduplicateEdges(edges: SchemaRelationship[]): SchemaRelationship[] {
    const edgeMap = new Map<string, SchemaRelationship>();

    for (const edge of edges) {
      const key = `${edge.sourceId}-${edge.targetId}-${edge.type}`;
      const existing = edgeMap.get(key);

      if (!existing || edge.confidence > existing.confidence) {
        edgeMap.set(key, edge);
      }
    }

    return Array.from(edgeMap.values());
  }

  /**
   * Infer transitive relationships
   * If A -> B and B -> C, then A -> C (with reduced confidence)
   */
  private inferTransitiveRelationships(
    edges: SchemaRelationship[]
  ): SchemaRelationship[] {
    const inferred: SchemaRelationship[] = [];
    const edgesBySource = new Map<string, SchemaRelationship[]>();

    // Group edges by source
    for (const edge of edges) {
      if (!edgesBySource.has(edge.sourceId)) {
        edgesBySource.set(edge.sourceId, []);
      }
      edgesBySource.get(edge.sourceId)!.push(edge);
    }

    // Find transitive relationships
    for (const edge1 of edges) {
      const nextEdges = edgesBySource.get(edge1.targetId) || [];
      
      for (const edge2 of nextEdges) {
        // Don't create cycles
        if (edge2.targetId !== edge1.sourceId) {
          inferred.push({
            sourceId: edge1.sourceId,
            targetId: edge2.targetId,
            type: 'transitive',
            confidence: Math.min(edge1.confidence, edge2.confidence) * 0.7,
            metadata: {
              via: edge1.targetId,
              path: [edge1.sourceId, edge1.targetId, edge2.targetId]
            },
            algorithm: 'transitive-inference'
          });
        }
      }
    }

    return inferred;
  }

  /**
   * Export schema graph to various formats
   */
  async exportSchemaGraph(
    graph: SchemaGraph,
    format: 'json' | 'mermaid' | 'graphviz' | 'cytoscape'
  ): Promise<string> {
    switch (format) {
      case 'json':
        return JSON.stringify(graph, null, 2);
      case 'mermaid':
        return this.toMermaid(graph);
      case 'graphviz':
        return this.toGraphviz(graph);
      case 'cytoscape':
        return this.toCytoscape(graph);
      default:
        return JSON.stringify(graph, null, 2);
    }
  }

  /**
   * Convert to Mermaid diagram
   */
  private toMermaid(graph: SchemaGraph): string {
    let mermaid = 'graph TD\n';
    
    // Add nodes with categories
    const categoryColors: any = {
      component: 'fill:#e1f5ff',
      service: 'fill:#fff3e0',
      model: 'fill:#f3e5f5',
      general: 'fill:#e8f5e9'
    };

    for (const node of graph.nodes) {
      const color = categoryColors[node.category] || categoryColors.general;
      mermaid += `  ${node.id}["${node.name}"]:::${node.category}\n`;
    }

    // Add edges
    for (const edge of graph.edges) {
      const confidence = Math.round(edge.confidence * 100);
      mermaid += `  ${edge.sourceId} -->|${edge.type} (${confidence}%)| ${edge.targetId}\n`;
    }

    // Add style classes
    mermaid += '\n';
    for (const [category, color] of Object.entries(categoryColors)) {
      mermaid += `  classDef ${category} ${color}\n`;
    }

    return mermaid;
  }

  /**
   * Convert to Graphviz DOT format
   */
  private toGraphviz(graph: SchemaGraph): string {
    let dot = 'digraph SchemaGraph {\n';
    dot += '  rankdir=LR;\n';
    dot += '  node [shape=box, style=rounded];\n\n';

    // Add nodes
    for (const node of graph.nodes) {
      dot += `  "${node.id}" [label="${node.name}\\n(${node.category})"];\n`;
    }

    dot += '\n';

    // Add edges
    for (const edge of graph.edges) {
      const confidence = Math.round(edge.confidence * 100);
      dot += `  "${edge.sourceId}" -> "${edge.targetId}" [label="${edge.type}\\n${confidence}%"];\n`;
    }

    dot += '}\n';
    return dot;
  }

  /**
   * Convert to Cytoscape JSON format
   */
  private toCytoscape(graph: SchemaGraph): string {
    const cytoscape = {
      elements: {
        nodes: graph.nodes.map(node => ({
          data: {
            id: node.id,
            label: node.name,
            category: node.category,
            properties: node.properties
          }
        })),
        edges: graph.edges.map((edge, index) => ({
          data: {
            id: `e${index}`,
            source: edge.sourceId,
            target: edge.targetId,
            label: edge.type,
            confidence: edge.confidence,
            algorithm: edge.algorithm
          }
        }))
      }
    };

    return JSON.stringify(cytoscape, null, 2);
  }

  /**
   * Save schema map to database
   */
  async saveSchemaMap(graph: SchemaGraph): Promise<void> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // Delete existing relationships (optional)
      // await client.query('DELETE FROM schema_relationships');

      // Insert new relationships
      for (const edge of graph.edges) {
        await client.query(
          `INSERT INTO schema_relationships 
           (source_schema_id, target_schema_id, relationship_type, confidence, metadata, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (source_schema_id, target_schema_id, relationship_type) 
           DO UPDATE SET confidence = $4, metadata = $5, updated_at = NOW()`,
          [
            edge.sourceId,
            edge.targetId,
            edge.type,
            edge.confidence,
            edge.metadata
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
}

export default SchemaRelationshipMapper;
