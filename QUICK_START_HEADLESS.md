# Quick Start Guide - Headless API Workers & Dev Container

## 🚀 Quick Start (5 minutes)

### Prerequisites

- Node.js 18+ installed
- Git installed
- 4GB+ RAM available

### Installation

```bash
# Clone and install
git clone https://github.com/DashZeroAlionSystems/LightDom.git
cd LightDom
npm install

# Note: If Puppeteer/Playwright downloads fail in CI/CD, use:
PUPPETEER_SKIP_DOWNLOAD=1 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install
```

### Option 1: Dev Container (Recommended)

Launch the development container with live preview:

```bash
# Start dev container
node start-dev-container.js

# Or add to package.json and use:
npm run dev-container
```

Then open http://localhost:3100 in your browser.

**Features you'll get:**
- ✅ Split-view interface (code on left, preview on right)
- ✅ Hot reload - changes appear instantly
- ✅ Schema browser - browse and select components
- ✅ Component generator - describe what you need, get code
- ✅ Live logs and connection status

### Option 2: Worker Pool Only

Use the worker pool for background tasks:

```typescript
import WorkerPoolManager from './src/services/WorkerPoolManager';

const pool = new WorkerPoolManager({
  type: 'puppeteer',
  maxWorkers: 4,
  minWorkers: 1,
  poolingStrategy: 'least-busy',
});

await pool.initialize();

// Add a crawling task
const taskId = await pool.addTask({
  type: 'crawl',
  data: { url: 'https://example.com' },
  priority: 5,
});

console.log('Task queued:', taskId);
```

### Option 3: Schema Component Mapper Only

Use intelligent component selection:

```typescript
import SchemaComponentMapper from './src/schema/SchemaComponentMapper';

const mapper = new SchemaComponentMapper();
await mapper.initialize();

// Describe what you need
const match = await mapper.selectComponent(
  'I need a dashboard with analytics charts and data tables'
);

console.log('Best component:', match.schema.name);
console.log('React component:', match.schema['lightdom:reactComponent']);
console.log('Reasons:', match.reasons);
```

## 📖 Step-by-Step Tutorial

### Tutorial 1: Using the Dev Container

**Step 1: Start the container**
```bash
node start-dev-container.js
```

**Step 2: Open in browser**
Navigate to http://localhost:3100

**Step 3: Try the schema browser**
1. Click the dropdown in the right pane
2. Select "Schema"
3. Browse the available components
4. Click on any component to use it

**Step 4: Find a component**
1. Click "🔍 Select Component" button
2. Type: "I need a product card for an e-commerce site"
3. Click "Find Component"
4. Click "Use This Component"
5. See the generated code in the editor!

**Step 5: Switch views**
1. Click "↔️ Toggle Layout" to switch between horizontal/vertical
2. Use the dropdowns in each pane to switch between Code/Preview/Schema

### Tutorial 2: Creating Custom Schemas

**Step 1: Create a schema file**

Create `schemas/components/video-player.json`:

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "@id": "lightdom:video-player",
  "name": "Video Player",
  "description": "Responsive video player with controls",
  "lightdom:componentType": "organism",
  "lightdom:reactComponent": "VideoPlayer",
  "lightdom:props": [
    {
      "name": "src",
      "type": "string",
      "required": true,
      "description": "Video source URL"
    },
    {
      "name": "autoplay",
      "type": "boolean",
      "required": false,
      "default": false,
      "description": "Auto-play video"
    },
    {
      "name": "controls",
      "type": "boolean",
      "required": false,
      "default": true,
      "description": "Show video controls"
    }
  ],
  "lightdom:linkedSchemas": [],
  "lightdom:useCase": ["video", "media", "player", "streaming"],
  "lightdom:semanticMeaning": "Plays video content with standard controls",
  "lightdom:priority": 7,
  "lightdom:category": "organism"
}
```

**Step 2: Restart dev container**
```bash
# Press Ctrl+C to stop
node start-dev-container.js
```

**Step 3: Use your new schema**
1. Open http://localhost:3100
2. Click "🔍 Select Component"
3. Type: "I need a video player"
4. Your new schema will be suggested!

### Tutorial 3: Using the Worker Pool

**Step 1: Create a worker script**

Create `my-worker-test.js`:

```javascript
import WorkerPoolManager from './src/services/WorkerPoolManager.js';

