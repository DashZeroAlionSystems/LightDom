#!/usr/bin/env node

/**
 * Test script for Automation Orchestration API
 * Tests basic functionality of the automation API
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

async function testAutomationAPI() {
  console.log('🧪 Testing Automation Orchestration API\n');

  try {
    // Test 1: Health Check
    console.log('Test 1: Health Check');
    const healthResponse = await axios.get(`${API_BASE}/automation/health`);
    console.log('✅ Health:', healthResponse.data.data.status);
    console.log('   Checks:', healthResponse.data.data.checks);
    console.log('');

    // Test 2: List Workflows
    console.log('Test 2: List Available Workflows');
    const workflowsResponse = await axios.get(`${API_BASE}/automation/workflows`);
    const workflows = workflowsResponse.data.data;
    console.log(`✅ Found ${workflows.length} workflows:`);
    workflows.forEach(wf => {
      console.log(`   - ${wf.workflowId}: ${wf.name}`);
    });
    console.log('');

    // Test 3: Get Metrics
    console.log('Test 3: Get Metrics');
    const metricsResponse = await axios.get(`${API_BASE}/automation/metrics`);
    const metrics = metricsResponse.data.data;
    console.log('✅ Metrics:');
    console.log(`   Total Jobs: ${metrics.totalJobs}`);
    console.log(`   Active Jobs: ${metrics.activeJobs}`);
    console.log(`   Success Rate: ${metrics.successRate.toFixed(2)}%`);
    console.log('');

    // Test 4: Start a Workflow (functionality-test)
    console.log('Test 4: Start Workflow (functionality-test)');
    const startResponse = await axios.post(`${API_BASE}/automation/workflow/start`, {
      workflowId: 'functionality-test',
      config: {
        timeout: 120000
      }
    });
    const jobId = startResponse.data.data.jobId;
    console.log(`✅ Workflow started with jobId: ${jobId}`);
    console.log('');

    // Test 5: Check Job Status
    console.log('Test 5: Check Job Status');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    const statusResponse = await axios.get(`${API_BASE}/automation/workflow/${jobId}`);
    const status = statusResponse.data.data;
    console.log('✅ Job Status:');
    console.log(`   Status: ${status.status}`);
    console.log(`   Progress: ${status.progress || 0}%`);
    if (status.startTime) {
      console.log(`   Started: ${new Date(status.startTime).toLocaleTimeString()}`);
    }
    console.log('');

    // Test 6: List All Jobs
    console.log('Test 6: List All Jobs');
    const jobsResponse = await axios.get(`${API_BASE}/automation/jobs`);
    const jobs = jobsResponse.data.data;
    console.log(`✅ Found ${jobs.length} jobs:`);
    jobs.forEach((job, index) => {
      console.log(`   ${index + 1}. ${job.workflowId} - ${job.status} (${job.jobId.substring(0, 8)}...)`);
    });
    console.log('');

    console.log('🎉 All tests passed!');
    console.log('\n📊 Summary:');
    console.log('   - API is accessible');
    console.log('   - Workflows are available');
    console.log('   - Jobs can be started and monitored');
    console.log('   - Metrics are being collected');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run tests
testAutomationAPI().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
