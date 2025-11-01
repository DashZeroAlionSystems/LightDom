#!/usr/bin/env node

/**
 * Schema Linking Service
 * Analyzes database tables and defines relationships between features
 * Enables automated workflow generation and component dashboards
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SchemaLinkingService {
  constructor(dbConfig) {
    this.pool = new Pool(dbConfig || {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5434,
      database: process.env.DB_NAME || 'lightdom',
      user: process.env.DB_USER || 'lightdom_user',
      password: process.env.DB_PASSWORD || 'lightdom_password',
    });
    
    this.schemaLinks = new Map();
    this.tableMetadata = new Map();
    this.featureInteractions = new Map();
  }

  /**
   * Analyze all database tables and build comprehensive metadata
   */
  async analyzeDatabaseSchema() {
    const client = await this.pool.connect();
    
    try {
      console.log('🔍 Analyzing database schema...');
      
      // Get all tables
      const tablesQuery = `
        SELECT 
          table_schema,
          table_name,
          table_type
        FROM information_schema.tables
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_schema, table_name;
      `;
      
      const { rows: tables } = await client.query(tablesQuery);
      console.log(`📊 Found ${tables.length} tables`);
      
      // Analyze each table
      for (const table of tables) {
        const metadata = await this.analyzeTable(client, table.table_schema, table.table_name);
        this.tableMetadata.set(`${table.table_schema}.${table.table_name}`, metadata);
      }
      
      // Discover foreign key relationships
      await this.discoverForeignKeyRelationships(client);
      
      // Discover semantic relationships through naming patterns
      await this.discoverSemanticRelationships();
      
      // Identify feature groupings
      await this.identifyFeatureGroupings();
      
      console.log('✅ Schema analysis complete');
      
      return {
        tables: tables.length,
        relationships: this.schemaLinks.size,
        features: this.featureInteractions.size,
        metadata: Array.from(this.tableMetadata.values())
      };
      
    } finally {
      client.release();
    }
  }

  /**
   * Analyze individual table structure
   */
  async analyzeTable(client, schema, tableName) {
    // Get column information
    const columnsQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        udt_name
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position;
    `;
    
    const { rows: columns } = await client.query(columnsQuery, [schema, tableName]);
    
    // Get primary keys
    const pkQuery = `
      SELECT a.attname as column_name
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass AND i.indisprimary;
    `;
    
    const { rows: pks } = await client.query(pkQuery, [`${schema}.${tableName}`]);
    
    // Get indexes
    const indexQuery = `
      SELECT
        i.relname as index_name,
        a.attname as column_name,
        ix.indisunique as is_unique
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relname = $1 AND t.relnamespace = $2::regnamespace;
    `;
    
    const { rows: indexes } = await client.query(indexQuery, [tableName, schema]);
    
    return {
      schema,
      tableName,
      fullName: `${schema}.${tableName}`,
      columns: columns.map(col => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
        default: col.column_default,
        maxLength: col.character_maximum_length,
        precision: col.numeric_precision,
        scale: col.numeric_scale,
        udtName: col.udt_name
      })),
      primaryKeys: pks.map(pk => pk.column_name),
      indexes: indexes.map(idx => ({
        name: idx.index_name,
        column: idx.column_name,
        unique: idx.is_unique
      })),
      analyzedAt: new Date().toISOString()
    };
  }

  /**
   * Discover foreign key relationships
   */
  async discoverForeignKeyRelationships(client) {
    const fkQuery = `
      SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
        AND rc.constraint_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_schema, tc.table_name;
    `;
    
    const { rows: foreignKeys } = await client.query(fkQuery);
    
    console.log(`🔗 Found ${foreignKeys.length} foreign key relationships`);
    
    for (const fk of foreignKeys) {
      const linkId = `${fk.table_schema}.${fk.table_name}->${fk.foreign_table_schema}.${fk.foreign_table_name}`;
      
      this.schemaLinks.set(linkId, {
        type: 'foreign_key',
        source: {
          schema: fk.table_schema,
          table: fk.table_name,
          column: fk.column_name
        },
        target: {
          schema: fk.foreign_table_schema,
          table: fk.foreign_table_name,
          column: fk.foreign_column_name
        },
        constraints: {
          updateRule: fk.update_rule,
          deleteRule: fk.delete_rule
        },
        strength: 1.0, // Foreign keys are strong relationships
        bidirectional: false,
        discoveredAt: new Date().toISOString()
      });
    }
  }

  /**
   * Discover semantic relationships through naming patterns and field analysis
   */
  async discoverSemanticRelationships() {
    const tables = Array.from(this.tableMetadata.values());
    
    console.log('🔍 Discovering semantic relationships...');
    
    for (let i = 0; i < tables.length; i++) {
      for (let j = i + 1; j < tables.length; j++) {
        const table1 = tables[i];
        const table2 = tables[j];
        
        // Check for common column names (potential implicit relationships)
        const commonColumns = this.findCommonColumns(table1, table2);
        
        if (commonColumns.length > 0) {
          const linkId = `${table1.fullName}<->${table2.fullName}`;
          
          // Only add if not already linked via FK
          const existingFk = Array.from(this.schemaLinks.values()).find(link => 
            (link.source.table === table1.tableName && link.target.table === table2.tableName) ||
            (link.source.table === table2.tableName && link.target.table === table1.tableName)
          );
          
          if (!existingFk) {
            this.schemaLinks.set(linkId, {
              type: 'semantic',
              source: { schema: table1.schema, table: table1.tableName },
              target: { schema: table2.schema, table: table2.tableName },
              commonFields: commonColumns,
              strength: 0.5 + (commonColumns.length * 0.1), // Strength based on common fields
              bidirectional: true,
              discoveredAt: new Date().toISOString()
            });
          }
        }
        
        // Check for naming pattern relationships
        const nameRelationship = this.analyzeTableNameRelationship(table1, table2);
        if (nameRelationship) {
          const linkId = `${table1.fullName}~${table2.fullName}`;
          this.schemaLinks.set(linkId, {
            type: 'naming_pattern',
            source: { schema: table1.schema, table: table1.tableName },
            target: { schema: table2.schema, table: table2.tableName },
            pattern: nameRelationship.pattern,
            strength: nameRelationship.strength,
            bidirectional: true,
            discoveredAt: new Date().toISOString()
          });
        }
      }
    }
    
    console.log(`🔗 Discovered ${Array.from(this.schemaLinks.values()).filter(l => l.type === 'semantic').length} semantic relationships`);
  }

  /**
   * Find common columns between two tables
   */
  findCommonColumns(table1, table2) {
    const cols1 = new Set(table1.columns.map(c => c.name));
    const cols2 = new Set(table2.columns.map(c => c.name));
    
    return Array.from(cols1).filter(col => cols2.has(col));
  }

  /**
   * Analyze relationship between table names
   */
  analyzeTableNameRelationship(table1, table2) {
    const name1 = table1.tableName.toLowerCase();
    const name2 = table2.tableName.toLowerCase();
    
    // Check for parent-child naming patterns
    const patterns = [
      { regex: /^(.+)_(.+)$/, weight: 0.7 }, // underscore separated
      { regex: /^(.+)s$/, weight: 0.6 }, // plural forms
    ];
    
    for (const pattern of patterns) {
      const match1 = name1.match(pattern.regex);
      const match2 = name2.match(pattern.regex);
      
      if (match1 && match2) {
        // Check if they share a common base
        const base1 = match1[1];
        const base2 = match2[1];
        
        if (base1 === base2 || name1.includes(base2) || name2.includes(base1)) {
          return {
            pattern: 'common_base',
            strength: pattern.weight
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Identify feature groupings based on schema names and table patterns
   */
  async identifyFeatureGroupings() {
    console.log('🎯 Identifying feature groupings...');
    
    const features = new Map();
    
    for (const [key, metadata] of this.tableMetadata.entries()) {
      // Extract feature name from table name
      const featureName = this.extractFeatureName(metadata.tableName);
      
      if (!features.has(featureName)) {
        features.set(featureName, {
          name: featureName,
          tables: [],
          relationships: [],
          settings: new Set(),
          options: new Set()
        });
      }
      
      const feature = features.get(featureName);
      feature.tables.push(metadata);
      
      // Identify settings and options from column names
      for (const column of metadata.columns) {
        if (column.name.includes('setting') || column.name.includes('config')) {
          feature.settings.add(column.name);
        }
        if (column.name.includes('option') || column.name.includes('preference')) {
          feature.options.add(column.name);
        }
      }
    }
    
    // Convert sets to arrays for JSON serialization
    for (const [name, feature] of features.entries()) {
      feature.settings = Array.from(feature.settings);
      feature.options = Array.from(feature.options);
      this.featureInteractions.set(name, feature);
    }
    
    console.log(`🎯 Identified ${features.size} feature groupings`);
  }

  /**
   * Extract feature name from table name
   */
  extractFeatureName(tableName) {
    // Common patterns: feature_data, feature_config, features
    const patterns = [
      /^(.+?)_(data|config|settings|info|metadata)$/,
      /^(.+?)s$/,
      /^(.+?)_(.+)$/
    ];
    
    for (const pattern of patterns) {
      const match = tableName.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return tableName;
  }

  /**
   * Generate linked schema map for a specific feature
   */
  generateLinkedSchemaMap(featureName) {
    const feature = this.featureInteractions.get(featureName);
    if (!feature) {
      return null;
    }
    
    const linkedSchema = {
      feature: featureName,
      tables: feature.tables.map(t => ({
        name: t.tableName,
        schema: t.schema,
        columns: t.columns,
        primaryKeys: t.primaryKeys
      })),
      relationships: this.getFeatureRelationships(feature.tables),
      settings: feature.settings,
      options: feature.options,
      dashboards: this.generateDashboardConfigs(feature),
      workflows: this.generateWorkflowConfigs(feature),
      generatedAt: new Date().toISOString()
    };
    
    return linkedSchema;
  }

  /**
   * Get all relationships for tables in a feature
   */
  getFeatureRelationships(tables) {
    const tableNames = new Set(tables.map(t => t.tableName));
    const relationships = [];
    
    for (const [key, link] of this.schemaLinks.entries()) {
      if (tableNames.has(link.source.table) || tableNames.has(link.target?.table)) {
        relationships.push(link);
      }
    }
    
    return relationships;
  }

  /**
   * Generate dashboard configurations from feature schema
   */
  generateDashboardConfigs(feature) {
    const dashboards = [];
    
    // Create a dashboard for each table with settings/options
    for (const table of feature.tables) {
      const hasSettings = table.columns.some(c => 
        c.name.includes('setting') || c.name.includes('config') || c.name.includes('option')
      );
      
      if (hasSettings) {
        dashboards.push({
          id: `${feature.name}-${table.tableName}-dashboard`,
          name: `${this.formatName(table.tableName)} Configuration`,
          table: table.tableName,
          components: this.generateDashboardComponents(table),
          layout: {
            type: 'grid',
            columns: 12,
            responsive: true
          }
        });
      }
    }
    
    return dashboards;
  }

  /**
   * Generate dashboard components from table structure
   */
  generateDashboardComponents(table) {
    const components = [];
    
    for (const column of table.columns) {
      if (column.name === 'id' || column.name === 'created_at' || column.name === 'updated_at') {
        continue; // Skip meta fields
      }
      
      components.push({
        id: `${table.tableName}-${column.name}-component`,
        type: this.getComponentTypeFromColumn(column),
        field: column.name,
        label: this.formatName(column.name),
        required: !column.nullable,
        validation: this.getValidationRules(column),
        position: { row: components.length, col: 0, width: 6, height: 1 }
      });
    }
    
    return components;
  }

  /**
   * Get component type based on column data type
   */
  getComponentTypeFromColumn(column) {
    const typeMap = {
      'boolean': 'toggle',
      'integer': 'number',
      'bigint': 'number',
      'numeric': 'number',
      'decimal': 'number',
      'text': 'textarea',
      'varchar': 'input',
      'character varying': 'input',
      'jsonb': 'json-editor',
      'json': 'json-editor',
      'timestamp': 'datetime',
      'date': 'date',
      'uuid': 'uuid-display'
    };
    
    return typeMap[column.type.toLowerCase()] || 'input';
  }

  /**
   * Get validation rules for column
   */
  getValidationRules(column) {
    const rules = [];
    
    if (!column.nullable) {
      rules.push({ type: 'required', message: `${column.name} is required` });
    }
    
    if (column.maxLength) {
      rules.push({ type: 'maxLength', value: column.maxLength });
    }
    
    if (column.type === 'integer' || column.type === 'bigint') {
      rules.push({ type: 'integer' });
    }
    
    return rules;
  }

  /**
   * Generate workflow configurations from feature schema
   */
  generateWorkflowConfigs(feature) {
    return {
      id: `${feature.name}-configuration-workflow`,
      name: `${this.formatName(feature.name)} Configuration`,
      steps: feature.tables.map((table, index) => ({
        id: `step-${index}`,
        table: table.tableName,
        action: 'configure',
        fields: table.columns.filter(c => 
          !['id', 'created_at', 'updated_at'].includes(c.name)
        ).map(c => c.name)
      })),
      triggers: [
        { type: 'manual', description: 'Manual workflow execution' },
        { type: 'api', description: 'API triggered workflow' }
      ],
      automation: {
        enabled: true,
        rules: []
      }
    };
  }

  /**
   * Format name from snake_case to Title Case
   */
  formatName(name) {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Export all linked schemas to file
   */
  async exportLinkedSchemas(outputPath) {
    const export_data = {
      metadata: {
        exportedAt: new Date().toISOString(),
        totalTables: this.tableMetadata.size,
        totalRelationships: this.schemaLinks.size,
        totalFeatures: this.featureInteractions.size
      },
      tables: Array.from(this.tableMetadata.values()),
      relationships: Array.from(this.schemaLinks.values()),
      features: Array.from(this.featureInteractions.values()),
      linkedSchemas: {}
    };
    
    // Generate linked schema for each feature
    for (const [featureName] of this.featureInteractions) {
      export_data.linkedSchemas[featureName] = this.generateLinkedSchemaMap(featureName);
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(export_data, null, 2));
    console.log(`✅ Exported linked schemas to ${outputPath}`);
    
    return export_data;
  }

  /**
   * Close database connection
   */
  async close() {
    await this.pool.end();
  }
}

export default SchemaLinkingService;
