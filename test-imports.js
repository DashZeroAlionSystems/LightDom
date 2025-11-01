import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

console.log('Testing imports...');

try {
  const app = express();
  console.log('✅ Express imported successfully');

  const server = http.createServer(app);
  console.log('✅ HTTP server created successfully');

  const io = new SocketIOServer(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });
  console.log('✅ Socket.IO server created successfully');

  console.log('🎉 All basic imports working!');
} catch (error) {
  console.error('❌ Import error:', error);
}

// Test custom imports
console.log('\nTesting custom imports...');

try {
  console.log('Testing RealWebCrawlerSystem...');
  const { RealWebCrawlerSystem } = await import('./crawler/RealWebCrawlerSystem.js');
  console.log('✅ RealWebCrawlerSystem imported successfully');
} catch (error) {
  console.error('❌ RealWebCrawlerSystem import error:', error.message);
}

try {
  console.log('Testing CrawlerSupervisor...');
  const CrawlerSupervisor = await import('./utils/CrawlerSupervisor.js');
  console.log('✅ CrawlerSupervisor imported successfully');
} catch (error) {
  console.error('❌ CrawlerSupervisor import error:', error.message);
}

try {
  console.log('Testing MetricsCollector...');
  const MetricsCollector = await import('./utils/MetricsCollector.js');
  console.log('✅ MetricsCollector imported successfully');
} catch (error) {
  console.error('❌ MetricsCollector import error:', error.message);
}

try {
  console.log('Testing HeadlessBlockchainRunner...');
  const HeadlessBlockchainRunner = await import('./utils/HeadlessBlockchainRunner.js');
  console.log('✅ HeadlessBlockchainRunner imported successfully');
} catch (error) {
  console.error('❌ HeadlessBlockchainRunner import error:', error.message);
}

try {
  console.log('Testing BlockchainMetricsCollector...');
  const BlockchainMetricsCollector = await import('./utils/BlockchainMetricsCollector.js');
  console.log('✅ BlockchainMetricsCollector imported successfully');
} catch (error) {
  console.error('❌ BlockchainMetricsCollector import error:', error.message);
}

try {
  console.log('Testing api-mining-routes...');
  const { addMiningRoutes } = await import('./api-mining-routes.js');
  console.log('✅ api-mining-routes imported successfully');
} catch (error) {
  console.error('❌ api-mining-routes import error:', error.message);
}

console.log('Custom import testing complete');

// Now test instantiating the API server class
console.log('\nTesting API server instantiation...');

try {
  console.log('Testing DOMSpaceHarvesterAPI import...');
  const { DOMSpaceHarvesterAPI } = await import('./api-server-express.js');
  console.log('✅ DOMSpaceHarvesterAPI imported successfully');

  console.log('Testing DOMSpaceHarvesterAPI instantiation...');
  // Set DB_DISABLED to avoid database connection issues
  process.env.DB_DISABLED = 'true';
  const apiServer = new DOMSpaceHarvesterAPI();
  console.log('✅ DOMSpaceHarvesterAPI instantiated successfully');

} catch (error) {
  console.error('❌ DOMSpaceHarvesterAPI error:', error.message);
  console.error('Stack:', error.stack);
}

console.log('API server testing complete');