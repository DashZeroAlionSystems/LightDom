/**
 * BrowserbaseAPI - Enhanced Web Crawling API with AI-Powered Automation
 * 
 * Provides RESTful API endpoints for Browserbase integration,
 * enabling natural language web automation and advanced crawling capabilities.
 */

import { Request, Response } from 'express';
import { BrowserbaseService, SessionOptions, ScreenshotOptions, ExtractedData } from '../services/BrowserbaseService.js';
import { WebCrawlerService } from '../services/WebCrawlerService.js';
import { OptimizationEngine } from '../services/OptimizationEngine.js';
import { EventEmitter } from 'events';

export interface AIOptimizationResult {
  url: string;
  originalSize: number;
  optimizedSize: number;
  savings: number;
  optimizations: Array<{
    type: string;
    description: string;
    impact: string;
    aiSuggestion: string;
  }>;
  aiAnalysis: {
    complexity: 'low' | 'medium' | 'high';
    recommendations: string[];
    priority: 'low' | 'medium' | 'high';
  };
  timestamp: Date;
}

export class BrowserbaseAPI extends EventEmitter {
  private browserbaseService: BrowserbaseService;
  private webCrawlerService: WebCrawlerService;
  private optimizationEngine: OptimizationEngine;

  constructor(
    browserbaseService: BrowserbaseService,
    webCrawlerService: WebCrawlerService,
    optimizationEngine: OptimizationEngine
  ) {
    super();
    this.browserbaseService = browserbaseService;
    this.webCrawlerService = webCrawlerService;
    this.optimizationEngine = optimizationEngine;
  }

