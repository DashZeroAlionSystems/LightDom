import express from 'express';
import { RealWebCrawlerSystem } from './crawler/RealWebCrawlerSystem.js';
import CrawlerSupervisor from './utils/CrawlerSupervisor.js';

console.log('Testing constructor with supervisor...');

try {
  const app = express();
  console.log('Express app created');

  const crawlerSystem = null; // Skip for now
  console.log('Crawler system initialized');

  const supervisor = new CrawlerSupervisor({
    outboxPath: './outbox',
    checkpointPath: './checkpoints'
  });
  console.log('Supervisor created');

  console.log('Constructor test passed');
} catch (error) {
  console.error('Constructor failed:', error);
  console.error(error.stack);
}