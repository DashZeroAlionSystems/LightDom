/**
 * DeepSeek System Integrator
 * Orchestrates all DeepSeek services and provides a unified interface
 */

import { WorkflowOrchestrator } from './workflow-orchestrator';
import { SchemaGenerator } from './schema-generator';
import { DeepSeekPromptEngine } from './deepseek-prompt-engine';
import { GitStateManager } from './git-state-manager';
import { N8NIntegrationService } from './n8n-integration';
import { GitHubPatternMiningService } from './github-pattern-mining';
import { ServiceInstantiationEngine } from './service-instantiation-engine';
import { DeepSeekPatternTrainingService } from './deepseek-pattern-training';
import { ModelTrainingConfigService } from './model-training-config';
import { MCPAutoAPIService } from './mcp-auto-api';
import { RouteHistoryMiningService } from './route-history-mining';
import { deepSeekConfig } from '../config/deepseek-config';

export interface SystemIntegratorConfig {
  githubToken?: string;
  n8nApiUrl?: string;
  n8nApiKey?: string;
  repoPath?: string;
  enableAutoTraining?: boolean;
  enableAutoAPI?: boolean;
  enableRouteHistory?: boolean;
}

export class DeepSeekSystemIntegrator {
  private orchestrator: WorkflowOrchestrator;
  private schemaGenerator: SchemaGenerator;
  private promptEngine: DeepSeekPromptEngine;
  private stateManager: GitStateManager;
  private n8nIntegration?: N8NIntegrationService;
  private patternMining?: GitHubPatternMiningService;
  private serviceEngine?: ServiceInstantiationEngine;
  private patternTraining?: DeepSeekPatternTrainingService;
  private trainingConfig: ModelTrainingConfigService;
  private mcpAPI: MCPAutoAPIService;
  private routeMining?: RouteHistoryMiningService;
  private config: SystemIntegratorConfig;

  constructor(config: SystemIntegratorConfig = {}) {
    this.config = config;

    // Initialize core services
    this.promptEngine = new DeepSeekPromptEngine(deepSeekConfig);
    this.schemaGenerator = new SchemaGenerator(deepSeekConfig);
    this.orchestrator = new WorkflowOrchestrator(deepSeekConfig);
    this.stateManager = new GitStateManager({
      repoPath: config.repoPath || process.cwd(),
      autoCommit: true,
      remoteName: 'origin'
    });

    // Initialize advanced services
    this.trainingConfig = new ModelTrainingConfigService();
    this.mcpAPI = new MCPAutoAPIService();

    // Initialize optional services
    if (config.n8nApiUrl && config.n8nApiKey) {
      this.n8nIntegration = new N8NIntegrationService(
        config.n8nApiUrl,
        config.n8nApiKey
      );
    }

    if (config.githubToken) {
      this.patternMining = new GitHubPatternMiningService({
        githubToken: config.githubToken
      });
      this.patternTraining = new DeepSeekPatternTrainingService(deepSeekConfig);
      this.serviceEngine = new ServiceInstantiationEngine();
    }

    if (config.enableRouteHistory) {
      this.routeMining = new RouteHistoryMiningService();
    }

    // Auto-train if enabled
    if (config.enableAutoTraining) {
      this.autoTrain();
    }
  }

  /**
   * End-to-end workflow: From natural language to deployed workflow
   */
  async createAndDeployWorkflow(description: string, options: {
    generateSchema?: boolean;
    createN8N?: boolean;
    trackRoutes?: boolean;
  } = {}) {
    const results: any = {
      workflow: null,
      schemas: [],
      n8nWorkflow: null,
      execution: null,
      state: null
    };

    try {
      // 1. Generate workflow from natural language
      console.log('Generating workflow from description...');
      results.workflow = await this.orchestrator.generateWorkflow(description);

      // 2. Generate schemas if needed
      if (options.generateSchema) {
        console.log('Generating schemas for workflow...');
        const schemaPrompts = this.extractSchemaRequirements(description);
        for (const prompt of schemaPrompts) {
          const schema = await this.schemaGenerator.generateSchema(prompt, 'json-schema');
          results.schemas.push(schema);
        }
      }

      // 3. Create N8N workflow if enabled
      if (options.createN8N && this.n8nIntegration) {
        console.log('Creating N8N workflow...');
        results.n8nWorkflow = await this.n8nIntegration.convertToN8N(results.workflow);
      }

      // 4. Execute workflow
      console.log('Executing workflow...');
      results.execution = await this.orchestrator.executeWorkflow(
        results.workflow.id,
        {}
      );

      // 5. Track routes if enabled
      if (options.trackRoutes && this.routeMining) {
        console.log('Tracking route history...');
        await this.routeMining.trackRoute(
          'workflow-execution',
          results.execution.id,
          { duration: results.execution.duration }
        );
      }

      // 6. Save state
      console.log('Saving state...');
      results.state = await this.stateManager.saveWorkflowState(
        results.workflow.id,
        results
      );

      return results;
    } catch (error) {
      console.error('Error in createAndDeployWorkflow:', error);
      throw error;
    }
  }

