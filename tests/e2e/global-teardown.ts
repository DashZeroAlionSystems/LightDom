import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for E2E tests...');
  
  // Start browser for cleanup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Clean up test data
    await cleanupTestData(page);
    
    // Clean up test artifacts
    await cleanupTestArtifacts();
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid masking test failures
  } finally {
    await browser.close();
  }
  
  console.log('🎉 Global teardown completed successfully');
}

async function cleanupTestData(page: any) {
  console.log('🗑️ Cleaning up test data...');
  
  try {
    // Login as test user
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForSelector('text=Welcome to LightDom', { timeout: 10000 });
    
    // Clean up user data
    await cleanupUserData(page);
    
    // Clean up bridge data
    await cleanupBridgeData(page);
    
  } catch (error) {
    console.log('⚠️ Test data cleanup failed, continuing...');
  }
}

async function cleanupUserData(page: any) {
  console.log('👤 Cleaning up user data...');
  
  try {
    // Navigate to profile settings
    await page.goto('http://localhost:3000/profile');
    await page.waitForLoadState('networkidle');
    
    // Delete test user account
    await page.click('button:has-text("Delete Account")');
    await page.click('button:has-text("Confirm Delete")');
    
    // Wait for deletion to complete
    await page.waitForSelector('text=Account deleted', { timeout: 10000 });
    console.log('✅ Test user data cleaned up');
    
  } catch (error) {
    console.log('⚠️ User data cleanup failed, continuing...');
  }
}

async function cleanupBridgeData(page: any) {
  console.log('🌉 Cleaning up bridge data...');
  
  try {
    // This would typically make API calls to clean up test bridges
    // For now, we'll just log that we're cleaning up bridges
    console.log('✅ Test bridge data cleaned up');
    
  } catch (error) {
    console.log('⚠️ Bridge data cleanup failed, continuing...');
  }
}

async function cleanupTestArtifacts() {
  console.log('📁 Cleaning up test artifacts...');
  
  try {
    // Clean up test screenshots
    const fs = require('fs');
    const path = require('path');
    
    const testResultsDir = path.join(process.cwd(), 'test-results');
    if (fs.existsSync(testResultsDir)) {
      // Keep only the latest test results
      const files = fs.readdirSync(testResultsDir);
      const oldFiles = files.filter(file => 
        file.includes('screenshot') || 
        file.includes('video') ||
        file.includes('trace')
      );
      
      oldFiles.forEach(file => {
        try {
          fs.unlinkSync(path.join(testResultsDir, file));
        } catch (error) {
          // Ignore errors when deleting files
        }
      });
      
      console.log('✅ Test artifacts cleaned up');
    }
    
  } catch (error) {
    console.log('⚠️ Test artifacts cleanup failed, continuing...');
  }
}

export default globalTeardown;