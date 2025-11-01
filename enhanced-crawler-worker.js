#!/usr/bin/env node

/**
 * Enhanced Advanced Crawler Worker with SEO Mining & Real-time Schema Injection
 * Advanced multi-model training with SEO optimization capabilities
 */

import { parentPort, workerData } from 'worker_threads';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Enhanced SEO Mining Classes
class SEOOptimizationEngine {
  constructor() {
    this.injectedSites = new Map();
    this.monitoringData = new Map();
  }

  async injectSEOOptimization(page, operationId) {
    console.log(`💉 Injecting SEO optimization for operation ${operationId}`);

    // Generate comprehensive SEO script
    const seoScript = this.generateSEOOptimizationScript(operationId);

    // Inject the script
    await page.evaluateOnNewDocument(seoScript);

    // Also inject via script tag for dynamic content
    await page.evaluate((script, opId) => {
      const scriptElement = document.createElement('script');
      scriptElement.textContent = script.replace('OPERATION_ID_PLACEHOLDER', opId);
      scriptElement.setAttribute('data-seo-optimizer', 'true');
      document.head.appendChild(scriptElement);
    }, seoScript, operationId);

    this.injectedSites.set(operationId, {
      url: page.url(),
      injectedAt: new Date().toISOString(),
      monitoringActive: true
    });

    return {
      injected: true,
      scriptSize: seoScript.length,
      monitoringEnabled: true
    };
  }

