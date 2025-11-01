/**
 * Real-time ML Processing for Web Crawler Integration
 * Provides live optimization suggestions and performance monitoring
 */

import { LightDomMLEngine } from './LightDomMLEngine';
import { DOMComputerVisionAnalyzer } from './DOMComputerVisionAnalyzer';
import {
  RealTimeMLProcessing,
  MLServiceStatus,
  OptimizationSuggestion,
  PerformancePrediction
} from '@/types/ml';

export class RealTimeMLProcessor {
  private mlEngine: LightDomMLEngine;
  private visionAnalyzer: DOMComputerVisionAnalyzer;
  private config: RealTimeMLProcessing;
  private processingQueue: ProcessingTask[] = [];
  private activeTasks: Map<string, ProcessingTask> = new Map();
  private modelCache: Map<string, CachedModelResult> = new Map();
  private performanceMonitor: PerformanceMonitor;

  constructor(config: Partial<RealTimeMLProcessing> = {}) {
    this.config = {
      isEnabled: true,
      processingInterval: 1000, // 1 second
      batchSize: 10,
      models: {
        domAnalysis: true,
        performancePrediction: true,
        anomalyDetection: true,
        patternRecognition: true
      },
      caching: {
        enabled: true,
        maxCacheSize: 1000,
        cacheExpiration: 300000 // 5 minutes
      },
      ...config
    };

    this.mlEngine = new LightDomMLEngine();
    this.visionAnalyzer = new DOMComputerVisionAnalyzer();
    this.performanceMonitor = new PerformanceMonitor();

    if (this.config.isEnabled) {
      this.startProcessing();
    }
  }

  /**
   * Start real-time processing
   */
  private startProcessing() {
    setInterval(() => {
      this.processBatch();
    }, this.config.processingInterval);
  }

  /**
   * Add DOM data for real-time processing
   */
  async addToProcessingQueue(url: string, domTree: any, stylesheets: any[], scripts: any[]): Promise<string> {
    const taskId = this.generateTaskId();
    const task: ProcessingTask = {
      id: taskId,
      url,
      domTree,
      stylesheets,
      scripts,
      timestamp: Date.now(),
      status: 'queued',
      priority: this.calculatePriority(domTree, stylesheets, scripts)
    };

    this.processingQueue.push(task);
    this.processingQueue.sort((a, b) => b.priority - a.priority); // Higher priority first

    return taskId;
  }

  /**
   * Process a batch of tasks
   */
  private async processBatch() {
    if (this.processingQueue.length === 0) return;

    const batchSize = Math.min(this.config.batchSize, this.processingQueue.length);
    const batch = this.processingQueue.splice(0, batchSize);

    const promises = batch.map(task => this.processTask(task));
    await Promise.allSettled(promises);
  }

  /**
   * Process individual task
   */
  private async processTask(task: ProcessingTask): Promise<void> {
    try {
      task.status = 'processing';
      this.activeTasks.set(task.id, task);

      // Check cache first
      const cacheKey = this.generateCacheKey(task.url, task.domTree);
      let cachedResult = this.getCachedResult(cacheKey);

      if (!cachedResult) {
        // Run ML analysis
        const results = await this.runMLAnalysis(task);
        cachedResult = {
          key: cacheKey,
          results,
          timestamp: Date.now()
        };

        if (this.config.caching.enabled) {
          this.setCachedResult(cachedResult);
        }
      }

      // Emit results
      this.emitResults(task, cachedResult.results);

      task.status = 'completed';
      task.results = cachedResult.results;

    } catch (error) {
      console.error(`ML processing failed for ${task.url}:`, error);
      task.status = 'failed';
      task.error = error as Error;
    } finally {
      this.activeTasks.delete(task.id);
    }
  }

