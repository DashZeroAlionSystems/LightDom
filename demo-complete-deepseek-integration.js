/**
 * Complete DeepSeek Integration Demo
 * 
 * This demo showcases the complete integration between:
 * 1. DeepSeek Finetuning Pipeline (4 phases)
 * 2. Workflow Orchestration System (Campaigns → Workflows → Services → Data Streams → Attributes)
 * 
 * Run: node demo-complete-deepseek-integration.js
 */

import { DeepSeekFinetuningPipeline } from './services/deepseek-finetuning-pipeline.js';
import { WorkflowOrchestrationService } from './services/workflow-orchestration-service.js';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n' + '═'.repeat(70));
  log(`  ${title}`, colors.bright + colors.cyan);
  console.log('═'.repeat(70) + '\n');
}

function subHeader(title) {
  console.log('\n' + '─'.repeat(50));
  log(`  ${title}`, colors.bright + colors.yellow);
  console.log('─'.repeat(50));
}

async function demoFinetuningPipeline() {
  header('🧠 DEEPSEEK FINETUNING PIPELINE DEMO');
  
  const pipeline = new DeepSeekFinetuningPipeline({
    outputDir: './demo_output/finetuning',
  });

  // Phase 1: Data Infrastructure
  subHeader('Phase 1: Data Infrastructure');
  
  log('Generating tool-use training examples...', colors.blue);
  // Use the sync methods to generate examples
  const miningExamples = pipeline.toolGenerator.generateMiningExamples();
  const schemaExamples = pipeline.toolGenerator.generateSchemaExamples();
  const workflowExamples = pipeline.toolGenerator.generateWorkflowExamples();
  const errorExamples = pipeline.toolGenerator.generateErrorHandlingExamples();
  const toolExamples = [...miningExamples, ...schemaExamples, ...workflowExamples, ...errorExamples];
  log(`✓ Generated ${toolExamples.length} training examples`, colors.green);

  log('\nScoring data quality...', colors.blue);
  const scores = toolExamples.map(ex => pipeline.qualityScorer.scoreExample(ex));
  const avgScore = scores.reduce((a, b) => a + b.score, 0) / scores.length;
  log(`✓ Average quality score: ${avgScore.toFixed(3)}`, colors.green);

  log('\nBuilding validation dataset...', colors.blue);
  const dataset = pipeline.validationBuilder.createValidationDataset(toolExamples);
  log(`✓ Train: ${dataset.train.length} examples, Validation: ${dataset.validation.length} examples`, colors.green);

  // Phase 2: Local Training Setup
  subHeader('Phase 2: Local Training Setup');
  
  log('Creating QLoRA configuration...', colors.blue);
  const qloraConfig = pipeline.trainingConfig.config;
  log(`✓ Base model: ${qloraConfig.baseModel}`, colors.green);
  log(`✓ LoRA rank: ${qloraConfig.loraRank}`, colors.green);
  log(`✓ Quantization: 4-bit`, colors.green);

  log('\nGenerating training script...', colors.blue);
  const script = pipeline.trainingConfig.generateTrainingScript();
  log(`✓ Script generated (${script.length} characters)`, colors.green);

  // Phase 3: Integration
  subHeader('Phase 3: Integration');
  
  log('Registering model version...', colors.blue);
  const modelVersion = await pipeline.versionControl.registerVersion(
    'lightdom-deepseek-v1.0.0',
    './models/lightdom-deepseek',
    { trainedOn: 'tool-use', accuracy: 0.95, toolAccuracy: 0.92 }
  );
  log(`✓ Registered: ${modelVersion.id}`, colors.green);

  log('\nCreating A/B test...', colors.blue);
  const testId = 'ab_test_001';
  const abTest = await pipeline.modelIntegration.createABTest(testId, {
    modelA: 'base-deepseek',
    modelB: modelVersion.id,
    trafficSplit: 0.5,
  });
  log(`✓ A/B Test created: ${abTest.id}`, colors.green);

  // Simulate some requests
  for (let i = 0; i < 50; i++) {
    const model = Math.random() < 0.5 ? abTest.modelA : abTest.modelB;
    pipeline.modelIntegration.recordResult(abTest.id, model, Math.random() > 0.2, Math.random() * 100);
  }
  
  const results = pipeline.modelIntegration.getABTestResults(abTest.id);
  log(`✓ A/B Test results:`, colors.green);
  log(`  - Model A: ${results.modelA.metrics.requests} requests, ${(results.modelA.metrics.successRate * 100).toFixed(1)}% success`, colors.cyan);
  log(`  - Model B: ${results.modelB.metrics.requests} requests, ${(results.modelB.metrics.successRate * 100).toFixed(1)}% success`, colors.cyan);

  // Phase 4: Production
  subHeader('Phase 4: Production');
  
  log('Deploying model...', colors.blue);
  const deployment = await pipeline.deploymentManager.deploy(modelVersion.id, {
    instances: 2,
    maxConcurrent: 100,
    healthCheckInterval: 30000,
  });
  log(`✓ Deployment: ${deployment.id}`, colors.green);
  log(`✓ Status: ${deployment.status}`, colors.green);
  log(`✓ Instances: ${deployment.config.instances}`, colors.green);

  log('\nStarting health checks...', colors.blue);
  pipeline.deploymentManager.startHealthCheck(deployment.id, 1000);
  // Wait a moment for initial health check
  await new Promise(resolve => setTimeout(resolve, 100));
  const deploymentStatus = pipeline.deploymentManager.getDeploymentStatus(deployment.id);
  log(`✓ Health: ${deploymentStatus.health || 'checking...'}`, colors.green);
  pipeline.deploymentManager.stopHealthCheck(deployment.id);

  log('\nConfiguring continuous training...', colors.blue);
  await pipeline.continuousTraining.addExample(toolExamples[0]);
  const ctStatus = pipeline.continuousTraining.getStatus();
  log(`✓ Pending examples: ${ctStatus.pendingExamples}`, colors.green);
  log(`✓ Ready for training: ${ctStatus.readyForTraining}`, colors.green);

  return {
    toolExamplesCount: toolExamples.length,
    avgQualityScore: avgScore,
    modelVersion: modelVersion.id,
    deploymentId: deployment.id,
  };
}

