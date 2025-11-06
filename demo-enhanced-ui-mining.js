/**
 * Enhanced UI Pattern Mining Demo
 * 
 * Demonstrates advanced UI/UX pattern detection capabilities:
 * 1. Component pattern recognition
 * 2. Design token extraction
 * 3. Layout analysis
 * 4. Interaction mining
 * 5. Design system compliance
 * 6. Performance analysis
 */

import { EnhancedUIPatternMiningService } from './services/enhanced-ui-pattern-mining-service.js';
import fs from 'fs/promises';
import path from 'path';

class EnhancedUIPatternMiningDemo {
  constructor() {
    this.miningService = new EnhancedUIPatternMiningService({
      headless: true,
      maxDepth: 8,
      minImportanceScore: 0.4
    });

    this.results = [];
  }

  async run() {
    console.log('🎨 Enhanced UI Pattern Mining Demo\n');
    console.log('=' .repeat(70));

    try {
      await this.miningService.initialize();

      // Demo 1: Component Pattern Recognition
      await this.demoComponentRecognition();

      console.log('\n' + '='.repeat(70));

      // Demo 2: Design Token Extraction
      await this.demoDesignTokens();

      console.log('\n' + '='.repeat(70));

      // Demo 3: Performance Analysis
      await this.demoPerformanceAnalysis();

      console.log('\n' + '='.repeat(70));

      // Demo 4: Competitive Pattern Analysis
      await this.demoCompetitiveAnalysis();

      console.log('\n' + '='.repeat(70));
      console.log('\n✅ Demo Complete!\n');

      await this.saveResults();

    } catch (error) {
      console.error('❌ Demo failed:', error);
    } finally {
      await this.miningService.shutdown();
    }
  }

  /**
   * Demo 1: Component Pattern Recognition
   */
  async demoComponentRecognition() {
    console.log('\n📍 DEMO 1: Component Pattern Recognition\n');

    const url = 'https://example.com';
    console.log(`Mining components from: ${url}\n`);

    const result = await this.miningService.mineURL(url, {
      includeInteractions: true
    });

    this.results.push(result);

    // Display component counts
    console.log('🧩 Component Patterns Found:');
    Object.entries(result.uiPatterns).forEach(([type, components]) => {
      console.log(`   ${type.padEnd(12)}: ${components.length} pattern(s)`);
    });

    // Display button details
    if (result.uiPatterns.buttons.length > 0) {
      console.log('\n🔘 Button Patterns:');
      const buttonsByVariant = this.groupBy(result.uiPatterns.buttons, 'variant');
      Object.entries(buttonsByVariant).forEach(([variant, buttons]) => {
        console.log(`   ${variant}: ${buttons.length} button(s)`);
      });

      // Show example
      const exampleButton = result.uiPatterns.buttons[0];
      console.log('\n   Example Button:');
      console.log(`   - Size: ${exampleButton.position3D.width}x${exampleButton.position3D.height}`);
      console.log(`   - Variant: ${exampleButton.variant}`);
      console.log(`   - Size Class: ${exampleButton.size}`);
      console.log(`   - Z-Index: ${exampleButton.position3D.z}`);
    }

    // Display card details
    if (result.uiPatterns.cards.length > 0) {
      console.log('\n🃏 Card Patterns:');
      const cardsByVariant = this.groupBy(result.uiPatterns.cards, 'variant');
      Object.entries(cardsByVariant).forEach(([variant, cards]) => {
        console.log(`   ${variant}: ${cards.length} card(s)`);
      });
    }

    console.log(`\n📊 Total Components: ${result.metadata.componentCount}`);
  }

