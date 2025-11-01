import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

class MinimalAPIServer {
  constructor() {
    console.log('🚀 Starting minimal LightDom API Server...');

    try {
      this.app = express();
      this.server = http.createServer(this.app);
      this.io = new SocketIOServer(this.server, {
        cors: {
          origin: process.env.FRONTEND_URL || "http://localhost:3000",
          methods: ["GET", "POST"]
        }
      });

      this.dbDisabled = process.env.DB_DISABLED === 'true';

      console.log('✅ Basic server components initialized');

      // Setup minimal middleware
      this.setupMinimalMiddleware();

      // Setup minimal routes
      this.setupMinimalRoutes();

      console.log('✅ Minimal server setup complete');

    } catch (error) {
      console.error('❌ Constructor error:', error);
      throw error;
    }
  }

  setupMinimalMiddleware() {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupMinimalRoutes() {
    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: 'minimal-test'
      });
    });

    // Test endpoint
    this.app.get('/api/test', (req, res) => {
      res.json({ message: 'Minimal server is working!' });
    });
  }

  async start(port = 3002) {
    try {
      console.log('🔄 Starting minimal server...');

      // Find available port
      const net = await import('node:net');
      const tryPort = (p) => new Promise((resolve) => {
        const srv = net.createServer();
        srv.once('error', () => resolve(false));
        srv.once('listening', () => srv.close(() => resolve(true)));
        srv.listen(p, '0.0.0.0');
      });

      let chosenPort = port;
      for (let p = port; p < port + 10; p++) {
        const ok = await tryPort(p);
        if (ok) {
          chosenPort = p;
          break;
        }
      }

      return new Promise((resolve, reject) => {
        this.server.listen(chosenPort, () => {
          console.log(`🚀 Minimal API server running on port ${chosenPort}`);
          console.log(`📊 Health check: http://localhost:${chosenPort}/api/health`);
          resolve(chosenPort);
        });

        this.server.on('error', (err) => {
          console.error('❌ Server error:', err?.message || err);
          reject(err);
        });
      });

    } catch (error) {
      console.error('❌ Failed to start minimal server:', error);
      throw error;
    }
  }

  async shutdown() {
    console.log('🛑 Shutting down minimal server...');
    this.server.close();
    console.log('✅ Minimal server shutdown complete');
  }
}

export default MinimalAPIServer;