/**
 * Simple test for blockchain algorithm optimization services
 */

import { BlockchainAlgorithmBenchmarkService } from './services/blockchain-algorithm-benchmark-service.js';
import { DeepSeekDOMOptimizationEngine } from './services/deepseek-dom-optimization-engine.js';

console.log('🧪 Testing Blockchain Algorithm Optimization Services\n');

// Test 1: Benchmark Service Initialization
console.log('Test 1: Benchmark Service Initialization');
try {
  const benchmarkService = new BlockchainAlgorithmBenchmarkService({
    testDuration: 5000,
    seoDataRate: 10,
    blockSize: 10
  });
  console.log('✅ Benchmark service initialized');
  console.log(`   Algorithms available: ${Object.keys(benchmarkService.algorithms).join(', ')}`);
} catch (error) {
  console.error('❌ Benchmark service initialization failed:', error.message);
  process.exit(1);
}

// Test 2: Small Benchmark Run
console.log('\nTest 2: Running Small Benchmark');
try {
  const benchmarkService = new BlockchainAlgorithmBenchmarkService({
    testDuration: 3000,
    seoDataRate: 20,
    blockSize: 10
  });
  
  const sampleData = Array.from({ length: 20 }, (_, i) => ({
    url: `https://example.com/page${i}`,
    title: `Test Page ${i}`,
    description: 'Test description',
    keywords: ['test', 'seo'],
    headings: { h1: 1, h2: 2, h3: 3 },
    images: { total: 5, withAlt: 4 },
    performance: { loadTime: 2000 }
  }));
  
  console.log('   Running benchmark with 20 data points...');
  const results = await benchmarkService.runCompleteBenchmark(sampleData);
  
  console.log('✅ Benchmark completed');
  console.log(`   Algorithms tested: ${Object.keys(results.algorithms).length}`);
  console.log(`   Best algorithm: ${results.recommendation.algorithm}`);
  console.log(`   Reason: ${results.recommendation.reason}`);
} catch (error) {
  console.error('❌ Benchmark failed:', error.message);
  process.exit(1);
}

// Test 3: DOM Optimization Engine
console.log('\nTest 3: DOM Optimization Engine');
try {
  const optimizationEngine = new DeepSeekDOMOptimizationEngine({
    deepseekConfig: {
      apiKey: 'test-key',
      apiUrl: 'http://localhost:11434'
    }
  });
  console.log('✅ Optimization engine initialized');
  
  // Test fallback config generation
  const domAnalysis = {
    totalElements: 200,
    depth: 10,
    unusedCSS: 40,
    unusedJS: 30,
    deadCode: 10000,
    bundleSize: 800,
    renderBlockingResources: 5,
    issues: ['Large bundle', 'Unused code']
  };
  
  const config = optimizationEngine.getFallbackConfig(domAnalysis);
  console.log('✅ Fallback config generated');
  console.log(`   Strategies: ${config.strategies.length}`);
  console.log(`   Expected gain: ${(config.expectedGain * 100).toFixed(1)}%`);
  
  config.strategies.forEach(s => {
    console.log(`   - ${s.type} (priority ${s.priority})`);
  });
} catch (error) {
  console.error('❌ Optimization engine failed:', error.message);
  process.exit(1);
}

// Test 4: Pattern Learning
console.log('\nTest 4: Pattern Learning');
try {
  const optimizationEngine = new DeepSeekDOMOptimizationEngine();
  
  // Simulate learning a pattern
  const pattern = {
    domCharacteristics: {
      size: 800,
      complexity: 200,
      depth: 10
    },
    appliedStrategies: ['tree-shaking', 'code-splitting'],
    totalGain: 0.25,
    timestamp: new Date().toISOString()
  };
  
  const patternKey = optimizationEngine.generatePatternKey(pattern.domCharacteristics);
  optimizationEngine.learnedPatterns.set(patternKey, pattern);
  optimizationEngine.optimizationHistory.push(pattern);
  
  console.log('✅ Pattern learned and stored');
  console.log(`   Pattern key: ${patternKey}`);
  console.log(`   Total patterns: ${optimizationEngine.learnedPatterns.size}`);
  
  // Test similarity matching
  const similarAnalysis = {
    bundleSize: 820,
    totalElements: 210,
    depth: 10
  };
  
  const similarPatterns = optimizationEngine.getSimilarPatterns(similarAnalysis);
  console.log(`   Similar patterns found: ${similarPatterns.length}`);
  if (similarPatterns.length > 0) {
    console.log(`   Similarity score: ${similarPatterns[0].similarity.toFixed(2)}`);
  }
} catch (error) {
  console.error('❌ Pattern learning failed:', error.message);
  process.exit(1);
}

// Test 5: Algorithm Comparison
console.log('\nTest 5: Algorithm Performance Comparison');
try {
  const benchmarkService = new BlockchainAlgorithmBenchmarkService();
  
  // Manually create some results for comparison
  const mockResults = {
    pow: {
      throughput: 15,
      avgBlockTime: 300,
      patternAccuracy: 0.85,
      energyEfficiency: 0.5,
      realTimeScore: 0.6
    },
    pos: {
      throughput: 50,
      avgBlockTime: 80,
      patternAccuracy: 0.88,
      energyEfficiency: 50,
      realTimeScore: 0.85
    },
    poo: {
      throughput: 55,
      avgBlockTime: 75,
      patternAccuracy: 0.92,
      energyEfficiency: 11,
      realTimeScore: 0.88
    },
    dpos: {
      throughput: 70,
      avgBlockTime: 55,
      patternAccuracy: 0.89,
      energyEfficiency: 87,
      realTimeScore: 0.92
    }
  };
  
  // Store results
  Object.entries(mockResults).forEach(([key, result]) => {
    benchmarkService.benchmarkResults.set(key, result);
  });
  
  const rankings = benchmarkService.calculateRankings(mockResults);
  const recommendation = benchmarkService.getRecommendation(rankings);
  
  console.log('✅ Algorithm comparison completed');
  console.log('\n   Rankings:');
  rankings.forEach((rank, i) => {
    console.log(`   ${i + 1}. ${rank.algorithm.toUpperCase()} - Score: ${rank.totalScore.toFixed(2)}`);
  });
  
  console.log(`\n   Recommendation: ${recommendation.algorithm.toUpperCase()}`);
  console.log(`   Score: ${recommendation.score.toFixed(2)}`);
} catch (error) {
  console.error('❌ Algorithm comparison failed:', error.message);
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('✅ All tests passed!');
console.log('='.repeat(60));
console.log('\nServices are ready to use:');
console.log('  - BlockchainAlgorithmBenchmarkService');
console.log('  - DeepSeekDOMOptimizationEngine');
console.log('  - RealTimeClientAPIService (WebSocket)');
console.log('\nStart the API server to test HTTP endpoints:');
console.log('  npm run start:dev');
console.log('\nRun the full demo:');
console.log('  node demo-blockchain-algorithm-optimization.js');
