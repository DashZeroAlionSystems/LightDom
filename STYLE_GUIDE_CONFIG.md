# Style Guide Configuration System

Comprehensive default configurations for terminal programs, graphics rendering, metrics tracking, workflow orchestration, DeepSeek learning, and linked schema maps.

## 🎯 Overview

This system provides pre-configured style guides for various scenarios in application development, particularly focused on:

- **Terminal Programs**: Console UX configuration for data display
- **Graphics Rendering**: Visual styling for rich snippets and UI components
- **Metrics & Analytics**: Data points, aggregation, and visualization
- **Workflow Orchestration**: Execution strategies and error handling
- **DeepSeek Learning**: AI skill acquisition and research patterns
- **Linked Schema Maps**: Data structure navigation and visualization

## 📋 Configuration Types

### 1. Terminal Style Configuration

Controls how data is displayed in terminal/console applications.

```typescript
import { defaultTerminalStyle, styleGuideManager } from './src/config/style-guide-config';

// Use default configuration
const terminalConfig = styleGuideManager.getConfig('terminal');

// Customize for your scenario
const customConfig = {
  ...defaultTerminalStyle,
  theme: {
    ...defaultTerminalStyle.theme,
    colors: {
      primary: '#00ff00',  // Custom green
      success: '#00cc00',
      // ... other colors
    }
  }
};
```

**Key Features:**
- **Theme Colors**: 8 semantic colors (primary, secondary, success, warning, error, info, highlight, dim)
- **Formatting Options**: Borders, icons, timestamps, labels, progress bars
- **Layout Control**: Line length, spacing, indentation
- **Output Settings**: Log level, buffer size, color enable/disable

### 2. Graphics Style Configuration

Defines visual styling for rendered components and rich snippets.

```typescript
import { defaultGraphicsStyle } from './src/config/style-guide-config';

// Apply to rich snippet generation
const snippet = richSnippetEngine.generateProductSnippet(data, {
  theme: defaultGraphicsStyle.rendering.theme,
  primaryColor: defaultGraphicsStyle.rendering.primaryColor,
  fontFamily: defaultGraphicsStyle.typography.fontFamily,
  borderRadius: defaultGraphicsStyle.effects.borderRadius,
  shadows: defaultGraphicsStyle.effects.shadows,
});
```

**Key Features:**
- **Rendering Theme**: Modern, classic, minimal, or bold
- **Typography**: Font families, sizes, weights, line height
- **Spacing System**: Base unit with scale multipliers
- **Visual Effects**: Border radius, shadows, animations, transitions

### 3. Metrics Configuration

Defines what data points to track and how to visualize them.

```typescript
import { defaultMetricsConfig } from './src/config/style-guide-config';

// Track performance metrics
const metrics = {
  performance: {
    enabled: true,
    metrics: ['responseTime', 'throughput', 'errorRate'],
    thresholds: {
      good: 0.8,    // 80% = good
      warning: 0.9,  // 90% = warning
      critical: 0.95 // 95% = critical
    }
  }
};
```

**Key Features:**
- **Performance Metrics**: Response time, throughput, error rate, CPU/memory usage
- **Analytics Events**: Page views, user actions, conversions, errors
- **Monitoring**: Interval-based checks with configurable retention
- **Aggregation**: Time-based aggregation with multiple methods (avg, min, max, count)
- **Visualization**: Chart types, colors, update intervals

### 4. Workflow Orchestration Configuration

Controls how workflows are executed and monitored.

```typescript
import { defaultWorkflowOrchestration } from './src/config/style-guide-config';

// Configure service orchestration
serviceOrchestrator.registerBundle('my-bundle', schemas, {
  execution: {
    mode: 'parallel',     // Run services in parallel
    concurrency: 5,       // Max 5 concurrent
    timeout: 300000,      // 5 minute timeout
    retries: 3            // Retry 3 times on failure
  },
  errorHandling: {
    strategy: 'retry',    // Retry on errors
    notifications: true,  // Send notifications
    rollback: true        // Rollback on critical failure
  }
});
```

**Key Features:**
- **Execution Modes**: Sequential, parallel, or mixed
- **Monitoring**: Logs, metrics, and distributed tracing
- **Dependency Management**: Strict or loose resolution
- **Error Handling**: Fail-fast, continue, or retry strategies

### 5. DeepSeek Learning Configuration

