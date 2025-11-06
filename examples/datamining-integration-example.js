/**
 * Advanced Data Mining Integration Example
 * 
 * Demonstrates how to integrate and use the Advanced Data Mining Orchestration System
 * with the existing LightDom API server and services.
 */

import AdvancedDataMiningOrchestrator from '../services/advanced-datamining-orchestrator.js';
import VisualComponentGenerator from '../services/visual-component-generator.js';

// =============================================================================
// EXAMPLE 1: Standalone Integration
// =============================================================================

async function example1_StandaloneUsage() {
  console.log('\n=== Example 1: Standalone Usage ===\n');
  
  const orchestrator = new AdvancedDataMiningOrchestrator({
    headless: true,
    maxConcurrentJobs: 5,
    timeout: 30000
  });
  
  // Create a workflow for analyzing competitor websites
  const workflow = await orchestrator.createWorkflow({
    name: 'Competitor SEO Analysis',
    description: 'Analyze competitor website performance and structure',
    steps: [
      {
        name: 'Scrape Homepage',
        tool: 'puppeteer-scraper',
        config: {
          url: 'https://example.com',
          selectors: {
            title: 'h1',
            headings: 'h2, h3',
            links: 'a[href]'
          },
          screenshot: true
        }
      },
      {
        name: 'Performance Analysis',
        tool: 'devtools-performance',
        config: {
          url: 'https://example.com'
        }
      }
    ]
  });
  
  console.log(`Created workflow: ${workflow.id}`);
  
  // Set up event listeners
  orchestrator.on('stepCompleted', ({ step, result }) => {
    console.log(`✅ Step completed: ${step}`);
  });
  
  // Execute (commented out to avoid actual network requests in demo)
  // const result = await orchestrator.executeWorkflow(workflow.id);
  // console.log('Workflow result:', result);
  
  console.log('Workflow created successfully (execution commented out)');
}

// =============================================================================
// EXAMPLE 2: API Integration
// =============================================================================

async function example2_APIIntegration() {
  console.log('\n=== Example 2: API Integration ===\n');
  
  // This example shows how to interact with the API server
  // In a real application, these would be HTTP requests
  
  const apiExamples = {
    // List all available tools
    listTools: 'GET /api/datamining/tools',
    
    // Create a new workflow
    createWorkflow: {
      method: 'POST',
      url: '/api/datamining/workflows',
      body: {
        name: 'SEO Analysis Workflow',
        steps: [
          {
            name: 'Analyze Site',
            tool: 'hybrid-pattern-miner',
            config: { url: 'https://example.com' }
          }
        ]
      }
    },
    
    // Execute a workflow
    executeWorkflow: {
      method: 'POST',
      url: '/api/datamining/workflows/:workflowId/execute',
      body: { options: {} }
    },
    
    // Create a campaign
    createCampaign: {
      method: 'POST',
      url: '/api/datamining/campaigns',
      body: {
        name: 'Monthly Competitor Analysis',
        workflows: [
          { name: 'Competitor A', steps: [...] },
          { name: 'Competitor B', steps: [...] }
        ]
      }
    },
    
    // Generate UI components
    generateComponents: {
      method: 'POST',
      url: '/api/datamining/components/generate',
      body: {
        entityName: 'DataSource',
        fields: [
          { name: 'url', type: 'url', required: true },
          { name: 'type', type: 'select', options: ['api', 'html', 'xml'] }
        ]
      }
    }
  };
  
  console.log('API Integration Examples:');
  console.log('-------------------------');
  Object.entries(apiExamples).forEach(([name, config]) => {
    if (typeof config === 'string') {
      console.log(`\n${name}:\n  ${config}`);
    } else {
      console.log(`\n${name}:\n  ${config.method} ${config.url}`);
      if (config.body) {
        console.log(`  Body: ${JSON.stringify(config.body, null, 2).split('\n').join('\n  ')}`);
      }
    }
  });
}

// =============================================================================
// EXAMPLE 3: Component Generation
// =============================================================================

