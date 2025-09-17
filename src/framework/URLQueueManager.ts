/**
 * URL Queue Manager - Manages the optimization queue for mined URLs
 * Handles priority, retry logic, and batch processing
 */

import { EventEmitter } from 'events';
import { URLQueueItem } from './LightDomFramework';

export interface QueueConfig {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  priorityWeights: {
    high: number;
    medium: number;
    low: number;
  };
  enableAutoRetry: boolean;
  enableBatchProcessing: boolean;
  maxQueueSize: number;
}

export interface QueueMetrics {
  totalProcessed: number;
  totalFailed: number;
  averageProcessingTime: number;
  successRate: number;
  queueLength: number;
  processingRate: number;
}

export class URLQueueManager extends EventEmitter {
  private queue: Map<string, URLQueueItem> = new Map();
  private processing: Set<string> = new Set();
  private completed: Map<string, URLQueueItem> = new Map();
  private failed: Map<string, URLQueueItem> = new Map();
  private config: QueueConfig;
  private metrics: QueueMetrics;
  private processingTimes: number[] = [];

  constructor(config: Partial<QueueConfig> = {}) {
    super();
    this.config = {
      maxRetries: 3,
      retryDelay: 5000, // 5 seconds
      batchSize: 10,
      priorityWeights: { high: 3, medium: 2, low: 1 },
      enableAutoRetry: true,
      enableBatchProcessing: true,
      maxQueueSize: 1000,
      ...config,
    };

    this.metrics = {
      totalProcessed: 0,
      totalFailed: 0,
      averageProcessingTime: 0,
      successRate: 0,
      queueLength: 0,
      processingRate: 0,
    };
  }

  /**
   * Add URL to queue with priority and site type
   */
  addURL(
    url: string,
    priority: 'high' | 'medium' | 'low' = 'medium',
    siteType: URLQueueItem['siteType'] = 'other',
    metadata?: Record<string, any>
  ): string {
    // Check queue size limit
    if (this.queue.size >= this.config.maxQueueSize) {
      throw new Error(`Queue is full (max ${this.config.maxQueueSize} items)`);
    }

    const queueItem: URLQueueItem = {
      id: this.generateId(),
      url,
      priority,
      status: 'pending',
      addedAt: Date.now(),
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      siteType,
      expectedOptimization: this.calculateExpectedOptimization(siteType),
      ...metadata,
    };

    this.queue.set(queueItem.id, queueItem);
    this.updateMetrics();

    this.emit('urlAdded', queueItem);
    console.log(`📝 Added URL to queue: ${url} (Priority: ${priority}, Type: ${siteType})`);

    return queueItem.id;
  }

  /**
   * Add multiple URLs in batch
   */
  addURLs(
    urls: Array<{
      url: string;
      priority?: 'high' | 'medium' | 'low';
      siteType?: URLQueueItem['siteType'];
      metadata?: Record<string, any>;
    }>
  ): string[] {
    const addedIds: string[] = [];

    for (const urlData of urls) {
      try {
        const id = this.addURL(urlData.url, urlData.priority, urlData.siteType, urlData.metadata);
        addedIds.push(id);
      } catch (error) {
        console.error(`Failed to add URL ${urlData.url}:`, error);
      }
    }

    this.emit('batchAdded', { count: addedIds.length, ids: addedIds });
    return addedIds;
  }

  /**
   * Get next batch of URLs to process
   */
  getNextBatch(): URLQueueItem[] {
    if (!this.config.enableBatchProcessing) {
      const next = this.getNextItem();
      return next ? [next] : [];
    }

    const pendingItems = Array.from(this.queue.values())
      .filter(item => item.status === 'pending')
      .sort(this.priorityComparator)
      .slice(0, this.config.batchSize);

    return pendingItems;
  }

  /**
   * Get next single item to process
   */
  getNextItem(): URLQueueItem | undefined {
    const pendingItems = Array.from(this.queue.values())
      .filter(item => item.status === 'pending')
      .sort(this.priorityComparator);

    return pendingItems[0];
  }

  /**
   * Mark item as processing
   */
  markAsProcessing(itemId: string): boolean {
    const item = this.queue.get(itemId);
    if (!item || item.status !== 'pending') {
      return false;
    }

    item.status = 'processing';
    this.processing.add(itemId);
    this.updateMetrics();

    this.emit('processingStarted', item);
    return true;
  }

