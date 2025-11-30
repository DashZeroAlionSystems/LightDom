/**
 * DeepSeek AI API Integration
 * REST API endpoints for AI-powered portfolio management
 */

import { Request, Response, Router } from 'express';
import DeepSeekIntegration from '../ai/DeepSeekIntegration';
import HeadlessCalculationEngine from '../services/HeadlessCalculationEngine';

const router = Router();

// Initialize services
let deepseek: DeepSeekIntegration;
let calculationEngine: HeadlessCalculationEngine;

/**
 * Initialize AI services
 */
export async function initializeAIServices() {
  deepseek = new DeepSeekIntegration({
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    apiEndpoint: process.env.DEEPSEEK_API_ENDPOINT || 'https://api.deepseek.com/v1',
    model: process.env.DEEPSEEK_MODEL || 'deepseek-reasoner',
    temperature: 0.7,
    maxTokens: 2000,
    streamingEnabled: true,
  });

  calculationEngine = new HeadlessCalculationEngine({
    maxWorkers: parseInt(process.env.MAX_CALC_WORKERS || '4'),
    enableCaching: true,
    cacheTTL: 300000,
  });

  await deepseek.initialize();
  await calculationEngine.initialize();

  console.log('✅ AI services initialized');
}

/**
 * GET /api/ai/status
 * Get DeepSeek integration status
 */
router.get('/status', (req: Request, res: Response) => {
  const status = deepseek.getStatus();
  const calcStatus = calculationEngine.getStatus();

  res.json({
    success: true,
    deepseek: status,
    calculationEngine: calcStatus,
  });
});

/**
 * GET /api/ai/streams
 * Get all registered data streams
 */
router.get('/streams', (req: Request, res: Response) => {
  const streams = deepseek.getDataStreams();
  res.json({
    success: true,
    streams,
  });
});

/**
 * POST /api/ai/streams/register
 * Register a new data stream
 */
router.post('/streams/register', (req: Request, res: Response) => {
  const { id, name, type, source, frequency } = req.body;

  if (!id || !name || !type || !source) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: id, name, type, source',
    });
  }

  deepseek.registerDataStream({
    id,
    name,
    type,
    source,
    frequency: frequency || 60000,
    lastUpdate: new Date(),
    status: 'paused',
  });

  res.json({
    success: true,
    message: `Data stream ${name} registered successfully`,
  });
});

/**
 * POST /api/ai/streams/:streamId/start
 * Start monitoring a data stream
 */
