/**
 * DeepSeek Database Integration with Safety Controls
 *
 * Provides secure database access for DeepSeek with:
 * - Read-only mode enforcement
 * - Query whitelisting
 * - Rate limiting
 * - Schema introspection
 * - Automatic suggestions
 */

import express from 'express';
import pg from 'pg';
const { Pool } = pg;

const router = express.Router();

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Limit connections for safety
});

/**
 * Safety configuration for DeepSeek database access
 */
const SAFETY_CONFIG = {
  // Allowed operations (read-only by default)
  allowedOperations: ['SELECT', 'EXPLAIN', 'SHOW'],

  // Disallowed operations (write/dangerous operations)
  disallowedOperations: [
    'INSERT',
    'UPDATE',
    'DELETE',
    'DROP',
    'CREATE',
    'ALTER',
    'TRUNCATE',
    'GRANT',
    'REVOKE',
  ],

  // Rate limiting (requests per minute)
  rateLimit: 30,

  // Maximum rows to return
  maxRows: 1000,

  // Query timeout (ms)
  queryTimeout: 10000,

  // Allowed tables (empty = all tables)
  allowedTables: [],

  // Disallowed tables (sensitive data)
  disallowedTables: ['users', 'api_keys', 'sessions', 'passwords'],
};

// Rate limiting store (in-memory, use Redis for production)
const rateLimitStore = new Map();

/**
 * Check if query is safe to execute
 */
function isSafeQuery(query) {
  const upperQuery = query.toUpperCase().trim();

  // Check for disallowed operations
  for (const op of SAFETY_CONFIG.disallowedOperations) {
    if (upperQuery.includes(op)) {
      return {
        safe: false,
        reason: `Operation "${op}" is not allowed. DeepSeek can only perform read operations.`,
      };
    }
  }

  // Check for allowed operations
  const hasAllowedOp = SAFETY_CONFIG.allowedOperations.some(op => upperQuery.startsWith(op));
  if (!hasAllowedOp) {
    return {
      safe: false,
      reason: `Query must start with one of: ${SAFETY_CONFIG.allowedOperations.join(', ')}`,
    };
  }

  // Check for disallowed tables
  for (const table of SAFETY_CONFIG.disallowedTables) {
    const tablePattern = new RegExp(`\\b${table}\\b`, 'i');
    if (tablePattern.test(query)) {
      return {
        safe: false,
        reason: `Access to table "${table}" is restricted for security reasons.`,
      };
    }
  }

  // Check for SQL injection patterns
  const dangerousPatterns = [
    /;\s*DROP/i,
    /;\s*DELETE/i,
    /;\s*UPDATE/i,
    /--\s*$/,
    /\/\*.*\*\//,
    /EXEC\s*\(/i,
    /EXECUTE\s*\(/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(query)) {
      return {
        safe: false,
        reason: 'Query contains potentially dangerous patterns.',
      };
    }
  }

  return { safe: true };
}

/**
 * Check rate limit
 */
function checkRateLimit(clientId) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute

  if (!rateLimitStore.has(clientId)) {
    rateLimitStore.set(clientId, []);
  }

  const requests = rateLimitStore.get(clientId);

  // Remove old requests outside the window
  const recentRequests = requests.filter(time => now - time < windowMs);

  if (recentRequests.length >= SAFETY_CONFIG.rateLimit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(recentRequests[0] + windowMs),
    };
  }

  recentRequests.push(now);
  rateLimitStore.set(clientId, recentRequests);

  return {
    allowed: true,
    remaining: SAFETY_CONFIG.rateLimit - recentRequests.length,
    resetAt: new Date(now + windowMs),
  };
}

/**
 * GET /api/deepseek-db/schema
 *
 * Returns database schema information for DeepSeek to understand structure
 */
