/**
 * Full Stack Integration Example
 * Demonstrates complete integration of all components
 */

import { ConsoleFormatter } from '../src/config/console-config.js';
import { deepseekInstanceManager } from '../src/services/deepseek-instance-manager.js';
import { richSnippetEngine } from '../src/services/rich-snippet-engine.js';
import { serviceOrchestrator } from '../src/services/service-orchestrator.js';

const console = new ConsoleFormatter();

async function fullStackIntegrationDemo() {
  console.log(console.formatServiceMessage('Demo', 'Starting Full Stack Integration Demo', 'info'));

  try {
    // Step 1: Create and configure DeepSeek instance
    console.log(console.formatServiceMessage('Demo', 'Step 1: Creating DeepSeek instance', 'info'));

    const instance = await deepseekInstanceManager.createInstance('demo-crawler', {
      headless: true,
      viewport: { width: 1920, height: 1080 },
      enableConsoleLogging: true,
      enableNetworkMonitoring: true,
    });

    console.log(
      console.formatInstanceInfo(instance.id, 'DeepSeek Chrome', 'active', {
        viewport: '1920x1080',
        headless: 'true',
      })
    );

    // Step 2: Navigate to target website
    console.log(console.formatServiceMessage('Demo', 'Step 2: Navigating to example.com', 'info'));

    await deepseekInstanceManager.navigate(instance.id, 'https://example.com');

    // Step 3: Mine DOM data
    console.log(console.formatServiceMessage('Demo', 'Step 3: Mining DOM data', 'info'));

    const domData = await richSnippetEngine.mineDOMData(instance.page);

    console.log(
      console.formatDataStream(
        'DOM Data',
        {
          title: domData.title,
          headings: domData.headings.length,
          images: domData.images.length,
          products: domData.products.length,
        },
        'dom'
      )
    );

    // Step 4: Generate rich snippets for products
    console.log(console.formatServiceMessage('Demo', 'Step 4: Generating rich snippets', 'info'));

    const sampleProduct = {
      name: 'Example Premium Product',
      description: 'High-quality product discovered through DOM mining',
      price: 149.99,
      currency: 'USD',
      image: 'https://example.com/product.jpg',
    };

    const snippet = richSnippetEngine.generateProductSnippet(sampleProduct, {
      theme: 'modern',
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      fontFamily: 'Inter, sans-serif',
      spacing: 'normal',
      borderRadius: '8px',
      shadows: true,
    });

    console.log(
      console.formatDataStream(
        'Rich Snippet',
        {
          id: snippet.id,
          type: 'product',
          structuredData: !!snippet.structuredData,
        },
        'snippet'
      )
    );

    // Step 5: Inject snippet into page
    console.log(console.formatServiceMessage('Demo', 'Step 5: Injecting snippet into DOM', 'info'));

    await richSnippetEngine.injectSnippet(
      snippet.id,
      {
        selector: 'body',
        position: 'prepend',
        priority: 1,
      },
      instance.page
    );

    // Step 6: Send to DeepSeek for analysis
    console.log(
      console.formatServiceMessage('Demo', 'Step 6: Sending to DeepSeek for AI analysis', 'info')
    );

    const analysis = await deepseekInstanceManager.sendPrompt(
      instance.id,
      'Analyze the page for SEO opportunities and rich snippet optimization',
      {
        currentSnippets: [snippet.id],
        domain: 'example.com',
      }
    );

    console.log(console.formatDataStream('DeepSeek Analysis', analysis, 'deepseek'));

    // Step 7: Generate analytics
    console.log(console.formatServiceMessage('Demo', 'Step 7: Generating analytics', 'info'));

    const analytics = await richSnippetEngine.generateAnalytics(snippet.id);

    console.log(console.formatDataStream('Analytics', analytics, 'analytics'));

    // Step 8: Demonstrate service orchestration
    console.log(
      console.formatServiceMessage('Demo', 'Step 8: Demonstrating service orchestration', 'info')
    );

    // Register a service bundle
    const schemas = [
      {
        name: 'seo-analyzer',
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
        name: 'content-generator',
        version: '1.0.0',
        endpoints: [
          {
            path: '/generate',
            method: 'POST',
            schema: { template: { type: 'string' } },
          },
        ],
        dependencies: ['seo-analyzer'],
      },
    ];

    serviceOrchestrator.registerBundle('demo-bundle', schemas, {
      autoStart: false,
      healthCheckInterval: 30000,
    });

    await serviceOrchestrator.startBundle('demo-bundle');

    const bundleStatus = serviceOrchestrator.getBundleStatus('demo-bundle');

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

    // Step 9: Clean up
    console.log(console.formatServiceMessage('Demo', 'Step 9: Cleaning up resources', 'warning'));

    await serviceOrchestrator.stopBundle('demo-bundle');
    await deepseekInstanceManager.stopInstance(instance.id);

    console.log(
      console.formatServiceMessage('Demo', 'Full Stack Integration Demo Complete! ✓', 'success')
    );
  } catch (error) {
    console.error(console.formatError('Demo', error));
    process.exit(1);
  }
}

// Run the demo
fullStackIntegrationDemo().catch(error => {
  console.error(console.formatError('Demo', error));
  process.exit(1);
});
