/**
 * Simple test to validate Chrome Layers Service initialization
 */

import { ChromeLayersService } from './services/chrome-layers-service.js';

async function testService() {
  console.log('🧪 Testing Chrome Layers Service...\n');

  try {
    // Test 1: Service initialization
    console.log('Test 1: Service Initialization');
    const service = new ChromeLayersService({
      headless: true,
      cacheEnabled: false
    });

    await service.initialize();
    console.log('✅ Service initialized successfully');

    // Test 2: Basic URL analysis (using a simple page)
    console.log('\nTest 2: Basic Layer Analysis');
    const testUrl = 'data:text/html,<html><body><div style="position:relative;z-index:10">Test</div></body></html>';
    
    const analysis = await service.analyzeLayersForUrl(testUrl);
    console.log('✅ Layer analysis completed');
    console.log(`   - Total layers: ${analysis.metadata.totalLayers}`);
    console.log(`   - Compositing layers: ${analysis.metadata.compositingLayers}`);
    console.log(`   - Components found: ${analysis.componentMap.length}`);

    // Test 3: 3D Map generation
    console.log('\nTest 3: 3D Map Generation');
    console.log(`✅ 3D map generated with ${analysis.map3D.length} positions`);

    // Test 4: Training data extraction
    console.log('\nTest 4: Training Data Extraction');
    const trainingData = await service.extractTrainingData(testUrl, analysis);
    console.log('✅ Training data extracted');
    console.log(`   - Patterns found: ${Object.keys(trainingData.patterns).length}`);
    console.log(`   - Relationships: ${trainingData.relationships.length}`);

    // Cleanup
    await service.cleanup();
    console.log('\n✅ All tests passed!');
    
    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    return false;
  }
}

testService()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
