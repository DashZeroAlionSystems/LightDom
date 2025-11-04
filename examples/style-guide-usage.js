/**
 * Style Guide Usage Examples
 * Demonstrates how to use style guide configurations in real scenarios
 */

import { styleGuideManager, scenarioConfigs } from '../src/config/style-guide-config.js';
import { ConsoleFormatter } from '../src/config/console-config.js';
import { serviceOrchestrator } from '../src/services/service-orchestrator.js';
import { richSnippetEngine } from '../src/services/rich-snippet-engine.js';
import { deepseekInstanceManager } from '../src/services/deepseek-instance-manager.js';

// Example 1: Terminal Configuration for Data Mining
async function dataMiningTerminalSetup() {
  console.log('\n=== Example 1: Data Mining Terminal Setup ===\n');
  
  const config = scenarioConfigs.dataMiningResearch;
  
  // Create formatter with data mining config
  const formatter = new ConsoleFormatter({
    theme: {
      primary: config.terminal.theme.colors.primary,
      secondary: config.terminal.theme.colors.secondary,
      success: config.terminal.theme.colors.success,
      warning: config.terminal.theme.colors.warning,
      error: config.terminal.theme.colors.error,
      info: config.terminal.theme.colors.info,
      highlight: config.terminal.theme.colors.highlight,
      dim: config.terminal.theme.colors.dim,
    },
    enableTimestamps: config.terminal.theme.formatting.timestamps,
    enableServiceLabels: config.terminal.theme.formatting.serviceLabels,
    enableBorders: config.terminal.theme.formatting.borders,
    maxLineLength: config.terminal.layout.maxLineLength,
    logLevel: config.terminal.output.logLevel,
  });
  
  // Use formatter for data mining logs
  console.log(formatter.formatServiceMessage(
    'DataMiner',
    'Starting data extraction with optimized buffer size',
    'info'
  ));
  
  console.log(formatter.formatDataStream(
    'Metrics',
    {
      extractionRate: '1250 records/sec',
      dataQuality: '94%',
      processingSpeed: '850ms avg',
      storageUsage: '2.3 GB',
    },
    'analytics'
  ));
  
  console.log(formatter.formatProgress(
    'DataMiner',
    'Extracting product data',
    7500,
    10000
  ));
}

// Example 2: Graphics Style for Rich Snippets
async function graphicsStyleForSnippets() {
  console.log('\n=== Example 2: Graphics Style for Rich Snippets ===\n');
  
  const graphicsConfig = styleGuideManager.getConfig('graphics');
  
  // Generate product snippet with style guide
  const productSnippet = richSnippetEngine.generateProductSnippet({
    name: 'Premium Wireless Headphones',
    description: 'High-fidelity audio with active noise cancellation',
    price: 299.99,
    currency: 'USD',
    image: 'https://example.com/headphones.jpg',
  }, {
    theme: graphicsConfig.rendering.theme,
    primaryColor: graphicsConfig.rendering.primaryColor,
    secondaryColor: graphicsConfig.rendering.secondaryColor,
    fontFamily: graphicsConfig.typography.fontFamily,
    spacing: 'normal',
    borderRadius: graphicsConfig.effects.borderRadius,
    shadows: graphicsConfig.effects.shadows,
  });
  
  console.log('Generated snippet with style guide:');
  console.log('- Theme:', graphicsConfig.rendering.theme);
  console.log('- Primary Color:', graphicsConfig.rendering.primaryColor);
  console.log('- Font:', graphicsConfig.typography.fontFamily);
  console.log('- Spacing Unit:', graphicsConfig.spacing.unit + 'px');
}

