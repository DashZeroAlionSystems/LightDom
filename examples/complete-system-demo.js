/**
 * Complete System Demo
 * Demonstrates all features: Console UX, DeepSeek, Service Orchestration,
 * Rich Snippets, and Headless API Management
 */

import { deepseekInstanceManager } from '../src/services/deepseek-instance-manager.js';
import { richSnippetEngine } from '../src/services/rich-snippet-engine.js';
import { serviceOrchestrator } from '../src/services/service-orchestrator.js';
import { headlessAPIManager } from '../src/services/headless-api-manager.js';
import { ConsoleFormatter } from '../src/config/console-config.js';

const console = new ConsoleFormatter();

async function displayBanner() {
  const banner = `
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     🚀 LightDom Complete System Demonstration 🚀              ║
║                                                                ║
║  Console UX • DeepSeek • Orchestration • Rich Snippets       ║
║  Headless API • Service Workers • Real-time Analytics        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `;
  
  console.log(console.formatServiceMessage('System', banner, 'info'));
}

async function demoConsoleUX() {
  console.log(
    console.formatServiceMessage(
      'Demo',
      '=== Part 1: Console UX System ===',
      'info'
    )
  );

  // Demonstrate different console formats
  console.log(
    console.formatServiceMessage('Service A', 'Service started successfully', 'success')
  );

  console.log(
    console.formatServiceMessage('Service B', 'Warning: High memory usage', 'warning')
  );

  console.log(
    console.formatDataStream('API', { status: 'ok', requests: 1234 }, 'api')
  );

  console.log(
    console.formatProgress('Loader', 'Processing items', 75, 100)
  );

  console.log(
    console.formatServiceBundle('demo-bundle', [
      { name: 'api-server', status: 'running', port: 3001 },
      { name: 'worker-pool', status: 'running', port: 3002 },
      { name: 'analytics', status: 'starting' },
    ])
  );
}

async function demoDeepSeekIntegration() {
  console.log(
    console.formatServiceMessage(
      'Demo',
      '=== Part 2: DeepSeek Integration ===',
      'info'
    )
  );

  // Create DeepSeek instance
  const instance = await deepseekInstanceManager.createInstance('demo-deepseek', {
    headless: true,
    viewport: { width: 1920, height: 1080 },
    enableConsoleLogging: true,
  });

  console.log(
    console.formatInstanceInfo(
      instance.id,
      'DeepSeek Chrome',
      'active',
      { viewport: '1920x1080', headless: 'true' }
    )
  );

  // Navigate to a page
  await deepseekInstanceManager.navigate(instance.id, 'https://example.com');

  // Send prompts
  const response1 = await deepseekInstanceManager.sendPrompt(
    instance.id,
    'Analyze the page structure and identify SEO opportunities'
  );

  console.log(
    console.formatDataStream('DeepSeek Response', response1, 'deepseek')
  );

  const response2 = await deepseekInstanceManager.sendPrompt(
    instance.id,
    'Generate product schema recommendations',
    { industry: 'e-commerce' }
  );

  console.log(
    console.formatDataStream('DeepSeek Recommendations', response2, 'deepseek')
  );

  return instance;
}

async function demoServiceOrchestration() {
  console.log(
    console.formatServiceMessage(
      'Demo',
      '=== Part 3: Service Orchestration ===',
      'info'
    )
  );

  // Define service schemas
  const schemas = [
    {
      name: 'content-analyzer',
      version: '1.0.0',
      endpoints: [
        {
          path: '/analyze',
          method: 'POST',
          schema: { url: { type: 'string' } },
        },
      ],
      config: { instanceType: 'chrome' },
    },
    {
      name: 'seo-optimizer',
      version: '1.0.0',
      endpoints: [
        {
          path: '/optimize',
          method: 'POST',
          schema: { content: { type: 'object' } },
        },
      ],
      dependencies: ['content-analyzer'],
    },
    {
      name: 'snippet-injector',
      version: '1.0.0',
      endpoints: [
        {
          path: '/inject',
          method: 'POST',
          schema: { snippetId: { type: 'string' } },
        },
      ],
      dependencies: ['seo-optimizer'],
      config: { instanceType: 'worker' },
    },
  ];

  // Register bundle
  serviceOrchestrator.registerBundle('content-pipeline', schemas, {
    autoStart: false,
    healthCheckInterval: 30000,
    restartOnFailure: true,
    maxRestarts: 3,
  });

  // Start bundle
  await serviceOrchestrator.startBundle('content-pipeline');

  const bundleStatus = serviceOrchestrator.getBundleStatus('content-pipeline');
  if (!bundleStatus) {
    throw new Error('Failed to retrieve bundle status for content-pipeline');
  }

  console.log(
    console.formatServiceBundle(
      bundleStatus.name,
      bundleStatus.services.map(s => ({
        name: s.schema.name,
        status: s.status,
        port: s.port,
      }))
    )
  );

  // Execute schema-based call
  const services = bundleStatus.services;
  const analyzerResult = await serviceOrchestrator.executeSchemaCall(
    services[0].id,
    '/analyze',
    { url: 'https://example.com' }
  );

  console.log(
    console.formatDataStream('Schema Call Result', analyzerResult, 'api')
  );
}

