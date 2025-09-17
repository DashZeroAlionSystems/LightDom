/**
 * Advanced Node Manager - Manages nodes and storage utilization from mined space
 * Enables setting up new nodes, running additional nodes, and optimizing storage usage
 */

export interface NodeConfig {
  id: string;
  type: 'ai_consensus' | 'storage_shard' | 'bridge' | 'optimization' | 'mining';
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  storageCapacity: number; // in KB
  usedStorage: number; // in KB
  availableStorage: number; // in KB
  computePower: number; // processing units
  rewardRate: number; // DSH per day
  biomeType: string;
  sourceOptimizations: string[]; // proof hashes that created this node
  createdAt: number;
  lastActivity: number;
  performance: {
    uptime: number; // percentage
    efficiency: number; // percentage
    tasksCompleted: number;
    rewardsEarned: number;
  };
}

export interface StorageAllocation {
  id: string;
  nodeId: string;
  optimizationId: string;
  spaceAllocated: number; // in KB
  purpose: 'caching' | 'processing' | 'backup' | 'replication' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  createdAt: number;
  expiresAt?: number;
}

export interface OptimizationTask {
  id: string;
  nodeId: string;
  type:
    | 'dom_analysis'
    | 'css_optimization'
    | 'js_minification'
    | 'image_compression'
    | 'bundle_optimization';
  targetUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  spaceSaved: number; // in KB
  tokensEarned: number;
  createdAt: number;
  completedAt?: number;
  error?: string;
}

export class AdvancedNodeManager {
  private nodes: Map<string, NodeConfig> = new Map();
  private storageAllocations: Map<string, StorageAllocation> = new Map();
  private optimizationTasks: Map<string, OptimizationTask> = new Map();
  private nodeCounter = 0;
  private allocationCounter = 0;
  private taskCounter = 0;

  // Node type configurations
  private readonly nodeConfigs = {
    ai_consensus: {
      baseStorage: 1000, // 1MB base
      computePower: 100,
      rewardRate: 0.1, // 0.1 DSH per day per KB
      maxStorage: 10000, // 10MB max
    },
    storage_shard: {
      baseStorage: 500, // 500KB base
      computePower: 50,
      rewardRate: 0.05, // 0.05 DSH per day per KB
      maxStorage: 50000, // 50MB max
    },
    bridge: {
      baseStorage: 2000, // 2MB base
      computePower: 200,
      rewardRate: 0.2, // 0.2 DSH per day per KB
      maxStorage: 20000, // 20MB max
    },
    optimization: {
      baseStorage: 100, // 100KB base
      computePower: 25,
      rewardRate: 0.15, // 0.15 DSH per day per KB
      maxStorage: 5000, // 5MB max
    },
    mining: {
      baseStorage: 300, // 300KB base
      computePower: 75,
      rewardRate: 0.08, // 0.08 DSH per day per KB
      maxStorage: 15000, // 15MB max
    },
  };

  /**
   * Create a new node from mined storage
   */
  createNode(
    type: NodeConfig['type'],
    storageCapacity: number,
    biomeType: string,
    sourceOptimizations: string[] = []
  ): NodeConfig {
    const config = this.nodeConfigs[type];
    const nodeId = `node_${++this.nodeCounter}_${Date.now()}`;

    const node: NodeConfig = {
      id: nodeId,
      type,
      status: 'active',
      storageCapacity: Math.min(storageCapacity, config.maxStorage),
      usedStorage: config.baseStorage,
      availableStorage: Math.min(storageCapacity, config.maxStorage) - config.baseStorage,
      computePower: config.computePower,
      rewardRate: config.rewardRate,
      biomeType,
      sourceOptimizations,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      performance: {
        uptime: 100,
        efficiency: 85,
        tasksCompleted: 0,
        rewardsEarned: 0,
      },
    };

    this.nodes.set(nodeId, node);
    return node;
  }

  /**
   * Allocate storage to a specific purpose
   */
  allocateStorage(
    nodeId: string,
    optimizationId: string,
    spaceAllocated: number,
    purpose: StorageAllocation['purpose'],
    priority: StorageAllocation['priority'] = 'medium',
    expiresAt?: number
  ): StorageAllocation {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    if (spaceAllocated > node.availableStorage) {
      throw new Error(
        `Insufficient storage. Available: ${node.availableStorage}KB, Requested: ${spaceAllocated}KB`
      );
    }

    const allocationId = `alloc_${++this.allocationCounter}_${Date.now()}`;
    const allocation: StorageAllocation = {
      id: allocationId,
      nodeId,
      optimizationId,
      spaceAllocated,
      purpose,
      priority,
      createdAt: Date.now(),
      expiresAt,
    };

    // Update node storage
    node.usedStorage += spaceAllocated;
    node.availableStorage -= spaceAllocated;
    node.lastActivity = Date.now();

    this.storageAllocations.set(allocationId, allocation);
    return allocation;
  }

