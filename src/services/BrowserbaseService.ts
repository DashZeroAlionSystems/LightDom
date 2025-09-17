/**
 * BrowserbaseService - AI-Powered Web Automation Service
 *
 * Integrates Browserbase MCP server for advanced web crawling capabilities
 * including natural language automation, session management, and stealth operations.
 */

import { EventEmitter } from 'events';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

export interface BrowserSession {
  id: string;
  url?: string;
  title?: string;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface SessionOptions {
  url?: string;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
  proxy?: {
    server: string;
    username?: string;
    password?: string;
  };
  stealth?: boolean;
  keepAlive?: boolean;
  contextId?: string;
}

export interface ScreenshotOptions {
  fullPage?: boolean;
  format?: 'png' | 'jpeg';
  quality?: number;
  selector?: string;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  screenshot?: string;
  timestamp: Date;
}

export interface CrawlInstructions {
  instructions: string;
  extractData?: string[];
  takeScreenshot?: boolean;
  waitForSelector?: string;
  timeout?: number;
}

export interface ExtractedData {
  url: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  elements: Array<{
    selector: string;
    text: string;
    attributes: Record<string, string>;
  }>;
  timestamp: Date;
}

export class BrowserbaseService extends EventEmitter {
  private mcpClient: Client;
  private sessions: Map<string, BrowserSession> = new Map();
  private isConnected: boolean = false;
  private config: {
    apiKey: string;
    projectId: string;
    modelApiKey?: string;
    modelName?: string;
    proxies?: boolean;
    advancedStealth?: boolean;
    keepAlive?: boolean;
  };

