/**
 * Health Check Routes
 * System health and status endpoints
 */

import express from 'express';
import { catchAsync } from '../utils/response.js';
import * as healthController from '../controllers/health.controller.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', catchAsync(healthController.getHealth));

/**
 * @route   GET /api/health/database
 * @desc    Database health check
 * @access  Public
 */
router.get('/database', catchAsync(healthController.getDatabaseHealth));

/**
 * @route   GET /api/health/system
 * @desc    System health and metrics
 * @access  Public
 */
router.get('/system', catchAsync(healthController.getSystemHealth));

export default router;
