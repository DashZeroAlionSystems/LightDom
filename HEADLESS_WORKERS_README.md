# Headless API Workers & Modular React App Dev Container

## Overview

This package provides advanced headless browser automation, worker management, and schema-driven component development for the LightDom platform.

**Latest Update (November 2025)**: Enhanced with WebDriver BiDi support and attribute-based data mining capabilities.

## What's New

### WebDriver BiDi Integration

LightDom now supports the **WebDriver BiDi** protocol, a modern W3C standard for bidirectional browser automation:

- ✅ **Cross-browser compatibility** - Works with Chrome, Firefox, Edge, and Safari
- ✅ **Real-time event streaming** - Bidirectional communication for instant feedback
- ✅ **Better performance** - Reduced latency and more efficient resource monitoring
- ✅ **Future-proof** - Industry standard backed by all major browsers

### Attribute-Based Data Mining

New intelligent data mining system that allows targeting specific attributes across multiple instances:

- 🎯 **Attribute-specific workers** - Dedicated browser instances for each data type
- 🔄 **Selector fallback chains** - Multiple extraction strategies with automatic fallback
- ✅ **Pattern matching** - Regex-based extraction when selectors fail
- 📊 **Validation** - Built-in data validation for quality assurance
- 🚀 **Parallel extraction** - Mine multiple attributes simultaneously

### Social Media Image Generation

Generate dynamic Open Graph images for social media previews:

- 🖼️ **Custom templates** - HTML/CSS based image generation
- 📐 **Standard dimensions** - Pre-configured for Facebook, Twitter, LinkedIn
- ⚡ **High performance** - Caching and batch generation support
- 🎨 **Custom fonts** - Load custom web fonts for branding

## Quick Start

### Using WebDriver BiDi in Electron

```javascript
// In your Electron renderer process
const { worker } = window.electronAPI;

// Create an attribute-specific worker with BiDi support
const result = await worker.createAttributeWorker('productPrice', {
  useBiDi: true
});

console.log('Worker created:', result.workerId);
```

### Mining Attributes

```javascript
// Mine a specific attribute from a webpage
const result = await window.electronAPI.puppeteer.mineAttribute({
  url: 'https://example.com/product',
  attribute: {
    name: 'price',
    selectors: [
      '.price-main',
      '[data-testid="price"]',
      '.product-price span',
      'span.price'
    ],
    type: 'text',
    waitFor: '.price-container',
    pattern: '\\$([0-9,.]+)',
    validator: {
      type: 'string',
      pattern: '^\\$[0-9,.]+$'
    }
  }
});

if (result.success) {
  console.log('Extracted price:', result.data);
} else {
  console.error('Extraction failed:', result.error);
}
```

### Generating OG Images