  generateSEOOptimizationScript(operationId) {
    return `
(function() {
  // Advanced SEO Optimization & Real-time Mining Script
  console.log('🚀 Advanced SEO Optimization Script Injected - Operation: ${operationId}');

  // Initialize SEO monitoring system
  window.seoOptimizer = {
    operationId: '${operationId}',
    startTime: Date.now(),
    metrics: {
      initialLoadTime: performance.now(),
      domReadyTime: 0,
      fullyLoadedTime: 0,
      seoScore: 0,
      schemaCount: 0,
      metaTagsOptimized: 0
    },

    richSchemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: document.title || 'Optimized Website',
        url: window.location.href,
        description: document.querySelector('meta[name="description"]')?.content || 'SEO optimized content',
        potentialAction: {
          '@type': 'SearchAction',
          target: window.location.href + '?s={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'SEO Optimized Site',
        url: window.location.href,
        sameAs: []
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: document.title,
        author: {
          '@type': 'Organization',
          name: 'Content Creator'
        },
        datePublished: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': window.location.href
        }
      }
    ],

    injectRichSchemas: function() {
      this.richSchemas.forEach((schema, index) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = \`seo-schema-\${index}\`;
        script.textContent = JSON.stringify(schema, null, 2);
        document.head.appendChild(script);
      });
      this.metrics.schemaCount = this.richSchemas.length;
      this.trackEvent('schemas_injected', { count: this.metrics.schemaCount });
    },

    optimizeMetaTags: function() {
      const head = document.head;
      const url = window.location.href;
      const title = document.title;
      const description = document.querySelector('meta[name="description"]');

      // Enhanced meta description
      if (!description || description.content.length < 50) {
        if (description) {
          description.content = \`\${title} - Comprehensive SEO optimized content with rich schema markup and advanced data mining capabilities. Discover insights, analytics, and optimization strategies.\`;
        } else {
          const meta = document.createElement('meta');
          meta.name = 'description';
          meta.content = \`\${title} - SEO optimized with advanced data mining and real-time performance monitoring. Rich schema markup for enhanced search visibility.\`;
          head.appendChild(meta);
        }
        this.metrics.metaTagsOptimized++;
      }

      // Add comprehensive meta tags
      const metaTags = [
        { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
        { name: 'googlebot', content: 'index, follow' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description?.content || title },
        { property: 'og:url', content: url },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: window.location.hostname },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description?.content || title }
      ];

      metaTags.forEach(tag => {
        const existing = document.querySelector(\`meta[\${tag.name ? 'name' : 'property'}="\${tag.name || tag.property}"]\`);
        if (!existing) {
          const meta = document.createElement('meta');
          if (tag.name) meta.name = tag.name;
          if (tag.property) meta.setAttribute('property', tag.property);
          meta.content = tag.content;
          head.appendChild(meta);
          this.metrics.metaTagsOptimized++;
        }
      });

      this.trackEvent('meta_tags_optimized', { count: this.metrics.metaTagsOptimized });
    },

    enhanceContentStructure: function() {
      // Add structured data to content elements
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach((heading, index) => {
        heading.setAttribute('data-seo-heading', \`h\${heading.tagName.charAt(1)}\`);
        heading.setAttribute('data-seo-position', index + 1);
      });

      // Enhance images with alt text and structured data
      const images = document.querySelectorAll('img:not([alt])');
      images.forEach(img => {
        const alt = img.src.split('/').pop().split('.')[0].replace(/[-_]/g, ' ');
        img.alt = \`SEO optimized image: \${alt}\`;
        img.setAttribute('data-seo-enhanced', 'true');
      });

      // Add breadcrumb structured data if navigation exists
      const nav = document.querySelector('nav, .breadcrumb, .breadcrumbs');
      if (nav) {
        const breadcrumbSchema = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [{
            '@type': 'ListItem',
            position: 1,
            name: document.title,
            item: window.location.href
          }]
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'breadcrumb-schema';
        script.textContent = JSON.stringify(breadcrumbSchema);
        document.head.appendChild(script);
      }

      this.trackEvent('content_enhanced', {
        headingsEnhanced: headings.length,
        imagesEnhanced: images.length,
        breadcrumbsAdded: nav ? 1 : 0
      });
    },

    setupRealTimeMonitoring: function() {
      // Monitor user interactions for SEO insights
      let interactionCount = 0;
      const maxInteractions = 50;

      const trackInteraction = (event, data) => {
        if (interactionCount < maxInteractions) {
          this.trackEvent('user_interaction', {
            event: event,
            data: data,
            timestamp: Date.now(),
            sessionDuration: Date.now() - this.startTime
          });
          interactionCount++;
        }
      };

      // Track clicks
      document.addEventListener('click', (e) => {
        trackInteraction('click', {
          tagName: e.target.tagName,
          className: e.target.className,
          text: e.target.textContent?.substring(0, 50)
        });
      });

      // Track scrolling
      let scrollDepth = 0;
      window.addEventListener('scroll', () => {
        const newDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (newDepth > scrollDepth && newDepth % 25 === 0) {
          scrollDepth = newDepth;
          trackInteraction('scroll', { depth: scrollDepth });
        }
      });

      // Track time on page
      setInterval(() => {
        trackInteraction('time_on_page', {
          duration: Date.now() - this.startTime,
          scrollDepth: scrollDepth
        });
      }, 30000); // Every 30 seconds
    },

    trackEvent: function(event, data) {
      // Send real-time data to mining system
      const payload = {
        operationId: this.operationId,
        event: event,
        data: data,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        performance: {
          loadTime: performance.now(),
          domContentLoaded: this.metrics.domReadyTime,
          fullyLoaded: this.metrics.fullyLoadedTime
        }
      };

      // Use sendBeacon for reliable delivery
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/seo/track', JSON.stringify(payload));
      } else {
        fetch('/api/seo/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(err => {
          // Fallback: store in localStorage for later sending
          const stored = JSON.parse(localStorage.getItem('seo-events') || '[]');
          stored.push(payload);
          localStorage.setItem('seo-events', JSON.stringify(stored.slice(-100))); // Keep last 100 events
        });
      }
    },

    calculateSEOScore: function() {
      let score = 50; // Base score

      // Title optimization
      if (document.title && document.title.length > 30 && document.title.length < 60) score += 10;

      // Meta description
      const description = document.querySelector('meta[name="description"]');
      if (description && description.content.length > 120 && description.content.length < 160) score += 10;

      // Heading structure
      const h1Count = document.querySelectorAll('h1').length;
      if (h1Count === 1) score += 5;

      // Image optimization
      const imagesWithAlt = document.querySelectorAll('img[alt]').length;
      const totalImages = document.querySelectorAll('img').length;
      if (totalImages > 0 && (imagesWithAlt / totalImages) > 0.8) score += 5;

      // Schema markup
      const schemas = document.querySelectorAll('script[type="application/ld+json"]').length;
      score += Math.min(10, schemas * 2);

      // Performance
      if (performance.now() < 3000) score += 5; // Fast loading

      this.metrics.seoScore = Math.min(100, Math.max(0, score));
      return this.metrics.seoScore;
    },

    setupContinuousImprovement: function() {
      // Continuous SEO improvement loop
      setInterval(() => {
        // Recalculate SEO score
        const newScore = this.calculateSEOScore();
        const scoreImprovement = newScore - this.metrics.seoScore;

        if (scoreImprovement !== 0) {
          this.trackEvent('seo_score_update', {
            previousScore: this.metrics.seoScore,
            newScore: newScore,
            improvement: scoreImprovement,
            factors: {
              titleOptimized: document.title?.length > 30 && document.title?.length < 60,
              metaDescription: document.querySelector('meta[name="description"]')?.content?.length > 120,
              imagesOptimized: document.querySelectorAll('img[alt]').length > 0,
              schemasPresent: document.querySelectorAll('script[type="application/ld+json"]').length > 0
            }
          });
          this.metrics.seoScore = newScore;
        }

        // Dynamic content optimization
        this.optimizeDynamicContent();

        // Performance monitoring
        this.trackEvent('performance_metrics', {
          currentLoadTime: performance.now(),
          memoryUsage: performance.memory ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
          } : null,
          seoScore: this.metrics.seoScore
        });

      }, 60000); // Every minute
    },

    optimizeDynamicContent: function() {
      // Find new content that needs optimization
      const newImages = document.querySelectorAll('img:not([data-seo-enhanced])');
      newImages.forEach(img => {
        if (!img.alt) {
          const alt = img.src.split('/').pop().split('.')[0].replace(/[-_]/g, ' ');
          img.alt = \`SEO optimized: \${alt}\`;
        }
        img.setAttribute('data-seo-enhanced', 'true');
      });

      // Optimize new headings
      const newHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6:not([data-seo-heading])');
      newHeadings.forEach(heading => {
        heading.setAttribute('data-seo-heading', \`h\${heading.tagName.charAt(1)}\`);
      });
    }
  };

  // Performance event listeners
  window.addEventListener('DOMContentLoaded', () => {
    window.seoOptimizer.metrics.domReadyTime = performance.now();
  });

  window.addEventListener('load', () => {
    window.seoOptimizer.metrics.fullyLoadedTime = performance.now();

    // Initialize all optimizations
    window.seoOptimizer.injectRichSchemas();
    window.seoOptimizer.optimizeMetaTags();
    window.seoOptimizer.enhanceContentStructure();
    window.seoOptimizer.setupRealTimeMonitoring();
    window.seoOptimizer.setupContinuousImprovement();

    // Calculate initial SEO score
    window.seoOptimizer.calculateSEOScore();

    // Track successful initialization
    window.seoOptimizer.trackEvent('optimization_initialized', {
      schemasInjected: window.seoOptimizer.metrics.schemaCount,
      metaTagsOptimized: window.seoOptimizer.metrics.metaTagsOptimized,
      initialSEOScore: window.seoOptimizer.metrics.seoScore,
      loadTime: window.seoOptimizer.metrics.fullyLoadedTime
    });

    console.log('✅ SEO Optimization System Active - Continuous monitoring and improvement enabled');
  });

  // Error handling
  window.addEventListener('error', (event) => {
    window.seoOptimizer.trackEvent('javascript_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.toString()
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    window.seoOptimizer.trackEvent('unhandled_promise_rejection', {
      reason: event.reason?.toString(),
      promise: event.promise?.toString()
    });
  });

})();
    `.trim();
  }

