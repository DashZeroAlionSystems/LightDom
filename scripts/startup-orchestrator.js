#!/usr/bin/env node

/**
 * Startup Orchestration Script
 * Initializes and manages service bundles with rich console output
 */

import { serviceOrchestrator } from './src/services/service-orchestrator.js';
import { deepseekInstanceManager } from './src/services/deepseek-instance-manager.js';
import { richSnippetEngine } from './src/services/rich-snippet-engine.js';
import { ConsoleFormatter } from './src/config/console-config.js';

const console = new ConsoleFormatter();

// Service schemas for bundled services
const serviceSchemas = {
  deepseekAI: {
    name: 'deepseek-ai',
    version: '1.0.0',
    endpoints: [
      {
        path: '/prompt',
        method: 'POST',
        schema: {
          input: { type: 'string' },
          context: { type: 'object' },
        },
      },
      {
        path: '/status',
        method: 'GET',
        schema: {},
      },
    ],
    config: {
      instanceType: 'chrome',
    },
  },
  
  richSnippetGenerator: {
    name: 'rich-snippet-generator',
    version: '1.0.0',
    endpoints: [
      {
        path: '/generate',
        method: 'POST',
        schema: {
          type: { type: 'string' },
          data: { type: 'object' },
        },
      },
      {
        path: '/inject',
        method: 'POST',
        schema: {
          snippetId: { type: 'string' },
          target: { type: 'object' },
        },
      },
    ],
    dependencies: ['deepseek-ai'],
  },
  
  domAnalyzer: {
    name: 'dom-analyzer',
    version: '1.0.0',
    endpoints: [
      {
        path: '/analyze',
        method: 'POST',
        schema: {
          url: { type: 'string' },
        },
      },
      {
        path: '/mine',
        method: 'POST',
        schema: {
          selector: { type: 'string' },
        },
      },
    ],
    config: {
      instanceType: 'chrome',
    },
  },
  
  seoOptimizer: {
    name: 'seo-optimizer',
    version: '1.0.0',
    endpoints: [
      {
        path: '/optimize',
        method: 'POST',
        schema: {
          content: { type: 'object' },
        },
      },
      {
        path: '/validate',
        method: 'POST',
        schema: {
          schemas: { type: 'array' },
        },
      },
    ],
    dependencies: ['dom-analyzer', 'rich-snippet-generator'],
  },
  
  analyticsEngine: {
    name: 'analytics-engine',
    version: '1.0.0',
    endpoints: [
      {
        path: '/track',
        method: 'POST',
        schema: {
          event: { type: 'string' },
          data: { type: 'object' },
        },
      },
      {
        path: '/report',
        method: 'GET',
        schema: {},
      },
    ],
    config: {
      instanceType: 'worker',
    },
  },
};

async function displayWelcomeBanner() {
  const banner = `
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🚀 LightDom Service Orchestration Platform 🚀          ║
║                                                                ║
║  Console UX • DeepSeek Integration • Rich Snippets           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `;
  
  console.log(console.formatServiceMessage('System', banner, 'info'));
}

async function initializeServiceBundles() {
  console.log(
    console.formatServiceMessage(
      'Orchestrator',
      'Initializing service bundles...',
      'info'
    )
  );

  // Register AI Services Bundle
  serviceOrchestrator.registerBundle(
    'ai-services',
    [serviceSchemas.deepseekAI],
    {
      autoStart: true,
      healthCheckInterval: 30000,
      restartOnFailure: true,
      maxRestarts: 3,
    }
  );

  // Register Content Generation Bundle
  serviceOrchestrator.registerBundle(
    'content-generation',
    [
      serviceSchemas.richSnippetGenerator,
      serviceSchemas.domAnalyzer,
      serviceSchemas.seoOptimizer,
    ],
    {
      autoStart: true,
      healthCheckInterval: 30000,
    }
  );

  // Register Analytics Bundle
  serviceOrchestrator.registerBundle(
    'analytics',
    [serviceSchemas.analyticsEngine],
    {
      autoStart: true,
      healthCheckInterval: 60000,
    }
  );
}

async function startServiceBundles() {
  const bundles = ['ai-services', 'content-generation', 'analytics'];
  
  for (const bundleName of bundles) {
    try {
      console.log(
        console.formatServiceMessage(
          'Orchestrator',
          `Starting bundle: ${bundleName}`,
          'info'
        )
      );
      
      await serviceOrchestrator.startBundle(bundleName);
      
      console.log(
        console.formatServiceMessage(
          'Orchestrator',
          `Bundle ${bundleName} started successfully`,
          'success'
        )
      );
    } catch (error) {
      console.error(
        console.formatError('Orchestrator', error as Error)
      );
    }
  }
}

async function displayServiceStatus() {
  const bundles = serviceOrchestrator.getAllBundles();
  
  console.log(
    console.formatServiceMessage(
      'System',
      'Service Status Overview',
      'info'
    )
  );
  
  bundles.forEach(bundle => {
    console.log(
      console.formatServiceBundle(
        bundle.name,
        bundle.services.map(s => ({
          name: s.schema.name,
          status: s.status,
          port: s.port,
        }))
      )
    );
  });
}