  /**
   * Demo 2: Design Token Extraction
   */
  async demoDesignTokens() {
    console.log('\n📍 DEMO 2: Design Token Extraction\n');

    if (this.results.length === 0) {
      console.log('No results available');
      return;
    }

    const result = this.results[0];
    const tokens = result.designTokens;

    // Colors
    console.log('🎨 Color Tokens:');
    console.log(`   Primary: ${tokens.colors.primary || 'N/A'}`);
    console.log(`   Text: ${tokens.colors.text || 'N/A'}`);
    console.log(`   Border: ${tokens.colors.border || 'N/A'}`);
    console.log(`\n   Background Palette (top 5):`);
    tokens.colors.palette.backgrounds.slice(0, 5).forEach(({ value, count }) => {
      console.log(`   - ${value}: ${count} usage(s)`);
    });

    // Spacing
    console.log('\n📏 Spacing Tokens:');
    console.log(`   Scale: [${tokens.spacing.scale.join(', ')}]`);
    console.log(`   Most Common: ${tokens.spacing.commonPadding}px`);

    // Typography
    console.log('\n✍️  Typography Tokens:');
    console.log(`   Font Families: ${tokens.typography.fontFamilies.slice(0, 3).join(', ')}`);
    console.log(`   Font Size Scale: [${tokens.typography.fontSizeScale.join(', ')}]`);
    console.log(`   Font Weights: [${tokens.typography.fontWeights.join(', ')}]`);

    // Borders
    console.log('\n🔲 Border Tokens:');
    console.log(`   Widths: [${tokens.borders.widths.join(', ')}]px`);
    console.log(`   Styles: ${tokens.borders.styles.join(', ')}`);

    // Border Radius
    console.log('\n⚪ Border Radius:');
    console.log(`   Scale: [${tokens.borderRadius.scale.join(', ')}]px`);
    console.log(`   Most Common: ${tokens.borderRadius.common}px`);

    console.log(`\n📊 Total Tokens: ${result.metadata.tokenCount}`);

    // Generate design system export
    const designSystem = this.generateDesignSystemExport(tokens);
    console.log('\n💾 Design System Export Preview:');
    console.log(JSON.stringify(designSystem, null, 2).substring(0, 500) + '...');
  }

