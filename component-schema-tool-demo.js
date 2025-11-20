#!/usr/bin/env node

/**
 * Component Schema Tool Demo
 * Demonstrates the component analyzer and schema visualization tools
 */

import pg from 'pg';
import ComponentAnalyzerService from './services/component-analyzer-service.js';

const { Pool } = pg;

async function runDemo() {
  console.log('🚀 Component Schema Tool Demo');
  console.log('='.repeat(60));
  console.log('');

  const service = new ComponentAnalyzerService();
  
  try {
    // Initialize
    console.log('1️⃣  Initializing service...');
    await service.initialize();
    console.log('✅ Service initialized\n');

    // Analyze a sample URL
    const sampleUrl = process.argv[2] || 'https://example.com';
    console.log(`2️⃣  Analyzing URL: ${sampleUrl}`);
    console.log('   This will:');
    console.log('   - Capture screenshot');
    console.log('   - Extract DOM components');
    console.log('   - Break down into atom components');
    console.log('   - Generate schema mappings');
    console.log('   - Track in database\n');
    
    const result = await service.analyzeUrl(sampleUrl, {
      waitFor: 2000,
      viewport: { width: 1920, height: 1080 },
      fullPage: true,
      captureMetadata: true
    });
    
    console.log('✅ Analysis complete!\n');
    
    // Display results
    console.log('📊 Analysis Results:');
    console.log('='.repeat(60));
    console.log(`   Analysis ID: ${result.analysisId}`);
    console.log(`   Screenshot: ${result.screenshotPath}`);
    console.log(`   Total Components: ${result.componentCount}`);
    console.log(`   Atom Components: ${result.atomComponentCount}`);
    console.log('');
    
    // Show component breakdown
    console.log('📦 Component Breakdown:');
    console.log('='.repeat(60));
    
    const byClassification = {};
    const byFamily = {};
    
    result.components.forEach(comp => {
      byClassification[comp.classification] = (byClassification[comp.classification] || 0) + 1;
      byFamily[comp.componentFamily] = (byFamily[comp.componentFamily] || 0) + 1;
    });
    
    console.log('\n   By Classification:');
    Object.entries(byClassification)
      .sort((a, b) => b[1] - a[1])
      .forEach(([classification, count]) => {
        console.log(`   - ${classification.padEnd(25)} : ${count}`);
      });
    
    console.log('\n   By Component Family:');
    Object.entries(byFamily)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([family, count]) => {
        console.log(`   - ${family.padEnd(25)} : ${count}`);
      });
    
    // Show top reusable components
    console.log('\n🌟 Top Reusable Components:');
    console.log('='.repeat(60));
    
    const topReusable = result.components
      .sort((a, b) => b.reuseScore - a.reuseScore)
      .slice(0, 10);
    
    topReusable.forEach((comp, idx) => {
      console.log(`   ${idx + 1}. ${comp.type} (${comp.classification})`);
      console.log(`      Reuse Score: ${comp.reuseScore}/100`);
      console.log(`      Complexity: ${comp.complexityScore}/100`);
      console.log(`      Family: ${comp.componentFamily}`);
      console.log('');
    });
    
    // Show SEO components
    const seoComponents = result.components.filter(comp => 
      comp.seoProperties.isHeading || 
      comp.seoProperties.isLink || 
      comp.seoProperties.isImage
    );
    
    console.log('🔍 SEO-Related Components:');
    console.log('='.repeat(60));
    console.log(`   Headings: ${seoComponents.filter(c => c.seoProperties.isHeading).length}`);
    console.log(`   Links: ${seoComponents.filter(c => c.seoProperties.isLink).length}`);
    console.log(`   Images: ${seoComponents.filter(c => c.seoProperties.isImage).length}`);
    console.log('');
    
    // Show metadata
    console.log('📄 Page Metadata:');
    console.log('='.repeat(60));
    console.log(`   Title: ${result.metadata.title || 'N/A'}`);
    console.log(`   Description: ${(result.metadata.description || 'N/A').substring(0, 100)}...`);
    console.log(`   Schemas: ${result.metadata.schemas?.length || 0}`);
    console.log(`   H1 Tags: ${result.metadata.h1Tags?.length || 0}`);
    console.log(`   H2 Tags: ${result.metadata.h2Tags?.length || 0}`);
    console.log(`   Images: ${result.metadata.images || 0}`);
    console.log(`   Links: ${result.metadata.links || 0}`);
    console.log(`   Forms: ${result.metadata.forms || 0}`);
    console.log('');
    
    // Query database for stats
    console.log('💾 Database Statistics:');
    console.log('='.repeat(60));
    
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5434,
      database: process.env.DB_NAME || 'lightdom',
      user: process.env.DB_USER || 'lightdom_user',
      password: process.env.DB_PASSWORD || 'lightdom_password',
    });
    
    try {
      const statsQuery = `
        SELECT 
          COUNT(DISTINCT analysis_id) as total_analyses,
          COUNT(*) as total_components,
          AVG(reuse_score) as avg_reuse_score,
          AVG(complexity_score) as avg_complexity_score
        FROM atom_components;
      `;
      
      const { rows } = await pool.query(statsQuery);
      if (rows.length > 0) {
        console.log(`   Total Analyses: ${rows[0].total_analyses || 1}`);
        console.log(`   Total Components: ${rows[0].total_components || result.atomComponentCount}`);
        console.log(`   Avg Reuse Score: ${Math.round(rows[0].avg_reuse_score || 50)}/100`);
        console.log(`   Avg Complexity: ${Math.round(rows[0].avg_complexity_score || 50)}/100`);
      }
    } catch (dbError) {
      console.log('   (Database tables may not exist yet - run migrations first)');
    } finally {
      await pool.end();
    }
    
    console.log('');
    console.log('✨ Demo Complete!');
    console.log('');
    console.log('Next Steps:');
    console.log('   1. View screenshot: ' + result.screenshotPath);
    console.log('   2. Access dashboard: http://localhost:3000/dashboard/component-schema');
    console.log('   3. API endpoint: http://localhost:3001/api/component-analyzer/analyses/' + result.analysisId);
    console.log('   4. Run migrations: psql -U postgres -d lightdom -f database/140-component-analysis-schema.sql');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await service.close();
  }
}

// Run demo
runDemo().catch(console.error);
