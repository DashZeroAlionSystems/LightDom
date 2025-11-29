#!/usr/bin/env node

/**
 * Storybook Training CLI
 * 
 * Command-line interface for storybook mining with pretrained model training.
 * Provides access to 11 pretrained models for training on mined storybook data.
 * 
 * Usage:
 *   node scripts/storybook-training-cli.js [command] [options]
 * 
 * Commands:
 *   models      - List available pretrained models (11 models)
 *   mine        - Mine storybooks and collect training data
 *   train       - Start a training session with a model
 *   status      - Check training session status
 *   stats       - Show training statistics
 *   help        - Show help information
 */

import { StorybookModelTrainingService } from '../services/storybook-model-training-service.js';

// Constants for table formatting and display limits
const TABLE_WIDTH = 80;
const COL_MODEL_ID = 35;
const COL_TASK = 20;
const COL_STATUS = 10;
const COL_SESSION_ID = 37;
const MAX_DISPLAYED_MODELS = 5;
const MAX_USE_CASES = 2;

const commands = {
  models: async (service, args) => {
    console.log('\n📚 Available Pretrained Models for Storybook Training\n');
    console.log('='.repeat(TABLE_WIDTH));
    
    const models = service.getAvailableModels();
    const recommended = models.filter(m => m.storybookApplicable);
    
    console.log(`\n📊 Total Models: ${models.length}`);
    console.log(`⭐ Recommended for Storybook: ${recommended.length}\n`);
    
    console.log('Model ID                              | Task                   | Performance | Accuracy');
    console.log('-'.repeat(TABLE_WIDTH));
    
    for (const model of models) {
      const star = model.storybookApplicable ? '⭐' : '  ';
      console.log(
        `${star} ${model.id.padEnd(COL_MODEL_ID)} | ${model.task.padEnd(COL_TASK)} | ${model.performance.padEnd(COL_STATUS)} | ${(model.accuracy * 100).toFixed(1)}%`
      );
    }
    
    console.log('\n⭐ = Recommended for storybook mining\n');
    
    console.log('Use Cases:');
    for (const model of recommended.slice(0, MAX_DISPLAYED_MODELS)) {
      console.log(`  ${model.name}:`);
      console.log(`    - ${model.seoApplications?.slice(0, MAX_USE_CASES).join('\n    - ') || model.description}`);
    }
    
    console.log('\n');
  },
  
  mine: async (service, args) => {
    console.log('\n🔍 Mining Storybooks for Training Data\n');
    
    const urls = args.filter(a => !a.startsWith('--'));
    const modelTypes = [];
    
    // Parse model types from args
    const modelArg = args.find(a => a.startsWith('--model='));
    if (modelArg) {
      modelTypes.push(modelArg.split('=')[1]);
    }
    
    console.log(`Sites to mine: ${urls.length || 'Default sites'}`);
    console.log(`Model types: ${modelTypes.length ? modelTypes.join(', ') : 'All'}\n`);
    
    try {
      const result = await service.mineAndCollectTrainingData(urls, { modelTypes });
      
      console.log('\n✅ Mining Complete!\n');
      console.log(`Sites processed: ${result.sitesProcessed}`);
      console.log(`Sites successful: ${result.sitesSuccessful}`);
      console.log(`Training samples collected: ${result.trainingDataCollected}`);
      console.log('\n');
    } catch (error) {
      console.error('❌ Mining failed:', error.message);
      process.exit(1);
    }
  },
  
  train: async (service, args) => {
    console.log('\n🎓 Starting Training Session\n');
    
    // Get model ID from args
    const modelArg = args.find(a => a.startsWith('--model='));
    if (!modelArg) {
      console.log('Usage: storybook:training:train --model=<model-id> [--name=<session-name>]');
      console.log('\nAvailable models:');
      const models = service.getAvailableModels().filter(m => m.storybookApplicable);
      models.forEach(m => console.log(`  - ${m.id}`));
      console.log('\nExample:');
      console.log('  npm run storybook:training:train -- --model=universal-sentence-encoder');
      console.log('');
      return;
    }
    
    const modelId = modelArg.split('=')[1];
    
    // Get session name
    const nameArg = args.find(a => a.startsWith('--name='));
    const name = nameArg ? nameArg.split('=')[1] : `Training-${modelId}-${Date.now()}`;
    
    // Parse training config
    const epochsArg = args.find(a => a.startsWith('--epochs='));
    const batchArg = args.find(a => a.startsWith('--batch='));
    
    const trainingConfig = {};
    if (epochsArg) trainingConfig.epochs = parseInt(epochsArg.split('=')[1]);
    if (batchArg) trainingConfig.batchSize = parseInt(batchArg.split('=')[1]);
    
    console.log(`Model: ${modelId}`);
    console.log(`Session name: ${name}`);
    console.log(`Config: ${JSON.stringify(trainingConfig)}\n`);
    
    try {
      const session = await service.startTrainingSession({
        name,
        pretrainedModelId: modelId,
        trainingConfig
      });
      
      console.log('\n✅ Training Session Started!\n');
      console.log(`Session ID: ${session.sessionId}`);
      console.log(`Model: ${session.model}`);
      console.log(`Status: ${session.status}`);
      console.log(`Training samples: ${session.trainingSamples}`);
      console.log('\nUse this command to check status:');
      console.log(`  npm run storybook:training:status -- ${session.sessionId}`);
      console.log('');
      
      // Wait for completion if running inline
      if (!args.includes('--async')) {
        console.log('Waiting for training to complete...\n');
        
        // Poll for completion
        let completed = false;
        while (!completed) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const status = await service.getSessionStatus(session.sessionId);
          
          if (status.status === 'completed') {
            completed = true;
            console.log('\n✅ Training Completed!');
            console.log(`Epochs completed: ${status.epochs_completed}`);
            const metrics = typeof status.metrics === 'string' ? JSON.parse(status.metrics) : status.metrics;
            if (metrics) {
              console.log(`Accuracy: ${(metrics.accuracy * 100).toFixed(2)}%`);
              console.log(`Loss: ${metrics.loss?.toFixed(4)}`);
            }
          } else if (status.status === 'failed') {
            completed = true;
            console.log('\n❌ Training Failed!');
            console.log(`Error: ${status.error_message}`);
            process.exit(1);
          } else {
            process.stdout.write(`\rProgress: ${status.epochs_completed || 0} epochs...`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Training failed:', error.message);
      process.exit(1);
    }
  },
  
  status: async (service, args) => {
    const sessionId = args[0];
    
    if (!sessionId) {
      console.log('\n📊 Recent Training Sessions\n');
      
      try {
        const sessions = await service.getTrainingSessions({ limit: 10 });
        
        if (sessions.length === 0) {
          console.log('No training sessions found.\n');
          return;
        }
        
        console.log('Session ID                             | Model                 | Status     | Epochs');
        console.log('-'.repeat(90));
        
        for (const session of sessions) {
          console.log(
            `${session.id.padEnd(COL_SESSION_ID)} | ${(session.model_name || session.pretrained_model_id).substring(0, COL_TASK).padEnd(COL_TASK)} | ${session.status.padEnd(COL_STATUS)} | ${session.epochs_completed || 0}`
          );
        }
        console.log('');
      } catch (error) {
        console.error('Error fetching sessions:', error.message);
      }
      return;
    }
    
    console.log(`\n📊 Training Session: ${sessionId}\n`);
    
    try {
      const session = await service.getSessionStatus(sessionId);
      
      if (!session) {
        console.log('Session not found.\n');
        return;
      }
      
      console.log(`Name: ${session.name}`);
      console.log(`Model: ${session.model_name || session.pretrained_model_id}`);
      console.log(`Status: ${session.status}`);
      console.log(`Samples used: ${session.samples_used}`);
      console.log(`Epochs completed: ${session.epochs_completed}`);
      
      if (session.metrics) {
        const metrics = typeof session.metrics === 'string' ? JSON.parse(session.metrics) : session.metrics;
        console.log('\nMetrics:');
        console.log(`  Accuracy: ${(metrics.accuracy * 100).toFixed(2)}%`);
        console.log(`  Loss: ${metrics.loss?.toFixed(4)}`);
        console.log(`  Val Accuracy: ${(metrics.val_accuracy * 100).toFixed(2)}%`);
        console.log(`  Training time: ${metrics.training_duration_ms}ms`);
      }
      
      if (session.error_message) {
        console.log(`\nError: ${session.error_message}`);
      }
      
      console.log('');
    } catch (error) {
      console.error('Error fetching session:', error.message);
    }
  },
  
  stats: async (service, args) => {
    console.log('\n📊 Storybook Training Statistics\n');
    
    try {
      const stats = service.getStatistics();
      const dataStats = await service.getTrainingDataStats();
      
      console.log('Service Statistics:');
      console.log(`  Initialized: ${stats.initialized}`);
      console.log(`  Models loaded: ${stats.modelsLoaded}`);
      console.log(`  Sessions started: ${stats.trainingSessionsStarted}`);
      console.log(`  Sessions completed: ${stats.trainingSessionsCompleted}`);
      console.log(`  Total samples trained: ${stats.totalSamplesTrained}`);
      console.log(`  Active sessions: ${stats.activeSessions}`);
      
      if (dataStats) {
        console.log('\nTraining Data Statistics:');
        console.log(`  Total samples: ${dataStats.total_samples || 0}`);
        console.log(`  Ready samples: ${dataStats.ready_samples || 0}`);
        console.log(`  Validated samples: ${dataStats.validated_samples || 0}`);
        console.log(`  Average quality: ${parseFloat(dataStats.avg_quality_score || 0).toFixed(1)}`);
        console.log(`  Component types: ${dataStats.component_types || 0}`);
        console.log(`  Unique sources: ${dataStats.unique_sources || 0}`);
      }
      
      console.log('\nRegistry Statistics:');
      console.log(`  Total models: ${stats.registryStats?.total || 0}`);
      console.log(`  TensorFlow Hub: ${stats.registryStats?.bySource?.['tensorflow-hub'] || 0}`);
      console.log(`  Hugging Face: ${stats.registryStats?.bySource?.['huggingface'] || 0}`);
      
      console.log('');
    } catch (error) {
      console.error('Error fetching stats:', error.message);
    }
  },
  
  help: async () => {
    console.log(`
Storybook Training CLI
======================

Command-line interface for storybook mining with pretrained model training.
Provides access to 11 pretrained models for training on mined storybook data.

Usage:
  npm run storybook:training:[command] -- [options]

Commands:
  models      List available pretrained models (11 models)
  mine        Mine storybooks and collect training data
  train       Start a training session with a model
  status      Check training session status
  stats       Show training statistics
  help        Show this help information

Examples:

  # List available models
  npm run storybook:training:models

  # Mine default storybook sites
  npm run storybook:training:mine

  # Mine specific URLs
  npm run storybook:training:mine -- https://ant.design https://material.io

  # Start training with a model
  npm run storybook:training:train -- --model=universal-sentence-encoder

  # Check training status
  npm run storybook:training:status

  # View statistics
  npm run storybook:training:stats

Available Models (11 total):
  - universal-sentence-encoder    (text-embedding, fast)
  - bert-base-uncased             (text-classification, medium)
  - distilbert-sst2-sentiment     (sentiment-analysis, fast)
  - sentence-transformers-minilm  (sentence-embedding, very-fast)
  - mobilenet-v2                  (image-classification, very-fast)
  - efficientnet-b0               (image-classification, medium)
  - toxicity-detection            (text-classification, fast)
  - question-answering-bert       (question-answering, medium)
  - named-entity-recognition      (token-classification, medium)
  - zero-shot-classification      (zero-shot-classification, slow)
  - text-summarization            (summarization, slow)

`);
  }
};

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const commandArgs = args.slice(1);
  
  if (!commands[command]) {
    console.log(`Unknown command: ${command}`);
    console.log('Use "help" for available commands.\n');
    process.exit(1);
  }
  
  // Help command doesn't need database
  if (command === 'help') {
    await commands.help();
    return;
  }
  
  // Models command can work without full initialization
  if (command === 'models') {
    const service = new StorybookModelTrainingService();
    await commands.models(service, commandArgs);
    return;
  }
  
  // Initialize service for other commands
  const service = new StorybookModelTrainingService();
  
  try {
    await service.initialize();
    await commands[command](service, commandArgs);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await service.close();
  }
}

main();
