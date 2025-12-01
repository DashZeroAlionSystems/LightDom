import { registerCrawlWorker, enqueueClassifier } from '../../orchestrator/src/index.js';
import { CrawlerService } from './crawlerService.js';

const crawler = new CrawlerService();

registerCrawlWorker(async job => {
  const assets = await crawler.crawl(job);
  await enqueueClassifier({
    batchId: job.batchId,
    sourceUrl: job.url,
    origin: job.origin,
    assets,
  });
});

process.on('SIGINT', async () => {
  await crawler.shutdown();
  process.exit(0);
});
