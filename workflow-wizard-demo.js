/**
 * Workflow Wizard Demo
 * Demonstrates schema-driven workflow execution
 * 
 * Run with: node workflow-wizard-demo.js
 */

import WorkflowWizardService from './src/services/WorkflowWizardService.js';

// ============================================================================
// Demo Workflow Schemas
// ============================================================================

const userOnboardingWorkflow = {
  '@context': 'https://schema.lightdom.com/workflow/v1',
  '@type': 'Workflow',
  '@id': 'lightdom:workflow:user-onboarding-demo',
  name: 'User Onboarding Demo',
  description: 'Demonstrates user onboarding workflow with validation, database, and notifications',
  version: '1.0.0',
  category: 'user-management',
  priority: 5,
  
  trigger: {
    type: 'manual',
    config: {}
  },
  
  input: {
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        name: { type: 'string', minLength: 2 }
      },
      required: ['email', 'password', 'name']
    }
  },
  
  tasks: [
    {
      name: 'Validate Email',
      execution: {
        type: 'function',
        handler: 'validateEmail',
        timeout: 5000
      }
    },
    {
      name: 'Check Email Exists',
      execution: {
        type: 'function',
        handler: 'checkEmailExists',
        timeout: 5000
      }
    },
    {
      name: 'Create User',
      conditions: {
        executeIf: 'context.Check Email Exists.exists === false'
      },
      execution: {
        type: 'function',
        handler: 'createUser',
        config: {
          sendEmail: true
        }
      }
    },
    {
      name: 'Send Welcome Email',
      dependsOn: ['Create User'],
      execution: {
        type: 'function',
        handler: 'sendWelcomeEmail',
        timeout: 10000
      }
    },
    {
      name: 'Log Onboarding',
      parallel: true,
      execution: {
        type: 'function',
        handler: 'logEvent',
        config: {
          event: 'user_onboarded'
        }
      }
    }
  ],
  
  errorHandling: {
    strategy: 'retry',
    maxRetries: 2,
    retryDelay: 1000,
    backoffMultiplier: 2
  },
  
  monitoring: {
    enabled: true,
    logLevel: 'info',
    metrics: ['duration', 'success-rate'],
    alerts: {
      onFailure: {
        enabled: true,
        channels: ['console']
      }
    }
  },
  
  permissions: {
    execute: ['*'],
    view: ['*'],
    edit: ['admin']
  },
  
  metadata: {
    author: 'lightdom-demo',
    createdAt: '2024-11-02T00:00:00Z',
    tags: ['demo', 'user', 'onboarding'],
    examples: [
      {
        name: 'Basic User',
        input: {
          email: 'user@example.com',
          password: 'securepass123',
          name: 'John Doe'
        }
      }
    ]
  }
};

const dataProcessingWorkflow = {
  '@context': 'https://schema.lightdom.com/workflow/v1',
  '@type': 'Workflow',
  '@id': 'lightdom:workflow:data-processing-demo',
  name: 'Data Processing Demo',
  description: 'Demonstrates forEach loops and parallel processing',
  version: '1.0.0',
  category: 'data-processing',
  priority: 7,
  
  trigger: {
    type: 'manual',
    config: {}
  },
  
  tasks: [
    {
      name: 'Fetch URLs',
      execution: {
        type: 'function',
        handler: 'getURLList'
      }
    },
    {
      name: 'Process Each URL',
      forEach: 'context.Fetch URLs',
      as: 'url',
      parallel: true,
      maxConcurrency: 3,
      execution: {
        type: 'function',
        handler: 'processURL',
        timeout: 10000
      }
    },
    {
      name: 'Aggregate Results',
      dependsOn: ['Process Each URL'],
      execution: {
        type: 'function',
        handler: 'aggregateResults'
      }
    },
    {
      name: 'Generate Report',
      execution: {
        type: 'function',
        handler: 'generateReport',
        config: {
          format: 'json'
        }
      }
    }
  ],
  
  errorHandling: {
    strategy: 'continue',
    maxRetries: 1,
    retryDelay: 2000
  },
  
  monitoring: {
    enabled: true,
    logLevel: 'debug',
    metrics: ['duration', 'success-rate', 'throughput'],
    alerts: {}
  },
  
  permissions: {
    execute: ['*'],
    view: ['*'],
    edit: ['admin']
  },
  
  metadata: {
    author: 'lightdom-demo',
    createdAt: '2024-11-02T00:00:00Z',
    tags: ['demo', 'data-processing', 'parallel']
  }
};

