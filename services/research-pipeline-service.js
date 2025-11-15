/**
 * Deep Research Pipeline Service
 * 
 * Comprehensive system for:
 * - Extracting research articles from multiple sources
 * - Mining topics and keywords
 * - Suggesting new content to DeepSeek
 * - Crawling and indexing research seeds
 * - Database persistence of all research data
 */

import { Pool } from 'pg';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dom_space_harvester',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Configuration
const CONFIG = {
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    enabled: Boolean(process.env.DEEPSEEK_API_KEY)
  },
  mining: {
    batchSize: 10,
    maxConcurrent: 5,
    retryAttempts: 3,
    retryDelay: 2000,
  },
  crawling: {
    maxDepth: 2,
    rateLimit: 1000, // ms between requests
    timeout: 30000,
  },
  sources: {
    arxiv: 'https://export.arxiv.org/api/query?search_query=',
    github: 'https://api.github.com/search/repositories?q=',
    papersWithCode: 'https://paperswithcode.com/api/v1/search/?q=',
  }
};

class ResearchPipelineService {
  constructor() {
    this.db = pool;
    this.activeSessions = new Map();
    this.stats = {
      articlesProcessed: 0,
      articlesExtracted: 0,
      articlesFailed: 0,
      topicsIdentified: 0,
      seedsCrawled: 0,
    };
  }

