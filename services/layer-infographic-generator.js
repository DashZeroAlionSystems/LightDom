/**
 * Infographic Generator for Chrome Layers Analysis
 * 
 * Generates visual infographics showing:
 * - Layer hierarchy
 * - Component relationships
 * - Performance metrics
 * - Design rule compliance
 */

import fs from 'fs';
import path from 'path';

export class LayerInfographicGenerator {
  constructor() {
    this.outputDir = './output/infographics';
  }

  /**
   * Generate comprehensive infographic from layer analysis
   */
  async generateInfographic(analysis, trainingData, options = {}) {
    const infographic = {
      title: `Layer Analysis: ${analysis.url}`,
      timestamp: new Date().toISOString(),
      sections: []
    };

    // Section 1: Overview Statistics
    infographic.sections.push(this.generateOverviewSection(analysis, trainingData));

    // Section 2: Layer Hierarchy
    infographic.sections.push(this.generateHierarchySection(analysis));

    // Section 3: Component Map
    infographic.sections.push(this.generateComponentMapSection(analysis));

    // Section 4: Performance Metrics
    infographic.sections.push(this.generatePerformanceSection(analysis, trainingData));

    // Section 5: Design Rules
    infographic.sections.push(this.generateDesignRulesSection(trainingData));

    // Section 6: Relationships Graph
    infographic.sections.push(this.generateRelationshipsSection(trainingData));

    return infographic;
  }

  /**
   * Generate overview statistics section
   */
  generateOverviewSection(analysis, trainingData) {
    return {
      type: 'overview',
      title: 'Overview Statistics',
      metrics: [
        {
          label: 'Total Layers',
          value: analysis.metadata.totalLayers,
          icon: 'layers',
          color: '#1890ff',
          trend: this.calculateTrend(analysis.metadata.totalLayers, 100)
        },
        {
          label: 'Compositing Layers',
          value: analysis.metadata.compositingLayers,
          icon: 'gpu',
          color: '#52c41a',
          percentage: (analysis.metadata.compositingLayers / analysis.metadata.totalLayers * 100).toFixed(1)
        },
        {
          label: 'Max Z-Index',
          value: analysis.metadata.maxZIndex,
          icon: 'stack',
          color: '#fa8c16',
          status: analysis.metadata.maxZIndex > 10000 ? 'warning' : 'good'
        },
        {
          label: 'Components',
          value: analysis.componentMap.length,
          icon: 'components',
          color: '#722ed1'
        }
      ]
    };
  }

  /**
   * Generate layer hierarchy visualization section
   */
  generateHierarchySection(analysis) {
    // Group layers by z-index
    const layersByZ = {};
    analysis.layers.forEach(layer => {
      const z = layer.zIndex || 0;
      if (!layersByZ[z]) layersByZ[z] = [];
      layersByZ[z].push(layer);
    });

    const hierarchy = Object.entries(layersByZ)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .map(([zIndex, layers]) => ({
        level: parseInt(zIndex),
        count: layers.length,
        compositedCount: layers.filter(l => l.isComposited).length,
        nodes: layers.slice(0, 10).map(l => ({
          id: l.id,
          name: l.nodeName,
          position: l.position,
          isComposited: l.isComposited
        }))
      }));

    return {
      type: 'hierarchy',
      title: 'Layer Hierarchy',
      data: hierarchy,
      visualization: {
        type: 'tree',
        levels: hierarchy.length,
        maxNodesPerLevel: Math.max(...hierarchy.map(h => h.count))
      }
    };
  }

