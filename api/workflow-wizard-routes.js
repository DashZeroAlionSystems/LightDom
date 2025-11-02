/**
 * Workflow Wizard API Routes
 * 
 * Provides endpoints for:
 * - Database schema verification and creation
 * - Workflow template management
 * - Workflow instance creation with AI generation
 * - Schema linking integration
 */

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Verify all required database schemas exist
 */
router.get('/verify-schemas', async (req, res) => {
  try {
    const requiredTables = [
      { schema: 'public', table: 'workflow_templates' },
      { schema: 'public', table: 'workflow_template_tasks' },
      { schema: 'public', table: 'workflow_instances' },
      { schema: 'public', table: 'workflows' },
      { schema: 'public', table: 'atom_definitions' },
      { schema: 'public', table: 'component_definitions' },
      { schema: 'public', table: 'dashboard_definitions' },
      { schema: 'public', table: 'component_schema_links' },
      { schema: 'public', table: 'schema_analysis_runs' },
      { schema: 'public', table: 'discovered_tables' },
      { schema: 'public', table: 'schema_relationships' },
      { schema: 'public', table: 'feature_groupings' },
    ];

    const tableStatus = await Promise.all(
      requiredTables.map(async ({ schema, table }) => {
        const result = await pool.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = $1 AND table_name = $2
          )`,
          [schema, table]
        );
        return {
          schema_name: schema,
          table_name: table,
          exists: result.rows[0].exists,
        };
      })
    );

    const allExist = tableStatus.every(t => t.exists);

    res.json({
      verified: allExist,
      tables: tableStatus,
      missing_count: tableStatus.filter(t => !t.exists).length,
    });
  } catch (error) {
    console.error('Error verifying schemas:', error);
    res.status(500).json({ error: 'Failed to verify schemas', details: error.message });
  }
});

module.exports = router;
