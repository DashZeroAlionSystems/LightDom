/**
 * SEO Header Script Injection Service
 * 
 * Provides per-client SEO optimization through header script injection.
 * This service generates and serves customized JavaScript that clients can
 * inject into their websites to improve SEO performance.
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SEO Header Script Injection Service
 */
export class SeoHeaderScriptService {
  constructor(options = {}) {
    this.scriptsDir = options.scriptsDir || path.join(__dirname, '../public/seo-scripts');
    this.baseUrl = options.baseUrl || 'http://localhost:3001';
    this.strategies = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the service
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Ensure scripts directory exists
      await fs.mkdir(this.scriptsDir, { recursive: true });
      console.log('✅ SEO Header Script Service initialized');
      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize SEO Header Script Service:', error);
      throw error;
    }
  }

  /**
   * Generate SEO strategy for client
   */
  async generateStrategy(clientId, config) {
    const strategyId = this.generateStrategyId(clientId);
    const strategy = {
      id: strategyId,
      clientId,
      domain: config.domain,
      keywords: config.strategy?.keywords || [],
      metadata: config.strategy?.metadata || {},
      structuredData: config.strategy?.structuredData || {},
      options: config.options || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.strategies.set(strategyId, strategy);
    return strategy;
  }

  /**
   * Generate SEO optimization script
   */
  async generateScript(strategy) {
    const scriptContent = this.buildScriptContent(strategy);
    const scriptFilename = `${strategy.clientId}-${strategy.id}.js`;
    const scriptPath = path.join(this.scriptsDir, scriptFilename);

    // Write script to file
    await fs.writeFile(scriptPath, scriptContent, 'utf8');

    return {
      filename: scriptFilename,
      path: scriptPath,
      url: `${this.baseUrl}/seo-scripts/${scriptFilename}`
    };
  }

  /**
   * Build script content with SEO optimizations
   */
  buildScriptContent(strategy) {
    return `
(function(window, document) {
  'use strict';

  /**
   * LightDom SEO Optimization Script
   * Client: ${strategy.clientId}
   * Strategy: ${strategy.id}
   * Generated: ${strategy.createdAt}
   */

  const LightDomSEO = {
    config: ${JSON.stringify({
      clientId: strategy.clientId,
      domain: strategy.domain,
      keywords: strategy.keywords,
      metadata: strategy.metadata,
      structuredData: strategy.structuredData
    }, null, 2)},

    /**
     * Initialize SEO optimizations
     */
    init: function() {
      console.log('[LightDom SEO] Initializing optimizations...');
      
      // Apply meta tags
      this.applyMetadata();
      
      // Inject structured data
      this.injectStructuredData();
      
      // Setup analytics
      this.setupAnalytics();
      
      // Monitor performance
      this.monitorPerformance();
      
      console.log('[LightDom SEO] Optimizations applied successfully');
    },

    /**
     * Apply metadata optimizations
     */
    applyMetadata: function() {
      const metadata = this.config.metadata;
      
      // Update title
      if (metadata.title && !document.title) {
        document.title = metadata.title;
      }
      
      // Update description
      if (metadata.description) {
        this.setMetaTag('description', metadata.description);
      }
      
      // Update keywords
      if (this.config.keywords && this.config.keywords.length > 0) {
        this.setMetaTag('keywords', this.config.keywords.join(', '));
      }
      
      // Open Graph tags
      if (metadata.ogTitle) {
        this.setMetaTag('og:title', metadata.ogTitle, 'property');
      }
      if (metadata.ogDescription) {
        this.setMetaTag('og:description', metadata.ogDescription, 'property');
      }
      if (metadata.ogImage) {
        this.setMetaTag('og:image', metadata.ogImage, 'property');
      }
      
      // Twitter Card tags
      if (metadata.twitterCard) {
        this.setMetaTag('twitter:card', metadata.twitterCard);
      }
      if (metadata.twitterTitle) {
        this.setMetaTag('twitter:title', metadata.twitterTitle);
      }
      if (metadata.twitterDescription) {
        this.setMetaTag('twitter:description', metadata.twitterDescription);
      }
    },

    /**
     * Set meta tag
     */
    setMetaTag: function(name, content, attribute = 'name') {
      let meta = document.querySelector(\`meta[\${attribute}="\${name}"]\`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    },

    /**
     * Inject structured data
     */
    injectStructuredData: function() {
      const structuredData = this.config.structuredData;
      
      if (!structuredData || Object.keys(structuredData).length === 0) {
        return;
      }
      
      // Create script tag for JSON-LD
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
      
      console.log('[LightDom SEO] Structured data injected');
    },

    /**
     * Setup analytics tracking
     */
    setupAnalytics: function() {
      // Track page view
      this.trackEvent('page_view', {
        page_title: document.title,
        page_location: window.location.href,
        client_id: this.config.clientId
      });
      
      // Track user engagement
      this.trackEngagement();
    },

    /**
     * Track analytics event
     */
    trackEvent: function(eventName, params) {
      // Send to LightDom analytics
      if (typeof fetch !== 'undefined') {
        fetch('${this.baseUrl}/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Client-Id': this.config.clientId
          },
          body: JSON.stringify({
            event: eventName,
            params: params,
            timestamp: new Date().toISOString()
          })
        }).catch(function(err) {
          console.warn('[LightDom SEO] Analytics error:', err);
        });
      }
    },

    /**
     * Track user engagement
     */
    trackEngagement: function() {
      let startTime = Date.now();
      let engaged = false;
      
      const trackEngagementTime = function() {
        if (!engaged) return;
        const duration = Date.now() - startTime;
        this.trackEvent('engagement_time', {
          duration: duration,
          page: window.location.pathname
        });
      }.bind(this);
      
      // Track when user becomes engaged
      ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(function(event) {
        document.addEventListener(event, function() {
          if (!engaged) {
            engaged = true;
            console.log('[LightDom SEO] User engagement detected');
          }
        }, { once: true });
      });
      
      // Track before page unload
      window.addEventListener('beforeunload', trackEngagementTime);
      
      // Track every 30 seconds
      setInterval(trackEngagementTime, 30000);
    },

    /**
     * Monitor performance
     */
    monitorPerformance: function() {
      if (typeof window.PerformanceObserver === 'undefined') {
        return;
      }
      
      // Observe page performance
      try {
        const observer = new PerformanceObserver(function(list) {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              this.trackEvent('page_performance', {
                loadTime: entry.loadEventEnd - entry.fetchStart,
                domContentLoaded: entry.domContentLoadedEventEnd - entry.fetchStart,
                domInteractive: entry.domInteractive - entry.fetchStart
              });
            }
          }
        }.bind(this));
        
        observer.observe({ entryTypes: ['navigation'] });
      } catch (err) {
        console.warn('[LightDom SEO] Performance monitoring error:', err);
      }
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      LightDomSEO.init();
    });
  } else {
    LightDomSEO.init();
  }

  // Expose to window for debugging
  window.LightDomSEO = LightDomSEO;

})(window, document);
`.trim();
  }

  /**
   * Generate script tag for injection
   */
  generateScriptTag(scriptUrl, options = {}) {
    const attributes = [];
    
    if (options.async) {
      attributes.push('async');
    }
    if (options.defer) {
      attributes.push('defer');
    }
    
    const attrs = attributes.length > 0 ? ' ' + attributes.join(' ') : '';
    return `<script${attrs} src="${scriptUrl}"></script>`;
  }

  /**
   * Inject SEO script for client
   */
  async injectScript(clientId, config) {
    await this.initialize();

    // Generate strategy
    const strategy = await this.generateStrategy(clientId, config);

    // Generate script file
    const script = await this.generateScript(strategy);

    // Generate script tag
    const scriptTag = this.generateScriptTag(script.url, config.options);

    return {
      success: true,
      strategyId: strategy.id,
      scriptUrl: script.url,
      scriptTag,
      message: 'SEO script injected successfully',
      strategy
    };
  }

  /**
   * Get strategy for client
   */
  getStrategy(clientId) {
    for (const [id, strategy] of this.strategies.entries()) {
      if (strategy.clientId === clientId) {
        return strategy;
      }
    }
    return null;
  }

  /**
   * Update strategy
   */
  async updateStrategy(strategyId, updates) {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) {
      throw new Error('Strategy not found');
    }

    // Update strategy
    Object.assign(strategy, updates, {
      updatedAt: new Date().toISOString()
    });

    // Regenerate script
    await this.generateScript(strategy);

    return strategy;
  }

  /**
   * Generate strategy ID
   */
  generateStrategyId(clientId) {
    const hash = crypto.createHash('sha256');
    hash.update(`${clientId}-${Date.now()}`);
    return `seo-strategy-${hash.digest('hex').substring(0, 16)}`;
  }
}

export default SeoHeaderScriptService;
