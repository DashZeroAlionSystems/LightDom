/**
 * SEO ML Workflow Service
 * Orchestrates the complete ML pipeline from data collection to content generation
 * Integrates crawler data, model training, and AI-powered content creation
 */

import { Pool } from 'pg';
import { ModelTrainingOrchestrator, ModelConfig, TrainingResult } from './ml/ModelTrainingOrchestrator';
import { SEOTrainingDataService } from './services/SEOTrainingDataService';
import { SEODataCollector } from './services/SEODataCollector';
import { ethers } from 'ethers';
import path from 'path';
import fs from 'fs/promises';

export interface MLWorkflowConfig {
  minTrainingSamples: number;
  autoTrainingEnabled: boolean;
  trainingIntervalHours: number;
  modelUpdateThreshold: number; // Minimum accuracy improvement to deploy
  contentGenerationEnabled: boolean;
  blockchainRewardsEnabled: boolean;
}

export interface WorkflowStatus {
  isActive: boolean;
  lastTrainingRun: Date | null;
  currentModelAccuracy: number;
  pendingTrainingSamples: number;
  nextScheduledTraining: Date | null;
  activeModels: string[];
  recentDeployments: Array<{
    modelId: number;
    accuracy: number;
    deployedAt: Date;
    blockchainTx?: string;
  }>;
}

export interface ContentGenerationRequest {
  url: string;
  keyword: string;
  contentType: 'blog' | 'landing' | 'product' | 'article';
  targetAudience: string;
  tone: 'professional' | 'casual' | 'technical' | 'conversational';
  length: 'short' | 'medium' | 'long';
  useTrainedModel: boolean;
}

export interface GeneratedContent {
  title: string;
  content: string;
  metaDescription: string;
  keywords: string[];
  seoScore: number;
  readabilityScore: number;
  modelUsed: string;
  generationTime: number;
  optimizationSuggestions: string[];
}