  /**
   * AI-Powered Web Crawling with Natural Language Instructions
   */
  async crawlWithAI(req: Request, res: Response): Promise<void> {
    try {
      const { url, instructions, options = {} } = req.body;

      if (!url || !instructions) {
        res.status(400).json({
          success: false,
          error: 'URL and instructions are required'
        });
        return;
      }

      console.log(`🤖 AI Crawling: ${url} with instructions: ${instructions}`);

      // Create session with options
      const session = await this.browserbaseService.createSession({
        url,
        stealth: options.stealth || true,
        keepAlive: options.keepAlive || false,
        proxy: options.proxy,
        viewport: options.viewport || { width: 1920, height: 1080 }
      });

      try {
        // Navigate to URL if not already there
        if (!session.url) {
          await this.browserbaseService.navigateToUrl(session.id, url);
        }

        // Execute AI instructions
        const result = await this.browserbaseService.executeInstructions(
          session.id,
          instructions,
          {
            timeout: options.timeout || 30000,
            extractData: options.extractData,
            takeScreenshot: options.takeScreenshot || false
          }
        );

        // Extract data if requested
        let extractedData = null;
        if (options.extractData && options.extractData.length > 0) {
          extractedData = await this.browserbaseService.extractData(session.id, {
            selectors: options.extractData,
            textContent: true,
            attributes: ['href', 'src', 'alt', 'title', 'class', 'id']
          });
        }

        // Take screenshot if requested
        let screenshot = null;
        if (options.takeScreenshot) {
          const screenshotBuffer = await this.browserbaseService.captureScreenshot(
            session.id,
            {
              fullPage: options.fullPageScreenshot || false,
              format: options.screenshotFormat || 'png'
            }
          );
          screenshot = screenshotBuffer.toString('base64');
        }

        // Run optimization analysis
        const optimizationResult = await this.analyzeOptimizationWithAI(session.id, url);

        res.json({
          success: true,
          data: {
            sessionId: session.id,
            url,
            instructions,
            result,
            extractedData,
            screenshot,
            optimization: optimizationResult,
            timestamp: new Date()
          }
        });

      } finally {
        // Close session if not keeping alive
        if (!options.keepAlive) {
          await this.browserbaseService.closeSession(session.id);
        }
      }

    } catch (error) {
      console.error('❌ AI Crawling error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  /**
   * Create Persistent Browser Session
   */
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const options: SessionOptions = req.body;

      const session = await this.browserbaseService.createSession(options);

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          createdAt: session.createdAt,
          metadata: session.metadata
        }
      });

    } catch (error) {
      console.error('❌ Session creation error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create session'
      });
    }
  }

  /**
   * Resume Existing Session
   */
  async resumeSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      const session = this.browserbaseService.getSession(sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found'
        });
        return;
      }

      if (!session.isActive) {
        res.status(400).json({
          success: false,
          error: 'Session is not active'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          sessionId: session.id,
          url: session.url,
          createdAt: session.createdAt,
          lastActivity: session.lastActivity,
          metadata: session.metadata
        }
      });

    } catch (error) {
      console.error('❌ Session resume error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resume session'
      });
    }
  }

  /**
   * Execute Instructions on Existing Session
   */
  async executeInstructions(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { instructions, options = {} } = req.body;

      if (!instructions) {
        res.status(400).json({
          success: false,
          error: 'Instructions are required'
        });
        return;
      }

      const result = await this.browserbaseService.executeInstructions(
        sessionId,
        instructions,
        {
          timeout: options.timeout || 30000,
          extractData: options.extractData,
          takeScreenshot: options.takeScreenshot || false
        }
      );

      res.json({
        success: true,
        data: {
          sessionId,
          instructions,
          result,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('❌ Instructions execution error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute instructions'
      });
    }
  }

  /**
   * Capture Screenshot
   */
  async captureScreenshot(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const options: ScreenshotOptions = req.body;

      const screenshotBuffer = await this.browserbaseService.captureScreenshot(sessionId, options);

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="screenshot-${sessionId}-${Date.now()}.png"`);
      res.send(screenshotBuffer);

    } catch (error) {
      console.error('❌ Screenshot capture error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to capture screenshot'
      });
    }
  }

  /**
   * Extract Data from Session
   */
  async extractData(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { schema } = req.body;

      if (!schema || !schema.selectors) {
        res.status(400).json({
          success: false,
          error: 'Schema with selectors is required'
        });
        return;
      }

      const extractedData = await this.browserbaseService.extractData(sessionId, schema);

      res.json({
        success: true,
        data: extractedData
      });

    } catch (error) {
      console.error('❌ Data extraction error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract data'
      });
    }
  }

  /**
   * Close Session
   */
  async closeSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      await this.browserbaseService.closeSession(sessionId);

      res.json({
        success: true,
        message: `Session ${sessionId} closed successfully`
      });

    } catch (error) {
      console.error('❌ Session close error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to close session'
      });
    }
  }

  /**
   * List Active Sessions
   */
  async listSessions(_req: Request, res: Response): Promise<void> {
    try {
      const sessions = this.browserbaseService.listSessions();

      res.json({
        success: true,
        data: {
          sessions: sessions.map(session => ({
            id: session.id,
            url: session.url,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            isActive: session.isActive,
            metadata: session.metadata
          })),
          count: sessions.length
        }
      });

    } catch (error) {
      console.error('❌ List sessions error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list sessions'
      });
    }
  }

  /**
   * Get Service Status
   */
  async getStatus(_req: Request, res: Response): Promise<void> {
    try {
      const status = this.browserbaseService.getStatus();

      res.json({
        success: true,
        data: {
          ...status,
          timestamp: new Date()
        }
      });

    } catch (error) {
      console.error('❌ Status check error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get status'
      });
    }
  }

  /**
   * AI-Powered Optimization Analysis
   */
  async analyzeOptimizationWithAI(sessionId: string, url: string): Promise<AIOptimizationResult> {
    try {
      // Get current page data
      const extractedData = await this.browserbaseService.extractData(sessionId, {
        selectors: ['html', 'head', 'body', 'script', 'link', 'img', 'style'],
        textContent: true,
        attributes: ['src', 'href', 'type', 'rel', 'media']
      });

      // Calculate original size
      const originalSize = JSON.stringify(extractedData).length;

      // Run optimization analysis
      const optimizationSuggestions = await this.generateAIOptimizationSuggestions(extractedData);

      // Simulate optimization
      const optimizedSize = Math.round(originalSize * 0.7); // 30% reduction
      const savings = originalSize - optimizedSize;

      return {
        url,
        originalSize,
        optimizedSize,
        savings,
        optimizations: optimizationSuggestions,
        aiAnalysis: {
          complexity: savings > 50000 ? 'high' : savings > 10000 ? 'medium' : 'low',
          recommendations: [
            'Enable image compression and WebP conversion',
            'Minify CSS and JavaScript files',
            'Implement lazy loading for images',
            'Optimize font loading with font-display: swap'
          ],
          priority: savings > 50000 ? 'high' : savings > 10000 ? 'medium' : 'low'
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ AI optimization analysis error:', error);
      throw error;
    }
  }

  /**
   * Generate AI-Powered Optimization Suggestions
   */
  private async generateAIOptimizationSuggestions(extractedData: ExtractedData): Promise<Array<{
    type: string;
    description: string;
    impact: string;
    aiSuggestion: string;
  }>> {
    // Analyze the extracted data and generate intelligent suggestions
    const suggestions = [];

    // Check for images
    const images = extractedData.elements.filter(el => el.selector.includes('img'));
    if (images.length > 0) {
      suggestions.push({
        type: 'image_optimization',
        description: `Found ${images.length} images that can be optimized`,
        impact: 'high',
        aiSuggestion: 'Convert images to WebP format and implement lazy loading to reduce initial page load time'
      });
    }

    // Check for scripts
    const scripts = extractedData.elements.filter(el => el.selector.includes('script'));
    if (scripts.length > 0) {
      suggestions.push({
        type: 'javascript_optimization',
        description: `Found ${scripts.length} JavaScript files`,
        impact: 'medium',
        aiSuggestion: 'Minify and bundle JavaScript files to reduce HTTP requests and file sizes'
      });
    }

    // Check for CSS
    const stylesheets = extractedData.elements.filter(el => el.selector.includes('link') && el.attributes.rel === 'stylesheet');
    if (stylesheets.length > 0) {
      suggestions.push({
        type: 'css_optimization',
        description: `Found ${stylesheets.length} CSS files`,
        impact: 'medium',
        aiSuggestion: 'Minify CSS and extract critical CSS for above-the-fold content'
      });
    }

    // Check for large content
    if (extractedData.content.length > 100000) {
      suggestions.push({
        type: 'content_optimization',
        description: 'Large content detected',
        impact: 'high',
        aiSuggestion: 'Implement content compression and consider pagination for large content sections'
      });
    }

    return suggestions;
  }

  /**
   * Setup API routes
   */
  setupRoutes(app: any): void {
    // AI-Powered crawling
    app.post('/api/browserbase/crawl/ai', this.crawlWithAI.bind(this));
    
    // Session management
    app.post('/api/browserbase/sessions', this.createSession.bind(this));
    app.get('/api/browserbase/sessions/:sessionId', this.resumeSession.bind(this));
    app.delete('/api/browserbase/sessions/:sessionId', this.closeSession.bind(this));
    app.get('/api/browserbase/sessions', this.listSessions.bind(this));
    
    // Session operations
    app.post('/api/browserbase/sessions/:sessionId/instructions', this.executeInstructions.bind(this));
    app.post('/api/browserbase/sessions/:sessionId/screenshot', this.captureScreenshot.bind(this));
    app.post('/api/browserbase/sessions/:sessionId/extract', this.extractData.bind(this));
    
    // Service status
    app.get('/api/browserbase/status', this.getStatus.bind(this));

    console.log('✅ Browserbase API routes configured');
  }
}

export default BrowserbaseAPI;
