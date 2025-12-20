#!/usr/bin/env node

// Simple API Server Starter with proper configuration
import { spawn } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config();

console.log('🚀 Starting LightDom API Server...');
console.log('================================');

// Set required environment variables
const env = {
  ...process.env,
  NODE_ENV: 'development',
  PORT: '3001',
  DB_DISABLED: 'true', // Disable DB to avoid connection issues
  BLOCKCHAIN_ENABLED: 'false', // Disable blockchain for now
  FRONTEND_URL: 'http://localhost:3000',
  CORS_ORIGIN: '*',
  LOG_LEVEL: 'info'
};

console.log('📋 Configuration:');
console.log(`  - Port: ${env.PORT}`);
console.log(`  - Database: ${env.DB_DISABLED === 'true' ? 'Disabled' : 'Enabled'}`);
console.log(`  - Blockchain: ${env.BLOCKCHAIN_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
console.log(`  - Environment: ${env.NODE_ENV}`);
console.log('');

// Start the API server
const apiProcess = spawn('node', ['api-server-express.js'], {
  env,
  stdio: 'inherit',
  shell: true
});

apiProcess.on('error', (error) => {
  console.error('❌ Failed to start API server:', error.message);
  process.exit(1);
});

apiProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ API server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down API server...');
  apiProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down API server...');
  apiProcess.kill('SIGTERM');
  process.exit(0);
});

console.log('✅ API server starting on http://localhost:3001');
console.log('📡 Health check: http://localhost:3001/api/health');
console.log('📚 API Documentation (Swagger): http://localhost:3001/api-docs');
console.log('📄 OpenAPI Spec: http://localhost:3001/api/openapi.json');
console.log('');
console.log('Press Ctrl+C to stop the server');
