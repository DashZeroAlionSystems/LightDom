import HeadlessApp from './HeadlessApp';
import { Logger } from '../utils/Logger';
import fs from 'fs/promises';
import path from 'path';

export class HeadlessDemo {
  private app: HeadlessApp;
  private logger: Logger;
  private resultsDir: string;

  constructor() {
    this.app = new HeadlessApp(
      {
        headless: 'new',
        devtools: false,
        slowMo: 100,
        timeout: 30000,
      },
      {
        performanceTracing: true,
        accessibilityTesting: true,
        networkInterception: true,
        securityAudit: true,
        visualTesting: true,
        mobileEmulation: true,
      }
    );

    this.logger = new Logger('HeadlessDemo');
    this.resultsDir = path.join(process.cwd(), 'demo-results');
  }

  /**
   * Initialize the demo
   */
  async initialize(): Promise<void> {
    try {
      await this.app.initialize();

      // Create results directory
      await fs.mkdir(this.resultsDir, { recursive: true });

      this.logger.info('HeadlessDemo initialized');
    } catch (error) {
      this.logger.error('Failed to initialize HeadlessDemo:', error);
      throw error;
    }
  }

  /**
   * Run comprehensive demo
   */
  async runDemo(): Promise<void> {
    try {
      this.logger.info('Starting comprehensive headless demo');

      // Demo URLs to test
      const demoUrls = [
        'https://example.com',
        'https://httpbin.org',
        'https://jsonplaceholder.typicode.com',
        'https://httpstat.us/200',
        'https://httpstat.us/404',
      ];

      const results = [];

      for (const url of demoUrls) {
        try {
          this.logger.info(`Testing ${url}`);

          // Run comprehensive test
          const result = await this.app.runComprehensiveTest(url);
          results.push(result);

          // Save individual result
          await this.saveResult(url, result);

          // Take screenshot
          await this.takeDemoScreenshot(url);

          // Generate PDF
          await this.generateDemoPDF(url);

          this.logger.info(`Completed testing ${url} - Score: ${result.score}`);
        } catch (error) {
          this.logger.error(`Failed to test ${url}:`, error);
        }
      }

      // Generate summary report
      await this.generateSummaryReport(results);

      this.logger.info('Demo completed successfully');
    } catch (error) {
      this.logger.error('Demo failed:', error);
      throw error;
    }
  }

  /**
   * Demo performance testing
   */
  async demoPerformanceTesting(): Promise<void> {
    try {
      this.logger.info('Starting performance testing demo');

      const pageId = 'perf-demo';
      await this.app.createPage(pageId);

      const testUrls = [
        'https://example.com',
        'https://httpbin.org/delay/1',
        'https://httpbin.org/delay/2',
      ];

      for (const url of testUrls) {
        await this.app.navigateToPage(pageId, url);

        // Get performance metrics
        const page = (this.app as any).pages.get(pageId);
        const metrics = await page.metrics();

        this.logger.info(`Performance metrics for ${url}:`, {
          jsHeapUsedSize: metrics.JSHeapUsedSize,
          jsHeapTotalSize: metrics.JSHeapTotalSize,
          timestamp: metrics.Timestamp,
        });
      }

      await this.app.closePage(pageId);
      this.logger.info('Performance testing demo completed');
    } catch (error) {
      this.logger.error('Performance testing demo failed:', error);
    }
  }

  /**
   * Demo accessibility testing
   */
  async demoAccessibilityTesting(): Promise<void> {
    try {
      this.logger.info('Starting accessibility testing demo');

      const pageId = 'a11y-demo';
      await this.app.createPage(pageId);

      // Test a page with known accessibility issues
      await this.app.navigateToPage(pageId, 'https://example.com');

      const page = (this.app as any).pages.get(pageId);
      const cdpSession = (this.app as any).cdpSessions.get(pageId);

      // Run accessibility audit
      const accessibilityResult = await (this.app as any).testAccessibility(page, cdpSession);

      this.logger.info('Accessibility test results:', {
        score: accessibilityResult.score,
        violations: accessibilityResult.violations.length,
        recommendations: accessibilityResult.recommendations.length,
      });

      await this.app.closePage(pageId);
      this.logger.info('Accessibility testing demo completed');
    } catch (error) {
      this.logger.error('Accessibility testing demo failed:', error);
    }
  }

