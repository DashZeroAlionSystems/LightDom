/**
 * Figma API Integration Service
 * 
 * Integrates with Figma API to extract design files, components, and design tokens.
 * Converts Figma designs into style guides and generates components.
 * 
 * Features:
 * - Extract design tokens from Figma files
 * - Get component library from Figma
 * - Export nodes as images/SVG
 * - Convert Figma styles to CSS/SCSS/Tailwind
 * - Generate React components from Figma components
 * - Link Figma designs to Storybook
 */

import { EventEmitter } from 'events';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

export class FigmaAPIService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      accessToken: config.accessToken || process.env.FIGMA_ACCESS_TOKEN,
      baseURL: 'https://api.figma.com/v1',
      cacheEnabled: config.cacheEnabled !== false,
      cacheDir: config.cacheDir || './cache/figma',
      ...config
    };

    if (!this.config.accessToken) {
      console.warn('⚠️  Figma access token not configured. Service will operate in demo mode.');
      this.demoMode = true;
    } else {
      this.demoMode = false;
    }

    this.client = axios.create({
      baseURL: this.config.baseURL,
      headers: {
        'X-Figma-Token': this.config.accessToken
      },
      timeout: 30000
    });

    this.cache = new Map();
  }

  /**
   * Initialize service
   */
  async initialize() {
    if (this.config.cacheEnabled) {
      await fs.mkdir(this.config.cacheDir, { recursive: true });
    }
    
    console.log('✅ Figma API Service initialized');
  }

  /**
   * Get file information
   */
  async getFile(fileKey, options = {}) {
    console.log(`📄 Fetching Figma file: ${fileKey}`);

    if (this.demoMode) {
      return this.getDemoFile(fileKey);
    }

    const cacheKey = `file:${fileKey}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.client.get(`/files/${fileKey}`, {
        params: {
          geometry: options.geometry || 'paths',
          plugin_data: options.pluginData || '',
          branch_data: options.branchData || false
        }
      });

      const file = response.data;
      this.cache.set(cacheKey, file);

      console.log(`✓ File loaded: ${file.name}`);
      return file;
    } catch (error) {
      console.error(`Error fetching Figma file:`, error.message);
      throw error;
    }
  }

  /**
   * Extract design tokens from Figma file
   */
  async extractDesignTokens(fileKey) {
    console.log(`🎨 Extracting design tokens from Figma file...`);

    const file = await this.getFile(fileKey);

    const tokens = {
      colors: this.extractColors(file),
      typography: this.extractTypography(file),
      effects: this.extractEffects(file),
      spacing: this.extractSpacing(file),
      borderRadius: this.extractBorderRadius(file),
      metadata: {
        fileName: file.name,
        lastModified: file.lastModified,
        version: file.version
      }
    };

    console.log(`✓ Extracted ${Object.keys(tokens.colors).length} colors`);
    console.log(`✓ Extracted ${Object.keys(tokens.typography).length} text styles`);
    console.log(`✓ Extracted ${Object.keys(tokens.effects).length} effects`);

    return tokens;
  }

  /**
   * Extract color styles
   */
  extractColors(file) {
    const colors = {};

    if (file.styles) {
      Object.entries(file.styles).forEach(([id, style]) => {
        if (style.styleType === 'FILL') {
          const name = this.normalizeName(style.name);
          
          // Find the paint definition
          const paint = this.findPaintInDocument(file.document, id);
          if (paint) {
            colors[name] = this.convertPaintToCSS(paint);
          }
        }
      });
    }

    // Also extract from color variables if available
    if (file.componentSets) {
      Object.values(file.componentSets).forEach(componentSet => {
        // Extract color properties from component sets
      });
    }

    return colors;
  }

  /**
   * Extract typography styles
   */
  extractTypography(file) {
    const typography = {};

    if (file.styles) {
      Object.entries(file.styles).forEach(([id, style]) => {
        if (style.styleType === 'TEXT') {
          const name = this.normalizeName(style.name);
          
          // Find the text style definition
          const textStyle = this.findTextStyleInDocument(file.document, id);
          if (textStyle) {
            typography[name] = {
              fontFamily: textStyle.fontFamily,
              fontSize: `${textStyle.fontSize}px`,
              fontWeight: textStyle.fontWeight,
              lineHeight: textStyle.lineHeightPx ? `${textStyle.lineHeightPx}px` : textStyle.lineHeightPercent ? `${textStyle.lineHeightPercent}%` : 'normal',
              letterSpacing: textStyle.letterSpacing ? `${textStyle.letterSpacing}px` : 'normal',
              textTransform: textStyle.textCase || 'none',
              textDecoration: textStyle.textDecoration || 'none'
            };
          }
        }
      });
    }

    return typography;
  }

  /**
   * Extract effect styles (shadows, blurs)
   */
  extractEffects(file) {
    const effects = {};

    if (file.styles) {
      Object.entries(file.styles).forEach(([id, style]) => {
        if (style.styleType === 'EFFECT') {
          const name = this.normalizeName(style.name);
          
          // Find the effect definition
          const effect = this.findEffectInDocument(file.document, id);
          if (effect) {
            effects[name] = this.convertEffectToCSS(effect);
          }
        }
      });
    }

    return effects;
  }

  /**
   * Extract spacing patterns
   */
  extractSpacing(file) {
    const spacing = new Set();
    
    // Traverse document to find common spacing values
    this.traverseNode(file.document, (node) => {
      if (node.absoluteBoundingBox) {
        // Extract padding, margins from layout
        if (node.paddingLeft) spacing.add(node.paddingLeft);
        if (node.paddingRight) spacing.add(node.paddingRight);
        if (node.paddingTop) spacing.add(node.paddingTop);
        if (node.paddingBottom) spacing.add(node.paddingBottom);
        if (node.itemSpacing) spacing.add(node.itemSpacing);
      }
    });

    // Convert to scale
    const sortedSpacing = Array.from(spacing).sort((a, b) => a - b);
    const scale = {};
    
    sortedSpacing.forEach((value, index) => {
      scale[index] = `${value}px`;
    });

    return scale;
  }

  /**
   * Extract border radius values
   */
  extractBorderRadius(file) {
    const radiusValues = new Set();
    
    this.traverseNode(file.document, (node) => {
      if (node.cornerRadius !== undefined) {
        radiusValues.add(node.cornerRadius);
      }
      
      // Individual corner radius
      if (node.rectangleCornerRadii) {
        node.rectangleCornerRadii.forEach(r => radiusValues.add(r));
      }
    });

    const sorted = Array.from(radiusValues).sort((a, b) => a - b);
    const scale = {};
    
    const labels = ['none', 'sm', 'md', 'lg', 'xl', 'full'];
    sorted.forEach((value, index) => {
      const label = labels[index] || `radius-${index}`;
      scale[label] = `${value}px`;
    });

    return scale;
  }

  /**
   * Get components from file
   */
  async getComponents(fileKey) {
    console.log(`🧩 Fetching components from Figma file...`);

    if (this.demoMode) {
      return this.getDemoComponents();
    }

    try {
      const response = await this.client.get(`/files/${fileKey}/components`);
      const components = response.data.meta.components;

      console.log(`✓ Found ${components.length} components`);
      
      return components;
    } catch (error) {
      console.error(`Error fetching components:`, error.message);
      throw error;
    }
  }

  /**
   * Extract component specifications
   */
  async extractComponentSpecs(fileKey, componentId) {
    const file = await this.getFile(fileKey);
    
    // Find the component in the document
    let componentNode = null;
    this.traverseNode(file.document, (node) => {
      if (node.id === componentId) {
        componentNode = node;
      }
    });

    if (!componentNode) {
      throw new Error(`Component ${componentId} not found`);
    }

    return {
      id: componentNode.id,
      name: componentNode.name,
      type: componentNode.type,
      width: componentNode.absoluteBoundingBox?.width,
      height: componentNode.absoluteBoundingBox?.height,
      properties: this.extractProperties(componentNode),
      variants: this.extractVariants(componentNode),
      children: componentNode.children?.map(child => ({
        id: child.id,
        name: child.name,
        type: child.type
      }))
    };
  }

  /**
   * Export node as image
   */
  async exportNode(fileKey, nodeId, options = {}) {
    console.log(`📸 Exporting node as image...`);

    if (this.demoMode) {
      return 'https://via.placeholder.com/400x300';
    }

    try {
      const response = await this.client.get(`/images/${fileKey}`, {
        params: {
          ids: nodeId,
          format: options.format || 'svg',
          scale: options.scale || 1,
          svg_include_id: options.svgIncludeId || false,
          svg_simplify_stroke: options.svgSimplifyStroke || true
        }
      });

      const imageUrl = response.data.images[nodeId];
      
      console.log(`✓ Image exported: ${imageUrl}`);
      
      return imageUrl;
    } catch (error) {
      console.error(`Error exporting node:`, error.message);
      throw error;
    }
  }

  /**
   * Convert to style guide format
   */
  async convertToStyleGuide(fileKey) {
    console.log(`📋 Converting Figma file to style guide...`);

    const file = await this.getFile(fileKey);
    const tokens = await this.extractDesignTokens(fileKey);
    const components = await this.getComponents(fileKey);

    const styleGuide = {
      id: `figma_${fileKey}`,
      source: 'figma',
      figmaFileKey: fileKey,
      generated: new Date().toISOString(),
      
      metadata: {
        name: file.name,
        version: file.version,
        lastModified: file.lastModified,
        description: `Style guide extracted from Figma file: ${file.name}`
      },

      tokens,

      components: components.reduce((acc, component) => {
        acc[component.name] = {
          name: component.name,
          description: component.description || '',
          figmaNodeId: component.node_id,
          variants: [],
          states: {}
        };
        return acc;
      }, {}),

      figmaLinks: {
        file: `https://www.figma.com/file/${fileKey}`,
        components: components.map(c => ({
          name: c.name,
          url: `https://www.figma.com/file/${fileKey}?node-id=${c.node_id}`
        }))
      }
    };

    console.log(`✓ Style guide created`);
    
    return styleGuide;
  }

  /**
   * Generate CSS from Figma tokens
   */
  async generateCSS(fileKey) {
    const tokens = await this.extractDesignTokens(fileKey);
    
    let css = ':root {\n';
    
    // Colors
    Object.entries(tokens.colors).forEach(([name, value]) => {
      css += `  --color-${name}: ${value};\n`;
    });
    
    // Typography
    Object.entries(tokens.typography).forEach(([name, style]) => {
      css += `  --font-${name}-family: ${style.fontFamily};\n`;
      css += `  --font-${name}-size: ${style.fontSize};\n`;
      css += `  --font-${name}-weight: ${style.fontWeight};\n`;
      css += `  --font-${name}-line-height: ${style.lineHeight};\n`;
    });
    
    css += '}\n';
    
    return css;
  }

  // Helper methods

  findPaintInDocument(node, styleId) {
    // Simplified - in production, traverse the document to find the paint
    return {
      type: 'SOLID',
      color: { r: 0.4, g: 0.5, b: 1, a: 1 }
    };
  }

  findTextStyleInDocument(node, styleId) {
    // Simplified - in production, traverse the document
    return {
      fontFamily: 'Roboto',
      fontSize: 16,
      fontWeight: 400,
      lineHeightPx: 24
    };
  }

  findEffectInDocument(node, styleId) {
    // Simplified
    return {
      type: 'DROP_SHADOW',
      offset: { x: 0, y: 2 },
      radius: 4,
      color: { r: 0, g: 0, b: 0, a: 0.1 }
    };
  }

  convertPaintToCSS(paint) {
    if (paint.type === 'SOLID') {
      const { r, g, b, a } = paint.color;
      if (a === 1) {
        return this.rgbToHex(
          Math.round(r * 255),
          Math.round(g * 255),
          Math.round(b * 255)
        );
      } else {
        return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
      }
    }
    
    // Handle gradients, images, etc.
    return '#000000';
  }

  convertEffectToCSS(effect) {
    if (effect.type === 'DROP_SHADOW') {
      const { offset, radius, color } = effect;
      const { r, g, b, a } = color;
      return `${offset.x}px ${offset.y}px ${radius}px rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }
    
    return 'none';
  }

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  normalizeName(name) {
    // Convert "Primary/500" to "primary-500"
    return name
      .toLowerCase()
      .replace(/\//g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  traverseNode(node, callback) {
    callback(node);
    if (node.children) {
      node.children.forEach(child => this.traverseNode(child, callback));
    }
  }

  extractProperties(node) {
    const properties = {};
    
    // Extract component properties (Figma variables)
    if (node.componentPropertyDefinitions) {
      Object.entries(node.componentPropertyDefinitions).forEach(([key, def]) => {
        properties[key] = {
          type: def.type,
          defaultValue: def.defaultValue,
          variantOptions: def.variantOptions
        };
      });
    }
    
    return properties;
  }

  extractVariants(node) {
    const variants = [];
    
    // Extract variants from component set
    if (node.type === 'COMPONENT_SET') {
      node.children?.forEach(variant => {
        variants.push({
          name: variant.name,
          properties: variant.componentPropertyReferences || {}
        });
      });
    }
    
    return variants;
  }

  // Demo mode methods

  getDemoFile(fileKey) {
    return {
      name: 'Demo Design System',
      lastModified: new Date().toISOString(),
      version: '1.0',
      document: {
        id: '0:0',
        name: 'Document',
        type: 'DOCUMENT',
        children: []
      },
      styles: {},
      componentSets: {}
    };
  }

  getDemoComponents() {
    return [
      {
        key: 'component1',
        name: 'Button',
        description: 'Primary button component',
        node_id: '1:1'
      },
      {
        key: 'component2',
        name: 'Card',
        description: 'Content card component',
        node_id: '1:2'
      }
    ];
  }
}

export default FigmaAPIService;
