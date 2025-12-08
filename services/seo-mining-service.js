/**
 * SEO Mining Service
 * 
 * Extracts and analyzes SEO-related data from web pages including schema markup,
 * metadata, semantic HTML, and generates attribute rules for training ML models.
 * 
 * Features:
 * - Schema.org markup extraction
 * - Metadata analysis (Open Graph, Twitter Cards, etc.)
 * - Configurable attribute extraction rules
 * - Semantic scoring and quality metrics
 * - Competitor analysis and benchmarking
 * - Content optimization suggestions
 * - Training data export for ML models
 * 
 * @module services/seo-mining-service
 */

import EventEmitter from 'events';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

/**
 * Schema types we can detect and extract
 */
const SCHEMA_TYPES = {
  ARTICLE: 'Article',
  PRODUCT: 'Product',
  REVIEW: 'Review',
  ORGANIZATION: 'Organization',
  PERSON: 'Person',
  BREADCRUMB: 'BreadcrumbList',
  FAQ: 'FAQPage',
  HOW_TO: 'HowTo',
  RECIPE: 'Recipe',
  EVENT: 'Event',
};

export class SEOMiningService extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.db = options.db;
    this.browser = null;
    
    // Extraction rules
    this.attributeRules = new Map();
    this._loadDefaultRules();
    
    // Cache
    this.cache = new Map();
    this.cacheMaxAge = options.cacheMaxAge || 3600000; // 1 hour
    
    // Metrics
    this.metrics = {
      pagesAnalyzed: 0,
      schemasExtracted: 0,
      rulesGenerated: 0,
      averageScore: 0,
    };
  }

  /**
   * Analyze a web page for SEO attributes
   */
  async analyzePage(url) {
    this.metrics.pagesAnalyzed++;
    
    // Check cache
    const cached = this._getFromCache(url);
    if (cached) {
      return cached;
    }
    
    // Fetch page
    const page = await this._fetchPage(url);
    const $ = cheerio.load(page.html);
    
    const analysis = {
      url,
      timestamp: new Date().toISOString(),
      
      // Schema markup
      schemas: this._extractSchemas($),
      
      // Metadata
      metadata: {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        keywords: $('meta[name="keywords"]').attr('content'),
        canonical: $('link[rel="canonical"]').attr('href'),
        robots: $('meta[name="robots"]').attr('content'),
      },
      
      // Open Graph
      openGraph: this._extractOpenGraph($),
      
      // Twitter Cards
      twitterCard: this._extractTwitterCard($),
      
      // Semantic HTML
      semanticHtml: this._analyzeSemanticHTML($),
      
      // Headings structure
      headings: this._extractHeadings($),
      
      // Links
      links: this._analyzeLinks($),
      
      // Images
      images: this._analyzeImages($),
      
      // Performance hints
      performance: {
        imageCount: $('img').length,
        scriptCount: $('script').length,
        styleCount: $('link[rel="stylesheet"], style').length,
      },
      
      // SEO score
      score: 0,
      suggestions: [],
    };
    
    // Calculate SEO score
    analysis.score = this._calculateSEOScore(analysis);
    
    // Generate suggestions
    analysis.suggestions = this._generateSuggestions(analysis);
    
    // Update metrics
    this.metrics.schemasExtracted += analysis.schemas.length;
    this._updateAverageScore(analysis.score);
    
    // Cache result
    this._addToCache(url, analysis);
    
    // Save to database
    if (this.db) {
      await this._saveAnalysisToDB(analysis);
    }
    
    this.emit('page:analyzed', analysis);
    
    return analysis;
  }

  /**
   * Extract schema.org markup
   */
  _extractSchemas($) {
    const schemas = [];
    
    // JSON-LD
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html());
        const schemaArray = Array.isArray(data) ? data : [data];
        
        for (const schema of schemaArray) {
          if (schema['@type']) {
            schemas.push({
              type: schema['@type'],
              format: 'jsonld',
              data: schema,
            });
          }
        }
      } catch (error) {
        console.error('Failed to parse JSON-LD:', error);
      }
    });
    
    // Microdata
    $('[itemscope]').each((_, el) => {
      const $el = $(el);
      const schema = {
        type: $el.attr('itemtype')?.split('/').pop(),
        format: 'microdata',
        data: this._extractMicrodata($el),
      };
      schemas.push(schema);
    });
    
    return schemas;
  }

  /**
   * Extract microdata from element
   */
  _extractMicrodata($el) {
    const data = {};
    
    $el.find('[itemprop]').each((_, propEl) => {
      const $prop = cheerio.load(propEl);
      const propName = $prop('[itemprop]').attr('itemprop');
      const propValue = $prop('[itemprop]').attr('content') || $prop('[itemprop]').text();
      data[propName] = propValue;
    });
    
    return data;
  }

  /**
   * Extract Open Graph metadata
   */
  _extractOpenGraph($) {
    const og = {};
    
    $('meta[property^="og:"]').each((_, el) => {
      const property = $(el).attr('property').replace('og:', '');
      const content = $(el).attr('content');
      og[property] = content;
    });
    
    return og;
  }

  /**
   * Extract Twitter Card metadata
   */
  _extractTwitterCard($) {
    const twitter = {};
    
    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name').replace('twitter:', '');
      const content = $(el).attr('content');
      twitter[name] = content;
    });
    
    return twitter;
  }

  /**
   * Analyze semantic HTML usage
   */
  _analyzeSemanticHTML($) {
    return {
      hasHeader: $('header').length > 0,
      hasNav: $('nav').length > 0,
      hasMain: $('main').length > 0,
      hasArticle: $('article').length > 0,
      hasSection: $('section').length > 0,
      hasAside: $('aside').length > 0,
      hasFooter: $('footer').length > 0,
      hasFigure: $('figure').length > 0,
    };
  }

  /**
   * Extract headings structure
   */
  _extractHeadings($) {
    const headings = [];
    
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      headings.push({
        level: parseInt($(el).prop('tagName').replace('H', '')),
        text: $(el).text().trim(),
      });
    });
    
    return headings;
  }

  /**
   * Analyze links
   */
  _analyzeLinks($) {
    const links = {
      total: 0,
      internal: 0,
      external: 0,
      nofollow: 0,
    };
    
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      const rel = $(el).attr('rel');
      
      links.total++;
      
      if (href.startsWith('http')) {
        links.external++;
      } else {
        links.internal++;
      }
      
      if (rel && rel.includes('nofollow')) {
        links.nofollow++;
      }
    });
    
    return links;
  }

  /**
   * Analyze images
   */
  _analyzeImages($) {
    const images = {
      total: 0,
      withAlt: 0,
      withoutAlt: 0,
      withTitle: 0,
    };
    
    $('img').each((_, el) => {
      images.total++;
      
      if ($(el).attr('alt')) {
        images.withAlt++;
      } else {
        images.withoutAlt++;
      }
      
      if ($(el).attr('title')) {
        images.withTitle++;
      }
    });
    
    return images;
  }

  /**
   * Calculate SEO score (0-100)
   */
  _calculateSEOScore(analysis) {
    let score = 0;
    
    // Title (15 points)
    if (analysis.metadata.title) {
      const titleLength = analysis.metadata.title.length;
      if (titleLength >= 30 && titleLength <= 60) {
        score += 15;
      } else if (titleLength > 0) {
        score += 8;
      }
    }
    
    // Description (15 points)
    if (analysis.metadata.description) {
      const descLength = analysis.metadata.description.length;
      if (descLength >= 120 && descLength <= 160) {
        score += 15;
      } else if (descLength > 0) {
        score += 8;
      }
    }
    
    // Schema markup (20 points)
    if (analysis.schemas.length > 0) {
      score += Math.min(20, analysis.schemas.length * 10);
    }
    
    // Open Graph (10 points)
    const ogCount = Object.keys(analysis.openGraph).length;
    if (ogCount >= 4) {
      score += 10;
    } else {
      score += ogCount * 2;
    }
    
    // Semantic HTML (10 points)
    const semanticCount = Object.values(analysis.semanticHtml).filter(v => v).length;
    score += Math.min(10, semanticCount * 1.25);
    
    // Headings (10 points)
    const h1Count = analysis.headings.filter(h => h.level === 1).length;
    if (h1Count === 1) {
      score += 5;
    }
    if (analysis.headings.length > 2) {
      score += 5;
    }
    
    // Images with alt text (10 points)
    if (analysis.images.total > 0) {
      const altRatio = analysis.images.withAlt / analysis.images.total;
      score += altRatio * 10;
    }
    
    // Canonical link (5 points)
    if (analysis.metadata.canonical) {
      score += 5;
    }
    
    // Robots meta (5 points)
    if (analysis.metadata.robots) {
      score += 5;
    }
    
    return Math.round(Math.min(100, score));
  }

  /**
   * Generate optimization suggestions
   */
  _generateSuggestions(analysis) {
    const suggestions = [];
    
    if (!analysis.metadata.title) {
      suggestions.push({
        priority: 'high',
        category: 'metadata',
        message: 'Add a page title',
        impact: 'Critical for SEO',
      });
    } else if (analysis.metadata.title.length < 30 || analysis.metadata.title.length > 60) {
      suggestions.push({
        priority: 'medium',
        category: 'metadata',
        message: 'Optimize title length (30-60 characters)',
        impact: 'Improves click-through rate',
      });
    }
    
    if (!analysis.metadata.description) {
      suggestions.push({
        priority: 'high',
        category: 'metadata',
        message: 'Add meta description',
        impact: 'Critical for search snippets',
      });
    }
    
    if (analysis.schemas.length === 0) {
      suggestions.push({
        priority: 'high',
        category: 'schema',
        message: 'Add schema.org markup',
        impact: 'Enables rich snippets',
      });
    }
    
    if (Object.keys(analysis.openGraph).length < 4) {
      suggestions.push({
        priority: 'medium',
        category: 'social',
        message: 'Add complete Open Graph tags',
        impact: 'Better social media sharing',
      });
    }
    
    if (analysis.images.withoutAlt > 0) {
      suggestions.push({
        priority: 'medium',
        category: 'accessibility',
        message: `Add alt text to ${analysis.images.withoutAlt} images`,
        impact: 'Improves accessibility and SEO',
      });
    }
    
    const h1Count = analysis.headings.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      suggestions.push({
        priority: 'high',
        category: 'content',
        message: 'Add H1 heading',
        impact: 'Critical for page structure',
      });
    } else if (h1Count > 1) {
      suggestions.push({
        priority: 'low',
        category: 'content',
        message: 'Use only one H1 heading',
        impact: 'Improves semantic structure',
      });
    }
    
    if (!analysis.metadata.canonical) {
      suggestions.push({
        priority: 'low',
        category: 'technical',
        message: 'Add canonical URL',
        impact: 'Prevents duplicate content issues',
      });
    }
    
    return suggestions;
  }

  /**
   * Analyze competitor page
   */
  async analyzeCompetitor(url, query) {
    const analysis = await this.analyzePage(url);
    
    return {
      url,
      query,
      seoScore: analysis.score,
      schemas: analysis.schemas.map(s => s.type),
      strengths: analysis.suggestions.filter(s => s.priority === 'high'),
      opportunities: this._identifyOpportunities(analysis),
    };
  }

  /**
   * Identify opportunities from competitor analysis
   */
  _identifyOpportunities(analysis) {
    const opportunities = [];
    
    // Schema opportunities
    const schemaTypes = analysis.schemas.map(s => s.type);
    const missingSchemas = Object.values(SCHEMA_TYPES).filter(t => !schemaTypes.includes(t));
    
    if (missingSchemas.length > 0) {
      opportunities.push({
        type: 'schema',
        message: `Add these schema types: ${missingSchemas.join(', ')}`,
      });
    }
    
    // Content opportunities
    if (analysis.headings.length < 5) {
      opportunities.push({
        type: 'content',
        message: 'Expand content with more sections',
      });
    }
    
    return opportunities;
  }

  /**
   * Extract attribute rules from analyzed pages
   */
  async extractAttributeRules(urls) {
    const rules = [];
    
    for (const url of urls) {
      const analysis = await this.analyzePage(url);
      
      // Extract patterns
      for (const schema of analysis.schemas) {
        const rule = {
          schemaType: schema.type,
          selector: this._generateSelector(schema),
          attributes: Object.keys(schema.data),
          example: schema.data,
        };
        rules.push(rule);
      }
    }
    
    this.metrics.rulesGenerated = rules.length;
    
    return rules;
  }

  /**
   * Generate CSS selector for schema extraction
   */
  _generateSelector(schema) {
    if (schema.format === 'jsonld') {
      return 'script[type="application/ld+json"]';
    } else if (schema.format === 'microdata') {
      return `[itemtype*="${schema.type}"]`;
    }
    return null;
  }

  /**
   * Export training data
   */
  async exportTrainingData(format = 'jsonl') {
    const data = [];
    
    // Get all analyzed pages from cache or database
    for (const [url, analysis] of this.cache) {
      data.push({
        input: {
          html: analysis.html,
          url: analysis.url,
        },
        output: {
          schemas: analysis.schemas,
          metadata: analysis.metadata,
          score: analysis.score,
        },
      });
    }
    
    if (format === 'jsonl') {
      return data.map(d => JSON.stringify(d)).join('\n');
    }
    
    return data;
  }

  /**
   * Fetch page with Puppeteer
   */
  async _fetchPage(url) {
    if (!this.browser) {
      this.browser = await puppeteer.launch({ headless: 'new' });
    }
    
    const page = await this.browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    const html = await page.content();
    const title = await page.title();
    
    await page.close();
    
    return { html, title };
  }

  /**
   * Load default extraction rules
   */
  _loadDefaultRules() {
    // Default rules for common schema types
    this.attributeRules.set('Product', {
      name: { selector: '[itemprop="name"]', attribute: 'textContent' },
      price: { selector: '[itemprop="price"]', attribute: 'content' },
      image: { selector: '[itemprop="image"]', attribute: 'src' },
      description: { selector: '[itemprop="description"]', attribute: 'textContent' },
    });
    
    this.attributeRules.set('Article', {
      headline: { selector: '[itemprop="headline"]', attribute: 'textContent' },
      author: { selector: '[itemprop="author"]', attribute: 'textContent' },
      datePublished: { selector: '[itemprop="datePublished"]', attribute: 'content' },
      image: { selector: '[itemprop="image"]', attribute: 'src' },
    });
  }

  /**
   * Cache management
   */
  _getFromCache(url) {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheMaxAge) {
      return cached.data;
    }
    return null;
  }

  _addToCache(url, data) {
    this.cache.set(url, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Update average score metric
   */
  _updateAverageScore(newScore) {
    const total = this.metrics.pagesAnalyzed;
    const currentAvg = this.metrics.averageScore;
    this.metrics.averageScore = (currentAvg * (total - 1) + newScore) / total;
  }

  /**
   * Save analysis to database
   */
  async _saveAnalysisToDB(analysis) {
    if (!this.db) return;
    
    try {
      await this.db.query(`
        INSERT INTO seo_analyses (
          url, schemas, metadata, open_graph, twitter_card,
          semantic_html, headings, links, images, score,
          suggestions, analyzed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      `, [
        analysis.url,
        JSON.stringify(analysis.schemas),
        JSON.stringify(analysis.metadata),
        JSON.stringify(analysis.openGraph),
        JSON.stringify(analysis.twitterCard),
        JSON.stringify(analysis.semanticHtml),
        JSON.stringify(analysis.headings),
        JSON.stringify(analysis.links),
        JSON.stringify(analysis.images),
        analysis.score,
        JSON.stringify(analysis.suggestions),
      ]);
    } catch (error) {
      console.error('Failed to save SEO analysis:', error);
    }
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }
}

export { SCHEMA_TYPES };
