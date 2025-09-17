#!/usr/bin/env node
// LightDom Health Check Script

const http = require('http');

console.log('🔍 Checking LightDom system health...');

// Check if services are running
const services = ['api', 'automation', 'monitoring'];
let allHealthy = true;

for (const service of services) {
  try {
    const response = await fetch('http://localhost:3000/health');
    if (response.ok) {
      console.log(`✅ ${service} is healthy`);
    } else {
      console.log(`❌ ${service} is down`);
      allHealthy = false;
    }
  } catch (error) {
    console.log(`❌ ${service} is down: ${error.message}`);
    allHealthy = false;
  }
}

if (!allHealthy) {
  process.exit(1);
}

console.log('✅ System health check completed');
