/**
 * API Gateway - External integration and communication interface
 * Provides REST API for external sites to integrate with LightDom framework
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { EventEmitter } from 'events';
import { lightDomFramework } from './LightDomFramework';
import { urlQueueManager } from './URLQueueManager';
import { simulationEngine } from './SimulationEngine';
import { spaceOptimizationEngine } from '../core/SpaceOptimizationEngine';
import { advancedNodeManager } from '../core/AdvancedNodeManager';

export interface APIGatewayConfig {
  port: number;
  enableCORS: boolean;
  enableRateLimit: boolean;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  enableWebhook: boolean;
  webhookSecret?: string;
  enableMetrics: boolean;
  enableSwagger: boolean;
  apiVersion: string;
  basePath: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
  requestId: string;
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: number;
  signature?: string;
}

export class APIGateway extends EventEmitter {
  private app: Express;
  private config: APIGatewayConfig;
  private isRunning = false;
  private server?: any;

  constructor(config: Partial<APIGatewayConfig> = {}) {
    super();
    this.config = {
      port: 3000,
      enableCORS: true,
      enableRateLimit: true,
      rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
      rateLimitMax: 100, // limit each IP to 100 requests per windowMs
      enableWebhook: false,
      enableMetrics: true,
      enableSwagger: true,
      apiVersion: 'v1',
      basePath: '/api',
      ...config
    };

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Start the API gateway
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ API Gateway is already running');
      return;
    }

    try {
      this.server = this.app.listen(this.config.port, () => {
        this.isRunning = true;
        console.log(`🚀 API Gateway started on port ${this.config.port}`);
        console.log(`📚 API Documentation: http://localhost:${this.config.port}${this.config.basePath}/docs`);
        this.emit('started', { port: this.config.port });
      });
    } catch (error) {
      console.error('❌ Failed to start API Gateway:', error);
      throw error;
    }
  }

  /**
   * Stop the API gateway
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.isRunning = false;
          console.log('🛑 API Gateway stopped');
          this.emit('stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    if (this.config.enableCORS) {
      this.app.use(cors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
      }));
    }

    // Rate limiting
    if (this.config.enableRateLimit) {
      const limiter = rateLimit({
        windowMs: this.config.rateLimitWindowMs,
        max: this.config.rateLimitMax,
        message: {
          success: false,
          error: 'Too many requests from this IP, please try again later.',
          timestamp: Date.now()
        }
      });
      this.app.use(limiter);
    }

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const requestId = this.generateRequestId();
      req.requestId = requestId;
      console.log(`${new Date().toISOString()} [${req.method}] ${req.path} - ${requestId}`);
      next();
    });
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    const apiPath = `${this.config.basePath}/${this.config.apiVersion}`;

    // Health check
    this.app.get('/health', this.healthCheck.bind(this));
    this.app.get(`${apiPath}/health`, this.healthCheck.bind(this));

    // Framework status
    this.app.get(`${apiPath}/status`, this.getFrameworkStatus.bind(this));

    // URL Queue endpoints
    this.app.post(`${apiPath}/queue/urls`, this.addURLToQueue.bind(this));
    this.app.get(`${apiPath}/queue/status`, this.getQueueStatus.bind(this));
    this.app.get(`${apiPath}/queue/items`, this.getQueueItems.bind(this));
    this.app.delete(`${apiPath}/queue/items/:id`, this.removeQueueItem.bind(this));
    this.app.post(`${apiPath}/queue/retry/:id`, this.retryQueueItem.bind(this));
    this.app.delete(`${apiPath}/queue/clear`, this.clearQueue.bind(this));

    // Optimization endpoints
    this.app.get(`${apiPath}/optimizations`, this.getOptimizations.bind(this));
    this.app.get(`${apiPath}/optimizations/:id`, this.getOptimization.bind(this));
    this.app.get(`${apiPath}/optimizations/stats`, this.getOptimizationStats.bind(this));

    // Node management endpoints
    this.app.get(`${apiPath}/nodes`, this.getNodes.bind(this));
    this.app.get(`${apiPath}/nodes/:id`, this.getNode.bind(this));
    this.app.get(`${apiPath}/nodes/stats`, this.getNodeStats.bind(this));
    this.app.post(`${apiPath}/nodes/scale`, this.scaleNodes.bind(this));

    // Simulation endpoints
    this.app.get(`${apiPath}/simulation/status`, this.getSimulationStatus.bind(this));
    this.app.post(`${apiPath}/simulation/run`, this.runSimulation.bind(this));
    this.app.get(`${apiPath}/simulation/history`, this.getSimulationHistory.bind(this));
    this.app.get(`${apiPath}/simulation/recommendations`, this.getRecommendations.bind(this));

    // Perks endpoints
    this.app.get(`${apiPath}/perks`, this.getOptimizationPerks.bind(this));
    this.app.get(`${apiPath}/perks/:siteType`, this.getPerksBySiteType.bind(this));

    // Webhook endpoints
    if (this.config.enableWebhook) {
      this.app.post(`${apiPath}/webhook`, this.handleWebhook.bind(this));
    }

    // Metrics endpoints
    if (this.config.enableMetrics) {
      this.app.get(`${apiPath}/metrics`, this.getMetrics.bind(this));
    }

    // API Documentation
    if (this.config.enableSwagger) {
      this.app.get(`${apiPath}/docs`, this.getAPIDocumentation.bind(this));
    }
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      this.sendResponse(res, 404, {
        success: false,
        error: 'Endpoint not found',
        message: `The requested endpoint ${req.originalUrl} does not exist`
      });
    });

    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('API Error:', error);
      this.sendResponse(res, 500, {
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
      });
    });
  }

  /**
   * Health check endpoint
   */
  private async healthCheck(req: Request, res: Response): Promise<void> {
    const health = {
      status: 'healthy',
      timestamp: Date.now(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      framework: {
        running: lightDomFramework.getStatus().running,
        queueSize: urlQueueManager.getStatus().total,
        simulationRunning: simulationEngine.isSimulationRunning()
      }
    };

    this.sendResponse(res, 200, { success: true, data: health });
  }

  /**
   * Get framework status
   */
  private async getFrameworkStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = lightDomFramework.getStatus();
      this.sendResponse(res, 200, { success: true, data: status });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get framework status' });
    }
  }

  /**
   * Add URL to queue
   */
  private async addURLToQueue(req: Request, res: Response): Promise<void> {
    try {
      const { url, priority = 'medium', siteType = 'other', metadata } = req.body;

      if (!url) {
        this.sendResponse(res, 400, { success: false, error: 'URL is required' });
        return;
      }

      const queueId = await lightDomFramework.addURLToQueue(url, priority, siteType);
      
      this.sendResponse(res, 201, {
        success: true,
        data: { queueId, url, priority, siteType },
        message: 'URL added to optimization queue'
      });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to add URL to queue' });
    }
  }

  /**
   * Get queue status
   */
  private async getQueueStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = urlQueueManager.getStatus();
      const metrics = urlQueueManager.getMetrics();
      
      this.sendResponse(res, 200, {
        success: true,
        data: { status, metrics }
      });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get queue status' });
    }
  }

  /**
   * Get queue items
   */
  private async getQueueItems(req: Request, res: Response): Promise<void> {
    try {
      const { status, priority, siteType, limit = 50, offset = 0 } = req.query;
      
      let items = urlQueueManager.getAllItems();
      
      // Filter by status
      if (status) {
        items = items.filter(item => item.status === status);
      }
      
      // Filter by priority
      if (priority) {
        items = items.filter(item => item.priority === priority);
      }
      
      // Filter by site type
      if (siteType) {
        items = items.filter(item => item.siteType === siteType);
      }
      
      // Pagination
      const total = items.length;
      items = items.slice(Number(offset), Number(offset) + Number(limit));
      
      this.sendResponse(res, 200, {
        success: true,
        data: {
          items,
          pagination: {
            total,
            limit: Number(limit),
            offset: Number(offset),
            hasMore: Number(offset) + Number(limit) < total
          }
        }
      });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get queue items' });
    }
  }

  /**
   * Remove queue item
   */
  private async removeQueueItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = urlQueueManager.removeItem(id);
      
      if (success) {
        this.sendResponse(res, 200, { success: true, message: 'Item removed from queue' });
      } else {
        this.sendResponse(res, 404, { success: false, error: 'Item not found' });
      }
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to remove queue item' });
    }
  }

  /**
   * Retry queue item
   */
  private async retryQueueItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const success = urlQueueManager.retryItem(id);
      
      if (success) {
        this.sendResponse(res, 200, { success: true, message: 'Item scheduled for retry' });
      } else {
        this.sendResponse(res, 404, { success: false, error: 'Item not found or cannot be retried' });
      }
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to retry queue item' });
    }
  }

  /**
   * Clear queue
   */
  private async clearQueue(req: Request, res: Response): Promise<void> {
    try {
      urlQueueManager.clear();
      this.sendResponse(res, 200, { success: true, message: 'Queue cleared' });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to clear queue' });
    }
  }

  /**
   * Get optimizations
   */
  private async getOptimizations(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const optimizations = spaceOptimizationEngine.getOptimizations();
      
      const paginatedOptimizations = optimizations.slice(Number(offset), Number(offset) + Number(limit));
      
      this.sendResponse(res, 200, {
        success: true,
        data: {
          optimizations: paginatedOptimizations,
          pagination: {
            total: optimizations.length,
            limit: Number(limit),
            offset: Number(offset),
            hasMore: Number(offset) + Number(limit) < optimizations.length
          }
        }
      });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get optimizations' });
    }
  }

  /**
   * Get specific optimization
   */
  private async getOptimization(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const optimization = spaceOptimizationEngine.getOptimization(id);
      
      if (optimization) {
        this.sendResponse(res, 200, { success: true, data: optimization });
      } else {
        this.sendResponse(res, 404, { success: false, error: 'Optimization not found' });
      }
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get optimization' });
    }
  }

  /**
   * Get optimization statistics
   */
  private async getOptimizationStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = {
        totalSpaceHarvested: spaceOptimizationEngine.getTotalSpaceHarvested(),
        totalTokensDistributed: spaceOptimizationEngine.getTotalTokensDistributed(),
        metaverseStats: spaceOptimizationEngine.getMetaverseStats(),
        totalOptimizations: spaceOptimizationEngine.getOptimizations().length
      };
      
      this.sendResponse(res, 200, { success: true, data: stats });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get optimization stats' });
    }
  }

  /**
   * Get nodes
   */
  private async getNodes(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.query;
      const nodes = type 
        ? advancedNodeManager.getNodesByType(type as any)
        : advancedNodeManager.getAllNodes();
      
      this.sendResponse(res, 200, { success: true, data: nodes });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get nodes' });
    }
  }

  /**
   * Get specific node
   */
  private async getNode(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const stats = advancedNodeManager.getNodeStats(id);
      
      if (stats) {
        this.sendResponse(res, 200, { success: true, data: stats });
      } else {
        this.sendResponse(res, 404, { success: false, error: 'Node not found' });
      }
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get node' });
    }
  }

  /**
   * Get node statistics
   */
  private async getNodeStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = advancedNodeManager.getSystemStats();
      this.sendResponse(res, 200, { success: true, data: stats });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get node stats' });
    }
  }

  /**
   * Scale nodes
   */
  private async scaleNodes(req: Request, res: Response): Promise<void> {
    try {
      const { nodeIds, additionalStorage } = req.body;
      
      if (!nodeIds || !Array.isArray(nodeIds) || !additionalStorage) {
        this.sendResponse(res, 400, { success: false, error: 'nodeIds and additionalStorage are required' });
        return;
      }
      
      const results = nodeIds.map((nodeId: string) => ({
        nodeId,
        success: advancedNodeManager.scaleUpNode(nodeId, additionalStorage)
      }));
      
      this.sendResponse(res, 200, { success: true, data: results });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to scale nodes' });
    }
  }

  /**
   * Get simulation status
   */
  private async getSimulationStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = {
        running: simulationEngine.isSimulationRunning(),
        currentSimulation: simulationEngine.getCurrentSimulation(),
        statistics: simulationEngine.getSimulationStatistics()
      };
      
      this.sendResponse(res, 200, { success: true, data: status });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get simulation status' });
    }
  }

  /**
   * Run simulation
   */
  private async runSimulation(req: Request, res: Response): Promise<void> {
    try {
      const result = await simulationEngine.runSimulation();
      this.sendResponse(res, 200, { success: true, data: result });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to run simulation' });
    }
  }

  /**
   * Get simulation history
   */
  private async getSimulationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const history = simulationEngine.getSimulationHistory();
      
      const paginatedHistory = history.slice(Number(offset), Number(offset) + Number(limit));
      
      this.sendResponse(res, 200, {
        success: true,
        data: {
          simulations: paginatedHistory,
          pagination: {
            total: history.length,
            limit: Number(limit),
            offset: Number(offset),
            hasMore: Number(offset) + Number(limit) < history.length
          }
        }
      });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get simulation history' });
    }
  }

  /**
   * Get recommendations
   */
  private async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const currentSimulation = simulationEngine.getCurrentSimulation();
      const recommendations = currentSimulation?.recommendations || [];
      
      this.sendResponse(res, 200, { success: true, data: recommendations });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get recommendations' });
    }
  }

  /**
   * Get optimization perks
   */
  private async getOptimizationPerks(req: Request, res: Response): Promise<void> {
    try {
      const perks = lightDomFramework.getAllOptimizationPerks();
      this.sendResponse(res, 200, { success: true, data: perks });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get optimization perks' });
    }
  }

  /**
   * Get perks by site type
   */
  private async getPerksBySiteType(req: Request, res: Response): Promise<void> {
    try {
      const { siteType } = req.params;
      const perks = lightDomFramework.getOptimizationPerks(siteType);
      
      if (perks) {
        this.sendResponse(res, 200, { success: true, data: perks });
      } else {
        this.sendResponse(res, 404, { success: false, error: 'Site type not found' });
      }
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get perks for site type' });
    }
  }

  /**
   * Handle webhook
   */
  private async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload: WebhookPayload = req.body;
      
      // Verify webhook signature if secret is configured
      if (this.config.webhookSecret && payload.signature) {
        // Implement signature verification here
        // const expectedSignature = this.calculateSignature(payload);
        // if (payload.signature !== expectedSignature) {
        //   this.sendResponse(res, 401, { success: false, error: 'Invalid webhook signature' });
        //   return;
        // }
      }
      
      this.emit('webhookReceived', payload);
      this.sendResponse(res, 200, { success: true, message: 'Webhook received' });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to process webhook' });
    }
  }

  /**
   * Get metrics
   */
  private async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = {
        framework: lightDomFramework.getStatus(),
        queue: urlQueueManager.getMetrics(),
        simulation: simulationEngine.getSimulationStatistics(),
        nodes: advancedNodeManager.getSystemStats(),
        optimizations: {
          totalSpaceHarvested: spaceOptimizationEngine.getTotalSpaceHarvested(),
          totalTokensDistributed: spaceOptimizationEngine.getTotalTokensDistributed()
        }
      };
      
      this.sendResponse(res, 200, { success: true, data: metrics });
    } catch (error) {
      this.sendResponse(res, 500, { success: false, error: 'Failed to get metrics' });
    }
  }

  /**
   * Get API documentation
   */
  private async getAPIDocumentation(req: Request, res: Response): Promise<void> {
    const documentation = {
      title: 'LightDom Framework API',
      version: this.config.apiVersion,
      description: 'API for LightDom DOM optimization framework',
      baseUrl: `http://localhost:${this.config.port}${this.config.basePath}/${this.config.apiVersion}`,
      endpoints: {
        health: 'GET /health - Health check',
        status: 'GET /status - Framework status',
        queue: {
          addURL: 'POST /queue/urls - Add URL to optimization queue',
          getStatus: 'GET /queue/status - Get queue status',
          getItems: 'GET /queue/items - Get queue items',
          removeItem: 'DELETE /queue/items/:id - Remove queue item',
          retryItem: 'POST /queue/retry/:id - Retry failed item',
          clearQueue: 'DELETE /queue/clear - Clear entire queue'
        },
        optimizations: {
          list: 'GET /optimizations - Get optimizations',
          get: 'GET /optimizations/:id - Get specific optimization',
          stats: 'GET /optimizations/stats - Get optimization statistics'
        },
        nodes: {
          list: 'GET /nodes - Get nodes',
          get: 'GET /nodes/:id - Get specific node',
          stats: 'GET /nodes/stats - Get node statistics',
          scale: 'POST /nodes/scale - Scale nodes'
        },
        simulation: {
          status: 'GET /simulation/status - Get simulation status',
          run: 'POST /simulation/run - Run simulation',
          history: 'GET /simulation/history - Get simulation history',
          recommendations: 'GET /simulation/recommendations - Get recommendations'
        },
        perks: {
          list: 'GET /perks - Get all optimization perks',
          getByType: 'GET /perks/:siteType - Get perks by site type'
        }
      }
    };
    
    this.sendResponse(res, 200, { success: true, data: documentation });
  }

  /**
   * Send standardized API response
   */
  private sendResponse(res: Response, statusCode: number, data: APIResponse): void {
    const response: APIResponse = {
      ...data,
      timestamp: Date.now(),
      requestId: res.req.requestId || this.generateRequestId()
    };
    
    res.status(statusCode).json(response);
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get API gateway status
   */
  getStatus(): {
    running: boolean;
    port: number;
    config: APIGatewayConfig;
  } {
    return {
      running: this.isRunning,
      port: this.config.port,
      config: this.config
    };
  }
}

// Export singleton instance
export const apiGateway = new APIGateway();
