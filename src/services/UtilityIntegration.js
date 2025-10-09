/**
 * UtilityIntegration - Connects all unused utilities
 * Integrates ArtifactStorage, PoOBatcher, HeadlessBlockchainRunner, and MerkleTree
 */

import ArtifactStorage from '../../utils/ArtifactStorage.js';
import PoOBatcher from '../../utils/PoOBatcher.js';
import HeadlessBlockchainRunner from '../../utils/HeadlessBlockchainRunner.js';
import MerkleTree from '../../utils/MerkleTree.js';
import CrawlerSupervisor from '../../utils/CrawlerSupervisor.js';
import MetricsCollector from '../../utils/MetricsCollector.js';
import BlockchainMetricsCollector from '../../utils/BlockchainMetricsCollector.js';

export class UtilityIntegration {
  constructor(config = {}) {
    console.log('🔧 Initializing UtilityIntegration with all unused utilities...');
    
    // Storage configuration
    this.storage = new ArtifactStorage({
      provider: config.storageProvider || 'ipfs',
      config: {
        ipfs: {
          host: config.ipfsHost || 'localhost',
          port: config.ipfsPort || 5001,
          protocol: config.ipfsProtocol || 'http'
        },
        s3: {
          bucket: config.s3Bucket || 'lightdom-artifacts',
          region: config.s3Region || 'us-east-1',
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      }
    });
    
    // Proof batching configuration
    this.batcher = new PoOBatcher({
      batchSize: config.batchSize || 100,
      interval: config.batchInterval || 60000, // 1 minute
      onBatchReady: this.processBatch.bind(this)
    });
    
    // Headless blockchain runner
    this.headlessRunner = new HeadlessBlockchainRunner({
      headless: config.headless !== false,
      devtools: config.devtools || false,
      maxConcurrency: config.maxConcurrency || 5
    });
    
    // Merkle tree for proofs
    this.merkleTree = new MerkleTree();
    
    // Crawler supervisor for resilience
    this.supervisor = new CrawlerSupervisor({
      outboxPath: config.outboxPath || './outbox',
      checkpointPath: config.checkpointPath || './checkpoints'
    });
    
    // Metrics collectors
    this.metrics = new MetricsCollector();
    this.blockchainMetrics = new BlockchainMetricsCollector();
    
    this.initialized = false;
    console.log('✅ UtilityIntegration constructed');
  }
  
  /**
   * Initialize all utilities
   */
  async initialize() {
    if (this.initialized) {
      console.log('UtilityIntegration already initialized');
      return;
    }
    
    console.log('🚀 Starting utility initialization...');
    
    try {
      // Initialize storage
      await this.storage.initialize();
      console.log('✅ ArtifactStorage initialized');
      
      // Start batcher
      await this.batcher.start();
      console.log('✅ PoOBatcher started');
      
      // Start headless runner
      await this.headlessRunner.start();
      console.log('✅ HeadlessBlockchainRunner started');
      
      // Start supervisor
      await this.supervisor.start();
      console.log('✅ CrawlerSupervisor started');
      
      // Start metrics collection
      this.metrics.startCollection();
      console.log('✅ Metrics collection started');
      
      this.initialized = true;
      console.log('✅ All utilities initialized successfully');
    } catch (error) {
      console.error('❌ Utility initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Store optimization proof with all utilities
   */
  async storeOptimizationProof(optimization) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    console.log(`📦 Storing optimization proof for ${optimization.url}`);
    
    try {
      // Add to batch
      const batchId = await this.batcher.add(optimization);
      
      // Store artifacts
      const artifactCID = await this.storage.store({
        type: 'optimization',
        data: optimization,
        timestamp: new Date().toISOString()
      });
      
      // Add to merkle tree
      const leaf = this.merkleTree.hash(JSON.stringify(optimization));
      this.merkleTree.addLeaf(leaf);
      
      // Create merkle proof
      const proof = this.merkleTree.getProof(leaf);
      const root = this.merkleTree.getRoot();
      
      // Track metrics
      this.metrics.increment('optimizations_stored');
      this.metrics.gauge('storage_size', optimization.artifacts?.length || 0);
      
      return {
        batchId,
        artifactCID,
        proof,
        merkleRoot: root,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to store optimization proof:', error);
      this.metrics.increment('optimization_storage_errors');
      throw error;
    }
  }
  
  /**
   * Process a batch of proofs
   */
  async processBatch(batch) {
    console.log(`🔄 Processing batch of ${batch.length} proofs`);
    
    try {
      // Create batch merkle tree
      const batchTree = new MerkleTree();
      const batchData = [];
      
      for (const item of batch) {
        const leaf = batchTree.hash(JSON.stringify(item));
        batchTree.addLeaf(leaf);
        batchData.push({
          item,
          leaf,
          proof: batchTree.getProof(leaf)
        });
      }
      
      const batchRoot = batchTree.getRoot();
      
      // Store batch artifact
      const batchCID = await this.storage.store({
        type: 'batch',
        root: batchRoot,
        count: batch.length,
        items: batchData,
        timestamp: new Date().toISOString()
      });
      
      // Submit to blockchain using headless runner
      const txHash = await this.headlessRunner.submitBatch({
        root: batchRoot,
        count: batch.length,
        ipfsHash: batchCID
      });
      
      // Track metrics
      this.blockchainMetrics.trackBatch({
        size: batch.length,
        root: batchRoot,
        txHash,
        cid: batchCID
      });
      
      console.log(`✅ Batch processed: ${batch.length} items, root: ${batchRoot}, tx: ${txHash}`);
      
      return {
        batchRoot,
        batchCID,
        txHash,
        itemCount: batch.length
      };
    } catch (error) {
      console.error('Failed to process batch:', error);
      this.metrics.increment('batch_processing_errors');
      throw error;
    }
  }
  
  /**
   * Run headless blockchain operations
   */
  async runHeadlessOperation(operation) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    console.log(`🤖 Running headless operation: ${operation.type}`);
    
    try {
      const result = await this.headlessRunner.execute(operation);
      
      // Track metrics
      this.blockchainMetrics.trackOperation({
        type: operation.type,
        success: true,
        duration: result.duration
      });
      
      return result;
    } catch (error) {
      console.error('Headless operation failed:', error);
      this.blockchainMetrics.trackOperation({
        type: operation.type,
        success: false,
        error: error.message
      });
      throw error;
    }
  }
  
  /**
   * Get crawler checkpoint
   */
  async getCrawlerCheckpoint(crawlerId) {
    return await this.supervisor.getCheckpoint(crawlerId);
  }
  
  /**
   * Save crawler checkpoint
   */
  async saveCrawlerCheckpoint(crawlerId, data) {
    return await this.supervisor.saveCheckpoint(crawlerId, data);
  }
  
  /**
   * Get comprehensive metrics
   */
  async getMetrics() {
    const generalMetrics = this.metrics.getMetrics();
    const blockchainMetrics = await this.blockchainMetrics.getMetrics();
    const batcherStats = this.batcher.getStats();
    const storageStats = await this.storage.getStats();
    
    return {
      general: generalMetrics,
      blockchain: blockchainMetrics,
      batcher: batcherStats,
      storage: storageStats,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Shutdown all utilities
   */
  async shutdown() {
    console.log('🛑 Shutting down UtilityIntegration...');
    
    try {
      await Promise.all([
        this.batcher.stop(),
        this.headlessRunner.stop(),
        this.supervisor.stop(),
        this.storage.shutdown()
      ]);
      
      this.metrics.stopCollection();
      this.initialized = false;
      
      console.log('✅ UtilityIntegration shutdown complete');
    } catch (error) {
      console.error('Error during utility shutdown:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const utilityIntegration = new UtilityIntegration();


