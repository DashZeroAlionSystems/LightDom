#!/usr/bin/env node

/**
 * Database Management Suite
 * Comprehensive database optimization and monitoring
 */

import pkg from 'pg';
const { Pool } = pkg;

class DatabaseManager {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://lightdom:lightdom@localhost:5432/lightdom'
    });
  }

  async runOptimizationSuite() {
    console.log('🚀 Starting Database Optimization Suite...');

    try {
      // Run schema optimizations
      await this.optimizeIndexes();
      await this.updateStatistics();
      await this.vacuumAnalyze();

      // Monitor performance
      await this.checkQueryPerformance();
      await this.analyzeTableBloat();

      // Data quality checks
      await this.validateConstraints();
      await this.checkDataConsistency();

      console.log('✅ Database optimization suite completed');
    } catch (error) {
      console.error('❌ Optimization suite failed:', error);
      throw error;
    }
  }

  async optimizeIndexes() {
    console.log('🔧 Optimizing indexes...');

    const optimizationQueries = [
      // Reindex concurrently to avoid blocking
      'REINDEX CONCURRENTLY INDEX CONCURRENTLY idx_agent_sessions_status_created',
      'REINDEX CONCURRENTLY INDEX CONCURRENTLY idx_agent_instances_session_status',
      'REINDEX CONCURRENTLY INDEX CONCURRENTLY idx_agent_messages_session_created',
      'REINDEX CONCURRENTLY INDEX CONCURRENTLY idx_agent_tools_category_active',
      'REINDEX CONCURRENTLY INDEX CONCURRENTLY idx_agent_workflows_type_active',
      'REINDEX CONCURRENTLY INDEX CONCURRENTLY idx_workflow_steps_workflow_ordering',
      'REINDEX CONCURRENTLY INDEX CONCURRENTLY idx_agent_executions_status_started',
      'REINDEX CONCURRENTLY INDEX CONCURRENTLY idx_schema_relationships_source',
      'REINDEX CONCURRENTLY INDEX CONCURRENTLY idx_schema_relationships_target',
      'REINDEX CONCURRENTLY INDEX CONCURRENTLY idx_data_mining_metadata_table',

      // Add any missing indexes
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_agent_messages_role
        ON agent_messages(role) WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'`,
    ];

    for (const query of optimizationQueries) {
      try {
        await this.pool.query(query);
        console.log(`✅ Executed: ${query.split(' ')[0]}...`);
      } catch (error) {
        console.warn(`⚠️ Skipped: ${query.split(' ')[0]} - ${error.message}`);
      }
    }
  }

  async updateStatistics() {
    console.log('📊 Updating table statistics...');

    const tables = [
      'agent_sessions', 'agent_instances', 'agent_messages',
      'agent_tools', 'agent_services', 'agent_workflows',
      'workflow_steps', 'agent_executions', 'agent_campaigns',
      'data_streams', 'stream_attributes', 'schema_relationships',
      'data_mining_metadata', 'relationship_patterns', 'schema_migrations'
    ];

    for (const table of tables) {
      try {
        await this.pool.query(`ANALYZE ${table}`);
        console.log(`📈 Analyzed ${table}`);
      } catch (error) {
        console.warn(`⚠️ Could not analyze ${table}: ${error.message}`);
      }
    }
  }

  async vacuumAnalyze() {
    console.log('🧹 Running VACUUM ANALYZE...');

    const tables = [
      'agent_sessions', 'agent_instances', 'agent_messages',
      'agent_tools', 'agent_services', 'agent_workflows',
      'workflow_steps', 'agent_executions'
    ];

    for (const table of tables) {
      try {
        await this.pool.query(`VACUUM ANALYZE ${table}`);
        console.log(`🧽 Vacuumed ${table}`);
      } catch (error) {
        console.warn(`⚠️ Could not vacuum ${table}: ${error.message}`);
      }
    }
  }

  async checkQueryPerformance() {
    console.log('⚡ Checking query performance...');

    const slowQueries = await this.pool.query(`
      SELECT
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements
      WHERE mean_time > 1000  -- Queries taking more than 1 second on average
        AND calls > 10        -- Executed more than 10 times
      ORDER BY mean_time DESC
      LIMIT 10
    `);

    if (slowQueries.rows.length > 0) {
      console.log('🐌 Slow queries detected:');
      slowQueries.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.mean_time.toFixed(2)}ms avg - ${row.calls} calls`);
        console.log(`   ${row.query.substring(0, 100)}...`);
      });

      // Suggest optimizations
      console.log('\n💡 Optimization suggestions:');
      console.log('   - Consider adding indexes on frequently filtered columns');
      console.log('   - Review query patterns for N+1 problems');
      console.log('   - Consider query result caching for expensive operations');
    } else {
      console.log('✅ No slow queries detected');
    }
  }

  async analyzeTableBloat() {
    console.log('📏 Analyzing table bloat...');

    const bloatQuery = `
      SELECT
        schemaname,
        tablename,
        n_dead_tup,
        n_live_tup,
        ROUND(n_dead_tup::float / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) as bloat_ratio
      FROM pg_stat_user_tables
      WHERE n_dead_tup > 0
        AND schemaname = 'public'
      ORDER BY bloat_ratio DESC
      LIMIT 10
    `;

    const bloatResult = await this.pool.query(bloatQuery);

    if (bloatResult.rows.length > 0) {
      console.log('🔍 Tables with significant bloat:');
      bloatResult.rows.forEach(row => {
        if (row.bloat_ratio > 20) {
          console.log(`   ${row.tablename}: ${row.bloat_ratio}% bloat (${row.n_dead_tup} dead tuples)`);
        }
      });
    } else {
      console.log('✅ No significant table bloat detected');
    }
  }

  async validateConstraints() {
    console.log('🔒 Validating constraints...');

    const constraintViolations = await this.pool.query(`
      SELECT
        conname as constraint_name,
        conrelid::regclass as table_name,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE contype IN ('f', 'c', 'u')
        AND connamespace = 'public'::regnamespace
      ORDER BY conrelid::regclass, conname
    `);

    console.log(`📋 Found ${constraintViolations.rows.length} constraints to validate`);

    // Check for orphaned records (simple foreign key validation)
    const orphanChecks = [
      {
        name: 'agent_instances -> agent_sessions',
        query: 'SELECT COUNT(*) as orphans FROM agent_instances WHERE session_id NOT IN (SELECT session_id FROM agent_sessions)'
      },
      {
        name: 'agent_messages -> agent_sessions',
        query: 'SELECT COUNT(*) as orphans FROM agent_messages WHERE session_id NOT IN (SELECT session_id FROM agent_sessions)'
      },
      {
        name: 'workflow_steps -> agent_workflows',
        query: 'SELECT COUNT(*) as orphans FROM workflow_steps WHERE workflow_id NOT IN (SELECT workflow_id FROM agent_workflows)'
      }
    ];

    for (const check of orphanChecks) {
      const result = await this.pool.query(check.query);
      const orphanCount = parseInt(result.rows[0].orphans);

      if (orphanCount > 0) {
        console.warn(`⚠️ Found ${orphanCount} orphaned records in ${check.name}`);
      } else {
        console.log(`✅ ${check.name}: No orphans`);
      }
    }
  }

  async checkDataConsistency() {
    console.log('🔍 Checking data consistency...');

    const consistencyChecks = [
      {
        name: 'UUID format validation',
        query: `
          SELECT COUNT(*) as invalid FROM (
            SELECT session_id::text as id FROM agent_sessions WHERE session_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
            UNION ALL
            SELECT instance_id::text as id FROM agent_instances WHERE instance_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          ) q
        `
      },
      {
        name: 'Status enum validation',
        query: `
          SELECT COUNT(*) as invalid FROM (
            SELECT * FROM agent_sessions WHERE status NOT IN ('active', 'inactive', 'archived')
            UNION ALL
            SELECT * FROM agent_instances WHERE status NOT IN ('idle', 'active', 'busy', 'error')
          ) q
        `
      }
    ];

    for (const check of consistencyChecks) {
      const result = await this.pool.query(check.query);
      const invalidCount = parseInt(result.rows[0].invalid || result.rows[0].orphans || '0');

      if (invalidCount > 0) {
        console.warn(`⚠️ ${check.name}: ${invalidCount} invalid records`);
      } else {
        console.log(`✅ ${check.name}: All records valid`);
      }
    }
  }

  async generateHealthReport() {
    console.log('📊 Generating database health report...');

    const report = {
      timestamp: new Date().toISOString(),
      database_size: null,
      active_connections: null,
      slowest_queries: [],
      table_sizes: [],
      recommendations: []
    };

    // Database size
    const sizeResult = await this.pool.query(`
      SELECT
        pg_size_pretty(pg_database_size(current_database())) as size,
        pg_database_size(current_database()) as bytes
    `);
    report.database_size = sizeResult.rows[0];

    // Active connections
    const connResult = await this.pool.query(`
      SELECT COUNT(*) as active_connections
      FROM pg_stat_activity
      WHERE state = 'active'
    `);
    report.active_connections = connResult.rows[0];

    // Table sizes
    const tableSizeResult = await this.pool.query(`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as bytes
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename LIKE 'agent_%'
      ORDER BY bytes DESC
      LIMIT 10
    `);
    report.table_sizes = tableSizeResult.rows;

    // Generate recommendations
    if (report.database_size.bytes > 1000000000) { // 1GB
      report.recommendations.push('Consider archiving old data to reduce database size');
    }

    if (report.active_connections.active_connections > 20) {
      report.recommendations.push('High connection count - consider connection pooling');
    }

    console.log('🏥 Database Health Report:');
    console.log(`   Size: ${report.database_size.size}`);
    console.log(`   Active Connections: ${report.active_connections.active_connections}`);
    console.log(`   Largest Tables:`);
    report.table_sizes.slice(0, 3).forEach(table => {
      console.log(`     ${table.tablename}: ${table.size}`);
    });

    if (report.recommendations.length > 0) {
      console.log(`   Recommendations:`);
      report.recommendations.forEach(rec => console.log(`     • ${rec}`));
    }

    return report;
  }

  async close() {
    await this.pool.end();
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'optimize';
  const manager = new DatabaseManager();

  try {
    switch (command) {
      case 'optimize':
        await manager.runOptimizationSuite();
        break;
      case 'health':
        await manager.generateHealthReport();
        break;
      case 'indexes':
        await manager.optimizeIndexes();
        break;
      case 'stats':
        await manager.updateStatistics();
        break;
      default:
        console.log('Usage: node db-manager.js [optimize|health|indexes|stats]');
    }
  } catch (error) {
    console.error('Database management error:', error);
    process.exit(1);
  } finally {
    await manager.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default DatabaseManager;