async function demoRichSnippets(deepseekInstance) {
  console.log(
    console.formatServiceMessage(
      'Demo',
      '=== Part 4: Rich Snippet Engine ===',
      'info'
    )
  );

  // Generate different types of snippets
  const productSnippet = richSnippetEngine.generateProductSnippet({
    name: 'Premium Headphones',
    description: 'High-fidelity wireless headphones with noise cancellation',
    price: 299.99,
    currency: 'USD',
    image: 'https://example.com/headphones.jpg',
  }, {
    theme: 'modern',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    fontFamily: 'Inter, sans-serif',
    spacing: 'normal',
    borderRadius: '8px',
    shadows: true,
  });

  console.log(
    console.formatDataStream('Product Snippet', {
      id: productSnippet.id,
      hasStructuredData: !!productSnippet.structuredData,
    }, 'snippet')
  );

  const articleSnippet = richSnippetEngine.generateArticleSnippet({
    title: 'The Future of Web Development',
    author: 'Jane Developer',
    publishedDate: new Date().toISOString(),
    description: 'Exploring upcoming trends in web technologies',
  });

  console.log(
    console.formatDataStream('Article Snippet', {
      id: articleSnippet.id,
      type: 'article',
    }, 'snippet')
  );

  // Inject snippet into page
  await richSnippetEngine.injectSnippet(
    productSnippet.id,
    { selector: 'body', position: 'prepend', priority: 1 },
    deepseekInstance.page
  );

  // Mine DOM data
  const domData = await richSnippetEngine.mineDOMData(deepseekInstance.page);

  console.log(
    console.formatDataStream('Mined DOM Data', {
      title: domData.title,
      headings: domData.headings.length,
      images: domData.images.length,
      products: domData.products.length,
    }, 'dom')
  );

  // Get analytics
  const analytics = await richSnippetEngine.generateAnalytics(productSnippet.id);

  console.log(
    console.formatDataStream('Snippet Analytics', analytics, 'analytics')
  );
}