  /**
   * Initialize the research pipeline
   */
  async initialize() {
    console.log('🚀 Initializing Research Pipeline...');
    
    try {
      // Test database connection
      await this.testDatabaseConnection();
      
      // Load initial article index
      await this.loadArticleIndex();
      
      // Create mining session
      const sessionId = await this.createMiningSession('auto-init');
      this.currentSessionId = sessionId;
      
      console.log('✅ Research Pipeline initialized');
      console.log(`📊 Session ID: ${sessionId}`);
      
      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  async testDatabaseConnection() {
    try {
      const result = await this.db.query('SELECT NOW()');
      console.log('✅ Database connected:', result.rows[0].now);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Load article index from documentation
   */
  async loadArticleIndex() {
    try {
      const indexPath = path.join(__dirname, '../docs/research/deepseek-ocr-contexts-optical-compression/AI_SERIES_INDEX.md');
      const content = await fs.readFile(indexPath, 'utf-8');
      
      // Parse articles from the index
      const articles = this.parseArticleIndex(content);
      
      console.log(`📚 Found ${articles.length} articles in index`);
      
      // Insert into database
      for (const article of articles) {
        await this.upsertArticle(article);
      }
      
      console.log('✅ Article index loaded into database');
      
      return articles.length;
    } catch (error) {
      console.error('⚠️  Could not load article index:', error.message);
      return 0;
    }
  }

  /**
   * Parse article index from markdown
   */
  parseArticleIndex(content) {
    const articles = [];
    const lines = content.split('\n');
    
    let currentCategory = '';
    
    for (const line of lines) {
      // Detect category headers
      if (line.startsWith('### ') && line.includes('.')) {
        currentCategory = line.split('-')[1]?.trim() || 'miscellaneous';
      }
      
      // Parse article lines (e.g., "1. Article Title")
      const match = line.match(/^(\d+)\.\s+(.+)/);
      if (match) {
        const [, number, title] = match;
        articles.push({
          article_number: parseInt(number),
          title: title.trim(),
          category: currentCategory || 'miscellaneous',
          priority: this.determinePriority(currentCategory),
          status: 'pending'
        });
      }
    }
    
    return articles;
  }

  /**
   * Determine article priority based on category
   */
  determinePriority(category) {
    const highPriority = ['agent-systems', 'ocr-document', 'rag-retrieval', 'reasoning', 'code-generation', 'multimodal', 'memory-context'];
    const mediumPriority = ['reinforcement-learning', 'video-generation', '3d-reconstruction', 'training-optimization', 'benchmarks'];
    
    if (highPriority.some(p => category.toLowerCase().includes(p))) return 'high';
    if (mediumPriority.some(p => category.toLowerCase().includes(p))) return 'medium';
    return 'low';
  }

  /**
   * Upsert article into database
   */
  async upsertArticle(article) {
    const query = `
      INSERT INTO research_articles (article_number, title, category, priority, status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (article_number) 
      DO UPDATE SET 
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        priority = EXCLUDED.priority,
        updated_at = NOW()
      RETURNING id
    `;
    
    try {
      const result = await this.db.query(query, [
        article.article_number,
        article.title,
        article.category,
        article.priority,
        article.status || 'pending'
      ]);
      
      return result.rows[0].id;
    } catch (error) {
      console.error(`Error upserting article ${article.article_number}:`, error.message);
      return null;
    }
  }

  /**
   * Create mining session
   */
  async createMiningSession(name) {
    const query = `
      INSERT INTO mining_sessions (session_name, config)
      VALUES ($1, $2)
      RETURNING id
    `;
    
    const config = {
      deepseekEnabled: CONFIG.deepseek.enabled,
      batchSize: CONFIG.mining.batchSize,
      maxConcurrent: CONFIG.mining.maxConcurrent
    };
    
    const result = await this.db.query(query, [name, JSON.stringify(config)]);
    return result.rows[0].id;
  }

  /**
   * Start mining process
   */
  async startMining(options = {}) {
    console.log('\n⛏️  Starting research mining...\n');
    
    const {
      priority = 'high',
      limit = 50,
      skipExtracted = true
    } = options;
    
    try {
      // Get articles to process
      const articles = await this.getArticlesToProcess(priority, limit, skipExtracted);
      
      console.log(`📦 Processing ${articles.length} articles (priority: ${priority})`);
      
      // Process in batches
      const batches = this.createBatches(articles, CONFIG.mining.batchSize);
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`\n📊 Batch ${i + 1}/${batches.length} (${batch.length} articles)`);
        
        await this.processBatch(batch);
        
        // Update session stats
        await this.updateSessionStats();
      }
      
      console.log('\n✅ Mining completed');
      console.log(`📈 Stats:`, this.stats);
      
      return this.stats;
    } catch (error) {
      console.error('❌ Mining failed:', error);
      throw error;
    }
  }

  /**
   * Get articles to process
   */
  async getArticlesToProcess(priority, limit, skipExtracted) {
    let query = `
      SELECT * FROM research_articles
      WHERE priority = $1
    `;
    
    if (skipExtracted) {
      query += ` AND status != 'extracted'`;
    }
    
    query += ` AND extraction_attempts < 3`;
    query += ` ORDER BY article_number ASC LIMIT $2`;
    
    const result = await this.db.query(query, [priority, limit]);
    return result.rows;
  }

  /**
   * Process batch of articles
   */
  async processBatch(articles) {
    const promises = articles.map(article => this.processArticle(article));
    await Promise.allSettled(promises);
  }

  /**
   * Process single article
   */
  async processArticle(article) {
    console.log(`  📄 Processing: ${article.article_number}. ${article.title.substring(0, 60)}...`);
    
    try {
      this.stats.articlesProcessed++;
      
      // Search for article sources
      const sources = await this.searchArticleSources(article.title);
      
      // Create research seeds
      for (const source of sources) {
        await this.createResearchSeed(article.id, source);
      }
      
      // Extract article content if source found
      if (sources.length > 0) {
        const content = await this.extractArticleContent(article, sources[0]);
        
        if (content) {
          // Update article with content
          await this.updateArticleContent(article.id, content);
          
          // Extract topics
          const topics = await this.extractTopics(article, content);
          
          // Link topics
          for (const topic of topics) {
            await this.linkArticleToTopic(article.id, topic);
          }
          
          this.stats.articlesExtracted++;
          this.stats.topicsIdentified += topics.length;
          
          // Queue for DeepSeek if enabled
          if (CONFIG.deepseek.enabled) {
            await this.queueForDeepSeek(article, content);
          }
          
          console.log(`    ✅ Extracted (${topics.length} topics identified)`);
        } else {
          await this.markArticleFailed(article.id, 'No content extracted');
          this.stats.articlesFailed++;
          console.log(`    ⚠️  No content found`);
        }
      } else {
        await this.markArticleFailed(article.id, 'No sources found');
        this.stats.articlesFailed++;
        console.log(`    ⚠️  No sources found`);
      }
    } catch (error) {
      await this.markArticleFailed(article.id, error.message);
      this.stats.articlesFailed++;
      console.error(`    ❌ Failed:`, error.message);
    }
  }

  /**
   * Search for article sources (arXiv, GitHub, etc.)
   */
  async searchArticleSources(title) {
    const sources = [];
    
    try {
      // Search arXiv
      const arxivUrl = `${CONFIG.sources.arxiv}${encodeURIComponent(title)}`;
      const arxivResponse = await axios.get(arxivUrl, { timeout: 10000 });
      
      if (arxivResponse.data && arxivResponse.data.includes('<entry>')) {
        const arxivId = this.extractArxivId(arxivResponse.data);
        if (arxivId) {
          sources.push({
            type: 'arxiv',
            url: `https://arxiv.org/abs/${arxivId}`,
            api_url: arxivUrl
          });
        }
      }
    } catch (error) {
      // Silently fail arXiv search
    }
    
    try {
      // Search GitHub
      const githubUrl = `${CONFIG.sources.github}${encodeURIComponent(title)}`;
      const githubResponse = await axios.get(githubUrl, { 
        timeout: 10000,
        headers: { 'User-Agent': 'LightDom-Research-Pipeline' }
      });
      
      if (githubResponse.data?.items?.length > 0) {
        const repo = githubResponse.data.items[0];
        sources.push({
          type: 'github',
          url: repo.html_url,
          stars: repo.stargazers_count
        });
      }
    } catch (error) {
      // Silently fail GitHub search
    }
    
    return sources;
  }

  /**
   * Extract arXiv ID from response
   */
  extractArxivId(xmlData) {
    const match = xmlData.match(/<id>http:\/\/arxiv\.org\/abs\/([^<]+)<\/id>/);
    return match ? match[1] : null;
  }

  /**
   * Create research seed
   */
  async createResearchSeed(articleId, source) {
    const query = `
      INSERT INTO research_seeds (url, source_type, article_id, metadata)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (url) DO NOTHING
      RETURNING id
    `;
    
    try {
      await this.db.query(query, [
        source.url,
        source.type,
        articleId,
        JSON.stringify(source)
      ]);
      this.stats.seedsCrawled++;
    } catch (error) {
      // Silently handle duplicates
    }
  }

  /**
   * Extract article content
   */
  async extractArticleContent(article, source) {
    // For now, return summary info
    // In production, this would crawl and extract actual content
    return {
      summary: `Research article: ${article.title}`,
      source_url: source.url,
      source_type: source.type,
      key_findings: [],
      extracted_at: new Date().toISOString()
    };
  }

  /**
   * Update article content
   */
  async updateArticleContent(articleId, content) {
    const query = `
      UPDATE research_articles
      SET 
        content = $1,
        summary = $2,
        status = 'extracted',
        extracted_at = NOW(),
        metadata = metadata || $3::jsonb
      WHERE id = $4
    `;
    
    await this.db.query(query, [
      JSON.stringify(content),
      content.summary,
      JSON.stringify({ source_url: content.source_url }),
      articleId
    ]);
  }

  /**
   * Extract topics from article
   */
  async extractTopics(article, content) {
    // Simple keyword extraction
    const keywords = [];
    const title = article.title.toLowerCase();
    
    const topicKeywords = {
      'agent': 'Agent Systems',
      'multi-agent': 'Multi-Agent Systems',
      'reasoning': 'Reasoning Models',
      'reinforcement': 'Reinforcement Learning',
      'ocr': 'OCR & Document Understanding',
      'code': 'Code Generation',
      'rag': 'RAG Systems',
      'retrieval': 'RAG Systems',
      'multimodal': 'Multimodal Models',
      'vision': 'Multimodal Models',
      'video': 'Video Generation',
      '3d': '3D Reconstruction'
    };
    
    for (const [keyword, topic] of Object.entries(topicKeywords)) {
      if (title.includes(keyword)) {
        keywords.push(topic);
      }
    }
    
    return keywords.length > 0 ? keywords : [article.category];
  }

  /**
   * Link article to topic
   */
  async linkArticleToTopic(articleId, topicName) {
    const query = `
      SELECT link_article_to_topic($1, $2, $3)
    `;
    
    await this.db.query(query, [articleId, topicName, 0.8]);
  }

  /**
   * Queue content for DeepSeek
   */
  async queueForDeepSeek(article, content) {
    const query = `
      SELECT queue_content_for_deepseek($1, $2, $3, $4, $5)
    `;
    
    const contentText = `
Article: ${article.title}
Category: ${article.category}
Summary: ${content.summary}
Source: ${content.source_url}
    `.trim();
    
    await this.db.query(query, [
      'article',
      article.id,
      article.title,
      contentText,
      article.priority === 'high' ? 8 : 5
    ]);
  }

  /**
   * Mark article as failed
   */
  async markArticleFailed(articleId, error) {
    const query = `
      UPDATE research_articles
      SET 
        status = 'failed',
        last_error = $1,
        extraction_attempts = extraction_attempts + 1,
        updated_at = NOW()
      WHERE id = $2
    `;
    
    await this.db.query(query, [error, articleId]);
  }

  /**
   * Update session stats
   */
  async updateSessionStats() {
    if (!this.currentSessionId) return;
    
    const query = `
      UPDATE mining_sessions
      SET 
        articles_processed = $1,
        articles_extracted = $2,
        articles_failed = $3,
        topics_identified = $4,
        seeds_crawled = $5,
        results = $6::jsonb
      WHERE id = $7
    `;
    
    await this.db.query(query, [
      this.stats.articlesProcessed,
      this.stats.articlesExtracted,
      this.stats.articlesFailed,
      this.stats.topicsIdentified,
      this.stats.seedsCrawled,
      JSON.stringify(this.stats),
      this.currentSessionId
    ]);
  }

  /**
   * Complete mining session
   */
  async completeSession() {
    if (!this.currentSessionId) return;
    
    const query = `
      UPDATE mining_sessions
      SET 
        status = 'completed',
        end_time = NOW()
      WHERE id = $1
    `;
    
    await this.db.query(query, [this.currentSessionId]);
  }

  /**
   * Get pending content for DeepSeek
   */
  async getPendingContentForDeepSeek(limit = 10) {
    const query = `
      SELECT * FROM content_queue
      WHERE status = 'pending'
      ORDER BY priority DESC, created_at ASC
      LIMIT $1
    `;
    
    const result = await this.db.query(query, [limit]);
    return result.rows;
  }

  /**
   * Send content to DeepSeek
   */
  async sendToDeepSeek(contentItem) {
    if (!CONFIG.deepseek.enabled) {
      console.log('⚠️  DeepSeek API not configured');
      return null;
    }
    
    try {
      const response = await axios.post(
        `${CONFIG.deepseek.apiUrl}/chat/completions`,
        {
          model: CONFIG.deepseek.model,
          messages: [
            {
              role: 'system',
              content: 'You are an AI research analyst helping to understand and suggest connections between research articles for a DOM optimization platform called LightDom.'
            },
            {
              role: 'user',
              content: `Analyze this research article and suggest how it could be applied to LightDom:\n\n${contentItem.content}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${CONFIG.deepseek.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('DeepSeek API error:', error.message);
      return null;
    }
  }

  /**
   * Process DeepSeek queue
   */
  async processDeepSeekQueue() {
    console.log('\n🤖 Processing DeepSeek content queue...\n');
    
    const items = await this.getPendingContentForDeepSeek();
    
    console.log(`📦 Found ${items.length} items in queue`);
    
    for (const item of items) {
      console.log(`  📄 Processing: ${item.title.substring(0, 60)}...`);
      
      try {
        // Mark as processing
        await this.db.query(
          'UPDATE content_queue SET status = $1, sent_at = NOW() WHERE id = $2',
          ['sent-to-deepseek', item.id]
        );
        
        // Send to DeepSeek
        const response = await this.sendToDeepSeek(item);
        
        if (response) {
          // Update with response
          await this.db.query(
            'UPDATE content_queue SET status = $1, processed_at = NOW(), deepseek_response = $2 WHERE id = $3',
            ['processed', JSON.stringify(response), item.id]
          );
          
          // Create suggestion if applicable
          if (response.choices?.[0]?.message?.content) {
            await this.createDeepSeekSuggestion(item, response.choices[0].message.content);
          }
          
          console.log(`    ✅ Processed`);
        } else {
          await this.db.query(
            'UPDATE content_queue SET status = $1 WHERE id = $2',
            ['failed', item.id]
          );
          console.log(`    ⚠️  Failed`);
        }
        
        // Rate limiting
        await this.sleep(1000);
      } catch (error) {
        console.error(`    ❌ Error:`, error.message);
      }
    }
  }

  /**
   * Create DeepSeek suggestion
   */
  async createDeepSeekSuggestion(contentItem, suggestion) {
    const query = `
      INSERT INTO deepseek_suggestions (
        article_id, suggestion_type, title, description, reasoning, confidence_score
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    await this.db.query(query, [
      contentItem.content_id,
      'integration-idea',
      `Suggestion for: ${contentItem.title}`,
      suggestion.substring(0, 500),
      suggestion,
      0.8
    ]);
  }

  /**
   * Get pipeline statistics
   */
  async getStatistics() {
    const queries = {
      totalArticles: 'SELECT COUNT(*) FROM research_articles',
      extractedArticles: "SELECT COUNT(*) FROM research_articles WHERE status = 'extracted'",
      pendingArticles: "SELECT COUNT(*) FROM research_articles WHERE status = 'pending'",
      totalTopics: 'SELECT COUNT(*) FROM research_topics',
      totalSeeds: 'SELECT COUNT(*) FROM research_seeds',
      pendingQueue: "SELECT COUNT(*) FROM content_queue WHERE status = 'pending'",
      suggestions: 'SELECT COUNT(*) FROM deepseek_suggestions',
    };
    
    const stats = {};
    
    for (const [key, query] of Object.entries(queries)) {
      const result = await this.db.query(query);
      stats[key] = parseInt(result.rows[0].count);
    }
    
    return stats;
  }

  /**
   * Helper: Create batches
   */
  createBatches(array, size) {
    const batches = [];
    for (let i = 0; i < array.length; i += size) {
      batches.push(array.slice(i, i + size));
    }
    return batches;
  }

  /**
   * Helper: Sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup
   */
  async cleanup() {
    await this.completeSession();
    await this.db.end();
    console.log('🧹 Cleanup completed');
  }
}

export default ResearchPipelineService;
