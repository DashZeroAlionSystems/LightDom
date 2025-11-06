import express from 'express';
import { RealWebCrawlerSystem } from './crawler/RealWebCrawlerSystem.js';

console.log('Testing imports...');
console.log('Express:', typeof express);
console.log('RealWebCrawlerSystem:', typeof RealWebCrawlerSystem);

const app = express();
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

app.listen(8080, () => {
  console.log('Test server running on port 8080');
});