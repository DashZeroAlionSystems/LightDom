/**
 * SEO Training Data Service
 * Manages collection, storage, and preparation of SEO training data
 * Integrates with blockchain for data mining rewards
 */

import { ethers } from 'ethers';
import { Pool } from 'pg';
import { SEODataCollector } from './SEODataCollector';

export interface TrainingDataContribution {
  id?: number;
  url: string;
  keyword: string;
  contributorAddress: string;
  featuresProvided: Record<string, any>;
  qualityScore: number;
  rewardAmount: string;
  blockchainTxHash?: string;
  timestamp: Date;
  dataHash: string;
}

export interface ModelTrainingConfig {
  modelName: string;
  modelVersion: string;
  datasetSize: number;
  features: string[];
  hyperparameters: Record<string, any>;
  trainingStartDate: Date;
  expectedCompletionDate: Date;
}

export interface TrainingDataStats {
  totalContributions: number;
  totalFeatures: number;
  totalRewards: string;
  uniqueContributors: number;
  avgQualityScore: number;
  datasetReadiness: {
    isReady: boolean;
    minSamplesRequired: number;
    currentSamples: number;
    missingFeatures: string[];
  };
}

export class SEOTrainingDataService {
  private dbPool: Pool;
  private collector: SEODataCollector;
  private blockchainProvider?: ethers.Provider;
  private seoMiningContract?: ethers.Contract;
  