  /**
   * Mark item as completed
   */
  markAsCompleted(itemId: string, result?: any): boolean {
    const item = this.queue.get(itemId);
    if (!item || item.status !== 'processing') {
      return false;
    }

    const processingTime = Date.now() - item.addedAt;
    this.processingTimes.push(processingTime);

    item.status = 'completed';
    item.processedAt = Date.now();
    item.optimizationResult = result;

    this.processing.delete(itemId);
    this.completed.set(itemId, item);
    this.queue.delete(itemId);

    this.updateMetrics();
    this.emit('processingCompleted', { item, result, processingTime });

    return true;
  }

  /**
   * Mark item as failed
   */
  markAsFailed(itemId: string, error: string): boolean {
    const item = this.queue.get(itemId);
    if (!item) {
      return false;
    }

    item.status = 'failed';
    item.error = error;
    item.retryCount++;

    this.processing.delete(itemId);

    // Auto-retry if enabled and under max retries
    if (this.config.enableAutoRetry && item.retryCount < item.maxRetries) {
      setTimeout(() => {
        item.status = 'pending';
        item.error = undefined;
        this.emit('retryScheduled', item);
      }, this.config.retryDelay);
    } else {
      this.failed.set(itemId, item);
      this.queue.delete(itemId);
    }

    this.updateMetrics();
    this.emit('processingFailed', { item, error });

    return true;
  }

  /**
   * Remove item from queue
   */
  removeItem(itemId: string): boolean {
    const item = this.queue.get(itemId);
    if (!item) {
      return false;
    }

    this.queue.delete(itemId);
    this.processing.delete(itemId);
    this.updateMetrics();

    this.emit('itemRemoved', item);
    return true;
  }

  /**
   * Clear completed items
   */
  clearCompleted(): number {
    const count = this.completed.size;
    this.completed.clear();
    this.updateMetrics();

    this.emit('completedCleared', { count });
    return count;
  }

  /**
   * Clear failed items
   */
  clearFailed(): number {
    const count = this.failed.size;
    this.failed.clear();
    this.updateMetrics();

    this.emit('failedCleared', { count });
    return count;
  }

  /**
   * Retry failed item
   */
  retryItem(itemId: string): boolean {
    const item = this.failed.get(itemId);
    if (!item) {
      return false;
    }

    item.status = 'pending';
    item.retryCount = 0;
    item.error = undefined;
    item.addedAt = Date.now();

    this.failed.delete(itemId);
    this.queue.set(itemId, item);
    this.updateMetrics();

    this.emit('itemRetried', item);
    return true;
  }

