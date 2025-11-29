/**
 * Job Queue Service - BullMQ queue management
 * Provides API for enqueueing jobs to background workers
 */

import { Queue } from 'bullmq';
import 'dotenv/config';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Parse Redis URL
const redisUrl = new URL(REDIS_URL);
const redisConnection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port || '6379', 10),
  password: redisUrl.password || undefined,
};

// Initialize queues
export const seoExtractionQueue = new Queue('seo-extraction', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

export const crawlerQueue = new Queue('web-crawling', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: 500,
    removeOnFail: 2000,
  },
});

export const trainingDataQueue = new Queue('training-data-generation', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

// Helper functions to enqueue jobs
export async function enqueueSEOExtraction({ url, html, crawlSessionId }) {
  const job = await seoExtractionQueue.add(
    'extract-seo',
    { url, html, crawlSessionId },
    {
      priority: 1, // High priority
      jobId: `seo-${Date.now()}-${url}`,
    }
  );
  return job;
}

export async function enqueueCrawl({ url, options = {} }) {
  const job = await crawlerQueue.add(
    'crawl-website',
    { url, options },
    {
      priority: 2, // Medium priority
      jobId: `crawl-${Date.now()}-${url}`,
    }
  );
  return job;
}

export async function enqueueTrainingDataGeneration({
  datasetName,
  minScore,
  maxScore,
  hostnameFilter,
  limit,
  outputPath,
}) {
  const job = await trainingDataQueue.add(
    'generate-dataset',
    { datasetName, minScore, maxScore, hostnameFilter, limit, outputPath },
    {
      priority: 3, // Lower priority
      jobId: `dataset-${Date.now()}-${datasetName}`,
    }
  );
  return job;
}

// Queue monitoring helpers
export async function getQueueStats(queueName) {
  let queue;
  switch (queueName) {
    case 'seo-extraction':
      queue = seoExtractionQueue;
      break;
    case 'web-crawling':
      queue = crawlerQueue;
      break;
    case 'training-data-generation':
      queue = trainingDataQueue;
      break;
    default:
      throw new Error(`Unknown queue: ${queueName}`);
  }

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    queueName,
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

export async function getAllQueueStats() {
  const [seoStats, crawlStats, trainingStats] = await Promise.all([
    getQueueStats('seo-extraction'),
    getQueueStats('web-crawling'),
    getQueueStats('training-data-generation'),
  ]);

  return {
    seoExtraction: seoStats,
    webCrawling: crawlStats,
    trainingDataGeneration: trainingStats,
  };
}

console.log('✅ Job Queue Service initialized');
console.log(`   Redis: ${redisConnection.host}:${redisConnection.port}`);
