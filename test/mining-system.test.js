/**
 * Integration tests for Background Data Mining System
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import BackgroundDataMiningService from '../services/background-mining-service.js';
import AIConfigGenerator from '../services/ai-config-generator.js';
import { Pool } from 'pg';

describe('Background Data Mining System', () => {
  let service;
  let dbPool;

  beforeAll(async () => {
    // Setup test database connection
    dbPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || 'dom_space_harvester',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 5
    });
  });

  afterAll(async () => {
    if (service) {
      await service.stop();
    }
    if (dbPool) {
      await dbPool.end();
    }
  });

  beforeEach(() => {
    service = new BackgroundDataMiningService({
      dbPool: dbPool,
      workerCount: 1, // Use single worker for testing
      crawlDelayMs: 100
    });
  });

  describe('Service Initialization', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
      expect(service.isRunning).toBe(false);
    });

    it('should start service successfully', async () => {
      await service.start();
      expect(service.isRunning).toBe(true);
      expect(service.browser).toBeDefined();
      await service.stop();
    });

    it('should stop service successfully', async () => {
      await service.start();
      await service.stop();
      expect(service.isRunning).toBe(false);
    });

    it('should not start if already running', async () => {
      await service.start();
      await expect(service.start()).rejects.toThrow('already running');
      await service.stop();
    });
  });

  describe('Mining Job Creation', () => {
    beforeEach(async () => {
      await service.start();
    });

    afterEach(async () => {
      await service.stop();
    });

    it('should create mining job with valid config', async () => {
      const config = {
        name: 'Test Job',
        subject: 'test',
        description: 'Test mining job',
        seedUrls: ['https://example.com'],
        attributes: [
          { name: 'title', selector: 'h1', priority: 10 }
        ],
        maxDepth: 2,
        maxUrls: 10
      };

      const jobId = await service.createMiningJob(config);
      expect(jobId).toBeDefined();
      expect(typeof jobId).toBe('string');

      const job = service.getJobStatus(jobId);
      expect(job).toBeDefined();
      expect(job.name).toBe('Test Job');
      expect(job.subject).toBe('test');
    });

    it('should generate tasks for job', async () => {
      const config = {
        name: 'Multi-Attribute Test',
        subject: 'test',
        seedUrls: ['https://example.com'],
        attributes: [
          { name: 'title', selector: 'h1', priority: 10 },
          { name: 'content', selector: 'p', priority: 8 },
          { name: 'links', selector: 'a', priority: 6 }
        ],
        maxDepth: 1,
        maxUrls: 5
      };

      const jobId = await service.createMiningJob(config);
      
      // Tasks should be generated: 1 URL × 3 attributes = 3 tasks
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for task generation
      
      const job = service.getJobStatus(jobId);
      expect(job.progress.tasksTotal).toBeGreaterThan(0);
    });

    it('should handle jobs with multiple seed URLs', async () => {
      const config = {
        name: 'Multi-URL Test',
        subject: 'test',
        seedUrls: [
          'https://example.com',
          'https://example.org',
          'https://example.net'
        ],
        attributes: [
          { name: 'title', selector: 'h1', priority: 10 }
        ],
        maxDepth: 1
      };

      const jobId = await service.createMiningJob(config);
      const job = service.getJobStatus(jobId);
      
      expect(job.progress.totalUrls).toBe(3);
    });
  });

  describe('URL Cache Management', () => {
    beforeEach(async () => {
      await service.start();
    });

    afterEach(async () => {
      await service.stop();
    });

    it('should cache extracted data', async () => {
      const url = 'https://test.example.com';
      const attributeName = 'test_attr';
      const data = { value: 'test data' };

      service.updateUrlCache(url, attributeName, data);

      const cached = service.urlCache.get(url);
      expect(cached).toBeDefined();
      expect(cached.attributes[attributeName]).toBeDefined();
      expect(cached.attributes[attributeName].data).toEqual(data);
    });

    it('should determine re-mining based on cache', async () => {
      const url = 'https://test.example.com';
      const attribute = { name: 'test_attr', schemaVersion: '1.0.0' };

      // Fresh data - should not re-mine
      service.updateUrlCache(url, attribute.name, { value: 'test' });
      service.urlCache.get(url).attributes[attribute.name].schemaVersion = '1.0.0';
      
      expect(service.shouldReMine(url, attribute)).toBe(false);
    });

    it('should re-mine when schema version changes', async () => {
      const url = 'https://test.example.com';
      const attribute = { name: 'test_attr', schemaVersion: '2.0.0' };

      // Old schema version
      service.updateUrlCache(url, attribute.name, { value: 'test' });
      service.urlCache.get(url).attributes[attribute.name].schemaVersion = '1.0.0';
      
      expect(service.shouldReMine(url, attribute)).toBe(true);
    });

    it('should re-mine when data is stale', async () => {
      const url = 'https://test.example.com';
      const attribute = { name: 'test_attr', schemaVersion: '1.0.0' };

      // Old timestamp
      service.updateUrlCache(url, attribute.name, { value: 'test' });
      service.urlCache.get(url).attributes[attribute.name].timestamp = 
        Date.now() - (service.config.urlCacheTTL + 1000);
      
      expect(service.shouldReMine(url, attribute)).toBe(true);
    });
  });

  describe('Job Control', () => {
    let jobId;

    beforeEach(async () => {
      await service.start();
      
      jobId = await service.createMiningJob({
        name: 'Control Test Job',
        subject: 'test',
        seedUrls: ['https://example.com'],
        attributes: [{ name: 'title', selector: 'h1', priority: 10 }],
        maxDepth: 1
      });
    });

    afterEach(async () => {
      await service.stop();
    });

    it('should pause job', async () => {
      await service.pauseJob(jobId);
      const job = service.getJobStatus(jobId);
      expect(job.status).toBe('paused');
    });

    it('should resume paused job', async () => {
      await service.pauseJob(jobId);
      await service.resumeJob(jobId);
      const job = service.getJobStatus(jobId);
      expect(job.status).toBe('running');
    });

    it('should stop job', async () => {
      await service.stopJob(jobId);
      const job = service.getJobStatus(jobId);
      expect(job).toBeNull(); // Job removed after stopping
    });

    it('should throw error when controlling non-existent job', async () => {
      await expect(service.pauseJob('non-existent-id')).rejects.toThrow('not found');
    });
  });

  describe('Job Status and Progress', () => {
    beforeEach(async () => {
      await service.start();
    });

    afterEach(async () => {
      await service.stop();
    });

    it('should return job status', async () => {
      const jobId = await service.createMiningJob({
        name: 'Status Test',
        subject: 'test',
        seedUrls: ['https://example.com'],
        attributes: [{ name: 'title', selector: 'h1', priority: 10 }],
        maxDepth: 1
      });

      const status = service.getJobStatus(jobId);
      expect(status).toBeDefined();
      expect(status.id).toBe(jobId);
      expect(status.name).toBe('Status Test');
      expect(status.progress).toBeDefined();
      expect(status.progress.percentage).toBeGreaterThanOrEqual(0);
    });

    it('should list all jobs', async () => {
      await service.createMiningJob({
        name: 'Job 1',
        subject: 'test1',
        seedUrls: ['https://example.com'],
        attributes: [{ name: 'title', selector: 'h1', priority: 10 }]
      });

      await service.createMiningJob({
        name: 'Job 2',
        subject: 'test2',
        seedUrls: ['https://example.org'],
        attributes: [{ name: 'title', selector: 'h1', priority: 10 }]
      });

      const jobs = service.getAllJobs();
      expect(jobs.length).toBe(2);
    });

    it('should calculate progress percentage correctly', async () => {
      const jobId = await service.createMiningJob({
        name: 'Progress Test',
        subject: 'test',
        seedUrls: ['https://example.com'],
        attributes: [
          { name: 'title', selector: 'h1', priority: 10 },
          { name: 'content', selector: 'p', priority: 8 }
        ],
        maxDepth: 1
      });

      const job = service.activeMiningJobs.get(jobId);
      job.progress.tasksTotal = 10;
      job.progress.tasksCompleted = 5;

      const status = service.getJobStatus(jobId);
      expect(status.progress.percentage).toBe(50);
    });
  });
});

describe('AI Config Generator', () => {
  let generator;

  beforeEach(() => {
    generator = new AIConfigGenerator();
  });

  describe('Initialization', () => {
    it('should create generator instance', () => {
      expect(generator).toBeDefined();
      expect(generator.defaultModel).toBeDefined();
    });

    it('should use environment variable for Ollama URL', () => {
      const customUrl = 'http://custom-ollama:11434';
      const customGenerator = new AIConfigGenerator({ ollamaUrl: customUrl });
      expect(customGenerator.ollamaUrl).toBe(customUrl);
    });
  });

  describe('Fallback Config Generation', () => {
    it('should generate fallback config when AI unavailable', async () => {
      const prompt = 'mine blog posts about JavaScript';
      const options = { targetUrls: ['https://example.com'] };

      const config = generator.generateFallbackConfig(prompt, options);

      expect(config).toBeDefined();
      expect(config.name).toBeDefined();
      expect(config.subject).toBeDefined();
      expect(config.seedUrls).toEqual(['https://example.com']);
      expect(config.attributes.length).toBeGreaterThan(0);
      expect(config.generatedBy).toBe('fallback');
    });

    it('should extract subject from prompt', () => {
      const subject1 = generator.extractSubject('mine blog posts about React');
      expect(subject1).toBe('blog');

      const subject2 = generator.extractSubject('extract product information');
      expect(subject2).toBe('product');
    });
  });

  describe('Config Enhancement', () => {
    it('should enhance config with defaults', () => {
      const basicConfig = {
        name: 'Test Config',
        subject: 'test',
        seedUrls: ['https://example.com'],
        attributes: [
          { name: 'title' }
        ]
      };

      const enhanced = generator.enhanceConfig(basicConfig, 'test prompt');

      expect(enhanced.id).toBeDefined();
      expect(enhanced.generatedBy).toBe('ai');
      expect(enhanced.originalPrompt).toBe('test prompt');
      expect(enhanced.config).toBeDefined();
      expect(enhanced.config.maxDepth).toBeDefined();
      expect(enhanced.attributes[0].priority).toBeDefined();
      expect(enhanced.attributes[0].schemaVersion).toBeDefined();
    });

    it('should fill in missing attribute fields', () => {
      const config = {
        name: 'Test',
        subject: 'test',
        seedUrls: ['https://example.com'],
        attributes: [
          { name: 'attr1' },
          { name: 'attr2', priority: 5 }
        ]
      };

      const enhanced = generator.enhanceConfig(config, 'test');

      expect(enhanced.attributes[0].priority).toBe(10); // First gets priority 10
      expect(enhanced.attributes[1].priority).toBe(5); // Keeps existing priority
      expect(enhanced.attributes[0].dataType).toBe('text');
      expect(enhanced.attributes[0].validation).toBeDefined();
    });
  });

  describe('Config Validation', () => {
    it('should validate valid config', () => {
      const config = {
        subject: 'test',
        seedUrls: ['https://example.com'],
        attributes: [
          { name: 'title', priority: 10 }
        ]
      };

      const errors = generator.validateConfig(config);
      expect(errors).toHaveLength(0);
    });

    it('should detect missing subject', () => {
      const config = {
        seedUrls: ['https://example.com'],
        attributes: [{ name: 'title' }]
      };

      const errors = generator.validateConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('subject'))).toBe(true);
    });

    it('should detect missing seed URLs', () => {
      const config = {
        subject: 'test',
        seedUrls: [],
        attributes: [{ name: 'title' }]
      };

      const errors = generator.validateConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('seed URL'))).toBe(true);
    });

    it('should detect invalid URLs', () => {
      const config = {
        subject: 'test',
        seedUrls: ['not-a-valid-url'],
        attributes: [{ name: 'title' }]
      };

      const errors = generator.validateConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('Invalid seed URL'))).toBe(true);
    });

    it('should detect invalid priority', () => {
      const config = {
        subject: 'test',
        seedUrls: ['https://example.com'],
        attributes: [
          { name: 'title', priority: 15 } // Invalid: > 10
        ]
      };

      const errors = generator.validateConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.includes('priority'))).toBe(true);
    });
  });

  describe('Prompt Building', () => {
    it('should build system prompt', () => {
      const systemPrompt = generator.buildSystemPrompt();
      
      expect(systemPrompt).toContain('web scraping');
      expect(systemPrompt).toContain('JSON');
      expect(systemPrompt).toContain('attributes');
      expect(systemPrompt).toContain('seedUrls');
    });

    it('should build user prompt with options', () => {
      const userPrompt = generator.buildUserPrompt('mine blog posts', {
        targetUrls: ['https://example.com'],
        dataTypes: ['title', 'content']
      });

      expect(userPrompt).toContain('mine blog posts');
      expect(userPrompt).toContain('https://example.com');
      expect(userPrompt).toContain('title');
      expect(userPrompt).toContain('content');
    });
  });

  describe('Response Parsing', () => {
    it('should parse valid JSON response', () => {
      const response = JSON.stringify({
        name: 'Test',
        subject: 'test',
        seedUrls: ['https://example.com'],
        attributes: []
      });

      const config = generator.parseResponse(response);
      expect(config.name).toBe('Test');
      expect(config.subject).toBe('test');
    });

    it('should handle markdown code blocks', () => {
      const response = '```json\n{"name": "Test", "subject": "test", "seedUrls": [], "attributes": []}\n```';
      
      const config = generator.parseResponse(response);
      expect(config.name).toBe('Test');
    });

    it('should extract JSON from mixed content', () => {
      const response = 'Here is the config:\n{"name": "Test", "subject": "test", "seedUrls": [], "attributes": []}\nHope this helps!';
      
      const config = generator.parseResponse(response);
      expect(config.name).toBe('Test');
    });

    it('should throw error on invalid JSON', () => {
      const response = 'This is not JSON at all';
      
      expect(() => generator.parseResponse(response)).toThrow();
    });
  });
});
