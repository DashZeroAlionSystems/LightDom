# 🎯 Master System Orchestrator - Complete Guide

## Overview

The Master System Orchestrator is the top-level coordination layer that manages all AI-powered autonomous development services and systems in the LightDom platform.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│         Master System Orchestrator (Top Level)          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Coordinates all subsystems:                             │
│  1. System Startup Orchestrator (service lifecycle)     │
│  2. Campaign Management (data mining campaigns)          │
│  3. Smart Navigation (AI workflow decisions)             │
│  4. Codebase Indexing (knowledge graph)                  │
│  5. Autonomous Agents (self-healing code)                │
│  6. Training Data Generation (ML training)               │
│  7. TensorFlow Models (pattern recognition)              │
│  8. Storybook Discovery (component mining)               │
│  9. SEO Mining (schema extraction)                       │
│  10. Anime.js Design (fluid components)                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Basic Usage

```bash
# Start with defaults
npm run master:start

# Start with full automation
npm run master:start:full

# Start in development mode
npm run master:start:dev

# Start in production mode
npm run master:start:production
```

### Programmatic Usage

```javascript
import { MasterSystemOrchestrator } from './services/master-system-orchestrator.js';

const orchestrator = new MasterSystemOrchestrator({
  autoStart: true,
  autoIndex: true,
  autoAgent: true,
  autoCampaign: true,
  mode: 'production',
  database: {
    host: 'localhost',
    port: 5432,
    database: 'lightdom',
  },
  ai: {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
    },
  },
});

// Initialize
await orchestrator.initialize();

// Start all systems
await orchestrator.start();

// Execute workflow
await orchestrator.executeWorkflow('improve_codebase_quality', {
  issues: 50,
  coverage: 0.6,
});

// Start campaign
await orchestrator.startCampaign({
  name: 'Q4 Component Discovery',
  type: 'storybook_discovery',
  goals: { minComponents: 10000 },
  resources: { maxWorkers: 8, maxMemoryMB: 4096 },
});

// Generate training data
await orchestrator.generateTrainingData(1000000);

// Get status
const status = orchestrator.getStatus();
console.log(status);

// Stop (gracefully)
await orchestrator.stop();
```

## Configuration

### Environment Variables

```bash
# Auto-start features
AUTO_INDEX=true          # Auto-index codebase on startup
AUTO_AGENT=true          # Auto-start autonomous agent
AUTO_CAMPAIGN=true       # Auto-start default campaigns

# Environment mode
NODE_ENV=production      # production, development, or testing

# Database
DATABASE_URL=postgresql://localhost/lightdom

# AI Services
DEEPSEEK_API_KEY=your_api_key_here
```

### Configuration Object

```javascript
{
  // Auto-start features
  autoStart: true,        // Auto-start all services
  autoIndex: false,       // Auto-index codebase
  autoAgent: false,       // Auto-start autonomous agent
  autoCampaign: false,    // Auto-start default campaigns
  
  // Operation mode
  mode: 'development',    // 'development', 'production', 'testing'
  
  // Database configuration
  database: {
    host: 'localhost',
    port: 5432,
    database: 'lightdom',
    user: 'postgres',
    password: 'password',
  },
  
  // AI service configuration
  ai: {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseUrl: 'https://api.deepseek.com',
    },
  },
  
  // Service-specific configurations
  services: {
    startup: {
      autoRestart: true,
      healthCheckInterval: 30000,
    },
    campaigns: {
      maxConcurrent: 3,
      defaultPriority: 5,
    },
    training: {
      numSimulations: 1000000,
      parallelWorkers: 8,
    },
    // ... more service configs
  },
}
```

## Features

### 1. System Lifecycle Management

The orchestrator manages the complete lifecycle of all services:

```javascript
// Initialize all services
await orchestrator.initialize();
// → All 10 subsystems initialized

// Start everything
await orchestrator.start();
// → Phase 1: Start core services (DB, API, Frontend)
// → Phase 2: Index codebase (if autoIndex=true)
// → Phase 3: Start campaigns (if autoCampaign=true)
// → Phase 4: Start autonomous agent (if autoAgent=true)
// → Phase 5: Initialize AI models

// Stop gracefully
await orchestrator.stop();
// → Stops in reverse order
// → Saves state before shutdown
```

### 2. Smart Workflow Execution

AI-powered workflow decisions based on context:

```javascript
await orchestrator.executeWorkflow('improve_codebase_quality', {
  issues: 50,
  coverage: 0.6,
  duplicateCode: 0.15,
});

// AI decides:
// 1. Index codebase
// 2. Analyze error patterns
// 3. Fix high-priority issues
// 4. Run tests
// 5. Commit changes
// 6. Create PR
```

### 3. Campaign Orchestration

Manage multiple data mining campaigns:

```javascript
// Storybook discovery campaign
await orchestrator.startCampaign({
  name: 'React Component Discovery',
  type: 'storybook_discovery',
  goals: { minComponents: 5000, quality: 0.9 },
  resources: { maxWorkers: 4, maxMemoryMB: 2048 },
  priority: 8,
});

// SEO mining campaign
await orchestrator.startCampaign({
  name: 'E-commerce Schema Mining',
  type: 'seo_mining',
  goals: { minSites: 1000, schemaTypes: ['Product', 'Review'] },
  resources: { maxWorkers: 2, maxMemoryMB: 1024 },
  priority: 5,
});

// Both run in parallel with resource management
```

