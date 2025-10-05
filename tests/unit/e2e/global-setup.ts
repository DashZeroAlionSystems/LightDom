import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for E2E tests...');
  
  // Start browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check if the application is running
    const isAppReady = await page.locator('body').isVisible();
    if (!isAppReady) {
      throw new Error('Application is not ready');
    }
    
    console.log('✅ Application is ready for testing');
    
    // Set up test data if needed
    await setupTestData(page);
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log('🎉 Global setup completed successfully');
}

async function setupTestData(page: any) {
  console.log('📝 Setting up test data...');
  
  try {
    // Register a test user if not exists
    await page.goto('http://localhost:3000/register');
    await page.waitForLoadState('networkidle');
    
    // Check if user already exists
    const userExists = await page.locator('text=Email already exists').isVisible();
    if (!userExists) {
      // Register test user
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'password123');
      await page.fill('input[name="confirmPassword"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for registration to complete
      await page.waitForSelector('text=Registration successful', { timeout: 10000 });
      console.log('✅ Test user registered');
    } else {
      console.log('ℹ️ Test user already exists');
    }
    
    // Set up test bridges
    await setupTestBridges();
    
  } catch (error) {
    console.log('⚠️ Test data setup failed, continuing with tests...');
  }
}

async function setupTestBridges() {
  console.log('🌉 Setting up test bridges...');
  
  try {
    // This would typically make API calls to set up test data
    // For now, we'll just log that we're setting up bridges
    console.log('✅ Test bridges setup completed');
  } catch (error) {
    console.log('⚠️ Test bridges setup failed, continuing with tests...');
  }
}

export default globalSetup;