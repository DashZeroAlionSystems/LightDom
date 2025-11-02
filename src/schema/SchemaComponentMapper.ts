/**
 * Schema Component Mapper
 * Maps schema.org types and use cases to React components
 * Uses linked schemas to determine appropriate component selection
 */

import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import { Logger } from '../utils/Logger';

export interface ComponentSchema {
  '@context': string;
  '@type': string;
  '@id': string;
  name: string;
  description: string;
  
  // LightDom extensions
  'lightdom:componentType': 'atom' | 'molecule' | 'organism' | 'template' | 'page';
  'lightdom:reactComponent': string;
  'lightdom:props': PropDefinition[];
  'lightdom:linkedSchemas': string[];
  'lightdom:useCase': string[];
  'lightdom:semanticMeaning': string;
  'lightdom:priority': number;
  'lightdom:category': string;
}

export interface PropDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  required: boolean;
  default?: any;
  description?: string;
  validation?: string;
}

export interface UseCasePattern {
  keywords: string[];
  intent: string;
  schemaTypes: string[];
  confidence: number;
}

export interface ComponentMatch {
  schema: ComponentSchema;
  score: number;
  reasons: string[];
}

export class SchemaComponentMapper extends EventEmitter {
  private schemas: Map<string, ComponentSchema> = new Map();
  private useCasePatterns: Map<string, UseCasePattern> = new Map();
  private schemaDir: string;
  private logger: Logger;

  constructor(schemaDir?: string) {
    super();
    this.schemaDir = schemaDir || path.join(process.cwd(), 'schemas', 'components');
    this.logger = new Logger('SchemaComponentMapper');
  }

