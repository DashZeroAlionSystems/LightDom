/**
 * SEO Training Data API Endpoints
 * Handles data collection, contribution, and model training management
 */

import express, { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { ethers } from 'ethers';
import { SEOTrainingDataService } from '../seo/services/SEOTrainingDataService';
import { SEODataCollector } from '../seo/services/SEODataCollector';

const router: Router = express.Router();

// Initialize services (these should be configured from environment)
let trainingService: SEOTrainingDataService;
let isInitialized = false;

// Initialize service with configuration
function initializeService(dbPool: Pool, blockchainConfig?: any) {
  if (isInitialized) return;
  
  // Initialize data collector
  const collector = new (SEODataCollector as any)({
    googleSearchConsoleAuth: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN || ''
    },
    pageSpeedApiKey: process.env.PAGESPEED_API_KEY || '',
    ahrefsApiToken: process.env.AHREFS_API_TOKEN,
    semrushApiKey: process.env.SEMRUSH_API_KEY,
    crawlUserAgent: 'LightDom SEO Bot/1.0',
    crawlDelay: 1000
  });
  
  // Initialize training service
  trainingService = new SEOTrainingDataService(
    dbPool,
    collector,
    blockchainConfig
  );
  
  isInitialized = true;
}

/**
 * POST /api/seo/training/contribute
 * Submit SEO data for training and earn rewards
 */
