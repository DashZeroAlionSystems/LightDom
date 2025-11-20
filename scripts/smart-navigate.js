#!/usr/bin/env node

/**
 * Smart Navigation CLI
 * 
 * Command-line interface for AI-powered workflow navigation
 */

import { SmartNavigationSystem } from '../services/smart-navigation-system.js';
import { program } from 'commander';
import fs from 'fs/promises';

const nav = new SmartNavigationSystem();

program
  .name('smart-navigate')
  .description('AI-powered workflow navigation')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze codebase and suggest workflow')
  .option('--goal <goal>', 'Goal to achieve', 'improve_codebase_quality')
  .action(async (options) => {
    console.log('🔍 Analyzing codebase...\n');
    
    const workflow = await nav.decideWorkflow({
      goal: options.goal,
      context: {
        issues: 50,
        coverage: 0.6,
      },
    });
    
    console.log('✅ Recommended Workflow:\n');
    
    for (const [i, step] of workflow.steps.entries()) {
      console.log(`${i + 1}. ${step.name} (${step.type})`);
    }
    
    console.log('\nTo execute: smart-navigate execute');
  });

program
  .command('execute')
  .description('Execute a workflow')
  .option('--workflow <file>', 'Workflow JSON file')
  .option('--goal <goal>', 'Goal to achieve', 'improve_codebase_quality')
  .action(async (options) => {
    let workflow;
    
    if (options.workflow) {
      const data = await fs.readFile(options.workflow, 'utf-8');
      workflow = JSON.parse(data);
    } else {
      workflow = await nav.decideWorkflow({
        goal: options.goal,
        context: {},
      });
    }
    
    console.log('🚀 Executing workflow...\n');
    
    const result = await nav.executeWorkflow(workflow);
    
    if (result.success) {
      console.log('\n✅ Workflow completed!');
      console.log('Duration:', (result.duration / 1000).toFixed(1) + 's');
      console.log('\nResults:');
      
      for (const stepResult of result.results) {
        const icon = stepResult.success ? '✅' : '❌';
        console.log(`${icon} ${stepResult.step}`);
      }
    } else {
      console.log('\n❌ Workflow failed');
    }
  });

program
  .command('add-rule')
  .description('Add automation rule')
  .option('--trigger <trigger>', 'Trigger event', 'issue:detected')
  .option('--condition <condition>', 'Condition (e.g., "severity>=8")')
  .option('--action <action>', 'Action type', 'fix')
  .action((options) => {
    const [field, rest] = options.condition.split(/([><=!]+)/);
    const operator = rest.match(/[><=!]+/)[0];
    const value = parseFloat(rest.replace(operator, ''));
    
    nav.addAutomationRule({
      trigger: options.trigger,
      condition: { field, operator, value },
      action: { type: options.action, name: `Auto ${options.action}` },
    });
    
    console.log('✅ Automation rule added');
    console.log('Trigger:', options.trigger);
    console.log('Condition:', options.condition);
    console.log('Action:', options.action);
  });

program
  .command('metrics')
  .description('Get navigation metrics')
  .action(() => {
    const metrics = nav.getMetrics();
    
    console.log('📈 Navigation Metrics\n');
    console.log('Decisions Made:', metrics.decisionsMade);
    console.log('Workflows Executed:', metrics.workflowsExecuted);
    console.log('Automations Triggered:', metrics.automationsTriggered);
    console.log('Success Rate:', (metrics.successRate * 100).toFixed(1) + '%');
  });

program.parse();
