/**
 * AI Research Pipeline Service
 *
 * Comprehensive service for:
 * - Scraping dev.to and related sites for AI/ML/LLM content
 * - Analyzing articles for actionable insights
 * - Extracting code examples and patterns
 * - Generating feature recommendations
 * - Creating product research papers
 * - Identifying monetization opportunities
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { EventEmitter } from 'events';
import puppeteer from 'puppeteer';

export class AIResearchPipeline extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      db: config.db || null,
      headless: config.headless !== false,
      maxConcurrent: config.maxConcurrent || 5,
      rateLimit: config.rateLimit || 100, // requests per hour
      ...config,
    };

    this.browser = null;
    this.jobs = new Map();
    this.campaigns = new Map();

    // Rate limiting
    this.requestCount = 0;
    this.requestWindow = Date.now();
  }

  /**
   * Initialize the research pipeline
   */
  async initialize() {
    console.log('🚀 Initializing AI Research Pipeline...');

    // Launch browser
    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Load active campaigns from database
    await this.loadCampaigns();

    console.log('✅ AI Research Pipeline initialized');
    this.emit('initialized');
  }

  /**
   * Scrape dev.to articles based on topics
   */
  async scrapeDevToArticles(topics = ['ai', 'ml', 'llm'], limit = 50) {
    console.log(`📚 Scraping dev.to articles for topics: ${topics.join(', ')}`);
    const articles = [];

    for (const topic of topics) {
      try {
        await this.checkRateLimit();

        const url = `https://dev.to/t/${topic}`;
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LightDom Research Bot/1.0)',
          },
        });

        const $ = cheerio.load(response.data);

        $('.crayons-story')
          .slice(0, Math.ceil(limit / topics.length))
          .each((i, element) => {
            const article = this.extractDevToArticle($, element);
            if (article) {
              articles.push({ ...article, topic });
            }
          });

        console.log(`  ✓ Found ${articles.length} articles for ${topic}`);
      } catch (error) {
        console.error(`  ✗ Error scraping ${topic}:`, error.message);
      }
    }

    // Store articles in database
    await this.storeArticles(articles);

    this.emit('articles-scraped', { count: articles.length, topics });
    return articles;
  }

  /**
   * Extract article data from dev.to HTML
   */
  extractDevToArticle($, element) {
    try {
      const $el = $(element);

      const url = $el.find('a.crayons-story__hidden-navigation-link').attr('href');
      const title = $el.find('h2, h3').first().text().trim();
      const author = $el.find('.crayons-story__author-name').text().trim();
      const tags = [];

      $el.find('.crayons-tag').each((i, tag) => {
        tags.push($(tag).text().trim().replace('#', ''));
      });

      if (!url || !title) return null;

      return {
        url: url.startsWith('http') ? url : `https://dev.to${url}`,
        title,
        author,
        tags,
        source: 'dev.to',
      };
    } catch (error) {
      console.error('Error extracting article:', error);
      return null;
    }
  }

  /**
   * Scrape full article content and extract detailed information
   */
  async scrapeArticleDetails(articleUrl) {
    console.log(`📄 Scraping article details: ${articleUrl}`);

    try {
      await this.checkRateLimit();

      const page = await this.browser.newPage();
      await page.goto(articleUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Extract article content
      const details = await page.evaluate(() => {
        const getTextContent = selector => {
          const el = document.querySelector(selector);
          return el ? el.textContent.trim() : '';
        };

        const getMetaContent = name => {
          const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
          return meta ? meta.getAttribute('content') : '';
        };

        // Extract article body
        const contentEl = document.querySelector('article, .article-body, .crayons-article__body');
        const content = contentEl ? contentEl.innerText : '';

        // Extract code blocks
        const codeBlocks = [];
        document.querySelectorAll('pre code, .highlight code').forEach(block => {
          const language = block.className.match(/language-(\w+)/)?.[1] || 'unknown';
          codeBlocks.push({
            language,
            code: block.textContent.trim(),
            lineCount: block.textContent.split('\n').length,
          });
        });

        return {
          content,
          excerpt: getMetaContent('description') || getMetaContent('og:description'),
          publishedAt: getMetaContent('article:published_time'),
          readingTime: getTextContent('.crayons-article__subheader time, [data-article-duration]'),
          codeBlocks,
          wordCount: content.split(/\s+/).length,
        };
      });

      await page.close();

      console.log(
        `  ✓ Extracted ${details.codeBlocks.length} code blocks, ${details.wordCount} words`
      );

      return details;
    } catch (error) {
      console.error(`  ✗ Error scraping article details:`, error.message);
      return null;
    }
  }

  /**
   * Analyze article for feature recommendations
   */
  async analyzeArticleForFeatures(article) {
    console.log(`🔍 Analyzing article for features: ${article.title}`);

    const features = [];

    // Keywords that indicate actionable features
    const featureKeywords = {
      enhancement: ['optimize', 'improve', 'enhance', 'better', 'faster', 'efficient'],
      'new-feature': ['implement', 'build', 'create', 'develop', 'introduce', 'add'],
      integration: ['integrate', 'connect', 'combine', 'api', 'webhook', 'plugin'],
      optimization: ['performance', 'speed', 'reduce', 'minimize', 'cache', 'compress'],
    };

    // Revenue indicators
    const revenueKeywords = [
      'monetize',
      'revenue',
      'business',
      'sell',
      'pricing',
      'saas',
      'enterprise',
    ];

    const content = (article.content || '').toLowerCase();
    const title = (article.title || '').toLowerCase();

    // Analyze content for feature opportunities
    for (const [category, keywords] of Object.entries(featureKeywords)) {
      const matches = keywords.filter(kw => content.includes(kw) || title.includes(kw));

      if (matches.length > 0) {
        const hasRevenuePotential = revenueKeywords.some(kw => content.includes(kw));

        features.push({
          article_id: article.id,
          feature_name: this.generateFeatureName(article.title, category),
          feature_description: article.excerpt || article.title,
          category,
          impact_level: this.assessImpactLevel(article, matches),
          effort_estimate: this.assessEffort(article),
          revenue_potential: hasRevenuePotential ? 'high' : 'medium',
          implementation_complexity: Math.min(10, matches.length + article.codeBlocks?.length || 0),
        });
      }
    }

    console.log(`  ✓ Identified ${features.length} potential features`);

    return features;
  }

  /**
   * Extract SEO insights from successful articles
   */
  async extractSEOInsights(article) {
    const insights = [];

    // Keyword analysis
    if (article.tags && article.tags.length > 0) {
      insights.push({
        article_id: article.id,
        pattern_type: 'keyword',
        pattern_name: 'High-value tags',
        pattern_data: { tags: article.tags },
        effectiveness_score: 0.8,
      });
    }

    // Content length analysis
    if (article.wordCount) {
      insights.push({
        article_id: article.id,
        pattern_type: 'content-length',
        pattern_name: 'Optimal word count',
        pattern_data: { wordCount: article.wordCount },
        effectiveness_score: article.wordCount > 1000 ? 0.9 : 0.6,
      });
    }

    // Code example presence
    if (article.codeBlocks && article.codeBlocks.length > 0) {
      insights.push({
        article_id: article.id,
        pattern_type: 'structure',
        pattern_name: 'Code examples included',
        pattern_data: { codeBlockCount: article.codeBlocks.length },
        effectiveness_score: 0.85,
      });
    }

    return insights;
  }

  /**
   * Generate product research paper from collected articles
   */
  async generateResearchPaper(focusArea = 'ai-ml-integration', articleLimit = 50) {
    console.log(`📝 Generating research paper: ${focusArea}`);

    // Fetch relevant articles from database
    const articles = await this.fetchArticlesByFocus(focusArea, articleLimit);

    if (!this.config.db) {
      console.warn('Database not configured, skipping paper generation');
      return null;
    }

    // Fetch related features
    const features = await this.config.db.query(
      `
      SELECT fr.* FROM feature_recommendations fr
      JOIN research_articles ra ON fr.article_id = ra.id
      WHERE ra.id = ANY($1)
      ORDER BY fr.revenue_potential DESC, fr.impact_level DESC
      LIMIT 20
    `,
      [articles.map(a => a.id)]
    );

    // Generate paper content
    const paper = {
      title: `AI/ML Integration Opportunities for LightDom Platform - ${new Date().toLocaleDateString()}`,
      executive_summary: this.generateExecutiveSummary(articles, features.rows),
      full_content: this.generateFullPaperContent(articles, features.rows),
      paper_type: 'feature-analysis',
      focus_areas: [focusArea, 'monetization', 'integration'],
      key_findings: this.extractKeyFindings(articles, features.rows),
      recommendations: this.generateRecommendations(features.rows),
      related_articles: articles.map(a => a.id),
      related_features: features.rows.map(f => f.id),
      confidence_score: 0.85,
    };

    // Store paper in database
    if (this.config.db) {
      const result = await this.config.db.query(
        `
        INSERT INTO research_papers 
        (title, executive_summary, full_content, paper_type, focus_areas, key_findings, recommendations, related_articles, related_features, confidence_score)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `,
        [
          paper.title,
          paper.executive_summary,
          paper.full_content,
          paper.paper_type,
          paper.focus_areas,
          paper.key_findings,
          paper.recommendations,
          paper.related_articles,
          paper.related_features,
          paper.confidence_score,
        ]
      );

      paper.id = result.rows[0].id;
    }

    console.log(`  ✓ Research paper generated with ID: ${paper.id}`);
    this.emit('paper-generated', paper);

    return paper;
  }

  /**
   * Create continuous monitoring campaign
   */
  async createResearchCampaign(config) {
    console.log(`🎯 Creating research campaign: ${config.name}`);

    const campaign = {
      name: config.name,
      description: config.description,
      campaign_type: config.type || 'continuous',
      search_queries: config.queries || ['ai', 'ml', 'llm', 'nlp', 'deep learning'],
      topic_filters: config.topics || ['ai', 'ml', 'llm'],
      schedule_cron: config.schedule || '0 */6 * * *', // Every 6 hours
      is_active: true,
      config: {
        maxArticlesPerRun: config.maxArticles || 100,
        minRelevanceScore: config.minRelevance || 0.6,
        enableFullScrape: config.fullScrape !== false,
        enableFeatureExtraction: config.extractFeatures !== false,
      },
    };

    if (this.config.db) {
      const result = await this.config.db.query(
        `
        INSERT INTO research_campaigns 
        (name, description, campaign_type, search_queries, topic_filters, schedule_cron, is_active, config)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
        [
          campaign.name,
          campaign.description,
          campaign.campaign_type,
          campaign.search_queries,
          campaign.topic_filters,
          campaign.schedule_cron,
          campaign.is_active,
          JSON.stringify(campaign.config),
        ]
      );

      campaign.id = result.rows[0].id;
      this.campaigns.set(campaign.id, campaign);
    }

    console.log(`  ✓ Campaign created with ID: ${campaign.id}`);
    this.emit('campaign-created', campaign);

    return campaign;
  }

  /**
   * Execute a research campaign
   */
  async executeCampaign(campaignId) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    console.log(`▶️  Executing campaign: ${campaign.name}`);

    const results = {
      articlesFound: 0,
      articlesAnalyzed: 0,
      featuresIdentified: 0,
      codeExamplesExtracted: 0,
    };

    try {
      // Scrape articles
      const articles = await this.scrapeDevToArticles(
        campaign.topic_filters,
        campaign.config.maxArticlesPerRun
      );
      results.articlesFound = articles.length;

      // Process each article
      for (const article of articles) {
        if (campaign.config.enableFullScrape) {
          const details = await this.scrapeArticleDetails(article.url);
          if (details) {
            Object.assign(article, details);
            results.articlesAnalyzed++;
          }
        }

        if (campaign.config.enableFeatureExtraction) {
          const features = await this.analyzeArticleForFeatures(article);
          results.featuresIdentified += features.length;

          // Store features
          for (const feature of features) {
            await this.storeFeature(feature);
          }
        }

        // Extract code examples
        if (article.codeBlocks) {
          results.codeExamplesExtracted += article.codeBlocks.length;
          for (const codeBlock of article.codeBlocks) {
            await this.storeCodeExample(article.id, codeBlock);
          }
        }
      }

      // Update campaign stats
      if (this.config.db) {
        await this.config.db.query(
          `
          UPDATE research_campaigns 
          SET last_run_at = NOW(),
              total_articles_found = total_articles_found + $1,
              total_features_identified = total_features_identified + $2
          WHERE id = $3
        `,
          [results.articlesFound, results.featuresIdentified, campaignId]
        );
      }

      console.log(`  ✅ Campaign completed:`, results);
      this.emit('campaign-executed', { campaignId, results });

      return results;
    } catch (error) {
      console.error(`  ❌ Campaign execution failed:`, error);
      throw error;
    }
  }

  /**
   * Helper: Store articles in database
   */
  async storeArticles(articles) {
    if (!this.config.db || articles.length === 0) return;

    for (const article of articles) {
      try {
        const result = await this.config.db.query(
          `
          INSERT INTO research_articles 
          (url, title, author, tags, content, excerpt, word_count, code_examples_count, published_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (url) DO UPDATE SET
            scraped_at = CURRENT_TIMESTAMP,
            tags = EXCLUDED.tags
          RETURNING id
        `,
          [
            article.url,
            article.title,
            article.author,
            article.tags || [],
            article.content || null,
            article.excerpt || null,
            article.wordCount || 0,
            article.codeBlocks?.length || 0,
            article.publishedAt || null,
          ]
        );

        article.id = result.rows[0].id;
      } catch (error) {
        console.error(`Error storing article ${article.url}:`, error.message);
      }
    }
  }

  /**
   * Helper: Store feature recommendation
   */
  async storeFeature(feature) {
    if (!this.config.db) return;

    await this.config.db.query(
      `
      INSERT INTO feature_recommendations 
      (article_id, feature_name, feature_description, category, impact_level, effort_estimate, revenue_potential, implementation_complexity)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
      [
        feature.article_id,
        feature.feature_name,
        feature.feature_description,
        feature.category,
        feature.impact_level,
        feature.effort_estimate,
        feature.revenue_potential,
        feature.implementation_complexity,
      ]
    );
  }

  /**
   * Helper: Store code example
   */
  async storeCodeExample(articleId, codeBlock) {
    if (!this.config.db) return;

    await this.config.db.query(
      `
      INSERT INTO research_code_examples 
      (article_id, language, code_snippet, line_count)
      VALUES ($1, $2, $3, $4)
    `,
      [articleId, codeBlock.language, codeBlock.code, codeBlock.lineCount]
    );
  }

  /**
   * Helper: Rate limiting
   */
  async checkRateLimit() {
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;

    if (now - this.requestWindow > hourInMs) {
      this.requestCount = 0;
      this.requestWindow = now;
    }

    if (this.requestCount >= this.config.rateLimit) {
      const waitTime = hourInMs - (now - this.requestWindow);
      console.log(`⏳ Rate limit reached, waiting ${Math.ceil(waitTime / 1000)}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.requestWindow = Date.now();
    }

    this.requestCount++;
  }

  /**
   * Helper: Generate feature name from article
   */
  generateFeatureName(title, category) {
    const cleaned = title.replace(/[^\w\s-]/g, '').substring(0, 100);
    return `${category}: ${cleaned}`;
  }

  /**
   * Helper: Assess impact level
   */
  assessImpactLevel(article, matches) {
    const score = matches.length + (article.codeBlocks?.length || 0);
    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  /**
   * Helper: Assess effort
   */
  assessEffort(article) {
    const complexity = article.codeBlocks?.length || 0;
    if (complexity >= 5) return 'large';
    if (complexity >= 3) return 'medium';
    return 'small';
  }

  /**
   * Helper: Load campaigns from database
   */
  async loadCampaigns() {
    if (!this.config.db) return;

    const result = await this.config.db.query(`
      SELECT * FROM research_campaigns WHERE is_active = true
    `);

    for (const campaign of result.rows) {
      this.campaigns.set(campaign.id, campaign);
    }

    console.log(`  ✓ Loaded ${this.campaigns.size} active campaigns`);
  }

  /**
   * Helper: Fetch articles by focus area
   */
  async fetchArticlesByFocus(focusArea, limit) {
    if (!this.config.db) return [];

    const result = await this.config.db.query(
      `
      SELECT * FROM research_articles 
      WHERE $1 = ANY(tags) OR title ILIKE $2
      ORDER BY relevance_score DESC, scraped_at DESC
      LIMIT $3
    `,
      [focusArea, `%${focusArea}%`, limit]
    );

    return result.rows;
  }

  /**
   * Helper: Generate executive summary
   */
  generateExecutiveSummary(articles, features) {
    return `
Based on analysis of ${articles.length} research articles and ${features.length} identified features, 
this report outlines key opportunities for enhancing the LightDom platform with AI/ML capabilities.

Key highlights:
- ${features.filter(f => f.revenue_potential === 'high').length} high-revenue potential features identified
- ${features.filter(f => f.impact_level === 'high').length} high-impact features for immediate development
- ${articles.reduce((sum, a) => sum + (a.code_examples_count || 0), 0)} code examples available for reference

Primary focus areas: AI automation, LLM integration, SEO optimization, and monetization strategies.
    `.trim();
  }

  /**
   * Helper: Generate full paper content
   */
  generateFullPaperContent(articles, features) {
    let content = '# LightDom AI/ML Integration Research Report\n\n';

    content += '## Executive Summary\n';
    content += this.generateExecutiveSummary(articles, features) + '\n\n';

    content += '## Recommended Features\n\n';
    for (const feature of features.slice(0, 10)) {
      content += `### ${feature.feature_name}\n`;
      content += `- **Impact**: ${feature.impact_level}\n`;
      content += `- **Effort**: ${feature.effort_estimate}\n`;
      content += `- **Revenue Potential**: ${feature.revenue_potential}\n`;
      content += `- **Description**: ${feature.feature_description}\n\n`;
    }

    content += '## Implementation Roadmap\n\n';
    content += 'Priority order based on impact and revenue potential.\n\n';

    return content;
  }

  /**
   * Helper: Extract key findings
   */
  extractKeyFindings(articles, features) {
    const findings = [];

    findings.push(`Analyzed ${articles.length} articles from leading AI/ML sources`);
    findings.push(`Identified ${features.length} potential features for platform enhancement`);
    findings.push(
      `${features.filter(f => f.revenue_potential === 'high').length} features have high revenue potential`
    );
    findings.push(`Common patterns: LLM integration, agent systems, SEO automation`);

    return findings;
  }

  /**
   * Helper: Generate recommendations
   */
  generateRecommendations(features) {
    const recommendations = [];

    const highPriority = features.filter(
      f => f.impact_level === 'high' && f.revenue_potential === 'high'
    );

    if (highPriority.length > 0) {
      recommendations.push(`Prioritize ${highPriority.length} high-impact, high-revenue features`);
    }

    recommendations.push('Integrate LangChain + Ollama for AI capabilities');
    recommendations.push('Develop SEO automation service packages');
    recommendations.push('Create AI agent orchestration system');
    recommendations.push('Build monetization layer around AI services');

    return recommendations;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export default AIResearchPipeline;