```javascript
// Generate a social media preview image
const ogImage = await window.electronAPI.puppeteer.generateOGImage({
  template: `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: Arial, sans-serif;
            color: white;
          }
          h1 {
            font-size: 64px;
            margin: 0 0 20px 0;
          }
          p {
            font-size: 32px;
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <h1>{{title}}</h1>
        <p>{{description}}</p>
      </body>
    </html>
  `,
  data: {
    title: 'LightDom Platform',
    description: 'Next-generation web automation'
  },
  width: 1200,
  height: 630
});

// ogImage.image is base64 encoded PNG
```

### Monitoring Worker Status

```javascript
// Get current worker pool status
const status = await window.electronAPI.worker.getStatus();

console.log('Total workers:', status.total);
console.log('Available:', status.available);
console.log('Busy:', status.busy);

// List all workers
status.workers.forEach(worker => {
  console.log(`Worker ${worker.id}: ${worker.busy ? 'busy' : 'available'}`);
  if (worker.attribute) {
    console.log(`  Dedicated to: ${worker.attribute}`);
  }
});
```

## Features

### 1. Worker Pool Manager

Manages a pool of headless browser workers for efficient task execution with:

- **Multiple Pooling Strategies**: Round-robin, least-busy, random
- **Auto-scaling**: Dynamically adjusts worker count based on load
- **Health Monitoring**: Automatic worker restart on failure
- **Task Queue**: Priority-based task execution with retries
- **Process Isolation**: Each worker runs in a separate process

#### Usage

```typescript
import WorkerPoolManager from './src/services/WorkerPoolManager';

const pool = new WorkerPoolManager({
  type: 'puppeteer',
  maxWorkers: 8,
  minWorkers: 2,
  poolingStrategy: 'least-busy',
  timeout: 60000,
  retries: 3,
});

await pool.initialize();

// Add a task
const taskId = await pool.addTask({
  type: 'crawl',
  data: { url: 'https://example.com' },
  priority: 5,
});

// Monitor events
pool.on('taskCompleted', ({ taskId, result }) => {
  console.log('Task completed:', taskId, result);
});

pool.on('workerError', ({ workerId, error }) => {
  console.error('Worker error:', workerId, error);
});

// Get pool status
const status = pool.getStatus();
console.log('Active workers:', status.workers.length);
console.log('Queue size:', status.queueSize);

// Shutdown
await pool.shutdown();
```

### 2. Schema Component Mapper

Maps use cases to React components using schema.org types and linked schemas:

- **Use Case Analysis**: Keyword extraction and pattern matching
- **Component Scoring**: Semantic similarity and priority-based ranking
- **Schema.org Integration**: Standard vocabulary for components
- **Linked Schemas**: Component dependencies and relationships
- **Extensible**: Add custom schemas via JSON files

#### Usage

```typescript
import SchemaComponentMapper from './src/schema/SchemaComponentMapper';

const mapper = new SchemaComponentMapper();
await mapper.initialize();

// Select component by use case
const match = await mapper.selectComponent(
  'I need a dashboard with charts and analytics',
  { category: 'page' }
);

console.log('Best match:', match.schema.name);
console.log('Score:', match.score);
console.log('Reasons:', match.reasons);

// Get all schemas
const schemas = mapper.getAllSchemas();

// Get components by type
const pages = mapper.getComponentsByType('page');
const organisms = mapper.getComponentsByType('organism');

// Save custom schema
await mapper.saveSchema({
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  '@id': 'lightdom:video-player',
  name: 'Video Player',
  description: 'Responsive video player with controls',
  'lightdom:componentType': 'organism',
  'lightdom:reactComponent': 'VideoPlayer',
  'lightdom:props': [
    { name: 'src', type: 'string', required: true },
    { name: 'autoplay', type: 'boolean', required: false, default: false },
  ],
  'lightdom:linkedSchemas': [],
  'lightdom:useCase': ['video', 'media', 'player'],
  'lightdom:semanticMeaning': 'Plays video content with controls',
  'lightdom:priority': 7,
  'lightdom:category': 'organism',
});
```

### 3. Dev Container with Live Preview

Independent development container with split-view interface:

- **Code Editor**: Syntax-highlighted code editing
- **Live Preview**: Real-time component rendering via headless browser
- **Schema Browser**: Browse and select components from schemas
- **Hot Reload**: Automatic updates on file changes
- **View Switching**: Toggle between code/preview/schema views
- **Layout Control**: Horizontal or vertical split layout

#### Usage

```typescript
import DevContainerManager from './src/dev-container/DevContainerManager';

const devContainer = new DevContainerManager({
  port: 3100,
  codeDir: './src/components',
  enableHotReload: true,
  enableSchemaValidation: true,
  layout: 'horizontal',
});

await devContainer.initialize();
await devContainer.start();

// Access at http://localhost:3100

// Monitor events
devContainer.on('fileChanged', ({ filepath, content }) => {
  console.log('File changed:', filepath);
});

devContainer.on('hotReloadComplete', ({ filepath }) => {
  console.log('Hot reload complete:', filepath);
});

devContainer.on('validationError', ({ filepath, errors }) => {
  console.error('Validation errors:', filepath, errors);
});

// Stop
await devContainer.stop();
```

#### Starting the Dev Container

```bash
# Using Node
node -e "require('./src/dev-container/DevContainerManager').default.start()"

# Or create a start script
npm run dev-container
```

Then open http://localhost:3100 in your browser.

## Architecture

### Worker Pool Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Worker Pool Manager                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Worker 1 │  │ Worker 2 │  │ Worker 3 │  │ Worker 4 │    │
│  │  (Idle)  │  │  (Busy)  │  │  (Busy)  │  │  (Idle)  │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Task Queue (Priority)                │       │
│  │  [Task 1 - P:10] [Task 2 - P:5] [Task 3 - P:3]  │       │
│  └──────────────────────────────────────────────────┘       │
│                                                               │
│  Pooling Strategy: Least-Busy                                │
│  Auto-scaling: 2-8 workers                                   │
│  Health Monitoring: Every 30s                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Schema Component Mapper Flow

```
Use Case Input
     │
     ▼
┌─────────────────┐
│ Analyze Use Case│
│  - Extract Keywords
│  - Match Patterns
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Match Schemas   │
│  - Filter by @type
│  - Check use cases
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Score Components│
│  - Keyword match
│  - Semantic similarity
│  - Priority
│  - Context
└────────┬────────┘
         │
         ▼
  Best Match Component
```

### Dev Container Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Dev Container UI (Browser)                 │
├──────────────────────┬──────────────────────────────────────┤
│   Code Editor Pane   │        Live Preview Pane             │
│  - Syntax highlight  │  - Headless browser                  │
│  - File browser      │  - Real-time rendering               │
│  - Schema selector   │  - Console output                    │
└──────────────────────┴──────────────────────────────────────┘
           │                            │
           ▼                            ▼
    ┌─────────────┐           ┌──────────────────┐
    │ File Watcher│           │ Headless Browser │
    │  (Chokidar) │           │   (Puppeteer)    │
    └──────┬──────┘           └────────┬─────────┘
           │                           │
           └───────────┬───────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Express + Socket │
              │   Dev Container  │
              │     Manager      │
              └─────────────────┘
```

## Default Component Schemas

The system comes with these default component schemas:

1. **Dashboard Page** - Full dashboard with analytics and metrics
2. **Article Component** - Article display with header, content, metadata
3. **Product Card** - Product display for e-commerce
4. **Data Table** - Sortable, filterable data table
5. **Chart Component** - Data visualization (line, bar, pie, etc.)
6. **Button** - Basic button component

## Schema Format

Component schemas follow schema.org vocabulary with LightDom extensions:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "lightdom:dashboard-page",
  "name": "Dashboard Page",
  "description": "Full dashboard page with analytics and metrics",
  
  "lightdom:componentType": "page",
  "lightdom:reactComponent": "DashboardPage",
  "lightdom:props": [
    {
      "name": "title",
      "type": "string",
      "required": true,
      "description": "Page title"
    }
  ],
  "lightdom:linkedSchemas": [
    "lightdom:chart-component",
    "lightdom:data-table-component"
  ],
  "lightdom:useCase": ["analytics", "dashboard", "metrics"],
  "lightdom:semanticMeaning": "Displays aggregate data and visualizations",
  "lightdom:priority": 8,
  "lightdom:category": "page"
}
```

## Integration with LightDom

### Existing Services Integration

The Worker Pool Manager integrates with:

- `src/routes/headless.ts` - Headless API endpoints
- `src/services/BackgroundWorkerService.js` - Background task execution
- `electron/workers/puppeteer-worker.js` - Puppeteer worker processes

### Schema Integration

The Schema Component Mapper integrates with:

- `linked-schema-training-data.js` - Existing linked schema storage
- `src/routes/headless.ts` - Component selection API
- Neural network component builder (future)

## API Endpoints

### Worker Pool (via HeadlessRoutes)

- `POST /api/headless/worker/job` - Add job to worker pool
- `GET /api/headless/worker/queue/:queueName/status` - Get queue status

### Dev Container

- `GET /api/status` - Get container status
- `GET /api/view-state` - Get current view configuration
- `POST /api/view-state` - Update view configuration
- `POST /api/execute` - Execute code in preview browser
- `POST /api/validate` - Validate code syntax
- `GET /api/schemas` - Get all component schemas
- `POST /api/select-component` - Select component by use case
- `GET /api/files` - Get file tree
- `GET /api/file/:filepath` - Get file content
- `POST /api/file/:filepath` - Save file content

## WebSocket Events

### Dev Container Events

**Client → Server:**
- `switchView` - Switch view in a pane
- `executeCode` - Execute code in browser
- `disconnect` - Client disconnected

**Server → Client:**
- `fileChanged` - File was modified
- `viewStateChanged` - View configuration updated
- `executionResult` - Code execution result

## Configuration

### Environment Variables

```env
# Worker Pool
WORKER_TYPE=puppeteer  # or playwright
WORKER_MAX_COUNT=8
WORKER_MIN_COUNT=2
WORKER_TIMEOUT=60000
WORKER_RETRIES=3

# Dev Container
DEV_CONTAINER_PORT=3100
DEV_CONTAINER_CODE_DIR=./src
DEV_CONTAINER_HOT_RELOAD=true
DEV_CONTAINER_SCHEMA_VALIDATION=true
```

## Performance Considerations

### Worker Pool

- **Memory**: Each worker consumes ~100-200MB of RAM
- **CPU**: Scales linearly with worker count
- **Recommended**: 2-4 workers per CPU core
- **Task Timeout**: Set based on expected task duration (default: 60s)

### Dev Container

- **Browser Memory**: ~200-300MB for headless browser
- **File Watching**: Minimal overhead with chokidar
- **Hot Reload**: <100ms for small files, <500ms for large files
- **WebSocket**: Low latency real-time communication

## Security

### Worker Pool

- Process isolation prevents worker crashes from affecting pool
- Task timeout prevents runaway processes
- Automatic worker restart on errors
- Clean shutdown handling

### Dev Container

- File access restricted to configured code directory
- No arbitrary code execution without explicit API call
- CORS configured for controlled access
- Input validation on all endpoints

## Testing

```bash
# Test worker pool
npm test src/services/WorkerPoolManager.test.ts

# Test schema mapper
npm test src/schema/SchemaComponentMapper.test.ts

# Test dev container
npm test src/dev-container/DevContainerManager.test.ts

# Integration tests
npm run test:integration
```

## Troubleshooting

### Worker Pool Issues

**Workers not starting:**
- Check worker script path exists
- Verify Node.js version (18+)
- Check available memory

**Tasks timing out:**
- Increase timeout value
- Check task complexity
- Monitor worker health

### Dev Container Issues

**Preview not updating:**
- Check file watcher is running
- Verify hot reload is enabled
- Check browser console for errors

**Schema validation failing:**
- Verify schema directory exists
- Check schema JSON format
- Review validation errors in logs

**WebDriver BiDi not working:**
- Ensure Puppeteer version is 21.0.0 or higher
- Check browser version supports BiDi (Chrome 117+, Firefox 119+)
- Verify `useBiDi: true` is set in worker options
- Check logs for protocol initialization errors

**Attribute mining returning null:**
- Verify selectors are correct for target website
- Check if waitFor selector exists on page
- Review fallback selector chain
- Test pattern regex separately
- Check if site requires authentication or has anti-bot protection

## Architecture

### Worker Process Model

```
┌─────────────────────────────────────────────────────────┐
│                  Electron Main Process                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │          Worker Pool Manager                       │ │
│  │  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │  Worker 0    │  │  Worker 1    │  General      │ │
│  │  │  (General)   │  │  (General)   │  Workers      │ │
│  │  └──────────────┘  └──────────────┘               │ │
│  │                                                    │ │
│  │  ┌──────────────┐  ┌──────────────┐               │ │
│  │  │  Worker 2    │  │  Worker 3    │  Attribute   │ │
│  │  │ (Price)      │  │ (Title)      │  Workers     │ │
│  │  └──────────────┘  └──────────────┘               │ │
│  └────────────────────────────────────────────────────┘ │
│                           │                              │
│                           ▼                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │            IPC Communication Layer                 │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │   Renderer Process      │
         │   (React Application)   │
         └─────────────────────────┘
```

### WebDriver BiDi Protocol Flow

```
1. Worker Initialization
   ├─ Launch browser with protocol: 'webDriverBiDi'
   ├─ Setup event handlers for real-time monitoring
   └─ Register BiDi event listeners

2. Task Execution
   ├─ Receive task from main process
   ├─ Navigate to target URL
   ├─ BiDi events stream in real-time:
   │  ├─ network.responseReceived
   │  ├─ log.entryAdded
   │  └─ performance.metricUpdated
   └─ Return results to main process

3. Data Extraction
   ├─ Try primary selector
   ├─ Fallback to secondary selectors
   ├─ Pattern matching if selectors fail
   ├─ Validate extracted data
   └─ Return with success/error status
```

### Attribute Mining Strategy

The attribute mining system uses a **resilient multi-strategy approach**:

1. **Selector Chain** - Try multiple CSS selectors in order
2. **Type-based Extraction** - Extract as text, HTML, attribute, or JSON
3. **Pattern Matching** - Regex fallback for dynamic content
4. **Validation** - Type and format validation
5. **Error Recovery** - Graceful degradation on failure

Example extraction flow:
```javascript
// Priority: Most specific → Most generic
selectors: [
  '[data-testid="product-price"]',  // 1. Test ID (most reliable)
  '.price-box .final-price',        // 2. Class chain
  'span[itemprop="price"]',         // 3. Schema.org microdata
  '.price',                         // 4. Generic class
  /\$\d+\.\d{2}/                    // 5. Regex pattern (fallback)
]
```

## API Reference

### Electron IPC APIs

#### Worker Management

```typescript
// Create attribute-specific worker
window.electronAPI.worker.createAttributeWorker(
  attributeName: string,
  options?: {
    useBiDi?: boolean;
  }
): Promise<{ success: boolean; workerId?: string; error?: string }>

// Get worker pool status
window.electronAPI.worker.getStatus(): Promise<{
  total: number;
  available: number;
  busy: number;
  workers: Array<{
    id: string;
    busy: boolean;
    attribute: string | null;
  }>;
}>

// Execute generic task
window.electronAPI.worker.execute(
  task: {
    type: string;
    options: any;
  }
): Promise<{ success: boolean; result?: any; error?: string }>
```

#### Puppeteer Operations

```typescript
// Mine attribute from webpage
window.electronAPI.puppeteer.mineAttribute(
  options: {
    url: string;
    attribute: {
      name: string;
      selectors: string[];
      type?: 'text' | 'html' | 'attribute' | 'json';
      waitFor?: string;
      pattern?: string;
      validator?: {
        type?: string;
        pattern?: string;
        min?: number;
        max?: number;
        minLength?: number;
        maxLength?: number;
      };
    };
  }
): Promise<{
  success: boolean;
  attribute: string;
  data?: any;
  error?: string;
  url: string;
  timestamp: string;
}>

// Generate Open Graph image
window.electronAPI.puppeteer.generateOGImage(
  options: {
    template: string;
    data: Record<string, any>;
    width?: number;
    height?: number;
  }
): Promise<{
  success: boolean;
  image?: string; // base64 encoded PNG
  dimensions?: { width: number; height: number };
  error?: string;
}>

// Take screenshot
window.electronAPI.puppeteer.screenshot(
  options: {
    url: string;
    fullPage?: boolean;
    timeout?: number;
  }
): Promise<{
  success: boolean;
  screenshot?: string; // base64 encoded
  error?: string;
}>

// Crawl website
window.electronAPI.puppeteer.crawl(
  options: {
    url: string;
    selectors?: Record<string, string>;
    waitFor?: string;
    timeout?: number;
  }
): Promise<{
  success: boolean;
  data?: any;
  metrics?: any;
  error?: string;
}>
```

### Event Listeners

```typescript
// Listen for worker messages
const unsubscribe = window.electronAPI.on.workerMessage((data) => {
  console.log('Worker message:', data);
});

// Listen for attribute worker updates
const unsubscribe = window.electronAPI.on.attributeWorkerMessage((data) => {
  console.log('Attribute worker:', data.attribute, data);
});

// Clean up when component unmounts
unsubscribe();
```

## Best Practices

### 1. Attribute Mining

**Use specific selectors first:**
```javascript
selectors: [
  '[data-testid="price"]',        // Best: Test IDs
  '[itemprop="price"]',           // Good: Microdata
  '.product-price',               // OK: Class names
  'span.price'                    // Last resort: Generic
]
```

**Always provide validation:**
```javascript
validator: {
  type: 'string',
  pattern: '^\\$[0-9,.]+$',  // Must match price format
  minLength: 2,              // At least $X
  maxLength: 20              // Reasonable price length
}
```

**Use waitFor for dynamic content:**
```javascript
attribute: {
  name: 'price',
  waitFor: '.price-container',  // Wait for container first
  selectors: ['.price-main']
}
```

### 2. Worker Management

**Create dedicated workers for high-frequency tasks:**
```javascript
// Create dedicated worker for price monitoring
await worker.createAttributeWorker('price', { useBiDi: true });

// Now all price mining will use this dedicated worker
await puppeteer.mineAttribute({
  url: 'https://example.com',
  attribute: { name: 'price', ... }
});
```

**Monitor worker health:**
```javascript
setInterval(async () => {
  const status = await worker.getStatus();
  if (status.available === 0) {
    console.warn('All workers busy!');
  }
}, 5000);
```

### 3. OG Image Generation

**Cache generated images:**
```javascript
const imageCache = new Map();

async function getOGImage(template, data) {
  const key = JSON.stringify({ template, data });
  
  if (imageCache.has(key)) {
    return imageCache.get(key);
  }
  
  const result = await puppeteer.generateOGImage({ template, data });
  imageCache.set(key, result.image);
  
  return result.image;
}
```

**Use standard dimensions:**
```javascript
// Facebook/LinkedIn
{ width: 1200, height: 630 }

// Twitter
{ width: 1200, height: 675 }

// Instagram
{ width: 1080, height: 1080 }
```

## Performance Tips

1. **Reuse browser instances** - Workers stay alive between tasks
2. **Batch operations** - Group multiple attributes per page load
3. **Use BiDi for real-time monitoring** - Reduces polling overhead
4. **Block unnecessary resources** - Images, fonts, ads are blocked by default
5. **Cache extracted data** - Avoid re-mining unchanged pages
6. **Use dedicated workers** - Better resource allocation for specific tasks

## Research & Documentation

For comprehensive research on WebDriver BiDi and modern web scraping techniques, see:

- [WebDriver BiDi and Puppeteer Research](./docs/research/WEBDRIVER_BIDI_PUPPETEER_RESEARCH.md)
- [Crawler Research & Best Practices](./CRAWLER_RESEARCH.md)
- [Headless API Research](./HEADLESS_API_RESEARCH.md)

## Future Enhancements

- [x] WebDriver BiDi protocol support
- [x] Attribute-based data mining
- [x] Social media image generation
- [ ] Add support for Playwright workers
- [ ] Implement neural network component builder
- [ ] Add code generation from schemas
- [ ] Create visual schema editor
- [ ] Add component testing framework
- [ ] Implement schema versioning
- [ ] Add collaborative editing
- [ ] Create component marketplace
- [ ] AI-powered selector generation
- [ ] Self-healing selector chains
- [ ] Multi-browser testing support

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.