  /**
   * Demo security testing
   */
  async demoSecurityTesting(): Promise<void> {
    try {
      this.logger.info('Starting security testing demo');

      const pageId = 'security-demo';
      await this.app.createPage(pageId);

      const testUrls = [
        'https://httpbin.org',
        'http://httpbin.org', // HTTP version for security testing
        'https://httpstat.us/200',
      ];

      for (const url of testUrls) {
        await this.app.navigateToPage(pageId, url);

        const page = (this.app as any).pages.get(pageId);
        const cdpSession = (this.app as any).cdpSessions.get(pageId);

        // Run security audit
        const securityResult = await (this.app as any).testSecurity(page, cdpSession);

        this.logger.info(`Security test results for ${url}:`, {
          score: securityResult.score,
          httpsStatus: securityResult.httpsStatus,
          vulnerabilities: securityResult.vulnerabilities.length,
          cspStatus: securityResult.cspStatus,
        });
      }

      await this.app.closePage(pageId);
      this.logger.info('Security testing demo completed');
    } catch (error) {
      this.logger.error('Security testing demo failed:', error);
    }
  }

  /**
   * Demo visual testing
   */
  async demoVisualTesting(): Promise<void> {
    try {
      this.logger.info('Starting visual testing demo');

      const pageId = 'visual-demo';
      await this.app.createPage(pageId);

      await this.app.navigateToPage(pageId, 'https://example.com');

      const page = (this.app as any).pages.get(pageId);
      const cdpSession = (this.app as any).cdpSessions.get(pageId);

      // Run visual audit
      const visualResult = await (this.app as any).testVisual(page, cdpSession);

      this.logger.info('Visual test results:', {
        score: visualResult.score,
        layoutShift: visualResult.layoutShift,
        responsiveDesign: visualResult.responsiveDesign,
        mobileFriendly: visualResult.mobileFriendly,
      });

      // Take different types of screenshots
      await this.takeVisualScreenshots(pageId);

      await this.app.closePage(pageId);
      this.logger.info('Visual testing demo completed');
    } catch (error) {
      this.logger.error('Visual testing demo failed:', error);
    }
  }

  /**
   * Demo network monitoring
   */
  async demoNetworkMonitoring(): Promise<void> {
    try {
      this.logger.info('Starting network monitoring demo');

      const pageId = 'network-demo';
      await this.app.createPage(pageId);

      await this.app.navigateToPage(pageId, 'https://httpbin.org');

      const page = (this.app as any).pages.get(pageId);
      const cdpSession = (this.app as any).cdpSessions.get(pageId);

      // Run network audit
      const networkResult = await (this.app as any).testNetwork(page, cdpSession);

      this.logger.info('Network test results:', {
        totalRequests: networkResult.totalRequests,
        totalSize: networkResult.totalSize,
        loadTime: networkResult.loadTime,
        slowRequests: networkResult.slowRequests.length,
        failedRequests: networkResult.failedRequests.length,
        resourceTypes: networkResult.resourceTypes,
      });

      await this.app.closePage(pageId);
      this.logger.info('Network monitoring demo completed');
    } catch (error) {
      this.logger.error('Network monitoring demo failed:', error);
    }
  }

  /**
   * Demo mobile emulation
   */
  async demoMobileEmulation(): Promise<void> {
    try {
      this.logger.info('Starting mobile emulation demo');

      const pageId = 'mobile-demo';
      await this.app.createPage(pageId);

      // Set mobile viewport
      const page = (this.app as any).pages.get(pageId);
      await page.setViewport({
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      });

      await this.app.navigateToPage(pageId, 'https://example.com');

      // Take mobile screenshot
      const mobileScreenshot = await this.app.takeScreenshot(pageId, {
        fullPage: true,
        type: 'png',
      });

      await fs.writeFile(path.join(this.resultsDir, 'mobile-screenshot.png'), mobileScreenshot);

      await this.app.closePage(pageId);
      this.logger.info('Mobile emulation demo completed');
    } catch (error) {
      this.logger.error('Mobile emulation demo failed:', error);
    }
  }