  /**
   * Generate component map section
   */
  generateComponentMapSection(analysis) {
    // Group components by type
    const componentsByType = {};
    analysis.componentMap.forEach(comp => {
      if (!componentsByType[comp.tagName]) {
        componentsByType[comp.tagName] = [];
      }
      componentsByType[comp.tagName].push(comp);
    });

    const componentDistribution = Object.entries(componentsByType)
      .map(([type, components]) => ({
        type,
        count: components.length,
        avgZIndex: components.reduce((sum, c) => sum + (parseInt(c.zIndex) || 0), 0) / components.length,
        positions: components.reduce((acc, c) => {
          acc[c.position] = (acc[c.position] || 0) + 1;
          return acc;
        }, {})
      }))
      .sort((a, b) => b.count - a.count);

    return {
      type: 'component-map',
      title: 'Component Distribution',
      data: componentDistribution,
      visualization: {
        type: 'pie-chart',
        totalComponents: analysis.componentMap.length,
        uniqueTypes: componentDistribution.length
      }
    };
  }

  /**
   * Generate performance metrics section
   */
  generatePerformanceSection(analysis, trainingData) {
    const metrics = {
      paintComplexity: this.calculatePaintComplexity(analysis),
      compositingScore: this.calculateCompositingScore(analysis),
      zIndexComplexity: this.calculateZIndexComplexity(analysis),
      performanceGrade: 'A'
    };

    // Calculate overall performance grade
    const scores = [
      metrics.paintComplexity,
      metrics.compositingScore,
      metrics.zIndexComplexity
    ];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (avgScore >= 90) metrics.performanceGrade = 'A';
    else if (avgScore >= 80) metrics.performanceGrade = 'B';
    else if (avgScore >= 70) metrics.performanceGrade = 'C';
    else if (avgScore >= 60) metrics.performanceGrade = 'D';
    else metrics.performanceGrade = 'F';

    return {
      type: 'performance',
      title: 'Performance Metrics',
      grade: metrics.performanceGrade,
      metrics: [
        {
          name: 'Paint Complexity',
          score: metrics.paintComplexity,
          status: metrics.paintComplexity >= 80 ? 'good' : 'warning'
        },
        {
          name: 'Compositing Efficiency',
          score: metrics.compositingScore,
          status: metrics.compositingScore >= 80 ? 'good' : 'warning'
        },
        {
          name: 'Z-Index Management',
          score: metrics.zIndexComplexity,
          status: metrics.zIndexComplexity >= 80 ? 'good' : 'warning'
        }
      ],
      recommendations: this.generatePerformanceRecommendations(metrics)
    };
  }

  /**
   * Generate design rules compliance section
   */
  generateDesignRulesSection(trainingData) {
    const rules = trainingData.designRules;
    
    return {
      type: 'design-rules',
      title: 'Design Rule Compliance',
      compliance: {
        total: rules.violations.length + 10, // Assume 10 checks
        passed: 10 - rules.violations.length,
        failed: rules.violations.length,
        percentage: ((10 - rules.violations.length) / 10 * 100).toFixed(1)
      },
      violations: rules.violations.map(v => ({
        type: v.type,
        severity: 'warning',
        message: `${v.type}: Value ${v.value} exceeds threshold ${v.threshold}`,
        layerId: v.layerId
      })),
      recommendations: rules.recommendations.map(r => ({
        type: r.type,
        priority: 'medium',
        message: r.suggestion
      }))
    };
  }

  /**
   * Generate relationships graph section
   */
  generateRelationshipsSection(trainingData) {
    // Analyze relationship types
    const relationshipStats = {};
    trainingData.relationships.forEach(rel => {
      relationshipStats[rel.type] = (relationshipStats[rel.type] || 0) + 1;
    });

    // Calculate connectivity score
    const totalPossible = trainingData.components.length * (trainingData.components.length - 1) / 2;
    const actualConnections = trainingData.relationships.length;
    const connectivityScore = totalPossible > 0 
      ? (actualConnections / totalPossible * 100).toFixed(1)
      : 0;

    return {
      type: 'relationships',
      title: 'Component Relationships',
      stats: {
        total: trainingData.relationships.length,
        types: relationshipStats,
        connectivity: connectivityScore
      },
      graph: {
        nodes: trainingData.components.length,
        edges: trainingData.relationships.length,
        avgConnections: (trainingData.relationships.length / trainingData.components.length).toFixed(2)
      },
      visualization: {
        type: 'network-graph',
        clustered: true,
        weighted: true
      }
    };
  }

