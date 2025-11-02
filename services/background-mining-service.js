/**
 * Background Data Mining Service
 * Orchestrates continuous web crawling for neural network training data
 * 
 * Features:
 * - Subject-based data mining with configurable schemas
 * - URL deduplication with smart re-mining for missing attributes
 * - Schema-linked workflow and task management
 * - Real-time progress tracking
 * - AI-powered configuration generation
 */

import { EventEmitter } from 'events';
import { Pool } from 'pg';
import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';

export class BackgroundDataMiningService extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.dbPool = options.dbPool || this.createDefaultPool();
    this.browser = null;
    this.activeMiningJobs = new Map(); // jobId -> MiningJob
    this.urlCache = new Map(); // url -> {attributes, lastCrawled}
    this.taskQueue = []; // Queue of mining tasks
    this.isRunning = false;
    this.workerCount = options.workerCount || 3;
    this.workers = [];
    
    // Configuration
    this.config = {
      maxConcurrentCrawls: options.maxConcurrentCrawls || 5,
      crawlDelayMs: options.crawlDelayMs || 1000,
      urlCacheTTL: options.urlCacheTTL || 7 * 24 * 60 * 60 * 1000, // 7 days
      respectRobotsTxt: options.respectRobotsTxt !== false,
      userAgent: options.userAgent || 'LightDomMiningBot/1.0',
      ...options.config
    };
  }

  createDefaultPool() {
    return new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  /**
   * Start the background mining service
   */
  async start() {
    if (this.isRunning) {
      throw new Error('Background mining service is already running');
    }

    console.log('🚀 Starting Background Data Mining Service...');
    
    // Initialize browser
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    // Load URL cache from database
    await this.loadUrlCache();

    // Start worker threads
    for (let i = 0; i < this.workerCount; i++) {
      this.startWorker(i);
    }

    this.isRunning = true;
    this.emit('started');
    
    console.log('✅ Background Data Mining Service started');
    console.log(`   - Workers: ${this.workerCount}`);
    console.log(`   - Max concurrent crawls: ${this.config.maxConcurrentCrawls}`);
    console.log(`   - Crawl delay: ${this.config.crawlDelayMs}ms`);
  }

  /**
   * Stop the background mining service
   */
  async stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping Background Data Mining Service...');
    
    this.isRunning = false;
    
    // Stop all workers
    this.workers.forEach(worker => worker.stop = true);
    
    // Wait for workers to finish current tasks
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Close browser
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }

    // Save URL cache
    await this.saveUrlCache();

    this.emit('stopped');
    console.log('✅ Background Data Mining Service stopped');
  }

  /**
   * Create a new mining job
   */
  async createMiningJob(config) {
    const jobId = uuidv4();
    
    const job = {
      id: jobId,
      name: config.name,
      subject: config.subject,
      description: config.description || '',
      schema: config.schema || {},
      attributes: config.attributes || [],
      seedUrls: config.seedUrls || [],
      status: 'pending',
      progress: {
        totalUrls: 0,
        processedUrls: 0,
        successfulCrawls: 0,
        failedCrawls: 0,
        tasksCompleted: 0,
        tasksTotal: 0
      },
      config: {
        maxDepth: config.maxDepth || 3,
        maxUrls: config.maxUrls || 1000,
        respectRobotsTxt: config.respectRobotsTxt !== false,
        ...config.config
      },
      createdAt: new Date(),
      startedAt: null,
      completedAt: null
    };

    // Save to database
    const client = await this.dbPool.connect();
    try {
      // Create workflow process instance
      const processResult = await client.query(`
        INSERT INTO workflow_process_instances 
        (id, process_definition_id, name, status, config, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        jobId,
        await this.getOrCreateMiningProcessDefinition(client, config.subject),
        job.name,
        'pending',
        JSON.stringify(job.config),
        job.createdAt
      ]);

      // Create tasks for each attribute
      for (let i = 0; i < job.attributes.length; i++) {
        const attribute = job.attributes[i];
        await this.createMiningTask(client, jobId, attribute, i);
      }

      // Add seed URLs
      for (const url of job.seedUrls) {
        await this.addUrlSeed(client, jobId, url);
      }

      job.progress.tasksTotal = job.attributes.length;
    } finally {
      client.release();
    }

    this.activeMiningJobs.set(jobId, job);
    
    // Generate tasks for this job
    await this.generateTasksForJob(jobId);

    this.emit('job:created', job);
    console.log(`✅ Created mining job: ${job.name} (${jobId})`);
    console.log(`   - Subject: ${job.subject}`);
    console.log(`   - Attributes: ${job.attributes.length}`);
    console.log(`   - Seed URLs: ${job.seedUrls.length}`);

    return jobId;
  }

  /**
   * Generate tasks for a mining job
   */
  async generateTasksForJob(jobId) {
    const job = this.activeMiningJobs.get(jobId);
    if (!job) {
      throw new Error(`Mining job not found: ${jobId}`);
    }

    const client = await this.dbPool.connect();
    try {
      // Get all seed URLs for this job
      const urlsResult = await client.query(`
        SELECT id, url, metadata
        FROM url_seeds
        WHERE workflow_instance_id = $1 AND is_active = true
      `, [jobId]);

      // For each URL and attribute combination, create a task
      for (const urlRow of urlsResult.rows) {
        for (const attribute of job.attributes) {
          // Check if we already have this attribute for this URL
          const hasAttribute = await this.urlHasAttribute(
            client,
            urlRow.url,
            attribute.name
          );

          if (!hasAttribute || this.shouldReMine(urlRow.url, attribute)) {
            this.taskQueue.push({
              jobId: jobId,
              taskId: uuidv4(),
              url: urlRow.url,
              urlSeedId: urlRow.id,
              attribute: attribute,
              priority: attribute.priority || 5,
              retries: 0,
              maxRetries: 3,
              createdAt: new Date()
            });
          }
        }
      }

      job.progress.totalUrls = urlsResult.rows.length;
      job.progress.tasksTotal = this.taskQueue.filter(t => t.jobId === jobId).length;
      
      console.log(`📋 Generated ${job.progress.tasksTotal} tasks for job: ${job.name}`);
    } finally {
      client.release();
    }
  }

  /**
   * Start a worker thread
   */
  async startWorker(workerId) {
    const worker = {
      id: workerId,
      stop: false,
      currentTask: null
    };

    this.workers.push(worker);

    const processTask = async () => {
      while (!worker.stop && this.isRunning) {
        // Get next task from queue
        const task = this.getNextTask();
        
        if (!task) {
          // No tasks, wait a bit
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        worker.currentTask = task;
        
        try {
          await this.processTask(task);
        } catch (error) {
          console.error(`❌ Worker ${workerId} error:`, error.message);
          
          // Retry logic
          if (task.retries < task.maxRetries) {
            task.retries++;
            this.taskQueue.push(task); // Re-queue
          } else {
            this.emit('task:failed', task, error);
          }
        }

        worker.currentTask = null;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, this.config.crawlDelayMs));
      }
    };

    processTask().catch(err => {
      console.error(`❌ Worker ${workerId} fatal error:`, err);
    });
  }

  /**
   * Get next task from queue (priority-based)
   */
  getNextTask() {
    if (this.taskQueue.length === 0) {
      return null;
    }

    // Sort by priority (higher first)
    this.taskQueue.sort((a, b) => b.priority - a.priority);
    
    return this.taskQueue.shift();
  }

  /**
   * Process a mining task
   */
  async processTask(task) {
    const job = this.activeMiningJobs.get(task.jobId);
    if (!job) {
      throw new Error(`Job not found: ${task.jobId}`);
    }

    console.log(`🔍 Mining: ${task.url} [${task.attribute.name}]`);

    const page = await this.browser.newPage();
    
    try {
      await page.setUserAgent(this.config.userAgent);
      await page.setDefaultTimeout(30000);

      // Navigate to URL
      await page.goto(task.url, {
        waitUntil: 'networkidle2',
        timeout: 25000
      });

      // Extract attribute data using the attribute's selector/extractor
      const attributeData = await this.extractAttributeData(
        page,
        task.attribute
      );

      // Save to database
      await this.saveAttributeData(task, attributeData);

      // Update progress
      job.progress.processedUrls++;
      job.progress.successfulCrawls++;
      job.progress.tasksCompleted++;

      this.emit('task:completed', task, attributeData);
      
      console.log(`✅ Mined: ${task.url} [${task.attribute.name}]`);
    } finally {
      await page.close();
    }
  }

  /**
   * Extract attribute data from page
   */
  async extractAttributeData(page, attribute) {
    if (attribute.extractor) {
      // Use custom extractor function
      return await page.evaluate(attribute.extractor);
    }

    if (attribute.selector) {
      // Use CSS selector
      return await page.evaluate((selector) => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(el => ({
          text: el.textContent?.trim(),
          html: el.innerHTML,
          attributes: Array.from(el.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {})
        }));
      }, attribute.selector);
    }

    // Default: extract basic page data
    return await page.evaluate(() => ({
      title: document.title,
      text: document.body.textContent?.substring(0, 5000),
      links: Array.from(document.querySelectorAll('a[href]')).map(a => a.href).slice(0, 50)
    }));
  }

  /**
   * Save extracted attribute data to database
   */
  async saveAttributeData(task, data) {
    const client = await this.dbPool.connect();
    try {
      // Save to crawl_results table
      await client.query(`
        INSERT INTO crawl_results 
        (url_seed_id, process_instance_id, url, crawled_at, full_content)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        task.urlSeedId,
        task.jobId,
        task.url,
        new Date(),
        JSON.stringify({
          attribute: task.attribute.name,
          data: data
        })
      ]);

      // Update URL cache
      this.updateUrlCache(task.url, task.attribute.name, data);
    } finally {
      client.release();
    }
  }

  /**
   * Check if URL already has attribute data
   */
  async urlHasAttribute(client, url, attributeName) {
    const result = await client.query(`
      SELECT COUNT(*) as count
      FROM crawl_results
      WHERE url = $1 
        AND full_content::jsonb->>'attribute' = $2
    `, [url, attributeName]);

    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Determine if we should re-mine a URL for an attribute
   */
  shouldReMine(url, attribute) {
    const cached = this.urlCache.get(url);
    if (!cached) {
      return true;
    }

    const attributeData = cached.attributes[attribute.name];
    if (!attributeData) {
      return true;
    }

    // Check if data is stale
    const age = Date.now() - attributeData.timestamp;
    if (age > this.config.urlCacheTTL) {
      return true;
    }

    // Check if attribute definition changed (schema version)
    if (attribute.schemaVersion && attributeData.schemaVersion !== attribute.schemaVersion) {
      return true;
    }

    return false;
  }

  /**
   * Update URL cache
   */
  updateUrlCache(url, attributeName, data) {
    let cached = this.urlCache.get(url);
    if (!cached) {
      cached = {
        url: url,
        attributes: {},
        lastCrawled: new Date()
      };
      this.urlCache.set(url, cached);
    }

    cached.attributes[attributeName] = {
      data: data,
      timestamp: Date.now(),
      schemaVersion: '1.0.0' // TODO: Get from attribute definition
    };
    cached.lastCrawled = new Date();
  }

  /**
   * Load URL cache from database
   */
  async loadUrlCache() {
    const client = await this.dbPool.connect();
    try {
      const result = await client.query(`
        SELECT url, full_content, crawled_at
        FROM crawl_results
        WHERE crawled_at > NOW() - INTERVAL '7 days'
      `);

      for (const row of result.rows) {
        try {
          const content = JSON.parse(row.full_content);
          this.updateUrlCache(row.url, content.attribute, content.data);
        } catch (error) {
          // Skip invalid JSON
        }
      }

      console.log(`📁 Loaded ${this.urlCache.size} URLs into cache`);
    } finally {
      client.release();
    }
  }

  /**
   * Save URL cache to database (optional persistence layer)
   */
  async saveUrlCache() {
    // Cache is already in database via crawl_results
    console.log(`💾 URL cache persisted (${this.urlCache.size} entries)`);
  }

  /**
   * Get or create mining process definition
   */
  async getOrCreateMiningProcessDefinition(client, subject) {
    const result = await client.query(`
      SELECT id FROM workflow_process_definitions
      WHERE name = $1 AND process_type = 'data_mining'
    `, [`Data Mining: ${subject}`]);

    if (result.rows.length > 0) {
      return result.rows[0].id;
    }

    // Create new process definition
    const insertResult = await client.query(`
      INSERT INTO workflow_process_definitions
      (name, process_type, description, schema, tags)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
      `Data Mining: ${subject}`,
      'data_mining',
      `Automated data mining for ${subject}`,
      JSON.stringify({ subject, automationLevel: 'full' }),
      [subject, 'data-mining', 'automated']
    ]);

    return insertResult.rows[0].id;
  }

  /**
   * Create a mining task in database
   */
  async createMiningTask(client, jobId, attribute, order) {
    await client.query(`
      INSERT INTO task_instances
      (process_instance_id, name, status, input_data, created_at)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      jobId,
      `Mine ${attribute.name}`,
      'pending',
      JSON.stringify({ attribute }),
      new Date()
    ]);
  }

  /**
   * Add URL seed to database
   */
  async addUrlSeed(client, jobId, url) {
    try {
      const urlObj = new URL(url);
      await client.query(`
        INSERT INTO url_seeds
        (workflow_instance_id, url, domain, normalized_url, is_active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (url, workflow_instance_id) DO NOTHING
      `, [
        jobId,
        url,
        urlObj.hostname,
        url,
        true
      ]);
    } catch (error) {
      console.warn(`⚠️  Invalid URL: ${url}`);
    }
  }

  /**
   * Get job status
   */
  getJobStatus(jobId) {
    const job = this.activeMiningJobs.get(jobId);
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      name: job.name,
      subject: job.subject,
      status: job.status,
      progress: {
        ...job.progress,
        percentage: job.progress.tasksTotal > 0
          ? Math.round((job.progress.tasksCompleted / job.progress.tasksTotal) * 100)
          : 0
      },
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt
    };
  }

  /**
   * Get all active jobs
   */
  getAllJobs() {
    return Array.from(this.activeMiningJobs.values()).map(job => 
      this.getJobStatus(job.id)
    );
  }

  /**
   * Pause a mining job
   */
  async pauseJob(jobId) {
    const job = this.activeMiningJobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    job.status = 'paused';
    this.emit('job:paused', job);
    console.log(`⏸️  Paused job: ${job.name}`);
  }

  /**
   * Resume a mining job
   */
  async resumeJob(jobId) {
    const job = this.activeMiningJobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    job.status = 'running';
    await this.generateTasksForJob(jobId);
    this.emit('job:resumed', job);
    console.log(`▶️  Resumed job: ${job.name}`);
  }

  /**
   * Stop a mining job
   */
  async stopJob(jobId) {
    const job = this.activeMiningJobs.get(jobId);
    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Remove job tasks from queue
    this.taskQueue = this.taskQueue.filter(t => t.jobId !== jobId);
    
    job.status = 'stopped';
    job.completedAt = new Date();
    
    this.activeMiningJobs.delete(jobId);
    this.emit('job:stopped', job);
    console.log(`🛑 Stopped job: ${job.name}`);
  }
}

export default BackgroundDataMiningService;
