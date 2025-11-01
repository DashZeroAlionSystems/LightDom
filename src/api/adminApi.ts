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
   * Create a new user
   */
  async createUser(req: Request, res: Response) {
    try {
      const { username, email, role, subscription } = req.body;

      // In production, create user in database
      const newUser = {
        id: Date.now().toString(),
        walletAddress: null,
        username,
        email,
        role: role || 'user',
        subscription: {
          plan: subscription?.plan || 'free',
          status: 'active',
          expiresAt: subscription?.expiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        stats: {
          reputation: 0,
          optimizations: 0,
          spaceSaved: 0
        },
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      };

      res.json({
        success: true,
        user: newUser,
        message: 'User created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create user'
      });
    }
  }

  /**
   * Update user
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { username, email, role, status, subscription } = req.body;

      // In production, update user in database
      const updatedUser = {
        id: userId,
        username,
        email,
        role,
        status,
        subscription,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        user: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update user'
      });
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // In production, delete user from database
      res.json({
        success: true,
        message: `User ${userId} deleted successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete user'
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
   * Get all content (pages, media, posts)
   */
  async getContent(req: Request, res: Response) {
    try {
      const { type, page = 1, limit = 20, search } = req.query;

      // Mock content data
      const content = [
        {
          id: '1',
          title: 'Getting Started Guide',
          type: 'page',
          status: 'published',
          author: 'Admin',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          views: 1250,
          url: '/guides/getting-started'
        },
        {
          id: '2',
          title: 'API Documentation',
          type: 'page',
          status: 'draft',
          author: 'Dev Team',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          views: 0,
          url: '/docs/api'
        },
        {
          id: '3',
          title: 'hero-banner.jpg',
          type: 'media',
          status: 'published',
          author: 'Marketing',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          size: 2048576,
          url: '/media/hero-banner.jpg'
        }
      ];

      res.json({
        success: true,
        content,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: content.length,
          pages: Math.ceil(content.length / parseInt(limit as string))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get content'
      });
    }
  }

  /**
   * Create content
   */
  async createContent(req: Request, res: Response) {
    try {
      const { title, type, content, status, url } = req.body;

      const newContent = {
        id: Date.now().toString(),
        title,
        type,
        content,
        status: status || 'draft',
        url,
        author: 'Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        content: newContent,
        message: 'Content created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create content'
      });
    }
  }

  /**
   * Update content
   */
  async updateContent(req: Request, res: Response) {
    try {
      const { contentId } = req.params;
      const updates = req.body;

      const updatedContent = {
        id: contentId,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        content: updatedContent,
        message: 'Content updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update content'
      });
    }
  }

  /**
   * Delete content
   */
  async deleteContent(req: Request, res: Response) {
    try {
      const { contentId } = req.params;

      res.json({
        success: true,
        message: `Content ${contentId} deleted successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete content'
      });
    }
  }

  /**
   * Get SEO campaigns and data
   */
  async getSEOCampaigns(req: Request, res: Response) {
    try {
      const campaigns = [
        {
          id: '1',
          name: 'Product Launch SEO',
          keywords: ['lightdom platform', 'web optimization', 'blockchain mining'],
          status: 'active',
          targetUrl: 'https://lightdom.com/products',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          metrics: {
            impressions: 15420,
            clicks: 1240,
            ctr: 8.04,
            position: 12.5
          }
        },
        {
          id: '2',
          name: 'Brand Awareness',
          keywords: ['lightdom', 'decentralized web', 'dom optimization'],
          status: 'draft',
          targetUrl: 'https://lightdom.com/',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          metrics: {
            impressions: 0,
            clicks: 0,
            ctr: 0,
            position: 0
          }
        }
      ];

      res.json({
        success: true,
        campaigns
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get SEO campaigns'
      });
    }
  }

  /**
   * Create SEO campaign
   */
  async createSEOCampaign(req: Request, res: Response) {
    try {
      const { name, keywords, targetUrl } = req.body;

      const newCampaign = {
        id: Date.now().toString(),
        name,
        keywords,
        targetUrl,
        status: 'draft',
        createdAt: new Date().toISOString(),
        metrics: {
          impressions: 0,
          clicks: 0,
          ctr: 0,
          position: 0
        }
      };

      res.json({
        success: true,
        campaign: newCampaign,
        message: 'SEO campaign created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create SEO campaign'
      });
    }
  }

  /**
   * Update SEO campaign
   */
  async updateSEOCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;
      const updates = req.body;

      const updatedCampaign = {
        id: campaignId,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        campaign: updatedCampaign,
        message: 'SEO campaign updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update SEO campaign'
      });
    }
  }

  /**
   * Delete SEO campaign
   */
  async deleteSEOCampaign(req: Request, res: Response) {
    try {
      const { campaignId } = req.params;

      res.json({
        success: true,
        message: `SEO campaign ${campaignId} deleted successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete SEO campaign'
      });
    }
  }

  /**
   * Start SEO crawler
   */
  async startSEOCrawler(req: Request, res: Response) {
    try {
      const { urls, keywords } = req.body;

      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        res.status(400).json({
          success: false,
          error: 'URLs array is required'
        });
        return;
      }

      // Import the SEO crawler service
      const { seoCrawler } = await import('../services/SEOCrawler');

      // Start crawling
      const jobId = await seoCrawler.startCrawling(urls, keywords || []);

      // Listen for crawl events
      seoCrawler.on('urlCrawled', (data) => {
        console.log(`Crawled: ${data.url}`);
      });

      seoCrawler.on('crawlCompleted', (data) => {
        console.log(`Crawl completed: ${data.jobId}, ${data.results.length} URLs, ${data.trainingDataCount} training samples`);
      });

      seoCrawler.on('crawlError', (data) => {
        console.error(`Crawl error for ${data.url}: ${data.error}`);
      });

      res.json({
        success: true,
        message: 'SEO crawler started successfully',
        jobId,
        urls: urls.length,
        keywords: keywords?.length || 0
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to start SEO crawler'
      });
    }
  }

  /**
   * Get crawler status
   */
  async getCrawlerStatus(req: Request, res: Response) {
    try {
      const { seoCrawler } = await import('../services/SEOCrawler');
      const status = seoCrawler.getStatus();
      const trainingData = seoCrawler.getTrainingData();

      res.json({
        success: true,
        status: {
          isRunning: status.isRunning,
          activeJobs: status.activeJobs,
          completedJobs: 0, // Would track this in production
          failedJobs: 0, // Would track this in production
          currentUrls: [], // Would track this in production
          trainingDataGenerated: trainingData.length,
          config: status.config
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get crawler status'
      });
    }
  }

  /**
   * Get blockchain statistics
   */
  async getBlockchainStats(req: Request, res: Response) {
    try {
      const stats = {
        blockHeight: 15420,
        activeMiners: 89,
        networkHashrate: 1234,
        totalTransactions: 45678,
        averageBlockTime: 12.5,
        networkDifficulty: 1024,
        totalSupply: 1000000,
        circulatingSupply: 750000
      };

      res.json({
        success: true,
        stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get blockchain stats'
      });
    }
  }

  /**
   * Get billing data
   */
  async getBillingData(req: Request, res: Response) {
    try {
      const { period = 'monthly' } = req.query;

      const billing = {
        revenue: {
          monthly: 45678,
          yearly: 548136,
          growth: 15.3
        },
        subscriptions: {
          active: 142,
          cancelled: 23,
          trial: 45
        },
        invoices: {
          pending: 12,
          overdue: 3,
          paid: 234
        },
        plans: [
          { name: 'Free', users: 567, revenue: 0 },
          { name: 'Pro', users: 89, revenue: 2670 },
          { name: 'Enterprise', users: 23, revenue: 13800 }
        ]
      };

      res.json({
        success: true,
        billing
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get billing data'
      });
    }
  }

  /**
   * Create invoice
   */
  async createInvoice(req: Request, res: Response) {
    try {
      const { customerId, amount, description } = req.body;

      const invoice = {
        id: Date.now().toString(),
        customerId,
        amount,
        description,
        status: 'pending',
        createdAt: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      res.json({
        success: true,
        invoice,
        message: 'Invoice created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create invoice'
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
   * Create automation job
   */
  async createAutomationJob(req: Request, res: Response) {
    try {
      const { name, type, schedule } = req.body;

      const newJob = {
        id: Date.now().toString(),
        name,
        type,
        schedule,
        status: 'idle',
        createdAt: new Date().toISOString()
      };

      res.json({
        success: true,
        job: newJob,
        message: 'Automation job created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create automation job'
      });
    }
  }

  /**
   * Update automation job
   */
  async updateAutomationJob(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const updates = req.body;

      const updatedJob = {
        id: jobId,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        job: updatedJob,
        message: 'Automation job updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to update automation job'
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

  // User management
  app.get('/api/admin/users', requireAdmin, adminAPI.getUsers);
  app.post('/api/admin/users', requireAdmin, adminAPI.createUser);
  app.put('/api/admin/users/:userId', requireAdmin, adminAPI.updateUser);
  app.delete('/api/admin/users/:userId', requireAdmin, adminAPI.deleteUser);
  app.post('/api/admin/users/:userId/:action', requireAdmin, adminAPI.userAction);
  app.post('/api/admin/users/bulk-action', requireAdmin, adminAPI.bulkUserAction);

  // Content management
  app.get('/api/admin/content', requireAdmin, adminAPI.getContent);
  app.post('/api/admin/content', requireAdmin, adminAPI.createContent);
  app.put('/api/admin/content/:contentId', requireAdmin, adminAPI.updateContent);
  app.delete('/api/admin/content/:contentId', requireAdmin, adminAPI.deleteContent);

  // SEO management
  app.get('/api/admin/seo/campaigns', requireAdmin, adminAPI.getSEOCampaigns);
  app.post('/api/admin/seo/campaigns', requireAdmin, adminAPI.createSEOCampaign);
  app.put('/api/admin/seo/campaigns/:campaignId', requireAdmin, adminAPI.updateSEOCampaign);
  app.delete('/api/admin/seo/campaigns/:campaignId', requireAdmin, adminAPI.deleteSEOCampaign);
  app.post('/api/admin/seo/crawler/start', requireAdmin, adminAPI.startSEOCrawler);
  app.get('/api/admin/seo/crawler/status', requireAdmin, adminAPI.getCrawlerStatus);

  // Blockchain management
  app.get('/api/admin/blockchain/stats', requireAdmin, adminAPI.getBlockchainStats);

  // Billing management
  app.get('/api/admin/billing', requireAdmin, adminAPI.getBillingData);
  app.post('/api/admin/billing/invoices', requireAdmin, adminAPI.createInvoice);

  // Automation management
  app.get('/api/admin/automation/jobs', requireAdmin, adminAPI.getAutomationJobs);
  app.post('/api/admin/automation/jobs', requireAdmin, adminAPI.createAutomationJob);
  app.put('/api/admin/automation/jobs/:jobId', requireAdmin, adminAPI.updateAutomationJob);
  app.get('/api/admin/automation/metrics', requireAdmin, adminAPI.getAutomationMetrics);
  app.post('/api/admin/automation/jobs/:jobId/:action', requireAdmin, adminAPI.jobAction);
}


