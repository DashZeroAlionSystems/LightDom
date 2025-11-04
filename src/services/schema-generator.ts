/**
 * Self-Organizing Schema Generator
 * Uses DeepSeek API to automatically generate and link schemas with relationships
 */

import axios from 'axios';
import { DeepSeekSystemConfig, DeepSeekConfigLoader } from '../config/deepseek-config.js';
import { DeepSeekPromptEngine } from './deepseek-prompt-engine.js';

export interface SchemaRelationship {
  sourceSchema: string;
  targetSchema: string;
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-many' | 'embedded' | 'reference';
  sourceField: string;
  targetField: string;
  description?: string;
}

export interface GeneratedSchema {
  id: string;
  name: string;
  version: string;
  description: string;
  type: 'json-schema' | 'graphql' | 'database' | 'component';
  schema: any;
  relationships: SchemaRelationship[];
  metadata: {
    generatedAt: Date;
    generatedBy: 'deepseek' | 'manual';
    prompt?: string;
    confidence?: number;
  };
  validation?: {
    rules: any[];
    customValidators?: string[];
  };
}

export interface SchemaGenerationRequest {
  description: string;
  context?: {
    existingSchemas?: GeneratedSchema[];
    domain?: string;
    purpose?: string;
  };
  options?: {
    includeValidation?: boolean;
    generateRelationships?: boolean;
    schemaType?: GeneratedSchema['type'];
  };
}

export interface SchemaMap {
  id: string;
  name: string;
  description: string;
  schemas: GeneratedSchema[];
  relationships: SchemaRelationship[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
  };
}

/**
 * Schema Generator Service
 */
export class SchemaGeneratorService {
  private config: DeepSeekSystemConfig;
  private promptEngine: DeepSeekPromptEngine;
  private generatedSchemas: Map<string, GeneratedSchema> = new Map();
  private schemaMaps: Map<string, SchemaMap> = new Map();

  constructor(configLoader?: DeepSeekConfigLoader) {
    this.config = configLoader?.getConfig() || new DeepSeekConfigLoader().getConfig();
    this.promptEngine = new DeepSeekPromptEngine(this.config);
  }

