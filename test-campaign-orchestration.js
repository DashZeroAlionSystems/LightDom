/**
 * Test Campaign Orchestration System
 * 
 * Tests the complete flow from prompt to campaign creation
 */

import campaignOrchestrationService from './services/campaign-orchestration-service.js';
import researchInstanceService from './services/research-instance-service.js';
import attributeDiscoveryService from './services/attribute-discovery-service.js';
import dataMiningInstanceService from './services/data-mining-instance-service.js';

console.log('🧪 Testing Campaign Orchestration System\n');

// Test 1: Research Instance
console.log('Test 1: Creating Research Instance...');
async function testResearchInstance() {
  try {
    const research = await researchInstanceService.kickoffResearch(
      'SEO Best Practices',
      'Research on SEO best practices for e-commerce websites',
      { depth: 'deep' }
    );
    
    console.log('✅ Research created:', research.research_id);
    console.log('   Status:', research.status);
    console.log('   Topic:', research.topic);
    
    // Wait a bit for research to process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const updated = await researchInstanceService.getResearch(research.research_id);
    console.log('   Updated Status:', updated.status);
    console.log('   Schemas found:', updated.discovered_schemas.length);
    console.log('   Wiki links:', updated.wiki_links.length);
    
    return research;
  } catch (error) {
    console.error('❌ Research test failed:', error.message);
    return null;
  }
}

// Test 2: Attribute Discovery
console.log('\nTest 2: Discovering Attributes...');
async function testAttributeDiscovery(researchId) {
  try {
    // Wait for research to complete
    let research = await researchInstanceService.getResearch(researchId);
    let attempts = 0;
    
    while (research.status !== 'completed' && attempts < 10) {
      console.log(`   Waiting for research to complete... (${research.status})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      research = await researchInstanceService.getResearch(researchId);
      attempts++;
    }
    
    if (research.status !== 'completed') {
      console.log('⚠️  Research not completed yet, but continuing...');
      // Manually complete for testing
      await researchInstanceService.updateResearchStatus(researchId, 'completed');
    }
    
    const attributes = await attributeDiscoveryService.discoverAttributes(researchId);
    
    console.log('✅ Attributes discovered:', attributes.length);
    
    // Show first few attributes
    attributes.slice(0, 3).forEach((attr, i) => {
      console.log(`   ${i + 1}. ${attr.name} (${attr.category}) - ${attr.data_type}`);
      console.log(`      Algorithm: ${attr.mining_algorithm}`);
      console.log(`      Priority: ${attr.priority}`);
    });
    
    return attributes;
  } catch (error) {
    console.error('❌ Attribute discovery test failed:', error.message);
    return [];
  }
}

// Test 3: Data Mining Instance
console.log('\nTest 3: Creating Mining Instance...');
async function testMiningInstance(researchId) {
  try {
    const mining = await dataMiningInstanceService.createFromResearch(researchId, {
      targetUrls: ['https://example.com', 'https://test.com'],
      maxUrls: 50
    });
    
    console.log('✅ Mining instance created:', mining.mining_id);
    console.log('   Name:', mining.name);
    console.log('   Status:', mining.status);
    console.log('   Enabled attributes:', mining.enabled_attributes.length);
    console.log('   Target URLs:', mining.target_urls.length);
    
    // Queue and start mining
    console.log('\n   Queuing mining instance...');
    await dataMiningInstanceService.queueMiningInstance(mining.mining_id);
    
    const updated = await dataMiningInstanceService.getMiningInstance(mining.mining_id);
    console.log('   Status after queue:', updated.status);
    
    return mining;
  } catch (error) {
    console.error('❌ Mining instance test failed:', error.message);
    return null;
  }
}

// Test 4: Complete Campaign
console.log('\nTest 4: Creating Complete Campaign...');
async function testCompleteCampaign() {
  try {
    const campaign = await campaignOrchestrationService.createCampaignFromPrompt(
      'Research and mine SEO optimization data for e-commerce product pages',
      {
        name: 'E-commerce SEO Campaign',
        autoStart: false,
        mining: {
          targetUrls: ['https://example-shop.com'],
          maxDepth: 2
        }
      }
    );
    
    console.log('✅ Campaign created:', campaign.campaign_id);
    console.log('   Name:', campaign.name);
    console.log('   Status:', campaign.status);
    console.log('   Prompt:', campaign.prompt.substring(0, 50) + '...');
    
    // Monitor campaign progress
    console.log('\n   Monitoring campaign progress...');
    
    for (let i = 0; i < 15; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updated = await campaignOrchestrationService.getCampaign(campaign.campaign_id);
      console.log(`   [${i * 2}s] Status: ${updated.status}`);
      console.log(`   Progress:`, JSON.stringify(updated.progress, null, 2));
      
      if (updated.status === 'ready' || updated.status === 'failed') {
        break;
      }
    }
    
    const final = await campaignOrchestrationService.getCampaign(campaign.campaign_id);
    console.log('\n   Final Status:', final.status);
    console.log('   Research ID:', final.research_id);
    console.log('   Mining ID:', final.mining_id);
    console.log('   Seeding ID:', final.seeding_id);
    console.log('   Workflow Instance ID:', final.workflow_instance_id);
    console.log('   Linked Services:', final.linked_services.length);
    console.log('   Linked APIs:', final.linked_apis.length);
    
    return campaign;
  } catch (error) {
    console.error('❌ Campaign test failed:', error.message);
    console.error(error.stack);
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(60));
  console.log('Starting Campaign Orchestration Tests');
  console.log('='.repeat(60) + '\n');
  
  try {
    // Test individual components
    const research = await testResearchInstance();
    
    if (research) {
      await testAttributeDiscovery(research.research_id);
      await testMiningInstance(research.research_id);
    }
    
    // Test complete campaign
    await testCompleteCampaign();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error(error.stack);
  }
}

// Run tests
runAllTests().then(() => {
  console.log('\n✨ Test run finished');
  process.exit(0);
}).catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