const conditionalWorkflow = {
  '@context': 'https://schema.lightdom.com/workflow/v1',
  '@type': 'Workflow',
  '@id': 'lightdom:workflow:conditional-demo',
  name: 'Conditional Execution Demo',
  description: 'Demonstrates conditional task execution',
  version: '1.0.0',
  category: 'demo',
  priority: 5,
  
  trigger: {
    type: 'manual',
    config: {}
  },
  
  tasks: [
    {
      name: 'Check Premium Status',
      execution: {
        type: 'function',
        handler: 'checkPremium'
      }
    },
    {
      name: 'Premium Feature',
      conditions: {
        executeIf: 'context.Check Premium Status.isPremium === true'
      },
      execution: {
        type: 'function',
        handler: 'executePremiumFeature'
      }
    },
    {
      name: 'Free Feature',
      conditions: {
        executeIf: 'context.Check Premium Status.isPremium === false'
      },
      execution: {
        type: 'function',
        handler: 'executeFreeFeature'
      }
    },
    {
      name: 'Log Usage',
      execution: {
        type: 'function',
        handler: 'logUsage'
      }
    }
  ],
  
  errorHandling: {
    strategy: 'continue',
    maxRetries: 0,
    retryDelay: 0
  },
  
  monitoring: {
    enabled: true,
    logLevel: 'info',
    metrics: ['duration'],
    alerts: {}
  },
  
  permissions: {
    execute: ['*'],
    view: ['*'],
    edit: ['admin']
  },
  
  metadata: {
    author: 'lightdom-demo',
    createdAt: '2024-11-02T00:00:00Z',
    tags: ['demo', 'conditional']
  }
};

// ============================================================================
// Task Handlers
// ============================================================================

const taskHandlers = {
  // User Onboarding Handlers
  validateEmail: async (input, context, config) => {
    console.log('  ✓ Validating email:', input.email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(input.email);
    if (!isValid) {
      throw new Error('Invalid email format');
    }
    return { valid: true };
  },

  checkEmailExists: async (input, context, config) => {
    console.log('  ✓ Checking if email exists:', input.email);
    // Simulate database check
    await new Promise(resolve => setTimeout(resolve, 500));
    return { exists: false }; // Always false for demo
  },

  createUser: async (input, context, config) => {
    console.log('  ✓ Creating user:', input.name);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: Math.random().toString(36).substr(2, 9),
      email: input.email,
      name: input.name,
      createdAt: new Date().toISOString()
    };
  },

  sendWelcomeEmail: async (input, context, config) => {
    console.log('  ✓ Sending welcome email to:', input.email);
    await new Promise(resolve => setTimeout(resolve, 800));
    return { sent: true, timestamp: new Date().toISOString() };
  },

  logEvent: async (input, context, config) => {
    console.log(`  ✓ Logging event: ${config.event}`);
    return { logged: true };
  },

  // Data Processing Handlers
  getURLList: async (input, context, config) => {
    console.log('  ✓ Fetching URL list');
    return [
      'https://example.com/page1',
      'https://example.com/page2',
      'https://example.com/page3',
      'https://example.com/page4',
      'https://example.com/page5'
    ];
  },

  processURL: async (input, context, config) => {
    const url = context.url;
    console.log(`  ✓ Processing URL: ${url}`);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    return {
      url,
      status: 200,
      title: `Page Title - ${url}`,
      wordCount: Math.floor(Math.random() * 1000) + 500,
      processedAt: new Date().toISOString()
    };
  },

  aggregateResults: async (input, context, config) => {
    console.log('  ✓ Aggregating results');
    const results = context['Process Each URL'];
    
    if (!Array.isArray(results)) {
      return { totalProcessed: 0, summary: 'No results to aggregate' };
    }

    const totalWords = results.reduce((sum, r) => sum + (r.output?.wordCount || 0), 0);
    const avgWords = Math.round(totalWords / results.length);
    
    return {
      totalProcessed: results.length,
      totalWords,
      avgWords,
      processedAt: new Date().toISOString()
    };
  },

  generateReport: async (input, context, config) => {
    console.log(`  ✓ Generating report in ${config.format} format`);
    const aggregated = context['Aggregate Results'];
    
    const report = {
      title: 'Data Processing Report',
      generatedAt: new Date().toISOString(),
      summary: aggregated,
      format: config.format
    };
    
    return report;
  },

  // Conditional Workflow Handlers
  checkPremium: async (input, context, config) => {
    console.log('  ✓ Checking premium status');
    // Randomly assign premium status for demo
    const isPremium = Math.random() > 0.5;
    console.log(`    ${isPremium ? '💎 Premium user' : '🆓 Free user'}`);
    return { isPremium };
  },

  executePremiumFeature: async (input, context, config) => {
    console.log('  ✓ Executing premium feature');
    await new Promise(resolve => setTimeout(resolve, 500));
    return { feature: 'premium', executed: true };
  },

  executeFreeFeature: async (input, context, config) => {
    console.log('  ✓ Executing free feature');
    await new Promise(resolve => setTimeout(resolve, 500));
    return { feature: 'free', executed: true };
  },

  logUsage: async (input, context, config) => {
    console.log('  ✓ Logging usage metrics');
    return { logged: true, timestamp: new Date().toISOString() };
  }
};

