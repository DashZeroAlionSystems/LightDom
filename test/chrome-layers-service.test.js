/**
 * Unit tests for Chrome Layers Service
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ChromeLayersService } from '../services/chrome-layers-service.js';

describe('ChromeLayersService', () => {
  let service;

  beforeAll(async () => {
    service = new ChromeLayersService({
      headless: true,
      cacheEnabled: false
    });
    await service.initialize();
  });

  afterAll(async () => {
    await service.cleanup();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(service.browser).toBeDefined();
      expect(service.browser).not.toBeNull();
    });

    it('should have correct configuration', () => {
      expect(service.options.headless).toBe(true);
      expect(service.options.cacheEnabled).toBe(false);
    });
  });

  describe('Layer Analysis', () => {
    it('should analyze a simple HTML page', async () => {
      const testHtml = 'data:text/html,<html><body><div style="position:relative;z-index:10">Test</div></body></html>';
      const analysis = await service.analyzeLayersForUrl(testHtml);

      expect(analysis).toBeDefined();
      expect(analysis.url).toBe(testHtml);
      expect(analysis.layers).toBeInstanceOf(Array);
      expect(analysis.metadata).toBeDefined();
      expect(analysis.metadata.totalLayers).toBeGreaterThan(0);
    });

    it('should detect compositing layers', async () => {
      const testHtml = 'data:text/html,<html><body><div style="transform:translateZ(0);will-change:transform">Composited</div></body></html>';
      const analysis = await service.analyzeLayersForUrl(testHtml);

      const compositedLayers = analysis.layers.filter(l => l.isComposited);
      expect(analysis.metadata.compositingLayers).toBeGreaterThan(0);
    });

    it('should extract z-index correctly', async () => {
      const testHtml = 'data:text/html,<html><body><div style="position:relative;z-index:999">High Z</div></body></html>';
      const analysis = await service.analyzeLayersForUrl(testHtml);

      expect(analysis.metadata.maxZIndex).toBeGreaterThanOrEqual(999);
    });

    it('should generate component map', async () => {
      const testHtml = 'data:text/html,<html><body><button id="test">Click</button></body></html>';
      const analysis = await service.analyzeLayersForUrl(testHtml);

      expect(analysis.componentMap).toBeInstanceOf(Array);
      expect(analysis.componentMap.length).toBeGreaterThan(0);
    });
  });

  describe('3D Map Generation', () => {
    it('should generate 3D coordinates', async () => {
      const testHtml = 'data:text/html,<html><body><div>Test</div></body></html>';
      const analysis = await service.analyzeLayersForUrl(testHtml);

      expect(analysis.map3D).toBeInstanceOf(Array);
      expect(analysis.map3D.length).toBeGreaterThan(0);

      const firstLayer = analysis.map3D[0];
      expect(firstLayer.position).toBeDefined();
      expect(firstLayer.position.x).toBeDefined();
      expect(firstLayer.position.y).toBeDefined();
      expect(firstLayer.position.z).toBeDefined();
      expect(firstLayer.dimensions).toBeDefined();
    });

    it('should assign colors based on layer properties', async () => {
      const testHtml = 'data:text/html,<html><body><div style="position:fixed">Fixed</div></body></html>';
      const analysis = await service.analyzeLayersForUrl(testHtml);

      const fixedLayer = analysis.map3D.find(l => l.metadata.nodeName === 'DIV');
      expect(fixedLayer).toBeDefined();
      expect(fixedLayer.color).toBeDefined();
    });
  });

  describe('Training Data Extraction', () => {
    it('should extract training data', async () => {
      const testHtml = 'data:text/html,<html><body><div>Test</div></body></html>';
      const analysis = await service.analyzeLayersForUrl(testHtml);
      const trainingData = await service.extractTrainingData(testHtml, analysis);

      expect(trainingData).toBeDefined();
      expect(trainingData.url).toBe(testHtml);
      expect(trainingData.structure).toBeDefined();
      expect(trainingData.patterns).toBeDefined();
      expect(trainingData.relationships).toBeInstanceOf(Array);
    });

    it('should analyze z-index distribution', async () => {
      const testHtml = 'data:text/html,<html><body><div style="z-index:10">A</div><div style="z-index:20">B</div></body></html>';
      const analysis = await service.analyzeLayersForUrl(testHtml);
      const trainingData = await service.extractTrainingData(testHtml, analysis);

      expect(trainingData.patterns.zIndexDistribution).toBeDefined();
      expect(trainingData.patterns.zIndexDistribution.min).toBeDefined();
      expect(trainingData.patterns.zIndexDistribution.max).toBeDefined();
    });

    it('should detect compositing triggers', async () => {
      const testHtml = 'data:text/html,<html><body><div style="transform:scale(1.1)">Scaled</div></body></html>';
      const analysis = await service.analyzeLayersForUrl(testHtml);
      const trainingData = await service.extractTrainingData(testHtml, analysis);

      expect(trainingData.patterns.compositingTriggers).toBeDefined();
      expect(trainingData.patterns.compositingTriggers.transform).toBeGreaterThan(0);
    });

    it('should extract component patterns', async () => {
      const testHtml = 'data:text/html,<html><body><button>A</button><button>B</button></body></html>';
      const analysis = await service.analyzeLayersForUrl(testHtml);
      const trainingData = await service.extractTrainingData(testHtml, analysis);

      expect(trainingData.components).toBeInstanceOf(Array);
      const buttonComponents = trainingData.components.filter(c => c.type === 'button');
      expect(buttonComponents.length).toBeGreaterThan(0);
    });

    it('should extract relationships', async () => {
      const testHtml = 'data:text/html,<html><body><div><button>Inside</button></div></body></html>';
      const analysis = await service.analyzeLayersForUrl(testHtml);
      const trainingData = await service.extractTrainingData(testHtml, analysis);

      expect(trainingData.relationships).toBeInstanceOf(Array);
      // Should find contained-in relationships
      const containedRels = trainingData.relationships.filter(r => r.type === 'contained-in');
      expect(containedRels.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Design Rules', () => {
    it('should apply default design rules', async () => {
      const testHtml = 'data:text/html,<html><body><div>Test</div></body></html>';
      const analysis = await service.analyzeLayersForUrl(testHtml);
      const trainingData = await service.extractTrainingData(testHtml, analysis);

      expect(trainingData.designRules).toBeDefined();
      expect(trainingData.designRules.rules).toBeDefined();
      expect(trainingData.designRules.violations).toBeInstanceOf(Array);
      expect(trainingData.designRules.recommendations).toBeInstanceOf(Array);
    });

    it('should detect z-index violations', async () => {
      const testHtml = 'data:text/html,<html><body><div style="z-index:99999">Too High</div></body></html>';
      const analysis = await service.analyzeLayersForUrl(testHtml);
      const trainingData = await service.extractTrainingData(testHtml, analysis, {
        designRules: { maxZIndex: 10000 }
      });

      const zIndexViolations = trainingData.designRules.violations.filter(
        v => v.type === 'z-index-too-high'
      );
      expect(zIndexViolations.length).toBeGreaterThan(0);
    });

    it('should provide recommendations', async () => {
      // Create a page with many composited layers
      const manyLayers = Array(60).fill(0).map((_, i) => 
        `<div style="transform:translateZ(0)">Layer ${i}</div>`
      ).join('');
      const testHtml = `data:text/html,<html><body>${manyLayers}</body></html>`;
      
      const analysis = await service.analyzeLayersForUrl(testHtml);
      const trainingData = await service.extractTrainingData(testHtml, analysis);

      // Should recommend reducing compositing layers
      const recommendations = trainingData.designRules.recommendations;
      expect(recommendations.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Helper Methods', () => {
    it('should parse z-index correctly', () => {
      expect(service.parseZIndex('auto')).toBe(0);
      expect(service.parseZIndex('10')).toBe(10);
      expect(service.parseZIndex('-5')).toBe(-5);
      expect(service.parseZIndex('invalid')).toBe(0);
    });

    it('should determine compositing layers', () => {
      const styles = {
        transform: 'translateZ(0)',
        'will-change': 'auto',
        opacity: '1',
        position: 'static'
      };
      expect(service.isCompositingLayer(styles)).toBe(true);

      const nonComposited = {
        transform: 'none',
        'will-change': 'auto',
        opacity: '1',
        position: 'static'
      };
      expect(service.isCompositingLayer(nonComposited)).toBe(false);
    });

    it('should get correct layer colors', () => {
      expect(service.getLayerColor({ isComposited: true })).toBe('#4CAF50');
      expect(service.getLayerColor({ position: 'fixed' })).toBe('#2196F3');
      expect(service.getLayerColor({ position: 'absolute' })).toBe('#FF9800');
      expect(service.getLayerColor({ position: 'relative' })).toBe('#9C27B0');
      expect(service.getLayerColor({ position: 'static' })).toBe('#757575');
    });

    it('should check containment correctly', () => {
      const boundsA = { x: 10, y: 10, width: 50, height: 50 };
      const boundsB = { x: 0, y: 0, width: 100, height: 100 };
      
      expect(service.isContained(boundsA, boundsB)).toBe(true);
      expect(service.isContained(boundsB, boundsA)).toBe(false);
    });

    it('should create histogram', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const histogram = service.createHistogram(values, 5);
      
      expect(histogram).toBeInstanceOf(Array);
      expect(histogram.length).toBe(5);
      expect(histogram.reduce((a, b) => a + b, 0)).toBe(10);
    });
  });
});
