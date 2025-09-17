/**
 * Storage Node Manager
 * Manages storage nodes for mining web addresses and DOM optimization
 */

import { EventEmitter } from 'events';
import { advancedNodeManager } from '../core/AdvancedNodeManager';
import { spaceOptimizationEngine } from '../core/SpaceOptimizationEngine';

export interface StorageNode {
  id: string;
  name: string;
  type: 'mining' | 'optimization' | 'hybrid';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  capacity: number; // Storage capacity in MB
  used: number; // Used storage in MB
  available: number; // Available storage in MB
  location: string; // Geographic or logical location
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  lastActivity: Date;
  miningTargets: MiningTarget[];
  performance: NodePerformance;
  configuration: NodeConfiguration;
}

export interface MiningTarget {
  id: string;
  url: string;
  domain: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'mining' | 'completed' | 'failed';
  estimatedSize: number; // Estimated DOM size in KB
  actualSize: number; // Actual DOM size in KB
  spaceSaved: number; // Space saved in KB
  tokensEarned: number; // Tokens earned from mining
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  metadata: MiningMetadata;
}

export interface MiningMetadata {
  siteType: 'ecommerce' | 'blog' | 'corporate' | 'portfolio' | 'news' | 'social';
  technologies: string[]; // Detected technologies
  optimizationPotential: 'high' | 'medium' | 'low';
  estimatedOptimizations: string[];
  biomeType: 'digital' | 'cyber' | 'virtual' | 'metaverse';
  complexity: number; // 1-10 complexity score
}

export interface NodePerformance {
  miningRate: number; // URLs mined per hour
  optimizationRate: number; // Optimizations completed per hour
  successRate: number; // Success rate percentage
  averageProcessingTime: number; // Average processing time in ms
  totalSpaceHarvested: number; // Total space harvested in KB
  totalTokensEarned: number; // Total tokens earned
  uptime: number; // Uptime percentage
  lastHealthCheck: Date;
}

export interface NodeConfiguration {
  maxConcurrentMining: number;
  maxStorageUsage: number; // Percentage of total capacity
  autoCleanup: boolean;
  cleanupThreshold: number; // Percentage threshold for cleanup
  retryAttempts: number;
  timeoutMs: number;
  enableCaching: boolean;
  cacheSize: number; // Cache size in MB
  enableCompression: boolean;
  compressionLevel: number; // 1-9 compression level
}

export interface StorageMetrics {
  totalNodes: number;
  activeNodes: number;
  totalCapacity: number;
  totalUsed: number;
  totalAvailable: number;
  utilizationRate: number;
  averagePerformance: NodePerformance;
  topPerformers: StorageNode[];
  recentActivity: MiningActivity[];
}

export interface MiningActivity {
  nodeId: string;
  action: 'mining_started' | 'mining_completed' | 'optimization_completed' | 'error_occurred';
  target: MiningTarget;
  timestamp: Date;
  details: any;
}

