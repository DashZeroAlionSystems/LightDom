/**
 * Schema and Knowledge Graph Generator
 * 
 * Generates CRUD API schemas, knowledge graphs for schema relationships,
 * and auto-generates service files and API routes from schema definitions
 */

interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array' | 'reference';
  required?: boolean;
  unique?: boolean;
  default?: unknown;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };
  reference?: {
    model: string;
    field: string;
  };
}

interface SchemaDefinition {
  name: string;
  tableName?: string;
  description?: string;
  fields: SchemaField[];
  indexes?: string[][];
  relationships?: {
    hasMany?: string[];
    belongsTo?: string[];
    manyToMany?: {
      model: string;
      through: string;
    }[];
  };
  timestamps?: boolean;
  softDelete?: boolean;
}

interface KnowledgeGraphNode {
  id: string;
  type: 'schema' | 'field' | 'relationship';
  label: string;
  properties: Record<string, unknown>;
}

interface KnowledgeGraphEdge {
  from: string;
  to: string;
  type: 'has_field' | 'references' | 'has_many' | 'belongs_to' | 'many_to_many';
  label: string;
  properties?: Record<string, unknown>;
}

interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  metadata: {
    totalSchemas: number;
    totalFields: number;
    totalRelationships: number;
    generatedAt: Date;
  };
}

export class SchemaKnowledgeGraphGenerator {
  private schemas: Map<string, SchemaDefinition>;
  private knowledgeGraph: KnowledgeGraph;

  constructor() {
    this.schemas = new Map();
    this.knowledgeGraph = {
      nodes: [],
      edges: [],
      metadata: {
        totalSchemas: 0,
        totalFields: 0,
        totalRelationships: 0,
        generatedAt: new Date(),
      },
    };
  }

  /**
   * Add a schema definition
   */
  addSchema(schema: SchemaDefinition): void {
    this.schemas.set(schema.name, schema);
    this.updateKnowledgeGraph();
  }

  /**
   * Generate CRUD API schema from definition
   */
  generateCRUDSchema(schemaName: string): Record<string, unknown> {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new Error(`Schema ${schemaName} not found`);
    }

