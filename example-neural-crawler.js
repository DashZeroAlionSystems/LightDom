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
    
    console.log('Background Mining & Advanced:');
    console.log('   POST   /api/neural-seo/background-mining/start    - Start background mining');
    console.log('   POST   /api/neural-seo/background-mining/stop     - Stop background mining');
    console.log('   GET    /api/neural-seo/backlink/recommendations/:url  - Get backlink tips\n');
    
    console.log('List Creation (for DeepSeek):');
    console.log('   POST   /api/neural-seo/list/create        - Create list view');
    console.log('   POST   /api/neural-seo/list/panel/create  - Create list panel\n');
    
    console.log('DeepSeek Query Interface:');
    console.log('   GET    /api/neural-seo/deepseek/query     - Query for AI decisions\n');

    // ==========================================
    // Step 9: Background Mining Demo
    // ==========================================
    console.log('📚 Step 9: Starting Background Mining...\n');
    
    console.log('🔄 Background mining will continuously:');
    console.log('   - Crawl and mine all 192 attributes');
    console.log('   - Train neural network on collected data');
    console.log('   - Train backlink optimization network');
    console.log('   - Update models every 5 minutes\n');
    
    // Don't actually start it in the example (to avoid long-running process)
    console.log('💡 To start background mining in production:');
    console.log('   await seoCampaignService.startBackgroundMining();\n');
    
    // ==========================================
    // Step 10: List Creation Demo
    // ==========================================
    console.log('📚 Step 10: Creating List Views...\n');
    
    // Create a simple list view
    const campaignList = seoCampaignService.createListView({
      name: 'SEO Campaigns',
      title: 'Active SEO Campaigns',
      description: 'Monitor all active campaigns',
      itemFields: [
        { name: 'name', label: 'Campaign Name', type: 'text', primary: true },
        { name: 'status', label: 'Status', type: 'badge' },
        { name: 'urlsCrawled', label: 'URLs Crawled', type: 'number' },
        { name: 'seoScore', label: 'Avg SEO Score', type: 'progress' }
      ],
      dataSourceEndpoint: '/api/neural-seo/campaigns',
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
    
    console.log('✅ Created campaign list view');
    console.log(`   ID: ${campaignList.id}`);
    console.log(`   Type: ${campaignList.type}`);
    console.log(`   Fields: ${campaignList.itemTemplate.fields.length}\n`);
    
    // Create a multi-list panel
    const dashboardPanel = seoCampaignService.createListPanel({
      name: 'SEO Dashboard',
      layout: 'grid',
      columns: 2,
      lists: [
        {
          name: 'Recent Crawls',
          title: 'Recently Crawled URLs',
          itemFields: [
            { name: 'url', label: 'URL', type: 'link' },
            { name: 'seoScore', label: 'Score', type: 'badge' },
            { name: 'crawledAt', label: 'When', type: 'date' }
          ],
          pageSize: 10
        },
        {
          name: 'Top Performers',
          title: 'Highest SEO Scores',
          itemFields: [
            { name: 'url', label: 'URL', type: 'link' },
            { name: 'seoScore', label: 'Score', type: 'progress' },
            { name: 'attributes', label: 'Attributes', type: 'number' }
          ],
          sortBy: 'seoScore',
          sortOrder: 'desc',
          pageSize: 10
        }
      ]
    });
    
    console.log('✅ Created multi-list panel');
    console.log(`   ID: ${dashboardPanel.id}`);
    console.log(`   Lists: ${dashboardPanel.lists.length}`);
    console.log(`   Layout: ${dashboardPanel.layout}\n`);
    
    // ==========================================
    // Step 11: DeepSeek Query Demo
    // ==========================================
    console.log('📚 Step 11: Querying for DeepSeek...\n');
    
    const deepseekQuery = await seoCampaignService.queryForDeepSeek();
    
    console.log('🤖 DeepSeek Query Results:');
    console.log(`   Service Status: ${deepseekQuery.status}`);
    console.log(`   Background Mining: ${deepseekQuery.backgroundMining ? 'Active' : 'Inactive'}`);
    console.log(`   Total Campaigns: ${deepseekQuery.campaigns.total}`);
    console.log(`   Active Campaigns: ${deepseekQuery.campaigns.active}`);
    console.log(`   Neural Networks: ${deepseekQuery.neuralNetworks.total}`);
    console.log(`   Total Crawled: ${deepseekQuery.crawling.totalCrawled}`);
    console.log(`   Total Attributes Mined: ${deepseekQuery.crawling.totalAttributesMined}`);
    
    if (deepseekQuery.neuralNetworks.backlinkOptimizer) {
      console.log('\n   Backlink Neural Network:');
      console.log(`      Instance: ${deepseekQuery.neuralNetworks.backlinkOptimizer.instanceId}`);
      console.log(`      Accuracy: ${(deepseekQuery.neuralNetworks.backlinkOptimizer.accuracy * 100).toFixed(1)}%`);
    }
    
    console.log('\n   Recommendations for DeepSeek:');
    deepseekQuery.recommendations.forEach(rec => {
      console.log(`      [${rec.priority.toUpperCase()}] ${rec.message}`);
    });
    
    console.log('');

    // ==========================================
    // Cleanup
    // ==========================================
    console.log('🧹 Cleaning up...\n');

    await seoCampaignService.shutdown();
    await db.end();

    console.log('✅ Example completed successfully!\n');
    console.log('📖 See NEURAL_CRAWLER_INTEGRATION_GUIDE.md for more information');
    console.log('🚀 To run in production: npm run start:neural-crawler\n');

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the example
main();
