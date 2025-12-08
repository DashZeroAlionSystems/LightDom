import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://lightdom:lightdom@localhost:5432/lightdom'
});

// Get complete dashboard data
router.get('/complete', async (req, res) => {
  try {
    // Mock dashboard data for now - replace with real data aggregation
    const dashboardData = {
      timestamp: new Date().toISOString(),
      services: {
        crawler: {
          crawledCount: Math.floor(Math.random() * 1000) + 500,
          discoveredCount: Math.floor(Math.random() * 2000) + 1000,
          avgSeoScore: (Math.random() * 20 + 80).toFixed(1),
          status: 'active'
        },
        mining: {
          activeWorkers: Math.floor(Math.random() * 10) + 1,
          hashRate: Math.floor(Math.random() * 1000) + 500,
          status: 'active'
        },
        blockchain: {
          totalNodes: Math.floor(Math.random() * 50) + 10,
          totalTransactions: Math.floor(Math.random() * 10000) + 5000,
          status: 'active'
        },
        spaceMining: {
          totalSpaceMined: Math.floor(Math.random() * 1000) + 100,
          efficiency: Math.floor(Math.random() * 30) + 70,
          status: 'active'
        },
        metaverse: {
          activeSessions: Math.floor(Math.random() * 100) + 20,
          engagementScore: (Math.random() * 30 + 70).toFixed(1),
          status: 'active'
        },
        seo: {
          averageRank: Math.floor(Math.random() * 50) + 1,
          trafficScore: Math.floor(Math.random() * 50) + 50,
          status: 'active'
        }
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get database activity status
router.get('/database-activity', async (req, res) => {
  try {
    // Check for recent activity in key tables
    const tables = [
      'agent_sessions',
      'agent_instances',
      'agent_messages',
      'agent_executions',
      'workflow_steps'
    ];

    let totalRows = 0;
    const activeTables: string[] = [];
    let lastActivity = new Date(0);

    for (const table of tables) {
      try {
        // Get total row count
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        const rowCount = parseInt(countResult.rows[0].count);
        totalRows += rowCount;

        // Check for recent activity (last 5 minutes)
        const activityResult = await pool.query(`
          SELECT MAX(updated_at) as last_update, MAX(created_at) as last_create
          FROM ${table}
        `);

        const lastUpdate = activityResult.rows[0].last_update;
        const lastCreate = activityResult.rows[0].last_create;

        const mostRecent = new Date(Math.max(
          new Date(lastUpdate || 0).getTime(),
          new Date(lastCreate || 0).getTime()
        ));

        if (mostRecent > new Date(Date.now() - 5 * 60 * 1000)) { // Active in last 5 minutes
          activeTables.push(table);
        }

        if (mostRecent > lastActivity) {
          lastActivity = mostRecent;
        }
      } catch (error) {
        console.warn(`Could not check table ${table}:`, error.message);
      }
    }

    const isActive = activeTables.length > 0 && (new Date() - lastActivity) < 10 * 60 * 1000; // Active if activity in last 10 minutes

    res.json({
      isActive,
      lastActivity: lastActivity.toISOString(),
      activeTables,
      totalRows,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database activity check error:', error);
    res.status(500).json({
      error: 'Failed to check database activity',
      isActive: false,
      lastActivity: new Date().toISOString(),
      activeTables: [],
      totalRows: 0
    });
  }
});

export default router;
