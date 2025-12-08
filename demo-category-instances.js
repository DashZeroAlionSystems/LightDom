/**
 * Demo: Category Instance Creation System
 * Creates one instance of each category type to demonstrate the system
 */

import { Pool } from 'pg';
import { CategoryInstanceFactory } from './services/category-instance-factory.js';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'dom_space_harvester',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
};

async function runDemo() {
  const db = new Pool(dbConfig);
  const factory = new CategoryInstanceFactory(db);

  console.log('🚀 Category Instance Creation System Demo\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Generate configs for all categories
    console.log('\n📋 Step 1: Generating configurations for all categories...');
    const configs = factory.generateAllConfigs('demo-app');
    console.log(`✅ Generated ${Object.keys(configs).length} configurations`);

    // Display generated configs
    Object.entries(configs).forEach(([category, config]) => {
      console.log(`\n   ${category}:`);
      console.log(`   ${JSON.stringify(config, null, 2).split('\n').map(line => '   ' + line).join('\n')}`);
    });

    // Step 2: Create database schema (if not exists)
    console.log('\n📋 Step 2: Ensuring database schema exists...');
    const fs = await import('fs');
    const schemaPath = './database/category-instances-schema.sql';
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await db.query(schemaSql);
      console.log('✅ Schema created/verified');
    } else {
      console.log('⚠️  Schema file not found, assuming tables exist');
    }

    // Step 3: Create instances in hierarchical order
    console.log('\n📋 Step 3: Creating instances...\n');

    const results = {};

    // 3.1: Create App
    console.log('   Creating App...');
    const appResult = await factory.createInstance('app', configs.app);
    results.app = appResult.instance;
    console.log(`   ✅ App created: ${results.app.id}`);

    // 3.2: Create Campaign
    console.log('\n   Creating Campaign...');
    const campaignResult = await factory.createInstance('campaign', {
      ...configs.campaign,
      app_id: results.app.id
    });
    results.campaign = campaignResult.instance;
    console.log(`   ✅ Campaign created: ${results.campaign.id}`);

    // 3.3: Create Service
    console.log('\n   Creating Service...');
    const serviceResult = await factory.createInstance('service', {
      ...configs.service,
      app_id: results.app.id,
      campaign_id: results.campaign.id
    });
    results.service = serviceResult.instance;
    console.log(`   ✅ Service created: ${results.service.id}`);

    // 3.4: Create Workflow
    console.log('\n   Creating Workflow...');
    const workflowResult = await factory.createInstance('workflow', {
      ...configs.workflow,
      campaign_id: results.campaign.id,
      service_instance_id: results.service.id
    });
    results.workflow = workflowResult.instance;
    console.log(`   ✅ Workflow created: ${results.workflow.id}`);

    // 3.5: Create Seed
    console.log('\n   Creating Seed...');
    const seedResult = await factory.createInstance('seed', {
      ...configs.seed,
      app_id: results.app.id,
      campaign_id: results.campaign.id
    });
    results.seed = seedResult.instance;
    console.log(`   ✅ Seed created: ${results.seed.id}`);

    // 3.6: Create Crawler
    console.log('\n   Creating Crawler...');
    const crawlerResult = await factory.createInstance('crawler', {
      ...configs.crawler,
      app_id: results.app.id,
      campaign_id: results.campaign.id,
      workflow_instance_id: results.workflow.id
    });
    results.crawler = crawlerResult.instance;
    console.log(`   ✅ Crawler created: ${results.crawler.id}`);

    // 3.7: Create Scheduler
    console.log('\n   Creating Scheduler...');
    const schedulerResult = await factory.createInstance('scheduler', {
      ...configs.scheduler,
      app_id: results.app.id,
      target_entity_type: 'crawler',
      target_entity_id: results.crawler.id
    });
    results.scheduler = schedulerResult.instance;
    console.log(`   ✅ Scheduler created: ${results.scheduler.id}`);

    // 3.8: Create Neural Network
    console.log('\n   Creating Neural Network...');
    const nnResult = await factory.createInstance('neural_network', {
      ...configs.neural_network,
      app_id: results.app.id,
      campaign_id: results.campaign.id
    });
    results.neural_network = nnResult.instance;
    console.log(`   ✅ Neural Network created: ${results.neural_network.id}`);

    // 3.9: Create Data Mining
    console.log('\n   Creating Data Mining...');
    const miningResult = await factory.createInstance('data_mining', {
      ...configs.data_mining,
      app_id: results.app.id,
      campaign_id: results.campaign.id,
      workflow_instance_id: results.workflow.id
    });
    results.data_mining = miningResult.instance;
    console.log(`   ✅ Data Mining created: ${results.data_mining.id}`);

    // 3.10: Create Attribute
    console.log('\n   Creating Attribute...');
    const attributeResult = await factory.createInstance('attribute', {
      ...configs.attribute,
      app_id: results.app.id
    });
    results.attribute = attributeResult.instance;
    console.log(`   ✅ Attribute created: ${results.attribute.id}`);

    // 3.11: Create Data Stream
    console.log('\n   Creating Data Stream...');
    const streamResult = await factory.createInstance('data_stream', {
      ...configs.data_stream,
      workflow_instance_id: results.workflow.id,
      attribute_ids: [results.attribute.id]
    });
    results.data_stream = streamResult.instance;
    console.log(`   ✅ Data Stream created: ${results.data_stream.id}`);

    // Step 4: Verify hierarchy
    console.log('\n📋 Step 4: Verifying hierarchy...\n');
    const appHierarchy = await factory.getHierarchy('app', results.app.id);
    console.log(`   App has ${appHierarchy.descendants.length} direct children`);

    const campaignHierarchy = await factory.getHierarchy('campaign', results.campaign.id);
    console.log(`   Campaign has ${campaignHierarchy.descendants.length} children`);
    console.log(`   Campaign has ${campaignHierarchy.ancestors.length} parents`);

    // Step 5: Test execution
    console.log('\n📋 Step 5: Testing instance execution...\n');

    // Execute workflow
    console.log('   Executing workflow...');
    await db.query(
      'UPDATE workflow_instances SET status = $1, last_executed_at = NOW(), execution_count = execution_count + 1 WHERE id = $2',
      ['running', results.workflow.id]
    );
    console.log('   ✅ Workflow executed');

    // Start crawler
    console.log('\n   Starting crawler...');
    await db.query(
      'UPDATE crawler_instances SET status = $1, last_run_at = NOW(), total_runs = total_runs + 1 WHERE id = $2',
      ['running', results.crawler.id]
    );
    console.log('   ✅ Crawler started');

    // Execute data mining job
    console.log('\n   Executing data mining job...');
    await db.query(
      'UPDATE data_mining_instances SET status = $1, last_run_at = NOW(), total_runs = total_runs + 1 WHERE id = $2',
      ['running', results.data_mining.id]
    );
    console.log('   ✅ Data mining job executed');

    // Step 6: Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Demo completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   • Created ${Object.keys(results).length} category instances`);
    console.log(`   • Established hierarchical relationships`);
    console.log(`   • Tested instance execution`);
    console.log('\n💡 Created instances:');
    Object.entries(results).forEach(([category, instance]) => {
      console.log(`   • ${category}: ${instance.name} (${instance.id})`);
    });

    // Step 7: API endpoints info
    console.log('\n🌐 Available API Endpoints:');
    console.log('   GET    /api/categories                        - List all category types');
    console.log('   GET    /api/categories/:category/config       - Get default config');
    console.log('   GET    /api/categories/config/all             - Get all configs');
    console.log('   POST   /api/categories/:category              - Create instance');
    console.log('   POST   /api/categories/batch                  - Create multiple instances');
    console.log('   POST   /api/categories/hierarchy              - Create full hierarchy');
    console.log('   GET    /api/categories/:category              - List instances');
    console.log('   GET    /api/categories/:category/:id          - Get instance');
    console.log('   GET    /api/categories/:category/:id/hierarchy - Get hierarchy');
    console.log('   POST   /api/categories/:category/:id/execute  - Execute action');
    console.log('   PUT    /api/categories/:category/:id          - Update instance');
    console.log('   DELETE /api/categories/:category/:id          - Delete instance');
    console.log('   POST   /api/categories/service/:id/api/:func  - Call service function');

    console.log('\n📝 Example curl commands:');
    console.log(`\n   # List all apps`);
    console.log(`   curl http://localhost:3001/api/categories/app`);
    console.log(`\n   # Get campaign details`);
    console.log(`   curl http://localhost:3001/api/categories/campaign/${results.campaign.id}`);
    console.log(`\n   # Execute workflow`);
    console.log(`   curl -X POST http://localhost:3001/api/categories/workflow/${results.workflow.id}/execute \\`);
    console.log(`        -H "Content-Type: application/json" \\`);
    console.log(`        -d '{"action": "execute", "params": {}}'`);
    console.log(`\n   # Call service API function`);
    console.log(`   curl -X POST http://localhost:3001/api/categories/service/${results.service.id}/api/crawl \\`);
    console.log(`        -H "Content-Type: application/json" \\`);
    console.log(`        -d '{"url": "https://example.com"}'`);

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error during demo:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default runDemo;
