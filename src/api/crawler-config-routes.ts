/**
 * Crawler Config Generator API Routes
 * 
 * AI-powered crawler configuration generation from natural language prompts.
 * Integrates with schema library and intelligent seed URL discovery.
 */

import express from 'express';

const router = express.Router();

// Schema library with predefined configurations
const schemaLibrary: Record<string, any> = {
  'seo-content': {
    label: 'SEO Content Schema',
    attributes: ['metaTags', 'keywords', 'backlinks', 'coreVitals', 'contentBlocks', 'schemaOrg'],
    categories: ['Metadata', 'Content Intelligence', 'Authority Signals', 'Performance'],
    defaultParallelCrawlers: 3,
  },
  'competitor-landscape': {
    label: 'Competitor Landscape Schema',
    attributes: ['trafficEstimates', 'landingPages', 'contentGaps', 'backlinkOverlap'],
    categories: ['Performance', 'Authority Signals', 'Content Intelligence'],
    defaultParallelCrawlers: 4,
  },
  'content-brief': {
    label: 'Content Brief Schema',
    attributes: ['outline', 'resources', 'faqs', 'competitiveScore'],
    categories: ['Content Intelligence', 'Audience Insights', 'Authority Signals', 'Performance'],
    defaultParallelCrawlers: 2,
  },
  'general': {
    label: 'General Web Crawling',
    attributes: ['title', 'description', 'links', 'images'],
    categories: ['Basic Content'],
    defaultParallelCrawlers: 5,
  },
};

/**
 * Generate crawler configuration from AI prompt
 * POST /api/crawler/generate-config
 */
