/**
 * Space Mining API - RESTful endpoints for space mining and metaverse bridge operations
 * Handles spatial DOM extraction, Light DOM isolation, and bridge generation
 */

import { Request, Response } from 'express';
import { spaceMiningEngine } from '../core/SpaceMiningEngine';

export class SpaceMiningAPI {
  
  /**
   * Start space mining from URL
   * POST /api/space-mining/mine
   */
  async mineSpace(req: Request, res: Response): Promise<void> {
    try {
      const { url, priority, type } = req.body;

      if (!url) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'URL is required for space mining'
        });
        return;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        res.status(400).json({
          error: 'Invalid URL',
          message: 'Please provide a valid URL for space mining'
        });
        return;
      }

      console.log(`🚀 Space mining request for: ${url}`);
      
      const result = await spaceMiningEngine.mineSpaceFromURL(url);
      
      res.status(200).json({
        success: true,
        data: result,
        message: `Space mining completed for ${url}. Found ${result.spatialStructures.length} structures, isolated ${result.isolatedDOMs.length} DOM components, created ${result.generatedBridges.length} bridges.`
      });

    } catch (error) {
      console.error('Error in space mining:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Add URL to mining queue
   * POST /api/space-mining/queue
   */
  async addToMiningQueue(req: Request, res: Response): Promise<void> {
    try {
      const { url, priority = 1, type = 'full' } = req.body;

      if (!url) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'URL is required'
        });
        return;
      }

      spaceMiningEngine.addMiningTarget(url, priority, type);
      
      res.status(200).json({
        success: true,
        message: `URL ${url} added to mining queue with priority ${priority}`
      });

    } catch (error) {
      console.error('Error adding to mining queue:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all metaverse bridges
   * GET /api/space-mining/bridges
   */
  async getMetaverseBridges(req: Request, res: Response): Promise<void> {
    try {
      const bridges = spaceMiningEngine.getMetaverseBridges();
      
      res.json({
        success: true,
        data: { bridges },
        count: bridges.length
      });

    } catch (error) {
      console.error('Error fetching metaverse bridges:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get specific bridge details
   * GET /api/space-mining/bridge/:bridgeId
   */
  async getBridgeDetails(req: Request, res: Response): Promise<void> {
    try {
      const { bridgeId } = req.params;
      const bridges = spaceMiningEngine.getMetaverseBridges();
      const bridge = bridges.find(b => b.id === bridgeId);

      if (!bridge) {
        res.status(404).json({
          error: 'Bridge not found',
          message: `Bridge with ID ${bridgeId} does not exist`
        });
        return;
      }

      res.json({
        success: true,
        data: bridge
      });

    } catch (error) {
      console.error('Error fetching bridge details:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get bridge URL for routing
   * GET /api/space-mining/bridge/:bridgeId/url
   */
  async getBridgeURL(req: Request, res: Response): Promise<void> {
    try {
      const { bridgeId } = req.params;
      const bridgeURL = spaceMiningEngine.getBridgeURL(bridgeId);

      if (!bridgeURL) {
        res.status(404).json({
          error: 'Bridge not found',
          message: `Bridge with ID ${bridgeId} does not exist`
        });
        return;
      }

      res.json({
        success: true,
        data: {
          bridgeId,
          bridgeURL,
          fullURL: `${req.protocol}://${req.get('host')}${bridgeURL}`
        }
      });

    } catch (error) {
      console.error('Error fetching bridge URL:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all isolated Light DOM components
   * GET /api/space-mining/isolated-doms
   */
  async getIsolatedDOMs(req: Request, res: Response): Promise<void> {
    try {
      const isolatedDOMs = spaceMiningEngine.getIsolatedDOMs();
      
      res.json({
        success: true,
        data: { isolatedDOMs },
        count: isolatedDOMs.length
      });

    } catch (error) {
      console.error('Error fetching isolated DOMs:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get specific isolated DOM component
   * GET /api/space-mining/isolated-dom/:domId
   */
  async getIsolatedDOM(req: Request, res: Response): Promise<void> {
    try {
      const { domId } = req.params;
      const isolatedDOMs = spaceMiningEngine.getIsolatedDOMs();
      const isolatedDOM = isolatedDOMs.find(dom => dom.id === domId);

      if (!isolatedDOM) {
        res.status(404).json({
          error: 'Isolated DOM not found',
          message: `Isolated DOM with ID ${domId} does not exist`
        });
        return;
      }

      res.json({
        success: true,
        data: isolatedDOM
      });

    } catch (error) {
      console.error('Error fetching isolated DOM:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all spatial structures
   * GET /api/space-mining/spatial-structures
   */
  async getSpatialStructures(req: Request, res: Response): Promise<void> {
    try {
      const spatialStructures = spaceMiningEngine.getSpatialStructures();
      
      res.json({
        success: true,
        data: { spatialStructures },
        count: spatialStructures.length
      });

    } catch (error) {
      console.error('Error fetching spatial structures:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get space mining statistics
   * GET /api/space-mining/stats
   */
  async getMiningStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = spaceMiningEngine.getMiningStats();
      
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
   * Start continuous space mining
   * POST /api/space-mining/start-continuous
   */
  async startContinuousMining(req: Request, res: Response): Promise<void> {
    try {
      await spaceMiningEngine.startContinuousSpaceMining();
      
      res.json({
        success: true,
        message: 'Continuous space mining started'
      });

    } catch (error) {
      console.error('Error starting continuous mining:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate bridge routing URLs for isolated DOM
   * POST /api/space-mining/generate-routes
   */
  async generateBridgeRoutes(req: Request, res: Response): Promise<void> {
    try {
      const { domId, customPath } = req.body;

      if (!domId) {
        res.status(400).json({
          error: 'Invalid request',
          message: 'DOM ID is required'
        });
        return;
      }

      const isolatedDOMs = spaceMiningEngine.getIsolatedDOMs();
      const isolatedDOM = isolatedDOMs.find(dom => dom.id === domId);

      if (!isolatedDOM) {
        res.status(404).json({
          error: 'Isolated DOM not found',
          message: `Isolated DOM with ID ${domId} does not exist`
        });
        return;
      }

      // Generate routing URLs
      const baseURL = `${req.protocol}://${req.get('host')}`;
      const routes = {
        bridge: `${baseURL}${isolatedDOM.metaverseBridge.bridgeURL}`,
        chat: `${baseURL}${isolatedDOM.metaverseBridge.bridgeURL}/chat`,
        api: `${baseURL}/api/metaverse/bridge/${isolatedDOM.metaverseBridge.bridgeId}`,
        websocket: `${baseURL.replace('http', 'ws')}/bridge/${isolatedDOM.metaverseBridge.bridgeId}/ws`,
        custom: customPath ? `${baseURL}${customPath}` : null
      };

      res.json({
        success: true,
        data: {
          domId,
          bridgeId: isolatedDOM.metaverseBridge.bridgeId,
          routes,
          routingRules: isolatedDOM.metaverseBridge.routingRules
        }
      });

    } catch (error) {
      console.error('Error generating bridge routes:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test bridge connectivity
   * POST /api/space-mining/test-bridge/:bridgeId
   */
  async testBridgeConnectivity(req: Request, res: Response): Promise<void> {
    try {
      const { bridgeId } = req.params;
      const bridges = spaceMiningEngine.getMetaverseBridges();
      const bridge = bridges.find(b => b.id === bridgeId);

      if (!bridge) {
        res.status(404).json({
          error: 'Bridge not found',
          message: `Bridge with ID ${bridgeId} does not exist`
        });
        return;
      }

      // Simulate bridge connectivity test
      const testResults = {
        bridgeId: bridge.id,
        status: bridge.status,
        connectivity: {
          reachable: Math.random() > 0.1, // 90% success rate
          responseTime: Math.floor(Math.random() * 200) + 50,
          throughput: bridge.performance.throughput,
          reliability: bridge.performance.reliability
        },
        capabilities: bridge.capabilities,
        connectedDOMs: bridge.connectedDOMs.length,
        lastTested: new Date().toISOString()
      };

      res.json({
        success: true,
        data: testResults
      });

    } catch (error) {
      console.error('Error testing bridge connectivity:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Export singleton instance
export const spaceMiningAPI = new SpaceMiningAPI();