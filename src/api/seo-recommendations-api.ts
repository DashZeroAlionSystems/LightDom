/**
 * SEO Recommendations API Endpoints
 * 
 * AI-powered SEO recommendations engine
 * Provides actionable insights based on ML analysis
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const GetRecommendationsSchema = z.object({
  clientId: z.string().uuid(),
  domain: z.string().optional(),
  category: z.enum(['technical', 'content', 'performance', 'engagement', 'all']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low', 'all']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const ImplementRecommendationSchema = z.object({
  recommendationId: z.string().uuid(),
  status: z.enum(['implemented', 'dismissed', 'scheduled']),
  notes: z.string().optional(),
});

const GenerateRecommendationsSchema = z.object({
  clientId: z.string().uuid(),
  domain: z.string(),
  forceRegenerate: z.boolean().optional(),
});

// ============================================================================
// TYPES
// ============================================================================

interface Recommendation {
  id: string;
  clientId: string;
  domain: string;
  category: 'technical' | 'content' | 'performance' | 'engagement';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  implementation: string;
  expectedImprovement: string;
  status: 'pending' | 'implemented' | 'dismissed' | 'scheduled';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// RECOMMENDATION GENERATION LOGIC
// ============================================================================

/**
 * Generate AI-powered SEO recommendations
 * Uses ML models to analyze current state and suggest improvements
 */