// Example 3: Workflow Orchestration with Config
async function workflowOrchestrationSetup() {
  console.log('\n=== Example 3: Workflow Orchestration Setup ===\n');
  
  const workflowConfig = scenarioConfigs.workflowOrchestration;
  
  // Define service schemas
  const schemas = [
    {
      name: 'data-processor',
      version: '1.0.0',
      endpoints: [
        {
          path: '/process',
          method: 'POST',
          schema: { data: { type: 'array' } },
        },
      ],
      config: { instanceType: 'worker' },
    },
    {
      name: 'result-aggregator',
      version: '1.0.0',
      endpoints: [
        {
          path: '/aggregate',
          method: 'POST',
          schema: { results: { type: 'array' } },
        },
      ],
      dependencies: ['data-processor'],
    },
  ];
  
  // Register bundle with workflow configuration
  serviceOrchestrator.registerBundle('data-pipeline', schemas, {
    autoStart: false,
    healthCheckInterval: 30000,
    restartOnFailure: workflowConfig.workflow.errorHandling.strategy === 'retry',
    maxRestarts: workflowConfig.workflow.execution.retries,
  });
  
  console.log('Workflow orchestration configured:');
  console.log('- Execution Mode:', workflowConfig.workflow.execution.mode);
  console.log('- Concurrency:', workflowConfig.workflow.execution.concurrency);
  console.log('- Timeout:', workflowConfig.workflow.execution.timeout + 'ms');
  console.log('- Error Strategy:', workflowConfig.workflow.errorHandling.strategy);
}

// Example 4: DeepSeek Learning Configuration
async function deepSeekLearningSetup() {
  console.log('\n=== Example 4: DeepSeek Learning Setup ===\n');
  
  const learningConfig = scenarioConfigs.deepSeekSkillLearning;
  
  console.log('DeepSeek Learning Configuration:');
  console.log('- Skill Categories:', learningConfig.learning.skills.categories);
  console.log('- Prioritization:', learningConfig.learning.skills.prioritization);
  console.log('- Research Depth:', learningConfig.learning.research.depth);
  console.log('- Training Mode:', learningConfig.learning.training.mode);
  console.log('- Context Size:', learningConfig.learning.context.maxSize);
  
  // Create DeepSeek instance with learning context
  const instance = await deepseekInstanceManager.createInstance('learning-ai', {
    headless: true,
    enableConsoleLogging: true,
  });
  
  // Send learning prompt based on config
  const skillCategory = learningConfig.learning.skills.categories[0];
  const response = await deepseekInstanceManager.sendPrompt(
    instance.id,
    `Learn about ${skillCategory}. Research from: ${learningConfig.learning.research.sources.join(', ')}. Depth: ${learningConfig.learning.research.depth}.`,
    { category: skillCategory }
  );
  
  console.log('Learning initiated for:', skillCategory);
}

// Example 5: Digital Business Management Dashboard
async function digitalBusinessDashboard() {
  console.log('\n=== Example 5: Digital Business Management Dashboard ===\n');
  
  const businessConfig = scenarioConfigs.digitalBusinessManagement;
  
  // Set up metrics tracking
  const metricsConfig = businessConfig.metrics;
  
  console.log('Business Metrics Configuration:');
  console.log('- Performance Metrics:', metricsConfig.dataPoints.performance.metrics);
  console.log('- Thresholds:');
  console.log('  - Good:', (metricsConfig.dataPoints.performance.thresholds.good * 100) + '%');
  console.log('  - Warning:', (metricsConfig.dataPoints.performance.thresholds.warning * 100) + '%');
  console.log('  - Critical:', (metricsConfig.dataPoints.performance.thresholds.critical * 100) + '%');
  
  // Simulate business metrics
  const metrics = {
    revenue: 125000,
    conversions: 450,
    customerSatisfaction: 0.92,
    operationalEfficiency: 0.88,
    systemUptime: 0.998,
  };
  
  console.log('\nCurrent Business Metrics:');
  Object.entries(metrics).forEach(([key, value]) => {
    let status = 'good';
    if (typeof value === 'number' && value < 1) {
      if (value < metricsConfig.dataPoints.performance.thresholds.good) {
        status = 'critical';
      } else if (value < metricsConfig.dataPoints.performance.thresholds.warning) {
        status = 'warning';
      }
    }
    console.log(`  ${key}: ${value} [${status}]`);
  });
}

