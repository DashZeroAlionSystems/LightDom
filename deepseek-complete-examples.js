/**
 * Complete End-to-End Examples
 * Demonstrates all DeepSeek system capabilities
 */

const { DeepSeekSystemIntegrator } = require('./src/services/deepseek-system-integrator');

// Configuration
const config = {
  githubToken: process.env.GITHUB_TOKEN,
  n8nApiUrl: process.env.N8N_API_URL || 'http://localhost:5678/api/v1',
  n8nApiKey: process.env.N8N_API_KEY,
  repoPath: process.cwd(),
  enableAutoTraining: true,
  enableAutoAPI: true,
  enableRouteHistory: true
};

const integrator = new DeepSeekSystemIntegrator(config);

/**
 * Example 1: Complete E-commerce Project Generation
 */
async function example1_EcommerceProject() {
  console.log('\n=== Example 1: Complete E-commerce Project ===\n');

  // Learn from popular e-commerce repos
  const result = await integrator.learnFromGitHub(
    [
      { owner: 'vercel', repo: 'commerce' },
      { owner: 'medusajs', repo: 'medusa' }
    ],
    'ecommerce-platform'
  );

  console.log('Patterns learned:', result.patterns.length);
  console.log('Template generated:', result.template.name);
  console.log('Project structure:', result.project.structure);

  return result;
}

/**
 * Example 2: Auto-Generate Complete API with CRUD
 */
async function example2_AutoGenerateAPI() {
  console.log('\n=== Example 2: Auto-Generate Complete API ===\n');

  const result = await integrator.generateCompleteAPI(
    'E-commerce platform with User, Product, Order, and Payment entities',
    'ecommerce-api'
  );

  console.log('Schemas generated:', result.schemas.length);
  console.log('Schema map relationships:', result.schemaMap.relationships.length);
  console.log('API endpoints:', Object.keys(result.api.endpoints).length);
  console.log('Bundle name:', result.bundle.name);
  console.log('Bundle endpoints:', result.bundle.endpoints.length);

  return result;
}

/**
 * Example 3: SEO Campaign with Real-Time Monitoring
 */
async function example3_SEOCampaign() {
  console.log('\n=== Example 3: SEO Campaign ===\n');

  const result = await integrator.runSEOCampaign(
    'https://example.com',
    ['react', 'javascript', 'web development']
  );

  console.log('Workflow tasks:', result.workflow.tasks.length);
  console.log('Execution status:', result.execution.status);
  console.log('Routes tracked:', result.routes?.length || 0);
  console.log('Recommendations:', result.recommendations.length);

  return result;
}

/**
 * Example 4: Real-Time Service Simulation
 */
async function example4_ServiceSimulation() {
  console.log('\n=== Example 4: Real-Time Service Simulation ===\n');

  const serviceConfig = {
    name: 'API Gateway',
    type: 'rest-api',
    port: 8080,
    dataStreams: [
      {
        name: 'client-requests',
        source: 'client',
        destination: 'server',
        format: 'json',
        enrichment: [
          { attribute: 'timestamp', source: 'computation' },
          { attribute: 'geo', source: 'api' }
        ]
      }
    ]
  };

  const result = await integrator.simulateService(serviceConfig, 30000);

  console.log('Service instance:', result.instance.id);
  console.log('Data messages recorded:', result.data.length);
  console.log('Sample data:', result.data.slice(0, 3));

  return result;
}

/**
 * Example 5: End-to-End Workflow with N8N Integration
 */
async function example5_E2EWorkflow() {
  console.log('\n=== Example 5: End-to-End Workflow ===\n');

  const result = await integrator.createAndDeployWorkflow(
    'Data mining campaign: Extract product data from competitor sites, analyze pricing, generate insights',
    {
      generateSchema: true,
      createN8N: true,
      trackRoutes: true
    }
  );

  console.log('Workflow generated:', result.workflow.name);
  console.log('Schemas created:', result.schemas.length);
  console.log('N8N workflow ID:', result.n8nWorkflow?.id);
  console.log('Execution status:', result.execution.status);
  console.log('State saved:', result.state?.commit);

  return result;
}

/**
 * Example 6: Multi-Repository Learning
 */
async function example6_MultiRepoLearning() {
  console.log('\n=== Example 6: Multi-Repository Learning ===\n');

  const reactPatterns = await integrator.learnFromGitHub(
    [
      { owner: 'facebook', repo: 'react' },
      { owner: 'vercel', repo: 'next.js' },
      { owner: 'remix-run', repo: 'remix' }
    ],
    'modern-react-app'
  );

  console.log('React patterns learned from', reactPatterns.patterns.length, 'repos');
  console.log('Common architecture:', reactPatterns.template.architecture);
  console.log('Generated project files:', reactPatterns.project.files.length);

  return reactPatterns;
}