  /**
   * Run comprehensive ML analysis
   */
  private async runMLAnalysis(task: ProcessingTask): Promise<MLAnalysisResults> {
    const { domTree, stylesheets, scripts } = task;

    // Run all enabled models in parallel
    const promises = [];

    if (this.config.models.domAnalysis) {
      promises.push(this.mlEngine.analyzeDOMStructure(domTree, stylesheets, scripts));
    }

    if (this.config.models.performancePrediction) {
      promises.push(this.mlEngine.predictPerformance(this.extractFeatures(domTree, stylesheets, scripts)));
    }

    if (this.config.models.anomalyDetection) {
      promises.push(this.mlEngine.detectAnomalies(this.extractFeatures(domTree, stylesheets, scripts)));
    }

    if (this.config.models.patternRecognition) {
      promises.push(this.mlEngine.recognizePatterns(this.extractFeatures(domTree, stylesheets, scripts)));
    }

    // Computer vision analysis
    promises.push(this.visionAnalyzer.analyzeLayout(domTree, stylesheets));

    const results = await Promise.all(promises);

    return {
      domAnalysis: this.config.models.domAnalysis ? results.shift() : null,
      performancePrediction: this.config.models.performancePrediction ? results.shift() : null,
      anomalyDetection: this.config.models.anomalyDetection ? results.shift() : null,
      patternRecognition: this.config.models.patternRecognition ? results.shift() : null,
      computerVision: results.shift(),
      timestamp: Date.now()
    };
  }

  /**
   * Get real-time optimization suggestions
   */
  async getOptimizationSuggestions(url: string): Promise<OptimizationSuggestion[]> {
    const task = Array.from(this.activeTasks.values()).find(t => t.url === url);
    if (task && task.results) {
      return this.consolidateSuggestions(task.results);
    }

    // Check cache
    const cacheKey = this.generateCacheKey(url, null);
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return this.consolidateSuggestions(cached.results);
    }

