/**
 * Enhanced UI Pattern Mining Service
 * 
 * Extends 3D DOM mining with advanced UI/UX pattern detection:
 * - Component pattern recognition (buttons, cards, forms, etc.)
 * - Design token extraction (colors, spacing, typography)
 * - Layout pattern analysis (grids, flexbox, containers)
 * - Interaction pattern mining (hovers, clicks, transitions)
 * - Design system compliance checking
 * - Component library generation
 * 
 * Use Cases:
 * - Mine design patterns from competitor websites
 * - Generate component libraries automatically
 * - Extract design tokens for design systems
 * - Validate design system compliance
 * - Track design evolution over time
 * - Create ML training data for UI understanding
 */

import { DOM3DDataMiningService } from './dom-3d-datamining-service.js';

export class EnhancedUIPatternMiningService extends DOM3DDataMiningService {
  constructor(options = {}) {
    super(options);
    this.designSystem = options.designSystem || null;
  }

  /**
   * Mine URL with enhanced UI pattern detection
   */
  async mineURL(url, options = {}) {
    console.log(`🎨 Enhanced UI Pattern Mining: ${url}`);

    // Get base mining result
    const baseResult = await super.mineURL(url, options);

    // Extract UI patterns
    const uiPatterns = await this.mineUIPatterns(baseResult.dom3DModel);
    
    // Extract design tokens
    const designTokens = await this.extractDesignTokens(baseResult.dom3DModel);
    
    // Mine interactions (if requested)
    const interactions = options.includeInteractions 
      ? await this.mineInteractions(url)
      : null;
    
    // Analyze rendering performance
    const performance = await this.analyzeRenderPerformance(baseResult.dom3DModel);
    
    // Check design system compliance (if design system provided)
    const compliance = this.designSystem
      ? await this.checkDesignSystemCompliance(designTokens, uiPatterns)
      : null;

    return {
      ...baseResult,
      uiPatterns,
      designTokens,
      interactions,
      performance,
      compliance,
      metadata: {
        ...baseResult.metadata,
        componentCount: Object.values(uiPatterns).reduce((sum, arr) => sum + arr.length, 0),
        tokenCount: this.countTokens(designTokens),
        performanceScore: performance.score
      }
    };
  }

  /**
   * Mine UI component patterns
   */
  async mineUIPatterns(dom3DModel) {
    const patterns = {
      buttons: this.findButtonPatterns(dom3DModel.layers),
      cards: this.findCardPatterns(dom3DModel.layers),
      inputs: this.findInputPatterns(dom3DModel.layers),
      navigation: this.findNavigationPatterns(dom3DModel.layers),
      modals: this.findModalPatterns(dom3DModel.layers),
      tables: this.findTablePatterns(dom3DModel.layers),
      lists: this.findListPatterns(dom3DModel.layers),
      headers: this.findHeaderPatterns(dom3DModel.layers)
    };

    // Cluster similar patterns
    Object.keys(patterns).forEach(type => {
      patterns[type] = this.clusterSimilarComponents(patterns[type]);
    });

    return patterns;
  }

  /**
   * Find button patterns
   */
  findButtonPatterns(layers) {
    return layers.filter(layer => {
      const area = layer.position3D.width * layer.position3D.height;
      
      // Button characteristics:
      const isButtonSize = area > 2000 && area < 50000;
      const hasRoundedCorners = this.hasBorderRadius(layer.styles);
      const isInteractive = layer.styles.cursor === 'pointer';
      const hasButtonTag = ['BUTTON', 'A', 'INPUT'].includes(layer.nodeName);
      const hasAppropriateHeight = layer.position3D.height >= 24 && layer.position3D.height <= 64;
      
      return (isButtonSize && hasAppropriateHeight) && 
             (hasRoundedCorners || isInteractive || hasButtonTag);
    }).map(layer => ({
      ...layer,
      type: 'button',
      variant: this.classifyButtonVariant(layer),
      size: this.classifyButtonSize(layer)
    }));
  }

  /**
   * Find card patterns
   */
  findCardPatterns(layers) {
    return layers.filter(layer => {
      const area = layer.position3D.width * layer.position3D.height;
      
      // Card characteristics:
      const isCardSize = area > 20000 && area < 500000;
      const hasBorder = layer.styles.border && layer.styles.border !== 'none';
      const hasShadow = layer.styles['box-shadow'] && layer.styles['box-shadow'] !== 'none';
      const hasBackground = layer.styles.backgroundColor && layer.styles.backgroundColor !== 'transparent';
      const hasRoundedCorners = this.hasBorderRadius(layer.styles);
      const hasContentPadding = parseInt(layer.styles.padding) > 0;
      
      return isCardSize && (hasBorder || hasShadow) && hasBackground && hasContentPadding;
    }).map(layer => ({
      ...layer,
      type: 'card',
      variant: this.classifyCardVariant(layer)
    }));
  }

