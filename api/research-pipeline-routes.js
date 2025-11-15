/**
 * AI Research Pipeline API Routes
 * 
 * REST API endpoints for the AI research pipeline system
 */

import express from 'express';
import { AIResearchPipeline } from '../services/ai-research-pipeline.js';

export function createResearchPipelineRoutes(db) {
  const router = express.Router();
  
  // Initialize pipeline
  const pipeline = new AIResearchPipeline({ db, headless: true });
  
  // Initialize on first request
  let initialized = false;
  router.use(async (req, res, next) => {
    if (!initialized) {
      try {
        await pipeline.initialize();
        initialized = true;
      } catch (error) {
        console.error('Failed to initialize research pipeline:', error);
      }
    }
    next();
  });

  /**
   * GET /api/research/status
   * Get pipeline status and statistics
   */
  router.get('/status', async (req, res) => {
    try {
      const stats = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM research_articles) as total_articles,
          (SELECT COUNT(*) FROM research_articles WHERE scraped_at > NOW() - INTERVAL '24 hours') as articles_today,
          (SELECT COUNT(*) FROM feature_recommendations) as total_features,
          (SELECT COUNT(*) FROM feature_recommendations WHERE status = 'proposed') as pending_features,
          (SELECT COUNT(*) FROM research_campaigns WHERE is_active = true) as active_campaigns,
          (SELECT COUNT(*) FROM research_papers) as total_papers,
          (SELECT COUNT(*) FROM research_code_examples) as total_code_examples
      `);

      res.json({
        status: 'operational',
        stats: stats.rows[0],
        campaigns: pipeline.campaigns.size,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/research/scrape
   * Manually trigger article scraping
   */
  router.post('/scrape', async (req, res) => {
    try {
      const { topics = ['ai', 'ml', 'llm'], limit = 50 } = req.body;
      
      const articles = await pipeline.scrapeDevToArticles(topics, limit);
      
      res.json({
        success: true,
        articlesFound: articles.length,
        articles: articles.map(a => ({
          id: a.id,
          title: a.title,
          url: a.url,
          author: a.author,
          tags: a.tags
        }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/research/articles
   * List scraped articles with filters
   */
  router.get('/articles', async (req, res) => {
    try {
      const { 
        status = 'all',
        topic,
        limit = 50,
        offset = 0,
        sortBy = 'scraped_at',
        order = 'DESC'
      } = req.query;

      let query = 'SELECT * FROM research_articles WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (status !== 'all') {
        query += ` AND status = $${paramCount++}`;
        params.push(status);
      }

      if (topic) {
        query += ` AND $${paramCount++} = ANY(tags)`;
        params.push(topic);
      }

      query += ` ORDER BY ${sortBy} ${order}`;
      query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      
      res.json({
        articles: result.rows,
        total: result.rows.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/research/articles/:id
   * Get article details
   */
  router.get('/articles/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const article = await db.query(`
        SELECT ra.*,
               COALESCE(json_agg(DISTINCT jsonb_build_object(
                 'id', rt.id,
                 'name', rt.name,
                 'category', rt.category
               )) FILTER (WHERE rt.id IS NOT NULL), '[]') as topics,
               COALESCE(json_agg(DISTINCT jsonb_build_object(
                 'id', rce.id,
                 'language', rce.language,
                 'lineCount', rce.line_count,
                 'quality', rce.quality_score
               )) FILTER (WHERE rce.id IS NOT NULL), '[]') as code_examples
        FROM research_articles ra
        LEFT JOIN article_topics at ON ra.id = at.article_id
        LEFT JOIN research_topics rt ON at.topic_id = rt.id
        LEFT JOIN research_code_examples rce ON ra.id = rce.article_id
        WHERE ra.id = $1
        GROUP BY ra.id
      `, [id]);

      if (article.rows.length === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }

      res.json(article.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/research/articles/:id/analyze
   * Analyze article for features
   */
  router.post('/articles/:id/analyze', async (req, res) => {
    try {
      const { id } = req.params;
      
      const article = await db.query('SELECT * FROM research_articles WHERE id = $1', [id]);
      if (article.rows.length === 0) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const features = await pipeline.analyzeArticleForFeatures(article.rows[0]);
      
      // Store features
      for (const feature of features) {
        await pipeline.storeFeature(feature);
      }

      res.json({
        success: true,
        featuresIdentified: features.length,
        features
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/research/features
   * List feature recommendations
   */
  router.get('/features', async (req, res) => {
    try {
      const { 
        status = 'all',
        impact,
        revenue,
        limit = 50,
        offset = 0
      } = req.query;

      let query = 'SELECT * FROM feature_recommendations WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (status !== 'all') {
        query += ` AND status = $${paramCount++}`;
        params.push(status);
      }

      if (impact) {
        query += ` AND impact_level = $${paramCount++}`;
        params.push(impact);
      }

      if (revenue) {
        query += ` AND revenue_potential = $${paramCount++}`;
        params.push(revenue);
      }

      query += ` ORDER BY 
        CASE revenue_potential 
          WHEN 'high' THEN 3 
          WHEN 'medium' THEN 2 
          ELSE 1 
        END DESC,
        CASE impact_level 
          WHEN 'critical' THEN 4
          WHEN 'high' THEN 3 
          WHEN 'medium' THEN 2 
          ELSE 1 
        END DESC`;
      query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      
      res.json({
        features: result.rows,
        total: result.rows.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/research/campaigns
   * Create new research campaign
   */
  router.post('/campaigns', async (req, res) => {
    try {
      const config = req.body;
      
      const campaign = await pipeline.createResearchCampaign(config);
      
      res.json({
        success: true,
        campaign
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/research/campaigns
   * List research campaigns
   */
  router.get('/campaigns', async (req, res) => {
    try {
      const { active = 'all' } = req.query;

      let query = 'SELECT * FROM research_campaigns WHERE 1=1';
      const params = [];

      if (active === 'true') {
        query += ' AND is_active = true';
      } else if (active === 'false') {
        query += ' AND is_active = false';
      }

      query += ' ORDER BY created_at DESC';

      const result = await db.query(query, params);
      
      res.json({
        campaigns: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/research/campaigns/:id/execute
   * Execute a campaign
   */
  router.post('/campaigns/:id/execute', async (req, res) => {
    try {
      const { id } = req.params;
      
      const results = await pipeline.executeCampaign(id);
      
      res.json({
        success: true,
        campaignId: id,
        results
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/research/papers/generate
   * Generate research paper
   */
  router.post('/papers/generate', async (req, res) => {
    try {
      const { focusArea = 'ai-ml-integration', limit = 50 } = req.body;
      
      const paper = await pipeline.generateResearchPaper(focusArea, limit);
      
      res.json({
        success: true,
        paper: {
          id: paper.id,
          title: paper.title,
          executive_summary: paper.executive_summary,
          key_findings: paper.key_findings,
          recommendations: paper.recommendations
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/research/papers
   * List research papers
   */
  router.get('/papers', async (req, res) => {
    try {
      const { status = 'all', limit = 20, offset = 0 } = req.query;

      let query = 'SELECT * FROM research_papers WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (status !== 'all') {
        query += ` AND status = $${paramCount++}`;
        params.push(status);
      }

      query += ` ORDER BY generated_at DESC`;
      query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      
      res.json({
        papers: result.rows,
        total: result.rows.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/research/papers/:id
   * Get research paper details
   */
  router.get('/papers/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await db.query('SELECT * FROM research_papers WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Paper not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/research/topics
   * List research topics
   */
  router.get('/topics', async (req, res) => {
    try {
      const result = await db.query(`
        SELECT rt.*,
               COUNT(DISTINCT at.article_id) as article_count
        FROM research_topics rt
        LEFT JOIN article_topics at ON rt.id = at.topic_id
        GROUP BY rt.id
        ORDER BY article_count DESC, rt.trending_score DESC
        LIMIT 50
      `);
      
      res.json({
        topics: result.rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/research/seo-insights
   * Get SEO insights
   */
  router.get('/seo-insights', async (req, res) => {
    try {
      const { patternType, limit = 50 } = req.query;

      let query = 'SELECT * FROM seo_insights WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (patternType) {
        query += ` AND pattern_type = $${paramCount++}`;
        params.push(patternType);
      }

      query += ` ORDER BY effectiveness_score DESC`;
      query += ` LIMIT $${paramCount++}`;
      params.push(limit);

      const result = await db.query(query, params);
      
      res.json({
        insights: result.rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/research/code-examples
   * Get code examples
   */
  router.get('/code-examples', async (req, res) => {
    try {
      const { language, limit = 50, offset = 0 } = req.query;

      let query = 'SELECT * FROM research_code_examples WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (language) {
        query += ` AND language = $${paramCount++}`;
        params.push(language);
      }

      query += ` ORDER BY quality_score DESC, created_at DESC`;
      query += ` LIMIT $${paramCount++} OFFSET $${paramCount++}`;
      params.push(limit, offset);

      const result = await db.query(query, params);
      
      res.json({
        examples: result.rows,
        total: result.rows.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/research/service-packages
   * List service packages
   */
  router.get('/service-packages', async (req, res) => {
    try {
      const { status = 'all', tier } = req.query;

      let query = 'SELECT * FROM service_packages WHERE 1=1';
      const params = [];
      let paramCount = 1;

      if (status !== 'all') {
        query += ` AND status = $${paramCount++}`;
        params.push(status);
      }

      if (tier) {
        query += ` AND pricing_tier = $${paramCount++}`;
        params.push(tier);
      }

      query += ` ORDER BY estimated_revenue DESC`;

      const result = await db.query(query, params);
      
      res.json({
        packages: result.rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/research/dashboard
   * Get dashboard data
   */
  router.get('/dashboard', async (req, res) => {
    try {
      const [stats, topTopics, topFeatures, recentArticles] = await Promise.all([
        // Overall stats
        db.query(`
          SELECT 
            (SELECT COUNT(*) FROM research_articles) as total_articles,
            (SELECT COUNT(*) FROM feature_recommendations) as total_features,
            (SELECT COUNT(*) FROM research_campaigns WHERE is_active = true) as active_campaigns,
            (SELECT COUNT(*) FROM research_papers) as total_papers,
            (SELECT COUNT(*) FROM service_packages) as total_packages,
            (SELECT SUM(estimated_revenue) FROM service_packages WHERE status = 'launched') as total_revenue
        `),
        
        // Top topics
        db.query(`
          SELECT rt.*, COUNT(at.article_id) as article_count
          FROM research_topics rt
          LEFT JOIN article_topics at ON rt.id = at.topic_id
          GROUP BY rt.id
          ORDER BY article_count DESC, rt.trending_score DESC
          LIMIT 10
        `),
        
        // Top features
        db.query(`
          SELECT * FROM feature_recommendations
          WHERE status = 'proposed'
          ORDER BY 
            CASE revenue_potential WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC,
            CASE impact_level WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC
          LIMIT 10
        `),
        
        // Recent articles
        db.query(`
          SELECT * FROM research_articles
          ORDER BY scraped_at DESC
          LIMIT 10
        `)
      ]);

      res.json({
        stats: stats.rows[0],
        topTopics: topTopics.rows,
        topFeatures: topFeatures.rows,
        recentArticles: recentArticles.rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

export default createResearchPipelineRoutes;
