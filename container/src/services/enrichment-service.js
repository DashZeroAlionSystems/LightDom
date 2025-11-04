/**
 * Enrichment Service
 * 
 * Handles background enrichment jobs using Bull queue
 */

import Bull from 'bull';
import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';
import Redis from 'redis';

const prisma = new PrismaClient();
const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

await redis.connect();

class EnrichmentService extends EventEmitter {
  constructor() {
    super();
    
    // Create Bull queue
    this.queue = new Bull('enrichment', process.env.REDIS_URL || 'redis://localhost:6379');

    // Process jobs
    this.queue.process('ai-enrich', 5, async (job) => {
      return await this.processAIEnrichment(job);
    });

    this.queue.process('api-enrich', 10, async (job) => {
      return await this.processAPIEnrichment(job);
    });

    // Event handlers
    this.queue.on('completed', (job, result) => {
      this.emit('completed', { jobId: job.id, result });
    });

    this.queue.on('failed', (job, err) => {
      this.emit('failed', { jobId: job.id, error: err.message });
    });
  }

  /**
   * Enqueue batch enrichment
   */
  async enqueueBatch(entityIds, enrichmentType, config = {}) {
    const jobs = entityIds.map(entityId => ({
      name: enrichmentType,
      data: { entityId, enrichmentType, config },
      opts: {
        priority: config.priority || 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    }));

    await this.queue.addBulk(jobs);

    const jobId = `batch_${Date.now()}`;
    
    // Store batch info in Redis
    await redis.set(
      `batch:${jobId}`,
      JSON.stringify({
        entityIds,
        enrichmentType,
        status: 'queued',
        total: entityIds.length,
        completed: 0
      }),
      { EX: 86400 } // 24 hour expiry
    );

    return jobId;
  }

  /**
   * Process AI enrichment
   */
  async processAIEnrichment(job) {
    const { entityId, config } = job.data;

    job.progress(0);

    // Get entity
    const entity = await prisma.entity.findUnique({
      where: { id: entityId }
    });

    if (!entity) {
      throw new Error('Entity not found');
    }

    job.progress(25);

    // Simulate AI enrichment (replace with actual LLM call)
    const enrichedData = {
      ...entity.data,
      aiSummary: `AI-generated summary for ${entity.entityType}`,
      aiTags: ['tag1', 'tag2', 'tag3'],
      aiScore: Math.random() * 100
    };

    job.progress(75);

    // Update entity
    const updated = await prisma.entity.update({
      where: { id: entityId },
      data: {
        data: enrichedData,
        metadata: {
          ...entity.metadata,
          enriched: true,
          enrichedAt: new Date().toISOString()
        }
      }
    });

    job.progress(100);

    return updated;
  }

  /**
   * Process API enrichment
   */
  async processAPIEnrichment(job) {
    const { entityId, config } = job.data;

    const entity = await prisma.entity.findUnique({
      where: { id: entityId }
    });

    if (!entity) {
      throw new Error('Entity not found');
    }

    // Simulate API call (replace with actual API integration)
    const apiData = {
      externalId: `ext_${entityId}`,
      fetchedAt: new Date().toISOString()
    };

    const updated = await prisma.entity.update({
      where: { id: entityId },
      data: {
        metadata: {
          ...entity.metadata,
          apiData
        }
      }
    });

    return updated;
  }

  /**
   * Get job status
   */
  async getJobStatus(jobId) {
    if (jobId.startsWith('batch_')) {
      const batchInfo = await redis.get(`batch:${jobId}`);
      return batchInfo ? JSON.parse(batchInfo) : null;
    }

    const job = await this.queue.getJob(jobId);
    
    if (!job) {
      return null;
    }

    const state = await job.getState();
    const progress = job.progress();

    return {
      jobId: job.id,
      state,
      progress,
      data: job.data
    };
  }

  /**
   * Get queue health
   */
  async getQueueHealth() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount()
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      healthy: active < 1000 && failed < 100
    };
  }

  /**
   * Health check
   */
  async checkHealth() {
    try {
      await redis.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Cleanup
   */
  async cleanup() {
    await this.queue.close();
    await redis.quit();
  }
}

export { EnrichmentService };