  /**
   * Save test result
   */
  private async saveResult(url: string, result: any): Promise<void> {
    try {
      const filename = `result-${Date.now()}-${url.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
      const filepath = path.join(this.resultsDir, filename);

      await fs.writeFile(filepath, JSON.stringify(result, null, 2));
      this.logger.info(`Result saved: ${filename}`);
    } catch (error) {
      this.logger.error('Failed to save result:', error);
    }
  }

  /**
   * Take demo screenshot
   */
  private async takeDemoScreenshot(url: string): Promise<void> {
    try {
      const pageId = `screenshot-${Date.now()}`;
      await this.app.createPage(pageId);
      await this.app.navigateToPage(pageId, url);

      const screenshot = await this.app.takeScreenshot(pageId, {
        fullPage: true,
        type: 'png',
      });

      const filename = `screenshot-${Date.now()}-${url.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      const filepath = path.join(this.resultsDir, filename);

      await fs.writeFile(filepath, screenshot);
      this.logger.info(`Screenshot saved: ${filename}`);

      await this.app.closePage(pageId);
    } catch (error) {
      this.logger.error('Failed to take demo screenshot:', error);
    }
  }

  /**
   * Generate demo PDF
   */
  private async generateDemoPDF(url: string): Promise<void> {
    try {
      const pageId = `pdf-${Date.now()}`;
      await this.app.createPage(pageId);
      await this.app.navigateToPage(pageId, url);

      const pdf = await this.app.generatePDF(pageId, {
        format: 'A4',
        printBackground: true,
      });

      const filename = `pdf-${Date.now()}-${url.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const filepath = path.join(this.resultsDir, filename);

      await fs.writeFile(filepath, pdf);
      this.logger.info(`PDF saved: ${filename}`);

      await this.app.closePage(pageId);
    } catch (error) {
      this.logger.error('Failed to generate demo PDF:', error);
    }
  }

  /**
   * Take visual screenshots
   */
  private async takeVisualScreenshots(pageId: string): Promise<void> {
    try {
      const page = (this.app as any).pages.get(pageId);

      // Full page screenshot
      const fullPageScreenshot = await this.app.takeScreenshot(pageId, {
        fullPage: true,
        type: 'png',
      });
      await fs.writeFile(path.join(this.resultsDir, 'visual-fullpage.png'), fullPageScreenshot);

      // Viewport screenshot
      const viewportScreenshot = await this.app.takeScreenshot(pageId, {
        fullPage: false,
        type: 'png',
      });
      await fs.writeFile(path.join(this.resultsDir, 'visual-viewport.png'), viewportScreenshot);

      // Clipped screenshot
      const clippedScreenshot = await this.app.takeScreenshot(pageId, {
        clip: { x: 0, y: 0, width: 800, height: 600 },
        type: 'png',
      });
      await fs.writeFile(path.join(this.resultsDir, 'visual-clipped.png'), clippedScreenshot);

      this.logger.info('Visual screenshots saved');
    } catch (error) {
      this.logger.error('Failed to take visual screenshots:', error);
    }
  }

  /**
   * Generate summary report
   */
  private async generateSummaryReport(results: any[]): Promise<void> {
    try {
      const summary = {
        timestamp: new Date().toISOString(),
        totalTests: results.length,
        averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
        results: results.map(r => ({
          url: r.url,
          score: r.score,
          performance: r.performance.score,
          accessibility: r.accessibility.score,
          security: r.security.score,
          visual: r.visual.score,
          network: r.network.totalRequests,
        })),
        recommendations: this.generateRecommendations(results),
      };

      const filepath = path.join(this.resultsDir, 'summary-report.json');
      await fs.writeFile(filepath, JSON.stringify(summary, null, 2));

      this.logger.info('Summary report generated');
    } catch (error) {
      this.logger.error('Failed to generate summary report:', error);
    }
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(results: any[]): string[] {
    const recommendations = [];

    const avgPerformance =
      results.reduce((sum, r) => sum + r.performance.score, 0) / results.length;
    const avgAccessibility =
      results.reduce((sum, r) => sum + r.accessibility.score, 0) / results.length;
    const avgSecurity = results.reduce((sum, r) => sum + r.security.score, 0) / results.length;
    const avgVisual = results.reduce((sum, r) => sum + r.visual.score, 0) / results.length;

    if (avgPerformance < 70) {
      recommendations.push('Improve page load performance by optimizing images and scripts');
    }

    if (avgAccessibility < 80) {
      recommendations.push('Enhance accessibility by adding alt text and proper heading structure');
    }

    if (avgSecurity < 90) {
      recommendations.push('Strengthen security by implementing HTTPS and CSP headers');
    }

    if (avgVisual < 75) {
      recommendations.push('Improve visual design and responsive layout');
    }

    return recommendations;
  }

  /**
   * Cleanup demo resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.app.cleanup();
      this.logger.info('HeadlessDemo cleaned up');
    } catch (error) {
      this.logger.error('Error during demo cleanup:', error);
    }
  }
}

// Demo runner
async function runDemo() {
  const demo = new HeadlessDemo();

  try {
    await demo.initialize();

    // Run all demos
    await demo.runDemo();
    await demo.demoPerformanceTesting();
    await demo.demoAccessibilityTesting();
    await demo.demoSecurityTesting();
    await demo.demoVisualTesting();
    await demo.demoNetworkMonitoring();
    await demo.demoMobileEmulation();

    console.log('🎉 All demos completed successfully!');
    console.log(`📁 Results saved to: ${demo['resultsDir']}`);
  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    await demo.cleanup();
  }
}

// Run demo if this file is executed directly
if (require.main === module) {
  runDemo();
}

export default HeadlessDemo;
