/**
 * Chrome Layers Panel Service
 * 
 * Implements Chrome DevTools Layers panel functionality using Chrome DevTools Protocol (CDP)
 * to extract 3D layer information, compositing layers, and component mapping.
 * 
 * Features:
 * - Extract layer tree with 3D coordinates (x, y, z-index)
 * - Analyze compositing layers and paint layers
 * - Map DOM elements to visual layers
 * - Generate training data from layer structures
 * - Link components to schemas
 */

import puppeteer from 'puppeteer';
import { createClient } from 'redis';

export class ChromeLayersService {
  constructor(options = {}) {
    this.browser = null;
    this.redisClient = null;
    this.options = {
      headless: options.headless !== false,
      timeout: options.timeout || 30000,
      cacheEnabled: options.cacheEnabled !== false,
      ...options
    };
  }

  /**
   * Initialize the service
   */
  async initialize() {
    // Launch browser with CDP enabled
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--enable-gpu',
        '--force-device-scale-factor=1',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1
      }
    });

    // Initialize Redis for caching if enabled
    if (this.options.cacheEnabled) {
      try {
        this.redisClient = createClient({
          url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        await this.redisClient.connect();
      } catch (error) {
        console.warn('Redis not available, caching disabled:', error.message);
        this.redisClient = null;
      }
    }

    console.log('✅ Chrome Layers Service initialized');
  }

  /**
   * Analyze a URL and extract 3D layer information
   * 
   * @param {string} url - URL to analyze
   * @param {Object} options - Analysis options
   * @returns {Object} Layer analysis data
   */
  async analyzeLayersForUrl(url, options = {}) {
    const cacheKey = `layers:${url}`;
    
    // Check cache first
    if (this.redisClient) {
      try {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        console.warn('Cache read error:', error.message);
      }
    }

    const page = await this.browser.newPage();
    
    try {
      // Enable necessary CDP domains
      const client = await page.target().createCDPSession();
      await client.send('LayerTree.enable');
      await client.send('DOM.enable');
      await client.send('CSS.enable');
      await client.send('Page.enable');

      // Navigate to page
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: this.options.timeout 
      });

      // Wait for any animations to settle
      await page.waitForTimeout(1000);

      // Get layer tree
      const layerTree = await client.send('LayerTree.compositingReasons');
      const layerSnapshot = await this.captureLayerSnapshot(client);
      
      // Get DOM tree for mapping
      const domSnapshot = await client.send('DOMSnapshot.captureSnapshot', {
        computedStyles: ['position', 'z-index', 'transform', 'opacity', 'will-change'],
        includePaintOrder: true,
        includeDOMRects: true
      });

      // Build comprehensive layer data
      const layerData = await this.buildLayerData(client, domSnapshot);
      
      // Extract component mapping
      const componentMap = await this.extractComponentMap(page, layerData, domSnapshot);
      
      // Generate 3D map coordinates
      const map3D = this.generate3DMap(layerData, componentMap);

      const result = {
        url,
        timestamp: new Date().toISOString(),
        layers: layerData,
        componentMap,
        map3D,
        metadata: {
          totalLayers: layerData.length,
          compositingLayers: layerData.filter(l => l.isComposited).length,
          maxZIndex: Math.max(...layerData.map(l => l.zIndex || 0)),
          viewport: await page.viewport()
        }
      };

      // Cache the result
      if (this.redisClient) {
        try {
          await this.redisClient.setEx(cacheKey, 3600, JSON.stringify(result)); // 1 hour cache
        } catch (error) {
          console.warn('Cache write error:', error.message);
        }
      }

      return result;
      
    } finally {
      await page.close();
    }
  }

  /**
   * Capture layer snapshot using CDP
   */
  async captureLayerSnapshot(client) {
    try {
      const snapshot = await client.send('LayerTree.loadSnapshot');
      return snapshot;
    } catch (error) {
      console.warn('Layer snapshot unavailable:', error.message);
      return null;
    }
  }

  /**
   * Build comprehensive layer data from CDP
   */
  async buildLayerData(client, domSnapshot) {
    const layers = [];
    
    try {
      // Get all layers from layer tree
      const layerTreeData = await client.send('LayerTree.compositingReasons');
      
      // Process each layer
      for (let i = 0; i < domSnapshot.documents[0].nodes.nodeType.length; i++) {
        const nodeType = domSnapshot.documents[0].nodes.nodeType[i];
        
        // Only process element nodes
        if (nodeType !== 1) continue;
        
        const nodeName = domSnapshot.documents[0].nodes.nodeName[i];
        const bounds = domSnapshot.documents[0].layout?.bounds?.[i];
        const paintOrder = domSnapshot.documents[0].layout?.paintOrders?.[i];
        
        if (!bounds) continue;

        // Get computed styles
        const styles = {};
        if (domSnapshot.documents[0].layout?.styles) {
          const styleIndex = domSnapshot.documents[0].layout.styles[i];
          if (styleIndex) {
            const computedStyles = domSnapshot.documents[0].computedStyles;
            if (computedStyles && computedStyles.values) {
              for (let j = 0; j < computedStyles.properties.length; j++) {
                const prop = computedStyles.properties[j];
                const value = computedStyles.values[styleIndex]?.[j];
                if (value !== undefined) {
                  styles[prop] = value;
                }
              }
            }
          }
        }

        const layer = {
          id: `layer-${i}`,
          nodeId: i,
          nodeName,
          bounds: {
            x: bounds[0],
            y: bounds[1],
            width: bounds[2],
            height: bounds[3]
          },
          zIndex: this.parseZIndex(styles['z-index']),
          position: styles.position || 'static',
          transform: styles.transform || 'none',
          opacity: parseFloat(styles.opacity) || 1,
          willChange: styles['will-change'] || 'auto',
          paintOrder: paintOrder || 0,
          isComposited: this.isCompositingLayer(styles),
          styles
        };

        layers.push(layer);
      }
    } catch (error) {
      console.error('Error building layer data:', error);
    }

    return layers;
  }

  /**
   * Extract component mapping from page
   */
  async extractComponentMap(page, layerData, domSnapshot) {
    const componentMap = await page.evaluate((layers) => {
      const components = [];
      
      // Find all major UI components
      const componentSelectors = [
        '[class*="component"]',
        '[class*="widget"]',
        '[data-component]',
        '[role]',
        'nav', 'header', 'footer', 'aside', 'main', 'section', 'article',
        'button', 'input', 'select', 'textarea', 'form',
        '[id]'
      ];

      componentSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(el);
            
            components.push({
              selector,
              index,
              tagName: el.tagName.toLowerCase(),
              id: el.id || null,
              className: el.className || null,
              bounds: {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
              },
              zIndex: computedStyle.zIndex,
              position: computedStyle.position,
              role: el.getAttribute('role'),
              ariaLabel: el.getAttribute('aria-label'),
              dataAttributes: Array.from(el.attributes)
                .filter(attr => attr.name.startsWith('data-'))
                .reduce((acc, attr) => {
                  acc[attr.name] = attr.value;
                  return acc;
                }, {})
            });
          });
        } catch (error) {
          // Ignore selector errors
        }
      });

      return components;
    }, layerData);

    // Map components to layers
    return componentMap.map((component, idx) => ({
      ...component,
      componentId: `component-${idx}`,
      layerId: this.findMatchingLayer(component, layerData)
    }));
  }

  /**
   * Find the layer that matches a component
   */
  findMatchingLayer(component, layers) {
    // Find layer with matching bounds
    const match = layers.find(layer => {
      const boundsMatch = 
        Math.abs(layer.bounds.x - component.bounds.x) < 1 &&
        Math.abs(layer.bounds.y - component.bounds.y) < 1 &&
        Math.abs(layer.bounds.width - component.bounds.width) < 1 &&
        Math.abs(layer.bounds.height - component.bounds.height) < 1;
      
      return boundsMatch;
    });

    return match?.id || null;
  }

  /**
   * Generate 3D map from layer data
   */
  generate3DMap(layers, componentMap) {
    // Sort layers by paint order and z-index
    const sortedLayers = [...layers].sort((a, b) => {
      if (a.paintOrder !== b.paintOrder) {
        return a.paintOrder - b.paintOrder;
      }
      return (a.zIndex || 0) - (b.zIndex || 0);
    });

    // Generate 3D coordinates
    const map3D = sortedLayers.map((layer, depth) => ({
      layerId: layer.id,
      position: {
        x: layer.bounds.x + layer.bounds.width / 2, // Center X
        y: layer.bounds.y + layer.bounds.height / 2, // Center Y
        z: depth * 10 + (layer.zIndex || 0) // Depth based on paint order + z-index
      },
      dimensions: {
        width: layer.bounds.width,
        height: layer.bounds.height,
        depth: layer.isComposited ? 20 : 10 // Composited layers are thicker
      },
      color: this.getLayerColor(layer),
      metadata: {
        nodeName: layer.nodeName,
        isComposited: layer.isComposited,
        opacity: layer.opacity,
        hasTransform: layer.transform !== 'none'
      }
    }));

    return map3D;
  }

  /**
   * Determine if a layer is composited
   */
  isCompositingLayer(styles) {
    // Check for compositing triggers
    return (
      styles.transform !== 'none' ||
      styles['will-change'] !== 'auto' ||
      parseFloat(styles.opacity) < 1 ||
      styles.position === 'fixed'
    );
  }

  /**
   * Parse z-index value
   */
  parseZIndex(zIndex) {
    if (!zIndex || zIndex === 'auto') return 0;
    const parsed = parseInt(zIndex, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  /**
   * Get color for layer visualization
   */
  getLayerColor(layer) {
    if (layer.isComposited) return '#4CAF50'; // Green for composited
    if (layer.position === 'fixed') return '#2196F3'; // Blue for fixed
    if (layer.position === 'absolute') return '#FF9800'; // Orange for absolute
    if (layer.position === 'relative') return '#9C27B0'; // Purple for relative
    return '#757575'; // Gray for static
  }

  /**
   * Extract training data from layer analysis
   */
  async extractTrainingData(url, layerAnalysis, options = {}) {
    const trainingData = {
      url,
      timestamp: new Date().toISOString(),
      structure: {
        layerCount: layerAnalysis.layers.length,
        compositingLayerCount: layerAnalysis.metadata.compositingLayers,
        maxDepth: layerAnalysis.metadata.maxZIndex,
        componentCount: layerAnalysis.componentMap.length
      },
      patterns: this.extractPatterns(layerAnalysis),
      components: this.extractComponentPatterns(layerAnalysis.componentMap),
      relationships: this.extractRelationships(layerAnalysis.layers, layerAnalysis.componentMap),
      designRules: this.applyDesignRules(layerAnalysis, options.designRules)
    };

    return trainingData;
  }

  /**
   * Extract patterns from layer analysis
   */
  extractPatterns(layerAnalysis) {
    const patterns = {
      zIndexDistribution: this.analyzeZIndexDistribution(layerAnalysis.layers),
      compositingTriggers: this.analyzeCompositingTriggers(layerAnalysis.layers),
      layoutPatterns: this.analyzeLayoutPatterns(layerAnalysis.layers),
      componentHierarchy: this.analyzeComponentHierarchy(layerAnalysis.componentMap)
    };

    return patterns;
  }

  /**
   * Analyze z-index distribution
   */
  analyzeZIndexDistribution(layers) {
    const zIndexes = layers.map(l => l.zIndex || 0);
    return {
      min: Math.min(...zIndexes),
      max: Math.max(...zIndexes),
      mean: zIndexes.reduce((a, b) => a + b, 0) / zIndexes.length,
      distribution: this.createHistogram(zIndexes, 10)
    };
  }

  /**
   * Analyze compositing triggers
   */
  analyzeCompositingTriggers(layers) {
    const triggers = {
      transform: 0,
      willChange: 0,
      opacity: 0,
      fixed: 0
    };

    layers.forEach(layer => {
      if (layer.transform !== 'none') triggers.transform++;
      if (layer.willChange !== 'auto') triggers.willChange++;
      if (layer.opacity < 1) triggers.opacity++;
      if (layer.position === 'fixed') triggers.fixed++;
    });

    return triggers;
  }

  /**
   * Analyze layout patterns
   */
  analyzeLayoutPatterns(layers) {
    const positions = {
      static: 0,
      relative: 0,
      absolute: 0,
      fixed: 0,
      sticky: 0
    };

    layers.forEach(layer => {
      positions[layer.position] = (positions[layer.position] || 0) + 1;
    });

    return positions;
  }

  /**
   * Analyze component hierarchy
   */
  analyzeComponentHierarchy(componentMap) {
    // Group by tag name
    const byTag = componentMap.reduce((acc, comp) => {
      acc[comp.tagName] = (acc[comp.tagName] || 0) + 1;
      return acc;
    }, {});

    // Group by role
    const byRole = componentMap
      .filter(c => c.role)
      .reduce((acc, comp) => {
        acc[comp.role] = (acc[comp.role] || 0) + 1;
        return acc;
      }, {});

    return { byTag, byRole };
  }

  /**
   * Extract component patterns
   */
  extractComponentPatterns(componentMap) {
    return componentMap.map(component => ({
      type: component.tagName,
      role: component.role,
      position: component.position,
      zIndex: component.zIndex,
      size: {
        width: component.bounds.width,
        height: component.bounds.height
      },
      dataAttributes: component.dataAttributes
    }));
  }

  /**
   * Extract relationships between layers and components
   */
  extractRelationships(layers, componentMap) {
    const relationships = [];

    componentMap.forEach(component => {
      if (component.layerId) {
        const layer = layers.find(l => l.id === component.layerId);
        if (layer) {
          relationships.push({
            componentId: component.componentId,
            layerId: layer.id,
            type: 'maps-to',
            strength: 1.0
          });
        }
      }

      // Find overlapping components (potential parent-child)
      componentMap.forEach(other => {
        if (component.componentId !== other.componentId) {
          if (this.isContained(component.bounds, other.bounds)) {
            relationships.push({
              componentId: component.componentId,
              relatedComponentId: other.componentId,
              type: 'contained-in',
              strength: 0.8
            });
          }
        }
      });
    });

    return relationships;
  }

  /**
   * Check if bounds A is contained in bounds B
   */
  isContained(boundsA, boundsB) {
    return (
      boundsA.x >= boundsB.x &&
      boundsA.y >= boundsB.y &&
      boundsA.x + boundsA.width <= boundsB.x + boundsB.width &&
      boundsA.y + boundsA.height <= boundsB.y + boundsB.height
    );
  }

  /**
   * Apply design rules to filter and validate data
   */
  applyDesignRules(layerAnalysis, designRules = {}) {
    const rules = {
      maxZIndex: designRules.maxZIndex || 10000,
      minComponentSize: designRules.minComponentSize || { width: 10, height: 10 },
      compositingBestPractices: designRules.compositingBestPractices !== false,
      ...designRules
    };

    const violations = [];
    const recommendations = [];

    // Check z-index violations
    layerAnalysis.layers.forEach(layer => {
      if (layer.zIndex > rules.maxZIndex) {
        violations.push({
          type: 'z-index-too-high',
          layerId: layer.id,
          value: layer.zIndex,
          threshold: rules.maxZIndex
        });
      }
    });

    // Check compositing best practices
    if (rules.compositingBestPractices) {
      const compositedCount = layerAnalysis.metadata.compositingLayers;
      if (compositedCount > 50) {
        recommendations.push({
          type: 'too-many-compositing-layers',
          count: compositedCount,
          suggestion: 'Consider reducing the number of composited layers for better performance'
        });
      }
    }

    return { rules, violations, recommendations };
  }

  /**
   * Create histogram from values
   */
  createHistogram(values, bins = 10) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / bins;
    
    const histogram = Array(bins).fill(0);
    values.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
      histogram[binIndex]++;
    });

    return histogram;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    if (this.redisClient) {
      await this.redisClient.quit();
      this.redisClient = null;
    }
  }
}

export default ChromeLayersService;
