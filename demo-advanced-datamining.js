/**
 * Advanced Data Mining Demo
 * 
 * Demonstrates the full capabilities of the Advanced Data Mining Orchestration System
 * including Playwright, Puppeteer, Chrome DevTools, workflow orchestration, and
 * visual component generation.
 */

import AdvancedDataMiningOrchestrator from './services/advanced-datamining-orchestrator.js';
import VisualComponentGenerator from './services/visual-component-generator.js';

// =============================================================================
// DEMO 1: Initialize and List Tools
// =============================================================================

async function demo1_ListAvailableTools() {
  console.log('\n=== DEMO 1: List Available Data Mining Tools ===\n');
  
  const orchestrator = new AdvancedDataMiningOrchestrator({
    headless: true,
    maxConcurrentJobs: 10
  });
  
  const tools = orchestrator.listTools();
  
  console.log(`Found ${tools.length} available tools:\n`);
  tools.forEach(tool => {
    console.log(`📦 ${tool.name}`);
    console.log(`   ID: ${tool.id}`);
    console.log(`   Description: ${tool.description}`);
    console.log(`   Capabilities: ${tool.capabilities.join(', ')}`);
    console.log('');
  });
}

// =============================================================================
// DEMO 2: Create and Execute a Simple Workflow
// =============================================================================

async function demo2_SimpleWorkflow() {
  console.log('\n=== DEMO 2: Create and Execute Simple Workflow ===\n');
  
  const orchestrator = new AdvancedDataMiningOrchestrator({
    headless: true
  });
  
  // Create a workflow for scraping a website
  const workflow = await orchestrator.createWorkflow({
    name: 'Basic Website Analysis',
    description: 'Scrape and analyze example.com',
    steps: [
      {
        name: 'Scrape Content',
        tool: 'puppeteer-scraper',
        config: {
          url: 'https://example.com',
          selectors: {
            title: 'h1',
            paragraphs: 'p'
          },
          screenshot: true
        }
      }
    ]
  });
  
  console.log(`Created workflow: ${workflow.id}`);
  console.log(`Name: ${workflow.name}`);
  console.log(`Status: ${workflow.status}\n`);
  
  // Execute the workflow
  console.log('Executing workflow...\n');
  
  try {
    const result = await orchestrator.executeWorkflow(workflow.id);
    
    console.log('Workflow completed successfully!');
    console.log('\nResults:');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Workflow failed:', error.message);
  }
}

// =============================================================================
// DEMO 3: Advanced Multi-Step Workflow
// =============================================================================

async function demo3_AdvancedWorkflow() {
  console.log('\n=== DEMO 3: Advanced Multi-Step Workflow ===\n');
  
  const orchestrator = new AdvancedDataMiningOrchestrator({
    headless: true
  });
  
  const workflow = await orchestrator.createWorkflow({
    name: 'Comprehensive Website Analysis',
    description: 'Full analysis including layers, performance, and coverage',
    steps: [
      {
        name: 'Analyze DOM Layers',
        tool: 'puppeteer-layer-analyzer',
        config: {
          url: 'https://example.com'
        }
      },
      {
        name: 'Performance Profiling',
        tool: 'devtools-performance',
        config: {
          url: 'https://example.com'
        }
      },
      {
        name: 'Code Coverage Analysis',
        tool: 'devtools-coverage',
        config: {
          url: 'https://example.com'
        }
      }
    ]
  });
  
  console.log(`Created advanced workflow: ${workflow.id}`);
  
  // Set up event listeners
  orchestrator.on('stepStarted', ({ step }) => {
    console.log(`▶️  Starting step: ${step}`);
  });
  
  orchestrator.on('stepCompleted', ({ step }) => {
    console.log(`✅ Completed step: ${step}`);
  });
  
  orchestrator.on('workflowCompleted', (workflow) => {
    console.log('\n🎉 Workflow completed successfully!');
    console.log(`Total steps: ${workflow.results.length}`);
  });
  
  try {
    await orchestrator.executeWorkflow(workflow.id);
  } catch (error) {
    console.error('Workflow failed:', error.message);
  }
}

// =============================================================================
// DEMO 4: Hybrid Pattern Mining
// =============================================================================

