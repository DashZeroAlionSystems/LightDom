#!/usr/bin/env node
/**
 * Queue Service: Express API to enqueue crawl jobs and a BullMQ worker to process them.
 *
 * Usage: NODE_ENV=development node services/queue-service.js
 */

import bodyParser from 'body-parser';
import express from 'express';
import { createRequire } from 'module';
import net from 'net';
import process from 'process';
import HeadlessExtractor from '../crawler/headlessExtractor.js';
import SEOCrawlerIntegration from '../crawler/SEOCrawlerIntegration.js';
const require = createRequire(import.meta.url);
// Load bullmq safely (some environments / versions may export differently)
let Queue, Worker, QueueEvents, QueueScheduler;
try {
  const bullmq = require('bullmq');
  Queue = bullmq.Queue || (bullmq.default && bullmq.default.Queue) || bullmq.queue;
  Worker = bullmq.Worker || (bullmq.default && bullmq.default.Worker) || bullmq.worker;
  QueueEvents =
    bullmq.QueueEvents || (bullmq.default && bullmq.default.QueueEvents) || bullmq.queueEvents;
  QueueScheduler =
    bullmq.QueueScheduler ||
    (bullmq.default && bullmq.default.QueueScheduler) ||
    bullmq.queueScheduler;
} catch (e) {
  console.warn(
    'bullmq not available, will use in-memory fallback for queueing',
    e && e.message ? e.message : e
  );
}

// Global safety: log uncaught exceptions/rejections so the service doesn't hard-exit
process.on('uncaughtException', err => {
  console.error(
    'Uncaught Exception in queue-service:',
    err && (err.stack || err.message) ? err.stack || err.message : err
  );
});
process.on('unhandledRejection', reason => {
  console.error(
    'Unhandled Rejection in queue-service:',
    reason && (reason.stack || reason.message) ? reason.stack || reason.message : reason
  );
});

const PORT = Number(process.env.QUEUE_API_PORT || process.env.PORT || 3030);
const QUEUE_NAME = process.env.QUEUE_NAME || 'seo-crawl-queue';

const redisConnection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
  password: process.env.REDIS_PASSWORD || undefined,
};

console.log('Queue service starting', {
  PORT,
  QUEUE_NAME,
  redisConnectionHost: redisConnection.host,
});

// Helper: check Redis reachability before creating BullMQ objects
async function checkRedisReachable(host, port, timeout = 800) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host, port });
    let done = false;
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      done = true;
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      if (!done) {
        done = true;
        socket.destroy();
        resolve(false);
      }
    });
    socket.on('error', () => {
      if (!done) {
        done = true;
        resolve(false);
      }
    });
    socket.on('close', () => {
      if (!done) {
        done = true;
        resolve(false);
      }
    });
  });
}

let queue = null;
let usingInMemoryFallback = false;
if (await checkRedisReachable(redisConnection.host, redisConnection.port)) {
  try {
    queue = new Queue(QUEUE_NAME, { connection: redisConnection });
    console.log('Connected to Redis for BullMQ');
  } catch (err) {
    console.warn(
      'Failed to initialize BullMQ queue, falling back to in-memory queue',
      err && err.message ? err.message : err
    );
    usingInMemoryFallback = true;
  }
} else {
  console.warn(
    'Redis not reachable at',
    `${redisConnection.host}:${redisConnection.port} — using in-memory fallback queue`
  );
  usingInMemoryFallback = true;
}

// Note: detailed metrics object is defined later (including Prometheus gauges) -
// avoid duplicating it here.

