/**
 * DeepSeek Finetuning Pipeline Unit Tests
 * Tests for all 4 phases of the finetuning pipeline
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the file system and crypto modules
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    access: vi.fn(),
  },
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  access: vi.fn(),
}));

vi.mock('crypto', () => ({
  default: {
    randomUUID: vi.fn(() => '12345678-1234-1234-1234-123456789012'),
  },
  randomUUID: vi.fn(() => '12345678-1234-1234-1234-123456789012'),
}));

// Import after mocks
import {
  TrainingDataCollectionPipeline,
  DataQualityScorer,
  ToolUseTrainingGenerator,
  ValidationDatasetBuilder,
  QLoRATrainingConfig,
  EvaluationMetrics,
  ModelIntegrationService,
  ModelVersionControl,
  ProductionDeploymentManager,
  ContinuousTrainingPipeline,
  DeepSeekFinetuningPipeline,
} from '../../services/deepseek-finetuning-pipeline.js';

describe('Phase 1: Data Infrastructure', () => {
  describe('TrainingDataCollectionPipeline', () => {
    let pipeline: TrainingDataCollectionPipeline;

    beforeEach(() => {
      pipeline = new TrainingDataCollectionPipeline({
        outputDir: './test_output',
        minQualityScore: 0.7,
        maxExamples: 1000,
      });
    });

    it('should initialize with default configuration', () => {
      const defaultPipeline = new TrainingDataCollectionPipeline();
      expect(defaultPipeline.config.outputDir).toBe('./training_data/collected');
      expect(defaultPipeline.config.minQualityScore).toBe(0.7);
      expect(defaultPipeline.config.maxExamples).toBe(10000);
    });

    it('should initialize with custom configuration', () => {
      expect(pipeline.config.outputDir).toBe('./test_output');
      expect(pipeline.config.minQualityScore).toBe(0.7);
      expect(pipeline.config.maxExamples).toBe(1000);
    });

    it('should collect from API logs', () => {
      const logs = [
        {
          systemPrompt: 'You are a helpful assistant.',
          request: 'What is 2+2?',
          response: 'The answer is 4.',
          timestamp: '2024-01-01T00:00:00Z',
          latency: 100,
        },
      ];

      const result = pipeline.collectFromApiLogs(logs);

      expect(result).toHaveLength(1);
      expect(result[0].messages).toHaveLength(3);
      expect(result[0].messages[0].role).toBe('system');
      expect(result[0].messages[1].role).toBe('user');
      expect(result[0].messages[2].role).toBe('assistant');
      expect(result[0].metadata.source).toBe('api_logs');
    });

    it('should collect from conversations', () => {
      const conversations = [
        {
          id: 'conv_1',
          messages: [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi there!' },
          ],
        },
      ];

      const result = pipeline.collectFromConversations(conversations);

      expect(result).toHaveLength(1);
      expect(result[0].messages).toHaveLength(2);
      expect(result[0].metadata.source).toBe('conversations');
      expect(result[0].metadata.id).toBe('conv_1');
    });

    it('should collect from tool interactions', () => {
      const interactions = [
        {
          systemPrompt: 'You are a tool-using assistant.',
          userRequest: 'Get the weather',
          toolCalls: [{ name: 'getWeather', arguments: { city: 'NYC' } }],
          toolResponses: [{ temperature: 72 }],
          finalResponse: 'The weather in NYC is 72°F.',
        },
      ];

      const result = pipeline.collectFromToolInteractions(interactions);

      expect(result).toHaveLength(1);
      expect(result[0].messages).toHaveLength(5); // system, user, assistant (tool call), tool response, assistant (final)
      expect(result[0].metadata.tools_used).toContain('getWeather');
    });
  });

  describe('DataQualityScorer', () => {
    let scorer: DataQualityScorer;

    beforeEach(() => {
      scorer = new DataQualityScorer();
    });

    it('should initialize with default weights', () => {
      expect(scorer.config.weights.completeness).toBe(0.25);
      expect(scorer.config.weights.format).toBe(0.20);
      expect(scorer.config.weights.length).toBe(0.20);
      expect(scorer.config.weights.toolUsage).toBe(0.20);
      expect(scorer.config.weights.diversity).toBe(0.15);
    });

    it('should score completeness correctly', () => {
      const completeExample = {
        messages: [
          { role: 'system', content: 'You are helpful.' },
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi!' },
        ],
      };

      const incompleteExample = {
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const completeScore = scorer.scoreCompleteness(completeExample);
      const incompleteScore = scorer.scoreCompleteness(incompleteExample);

      expect(completeScore).toBe(1.0);
      expect(incompleteScore).toBe(0.35);
    });

    it('should score format correctly', () => {
      const validExample = {
        messages: [
          { role: 'system', content: 'System prompt' },
          { role: 'user', content: 'User message' },
          { role: 'assistant', content: 'Assistant response' },
        ],
      };

      const formatScore = scorer.scoreFormat(validExample);
      expect(formatScore).toBe(1.0);
    });

    it('should score length correctly', () => {
      const optimalExample = {
        messages: [
          { role: 'system', content: 'A'.repeat(100) },
          { role: 'user', content: 'B'.repeat(100) },
          { role: 'assistant', content: 'C'.repeat(100) },
        ],
      };

      const lengthScore = scorer.scoreLength(optimalExample);
      expect(lengthScore).toBe(1.0);
    });

    it('should score tool usage correctly', () => {
      const toolExample = {
        messages: [
          { role: 'user', content: 'Use a tool' },
          {
            role: 'assistant',
            content: null,
            tool_calls: [{ id: '1', type: 'function', function: { name: 'test' } }],
          },
          { role: 'tool', tool_call_id: '1', content: 'result' },
          { role: 'assistant', content: 'Done!' },
        ],
      };

      const toolScore = scorer.scoreToolUsage(toolExample);
      expect(toolScore).toBe(1.0);
    });

    it('should score entire dataset', () => {
      const examples = [
        {
          messages: [
            { role: 'system', content: 'System' },
            { role: 'user', content: 'User message with some length' },
            { role: 'assistant', content: 'Assistant response with content' },
          ],
        },
        {
          messages: [
            { role: 'user', content: 'Short' },
            { role: 'assistant', content: 'Reply' },
          ],
        },
      ];

      const report = scorer.scoreDataset(examples);

      expect(report.totalExamples).toBe(2);
      expect(report.distribution).toBeDefined();
      expect(report.averageScore).toBeGreaterThan(0);
    });

    it('should filter examples by quality', () => {
      const examples = [
        {
          messages: [
            { role: 'system', content: 'System' },
            { role: 'user', content: 'Good quality message with reasonable length' },
            { role: 'assistant', content: 'Good quality response with reasonable length' },
          ],
        },
        {
          messages: [{ role: 'user', content: 'x' }],
        },
      ];

      const filtered = scorer.filterByQuality(examples, 0.5);
      expect(filtered.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('ToolUseTrainingGenerator', () => {
    let generator: ToolUseTrainingGenerator;

    beforeEach(() => {
      generator = new ToolUseTrainingGenerator([
        { name: 'mineAttribute', description: 'Extract data' },
        { name: 'generateSchema', description: 'Generate schemas' },
      ]);
    });

    it('should generate mining examples', () => {
      const examples = generator.generateMiningExamples();
      expect(examples.length).toBeGreaterThan(0);
      expect(examples[0].messages).toBeDefined();
    });

    it('should generate schema examples', () => {
      const examples = generator.generateSchemaExamples();
      expect(examples.length).toBeGreaterThan(0);
    });

    it('should generate workflow examples', () => {
      const examples = generator.generateWorkflowExamples();
      expect(examples.length).toBeGreaterThan(0);
    });

    it('should generate error handling examples', () => {
      const examples = generator.generateErrorHandlingExamples();
      expect(examples.length).toBeGreaterThan(0);
    });

    it('should generate example from scenario', () => {
      const scenario = {
        userRequest: 'Test request',
        toolCalls: [{ name: 'testTool', arguments: { arg: 'value' } }],
        toolResponses: [{ result: 'success' }],
        finalResponse: 'Completed.',
      };

      const example = generator.generateExample(scenario);
      expect(example.messages).toBeDefined();
      expect(example.messages.length).toBeGreaterThan(0);
    });
  });

  describe('ValidationDatasetBuilder', () => {
    let builder: ValidationDatasetBuilder;

    beforeEach(() => {
      builder = new ValidationDatasetBuilder({ splitRatio: 0.2 });
    });

    it('should split dataset correctly', () => {
      const examples = Array(100).fill(null).map((_, i) => ({
        messages: [
          { role: 'user', content: `Message ${i}` },
          { role: 'assistant', content: `Response ${i}` },
        ],
      }));

      const { train, validation } = builder.splitDataset(examples);

      expect(train.length + validation.length).toBe(100);
      expect(validation.length).toBe(20); // 20% for validation
      expect(train.length).toBe(80);
    });

    it('should create validation dataset with test cases', () => {
      const examples = Array(50).fill(null).map((_, i) => ({
        messages: [
          { role: 'user', content: `Message ${i}` },
          { role: 'assistant', content: `Response ${i}` },
        ],
      }));

      const testCases = [
        { messages: [{ role: 'user', content: 'Test case 1' }] },
        { messages: [{ role: 'user', content: 'Test case 2' }] },
      ];

      const datasets = builder.createValidationDataset(examples, testCases);

      expect(datasets.stats.testCasesAdded).toBe(2);
      expect(datasets.validation.length).toBeGreaterThan(datasets.train.length * 0.1);
    });
  });
});

describe('Phase 2: Local Training Setup', () => {
  describe('QLoRATrainingConfig', () => {
    let config: QLoRATrainingConfig;

    beforeEach(() => {
      config = new QLoRATrainingConfig({
        baseModel: 'deepseek-ai/deepseek-coder-7b-instruct-v1.5',
        loraRank: 16,
        loraAlpha: 32,
        epochs: 3,
      });
    });

    it('should initialize with correct configuration', () => {
      expect(config.config.baseModel).toBe('deepseek-ai/deepseek-coder-7b-instruct-v1.5');
      expect(config.config.loraRank).toBe(16);
      expect(config.config.loraAlpha).toBe(32);
      expect(config.config.epochs).toBe(3);
      expect(config.config.load4bit).toBe(true);
    });

    it('should generate training script', () => {
      const script = config.generateTrainingScript();

      expect(script).toContain('deepseek-ai/deepseek-coder-7b-instruct-v1.5');
      expect(script).toContain('r=16');
      expect(script).toContain('lora_alpha=32');
      expect(script).toContain('num_train_epochs=3');
      expect(script).toContain('BitsAndBytesConfig');
      expect(script).toContain('LoraConfig');
    });

    it('should generate requirements.txt', () => {
      const requirements = config.generateRequirements();

      expect(requirements).toContain('torch');
      expect(requirements).toContain('transformers');
      expect(requirements).toContain('peft');
      expect(requirements).toContain('bitsandbytes');
    });
  });

  describe('EvaluationMetrics', () => {
    let metrics: EvaluationMetrics;

    beforeEach(() => {
      metrics = new EvaluationMetrics();
    });

    it('should calculate perplexity from loss', () => {
      const perplexity = metrics.calculatePerplexity(2.0);
      expect(perplexity).toBeCloseTo(Math.exp(2.0), 2);
    });

    it('should evaluate tool accuracy', () => {
      const predictions = [
        { tool: 'tool1' },
        { tool: 'tool2' },
        { tool: 'tool1' },
      ];
      const references = [
        { tool: 'tool1' },
        { tool: 'tool2' },
        { tool: 'tool3' },
      ];

      const accuracy = metrics.evaluateToolAccuracy(predictions, references);
      expect(accuracy).toBeCloseTo(0.667, 2);
    });

    it('should evaluate response quality', () => {
      const response = 'This is a test response with some content.';
      const reference = 'This is a reference response with some content.';

      const quality = metrics.evaluateResponseQuality(response, reference);
      expect(quality).toBeGreaterThan(0);
      expect(quality).toBeLessThanOrEqual(1);
    });

    it('should generate evaluation report', () => {
      const results = [
        { perplexity: 2.5, toolAccuracy: 0.9, quality: 0.8, latency: 100 },
        { perplexity: 2.3, toolAccuracy: 0.85, quality: 0.85, latency: 110 },
      ];

      const report = metrics.generateReport(results);

      expect(report.summary).toBeDefined();
      expect(report.summary.totalEvaluations).toBe(2);
      expect(report.summary.averagePerplexity).toBeCloseTo(2.4, 1);
      expect(report.distribution).toBeDefined();
    });
  });
});

describe('Phase 3: Integration', () => {
  describe('ModelIntegrationService', () => {
    let service: ModelIntegrationService;

    beforeEach(() => {
      service = new ModelIntegrationService({
        baseEndpoint: 'http://localhost:8000',
      });
    });

    it('should register a model', () => {
      service.registerModel('model-v1', { type: 'deepseek' });

      const model = service.getModel('model-v1');
      expect(model).toBeDefined();
      expect(model?.status).toBe('registered');
    });

    it('should create A/B test', () => {
      service.registerModel('model-v1', { type: 'baseline' });
      service.registerModel('model-v2', { type: 'new' });

      const test = service.createABTest('test1', {
        modelA: 'model-v1',
        modelB: 'model-v2',
        trafficSplit: 0.5,
      });

      expect(test.id).toBe('test1');
      expect(test.status).toBe('active');
    });

    it('should route requests for A/B test', () => {
      service.registerModel('model-v1', { type: 'baseline' });
      service.registerModel('model-v2', { type: 'new' });
      service.createABTest('test1', {
        modelA: 'model-v1',
        modelB: 'model-v2',
        trafficSplit: 0.5,
      });

      // Run multiple routings to test distribution
      const routings = Array(100).fill(null).map(() => service.routeRequest('test1'));
      const modelACount = routings.filter(r => r === 'model-v1').length;
      const modelBCount = routings.filter(r => r === 'model-v2').length;

      // Should be roughly 50/50
      expect(modelACount).toBeGreaterThan(20);
      expect(modelBCount).toBeGreaterThan(20);
    });

    it('should record A/B test results', () => {
      service.registerModel('model-v1', { type: 'baseline' });
      service.registerModel('model-v2', { type: 'new' });
      service.createABTest('test1', {
        modelA: 'model-v1',
        modelB: 'model-v2',
        trafficSplit: 0.5,
      });

      service.recordResult('test1', 'model-v1', true, 100);
      service.recordResult('test1', 'model-v2', true, 90);

      const results = service.getABTestResults('test1');
      expect(results).toBeDefined();
      expect(results?.modelA.metrics.requests).toBe(1);
      expect(results?.modelB.metrics.requests).toBe(1);
    });
  });

  describe('ModelVersionControl', () => {
    let versionControl: ModelVersionControl;

    beforeEach(() => {
      versionControl = new ModelVersionControl({
        storageDir: './test_models',
      });
    });

    it('should register a version', async () => {
      const version = await versionControl.registerVersion('mymodel', 'v1.0.0', {
        trainedOn: '2024-01-01',
      });

      expect(version.id).toBe('mymodel@v1.0.0');
      expect(version.status).toBe('registered');
    });

    it('should list versions for a model', async () => {
      await versionControl.registerVersion('mymodel', 'v1.0.0', {});
      await versionControl.registerVersion('mymodel', 'v1.1.0', {});

      const versions = versionControl.listVersions('mymodel');
      expect(versions).toHaveLength(2);
    });

    it('should get latest version', async () => {
      await versionControl.registerVersion('mymodel', 'v1.0.0', {});
      await versionControl.registerVersion('mymodel', 'v1.1.0', {});

      const latest = versionControl.getLatestVersion('mymodel');
      expect(latest?.version).toBe('v1.1.0');
    });

    it('should promote version to production', async () => {
      await versionControl.registerVersion('mymodel', 'v1.0.0', {});

      const promoted = await versionControl.promoteToProduction('mymodel', 'v1.0.0');
      expect(promoted.status).toBe('production');
    });
  });
});

describe('Phase 4: Production', () => {
  describe('ProductionDeploymentManager', () => {
    let manager: ProductionDeploymentManager;

    beforeEach(() => {
      manager = new ProductionDeploymentManager({
        environment: 'test',
      });
    });

    afterEach(() => {
      // Clean up any running health checks
      manager.listDeployments().forEach(d => {
        manager.stopHealthCheck(d.id);
      });
    });

    it('should deploy a model', async () => {
      const deployment = await manager.deploy('model@v1.0.0', {
        replicas: 2,
      });

      expect(deployment.status).toBe('deployed');
      expect(deployment.health).toBe('healthy');
      manager.stopHealthCheck(deployment.id);
    });

    it('should list deployments', async () => {
      const deployment = await manager.deploy('model@v1.0.0', {});
      const deployments = manager.listDeployments();

      expect(deployments).toHaveLength(1);
      expect(deployments[0].id).toBe(deployment.id);
      manager.stopHealthCheck(deployment.id);
    });

    it('should rollback deployment', async () => {
      const deployment = await manager.deploy('model@v1.0.0', {});
      const rolledBack = await manager.rollback(deployment.id);

      expect(rolledBack.status).toBe('rolled_back');
    });
  });

  describe('ContinuousTrainingPipeline', () => {
    let pipeline: ContinuousTrainingPipeline;

    beforeEach(() => {
      pipeline = new ContinuousTrainingPipeline({
        triggerThreshold: 10,
      });
    });

    it('should add examples', () => {
      pipeline.addExample({ messages: [{ role: 'user', content: 'Test' }] });

      const status = pipeline.getStatus();
      expect(status.pendingExamples).toBe(1);
    });

    it('should track when ready for training', () => {
      // Add 10 examples to reach threshold
      for (let i = 0; i < 10; i++) {
        pipeline.addExample({ messages: [{ role: 'user', content: `Test ${i}` }] });
      }

      const status = pipeline.getStatus();
      expect(status.readyForTraining).toBe(true);
    });

    it('should trigger training', async () => {
      for (let i = 0; i < 5; i++) {
        pipeline.addExample({ messages: [{ role: 'user', content: `Test ${i}` }] });
      }

      const result = await pipeline.triggerTraining();
      expect(result.status).toBe('started');
      expect(result.examples).toHaveLength(5);
    });
  });
});

describe('DeepSeekFinetuningPipeline (Main Orchestrator)', () => {
  let pipeline: DeepSeekFinetuningPipeline;

  beforeEach(() => {
    pipeline = new DeepSeekFinetuningPipeline({
      outputDir: './test_pipeline_output',
    });
  });

  afterEach(() => {
    // Clean up any running processes
    pipeline.deploymentManager.listDeployments().forEach(d => {
      pipeline.deploymentManager.stopHealthCheck(d.id);
    });
  });

  it('should initialize all phase components', () => {
    expect(pipeline.dataCollector).toBeDefined();
    expect(pipeline.qualityScorer).toBeDefined();
    expect(pipeline.toolGenerator).toBeDefined();
    expect(pipeline.validationBuilder).toBeDefined();
    expect(pipeline.trainingConfig).toBeDefined();
    expect(pipeline.evaluationMetrics).toBeDefined();
    expect(pipeline.modelIntegration).toBeDefined();
    expect(pipeline.versionControl).toBeDefined();
    expect(pipeline.deploymentManager).toBeDefined();
    expect(pipeline.continuousTraining).toBeDefined();
  });

  it('should run Phase 1 successfully', async () => {
    const result = await pipeline.runPhase1([]);
    expect(result.phase).toBe(1);
    expect(result.qualityReport).toBeDefined();
    expect(result.datasets).toBeDefined();
  });

  it('should run Phase 2 successfully', async () => {
    const result = await pipeline.runPhase2();
    expect(result.phase).toBe(2);
    expect(result.trainingDir).toBeDefined();
    expect(result.config).toBeDefined();
  });
});
