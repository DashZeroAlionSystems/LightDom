#!/usr/bin/env node

/**
 * Test script for Cursor-N8n integration with headless Chrome pipeline
 * This script demonstrates how to use the new task management system
 * for JavaScript function execution in the headless Chrome pipeline
 */

import axios from 'axios';
import { performance } from 'perf_hooks';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

class IntegrationTester {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Test the integration service status
   */
  async testIntegrationStatus() {
    console.log('🔍 Testing integration service status...');
    
    try {
      const response = await this.apiClient.get('/api/integration/status');
      console.log('✅ Integration service status:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get integration status:', error.message);
      throw error;
    }
  }

  /**
   * Test available Cursor API functions
   */
  async testCursorFunctions() {
    console.log('🔍 Testing available Cursor API functions...');
    
    try {
      const response = await this.apiClient.get('/api/integration/cursor/functions');
      console.log('✅ Available Cursor functions:', response.data.functions.length);
      
      response.data.functions.forEach(func => {
        console.log(`  - ${func.name}: ${func.description}`);
      });
      
      return response.data.functions;
    } catch (error) {
      console.error('❌ Failed to get Cursor functions:', error.message);
      throw error;
    }
  }

  /**
   * Test available n8n workflows
   */
  async testN8nWorkflows() {
    console.log('🔍 Testing available n8n workflows...');
    
    try {
      const response = await this.apiClient.get('/api/integration/n8n/workflows');
      console.log('✅ Available n8n workflows:', response.data.workflows.length);
      
      response.data.workflows.forEach(workflow => {
        console.log(`  - ${workflow.name}: ${workflow.description}`);
      });
      
      return response.data.workflows;
    } catch (error) {
      console.error('❌ Failed to get n8n workflows:', error.message);
      throw error;
    }
  }

  /**
   * Test JavaScript execution task creation
   */
  async testJavaScriptTaskCreation() {
    console.log('🔍 Testing JavaScript task creation...');
    
    const testScript = `
      // Test script to analyze page performance
      const analysis = {
        url: window.location.href,
        title: document.title,
        totalElements: document.querySelectorAll('*').length,
        images: document.querySelectorAll('img').length,
        scripts: document.querySelectorAll('script').length,
        links: document.querySelectorAll('a').length,
        performance: {
          domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
        }
      };
      
      return analysis;
    `;

    try {
      const response = await this.apiClient.post('/api/tasks/javascript', {
        script: testScript,
        url: 'https://example.com',
        timeout: 30000,
        priority: 8
      });

      console.log('✅ JavaScript task created:', response.data.taskId);
      return response.data.taskId;
    } catch (error) {
      console.error('❌ Failed to create JavaScript task:', error.message);
      throw error;
    }
  }

  /**
   * Test DOM analysis task creation
   */
  async testDOMAnalysisTaskCreation() {
    console.log('🔍 Testing DOM analysis task creation...');
    
    try {
      const response = await this.apiClient.post('/api/tasks/dom-analysis', {
        url: 'https://example.com',
        analysisType: 'full',
        priority: 8
      });

      console.log('✅ DOM analysis task created:', response.data.taskId);
      return response.data.taskId;
    } catch (error) {
      console.error('❌ Failed to create DOM analysis task:', error.message);
      throw error;
    }
  }

  /**
   * Test n8n workflow task creation
   */
  async testN8nWorkflowTaskCreation() {
    console.log('🔍 Testing n8n workflow task creation...');
    
    try {
      const response = await this.apiClient.post('/api/tasks/n8n-workflow', {
        workflowId: 'dom-analysis-workflow',
        inputData: {
          url: 'https://example.com',
          analysisType: 'full'
        },
        timeout: 60000,
        priority: 8
      });

      console.log('✅ N8n workflow task created:', response.data.taskId);
      return response.data.taskId;
    } catch (error) {
      console.error('❌ Failed to create n8n workflow task:', error.message);
      throw error;
    }
  }

