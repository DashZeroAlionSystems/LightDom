import { Queue, QueueEvents, Worker, type JobsOptions } from 'bullmq';
import IORedis from 'ioredis';
import { loadConfig } from './config.js';
import type { StoryMinerJob, DiscoveryJob, CrawlJob, ClassifierJob } from './types.js';

const config = loadConfig();
const connection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  db: config.redis.db,
  keyPrefix: config.redis.prefix,
});

function buildQueue(name: string) {
  return new Queue(name, { connection });
}

const discoveryQueue = buildQueue(config.queues.discovery);
const crawlerQueue = buildQueue(config.queues.crawler);
const classifierQueue = buildQueue(config.queues.classifier);
const enrichmentQueue = buildQueue(config.queues.enrichment);

const discoveryEvents = new QueueEvents(config.queues.discovery, { connection });
const crawlerEvents = new QueueEvents(config.queues.crawler, { connection });
const classifierEvents = new QueueEvents(config.queues.classifier, { connection });

const defaultJobOptions: JobsOptions = {
  removeOnComplete: 100,
  removeOnFail: 500,
};

export async function enqueueDiscovery(job: DiscoveryJob): Promise<void> {
  await discoveryQueue.add('discovery', job, defaultJobOptions);
}

export async function enqueueCrawl(job: CrawlJob): Promise<void> {
  await crawlerQueue.add('crawl', job, defaultJobOptions);
}

export async function enqueueClassifier(job: ClassifierJob): Promise<void> {
  await classifierQueue.add('classify', job, defaultJobOptions);
}

export function registerRouter(handler: (job: StoryMinerJob) => Promise<void>): Worker {
  return new Worker(
    config.queues.discovery,
    async bullJob => {
      const data = bullJob.data as DiscoveryJob;
      await handler({ type: 'discovery', data });
    },
    { connection }
  );
}

export function registerCrawlWorker(handler: (job: CrawlJob) => Promise<void>): Worker {
  return new Worker(
    config.queues.crawler,
    async bullJob => {
      const data = bullJob.data as CrawlJob;
      await handler(data);
    },
    { connection }
  );
}

export function registerClassifierWorker(handler: (job: ClassifierJob) => Promise<void>): Worker {
  return new Worker(
    config.queues.classifier,
    async bullJob => {
      const data = bullJob.data as ClassifierJob;
      await handler(data);
    },
    { connection }
  );
}

export function getEvents() {
  return {
    discovery: discoveryEvents,
    crawler: crawlerEvents,
    classifier: classifierEvents,
  };
}

export async function shutdown(): Promise<void> {
  await Promise.all([
    discoveryQueue.close(),
    crawlerQueue.close(),
    classifierQueue.close(),
    enrichmentQueue.close(),
    discoveryEvents.close(),
    crawlerEvents.close(),
    classifierEvents.close(),
    connection.quit(),
  ]);
}