// ============================================================================
// Demo Runner
// ============================================================================

async function runDemo() {
  console.log('\n' + '='.repeat(80));
  console.log('WORKFLOW WIZARD DEMO - Schema-Driven Workflow Execution');
  console.log('='.repeat(80) + '\n');

  // Create wizard instance
  const wizard = new WorkflowWizardService({
    taskHandlers,
    logger: {
      info: (msg, meta) => {}, // Silence info logs for cleaner output
      debug: (msg, meta) => {},
      error: (msg, meta) => console.error(`❌ ${msg}`, meta),
      warn: (msg, meta) => console.warn(`⚠️  ${msg}`, meta)
    }
  });

  // Listen to events
  wizard.on('workflow-started', (execution) => {
    console.log(`\n🚀 Workflow Started: ${execution.workflow.name}`);
    console.log(`   Execution ID: ${execution.id}\n`);
  });

  wizard.on('workflow-completed', (execution) => {
    const duration = execution.completedAt.getTime() - execution.startedAt.getTime();
    console.log(`\n✅ Workflow Completed: ${execution.workflow.name}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Tasks: ${execution.results.length}`);
    console.log(`   Success: ${execution.results.filter(r => r.status === 'completed').length}/${execution.results.length}\n`);
  });

  wizard.on('workflow-failed', (execution, error) => {
    console.log(`\n❌ Workflow Failed: ${execution.workflow.name}`);
    console.log(`   Error: ${error.message}\n`);
  });

  // Register workflows
  console.log('📝 Registering workflows...\n');
  wizard.registerWorkflow(userOnboardingWorkflow);
  wizard.registerWorkflow(dataProcessingWorkflow);
  wizard.registerWorkflow(conditionalWorkflow);
  console.log(`   Registered ${wizard.getWorkflows().length} workflows\n`);

  // ===== Demo 1: User Onboarding Workflow =====
  console.log('\n' + '─'.repeat(80));
  console.log('DEMO 1: User Onboarding Workflow');
  console.log('─'.repeat(80));
  
  try {
    const result1 = await wizard.executeWorkflow(
      'lightdom:workflow:user-onboarding-demo',
      {
        email: 'john.doe@example.com',
        password: 'securepass123',
        name: 'John Doe'
      }
    );

    console.log('📊 Results:');
    console.log(JSON.stringify(result1, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  // ===== Demo 2: Data Processing Workflow =====
  console.log('\n' + '─'.repeat(80));
  console.log('DEMO 2: Data Processing Workflow (Parallel forEach)');
  console.log('─'.repeat(80));
  
  try {
    const result2 = await wizard.executeWorkflow(
      'lightdom:workflow:data-processing-demo',
      {}
    );

    console.log('📊 Results:');
    console.log(JSON.stringify(result2, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  // ===== Demo 3: Conditional Workflow =====
  console.log('\n' + '─'.repeat(80));
  console.log('DEMO 3: Conditional Execution Workflow');
  console.log('─'.repeat(80));
  
  try {
    const result3 = await wizard.executeWorkflow(
      'lightdom:workflow:conditional-demo',
      { userId: '12345' }
    );

    console.log('📊 Results:');
    console.log(JSON.stringify(result3, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  // ===== Summary =====
  console.log('\n' + '='.repeat(80));
  console.log('DEMO COMPLETE');
  console.log('='.repeat(80));
  console.log('\n✨ Key Features Demonstrated:');
  console.log('   ✓ Schema-driven workflow definition');
  console.log('   ✓ Multiple task types (function handlers)');
  console.log('   ✓ Sequential and parallel execution');
  console.log('   ✓ Conditional task execution');
  console.log('   ✓ forEach loops with concurrency control');
  console.log('   ✓ Error handling and retries');
  console.log('   ✓ Event-driven monitoring');
  console.log('   ✓ Context passing between tasks');
  console.log('   ✓ Variable interpolation');
  console.log('\n📚 See WORKFLOW_WIZARD_SCHEMAS.md for more examples');
  console.log('💻 See src/services/WorkflowWizardService.ts for implementation\n');
}

// Run the demo
runDemo().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