  /**
   * Initialize the mapper by loading schemas
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Schema Component Mapper...');

    // Load component schemas
    await this.loadSchemas();

    // Load use case patterns
    this.loadUseCasePatterns();

    this.logger.info('Schema Component Mapper initialized', {
      schemasLoaded: this.schemas.size,
      patternsLoaded: this.useCasePatterns.size,
    });
  }

  /**
   * Load component schemas from directory
   */
  private async loadSchemas(): Promise<void> {
    try {
      // Create schema directory if it doesn't exist
      if (!fs.existsSync(this.schemaDir)) {
        fs.mkdirSync(this.schemaDir, { recursive: true });
        this.logger.info('Created schema directory', { dir: this.schemaDir });
        
        // Create default schemas
        await this.createDefaultSchemas();
      }

      // Read all JSON files from schema directory
      const files = fs.readdirSync(this.schemaDir)
        .filter(file => file.endsWith('.json'));

      for (const file of files) {
        try {
          const filePath = path.join(this.schemaDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const schema = JSON.parse(content) as ComponentSchema;

          this.schemas.set(schema['@id'], schema);
          this.logger.debug('Loaded schema', { id: schema['@id'], name: schema.name });
        } catch (error) {
          this.logger.error('Failed to load schema file', { file, error });
        }
      }
    } catch (error) {
      this.logger.error('Failed to load schemas', { error });
    }
  }

  /**
   * Create default component schemas
   */
  private async createDefaultSchemas(): Promise<void> {
    const defaultSchemas: ComponentSchema[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': 'lightdom:dashboard-page',
        name: 'Dashboard Page',
        description: 'Full dashboard page with analytics and metrics',
        'lightdom:componentType': 'page',
        'lightdom:reactComponent': 'DashboardPage',
        'lightdom:props': [
          { name: 'title', type: 'string', required: true, description: 'Page title' },
          { name: 'widgets', type: 'array', required: false, description: 'Dashboard widgets' },
        ],
        'lightdom:linkedSchemas': ['lightdom:chart-component', 'lightdom:data-table-component'],
        'lightdom:useCase': ['analytics', 'dashboard', 'metrics', 'monitoring'],
        'lightdom:semanticMeaning': 'Displays aggregate data and visualizations',
        'lightdom:priority': 8,
        'lightdom:category': 'page',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': 'lightdom:article-component',
        name: 'Article Component',
        description: 'Article display with header, content, and metadata',
        'lightdom:componentType': 'organism',
        'lightdom:reactComponent': 'Article',
        'lightdom:props': [
          { name: 'title', type: 'string', required: true },
          { name: 'content', type: 'string', required: true },
          { name: 'author', type: 'object', required: false },
          { name: 'publishedDate', type: 'string', required: false },
        ],
        'lightdom:linkedSchemas': ['lightdom:author-component', 'lightdom:content-component'],
        'lightdom:useCase': ['blog', 'article', 'content', 'post'],
        'lightdom:semanticMeaning': 'Displays long-form content with metadata',
        'lightdom:priority': 7,
        'lightdom:category': 'organism',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': 'lightdom:product-card',
        name: 'Product Card',
        description: 'Product display card with image, name, price',
        'lightdom:componentType': 'molecule',
        'lightdom:reactComponent': 'ProductCard',
        'lightdom:props': [
          { name: 'name', type: 'string', required: true },
          { name: 'price', type: 'number', required: true },
          { name: 'image', type: 'string', required: false },
          { name: 'description', type: 'string', required: false },
        ],
        'lightdom:linkedSchemas': ['lightdom:image-component', 'lightdom:price-component'],
        'lightdom:useCase': ['product', 'ecommerce', 'shop', 'item'],
        'lightdom:semanticMeaning': 'Displays product information for purchase',
        'lightdom:priority': 6,
        'lightdom:category': 'molecule',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': 'lightdom:data-table-component',
        name: 'Data Table',
        description: 'Sortable, filterable data table',
        'lightdom:componentType': 'organism',
        'lightdom:reactComponent': 'DataTable',
        'lightdom:props': [
          { name: 'data', type: 'array', required: true },
          { name: 'columns', type: 'array', required: true },
          { name: 'sortable', type: 'boolean', required: false, default: true },
          { name: 'filterable', type: 'boolean', required: false, default: true },
        ],
        'lightdom:linkedSchemas': ['lightdom:table-row-component', 'lightdom:filter-component'],
        'lightdom:useCase': ['table', 'data', 'list', 'grid'],
        'lightdom:semanticMeaning': 'Displays structured data in tabular format',
        'lightdom:priority': 7,
        'lightdom:category': 'organism',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Chart',
        '@id': 'lightdom:chart-component',
        name: 'Chart Component',
        description: 'Data visualization chart (line, bar, pie, etc.)',
        'lightdom:componentType': 'organism',
        'lightdom:reactComponent': 'Chart',
        'lightdom:props': [
          { name: 'type', type: 'string', required: true },
          { name: 'data', type: 'object', required: true },
          { name: 'options', type: 'object', required: false },
        ],
        'lightdom:linkedSchemas': [],
        'lightdom:useCase': ['chart', 'graph', 'visualization', 'analytics'],
        'lightdom:semanticMeaning': 'Visualizes data in graphical format',
        'lightdom:priority': 8,
        'lightdom:category': 'organism',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Button',
        '@id': 'lightdom:button-atom',
        name: 'Button',
        description: 'Basic button component',
        'lightdom:componentType': 'atom',
        'lightdom:reactComponent': 'Button',
        'lightdom:props': [
          { name: 'label', type: 'string', required: true },
          { name: 'onClick', type: 'function', required: true },
          { name: 'variant', type: 'string', required: false, default: 'primary' },
          { name: 'disabled', type: 'boolean', required: false, default: false },
        ],
        'lightdom:linkedSchemas': [],
        'lightdom:useCase': ['button', 'action', 'submit', 'click'],
        'lightdom:semanticMeaning': 'Triggers an action when clicked',
        'lightdom:priority': 5,
        'lightdom:category': 'atom',
      },
    ];

    for (const schema of defaultSchemas) {
      const filePath = path.join(this.schemaDir, `${schema['@id'].replace('lightdom:', '')}.json`);
      fs.writeFileSync(filePath, JSON.stringify(schema, null, 2));
      this.logger.debug('Created default schema', { id: schema['@id'] });
    }
  }

