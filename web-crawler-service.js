// Web Crawler Service for LightDom
// Automatically crawls and discovers new websites

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WebCrawlerService {
  constructor() {
    this.browser = null;
    this.crawledUrls = new Set();
    this.discoveredUrls = new Set();
    this.isRunning = false;
    this.crawlInterval = null;
    this.dataFile = path.join(__dirname, '.data', 'crawler-data.json');
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
      console.log('🚀 Initializing Web Crawler Service...');
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
      console.log('✅ Web Crawler Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize crawler:', error.message);
    }
  }

  async crawlUrl(url) {
    if (this.crawledUrls.has(url)) {
      return null;
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
      
      // Extract page data
      const pageData = await page.evaluate(() => {
        const title = document.title || 'No Title';
        const description = document.querySelector('meta[name="description"]')?.content || '';
        const keywords = document.querySelector('meta[name="keywords"]')?.content || '';
        const links = Array.from(document.querySelectorAll('a[href]')).map(a => a.href).slice(0, 20);
        const images = Array.from(document.querySelectorAll('img[src]')).map(img => img.src).slice(0, 10);
        const text = document.body.innerText?.substring(0, 1000) || '';
        
        return {
          title,
          description,
          keywords,
          links,
          images,
          text,
          url: window.location.href,
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

      await page.close();
      
      // Mark as crawled
      this.crawledUrls.add(url);
      
      // Add discovered links
      pageData.links.forEach(link => {
        if (this.isValidUrl(link) && !this.crawledUrls.has(link)) {
          this.discoveredUrls.add(link);
        }
      });

      const result = {
        ...pageData,
        domInfo,
        status: 'success'
      };

      console.log(`✅ Crawled: ${url} (${domInfo.totalElements} elements, ${domInfo.domSize} bytes)`);
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

    await this.initialize();
    this.isRunning = true;
    console.log('🕷️  Starting automatic web crawling...');

    // Start with seed URLs
    for (const url of this.seedUrls) {
      if (!this.crawledUrls.has(url)) {
        await this.crawlUrl(url);
        await this.sleep(2000); // Wait 2 seconds between crawls
      }
    }

    // Start continuous crawling
    this.crawlInterval = setInterval(async () => {
      await this.continuousCrawl();
    }, 30000); // Crawl every 30 seconds

    // Save data periodically
    setInterval(() => {
      this.saveData();
    }, 60000); // Save every minute
  }

  async continuousCrawl() {
    if (!this.isRunning || this.discoveredUrls.size === 0) {
      return;
    }

    // Get next URL to crawl
    const nextUrl = Array.from(this.discoveredUrls)[0];
    if (nextUrl) {
      this.discoveredUrls.delete(nextUrl);
      await this.crawlUrl(nextUrl);
      await this.sleep(1000); // Wait 1 second between continuous crawls
    }
  }

  async stopCrawling() {
    this.isRunning = false;
    if (this.crawlInterval) {
      clearInterval(this.crawlInterval);
      this.crawlInterval = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    this.saveData();
    console.log('🛑 Web crawler stopped');
  }

  getStats() {
    return {
      crawled: this.crawledUrls.size,
      discovered: this.discoveredUrls.size,
      isRunning: this.isRunning,
      lastUpdate: new Date().toISOString()
    };
  }

  getRecentCrawls(limit = 10) {
    // This would need to be enhanced to store actual crawl results
    return Array.from(this.crawledUrls).slice(-limit).map(url => ({
      url,
      timestamp: new Date().toISOString(),
      status: 'crawled'
    }));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create and export crawler instance
const crawler = new WebCrawlerService();

// Auto-start crawler
crawler.startCrawling().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down web crawler...');
  await crawler.stopCrawling();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down web crawler...');
  await crawler.stopCrawling();
  process.exit(0);
});

export default crawler;
