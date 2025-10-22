#!/usr/bin/env node

// Test the autopilot ticket creation function
import fetch from 'node-fetch';

async function testAutopilotTicketCreation() {
  try {
    console.log('🧪 Testing Autopilot Ticket Creation...');
    
    // Simulate the compliance check output
    const complianceOutput = `
🚀 LightDom Functionality Test
==============================
Testing actual functionality, not just code structure...

✅ Testing Electron functionality...
🎉   ✓ Electron installed: v38.1.2
✅ Testing API server...
🎉   ✓ Using real API server
🚨   🚨 CRITICAL: API server cannot start
✅ Testing frontend...
🚨   🚨 CRITICAL: Frontend not accessible
✅ Testing for mock data usage...
🚨   🚨 CRITICAL: API server using mock/fake data

==================================================
📊 FUNCTIONALITY TEST REPORT
==================================================
📈 Total Checks: 5
✅ Passed: 2
❌ Failed: 0
🚨 CRITICAL: 3
📊 Success Rate: 40.0%

🚨 CRITICAL ISSUES FOUND:
   1. API server startup failed
   2. Frontend not accessible - app unusable
   3. API server returns fake data - no real functionality

❌ PROJECT STATUS: NOT WORKING - CRITICAL ISSUES
   The application has critical functionality issues.
==================================================
`;

    console.log('1. Testing ticket creation from compliance output...');
    
    // Test the ticket creation logic
    const items = [];
    const add = (title, description) => items.push({ title, description });

    if (/Electron not working|Electron not installed/i.test(complianceOutput)) {
      add('Fix Electron runtime availability', 'Ensure Electron is installed and accessible (global or npx). Update scripts and CI to verify electron --version.');
    }
    if (/Using fake API server|mock API server/i.test(complianceOutput)) {
      add('Switch to real API server', 'Replace simple-api-server.js with api-server-express.js in all start scripts and ensure health endpoint returns real data.');
    }
    if (/Frontend not accessible|blank|white screen/i.test(complianceOutput)) {
      add('Restore frontend accessibility', 'Resolve Vite/dev server startup and port conflicts; verify http://localhost:3000 reachable and styled.');
    }
    if (/Database: Broken|PostgreSQL not running|Database not running/i.test(complianceOutput)) {
      add('Start and connect to PostgreSQL/Redis', 'Spin up postgres/redis via docker-compose and add graceful fallbacks.');
    }

    if (items.length === 0) {
      // Generic ticket as fallback
      add('Investigate failing compliance checks', 'Review automation output and logs to identify root causes; fix services until compliance passes.');
    }

    console.log(`Found ${items.length} tickets to create:`, items.map(i => i.title));

    // Create the tickets
    const port = process.env.TICKET_QUEUE_PORT || 3099;
    for (const it of items) {
      console.log(`Creating ticket: ${it.title}`);
      const response = await fetch(`http://localhost:${port}/api/tickets/enqueue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: it.title, description: it.description, priority: 'High' })
      });
      const result = await response.json();
      console.log(`✅ ${it.title}:`, result);
    }

    // Check final status
    const statusResponse = await fetch(`http://localhost:${port}/api/tickets/status`);
    const status = await statusResponse.json();
    console.log('📊 Final queue status:', status);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAutopilotTicketCreation();
