/**
 * Simple Test - Campaign Orchestration System
 * 
 * Tests basic functionality without external dependencies
 */

console.log('🧪 Testing Campaign Orchestration System (Simple)\n');

// Test imports
console.log('Testing imports...');

async function testImports() {
  try {
    // Test service classes directly
    const { default: ResearchInstanceService } = await import('./services/research-instance-service.js');
    console.log('✅ ResearchInstanceService loaded');
    
    const { default: AttributeDiscoveryService } = await import('./services/attribute-discovery-service.js');
    console.log('✅ AttributeDiscoveryService loaded');
    
    const { default: DataMiningInstanceService } = await import('./services/data-mining-instance-service.js');
    console.log('✅ DataMiningInstanceService loaded');
    
    const { default: CampaignOrchestrationService } = await import('./services/campaign-orchestration-service.js');
    console.log('✅ CampaignOrchestrationService loaded');
    
    return true;
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    return false;
  }
}

// Test basic functionality
async function testBasicFunctionality() {
  console.log('\nTesting basic functionality...');
  
  try {
    // Import services with mock DeepSeek
    const mockDeepSeek = {
      generateWorkflowFromPrompt: async () => ({
        coreConcepts: ['SEO', 'optimization'],
        categories: ['seo', 'content'],
        attributes: ['title', 'description'],
        dataSources: [],
        schemas: [],
        apis: [],
        useCases: []
      })
    };
    
    // Test attribute discovery service standalone
    const { default: attributeService } = await import('./services/attribute-discovery-service.js');
    
    // Test categorization
    const category1 = attributeService.categorizeAttribute('meta_title');
    console.log(`  Categorize 'meta_title': ${category1}`);
    
    const category2 = attributeService.categorizeAttribute('page_speed');
    console.log(`  Categorize 'page_speed': ${category2}`);
    
    // Test data type inference
    const type1 = attributeService.inferDataType('price');
    console.log(`  Infer type 'price': ${type1}`);
    
    const type2 = attributeService.inferDataType('published_date');
    console.log(`  Infer type 'published_date': ${type2}`);
    
    // Test normalization
    const normalized = attributeService.normalizeAttributeName('Page Title!');
    console.log(`  Normalize 'Page Title!': ${normalized}`);
    
    console.log('✅ Basic functionality works');
    return true;
  } catch (error) {
    console.error('❌ Functionality test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

// Test database schema validation
async function testDatabaseSchema() {
  console.log('\nValidating database schema...');
  
  try {
    const fs = await import('fs');
    const schemaFile = './migrations/create-campaign-orchestration-tables.sql';
    
    const schema = fs.default.readFileSync(schemaFile, 'utf-8');
    
    // Check for required tables
    const requiredTables = [
      'research_instances',
      'attribute_definitions',
      'data_mining_instances',
      'seeding_instances',
      'workflow_instances',
      'service_instances',
      'api_instances',
      'campaigns',
      'attribute_mining_tasks',
      'campaign_execution_log'
    ];
    
    let allFound = true;
    for (const table of requiredTables) {
      if (schema.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
        console.log(`  ✅ Table: ${table}`);
      } else {
        console.log(`  ❌ Missing table: ${table}`);
        allFound = false;
      }
    }
    
    if (allFound) {
      console.log('✅ All required tables present in schema');
    }
    
    return allFound;
  } catch (error) {
    console.error('❌ Schema validation failed:', error.message);
    return false;
  }
}

// Test API routes structure
async function testAPIRoutes() {
  console.log('\nValidating API routes...');
  
  try {
    const fs = await import('fs');
    const routesFile = './api/campaign-orchestration-routes.js';
    
    const routes = fs.default.readFileSync(routesFile, 'utf-8');
    
    // Check for required routes
    const requiredRoutes = [
      "'/from-prompt'", // POST campaign from prompt
      "'/research/kickoff'", // POST research kickoff
      "'/attributes/discover/:researchId'", // POST discover attributes
      "'/mining/create-with-attributes'", // POST create mining instance
      "'/:campaignId/start'", // POST start campaign
    ];
    
    let allFound = true;
    for (const route of requiredRoutes) {
      if (routes.includes(route)) {
        console.log(`  ✅ Route: ${route}`);
      } else {
        console.log(`  ❌ Missing route: ${route}`);
        allFound = false;
      }
    }
    
    if (allFound) {
      console.log('✅ All required routes present');
    }
    
    return allFound;
  } catch (error) {
    console.error('❌ Routes validation failed:', error.message);
    return false;
  }
}

// Run all simple tests
async function runTests() {
  console.log('='.repeat(60));
  console.log('Campaign Orchestration System - Simple Tests');
  console.log('='.repeat(60) + '\n');
  
  const results = {
    imports: await testImports(),
    functionality: await testBasicFunctionality(),
    schema: await testDatabaseSchema(),
    routes: await testAPIRoutes()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('Test Results:');
  console.log('='.repeat(60));
  console.log(`  Imports: ${results.imports ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Functionality: ${results.functionality ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Schema: ${results.schema ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Routes: ${results.routes ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(60));
  
  const allPassed = Object.values(results).every(r => r === true);
  if (allPassed) {
    console.log('\n✨ All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed');
  }
  
  return allPassed;
}

// Run tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
