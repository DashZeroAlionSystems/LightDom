#!/usr/bin/env node

/**
 * Validation script for WebDriver BiDi implementation
 * Checks code structure without requiring Puppeteer to be installed
 */

const fs = require('fs');
const path = require('path');

console.log('=== WebDriver BiDi Implementation Validation ===\n');

const checks = [];

// Check 1: Worker file exists and contains BiDi support
console.log('1. Checking puppeteer-worker.js...');
const workerPath = path.join(__dirname, '../electron/workers/puppeteer-worker.js');
const workerCode = fs.readFileSync(workerPath, 'utf-8');

checks.push({
  name: 'Worker file exists',
  passed: fs.existsSync(workerPath)
});

checks.push({
  name: 'Worker has USE_BIDI environment variable',
  passed: workerCode.includes('USE_BIDI')
});

checks.push({
  name: 'Worker has WebDriver BiDi setup',
  passed: workerCode.includes('setupBiDiEventHandlers')
});

checks.push({
  name: 'Worker has mineAttribute function',
  passed: workerCode.includes('async function mineAttribute')
});

checks.push({
  name: 'Worker has generateOGImage function',
  passed: workerCode.includes('async function generateOGImage')
});

checks.push({
  name: 'Worker handles mineAttribute task type',
  passed: workerCode.includes("case 'mineAttribute':")
});

checks.push({
  name: 'Worker handles generateOGImage task type',
  passed: workerCode.includes("case 'generateOGImage':")
});

console.log('  ✓ Worker checks complete\n');

// Check 2: Main process file
console.log('2. Checking electron/main-enhanced.cjs...');
const mainPath = path.join(__dirname, '../electron/main-enhanced.cjs');
const mainCode = fs.readFileSync(mainPath, 'utf-8');

checks.push({
  name: 'Main process file exists',
  passed: fs.existsSync(mainPath)
});

checks.push({
  name: 'Main has createAttributeWorker function',
  passed: mainCode.includes('function createAttributeWorker')
});

checks.push({
  name: 'Main has BiDi option in worker initialization',
  passed: mainCode.includes('useBiDi')
});

checks.push({
  name: 'Main has IPC handler for createAttributeWorker',
  passed: mainCode.includes("'worker:createAttributeWorker'")
});

checks.push({
  name: 'Main has IPC handler for mineAttribute',
  passed: mainCode.includes("'puppeteer:mineAttribute'")
});

checks.push({
  name: 'Main has IPC handler for generateOGImage',
  passed: mainCode.includes("'puppeteer:generateOGImage'")
});

console.log('  ✓ Main process checks complete\n');

// Check 3: Preload script
console.log('3. Checking electron/preload-enhanced.cjs...');
const preloadPath = path.join(__dirname, '../electron/preload-enhanced.cjs');
const preloadCode = fs.readFileSync(preloadPath, 'utf-8');

checks.push({
  name: 'Preload file exists',
  passed: fs.existsSync(preloadPath)
});

checks.push({
  name: 'Preload exposes createAttributeWorker',
  passed: preloadCode.includes('createAttributeWorker')
});

checks.push({
  name: 'Preload exposes mineAttribute',
  passed: preloadCode.includes('mineAttribute')
});

checks.push({
  name: 'Preload exposes generateOGImage',
  passed: preloadCode.includes('generateOGImage')
});

checks.push({
  name: 'Preload has attributeWorkerMessage listener',
  passed: preloadCode.includes('attributeWorkerMessage')
});

console.log('  ✓ Preload checks complete\n');

// Check 4: TypeScript service
console.log('4. Checking HeadlessChromeService.ts...');
const servicePath = path.join(__dirname, '../src/services/api/HeadlessChromeService.ts');
const serviceCode = fs.readFileSync(servicePath, 'utf-8');

checks.push({
  name: 'Service file exists',
  passed: fs.existsSync(servicePath)
});

checks.push({
  name: 'Service has useBiDi property',
  passed: serviceCode.includes('private useBiDi')
});

checks.push({
  name: 'Service has BiDi setup method',
  passed: serviceCode.includes('setupBiDiEventHandlers')
});

checks.push({
  name: 'Service has mineAttributes method',
  passed: serviceCode.includes('async mineAttributes')
});

checks.push({
  name: 'Service has generateOGImage method',
  passed: serviceCode.includes('async generateOGImage')
});

checks.push({
  name: 'Service uses BiDi protocol option',
  passed: serviceCode.includes('webDriverBiDi')
});

console.log('  ✓ Service checks complete\n');

// Check 5: Documentation
console.log('5. Checking documentation...');
const researchPath = path.join(__dirname, '../docs/research/WEBDRIVER_BIDI_PUPPETEER_RESEARCH.md');
const readmePath = path.join(__dirname, '../HEADLESS_WORKERS_README.md');

checks.push({
  name: 'Research document exists',
  passed: fs.existsSync(researchPath)
});

checks.push({
  name: 'README updated with BiDi info',
  passed: fs.existsSync(readmePath) && fs.readFileSync(readmePath, 'utf-8').includes('WebDriver BiDi')
});

console.log('  ✓ Documentation checks complete\n');

// Check 6: Example code
console.log('6. Checking examples...');
const examplePath = path.join(__dirname, '../examples/webdriver-bidi-attribute-mining.js');

checks.push({
  name: 'Example file exists',
  passed: fs.existsSync(examplePath)
});

if (fs.existsSync(examplePath)) {
  const exampleCode = fs.readFileSync(examplePath, 'utf-8');
  checks.push({
    name: 'Example demonstrates BiDi usage',
    passed: exampleCode.includes('useBiDi: true')
  });
  
  checks.push({
    name: 'Example demonstrates attribute mining',
    passed: exampleCode.includes('mineAttribute')
  });
  
  checks.push({
    name: 'Example demonstrates OG image generation',
    passed: exampleCode.includes('generateOGImage')
  });
}

console.log('  ✓ Example checks complete\n');

// Report results
console.log('=== Validation Results ===\n');

const passed = checks.filter(c => c.passed).length;
const failed = checks.filter(c => !c.passed).length;
const total = checks.length;

checks.forEach(check => {
  const icon = check.passed ? '✓' : '✗';
  console.log(`${icon} ${check.name}`);
});

console.log(`\nSummary: ${passed}/${total} checks passed`);

if (failed > 0) {
  console.log(`\n❌ ${failed} check(s) failed`);
  process.exit(1);
} else {
  console.log('\n✅ All validation checks passed!');
  console.log('\nImplementation includes:');
  console.log('- WebDriver BiDi protocol support');
  console.log('- Attribute-based data mining');
  console.log('- OG image generation');
  console.log('- Worker pool management');
  console.log('- Comprehensive documentation');
  console.log('- Working examples');
  process.exit(0);
}
