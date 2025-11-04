# Console UX & Service Orchestration System

Complete guide for the LightDom console UX system with DeepSeek integration, service orchestration, and rich snippet generation.

## 🎯 Overview

This system provides:

- **Rich Console UX** - Beautiful, configurable console output for service monitoring
- **DeepSeek Integration** - Two-way communication with AI instances running in headless Chrome
- **Service Orchestration** - Manage bundled services with schema-based communication
- **Rich Snippet Engine** - Generate SEO-friendly content with real-time DOM injection
- **Custom CLI** - Interactive command-line interface for service management

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Start the Orchestration System

```bash
node scripts/startup-orchestrator.js
```

### Use the CLI

```bash
# List all service bundles
node cli/service-cli.js bundle:list

# Create a DeepSeek instance
node cli/service-cli.js deepseek:create my-instance

# Generate a product snippet
node cli/service-cli.js snippet:product --name "Premium Product" --price 99.99
```

## 📋 Architecture

### Component Overview

```
Console UX System
├── Console Configuration (console-config.ts)
│   ├── Theme Management
│   ├── Formatters
│   └── Icons & Borders
│
├── DeepSeek Instance Manager (deepseek-instance-manager.ts)
│   ├── Chrome Instance Management
│   ├── Two-way Communication
│   └── Real-time Console Output
│
├── Service Orchestrator (service-orchestrator.ts)
│   ├── Service Bundle Management
│   ├── Schema-based Communication
│   └── Health Monitoring
│
├── Rich Snippet Engine (rich-snippet-engine.ts)
│   ├── Snippet Generation
│   ├── DOM Injection
│   ├── SEO Optimization
│   └── Real-time Analytics
│
├── Startup Orchestrator (startup-orchestrator.js)
│   └── System Initialization
│
└── Service CLI (service-cli.js)
    └── Interactive Management
```

## 🎨 Console Configuration

### Custom Console Themes

```typescript
import { ConsoleFormatter } from './src/config/console-config';

const formatter = new ConsoleFormatter({
  enableTimestamps: true,
  enableServiceLabels: true,
  enableColors: true,
  logLevel: 'info',
  maxLineLength: 120,
  enableBorders: true,
  enableIcons: true,
});

// Format service messages
console.log(
  formatter.formatServiceMessage('MyService', 'Started successfully', 'success')
);

// Format data streams
console.log(
  formatter.formatDataStream('API', { status: 'ok', data: {...} }, 'api')
);

// Format service bundles
console.log(
  formatter.formatServiceBundle('my-bundle', [
    { name: 'service-1', status: 'running', port: 3001 },
    { name: 'service-2', status: 'running', port: 3002 },
  ])
);
```

### Available Icons

- `✓` success
- `✗` error
- `⚠` warning
- `ℹ` info
- `⚙` service
- `🤖` deepseek
- `📦` instance/bundle
- `🔌` api
- `📋` schema
- `✨` snippet
- `🌐` dom/chrome
- `📊` analytics
- `⚡` worker
- `📡` stream
- `👁` monitor

## 🤖 DeepSeek Integration

### Creating Instances

```typescript
import { deepseekInstanceManager } from './src/services/deepseek-instance-manager';

// Create a headless Chrome instance
const instance = await deepseekInstanceManager.createInstance('my-instance', {
  headless: true,
  viewport: { width: 1920, height: 1080 },
  enableConsoleLogging: true,
  enableNetworkMonitoring: true,
  timeout: 30000,
});

console.log(`Instance created: ${instance.id}`);
```

### Two-way Communication

```typescript
// Send a prompt to DeepSeek
const response = await deepseekInstanceManager.sendPrompt(
  'my-instance',
  'Analyze this page for SEO opportunities',
  { additionalContext: 'e-commerce site' }
);

console.log('Response:', response);

// Execute custom code
const result = await deepseekInstanceManager.executeCode(
  'my-instance',
  `document.querySelectorAll('h1').length`
);

console.log('H1 count:', result);

// Navigate to URL
await deepseekInstanceManager.navigate('my-instance', 'https://example.com');
```

### Real-time Console Output

```typescript
// Listen for console logs from the instance
deepseekInstanceManager.on('console', (message) => {
  console.log(`[${message.instanceId}] ${message.content}`);
});

// Listen for errors
deepseekInstanceManager.on('error', (message) => {
  console.error(`[${message.instanceId}] Error: ${message.content}`);
});

// Listen for network events
deepseekInstanceManager.on('network', (message) => {
  console.log(`[${message.instanceId}] Network: ${message.content.url}`);
});
```

## ⚙️ Service Orchestration

### Defining Service Schemas

```typescript
const serviceSchema = {
  name: 'my-service',
  version: '1.0.0',
  endpoints: [
    {
      path: '/api/process',
      method: 'POST',
      schema: {
        input: { type: 'string' },
        options: { type: 'object' },
      },
    },
  ],
  dependencies: ['other-service'],
  config: {
    instanceType: 'chrome', // chrome | worker | api | custom
  },
};
```

