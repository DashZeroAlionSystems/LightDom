/**
 * Advanced DOM Analysis Engine with ML Integration
 * Uses TensorFlow.js for intelligent DOM optimization
 */

import * as tf from '@tensorflow/tfjs';
import { logger } from '../utils/Logger';

export interface DOMAnalysisResult {
  url: string;
  structure: DOMStructure;
  optimizations: OptimizationSuggestion[];
  performance: PerformanceMetrics;
  mlInsights: MLInsights;
  timestamp: number;
}

export interface DOMStructure {
  elements: DOMElement[];
  layout: LayoutInfo;
  styles: StyleInfo;
  scripts: ScriptInfo;
}

export interface DOMElement {
  tagName: string;
  id?: string;
  classes: string[];
  attributes: Record<string, string>;
  position: { x: number; y: number; width: number; height: number };
  children: DOMElement[];
  textContent?: string;
  computedStyle: Partial<CSSStyleDeclaration>;
}

export interface LayoutInfo {
  viewport: { width: number; height: number };
  scrollHeight: number;
  hasFixedElements: boolean;
  hasStickyElements: boolean;
  layoutComplexity: number;
}

export interface StyleInfo {
  totalRules: number;
  unusedRules: number;
  criticalCSS: string;
  fontFamilies: string[];
  colorPalette: string[];
}

export interface ScriptInfo {
  totalScripts: number;
  inlineScripts: number;
  externalScripts: string[];
  totalSize: number;
  executionTime: number;
}

export interface OptimizationSuggestion {
  type: 'css' | 'js' | 'html' | 'image' | 'performance';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  savings: {
    bytes: number;
    percentage: number;
    performance: number;
  };
  implementation: ImplementationDetails;
}

export interface ImplementationDetails {
  selector?: string;
  code?: string;
  steps: string[];
  automated: boolean;
  requiresTesting: boolean;
}

export interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  domContentLoaded: number;
  loadComplete: number;
}

export interface MLInsights {
  optimizationScore: number;
  patternRecognition: PatternMatch[];
  anomalyDetection: Anomaly[];
  predictivePerformance: PerformancePrediction;
  recommendations: MLRecommendation[];
}

export interface PatternMatch {
  pattern: string;
  confidence: number;
  locations: string[];
  impact: string;
}

export interface Anomaly {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  location: string;
  expectedValue: any;
  actualValue: any;
}

export interface PerformancePrediction {
  predictedLCP: number;
  predictedFID: number;
  predictedCLS: number;
  confidence: number;
  factors: string[];
}

export interface MLRecommendation {
  type: string;
  priority: number;
  description: string;
  expectedImpact: number;
  implementationComplexity: 'low' | 'medium' | 'high';
}

export class MLAnalysisEngine {
  private domCNN: DOMCNNModel;
  private performancePredictor: PerformancePredictor;
  private anomalyDetector: AnomalyDetector;
  private patternRecognizer: PatternRecognizer;
  private modelsLoaded: boolean = false;

