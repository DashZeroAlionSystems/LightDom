import { RealWebCrawlerSystem } from './crawler/RealWebCrawlerSystem.js';

async function debugPriority() {
  const crawler = new RealWebCrawlerSystem();

  try {
    console.log('Testing URL parsing...');
    const url = new URL('https://example.com');
    console.log('URL parsed successfully:', url.hostname);

    console.log('Testing priority calculation...');
    const priority = await crawler.calculateUrlPriority(
      'https://example.com',
      1,
      'https://referrer.com'
    );
    console.log('Priority result:', priority);
  } catch (error) {
    console.error('Error in debug:', error);
    console.error('Stack:', error.stack);
  }
}

debugPriority();
