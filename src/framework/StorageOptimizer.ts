/**
 * Storage Optimizer
 * Manages storage optimization, cleanup, and maintenance for mining nodes
 */

import { EventEmitter } from 'events';
import { storageNodeManager, StorageNode, MiningTarget } from './StorageNodeManager';
import { spaceOptimizationEngine } from '../core/SpaceOptimizationEngine';

export interface StorageOptimization {
  id: string;
  nodeId: string;
  type: 'cleanup' | 'compression' | 'deduplication' | 'archival' | 'migration';
  status: 'pending' | 'running' | 'completed' | 'failed';
  spaceSaved: number; // Space saved in MB
  spaceBefore: number; // Space before optimization in MB
  spaceAfter: number; // Space after optimization in MB
  optimizationRate: number; // Optimization percentage
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  details: OptimizationDetails;
}

export interface OptimizationDetails {
  targetsProcessed: number;
  filesCompressed: number;
  duplicatesRemoved: number;
  archivesCreated: number;
  migrationsCompleted: number;
  performanceImpact: 'low' | 'medium' | 'high';
  estimatedTimeRemaining: number; // Estimated time remaining in minutes
}

export interface StoragePolicy {
  maxStorageUsage: number; // Maximum storage usage percentage
  cleanupThreshold: number; // Cleanup threshold percentage
  compressionThreshold: number; // Compression threshold percentage
  archivalThreshold: number; // Archival threshold percentage
  retentionPeriod: number; // Data retention period in days
  enableCompression: boolean;
  enableDeduplication: boolean;
  enableArchival: boolean;
  enableMigration: boolean;
  compressionLevel: number; // 1-9 compression level
  archivalFormat: 'zip' | 'tar' | 'gzip';
}

export interface StorageMetrics {
  totalCapacity: number; // Total capacity across all nodes in MB
  totalUsed: number; // Total used storage in MB
  totalAvailable: number; // Total available storage in MB
  utilizationRate: number; // Overall utilization rate percentage
  optimizationRate: number; // Overall optimization rate percentage
  spaceSaved: number; // Total space saved in MB
  nodesOptimized: number; // Number of nodes optimized
  optimizationsCompleted: number; // Number of optimizations completed
  averageOptimizationTime: number; // Average optimization time in minutes
  topOptimizations: StorageOptimization[];
  nodeUtilization: Map<string, number>; // Node ID to utilization percentage
}

export interface CleanupStrategy {
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  spaceSavings: number; // Estimated space savings in MB
  timeRequired: number; // Estimated time required in minutes
  riskLevel: 'low' | 'medium' | 'high';
  conditions: CleanupCondition[];
}

export interface CleanupCondition {
  type: 'age' | 'size' | 'access' | 'type' | 'duplicate';
  operator: 'greater_than' | 'less_than' | 'equals' | 'contains';
  value: any;
  unit?: 'days' | 'hours' | 'mb' | 'kb' | 'count';
}

export class StorageOptimizer extends EventEmitter {
  private optimizations: Map<string, StorageOptimization> = new Map();
  private isRunning: boolean = false;
  private optimizationInterval: NodeJS.Timeout | null = null;
  private policy: StoragePolicy;
  private cleanupStrategies: CleanupStrategy[];

  constructor(policy?: Partial<StoragePolicy>) {
    super();
    
    this.policy = {
      maxStorageUsage: 85,
      cleanupThreshold: 75,
      compressionThreshold: 60,
      archivalThreshold: 80,
      retentionPeriod: 30,
      enableCompression: true,
      enableDeduplication: true,
      enableArchival: true,
      enableMigration: false,
      compressionLevel: 6,
      archivalFormat: 'zip',
      ...policy
    };
    
    this.cleanupStrategies = this.initializeCleanupStrategies();
    this.setupEventHandlers();
  }

  /**
   * Initialize the storage optimizer
   */
  async initialize(): Promise<void> {
    console.log('🔧 Initializing Storage Optimizer...');
    
    try {
      // Start optimization monitoring
      this.startOptimizationMonitoring();
      
      this.isRunning = true;
      this.emit('initialized');
      
      console.log('✅ Storage Optimizer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Storage Optimizer:', error);
      throw error;
    }
  }

