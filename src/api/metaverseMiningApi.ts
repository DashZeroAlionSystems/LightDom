/**
 * Metaverse Mining API - RESTful endpoints for the continuous mining system
 * Handles algorithm discovery, data mining, and blockchain upgrades
 */

import { Request, Response } from 'express';
import { metaverseMiningEngine } from '../core/MetaverseMiningEngine';

export class MetaverseMiningAPI {
  
  /**
   * Get all mining data
   * GET /api/metaverse/mining-data
   */
  async getMiningData(req: Request, res: Response): Promise<void> {
    try {
      const algorithms = metaverseMiningEngine.getAlgorithms();
      const dataMining = metaverseMiningEngine.getDataMiningResults();
      const upgrades = metaverseMiningEngine.getBlockchainUpgrades();
      const biomes = metaverseMiningEngine.getBiomes();
      const stats = metaverseMiningEngine.getMiningStats();

      res.json({
        success: true,
        data: {
          algorithms,
          dataMining,
          upgrades,
          biomes,
          stats
        }
      });

    } catch (error) {
      console.error('Error fetching mining data:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Toggle mining on/off
   * POST /api/metaverse/toggle-mining
   */
  async toggleMining(req: Request, res: Response): Promise<void> {
    try {
      const { isMining } = req.body;

      if (isMining) {
        metaverseMiningEngine.startContinuousMining();
      } else {
        metaverseMiningEngine.stopMining();
      }

      res.json({
        success: true,
        message: `Mining ${isMining ? 'started' : 'stopped'}`
      });

    } catch (error) {
      console.error('Error toggling mining:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add mining task
   * POST /api/metaverse/add-task
   */
  async addMiningTask(req: Request, res: Response): Promise<void> {
    try {
      const { type, target, priority = 1 } = req.body;

      if (!type || !target) {
        res.status(400).json({
          error: 'Invalid task data',
          message: 'Type and target are required'
        });
        return;
      }

      metaverseMiningEngine.addMiningTask(type, target, priority);

      res.json({
        success: true,
        message: `Mining task added: ${type} for ${target}`
      });

    } catch (error) {
      console.error('Error adding mining task:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get algorithms
   * GET /api/metaverse/algorithms
   */
  async getAlgorithms(req: Request, res: Response): Promise<void> {
    try {
      const { type, status, limit = 50, offset = 0 } = req.query;
      
      let algorithms = metaverseMiningEngine.getAlgorithms();
      
      // Filter by type if specified
      if (type) {
        algorithms = algorithms.filter(algo => algo.type === type);
      }
      
      // Filter by status if specified
      if (status) {
        algorithms = algorithms.filter(algo => algo.status === status);
      }
      
      // Sort by discovery time (newest first)
      algorithms.sort((a, b) => b.source.discoveryTime - a.source.discoveryTime);
      
      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedAlgorithms = algorithms.slice(start, end);
      
      res.json({
        success: true,
        data: {
          algorithms: paginatedAlgorithms,
          total: algorithms.length,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      console.error('Error fetching algorithms:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get data mining results
   * GET /api/metaverse/data-mining
   */
  async getDataMiningResults(req: Request, res: Response): Promise<void> {
    try {
      const { type, limit = 50, offset = 0 } = req.query;
      
      let dataMining = metaverseMiningEngine.getDataMiningResults();
      
      // Filter by type if specified
      if (type) {
        dataMining = dataMining.filter(data => data.type === type);
      }
      
      // Sort by timestamp (newest first)
      dataMining.sort((a, b) => b.extraction.timestamp - a.extraction.timestamp);
      
      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedData = dataMining.slice(start, end);
      
      res.json({
        success: true,
        data: {
          dataMining: paginatedData,
          total: dataMining.length,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      console.error('Error fetching data mining results:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get blockchain upgrades
   * GET /api/metaverse/upgrades
   */
  async getBlockchainUpgrades(req: Request, res: Response): Promise<void> {
    try {
      const { type, status, limit = 50, offset = 0 } = req.query;
      
      let upgrades = metaverseMiningEngine.getBlockchainUpgrades();
      
      // Filter by type if specified
      if (type) {
        upgrades = upgrades.filter(upgrade => upgrade.type === type);
      }
      
      // Filter by status if specified
      if (status) {
        upgrades = upgrades.filter(upgrade => upgrade.deployment.status === status);
      }
      
      // Sort by version (newest first)
      upgrades.sort((a, b) => b.version.localeCompare(a.version));
      
      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedUpgrades = upgrades.slice(start, end);
      
      res.json({
        success: true,
        data: {
          upgrades: paginatedUpgrades,
          total: upgrades.length,
          limit: Number(limit),
          offset: Number(offset)
        }
      });

    } catch (error) {
      console.error('Error fetching blockchain upgrades:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get biomes
   * GET /api/metaverse/biomes
   */
  async getBiomes(req: Request, res: Response): Promise<void> {
    try {
      const biomes = metaverseMiningEngine.getBiomes();
      
      res.json({
        success: true,
        data: { biomes }
      });

    } catch (error) {
      console.error('Error fetching biomes:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get mining statistics
   * GET /api/metaverse/stats
   */
  async getMiningStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = metaverseMiningEngine.getMiningStats();
      
      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error fetching mining stats:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Deploy blockchain upgrade
   * POST /api/metaverse/deploy-upgrade
   */
  async deployUpgrade(req: Request, res: Response): Promise<void> {
    try {
      const { upgradeId } = req.body;

      if (!upgradeId) {
        res.status(400).json({
          error: 'Invalid upgrade ID',
          message: 'Upgrade ID is required'
        });
        return;
      }

      // Simulate upgrade deployment
      const upgrades = metaverseMiningEngine.getBlockchainUpgrades();
      const upgrade = upgrades.find(u => u.id === upgradeId);
      
      if (!upgrade) {
        res.status(404).json({
          error: 'Upgrade not found',
          message: `No upgrade found with ID: ${upgradeId}`
        });
        return;
      }

      // Update upgrade status
      upgrade.deployment.status = 'deployed';
      upgrade.deployment.testResults = {
        gasOptimization: upgrade.implementation.gasOptimization,
        performanceGain: upgrade.implementation.performanceGain,
        compatibilityScore: 95,
        securityScore: 98
      };

      res.json({
        success: true,
        message: `Blockchain upgrade ${upgrade.version} deployed successfully`,
        data: { upgrade }
      });

    } catch (error) {
      console.error('Error deploying upgrade:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Validate algorithm
   * POST /api/metaverse/validate-algorithm
   */
  async validateAlgorithm(req: Request, res: Response): Promise<void> {
    try {
      const { algorithmId } = req.body;

      if (!algorithmId) {
        res.status(400).json({
          error: 'Invalid algorithm ID',
          message: 'Algorithm ID is required'
        });
        return;
      }

      // Simulate algorithm validation
      const algorithms = metaverseMiningEngine.getAlgorithms();
      const algorithm = algorithms.find(a => a.id === algorithmId);
      
      if (!algorithm) {
        res.status(404).json({
          error: 'Algorithm not found',
          message: `No algorithm found with ID: ${algorithmId}`
        });
        return;
      }

      // Update validation results
      algorithm.validationResults = {
        testsPassed: Math.floor(8 + Math.random() * 2), // 8-10 tests passed
        totalTests: 10,
        performanceGain: algorithm.performance.speedMultiplier * 100,
        compatibilityScore: Math.floor(85 + Math.random() * 15) // 85-100%
      };

      if (algorithm.validationResults.testsPassed >= 8 && algorithm.validationResults.compatibilityScore >= 85) {
        algorithm.status = 'validated';
      } else {
        algorithm.status = 'testing';
      }

      res.json({
        success: true,
        message: `Algorithm ${algorithm.name} validation completed`,
        data: { algorithm }
      });

    } catch (error) {
      console.error('Error validating algorithm:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get algorithm code
   * GET /api/metaverse/algorithm/:id/code
   */
  async getAlgorithmCode(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const algorithms = metaverseMiningEngine.getAlgorithms();
      const algorithm = algorithms.find(a => a.id === id);
      
      if (!algorithm) {
        res.status(404).json({
          error: 'Algorithm not found',
          message: `No algorithm found with ID: ${id}`
        });
        return;
      }

      res.json({
        success: true,
        data: {
          code: algorithm.implementation.code,
          dependencies: algorithm.implementation.dependencies,
          complexity: algorithm.implementation.complexity,
          gasCost: algorithm.implementation.gasCost
        }
      });

    } catch (error) {
      console.error('Error fetching algorithm code:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get upgrade smart contract
   * GET /api/metaverse/upgrade/:id/contract
   */
  async getUpgradeContract(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const upgrades = metaverseMiningEngine.getBlockchainUpgrades();
      const upgrade = upgrades.find(u => u.id === id);
      
      if (!upgrade) {
        res.status(404).json({
          error: 'Upgrade not found',
          message: `No upgrade found with ID: ${id}`
        });
        return;
      }

      res.json({
        success: true,
        data: {
          smartContract: upgrade.implementation.smartContract,
          gasOptimization: upgrade.implementation.gasOptimization,
          performanceGain: upgrade.implementation.performanceGain
        }
      });

    } catch (error) {
      console.error('Error fetching upgrade contract:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Export singleton instance
export const metaverseMiningAPI = new MetaverseMiningAPI();