/**
 * Example 7: Automated Data Mining Pipeline
 */
async function example7_DataMiningPipeline() {
  console.log('\n=== Example 7: Automated Data Mining Pipeline ===\n');

  const result = await integrator.createAndDeployWorkflow(
    'Data mining: Extract user behavior data, clean and normalize, train ML model, deploy predictions API',
    {
      generateSchema: true,
      trackRoutes: true
    }
  );

  console.log('Pipeline tasks:', result.workflow.tasks.length);
  console.log('Data schemas:', result.schemas.map(s => s.name));
  console.log('Execution progress:', result.execution.progress + '%');

  return result;
}

/**
 * Example 8: System Health Monitoring
 */
async function example8_SystemHealth() {
  console.log('\n=== Example 8: System Health Monitoring ===\n');

  const health = integrator.getSystemHealth();

  console.log('Service Status:');
  Object.entries(health.services).forEach(([service, status]) => {
    console.log(`  ${service}: ${status ? '✓' : '✗'}`);
  });

  console.log('\nConfiguration:');
  Object.entries(health.config).forEach(([key, value]) => {
    console.log(`  ${key}: ${value ? 'enabled' : 'disabled'}`);
  });

  return health;
}

/**
 * Example 9: Comprehensive Workflow Creation
 */
async function example9_ComprehensiveWorkflow() {
  console.log('\n=== Example 9: Comprehensive Workflow ===\n');

  // Step 1: Generate API
  const api = await integrator.generateCompleteAPI(
    'Blog platform with User, Post, Comment, and Tag entities',
    'blog-api'
  );

  // Step 2: Create workflow for content management
  const workflow = await integrator.createAndDeployWorkflow(
    'Content management: Fetch posts, analyze engagement, suggest optimizations, auto-publish',
    {
      generateSchema: true,
      trackRoutes: true
    }
  );

  // Step 3: Run SEO campaign
  const seo = await integrator.runSEOCampaign(
    'https://blog.example.com',
    ['blogging', 'content marketing', 'SEO']
  );

  console.log('API bundle:', api.bundle.name);
  console.log('Workflow status:', workflow.execution.status);
  console.log('SEO recommendations:', seo.recommendations.length);

  return { api, workflow, seo };
}

/**
 * Example 10: Complete Project Lifecycle
 */
async function example10_CompleteLifecycle() {
  console.log('\n=== Example 10: Complete Project Lifecycle ===\n');

  // 1. Learn from existing projects
  const patterns = await integrator.learnFromGitHub(
    [
      { owner: 'nestjs', repo: 'nest' },
      { owner: 'expressjs', repo: 'express' }
    ],
    'backend-api'
  );
  console.log('✓ Patterns learned');

  // 2. Generate complete API
  const api = await integrator.generateCompleteAPI(
    'RESTful API with User authentication, Product catalog, Order management',
    'shop-api'
  );
  console.log('✓ API generated');

  // 3. Simulate service
  const simulation = await integrator.simulateService(
    {
      name: 'Shop API',
      type: 'rest-api',
      dataStreams: [
        { source: 'client', destination: 'database' }
      ]
    },
    20000
  );
  console.log('✓ Service simulated');

  // 4. Create deployment workflow
  const deployment = await integrator.createAndDeployWorkflow(
    'Deploy API: Build Docker image, run tests, deploy to production, monitor health',
    {
      createN8N: true,
      trackRoutes: true
    }
  );
  console.log('✓ Deployment workflow created');

  return {
    patterns,
    api,
    simulation,
    deployment
  };
}

/**
 * Run all examples
 */
async function runAllExamples() {
  console.log('==================================================');
  console.log('DeepSeek System - Complete Examples');
  console.log('==================================================');

  try {
    // Check system health first
    await example8_SystemHealth();

    // Run examples based on available services
    const health = integrator.getSystemHealth();

    if (health.config.githubEnabled) {
      await example1_EcommerceProject();
      await example4_ServiceSimulation();
      await example6_MultiRepoLearning();
    }

    // Always available examples
    await example2_AutoGenerateAPI();
    await example3_SEOCampaign();
    await example5_E2EWorkflow();
    await example7_DataMiningPipeline();
    await example9_ComprehensiveWorkflow();

    if (health.config.githubEnabled) {
      await example10_CompleteLifecycle();
    }

    console.log('\n==================================================');
    console.log('All examples completed successfully!');
    console.log('==================================================\n');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export examples for use in other files
module.exports = {
  example1_EcommerceProject,
  example2_AutoGenerateAPI,
  example3_SEOCampaign,
  example4_ServiceSimulation,
  example5_E2EWorkflow,
  example6_MultiRepoLearning,
  example7_DataMiningPipeline,
  example8_SystemHealth,
  example9_ComprehensiveWorkflow,
  example10_CompleteLifecycle,
  runAllExamples
};

// Run if called directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