  /**
   * Deallocate storage
   */
  deallocateStorage(allocationId: string): boolean {
    const allocation = this.storageAllocations.get(allocationId);
    if (!allocation) {
      return false;
    }

    const node = this.nodes.get(allocation.nodeId);
    if (node) {
      node.usedStorage -= allocation.spaceAllocated;
      node.availableStorage += allocation.spaceAllocated;
      node.lastActivity = Date.now();
    }

    this.storageAllocations.delete(allocationId);
    return true;
  }

  /**
   * Create an optimization task for a node
   */
  createOptimizationTask(
    nodeId: string,
    type: OptimizationTask['type'],
    targetUrl: string
  ): OptimizationTask {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    if (node.status !== 'active') {
      throw new Error(`Node ${nodeId} is not active`);
    }

    const taskId = `task_${++this.taskCounter}_${Date.now()}`;
    const task: OptimizationTask = {
      id: taskId,
      nodeId,
      type,
      targetUrl,
      status: 'pending',
      spaceSaved: 0,
      tokensEarned: 0,
      createdAt: Date.now(),
    };

    this.optimizationTasks.set(taskId, task);
    return task;
  }

  /**
   * Process an optimization task
   */
  async processOptimizationTask(taskId: string): Promise<OptimizationTask> {
    const task = this.optimizationTasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const node = this.nodes.get(task.nodeId);
    if (!node) {
      throw new Error(`Node ${task.nodeId} not found`);
    }

    task.status = 'processing';
    node.lastActivity = Date.now();

    try {
      // Simulate optimization processing
      await this.simulateOptimizationProcessing(task, node);

      task.status = 'completed';
      task.completedAt = Date.now();

      // Update node performance
      node.performance.tasksCompleted++;
      node.performance.rewardsEarned += task.tokensEarned;
      node.performance.efficiency = Math.min(100, node.performance.efficiency + 1);
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return task;
  }

  /**
   * Simulate optimization processing
   */
  private async simulateOptimizationProcessing(
    task: OptimizationTask,
    node: NodeConfig
  ): Promise<void> {
    // Simulate processing time based on compute power
    const processingTime = Math.max(1000, 5000 - node.computePower * 10);
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Calculate space saved based on task type and node performance
    const baseSpaceSaved = this.getBaseSpaceSavedForTaskType(task.type);
    const performanceMultiplier = node.performance.efficiency / 100;
    const storageMultiplier = Math.min(2, node.usedStorage / 1000); // Up to 2x based on storage

    task.spaceSaved = Math.floor(baseSpaceSaved * performanceMultiplier * storageMultiplier);
    task.tokensEarned = (task.spaceSaved * node.rewardRate) / 1000; // Convert KB to DSH
  }

  /**
   * Get base space saved for task type
   */
  private getBaseSpaceSavedForTaskType(type: OptimizationTask['type']): number {
    const baseRates = {
      dom_analysis: 50, // 50KB base
      css_optimization: 30, // 30KB base
      js_minification: 40, // 40KB base
      image_compression: 100, // 100KB base
      bundle_optimization: 80, // 80KB base
    };
    return baseRates[type] || 25;
  }

  /**
   * Scale up a node with additional storage
   */
  scaleUpNode(nodeId: string, additionalStorage: number): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return false;
    }

    const config = this.nodeConfigs[node.type];
    const newCapacity = node.storageCapacity + additionalStorage;

    if (newCapacity > config.maxStorage) {
      return false; // Exceeds maximum capacity
    }

    node.storageCapacity = newCapacity;
    node.availableStorage += additionalStorage;
    node.computePower += Math.floor(additionalStorage / 100); // 1 compute power per 100KB
    node.lastActivity = Date.now();

