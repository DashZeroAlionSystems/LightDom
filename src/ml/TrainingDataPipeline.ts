/**
 * Training Data Pipeline for ML Models
 * Collects, processes, and manages training data from web crawler
 */

import { TrainingDataPoint, TrainingPipelineConfig } from '@/types/ml';
import { RealTimeMLProcessor } from './RealTimeMLProcessor';

export class TrainingDataPipeline {
  private config: TrainingPipelineConfig;
  private dataBuffer: TrainingDataPoint[] = [];
  private dataSources: Map<string, DataSource> = new Map();
  private preprocessingQueue: TrainingDataPoint[] = [];
  private trainingQueue: TrainingDataPoint[] = [];
  private mlProcessor: RealTimeMLProcessor;
  private continuousLearningActive = false;

  constructor(mlProcessor: RealTimeMLProcessor, config: Partial<TrainingPipelineConfig> = {}) {
    this.mlProcessor = mlProcessor;
    this.config = {
      dataCollection: {
        enabled: true,
        sources: ['crawler', 'user_feedback', 'performance_monitoring'],
        samplingRate: 0.1 // 10% sampling rate
      },
      preprocessing: {
        normalization: true,
        featureSelection: true,
        outlierRemoval: true
      },
      training: {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        earlyStopping: true
      },
      continuousLearning: {
        enabled: true,
        updateInterval: 3600000, // 1 hour
        minDataPoints: 1000
      },
      ...config
    };

    this.initializeDataSources();
    if (this.config.continuousLearning.enabled) {
      this.startContinuousLearning();
    }
  }

  /**
   * Initialize data sources
   */
  private initializeDataSources() {
    // Web crawler data source
    this.dataSources.set('crawler', {
      name: 'crawler',
      type: 'realtime',
      collectData: async () => this.collectFromCrawler()
    });

    // User feedback data source
    this.dataSources.set('user_feedback', {
      name: 'user_feedback',
      type: 'event',
      collectData: async () => this.collectUserFeedback()
    });

    // Performance monitoring data source
    this.dataSources.set('performance_monitoring', {
      name: 'performance_monitoring',
      type: 'metrics',
      collectData: async () => this.collectPerformanceData()
    });
  }

  /**
   * Add data point to the pipeline
   */
  async addDataPoint(dataPoint: TrainingDataPoint) {
    if (!this.config.dataCollection.enabled) return;

    // Apply sampling rate
    if (Math.random() > this.config.dataCollection.samplingRate) return;

    // Validate data point
    if (!this.validateDataPoint(dataPoint)) {
      console.warn('Invalid data point:', dataPoint);
      return;
    }

    this.dataBuffer.push({
      ...dataPoint,
      timestamp: Date.now()
    });

    // Process buffer if it gets too large
    if (this.dataBuffer.length >= 100) {
      await this.processDataBuffer();
    }
  }

  /**
   * Collect data from web crawler
   */
  private async collectFromCrawler(): Promise<TrainingDataPoint[]> {
    const dataPoints: TrainingDataPoint[] = [];

    try {
      // Get recent crawler data from the ML processor
      const recentUrls = this.getRecentProcessedUrls();

      for (const url of recentUrls) {
        const metrics = await this.mlProcessor.getPerformanceMetrics(url);
        const suggestions = await this.mlProcessor.getOptimizationSuggestions(url);

        if (metrics.current && suggestions.length > 0) {
          dataPoints.push({
            type: 'performance',
            features: this.extractPerformanceFeatures(metrics),
            labels: [metrics.current.loadTime, metrics.current.renderTime],
            metrics: [metrics.current.loadTime, metrics.current.renderTime, metrics.current.memoryUsage],
            timestamp: Date.now(),
            source: 'crawler'
          });
        }
      }
    } catch (error) {
      console.error('Failed to collect crawler data:', error);
    }

    return dataPoints;
  }

  /**
   * Collect user feedback data
   */
  private async collectUserFeedback(): Promise<TrainingDataPoint[]> {
    // In a real implementation, this would collect from user feedback APIs
    // For now, return mock data
    return [
      {
        type: 'performance',
        features: [0.8, 0.7, 0.9], // satisfaction scores
        labels: [1], // positive feedback
        timestamp: Date.now(),
        source: 'user_feedback'
      }
    ];
  }

  /**
   * Collect performance monitoring data
   */
  private async collectPerformanceData(): Promise<TrainingDataPoint[]> {
    const dataPoints: TrainingDataPoint[] = [];

    try {
      const globalMetrics = await this.mlProcessor.getPerformanceMetrics();

      if (globalMetrics.historical.length > 0) {
        globalMetrics.historical.forEach(metric => {
          dataPoints.push({
            type: 'performance',
            features: [
              metric.loadTime,
              metric.renderTime,
              metric.memoryUsage,
              metric.cpuUsage,
              metric.networkRequests
            ],
            labels: [metric.loadTime], // Regression target
            metrics: [metric.loadTime, metric.renderTime, metric.memoryUsage],
            timestamp: metric.timestamp || Date.now(),
            source: 'performance_monitoring'
          });
        });
      }
    } catch (error) {
      console.error('Failed to collect performance data:', error);
    }

    return dataPoints;
  }

