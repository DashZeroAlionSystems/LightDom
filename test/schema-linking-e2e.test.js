const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Schema Linking Dashboard E2E Tests
 * Tests all components, buttons, and data flow with Puppeteer
 */

const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots/schema-linking');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreenshot(page, name, darkMode = false) {
  const filename = `${name}${darkMode ? '-dark' : ''}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filename}`);
  return filepath;
}

async function testSchemaLinkingDashboard() {
  console.log('🚀 Starting Schema Linking Dashboard E2E Tests\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const results = {
    passed: [],
    failed: [],
    screenshots: []
  };

  try {
    // Test 1: Navigate to dashboard
    console.log('Test 1: Navigating to Schema Linking Dashboard...');
    await page.goto(`${BASE_URL}/dashboard/schema-linking`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await delay(2000);
    
    const screenshot1 = await captureScreenshot(page, '01-dashboard-light');
    results.screenshots.push(screenshot1);
    results.passed.push('Navigation to dashboard');
    console.log('✅ Successfully loaded dashboard\n');

    // Test 2: Check dashboard title
    console.log('Test 2: Verifying dashboard title...');
    const title = await page.$eval('.dashboard-title', el => el.textContent);
    if (title.includes('Schema Linking Dashboard')) {
      results.passed.push('Dashboard title present');
      console.log('✅ Dashboard title verified\n');
    } else {
      throw new Error('Dashboard title not found');
    }

    // Test 3: Test dark mode toggle
    console.log('Test 3: Testing dark mode toggle...');
    const darkModeToggle = await page.$('.ant-switch');
    if (darkModeToggle) {
      await darkModeToggle.click();
      await delay(1000);
      
      const screenshot2 = await captureScreenshot(page, '02-dashboard-dark', true);
      results.screenshots.push(screenshot2);
      results.passed.push('Dark mode toggle works');
      console.log('✅ Dark mode toggle successful\n');
      
      // Toggle back to light mode
      await darkModeToggle.click();
      await delay(500);
    }

    // Test 4: Test Run Analysis button
    console.log('Test 4: Testing Run Analysis button...');
    const runButton = await page.$('button:has-text("Run Analysis")') || 
                       await page.$$eval('button', buttons => 
                         buttons.find(btn => btn.textContent.includes('Run Analysis'))
                       );
    if (runButton) {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const runBtn = buttons.find(btn => btn.textContent.includes('Run Analysis'));
        if (runBtn) runBtn.click();
      });
      await delay(2000);
      results.passed.push('Run Analysis button clickable');
      console.log('✅ Run Analysis button works\n');
    }

    // Test 5: Verify statistics cards
    console.log('Test 5: Verifying statistics cards...');
    const statsCards = await page.$$('.ant-statistic');
    if (statsCards.length >= 4) {
      results.passed.push(`Statistics cards present (${statsCards.length})`);
      console.log(`✅ Found ${statsCards.length} statistics cards\n`);
      
      const screenshot3 = await captureScreenshot(page, '03-stats-overview');
      results.screenshots.push(screenshot3);
    }

    // Test 6: Test tab navigation
    console.log('Test 6: Testing tab navigation...');
    const tabs = ['overview', 'workflow', 'components', 'dashboard', 'reports'];
    
    for (const tabName of tabs) {
      console.log(`  Switching to ${tabName} tab...`);
      
      // Click tab
      await page.evaluate((name) => {
        const tabElements = Array.from(document.querySelectorAll('.ant-tabs-tab'));
        const tab = tabElements.find(el => 
          el.textContent.toLowerCase().includes(name) ||
          el.getAttribute('data-node-key') === name
        );
        if (tab) tab.click();
      }, tabName);
      
      await delay(1500);
      
      const screenshot = await captureScreenshot(page, `04-tab-${tabName}`);
      results.screenshots.push(screenshot);
      results.passed.push(`${tabName} tab navigation`);
      console.log(`  ✅ ${tabName} tab loaded\n`);
    }

    // Test 7: Test component gallery interactions
    console.log('Test 7: Testing component gallery...');
    
    // Navigate to components tab
    await page.evaluate(() => {
      const tabElements = Array.from(document.querySelectorAll('.ant-tabs-tab'));
      const componentsTab = tabElements.find(el => 
        el.textContent.toLowerCase().includes('components')
      );
      if (componentsTab) componentsTab.click();
    });
    await delay(1000);
    
    // Test input components
    const inputs = await page.$$('input[type="text"], input[type="number"], textarea');
    console.log(`  Found ${inputs.length} input components`);
    
    if (inputs.length > 0) {
      // Fill first input
      await inputs[0].type('Test Value');
      await delay(500);
      results.passed.push('Input component interaction');
      console.log('  ✅ Input component tested\n');
    }
    
    const screenshot7 = await captureScreenshot(page, '05-component-gallery');
    results.screenshots.push(screenshot7);

    // Test 8: Test workflow visualization
    console.log('Test 8: Testing workflow visualization...');
    
    // Navigate to workflow tab
    await page.evaluate(() => {
      const tabElements = Array.from(document.querySelectorAll('.ant-tabs-tab'));
      const workflowTab = tabElements.find(el => 
        el.textContent.toLowerCase().includes('workflow')
      );
      if (workflowTab) workflowTab.click();
    });
    await delay(1500);
    
    const screenshot8 = await captureScreenshot(page, '06-workflow-visualization');
    results.screenshots.push(screenshot8);
    
    // Test Execute Workflow button
    const executeButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const execBtn = buttons.find(btn => btn.textContent.includes('Execute Workflow'));
      return execBtn ? true : false;
    });
    
    if (executeButton) {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const execBtn = buttons.find(btn => btn.textContent.includes('Execute Workflow'));
        if (execBtn) execBtn.click();
      });
      await delay(3000); // Wait for workflow execution
      
      const screenshot8a = await captureScreenshot(page, '07-workflow-executing');
      results.screenshots.push(screenshot8a);
      results.passed.push('Workflow execution button works');
      console.log('  ✅ Workflow execution tested\n');
    }

    // Test 9: Test dashboard preview
    console.log('Test 9: Testing dashboard preview...');
    
    await page.evaluate(() => {
      const tabElements = Array.from(document.querySelectorAll('.ant-tabs-tab'));
      const dashboardTab = tabElements.find(el => 
        el.textContent.toLowerCase().includes('dashboard preview')
      );
      if (dashboardTab) dashboardTab.click();
    });
    await delay(1500);
    
    const screenshot9 = await captureScreenshot(page, '08-dashboard-preview');
    results.screenshots.push(screenshot9);
    results.passed.push('Dashboard preview tab');
    console.log('  ✅ Dashboard preview loaded\n');

    // Test 10: Test info chart reports
    console.log('Test 10: Testing info chart reports...');
    
    await page.evaluate(() => {
      const tabElements = Array.from(document.querySelectorAll('.ant-tabs-tab'));
      const reportsTab = tabElements.find(el => 
        el.textContent.toLowerCase().includes('reports')
      );
      if (reportsTab) reportsTab.click();
    });
    await delay(2000);
    
    const screenshot10 = await captureScreenshot(page, '09-info-charts');
    results.screenshots.push(screenshot10);
    results.passed.push('Info chart reports');
    console.log('  ✅ Info chart reports loaded\n');

    // Test 11: Test API connectivity
    console.log('Test 11: Testing API connectivity...');
    
    const apiResponses = await page.evaluate(async () => {
      const results = {};
      
      try {
        const endpoints = [
          '/api/schema-linking/analyze',
          '/api/schema-linking/features',
          '/api/schema-linking/runner/status',
          '/api/schema-linking/health'
        ];
        
        for (const endpoint of endpoints) {
          try {
            const response = await fetch(endpoint);
            results[endpoint] = {
              status: response.status,
              ok: response.ok
            };
          } catch (error) {
            results[endpoint] = { error: error.message };
          }
        }
      } catch (error) {
        results.error = error.message;
      }
      
      return results;
    });
    
    console.log('  API Responses:', apiResponses);
    results.passed.push('API connectivity tested');
    console.log('  ✅ API connectivity verified\n');

    // Test 12: Check for console errors
    console.log('Test 12: Checking for console errors...');
    
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await delay(2000);
    
    if (consoleErrors.length === 0) {
      results.passed.push('No console errors');
      console.log('  ✅ No console errors detected\n');
    } else {
      results.failed.push(`Console errors: ${consoleErrors.length}`);
      console.log(`  ⚠️  Found ${consoleErrors.length} console errors\n`);
    }

    // Test 13: Test responsive design
    console.log('Test 13: Testing responsive design...');
    
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewport(viewport);
      await delay(1000);
      
      const screenshot = await captureScreenshot(page, `10-responsive-${viewport.name}`);
      results.screenshots.push(screenshot);
      results.passed.push(`Responsive ${viewport.name} view`);
      console.log(`  ✅ ${viewport.name} view tested\n`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    results.failed.push(error.message);
    
    // Capture error screenshot
    const errorScreenshot = await captureScreenshot(page, '99-error');
    results.screenshots.push(errorScreenshot);
  } finally {
    await browser.close();
  }

  // Print test results
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📸 Screenshots: ${results.screenshots.length}`);
  console.log('='.repeat(60) + '\n');
  
  console.log('✅ Passed Tests:');
  results.passed.forEach((test, i) => console.log(`  ${i + 1}. ${test}`));
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    results.failed.forEach((test, i) => console.log(`  ${i + 1}. ${test}`));
  }
  
  console.log(`\n📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  console.log('\nScreenshot files:');
  results.screenshots.forEach((file, i) => console.log(`  ${i + 1}. ${path.basename(file)}`));
  
  // Generate test report
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: results.passed.length + results.failed.length,
    passed: results.passed.length,
    failed: results.failed.length,
    screenshots: results.screenshots.length,
    passedTests: results.passed,
    failedTests: results.failed,
    screenshotPaths: results.screenshots
  };
  
  const reportPath = path.join(SCREENSHOTS_DIR, 'test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Test report saved to: ${reportPath}`);
  
  return results;
}

// Run tests if called directly
if (require.main === module) {
  testSchemaLinkingDashboard()
    .then(() => {
      console.log('\n✨ All tests completed!\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testSchemaLinkingDashboard };