async function demoWorkflowOrchestration() {
  header('🔄 WORKFLOW ORCHESTRATION SYSTEM DEMO');
  
  const orchestration = new WorkflowOrchestrationService();

  // Create a complete workflow bundle
  subHeader('Creating SEO Mining Workflow Bundle');
  
  log('Creating workflow bundle with DeepSeek attribute generation...', colors.blue);
  const bundle = await orchestration.createWorkflowBundle({
    name: 'SEO Mining Pipeline',
    topics: ['h1', 'meta', 'title', 'links', 'images'],
    category: 'seo',
    workflowTriggers: [
      { type: 'schedule', enabled: true },
      { type: 'webhook', enabled: true },
      { type: 'cron', enabled: true, cron: '0 */6 * * *' },
    ],
    campaignStatus: 'active',
  });

  log(`\n✓ Campaign created: ${bundle.campaign.name}`, colors.green);
  log(`  ID: ${bundle.campaign.id}`, colors.cyan);
  log(`  Status: ${bundle.campaign.status}`, colors.cyan);

  log(`\n✓ Workflow created: ${bundle.workflow.name}`, colors.green);
  log(`  ID: ${bundle.workflow.id}`, colors.cyan);
  log(`  Triggers: ${bundle.workflow.triggers.map(t => t.type).join(', ')}`, colors.cyan);

  log(`\n✓ Service created: ${bundle.service.name}`, colors.green);
  log(`  ID: ${bundle.service.id}`, colors.cyan);
  log(`  Type: ${bundle.service.type}`, colors.cyan);

  log(`\n✓ Data Stream created: ${bundle.dataStream.name}`, colors.green);
  log(`  ID: ${bundle.dataStream.id}`, colors.cyan);
  log(`  Source → Destination: ${bundle.dataStream.sourceType} → ${bundle.dataStream.destinationType}`, colors.cyan);

  log(`\n✓ Attributes generated: ${bundle.attributes.length}`, colors.green);
  bundle.attributes.forEach(attr => {
    const deepseekBadge = attr.generatedByDeepSeek ? ' 🤖' : '';
    log(`  - ${attr.name} (${attr.type})${deepseekBadge}`, colors.cyan);
  });

  // Create additional workflows
  subHeader('Creating Additional Workflows');
  
  log('Creating content analysis workflow...', colors.blue);
  const contentBundle = await orchestration.createWorkflowBundle({
    name: 'Content Analysis',
    topics: ['headings', 'paragraphs', 'word_count'],
    category: 'content',
  });
  log(`✓ Content workflow created with ${contentBundle.attributes.length} attributes`, colors.green);

  log('\nCreating performance monitoring workflow...', colors.blue);
  const perfBundle = await orchestration.createWorkflowBundle({
    name: 'Performance Monitor',
    topics: ['load_time', 'ttfb', 'fcp', 'lcp'],
    category: 'performance',
  });
  log(`✓ Performance workflow created with ${perfBundle.attributes.length} attributes`, colors.green);

  // Get DeepSeek attribute suggestions
  subHeader('DeepSeek Attribute Suggestions');
  
  log('Getting attribute suggestions for "schema"...', colors.blue);
  const schemaSuggestions = await orchestration.suggestAttributesWithDeepSeek('schema');
  log(`✓ Suggestions received:`, colors.green);
  schemaSuggestions.slice(0, 5).forEach(suggestion => {
    log(`  - ${suggestion.name}: ${suggestion.label} (${suggestion.type})`, colors.cyan);
  });

  // Get statistics
  subHeader('System Statistics');
  
  const stats = await orchestration.getStatistics();
  log('Current entity counts:', colors.blue);
  log(`  📁 Campaigns: ${stats.campaigns}`, colors.magenta);
  log(`  🔄 Workflows: ${stats.workflows}`, colors.magenta);
  log(`  🔌 Services: ${stats.services}`, colors.magenta);
  log(`  📊 Data Streams: ${stats.dataStreams}`, colors.magenta);
  log(`  📝 Attributes: ${stats.attributes}`, colors.magenta);

  // Demonstrate hierarchy navigation
  subHeader('Hierarchy Navigation');
  
  log('Fetching complete campaign hierarchy...', colors.blue);
  const campaignWithChildren = await orchestration.getCampaign(bundle.campaign.id, {
    includeWorkflows: true,
    includeServices: true,
    includeDataStreams: true,
    includeAttributes: true,
  });
  
  log(`\nCampaign: ${campaignWithChildren.name}`, colors.green);
  if (campaignWithChildren.workflows) {
    campaignWithChildren.workflows.forEach(wf => {
      log(`  └─ Workflow: ${wf.name}`, colors.cyan);
      if (wf.services) {
        wf.services.forEach(svc => {
          log(`      └─ Service: ${svc.name}`, colors.yellow);
          if (svc.dataStreams) {
            svc.dataStreams.forEach(ds => {
              log(`          └─ Data Stream: ${ds.name}`, colors.magenta);
              if (ds.attributes) {
                ds.attributes.forEach(attr => {
                  log(`              └─ Attribute: ${attr.name}`, colors.blue);
                });
              }
            });
          }
        });
      }
    });
  }

  return {
    bundlesCreated: 3,
    totalAttributes: stats.attributes,
    campaignId: bundle.campaign.id,
    workflowId: bundle.workflow.id,
  };
}

