import express from 'express';
import cors from 'cors';
import { setupAdminRoutes } from './src/api/adminApi.js';

const app = express();
app.use(cors());
app.use(express.json());

setupAdminRoutes(app);

app.listen(3002, () => {
  console.log('Simple admin API server running on port 3002');
});