# Testing & Examples Guide

## Overview

This document provides comprehensive information about testing and examples for the LightDom headless API workers and schema-driven development system.

## Test Suite

### Integration Tests

Located in `tests/integration/`, these tests validate the complete functionality of each system.

#### WorkerPoolManager Tests (`WorkerPoolManager.test.ts`)

Tests the worker pool lifecycle and task execution:

- ✅ Initialization with minimum workers
- ✅ Task queuing and priority handling
- ✅ Worker auto-scaling based on load
- ✅ Status reporting
- ✅ Error handling and recovery
- ✅ Different pooling strategies (round-robin, least-busy, random)
- ✅ Retry mechanism
- ✅ Resource cleanup on shutdown

**Run tests:**
```bash
npm test tests/integration/WorkerPoolManager.test.ts
```

#### SchemaComponentMapper Tests (`SchemaComponentMapper.test.ts`)

Tests component selection and schema management:

- ✅ Default schema loading (6 schemas)
- ✅ Component selection from use cases
- ✅ Scoring and matching algorithm
- ✅ Context-aware selection
- ✅ Component filtering by type and category
- ✅ Custom schema creation and persistence
- ✅ Statistics calculation
- ✅ Event emission on updates
- ✅ Linked schema handling

**Run tests:**
```bash
npm test tests/integration/SchemaComponentMapper.test.ts
```

#### ServiceOrchestration Tests (`ServiceOrchestration.test.ts`)

Tests service factory and linker integration:

**SchemaServiceFactory:**
- ✅ Default service schema loading (3 services)
- ✅ Service creation from schemas
- ✅ Duplicate service prevention
- ✅ Service listing (all, running)
- ✅ Statistics calculation
- ✅ Service stop/start operations

**ServiceLinker:**
- ✅ Dependency graph building
- ✅ Dependency detection and listing
- ✅ Circular dependency validation
- ✅ Dependency depth calculation
- ✅ Service health monitoring
- ✅ Start/stop readiness checks
- ✅ Graph visualization data export
- ✅ Statistics reporting

**Integrated Workflow:**
- ✅ Services start in dependency order
- ✅ Services stop in reverse dependency order
- ✅ Error handling and system resilience

**Run tests:**
```bash
npm test tests/integration/ServiceOrchestration.test.ts
```

### Running All Tests

```bash
# Run all integration tests
npm test tests/integration/

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Examples

### 1. Worker Pool Example

**Location:** `examples/worker-pool/basic-usage.ts`

Demonstrates:
- Worker pool initialization with configuration
- Event listener setup for monitoring
- Adding tasks with different priorities
- Status monitoring
- Graceful shutdown

**Run:**
```bash
npx tsx examples/worker-pool/basic-usage.ts
```

**Output:**
```
🚀 Worker Pool Example

1. Initializing worker pool...
✅ Worker pool initialized

2. Setting up event listeners...

