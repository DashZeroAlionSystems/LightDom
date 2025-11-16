/**
 * Storybook Discovery Service
 * 
 * Automatically discovers Storybook instances on the internet and mines
 * UX/UI component libraries with visual components and tests.
 * 
 * Features:
 * - URL discovery and seeding for Storybook instances
 * - Detection of Storybook installations via DOM inspection
 * - Component library extraction and analysis
 * - Integration with crawler and URL seeding services
 * - Configurable discovery algorithms
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class StorybookDiscoveryService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      maxConcurrency: config.maxConcurrency || 3,
      requestDelay: config.requestDelay || 2000,
      timeout: config.timeout || 30000,
      waitForStorybook: config.waitForStorybook || 5000,
      userAgent: config.userAgent || 'LightDom-Storybook-Miner/1.0',
      outputDir: config.outputDir || './mined-storybooks',
      ...config,
    };

    this.browser = null;
    this.isRunning = false;
    this.discoveredInstances = new Map(); // url -> instance data
    this.processingQueue = [];
    this.stats = {
      instancesDiscovered: 0,
      instancesProcessed: 0,
      componentsMined: 0,
      storiesExtracted: 0,
      errors: 0,
      startedAt: null,
      lastUpdate: null,
    };

    // Detection patterns for Storybook instances
    this.detectionPatterns = {
      domSelectors: [
        '#storybook-root',
        '#docs-root',
        '[data-storybook]',
        '.sb-show-main',
        '.sidebar-container',
        '#storybook-preview-iframe',
      ],
      scriptPatterns: [
        /storybook/i,
        /stories/i,
        /preview-/i,
        /manager-/i,
      ],
      metaKeywords: [
        'storybook',
        'component library',
        'design system',
        'ui components',
      ],
    };

    // Well-known Storybook instances to seed discovery
    this.seedUrls = [
      'https://storybook.js.org/showcase',
      'https://component.gallery',
      'https://main--624b4db2c36c3900398eea65.chromatic.com', // Ant Design
      'https://react.carbondesignsystem.com', // IBM Carbon
      'https://5ccbc373887ca40020446347--material-components-web.netlify.app', // Material
      'https://primer.style/react/storybook', // GitHub Primer
      'https://storybook.grommet.io', // Grommet
      'https://chakra-ui.com/docs/components', // Chakra UI
    ];
  }

  /**
   * Initialize the discovery service
   */
  async initialize() {
    if (this.browser) {
      return;
    }

    console.log('🚀 Initializing Storybook Discovery Service...');
    
    try {
      // Ensure output directory exists
      await fs.mkdir(this.config.outputDir, { recursive: true });
      
      // Launch browser for JavaScript-heavy sites
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      
      console.log('✅ Storybook Discovery Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize:', error.message);
      throw error;
    }
  }

  /**
   * Start the discovery process
   */
  async start(seedUrls = null) {
    if (this.isRunning) {
      throw new Error('Discovery service is already running');
    }

    await this.initialize();
    
    this.isRunning = true;
    this.stats.startedAt = new Date().toISOString();
    
    const seeds = seedUrls || this.seedUrls;
    console.log(`🔍 Starting Storybook discovery with ${seeds.length} seed URLs...`);
    
    // Add seeds to processing queue
    this.processingQueue = seeds.map(url => ({
      url,
      priority: 10,
      discovered: false,
    }));
    
    // Process queue
    await this.processQueue();
    
    this.emit('discovery:complete', {
      instancesDiscovered: this.stats.instancesDiscovered,
      componentsMined: this.stats.componentsMined,
    });
    
    console.log('✅ Discovery complete');
    return this.getStats();
  }

  /**
   * Process the discovery queue
   */
  async processQueue() {
    const concurrency = this.config.maxConcurrency;
    const workers = [];
    
    for (let i = 0; i < concurrency; i++) {
      workers.push(this.worker(i));
    }
    
    await Promise.all(workers);
  }

  /**
   * Worker to process URLs from queue
   */
  async worker(workerId) {
    console.log(`🤖 Worker ${workerId} started`);
    
    while (this.processingQueue.length > 0 && this.isRunning) {
      const item = this.processingQueue.shift();
      if (!item) break;
      
      try {
        console.log(`🔎 Worker ${workerId} processing: ${item.url}`);
        
        // Detect if URL is a Storybook instance
        const isStorybook = await this.detectStorybook(item.url);
        
        if (isStorybook) {
          console.log(`✨ Found Storybook instance: ${item.url}`);
          
          // Mine the Storybook instance
          await this.mineStorybookInstance(item.url);
          
          // Discover related URLs
          if (!item.discovered) {
            const relatedUrls = await this.discoverRelatedUrls(item.url);
            this.addToQueue(relatedUrls);
          }
        }
        
        // Delay between requests
        await this.delay(this.config.requestDelay);
        
      } catch (error) {
        console.error(`❌ Worker ${workerId} error processing ${item.url}:`, error.message);
        this.stats.errors++;
      }
    }
    
    console.log(`🛑 Worker ${workerId} finished`);
  }

  /**
   * Detect if a URL hosts a Storybook instance
   */
  async detectStorybook(url) {
    const page = await this.browser.newPage();
    
    try {
      await page.setUserAgent(this.config.userAgent);
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: this.config.timeout 
      });
      
      // Wait for potential Storybook to load
      await this.delay(this.config.waitForStorybook);
      
      // Check for Storybook indicators
      const isStorybook = await page.evaluate((patterns) => {
        // Check DOM selectors
        for (const selector of patterns.domSelectors) {
          if (document.querySelector(selector)) {
            return true;
          }
        }
        
        // Check scripts
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        for (const script of scripts) {
          const src = script.getAttribute('src') || '';
          for (const pattern of patterns.scriptPatterns) {
            if (pattern.test(src)) {
              return true;
            }
          }
        }
        
        // Check meta tags
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          const content = (metaDescription.getAttribute('content') || '').toLowerCase();
          for (const keyword of patterns.metaKeywords) {
            if (content.includes(keyword)) {
              return true;
            }
          }
        }
        
        // Check page title
        const title = document.title.toLowerCase();
        for (const keyword of patterns.metaKeywords) {
          if (title.includes(keyword)) {
            return true;
          }
        }
        
        return false;
      }, {
        domSelectors: this.detectionPatterns.domSelectors,
        scriptPatterns: this.detectionPatterns.scriptPatterns.map(p => p.source),
        metaKeywords: this.detectionPatterns.metaKeywords,
      });
      
      return isStorybook;
      
    } catch (error) {
      console.error(`Failed to detect Storybook at ${url}:`, error.message);
      return false;
    } finally {
      await page.close();
    }
  }

  /**
   * Mine components from a Storybook instance
   */
  async mineStorybookInstance(url) {
    const page = await this.browser.newPage();
    
    try {
      console.log(`⛏️  Mining Storybook instance: ${url}`);
      
      await page.setUserAgent(this.config.userAgent);
      await page.goto(url, { 
        waitUntil: 'networkidle2', 
        timeout: this.config.timeout 
      });
      
      await this.delay(this.config.waitForStorybook);
      
      // Extract Storybook data
      const storybookData = await page.evaluate(() => {
        const data = {
          title: document.title,
          url: window.location.href,
          stories: [],
          components: [],
          metadata: {},
        };
        
        // Try to access Storybook API if available
        if (window.__STORYBOOK_PREVIEW__) {
          try {
            const preview = window.__STORYBOOK_PREVIEW__;
            if (preview.storyStore && preview.storyStore.raw) {
              const stories = preview.storyStore.raw();
              data.stories = Object.keys(stories).map(key => ({
                id: key,
                ...stories[key],
              }));
            }
          } catch (e) {
            console.error('Failed to access Storybook API:', e);
          }
        }
        
        // Extract sidebar items
        const sidebarItems = Array.from(document.querySelectorAll('[data-item-id], .sidebar-item, .sidebar-subheading'));
        data.components = sidebarItems.map(item => ({
          id: item.getAttribute('data-item-id') || item.textContent?.trim(),
          text: item.textContent?.trim(),
          type: item.classList.contains('sidebar-subheading') ? 'category' : 'story',
        }));
        
        return data;
      });
      
      // Save instance data
      this.discoveredInstances.set(url, storybookData);
      this.stats.instancesDiscovered++;
      this.stats.componentsMined += storybookData.components.length;
      this.stats.storiesExtracted += storybookData.stories.length;
      
      // Save to filesystem
      await this.saveInstanceData(url, storybookData);
      
      console.log(`✅ Mined ${storybookData.components.length} components and ${storybookData.stories.length} stories from ${url}`);
      
      this.emit('instance:mined', { url, data: storybookData });
      
    } catch (error) {
      console.error(`Failed to mine Storybook at ${url}:`, error.message);
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * Discover related Storybook URLs from a page
   */
  async discoverRelatedUrls(url) {
    try {
      console.log(`🔗 Discovering related URLs from ${url}...`);
      
      const response = await axios.get(url, {
        timeout: this.config.timeout,
        headers: {
          'User-Agent': this.config.userAgent,
        },
      });
      
      const $ = cheerio.load(response.data);
      const links = [];
      
      // Extract all links
      $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (href) {
          try {
            const absoluteUrl = new URL(href, url).href;
            
            // Filter for potentially Storybook-related URLs
            if (this.isStorybookRelated(absoluteUrl)) {
              links.push(absoluteUrl);
            }
          } catch (e) {
            // Invalid URL, skip
          }
        }
      });
      
      console.log(`🔗 Discovered ${links.length} related URLs`);
      return links;
      
    } catch (error) {
      console.error(`Failed to discover related URLs from ${url}:`, error.message);
      return [];
    }
  }

  /**
   * Check if URL is potentially Storybook-related
   */
  isStorybookRelated(url) {
    const lowerUrl = url.toLowerCase();
    const patterns = [
      'storybook',
      'component',
      'design-system',
      'ui-library',
      'docs',
      'showcase',
      'chromatic.com',
      'vercel.app',
      'netlify.app',
      'github.io',
    ];
    
    return patterns.some(pattern => lowerUrl.includes(pattern));
  }

  /**
   * Add URLs to processing queue
   */
  addToQueue(urls) {
    for (const url of urls) {
      // Don't add duplicates
      const exists = this.processingQueue.some(item => item.url === url) ||
                     this.discoveredInstances.has(url);
      
      if (!exists) {
        this.processingQueue.push({
          url,
          priority: 5,
          discovered: true,
        });
      }
    }
  }

  /**
   * Save instance data to filesystem
   */
  async saveInstanceData(url, data) {
    try {
      const urlHash = Buffer.from(url).toString('base64').replace(/[/+=]/g, '_');
      const filename = `storybook_${urlHash}.json`;
      const filepath = path.join(this.config.outputDir, filename);
      
      await fs.writeFile(
        filepath,
        JSON.stringify({ url, ...data }, null, 2),
        'utf-8'
      );
      
      console.log(`💾 Saved instance data: ${filename}`);
    } catch (error) {
      console.error(`Failed to save instance data:`, error.message);
    }
  }

  /**
   * Get discovery statistics
   */
  getStats() {
    return {
      ...this.stats,
      lastUpdate: new Date().toISOString(),
      isRunning: this.isRunning,
      queueLength: this.processingQueue.length,
      instancesInMemory: this.discoveredInstances.size,
    };
  }

  /**
   * Stop the discovery service
   */
  async stop() {
    console.log('🛑 Stopping Storybook Discovery Service...');
    this.isRunning = false;
    
    // Wait for workers to finish current tasks
    await this.delay(2000);
    
    console.log('✅ Discovery service stopped');
  }

  /**
   * Close and cleanup
   */
  async close() {
    await this.stop();
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    
    console.log('✅ Discovery service closed');
  }

  /**
   * Utility: Delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Export discovered instances
   */
  async exportDiscovered(format = 'json') {
    const instances = Array.from(this.discoveredInstances.entries()).map(([url, data]) => ({
      url,
      ...data,
    }));
    
    const exportPath = path.join(
      this.config.outputDir,
      `discovered_instances_${Date.now()}.${format}`
    );
    
    if (format === 'json') {
      await fs.writeFile(
        exportPath,
        JSON.stringify(instances, null, 2),
        'utf-8'
      );
    } else if (format === 'csv') {
      const csv = this.toCSV(instances);
      await fs.writeFile(exportPath, csv, 'utf-8');
    }
    
    console.log(`📦 Exported ${instances.length} instances to ${exportPath}`);
    return exportPath;
  }

  /**
   * Convert to CSV format
   */
  toCSV(instances) {
    const headers = ['URL', 'Title', 'Components', 'Stories'];
    const rows = instances.map(inst => [
      inst.url,
      inst.title || '',
      inst.components?.length || 0,
      inst.stories?.length || 0,
    ]);
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');
  }
}

export default StorybookDiscoveryService;
