/**
 * Storybook Test Runner Configuration
 * 
 * Enables automated testing of Storybook stories
 * Includes visual regression testing, accessibility checks, and interaction tests
 */

import type { TestRunnerConfig } from '@storybook/test-runner';
import { checkA11y, injectAxe } from 'axe-playwright';

const config: TestRunnerConfig = {
  async preVisit(page) {
    // Inject axe-core for accessibility testing
    await injectAxe(page);
  },

  async postVisit(page) {
    // Run accessibility checks on each story
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      // Configure axe rules
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
        },
      },
    });
  },

  tags: {
    // Skip certain stories from testing
    skip: ['skip-test', 'no-tests'],
    // Include only specific tags
    include: ['test', 'a11y'],
  },

  // Test configuration
  testTimeout: 15000, // 15 seconds per test
  
  // Browser configuration
  browserContextOptions: {
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
  },
};

export default config;
