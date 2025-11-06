/**
 * DeepSeek Instance Manager
 * Manages headless Chrome instances for DeepSeek AI services with two-way communication
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { EventEmitter } from 'events';
import { ConsoleFormatter } from '../config/console-config.js';

export interface DeepSeekInstance {
  id: string;
  browser: Browser;
  page: Page;
  status: 'initializing' | 'ready' | 'busy' | 'error' | 'stopped';
  createdAt: Date;
  lastActivity: Date;
  config: InstanceConfig;
}

export interface InstanceConfig {
  headless?: boolean;
  viewport?: { width: number; height: number };
  userAgent?: string;
  enableConsoleLogging?: boolean;
  enableNetworkMonitoring?: boolean;
  timeout?: number;
}

export interface DeepSeekMessage {
  type: 'prompt' | 'response' | 'status' | 'error' | 'log';
  instanceId: string;
  content: any;
  timestamp: Date;
}

export class DeepSeekInstanceManager extends EventEmitter {
  private instances: Map<string, DeepSeekInstance> = new Map();
  private console: ConsoleFormatter;
  private maxInstances: number = 10;

  constructor() {
    super();
    this.console = new ConsoleFormatter();
  }

  /**
   * Create a new DeepSeek instance with headless Chrome
   */
  public async createInstance(
    id: string,
    config: InstanceConfig = {}
  ): Promise<DeepSeekInstance> {
    if (this.instances.has(id)) {
      throw new Error(`Instance ${id} already exists`);
    }

    if (this.instances.size >= this.maxInstances) {
      throw new Error(`Maximum instances (${this.maxInstances}) reached`);
    }

    console.log(
      this.console.formatServiceMessage(
        'DeepSeek',
        `Creating instance: ${id}`,
        'info'
      )
    );

    const defaultConfig: InstanceConfig = {
      headless: true,
      viewport: { width: 1920, height: 1080 },
      enableConsoleLogging: true,
      enableNetworkMonitoring: true,
      timeout: 30000,
      ...config,
    };

    try {
      const browser = await puppeteer.launch({
        headless: defaultConfig.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();
      
      if (defaultConfig.viewport) {
        await page.setViewport(defaultConfig.viewport);
      }
      
      if (defaultConfig.userAgent) {
        await page.setUserAgent(defaultConfig.userAgent);
      }

      const instance: DeepSeekInstance = {
        id,
        browser,
        page,
        status: 'initializing',
        createdAt: new Date(),
        lastActivity: new Date(),
        config: defaultConfig,
      };

      // Set up console logging
      if (defaultConfig.enableConsoleLogging) {
        page.on('console', msg => {
          this.handleConsoleLog(instance, msg);
        });
      }

      // Set up network monitoring
      if (defaultConfig.enableNetworkMonitoring) {
        await page.setRequestInterception(true);
        page.on('request', request => {
          this.handleNetworkRequest(instance, request);
          request.continue();
        });
      }

      // Set up error handling
      page.on('error', error => {
        this.handleError(instance, error);
      });

      page.on('pageerror', error => {
        this.handlePageError(instance, error);
      });

      this.instances.set(id, instance);
      instance.status = 'ready';

      console.log(
        this.console.formatInstanceInfo(id, 'DeepSeek Chrome', 'active', {
          viewport: `${defaultConfig.viewport?.width}x${defaultConfig.viewport?.height}`,
          headless: defaultConfig.headless,
        })
      );

      this.emit('instance:created', instance);
      return instance;
    } catch (error) {
      console.error(
        this.console.formatError('DeepSeek', error as Error)
      );
      throw error;
    }
  }

  /**
   * Send a prompt to a DeepSeek instance (two-way communication)
   */
  public async sendPrompt(
    instanceId: string,
    prompt: string,
    context?: any
  ): Promise<any> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    if (instance.status !== 'ready') {
      throw new Error(`Instance ${instanceId} is not ready (status: ${instance.status})`);
    }

    instance.status = 'busy';
    instance.lastActivity = new Date();

    console.log(
      this.console.formatServiceMessage(
        'DeepSeek',
        `Sending prompt to ${instanceId}: ${prompt.substring(0, 50)}...`,
        'info'
      )
    );

    try {
      // Execute the prompt in the page context
      const result = await instance.page.evaluate(
        async (promptText, ctx) => {
          // This would connect to DeepSeek API in real implementation
          return {
            prompt: promptText,
            context: ctx,
            response: `Processed: ${promptText}`,
            timestamp: new Date().toISOString(),
          };
        },
        prompt,
        context
      );

      instance.status = 'ready';

      const message: DeepSeekMessage = {
        type: 'response',
        instanceId,
        content: result,
        timestamp: new Date(),
      };

      this.emit('message', message);
      return result;
    } catch (error) {
      instance.status = 'error';
      console.error(
        this.console.formatError('DeepSeek', error as Error)
      );
      throw error;
    }
  }

  /**
   * Execute code in a DeepSeek instance
   */
  public async executeCode(
    instanceId: string,
    code: string
  ): Promise<any> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    console.log(
      this.console.formatServiceMessage(
        'DeepSeek',
        `Executing code in ${instanceId}`,
        'info'
      )
    );

    try {
      const result = await instance.page.evaluate(code);
      return result;
    } catch (error) {
      console.error(
        this.console.formatError('DeepSeek', error as Error)
      );
      throw error;
    }
  }

  /**
   * Navigate instance to a URL
   */
  public async navigate(
    instanceId: string,
    url: string
  ): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    console.log(
      this.console.formatServiceMessage(
        'DeepSeek',
        `Navigating ${instanceId} to ${url}`,
        'info'
      )
    );

    await instance.page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: instance.config.timeout,
    });

    instance.lastActivity = new Date();
  }

  /**
   * Get instance console output
   */
  public async getConsoleOutput(instanceId: string): Promise<string[]> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance ${instanceId} not found`);
    }

    // Return buffered console messages
    return [];
  }

  /**
   * Stop and cleanup an instance
   */
  public async stopInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return;
    }

    console.log(
      this.console.formatServiceMessage(
        'DeepSeek',
        `Stopping instance: ${instanceId}`,
        'warning'
      )
    );

    try {
      await instance.browser.close();
      instance.status = 'stopped';
      this.instances.delete(instanceId);

      this.emit('instance:stopped', instanceId);
    } catch (error) {
      console.error(
        this.console.formatError('DeepSeek', error as Error)
      );
    }
  }

  /**
   * Get all instances
   */
  public getInstances(): DeepSeekInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Get instance by ID
   */
  public getInstance(instanceId: string): DeepSeekInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Stop all instances
   */
  public async stopAll(): Promise<void> {
    const instanceIds = Array.from(this.instances.keys());
    await Promise.all(instanceIds.map(id => this.stopInstance(id)));
  }

  private handleConsoleLog(instance: DeepSeekInstance, msg: any): void {
    const logMessage = `[Instance ${instance.id}] ${msg.text()}`;
    
    console.log(
      this.console.formatDataStream('DeepSeek Console', logMessage, 'chrome')
    );

    const message: DeepSeekMessage = {
      type: 'log',
      instanceId: instance.id,
      content: msg.text(),
      timestamp: new Date(),
    };

    this.emit('console', message);
  }

  private handleNetworkRequest(instance: DeepSeekInstance, request: any): void {
    const message: DeepSeekMessage = {
      type: 'log',
      instanceId: instance.id,
      content: {
        type: 'network',
        url: request.url(),
        method: request.method(),
      },
      timestamp: new Date(),
    };

    this.emit('network', message);
  }

  private handleError(instance: DeepSeekInstance, error: Error): void {
    console.error(
      this.console.formatError(`DeepSeek[${instance.id}]`, error)
    );

    instance.status = 'error';

    const message: DeepSeekMessage = {
      type: 'error',
      instanceId: instance.id,
      content: error.message,
      timestamp: new Date(),
    };

    this.emit('error', message);
  }

  private handlePageError(instance: DeepSeekInstance, error: Error): void {
    console.error(
      this.console.formatError(`DeepSeek[${instance.id}] Page`, error)
    );

    const message: DeepSeekMessage = {
      type: 'error',
      instanceId: instance.id,
      content: error.message,
      timestamp: new Date(),
    };

    this.emit('pageerror', message);
  }
}

export const deepseekInstanceManager = new DeepSeekInstanceManager();
