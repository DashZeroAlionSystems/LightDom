// Enhanced Web Crawler Service for LightDom
// Automatically crawls websites and saves SEO data to database

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EnhancedWebCrawlerService {
  constructor() {
    this.browser = null;
    this.crawledUrls = new Set();
    this.discoveredUrls = new Set();
    this.isRunning = false;
    this.crawlInterval = null;
    this.dataFile = path.join(__dirname, '.data', 'crawler-data.json');
    
    // Database connection
    this.dbPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    this.loadData();
    
    // Seed URLs to start crawling
    this.seedUrls = [
      'https://example.com',
      'https://httpbin.org',
      'https://jsonplaceholder.typicode.com',
      'https://www.google.com',
      'https://github.com',
      'https://stackoverflow.com',
      'https://www.wikipedia.org',
      'https://www.reddit.com',
      'https://www.youtube.com',
      'https://www.amazon.com'
    ];
  }

  loadData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        this.crawledUrls = new Set(data.crawledUrls || []);
        this.discoveredUrls = new Set(data.discoveredUrls || []);
        console.log(`📁 Loaded ${this.crawledUrls.size} crawled URLs and ${this.discoveredUrls.size} discovered URLs`);
      }
    } catch (error) {
      console.error('❌ Error loading crawler data:', error.message);
    }
  }

  saveData() {
    try {
      const data = {
        crawledUrls: Array.from(this.crawledUrls),
        discoveredUrls: Array.from(this.discoveredUrls),
        lastUpdate: new Date().toISOString()
      };
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Error saving crawler data:', error.message);
    }
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Enhanced Web Crawler Service...');
      
      // Test database connection
      await this.testDatabaseConnection();
      
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      console.log('✅ Enhanced Web Crawler Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize crawler:', error.message);
    }
  }

  async testDatabaseConnection() {
    try {
      const client = await this.dbPool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async crawlUrl(url) {
    if (this.crawledUrls.has(url)) {
      return null;
    }

    // Ensure browser is initialized
    if (!this.browser) {
      console.log('⚠️  Browser not initialized, initializing now...');
      await this.initialize();
    }

    try {
      console.log(`🕷️  Crawling: ${url}`);
      const page = await this.browser.newPage();
      
      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Set timeout
      await page.setDefaultTimeout(10000);
      
      // Navigate to URL
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Extract comprehensive SEO data
      const seoData = await page.evaluate(() => {
        const title = document.title || 'No Title';
        const description = document.querySelector('meta[name="description"]')?.content || '';
        const keywords = document.querySelector('meta[name="keywords"]')?.content || '';
        const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
        const robots = document.querySelector('meta[name="robots"]')?.content || '';
        
        // Open Graph data
        const ogTitle = document.querySelector('meta[property="og:title"]')?.content || '';
        const ogDescription = document.querySelector('meta[property="og:description"]')?.content || '';
        const ogImage = document.querySelector('meta[property="og:image"]')?.content || '';
        const ogUrl = document.querySelector('meta[property="og:url"]')?.content || '';
        
        // Twitter Card data
        const twitterCard = document.querySelector('meta[name="twitter:card"]')?.content || '';
        const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.content || '';
        const twitterDescription = document.querySelector('meta[name="twitter:description"]')?.content || '';
        const twitterImage = document.querySelector('meta[name="twitter:image"]')?.content || '';
        
        // Structured data
        const structuredData = [];
        const structuredDataScripts = document.querySelectorAll('script[type="application/ld+json"]');
        structuredDataScripts.forEach(script => {
          try {
            const jsonData = JSON.parse(script.textContent || '');
            structuredData.push(jsonData);
          } catch (error) {
            console.warn('Invalid JSON-LD:', error);
          }
        });
        
        // Links analysis
        const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
          href: a.href,
          text: a.textContent?.trim() || '',
          title: a.title || '',
          rel: a.rel || ''
        })).slice(0, 50);
        
        // Images analysis
        const images = Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt || '',
          title: img.title || '',
          width: img.width || 0,
          height: img.height || 0,
          loading: img.loading || 'eager'
        })).slice(0, 20);
        
        // Headings analysis
        const headings = {
          h1: Array.from(document.querySelectorAll('h1')).map(h => h.textContent?.trim()).filter(Boolean),
          h2: Array.from(document.querySelectorAll('h2')).map(h => h.textContent?.trim()).filter(Boolean),
          h3: Array.from(document.querySelectorAll('h3')).map(h => h.textContent?.trim()).filter(Boolean),
          h4: Array.from(document.querySelectorAll('h4')).map(h => h.textContent?.trim()).filter(Boolean),
          h5: Array.from(document.querySelectorAll('h5')).map(h => h.textContent?.trim()).filter(Boolean),
          h6: Array.from(document.querySelectorAll('h6')).map(h => h.textContent?.trim()).filter(Boolean)
        };
        
        // Content analysis
        const bodyText = document.body.innerText || '';
        const wordCount = bodyText.split(/\s+/).length;
        const paragraphCount = document.querySelectorAll('p').length;
        
        // Performance metrics (basic)
        const scripts = document.querySelectorAll('script[src]').length;
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]').length;
        const inlineStyles = document.querySelectorAll('style').length;
        
        return {
          url: window.location.href,
          title,
          description,
          keywords,
          canonical,
          robots,
          ogTitle,
          ogDescription,
          ogImage,
          ogUrl,
          twitterCard,
          twitterTitle,
          twitterDescription,
          twitterImage,
          structuredData,
          links,
          images,
          headings,
          wordCount,
          paragraphCount,
          scripts,
          stylesheets,
          inlineStyles,
          timestamp: new Date().toISOString()
        };
      });

      // Extract DOM structure info
      const domInfo = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const tagCounts = {};
        elements.forEach(el => {
          const tag = el.tagName.toLowerCase();
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
        
        return {
          totalElements: elements.length,
          tagCounts,
          domSize: document.documentElement.outerHTML.length,
          complexity: elements.length / 1000 // Simple complexity metric
        };
      });

      // Calculate SEO score
      const seoScore = this.calculateSEOScore(seoData, domInfo);

      await page.close();
      
      // Mark as crawled
      this.crawledUrls.add(url);
      
      // Add discovered links
      seoData.links.forEach(link => {
        if (this.isValidUrl(link.href) && !this.crawledUrls.has(link.href)) {
          this.discoveredUrls.add(link.href);
        }
      });

      const result = {
        ...seoData,
        domInfo,
        seoScore,
        status: 'success'
      };

      // Save to database
      await this.saveToDatabase(result);

      console.log(`✅ Crawled: ${url} (${domInfo.totalElements} elements, ${domInfo.domSize} bytes, SEO Score: ${seoScore.overall})`);
      return result;

    } catch (error) {
      console.error(`❌ Failed to crawl ${url}:`, error.message);
      this.crawledUrls.add(url); // Mark as attempted
      return {
        url,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  calculateSEOScore(seoData, domInfo) {
    let score = 0;
    let maxScore = 0;

    // Title optimization (20 points)
    maxScore += 20;
    if (seoData.title && seoData.title.length > 0) {
      score += 10;
      if (seoData.title.length >= 30 && seoData.title.length <= 60) {
        score += 10;
      }
    }

    // Meta description (20 points)
    maxScore += 20;
    if (seoData.description && seoData.description.length > 0) {
      score += 10;
      if (seoData.description.length >= 120 && seoData.description.length <= 160) {
        score += 10;
      }
    }

    // Heading structure (15 points)
    maxScore += 15;
    if (seoData.headings.h1.length === 1) score += 5;
    if (seoData.headings.h1.length > 0) score += 5;
    if (seoData.headings.h2.length > 0) score += 5;

    // Content quality (15 points)
    maxScore += 15;
    if (seoData.wordCount > 300) score += 5;
    if (seoData.wordCount > 600) score += 5;
    if (seoData.paragraphCount > 3) score += 5;

    // Technical SEO (15 points)
    maxScore += 15;
    if (seoData.canonical) score += 5;
    if (seoData.robots && !seoData.robots.includes('noindex')) score += 5;
    if (seoData.structuredData.length > 0) score += 5;

    // Social media (10 points)
    maxScore += 10;
    if (seoData.ogTitle) score += 3;
    if (seoData.ogDescription) score += 3;
    if (seoData.ogImage) score += 2;
    if (seoData.twitterCard) score += 2;

    // Performance (5 points)
    maxScore += 5;
    if (domInfo.complexity < 2) score += 5;
    else if (domInfo.complexity < 5) score += 3;

    const overall = Math.round((score / maxScore) * 100);
    
    return {
      overall,
      title: Math.round((seoData.title ? (seoData.title.length >= 30 && seoData.title.length <= 60 ? 20 : 10) : 0) / 20 * 100),
      description: Math.round((seoData.description ? (seoData.description.length >= 120 && seoData.description.length <= 160 ? 20 : 10) : 0) / 20 * 100),
      headings: Math.round((seoData.headings.h1.length === 1 ? 15 : seoData.headings.h1.length > 0 ? 10 : 0) / 15 * 100),
      content: Math.round((seoData.wordCount > 600 ? 15 : seoData.wordCount > 300 ? 10 : 0) / 15 * 100),
      technical: Math.round((seoData.canonical ? 5 : 0) + (seoData.robots && !seoData.robots.includes('noindex') ? 5 : 0) + (seoData.structuredData.length > 0 ? 5 : 0) / 15 * 100),
      social: Math.round(((seoData.ogTitle ? 3 : 0) + (seoData.ogDescription ? 3 : 0) + (seoData.ogImage ? 2 : 0) + (seoData.twitterCard ? 2 : 0)) / 10 * 100),
      performance: Math.round((domInfo.complexity < 2 ? 5 : domInfo.complexity < 5 ? 3 : 0) / 5 * 100)
    };
  }

  async saveToDatabase(crawlData) {
    try {
      console.log('💾 Attempting to save crawl data to database...');
      const client = await this.dbPool.connect();
      
      try {
        // Save to crawled_sites table (if it exists)
        await client.query(`
          INSERT INTO crawled_sites (
            id, url, domain, last_crawled, crawl_frequency, priority,
            seo_score, optimization_potential, current_size, optimized_size,
            space_reclaimed, blockchain_recorded, transaction_hash, 
            metaverse_slot_id, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO UPDATE SET
            last_crawled = $4, crawl_frequency = $5, priority = $6,
            seo_score = $7, optimization_potential = $8, current_size = $9,
            optimized_size = $10, space_reclaimed = $11, 
            blockchain_recorded = $12, transaction_hash = $13,
            metaverse_slot_id = $14, metadata = $15
        `, [
          `crawl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          crawlData.url,
          new URL(crawlData.url).hostname,
          new Date(),
          1, // crawl_frequency
          5, // priority
          Math.round(crawlData.seoScore.overall * 100) / 100,
          Math.round(crawlData.seoScore.overall * 100) / 100, // optimization_potential
          Math.round(crawlData.domInfo.domSize),
          Math.round(crawlData.domInfo.domSize * 0.8), // estimated optimized size
          Math.round(crawlData.domInfo.domSize * 0.2), // space reclaimed
          false, // blockchain_recorded
          null, // transaction_hash
          null, // metaverse_slot_id
          JSON.stringify({
            title: crawlData.title,
            description: crawlData.description,
            keywords: crawlData.keywords,
            headings: crawlData.headings,
            wordCount: crawlData.wordCount,
            paragraphCount: crawlData.paragraphCount,
            seoScore: crawlData.seoScore,
            domInfo: crawlData.domInfo,
            structuredData: crawlData.structuredData,
            socialMedia: {
              ogTitle: crawlData.ogTitle,
              ogDescription: crawlData.ogDescription,
              ogImage: crawlData.ogImage,
              twitterCard: crawlData.twitterCard,
              twitterTitle: crawlData.twitterTitle,
              twitterDescription: crawlData.twitterDescription
            }
          })
        ]);

        // Extract domain from URL with error handling
        let domain = 'unknown';
        try {
          const urlObj = new URL(crawlData.url);
          domain = urlObj.hostname;
        } catch (error) {
          console.warn(`⚠️  Failed to parse URL: ${crawlData.url}, using fallback domain extraction`);
          // Fallback: simple regex extraction
          const match = crawlData.url.match(/https?:\/\/([^\/]+)/);
          if (match) {
            domain = match[1];
          }
        }

        // Save SEO training data to seo_training_data table
        await client.query(`
          INSERT INTO seo_training_data (
            url, domain, page_title, meta_description, seo_score,
            performance_score, technical_score, content_score,
            headings, keywords, word_count, paragraph_count,
            social_media, structured_data, dom_info, crawled_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        `, [
          crawlData.url,
          domain, // Use extracted domain with fallback
          crawlData.title,
          crawlData.description,
          Math.round(crawlData.seoScore.overall * 100) / 100,
          Math.round(crawlData.seoScore.performance * 100) / 100,
          Math.round(crawlData.seoScore.technical * 100) / 100,
          Math.round(crawlData.seoScore.content * 100) / 100,
          JSON.stringify(crawlData.headings),
          crawlData.keywords,
          crawlData.wordCount,
          crawlData.paragraphCount,
          JSON.stringify(crawlData.socialMedia),
          JSON.stringify(crawlData.structuredData),
          JSON.stringify(crawlData.domInfo),
          new Date()
        ]);

        console.log(`💾 Saved SEO training data to database for ${crawlData.url}`);
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('❌ Database save error:', error.message);
      // Don't throw error to prevent crawler from stopping
    }
  }

  isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol) && 
             !url.includes('javascript:') && 
             !url.includes('mailto:') &&
             !url.includes('tel:') &&
             url.length < 2000; // Avoid very long URLs
    } catch {
      return false;
    }
  }

  async startCrawling() {
    if (this.isRunning) {
      console.log('⚠️  Crawler is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting enhanced web crawler...');

    // Initialize browser if not already done
    if (!this.browser) {
      await this.initialize();
    }

    // Start with seed URLs
    for (const url of this.seedUrls) {
      if (!this.crawledUrls.has(url)) {
        await this.crawlUrl(url);
        // Small delay between crawls
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Start continuous crawling
    this.crawlInterval = setInterval(async () => {
      if (this.discoveredUrls.size > 0) {
        const url = this.discoveredUrls.values().next().value;
        this.discoveredUrls.delete(url);
        await this.crawlUrl(url);
        this.saveData();
      }
    }, 5000); // Crawl every 5 seconds

    console.log('✅ Enhanced crawler started');
  }

  stopCrawling() {
    if (!this.isRunning) {
      console.log('⚠️  Crawler is not running');
      return;
    }

    this.isRunning = false;
    if (this.crawlInterval) {
      clearInterval(this.crawlInterval);
      this.crawlInterval = null;
    }
    this.saveData();
    console.log('🛑 Enhanced crawler stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      crawledCount: this.crawledUrls.size,
      discoveredCount: this.discoveredUrls.size,
      lastUpdate: new Date().toISOString(),
      status: this.isRunning ? 'running' : 'stopped'
    };
  }

  getStats() {
    return {
      isRunning: this.isRunning,
      crawledCount: this.crawledUrls.size,
      discoveredCount: this.discoveredUrls.size,
      lastUpdate: new Date().toISOString()
    };
  }

  getRecentCrawls(limit = 10) {
    return Array.from(this.crawledUrls).slice(-limit).map(url => ({
      url,
      crawledAt: new Date().toISOString()
    }));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
    if (this.dbPool) {
      await this.dbPool.end();
    }
  }
}

export default new EnhancedWebCrawlerService();
