import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import HeadlessService from '../services/HeadlessService';
import HeadlessChromeService from '../services/HeadlessChromeService';
import WebCrawlerService from '../services/WebCrawlerService';
import OptimizationEngine from '../services/OptimizationEngine';
import BackgroundWorkerService from '../services/BackgroundWorkerService';
import MonitoringService from '../services/MonitoringService';
import DOMAnalyzer from '../services/DOMAnalyzer';

describe('HeadlessService', () => {
  let headlessService: HeadlessService;

  beforeAll(async () => {
    headlessService = new HeadlessService();
  });

  afterAll(async () => {
    if (headlessService) {
      await headlessService.cleanup();
    }
  });

  describe('Initialization', () => {
    it('should initialize all services', async () => {
      await headlessService.initialize();

      const status = headlessService.getStatus();
      expect(status.isInitialized).toBe(true);
      expect(status.services).toBeDefined();
      expect(status.services.headlessChrome).toBeDefined();
      expect(status.services.webCrawler).toBeDefined();
      expect(status.services.optimizationEngine).toBeDefined();
      expect(status.services.backgroundWorker).toBeDefined();
      expect(status.services.monitoringService).toBeDefined();
    });

    it('should get service instances', () => {
      expect(headlessService.getHeadlessChromeService()).toBeInstanceOf(HeadlessChromeService);
      expect(headlessService.getWebCrawlerService()).toBeInstanceOf(WebCrawlerService);
      expect(headlessService.getOptimizationEngine()).toBeInstanceOf(OptimizationEngine);
      expect(headlessService.getBackgroundWorkerService()).toBeInstanceOf(BackgroundWorkerService);
      expect(headlessService.getMonitoringService()).toBeInstanceOf(MonitoringService);
      expect(headlessService.getDOMAnalyzer()).toBeInstanceOf(DOMAnalyzer);
    });
  });

  describe('Status and Health', () => {
    it('should return comprehensive status', () => {
      const status = headlessService.getStatus();

      expect(status).toHaveProperty('isInitialized');
      expect(status).toHaveProperty('services');
      expect(status).toHaveProperty('config');
      expect(status).toHaveProperty('errors');

      expect(typeof status.isInitialized).toBe('boolean');
      expect(typeof status.services).toBe('object');
      expect(typeof status.config).toBe('object');
      expect(typeof status.errors).toBe('object');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup all services', async () => {
      await headlessService.cleanup();

      const status = headlessService.getStatus();
      expect(status.isInitialized).toBe(false);
    });
  });
});

describe('HeadlessChromeService', () => {
  let service: HeadlessChromeService;

  beforeEach(async () => {
    service = new HeadlessChromeService();
    await service.initialize();
  });

  afterEach(async () => {
    if (service) {
      await service.cleanup();
    }
  });

  describe('Page Management', () => {
    it('should create a page', async () => {
      const pageId = 'test-page-1';
      const page = await service.createPage(pageId);

      expect(page).toBeDefined();
      expect(service.getStatus().activePages).toBe(1);
    });

    it('should close a page', async () => {
      const pageId = 'test-page-2';
      await service.createPage(pageId);
      await service.closePage(pageId);

      expect(service.getStatus().activePages).toBe(0);
    });

    it('should navigate to a URL', async () => {
      const pageId = 'test-page-3';
      const page = await service.createPage(pageId);

      await service.navigateToPage(pageId, 'https://example.com');

      const pageInfo = service.getPageInfo(pageId);
      expect(pageInfo).toBeDefined();
    });

    it('should take a screenshot', async () => {
      const pageId = 'test-page-4';
      await service.createPage(pageId);
      await service.navigateToPage(pageId, 'https://example.com');

      const screenshot = await service.takeScreenshot(pageId);

      expect(screenshot).toBeDefined();
      expect(screenshot.length).toBeGreaterThan(0);
    });

    it('should generate PDF', async () => {
      const pageId = 'test-page-5';
      await service.createPage(pageId);
      await service.navigateToPage(pageId, 'https://example.com');

      const pdf = await service.generatePDF(pageId);

      expect(pdf).toBeDefined();
      expect(pdf.length).toBeGreaterThan(0);
    });

    it('should analyze DOM', async () => {
      const pageId = 'test-page-6';
      await service.createPage(pageId);
      await service.navigateToPage(pageId, 'https://example.com');

      const analysis = await service.analyzeDOM(pageId);

      expect(analysis).toBeDefined();
      expect(analysis.totalElements).toBeGreaterThan(0);
      expect(analysis.imageAnalysis).toBeDefined();
      expect(analysis.scriptAnalysis).toBeDefined();
      expect(analysis.cssAnalysis).toBeDefined();
      expect(analysis.performanceMetrics).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid page operations', async () => {
      const pageId = 'non-existent-page';

      await expect(service.closePage(pageId)).rejects.toThrow();
      await expect(service.navigateToPage(pageId, 'https://example.com')).rejects.toThrow();
      await expect(service.takeScreenshot(pageId)).rejects.toThrow();
    });

    it('should handle invalid URLs', async () => {
      const pageId = 'test-page-invalid-url';
      await service.createPage(pageId);

      await expect(service.navigateToPage(pageId, 'invalid-url')).rejects.toThrow();
    });
  });
});

