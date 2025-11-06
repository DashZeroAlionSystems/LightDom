import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

const app = express();
const port = 3001;

// Basic middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import and setup admin routes
try {
  const { setupAdminRoutes } = await import('./src/api/adminApi.js');
  setupAdminRoutes(app);
  console.log('✅ Admin API routes registered');
} catch (error) {
  console.error('❌ Failed to load admin routes:', error.message);
}

// Basic health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Simplified API server running on port ${port}`);
  console.log(`📊 Dashboard: http://localhost:${port}/api/health`);
});