// Example 6: Custom Configuration Merging
function customConfigurationMerging() {
  console.log('\n=== Example 6: Custom Configuration Merging ===\n');
  
  const baseConfig = styleGuideManager.getConfig('terminal');
  
  // Create custom configuration
  const customConfig = styleGuideManager.mergeConfig(baseConfig, {
    theme: {
      name: 'Custom High Contrast',
      colors: {
        ...baseConfig.theme.colors,
        primary: '#00ff00',
        success: '#00cc00',
        error: '#ff0000',
      },
    },
    layout: {
      ...baseConfig.layout,
      maxLineLength: 200,
    },
  });
  
  console.log('Custom Configuration Created:');
  console.log('- Theme Name:', customConfig.theme.name);
  console.log('- Primary Color:', customConfig.theme.colors.primary);
  console.log('- Max Line Length:', customConfig.layout.maxLineLength);
  
  // Export configuration
  const exported = styleGuideManager.exportConfig('terminal');
  console.log('\nConfiguration exported (first 200 chars):');
  console.log(exported.substring(0, 200) + '...');
}

// Example 7: Linked Maps Configuration
function linkedMapsConfiguration() {
  console.log('\n=== Example 7: Linked Maps Configuration ===\n');
  
  const linkedMapsConfig = styleGuideManager.getConfig('linkedMaps');
  
  console.log('Linked Maps Configuration:');
  console.log('- Node Types:', linkedMapsConfig.structure.nodes.map(n => n.type));
  console.log('- Edge Types:', linkedMapsConfig.structure.edges.map(e => e.type));
  console.log('- Traversal Algorithm:', linkedMapsConfig.traversal.algorithm);
  console.log('- Max Depth:', linkedMapsConfig.traversal.maxDepth);
  console.log('- Visualization Layout:', linkedMapsConfig.visualization.layout);
  console.log('- Real-time Updates:', linkedMapsConfig.visualization.realTimeUpdates);
  
  // Example: Business entity mapping
  const businessLinkedMaps = scenarioConfigs.digitalBusinessManagement.linkedMaps;
  console.log('\nBusiness Entity Nodes:');
  businessLinkedMaps.structure.nodes.forEach(node => {
    console.log(`  ${node.type}:`);
    console.log(`    - Properties: ${node.properties.join(', ')}`);
    console.log(`    - Connections: ${node.connections.join(', ')}`);
  });
}

// Example 8: Metrics Visualization Setup
function metricsVisualizationSetup() {
  console.log('\n=== Example 8: Metrics Visualization Setup ===\n');
  
  const metricsConfig = styleGuideManager.getConfig('metrics');
  
  console.log('Metrics Visualization Configuration:');
  console.log('- Chart Type:', metricsConfig.visualization.chartType);
  console.log('- Colors:', metricsConfig.visualization.colors);
  console.log('- Update Interval:', metricsConfig.visualization.updateInterval + 'ms');
  console.log('- Aggregation Methods:', metricsConfig.aggregation.methods);
  console.log('- Aggregation Interval:', metricsConfig.aggregation.interval + 'ms');
  
  // Simulate metrics data
  const mockMetrics = {
    responseTime: [120, 135, 118, 142, 128],
    throughput: [1250, 1320, 1180, 1290, 1310],
    errorRate: [0.02, 0.01, 0.03, 0.02, 0.01],
  };
  
  console.log('\nSample Metrics Data:');
  Object.entries(mockMetrics).forEach(([metric, values]) => {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    console.log(`  ${metric}:`);
    console.log(`    - Avg: ${avg.toFixed(2)}`);
    console.log(`    - Min: ${min}`);
    console.log(`    - Max: ${max}`);
  });
}

// Run all examples
async function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║          Style Guide Configuration Examples                    ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  await dataMiningTerminalSetup();
  await graphicsStyleForSnippets();
  await workflowOrchestrationSetup();
  await deepSeekLearningSetup();
  await digitalBusinessDashboard();
  customConfigurationMerging();
  linkedMapsConfiguration();
  metricsVisualizationSetup();
  
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║          All Examples Completed Successfully! ✓                ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
}

// Export for use in other modules
export {
  dataMiningTerminalSetup,
  graphicsStyleForSnippets,
  workflowOrchestrationSetup,
  deepSeekLearningSetup,
  digitalBusinessDashboard,
  customConfigurationMerging,
  linkedMapsConfiguration,
  metricsVisualizationSetup,
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(error => {
    console.error('Error running examples:', error);
    process.exit(1);
  });
}