3. Adding tasks to the pool...
   📝 Added task: task-123... (URL: https://example.com)
   📝 Added task: task-456... (URL: https://github.com)
   ...

4. Monitoring pool status...
   📊 Status: { workers: 2, queueSize: 3, activeTasks: 2, ... }
   ✅ Task completed: task-123...
   ...

✨ All tasks processed!
```

### 2. Schema Mapper Example

**Location:** `examples/schema-mapper/basic-usage.ts`

Demonstrates:
- Schema mapper initialization
- Listing available schemas
- Component selection from use cases
- Filtering by type and category
- Adding custom schemas
- Retrieving specific components

**Run:**
```bash
npx tsx examples/schema-mapper/basic-usage.ts
```

**Output:**
```
🎨 Schema Component Mapper Example

1. Initializing Schema Component Mapper...
✅ Mapper initialized

2. Available component schemas:
   1. Dashboard Page (WebPage)
      Type: page
      Use cases: analytics, dashboard, metrics, monitoring
   ...

4. Testing component selection with various use cases:
   📝 Use Case: "I need a dashboard with analytics charts and metrics"
   ✅ Best Match: Dashboard Page
      Score: 95
      React Component: DashboardPage
      Reasons: Matched 3 use case keywords, Priority score: 8, ...
```

### 3. Service Orchestration Example

**Location:** `examples/service-orchestration/basic-usage.ts`

Demonstrates:
- Service factory initialization
- Service linker setup
- Dependency graph visualization
- Service startup in dependency order
- Health monitoring
- Service statistics
- Graceful shutdown

**Run:**
```bash
npx tsx examples/service-orchestration/basic-usage.ts
```

**Output:**
```
🔧 Service Orchestration Example

1. Initializing Service Factory...
✅ Service Factory initialized

2. Available service schemas:
   1. Web Crawler Service
      ID: lightdom:crawler-service
      Type: worker
      Priority: 8
      ...

7. Starting services in dependency order...
✅ Services started

8. Checking service health:
   Web Crawler Service:
      Status: running
      Healthy: ✅
      Dependencies: 1
         - lightdom:optimization-service: ✅ (running)
```

### 4. Complete Integration Example

**Location:** `examples/complete-integration.ts`

Demonstrates all systems working together:

**Part 1: Service Infrastructure**
- Service factory initialization
- Service linker setup
- Services started in dependency order

**Part 2: AI-Powered Component Generation**
- Schema mapper initialization
- Neural component builder setup
- Component generation from use case
- Code, tests, styles, and documentation generation

**Part 3: Worker Pool Task Processing**
- Worker pool initialization
- Task queuing with priorities
- Status monitoring

**Part 4: System Health Check**
- Service health status
- Component mapper statistics
- Service factory statistics

**Part 5: System Cleanup**
- Worker pool shutdown
- Services stopped in reverse order
- Factory cleanup

**Run:**
```bash
npx tsx examples/complete-integration.ts
```

**Output:**
```
🌟 Complete Integration Example

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1: Service Infrastructure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1.1 Initializing Service Factory...
✅ Service Factory ready
...

✨ Complete integration example finished successfully!

Systems demonstrated:
  ✅ Service Factory - Dynamic service creation
  ✅ Service Linker - Dependency management
  ✅ Schema Mapper - Intelligent component selection
  ✅ Neural Builder - AI-powered code generation
  ✅ Worker Pool - Efficient task processing

All systems integrated and working together! 🎉
```

## Test Coverage Goals

| Component | Target Coverage | Current |
|-----------|----------------|---------|
| WorkerPoolManager | 80% | TBD |
| SchemaComponentMapper | 85% | TBD |
| SchemaServiceFactory | 80% | TBD |
| ServiceLinker | 85% | TBD |
| NeuralComponentBuilder | 75% | TBD |
| DevContainerManager | 70% | TBD |

## Continuous Integration

Tests are run automatically on:
- Pull requests
- Commits to main branch
- Scheduled daily runs

CI Configuration: `.github/workflows/test.yml`

## Performance Benchmarks

Location: `tests/benchmarks/` (to be added)

Planned benchmarks:
- Worker pool task throughput
- Component selection latency
- Service startup time
- Dependency resolution performance
- Code generation speed

## Best Practices

### Writing Tests

1. **Use descriptive test names:**
   ```typescript
   it('should select dashboard for analytics use case', async () => {
     // ...
   });
   ```

2. **Test one thing at a time:**
   - Each test should verify a single behavior
   - Avoid complex setup that tests multiple things

3. **Clean up after tests:**
   ```typescript
   afterAll(async () => {
     await cleanup();
   });
   ```

4. **Use realistic data:**
   - Use actual URLs, use cases, and configurations
   - Avoid overly simplified test data

### Running Examples

1. **Install dependencies first:**
   ```bash
   npm install
   ```

2. **Set environment variables if needed:**
   ```bash
   export WORKER_MAX_COUNT=4
   export DEV_CONTAINER_PORT=3100
   ```

3. **Run with proper runtime:**
   ```bash
   # TypeScript examples
   npx tsx examples/complete-integration.ts
   
   # Or compile first
   npm run build
   node dist/examples/complete-integration.js
   ```

## Troubleshooting

### Tests Failing

**Issue:** Worker pool tests fail with "Worker not found"

**Solution:** Ensure worker scripts exist:
```bash
ls electron/workers/puppeteer-worker.js
```

**Issue:** Schema tests fail with "Schema directory not found"

**Solution:** Create schema directory:
```bash
mkdir -p schemas/components
```

### Examples Not Running

**Issue:** `Module not found` errors

**Solution:** Install dependencies:
```bash
npm install
```

**Issue:** TypeScript errors

**Solution:** Use tsx runtime:
```bash
npm install -g tsx
npx tsx examples/complete-integration.ts
```

## Contributing

When adding new features:

1. ✅ Write integration tests
2. ✅ Create usage examples
3. ✅ Update this documentation
4. ✅ Ensure tests pass in CI
5. ✅ Update coverage reports

## Resources

- **Test Framework:** Vitest
- **Test Utilities:** @testing-library
- **TypeScript Runtime:** tsx
- **Coverage Tool:** c8

## Next Steps

- [ ] Add unit tests for individual functions
- [ ] Create performance benchmarks
- [ ] Add E2E tests for dev container
- [ ] Implement visual regression tests
- [ ] Add load testing for worker pool
- [ ] Create mutation testing suite

---

**Last Updated:** 2025-11-01  
**Status:** Integration tests and examples complete