    return [];
  }

  /**
   * Get performance monitoring data
   */
  async getPerformanceMetrics(url?: string): Promise<PerformanceMetrics> {
    if (url) {
      const task = Array.from(this.activeTasks.values()).find(t => t.url === url);
      if (task && task.results?.performancePrediction) {
        return {
          current: task.results.performancePrediction,
          historical: this.performanceMonitor.getHistoricalData(url),
          trends: this.performanceMonitor.calculateTrends(url)
        };
      }
    }

    return this.performanceMonitor.getGlobalMetrics();
  }

  /**
   * Get ML service status
   */
  getServiceStatus(): MLServiceStatus {
    return {
      modelsLoaded: this.mlEngine && this.visionAnalyzer ? true : false,
      trainingInProgress: false, // Could be extended to track training status
      lastTrainingTime: Date.now() - 3600000, // Mock: 1 hour ago
      activePredictions: this.activeTasks.size,
      cacheHitRate: this.calculateCacheHitRate(),
      memoryUsage: this.estimateMemoryUsage(),
      errorRate: this.calculateErrorRate()
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<RealTimeMLProcessing>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Helper methods
   */
  private generateTaskId(): string {
    return `ml_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculatePriority(domTree: any, stylesheets: any[], scripts: any[]): number {
    // Calculate priority based on complexity and potential optimization opportunities
    const elementCount = domTree.querySelectorAll ? domTree.querySelectorAll('*').length : 0;
    const cssRules = stylesheets.reduce((sum, sheet) => sum + (sheet.rules?.length || 0), 0);
    const jsSize = scripts.reduce((sum, script) => sum + (script.size || 0), 0);

    // Higher priority for complex pages with more optimization potential
    return (elementCount * 0.1) + (cssRules * 0.05) + (jsSize * 0.001);
  }

  private generateCacheKey(url: string, domTree: any): string {
    // Create a cache key based on URL and DOM structure hash
    const domHash = domTree ? this.simpleHash(JSON.stringify(domTree)) : '';
    return `${url}_${domHash}`;
  }

  private getCachedResult(key: string): CachedModelResult | null {
    const cached = this.modelCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.config.caching.cacheExpiration) {
      return cached;
    }
    if (cached) {
      this.modelCache.delete(key); // Expired
    }
    return null;
  }

  private setCachedResult(result: CachedModelResult) {
    // Manage cache size
    if (this.modelCache.size >= this.config.caching.maxCacheSize) {
      const oldestKey = Array.from(this.modelCache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0][0];
      this.modelCache.delete(oldestKey);
    }

    this.modelCache.set(result.key, result);
  }

  private extractFeatures(domTree: any, stylesheets: any[], scripts: any[]): number[] {
    // Simplified feature extraction - in practice would be more comprehensive
    const features = [];

    features.push(domTree.querySelectorAll ? domTree.querySelectorAll('*').length : 0);
    features.push(stylesheets.length);
    features.push(scripts.length);

    // Add more features as needed
    while (features.length < 30) {
      features.push(0);
    }

    return features.slice(0, 30);
  }

  private consolidateSuggestions(results: MLAnalysisResults): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    if (results.domAnalysis?.recommendedOptimizations) {
      suggestions.push(...results.domAnalysis.recommendedOptimizations);
    }

    if (results.patternRecognition?.suggestions) {
      results.patternRecognition.suggestions.forEach(suggestion => {
        suggestions.push({
          type: 'performance',
          priority: 'medium',
          description: suggestion,
          potentialSavings: 'Variable'
        });
      });
    }

    if (results.computerVision?.suggestions) {
      results.computerVision.suggestions.forEach(suggestion => {
        suggestions.push({
          type: 'accessibility',
          priority: 'medium',
          description: suggestion,
          potentialSavings: 'Improved UX'
        });
      });
    }

    // Remove duplicates and sort by priority
    const uniqueSuggestions = this.removeDuplicateSuggestions(suggestions);
    return this.sortSuggestionsByPriority(uniqueSuggestions);
  }

  private removeDuplicateSuggestions(suggestions: OptimizationSuggestion[]): OptimizationSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = `${suggestion.type}_${suggestion.description}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private sortSuggestionsByPriority(suggestions: OptimizationSuggestion[]): OptimizationSuggestion[] {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  private emitResults(task: ProcessingTask, results: MLAnalysisResults) {
    // Emit results via WebSocket or callback
    // This would integrate with the existing WebSocket system in api-server-express.js
    const event = {
      type: 'ml_analysis_complete',
      taskId: task.id,
      url: task.url,
      results,
      timestamp: Date.now()
    };

    // In a real implementation, this would emit to connected clients
    console.log('ML Analysis Complete:', event);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private calculateCacheHitRate(): number {
    // Simplified calculation - in practice would track hits/misses
    return 0.85; // Mock 85% hit rate
  }

  private estimateMemoryUsage(): number {
    // Estimate memory usage of models and cache
    const modelMemory = 50 * 1024 * 1024; // ~50MB for models
    const cacheMemory = this.modelCache.size * 10 * 1024; // ~10KB per cached result
    return modelMemory + cacheMemory;
  }

  private calculateErrorRate(): number {
    // Calculate error rate from recent tasks
    const recentTasks = Array.from(this.activeTasks.values())
      .filter(task => task.status === 'failed')
      .length;
    const totalTasks = this.activeTasks.size + recentTasks;
    return totalTasks > 0 ? recentTasks / totalTasks : 0;
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.mlEngine.dispose();
    this.visionAnalyzer.dispose();
    this.modelCache.clear();
    this.activeTasks.clear();
    this.processingQueue = [];
  }
}

/**
 * Performance Monitor for real-time metrics
 */
class PerformanceMonitor {
  private metrics: Map<string, PerformanceData[]> = new Map();
  private globalMetrics: PerformanceData[] = [];

  recordMetrics(url: string, metrics: PerformancePrediction) {
    if (!this.metrics.has(url)) {
      this.metrics.set(url, []);
    }

    const data: PerformanceData = {
      ...metrics,
      timestamp: Date.now()
    };

    this.metrics.get(url)!.push(data);
    this.globalMetrics.push(data);

    // Keep only recent data (last 100 entries per URL, 1000 globally)
    if (this.metrics.get(url)!.length > 100) {
      this.metrics.set(url, this.metrics.get(url)!.slice(-100));
    }
    if (this.globalMetrics.length > 1000) {
      this.globalMetrics = this.globalMetrics.slice(-1000);
    }
  }

  getHistoricalData(url: string): PerformanceData[] {
    return this.metrics.get(url) || [];
  }

  calculateTrends(url: string): PerformanceTrend {
    const data = this.getHistoricalData(url);
    if (data.length < 2) return { loadTime: 0, renderTime: 0, memoryUsage: 0 };

    const recent = data.slice(-10); // Last 10 measurements
    const older = data.slice(-20, -10); // Previous 10 measurements

    const calculateTrend = (recentValues: number[], olderValues: number[]) => {
      const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
      const olderAvg = olderValues.reduce((sum, val) => sum + val, 0) / olderValues.length;
      return ((recentAvg - olderAvg) / olderAvg) * 100; // Percentage change
    };

    return {
      loadTime: calculateTrend(recent.map(d => d.loadTime), older.map(d => d.loadTime)),
      renderTime: calculateTrend(recent.map(d => d.renderTime), older.map(d => d.renderTime)),
      memoryUsage: calculateTrend(recent.map(d => d.memoryUsage), older.map(d => d.memoryUsage))
    };
  }

  getGlobalMetrics(): PerformanceMetrics {
    if (this.globalMetrics.length === 0) {
      return {
        current: {
          loadTime: 0,
          renderTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          networkRequests: 0,
          confidence: 0
        },
        historical: [],
        trends: { loadTime: 0, renderTime: 0, memoryUsage: 0 }
      };
    }

    const recent = this.globalMetrics.slice(-1)[0];
    const historical = this.globalMetrics.slice(-50); // Last 50 global measurements
    const trends = this.calculateGlobalTrends();

    return { current: recent, historical, trends };
  }

  private calculateGlobalTrends(): PerformanceTrend {
    if (this.globalMetrics.length < 20) {
      return { loadTime: 0, renderTime: 0, memoryUsage: 0 };
    }

    const midpoint = Math.floor(this.globalMetrics.length / 2);
    const recent = this.globalMetrics.slice(midpoint);
    const older = this.globalMetrics.slice(0, midpoint);

    const calculateTrend = (recentData: PerformanceData[], olderData: PerformanceData[], key: keyof PerformancePrediction) => {
      const recentAvg = recentData.reduce((sum, d) => sum + d[key], 0) / recentData.length;
      const olderAvg = olderData.reduce((sum, d) => sum + d[key], 0) / olderData.length;
      return olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
    };

    return {
      loadTime: calculateTrend(recent, older, 'loadTime'),
      renderTime: calculateTrend(recent, older, 'renderTime'),
      memoryUsage: calculateTrend(recent, older, 'memoryUsage')
    };
  }
}

/**
 * Type definitions for internal use
 */
interface ProcessingTask {
  id: string;
  url: string;
  domTree: any;
  stylesheets: any[];
  scripts: any[];
  timestamp: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  priority: number;
  results?: MLAnalysisResults;
  error?: Error;
}

interface CachedModelResult {
  key: string;
  results: MLAnalysisResults;
  timestamp: number;
}

interface MLAnalysisResults {
  domAnalysis: any;
  performancePrediction: PerformancePrediction | null;
  anomalyDetection: any;
  patternRecognition: any;
  computerVision: any;
  timestamp: number;
}

interface PerformanceData extends PerformancePrediction {
  timestamp: number;
}

interface PerformanceMetrics {
  current: PerformancePrediction;
  historical: PerformanceData[];
  trends: PerformanceTrend;
}

interface PerformanceTrend {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
}

export default RealTimeMLProcessor;