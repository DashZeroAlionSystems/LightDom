/**
 * Headless API Manager
 * Manages headless Chrome instances with service worker integration
 */

import { EventEmitter } from 'events';
import { ConsoleFormatter } from '../config/console-config.js';
import { deepseekInstanceManager } from './deepseek-instance-manager.js';

export interface HeadlessAPIConfig {
  url: string;
  workers: number;
  enableServiceWorkers: boolean;
  enableAnalytics: boolean;
  cacheStrategy: 'network-first' | 'cache-first' | 'stale-while-revalidate';
  maxConcurrentRequests: number;
  timeout: number;
}

export interface WorkerInstance {
  id: string;
  chromeInstanceId: string;
  status: 'idle' | 'busy' | 'error';
  requestsProcessed: number;
  currentTask?: any;
  createdAt: Date;
}

export interface AnalyticsData {
  instanceId: string;
  url: string;
  metrics: {
    loadTime: number;
    domContentLoaded: number;
    firstPaint: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    timeToInteractive: number;
  };
  resources: Array<{
    url: string;
    type: string;
    size: number;
    duration: number;
  }>;
  domMetrics: {
    nodeCount: number;
    depth: number;
    elements: number;
  };
  timestamp: Date;
}

export class HeadlessAPIManager extends EventEmitter {
  private workers: Map<string, WorkerInstance> = new Map();
  private console: ConsoleFormatter;
  private config: HeadlessAPIConfig;
  private analyticsData: AnalyticsData[] = [];
  private requestQueue: any[] = [];

  constructor(config: Partial<HeadlessAPIConfig> = {}) {
    super();
    this.console = new ConsoleFormatter();
    this.config = {
      url: 'https://example.com',
      workers: 3,
      enableServiceWorkers: true,
      enableAnalytics: true,
      cacheStrategy: 'network-first',
      maxConcurrentRequests: 10,
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Initialize headless API with worker pool
   */
  public async initialize(): Promise<void> {
    console.log(
      this.console.formatServiceMessage(
        'HeadlessAPI',
        `Initializing with ${this.config.workers} workers`,
        'info'
      )
    );

    for (let i = 0; i < this.config.workers; i++) {
      await this.createWorker(`worker-${i}`);
    }

    console.log(
      this.console.formatServiceMessage(
        'HeadlessAPI',
        'Initialization complete',
        'success'
      )
    );

    this.emit('initialized', { workers: this.workers.size });
  }

  /**
   * Create a worker instance
   */
  private async createWorker(id: string): Promise<WorkerInstance> {
    const chromeInstanceId = `headless-${id}`;
    
    await deepseekInstanceManager.createInstance(chromeInstanceId, {
      headless: true,
      viewport: { width: 1920, height: 1080 },
      enableConsoleLogging: false,
      enableNetworkMonitoring: this.config.enableAnalytics,
    });

    const worker: WorkerInstance = {
      id,
      chromeInstanceId,
      status: 'idle',
      requestsProcessed: 0,
      createdAt: new Date(),
    };

    this.workers.set(id, worker);

    // Set up service worker if enabled
    if (this.config.enableServiceWorkers) {
      await this.setupServiceWorker(chromeInstanceId);
    }

    console.log(
      this.console.formatServiceMessage(
        'HeadlessAPI',
        `Worker ${id} created`,
        'success'
      )
    );

    return worker;
  }

  /**
   * Set up service worker in Chrome instance
   */
  private async setupServiceWorker(chromeInstanceId: string): Promise<void> {
    const instance = deepseekInstanceManager.getInstance(chromeInstanceId);
    if (!instance) return;

    await instance.page.evaluateOnNewDocument((cacheStrategy: string) => {
      // Register service worker
      if ('serviceWorker' in navigator) {
        const swCode = `
          self.addEventListener('install', (event) => {
            console.log('Service Worker installed');
          });

          self.addEventListener('activate', (event) => {
            console.log('Service Worker activated');
          });

          self.addEventListener('fetch', (event) => {
            const cacheStrategy = '${cacheStrategy}';
            
            if (cacheStrategy === 'cache-first') {
              event.respondWith(
                caches.match(event.request).then((response) => {
                  return response || fetch(event.request);
                })
              );
            } else if (cacheStrategy === 'network-first') {
              event.respondWith(
                fetch(event.request).catch(() => {
                  return caches.match(event.request);
                })
              );
            } else if (cacheStrategy === 'stale-while-revalidate') {
              event.respondWith(
                caches.match(event.request).then((cachedResponse) => {
                  const fetchPromise = fetch(event.request).then((networkResponse) => {
                    caches.open('dynamic').then((cache) => {
                      cache.put(event.request, networkResponse.clone());
                    });
                    return networkResponse;
                  });
                  return cachedResponse || fetchPromise;
                })
              );
            }
          });
        `;

        const blob = new Blob([swCode], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        navigator.serviceWorker.register(url);
      }
    }, this.config.cacheStrategy);
  }

  /**
   * Process URL with worker pool
   */
  public async processURL(url: string, options: any = {}): Promise<any> {
    console.log(
      this.console.formatServiceMessage(
        'HeadlessAPI',
        `Processing URL: ${url}`,
        'info'
      )
    );

    // Find idle worker
    const worker = this.findIdleWorker();
    if (!worker) {
      // Queue request if no workers available
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ url, options, resolve, reject });
        console.log(
          this.console.formatServiceMessage(
            'HeadlessAPI',
            `Request queued (${this.requestQueue.length} in queue)`,
            'warning'
          )
        );
      });
    }

