#!/usr/bin/env node

/**
 * LightDom Workflow Test Suite
 * Comprehensive testing of all LightDom workflows and services
 */

import { workflowSimulation } from './WorkflowSimulation';
import { lightDomFramework } from './LightDomFramework';
import { urlQueueManager } from './URLQueueManager';
import { simulationEngine } from './SimulationEngine';
import { headlessBrowserService } from './HeadlessBrowserService';
import { workersService } from './Workers';
import { lightDomCoinSimulation } from './LightDomCoinSimulation';
import { spaceOptimizationEngine } from '../core/SpaceOptimizationEngine';
import { advancedNodeManager } from '../core/AdvancedNodeManager';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalDuration: number;
  passed: number;
  failed: number;
  successRate: number;
}

class WorkflowTestSuite {
  private results: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;

  /**
   * Run all workflow tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting LightDom Workflow Test Suite...');
    console.log('==========================================');

    try {
      // Test 1: Framework Initialization
      await this.runTestSuite('Framework Initialization', async () => {
        await this.testFrameworkInitialization();
      });

      // Test 2: URL Queue Management
      await this.runTestSuite('URL Queue Management', async () => {
        await this.testURLQueueManagement();
      });

      // Test 3: Optimization Processing
      await this.runTestSuite('Optimization Processing', async () => {
        await this.testOptimizationProcessing();
      });

      // Test 4: Simulation Engine
      await this.runTestSuite('Simulation Engine', async () => {
        await this.testSimulationEngine();
      });

      // Test 5: Headless Browser Service
      await this.runTestSuite('Headless Browser Service', async () => {
        await this.testHeadlessBrowserService();
      });

      // Test 6: Workers Service
      await this.runTestSuite('Workers Service', async () => {
        await this.testWorkersService();
      });

      // Test 7: Coin Simulation
      await this.runTestSuite('Coin Simulation', async () => {
        await this.testCoinSimulation();
      });

      // Test 8: End-to-End Workflow
      await this.runTestSuite('End-to-End Workflow', async () => {
        await this.testEndToEndWorkflow();
      });

      // Generate final report
      this.generateTestReport();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    }
  }

  /**
   * Run a test suite
   */
  private async runTestSuite(name: string, testFunction: () => Promise<void>): Promise<void> {
    console.log(`\n🔬 Running ${name}...`);

    this.currentSuite = {
      name,
      tests: [],
      totalDuration: 0,
      passed: 0,
      failed: 0,
      successRate: 0,
    };

    const startTime = Date.now();

    try {
      await testFunction();
    } catch (error) {
      console.error(`❌ Test suite ${name} failed:`, error);
    }

    this.currentSuite.totalDuration = Date.now() - startTime;
    this.currentSuite.successRate =
      this.currentSuite.tests.length > 0
        ? (this.currentSuite.passed / this.currentSuite.tests.length) * 100
        : 0;

    this.results.push(this.currentSuite);
    this.currentSuite = null;
  }

  /**
   * Run a single test
   */
  private async runTest(name: string, testFunction: () => Promise<any>): Promise<any> {
    const startTime = Date.now();
    let result: TestResult;

    try {
      const details = await testFunction();
      result = {
        name,
        passed: true,
        duration: Date.now() - startTime,
        details,
      };
      this.currentSuite!.passed++;
      console.log(`  ✅ ${name} (${result.duration}ms)`);
    } catch (error) {
      result = {
        name,
        passed: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };
      this.currentSuite!.failed++;
      console.log(`  ❌ ${name} (${result.duration}ms) - ${result.error}`);
    }

    this.currentSuite!.tests.push(result);
    return result;
  }

  /**
   * Test framework initialization
   */
  private async testFrameworkInitialization(): Promise<void> {
    await this.runTest('Initialize Framework', async () => {
      await lightDomFramework.initialize();
      const status = lightDomFramework.getStatus();
      if (!status.running) {
        throw new Error('Framework not running after initialization');
      }
      return status;
    });

    await this.runTest('Check Framework Components', async () => {
      const status = lightDomFramework.getStatus();
      const components = status.components;

      if (!components.framework) {
        throw new Error('Framework component not active');
      }
      if (!components.queue) {
        throw new Error('Queue component not active');
      }

      return components;
    });
  }

