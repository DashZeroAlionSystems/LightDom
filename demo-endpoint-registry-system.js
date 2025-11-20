/**
 * Demo/Test Script for API Endpoint Registry System
 * 
 * Demonstrates the full workflow:
 * 1. Discover endpoints from codebase
 * 2. Register them in the database
 * 3. Create service compositions
 * 4. Build endpoint chains
 * 5. Execute workflows
 */

import APIEndpointDiscovery from './services/api-endpoint-discovery.js';
import APIEndpointRegistry from './services/api-endpoint-registry.js';
import ServiceCompositionOrchestrator from './services/service-composition-orchestrator.js';
import WorkflowWizardService from './services/workflow-wizard-service.js';
import { Pool } from 'pg';

// Database configuration
const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'dom_space_harvester',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runDemo() {
  console.log('🚀 API Endpoint Registry System Demo\n');
  
  try {
    // Initialize services
    const registry = new APIEndpointRegistry(db);
    const orchestrator = new ServiceCompositionOrchestrator(registry);
    const wizardService = new WorkflowWizardService(db);
    const discovery = new APIEndpointDiscovery({
      routesDirectory: './api'
    });

    // ===================================================
    // Step 1: Discover Endpoints
    // ===================================================
    console.log('📡 Step 1: Discovering API Endpoints...');
    const endpoints = await discovery.discoverEndpoints();
    const stats = discovery.getStatistics();
    
    console.log(`✅ Discovered ${endpoints.length} endpoints`);
    console.log('   Statistics:', JSON.stringify(stats, null, 2));
    
    // Display sample endpoints
    console.log('\n   Sample Endpoints:');
    endpoints.slice(0, 5).forEach(ep => {
      console.log(`   - ${ep.method} ${ep.path} (${ep.category})`);
    });

    // ===================================================
    // Step 2: Register Endpoints
    // ===================================================
    console.log('\n📝 Step 2: Registering Endpoints in Database...');
    const registrationResults = await registry.bulkRegisterEndpoints(endpoints.slice(0, 10));
    const successCount = registrationResults.filter(r => r.success).length;
    console.log(`✅ Registered ${successCount}/${registrationResults.length} endpoints`);

    // ===================================================
    // Step 3: Create a Service Composition
    // ===================================================
    console.log('\n🔧 Step 3: Creating Service Composition...');
    
    // Get some registered endpoints
    const registeredEndpoints = await registry.getEndpoints({ is_active: true });
    
    if (registeredEndpoints.length >= 2) {
      const serviceId = 'demo_service_' + Date.now();
      
      // Bind first two endpoints to a service
      await registry.bindEndpointToService(
        serviceId,
        registeredEndpoints[0].endpoint_id,
        {
          binding_order: 0,
          output_mapping: { result: 'firstResult' }
        }
      );
      
      await registry.bindEndpointToService(
        serviceId,
        registeredEndpoints[1].endpoint_id,
        {
          binding_order: 1,
          input_mapping: { input: 'firstResult' }
        }
      );
      
      console.log(`✅ Created service: ${serviceId}`);
      console.log(`   - Bound endpoint: ${registeredEndpoints[0].path}`);
      console.log(`   - Bound endpoint: ${registeredEndpoints[1].path}`);
      
      // Get service bindings
      const bindings = await registry.getServiceBindings(serviceId);
      console.log(`   - Total bindings: ${bindings.length}`);
    } else {
      console.log('⚠️  Not enough endpoints to create service composition');
    }

    // ===================================================
    // Step 4: Create an Endpoint Chain
    // ===================================================
    console.log('\n⛓️  Step 4: Creating Endpoint Chain...');
    
    if (registeredEndpoints.length >= 2) {
      const workflowId = 'demo_workflow_' + Date.now();
      
      const chain = await registry.createEndpointChain(workflowId, {
        name: 'Demo Sequential Chain',
        description: 'A demo chain executing endpoints in sequence',
        chain_type: 'sequential',
        endpoints: [
          {
            endpoint_id: registeredEndpoints[0].endpoint_id,
            config: {
              output_mapping: { data: 'step1Data' }
            }
          },
          {
            endpoint_id: registeredEndpoints[1].endpoint_id,
            config: {
              input_mapping: { input: 'step1Data' }
            }
          }
        ],
        timeout_ms: 60000
      });
      
      console.log(`✅ Created chain: ${chain.chain_id}`);
      console.log(`   - Name: ${chain.name}`);
      console.log(`   - Type: ${chain.chain_type}`);
      console.log(`   - Endpoints: ${chain.endpoints.length}`);
      
      // Get execution plan
      const plan = await registry.getChainExecutionPlan(chain.chain_id);
      console.log(`   - Execution plan generated with ${plan.endpoints.length} steps`);
    } else {
      console.log('⚠️  Not enough endpoints to create chain');
    }

    // ===================================================
    // Step 5: Generate Workflow Wizard
    // ===================================================
    console.log('\n🧙 Step 5: Generating Workflow Wizard...');
    
    const categories = await registry.getCategoriesWithCounts();
    
    if (categories.length > 0) {
      const category = categories[0].category;
      console.log(`   Using category: ${category}`);
      
      try {
        const wizardConfig = await wizardService.generateWizardFromCategory(
          category,
          registry
        );
        
        console.log(`✅ Generated wizard: ${wizardConfig.config_id}`);
        console.log(`   - Name: ${wizardConfig.name}`);
        console.log(`   - Steps: ${wizardConfig.steps.length}`);
        console.log(`   - Available endpoints: ${wizardConfig.available_endpoints.length}`);
        
        // Display wizard steps
        console.log('\n   Wizard Steps:');
        wizardConfig.steps.forEach((step, index) => {
          console.log(`   ${index + 1}. ${step.title}`);
          console.log(`      ${step.description}`);
        });
      } catch (error) {
        console.log(`⚠️  Could not generate wizard: ${error.message}`);
      }
    } else {
      console.log('⚠️  No categories found for wizard generation');
    }

    // ===================================================
    // Step 6: Get Registry Statistics
    // ===================================================
    console.log('\n📊 Step 6: Registry Statistics...');
    
    const registryStats = await registry.getEndpointStats();
    console.log('   Total endpoints:', registryStats.total_endpoints);
    console.log('   Active endpoints:', registryStats.active_endpoints);
    console.log('   Categories:', registryStats.total_categories);
    console.log('   Service types:', registryStats.total_service_types);
    
    const categoryStats = await registry.getCategoriesWithCounts();
    console.log('\n   Endpoints by Category:');
    categoryStats.forEach(cat => {
      console.log(`   - ${cat.category}: ${cat.endpoint_count} (${cat.active_count} active)`);
    });

    // ===================================================
    // Step 7: Search Functionality
    // ===================================================
    console.log('\n🔍 Step 7: Testing Search Functionality...');
    
    const searchResults = await registry.searchEndpoints('workflow');
    console.log(`   Found ${searchResults.length} endpoints matching "workflow"`);
    
    if (searchResults.length > 0) {
      console.log('\n   Sample Results:');
      searchResults.slice(0, 3).forEach(ep => {
        console.log(`   - ${ep.title} (${ep.method} ${ep.path})`);
      });
    }

    console.log('\n✅ Demo completed successfully!\n');
    
    // Display summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Summary:');
    console.log(`- Discovered: ${endpoints.length} endpoints`);
    console.log(`- Registered: ${successCount} endpoints`);
    console.log(`- Categories: ${categoryStats.length}`);
    console.log('- Created service compositions and endpoint chains');
    console.log('- Generated workflow wizard configurations');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    console.error(error.stack);
  } finally {
    await db.end();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export default runDemo;
