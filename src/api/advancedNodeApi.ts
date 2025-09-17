/**
 * Advanced Node Management API - RESTful endpoints for node operations
 * Handles node creation, scaling, merging, and task management
 */

import { Request, Response } from 'express';
import { spaceOptimizationEngine } from '../core/SpaceOptimizationEngine';
import { advancedNodeManager } from '../core/AdvancedNodeManager';

export class AdvancedNodeAPI {
  /**
   * Create a new optimization node
   * POST /api/nodes/create
   */
  async createNode(req: Request, res: Response): Promise<void> {
    try {
      const { type, storageCapacity, biomeType, sourceOptimizations = [] } = req.body;

      // Validate required fields
      if (!type || !storageCapacity || !biomeType) {
        res.status(400).json({
          error: 'Invalid node data',
          message: 'Type, storageCapacity, and biomeType are required',
        });
        return;
      }

      // Validate node type
      const validTypes = ['ai_consensus', 'storage_shard', 'bridge', 'optimization', 'mining'];
      if (!validTypes.includes(type)) {
        res.status(400).json({
          error: 'Invalid node type',
          message: `Type must be one of: ${validTypes.join(', ')}`,
        });
        return;
      }

      // Create node
      const node = spaceOptimizationEngine.createOptimizationNode(
        storageCapacity,
        biomeType,
        type,
        sourceOptimizations
      );

      res.status(201).json({
        success: true,
        data: { node },
        message: `Node created: ${type} with ${storageCapacity}KB storage`,
      });
    } catch (error) {
      console.error('Error creating node:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get all nodes
   * GET /api/nodes/list
   */
  async getNodes(req: Request, res: Response): Promise<void> {
    try {
      const { type, status, limit = 50, offset = 0 } = req.query;

      let nodes = spaceOptimizationEngine.getAllOptimizationNodes();

      // Filter by type if specified
      if (type) {
        nodes = nodes.filter(node => node.type === type);
      }

      // Filter by status if specified
      if (status) {
        nodes = nodes.filter(node => node.status === status);
      }

      // Sort by creation date (newest first)
      nodes.sort((a, b) => b.createdAt - a.createdAt);

      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedNodes = nodes.slice(start, end);

      res.json({
        success: true,
        data: {
          nodes: paginatedNodes,
          total: nodes.length,
          limit: Number(limit),
          offset: Number(offset),
        },
      });
    } catch (error) {
      console.error('Error fetching nodes:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get node by ID
   * GET /api/nodes/:id
   */
  async getNode(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const nodeStats = spaceOptimizationEngine.getNodeStats(id);

      if (!nodeStats) {
        res.status(404).json({
          error: 'Node not found',
          message: `No node found with ID: ${id}`,
        });
        return;
      }

      res.json({
        success: true,
        data: nodeStats,
      });
    } catch (error) {
      console.error('Error fetching node:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Scale up a node
   * POST /api/nodes/:id/scale
   */
  async scaleUpNode(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { additionalStorage } = req.body;

      if (!additionalStorage || additionalStorage <= 0) {
        res.status(400).json({
          error: 'Invalid storage amount',
          message: 'Additional storage must be a positive number',
        });
        return;
      }

      const success = spaceOptimizationEngine.scaleUpNode(id, additionalStorage);

      if (!success) {
        res.status(400).json({
          error: 'Scaling failed',
          message: 'Unable to scale up node. Check storage limits.',
        });
        return;
      }

      res.json({
        success: true,
        message: `Node scaled up by ${additionalStorage}KB`,
      });
    } catch (error) {
      console.error('Error scaling node:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Merge multiple nodes
   * POST /api/nodes/merge
   */
  async mergeNodes(req: Request, res: Response): Promise<void> {
    try {
      const { nodeIds, newType = 'optimization' } = req.body;

      if (!nodeIds || !Array.isArray(nodeIds) || nodeIds.length < 2) {
        res.status(400).json({
          error: 'Invalid node IDs',
          message: 'At least 2 node IDs are required for merging',
        });
        return;
      }

      const mergedNode = spaceOptimizationEngine.mergeNodes(nodeIds, newType);

      if (!mergedNode) {
        res.status(400).json({
          error: 'Merge failed',
          message: 'Unable to merge nodes. Check node IDs and types.',
        });
        return;
      }

      res.json({
        success: true,
        data: { node: mergedNode },
        message: `Successfully merged ${nodeIds.length} nodes into ${newType} node`,
      });
    } catch (error) {
      console.error('Error merging nodes:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get system statistics
   * GET /api/nodes/stats
   */
  async getSystemStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = spaceOptimizationEngine.getSystemNodeStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Create optimization task
   * POST /api/tasks/create
   */
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const { nodeId, type, targetUrl } = req.body;

      // Validate required fields
      if (!nodeId || !type || !targetUrl) {
        res.status(400).json({
          error: 'Invalid task data',
          message: 'nodeId, type, and targetUrl are required',
        });
        return;
      }

      // Validate task type
      const validTypes = [
        'dom_analysis',
        'css_optimization',
        'js_minification',
        'image_compression',
        'bundle_optimization',
      ];
      if (!validTypes.includes(type)) {
        res.status(400).json({
          error: 'Invalid task type',
          message: `Type must be one of: ${validTypes.join(', ')}`,
        });
        return;
      }

      // Create task
      const task = spaceOptimizationEngine.createOptimizationTask(nodeId, type, targetUrl);

      res.status(201).json({
        success: true,
        data: { task },
        message: `Task created: ${type} for ${targetUrl}`,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get all tasks
   * GET /api/tasks/list
   */
  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const { nodeId, status, limit = 50, offset = 0 } = req.query;

      // Get all tasks from the node manager
      const allTasks = advancedNodeManager.getAllTasks();
      let tasks = allTasks;

      // Filter by node ID if specified
      if (nodeId) {
        tasks = tasks.filter(task => task.nodeId === nodeId);
      }

      // Filter by status if specified
      if (status) {
        tasks = tasks.filter(task => task.status === status);
      }

      // Sort by creation date (newest first)
      tasks.sort((a, b) => b.createdAt - a.createdAt);

      // Apply pagination
      const start = Number(offset);
      const end = start + Number(limit);
      const paginatedTasks = tasks.slice(start, end);

      res.json({
        success: true,
        data: {
          tasks: paginatedTasks,
          total: tasks.length,
          limit: Number(limit),
          offset: Number(offset),
        },
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Process optimization tasks
   * POST /api/tasks/process
   */
  async processTasks(req: Request, res: Response): Promise<void> {
    try {
      const { taskIds } = req.body;

      if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
        res.status(400).json({
          error: 'Invalid task IDs',
          message: 'Task IDs array is required',
        });
        return;
      }

      // Process tasks
      const results = await spaceOptimizationEngine.processOptimizationTasks(taskIds);

      res.json({
        success: true,
        data: { results },
        message: `Processed ${results.length} tasks`,
      });
    } catch (error) {
      console.error('Error processing tasks:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get optimization recommendations
   * GET /api/nodes/recommendations
   */
  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { availableSpace = 1000 } = req.query;

      const recommendations = spaceOptimizationEngine.getOptimizationRecommendations(
        Number(availableSpace)
      );

      res.json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Create distributed optimization network
   * POST /api/nodes/network
   */
  async createNetwork(req: Request, res: Response): Promise<void> {
    try {
      const { spaceKB, biomeType } = req.body;

      if (!spaceKB || !biomeType) {
        res.status(400).json({
          error: 'Invalid network data',
          message: 'spaceKB and biomeType are required',
        });
        return;
      }

      // Create distributed network
      const network = spaceOptimizationEngine.createDistributedOptimizationNetwork(
        spaceKB,
        biomeType
      );

      res.json({
        success: true,
        data: network,
        message: `Created network with ${network.nodes.length} nodes`,
      });
    } catch (error) {
      console.error('Error creating network:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Run continuous optimization
   * POST /api/nodes/:id/optimize
   */
  async runContinuousOptimization(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { targetUrls, taskType = 'dom_analysis' } = req.body;

      if (!targetUrls || !Array.isArray(targetUrls) || targetUrls.length === 0) {
        res.status(400).json({
          error: 'Invalid target URLs',
          message: 'Target URLs array is required',
        });
        return;
      }

      // Run continuous optimization
      const results = await spaceOptimizationEngine.runContinuousOptimization(
        id,
        targetUrls,
        taskType
      );

      res.json({
        success: true,
        data: { results },
        message: `Processed ${results.length} optimization tasks`,
      });
    } catch (error) {
      console.error('Error running continuous optimization:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Optimize storage allocation
   * POST /api/nodes/optimize-storage
   */
  async optimizeStorage(req: Request, res: Response): Promise<void> {
    try {
      spaceOptimizationEngine.optimizeStorageAllocation();

      res.json({
        success: true,
        message: 'Storage allocation optimized',
      });
    } catch (error) {
      console.error('Error optimizing storage:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Export singleton instance
export const advancedNodeAPI = new AdvancedNodeAPI();
