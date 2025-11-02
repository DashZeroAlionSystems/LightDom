#!/usr/bin/env node

/**
 * Chrome Layers 3D Demo
 * 
 * Demonstrates the Chrome Layers Panel functionality including:
 * - 3D layer extraction
 * - Component mapping
 * - Schema linking
 * - Training data generation
 */

import { ChromeLayersService } from './services/chrome-layers-service.js';
import fs from 'fs';
import path from 'path';

async function runDemo() {
  console.log('🚀 Chrome Layers 3D Demo Starting...\n');

  const service = new ChromeLayersService({
    headless: false, // Set to false to watch the browser work
    cacheEnabled: false
  });

  try {
    // Initialize service
    console.log('📦 Initializing Chrome Layers Service...');
    await service.initialize();
    console.log('✅ Service initialized\n');

    // Demo URLs to analyze
    const demoUrls = [
      'https://example.com',
      'https://github.com',
    ];

    console.log(`📊 Analyzing ${demoUrls.length} URLs...\n`);

    for (const url of demoUrls) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🔍 Analyzing: ${url}`);
      console.log('='.repeat(80));

      try {
        // 1. Analyze layers
        console.log('\n📐 Step 1: Extracting layer data...');
        const analysis = await service.analyzeLayersForUrl(url);
        
        console.log(`   ✓ Total layers: ${analysis.metadata.totalLayers}`);
        console.log(`   ✓ Compositing layers: ${analysis.metadata.compositingLayers}`);
        console.log(`   ✓ Max Z-index: ${analysis.metadata.maxZIndex}`);
        console.log(`   ✓ Components found: ${analysis.componentMap.length}`);

        // 2. Display 3D map summary
        console.log('\n🗺️  Step 2: 3D Map Data');
        const map3D = analysis.map3D;
        console.log(`   ✓ 3D positions generated for ${map3D.length} layers`);
        
        // Show depth distribution
        const depthDistribution = {};
        map3D.forEach(layer => {
          const depth = Math.floor(layer.position.z / 10);
          depthDistribution[depth] = (depthDistribution[depth] || 0) + 1;
        });
        console.log('   Depth distribution:');
        Object.entries(depthDistribution)
          .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
          .forEach(([depth, count]) => {
            console.log(`     Depth ${depth}: ${'█'.repeat(Math.min(count, 50))} ${count}`);
          });

        // 3. Component mapping
        console.log('\n🎯 Step 3: Component Mapping');
        const topComponents = analysis.componentMap.slice(0, 5);
        console.log(`   Top 5 components (by position):`);
        topComponents.forEach((comp, idx) => {
          console.log(`     ${idx + 1}. <${comp.tagName}> at (${Math.round(comp.bounds.x)}, ${Math.round(comp.bounds.y)})`);
          if (comp.role) console.log(`        Role: ${comp.role}`);
          if (comp.layerId) console.log(`        Layer ID: ${comp.layerId}`);
        });

        // 4. Training data extraction
        console.log('\n🧠 Step 4: Extracting Training Data...');
        const trainingData = await service.extractTrainingData(url, analysis, {
          designRules: {
            maxZIndex: 10000,
            compositingBestPractices: true
          }
        });

        console.log(`   ✓ Structure analyzed:`);
        console.log(`     - Layer count: ${trainingData.structure.layerCount}`);
        console.log(`     - Component count: ${trainingData.structure.componentCount}`);
        console.log(`     - Max depth: ${trainingData.structure.maxDepth}`);

        console.log(`\n   ✓ Patterns extracted:`);
        console.log(`     - Z-index distribution: min=${trainingData.patterns.zIndexDistribution.min}, max=${trainingData.patterns.zIndexDistribution.max}`);
        console.log(`     - Compositing triggers: ${JSON.stringify(trainingData.patterns.compositingTriggers)}`);
        console.log(`     - Layout patterns: ${JSON.stringify(trainingData.patterns.layoutPatterns)}`);

        console.log(`\n   ✓ Relationships discovered: ${trainingData.relationships.length}`);
        const relationshipTypes = {};
        trainingData.relationships.forEach(rel => {
          relationshipTypes[rel.type] = (relationshipTypes[rel.type] || 0) + 1;
        });
        console.log(`     - By type: ${JSON.stringify(relationshipTypes)}`);

        // 5. Design rule validation
        console.log('\n✅ Step 5: Design Rule Validation');
        const rules = trainingData.designRules;
        console.log(`   Applied rules: ${JSON.stringify(rules.rules)}`);
        
        if (rules.violations.length > 0) {
          console.log(`   ⚠️  Violations found: ${rules.violations.length}`);
          rules.violations.slice(0, 3).forEach(v => {
            console.log(`     - ${v.type}: Layer ${v.layerId} (value: ${v.value}, threshold: ${v.threshold})`);
          });
        } else {
          console.log(`   ✓ No violations found`);
        }

        if (rules.recommendations.length > 0) {
          console.log(`   💡 Recommendations: ${rules.recommendations.length}`);
          rules.recommendations.forEach(r => {
            console.log(`     - ${r.type}: ${r.suggestion}`);
          });
        }

        // 6. Save results
        const outputDir = './output/chrome-layers';
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const sanitizedUrl = url.replace(/[^a-z0-9]/gi, '_');
        const outputPath = path.join(outputDir, `${sanitizedUrl}_analysis.json`);
        
        fs.writeFileSync(outputPath, JSON.stringify({
          url,
          timestamp: new Date().toISOString(),
          analysis,
          trainingData
        }, null, 2));

        console.log(`\n💾 Results saved to: ${outputPath}`);

        // Generate visualization HTML
        const htmlPath = path.join(outputDir, `${sanitizedUrl}_visualization.html`);
        generateVisualizationHTML(analysis, htmlPath);
        console.log(`🎨 Visualization saved to: ${htmlPath}`);

      } catch (error) {
        console.error(`\n❌ Error analyzing ${url}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Demo completed successfully!');
    console.log('='.repeat(80) + '\n');

    // Summary statistics
    console.log('📈 Summary Statistics:');
    console.log(`   - URLs analyzed: ${demoUrls.length}`);
    console.log(`   - Output directory: ./output/chrome-layers`);
    console.log(`   - View visualization files in browser\n`);

  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    // Cleanup
    console.log('🧹 Cleaning up...');
    await service.cleanup();
    console.log('👋 Goodbye!\n');
  }
}