Configures how DeepSeek AI learns new skills and manages knowledge.

```typescript
import { defaultDeepSeekLearning } from './src/config/style-guide-config';

// Configure DeepSeek learning
const learningConfig = {
  skills: {
    categories: [
      'nodejs-development',
      'web-automation',
      'data-extraction',
      'api-integration'
    ],
    prioritization: 'frequency',  // Learn frequently-used skills first
    retentionPeriod: 2592000000   // Keep learned skills for 30 days
  },
  research: {
    sources: ['documentation', 'code-repositories', 'technical-blogs'],
    depth: 'medium',
    validation: true  // Validate learned information
  },
  training: {
    mode: 'reinforcement',  // Learn from feedback
    feedbackLoop: true,
    modelUpdate: 'batched'  // Update in batches
  }
};
```

**Key Features:**
- **Skill Categories**: Define what AI should learn
- **Research Sources**: Where AI learns from
- **Training Modes**: Supervised, unsupervised, or reinforcement learning
- **Context Management**: Size limits, compression, relevance scoring

### 6. Linked Maps Configuration

Defines how data structures are connected and visualized.

```typescript
import { defaultLinkedMaps } from './src/config/style-guide-config';

// Configure schema linking
const linkedMaps = {
  structure: {
    nodes: [
      {
        type: 'service',
        properties: ['name', 'version', 'status'],
        connections: ['dependencies', 'consumers']
      }
    ],
    edges: [
      {
        type: 'dependency',
        weight: 1.0,
        bidirectional: false
      }
    ]
  },
  traversal: {
    algorithm: 'bfs',  // Breadth-first search
    maxDepth: 10,
    pruning: true
  }
};
```

**Key Features:**
- **Node Types**: Service, data, workflow nodes with properties
- **Edge Types**: Dependency, dataflow with weights
- **Traversal Algorithms**: BFS, DFS, Dijkstra, A*
- **Visualization**: Hierarchical, force-directed, or circular layouts

## 🎭 Scenario-Specific Configurations

Pre-configured setups for common scenarios:

### Data Mining Research

```typescript
import { scenarioConfigs } from './src/config/style-guide-config';

const config = scenarioConfigs.dataMiningResearch;

// Terminal configured for verbose debugging
// Metrics focused on extraction rate and data quality
// Extended buffer for complex data flows
```

**Optimized for:**
- Verbose logging and debugging
- Data extraction metrics
- Large buffer sizes
- Spacious layout for complex data

### DeepSeek Skill Learning

```typescript
const config = scenarioConfigs.deepSeekSkillLearning;

// Learning categories: nodejs, web-automation, data-extraction
// Deep research with validation
// 90-day retention period
```

**Optimized for:**
- Node.js development skills
- Web automation and scraping
- API integration patterns
- Business logic implementation

### Digital Business Management

```typescript
const config = scenarioConfigs.digitalBusinessManagement;

// Business-focused metrics: revenue, conversions, satisfaction
// Parallel execution with high concurrency
// Comprehensive monitoring and analytics
```

**Optimized for:**
- Business metrics tracking
- Customer journey mapping
- Process optimization
- High-throughput operations

### Workflow Orchestration

```typescript
const config = scenarioConfigs.workflowOrchestration;

// Debug-level logging
// Hierarchical visualization
// Real-time updates
```

**Optimized for:**
- Workflow visualization
- Real-time monitoring
- Dependency tracking
- Performance analysis

## 🛠️ Usage Examples

### Basic Usage

```typescript
import { styleGuideManager } from './src/config/style-guide-config';

// Get default terminal config
const terminalConfig = styleGuideManager.getConfig('terminal');

// Get scenario-specific config
const businessConfig = styleGuideManager.getScenarioConfig('digitalBusinessManagement');

// Merge configurations
const custom = styleGuideManager.mergeConfig(terminalConfig, {
  layout: { maxLineLength: 200 }
});
```

### Integration with Console Formatter

```typescript
import { ConsoleFormatter } from './src/config/console-config';
import { styleGuideManager } from './src/config/style-guide-config';

const terminalConfig = styleGuideManager.getConfig('terminal');

const formatter = new ConsoleFormatter({
  theme: terminalConfig.theme.colors,
  enableTimestamps: terminalConfig.theme.formatting.timestamps,
  enableServiceLabels: terminalConfig.theme.formatting.serviceLabels,
  maxLineLength: terminalConfig.layout.maxLineLength,
});
```