    return true;
  }

  /**
   * Merge multiple nodes into a more powerful node
   */
  mergeNodes(nodeIds: string[], newType: NodeConfig['type'] = 'optimization'): NodeConfig | null {
    if (nodeIds.length < 2) {
      return null;
    }

    const nodes = nodeIds.map(id => this.nodes.get(id)).filter(Boolean) as NodeConfig[];
    if (nodes.length !== nodeIds.length) {
      return null; // Some nodes not found
    }

    // Calculate combined resources
    const totalStorage = nodes.reduce((sum, node) => sum + node.storageCapacity, 0);
    const totalCompute = nodes.reduce((sum, node) => sum + node.computePower, 0);
    const totalRewards = nodes.reduce((sum, node) => sum + node.performance.rewardsEarned, 0);
    const totalTasks = nodes.reduce((sum, node) => sum + node.performance.tasksCompleted, 0);
    const allSourceOptimizations = nodes.flatMap(node => node.sourceOptimizations);

    // Create merged node
    const mergedNode = this.createNode(
      newType,
      totalStorage,
      nodes[0].biomeType, // Use first node's biome
      allSourceOptimizations
    );

    // Update merged node with combined stats
    mergedNode.computePower = totalCompute;
    mergedNode.performance.rewardsEarned = totalRewards;
    mergedNode.performance.tasksCompleted = totalTasks;
    mergedNode.performance.efficiency = Math.min(
      100,
      nodes.reduce((sum, node) => sum + node.performance.efficiency, 0) / nodes.length
    );

    // Deactivate original nodes
    nodes.forEach(node => {
      node.status = 'offline';
      node.lastActivity = Date.now();
    });

    return mergedNode;
  }

  /**
   * Get node statistics
   */
  getNodeStats(nodeId: string): any {
    const node = this.nodes.get(nodeId);
    if (!node) {
      return null;
    }

    const allocations = Array.from(this.storageAllocations.values()).filter(
      alloc => alloc.nodeId === nodeId
    );

    const tasks = Array.from(this.optimizationTasks.values()).filter(
      task => task.nodeId === nodeId
    );

    return {
      node,
      allocations: allocations.length,
      totalAllocatedSpace: allocations.reduce((sum, alloc) => sum + alloc.spaceAllocated, 0),
      activeTasks: tasks.filter(task => task.status === 'processing').length,
      completedTasks: tasks.filter(task => task.status === 'completed').length,
      totalSpaceProcessed: tasks.reduce((sum, task) => sum + task.spaceSaved, 0),
      totalTokensEarned: tasks.reduce((sum, task) => sum + task.tokensEarned, 0),
    };
  }

  /**
   * Get all nodes
   */
  getAllNodes(): NodeConfig[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get nodes by type
   */
  getNodesByType(type: NodeConfig['type']): NodeConfig[] {
    return Array.from(this.nodes.values()).filter(node => node.type === type);
  }

  /**
   * Get available storage across all nodes
   */
  getTotalAvailableStorage(): number {
    return Array.from(this.nodes.values()).reduce((sum, node) => sum + node.availableStorage, 0);
  }

  /**
   * Get total compute power
   */
  getTotalComputePower(): number {
    return Array.from(this.nodes.values()).reduce((sum, node) => sum + node.computePower, 0);
  }

  /**
   * Get daily rewards estimate
   */
  getDailyRewardsEstimate(): number {
    return Array.from(this.nodes.values()).reduce((sum, node) => {
      const dailyReward = (node.usedStorage * node.rewardRate) / 1000;
      return sum + dailyReward;
    }, 0);
  }

  /**
   * Optimize storage allocation across nodes
   */
  optimizeStorageAllocation(): void {
    const nodes = this.getAllNodes().filter(node => node.status === 'active');
    const allocations = Array.from(this.storageAllocations.values());

    // Sort nodes by efficiency (descending)
    nodes.sort((a, b) => b.performance.efficiency - a.performance.efficiency);

    // Rebalance storage based on efficiency
    for (const node of nodes) {
      if (node.availableStorage > 0) {
        // Find low-priority allocations on less efficient nodes
        const lowPriorityAllocations = allocations
          .filter(alloc => alloc.priority === 'low' && alloc.nodeId !== node.id)
          .sort((a, b) => a.createdAt - b.createdAt);

        for (const allocation of lowPriorityAllocations) {
          if (node.availableStorage >= allocation.spaceAllocated) {
            // Move allocation to more efficient node
            this.deallocateStorage(allocation.id);
            this.allocateStorage(
              node.id,
              allocation.optimizationId,
              allocation.spaceAllocated,
              allocation.purpose,
              allocation.priority,
              allocation.expiresAt
            );
            break;
          }
        }
      }
    }
  }

  /**
   * Get system-wide statistics
   */
  getSystemStats(): any {
    const nodes = this.getAllNodes();
    const tasks = Array.from(this.optimizationTasks.values());
    const allocations = Array.from(this.storageAllocations.values());

    return {
      totalNodes: nodes.length,
      activeNodes: nodes.filter(node => node.status === 'active').length,
      totalStorage: nodes.reduce((sum, node) => sum + node.storageCapacity, 0),
      usedStorage: nodes.reduce((sum, node) => sum + node.usedStorage, 0),
      availableStorage: nodes.reduce((sum, node) => sum + node.availableStorage, 0),
      totalComputePower: nodes.reduce((sum, node) => sum + node.computePower, 0),
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.status === 'completed').length,
      totalSpaceProcessed: tasks.reduce((sum, task) => sum + task.spaceSaved, 0),
      totalTokensEarned: tasks.reduce((sum, task) => sum + task.tokensEarned, 0),
      dailyRewardsEstimate: this.getDailyRewardsEstimate(),
      storageUtilization:
        nodes.length > 0
          ? (nodes.reduce((sum, node) => sum + node.usedStorage, 0) /
              nodes.reduce((sum, node) => sum + node.storageCapacity, 0)) *
            100
          : 0,
    };
  }

  /**
   * Get all tasks
   */
  getAllTasks(): OptimizationTask[] {
    return Array.from(this.optimizationTasks.values());
  }
}

// Export singleton instance
export const advancedNodeManager = new AdvancedNodeManager();
