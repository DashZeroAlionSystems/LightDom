import express from 'express';
import { Request, Response } from 'express';
import { Logger } from '../utils/Logger';
import HeadlessChromeService from '../services/HeadlessChromeService';
import WebCrawlerService from '../services/WebCrawlerService';
import OptimizationEngine from '../services/OptimizationEngine';
import BackgroundWorkerService from '../services/BackgroundWorkerService';
import { pwaNotificationService } from '../services/PWANotificationService';

const router = express.Router();
const logger = new Logger('HeadlessRoutes');

// Initialize services
const headlessService = new HeadlessChromeService();
const crawlerService = new WebCrawlerService();
const optimizationEngine = new OptimizationEngine();
const backgroundWorker = new BackgroundWorkerService();

// Enhanced system integration
let blockchainSystem: any = null;
let crawlerSystem: any = null;

// Initialize services on startup
(async () => {
  try {
    await headlessService.initialize();
    await crawlerService.initialize();
    await optimizationEngine.initialize();
    await backgroundWorker.initialize();
    
    // Try to get enhanced systems if available
    if (global.blockchainSystem) {
      blockchainSystem = global.blockchainSystem;
      logger.info('Enhanced blockchain system connected');
    }
    
    if (global.crawlerSystem) {
      crawlerSystem = global.crawlerSystem;
      logger.info('Enhanced crawler system connected');
    }
    
    logger.info('All headless services initialized');
  } catch (error) {
    logger.error('Failed to initialize headless services:', error);
  }
})();

/**
 * @route GET /api/headless/status
 * @desc Get status of all headless services
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = {
      headless: headlessService.getStatus(),
      crawler: crawlerService.getStatus(),
      optimization: optimizationEngine.getStatus(),
      backgroundWorker: backgroundWorker.getStatus(),
      enhanced: {
        blockchain: blockchainSystem ? blockchainSystem.getMiningStats() : null,
        crawler: crawlerSystem ? crawlerSystem.getCrawlerStats() : null,
        blockchainHealth: blockchainSystem ? blockchainSystem.getHealthStatus() : null,
        crawlerHealth: crawlerSystem ? crawlerSystem.getHealthStatus() : null
      },
      pwa: {
        supported: pwaNotificationService.isPWASupported(),
        serviceWorkerActive: pwaNotificationService.isServiceWorkerActive(),
        subscription: pwaNotificationService.getSubscriptionInfo() ? 'active' : 'inactive'
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Failed to get status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get status'
    });
  }
});

/**
 * @route POST /api/headless/page/create
 * @desc Create a new headless page
 */
router.post('/page/create', async (req: Request, res: Response) => {
  try {
    const { pageId, options = {} } = req.body;

    if (!pageId) {
      return res.status(400).json({
        success: false,
        error: 'Page ID is required'
      });
    }

    const page = await headlessService.createPage(pageId, options);

    res.json({
      success: true,
      data: {
        pageId,
        status: 'created'
      }
    });
  } catch (error) {
    logger.error('Failed to create page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create page'
    });
  }
});

/**
 * @route POST /api/headless/page/navigate
 * @desc Navigate to a URL
 */
router.post('/page/navigate', async (req: Request, res: Response) => {
  try {
    const { pageId, url, options = {} } = req.body;

    if (!pageId || !url) {
      return res.status(400).json({
        success: false,
        error: 'Page ID and URL are required'
      });
    }

    await headlessService.navigateToPage(pageId, url, options);

    res.json({
      success: true,
      data: {
        pageId,
        url,
        status: 'navigated'
      }
    });
  } catch (error) {
    logger.error('Failed to navigate page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to navigate page'
    });
  }
});

/**
 * @route POST /api/headless/page/analyze
 * @desc Analyze DOM of a page
 */
router.post('/page/analyze', async (req: Request, res: Response) => {
  try {
    const { pageId } = req.body;

    if (!pageId) {
      return res.status(400).json({
        success: false,
        error: 'Page ID is required'
      });
    }

    const analysis = await headlessService.analyzeDOM(pageId);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Failed to analyze page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze page'
    });
  }
});

