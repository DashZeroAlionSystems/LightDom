#!/usr/bin/env node

/**
 * Crawlee Example - SEO Data Mining
 * Demonstrates how to create and use a Crawlee crawler for SEO data extraction
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

async function exampleCrawler() {
  console.log('🕷️ Crawlee SEO Data Mining Example\n');

  try {
    const crawleeService = new CrawleeService(db, {
      enableLogging: true
    });

    // Create a crawler for extracting SEO data
    console.log('Creating SEO crawler...');
    const crawler = await crawleeService.createCrawler({
      name: 'SEO Data Miner',
      description: 'Extracts SEO metadata from web pages',
      type: 'cheerio', // Fast HTML parser
      
      // Define what data to extract
      selectors: {
        title: 'title',
        metaDescription: {
          selector: 'meta[name="description"]',
          attribute: 'content'
        },
        metaKeywords: {
          selector: 'meta[name="keywords"]',
          attribute: 'content'
        },
        ogTitle: {
          selector: 'meta[property="og:title"]',
          attribute: 'content'
        },
        ogDescription: {
          selector: 'meta[property="og:description"]',
          attribute: 'content'
        },
        h1: 'h1',
        h2: {
          selector: 'h2',
          multiple: true
        },
        canonicalUrl: {
          selector: 'link[rel="canonical"]',
          attribute: 'href'
        }
      },

      // Configure crawling behavior
      config: {
        maxRequestsPerCrawl: 50,
        maxConcurrency: 5,
        maxRequestRetries: 3,
        requestHandlerTimeoutSecs: 30
      },

      // URL filtering
      url_patterns: {
        include: ['*'],
        exclude: ['**/admin/**', '**/login/**', '**/cart/**'],
        maxDepth: 2,
        sameDomain: true,
        respectRobotsTxt: true
      },

      // Tags for organization
      tags: ['seo', 'metadata', 'example']
    });

    console.log(`✅ Crawler created: ${crawler.id}\n`);

    // Add seed URLs
    console.log('Adding seed URLs...');
    await crawleeService.addSeeds(crawler.id, [
      {
        url: 'https://example.com',
        label: 'homepage',
        priority: 10
      },
      {
        url: 'https://example.com/about',
        label: 'about',
        priority: 5
      }
    ]);
    console.log('✅ Seeds added\n');

    // Listen for events
    crawleeService.on('crawler:page:success', (data) => {
      console.log(`✅ Extracted data from: ${data.url}`);
    });

    crawleeService.on('crawler:page:failed', (data) => {
      console.log(`❌ Failed to crawl: ${data.url} - ${data.error}`);
    });

    crawleeService.on('crawler:completed', (data) => {
      console.log(`\n🎉 Crawler completed: ${data.crawlerId}`);
    });

    // Start the crawler
    console.log('Starting crawler...\n');
    await crawleeService.startCrawler(crawler.id);

    // Get results
    console.log('\nFetching results...');
    const results = await crawleeService.getCrawlerResults(crawler.id, { limit: 10 });
    
    console.log(`\n📊 Extracted ${results.length} pages:\n`);
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.url}`);
      console.log(`   Title: ${result.data.title || 'N/A'}`);
      console.log(`   Meta Description: ${result.data.metaDescription || 'N/A'}`);
      console.log(`   H1: ${result.data.h1 || 'N/A'}`);
      console.log('');
    });

    // Get final stats
    const stats = await crawleeService.getCrawlerStats(crawler.id);
    console.log('📈 Final Statistics:');
    console.log(`   Total Requests: ${stats.requestsTotal || 0}`);
    console.log(`   Successful: ${stats.requestsFinished || 0}`);
    console.log(`   Failed: ${stats.requestsFailed || 0}`);
    console.log(`   Runtime: ${Math.round((stats.crawlerRuntimeMillis || 0) / 1000)}s\n`);

    console.log('✅ Example completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   - View results in the UI at /crawlee-manager');
    console.log('   - Add more seed URLs for broader coverage');
    console.log('   - Customize selectors for specific sites');
    console.log('   - Integrate with campaigns and seeders\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await db.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exampleCrawler();
}

export default exampleCrawler;
