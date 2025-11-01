import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Logger } from '../utils/Logger';
import { ErrorHandler } from '../utils/ErrorHandler';
// HeadlessService implementation resides under services/api in this repo
import HeadlessService from '../services/api/HeadlessService';
import headlessRoutes from '../routes/headless';
import { registerQueueProcessors } from '../services/workflow/MiningQueueProcessor';

export class HeadlessAPIServer {
  private app: express.Application;
  private server: any;
  private logger: Logger;
  private errorHandler: ErrorHandler;
  private headlessService: HeadlessService;
  private port: number;

  constructor(port: number = 3001) {
    this.port = port;
    this.logger = new Logger('HeadlessAPIServer');
    this.errorHandler = new ErrorHandler();
    this.headlessService = new HeadlessService();
    this.app = express();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS middleware
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Logging middleware
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => this.logger.info(message.trim())
      }
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request ID middleware
    this.app.use((req: any, res: any, next: any) => {
      req.requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      res.setHeader('X-Request-ID', req.requestId);
      next();
    });
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: any, res: any) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API status endpoint
    this.app.get('/api/status', (req: any, res: any) => {
      try {
        const status = this.headlessService.getStatus();
        res.json({
          success: true,
          data: status
        });
      } catch (error) {
        this.logger.error('Failed to get status:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get status'
        });
      }
    });

    // Headless services routes
    this.app.use('/api/headless', headlessRoutes);

    // 404 handler
    this.app.use('*', (req: any, res: any) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((error: any, req: any, res: any, next: any) => {
      const errorReport = this.errorHandler.handleError(error, {
        service: 'HeadlessAPIServer',
        operation: req.method + ' ' + req.path,
        requestId: req.requestId,
        userId: req.user?.id,
        sessionId: req.sessionID,
        metadata: {
          body: req.body,
          query: req.query,
          params: req.params,
          headers: req.headers
        }
      });

      this.logger.error('API Error:', {
        errorId: errorReport.id,
        method: req.method,
        path: req.path,
        statusCode: error.statusCode || 500,
        message: error.message
      });

      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal server error',
        errorId: errorReport.id,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Start the server
   */
  async start(): Promise<void> {
    try {
      // Initialize headless services
      await this.headlessService.initialize();
      await registerQueueProcessors();

      // Start HTTP server
      this.server = this.app.listen(this.port, () => {
        this.logger.info(`Headless API server started on port ${this.port}`);
        this.logger.info(`Health check: http://localhost:${this.port}/health`);
        this.logger.info(`API status: http://localhost:${this.port}/api/status`);
      });

      // Handle graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());

    } catch (error) {
      this.logger.error('Failed to start server:', error);
      throw error;
    }
  }

  /**
   * Stop the server
   */
  async stop(): Promise<void> {
    try {
      this.logger.info('Stopping Headless API server...');

      // Close HTTP server
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server.close(() => {
            this.logger.info('HTTP server closed');
            resolve();
          });
        });
      }

      // Cleanup headless services
      await this.headlessService.cleanup();

      this.logger.info('Headless API server stopped');
    } catch (error) {
      this.logger.error('Error during server shutdown:', error);
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  private async shutdown(): Promise<void> {
    this.logger.info('Received shutdown signal, starting graceful shutdown...');
    
    try {
      await this.stop();
      process.exit(0);
    } catch (error) {
      this.logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Get Express app instance
   */
  getApp(): express.Application {
    return this.app;
  }

  /**
   * Get server instance
   */
  getServer(): any {
    return this.server;
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const port = parseInt(process.env.PORT || '3001');
  const server = new HeadlessAPIServer(port);
  
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default HeadlessAPIServer;
