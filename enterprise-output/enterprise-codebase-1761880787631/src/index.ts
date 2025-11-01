import express from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    containerId: 'enterprise-container-1761880787631'
  });
});

app.listen(port, () => {
  console.log(`🚀 Enterprise application running on port ${port}`);
});