### Integration with Rich Snippet Engine

```typescript
import { richSnippetEngine } from './src/services/rich-snippet-engine';
import { styleGuideManager } from './src/config/style-guide-config';

const graphicsConfig = styleGuideManager.getConfig('graphics');

const snippet = richSnippetEngine.generateProductSnippet(productData, {
  theme: graphicsConfig.rendering.theme,
  primaryColor: graphicsConfig.rendering.primaryColor,
  secondaryColor: graphicsConfig.rendering.secondaryColor,
  fontFamily: graphicsConfig.typography.fontFamily,
  spacing: 'normal',
  borderRadius: graphicsConfig.effects.borderRadius,
  shadows: graphicsConfig.effects.shadows,
});
```

### Integration with Service Orchestrator

```typescript
import { serviceOrchestrator } from './src/services/service-orchestrator';
import { styleGuideManager } from './src/config/style-guide-config';

const workflowConfig = styleGuideManager.getConfig('workflow');

serviceOrchestrator.registerBundle('my-services', schemas, {
  autoStart: true,
  healthCheckInterval: workflowConfig.monitoring.interval,
  restartOnFailure: workflowConfig.errorHandling.strategy === 'retry',
  maxRestarts: workflowConfig.execution.retries,
});
```

### Custom Configuration Management

```typescript
import { StyleGuideManager } from './src/config/style-guide-config';

const manager = new StyleGuideManager();

// Export configuration
const jsonConfig = manager.exportConfig('terminal');
fs.writeFileSync('terminal-config.json', jsonConfig);

// Import configuration
const imported = fs.readFileSync('custom-config.json', 'utf8');
manager.importConfig('custom', imported);

// Use imported config
const customConfig = manager.getConfig('custom');
```

## 📊 Configuration Reference

### Terminal Style Config

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `theme.colors.primary` | string | `#3b82f6` | Primary brand color |
| `theme.colors.success` | string | `#10b981` | Success state color |
| `theme.formatting.borders` | boolean | `true` | Enable border drawing |
| `layout.maxLineLength` | number | `120` | Maximum line length |
| `output.logLevel` | string | `info` | Minimum log level |

### Graphics Style Config

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `rendering.theme` | string | `modern` | Visual theme |
| `typography.fontFamily` | string | System fonts | Font stack |
| `spacing.unit` | number | `8` | Base spacing unit (px) |
| `effects.borderRadius` | string | `8px` | Corner rounding |

### Metrics Config

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `dataPoints.performance.metrics` | array | 6 metrics | Performance indicators |
| `aggregation.interval` | number | `60000` | Aggregation interval (ms) |
| `visualization.chartType` | string | `line` | Default chart type |

### Workflow Config

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `execution.mode` | string | `mixed` | Execution strategy |
| `execution.concurrency` | number | `5` | Max parallel tasks |
| `errorHandling.strategy` | string | `retry` | Error handling |

## 🎯 Best Practices

1. **Use Scenario Configs**: Start with scenario-specific configurations that match your use case
2. **Merge Thoughtfully**: Use `mergeConfig()` to combine base configs with customizations
3. **Export/Import**: Save custom configurations for reuse across projects
4. **Type Safety**: Leverage TypeScript interfaces for configuration validation
5. **Testing**: Test configurations in development before production deployment

## 🔄 Integration Workflow

```typescript
// 1. Import style guide
import { styleGuideManager, scenarioConfigs } from './src/config/style-guide-config';

// 2. Select scenario or default
const config = scenarioConfigs.digitalBusinessManagement;

// 3. Apply to services
const formatter = new ConsoleFormatter(config.terminal.theme);
const orchestrator = configureOrchestrator(config.workflow);

// 4. Monitor and adjust
const metrics = trackMetrics(config.metrics);
```

## 📝 Examples

See `examples/style-guide-usage.js` for complete integration examples.

## 🚀 Future Enhancements

- **Dynamic Configuration**: Runtime configuration updates
- **A/B Testing**: Test different style configurations
- **Analytics Integration**: Track which configurations perform best
- **Theme Builder UI**: Visual configuration editor
- **Configuration Templates**: Community-contributed scenarios

---

**The style guide system provides production-ready configurations for every aspect of your application development workflow.**
