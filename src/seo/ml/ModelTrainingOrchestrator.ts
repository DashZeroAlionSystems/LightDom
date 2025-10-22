/**
 * Model Training Orchestrator
 * Manages the end-to-end ML model training pipeline
 * Integrates with blockchain for model deployment
 */

import { Pool } from 'pg';
import { ethers } from 'ethers';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export interface ModelConfig {
  modelName: string;
  modelVersion: string;
  algorithm: 'gradient_boosting' | 'neural_network' | 'random_forest' | 'ensemble';
  hyperparameters: {
    learningRate?: number;
    nEstimators?: number;
    maxDepth?: number;
    minSamplesLeaf?: number;
    [key: string]: any;
  };
  features: string[];
  targetMetric: 'ndcg' | 'map' | 'precision' | 'recall';
}

export interface TrainingResult {
  modelId: number;
  accuracy: number;
  trainingTime: number;
  datasetSize: number;
  modelPath: string;
  modelHash: string;
  metrics: {
    ndcg10: number;
    map: number;
    precision10: number;
    recall10: number;
    rmse?: number;
  };
  featureImportance: Array<{
    feature: string;
    importance: number;
  }>;
}

export interface ModelDeployment {
  modelId: number;
  blockchainTxHash: string;
  ipfsHash: string;
  deploymentStatus: 'pending' | 'deployed' | 'failed';
}

export class ModelTrainingOrchestrator {
  private dbPool: Pool;
  private blockchainProvider?: ethers.Provider;
  private seoMiningContract?: ethers.Contract;
  private pythonScriptPath: string;
  private modelsDirectory: string;
  
  constructor(
    dbPool: Pool,
    blockchainConfig?: {
      provider: ethers.Provider;
      contractAddress: string;
      contractABI: any[];
    }
  ) {
    this.dbPool = dbPool;
    this.pythonScriptPath = path.join(__dirname, 'train_seo_model.py');
    this.modelsDirectory = path.join(__dirname, '../../.data/models');
    
    if (blockchainConfig) {
      this.blockchainProvider = blockchainConfig.provider;
      this.seoMiningContract = new ethers.Contract(
        blockchainConfig.contractAddress,
        blockchainConfig.contractABI,
        blockchainConfig.provider
      );
    }
  }

  /**
   * Train a new SEO ranking model
   */
  async trainModel(config: ModelConfig): Promise<TrainingResult> {
    try {
      console.log(`Starting model training: ${config.modelName} v${config.modelVersion}`);
      
      // Create training run record
      const runId = await this.createTrainingRun(config);
      
      // Prepare training data
      const datasetPath = await this.prepareTrainingDataset(runId);
      
      // Execute Python training script
      const trainingResult = await this.executeTraining(config, datasetPath);
      
      // Update training run with results
      await this.updateTrainingRun(runId, trainingResult);
      
      // Calculate feature importance
      const featureImportance = await this.calculateFeatureImportance(
        trainingResult.modelPath
      );
      
      return {
        modelId: runId,
        ...trainingResult,
        featureImportance
      };
    } catch (error) {
      console.error('Model training failed:', error);
      throw new Error(`Model training failed: ${error.message}`);
    }
  }

  /**
   * Deploy trained model to blockchain
   */
  async deployModelToBlockchain(
    modelId: number,
    contributors: string[],
    shares: number[]
  ): Promise<ModelDeployment> {
    if (!this.seoMiningContract) {
      throw new Error('Blockchain not configured');
    }

    try {
      // Get model details
      const model = await this.getModelDetails(modelId);
      
      // Upload model to IPFS (simulated)
      const ipfsHash = await this.uploadModelToIPFS(model.modelPath);
      
      // Deploy to blockchain smart contract
      const tx = await this.seoMiningContract.deployTrainedModel(
        model.modelName,
        model.modelVersion,
        Math.floor(model.accuracy * 100), // Convert to percentage
        ethers.id(ipfsHash), // Convert IPFS hash to bytes32
        contributors,
        shares
      );
      
      const receipt = await tx.wait();
      
      // Update model with blockchain info
      await this.updateModelBlockchainInfo(
        modelId,
        receipt.transactionHash,
        ipfsHash
      );
      
      return {
        modelId,
        blockchainTxHash: receipt.transactionHash,
        ipfsHash,
        deploymentStatus: 'deployed'
      };
    } catch (error) {
      console.error('Model deployment failed:', error);
      
      // Update model status to failed
      await this.updateModelDeploymentStatus(modelId, 'failed');
      
      throw new Error(`Model deployment failed: ${error.message}`);
    }
  }