// Optional DLQ and QueueEvents for monitoring
let dlq = null;
let queueEvents = null;
let queueScheduler = null;
if (!usingInMemoryFallback && queue) {
  try {
    dlq = new Queue(`${QUEUE_NAME}:dlq`, { connection: redisConnection });
    // QueueScheduler (optional depending on installed bullmq version)
    try {
      if (typeof QueueScheduler === 'function') {
        queueScheduler = new QueueScheduler(QUEUE_NAME, { connection: redisConnection });
        console.log('QueueScheduler initialized');
      } else {
        console.log('QueueScheduler not available in this build of bullmq');
      }
    } catch (e) {
      console.warn('Failed to initialize QueueScheduler', e && e.message ? e.message : e);
    }

    if (typeof QueueEvents === 'function') {
      queueEvents = new QueueEvents(QUEUE_NAME, { connection: redisConnection });
      queueEvents.on('completed', ev => {
        console.log('QueueEvents: completed', ev.jobId);
        metrics.processed = (metrics.processed || 0) + 1;
        metrics.lastJobProcessedAt = Date.now();
      });
      queueEvents.on('failed', ev => {
        console.warn('QueueEvents: failed', ev.jobId, ev.failedReason);
        metrics.failed = (metrics.failed || 0) + 1;
      });
    }
  } catch (e) {
    console.warn('DLQ/QueueEvents initialization failed', e && e.message ? e.message : e);
  }
}

// Lazy crawler integrator: don't instantiate DB integration until needed so the API
// can start even if Postgres/migrations are not available.
let crawlerIntegrator = null;
async function ensureCrawlerIntegrator() {
  if (crawlerIntegrator) return crawlerIntegrator;
  crawlerIntegrator = new SEOCrawlerIntegration();
  // try to load attribute configs but don't fail the service if it errors
  try {
    if (typeof crawlerIntegrator.loadAttributeConfigs === 'function') {
      await crawlerIntegrator.loadAttributeConfigs();
    }
  } catch (e) {
    console.warn(
      'ensureCrawlerIntegrator: loadAttributeConfigs failed',
      e && e.message ? e.message : e
    );
  }
  return crawlerIntegrator;
}

// Simple Worker processor function
async function processJob(job) {
  const { url, campaign_id } = job.data || {};
  if (!url) throw new Error('Missing url in job');

  console.log(`Worker: processing job ${job.id} url=${url}`);

  const extractor = new HeadlessExtractor();
  try {
    const analysis = await extractor.extract(url, {
      timeout: Number(process.env.EXTRACTOR_TIMEOUT || 120000),
    });
    const schemas = analysis.schemas || [];
    const backlinks = analysis.backlinks || [];

    const crawlResult = { url, analysis, schemas, backlinks, performance: analysis.performance };

    // Save analytics and training data (SEOCrawlerIntegration handles DB connection)
    try {
      const integrator = await ensureCrawlerIntegrator();
      if (integrator && typeof integrator.saveSEOAnalytics === 'function') {
        await integrator.saveSEOAnalytics(campaign_id || null, crawlResult);
      } else {
        console.warn('No crawler integrator available; skipping saveSEOAnalytics');
      }
    } catch (err) {
      console.warn('Worker: saveSEOAnalytics failed', err && err.message ? err.message : err);
    }

    try {
      const integrator2 = await ensureCrawlerIntegrator();
      if (integrator2 && typeof integrator2.saveSEOTrainingData === 'function') {
        await integrator2.saveSEOTrainingData(crawlResult);
      } else {
        console.warn('No crawler integrator available; skipping saveSEOTrainingData');
      }
    } catch (err) {
      console.warn('Worker: saveSEOTrainingData failed', err && err.message ? err.message : err);
    }

    return { url };
  } finally {
    try {
      await extractor.close();
    } catch (e) {}
  }
}

// Create a BullMQ Worker with concurrency (or an in-memory poller fallback)
let worker = null;
let inMemoryQueue = [];
let inMemoryPoller = null;

// Metrics instrumentation
const metrics = {
  enqueued: 0,
  processed: 0,
  failed: 0,
  active: 0,
  lastJobDurationMs: 0,
  totalJobDurationMs: 0,
  jobDurationCount: 0,
  inMemoryQueueLength: 0,
  usingInMemoryFallback: usingInMemoryFallback,
};
const jobStartTimes = new Map();

