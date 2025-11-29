#!/usr/bin/env node

/**
 * Neural Network UI/UX Training - Quick Start
 * 
 * This script demonstrates how to use the neural network system
 * to train models on UI/UX quality patterns
 */

import { UIUXNeuralNetwork } from './src/ml/UIUXNeuralNetwork';
import PretrainedModelsManager from './src/ml/PretrainedModels';
import NeuralCrawlerConfigGenerator from './src/ml/NeuralCrawlerConfigGenerator';
import DeepSeekNeuralIntegration from './src/ml/DeepSeekNeuralIntegration';

async function quickStart() {
  console.log('🚀 Neural Network UI/UX Training System - Quick Start\n');

  // ============================================================================
  // Step 1: Initialize Neural Network
  // ============================================================================
  console.log('📦 Step 1: Initializing Neural Network...');
  const network = new UIUXNeuralNetwork();
  
  try {
    await network.loadModel('indexeddb://uiux-model');
    console.log('✅ Loaded existing model from IndexedDB\n');
  } catch (error) {
    console.log('ℹ️  No existing model found, creating new one...');
    await network.initializeModel();
    console.log('✅ New model initialized\n');
  }

  // ============================================================================
  // Step 2: Add Sample Training Data
  // ============================================================================
  console.log('📊 Step 2: Adding sample training data...');
  
  const sampleComponents = [
    {
      name: 'Accessible Button',
      features: {
        colors: ['#2196f3', '#ffffff'],
        spacing: [8, 16, 24],
        typography: {
          sizes: [14, 16],
          weights: [500, 600],
          lineHeights: [1.5],
        },
        layoutType: 'flex',
        hasHoverStates: true,
        hasFocusStates: true,
        hasActiveStates: true,
        hasAnimations: true,
        hasAriaLabels: true,
        hasSemanticHTML: true,
        keyboardAccessible: true,
        screenReaderOptimized: true,
        textLength: 50,
        imageCount: 0,
        iconCount: 1,
        componentType: 'button',
        complexity: 3,
        userInteractions: 50,
      },
      metrics: {
        accessibility: {
          contrastRatio: 7.5,
          ariaCompliance: 0.95,
          keyboardNavigation: 1.0,
          semanticHTML: 1.0,
          score: 0.96,
        },
        performance: {
          renderTime: 12,
          interactionTime: 45,
          layoutShifts: 0,
          resourceSize: 100,
          score: 0.92,
        },
        aesthetics: {
          colorHarmony: 0.90,
          spacing: 0.95,
          typography: 0.88,
          visualHierarchy: 0.92,
          score: 0.91,
        },
        usability: {
          clickTargetSize: 1.0,
          formValidation: 0.85,
          errorHandling: 0.90,
          consistency: 0.95,
          score: 0.93,
        },
        overallScore: 0.93,
      },
    },
    {
      name: 'Basic Input',
      features: {
        colors: ['#333333', '#ffffff', '#e0e0e0'],
        spacing: [12, 16],
        typography: {
          sizes: [14],
          weights: [400],
          lineHeights: [1.5],
        },
        layoutType: 'flex',
        hasHoverStates: true,
        hasFocusStates: true,
        hasActiveStates: false,
        hasAnimations: false,
        hasAriaLabels: false,
        hasSemanticHTML: true,
        keyboardAccessible: true,
        screenReaderOptimized: false,
        textLength: 30,
        imageCount: 0,
        iconCount: 0,
        componentType: 'input',
        complexity: 2,
        userInteractions: 100,
      },
      metrics: {
        accessibility: {
          contrastRatio: 4.5,
          ariaCompliance: 0.60,
          keyboardNavigation: 1.0,
          semanticHTML: 0.85,
          score: 0.74,
        },
        performance: {
          renderTime: 8,
          interactionTime: 30,
          layoutShifts: 0,
          resourceSize: 80,
          score: 0.95,
        },
        aesthetics: {
          colorHarmony: 0.75,
          spacing: 0.80,
          typography: 0.70,
          visualHierarchy: 0.75,
          score: 0.75,
        },
        usability: {
          clickTargetSize: 0.90,
          formValidation: 0.50,
          errorHandling: 0.60,
          consistency: 0.85,
          score: 0.71,
        },
        overallScore: 0.79,
      },
    },
  ];

  for (const component of sampleComponents) {
    network.addTrainingData({
      features: component.features as any,
      metrics: component.metrics,
      userRating: component.metrics.overallScore * 5,
      timestamp: Date.now(),
    });
    console.log(`  ✅ Added: ${component.name} (score: ${(component.metrics.overallScore * 100).toFixed(1)}%)`);
  }
  
  const status = network.getTrainingStatus();
  console.log(`\n📈 Training data count: ${status.dataCount}\n`);

  // ============================================================================
  // Step 3: Train the Model (if we have enough data)
  // ============================================================================
  if (status.dataCount >= 10) {
    console.log('🎯 Step 3: Training the model...');
    console.log('This may take a few minutes...\n');

    network.on('training:progress', ({ epoch, totalEpochs, loss, valLoss }) => {
      const progress = ((epoch / totalEpochs) * 100).toFixed(1);
      console.log(`  Epoch ${epoch}/${totalEpochs} (${progress}%) - Loss: ${loss?.toFixed(4)}, Val Loss: ${valLoss?.toFixed(4)}`);
    });

    await network.train();
    
    console.log('\n✅ Training completed!\n');

    // Save the model
    await network.saveModel('indexeddb://uiux-model');
    console.log('💾 Model saved to IndexedDB\n');
  } else {
    console.log(`⚠️  Need at least 10 samples to train (current: ${status.dataCount})`);
    console.log('Skipping training step\n');
  }

  // ============================================================================
  // Step 4: Make Predictions
  // ============================================================================
  console.log('🔮 Step 4: Making predictions on new component...');
  
  const newComponent = {
    colors: ['#4caf50', '#ffffff'],
    spacing: [16, 24],
    typography: {
      sizes: [16, 18],
      weights: [500],
      lineHeights: [1.6],
    },
    layoutType: 'flex',
    hasHoverStates: true,
    hasFocusStates: true,
    hasActiveStates: true,
    hasAnimations: true,
    hasAriaLabels: true,
    hasSemanticHTML: true,
    keyboardAccessible: true,
    screenReaderOptimized: true,
    textLength: 60,
    imageCount: 0,
    iconCount: 1,
    componentType: 'button',
    complexity: 3,
    userInteractions: 80,
  };

  try {
    const prediction = await network.predict(newComponent);
    
    console.log('\n📊 Predicted Quality Metrics:');
    console.log(`  Accessibility: ${(prediction.accessibility.score * 100).toFixed(1)}%`);
    console.log(`  Performance:   ${(prediction.performance.score * 100).toFixed(1)}%`);
    console.log(`  Aesthetics:    ${(prediction.aesthetics.score * 100).toFixed(1)}%`);
    console.log(`  Usability:     ${(prediction.usability.score * 100).toFixed(1)}%`);
    console.log(`  Overall:       ${(prediction.overallScore * 100).toFixed(1)}%\n`);
  } catch (error) {
    console.log('⚠️  Prediction requires trained model\n');
  }

  // ============================================================================
  // Step 5: Initialize Pre-trained Models
  // ============================================================================
  console.log('🤖 Step 5: Initializing pre-trained models...');
  const pretrainedModels = new PretrainedModelsManager();
  
  console.log('\n📚 Available pre-trained models:');
  const models = pretrainedModels.getAvailableModels();
  models.forEach(model => {
    console.log(`  • ${model.name} (${model.type})`);
    console.log(`    ${model.description}`);
  });
  console.log();

  // ============================================================================
  // Step 6: Generate Crawler Configuration
  // ============================================================================
  console.log('🕷️  Step 6: Generating intelligent crawler configuration...');
  const crawlerGenerator = new NeuralCrawlerConfigGenerator();
  await crawlerGenerator.initialize();

  const crawlerConfig = await crawlerGenerator.generateConfig({
    url: 'https://material.io/components',
    objective: 'learn',
    targetQuality: 'balanced',
  });

  console.log('\n⚙️  Generated Crawler Configuration:');
  console.log(`  URL: ${crawlerConfig.config.targetUrl}`);
  console.log(`  Priority: ${crawlerConfig.config.miningStrategy.priority}`);
  console.log(`  Confidence: ${(crawlerConfig.confidence * 100).toFixed(1)}%`);
  console.log(`  Primary Selectors: ${crawlerConfig.config.selectors.primary.length}`);
  console.log(`  Mining Targets: ${crawlerConfig.targets.length}`);
  
  if (crawlerConfig.targets.length > 0) {
    console.log('\n🎯 Top Mining Targets:');
    crawlerConfig.targets.slice(0, 3).forEach((target, i) => {
      console.log(`  ${i + 1}. ${target.selector} (${target.type})`);
      console.log(`     Priority: ${(target.priority * 100).toFixed(1)}%`);
      console.log(`     ${target.reasoning}`);
    });
  }
  console.log();

  // ============================================================================
  // Step 7: DeepSeek Integration (Demo)
  // ============================================================================
  console.log('🧠 Step 7: DeepSeek AI Integration (Demo Mode)...');
  const deepseekIntegration = new DeepSeekNeuralIntegration({
    provider: 'deepseek',
    model: 'deepseek-chat',
  });

  await deepseekIntegration.initialize();

  const componentAnalysis = await deepseekIntegration.analyzeComponent({
    code: `
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleClick}
        aria-label="Submit form"
      >
        Submit
      </button>
    `,
    type: 'button',
    metadata: { framework: 'react', styleSystem: 'tailwind' },
  });

  console.log('\n🔍 AI-Powered Component Analysis:');
  console.log(`  Component Type: ${componentAnalysis.component.type}`);
  console.log(`  Confidence: ${(componentAnalysis.confidence * 100).toFixed(1)}%`);
  console.log(`  Overall Score: ${(componentAnalysis.predictedMetrics.overallScore * 100).toFixed(1)}%`);
  
  console.log('\n  💪 Strengths:');
  componentAnalysis.aiInsights.strengths.slice(0, 3).forEach(s => {
    console.log(`    • ${s}`);
  });

  console.log('\n  ⚠️  Weaknesses:');
  componentAnalysis.aiInsights.weaknesses.slice(0, 3).forEach(w => {
    console.log(`    • ${w}`);
  });

  console.log('\n  💡 Suggestions:');
  componentAnalysis.aiInsights.suggestions.slice(0, 3).forEach(s => {
    console.log(`    • ${s}`);
  });

  // ============================================================================
  // Summary
  // ============================================================================
  console.log('\n' + '='.repeat(70));
  console.log('✨ Quick Start Complete!');
  console.log('='.repeat(70));
  console.log('\n📖 Next Steps:');
  console.log('  1. Add more training data from your Storybook components');
  console.log('  2. Train the model with: npm run neural:train');
  console.log('  3. Use the training dashboard: npm run neural:dashboard');
  console.log('  4. Generate crawler configs: npm run neural:crawler');
  console.log('  5. Integrate with DeepSeek for AI insights');
  console.log('\n📚 Documentation: NEURAL_NETWORK_UI_UX_GUIDE.md');
  console.log('🎯 Examples: src/examples/neural-network-examples.ts\n');
}

// Run quick start
quickStart().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