  /**
   * Test URL queue management
   */
  private async testURLQueueManagement(): Promise<void> {
    await this.runTest('Add URL to Queue', async () => {
      const queueId = await lightDomFramework.addURLToQueue(
        'https://example.com',
        'high',
        'ecommerce'
      );

      if (!queueId) {
        throw new Error('Failed to add URL to queue');
      }

      return { queueId };
    });

    await this.runTest('Get Queue Status', async () => {
      const status = urlQueueManager.getStatus();

      if (status.total === 0) {
        throw new Error('Queue is empty');
      }

      return status;
    });

    await this.runTest('Add Multiple URLs', async () => {
      const urls = [
        { url: 'https://test1.com', priority: 'medium' as const, siteType: 'blog' as const },
        { url: 'https://test2.com', priority: 'low' as const, siteType: 'corporate' as const },
      ];

      const queueIds = await urlQueueManager.addURLs(urls);

      if (queueIds.length !== urls.length) {
        throw new Error('Failed to add all URLs');
      }

      return { queueIds };
    });

    await this.runTest('Get Queue Items', async () => {
      const items = urlQueueManager.getAllItems();

      if (items.length === 0) {
        throw new Error('No queue items found');
      }

      return { itemCount: items.length };
    });
  }

  /**
   * Test optimization processing
   */
  private async testOptimizationProcessing(): Promise<void> {
    await this.runTest('Process Optimization', async () => {
      const optimization = {
        url: 'https://example.com',
        spaceSavedBytes: 1024,
        optimizationType: 'test',
        biomeType: 'digital',
        harvesterAddress: '0x1234567890123456789012345678901234567890',
      };

      const result = await spaceOptimizationEngine.processOptimization(optimization);

      if (!result.proofHash) {
        throw new Error('Optimization processing failed');
      }

      return result;
    });

    await this.runTest('Get Optimization Stats', async () => {
      const stats = {
        totalSpaceHarvested: spaceOptimizationEngine.getTotalSpaceHarvested(),
        totalTokensDistributed: spaceOptimizationEngine.getTotalTokensDistributed(),
        metaverseStats: spaceOptimizationEngine.getMetaverseStats(),
      };

      return stats;
    });

    await this.runTest('Create Optimization Nodes', async () => {
      const node = advancedNodeManager.createNode('optimization', 100, 'digital', []);

      if (!node.id) {
        throw new Error('Failed to create optimization node');
      }

      return node;
    });
  }

  /**
   * Test simulation engine
   */
  private async testSimulationEngine(): Promise<void> {
    await this.runTest('Start Simulation Engine', async () => {
      await simulationEngine.start();

      if (!simulationEngine.isSimulationRunning()) {
        throw new Error('Simulation engine not running');
      }

      return { running: true };
    });

    await this.runTest('Run Simulation', async () => {
      const result = await simulationEngine.runSimulation();

      if (result.networkEfficiency < 0 || result.networkEfficiency > 100) {
        throw new Error('Invalid network efficiency');
      }

      return result;
    });

    await this.runTest('Get Simulation History', async () => {
      const history = simulationEngine.getSimulationHistory();

      if (history.length === 0) {
        throw new Error('No simulation history found');
      }

      return { historyLength: history.length };
    });

    await this.runTest('Get Simulation Statistics', async () => {
      const stats = simulationEngine.getSimulationStatistics();

      return stats;
    });
  }

  /**
   * Test headless browser service
   */
  private async testHeadlessBrowserService(): Promise<void> {
    await this.runTest('Initialize Headless Browser', async () => {
      await headlessBrowserService.initialize();

      const status = headlessBrowserService.getStatus();
      if (!status.running) {
        throw new Error('Headless browser not running');
      }

      return status;
    });

    await this.runTest('Create Browser Page', async () => {
      const page = await headlessBrowserService.createPage('https://example.com');

      if (!page) {
        throw new Error('Failed to create browser page');
      }

      return { pageCreated: true };
    });

    await this.runTest('Close Headless Browser', async () => {
      await headlessBrowserService.close();

      const status = headlessBrowserService.getStatus();
      if (status.running) {
        throw new Error('Headless browser still running after close');
      }

      return { closed: true };
    });
  }

