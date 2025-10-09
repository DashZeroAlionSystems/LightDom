/**
 * SEO Analysis API Endpoints
 * Handles SEO data collection, ML predictions, and optimization recommendations
 */

import express, { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);
const router: Router = express.Router();

// Types
interface SEOAnalysisRequest {
  url: string;
  keyword: string;
  depth?: 'basic' | 'comprehensive' | 'ml-powered';
}

interface SEOAnalysisResponse {
  metrics: {
    url: string;
    currentPosition: number;
    predictedPosition: number;
    rankingScore: number;
    coreWebVitals: any;
    onPage: any;
    authority: any;
    userBehavior: any;
    aiInsights: any;
  };
  featureImportance: Array<{
    feature: string;
    importance: number;
    category: string;
  }>;
  timestamp: string;
}

// Cache for storing recent analyses
const analysisCache = new Map<string, { data: SEOAnalysisResponse; timestamp: number }>();
const CACHE_DURATION = 300000; // 5 minutes

/**
 * POST /api/seo/analyze
 * Analyze a URL for SEO metrics and get AI predictions
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { url, keyword, depth = 'ml-powered' } = req.body as SEOAnalysisRequest;

    // Validate inputs
    if (!url || !keyword) {
      return res.status(400).json({ error: 'URL and keyword are required' });
    }

    // Check cache
    const cacheKey = `${url}:${keyword}`;
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json(cached.data);
    }

    // Call Python SEO analysis service
    const pythonScript = path.join(__dirname, '../../seo/ml/analyze_seo.py');
    const command = `python3 ${pythonScript} --url "${url}" --keyword "${keyword}" --depth ${depth}`;
    
    const { stdout, stderr } = await execAsync(command, {
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer for large responses
    });

    if (stderr) {
      console.error('Python script stderr:', stderr);
    }

    // Parse Python output
    const analysisResult = JSON.parse(stdout);

    // Mock data for demonstration (replace with actual Python output)
    const response: SEOAnalysisResponse = {
      metrics: {
        url,
        currentPosition: analysisResult.currentPosition || Math.floor(Math.random() * 20) + 1,
        predictedPosition: analysisResult.predictedPosition || Math.floor(Math.random() * 10) + 1,
        rankingScore: analysisResult.rankingScore || Math.random() * 0.5 + 0.5,
        
        coreWebVitals: {
          lcp: { value: 2300, rating: 'good' },
          inp: { value: 180, rating: 'good' },
          cls: { value: 0.08, rating: 'good' },
          overallScore: 92
        },
        
        onPage: {
          titleOptimized: true,
          metaOptimized: true,
          headingStructure: 85,
          contentQuality: 78,
          keywordDensity: 2.1,
          schemaMarkup: true
        },
        
        authority: {
          domainRating: 65,
          backlinks: 1234,
          referringDomains: 89,
          authorityScore: 72
        },
        
        userBehavior: {
          ctr: 0.045,
          engagementRate: 0.68,
          bounceRate: 0.32,
          dwellTime: 145
        },
        
        aiInsights: {
          topOpportunities: [
            'Improve Core Web Vitals INP metric',
            'Add more internal links to related content',
            'Optimize images for next-gen formats',
            'Expand content with related entities'
          ],
          predictedImpact: 23,
          confidenceScore: 0.87,
          recommendedActions: [
            {
              action: 'Reduce JavaScript execution time to improve INP',
              impact: 'high',
              effort: 'medium'
            },
            {
              action: 'Add FAQ schema markup for featured snippets',
              impact: 'high',
              effort: 'low'
            },
            {
              action: 'Build topical authority with 5-10 related articles',
              impact: 'high',
              effort: 'high'
            },
            {
              action: 'Convert images to WebP format',
              impact: 'medium',
              effort: 'low'
            }
          ]
        }
      },
      
      featureImportance: analysisResult.featureImportance || [
        { feature: 'content_quality_score', importance: 0.145, category: 'content' },
        { feature: 'domain_authority', importance: 0.132, category: 'authority' },
        { feature: 'engagement_rate', importance: 0.098, category: 'user_behavior' },
        { feature: 'core_web_vitals_score', importance: 0.087, category: 'technical' },
        { feature: 'backlink_velocity', importance: 0.076, category: 'authority' },
        { feature: 'content_freshness', importance: 0.065, category: 'temporal' },
        { feature: 'mobile_optimization', importance: 0.054, category: 'technical' },
        { feature: 'semantic_relevance', importance: 0.048, category: 'content' },
        { feature: 'user_satisfaction_score', importance: 0.042, category: 'composite' },
        { feature: 'title_keyword_presence', importance: 0.038, category: 'content' }
      ],
      
      timestamp: new Date().toISOString()
    };

    // Cache the response
    analysisCache.set(cacheKey, { data: response, timestamp: Date.now() });

    res.json(response);
  } catch (error) {
    console.error('SEO analysis error:', error);
    res.status(500).json({ 
      error: 'SEO analysis failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * POST /api/seo/batch-analyze
 * Analyze multiple URLs in batch
 */