  constructor(config: {
    apiKey: string;
    projectId: string;
    modelApiKey?: string;
    modelName?: string;
    proxies?: boolean;
    advancedStealth?: boolean;
    keepAlive?: boolean;
  }) {
    super();
    this.config = config;
    this.mcpClient = new Client(
      {
        name: 'lightdom-browserbase-client',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );
  }

  /**
   * Initialize the Browserbase MCP connection
   */
  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Browserbase MCP Service...');

      // Connect to MCP server
      await this.mcpClient.connect({
        command: 'npx',
        args: [
          '@browserbasehq/mcp-server-browserbase',
          ...(this.config.proxies ? ['--proxies'] : []),
          ...(this.config.advancedStealth ? ['--advancedStealth'] : []),
          ...(this.config.keepAlive ? ['--keepAlive'] : []),
          ...(this.config.modelName ? ['--modelName', this.config.modelName] : []),
          ...(this.config.modelApiKey ? ['--modelApiKey', this.config.modelApiKey] : []),
        ],
        env: {
          BROWSERBASE_API_KEY: this.config.apiKey,
          BROWSERBASE_PROJECT_ID: this.config.projectId,
          ...(this.config.modelApiKey && { GEMINI_API_KEY: this.config.modelApiKey }),
        },
      });

      this.isConnected = true;
      this.emit('connected');

      console.log('✅ Browserbase MCP Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Browserbase MCP Service:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Create a new browser session
   */
  async createSession(options: SessionOptions = {}): Promise<BrowserSession> {
    if (!this.isConnected) {
      throw new Error('Browserbase service not connected');
    }

    try {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const session: BrowserSession = {
        id: sessionId,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true,
        metadata: {
          userAgent: options.userAgent,
          viewport: options.viewport,
          proxy: options.proxy,
          stealth: options.stealth,
          keepAlive: options.keepAlive,
          contextId: options.contextId,
        },
      };

      // Create session using MCP tools
      const result = await this.callTool('create_session', {
        sessionId,
        options: {
          url: options.url,
          userAgent: options.userAgent,
          viewport: options.viewport,
          proxy: options.proxy,
          stealth: options.stealth,
          keepAlive: options.keepAlive,
          contextId: options.contextId,
        },
      });

      if (result.success) {
        this.sessions.set(sessionId, session);
        this.emit('sessionCreated', session);
        console.log(`✅ Created browser session: ${sessionId}`);
        return session;
      } else {
        throw new Error(`Failed to create session: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error creating browser session:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Navigate to a URL in a session
   */
  async navigateToUrl(
    sessionId: string,
    url: string,
    options: {
      waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
      timeout?: number;
    } = {}
  ): Promise<ActionResult> {
    if (!this.isConnected) {
      throw new Error('Browserbase service not connected');
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      const result = await this.callTool('navigate_to_url', {
        sessionId,
        url,
        options: {
          waitUntil: options.waitUntil || 'networkidle2',
          timeout: options.timeout || 30000,
        },
      });

      if (result.success) {
        session.url = url;
        session.lastActivity = new Date();
        this.sessions.set(sessionId, session);
        this.emit('navigated', { sessionId, url });
      }

      return result;
    } catch (error) {
      console.error(`❌ Error navigating to ${url}:`, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Execute natural language instructions
   */
  async executeInstructions(
    sessionId: string,
    instructions: string,
    options: {
      timeout?: number;
      extractData?: string[];
      takeScreenshot?: boolean;
    } = {}
  ): Promise<ActionResult> {
    if (!this.isConnected) {
      throw new Error('Browserbase service not connected');
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      const result = await this.callTool('execute_instructions', {
        sessionId,
        instructions,
        options: {
          timeout: options.timeout || 30000,
          extractData: options.extractData,
          takeScreenshot: options.takeScreenshot || false,
        },
      });

      if (result.success) {
        session.lastActivity = new Date();
        this.sessions.set(sessionId, session);
        this.emit('instructionsExecuted', { sessionId, instructions, result });
      }

      return result;
    } catch (error) {
      console.error(`❌ Error executing instructions:`, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Capture screenshot
   */
  async captureScreenshot(sessionId: string, options: ScreenshotOptions = {}): Promise<Buffer> {
    if (!this.isConnected) {
      throw new Error('Browserbase service not connected');
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      const result = await this.callTool('capture_screenshot', {
        sessionId,
        options: {
          fullPage: options.fullPage || false,
          format: options.format || 'png',
          quality: options.quality || 90,
          selector: options.selector,
        },
      });

      if (result.success && result.screenshot) {
        // Convert base64 to Buffer
        const buffer = Buffer.from(result.screenshot, 'base64');
        session.lastActivity = new Date();
        this.sessions.set(sessionId, session);
        this.emit('screenshotCaptured', { sessionId, buffer });
        return buffer;
      } else {
        throw new Error(`Screenshot failed: ${result.message}`);
      }
    } catch (error) {
      console.error(`❌ Error capturing screenshot:`, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Extract data from page
   */
  async extractData(
    sessionId: string,
    schema: {
      selectors: string[];
      attributes?: string[];
      textContent?: boolean;
    }
  ): Promise<ExtractedData> {
    if (!this.isConnected) {
      throw new Error('Browserbase service not connected');
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      const result = await this.callTool('extract_data', {
        sessionId,
        schema,
      });

      if (result.success) {
        const extractedData: ExtractedData = {
          url: session.url || '',
          title: result.title || '',
          content: result.content || '',
          metadata: result.metadata || {},
          elements: result.elements || [],
          timestamp: new Date(),
        };

        session.lastActivity = new Date();
        this.sessions.set(sessionId, session);
        this.emit('dataExtracted', { sessionId, data: extractedData });
        return extractedData;
      } else {
        throw new Error(`Data extraction failed: ${result.message}`);
      }
    } catch (error) {
      console.error(`❌ Error extracting data:`, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Close a session
   */
  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      if (this.isConnected) {
        await this.callTool('close_session', { sessionId });
      }

      session.isActive = false;
      this.sessions.set(sessionId, session);
      this.emit('sessionClosed', { sessionId });
      console.log(`✅ Closed browser session: ${sessionId}`);
    } catch (error) {
      console.error(`❌ Error closing session ${sessionId}:`, error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get session information
   */
  getSession(sessionId: string): BrowserSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * List all active sessions
   */
  listSessions(): BrowserSession[] {
    return Array.from(this.sessions.values()).filter(session => session.isActive);
  }

  /**
   * Clean up inactive sessions
   */
  async cleanupInactiveSessions(maxAge: number = 30 * 60 * 1000): Promise<void> {
    const now = Date.now();
    const sessionsToClose: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity.getTime() > maxAge) {
        sessionsToClose.push(sessionId);
      }
    }

    for (const sessionId of sessionsToClose) {
      try {
        await this.closeSession(sessionId);
      } catch (error) {
        console.error(`❌ Error cleaning up session ${sessionId}:`, error);
      }
    }

    if (sessionsToClose.length > 0) {
      console.log(`🧹 Cleaned up ${sessionsToClose.length} inactive sessions`);
    }
  }

  /**
   * Call MCP tool
   */
  private async callTool(toolName: string, params: any): Promise<any> {
    try {
      const response = await this.mcpClient.request({
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params,
        },
      });

      return response.result;
    } catch (error) {
      console.error(`❌ MCP tool call failed for ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    try {
      // Close all active sessions
      for (const sessionId of this.sessions.keys()) {
        await this.closeSession(sessionId);
      }

      if (this.mcpClient) {
        await this.mcpClient.close();
      }

      this.isConnected = false;
      this.emit('disconnected');
      console.log('✅ Browserbase MCP Service disconnected');
    } catch (error) {
      console.error('❌ Error disconnecting Browserbase service:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    connected: boolean;
    activeSessions: number;
    totalSessions: number;
  } {
    const activeSessions = this.listSessions().length;
    const totalSessions = this.sessions.size;

    return {
      connected: this.isConnected,
      activeSessions,
      totalSessions,
    };
  }
}

export default BrowserbaseService;