router.post('/crawler/generate-config', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'Prompt is required',
        message: 'Please provide a valid prompt string' 
      });
    }

    // Analyze prompt to determine schema and configuration
    const analysis = analyzePrompt(prompt);
    
    // Generate URL seeds based on prompt
    const seeds = generateSeedsFromPrompt(prompt, analysis.schemaKey);
    
    // Build complete configuration
    const config = {
      seeds,
      parallelCrawlers: analysis.parallelCrawlers,
      maxDepth: analysis.maxDepth,
      rateLimit: analysis.rateLimit,
      timeout: analysis.timeout,
      schemaKey: analysis.schemaKey,
      attributes: analysis.attributes,
      categories: analysis.categories,
      estimatedPages: estimatePages(seeds, analysis.maxDepth),
      estimatedTime: estimateTime(seeds, analysis.maxDepth, analysis.parallelCrawlers),
    };

    res.json(config);
  } catch (error) {
    console.error('Failed to generate config:', error);
    res.status(500).json({ 
      error: 'Configuration generation failed',
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Start a new crawl job
 * POST /api/crawler/start-job
 */
router.post('/crawler/start-job', async (req, res) => {
  try {
    const { seeds, config, schemaKey, attributes } = req.body;

    if (!seeds || !Array.isArray(seeds) || seeds.length === 0) {
      return res.status(400).json({ 
        error: 'Seeds are required',
        message: 'Please provide at least one seed URL' 
      });
    }

    // Validate URLs
    for (const seed of seeds) {
      try {
        new URL(seed);
      } catch (e) {
        return res.status(400).json({ 
          error: 'Invalid URL',
          message: `Invalid seed URL: ${seed}` 
        });
      }
    }

    // Create job ID
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Store job configuration (would normally save to database)
    const job = {
      id: jobId,
      seeds,
      config: config || {},
      schemaKey: schemaKey || 'general',
      attributes: attributes || [],
      status: 'queued',
      createdAt: new Date().toISOString(),
    };

    // In production, this would:
    // 1. Save job to database
    // 2. Add seeds to crawl_targets table
    // 3. Trigger crawler workers to pick up the job
    // 4. Return job ID for tracking

    console.log('Created crawl job:', job);

    res.json({
      jobId,
      status: 'queued',
      message: 'Crawl job created successfully',
      seedCount: seeds.length,
      estimatedStartTime: 'Within 1 minute',
    });
  } catch (error) {
    console.error('Failed to start crawl job:', error);
    res.status(500).json({ 
      error: 'Job creation failed',
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Analyze prompt to extract intent and configuration
 */
function analyzePrompt(prompt: string): {
  schemaKey: string;
  parallelCrawlers: number;
  maxDepth: number;
  rateLimit: number;
  timeout: number;
  attributes: string[];
  categories: string[];
} {
  const lowerPrompt = prompt.toLowerCase();

  // Detect schema type from keywords
  let schemaKey = 'general';
  if (lowerPrompt.includes('seo') || lowerPrompt.includes('meta') || lowerPrompt.includes('keyword')) {
    schemaKey = 'seo-content';
  } else if (lowerPrompt.includes('competitor') || lowerPrompt.includes('benchmar')) {
    schemaKey = 'competitor-landscape';
  } else if (lowerPrompt.includes('content brief') || lowerPrompt.includes('outline')) {
    schemaKey = 'content-brief';
  }

  const schema = schemaLibrary[schemaKey];

  // Detect depth from keywords
  let maxDepth = 3;
  if (lowerPrompt.includes('deep') || lowerPrompt.includes('comprehensive')) {
    maxDepth = 5;
  } else if (lowerPrompt.includes('shallow') || lowerPrompt.includes('surface')) {
    maxDepth = 1;
  }

  // Detect crawler count
  let parallelCrawlers = schema.defaultParallelCrawlers;
  const numberMatch = lowerPrompt.match(/(\d+)\s*(crawler|parallel|worker)/);
  if (numberMatch) {
    parallelCrawlers = Math.min(Math.max(parseInt(numberMatch[1]), 1), 20);
  }

  // Detect rate limit
  let rateLimit = 10; // requests per second
  if (lowerPrompt.includes('fast') || lowerPrompt.includes('quick')) {
    rateLimit = 20;
  } else if (lowerPrompt.includes('slow') || lowerPrompt.includes('gentle')) {
    rateLimit = 5;
  }

  return {
    schemaKey,
    parallelCrawlers,
    maxDepth,
    rateLimit,
    timeout: 30000,
    attributes: schema.attributes,
    categories: schema.categories,
  };
}

/**
 * Generate seed URLs based on prompt and schema
 */
function generateSeedsFromPrompt(prompt: string, schemaKey: string): Array<{
  url: string;
  domain: string;
  priority: number;
  cadence: 'hourly' | 'daily' | 'weekly' | 'monthly';
  tags: string[];
  schemaAttributes: string[];
}> {
  const lowerPrompt = prompt.toLowerCase();
  const schema = schemaLibrary[schemaKey];

  // Predefined high-quality seed URLs by schema type
  const seedsBySchema: Record<string, string[]> = {
    'seo-content': [
      'https://moz.com/learn/seo',
      'https://backlinko.com/blog',
      'https://ahrefs.com/blog',
      'https://searchengineland.com',
    ],
    'competitor-landscape': [
      'https://www.similarweb.com/top-websites/',
      'https://www.semrush.com/blog/',
      'https://www.alexa.com/topsites',
    ],
    'content-brief': [
      'https://www.gartner.com/en/insights',
      'https://moz.com/learn',
      'https://www.hubspot.com/marketing-statistics',
    ],
    'general': [
      'https://example.com',
      'https://httpbin.org',
    ],
  };

  const urls = seedsBySchema[schemaKey] || seedsBySchema['general'];

  // Limit to top 5 seeds for quick start
  return urls.slice(0, 5).map((url, index) => {
    const urlObj = new URL(url);
    return {
      url,
      domain: urlObj.hostname,
      priority: 10 - index, // Descending priority
      cadence: index === 0 ? 'daily' : 'weekly',
      tags: extractTags(prompt),
      schemaAttributes: schema.attributes.slice(0, 3), // Top 3 attributes
    };
  });
}

/**
 * Extract tags from prompt
 */
function extractTags(prompt: string): string[] {
  const tags: string[] = [];
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('seo')) tags.push('seo');
  if (lowerPrompt.includes('competitor')) tags.push('competitor');
  if (lowerPrompt.includes('content')) tags.push('content');
  if (lowerPrompt.includes('saas')) tags.push('saas');
  if (lowerPrompt.includes('ecommerce') || lowerPrompt.includes('e-commerce')) tags.push('ecommerce');

  return tags;
}

/**
 * Estimate total pages to crawl
 */
function estimatePages(seeds: any[], maxDepth: number): number {
  // Rough estimate: each seed leads to 10 pages per depth level
  const pagesPerSeed = Math.pow(10, maxDepth);
  return seeds.length * pagesPerSeed;
}

/**
 * Estimate time to complete crawl
 */
function estimateTime(seeds: any[], maxDepth: number, parallelCrawlers: number): string {
  const totalPages = estimatePages(seeds, maxDepth);
  const pagesPerCrawlerPerHour = 1000; // Rough estimate
  const hours = totalPages / (parallelCrawlers * pagesPerCrawlerPerHour);

  if (hours < 1) {
    return `${Math.ceil(hours * 60)} minutes`;
  } else if (hours < 24) {
    return `${Math.ceil(hours)} hours`;
  } else {
    return `${Math.ceil(hours / 24)} days`;
  }
}

export default router;