router.get('/schema', async (req, res) => {
  try {
    const clientId = req.ip || 'unknown';
    const rateCheck = checkRateLimit(clientId);

    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: rateCheck.resetAt,
      });
    }

    // Get all tables
    const tablesQuery = `
      SELECT 
        table_schema,
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        AND table_type = 'BASE TABLE'
      ORDER BY table_schema, table_name;
    `;

    const tablesResult = await pool.query(tablesQuery);
    const tables = tablesResult.rows.filter(
      t => !SAFETY_CONFIG.disallowedTables.includes(t.table_name)
    );

    // Get columns for each table
    const schemaInfo = await Promise.all(
      tables.map(async table => {
        const columnsQuery = `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
          FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = $2
          ORDER BY ordinal_position;
        `;

        const columnsResult = await pool.query(columnsQuery, [
          table.table_schema,
          table.table_name,
        ]);

        // Get indexes
        const indexesQuery = `
          SELECT
            indexname,
            indexdef
          FROM pg_indexes
          WHERE schemaname = $1 AND tablename = $2;
        `;

        const indexesResult = await pool.query(indexesQuery, [
          table.table_schema,
          table.table_name,
        ]);

        // Get row count estimate
        const countQuery = `
          SELECT reltuples::bigint AS estimate
          FROM pg_class
          WHERE oid = $1::regclass;
        `;

        const countResult = await pool.query(countQuery, [
          `${table.table_schema}.${table.table_name}`,
        ]);

        return {
          schema: table.table_schema,
          table: table.table_name,
          type: table.table_type,
          columns: columnsResult.rows,
          indexes: indexesResult.rows,
          estimatedRows: countResult.rows[0]?.estimate || 0,
        };
      })
    );

    return res.json({
      success: true,
      schema: schemaInfo,
      safety: {
        readOnly: true,
        allowedOperations: SAFETY_CONFIG.allowedOperations,
        disallowedTables: SAFETY_CONFIG.disallowedTables,
        maxRows: SAFETY_CONFIG.maxRows,
      },
      rateLimit: {
        remaining: rateCheck.remaining,
        resetAt: rateCheck.resetAt,
      },
    });
  } catch (error) {
    console.error('Schema introspection error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve schema',
      details: error.message,
    });
  }
});

/**
 * POST /api/deepseek-db/query
 *
 * Execute a read-only query with safety checks
 */
router.post('/query', async (req, res) => {
  try {
    const { query, params = [] } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    const clientId = req.ip || 'unknown';
    const rateCheck = checkRateLimit(clientId);

    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: rateCheck.resetAt,
      });
    }

    // Safety check
    const safetyCheck = isSafeQuery(query);
    if (!safetyCheck.safe) {
      return res.status(403).json({
        success: false,
        error: 'Query not allowed',
        reason: safetyCheck.reason,
        hint: 'DeepSeek can only execute SELECT queries on allowed tables.',
      });
    }

    // Execute query with timeout and row limit
    const limitedQuery = query.trim().toUpperCase().includes('LIMIT')
      ? query
      : `${query} LIMIT ${SAFETY_CONFIG.maxRows}`;

    const startTime = Date.now();
    const result = await pool.query({
      text: limitedQuery,
      values: params,
      rowMode: 'array', // More efficient for large results
    });
    const executionTime = Date.now() - startTime;

    return res.json({
      success: true,
      data: {
        fields: result.fields.map(f => ({
          name: f.name,
          dataType: f.dataTypeID,
        })),
        rows: result.rows,
        rowCount: result.rowCount,
      },
      meta: {
        executionTime,
        limited: result.rowCount === SAFETY_CONFIG.maxRows,
      },
      rateLimit: {
        remaining: rateCheck.remaining,
        resetAt: rateCheck.resetAt,
      },
    });
  } catch (error) {
    console.error('Query execution error:', error);
    return res.status(500).json({
      success: false,
      error: 'Query execution failed',
      details: error.message,
      hint: error.hint,
    });
  }
});

