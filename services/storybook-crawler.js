/**
 * Storybook Crawler
 * 
 * Specialized crawler for Storybook instances that extracts:
 * - Component definitions and props
 * - Story configurations
 * - Design tokens and styles
 * - Interaction tests
 * - Documentation
 * 
 * Integrates with RealWebCrawlerSystem and StorybookMiningService
 */

import { EventEmitter } from 'events';
import puppeteer from 'puppeteer';
import { StorybookDiscoveryService } from './storybook-discovery-service.js';
import { StorybookSeederService } from './storybook-seeder-service.js';

export class StorybookCrawler extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      maxConcurrency: config.maxConcurrency || 3,
      requestDelay: config.requestDelay || 2000,
      maxDepth: config.maxDepth || 2,
      timeout: config.timeout || 30000,
      waitForStorybook: config.waitForStorybook || 5000,
      extractCode: config.extractCode !== false,
      extractStyles: config.extractStyles !== false,
      extractTests: config.extractTests !== false,
      ...config,
    };

    this.discoveryService = new StorybookDiscoveryService(config);
    this.seederService = new StorybookSeederService(config);
    
    this.browser = null;
    this.isRunning = false;
    this.crawledComponents = new Map();
    
    this.stats = {
      instancesCrawled: 0,
      componentsMined: 0,
      storiesExtracted: 0,
      propsExtracted: 0,
      testsExtracted: 0,
      errors: 0,
    };
  }

  /**
   * Initialize crawler
   */
  async initialize() {
    if (this.browser) {
      return;
    }
    
    console.log('🚀 Initializing Storybook Crawler...');
    
    await this.discoveryService.initialize();
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    console.log('✅ Storybook Crawler initialized');
  }

  /**
   * Start crawling with automatic seeding and discovery
   */
  async start(options = {}) {
    await this.initialize();
    
    this.isRunning = true;
    
    console.log('🕷️  Starting Storybook crawling...');
    
    // Step 1: Generate seeds
    console.log('🌱 Generating seeds...');
    await this.seederService.generateSeeds();
    const seeds = this.seederService.getSeeds({ limit: options.maxSeeds || 50 });
    
    console.log(`📋 Generated ${seeds.length} seed URLs`);
    
    // Step 2: Discover Storybook instances
    if (options.discover !== false) {
      console.log('🔍 Discovering Storybook instances...');
      const seedUrls = seeds.map(s => s.url);
      await this.discoveryService.start(seedUrls);
    }
    
    // Step 3: Deep crawl discovered instances
    console.log('⛏️  Deep crawling discovered instances...');
    const instances = Array.from(this.discoveryService.discoveredInstances.keys());
    
    for (const url of instances) {
      if (!this.isRunning) break;
      
      try {
        await this.crawlStorybookInstance(url);
        await this.delay(this.config.requestDelay);
      } catch (error) {
        console.error(`Failed to crawl ${url}:`, error.message);
        this.stats.errors++;
      }
    }
    
    console.log('✅ Crawling complete');
    return this.getStats();
  }

  /**
   * Crawl a single Storybook instance in depth
   */
  async crawlStorybookInstance(url) {
    console.log(`🕷️  Deep crawling Storybook: ${url}`);
    
    const page = await this.browser.newPage();
    
    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.config.timeout,
      });
      
      await this.delay(this.config.waitForStorybook);
      
      // Extract comprehensive data
      const storybookData = await page.evaluate((extractConfig) => {
        const data = {
          url: window.location.href,
          components: [],
          stories: [],
          addons: [],
          config: {},
        };
        
        // Access Storybook API
        if (window.__STORYBOOK_PREVIEW__) {
          const preview = window.__STORYBOOK_PREVIEW__;
          
          // Extract stories
          if (preview.storyStore) {
            try {
              const storyStore = preview.storyStore;
              const stories = storyStore.raw ? storyStore.raw() : {};
              
              for (const [storyId, story] of Object.entries(stories)) {
                data.stories.push({
                  id: storyId,
                  name: story.name,
                  title: story.title,
                  parameters: story.parameters,
                  args: story.args,
                  argTypes: story.argTypes,
                  play: story.play ? 'function' : null,
                });
                
                // Extract component info
                if (story.component) {
                  const componentName = story.component.displayName || 
                                       story.component.name || 
                                       'Unknown';
                  
                  if (!data.components.find(c => c.name === componentName)) {
                    data.components.push({
                      name: componentName,
                      stories: [],
                      props: {},
                    });
                  }
                  
                  const comp = data.components.find(c => c.name === componentName);
                  comp.stories.push(storyId);
                  
                  // Merge argTypes as props
                  if (story.argTypes) {
                    comp.props = { ...comp.props, ...story.argTypes };
                  }
                }
              }
            } catch (e) {
              console.error('Failed to extract stories:', e);
            }
          }
          
          // Extract addons info
          if (preview.addons) {
            try {
              data.addons = Object.keys(preview.addons);
            } catch (e) {
              // Addons info not available
            }
          }
        }
        
        // Extract from DOM
        const sidebar = document.querySelector('.sidebar-container');
        if (sidebar) {
          const items = sidebar.querySelectorAll('[data-item-id]');
          items.forEach(item => {
            const itemId = item.getAttribute('data-item-id');
            const itemText = item.textContent?.trim();
            
            if (itemId && !data.stories.find(s => s.id === itemId)) {
              data.stories.push({
                id: itemId,
                name: itemText || itemId,
                source: 'dom',
              });
            }
          });
        }
        
        return data;
      }, {
        extractCode: this.config.extractCode,
        extractStyles: this.config.extractStyles,
      });
      
      // Store crawled data
      this.crawledComponents.set(url, storybookData);
      
      // Update stats
      this.stats.instancesCrawled++;
      this.stats.componentsMined += storybookData.components.length;
      this.stats.storiesExtracted += storybookData.stories.length;
      
      console.log(`✅ Crawled: ${storybookData.components.length} components, ${storybookData.stories.length} stories`);
      
      // Emit event
      this.emit('instance:crawled', { url, data: storybookData });
      
      // Extract individual stories if enabled
      if (this.config.maxDepth > 1) {
        await this.extractIndividualStories(page, storybookData);
      }
      
    } catch (error) {
      console.error(`Failed to crawl Storybook instance:`, error.message);
      throw error;
    } finally {
      await page.close();
    }
  }

  /**
   * Extract individual story details
   */
  async extractIndividualStories(page, storybookData) {
    const storyLimit = 10; // Limit stories per instance
    const stories = storybookData.stories.slice(0, storyLimit);
    
    console.log(`📖 Extracting ${stories.length} individual stories...`);
    
    for (const story of stories) {
      try {
        // Navigate to story
        const storyUrl = `${storybookData.url}?path=/story/${story.id}`;
        await page.goto(storyUrl, {
          waitUntil: 'networkidle2',
          timeout: this.config.timeout,
        });
        
        await this.delay(2000);
        
        // Extract story details
        const storyDetails = await page.evaluate(() => {
          const details = {
            html: null,
            styles: {},
            interactions: [],
          };
          
          // Get story iframe content
          const iframe = document.querySelector('#storybook-preview-iframe');
          if (iframe && iframe.contentDocument) {
            const body = iframe.contentDocument.body;
            details.html = body.innerHTML;
            
            // Extract computed styles
            const firstElement = body.firstElementChild;
            if (firstElement) {
              const computedStyle = window.getComputedStyle(firstElement);
              details.styles = {
                display: computedStyle.display,
                backgroundColor: computedStyle.backgroundColor,
                color: computedStyle.color,
                fontSize: computedStyle.fontSize,
                padding: computedStyle.padding,
                margin: computedStyle.margin,
                borderRadius: computedStyle.borderRadius,
              };
            }
          }
          
          return details;
        });
        
        // Merge story details
        Object.assign(story, storyDetails);
        
      } catch (error) {
        console.error(`Failed to extract story ${story.id}:`, error.message);
      }
    }
  }

  /**
   * Stop crawling
   */
  async stop() {
    console.log('🛑 Stopping Storybook Crawler...');
    this.isRunning = false;
    
    await this.discoveryService.stop();
    
    console.log('✅ Crawler stopped');
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
    
    await this.discoveryService.close();
    
    console.log('✅ Crawler closed');
  }

  /**
   * Get crawling statistics
   */
  getStats() {
    return {
      ...this.stats,
      discoveryStats: this.discoveryService.getStats(),
      seederStats: this.seederService.getStats(),
      componentsInMemory: this.crawledComponents.size,
    };
  }

  /**
   * Get all crawled data
   */
  getCrawledData() {
    return Array.from(this.crawledComponents.entries()).map(([url, data]) => ({
      url,
      ...data,
    }));
  }

  /**
   * Export crawled data
   */
  async exportData(format = 'json') {
    const data = this.getCrawledData();
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    
    // Additional formats can be added
    return data;
  }

  /**
   * Utility: Delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default StorybookCrawler;
