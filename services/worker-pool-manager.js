#!/usr/bin/env node

/**
 * Headless Browser Worker Pool Manager
 * 
 * Manages a dynamic pool of Playwright/Puppeteer workers for browser automation
 * Features:
 * - Dynamic scaling based on load
 * - Task queue with priority
 * - Health monitoring
 * - Resource cleanup
 * - Load balancing
 */

import { chromium, firefox, webkit } from 'playwright';
import { EventEmitter } from 'events';
import os from 'os';

class BrowserWorker extends EventEmitter {
    constructor(id, browserType = 'chromium', options = {}) {
        super();
        this.id = id;
        this.browserType = browserType;
        this.options = options;
        this.browser = null;
        this.context = null;
        this.page = null;
        this.busy = false;
        this.tasksCompleted = 0;
        this.createdAt = Date.now();
        this.lastUsed = Date.now();
    }

    async initialize() {
        try {
            const browserOptions = {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu'
                ],
                ...this.options.launchOptions
            };

            // Launch browser based on type
            if (this.browserType === 'firefox') {
                this.browser = await firefox.launch(browserOptions);
            } else if (this.browserType === 'webkit') {
                this.browser = await webkit.launch(browserOptions);
            } else {
                this.browser = await chromium.launch(browserOptions);
            }

            this.context = await this.browser.newContext({
                viewport: { width: 1920, height: 1080 },
                userAgent: this.options.userAgent || 'LightDom-Worker/1.0',
                ...this.options.contextOptions
            });

            this.page = await this.context.newPage();

            console.log(`✅ Worker ${this.id} initialized (${this.browserType})`);
            this.emit('ready');
            
            return true;
        } catch (error) {
            console.error(`❌ Worker ${this.id} initialization failed:`, error);
            this.emit('error', error);
            return false;
        }
    }

    async executeTask(task) {
        if (this.busy) {
            throw new Error(`Worker ${this.id} is busy`);
        }

        this.busy = true;
        this.lastUsed = Date.now();
        
        try {
            console.log(`🔄 Worker ${this.id} executing task: ${task.type}`);
            
            let result;
            
            switch (task.type) {
                case 'navigate':
                    result = await this.navigate(task.params);
                    break;
                    
                case 'screenshot':
                    result = await this.screenshot(task.params);
                    break;
                    
                case 'extract':
                    result = await this.extractData(task.params);
                    break;
                    
                case 'execute':
                    result = await this.executeScript(task.params);
                    break;
                    
                case 'crawl':
                    result = await this.crawlPage(task.params);
                    break;
                    
                default:
                    // Custom task handler
                    if (typeof task.handler === 'function') {
                        result = await task.handler(this.page, this.context, this.browser);
                    } else {
                        throw new Error(`Unknown task type: ${task.type}`);
                    }
            }
            
            this.tasksCompleted++;
            console.log(`✅ Worker ${this.id} completed task (${this.tasksCompleted} total)`);
            
            return { success: true, result, workerId: this.id };
            
        } catch (error) {
            console.error(`❌ Worker ${this.id} task failed:`, error);
            return { success: false, error: error.message, workerId: this.id };
            
        } finally {
            this.busy = false;
            this.emit('task-complete');
        }
    }

    async navigate(params) {
        const { url, waitUntil = 'networkidle' } = params;
        await this.page.goto(url, { waitUntil });
        return { url, title: await this.page.title() };
    }

    async screenshot(params) {
        const { path, fullPage = false, type = 'png' } = params;
        const screenshot = await this.page.screenshot({ path, fullPage, type });
        return { path, size: screenshot.length };
    }

    async extractData(params) {
        const { selector, extract = 'text', multiple = false } = params;
        
        if (multiple) {
            return await this.page.$$eval(selector, (elements, extractType) => {
                return elements.map(el => {
                    if (extractType === 'text') return el.textContent;
                    if (extractType === 'html') return el.innerHTML;
                    if (extractType === 'attr') return el.getAttribute(extractType);
                    return el;
                });
            }, extract);
        } else {
            return await this.page.$eval(selector, (el, extractType) => {
                if (extractType === 'text') return el.textContent;
                if (extractType === 'html') return el.innerHTML;
                return el;
            }, extract);
        }
    }

    async executeScript(params) {
        const { script, args = [] } = params;
        return await this.page.evaluate(new Function('...args', script), ...args);
    }

    async crawlPage(params) {
        const { url, extractors = {}, screenshot = false } = params;
        
        await this.page.goto(url, { waitUntil: 'networkidle' });
        
        const data = {
            url,
            title: await this.page.title(),
            meta: {}
        };

        // Extract data based on extractors config
        for (const [key, config] of Object.entries(extractors)) {
            try {
                if (typeof config === 'string') {
                    // Simple selector
                    data[key] = await this.page.$eval(config, el => el.textContent);
                } else {
                    // Advanced extractor
                    data[key] = await this.extractData(config);
                }
            } catch (error) {
                console.warn(`Failed to extract ${key}:`, error.message);
                data[key] = null;
            }
        }

        // Optional screenshot
        if (screenshot) {
            data.screenshot = await this.page.screenshot({ type: 'png' });
        }

        return data;
    }

    async close() {
        try {
            if (this.page) await this.page.close();
            if (this.context) await this.context.close();
            if (this.browser) await this.browser.close();
            
            console.log(`🔴 Worker ${this.id} closed`);
            this.emit('closed');
            
        } catch (error) {
            console.error(`Error closing worker ${this.id}:`, error);
        }
    }

    isIdle() {
        return !this.busy;
    }

    getStats() {
        return {
            id: this.id,
            browserType: this.browserType,
            busy: this.busy,
            tasksCompleted: this.tasksCompleted,
            uptime: Date.now() - this.createdAt,
            idleTime: Date.now() - this.lastUsed
        };
    }
}

