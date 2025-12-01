#!/usr/bin/env node

/**
 * Complete Crawlee Integration Demo
 * Demonstrates the full workflow: Campaign → Crawlee → Seeder → Results
 */

import { Pool } from 'pg';
import CrawleeService from './services/crawlee-service.js';
import CrawleeCampaignIntegration from './services/crawlee-campaign-integration.js';
import CrawleeSeederIntegration from './services/crawlee-seeder-integration.js';

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'dom_space_harvester',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function demoIntegration() {
  console.log('🎯 Complete Crawlee Integration Demo\n');
  console.log('This demo shows how Crawlee integrates with:');
  console.log('  • Campaign system');
  console.log('  • Seeder service');
  console.log('  • Database persistence');
  console.log('  • Real-time data extraction\n');

  try {
    // Initialize services
    console.log('1. Initializing services...');
    const crawleeService = new CrawleeService(db);
    const campaignIntegration = new CrawleeCampaignIntegration(db, null);
    const seederIntegration = new CrawleeSeederIntegration(db);
    console.log('✅ Services initialized\n');

    // Ensure schemas
    console.log('2. Ensuring database schemas...');
    await campaignIntegration.ensureCampaignSchema();
    await seederIntegration.ensureSeederSchema();
    console.log('✅ Schemas ready\n');

    // ===== SCENARIO 1: Campaign-based Crawling =====
    console.log('📋 SCENARIO 1: Campaign-based Crawling\n');
    
    console.log('3. Creating campaign with Crawlee crawler...');
    const campaign = {
      id: `campaign_demo_${Date.now()}`,
      name: 'SEO Campaign Demo',
      description: 'Demo campaign for testing Crawlee integration',
      useCrawlee: true,
      crawlerType: 'cheerio',
      schema: {
        fields: {
          title: 'h1',
          description: 'meta[name="description"]',
          h1: 'h1',
          h2: 'h2'
        }
      },
      seeds: {
        urls: [
          'https://example.com',
          'https://example.com/about'
        ],
        include: ['*'],
        exclude: []
      },
      configuration: {
        maxDepth: 2,
        parallelCrawlers: 3,
        maxRequestsPerCrawl: 10
      }
    };

    // Create crawler for campaign
    const campaignCrawler = await campaignIntegration.createCrawlerForCampaign(campaign);
    console.log(`✅ Campaign crawler created: ${campaignCrawler.id}`);
    console.log(`   Campaign ID: ${campaign.id}`);
    console.log(`   Crawler Type: ${campaignCrawler.type}`);
    console.log(`   Seeds Added: ${campaign.seeds.urls.length}\n`);

    // ===== SCENARIO 2: Seeder-based Continuous Crawling =====
    console.log('📡 SCENARIO 2: Seeder-based Continuous Crawling\n');

    console.log('4. Creating seeder service...');
    const seederServiceId = `seeder_demo_${Date.now()}`;
    await db.query(`
      INSERT INTO seeding_services (id, name, description, status)
      VALUES ($1, $2, $3, $4)
    `, [
      seederServiceId,
      'Demo Seeder Service',
      'Continuous URL seeding for demo',
      'active'
    ]);
    console.log(`✅ Seeder service created: ${seederServiceId}\n`);

    console.log('5. Adding URLs to seeder queue...');
    await seederIntegration.addUrlsToSeeder(seederServiceId, [
      { url: 'https://example.com/products', priority: 10 },
      { url: 'https://example.com/services', priority: 8 },
      { url: 'https://example.com/blog', priority: 5 },
      { url: 'https://example.com/contact', priority: 3 }
    ]);
    console.log('✅ URLs added to seeder queue\n');

    console.log('6. Creating seeded crawler...');
    const seededCrawler = await seederIntegration.createSeededCrawler({
      name: 'Continuous SEO Crawler',
      description: 'Crawler that pulls from seeder service',
      seeder_service_id: seederServiceId,
      crawlerType: 'cheerio',
      selectors: {
        title: 'title',
        h1: 'h1',
        meta_description: {
          selector: 'meta[name="description"]',
          attribute: 'content'
        }
      },
      batchSize: 5,
      pollInterval: 10000 // 10 seconds
    });
    console.log(`✅ Seeded crawler created: ${seededCrawler.id}`);
    console.log(`   Linked to seeder: ${seederServiceId}`);
    console.log(`   Batch size: 5`);
    console.log(`   Poll interval: 10s\n`);

    // ===== SCENARIO 3: Monitoring and Stats =====
    console.log('📊 SCENARIO 3: Monitoring and Stats\n');

    console.log('7. Listing all crawlers...');
    const allCrawlers = await crawleeService.listCrawlers();
    console.log(`✅ Total crawlers: ${allCrawlers.length}`);
    allCrawlers.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} (${c.type}) - ${c.status}`);
      if (c.campaign_id) console.log(`      → Campaign: ${c.campaign_id}`);
      if (c.seeder_service_id) console.log(`      → Seeder: ${c.seeder_service_id}`);
    });
    console.log('');

    console.log('8. Checking seeder stats...');
    const seederStats = await seederIntegration.getSeederStats(seederServiceId);
    console.log('✅ Seeder queue status:');
    console.log(`   Pending: ${seederStats.pending}`);
    console.log(`   Processing: ${seederStats.processing}`);
    console.log(`   Completed: ${seederStats.completed}`);
    console.log(`   Failed: ${seederStats.failed}`);
    console.log(`   Total: ${seederStats.total}\n`);

    // ===== SCENARIO 4: Data Flow =====
    console.log('🔄 SCENARIO 4: Data Flow Demonstration\n');

    console.log('9. Simulating crawler execution...');
    console.log('   In a real scenario:');
    console.log('   a) Crawler starts → picks up seeds');
    console.log('   b) Visits URLs → extracts data with selectors');
    console.log('   c) Saves to crawlee_results table');
    console.log('   d) Updates campaign analytics');
    console.log('   e) Marks seeds as completed in seeder\n');

    console.log('10. Database tables populated:');
    console.log('   ✓ crawlee_crawlers - Crawler configurations');
    console.log('   ✓ crawlee_crawler_seeds - URLs to crawl');
    console.log('   ✓ crawlee_results - Extracted data (empty until crawling)');
    console.log('   ✓ url_seeds - Seeder queue');
    console.log('   ✓ seeding_services - Seeder configs');
    console.log('   ✓ seo_campaigns - Campaign data\n');

    // ===== Summary =====
    console.log('📝 INTEGRATION SUMMARY\n');
    console.log('✅ Campaign Integration:');
    console.log('   • Campaigns can use Crawlee for crawling');
    console.log('   • Crawler config derived from campaign');
    console.log('   • Results automatically update campaign analytics');
    console.log('   • Campaign status synced with crawler\n');

    console.log('✅ Seeder Integration:');
    console.log('   • Continuous URL feeding to crawlers');
    console.log('   • Priority-based queue processing');
    console.log('   • Automatic status tracking');
    console.log('   • Batch processing for efficiency\n');

    console.log('✅ Data Persistence:');
    console.log('   • All data saved to PostgreSQL');
    console.log('   • Historical stats snapshots');
    console.log('   • Detailed logging');
    console.log('   • Campaign analytics updated\n');

    console.log('🎯 NEXT STEPS\n');
    console.log('1. Start API server: npm run api');
    console.log('2. Start frontend: npm run dev');
    console.log('3. Navigate to /crawlee-manager');
    console.log('4. View and manage crawlers');
    console.log('5. Start crawlers to see real data extraction\n');

    console.log('📚 API ENDPOINTS\n');
    console.log('• GET  /api/crawlee/crawlers - List all crawlers');
    console.log('• POST /api/crawlee/crawlers - Create crawler');
    console.log('• POST /api/crawlee/crawlers/:id/start - Start crawler');
    console.log('• GET  /api/crawlee/crawlers/:id/results - Get results');
    console.log('• GET  /api/crawlee/crawlers/:id/stats - Get statistics\n');

    console.log('🎉 Demo completed successfully!\n');
    console.log('The system is now ready for 24/7 SEO data mining.');
    console.log('All components are integrated and working together.\n');

    // Cleanup demo data (optional)
    console.log('11. Cleaning up demo data...');
    await crawleeService.deleteCrawler(campaignCrawler.id);
    await crawleeService.deleteCrawler(seededCrawler.id);
    await db.query('DELETE FROM seeding_services WHERE id = $1', [seederServiceId]);
    await db.query('DELETE FROM url_seeds WHERE seeder_service_id = $1', [seederServiceId]);
    console.log('✅ Demo data cleaned up\n');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.error(error);
  } finally {
    await db.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demoIntegration();
}

export default demoIntegration;
