#!/usr/bin/env node

/**
 * Validation Script for AI Research Pipeline
 * 
 * Tests the system components without requiring database or external services
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('\n🔍 AI Research Pipeline - System Validation\n');
console.log('============================================\n');

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, fn) {
  try {
    fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log('✓', name);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    console.log('✗', name);
    console.log(`  Error: ${error.message}`);
  }
}

// Test 1: Check required files exist
console.log('\n📁 File Structure Validation\n');

test('Database schema exists', () => {
  if (!fs.existsSync('./database/ai-research-pipeline-schema.sql')) {
    throw new Error('Schema file not found');
  }
});

test('Core service exists', () => {
  if (!fs.existsSync('./services/ai-research-pipeline.js')) {
    throw new Error('Service file not found');
  }
});

test('API routes exist', () => {
  if (!fs.existsSync('./api/research-pipeline-routes.js')) {
    throw new Error('API routes file not found');
  }
});

test('Startup script exists', () => {
  if (!fs.existsSync('./start-research-pipeline.js')) {
    throw new Error('Startup script not found');
  }
});

test('Demo script exists', () => {
  if (!fs.existsSync('./demo-ai-research-pipeline.js')) {
    throw new Error('Demo script not found');
  }
});

test('Dashboard component exists', () => {
  if (!fs.existsSync('./src/components/dashboards/AIResearchDashboard.jsx')) {
    throw new Error('Dashboard component not found');
  }
});

test('Documentation exists', () => {
  const docs = [
    'AI_RESEARCH_PIPELINE_README.md',
    'RESEARCH_PIPELINE_QUICKSTART.md',
    'RESEARCH_PIPELINE_IMPLEMENTATION_SUMMARY.md'
  ];
  
  docs.forEach(doc => {
    if (!fs.existsSync(`./${doc}`)) {
      throw new Error(`Missing documentation: ${doc}`);
    }
  });
});

// Test 2: Syntax validation
console.log('\n⚙️  Syntax Validation\n');

test('Service syntax is valid', () => {
  execSync('node -c services/ai-research-pipeline.js', { encoding: 'utf-8' });
});

test('API routes syntax is valid', () => {
  execSync('node -c api/research-pipeline-routes.js', { encoding: 'utf-8' });
});

test('Startup script syntax is valid', () => {
  execSync('node -c start-research-pipeline.js', { encoding: 'utf-8' });
});

test('Demo script syntax is valid', () => {
  execSync('node -c demo-ai-research-pipeline.js', { encoding: 'utf-8' });
});

test('Target articles script syntax is valid', () => {
  execSync('node -c analyze-target-articles.js', { encoding: 'utf-8' });
});

// Test 3: Database schema validation
console.log('\n🗄️  Database Schema Validation\n');

test('Schema defines all required tables', () => {
  const schema = fs.readFileSync('./database/ai-research-pipeline-schema.sql', 'utf-8');
  
  const requiredTables = [
    'research_sources',
    'research_articles',
    'research_topics',
    'article_topics',
    'research_code_examples',
    'feature_recommendations',
    'research_campaigns',
    'seo_insights',
    'service_packages',
    'research_papers',
    'research_analysis_jobs'
  ];

  requiredTables.forEach(table => {
    if (!schema.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
      throw new Error(`Missing table: ${table}`);
    }
  });
});

test('Schema includes indexes', () => {
  const schema = fs.readFileSync('./database/ai-research-pipeline-schema.sql', 'utf-8');
  
  if (!schema.includes('CREATE INDEX')) {
    throw new Error('No indexes defined');
  }
  
  // Count indexes
  const indexCount = (schema.match(/CREATE INDEX/g) || []).length;
  if (indexCount < 10) {
    throw new Error(`Only ${indexCount} indexes found, expected at least 10`);
  }
});

test('Schema includes seed data', () => {
  const schema = fs.readFileSync('./database/ai-research-pipeline-schema.sql', 'utf-8');
  
  if (!schema.includes('INSERT INTO research_sources')) {
    throw new Error('No seed data for sources');
  }
  
  if (!schema.includes('INSERT INTO research_topics')) {
    throw new Error('No seed data for topics');
  }
});

// Test 4: API integration validation
console.log('\n🔌 API Integration Validation\n');

test('API routes registered in server', () => {
  const serverFile = fs.readFileSync('./api-server-express.js', 'utf-8');
  
  if (!serverFile.includes('research-pipeline-routes')) {
    throw new Error('Routes not imported in server');
  }
  
  if (!serverFile.includes('/api/research')) {
    throw new Error('Routes not mounted at /api/research');
  }
});

test('NPM scripts configured', () => {
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
  
  const requiredScripts = [
    'research:start',
    'research:demo',
    'research:analyze',
    'research:status',
    'research:dashboard'
  ];

  requiredScripts.forEach(script => {
    if (!pkg.scripts[script]) {
      throw new Error(`Missing npm script: ${script}`);
    }
  });
});

// Test 5: Documentation validation
console.log('\n📚 Documentation Validation\n');

test('README includes research pipeline', () => {
  const readme = fs.readFileSync('./README.md', 'utf-8');
  
  if (!readme.includes('AI Research Pipeline')) {
    throw new Error('README not updated with research pipeline info');
  }
  
  if (!readme.includes('RESEARCH_PIPELINE_QUICKSTART')) {
    throw new Error('README missing link to quick start');
  }
});

test('Quick start guide is comprehensive', () => {
  const quickstart = fs.readFileSync('./RESEARCH_PIPELINE_QUICKSTART.md', 'utf-8');
  
  const requiredSections = [
    'Get Started',
    'Initialize Database',
    'Start the Service',
    'API Endpoints',
    'Troubleshooting'
  ];

  requiredSections.forEach(section => {
    if (!quickstart.toLowerCase().includes(section.toLowerCase())) {
      throw new Error(`Quick start missing section: ${section}`);
    }
  });
});

test('API documentation is complete', () => {
  const apiDoc = fs.readFileSync('./AI_RESEARCH_PIPELINE_README.md', 'utf-8');
  
  const requiredEndpoints = [
    '/api/research/status',
    '/api/research/scrape',
    '/api/research/articles',
    '/api/research/features',
    '/api/research/campaigns',
    '/api/research/papers'
  ];

  requiredEndpoints.forEach(endpoint => {
    if (!apiDoc.includes(endpoint)) {
      throw new Error(`Missing endpoint documentation: ${endpoint}`);
    }
  });
});

// Test 6: Code quality checks
console.log('\n✨ Code Quality Checks\n');

test('Service exports AIResearchPipeline class', () => {
  const service = fs.readFileSync('./services/ai-research-pipeline.js', 'utf-8');
  
  if (!service.includes('export class AIResearchPipeline')) {
    throw new Error('Service does not export class');
  }
  
  if (!service.includes('extends EventEmitter')) {
    throw new Error('Class does not extend EventEmitter');
  }
});

test('API routes export function', () => {
  const routes = fs.readFileSync('./api/research-pipeline-routes.js', 'utf-8');
  
  if (!routes.includes('export function createResearchPipelineRoutes')) {
    throw new Error('Routes do not export creation function');
  }
  
  if (!routes.includes('express.Router')) {
    throw new Error('Routes do not use Express Router');
  }
});

test('Service has error handling', () => {
  const service = fs.readFileSync('./services/ai-research-pipeline.js', 'utf-8');
  
  const tryCatchCount = (service.match(/try\s*{/g) || []).length;
  if (tryCatchCount < 5) {
    throw new Error('Insufficient error handling');
  }
});

test('Rate limiting implemented', () => {
  const service = fs.readFileSync('./services/ai-research-pipeline.js', 'utf-8');
  
  if (!service.includes('rateLimit') && !service.includes('checkRateLimit')) {
    throw new Error('Rate limiting not implemented');
  }
});

// Display results
console.log('\n📊 Validation Results\n');
console.log(`Total Tests: ${results.passed + results.failed}`);
console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);

if (results.failed > 0) {
  console.log('\n⚠️  Failed Tests:\n');
  results.tests
    .filter(t => t.status === 'FAIL')
    .forEach(t => {
      console.log(`  ✗ ${t.name}`);
      console.log(`    ${t.error}\n`);
    });
}

console.log('\n' + '='.repeat(44) + '\n');

if (results.failed === 0) {
  console.log('✅ All validations passed!\n');
  console.log('The AI Research Pipeline is ready to use:\n');
  console.log('  1. Initialize database: psql -U postgres -d lightdom -f database/ai-research-pipeline-schema.sql');
  console.log('  2. Start service: npm run research:start');
  console.log('  3. Run demo: npm run research:demo');
  console.log('  4. Analyze targets: npm run research:analyze\n');
  process.exit(0);
} else {
  console.log('❌ Some validations failed\n');
  console.log('Please fix the issues above before using the system.\n');
  process.exit(1);
}


// Test 1: Check required files exist
console.log(chalk.blue('\n📁 File Structure Validation\n'));

test('Database schema exists', () => {
  if (!fs.existsSync('./database/ai-research-pipeline-schema.sql')) {
    throw new Error('Schema file not found');
  }
});

test('Core service exists', () => {
  if (!fs.existsSync('./services/ai-research-pipeline.js')) {
    throw new Error('Service file not found');
  }
});

test('API routes exist', () => {
  if (!fs.existsSync('./api/research-pipeline-routes.js')) {
    throw new Error('API routes file not found');
  }
});

test('Startup script exists', () => {
  if (!fs.existsSync('./start-research-pipeline.js')) {
    throw new Error('Startup script not found');
  }
});

test('Demo script exists', () => {
  if (!fs.existsSync('./demo-ai-research-pipeline.js')) {
    throw new Error('Demo script not found');
  }
});

test('Dashboard component exists', () => {
  if (!fs.existsSync('./src/components/dashboards/AIResearchDashboard.jsx')) {
    throw new Error('Dashboard component not found');
  }
});

test('Documentation exists', () => {
  const docs = [
    'AI_RESEARCH_PIPELINE_README.md',
    'RESEARCH_PIPELINE_QUICKSTART.md',
    'RESEARCH_PIPELINE_IMPLEMENTATION_SUMMARY.md'
  ];
  
  docs.forEach(doc => {
    if (!fs.existsSync(`./${doc}`)) {
      throw new Error(`Missing documentation: ${doc}`);
    }
  });
});

// Test 2: Syntax validation
console.log(chalk.blue('\n⚙️  Syntax Validation\n'));

test('Service syntax is valid', () => {
  const { execSync } = require('child_process');
  execSync('node -c services/ai-research-pipeline.js', { encoding: 'utf-8' });
});

test('API routes syntax is valid', () => {
  const { execSync } = require('child_process');
  execSync('node -c api/research-pipeline-routes.js', { encoding: 'utf-8' });
});

test('Startup script syntax is valid', () => {
  const { execSync } = require('child_process');
  execSync('node -c start-research-pipeline.js', { encoding: 'utf-8' });
});

test('Demo script syntax is valid', () => {
  const { execSync } = require('child_process');
  execSync('node -c demo-ai-research-pipeline.js', { encoding: 'utf-8' });
});

test('Target articles script syntax is valid', () => {
  const { execSync } = require('child_process');
  execSync('node -c analyze-target-articles.js', { encoding: 'utf-8' });
});

// Test 3: Database schema validation
console.log(chalk.blue('\n🗄️  Database Schema Validation\n'));

test('Schema defines all required tables', () => {
  const schema = fs.readFileSync('./database/ai-research-pipeline-schema.sql', 'utf-8');
  
  const requiredTables = [
    'research_sources',
    'research_articles',
    'research_topics',
    'article_topics',
    'research_code_examples',
    'feature_recommendations',
    'research_campaigns',
    'seo_insights',
    'service_packages',
    'research_papers',
    'research_analysis_jobs'
  ];

  requiredTables.forEach(table => {
    if (!schema.includes(`CREATE TABLE IF NOT EXISTS ${table}`)) {
      throw new Error(`Missing table: ${table}`);
    }
  });
});

test('Schema includes indexes', () => {
  const schema = fs.readFileSync('./database/ai-research-pipeline-schema.sql', 'utf-8');
  
  if (!schema.includes('CREATE INDEX')) {
    throw new Error('No indexes defined');
  }
  
  // Count indexes
  const indexCount = (schema.match(/CREATE INDEX/g) || []).length;
  if (indexCount < 10) {
    throw new Error(`Only ${indexCount} indexes found, expected at least 10`);
  }
});

test('Schema includes seed data', () => {
  const schema = fs.readFileSync('./database/ai-research-pipeline-schema.sql', 'utf-8');
  
  if (!schema.includes('INSERT INTO research_sources')) {
    throw new Error('No seed data for sources');
  }
  
  if (!schema.includes('INSERT INTO research_topics')) {
    throw new Error('No seed data for topics');
  }
});

// Test 4: API integration validation
console.log(chalk.blue('\n🔌 API Integration Validation\n'));

test('API routes registered in server', () => {
  const serverFile = fs.readFileSync('./api-server-express.js', 'utf-8');
  
  if (!serverFile.includes('research-pipeline-routes')) {
    throw new Error('Routes not imported in server');
  }
  
  if (!serverFile.includes('/api/research')) {
    throw new Error('Routes not mounted at /api/research');
  }
});

test('NPM scripts configured', () => {
  const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
  
  const requiredScripts = [
    'research:start',
    'research:demo',
    'research:analyze',
    'research:status',
    'research:dashboard'
  ];

  requiredScripts.forEach(script => {
    if (!pkg.scripts[script]) {
      throw new Error(`Missing npm script: ${script}`);
    }
  });
});

// Test 5: Documentation validation
console.log(chalk.blue('\n📚 Documentation Validation\n'));

test('README includes research pipeline', () => {
  const readme = fs.readFileSync('./README.md', 'utf-8');
  
  if (!readme.includes('AI Research Pipeline')) {
    throw new Error('README not updated with research pipeline info');
  }
  
  if (!readme.includes('RESEARCH_PIPELINE_QUICKSTART')) {
    throw new Error('README missing link to quick start');
  }
});

test('Quick start guide is comprehensive', () => {
  const quickstart = fs.readFileSync('./RESEARCH_PIPELINE_QUICKSTART.md', 'utf-8');
  
  const requiredSections = [
    'Get Started',
    'Initialize Database',
    'Start the Service',
    'API Endpoints',
    'Troubleshooting'
  ];

  requiredSections.forEach(section => {
    if (!quickstart.toLowerCase().includes(section.toLowerCase())) {
      throw new Error(`Quick start missing section: ${section}`);
    }
  });
});

test('API documentation is complete', () => {
  const apiDoc = fs.readFileSync('./AI_RESEARCH_PIPELINE_README.md', 'utf-8');
  
  const requiredEndpoints = [
    '/api/research/status',
    '/api/research/scrape',
    '/api/research/articles',
    '/api/research/features',
    '/api/research/campaigns',
    '/api/research/papers'
  ];

  requiredEndpoints.forEach(endpoint => {
    if (!apiDoc.includes(endpoint)) {
      throw new Error(`Missing endpoint documentation: ${endpoint}`);
    }
  });
});

// Test 6: Code quality checks
console.log(chalk.blue('\n✨ Code Quality Checks\n'));

test('Service exports AIResearchPipeline class', () => {
  const service = fs.readFileSync('./services/ai-research-pipeline.js', 'utf-8');
  
  if (!service.includes('export class AIResearchPipeline')) {
    throw new Error('Service does not export class');
  }
  
  if (!service.includes('extends EventEmitter')) {
    throw new Error('Class does not extend EventEmitter');
  }
});

test('API routes export function', () => {
  const routes = fs.readFileSync('./api/research-pipeline-routes.js', 'utf-8');
  
  if (!routes.includes('export function createResearchPipelineRoutes')) {
    throw new Error('Routes do not export creation function');
  }
  
  if (!routes.includes('express.Router')) {
    throw new Error('Routes do not use Express Router');
  }
});

test('Service has error handling', () => {
  const service = fs.readFileSync('./services/ai-research-pipeline.js', 'utf-8');
  
  const tryCatchCount = (service.match(/try\s*{/g) || []).length;
  if (tryCatchCount < 5) {
    throw new Error('Insufficient error handling');
  }
});

test('Rate limiting implemented', () => {
  const service = fs.readFileSync('./services/ai-research-pipeline.js', 'utf-8');
  
  if (!service.includes('rateLimit') && !service.includes('checkRateLimit')) {
    throw new Error('Rate limiting not implemented');
  }
});

// Display results
console.log(chalk.cyan.bold('\n📊 Validation Results\n'));
console.log(chalk.white(`Total Tests: ${results.passed + results.failed}`));
console.log(chalk.green(`Passed: ${results.passed}`));
console.log(chalk.red(`Failed: ${results.failed}`));

if (results.failed > 0) {
  console.log(chalk.yellow('\n⚠️  Failed Tests:\n'));
  results.tests
    .filter(t => t.status === 'FAIL')
    .forEach(t => {
      console.log(chalk.red(`  ✗ ${t.name}`));
      console.log(chalk.gray(`    ${t.error}\n`));
    });
}

console.log(chalk.cyan('\n' + '='.repeat(44) + '\n'));

if (results.failed === 0) {
  console.log(chalk.green.bold('✅ All validations passed!\n'));
  console.log(chalk.white('The AI Research Pipeline is ready to use:\n'));
  console.log(chalk.gray('  1. Initialize database: psql -U postgres -d lightdom -f database/ai-research-pipeline-schema.sql'));
  console.log(chalk.gray('  2. Start service: npm run research:start'));
  console.log(chalk.gray('  3. Run demo: npm run research:demo'));
  console.log(chalk.gray('  4. Analyze targets: npm run research:analyze\n'));
  process.exit(0);
} else {
  console.log(chalk.red.bold('❌ Some validations failed\n'));
  console.log(chalk.yellow('Please fix the issues above before using the system.\n'));
  process.exit(1);
}
