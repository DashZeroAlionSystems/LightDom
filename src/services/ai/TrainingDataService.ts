/**
 * Training Data Service
 * 
 * Manages automated training data collection for neural networks
 * Supports config-driven workflows and multiple data sources
 */

import { EventEmitter } from 'events';
import { Pool } from 'pg';
import DeepSeekToolsService from './DeepSeekToolsService';

export interface TrainingDataConfig {
  id: string;
  neuralNetworkId: string;
  dataType: 'seo' | 'ui-patterns' | 'content' | 'workflow' | 'custom';
  source: DataSource;
  preprocessing: PreprocessingConfig;
  storage: StorageConfig;
  triggers: DataCollectionTrigger[];
  status: 'active' | 'paused' | 'completed' | 'error';
  metadata: {
    createdAt: string;
    updatedAt: string;
    totalSamples: number;
    lastCollection?: string;
  };
}

export interface DataSource {
  type: 'web-crawler' | 'api' | 'database' | 'file';
  config: {
    startUrl?: string;
    apiEndpoint?: string;
    databaseQuery?: string;
    filePath?: string;
    maxSamples?: number;
    filters?: Record<string, any>;
  };
}

export interface PreprocessingConfig {
  normalization: boolean;
  tokenization?: {
    enabled: boolean;
    maxLength?: number;
    vocabulary?: string[];
  };
  augmentation?: {
    enabled: boolean;
    techniques: string[];
  };
  validation?: {
    enabled: boolean;
    rules: ValidationRule[];
  };
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  config: Record<string, any>;
}

export interface StorageConfig {
  destination: 'database' | 'file' | 'both';
  format: 'json' | 'csv' | 'tfrecord';
  path?: string;
  tableName?: string;
}

export interface DataCollectionTrigger {
  type: 'manual' | 'scheduled' | 'threshold' | 'workflow';
  config: {
    schedule?: string; // cron expression
    threshold?: {
      metric: string;
      value: number;
      condition: 'above' | 'below';
    };
    workflowId?: string;
  };
  enabled: boolean;
}

export interface CollectionResult {
  configId: string;
  samples: TrainingSample[];
  statistics: {
    collected: number;
    processed: number;
    stored: number;
    errors: number;
  };
  timestamp: string;
}

export interface TrainingSample {
  id: string;
  features: Record<string, any>;
  labels?: Record<string, any>;
  metadata: {
    source: string;
    timestamp: string;
    quality?: number;
  };
}

export class TrainingDataService extends EventEmitter {
  private configs: Map<string, TrainingDataConfig> = new Map();
  private dbPool: Pool;
  private deepseekTools: DeepSeekToolsService;
  private collectionJobs: Map<string, NodeJS.Timeout> = new Map();

  constructor(dbPool: Pool) {
    super();
    this.dbPool = dbPool;
    this.deepseekTools = new DeepSeekToolsService();
  }

  /**
   * Initialize service
   */
  async initialize(): Promise<void> {
    await this.deepseekTools.initialize();
    await this.loadConfigs();
    this.startScheduledJobs();
  }

  /**
   * Load configurations from database
   */
  private async loadConfigs(): Promise<void> {
    try {
      const result = await this.dbPool.query(
        'SELECT * FROM training_data_configs WHERE status != $1',
        ['completed']
      );

      result.rows.forEach(row => {
        const config: TrainingDataConfig = {
          id: row.id,
          neuralNetworkId: row.neural_network_id,
          dataType: row.data_type,
          source: row.source,
          preprocessing: row.preprocessing,
          storage: row.storage,
          triggers: row.triggers,
          status: row.status,
          metadata: {
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            totalSamples: row.total_samples || 0,
            lastCollection: row.last_collection,
          },
        };

        this.configs.set(config.id, config);
      });
    } catch (error) {
      console.error('Error loading training data configs:', error);
    }
  }

  /**
   * Create a new training data configuration
   */
  async createConfig(config: Omit<TrainingDataConfig, 'id' | 'metadata'>): Promise<TrainingDataConfig> {
    const newConfig: TrainingDataConfig = {
      ...config,
      id: `tdc-${Date.now()}`,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalSamples: 0,
      },
    };

