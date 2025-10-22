#!/usr/bin/env node

// Test script for ticket queue functionality
import fetch from 'node-fetch';

async function testTicketQueue() {
  try {
    console.log('🧪 Testing Ticket Queue...');
    
    // Test status endpoint
    console.log('1. Testing status endpoint...');
    const statusResponse = await fetch('http://localhost:3099/api/tickets/status');
    const status = await statusResponse.json();
    console.log('✅ Status:', status);
    
    // Test enqueue endpoint
    console.log('2. Testing enqueue endpoint...');
    const ticketData = {
      title: 'Test Ticket from Script',
      description: 'This is a test ticket created by the test script',
      priority: 'High'
    };
    
    const enqueueResponse = await fetch('http://localhost:3099/api/tickets/enqueue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ticketData)
    });
    
    const enqueueResult = await enqueueResponse.json();
    console.log('✅ Enqueue result:', enqueueResult);
    
    // Check status again
    console.log('3. Checking status after enqueue...');
    const statusResponse2 = await fetch('http://localhost:3099/api/tickets/status');
    const status2 = await statusResponse2.json();
    console.log('✅ Status after enqueue:', status2);
    
    console.log('🎉 Ticket queue test completed successfully!');
    
  } catch (error) {
    console.error('❌ Ticket queue test failed:', error.message);
    process.exit(1);
  }
}

testTicketQueue();