class WorkerPoolManager extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.options = {
            minWorkers: options.minWorkers || 2,
            maxWorkers: options.maxWorkers || Math.max(4, os.cpus().length),
            browserType: options.browserType || 'chromium',
            idleTimeout: options.idleTimeout || 5 * 60 * 1000, // 5 minutes
            taskTimeout: options.taskTimeout || 60 * 1000, // 1 minute
            scaleUpThreshold: options.scaleUpThreshold || 0.8,
            scaleDownThreshold: options.scaleDownThreshold || 0.2,
            healthCheckInterval: options.healthCheckInterval || 30 * 1000,
            ...options
        };

        this.workers = new Map();
        this.taskQueue = [];
        this.nextWorkerId = 1;
        this.stats = {
            tasksProcessed: 0,
            tasksFailed: 0,
            totalQueueTime: 0,
            totalProcessingTime: 0
        };

        this.healthCheckTimer = null;
        this.scaleTimer = null;
    }

    async start() {
        console.log('🚀 Starting Worker Pool Manager...');
        console.log(`   Min workers: ${this.options.minWorkers}`);
        console.log(`   Max workers: ${this.options.maxWorkers}`);
        console.log(`   Browser type: ${this.options.browserType}`);

        // Initialize minimum workers
        for (let i = 0; i < this.options.minWorkers; i++) {
            await this.createWorker();
        }

        // Start health checks
        this.startHealthChecks();
        
        // Start auto-scaling
        this.startAutoScaling();

        console.log(`✅ Worker Pool started with ${this.workers.size} workers\n`);
        this.emit('started');
    }

    async createWorker() {
        const id = this.nextWorkerId++;
        const worker = new BrowserWorker(id, this.options.browserType, this.options);
        
        worker.on('task-complete', () => {
            this.processQueue();
        });

        worker.on('error', (error) => {
            console.error(`Worker ${id} error:`, error);
            this.removeWorker(id);
        });

        const initialized = await worker.initialize();
        
        if (initialized) {
            this.workers.set(id, worker);
            this.emit('worker-created', id);
            return worker;
        }
        
        return null;
    }

    async removeWorker(workerId) {
        const worker = this.workers.get(workerId);
        if (worker) {
            await worker.close();
            this.workers.delete(workerId);
            this.emit('worker-removed', workerId);
        }
    }

    async addTask(task) {
        const taskWithMetadata = {
            ...task,
            id: Date.now() + Math.random(),
            addedAt: Date.now(),
            priority: task.priority || 0
        };

        this.taskQueue.push(taskWithMetadata);
        
        // Sort by priority (higher priority first)
        this.taskQueue.sort((a, b) => b.priority - a.priority);

        console.log(`📥 Task added to queue (${this.taskQueue.length} pending)`);
        
        this.processQueue();
        
        return taskWithMetadata.id;
    }

    async processQueue() {
        if (this.taskQueue.length === 0) {
            return;
        }

        // Find idle worker
        const idleWorker = Array.from(this.workers.values()).find(w => w.isIdle());
        
        if (!idleWorker) {
            // No idle workers, maybe scale up
            if (this.workers.size < this.options.maxWorkers) {
                console.log('⚡ All workers busy, scaling up...');
                await this.createWorker();
                this.processQueue();
            }
            return;
        }

        // Get next task
        const task = this.taskQueue.shift();
        const queueTime = Date.now() - task.addedAt;
        this.stats.totalQueueTime += queueTime;

        console.log(`🔄 Processing task ${task.id} (queued for ${queueTime}ms)`);

        const startTime = Date.now();
        
        try {
            const result = await Promise.race([
                idleWorker.executeTask(task),
                this.createTimeout(this.options.taskTimeout)
            ]);

            const processingTime = Date.now() - startTime;
            this.stats.totalProcessingTime += processingTime;
            this.stats.tasksProcessed++;

            this.emit('task-complete', { task, result, queueTime, processingTime });

        } catch (error) {
            this.stats.tasksFailed++;
            console.error(`Task ${task.id} failed:`, error);
            this.emit('task-failed', { task, error });
        }

        // Process next task if queue not empty
        if (this.taskQueue.length > 0) {
            setImmediate(() => this.processQueue());
        }
    }

    createTimeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Task timeout')), ms);
        });
    }

    startHealthChecks() {
        this.healthCheckTimer = setInterval(() => {
            this.performHealthCheck();
        }, this.options.healthCheckInterval);
    }

    async performHealthCheck() {
        const now = Date.now();
        const workersToRemove = [];

        for (const [id, worker] of this.workers) {
            const idleTime = now - worker.lastUsed;
            
            // Remove idle workers beyond minimum
            if (this.workers.size > this.options.minWorkers && 
                idleTime > this.options.idleTimeout && 
                worker.isIdle()) {
                workersToRemove.push(id);
            }
        }

        for (const id of workersToRemove) {
            console.log(`🧹 Removing idle worker ${id}`);
            await this.removeWorker(id);
        }
    }

    startAutoScaling() {
        this.scaleTimer = setInterval(() => {
            this.autoScale();
        }, 10000); // Check every 10 seconds
    }

    autoScale() {
        const utilization = this.getUtilization();
        const currentWorkers = this.workers.size;

        if (utilization > this.options.scaleUpThreshold && currentWorkers < this.options.maxWorkers) {
            console.log(`📈 High utilization (${(utilization * 100).toFixed(1)}%), scaling up...`);
            this.createWorker();
            
        } else if (utilization < this.options.scaleDownThreshold && currentWorkers > this.options.minWorkers) {
            // Remove one idle worker
            const idleWorker = Array.from(this.workers.values()).find(w => w.isIdle());
            if (idleWorker) {
                console.log(`📉 Low utilization (${(utilization * 100).toFixed(1)}%), scaling down...`);
                this.removeWorker(idleWorker.id);
            }
        }
    }

    getUtilization() {
        if (this.workers.size === 0) return 0;
        const busyWorkers = Array.from(this.workers.values()).filter(w => w.busy).length;
        return busyWorkers / this.workers.size;
    }

    getStatus() {
        const workers = Array.from(this.workers.values()).map(w => w.getStats());
        
        return {
            poolSize: this.workers.size,
            minWorkers: this.options.minWorkers,
            maxWorkers: this.options.maxWorkers,
            utilization: this.getUtilization(),
            queueLength: this.taskQueue.length,
            workers,
            stats: {
                ...this.stats,
                avgQueueTime: this.stats.tasksProcessed > 0 
                    ? this.stats.totalQueueTime / this.stats.tasksProcessed 
                    : 0,
                avgProcessingTime: this.stats.tasksProcessed > 0 
                    ? this.stats.totalProcessingTime / this.stats.tasksProcessed 
                    : 0
            }
        };
    }

    async shutdown() {
        console.log('\n🛑 Shutting down Worker Pool...');

        if (this.healthCheckTimer) clearInterval(this.healthCheckTimer);
        if (this.scaleTimer) clearInterval(this.scaleTimer);

        const workerIds = Array.from(this.workers.keys());
        
        for (const id of workerIds) {
            await this.removeWorker(id);
        }

        console.log('✅ Worker Pool shutdown complete');
        this.emit('shutdown');
    }
}

