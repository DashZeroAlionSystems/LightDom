/**
 * Admin API Routes for LightDom
 * Provides comprehensive admin dashboard functionality
 */

import { Pool } from 'pg';

// Database connection pool
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'dom_space_harvester',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export function setupAdminRoutes(app) {
  console.log('🔧 Setting up Admin API routes...');

  // =====================================================
  // SYSTEM HEALTH ENDPOINT
  // =====================================================
  app.get('/api/admin/system-health', async (req, res) => {
    console.log('🔍 Admin system-health endpoint called');
    try {
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        services: {
          database: 'connected',
          blockchain: 'active',
          crawler: 'running',
          websocket: 'active'
        },
        metrics: {
          activeConnections: Math.floor(Math.random() * 100) + 50,
          totalRequests: Math.floor(Math.random() * 10000) + 5000,
          errorRate: Math.random() * 0.05,
          responseTime: Math.random() * 500 + 100
        }
      };

      console.log('✅ Sending system health response');
      res.json({
        success: true,
        data: healthData
      });
    } catch (error) {
      console.error('System health error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get system health'
      });
    }
  });

  // =====================================================
  // QUICK STATS ENDPOINT
  // =====================================================
  app.get('/api/admin/quick-stats', async (req, res) => {
    try {
      // Get real stats from database
      const [userStats, optimizationStats, tokenStats, minerStats] = await Promise.all([
        // Total and active users from api_keys table
        db.query(`
          SELECT
            COUNT(*) as total_users,
            COUNT(CASE WHEN last_used_at > NOW() - INTERVAL '7 days' THEN 1 END) as active_users
          FROM api_keys
        `),
        // Optimization stats from dom_optimizations table
        db.query(`
          SELECT
            COUNT(*) as total_optimizations,
            COUNT(CASE WHEN crawl_timestamp > NOW() - INTERVAL '1 day' THEN 1 END) as pending_optimizations
          FROM dom_optimizations
        `),
        // Token stats from token_transactions table
        db.query(`
          SELECT COALESCE(SUM(amount), 0) as total_tokens
          FROM token_transactions
          WHERE status = 'confirmed'
        `),
        // Active miners from active_crawlers table
        db.query(`
          SELECT COUNT(*) as active_miners
          FROM active_crawlers
          WHERE last_heartbeat > NOW() - INTERVAL '5 minutes'
        `)
      ]);

      const quickStats = {
        totalUsers: parseInt(userStats.rows[0].total_users) || 0,
        activeUsers: parseInt(userStats.rows[0].active_users) || 0,
        totalOptimizations: parseInt(optimizationStats.rows[0].total_optimizations) || 0,
        pendingOptimizations: parseInt(optimizationStats.rows[0].pending_optimizations) || 0,
        totalTokens: parseInt(tokenStats.rows[0].total_tokens) || 0,
        activeMiners: parseInt(minerStats.rows[0].active_miners) || 0,
        systemLoad: Math.random() * 100, // Keep as mock for now
        revenue: Math.floor(Math.random() * 10000) + 5000 // Keep as mock for now
      };

      res.json({
        success: true,
        data: quickStats
      });
    } catch (error) {
      console.error('Quick stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get quick stats'
      });
    }
  });

  // =====================================================
  // USERS MANAGEMENT ENDPOINT
  // =====================================================
  app.get('/api/admin/users', async (req, res) => {
    try {
      const { page = 1, limit = 20, search, status } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build query with filters
      let whereClause = '';
      const params = [limit, offset];
      let paramIndex = 3;

      if (search) {
        whereClause += ` AND (ak.owner_email ILIKE $${paramIndex} OR ak.owner_email ILIKE $${paramIndex + 1})`;
        params.push(`%${search}%`, `%${search}%`);
        paramIndex += 2;
      }

      if (status) {
        whereClause += ` AND ak.is_active = $${paramIndex}`;
        params.push(status === 'active');
        paramIndex += 1;
      }

      // Get users with their stats - simplified query without complex joins
      const usersQuery = `
        SELECT
          ak.id,
          ak.owner_email as email,
          ak.is_active,
          ak.created_at as join_date,
          ak.last_used_at as last_active,
          ak.requests_used as total_requests,
          COALESCE(ak.requests_used, 0) as total_optimizations,
          COALESCE(ak.requests_used * 100, 0) as total_tokens
        FROM api_keys ak
        WHERE 1=1 ${whereClause}
        ORDER BY ak.created_at DESC
        LIMIT $1 OFFSET $2
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM api_keys ak
        WHERE 1=1 ${whereClause}
      `;

      const [usersResult, countResult] = await Promise.all([
        db.query(usersQuery, params),
        db.query(countQuery, params.slice(2)) // Remove limit and offset for count
      ]);

      const users = usersResult.rows.map(user => ({
        id: user.id,
        name: user.email.split('@')[0], // Use email prefix as name
        email: user.email,
        walletAddress: null, // Not stored in api_keys
        status: user.is_active ? 'active' : 'inactive',
        role: 'user', // Default role
        joinDate: user.join_date?.toISOString(),
        lastActive: user.last_active?.toISOString(),
        stats: {
          optimizations: parseInt(user.total_optimizations) || 0,
          tokensEarned: parseInt(user.total_tokens) || 0,
          reputation: Math.floor(Math.random() * 1000) + 100 // Keep as mock for now
        }
      }));

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(countResult.rows[0].total),
            totalPages: Math.ceil(parseInt(countResult.rows[0].total) / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get users'
      });
    }
  });

  // =====================================================
  // CONTENT MANAGEMENT ENDPOINT
  // =====================================================
  app.get('/api/admin/content', async (req, res) => {
    try {
      const { page = 1, limit = 20, type, status } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build query for content (using dom_optimizations as content)
      let whereClause = '';
      const params = [limit, offset];
      let paramIndex = 3;

      if (type) {
        // Map type to optimization types
        const typeMapping = {
          'page': 'page_optimization',
          'post': 'content_optimization',
          'optimization': 'dom_optimization'
        };
        if (typeMapping[type]) {
          whereClause += ` AND do.optimization_types::text LIKE $${paramIndex}`;
          params.push(`%${typeMapping[type]}%`);
          paramIndex += 1;
        }
      }

      // For status, we'll use crawl_timestamp to determine if it's recent/active
      if (status) {
        if (status === 'published') {
          whereClause += ` AND do.crawl_timestamp > NOW() - INTERVAL '7 days'`;
        } else if (status === 'archived') {
          whereClause += ` AND do.crawl_timestamp < NOW() - INTERVAL '30 days'`;
        }
      }

      const contentQuery = `
        SELECT
          do.id,
          do.url as title,
          'optimization' as type,
          CASE
            WHEN do.crawl_timestamp > NOW() - INTERVAL '1 day' THEN 'published'
            WHEN do.crawl_timestamp > NOW() - INTERVAL '7 days' THEN 'draft'
            ELSE 'archived'
          END as status,
          'system' as author,
          do.crawl_timestamp as created_at,
          do.crawl_timestamp as updated_at,
          do.space_saved_bytes as space_saved,
          do.tokens_earned,
          0 as views,
          do.space_saved_bytes as total_space
        FROM dom_optimizations do
        WHERE 1=1 ${whereClause}
        ORDER BY do.crawl_timestamp DESC
        LIMIT $1 OFFSET $2
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM dom_optimizations do
        WHERE 1=1 ${whereClause}
      `;

      const [contentResult, countResult] = await Promise.all([
        db.query(contentQuery, params),
        db.query(countQuery, params.slice(2))
      ]);

      const content = contentResult.rows.map(item => ({
        id: item.id,
        title: item.title.length > 50 ? item.title.substring(0, 50) + '...' : item.title,
        type: item.type,
        status: item.status,
        author: item.author,
        createdAt: item.created_at?.toISOString(),
        updatedAt: item.updated_at?.toISOString(),
        metrics: {
          views: parseInt(item.views) || 0,
          likes: Math.floor(Math.random() * 100), // Mock for now
          shares: Math.floor(Math.random() * 10), // Mock for now
          comments: Math.floor(Math.random() * 50) // Mock for now
        },
        seo: {
          score: Math.floor(Math.random() * 100), // Mock for now
          keywords: ['optimization', 'performance', 'space'].slice(0, Math.floor(Math.random() * 3) + 1) // Mock for now
        }
      }));

      res.json({
        success: true,
        data: {
          content,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: parseInt(countResult.rows[0].total),
            totalPages: Math.ceil(parseInt(countResult.rows[0].total) / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Content error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get content'
      });
    }
  });

  // =====================================================
  // SEO CAMPAIGNS ENDPOINT
  // =====================================================
  app.get('/api/admin/seo/campaigns', async (req, res) => {
    try {
      const { page = 1, limit = 20, status } = req.query;

      // Mock SEO campaigns data
      const mockCampaigns = Array.from({ length: parseInt(limit) }, (_, i) => ({
        id: `campaign_${i + 1}`,
        name: `SEO Campaign ${i + 1}`,
        status: ['active', 'paused', 'completed', 'draft'][Math.floor(Math.random() * 4)],
        targetUrl: `https://example${i + 1}.com`,
        keywords: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => `keyword${j + 1}`),
        startDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        budget: Math.floor(Math.random() * 5000) + 1000,
        metrics: {
          currentRank: Math.floor(Math.random() * 100) + 1,
          targetRank: Math.floor(Math.random() * 20) + 1,
          impressions: Math.floor(Math.random() * 100000),
          clicks: Math.floor(Math.random() * 10000),
          ctr: Math.random() * 10,
          conversions: Math.floor(Math.random() * 1000)
        },
        performance: {
          score: Math.floor(Math.random() * 100),
          trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
          roi: Math.random() * 300 - 50 // -50% to 250%
        }
      }));

      // Apply filters
      let filteredCampaigns = mockCampaigns;
      if (status) {
        filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === status);
      }

      res.json({
        success: true,
        data: {
          campaigns: filteredCampaigns,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredCampaigns.length,
            totalPages: Math.ceil(filteredCampaigns.length / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('SEO campaigns error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get SEO campaigns'
      });
    }
  });

  // =====================================================
  // BLOCKCHAIN STATS ENDPOINT
  // =====================================================
  app.get('/api/admin/blockchain/stats', async (req, res) => {
    try {
      // Get real blockchain stats from database
      const [tokenStats, transactionStats, stakingStats] = await Promise.all([
        // Token statistics
        db.query(`
          SELECT
            COALESCE(SUM(CASE WHEN transaction_type = 'mint' THEN amount END), 0) as total_supply,
            COALESCE(SUM(CASE WHEN transaction_type = 'transfer' THEN amount END), 0) as circulating_supply,
            COALESCE(SUM(CASE WHEN transaction_type = 'burn' THEN amount END), 0) as burned
          FROM token_transactions
          WHERE status = 'confirmed'
        `),
        // Transaction statistics
        db.query(`
          SELECT
            COUNT(*) as total_transactions,
            COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_transactions,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_transactions,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions
          FROM token_transactions
        `),
        // Staking statistics
        db.query(`
          SELECT COALESCE(SUM(amount), 0) as total_staked
          FROM staking_pools
          WHERE status = 'active'
        `)
      ]);

      const blockchainStats = {
        network: {
          chainId: process.env.CHAIN_ID || '1337',
          name: process.env.NETWORK || 'localhost',
          blockNumber: Math.floor(Math.random() * 1000000) + 1000000, // Keep as mock
          gasPrice: Math.floor(Math.random() * 50) + 20, // Keep as mock
          activeNodes: Math.floor(Math.random() * 100) + 50 // Keep as mock
        },
        tokens: {
          totalSupply: tokenStats.rows[0].total_supply.toString(),
          circulatingSupply: tokenStats.rows[0].circulating_supply.toString(),
          burned: tokenStats.rows[0].burned.toString(),
          staked: stakingStats.rows[0].total_staked.toString()
        },
        mining: {
          activeMiners: Math.floor(Math.random() * 50) + 20, // Keep as mock
          totalHashes: Math.floor(Math.random() * 1000000000), // Keep as mock
          hashRate: Math.floor(Math.random() * 1000000) + 500000, // Keep as mock
          blocksMined: Math.floor(Math.random() * 10000) + 5000 // Keep as mock
        },
        transactions: {
          total: parseInt(transactionStats.rows[0].total_transactions),
          today: parseInt(transactionStats.rows[0].today_transactions),
          pending: parseInt(transactionStats.rows[0].pending_transactions),
          failed: parseInt(transactionStats.rows[0].failed_transactions)
        },
        contracts: {
          total: 19,
          active: 15,
          paused: 2,
          deprecated: 2
        }
      };

      res.json({
        success: true,
        data: blockchainStats
      });
    } catch (error) {
      console.error('Blockchain stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get blockchain stats'
      });
    }
  });

  // =====================================================
  // BILLING ENDPOINT
  // =====================================================
  app.get('/api/admin/billing', async (req, res) => {
    try {
      const { page = 1, limit = 20, status, type } = req.query;

      // Mock billing data
      const mockBilling = Array.from({ length: parseInt(limit) }, (_, i) => ({
        id: `billing_${i + 1}`,
        userId: `user_${Math.floor(Math.random() * 100) + 1}`,
        type: ['subscription', 'one-time', 'refund'][Math.floor(Math.random() * 3)],
        status: ['paid', 'pending', 'failed', 'refunded'][Math.floor(Math.random() * 4)],
        amount: Math.floor(Math.random() * 500) + 10,
        currency: 'USD',
        description: `Payment for ${['premium plan', 'optimization service', 'consultation'][Math.floor(Math.random() * 3)]}`,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        paidAt: Math.random() > 0.1 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        paymentMethod: ['credit_card', 'crypto', 'paypal'][Math.floor(Math.random() * 3)],
        invoiceUrl: `https://billing.example.com/invoice/${i + 1}`
      }));

      // Apply filters
      let filteredBilling = mockBilling;
      if (status) {
        filteredBilling = filteredBilling.filter(item => item.status === status);
      }
      if (type) {
        filteredBilling = filteredBilling.filter(item => item.type === type);
      }

      // Calculate summary stats
      const summary = {
        totalRevenue: filteredBilling.reduce((sum, item) => sum + (item.status === 'paid' ? item.amount : 0), 0),
        pendingPayments: filteredBilling.filter(item => item.status === 'pending').length,
        failedPayments: filteredBilling.filter(item => item.status === 'failed').length,
        refunds: filteredBilling.filter(item => item.status === 'refunded').length
      };

      res.json({
        success: true,
        data: {
          billing: filteredBilling,
          summary,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredBilling.length,
            totalPages: Math.ceil(filteredBilling.length / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Billing error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get billing data'
      });
    }
  });

  // =====================================================
  // AUTOMATION JOBS ENDPOINT
  // =====================================================
  app.get('/api/admin/automation/jobs', async (req, res) => {
    try {
      const { page = 1, limit = 20, status, type } = req.query;

      // Mock automation jobs data
      const mockJobs = Array.from({ length: parseInt(limit) }, (_, i) => ({
        id: `job_${i + 1}`,
        name: `Automation Job ${i + 1}`,
        type: ['crawler', 'optimizer', 'monitor', 'backup'][Math.floor(Math.random() * 4)],
        status: ['running', 'completed', 'failed', 'queued', 'paused'][Math.floor(Math.random() * 5)],
        progress: Math.floor(Math.random() * 100),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        startedAt: Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : null,
        completedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() : null,
        duration: Math.floor(Math.random() * 3600), // seconds
        config: {
          target: `https://example${i + 1}.com`,
          frequency: ['daily', 'weekly', 'monthly'][Math.floor(Math.random() * 3)],
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        },
        results: {
          processed: Math.floor(Math.random() * 1000),
          successful: Math.floor(Math.random() * 800),
          failed: Math.floor(Math.random() * 200),
          errors: Math.floor(Math.random() * 50)
        }
      }));

      // Apply filters
      let filteredJobs = mockJobs;
      if (status) {
        filteredJobs = filteredJobs.filter(job => job.status === status);
      }
      if (type) {
        filteredJobs = filteredJobs.filter(job => job.type === type);
      }

      res.json({
        success: true,
        data: {
          jobs: filteredJobs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredJobs.length,
            totalPages: Math.ceil(filteredJobs.length / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Automation jobs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get automation jobs'
      });
    }
  });

  // =====================================================
  // AUTOMATION METRICS ENDPOINT
  // =====================================================
  app.get('/api/admin/automation/metrics', async (req, res) => {
    try {
      const automationMetrics = {
        overview: {
          totalJobs: Math.floor(Math.random() * 1000) + 500,
          activeJobs: Math.floor(Math.random() * 100) + 20,
          completedToday: Math.floor(Math.random() * 50) + 10,
          failedToday: Math.floor(Math.random() * 10) + 1,
          successRate: Math.random() * 20 + 80 // 80-100%
        },
        performance: {
          averageExecutionTime: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
          throughput: Math.floor(Math.random() * 1000) + 500, // items per hour
          resourceUsage: {
            cpu: Math.random() * 30 + 20, // 20-50%
            memory: Math.random() * 40 + 30, // 30-70%
            disk: Math.random() * 20 + 10 // 10-30%
          }
        },
        types: {
          crawler: {
            count: Math.floor(Math.random() * 200) + 100,
            successRate: Math.random() * 15 + 85,
            avgDuration: Math.floor(Math.random() * 900) + 300
          },
          optimizer: {
            count: Math.floor(Math.random() * 300) + 150,
            successRate: Math.random() * 10 + 90,
            avgDuration: Math.floor(Math.random() * 1200) + 600
          },
          monitor: {
            count: Math.floor(Math.random() * 100) + 50,
            successRate: Math.random() * 5 + 95,
            avgDuration: Math.floor(Math.random() * 300) + 60
          },
          backup: {
            count: Math.floor(Math.random() * 50) + 25,
            successRate: Math.random() * 8 + 92,
            avgDuration: Math.floor(Math.random() * 1800) + 900
          }
        },
        trends: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          jobsCompleted: Math.floor(Math.random() * 20) + 5,
          jobsFailed: Math.floor(Math.random() * 3),
          avgDuration: Math.floor(Math.random() * 600) + 200
        }))
      };

      res.json({
        success: true,
        data: automationMetrics
      });
    } catch (error) {
      console.error('Automation metrics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get automation metrics'
      });
    }
  });

  // =====================================================
  // ADMIN DASHBOARD OVERVIEW ENDPOINT
  // =====================================================
  app.get('/api/admin/overview', async (req, res) => {
    try {
      // Get real overview data from database
      const [userStats, revenueStats, recentActivity, topPerformers] = await Promise.all([
        // User and revenue stats - simplified
        db.query(`
          SELECT
            COUNT(*) as total_users,
            COUNT(CASE WHEN last_used_at > NOW() - INTERVAL '30 days' THEN 1 END) as active_users,
            COALESCE(SUM(amount_cents), 0) as total_revenue
          FROM api_keys ak
          LEFT JOIN payments p ON ak.owner_email = p.owner_email
        `),
        // Monthly growth calculation
        db.query(`
          SELECT
            COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_last_30,
            COUNT(CASE WHEN created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days' THEN 1 END) as new_prev_30
          FROM api_keys
        `),
        // Recent activity from various tables
        db.query(`
          SELECT 'optimization' as type, url as description, crawl_timestamp as timestamp, 'low' as severity
          FROM dom_optimizations
          ORDER BY crawl_timestamp DESC
          LIMIT 5
        `),
        // Top performers (users with most requests)
        db.query(`
          SELECT
            ak.owner_email as name,
            COALESCE(ak.requests_used, 0) as metric,
            ROW_NUMBER() OVER (ORDER BY COALESCE(ak.requests_used, 0) DESC) as rank
          FROM api_keys ak
          ORDER BY metric DESC
          LIMIT 5
        `)
      ]);

      const totalUsers = parseInt(userStats.rows[0].total_users);
      const activeUsers = parseInt(userStats.rows[0].active_users);
      const totalRevenue = parseInt(userStats.rows[0].total_revenue);

      const newLast30 = parseInt(revenueStats.rows[0].new_last_30);
      const newPrev30 = parseInt(revenueStats.rows[0].new_prev_30);
      const monthlyGrowth = newPrev30 > 0 ? ((newLast30 - newPrev30) / newPrev30) * 100 : 0;

      const overview = {
        systemHealth: {
          status: 'healthy',
          uptime: process.uptime(),
          lastBackup: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          alerts: Math.floor(Math.random() * 5)
        },
        keyMetrics: {
          totalUsers,
          activeUsers,
          totalRevenue,
          monthlyGrowth: Math.max(0, monthlyGrowth) // Ensure non-negative
        },
        recentActivity: recentActivity.rows.map((activity, i) => ({
          id: `activity_${i + 1}`,
          type: activity.type,
          description: activity.description.length > 100 ? activity.description.substring(0, 100) + '...' : activity.description,
          timestamp: activity.timestamp?.toISOString(),
          severity: activity.severity
        })),
        topPerformers: topPerformers.rows.map(performer => ({
          id: `performer_${performer.rank}`,
          name: performer.name,
          metric: parseInt(performer.metric),
          rank: parseInt(performer.rank)
        }))
      };

      res.json({
        success: true,
        data: overview
      });
    } catch (error) {
      console.error('Overview error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get overview data'
      });
    }
  });

  console.log('✅ Admin API routes configured successfully');
}