async function setupEventListeners() {
  // Listen for DeepSeek instance events
  deepseekInstanceManager.on('instance:created', instance => {
    console.log(
      console.formatServiceMessage(
        'DeepSeek',
        `Instance created: ${instance.id}`,
        'success'
      )
    );
  });

  deepseekInstanceManager.on('message', message => {
    console.log(
      console.formatDataStream('DeepSeek', message, 'deepseek')
    );
  });

  deepseekInstanceManager.on('error', message => {
    console.error(
      console.formatError('DeepSeek', message.content)
    );
  });

  // Listen for service orchestrator events
  serviceOrchestrator.on('service:started', service => {
    console.log(
      console.formatServiceMessage(
        service.schema.name,
        'Service started',
        'success'
      )
    );
  });

  serviceOrchestrator.on('service:stopped', service => {
    console.log(
      console.formatServiceMessage(
        service.schema.name,
        'Service stopped',
        'warning'
      )
    );
  });

  serviceOrchestrator.on('service:unhealthy', service => {
    console.error(
      console.formatServiceMessage(
        service.schema.name,
        'Service health check failed',
        'error'
      )
    );
  });

  // Listen for rich snippet engine events
  richSnippetEngine.on('snippet:generated', snippet => {
    console.log(
      console.formatServiceMessage(
        'RichSnippet',
        `Generated snippet: ${snippet.id}`,
        'success'
      )
    );
  });

  richSnippetEngine.on('snippet:injected', data => {
    console.log(
      console.formatDataStream('RichSnippet', data, 'snippet')
    );
  });
}

async function demonstrateIntegration() {
  console.log(
    console.formatServiceMessage(
      'Demo',
      'Running integration demonstration...',
      'info'
    )
  );

  try {
    // 1. Create a DeepSeek instance
    const instance = await deepseekInstanceManager.createInstance('demo-instance', {
      headless: true,
      enableConsoleLogging: true,
    });

    console.log(
      console.formatInstanceInfo(
        instance.id,
        'DeepSeek Chrome',
        'active',
        { headless: true }
      )
    );

    // 2. Generate a rich snippet
    const snippet = richSnippetEngine.generateProductSnippet({
      name: 'Premium Product',
      description: 'High-quality product with excellent features',
      price: 99.99,
      currency: 'USD',
      image: 'https://example.com/product.jpg',
    });

    console.log(
      console.formatDataStream('RichSnippet', snippet, 'snippet')
    );

    // 3. Navigate to a demo page
    await deepseekInstanceManager.navigate(instance.id, 'https://example.com');

    // 4. Send a prompt to DeepSeek
    const response = await deepseekInstanceManager.sendPrompt(
      instance.id,
      'Analyze this page for SEO opportunities'
    );

    console.log(
      console.formatDataStream('DeepSeek Response', response, 'deepseek')
    );

    console.log(
      console.formatServiceMessage(
        'Demo',
        'Integration demonstration completed',
        'success'
      )
    );
  } catch (error) {
    console.error(
      console.formatError('Demo', error as Error)
    );
  }
}

async function monitorServices() {
  setInterval(async () => {
    const bundles = serviceOrchestrator.getAllBundles();
    const runningServices = bundles.reduce(
      (acc, bundle) => acc + bundle.services.filter(s => s.status === 'running').length,
      0
    );
    const totalServices = bundles.reduce((acc, bundle) => acc + bundle.services.length, 0);

    console.log(
      console.formatProgress(
        'Monitor',
        'Services Running',
        runningServices,
        totalServices
      )
    );
  }, 10000);
}

async function setupGracefulShutdown() {
  const shutdown = async () => {
    console.log(
      console.formatServiceMessage(
        'System',
        'Initiating graceful shutdown...',
        'warning'
      )
    );

    // Stop all bundles
    const bundles = serviceOrchestrator.getAllBundles();
    for (const bundle of bundles) {
      await serviceOrchestrator.stopBundle(bundle.name);
    }

    // Stop all DeepSeek instances
    await deepseekInstanceManager.stopAll();

    console.log(
      console.formatServiceMessage(
        'System',
        'Shutdown complete',
        'success'
      )
    );

    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

async function main() {
  try {
    await displayWelcomeBanner();
    await setupEventListeners();
    await setupGracefulShutdown();
    await initializeServiceBundles();
    await startServiceBundles();
    await displayServiceStatus();
    await demonstrateIntegration();
    await monitorServices();

    console.log(
      console.formatServiceMessage(
        'System',
        'All services initialized and running',
        'success'
      )
    );
  } catch (error) {
    console.error(
      console.formatError('System', error as Error)
    );
    process.exit(1);
  }
}

// Start the orchestration system
main().catch(error => {
  console.error(
    console.formatError('System', error as Error)
  );
  process.exit(1);
});
