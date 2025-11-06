/**
 * 3D DOM Data Mining Workflow Demo
 * 
 * Demonstrates the complete workflow:
 * 1. Mine URLs and generate 3D models
 * 2. Extract and link schemas
 * 3. Generate rich snippet recommendations
 * 4. Create training data for SEO optimization
 * 5. Integrate with data mining workflows
 */

import { DOM3DDataMiningService } from './services/dom-3d-datamining-service.js';
import fs from 'fs/promises';
import path from 'path';

class DOM3DMiningWorkflowDemo {
  constructor() {
    this.miningService = new DOM3DDataMiningService({
      headless: true,
      maxDepth: 8,
      minImportanceScore: 0.4
    });

    this.results = [];
  }

  async run() {
    console.log('🚀 3D DOM Data Mining Workflow Demo\n');
    console.log('=' .repeat(70));

    try {
      // Initialize service
      await this.miningService.initialize();

      // Demo 1: Mine a single URL
      await this.demoSingleURL();

      console.log('\n' + '='.repeat(70));

      // Demo 2: Mine multiple URLs for comparison
      await this.demoMultipleURLs();

      console.log('\n' + '='.repeat(70));

      // Demo 3: Generate training dataset
      await this.demoTrainingDataset();

      console.log('\n' + '='.repeat(70));

      // Demo 4: SEO optimization workflow
      await this.demoSEOOptimization();

      console.log('\n' + '='.repeat(70));
      console.log('\n✅ Demo Complete!\n');

      // Save results
      await this.saveResults();

    } catch (error) {
      console.error('❌ Demo failed:', error);
    } finally {
      await this.miningService.shutdown();
    }
  }

  /**
   * Demo 1: Mine a single URL and show complete analysis
   */
  async demoSingleURL() {
    console.log('\n📍 DEMO 1: Single URL Analysis\n');

    // Use a well-structured example site
    const url = 'https://schema.org';

    console.log(`Mining: ${url}\n`);

    const result = await this.miningService.mineURL(url);
    this.results.push(result);

    // Display 3D Model Summary
    console.log('🎨 3D DOM Model:');
    console.log(`   Total Layers: ${result.dom3DModel.layers.length}`);
    console.log(`   Composited Layers: ${result.dom3DModel.layers.filter(l => l.isComposited).length}`);
    console.log(`   Important Elements: ${result.domHierarchy.importantElements.length}`);

    // Display top layers
    console.log('\n   Top 5 Most Important Layers:');
    result.dom3DModel.layers.slice(0, 5).forEach((layer, i) => {
      console.log(`   ${i + 1}. ${layer.nodeName} - Importance: ${layer.importance.toFixed(2)}, Z: ${layer.position3D.z}`);
    });

    // Display Schemas
    console.log('\n📋 Schemas Found:');
    const schemaTypes = Object.keys(result.schemas.byType);
    if (schemaTypes.length > 0) {
      schemaTypes.forEach(type => {
        console.log(`   • ${type}: ${result.schemas.byType[type].length} instance(s)`);
      });
    } else {
      console.log('   No schemas found');
    }

    // Display Schema Recommendations
    if (result.schemas.recommendations.length > 0) {
      console.log('\n💡 Schema Recommendations:');
      result.schemas.recommendations.forEach(rec => {
        console.log(`   • ${rec.type} (${rec.priority}): ${rec.reason}`);
      });
    }

    // Display SEO Score and Recommendations
    console.log(`\n🎯 SEO Score: ${result.metadata.seoScore.toFixed(1)}/100`);
    
    if (result.seo.recommendations.length > 0) {
      console.log('\n⚠️  SEO Recommendations:');
      result.seo.recommendations.slice(0, 5).forEach(rec => {
        console.log(`   [${rec.severity}] ${rec.message}`);
      });
    }

    // Display Rich Snippets
    if (result.seo.richSnippets.length > 0) {
      console.log('\n✨ Rich Snippet Opportunities:');
      result.seo.richSnippets.forEach(snippet => {
        console.log(`   • ${snippet.type} (${snippet.status}): ${snippet.preview}`);
      });
    }

    console.log(`\n⏱️  Processing Time: ${result.metadata.processingTime}ms`);
  }