  /**
   * Load use case patterns for matching
   */
  private loadUseCasePatterns(): void {
    this.useCasePatterns.set('analytics-dashboard', {
      keywords: ['analytics', 'dashboard', 'metrics', 'stats', 'kpi', 'charts'],
      intent: 'display-aggregate-data',
      schemaTypes: ['WebPage', 'Chart', 'ItemList'],
      confidence: 0.9,
    });

    this.useCasePatterns.set('content-display', {
      keywords: ['article', 'blog', 'post', 'content', 'text', 'read'],
      intent: 'display-content',
      schemaTypes: ['Article', 'BlogPosting', 'NewsArticle'],
      confidence: 0.85,
    });

    this.useCasePatterns.set('ecommerce-product', {
      keywords: ['product', 'shop', 'buy', 'ecommerce', 'item', 'purchase'],
      intent: 'display-product',
      schemaTypes: ['Product', 'Offer'],
      confidence: 0.88,
    });

    this.useCasePatterns.set('data-listing', {
      keywords: ['list', 'table', 'grid', 'data', 'rows', 'records'],
      intent: 'display-structured-data',
      schemaTypes: ['ItemList', 'Table'],
      confidence: 0.82,
    });

    this.useCasePatterns.set('visualization', {
      keywords: ['chart', 'graph', 'visualization', 'plot', 'diagram'],
      intent: 'visualize-data',
      schemaTypes: ['Chart', 'Graph'],
      confidence: 0.86,
    });
  }

  /**
   * Select component based on use case description
   */
  async selectComponent(useCase: string, context?: any): Promise<ComponentMatch | null> {
    this.logger.debug('Selecting component for use case', { useCase });

    // Analyze use case
    const patterns = this.analyzeUseCase(useCase);

    // Match with schema types
    const candidates = this.matchSchemaTypes(patterns);

    // Score and rank candidates
    const matches = this.scoreComponents(candidates, useCase, context);

    if (matches.length === 0) {
      this.logger.warn('No component match found', { useCase });
      return null;
    }

    const bestMatch = matches[0];
    this.logger.info('Selected component', {
      useCase,
      component: bestMatch.schema.name,
      score: bestMatch.score,
    });

    return bestMatch;
  }

  /**
   * Analyze use case to extract patterns
   */
  private analyzeUseCase(useCase: string): UseCasePattern[] {
    const lowerUseCase = useCase.toLowerCase();
    const matchedPatterns: UseCasePattern[] = [];

    for (const [name, pattern] of this.useCasePatterns.entries()) {
      // Count keyword matches
      const matches = pattern.keywords.filter(keyword => 
        lowerUseCase.includes(keyword)
      ).length;

      if (matches > 0) {
        // Calculate confidence based on keyword matches
        const confidence = pattern.confidence * (matches / pattern.keywords.length);
        matchedPatterns.push({
          ...pattern,
          confidence,
        });
      }
    }

    // Sort by confidence
    matchedPatterns.sort((a, b) => b.confidence - a.confidence);

    return matchedPatterns;
  }

  /**
   * Match patterns to schema types
   */
  private matchSchemaTypes(patterns: UseCasePattern[]): ComponentSchema[] {
    const schemaTypes = new Set<string>();

    // Collect all schema types from patterns
    patterns.forEach(pattern => {
      pattern.schemaTypes.forEach(type => schemaTypes.add(type));
    });

    // Find matching schemas
    const candidates: ComponentSchema[] = [];

    for (const schema of this.schemas.values()) {
      if (schemaTypes.has(schema['@type'])) {
        candidates.push(schema);
      }
    }

    return candidates;
  }