    return {
      name: schema.name,
      endpoints: {
        list: {
          method: 'GET',
          path: `/${schema.tableName || schema.name.toLowerCase()}`,
          description: `List all ${schema.name}`,
          queryParams: ['page', 'limit', 'sort', 'filter'],
          response: {
            type: 'array',
            items: this.generateTypeDefinition(schema),
          },
        },
        get: {
          method: 'GET',
          path: `/${schema.tableName || schema.name.toLowerCase()}/:id`,
          description: `Get ${schema.name} by ID`,
          params: ['id'],
          response: this.generateTypeDefinition(schema),
        },
        create: {
          method: 'POST',
          path: `/${schema.tableName || schema.name.toLowerCase()}`,
          description: `Create new ${schema.name}`,
          body: this.generateCreateSchema(schema),
          response: this.generateTypeDefinition(schema),
        },
        update: {
          method: 'PUT',
          path: `/${schema.tableName || schema.name.toLowerCase()}/:id`,
          description: `Update ${schema.name} by ID`,
          params: ['id'],
          body: this.generateUpdateSchema(schema),
          response: this.generateTypeDefinition(schema),
        },
        delete: {
          method: 'DELETE',
          path: `/${schema.tableName || schema.name.toLowerCase()}/:id`,
          description: `Delete ${schema.name} by ID`,
          params: ['id'],
          response: { success: 'boolean', message: 'string' },
        },
      },
    };
  }

  /**
   * Generate TypeScript interface from schema
   */
  generateTypeScriptInterface(schemaName: string): string {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new Error(`Schema ${schemaName} not found`);
    }

    let code = `export interface ${schema.name} {\n`;

    schema.fields.forEach((field) => {
      const optional = !field.required ? '?' : '';
      const type = this.mapTypeToTypeScript(field.type);
      code += `  ${field.name}${optional}: ${type};\n`;
    });

    if (schema.timestamps) {
      code += '  createdAt?: Date;\n';
      code += '  updatedAt?: Date;\n';
    }

    if (schema.softDelete) {
      code += '  deletedAt?: Date | null;\n';
    }

    code += '}\n';

    return code;
  }

  /**
   * Generate database migration SQL
   */
  generateMigrationSQL(schemaName: string): string {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new Error(`Schema ${schemaName} not found`);
    }

    const tableName = schema.tableName || schema.name.toLowerCase();
    let sql = `-- Migration for ${schema.name}\n`;
    sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
    sql += '  id SERIAL PRIMARY KEY,\n';

    schema.fields.forEach((field, index) => {
      sql += `  ${field.name} ${this.mapTypeToSQL(field)}`;
      
      if (field.required) {
        sql += ' NOT NULL';
      }
      
      if (field.unique) {
        sql += ' UNIQUE';
      }
      
      if (field.default !== undefined) {
        sql += ` DEFAULT ${this.formatSQLDefault(field.default)}`;
      }
      
      sql += index < schema.fields.length - 1 ? ',\n' : '\n';
    });

    if (schema.timestamps) {
      sql += ',\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
      sql += ',\n  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
    }

    if (schema.softDelete) {
      sql += ',\n  deleted_at TIMESTAMP DEFAULT NULL';
    }

    sql += '\n);\n\n';

    // Add indexes
    if (schema.indexes && schema.indexes.length > 0) {
      schema.indexes.forEach((fields) => {
        const indexName = `idx_${tableName}_${fields.join('_')}`;
        sql += `CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName}(${fields.join(', ')});\n`;
      });
    }

    return sql;
  }

  /**
   * Generate Express route handler
   */
  generateExpressRoute(schemaName: string): string {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new Error(`Schema ${schemaName} not found`);
    }

    const routePath = schema.tableName || schema.name.toLowerCase();

    return `
import { Router } from 'express';
import { ${schema.name}Service } from '../services/${schema.name}Service';

const router = Router();
const service = new ${schema.name}Service();

// List all ${schema.name}
router.get('/${routePath}', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, filter } = req.query;
    const result = await service.list({ page, limit, sort, filter });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ${schema.name} by ID
router.get('/${routePath}/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await service.getById(id);
    if (!result) {
      return res.status(404).json({ error: '${schema.name} not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create ${schema.name}
router.post('/${routePath}', async (req, res) => {
  try {
    const data = req.body;
    const result = await service.create(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update ${schema.name}
router.put('/${routePath}/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await service.update(id, data);
    if (!result) {
      return res.status(404).json({ error: '${schema.name} not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete ${schema.name}
router.delete('/${routePath}/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await service.delete(id);
    res.json({ success: true, message: '${schema.name} deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
`.trim();
  }

  /**
   * Generate service class
   */
  generateServiceClass(schemaName: string): string {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new Error(`Schema ${schemaName} not found`);
    }

    const tableName = schema.tableName || schema.name.toLowerCase();

    return `
import { Pool } from 'pg';
import { ${schema.name} } from '../types/${schema.name}';

export class ${schema.name}Service {
  private db: Pool;

  constructor(database?: Pool) {
    this.db = database || new Pool({
      // Database configuration
    });
  }

  async list(options: { page: number; limit: number; sort?: string; filter?: string }): Promise<${schema.name}[]> {
    const offset = (options.page - 1) * options.limit;
    const query = \`
      SELECT * FROM ${tableName}
      ${schema.softDelete ? 'WHERE deleted_at IS NULL' : ''}
      ORDER BY id DESC
      LIMIT $1 OFFSET $2
    \`;
    const result = await this.db.query(query, [options.limit, offset]);
    return result.rows;
  }

  async getById(id: string): Promise<${schema.name} | null> {
    const query = \`
      SELECT * FROM ${tableName}
      WHERE id = $1
      ${schema.softDelete ? 'AND deleted_at IS NULL' : ''}
    \`;
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  async create(data: Partial<${schema.name}>): Promise<${schema.name}> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map((_, i) => \`$\${i + 1}\`).join(', ');
    
    const query = \`
      INSERT INTO ${tableName} (\${fields.join(', ')})
      VALUES (\${placeholders})
      RETURNING *
    \`;
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async update(id: string, data: Partial<${schema.name}>): Promise<${schema.name} | null> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, i) => \`\${field} = $\${i + 2}\`).join(', ');
    
    const query = \`
      UPDATE ${tableName}
      SET \${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      ${schema.softDelete ? 'AND deleted_at IS NULL' : ''}
      RETURNING *
    \`;
    const result = await this.db.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<void> {
    ${schema.softDelete 
      ? `const query = 'UPDATE ${tableName} SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1';`
      : `const query = 'DELETE FROM ${tableName} WHERE id = $1';`
    }
    await this.db.query(query, [id]);
  }
}
`.trim();
  }

  /**
   * Update knowledge graph from schemas
   */
  private updateKnowledgeGraph(): void {
    this.knowledgeGraph.nodes = [];
    this.knowledgeGraph.edges = [];

    // Add schema nodes
    this.schemas.forEach((schema) => {
      const schemaNode: KnowledgeGraphNode = {
        id: `schema:${schema.name}`,
        type: 'schema',
        label: schema.name,
        properties: {
          tableName: schema.tableName,
          description: schema.description,
          fieldsCount: schema.fields.length,
        },
      };
      this.knowledgeGraph.nodes.push(schemaNode);

      // Add field nodes and edges
      schema.fields.forEach((field) => {
        const fieldNode: KnowledgeGraphNode = {
          id: `field:${schema.name}.${field.name}`,
          type: 'field',
          label: field.name,
          properties: {
            type: field.type,
            required: field.required,
            unique: field.unique,
          },
        };
        this.knowledgeGraph.nodes.push(fieldNode);

        this.knowledgeGraph.edges.push({
          from: schemaNode.id,
          to: fieldNode.id,
          type: 'has_field',
          label: 'has field',
        });

        // Add reference edges
        if (field.reference) {
          this.knowledgeGraph.edges.push({
            from: fieldNode.id,
            to: `schema:${field.reference.model}`,
            type: 'references',
            label: `references ${field.reference.model}`,
          });
        }
      });

      // Add relationship edges
      if (schema.relationships) {
        if (schema.relationships.hasMany) {
          schema.relationships.hasMany.forEach((targetModel) => {
            this.knowledgeGraph.edges.push({
              from: schemaNode.id,
              to: `schema:${targetModel}`,
              type: 'has_many',
              label: `has many ${targetModel}`,
            });
          });
        }

        if (schema.relationships.belongsTo) {
          schema.relationships.belongsTo.forEach((targetModel) => {
            this.knowledgeGraph.edges.push({
              from: schemaNode.id,
              to: `schema:${targetModel}`,
              type: 'belongs_to',
              label: `belongs to ${targetModel}`,
            });
          });
        }
      }
    });

    // Update metadata
    this.knowledgeGraph.metadata = {
      totalSchemas: this.schemas.size,
      totalFields: this.knowledgeGraph.nodes.filter((n) => n.type === 'field').length,
      totalRelationships: this.knowledgeGraph.edges.filter((e) =>
        ['has_many', 'belongs_to', 'many_to_many'].includes(e.type)
      ).length,
      generatedAt: new Date(),
    };
  }

  /**
   * Get knowledge graph
   */
  getKnowledgeGraph(): KnowledgeGraph {
    return this.knowledgeGraph;
  }

  /**
   * Export knowledge graph as Mermaid diagram
   */
  exportKnowledgeGraphAsMermaid(): string {
    let mermaid = 'graph TD\n';

    this.knowledgeGraph.nodes.forEach((node) => {
      if (node.type === 'schema') {
        mermaid += `  ${node.id}["${node.label}"]\n`;
      }
    });

    this.knowledgeGraph.edges.forEach((edge) => {
      if (edge.type !== 'has_field') {
        mermaid += `  ${edge.from} -->|${edge.label}| ${edge.to}\n`;
      }
    });

    return mermaid;
  }

  // Helper methods
  private generateTypeDefinition(schema: SchemaDefinition): Record<string, unknown> {
    const def: Record<string, unknown> = {};
    schema.fields.forEach((field) => {
      def[field.name] = field.type;
    });
    return def;
  }

  private generateCreateSchema(schema: SchemaDefinition): Record<string, unknown> {
    const def: Record<string, unknown> = {};
    schema.fields.forEach((field) => {
      if (!field.default) {
        def[field.name] = { type: field.type, required: field.required };
      }
    });
    return def;
  }

  private generateUpdateSchema(schema: SchemaDefinition): Record<string, unknown> {
    const def: Record<string, unknown> = {};
    schema.fields.forEach((field) => {
      def[field.name] = { type: field.type, required: false };
    });
    return def;
  }

  private mapTypeToTypeScript(type: string): string {
    const mapping: Record<string, string> = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      date: 'Date',
      object: 'Record<string, unknown>',
      array: 'unknown[]',
      reference: 'string',
    };
    return mapping[type] || 'unknown';
  }

  private mapTypeToSQL(field: SchemaField): string {
    const mapping: Record<string, string> = {
      string: 'VARCHAR(255)',
      number: 'INTEGER',
      boolean: 'BOOLEAN',
      date: 'TIMESTAMP',
      object: 'JSONB',
      array: 'JSONB',
      reference: 'INTEGER',
    };
    return mapping[field.type] || 'TEXT';
  }

  private formatSQLDefault(value: unknown): string {
    if (typeof value === 'string') {
      return `'${value}'`;
    }
    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }
    return String(value);
  }
}
