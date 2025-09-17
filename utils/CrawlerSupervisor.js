/**
 * Crawler Supervisor
 * Manages crawler resilience and checkpointing
 */

import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';

class CrawlerSupervisor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      outboxPath: './outbox',
      checkpointPath: './checkpoints',
      maxRetries: 3,
      retryDelay: 5000,
      ...options,
    };

    this.activeCrawlers = new Map();
    this.checkpoints = new Map();
    this.isRunning = false;

    this.init();
  }

  async init() {
    // Ensure directories exist
    await this.ensureDirectories();

    // Load existing checkpoints
    await this.loadCheckpoints();

    this.isRunning = true;
    this.emit('initialized');
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.options.outboxPath, { recursive: true });
      await fs.mkdir(this.options.checkpointPath, { recursive: true });
    } catch (error) {
      console.error('Failed to create supervisor directories:', error);
    }
  }

  async loadCheckpoints() {
    try {
      const files = await fs.readdir(this.options.checkpointPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const checkpointPath = path.join(this.options.checkpointPath, file);
          const data = await fs.readFile(checkpointPath, 'utf8');
          const checkpoint = JSON.parse(data);
          this.checkpoints.set(checkpoint.id, checkpoint);
        }
      }
    } catch (error) {
      console.error('Failed to load checkpoints:', error);
    }
  }

  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.emit('started');
    console.log('Crawler supervisor started');
  }

  async stop() {
    this.isRunning = false;

    // Save all active checkpoints
    await this.saveAllCheckpoints();

    this.emit('stopped');
    console.log('Crawler supervisor stopped');
  }

  registerCrawler(crawlerId, config) {
    const crawler = {
      id: crawlerId,
      config,
      status: 'idle',
      startTime: Date.now(),
      lastCheckpoint: null,
      retryCount: 0,
      errors: [],
    };

    this.activeCrawlers.set(crawlerId, crawler);
    this.emit('crawlerRegistered', crawler);

    return crawler;
  }

  async createCheckpoint(crawlerId, data) {
    const checkpoint = {
      id: `${crawlerId}_${Date.now()}`,
      crawlerId,
      timestamp: Date.now(),
      data,
      status: 'active',
    };

    this.checkpoints.set(checkpoint.id, checkpoint);
    await this.saveCheckpoint(checkpoint);

    const crawler = this.activeCrawlers.get(crawlerId);
    if (crawler) {
      crawler.lastCheckpoint = checkpoint.id;
    }

    this.emit('checkpointCreated', checkpoint);
    return checkpoint;
  }

  async saveCheckpoint(checkpoint) {
    try {
      const filePath = path.join(this.options.checkpointPath, `${checkpoint.id}.json`);
      await fs.writeFile(filePath, JSON.stringify(checkpoint, null, 2));
    } catch (error) {
      console.error('Failed to save checkpoint:', error);
    }
  }

  async saveAllCheckpoints() {
    for (const checkpoint of this.checkpoints.values()) {
      await this.saveCheckpoint(checkpoint);
    }
  }

  async handleCrawlerError(crawlerId, error) {
    const crawler = this.activeCrawlers.get(crawlerId);
    if (!crawler) return;

    crawler.errors.push({
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack,
    });

    crawler.retryCount++;

    if (crawler.retryCount <= this.options.maxRetries) {
      // Schedule retry
      setTimeout(() => {
        this.retryCrawler(crawlerId);
      }, this.options.retryDelay);

      this.emit('crawlerRetryScheduled', { crawlerId, retryCount: crawler.retryCount });
    } else {
      // Mark as failed
      crawler.status = 'failed';
      this.emit('crawlerFailed', { crawlerId, errors: crawler.errors });
    }
  }

  async retryCrawler(crawlerId) {
    const crawler = this.activeCrawlers.get(crawlerId);
    if (!crawler) return;

    crawler.status = 'retrying';
    this.emit('crawlerRetrying', { crawlerId, retryCount: crawler.retryCount });
  }

  getStats() {
    const stats = {
      isRunning: this.isRunning,
      activeCrawlers: this.activeCrawlers.size,
      totalCheckpoints: this.checkpoints.size,
      crawlers: Array.from(this.activeCrawlers.values()).map(crawler => ({
        id: crawler.id,
        status: crawler.status,
        startTime: crawler.startTime,
        retryCount: crawler.retryCount,
        errorCount: crawler.errors.length,
      })),
    };

    return stats;
  }

  getCrawlerStatus(crawlerId) {
    return this.activeCrawlers.get(crawlerId);
  }

  getAllCheckpoints() {
    return Array.from(this.checkpoints.values());
  }

  getCheckpointsForCrawler(crawlerId) {
    return Array.from(this.checkpoints.values()).filter(
      checkpoint => checkpoint.crawlerId === crawlerId
    );
  }
}

export default CrawlerSupervisor;
