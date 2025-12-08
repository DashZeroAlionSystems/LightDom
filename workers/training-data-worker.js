/**
 * Training Data Worker - BullMQ background processor
 * Generates ML training datasets from stored SEO attributes
 */

import { Worker } from 'bullmq';
import 'dotenv/config';
import fs from 'fs/promises';
import { SEOTrainingPipelineSimple } from '../services/seo-training-pipeline-simple.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '2', 10);

// Parse Redis URL
const redisUrl = new URL(REDIS_URL);
const redisConnection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port || '6379', 10),
  password: redisUrl.password || undefined,
};

console.log('📊 Training Data Worker starting...');
console.log(`   Redis: ${redisConnection.host}:${redisConnection.port}`);
console.log(`   Concurrency: ${WORKER_CONCURRENCY}`);

const seoPipeline = new SEOTrainingPipelineSimple();

const worker = new Worker(
  'training-data-generation',
  async job => {
    const {
      datasetName,
      minScore = 0,
      maxScore = 100,
      hostnameFilter = null,
      limit = 1000,
      outputPath = './training_data',
    } = job.data;

    console.log(`[${job.id}] Generating dataset: ${datasetName}`);
    console.log(`[${job.id}]    Score range: ${minScore}-${maxScore}`);
    console.log(`[${job.id}]    Limit: ${limit}`);

    try {
      // Ensure output directory exists
      await fs.mkdir(outputPath, { recursive: true });

      // Generate dataset
      const result = await seoPipeline.generateTrainingDataset({
        datasetName,
        minScore,
        maxScore,
        hostnameFilter,
        limit,
        outputPath,
      });

      console.log(`[${job.id}] ✅ Dataset generated`);
      console.log(`[${job.id}]    Train samples: ${result.trainCount}`);
      console.log(`[${job.id}]    Test samples: ${result.testCount}`);
      console.log(`[${job.id}]    Train file: ${result.trainFilePath}`);
      console.log(`[${job.id}]    Test file: ${result.testFilePath}`);

      return {
        success: true,
        datasetId: result.datasetId,
        trainCount: result.trainCount,
        testCount: result.testCount,
        trainFilePath: result.trainFilePath,
        testFilePath: result.testFilePath,
      };
    } catch (error) {
      console.error(`[${job.id}] ❌ Dataset generation failed:`, error.message);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: WORKER_CONCURRENCY,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  }
);

// Event handlers
worker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed - Dataset ID: ${result.datasetId}`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('error', err => {
  console.error('⚠️ Worker error:', err);
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

console.log('✅ Training Data Worker ready');