/**
 * @route POST /api/headless/page/screenshot
 * @desc Take a screenshot of a page
 */
router.post('/page/screenshot', async (req: Request, res: Response) => {
  try {
    const { pageId, options = {} } = req.body;

    if (!pageId) {
      return res.status(400).json({
        success: false,
        error: 'Page ID is required'
      });
    }

    const screenshot = await headlessService.takeScreenshot(pageId, options);

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': screenshot.length
    });

    res.send(screenshot);
  } catch (error) {
    logger.error('Failed to take screenshot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to take screenshot'
    });
  }
});

/**
 * @route POST /api/headless/page/pdf
 * @desc Generate PDF from page
 */
router.post('/page/pdf', async (req: Request, res: Response) => {
  try {
    const { pageId, options = {} } = req.body;

    if (!pageId) {
      return res.status(400).json({
        success: false,
        error: 'Page ID is required'
      });
    }

    const pdf = await headlessService.generatePDF(pageId, options);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length,
      'Content-Disposition': 'attachment; filename="page.pdf"'
    });

    res.send(pdf);
  } catch (error) {
    logger.error('Failed to generate PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate PDF'
    });
  }
});

/**
 * @route POST /api/headless/page/execute
 * @desc Execute custom JavaScript on page
 */
router.post('/page/execute', async (req: Request, res: Response) => {
  try {
    const { pageId, script, args = [] } = req.body;

    if (!pageId || !script) {
      return res.status(400).json({
        success: false,
        error: 'Page ID and script are required'
      });
    }

    const result = await headlessService.executeScript(pageId, script, ...args);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to execute script:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute script'
    });
  }
});

/**
 * @route DELETE /api/headless/page/:pageId
 * @desc Close a page
 */
router.delete('/page/:pageId', async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;

    await headlessService.closePage(pageId);

    res.json({
      success: true,
      data: {
        pageId,
        status: 'closed'
      }
    });
  } catch (error) {
    logger.error('Failed to close page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to close page'
    });
  }
});

/**
 * @route POST /api/headless/crawl
 * @desc Start crawling a website
 */
router.post('/crawl', async (req: Request, res: Response) => {
  try {
    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const crawlId = await crawlerService.crawlWebsite(url, options);

    res.json({
      success: true,
      data: {
        crawlId,
        url,
        status: 'queued'
      }
    });
  } catch (error) {
    logger.error('Failed to start crawl:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start crawl'
    });
  }
});

/**
 * @route GET /api/headless/crawl/:crawlId/status
 * @desc Get crawl status
 */
router.get('/crawl/:crawlId/status', async (req: Request, res: Response) => {
  try {
    const { crawlId } = req.params;

    const status = await crawlerService.getCrawlStatus(crawlId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Failed to get crawl status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get crawl status'
    });
  }
});

/**
 * @route GET /api/headless/crawl/:crawlId/result
 * @desc Get crawl result
 */
router.get('/crawl/:crawlId/result', async (req: Request, res: Response) => {
  try {
    const { crawlId } = req.params;

    const result = await crawlerService.getCrawlResult(crawlId);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Crawl result not found'
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to get crawl result:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get crawl result'
    });
  }
});

/**
 * @route POST /api/headless/optimize
 * @desc Start optimizing a website
 */
router.post('/optimize', async (req: Request, res: Response) => {
  try {
    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const optimizationId = await optimizationEngine.optimizeWebsite(url, options);

    res.json({
      success: true,
      data: {
        optimizationId,
        url,
        status: 'queued'
      }
    });
  } catch (error) {
    logger.error('Failed to start optimization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start optimization'
    });
  }
});

/**
 * @route GET /api/headless/optimize/:optimizationId/status
 * @desc Get optimization status
 */