    // Store in database
    try {
      await this.dbPool.query(
        `INSERT INTO training_data_configs 
        (id, neural_network_id, data_type, source, preprocessing, storage, triggers, status, created_at, updated_at, total_samples)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          newConfig.id,
          newConfig.neuralNetworkId,
          newConfig.dataType,
          JSON.stringify(newConfig.source),
          JSON.stringify(newConfig.preprocessing),
          JSON.stringify(newConfig.storage),
          JSON.stringify(newConfig.triggers),
          newConfig.status,
          newConfig.metadata.createdAt,
          newConfig.metadata.updatedAt,
          newConfig.metadata.totalSamples,
        ]
      );

      this.configs.set(newConfig.id, newConfig);
      this.emit('config:created', newConfig);

      // Setup triggers
      this.setupTriggers(newConfig);

      return newConfig;
    } catch (error) {
      console.error('Error creating training data config:', error);
      throw error;
    }
  }

  /**
   * Setup triggers for a configuration
   */
  private setupTriggers(config: TrainingDataConfig): void {
    config.triggers.forEach(trigger => {
      if (!trigger.enabled) return;

      switch (trigger.type) {
        case 'scheduled':
          if (trigger.config.schedule) {
            this.scheduleCollection(config.id, trigger.config.schedule);
          }
          break;
        case 'threshold':
          this.setupThresholdTrigger(config.id, trigger.config.threshold!);
          break;
        case 'workflow':
          // Workflow triggers are handled by the workflow orchestrator
          break;
      }
    });
  }

  /**
   * Schedule data collection
   */
  private scheduleCollection(configId: string, schedule: string): void {
    // Simple implementation - in production would use proper cron scheduling
    const interval = this.parseCronToInterval(schedule);
    
    const job = setInterval(async () => {
      await this.collectData(configId);
    }, interval);

    this.collectionJobs.set(configId, job);
  }

  /**
   * Parse cron expression to interval (simplified)
   */
  private parseCronToInterval(schedule: string): number {
    // Very basic parsing - just support hourly and daily for now
    if (schedule.includes('*/1')) return 60 * 60 * 1000; // Hourly
    if (schedule.includes('0 0')) return 24 * 60 * 60 * 1000; // Daily
    return 60 * 60 * 1000; // Default to hourly
  }

  /**
   * Setup threshold trigger
   */
  private setupThresholdTrigger(configId: string, threshold: any): void {
    // This would monitor metrics and trigger collection when threshold is met
    console.log(`Setting up threshold trigger for config ${configId}`);
  }

  /**
   * Start all scheduled jobs
   */
  private startScheduledJobs(): void {
    this.configs.forEach(config => {
      if (config.status === 'active') {
        this.setupTriggers(config);
      }
    });
  }

  /**
   * Collect training data for a configuration
   */
  async collectData(configId: string): Promise<CollectionResult> {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration ${configId} not found`);
    }

    this.emit('collection:started', { configId });

    const result: CollectionResult = {
      configId,
      samples: [],
      statistics: {
        collected: 0,
        processed: 0,
        stored: 0,
        errors: 0,
      },
      timestamp: new Date().toISOString(),
    };

    try {
      // Collect raw data based on source type
      const rawData = await this.collectFromSource(config);
      result.statistics.collected = rawData.length;

      // Preprocess data
      const processedData = await this.preprocessData(rawData, config.preprocessing);
      result.statistics.processed = processedData.length;

      // Store data
      await this.storeData(processedData, config);
      result.statistics.stored = processedData.length;

      result.samples = processedData;

      // Update config metadata
      config.metadata.totalSamples += processedData.length;
      config.metadata.lastCollection = new Date().toISOString();
      config.metadata.updatedAt = new Date().toISOString();

      await this.updateConfig(config);

      this.emit('collection:completed', result);
    } catch (error) {
      result.statistics.errors++;
      this.emit('collection:failed', { configId, error });
      throw error;
    }

