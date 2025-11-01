# Headless API Workers & Modular React App Dev Container

## Overview

This package provides advanced headless browser automation, worker management, and schema-driven component development for the LightDom platform.

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

## Future Enhancements

- [ ] Add support for Playwright workers
- [ ] Implement neural network component builder
- [ ] Add code generation from schemas
- [ ] Create visual schema editor
- [ ] Add component testing framework
- [ ] Implement schema versioning
- [ ] Add collaborative editing
- [ ] Create component marketplace

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.
