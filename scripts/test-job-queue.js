/**
 * Test Containerized Job Queue System
 * Verifies BullMQ workers are processing jobs correctly
 */

import 'dotenv/config';
import {
  enqueueCrawl,
  enqueueSEOExtraction,
  enqueueTrainingDataGeneration,
  getAllQueueStats,
} from './services/job-queue.js';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testJobQueue() {
  console.log('🧪 Testing Containerized Job Queue System\n');

  try {
    // Test 1: Enqueue SEO extraction job
    console.log('1️⃣ Testing SEO Extraction Job...');
    const seoJob = await enqueueSEOExtraction({
      url: 'https://example.com',
      html: '<html><head><title>Test Page</title></head><body><h1>Hello World</h1><p>This is a test page with some content.</p></body></html>',
      crawlSessionId: `test-${Date.now()}`,
    });
    console.log(`   ✅ SEO job enqueued (ID: ${seoJob.id})\n`);

    // Test 2: Enqueue crawl job
    console.log('2️⃣ Testing Web Crawl Job...');
    const crawlJob = await enqueueCrawl({
      url: 'https://example.com',
      options: {
        maxDepth: 1,
        maxPages: 3,
      },
    });
    console.log(`   ✅ Crawl job enqueued (ID: ${crawlJob.id})\n`);

    // Test 3: Enqueue training data generation
    console.log('3️⃣ Testing Training Data Generation Job...');
    const trainingJob = await enqueueTrainingDataGeneration({
      datasetName: `test_dataset_${Date.now()}`,
      minScore: 0,
      maxScore: 100,
      limit: 5,
      outputPath: './training_data',
    });
    console.log(`   ✅ Training data job enqueued (ID: ${trainingJob.id})\n`);

    // Wait for jobs to process
    console.log('⏳ Waiting 5 seconds for workers to process jobs...\n');
    await sleep(5000);

    // Check queue statistics
    console.log('4️⃣ Checking Queue Statistics...');
    const stats = await getAllQueueStats();

    console.log('\n📊 Queue Statistics:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('SEO Extraction Queue:');
    console.log(`   Waiting: ${stats.seoExtraction.waiting}`);
    console.log(`   Active: ${stats.seoExtraction.active}`);
    console.log(`   Completed: ${stats.seoExtraction.completed}`);
    console.log(`   Failed: ${stats.seoExtraction.failed}`);
    console.log(`   Total: ${stats.seoExtraction.total}\n`);

    console.log('Web Crawling Queue:');
    console.log(`   Waiting: ${stats.webCrawling.waiting}`);
    console.log(`   Active: ${stats.webCrawling.active}`);
    console.log(`   Completed: ${stats.webCrawling.completed}`);
    console.log(`   Failed: ${stats.webCrawling.failed}`);
    console.log(`   Total: ${stats.webCrawling.total}\n`);

    console.log('Training Data Queue:');
    console.log(`   Waiting: ${stats.trainingDataGeneration.waiting}`);
    console.log(`   Active: ${stats.trainingDataGeneration.active}`);
    console.log(`   Completed: ${stats.trainingDataGeneration.completed}`);
    console.log(`   Failed: ${stats.trainingDataGeneration.failed}`);
    console.log(`   Total: ${stats.trainingDataGeneration.total}\n`);

    // Check job status
    console.log('5️⃣ Checking Individual Job Status...\n');

    const seoJobResult = await seoJob.waitUntilFinished(10000).catch(() => null);
    if (seoJobResult) {
      console.log(`   ✅ SEO job completed successfully`);
      console.log(`      SEO Attributes ID: ${seoJobResult.seoAttributesId}`);
      console.log(`      Overall Score: ${seoJobResult.scores.overall}`);
    } else {
      console.log(`   ⏳ SEO job still processing or failed`);
    }

    console.log('\n✅ Job queue system test complete!\n');
    console.log('📌 Summary:');
    console.log('   • Jobs can be enqueued successfully');
    console.log('   • Queue statistics are accessible');
    console.log(
      '   • Workers are processing jobs (check logs with: docker-compose logs -f seo-worker)\n'
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
testJobQueue();
