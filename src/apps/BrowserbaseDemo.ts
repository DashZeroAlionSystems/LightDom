/**
 * Browserbase Demo Application
 *
 * Demonstrates AI-powered web crawling and automation capabilities
 * using Browserbase MCP server integration with LightDom.
 */

import { BrowserbaseService } from '../services/BrowserbaseService.js';
import { EnhancedWebCrawlerService } from '../services/EnhancedWebCrawlerService.js';
import { OptimizationEngine } from '../services/OptimizationEngine.js';
import chalk from 'chalk';

interface DemoConfig {
  apiKey: string;
  projectId: string;
  modelApiKey?: string;
}

class BrowserbaseDemo {
  private browserbaseService: BrowserbaseService;
  private enhancedCrawler: EnhancedWebCrawlerService;
  private optimizationEngine: OptimizationEngine;

  constructor(config: DemoConfig) {
    // Initialize Browserbase service
    this.browserbaseService = new BrowserbaseService({
      apiKey: config.apiKey,
      projectId: config.projectId,
      modelApiKey: config.modelApiKey,
      modelName: 'google/gemini-2.0-flash',
      proxies: false, // Disable for demo
      advancedStealth: false, // Disable for demo
      keepAlive: false, // Disable for demo
    });

    // Initialize optimization engine
    this.optimizationEngine = new OptimizationEngine();

    // Mock headless service for demo
    const mockHeadlessService = {
      createPage: () => Promise.resolve({}),
      navigateToPage: () => Promise.resolve(),
      analyzeDOM: () => Promise.resolve({}),
      takeScreenshot: () => Promise.resolve(Buffer.from('mock')),
      closePage: () => Promise.resolve(),
    };

    // Initialize enhanced crawler
    this.enhancedCrawler = new EnhancedWebCrawlerService(
      mockHeadlessService,
      this.browserbaseService,
      this.optimizationEngine
    );
  }

  async run() {
    console.log(chalk.blue.bold('🚀 Browserbase Demo - AI-Powered Web Crawling'));
    console.log(
      chalk.gray('Demonstrating enhanced crawling capabilities with natural language automation\n')
    );

    try {
      await this.initialize();
      await this.demoBasicNavigation();
      await this.demoNaturalLanguageAutomation();
      await this.demoDataExtraction();
      await this.demoOptimizationAnalysis();
      await this.demoConcurrentSessions();
      await this.cleanup();
    } catch (error) {
      console.error(chalk.red.bold('❌ Demo failed:'), error);
      process.exit(1);
    }
  }

  async initialize() {
    console.log(chalk.yellow('🔧 Initializing Browserbase service...'));

    await this.browserbaseService.initialize();

    const status = this.browserbaseService.getStatus();
    console.log(chalk.green(`✅ Service initialized - Connected: ${status.connected}`));
    console.log(chalk.gray(`   Active sessions: ${status.activeSessions}`));
  }

  async demoBasicNavigation() {
    console.log(chalk.blue.bold('\n📱 Demo 1: Basic Navigation and Screenshots'));

    const session = await this.browserbaseService.createSession({
      viewport: { width: 1280, height: 720 },
      stealth: false,
    });

    try {
      console.log(chalk.gray(`   Created session: ${session.id}`));

      // Navigate to example.com
      console.log(chalk.gray('   Navigating to https://example.com...'));
      const navResult = await this.browserbaseService.navigateToUrl(
        session.id,
        'https://example.com'
      );
      console.log(chalk.green(`   ✅ Navigation successful: ${navResult.message}`));

      // Take a screenshot
      console.log(chalk.gray('   Taking screenshot...'));
      const screenshot = await this.browserbaseService.captureScreenshot(session.id, {
        fullPage: false,
        format: 'png',
      });
      console.log(chalk.green(`   ✅ Screenshot captured: ${screenshot.length} bytes`));
    } finally {
      await this.browserbaseService.closeSession(session.id);
      console.log(chalk.gray(`   Session closed: ${session.id}`));
    }
  }