router.post('/batch-analyze', async (req: Request, res: Response) => {
  try {
    const { urls, keyword, depth = 'basic' } = req.body as {
      urls: string[];
      keyword: string;
      depth?: string;
    };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    if (urls.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 URLs per batch' });
    }

    // Process URLs in parallel (limit concurrency)
    const BATCH_SIZE = 5;
    const results = [];
    
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(url => 
        analyzeUrlInternal(url, keyword, depth as any)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
    }

    const successfulAnalyses = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<any>).value);

    const failedAnalyses = results
      .filter(r => r.status === 'rejected')
      .map((r, idx) => ({
        url: urls[idx],
        error: (r as PromiseRejectedResult).reason.message
      }));

    res.json({
      successful: successfulAnalyses,
      failed: failedAnalyses,
      summary: {
        total: urls.length,
        successful: successfulAnalyses.length,
        failed: failedAnalyses.length
      }
    });
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({ 
      error: 'Batch analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/competitors
 * Get competitor analysis for a domain
 */
router.get('/competitors/:domain', async (req: Request, res: Response) => {
  try {
    const { domain } = req.params;
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword parameter is required' });
    }

    // Mock competitor data (replace with actual implementation)
    const competitors = [
      {
        domain: 'competitor1.com',
        position: 3,
        domainAuthority: 75,
        backlinks: 5432,
        contentLength: 3200,
        coreWebVitalsScore: 88
      },
      {
        domain: 'competitor2.com',
        position: 5,
        domainAuthority: 68,
        backlinks: 3210,
        contentLength: 2800,
        coreWebVitalsScore: 91
      },
      {
        domain: 'competitor3.com',
        position: 7,
        domainAuthority: 72,
        backlinks: 4567,
        contentLength: 4100,
        coreWebVitalsScore: 85
      }
    ];

    res.json({
      domain,
      keyword,
      competitors,
      analysis: {
        avgDomainAuthority: 71.7,
        avgBacklinks: 4403,
        avgContentLength: 3367,
        recommendedContentLength: 3500,
        backlinkGap: 3169,
        authorityGap: 6.7
      }
    });
  } catch (error) {
    console.error('Competitor analysis error:', error);
    res.status(500).json({ 
      error: 'Competitor analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/seo/predict-ranking
 * Get ranking prediction for proposed changes
 */
router.post('/predict-ranking', async (req: Request, res: Response) => {
  try {
    const { 
      currentMetrics, 
      proposedChanges 
    } = req.body as {
      currentMetrics: any;
      proposedChanges: {
        contentLength?: number;
        backlinks?: number;
        coreWebVitals?: any;
        technicalFixes?: string[];
      };
    };

    // Mock prediction (replace with actual ML model prediction)
    const currentPosition = currentMetrics.position || 15;
    const improvement = calculateImprovement(proposedChanges);
    
    const prediction = {
      currentPosition,
      predictedPosition: Math.max(1, currentPosition - improvement),
      confidenceInterval: {
        best: Math.max(1, currentPosition - improvement - 2),
        worst: currentPosition - Math.max(0, improvement - 3)
      },
      probabilityOfImprovement: 0.78,
      estimatedTrafficIncrease: improvement * 8.5, // Rough estimate
      timeToEffect: '2-4 weeks'
    };

    res.json(prediction);
  } catch (error) {
    console.error('Ranking prediction error:', error);
    res.status(500).json({ 
      error: 'Ranking prediction failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/keywords/suggestions
 * Get keyword suggestions and related terms
 */
router.get('/keywords/suggestions', async (req: Request, res: Response) => {
  try {
    const { seed, limit = 20 } = req.query;

    if (!seed) {
      return res.status(400).json({ error: 'Seed keyword is required' });
    }

    // Mock keyword suggestions (replace with actual API or ML model)
    const suggestions = [
      { keyword: `best ${seed}`, volume: 8100, difficulty: 65, cpc: 2.45 },
      { keyword: `${seed} review`, volume: 5400, difficulty: 58, cpc: 1.89 },
      { keyword: `how to ${seed}`, volume: 3600, difficulty: 42, cpc: 1.23 },
      { keyword: `${seed} guide`, volume: 2900, difficulty: 48, cpc: 1.67 },
      { keyword: `${seed} tips`, volume: 2100, difficulty: 38, cpc: 1.12 },
      { keyword: `${seed} vs`, volume: 1800, difficulty: 55, cpc: 2.01 },
      { keyword: `top ${seed}`, volume: 1600, difficulty: 62, cpc: 2.34 },
      { keyword: `${seed} tutorial`, volume: 1200, difficulty: 35, cpc: 0.98 }
    ];

    const entities = [
      `${seed} tool`,
      `${seed} software`,
      `${seed} platform`,
      `${seed} service`
    ];

    res.json({
      seed: seed as string,
      suggestions: suggestions.slice(0, Number(limit)),
      relatedEntities: entities,
      searchIntent: {
        informational: 0.6,
        transactional: 0.25,
        navigational: 0.15
      }
    });
  } catch (error) {
    console.error('Keyword suggestions error:', error);
    res.status(500).json({ 
      error: 'Keyword suggestions failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Helper functions
async function analyzeUrlInternal(
  url: string, 
  keyword: string, 
  depth: 'basic' | 'comprehensive' | 'ml-powered'
): Promise<any> {
  // Simplified internal analysis function
  // In production, this would call the Python ML service
  return {
    url,
    keyword,
    position: Math.floor(Math.random() * 20) + 1,
    score: Math.random() * 100,
    issues: [],
    opportunities: []
  };
}

function calculateImprovement(changes: any): number {
  let improvement = 0;
  
  if (changes.contentLength && changes.contentLength > 2000) {
    improvement += 2;
  }
  
  if (changes.backlinks && changes.backlinks > 10) {
    improvement += Math.min(5, changes.backlinks / 10);
  }
  
  if (changes.coreWebVitals) {
    improvement += 3;
  }
  
  if (changes.technicalFixes && changes.technicalFixes.length > 0) {
    improvement += changes.technicalFixes.length * 0.5;
  }
  
  return Math.round(improvement);
}

export default router;