// Export for use as a module
export { WorkerPoolManager, BrowserWorker };

// Run as standalone service if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const pool = new WorkerPoolManager({
        minWorkers: parseInt(process.env.MIN_WORKERS) || 2,
        maxWorkers: parseInt(process.env.MAX_WORKERS) || 10,
        browserType: process.env.BROWSER_TYPE || 'chromium'
    });

    pool.on('started', () => {
        console.log('Worker pool is ready to accept tasks');
    });

    pool.on('task-complete', ({ task, result, queueTime, processingTime }) => {
        console.log(`✅ Task completed: ${task.type} (queue: ${queueTime}ms, process: ${processingTime}ms)`);
    });

    pool.on('task-failed', ({ task, error }) => {
        console.error(`❌ Task failed: ${task.type} - ${error.message}`);
    });

    await pool.start();

    // Example tasks
    setTimeout(async () => {
        console.log('\n📝 Adding example tasks...\n');
        
        await pool.addTask({
            type: 'navigate',
            params: { url: 'https://example.com' }
        });

        await pool.addTask({
            type: 'crawl',
            params: {
                url: 'https://example.com',
                extractors: {
                    title: 'h1',
                    description: 'p'
                }
            }
        });
    }, 2000);

    // Status reporting
    setInterval(() => {
        const status = pool.getStatus();
        console.log('\n' + '='.repeat(60));
        console.log('📊 Worker Pool Status');
        console.log('='.repeat(60));
        console.log(`Pool Size: ${status.poolSize}/${status.maxWorkers}`);
        console.log(`Utilization: ${(status.utilization * 100).toFixed(1)}%`);
        console.log(`Queue Length: ${status.queueLength}`);
        console.log(`Tasks Processed: ${status.stats.tasksProcessed}`);
        console.log(`Tasks Failed: ${status.stats.tasksFailed}`);
        console.log(`Avg Queue Time: ${status.stats.avgQueueTime.toFixed(0)}ms`);
        console.log(`Avg Processing Time: ${status.stats.avgProcessingTime.toFixed(0)}ms`);
        console.log('='.repeat(60) + '\n');
    }, 30000);

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\nReceived SIGINT, shutting down...');
        await pool.shutdown();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\nReceived SIGTERM, shutting down...');
        await pool.shutdown();
        process.exit(0);
    });
}
