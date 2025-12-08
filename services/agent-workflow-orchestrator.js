#!/usr/bin/env node

/**
 * Agent Workflow Orchestrator Service
 *
 * Orchestrates AI agents to perform complex workflows:
 * - Prompt → Config → Component generation
 * - Dashboard creation from descriptions
 * - Service scaffolding
 * - Workflow automation
 *
 * Integrates with:
 * - DeepSeek for AI capabilities
 * - Atomic Component Generator
 * - Schema Linking Service
 * - Workflow templates
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

// Lazy load dependencies (may not be available)
let DeepSeekAPIService, AtomicComponentGenerator, SchemaLinkingService;
try {
  const deepseekModule = await import('./deepseek-api-service.js');
  DeepSeekAPIService = deepseekModule.DeepSeekAPIService;

  const compModule = await import('./atomic-component-generator.js');
  AtomicComponentGenerator = compModule.AtomicComponentGenerator;

  const schemaModule = await import('./schema-linking-service.js');
  SchemaLinkingService = schemaModule.SchemaLinkingService;
} catch (error) {
  console.warn('Some services not available:', error.message);
}

export class AgentWorkflowOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();

    this.config = {
      deepseekModel: config.deepseekModel || 'deepseek-reasoner',
      temperature: config.temperature || 0.7,
      workflowsDir: config.workflowsDir || './workflows/generated',
      componentsDir: config.componentsDir || './src/components/generated',
      ...config,
    };

    // Initialize services
    if (DeepSeekAPIService) {
      this.deepseek = new DeepSeekAPIService({
        model: this.config.deepseekModel,
        temperature: this.config.temperature,
        ...config.deepseek,
      });
    } else {
      console.warn('⚠️ DeepSeek service not available. AI features will be limited.');
    }

    if (AtomicComponentGenerator) {
      this.componentGenerator = new AtomicComponentGenerator({
        outputDir: this.config.componentsDir,
        useAI: !!DeepSeekAPIService,
        deepseek: config.deepseek,
      });
    } else {
      console.warn('⚠️ Component generator not available.');
    }

    if (SchemaLinkingService) {
      this.schemaLinker = new SchemaLinkingService(config.database);
    }

    // Workflow state
    this.activeWorkflows = new Map();
    this.workflowHistory = [];
  }

  /**
   * Initialize the orchestrator
   */
  async initialize() {
    console.log('🚀 Initializing Agent Workflow Orchestrator...');

    await Promise.all([
      fs.mkdir(this.config.workflowsDir, { recursive: true }),
      this.componentGenerator ? this.componentGenerator.initialize() : Promise.resolve(),
    ]);

    console.log('✅ Agent Workflow Orchestrator initialized');
  }

  /**
   * Execute workflow from natural language prompt
   */
  async executeFromPrompt(prompt, options = {}) {
    console.log(`\n🎯 Processing prompt: "${prompt}"`);

    const workflowId = `workflow-${Date.now()}`;
    const workflow = {
      id: workflowId,
      prompt,
      startedAt: new Date().toISOString(),
      status: 'processing',
      steps: [],
      results: {},
    };

    this.activeWorkflows.set(workflowId, workflow);
    this.emit('workflow:started', { workflowId, prompt });

    try {
      // Step 1: Analyze intent
      console.log('\n📊 Step 1: Analyzing intent...');
      const intent = await this.analyzeIntent(prompt);
      workflow.steps.push({ step: 'analyze', result: intent });
      console.log(`   Intent: ${intent.type}`);
      console.log(`   Entities: ${JSON.stringify(intent.entities)}`);

      // Step 2: Generate configuration
      console.log('\n⚙️  Step 2: Generating configuration...');
      const config = await this.generateConfig(intent, options);
      workflow.steps.push({ step: 'config', result: config });
      console.log(`   Config type: ${config.type}`);

      // Step 3: Execute based on intent type
      console.log('\n🔨 Step 3: Executing workflow...');
      let result;

      switch (intent.type) {
        case 'component':
          result = await this.executeComponentWorkflow(config, options);
          break;

        case 'dashboard':
          result = await this.executeDashboardWorkflow(config, options);
          break;

        case 'service':
          result = await this.executeServiceWorkflow(config, options);
          break;

        case 'workflow':
          result = await this.executeCustomWorkflow(config, options);
          break;

        default:
          result = await this.executeGenericWorkflow(config, options);
      }

      workflow.steps.push({ step: 'execute', result });
      workflow.results = result;
      workflow.status = 'completed';
      workflow.completedAt = new Date().toISOString();

      console.log(`\n✅ Workflow completed: ${workflowId}`);
      this.emit('workflow:completed', { workflowId, result });

      return {
        workflowId,
        intent,
        config,
        result,
        success: true,
      };
    } catch (error) {
      console.error(`\n❌ Workflow failed: ${error.message}`);
      workflow.status = 'failed';
      workflow.error = error.message;
      workflow.completedAt = new Date().toISOString();

      this.emit('workflow:failed', { workflowId, error });

      throw error;
    } finally {
      this.workflowHistory.push(workflow);
      this.activeWorkflows.delete(workflowId);
    }
  }

  /**
   * Analyze prompt intent using DeepSeek
   */
  async analyzeIntent(prompt) {
    if (!this.deepseek) {
      // Fallback to simple keyword-based intent detection
      const lower = prompt.toLowerCase();
      let type = 'generic';

      if (lower.includes('component') || lower.includes('button') || lower.includes('input')) {
        type = 'component';
      } else if (lower.includes('dashboard') || lower.includes('chart')) {
        type = 'dashboard';
      } else if (lower.includes('service') || lower.includes('api')) {
        type = 'service';
      } else if (lower.includes('workflow')) {
        type = 'workflow';
      }

      return {
        type,
        entities: { name: 'unknown', purpose: prompt },
        requirements: [],
        confidence: 0.5,
      };
    }

    const systemPrompt = `You are an AI workflow analyzer. Analyze user prompts and extract:
1. Intent type: component, dashboard, service, workflow, or generic
2. Key entities and parameters
3. Requirements and constraints

Respond with JSON only.`;

    const userPrompt = `Analyze this prompt and extract the intent:

"${prompt}"

Return JSON with:
{
  "type": "component|dashboard|service|workflow|generic",
  "entities": {
    "name": "extracted name",
    "purpose": "what it should do",
    "features": ["feature1", "feature2"]
  },
  "requirements": ["req1", "req2"],
  "confidence": 0.0-1.0
}`;

    try {
      const response = await this.deepseek.chat(userPrompt, {
        system: systemPrompt,
        temperature: 0.3,
        max_tokens: 1000,
      });

      // Extract JSON from response
      let content = response.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback to simple parsing
      return {
        type: 'generic',
        entities: { name: 'unknown', purpose: prompt },
        requirements: [],
        confidence: 0.5,
      };
    } catch (error) {
      console.warn('Intent analysis failed, using fallback:', error.message);
      return {
        type: 'generic',
        entities: { name: 'unknown', purpose: prompt },
        requirements: [],
        confidence: 0.3,
      };
    }
  }

  /**
   * Generate configuration from intent
   */
  async generateConfig(intent, options = {}) {
    const systemPrompt = `You are a configuration generator. Create detailed configurations for:
- React components (atomic design)
- Dashboards (layouts, widgets, data sources)
- Services (APIs, workflows, integrations)
- Workflows (steps, handlers, triggers)

Return valid JSON configurations.`;

    const userPrompt = `Generate a configuration for:

Intent Type: ${intent.type}
Entity: ${JSON.stringify(intent.entities, null, 2)}
Requirements: ${intent.requirements.join(', ')}

For type "${intent.type}", generate a complete configuration with all necessary details.

Return JSON only.`;

    try {
      const response = await this.deepseek.chat(userPrompt, {
        system: systemPrompt,
        temperature: 0.5,
        max_tokens: 2000,
      });

      let content = response.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const config = JSON.parse(jsonMatch[0]);
        config.type = intent.type;
        config.generatedFrom = intent;
        return config;
      }

      // Fallback config
      return this.generateFallbackConfig(intent);
    } catch (error) {
      console.warn('Config generation failed, using fallback:', error.message);
      return this.generateFallbackConfig(intent);
    }
  }

  /**
   * Execute component generation workflow
   */
  async executeComponentWorkflow(config, options = {}) {
    console.log('   Creating component schema...');

    const componentName = config.name || config.entities?.name || 'GeneratedComponent';
    const componentSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebComponent',
      '@id': `lightdom:${componentName.toLowerCase()}`,
      name: componentName,
      description: config.description || config.entities?.purpose || 'AI-generated component',
      'lightdom:componentType': config.componentType || 'molecule',
      'lightdom:reactComponent': componentName,
      'lightdom:category': config.category || 'generated',
      'lightdom:props': config.props || [],
      'lightdom:semanticMeaning': config.entities?.purpose || config.description,
    };

    // Save schema
    const schemaPath = path.join(
      './schemas/components/generated',
      `${componentName.toLowerCase()}.json`
    );
    await fs.mkdir(path.dirname(schemaPath), { recursive: true });
    await fs.writeFile(schemaPath, JSON.stringify(componentSchema, null, 2));

    // Generate component
    console.log('   Generating component files...');
    const result = await this.componentGenerator.generateComponent(componentName, {
      useAI: true,
      ...options,
    });

    return {
      type: 'component',
      componentName,
      schemaPath,
      files: result.files,
      success: true,
    };
  }

  /**
   * Execute dashboard generation workflow
   */
  async executeDashboardWorkflow(config, options = {}) {
    console.log('   Creating dashboard configuration...');

    const dashboardName = config.name || 'GeneratedDashboard';
    const dashboardConfig = {
      name: dashboardName,
      layout: config.layout || 'grid',
      sections: config.sections || [],
      widgets: config.widgets || [],
      dataSources: config.dataSources || [],
    };

    // Generate dashboard component
    const dashboardSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `lightdom:dashboard-${dashboardName.toLowerCase()}`,
      name: dashboardName,
      description: config.description || 'AI-generated dashboard',
      'lightdom:componentType': 'page',
      'lightdom:reactComponent': `${dashboardName}Dashboard`,
      'lightdom:category': 'dashboard',
      'lightdom:config': dashboardConfig,
    };

    const schemaPath = path.join(
      './schemas/components/generated',
      `${dashboardName.toLowerCase()}-dashboard.json`
    );
    await fs.writeFile(schemaPath, JSON.stringify(dashboardSchema, null, 2));

    return {
      type: 'dashboard',
      dashboardName,
      config: dashboardConfig,
      schemaPath,
      success: true,
    };
  }

  /**
   * Execute service generation workflow
   */
  async executeServiceWorkflow(config, options = {}) {
    console.log('   Creating service configuration...');

    const serviceName = config.name || 'GeneratedService';
    const serviceConfig = {
      name: serviceName,
      type: config.serviceType || 'api',
      endpoints: config.endpoints || [],
      handlers: config.handlers || [],
      database: config.database || null,
      dependencies: config.dependencies || [],
    };

    // Generate service template
    const serviceTemplate = this.generateServiceTemplate(serviceConfig);

    const servicePath = path.join(
      './services/generated',
      `${serviceName.toLowerCase()}-service.js`
    );
    await fs.mkdir(path.dirname(servicePath), { recursive: true });
    await fs.writeFile(servicePath, serviceTemplate);

    return {
      type: 'service',
      serviceName,
      config: serviceConfig,
      servicePath,
      success: true,
    };
  }

  /**
   * Execute custom workflow
   */
  async executeCustomWorkflow(config, options = {}) {
    console.log('   Executing custom workflow...');

    const workflowName = config.name || 'GeneratedWorkflow';
    const workflowConfig = {
      id: `workflow-${workflowName.toLowerCase()}`,
      name: workflowName,
      description: config.description,
      tasks: config.tasks || [],
      triggers: config.triggers || [],
      config: config.workflowConfig || {},
    };

    const workflowPath = path.join(this.config.workflowsDir, `${workflowName.toLowerCase()}.json`);
    await fs.writeFile(workflowPath, JSON.stringify(workflowConfig, null, 2));

    return {
      type: 'workflow',
      workflowName,
      config: workflowConfig,
      workflowPath,
      success: true,
    };
  }

  /**
   * Execute generic workflow
   */
  async executeGenericWorkflow(config, options = {}) {
    console.log('   Executing generic workflow...');

    // Save configuration for manual review
    const configPath = path.join(this.config.workflowsDir, `generic-${Date.now()}.json`);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    return {
      type: 'generic',
      config,
      configPath,
      message: 'Configuration saved for manual review',
      success: true,
    };
  }

  /**
   * Generate fallback configuration
   */
  generateFallbackConfig(intent) {
    return {
      type: intent.type,
      name: intent.entities?.name || 'Unknown',
      description: intent.entities?.purpose || 'No description',
      generatedFrom: intent,
      fallback: true,
    };
  }

  /**
   * Generate service template
   */
  generateServiceTemplate(config) {
    return `#!/usr/bin/env node

/**
 * ${config.name} Service
 * 
 * Auto-generated service
 * Type: ${config.type}
 */

import { EventEmitter } from 'events';

export class ${config.name} extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
  }

  async initialize() {
    console.log('🚀 Initializing ${config.name}...');
    // TODO: Add initialization logic
  }

  async execute() {
    // TODO: Add execution logic
  }

  async cleanup() {
    // TODO: Add cleanup logic
  }
}

// CLI support
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  const service = new ${config.name}();
  await service.initialize();
  await service.execute();
  await service.cleanup();
}
`;
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId) {
    return (
      this.activeWorkflows.get(workflowId) || this.workflowHistory.find(w => w.id === workflowId)
    );
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows() {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Get workflow history
   */
  getWorkflowHistory(limit = 10) {
    return this.workflowHistory.slice(-limit);
  }

  /**
   * Cleanup
   */
  async cleanup() {
    if (this.componentGenerator) {
      await this.componentGenerator.cleanup();
    }
    this.activeWorkflows.clear();
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new AgentWorkflowOrchestrator();
  await orchestrator.initialize();

  const prompt = process.argv.slice(2).join(' ');

  if (!prompt) {
    console.log('Usage: node agent-workflow-orchestrator.js <prompt>');
    console.log('\nExamples:');
    console.log(
      '  node agent-workflow-orchestrator.js "Create a button component with primary and secondary variants"'
    );
    console.log('  node agent-workflow-orchestrator.js "Generate a dashboard for user analytics"');
    console.log(
      '  node agent-workflow-orchestrator.js "Create a service for managing user authentication"'
    );
    process.exit(1);
  }

  try {
    const result = await orchestrator.executeFromPrompt(prompt);
    console.log('\n📋 Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }

  await orchestrator.cleanup();
  process.exit(0);
}
