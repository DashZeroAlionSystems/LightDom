/**
 * Agent Tools System
 * Provides executable tools/functions for AI agents like DeepSeek
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database for data mining configs
let db;
try {
  const dbPath = path.join(path.dirname(__dirname), 'data', 'data-mining.db');
  db = new Database(dbPath);
} catch (err) {
  console.warn('⚠️ Could not initialize data mining database:', err.message);
}

// Tool definitions for the AI agent
export const AGENT_TOOLS = [
  {
    name: 'create_data_mining_config',
    description:
      'Create a complete data mining configuration for scraping websites, APIs, or other data sources. This sets up scrapers, schedules, and processing pipelines.',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description:
            'Name of the data mining operation (e.g., "Kaggle Component Mining", "E-commerce Price Tracking")',
        },
        description: {
          type: 'string',
          description: 'Detailed description of what this mining operation does',
        },
        sourceType: {
          type: 'string',
          enum: ['website', 'api', 'database', 'file', 'feed'],
          description: 'Type of data source to mine from',
        },
        baseUrl: {
          type: 'string',
          description: 'Starting URL for web scraping (e.g., "https://www.kaggle.com/code")',
        },
        seedUrls: {
          type: 'array',
          items: { type: 'string' },
          description: 'Additional URLs to start scraping from',
        },
        selectors: {
          type: 'object',
          description:
            'CSS selectors for data extraction (e.g., {"title": "h1.component-title", "description": "p.description"})',
        },
        attributes: {
          type: 'array',
          items: { type: 'string' },
          description:
            'List of data attributes to extract (e.g., ["title", "author", "stars", "code"])',
        },
        maxDepth: {
          type: 'number',
          description: 'Maximum depth for link following (default: 3)',
        },
        maxConcurrency: {
          type: 'number',
          description: 'Number of parallel scraping tasks (default: 5)',
        },
        scheduleType: {
          type: 'string',
          enum: ['once', 'interval', 'cron'],
          description: 'How to schedule the mining operation',
        },
        intervalMinutes: {
          type: 'number',
          description: 'Interval in minutes for scheduled runs (if scheduleType is "interval")',
        },
      },
      required: ['name', 'sourceType'],
    },
  },
  {
    name: 'start_mining_operation',
    description: 'Start a configured data mining operation to begin scraping and collecting data',
    parameters: {
      type: 'object',
      properties: {
        configId: {
          type: 'string',
          description: 'ID of the mining configuration to start',
        },
      },
      required: ['configId'],
    },
  },
  {
    name: 'list_mining_configs',
    description: 'List all existing data mining configurations',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['all', 'pending', 'running', 'completed', 'failed'],
          description: 'Filter by status (default: "all")',
        },
      },
    },
  },
  {
    name: 'get_mining_results',
    description: 'Get the results/data from a completed mining operation',
    parameters: {
      type: 'object',
      properties: {
        operationId: {
          type: 'string',
          description: 'ID of the mining operation',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 100)',
        },
      },
      required: ['operationId'],
    },
  },
  {
    name: 'create_database_schema',
    description: 'Create a custom database schema for storing specific types of data',
    parameters: {
      type: 'object',
      properties: {
        tableName: {
          type: 'string',
          description: 'Name of the table to create',
        },
        columns: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string', enum: ['TEXT', 'INTEGER', 'REAL', 'DATETIME', 'BOOLEAN'] },
              constraints: { type: 'string' },
            },
          },
          description: 'Array of column definitions',
        },
      },
      required: ['tableName', 'columns'],
    },
  },
  {
    name: 'execute_sql_query',
    description: 'Execute a SQL query on the data mining database (SELECT only for safety)',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'SQL SELECT query to execute',
        },
      },
      required: ['query'],
    },
  },
];

// Tool execution functions
export const TOOL_EXECUTORS = {
  async create_data_mining_config(params) {
    try {
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const configId = `cfg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create mining operation
      db.prepare(
        `
        INSERT INTO mining_operations (id, name, description, type, status, priority)
        VALUES (?, ?, ?, 'scraping', 'pending', 1)
      `
      ).run(operationId, params.name, params.description || '');

      // Create scraping config
      const selectors = JSON.stringify(params.selectors || {});
      const seedUrls = JSON.stringify(params.seedUrls || []);
      const attributes = JSON.stringify(params.attributes || []);

      db.prepare(
        `
        INSERT INTO scraping_configs (
          id, operation_id, name, description, source_type, base_url,
          selectors, max_depth, max_concurrency, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `
      ).run(
        configId,
        operationId,
        params.name,
        params.description || '',
        params.sourceType,
        params.baseUrl || '',
        selectors,
        params.maxDepth || 3,
        params.maxConcurrency || 5
      );

      // Create schedule if specified
      if (params.scheduleType) {
        const scheduleId = `sch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        db.prepare(
          `
          INSERT INTO scraping_schedules (
            id, config_id, name, schedule_type, interval_minutes, enabled
          ) VALUES (?, ?, ?, ?, ?, 1)
        `
        ).run(
          scheduleId,
          configId,
          `${params.name} Schedule`,
          params.scheduleType,
          params.intervalMinutes || null
        );
      }

      return {
        success: true,
        operationId,
        configId,
        message: `Data mining configuration "${params.name}" created successfully`,
        details: {
          name: params.name,
          sourceType: params.sourceType,
          baseUrl: params.baseUrl,
          status: 'pending',
        },
      };
    } catch (error) {
      console.error('Error creating data mining config:', error);
      return { success: false, error: error.message };
    }
  },

  async start_mining_operation(params) {
    try {
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      // Update operation status
      db.prepare(
        `
        UPDATE mining_operations
        SET status = 'running', started_at = datetime('now')
        WHERE id IN (
          SELECT operation_id FROM scraping_configs WHERE id = ?
        )
      `
      ).run(params.configId);

      return {
        success: true,
        message: 'Mining operation started',
        configId: params.configId,
        status: 'running',
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async list_mining_configs(params) {
    try {
      if (!db) {
        return { success: false, error: 'Database not available', configs: [] };
      }

      const status = params.status || 'all';
      let query = `
        SELECT 
          mo.id as operationId,
          mo.name,
          mo.description,
          mo.type,
          mo.status,
          mo.created_at,
          mo.started_at,
          mo.completed_at,
          sc.id as configId,
          sc.source_type,
          sc.base_url
        FROM mining_operations mo
        LEFT JOIN scraping_configs sc ON mo.id = sc.operation_id
      `;

      if (status !== 'all') {
        query += ` WHERE mo.status = ?`;
      }

      query += ` ORDER BY mo.created_at DESC LIMIT 50`;

      const configs = status === 'all' ? db.prepare(query).all() : db.prepare(query).all(status);

      return {
        success: true,
        count: configs.length,
        configs,
      };
    } catch (error) {
      return { success: false, error: error.message, configs: [] };
    }
  },

  async get_mining_results(params) {
    try {
      if (!db) {
        return { success: false, error: 'Database not available', results: [] };
      }

      const limit = params.limit || 100;

      // Get scraped data
      const results = db
        .prepare(
          `
        SELECT 
          sd.id,
          sd.url,
          sd.title,
          sd.extracted_data,
          sd.scraped_at,
          sd.processing_status
        FROM scraped_data sd
        WHERE sd.operation_id = ?
        ORDER BY sd.scraped_at DESC
        LIMIT ?
      `
        )
        .all(params.operationId, limit);

      return {
        success: true,
        operationId: params.operationId,
        count: results.length,
        results: results.map(r => ({
          ...r,
          extracted_data: r.extracted_data ? JSON.parse(r.extracted_data) : null,
        })),
      };
    } catch (error) {
      return { success: false, error: error.message, results: [] };
    }
  },

  async create_database_schema(params) {
    try {
      if (!db) {
        return { success: false, error: 'Database not available' };
      }

      const columns = params.columns
        .map(col => {
          const constraints = col.constraints || '';
          return `${col.name} ${col.type} ${constraints}`;
        })
        .join(', ');

      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS ${params.tableName} (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          ${columns},
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      db.prepare(createTableSQL).run();

      return {
        success: true,
        message: `Table "${params.tableName}" created successfully`,
        tableName: params.tableName,
        columns: params.columns,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async execute_sql_query(params) {
    try {
      if (!db) {
        return { success: false, error: 'Database not available', rows: [] };
      }

      // Security: Only allow SELECT queries
      const query = params.query.trim();
      if (!query.toLowerCase().startsWith('select')) {
        return { success: false, error: 'Only SELECT queries are allowed', rows: [] };
      }

      const rows = db.prepare(query).all();

      return {
        success: true,
        rowCount: rows.length,
        rows,
      };
    } catch (error) {
      return { success: false, error: error.message, rows: [] };
    }
  },
};

/**
 * Execute a tool by name with parameters
 */
export async function executeTool(toolName, parameters) {
  const executor = TOOL_EXECUTORS[toolName];
  if (!executor) {
    return { success: false, error: `Unknown tool: ${toolName}` };
  }

  console.log(`🔧 Executing tool: ${toolName}`, parameters);
  const result = await executor(parameters);
  console.log(`✅ Tool result:`, result);

  return result;
}

export default {
  AGENT_TOOLS,
  TOOL_EXECUTORS,
  executeTool,
};
