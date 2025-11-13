/**
 * SEO Extraction Worker - BullMQ background processor
 * Processes SEO extraction jobs from Redis queue
 */

import { Worker } from 'bullmq';
import 'dotenv/config';
import { SEOTrainingPipelineSimple } from '../services/seo-training-pipeline-simple.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '5', 10);

// Parse Redis URL
const redisUrl = new URL(REDIS_URL);
const redisConnection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port || '6379', 10),
  password: redisUrl.password || undefined,
};

console.log('🔧 SEO Extraction Worker starting...');
console.log(`   Redis: ${redisConnection.host}:${redisConnection.port}`);
console.log(`   Concurrency: ${WORKER_CONCURRENCY}`);

const seoPipeline = new SEOTrainingPipelineSimple();

const worker = new Worker(
  'seo-extraction',
  async job => {
    const { url, html, crawlSessionId } = job.data;

    console.log(`[${job.id}] Processing SEO extraction for: ${url}`);

    try {
      // Process page through SEO pipeline
      const result = await seoPipeline.processPage({
        url,
        html,
        crawlSessionId,
      });

      console.log(`[${job.id}] ✅ SEO attributes stored (ID: ${result.seoAttributesId})`);
      console.log(`[${job.id}]    Overall Score: ${result.scores.overall}`);
      console.log(`[${job.id}]    Word Count: ${result.attributes.wordCount}`);

      return {
        success: true,
        seoAttributesId: result.seoAttributesId,
        scores: result.scores,
        processingTime: result.processingTime,
      };
    } catch (error) {
      console.error(`[${job.id}] ❌ SEO extraction failed:`, error.message);
      throw error; // Will trigger retry mechanism
    }
  },
  {
    connection: redisConnection,
    concurrency: WORKER_CONCURRENCY,
    removeOnComplete: { count: 1000 }, // Keep last 1000 completed jobs
    removeOnFail: { count: 5000 }, // Keep last 5000 failed jobs
  }
);

// Event handlers
worker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed - SEO ID: ${result.seoAttributesId}`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('error', err => {
  console.error('⚠️ Worker error:', err);
});

worker.on('stalled', jobId => {
  console.warn(`⏸️ Job ${jobId} stalled`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing worker...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, closing worker...');
  await worker.close();
  process.exit(0);
});

console.log('✅ SEO Extraction Worker ready');