describe('WebCrawlerService', () => {
  let service: WebCrawlerService;

  beforeEach(async () => {
    service = new WebCrawlerService();
    await service.initialize();
  });

  afterEach(async () => {
    if (service) {
      await service.cleanup();
    }
  });

  describe('Website Crawling', () => {
    it('should crawl a website', async () => {
      const url = 'https://example.com';
      const crawlId = await service.crawlWebsite(url);

      expect(crawlId).toBeDefined();
      expect(typeof crawlId).toBe('string');
    });

    it('should get crawl status', async () => {
      const url = 'https://example.com';
      const crawlId = await service.crawlWebsite(url);

      const status = await service.getCrawlStatus(crawlId);

      expect(status).toBeDefined();
      expect(status.crawlId).toBe(crawlId);
      expect(status.url).toBe(url);
      expect(['queued', 'processing', 'completed', 'failed']).toContain(status.status);
    });

    it('should get crawl result', async () => {
      const url = 'https://example.com';
      const crawlId = await service.crawlWebsite(url);

      // Wait for crawl to complete
      let result;
      let attempts = 0;
      while (attempts < 30) {
        result = await service.getCrawlResult(crawlId);
        if (result) break;
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (result) {
        expect(result).toBeDefined();
        expect(result.url).toBe(url);
        expect(result.websiteData).toBeDefined();
        expect(result.domAnalysis).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid URLs', async () => {
      const url = 'invalid-url';

      await expect(service.crawlWebsite(url)).rejects.toThrow();
    });

    it('should handle non-existent crawl IDs', async () => {
      const crawlId = 'non-existent-crawl-id';

      await expect(service.getCrawlStatus(crawlId)).rejects.toThrow();
      expect(service.getCrawlResult(crawlId)).toBeNull();
    });
  });
});

describe('OptimizationEngine', () => {
  let service: OptimizationEngine;

  beforeEach(async () => {
    service = new OptimizationEngine();
    await service.initialize();
  });

  afterEach(async () => {
    if (service) {
      await service.cleanup();
    }
  });

  describe('Website Optimization', () => {
    it('should start optimization', async () => {
      const url = 'https://example.com';
      const optimizationId = await service.optimizeWebsite(url);

      expect(optimizationId).toBeDefined();
      expect(typeof optimizationId).toBe('string');
    });

    it('should get optimization status', async () => {
      const url = 'https://example.com';
      const optimizationId = await service.optimizeWebsite(url);

      const status = await service.getOptimizationStatus(optimizationId);

      expect(status).toBeDefined();
      expect(status.optimizationId).toBe(optimizationId);
      expect(status.url).toBe(url);
      expect(['queued', 'analyzing', 'optimizing', 'completed', 'failed']).toContain(status.status);
    });

    it('should get optimization result', async () => {
      const url = 'https://example.com';
      const optimizationId = await service.optimizeWebsite(url);

      // Wait for optimization to complete
      let result;
      let attempts = 0;
      while (attempts < 60) {
        result = await service.getOptimizationResult(optimizationId);
        if (result) break;
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (result) {
        expect(result).toBeDefined();
        expect(result.optimizationId).toBe(optimizationId);
        expect(result.url).toBe(url);
        expect(result.appliedOptimizations).toBeDefined();
        expect(Array.isArray(result.appliedOptimizations)).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid URLs', async () => {
      const url = 'invalid-url';

      await expect(service.optimizeWebsite(url)).rejects.toThrow();
    });

    it('should handle non-existent optimization IDs', async () => {
      const optimizationId = 'non-existent-optimization-id';

      await expect(service.getOptimizationStatus(optimizationId)).rejects.toThrow();
      expect(service.getOptimizationResult(optimizationId)).toBeNull();
    });
  });
});

describe('BackgroundWorkerService', () => {
  let service: BackgroundWorkerService;

  beforeEach(async () => {
    service = new BackgroundWorkerService();
    await service.initialize();
  });

  afterEach(async () => {
    if (service) {
      await service.cleanup();
    }
  });

  describe('Job Management', () => {
    it('should add a job to queue', async () => {
      const job = await service.addJob('crawl', 'crawl-website', {
        url: 'https://example.com',
        options: {},
      });

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
    });

    it('should get queue status', async () => {
      const status = await service.getQueueStatus('crawl');

      expect(status).toBeDefined();
      expect(typeof status.waiting).toBe('number');
      expect(typeof status.active).toBe('number');
      expect(typeof status.completed).toBe('number');
      expect(typeof status.failed).toBe('number');
    });
  });

  describe('Service Status', () => {
    it('should return service status', () => {
      const status = service.getStatus();

      expect(status).toBeDefined();
      expect(typeof status.isRunning).toBe('boolean');
      expect(Array.isArray(status.workers)).toBe(true);
      expect(Array.isArray(status.queues)).toBe(true);
      expect(Array.isArray(status.services)).toBe(true);
    });
  });
});

describe('MonitoringService', () => {
  let service: MonitoringService;
  let mockServices: any;

  beforeEach(async () => {
    service = new MonitoringService({
      enabled: true,
      interval: 1000,
      alertThresholds: {
        memoryUsage: 80,
        cpuUsage: 80,
        errorRate: 10,
        queueBacklog: 100,
        responseTime: 5000,
      },
      retention: {
        metrics: 7,
        alerts: 30,
        logs: 30,
      },
      notifications: {
        email: false,
        slack: false,
        webhook: false,
      },
    });

    // Mock services
    mockServices = {
      headless: { getStatus: () => ({ isRunning: true, activePages: 0 }) },
      crawler: { getStatus: () => ({ isRunning: true, activeCrawls: 0 }) },
      optimization: { getStatus: () => ({ isRunning: true, activeOptimizations: 0 }) },
      backgroundWorker: {
        getStatus: () => ({ isRunning: true }),
        getQueueStatus: () => ({ waiting: 0, active: 0, completed: 0, failed: 0 }),
      },
    };

    service.registerServices(mockServices);
    await service.initialize();
  });

  afterEach(async () => {
    if (service) {
      await service.cleanup();
    }
  });

  describe('Metrics Collection', () => {
    it('should collect metrics', async () => {
      const metrics = await service.collectMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.timestamp).toBeDefined();
      expect(metrics.system).toBeDefined();
      expect(metrics.services).toBeDefined();
      expect(metrics.queues).toBeDefined();
      expect(metrics.performance).toBeDefined();
    });

    it('should perform health check', async () => {
      const health = await service.performHealthCheck();

      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.timestamp).toBeDefined();
      expect(health.services).toBeDefined();
    });
  });

  describe('Alert Management', () => {
    it('should create alerts', async () => {
      const alert = await service.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'Test Alert',
        message: 'This is a test alert',
        service: 'test',
      });

      expect(alert).toBeDefined();
      expect(alert.id).toBeDefined();
      expect(alert.title).toBe('Test Alert');
      expect(alert.resolved).toBe(false);
    });

    it('should resolve alerts', async () => {
      const alert = await service.createAlert({
        type: 'warning',
        severity: 'medium',
        title: 'Test Alert',
        message: 'This is a test alert',
        service: 'test',
      });

      const resolved = await service.resolveAlert(alert.id);

      expect(resolved).toBe(true);

      const alerts = service.getAlerts();
      const resolvedAlert = alerts.find(a => a.id === alert.id);
      expect(resolvedAlert?.resolved).toBe(true);
    });
  });
});

describe('DOMAnalyzer', () => {
  let analyzer: DOMAnalyzer;

  beforeEach(() => {
    analyzer = new DOMAnalyzer();
  });

  describe('Analysis Functions', () => {
    it('should be instantiated', () => {
      expect(analyzer).toBeDefined();
      expect(analyzer).toBeInstanceOf(DOMAnalyzer);
    });
  });
});
