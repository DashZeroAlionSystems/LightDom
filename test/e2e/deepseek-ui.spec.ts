/**
 * DeepSeek UI E2E Tests
 * Playwright tests for frontend UI components
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('DeepSeek Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should display chat interface', async ({ page }) => {
    await page.click('text=DeepSeek Chat');
    
    await expect(page.locator('text=DeepSeek AI Chat')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('button:has-text("Send")')).toBeVisible();
  });

  test('should send message and receive response', async ({ page }) => {
    await page.click('text=DeepSeek Chat');
    
    await page.fill('textarea', 'Hello');
    await page.click('button:has-text("Send")');

    // Wait for response
    await page.waitForSelector('text=DeepSeek', { timeout: 30000 });
    
    const messages = await page.locator('.ant-list-item').count();
    expect(messages).toBeGreaterThan(0);
  });

  test('should display streaming chunks', async ({ page }) => {
    await page.click('text=DeepSeek Chat');
    
    await page.fill('textarea', 'Tell me a story');
    await page.click('button:has-text("Send")');

    // Look for streaming cursor
    await expect(page.locator('.streaming-cursor')).toBeVisible({ timeout: 10000 });
  });

  test('should display tool calls', async ({ page }) => {
    await page.click('text=DeepSeek Chat');
    
    await page.fill('textarea', 'Create a workflow');
    await page.click('button:has-text("Send")');

    // Wait for tool call indicator
    await expect(page.locator('text=tool(s) called')).toBeVisible({ timeout: 30000 });
  });

  test('should clear conversation', async ({ page }) => {
    await page.click('text=DeepSeek Chat');
    
    await page.fill('textarea', 'Test message');
    await page.click('button:has-text("Send")');
    
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Clear Chat")');
    
    const messages = await page.locator('.ant-list-item').count();
    expect(messages).toBe(0);
  });
});

test.describe('Workflow Visual Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('text=Workflow Editor');
  });

  test('should display workflow editor', async ({ page }) => {
    await expect(page.locator('text=Workflow Editor')).toBeVisible();
    await expect(page.locator('button:has-text("Add Step")')).toBeVisible();
    await expect(page.locator('button:has-text("Save")')).toBeVisible();
  });

  test('should add workflow step', async ({ page }) => {
    await page.fill('input[placeholder*="workflow name"]', 'Test Workflow');
    
    await page.click('button:has-text("Add Step")');
    
    await page.fill('input[placeholder*="step name"]', 'Test Step');
    await page.selectOption('select', 'data-fetch');
    
    await page.click('button:has-text("OK")');
    
    await expect(page.locator('text=Test Step')).toBeVisible();
  });

  test('should save workflow', async ({ page }) => {
    await page.fill('input[placeholder*="workflow name"]', 'My Workflow');
    
    await page.click('button:has-text("Add Step")');
    await page.fill('input[placeholder*="step name"]', 'Step 1');
    await page.selectOption('select', 'data-fetch');
    await page.click('button:has-text("OK")');
    
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('text=Workflow saved successfully')).toBeVisible();
  });

  test('should add visual component', async ({ page }) => {
    await page.fill('input[placeholder*="workflow name"]', 'Test Workflow');
    
    await page.click('button:has-text("Add Component")');
    
    await page.fill('input[placeholder*="component name"]', 'My Dashboard');
    await page.selectOption('select', 'dashboard');
    
    await page.click('button:has-text("OK")');
    
    await expect(page.locator('text=dashboard')).toBeVisible();
  });
});

test.describe('Monitoring Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.click('text=Dashboard');
  });

  test('should display dashboard', async ({ page }) => {
    await expect(page.locator('text=Monitoring Dashboard')).toBeVisible();
    await expect(page.locator('text=Total Executions')).toBeVisible();
    await expect(page.locator('text=Success Rate')).toBeVisible();
  });

  test('should display workflow executions', async ({ page }) => {
    await expect(page.locator('text=Workflow Executions')).toBeVisible();
    await expect(page.locator('.ant-table')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    await page.click('text=Data Streams');
    await expect(page.locator('text=No active data streams').or(page.locator('.ant-card'))).toBeVisible();
    
    await page.click('text=AI Tool Calls');
    await expect(page.locator('text=No tool calls yet').or(page.locator('.ant-list'))).toBeVisible();
    
    await page.click('text=Analytics');
    await expect(page.locator('text=Execution Timeline')).toBeVisible();
  });

  test('should display real-time metrics', async ({ page }) => {
    const successRate = await page.locator('.ant-statistic-content-value').first();
    await expect(successRate).toBeVisible();
  });
});
