/**
 * SEO Service API Implementation
 * 
 * Core API endpoints for LightDom SEO service
 * Implements authentication, configuration, analytics, and management
 */

import express, { Request, Response, NextFunction, Router } from 'express';
import { Pool } from 'pg';
import { createClient } from 'redis';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';

// Types
interface SEOClient {
  id: string;
  userId: string;
  domain: string;
  apiKey: string;
  subscriptionTier: string;
  status: string;
}

interface APIConfig {
  database: {
    connectionString: string;
  };
  redis: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origins: string[];
  };
}

// Validation Schemas
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  company: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const createClientSchema = z.object({
  domain: z.string().url(),
  subscriptionTier: z.enum(['starter', 'professional', 'business', 'enterprise'])
});

const analyticsSchema = z.object({
  apiKey: z.string(),
  data: z.object({
    url: z.string(),
    pageTitle: z.string(),
    coreWebVitals: z.object({
      lcp: z.number().optional(),
      fid: z.number().optional(),
      cls: z.number().optional(),
      inp: z.number().optional(),
      ttfb: z.number().optional(),
      fcp: z.number().optional()
    }),
    userBehavior: z.object({
      timeOnPage: z.number(),
      scrollDepth: z.number(),
      interactions: z.number()
    }),
    performance: z.object({
      loadTime: z.number(),
      domContentLoaded: z.number(),
      firstPaint: z.number()
    })
  })
});

export class SEOServiceAPI {
  private app: express.Application;
  private router: Router;
  private db: Pool;
  private redis: any;
  private config: APIConfig;

  constructor(config: APIConfig) {
    this.config = config;
    this.app = express();
    this.router = Router();
    this.db = new Pool({ connectionString: config.database.connectionString });
    this.redis = createClient({ url: config.redis.url });
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (origin && this.config.cors.origins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
      }
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-SDK-Version');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });

    // Error handling
    this.app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check
    this.router.get('/health', this.healthCheck.bind(this));

    // Authentication
    this.router.post('/auth/signup', this.signup.bind(this));
    this.router.post('/auth/login', this.login.bind(this));
    this.router.post('/auth/refresh', this.authenticate.bind(this), this.refreshToken.bind(this));

    // SEO Configuration (Public - API key auth)
    this.router.get('/seo/config/:apiKey', this.rateLimitByTier.bind(this), this.getConfig.bind(this));
    this.router.post('/seo/analytics', this.rateLimitByTier.bind(this), this.submitAnalytics.bind(this));

    // Client Management (Auth required)
    this.router.post('/clients', this.authenticate.bind(this), this.createClient.bind(this));
    this.router.get('/clients/:clientId', this.authenticate.bind(this), this.getClient.bind(this));
    this.router.put('/clients/:clientId', this.authenticate.bind(this), this.updateClient.bind(this));
    this.router.delete('/clients/:clientId', this.authenticate.bind(this), this.deleteClient.bind(this));

    // Analytics Dashboard (Auth required)
    this.router.get('/analytics/overview', this.authenticate.bind(this), this.getAnalyticsOverview.bind(this));
    this.router.get('/analytics/keywords', this.authenticate.bind(this), this.getKeywordRankings.bind(this));
    this.router.get('/analytics/traffic', this.authenticate.bind(this), this.getTrafficMetrics.bind(this));

    // Mount router
    this.app.use('/api/v1', this.router);
  }

  /**
   * Middleware: JWT Authentication
   */
  private authenticate(req: Request, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, this.config.jwt.secret) as any;
      (req as any).user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  /**
   * Middleware: Rate limiting by subscription tier
   */
  private async rateLimitByTier(req: Request, res: Response, next: NextFunction): Promise<void> {
    const apiKey = req.params.apiKey || req.body.apiKey;
    
    if (!apiKey) {
      res.status(400).json({ error: 'API key required' });
      return;
    }

    try {
      // Get client tier from database
      const result = await this.db.query(
        'SELECT subscription_tier FROM seo_clients WHERE api_key = $1',
        [apiKey]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Invalid API key' });
        return;
      }

      const tier = result.rows[0].subscription_tier;
      
      // Apply rate limits based on tier
      const limits: Record<string, number> = {
        starter: 100,      // 100 req/min
        professional: 500,  // 500 req/min
        business: 2000,     // 2000 req/min
        enterprise: 10000   // 10000 req/min
      };

      const limit = limits[tier] || 100;
      
      // Check Redis for rate limit
      const key = `ratelimit:${apiKey}:${Math.floor(Date.now() / 60000)}`;
      const count = await this.redis.incr(key);
      await this.redis.expire(key, 60);

      if (count > limit) {
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
      }

      next();
    } catch (error) {
      console.error('Rate limit error:', error);
      next();
    }
  }