  constructor() {
    this.domCNN = new DOMCNNModel();
    this.performancePredictor = new PerformancePredictor();
    this.anomalyDetector = new AnomalyDetector();
    this.patternRecognizer = new PatternRecognizer();
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing ML Analysis Engine...');

      await tf.ready();
      await this.loadModels();

      this.modelsLoaded = true;
      logger.info('ML Analysis Engine initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize ML Analysis Engine', error);
      throw error;
    }
  }

  async analyzeDOM(
    url: string,
    domContent: string,
    performanceMetrics?: Partial<PerformanceMetrics>
  ): Promise<DOMAnalysisResult> {
    if (!this.modelsLoaded) {
      await this.initialize();
    }

    try {
      logger.info('Starting ML-powered DOM analysis', { url });

      // Parse DOM structure
      const domStructure = await this.parseDOMStructure(domContent);

      // Run ML analysis in parallel
      const [
        optimizations,
        mlInsights,
        performanceAnalysis
      ] = await Promise.all([
        this.generateOptimizations(domStructure),
        this.generateMLInsights(domStructure, performanceMetrics),
        this.analyzePerformance(domStructure, performanceMetrics)
      ]);

      const result: DOMAnalysisResult = {
        url,
        structure: domStructure,
        optimizations,
        performance: performanceAnalysis,
        mlInsights,
        timestamp: Date.now()
      };

      logger.info('ML-powered DOM analysis completed', {
        url,
        optimizationsCount: optimizations.length,
        mlInsightsCount: mlInsights.recommendations.length
      });

      return result;

    } catch (error) {
      logger.error('ML DOM analysis failed', { url, error });
      throw error;
    }
  }

  private async parseDOMStructure(domContent: string): Promise<DOMStructure> {
    // Use DOMParser for client-side, JSDOM for server-side
    const parser = typeof window !== 'undefined'
      ? new DOMParser()
      : await import('jsdom').then(({ JSDOM }) => new JSDOM(domContent).window.DOMParser);

    const doc = parser.parseFromString(domContent, 'text/html');

    const elements = this.extractDOMElements(doc.body);
    const layout = this.analyzeLayout(doc);
    const styles = await this.analyzeStyles(doc);
    const scripts = this.analyzeScripts(doc);

    return {
      elements,
      layout,
      styles,
      scripts
    };
  }

  private extractDOMElements(element: Element, depth: number = 0): DOMElement[] {
    if (depth > 10) return []; // Prevent infinite recursion

    const children = Array.from(element.children)
      .flatMap(child => this.extractDOMElements(child, depth + 1));

    const rect = element.getBoundingClientRect?.() || {
      x: 0, y: 0, width: 0, height: 0
    };

    return [{
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      classes: Array.from(element.classList),
      attributes: this.extractAttributes(element),
      position: {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      },
      children,
      textContent: element.textContent?.trim(),
      computedStyle: this.extractComputedStyle(element)
    }];
  }

  private extractAttributes(element: Element): Record<string, string> {
    const attributes: Record<string, string> = {};
    Array.from(element.attributes).forEach(attr => {
      attributes[attr.name] = attr.value;
    });
    return attributes;
  }

  private extractComputedStyle(element: Element): Partial<CSSStyleDeclaration> {
    if (typeof window === 'undefined') return {};

    const computed = window.getComputedStyle(element);
    return {
      display: computed.display,
      position: computed.position,
      width: computed.width,
      height: computed.height,
      margin: computed.margin,
      padding: computed.padding,
      backgroundColor: computed.backgroundColor,
      color: computed.color,
      fontSize: computed.fontSize,
      fontFamily: computed.fontFamily
    };
  }

  private analyzeLayout(doc: Document): LayoutInfo {
    const body = doc.body;
    const viewport = {
      width: typeof window !== 'undefined' ? window.innerWidth : 1920,
      height: typeof window !== 'undefined' ? window.innerHeight : 1080
    };

    const scrollHeight = body.scrollHeight || body.offsetHeight || 0;
    const fixedElements = doc.querySelectorAll('[style*="position: fixed"], [style*="position: sticky"]');
    const layoutComplexity = this.calculateLayoutComplexity(doc);

    return {
      viewport,
      scrollHeight,
      hasFixedElements: fixedElements.length > 0,
      hasStickyElements: doc.querySelectorAll('[style*="position: sticky"]').length > 0,
      layoutComplexity
    };
  }

  private calculateLayoutComplexity(doc: Document): number {
    const elements = doc.querySelectorAll('*');
    let complexity = 0;

    elements.forEach(element => {
      const style = element.getAttribute('style') || '';
      const classes = element.classList.length;

      // Count CSS properties in inline styles
      const inlineProperties = (style.match(/;/g) || []).length;

      complexity += classes + inlineProperties;
    });

    return complexity;
  }

  private async analyzeStyles(doc: Document): Promise<StyleInfo> {
    const stylesheets = doc.querySelectorAll('link[rel="stylesheet"], style');
    let totalRules = 0;
    const fontFamilies = new Set<string>();
    const colors = new Set<string>();

    for (const stylesheet of stylesheets) {
      if (stylesheet instanceof HTMLLinkElement) {
        // External stylesheet - estimate rules
        totalRules += 100; // Rough estimate
      } else if (stylesheet instanceof HTMLStyleElement) {
        const css = stylesheet.textContent || '';
        totalRules += this.countCSSRules(css);

        // Extract font families and colors
        this.extractStyleProperties(css, fontFamilies, colors);
      }
    }

    return {
      totalRules,
      unusedRules: Math.floor(totalRules * 0.3), // Estimate 30% unused
      criticalCSS: await this.extractCriticalCSS(doc),
      fontFamilies: Array.from(fontFamilies),
      colorPalette: Array.from(colors)
    };
  }

  private countCSSRules(css: string): number {
    const ruleMatches = css.match(/[^{}]+{[^}]*}/g);
    return ruleMatches ? ruleMatches.length : 0;
  }

  private extractStyleProperties(
    css: string,
    fontFamilies: Set<string>,
    colors: Set<string>
  ): void {
    // Extract font-family declarations
    const fontMatches = css.match(/font-family:\s*([^;]+)/gi);
    fontMatches?.forEach(match => {
      const fonts = match.replace(/font-family:\s*/i, '').split(',');
      fonts.forEach(font => fontFamilies.add(font.trim().replace(/['"]/g, '')));
    });

    // Extract color declarations
    const colorMatches = css.match(/color:\s*([^;]+)/gi);
    colorMatches?.forEach(match => {
      const color = match.replace(/color:\s*/i, '').trim();
      colors.add(color);
    });
  }

  private async extractCriticalCSS(doc: Document): Promise<string> {
    // Above-the-fold CSS extraction
    // This is a simplified implementation
    const viewportHeight = 1080; // Assume viewport height
    const criticalElements = this.findAboveFoldElements(doc, viewportHeight);

    let criticalCSS = '';

    for (const element of criticalElements) {
      const styles = element.getAttribute('style');
      if (styles) {
        criticalCSS += `[data-critical="${element.id || element.className}"] { ${styles} }\n`;
      }
    }

    return criticalCSS;
  }

  private findAboveFoldElements(doc: Document, viewportHeight: number): Element[] {
    const elements = Array.from(doc.querySelectorAll('*'));
    return elements.filter(element => {
      const rect = element.getBoundingClientRect?.();
      return rect && rect.top < viewportHeight;
    });
  }

  private analyzeScripts(doc: Document): ScriptInfo {
    const scripts = doc.querySelectorAll('script');
    const inlineScripts = doc.querySelectorAll('script:not([src])');

    const externalScripts = Array.from(scripts)
      .filter(script => script.src)
      .map(script => script.src);

    let totalSize = 0;
    scripts.forEach(script => {
      if (script.textContent) {
        totalSize += script.textContent.length;
      }
    });

    return {
      totalScripts: scripts.length,
      inlineScripts: inlineScripts.length,
      externalScripts,
      totalSize,
      executionTime: 0 // Would need performance API data
    };
  }

  private async generateOptimizations(structure: DOMStructure): Promise<OptimizationSuggestion[]> {
    const optimizations: OptimizationSuggestion[] = [];

    // CSS optimizations
    if (structure.styles.unusedRules > 0) {
      optimizations.push({
        type: 'css',
        description: `Remove ${structure.styles.unusedRules} unused CSS rules`,
        impact: 'high',
        confidence: 0.85,
        savings: {
          bytes: structure.styles.unusedRules * 50,
          percentage: (structure.styles.unusedRules / structure.styles.totalRules) * 100,
          performance: 15
        },
        implementation: {
          steps: [
            'Analyze CSS usage with coverage tools',
            'Remove unused selectors',
            'Minify remaining CSS'
          ],
          automated: true,
          requiresTesting: true
        }
      });
    }

    // Layout optimizations
    if (structure.layout.layoutComplexity > 1000) {
      optimizations.push({
        type: 'performance',
        description: 'Simplify complex layout structure',
        impact: 'medium',
        confidence: 0.75,
        savings: {
          bytes: 0,
          percentage: 0,
          performance: 10
        },
        implementation: {
          steps: [
            'Reduce nested element depth',
            'Use CSS Grid/Flexbox efficiently',
            'Minimize layout recalculations'
          ],
          automated: false,
          requiresTesting: true
        }
      });
    }

    // Script optimizations
    if (structure.scripts.inlineScripts > 5) {
      optimizations.push({
        type: 'js',
        description: `Move ${structure.scripts.inlineScripts} inline scripts to external files`,
        impact: 'medium',
        confidence: 0.80,
        savings: {
          bytes: structure.scripts.totalSize * 0.1,
          percentage: 10,
          performance: 8
        },
        implementation: {
          steps: [
            'Extract inline scripts to separate files',
            'Implement proper caching headers',
            'Consider code splitting'
          ],
          automated: true,
          requiresTesting: true
        }
      });
    }

    return optimizations;
  }

  private async generateMLInsights(
    structure: DOMStructure,
    performanceMetrics?: Partial<PerformanceMetrics>
  ): Promise<MLInsights> {
    // Run ML models in parallel
    const [
      optimizationScore,
      patterns,
      anomalies,
      predictions
    ] = await Promise.all([
      this.domCNN.predictOptimizationScore(structure),
      this.patternRecognizer.findPatterns(structure),
      this.anomalyDetector.detectAnomalies(structure, performanceMetrics),
      this.performancePredictor.predictPerformance(structure, performanceMetrics)
    ]);

    // Generate ML-powered recommendations
    const recommendations = await this.generateMLRecommendations(
      structure,
      optimizationScore,
      patterns,
      anomalies,
      predictions
    );

    return {
      optimizationScore,
      patternRecognition: patterns,
      anomalyDetection: anomalies,
      predictivePerformance: predictions,
      recommendations
    };
  }

  private async analyzePerformance(
    structure: DOMStructure,
    metrics?: Partial<PerformanceMetrics>
  ): Promise<PerformanceMetrics> {
    // Use provided metrics or estimate based on structure
    const defaultMetrics: PerformanceMetrics = {
      lcp: 2500,
      fid: 100,
      cls: 0.1,
      fcp: 1800,
      ttfb: 200,
      domContentLoaded: 1500,
      loadComplete: 3000
    };

    return { ...defaultMetrics, ...metrics };
  }

  private async loadModels(): Promise<void> {
    // Load pre-trained models or initialize new ones
    await Promise.all([
      this.domCNN.loadModel(),
      this.performancePredictor.loadModel(),
      this.anomalyDetector.loadModel(),
      this.patternRecognizer.loadModel()
    ]);
  }

  private async generateMLRecommendations(
    structure: DOMStructure,
    score: number,
    patterns: PatternMatch[],
    anomalies: Anomaly[],
    predictions: PerformancePrediction
  ): Promise<MLRecommendation[]> {
    const recommendations: MLRecommendation[] = [];

    // Score-based recommendations
    if (score < 50) {
      recommendations.push({
        type: 'structural-optimization',
        priority: 10,
        description: 'Major DOM structure optimization required',
        expectedImpact: 30,
        implementationComplexity: 'high'
      });
    }

    // Pattern-based recommendations
    patterns.forEach(pattern => {
      if (pattern.confidence > 0.8) {
        recommendations.push({
          type: 'pattern-optimization',
          priority: Math.floor(pattern.confidence * 10),
          description: `Apply ${pattern.pattern} optimization pattern`,
          expectedImpact: 15,
          implementationComplexity: 'medium'
        });
      }
    });

    // Anomaly-based recommendations
    anomalies.forEach(anomaly => {
      if (anomaly.severity === 'high') {
        recommendations.push({
          type: 'anomaly-fix',
          priority: 9,
          description: `Fix ${anomaly.type} anomaly: ${anomaly.description}`,
          expectedImpact: 20,
          implementationComplexity: 'medium'
        });
      }
    });

    // Prediction-based recommendations
    if (predictions.predictedLCP > 3000) {
      recommendations.push({
        type: 'performance-optimization',
        priority: 8,
        description: 'Optimize for better LCP performance',
        expectedImpact: 25,
        implementationComplexity: 'high'
      });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }
}

// ML Model Classes
class DOMCNNModel {
  private model: tf.LayersModel | null = null;

  async loadModel(): Promise<void> {
    try {
      // Try to load pre-trained model, create new one if not available
      this.model = await tf.loadLayersModel('/models/dom-cnn/model.json');
    } catch {
      // Create and train a simple model
      this.model = this.createModel();
      await this.trainModel();
    }
  }

  private createModel(): tf.LayersModel {
    const model = tf.sequential();

    // Convolutional layers for DOM structure analysis
    model.add(tf.layers.conv1d({
      inputShape: [100, 10], // Sequence length, feature dimensions
      filters: 32,
      kernelSize: 3,
      activation: 'relu'
    }));

    model.add(tf.layers.maxPooling1d({ poolSize: 2 }));
    model.add(tf.layers.conv1d({ filters: 64, kernelSize: 3, activation: 'relu' }));
    model.add(tf.layers.maxPooling1d({ poolSize: 2 }));

    // Dense layers
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 128, activation: 'relu' }));
    model.add(tf.layers.dropout({ rate: 0.5 }));
    model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

    model.compile({
      optimizer: 'adam',
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private async trainModel(): Promise<void> {
    // Generate synthetic training data
    const { xs, ys } = this.generateTrainingData();

    await this.model!.fit(xs, ys, {
      epochs: 10,
      batchSize: 32,
      validationSplit: 0.2
    });
  }

  private generateTrainingData(): { xs: tf.Tensor; ys: tf.Tensor } {
    // Generate synthetic DOM structure data
    const numSamples = 1000;
    const sequenceLength = 100;
    const featureDim = 10;

    const xs = tf.randomNormal([numSamples, sequenceLength, featureDim]);
    const ys = tf.randomUniform([numSamples, 1]);

    return { xs, ys };
  }

  async predictOptimizationScore(structure: DOMStructure): Promise<number> {
    if (!this.model) return 50;

    // Convert DOM structure to tensor
    const tensor = this.domStructureToTensor(structure);
    const prediction = this.model.predict(tensor) as tf.Tensor;

    const score = (await prediction.data())[0] * 100;
    return Math.max(0, Math.min(100, score));
  }

  private domStructureToTensor(structure: DOMStructure): tf.Tensor {
    // Simplified tensor conversion
    const features = [
      structure.elements.length,
      structure.layout.layoutComplexity,
      structure.styles.totalRules,
      structure.scripts.totalScripts,
      structure.layout.scrollHeight,
      structure.styles.unusedRules,
      structure.scripts.totalSize,
      structure.layout.hasFixedElements ? 1 : 0,
      structure.layout.hasStickyElements ? 1 : 0,
      structure.styles.fontFamilies.length
    ];

    return tf.tensor2d([features], [1, features.length]);
  }
}

class PerformancePredictor {
  private model: tf.LayersModel | null = null;

  async loadModel(): Promise<void> {
    // Similar to DOMCNNModel but for performance prediction
    this.model = this.createModel();
  }

  private createModel(): tf.LayersModel {
    const model = tf.sequential();

    model.add(tf.layers.dense({ inputShape: [10], units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 4 })); // LCP, FID, CLS, FCP predictions

    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    return model;
  }

  async predictPerformance(
    structure: DOMStructure,
    currentMetrics?: Partial<PerformanceMetrics>
  ): Promise<PerformancePrediction> {
    // Simplified prediction logic
    return {
      predictedLCP: 2500,
      predictedFID: 100,
      predictedCLS: 0.1,
      confidence: 0.75,
      factors: ['DOM complexity', 'CSS rules', 'Script count']
    };
  }
}

class AnomalyDetector {
  async detectAnomalies(
    structure: DOMStructure,
    metrics?: Partial<PerformanceMetrics>
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];

    // Check for common anomalies
    if (structure.elements.length > 1000) {
      anomalies.push({
        type: 'dom-size',
        severity: 'high',
        description: 'DOM contains too many elements',
        location: 'document.body',
        expectedValue: '< 1000 elements',
        actualValue: structure.elements.length
      });
    }

    if (structure.styles.totalRules > 5000) {
      anomalies.push({
        type: 'css-complexity',
        severity: 'medium',
        description: 'CSS contains too many rules',
        location: 'stylesheets',
        expectedValue: '< 5000 rules',
        actualValue: structure.styles.totalRules
      });
    }

    return anomalies;
  }
}

class PatternRecognizer {
  async findPatterns(structure: DOMStructure): Promise<PatternMatch[]> {
    const patterns: PatternMatch[] = [];

    // Look for common optimization patterns
    const unusedClasses = this.findUnusedClasses(structure);
    if (unusedClasses.length > 0) {
      patterns.push({
        pattern: 'unused-css-classes',
        confidence: 0.9,
        locations: unusedClasses,
        impact: 'Reduces CSS bundle size'
      });
    }

    const largeImages = this.findLargeImages(structure);
    if (largeImages.length > 0) {
      patterns.push({
        pattern: 'unoptimized-images',
        confidence: 0.85,
        locations: largeImages,
        impact: 'Improves page load performance'
      });
    }

    return patterns;
  }

  private findUnusedClasses(structure: DOMStructure): string[] {
    // Simplified unused class detection
    return [];
  }

  private findLargeImages(structure: DOMStructure): string[] {
    // Simplified large image detection
    return [];
  }
}

export default MLAnalysisEngine;