  async demoNaturalLanguageAutomation() {
    console.log(chalk.blue.bold('\n🤖 Demo 2: Natural Language Automation'));

    const session = await this.browserbaseService.createSession({
      viewport: { width: 1280, height: 720 },
    });

    try {
      console.log(chalk.gray(`   Created session: ${session.id}`));

      // Navigate to a page with interactive elements
      console.log(chalk.gray('   Navigating to https://example.com...'));
      await this.browserbaseService.navigateToUrl(session.id, 'https://example.com');

      // Execute natural language instructions
      const instructions = [
        'Take a screenshot of the page',
        'Extract the main heading text',
        'Get the page title',
      ];

      for (const instruction of instructions) {
        console.log(chalk.gray(`   Executing: "${instruction}"`));

        const result = await this.browserbaseService.executeInstructions(session.id, instruction, {
          timeout: 10000,
          takeScreenshot: instruction.includes('screenshot'),
        });

        console.log(chalk.green(`   ✅ Result: ${result.message}`));

        if (result.screenshot) {
          console.log(chalk.gray(`      Screenshot data: ${result.screenshot.length} bytes`));
        }
      }
    } finally {
      await this.browserbaseService.closeSession(session.id);
      console.log(chalk.gray(`   Session closed: ${session.id}`));
    }
  }

  async demoDataExtraction() {
    console.log(chalk.blue.bold('\n📊 Demo 3: AI-Powered Data Extraction'));

    const session = await this.browserbaseService.createSession();

    try {
      console.log(chalk.gray(`   Created session: ${session.id}`));

      // Navigate to a content-rich page
      console.log(chalk.gray('   Navigating to https://example.com...'));
      await this.browserbaseService.navigateToUrl(session.id, 'https://example.com');

      // Extract structured data
      console.log(chalk.gray('   Extracting structured data...'));
      const extractedData = await this.browserbaseService.extractData(session.id, {
        selectors: ['h1', 'h2', 'h3', 'p', 'title', 'meta'],
        textContent: true,
        attributes: ['href', 'src', 'alt', 'title', 'name', 'content', 'property'],
      });

      console.log(chalk.green('   ✅ Data extraction completed'));
      console.log(chalk.gray(`      URL: ${extractedData.url}`));
      console.log(chalk.gray(`      Title: ${extractedData.title}`));
      console.log(chalk.gray(`      Elements found: ${extractedData.elements.length}`));
      console.log(chalk.gray(`      Content length: ${extractedData.content.length} characters`));

      // Display some extracted elements
      if (extractedData.elements.length > 0) {
        console.log(chalk.gray('   Sample extracted elements:'));
        extractedData.elements.slice(0, 3).forEach((element, index) => {
          console.log(
            chalk.gray(
              `      ${index + 1}. ${element.selector}: "${element.text?.substring(0, 50)}..."`
            )
          );
        });
      }
    } finally {
      await this.browserbaseService.closeSession(session.id);
      console.log(chalk.gray(`   Session closed: ${session.id}`));
    }
  }

  async demoOptimizationAnalysis() {
    console.log(chalk.blue.bold('\n🎯 Demo 4: AI-Powered Optimization Analysis'));

    const session = await this.browserbaseService.createSession();

    try {
      console.log(chalk.gray(`   Created session: ${session.id}`));

      // Navigate to a page for analysis
      console.log(chalk.gray('   Navigating to https://example.com...'));
      await this.browserbaseService.navigateToUrl(session.id, 'https://example.com');

      // Extract data for optimization analysis
      console.log(chalk.gray('   Extracting page data for analysis...'));
      const extractedData = await this.browserbaseService.extractData(session.id, {
        selectors: ['html', 'head', 'body', 'script', 'link', 'img', 'style'],
        textContent: true,
        attributes: ['src', 'href', 'type', 'rel', 'media'],
      });

      // Perform AI optimization analysis
      console.log(chalk.gray('   Running AI optimization analysis...'));
      const optimization = await this.enhancedCrawler.performAIOptimizationAnalysis(
        session.id,
        'https://example.com',
        extractedData
      );

      console.log(chalk.green('   ✅ Optimization analysis completed'));
      console.log(chalk.gray(`      Original size: ${optimization.originalSize} bytes`));
      console.log(chalk.gray(`      Optimized size: ${optimization.optimizedSize} bytes`));
      console.log(
        chalk.gray(
          `      Potential savings: ${optimization.savings} bytes (${optimization.savingsPercentage.toFixed(1)}%)`
        )
      );
      console.log(chalk.gray(`      Complexity: ${optimization.aiAnalysis.complexity}`));
      console.log(chalk.gray(`      Priority: ${optimization.aiAnalysis.priority}`));
      console.log(chalk.gray(`      Confidence: ${optimization.aiAnalysis.confidence}%`));

      // Display optimization suggestions
      if (optimization.optimizations.length > 0) {
        console.log(chalk.gray('   Optimization suggestions:'));
        optimization.optimizations.forEach((opt, index) => {
          console.log(chalk.gray(`      ${index + 1}. ${opt.type} (${opt.impact} impact)`));
          console.log(chalk.gray(`         ${opt.description}`));
          console.log(chalk.gray(`         Estimated savings: ${opt.estimatedSavings} bytes`));
        });
      }
    } finally {
      await this.browserbaseService.closeSession(session.id);
      console.log(chalk.gray(`   Session closed: ${session.id}`));
    }
  }