export class StorageNodeManager extends EventEmitter {
  private nodes: Map<string, StorageNode> = new Map();
  private miningQueue: MiningTarget[] = [];
  private activityLog: MiningActivity[] = [];
  private isRunning: boolean = false;
  private miningInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.setupEventHandlers();
  }

  /**
   * Initialize the storage node manager
   */
  async initialize(): Promise<void> {
    console.log('🔧 Initializing Storage Node Manager...');

    try {
      // Load existing nodes from storage
      await this.loadNodes();

      // Start mining process
      await this.startMining();

      // Start health checks
      this.startHealthChecks();

      this.isRunning = true;
      this.emit('initialized');

      console.log('✅ Storage Node Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Storage Node Manager:', error);
      throw error;
    }
  }

  /**
   * Create a new storage node for mining
   */
  async createMiningNode(config: {
    name: string;
    capacity: number;
    location: string;
    priority?: 'high' | 'medium' | 'low';
    configuration?: Partial<NodeConfiguration>;
  }): Promise<StorageNode> {
    const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const defaultConfig: NodeConfiguration = {
      maxConcurrentMining: 5,
      maxStorageUsage: 80,
      autoCleanup: true,
      cleanupThreshold: 75,
      retryAttempts: 3,
      timeoutMs: 30000,
      enableCaching: true,
      cacheSize: 100,
      enableCompression: true,
      compressionLevel: 6,
    };

    const node: StorageNode = {
      id: nodeId,
      name: config.name,
      type: 'mining',
      status: 'active',
      capacity: config.capacity,
      used: 0,
      available: config.capacity,
      location: config.location,
      priority: config.priority || 'medium',
      createdAt: new Date(),
      lastActivity: new Date(),
      miningTargets: [],
      performance: {
        miningRate: 0,
        optimizationRate: 0,
        successRate: 0,
        averageProcessingTime: 0,
        totalSpaceHarvested: 0,
        totalTokensEarned: 0,
        uptime: 100,
        lastHealthCheck: new Date(),
      },
      configuration: { ...defaultConfig, ...config.configuration },
    };

    this.nodes.set(nodeId, node);
    await this.saveNodes();

    this.emit('nodeCreated', node);
    console.log(`✅ Created mining node: ${node.name} (${nodeId})`);

    return node;
  }

  /**
   * Add a web address to mining queue
   */
  async addMiningTarget(
    nodeId: string,
    target: {
      url: string;
      priority?: 'high' | 'medium' | 'low';
      metadata?: Partial<MiningMetadata>;
    }
  ): Promise<MiningTarget> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    if (node.status !== 'active') {
      throw new Error(`Node ${nodeId} is not active`);
    }

    const miningTarget: MiningTarget = {
      id: `target_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: target.url,
      domain: new URL(target.url).hostname,
      priority: target.priority || 'medium',
      status: 'pending',
      estimatedSize: 0,
      actualSize: 0,
      spaceSaved: 0,
      tokensEarned: 0,
      metadata: {
        siteType: 'corporate',
        technologies: [],
        optimizationPotential: 'medium',
        estimatedOptimizations: [],
        biomeType: 'digital',
        complexity: 5,
        ...target.metadata,
      },
    };

    // Add to node's mining targets
    node.miningTargets.push(miningTarget);

    // Add to global mining queue
    this.miningQueue.push(miningTarget);

    // Sort queue by priority
    this.miningQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    await this.saveNodes();

    this.emit('miningTargetAdded', { nodeId, target: miningTarget });
    console.log(`✅ Added mining target: ${target.url} to node ${node.name}`);

    return miningTarget;
  }

  /**
   * Start mining process for a node
   */
  async startMiningForNode(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    if (node.status !== 'active') {
      throw new Error(`Node ${nodeId} is not active`);
    }

    // Find pending targets for this node
    const pendingTargets = node.miningTargets.filter(t => t.status === 'pending');

    for (const target of pendingTargets.slice(0, node.configuration.maxConcurrentMining)) {
      await this.processMiningTarget(nodeId, target);
    }
  }

  /**
   * Process a mining target
   */
  private async processMiningTarget(nodeId: string, target: MiningTarget): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    try {
      target.status = 'mining';
      target.startedAt = new Date();

      this.emit('miningStarted', { nodeId, target });

      // Simulate mining process (in real implementation, this would use headless browser)
      await this.simulateMiningProcess(target);

      // Calculate space saved and tokens earned
      const spaceSaved = Math.floor(target.actualSize * 0.3); // 30% optimization
      const tokensEarned = spaceSaved * 0.001; // 1 token per KB

      target.spaceSaved = spaceSaved;
      target.tokensEarned = tokensEarned;
      target.status = 'completed';
      target.completedAt = new Date();

      // Update node performance
      node.performance.totalSpaceHarvested += spaceSaved;
      node.performance.totalTokensEarned += tokensEarned;
      node.performance.miningRate = this.calculateMiningRate(node);
      node.performance.successRate = this.calculateSuccessRate(node);
      node.lastActivity = new Date();

      // Update storage usage
      node.used += spaceSaved / 1024; // Convert KB to MB
      node.available = node.capacity - node.used;

      // Check if cleanup is needed
      if (
        node.configuration.autoCleanup &&
        (node.used / node.capacity) * 100 > node.configuration.cleanupThreshold
      ) {
        await this.cleanupNodeStorage(nodeId);
      }

      // Log activity
      this.logActivity(nodeId, 'mining_completed', target, {
        spaceSaved,
        tokensEarned,
        processingTime: target.completedAt.getTime() - target.startedAt!.getTime(),
      });

      this.emit('miningCompleted', { nodeId, target });
      console.log(
        `✅ Mining completed: ${target.url} - ${spaceSaved}KB saved, ${tokensEarned} tokens earned`
      );
    } catch (error) {
      target.status = 'failed';
      target.error = error instanceof Error ? error.message : String(error);

      this.logActivity(nodeId, 'error_occurred', target, { error: target.error });
      this.emit('miningFailed', { nodeId, target, error });
      console.error(`❌ Mining failed: ${target.url} - ${target.error}`);
    }
  }

  /**
   * Simulate mining process
   */
  private async simulateMiningProcess(target: MiningTarget): Promise<void> {
    // Simulate processing time based on complexity
    const processingTime = target.metadata.complexity * 1000 + Math.random() * 2000;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate DOM size analysis
    target.actualSize = Math.floor(Math.random() * 5000) + 1000; // 1-6MB
    target.estimatedSize = Math.floor(target.actualSize * 0.8); // 20% estimation error

    // Simulate technology detection
    const technologies = ['React', 'Vue', 'Angular', 'jQuery', 'Bootstrap', 'Tailwind'];
    target.metadata.technologies = technologies.filter(() => Math.random() > 0.5).slice(0, 3);

    // Simulate optimization potential
    const potential = ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as
      | 'high'
      | 'medium'
      | 'low';
    target.metadata.optimizationPotential = potential;

    // Simulate estimated optimizations
    const optimizations = [
      'Image optimization',
      'CSS minification',
      'JavaScript bundling',
      'HTML compression',
      'Resource caching',
      'Lazy loading',
    ];
    target.metadata.estimatedOptimizations = optimizations
      .filter(() => Math.random() > 0.6)
      .slice(0, 3);
  }

  /**
   * Cleanup node storage
   */
  async cleanupNodeStorage(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // Remove completed targets older than 24 hours
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const initialCount = node.miningTargets.length;

    node.miningTargets = node.miningTargets.filter(target => {
      if (target.status === 'completed' && target.completedAt && target.completedAt < cutoffTime) {
        return false;
      }
      return true;
    });

    const removedCount = initialCount - node.miningTargets.length;

    // Recalculate storage usage
    node.used = node.miningTargets.reduce((total, target) => total + target.spaceSaved / 1024, 0);
    node.available = node.capacity - node.used;

    await this.saveNodes();

    this.emit('storageCleanup', { nodeId, removedCount });
    console.log(`🧹 Cleaned up ${removedCount} old targets from node ${node.name}`);
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: string): StorageNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes
   */
  getAllNodes(): StorageNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get active nodes
   */
  getActiveNodes(): StorageNode[] {
    return this.getAllNodes().filter(node => node.status === 'active');
  }

  /**
   * Get storage metrics
   */
  getStorageMetrics(): StorageMetrics {
    const allNodes = this.getAllNodes();
    const activeNodes = this.getActiveNodes();

    const totalCapacity = allNodes.reduce((total, node) => total + node.capacity, 0);
    const totalUsed = allNodes.reduce((total, node) => total + node.used, 0);
    const totalAvailable = totalCapacity - totalUsed;

    const averagePerformance: NodePerformance = {
      miningRate:
        activeNodes.reduce((sum, node) => sum + node.performance.miningRate, 0) /
          activeNodes.length || 0,
      optimizationRate:
        activeNodes.reduce((sum, node) => sum + node.performance.optimizationRate, 0) /
          activeNodes.length || 0,
      successRate:
        activeNodes.reduce((sum, node) => sum + node.performance.successRate, 0) /
          activeNodes.length || 0,
      averageProcessingTime:
        activeNodes.reduce((sum, node) => sum + node.performance.averageProcessingTime, 0) /
          activeNodes.length || 0,
      totalSpaceHarvested: activeNodes.reduce(
        (sum, node) => sum + node.performance.totalSpaceHarvested,
        0
      ),
      totalTokensEarned: activeNodes.reduce(
        (sum, node) => sum + node.performance.totalTokensEarned,
        0
      ),
      uptime:
        activeNodes.reduce((sum, node) => sum + node.performance.uptime, 0) / activeNodes.length ||
        0,
      lastHealthCheck: new Date(),
    };

    const topPerformers = allNodes
      .sort((a, b) => b.performance.totalSpaceHarvested - a.performance.totalSpaceHarvested)
      .slice(0, 5);

    const recentActivity = this.activityLog
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);

    return {
      totalNodes: allNodes.length,
      activeNodes: activeNodes.length,
      totalCapacity,
      totalUsed,
      totalAvailable,
      utilizationRate: totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0,
      averagePerformance,
      topPerformers,
      recentActivity,
    };
  }

  /**
   * Start mining process
   */
  private async startMining(): Promise<void> {
    this.miningInterval = setInterval(async () => {
      if (!this.isRunning) return;

      const activeNodes = this.getActiveNodes();

      for (const node of activeNodes) {
        if (node.miningTargets.some(t => t.status === 'pending')) {
          await this.startMiningForNode(node.id);
        }
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Start health checks
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      if (!this.isRunning) return;

      const nodes = this.getAllNodes();

      for (const node of nodes) {
        await this.performHealthCheck(node);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Perform health check on a node
   */
  private async performHealthCheck(node: StorageNode): Promise<void> {
    const now = new Date();
    const timeSinceLastActivity = now.getTime() - node.lastActivity.getTime();

    // Check if node is responsive (last activity within 5 minutes)
    if (timeSinceLastActivity > 5 * 60 * 1000) {
      node.status = 'error';
      this.emit('nodeError', { nodeId: node.id, reason: 'No recent activity' });
    } else if (node.status === 'error' && timeSinceLastActivity < 5 * 60 * 1000) {
      node.status = 'active';
      this.emit('nodeRecovered', { nodeId: node.id });
    }

    node.performance.lastHealthCheck = now;
    await this.saveNodes();
  }

  /**
   * Calculate mining rate for a node
   */
  private calculateMiningRate(node: StorageNode): number {
    const completedTargets = node.miningTargets.filter(t => t.status === 'completed');
    if (completedTargets.length === 0) return 0;

    const oldestCompleted = Math.min(...completedTargets.map(t => t.completedAt!.getTime()));
    const hoursElapsed = (Date.now() - oldestCompleted) / (1000 * 60 * 60);

    return hoursElapsed > 0 ? completedTargets.length / hoursElapsed : 0;
  }

  /**
   * Calculate success rate for a node
   */
  private calculateSuccessRate(node: StorageNode): number {
    const totalTargets = node.miningTargets.length;
    if (totalTargets === 0) return 0;

    const successfulTargets = node.miningTargets.filter(t => t.status === 'completed').length;
    return (successfulTargets / totalTargets) * 100;
  }

  /**
   * Log mining activity
   */
  private logActivity(
    nodeId: string,
    action: MiningActivity['action'],
    target: MiningTarget,
    details: any
  ): void {
    const activity: MiningActivity = {
      nodeId,
      action,
      target,
      timestamp: new Date(),
      details,
    };

    this.activityLog.push(activity);

    // Keep only last 1000 activities
    if (this.activityLog.length > 1000) {
      this.activityLog = this.activityLog.slice(-1000);
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('nodeCreated', node => {
      console.log(`📦 Node created: ${node.name} (${node.id})`);
    });

    this.on('miningStarted', ({ nodeId, target }) => {
      console.log(`⛏️ Mining started: ${target.url} on node ${nodeId}`);
    });

    this.on('miningCompleted', ({ nodeId, target }) => {
      console.log(`✅ Mining completed: ${target.url} - ${target.spaceSaved}KB saved`);
    });

    this.on('miningFailed', ({ nodeId, target, error }) => {
      console.error(`❌ Mining failed: ${target.url} - ${error}`);
    });

    this.on('nodeError', ({ nodeId, reason }) => {
      console.error(`⚠️ Node error: ${nodeId} - ${reason}`);
    });

    this.on('nodeRecovered', ({ nodeId }) => {
      console.log(`🔄 Node recovered: ${nodeId}`);
    });
  }

  /**
   * Load nodes from storage
   */
  private async loadNodes(): Promise<void> {
    // In a real implementation, this would load from a database
    // For now, we'll start with an empty state
    console.log('📂 Loading nodes from storage...');
  }

  /**
   * Save nodes to storage
   */
  private async saveNodes(): Promise<void> {
    // In a real implementation, this would save to a database
    // For now, we'll just log the action
    console.log('💾 Saving nodes to storage...');
  }

  /**
   * Stop the storage node manager
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping Storage Node Manager...');

    this.isRunning = false;

    if (this.miningInterval) {
      clearInterval(this.miningInterval);
      this.miningInterval = null;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    await this.saveNodes();

    this.emit('stopped');
    console.log('✅ Storage Node Manager stopped');
  }

  /**
   * Get status
   */
  getStatus(): { running: boolean; nodeCount: number; activeNodes: number; miningQueue: number } {
    return {
      running: this.isRunning,
      nodeCount: this.nodes.size,
      activeNodes: this.getActiveNodes().length,
      miningQueue: this.miningQueue.length,
    };
  }
}

// Export singleton instance
export const storageNodeManager = new StorageNodeManager();