  /**
   * Process data buffer
   */
  private async processDataBuffer() {
    if (this.dataBuffer.length === 0) return;

    const batch = [...this.dataBuffer];
    this.dataBuffer = [];

    // Preprocessing
    const preprocessedData = await this.preprocessData(batch);
    this.preprocessingQueue.push(...preprocessedData);

    // Move to training queue if we have enough data
    if (this.preprocessingQueue.length >= this.config.training.batchSize) {
      const trainingBatch = this.preprocessingQueue.splice(0, this.config.training.batchSize);
      this.trainingQueue.push(...trainingBatch);

      // Trigger training if queue is full
      if (this.trainingQueue.length >= this.config.continuousLearning.minDataPoints) {
        await this.triggerTraining();
      }
    }
  }

  /**
   * Preprocess training data
   */
  private async preprocessData(data: TrainingDataPoint[]): Promise<TrainingDataPoint[]> {
    let processedData = [...data];

    if (this.config.preprocessing.normalization) {
      processedData = this.normalizeFeatures(processedData);
    }

    if (this.config.preprocessing.featureSelection) {
      processedData = this.selectFeatures(processedData);
    }

    if (this.config.preprocessing.outlierRemoval) {
      processedData = this.removeOutliers(processedData);
    }

    return processedData;
  }

  /**
   * Trigger model training
   */
  private async triggerTraining() {
    if (this.trainingQueue.length === 0) return;

    try {
      const trainingData = [...this.trainingQueue];
      this.trainingQueue = [];

      // Group data by type
      const dataByType = this.groupDataByType(trainingData);

      // Train each model type
      for (const [type, data] of Object.entries(dataByType)) {
        await this.trainModelForType(type, data);
      }

      console.log(`Training completed with ${trainingData.length} data points`);
    } catch (error) {
      console.error('Training failed:', error);
    }
  }

