/**
 * Pattern Mining API Routes
 * 
 * API endpoints for JS/HTML pattern detection and analysis
 */

import express from 'express';
import { JSHTMLPatternMiningService } from '../../services/js-html-pattern-mining.js';

const router = express.Router();

// Initialize service (singleton pattern)
let miningService = null;

const getService = async () => {
  if (!miningService) {
    miningService = new JSHTMLPatternMiningService({
      headless: true,
      captureConsole: true
    });
    await miningService.initialize();
  }
  return miningService;
};

/**
 * @route   POST /api/pattern-mining/analyze
 * @desc    Analyze URL for JS/HTML patterns
 * @access  Public
 */
router.post('/analyze', async (req, res) => {
  try {
    const { url, options } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const service = await getService();
    const result = await service.minePatterns(url, options || {});

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   GET /api/pattern-mining/summary
 * @desc    Get pattern detection summary
 * @access  Public
 */
router.get('/summary', async (req, res) => {
  try {
    const service = await getService();
    const summary = service.getPatternSummary();

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error getting pattern summary:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/pattern-mining/puppeteer-workflow
 * @desc    Generate Puppeteer workflow for pattern detection
 * @access  Public
 */
router.post('/puppeteer-workflow', async (req, res) => {
  try {
    const { url, options } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const service = await getService();
    const workflow = service.generatePuppeteerWorkflow(url, options || {});

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error generating Puppeteer workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route   POST /api/pattern-mining/headless-worker
 * @desc    Create headless worker workflow
 * @access  Public
 */
router.post('/headless-worker', async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({
        success: false,
        error: 'Tasks array is required'
      });
    }

    const service = await getService();
    const workflow = service.createHeadlessWorkerWorkflow(tasks);

    res.json({
      success: true,
      data: workflow
    });
  } catch (error) {
    console.error('Error creating headless worker workflow:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