  constructor(
    dbPool: Pool,
    collector: SEODataCollector,
    blockchainConfig?: {
      provider: ethers.Provider;
      contractAddress: string;
      contractABI: any[];
    }
  ) {
    this.dbPool = dbPool;
    this.collector = collector;
    
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
   * Collect SEO data and prepare for training
   */
  async collectTrainingData(
    url: string,
    keyword: string,
    contributorAddress: string
  ): Promise<TrainingDataContribution> {
    try {
      // Collect comprehensive SEO data
      const seoData = await this.collector.collectCompleteData(url, keyword);
      
      // Calculate quality score based on data completeness
      const qualityScore = this.calculateQualityScore(seoData);
      
      // Store in database
      const contribution = await this.storeTrainingData({
        url,
        keyword,
        contributorAddress,
        featuresProvided: seoData,
        qualityScore,
        rewardAmount: '0',
        timestamp: new Date(),
        dataHash: this.generateDataHash(seoData)
      });
      
      // Submit to blockchain for rewards
      if (this.seoMiningContract && contribution.id) {
        const txHash = await this.submitToBlockchain(contribution);
        
        // Update contribution with blockchain transaction
        await this.updateContributionTxHash(contribution.id, txHash);
        contribution.blockchainTxHash = txHash;
      }
      
      return contribution;
    } catch (error) {
      console.error('Error collecting training data:', error);
      throw new Error(`Failed to collect training data: ${error.message}`);
    }
  }

  /**
   * Store training data in database
   */
  private async storeTrainingData(
    contribution: TrainingDataContribution
  ): Promise<TrainingDataContribution> {
    const query = `
      INSERT INTO seo_features.training_contributions 
      (url, keyword, contributor_address, features_provided, quality_score, 
       reward_amount, data_hash, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, url, keyword, contributor_address, features_provided, 
                quality_score, reward_amount, data_hash, timestamp
    `;
    
    const values = [
      contribution.url,
      contribution.keyword,
      contribution.contributorAddress,
      JSON.stringify(contribution.featuresProvided),
      contribution.qualityScore,
      contribution.rewardAmount,
      contribution.dataHash,
      contribution.timestamp
    ];
    
    const result = await this.dbPool.query(query, values);
    return result.rows[0];
  }

  /**
   * Submit contribution to blockchain smart contract
   */
  private async submitToBlockchain(
    contribution: TrainingDataContribution
  ): Promise<string> {
    if (!this.seoMiningContract) {
      throw new Error('Blockchain not configured');
    }
    
    try {
      // Calculate features bitmap
      const featuresBitmap = this.calculateFeaturesBitmap(
        contribution.featuresProvided
      );
      
      // Call smart contract
      const tx = await this.seoMiningContract.contributeData(
        contribution.url,
        contribution.keyword,
        featuresBitmap,
        contribution.dataHash,
        Math.floor(contribution.qualityScore)
      );
      
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Blockchain submission error:', error);
      throw new Error(`Failed to submit to blockchain: ${error.message}`);
    }
  }

  /**
   * Update contribution with blockchain transaction hash
   */
  private async updateContributionTxHash(
    contributionId: number,
    txHash: string
  ): Promise<void> {
    const query = `
      UPDATE seo_features.training_contributions 
      SET blockchain_tx_hash = $1 
      WHERE id = $2
    `;
    await this.dbPool.query(query, [txHash, contributionId]);
  }

  /**
   * Get training data statistics
   */
  async getTrainingDataStats(): Promise<TrainingDataStats> {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_contributions,
        COUNT(DISTINCT contributor_address) as unique_contributors,
        AVG(quality_score) as avg_quality_score,
        SUM(CAST(reward_amount AS NUMERIC)) as total_rewards
      FROM seo_features.training_contributions
    `;
    
    const statsResult = await this.dbPool.query(statsQuery);
    const stats = statsResult.rows[0];
    
    // Check dataset readiness
    const minSamplesRequired = 1000; // Minimum for MVP model
    const currentSamples = parseInt(stats.total_contributions);
    
    // Analyze feature coverage
    const featureCoverageQuery = `
      SELECT features_provided 
      FROM seo_features.training_contributions 
      LIMIT 100
    `;
    const featureResult = await this.dbPool.query(featureCoverageQuery);
    const missingFeatures = this.analyzeMissingFeatures(
      featureResult.rows.map(r => JSON.parse(r.features_provided))
    );
    
    return {
      totalContributions: parseInt(stats.total_contributions),
      totalFeatures: this.countTotalFeatures(),
      totalRewards: stats.total_rewards || '0',
      uniqueContributors: parseInt(stats.unique_contributors),
      avgQualityScore: parseFloat(stats.avg_quality_score) || 0,
      datasetReadiness: {
        isReady: currentSamples >= minSamplesRequired && missingFeatures.length === 0,
        minSamplesRequired,
        currentSamples,
        missingFeatures
      }
    };
  }

  /**
   * Get contributions by user
   */
  async getUserContributions(
    contributorAddress: string,
    limit: number = 50
  ): Promise<TrainingDataContribution[]> {
    const query = `
      SELECT id, url, keyword, contributor_address, features_provided,
             quality_score, reward_amount, blockchain_tx_hash, data_hash, timestamp
      FROM seo_features.training_contributions
      WHERE contributor_address = $1
      ORDER BY timestamp DESC
      LIMIT $2
    `;
    
    const result = await this.dbPool.query(query, [contributorAddress, limit]);
    return result.rows.map(row => ({
      ...row,
      featuresProvided: JSON.parse(row.features_provided)
    }));
  }

  /**
   * Prepare training dataset for ML model
   */
  async prepareTrainingDataset(
    targetSize: number = 10000,
    testSplit: number = 0.2
  ): Promise<{
    trainingSet: any[];
    testSet: any[];
    features: string[];
    metadata: any;
  }> {
    const query = `
      SELECT features_provided, quality_score
      FROM seo_features.training_contributions
      WHERE quality_score >= 70
      ORDER BY RANDOM()
      LIMIT $1
    `;
    
    const result = await this.dbPool.query(query, [targetSize]);
    const allData = result.rows.map(row => JSON.parse(row.features_provided));
    
    // Split data
    const splitIndex = Math.floor(allData.length * (1 - testSplit));
    const trainingSet = allData.slice(0, splitIndex);
    const testSet = allData.slice(splitIndex);
    
    // Extract feature names
    const features = this.extractFeatureNames(allData[0]);
    
    return {
      trainingSet,
      testSet,
      features,
      metadata: {
        totalSamples: allData.length,
        trainingSamples: trainingSet.length,
        testSamples: testSet.length,
        featureCount: features.length,
        avgQualityScore: result.rows.reduce((sum, r) => sum + r.quality_score, 0) / result.rows.length
      }
    };
  }

  /**
   * Calculate quality score based on data completeness and accuracy
   */
  private calculateQualityScore(seoData: any): number {
    let score = 0;
    const maxScore = 100;
    
    // Check data completeness (50 points)
    const requiredFields = ['onPage', 'technical', 'authority', 'userBehavior'];
    const presentFields = requiredFields.filter(field => seoData[field]);
    score += (presentFields.length / requiredFields.length) * 50;
    
    // Check data richness (30 points)
    const totalFields = this.countFields(seoData);
    const expectedFields = 50; // Expected number of SEO features
    score += Math.min((totalFields / expectedFields) * 30, 30);
    
    // Check data validity (20 points)
    const isValid = this.validateData(seoData);
    score += isValid ? 20 : 0;
    
    return Math.min(Math.round(score), maxScore);
  }

  /**
   * Generate data hash for blockchain submission
   */
  private generateDataHash(data: any): string {
    const dataStr = JSON.stringify(data);
    return ethers.keccak256(ethers.toUtf8Bytes(dataStr));
  }

  /**
   * Calculate features bitmap for blockchain
   */
  private calculateFeaturesBitmap(features: any): bigint {
    // Simplified bitmap calculation
    // In production, map each of 194 features to a bit
    let bitmap = 0n;
    let bitPosition = 0;
    
    const flatFeatures = this.flattenObject(features);
    for (const [key, value] of Object.entries(flatFeatures)) {
      if (value !== null && value !== undefined && bitPosition < 194) {
        bitmap |= (1n << BigInt(bitPosition));
      }
      bitPosition++;
    }
    
    return bitmap;
  }

  /**
   * Count total number of fields in data
   */
  private countFields(obj: any, depth: number = 0): number {
    if (depth > 5 || typeof obj !== 'object' || obj === null) return 0;
    
    let count = 0;
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        count += this.countFields(value, depth + 1);
      } else {
        count++;
      }
    }
    return count;
  }

  /**
   * Validate data structure and values
   */
  private validateData(data: any): boolean {
    try {
      // Basic validation checks
      if (!data.onPage || !data.technical) return false;
      
      // Validate numeric ranges
      if (data.technical.largestContentfulPaint < 0) return false;
      if (data.technical.cumulativeLayoutShift < 0 || data.technical.cumulativeLayoutShift > 1) return false;
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Flatten nested object for feature extraction
   */
  private flattenObject(obj: any, prefix: string = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}_${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
    
    return flattened;
  }

  /**
   * Extract feature names from data
   */
  private extractFeatureNames(data: any): string[] {
    const flattened = this.flattenObject(data);
    return Object.keys(flattened);
  }

  /**
   * Analyze which features are missing from dataset
   */
  private analyzeMissingFeatures(dataArray: any[]): string[] {
    if (dataArray.length === 0) return [];
    
    // Get all possible features from first sample
    const allFeatures = new Set(this.extractFeatureNames(dataArray[0]));
    
    // Check what percentage of samples have each feature
    const featureCoverage: Record<string, number> = {};
    
    for (const data of dataArray) {
      const features = this.extractFeatureNames(data);
      for (const feature of features) {
        featureCoverage[feature] = (featureCoverage[feature] || 0) + 1;
      }
    }
    
    // Return features that appear in less than 80% of samples
    const threshold = dataArray.length * 0.8;
    return Array.from(allFeatures).filter(
      feature => (featureCoverage[feature] || 0) < threshold
    );
  }

  /**
   * Get total feature count (194 for complete SEO schema)
   */
  private countTotalFeatures(): number {
    return 194; // As per SEO schema documentation
  }
}