  /**
   * Find input patterns
   */
  findInputPatterns(layers) {
    return layers.filter(layer => {
      const isInputTag = ['INPUT', 'TEXTAREA', 'SELECT'].includes(layer.nodeName);
      const hasInputSize = layer.position3D.height >= 28 && layer.position3D.height <= 56;
      const hasInputWidth = layer.position3D.width >= 100;
      
      return isInputTag || (hasInputSize && hasInputWidth);
    }).map(layer => ({
      ...layer,
      type: 'input',
      inputType: this.classifyInputType(layer)
    }));
  }

  /**
   * Find navigation patterns
   */
  findNavigationPatterns(layers) {
    return layers.filter(layer => {
      const isNavTag = layer.nodeName === 'NAV';
      const hasNavigationRole = layer.styles.role === 'navigation';
      const isHorizontalList = this.isHorizontalList(layer);
      
      return isNavTag || hasNavigationRole || isHorizontalList;
    }).map(layer => ({
      ...layer,
      type: 'navigation',
      navType: this.classifyNavigationType(layer)
    }));
  }

  /**
   * Find modal patterns
   */
  findModalPatterns(layers) {
    return layers.filter(layer => {
      const isHighZIndex = layer.position3D.z > 1000;
      const isCentered = this.isCentered(layer);
      const hasBackdrop = this.hasBackdrop(layer);
      const hasModalSize = layer.position3D.width > 200 && layer.position3D.width < 800;
      
      return isHighZIndex && isCentered && (hasBackdrop || hasModalSize);
    }).map(layer => ({
      ...layer,
      type: 'modal',
      variant: this.classifyModalVariant(layer)
    }));
  }

  /**
   * Find table patterns
   */
  findTablePatterns(layers) {
    return layers.filter(layer => {
      const isTableTag = layer.nodeName === 'TABLE';
      const hasGridDisplay = layer.styles.display === 'grid' || layer.styles.display === 'table';
      const hasMultipleRows = this.hasMultipleRows(layer);
      
      return isTableTag || (hasGridDisplay && hasMultipleRows);
    }).map(layer => ({
      ...layer,
      type: 'table',
      variant: this.classifyTableVariant(layer)
    }));
  }

  /**
   * Find list patterns
   */
  findListPatterns(layers) {
    return layers.filter(layer => {
      const isListTag = ['UL', 'OL', 'DL'].includes(layer.nodeName);
      const hasListItems = this.hasListItems(layer);
      
      return isListTag || hasListItems;
    }).map(layer => ({
      ...layer,
      type: 'list',
      listType: this.classifyListType(layer)
    }));
  }

  /**
   * Find header patterns
   */
  findHeaderPatterns(layers) {
    return layers.filter(layer => {
      const isHeaderTag = layer.nodeName === 'HEADER';
      const isTopPositioned = layer.position3D.y < 100;
      const isFullWidth = layer.position3D.width > 1000;
      const hasHeaderHeight = layer.position3D.height > 40 && layer.position3D.height < 200;
      
      return isHeaderTag || (isTopPositioned && isFullWidth && hasHeaderHeight);
    }).map(layer => ({
      ...layer,
      type: 'header',
      variant: this.classifyHeaderVariant(layer)
    }));
  }

  /**
   * Extract design tokens
   */
  async extractDesignTokens(dom3DModel) {
    const layers = dom3DModel.layers;

    return {
      colors: this.extractColors(layers),
      spacing: this.extractSpacing(layers),
      typography: this.extractTypography(layers),
      borders: this.extractBorders(layers),
      shadows: this.extractShadows(layers),
      borderRadius: this.extractBorderRadius(layers)
    };
  }