### Registering and Starting Bundles

```typescript
import { serviceOrchestrator } from './src/services/service-orchestrator';

// Register a bundle
serviceOrchestrator.registerBundle(
  'my-bundle',
  [serviceSchema1, serviceSchema2],
  {
    autoStart: true,
    healthCheckInterval: 30000,
    restartOnFailure: true,
    maxRestarts: 3,
  }
);

// Start the bundle
await serviceOrchestrator.startBundle('my-bundle');

// Get bundle status
const status = serviceOrchestrator.getBundleStatus('my-bundle');
console.log(status);
```

### Schema-based API Calls

```typescript
// Execute a schema-based API call
const result = await serviceOrchestrator.executeSchemaCall(
  'service-id',
  '/api/process',
  { input: 'some data', options: { format: 'json' } }
);

console.log('Result:', result);
```

### Health Monitoring

```typescript
// Listen for health check failures
serviceOrchestrator.on('service:unhealthy', (service) => {
  console.error(`Service ${service.schema.name} is unhealthy`);
});

// Listen for service events
serviceOrchestrator.on('service:started', (service) => {
  console.log(`Service ${service.schema.name} started`);
});

serviceOrchestrator.on('service:stopped', (service) => {
  console.log(`Service ${service.schema.name} stopped`);
});
```

## ✨ Rich Snippet Engine

### Generating Rich Snippets

```typescript
import { richSnippetEngine } from './src/services/rich-snippet-engine';

// Generate a product snippet
const productSnippet = richSnippetEngine.generateProductSnippet({
  name: 'Premium Product',
  description: 'High-quality product with excellent features',
  price: 99.99,
  currency: 'USD',
  image: 'https://example.com/product.jpg',
});

console.log('Generated:', productSnippet.id);
```

### Injecting into DOM

```typescript
// Inject snippet into a page
await richSnippetEngine.injectSnippet(
  productSnippet.id,
  {
    selector: '.product-container',
    position: 'prepend',
    priority: 1,
  },
  pageInstance // DeepSeek instance page
);
```

### Mining DOM Data

```typescript
// Mine DOM for product/content data
const domData = await richSnippetEngine.mineDOMData(pageInstance);

console.log('Found products:', domData.products);
console.log('Found headings:', domData.headings);
console.log('Found images:', domData.images);
```

### Real-time Analytics

```typescript
// Get snippet analytics
const analytics = await richSnippetEngine.generateAnalytics(snippetSnippet.id);

console.log('Impressions:', analytics.impressions);
console.log('CTR:', analytics.ctr);
console.log('Conversions:', analytics.conversions);
```

### Custom Styling

```typescript
const customStyle = {
  theme: 'modern',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  fontFamily: 'Inter, sans-serif',
  spacing: 'spacious',
  borderRadius: '12px',
  shadows: true,
};

const snippet = richSnippetEngine.generateProductSnippet(productData, customStyle);
```

## 🖥️ CLI Usage

### Bundle Management

```bash
# List all bundles
node cli/service-cli.js bundle:list

# Start a bundle
node cli/service-cli.js bundle:start my-bundle

# Stop a bundle
node cli/service-cli.js bundle:stop my-bundle

# Get bundle status
node cli/service-cli.js bundle:status my-bundle
```

### DeepSeek Instance Management

```bash
# Create an instance
node cli/service-cli.js deepseek:create my-instance --headless --width 1920 --height 1080

# List instances
node cli/service-cli.js deepseek:list

# Send a prompt
node cli/service-cli.js deepseek:prompt my-instance "Analyze this page"

# Stop an instance
node cli/service-cli.js deepseek:stop my-instance
```

### Rich Snippet Generation

```bash
# Generate a product snippet
node cli/service-cli.js snippet:product \
  --name "Premium Product" \
  --price 99.99 \
  --description "High-quality product" \
  --image "https://example.com/product.jpg"

# Generate custom snippet
node cli/service-cli.js snippet:generate article \
  --data '{"title":"My Article","author":"John Doe"}'
```

### System Monitoring

```bash
# Check system health
node cli/service-cli.js health

# Start real-time monitoring
node cli/service-cli.js monitor

# Display system info
node cli/service-cli.js info
```

## 🔄 Integration Patterns

### Full Stack Integration

```typescript
// 1. Create DeepSeek instance
const instance = await deepseekInstanceManager.createInstance('crawler', {
  headless: true,
});

// 2. Navigate to target site
await deepseekInstanceManager.navigate(instance.id, 'https://example.com');

// 3. Mine DOM data
const domData = await richSnippetEngine.mineDOMData(instance.page);

// 4. Generate rich snippets based on mined data
const snippets = domData.products.map(product =>
  richSnippetEngine.generateProductSnippet(product)
);

// 5. Inject snippets back into the page
for (const snippet of snippets) {
  await richSnippetEngine.injectSnippet(snippet.id, {
    selector: '.product-grid',
    position: 'append',
  }, instance.page);
}

// 6. Send to DeepSeek for optimization
const optimization = await deepseekInstanceManager.sendPrompt(
  instance.id,
  'Analyze these rich snippets for SEO improvements'
);
```