async function demo4_HybridPatternMining() {
  console.log('\n=== DEMO 4: Hybrid Pattern Mining ===\n');
  
  const orchestrator = new AdvancedDataMiningOrchestrator({
    headless: true
  });
  
  const workflow = await orchestrator.createWorkflow({
    name: 'Pattern Mining Workflow',
    description: 'Extract patterns and generate training data',
    steps: [
      {
        name: 'Mine Patterns',
        tool: 'hybrid-pattern-miner',
        config: {
          url: 'https://example.com',
          analyzeLayers: true,
          analyzePerformance: true,
          analyzeCoverage: true
        }
      }
    ]
  });
  
  console.log('Running hybrid pattern mining...\n');
  
  try {
    const result = await orchestrator.executeWorkflow(workflow.id);
    
    if (result.results && result.results.length > 0) {
      const miningResult = result.results[0].result;
      
      console.log('Patterns Extracted:');
      console.log('-------------------');
      
      if (miningResult.patterns.layerPatterns.length > 0) {
        console.log('\nLayer Patterns:');
        miningResult.patterns.layerPatterns.forEach(p => {
          console.log(`  - ${p.type}: ${p.count} layers (${p.percentage.toFixed(2)}%)`);
        });
      }
      
      if (miningResult.patterns.performancePatterns.length > 0) {
        console.log('\nPerformance Metrics:');
        miningResult.patterns.performancePatterns.slice(0, 5).forEach(p => {
          console.log(`  - ${p.name}: ${p.value}`);
        });
      }
      
      if (miningResult.patterns.codePatterns.length > 0) {
        console.log('\nCode Usage Patterns:');
        miningResult.patterns.codePatterns.forEach(p => {
          console.log(`  - ${p.type}: ${p.usagePercent.toFixed(2)}%`);
        });
      }
      
      console.log('\nTraining Data Generated:');
      console.log('------------------------');
      console.log(JSON.stringify(miningResult.trainingData, null, 2));
    }
  } catch (error) {
    console.error('Pattern mining failed:', error.message);
  }
}

// =============================================================================
// DEMO 5: Campaign Management
// =============================================================================

async function demo5_CampaignManagement() {
  console.log('\n=== DEMO 5: Campaign Management ===\n');
  
  const orchestrator = new AdvancedDataMiningOrchestrator({
    headless: true
  });
  
  // Create a campaign with multiple workflows
  const campaign = await orchestrator.createCampaign({
    name: 'Multi-Site Analysis Campaign',
    description: 'Analyze multiple competitor websites',
    workflows: [
      {
        name: 'Competitor A Analysis',
        description: 'Analyze competitor-a.com',
        steps: [
          {
            name: 'Scrape Competitor A',
            tool: 'puppeteer-scraper',
            config: {
              url: 'https://example.com',
              selectors: { title: 'h1' }
            }
          }
        ]
      },
      {
        name: 'Competitor B Analysis',
        description: 'Analyze competitor-b.com',
        steps: [
          {
            name: 'Scrape Competitor B',
            tool: 'puppeteer-scraper',
            config: {
              url: 'https://example.org',
              selectors: { title: 'h1' }
            }
          }
        ]
      }
    ]
  });
  
  console.log(`Created campaign: ${campaign.id}`);
  console.log(`Name: ${campaign.name}`);
  console.log(`Total workflows: ${campaign.workflows.length}\n`);
  
  // Listen for campaign events
  orchestrator.on('campaignStarted', (campaign) => {
    console.log(`🚀 Campaign started: ${campaign.name}`);
  });
  
  orchestrator.on('campaignCompleted', (campaign) => {
    console.log(`\n✅ Campaign completed: ${campaign.name}`);
    console.log('Analytics:');
    console.log(`  - Total workflows: ${campaign.analytics.totalWorkflows}`);
    console.log(`  - Completed: ${campaign.analytics.completedWorkflows}`);
    console.log(`  - Failed: ${campaign.analytics.failedWorkflows}`);
  });
  
  try {
    await orchestrator.executeCampaign(campaign.id);
  } catch (error) {
    console.error('Campaign failed:', error.message);
  }
}

// =============================================================================
// DEMO 6: Visual Component Generation
// =============================================================================

async function demo6_ComponentGeneration() {
  console.log('\n=== DEMO 6: Visual Component Generation ===\n');
  
  const generator = new VisualComponentGenerator({
    framework: 'react',
    uiLibrary: 'antd',
    typescript: false
  });
  
  // Define an entity schema
  const entityName = 'Workflow';
  const crudAPI = {
    list: '/api/datamining/workflows',
    create: '/api/datamining/workflows',
    update: '/api/datamining/workflows/:id',
    delete: '/api/datamining/workflows/:id',
    view: '/api/datamining/workflows/:id'
  };
  
  const schema = {
    fields: [
      { 
        name: 'name', 
        type: 'string', 
        label: 'Workflow Name',
        required: true,
        sortable: true
      },
      { 
        name: 'description', 
        type: 'textarea', 
        label: 'Description',
        sortable: false
      },
      { 
        name: 'status', 
        type: 'select', 
        label: 'Status',
        options: ['created', 'running', 'completed', 'failed'],
        sortable: true,
        filterable: true
      },
      {
        name: 'createdAt',
        type: 'date',
        label: 'Created At',
        sortable: true
      }
    ]
  };
  
  console.log('Generating component package...\n');
  
  const componentPackage = generator.generateComponentPackage(
    entityName,
    crudAPI,
    schema
  );
  
  console.log('Generated Components:');
  console.log('--------------------');
  Object.entries(componentPackage.components).forEach(([key, component]) => {
    console.log(`\n📝 ${component.name}`);
    console.log(`   Description: ${component.description}`);
    if (component.dependencies) {
      console.log(`   Dependencies: ${component.dependencies.join(', ')}`);
    }
    if (component.features) {
      console.log(`   Features: ${component.features.join(', ')}`);
    }
  });
  
  console.log('\n\nGenerated Routes:');
  console.log('----------------');
  componentPackage.routes.forEach(route => {
    console.log(`${route.path} → ${route.component}`);
  });
  
  // Save a sample component to file
  console.log('\n\nSample Component Code (WorkflowList):');
  console.log('-------------------------------------');
  console.log(componentPackage.components.list.code.substring(0, 500) + '...\n');
}

