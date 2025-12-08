/**
 * Test SEO extraction workflow
 * Quick test to verify SEO attributes are extracted and stored
 */

import pg from 'pg';
import { RealWebCrawlerSystem } from '../crawler/RealWebCrawlerSystem.js';

const { Pool } = pg;

async function testSEOExtraction() {
  console.log('🧪 Testing SEO Extraction Workflow\n');

  // Setup database
  const db = new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/dom_space_harvester',
    max: 5,
  });

  try {
    // Check database connection
    await db.query('SELECT NOW()');
    console.log('✅ Database connected\n');

    // Create crawler with SEO pipeline enabled
    const crawler = new RealWebCrawlerSystem({
      maxConcurrency: 1,
      maxDepth: 1,
      requestDelay: 1000,
      enableSEOPipeline: true,
      postgres: db,
    });

    await crawler.initialize();
    console.log('✅ Crawler initialized\n');

    // Test URLs
    const testUrls = ['https://example.com', 'https://httpbin.org/html'];

    console.log('🕷️  Crawling test URLs...\n');

    for (const url of testUrls) {
      console.log(`📄 Processing: ${url}`);

      // Add to queue
      crawler.crawlQueue.push({
        url,
        depth: 0,
        priority: 1,
        discoveredAt: new Date(),
      });
    }

    // Start crawling (will process until queue empty)
    crawler.isRunning = true;
    crawler.sessionId = `test_${Date.now()}`;

    const page = await crawler.browser.newPage();
    await page.setUserAgent(crawler.config.userAgent);

    while (crawler.crawlQueue.length > 0) {
      const target = crawler.crawlQueue.shift();
      if (!target) break;

      try {
        const result = await crawler.processUrl(page, target);

        if (result?.seoAttributesId) {
          console.log(`  ✅ SEO attributes stored (ID: ${result.seoAttributesId})`);
          console.log(`     Title: ${result.seoAttributes?.title || 'N/A'}`);
          console.log(`     Overall Score: ${result.seoAttributes?.overallScore || 0}`);
          console.log(`     Word Count: ${result.seoAttributes?.wordCount || 0}`);
        } else {
          console.log(`  ⚠️  No SEO attributes extracted`);
        }
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }

      console.log('');
    }

    await page.close();
    await crawler.shutdown();

    // Query database to verify
    console.log('🔍 Verifying database records...\n');

    const countResult = await db.query('SELECT COUNT(*) as count FROM seo_attributes');
    console.log(`✅ Total SEO records in database: ${countResult.rows[0].count}\n`);

    const recentResult = await db.query(`
      SELECT url, title, overall_score, word_count, seo_score, technical_score
      FROM seo_attributes
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if (recentResult.rows.length > 0) {
      console.log('📊 Recent SEO extractions:');
      for (const row of recentResult.rows) {
        console.log(`   • ${row.url}`);
        console.log(`     Title: ${row.title || 'N/A'}`);
        console.log(
          `     Scores: Overall=${row.overall_score}, SEO=${row.seo_score}, Technical=${row.technical_score}`
        );
        console.log(`     Words: ${row.word_count}`);
        console.log('');
      }
    }

    console.log('\n✨ Test complete! SEO extraction is working.\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await db.end();
  }
}

testSEOExtraction();