/**
 * Generate a simple HTML visualization
 */
function generateVisualizationHTML(analysis, outputPath) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Layer Visualization - ${analysis.url}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
      border-bottom: 3px solid #1890ff;
      padding-bottom: 10px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 20px 0;
    }
    .stat-card {
      background: #f0f2f5;
      padding: 20px;
      border-radius: 4px;
      text-align: center;
    }
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #1890ff;
    }
    .stat-label {
      color: #666;
      margin-top: 8px;
    }
    canvas {
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 20px 0;
      background: white;
    }
    .legend {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin: 20px 0;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background: #f0f2f5;
      font-weight: bold;
    }
    tr:hover {
      background: #f9f9f9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 Layer Visualization</h1>
    <p><strong>URL:</strong> ${analysis.url}</p>
    <p><strong>Analyzed:</strong> ${analysis.timestamp}</p>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${analysis.metadata.totalLayers}</div>
        <div class="stat-label">Total Layers</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${analysis.metadata.compositingLayers}</div>
        <div class="stat-label">Compositing Layers</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${analysis.metadata.maxZIndex}</div>
        <div class="stat-label">Max Z-Index</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${analysis.componentMap.length}</div>
        <div class="stat-label">Components</div>
      </div>
    </div>

    <h2>3D Visualization</h2>
    <canvas id="canvas3d" width="1200" height="600"></canvas>

    <div class="legend">
      <div class="legend-item">
        <div class="legend-color" style="background: #4CAF50;"></div>
        <span>Composited</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #2196F3;"></div>
        <span>Fixed</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #FF9800;"></div>
        <span>Absolute</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #9C27B0;"></div>
        <span>Relative</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: #757575;"></div>
        <span>Static</span>
      </div>
    </div>

    <h2>Component Map</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Tag</th>
          <th>Position</th>
          <th>Bounds</th>
          <th>Z-Index</th>
          <th>Layer ID</th>
        </tr>
      </thead>
      <tbody>
        ${analysis.componentMap.slice(0, 20).map((comp, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>${comp.tagName}</td>
            <td>${comp.position}</td>
            <td>${Math.round(comp.bounds.x)}, ${Math.round(comp.bounds.y)} (${Math.round(comp.bounds.width)}×${Math.round(comp.bounds.height)})</td>
            <td>${comp.zIndex}</td>
            <td>${comp.layerId || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <script>
    const layerData = ${JSON.stringify(analysis.map3D)};
    const canvas = document.getElementById('canvas3d');
    const ctx = canvas.getContext('2d');
    
    function render3D() {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const scale = 0.3;
      const rotX = 45 * Math.PI / 180;
      const rotY = 45 * Math.PI / 180;

      ctx.clearRect(0, 0, width, height);

      // Sort by Z depth
      const sorted = [...layerData].sort((a, b) => a.position.z - b.position.z);

      sorted.forEach(layer => {
        const x = layer.position.x - centerX;
        const y = layer.position.y - centerY;
        const z = layer.position.z;

        // Rotate
        const x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
        const z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
        const y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);

        // Project
        const perspective = 1000;
        const projScale = perspective / (perspective + z2);
        const px = centerX + x1 * scale * projScale;
        const py = centerY + y1 * scale * projScale;
        const w = layer.dimensions.width * scale * projScale;
        const h = layer.dimensions.height * scale * projScale;

        ctx.fillStyle = layer.color;
        ctx.globalAlpha = layer.metadata.opacity * 0.7;
        ctx.fillRect(px - w/2, py - h/2, w, h);
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
        ctx.strokeRect(px - w/2, py - h/2, w, h);
      });
    }

    render3D();
  </script>
</body>
</html>`;

  fs.writeFileSync(outputPath, html);
}

// Run demo
runDemo().catch(console.error);
