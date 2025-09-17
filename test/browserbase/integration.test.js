/**
 * Browserbase Integration Tests
 * 
 * Comprehensive test suite for Browserbase MCP server integration
 * with LightDom enhanced web crawling capabilities.
 */

const { expect } = require('chai');
const { describe, it, before, after, beforeEach } = require('mocha');
const BrowserbaseService = require('../../src/services/BrowserbaseService.js');
const EnhancedWebCrawlerService = require('../../src/services/EnhancedWebCrawlerService.js');
const BrowserbaseAPI = require('../../src/api/BrowserbaseAPI.js');

describe('Browserbase Integration Tests', function() {
  this.timeout(60000); // 60 seconds timeout for integration tests

  let browserbaseService;
  let enhancedCrawler;
  let browserbaseAPI;
  let testSession;

  before(async function() {
    // Skip tests if API keys are not configured
    if (!process.env.BROWSERBASE_API_KEY || !process.env.BROWSERBASE_PROJECT_ID) {
      console.log('⚠️  Skipping Browserbase tests - API keys not configured');
      this.skip();
    }

    // Initialize services
    browserbaseService = new BrowserbaseService({
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      modelApiKey: process.env.GEMINI_API_KEY,
      modelName: 'google/gemini-2.0-flash',
      proxies: false, // Disable for testing
      advancedStealth: false, // Disable for testing
      keepAlive: false // Disable for testing
    });

    await browserbaseService.initialize();
  });

  after(async function() {
    if (browserbaseService) {
      await browserbaseService.disconnect();
    }
  });

  beforeEach(async function() {
    // Create a fresh test session for each test
    if (browserbaseService) {
      testSession = await browserbaseService.createSession({
        viewport: { width: 1280, height: 720 },
        stealth: false
      });
    }
  });

  afterEach(async function() {
    // Clean up test session
    if (testSession && browserbaseService) {
      try {
        await browserbaseService.closeSession(testSession.id);
      } catch (error) {
        console.warn('Warning: Failed to close test session:', error.message);
      }
    }
  });

  describe('BrowserbaseService', function() {
    it('should initialize successfully', async function() {
      expect(browserbaseService).to.exist;
      expect(browserbaseService.getStatus().connected).to.be.true;
    });

    it('should create and manage sessions', async function() {
      expect(testSession).to.exist;
      expect(testSession.id).to.be.a('string');
      expect(testSession.isActive).to.be.true;
      expect(testSession.createdAt).to.be.instanceOf(Date);

      const sessions = browserbaseService.listSessions();
      expect(sessions).to.be.an('array');
      expect(sessions.length).to.be.greaterThan(0);
    });

    it('should navigate to URLs', async function() {
      const result = await browserbaseService.navigateToUrl(
        testSession.id,
        'https://example.com'
      );

      expect(result.success).to.be.true;
      expect(result.message).to.be.a('string');
    });

    it('should execute natural language instructions', async function() {
      // First navigate to a page
      await browserbaseService.navigateToUrl(testSession.id, 'https://example.com');

      // Execute AI instructions
      const result = await browserbaseService.executeInstructions(
        testSession.id,
        'Take a screenshot of the page'
      );

      expect(result.success).to.be.true;
      expect(result.message).to.be.a('string');
    });

    it('should capture screenshots', async function() {
      // Navigate to a page first
      await browserbaseService.navigateToUrl(testSession.id, 'https://example.com');

      // Capture screenshot
      const screenshot = await browserbaseService.captureScreenshot(testSession.id, {
        fullPage: false,
        format: 'png'
      });

      expect(screenshot).to.be.instanceOf(Buffer);
      expect(screenshot.length).to.be.greaterThan(0);
    });

    it('should extract data from pages', async function() {
      // Navigate to a page first
      await browserbaseService.navigateToUrl(testSession.id, 'https://example.com');

      // Extract data
      const extractedData = await browserbaseService.extractData(testSession.id, {
        selectors: ['h1', 'p', 'title'],
        textContent: true,
        attributes: ['href', 'src']
      });

      expect(extractedData).to.exist;
      expect(extractedData.url).to.equal('https://example.com');
      expect(extractedData.elements).to.be.an('array');
      expect(extractedData.timestamp).to.be.instanceOf(Date);
    });

    it('should handle session cleanup', async function() {
      const sessionId = testSession.id;
      
      await browserbaseService.closeSession(sessionId);
      
      const session = browserbaseService.getSession(sessionId);
      expect(session.isActive).to.be.false;
    });
  });

  describe('Enhanced Web Crawler Service', function() {
    beforeEach(function() {
      // Mock the required services for testing
      const mockHeadlessService = {
        createPage: () => Promise.resolve({}),
        navigateToPage: () => Promise.resolve(),
        analyzeDOM: () => Promise.resolve({}),
        takeScreenshot: () => Promise.resolve(Buffer.from('mock')),
        closePage: () => Promise.resolve()
      };

      const mockOptimizationEngine = {
        analyzeOptimization: () => Promise.resolve({
          spaceSavedBytes: 1000,
          optimizations: []
        })
      };

      enhancedCrawler = new EnhancedWebCrawlerService(
        mockHeadlessService,
        browserbaseService,
        mockOptimizationEngine
      );
    });

    it('should perform AI-powered crawling', async function() {
      const result = await enhancedCrawler.crawlWebsiteWithAI('https://example.com', {
        useAI: true,
        aiInstructions: 'Extract the main heading and take a screenshot',
        extractWithAI: true,
        extractData: ['h1', 'title'],
        takeScreenshot: true
      });

      expect(result).to.exist;
      expect(result.success).to.be.true;
      expect(result.url).to.equal('https://example.com');
      expect(result.aiResult).to.exist;
      expect(result.extractedData).to.exist;
      expect(result.performanceMetrics).to.exist;
    });

    it('should perform AI optimization analysis', async function() {
      // First extract some data
      await browserbaseService.navigateToUrl(testSession.id, 'https://example.com');
      const extractedData = await browserbaseService.extractData(testSession.id, {
        selectors: ['html', 'head', 'body'],
        textContent: true
      });

      // Perform optimization analysis
      const optimization = await enhancedCrawler.performAIOptimizationAnalysis(
        testSession.id,
        'https://example.com',
        extractedData
      );

      expect(optimization).to.exist;
      expect(optimization.url).to.equal('https://example.com');
      expect(optimization.originalSize).to.be.a('number');
      expect(optimization.optimizedSize).to.be.a('number');
      expect(optimization.savings).to.be.a('number');
      expect(optimization.optimizations).to.be.an('array');
      expect(optimization.aiAnalysis).to.exist;
    });

    it('should manage AI sessions', async function() {
      const activeSessions = enhancedCrawler.getActiveAISessions();
      expect(activeSessions).to.be.instanceOf(Map);

      const status = enhancedCrawler.getEnhancedStatus();
      expect(status).to.exist;
      expect(status.ai).to.exist;
      expect(status.activeAISessions).to.be.a('number');
    });
  });

  describe('BrowserbaseAPI', function() {
    beforeEach(function() {
      // Mock services for API testing
      const mockWebCrawlerService = {
        crawlWebsite: () => Promise.resolve({
          domAnalysis: {},
          websiteData: {},
          opportunities: [],
          screenshot: Buffer.from('mock')
        })
      };

      const mockOptimizationEngine = {
        analyzeOptimization: () => Promise.resolve({
          spaceSavedBytes: 1000,
          optimizations: []
        })
      };

      browserbaseAPI = new BrowserbaseAPI(
        browserbaseService,
        mockWebCrawlerService,
        mockOptimizationEngine
      );
    });

    it('should create API endpoints', function() {
      expect(browserbaseAPI).to.exist;
      expect(browserbaseAPI.setupRoutes).to.be.a('function');
    });

    it('should handle AI crawling requests', async function() {
      const mockReq = {
        body: {
          url: 'https://example.com',
          instructions: 'Extract the main content',
          options: {
            useAI: true,
            takeScreenshot: true
          }
        }
      };

      const mockRes = {
        json: (data) => {
          expect(data.success).to.be.true;
          expect(data.data.url).to.equal('https://example.com');
          expect(data.data.instructions).to.equal('Extract the main content');
        },
        status: (code) => ({
          json: (data) => {
            expect(code).to.equal(200);
            expect(data.success).to.be.true;
          }
        })
      };

      await browserbaseAPI.crawlWithAI(mockReq, mockRes);
    });

    it('should handle session management requests', async function() {
      const mockReq = {
        body: {
          viewport: { width: 1280, height: 720 },
          stealth: true
        }
      };

      const mockRes = {
        json: (data) => {
          expect(data.success).to.be.true;
          expect(data.data.sessionId).to.be.a('string');
        },
        status: (code) => ({
          json: (data) => {
            expect(code).to.equal(200);
            expect(data.success).to.be.true;
          }
        })
      };

      await browserbaseAPI.createSession(mockReq, mockRes);
    });
  });

  describe('Performance Tests', function() {
    it('should handle concurrent sessions', async function() {
      const sessionPromises = [];
      
      // Create multiple concurrent sessions
      for (let i = 0; i < 3; i++) {
        sessionPromises.push(
          browserbaseService.createSession({
            viewport: { width: 1280, height: 720 }
          })
        );
      }

      const sessions = await Promise.all(sessionPromises);
      expect(sessions).to.have.length(3);

      // Clean up sessions
      await Promise.all(
        sessions.map(session => browserbaseService.closeSession(session.id))
      );
    });

    it('should handle rapid operations', async function() {
      const startTime = Date.now();
      
      // Perform multiple rapid operations
      await browserbaseService.navigateToUrl(testSession.id, 'https://example.com');
      await browserbaseService.captureScreenshot(testSession.id);
      await browserbaseService.extractData(testSession.id, {
        selectors: ['title'],
        textContent: true
      });

      const duration = Date.now() - startTime;
      expect(duration).to.be.lessThan(30000); // Should complete within 30 seconds
    });
  });

  describe('Error Handling', function() {
    it('should handle invalid URLs gracefully', async function() {
      try {
        await browserbaseService.navigateToUrl(testSession.id, 'invalid-url');
        // Should not reach here
        expect.fail('Should have thrown an error for invalid URL');
      } catch (error) {
        expect(error).to.exist;
        expect(error.message).to.be.a('string');
      }
    });

    it('should handle invalid session IDs', async function() {
      try {
        await browserbaseService.navigateToUrl('invalid-session-id', 'https://example.com');
        expect.fail('Should have thrown an error for invalid session ID');
      } catch (error) {
        expect(error).to.exist;
        expect(error.message).to.include('not found');
      }
    });

    it('should handle network timeouts', async function() {
      try {
        await browserbaseService.navigateToUrl(testSession.id, 'https://httpstat.us/200?sleep=10000', {
          timeout: 5000
        });
        expect.fail('Should have thrown a timeout error');
      } catch (error) {
        expect(error).to.exist;
        // Timeout errors are acceptable
      }
    });
  });
});