### Service Worker Integration

```typescript
// Register service worker for real-time updates
const workerSchema = {
  name: 'snippet-updater',
  version: '1.0.0',
  endpoints: [
    {
      path: '/update',
      method: 'POST',
      schema: { snippetId: { type: 'string' }, data: { type: 'object' } },
    },
  ],
  config: {
    instanceType: 'worker',
  },
};

serviceOrchestrator.registerBundle('workers', [workerSchema]);
await serviceOrchestrator.startBundle('workers');
```

## 📊 Advanced Features

### Custom Console Themes

Create your own console theme:

```typescript
import { ConsoleFormatter, ConsoleTheme } from './src/config/console-config';
import chalk from 'chalk';

const customTheme: ConsoleTheme = {
  primary: chalk.hex('#6366f1'),
  secondary: chalk.hex('#8b5cf6'),
  success: chalk.hex('#10b981'),
  warning: chalk.hex('#f59e0b'),
  error: chalk.hex('#ef4444'),
  info: chalk.hex('#3b82f6'),
  highlight: chalk.hex('#ec4899'),
  dim: chalk.hex('#6b7280'),
};

const formatter = new ConsoleFormatter({ theme: customTheme });
```

### Event-driven Architecture

```typescript
// Set up comprehensive event listeners
deepseekInstanceManager.on('instance:created', handleInstanceCreated);
deepseekInstanceManager.on('message', handleMessage);
deepseekInstanceManager.on('error', handleError);

serviceOrchestrator.on('bundle:started', handleBundleStarted);
serviceOrchestrator.on('service:unhealthy', handleUnhealthyService);

richSnippetEngine.on('snippet:generated', handleSnippetGenerated);
richSnippetEngine.on('snippet:injected', handleSnippetInjected);
```

## 🔧 Configuration

### Environment Variables

```bash
# DeepSeek Configuration
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_MAX_INSTANCES=10
DEEPSEEK_TIMEOUT=30000

# Service Configuration
SERVICE_HEALTH_CHECK_INTERVAL=30000
SERVICE_MAX_RESTARTS=3
SERVICE_AUTO_START=true

# Rich Snippet Configuration
SNIPPET_CACHE_SIZE=100
SNIPPET_ENABLE_ANALYTICS=true
```

## 🐛 Troubleshooting

### Common Issues

1. **Instance creation fails**
   - Ensure Chrome/Chromium is installed
   - Check system resources
   - Verify no sandbox issues

2. **Service won't start**
   - Check dependencies are running
   - Verify port availability
   - Review service logs

3. **Snippet injection fails**
   - Verify target selector exists
   - Check page load state
   - Review console for errors

## 📚 API Reference

### Console Formatter

- `formatServiceMessage(service, message, type)` - Format service log messages
- `formatDataStream(service, data, streamType)` - Format data stream output
- `formatServiceBundle(bundleName, services)` - Format service bundle display
- `formatProgress(service, message, progress, total)` - Format progress bars
- `formatInstanceInfo(instanceId, type, status, details)` - Format instance information
- `formatError(service, error)` - Format error messages

### DeepSeek Instance Manager

- `createInstance(id, config)` - Create new instance
- `sendPrompt(instanceId, prompt, context)` - Send AI prompt
- `executeCode(instanceId, code)` - Execute JavaScript
- `navigate(instanceId, url)` - Navigate to URL
- `stopInstance(instanceId)` - Stop instance
- `getInstances()` - Get all instances
- `stopAll()` - Stop all instances

### Service Orchestrator

- `registerBundle(name, schemas, config)` - Register service bundle
- `startBundle(bundleName)` - Start bundle
- `stopBundle(bundleName)` - Stop bundle
- `startService(serviceId)` - Start single service
- `stopService(serviceId)` - Stop single service
- `executeSchemaCall(serviceId, endpoint, data)` - Execute API call
- `getBundleStatus(bundleName)` - Get bundle status
- `getAllBundles()` - Get all bundles

### Rich Snippet Engine

- `generateSnippet(id, config)` - Generate snippet
- `generateProductSnippet(data, style)` - Generate product snippet
- `generateArticleSnippet(data, style)` - Generate article snippet
- `injectSnippet(snippetId, target, pageInstance)` - Inject into DOM
- `mineDOMData(pageInstance)` - Mine DOM data
- `generateAnalytics(snippetId)` - Get analytics
- `updateSnippet(snippetId, data)` - Update snippet

## 🎓 Examples

See the `examples/` directory for complete working examples:

- `examples/console-ux-demo.js` - Console formatting examples
- `examples/deepseek-integration-demo.js` - DeepSeek instance usage
- `examples/service-orchestration-demo.js` - Service management
- `examples/rich-snippet-demo.js` - Rich snippet generation
- `examples/full-stack-integration.js` - Complete integration example

## 📝 License

MIT
