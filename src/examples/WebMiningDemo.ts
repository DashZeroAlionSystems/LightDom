/**
 * Web Mining Demo
 * Comprehensive demonstration of the web mining system
 */

import { webMiningOrchestrator } from '../core/WebMiningOrchestrator';
import { selfOrganizingFoldingAlgorithm } from '../core/SelfOrganizingFoldingAlgorithm';
import { webTreeShaker } from '../core/WebTreeShaker';
import { personalWebDrive } from '../core/PersonalWebDrive';

export class WebMiningDemo {
  private demoData: any[] = [];
  private demoResults: any[] = [];

  constructor() {
    this.initializeDemoData();
  }

  /**
   * Initialize demo data for testing
   */
  private initializeDemoData(): void {
    this.demoData = [
      {
        url: 'https://github.com/microsoft/vscode',
        type: 'code',
        size: 50000,
        content: 'Visual Studio Code repository with extensive codebase'
      },
      {
        url: 'https://docs.microsoft.com/en-us/azure/',
        type: 'documentation',
        size: 25000,
        content: 'Microsoft Azure documentation and guides'
      },
      {
        url: 'https://stackoverflow.com/questions/tagged/javascript',
        type: 'forum',
        size: 15000,
        content: 'JavaScript questions and answers from Stack Overflow'
      },
      {
        url: 'https://developer.mozilla.org/en-US/docs/Web/API',
        type: 'reference',
        size: 30000,
        content: 'MDN Web API documentation and examples'
      },
      {
        url: 'https://www.w3.org/TR/html5/',
        type: 'specification',
        size: 40000,
        content: 'HTML5 specification and technical documentation'
      }
    ];
  }

  /**
   * Run comprehensive demo
   */
  async runDemo(): Promise<void> {
    console.log('🚀 Starting Web Mining Demo...\n');

    // Demo 1: Self-Organizing Folding Algorithm
    await this.demoSelfOrganizingFolding();

    // Demo 2: Web Tree Shaker
    await this.demoWebTreeShaker();

    // Demo 3: Personal Web Drive
    await this.demoPersonalWebDrive();

    // Demo 4: Integrated Mining Session
    await this.demoIntegratedMining();

    // Demo 5: Performance Analysis
    await this.demoPerformanceAnalysis();

    console.log('✅ Demo completed successfully!');
  }

  /**
   * Demo 1: Self-Organizing Folding Algorithm
   */
  private async demoSelfOrganizingFolding(): Promise<void> {
    console.log('📁 Demo 1: Self-Organizing Folding Algorithm');
    console.log('==========================================');

    // Test different data types
    const testData = [
      {
        name: 'Hierarchical JSON Data',
        data: {
          users: [
            { id: 1, name: 'John', email: 'john@example.com' },
            { id: 2, name: 'Jane', email: 'jane@example.com' },
            { id: 3, name: 'Bob', email: 'bob@example.com' }
          ],
          settings: {
            theme: 'dark',
            language: 'en',
            notifications: true
          }
        },
        type: 'hierarchical'
      },
      {
        name: 'Temporal Sequence Data',
        data: [
          { timestamp: '2024-01-01T00:00:00Z', value: 100 },
          { timestamp: '2024-01-01T01:00:00Z', value: 105 },
          { timestamp: '2024-01-01T02:00:00Z', value: 110 },
          { timestamp: '2024-01-01T03:00:00Z', value: 108 }
        ],
        type: 'temporal'
      },
      {
        name: 'Semantic Text Data',
        data: 'This is a comprehensive article about web development and optimization techniques. It covers various topics including HTML, CSS, JavaScript, and performance optimization.',
        type: 'semantic'
      }
    ];

    for (const test of testData) {
      console.log(`\nTesting ${test.name}:`);
      
      const result = await selfOrganizingFoldingAlgorithm.foldData(
        test.data,
        test.type,
        { demo: true }
      );

      console.log(`  Original Size: ${result.originalSize} bytes`);
      console.log(`  Folded Size: ${result.foldedSize} bytes`);
      console.log(`  Compression Ratio: ${result.compressionRatio.toFixed(2)}x`);
      console.log(`  Quality Score: ${result.qualityScore}/100`);
      console.log(`  Pattern Used: ${result.foldPattern}`);
    }

    // Show all fold patterns
    console.log('\nAvailable Fold Patterns:');
    const patterns = selfOrganizingFoldingAlgorithm.getAllFoldPatterns();
    patterns.forEach(pattern => {
      console.log(`  - ${pattern.name}: ${pattern.type} (efficiency: ${pattern.efficiency})`);
    });

    console.log('\n');
  }

