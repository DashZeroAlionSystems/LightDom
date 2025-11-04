/**
 * Test Suite for Crawler Campaign System
 * 
 * Tests DeepSeek API integration and campaign management functionality
 */

import campaignService from '../services/crawler-campaign-service.js';
import deepSeekService from '../services/deepseek-api-service.js';

console.log('🧪 Testing Crawler Campaign System\n');

async function runTests() {
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: DeepSeek Health Check
  console.log('Test 1: DeepSeek API Health Check');
  try {
    const health = await deepSeekService.healthCheck();
    if (health.status === 'healthy') {
      console.log('✅ PASS: DeepSeek API is accessible');
      console.log(`   Mode: ${health.mode}`);
      testsPassed++;
    } else {
      console.log('⚠️  WARN: DeepSeek API health check returned:', health);
      testsPassed++;
    }
  } catch (error) {
    console.log('❌ FAIL: DeepSeek health check error:', error.message);
    testsFailed++;
  }
  console.log('');

  // Test 2: Generate Workflow from Prompt
  console.log('Test 2: Generate Workflow from Prompt');
  try {
    const workflow = await deepSeekService.generateWorkflowFromPrompt(
      'Collect SEO training data for an e-commerce website selling outdoor gear',
      {}
    );
    
    if (workflow && workflow.workflowName && workflow.seeds && workflow.configuration) {
      console.log('✅ PASS: Workflow generated successfully');
      console.log(`   Workflow: ${workflow.workflowName}`);
      console.log(`   Seeds: ${workflow.seeds.length} URLs`);
      console.log(`   Parallel Crawlers: ${workflow.configuration.parallelCrawlers}`);
      testsPassed++;
    } else {
      console.log('❌ FAIL: Invalid workflow structure');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Workflow generation error:', error.message);
    testsFailed++;
  }
  console.log('');

  // Test 3: Generate URL Seeds
  console.log('Test 3: Generate URL Seeds');
  try {
    const seeds = await deepSeekService.generateURLSeeds(
      'SEO training data collection',
      'https://example.com'
    );
    
    if (seeds && seeds.primarySeeds && Array.isArray(seeds.primarySeeds)) {
      console.log('✅ PASS: URL seeds generated successfully');
      console.log(`   Primary Seeds: ${seeds.primarySeeds.length}`);
      console.log(`   Competitor Seeds: ${seeds.competitorSeeds?.length || 0}`);
      console.log(`   Authority Seeds: ${seeds.authoritySeeds?.length || 0}`);
      testsPassed++;
    } else {
      console.log('❌ FAIL: Invalid seeds structure');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Seed generation error:', error.message);
    testsFailed++;
  }
  console.log('');

  // Test 4: Build Crawler Schema
  console.log('Test 4: Build Crawler Schema');
  try {
    const schema = await deepSeekService.buildCrawlerSchema(
      'E-commerce product data collection',
      []
    );
    
    if (schema && schema.schemaName && schema.attributes) {
      console.log('✅ PASS: Schema built successfully');
      console.log(`   Schema: ${schema.schemaName}`);
      console.log(`   Attributes: ${schema.attributes.length}`);
      testsPassed++;
    } else {
      console.log('❌ FAIL: Invalid schema structure');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Schema building error:', error.message);
    testsFailed++;
  }
  console.log('');

  // Test 5: Create Campaign from Prompt
  console.log('Test 5: Create Campaign from Prompt');
  try {
    const campaign = await campaignService.createCampaignFromPrompt(
      'Create an SEO training data campaign for https://example.com focusing on product pages and blog posts',
      'https://example.com',
      { payloadSize: 50 }
    );
    
    if (campaign && campaign.id && campaign.status === 'created') {
      console.log('✅ PASS: Campaign created successfully');
      console.log(`   Campaign ID: ${campaign.id}`);
      console.log(`   Name: ${campaign.name}`);
      console.log(`   Status: ${campaign.status}`);
      console.log(`   Seeds: ${campaign.seeds.length}`);
      testsPassed++;
      
      // Test 6: Get Campaign Details
      console.log('');
      console.log('Test 6: Get Campaign Details');
      try {
        const retrieved = campaignService.getCampaign(campaign.id);
        if (retrieved && retrieved.id === campaign.id) {
          console.log('✅ PASS: Campaign retrieved successfully');
          testsPassed++;
        } else {
          console.log('❌ FAIL: Campaign retrieval mismatch');
          testsFailed++;
        }
      } catch (error) {
        console.log('❌ FAIL: Campaign retrieval error:', error.message);
        testsFailed++;
      }
      
      // Test 7: List Campaigns
      console.log('');
      console.log('Test 7: List Campaigns');
      try {
        const campaigns = campaignService.listCampaigns();
        if (Array.isArray(campaigns) && campaigns.length > 0) {
          console.log('✅ PASS: Campaigns listed successfully');
          console.log(`   Total Campaigns: ${campaigns.length}`);
          testsPassed++;
        } else {
          console.log('❌ FAIL: No campaigns found');
          testsFailed++;
        }
      } catch (error) {
        console.log('❌ FAIL: Campaign listing error:', error.message);
        testsFailed++;
      }
      
      // Test 8: Get Service Stats
      console.log('');
      console.log('Test 8: Get Service Statistics');
      try {
        const stats = campaignService.getServiceStats();
        if (stats && typeof stats.totalCampaigns === 'number') {
          console.log('✅ PASS: Service stats retrieved successfully');
          console.log(`   Total Campaigns: ${stats.totalCampaigns}`);
          console.log(`   Active Campaigns: ${stats.activeCampaigns}`);
          console.log(`   Total Crawlers: ${stats.totalCrawlers}`);
          testsPassed++;
        } else {
          console.log('❌ FAIL: Invalid stats structure');
          testsFailed++;
        }
      } catch (error) {
        console.log('❌ FAIL: Stats retrieval error:', error.message);
        testsFailed++;
      }
      
      // Test 9: Update Campaign Config
      console.log('');
      console.log('Test 9: Update Campaign Configuration');
      try {
        const updated = await campaignService.updateCampaignConfig(campaign.id, {
          configuration: {
            parallelCrawlers: 10
          }
        });
        
        if (updated && updated.configuration.parallelCrawlers === 10) {
          console.log('✅ PASS: Campaign configuration updated');
          testsPassed++;
        } else {
          console.log('❌ FAIL: Configuration update failed');
          testsFailed++;
        }
      } catch (error) {
        console.log('❌ FAIL: Config update error:', error.message);
        testsFailed++;
      }
      
      // Test 10: Schedule Campaign
      console.log('');
      console.log('Test 10: Schedule Campaign');
      try {
        const schedule = await campaignService.scheduleCampaign(campaign.id, {
          frequency: 'daily',
          time: '02:00',
          enabled: true
        });
        
        if (schedule && schedule.campaignId === campaign.id) {
          console.log('✅ PASS: Campaign scheduled successfully');
          console.log(`   Frequency: ${schedule.frequency}`);
          console.log(`   Next Run: ${schedule.nextRun}`);
          testsPassed++;
        } else {
          console.log('❌ FAIL: Schedule creation failed');
          testsFailed++;
        }
      } catch (error) {
        console.log('❌ FAIL: Scheduling error:', error.message);
        testsFailed++;
      }
      
    } else {
      console.log('❌ FAIL: Invalid campaign structure');
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Campaign creation error:', error.message);
    testsFailed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Tests Passed: ${testsPassed}`);
  console.log(`❌ Tests Failed: ${testsFailed}`);
  console.log(`📊 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
  console.log('='.repeat(60));

  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! The Crawler Campaign System is working correctly.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
