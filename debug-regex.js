#!/usr/bin/env node

// Debug the regex patterns for ticket creation
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

console.log('Testing regex patterns...');

const patterns = [
  { name: 'Electron', pattern: /Electron not working|Electron not installed/i },
  { name: 'API Mock', pattern: /API server using mock|mock.*data|fake.*data|Using fake API server|mock API server/i },
  { name: 'Frontend', pattern: /Frontend not accessible|Frontend.*not.*accessible|blank|white screen/i },
  { name: 'API Startup', pattern: /API server cannot start|API server startup failed/i },
  { name: 'Database', pattern: /Database: Broken|PostgreSQL not running|Database not running/i }
];

patterns.forEach(({ name, pattern }) => {
  const match = pattern.test(complianceOutput);
  console.log(`${name}: ${match ? '✅ MATCH' : '❌ NO MATCH'}`);
  if (match) {
    const matches = complianceOutput.match(pattern);
    console.log(`  Matched: "${matches[0]}"`);
  }
});

// Test the specific text patterns
console.log('\nTesting specific text patterns:');
console.log('Contains "API server cannot start":', complianceOutput.includes('API server cannot start'));
console.log('Contains "Frontend not accessible":', complianceOutput.includes('Frontend not accessible'));
console.log('Contains "API server using mock":', complianceOutput.includes('API server using mock'));
console.log('Contains "fake data":', complianceOutput.includes('fake data'));
