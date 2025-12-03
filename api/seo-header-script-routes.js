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
 * Authentication middleware - validates client API key
 */
function authenticateClient(req, res, next) {
  const clientId = req.headers['x-client-id'] || req.query.clientId || req.params.clientId;
  const apiKey = req.headers['x-api-key'];
  
  if (!clientId) {
    return res.status(400).json({
      error: 'Client ID is required',
      code: 'MISSING_CLIENT_ID'
    });
  }
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API key is required',
      code: 'MISSING_API_KEY'
    });
  }
  
  // In production, validate API key against database
  // For now, just check that it exists and matches pattern
  if (!apiKey.startsWith('premium-') && !apiKey.startsWith('standard-') && 
      !apiKey.startsWith('basic-') && !apiKey.startsWith('enterprise-') && 
      !apiKey.startsWith('dev-')) {
    return res.status(401).json({
      error: 'Invalid API key',
      code: 'INVALID_API_KEY'
    });
  }
  
  // Store validated client ID for use in routes
  req.clientId = clientId;
  next();
}

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
router.post('/inject', authenticateClient, async (req, res) => {
  try {
    const clientId = req.clientId; // From authentication middleware
    
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
router.get('/strategy/:clientId', authenticateClient, async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Verify the authenticated client can access this strategy
    if (req.clientId !== clientId) {
      return res.status(403).json({
        error: 'Access denied: Cannot access another client\'s strategy',
        code: 'ACCESS_DENIED',
        requestedClient: clientId,
        authenticatedClient: req.clientId
      });
    }

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
router.put('/strategy/:strategyId', authenticateClient, async (req, res) => {
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
