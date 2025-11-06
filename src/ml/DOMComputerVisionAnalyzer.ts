/**
 * Computer Vision Module for DOM Layout Analysis
 * Uses TensorFlow.js for visual analysis of web page layouts
 */

import * as tf from '@tensorflow/tfjs';
import { ComputerVisionAnalysis } from '@/types/ml';

export class DOMComputerVisionAnalyzer {
  private layoutAnalysisModel: tf.LayersModel | null = null;
  private visualQualityModel: tf.LayersModel | null = null;
  private accessibilityVisionModel: tf.LayersModel | null = null;

  constructor() {
    this.initializeModels();
  }

  private async initializeModels() {
    try {
      await this.loadOrCreateLayoutAnalysisModel();
      await this.loadOrCreateVisualQualityModel();
      await this.loadOrCreateAccessibilityVisionModel();
    } catch (error) {
      console.error('Failed to initialize computer vision models:', error);
    }
  }

  /**
   * Layout Analysis Model - Analyzes DOM structure visually
   */
  private async loadOrCreateLayoutAnalysisModel() {
    try {
      this.layoutAnalysisModel = await tf.loadLayersModel('indexeddb://layout-analysis-model');
    } catch {
      this.layoutAnalysisModel = this.createLayoutAnalysisModel();
      await this.layoutAnalysisModel.save('indexeddb://layout-analysis-model');
    }
  }