  /**
   * Test direct JavaScript execution
   */
  async testDirectJavaScriptExecution() {
    console.log('🔍 Testing direct JavaScript execution...');
    
    const testScript = `
      // Simple test to get page information
      return {
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    `;

    try {
      const startTime = performance.now();
      
      const response = await this.apiClient.post('/api/execute/javascript', {
        script: testScript,
        url: 'https://example.com',
        timeout: 30000
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      console.log('✅ Direct JavaScript execution completed:');
      console.log(`  Execution time: ${executionTime.toFixed(2)}ms`);
      console.log('  Result:', JSON.stringify(response.data.result, null, 2));
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to execute JavaScript:', error.message);
      throw error;
    }
  }

  /**
   * Test Cursor API function execution
   */
  async testCursorAPIExecution() {
    console.log('🔍 Testing Cursor API function execution...');
    
    try {
      const startTime = performance.now();
      
      const response = await this.apiClient.post('/api/cursor/execute', {
        functionName: 'getTitle',
        url: 'https://example.com',
        timeout: 30000
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      console.log('✅ Cursor API function executed:');
      console.log(`  Execution time: ${executionTime.toFixed(2)}ms`);
      console.log('  Result:', JSON.stringify(response.data.result, null, 2));
      
      return response.data;
    } catch (error) {
      console.error('❌ Failed to execute Cursor API function:', error.message);
      throw error;
    }
  }

  /**
   * Test task monitoring
   */
  async testTaskMonitoring(taskId) {
    console.log(`🔍 Testing task monitoring for: ${taskId}...`);
    
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout
    
    while (attempts < maxAttempts) {
      try {
        const response = await this.apiClient.get(`/api/tasks/${taskId}`);
        const task = response.data.task;
        
        console.log(`  Task status: ${task.status} (attempt ${attempts + 1}/${maxAttempts})`);
        
        if (task.status === 'completed') {
          console.log('✅ Task completed successfully:');
          console.log('  Result:', JSON.stringify(task.result, null, 2));
          return task;
        } else if (task.status === 'failed') {
          console.error('❌ Task failed:', task.error);
          throw new Error(`Task failed: ${task.error}`);
        } else if (task.status === 'cancelled') {
          console.log('⚠️ Task was cancelled');
          return task;
        }
        
        // Wait 1 second before next check
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
        
      } catch (error) {
        console.error('❌ Failed to monitor task:', error.message);
        throw error;
      }
    }
    
    throw new Error('Task monitoring timeout');
  }

  /**
   * Test task statistics
   */
  async testTaskStatistics() {
    console.log('🔍 Testing task statistics...');
    
    try {
      const response = await this.apiClient.get('/api/tasks/stats');
      console.log('✅ Task statistics:', JSON.stringify(response.data.stats, null, 2));
      return response.data.stats;
    } catch (error) {
      console.error('❌ Failed to get task statistics:', error.message);
      throw error;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Cursor-N8n integration tests...\n');
    
    const results = {
      passed: 0,
      failed: 0,
      tests: []
    };

    const tests = [
      { name: 'Integration Status', fn: () => this.testIntegrationStatus() },
      { name: 'Cursor Functions', fn: () => this.testCursorFunctions() },
      { name: 'N8n Workflows', fn: () => this.testN8nWorkflows() },
      { name: 'Direct JavaScript Execution', fn: () => this.testDirectJavaScriptExecution() },
      { name: 'Cursor API Execution', fn: () => this.testCursorAPIExecution() },
      { name: 'Task Statistics', fn: () => this.testTaskStatistics() }
    ];

    // Run basic tests first
    for (const test of tests) {
      try {
        console.log(`\n📋 Running test: ${test.name}`);
        await test.fn();
        results.passed++;
        results.tests.push({ name: test.name, status: 'passed' });
        console.log(`✅ Test passed: ${test.name}`);
      } catch (error) {
        results.failed++;
        results.tests.push({ name: test.name, status: 'failed', error: error.message });
        console.log(`❌ Test failed: ${test.name} - ${error.message}`);
      }
    }

    // Test task creation and monitoring
    try {
      console.log('\n📋 Running test: Task Creation and Monitoring');
      
      // Create a JavaScript task
      const jsTaskId = await this.testJavaScriptTaskCreation();
      
      // Monitor the task
      await this.testTaskMonitoring(jsTaskId);
      
      results.passed++;
      results.tests.push({ name: 'Task Creation and Monitoring', status: 'passed' });
      console.log('✅ Test passed: Task Creation and Monitoring');
      
    } catch (error) {
      results.failed++;
      results.tests.push({ name: 'Task Creation and Monitoring', status: 'failed', error: error.message });
      console.log(`❌ Test failed: Task Creation and Monitoring - ${error.message}`);
    }

    // Print summary
    console.log('\n📊 Test Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detailed Results:');
    results.tests.forEach(test => {
      const status = test.status === 'passed' ? '✅' : '❌';
      console.log(`  ${status} ${test.name}`);
      if (test.error) {
        console.log(`     Error: ${test.error}`);
      }
    });

    if (results.failed === 0) {
      console.log('\n🎉 All tests passed! The Cursor-N8n integration is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the integration setup.');
      process.exit(1);
    }
  }
}

// Run the tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new IntegrationTester();
  
  tester.runAllTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

export default IntegrationTester;
