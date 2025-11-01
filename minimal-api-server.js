// Minimal API Server for testing
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import crawler from './enhanced-web-crawler-service.js'; // UNCOMMENTED FOR TESTING

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Minimal LightDom API Server'
  });
});

// Start server
console.log('🚀 Starting Minimal LightDom API Server...');
app.listen(PORT, () => {
  console.log(`🚀 Minimal LightDom API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log('🎉 Server startup complete - ready to accept connections');
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error('❌ Stack trace:', error.stack);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 API Server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 API Server shutting down...');
  process.exit(0);
});

// Keep the process alive
setInterval(() => {
  console.log('Server still alive at', new Date().toISOString());
}, 5000);