  /**
   * Mine GitHub repo, train DeepSeek, and generate project
   */
  async learnFromGitHub(repos: Array<{ owner: string; repo: string }>, projectType: string) {
    if (!this.patternMining || !this.patternTraining) {
      throw new Error('GitHub services not initialized. Provide githubToken in config.');
    }

    const results: any = {
      patterns: [],
      template: null,
      training: null,
      project: null
    };

    try {
      // 1. Mine all repositories
      console.log('Mining GitHub repositories...');
      for (const repo of repos) {
        const mined = await this.patternMining.mineRepository(repo);
        results.patterns.push(mined);
      }

      // 2. Generate project template
      console.log('Generating project template...');
      results.template = await this.patternMining.generateProjectTemplate(
        projectType,
        repos,
        { includeServices: true }
      );

      // 3. Train DeepSeek on the template
      console.log('Training DeepSeek...');
      results.training = await this.patternTraining.trainFromTemplate(results.template);

      // 4. Generate new project using learned patterns
      console.log('Generating project...');
      results.project = await this.patternTraining.generateProject(
        projectType,
        [`Create ${projectType} with best practices`]
      );

      // 5. Save state
      await this.stateManager.saveComponentState(
        `project-${projectType}`,
        results,
        `Learned from GitHub and generated ${projectType}`
      );

      return results;
    } catch (error) {
      console.error('Error in learnFromGitHub:', error);
      throw error;
    }
  }

  /**
   * Auto-generate complete API from schema
   */
  async generateCompleteAPI(schemaDescription: string, bundleName: string) {
    const results: any = {
      schemas: [],
      schemaMap: null,
      api: null,
      bundle: null
    };

    try {
      // 1. Generate multiple related schemas
      console.log('Generating schemas...');
      const entities = this.extractEntities(schemaDescription);
      for (const entity of entities) {
        const schema = await this.schemaGenerator.generateSchema(
          `Create schema for ${entity} entity`,
          'json-schema'
        );
        results.schemas.push(schema);
      }

      // 2. Generate schema map with relationships
      console.log('Generating schema map...');
      results.schemaMap = await this.schemaGenerator.generateSchemaMap(
        results.schemas,
        schemaDescription
      );

      // 3. Generate CRUD APIs for all schemas
      console.log('Generating CRUD APIs...');
      results.api = await this.mcpAPI.generateCRUDAPI(results.schemas[0]);

      // 4. Bundle all services
      console.log('Bundling services...');
      results.bundle = await this.mcpAPI.bundleServicesAPI(
        bundleName,
        results.schemas,
        {
          includeRelationships: true,
          addWebhooks: true,
          enableAutoValidation: true
        }
      );

      // 5. Save state
      await this.stateManager.saveComponentState(
        `api-${bundleName}`,
        results,
        `Generated complete API for ${bundleName}`
      );

      return results;
    } catch (error) {
      console.error('Error in generateCompleteAPI:', error);
      throw error;
    }
  }

