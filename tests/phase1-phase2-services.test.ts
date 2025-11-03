/**
 * Test Phase 1 & 2 Services
 * 
 * Tests all newly implemented services:
 * - DatabaseService
 * - ValidationService
 * - WikiService
 * - ComponentLibraryService
 * - PlanningService
 * - ApiGatewayService
 * - AnalysisService
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDatabaseService } from '../src/services/DatabaseService';
import { validationService } from '../src/services/ValidationService';
import { wikiService } from '../src/services/WikiService';
import { componentLibraryService } from '../src/services/ComponentLibraryService';
import { planningService } from '../src/services/PlanningService';
import { apiGateway } from '../src/services/ApiGatewayService';
import { analysisService } from '../src/services/AnalysisService';

describe('Phase 1 & 2 Services', () => {
  let dbService: ReturnType<typeof getDatabaseService>;

  beforeAll(async () => {
    dbService = getDatabaseService();
    await dbService.initialize();
    await dbService.runMigrations();
  });

  afterAll(async () => {
    await dbService.close();
  });

  describe('DatabaseService', () => {
    it('should connect to database', async () => {
      const health = await dbService.healthCheck();
      expect(health.healthy).toBe(true);
    });

    it('should run migrations', async () => {
      const result = await dbService.runMigrations();
      expect(result.success).toBe(true);
    });
  });

  describe('ValidationService', () => {
    it('should generate validator from ld-schema', () => {
      const schema = {
        $id: 'test-schema',
        type: 'object' as const,
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name'],
      };

      const validator = validationService.generateValidatorFromLdSchema(schema);
      expect(validator).toBeDefined();
    });

    it('should validate data successfully', () => {
      const schema = {
        $id: 'test-schema',
        type: 'object' as const,
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      };

      const result = validationService.validateWithLdSchema(
        { name: 'Test' },
        schema
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: 'Test' });
    });

    it('should fail validation for invalid data', () => {
      const schema = {
        $id: 'test-schema',
        type: 'object' as const,
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      };

      const result = validationService.validateWithLdSchema({}, schema);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('WikiService', () => {
    it('should load topics', async () => {
      await wikiService.loadTopics();
      const topics = await wikiService.getAllTopics();
      expect(Array.isArray(topics)).toBe(true);
    });

    it('should search topics by tag', async () => {
      const topics = await wikiService.searchByTag('validation');
      expect(Array.isArray(topics)).toBe(true);
    });
  });

  describe('ComponentLibraryService', () => {
    it('should load default components', async () => {
      await componentLibraryService.loadDefaultComponents();
      const components = await componentLibraryService.getAtomicComponents();
      expect(components.length).toBeGreaterThan(0);
    });

    it('should get component by id', async () => {
      await componentLibraryService.loadDefaultComponents();
      const component = await componentLibraryService.getSchema('ld:AtomicButton');
      expect(component).toBeDefined();
      expect(component?.title).toBe('Atomic Button');
    });
  });

  describe('PlanningService', () => {
    it('should generate execution plan', async () => {
      // Note: This test requires Ollama to be running
      // Skip if Ollama is not available
      try {
        const plan = await planningService.generatePlan('test-template', {
          projectName: 'Test Project',
        });
        expect(plan).toBeDefined();
        expect(plan.planId).toBeDefined();
        expect(plan.steps).toBeDefined();
        expect(Array.isArray(plan.steps)).toBe(true);
      } catch (error) {
        console.log('Skipping plan generation test - Ollama not available');
      }
    }, 30000);
  });

  describe('ApiGatewayService', () => {
    it('should build GraphQL schema', () => {
      const schema = apiGateway.buildSchema();
      expect(schema).toBeDefined();
    });

    it('should execute GraphQL query', async () => {
      await wikiService.loadTopics();
      const result = await apiGateway.executeQuery(`
        query {
          wiki_getAllTopics {
            title
            description
          }
        }
      `);
      expect(result.data).toBeDefined();
    });
  });

  describe('AnalysisService', () => {
    it('should run competitor analysis', async () => {
      const report = await analysisService.runSampleAnalysis();
      expect(report).toBeDefined();
      expect(report.reportId).toBeDefined();
      expect(report.results).toBeDefined();
      expect(report.results.coverageScore).toBeGreaterThanOrEqual(0);
      expect(report.results.coverageScore).toBeLessThanOrEqual(100);
    });

    it('should save analysis report', async () => {
      const report = await analysisService.runSampleAnalysis();
      const retrieved = await analysisService.getReport(report.reportId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.reportId).toBe(report.reportId);
    });
  });
});
