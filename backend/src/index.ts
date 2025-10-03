import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { authMiddleware } from '@/middleware/auth';
import { validateRequest } from '@/middleware/validation';

// Import routes
import authRoutes from '@/routes/auth';
import fileRoutes from '@/routes/files';
import hostRoutes from '@/routes/hosts';
import contractRoutes from '@/routes/contracts';
import governanceRoutes from '@/routes/governance';
import userRoutes from '@/routes/users';

// Import services
import { DatabaseService } from '@/services/database';
import { RedisService } from '@/services/redis';
import { BlockchainService } from '@/services/blockchain';
import { EncryptionService } from '@/services/encryption';
import { StorageService } from '@/services/storage';
import { NotificationService } from '@/services/notification';

// Import types
import { AppConfig } from '@/types/config';

// Load environment variables
dotenv.config();

class App {
  public app: express.Application;
  public server: any;
  public io: SocketIOServer;
  private config: AppConfig;

  constructor() {
    this.app = express();
    this.config = this.loadConfig();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeServices();
  }

  private loadConfig(): AppConfig {
    return {
      port: parseInt(process.env.PORT || '3001'),
      nodeEnv: process.env.NODE_ENV || 'development',
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        name: process.env.DB_NAME || 'decentralized_storage',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password',
        ssl: process.env.DB_SSL === 'true',
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
      },
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || '',
        db: parseInt(process.env.REDIS_DB || '0'),
      },
      blockchain: {
        rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545',
        privateKey: process.env.PRIVATE_KEY || '',
        contractAddresses: {
          storageToken: process.env.STORAGE_TOKEN_ADDRESS || '',
          storageContract: process.env.STORAGE_CONTRACT_ADDRESS || '',
          storageGovernance: process.env.STORAGE_GOVERNANCE_ADDRESS || '',
          dataEncryption: process.env.DATA_ENCRYPTION_ADDRESS || '',
          hostManager: process.env.HOST_MANAGER_ADDRESS || '',
          fileManager: process.env.FILE_MANAGER_ADDRESS || '',
        },
      },
      jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      },
      encryption: {
        algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
        keyLength: parseInt(process.env.ENCRYPTION_KEY_LENGTH || '32'),
      },
      storage: {
        uploadPath: process.env.UPLOAD_PATH || './uploads',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB
        allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/*,video/*,audio/*,application/pdf,text/*').split(','),
      },
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      },
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
      },
    };
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS middleware
    this.app.use(cors(this.config.cors));
    
    // Compression middleware
    this.app.use(compression());
    
    // Logging middleware
    this.app.use(morgan('combined'));
    
    // Rate limiting
    const limiter = rateLimit({
      windowMs: this.config.rateLimit.windowMs,
      max: this.config.rateLimit.max,
      message: 'Too many requests from this IP, please try again later.',
    });
    this.app.use('/api/', limiter);
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Static file serving
    this.app.use('/uploads', express.static(this.config.storage.uploadPath));
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: this.config.nodeEnv,
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/files', authMiddleware, fileRoutes);
    this.app.use('/api/hosts', authMiddleware, hostRoutes);
    this.app.use('/api/contracts', authMiddleware, contractRoutes);
    this.app.use('/api/governance', authMiddleware, governanceRoutes);
    this.app.use('/api/users', authMiddleware, userRoutes);

    // API documentation
    this.app.get('/api/docs', (req, res) => {
      res.json({
        message: 'Decentralized Storage Platform API',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          files: '/api/files',
          hosts: '/api/hosts',
          contracts: '/api/contracts',
          governance: '/api/governance',
          users: '/api/users',
        },
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Error handler
    this.app.use(errorHandler);
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize database
      await DatabaseService.initialize(this.config.database);
      console.log('✅ Database connected');

      // Initialize Redis
      await RedisService.initialize(this.config.redis);
      console.log('✅ Redis connected');

      // Initialize blockchain service
      await BlockchainService.initialize(this.config.blockchain);
      console.log('✅ Blockchain service initialized');

      // Initialize encryption service
      await EncryptionService.initialize(this.config.encryption);
      console.log('✅ Encryption service initialized');

      // Initialize storage service
      await StorageService.initialize(this.config.storage);
      console.log('✅ Storage service initialized');

      // Initialize notification service
      await NotificationService.initialize();
      console.log('✅ Notification service initialized');

    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    try {
      // Create HTTP server
      this.server = createServer(this.app);
      
      // Initialize Socket.IO
      this.io = new SocketIOServer(this.server, {
        cors: this.config.cors,
      });

      // Initialize Socket.IO handlers
      this.initializeSocketHandlers();

      // Start server
      this.server.listen(this.config.port, () => {
        console.log(`🚀 Server running on port ${this.config.port}`);
        console.log(`📚 API Documentation: http://localhost:${this.config.port}/api/docs`);
        console.log(`🔗 Health Check: http://localhost:${this.config.port}/health`);
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  private initializeSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`👤 User connected: ${socket.id}`);

      // Handle file upload progress
      socket.on('file-upload-progress', (data) => {
        socket.broadcast.emit('file-upload-progress', data);
      });

      // Handle file download progress
      socket.on('file-download-progress', (data) => {
        socket.broadcast.emit('file-download-progress', data);
      });

      // Handle contract updates
      socket.on('contract-update', (data) => {
        socket.broadcast.emit('contract-update', data);
      });

      // Handle host status updates
      socket.on('host-status-update', (data) => {
        socket.broadcast.emit('host-status-update', data);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`👤 User disconnected: ${socket.id}`);
      });
    });
  }

  public async stop(): Promise<void> {
    try {
      // Close database connections
      await DatabaseService.close();
      
      // Close Redis connections
      await RedisService.close();
      
      // Close server
      if (this.server) {
        this.server.close();
      }
      
      console.log('🛑 Server stopped');
    } catch (error) {
      console.error('❌ Error stopping server:', error);
    }
  }
}

// Create and start the application
const app = new App();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

// Start the application
app.start().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});

export default app;