  /**
   * Health check endpoint
   */
  private healthCheck(req: Request, res: Response): void {
    res.json({
      status: 'ok',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * User signup
   */
  private async signup(req: Request, res: Response): Promise<void> {
    try {
      const data = signupSchema.parse(req.body);
      
      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);
      
      // Create user
      const userResult = await this.db.query(
        'INSERT INTO users (email, password_hash, name, company) VALUES ($1, $2, $3, $4) RETURNING id, email, name',
        [data.email, passwordHash, data.name, data.company]
      );

      const user = userResult.rows[0];
      
      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        this.config.jwt.secret,
        { expiresIn: this.config.jwt.expiresIn }
      );

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        res.status(409).json({ error: 'Email already exists' });
      } else if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  }

  /**
   * User login
   */
  private async login(req: Request, res: Response): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);
      
      // Find user
      const result = await this.db.query(
        'SELECT id, email, name, password_hash FROM users WHERE email = $1',
        [data.email]
      );

      if (result.rows.length === 0) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const user = result.rows[0];
      
      // Verify password
      const valid = await bcrypt.compare(data.password, user.password_hash);
      
      if (!valid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        this.config.jwt.secret,
        { expiresIn: this.config.jwt.expiresIn }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
      }
    }
  }

  /**
   * Refresh JWT token
   */
  private refreshToken(req: Request, res: Response): void {
    const user = (req as any).user;
    
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      this.config.jwt.secret,
      { expiresIn: this.config.jwt.expiresIn }
    );

    res.json({ token });
  }

  /**
   * Get SEO configuration for API key
   */
  private async getConfig(req: Request, res: Response): Promise<void> {
    const { apiKey } = req.params;
    
    try {
      // Check cache first
      const cached = await this.redis.get(`config:${apiKey}`);
      if (cached) {
        res.json(JSON.parse(cached));
        return;
      }

      // Get from database
      const result = await this.db.query(`
        SELECT 
          c.id,
          c.domain,
          c.subscription_tier,
          json_agg(
            json_build_object(
              'type', oc.json_ld_schemas->>'@type',
              'data', oc.json_ld_schemas,
              'enabled', oc.active
            )
          ) as schemas,
          json_build_object(
            'title', oc.meta_tags->>'title',
            'description', oc.meta_tags->>'description',
            'ogTags', oc.meta_tags->'og',
            'twitterTags', oc.meta_tags->'twitter',
            'canonical', oc.meta_tags->>'canonical'
          ) as metaTags
        FROM seo_clients c
        LEFT JOIN seo_optimization_configs oc ON c.id = oc.client_id
        WHERE c.api_key = $1 AND c.status = 'active'
        GROUP BY c.id, oc.meta_tags
      `, [apiKey]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Client not found' });
        return;
      }

      const config = {
        schemas: result.rows[0].schemas || [],
        metaTags: result.rows[0].metaTags || {},
        customizations: {}
      };

      // Cache for 5 minutes
      await this.redis.setEx(`config:${apiKey}`, 300, JSON.stringify(config));

      res.json(config);
    } catch (error) {
      console.error('Get config error:', error);
      res.status(500).json({ error: 'Failed to get configuration' });
    }
  }

  /**
   * Submit analytics data
   */
  private async submitAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const data = analyticsSchema.parse(req.body);
      
      // Get client ID from API key
      const clientResult = await this.db.query(
        'SELECT id FROM seo_clients WHERE api_key = $1',
        [data.apiKey]
      );

      if (clientResult.rows.length === 0) {
        res.status(404).json({ error: 'Invalid API key' });
        return;
      }

      const clientId = clientResult.rows[0].id;
      
      // Store analytics
      await this.db.query(`
        INSERT INTO seo_analytics (
          client_id, url, page_title, core_web_vitals, 
          user_behavior, session_id, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        clientId,
        data.data.url,
        data.data.pageTitle,
        JSON.stringify(data.data.coreWebVitals),
        JSON.stringify(data.data.userBehavior),
        data.data.sessionId || null,
        new Date()
      ]);

      res.json({ success: true });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        console.error('Submit analytics error:', error);
        res.status(500).json({ error: 'Failed to submit analytics' });
      }
    }
  }

  /**
   * Create new SEO client
   */
  private async createClient(req: Request, res: Response): Promise<void> {
    try {
      const data = createClientSchema.parse(req.body);
      const user = (req as any).user;
      
      // Generate API key
      const apiKey = 'ld_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Create client
      const result = await this.db.query(`
        INSERT INTO seo_clients (
          user_id, domain, api_key, api_key_hash, subscription_tier, status
        ) VALUES ($1, $2, $3, $4, $5, 'active')
        RETURNING id, domain, api_key, subscription_tier, status, created_at
      `, [
        user.userId,
        data.domain,
        apiKey,
        await bcrypt.hash(apiKey, 10),
        data.subscriptionTier
      ]);

      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') {
        res.status(409).json({ error: 'Domain already exists' });
      } else if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Validation error', details: error.errors });
      } else {
        console.error('Create client error:', error);
        res.status(500).json({ error: 'Failed to create client' });
      }
    }
  }

  /**
   * Get client details
   */
  private async getClient(req: Request, res: Response): Promise<void> {
    const { clientId } = req.params;
    const user = (req as any).user;
    
    try {
      const result = await this.db.query(`
        SELECT id, domain, api_key, subscription_tier, status, 
               monthly_page_views, page_view_limit, created_at, updated_at
        FROM seo_clients
        WHERE id = $1 AND user_id = $2
      `, [clientId, user.userId]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Client not found' });
        return;
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get client error:', error);
      res.status(500).json({ error: 'Failed to get client' });
    }
  }

  /**
   * Update client
   */
  private async updateClient(req: Request, res: Response): Promise<void> {
    const { clientId } = req.params;
    const user = (req as any).user;
    
    try {
      const result = await this.db.query(`
        UPDATE seo_clients
        SET domain = COALESCE($1, domain),
            subscription_tier = COALESCE($2, subscription_tier),
            updated_at = NOW()
        WHERE id = $3 AND user_id = $4
        RETURNING *
      `, [req.body.domain, req.body.subscriptionTier, clientId, user.userId]);

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Client not found' });
        return;
      }

      // Invalidate cache
      await this.redis.del(`config:${result.rows[0].api_key}`);

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update client error:', error);
      res.status(500).json({ error: 'Failed to update client' });
    }
  }

  /**
   * Delete client
   */
  private async deleteClient(req: Request, res: Response): Promise<void> {
    const { clientId } = req.params;
    const user = (req as any).user;
    
    try {
      const result = await this.db.query(
        'DELETE FROM seo_clients WHERE id = $1 AND user_id = $2 RETURNING api_key',
        [clientId, user.userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Client not found' });
        return;
      }

      // Invalidate cache
      await this.redis.del(`config:${result.rows[0].api_key}`);

      res.json({ success: true });
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({ error: 'Failed to delete client' });
    }
  }

  /**
   * Get analytics overview
   */
  private async getAnalyticsOverview(req: Request, res: Response): Promise<void> {
    const user = (req as any).user;
    const { clientId } = req.query;
    
    try {
      const result = await this.db.query(`
        SELECT 
          COUNT(*) as total_page_views,
          AVG((core_web_vitals->>'lcp')::float) as avg_lcp,
          AVG((core_web_vitals->>'cls')::float) as avg_cls,
          AVG((user_behavior->>'timeOnPage')::int) as avg_time_on_page,
          AVG((user_behavior->>'scrollDepth')::int) as avg_scroll_depth
        FROM seo_analytics sa
        JOIN seo_clients sc ON sa.client_id = sc.id
        WHERE sc.user_id = $1 AND ($2::uuid IS NULL OR sc.id = $2)
        AND sa.timestamp > NOW() - INTERVAL '30 days'
      `, [user.userId, clientId || null]);

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get analytics overview error:', error);
      res.status(500).json({ error: 'Failed to get analytics overview' });
    }
  }

  /**
   * Get keyword rankings (placeholder - requires external API integration)
   */
  private getKeywordRankings(req: Request, res: Response): void {
    res.json({
      keywords: [],
      message: 'Keyword tracking requires external API integration'
    });
  }

  /**
   * Get traffic metrics
   */
  private async getTrafficMetrics(req: Request, res: Response): Promise<void> {
    const user = (req as any).user;
    const { clientId, days = 30 } = req.query;
    
    try {
      const result = await this.db.query(`
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as page_views,
          COUNT(DISTINCT session_id) as sessions
        FROM seo_analytics sa
        JOIN seo_clients sc ON sa.client_id = sc.id
        WHERE sc.user_id = $1 
        AND ($2::uuid IS NULL OR sc.id = $2)
        AND sa.timestamp > NOW() - INTERVAL '${parseInt(days as string)} days'
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `, [user.userId, clientId || null]);

      res.json(result.rows);
    } catch (error) {
      console.error('Get traffic metrics error:', error);
      res.status(500).json({ error: 'Failed to get traffic metrics' });
    }
  }

  /**
   * Start the API server
   */
  public async start(port: number = 3001): Promise<void> {
    await this.redis.connect();
    
    this.app.listen(port, () => {
      console.log(`SEO Service API listening on port ${port}`);
    });
  }
}

// Example usage
if (require.main === module) {
  const config: APIConfig = {
    database: {
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/lightdom'
    },
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      expiresIn: '24h'
    },
    cors: {
      origins: ['http://localhost:3000', 'https://app.lightdom.io']
    }
  };

  const api = new SEOServiceAPI(config);
  api.start(3001);
}

export default SEOServiceAPI;
