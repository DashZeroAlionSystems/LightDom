#!/usr/bin/env node

import { Command } from 'commander';
import HeadlessApp from './HeadlessApp';
import HeadlessDemo from './HeadlessDemo';
import { Logger } from '../utils/Logger';
import fs from 'fs/promises';
import path from 'path';

const program = new Command();
const logger = new Logger('HeadlessCLI');

program
  .name('headless-cli')
  .description('Advanced Headless Chrome CLI Application')
  .version('1.0.0');

// Test command
program
  .command('test <url>')
  .description('Run comprehensive test on a URL')
  .option('-o, --output <path>', 'Output directory for results', './test-results')
  .option('-s, --screenshot', 'Take screenshot', true)
  .option('-p, --pdf', 'Generate PDF', false)
  .option('-a, --accessibility', 'Run accessibility tests', true)
  .option('-sec, --security', 'Run security tests', true)
  .option('-perf, --performance', 'Run performance tests', true)
  .option('-v, --visual', 'Run visual tests', true)
  .option('-n, --network', 'Run network tests', true)
  .option('--headless <mode>', 'Headless mode (new|true|false)', 'new')
  .option('--devtools', 'Open DevTools', false)
  .option('--slow-mo <ms>', 'Slow down operations by ms', '0')
  .option('--timeout <ms>', 'Navigation timeout', '30000')
  .action(async (url, options) => {
    try {
      logger.info(`Starting comprehensive test for ${url}`);
      
      const app = new HeadlessApp({
        headless: options.headless === 'true' ? true : options.headless === 'false' ? false : 'new',
        devtools: options.devtools,
        slowMo: parseInt(options.slowMo),
        timeout: parseInt(options.timeout)
      }, {
        performanceTracing: options.performance,
        accessibilityTesting: options.accessibility,
        networkInterception: options.network,
        securityAudit: options.security,
        visualTesting: options.visual,
        mobileEmulation: false
      });

      await app.initialize();
      
      // Create output directory
      await fs.mkdir(options.output, { recursive: true });
      
      // Run comprehensive test
      const result = await app.runComprehensiveTest(url);
      
      // Save result
      const resultFile = path.join(options.output, `test-result-${Date.now()}.json`);
      await fs.writeFile(resultFile, JSON.stringify(result, null, 2));
      
      // Take screenshot if requested
      if (options.screenshot) {
        const pageId = 'test-page';
        await app.createPage(pageId);
        await app.navigateToPage(pageId, url);
        
        const screenshot = await app.takeScreenshot(pageId, { fullPage: true });
        const screenshotFile = path.join(options.output, `screenshot-${Date.now()}.png`);
        await fs.writeFile(screenshotFile, screenshot);
        
        await app.closePage(pageId);
        logger.info(`Screenshot saved: ${screenshotFile}`);
      }
      
      // Generate PDF if requested
      if (options.pdf) {
        const pageId = 'pdf-page';
        await app.createPage(pageId);
        await app.navigateToPage(pageId, url);
        
        const pdf = await app.generatePDF(pageId);
        const pdfFile = path.join(options.output, `report-${Date.now()}.pdf`);
        await fs.writeFile(pdfFile, pdf);
        
        await app.closePage(pageId);
        logger.info(`PDF saved: ${pdfFile}`);
      }
      
      await app.cleanup();
      
      console.log('✅ Test completed successfully!');
      console.log(`📊 Overall Score: ${result.score}/100`);
      console.log(`📁 Results saved to: ${options.output}`);
      console.log(`📄 Result file: ${resultFile}`);
      
    } catch (error) {
      logger.error('Test failed:', error);
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  });

// Screenshot command
program
  .command('screenshot <url>')
  .description('Take a screenshot of a URL')
  .option('-o, --output <path>', 'Output file path', 'screenshot.png')
  .option('--full-page', 'Take full page screenshot', true)
  .option('--viewport <width>x<height>', 'Set viewport size', '1920x1080')
  .option('--format <format>', 'Image format (png|jpeg)', 'png')
  .option('--quality <quality>', 'Image quality (0-100)', '90')
  .action(async (url, options) => {
    try {
      logger.info(`Taking screenshot of ${url}`);
      
      const [width, height] = options.viewport.split('x').map(Number);
      
      const app = new HeadlessApp({
        viewport: { width, height, deviceScaleFactor: 1 }
      });
      
      await app.initialize();
      
      const pageId = 'screenshot-page';
      await app.createPage(pageId);
      await app.navigateToPage(pageId, url);
      
      const screenshot = await app.takeScreenshot(pageId, {
        fullPage: options.fullPage,
        type: options.format,
        quality: parseInt(options.quality)
      });
      
      await fs.writeFile(options.output, screenshot);
      await app.cleanup();
      
      console.log(`✅ Screenshot saved: ${options.output}`);
      
    } catch (error) {
      logger.error('Screenshot failed:', error);
      console.error('❌ Screenshot failed:', error.message);
      process.exit(1);
    }
  });

// PDF command
program
  .command('pdf <url>')
  .description('Generate PDF from a URL')
  .option('-o, --output <path>', 'Output file path', 'document.pdf')
  .option('--format <format>', 'Page format (A4|A3|Letter)', 'A4')
  .option('--landscape', 'Landscape orientation', false)
  .option('--print-background', 'Print background graphics', true)
  .action(async (url, options) => {
    try {
      logger.info(`Generating PDF from ${url}`);
      
      const app = new HeadlessApp();
      await app.initialize();
      
      const pageId = 'pdf-page';
      await app.createPage(pageId);
      await app.navigateToPage(pageId, url);
      
      const pdf = await app.generatePDF(pageId, {
        format: options.format,
        landscape: options.landscape,
        printBackground: options.printBackground
      });
      
      await fs.writeFile(options.output, pdf);
      await app.cleanup();
      
      console.log(`✅ PDF saved: ${options.output}`);
      
    } catch (error) {
      logger.error('PDF generation failed:', error);
      console.error('❌ PDF generation failed:', error.message);
      process.exit(1);
    }
  });

// Performance command
program
  .command('performance <url>')
  .description('Analyze performance of a URL')
  .option('-o, --output <path>', 'Output directory for results', './performance-results')
  .option('--trace', 'Generate performance trace', false)
  .action(async (url, options) => {
    try {
      logger.info(`Analyzing performance of ${url}`);
      
      const app = new HeadlessApp({
        devtools: true
      }, {
        performanceTracing: true
      });
      
      await app.initialize();
      
      const pageId = 'perf-page';
      await app.createPage(pageId);
      await app.navigateToPage(pageId, url);
      
      const page = (app as any).pages.get(pageId);
      const cdpSession = (app as any).cdpSessions.get(pageId);
      
      // Get performance metrics
      const performanceResult = await (app as any).testPerformance(page, cdpSession);
      
      // Create output directory
      await fs.mkdir(options.output, { recursive: true });
      
      // Save performance data
      const perfFile = path.join(options.output, `performance-${Date.now()}.json`);
      await fs.writeFile(perfFile, JSON.stringify(performanceResult, null, 2));
      
      // Generate trace if requested
      if (options.trace) {
        const traceFile = path.join(options.output, `trace-${Date.now()}.json`);
        // Note: In a real implementation, you would collect actual trace data
        await fs.writeFile(traceFile, JSON.stringify({ message: 'Trace data would be collected here' }, null, 2));
        logger.info(`Trace saved: ${traceFile}`);
      }
      
      await app.cleanup();
      
      console.log('✅ Performance analysis completed!');
      console.log(`📊 Performance Score: ${performanceResult.score}/100`);
      console.log(`📁 Results saved to: ${options.output}`);
      
    } catch (error) {
      logger.error('Performance analysis failed:', error);
      console.error('❌ Performance analysis failed:', error.message);
      process.exit(1);
    }
  });

// Accessibility command
program
  .command('accessibility <url>')
  .description('Test accessibility of a URL')
  .option('-o, --output <path>', 'Output directory for results', './accessibility-results')
  .option('--level <level>', 'WCAG level (A|AA|AAA)', 'AA')
  .action(async (url, options) => {
    try {
      logger.info(`Testing accessibility of ${url}`);
      
      const app = new HeadlessApp({}, {
        accessibilityTesting: true
      });
      
      await app.initialize();
      
      const pageId = 'a11y-page';
      await app.createPage(pageId);
      await app.navigateToPage(pageId, url);
      
      const page = (app as any).pages.get(pageId);
      const cdpSession = (app as any).cdpSessions.get(pageId);
      
      // Run accessibility test
      const accessibilityResult = await (app as any).testAccessibility(page, cdpSession);
      
      // Create output directory
      await fs.mkdir(options.output, { recursive: true });
      
      // Save accessibility data
      const a11yFile = path.join(options.output, `accessibility-${Date.now()}.json`);
      await fs.writeFile(a11yFile, JSON.stringify(accessibilityResult, null, 2));
      
      await app.cleanup();
      
      console.log('✅ Accessibility test completed!');
      console.log(`📊 Accessibility Score: ${accessibilityResult.score}/100`);
      console.log(`🚨 Violations: ${accessibilityResult.violations.length}`);
      console.log(`📁 Results saved to: ${options.output}`);
      
    } catch (error) {
      logger.error('Accessibility test failed:', error);
      console.error('❌ Accessibility test failed:', error.message);
      process.exit(1);
    }
  });

// Security command
program
  .command('security <url>')
  .description('Test security of a URL')
  .option('-o, --output <path>', 'Output directory for results', './security-results')
  .action(async (url, options) => {
    try {
      logger.info(`Testing security of ${url}`);
      
      const app = new HeadlessApp({}, {
        securityAudit: true
      });
      
      await app.initialize();
      
      const pageId = 'security-page';
      await app.createPage(pageId);
      await app.navigateToPage(pageId, url);
      
      const page = (app as any).pages.get(pageId);
      const cdpSession = (app as any).cdpSessions.get(pageId);
      
      // Run security test
      const securityResult = await (app as any).testSecurity(page, cdpSession);
      
      // Create output directory
      await fs.mkdir(options.output, { recursive: true });
      
      // Save security data
      const securityFile = path.join(options.output, `security-${Date.now()}.json`);
      await fs.writeFile(securityFile, JSON.stringify(securityResult, null, 2));
      
      await app.cleanup();
      
      console.log('✅ Security test completed!');
      console.log(`📊 Security Score: ${securityResult.score}/100`);
      console.log(`🔒 HTTPS: ${securityResult.httpsStatus ? '✅' : '❌'}`);
      console.log(`🛡️ CSP: ${securityResult.cspStatus ? '✅' : '❌'}`);
      console.log(`📁 Results saved to: ${options.output}`);
      
    } catch (error) {
      logger.error('Security test failed:', error);
      console.error('❌ Security test failed:', error.message);
      process.exit(1);
    }
  });

// Demo command
program
  .command('demo')
  .description('Run comprehensive demo with multiple test URLs')
  .option('-o, --output <path>', 'Output directory for results', './demo-results')
  .action(async (options) => {
    try {
      logger.info('Starting comprehensive demo');
      
      const demo = new HeadlessDemo();
      await demo.initialize();
      
      // Update results directory
      (demo as any).resultsDir = options.output;
      await fs.mkdir(options.output, { recursive: true });
      
      await demo.runDemo();
      await demo.cleanup();
      
      console.log('🎉 Demo completed successfully!');
      console.log(`📁 Results saved to: ${options.output}`);
      
    } catch (error) {
      logger.error('Demo failed:', error);
      console.error('❌ Demo failed:', error.message);
      process.exit(1);
    }
  });

// Server command
program
  .command('server')
  .description('Start headless API server')
  .option('-p, --port <port>', 'Server port', '3001')
  .option('--host <host>', 'Server host', 'localhost')
  .action(async (options) => {
    try {
      logger.info(`Starting headless API server on ${options.host}:${options.port}`);
      
      // Import and start the API server
      const { HeadlessAPIServer } = await import('../server/HeadlessAPIServer');
      const server = new HeadlessAPIServer(parseInt(options.port));
      
      await server.start();
      
      console.log(`🚀 Headless API server started!`);
      console.log(`📍 URL: http://${options.host}:${options.port}`);
      console.log(`📊 Health: http://${options.host}:${options.port}/health`);
      console.log(`📋 API Status: http://${options.host}:${options.port}/api/status`);
      
    } catch (error) {
      logger.error('Server failed to start:', error);
      console.error('❌ Server failed to start:', error.message);
      process.exit(1);
    }
  });

// Help command
program
  .command('help')
  .description('Show help information')
  .action(() => {
    console.log(`
🚀 Headless Chrome CLI - Advanced Web Testing Tool

Commands:
  test <url>           Run comprehensive test on a URL
  screenshot <url>     Take a screenshot of a URL
  pdf <url>           Generate PDF from a URL
  performance <url>    Analyze performance of a URL
  accessibility <url>  Test accessibility of a URL
  security <url>       Test security of a URL
  demo                Run comprehensive demo
  server              Start headless API server
  help                Show this help message

Examples:
  headless-cli test https://example.com
  headless-cli screenshot https://example.com -o screenshot.png
  headless-cli pdf https://example.com -o document.pdf
  headless-cli performance https://example.com --trace
  headless-cli accessibility https://example.com
  headless-cli security https://example.com
  headless-cli demo
  headless-cli server --port 3001

For more information, visit: https://github.com/your-repo/headless-chrome-cli
    `);
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

export default program;