  /**
   * Start optimization monitoring
   */
  private startOptimizationMonitoring(): void {
    this.optimizationInterval = setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        await this.checkAndOptimizeNodes();
      } catch (error) {
        console.error('Storage optimization monitoring error:', error);
      }
    }, 60000); // Check every minute
  }

  /**
   * Check and optimize nodes that need optimization
   */
  private async checkAndOptimizeNodes(): Promise<void> {
    const nodes = storageNodeManager.getAllNodes();
    
    for (const node of nodes) {
      if (node.status !== 'active') continue;
      
      const utilizationRate = (node.used / node.capacity) * 100;
      
      // Check if node needs optimization
      if (utilizationRate >= this.policy.cleanupThreshold) {
        await this.optimizeNode(node);
      }
    }
  }

  /**
   * Optimize a specific node
   */
  async optimizeNode(node: StorageNode): Promise<StorageOptimization> {
    const optimizationId = `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const optimization: StorageOptimization = {
      id: optimizationId,
      nodeId: node.id,
      type: 'cleanup',
      status: 'pending',
      spaceSaved: 0,
      spaceBefore: node.used,
      spaceAfter: node.used,
      optimizationRate: 0,
      createdAt: new Date(),
      details: {
        targetsProcessed: 0,
        filesCompressed: 0,
        duplicatesRemoved: 0,
        archivesCreated: 0,
        migrationsCompleted: 0,
        performanceImpact: 'low',
        estimatedTimeRemaining: 0
      }
    };
    
    this.optimizations.set(optimizationId, optimization);
    
    try {
      optimization.status = 'running';
      optimization.startedAt = new Date();
      
      this.emit('optimizationStarted', optimization);
      console.log(`🔧 Starting optimization for node ${node.name} (${node.id})`);
      
      // Determine optimization strategy based on utilization
      const utilizationRate = (node.used / node.capacity) * 100;
      let optimizationType: StorageOptimization['type'];
      
      if (utilizationRate >= this.policy.archivalThreshold) {
        optimizationType = 'archival';
      } else if (utilizationRate >= this.policy.compressionThreshold) {
        optimizationType = 'compression';
      } else {
        optimizationType = 'cleanup';
      }
      
      optimization.type = optimizationType;
      
      // Execute optimization
      const results = await this.executeOptimization(node, optimizationType);
      
      // Update optimization results
      optimization.spaceSaved = results.spaceSaved;
      optimization.spaceAfter = node.used - results.spaceSaved;
      optimization.optimizationRate = results.spaceSaved > 0 ? 
        (results.spaceSaved / optimization.spaceBefore) * 100 : 0;
      optimization.details = results.details;
      optimization.status = 'completed';
      optimization.completedAt = new Date();
      
      // Update node storage
      node.used = optimization.spaceAfter;
      node.available = node.capacity - node.used;
      
      this.emit('optimizationCompleted', optimization);
      console.log(`✅ Optimization completed for node ${node.name}: ${optimization.spaceSaved}MB saved`);
      
    } catch (error) {
      optimization.status = 'failed';
      optimization.error = error instanceof Error ? error.message : String(error);
      optimization.completedAt = new Date();
      
      this.emit('optimizationFailed', optimization);
      console.error(`❌ Optimization failed for node ${node.name}: ${optimization.error}`);
    }
    
    return optimization;
  }

  /**
   * Execute optimization based on type
   */
  private async executeOptimization(node: StorageNode, type: StorageOptimization['type']): Promise<{
    spaceSaved: number;
    details: OptimizationDetails;
  }> {
    switch (type) {
      case 'cleanup':
        return await this.executeCleanup(node);
      case 'compression':
        return await this.executeCompression(node);
      case 'deduplication':
        return await this.executeDeduplication(node);
      case 'archival':
        return await this.executeArchival(node);
      case 'migration':
        return await this.executeMigration(node);
      default:
        throw new Error(`Unknown optimization type: ${type}`);
    }
  }

  /**
   * Execute cleanup optimization
   */
  private async executeCleanup(node: StorageNode): Promise<{
    spaceSaved: number;
    details: OptimizationDetails;
  }> {
    console.log(`🧹 Executing cleanup for node ${node.name}`);
    
    const spaceBefore = node.used;
    let targetsProcessed = 0;
    let spaceSaved = 0;
    
    // Clean up old completed targets
    const cutoffTime = new Date(Date.now() - this.policy.retentionPeriod * 24 * 60 * 60 * 1000);
    const oldTargets = node.miningTargets.filter(target => 
      target.status === 'completed' && 
      target.completedAt && 
      target.completedAt < cutoffTime
    );
    
    for (const target of oldTargets) {
      // Remove target data (simplified)
      spaceSaved += target.spaceSaved / 1024; // Convert KB to MB
      targetsProcessed++;
    }
    
    // Remove old targets from node
    node.miningTargets = node.miningTargets.filter(target => 
      !oldTargets.includes(target)
    );
    
    return {
      spaceSaved,
      details: {
        targetsProcessed,
        filesCompressed: 0,
        duplicatesRemoved: 0,
        archivesCreated: 0,
        migrationsCompleted: 0,
        performanceImpact: 'low',
        estimatedTimeRemaining: 0
      }
    };
  }

  /**
   * Execute compression optimization
   */
  private async executeCompression(node: StorageNode): Promise<{
    spaceSaved: number;
    details: OptimizationDetails;
  }> {
    console.log(`🗜️ Executing compression for node ${node.name}`);
    
    let spaceSaved = 0;
    let filesCompressed = 0;
    
    // Simulate compression of mining targets
    for (const target of node.miningTargets) {
      if (target.status === 'completed' && target.spaceSaved > 0) {
        // Simulate compression savings (20-40% additional savings)
        const compressionRate = 0.2 + Math.random() * 0.2;
        const additionalSavings = (target.spaceSaved / 1024) * compressionRate;
        spaceSaved += additionalSavings;
        filesCompressed++;
      }
    }
    
    return {
      spaceSaved,
      details: {
        targetsProcessed: 0,
        filesCompressed,
        duplicatesRemoved: 0,
        archivesCreated: 0,
        migrationsCompleted: 0,
        performanceImpact: 'medium',
        estimatedTimeRemaining: 0
      }
    };
  }

  /**
   * Execute deduplication optimization
   */
  private async executeDeduplication(node: StorageNode): Promise<{
    spaceSaved: number;
    details: OptimizationDetails;
  }> {
    console.log(`🔄 Executing deduplication for node ${node.name}`);
    
    let spaceSaved = 0;
    let duplicatesRemoved = 0;
    
    // Find duplicate targets based on domain
    const domainGroups = new Map<string, MiningTarget[]>();
    
    for (const target of node.miningTargets) {
      const domain = target.domain;
      if (!domainGroups.has(domain)) {
        domainGroups.set(domain, []);
      }
      domainGroups.get(domain)!.push(target);
    }
    
    // Remove duplicates (keep the most recent one)
    for (const [domain, targets] of domainGroups) {
      if (targets.length > 1) {
        // Sort by completion date (most recent first)
        targets.sort((a, b) => {
          const aTime = a.completedAt?.getTime() || 0;
          const bTime = b.completedAt?.getTime() || 0;
          return bTime - aTime;
        });
        
        // Keep the first (most recent) and remove the rest
        const duplicates = targets.slice(1);
        for (const duplicate of duplicates) {
          spaceSaved += duplicate.spaceSaved / 1024; // Convert KB to MB
          duplicatesRemoved++;
        }
        
        // Remove duplicates from node
        node.miningTargets = node.miningTargets.filter(target => !duplicates.includes(target));
      }
    }
    
    return {
      spaceSaved,
      details: {
        targetsProcessed: 0,
        filesCompressed: 0,
        duplicatesRemoved,
        archivesCreated: 0,
        migrationsCompleted: 0,
        performanceImpact: 'low',
        estimatedTimeRemaining: 0
      }
    };
  }

  /**
   * Execute archival optimization
   */
  private async executeArchival(node: StorageNode): Promise<{
    spaceSaved: number;
    details: OptimizationDetails;
  }> {
    console.log(`📦 Executing archival for node ${node.name}`);
    
    let spaceSaved = 0;
    let archivesCreated = 0;
    
    // Archive old completed targets
    const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const oldTargets = node.miningTargets.filter(target => 
      target.status === 'completed' && 
      target.completedAt && 
      target.completedAt < cutoffTime
    );
    
    if (oldTargets.length > 0) {
      // Simulate archival (50-70% space savings)
      const archivalRate = 0.5 + Math.random() * 0.2;
      spaceSaved = oldTargets.reduce((total, target) => 
        total + (target.spaceSaved / 1024) * archivalRate, 0);
      
      archivesCreated = Math.ceil(oldTargets.length / 10); // Group into archives
      
      // Mark targets as archived (simplified)
      for (const target of oldTargets) {
        target.metadata.biomeType = 'archived';
      }
    }
    
    return {
      spaceSaved,
      details: {
        targetsProcessed: 0,
        filesCompressed: 0,
        duplicatesRemoved: 0,
        archivesCreated,
        migrationsCompleted: 0,
        performanceImpact: 'high',
        estimatedTimeRemaining: 0
      }
    };
  }

  /**
   * Execute migration optimization
   */
  private async executeMigration(node: StorageNode): Promise<{
    spaceSaved: number;
    details: OptimizationDetails;
  }> {
    console.log(`🚚 Executing migration for node ${node.name}`);
    
    // Migration would move data to more efficient storage
    // For now, simulate minimal space savings
    const spaceSaved = Math.random() * 10; // 0-10MB
    
    return {
      spaceSaved,
      details: {
        targetsProcessed: 0,
        filesCompressed: 0,
        duplicatesRemoved: 0,
        archivesCreated: 0,
        migrationsCompleted: 1,
        performanceImpact: 'medium',
        estimatedTimeRemaining: 0
      }
    };
  }

  /**
   * Get storage metrics
   */
  getStorageMetrics(): StorageMetrics {
    const nodes = storageNodeManager.getAllNodes();
    const optimizations = Array.from(this.optimizations.values());
    
    const totalCapacity = nodes.reduce((total, node) => total + node.capacity, 0);
    const totalUsed = nodes.reduce((total, node) => total + node.used, 0);
    const totalAvailable = totalCapacity - totalUsed;
    const utilizationRate = totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0;
    
    const completedOptimizations = optimizations.filter(opt => opt.status === 'completed');
    const optimizationRate = completedOptimizations.length > 0 ? 
      completedOptimizations.reduce((total, opt) => total + opt.optimizationRate, 0) / completedOptimizations.length : 0;
    
    const spaceSaved = completedOptimizations.reduce((total, opt) => total + opt.spaceSaved, 0);
    const nodesOptimized = new Set(completedOptimizations.map(opt => opt.nodeId)).size;
    
    const averageOptimizationTime = completedOptimizations.length > 0 ? 
      completedOptimizations.reduce((total, opt) => {
        if (opt.startedAt && opt.completedAt) {
          return total + (opt.completedAt.getTime() - opt.startedAt.getTime()) / (1000 * 60);
        }
        return total;
      }, 0) / completedOptimizations.length : 0;
    
    const topOptimizations = completedOptimizations
      .sort((a, b) => b.spaceSaved - a.spaceSaved)
      .slice(0, 10);
    
    const nodeUtilization = new Map<string, number>();
    for (const node of nodes) {
      const utilization = (node.used / node.capacity) * 100;
      nodeUtilization.set(node.id, utilization);
    }
    
    return {
      totalCapacity,
      totalUsed,
      totalAvailable,
      utilizationRate,
      optimizationRate,
      spaceSaved,
      nodesOptimized,
      optimizationsCompleted: completedOptimizations.length,
      averageOptimizationTime,
      topOptimizations,
      nodeUtilization
    };
  }

  /**
   * Get optimization by ID
   */
  getOptimization(optimizationId: string): StorageOptimization | undefined {
    return this.optimizations.get(optimizationId);
  }

  /**
   * Get all optimizations
   */
  getAllOptimizations(): StorageOptimization[] {
    return Array.from(this.optimizations.values());
  }

  /**
   * Get optimizations by node
   */
  getOptimizationsByNode(nodeId: string): StorageOptimization[] {
    return Array.from(this.optimizations.values()).filter(opt => opt.nodeId === nodeId);
  }

  /**
   * Get optimizations by status
   */
  getOptimizationsByStatus(status: StorageOptimization['status']): StorageOptimization[] {
    return Array.from(this.optimizations.values()).filter(opt => opt.status === status);
  }

  /**
   * Initialize cleanup strategies
   */
  private initializeCleanupStrategies(): CleanupStrategy[] {
    return [
      {
        name: 'Old Data Cleanup',
        description: 'Remove data older than retention period',
        priority: 'high',
        spaceSavings: 100,
        timeRequired: 5,
        riskLevel: 'low',
        conditions: [
          {
            type: 'age',
            operator: 'greater_than',
            value: this.policy.retentionPeriod,
            unit: 'days'
          }
        ]
      },
      {
        name: 'Duplicate Removal',
        description: 'Remove duplicate mining targets',
        priority: 'medium',
        spaceSavings: 50,
        timeRequired: 10,
        riskLevel: 'low',
        conditions: [
          {
            type: 'duplicate',
            operator: 'equals',
            value: true
          }
        ]
      },
      {
        name: 'Compression',
        description: 'Compress stored data',
        priority: 'medium',
        spaceSavings: 200,
        timeRequired: 15,
        riskLevel: 'low',
        conditions: [
          {
            type: 'size',
            operator: 'greater_than',
            value: 1000,
            unit: 'mb'
          }
        ]
      },
      {
        name: 'Archival',
        description: 'Archive old data to compressed format',
        priority: 'low',
        spaceSavings: 500,
        timeRequired: 30,
        riskLevel: 'medium',
        conditions: [
          {
            type: 'age',
            operator: 'greater_than',
            value: 7,
            unit: 'days'
          }
        ]
      }
    ];
  }

  /**
   * Get cleanup strategies
   */
  getCleanupStrategies(): CleanupStrategy[] {
    return this.cleanupStrategies;
  }

  /**
   * Update storage policy
   */
  updatePolicy(newPolicy: Partial<StoragePolicy>): void {
    this.policy = { ...this.policy, ...newPolicy };
    this.emit('policyUpdated', this.policy);
    console.log('📋 Storage policy updated');
  }

  /**
   * Get current policy
   */
  getPolicy(): StoragePolicy {
    return { ...this.policy };
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('optimizationStarted', (optimization) => {
      console.log(`🔧 Optimization started: ${optimization.type} for node ${optimization.nodeId}`);
    });
    
    this.on('optimizationCompleted', (optimization) => {
      console.log(`✅ Optimization completed: ${optimization.spaceSaved}MB saved`);
    });
    
    this.on('optimizationFailed', (optimization) => {
      console.error(`❌ Optimization failed: ${optimization.error}`);
    });
    
    this.on('policyUpdated', (policy) => {
      console.log('📋 Storage policy updated');
    });
  }

  /**
   * Stop the storage optimizer
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping Storage Optimizer...');
    
    this.isRunning = false;
    
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }
    
    this.emit('stopped');
    console.log('✅ Storage Optimizer stopped');
  }

  /**
   * Get status
   */
  getStatus(): { running: boolean; totalOptimizations: number; activeOptimizations: number } {
    const allOptimizations = Array.from(this.optimizations.values());
    const activeOptimizations = allOptimizations.filter(opt => opt.status === 'running');
    
    return {
      running: this.isRunning,
      totalOptimizations: allOptimizations.length,
      activeOptimizations: activeOptimizations.length
    };
  }
}

// Export singleton instance
export const storageOptimizer = new StorageOptimizer();
