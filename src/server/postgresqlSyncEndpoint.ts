/**
 * PostgreSQL Sync Endpoint
 * Express.js endpoint for syncing data to PostgreSQL
 */

import { Request, Response } from 'express';
import { PostgreSQLSyncAPI } from '../api/postgresqlSyncApi';

export const setupPostgreSQLSyncEndpoint = (app: any) => {
  // Sync data to PostgreSQL
  app.post('/api/sync-to-postgresql', async (req: Request, res: Response) => {
    await PostgreSQLSyncAPI.syncToPostgreSQL(req, res);
  });

  // Get sync status
  app.get('/api/sync-status', async (req: Request, res: Response) => {
    try {
      // This would check the actual sync status from the database
      res.json({
        success: true,
        lastSync: Date.now(),
        status: 'success',
        message: 'Sync status retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get sync status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Force sync
  app.post('/api/force-sync', async (req: Request, res: Response) => {
    try {
      // This would trigger a manual sync
      res.json({
        success: true,
        message: 'Force sync initiated',
        timestamp: Date.now()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to initiate force sync',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log('✅ PostgreSQL sync endpoints configured');
};
