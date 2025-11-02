#!/usr/bin/env node

/**
 * Design System Mining CLI
 * 
 * Command-line interface for mining component and workflow patterns
 * to generate training data for neural networks.
 */

import { ComponentMiningService } from '../src/design-system/ComponentMiningService';
import { N8nWorkflowMiningService } from '../src/design-system/N8nWorkflowMiningService';
import * as fs from 'fs/promises';
import * as path from 'path';

const OUTPUT_DIR = './data/design-system';
const WORKFLOW_DIR = './data/workflow-patterns';

class DesignSystemMiningCLI {
  private componentMiner: ComponentMiningService;
  private workflowMiner: N8nWorkflowMiningService;

  constructor() {
    this.componentMiner = new ComponentMiningService(OUTPUT_DIR);
    this.workflowMiner = new N8nWorkflowMiningService({
      outputDir: WORKFLOW_DIR,
    });
  }

  async run() {
    console.log('🚀 LightDom Design System Mining Tool\n');
    console.log('=' .repeat(50));
    console.log('\n');

    // Mine components
    await this.mineComponents();

    // Mine workflows
    await this.mineWorkflows();

    // Generate comprehensive training data
    await this.generateComprehensiveTrainingData();

    // Generate summary report
    await this.generateSummaryReport();

    console.log('\n✅ Mining complete! Training data generated successfully.\n');
  }

  /**
   * Mine component patterns
   */
  private async mineComponents() {
    console.log('📦 Mining Component Patterns...\n');

    await this.componentMiner.initialize();
    const components = await this.componentMiner.mineAllLibraries();

    const stats = this.componentMiner.getStatistics();
    console.log(`\n📊 Component Mining Statistics:`);
    console.log(`  Total components: ${stats.total}`);
    console.log(`  By level:`);
    stats.byLevel.forEach(({ level, count }) => {
      console.log(`    - ${level}: ${count}`);
    });
    console.log(`  By library:`);
    Object.entries(stats.byLibrary).forEach(([library, count]) => {
      console.log(`    - ${library}: ${count}`);
    });
    console.log('\n');
  }

  /**
   * Mine workflow patterns
   */
  private async mineWorkflows() {
    console.log('⚙️  Mining Workflow Patterns...\n');

    await this.workflowMiner.initialize();
    const workflows = await this.workflowMiner.mineAllWorkflows();

    const stats = this.workflowMiner.getStatistics();
    console.log(`\n📊 Workflow Mining Statistics:`);
    console.log(`  Total workflows: ${stats.total}`);
    console.log(`  By category:`);
    stats.byCategory.forEach(({ category, count }) => {
      console.log(`    - ${category}: ${count}`);
    });
    console.log(`  By complexity:`);
    Object.entries(stats.byComplexity).forEach(([complexity, count]) => {
      console.log(`    - ${complexity}: ${count}`);
    });
    console.log(`  Average nodes per workflow: ${stats.averageNodes.toFixed(2)}`);
    console.log('\n');
  }

  /**
   * Generate comprehensive training data
   */
  private async generateComprehensiveTrainingData() {
    console.log('🧠 Generating Comprehensive Training Data...\n');

    const outputPath = './data/neural-network-training';
    await fs.mkdir(outputPath, { recursive: true });

    // Load component and workflow data
    const componentData = JSON.parse(
      await fs.readFile(path.join(OUTPUT_DIR, 'training-data', 'neural-network-training-data.json'), 'utf-8')
    );

    const workflowData = JSON.parse(
      await fs.readFile(path.join(WORKFLOW_DIR, 'training-data', 'neural-network-training-data.json'), 'utf-8')
    );

    // Generate comprehensive dataset
    const comprehensiveData = {
      metadata: {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        description: 'Comprehensive training data for LightDom neural network',
        totalSamples: componentData.components.length + workflowData.workflows.length,
      },
      components: {
        metadata: componentData.metadata,
        samples: componentData.components,
        combinations: componentData.combinations,
      },
      workflows: {
        metadata: workflowData.metadata,
        samples: workflowData.workflows,
        patterns: workflowData.patterns,
      },
      schemas: {
        component: await this.loadSchemas(OUTPUT_DIR),
        workflow: await this.loadSchemas(WORKFLOW_DIR),
      },
      trainingConfig: {
        inputFeatures: [
          'category',
          'atomicLevel',
          'props',
          'variants',
          'dependencies',
          'triggers',
          'actions',
          'complexity',
        ],
        outputFeatures: [
          'html',
          'css',
          'schema',
          'nodes',
          'connections',
        ],
        modelArchitecture: {
          type: 'transformer',
          layers: 12,
          hiddenSize: 768,
          attentionHeads: 12,
          vocabularySize: 50000,
        },
        hyperparameters: {
          learningRate: 0.0001,
          batchSize: 32,
          epochs: 100,
          warmupSteps: 10000,
        },
      },
    };

    // Save comprehensive dataset
    await fs.writeFile(
      path.join(outputPath, 'comprehensive-training-data.json'),
      JSON.stringify(comprehensiveData, null, 2)
    );

    // Generate separate datasets for different tasks
    await this.generateTaskSpecificDatasets(outputPath, comprehensiveData);

    console.log('✅ Comprehensive training data generated\n');
  }

