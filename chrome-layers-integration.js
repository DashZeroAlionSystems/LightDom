/**
 * Chrome Layers Integration Example
 * 
 * Demonstrates full integration of Chrome Layers system with:
 * - Schema linking
 * - Training data pipeline
 * - Workflow generation
 * - Infographic export
 */

import { ChromeLayersService } from './services/chrome-layers-service.js';
import { LayerInfographicGenerator } from './services/layer-infographic-generator.js';
import fs from 'fs';
import path from 'path';

class ChromeLayersIntegration {
  constructor() {
    this.layersService = new ChromeLayersService({
      headless: true,
      cacheEnabled: true
    });
    this.infographicGenerator = new LayerInfographicGenerator();
    this.outputDir = './output/integration';
  }

  async initialize() {
    console.log('🚀 Initializing Chrome Layers Integration...\n');
    await this.layersService.initialize();
    
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Complete analysis workflow for a URL
   */
  async analyzeWebsite(url) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔍 Analyzing: ${url}`);
    console.log('='.repeat(80) + '\n');

    // Step 1: Extract layer data
    console.log('Step 1: Extracting layer data...');
    const analysis = await this.layersService.analyzeLayersForUrl(url);
    console.log(`✅ Found ${analysis.metadata.totalLayers} layers`);

    // Step 2: Generate training data
    console.log('\nStep 2: Generating training data...');
    const trainingData = await this.layersService.extractTrainingData(url, analysis, {
      designRules: {
        maxZIndex: 10000,
        compositingBestPractices: true
      }
    });
    console.log(`✅ Extracted ${trainingData.patterns ? Object.keys(trainingData.patterns).length : 0} patterns`);

    // Step 3: Link to schemas
    console.log('\nStep 3: Linking components to schemas...');
    const linkedSchemas = this.linkComponentsToSchemas(analysis.componentMap);
    console.log(`✅ Linked ${linkedSchemas.length} components to schemas`);

    // Step 4: Generate infographic
    console.log('\nStep 4: Generating infographic...');
    const infographic = await this.infographicGenerator.generateInfographic(analysis, trainingData);
    console.log(`✅ Created ${infographic.sections.length} sections`);

    // Step 5: Create recommendations
    console.log('\nStep 5: Generating recommendations...');
    const recommendations = this.generateRecommendations(analysis, trainingData, linkedSchemas);
    console.log(`✅ Generated ${recommendations.length} recommendations`);

    // Step 6: Export results
    console.log('\nStep 6: Exporting results...');
    const exportPath = await this.exportResults(url, {
      analysis,
      trainingData,
      linkedSchemas,
      infographic,
      recommendations
    });
    console.log(`✅ Results exported to: ${exportPath}`);

    return {
      analysis,
      trainingData,
      linkedSchemas,
      infographic,
      recommendations,
      exportPath
    };
  }

  /**
   * Link components to database schemas
   */
  linkComponentsToSchemas(componentMap) {
    const linkedSchemas = [];

    componentMap.forEach(component => {
      const schemas = [];

      // Check data attributes for schema hints
      if (component.dataAttributes) {
        Object.keys(component.dataAttributes).forEach(attr => {
          const attrValue = component.dataAttributes[attr];
          
          // Example: data-user-id="123" -> users table
          if (attr.includes('user')) {
            schemas.push({
              table: 'users',
              confidence: 0.9,
              attribute: attr,
              value: attrValue
            });
          }
          
          // Example: data-post-id="456" -> posts table
          if (attr.includes('post')) {
            schemas.push({
              table: 'posts',
              confidence: 0.9,
              attribute: attr,
              value: attrValue
            });
          }

          // Generic pattern matching
          const match = attr.match(/data-(\w+)-id/);
          if (match) {
            schemas.push({
              table: `${match[1]}s`,
              confidence: 0.7,
              attribute: attr,
              value: attrValue
            });
          }
        });
      }

      // Check role attribute
      if (component.role) {
        schemas.push({
          table: 'ui_components',
          confidence: 0.6,
          role: component.role,
          componentType: component.tagName
        });
      }

      if (schemas.length > 0) {
        linkedSchemas.push({
          componentId: component.componentId,
          tagName: component.tagName,
          schemas
        });
      }
    });

    return linkedSchemas;
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(analysis, trainingData, linkedSchemas) {
    const recommendations = [];

    // Performance recommendations
    if (analysis.metadata.compositingLayers > 50) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Reduce Compositing Layers',
        description: `Found ${analysis.metadata.compositingLayers} compositing layers. Consider reducing will-change usage and unnecessary transforms.`,
        impact: 'high',
        effort: 'medium',
        links: ['https://web.dev/stick-to-compositor-only-properties-and-manage-layer-count/']
      });
    }

    if (analysis.metadata.maxZIndex > 10000) {
      recommendations.push({
        category: 'maintainability',
        priority: 'medium',
        title: 'Simplify Z-Index Management',
        description: `Maximum z-index of ${analysis.metadata.maxZIndex} detected. Use a z-index scale (e.g., 10, 20, 30) for better maintainability.`,
        impact: 'medium',
        effort: 'low',
        links: ['https://css-tricks.com/handling-z-index/']
      });
    }

    // Schema linking recommendations
    if (linkedSchemas.length > 0) {
      const avgConfidence = linkedSchemas.reduce((sum, ls) => {
        return sum + ls.schemas.reduce((s, schema) => s + schema.confidence, 0) / ls.schemas.length;
      }, 0) / linkedSchemas.length;

      if (avgConfidence < 0.7) {
        recommendations.push({
          category: 'data-binding',
          priority: 'low',
          title: 'Improve Data Attribute Naming',
          description: 'Schema linking confidence is low. Use consistent data-* attribute naming patterns for better automatic binding.',
          impact: 'low',
          effort: 'low',
          links: ['https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes']
        });
      }
    }

    // Component structure recommendations
    const componentTypes = {};
    analysis.componentMap.forEach(comp => {
      componentTypes[comp.tagName] = (componentTypes[comp.tagName] || 0) + 1;
    });

    if (componentTypes['div'] > analysis.componentMap.length * 0.7) {
      recommendations.push({
        category: 'semantics',
        priority: 'low',
        title: 'Use Semantic HTML',
        description: `${Math.round(componentTypes['div'] / analysis.componentMap.length * 100)}% of components are divs. Consider using semantic HTML elements for better accessibility.`,
        impact: 'medium',
        effort: 'medium',
        links: ['https://web.dev/semantics-builtin/']
      });
    }

    // Design rule violations
    if (trainingData.designRules.violations.length > 0) {
      recommendations.push({
        category: 'compliance',
        priority: 'high',
        title: 'Fix Design Rule Violations',
        description: `Found ${trainingData.designRules.violations.length} design rule violations. Review and address these issues.`,
        impact: 'high',
        effort: 'medium',
        violations: trainingData.designRules.violations
      });
    }

    return recommendations;
  }

  /**
   * Export all results
   */
  async exportResults(url, results) {
    const sanitizedUrl = url.replace(/[^a-z0-9]/gi, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${sanitizedUrl}_${timestamp}.json`;
    const filepath = path.join(this.outputDir, filename);

    const exportData = {
      url,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      ...results,
      summary: {
        totalLayers: results.analysis.metadata.totalLayers,
        compositingLayers: results.analysis.metadata.compositingLayers,
        components: results.analysis.componentMap.length,
        linkedSchemas: results.linkedSchemas.length,
        performanceGrade: results.infographic.sections.find(s => s.type === 'performance')?.grade,
        recommendations: results.recommendations.length
      }
    };

    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    // Also export infographic separately
    await this.infographicGenerator.exportJSON(
      results.infographic,
      `${sanitizedUrl}_${timestamp}_infographic.json`
    );

    // Generate summary report
    this.generateSummaryReport(url, exportData);

    return filepath;
  }