  /**
   * Demo 2: Web Tree Shaker
   */
  private async demoWebTreeShaker(): Promise<void> {
    console.log('🌳 Demo 2: Web Tree Shaker');
    console.log('==========================');

    // Test URLs for tree shaking
    const testUrls = [
      'https://github.com/microsoft/vscode',
      'https://docs.microsoft.com/en-us/azure/',
      'https://stackoverflow.com/questions/tagged/javascript'
    ];

    for (const url of testUrls) {
      console.log(`\nTree Shaking ${url}:`);
      
      // Mine web node
      const webNode = await webTreeShaker.mineWebNode(url, 'demo-session');
      if (webNode) {
        console.log(`  Node Type: ${webNode.type}`);
        console.log(`  Size: ${webNode.size} bytes`);
        console.log(`  Value: ${webNode.value}`);
        console.log(`  Priority: ${webNode.priority}`);

        // Tree shake the node
        const shakeResult = await webTreeShaker.treeShakeNode(webNode);
        if (shakeResult) {
          console.log(`  Space Saved: ${shakeResult.spaceSaved} bytes`);
          console.log(`  Value Extracted: ${shakeResult.valueExtracted}`);
          console.log(`  Quality: ${shakeResult.quality}/100`);
          console.log(`  Patterns: ${shakeResult.patterns.join(', ')}`);
        }
      }
    }

    // Show reserved space patterns
    console.log('\nReserved Space Patterns:');
    const patterns = webTreeShaker.getAllWebNodes();
    console.log(`  Total Nodes Mined: ${patterns.length}`);

    console.log('\n');
  }

  /**
   * Demo 3: Personal Web Drive
   */
  private async demoPersonalWebDrive(): Promise<void> {
    console.log('💾 Demo 3: Personal Web Drive');
    console.log('=============================');

    // Test URLs for personal web drive mining
    const testUrls = [
      'https://github.com/microsoft/vscode',
      'https://docs.microsoft.com/en-us/azure/',
      'https://stackoverflow.com/questions/tagged/javascript',
      'https://developer.mozilla.org/en-US/docs/Web/API'
    ];

    for (const url of testUrls) {
      console.log(`\nMining ${url}:`);
      
      const minedData = await personalWebDrive.startMining(url, { demo: true });
      if (minedData) {
        console.log(`  Title: ${minedData.title}`);
        console.log(`  Type: ${minedData.type}`);
        console.log(`  Size: ${minedData.size} bytes`);
        console.log(`  Value: ${minedData.value}`);
        console.log(`  Quality: ${minedData.quality}/100`);
        console.log(`  Tags: ${minedData.tags.join(', ')}`);
      }
    }

    // Show drive analytics
    const analytics = personalWebDrive.getAnalytics();
    console.log('\nDrive Analytics:');
    console.log(`  Total Data: ${analytics.totalData} items`);
    console.log(`  Total Value: ${analytics.totalValue}`);
    console.log(`  Average Quality: ${analytics.averageQuality.toFixed(1)}`);
    console.log(`  Space Utilization: ${(analytics.spaceUtilization * 100).toFixed(1)}%`);
    console.log(`  Mining Efficiency: ${analytics.miningEfficiency.toFixed(1)}%`);

    // Show top sources
    const topSources = personalWebDrive.getTopSources(3);
    console.log('\nTop Sources:');
    topSources.forEach((source, index) => {
      console.log(`  ${index + 1}. ${source.domain}: ${source.count} items, ${source.value} value`);
    });

    console.log('\n');
  }

  /**
   * Demo 4: Integrated Mining Session
   */
  private async demoIntegratedMining(): Promise<void> {
    console.log('🔄 Demo 4: Integrated Mining Session');
    console.log('===================================');

    // Start integrated mining session
    const sessionId = await webMiningOrchestrator.startMiningSession(
      'Comprehensive Web Mining Demo',
      [
        'https://github.com/microsoft/vscode',
        'https://docs.microsoft.com/en-us/azure/',
        'https://stackoverflow.com/questions/tagged/javascript',
        'https://developer.mozilla.org/en-US/docs/Web/API',
        'https://www.w3.org/TR/html5/'
      ],
      {
        foldAdditionalData: this.demoData,
        dataType: 'mixed',
        aiOptimization: true
      }
    );

    console.log(`Started mining session: ${sessionId}`);

    // Wait for session to complete (in real implementation, this would be async)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get session results
    const session = webMiningOrchestrator.getSession(sessionId);
    if (session) {
      console.log('\nSession Results:');
      console.log(`  Status: ${session.status}`);
      console.log(`  Duration: ${session.endTime ? session.endTime - session.startTime : 0}ms`);
      console.log(`  Total Space Saved: ${session.metrics.totalSpaceSaved} bytes`);
      console.log(`  Total Value Extracted: ${session.metrics.totalValueExtracted}`);
      console.log(`  Efficiency: ${session.metrics.efficiency.toFixed(2)}`);
      console.log(`  Quality: ${session.metrics.quality.toFixed(2)}`);
      
      console.log(`\n  Folded Data: ${session.results.foldedData.length} items`);
      console.log(`  Tree Shake Results: ${session.results.treeShakeResults.length} items`);
      console.log(`  Mined Data: ${session.results.minedData.length} items`);
    }

    console.log('\n');
  }

