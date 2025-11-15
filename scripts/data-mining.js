#!/usr/bin/env node

/**
 * Data Mining Service with Schema Relationship Mapping
 * Automatically discovers and maps data relationships
 */

import pkg from 'pg';
const { Pool } = pkg;

class DataMiningService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://lightdom:lightdom@localhost:5432/lightdom'
    });
  }

  async init() {
    await this.ensureDataMiningTables();
  }

  async ensureDataMiningTables() {
    const queries = [
      // Schema relationships table
      `CREATE TABLE IF NOT EXISTS schema_relationships (
        id SERIAL PRIMARY KEY,
        source_table VARCHAR(255) NOT NULL,
        source_column VARCHAR(255) NOT NULL,
        target_table VARCHAR(255) NOT NULL,
        target_column VARCHAR(255) NOT NULL,
        relationship_type VARCHAR(50) NOT NULL,
        confidence_score DECIMAL(3,2),
        discovered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_verified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
      )`,

      // Data mining metadata
      `CREATE TABLE IF NOT EXISTS data_mining_metadata (
        table_name VARCHAR(255) PRIMARY KEY,
        record_count INTEGER,
        column_count INTEGER,
        last_analyzed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        schema_version INTEGER DEFAULT 1,
        data_quality_score DECIMAL(3,2)
      )`,

      // Relationship patterns
      `CREATE TABLE IF NOT EXISTS relationship_patterns (
        pattern_id SERIAL PRIMARY KEY,
        pattern_name VARCHAR(255) NOT NULL,
        pattern_type VARCHAR(50) NOT NULL,
        description TEXT,
        confidence_threshold DECIMAL(3,2) DEFAULT 0.8,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,

      // Indexes
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_schema_relationships_source
        ON schema_relationships(source_table, source_column)`,

      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_schema_relationships_target
        ON schema_relationships(target_table, target_column)`,

      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_data_mining_metadata_table
        ON data_mining_metadata(table_name)`
    ];

    for (const query of queries) {
      await this.pool.query(query);
    }
  }

  async analyzeTableSchema(tableName) {
    console.log(`🔍 Analyzing schema for table: ${tableName}`);

    // Get table structure
    const structureQuery = `
      SELECT column_name, data_type, is_nullable,
             column_default, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    const structure = await this.pool.query(structureQuery, [tableName]);
    return structure.rows;
  }

  async discoverRelationships() {
    console.log('🔗 Discovering data relationships...');

    // Get all tables in our schema
    const tables = [
      'agent_sessions', 'agent_instances', 'agent_messages',
      'agent_tools', 'agent_services', 'agent_workflows',
      'workflow_steps', 'agent_executions', 'agent_campaigns',
      'data_streams', 'stream_attributes'
    ];

    const relationships = [];

    // Foreign key relationships
    const fkQuery = `
      SELECT
        tc.table_name as source_table,
        kcu.column_name as source_column,
        ccu.table_name as target_table,
        ccu.column_name as target_column,
        'foreign_key' as relationship_type
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    `;

    const fkResult = await this.pool.query(fkQuery);
    relationships.push(...fkResult.rows);

    // Potential UUID relationships (same UUID values across tables)
    for (const sourceTable of tables) {
      for (const targetTable of tables) {
        if (sourceTable === targetTable) continue;

        const uuidQuery = `
          SELECT DISTINCT
            '${sourceTable}' as source_table,
            a.column_name as source_column,
            '${targetTable}' as target_table,
            b.column_name as target_column,
            'potential_uuid' as relationship_type,
            COUNT(*) as overlap_count
          FROM information_schema.columns a
          CROSS JOIN information_schema.columns b
          WHERE a.table_name = '${sourceTable}'
            AND b.table_name = '${targetTable}'
            AND a.data_type = 'uuid'
            AND b.data_type = 'uuid'
            AND a.column_name != b.column_name
          GROUP BY a.column_name, b.column_name
          HAVING COUNT(*) > 0
          LIMIT 5
        `;

        try {
          const uuidResult = await this.pool.query(uuidQuery);
          if (uuidResult.rows.length > 0) {
            relationships.push(...uuidResult.rows.map(row => ({
              ...row,
              confidence_score: Math.min(row.overlap_count / 10, 1) // Simple confidence scoring
            })));
          }
        } catch (error) {
          // Skip if query fails
        }
      }
    }

    // Store discovered relationships
    for (const rel of relationships) {
      await this.pool.query(`
        INSERT INTO schema_relationships
        (source_table, source_column, target_table, target_column, relationship_type, confidence_score)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [
        rel.source_table,
        rel.source_column,
        rel.target_table,
        rel.target_column,
        rel.relationship_type,
        rel.confidence_score || 0.9
      ]);
    }

    console.log(`✅ Discovered ${relationships.length} relationships`);
    return relationships;
  }

  async updateDataQualityMetrics() {
    console.log('📊 Updating data quality metrics...');

    const tables = [
      'agent_sessions', 'agent_instances', 'agent_messages',
      'agent_tools', 'agent_services', 'agent_workflows',
      'workflow_steps', 'agent_executions', 'agent_campaigns',
      'data_streams', 'stream_attributes'
    ];

    for (const tableName of tables) {
      // Get record count
      const countQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
      const countResult = await this.pool.query(countQuery);
      const recordCount = parseInt(countResult.rows[0].count);

      // Get column count
      const columnQuery = `
        SELECT COUNT(*) as count
        FROM information_schema.columns
        WHERE table_name = $1 AND table_schema = 'public'
      `;
      const columnResult = await this.pool.query(columnQuery, [tableName]);
      const columnCount = parseInt(columnResult.rows[0].count);

      // Simple data quality score based on completeness
      const qualityQuery = `
        SELECT AVG(completeness) as quality_score
        FROM (
          SELECT (
            SELECT COUNT(*) FROM ${tableName} t2
            WHERE t2.${tableName}_id IS NOT NULL
          )::float / NULLIF(COUNT(*), 0) as completeness
          FROM ${tableName}
          LIMIT 1
        ) q
      `;

      let qualityScore = 0.8; // Default
      try {
        const qualityResult = await this.pool.query(qualityQuery);
        qualityScore = parseFloat(qualityResult.rows[0].quality_score) || 0.8;
      } catch (error) {
        // Use default if query fails
      }

      // Update metadata
      await this.pool.query(`
        INSERT INTO data_mining_metadata
        (table_name, record_count, column_count, data_quality_score)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (table_name) DO UPDATE SET
          record_count = EXCLUDED.record_count,
          column_count = EXCLUDED.column_count,
          data_quality_score = EXCLUDED.data_quality_score,
          last_analyzed = CURRENT_TIMESTAMP
      `, [tableName, recordCount, columnCount, qualityScore]);

      console.log(`📈 ${tableName}: ${recordCount} records, ${columnCount} columns, quality: ${(qualityScore * 100).toFixed(1)}%`);
    }
  }

  async generateRelationshipMap() {
    console.log('🗺️ Generating relationship map...');

    const query = `
      SELECT
        source_table,
        source_column,
        target_table,
        target_column,
        relationship_type,
        confidence_score,
        discovered_at
      FROM schema_relationships
      WHERE is_active = true
      ORDER BY confidence_score DESC, discovered_at DESC
    `;

    const result = await this.pool.query(query);
    return result.rows;
  }

  async runDataMining() {
    console.log('⛏️ Starting data mining process...');

    await this.init();
    await this.discoverRelationships();
    await this.updateDataQualityMetrics();

    const relationships = await this.generateRelationshipMap();

    console.log('\n📋 Relationship Map:');
    relationships.forEach(rel => {
      console.log(`  ${rel.source_table}.${rel.source_column} -> ${rel.target_table}.${rel.target_column} (${rel.relationship_type}, ${(rel.confidence_score * 100).toFixed(1)}%)`);
    });

    console.log(`\n✅ Data mining completed. Found ${relationships.length} relationships.`);
    return relationships;
  }

  async close() {
    await this.pool.end();
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'mine';
  const service = new DataMiningService();

  try {
    switch (command) {
      case 'mine':
        await service.runDataMining();
        break;
      case 'relationships':
        await service.init();
        const relationships = await service.generateRelationshipMap();
        console.log(JSON.stringify(relationships, null, 2));
        break;
      case 'quality':
        await service.init();
        await service.updateDataQualityMetrics();
        break;
      default:
        console.log('Usage: node data-mining.js [mine|relationships|quality]');
    }
  } catch (error) {
    console.error('Data mining error:', error);
    process.exit(1);
  } finally {
    await service.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DataMiningService;
