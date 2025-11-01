#!/usr/bin/env node

/**
 * Schema Linking Service Tests
 * Tests for schema analysis, linking, and generation functionality
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import SchemaLinkingService from '../services/schema-linking-service.js';
import { SchemaLinkingRunner } from '../services/schema-linking-runner.js';
import fs from 'fs';
import path from 'path';

describe('Schema Linking Service', () => {
  let service;
  
  beforeAll(async () => {
    service = new SchemaLinkingService({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5434,
      database: process.env.DB_NAME || 'lightdom',
      user: process.env.DB_USER || 'lightdom_user',
      password: process.env.DB_PASSWORD || 'lightdom_password'
    });
  });
  
  afterAll(async () => {
    if (service) {
      await service.close();
    }
  });
  
  describe('Schema Analysis', () => {
    it('should analyze database schema', async () => {
      const result = await service.analyzeDatabaseSchema();
      
      expect(result).toBeDefined();
      expect(result.tables).toBeGreaterThan(0);
      expect(result.relationships).toBeGreaterThanOrEqual(0);
      expect(result.features).toBeGreaterThan(0);
    }, 30000);
    
    it('should discover foreign key relationships', async () => {
      if (service.schemaLinks.size === 0) {
        await service.analyzeDatabaseSchema();
      }
      
      const foreignKeyLinks = Array.from(service.schemaLinks.values())
        .filter(link => link.type === 'foreign_key');
      
      expect(foreignKeyLinks.length).toBeGreaterThan(0);
      
      // Check structure of a foreign key link
      const link = foreignKeyLinks[0];
      expect(link).toHaveProperty('source');
      expect(link).toHaveProperty('target');
      expect(link.source).toHaveProperty('table');
      expect(link.target).toHaveProperty('table');
      expect(link.strength).toBe(1.0);
    }, 30000);
    
    it('should identify feature groupings', async () => {
      if (service.featureInteractions.size === 0) {
        await service.analyzeDatabaseSchema();
      }
      
      expect(service.featureInteractions.size).toBeGreaterThan(0);
      
      // Check structure of a feature
      const features = Array.from(service.featureInteractions.values());
      const feature = features[0];
      
      expect(feature).toHaveProperty('name');
      expect(feature).toHaveProperty('tables');
      expect(feature).toHaveProperty('settings');
      expect(feature).toHaveProperty('options');
      expect(Array.isArray(feature.tables)).toBe(true);
    }, 30000);
  });
  
  describe('Linked Schema Generation', () => {
    beforeAll(async () => {
      if (service.featureInteractions.size === 0) {
        await service.analyzeDatabaseSchema();
      }
    });
    
    it('should generate linked schema map for feature', async () => {
      const features = Array.from(service.featureInteractions.keys());
      expect(features.length).toBeGreaterThan(0);
      
      const featureName = features[0];
      const linkedSchema = service.generateLinkedSchemaMap(featureName);
      
      expect(linkedSchema).toBeDefined();
      expect(linkedSchema.feature).toBe(featureName);
      expect(linkedSchema).toHaveProperty('tables');
      expect(linkedSchema).toHaveProperty('relationships');
      expect(linkedSchema).toHaveProperty('dashboards');
      expect(linkedSchema).toHaveProperty('workflows');
    });
    
    it('should generate dashboard configurations', async () => {
      const features = Array.from(service.featureInteractions.values());
      const feature = features.find(f => f.settings.length > 0 || f.options.length > 0);
      
      if (feature) {
        const linkedSchema = service.generateLinkedSchemaMap(feature.name);
        
        expect(linkedSchema.dashboards).toBeDefined();
        
        if (linkedSchema.dashboards.length > 0) {
          const dashboard = linkedSchema.dashboards[0];
          expect(dashboard).toHaveProperty('id');
          expect(dashboard).toHaveProperty('name');
          expect(dashboard).toHaveProperty('components');
          expect(Array.isArray(dashboard.components)).toBe(true);
        }
      }
    });
    
    it('should generate workflow configurations', async () => {
      const features = Array.from(service.featureInteractions.keys());
      const featureName = features[0];
      
      const linkedSchema = service.generateLinkedSchemaMap(featureName);
      
      expect(linkedSchema.workflows).toBeDefined();
      expect(linkedSchema.workflows).toHaveProperty('id');
      expect(linkedSchema.workflows).toHaveProperty('name');
      expect(linkedSchema.workflows).toHaveProperty('steps');
      expect(Array.isArray(linkedSchema.workflows.steps)).toBe(true);
    });
  });
  
  describe('Schema Export', () => {
    it('should export linked schemas to file', async () => {
      if (service.tableMetadata.size === 0) {
        await service.analyzeDatabaseSchema();
      }
      
      const outputPath = path.join(process.cwd(), 'test-linked-schemas.json');
      const exportData = await service.exportLinkedSchemas(outputPath);
      
      expect(exportData).toBeDefined();
      expect(exportData.metadata).toBeDefined();
      expect(exportData.metadata.totalTables).toBeGreaterThan(0);
      expect(fs.existsSync(outputPath)).toBe(true);
      
      // Clean up
      fs.unlinkSync(outputPath);
    }, 30000);
  });
});

describe('Schema Linking Runner', () => {
  let runner;
  
  beforeAll(() => {
    runner = new SchemaLinkingRunner({
      autoStart: false,
      outputDir: path.join(process.cwd(), 'test-output')
    });
  });
  
  afterAll(async () => {
    if (runner && runner.isRunning) {
      await runner.stop();
    }
    
    // Clean up test output
    const testOutputDir = path.join(process.cwd(), 'test-output');
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });
  
  describe('Runner Lifecycle', () => {
    it('should initialize runner', async () => {
      await runner.initialize();
      
      expect(runner.service).toBeDefined();
      expect(runner.isRunning).toBe(false);
    });
    
    it('should run a single linking cycle', async () => {
      const result = await runner.runLinkingCycle();
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.tables).toBeGreaterThan(0);
      expect(result.outputPath).toBeDefined();
      expect(fs.existsSync(result.outputPath)).toBe(true);
    }, 60000);
    
    it('should generate summary report', async () => {
      const result = await runner.runLinkingCycle();
      
      expect(result.reportPath).toBeDefined();
      expect(fs.existsSync(result.reportPath)).toBe(true);
      
      const reportContent = fs.readFileSync(result.reportPath, 'utf8');
      expect(reportContent).toContain('# Schema Linking Analysis Report');
      expect(reportContent).toContain('## Summary');
    }, 60000);
  });
  
  describe('Runner Status', () => {
    it('should return runner status', () => {
      const status = runner.getStatus();
      
      expect(status).toBeDefined();
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('lastRun');
      expect(status).toHaveProperty('config');
    });
  });
});

describe('Component Type Mapping', () => {
  let service;
  
  beforeAll(() => {
    service = new SchemaLinkingService();
  });
  
  afterAll(async () => {
    await service.close();
  });
  
  it('should map boolean to toggle component', () => {
    const type = service.getComponentTypeFromColumn({ type: 'boolean' });
    expect(type).toBe('toggle');
  });
  
  it('should map integer to number component', () => {
    const type = service.getComponentTypeFromColumn({ type: 'integer' });
    expect(type).toBe('number');
  });
  
  it('should map varchar to input component', () => {
    const type = service.getComponentTypeFromColumn({ type: 'varchar' });
    expect(type).toBe('input');
  });
  
  it('should map text to textarea component', () => {
    const type = service.getComponentTypeFromColumn({ type: 'text' });
    expect(type).toBe('textarea');
  });
  
  it('should map jsonb to json-editor component', () => {
    const type = service.getComponentTypeFromColumn({ type: 'jsonb' });
    expect(type).toBe('json-editor');
  });
  
  it('should map timestamp to datetime component', () => {
    const type = service.getComponentTypeFromColumn({ type: 'timestamp' });
    expect(type).toBe('datetime');
  });
});

describe('Validation Rules', () => {
  let service;
  
  beforeAll(() => {
    service = new SchemaLinkingService();
  });
  
  afterAll(async () => {
    await service.close();
  });
  
  it('should add required rule for non-nullable columns', () => {
    const rules = service.getValidationRules({ nullable: false, name: 'test' });
    expect(rules.some(r => r.type === 'required')).toBe(true);
  });
  
  it('should add maxLength rule for varchar columns', () => {
    const rules = service.getValidationRules({ 
      type: 'varchar', 
      nullable: true,
      maxLength: 255 
    });
    expect(rules.some(r => r.type === 'maxLength' && r.value === 255)).toBe(true);
  });
  
  it('should add integer rule for integer columns', () => {
    const rules = service.getValidationRules({ type: 'integer', nullable: true });
    expect(rules.some(r => r.type === 'integer')).toBe(true);
  });
});