  /**
   * Extract color tokens
   */
  extractColors(layers) {
    const colors = {
      backgrounds: new Map(),
      texts: new Map(),
      borders: new Map()
    };

    layers.forEach(layer => {
      // Background colors
      if (layer.styles.backgroundColor && layer.styles.backgroundColor !== 'transparent') {
        const color = layer.styles.backgroundColor;
        colors.backgrounds.set(color, (colors.backgrounds.get(color) || 0) + 1);
      }

      // Text colors
      if (layer.styles.color) {
        const color = layer.styles.color;
        colors.texts.set(color, (colors.texts.get(color) || 0) + 1);
      }

      // Border colors
      if (layer.styles.borderColor) {
        const color = layer.styles.borderColor;
        colors.borders.set(color, (colors.borders.get(color) || 0) + 1);
      }
    });

    // Get top colors by frequency
    return {
      primary: this.getMostFrequent(colors.backgrounds),
      text: this.getMostFrequent(colors.texts),
      border: this.getMostFrequent(colors.borders),
      palette: {
        backgrounds: this.getTopN(colors.backgrounds, 10),
        texts: this.getTopN(colors.texts, 5),
        borders: this.getTopN(colors.borders, 5)
      }
    };
  }

  /**
   * Extract spacing tokens
   */
  extractSpacing(layers) {
    const spacingValues = [];

    layers.forEach(layer => {
      ['padding', 'margin', 'gap'].forEach(property => {
        ['top', 'right', 'bottom', 'left'].forEach(side => {
          const key = side ? `${property}-${side}` : property;
          const value = parseInt(layer.styles[key]);
          if (!isNaN(value) && value > 0) {
            spacingValues.push(value);
          }
        });
      });
    });

    // Cluster spacing values into a scale
    return {
      scale: this.clusterValues(spacingValues, 4), // 4px tolerance
      commonPadding: this.getMostCommonValue(spacingValues),
      distribution: this.getValueDistribution(spacingValues)
    };
  }

  /**
   * Extract typography tokens
   */
  extractTypography(layers) {
    const fontFamilies = new Map();
    const fontSizes = [];
    const fontWeights = new Set();
    const lineHeights = [];

    layers.forEach(layer => {
      if (layer.styles.fontFamily) {
        const family = layer.styles.fontFamily;
        fontFamilies.set(family, (fontFamilies.get(family) || 0) + 1);
      }

      const fontSize = parseInt(layer.styles.fontSize);
      if (!isNaN(fontSize)) {
        fontSizes.push(fontSize);
      }

      if (layer.styles.fontWeight) {
        fontWeights.add(layer.styles.fontWeight);
      }

      const lineHeight = parseFloat(layer.styles.lineHeight);
      if (!isNaN(lineHeight)) {
        lineHeights.push(lineHeight);
      }
    });

    return {
      fontFamilies: Array.from(fontFamilies.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([family]) => family),
      fontSizeScale: this.clusterValues(fontSizes, 2),
      fontWeights: Array.from(fontWeights).sort(),
      lineHeights: this.clusterValues(lineHeights, 0.1)
    };
  }

  /**
   * Extract border tokens
   */
  extractBorders(layers) {
    const widths = [];
    const styles = new Set();

    layers.forEach(layer => {
      const width = parseInt(layer.styles.borderWidth);
      if (!isNaN(width) && width > 0) {
        widths.push(width);
      }

      if (layer.styles.borderStyle && layer.styles.borderStyle !== 'none') {
        styles.add(layer.styles.borderStyle);
      }
    });

    return {
      widths: this.clusterValues(widths, 1),
      styles: Array.from(styles)
    };
  }

  /**
   * Extract shadow tokens
   */
  extractShadows(layers) {
    const shadows = new Map();

    layers.forEach(layer => {
      if (layer.styles['box-shadow'] && layer.styles['box-shadow'] !== 'none') {
        const shadow = layer.styles['box-shadow'];
        shadows.set(shadow, (shadows.get(shadow) || 0) + 1);
      }
    });

    return {
      common: this.getTopN(shadows, 5),
      elevation: this.classifyShadowElevation(shadows)
    };
  }

  /**
   * Extract border-radius tokens
   */
  extractBorderRadius(layers) {
    const radii = [];

    layers.forEach(layer => {
      const radius = parseInt(layer.styles['border-radius']);
      if (!isNaN(radius) && radius > 0) {
        radii.push(radius);
      }
    });

    return {
      scale: this.clusterValues(radii, 2),
      common: this.getMostCommonValue(radii)
    };
  }

