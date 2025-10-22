#!/usr/bin/env node

// Create test tickets for the critical issues found by autopilot
import fetch from 'node-fetch';

async function createTestTickets() {
  try {
    console.log('🎫 Creating test tickets for critical issues...');
    
    const tickets = [
      {
        title: 'Fix API Server Startup',
        description: 'API server cannot start - investigate and fix startup issues. Check port conflicts, dependencies, and configuration.',
        priority: 'Critical'
      },
      {
        title: 'Restore Frontend Accessibility',
        description: 'Frontend not accessible - resolve Vite/dev server startup and port conflicts; verify http://localhost:3000 reachable and styled.',
        priority: 'Critical'
      },
      {
        title: 'Switch to Real API Server',
        description: 'Replace simple-api-server.js with api-server-express.js in all start scripts and ensure health endpoint returns real data.',
        priority: 'High'
      }
    ];
    
    for (const ticket of tickets) {
      console.log(`Creating ticket: ${ticket.title}`);
      
      const response = await fetch('http://localhost:3099/api/tickets/enqueue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticket)
      });
      
      const result = await response.json();
      console.log(`✅ ${ticket.title}:`, result);
    }
    
    // Check final status
    const statusResponse = await fetch('http://localhost:3099/api/tickets/status');
    const status = await statusResponse.json();
    console.log('📊 Final queue status:', status);
    
  } catch (error) {
    console.error('❌ Failed to create tickets:', error.message);
  }
}

createTestTickets();