  /**
   * Score components based on use case and context
   */
  private scoreComponents(
    candidates: ComponentSchema[],
    useCase: string,
    context?: any
  ): ComponentMatch[] {
    const lowerUseCase = useCase.toLowerCase();
    const matches: ComponentMatch[] = [];

    for (const schema of candidates) {
      let score = 0;
      const reasons: string[] = [];

      // Score based on use case keyword matches
      const useCaseMatches = schema['lightdom:useCase'].filter(kw =>
        lowerUseCase.includes(kw.toLowerCase())
      ).length;

      if (useCaseMatches > 0) {
        score += useCaseMatches * 20;
        reasons.push(`Matched ${useCaseMatches} use case keywords`);
      }

      // Score based on priority
      score += schema['lightdom:priority'] * 5;
      reasons.push(`Priority score: ${schema['lightdom:priority']}`);

      // Score based on semantic meaning similarity
      const semanticMatch = this.calculateSemanticSimilarity(
        useCase,
        schema['lightdom:semanticMeaning']
      );
      score += semanticMatch * 10;
      
      if (semanticMatch > 0) {
        reasons.push(`Semantic similarity: ${semanticMatch.toFixed(2)}`);
      }

      // Context-based scoring
      if (context) {
        if (context.category && context.category === schema['lightdom:category']) {
          score += 15;
          reasons.push('Category match');
        }

        if (context.requiredProps) {
          const hasRequired = context.requiredProps.every((prop: string) =>
            schema['lightdom:props'].some(p => p.name === prop)
          );
          
          if (hasRequired) {
            score += 20;
            reasons.push('Has all required props');
          }
        }
      }

      // Linked schema bonus
      if (schema['lightdom:linkedSchemas'].length > 0) {
        score += schema['lightdom:linkedSchemas'].length * 3;
        reasons.push(`Has ${schema['lightdom:linkedSchemas'].length} linked schemas`);
      }

      matches.push({ schema, score, reasons });
    }

    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);

    return matches;
  }

  /**
   * Calculate semantic similarity between two texts
   * Simple implementation using word overlap
   */
  private calculateSemanticSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Get all components of a specific type
   */
  getComponentsByType(componentType: ComponentSchema['lightdom:componentType']): ComponentSchema[] {
    return Array.from(this.schemas.values())
      .filter(schema => schema['lightdom:componentType'] === componentType);
  }

  /**
   * Get all components in a category
   */
  getComponentsByCategory(category: string): ComponentSchema[] {
    return Array.from(this.schemas.values())
      .filter(schema => schema['lightdom:category'] === category);
  }

  /**
   * Get component by ID
   */
  getComponentById(id: string): ComponentSchema | undefined {
    return this.schemas.get(id);
  }

  /**
   * Add or update a component schema
   */
  async saveSchema(schema: ComponentSchema): Promise<void> {
    this.schemas.set(schema['@id'], schema);

    const filePath = path.join(
      this.schemaDir,
      `${schema['@id'].replace('lightdom:', '')}.json`
    );

    fs.writeFileSync(filePath, JSON.stringify(schema, null, 2));

    this.logger.info('Schema saved', { id: schema['@id'] });
    this.emit('schemaUpdated', schema);
  }

  /**
   * Get all schemas
   */
  getAllSchemas(): ComponentSchema[] {
    return Array.from(this.schemas.values());
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSchemas: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  } {
    const schemas = Array.from(this.schemas.values());

    const byType: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    schemas.forEach(schema => {
      byType[schema['lightdom:componentType']] = 
        (byType[schema['lightdom:componentType']] || 0) + 1;
      
      byCategory[schema['lightdom:category']] = 
        (byCategory[schema['lightdom:category']] || 0) + 1;
    });

    return {
      totalSchemas: schemas.length,
      byType,
      byCategory,
    };
  }
}

export default SchemaComponentMapper;