router.get('/optimize/:optimizationId/status', async (req: Request, res: Response) => {
  try {
    const { optimizationId } = req.params;

    const status = await optimizationEngine.getOptimizationStatus(optimizationId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Failed to get optimization status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get optimization status'
    });
  }
});

/**
 * @route GET /api/headless/optimize/:optimizationId/result
 * @desc Get optimization result
 */
router.get('/optimize/:optimizationId/result', async (req: Request, res: Response) => {
  try {
    const { optimizationId } = req.params;

    const result = await optimizationEngine.getOptimizationResult(optimizationId);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Optimization result not found'
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Failed to get optimization result:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get optimization result'
    });
  }
});

/**
 * @route POST /api/headless/worker/job
 * @desc Add a job to background worker
 */
router.post('/worker/job', async (req: Request, res: Response) => {
  try {
    const { queueName, jobType, data, options = {} } = req.body;

    if (!queueName || !jobType) {
      return res.status(400).json({
        success: false,
        error: 'Queue name and job type are required'
      });
    }

    const job = await backgroundWorker.addJob(queueName, jobType, data, options);

    res.json({
      success: true,
      data: {
        jobId: job.id,
        queueName,
        jobType,
        status: 'queued'
      }
    });
  } catch (error) {
    logger.error('Failed to add job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add job'
    });
  }
});

/**
 * @route GET /api/headless/worker/queue/:queueName/status
 * @desc Get queue status
 */
router.get('/worker/queue/:queueName/status', async (req: Request, res: Response) => {
  try {
    const { queueName } = req.params;

    const status = await backgroundWorker.getQueueStatus(queueName);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Failed to get queue status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get queue status'
    });
  }
});

/**
 * @route GET /api/headless/health
 * @desc Get health status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        headless: headlessService.getStatus(),
        crawler: crawlerService.getStatus(),
        optimization: optimizationEngine.getStatus(),
        backgroundWorker: backgroundWorker.getStatus()
      }
    };

    // Check if any service is unhealthy
    const services = Object.values(healthStatus.services);
    const unhealthyServices = services.filter(service => 
      !service.isInitialized || !service.browserConnected
    );

    if (unhealthyServices.length > 0) {
      healthStatus.status = 'unhealthy';
    }

    res.json(healthStatus);
  } catch (error) {
    logger.error('Failed to get health status:', error);
    res.status(500).json({
      status: 'unhealthy',
      error: 'Failed to get health status'
    });
  }
});

/**
 * @route POST /api/headless/cleanup
 * @desc Cleanup all resources
 */
router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    await headlessService.cleanup();
    await crawlerService.cleanup();
    await optimizationEngine.cleanup();
    await backgroundWorker.cleanup();

    res.json({
      success: true,
      message: 'All resources cleaned up'
    });
  } catch (error) {
    logger.error('Failed to cleanup resources:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup resources'
    });
  }
});

/**
 * @route POST /api/headless/blockchain/start-mining
 * @desc Start blockchain mining
 */
router.post('/blockchain/start-mining', async (req: Request, res: Response) => {
  try {
    if (!blockchainSystem) {
      return res.status(503).json({
        success: false,
        error: 'Enhanced blockchain system not available'
      });
    }

    await blockchainSystem.startMining();
    
    // Send notification
    await pwaNotificationService.sendSystemAlert('success', 'Blockchain mining started successfully');
    
    res.json({
      success: true,
      message: 'Mining started'
    });
  } catch (error) {
    logger.error('Failed to start mining:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start mining'
    });
  }
});

/**
 * @route POST /api/headless/blockchain/stop-mining
 * @desc Stop blockchain mining
 */
router.post('/blockchain/stop-mining', async (req: Request, res: Response) => {
  try {
    if (!blockchainSystem) {
      return res.status(503).json({
        success: false,
        error: 'Enhanced blockchain system not available'
      });
    }

    await blockchainSystem.stopMining();
    
    // Send notification
    await pwaNotificationService.sendSystemAlert('info', 'Blockchain mining stopped');
    
    res.json({
      success: true,
      message: 'Mining stopped'
    });
  } catch (error) {
    logger.error('Failed to stop mining:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop mining'
    });
  }
});