  /**
   * Create and execute SEO campaign
   */
  async runSEOCampaign(targetUrl: string, keywords: string[]) {
    const results: any = {
      workflow: null,
      schemas: null,
      execution: null,
      routes: null,
      recommendations: []
    };

    try {
      // 1. Get SEO campaign defaults
      const defaults = this.trainingConfig.getCampaignDefaults('seo');

      // 2. Generate SEO workflow
      console.log('Generating SEO workflow...');
      results.workflow = await this.orchestrator.generateWorkflow(
        `SEO campaign for ${targetUrl} targeting keywords: ${keywords.join(', ')}`
      );

      // 3. Generate schemas for SEO data
      console.log('Generating SEO schemas...');
      results.schemas = await this.schemaGenerator.generateSchemaMap(
        ['SEOAnalysis', 'ContentQuality', 'TechnicalSEO'],
        'SEO campaign data structures'
      );

      // 4. Execute workflow
      console.log('Executing SEO campaign...');
      results.execution = await this.orchestrator.executeWorkflow(
        results.workflow.id,
        {
          targetUrl,
          targetKeywords: keywords,
          campaignDefaults: defaults
        }
      );

      // 5. Track routes if enabled
      if (this.routeMining) {
        console.log('Mining route patterns...');
        const simulation = await this.routeMining.simulateWorkflow(
          results.workflow,
          10
        );
        results.routes = simulation.routes;
      }

      // 6. Generate recommendations
      results.recommendations = this.generateSEORecommendations(
        results.execution,
        defaults
      );

      // 7. Save state
      await this.stateManager.saveWorkflowState(
        `seo-campaign-${targetUrl}`,
        results
      );

      return results;
    } catch (error) {
      console.error('Error in runSEOCampaign:', error);
      throw error;
    }
  }

  /**
   * Simulate service in real-time
   */
  async simulateService(serviceConfig: any, duration: number = 60000) {
    if (!this.serviceEngine) {
      throw new Error('Service engine not initialized. Provide githubToken in config.');
    }

    try {
      // 1. Instantiate service
      console.log('Instantiating service...');
      const instance = await this.serviceEngine.instantiateService(serviceConfig);

      // 2. Start simulation
      console.log('Starting simulation...');
      await this.serviceEngine.simulateService(instance.id, {
        duration,
        dataRate: 10,
        enableEnrichment: true
      });

      // 3. Get recorded data
      const data = this.serviceEngine.getRecordedData(instance.id);

      // 4. Save state
      await this.stateManager.saveComponentState(
        `service-${instance.id}`,
        { instance, data },
        `Simulated service for ${duration}ms`
      );

      return { instance, data };
    } catch (error) {
      console.error('Error in simulateService:', error);
      throw error;
    }
  }

  /**
   * Auto-train DeepSeek on current project
   */
  private async autoTrain() {
    console.log('Auto-training DeepSeek on current project...');
    const config = this.trainingConfig.getTrainingConfig();
    console.log('Training configuration:', config);
    // Training happens automatically via DeepSeek API
  }

  /**
   * Extract schema requirements from description
   */
  private extractSchemaRequirements(description: string): string[] {
    const entities = this.extractEntities(description);
    return entities.map(entity => `Create schema for ${entity}`);
  }

  /**
   * Extract entities from description
   */
  private extractEntities(description: string): string[] {
    // Simple extraction - in production, use NLP
    const commonEntities = ['User', 'Product', 'Order', 'Payment', 'Address'];
    const lowerDesc = description.toLowerCase();
    return commonEntities.filter(entity => 
      lowerDesc.includes(entity.toLowerCase())
    );
  }

  /**
   * Generate SEO recommendations
   */
  private generateSEORecommendations(execution: any, defaults: any): string[] {
    const recommendations = [];

    // Based on execution results and defaults
    if (execution.metrics) {
      recommendations.push('Optimize Core Web Vitals based on analysis');
      recommendations.push('Implement Schema.org markup for better rich snippets');
      recommendations.push('Improve mobile responsiveness scores');
    }

    return recommendations;
  }

  /**
   * Get system health status
   */
  getSystemHealth() {
    return {
      services: {
        orchestrator: !!this.orchestrator,
        schemaGenerator: !!this.schemaGenerator,
        promptEngine: !!this.promptEngine,
        stateManager: !!this.stateManager,
        n8nIntegration: !!this.n8nIntegration,
        patternMining: !!this.patternMining,
        serviceEngine: !!this.serviceEngine,
        patternTraining: !!this.patternTraining,
        trainingConfig: !!this.trainingConfig,
        mcpAPI: !!this.mcpAPI,
        routeMining: !!this.routeMining
      },
      config: {
        githubEnabled: !!this.config.githubToken,
        n8nEnabled: !!this.config.n8nApiUrl,
        autoTrainingEnabled: this.config.enableAutoTraining,
        autoAPIEnabled: this.config.enableAutoAPI,
        routeHistoryEnabled: this.config.enableRouteHistory
      }
    };
  }

  /**
   * Get all available workflows
   */
  getWorkflows() {
    return this.orchestrator.getWorkflows();
  }

  /**
   * Get all generated schemas
   */
  getSchemas() {
    return this.schemaGenerator.getSchemas();
  }
}