async function demoHeadlessAPI() {
  console.log(
    console.formatServiceMessage(
      'Demo',
      '=== Part 5: Headless API Management ===',
      'info'
    )
  );

  // Initialize headless API with worker pool
  const apiManager = new (await import('../src/services/headless-api-manager.js')).HeadlessAPIManager({
    workers: 3,
    enableServiceWorkers: true,
    enableAnalytics: true,
    cacheStrategy: 'network-first',
    maxConcurrentRequests: 10,
    timeout: 30000,
  });

  await apiManager.initialize();

  console.log(
    console.formatServiceMessage(
      'HeadlessAPI',
      'Worker pool initialized',
      'success'
    )
  );

  // Process multiple URLs concurrently
  const urls = [
    'https://example.com',
    'https://example.org',
    'https://example.net',
  ];

  console.log(
    console.formatServiceMessage(
      'HeadlessAPI',
      `Processing ${urls.length} URLs concurrently`,
      'info'
    )
  );

  const results = await Promise.all(
    urls.map(url => apiManager.processURL(url, {
      extractText: true,
      extractLinks: true,
      extractImages: true,
    }))
  );

  results.forEach((result, i) => {
    console.log(
      console.formatDataStream(
        `URL ${i + 1} Result`,
        {
          url: result.url,
          loadTime: result.analytics?.metrics.loadTime,
          nodeCount: result.analytics?.domMetrics.nodeCount,
        },
        'analytics'
      )
    );
  });

  // Display worker status
  const workerStatus = apiManager.getWorkerStatus();
  
  console.log(
    console.formatServiceBundle(
      'Headless API Workers',
      workerStatus.map(w => ({
        name: w.id,
        status: w.status,
        port: w.requestsProcessed,
      }))
    )
  );

  // Get aggregated analytics
  const aggregated = apiManager.getAggregatedAnalytics();
  
  console.log(
    console.formatDataStream('Aggregated Analytics', aggregated, 'analytics')
  );

  // Demonstrate DOM painting with schema
  const schema = {
    target: 'body',
    position: 'prepend',
    template: '<div style="padding: 20px; background: #f0f0f0;"><h2>{{title}}</h2><p>{{content}}</p></div>',
    styles: {
      fontFamily: 'Arial, sans-serif',
      color: '#333',
    },
  };

  const workers = apiManager.getWorkerStatus();
  if (workers.length > 0) {
    await apiManager.paintDOM(workers[0].id, schema, {
      title: 'Injected Content',
      content: 'This content was injected using schema-based DOM painting',
    });

    console.log(
      console.formatServiceMessage(
        'HeadlessAPI',
        'DOM painted with schema',
        'success'
      )
    );
  }

  return apiManager;
}

async function demoRealTimeMonitoring(apiManager) {
  console.log(
    console.formatServiceMessage(
      'Demo',
      '=== Part 6: Real-time Monitoring ===',
      'info'
    )
  );

  // Set up event listeners
  deepseekInstanceManager.on('message', (message) => {
    console.log(
      console.formatDataStream('DeepSeek Event', message, 'deepseek')
    );
  });

  serviceOrchestrator.on('service:started', (service) => {
    console.log(
      console.formatServiceMessage(
        service.schema.name,
        'Service started event',
        'success'
      )
    );
  });

  richSnippetEngine.on('snippet:generated', (snippet) => {
    console.log(
      console.formatDataStream('Snippet Event', { id: snippet.id }, 'snippet')
    );
  });

  apiManager.on('url:processed', data => {
    console.log(
      console.formatDataStream('API Event', data, 'api')
    );
  });

  // Display monitoring summary
  const bundles = serviceOrchestrator.getAllBundles();
  const instances = deepseekInstanceManager.getInstances();
  const workers = apiManager.getWorkerStatus();

  console.log(
    console.formatServiceMessage(
      'Monitor',
      `System Status: ${bundles.length} bundles, ${instances.length} instances, ${workers.length} workers`,
      'info'
    )
  );

  // Simulate progress monitoring
  for (let i = 0; i <= 100; i += 20) {
    console.log(
      console.formatProgress('Monitor', 'System Health', i, 100)
    );
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function cleanupDemo(apiManager) {
  console.log(
    console.formatServiceMessage(
      'Demo',
      '=== Cleanup ===',
      'warning'
    )
  );

  // Stop all services
  const bundles = serviceOrchestrator.getAllBundles();
  for (const bundle of bundles) {
    await serviceOrchestrator.stopBundle(bundle.name);
  }

  // Stop all DeepSeek instances
  await deepseekInstanceManager.stopAll();

  // Shutdown headless API
  await apiManager.shutdown();

  console.log(
    console.formatServiceMessage(
      'Demo',
      'Cleanup complete',
      'success'
    )
  );
}

async function main() {
  try {
    await displayBanner();
    
    await demoConsoleUX();
    
    const deepseekInstance = await demoDeepSeekIntegration();
    
    await demoServiceOrchestration();
    
    await demoRichSnippets(deepseekInstance);
    
    const apiManager = await demoHeadlessAPI();
    
    await demoRealTimeMonitoring(apiManager);
    
    await cleanupDemo(apiManager);

    console.log(
      console.formatServiceMessage(
        'Demo',
        '🎉 Complete System Demo Finished Successfully! 🎉',
        'success'
      )
    );

  } catch (error) {
    console.error(
      console.formatError('Demo', error)
    );
    process.exit(1);
  }
}

// Run the demo
main().catch(error => {
  console.error(console.formatError('Demo', error));
  process.exit(1);
});
