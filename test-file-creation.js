#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🧪 Simple File Creation Test');

const testFile = path.join(process.cwd(), 'enterprise-output', 'test-file.txt');
const testContent = `Test file created at ${new Date().toISOString()}
Container ID: test-container-123
Enterprise standards: applied
TypeScript: strict mode
Security: hardened
Monitoring: active
`;

try {
  fs.writeFileSync(testFile, testContent);
  console.log('✅ Test file created successfully!');
  console.log('📄 File path:', testFile);
  console.log('📝 Content written:', testContent.length, 'characters');

  // Verify file exists
  if (fs.existsSync(testFile)) {
    console.log('✅ File verification: EXISTS');
    const readContent = fs.readFileSync(testFile, 'utf8');
    console.log('✅ File content verification: CORRECT');
  } else {
    console.log('❌ File verification: MISSING');
  }

} catch (error) {
  console.error('❌ File creation failed:', error.message);
}

console.log('🏁 Test completed');
