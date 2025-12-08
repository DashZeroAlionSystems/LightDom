import { registerRouter, registerCrawlWorker, registerClassifierWorker, enqueueCrawl, enqueueClassifier, getEvents } from './index.js';
import type { DiscoveryJob } from './types.js';

async function handleDiscovery(job: DiscoveryJob): Promise<void> {
  const batchId = new Date().toISOString();
  await enqueueCrawl({ url: job.payload.url as string, batchId });
}

registerRouter(async job => {
  if (job.type === 'discovery') {
    await handleDiscovery(job.data);
  }
});

registerCrawlWorker(async job => {
  console.log('[crawler] placeholder handler for', job.url, job.batchId);
  await enqueueClassifier({ batchId: job.batchId, assetsPath: `storyMining/data/processed/${job.batchId}` });
});

registerClassifierWorker(async job => {
  console.log('[classifier] placeholder handler for', job.batchId, job.assetsPath);
});

const events = getEvents();

events.crawler.on('completed', event => {
  console.log('[crawler] job completed', event.jobId);
});

events.classifier.on('completed', event => {
  console.log('[classifier] job completed', event.jobId);
});

process.on('SIGINT', async () => {
  console.log('Shutting down StoryMiner orchestrator');
  process.exit(0);
});
