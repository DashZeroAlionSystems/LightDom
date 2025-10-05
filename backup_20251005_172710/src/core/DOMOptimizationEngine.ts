import { ethers } from 'ethers';

export interface DOMAnalysis {
  url: string;
  totalElements: number;
  unusedElements: number;
  duplicateElements: number;
  oversizedImages: number;
  unusedCSS: number;
  unusedJavaScript: number;
  totalSize: number;
  optimizedSize: number;
  spaceSaved: number;
  optimizationScore: number;
  recommendations: OptimizationRecommendation[];
}

export interface OptimizationRecommendation {
  type: 'element' | 'css' | 'js' | 'image' | 'font';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  potentialSavings: number;
  selector?: string;
  file?: string;
}

export interface OptimizationResult {
  url: string;
  analysis: DOMAnalysis;
  proofHash: string;
  biomeType: string;
  timestamp: number;
  metadata: string;
}

export class DOMOptimizationEngine {
  private static instance: DOMOptimizationEngine;
  private optimizationHistory: OptimizationResult[] = [];

  private constructor() {}

  public static getInstance(): DOMOptimizationEngine {
    if (!DOMOptimizationEngine.instance) {
      DOMOptimizationEngine.instance = new DOMOptimizationEngine();
    }
    return DOMOptimizationEngine.instance;
  }

  /**
   * Analyze DOM and generate optimization recommendations
   */
  public async analyzeDOM(url: string, domContent: string): Promise<DOMAnalysis> {
    try {
      const analysis = await this.performDOMAnalysis(domContent);
      analysis.url = url;
      return analysis;
    } catch (error) {
      console.error('Failed to analyze DOM:', error);
      throw error;
    }
  }

  /**
   * Perform comprehensive DOM analysis
   */
  private async performDOMAnalysis(domContent: string): Promise<DOMAnalysis> {
    const analysis: DOMAnalysis = {
      url: '',
      totalElements: 0,
      unusedElements: 0,
      duplicateElements: 0,
      oversizedImages: 0,
      unusedCSS: 0,
      unusedJavaScript: 0,
      totalSize: domContent.length,
      optimizedSize: 0,
      spaceSaved: 0,
      optimizationScore: 0,
      recommendations: []
    };

    // Parse DOM content
    const parser = new DOMParser();
    const doc = parser.parseFromString(domContent, 'text/html');

    // Count total elements
    analysis.totalElements = doc.querySelectorAll('*').length;

    // Analyze unused elements
    analysis.unusedElements = await this.findUnusedElements(doc);

    // Analyze duplicate elements
    analysis.duplicateElements = await this.findDuplicateElements(doc);

    // Analyze oversized images
    analysis.oversizedImages = await this.findOversizedImages(doc);

    // Analyze unused CSS
    analysis.unusedCSS = await this.findUnusedCSS(doc);

    // Analyze unused JavaScript
    analysis.unusedJavaScript = await this.findUnusedJavaScript(doc);

    // Calculate optimized size
    analysis.optimizedSize = this.calculateOptimizedSize(analysis);

    // Calculate space saved
    analysis.spaceSaved = analysis.totalSize - analysis.optimizedSize;

    // Calculate optimization score
    analysis.optimizationScore = this.calculateOptimizationScore(analysis);

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  /**
   * Find unused elements in the DOM
   */
  private async findUnusedElements(doc: Document): Promise<number> {
    let unusedCount = 0;
    const elements = doc.querySelectorAll('*');

    for (const element of elements) {
      if (this.isElementUnused(element)) {
        unusedCount++;
      }
    }

    return unusedCount;
  }

  /**
   * Check if an element is unused
   */
  private isElementUnused(element: Element): boolean {
    // Check if element has no content and no children
    if (element.children.length === 0 && element.textContent?.trim() === '') {
      return true;
    }

    // Check if element is hidden
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return true;
    }

    // Check if element has zero dimensions
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return true;
    }