async function generateRecommendations(
  clientId: string,
  domain: string,
  db: any
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // TODO: Integrate with actual ML models
  // For now, using rule-based recommendations

  // Fetch latest analytics
  const analytics = await db.query(
    `SELECT * FROM seo_analytics 
     WHERE client_id = $1 AND domain = $2 
     ORDER BY timestamp DESC LIMIT 100`,
    [clientId, domain]
  );

  if (analytics.rows.length === 0) {
    return [];
  }

  const latestData = analytics.rows[0];

  // TECHNICAL SEO RECOMMENDATIONS
  if (!latestData.https_enabled) {
    recommendations.push({
      id: generateId(),
      clientId,
      domain,
      category: 'technical',
      priority: 'critical',
      title: 'Enable HTTPS',
      description: 'Your site is not using HTTPS, which negatively impacts SEO and user trust.',
      impact: 'high',
      effort: 'medium',
      implementation: 'Install an SSL certificate and redirect all HTTP traffic to HTTPS.',
      expectedImprovement: '+15-20 SEO score points, improved trust signals',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // CORE WEB VITALS RECOMMENDATIONS
  if (latestData.lcp > 2500) {
    recommendations.push({
      id: generateId(),
      clientId,
      domain,
      category: 'performance',
      priority: 'high',
      title: 'Improve Largest Contentful Paint (LCP)',
      description: `LCP is ${latestData.lcp}ms (target: <2500ms). This affects user experience and rankings.`,
      impact: 'high',
      effort: 'medium',
      implementation: 'Optimize images, use CDN, reduce server response time, eliminate render-blocking resources.',
      expectedImprovement: '+10-15 SEO score points, better user experience',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  if (latestData.cls > 0.1) {
    recommendations.push({
      id: generateId(),
      clientId,
      domain,
      category: 'performance',
      priority: 'high',
      title: 'Reduce Cumulative Layout Shift (CLS)',
      description: `CLS is ${latestData.cls} (target: <0.1). Layout shifts harm user experience.`,
      impact: 'medium',
      effort: 'medium',
      implementation: 'Set image dimensions, avoid dynamically injected content above fold, use transform animations.',
      expectedImprovement: '+5-8 SEO score points, reduced bounce rate',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // CONTENT RECOMMENDATIONS
  if (!latestData.schema_org_present) {
    recommendations.push({
      id: generateId(),
      clientId,
      domain,
      category: 'content',
      priority: 'high',
      title: 'Add Schema.org Structured Data',
      description: 'No structured data detected. This limits rich snippet opportunities.',
      impact: 'high',
      effort: 'low',
      implementation: 'Add JSON-LD schema markup for your content type (Article, Product, Organization, etc.).',
      expectedImprovement: '+12-18 SEO score points, rich snippets in search results',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  if (latestData.meta_description_length < 120 || latestData.meta_description_length > 160) {
    recommendations.push({
      id: generateId(),
      clientId,
      domain,
      category: 'content',
      priority: 'medium',
      title: 'Optimize Meta Description Length',
      description: `Meta description is ${latestData.meta_description_length} characters (ideal: 120-160).`,
      impact: 'medium',
      effort: 'low',
      implementation: 'Rewrite meta description to 120-160 characters, include target keywords.',
      expectedImprovement: '+3-5 SEO score points, better click-through rates',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // ENGAGEMENT RECOMMENDATIONS
  const avgTimeOnPage = analytics.rows.reduce((sum, row) => sum + (row.time_on_page || 0), 0) / analytics.rows.length;
  if (avgTimeOnPage < 30000) {
    recommendations.push({
      id: generateId(),
      clientId,
      domain,
      category: 'engagement',
      priority: 'medium',
      title: 'Improve Time on Page',
      description: `Average time on page is ${Math.round(avgTimeOnPage / 1000)}s (target: >30s).`,
      impact: 'medium',
      effort: 'high',
      implementation: 'Add engaging content, internal links, videos, interactive elements. Improve readability.',
      expectedImprovement: '+5-10 SEO score points, better engagement metrics',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return recommendations;
}

function generateId(): string {
  return `rec_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * GET /api/v1/recommendations
 * Get SEO recommendations for a client
 */
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const params = GetRecommendationsSchema.parse({
      clientId: req.query.clientId,
      domain: req.query.domain,
      category: req.query.category || 'all',
      priority: req.query.priority || 'all',
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    });

    // TODO: Replace with actual database query
    const db = (req as any).db;

    let query = `
      SELECT * FROM seo_recommendations
      WHERE client_id = $1
    `;
    const queryParams: any[] = [params.clientId];
    let paramIndex = 2;

    if (params.domain) {
      query += ` AND domain = $${paramIndex}`;
      queryParams.push(params.domain);
      paramIndex++;
    }

    if (params.category && params.category !== 'all') {
      query += ` AND category = $${paramIndex}`;
      queryParams.push(params.category);
      paramIndex++;
    }

    if (params.priority && params.priority !== 'all') {
      query += ` AND priority = $${paramIndex}`;
      queryParams.push(params.priority);
      paramIndex++;
    }

    query += ` ORDER BY 
      CASE priority 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
      END,
      created_at DESC
      LIMIT $${paramIndex}`;
    queryParams.push(params.limit);

    const result = await db.query(query, queryParams);

    res.json({
      success: true,
      recommendations: result.rows,
      total: result.rows.length,
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch recommendations',
    });
  }
});

/**
 * POST /api/v1/recommendations/generate
 * Generate new SEO recommendations using ML
 */
router.post('/recommendations/generate', async (req: Request, res: Response) => {
  try {
    const params = GenerateRecommendationsSchema.parse(req.body);

    const db = (req as any).db;

    // Check if recommendations already exist
    if (!params.forceRegenerate) {
      const existing = await db.query(
        `SELECT COUNT(*) as count FROM seo_recommendations 
         WHERE client_id = $1 AND domain = $2 AND status = 'pending'
         AND created_at > NOW() - INTERVAL '7 days'`,
        [params.clientId, params.domain]
      );

      if (existing.rows[0].count > 0) {
        return res.json({
          success: true,
          message: 'Recent recommendations already exist',
          useExisting: true,
        });
      }
    }

    // Generate new recommendations
    const recommendations = await generateRecommendations(
      params.clientId,
      params.domain,
      db
    );

    // Save to database
    for (const rec of recommendations) {
      await db.query(
        `INSERT INTO seo_recommendations 
         (id, client_id, domain, category, priority, title, description, impact, effort, implementation, expected_improvement, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          rec.id,
          rec.clientId,
          rec.domain,
          rec.category,
          rec.priority,
          rec.title,
          rec.description,
          rec.impact,
          rec.effort,
          rec.implementation,
          rec.expectedImprovement,
          rec.status,
          rec.createdAt,
          rec.updatedAt,
        ]
      );
    }

    res.json({
      success: true,
      recommendations,
      total: recommendations.length,
      generated: true,
    });
  } catch (error) {
    console.error('Generate recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate recommendations',
    });
  }
});

/**
 * PUT /api/v1/recommendations/:id
 * Update recommendation status (implement, dismiss, schedule)
 */
router.put('/recommendations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const params = ImplementRecommendationSchema.parse(req.body);

    const db = (req as any).db;

    const result = await db.query(
      `UPDATE seo_recommendations 
       SET status = $1, notes = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [params.status, params.notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Recommendation not found',
      });
    }

    res.json({
      success: true,
      recommendation: result.rows[0],
    });
  } catch (error) {
    console.error('Update recommendation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update recommendation',
    });
  }
});

export default router;
