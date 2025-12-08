/**
 * Blockchain Algorithm Optimization API Routes
 * 
 * Endpoints for benchmarking blockchain algorithms for SEO data mining
 * and real-time pattern simulation.
 */

import express from 'express';
import { BlockchainAlgorithmBenchmarkService } from '../services/blockchain-algorithm-benchmark-service.js';
import { DeepSeekDOMOptimizationEngine } from '../services/deepseek-dom-optimization-engine.js';

const router = express.Router();

// Initialize services
let benchmarkService = null;
let optimizationEngine = null;

function initServices() {
  if (!benchmarkService) {
    benchmarkService = new BlockchainAlgorithmBenchmarkService({
      testDuration: 30000, // 30 seconds for quick tests
      seoDataRate: 50,
      blockSize: 50
    });
  }
  
  if (!optimizationEngine) {
    optimizationEngine = new DeepSeekDOMOptimizationEngine({
      deepseekConfig: {
        apiKey: process.env.DEEPSEEK_API_KEY,
        apiUrl: process.env.DEEPSEEK_API_URL
      }
    });
  }
}

/**
 * POST /api/blockchain-optimization/benchmark
 * Run blockchain algorithm benchmark for SEO data mining
 */
router.post('/benchmark', async (req, res) => {
  try {
    initServices();
    
    const { seoDataset, options } = req.body;
    
    if (!seoDataset || !Array.isArray(seoDataset)) {
      return res.status(400).json({
        error: 'Invalid request. seoDataset array is required.'
      });
    }
    
    // Update service options if provided
    if (options) {
      if (options.testDuration) benchmarkService.options.testDuration = options.testDuration;
      if (options.seoDataRate) benchmarkService.options.seoDataRate = options.seoDataRate;
      if (options.blockSize) benchmarkService.options.blockSize = options.blockSize;
    }
    
    console.log(`Starting benchmark with ${seoDataset.length} SEO data points...`);
    
    // Run benchmark
    const results = await benchmarkService.runCompleteBenchmark(seoDataset);
    
    res.json({
      success: true,
      results
    });
    
  } catch (error) {
    console.error('Benchmark error:', error);
    res.status(500).json({
      error: 'Benchmark failed',
      message: error.message
    });
  }
});

/**
 * POST /api/blockchain-optimization/benchmark/algorithm
 * Benchmark a specific algorithm
 */
router.post('/benchmark/algorithm/:algorithm', async (req, res) => {
  try {
    initServices();
    
    const { algorithm } = req.params;
    const { seoDataset, options } = req.body;
    
    if (!benchmarkService.algorithms[algorithm]) {
      return res.status(400).json({
        error: `Unknown algorithm: ${algorithm}`,
        availableAlgorithms: Object.keys(benchmarkService.algorithms)
      });
    }
    
    if (!seoDataset || !Array.isArray(seoDataset)) {
      return res.status(400).json({
        error: 'Invalid request. seoDataset array is required.'
      });
    }
    
    const algoConfig = benchmarkService.algorithms[algorithm];
    const result = await benchmarkService.benchmarkAlgorithm(algorithm, algoConfig, seoDataset);
    
    res.json({
      success: true,
      algorithm,
      result
    });
    
  } catch (error) {
    console.error('Algorithm benchmark error:', error);
    res.status(500).json({
      error: 'Algorithm benchmark failed',
      message: error.message
    });
  }
});

/**
 * GET /api/blockchain-optimization/results
 * Get current benchmark results
 */
router.get('/results', (req, res) => {
  try {
    initServices();
    
    const results = benchmarkService.getResults();
    const report = benchmarkService.generateReport();
    
    res.json({
      success: true,
      results,
      report
    });
    
  } catch (error) {
    console.error('Error getting results:', error);
    res.status(500).json({
      error: 'Failed to get results',
      message: error.message
    });
  }
});

/**
 * GET /api/blockchain-optimization/best/:criteria
 * Get best algorithm for specific criteria
 */
router.get('/best/:criteria', (req, res) => {
  try {
    initServices();
    
    const { criteria } = req.params;
    const validCriteria = ['speed', 'throughput', 'energy', 'accuracy'];
    
    if (!validCriteria.includes(criteria)) {
      return res.status(400).json({
        error: `Invalid criteria. Must be one of: ${validCriteria.join(', ')}`
      });
    }
    
    const [algorithm, result] = benchmarkService.getBestAlgorithmFor(criteria) || [];
    
    if (!algorithm) {
      return res.status(404).json({
        error: 'No benchmark results available. Run a benchmark first.'
      });
    }
    
    res.json({
      success: true,
      criteria,
      bestAlgorithm: algorithm,
      result
    });
    
  } catch (error) {
    console.error('Error getting best algorithm:', error);
    res.status(500).json({
      error: 'Failed to get best algorithm',
      message: error.message
    });
  }
});

/**
 * POST /api/blockchain-optimization/dom/analyze
 * Analyze DOM and generate optimization config with DeepSeek
 */