// Optional Prometheus integration (prom-client) — enabled only if package present
let promRegistry = null;
let promGauges = null;
try {
  const promClient = require('prom-client');
  promRegistry = new promClient.Registry();
  promClient.collectDefaultMetrics({ register: promRegistry });
  promGauges = {
    enqueued: new promClient.Gauge({
      name: 'lightdom_queue_enqueued_total',
      help: 'Total enqueued jobs',
      registers: [promRegistry],
    }),
    processed: new promClient.Gauge({
      name: 'lightdom_queue_processed_total',
      help: 'Total processed jobs',
      registers: [promRegistry],
    }),
    failed: new promClient.Gauge({
      name: 'lightdom_queue_failed_total',
      help: 'Total failed jobs',
      registers: [promRegistry],
    }),
    active: new promClient.Gauge({
      name: 'lightdom_queue_active',
      help: 'Currently active jobs',
      registers: [promRegistry],
    }),
    last_duration_ms: new promClient.Gauge({
      name: 'lightdom_queue_last_job_duration_ms',
      help: 'Last job duration in ms',
      registers: [promRegistry],
    }),
    inmem_length: new promClient.Gauge({
      name: 'lightdom_inmemory_queue_length',
      help: 'In-memory queue length',
      registers: [promRegistry],
    }),
  };
  const updatePromMetrics = () => {
    promGauges.enqueued.set(metrics.enqueued);
    promGauges.processed.set(metrics.processed);
    promGauges.failed.set(metrics.failed);
    promGauges.active.set(metrics.active);
    promGauges.last_duration_ms.set(metrics.lastJobDurationMs || 0);
    promGauges.inmem_length.set(metrics.inMemoryQueueLength || 0);
  };
  setInterval(updatePromMetrics, 5000);
} catch (e) {
  // prom-client not available; metrics endpoint will return JSON fallback
}
// Start worker either via BullMQ (Redis) or via in-memory poller.
// Helper to (re)start a Worker that uses Redis/BullMQ.
function startWorkerWithRedis() {
  if (!Worker) {
    console.warn('BullMQ Worker not available; cannot start Redis-backed worker');
    return;
  }

  if (worker) {
    try {
      worker.close().catch(() => {});
    } catch (e) {}
    worker = null;
  }

  worker = new Worker(
    QUEUE_NAME,
    async job => {
      return await processJob(job);
    },
    { connection: redisConnection, concurrency: Number(process.env.WORKER_CONCURRENCY || 2) }
  );

  // track start times and durations
  worker.on('active', job => {
    try {
      metrics.active = (metrics.active || 0) + 1;
      jobStartTimes.set(job.id, Date.now());
    } catch (e) {}
  });

  worker.on('completed', job => {
    console.log(`Worker completed job ${job.id}`);
    try {
      metrics.processed = (metrics.processed || 0) + 1;
      metrics.active = Math.max(0, (metrics.active || 0) - 1);
      const started = jobStartTimes.get(job.id);
      if (started) {
        const dur = Date.now() - started;
        metrics.lastJobDurationMs = dur;
        metrics.totalJobDurationMs = (metrics.totalJobDurationMs || 0) + dur;
        metrics.jobDurationCount = (metrics.jobDurationCount || 0) + 1;
        jobStartTimes.delete(job.id);
      }
    } catch (e) {}
  });

  worker.on('failed', async (job, err) => {
    console.error(`Worker failed job ${job?.id}:`, err && err.message ? err.message : err);
    try {
      metrics.failed = (metrics.failed || 0) + 1;
      metrics.active = Math.max(0, (metrics.active || 0) - 1);
      if (dlq) {
        await dlq.add(
          'failed',
          { original: job.data, failedReason: err && err.message ? err.message : String(err) },
          { removeOnComplete: true }
        );
        console.log('Moved failed job to DLQ', job?.id);
      }
    } catch (e) {
      console.warn('Failed to push job to DLQ', e && e.message ? e.message : e);
    }
  });
}

