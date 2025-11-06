# Examples Directory

This directory contains practical examples demonstrating how to use the LightDom headless API workers and schema-driven development systems.

## Quick Start

```bash
# Install dependencies
npm install

# Run any example
npx tsx examples/complete-integration.ts
```

## Available Examples

### 1. Complete Integration (`complete-integration.ts`)

**Demonstrates:** All systems working together in a realistic workflow

**Features:**
- Service infrastructure setup
- AI-powered component generation
- Worker pool task processing
- System health monitoring
- Graceful shutdown

**Run:**
```bash
npx tsx examples/complete-integration.ts
```

**Duration:** ~10 seconds

---

### 2. Worker Pool (`worker-pool/basic-usage.ts`)

**Demonstrates:** Worker pool for efficient background task processing

**Features:**
- Worker pool initialization
- Task queuing with priorities
- Event-driven monitoring
- Status tracking
- Auto-scaling

**Run:**
```bash
npx tsx examples/worker-pool/basic-usage.ts
```

**Duration:** ~5 seconds

---

### 3. Schema Mapper (`schema-mapper/basic-usage.ts`)

**Demonstrates:** Intelligent component selection from use cases

**Features:**
- Schema loading and management
- Component selection algorithm
- Custom schema creation
- Filtering and statistics
- Use case matching

**Run:**
```bash
npx tsx examples/schema-mapper/basic-usage.ts
```

**Duration:** ~2 seconds

---

### 4. Service Orchestration (`service-orchestration/basic-usage.ts`)

**Demonstrates:** Dynamic service creation and dependency management

**Features:**
- Service factory initialization
- Dependency graph visualization
- Service health monitoring
- Ordered startup/shutdown
- Statistics and metrics

**Run:**
```bash
npx tsx examples/service-orchestration/basic-usage.ts
```

**Duration:** ~3 seconds

---

## Example Output Samples

### Complete Integration

```
🌟 Complete Integration Example

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1: Service Infrastructure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Service Factory ready
✅ Service Linker ready
✅ Started 3 services:
   - Web Crawler Service (worker)
   - DOM Optimization Service (background)
   - API Gateway Service (api)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2: AI-Powered Component Generation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Component generated successfully!
   Name: Dashboard Page
   React Component: DashboardPage
   Code length: 1234 characters
   Tests included: Yes
   Styles included: Yes
   Documentation: Yes
```

### Worker Pool

```
🚀 Worker Pool Example

✅ Worker pool initialized

📝 Added task: task-abc123 (URL: https://example.com)
📝 Added task: task-def456 (URL: https://github.com)

📊 Status: { workers: 2, queueSize: 0, activeTasks: 2, ... }
✅ Task completed: task-abc123
✅ Task completed: task-def456

✨ All tasks processed!
```

## Configuration

Examples use default configurations but can be customized via environment variables:

```bash
# Worker Pool
export WORKER_MAX_COUNT=8
export WORKER_MIN_COUNT=2
export WORKER_TIMEOUT=30000

# Dev Container
export DEV_CONTAINER_PORT=3100
export DEV_CONTAINER_CODE_DIR=./src

# Service Factory
export SERVICE_AUTO_START=true
```

## Troubleshooting

### Issue: Module not found

**Solution:**
```bash
npm install
```

### Issue: TypeScript errors

**Solution:**
```bash
# Use tsx runtime
npx tsx examples/your-example.ts

# Or compile first
npm run build
node dist/examples/your-example.js
```

### Issue: Worker scripts not found

**Solution:**
```bash
# Ensure worker scripts exist
ls electron/workers/puppeteer-worker.js
```

### Issue: Port already in use

**Solution:**
```bash
# Change port in environment
export DEV_CONTAINER_PORT=3200
npx tsx examples/dev-container/basic-usage.ts
```

## Learn More

- **Documentation:** See `HEADLESS_WORKERS_README.md`
- **Quick Start:** See `QUICK_START_HEADLESS.md`
- **Testing:** See `TESTING_AND_EXAMPLES.md`
- **Research:** See `HEADLESS_API_RESEARCH.md`

## Next Examples (Coming Soon)

- [ ] Dev container with live preview
- [ ] Neural component builder advanced usage
- [ ] Custom worker implementation
- [ ] Service plugin development
- [ ] Performance optimization techniques

## Contributing

To add a new example:

1. Create file in appropriate subdirectory
2. Follow the existing example structure
3. Add entry to this README
4. Include comments and console output
5. Test the example works independently

## Support

For questions or issues with examples:
- Open a GitHub issue
- Tag with `examples` label
- Include error output and environment details

---

**Examples ready to run!** Choose one above and start exploring. 🚀
