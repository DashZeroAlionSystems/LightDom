/**
 * Space Optimization Engine - Core implementation for tracking and monetizing 1KB optimizations
 * This is the heart of the LightDom space optimization system
 * Enhanced with advanced node management and storage utilization
 */

import {
  advancedNodeManager,
  NodeConfig,
  StorageAllocation,
  OptimizationTask,
} from './AdvancedNodeManager';

export interface OptimizationResult {
  url: string;
  spaceSavedBytes: number;
  spaceSavedKB: number;
  optimizationType: string;
  biomeType: string;
  timestamp: number;
  harvesterAddress: string;
  proofHash: string;
  beforeHash: string;
  afterHash: string;
  qualityScore: number;
  reputationMultiplier: number;
  tokenReward: number;
  metaverseAssets: MetaverseAsset[];
}

export interface MetaverseAsset {
  type: 'land' | 'ai_node' | 'storage_shard' | 'bridge';
  id: string;
  biomeType: string;
  size: number;
  stakingRewards: number;
  developmentLevel: number;
  sourceUrl: string;
}

export interface HarvesterStats {
  address: string;
  reputation: number;
  totalSpaceHarvested: number;
  totalTokensEarned: number;
  optimizationCount: number;
  landParcels: number;
  aiNodes: number;
  storageShards: number;
  bridges: number;
  stakingRewards: number;
}

export class SpaceOptimizationEngine {
  private optimizations: Map<string, OptimizationResult> = new Map();
  private harvesters: Map<string, HarvesterStats> = new Map();
  private metaverseAssets: Map<string, MetaverseAsset> = new Map();

  // Token economics constants
  private readonly BASE_SPACE_RATE = 1000; // 1 KB = 0.001 DSH base
  private readonly SPACE_MULTIPLIER = 100; // Can be adjusted
  private readonly MIN_OPTIMIZATION_KB = 1; // Minimum 1KB to qualify

  // Metaverse generation thresholds
  private readonly LAND_THRESHOLD_KB = 100; // 1 land parcel per 100KB
  private readonly AI_NODE_THRESHOLD_KB = 1000; // 1 AI node per 1000KB
  private readonly STORAGE_SHARD_THRESHOLD_KB = 500; // 1 shard per 500KB
  private readonly BRIDGE_THRESHOLD_KB = 2000; // 1 bridge per 2000KB

  // Reputation multipliers
  private readonly REPUTATION_MULTIPLIERS = {
    10000: 5.0, // 5x for top harvesters
    5000: 3.0, // 3x multiplier
    1000: 2.0, // 2x multiplier
    100: 1.5, // 1.5x multiplier
    0: 1.0, // 1x base multiplier
  };

  constructor() {
    this.initializeDefaultHarvesters();
  }

  /**
   * Process a space optimization and generate all associated rewards
   */
  async processOptimization(
    optimization: Partial<OptimizationResult>
  ): Promise<OptimizationResult> {
    // Validate optimization
    if (!optimization.url || !optimization.spaceSavedBytes || optimization.spaceSavedBytes < 1024) {
      throw new Error('Invalid optimization: must save at least 1KB');
    }

    const spaceKB = Math.floor(optimization.spaceSavedBytes / 1024);
    const harvesterAddress =
      optimization.harvesterAddress || '0x0000000000000000000000000000000000000000';

    // Get or create harvester stats
    const harvesterStats = this.getOrCreateHarvester(harvesterAddress);

    // Calculate quality score (0-100)
    const qualityScore = this.calculateQualityScore(optimization);

    // Calculate reputation multiplier
    const reputationMultiplier = this.getReputationMultiplier(harvesterStats.reputation);

    // Calculate token reward
    const baseTokens = (spaceKB * this.SPACE_MULTIPLIER) / this.BASE_SPACE_RATE;
    const tokenReward = baseTokens * reputationMultiplier * (qualityScore / 100);

    // Generate metaverse assets
    const metaverseAssets = this.generateMetaverseAssets(
      spaceKB,
      optimization.biomeType || 'digital',
      optimization.url
    );

    // Create complete optimization result
    const result: OptimizationResult = {
      url: optimization.url,
      spaceSavedBytes: optimization.spaceSavedBytes,
      spaceSavedKB: spaceKB,
      optimizationType: optimization.optimizationType || 'light-dom',
      biomeType: optimization.biomeType || 'digital',
      timestamp: Date.now(),
      harvesterAddress,
      proofHash: optimization.proofHash || this.generateProofHash(optimization),
      beforeHash: optimization.beforeHash || '',
      afterHash: optimization.afterHash || '',
      qualityScore,
      reputationMultiplier,
      tokenReward,
      metaverseAssets,
    };

    // Store optimization
    this.optimizations.set(result.proofHash, result);

    // Update harvester stats
    this.updateHarvesterStats(harvesterAddress, result);

    // Store metaverse assets
    metaverseAssets.forEach(asset => {
      this.metaverseAssets.set(asset.id, asset);
    });

    return result;
  }