async function demoIntegration() {
  header('🔗 FINETUNING + ORCHESTRATION INTEGRATION DEMO');
  
  log('This demo shows how finetuning and orchestration work together...', colors.blue);
  
  // Initialize both services
  const pipeline = new DeepSeekFinetuningPipeline();
  const orchestration = new WorkflowOrchestrationService();

  subHeader('Generate Training Data from Workflow Interactions');
  
  // Create workflows
  log('Creating sample workflows...', colors.blue);
  const seoBundle = await orchestration.createWorkflowBundle({
    name: 'Training Data Source',
    topics: ['h1', 'meta'],
    category: 'seo',
  });

  // Generate training examples based on workflow operations
  log('\nGenerating training examples from workflow operations...', colors.blue);
  
  const workflowTrainingExamples = [
    {
      messages: [
        { role: 'system', content: 'You are a LightDom workflow assistant specialized in SEO mining.' },
        { role: 'user', content: `Create a workflow for SEO mining with topics: ${seoBundle.attributes.map(a => a.name).join(', ')}` },
        { 
          role: 'assistant', 
          content: null,
          tool_calls: [{
            id: 'call_wf_create',
            type: 'function',
            function: {
              name: 'createWorkflowBundle',
              arguments: JSON.stringify({
                name: 'SEO Mining Pipeline',
                topics: seoBundle.attributes.map(a => a.name),
                category: 'seo',
              }),
            },
          }],
        },
        {
          role: 'tool',
          tool_call_id: 'call_wf_create',
          name: 'createWorkflowBundle',
          content: JSON.stringify({ bundleId: seoBundle.dataStream.id }),
        },
        { role: 'assistant', content: `I've created an SEO mining workflow with ${seoBundle.attributes.length} attributes.` },
      ],
      metadata: {
        source: 'workflow_orchestration',
        operation: 'createWorkflowBundle',
        category: 'seo',
      },
    },
  ];

  log(`✓ Generated ${workflowTrainingExamples.length} training examples from workflow operations`, colors.green);

  // Score the quality
  log('\nScoring training data quality...', colors.blue);
  const score = pipeline.qualityScorer.scoreExample(workflowTrainingExamples[0]);
  log(`✓ Quality score: ${score.score.toFixed(3)}`, colors.green);

  // Add to continuous training pipeline
  log('\nAdding to continuous training pipeline...', colors.blue);
  pipeline.continuousTraining.addExample(workflowTrainingExamples[0]);
  log('✓ Example added to pending queue', colors.green);

  subHeader('Summary');
  
  log('\nThe integration demonstrates:', colors.cyan);
  log('1. Workflow operations generate high-quality training data', colors.reset);
  log('2. Training data is automatically scored and validated', colors.reset);
  log('3. Examples feed into the continuous training pipeline', colors.reset);
  log('4. The finetuned model improves workflow operations over time', colors.reset);
}