/**
 * @route POST /api/headless/crawler/start
 * @desc Start enhanced crawler
 */
router.post('/crawler/start', async (req: Request, res: Response) => {
  try {
    if (!crawlerSystem) {
      return res.status(503).json({
        success: false,
        error: 'Enhanced crawler system not available'
      });
    }

    const { urls } = req.body;
    const defaultUrls = ['https://example.com', 'https://httpbin.org'];
    
    await crawlerSystem.startCrawling(urls || defaultUrls);
    
    // Send notification
    await pwaNotificationService.sendSystemAlert('success', 'Web crawler started successfully');
    
    res.json({
      success: true,
      message: 'Crawler started'
    });
  } catch (error) {
    logger.error('Failed to start crawler:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start crawler'
    });
  }
});

/**
 * @route POST /api/headless/crawler/stop
 * @desc Stop enhanced crawler
 */
router.post('/crawler/stop', async (req: Request, res: Response) => {
  try {
    if (!crawlerSystem) {
      return res.status(503).json({
        success: false,
        error: 'Enhanced crawler system not available'
      });
    }

    await crawlerSystem.stopCrawling();
    
    // Send notification
    await pwaNotificationService.sendSystemAlert('info', 'Web crawler stopped');
    
    res.json({
      success: true,
      message: 'Crawler stopped'
    });
  } catch (error) {
    logger.error('Failed to stop crawler:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop crawler'
    });
  }
});

/**
 * @route GET /api/headless/blockchain/stats
 * @desc Get enhanced blockchain statistics
 */
router.get('/blockchain/stats', async (req: Request, res: Response) => {
  try {
    if (!blockchainSystem) {
      return res.status(503).json({
        success: false,
        error: 'Enhanced blockchain system not available'
      });
    }

    const stats = blockchainSystem.getMiningStats();
    const health = blockchainSystem.getHealthStatus();
    
    res.json({
      success: true,
      data: {
        stats,
        health
      }
    });
  } catch (error) {
    logger.error('Failed to get blockchain stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blockchain stats'
    });
  }
});

/**
 * @route GET /api/headless/crawler/stats
 * @desc Get enhanced crawler statistics
 */
router.get('/crawler/stats', async (req: Request, res: Response) => {
  try {
    if (!crawlerSystem) {
      return res.status(503).json({
        success: false,
        error: 'Enhanced crawler system not available'
      });
    }

    const stats = crawlerSystem.getCrawlerStats();
    const health = crawlerSystem.getHealthStatus();
    
    res.json({
      success: true,
      data: {
        stats,
        health
      }
    });
  } catch (error) {
    logger.error('Failed to get crawler stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get crawler stats'
    });
  }
});

/**
 * @route POST /api/headless/notifications/test
 * @desc Test PWA notifications
 */
router.post('/notifications/test', async (req: Request, res: Response) => {
  try {
    const { type, message } = req.body;
    
    switch (type) {
      case 'system':
        await pwaNotificationService.sendSystemAlert('info', message || 'Test notification');
        break;
      case 'mining':
        await pwaNotificationService.sendMiningNotification(12345, 25.5);
        break;
      case 'optimization':
        await pwaNotificationService.sendOptimizationNotification('https://example.com', 15.2);
        break;
      case 'wallet':
        await pwaNotificationService.sendWalletNotification('received', 100, 'LightDom');
        break;
      case 'metaverse':
        await pwaNotificationService.sendMetaverseNotification('bridge', 'New bridge connection established');
        break;
      default:
        await pwaNotificationService.sendNotification('Test Notification', {
          body: message || 'This is a test notification'
        });
    }
    
    res.json({
      success: true,
      message: 'Test notification sent'
    });
  } catch (error) {
    logger.error('Failed to send test notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test notification'
    });
  }
});

export default router;
