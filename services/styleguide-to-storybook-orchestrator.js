/**
 * Style Guide to Storybook Orchestrator
 * 
 * Main orchestrator service that coordinates:
 * - Style guide mining from URLs
 * - Component generation via DeepSeek
 * - Storybook story creation
 * - Training data generation for fine-tuning
 * 
 * This is the main entry point for the complete workflow.
 */

import { EventEmitter } from 'events';
import { StyleGuideDataMiningService } from './styleguide-data-mining-service.js';
import { DeepSeekComponentFinetuningService } from './deepseek-component-finetuning-service.js';
import { StorybookComponentGeneratorService } from './storybook-component-generator-service.js';
import fs from 'fs/promises';
import path from 'path';

export class StyleGuideToStorybookOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      outputDir: config.outputDir || './output',
      componentsDir: config.componentsDir || './src/components/generated',
      storiesDir: config.storiesDir || './src/stories/generated',
      trainingDataDir: config.trainingDataDir || './training-data/components',
      ...config
    };

    // Initialize services
    this.miningService = new StyleGuideDataMiningService(config.mining || {});
    this.finetuningService = new DeepSeekComponentFinetuningService({
      outputDir: this.config.componentsDir,
      trainingDataDir: this.config.trainingDataDir,
      ...config.finetuning
    });
    this.storybookService = new StorybookComponentGeneratorService({
      storiesDir: this.config.storiesDir,
      ...config.storybook
    });

    // Track progress
    this.progress = {
      phase: 'idle',
      currentStep: '',
      totalSteps: 0,
      completedSteps: 0
    };
  }

  /**
   * Initialize all services
   */
  async initialize() {
    console.log('🚀 Initializing Style Guide to Storybook Orchestrator...');
    
    await this.miningService.initialize();
    await this.finetuningService.initialize();
    await this.storybookService.initialize();

    // Create output directories
    await fs.mkdir(this.config.outputDir, { recursive: true });
    await fs.mkdir(this.config.componentsDir, { recursive: true });

    console.log('✅ Orchestrator initialized');
  }

  /**
   * Complete workflow: URL → Style Guide → Components → Storybook
   */
  async processUrl(url, options = {}) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎯 Processing URL: ${url}`);
    console.log(`${'='.repeat(80)}\n`);

    const workflow = {
      url,
      startedAt: new Date().toISOString(),
      steps: {}
    };

    try {
      // Step 1: Mine style guide from URL
      this.updateProgress('mining', 'Mining style guide from URL', 1, 5);
      workflow.steps.styleGuide = await this.miningService.mineStyleGuideFromUrl(url);
      console.log(`✓ Style guide mined: ${workflow.steps.styleGuide.metadata.totalComponents} components\n`);

      // Step 2: Generate training data
      if (options.generateTrainingData !== false) {
        this.updateProgress('training-data', 'Generating training data for fine-tuning', 2, 5);
        workflow.steps.trainingData = await this.finetuningService.generateTrainingDataFromStyleGuide(
          workflow.steps.styleGuide
        );
        
        const trainingDataPath = await this.finetuningService.saveTrainingData(
          `training-${Date.now()}.jsonl`
        );
        console.log(`✓ Training data saved: ${trainingDataPath}\n`);
      }

      // Step 3: Generate component library
      this.updateProgress('components', 'Generating component library', 3, 5);
      workflow.steps.componentLibrary = await this.finetuningService.generateComponentLibrary(
        workflow.steps.styleGuide,
        {
          libraryName: options.libraryName || 'GeneratedComponents',
          framework: options.framework || 'react',
          save: true
        }
      );
      console.log(`✓ Components generated: ${workflow.steps.componentLibrary.metadata.totalComponents}\n`);

      // Step 4: Generate Storybook
      this.updateProgress('storybook', 'Generating Storybook documentation', 4, 5);
      workflow.steps.storybook = await this.storybookService.generateStorybookFromStyleGuide(
        workflow.steps.styleGuide,
        workflow.steps.componentLibrary
      );
      console.log(`✓ Storybook generated: ${workflow.steps.storybook.metadata.totalStories} stories\n`);

      // Step 5: Generate summary report
      this.updateProgress('report', 'Generating summary report', 5, 5);
      workflow.completedAt = new Date().toISOString();
      workflow.success = true;
      
      const report = await this.generateReport(workflow);
      const reportPath = path.join(this.config.outputDir, `report-${Date.now()}.json`);
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
      console.log(`✓ Report saved: ${reportPath}\n`);

      this.emit('workflowComplete', workflow);

      console.log(`\n${'='.repeat(80)}`);
      console.log(`✅ Workflow completed successfully!`);
      console.log(`${'='.repeat(80)}\n`);

      return workflow;
    } catch (error) {
      workflow.completedAt = new Date().toISOString();
      workflow.success = false;
      workflow.error = error.message;
      
      console.error(`\n❌ Workflow failed: ${error.message}\n`);
      
      this.emit('workflowError', error);
      
      throw error;
    }
  }

  /**
   * Generate components from existing style guide
   */
  async generateComponentsFromStyleGuide(styleGuideFile, options = {}) {
    console.log(`📖 Loading style guide from: ${styleGuideFile}`);

    const styleGuideContent = await fs.readFile(styleGuideFile, 'utf-8');
    const styleGuide = JSON.parse(styleGuideContent);

    const workflow = {
      styleGuideFile,
      startedAt: new Date().toISOString(),
      steps: {
        styleGuide
      }
    };

    try {
      // Generate components
      this.updateProgress('components', 'Generating components', 1, 2);
      workflow.steps.componentLibrary = await this.finetuningService.generateComponentLibrary(
        styleGuide,
        options
      );

      // Generate Storybook
      this.updateProgress('storybook', 'Generating Storybook', 2, 2);
      workflow.steps.storybook = await this.storybookService.generateStorybookFromStyleGuide(
        styleGuide,
        workflow.steps.componentLibrary
      );

      workflow.completedAt = new Date().toISOString();
      workflow.success = true;

      console.log(`✅ Components and Storybook generated successfully!`);

      return workflow;
    } catch (error) {
      workflow.completedAt = new Date().toISOString();
      workflow.success = false;
      workflow.error = error.message;
      
      throw error;
    }
  }

  /**
   * Mine multiple URLs and create unified style guide
   */
  async mineMultipleUrls(urls, options = {}) {
    console.log(`🔍 Mining ${urls.length} URLs...`);

    const styleGuides = [];

    for (const url of urls) {
      try {
        const styleGuide = await this.miningService.mineStyleGuideFromUrl(url);
        styleGuides.push(styleGuide);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to mine ${url}:`, error.message);
      }
    }

    // Merge style guides
    const mergedStyleGuide = this.mergeStyleGuides(styleGuides, options.name);

    // Save merged style guide
    const outputPath = path.join(
      this.config.outputDir,
      `merged-styleguide-${Date.now()}.json`
    );
    await fs.writeFile(
      outputPath,
      JSON.stringify(mergedStyleGuide, null, 2),
      'utf-8'
    );

    console.log(`✅ Merged style guide saved: ${outputPath}`);

    return mergedStyleGuide;
  }

  /**
   * Fine-tune DeepSeek model with collected training data
   */
  async fineTuneModel(options = {}) {
    console.log('🔧 Starting fine-tuning process...');

    // Load all training data
    if (options.trainingDataFile) {
      await this.finetuningService.loadTrainingData(options.trainingDataFile);
    }

    // Start fine-tuning
    const model = await this.finetuningService.fineTuneModel(
      options.trainingDataPath
    );

    console.log(`✅ Fine-tuning completed`);
    console.log(`   Model ID: ${model.id}`);

    return model;
  }

  /**
   * Generate training data from existing components
   */
  async generateTrainingDataFromComponents(componentsDir) {
    console.log(`📚 Generating training data from: ${componentsDir}`);

    const trainingData = await this.finetuningService.generateTrainingDataFromComponents(
      componentsDir
    );

    const outputPath = await this.finetuningService.saveTrainingData(
      `components-training-${Date.now()}.jsonl`
    );

    console.log(`✅ Training data saved: ${outputPath}`);
    console.log(`   Examples: ${trainingData.length}`);

    return trainingData;
  }

  /**
   * Merge multiple style guides
   */
  mergeStyleGuides(styleGuides, name = 'Merged Style Guide') {
    const merged = {
      id: `styleguide_merged_${Date.now()}`,
      generated: new Date().toISOString(),
      metadata: {
        name,
        version: '1.0.0',
        sources: styleGuides.map(sg => sg.url || sg.id)
      },
      tokens: {},
      components: {},
      schemas: {}
    };

    // Merge tokens (taking first non-empty value)
    styleGuides.forEach(sg => {
      if (sg.tokens) {
        Object.keys(sg.tokens).forEach(tokenType => {
          if (!merged.tokens[tokenType]) {
            merged.tokens[tokenType] = sg.tokens[tokenType];
          }
        });
      }
    });

    // Merge components
    styleGuides.forEach(sg => {
      if (sg.components) {
        Object.assign(merged.components, sg.components);
      }
    });

    // Merge schemas
    styleGuides.forEach(sg => {
      if (sg.schemas) {
        Object.assign(merged.schemas, sg.schemas);
      }
    });

    return merged;
  }

  /**
   * Generate summary report
   */
  async generateReport(workflow) {
    const report = {
      summary: {
        url: workflow.url,
        duration: this.calculateDuration(workflow.startedAt, workflow.completedAt),
        success: workflow.success
      },
      styleGuide: {
        components: workflow.steps.styleGuide?.metadata?.totalComponents || 0,
        tokens: workflow.steps.styleGuide?.metadata?.totalTokens || 0,
        framework: workflow.steps.styleGuide?.framework?.name || 'Unknown'
      },
      trainingData: {
        examples: workflow.steps.trainingData?.length || 0
      },
      componentLibrary: {
        components: workflow.steps.componentLibrary?.metadata?.totalComponents || 0
      },
      storybook: {
        stories: workflow.steps.storybook?.metadata?.totalStories || 0
      },
      outputs: {
        components: this.config.componentsDir,
        stories: this.config.storiesDir,
        trainingData: this.config.trainingDataDir
      }
    };

    return report;
  }

  /**
   * Update progress
   */
  updateProgress(phase, step, completed, total) {
    this.progress = {
      phase,
      currentStep: step,
      totalSteps: total,
      completedSteps: completed
    };

    console.log(`[${completed}/${total}] ${step}...`);

    this.emit('progress', this.progress);
  }

  /**
   * Calculate duration
   */
  calculateDuration(start, end) {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationMs = endTime - startTime;
    const durationSec = Math.floor(durationMs / 1000);
    
    return `${durationSec}s`;
  }

  /**
   * Cleanup
   */
  async cleanup() {
    await this.miningService.cleanup();
  }
}

export default StyleGuideToStorybookOrchestrator;