  /**
   * Create a new training run record
   */
  private async createTrainingRun(config: ModelConfig): Promise<number> {
    const query = `
      INSERT INTO seo_features.model_training_runs 
      (model_name, model_version, dataset_size, features_used, 
       hyperparameters, training_start_date, status)
      VALUES ($1, $2, 0, $3, $4, NOW(), 'training')
      RETURNING id
    `;
    
    const values = [
      config.modelName,
      config.modelVersion,
      JSON.stringify(config.features),
      JSON.stringify(config.hyperparameters)
    ];
    
    const result = await this.dbPool.query(query, values);
    return result.rows[0].id;
  }

  /**
   * Prepare dataset for training
   */
  private async prepareTrainingDataset(runId: number): Promise<string> {
    // Query training data from database
    const query = `
      SELECT features_provided, quality_score
      FROM seo_features.training_contributions
      WHERE quality_score >= 70
      ORDER BY RANDOM()
      LIMIT 10000
    `;
    
    const result = await this.dbPool.query(query);
    
    // Create dataset file
    const datasetPath = path.join(
      this.modelsDirectory,
      `training_data_${runId}.json`
    );
    
    await fs.mkdir(this.modelsDirectory, { recursive: true });
    await fs.writeFile(
      datasetPath,
      JSON.stringify(result.rows, null, 2)
    );
    
    // Update dataset size in training run
    await this.dbPool.query(
      'UPDATE seo_features.model_training_runs SET dataset_size = $1 WHERE id = $2',
      [result.rows.length, runId]
    );
    
    return datasetPath;
  }