if (!usingInMemoryFallback) {
  // Ensure queue exists (created earlier if Redis was reachable at startup)
  if (!queue) {
    try {
      queue = new Queue(QUEUE_NAME, { connection: redisConnection });
    } catch (e) {
      console.warn('Failed to initialize Queue on startup', e && e.message ? e.message : e);
    }
  }

  // Start the Redis-backed worker
  startWorkerWithRedis();
} else {
  // Simple in-memory poller to process jobs
  inMemoryPoller = setInterval(
    async () => {
      if (inMemoryQueue.length === 0) return;
      metrics.inMemoryQueueLength = inMemoryQueue.length;
      const item = inMemoryQueue.shift();
      const jobId = `inmem-${Date.now()}`;
      try {
        console.log('In-memory worker processing', item.url);
        jobStartTimes.set(jobId, Date.now());
        metrics.active = (metrics.active || 0) + 1;
        await processJob({ id: jobId, data: item });
        const started = jobStartTimes.get(jobId);
        if (started) {
          const dur = Date.now() - started;
          metrics.lastJobDurationMs = dur;
          metrics.totalJobDurationMs = (metrics.totalJobDurationMs || 0) + dur;
          metrics.jobDurationCount = (metrics.jobDurationCount || 0) + 1;
          jobStartTimes.delete(jobId);
        }
        metrics.processed = (metrics.processed || 0) + 1;
        metrics.active = Math.max(0, metrics.active - 1);
        console.log('In-memory worker completed', item.url);
      } catch (err) {
        metrics.failed = (metrics.failed || 0) + 1;
        metrics.active = Math.max(0, metrics.active - 1);
        console.error('In-memory worker failed', err && err.message ? err.message : err);
      }
    },
    Number(process.env.INMEMORY_POLL_MS || 2000)
  );

  // Periodically probe for Redis and switch to BullMQ when available
  const redisReconnectTimer = setInterval(
    async () => {
      try {
        const ok = await checkRedisReachable(redisConnection.host, redisConnection.port);
        if (!ok) return;
        console.log('Redis reachable — switching to Redis-backed queue');
        // Initialize queue and DLQ
        try {
          queue = new Queue(QUEUE_NAME, { connection: redisConnection });
          dlq = new Queue(`${QUEUE_NAME}:dlq`, { connection: redisConnection });
          if (typeof QueueScheduler === 'function') {
            try {
              queueScheduler = new QueueScheduler(QUEUE_NAME, { connection: redisConnection });
              console.log('QueueScheduler initialized after reconnect');
            } catch (e) {
              console.warn(
                'QueueScheduler init failed after reconnect',
                e && e.message ? e.message : e
              );
            }
          }
          if (typeof QueueEvents === 'function') {
            queueEvents = new QueueEvents(QUEUE_NAME, { connection: redisConnection });
            queueEvents.on('completed', ev => {
              metrics.processed = (metrics.processed || 0) + 1;
              metrics.lastJobProcessedAt = Date.now();
            });
            queueEvents.on('failed', ev => {
              metrics.failed = (metrics.failed || 0) + 1;
            });
          }
          // stop in-memory poller
          if (inMemoryPoller) {
            clearInterval(inMemoryPoller);
            inMemoryPoller = null;
          }
          usingInMemoryFallback = false;
          metrics.usingInMemoryFallback = false;
          // start Redis-backed worker
          startWorkerWithRedis();
          clearInterval(redisReconnectTimer);
        } catch (e) {
          console.warn(
            'Failed to initialize BullMQ after redis became reachable',
            e && e.message ? e.message : e
          );
        }
      } catch (e) {
        // ignore probe errors
      }
    },
    Number(process.env.REDIS_RECONNECT_MS || 5000)
  );
}

// Start Express API
const app = express();
app.use(bodyParser.json({ limit: '1mb' }));

