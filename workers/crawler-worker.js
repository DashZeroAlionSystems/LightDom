/**
 * Crawler Worker - BullMQ background processor
 * Processes web crawling jobs from Redis queue
 */

import { Worker } from 'bullmq';
import 'dotenv/config';
import { RealWebCrawlerSystem } from '../crawler/RealWebCrawlerSystem.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '3', 10);

// Parse Redis URL
const redisUrl = new URL(REDIS_URL);
const redisConnection = {
  host: redisUrl.hostname,
  port: parseInt(redisUrl.port || '6379', 10),
  password: redisUrl.password || undefined,
};

console.log('🕷️ Crawler Worker starting...');
console.log(`   Redis: ${redisConnection.host}:${redisConnection.port}`);
console.log(`   Concurrency: ${WORKER_CONCURRENCY}`);

// Initialize crawler (will reuse browser instances)
const crawler = new RealWebCrawlerSystem({
  headless: true,
  maxConcurrency: WORKER_CONCURRENCY,
});

const worker = new Worker(
  'web-crawling',
  async job => {
    const { url, options = {} } = job.data;

    console.log(`[${job.id}] Crawling: ${url}`);

    try {
      // Crawl the URL
      const result = await crawler.crawl(url, {
        ...options,
        maxDepth: options.maxDepth || 1,
        maxPages: options.maxPages || 10,
      });

      console.log(`[${job.id}] ✅ Crawl completed`);
      console.log(`[${job.id}]    Pages: ${result.pages.length}`);
      console.log(
        `[${job.id}]    SEO Records: ${result.pages.filter(p => p.seoAttributesId).length}`
      );

      return {
        success: true,
        pagesCount: result.pages.length,
        seoRecordsCount: result.pages.filter(p => p.seoAttributesId).length,
        crawlSessionId: result.sessionId,
      };
    } catch (error) {
      console.error(`[${job.id}] ❌ Crawl failed:`, error.message);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: WORKER_CONCURRENCY,
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 2000 },
    limiter: {
      max: 10, // Max 10 jobs
      duration: 1000, // Per second (rate limiting)
    },
  }
);

// Event handlers
worker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed - ${result.pagesCount} pages crawled`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('error', err => {
  console.error('⚠️ Worker error:', err);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing worker and browser...');
  await crawler.close();
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, closing worker and browser...');
  await crawler.close();
  await worker.close();
  process.exit(0);
});

console.log('✅ Crawler Worker ready');
