import { RealWebCrawlerSystem } from './crawler/RealWebCrawlerSystem.js';

async function testSimple() {
  const crawler = new RealWebCrawlerSystem({
    maxConcurrency: 1,
    requestDelay: 100,
    maxDepth: 1,
    respectRobots: false,
    submitPoO: false,
  });

  try {
    console.log('Testing priority calculation in test environment...');
    const priority1 = await crawler.calculateUrlPriority(
      'https://example.com',
      1,
      'https://referrer.com'
    );
    const priority2 = await crawler.calculateUrlPriority(
      'https://subdomain.example.com',
      3,
      'https://referrer.com'
    );

    console.log('Priority 1 (depth 1):', priority1);
    console.log('Priority 2 (depth 3):', priority2);
    console.log('Priority 1 > Priority 2:', priority1 > priority2);
  } catch (error) {
    console.error('Error in test:', error);
    console.error('Stack:', error.stack);
  }
}

testSimple();