router.post('/dom/analyze', async (req, res) => {
  try {
    initServices();
    
    const { domAnalysis } = req.body;
    
    if (!domAnalysis) {
      return res.status(400).json({
        error: 'domAnalysis is required'
      });
    }
    
    console.log('Generating optimization config...');
    
    const config = await optimizationEngine.generateOptimizationConfig(domAnalysis);
    
    res.json({
      success: true,
      config
    });
    
  } catch (error) {
    console.error('DOM analysis error:', error);
    res.status(500).json({
      error: 'DOM analysis failed',
      message: error.message
    });
  }
});

/**
 * POST /api/blockchain-optimization/dom/optimize
 * Execute DOM optimization
 */
router.post('/dom/optimize', async (req, res) => {
  try {
    initServices();
    
    const { domTree, config } = req.body;
    
    if (!domTree) {
      return res.status(400).json({
        error: 'domTree is required'
      });
    }
    
    // Generate config if not provided
    let optimizationConfig = config;
    if (!optimizationConfig) {
      const domAnalysis = {
        totalElements: domTree.elements?.length || 0,
        depth: domTree.depth || 0,
        unusedCSS: domTree.unusedCSS || 0,
        unusedJS: domTree.unusedJS || 0,
        deadCode: domTree.deadCode || 0,
        bundleSize: domTree.bundleSize || 0,
        renderBlockingResources: domTree.renderBlockingResources || 0,
        issues: domTree.issues || []
      };
      
      optimizationConfig = await optimizationEngine.generateOptimizationConfig(domAnalysis);
    }
    
    console.log('Executing optimization...');
    
    const result = await optimizationEngine.executeOptimization(domTree, optimizationConfig);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('DOM optimization error:', error);
    res.status(500).json({
      error: 'DOM optimization failed',
      message: error.message
    });
  }
});

/**
 * GET /api/blockchain-optimization/dom/patterns
 * Get learned optimization patterns
 */
router.get('/dom/patterns', (req, res) => {
  try {
    initServices();
    
    const { size, complexity, depth } = req.query;
    
    let patterns;
    if (size || complexity || depth) {
      const domAnalysis = {
        bundleSize: parseInt(size) || 0,
        totalElements: parseInt(complexity) || 0,
        depth: parseInt(depth) || 0
      };
      
      patterns = optimizationEngine.getSimilarPatterns(domAnalysis);
    } else {
      patterns = optimizationEngine.optimizationHistory;
    }
    
    res.json({
      success: true,
      patterns,
      totalPatterns: optimizationEngine.learnedPatterns.size
    });
    
  } catch (error) {
    console.error('Error getting patterns:', error);
    res.status(500).json({
      error: 'Failed to get patterns',
      message: error.message
    });
  }
});

/**
 * POST /api/blockchain-optimization/simulation/run
 * Run real-time simulation for pattern detection
 */
router.post('/simulation/run', async (req, res) => {
  try {
    initServices();
    
    const { seoDataset, algorithm, duration } = req.body;
    
    if (!seoDataset || !Array.isArray(seoDataset)) {
      return res.status(400).json({
        error: 'seoDataset array is required'
      });
    }
    
    // Use specific algorithm or default to best one
    let targetAlgorithm = algorithm || 'poo'; // Default to Proof of Optimization
    
    if (!benchmarkService.algorithms[targetAlgorithm]) {
      return res.status(400).json({
        error: `Unknown algorithm: ${targetAlgorithm}`,
        availableAlgorithms: Object.keys(benchmarkService.algorithms)
      });
    }
    
    // Set duration if provided
    if (duration) {
      benchmarkService.options.testDuration = duration;
    }
    
    console.log(`Running real-time simulation with ${targetAlgorithm}...`);
    
    const algoConfig = benchmarkService.algorithms[targetAlgorithm];
    const result = await benchmarkService.benchmarkAlgorithm(targetAlgorithm, algoConfig, seoDataset);
    
    res.json({
      success: true,
      simulation: {
        algorithm: targetAlgorithm,
        duration: result.duration,
        patternsDetected: result.patternAccuracy,
        realTimeScore: result.realTimeScore,
        throughput: result.throughput,
        metrics: result
      }
    });
    
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({
      error: 'Simulation failed',
      message: error.message
    });
  }
});

/**
 * GET /api/blockchain-optimization/algorithms
 * List available algorithms
 */
router.get('/algorithms', (req, res) => {
  try {
    initServices();
    
    const algorithms = Object.entries(benchmarkService.algorithms).map(([key, config]) => ({
      id: key,
      name: config.name,
      characteristics: {
        energyMultiplier: config.energyMultiplier,
        ...config
      }
    }));
    
    res.json({
      success: true,
      algorithms
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Failed to list algorithms',
      message: error.message
    });
  }
});

/**
 * GET /api/blockchain-optimization/status
 * Get service status
 */
router.get('/status', (req, res) => {
  try {
    initServices();
    
    const status = {
      benchmarkService: {
        initialized: !!benchmarkService,
        isRunning: benchmarkService?.isRunning || false,
        resultsAvailable: benchmarkService ? benchmarkService.benchmarkResults.size : 0
      },
      optimizationEngine: {
        initialized: !!optimizationEngine,
        learnedPatterns: optimizationEngine?.learnedPatterns.size || 0,
        optimizationHistory: optimizationEngine?.optimizationHistory.length || 0
      }
    };
    
    res.json({
      success: true,
      status
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get status',
      message: error.message
    });
  }
});

export default router;