  /**
   * Calculate quality score based on optimization characteristics
   */
  private calculateQualityScore(optimization: Partial<OptimizationResult>): number {
    let score = 50; // Base score

    // Size bonus (larger optimizations get higher scores)
    const spaceKB = Math.floor((optimization.spaceSavedBytes || 0) / 1024);
    if (spaceKB >= 100) score += 20;
    else if (spaceKB >= 50) score += 15;
    else if (spaceKB >= 10) score += 10;
    else if (spaceKB >= 5) score += 5;

    // Optimization type bonus
    const type = optimization.optimizationType || '';
    if (type.includes('ai')) score += 15;
    if (type.includes('critical')) score += 10;
    if (type.includes('lazy')) score += 5;

    // Biome type bonus
    const biome = optimization.biomeType || '';
    if (biome === 'professional') score += 10;
    if (biome === 'commercial') score += 8;
    if (biome === 'knowledge') score += 6;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Get reputation multiplier for harvester
   */
  private getReputationMultiplier(reputation: number): number {
    for (const [threshold, multiplier] of Object.entries(this.REPUTATION_MULTIPLIERS).sort(
      (a, b) => Number(b[0]) - Number(a[0])
    )) {
      if (reputation >= Number(threshold)) {
        return multiplier;
      }
    }
    return 1.0;
  }

  /**
   * Generate metaverse assets based on space saved
   */
  private generateMetaverseAssets(
    spaceKB: number,
    biomeType: string,
    sourceUrl: string
  ): MetaverseAsset[] {
    const assets: MetaverseAsset[] = [];

    // Generate land parcels (1 per 100KB)
    const landParcels = Math.floor(spaceKB / this.LAND_THRESHOLD_KB);
    for (let i = 0; i < landParcels; i++) {
      assets.push({
        type: 'land',
        id: `land_${Date.now()}_${i}`,
        biomeType,
        size: 100, // 100 square meters per parcel
        stakingRewards: this.getBiomeStakingRate(biomeType),
        developmentLevel: 1,
        sourceUrl,
      });
    }

    // Generate AI nodes (1 per 1000KB)
    const aiNodes = Math.floor(spaceKB / this.AI_NODE_THRESHOLD_KB);
    for (let i = 0; i < aiNodes; i++) {
      assets.push({
        type: 'ai_node',
        id: `ai_node_${Date.now()}_${i}`,
        biomeType,
        size: spaceKB,
        stakingRewards: spaceKB * 0.1, // 0.1 DSH per KB per day
        developmentLevel: 1,
        sourceUrl,
      });
    }

    // Generate storage shards (1 per 500KB)
    const storageShards = Math.floor(spaceKB / this.STORAGE_SHARD_THRESHOLD_KB);
    for (let i = 0; i < storageShards; i++) {
      assets.push({
        type: 'storage_shard',
        id: `storage_${Date.now()}_${i}`,
        biomeType,
        size: spaceKB,
        stakingRewards: spaceKB * 0.05, // 0.05 DSH per KB per day
        developmentLevel: 1,
        sourceUrl,
      });
    }

    // Generate bridges (1 per 2000KB)
    const bridges = Math.floor(spaceKB / this.BRIDGE_THRESHOLD_KB);
    for (let i = 0; i < bridges; i++) {
      assets.push({
        type: 'bridge',
        id: `bridge_${Date.now()}_${i}`,
        biomeType,
        size: spaceKB,
        stakingRewards: spaceKB * 0.02, // 0.02 DSH per KB per day
        developmentLevel: 1,
        sourceUrl,
      });
    }

    return assets;
  }

  /**
   * Get staking rate for biome type
   */
  private getBiomeStakingRate(biomeType: string): number {
    const rates: { [key: string]: number } = {
      production: 3.0,
      professional: 2.5,
      commercial: 2.0,
      social: 1.8,
      knowledge: 1.5,
      community: 1.3,
      entertainment: 1.2,
      digital: 1.0,
    };
    return rates[biomeType] || 1.0;
  }

  /**
   * Generate proof hash for optimization
   */
  private generateProofHash(optimization: Partial<OptimizationResult>): string {
    const data = `${optimization.url}_${optimization.spaceSavedBytes}_${Date.now()}`;
    return this.simpleHash(data);
  }

  /**
   * Simple hash function (in production, use crypto.subtle.digest)
   */
  private simpleHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Get or create harvester stats
   */
  private getOrCreateHarvester(address: string): HarvesterStats {
    if (!this.harvesters.has(address)) {
      this.harvesters.set(address, {
        address,
        reputation: 0,
        totalSpaceHarvested: 0,
        totalTokensEarned: 0,
        optimizationCount: 0,
        landParcels: 0,
        aiNodes: 0,
        storageShards: 0,
        bridges: 0,
        stakingRewards: 0,
      });
    }
    return this.harvesters.get(address)!;
  }

  /**
   * Update harvester stats after optimization
   */
  private updateHarvesterStats(address: string, result: OptimizationResult): void {
    const stats = this.harvesters.get(address)!;

    stats.totalSpaceHarvested += result.spaceSavedBytes;
    stats.totalTokensEarned += result.tokenReward;
    stats.optimizationCount++;
    stats.reputation += result.spaceSavedKB; // 1 reputation point per KB

    // Count metaverse assets
    result.metaverseAssets.forEach(asset => {
      switch (asset.type) {
        case 'land':
          stats.landParcels++;
          break;
        case 'ai_node':
          stats.aiNodes++;
          break;
        case 'storage_shard':
          stats.storageShards++;
          break;
        case 'bridge':
          stats.bridges++;
          break;
      }
    });
  }

  /**
   * Initialize default harvesters for testing
   */
  private initializeDefaultHarvesters(): void {
    const defaultHarvesters = [
      '0x1234567890123456789012345678901234567890',
      '0x2345678901234567890123456789012345678901',
      '0x3456789012345678901234567890123456789012',
    ];

    defaultHarvesters.forEach(address => {
      this.getOrCreateHarvester(address);
    });
  }

  /**
   * Get all optimizations
   */
  getOptimizations(): OptimizationResult[] {
    return Array.from(this.optimizations.values());
  }

  /**
   * Get harvester stats
   */
  getHarvesterStats(address: string): HarvesterStats | undefined {
    return this.harvesters.get(address);
  }

  /**
   * Get all harvesters
   */
  getAllHarvesters(): HarvesterStats[] {
    return Array.from(this.harvesters.values());
  }

  /**
   * Get metaverse assets
   */
  getMetaverseAssets(): MetaverseAsset[] {
    return Array.from(this.metaverseAssets.values());
  }

  /**
   * Get optimization by proof hash
   */
  getOptimization(proofHash: string): OptimizationResult | undefined {
    return this.optimizations.get(proofHash);
  }

  /**
   * Calculate total space harvested
   */
  getTotalSpaceHarvested(): number {
    return Array.from(this.optimizations.values()).reduce(
      (total, opt) => total + opt.spaceSavedBytes,
      0
    );
  }

  /**
   * Calculate total tokens distributed
   */
  getTotalTokensDistributed(): number {
    return Array.from(this.optimizations.values()).reduce(
      (total, opt) => total + opt.tokenReward,
      0
    );
  }

  /**
   * Get metaverse statistics
   */
  getMetaverseStats(): {
    totalLand: number;
    totalAINodes: number;
    totalStorageShards: number;
    totalBridges: number;
    totalStakingRewards: number;
  } {
    const assets = this.getMetaverseAssets();
    return {
      totalLand: assets.filter(a => a.type === 'land').length,
      totalAINodes: assets.filter(a => a.type === 'ai_node').length,
      totalStorageShards: assets.filter(a => a.type === 'storage_shard').length,
      totalBridges: assets.filter(a => a.type === 'bridge').length,
      totalStakingRewards: assets.reduce((total, asset) => total + asset.stakingRewards, 0),
    };
  }

  /**
   * ADVANCED OPTIMIZATION METHODS
   * New ways to optimize and use 1KB of data
   */

  /**
   * Create a new optimization node from mined storage
   */
  createOptimizationNode(
    spaceKB: number,
    biomeType: string,
    nodeType:
      | 'ai_consensus'
      | 'storage_shard'
      | 'bridge'
      | 'optimization'
      | 'mining' = 'optimization',
    sourceOptimizations: string[] = []
  ): NodeConfig {
    return advancedNodeManager.createNode(nodeType, spaceKB, biomeType, sourceOptimizations);
  }

  /**
   * Allocate storage for specific optimization purposes
   */
  allocateStorageForOptimization(
    nodeId: string,
    optimizationId: string,
    spaceKB: number,
    purpose: 'caching' | 'processing' | 'backup' | 'replication' | 'optimization' = 'optimization',
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): StorageAllocation {
    return advancedNodeManager.allocateStorage(nodeId, optimizationId, spaceKB, purpose, priority);
  }

  /**
   * Create an optimization task to process more websites
   */
  createOptimizationTask(
    nodeId: string,
    taskType:
      | 'dom_analysis'
      | 'css_optimization'
      | 'js_minification'
      | 'image_compression'
      | 'bundle_optimization',
    targetUrl: string
  ): OptimizationTask {
    return advancedNodeManager.createOptimizationTask(nodeId, taskType, targetUrl);
  }

  /**
   * Process multiple optimization tasks in parallel
   */
  async processOptimizationTasks(taskIds: string[]): Promise<OptimizationTask[]> {
    const results: OptimizationTask[] = [];

    for (const taskId of taskIds) {
      try {
        const result = await advancedNodeManager.processOptimizationTask(taskId);
        results.push(result);
      } catch (error) {
        console.error(`Error processing task ${taskId}:`, error);
      }
    }

    return results;
  }

  /**
   * Scale up an existing node with additional storage
   */
  scaleUpNode(nodeId: string, additionalSpaceKB: number): boolean {
    return advancedNodeManager.scaleUpNode(nodeId, additionalSpaceKB);
  }

  /**
   * Merge multiple nodes into a more powerful node
   */
  mergeNodes(
    nodeIds: string[],
    newType:
      | 'ai_consensus'
      | 'storage_shard'
      | 'bridge'
      | 'optimization'
      | 'mining' = 'optimization'
  ): NodeConfig | null {
    return advancedNodeManager.mergeNodes(nodeIds, newType);
  }

  /**
   * Get all optimization nodes
   */
  getAllOptimizationNodes(): NodeConfig[] {
    return advancedNodeManager.getAllNodes();
  }

  /**
   * Get nodes by type
   */
  getNodesByType(
    type: 'ai_consensus' | 'storage_shard' | 'bridge' | 'optimization' | 'mining'
  ): NodeConfig[] {
    return advancedNodeManager.getNodesByType(type);
  }

  /**
   * Get node statistics
   */
  getNodeStats(nodeId: string): any {
    return advancedNodeManager.getNodeStats(nodeId);
  }

  /**
   * Get system-wide node statistics
   */
  getSystemNodeStats(): any {
    return advancedNodeManager.getSystemStats();
  }

  /**
   * Optimize storage allocation across all nodes
   */
  optimizeStorageAllocation(): void {
    advancedNodeManager.optimizeStorageAllocation();
  }

  /**
   * Get available storage for new optimizations
   */
  getAvailableStorageForOptimization(): number {
    return advancedNodeManager.getTotalAvailableStorage();
  }

  /**
   * Get total compute power available
   */
  getTotalComputePower(): number {
    return advancedNodeManager.getTotalComputePower();
  }

  /**
   * Get daily rewards estimate from all nodes
   */
  getDailyNodeRewardsEstimate(): number {
    return advancedNodeManager.getDailyRewardsEstimate();
  }

  /**
   * Create a distributed optimization network
   */
  createDistributedOptimizationNetwork(
    spaceKB: number,
    biomeType: string
  ): {
    nodes: NodeConfig[];
    totalStorage: number;
    totalComputePower: number;
    estimatedDailyRewards: number;
  } {
    // Create different types of nodes based on available space
    const nodes: NodeConfig[] = [];
    let remainingSpace = spaceKB;

    // Create AI consensus node (requires 1000KB)
    if (remainingSpace >= 1000) {
      const aiNode = this.createOptimizationNode(1000, biomeType, 'ai_consensus');
      nodes.push(aiNode);
      remainingSpace -= 1000;
    }

    // Create storage shards (500KB each)
    while (remainingSpace >= 500) {
      const storageNode = this.createOptimizationNode(500, biomeType, 'storage_shard');
      nodes.push(storageNode);
      remainingSpace -= 500;
    }

    // Create optimization nodes (100KB each)
    while (remainingSpace >= 100) {
      const optNode = this.createOptimizationNode(100, biomeType, 'optimization');
      nodes.push(optNode);
      remainingSpace -= 100;
    }

    // Create mining nodes with remaining space
    if (remainingSpace >= 300) {
      const miningNode = this.createOptimizationNode(remainingSpace, biomeType, 'mining');
      nodes.push(miningNode);
    }

    const totalStorage = nodes.reduce((sum, node) => sum + node.storageCapacity, 0);
    const totalComputePower = nodes.reduce((sum, node) => sum + node.computePower, 0);
    const estimatedDailyRewards = nodes.reduce((sum, node) => {
      return sum + (node.usedStorage * node.rewardRate) / 1000;
    }, 0);

    return {
      nodes,
      totalStorage,
      totalComputePower,
      estimatedDailyRewards,
    };
  }

  /**
   * Run continuous optimization on a node
   */
  async runContinuousOptimization(
    nodeId: string,
    targetUrls: string[],
    taskType:
      | 'dom_analysis'
      | 'css_optimization'
      | 'js_minification'
      | 'image_compression'
      | 'bundle_optimization' = 'dom_analysis'
  ): Promise<OptimizationTask[]> {
    const tasks: OptimizationTask[] = [];
    const results: OptimizationTask[] = [];

    // Create tasks for all target URLs
    for (const url of targetUrls) {
      try {
        const task = this.createOptimizationTask(nodeId, taskType, url);
        tasks.push(task);
      } catch (error) {
        console.error(`Error creating task for ${url}:`, error);
      }
    }

    // Process tasks in batches to avoid overwhelming the node
    const batchSize = 5;
    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      const batchResults = await this.processOptimizationTasks(batch.map(task => task.id));
      results.push(...batchResults);

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  /**
   * Get optimization recommendations based on available storage
   */
  getOptimizationRecommendations(availableSpaceKB: number): {
    recommendedNodes: Array<{
      type: string;
      storage: number;
      computePower: number;
      dailyRewards: number;
    }>;
    totalEstimatedRewards: number;
    efficiency: number;
  } {
    const recommendations = [];
    let remainingSpace = availableSpaceKB;
    let totalRewards = 0;

    // AI Consensus Node (highest priority)
    if (remainingSpace >= 1000) {
      const aiNode = advancedNodeManager.createNode('ai_consensus', 1000, 'digital', []);
      recommendations.push({
        type: 'AI Consensus Node',
        storage: 1000,
        computePower: aiNode.computePower,
        dailyRewards: (1000 * aiNode.rewardRate) / 1000,
      });
      totalRewards += (1000 * aiNode.rewardRate) / 1000;
      remainingSpace -= 1000;
    }

    // Storage Shards (medium priority)
    while (remainingSpace >= 500) {
      const storageNode = advancedNodeManager.createNode('storage_shard', 500, 'digital', []);
      recommendations.push({
        type: 'Storage Shard',
        storage: 500,
        computePower: storageNode.computePower,
        dailyRewards: (500 * storageNode.rewardRate) / 1000,
      });
      totalRewards += (500 * storageNode.rewardRate) / 1000;
      remainingSpace -= 500;
    }

    // Optimization Nodes (lower priority)
    while (remainingSpace >= 100) {
      const optNode = advancedNodeManager.createNode('optimization', 100, 'digital', []);
      recommendations.push({
        type: 'Optimization Node',
        storage: 100,
        computePower: optNode.computePower,
        dailyRewards: (100 * optNode.rewardRate) / 1000,
      });
      totalRewards += (100 * optNode.rewardRate) / 1000;
      remainingSpace -= 100;
    }

    const efficiency = availableSpaceKB > 0 ? (totalRewards / availableSpaceKB) * 1000 : 0;

    return {
      recommendedNodes: recommendations,
      totalEstimatedRewards: totalRewards,
      efficiency,
    };
  }
}

// Export singleton instance
export const spaceOptimizationEngine = new SpaceOptimizationEngine();
