import express from 'express';
import { catchAsync, successResponse } from '../utils/response.js';
import * as embeddingsController from '../controllers/embeddings.controller.js';

const router = express.Router();

router.get('/health', (req, res) => successResponse(res, { ok: true }, 'Embeddings router is up'));

router.post('/upsert', catchAsync(embeddingsController.upsert));
router.post('/search', catchAsync(embeddingsController.search));

export default router;
