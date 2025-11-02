/**
 * Unit tests for Layer Infographic Generator
 */

import { describe, it, expect } from 'vitest';
import { LayerInfographicGenerator } from '../services/layer-infographic-generator.js';

describe('LayerInfographicGenerator', () => {
  let generator;

  beforeEach(() => {
    generator = new LayerInfographicGenerator();
  });

  describe('Initialization', () => {
    it('should initialize with default output directory', () => {
      expect(generator.outputDir).toBe('./output/infographics');
    });
  });

  describe('Infographic Generation', () => {
    const mockAnalysis = {
      url: 'https://example.com',
      timestamp: '2025-11-02T10:00:00Z',
      layers: [
        { id: 'layer-1', zIndex: 0, isComposited: false, nodeName: 'DIV', position: 'static' },
        { id: 'layer-2', zIndex: 10, isComposited: true, nodeName: 'DIV', position: 'relative' },
        { id: 'layer-3', zIndex: 20, isComposited: false, nodeName: 'BUTTON', position: 'absolute' }
      ],
      componentMap: [
        { tagName: 'div', zIndex: 0, position: 'static' },
        { tagName: 'button', zIndex: 10, position: 'relative' }
      ],
      map3D: [],
      metadata: {
        totalLayers: 3,
        compositingLayers: 1,
        maxZIndex: 20
      }
    };

    const mockTrainingData = {
      url: 'https://example.com',
      timestamp: '2025-11-02T10:00:00Z',
      structure: {
        layerCount: 3,
        compositingLayerCount: 1,
        maxDepth: 20,
        componentCount: 2
      },
      patterns: {
        zIndexDistribution: { min: 0, max: 20, mean: 10 },
        compositingTriggers: { transform: 1, willChange: 0 },
        layoutPatterns: { static: 1, relative: 1, absolute: 1 },
        componentHierarchy: {}
      },
      components: [],
      relationships: [],
      designRules: {
        rules: { maxZIndex: 10000 },
        violations: [],
        recommendations: []
      }
    };

    it('should generate complete infographic', async () => {
      const infographic = await generator.generateInfographic(mockAnalysis, mockTrainingData);

      expect(infographic).toBeDefined();
      expect(infographic.title).toContain('example.com');
      expect(infographic.sections).toBeInstanceOf(Array);
      expect(infographic.sections.length).toBeGreaterThan(0);
    });

    it('should include all required sections', async () => {
      const infographic = await generator.generateInfographic(mockAnalysis, mockTrainingData);

      const sectionTypes = infographic.sections.map(s => s.type);
      expect(sectionTypes).toContain('overview');
      expect(sectionTypes).toContain('hierarchy');
      expect(sectionTypes).toContain('component-map');
      expect(sectionTypes).toContain('performance');
      expect(sectionTypes).toContain('design-rules');
      expect(sectionTypes).toContain('relationships');
    });
  });

  describe('Overview Section', () => {
    it('should generate overview with metrics', () => {
      const mockAnalysis = {
        metadata: {
          totalLayers: 100,
          compositingLayers: 10,
          maxZIndex: 999
        },
        componentMap: new Array(50)
      };

      const mockTrainingData = {
        structure: {
          layerCount: 100,
          compositingLayerCount: 10,
          maxDepth: 999,
          componentCount: 50
        }
      };

      const section = generator.generateOverviewSection(mockAnalysis, mockTrainingData);

      expect(section.type).toBe('overview');
      expect(section.metrics).toBeInstanceOf(Array);
      expect(section.metrics.length).toBe(4);
      
      const totalLayersMetric = section.metrics.find(m => m.label === 'Total Layers');
      expect(totalLayersMetric.value).toBe(100);
    });
  });

  describe('Hierarchy Section', () => {
    it('should group layers by z-index', () => {
      const mockAnalysis = {
        layers: [
          { id: 'l1', zIndex: 0, isComposited: false, nodeName: 'DIV', position: 'static' },
          { id: 'l2', zIndex: 0, isComposited: false, nodeName: 'P', position: 'static' },
          { id: 'l3', zIndex: 10, isComposited: true, nodeName: 'DIV', position: 'fixed' }
        ]
      };

      const section = generator.generateHierarchySection(mockAnalysis);

      expect(section.type).toBe('hierarchy');
      expect(section.data).toBeInstanceOf(Array);
      expect(section.data.length).toBeGreaterThan(0);
      
      const level0 = section.data.find(d => d.level === 0);
      expect(level0.count).toBe(2);
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate paint complexity score', () => {
      const mockAnalysis = { metadata: { totalLayers: 50 } };
      const score = generator.calculatePaintComplexity(mockAnalysis);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBe(100); // 50 layers is optimal
    });

    it('should calculate compositing score', () => {
      const mockAnalysis = { 
        metadata: { 
          totalLayers: 100,
          compositingLayers: 10 
        } 
      };
      const score = generator.calculateCompositingScore(mockAnalysis);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBe(100); // 10% is optimal
    });

    it('should calculate z-index complexity score', () => {
      const mockAnalysis = { metadata: { maxZIndex: 100 } };
      const score = generator.calculateZIndexComplexity(mockAnalysis);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(score).toBe(100); // 100 is optimal
    });

    it('should assign performance grade', () => {
      const mockAnalysis = {
        metadata: {
          totalLayers: 50,
          compositingLayers: 5,
          maxZIndex: 100
        },
        componentMap: []
      };

      const mockTrainingData = {
        structure: {},
        patterns: {},
        components: [],
        relationships: [],
        designRules: { rules: {}, violations: [], recommendations: [] }
      };

      const section = generator.generatePerformanceSection(mockAnalysis, mockTrainingData);

      expect(section.grade).toBeDefined();
      expect(['A', 'B', 'C', 'D', 'F']).toContain(section.grade);
      expect(section.grade).toBe('A'); // All scores should be 100
    });
  });

  describe('Design Rules Section', () => {
    it('should calculate compliance percentage', () => {
      const mockTrainingData = {
        designRules: {
          rules: {},
          violations: [
            { type: 'z-index-too-high', layerId: 'l1' },
            { type: 'z-index-too-high', layerId: 'l2' }
          ],
          recommendations: []
        }
      };

      const section = generator.generateDesignRulesSection(mockTrainingData);

      expect(section.compliance).toBeDefined();
      expect(section.compliance.total).toBe(12); // 10 checks + 2 violations
      expect(section.compliance.failed).toBe(2);
      expect(section.compliance.passed).toBe(10);
      expect(section.compliance.percentage).toBe('83.3');
    });

    it('should list violations', () => {
      const mockTrainingData = {
        designRules: {
          rules: {},
          violations: [
            { type: 'z-index-too-high', value: 99999, threshold: 10000, layerId: 'l1' }
          ],
          recommendations: []
        }
      };

      const section = generator.generateDesignRulesSection(mockTrainingData);

      expect(section.violations).toBeInstanceOf(Array);
      expect(section.violations.length).toBe(1);
      expect(section.violations[0].type).toBe('z-index-too-high');
      expect(section.violations[0].severity).toBe('warning');
    });
  });

  describe('Relationships Section', () => {
    it('should analyze relationship types', () => {
      const mockTrainingData = {
        components: new Array(10),
        relationships: [
          { type: 'maps-to', componentId: 'c1', layerId: 'l1' },
          { type: 'maps-to', componentId: 'c2', layerId: 'l2' },
          { type: 'contained-in', componentId: 'c3', relatedComponentId: 'c1' }
        ]
      };

      const section = generator.generateRelationshipsSection(mockTrainingData);

      expect(section.stats.total).toBe(3);
      expect(section.stats.types['maps-to']).toBe(2);
      expect(section.stats.types['contained-in']).toBe(1);
    });

    it('should calculate connectivity score', () => {
      const mockTrainingData = {
        components: new Array(10),
        relationships: new Array(5)
      };

      const section = generator.generateRelationshipsSection(mockTrainingData);

      expect(section.stats.connectivity).toBeDefined();
      expect(parseFloat(section.stats.connectivity)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Helper Methods', () => {
    it('should calculate trend correctly', () => {
      const upTrend = generator.calculateTrend(120, 100);
      expect(upTrend.direction).toBe('up');
      expect(upTrend.status).toBe('warning');
      expect(parseFloat(upTrend.value)).toBe(20.0);

      const downTrend = generator.calculateTrend(80, 100);
      expect(downTrend.direction).toBe('down');
      expect(downTrend.status).toBe('good');
      expect(parseFloat(downTrend.value)).toBe(20.0);
    });

    it('should generate performance recommendations', () => {
      const goodMetrics = {
        paintComplexity: 90,
        compositingScore: 90,
        zIndexComplexity: 90
      };
      const recommendations = generator.generatePerformanceRecommendations(goodMetrics);
      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBe(0);

      const badMetrics = {
        paintComplexity: 50,
        compositingScore: 50,
        zIndexComplexity: 50
      };
      const badRecommendations = generator.generatePerformanceRecommendations(badMetrics);
      expect(badRecommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Export Functions', () => {
    it('should export JSON format', async () => {
      const mockInfographic = {
        title: 'Test',
        sections: []
      };

      // Test would write file, for unit test just check method exists
      expect(generator.exportJSON).toBeDefined();
      expect(typeof generator.exportJSON).toBe('function');
    });

    it('should generate SVG', async () => {
      const mockInfographic = {
        title: 'Test',
        sections: [
          {
            type: 'overview',
            metrics: [
              { label: 'Test', value: 100, color: '#000' }
            ]
          }
        ]
      };

      const svg = await generator.generateSVG(mockInfographic);
      expect(svg).toBeDefined();
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
    });
  });
});
