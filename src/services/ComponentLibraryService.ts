/**
 * ComponentLibraryService
 * 
 * Manages component schemas in the schema library
 * Loads atomic component definitions and stores them in the database
 * 
 * @module ComponentLibraryService
 */

import { getDatabaseService } from '../DatabaseService.js';
import { LdSchema } from './ValidationService.js';

export interface ComponentSchema {
  schemaId: string;
  schemaType: string;
  version: string;
  title: string;
  description?: string;
  schema: LdSchema;
  examples?: any[];
  dependencies?: string[];
  tags?: string[];
  category?: string;
  isAtomic?: boolean;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export class ComponentLibraryService {
  private dbService: ReturnType<typeof getDatabaseService>;

  constructor() {
    this.dbService = getDatabaseService();
  }

  /**
   * Add a component schema to the library
   */
  async addSchema(component: ComponentSchema): Promise<void> {
    await this.dbService.query(
      `INSERT INTO schema_library 
       (schema_id, schema_type, version, title, description, schema, examples, dependencies, tags, category, is_atomic, is_public, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (schema_id) DO UPDATE SET
         schema_type = EXCLUDED.schema_type,
         version = EXCLUDED.version,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         schema = EXCLUDED.schema,
         examples = EXCLUDED.examples,
         dependencies = EXCLUDED.dependencies,
         tags = EXCLUDED.tags,
         category = EXCLUDED.category,
         is_atomic = EXCLUDED.is_atomic,
         is_public = EXCLUDED.is_public,
         metadata = EXCLUDED.metadata,
         updated_at = CURRENT_TIMESTAMP`,
      [
        component.schemaId,
        component.schemaType,
        component.version,
        component.title,
        component.description || null,
        JSON.stringify(component.schema),
        JSON.stringify(component.examples || []),
        component.dependencies || [],
        component.tags || [],
        component.category || null,
        component.isAtomic || false,
        component.isPublic !== undefined ? component.isPublic : true,
        JSON.stringify(component.metadata || {}),
      ]
    );
  }

  /**
   * Get a component schema by ID
   */
  async getSchema(schemaId: string): Promise<ComponentSchema | null> {
    const result = await this.dbService.query<any>(
      `SELECT * FROM schema_library WHERE schema_id = $1`,
      [schemaId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return this.mapRowToComponent(row);
  }

  /**
   * Get all schemas by type
   */
  async getSchemasByType(schemaType: string): Promise<ComponentSchema[]> {
    const result = await this.dbService.query<any>(
      `SELECT * FROM schema_library WHERE schema_type = $1 AND is_public = true ORDER BY title`,
      [schemaType]
    );

    return result.rows.map(this.mapRowToComponent);
  }

  /**
   * Get all atomic component schemas
   */
  async getAtomicComponents(): Promise<ComponentSchema[]> {
    const result = await this.dbService.query<any>(
      `SELECT * FROM schema_library WHERE is_atomic = true AND is_public = true ORDER BY title`
    );

    return result.rows.map(this.mapRowToComponent);
  }

  /**
   * Get schemas by category
   */
  async getSchemasByCategory(category: string): Promise<ComponentSchema[]> {
    const result = await this.dbService.query<any>(
      `SELECT * FROM schema_library WHERE category = $1 AND is_public = true ORDER BY title`,
      [category]
    );

    return result.rows.map(this.mapRowToComponent);
  }

  /**
   * Search schemas by tag
   */
  async searchByTag(tag: string): Promise<ComponentSchema[]> {
    const result = await this.dbService.query<any>(
      `SELECT * FROM schema_library 
       WHERE $1 = ANY(tags) AND is_public = true 
       ORDER BY title`,
      [tag]
    );

    return result.rows.map(this.mapRowToComponent);
  }

  /**
   * Load default atomic components
   */
  async loadDefaultComponents(): Promise<void> {
    console.log('📦 Loading default atomic components...');

    const defaultComponents: ComponentSchema[] = [
      {
        schemaId: 'ld:AtomicButton',
        schemaType: 'component',
        version: '1.0.0',
        title: 'Atomic Button',
        description: 'A basic button component',
        category: 'ui',
        isAtomic: true,
        tags: ['button', 'ui', 'atomic'],
        schema: {
          $id: 'ld:AtomicButton',
          type: 'object',
          title: 'Atomic Button Schema',
          properties: {
            label: { type: 'string', description: 'Button text' },
            variant: {
              type: 'string',
              enum: ['primary', 'secondary', 'danger'],
              description: 'Button style variant',
            },
            disabled: { type: 'boolean', default: false },
            onClick: { type: 'string', description: 'Click handler function name' },
          },
          required: ['label'],
        },
        examples: [
          {
            label: 'Click Me',
            variant: 'primary',
            disabled: false,
          },
        ],
      },
      {
        schemaId: 'ld:AtomicInput',
        schemaType: 'component',
        version: '1.0.0',
        title: 'Atomic Input',
        description: 'A basic text input component',
        category: 'ui',
        isAtomic: true,
        tags: ['input', 'form', 'ui', 'atomic'],
        schema: {
          $id: 'ld:AtomicInput',
          type: 'object',
          title: 'Atomic Input Schema',
          properties: {
            name: { type: 'string', description: 'Input field name' },
            placeholder: { type: 'string', description: 'Placeholder text' },
            type: {
              type: 'string',
              enum: ['text', 'email', 'password', 'number'],
              default: 'text',
            },
            required: { type: 'boolean', default: false },
            disabled: { type: 'boolean', default: false },
          },
          required: ['name'],
        },
        examples: [
          {
            name: 'username',
            placeholder: 'Enter your username',
            type: 'text',
            required: true,
          },
        ],
      },
      {
        schemaId: 'ld:AtomicCard',
        schemaType: 'component',
        version: '1.0.0',
        title: 'Atomic Card',
        description: 'A basic card container component',
        category: 'layout',
        isAtomic: true,
        tags: ['card', 'container', 'layout', 'atomic'],
        schema: {
          $id: 'ld:AtomicCard',
          type: 'object',
          title: 'Atomic Card Schema',
          properties: {
            title: { type: 'string', description: 'Card title' },
            content: { type: 'string', description: 'Card content' },
            footer: { type: 'string', description: 'Card footer text' },
            bordered: { type: 'boolean', default: true },
          },
        },
        examples: [
          {
            title: 'Welcome',
            content: 'This is a card component',
            bordered: true,
          },
        ],
      },
    ];

    for (const component of defaultComponents) {
      try {
        await this.addSchema(component);
        console.log(`  ✅ Loaded component: ${component.title}`);
      } catch (error) {
        console.error(`  ❌ Failed to load component ${component.schemaId}:`, error);
      }
    }

    console.log('✨ Default components loaded successfully');
  }

  /**
   * Map database row to ComponentSchema
   */
  private mapRowToComponent(row: any): ComponentSchema {
    return {
      schemaId: row.schema_id,
      schemaType: row.schema_type,
      version: row.version,
      title: row.title,
      description: row.description,
      schema: row.schema,
      examples: row.examples,
      dependencies: row.dependencies,
      tags: row.tags,
      category: row.category,
      isAtomic: row.is_atomic,
      isPublic: row.is_public,
      metadata: row.metadata,
    };
  }
}

// Singleton instance
export const componentLibraryService = new ComponentLibraryService();

export default ComponentLibraryService;
