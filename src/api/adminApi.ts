/**
 * Admin API Endpoints
 * Handles all administrative functions
 */

import { Request, Response, NextFunction } from 'express';
// Server-only imports will be required dynamically inside handlers when needed
import { automationIntegration } from '../services/AutomationIntegration';
import { configurationIntegration } from '../services/ConfigurationIntegration';

// Admin middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Admin access required' 
    });
  }
  next();
};

export class AdminAPI {
  /**
   * Get system health status
   */
  async getSystemHealth(req: Request, res: Response) {
    try {
      const health = {
        api: {
          status: 'healthy',
          latency: Math.round(Math.random() * 50) + 10
        },
        database: {
          status: 'healthy',
          connections: 15
        },
        blockchain: {
          status: 'healthy',
          blockHeight: 12345
        },
        automation: {
          status: 'healthy',
          runningJobs: 3
        }
      };
      
      res.json({ success: true, data: health });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get system health' 
      });
    }
  }
  
  /**
   * Get quick stats for admin dashboard
   */
  async getQuickStats(req: Request, res: Response) {
    try {
      const { databaseIntegration } = await import('../services/DatabaseIntegration');
      await databaseIntegration?.initialize?.();
      const stats = await databaseIntegration?.getSystemStats?.() || {} as any;
      
      const quickStats = {
        totalUsers: parseInt(stats.total_users) || 0,
        activeUsers: Math.floor((parseInt(stats.total_users) || 0) * 0.7),
        revenue: 15420, // Mock data - would come from billing system
        optimizations: parseInt(stats.total_optimizations) || 0,
        spaceSaved: parseInt(stats.total_space_saved) || 0,
        activeMiners: 12 // Mock data
      };
      
      res.json({ success: true, data: quickStats });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get quick stats' 
      });
    }
  }
  
  /**
   * Get all users with pagination and filters
   */
  async getUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, search, plan, status } = req.query;
      
      // Mock user data - in production, query from database
      const users = [
        {
          id: '1',
          walletAddress: '0x1234567890123456789012345678901234567890',
          username: 'alice_doe',
          email: 'alice@example.com',
          role: 'user',
          subscription: {
            plan: 'pro',
            status: 'active',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          stats: {
            reputation: 850,
            optimizations: 45,
            spaceSaved: 10485760
          },
          status: 'active',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          walletAddress: '0x0987654321098765432109876543210987654321',
          username: 'bob_smith',
          email: 'bob@example.com',
          role: 'user',
          subscription: {
            plan: 'free',
            status: 'active',
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          },
          stats: {
            reputation: 120,
            optimizations: 8,
            spaceSaved: 2097152
          },
          status: 'active',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          walletAddress: null,
          username: 'charlie_admin',
          email: 'charlie@lightdom.com',
          role: 'admin',
          subscription: {
            plan: 'admin',
            status: 'active',
            expiresAt: null
          },
          stats: {
            reputation: 2000,
            optimizations: 150,
            spaceSaved: 52428800
          },
          status: 'active',
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          lastActive: new Date().toISOString()
        }
      ];
      
      res.json({ 
        success: true, 
        users,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: users.length,
          pages: Math.ceil(users.length / parseInt(limit as string))
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get users' 
      });
    }
  }
  
  /**
   * User actions (suspend, activate, etc.)
   */
  async userAction(req: Request, res: Response) {
    try {
      const { userId, action } = req.params;
      
      // In production, update user in database
      console.log(`Admin action: ${action} on user ${userId}`);
      
      res.json({ 
        success: true, 
        message: `User ${action} successful` 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: `Failed to ${req.params.action} user` 
      });
    }
  }
  
  /**
   * Bulk user actions
   */
  async bulkUserAction(req: Request, res: Response) {
    try {
      const { action, userIds } = req.body;
      
      // In production, update users in database
      console.log(`Bulk action: ${action} on ${userIds.length} users`);
      
      res.json({ 
        success: true, 
        message: `Bulk ${action} successful`,
        affected: userIds.length
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to perform bulk action' 
      });
    }
  }
  
  /**
   * Get automation jobs
   */
  async getAutomationJobs(req: Request, res: Response) {
    try {
      const status = await automationIntegration.getStatus();
      
      // Mock job data
      const jobs = [
        {
          id: 'compliance-check',
          name: 'Compliance Check',
          type: 'compliance',
          status: 'idle',
          schedule: '0 */6 * * *',
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          nextRun: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'quality-gates',
          name: 'Quality Gates',
          type: 'quality',
          status: 'running',
          lastRun: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          duration: 15000
        }
      ];
      
      res.json({ success: true, jobs });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get automation jobs' 
      });
    }
  }
  
  /**
   * Get automation metrics
   */
  async getAutomationMetrics(req: Request, res: Response) {
    try {
      const metrics = {
        totalRuns: 245,
        successfulRuns: 238,
        failedRuns: 7,
        averageDuration: 12500,
        uptime: 99.7
      };
      
      res.json({ success: true, metrics });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get automation metrics' 
      });
    }
  }
  
  /**
   * Job actions (run, stop, delete)
   */
  async jobAction(req: Request, res: Response) {
    try {
      const { jobId, action } = req.params;
      
      console.log(`Job action: ${action} on job ${jobId}`);
      
      if (action === 'run') {
        // Trigger the actual automation
        if (jobId === 'compliance-check') {
          automationIntegration.runComplianceCheck();
        } else if (jobId === 'quality-gates') {
          automationIntegration.runQualityGates();
        }
      }
      
      res.json({ 
        success: true, 
        message: `Job ${action} successful` 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: `Failed to ${req.params.action} job` 
      });
    }
  }
}

// Export routes function
export function setupAdminRoutes(app: any) {
  const adminAPI = new AdminAPI();
  
  // All admin routes require admin authentication
  app.get('/api/admin/system-health', requireAdmin, adminAPI.getSystemHealth);
  app.get('/api/admin/quick-stats', requireAdmin, adminAPI.getQuickStats);
  app.get('/api/admin/users', requireAdmin, adminAPI.getUsers);
  app.post('/api/admin/users/:userId/:action', requireAdmin, adminAPI.userAction);
  app.post('/api/admin/users/bulk-action', requireAdmin, adminAPI.bulkUserAction);
  app.get('/api/automation/jobs', requireAdmin, adminAPI.getAutomationJobs);
  app.get('/api/automation/metrics', requireAdmin, adminAPI.getAutomationMetrics);
  app.post('/api/automation/jobs/:jobId/:action', requireAdmin, adminAPI.jobAction);
}


