/**
 * Enterprise Crawler Configuration Service
 * 
 * Provides advanced crawler configuration including:
 * - Rotating proxy support
 * - robots.txt compliance
 * - Chrome DevTools Protocol integration
 * - 3D Layers mining
 * - OCR worker integration
 * - Anti-scraping resilience
 * - Performance optimization
 */

import { EventEmitter } from 'events';

class EnterpriseCrawlerConfigService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      // Proxy Configuration
      proxies: {
        enabled: config.proxies?.enabled !== false,
        rotation: config.proxies?.rotation || 'round-robin', // round-robin, least-used, smart
        providers: config.proxies?.providers || [],
        rotateInterval: config.proxies?.rotateInterval || 10, // requests per proxy
        failover: config.proxies?.failover !== false,
        healthCheck: config.proxies?.healthCheck !== false,
        timeout: config.proxies?.timeout || 10000,
      },

      // robots.txt Compliance
      robots: {
        enabled: config.robots?.enabled !== false,
        cacheTime: config.robots?.cacheTime || 3600000, // 1 hour
        respectCrawlDelay: config.robots?.respectCrawlDelay !== false,
        minDelay: config.robots?.minDelay || 1000, // minimum 1 second
        maxDelay: config.robots?.maxDelay || 10000, // maximum 10 seconds
        userAgent: config.robots?.userAgent || 'LightDomBot/1.0',
      },

      // Chrome DevTools Protocol (CDP)
      cdp: {
        enabled: config.cdp?.enabled !== false,
        layersPanel: config.cdp?.layersPanel !== false,
        performance: config.cdp?.performance !== false,
        network: config.cdp?.network !== false,
        coverage: config.cdp?.coverage || false,
      },

      // 3D Layers Mining
      layers3D: {
        enabled: config.layers3D?.enabled || false,
        maxDepth: config.layers3D?.maxDepth || 8,
        minImportance: config.layers3D?.minImportance || 0.4,
        extractCompositing: config.layers3D?.extractCompositing !== false,
        gpuAcceleration: config.layers3D?.gpuAcceleration || 'auto',
      },

      // OCR Worker Integration
      ocr: {
        enabled: config.ocr?.enabled || false,
        endpoint: config.ocr?.endpoint || process.env.OCR_WORKER_URL || 'http://localhost:4205/ocr',
        maxImages: config.ocr?.maxImages || 4,
        compressionRatio: config.ocr?.compressionRatio || 0.1, // 10x compression
        minPrecision: config.ocr?.minPrecision || 0.95,
        batchSize: config.ocr?.batchSize || 20,
      },

      // Anti-Scraping Resilience
      resilience: {
        retryAttempts: config.resilience?.retryAttempts || 3,
        retryDelay: config.resilience?.retryDelay || 2000,
        exponentialBackoff: config.resilience?.exponentialBackoff !== false,
        maxBackoff: config.resilience?.maxBackoff || 32000,
        captchaSolver: config.resilience?.captchaSolver || null,
        userAgentRotation: config.resilience?.userAgentRotation !== false,
        browserFingerprint: config.resilience?.browserFingerprint || 'randomize',
        javascriptEnabled: config.resilience?.javascriptEnabled !== false,
        cookiesEnabled: config.resilience?.cookiesEnabled !== false,
        sessionPersistence: config.resilience?.sessionPersistence || false,
      },

      // Performance Optimization
      performance: {
        concurrency: config.performance?.concurrency || 5,
        requestTimeout: config.performance?.requestTimeout || 30000,
        resourceBlocking: config.performance?.resourceBlocking || ['image', 'stylesheet', 'font'],
        caching: config.performance?.caching !== false,
        compression: config.performance?.compression !== false,
        http2: config.performance?.http2 !== false,
        keepAlive: config.performance?.keepAlive !== false,
        dns: {
          cache: config.performance?.dns?.cache !== false,
          prefetch: config.performance?.dns?.prefetch || false,
          timeout: config.performance?.dns?.timeout || 5000,
        },
      },

      // Rate Limiting
      rateLimit: {
        enabled: config.rateLimit?.enabled !== false,
        requestsPerSecond: config.rateLimit?.requestsPerSecond || 2,
        burstSize: config.rateLimit?.burstSize || 10,
        perDomain: config.rateLimit?.perDomain !== false,
        adaptive: config.rateLimit?.adaptive || false,
      },

      // Data Extraction
      extraction: {
        javascript: config.extraction?.javascript !== false,
        waitForSelector: config.extraction?.waitForSelector || null,
        waitForNavigation: config.extraction?.waitForNavigation || false,
        screenshotEnabled: config.extraction?.screenshotEnabled || false,
        pdfEnabled: config.extraction?.pdfEnabled || false,
        harEnabled: config.extraction?.harEnabled || false,
      },
    };

    // State management
    this.proxyPool = [];
    this.proxyStats = new Map();
    this.robotsCache = new Map();
    this.domainRateLimits = new Map();
    this.userAgents = this.initializeUserAgents();
    this.currentProxyIndex = 0;
  }

  /**
   * Initialize user agent pool for rotation
   */
  initializeUserAgents() {
    return [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    ];
  }

  /**
   * Get next proxy from pool
   */
  getNextProxy() {
    if (!this.config.proxies.enabled || this.proxyPool.length === 0) {
      return null;
    }

    const strategy = this.config.proxies.rotation;
    
    if (strategy === 'round-robin') {
      const proxy = this.proxyPool[this.currentProxyIndex];
      this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxyPool.length;
      return proxy;
    } else if (strategy === 'least-used') {
      // Sort by usage count and return least used
      const sortedProxies = [...this.proxyPool].sort((a, b) => {
        const usageA = this.proxyStats.get(a.id)?.usage || 0;
        const usageB = this.proxyStats.get(b.id)?.usage || 0;
        return usageA - usageB;
      });
      return sortedProxies[0];
    } else if (strategy === 'smart') {
      // Choose based on success rate and latency
      const sortedProxies = [...this.proxyPool].sort((a, b) => {
        const statsA = this.proxyStats.get(a.id) || { successRate: 1, avgLatency: 0 };
        const statsB = this.proxyStats.get(b.id) || { successRate: 1, avgLatency: 0 };
        const scoreA = statsA.successRate / (statsA.avgLatency + 1);
        const scoreB = statsB.successRate / (statsB.avgLatency + 1);
        return scoreB - scoreA;
      });
      return sortedProxies[0];
    }

    return this.proxyPool[0];
  }

  /**
   * Add proxy to pool
   */
  addProxy(proxy) {
    const proxyConfig = {
      id: proxy.id || `proxy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      host: proxy.host,
      port: proxy.port,
      protocol: proxy.protocol || 'http',
      username: proxy.username,
      password: proxy.password,
      country: proxy.country,
      provider: proxy.provider,
    };

    this.proxyPool.push(proxyConfig);
    this.proxyStats.set(proxyConfig.id, {
      usage: 0,
      successes: 0,
      failures: 0,
      successRate: 1,
      avgLatency: 0,
      lastUsed: null,
    });

    this.emit('proxyAdded', proxyConfig);
    return proxyConfig;
  }

  /**
   * Record proxy usage
   */
  recordProxyUsage(proxyId, success, latency) {
    const stats = this.proxyStats.get(proxyId);
    if (!stats) return;

    stats.usage++;
    stats.lastUsed = Date.now();

    if (success) {
      stats.successes++;
    } else {
      stats.failures++;
    }

    stats.successRate = stats.successes / stats.usage;
    stats.avgLatency = (stats.avgLatency * (stats.usage - 1) + latency) / stats.usage;

    this.proxyStats.set(proxyId, stats);
  }

  /**
   * Check robots.txt for URL
   */
  async checkRobotsTxt(url) {
    if (!this.config.robots.enabled) {
      return { allowed: true, crawlDelay: this.config.robots.minDelay };
    }

    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.hostname}/robots.txt`;
      
      // Check cache
      const cached = this.robotsCache.get(robotsUrl);
      if (cached && Date.now() - cached.timestamp < this.config.robots.cacheTime) {
        return this.checkRules(cached.rules, urlObj.pathname);
      }

      // Fetch robots.txt
      const response = await fetch(robotsUrl);
      const text = await response.text();
      const rules = this.parseRobotsTxt(text);

      // Cache it
      this.robotsCache.set(robotsUrl, {
        rules,
        timestamp: Date.now(),
      });

      return this.checkRules(rules, urlObj.pathname);
    } catch (error) {
      // If robots.txt doesn't exist or fails, assume allowed
      return { allowed: true, crawlDelay: this.config.robots.minDelay };
    }
  }

  /**
   * Parse robots.txt content
   */
  parseRobotsTxt(text) {
    const rules = {
      userAgents: {},
      sitemaps: [],
    };

    let currentUserAgent = '*';
    const lines = text.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();

      if (key.toLowerCase() === 'user-agent') {
        currentUserAgent = value;
        if (!rules.userAgents[currentUserAgent]) {
          rules.userAgents[currentUserAgent] = {
            allow: [],
            disallow: [],
            crawlDelay: null,
          };
        }
      } else if (key.toLowerCase() === 'disallow') {
        rules.userAgents[currentUserAgent]?.disallow.push(value);
      } else if (key.toLowerCase() === 'allow') {
        rules.userAgents[currentUserAgent]?.allow.push(value);
      } else if (key.toLowerCase() === 'crawl-delay') {
        if (rules.userAgents[currentUserAgent]) {
          rules.userAgents[currentUserAgent].crawlDelay = parseFloat(value) * 1000;
        }
      } else if (key.toLowerCase() === 'sitemap') {
        rules.sitemaps.push(value);
      }
    }

    return rules;
  }

  /**
   * Check if path is allowed by robots.txt rules
   */
  checkRules(rules, path) {
    const userAgent = this.config.robots.userAgent;
    const agentRules = rules.userAgents[userAgent] || rules.userAgents['*'];

    if (!agentRules) {
      return { allowed: true, crawlDelay: this.config.robots.minDelay };
    }

    // Check disallow rules
    for (const pattern of agentRules.disallow) {
      if (this.matchesPattern(path, pattern)) {
        // Check if there's an allow rule that overrides
        const explicitlyAllowed = agentRules.allow.some(allowPattern =>
          this.matchesPattern(path, allowPattern)
        );
        if (!explicitlyAllowed) {
          return { allowed: false, crawlDelay: 0 };
        }
      }
    }

    const crawlDelay = agentRules.crawlDelay || this.config.robots.minDelay;
    return { 
      allowed: true, 
      crawlDelay: Math.min(Math.max(crawlDelay, this.config.robots.minDelay), this.config.robots.maxDelay)
    };
  }

  /**
   * Match path against robots.txt pattern
   */
  matchesPattern(path, pattern) {
    if (!pattern) return false;
    
    // Convert robots.txt pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '\\?')
      .replace(/\./g, '\\.');
    
    const regex = new RegExp(`^${regexPattern}`);
    return regex.test(path);
  }

  /**
   * Get random user agent
   */
  getRandomUserAgent() {
    if (!this.config.resilience.userAgentRotation) {
      return this.config.robots.userAgent;
    }
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Apply rate limiting for domain
   */
  async applyRateLimit(domain) {
    if (!this.config.rateLimit.enabled) return;

    const now = Date.now();
    const key = this.config.rateLimit.perDomain ? domain : 'global';
    
    if (!this.domainRateLimits.has(key)) {
      this.domainRateLimits.set(key, {
        requests: [],
        burst: 0,
      });
    }

    const limiter = this.domainRateLimits.get(key);
    const windowStart = now - 1000;
    
    // Clean old requests
    limiter.requests = limiter.requests.filter(t => t > windowStart);

    const allowedPerSecond = this.config.rateLimit.requestsPerSecond;
    
    if (limiter.requests.length >= allowedPerSecond) {
      // Calculate wait time
      const oldestRequest = Math.min(...limiter.requests);
      const waitTime = 1000 - (now - oldestRequest);
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    limiter.requests.push(Date.now());
  }

  /**
   * Get crawler configuration for Puppeteer
   */
  getPuppeteerConfig(url) {
    const proxy = this.getNextProxy();
    const userAgent = this.getRandomUserAgent();

    const config = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        `--user-agent=${userAgent}`,
      ],
    };

    // Add proxy
    if (proxy) {
      config.args.push(`--proxy-server=${proxy.protocol}://${proxy.host}:${proxy.port}`);
    }

    // Add performance optimizations
    if (this.config.performance.resourceBlocking.length > 0) {
      config.args.push('--blink-settings=imagesEnabled=false');
    }

    if (this.config.performance.http2) {
      config.args.push('--enable-features=NetworkService');
    }

    return { config, proxy, userAgent };
  }

  /**
   * Get CDP (Chrome DevTools Protocol) configuration
   */
  getCDPConfig() {
    return {
      layers: this.config.cdp.layersPanel,
      performance: this.config.cdp.performance,
      network: this.config.cdp.network,
      coverage: this.config.cdp.coverage,
    };
  }

  /**
   * Get 3D layers mining configuration
   */
  get3DLayersConfig() {
    return {
      enabled: this.config.layers3D.enabled,
      maxDepth: this.config.layers3D.maxDepth,
      minImportance: this.config.layers3D.minImportance,
      extractCompositing: this.config.layers3D.extractCompositing,
      gpuAcceleration: this.config.layers3D.gpuAcceleration,
    };
  }

  /**
   * Get OCR worker configuration
   */
  getOCRConfig() {
    return {
      enabled: this.config.ocr.enabled,
      endpoint: this.config.ocr.endpoint,
      maxImages: this.config.ocr.maxImages,
      compressionRatio: this.config.ocr.compressionRatio,
      minPrecision: this.config.ocr.minPrecision,
      batchSize: this.config.ocr.batchSize,
    };
  }

  /**
   * Get retry configuration with exponential backoff
   */
  getRetryConfig(attemptNumber) {
    const baseDelay = this.config.resilience.retryDelay;
    
    if (!this.config.resilience.exponentialBackoff) {
      return { delay: baseDelay, shouldRetry: attemptNumber < this.config.resilience.retryAttempts };
    }

    const delay = Math.min(
      baseDelay * Math.pow(2, attemptNumber - 1),
      this.config.resilience.maxBackoff
    );

    return {
      delay,
      shouldRetry: attemptNumber < this.config.resilience.retryAttempts,
    };
  }

  /**
   * Export configuration as JSON
   */
  toJSON() {
    return {
      config: this.config,
      stats: {
        proxies: this.proxyPool.length,
        proxyStats: Object.fromEntries(this.proxyStats),
        robotsCache: this.robotsCache.size,
        userAgents: this.userAgents.length,
      },
    };
  }
}

export default EnterpriseCrawlerConfigService;
export { EnterpriseCrawlerConfigService };