  /**
   * Generate schema from natural language description using DeepSeek
   */
  async generateSchema(request: SchemaGenerationRequest): Promise<GeneratedSchema> {
    // Build context with existing schemas
    const existingSchemasText = request.context?.existingSchemas
      ?.map((s) => `${s.name}: ${s.description}`)
      .join('\n') || 'None';

    // Generate prompt
    const prompt = this.promptEngine.generatePrompt('schema-generation', {
      userDescription: request.description,
      existingSchemas: existingSchemasText,
      namingConvention: this.config.naming.variableNamingStyle,
    });

    try {
      // Call DeepSeek API
      const response = await this.callDeepSeekAPI(prompt);
      
      // Parse the response
      const generatedContent = this.parseDeepSeekResponse(response);
      
      // Create schema object
      const schema: GeneratedSchema = {
        id: this.generateSchemaId(request.description),
        name: this.generateSchemaName(request.description),
        version: '1.0.0',
        description: request.description,
        type: request.options?.schemaType || 'json-schema',
        schema: generatedContent.schema,
        relationships: generatedContent.relationships || [],
        metadata: {
          generatedAt: new Date(),
          generatedBy: 'deepseek',
          prompt: prompt,
          confidence: generatedContent.confidence || 0.85,
        },
      };

      // Add validation if requested
      if (request.options?.includeValidation) {
        schema.validation = this.generateValidationRules(schema);
      }

      // Auto-detect relationships if requested
      if (request.options?.generateRelationships && request.context?.existingSchemas) {
        schema.relationships = await this.detectRelationships(
          schema,
          request.context.existingSchemas
        );
      }

      // Store schema
      this.generatedSchemas.set(schema.id, schema);

      return schema;
    } catch (error) {
      console.error('Schema generation failed:', error);
      throw new Error(`Failed to generate schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a complete schema map with multiple related schemas
   */
  async generateSchemaMap(
    description: string,
    options?: {
      maxSchemas?: number;
      domain?: string;
    }
  ): Promise<SchemaMap> {
    const schemas: GeneratedSchema[] = [];
    const allRelationships: SchemaRelationship[] = [];

    // Use DeepSeek to identify entities in the description
    const entities = await this.identifyEntities(description);

    // Generate schema for each entity
    for (const entity of entities.slice(0, options?.maxSchemas || 10)) {
      const schema = await this.generateSchema({
        description: `Generate schema for ${entity.name}: ${entity.description}`,
        context: {
          existingSchemas: schemas,
          domain: options?.domain,
        },
        options: {
          includeValidation: true,
          generateRelationships: true,
        },
      });

      schemas.push(schema);
      allRelationships.push(...schema.relationships);
    }

    // Create schema map
    const schemaMap: SchemaMap = {
      id: this.generateSchemaMapId(description),
      name: `Schema Map: ${description.substring(0, 50)}`,
      description,
      schemas,
      relationships: this.deduplicateRelationships(allRelationships),
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
      },
    };

    // Store schema map
    this.schemaMaps.set(schemaMap.id, schemaMap);

    return schemaMap;
  }

  /**
   * Detect relationships between a schema and existing schemas using DeepSeek
   */
  private async detectRelationships(
    schema: GeneratedSchema,
    existingSchemas: GeneratedSchema[]
  ): Promise<SchemaRelationship[]> {
    const relationships: SchemaRelationship[] = [];

    // Use simple heuristics first
    for (const existing of existingSchemas) {
      const schemaFields = this.extractFields(schema.schema);
      const existingFields = this.extractFields(existing.schema);

      // Look for foreign key patterns
      for (const field of schemaFields) {
        if (field.name.includes('Id') || field.name.includes('_id')) {
          const baseName = field.name.replace(/Id$|_id$/, '');
          if (existing.name.toLowerCase().includes(baseName.toLowerCase())) {
            relationships.push({
              sourceSchema: schema.id,
              targetSchema: existing.id,
              relationshipType: 'many-to-one',
              sourceField: field.name,
              targetField: 'id',
              description: `${schema.name} references ${existing.name}`,
            });
          }
        }
      }
    }

    return relationships;
  }

  /**
   * Identify entities from a description using DeepSeek
   */
  private async identifyEntities(
    description: string
  ): Promise<Array<{ name: string; description: string }>> {
    const prompt = `Analyze this description and identify distinct entities/schemas needed:

DESCRIPTION:
${description}

TASK:
List all entities that need schemas. For each entity provide:
1. Entity name (singular, PascalCase)
2. Brief description

OUTPUT FORMAT (JSON):
{
  "entities": [
    {"name": "EntityName", "description": "Entity description"},
    ...
  ]
}`;

    try {
      const response = await this.callDeepSeekAPI(prompt);
      const parsed = this.parseDeepSeekResponse(response);
      return parsed.entities || [];
    } catch (error) {
      console.warn('Failed to identify entities, using fallback');
      // Fallback: extract nouns from description
      return this.extractEntitiesFromText(description);
    }
  }

  /**
   * Call DeepSeek API with improved error handling
   */
  private async callDeepSeekAPI(prompt: string): Promise<any> {
    const { api } = this.config;

    if (!api.apiKey) {
      throw new Error('DeepSeek API key not configured. Set DEEPSEEK_API_KEY environment variable.');
    }

    try {
      const response = await axios.post(
        `${api.apiUrl}/chat/completions`,
        {
          model: api.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: api.defaultTemperature,
          max_tokens: api.defaultMaxTokens,
          stream: api.streamEnabled,
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            'Authorization': `Bearer ${api.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: api.timeout,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // HTTP error response from API
          const status = error.response.status;
          const message = error.response.data?.error?.message || 'Unknown API error';
          
          if (status === 401) {
            throw new Error('Invalid DeepSeek API key. Please check your credentials.');
          } else if (status === 429) {
            throw new Error('DeepSeek API rate limit exceeded. Please try again later.');
          } else if (status >= 500) {
            throw new Error(`DeepSeek API server error (${status}): ${message}`);
          } else {
            throw new Error(`DeepSeek API error (${status}): ${message}`);
          }
        } else if (error.request) {
          // Network error - no response received
          throw new Error('Network error: Unable to reach DeepSeek API. Check your internet connection.');
        } else {
          // Request setup error
          throw new Error(`Request error: ${error.message}`);
        }
      }
      
      // Re-throw non-Axios errors
      throw error;
    }
  }