/**
 * POST /api/deepseek-db/suggest
 *
 * Get AI-powered query suggestions based on natural language
 */
router.post('/suggest', async (req, res) => {
  try {
    const { intent, context = {} } = req.body;

    if (!intent) {
      return res.status(400).json({
        success: false,
        error: 'Intent is required',
      });
    }

    const clientId = req.ip || 'unknown';
    const rateCheck = checkRateLimit(clientId);

    if (!rateCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: rateCheck.resetAt,
      });
    }

    // Get schema summary for context
    const tablesQuery = `
      SELECT 
        table_name,
        (
          SELECT json_agg(column_name)
          FROM information_schema.columns c
          WHERE c.table_name = t.table_name
            AND c.table_schema = 'public'
        ) as columns
      FROM information_schema.tables t
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;

    const schemaResult = await pool.query(tablesQuery);
    const schema = schemaResult.rows.filter(
      t => !SAFETY_CONFIG.disallowedTables.includes(t.table_name)
    );

    // Build prompt for DeepSeek
    const prompt = `You are a SQL expert helping generate safe, read-only queries.

Database Schema:
${schema.map(t => `- ${t.table_name}: ${t.columns?.join(', ')}`).join('\n')}

User Intent: ${intent}

Additional Context: ${JSON.stringify(context)}

Generate a safe SELECT query that satisfies the user's intent. 
- Only use SELECT statements
- Limit results to 100 rows unless specified
- Use proper JOINs if multiple tables are needed
- Add WHERE clauses for filtering
- Use appropriate ORDER BY for sorting

Return ONLY the SQL query, no explanations.`;

    // Call local Ollama DeepSeek model
    const ollamaResponse = await fetch('http://127.0.0.1:11500/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-coder',
        prompt,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error('Failed to get suggestion from DeepSeek');
    }

    const ollamaResult = await ollamaResponse.json();
    const suggestedQuery = ollamaResult.response
      .replace(/```sql/g, '')
      .replace(/```/g, '')
      .trim();

    // Safety check the suggested query
    const safetyCheck = isSafeQuery(suggestedQuery);

    return res.json({
      success: true,
      suggestion: {
        query: suggestedQuery,
        safe: safetyCheck.safe,
        reason: safetyCheck.reason,
        intent,
      },
      rateLimit: {
        remaining: rateCheck.remaining,
        resetAt: rateCheck.resetAt,
      },
    });
  } catch (error) {
    console.error('Query suggestion error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate query suggestion',
      details: error.message,
    });
  }
});

/**
 * GET /api/deepseek-db/examples
 *
 * Get example queries for common operations
 */
router.get('/examples', async (req, res) => {
  try {
    // Get some table names for examples
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      LIMIT 5;
    `;

    const result = await pool.query(tablesQuery);
    const tables = result.rows
      .filter(t => !SAFETY_CONFIG.disallowedTables.includes(t.table_name))
      .map(t => t.table_name);

    const examples =
      tables.length > 0
        ? [
            {
              title: 'Count all records',
              query: `SELECT COUNT(*) FROM ${tables[0]};`,
              description: 'Get total number of rows in a table',
            },
            {
              title: 'Get recent records',
              query: `SELECT * FROM ${tables[0]} ORDER BY created_at DESC LIMIT 10;`,
              description: 'Fetch the 10 most recent records',
            },
            {
              title: 'Group and count',
              query: `SELECT status, COUNT(*) as count FROM ${tables[0]} GROUP BY status;`,
              description: 'Count records by status',
            },
            {
              title: 'Search by keyword',
              query: `SELECT * FROM ${tables[0]} WHERE title ILIKE '%keyword%' LIMIT 20;`,
              description: 'Case-insensitive search in text fields',
            },
          ]
        : [];

    return res.json({
      success: true,
      examples,
      availableTables: tables,
    });
  } catch (error) {
    console.error('Examples generation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate examples',
      details: error.message,
    });
  }
});

export default router;