async function example3_ComponentGeneration() {
  console.log('\n=== Example 3: Component Generation ===\n');
  
  const generator = new VisualComponentGenerator({
    framework: 'react',
    uiLibrary: 'antd'
  });
  
  // Generate components for a data source entity
  const components = generator.generateComponentPackage(
    'DataSource',
    {
      list: '/api/datasources',
      create: '/api/datasources',
      update: '/api/datasources/:id',
      delete: '/api/datasources/:id',
      view: '/api/datasources/:id'
    },
    {
      fields: [
        { name: 'name', type: 'string', label: 'Name', required: true },
        { name: 'url', type: 'url', label: 'URL', required: true },
        { name: 'type', type: 'select', label: 'Type', 
          options: ['api', 'html', 'xml', 'json'] },
        { name: 'active', type: 'boolean', label: 'Active' },
        { name: 'notes', type: 'textarea', label: 'Notes' }
      ]
    }
  );
  
  console.log('Generated Components:');
  console.log('--------------------');
  Object.keys(components.components).forEach(key => {
    const comp = components.components[key];
    console.log(`\n✓ ${comp.name}`);
    console.log(`  Description: ${comp.description}`);
    if (comp.dependencies) {
      console.log(`  Dependencies: ${comp.dependencies.join(', ')}`);
    }
  });
  
  console.log('\n\nGenerated Routes:');
  console.log('-----------------');
  components.routes.forEach(route => {
    console.log(`${route.path} → ${route.component}`);
  });
}

// =============================================================================
// EXAMPLE 4: Campaign with Multiple Workflows
// =============================================================================

async function example4_CampaignManagement() {
  console.log('\n=== Example 4: Campaign Management ===\n');
  
  const orchestrator = new AdvancedDataMiningOrchestrator({
    headless: true
  });
  
  // Create a comprehensive campaign
  const campaign = await orchestrator.createCampaign({
    name: 'Q1 2025 Market Analysis',
    description: 'Comprehensive analysis of top 5 competitors',
    workflows: [
      {
        name: 'Competitor A Analysis',
        steps: [
          { tool: 'puppeteer-scraper', config: { url: 'https://competitor-a.com' } },
          { tool: 'devtools-performance', config: { url: 'https://competitor-a.com' } }
        ]
      },
      {
        name: 'Competitor B Analysis',
        steps: [
          { tool: 'puppeteer-scraper', config: { url: 'https://competitor-b.com' } },
          { tool: 'devtools-performance', config: { url: 'https://competitor-b.com' } }
        ]
      },
      {
        name: 'Industry Trends',
        steps: [
          { tool: 'hybrid-pattern-miner', config: { 
            url: 'https://industry-leader.com',
            analyzeLayers: true,
            analyzePerformance: true
          }}
        ]
      }
    ]
  });
  
  console.log(`Campaign created: ${campaign.id}`);
  console.log(`Name: ${campaign.name}`);
  console.log(`Total workflows: ${campaign.workflows.length}`);
  console.log('\nWorkflows:');
  campaign.workflows.forEach((wf, idx) => {
    console.log(`  ${idx + 1}. ${wf.name} (${wf.steps.length} steps)`);
  });
  
  // Set up campaign monitoring
  orchestrator.on('campaignStarted', (campaign) => {
    console.log(`\n🚀 Campaign started: ${campaign.name}`);
  });
  
  orchestrator.on('campaignCompleted', (campaign) => {
    console.log(`\n✅ Campaign completed!`);
    console.log(`Analytics:`);
    console.log(`  - Completed workflows: ${campaign.analytics.completedWorkflows}`);
    console.log(`  - Failed workflows: ${campaign.analytics.failedWorkflows}`);
  });
  
  console.log('\nCampaign ready for execution (execution commented out)');
  // await orchestrator.executeCampaign(campaign.id);
}

// =============================================================================
// EXAMPLE 5: Pattern Mining for ML Training Data
// =============================================================================