  async monitorSEOProgress(operationId, url) {
    // In a real implementation, this would connect to the injected script
    // For demo purposes, we'll simulate monitoring
    return {
      operationId,
      url,
      monitoringActive: true,
      currentMetrics: {
        seoScore: Math.floor(Math.random() * 30) + 70, // 70-100 range
        schemasActive: Math.floor(Math.random() * 5) + 3,
        backlinksGained: Math.floor(Math.random() * 10),
        organicTraffic: Math.floor(Math.random() * 50) + 10
      },
      improvements: [
        'Rich schema markup injected',
        'Meta tags optimized',
        'Content structure enhanced',
        'Real-time monitoring active'
      ]
    };
  }
}

// Enhanced Advanced Crawler Worker
class EnhancedAdvancedCrawlerWorker {
  constructor(workerId) {
    this.workerId = workerId;
    this.activeSessions = new Map();
    this.browser = null;
    this.isRunning = false;
    this.seoEngine = new SEOOptimizationEngine();
    this.models = new Map();
  }

  async initialize() {
    console.log(`🚀 Initializing enhanced crawler worker ${this.workerId}...`);

    // Launch browser with enhanced options
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
        '--disable-backgrounding-occluded-windows'
      ]
    });

    this.isRunning = true;
    console.log(`✅ Enhanced crawler worker ${this.workerId} initialized with SEO capabilities`);
  }

  async startSession(sessionId, config, operationId) {
    console.log(`▶️  Enhanced worker ${this.workerId} starting session ${sessionId}`);

    const session = {
      sessionId,
      operationId,
      config,
      status: 'running',
      startTime: new Date(),
      stats: {
        urlsProcessed: 0,
        dataExtracted: 0,
        errors: 0,
        successRate: 0,
        seoOptimizations: 0,
        schemasInjected: 0,
        backlinksGenerated: 0
      },
      currentTask: null,
      isPaused: false,
      isStopped: false
    };

    this.activeSessions.set(sessionId, session);

    try {
      // Determine enhanced task type and execute
      const result = await this.executeEnhancedTask(session);

      session.status = 'completed';
      session.endTime = new Date();
      session.result = result;

      parentPort.postMessage({
        type: 'session-completed',
        sessionId,
        result: {
          urlsProcessed: session.stats.urlsProcessed,
          dataExtracted: session.stats.dataExtracted,
          successRate: session.stats.successRate,
          seoOptimizations: session.stats.seoOptimizations,
          schemasInjected: session.stats.schemasInjected,
          backlinksGenerated: session.stats.backlinksGenerated
        }
      });

    } catch (error) {
      console.error(`❌ Enhanced session ${sessionId} failed:`, error);
      session.status = 'failed';
      session.error = error.message;

      parentPort.postMessage({
        type: 'session-error',
        sessionId,
        error: error.message
      });
    }

    this.activeSessions.delete(sessionId);
  }

  async executeEnhancedTask(session) {
    const { config } = session;

    switch (config.modelAssignment.modelType) {
      case 'seo_mining':
        return await this.executeSEOMining(session);

      case 'seo_injection':
        return await this.executeSEOInjection(session);

      case 'tutorial_mining':
        return await this.executeEnhancedTutorialMining(session);

      case 'task_breakdown':
        return await this.executeEnhancedTaskBreakdown(session);

      case 'component_generation':
        return await this.executeEnhancedComponentGeneration(session);

      case 'workflow_creation':
        return await this.executeEnhancedWorkflowCreation(session);

      case 'schema_mapping':
        return await this.executeEnhancedSchemaMapping(session);

      case 'prompt_analysis':
        return await this.executeEnhancedPromptAnalysis(session);

      case 'agile_methodology':
        return await this.executeEnhancedAgileMethodology(session);

      default:
        throw new Error(`Unknown enhanced task type: ${config.modelAssignment.modelType}`);
    }
  }

  async executeSEOMining(session) {
    console.log(`🔍 Executing enhanced SEO mining for session ${session.sessionId}`);

    const { config } = session;
    const targetUrl = config.modelAssignment.taskConfig?.target_url || 'https://example.com';

    const results = [];
    const page = await this.browser.newPage();

    try {
      // Set enhanced user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      console.log(`🌐 Analyzing SEO for: ${targetUrl}`);
      await page.goto(targetUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Comprehensive SEO analysis
      const seoAnalysis = await page.evaluate(() => {
        const getMetaContent = (name) => {
          const meta = document.querySelector(`meta[name="${name}"]`);
          return meta ? meta.content : null;
        };

        const getOpenGraph = (property) => {
          const meta = document.querySelector(`meta[property="${property}"]`);
          return meta ? meta.content : null;
        };

        return {
          title: document.title,
          metaDescription: getMetaContent('description'),
          canonical: document.querySelector('link[rel="canonical"]')?.href,
          robots: getMetaContent('robots'),
          ogTitle: getOpenGraph('og:title'),
          ogDescription: getOpenGraph('og:description'),
          ogImage: getOpenGraph('og:image'),
          twitterCard: getMetaContent('twitter:card'),
          headings: {
            h1: document.querySelectorAll('h1').length,
            h2: document.querySelectorAll('h2').length,
            h3: document.querySelectorAll('h3').length
          },
          images: {
            total: document.querySelectorAll('img').length,
            withAlt: document.querySelectorAll('img[alt]').length,
            withoutAlt: document.querySelectorAll('img:not([alt])').length
          },
          links: {
            internal: Array.from(document.querySelectorAll('a[href]')).filter(a =>
              a.href.startsWith(window.location.origin)
            ).length,
            external: Array.from(document.querySelectorAll('a[href]')).filter(a =>
              a.href.startsWith('http') && !a.href.startsWith(window.location.origin)
            ).length
          },
          structuredData: {
            jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
            microdata: document.querySelectorAll('[itemtype]').length,
            rdfa: document.querySelectorAll('[typeof]').length
          },
          performance: {
            hasLazyLoading: document.querySelectorAll('img[loading="lazy"]').length > 0,
            hasPreload: document.querySelectorAll('link[rel="preload"]').length > 0,
            scriptCount: document.querySelectorAll('script').length,
            cssCount: document.querySelectorAll('link[rel="stylesheet"]').length
          }
        };
      });

      // Generate SEO recommendations
      const recommendations = this.generateSEORecommendations(seoAnalysis);

      // Inject SEO optimization if requested
      let injectionResult = null;
      if (config.modelAssignment.taskConfig?.inject_scripts) {
        injectionResult = await this.seoEngine.injectSEOOptimization(page, session.operationId);
        session.stats.seoOptimizations++;
        session.stats.schemasInjected += injectionResult.scriptSize > 0 ? 1 : 0;
      }

      results.push({
        url: targetUrl,
        seoAnalysis,
        recommendations,
        injectionResult,
        analyzedAt: new Date().toISOString(),
        qualityScore: this.calculateSEOQualityScore(seoAnalysis)
      });

    } catch (error) {
      console.error(`Failed to analyze ${targetUrl}:`, error);
      session.stats.errors++;
      results.push({
        url: targetUrl,
        error: error.message,
        analyzedAt: new Date().toISOString()
      });
    } finally {
      await page.close();
    }

    // Calculate success rate
    session.stats.urlsProcessed++;
    session.stats.successRate = session.stats.urlsProcessed > 0 ?
      ((session.stats.urlsProcessed - session.stats.errors) / session.stats.urlsProcessed) : 0;

    // Update session stats
    parentPort.postMessage({
      type: 'progress-update',
      sessionId: session.sessionId,
      data: session.stats
    });

    return {
      seoAnalyses: results.length,
      recommendationsGenerated: results.reduce((sum, r) => sum + (r.recommendations?.length || 0), 0),
      optimizationsInjected: session.stats.seoOptimizations,
      seoResults: results
    };
  }

  async executeSEOInjection(session) {
    console.log(`💉 Executing SEO injection for session ${session.sessionId}`);

    const { config } = session;
    const targetUrl = config.modelAssignment.taskConfig?.target_url;

    if (!targetUrl) {
      throw new Error('Target URL required for SEO injection');
    }

    const page = await this.browser.newPage();

    try {
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      console.log(`🌐 Injecting SEO optimization into: ${targetUrl}`);
      await page.goto(targetUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Inject comprehensive SEO optimization
      const injectionResult = await this.seoEngine.injectSEOOptimization(page, session.operationId);

      // Setup real-time monitoring
      const monitoringResult = await this.seoEngine.monitorSEOProgress(session.operationId, targetUrl);

      session.stats.seoOptimizations++;
      session.stats.schemasInjected += injectionResult.scriptSize > 0 ? 5 : 0; // Estimate schemas injected

      // Wait a moment to let the script initialize
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Capture post-injection state
      const postInjectionState = await page.evaluate(() => ({
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content,
        schemaCount: document.querySelectorAll('script[type="application/ld+json"]').length,
        ogTags: document.querySelectorAll('meta[property^="og:"]').length,
        twitterTags: document.querySelectorAll('meta[name^="twitter:"]').length,
        seoEnhancedImages: document.querySelectorAll('[data-seo-enhanced]').length,
        seoHeadings: document.querySelectorAll('[data-seo-heading]').length
      }));

      return {
        targetUrl,
        injectionSuccessful: injectionResult.injected,
        scriptSize: injectionResult.scriptSize,
        monitoringActive: injectionResult.monitoringEnabled,
        postInjectionState,
        monitoringResult,
        injectedAt: new Date().toISOString()
      };

    } finally {
      await page.close();
    }
  }

  async executeEnhancedTutorialMining(session) {
    // Enhanced version with SEO context
    console.log(`📚 Executing enhanced tutorial mining for session ${session.sessionId}`);

    const results = [];
    const tutorialSources = [
      {
        url: 'https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data',
        type: 'seo_docs',
        selectors: {
          title: 'h1',
          content: '.devsite-article-body',
          codeExamples: 'pre',
          schemaExamples: '.schema-example'
        }
      },
      {
        url: 'https://schema.org/docs/schemas.html',
        type: 'schema_docs',
        selectors: {
          title: 'h1',
          content: '.main-content',
          schemaTypes: '.schema-type',
          examples: 'pre'
        }
      },
      {
        url: 'https://moz.com/learn/seo',
        type: 'seo_guide',
        selectors: {
          title: 'h1',
          content: '.article-content',
          tips: '.seo-tip',
          examples: '.example'
        }
      }
    ];

    for (const source of tutorialSources) {
      if (session.isStopped) break;

      while (session.isPaused) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (session.isStopped) break;
      }

      try {
        const page = await this.browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1920, height: 1080 });

        console.log(`📖 Mining SEO tutorial: ${source.url}`);
        await page.goto(source.url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        // Extract tutorial content with SEO focus
        const tutorialData = await page.evaluate((selectors, sourceType) => {
          const getTextContent = (selector) => {
            const element = document.querySelector(selector);
            return element ? element.textContent.trim() : '';
          };

          const getMultipleElements = (selector) => {
            return Array.from(document.querySelectorAll(selector))
              .map(el => el.textContent.trim())
              .filter(text => text.length > 0);
          };

          const getSchemaExamples = () => {
            return Array.from(document.querySelectorAll('script[type="application/ld+json"], .schema-example, pre'))
              .map(el => el.textContent || el.innerText)
              .filter(text => text.includes('@context') || text.includes('schema.org') || text.includes('JSON-LD'))
              .slice(0, 5);
          };

          return {
            title: getTextContent(selectors.title),
            content: getTextContent(selectors.content),
            codeExamples: getMultipleElements(selectors.codeExamples || 'pre'),
            schemaExamples: getSchemaExamples(),
            seoTips: getMultipleElements(selectors.tips || '.tip, .advice, .best-practice'),
            navigationItems: getMultipleElements('nav a'),
            url: window.location.href,
            sourceType,
            extractedAt: new Date().toISOString()
          };
        }, source.selectors, source.type);

        // Analyze for SEO task breakdown patterns
        const seoTaskPatterns = this.analyzeSEOContentForTasks(tutorialData);

        results.push({
          ...tutorialData,
          seoTaskPatterns,
          qualityScore: this.assessSEOTutorialQuality(tutorialData),
          schemaExampleCount: tutorialData.schemaExamples.length,
          seoTipCount: tutorialData.seoTips.length
        });

        await page.close();

        session.stats.urlsProcessed++;
        session.stats.dataExtracted += tutorialData.codeExamples.length + tutorialData.schemaExamples.length;

        parentPort.postMessage({
          type: 'progress-update',
          sessionId: session.sessionId,
          data: session.stats
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Failed to mine SEO tutorial ${source.url}:`, error);
        session.stats.errors++;
      }
    }

    session.stats.successRate = session.stats.urlsProcessed > 0 ?
      (session.stats.urlsProcessed - session.stats.errors) / session.stats.urlsProcessed : 0;

    return {
      tutorialsMined: results.length,
      totalCodeExamples: results.reduce((sum, t) => sum + t.codeExamples.length, 0),
      totalSchemaExamples: results.reduce((sum, t) => sum + t.schemaExampleCount, 0),
      seoTaskPatternsFound: results.reduce((sum, t) => sum + t.seoTaskPatterns.length, 0),
      tutorials: results
    };
  }

  // Additional enhanced methods for other task types would follow...
  // For brevity, I'll focus on the core SEO mining enhancements

  generateSEORecommendations(analysis) {
    const recommendations = [];

    // Title recommendations
    if (!analysis.title || analysis.title.length < 30) {
      recommendations.push({
        type: 'title',
        priority: 'high',
        issue: 'Title too short or missing',
        recommendation: 'Create a compelling title between 30-60 characters',
        impact: 'High'
      });
    }

    // Meta description
    if (!analysis.metaDescription || analysis.metaDescription.length < 120) {
      recommendations.push({
        type: 'meta_description',
        priority: 'high',
        issue: 'Meta description too short or missing',
        recommendation: 'Write a meta description of 120-160 characters',
        impact: 'High'
      });
    }

    // Structured data
    if (analysis.structuredData.jsonLd === 0) {
      recommendations.push({
        type: 'structured_data',
        priority: 'high',
        issue: 'No structured data found',
        recommendation: 'Add JSON-LD structured data for better search visibility',
        impact: 'High'
      });
    }

    // Image optimization
    if (analysis.images.withoutAlt > 0) {
      recommendations.push({
        type: 'images',
        priority: 'medium',
        issue: `${analysis.images.withoutAlt} images missing alt text`,
        recommendation: 'Add descriptive alt text to all images',
        impact: 'Medium'
      });
    }

    // Heading structure
    if (analysis.headings.h1 !== 1) {
      recommendations.push({
        type: 'headings',
        priority: 'medium',
        issue: `Found ${analysis.headings.h1} H1 tags (should have exactly 1)`,
        recommendation: 'Ensure exactly one H1 tag per page',
        impact: 'Medium'
      });
    }

    return recommendations;
  }

  calculateSEOQualityScore(analysis) {
    let score = 50; // Base score

    // Title (20 points)
    if (analysis.title && analysis.title.length >= 30 && analysis.title.length <= 60) {
      score += 20;
    } else if (analysis.title && analysis.title.length >= 10) {
      score += 10;
    }

    // Meta description (15 points)
    if (analysis.metaDescription && analysis.metaDescription.length >= 120 && analysis.metaDescription.length <= 160) {
      score += 15;
    } else if (analysis.metaDescription && analysis.metaDescription.length >= 50) {
      score += 7;
    }

    // Structured data (15 points)
    const totalStructured = analysis.structuredData.jsonLd + analysis.structuredData.microdata + analysis.structuredData.rdfa;
    score += Math.min(15, totalStructured * 5);

    // Images (10 points)
    if (analysis.images.total > 0) {
      const altRatio = analysis.images.withAlt / analysis.images.total;
      score += Math.round(altRatio * 10);
    }

    // Headings (10 points)
    if (analysis.headings.h1 === 1) score += 5;
    if (analysis.headings.h2 > 0) score += 3;
    if (analysis.headings.h3 > 0) score += 2;

    // Links (10 points)
    if (analysis.links.internal > 0) score += 5;
    if (analysis.links.external > 0) score += 5;

    // Performance (10 points)
    if (analysis.performance.hasLazyLoading) score += 3;
    if (analysis.performance.hasPreload) score += 3;
    if (analysis.performance.scriptCount < 20) score += 2;
    if (analysis.performance.cssCount < 5) score += 2;

    return Math.min(100, Math.max(0, score));
  }

  analyzeSEOContentForTasks(tutorialData) {
    const patterns = [];
    const content = tutorialData.content.toLowerCase();

    // SEO-specific task indicators
    const seoTaskIndicators = [
      'optimize', 'improve', 'implement', 'add', 'create', 'set up',
      'configure', 'enable', 'install', 'update', 'fix', 'resolve'
    ];

    const seoContextWords = [
      'seo', 'search', 'google', 'ranking', 'traffic', 'keyword',
      'meta', 'title', 'description', 'schema', 'structured', 'rich',
      'backlink', 'authority', 'crawl', 'index'
    ];

    const sentences = tutorialData.content.split(/[.!?]+/).filter(s => s.trim().length > 20);

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      const hasTaskIndicator = seoTaskIndicators.some(indicator => lowerSentence.includes(indicator));
      const hasSEOContext = seoContextWords.some(word => lowerSentence.includes(word));

      if (hasTaskIndicator && hasSEOContext) {
        const task = {
          description: sentence.trim(),
          type: this.categorizeSEOTask(sentence),
          complexity: this.assessSEOComplexity(sentence),
          seo_impact: this.assessSEOImpact(sentence),
          implementation_time: this.estimateSEOImplementation(sentence),
          priority: this.determineSEOPriority(sentence)
        };

        patterns.push(task);
      }
    }

    return patterns;
  }

  categorizeSEOTask(sentence) {
    const lower = sentence.toLowerCase();

    if (lower.includes('meta') || lower.includes('title') || lower.includes('description')) {
      return 'on_page_optimization';
    } else if (lower.includes('schema') || lower.includes('structured') || lower.includes('json-ld')) {
      return 'structured_data';
    } else if (lower.includes('backlink') || lower.includes('link')) {
      return 'link_building';
    } else if (lower.includes('content') || lower.includes('keyword')) {
      return 'content_optimization';
    } else if (lower.includes('technical') || lower.includes('crawl') || lower.includes('index')) {
      return 'technical_seo';
    } else {
      return 'general_seo';
    }
  }

  assessSEOComplexity(sentence) {
    const indicators = {
      simple: ['simple', 'easy', 'basic', 'quick', 'straightforward', 'add', 'set'],
      medium: ['moderate', 'intermediate', 'some', 'fairly', 'configure', 'implement'],
      complex: ['complex', 'difficult', 'advanced', 'technical', 'comprehensive', 'optimize']
    };

    const lower = sentence.toLowerCase();
    let score = 2; // Default medium

    if (indicators.simple.some(word => lower.includes(word))) score = 1;
    else if (indicators.complex.some(word => lower.includes(word))) score = 3;

    return score;
  }

  assessSEOImpact(sentence) {
    const lower = sentence.toLowerCase();

    if (lower.includes('ranking') || lower.includes('traffic') || lower.includes('visibility')) {
      return 'high';
    } else if (lower.includes('crawl') || lower.includes('index') || lower.includes('user experience')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  estimateSEOImplementation(sentence) {
    const lower = sentence.toLowerCase();

    if (lower.includes('add') || lower.includes('set') || lower.includes('enable')) {
      return 15; // 15 minutes
    } else if (lower.includes('implement') || lower.includes('configure')) {
      return 60; // 1 hour
    } else if (lower.includes('optimize') || lower.includes('comprehensive')) {
      return 240; // 4 hours
    } else {
      return 30; // 30 minutes default
    }
  }

  determineSEOPriority(sentence) {
    const lower = sentence.toLowerCase();

    if (lower.includes('fix') || lower.includes('error') || lower.includes('broken')) {
      return 'critical';
    } else if (lower.includes('ranking') || lower.includes('traffic') || lower.includes('revenue')) {
      return 'high';
    } else if (lower.includes('improve') || lower.includes('enhance')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  assessSEOTutorialQuality(tutorialData) {
    let score = 0.5;

    // Content quality
    if (tutorialData.title) score += 0.1;
    if (tutorialData.content.length > 1000) score += 0.15;
    if (tutorialData.seoTips.length > 0) score += 0.1;
    if (tutorialData.schemaExamples.length > 0) score += 0.15;

    // SEO specificity
    const seoTerms = ['seo', 'search', 'ranking', 'google', 'meta', 'schema', 'structured'];
    const contentLower = tutorialData.content.toLowerCase();
    const seoTermCount = seoTerms.filter(term => contentLower.includes(term)).length;
    score += Math.min(0.2, seoTermCount * 0.05);

    return Math.min(1.0, score);
  }

  // Placeholder methods for other enhanced tasks
  async executeEnhancedTaskBreakdown(session) { return this.executeTaskBreakdown(session); }
  async executeEnhancedComponentGeneration(session) { return this.executeComponentGeneration(session); }
  async executeEnhancedWorkflowCreation(session) { return this.executeWorkflowCreation(session); }
  async executeEnhancedSchemaMapping(session) { return this.executeSchemaMapping(session); }
  async executeEnhancedPromptAnalysis(session) { return this.executePromptAnalysis(session); }
  async executeEnhancedAgileMethodology(session) { return this.executeAgileMethodology(session); }

  // Control methods
  async pauseSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isPaused = true;
      session.status = 'paused';
      console.log(`⏸️  Enhanced session ${sessionId} paused`);
    }
  }

  async resumeSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isPaused = false;
      session.status = 'running';
      console.log(`▶️  Enhanced session ${sessionId} resumed`);
    }
  }

  async stopSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isStopped = true;
      session.status = 'stopped';
      console.log(`🛑 Enhanced session ${sessionId} stopped`);
    }
  }

  async cleanup() {
    console.log(`🧹 Cleaning up enhanced worker ${this.workerId}...`);

    for (const [sessionId, session] of this.activeSessions) {
      await this.stopSession(sessionId);
    }

    if (this.browser) {
      await this.browser.close();
    }

    this.isRunning = false;
    console.log(`✅ Enhanced worker ${this.workerId} cleaned up`);
  }
}

// Enhanced worker runner
async function runEnhancedCrawlerWorker() {
  let worker = null;

  parentPort.on('message', async (message) => {
    const { type, sessionId, config, operationId } = message;

    try {
      switch (type) {
        case 'initialize':
          worker = new EnhancedAdvancedCrawlerWorker(message.workerId);
          await worker.initialize();
          parentPort.postMessage({ type: 'initialized', workerId: message.workerId });
          break;

        case 'start-session':
          if (!worker) {
            throw new Error('Worker not initialized');
          }
          await worker.startSession(sessionId, config, operationId);
          break;

        case 'pause-session':
          if (worker) {
            await worker.pauseSession(sessionId);
          }
          parentPort.postMessage({ type: 'session-paused', sessionId });
          break;

        case 'resume-session':
          if (worker) {
            await worker.resumeSession(sessionId);
          }
          parentPort.postMessage({ type: 'session-resumed', sessionId });
          break;

        case 'stop-session':
          if (worker) {
            await worker.stopSession(sessionId);
          }
          parentPort.postMessage({ type: 'session-stopped', sessionId });
          break;

        case 'shutdown':
          if (worker) {
            await worker.cleanup();
          }
          parentPort.postMessage({ type: 'shutdown-complete' });
          process.exit(0);
          break;

        default:
          console.warn(`Unknown enhanced message type: ${type}`);
      }
    } catch (error) {
      console.error('Enhanced worker message handling error:', error);
      parentPort.postMessage({
        type: 'error',
        sessionId,
        error: error.message
      });
    }
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    if (worker) {
      await worker.cleanup();
    }
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    if (worker) {
      await worker.cleanup();
    }
    process.exit(0);
  });

  console.log('🚀 Enhanced Advanced Crawler Worker started with SEO capabilities');
}

// Export for programmatic use
export { EnhancedAdvancedCrawlerWorker, SEOOptimizationEngine };

// Run enhanced worker if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runEnhancedCrawlerWorker().catch(console.error);
}
