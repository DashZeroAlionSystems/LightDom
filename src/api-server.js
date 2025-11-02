/**
 * LightDom API Server - Refactored Architecture
 * Modern, scalable Express.js API following industry best practices
 * 
 * Architecture based on:
 * - hagopj13/node-express-boilerplate (7500+ stars)
 * - santiq/bulletproof-nodejs (5680+ stars)
 * - 2024 Node.js/Express best practices
 */

import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

// Configuration
import config, { validateConfig } from './config/index.js';
import { initializeDatabase, testDatabaseConnection } from './config/database.js';

// Middleware
import { errorConverter, errorHandler, notFound } from './api/middlewares/error.js';

// Routes
import healthRoutes from './api/routes/health.routes.js';
import crawlerRoutes from './api/routes/crawler.routes.js';
// More routes will be added as they are created
// import authRoutes from './api/routes/auth.routes.js';
// import blockchainRoutes from './api/routes/blockchain.routes.js';
// ... more routes

class LightDomAPIServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketIO(this.server, {
      cors: config.websocket.cors,
      pingInterval: config.websocket.pingInterval,
      pingTimeout: config.websocket.pingTimeout,
    });
    
    // Storage for real-time features
    this.connectedClients = new Set();
    this.crawlingSessions = new Map();
  }
  
  /**
   * Initialize the server
   */
  async initialize() {
    try {
      // 1. Validate configuration
      console.log('🔍 Validating configuration...');
      validateConfig();
      
      // 2. Initialize database
      console.log('🗄️  Initializing database...');
      initializeDatabase();
      
      if (config.database.enabled) {
        await testDatabaseConnection();
      }
      
      // 3. Setup middleware
      console.log('⚙️  Setting up middleware...');
      this.setupMiddleware();
      
      // 4. Setup routes
      console.log('🛣️  Setting up routes...');
      this.setupRoutes();
      
      // 5. Setup WebSocket
      console.log('🔌 Setting up WebSocket...');
      this.setupWebSocket();
      
      // 6. Setup error handlers (must be last)
      this.setupErrorHandlers();
      
      console.log('✅ Server initialization complete');
      return true;
    } catch (error) {
      console.error('❌ Server initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors(config.cors));
    
    // Compression
    this.app.use(compression());
    
    // Body parsing
    this.app.use(express.json({ limit: config.api.jsonLimit }));
    this.app.use(express.urlencoded({ extended: true, limit: config.api.jsonLimit }));
    
    // Logging
    if (config.env !== 'test') {
      this.app.use(morgan(config.logging.format));
    }
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.security.rateLimitWindowMs,
      max: config.security.rateLimitMaxRequests,
      message: 'Too many requests from this IP, please try again later.',
    });
    this.app.use('/api/', limiter);
    
    // Static files (for optimizer, etc.)
    this.app.use('/optimizer', express.static('optimizer', { 
      maxAge: '7d', 
      etag: true 
    }));
    
    // Request logging middleware
    this.app.use((req, res, next) => {
      req.requestTime = new Date().toISOString();
      next();
    });
  }
  
  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        env: config.env,
      }));
    });
    
    // API info endpoint
    this.app.get('/api', (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'LightDom API Server',
        version: config.api.version,
        documentation: '/api/docs',
      }));
    });
    
    // Mount API routes
    this.app.use('/api/health', healthRoutes);
    this.app.use('/api/crawler', crawlerRoutes);
    
    // TODO: Add more routes as they are created
    // this.app.use('/api/auth', authRoutes);
    // this.app.use('/api/blockchain', blockchainRoutes);
    // this.app.use('/api/analytics', analyticsRoutes);
    // this.app.use('/api/seo', seoRoutes);
    // this.app.use('/api/metaverse', metaverseRoutes);
    // this.app.use('/api/workflow', workflowRoutes);
    
    // For backward compatibility, import old routes temporarily
    this.setupLegacyRoutes();
  }
  
  /**
   * Setup legacy routes (temporary - will be migrated)
   */
  setupLegacyRoutes() {
    // Import and mount existing route files
    // This provides backward compatibility while we migrate
    console.log('📦 Loading legacy routes for backward compatibility...');
    
    // Dynamic imports for existing API files
    try {
      // Example: import('./api/adminApi.js').then(module => {
      //   this.app.use('/api/admin', module.default);
      // });
      
      // We'll migrate these one by one
    } catch (error) {
      console.warn('Some legacy routes could not be loaded:', error.message);
    }
  }
  
  /**
   * Setup WebSocket handlers
   */
  setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log('🔌 Client connected:', socket.id);
      this.connectedClients.add(socket.id);
      
      // Send initial connection confirmation
      socket.emit('connected', {
        message: 'Connected to LightDom API',
        socketId: socket.id,
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
        this.connectedClients.delete(socket.id);
      });
      
      // Setup other socket handlers
      this.setupCrawlerSocketHandlers(socket);
      this.setupMiningSocketHandlers(socket);
      this.setupBridgeSocketHandlers(socket);
    });
  }
  
  /**
   * Setup crawler WebSocket handlers
   */
  setupCrawlerSocketHandlers(socket) {
    socket.on('crawler:subscribe', (data) => {
      socket.join(`crawler:${data.sessionId}`);
    });
    
    socket.on('crawler:unsubscribe', (data) => {
      socket.leave(`crawler:${data.sessionId}`);
    });
  }
  
  /**
   * Setup mining WebSocket handlers
   */
  setupMiningSocketHandlers(socket) {
    socket.on('mining:subscribe', () => {
      socket.join('mining:updates');
    });
    
    socket.on('mining:unsubscribe', () => {
      socket.leave('mining:updates');
    });
  }
  
  /**
   * Setup bridge WebSocket handlers
   */
  setupBridgeSocketHandlers(socket) {
    socket.on('bridge:join', (bridgeId) => {
      socket.join(`bridge:${bridgeId}`);
      console.log(`Socket ${socket.id} joined bridge ${bridgeId}`);
    });
    
    socket.on('bridge:leave', (bridgeId) => {
      socket.leave(`bridge:${bridgeId}`);
    });
  }
  
  /**
   * Broadcast to all connected clients
   */
  broadcast(event, data) {
    this.io.emit(event, data);
  }
  
  /**
   * Broadcast to specific room
   */
  broadcastToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }
  
  /**
   * Setup error handlers (must be last)
   */
  setupErrorHandlers() {
    // 404 handler
    this.app.use(notFound);
    
    // Error converter
    this.app.use(errorConverter);
    
    // Error handler
    this.app.use(errorHandler);
  }
  
  /**
   * Start the server
   */
  async start() {
    try {
      await this.initialize();
      
      const port = config.server.port;
      const host = config.server.host;
      
      this.server.listen(port, host, () => {
        console.log('');
        console.log('🚀 ============================================');
        console.log(`   LightDom API Server`);
        console.log('   ============================================');
        console.log(`   Environment: ${config.env}`);
        console.log(`   Server:      http://${host}:${port}`);
        console.log(`   Health:      http://${host}:${port}/health`);
        console.log(`   API Docs:    http://${host}:${port}/api`);
        console.log('   ============================================');
        console.log('');
      });
      
      return this.server;
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
  
  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 Shutting down server...');
    
    // Close WebSocket connections
    this.io.close();
    
    // Close HTTP server
    this.server.close(() => {
      console.log('✅ Server closed');
    });
    
    // Close database connections
    const { closeDatabase } = await import('./config/database.js');
    await closeDatabase();
    
    process.exit(0);
  }
}

// Create and export server instance
const server = new LightDomAPIServer();

// Handle graceful shutdown
process.on('SIGTERM', () => server.shutdown());
process.on('SIGINT', () => server.shutdown());

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  server.start();
}

export default server;
export { LightDomAPIServer };