  /**
   * Calculate paint complexity score (0-100)
   */
  calculatePaintComplexity(analysis) {
    const layerCount = analysis.metadata.totalLayers;
    const optimal = 50;
    
    if (layerCount <= optimal) return 100;
    if (layerCount >= 500) return 0;
    
    return Math.max(0, 100 - ((layerCount - optimal) / (500 - optimal) * 100));
  }

  /**
   * Calculate compositing score (0-100)
   */
  calculateCompositingScore(analysis) {
    const compositingRatio = analysis.metadata.compositingLayers / analysis.metadata.totalLayers;
    const optimal = 0.1; // 10% is good
    const max = 0.3; // 30% is too much
    
    if (compositingRatio <= optimal) return 100;
    if (compositingRatio >= max) return 0;
    
    return Math.max(0, 100 - ((compositingRatio - optimal) / (max - optimal) * 100));
  }

  /**
   * Calculate z-index complexity score (0-100)
   */
  calculateZIndexComplexity(analysis) {
    const maxZ = analysis.metadata.maxZIndex;
    const optimal = 100;
    const max = 10000;
    
    if (maxZ <= optimal) return 100;
    if (maxZ >= max) return 0;
    
    return Math.max(0, 100 - ((maxZ - optimal) / (max - optimal) * 100));
  }

  /**
   * Generate performance recommendations
   */
  generatePerformanceRecommendations(metrics) {
    const recommendations = [];

    if (metrics.paintComplexity < 80) {
      recommendations.push({
        priority: 'high',
        message: 'Reduce number of DOM layers to improve paint performance',
        impact: 'high'
      });
    }

    if (metrics.compositingScore < 80) {
      recommendations.push({
        priority: 'high',
        message: 'Too many composited layers detected. Consider using will-change sparingly.',
        impact: 'high'
      });
    }

    if (metrics.zIndexComplexity < 80) {
      recommendations.push({
        priority: 'medium',
        message: 'Z-index values are too high. Use a more manageable stacking context.',
        impact: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Calculate trend vs baseline
   */
  calculateTrend(value, baseline) {
    const diff = ((value - baseline) / baseline * 100).toFixed(1);
    return {
      value: Math.abs(diff),
      direction: value > baseline ? 'up' : 'down',
      status: value <= baseline ? 'good' : 'warning'
    };
  }

  /**
   * Export infographic as JSON
   */
  async exportJSON(infographic, filename) {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const filepath = path.join(this.outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(infographic, null, 2));
    return filepath;
  }

  /**
   * Generate SVG infographic
   */
  async generateSVG(infographic) {
    // This would generate an actual SVG visualization
    // For now, we'll create a placeholder
    
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="1600" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; }
    .metric { font-family: Arial, sans-serif; font-size: 18px; }
    .label { font-family: Arial, sans-serif; font-size: 14px; fill: #666; }
  </style>
  
  <!-- Title -->
  <text x="600" y="40" text-anchor="middle" class="title">${infographic.title}</text>
  
  <!-- Overview Section -->
  ${this.generateOverviewSVG(infographic.sections[0], 80)}
  
  <!-- Add more sections as needed -->
</svg>`;

    return svg;
  }

  /**
   * Generate SVG for overview section
   */
  generateOverviewSVG(section, yOffset) {
    if (!section || section.type !== 'overview') return '';

    const metrics = section.metrics;
    const xSpacing = 280;
    const startX = 50;

    return metrics.map((metric, index) => {
      const x = startX + (index * xSpacing);
      const y = yOffset;

      return `
  <!-- Metric ${index + 1} -->
  <rect x="${x}" y="${y}" width="250" height="120" fill="${metric.color}" opacity="0.1" rx="8"/>
  <text x="${x + 125}" y="${y + 50}" text-anchor="middle" class="metric" fill="${metric.color}">${metric.value}</text>
  <text x="${x + 125}" y="${y + 80}" text-anchor="middle" class="label">${metric.label}</text>
      `;
    }).join('');
  }
}

export default LayerInfographicGenerator;