  async demoConcurrentSessions() {
    console.log(chalk.blue.bold('\n⚡ Demo 5: Concurrent Session Management'));

    const sessionCount = 3;
    const sessions: any[] = [];

    try {
      // Create multiple concurrent sessions
      console.log(chalk.gray(`   Creating ${sessionCount} concurrent sessions...`));

      const sessionPromises = Array.from({ length: sessionCount }, (_, i) =>
        this.browserbaseService.createSession({
          viewport: { width: 1280, height: 720 },
        })
      );

      const createdSessions = await Promise.all(sessionPromises);
      sessions.push(...createdSessions);

      console.log(chalk.green(`   ✅ Created ${sessions.length} concurrent sessions`));

      // Perform operations on all sessions
      console.log(chalk.gray('   Performing concurrent operations...'));

      const operationPromises = sessions.map(async (session, index) => {
        try {
          await this.browserbaseService.navigateToUrl(
            session.id,
            `https://httpbin.org/delay/${index + 1}`
          );

          const screenshot = await this.browserbaseService.captureScreenshot(session.id);

          return {
            sessionId: session.id,
            success: true,
            screenshotSize: screenshot.length,
          };
        } catch (error) {
          return {
            sessionId: session.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      });

      const results = await Promise.all(operationPromises);

      const successful = results.filter(r => r.success).length;
      console.log(
        chalk.green(
          `   ✅ Concurrent operations completed: ${successful}/${results.length} successful`
        )
      );

      // Display results
      results.forEach((result, index) => {
        if (result.success) {
          console.log(
            chalk.gray(
              `      Session ${index + 1}: ✅ (screenshot: ${result.screenshotSize} bytes)`
            )
          );
        } else {
          console.log(chalk.gray(`      Session ${index + 1}: ❌ (${result.error})`));
        }
      });
    } finally {
      // Clean up all sessions
      console.log(chalk.gray('   Cleaning up sessions...'));
      await Promise.all(sessions.map(session => this.browserbaseService.closeSession(session.id)));
      console.log(chalk.gray(`   ✅ Cleaned up ${sessions.length} sessions`));
    }
  }

  async cleanup() {
    console.log(chalk.yellow('\n🧹 Cleaning up...'));

    await this.browserbaseService.disconnect();

    console.log(chalk.green('✅ Cleanup completed'));
    console.log(chalk.blue.bold('\n🎉 Demo completed successfully!'));

    console.log(chalk.gray('\nKey features demonstrated:'));
    console.log(chalk.gray('• AI-powered natural language automation'));
    console.log(chalk.gray('• Intelligent data extraction'));
    console.log(chalk.gray('• Optimization analysis with AI suggestions'));
    console.log(chalk.gray('• Concurrent session management'));
    console.log(chalk.gray('• Screenshot capture and processing'));

    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('• Configure your API keys in .env file'));
    console.log(chalk.gray('• Integrate with your existing crawling workflows'));
    console.log(chalk.gray('• Explore advanced features like stealth mode and proxies'));
  }
}

// Main execution
async function main() {
  // Check for required environment variables
  const requiredEnvVars = ['BROWSERBASE_API_KEY', 'BROWSERBASE_PROJECT_ID'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(chalk.red.bold('❌ Missing required environment variables:'));
    missingVars.forEach(varName => {
      console.error(chalk.red(`   ${varName}`));
    });
    console.error(chalk.yellow('\nPlease set these in your .env file and try again.'));
    console.error(chalk.gray('Run: npm run browserbase:setup'));
    process.exit(1);
  }

  const config: DemoConfig = {
    apiKey: process.env.BROWSERBASE_API_KEY!,
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    modelApiKey: process.env.GEMINI_API_KEY,
  };

  const demo = new BrowserbaseDemo(config);
  await demo.run();
}

// Run demo if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red.bold('Demo failed:'), error);
    process.exit(1);
  });
}

export default BrowserbaseDemo;
