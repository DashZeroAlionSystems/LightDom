/**
 * Configuration Index
 * Centralizes all configuration management
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  // Database Configuration
  database: {
    enabled: process.env.DB_DISABLED !== 'true',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'dom_space_harvester',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    pool: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  },
  
  // Blockchain Configuration
  blockchain: {
    enabled: process.env.BLOCKCHAIN_ENABLED === 'true',
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    privateKey: process.env.PRIVATE_KEY,
    contracts: {
      dsh: process.env.DSH_CONTRACT,
      poo: process.env.POO_CONTRACT_ADDRESS,
      registry: process.env.REGISTRY_CONTRACT,
      token: process.env.TOKEN_CONTRACT_ADDRESS,
      land: process.env.LAND_CONTRACT_ADDRESS,
    },
  },
  
  // Security Configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  
  // Crawler Configuration
  crawler: {
    maxConcurrent: parseInt(process.env.CRAWLER_MAX_CONCURRENT || '5', 10),
    timeout: parseInt(process.env.CRAWLER_TIMEOUT || '30000', 10),
    userAgent: process.env.CRAWLER_USER_AGENT || 'LightDom-Crawler/1.0',
    outboxPath: process.env.CRAWLER_OUTBOX_PATH || './outbox',
    checkpointPath: process.env.CRAWLER_CHECKPOINT_PATH || './checkpoints',
  },
  
  // WebSocket Configuration
  websocket: {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 60000,
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },
  
  // API Configuration
  api: {
    prefix: '/api',
    version: 'v1',
    jsonLimit: '10mb',
  },
  
  // File paths
  paths: {
    root: path.resolve(__dirname, '../..'),
    blockchain: path.resolve(__dirname, '../../blockchain'),
    abi: path.resolve(__dirname, '../../blockchain/abi'),
    uploads: process.env.UPLOAD_PATH || './uploads',
  },
};

// Validation function
export function validateConfig() {
  const errors = [];
  
  // Validate required blockchain fields if enabled
  if (config.blockchain.enabled && !config.blockchain.privateKey) {
    errors.push('PRIVATE_KEY is required when blockchain is enabled');
  }
  
  // Validate database connection if enabled
  if (config.database.enabled && !config.database.password) {
    console.warn('Warning: Using default database password');
  }
  
  // Validate JWT secret in production
  if (config.env === 'production' && config.security.jwtSecret === 'your-secret-key-change-in-production') {
    errors.push('JWT_SECRET must be set in production');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
  
  return true;
}

export default config;