### 4. Training Data Generation

Generate massive training datasets:

```javascript
await orchestrator.generateTrainingData(1000000);
// → 1M simulations across multiple workers
// → Discovers 50K+ patterns
// → Creates 10 optimized data highways
// → Exports to JSONL for TensorFlow
```

### 5. Real-Time Monitoring

Monitor system health in real-time:

```javascript
orchestrator.on('status', (status) => {
  console.log(`Services: ${status.metrics.servicesRunning}`);
  console.log(`Campaigns: ${status.metrics.campaignsActive}`);
  console.log(`Agents: ${status.metrics.agentsRunning}`);
});

orchestrator.on('warning', (message) => {
  console.warn(`Warning: ${message}`);
});

orchestrator.on('error', (error) => {
  console.error(`Error: ${error}`);
});
```

## Complete Workflows

### Development Workflow

```bash
# 1. Start system in dev mode
npm run master:start:dev

# 2. Index codebase
AUTO_INDEX=true npm run master:start:dev

# 3. Start autonomous agent for bug fixing
AUTO_AGENT=true npm run master:start:dev

# 4. Full automation
npm run master:start:full
```

### Production Workflow

```bash
# 1. Deploy to production
npm run deploy:production

# 2. Start master orchestrator
npm run master:start:production

# Monitor status
curl http://localhost:3001/api/master/status

# View metrics
curl http://localhost:3001/api/master/metrics
```

### Testing Workflow

```bash
# Run integration tests
npm run test:integration:master

# Test individual subsystems
npm run test:unit
npm run test:integration
```

## API Endpoints

If you integrate the orchestrator with the API server:

```
GET    /api/master/status          - Get system status
GET    /api/master/metrics         - Get metrics
POST   /api/master/start           - Start system
POST   /api/master/stop            - Stop system
POST   /api/master/workflow        - Execute workflow
POST   /api/master/campaign        - Start campaign
GET    /api/master/campaigns       - List active campaigns
POST   /api/master/training        - Generate training data
```

## Deployment

### Using Deployment Script

```bash
# Deploy to staging
node scripts/deploy-master-system.js staging

# Deploy to production
node scripts/deploy-master-system.js production

# Deploy to testing
node scripts/deploy-master-system.js testing
```

### Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

ENV NODE_ENV=production
ENV AUTO_AGENT=true

CMD ["node", "services/master-system-orchestrator.js"]
```

```bash
# Build
docker build -t lightdom-master .

# Run
docker run -e DATABASE_URL=postgresql://... \
           -e DEEPSEEK_API_KEY=... \
           lightdom-master
```

## Performance Metrics

Expected performance characteristics:

- **Startup Time**: 10-30 seconds (depending on auto-features)
- **Service Management**: 99.9%+ uptime with auto-restart
- **Campaign Throughput**: 100K+ operations/second
- **Training Generation**: 1M+ simulations (10-30 minutes)
- **Memory Usage**: 2-8GB (depending on campaigns)
- **CPU Usage**: 50-80% (with parallel processing)

## Troubleshooting

### Issue: Services won't start

```bash
# Check logs
tail -f .deployment-log.json

# Check individual services
npm run orchestrator

# Verify database connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: High memory usage

```javascript
// Reduce parallel workers
const orchestrator = new MasterSystemOrchestrator({
  services: {
    training: {
      parallelWorkers: 4, // Reduce from 8
    },
    campaigns: {
      maxConcurrent: 2, // Reduce from 3
    },
  },
});
```

### Issue: Slow performance

```bash
# Check system resources
top

# Optimize database
psql $DATABASE_URL -c "VACUUM ANALYZE"

# Clear cache
rm -rf node_modules/.cache
```

## Best Practices

1. **Start Small**: Begin with `autoStart: true` but other auto-features disabled
2. **Monitor Metrics**: Watch system status regularly
3. **Resource Limits**: Set appropriate resource limits for campaigns
4. **Graceful Shutdown**: Always use `await orchestrator.stop()`
5. **Error Handling**: Implement error handlers for all events
6. **Logging**: Enable detailed logging in production
7. **Backups**: Regular database backups before major operations
8. **Testing**: Test in staging before production deployment

## Integration with Other Systems

### With Knowledge Graph MCP Server

```javascript
const orchestrator = new MasterSystemOrchestrator({
  services: {
    indexing: {
      mcpServer: {
        host: 'localhost',
        port: 3002,
      },
    },
  },
});
```

### With DeepSeek

```javascript
const orchestrator = new MasterSystemOrchestrator({
  ai: {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: 'deepseek-coder',
      maxTokens: 4096,
    },
  },
});
```

### With Monitoring Systems

```javascript
orchestrator.on('status', (status) => {
  // Send to monitoring system
  prometheus.recordMetric('system_uptime', status.uptime);
  prometheus.recordMetric('services_running', status.metrics.servicesRunning);
});
```

## Conclusion

The Master System Orchestrator provides a unified interface to manage the entire AI-powered autonomous development platform. It coordinates all subsystems, handles lifecycle management, executes intelligent workflows, and provides comprehensive monitoring.

For more information, see:
- `KNOWLEDGE_GRAPH_GUIDE.md` - Code intelligence details
- `ADVANCED_AI_GUIDE.md` - TensorFlow & ML details
- `AUTOMATION_GUIDE.md` - Campaign & workflow details
- `COMPLETE_IMPLEMENTATION_SUMMARY.md` - Full system overview