  /**
   * Generate task-specific datasets
   */
  private async generateTaskSpecificDatasets(outputPath: string, comprehensiveData: any) {
    // Component generation task
    const componentGenerationData = {
      task: 'component-generation',
      samples: comprehensiveData.components.samples.map((sample: any) => ({
        input: `Generate a ${sample.input.atomicLevel} component for ${sample.input.category} with props: ${JSON.stringify(sample.input.props)}`,
        output: sample.output,
      })),
    };

    await fs.writeFile(
      path.join(outputPath, 'component-generation-task.json'),
      JSON.stringify(componentGenerationData, null, 2)
    );

    // Workflow generation task
    const workflowGenerationData = {
      task: 'workflow-generation',
      samples: comprehensiveData.workflows.samples.map((sample: any) => ({
        input: `Generate a ${sample.input.complexity} workflow for ${sample.input.category} with use case: ${sample.input.useCase}`,
        output: sample.output,
      })),
    };

    await fs.writeFile(
      path.join(outputPath, 'workflow-generation-task.json'),
      JSON.stringify(workflowGenerationData, null, 2)
    );

    // Component composition task
    const compositionData = {
      task: 'component-composition',
      samples: comprehensiveData.components.combinations.map((combo: any) => ({
        input: `Compose a ${combo.type} component: ${combo.component} using atoms: ${combo.requiredAtoms.join(', ')}`,
        output: combo.schema,
      })),
    };

    await fs.writeFile(
      path.join(outputPath, 'component-composition-task.json'),
      JSON.stringify(compositionData, null, 2)
    );
  }

  /**
   * Load schemas
   */
  private async loadSchemas(baseDir: string) {
    try {
      const schemaData = await fs.readFile(
        path.join(baseDir, 'schemas', 'all-schemas.json'),
        'utf-8'
      );
      return JSON.parse(schemaData);
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate summary report
   */
  private async generateSummaryReport() {
    console.log('📄 Generating Summary Report...\n');

    const report = {
      title: 'LightDom Design System Mining Report',
      generatedAt: new Date().toISOString(),
      summary: {
        totalComponents: this.componentMiner.getStatistics().total,
        totalWorkflows: this.workflowMiner.getStatistics().total,
        outputDirectories: [OUTPUT_DIR, WORKFLOW_DIR, './data/neural-network-training'],
      },
      componentLibraries: [
        'Bootstrap',
        'Material-UI',
        'Ant Design',
        'Chakra UI',
        'Tailwind UI',
        'Shadcn UI',
        'Radix UI',
        'Headless UI',
      ],
      workflowCategories: [
        'data-synchronization',
        'automation',
        'integration',
        'notification',
        'data-processing',
        'monitoring',
        'deployment',
        'content-management',
        'customer-support',
        'marketing',
      ],
      atomicDesignLevels: ['atom', 'molecule', 'organism', 'template', 'page'],
      nextSteps: [
        '1. Review generated training data in ./data/neural-network-training',
        '2. Train neural network using comprehensive-training-data.json',
        '3. Fine-tune models using task-specific datasets',
        '4. Implement component generation API',
        '5. Integrate with n8n workflow engine',
        '6. Deploy trained models to production',
      ],
      trainingDataFiles: [
        './data/neural-network-training/comprehensive-training-data.json',
        './data/neural-network-training/component-generation-task.json',
        './data/neural-network-training/workflow-generation-task.json',
        './data/neural-network-training/component-composition-task.json',
      ],
    };

    await fs.writeFile(
      './data/MINING_REPORT.json',
      JSON.stringify(report, null, 2)
    );

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    await fs.writeFile('./data/MINING_REPORT.md', markdownReport);

    console.log('✅ Summary report generated\n');
    console.log('📁 Reports saved to:');
    console.log('  - ./data/MINING_REPORT.json');
    console.log('  - ./data/MINING_REPORT.md');
  }

  /**
   * Generate markdown report
   */
  private generateMarkdownReport(report: any): string {
    return `# ${report.title}

Generated: ${new Date(report.generatedAt).toLocaleString()}

## Summary

- **Total Components Mined**: ${report.summary.totalComponents}
- **Total Workflows Mined**: ${report.summary.totalWorkflows}
- **Output Directories**: ${report.summary.outputDirectories.length}

## Component Libraries

${report.componentLibraries.map((lib: string) => `- ${lib}`).join('\n')}

## Workflow Categories

${report.workflowCategories.map((cat: string) => `- ${cat}`).join('\n')}

## Atomic Design Levels

${report.atomicDesignLevels.map((level: string) => `- ${level}`).join('\n')}

## Training Data Files

${report.trainingDataFiles.map((file: string) => `- \`${file}\``).join('\n')}

## Next Steps

${report.nextSteps.map((step: string) => `${step}`).join('\n')}

## Data Structure

### Component Training Data
- Location: \`${OUTPUT_DIR}\`
- Includes: Component patterns, schemas, atomic design structure
- Format: JSON with metadata, samples, and combinations

### Workflow Training Data
- Location: \`${WORKFLOW_DIR}\`
- Includes: Workflow patterns, nodes, connections, schemas
- Format: JSON with metadata, samples, and patterns

### Comprehensive Training Data
- Location: \`./data/neural-network-training\`
- Includes: Combined component and workflow data with training config
- Format: JSON with task-specific datasets

## Usage

### Mining New Data
\`\`\`bash
npm run design-system:mine
\`\`\`

### Training Neural Network
\`\`\`bash
# Use comprehensive training data
npm run train:model --data ./data/neural-network-training/comprehensive-training-data.json

# Or use task-specific datasets
npm run train:component-generation --data ./data/neural-network-training/component-generation-task.json
npm run train:workflow-generation --data ./data/neural-network-training/workflow-generation-task.json
\`\`\`

### Generating Components
\`\`\`bash
# Using trained model
npm run generate:component --prompt "Create a login form with email and password"
npm run generate:workflow --prompt "Create a data sync workflow from PostgreSQL to external API"
\`\`\`

---

*Generated by LightDom Design System Mining Tool*
`;
  }
}

// Run the CLI
const cli = new DesignSystemMiningCLI();
cli.run().catch(console.error);
