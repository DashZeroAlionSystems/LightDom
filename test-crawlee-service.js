#!/usr/bin/env node

/**
 * Test Crawlee Service
 * Simple test to verify the Crawlee service is working
 */

import { Pool } from 'pg';
import CrawleeService from './services/crawlee-service.js';

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'dom_space_harvester',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function testCrawleeService() {
  console.log('🧪 Testing Crawlee Service...\n');

  try {
    // Test database connection
    console.log('1. Testing database connection...');
    await db.query('SELECT 1');
    console.log('✅ Database connected\n');

    // Initialize service
    console.log('2. Initializing Crawlee service...');
    const crawleeService = new CrawleeService(db, {
      enableLogging: true
    });
    console.log('✅ Service initialized\n');

    // Test creating a crawler
    console.log('3. Creating a test crawler...');
    const crawler = await crawleeService.createCrawler({
      name: 'Test SEO Crawler',
      description: 'A test crawler for SEO data mining',
      type: 'cheerio',
      selectors: {
        title: 'h1',
        description: 'meta[name="description"]',
        keywords: 'meta[name="keywords"]'
      },
      url_patterns: {
        include: ['*'],
        exclude: [],
        maxDepth: 2,
        sameDomain: true,
        respectRobotsTxt: true
      },
      config: {
        maxRequestsPerCrawl: 10,
        maxConcurrency: 2
      },
      tags: ['test', 'seo']
    });
    console.log('✅ Crawler created:', crawler.id);
    console.log('   Name:', crawler.name);
    console.log('   Type:', crawler.type);
    console.log('   Status:', crawler.status, '\n');

    // Test adding seeds
    console.log('4. Adding seed URLs...');
    await crawleeService.addSeeds(crawler.id, [
      'https://example.com',
      'https://example.com/about',
      'https://example.com/contact'
    ]);
    console.log('✅ Seeds added\n');

    // Test listing crawlers
    console.log('5. Listing all crawlers...');
    const crawlers = await crawleeService.listCrawlers();
    console.log(`✅ Found ${crawlers.length} crawler(s)\n`);

    // Test getting crawler details
    console.log('6. Getting crawler details...');
    const details = await crawleeService.getCrawler(crawler.id);
    console.log('✅ Crawler details retrieved');
    console.log('   ID:', details.id);
    console.log('   Name:', details.name);
    console.log('   Type:', details.type);
    console.log('   Status:', details.status, '\n');

    // Test updating crawler
    console.log('7. Updating crawler...');
    await crawleeService.updateCrawler(crawler.id, {
      description: 'Updated description for test crawler'
    });
    console.log('✅ Crawler updated\n');

    // Test getting stats
    console.log('8. Getting crawler stats...');
    const stats = await crawleeService.getCrawlerStats(crawler.id);
    console.log('✅ Stats retrieved:', JSON.stringify(stats, null, 2), '\n');

    // Test deleting crawler
    console.log('9. Deleting test crawler...');
    await crawleeService.deleteCrawler(crawler.id);
    console.log('✅ Crawler deleted\n');

    console.log('🎉 All tests passed!\n');
    console.log('✅ Crawlee service is working correctly');
    console.log('✅ Database tables are set up properly');
    console.log('✅ CRUD operations are functional');
    console.log('\n📝 Next steps:');
    console.log('   - Start the API server: npm run api');
    console.log('   - Start the frontend: npm run dev');
    console.log('   - Navigate to /crawlee-manager in the UI');
    console.log('   - Create and run crawlers!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

testCrawleeService();
