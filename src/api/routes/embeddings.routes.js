import express from 'express';
import * as embeddingsController from '../controllers/embeddings.controller.js';
import { catchAsync, successResponse } from '../utils/response.js';

const router = express.Router();

router.get('/health', (req, res) => successResponse(res, { ok: true }, 'Embeddings router is up'));

router.post('/upsert', catchAsync(embeddingsController.upsert));
router.post('/search', catchAsync(embeddingsController.search));
router.post('/upsert-from-text', catchAsync(embeddingsController.upsertFromText));

export default router;