    return false;
  }

  /**
   * Find duplicate elements
   */
  private async findDuplicateElements(doc: Document): Promise<number> {
    const elementMap = new Map<string, number>();
    const elements = doc.querySelectorAll('*');

    for (const element of elements) {
      const key = this.getElementKey(element);
      elementMap.set(key, (elementMap.get(key) || 0) + 1);
    }

    let duplicateCount = 0;
    for (const count of elementMap.values()) {
      if (count > 1) {
        duplicateCount += count - 1;
      }
    }

    return duplicateCount;
  }

  /**
   * Generate a unique key for an element
   */
  private getElementKey(element: Element): string {
    return `${element.tagName}-${element.className}-${element.id}`;
  }

  /**
   * Find oversized images
   */
  private async findOversizedImages(doc: Document): Promise<number> {
    let oversizedCount = 0;
    const images = doc.querySelectorAll('img');

    for (const img of images) {
      if (this.isImageOversized(img)) {
        oversizedCount++;
      }
    }

    return oversizedCount;
  }

  /**
   * Check if an image is oversized
   */
  private isImageOversized(img: HTMLImageElement): boolean {
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const displayWidth = img.width;
    const displayHeight = img.height;

    // Check if image is displayed at a smaller size than its natural size
    if (naturalWidth > displayWidth * 2 || naturalHeight > displayHeight * 2) {
      return true;
    }

    return false;
  }

  /**
   * Find unused CSS
   */
  private async findUnusedCSS(doc: Document): Promise<number> {
    let unusedCSSBytes = 0;
    const stylesheets = doc.querySelectorAll('link[rel="stylesheet"], style');

    for (const stylesheet of stylesheets) {
      if (stylesheet instanceof HTMLLinkElement) {
        // For external stylesheets, we can't easily determine unused CSS
        // This is a simplified implementation
        unusedCSSBytes += 1000; // Estimate
      } else if (stylesheet instanceof HTMLStyleElement) {
        unusedCSSBytes += this.analyzeInlineCSS(stylesheet.textContent || '');
      }
    }

    return unusedCSSBytes;
  }

  /**
   * Analyze inline CSS for unused rules
   */
  private analyzeInlineCSS(css: string): number {
    // Simplified CSS analysis
    // In a real implementation, you would parse CSS and check for unused selectors
    return css.length * 0.3; // Estimate 30% unused
  }

  /**
   * Find unused JavaScript
   */
  private async findUnusedJavaScript(doc: Document): Promise<number> {
    let unusedJSBytes = 0;
    const scripts = doc.querySelectorAll('script');

    for (const script of scripts) {
      if (script.src) {
        // For external scripts, we can't easily determine unused code
        unusedJSBytes += 2000; // Estimate
      } else if (script.textContent) {
        unusedJSBytes += this.analyzeInlineJS(script.textContent);
      }
    }

    return unusedJSBytes;
  }

  /**
   * Analyze inline JavaScript for unused code
   */
  private analyzeInlineJS(js: string): number {
    // Simplified JS analysis
    // In a real implementation, you would parse JS and check for unused functions
    return js.length * 0.2; // Estimate 20% unused
  }

  /**
   * Calculate optimized size
   */
  private calculateOptimizedSize(analysis: DOMAnalysis): number {
    let optimizedSize = analysis.totalSize;

    // Reduce size based on unused elements
    optimizedSize -= analysis.unusedElements * 50; // Estimate 50 bytes per unused element

    // Reduce size based on duplicate elements
    optimizedSize -= analysis.duplicateElements * 30; // Estimate 30 bytes per duplicate

    // Reduce size based on oversized images
    optimizedSize -= analysis.oversizedImages * 1000; // Estimate 1KB per oversized image

    // Reduce size based on unused CSS
    optimizedSize -= analysis.unusedCSS;

    // Reduce size based on unused JavaScript
    optimizedSize -= analysis.unusedJavaScript;

    return Math.max(optimizedSize, analysis.totalSize * 0.1); // Minimum 10% of original size
  }

  /**
   * Calculate optimization score (0-100)
   */
  private calculateOptimizationScore(analysis: DOMAnalysis): number {
    const spaceSavedPercentage = (analysis.spaceSaved / analysis.totalSize) * 100;
    const unusedElementsPercentage = (analysis.unusedElements / analysis.totalElements) * 100;
    const duplicateElementsPercentage = (analysis.duplicateElements / analysis.totalElements) * 100;

    let score = 0;

    // Space saved contributes 40% to the score
    score += Math.min(spaceSavedPercentage * 0.4, 40);

    // Unused elements contribute 30% to the score
    score += Math.min(unusedElementsPercentage * 0.3, 30);

    // Duplicate elements contribute 20% to the score
    score += Math.min(duplicateElementsPercentage * 0.2, 20);

    // Other factors contribute 10% to the score
    score += Math.min((analysis.oversizedImages + analysis.unusedCSS + analysis.unusedJavaScript) / 1000 * 10, 10);

    return Math.min(Math.round(score), 100);
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(analysis: DOMAnalysis): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Unused elements recommendation
    if (analysis.unusedElements > 0) {
      recommendations.push({
        type: 'element',
        severity: analysis.unusedElements > 10 ? 'high' : 'medium',
        description: `Remove ${analysis.unusedElements} unused elements`,
        potentialSavings: analysis.unusedElements * 50
      });
    }

    // Duplicate elements recommendation
    if (analysis.duplicateElements > 0) {
      recommendations.push({
        type: 'element',
        severity: analysis.duplicateElements > 5 ? 'medium' : 'low',
        description: `Consolidate ${analysis.duplicateElements} duplicate elements`,
        potentialSavings: analysis.duplicateElements * 30
      });
    }

    // Oversized images recommendation
    if (analysis.oversizedImages > 0) {
      recommendations.push({
        type: 'image',
        severity: 'high',
        description: `Optimize ${analysis.oversizedImages} oversized images`,
        potentialSavings: analysis.oversizedImages * 1000
      });
    }

    // Unused CSS recommendation
    if (analysis.unusedCSS > 0) {
      recommendations.push({
        type: 'css',
        severity: analysis.unusedCSS > 5000 ? 'high' : 'medium',
        description: `Remove ${Math.round(analysis.unusedCSS / 1000)}KB of unused CSS`,
        potentialSavings: analysis.unusedCSS
      });
    }

    // Unused JavaScript recommendation
    if (analysis.unusedJavaScript > 0) {
      recommendations.push({
        type: 'js',
        severity: analysis.unusedJavaScript > 10000 ? 'high' : 'medium',
        description: `Remove ${Math.round(analysis.unusedJavaScript / 1000)}KB of unused JavaScript`,
        potentialSavings: analysis.unusedJavaScript
      });
    }

    return recommendations;
  }

  /**
   * Generate proof hash for optimization
   */
  public generateProofHash(analysis: DOMAnalysis): string {
    const proofData = {
      url: analysis.url,
      totalElements: analysis.totalElements,
      spaceSaved: analysis.spaceSaved,
      optimizationScore: analysis.optimizationScore,
      timestamp: Date.now()
    };

    const proofString = JSON.stringify(proofData);
    return ethers.keccak256(ethers.toUtf8Bytes(proofString));
  }

  /**
   * Determine biome type based on URL and content
   */
  public determineBiomeType(url: string, analysis: DOMAnalysis): string {
    const domain = new URL(url).hostname.toLowerCase();

    // E-commerce
    if (domain.includes('shop') || domain.includes('store') || domain.includes('buy')) {
      return 'E-commerce';
    }

    // Corporate
    if (domain.includes('corp') || domain.includes('company') || domain.includes('business')) {
      return 'Corporate';
    }

    // Blog
    if (domain.includes('blog') || domain.includes('news') || domain.includes('article')) {
      return 'Blog';
    }

    // Portfolio
    if (domain.includes('portfolio') || domain.includes('personal') || domain.includes('about')) {
      return 'Portfolio';
    }

    // Social Media
    if (domain.includes('social') || domain.includes('community') || domain.includes('forum')) {
      return 'Social Media';
    }

    // Default
    return 'General';
  }

  /**
   * Create optimization result
   */
  public createOptimizationResult(
    url: string,
    analysis: DOMAnalysis
  ): OptimizationResult {
    const proofHash = this.generateProofHash(analysis);
    const biomeType = this.determineBiomeType(url, analysis);

    const result: OptimizationResult = {
      url,
      analysis,
      proofHash,
      biomeType,
      timestamp: Date.now(),
      metadata: JSON.stringify({
        recommendations: analysis.recommendations,
        optimizationScore: analysis.optimizationScore
      })
    };

    this.optimizationHistory.push(result);
    return result;
  }

  /**
   * Get optimization history
   */
  public getOptimizationHistory(): OptimizationResult[] {
    return [...this.optimizationHistory];
  }

  /**
   * Get optimization statistics
   */
  public getOptimizationStats(): {
    totalOptimizations: number;
    totalSpaceSaved: number;
    averageScore: number;
    topBiomes: { [key: string]: number };
  } {
    const totalOptimizations = this.optimizationHistory.length;
    const totalSpaceSaved = this.optimizationHistory.reduce(
      (sum, result) => sum + result.analysis.spaceSaved,
      0
    );
    const averageScore = totalOptimizations > 0
      ? this.optimizationHistory.reduce((sum, result) => sum + result.analysis.optimizationScore, 0) / totalOptimizations
      : 0;

    const topBiomes: { [key: string]: number } = {};
    this.optimizationHistory.forEach(result => {
      topBiomes[result.biomeType] = (topBiomes[result.biomeType] || 0) + 1;
    });

    return {
      totalOptimizations,
      totalSpaceSaved,
      averageScore,
      topBiomes
    };
  }
}
