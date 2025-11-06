/**
 * Crawler Routes
 * Web crawling and analysis endpoints
 */

import express from 'express';
import { catchAsync } from '../utils/response.js';
import { auth, apiKeyAuth } from '../middlewares/auth.js';
import * as crawlerController from '../controllers/crawler.controller.js';

const router = express.Router();

/**
 * @route   POST /api/crawler/start
 * @desc    Start a new crawling session
 * @access  Protected (API Key)
 */
router.post('/start', apiKeyAuth, catchAsync(crawlerController.startCrawler));

/**
 * @route   POST /api/crawler/stop
 * @desc    Stop a crawling session
 * @access  Protected (API Key)
 */
router.post('/stop', apiKeyAuth, catchAsync(crawlerController.stopCrawler));

/**
 * @route   GET /api/crawler/status
 * @desc    Get crawler status
 * @access  Public
 */
router.get('/status', catchAsync(crawlerController.getCrawlerStatus));

/**
 * @route   POST /api/crawler/crawl-once
 * @desc    Perform a single page crawl
 * @access  Protected (API Key)
 */
router.post('/crawl-once', apiKeyAuth, catchAsync(crawlerController.crawlOnce));

/**
 * @route   GET /api/crawler/sessions
 * @desc    Get all crawling sessions
 * @access  Protected
 */
router.get('/sessions', auth, catchAsync(crawlerController.getSessions));

/**
 * @route   GET /api/crawler/sessions/:sessionId
 * @desc    Get specific session details
 * @access  Protected
 */
router.get('/sessions/:sessionId', auth, catchAsync(crawlerController.getSession));

export default router;
