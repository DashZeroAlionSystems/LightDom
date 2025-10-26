// Test the enhanced crawler directly
import crawler from './enhanced-web-crawler-service.js';

async function testCrawler() {
  try {
    console.log('🚀 Testing Enhanced Web Crawler...');
    
    // Initialize the crawler
    await crawler.initialize();
    console.log('✅ Crawler initialized');
    
    // Test crawling a single URL
    console.log('🕷️  Testing crawl of https://www.github.com...');
    const result = await crawler.crawlUrl('https://www.github.com');
    
    console.log('📋 Full result:', JSON.stringify(result, null, 2));
    
    if (result && result.status === 'success') {
      console.log('✅ Crawl successful!');
      console.log('📊 SEO Score:', result.seoScore.overall);
      console.log('📄 Title:', result.title);
      console.log('📝 Description:', result.description);
      console.log('🔗 Links found:', result.links.length);
      console.log('🖼️  Images found:', result.images.length);
    } else {
      console.log('❌ Crawl failed:', result?.error || 'Unknown error');
    }
    
    // Test database query
    console.log('🔍 Testing database query...');
    const stats = crawler.getStats();
    console.log('📊 Crawler stats:', stats);
    
    // Close the crawler
    await crawler.close();
    console.log('🎉 Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCrawler();
