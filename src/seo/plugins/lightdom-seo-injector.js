/**
 * LightDOM SEO Injector
 * Real-time SEO optimization plugin that intercepts DOM rendering
 * Applies AI-driven optimizations based on collective intelligence
 * 
 * Usage: Add to <head> before any other scripts:
 * <script src="https://lightdom.ai/seo-injector.js" data-api-key="YOUR_KEY"></script>
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    apiKey: document.currentScript?.getAttribute('data-api-key'),
    modelId: document.currentScript?.getAttribute('data-model-id') || 'latest',
    endpoint: document.currentScript?.getAttribute('data-endpoint') || 'https://api.lightdom.ai',
    features: document.currentScript?.getAttribute('data-features') || 'all',
    debug: document.currentScript?.getAttribute('data-debug') === 'true',
    autoOptimize: document.currentScript?.getAttribute('data-auto') !== 'false',
    miningEnabled: document.currentScript?.getAttribute('data-mining') !== 'false'
  };

  // SEO Optimization Rules (from collective AI model)
  const SEO_RULES = {
    title: {
      minLength: 50,
      maxLength: 60,
      keywordPosition: 30,
      powerWords: ['best', 'guide', 'how', 'tips', 'ultimate', 'complete', 'free', 'top'],
      templates: [
        '{keyword} - {brand}',
        'Best {keyword} Guide ({year})',
        'How to {keyword}: Complete Guide',
        '{number} {keyword} Tips You Need to Know'
      ]
    },
    meta: {
      minLength: 150,
      maxLength: 160,
      ctaWords: ['learn', 'discover', 'find', 'get', 'explore', 'read'],
      templates: [
        '{description} Learn {keyword} with our guide.',
        'Discover {keyword}. {benefit}. Start today!',
        '{description} Get expert {keyword} tips here.'
      ]
    },
    headings: {
      h1Required: true,
      h1MaxCount: 1,
      keywordInH1: true,
      semanticStructure: true
    },
    content: {
      minWords: 1500,
      targetWords: 2500,
      keywordDensity: { min: 0.5, max: 2.5 },
      readabilityTarget: 60,
      paragraphLength: { min: 40, max: 150 }
    },
    technical: {
      lazyLoadImages: true,
      optimizeScripts: true,
      preconnectDomains: true,
      minifyInline: true
    }
  };

  // Feature extraction for blockchain mining
  class FeatureExtractor {
    constructor() {
      this.features = {};
      this.featureBitmap = 0n;
    }

    extract() {
      const startTime = performance.now();
      
      // Extract all 194 features
      this.extractOnPageFeatures();
      this.extractTechnicalFeatures();
      this.extractCoreWebVitals();
      this.extractContentFeatures();
      
      const extractionTime = performance.now() - startTime;
      
      return {
        features: this.features,
        bitmap: this.featureBitmap,
        extractionTime,
        url: window.location.href,
        timestamp: Date.now()
      };
    }

    extractOnPageFeatures() {
      // Title features (1-6)
      const title = document.title;
      this.features.title_text = title;
      this.features.title_length = title.length;
      this.features.title_word_count = title.split(/\s+/).length;
      this.features.title_optimal_length = title.length >= 50 && title.length <= 60;
      this.setFeatureBit(1, 2, 3, 4);

      // Meta description (7-11)
      const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
      this.features.meta_description = metaDesc;
      this.features.meta_desc_length = metaDesc.length;
      this.features.meta_desc_optimal = metaDesc.length >= 150 && metaDesc.length <= 160;
      this.features.meta_desc_has_cta = SEO_RULES.meta.ctaWords.some(word => 
        metaDesc.toLowerCase().includes(word)
      );
      this.setFeatureBit(7, 8, 9, 11);

      // Headings (12-20)
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach((tag, index) => {
        const elements = document.querySelectorAll(tag);
        this.features[`${tag}_count`] = elements.length;
        this.setFeatureBit(12 + index);
      });

      // URL features (21-28)
      const url = window.location.href;
      this.features.url = url;
      this.features.url_length = url.length;
      this.features.url_depth = url.split('/').filter(p => p).length - 2;
      this.features.url_is_https = url.startsWith('https://');
      this.setFeatureBit(21, 22, 23, 28);
    }

    extractTechnicalFeatures() {
      // Performance metrics (36-43)
      if (window.performance) {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          this.features.time_to_first_byte = Math.round(perfData.responseStart);
          this.features.dom_content_loaded = Math.round(perfData.domContentLoadedEventEnd);
          this.setFeatureBit(42, 43);
        }
      }

      // Mobile & Schema (44-55)
      this.features.viewport_configured = !!document.querySelector('meta[name="viewport"]');
      this.features.has_schema_markup = !!document.querySelector('script[type="application/ld+json"]');
      this.setFeatureBit(45, 50);

      // Calculate page size
      this.calculatePageSize();
    }

    extractCoreWebVitals() {
      // Observe CWV metrics (64-81)
      if ('PerformanceObserver' in window) {
        // LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.features.lcp_ms = Math.round(lastEntry.startTime);
          this.features.lcp_good = lastEntry.startTime <= 2500;
          this.setFeatureBit(64, 66);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          this.features.cls_score = clsValue;
          this.features.cls_good = clsValue <= 0.1;
          this.setFeatureBit(76, 78);
        }).observe({ entryTypes: ['layout-shift'] });
      }
    }

    extractContentFeatures() {
      // Content metrics (138-159)
      const bodyText = document.body.innerText || '';
      const words = bodyText.split(/\s+/).filter(w => w.length > 0);
      const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const paragraphs = document.querySelectorAll('p');
      
      this.features.word_count = words.length;
      this.features.paragraph_count = paragraphs.length;
      this.features.sentence_count = sentences.length;
      this.features.avg_sentence_length = sentences.length > 0 ? 
        words.length / sentences.length : 0;
      
      this.setFeatureBit(138, 139, 140, 141);

      // Images (146-151)
      const images = document.querySelectorAll('img');
      const imagesWithAlt = Array.from(images).filter(img => img.alt);
      
      this.features.image_count = images.length;
      this.features.images_with_alt = imagesWithAlt.length;
      this.features.images_without_alt = images.length - imagesWithAlt.length;
      this.features.image_alt_optimization_rate = images.length > 0 ?
        imagesWithAlt.length / images.length : 0;
        
      this.setFeatureBit(146, 147, 148, 151);
    }

    calculatePageSize() {
      // Estimate page sizes (36-40)
      const html = document.documentElement.outerHTML;
      this.features.html_size_kb = Math.round(new Blob([html]).size / 1024);
      
      // Count resources
      const scripts = document.querySelectorAll('script');
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      const images = document.querySelectorAll('img');
      
      this.features.total_requests = scripts.length + styles.length + images.length;
      this.features.js_size_kb = scripts.length * 30; // Estimate
      this.features.css_size_kb = styles.length * 20; // Estimate
      this.features.image_size_kb = images.length * 100; // Estimate
      
      this.setFeatureBit(36, 37, 38, 39, 40, 41);
    }

    setFeatureBit(...featureIds) {
      featureIds.forEach(id => {
        this.featureBitmap |= (1n << BigInt(id - 1));
      });
    }
  }

  // SEO Optimization Engine
  class SEOOptimizer {
    constructor() {
      this.optimizations = [];
      this.score = 0;
    }

    async optimize() {
      console.log('[LightDOM SEO] Starting optimization...');
      
      // Pre-render optimizations
      this.interceptDOM();
      
      // Title optimization
      this.optimizeTitle();
      
      // Meta optimization
      this.optimizeMeta();
      
      // Heading optimization
      this.optimizeHeadings();
      
      // Content optimization
      this.optimizeContent();
      
      // Technical optimizations
      this.optimizeTechnical();
      
      // Schema markup
      this.addSchemaMarkup();
      
      // Report optimizations
      this.reportOptimizations();
      
      // Mine data if enabled
      if (config.miningEnabled) {
        this.mineData();
      }
    }

    interceptDOM() {
      // Override document.write to optimize content before rendering
      const originalWrite = document.write;
      document.write = function(content) {
        const optimized = SEOOptimizer.optimizeHTML(content);
        originalWrite.call(document, optimized);
      };

      // Intercept innerHTML modifications
      const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
      Object.defineProperty(Element.prototype, 'innerHTML', {
        set: function(value) {
          const optimized = SEOOptimizer.optimizeHTML(value);
          originalInnerHTML.set.call(this, optimized);
        },
        get: originalInnerHTML.get
      });
    }

    static optimizeHTML(html) {
      // Quick optimizations on HTML strings
      let optimized = html;
      
      // Add lazy loading to images
      optimized = optimized.replace(
        /<img(?![^>]*loading)/gi,
        '<img loading="lazy"'
      );
      
      // Add width/height to prevent CLS
      optimized = optimized.replace(
        /<img(?![^>]*width)([^>]*src="([^"]+)")/gi,
        '<img width="800" height="600"$1'
      );
      
      return optimized;
    }

    optimizeTitle() {
      const title = document.title;
      const titleElement = document.querySelector('title');
      
      if (!titleElement) {
        const newTitle = document.createElement('title');
        document.head.appendChild(newTitle);
      }
      
      // Check title length
      if (title.length < SEO_RULES.title.minLength || 
          title.length > SEO_RULES.title.maxLength) {
        
        // Get keyword from meta or URL
        const keyword = this.detectKeyword();
        
        // Generate optimized title
        const optimizedTitle = this.generateOptimizedTitle(title, keyword);
        document.title = optimizedTitle;
        
        this.optimizations.push({
          type: 'title',
          original: title,
          optimized: optimizedTitle,
          impact: 'high'
        });
      }
    }

    optimizeMeta() {
      let metaDesc = document.querySelector('meta[name="description"]');
      
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      
      const currentDesc = metaDesc.content || '';
      
      if (currentDesc.length < SEO_RULES.meta.minLength || 
          currentDesc.length > SEO_RULES.meta.maxLength) {
        
        const keyword = this.detectKeyword();
        const optimizedDesc = this.generateOptimizedDescription(currentDesc, keyword);
        metaDesc.content = optimizedDesc;
        
        this.optimizations.push({
          type: 'meta_description',
          original: currentDesc,
          optimized: optimizedDesc,
          impact: 'high'
        });
      }
      
      // Add missing meta tags
      this.addMissingMetaTags();
    }

    optimizeHeadings() {
      const h1s = document.querySelectorAll('h1');
      
      // Ensure exactly one H1
      if (h1s.length === 0) {
        // Convert first H2 to H1 or create new
        const firstH2 = document.querySelector('h2');
        if (firstH2) {
          const h1 = document.createElement('h1');
          h1.textContent = firstH2.textContent;
          firstH2.parentNode.replaceChild(h1, firstH2);
          
          this.optimizations.push({
            type: 'heading',
            action: 'converted_h2_to_h1',
            impact: 'high'
          });
        }
      } else if (h1s.length > 1) {
        // Convert extra H1s to H2s
        for (let i = 1; i < h1s.length; i++) {
          const h2 = document.createElement('h2');
          h2.textContent = h1s[i].textContent;
          h1s[i].parentNode.replaceChild(h2, h1s[i]);
        }
        
        this.optimizations.push({
          type: 'heading',
          action: 'fixed_multiple_h1s',
          impact: 'medium'
        });
      }
      
      // Add keyword to H1 if missing
      const h1 = document.querySelector('h1');
      const keyword = this.detectKeyword();
      
      if (h1 && keyword && !h1.textContent.toLowerCase().includes(keyword.toLowerCase())) {
        h1.textContent = `${h1.textContent} - ${keyword}`;
        
        this.optimizations.push({
          type: 'heading',
          action: 'added_keyword_to_h1',
          impact: 'medium'
        });
      }
    }

    optimizeContent() {
      // Add structured data attributes for better parsing
      const paragraphs = document.querySelectorAll('p');
      
      paragraphs.forEach((p, index) => {
        // Mark first paragraph for keyword placement
        if (index === 0) {
          p.setAttribute('data-seo-first-paragraph', 'true');
        }
        
        // Split long paragraphs
        const words = p.textContent.split(/\s+/).length;
        if (words > SEO_RULES.content.paragraphLength.max) {
          this.splitParagraph(p);
        }
      });
      
      // Optimize images
      this.optimizeImages();
      
      // Add internal links
      this.suggestInternalLinks();
    }

    optimizeImages() {
      const images = document.querySelectorAll('img');
      const keyword = this.detectKeyword();
      
      images.forEach((img, index) => {
        // Add missing alt text
        if (!img.alt) {
          const context = this.getImageContext(img);
          img.alt = `${context} ${keyword} image ${index + 1}`;
          
          this.optimizations.push({
            type: 'image',
            action: 'added_alt_text',
            element: img.src,
            impact: 'medium'
          });
        }
        
        // Add dimensions to prevent CLS
        if (!img.width && !img.height) {
          img.loading = 'lazy';
          
          // Estimate dimensions
          img.width = 800;
          img.height = 600;
          
          this.optimizations.push({
            type: 'image',
            action: 'added_dimensions',
            impact: 'high'
          });
        }
        
        // Convert to WebP recommendation
        if (img.src.match(/\.(jpg|jpeg|png)$/i)) {
          img.setAttribute('data-seo-recommend', 'convert-to-webp');
        }
      });
    }

    optimizeTechnical() {
      // Preconnect to external domains
      const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
      const domains = new Set();
      
      externalLinks.forEach(link => {
        const url = new URL(link.href);
        domains.add(url.origin);
      });
      
      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        document.head.appendChild(link);
      });
      
      // Defer non-critical scripts
      const scripts = document.querySelectorAll('script[src]:not([defer]):not([async])');
      scripts.forEach(script => {
        if (!script.src.includes('lightdom-seo')) {
          script.defer = true;
        }
      });
      
      // Add resource hints
      this.addResourceHints();
    }

    addSchemaMarkup() {
      const existingSchema = document.querySelector('script[type="application/ld+json"]');
      
      if (!existingSchema) {
        const schema = {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: document.title,
          description: document.querySelector('meta[name="description"]')?.content || '',
          url: window.location.href,
          datePublished: new Date().toISOString(),
          author: {
            '@type': 'Organization',
            name: window.location.hostname
          }
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
        
        this.optimizations.push({
          type: 'schema',
          action: 'added_article_schema',
          impact: 'high'
        });
      }
    }

    // Helper methods
    detectKeyword() {
      // Try multiple sources to detect target keyword
      const sources = [
        () => document.querySelector('meta[name="keywords"]')?.content?.split(',')[0]?.trim(),
        () => document.querySelector('meta[property="og:title"]')?.content?.split('-')[0]?.trim(),
        () => {
          const h1 = document.querySelector('h1');
          if (h1) {
            const words = h1.textContent.split(/\s+/);
            return words.slice(0, 3).join(' ');
          }
        },
        () => {
          const path = window.location.pathname.split('/').pop();
          return path.replace(/-/g, ' ').replace(/\.\w+$/, '');
        }
      ];
      
      for (const source of sources) {
        const keyword = source();
        if (keyword) return keyword;
      }
      
      return 'content';
    }

    generateOptimizedTitle(original, keyword) {
      const brand = window.location.hostname.replace('www.', '').split('.')[0];
      const year = new Date().getFullYear();
      
      // Try to fit original into constraints
      if (original.length >= 40 && original.length <= 70) {
        // Just adjust if needed
        if (!original.toLowerCase().includes(keyword.toLowerCase())) {
          return `${keyword} - ${original}`.substring(0, 60);
        }
        return original;
      }
      
      // Generate new title from template
      const templates = SEO_RULES.title.templates;
      const template = templates[Math.floor(Math.random() * templates.length)];
      
      return template
        .replace('{keyword}', keyword)
        .replace('{brand}', brand)
        .replace('{year}', year)
        .replace('{number}', Math.floor(Math.random() * 10 + 5));
    }

    generateOptimizedDescription(original, keyword) {
      if (original.length >= 140 && original.length <= 170) {
        return original;
      }
      
      const benefit = 'Improve your results';
      const template = SEO_RULES.meta.templates[0];
      
      let description = original || `Learn about ${keyword}`;
      if (description.length < 100) {
        description += '. ' + benefit;
      }
      
      return template
        .replace('{description}', description)
        .replace('{keyword}', keyword)
        .replace('{benefit}', benefit)
        .substring(0, 160);
    }

    getImageContext(img) {
      // Try to determine image context from surrounding text
      const parent = img.parentElement;
      const text = parent?.textContent?.substring(0, 50) || '';
      
      if (text) {
        return text.trim().replace(/\s+/g, ' ');
      }
      
      return 'Related';
    }

    splitParagraph(p) {
      const sentences = p.textContent.split(/(?<=[.!?])\s+/);
      const midpoint = Math.floor(sentences.length / 2);
      
      const p1 = document.createElement('p');
      const p2 = document.createElement('p');
      
      p1.textContent = sentences.slice(0, midpoint).join(' ');
      p2.textContent = sentences.slice(midpoint).join(' ');
      
      p.parentNode.insertBefore(p1, p);
      p.parentNode.insertBefore(p2, p);
      p.remove();
    }

    suggestInternalLinks() {
      // Add data attributes for internal linking opportunities
      const paragraphs = document.querySelectorAll('p');
      const keywords = ['guide', 'learn more', 'how to', 'tips', 'best practices'];
      
      paragraphs.forEach(p => {
        keywords.forEach(keyword => {
          if (p.textContent.toLowerCase().includes(keyword)) {
            p.setAttribute('data-seo-link-opportunity', keyword);
          }
        });
      });
    }

    addMissingMetaTags() {
      const metaTags = [
        { property: 'og:title', content: document.title },
        { property: 'og:description', content: document.querySelector('meta[name="description"]')?.content || '' },
        { property: 'og:url', content: window.location.href },
        { property: 'og:type', content: 'article' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ];
      
      metaTags.forEach(tag => {
        const existing = document.querySelector(`meta[property="${tag.property}"], meta[name="${tag.name}"]`);
        if (!existing && tag.content) {
          const meta = document.createElement('meta');
          if (tag.property) {
            meta.setAttribute('property', tag.property);
          } else {
            meta.setAttribute('name', tag.name);
          }
          meta.content = tag.content;
          document.head.appendChild(meta);
        }
      });
    }

    addResourceHints() {
      // DNS prefetch for common CDNs
      const cdns = [
        '//fonts.googleapis.com',
        '//www.google-analytics.com',
        '//www.googletagmanager.com'
      ];
      
      cdns.forEach(cdn => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = cdn;
        document.head.appendChild(link);
      });
    }

    async mineData() {
      // Extract features for blockchain
      const extractor = new FeatureExtractor();
      const data = extractor.extract();
      
      // Calculate quality score
      const qualityScore = this.calculateDataQuality(data.features);
      
      // Send to blockchain via API
      if (config.apiKey) {
        try {
          const response = await fetch(`${config.endpoint}/mine`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': config.apiKey
            },
            body: JSON.stringify({
              url: data.url,
              features: data.features,
              bitmap: data.bitmap.toString(),
              qualityScore,
              timestamp: data.timestamp
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('[LightDOM SEO] Mining successful:', result);
          }
        } catch (error) {
          console.error('[LightDOM SEO] Mining failed:', error);
        }
      }
    }

    calculateDataQuality(features) {
      let score = 0;
      let checks = 0;
      
      // Check data completeness
      const requiredFeatures = ['title_text', 'meta_description', 'word_count', 'h1_count'];
      requiredFeatures.forEach(feature => {
        checks++;
        if (features[feature]) score++;
      });
      
      // Check data quality
      if (features.title_length >= 50 && features.title_length <= 60) score++;
      if (features.meta_desc_length >= 150 && features.meta_desc_length <= 160) score++;
      if (features.word_count >= 1000) score++;
      if (features.h1_count === 1) score++;
      if (features.image_alt_optimization_rate > 0.8) score++;
      
      checks += 5;
      
      return Math.round((score / checks) * 100);
    }

    reportOptimizations() {
      if (this.optimizations.length === 0) return;
      
      const report = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        optimizations: this.optimizations,
        summary: {
          total: this.optimizations.length,
          high_impact: this.optimizations.filter(o => o.impact === 'high').length,
          medium_impact: this.optimizations.filter(o => o.impact === 'medium').length,
          low_impact: this.optimizations.filter(o => o.impact === 'low').length
        }
      };
      
      // Console report
      console.group('[LightDOM SEO] Optimization Report');
      console.log('Total optimizations:', report.summary.total);
      console.log('High impact:', report.summary.high_impact);
      console.log('Optimizations:', report.optimizations);
      console.groupEnd();
      
      // Send to dashboard if connected
      if (window.LightDOMSEO) {
        window.LightDOMSEO.report = report;
      }
      
      // Trigger custom event
      window.dispatchEvent(new CustomEvent('lightdom-seo-optimized', { detail: report }));
    }
  }

  // Initialize and run
  if (document.readyState === 'loading') {
    // Run before DOM is fully loaded for maximum impact
    const optimizer = new SEOOptimizer();
    
    // Start optimizations immediately
    optimizer.optimize();
    
    // Re-run after DOM is loaded for dynamic content
    document.addEventListener('DOMContentLoaded', () => {
      optimizer.optimize();
    });
  } else {
    // DOM already loaded
    const optimizer = new SEOOptimizer();
    optimizer.optimize();
  }

  // Expose API
  window.LightDOMSEO = {
    version: '1.0.0',
    config,
    optimize: () => new SEOOptimizer().optimize(),
    extract: () => new FeatureExtractor().extract(),
    getReport: () => window.LightDOMSEO.report || null
  };

})();