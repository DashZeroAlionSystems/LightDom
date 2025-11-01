/**
 * ML-Enhanced Web Crawler System
 * Uses machine learning for intelligent crawling and optimization detection
 */

import { MLAnalysisEngine, DOMAnalysisResult } from './MLAnalysisEngine';
import { RealWebCrawlerSystem } from '../crawler/RealWebCrawlerSystem';
import { logger } from '../utils/Logger';
import * as tf from '@tensorflow/tfjs';

export interface MLCrawlerConfig {
  maxConcurrency: number;
  requestDelay: number;
  maxDepth: number;
  maxPages: number;
  mlEnabled: boolean;
  optimizationThreshold: number;
  learningRate: number;
  modelUpdateInterval: number;
}

export interface CrawlResult {
  url: string;
  analysis: DOMAnalysisResult;
  optimizationScore: number;
  mlInsights: any;
  timestamp: number;
  processingTime: number;
}

export interface CrawlerMetrics {
  totalUrls: number;
  processedUrls: number;
  optimizationOpportunities: number;
  averageScore: number;
  mlPredictions: number;
  processingTime: number;
}

export class MLEnhancedWebCrawler {
  private mlEngine: MLAnalysisEngine;
  private baseCrawler: RealWebCrawlerSystem;
  private config: MLCrawlerConfig;
  private results: Map<string, CrawlResult> = new Map();
  private metrics: CrawlerMetrics;
  private isRunning: boolean = false;
  private modelUpdateTimer?: NodeJS.Timeout;

