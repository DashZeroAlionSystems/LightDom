/**
 * SEO Header Script API Routes
 * 
 * API endpoints for SEO header script injection service
 */

import express from 'express';
import SeoHeaderScriptService from '../services/seo-header-script-service.js';

const router = express.Router();
const seoService = new SeoHeaderScriptService();

/**
 * @swagger
 * /api/seo/header-script/inject:
 *   post:
 *     tags: [SEO]
 *     summary: Inject SEO header script for client
 *     description: Generate and inject a customized SEO optimization script
 *     security:
 *       - ApiKeyAuth: []
 *       - ClientIdAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ClientIdHeader'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domain
 *               - strategy
 *             properties:
 *               domain:
 *                 type: string
 *                 example: example.com
 *               strategy:
 *                 type: object
 *                 properties:
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *                   metadata:
 *                     type: object
 *                   structuredData:
 *                     type: object
 *               options:
 *                 type: object
 *                 properties:
 *                   async:
 *                     type: boolean
 *                   defer:
 *                     type: boolean
 *                   position:
 *                     type: string
 *                     enum: [head, body-start, body-end]
 */
router.post('/inject', async (req, res) => {
  try {
    const clientId = req.headers['x-client-id'] || req.query.clientId;
    
    if (!clientId) {
      return res.status(400).json({
        error: 'Client ID is required',
        code: 'MISSING_CLIENT_ID'
      });
    }

    const { domain, strategy, options } = req.body;

    if (!domain) {
      return res.status(400).json({
        error: 'Domain is required',
        code: 'MISSING_DOMAIN'
      });
    }

    if (!strategy) {
      return res.status(400).json({
        error: 'Strategy configuration is required',
        code: 'MISSING_STRATEGY'
      });
    }

    const result = await seoService.injectScript(clientId, {
      domain,
      strategy,
      options
    });

    res.json(result);
  } catch (error) {
    console.error('Error injecting SEO script:', error);
    res.status(500).json({
      error: 'Failed to inject SEO script',
      code: 'INJECTION_ERROR',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/seo/header-script/strategy/{clientId}:
 *   get:
 *     tags: [SEO]
 *     summary: Get SEO strategy for client
 *     description: Retrieve the current SEO optimization strategy
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - name: clientId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Client identifier
 */
router.get('/strategy/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;

    const strategy = seoService.getStrategy(clientId);

    if (!strategy) {
      return res.status(404).json({
        error: 'Strategy not found for client',
        code: 'STRATEGY_NOT_FOUND',
        clientId
      });
    }

    res.json({
      success: true,
      strategy
    });
  } catch (error) {
    console.error('Error retrieving strategy:', error);
    res.status(500).json({
      error: 'Failed to retrieve strategy',
      code: 'RETRIEVAL_ERROR',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/seo/header-script/strategy/{strategyId}:
 *   put:
 *     tags: [SEO]
 *     summary: Update SEO strategy
 *     description: Update an existing SEO optimization strategy
 *     security:
 *       - ApiKeyAuth: []
 *       - ClientIdAuth: []
 *     parameters:
 *       - name: strategyId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Strategy identifier
 */
router.put('/strategy/:strategyId', async (req, res) => {
  try {
    const { strategyId } = req.params;
    const updates = req.body;

    const strategy = await seoService.updateStrategy(strategyId, updates);

    res.json({
      success: true,
      strategy,
      message: 'Strategy updated successfully'
    });
  } catch (error) {
    console.error('Error updating strategy:', error);
    
    if (error.message === 'Strategy not found') {
      return res.status(404).json({
        error: 'Strategy not found',
        code: 'STRATEGY_NOT_FOUND',
        strategyId: req.params.strategyId
      });
    }

    res.status(500).json({
      error: 'Failed to update strategy',
      code: 'UPDATE_ERROR',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/seo/header-script/health:
 *   get:
 *     tags: [SEO]
 *     summary: Health check for SEO service
 *     description: Check if SEO header script service is operational
 */
router.get('/health', async (req, res) => {
  try {
    await seoService.initialize();
    
    res.json({
      status: 'ok',
      service: 'SEO Header Script Service',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'SEO Header Script Service',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
