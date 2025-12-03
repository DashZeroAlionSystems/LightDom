/**
 * Integration tests for DeepSeek Finetuning API endpoints
 * Tests the complete pipeline from data collection to production deployment
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const TEST_OUTPUT_DIR = path.join(__dirname, '../../test_output');

describe('DeepSeek Finetuning API Integration Tests', () => {
  let testContext = {};

  beforeAll(async () => {
    // Ensure test output directory exists
    await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });
  });

  describe('Phase 1: Data Infrastructure', () => {
    test('should generate tool-use training examples', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/finetuning/data/generate-tool-examples`,
        {
          count: 5,
          types: ['mining', 'schema', 'workflow']
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.examples).toHaveLength(5);
      expect(response.data.examples[0]).toHaveProperty('messages');
      
      testContext.trainingExamples = response.data.examples;
    });

    test('should score data quality', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/finetuning/data/score`,
        {
          examples: testContext.trainingExamples
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('averageScore');
      expect(response.data.averageScore).toBeGreaterThanOrEqual(0);
      expect(response.data.averageScore).toBeLessThanOrEqual(1);
      expect(response.data.scores).toHaveLength(5);
    });

    test('should build validation dataset', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/finetuning/data/build-validation`,
        {
          examples: testContext.trainingExamples,
          splitRatio: 0.8
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('train');
      expect(response.data).toHaveProperty('validation');
      expect(response.data.train.length).toBeGreaterThan(0);
      expect(response.data.validation.length).toBeGreaterThan(0);
      
      testContext.validationDataset = response.data;
    });
  });

  describe('Phase 2: Local Training Setup', () => {
    test('should create QLoRA configuration', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/finetuning/training/qlora-config`,
        {
          baseModel: 'deepseek-ai/deepseek-coder-7b-instruct-v1.5',
          loraRank: 16,
          loraAlpha: 32,
          quantization: '4bit'
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.config).toHaveProperty('base_model');
      expect(response.data.config).toHaveProperty('lora_r');
      expect(response.data.config.lora_r).toBe(16);
      expect(response.data.config.load_in_4bit).toBe(true);
      
      testContext.qloraConfig = response.data.config;
    });

    test('should generate training script', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/finetuning/training/generate-script`,
        {
          config: testContext.qloraConfig,
          outputPath: path.join(TEST_OUTPUT_DIR, 'train_test.py')
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('script');
      expect(response.data.script).toContain('transformers');
      expect(response.data.script).toContain('peft');
      expect(response.data.script).toContain('QLoRA');
      
      // Verify script was written
      const scriptExists = await fs.access(
        path.join(TEST_OUTPUT_DIR, 'train_test.py')
      ).then(() => true).catch(() => false);
      
      expect(scriptExists).toBe(true);
    });

    test('should evaluate training metrics', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/finetuning/training/evaluate`,
        {
          predictions: ['test prediction 1', 'test prediction 2'],
          references: ['test reference 1', 'test reference 2']
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('perplexity');
      expect(response.data).toHaveProperty('toolAccuracy');
      expect(response.data).toHaveProperty('responseQuality');
    });
  });

  describe('Phase 3: Integration', () => {
    test('should register model version', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/finetuning/integration/register-model`,
        {
          name: 'test-model-v1.0.0',
          path: './models/test-model',
          metadata: {
            training_examples: 100,
            base_model: 'deepseek-coder-7b',
            lora_rank: 16
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('version');
      expect(response.data.version).toContain('test-model-v1.0.0');
      
      testContext.modelVersion = response.data.version;
    });

    test('should list registered models', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/finetuning/integration/models`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.models)).toBe(true);
      expect(response.data.models.length).toBeGreaterThan(0);
      
      const testModel = response.data.models.find(
        m => m.version === testContext.modelVersion
      );
      expect(testModel).toBeDefined();
    });

    test('should create A/B test', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/finetuning/integration/ab-test`,
        {
          modelA: 'base',
          modelB: testContext.modelVersion,
          trafficSplit: 0.5,
          metrics: ['accuracy', 'latency']
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('testId');
      expect(response.data.config.trafficSplit).toBe(0.5);
      
      testContext.abTestId = response.data.testId;
    });

    test('should record A/B test results', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/finetuning/integration/ab-test/${testContext.abTestId}/results`,
        {
          modelVersion: 'modelA',
          success: true,
          latency: 150,
          metadata: { request_id: 'test_123' }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    test('should get A/B test results', async () => {
      // Record a few more results
      for (let i = 0; i < 10; i++) {
        await axios.post(
          `${API_BASE_URL}/api/finetuning/integration/ab-test/${testContext.abTestId}/results`,
          {
            modelVersion: i % 2 === 0 ? 'modelA' : 'modelB',
            success: Math.random() > 0.1,
            latency: 100 + Math.random() * 100
          }
        );
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/finetuning/integration/ab-test/${testContext.abTestId}/results`
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('modelA');
      expect(response.data).toHaveProperty('modelB');
      expect(response.data.modelA.requests).toBeGreaterThan(0);
    });

    test('should promote model version', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/finetuning/integration/promote/${testContext.modelVersion}`
      );

      expect(response.status).toBe(200);
      expect(response.data.promoted).toBe(true);
      expect(response.data.version).toBe(testContext.modelVersion);
    });
  });

  describe('Phase 4: Production', () => {
    test('should deploy model to production', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/finetuning/production/deploy`,
        {
          version: testContext.modelVersion,
          instances: 2,
          config: {
            gpu: false,
            memory: '4GB'
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('deploymentId');
      expect(response.data.status).toBe('deployed');
      expect(response.data.instances).toBe(2);
      
      testContext.deploymentId = response.data.deploymentId;
    });

    test('should check deployment health', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/finetuning/production/health/${testContext.deploymentId}`
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(response.data.status);
    });

    test('should add training example for continuous training', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/finetuning/production/training-example`,
        {
          messages: [
            { role: 'system', content: 'You are a helpful assistant' },
            { role: 'user', content: 'Test query' },
            { role: 'assistant', content: 'Test response' }
          ],
          metadata: {
            quality_score: 0.95,
            source: 'api_test'
          }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.added).toBe(true);
    });

    test('should get pipeline status', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/finetuning/production/status`
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('pendingExamples');
      expect(response.data).toHaveProperty('readyForTraining');
      expect(response.data.pendingExamples).toBeGreaterThanOrEqual(0);
    });

    test('should rollback deployment', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/finetuning/production/rollback/${testContext.deploymentId}`,
        {
          reason: 'Integration test rollback'
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.rolledBack).toBe(true);
      expect(response.data.previousVersion).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid training data', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/api/finetuning/data/score`,
          {
            examples: 'not an array'
          }
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    test('should handle non-existent model version', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/api/finetuning/integration/promote/nonexistent-model`
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
      }
    });

    test('should handle invalid deployment ID', async () => {
      try {
        await axios.get(
          `${API_BASE_URL}/api/finetuning/production/health/invalid-id`
        );
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  afterAll(async () => {
    // Cleanup test output
    try {
      await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup test output:', error.message);
    }
  });
});

// Run tests if executed directly
if (require.main === module) {
  const { execSync } = require('child_process');
  try {
    execSync('npx jest ' + __filename, { stdio: 'inherit' });
  } catch (error) {
    process.exit(1);
  }
}

module.exports = {
  API_BASE_URL,
  TEST_OUTPUT_DIR
};