  /**
   * Demo 2: Mine multiple URLs for comparison
   */
  async demoMultipleURLs() {
    console.log('\n📍 DEMO 2: Multiple URL Comparison\n');

    const urls = [
      'https://example.com',
      'https://www.w3.org'
    ];

    console.log(`Mining ${urls.length} URLs for comparison...\n`);

    const comparisonResults = [];

    for (const url of urls) {
      try {
        console.log(`Mining: ${url}`);
        const result = await this.miningService.mineURL(url);
        comparisonResults.push({
          url,
          seoScore: result.metadata.seoScore,
          schemaCount: Object.keys(result.schemas.byType).length,
          layerCount: result.dom3DModel.layers.length,
          importantElements: result.domHierarchy.importantElements.length
        });
        this.results.push(result);
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }

    // Display comparison table
    console.log('\n📊 Comparison Results:\n');
    console.log('URL'.padEnd(30) + ' | SEO | Schemas | Layers | Elements');
    console.log('-'.repeat(70));

    comparisonResults.forEach(result => {
      const urlShort = result.url.substring(0, 28);
      console.log(
        urlShort.padEnd(30) + ' | ' +
        result.seoScore.toFixed(0).padStart(3) + ' | ' +
        result.schemaCount.toString().padStart(7) + ' | ' +
        result.layerCount.toString().padStart(6) + ' | ' +
        result.importantElements.toString().padStart(8)
      );
    });

    // Find best performing URL
    if (comparisonResults.length > 0) {
      const best = comparisonResults.reduce((prev, current) => 
        current.seoScore > prev.seoScore ? current : prev
      );
      console.log(`\n🏆 Best SEO Score: ${best.url} (${best.seoScore.toFixed(1)}/100)`);
    }
  }

  /**
   * Demo 3: Generate ML training dataset
   */
  async demoTrainingDataset() {
    console.log('\n📍 DEMO 3: Generate ML Training Dataset\n');

    if (this.results.length === 0) {
      console.log('No results available for training data generation');
      return;
    }

    console.log(`Creating training dataset from ${this.results.length} mined URLs...\n`);

    const trainingData = {
      version: '1.0',
      created: new Date().toISOString(),
      samples: this.results.map(result => result.trainingData),
      metadata: {
        totalSamples: this.results.length,
        featureCount: Object.keys(this.results[0].trainingData.features).length,
        labelCount: Object.keys(this.results[0].trainingData.labels).length
      }
    };

    // Display dataset statistics
    console.log('📊 Dataset Statistics:');
    console.log(`   Total Samples: ${trainingData.metadata.totalSamples}`);
    console.log(`   Features per Sample: ${trainingData.metadata.featureCount}`);
    console.log(`   Labels per Sample: ${trainingData.metadata.labelCount}`);

    // Display feature summary
    console.log('\n📈 Feature Statistics:');
    const avgFeatures = this.calculateAverageFeatures(trainingData.samples);
    
    console.log(`   Avg Total Layers: ${avgFeatures.totalLayers.toFixed(1)}`);
    console.log(`   Avg Schema Types: ${avgFeatures.schemaTypes.toFixed(1)}`);
    console.log(`   Avg Title Length: ${avgFeatures.titleLength.toFixed(1)}`);
    console.log(`   Avg Internal Links: ${avgFeatures.internalLinks.toFixed(1)}`);

    // Display label distribution
    console.log('\n🎯 Label Distribution:');
    const avgLabels = this.calculateAverageLabels(trainingData.samples);
    console.log(`   Avg SEO Score: ${avgLabels.seoScore.toFixed(1)}/100`);
    console.log(`   Sites with Rich Snippets: ${(avgLabels.richSnippetRate * 100).toFixed(1)}%`);

    console.log('\n💾 Training data structure:');
    console.log('   {');
    console.log('     features: { ...DOM and SEO features... },');
    console.log('     labels: { seoScore, hasRichSnippets },');
    console.log('     metadata: { url, timestamp }');
    console.log('   }');
  }

  /**
   * Demo 4: SEO Optimization Workflow
   */
  async demoSEOOptimization() {
    console.log('\n📍 DEMO 4: SEO Optimization Workflow\n');

    if (this.results.length === 0) {
      console.log('No results available for optimization workflow');
      return;
    }

    console.log('Analyzing results for SEO optimization opportunities...\n');

    // Aggregate all recommendations
    const allRecommendations = [];
    const recommendationCounts = {};

    this.results.forEach(result => {
      result.seo.recommendations.forEach(rec => {
        allRecommendations.push(rec);
        recommendationCounts[rec.type] = (recommendationCounts[rec.type] || 0) + 1;
      });
    });

    // Display top issues
    console.log('🔍 Most Common SEO Issues:');
    const sortedIssues = Object.entries(recommendationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    sortedIssues.forEach(([type, count], i) => {
      console.log(`   ${i + 1}. ${type}: ${count} site(s)`);
    });

    // Display optimization priorities
    console.log('\n⚡ Optimization Priorities:');
    const highPriority = allRecommendations.filter(r => r.severity === 'high');
    const mediumPriority = allRecommendations.filter(r => r.severity === 'medium');

    console.log(`   High Priority Issues: ${highPriority.length}`);
    console.log(`   Medium Priority Issues: ${mediumPriority.length}`);

    if (highPriority.length > 0) {
      console.log('\n   Top High Priority Items:');
      highPriority.slice(0, 3).forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec.message}`);
      });
    }

    // Display schema opportunities
    console.log('\n📋 Schema Opportunities:');
    const schemaRecs = [];
    this.results.forEach(result => {
      result.schemas.recommendations.forEach(rec => {
        if (!schemaRecs.find(r => r.type === rec.type)) {
          schemaRecs.push(rec);
        }
      });
    });

    if (schemaRecs.length > 0) {
      schemaRecs.forEach(rec => {
        console.log(`   • ${rec.type} - ${rec.reason}`);
      });
    } else {
      console.log('   No additional schema opportunities found');
    }

    // Display action plan
    console.log('\n📝 Recommended Action Plan:');
    console.log('   1. Fix high priority SEO issues');
    console.log('   2. Add recommended schemas for rich snippets');
    console.log('   3. Optimize DOM structure for better 3D hierarchy');
    console.log('   4. Monitor SEO score improvements');
    console.log('   5. Use training data to predict optimal structure');
  }

  /**
   * Calculate average features
   */
  calculateAverageFeatures(samples) {
    const sums = {};
    const count = samples.length;

    samples.forEach(sample => {
      Object.keys(sample.features).forEach(key => {
        if (typeof sample.features[key] === 'number') {
          sums[key] = (sums[key] || 0) + sample.features[key];
        }
      });
    });

    const averages = {};
    Object.keys(sums).forEach(key => {
      averages[key] = sums[key] / count;
    });

    return averages;
  }

  /**
   * Calculate average labels
   */
  calculateAverageLabels(samples) {
    let totalScore = 0;
    let richSnippetCount = 0;

    samples.forEach(sample => {
      totalScore += sample.labels.seoScore;
      if (sample.labels.hasRichSnippets) {
        richSnippetCount++;
      }
    });

    return {
      seoScore: totalScore / samples.length,
      richSnippetRate: richSnippetCount / samples.length
    };
  }

  /**
   * Save results to files
   */
  async saveResults() {
    try {
      const outputDir = './output/dom-3d-mining';
      await fs.mkdir(outputDir, { recursive: true });

      // Save full results
      await fs.writeFile(
        path.join(outputDir, 'mining-results.json'),
        JSON.stringify(this.results, null, 2)
      );

      // Save training data
      const trainingData = {
        version: '1.0',
        created: new Date().toISOString(),
        samples: this.results.map(r => r.trainingData)
      };

      await fs.writeFile(
        path.join(outputDir, 'training-data.json'),
        JSON.stringify(trainingData, null, 2)
      );

      // Save summary report
      const summary = {
        totalURLs: this.results.length,
        averageSEOScore: this.results.reduce((sum, r) => sum + r.metadata.seoScore, 0) / this.results.length,
        totalSchemaTypes: new Set(this.results.flatMap(r => Object.keys(r.schemas.byType))).size,
        commonIssues: this.getCommonIssues(),
        processingTime: this.results.reduce((sum, r) => sum + r.metadata.processingTime, 0)
      };

      await fs.writeFile(
        path.join(outputDir, 'summary-report.json'),
        JSON.stringify(summary, null, 2)
      );

      console.log(`\n💾 Results saved to ${outputDir}/`);

    } catch (error) {
      console.error('Error saving results:', error);
    }
  }

  /**
   * Get common issues across all results
   */
  getCommonIssues() {
    const issues = {};

    this.results.forEach(result => {
      result.seo.recommendations.forEach(rec => {
        if (!issues[rec.type]) {
          issues[rec.type] = {
            type: rec.type,
            count: 0,
            examples: []
          };
        }
        issues[rec.type].count++;
        if (issues[rec.type].examples.length < 3) {
          issues[rec.type].examples.push(rec.message);
        }
      });
    });

    return Object.values(issues).sort((a, b) => b.count - a.count);
  }
}

// Run demo if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new DOM3DMiningWorkflowDemo();
  demo.run().catch(console.error);
}

export default DOM3DMiningWorkflowDemo;
