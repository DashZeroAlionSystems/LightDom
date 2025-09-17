/**
 * Space Optimization API - RESTful endpoints for space optimization tracking
 * Handles all optimization-related API calls
 */

import { Request, Response } from 'express';
import { spaceOptimizationEngine, OptimizationResult, HarvesterStats } from '../core/SpaceOptimizationEngine';

export class OptimizationAPI {
  
  /**
   * Submit a new space optimization
   * POST /api/optimization/submit
   */
  async submitOptimization(req: Request, res: Response): Promise<void> {
    try {
      const {
        url,
        spaceSavedBytes,
        optimizationType,
        biomeType,
        harvesterAddress,
        beforeHash,
        afterHash
      } = req.body;

      // Validate required fields
      if (!url || !spaceSavedBytes || spaceSavedBytes < 1024) {
        res.status(400).json({
          error: 'Invalid optimization data',
          message: 'URL and spaceSavedBytes (minimum 1KB) are required'
        });
        return;
      }

      // Process optimization
      const result = await spaceOptimizationEngine.processOptimization({
        url,
        spaceSavedBytes,
        optimizationType: optimizationType || 'light-dom',
        biomeType: biomeType || 'digital',
        harvesterAddress: harvesterAddress || '0x0000000000000000000000000000000000000000',
        beforeHash,
        afterHash
      });

      res.status(201).json({
        success: true,
        data: result,
        message: `Optimization processed: ${result.spaceSavedKB}KB saved, ${result.tokenReward.toFixed(6)} DSH earned`
      });

    } catch (error) {
      console.error('Error submitting optimization:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all optimizations
   * GET /api/optimization/list
   */
  async getOptimizations(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50, offset = 0, harvesterAddress } = req.query;
      
      let optimizations = spaceOptimizationEngine.getOptimizations();
      
      // Filter by harvester if specified
      if (harvesterAddress) {
        optimizations = optimizations.filter(opt => 
          opt.harvesterAddress.toLowerCase() === (harvesterAddress as string).toLowerCase()
        );
      }
      
      // Sort by timestamp (newest first)
      optimizations.sort((a, b) => b.timestamp - a.timestamp);
      
      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedOptimizations = optimizations.slice(start, end);
      
      res.json({
        success: true,
        data: {
          optimizations: paginatedOptimizations,
          total: optimizations.length,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      console.error('Error fetching optimizations:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get optimization by proof hash
   * GET /api/optimization/:proofHash
   */
  async getOptimization(req: Request, res: Response): Promise<void> {
    try {
      const { proofHash } = req.params;
      
      const optimization = spaceOptimizationEngine.getOptimization(proofHash);
      
      if (!optimization) {
        res.status(404).json({
          error: 'Optimization not found',
          message: `No optimization found with proof hash: ${proofHash}`
        });
        return;
      }
      
      res.json({
        success: true,
        data: optimization
      });

    } catch (error) {
      console.error('Error fetching optimization:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get harvester statistics
   * GET /api/harvester/:address
   */
  async getHarvesterStats(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;
      
      const stats = spaceOptimizationEngine.getHarvesterStats(address);
      
      if (!stats) {
        res.status(404).json({
          error: 'Harvester not found',
          message: `No harvester found with address: ${address}`
        });
        return;
      }
      
      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error fetching harvester stats:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all harvesters
   * GET /api/harvester/list
   */
  async getHarvesters(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50, offset = 0, sortBy = 'reputation' } = req.query;
      
      let harvesters = spaceOptimizationEngine.getAllHarvesters();
      
      // Sort harvesters
      switch (sortBy) {
        case 'reputation':
          harvesters.sort((a, b) => b.reputation - a.reputation);
          break;
        case 'space':
          harvesters.sort((a, b) => b.totalSpaceHarvested - a.totalSpaceHarvested);
          break;
        case 'tokens':
          harvesters.sort((a, b) => b.totalTokensEarned - a.totalTokensEarned);
          break;
        case 'optimizations':
          harvesters.sort((a, b) => b.optimizationCount - a.optimizationCount);
          break;
      }
      
      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedHarvesters = harvesters.slice(start, end);
      
      res.json({
        success: true,
        data: {
          harvesters: paginatedHarvesters,
          total: harvesters.length,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      console.error('Error fetching harvesters:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get metaverse statistics
   * GET /api/metaverse/stats
   */
  async getMetaverseStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = spaceOptimizationEngine.getMetaverseStats();
      const totalSpace = spaceOptimizationEngine.getTotalSpaceHarvested();
      const totalTokens = spaceOptimizationEngine.getTotalTokensDistributed();
      
      res.json({
        success: true,
        data: {
          ...stats,
          totalSpaceHarvested: totalSpace,
          totalSpaceHarvestedKB: Math.floor(totalSpace / 1024),
          totalTokensDistributed: totalTokens,
          totalOptimizations: spaceOptimizationEngine.getOptimizations().length
        }
      });

    } catch (error) {
      console.error('Error fetching metaverse stats:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get metaverse assets
   * GET /api/metaverse/assets
   */
  async getMetaverseAssets(req: Request, res: Response): Promise<void> {
    try {
      const { type, biomeType, limit = 50, offset = 0 } = req.query;
      
      let assets = spaceOptimizationEngine.getMetaverseAssets();
      
      // Filter by type if specified
      if (type) {
        assets = assets.filter(asset => asset.type === type);
      }
      
      // Filter by biome type if specified
      if (biomeType) {
        assets = assets.filter(asset => asset.biomeType === biomeType);
      }
      
      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedAssets = assets.slice(start, end);
      
      res.json({
        success: true,
        data: {
          assets: paginatedAssets,
          total: assets.length,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      console.error('Error fetching metaverse assets:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get optimization analytics
   * GET /api/analytics/optimization
   */
  async getOptimizationAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { period = '24h' } = req.query;
      
      const optimizations = spaceOptimizationEngine.getOptimizations();
      const now = Date.now();
      
      // Calculate period in milliseconds
      let periodMs = 24 * 60 * 60 * 1000; // 24 hours default
      switch (period) {
        case '1h':
          periodMs = 60 * 60 * 1000;
          break;
        case '24h':
          periodMs = 24 * 60 * 60 * 1000;
          break;
        case '7d':
          periodMs = 7 * 24 * 60 * 60 * 1000;
          break;
        case '30d':
          periodMs = 30 * 24 * 60 * 60 * 1000;
          break;
      }
      
      // Filter optimizations by period
      const recentOptimizations = optimizations.filter(opt => 
        now - opt.timestamp <= periodMs
      );
      
      // Calculate analytics
      const totalSpace = recentOptimizations.reduce((sum, opt) => sum + opt.spaceSavedBytes, 0);
      const totalTokens = recentOptimizations.reduce((sum, opt) => sum + opt.tokenReward, 0);
      const avgQuality = recentOptimizations.reduce((sum, opt) => sum + opt.qualityScore, 0) / recentOptimizations.length || 0;
      
      // Group by biome type
      const biomeStats: { [key: string]: { count: number; space: number; tokens: number } } = {};
      recentOptimizations.forEach(opt => {
        if (!biomeStats[opt.biomeType]) {
          biomeStats[opt.biomeType] = { count: 0, space: 0, tokens: 0 };
        }
        biomeStats[opt.biomeType].count++;
        biomeStats[opt.biomeType].space += opt.spaceSavedBytes;
        biomeStats[opt.biomeType].tokens += opt.tokenReward;
      });
      
      // Group by optimization type
      const typeStats: { [key: string]: { count: number; space: number; tokens: number } } = {};
      recentOptimizations.forEach(opt => {
        if (!typeStats[opt.optimizationType]) {
          typeStats[opt.optimizationType] = { count: 0, space: 0, tokens: 0 };
        }
        typeStats[opt.optimizationType].count++;
        typeStats[opt.optimizationType].space += opt.spaceSavedBytes;
        typeStats[opt.optimizationType].tokens += opt.tokenReward;
      });
      
      res.json({
        success: true,
        data: {
          period,
          totalOptimizations: recentOptimizations.length,
          totalSpaceHarvested: totalSpace,
          totalSpaceHarvestedKB: Math.floor(totalSpace / 1024),
          totalTokensDistributed: totalTokens,
          averageQualityScore: Math.round(avgQuality * 100) / 100,
          biomeStats,
          typeStats,
          topHarvesters: spaceOptimizationEngine.getAllHarvesters()
            .sort((a, b) => b.totalSpaceHarvested - a.totalSpaceHarvested)
            .slice(0, 10)
        }
      });

    } catch (error) {
      console.error('Error fetching optimization analytics:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get real-time optimization feed
   * GET /api/feed/optimizations
   */
  async getOptimizationFeed(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 20 } = req.query;
      
      const optimizations = spaceOptimizationEngine.getOptimizations()
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, Number(limit));
      
      // Format for feed display
      const feedItems = optimizations.map(opt => ({
        id: opt.proofHash,
        url: opt.url,
        spaceSavedKB: opt.spaceSavedKB,
        tokensEarned: opt.tokenReward,
        biomeType: opt.biomeType,
        optimizationType: opt.optimizationType,
        qualityScore: opt.qualityScore,
        timestamp: opt.timestamp,
        harvesterAddress: opt.harvesterAddress,
        metaverseAssets: opt.metaverseAssets.length
      }));
      
      res.json({
        success: true,
        data: {
          feed: feedItems,
          total: spaceOptimizationEngine.getOptimizations().length
        }
      });

    } catch (error) {
      console.error('Error fetching optimization feed:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Export singleton instance
export const optimizationAPI = new OptimizationAPI();