  /**
   * Parse DeepSeek response
   */
  private parseDeepSeekResponse(response: any): any {
    try {
      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to parse DeepSeek response:', error);
      throw new Error('Invalid response from DeepSeek API');
    }
  }

  /**
   * Generate validation rules for a schema
   */
  private generateValidationRules(schema: GeneratedSchema): any {
    // Extract fields and generate validation rules
    const fields = this.extractFields(schema.schema);
    const rules = fields.map((field) => ({
      field: field.name,
      type: field.type,
      required: field.required || false,
      validators: this.getValidatorsForType(field.type),
    }));

    return { rules };
  }

  /**
   * Get validators for a field type
   */
  private getValidatorsForType(type: string): string[] {
    const validators: Record<string, string[]> = {
      string: ['minLength', 'maxLength', 'pattern'],
      number: ['min', 'max', 'integer'],
      email: ['email', 'format'],
      url: ['url', 'format'],
      date: ['dateFormat'],
      boolean: [],
    };

    return validators[type] || [];
  }

  /**
   * Extract fields from schema
   */
  private extractFields(schema: any): Array<{ name: string; type: string; required?: boolean }> {
    if (!schema.properties) return [];

    return Object.entries(schema.properties).map(([name, prop]: [string, any]) => ({
      name,
      type: prop.type || 'string',
      required: schema.required?.includes(name),
    }));
  }

  /**
   * Fallback entity extraction from text
   */
  private extractEntitiesFromText(text: string): Array<{ name: string; description: string }> {
    // Simple noun extraction (this is a basic fallback)
    const words = text.split(/\s+/);
    const entities = new Set<string>();

    // Look for capitalized words (basic entity detection)
    words.forEach((word) => {
      if (word.length > 3 && /^[A-Z]/.test(word)) {
        entities.add(word);
      }
    });

    return Array.from(entities).map((name) => ({
      name,
      description: `Entity: ${name}`,
    }));
  }

  /**
   * Deduplicate relationships
   */
  private deduplicateRelationships(relationships: SchemaRelationship[]): SchemaRelationship[] {
    const seen = new Set<string>();
    return relationships.filter((rel) => {
      const key = `${rel.sourceSchema}-${rel.targetSchema}-${rel.sourceField}-${rel.targetField}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Generate schema ID
   */
  private generateSchemaId(description: string): string {
    const timestamp = Date.now();
    const hash = description.substring(0, 20).replace(/\s+/g, '-').toLowerCase();
    return `schema-${hash}-${timestamp}`;
  }

  /**
   * Generate schema name
   */
  private generateSchemaName(description: string): string {
    // Extract first few meaningful words
    const words = description.split(/\s+/).slice(0, 3);
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  }

  /**
   * Generate schema map ID
   */
  private generateSchemaMapId(description: string): string {
    const timestamp = Date.now();
    const hash = description.substring(0, 15).replace(/\s+/g, '-').toLowerCase();
    return `schemamap-${hash}-${timestamp}`;
  }

  /**
   * Get schema by ID
   */
  getSchema(schemaId: string): GeneratedSchema | undefined {
    return this.generatedSchemas.get(schemaId);
  }

  /**
   * Get schema map by ID
   */
  getSchemaMap(mapId: string): SchemaMap | undefined {
    return this.schemaMaps.get(mapId);
  }

  /**
   * List all schemas
   */
  listSchemas(): GeneratedSchema[] {
    return Array.from(this.generatedSchemas.values());
  }

  /**
   * List all schema maps
   */
  listSchemaMaps(): SchemaMap[] {
    return Array.from(this.schemaMaps.values());
  }
}

export default SchemaGeneratorService;