router.post('/contribute', async (req: Request, res: Response) => {
  try {
    const { url, keyword, contributorAddress } = req.body;
    
    // Validate inputs
    if (!url || !keyword || !contributorAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields: url, keyword, contributorAddress' 
      });
    }
    
    // Validate Ethereum address
    if (!ethers.isAddress(contributorAddress)) {
      return res.status(400).json({ 
        error: 'Invalid Ethereum address' 
      });
    }
    
    // Collect and submit training data
    const contribution = await trainingService.collectTrainingData(
      url,
      keyword,
      contributorAddress
    );
    
    res.json({
      success: true,
      contribution: {
        id: contribution.id,
        url: contribution.url,
        keyword: contribution.keyword,
        qualityScore: contribution.qualityScore,
        rewardAmount: contribution.rewardAmount,
        blockchainTxHash: contribution.blockchainTxHash,
        timestamp: contribution.timestamp
      },
      message: 'Data contribution submitted successfully'
    });
  } catch (error) {
    console.error('Contribution error:', error);
    res.status(500).json({ 
      error: 'Failed to submit contribution',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/training/stats
 * Get overall training data statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await trainingService.getTrainingDataStats();
    
    res.json({
      success: true,
      stats: {
        totalContributions: stats.totalContributions,
        totalFeatures: stats.totalFeatures,
        totalRewards: stats.totalRewards,
        uniqueContributors: stats.uniqueContributors,
        avgQualityScore: stats.avgQualityScore,
        datasetReadiness: stats.datasetReadiness
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/training/contributions/:address
 * Get contributions for a specific user
 */
router.get('/contributions/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Validate address
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ 
        error: 'Invalid Ethereum address' 
      });
    }
    
    const contributions = await trainingService.getUserContributions(address, limit);
    
    res.json({
      success: true,
      contributions: contributions.map(c => ({
        id: c.id,
        url: c.url,
        keyword: c.keyword,
        qualityScore: c.qualityScore,
        rewardAmount: c.rewardAmount,
        blockchainTxHash: c.blockchainTxHash,
        timestamp: c.timestamp
      })),
      total: contributions.length
    });
  } catch (error) {
    console.error('Contributions fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch contributions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/seo/training/prepare-dataset
 * Prepare training dataset for model training
 */
router.post('/prepare-dataset', async (req: Request, res: Response) => {
  try {
    const { 
      targetSize = 10000, 
      testSplit = 0.2 
    } = req.body;
    
    // Validate parameters
    if (targetSize < 100 || targetSize > 100000) {
      return res.status(400).json({ 
        error: 'Target size must be between 100 and 100000' 
      });
    }
    
    if (testSplit < 0.1 || testSplit > 0.5) {
      return res.status(400).json({ 
        error: 'Test split must be between 0.1 and 0.5' 
      });
    }
    
    const dataset = await trainingService.prepareTrainingDataset(
      targetSize,
      testSplit
    );
    
    res.json({
      success: true,
      dataset: {
        trainingSamples: dataset.trainingSet.length,
        testSamples: dataset.testSet.length,
        features: dataset.features,
        metadata: dataset.metadata
      },
      message: 'Dataset prepared successfully'
    });
  } catch (error) {
    console.error('Dataset preparation error:', error);
    res.status(500).json({ 
      error: 'Failed to prepare dataset',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/training/leaderboard
 * Get top contributors leaderboard
 */
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // This would query the contributor_statistics table
    // For now, returning mock data
    const leaderboard = [
      {
        rank: 1,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        contributions: 245,
        rewards: '12500000000000000000', // 12.5 tokens
        avgQualityScore: 92.3
      },
      {
        rank: 2,
        address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
        contributions: 198,
        rewards: '9800000000000000000', // 9.8 tokens
        avgQualityScore: 88.7
      },
      {
        rank: 3,
        address: '0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb',
        contributions: 176,
        rewards: '8600000000000000000', // 8.6 tokens
        avgQualityScore: 85.2
      }
    ];
    
    res.json({
      success: true,
      leaderboard: leaderboard.slice(0, limit)
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/training/feature-importance
 * Get feature importance scores from latest model
 */
router.get('/feature-importance', async (req: Request, res: Response) => {
  try {
    // This would query from the latest trained model
    // For now, returning standard feature importance
    const featureImportance = [
      { feature: 'domain_authority', importance: 0.145, category: 'authority' },
      { feature: 'content_quality_score', importance: 0.132, category: 'content' },
      { feature: 'total_backlinks', importance: 0.098, category: 'authority' },
      { feature: 'core_web_vitals_composite', importance: 0.087, category: 'technical' },
      { feature: 'engagement_rate', importance: 0.076, category: 'user_behavior' },
      { feature: 'content_freshness', importance: 0.065, category: 'temporal' },
      { feature: 'mobile_optimization', importance: 0.054, category: 'technical' },
      { feature: 'semantic_relevance', importance: 0.048, category: 'content' },
      { feature: 'page_authority', importance: 0.042, category: 'authority' },
      { feature: 'title_keyword_presence', importance: 0.038, category: 'on_page' }
    ];
    
    res.json({
      success: true,
      featureImportance,
      totalFeatures: 194,
      modelVersion: 'v1.0.0-mvp'
    });
  } catch (error) {
    console.error('Feature importance error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch feature importance',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/seo/training/validate-contribution
 * Validate data quality of a contribution (for validators)
 */
router.post('/validate-contribution', async (req: Request, res: Response) => {
  try {
    const { contributionId, validatorAddress, qualityScore } = req.body;
    
    // Validate inputs
    if (!contributionId || !validatorAddress || qualityScore === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: contributionId, validatorAddress, qualityScore' 
      });
    }
    
    if (qualityScore < 0 || qualityScore > 100) {
      return res.status(400).json({ 
        error: 'Quality score must be between 0 and 100' 
      });
    }
    
    // This would call the blockchain contract to validate
    // For now, returning success
    res.json({
      success: true,
      message: 'Contribution validated successfully',
      validation: {
        contributionId,
        validator: validatorAddress,
        qualityScore,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ 
      error: 'Failed to validate contribution',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/seo/training/rewards/:address
 * Get reward information for an address
 */
router.get('/rewards/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    
    // Validate address
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ 
        error: 'Invalid Ethereum address' 
      });
    }
    
    // Mock reward data
    const rewards = {
      totalEarned: '5250000000000000000', // 5.25 tokens
      pendingRewards: '125000000000000000', // 0.125 tokens
      claimedRewards: '5125000000000000000', // 5.125 tokens
      contributions: 87,
      averageRewardPerContribution: '60344827586206896', // ~0.06 tokens
      qualityBonus: '450000000000000000', // 0.45 tokens
      nextClaimableAt: new Date(Date.now() + 86400000).toISOString() // 24 hours
    };
    
    res.json({
      success: true,
      address,
      rewards
    });
  } catch (error) {
    console.error('Rewards fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch rewards',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Middleware to initialize service with database pool
 */
export function initializeSEOTrainingAPI(dbPool: Pool, blockchainConfig?: any) {
  initializeService(dbPool, blockchainConfig);
}

export default router;