  /**
   * Generate summary report
   */
  generateSummaryReport(url, exportData) {
    const sanitizedUrl = url.replace(/[^a-z0-9]/gi, '_');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.outputDir, `${sanitizedUrl}_${timestamp}_report.md`);

    const report = `# Layer Analysis Report

**URL:** ${url}  
**Generated:** ${new Date().toISOString()}

## Summary

- **Total Layers:** ${exportData.summary.totalLayers}
- **Compositing Layers:** ${exportData.summary.compositingLayers}
- **Components:** ${exportData.summary.components}
- **Linked Schemas:** ${exportData.summary.linkedSchemas}
- **Performance Grade:** ${exportData.summary.performanceGrade || 'N/A'}

## Recommendations

${exportData.recommendations.map((rec, idx) => `
### ${idx + 1}. ${rec.title}

**Category:** ${rec.category}  
**Priority:** ${rec.priority}  
**Impact:** ${rec.impact}  
**Effort:** ${rec.effort}

${rec.description}

${rec.links ? rec.links.map(link => `- [Learn more](${link})`).join('\n') : ''}
`).join('\n')}

## Layer Details

- **Max Z-Index:** ${exportData.analysis.metadata.maxZIndex}
- **Viewport:** ${JSON.stringify(exportData.analysis.metadata.viewport)}

## Design Rule Compliance

- **Violations:** ${exportData.trainingData.designRules.violations.length}
- **Recommendations:** ${exportData.trainingData.designRules.recommendations.length}

## Schema Linking

${exportData.linkedSchemas.length > 0 ? `
Found ${exportData.linkedSchemas.length} components with schema links:

${exportData.linkedSchemas.slice(0, 10).map(ls => `
- **${ls.tagName}** (${ls.componentId}): ${ls.schemas.length} schema(s)
`).join('')}
` : 'No schema links found'}

## Training Data

- **Patterns Extracted:** ${Object.keys(exportData.trainingData.patterns || {}).length}
- **Relationships Found:** ${exportData.trainingData.relationships.length}

---

*Generated by Chrome Layers Integration System*
`;

    fs.writeFileSync(reportPath, report);
    console.log(`📄 Summary report: ${reportPath}`);
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    await this.layersService.cleanup();
  }
}

// Example usage
async function main() {
  const integration = new ChromeLayersIntegration();

  try {
    await integration.initialize();

    // Analyze a website
    const result = await integration.analyzeWebsite('https://example.com');

    console.log('\n' + '='.repeat(80));
    console.log('✅ Integration Complete!');
    console.log('='.repeat(80));
    console.log('\nResults:');
    console.log(`  - Layers: ${result.analysis.metadata.totalLayers}`);
    console.log(`  - Components: ${result.analysis.componentMap.length}`);
    console.log(`  - Linked Schemas: ${result.linkedSchemas.length}`);
    console.log(`  - Recommendations: ${result.recommendations.length}`);
    console.log(`  - Performance Grade: ${result.infographic.sections.find(s => s.type === 'performance')?.grade || 'N/A'}`);
    console.log(`\nExported to: ${result.exportPath}\n`);

  } catch (error) {
    console.error('❌ Integration failed:', error);
  } finally {
    await integration.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ChromeLayersIntegration };