// Enqueue endpoint
app.post('/api/enqueue', async (req, res) => {
  try {
    const { url, campaign_id, priority } = req.body || {};
    if (!url) return res.status(400).json({ error: 'url is required' });

    const jobOptions = {
      attempts: Number(process.env.JOB_ATTEMPTS || 3),
      backoff: { type: 'exponential', delay: Number(process.env.JOB_BACKOFF_MS || 2000) },
      removeOnComplete: true,
      removeOnFail: false,
    };
    if (typeof priority !== 'undefined') jobOptions.priority = Number(priority);

    if (usingInMemoryFallback) {
      const id = `inmem-${Date.now()}`;
      inMemoryQueue.push({ id, url, campaign_id, priority, createdAt: new Date().toISOString() });
      // metrics
      metrics.enqueued = (metrics.enqueued || 0) + 1;
      metrics.inMemoryQueueLength = inMemoryQueue.length;
      if (promGauges && promGauges.enqueued) promGauges.enqueued.set(metrics.enqueued);
      if (promGauges && promGauges.inmem_length)
        promGauges.inmem_length.set(metrics.inMemoryQueueLength);
      return res.json({ ok: true, jobId: id, fallback: true });
    }

    const job = await queue.add('crawl', { url, campaign_id }, jobOptions);
    metrics.enqueued = (metrics.enqueued || 0) + 1;
    if (promGauges && promGauges.enqueued) promGauges.enqueued.set(metrics.enqueued);
    return res.json({ ok: true, jobId: job.id });
  } catch (err) {
    console.error('Enqueue failed', err && err.message ? err.message : err);
    return res
      .status(500)
      .json({ error: 'enqueue_failed', detail: err && err.message ? err.message : String(err) });
  }
});

// Metrics endpoint: Prometheus text if prom-client available, otherwise JSON
app.get('/metrics', async (req, res) => {
  try {
    if (promRegistry) {
      const metricsText = await promRegistry.metrics();
      res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      return res.send(metricsText);
    }

    const avgJobDuration = metrics.jobDurationCount
      ? metrics.totalJobDurationMs / metrics.jobDurationCount
      : 0;
    return res.json({ ok: true, metrics: { ...metrics, averageJobDurationMs: avgJobDuration } });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

app.get('/api/metrics', async (req, res) => {
  return app._router.handle(req, res, () => {}); // forward to /metrics handler
});

app.get('/api/health', async (req, res) => {
  try {
    const counts = queue
      ? await queue.getJobCounts()
      : { waiting: inMemoryQueue.length, active: 0, completed: 0, failed: 0 };
    // DB check
    let dbOk = false;
    try {
      const integrator = await ensureCrawlerIntegrator();
      if (integrator && integrator.pool) {
        const client = await integrator.pool.connect();
        await client.query('SELECT 1');
        client.release();
        dbOk = true;
      } else {
        dbOk = false;
      }
    } catch (e) {
      dbOk = false;
    }
    return res.json({
      ok: true,
      queue: counts,
      redis: { host: redisConnection.host, port: redisConnection.port },
      db: { ok: dbOk },
    });
  } catch (err) {
    console.error('Health check failed', err && err.message ? err.message : err);
    return res.status(500).json({ ok: false });
  }
});

app.get('/api/queue/stats', async (req, res) => {
  try {
    const counts = queue
      ? await queue.getJobCounts()
      : {
          waiting: inMemoryQueue.length,
          active: metrics.active || 0,
          completed: metrics.processed || 0,
          failed: metrics.failed || 0,
        };
    return res.json({ ok: true, counts, usingInMemoryFallback, metrics });
  } catch (err) {
    console.error('Queue stats failed', err && err.message ? err.message : err);
    return res.status(500).json({ ok: false });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Queue API listening on ${PORT}`);
});

async function shutdown() {
  console.log('Shutting down queue service...');
  try {
    await server.close();
  } catch (e) {}
  try {
    if (worker) await worker.close();
  } catch (e) {}
  try {
    if (inMemoryPoller) clearInterval(inMemoryPoller);
  } catch (e) {}
  try {
    if (queue) await queue.close();
  } catch (e) {}
  try {
    if (queueEvents && typeof queueEvents.close === 'function') await queueEvents.close();
  } catch (e) {}
  try {
    if (dlq) await dlq.close();
  } catch (e) {}
  try {
    if (crawlerIntegrator && typeof crawlerIntegrator.close === 'function')
      await crawlerIntegrator.close();
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', () => {
  console.log('SIGINT received');
  shutdown();
});
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  shutdown();
});
process.on('beforeExit', code => {
  console.log('process beforeExit', code);
});
process.on('exit', code => {
  console.log('process exit', code);
});

export default app;