    return result;
  }

  /**
   * Collect data from source
   */
  private async collectFromSource(config: TrainingDataConfig): Promise<any[]> {
    switch (config.source.type) {
      case 'web-crawler':
        return this.collectFromWebCrawler(config);
      case 'api':
        return this.collectFromAPI(config);
      case 'database':
        return this.collectFromDatabase(config);
      case 'file':
        return this.collectFromFile(config);
      default:
        throw new Error(`Unsupported source type: ${config.source.type}`);
    }
  }

  /**
   * Collect data using web crawler
   */
  private async collectFromWebCrawler(config: TrainingDataConfig): Promise<any[]> {
    const { startUrl, maxSamples } = config.source.config;
    
    if (!startUrl) {
      throw new Error('startUrl required for web-crawler source');
    }

    const result = await this.deepseekTools.executeTool('collect_training_data', {
      startUrl,
      dataType: config.dataType,
      maxPages: maxSamples || 10,
    });

    return result.data || [];
  }

  /**
   * Collect data from API
   */
  private async collectFromAPI(config: TrainingDataConfig): Promise<any[]> {
    const { apiEndpoint } = config.source.config;
    
    if (!apiEndpoint) {
      throw new Error('apiEndpoint required for api source');
    }

    const response = await fetch(apiEndpoint);
    const data = await response.json();

    return Array.isArray(data) ? data : [data];
  }

  /**
   * Collect data from database
   */
  private async collectFromDatabase(config: TrainingDataConfig): Promise<any[]> {
    const { databaseQuery } = config.source.config;
    
    if (!databaseQuery) {
      throw new Error('databaseQuery required for database source');
    }

    const result = await this.dbPool.query(databaseQuery);
    return result.rows;
  }

  /**
   * Collect data from file
   */
  private async collectFromFile(config: TrainingDataConfig): Promise<any[]> {
    // This would read from a file
    return [];
  }

  /**
   * Preprocess collected data
   */
  private async preprocessData(data: any[], config: PreprocessingConfig): Promise<TrainingSample[]> {
    const samples: TrainingSample[] = [];

    for (const item of data) {
      try {
        // Apply validation
        if (config.validation?.enabled) {
          const isValid = this.validateSample(item, config.validation.rules);
          if (!isValid) continue;
        }

        // Create training sample
        const sample: TrainingSample = {
          id: `sample-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          features: this.extractFeatures(item),
          labels: this.extractLabels(item),
          metadata: {
            source: item.url || item.source || 'unknown',
            timestamp: new Date().toISOString(),
            quality: this.calculateQuality(item),
          },
        };

        // Apply normalization
        if (config.normalization) {
          sample.features = this.normalizeFeatures(sample.features);
        }

        // Apply tokenization
        if (config.tokenization?.enabled) {
          sample.features = this.tokenizeFeatures(sample.features, config.tokenization);
        }

        samples.push(sample);
      } catch (error) {
        console.error('Error preprocessing sample:', error);
      }
    }

    return samples;
  }

  /**
   * Validate a sample
   */
  private validateSample(sample: any, rules: ValidationRule[]): boolean {
    return rules.every(rule => {
      const value = sample[rule.field];
      
      switch (rule.type) {
        case 'required':
          return value !== undefined && value !== null;
        case 'format':
          // Would implement format validation
          return true;
        case 'range':
          const { min, max } = rule.config;
          return value >= min && value <= max;
        default:
          return true;
      }
    });
  }

  /**
   * Extract features from raw data
   */
  private extractFeatures(item: any): Record<string, any> {
    // This would be customized based on data type
    return item.features || item;
  }

  /**
   * Extract labels from raw data
   */
  private extractLabels(item: any): Record<string, any> | undefined {
    return item.labels;
  }

  /**
   * Calculate data quality score
   */
  private calculateQuality(item: any): number {
    // Simple quality metric - could be much more sophisticated
    let score = 1.0;
    
    if (!item.title && !item.content) score *= 0.5;
    if (item.errors) score *= 0.7;
    
    return score;
  }

  /**
   * Normalize features
   */
  private normalizeFeatures(features: Record<string, any>): Record<string, any> {
    // Basic normalization - would be more sophisticated in production
    return features;
  }

  /**
   * Tokenize features
   */
  private tokenizeFeatures(features: Record<string, any>, config: any): Record<string, any> {
    // Basic tokenization - would use proper tokenizer in production
    return features;
  }

  /**
   * Store training data
   */
  private async storeData(samples: TrainingSample[], config: TrainingDataConfig): Promise<void> {
    if (config.storage.destination === 'database' || config.storage.destination === 'both') {
      await this.storeInDatabase(samples, config);
    }

    if (config.storage.destination === 'file' || config.storage.destination === 'both') {
      await this.storeInFile(samples, config);
    }
  }

  /**
   * Store in database
   */
  private async storeInDatabase(samples: TrainingSample[], config: TrainingDataConfig): Promise<void> {
    const tableName = config.storage.tableName || 'training_samples';

    for (const sample of samples) {
      try {
        await this.dbPool.query(
          `INSERT INTO ${tableName} (id, neural_network_id, features, labels, metadata, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            sample.id,
            config.neuralNetworkId,
            JSON.stringify(sample.features),
            JSON.stringify(sample.labels),
            JSON.stringify(sample.metadata),
            new Date().toISOString(),
          ]
        );
      } catch (error) {
        console.error('Error storing sample in database:', error);
      }
    }
  }

  /**
   * Store in file
   */
  private async storeInFile(samples: TrainingSample[], config: TrainingDataConfig): Promise<void> {
    // Would implement file storage
    console.log(`Storing ${samples.length} samples to file`);
  }

  /**
   * Update configuration in database
   */
  private async updateConfig(config: TrainingDataConfig): Promise<void> {
    try {
      await this.dbPool.query(
        `UPDATE training_data_configs 
        SET updated_at = $1, total_samples = $2, last_collection = $3
        WHERE id = $4`,
        [
          config.metadata.updatedAt,
          config.metadata.totalSamples,
          config.metadata.lastCollection,
          config.id,
        ]
      );
    } catch (error) {
      console.error('Error updating config:', error);
    }
  }

  /**
   * Get all configurations
   */
  getConfigs(): TrainingDataConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Get configuration by ID
   */
  getConfig(configId: string): TrainingDataConfig | undefined {
    return this.configs.get(configId);
  }

  /**
   * Trigger data collection from workflow
   */
  async triggerFromWorkflow(configId: string, workflowData: Record<string, any>): Promise<CollectionResult> {
    console.log(`Triggered data collection from workflow for config ${configId}`);
    return this.collectData(configId);
  }

  /**
   * Cleanup
   */
  async cleanup(): Promise<void> {
    // Stop all scheduled jobs
    this.collectionJobs.forEach(job => clearInterval(job));
    this.collectionJobs.clear();

    // Close DeepSeek tools
    await this.deepseekTools.close();
  }
}

export default TrainingDataService;
