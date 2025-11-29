/**
 * 3D DOM Data Mining Service
 *
 * Advanced data mining service that:
 * 1. Renders 3D models of DOM structures using Chrome Layers
 * 2. Scrapes DOM according to hierarchy (important elements only)
 * 3. Links schemas together for semantic relationships
 * 4. Generates JSON-LD/SEO attributes for rich snippets
 * 5. Creates training data for ML-based SEO optimization
 *
 * Use Cases:
 * - Generate 3D visualizations of website structure
 * - Extract semantic hierarchies for schema.org markup
 * - Mine DOM patterns for SEO optimization
 * - Create training datasets for neural network SEO models
 * - Automated rich snippet generation
 */

import puppeteer from 'puppeteer';
import { AdaptiveBrowserConfig } from '../utils/AdaptiveBrowserConfig.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';

export class DOM3DDataMiningService {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false,
      timeout: options.timeout || 30000,
      maxDepth: options.maxDepth || 10,
      minImportanceScore: options.minImportanceScore || 0.3,
      ...options,
    };

    this.browserConfig = new AdaptiveBrowserConfig();
    this.perfMonitor = new PerformanceMonitor({ learningRate: 0.1 });
    this.browser = null;
    this.miningResults = new Map();
  }

  /**
   * Initialize the service
   */
  async initialize() {
    await this.browserConfig.initialize();

    // Use visualization preset with GPU if available
    const config = await this.browserConfig.getConfig({
      task: 'visualization',
      enableGPU: true,
    });

    this.browser = await puppeteer.launch(config.config);
    console.log('✅ 3D DOM Data Mining Service initialized');
    console.log(`   GPU: ${config.gpuEnabled ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Mine a URL and generate comprehensive 3D DOM structure with schemas
   *
   * @param {string} url - URL to mine
   * @param {Object} options - Mining options
   * @returns {Object} Complete mining result with 3D model, schemas, and SEO data
   */
  async mineURL(url, options = {}) {
    const startTime = Date.now();
    let error = false;

    try {
      console.log(`🔍 Mining URL: ${url}`);

      const page = await this.browser.newPage();
      const client = await page.target().createCDPSession();

      // Enable necessary CDP domains
      await Promise.all([
        client.send('LayerTree.enable'),
        client.send('DOM.enable'),
        client.send('CSS.enable'),
        client.send('Page.enable'),
        client.send('Runtime.enable'),
      ]);

      // Navigate to page
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.options.timeout,
      });

      // Wait for page to settle
      await page.waitForTimeout(1000);

      // Extract all necessary data in parallel
      const [dom3DModel, domHierarchy, schemaData, seoMetadata, semanticStructure] =
        await Promise.all([
          this.extract3DModel(client, page),
          this.extractHierarchy(page),
          this.extractSchemas(page),
          this.extractSEOMetadata(page),
          this.extractSemanticStructure(page),
        ]);

      // Link schemas together
      const linkedSchemas = await this.linkSchemas(schemaData, semanticStructure, domHierarchy);

      // Generate rich snippet recommendations
      const richSnippets = this.generateRichSnippets(linkedSchemas, seoMetadata);

      // Create training data for ML models
      const trainingData = this.createTrainingData(dom3DModel, linkedSchemas, seoMetadata);

      const result = {
        url,
        timestamp: new Date().toISOString(),
        dom3DModel,
        domHierarchy,
        schemas: linkedSchemas,
        seo: {
          metadata: seoMetadata,
          richSnippets,
          recommendations: this.generateSEORecommendations(seoMetadata, linkedSchemas),
        },
        trainingData,
        metadata: {
          processingTime: Date.now() - startTime,
          totalElements: domHierarchy.totalElements,
          importantElements: domHierarchy.importantElements.length,
          layerCount: dom3DModel.layers.length,
          schemaTypes: Object.keys(linkedSchemas.byType).length,
          seoScore: this.calculateSEOScore(seoMetadata, linkedSchemas),
        },
      };

      await page.close();

      // Cache result
      this.miningResults.set(url, result);

      console.log(`✅ Mining complete: ${url}`);
      console.log(
        `   Elements: ${result.metadata.totalElements} (${result.metadata.importantElements} important)`
      );
      console.log(`   Schemas: ${result.metadata.schemaTypes} types`);
      console.log(`   SEO Score: ${result.metadata.seoScore.toFixed(2)}/100`);

      return result;
    } catch (err) {
      error = true;
      console.error(`❌ Mining failed for ${url}:`, err.message);
      throw err;
    } finally {
      // Record performance metrics
      this.perfMonitor.record('dom-3d-mining', {
        responseTime: Date.now() - startTime,
        error,
        url,
      });
    }
  }

  /**
   * Extract 3D model of DOM using Chrome Layers
   */
  async extract3DModel(client, page) {
    console.log('🎨 Extracting 3D model...');

    // Get DOM snapshot with layout information
    const domSnapshot = await client.send('DOMSnapshot.captureSnapshot', {
      computedStyles: [
        'position',
        'z-index',
        'transform',
        'opacity',
        'display',
        'width',
        'height',
        'top',
        'left',
        'right',
        'bottom',
      ],
      includePaintOrder: true,
      includeDOMRects: true,
    });

    const layers = [];
    const doc = domSnapshot.documents[0];

    // Process each node
    for (let i = 0; i < doc.nodes.nodeType.length; i++) {
      if (doc.nodes.nodeType[i] !== 1) continue; // Elements only

      const bounds = doc.layout?.bounds?.[i];
      if (!bounds) continue;

      const nodeName = doc.nodes.nodeName[i];
      const paintOrder = doc.layout?.paintOrders?.[i] || 0;

      // Get computed styles
      const styles = this.getComputedStyles(doc, i);

      // Calculate 3D position
      const position3D = {
        x: bounds[0],
        y: bounds[1],
        z: this.calculateZPosition(styles, paintOrder),
        width: bounds[2],
        height: bounds[3],
      };

      // Determine if this is an important layer
      const importance = this.calculateImportanceScore(nodeName, styles, position3D);

      if (importance >= this.options.minImportanceScore) {
        layers.push({
          id: `layer-${i}`,
          nodeId: i,
          nodeName,
          position3D,
          styles: {
            position: styles.position || 'static',
            zIndex: styles['z-index'],
            transform: styles.transform,
            opacity: parseFloat(styles.opacity) || 1,
            display: styles.display,
          },
          importance,
          paintOrder,
          isComposited: this.isCompositingLayer(styles),
        });
      }
    }

    return {
      layers: layers.sort((a, b) => b.importance - a.importance),
      bounds: await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      })),
      viewport: await page.viewport(),
    };
  }

  /**
   * Extract DOM hierarchy focusing on important elements
   */
  async extractHierarchy(page) {
    console.log('🌳 Extracting DOM hierarchy...');

    const hierarchy = await page.evaluate(
      (maxDepth, minImportance) => {
        const importantElements = [];
        const hierarchyMap = new Map();

        function calculateImportance(element) {
          let score = 0;

          // Semantic tags are important
          const semanticTags = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'];
          if (semanticTags.includes(element.tagName.toLowerCase())) score += 0.3;

          // Heading tags
          if (/^H[1-6]$/.test(element.tagName)) score += 0.4;

          // Content importance
          if (element.tagName === 'P' || element.tagName === 'DIV') {
            const textLength = element.textContent?.trim().length || 0;
            if (textLength > 50) score += 0.2;
          }

          // ARIA and role attributes
          if (element.hasAttribute('role')) score += 0.2;
          if (element.hasAttribute('aria-label')) score += 0.1;

          // Schema.org markup
          if (element.hasAttribute('itemscope')) score += 0.5;
          if (element.hasAttribute('itemtype')) score += 0.3;

          // Unique IDs suggest importance
          if (element.id) score += 0.1;

          // Visibility matters
          const style = window.getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden') score = 0;

          return Math.min(score, 1);
        }

        function traverseDOM(element, depth = 0, parent = null) {
          if (depth > maxDepth) return;

          const importance = calculateImportance(element);
          const elementData = {
            tag: element.tagName,
            id: element.id || null,
            classes: Array.from(element.classList),
            importance,
            depth,
            children: [],
            attributes: {},
            text: element.textContent?.trim().substring(0, 200) || null,
          };

          // Capture important attributes
          ['role', 'aria-label', 'itemscope', 'itemtype', 'itemprop'].forEach(attr => {
            if (element.hasAttribute(attr)) {
              elementData.attributes[attr] = element.getAttribute(attr);
            }
          });

          if (importance >= minImportance) {
            importantElements.push(elementData);
          }

          // Recurse through children
          Array.from(element.children).forEach(child => {
            const childData = traverseDOM(child, depth + 1, elementData);
            if (childData) {
              elementData.children.push(childData);
            }
          });

          return elementData;
        }

        const root = traverseDOM(document.body);

        return {
          root,
          importantElements,
          totalElements: document.querySelectorAll('*').length,
        };
      },
      this.options.maxDepth,
      this.options.minImportanceScore
    );

    return hierarchy;
  }

  /**
   * Extract existing schema.org and JSON-LD data
   */
  async extractSchemas(page) {
    console.log('📋 Extracting schemas...');

    const schemas = await page.evaluate(() => {
      const result = {
        jsonLD: [],
        microdata: [],
        rdfa: [],
      };

      // Extract JSON-LD
      const jsonLDScripts = document.querySelectorAll('script[type="application/ld+json"]');
      jsonLDScripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent);
          result.jsonLD.push(data);
        } catch (e) {
          console.warn('Invalid JSON-LD:', e);
        }
      });

      // Extract Microdata
      const itemScopes = document.querySelectorAll('[itemscope]');
      itemScopes.forEach(element => {
        const schema = {
          type: element.getAttribute('itemtype'),
          properties: {},
        };

        const props = element.querySelectorAll('[itemprop]');
        props.forEach(prop => {
          const propName = prop.getAttribute('itemprop');
          const propValue = prop.getAttribute('content') || prop.textContent?.trim();
          schema.properties[propName] = propValue;
        });

        result.microdata.push(schema);
      });

      // Extract RDFa (basic)
      const rdfaElements = document.querySelectorAll('[typeof]');
      rdfaElements.forEach(element => {
        result.rdfa.push({
          type: element.getAttribute('typeof'),
          property: element.getAttribute('property'),
          content: element.getAttribute('content') || element.textContent?.trim(),
        });
      });

      return result;
    });

    return schemas;
  }

  /**
   * Extract SEO metadata
   */
  async extractSEOMetadata(page) {
    console.log('🔍 Extracting SEO metadata...');

    const metadata = await page.evaluate(() => {
      const result = {
        title: document.title,
        meta: {},
        headings: {},
        links: {
          internal: 0,
          external: 0,
          canonical: null,
        },
        images: {
          total: 0,
          withAlt: 0,
          withoutAlt: 0,
        },
        openGraph: {},
        twitter: {},
        structuredData: false,
      };

      // Meta tags
      document.querySelectorAll('meta').forEach(meta => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          result.meta[name] = content;

          // Open Graph
          if (name.startsWith('og:')) {
            result.openGraph[name.replace('og:', '')] = content;
          }

          // Twitter Card
          if (name.startsWith('twitter:')) {
            result.twitter[name.replace('twitter:', '')] = content;
          }
        }
      });

      // Headings
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
        const elements = document.querySelectorAll(tag);
        result.headings[tag] = {
          count: elements.length,
          text: Array.from(elements)
            .map(el => el.textContent?.trim())
            .filter(Boolean),
        };
      });

      // Links
      document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
          if (href.startsWith('http') && !href.includes(window.location.hostname)) {
            result.links.external++;
          } else {
            result.links.internal++;
          }
        }
      });

      // Canonical link
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        result.links.canonical = canonical.getAttribute('href');
      }

      // Images
      document.querySelectorAll('img').forEach(img => {
        result.images.total++;
        if (img.hasAttribute('alt') && img.getAttribute('alt').trim()) {
          result.images.withAlt++;
        } else {
          result.images.withoutAlt++;
        }
      });

      // Check for structured data
      result.structuredData = document.querySelector('script[type="application/ld+json"]') !== null;

      return result;
    });

    return metadata;
  }

  /**
   * Extract semantic structure
   */
  async extractSemanticStructure(page) {
    console.log('🧩 Extracting semantic structure...');

    const structure = await page.evaluate(() => {
      const sections = [];

      // Find major semantic sections
      const semanticTags = ['header', 'nav', 'main', 'article', 'section', 'aside', 'footer'];

      semanticTags.forEach(tag => {
        const elements = document.querySelectorAll(tag);
        elements.forEach((element, index) => {
          sections.push({
            type: tag,
            index,
            id: element.id || null,
            classes: Array.from(element.classList),
            role: element.getAttribute('role') || null,
            hasSchema: element.hasAttribute('itemscope'),
            childCount: element.children.length,
            textLength: element.textContent?.trim().length || 0,
          });
        });
      });

      return {
        sections,
        hasHeader: sections.some(s => s.type === 'header'),
        hasNav: sections.some(s => s.type === 'nav'),
        hasMain: sections.some(s => s.type === 'main'),
        hasFooter: sections.some(s => s.type === 'footer'),
        articleCount: sections.filter(s => s.type === 'article').length,
        sectionCount: sections.filter(s => s.type === 'section').length,
      };
    });

    return structure;
  }

  /**
   * Link schemas together based on semantic relationships
   */
  async linkSchemas(schemaData, semanticStructure, domHierarchy) {
    console.log('🔗 Linking schemas...');

    const linked = {
      byType: {},
      relationships: [],
      hierarchy: {},
      recommendations: [],
    };

    // Organize schemas by type
    schemaData.jsonLD.forEach(schema => {
      const type = schema['@type'] || 'Unknown';
      if (!linked.byType[type]) {
        linked.byType[type] = [];
      }
      linked.byType[type].push(schema);
    });

    schemaData.microdata.forEach(schema => {
      const type = schema.type?.split('/').pop() || 'Unknown';
      if (!linked.byType[type]) {
        linked.byType[type] = [];
      }
      linked.byType[type].push(schema);
    });

    // Infer missing schemas based on content
    const inferredSchemas = this.inferMissingSchemas(semanticStructure, domHierarchy);
    linked.recommendations = inferredSchemas;

    // Build relationship graph
    linked.relationships = this.buildSchemaRelationships(linked.byType);

    // Create hierarchical representation
    linked.hierarchy = this.buildSchemaHierarchy(linked.byType, semanticStructure);

    return linked;
  }

  /**
   * Infer missing schemas from content structure
   */
  inferMissingSchemas(semanticStructure, domHierarchy) {
    const recommendations = [];

    // Recommend Organization schema if header present
    if (semanticStructure.hasHeader && !this.hasSchemaType('Organization')) {
      recommendations.push({
        type: 'Organization',
        reason: 'Site has header - consider adding organization info',
        priority: 'medium',
        template: {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: '[Your Organization]',
          url: '[Your URL]',
          logo: '[Your Logo URL]',
        },
      });
    }

    // Recommend Article schema if article tags present
    if (semanticStructure.articleCount > 0) {
      recommendations.push({
        type: 'Article',
        reason: `Found ${semanticStructure.articleCount} article element(s)`,
        priority: 'high',
        template: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: '[Article Title]',
          author: {
            '@type': 'Person',
            name: '[Author Name]',
          },
          datePublished: '[Date]',
          image: '[Image URL]',
        },
      });
    }

    // Recommend BreadcrumbList if nav present
    if (semanticStructure.hasNav) {
      recommendations.push({
        type: 'BreadcrumbList',
        reason: 'Site has navigation - consider breadcrumbs',
        priority: 'low',
        template: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [],
        },
      });
    }

    return recommendations;
  }

  /**
   * Build relationships between schemas
   */
  buildSchemaRelationships(schemasByType) {
    const relationships = [];
    const types = Object.keys(schemasByType);

    // Common parent-child relationships
    const knownRelations = {
      Organization: ['Person', 'ContactPoint'],
      Article: ['Person', 'Organization'],
      WebPage: ['BreadcrumbList', 'Organization'],
      Product: ['Offer', 'AggregateRating', 'Review'],
    };

    types.forEach(parentType => {
      if (knownRelations[parentType]) {
        knownRelations[parentType].forEach(childType => {
          if (types.includes(childType)) {
            relationships.push({
              parent: parentType,
              child: childType,
              type: 'contains',
            });
          }
        });
      }
    });

    return relationships;
  }

  /**
   * Build hierarchical schema structure
   */
  buildSchemaHierarchy(schemasByType, semanticStructure) {
    return {
      root: 'WebPage',
      children: Object.keys(schemasByType).map(type => ({
        type,
        count: schemasByType[type].length,
        semantic: this.getSemanticMapping(type, semanticStructure),
      })),
    };
  }

  /**
   * Generate rich snippet recommendations
   */
  generateRichSnippets(linkedSchemas, seoMetadata) {
    const snippets = [];

    // Article rich snippet
    if (linkedSchemas.byType['Article']) {
      snippets.push({
        type: 'Article',
        status: 'present',
        recommendation: 'Ensure all required fields are filled',
        preview: 'Rich article cards in search results',
      });
    }

    // FAQ rich snippet potential
    if (seoMetadata.headings.h3?.count > 3) {
      snippets.push({
        type: 'FAQPage',
        status: 'potential',
        recommendation: 'Convert H3 sections to FAQ schema',
        preview: 'Expandable FAQ in search results',
      });
    }

    // Product rich snippet
    if (linkedSchemas.byType['Product']) {
      snippets.push({
        type: 'Product',
        status: 'present',
        recommendation: 'Add reviews and ratings for stars in search',
        preview: 'Product cards with pricing and ratings',
      });
    }

    return snippets;
  }

  /**
   * Generate SEO recommendations
   */
  generateSEORecommendations(seoMetadata, linkedSchemas) {
    const recommendations = [];

    // Title check
    if (!seoMetadata.title || seoMetadata.title.length < 30) {
      recommendations.push({
        type: 'title',
        severity: 'high',
        message: 'Title is too short (minimum 30 characters recommended)',
      });
    }

    // H1 check
    if (!seoMetadata.headings.h1 || seoMetadata.headings.h1.count === 0) {
      recommendations.push({
        type: 'h1',
        severity: 'high',
        message: 'Missing H1 tag',
      });
    } else if (seoMetadata.headings.h1.count > 1) {
      recommendations.push({
        type: 'h1',
        severity: 'medium',
        message: 'Multiple H1 tags found (only one recommended)',
      });
    }

    // Meta description
    if (!seoMetadata.meta.description) {
      recommendations.push({
        type: 'meta-description',
        severity: 'high',
        message: 'Missing meta description',
      });
    }

    // Images without alt
    if (seoMetadata.images.withoutAlt > 0) {
      recommendations.push({
        type: 'images',
        severity: 'medium',
        message: `${seoMetadata.images.withoutAlt} images missing alt text`,
      });
    }

    // Structured data
    if (!seoMetadata.structuredData) {
      recommendations.push({
        type: 'structured-data',
        severity: 'high',
        message: 'No structured data found - add JSON-LD schemas',
      });
    }

    // Schema recommendations from linked schemas
    linkedSchemas.recommendations.forEach(rec => {
      recommendations.push({
        type: 'schema',
        severity: rec.priority,
        message: rec.reason,
        action: `Add ${rec.type} schema`,
      });
    });

    return recommendations;
  }

  /**
   * Calculate SEO score (0-100)
   */
  calculateSEOScore(seoMetadata, linkedSchemas) {
    let score = 0;

    // Title (10 points)
    if (seoMetadata.title && seoMetadata.title.length >= 30 && seoMetadata.title.length <= 60) {
      score += 10;
    } else if (seoMetadata.title) {
      score += 5;
    }

    // Meta description (10 points)
    if (seoMetadata.meta.description && seoMetadata.meta.description.length >= 120) {
      score += 10;
    } else if (seoMetadata.meta.description) {
      score += 5;
    }

    // H1 (10 points)
    if (seoMetadata.headings.h1?.count === 1) {
      score += 10;
    } else if (seoMetadata.headings.h1?.count > 0) {
      score += 5;
    }

    // Heading structure (10 points)
    if (seoMetadata.headings.h2?.count > 0 && seoMetadata.headings.h3?.count > 0) {
      score += 10;
    } else if (seoMetadata.headings.h2?.count > 0) {
      score += 5;
    }

    // Images with alt (10 points)
    const altRatio =
      seoMetadata.images.total > 0 ? seoMetadata.images.withAlt / seoMetadata.images.total : 0;
    score += Math.floor(altRatio * 10);

    // Structured data (20 points)
    if (linkedSchemas.byType && Object.keys(linkedSchemas.byType).length > 0) {
      score += Math.min(20, Object.keys(linkedSchemas.byType).length * 5);
    }

    // Open Graph (10 points)
    if (Object.keys(seoMetadata.openGraph).length >= 4) {
      score += 10;
    } else if (Object.keys(seoMetadata.openGraph).length > 0) {
      score += 5;
    }

    // Canonical link (5 points)
    if (seoMetadata.links.canonical) {
      score += 5;
    }

    // Internal links (10 points)
    if (seoMetadata.links.internal > 10) {
      score += 10;
    } else if (seoMetadata.links.internal > 0) {
      score += Math.min(10, seoMetadata.links.internal);
    }

    // Mobile friendly (5 points - if viewport meta exists)
    if (seoMetadata.meta.viewport) {
      score += 5;
    }

    return Math.min(100, score);
  }

  /**
   * Create training data for ML models
   */
  createTrainingData(dom3DModel, linkedSchemas, seoMetadata) {
    return {
      features: {
        // DOM structure features
        totalLayers: dom3DModel.layers.length,
        compositedLayers: dom3DModel.layers.filter(l => l.isComposited).length,
        avgLayerImportance:
          dom3DModel.layers.reduce((sum, l) => sum + l.importance, 0) / dom3DModel.layers.length,
        maxZDepth: Math.max(...dom3DModel.layers.map(l => l.position3D.z)),

        // Schema features
        schemaTypes: Object.keys(linkedSchemas.byType).length,
        hasOrganization: !!linkedSchemas.byType['Organization'],
        hasArticle: !!linkedSchemas.byType['Article'],
        hasProduct: !!linkedSchemas.byType['Product'],

        // SEO features
        titleLength: seoMetadata.title?.length || 0,
        hasMetaDescription: !!seoMetadata.meta.description,
        h1Count: seoMetadata.headings.h1?.count || 0,
        h2Count: seoMetadata.headings.h2?.count || 0,
        imageAltRatio:
          seoMetadata.images.total > 0 ? seoMetadata.images.withAlt / seoMetadata.images.total : 0,
        internalLinks: seoMetadata.links.internal,
        externalLinks: seoMetadata.links.external,
        hasOpenGraph: Object.keys(seoMetadata.openGraph).length > 0,
        hasCanonical: !!seoMetadata.links.canonical,
      },
      labels: {
        seoScore: this.calculateSEOScore(seoMetadata, linkedSchemas),
        hasRichSnippets: linkedSchemas.byType && Object.keys(linkedSchemas.byType).length > 0,
      },
      metadata: {
        url: seoMetadata.title,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Helper: Get computed styles
   */
  getComputedStyles(doc, nodeIndex) {
    const styles = {};
    if (doc.layout?.styles && doc.computedStyles) {
      const styleIndex = doc.layout.styles[nodeIndex];
      if (styleIndex !== undefined && doc.computedStyles.values[styleIndex]) {
        for (let j = 0; j < doc.computedStyles.properties.length; j++) {
          const prop = doc.computedStyles.properties[j];
          const value = doc.computedStyles.values[styleIndex][j];
          if (value !== undefined) {
            styles[prop] = value;
          }
        }
      }
    }
    return styles;
  }

  /**
   * Helper: Calculate Z position from styles and paint order
   */
  calculateZPosition(styles, paintOrder) {
    let z = paintOrder;

    const zIndex = this.parseZIndex(styles['z-index']);
    if (zIndex !== null) {
      z += zIndex * 100;
    }

    // Position values affect stacking
    if (styles.position === 'fixed') z += 10000;
    else if (styles.position === 'sticky') z += 5000;
    else if (styles.position === 'absolute') z += 1000;
    else if (styles.position === 'relative') z += 100;

    return z;
  }

  /**
   * Helper: Parse z-index value
   */
  parseZIndex(value) {
    if (!value || value === 'auto') return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Helper: Calculate importance score for an element
   */
  calculateImportanceScore(nodeName, styles, position3D) {
    let score = 0;

    // Semantic importance
    const semanticTags = {
      HEADER: 0.8,
      NAV: 0.7,
      MAIN: 0.9,
      ARTICLE: 0.8,
      SECTION: 0.6,
      ASIDE: 0.5,
      FOOTER: 0.7,
      H1: 1.0,
      H2: 0.9,
      H3: 0.8,
      H4: 0.7,
      H5: 0.6,
      H6: 0.5,
    };

    score = semanticTags[nodeName] || 0.3;

    // Size importance
    const area = position3D.width * position3D.height;
    if (area > 100000) score += 0.2;
    else if (area > 10000) score += 0.1;

    // Position importance (higher z-index = more important)
    if (position3D.z > 1000) score += 0.2;
    else if (position3D.z > 100) score += 0.1;

    // Opacity (hidden elements are less important)
    const opacity = parseFloat(styles.opacity) || 1;
    score *= opacity;

    return Math.min(score, 1);
  }

  /**
   * Helper: Check if layer uses GPU compositing
   */
  isCompositingLayer(styles) {
    if (styles.transform && styles.transform !== 'none') return true;
    if (styles['will-change'] && styles['will-change'] !== 'auto') return true;
    if (styles.position === 'fixed') return true;
    return false;
  }

  /**
   * Helper: Check if schema type exists
   */
  hasSchemaType(type) {
    // This would check against extracted schemas in real implementation
    return false;
  }

  /**
   * Helper: Get semantic mapping for schema type
   */
  getSemanticMapping(schemaType, semanticStructure) {
    const mappings = {
      Organization: semanticStructure.hasHeader ? 'header' : null,
      Article: semanticStructure.articleCount > 0 ? 'article' : null,
      WebPage: semanticStructure.hasMain ? 'main' : null,
    };
    return mappings[schemaType] || null;
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    return this.perfMonitor.getMetricsReport('dom-3d-mining');
  }

  /**
   * Cleanup
   */
  async shutdown() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export default DOM3DDataMiningService;