  /**
   * Train model for specific data type
   */
  private async trainModelForType(type: string, data: TrainingDataPoint[]) {
    // Convert data to training format
    const trainingFormat = this.convertToTrainingFormat(data, type);

    // In a real implementation, this would call the ML engine's training methods
    // For now, we'll simulate training
    console.log(`Training ${type} model with ${data.length} samples`);

    // Simulate training time
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Start continuous learning loop
   */
  private startContinuousLearning() {
    this.continuousLearningActive = true;

    const learningLoop = async () => {
      if (!this.continuousLearningActive) return;

      try {
        // Collect data from all sources
        await this.collectFromAllSources();

        // Process any buffered data
        await this.processDataBuffer();

        // Check if we should trigger training
        if (this.trainingQueue.length >= this.config.continuousLearning.minDataPoints) {
          await this.triggerTraining();
        }
      } catch (error) {
        console.error('Continuous learning error:', error);
      }

      // Schedule next iteration
      setTimeout(learningLoop, this.config.continuousLearning.updateInterval);
    };

    learningLoop();
  }

  /**
   * Collect data from all configured sources
   */
  private async collectFromAllSources() {
    const collectionPromises = this.config.dataCollection.sources
      .filter(source => this.dataSources.has(source))
      .map(async source => {
        const sourceConfig = this.dataSources.get(source)!;
        const dataPoints = await sourceConfig.collectData();
        dataPoints.forEach(point => this.addDataPoint(point));
      });

    await Promise.allSettled(collectionPromises);
  }

  /**
   * Data preprocessing methods
   */
  private normalizeFeatures(data: TrainingDataPoint[]): TrainingDataPoint[] {
    // Simple min-max normalization
    const featureStats = this.calculateFeatureStats(data);

    return data.map(point => ({
      ...point,
      features: point.features.map((feature, index) => {
        const stats = featureStats[index];
        if (stats.max === stats.min) return 0;
        return (feature - stats.min) / (stats.max - stats.min);
      })
    }));
  }

  private selectFeatures(data: TrainingDataPoint[]): TrainingDataPoint[] {
    // Simple feature selection based on variance
    const variances = this.calculateFeatureVariances(data);
    const threshold = 0.01; // Remove features with very low variance

    const selectedIndices = variances
      .map((variance, index) => ({ variance, index }))
      .filter(item => item.variance > threshold)
      .map(item => item.index);

    return data.map(point => ({
      ...point,
      features: selectedIndices.map(index => point.features[index])
    }));
  }

  private removeOutliers(data: TrainingDataPoint[]): TrainingDataPoint[] {
    // Simple outlier removal using IQR method
    const featureStats = this.calculateFeatureStats(data);

    return data.filter(point => {
      return point.features.every((feature, index) => {
        const stats = featureStats[index];
        const iqr = stats.q3 - stats.q1;
        const lowerBound = stats.q1 - 1.5 * iqr;
        const upperBound = stats.q3 + 1.5 * iqr;
        return feature >= lowerBound && feature <= upperBound;
      });
    });
  }

  /**
   * Utility methods
   */
  private validateDataPoint(dataPoint: TrainingDataPoint): boolean {
    return !!(
      dataPoint.type &&
      Array.isArray(dataPoint.features) &&
      dataPoint.features.length > 0 &&
      dataPoint.source
    );
  }

  private extractPerformanceFeatures(metrics: any): number[] {
    return [
      metrics.current.loadTime,
      metrics.current.renderTime,
      metrics.current.memoryUsage,
      metrics.current.cpuUsage,
      metrics.current.networkRequests,
      metrics.current.confidence
    ];
  }

  private getRecentProcessedUrls(): string[] {
    // In a real implementation, this would query the ML processor for recent URLs
    // For now, return mock URLs
    return [
      'https://example.com',
      'https://test.com',
      'https://demo.com'
    ];
  }

  private calculateFeatureStats(data: TrainingDataPoint[]) {
    const numFeatures = data[0]?.features.length || 0;
    const stats = Array(numFeatures).fill(null).map(() => ({
      min: Infinity,
      max: -Infinity,
      q1: 0,
      q3: 0,
      mean: 0
    }));

    // Calculate min, max, mean
    data.forEach(point => {
      point.features.forEach((feature, index) => {
        stats[index].min = Math.min(stats[index].min, feature);
        stats[index].max = Math.max(stats[index].max, feature);
        stats[index].mean += feature;
      });
    });

    stats.forEach(stat => {
      stat.mean /= data.length;
    });

    // Calculate quartiles (simplified)
    const sortedFeatures = Array(numFeatures).fill(null).map((_, index) => {
      return data.map(point => point.features[index]).sort((a, b) => a - b);
    });

    stats.forEach((stat, index) => {
      const sorted = sortedFeatures[index];
      const q1Index = Math.floor(sorted.length * 0.25);
      const q3Index = Math.floor(sorted.length * 0.75);
      stat.q1 = sorted[q1Index];
      stat.q3 = sorted[q3Index];
    });

    return stats;
  }

  private calculateFeatureVariances(data: TrainingDataPoint[]): number[] {
    const numFeatures = data[0]?.features.length || 0;
    const variances = Array(numFeatures).fill(0);

    data.forEach(point => {
      point.features.forEach((feature, index) => {
        const diff = feature - this.calculateFeatureMean(data, index);
        variances[index] += diff * diff;
      });
    });

    return variances.map(variance => variance / data.length);
  }

  private calculateFeatureMean(data: TrainingDataPoint[], featureIndex: number): number {
    const sum = data.reduce((acc, point) => acc + point.features[featureIndex], 0);
    return sum / data.length;
  }

  private groupDataByType(data: TrainingDataPoint[]): { [key: string]: TrainingDataPoint[] } {
    const groups: { [key: string]: TrainingDataPoint[] } = {};

    data.forEach(point => {
      if (!groups[point.type]) {
        groups[point.type] = [];
      }
      groups[point.type].push(point);
    });

    return groups;
  }

  private convertToTrainingFormat(data: TrainingDataPoint[], type: string): any {
    // Convert data to the format expected by the ML models
    switch (type) {
      case 'performance':
        return {
          inputs: data.map(d => d.features),
          labels: data.map(d => d.labels)
        };
      case 'dom_analysis':
        return {
          inputs: data.map(d => d.features),
          labels: data.map(d => d.labels)
        };
      default:
        return {
          inputs: data.map(d => d.features),
          labels: data.map(d => d.labels)
        };
    }
  }

  /**
   * Get pipeline statistics
   */
  getPipelineStats() {
    return {
      dataBufferSize: this.dataBuffer.length,
      preprocessingQueueSize: this.preprocessingQueue.length,
      trainingQueueSize: this.trainingQueue.length,
      continuousLearningActive: this.continuousLearningActive,
      totalDataPointsProcessed: this.dataBuffer.length + this.preprocessingQueue.length + this.trainingQueue.length,
      dataSourcesActive: this.config.dataCollection.sources.length
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<TrainingPipelineConfig>) {
    this.config = { ...this.config, ...newConfig };

    if (this.config.continuousLearning.enabled && !this.continuousLearningActive) {
      this.startContinuousLearning();
    } else if (!this.config.continuousLearning.enabled && this.continuousLearningActive) {
      this.continuousLearningActive = false;
    }
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.continuousLearningActive = false;
    this.dataBuffer = [];
    this.preprocessingQueue = [];
    this.trainingQueue = [];
    this.dataSources.clear();
  }
}

/**
 * Data source interface
 */
interface DataSource {
  name: string;
  type: 'realtime' | 'event' | 'metrics';
  collectData: () => Promise<TrainingDataPoint[]>;
}

export default TrainingDataPipeline;