// =============================================================================
// DEMO 7: CRUD API Usage
// =============================================================================

async function demo7_CRUDAPI() {
  console.log('\n=== DEMO 7: CRUD API Operations ===\n');
  
  const orchestrator = new AdvancedDataMiningOrchestrator();
  const api = orchestrator.getCRUDAPI();
  
  // Create a workflow
  console.log('Creating workflow...');
  const workflow = await api.createWorkflow({
    name: 'Test Workflow',
    description: 'API Test',
    steps: []
  });
  console.log(`✅ Created: ${workflow.id}`);
  
  // Read the workflow
  console.log('\nReading workflow...');
  const retrieved = api.getWorkflow(workflow.id);
  console.log(`✅ Retrieved: ${retrieved.name}`);
  
  // Update the workflow
  console.log('\nUpdating workflow...');
  const updated = api.updateWorkflow(workflow.id, {
    name: 'Updated Test Workflow'
  });
  console.log(`✅ Updated: ${updated.name}`);
  
  // List all workflows
  console.log('\nListing all workflows...');
  const allWorkflows = api.listWorkflows();
  console.log(`✅ Found ${allWorkflows.length} workflow(s)`);
  
  // Delete the workflow
  console.log('\nDeleting workflow...');
  const deleted = api.deleteWorkflow(workflow.id);
  console.log(`✅ Deleted: ${deleted}`);
}

// =============================================================================
// DEMO 8: Configuration-Based Component Generation
// =============================================================================

async function demo8_ConfigBasedComponents() {
  console.log('\n=== DEMO 8: Configuration-Based Component Generation ===\n');
  
  const generator = new VisualComponentGenerator();
  
  // Generate a campaign manager component
  const campaignSchema = {
    fields: [
      { name: 'name', type: 'string', label: 'Campaign Name', required: true },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'schedule', type: 'string', label: 'Schedule' },
      { name: 'status', type: 'select', label: 'Status', 
        options: ['created', 'running', 'paused', 'completed'] }
    ]
  };
  
  const campaignAPI = {
    list: '/api/datamining/campaigns',
    create: '/api/datamining/campaigns',
    update: '/api/datamining/campaigns/:id',
    delete: '/api/datamining/campaigns/:id',
    view: '/api/datamining/campaigns/:id'
  };
  
  console.log('Generating Campaign Manager components...\n');
  
  const components = generator.generateComponentPackage(
    'Campaign',
    campaignAPI,
    campaignSchema
  );
  
  console.log(`Generated ${Object.keys(components.components).length} components:`);
  Object.keys(components.components).forEach(key => {
    console.log(`  ✅ ${components.components[key].name}`);
  });
  
  console.log('\n📦 Complete package includes:');
  console.log('   - CRUD Components (List, Create, Edit, View)');
  console.log('   - Visual Editor (Drag-and-drop)');
  console.log('   - Configuration Editor (Visual + JSON)');
  console.log('   - Route Configuration');
  console.log('   - API Integration');
}

// =============================================================================
// RUN ALL DEMOS
// =============================================================================

async function runAllDemos() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Advanced Data Mining Orchestration System - DEMO SUITE     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  try {
    // Run synchronous demos
    await demo1_ListAvailableTools();
    await demo6_ComponentGeneration();
    await demo7_CRUDAPI();
    await demo8_ConfigBasedComponents();
    
    // Run async demos (require internet connection)
    console.log('\n\n🌐 The following demos require internet connection:');
    console.log('   - demo2_SimpleWorkflow()');
    console.log('   - demo3_AdvancedWorkflow()');
    console.log('   - demo4_HybridPatternMining()');
    console.log('   - demo5_CampaignManagement()');
    console.log('\nRun them individually if you have connectivity.\n');
    
    // Uncomment to run async demos:
    // await demo2_SimpleWorkflow();
    // await demo3_AdvancedWorkflow();
    // await demo4_HybridPatternMining();
    // await demo5_CampaignManagement();
    
  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    console.error(error.stack);
  }
  
  console.log('\n\n✅ Demo suite completed!\n');
}

// Export demos for individual use
export {
  demo1_ListAvailableTools,
  demo2_SimpleWorkflow,
  demo3_AdvancedWorkflow,
  demo4_HybridPatternMining,
  demo5_CampaignManagement,
  demo6_ComponentGeneration,
  demo7_CRUDAPI,
  demo8_ConfigBasedComponents
};

// Run all demos if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllDemos();
}