    return this.processWithWorker(worker, url, options);
  }

  /**
   * Process URL with specific worker
   */
  private async processWithWorker(
    worker: WorkerInstance,
    url: string,
    options: any
  ): Promise<any> {
    worker.status = 'busy';
    worker.currentTask = { url, options, startTime: Date.now() };

    try {
      const instance = deepseekInstanceManager.getInstance(worker.chromeInstanceId);
      if (!instance) {
        throw new Error(`Instance ${worker.chromeInstanceId} not found`);
      }

      // Navigate to URL
      await instance.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.config.timeout,
      });

      // Collect analytics if enabled
      let analytics: AnalyticsData | undefined;
      if (this.config.enableAnalytics) {
        analytics = await this.collectAnalytics(worker, url);
        this.analyticsData.push(analytics);
        
        console.log(
          this.console.formatDataStream(
            'Analytics',
            {
              url,
              loadTime: `${analytics.metrics.loadTime}ms`,
              nodeCount: analytics.domMetrics.nodeCount,
            },
            'analytics'
          )
        );
      }

      // Extract data based on options
      const data = await this.extractData(instance.page, options);

      worker.requestsProcessed++;
      worker.status = 'idle';
      worker.currentTask = undefined;

      // Process queued requests
      this.processQueue();

      this.emit('url:processed', { worker: worker.id, url, analytics });

      return { url, data, analytics };
    } catch (error) {
      worker.status = 'error';
      console.error(
        this.console.formatError('HeadlessAPI', error as Error)
      );
      
      // Recreate worker if error
      setTimeout(() => this.recreateWorker(worker.id), 1000);
      
      throw error;
    }
  }

  /**
   * Collect real-time analytics
   */
  private async collectAnalytics(
    worker: WorkerInstance,
    url: string
  ): Promise<AnalyticsData> {
    const instance = deepseekInstanceManager.getInstance(worker.chromeInstanceId);
    if (!instance) {
      throw new Error('Instance not found');
    }

    const metrics = await instance.page.evaluate(() => {
      const timing = performance.timing;
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0, // Would need PerformanceObserver
        cumulativeLayoutShift: 0, // Would need PerformanceObserver
        firstInputDelay: 0, // Would need PerformanceObserver
        timeToInteractive: timing.domInteractive - timing.navigationStart,
      };
    });

    const resources = await instance.page.evaluate(() => {
      return performance.getEntriesByType('resource').map((r: any) => ({
        url: r.name,
        type: r.initiatorType,
        size: r.transferSize || 0,
        duration: r.duration,
      }));
    });

    const domMetrics = await instance.page.evaluate(() => {
      const getDepth = (node: Node, depth = 0): number => {
        let maxDepth = depth;
        node.childNodes.forEach(child => {
          const childDepth = getDepth(child, depth + 1);
          if (childDepth > maxDepth) maxDepth = childDepth;
        });
        return maxDepth;
      };

      return {
        nodeCount: document.getElementsByTagName('*').length,
        depth: getDepth(document.body),
        elements: document.querySelectorAll('*').length,
      };
    });

    return {
      instanceId: worker.chromeInstanceId,
      url,
      metrics,
      resources,
      domMetrics,
      timestamp: new Date(),
    };
  }

  /**
   * Extract data from page
   */
  private async extractData(page: any, options: any): Promise<any> {
    return page.evaluate((opts: any) => {
      const data: any = {
        title: document.title,
        meta: {},
        content: {},
      };

      // Extract meta tags
      document.querySelectorAll('meta').forEach((meta: any) => {
        const name = meta.getAttribute('name') || meta.getAttribute('property');
        const content = meta.getAttribute('content');
        if (name && content) {
          data.meta[name] = content;
        }
      });

      // Extract content based on options
      if (opts.extractText) {
        data.content.text = document.body.textContent;
      }

      if (opts.extractLinks) {
        data.content.links = Array.from(document.querySelectorAll('a')).map((a: any) => ({
          href: a.href,
          text: a.textContent,
        }));
      }

      if (opts.extractImages) {
        data.content.images = Array.from(document.querySelectorAll('img')).map((img: any) => ({
          src: img.src,
          alt: img.alt,
        }));
      }

      return data;
    }, options);
  }

  /**
   * Paint DOM with schema injection
   */
  public async paintDOM(
    workerId: string,
    schema: any,
    data: any
  ): Promise<void> {
    const worker = this.workers.get(workerId);
    if (!worker) {
      throw new Error(`Worker ${workerId} not found`);
    }

    const instance = deepseekInstanceManager.getInstance(worker.chromeInstanceId);
    if (!instance) {
      throw new Error('Instance not found');
    }

    console.log(
      this.console.formatServiceMessage(
        'HeadlessAPI',
        `Painting DOM with schema for worker ${workerId}`,
        'info'
      )
    );

    await instance.page.evaluate(
      (schemaData: any, injectionData: any) => {
        // Create container
        const container = document.createElement('div');
        container.className = 'schema-injected-content';
        
        // Apply schema styles
        if (schemaData.styles) {
          Object.assign(container.style, schemaData.styles);
        }

        // Inject content based on schema
        if (schemaData.template) {
          // Sanitize template data to prevent XSS
          const sanitizedTemplate = schemaData.template
            .replace(/\{\{(\w+)\}\}/g, (_: any, key: string) => {
              const value = injectionData[key] || '';
              // Escape HTML entities
              return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
            });
          container.innerHTML = sanitizedTemplate;
        }

        // Inject into DOM
        const target = document.querySelector(schemaData.target || 'body');
        if (target) {
          if (schemaData.position === 'prepend') {
            target.prepend(container);
          } else {
            target.appendChild(container);
          }
        }
      },
      schema,
      data
    );

    this.emit('dom:painted', { worker: workerId, schema });
  }

  /**
   * Get real-time analytics
   */
  public getAnalytics(filter?: { url?: string; limit?: number }): AnalyticsData[] {
    let analytics = this.analyticsData;

    if (filter?.url) {
      analytics = analytics.filter(a => a.url === filter.url);
    }

    if (filter?.limit) {
      analytics = analytics.slice(-filter.limit);
    }

    return analytics;
  }

  /**
   * Get aggregated analytics
   */
  public getAggregatedAnalytics(): any {
    if (this.analyticsData.length === 0) {
      return null;
    }

    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const avg = (arr: number[]) => sum(arr) / arr.length;

    const loadTimes = this.analyticsData.map(a => a.metrics.loadTime);
    const nodeCounts = this.analyticsData.map(a => a.domMetrics.nodeCount);

    return {
      totalRequests: this.analyticsData.length,
      avgLoadTime: avg(loadTimes),
      minLoadTime: Math.min(...loadTimes),
      maxLoadTime: Math.max(...loadTimes),
      avgNodeCount: avg(nodeCounts),
      workers: this.workers.size,
      queueLength: this.requestQueue.length,
    };
  }

  /**
   * Find idle worker
   */
  private findIdleWorker(): WorkerInstance | undefined {
    return Array.from(this.workers.values()).find(w => w.status === 'idle');
  }

  /**
   * Process queued requests
   */
  private processQueue(): void {
    if (this.requestQueue.length === 0) return;

    const worker = this.findIdleWorker();
    if (!worker) return;

    const request = this.requestQueue.shift();
    if (request) {
      this.processWithWorker(worker, request.url, request.options)
        .then(request.resolve)
        .catch(request.reject);
    }
  }

  /**
   * Recreate worker after error
   */
  private async recreateWorker(workerId: string): Promise<void> {
    console.log(
      this.console.formatServiceMessage(
        'HeadlessAPI',
        `Recreating worker: ${workerId}`,
        'warning'
      )
    );

    const worker = this.workers.get(workerId);
    if (worker) {
      await deepseekInstanceManager.stopInstance(worker.chromeInstanceId);
      this.workers.delete(workerId);
    }

    await this.createWorker(workerId);
  }

  /**
   * Get worker status
   */
  public getWorkerStatus(): Array<{
    id: string;
    status: string;
    requestsProcessed: number;
  }> {
    return Array.from(this.workers.values()).map(w => ({
      id: w.id,
      status: w.status,
      requestsProcessed: w.requestsProcessed,
    }));
  }

  /**
   * Shutdown all workers
   */
  public async shutdown(): Promise<void> {
    console.log(
      this.console.formatServiceMessage(
        'HeadlessAPI',
        'Shutting down all workers',
        'warning'
      )
    );

    for (const worker of this.workers.values()) {
      await deepseekInstanceManager.stopInstance(worker.chromeInstanceId);
    }

    this.workers.clear();
    this.requestQueue = [];

    console.log(
      this.console.formatServiceMessage(
        'HeadlessAPI',
        'Shutdown complete',
        'success'
      )
    );
  }
}

export const headlessAPIManager = new HeadlessAPIManager();