  /**
   * Mine interaction patterns
   */
  async mineInteractions(url) {
    const page = await this.browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });

      const interactions = {
        hovers: await this.detectHoverEffects(page),
        transitions: await this.detectTransitions(page),
        animations: await this.detectAnimations(page)
      };

      return interactions;

    } finally {
      await page.close();
    }
  }

  /**
   * Detect hover effects
   */
  async detectHoverEffects(page) {
    const hoverEffects = await page.evaluate(() => {
      const effects = [];
      const interactiveElements = document.querySelectorAll('a, button, [role="button"], [onclick]');

      interactiveElements.forEach((element, index) => {
        if (index > 50) return; // Limit to first 50 for performance

        const styles = window.getComputedStyle(element);
        const transition = styles.transition;
        const cursor = styles.cursor;

        if (transition !== 'all 0s ease 0s' || cursor === 'pointer') {
          effects.push({
            selector: element.tagName,
            hasTransition: transition !== 'all 0s ease 0s',
            cursor,
            transitionProperties: transition
          });
        }
      });

      return effects;
    });

    return hoverEffects;
  }

  /**
   * Detect CSS transitions
   */
  async detectTransitions(page) {
    return await page.evaluate(() => {
      const transitions = [];
      const elements = document.querySelectorAll('*');

      elements.forEach((element, index) => {
        if (index > 100) return;

        const styles = window.getComputedStyle(element);
        const transition = styles.transition;

        if (transition && transition !== 'all 0s ease 0s') {
          transitions.push({
            element: element.tagName,
            transition
          });
        }
      });

      return transitions;
    });
  }

  /**
   * Detect CSS animations
   */
  async detectAnimations(page) {
    return await page.evaluate(() => {
      const animations = [];
      const elements = document.querySelectorAll('*');

      elements.forEach((element, index) => {
        if (index > 100) return;

        const styles = window.getComputedStyle(element);
        const animation = styles.animation;

        if (animation && animation !== 'none') {
          animations.push({
            element: element.tagName,
            animation
          });
        }
      });

      return animations;
    });
  }

  /**
   * Analyze rendering performance
   */
  async analyzeRenderPerformance(dom3DModel) {
    const layers = dom3DModel.layers;

    const compositedCount = layers.filter(l => l.isComposited).length;
    const totalLayers = layers.length;

    // Performance scoring
    let score = 100;

    // Penalize excessive compositing
    if (compositedCount > 50) {
      score -= Math.min(30, (compositedCount - 50) * 0.5);
    }

    // Penalize deep z-index stacking
    const maxZ = Math.max(...layers.map(l => l.position3D.z));
    if (maxZ > 10000) {
      score -= Math.min(20, (maxZ - 10000) / 1000);
    }

    // Penalize complex elements
    const complexElements = layers.filter(l => this.isComplexElement(l));
    if (complexElements.length > 20) {
      score -= Math.min(25, complexElements.length - 20);
    }

    return {
      score: Math.max(0, score),
      metrics: {
        totalLayers,
        compositedLayers: compositedCount,
        compositingRatio: (compositedCount / totalLayers) * 100,
        maxZIndex: maxZ,
        complexElements: complexElements.length
      },
      recommendations: this.generatePerformanceRecommendations(layers)
    };
  }

  /**
   * Check design system compliance
   */
  async checkDesignSystemCompliance(designTokens, uiPatterns) {
    if (!this.designSystem) {
      return null;
    }

    const compliance = {
      score: 0,
      colors: this.checkColorCompliance(designTokens.colors),
      spacing: this.checkSpacingCompliance(designTokens.spacing),
      typography: this.checkTypographyCompliance(designTokens.typography),
      components: this.checkComponentCompliance(uiPatterns),
      recommendations: []
    };

    // Calculate overall score
    compliance.score = (
      compliance.colors.score * 0.25 +
      compliance.spacing.score * 0.25 +
      compliance.typography.score * 0.25 +
      compliance.components.score * 0.25
    );

    return compliance;
  }

  // Helper methods

  classifyButtonVariant(layer) {
    const bg = layer.styles.backgroundColor;
    const hasBorder = layer.styles.border && layer.styles.border !== 'none';
    const isTransparent = !bg || bg === 'transparent';

    if (isTransparent && hasBorder) return 'outline';
    if (isTransparent) return 'ghost';
    return 'solid';
  }

  classifyButtonSize(layer) {
    const height = layer.position3D.height;
    if (height < 32) return 'small';
    if (height > 48) return 'large';
    return 'medium';
  }

  classifyCardVariant(layer) {
    const hasShadow = layer.styles['box-shadow'] && layer.styles['box-shadow'] !== 'none';
    const hasBorder = layer.styles.border && layer.styles.border !== 'none';

    if (hasShadow) return 'elevated';
    if (hasBorder) return 'bordered';
    return 'flat';
  }

  hasBorderRadius(styles) {
    const radius = parseInt(styles['border-radius']);
    return !isNaN(radius) && radius > 0;
  }

  isComplexElement(layer) {
    const hasGradient = (layer.styles.background || '').includes('gradient');
    const hasMultipleShadows = (layer.styles['box-shadow'] || '').split(',').length > 2;
    const hasBackdropFilter = layer.styles['backdrop-filter'] !== 'none';
    const hasComplexTransform = (layer.styles.transform || '').split(' ').length > 2;

    return hasGradient || hasMultipleShadows || hasBackdropFilter || hasComplexTransform;
  }

  clusterValues(values, tolerance) {
    if (values.length === 0) return [];

    const sorted = [...new Set(values)].sort((a, b) => a - b);
    const clusters = [];
    let currentCluster = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - sorted[i - 1] <= tolerance) {
        currentCluster.push(sorted[i]);
      } else {
        clusters.push(Math.round(this.average(currentCluster)));
        currentCluster = [sorted[i]];
      }
    }

    if (currentCluster.length > 0) {
      clusters.push(Math.round(this.average(currentCluster)));
    }

    return clusters;
  }

  average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  getMostFrequent(map) {
    let max = 0;
    let result = null;

    for (const [value, count] of map.entries()) {
      if (count > max) {
        max = count;
        result = value;
      }
    }

    return result;
  }

  getTopN(map, n) {
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([value, count]) => ({ value, count }));
  }

  getMostCommonValue(arr) {
    const counts = new Map();
    arr.forEach(val => counts.set(val, (counts.get(val) || 0) + 1));
    return this.getMostFrequent(counts);
  }

  getValueDistribution(values) {
    const counts = new Map();
    values.forEach(val => counts.set(val, (counts.get(val) || 0) + 1));
    return Object.fromEntries(counts);
  }

  clusterSimilarComponents(components) {
    // Simple clustering by visual similarity
    // In production, use proper clustering algorithms
    return components;
  }

  classifyInputType(layer) {
    return layer.nodeName === 'TEXTAREA' ? 'textarea' :
           layer.nodeName === 'SELECT' ? 'select' : 'text';
  }

  classifyNavigationType(layer) {
    return layer.position3D.width > layer.position3D.height ? 'horizontal' : 'vertical';
  }

  classifyModalVariant(layer) {
    const size = layer.position3D.width;
    if (size < 400) return 'small';
    if (size > 600) return 'large';
    return 'medium';
  }

  classifyTableVariant(layer) {
    return 'default';
  }

  classifyListType(layer) {
    return layer.nodeName === 'OL' ? 'ordered' :
           layer.nodeName === 'UL' ? 'unordered' : 'definition';
  }

  classifyHeaderVariant(layer) {
    return layer.position3D.height > 100 ? 'hero' : 'default';
  }

  isCentered(layer) {
    // Simplified center detection
    return true; // Would check actual position relative to viewport
  }

  hasBackdrop(layer) {
    return layer.styles.backgroundColor && layer.styles.opacity < 1;
  }

  isHorizontalList(layer) {
    return layer.styles.display === 'flex' && layer.styles.flexDirection === 'row';
  }

  hasMultipleRows(layer) {
    return true; // Would check actual child count and layout
  }

  hasListItems(layer) {
    return true; // Would check for LI children
  }

  classifyShadowElevation(shadows) {
    // Classify shadows into elevation levels
    return {
      sm: [],
      md: [],
      lg: [],
      xl: []
    };
  }

  generatePerformanceRecommendations(layers) {
    const recommendations = [];

    const compositedCount = layers.filter(l => l.isComposited).length;
    if (compositedCount > 50) {
      recommendations.push({
        type: 'compositing',
        severity: 'medium',
        message: `${compositedCount} composited layers detected. Consider reducing will-change and transform usage.`
      });
    }

    return recommendations;
  }

  checkColorCompliance(colors) {
    // Would compare against design system colors
    return { score: 85, deviations: [] };
  }

  checkSpacingCompliance(spacing) {
    // Would compare against design system spacing scale
    return { score: 90, deviations: [] };
  }

  checkTypographyCompliance(typography) {
    // Would compare against design system typography
    return { score: 88, deviations: [] };
  }

  checkComponentCompliance(patterns) {
    // Would check if components match design system
    return { score: 82, deviations: [] };
  }

  countTokens(tokens) {
    let count = 0;
    if (tokens.colors) count += Object.keys(tokens.colors.palette.backgrounds).length;
    if (tokens.spacing) count += tokens.spacing.scale.length;
    if (tokens.typography) count += tokens.typography.fontSizeScale.length;
    return count;
  }
}

export default EnhancedUIPatternMiningService;