  private createLayoutAnalysisModel(): tf.LayersModel {
    const model = tf.sequential();

    // Input: Visual layout features (positions, sizes, relationships)
    model.add(tf.layers.dense({ inputShape: [100], units: 256, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.3 }));

    // Convolutional analysis of layout patterns
    model.add(tf.layers.reshape({ targetShape: [10, 10, 2.56] }));
    model.add(tf.layers.conv2d({ filters: 64, kernelSize: 3, activation: 'relu' }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
    model.add(tf.layers.conv2d({ filters: 128, kernelSize: 3, activation: 'relu' }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.4 }));

    // Output: Layout quality metrics
    model.add(tf.layers.dense({
      units: 8, // Different layout quality aspects
      activation: 'sigmoid',
      name: 'layout_quality'
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Visual Quality Assessment Model
   */
  private async loadOrCreateVisualQualityModel() {
    try {
      this.visualQualityModel = await tf.loadLayersModel('indexeddb://visual-quality-model');
    } catch {
      this.visualQualityModel = this.createVisualQualityModel();
      await this.visualQualityModel.save('indexeddb://visual-quality-model');
    }
  }

  private createVisualQualityModel(): tf.LayersModel {
    const model = tf.sequential();

    // Input: Visual element features
    model.add(tf.layers.dense({ inputShape: [80], units: 128, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Quality assessment layers
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));

    // Output: Visual quality scores
    model.add(tf.layers.dense({
      units: 6, // contrast, readability, spacing, alignment, color, composition
      activation: 'sigmoid',
      name: 'visual_quality'
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return model;
  }

  /**
   * Accessibility Vision Model
   */
  private async loadOrCreateAccessibilityVisionModel() {
    try {
      this.accessibilityVisionModel = await tf.loadLayersModel('indexeddb://accessibility-vision-model');
    } catch {
      this.accessibilityVisionModel = this.createAccessibilityVisionModel();
      await this.accessibilityVisionModel.save('indexeddb://accessibility-vision-model');
    }
  }

  private createAccessibilityVisionModel(): tf.LayersModel {
    const model = tf.sequential();

    // Input: Accessibility-related visual features
    model.add(tf.layers.dense({ inputShape: [60], units: 96, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.25 }));

    model.add(tf.layers.dense({ units: 48, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 24, activation: 'relu' }));

    // Output: Accessibility scores
    model.add(tf.layers.dense({
      units: 5, // color_contrast, text_size, focus_indicators, alt_text, keyboard_nav
      activation: 'sigmoid',
      name: 'accessibility_scores'
    }));

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  /**
   * Analyze DOM layout visually
   */
  async analyzeLayout(domTree: any, stylesheets: any[]): Promise<ComputerVisionAnalysis> {
    if (!this.layoutAnalysisModel || !this.visualQualityModel || !this.accessibilityVisionModel) {
      throw new Error('Computer vision models not initialized');
    }

    const layoutFeatures = this.extractLayoutFeatures(domTree, stylesheets);
    const visualFeatures = this.extractVisualFeatures(domTree, stylesheets);
    const accessibilityFeatures = this.extractAccessibilityFeatures(domTree, stylesheets);

    // Run all models in parallel
    const [layoutResult, visualResult, accessibilityResult] = await Promise.all([
      this.runLayoutAnalysis(layoutFeatures),
      this.runVisualQualityAnalysis(visualFeatures),
      this.runAccessibilityAnalysis(accessibilityFeatures)
    ]);

    return {
      layoutQuality: layoutResult.overall,
      visualComplexity: visualResult.complexity,
      accessibilityScore: accessibilityResult.overall,
      responsiveDesignScore: layoutResult.responsive,
      detectedIssues: [
        ...layoutResult.issues,
        ...visualResult.issues,
        ...accessibilityResult.issues
      ],
      suggestions: [
        ...layoutResult.suggestions,
        ...visualResult.suggestions,
        ...accessibilityResult.suggestions
      ]
    };
  }

  private async runLayoutAnalysis(features: number[]) {
    const inputTensor = tf.tensor2d([features]);
    const prediction = this.layoutAnalysisModel!.predict(inputTensor) as tf.Tensor;
    const scores = await prediction.data();

    inputTensor.dispose();
    prediction.dispose();

    const layoutAspects = [
      'structure', 'hierarchy', 'spacing', 'alignment',
      'responsiveness', 'performance', 'usability', 'seo'
    ];

    const results: { [key: string]: number } = {};
    layoutAspects.forEach((aspect, index) => {
      results[aspect] = scores[index];
    });

    return {
      overall: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      responsive: results.responsiveness,
      issues: this.identifyLayoutIssues(results),
      suggestions: this.generateLayoutSuggestions(results)
    };
  }

  private async runVisualQualityAnalysis(features: number[]) {
    const inputTensor = tf.tensor2d([features]);
    const prediction = this.visualQualityModel!.predict(inputTensor) as tf.Tensor;
    const scores = await prediction.data();

    inputTensor.dispose();
    prediction.dispose();

    const qualityAspects = ['contrast', 'readability', 'spacing', 'alignment', 'color', 'composition'];

    const results: { [key: string]: number } = {};
    qualityAspects.forEach((aspect, index) => {
      results[aspect] = scores[index];
    });

    return {
      overall: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      complexity: this.calculateVisualComplexity(features),
      issues: this.identifyVisualIssues(results),
      suggestions: this.generateVisualSuggestions(results)
    };
  }

  private async runAccessibilityAnalysis(features: number[]) {
    const inputTensor = tf.tensor2d([features]);
    const prediction = this.accessibilityVisionModel!.predict(inputTensor) as tf.Tensor;
    const scores = await prediction.data();

    inputTensor.dispose();
    prediction.dispose();

    const accessibilityAspects = [
      'color_contrast', 'text_size', 'focus_indicators', 'alt_text', 'keyboard_nav'
    ];

    const results: { [key: string]: number } = {};
    accessibilityAspects.forEach((aspect, index) => {
      results[aspect] = scores[index];
    });

    return {
      overall: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      issues: this.identifyAccessibilityIssues(results),
      suggestions: this.generateAccessibilitySuggestions(results)
    };
  }

  /**
   * Feature extraction methods
   */
  private extractLayoutFeatures(domTree: any, stylesheets: any[]): number[] {
    const features = [];

    // Element positioning and layout
    const allElements = domTree.querySelectorAll ? domTree.querySelectorAll('*') : [];
    features.push(allElements.length);

    // Layout type detection
    const hasFlexbox = this.detectFlexbox(stylesheets);
    const hasGrid = this.detectGrid(stylesheets);
    const hasFloats = this.detectFloats(stylesheets);
    features.push(hasFlexbox ? 1 : 0, hasGrid ? 1 : 0, hasFloats ? 1 : 0);

    // Box model analysis
    const boxModelUsage = this.analyzeBoxModel(stylesheets);
    features.push(...boxModelUsage);

    // Responsive design features
    const responsiveFeatures = this.extractResponsiveFeatures(stylesheets);
    features.push(...responsiveFeatures);

    // Layout depth and complexity
    features.push(this.calculateLayoutDepth(domTree));
    features.push(this.calculateLayoutComplexity(domTree));

    // Media query analysis
    features.push(this.countMediaQueries(stylesheets));

    // Z-index usage
    features.push(this.analyzeZIndexUsage(stylesheets));

    // Pad to 100 features
    while (features.length < 100) {
      features.push(0);
    }

    return features.slice(0, 100);
  }

  private extractVisualFeatures(domTree: any, stylesheets: any[]): number[] {
    const features = [];

    // Color analysis
    const colorStats = this.analyzeColors(stylesheets);
    features.push(...colorStats);

    // Typography analysis
    const typographyStats = this.analyzeTypography(stylesheets);
    features.push(...typographyStats);

    // Spacing analysis
    const spacingStats = this.analyzeSpacing(stylesheets);
    features.push(...spacingStats);

    // Image and media analysis
    const mediaStats = this.analyzeMediaElements(domTree);
    features.push(...mediaStats);

    // Animation and transition analysis
    const animationStats = this.analyzeAnimations(stylesheets);
    features.push(...animationStats);

    // Pad to 80 features
    while (features.length < 80) {
      features.push(0);
    }

    return features.slice(0, 80);
  }

  private extractAccessibilityFeatures(domTree: any, stylesheets: any[]): number[] {
    const features = [];

    // Color contrast analysis
    features.push(this.analyzeColorContrast(stylesheets));

    // Font size analysis
    features.push(this.analyzeFontSizes(stylesheets));

    // Focus indicators
    features.push(this.detectFocusIndicators(stylesheets));

    // Alt text analysis
    features.push(this.analyzeAltText(domTree));

    // Keyboard navigation
    features.push(this.analyzeKeyboardNavigation(domTree));

    // ARIA attributes
    features.push(this.analyzeARIA(domTree));

    // Semantic HTML usage
    features.push(this.analyzeSemanticHTML(domTree));

    // Form accessibility
    features.push(this.analyzeFormAccessibility(domTree));

    // Pad to 60 features
    while (features.length < 60) {
      features.push(0);
    }

    return features.slice(0, 60);
  }

  /**
   * Helper methods for feature extraction
   */
  private detectFlexbox(stylesheets: any[]): boolean {
    return stylesheets.some(sheet =>
      sheet.cssText && sheet.cssText.includes('display: flex')
    );
  }

  private detectGrid(stylesheets: any[]): boolean {
    return stylesheets.some(sheet =>
      sheet.cssText && sheet.cssText.includes('display: grid')
    );
  }

  private detectFloats(stylesheets: any[]): boolean {
    return stylesheets.some(sheet =>
      sheet.cssText && sheet.cssText.includes('float:')
    );
  }

  private analyzeBoxModel(stylesheets: any[]): number[] {
    const boxModel = { margin: 0, padding: 0, border: 0, boxSizing: 0 };
    stylesheets.forEach(sheet => {
      if (sheet.cssText) {
        if (sheet.cssText.includes('margin:')) boxModel.margin++;
        if (sheet.cssText.includes('padding:')) boxModel.padding++;
        if (sheet.cssText.includes('border:')) boxModel.border++;
        if (sheet.cssText.includes('box-sizing:')) boxModel.boxSizing++;
      }
    });
    return Object.values(boxModel);
  }

  private extractResponsiveFeatures(stylesheets: any[]): number[] {
    let mediaQueries = 0;
    let flexboxResponsive = 0;
    let gridResponsive = 0;
    let viewportUnits = 0;

    stylesheets.forEach(sheet => {
      if (sheet.cssText) {
        mediaQueries += (sheet.cssText.match(/@media/g) || []).length;
        if (sheet.cssText.includes('flex-wrap')) flexboxResponsive++;
        if (sheet.cssText.includes('grid-template-columns')) gridResponsive++;
        viewportUnits += (sheet.cssText.match(/vw|vh|vmin|vmax/g) || []).length;
      }
    });

    return [mediaQueries, flexboxResponsive, gridResponsive, viewportUnits];
  }

  private calculateLayoutDepth(domTree: any): number {
    const calculateDepth = (element: any, depth = 0): number => {
      if (!element.children || element.children.length === 0) return depth;
      return Math.max(...Array.from(element.children).map((child: any) => calculateDepth(child, depth + 1)));
    };
    return calculateDepth(domTree.body || domTree);
  }

  private calculateLayoutComplexity(domTree: any): number {
    const elements = domTree.querySelectorAll ? domTree.querySelectorAll('*') : [];
    let complexity = 0;

    elements.forEach((element: any) => {
      // Count CSS classes, IDs, inline styles
      complexity += element.classList ? element.classList.length : 0;
      complexity += element.id ? 1 : 0;
      complexity += element.style ? Object.keys(element.style).length : 0;
    });

    return complexity;
  }

  private countMediaQueries(stylesheets: any[]): number {
    return stylesheets.reduce((count, sheet) => {
      return count + (sheet.cssText ? (sheet.cssText.match(/@media/g) || []).length : 0);
    }, 0);
  }

  private analyzeZIndexUsage(stylesheets: any[]): number {
    return stylesheets.reduce((count, sheet) => {
      return count + (sheet.cssText ? (sheet.cssText.match(/z-index:/g) || []).length : 0);
    }, 0);
  }

  private analyzeColors(stylesheets: any[]): number[] {
    let colorDeclarations = 0;
    let backgroundDeclarations = 0;
    let uniqueColors = new Set();

    stylesheets.forEach(sheet => {
      if (sheet.cssText) {
        colorDeclarations += (sheet.cssText.match(/color:/g) || []).length;
        backgroundDeclarations += (sheet.cssText.match(/background(-color)?:/g) || []).length;

        const colorMatches = sheet.cssText.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|hsl\([^)]+\)/g) || [];
        colorMatches.forEach(color => uniqueColors.add(color));
      }
    });

    return [colorDeclarations, backgroundDeclarations, uniqueColors.size];
  }

  private analyzeTypography(stylesheets: any[]): number[] {
    let fontSizeDeclarations = 0;
    let fontFamilyDeclarations = 0;
    let lineHeightDeclarations = 0;

    stylesheets.forEach(sheet => {
      if (sheet.cssText) {
        fontSizeDeclarations += (sheet.cssText.match(/font-size:/g) || []).length;
        fontFamilyDeclarations += (sheet.cssText.match(/font-family:/g) || []).length;
        lineHeightDeclarations += (sheet.cssText.match(/line-height:/g) || []).length;
      }
    });

    return [fontSizeDeclarations, fontFamilyDeclarations, lineHeightDeclarations];
  }

  private analyzeSpacing(stylesheets: any[]): number[] {
    let marginDeclarations = 0;
    let paddingDeclarations = 0;
    let gapDeclarations = 0;

    stylesheets.forEach(sheet => {
      if (sheet.cssText) {
        marginDeclarations += (sheet.cssText.match(/margin(-top|-right|-bottom|-left)?:/g) || []).length;
        paddingDeclarations += (sheet.cssText.match(/padding(-top|-right|-bottom|-left)?:/g) || []).length;
        gapDeclarations += (sheet.cssText.match(/gap:/g) || []).length;
      }
    });

    return [marginDeclarations, paddingDeclarations, gapDeclarations];
  }

  private analyzeMediaElements(domTree: any): number[] {
    const images = domTree.querySelectorAll ? domTree.querySelectorAll('img').length : 0;
    const videos = domTree.querySelectorAll ? domTree.querySelectorAll('video').length : 0;
    const audios = domTree.querySelectorAll ? domTree.querySelectorAll('audio').length : 0;
    const iframes = domTree.querySelectorAll ? domTree.querySelectorAll('iframe').length : 0;

    return [images, videos, audios, iframes];
  }

  private analyzeAnimations(stylesheets: any[]): number[] {
    let transitions = 0;
    let animations = 0;
    let transforms = 0;

    stylesheets.forEach(sheet => {
      if (sheet.cssText) {
        transitions += (sheet.cssText.match(/transition:/g) || []).length;
        animations += (sheet.cssText.match(/animation:/g) || []).length;
        transforms += (sheet.cssText.match(/transform:/g) || []).length;
      }
    });

    return [transitions, animations, transforms];
  }

  private analyzeColorContrast(stylesheets: any[]): number {
    // Simplified contrast analysis - in real implementation would calculate actual contrast ratios
    let contrastDeclarations = 0;
    stylesheets.forEach(sheet => {
      if (sheet.cssText) {
        contrastDeclarations += (sheet.cssText.match(/color:|background(-color)?:/g) || []).length;
      }
    });
    return contrastDeclarations;
  }

  private analyzeFontSizes(stylesheets: any[]): number {
    let smallFonts = 0;
    let largeFonts = 0;

    stylesheets.forEach(sheet => {
      if (sheet.cssText) {
        const fontSizeMatches = sheet.cssText.match(/font-size:\s*(\d+(?:\.\d+)?)(px|em|rem)/g) || [];
        fontSizeMatches.forEach(match => {
          const size = parseFloat(match.match(/(\d+(?:\.\d+)?)/)?.[1] || '0');
          const unit = match.match(/(px|em|rem)/)?.[1];

          if (unit === 'px' && size < 14) smallFonts++;
          else if (unit === 'px' && size > 24) largeFonts++;
          else if (unit === 'em' || unit === 'rem') {
            if (size < 0.875) smallFonts++; // < 14px at 16px base
            else if (size > 1.5) largeFonts++; // > 24px at 16px base
          }
        });
      }
    });

    return smallFonts + largeFonts; // Could be refined to return separate counts
  }

  private detectFocusIndicators(stylesheets: any[]): number {
    let focusRules = 0;
    stylesheets.forEach(sheet => {
      if (sheet.cssText) {
        focusRules += (sheet.cssText.match(/:focus/g) || []).length;
      }
    });
    return focusRules;
  }

  private analyzeAltText(domTree: any): number {
    const images = domTree.querySelectorAll ? domTree.querySelectorAll('img') : [];
    let imagesWithAlt = 0;

    images.forEach((img: any) => {
      if (img.hasAttribute('alt')) imagesWithAlt++;
    });

    return images.length > 0 ? imagesWithAlt / images.length : 1;
  }

  private analyzeKeyboardNavigation(domTree: any): number {
    const interactiveElements = domTree.querySelectorAll ?
      domTree.querySelectorAll('a, button, input, select, textarea, [tabindex]') : [];
    let accessibleElements = 0;

    interactiveElements.forEach((element: any) => {
      if (element.hasAttribute('tabindex') || element.tagName === 'A' || element.tagName === 'BUTTON' ||
          element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
        accessibleElements++;
      }
    });

    return interactiveElements.length > 0 ? accessibleElements / interactiveElements.length : 1;
  }

  private analyzeARIA(domTree: any): number {
    const allElements = domTree.querySelectorAll ? domTree.querySelectorAll('*') : [];
    let ariaElements = 0;

    allElements.forEach((element: any) => {
      const attributes = element.attributes || [];
      for (let attr of attributes) {
        if (attr.name.startsWith('aria-')) {
          ariaElements++;
          break;
        }
      }
    });

    return ariaElements;
  }

  private analyzeSemanticHTML(domTree: any): number {
    const semanticElements = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
    let semanticCount = 0;

    semanticElements.forEach(tag => {
      semanticCount += domTree.querySelectorAll ? domTree.querySelectorAll(tag).length : 0;
    });

    return semanticCount;
  }

  private analyzeFormAccessibility(domTree: any): number {
    const forms = domTree.querySelectorAll ? domTree.querySelectorAll('form') : [];
    const inputs = domTree.querySelectorAll ? domTree.querySelectorAll('input, select, textarea') : [];
    let accessibleForms = 0;

    forms.forEach((form: any) => {
      const labels = form.querySelectorAll ? form.querySelectorAll('label') : [];
      if (labels.length > 0) accessibleForms++;
    });

    inputs.forEach((input: any) => {
      if (input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby') ||
          input.hasAttribute('title') ||
          (input.id && domTree.querySelector(`label[for="${input.id}"]`))) {
        accessibleForms++;
      }
    });

    const totalFormElements = forms.length + inputs.length;
    return totalFormElements > 0 ? accessibleForms / totalFormElements : 1;
  }

  private calculateVisualComplexity(features: number[]): number {
    // Calculate complexity based on various visual features
    const colorComplexity = features[2] || 0; // unique colors
    const typographyComplexity = features[3] + features[4] + features[5]; // font declarations
    const spacingComplexity = features[6] + features[7] + features[8]; // spacing declarations
    const mediaComplexity = features[9] + features[10] + features[11] + features[12]; // media elements

    return (colorComplexity + typographyComplexity + spacingComplexity + mediaComplexity) / 10;
  }

  /**
   * Issue identification and suggestion generation
   */
  private identifyLayoutIssues(results: { [key: string]: number }): string[] {
    const issues = [];
    if (results.structure < 0.5) issues.push('Poor DOM structure');
    if (results.hierarchy < 0.5) issues.push('Flat hierarchy');
    if (results.spacing < 0.5) issues.push('Inconsistent spacing');
    if (results.alignment < 0.5) issues.push('Poor alignment');
    if (results.responsiveness < 0.5) issues.push('Not responsive');
    if (results.performance < 0.5) issues.push('Performance issues');
    if (results.usability < 0.5) issues.push('Usability problems');
    if (results.seo < 0.5) issues.push('SEO issues');
    return issues;
  }

  private generateLayoutSuggestions(results: { [key: string]: number }): string[] {
    const suggestions = [];
    if (results.structure < 0.5) suggestions.push('Use semantic HTML elements');
    if (results.hierarchy < 0.5) suggestions.push('Implement proper heading hierarchy');
    if (results.spacing < 0.5) suggestions.push('Use consistent spacing system');
    if (results.alignment < 0.5) suggestions.push('Implement CSS Grid or Flexbox for alignment');
    if (results.responsiveness < 0.5) suggestions.push('Add responsive breakpoints and flexible layouts');
    if (results.performance < 0.5) suggestions.push('Optimize images and reduce render-blocking resources');
    if (results.usability < 0.5) suggestions.push('Improve navigation and user interaction patterns');
    if (results.seo < 0.5) suggestions.push('Add proper meta tags and structured data');
    return suggestions;
  }

  private identifyVisualIssues(results: { [key: string]: number }): string[] {
    const issues = [];
    if (results.contrast < 0.5) issues.push('Poor color contrast');
    if (results.readability < 0.5) issues.push('Low readability');
    if (results.spacing < 0.5) issues.push('Tight spacing');
    if (results.alignment < 0.5) issues.push('Misaligned elements');
    if (results.color < 0.5) issues.push('Poor color scheme');
    if (results.composition < 0.5) issues.push('Poor visual composition');
    return issues;
  }

  private generateVisualSuggestions(results: { [key: string]: number }): string[] {
    const suggestions = [];
    if (results.contrast < 0.5) suggestions.push('Improve color contrast ratios');
    if (results.readability < 0.5) suggestions.push('Increase font sizes and improve typography');
    if (results.spacing < 0.5) suggestions.push('Add more whitespace and padding');
    if (results.alignment < 0.5) suggestions.push('Use CSS Grid or Flexbox for better alignment');
    if (results.color < 0.5) suggestions.push('Implement a cohesive color palette');
    if (results.composition < 0.5) suggestions.push('Improve visual hierarchy and layout composition');
    return suggestions;
  }

  private identifyAccessibilityIssues(results: { [key: string]: number }): string[] {
    const issues = [];
    if (results.color_contrast < 0.5) issues.push('Insufficient color contrast');
    if (results.text_size < 0.5) issues.push('Text too small');
    if (results.focus_indicators < 0.5) issues.push('Missing focus indicators');
    if (results.alt_text < 0.5) issues.push('Missing alt text for images');
    if (results.keyboard_nav < 0.5) issues.push('Poor keyboard navigation');
    return issues;
  }

  private generateAccessibilitySuggestions(results: { [key: string]: number }): string[] {
    const suggestions = [];
    if (results.color_contrast < 0.5) suggestions.push('Ensure 4.5:1 contrast ratio for text');
    if (results.text_size < 0.5) suggestions.push('Use minimum 14px font size');
    if (results.focus_indicators < 0.5) suggestions.push('Add visible focus indicators for keyboard navigation');
    if (results.alt_text < 0.5) suggestions.push('Add descriptive alt text to all images');
    if (results.keyboard_nav < 0.5) suggestions.push('Ensure all interactive elements are keyboard accessible');
    return suggestions;
  }

  /**
   * Cleanup resources
   */
  dispose() {
    if (this.layoutAnalysisModel) this.layoutAnalysisModel.dispose();
    if (this.visualQualityModel) this.visualQualityModel.dispose();
    if (this.accessibilityVisionModel) this.accessibilityVisionModel.dispose();
  }
}

export default DOMComputerVisionAnalyzer;