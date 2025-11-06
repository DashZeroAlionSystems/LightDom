// Database Introspection Utility
// Based on SCHEMA_PRACTICAL_IMPLEMENTATION_2025.md

import { Pool } from 'pg';
import { z } from 'zod';

export interface TableSchema {
  tableName: string;
  columns: ColumnSchema[];
  relationships: RelationshipSchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface RelationshipSchema {
  foreignTable: string;
  foreignColumn: string;
  localColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export async function introspectPostgresDatabase(
  connectionString: string,
  tables: string[]
): Promise<Map<string, TableSchema>> {
  const pool = new Pool({ connectionString });
  const schemas = new Map<string, TableSchema>();

  try {
    for (const tableName of tables) {
      // Get columns
      const columnsResult = await pool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          (SELECT COUNT(*) FROM information_schema.constraint_column_usage 
           WHERE table_name = $1 AND column_name = columns.column_name 
           AND constraint_name LIKE '%_pkey') > 0 AS is_primary_key
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      const columns: ColumnSchema[] = columnsResult.rows.map(row => ({
        name: row.column_name,
        type: mapPostgresTypeToZodType(row.data_type),
        nullable: row.is_nullable === 'YES',
        defaultValue: row.column_default,
        isPrimaryKey: row.is_primary_key,
        isForeignKey: false,
      }));

      // Get relationships
      const relationshipsResult = await pool.query(`
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = $1
      `, [tableName]);

      const relationships: RelationshipSchema[] = relationshipsResult.rows.map(row => ({
        foreignTable: row.foreign_table_name,
        foreignColumn: row.foreign_column_name,
        localColumn: row.column_name,
        type: 'one-to-many', // Simplified, could be determined by cardinality
      }));

      schemas.set(tableName, {
        tableName,
        columns,
        relationships,
      });
    }
  } finally {
    await pool.end();
  }

  return schemas;
}

function mapPostgresTypeToZodType(pgType: string): string {
  const mapping: Record<string, string> = {
    'character varying': 'string',
    'varchar': 'string',
    'text': 'string',
    'integer': 'number',
    'bigint': 'number',
    'numeric': 'number',
    'decimal': 'number',
    'real': 'number',
    'double precision': 'number',
    'boolean': 'boolean',
    'timestamp': 'date',
    'timestamp with time zone': 'date',
    'date': 'date',
    'time': 'string',
    'uuid': 'string',
    'json': 'object',
    'jsonb': 'object',
  };

  return mapping[pgType.toLowerCase()] || 'unknown';
}

export function toPascalCase(str: string): string {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