  /**
   * Test workers service
   */
  private async testWorkersService(): Promise<void> {
    await this.runTest('Start Workers Service', async () => {
      await workersService.start();

      const status = workersService.getStatus();
      if (!status.running) {
        throw new Error('Workers service not running');
      }

      return status;
    });

    await this.runTest('Add Worker Task', async () => {
      const taskId = workersService.addTask({
        type: 'optimization',
        data: { url: 'https://example.com', siteType: 'test' },
        priority: 'high',
      });

      if (!taskId) {
        throw new Error('Failed to add worker task');
      }

      return { taskId };
    });

    await this.runTest('Get Worker Metrics', async () => {
      const metrics = workersService.getMetrics();

      return metrics;
    });
  }

  /**
   * Test coin simulation
   */
  private async testCoinSimulation(): Promise<void> {
    await this.runTest('Start Coin Simulation', async () => {
      await lightDomCoinSimulation.start();

      const status = lightDomCoinSimulation.getStatus();
      if (!status.running) {
        throw new Error('Coin simulation not running');
      }

      return status;
    });

    await this.runTest('Get Network Metrics', async () => {
      const metrics = lightDomCoinSimulation.getNetworkMetrics();

      if (metrics.totalSupply <= 0) {
        throw new Error('Invalid total supply');
      }

      return metrics;
    });

    await this.runTest('Get Token Balance', async () => {
      const balance = lightDomCoinSimulation.getTokenBalance(
        '0x1234567890123456789012345678901234567890'
      );

      return { balance };
    });

    await this.runTest('Create Governance Proposal', async () => {
      const proposalId = lightDomCoinSimulation.createGovernanceProposal(
        '0x1234567890123456789012345678901234567890',
        'Test Proposal',
        'This is a test governance proposal'
      );

      if (!proposalId) {
        throw new Error('Failed to create governance proposal');
      }

      return { proposalId };
    });
  }

  /**
   * Test end-to-end workflow
   */
  private async testEndToEndWorkflow(): Promise<void> {
    await this.runTest('Run Workflow Simulation', async () => {
      const simulation = workflowSimulation;

      // Run a short simulation
      const result = await simulation.start();

      if (result.processedUrls === 0) {
        throw new Error('No URLs were processed');
      }

      return result;
    });

    await this.runTest('Check Workflow Progress', async () => {
      const progress = workflowSimulation.getProgress();

      if (progress.totalUrls === 0) {
        throw new Error('No URLs in simulation');
      }

      return progress;
    });
  }

  /**
   * Generate test report
   */
  private generateTestReport(): void {
    console.log('\n📊 Test Report');
    console.log('==============');

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalDuration = 0;

    for (const suite of this.results) {
      console.log(`\n🔬 ${suite.name}`);
      console.log(`   Duration: ${suite.totalDuration}ms`);
      console.log(`   Tests: ${suite.tests.length}`);
      console.log(`   Passed: ${suite.passed}`);
      console.log(`   Failed: ${suite.failed}`);
      console.log(`   Success Rate: ${suite.successRate.toFixed(2)}%`);

      totalTests += suite.tests.length;
      totalPassed += suite.passed;
      totalFailed += suite.failed;
      totalDuration += suite.totalDuration;

      // Show failed tests
      const failedTests = suite.tests.filter(test => !test.passed);
      if (failedTests.length > 0) {
        console.log('   Failed Tests:');
        for (const test of failedTests) {
          console.log(`     ❌ ${test.name}: ${test.error}`);
        }
      }
    }

    console.log('\n📈 Summary');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${totalPassed}`);
    console.log(`   Failed: ${totalFailed}`);
    console.log(`   Success Rate: ${totalTests > 0 ? (totalPassed / totalTests) * 100 : 0}%`);
    console.log(`   Total Duration: ${totalDuration}ms`);

    if (totalFailed > 0) {
      console.log('\n❌ Some tests failed. Please check the errors above.');
      process.exit(1);
    } else {
      console.log('\n✅ All tests passed!');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new WorkflowTestSuite();
  testSuite.runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

export { WorkflowTestSuite };