  /**
   * Demo 3: Performance Analysis
   */
  async demoPerformanceAnalysis() {
    console.log('\n📍 DEMO 3: Performance Analysis\n');

    if (this.results.length === 0) {
      console.log('No results available');
      return;
    }

    const result = this.results[0];
    const perf = result.performance;

    console.log('⚡ Performance Metrics:');
    console.log(`   Overall Score: ${perf.score.toFixed(1)}/100`);
    console.log(`   Total Layers: ${perf.metrics.totalLayers}`);
    console.log(`   Composited Layers: ${perf.metrics.compositedLayers}`);
    console.log(`   Compositing Ratio: ${perf.metrics.compositingRatio.toFixed(1)}%`);
    console.log(`   Max Z-Index: ${perf.metrics.maxZIndex}`);
    console.log(`   Complex Elements: ${perf.metrics.complexElements}`);

    if (perf.recommendations.length > 0) {
      console.log('\n💡 Performance Recommendations:');
      perf.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. [${rec.severity}] ${rec.message}`);
      });
    } else {
      console.log('\n✅ No performance issues detected');
    }

    // Interaction analysis
    if (result.interactions) {
      console.log('\n🎭 Interaction Patterns:');
      console.log(`   Hover Effects: ${result.interactions.hovers.length}`);
      console.log(`   Transitions: ${result.interactions.transitions.length}`);
      console.log(`   Animations: ${result.interactions.animations.length}`);
    }
  }

  /**
   * Demo 4: Competitive Pattern Analysis
   */
  async demoCompetitiveAnalysis() {
    console.log('\n📍 DEMO 4: Competitive Pattern Analysis\n');

    const urls = [
      'https://example.com',
      'https://www.w3.org'
    ];

    console.log(`Analyzing ${urls.length} competitors...\n`);

    const competitors = [];

    for (const url of urls) {
      try {
        console.log(`Mining: ${url}`);
        const result = await this.miningService.mineURL(url);
        competitors.push({
          url,
          result
        });
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }

    if (competitors.length < 2) {
      console.log('\nNeed at least 2 competitors for comparison');
      return;
    }

    // Compare design tokens
    console.log('\n🎨 Color Palette Comparison:\n');
    console.log('URL'.padEnd(30) + ' | Primary Color | Palette Size');
    console.log('-'.repeat(70));

    competitors.forEach(comp => {
      const url = comp.url.substring(0, 28);
      const primary = comp.result.designTokens.colors.primary || 'N/A';
      const paletteSize = comp.result.designTokens.colors.palette.backgrounds.length;

      console.log(
        url.padEnd(30) + ' | ' +
        primary.padEnd(13) + ' | ' +
        paletteSize.toString().padStart(12)
      );
    });

    // Compare spacing scales
    console.log('\n📏 Spacing Scale Comparison:\n');
    competitors.forEach(comp => {
      const scale = comp.result.designTokens.spacing.scale;
      console.log(`${comp.url}:`);
      console.log(`   [${scale.join(', ')}]`);
    });

    // Compare component counts
    console.log('\n🧩 Component Count Comparison:\n');
    console.log('URL'.padEnd(30) + ' | Buttons | Cards | Inputs');
    console.log('-'.repeat(70));

    competitors.forEach(comp => {
      const url = comp.url.substring(0, 28);
      const buttons = comp.result.uiPatterns.buttons.length;
      const cards = comp.result.uiPatterns.cards.length;
      const inputs = comp.result.uiPatterns.inputs.length;

      console.log(
        url.padEnd(30) + ' | ' +
        buttons.toString().padStart(7) + ' | ' +
        cards.toString().padStart(5) + ' | ' +
        inputs.toString().padStart(6)
      );
    });

    // Performance comparison
    console.log('\n⚡ Performance Comparison:\n');
    console.log('URL'.padEnd(30) + ' | Score | Composited | Complex');
    console.log('-'.repeat(70));

    competitors.forEach(comp => {
      const url = comp.url.substring(0, 28);
      const score = comp.result.performance.score.toFixed(0);
      const composited = comp.result.performance.metrics.compositedLayers;
      const complex = comp.result.performance.metrics.complexElements;

      console.log(
        url.padEnd(30) + ' | ' +
        score.padStart(5) + ' | ' +
        composited.toString().padStart(10) + ' | ' +
        complex.toString().padStart(7)
      );
    });

    // Identify trends
    console.log('\n📈 Design Trends:');
    const avgButtonRadius = this.calculateAverageButtonRadius(competitors);
    console.log(`   Average Button Border Radius: ${avgButtonRadius.toFixed(1)}px`);

    const commonSpacing = this.findCommonSpacing(competitors);
    console.log(`   Most Common Spacing Unit: ${commonSpacing}px`);
  }

  /**
   * Helper: Group by property
   */
  groupBy(array, property) {
    return array.reduce((acc, obj) => {
      const key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  }

  /**
   * Helper: Generate design system export
   */
  generateDesignSystemExport(tokens) {
    return {
      version: '1.0.0',
      tokens: {
        colors: {
          primary: tokens.colors.primary,
          text: tokens.colors.text,
          border: tokens.colors.border
        },
        spacing: {
          scale: tokens.spacing.scale
        },
        typography: {
          fontFamily: tokens.typography.fontFamilies[0],
          fontSizeScale: tokens.typography.fontSizeScale,
          fontWeights: tokens.typography.fontWeights
        },
        borders: {
          widths: tokens.borders.widths,
          radius: tokens.borderRadius.scale
        }
      }
    };
  }

  /**
   * Helper: Calculate average button radius
   */
  calculateAverageButtonRadius(competitors) {
    const radii = [];

    competitors.forEach(comp => {
      comp.result.uiPatterns.buttons.forEach(button => {
        const radius = parseInt(button.styles['border-radius']);
        if (!isNaN(radius)) {
          radii.push(radius);
        }
      });
    });

    return radii.length > 0 
      ? radii.reduce((a, b) => a + b, 0) / radii.length 
      : 0;
  }

  /**
   * Helper: Find common spacing
   */
  findCommonSpacing(competitors) {
    const allSpacing = [];

    competitors.forEach(comp => {
      allSpacing.push(...comp.result.designTokens.spacing.scale);
    });

    // Find most frequent value
    const counts = {};
    allSpacing.forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });

    return Object.keys(counts).reduce((a, b) => 
      counts[a] > counts[b] ? a : b
    );
  }

  /**
   * Save results
   */
  async saveResults() {
    try {
      const outputDir = './output/ui-pattern-mining';
      await fs.mkdir(outputDir, { recursive: true });

      // Save full results
      await fs.writeFile(
        path.join(outputDir, 'mining-results.json'),
        JSON.stringify(this.results, null, 2)
      );

      // Save design tokens
      if (this.results.length > 0) {
        const tokens = this.results[0].designTokens;
        const designSystem = this.generateDesignSystemExport(tokens);

        await fs.writeFile(
          path.join(outputDir, 'design-system.json'),
          JSON.stringify(designSystem, null, 2)
        );
      }

      console.log(`\n💾 Results saved to ${outputDir}/`);

    } catch (error) {
      console.error('Error saving results:', error);
    }
  }
}

// Run demo
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = new EnhancedUIPatternMiningDemo();
  demo.run().catch(console.error);
}

export default EnhancedUIPatternMiningDemo;
