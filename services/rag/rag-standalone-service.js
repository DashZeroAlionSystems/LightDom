#!/usr/bin/env node

/**
 * Standalone RAG Service for LightDom
 * 
 * This service runs the RAG (Retrieval-Augmented Generation) functionality
 * as a standalone process that can be managed by PM2 or other process managers.
 * 
 * Features:
 * - Automatic restart on failure
 * - Comprehensive logging (file-based and stdout)
 * - Graceful shutdown handling
 * - Health check endpoint
 * - Integration with DeepSeek and Ollama
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRagRouter } from './rag-router.js';
import enhancedRagRoutes from '../../api/enhanced-rag-routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.RAG_SERVICE_PORT || 3002;
const HOST = process.env.RAG_SERVICE_HOST || '0.0.0.0';
const LOG_DIR = process.env.RAG_LOG_DIR || path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'rag-service.log');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'rag-service-error.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Enhanced Logger with file and stdout support
 */
class Logger {
  constructor() {
    this.logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
    this.errorStream = fs.createWriteStream(ERROR_LOG_FILE, { flags: 'a' });
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}\n`;
  }

  log(level, message, meta = {}) {
    const formatted = this.formatMessage(level, message, meta);
    
    // Write to stdout
    console.log(formatted.trim());
    
    // Write to file
    if (level === 'ERROR' || level === 'FATAL') {
      this.errorStream.write(formatted);
    }
    this.logStream.write(formatted);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }

  fatal(message, meta = {}) {
    this.log('FATAL', message, meta);
  }

  debug(message, meta = {}) {
    if (process.env.DEBUG === 'true') {
      this.log('DEBUG', message, meta);
    }
  }

  close() {
    return Promise.all([
      new Promise((resolve) => this.logStream.end(resolve)),
      new Promise((resolve) => this.errorStream.end(resolve))
    ]);
  }
}

const logger = new Logger();

/**
 * RAG Service Class
 */
class RagStandaloneService {
  constructor() {
    this.app = express();
    this.server = null;
    this.db = null;
    this.isShuttingDown = false;
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
  }

  /**
   * Initialize database connection
   */
  async initDatabase() {
    try {
      logger.info('Initializing database connection...');
      
      this.db = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: process.env.DB_NAME || 'dom_space_harvester',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      // Test connection
      const result = await this.db.query('SELECT NOW()');
      logger.info('Database connection established', { 
        timestamp: result.rows[0].now 
      });

      return true;
    } catch (error) {
      logger.error('Database connection failed', { 
        error: error.message,
        stack: error.stack 
      });
      throw error;
    }
  }

  /**
   * Setup middleware
   */
  setupMiddleware() {
    logger.info('Setting up middleware...');

    // Security
    this.app.use(helmet({
      contentSecurityPolicy: false, // Allow for API usage
    }));

    // CORS
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      this.requestCount++;
      const start = Date.now();
      
      logger.debug('Incoming request', {
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip
      });

      res.on('finish', () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 400 ? 'warn' : 'debug';
        
        logger[level]('Request completed', {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration: `${duration}ms`
        });
      });

      next();
    });

    // Error tracking
    this.app.use((err, req, res, next) => {
      this.errorCount++;
      logger.error('Request error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
      });
      next(err);
    });
  }

  /**
   * Setup routes
   */
  async setupRoutes() {
    logger.info('Setting up routes...');

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      const uptime = Math.floor((Date.now() - this.startTime) / 1000);
      res.json({
        status: 'healthy',
        service: 'rag-standalone',
        uptime: `${uptime}s`,
        requests: this.requestCount,
        errors: this.errorCount,
        timestamp: new Date().toISOString(),
        database: this.db ? 'connected' : 'disconnected',
        environment: {
          ollama: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
          embedProvider: process.env.RAG_EMBED_PROVIDER || 'ollama'
        }
      });
    });

    // Ready check endpoint
    this.app.get('/ready', async (req, res) => {
      try {
        // Check database
        await this.db.query('SELECT 1');
        
        res.json({
          status: 'ready',
          database: 'ok',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Readiness check failed', { error: error.message });
        res.status(503).json({
          status: 'not ready',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Metrics endpoint
    this.app.get('/metrics', (req, res) => {
      const uptime = Math.floor((Date.now() - this.startTime) / 1000);
      res.json({
        uptime_seconds: uptime,
        requests_total: this.requestCount,
        errors_total: this.errorCount,
        requests_per_second: this.requestCount / uptime || 0,
        error_rate: this.errorCount / this.requestCount || 0,
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      });
    });

    // Mount RAG routes
    try {
      const ragRouter = createRagRouter({ 
        db: this.db, 
        logger 
      });
      this.app.use('/api/rag', ragRouter);
      logger.info('RAG router mounted at /api/rag');

      // Mount enhanced RAG routes
      this.app.locals.db = this.db;
      this.app.use('/api/enhanced-rag', enhancedRagRoutes);
      logger.info('Enhanced RAG router mounted at /api/enhanced-rag');
    } catch (error) {
      logger.error('Failed to mount RAG routes', { 
        error: error.message,
        stack: error.stack 
      });
      throw error;
    }

    // 404 handler
    this.app.use((req, res) => {
      logger.warn('Route not found', { path: req.path, method: req.method });
      res.status(404).json({ 
        error: 'Not Found',
        path: req.path,
        availableRoutes: ['/health', '/ready', '/metrics', '/api/rag/*', '/api/enhanced-rag/*']
      });
    });

    // Error handler
    this.app.use((err, req, res, next) => {
      logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path
      });

      res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Start the service
   */
  async start() {
    try {
      logger.info('Starting RAG Standalone Service...', {
        port: PORT,
        host: HOST,
        nodeVersion: process.version,
        pid: process.pid
      });

      // Initialize database
      await this.initDatabase();

      // Setup middleware and routes
      this.setupMiddleware();
      await this.setupRoutes();

      // Start server
      await new Promise((resolve, reject) => {
        this.server = this.app.listen(PORT, HOST, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      logger.info('RAG Service started successfully', {
        url: `http://${HOST}:${PORT}`,
        pid: process.pid,
        healthCheck: `http://${HOST}:${PORT}/health`
      });

      console.log('\n✅ RAG Service Ready!');
      console.log(`   URL: http://${HOST}:${PORT}`);
      console.log(`   Health: http://${HOST}:${PORT}/health`);
      console.log(`   Logs: ${LOG_FILE}`);
      console.log('');

    } catch (error) {
      logger.fatal('Failed to start RAG service', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(signal = 'SIGTERM') {
    if (this.isShuttingDown) {
      logger.warn('Shutdown already in progress...');
      return;
    }

    this.isShuttingDown = true;
    logger.info(`Shutting down RAG service (${signal})...`);

    try {
      // Stop accepting new requests
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
        logger.info('HTTP server closed');
      }

      // Close database connections
      if (this.db) {
        await this.db.end();
        logger.info('Database connections closed');
      }

      // Close log streams
      await logger.close();

      console.log('✅ RAG service shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and start service
const service = new RagStandaloneService();

// Handle process signals
process.on('SIGTERM', () => service.shutdown('SIGTERM'));
process.on('SIGINT', () => service.shutdown('SIGINT'));
process.on('SIGHUP', () => service.shutdown('SIGHUP'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.fatal('Uncaught exception', {
    error: error.message,
    stack: error.stack
  });
  console.error('💥 Uncaught exception:', error);
  service.shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal('Unhandled rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined
  });
  console.error('💥 Unhandled rejection:', reason);
  service.shutdown('UNHANDLED_REJECTION');
});

// Start service
service.start().catch((error) => {
  logger.fatal('Service startup failed', {
    error: error.message,
    stack: error.stack
  });
  console.error('💥 Failed to start service:', error);
  process.exit(1);
});
