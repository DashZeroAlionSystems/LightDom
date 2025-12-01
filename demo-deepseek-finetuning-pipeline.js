/**
 * DeepSeek Finetuning Pipeline Demo
 * 
 * Demonstrates the 4-phase finetuning implementation:
 * - Phase 1: Data Infrastructure
 * - Phase 2: Local Training Setup
 * - Phase 3: Integration
 * - Phase 4: Production Deployment
 * 
 * Run with: node demo-deepseek-finetuning-pipeline.js
 */

import {
  DeepSeekFinetuningPipeline,
  TrainingDataCollectionPipeline,
  DataQualityScorer,
  ToolUseTrainingGenerator,
  ValidationDatasetBuilder,
  QLoRATrainingConfig,
  EvaluationMetrics,
  ModelIntegrationService,
  ModelVersionControl,
  ProductionDeploymentManager,
  ContinuousTrainingPipeline
} from './services/deepseek-finetuning-pipeline.js';

async function runDemo() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   DEEPSEEK FINETUNING PIPELINE DEMO');
  console.log('   4-Phase Implementation for LightDom');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // ============================================
  // PHASE 1: DATA INFRASTRUCTURE
  // ============================================
  console.log('\n📊 ═══════════════════════════════════════════════');
  console.log('   PHASE 1: DATA INFRASTRUCTURE');
  console.log('═══════════════════════════════════════════════════\n');

  // 1.1 Training Data Collection Pipeline
  console.log('📚 1.1 Training Data Collection Pipeline');
  console.log('─────────────────────────────────────────');
  
  const dataCollector = new TrainingDataCollectionPipeline({
    outputDir: './demo_output/training_data'
  });

  // Simulate collecting from various sources
  const sampleSources = [
    {
      type: 'tool_interactions',
      name: 'LightDom Tool Logs',
      data: [
        {
          systemPrompt: 'You are a LightDom assistant.',
          userRequest: 'Extract prices from shop.example.com',
          toolCalls: [
            { name: 'mineAttribute', arguments: { url: 'https://shop.example.com', attribute: { name: 'price' } } }
          ],
          toolResponses: [{ success: true, data: [{ value: '$99.99' }] }],
          finalResponse: 'Found price: $99.99'
        }
      ]
    },
    {
      type: 'conversations',
      name: 'Chat Logs',
      data: [
        {
          id: 'conv_001',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'How do I set up a mining campaign?' },
            { role: 'assistant', content: 'To set up a mining campaign, use the createMiningCampaign tool with your target sites and attributes.' }
          ]
        }
      ]
    }
  ];

  const collectedData = await dataCollector.collectFromSources(sampleSources);
  console.log(`✅ Collected ${collectedData.length} training examples\n`);

  // 1.2 Data Quality Scoring
  console.log('📈 1.2 Data Quality Scoring');
  console.log('─────────────────────────────────────────');
  
  const qualityScorer = new DataQualityScorer();
  
  // Sample examples for scoring
  const sampleExamples = [
    {
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Extract product data from example.com' },
        {
          role: 'assistant',
          content: null,
          tool_calls: [{
            id: 'call_1',
            type: 'function',
            function: { name: 'mineAttribute', arguments: '{"url":"https://example.com"}' }
          }]
        },
        { role: 'tool', tool_call_id: 'call_1', name: 'mineAttribute', content: '{"success":true}' },
        { role: 'assistant', content: 'Successfully extracted the data from example.com.' }
      ]
    },
    {
      messages: [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello!' }
      ]
    }
  ];

  const qualityReport = qualityScorer.scoreDataset(sampleExamples);
  console.log('Quality Report:');
  console.log(`  Total Examples: ${qualityReport.totalExamples}`);
  console.log(`  Passed: ${qualityReport.passedExamples}`);
  console.log(`  Average Score: ${qualityReport.averageScore.toFixed(3)}`);
  console.log(`  Distribution: High=${qualityReport.distribution.high}, Medium=${qualityReport.distribution.medium}, Low=${qualityReport.distribution.low}\n`);

  // 1.3 Tool-Use Training Generator
  console.log('🔧 1.3 Tool-Use Training Generator');
  console.log('─────────────────────────────────────────');
  
  const toolGenerator = new ToolUseTrainingGenerator([
    { name: 'mineAttribute', description: 'Extract data from web pages' },
    { name: 'generateSchema', description: 'Generate JSON schemas' },
    { name: 'createWorkflow', description: 'Create automation workflows' }
  ]);

  const miningExamples = toolGenerator.generateMiningExamples();
  const schemaExamples = toolGenerator.generateSchemaExamples();
  const workflowExamples = toolGenerator.generateWorkflowExamples();
  const errorExamples = toolGenerator.generateErrorHandlingExamples();

  console.log('Generated Tool-Use Examples:');
  console.log(`  Mining: ${miningExamples.length}`);
  console.log(`  Schema: ${schemaExamples.length}`);
  console.log(`  Workflow: ${workflowExamples.length}`);
  console.log(`  Error Handling: ${errorExamples.length}\n`);

  // 1.4 Validation Dataset Builder
  console.log('📋 1.4 Validation Dataset Builder');
  console.log('─────────────────────────────────────────');
  
  const validationBuilder = new ValidationDatasetBuilder({ splitRatio: 0.15 });
  const allExamples = [...miningExamples, ...schemaExamples, ...workflowExamples, ...errorExamples];
  const datasets = validationBuilder.createValidationDataset(allExamples);

  console.log('Dataset Split:');
  console.log(`  Training: ${datasets.stats.trainSize} examples`);
  console.log(`  Validation: ${datasets.stats.validationSize} examples\n`);

  // ============================================
  // PHASE 2: LOCAL TRAINING SETUP
  // ============================================
  console.log('\n🔧 ═══════════════════════════════════════════════');
  console.log('   PHASE 2: LOCAL TRAINING SETUP');
  console.log('═══════════════════════════════════════════════════\n');

  // 2.1 QLoRA Training Configuration
  console.log('⚙️  2.1 QLoRA Training Configuration');
  console.log('─────────────────────────────────────────');
  
  const trainingConfig = new QLoRATrainingConfig({
    baseModel: 'deepseek-ai/deepseek-coder-7b-instruct-v1.5',
    loraRank: 16,
    loraAlpha: 32,
    epochs: 3,
    batchSize: 4,
    learningRate: 2e-4
  });

  console.log('Training Configuration:');
  console.log(`  Base Model: ${trainingConfig.config.baseModel}`);
  console.log(`  LoRA Rank: ${trainingConfig.config.loraRank}`);
  console.log(`  LoRA Alpha: ${trainingConfig.config.loraAlpha}`);
  console.log(`  Epochs: ${trainingConfig.config.epochs}`);
  console.log(`  Batch Size: ${trainingConfig.config.batchSize}`);
  console.log(`  Learning Rate: ${trainingConfig.config.learningRate}`);
  console.log(`  Max Sequence Length: ${trainingConfig.config.maxSeqLength}\n`);

  // 2.2 Show training script preview
  console.log('📝 2.2 Training Script Preview (first 30 lines)');
  console.log('─────────────────────────────────────────');
  
  const script = trainingConfig.generateTrainingScript();
  const scriptPreview = script.split('\n').slice(0, 30).join('\n');
  console.log(scriptPreview);
  console.log('...\n');

  // 2.3 Evaluation Metrics
  console.log('📊 2.3 Evaluation Metrics System');
  console.log('─────────────────────────────────────────');
  
  const evaluator = new EvaluationMetrics();
  
  const mockResults = [
    { perplexity: 2.5, toolAccuracy: 0.95, quality: 0.88, latency: 120 },
    { perplexity: 2.8, toolAccuracy: 0.92, quality: 0.85, latency: 145 },
    { perplexity: 2.3, toolAccuracy: 0.97, quality: 0.91, latency: 110 }
  ];

  const report = evaluator.generateReport(mockResults);
  console.log('Evaluation Report:');
  console.log(`  Total Evaluations: ${report.summary.totalEvaluations}`);
  console.log(`  Average Perplexity: ${report.summary.averagePerplexity.toFixed(2)}`);
  console.log(`  Tool Accuracy: ${(report.summary.toolAccuracy * 100).toFixed(1)}%`);
  console.log(`  Average Quality: ${(report.summary.averageQuality * 100).toFixed(1)}%`);
  console.log(`  Average Latency: ${report.summary.averageLatency.toFixed(0)}ms\n`);

  // ============================================
  // PHASE 3: INTEGRATION
  // ============================================
  console.log('\n🔗 ═══════════════════════════════════════════════');
  console.log('   PHASE 3: INTEGRATION');
  console.log('═══════════════════════════════════════════════════\n');

  // 3.1 Model Version Control
  console.log('📦 3.1 Model Version Control');
  console.log('─────────────────────────────────────────');
  
  const versionControl = new ModelVersionControl({
    storageDir: './demo_output/models'
  });

  await versionControl.registerVersion('lightdom-deepseek', 'v1.0.0', {
    trainedOn: '2024-11-29',
    trainingExamples: 5000,
    baseModel: 'deepseek-coder-7b'
  });

  await versionControl.registerVersion('lightdom-deepseek', 'v1.1.0', {
    trainedOn: '2024-11-30',
    trainingExamples: 7500,
    baseModel: 'deepseek-coder-7b'
  });

  const versions = versionControl.listVersions('lightdom-deepseek');
  console.log('Registered Versions:');
  versions.forEach(v => {
    console.log(`  ${v.id} - Status: ${v.status}`);
  });
  console.log();

  // 3.2 Model Integration Service
  console.log('🔌 3.2 Model Integration Service');
  console.log('─────────────────────────────────────────');
  
  const integrationService = new ModelIntegrationService();

  integrationService.registerModel('lightdom-deepseek@v1.0.0', { type: 'baseline' });
  integrationService.registerModel('lightdom-deepseek@v1.1.0', { type: 'new' });

  console.log(`Registered Models: ${integrationService.models.size}`);

  // 3.3 A/B Testing
  console.log('\n🧪 3.3 A/B Testing Framework');
  console.log('─────────────────────────────────────────');
  
  const abTest = integrationService.createABTest('test_v1_vs_v1.1', {
    modelA: 'lightdom-deepseek@v1.0.0',
    modelB: 'lightdom-deepseek@v1.1.0',
    trafficSplit: 0.5
  });

  // Simulate some requests
  for (let i = 0; i < 200; i++) {
    const selectedModel = integrationService.routeRequest('test_v1_vs_v1.1');
    const success = Math.random() > (selectedModel.includes('v1.1') ? 0.08 : 0.12);
    const latency = Math.random() * 100 + (selectedModel.includes('v1.1') ? 80 : 100);
    integrationService.recordResult('test_v1_vs_v1.1', selectedModel, success, latency);
  }

  const testResults = integrationService.getABTestResults('test_v1_vs_v1.1');
  console.log('A/B Test Results:');
  console.log(`  Model A (v1.0): ${testResults.modelA.metrics.requests} requests, ${(testResults.modelA.metrics.successRate * 100).toFixed(1)}% success`);
  console.log(`  Model B (v1.1): ${testResults.modelB.metrics.requests} requests, ${(testResults.modelB.metrics.successRate * 100).toFixed(1)}% success`);
  console.log(`  Winner: ${testResults.winner}\n`);

  // ============================================
  // PHASE 4: PRODUCTION DEPLOYMENT
  // ============================================
  console.log('\n🚀 ═══════════════════════════════════════════════');
  console.log('   PHASE 4: PRODUCTION DEPLOYMENT');
  console.log('═══════════════════════════════════════════════════\n');

  // 4.1 Production Deployment Manager
  console.log('🌐 4.1 Production Deployment');
  console.log('─────────────────────────────────────────');
  
  const deploymentManager = new ProductionDeploymentManager();

  const deployment = await deploymentManager.deploy('lightdom-deepseek@v1.1.0', {
    replicas: 3,
    maxConcurrency: 100,
    timeout: 30000
  });

  console.log('Deployment Status:');
  console.log(`  ID: ${deployment.id}`);
  console.log(`  Model: ${deployment.modelId}`);
  console.log(`  Status: ${deployment.status}`);
  console.log(`  Health: ${deployment.health}\n`);

  // 4.2 Continuous Training Pipeline
  console.log('♻️  4.2 Continuous Training Pipeline');
  console.log('─────────────────────────────────────────');
  
  const continuousTraining = new ContinuousTrainingPipeline({
    triggerThreshold: 100
  });

  // Add some examples
  for (let i = 0; i < 50; i++) {
    continuousTraining.addExample({
      messages: [
        { role: 'user', content: `Example query ${i}` },
        { role: 'assistant', content: `Example response ${i}` }
      ]
    });
  }

  const ctStatus = continuousTraining.getStatus();
  console.log('Continuous Training Status:');
  console.log(`  Pending Examples: ${ctStatus.pendingExamples}`);
  console.log(`  Training Threshold: ${ctStatus.trainingThreshold}`);
  console.log(`  Ready for Training: ${ctStatus.readyForTraining}`);
  console.log(`  Training Jobs: ${ctStatus.trainingHistory.length}\n`);

  // ============================================
  // COMPLETE PIPELINE EXECUTION
  // ============================================
  console.log('\n🎯 ═══════════════════════════════════════════════');
  console.log('   COMPLETE PIPELINE DEMONSTRATION');
  console.log('═══════════════════════════════════════════════════\n');

  const pipeline = new DeepSeekFinetuningPipeline({
    outputDir: './demo_output/pipeline'
  });

  console.log('Running complete pipeline with sample configuration...\n');

  // Run phases individually for demo
  const phase1Result = await pipeline.runPhase1([]);
  console.log(`Phase 1 Quality Score: ${phase1Result.qualityReport.averageScore.toFixed(3)}`);

  const phase2Result = await pipeline.runPhase2();
  console.log(`Phase 2 Training Dir: ${phase2Result.trainingDir}`);

  // Cleanup
  deploymentManager.stopHealthCheck(deployment.id);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('   DEMO COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log('Summary:');
  console.log('  ✅ Phase 1: Data Infrastructure - Training data collection, quality scoring, tool-use generation');
  console.log('  ✅ Phase 2: Local Training Setup - QLoRA configuration, training scripts, evaluation metrics');
  console.log('  ✅ Phase 3: Integration - Model versioning, A/B testing framework');
  console.log('  ✅ Phase 4: Production - Deployment management, continuous training');
  console.log('\nThe finetuning pipeline is ready for use!');
  console.log('\nTo use in production:');
  console.log('  1. Collect your training data using the data collection pipeline');
  console.log('  2. Generate training scripts with your configuration');
  console.log('  3. Run training externally with: python train.py');
  console.log('  4. Register and deploy your finetuned model');
  console.log('  5. Enable continuous training for ongoing improvements');
}

// Run demo
runDemo().catch(console.error);