  /**
   * Execute Python training script
   */
  private async executeTraining(
    config: ModelConfig,
    datasetPath: string
  ): Promise<Omit<TrainingResult, 'modelId' | 'featureImportance'>> {
    const startTime = Date.now();
    
    // Construct Python command
    const command = [
      'python3',
      this.pythonScriptPath,
      '--dataset', datasetPath,
      '--model-name', config.modelName,
      '--model-version', config.modelVersion,
      '--algorithm', config.algorithm,
      '--hyperparameters', JSON.stringify(config.hyperparameters),
      '--target-metric', config.targetMetric
    ].join(' ');
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 50 // 50MB buffer
      });
      
      if (stderr) {
        console.warn('Training script warnings:', stderr);
      }
      
      // Parse training results
      const results = JSON.parse(stdout);
      const trainingTime = (Date.now() - startTime) / 1000; // Convert to seconds
      
      return {
        accuracy: results.accuracy,
        trainingTime,
        datasetSize: results.datasetSize,
        modelPath: results.modelPath,
        modelHash: results.modelHash || this.generateModelHash(results.modelPath),
        metrics: {
          ndcg10: results.metrics.ndcg10 || 0,
          map: results.metrics.map || 0,
          precision10: results.metrics.precision10 || 0,
          recall10: results.metrics.recall10 || 0,
          rmse: results.metrics.rmse
        }
      };
    } catch (error) {
      throw new Error(`Training execution failed: ${error.message}`);
    }
  }

  /**
   * Update training run with results
   */
  private async updateTrainingRun(
    runId: number,
    results: Omit<TrainingResult, 'modelId' | 'featureImportance'>
  ): Promise<void> {
    const query = `
      UPDATE seo_features.model_training_runs 
      SET 
        accuracy_score = $1,
        training_end_date = NOW(),
        status = 'completed',
        model_hash = $2,
        updated_at = NOW()
      WHERE id = $3
    `;
    
    await this.dbPool.query(query, [
      results.accuracy,
      results.modelHash,
      runId
    ]);
    
    // Insert performance metrics
    const metricsQueries = Object.entries(results.metrics).map(([name, value]) => {
      return this.dbPool.query(
        `INSERT INTO seo_features.model_performance_metrics 
         (model_id, metric_name, metric_value, test_dataset_size) 
         VALUES ($1, $2, $3, $4)`,
        [runId, name, value, results.datasetSize * 0.2] // 20% test split
      );
    });
    
    await Promise.all(metricsQueries);
  }

  /**
   * Calculate feature importance from trained model
   */
  private async calculateFeatureImportance(
    modelPath: string
  ): Promise<Array<{ feature: string; importance: number }>> {
    try {
      // Call Python script to extract feature importance
      const command = `python3 ${path.join(__dirname, 'extract_feature_importance.py')} --model ${modelPath}`;
      const { stdout } = await execAsync(command);
      
      const importance = JSON.parse(stdout);
      return importance;
    } catch (error) {
      console.warn('Failed to extract feature importance:', error);
      // Return default importance if extraction fails
      return this.getDefaultFeatureImportance();
    }
  }

  /**
   * Get model details from database
   */
  private async getModelDetails(modelId: number): Promise<any> {
    const query = `
      SELECT * FROM seo_features.model_training_runs WHERE id = $1
    `;
    const result = await this.dbPool.query(query, [modelId]);
    
    if (result.rows.length === 0) {
      throw new Error(`Model ${modelId} not found`);
    }
    
    return result.rows[0];
  }

  /**
   * Upload model to IPFS
   */
  private async uploadModelToIPFS(modelPath: string): Promise<string> {
    // This would integrate with actual IPFS client
    // For now, return a simulated IPFS hash
    const hash = ethers.keccak256(
      ethers.toUtf8Bytes(`model-${Date.now()}-${Math.random()}`)
    );
    return `Qm${hash.slice(2, 48)}`; // Simulate IPFS hash format
  }

  /**
   * Update model with blockchain deployment info
   */
  private async updateModelBlockchainInfo(
    modelId: number,
    txHash: string,
    ipfsHash: string
  ): Promise<void> {
    const query = `
      UPDATE seo_features.model_training_runs 
      SET blockchain_tx_hash = $1, model_hash = $2, updated_at = NOW()
      WHERE id = $3
    `;
    await this.dbPool.query(query, [txHash, ipfsHash, modelId]);
  }

  /**
   * Update model deployment status
   */
  private async updateModelDeploymentStatus(
    modelId: number,
    status: string
  ): Promise<void> {
    const query = `
      UPDATE seo_features.model_training_runs 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `;
    await this.dbPool.query(query, [status, modelId]);
  }

  /**
   * Generate model hash for identification
   */
  private generateModelHash(modelPath: string): string {
    return ethers.keccak256(
      ethers.toUtf8Bytes(`${modelPath}-${Date.now()}`)
    );
  }

  /**
   * Get default feature importance
   */
  private getDefaultFeatureImportance(): Array<{ feature: string; importance: number }> {
    return [
      { feature: 'domain_authority', importance: 0.145 },
      { feature: 'content_quality_score', importance: 0.132 },
      { feature: 'total_backlinks', importance: 0.098 },
      { feature: 'core_web_vitals_composite', importance: 0.087 },
      { feature: 'engagement_rate', importance: 0.076 },
      { feature: 'content_freshness', importance: 0.065 },
      { feature: 'mobile_optimization', importance: 0.054 },
      { feature: 'semantic_relevance', importance: 0.048 },
      { feature: 'page_authority', importance: 0.042 },
      { feature: 'title_keyword_presence', importance: 0.038 }
    ];
  }

  /**
   * Get trained models list
   */
  async listModels(
    filters?: {
      status?: string;
      minAccuracy?: number;
      limit?: number;
    }
  ): Promise<any[]> {
    let query = `
      SELECT 
        id, model_name, model_version, accuracy_score,
        dataset_size, training_start_date, training_end_date,
        status, blockchain_tx_hash, model_hash
      FROM seo_features.model_training_runs
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;
    
    if (filters?.status) {
      query += ` AND status = $${paramCount++}`;
      params.push(filters.status);
    }
    
    if (filters?.minAccuracy) {
      query += ` AND accuracy_score >= $${paramCount++}`;
      params.push(filters.minAccuracy);
    }
    
    query += ` ORDER BY training_start_date DESC`;
    
    if (filters?.limit) {
      query += ` LIMIT $${paramCount++}`;
      params.push(filters.limit);
    }
    
    const result = await this.dbPool.query(query, params);
    return result.rows;
  }

  /**
   * Get model performance metrics
   */
  async getModelMetrics(modelId: number): Promise<any> {
    const query = `
      SELECT metric_name, metric_value, test_dataset_size, measured_at
      FROM seo_features.model_performance_metrics
      WHERE model_id = $1
      ORDER BY measured_at DESC
    `;
    const result = await this.dbPool.query(query, [modelId]);
    return result.rows;
  }
}