async function example5_PatternMining() {
  console.log('\n=== Example 5: Pattern Mining for ML ===\n');
  
  const orchestrator = new AdvancedDataMiningOrchestrator();
  
  // Create a workflow specifically for pattern extraction
  const workflow = await orchestrator.createWorkflow({
    name: 'ML Training Data Generation',
    description: 'Extract patterns for training ML models',
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
  
  console.log('Pattern Mining Workflow Created');
  console.log('-------------------------------');
  console.log(`Workflow ID: ${workflow.id}`);
  console.log(`\nThis workflow will extract:`);
  console.log('  • Layer patterns (GPU acceleration, compositing)');
  console.log('  • Performance patterns (timing, metrics)');
  console.log('  • Code patterns (JS/CSS usage)');
  console.log('\nOutput format:');
  console.log('  • Features: layerCount, gpuLayers, jsUsage, cssUsage, performanceScore');
  console.log('  • Labels: hasComplexLayers, isOptimized, needsOptimization');
  console.log('  • Patterns: Array of extracted patterns');
  console.log('\nReady for ML model training!');
}

// =============================================================================
// EXAMPLE 6: Real-time Event Monitoring
// =============================================================================

async function example6_EventMonitoring() {
  console.log('\n=== Example 6: Real-time Event Monitoring ===\n');
  
  const orchestrator = new AdvancedDataMiningOrchestrator();
  
  // Set up comprehensive event monitoring
  const events = [
    'workflowCreated',
    'workflowStarted',
    'stepStarted',
    'stepCompleted',
    'stepFailed',
    'workflowCompleted',
    'workflowFailed',
    'campaignCreated',
    'campaignStarted',
    'campaignCompleted',
    'campaignFailed'
  ];
  
  events.forEach(eventName => {
    orchestrator.on(eventName, (data) => {
      console.log(`[${eventName}]`, data);
    });
  });
  
  console.log('Event Listeners Registered:');
  console.log('---------------------------');
  events.forEach(event => {
    console.log(`  ✓ ${event}`);
  });
  console.log('\nAll events will be logged in real-time during execution');
}

// =============================================================================
// EXAMPLE 7: Integration with Existing LightDom Services
// =============================================================================

async function example7_LightDomIntegration() {
  console.log('\n=== Example 7: LightDom Service Integration ===\n');
  
  console.log('Integration Points:');
  console.log('------------------');
  
  const integrations = [
    {
      service: 'Chrome Layers Service',
      integration: 'Use layer analyzer tool with existing 3D visualization',
      example: 'Combine puppeteer-layer-analyzer with chrome-layers-service.js'
    },
    {
      service: 'SEO Campaigns',
      integration: 'Orchestrate SEO workflows with campaign manager',
      example: 'Bundle SEO analysis workflows into monthly campaigns'
    },
    {
      service: 'Web Crawler',
      integration: 'Enhanced crawling with performance profiling',
      example: 'Add devtools-performance to existing crawler workflows'
    },
    {
      service: 'Blockchain Mining',
      integration: 'Generate training data for optimization algorithms',
      example: 'Use hybrid-pattern-miner to extract DOM optimization patterns'
    },
    {
      service: 'Component Library',
      integration: 'Auto-generate CRUD interfaces for new entities',
      example: 'Generate React components for workflow/campaign management'
    }
  ];
  
  integrations.forEach((int, idx) => {
    console.log(`\n${idx + 1}. ${int.service}`);
    console.log(`   Integration: ${int.integration}`);
    console.log(`   Example: ${int.example}`);
  });
}

// =============================================================================
// RUN ALL EXAMPLES
// =============================================================================

async function runAllExamples() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Advanced Data Mining Integration Examples                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  try {
    await example1_StandaloneUsage();
    await example2_APIIntegration();
    await example3_ComponentGeneration();
    await example4_CampaignManagement();
    await example5_PatternMining();
    await example6_EventMonitoring();
    await example7_LightDomIntegration();
    
    console.log('\n\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  All Examples Complete!                                      ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    console.log('Next Steps:');
    console.log('-----------');
    console.log('1. Start the API server: npm run api');
    console.log('2. Test the API endpoints: curl http://localhost:3001/api/datamining/tools');
    console.log('3. Run the demo suite: node demo-advanced-datamining.js');
    console.log('4. Run tests: npm test test/advanced-datamining.test.js');
    console.log('5. Read documentation: DATAMINING_QUICKSTART.md\n');
    
  } catch (error) {
    console.error('\n❌ Example failed:', error.message);
    console.error(error.stack);
  }
}

// Export examples for individual use
export {
  example1_StandaloneUsage,
  example2_APIIntegration,
  example3_ComponentGeneration,
  example4_CampaignManagement,
  example5_PatternMining,
  example6_EventMonitoring,
  example7_LightDomIntegration
};

// Run all examples if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}