  constructor(config: Partial<MLCrawlerConfig> = {}) {
    this.config = {
      maxConcurrency: 3,
      requestDelay: 1000,
      maxDepth: 2,
      maxPages: 100,
      mlEnabled: true,
      optimizationThreshold: 60,
      learningRate: 0.001,
      modelUpdateInterval: 300000, // 5 minutes
      ...config
    };

    this.mlEngine = new MLAnalysisEngine();
    this.baseCrawler = new RealWebCrawlerSystem({
      maxConcurrency: this.config.maxConcurrency,
      requestDelay: this.config.requestDelay
    });

    this.metrics = {
      totalUrls: 0,
      processedUrls: 0,
      optimizationOpportunities: 0,
      averageScore: 0,
      mlPredictions: 0,
      processingTime: 0
    };
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing ML-Enhanced Web Crawler...');

      if (this.config.mlEnabled) {
        await this.mlEngine.initialize();
        logger.info('ML Engine initialized');
      }

      await this.baseCrawler.initialize();
      logger.info('Base crawler initialized');

      // Start model update timer
      if (this.config.mlEnabled) {
        this.startModelUpdates();
      }

      logger.info('ML-Enhanced Web Crawler initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize ML-Enhanced Web Crawler', error);
      throw error;
    }
  }

  async startCrawling(startUrls: string[]): Promise<void> {
    if (this.isRunning) {
      throw new Error('Crawler is already running');
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info('Starting ML-enhanced web crawling', { startUrls });

      // Convert URLs to crawl tasks with ML prioritization
      const prioritizedUrls = await this.prioritizeUrls(startUrls);

      // Start crawling with ML analysis
      await this.crawlWithMLAnalysis(prioritizedUrls);

      const totalTime = Date.now() - startTime;
      this.metrics.processingTime = totalTime;

      logger.info('ML-enhanced web crawling completed', {
        totalUrls: this.metrics.totalUrls,
        processedUrls: this.metrics.processedUrls,
        optimizationOpportunities: this.metrics.optimizationOpportunities,
        averageScore: this.metrics.averageScore,
        totalTime
      });

    } catch (error) {
      logger.error('ML-enhanced web crawling failed', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  private async prioritizeUrls(urls: string[]): Promise<string[]> {
    if (!this.config.mlEnabled) {
      return urls;
    }

    try {
      // Use ML to predict which URLs are most likely to have optimization opportunities
      const predictions = await Promise.all(
        urls.map(async (url) => {
          const prediction = await this.predictOptimizationPotential(url);
          return { url, score: prediction };
        })
      );

      // Sort by predicted optimization potential
      predictions.sort((a, b) => b.score - a.score);

      logger.info('URLs prioritized by ML prediction', {
        topUrls: predictions.slice(0, 5).map(p => ({ url: p.url, score: p.score }))
      });

      return predictions.map(p => p.url);

    } catch (error) {
      logger.warn('Failed to prioritize URLs with ML, using original order', error);
      return urls;
    }
  }

  private async predictOptimizationPotential(url: string): Promise<number> {
    try {
      // Quick analysis to predict optimization potential
      // This could be enhanced with a lightweight ML model
      const domain = new URL(url).hostname;

      // Simple heuristics for now (could be replaced with ML model)
      let score = 50; // Base score

      // Popular sites often have more optimization opportunities
      if (domain.includes('google') || domain.includes('facebook') || domain.includes('amazon')) {
        score += 20;
      }

      // E-commerce sites often have complex DOMs
      if (domain.includes('shop') || domain.includes('store') || domain.includes('buy')) {
        score += 15;
      }

      // News sites often have performance issues
      if (domain.includes('news') || domain.includes('times') || domain.includes('post')) {
        score += 10;
      }

      return Math.min(100, score);

    } catch (error) {
      logger.warn(`Failed to predict optimization potential for ${url}`, error);
      return 50; // Default score
    }
  }

  private async crawlWithMLAnalysis(urls: string[]): Promise<void> {
    const processed = new Set<string>();
    const queue: { url: string; depth: number }[] = urls.map(url => ({ url, depth: 0 }));

    while (queue.length > 0 && processed.size < this.config.maxPages) {
      // Process URLs in batches based on concurrency
      const batch = queue.splice(0, this.config.maxConcurrency);

      const batchPromises = batch.map(async ({ url, depth }) => {
        if (processed.has(url)) return;

        try {
          const result = await this.analyzeUrlWithML(url);
          processed.add(url);
          this.results.set(url, result);
          this.updateMetrics(result);

          // Add discovered links to queue if within depth limit
          if (depth < this.config.maxDepth) {
            const newUrls = await this.discoverLinks(url, result);
            const filteredUrls = newUrls
              .filter(newUrl => !processed.has(newUrl))
              .map(newUrl => ({ url: newUrl, depth: depth + 1 }));

            queue.push(...filteredUrls.slice(0, 10)); // Limit new URLs per page
          }

          logger.info(`Processed ${url}`, {
            score: result.optimizationScore,
            opportunities: result.analysis.optimizations.length,
            processingTime: result.processingTime
          });

        } catch (error) {
          logger.error(`Failed to process ${url}`, error);
        }
      });

      await Promise.all(batchPromises);

      // Respect rate limiting
      if (queue.length > 0) {
        await this.delay(this.config.requestDelay);
      }
    }
  }

  private async analyzeUrlWithML(url: string): Promise<CrawlResult> {
    const startTime = Date.now();

    try {
      // Fetch page content
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'LightDom-ML-Crawler/1.0'
        },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      // Perform ML-powered analysis
      const analysis = await this.mlEngine.analyzeDOM(url, html);

      const processingTime = Date.now() - startTime;

      const result: CrawlResult = {
        url,
        analysis,
        optimizationScore: analysis.mlInsights.optimizationScore,
        mlInsights: analysis.mlInsights,
        timestamp: Date.now(),
        processingTime
      };

      return result;

    } catch (error) {
      logger.error(`ML analysis failed for ${url}`, error);

      // Return basic result on failure
      const processingTime = Date.now() - startTime;
      return {
        url,
        analysis: {
          url,
          structure: {
            elements: [],
            layout: { viewport: { width: 1920, height: 1080 }, scrollHeight: 0, hasFixedElements: false, hasStickyElements: false, layoutComplexity: 0 },
            styles: { totalRules: 0, unusedRules: 0, criticalCSS: '', fontFamilies: [], colorPalette: [] },
            scripts: { totalScripts: 0, inlineScripts: 0, externalScripts: [], totalSize: 0, executionTime: 0 }
          },
          optimizations: [],
          performance: { lcp: 0, fid: 0, cls: 0, fcp: 0, ttfb: 0, domContentLoaded: 0, loadComplete: 0 },
          mlInsights: { optimizationScore: 0, patternRecognition: [], anomalyDetection: [], predictivePerformance: { predictedLCP: 0, predictedFID: 0, predictedCLS: 0, confidence: 0, factors: [] }, recommendations: [] },
          timestamp: Date.now()
        },
        optimizationScore: 0,
        mlInsights: {},
        timestamp: Date.now(),
        processingTime
      };
    }
  }

  private async discoverLinks(url: string, result: CrawlResult): Promise<string[]> {
    try {
      const response = await fetch(url);
      const html = await response.text();

      const links: string[] = [];
      const baseUrl = new URL(url);

      // Extract links using regex
      const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
      let match;

      while ((match = linkRegex.exec(html)) !== null) {
        try {
          const href = match[1];
          const absoluteUrl = new URL(href, baseUrl).href;

          // Only include same-domain links
          if (new URL(absoluteUrl).hostname === baseUrl.hostname) {
            links.push(absoluteUrl);
          }
        } catch (error) {
          // Skip invalid URLs
        }
      }

      return links.slice(0, 20); // Limit links per page

    } catch (error) {
      logger.warn(`Failed to discover links for ${url}`, error);
      return [];
    }
  }

  private updateMetrics(result: CrawlResult): void {
    this.metrics.processedUrls++;
    this.metrics.totalUrls = this.results.size;

    if (result.optimizationScore > this.config.optimizationThreshold) {
      this.metrics.optimizationOpportunities++;
    }

    // Update rolling average
    const totalScore = this.metrics.averageScore * (this.metrics.processedUrls - 1) + result.optimizationScore;
    this.metrics.averageScore = totalScore / this.metrics.processedUrls;

    if (this.config.mlEnabled) {
      this.metrics.mlPredictions++;
    }
  }

  private startModelUpdates(): void {
    this.modelUpdateTimer = setInterval(async () => {
      try {
        await this.updateMLModels();
      } catch (error) {
        logger.error('Failed to update ML models', error);
      }
    }, this.config.modelUpdateInterval);
  }

  private async updateMLModels(): Promise<void> {
    if (this.results.size < 10) return; // Need minimum data for updates

    logger.info('Updating ML models with new crawl data');

    // Extract training data from recent results
    const recentResults = Array.from(this.results.values())
      .slice(-50) // Last 50 results
      .filter(result => result.analysis.optimizations.length > 0);

    if (recentResults.length === 0) return;

    // Update models with new data
    // This would involve retraining or fine-tuning the ML models
    logger.info(`Updating ML models with ${recentResults.length} new data points`);
  }

  async stopCrawling(): Promise<void> {
    this.isRunning = false;

    if (this.modelUpdateTimer) {
      clearInterval(this.modelUpdateTimer);
    }

    await this.baseCrawler.stopCrawling();
    logger.info('ML-Enhanced Web Crawler stopped');
  }

  getResults(): Map<string, CrawlResult> {
    return new Map(this.results);
  }

  getMetrics(): CrawlerMetrics {
    return { ...this.metrics };
  }

  getTopOptimizationOpportunities(limit: number = 10): CrawlResult[] {
    return Array.from(this.results.values())
      .filter(result => result.optimizationScore > this.config.optimizationThreshold)
      .sort((a, b) => b.optimizationScore - a.optimizationScore)
      .slice(0, limit);
  }

  getMLInsights(): any {
    const results = Array.from(this.results.values());

    return {
      totalAnalyzed: results.length,
      averageScore: results.reduce((sum, r) => sum + r.optimizationScore, 0) / results.length,
      topPatterns: this.extractTopPatterns(results),
      performancePredictions: this.aggregatePredictions(results),
      anomalySummary: this.summarizeAnomalies(results)
    };
  }

  private extractTopPatterns(results: CrawlResult[]): any[] {
    const patternCounts: Map<string, number> = new Map();

    results.forEach(result => {
      result.analysis.mlInsights.patternRecognition.forEach(pattern => {
        const count = patternCounts.get(pattern.pattern) || 0;
        patternCounts.set(pattern.pattern, count + 1);
      });
    });

    return Array.from(patternCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern, count]) => ({ pattern, count }));
  }

  private aggregatePredictions(results: CrawlResult[]): any {
    const predictions = results
      .filter(r => r.analysis.mlInsights.predictivePerformance)
      .map(r => r.analysis.mlInsights.predictivePerformance);

    if (predictions.length === 0) return null;

    return {
      averagePredictedLCP: predictions.reduce((sum, p) => sum + p.predictedLCP, 0) / predictions.length,
      averagePredictedFID: predictions.reduce((sum, p) => sum + p.predictedFID, 0) / predictions.length,
      averagePredictedCLS: predictions.reduce((sum, p) => sum + p.predictedCLS, 0) / predictions.length,
      averageConfidence: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
    };
  }

  private summarizeAnomalies(results: CrawlResult[]): any {
    const anomalyCounts: Map<string, number> = new Map();

    results.forEach(result => {
      result.analysis.mlInsights.anomalyDetection.forEach(anomaly => {
        const count = anomalyCounts.get(anomaly.type) || 0;
        anomalyCounts.set(anomaly.type, count + 1);
      });
    });

    return {
      totalAnomalies: Array.from(anomalyCounts.values()).reduce((sum, count) => sum + count, 0),
      byType: Array.from(anomalyCounts.entries()).map(([type, count]) => ({ type, count }))
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default MLEnhancedWebCrawler;