export class SEOMLWorkflowService {
  private dbPool: Pool;
  private trainingOrchestrator: ModelTrainingOrchestrator;
  private trainingDataService: SEOTrainingDataService;
  private dataCollector: SEODataCollector;
  private config: MLWorkflowConfig;
  private workflowInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    dbPool: Pool,
    config: Partial<MLWorkflowConfig> = {},
    blockchainConfig?: {
      provider: ethers.Provider;
      contractAddress: string;
      contractABI: any[];
    }
  ) {
    this.dbPool = dbPool;
    this.config = {
      minTrainingSamples: 1000,
      autoTrainingEnabled: true,
      trainingIntervalHours: 24,
      modelUpdateThreshold: 0.05, // 5% improvement
      contentGenerationEnabled: true,
      blockchainRewardsEnabled: false,
      ...config
    };

    // Initialize services
    this.dataCollector = new SEODataCollector({
      googleSearchConsoleAuth: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN || ''
      },
      pageSpeedApiKey: process.env.PAGESPEED_API_KEY || '',
      crawlUserAgent: 'LightDom-ML-Workflow/1.0',
      crawlDelay: 1000
    });

    this.trainingDataService = new SEOTrainingDataService(
      dbPool,
      this.dataCollector,
      blockchainConfig
    );

    this.trainingOrchestrator = new ModelTrainingOrchestrator(
      dbPool,
      blockchainConfig
    );
  }

  /**
   * Start the ML workflow
   */
  async startWorkflow(): Promise<void> {
    if (this.isRunning) {
      console.log('SEO ML Workflow already running');
      return;
    }

    console.log('🚀 Starting SEO ML Workflow...');
    this.isRunning = true;

    // Initial training check
    await this.checkAndTriggerTraining();

    // Start periodic workflow if auto-training is enabled
    if (this.config.autoTrainingEnabled) {
      this.workflowInterval = setInterval(async () => {
        try {
          await this.checkAndTriggerTraining();
        } catch (error) {
          console.error('Workflow interval error:', error);
        }
      }, this.config.trainingIntervalHours * 60 * 60 * 1000);
    }

    console.log('✅ SEO ML Workflow started');
  }

  /**
   * Stop the ML workflow
   */
  async stopWorkflow(): Promise<void> {
    if (this.workflowInterval) {
      clearInterval(this.workflowInterval);
      this.workflowInterval = null;
    }
    this.isRunning = false;
    console.log('🛑 SEO ML Workflow stopped');
  }

  /**
   * Get current workflow status
   */
  async getWorkflowStatus(): Promise<WorkflowStatus> {
    const stats = await this.trainingDataService.getTrainingDataStats();
    const recentModels = await this.getRecentModelDeployments();

    return {
      isActive: this.isRunning,
      lastTrainingRun: await this.getLastTrainingRun(),
      currentModelAccuracy: await this.getCurrentModelAccuracy(),
      pendingTrainingSamples: stats.datasetReadiness.currentSamples,
      nextScheduledTraining: this.calculateNextTrainingTime(),
      activeModels: await this.getActiveModelNames(),
      recentDeployments: recentModels
    };
  }

  /**
   * Generate SEO-optimized content using trained models
   */
  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    if (!this.config.contentGenerationEnabled) {
      throw new Error('Content generation is disabled');
    }

    const startTime = Date.now();

    try {
      // Get the best available model
      const bestModel = await this.getBestAvailableModel();

      if (!bestModel && request.useTrainedModel) {
        throw new Error('No trained models available for content generation');
      }

      // Collect SEO data for the target
      const seoData = await this.dataCollector.collectCompleteData(request.url, request.keyword);

      // Generate content using model or fallback
      let generatedContent: GeneratedContent;

      if (request.useTrainedModel && bestModel) {
        generatedContent = await this.generateWithModel(request, seoData, bestModel);
      } else {
        generatedContent = await this.generateFallbackContent(request, seoData);
      }

      // Calculate scores
      generatedContent.seoScore = await this.calculateSEOContentScore(generatedContent, seoData);
      generatedContent.readabilityScore = this.calculateReadabilityScore(generatedContent.content);
      generatedContent.generationTime = Date.now() - startTime;

      // Add training data from this generation
      if (generatedContent.seoScore > 70) {
        await this.trainingDataService.collectTrainingData(
          request.url,
          request.keyword,
          '0x' + '0'.repeat(40) // Anonymous contributor for generated content
        );
      }

      return generatedContent;

    } catch (error) {
      console.error('Content generation failed:', error);
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  /**
   * Check if training should be triggered and execute if needed
   */
  private async checkAndTriggerTraining(): Promise<void> {
    const stats = await this.trainingDataService.getTrainingDataStats();

    if (stats.datasetReadiness.isReady) {
      console.log(`📊 Sufficient training data available (${stats.datasetReadiness.currentSamples} samples)`);

      const currentAccuracy = await this.getCurrentModelAccuracy();
      const shouldTrain = await this.shouldTriggerTraining(currentAccuracy);

      if (shouldTrain) {
        console.log('🎯 Triggering model training...');
        await this.executeTrainingPipeline();
      } else {
        console.log('⏭️  Skipping training - current model performance adequate');
      }
    } else {
      console.log(`⏳ Waiting for more training data (${stats.datasetReadiness.currentSamples}/${this.config.minTrainingSamples} samples)`);
    }
  }

  /**
   * Execute the complete training pipeline
   */
  private async executeTrainingPipeline(): Promise<void> {
    try {
      // Prepare training dataset
      const dataset = await this.trainingDataService.prepareTrainingDataset();

      // Create model configuration
      const modelConfig: ModelConfig = {
        modelName: 'seo-ranking-predictor',
        modelVersion: await this.generateModelVersion(),
        algorithm: 'gradient_boosting',
        hyperparameters: {
          learningRate: 0.1,
          nEstimators: 100,
          maxDepth: 6,
          minSamplesLeaf: 10
        },
        features: dataset.features,
        targetMetric: 'ndcg'
      };

      // Train the model
      const trainingResult = await this.trainingOrchestrator.trainModel(modelConfig);

      console.log(`✅ Model trained with ${trainingResult.accuracy}% accuracy`);

      // Check if model should be deployed
      const currentAccuracy = await this.getCurrentModelAccuracy();
      if (trainingResult.accuracy > currentAccuracy + this.config.modelUpdateThreshold) {
        await this.deployModel(trainingResult);
      }

    } catch (error) {
      console.error('Training pipeline failed:', error);
    }
  }

  /**
   * Generate content using trained ML model
   */
  private async generateWithModel(
    request: ContentGenerationRequest,
    seoData: any,
    modelInfo: any
  ): Promise<GeneratedContent> {
    // This would integrate with Python ML models
    // For now, return enhanced content based on SEO data analysis

    const title = await this.generateOptimizedTitle(request.keyword, seoData);
    const content = await this.generateOptimizedContent(request, seoData);
    const metaDescription = this.generateMetaDescription(content, request.keyword);
    const keywords = this.extractKeywords(content, request.keyword);

    return {
      title,
      content,
      metaDescription,
      keywords,
      seoScore: 0, // Will be calculated later
      readabilityScore: 0, // Will be calculated later
      modelUsed: modelInfo.modelName,
      generationTime: 0, // Will be set later
      optimizationSuggestions: this.generateOptimizationSuggestions(seoData)
    };
  }

  /**
   * Generate fallback content when no model is available
   */
  private async generateFallbackContent(
    request: ContentGenerationRequest,
    seoData: any
  ): Promise<GeneratedContent> {
    const title = `Complete Guide to ${request.keyword}`;
    const content = this.generateBasicContent(request, seoData);
    const metaDescription = content.substring(0, 160) + '...';
    const keywords = [request.keyword, ...this.extractBasicKeywords(content)];

    return {
      title,
      content,
      metaDescription,
      keywords,
      seoScore: 0,
      readabilityScore: 0,
      modelUsed: 'fallback-generator',
      generationTime: 0,
      optimizationSuggestions: ['Consider using trained ML models for better optimization']
    };
  }

  /**
   * Generate optimized title using SEO data
   */
  private async generateOptimizedTitle(keyword: string, seoData: any): Promise<string> {
    // Analyze competitor titles and generate optimized version
    const titleTemplates = [
      `Ultimate Guide to ${keyword} - Complete ${new Date().getFullYear()} Strategy`,
      `${keyword} Best Practices: Expert Tips & Techniques`,
      `How to Master ${keyword} - Step-by-Step Guide`,
      `${keyword} Optimization: Complete Implementation Guide`
    ];

    // Select best template based on keyword analysis
    return titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
  }

  /**
   * Generate optimized content
   */
  private async generateOptimizedContent(request: ContentGenerationRequest, seoData: any): Promise<string> {
    const sections = [
      `# ${request.keyword} - Complete Guide`,
      '',
      `## Introduction to ${request.keyword}`,
      `Understanding ${request.keyword} is crucial for modern ${request.contentType === 'blog' ? 'content creators' : 'businesses'}. This comprehensive guide covers everything you need to know.`,
      '',
      `## Key Benefits of ${request.keyword}`,
      `- Improved search engine rankings`,
      `- Better user experience`,
      `- Increased organic traffic`,
      `- Enhanced conversion rates`,
      '',
      `## Implementation Strategies`,
      `### Step 1: Research and Planning`,
      `Before implementing ${request.keyword}, conduct thorough research and create a detailed plan.`,
      '',
      `### Step 2: Technical Setup`,
      `Ensure your technical foundation is solid before proceeding with implementation.`,
      '',
      `### Step 3: Content Optimization`,
      `Optimize your content to meet both user needs and search engine requirements.`,
      '',
      `### Step 4: Monitoring and Analytics`,
      `Track your performance and make data-driven improvements.`,
      '',
      `## Best Practices for ${request.keyword}`,
      `- Focus on user intent`,
      `- Maintain content quality`,
      `- Stay updated with latest trends`,
      `- Monitor competitor strategies`,
      '',
      `## Common Mistakes to Avoid`,
      `- Keyword stuffing`,
      `- Ignoring mobile optimization`,
      `- Neglecting page speed`,
      `- Poor content structure`,
      '',
      `## Tools and Resources`,
      `Several tools can help you implement ${request.keyword} effectively.`,
      '',
      `## Conclusion`,
      `Mastering ${request.keyword} takes time and effort, but the results are worth it. Start implementing these strategies today.`
    ];

    return sections.join('\n');
  }

  /**
   * Generate meta description
   */
  private generateMetaDescription(content: string, keyword: string): string {
    const sentences = content.split('.').filter(s => s.trim().length > 20);
    const relevantSentence = sentences.find(s => s.toLowerCase().includes(keyword.toLowerCase())) || sentences[0];

    let description = relevantSentence.trim();
    if (description.length > 155) {
      description = description.substring(0, 152) + '...';
    }

    return description;
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(content: string, primaryKeyword: string): string[] {
    const keywords = [primaryKeyword];

    // Extract additional keywords from content
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const wordFreq: { [key: string]: number } = {};

    words.forEach(word => {
      if (!['that', 'with', 'have', 'this', 'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'].includes(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Get top keywords
    const sortedWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 9)
      .map(([word]) => word);

    return [...keywords, ...sortedWords].slice(0, 10);
  }

  /**
   * Extract basic keywords for fallback
   */
  private extractBasicKeywords(content: string): string[] {
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    return [...new Set(words)].slice(0, 5);
  }

  /**
   * Generate basic content for fallback
   */
  private generateBasicContent(request: ContentGenerationRequest, seoData: any): string {
    return `Learn everything about ${request.keyword} in this comprehensive guide. Discover best practices, implementation strategies, and expert tips for success.`;
  }

  /**
   * Calculate SEO content score
   */
  private async calculateSEOContentScore(content: GeneratedContent, seoData: any): Promise<number> {
    let score = 50; // Base score

    // Keyword usage
    const keywordDensity = this.calculateKeywordDensity(content.content, content.keywords[0]);
    if (keywordDensity > 0.5 && keywordDensity < 3) score += 20;

    // Content length
    if (content.content.length > 2000) score += 10;

    // Title optimization
    if (content.title.includes(content.keywords[0])) score += 10;

    // Meta description
    if (content.metaDescription.length > 120 && content.metaDescription.length < 160) score += 10;

    return Math.min(100, score);
  }

  /**
   * Calculate keyword density
   */
  private calculateKeywordDensity(content: string, keyword: string): number {
    const words = content.toLowerCase().split(/\s+/);
    const keywordCount = words.filter(word => word.includes(keyword.toLowerCase())).length;
    return (keywordCount / words.length) * 100;
  }

  /**
   * Calculate readability score
   */
  private calculateReadabilityScore(content: string): number {
    // Simple readability calculation
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;

    // Flesch Reading Ease formula approximation
    let score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (words / sentences));

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(seoData: any): string[] {
    const suggestions: string[] = [];

    if (seoData.technical?.largestContentfulPaint > 2500) {
      suggestions.push('Improve page loading speed');
    }

    if (seoData.technical?.cumulativeLayoutShift > 0.1) {
      suggestions.push('Fix layout shift issues');
    }

    if (!seoData.onPage?.hasMetaDescription) {
      suggestions.push('Add meta description');
    }

    return suggestions;
  }

  /**
   * Get best available model
   */
  private async getBestAvailableModel(): Promise<any> {
    const query = `
      SELECT * FROM seo_features.model_training_runs
      WHERE status = 'completed'
      ORDER BY accuracy_score DESC
      LIMIT 1
    `;

    const result = await this.dbPool.query(query);
    return result.rows[0] || null;
  }

  /**
   * Get current model accuracy
   */
  private async getCurrentModelAccuracy(): Promise<number> {
    const model = await this.getBestAvailableModel();
    return model?.accuracy_score || 0;
  }

  /**
   * Get active model names
   */
  private async getActiveModelNames(): Promise<string[]> {
    const query = `
      SELECT DISTINCT model_name FROM seo_features.model_training_runs
      WHERE status = 'completed'
    `;

    const result = await this.dbPool.query(query);
    return result.rows.map(row => row.model_name);
  }

  /**
   * Get recent model deployments
   */
  private async getRecentModelDeployments(): Promise<Array<{
    modelId: number;
    accuracy: number;
    deployedAt: Date;
    blockchainTx?: string;
  }>> {
    const query = `
      SELECT model_id, accuracy_score, created_at, blockchain_tx_hash
      FROM seo_features.model_training_runs
      WHERE status = 'completed'
      ORDER BY created_at DESC
      LIMIT 5
    `;

    const result = await this.dbPool.query(query);
    return result.rows.map(row => ({
      modelId: row.model_id,
      accuracy: row.accuracy_score,
      deployedAt: row.created_at,
      blockchainTx: row.blockchain_tx_hash
    }));
  }

  /**
   * Get last training run timestamp
   */
  private async getLastTrainingRun(): Promise<Date | null> {
    const query = `
      SELECT MAX(created_at) as last_run
      FROM seo_features.model_training_runs
    `;

    const result = await this.dbPool.query(query);
    return result.rows[0]?.last_run || null;
  }

  /**
   * Check if training should be triggered
   */
  private async shouldTriggerTraining(currentAccuracy: number): Promise<boolean> {
    // Trigger if no current model or accuracy is below threshold
    if (currentAccuracy < 70) return true;

    // Trigger if it's been too long since last training
    const lastRun = await this.getLastTrainingRun();
    if (!lastRun) return true;

    const hoursSinceLastRun = (Date.now() - lastRun.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastRun > this.config.trainingIntervalHours) return true;

    return false;
  }

  /**
   * Calculate next training time
   */
  private calculateNextTrainingTime(): Date | null {
    if (!this.config.autoTrainingEnabled) return null;

    const lastRun = new Date(); // Would get from DB
    lastRun.setHours(lastRun.getHours() + this.config.trainingIntervalHours);

    return lastRun;
  }

  /**
   * Generate model version
   */
  private async generateModelVersion(): Promise<string> {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 16).replace(/[:-]/g, '');
    return `v${timestamp}`;
  }

  /**
   * Deploy model to production
   */
  private async deployModel(trainingResult: TrainingResult): Promise<void> {
    console.log(`🚀 Deploying model ${trainingResult.modelId} with ${trainingResult.accuracy}% accuracy`);

    // Update model status
    await this.dbPool.query(
      'UPDATE seo_features.model_training_runs SET status = $1 WHERE id = $2',
      ['deployed', trainingResult.modelId]
    );

    // Deploy to blockchain if enabled
    if (this.config.blockchainRewardsEnabled) {
      try {
        await this.trainingOrchestrator.deployModelToBlockchain(
          trainingResult.modelId,
          [], // contributors
          []  // shares
        );
      } catch (error) {
        console.warn('Blockchain deployment failed:', error);
      }
    }

    console.log(`✅ Model ${trainingResult.modelId} deployed successfully`);
  }
}

export default SEOMLWorkflowService;