async function main() {
  const pool = new WorkerPoolManager({
    type: 'puppeteer',
    maxWorkers: 4,
    minWorkers: 2,
    timeout: 30000,
  });

  await pool.initialize();

  // Monitor events
  pool.on('taskCompleted', ({ taskId, result }) => {
    console.log('✅ Task completed:', taskId);
    console.log('Result:', result);
  });

  pool.on('taskFailed', ({ taskId, error }) => {
    console.error('❌ Task failed:', taskId, error);
  });

  // Add multiple tasks
  const tasks = [
    'https://example.com',
    'https://github.com',
    'https://www.npmjs.com',
  ];

  for (const url of tasks) {
    await pool.addTask({
      type: 'crawl',
      data: { url },
      priority: Math.floor(Math.random() * 10),
    });
  }

  console.log('✅ All tasks queued!');
  console.log('Status:', pool.getStatus());

  // Wait for completion
  await new Promise(resolve => setTimeout(resolve, 60000));

  await pool.shutdown();
}

main();
```

**Step 2: Run it**
```bash
node my-worker-test.js
```

## 🎯 Common Use Cases

### Use Case 1: Component Discovery

**Scenario:** You need a component but don't know what's available.

**Solution:**
1. Open Dev Container: `node start-dev-container.js`
2. Navigate to http://localhost:3100
3. In right pane, select "Schema" from dropdown
4. Browse all available components
5. Click on components to see details and use them

### Use Case 2: Batch Web Scraping

**Scenario:** You need to crawl 100 websites efficiently.

**Solution:**
```typescript
const pool = new WorkerPoolManager({ maxWorkers: 10 });
await pool.initialize();

const urls = [...]; // Your 100 URLs

for (const url of urls) {
  await pool.addTask({
    type: 'crawl',
    data: { url },
    priority: 5,
  });
}

// Workers will process in parallel!
```

### Use Case 3: AI-Driven Component Selection

**Scenario:** Neural network needs to select appropriate components.

**Solution:**
```typescript
const mapper = new SchemaComponentMapper();
await mapper.initialize();

// Neural network provides use case description
const aiDescription = neuralNet.generateUseCase();

// Mapper finds best component
const match = await mapper.selectComponent(aiDescription);

// Use the component
const code = generateComponentCode(match.schema);
```

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
# Dev Container
DEV_CONTAINER_PORT=3100
DEV_CONTAINER_CODE_DIR=./src
DEV_CONTAINER_HOT_RELOAD=true
DEV_CONTAINER_SCHEMA_VALIDATION=true
DEV_CONTAINER_LAYOUT=horizontal

# Worker Pool
WORKER_TYPE=puppeteer
WORKER_MAX_COUNT=8
WORKER_MIN_COUNT=2
WORKER_TIMEOUT=60000
WORKER_RETRIES=3
```

### Add to package.json

```json
{
  "scripts": {
    "dev-container": "node start-dev-container.js",
    "worker-pool": "node my-worker-test.js"
  }
}
```

## 📚 Resources

- **Full Documentation:** [HEADLESS_WORKERS_README.md](./HEADLESS_WORKERS_README.md)
- **Research Document:** [HEADLESS_API_RESEARCH.md](./HEADLESS_API_RESEARCH.md)
- **API Reference:** See HEADLESS_WORKERS_README.md#api-endpoints
- **Examples:** Check the `examples/` directory (coming soon)

## 🐛 Troubleshooting

### Problem: Dev container won't start

**Error:** `Port 3100 is already in use`

**Solution:**
```bash
# Find process using port 3100
lsof -i :3100  # On Mac/Linux
netstat -ano | findstr :3100  # On Windows

# Kill the process or use different port
DEV_CONTAINER_PORT=3200 node start-dev-container.js
```

### Problem: Workers not processing tasks

**Error:** Workers stuck in "starting" state

**Solution:**
1. Check worker script exists: `electron/workers/puppeteer-worker.js`
2. Verify Puppeteer is installed: `npm list puppeteer`
3. Check available memory: Worker needs ~200MB each
4. Review logs for errors

### Problem: Schema validation failing

**Error:** "Schema mapper not enabled"

**Solution:**
```typescript
// Ensure schema validation is enabled
const devContainer = new DevContainerManager({
  enableSchemaValidation: true,  // ← Add this
  schemaDir: './schemas/components'
});
```

## 🎓 Next Steps

1. **Read the full documentation:** [HEADLESS_WORKERS_README.md](./HEADLESS_WORKERS_README.md)
2. **Review research findings:** [HEADLESS_API_RESEARCH.md](./HEADLESS_API_RESEARCH.md)
3. **Create custom schemas:** Add to `schemas/components/`
4. **Integrate with your app:** Use the Worker Pool in your services
5. **Build components:** Use Dev Container for rapid development

## 💡 Tips

- **Hot Reload:** Works best with small files (< 1MB)
- **Worker Count:** Set to 2-4 workers per CPU core
- **Schema Priority:** Higher priority (8-10) = more likely to be selected
- **Use Cases:** Add lots of keywords to improve matching
- **Linked Schemas:** Connect related components for better selection

## 🚀 Happy Building!

You're now ready to use LightDom's advanced headless API workers and schema-driven development system!

For questions or issues, check the documentation or open an issue on GitHub.