  /**
   * Demo 5: Performance Analysis
   */
  private async demoPerformanceAnalysis(): Promise<void> {
    console.log('📊 Demo 5: Performance Analysis');
    console.log('===============================');

    // Get performance metrics from all components
    const foldingMetrics = selfOrganizingFoldingAlgorithm.getPerformanceMetrics();
    const treeShakeMetrics = webTreeShaker.getPerformanceMetrics();
    const driveMetrics = personalWebDrive.getPerformanceMetrics();
    const orchestratorMetrics = webMiningOrchestrator.getPerformanceMetrics();

    console.log('\nSelf-Organizing Folding Metrics:');
    console.log(`  Total Folds: ${foldingMetrics.totalFolds}`);
    console.log(`  Average Compression Ratio: ${foldingMetrics.averageCompressionRatio.toFixed(2)}x`);
    console.log(`  Most Efficient Pattern: ${foldingMetrics.mostEfficientPattern}`);
    console.log(`  Total Space Saved: ${foldingMetrics.totalSpaceSaved} bytes`);

    console.log('\nWeb Tree Shaker Metrics:');
    console.log(`  Total Nodes: ${treeShakeMetrics.totalNodes}`);
    console.log(`  Total Sessions: ${treeShakeMetrics.totalSessions}`);
    console.log(`  Total Results: ${treeShakeMetrics.totalResults}`);
    console.log(`  Average Shake Quality: ${treeShakeMetrics.averageShakeQuality.toFixed(2)}`);
    console.log(`  Total Space Saved: ${treeShakeMetrics.totalSpaceSaved} bytes`);
    console.log(`  Total Value Extracted: ${treeShakeMetrics.totalValueExtracted}`);

    console.log('\nPersonal Web Drive Metrics:');
    Object.entries(driveMetrics).forEach(([operation, metrics]: [string, any]) => {
      console.log(`  ${operation}: ${metrics.count} operations, avg ${metrics.averageDuration.toFixed(2)}ms`);
    });

    console.log('\nWeb Mining Orchestrator Metrics:');
    Object.entries(orchestratorMetrics).forEach(([operation, metrics]: [string, any]) => {
      console.log(`  ${operation}: ${metrics.count} operations, avg ${metrics.averageDuration.toFixed(2)}ms`);
    });

    // Get overall statistics
    const overallStats = webMiningOrchestrator.getOverallStatistics();
    console.log('\nOverall Statistics:');
    console.log(`  Total Sessions: ${overallStats.totalSessions}`);
    console.log(`  Completed Sessions: ${overallStats.completedSessions}`);
    console.log(`  Total Space Saved: ${overallStats.totalSpaceSaved} bytes`);
    console.log(`  Total Value Extracted: ${overallStats.totalValueExtracted}`);
    console.log(`  Average Efficiency: ${overallStats.averageEfficiency.toFixed(2)}`);
    console.log(`  Average Quality: ${overallStats.averageQuality.toFixed(2)}`);

    console.log('\n');
  }

  /**
   * Run specific demo component
   */
  async runComponentDemo(component: string): Promise<void> {
    switch (component) {
      case 'folding':
        await this.demoSelfOrganizingFolding();
        break;
      case 'tree-shaker':
        await this.demoWebTreeShaker();
        break;
      case 'web-drive':
        await this.demoPersonalWebDrive();
        break;
      case 'integrated':
        await this.demoIntegratedMining();
        break;
      case 'performance':
        await this.demoPerformanceAnalysis();
        break;
      default:
        console.log('Unknown component. Available components: folding, tree-shaker, web-drive, integrated, performance');
    }
  }

  /**
   * Get demo results
   */
  getDemoResults(): any[] {
    return this.demoResults;
  }

  /**
   * Clear demo results
   */
  clearDemoResults(): void {
    this.demoResults = [];
  }
}

// Create demo instance
export const webMiningDemo = new WebMiningDemo();

// Export for use in other modules
export default WebMiningDemo;