router.post('/streams/:streamId/start', async (req: Request, res: Response) => {
  const { streamId } = req.params;

  try {
    await deepseek.startStreamMonitoring(streamId, feedback => {
      // Emit feedback via WebSocket or store for polling
      console.log(`Feedback for ${streamId}:`, feedback);
    });

    res.json({
      success: true,
      message: `Started monitoring stream ${streamId}`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/streams/:streamId/stop
 * Stop monitoring a data stream
 */
router.post('/streams/:streamId/stop', (req: Request, res: Response) => {
  const { streamId } = req.params;

  deepseek.stopStreamMonitoring(streamId);

  res.json({
    success: true,
    message: `Stopped monitoring stream ${streamId}`,
  });
});

/**
 * POST /api/ai/analyze/portfolio
 * Request AI portfolio analysis
 */
router.post('/analyze/portfolio', async (req: Request, res: Response) => {
  const { dataStreams, context, priority } = req.body;

  if (!dataStreams || !Array.isArray(dataStreams)) {
    return res.status(400).json({
      success: false,
      error: 'dataStreams must be an array',
    });
  }

  try {
    const result = await deepseek.analyzePortfolio({
      id: `analysis-${Date.now()}`,
      type: 'portfolio_optimization',
      dataStreams,
      context: context || {},
      priority: priority || 1,
      timestamp: new Date(),
    });

    res.json({
      success: true,
      analysis: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/calculate
 * Submit calculation task
 */
router.post('/calculate', async (req: Request, res: Response) => {
  const { type, inputs, priority } = req.body;

  if (!type || !inputs) {
    return res.status(400).json({
      success: false,
      error: 'type and inputs are required',
    });
  }

  try {
    const result = await calculationEngine.submitTask({
      id: `calc-${Date.now()}`,
      type,
      inputs,
      priority: priority || 1,
      timeout: 60000,
    });

    res.json({
      success: true,
      result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/calculate/portfolio-value
 * Calculate portfolio value
 */
router.post('/calculate/portfolio-value', async (req: Request, res: Response) => {
  const { holdings, prices } = req.body;

  if (!holdings || !prices) {
    return res.status(400).json({
      success: false,
      error: 'holdings and prices are required',
    });
  }

  try {
    const result = await calculationEngine.submitTask({
      id: `portfolio-val-${Date.now()}`,
      type: 'portfolio_valuation',
      inputs: { holdings, prices },
      priority: 1,
      timeout: 30000,
    });

    res.json({
      success: true,
      value: result.data.totalValue,
      breakdown: result.data.assetValues,
      metrics: result.metrics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/calculate/risk
 * Analyze portfolio risk
 */
router.post('/calculate/risk', async (req: Request, res: Response) => {
  const { holdings, historicalPrices, riskFreeRate } = req.body;

  if (!holdings || !historicalPrices) {
    return res.status(400).json({
      success: false,
      error: 'holdings and historicalPrices are required',
    });
  }

  try {
    const result = await calculationEngine.submitTask({
      id: `risk-${Date.now()}`,
      type: 'risk_analysis',
      inputs: { holdings, historicalPrices, riskFreeRate },
      priority: 1,
      timeout: 30000,
    });

    res.json({
      success: true,
      risk: result.data,
      metrics: result.metrics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/calculate/optimize
 * Optimize portfolio allocation
 */
router.post('/calculate/optimize', async (req: Request, res: Response) => {
  const { assets, expectedReturns, covariance, riskTolerance } = req.body;

  if (!assets || !expectedReturns) {
    return res.status(400).json({
      success: false,
      error: 'assets and expectedReturns are required',
    });
  }

  try {
    const result = await calculationEngine.submitTask({
      id: `optimize-${Date.now()}`,
      type: 'optimization',
      inputs: { assets, expectedReturns, covariance, riskTolerance },
      priority: 1,
      timeout: 60000,
    });

    res.json({
      success: true,
      optimization: result.data,
      metrics: result.metrics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/ai/predict
 * Predict market movement
 */
router.post('/predict', async (req: Request, res: Response) => {
  const { historicalPrices, features, horizon } = req.body;

  if (!historicalPrices || !Array.isArray(historicalPrices)) {
    return res.status(400).json({
      success: false,
      error: 'historicalPrices array is required',
    });
  }

  try {
    const result = await calculationEngine.submitTask({
      id: `predict-${Date.now()}`,
      type: 'prediction',
      inputs: { historicalPrices, features, horizon },
      priority: 1,
      timeout: 30000,
    });

    res.json({
      success: true,
      prediction: result.data,
      metrics: result.metrics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/ai/metrics
 * Get AI and calculation metrics
 */
router.get('/metrics', (req: Request, res: Response) => {
  const aiStatus = deepseek.getStatus();
  const calcStatus = calculationEngine.getStatus();

  res.json({
    success: true,
    metrics: {
      ai: {
        totalStreams: aiStatus.totalStreams,
        activeStreams: aiStatus.activeStreams,
        activeAnalyses: aiStatus.activeAnalyses,
      },
      calculation: {
        activeCalculations: calcStatus.activeCalculations,
        queuedTasks: calcStatus.queuedTasks,
        cacheSize: calcStatus.cacheSize,
        cacheHitRate: calcStatus.cacheHitRate,
      },
    },
  });
});

export default router;
