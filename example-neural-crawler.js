#!/usr/bin/env node

/**
 * Neural Crawler Example Usage
 * 
 * Demonstrates complete workflow:
 * 1. Initialize services
 * 2. Create SEO campaign
 * 3. Setup data streams
 * 4. Start crawling
 * 5. Train neural network
 * 6. Monitor results
 */

import IntegratedSEOCampaignService from './services/integrated-seo-campaign-service.js';
import AttributeDataStreamService from './services/attribute-data-stream-service.js';
import NeuralCrawlerOrchestrator from './services/neural-crawler-orchestrator.js';
import { Pool } from 'pg';

console.log('🎯 Neural Crawler Example - Complete Workflow\n');

// Database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/lightdom',
  max: 20
});

async function main() {
  try {
    // ==========================================
    // Step 1: Initialize Services
    // ==========================================
    console.log('📚 Step 1: Initializing Services...\n');

    const seoCampaignService = new IntegratedSEOCampaignService({
      db,
      campaignName: 'example-campaign',
      enableNeuralNetwork: true,
      enableDataStreams: true,
      enableMonitoring: true,
      continuousCrawling: false // Manual control for example
    });

    await seoCampaignService.initialize();
    console.log('✅ Services initialized\n');

    // ==========================================
    // Step 2: Create SEO Campaign
    // ==========================================
    console.log('📚 Step 2: Creating SEO Campaign...\n');

    const campaign = await seoCampaignService.createCampaign({
      name: 'example-website-audit',
      type: 'single-run',
      startUrls: [
        'https://example.com',
        'https://example.com/about',
        'https://example.com/contact'
      ],
      config: {
        maxDepth: 2,
        maxPages: 100
      }
    });

    console.log(`✅ Campaign created: ${campaign.id}`);
    console.log(`   Neural Instance: ${campaign.neuralInstance?.id}`);
    console.log(`   Data Streams: ${campaign.dataStreams.length}`);
    console.log('');

    // ==========================================
    // Step 3: Create Custom Data Streams
    // ==========================================
    console.log('📚 Step 3: Creating Custom Data Streams...\n');

    const dataStreamService = seoCampaignService.dataStreamService;

    // Create a stream for meta tags
    const metaStream = await dataStreamService.createBundledStream(
      'meta-tags-stream',
      ['title', 'metaDescription', 'metaKeywords', 'canonical']
    );
    console.log(`✅ Created meta tags stream: ${metaStream.id}`);

    // Create a stream for performance metrics
    const perfStream = await dataStreamService.createBundledStream(
      'performance-stream',
      ['pageLoadTime', 'firstContentfulPaint', 'cumulativeLayoutShift']
    );
    console.log(`✅ Created performance stream: ${perfStream.id}`);

    // Subscribe to stream updates
    dataStreamService.subscribe(metaStream.id, (message) => {
      console.log(`📊 Meta data received: ${JSON.stringify(message.data, null, 2)}`);
    });

    console.log('');

    // ==========================================
    // Step 4: Manually Queue and Crawl URLs
    // ==========================================
    console.log('📚 Step 4: Starting Crawl (Demo)...\n');

    // Queue additional URLs with priority
    await seoCampaignService.queueUrl(
      campaign.id,
      'https://example.com/products',
      1,
      5 // Higher priority
    );

    await seoCampaignService.queueUrl(
      campaign.id,
      'https://example.com/services',
      1,
      5
    );

    console.log('✅ URLs queued for crawling');
    console.log('   (In production, continuous crawler would process these)\n');

    // ==========================================
    // Step 5: Simulate Data Streaming
    // ==========================================
    console.log('📚 Step 5: Simulating Data Stream...\n');

    // Push sample data to streams
    await dataStreamService.pushToStream(metaStream.id, {
      title: 'Example Product Page - Best Widgets',
      metaDescription: 'Discover our amazing widgets with free shipping and 30-day returns.',
      metaKeywords: 'widgets, products, online shopping',
      canonical: 'https://example.com/products'
    });

    await dataStreamService.pushToStream(perfStream.id, {
      pageLoadTime: 1.2,
      firstContentfulPaint: 0.8,
      cumulativeLayoutShift: 0.05
    });

    console.log('✅ Sample data pushed to streams\n');

    // ==========================================
    // Step 6: Neural Network Training (Demo)
    // ==========================================
    console.log('📚 Step 6: Neural Network Training (Demo)...\n');

    if (campaign.neuralInstance) {
      console.log('🧠 Preparing training data...');
      
      // Prepare sample training data (192 input features -> 50 output predictions)
      const trainingData = {
        inputs: [
          // Sample 1: Good SEO
          Array(192).fill(0).map((_, i) => Math.random() * 0.8 + 0.2),
          // Sample 2: Poor SEO
          Array(192).fill(0).map((_, i) => Math.random() * 0.3),
          // Sample 3: Medium SEO
          Array(192).fill(0).map((_, i) => Math.random() * 0.6)
        ],
        outputs: [
          // Sample 1: Few optimizations needed
          Array(50).fill(0).map((_, i) => i < 5 ? 1 : 0),
          // Sample 2: Many optimizations needed
          Array(50).fill(0).map((_, i) => i < 30 ? 1 : 0),
          // Sample 3: Some optimizations needed
          Array(50).fill(0).map((_, i) => i < 15 ? 1 : 0)
        ]
      };

      console.log(`   Training samples: ${trainingData.inputs.length}`);
      console.log(`   Input dimensions: ${trainingData.inputs[0].length}`);
      console.log(`   Output dimensions: ${trainingData.outputs[0].length}`);
      console.log('\n   Training in progress...');
      
      try {
        const metrics = await seoCampaignService.neuralOrchestrator.trainNeuralNetwork(
          campaign.neuralInstance.id,
          trainingData
        );

        console.log('\n✅ Training complete!');
        console.log(`   Accuracy: ${(metrics.accuracy * 100).toFixed(2)}%`);
        console.log(`   Loss: ${metrics.loss?.toFixed(4) || 'N/A'}`);
        console.log(`   Training samples: ${metrics.trainingSamples}`);
      } catch (error) {
        console.log(`⚠️  Training skipped: ${error.message}`);
        console.log('   (This is normal if TensorFlow.js is not installed)');
      }
    }

    console.log('');

    // ==========================================
    // Step 7: Monitor Campaign
    // ==========================================
    console.log('📚 Step 7: Monitoring Campaign...\n');

    const status = seoCampaignService.getStatus();
    const monitoring = seoCampaignService.getMonitoring();

    console.log('📊 Campaign Status:');
    console.log(`   Name: ${campaign.name}`);
    console.log(`   Type: ${campaign.type}`);
    console.log(`   Status: ${campaign.status}`);
    console.log(`   URLs Crawled: ${campaign.stats.urlsCrawled}`);
    console.log(`   URLs Queued: ${campaign.stats.urlsQueued}`);
    console.log(`   Attributes Mined: ${campaign.stats.attributesMined}`);
    console.log(`   Data Streamed: ${campaign.stats.dataStreamed}`);

    console.log('\n📈 System Monitoring:');
    console.log(`   Active Campaigns: ${monitoring.campaignsActive}`);
    console.log(`   Crawls in Progress: ${monitoring.crawlsInProgress}`);
    console.log(`   Total Attributes Mined: ${monitoring.totalAttributesMined}`);
    console.log(`   Neural Network Accuracy: ${(monitoring.neuralNetworkAccuracy * 100).toFixed(1)}%`);
    console.log(`   Data Stream Throughput: ${monitoring.dataStreamsThroughput} msg/s`);
    console.log(`   System Health: ${monitoring.systemHealth}`);

    console.log('\n🎯 Data Streams:');
    const streams = dataStreamService.getAllStreams();
    streams.forEach(stream => {
      console.log(`   ${stream.name}:`);
      console.log(`      ID: ${stream.id}`);
      console.log(`      Type: ${stream.type}`);
      console.log(`      Attributes: ${stream.attributes.join(', ')}`);
      console.log(`      Messages: ${stream.metrics.messagesCount}`);
      console.log(`      Subscribers: ${stream.subscribers?.size || 0}`);
    });

    console.log('');

    // ==========================================
    // Step 8: Demonstrate API Usage
    // ==========================================
    console.log('📚 Step 8: API Usage Examples...\n');

    console.log('📡 REST API Endpoints Available:\n');
    console.log('Campaign Management:');
    console.log('   POST   /api/neural-seo/campaigns          - Create campaign');
    console.log('   GET    /api/neural-seo/campaigns          - List campaigns');
    console.log('   GET    /api/neural-seo/campaigns/:id      - Get campaign');
    console.log('   POST   /api/neural-seo/campaigns/:id/queue-url');
    console.log('   GET    /api/neural-seo/campaigns/:id/results');
    console.log('   GET    /api/neural-seo/campaigns/:id/metrics\n');

    console.log('Data Streams:');
    console.log('   POST   /api/neural-seo/streams            - Create stream');
    console.log('   GET    /api/neural-seo/streams            - List streams');
    console.log('   GET    /api/neural-seo/streams/:id        - Get stream');
    console.log('   POST   /api/neural-seo/streams/:id/push   - Push data\n');

    console.log('Neural Networks:');
    console.log('   GET    /api/neural-seo/neural/status      - Neural status');
    console.log('   POST   /api/neural-seo/neural/train       - Train model\n');

    console.log('Monitoring:');
    console.log('   GET    /api/neural-seo/health             - Health check');
    console.log('   GET    /api/neural-seo/status             - System status');
    console.log('   GET    /api/neural-seo/monitoring         - Metrics\n');

    console.log('Attributes:');
    console.log('   GET    /api/neural-seo/attributes         - List attributes');
    console.log('   GET    /api/neural-seo/attributes/:name   - Get attribute\n');

    // ==========================================
    // Cleanup
    // ==========================================
    console.log('🧹 Cleaning up...\n');

    await seoCampaignService.shutdown();
    await db.end();

    console.log('✅ Example completed successfully!\n');
    console.log('📖 See NEURAL_CRAWLER_INTEGRATION_GUIDE.md for more information\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the example
main();
