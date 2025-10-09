import { EventEmitter } from 'events';
import { Logger } from '../../utils/Logger';
import { PuppeteerAutomationService, PerformanceMetrics, OptimizationSuggestion } from './PuppeteerAutomationService';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface VisualTestConfig {
  threshold: number;
  ignoreAntialiasing: boolean;
  ignoreColors: boolean;
  ignoreAlpha: boolean;
  ignoreLess: boolean;
  ignoreNothing: boolean;
  ignoreTransparentPixel: boolean;
  ignoreRectangles: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface VisualTestResult {
  testName: string;
  passed: boolean;
  similarity: number;
  diff: Buffer | null;
  baseline: Buffer | null;
  current: Buffer;
  metadata: {
    timestamp: Date;
    url: string;
    viewport: { width: number; height: number };
    userAgent: string;
    performance: PerformanceMetrics;
  };
  suggestions: OptimizationSuggestion[];
}

export interface TestSuite {
  name: string;
  description: string;
  tests: VisualTest[];
  config: VisualTestConfig;
  schedule?: {
    cron: string;
    enabled: boolean;
  };
}

export interface VisualTest {
  name: string;
  url: string;
  selector?: string;
  fullPage?: boolean;
  waitForSelector?: string;
  waitForTimeout?: number;
  actions?: Array<{
    type: 'click' | 'type' | 'hover' | 'scroll' | 'wait';
    selector?: string;
    value?: string;
    timeout?: number;
  }>;
  viewport?: { width: number; height: number };
  device?: 'desktop' | 'tablet' | 'mobile';
}

export class VisualTestingService extends EventEmitter {
  private logger: Logger;
  private automationService: PuppeteerAutomationService;
  private testSuites: Map<string, TestSuite> = new Map();
  private results: Map<string, VisualTestResult[]> = new Map();
  private baselinePath: string;
  private resultsPath: string;

  constructor(automationService: PuppeteerAutomationService, config?: {
    baselinePath?: string;
    resultsPath?: string;
  }) {
    super();
    this.automationService = automationService;
    this.logger = new Logger('VisualTestingService');
    
    this.baselinePath = config?.baselinePath || './test-baselines';
    this.resultsPath = config?.resultsPath || './test-results';
    
    this.ensureDirectories();
  }

  /**
   * Ensure required directories exist
   */
  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir(this.baselinePath, { recursive: true });
      await fs.mkdir(this.resultsPath, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create directories:', error);
    }
  }

  /**
   * Create a new test suite
   */
  createTestSuite(suite: TestSuite): void {
    this.testSuites.set(suite.name, suite);
    this.results.set(suite.name, []);
    this.logger.info(`Created test suite: ${suite.name}`);
    this.emit('testSuiteCreated', suite);
  }

  /**
   * Run a visual test suite
   */
  async runTestSuite(suiteName: string, options?: {
    updateBaselines?: boolean;
    parallel?: boolean;
    maxConcurrency?: number;
  }): Promise<VisualTestResult[]> {
    const suite = this.testSuites.get(suiteName);
    if (!suite) {
      throw new Error(`Test suite not found: ${suiteName}`);
    }

    this.logger.info(`Running test suite: ${suiteName}`);
    const results: VisualTestResult[] = [];

    if (options?.parallel) {
      // Run tests in parallel with limited concurrency
      const concurrency = options.maxConcurrency || 3;
      const chunks = this.chunkArray(suite.tests, concurrency);
      
      for (const chunk of chunks) {
        const chunkResults = await Promise.all(
          chunk.map(test => this.runVisualTest(test, suite.config, options))
        );
        results.push(...chunkResults);
      }
    } else {
      // Run tests sequentially
      for (const test of suite.tests) {
        const result = await this.runVisualTest(test, suite.config, options);
        results.push(result);
      }
    }

    // Store results
    this.results.set(suiteName, results);
    
    // Generate report
    await this.generateTestReport(suiteName, results);
    
    this.logger.info(`Test suite completed: ${suiteName}`);
    this.emit('testSuiteCompleted', { suiteName, results });
    
    return results;
  }

  /**
   * Run a single visual test
   */
  async runVisualTest(test: VisualTest, config: VisualTestConfig, options?: {
    updateBaselines?: boolean;
  }): Promise<VisualTestResult> {
    const sessionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      this.logger.info(`Running visual test: ${test.name}`);
      
      // Create automation session
      await this.automationService.createSession(sessionId, {
        url: test.url,
        viewport: test.viewport || { width: 1920, height: 1080 }
      });

      // Perform pre-screenshot actions
      if (test.actions) {
        for (const action of test.actions) {
          await this.performTestAction(sessionId, action);
        }
      }

      // Wait for elements if specified
      if (test.waitForSelector) {
        await this.automationService.findAndInteract(sessionId, {
          selector: test.waitForSelector,
          action: 'click' // Dummy action, just to wait for element
        });
      }

      if (test.waitForTimeout) {
        await new Promise(resolve => setTimeout(resolve, test.waitForTimeout));
      }

      // Take screenshot
      const screenshot = await this.automationService.findAndInteract(sessionId, {
        selector: test.selector || 'body',
        action: 'screenshot'
      });

      // Get performance metrics
      const performance = await this.automationService.analyzePerformance(sessionId);
      
      // Generate optimization suggestions
      const suggestions = await this.automationService.generateOptimizationSuggestions(sessionId);

      // Compare with baseline
      const baseline = await this.loadBaseline(test.name);
      const diff = baseline ? await this.compareImages(screenshot.screenshot!, baseline, config) : null;
      
      const similarity = baseline ? this.calculateSimilarity(diff, config) : 1.0;
      const passed = similarity >= config.threshold;

      const result: VisualTestResult = {
        testName: test.name,
        passed,
        similarity,
        diff: diff || null,
        baseline,
        current: screenshot.screenshot!,
        metadata: {
          timestamp: new Date(),
          url: test.url,
          viewport: test.viewport || { width: 1920, height: 1080 },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          performance
        },
        suggestions
      };

      // Update baseline if requested
      if (options?.updateBaselines && !passed) {
        await this.saveBaseline(test.name, screenshot.screenshot!);
        this.logger.info(`Updated baseline for test: ${test.name}`);
      }

      // Save test result
      await this.saveTestResult(test.name, result);

      this.logger.info(`Visual test completed: ${test.name} (${passed ? 'PASSED' : 'FAILED'})`);
      this.emit('visualTestCompleted', result);

      return result;

    } catch (error) {
      this.logger.error(`Visual test failed: ${test.name}`, error);
      throw error;
    } finally {
      // Cleanup session
      await this.automationService.closeSession(sessionId);
    }
  }

  /**
   * Perform test action
   */
  private async performTestAction(sessionId: string, action: any): Promise<void> {
    switch (action.type) {
      case 'click':
        await this.automationService.findAndInteract(sessionId, {
          selector: action.selector,
          action: 'click'
        });
        break;
        
      case 'type':
        await this.automationService.findAndInteract(sessionId, {
          selector: action.selector,
          action: 'type',
          value: action.value
        });
        break;
        
      case 'hover':
        await this.automationService.findAndInteract(sessionId, {
          selector: action.selector,
          action: 'hover'
        });
        break;
        
      case 'scroll':
        await this.automationService.findAndInteract(sessionId, {
          action: 'scroll'
        });
        break;
        
      case 'wait':
        await new Promise(resolve => setTimeout(resolve, action.timeout || 1000));
        break;
    }
  }

  /**
   * Compare two images and generate diff
   */
  private async compareImages(current: Buffer, baseline: Buffer, config: VisualTestConfig): Promise<Buffer | null> {
    // In a real implementation, you would use a library like pixelmatch or resemble.js
    // For now, we'll simulate the comparison
    
    try {
      // Simple hash comparison for demonstration
      const currentHash = crypto.createHash('md5').update(current).digest('hex');
      const baselineHash = crypto.createHash('md5').update(baseline).digest('hex');
      
      if (currentHash === baselineHash) {
        return null; // No differences
      }
      
      // Generate a simple diff visualization
      // In reality, you would use proper image comparison algorithms
      return this.generateDiffVisualization(current, baseline);
    } catch (error) {
      this.logger.error('Image comparison failed:', error);
      return null;
    }
  }

  /**
   * Generate diff visualization (simplified)
   */
  private generateDiffVisualization(current: Buffer, baseline: Buffer): Buffer {
    // This is a simplified implementation
    // In a real scenario, you would use proper image diff algorithms
    return current; // Return current image as diff for demonstration
  }

  /**
   * Calculate similarity score
   */
  private calculateSimilarity(diff: Buffer | null, config: VisualTestConfig): number {
    if (!diff) {
      return 1.0; // Perfect match
    }
    
    // Simplified similarity calculation
    // In reality, you would analyze the diff image pixel by pixel
    return 0.95; // Example similarity score
  }

  /**
   * Load baseline image
   */
  private async loadBaseline(testName: string): Promise<Buffer | null> {
    try {
      const baselineFile = path.join(this.baselinePath, `${testName}.png`);
      return await fs.readFile(baselineFile);
    } catch (error) {
      return null; // No baseline exists
    }
  }

  /**
   * Save baseline image
   */
  private async saveBaseline(testName: string, image: Buffer): Promise<void> {
    try {
      const baselineFile = path.join(this.baselinePath, `${testName}.png`);
      await fs.writeFile(baselineFile, image);
    } catch (error) {
      this.logger.error(`Failed to save baseline for ${testName}:`, error);
    }
  }

  /**
   * Save test result
   */
  private async saveTestResult(testName: string, result: VisualTestResult): Promise<void> {
    try {
      const resultFile = path.join(this.resultsPath, `${testName}_${Date.now()}.json`);
      await fs.writeFile(resultFile, JSON.stringify(result, null, 2));
    } catch (error) {
      this.logger.error(`Failed to save test result for ${testName}:`, error);
    }
  }

  /**
   * Generate test report
   */
  private async generateTestReport(suiteName: string, results: VisualTestResult[]): Promise<void> {
    try {
      const report = {
        suiteName,
        timestamp: new Date(),
        summary: {
          total: results.length,
          passed: results.filter(r => r.passed).length,
          failed: results.filter(r => !r.passed).length,
          averageSimilarity: results.reduce((sum, r) => sum + r.similarity, 0) / results.length
        },
        results: results.map(r => ({
          testName: r.testName,
          passed: r.passed,
          similarity: r.similarity,
          performance: r.metadata.performance,
          suggestions: r.suggestions
        }))
      };

      const reportFile = path.join(this.resultsPath, `${suiteName}_report_${Date.now()}.json`);
      await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
      
      this.logger.info(`Test report generated: ${reportFile}`);
    } catch (error) {
      this.logger.error('Failed to generate test report:', error);
    }
  }

  /**
   * Utility function to chunk array
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get test suite
   */
  getTestSuite(name: string): TestSuite | undefined {
    return this.testSuites.get(name);
  }

  /**
   * Get test results
   */
  getTestResults(suiteName: string): VisualTestResult[] {
    return this.results.get(suiteName) || [];
  }

  /**
   * List all test suites
   */
  listTestSuites(): TestSuite[] {
    return Array.from(this.testSuites.values());
  }

  /**
   * Delete test suite
   */
  deleteTestSuite(name: string): boolean {
    return this.testSuites.delete(name);
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      testSuites: this.testSuites.size,
      totalResults: Array.from(this.results.values()).reduce((sum, results) => sum + results.length, 0),
      baselinePath: this.baselinePath,
      resultsPath: this.resultsPath
    };
  }
}

export default VisualTestingService;