async function main() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                      ║');
  console.log('║       🚀 LIGHTDOM DEEPSEEK COMPLETE INTEGRATION DEMO 🚀              ║');
  console.log('║                                                                      ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝');

  try {
    // Run finetuning demo
    const finetuningResults = await demoFinetuningPipeline();
    
    // Run orchestration demo  
    const orchestrationResults = await demoWorkflowOrchestration();
    
    // Run integration demo
    await demoIntegration();

    // Final summary
    header('📊 DEMO COMPLETE - SUMMARY');
    
    log('Finetuning Pipeline:', colors.bright);
    log(`  • Training examples generated: ${finetuningResults.toolExamplesCount}`, colors.green);
    log(`  • Average quality score: ${finetuningResults.avgQualityScore.toFixed(3)}`, colors.green);
    log(`  • Model version: ${finetuningResults.modelVersion}`, colors.green);
    log(`  • Deployment ID: ${finetuningResults.deploymentId}`, colors.green);

    log('\nWorkflow Orchestration:', colors.bright);
    log(`  • Workflow bundles created: ${orchestrationResults.bundlesCreated}`, colors.green);
    log(`  • Total attributes: ${orchestrationResults.totalAttributes}`, colors.green);
    log(`  • Campaign ID: ${orchestrationResults.campaignId}`, colors.green);
    log(`  • Workflow ID: ${orchestrationResults.workflowId}`, colors.green);

    log('\n✅ All demos completed successfully!', colors.bright + colors.green);
    
    log('\n📌 Next Steps:', colors.yellow);
    log('  1. Start the API server: npm run start:api', colors.reset);
    log('  2. Access Finetuning Dashboard: /admin/deepseek-finetuning', colors.reset);
    log('  3. Access Workflow Dashboard: /admin/workflow-orchestration', colors.reset);
    log('  4. Run Storybook: npm run storybook', colors.reset);

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

main();