  /**
   * Get queue status
   */
  getStatus(): {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
    byPriority: Record<string, number>;
    bySiteType: Record<string, number>;
  } {
    const pending = Array.from(this.queue.values()).filter(item => item.status === 'pending');
    const processing = Array.from(this.queue.values()).filter(item => item.status === 'processing');

    return {
      pending: pending.length,
      processing: processing.length,
      completed: this.completed.size,
      failed: this.failed.size,
      total: this.queue.size + this.completed.size + this.failed.size,
      byPriority: {
        high: pending.filter(item => item.priority === 'high').length,
        medium: pending.filter(item => item.priority === 'medium').length,
        low: pending.filter(item => item.priority === 'low').length,
      },
      bySiteType: pending.reduce(
        (acc, item) => {
          acc[item.siteType] = (acc[item.siteType] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }

  /**
   * Get metrics
   */
  getMetrics(): QueueMetrics {
    return { ...this.metrics };
  }

  /**
   * Get item by ID
   */
  getItem(itemId: string): URLQueueItem | undefined {
    return this.queue.get(itemId) || this.completed.get(itemId) || this.failed.get(itemId);
  }

  /**
   * Get all items
   */
  getAllItems(): URLQueueItem[] {
    return [
      ...Array.from(this.queue.values()),
      ...Array.from(this.completed.values()),
      ...Array.from(this.failed.values()),
    ];
  }

  /**
   * Get items by status
   */
  getItemsByStatus(status: 'pending' | 'processing' | 'completed' | 'failed'): URLQueueItem[] {
    switch (status) {
      case 'pending':
        return Array.from(this.queue.values()).filter(item => item.status === 'pending');
      case 'processing':
        return Array.from(this.queue.values()).filter(item => item.status === 'processing');
      case 'completed':
        return Array.from(this.completed.values());
      case 'failed':
        return Array.from(this.failed.values());
      default:
        return [];
    }
  }

  /**
   * Get items by priority
   */
  getItemsByPriority(priority: 'high' | 'medium' | 'low'): URLQueueItem[] {
    return Array.from(this.queue.values()).filter(item => item.priority === priority);
  }

  /**
   * Get items by site type
   */
  getItemsBySiteType(siteType: string): URLQueueItem[] {
    return Array.from(this.queue.values()).filter(item => item.siteType === siteType);
  }

  /**
   * Search items by URL pattern
   */
  searchItems(pattern: string | RegExp): URLQueueItem[] {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');
    return Array.from(this.queue.values()).filter(item => regex.test(item.url));
  }

  /**
   * Get queue statistics
   */
  getStatistics(): {
    totalItems: number;
    successRate: number;
    averageProcessingTime: number;
    processingRate: number;
    oldestPendingItem?: URLQueueItem;
    newestPendingItem?: URLQueueItem;
  } {
    const allItems = this.getAllItems();
    const pendingItems = this.getItemsByStatus('pending');

    return {
      totalItems: allItems.length,
      successRate: this.metrics.successRate,
      averageProcessingTime: this.metrics.averageProcessingTime,
      processingRate: this.metrics.processingRate,
      oldestPendingItem: pendingItems.sort((a, b) => a.addedAt - b.addedAt)[0],
      newestPendingItem: pendingItems.sort((a, b) => b.addedAt - a.addedAt)[0],
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<QueueConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('configUpdated', this.config);
  }

  /**
   * Clear entire queue
   */
  clear(): void {
    const totalItems = this.queue.size + this.completed.size + this.failed.size;

    this.queue.clear();
    this.processing.clear();
    this.completed.clear();
    this.failed.clear();
    this.processingTimes = [];
    this.updateMetrics();

    this.emit('queueCleared', { totalItems });
  }

  /**
   * Priority comparator for sorting
   */
  private priorityComparator = (a: URLQueueItem, b: URLQueueItem): number => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];

    if (aPriority !== bPriority) {
      return bPriority - aPriority; // Higher priority first
    }

    return a.addedAt - b.addedAt; // FIFO within same priority
  };

  /**
   * Calculate expected optimization for site type
   */
  private calculateExpectedOptimization(siteType: string): URLQueueItem['expectedOptimization'] {
    const optimizationMap: Record<string, URLQueueItem['expectedOptimization']> = {
      ecommerce: {
        type: ['performance', 'seo', 'security'],
        estimatedSavings: 150,
        perks: ['image_optimization', 'checkout_optimization', 'seo_enhancement'],
      },
      blog: {
        type: ['performance', 'seo'],
        estimatedSavings: 80,
        perks: ['content_optimization', 'reading_experience', 'social_sharing'],
      },
      corporate: {
        type: ['performance', 'security', 'analytics'],
        estimatedSavings: 120,
        perks: ['professional_branding', 'analytics_integration', 'security_compliance'],
      },
      portfolio: {
        type: ['performance', 'seo'],
        estimatedSavings: 60,
        perks: ['image_optimization', 'portfolio_showcase', 'seo_optimization'],
      },
      news: {
        type: ['performance', 'seo'],
        estimatedSavings: 100,
        perks: ['content_optimization', 'news_seo', 'social_integration'],
      },
      social: {
        type: ['performance', 'analytics'],
        estimatedSavings: 200,
        perks: ['social_optimization', 'analytics_tracking', 'engagement_metrics'],
      },
      other: {
        type: ['performance'],
        estimatedSavings: 50,
        perks: ['basic_optimization'],
      },
    };

    return optimizationMap[siteType] || optimizationMap.other;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    const totalProcessed = this.completed.size;
    const totalFailed = this.failed.size;
    const total = totalProcessed + totalFailed;

    this.metrics = {
      totalProcessed,
      totalFailed,
      averageProcessingTime:
        this.processingTimes.length > 0
          ? this.processingTimes.reduce((sum, time) => sum + time, 0) / this.processingTimes.length
          : 0,
      successRate: total > 0 ? (totalProcessed / total) * 100 : 0,
      queueLength: this.queue.size,
      processingRate:
        this.processingTimes.length > 0
          ? (this.processingTimes.length / (Date.now() - Math.min(...this.processingTimes))) *
            1000 *
            60 // per minute
          : 0,
    };
  }
}

// Export singleton instance
export const urlQueueManager = new URLQueueManager();
