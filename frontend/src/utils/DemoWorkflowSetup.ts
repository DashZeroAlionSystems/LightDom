/**
 * Demo Workflow Setup
 * Creates sample workflows for demonstration and testing
 */

import { promptAnalyzerService } from '../services/PromptAnalyzerService';
import { WorkflowSchema } from '../services/WorkflowWizardService';

export interface DemoWorkflow {
  name: string;
  description: string;
  prompt: string;
  category: string;
  expectedTasks: number;
}

export const demoWorkflows: DemoWorkflow[] = [
  {
    name: 'Product Price Monitoring',
    description: 'Scrapes product prices from e-commerce sites daily and stores in database',
    prompt: 'Scrape product prices from https://demo-shop.example.localhost/products daily and store the results in the database',
    category: 'data-mining',
    expectedTasks: 3,
  },
  {
    name: 'ML Model Training Pipeline',
    description: 'Complete TensorFlow model training workflow',
    prompt: 'Train a TensorFlow neural network model on collected data, evaluate its performance, and deploy it',
    category: 'machine-learning',
    expectedTasks: 4,
  },
  {
    name: 'Competitive Analysis',
    description: 'Analyzes competitor data and generates insights',
    prompt: 'Scrape competitor pricing data, analyze market trends, and generate a comprehensive report',
    category: 'analytics',
    expectedTasks: 5,
  },
  {
    name: 'SEO Content Optimizer',
    description: 'Optimizes content for SEO using AI analysis',
    prompt: 'Analyze website content for SEO optimization, train a model to suggest improvements, and generate reports',
    category: 'seo',
    expectedTasks: 5,
  },
  {
    name: 'User Feedback Processor',
    description: 'Collects and processes user feedback',
    prompt: 'Collect user feedback from multiple sources, analyze sentiment, and notify the team',
    category: 'automation',
    expectedTasks: 4,
  },
];

export class DemoWorkflowSetup {
  /**
   * Generate all demo workflows
   */
  async generateDemoWorkflows(): Promise<Partial<WorkflowSchema>[]> {
    const workflows: Partial<WorkflowSchema>[] = [];

    for (const demo of demoWorkflows) {
      console.log(`Generating workflow: ${demo.name}...`);
      const workflow = await promptAnalyzerService.createWorkflowFromPrompt(demo.prompt);
      workflows.push(workflow);
    }

    return workflows;
  }

  /**
   * Generate a specific demo workflow
   */
  async generateWorkflow(name: string): Promise<Partial<WorkflowSchema> | null> {
    const demo = demoWorkflows.find(w => w.name === name);
    if (!demo) {
      console.error(`Demo workflow "${name}" not found`);
      return null;
    }

    return promptAnalyzerService.createWorkflowFromPrompt(demo.prompt);
  }

  /**
   * Get all demo workflow names
   */
  getDemoWorkflowNames(): string[] {
    return demoWorkflows.map(w => w.name);
  }

  /**
   * Test workflow generation
   */
  async testWorkflowGeneration(): Promise<void> {
    console.log('🧪 Testing Workflow Generation\n');

    for (const demo of demoWorkflows) {
      console.log(`\n📋 ${demo.name}`);
      console.log(`   Prompt: "${demo.prompt}"`);
      
      try {
        const workflow = await promptAnalyzerService.createWorkflowFromPrompt(demo.prompt);
        const taskCount = workflow.tasks?.length || 0;
        
        console.log(`   ✅ Generated: ${taskCount} tasks`);
        console.log(`   📦 Category: ${workflow.category}`);
        console.log(`   🎯 Tasks:`);
        
        workflow.tasks?.forEach((task, index) => {
          console.log(`      ${index + 1}. ${task.name || 'Unnamed Task'}`);
          console.log(`         Type: ${task['@type'] || 'Unknown'}`);
          if (task.dependsOn && task.dependsOn.length > 0) {
            console.log(`         Depends on: ${task.dependsOn.join(', ')}`);
          }
        });

        if (taskCount >= demo.expectedTasks) {
          console.log(`   ✅ Test passed (expected ${demo.expectedTasks}, got ${taskCount})`);
        } else {
          console.log(`   ⚠️  Warning: Expected ${demo.expectedTasks} tasks, got ${taskCount}`);
        }
      } catch (error) {
        console.error(`   ❌ Error generating workflow:`, error);
      }
    }

    console.log('\n\n✅ Workflow generation test complete!');
  }
}

// Export singleton
export const demoWorkflowSetup = new DemoWorkflowSetup();

// Example usage:
/*
import { demoWorkflowSetup } from './DemoWorkflowSetup';

// Test all workflows
await demoWorkflowSetup.testWorkflowGeneration();

// Generate a specific workflow
const mlWorkflow = await demoWorkflowSetup.generateWorkflow('ML Model Training Pipeline');

// Get all available demos
const names = demoWorkflowSetup.getDemoWorkflowNames();
console.log('Available demos:', names);
*/
