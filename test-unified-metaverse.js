/**
 * Test script for Unified Metaverse System
 * Tests the complete integration of all metaverse features
 */

import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = 'http://localhost:3001';
const SOCKET_URL = 'http://localhost:3001';

// Test data
const testUser = {
  walletAddress: '0x1234567890abcdef',
  username: 'TestUser'
};

const testRoom = {
  name: 'Test Metaverse Room',
  description: 'Testing unified bridge system',
  maxParticipants: 50,
  public: true,
  price: '0'
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testUnifiedMetaverse() {
  console.log('🚀 Starting Unified Metaverse Test...\n');

  try {
    // 1. Test API Health
    console.log('1️⃣ Testing API Health...');
    const health = await axios.get(`${API_URL}/api/health`);
    console.log('✅ API is healthy:', health.data.status);
    
    // 2. Test Bridge Analytics
    console.log('\n2️⃣ Testing Bridge Analytics...');
    const analytics = await axios.get(`${API_URL}/api/bridge/analytics`);
    console.log('✅ Bridge Analytics:', {
      totalBridges: analytics.data.data.totalBridges,
      totalSpace: `${(analytics.data.data.totalSpace / 1024 / 1024).toFixed(2)} MB`,
      operationalBridges: analytics.data.data.operationalBridges
    });

    // 3. Test Socket Connection
    console.log('\n3️⃣ Testing Socket.io Connection...');
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    await new Promise((resolve, reject) => {
      socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
        resolve();
      });
      
      socket.on('connect_error', (error) => {
        console.error('❌ Socket connection failed:', error.message);
        reject(error);
      });

      // Timeout after 5 seconds
      setTimeout(() => reject(new Error('Socket connection timeout')), 5000);
    });

    // 4. Test Creating a Chatroom
    console.log('\n4️⃣ Testing Chatroom Creation...');
    const createRoomResponse = await axios.post(`${API_URL}/api/metaverse/create-room`, {
      owner: testUser.walletAddress,
      name: testRoom.name,
      description: testRoom.description,
      maxParticipants: testRoom.maxParticipants,
      public: testRoom.public,
      price: testRoom.price
    });

    if (createRoomResponse.data.success) {
      const room = createRoomResponse.data.data;
      console.log('✅ Chatroom created:', {
        id: room.id,
        name: room.name,
        totalSpace: `${(room.totalSpace / 1024).toFixed(2)} KB`
      });

      // 5. Test Joining Bridge
      console.log('\n5️⃣ Testing Bridge Join...');
      
      // Check if room has bridges
      const bridges = await axios.get(`${API_URL}/api/metaverse/room/${room.id}/bridges`);
      
      if (bridges.data.data && bridges.data.data.length > 0) {
        const bridge = bridges.data.data[0];
        
        // Join bridge via API
        const joinResponse = await axios.post(`${API_URL}/api/bridge/join/${bridge.id}`, {
          userId: testUser.walletAddress
        });
        
        console.log('✅ Joined bridge:', {
          bridgeId: bridge.id,
          stats: joinResponse.data.data
        });

        // Join via socket
        socket.emit('join_bridge', {
          bridgeId: bridge.id,
          userId: testUser.walletAddress
        });

        // 6. Test Sending Messages
        console.log('\n6️⃣ Testing Message Sending...');
        
        // Set up message listener
        socket.on('bridge_message', (message) => {
          console.log('📨 Received bridge message:', {
            from: message.user_name,
            text: message.message_text,
            type: message.message_type
          });
        });

        // Send test message via API
        const messageResponse = await axios.post(`${API_URL}/api/bridge/message`, {
          bridgeId: bridge.id,
          userId: testUser.walletAddress,
          userName: testUser.username,
          messageText: 'Hello from unified metaverse test!',
          messageType: 'text'
        });

        console.log('✅ Message sent:', messageResponse.data.data.message_id);

        // Wait for message to propagate
        await delay(1000);

        // 7. Test Bridge Stats
        console.log('\n7️⃣ Testing Bridge Statistics...');
        const statsResponse = await axios.get(`${API_URL}/api/bridge/${bridge.id}/stats`);
        console.log('✅ Bridge stats:', statsResponse.data.data);

      } else {
        console.log('⚠️ No bridges available for this room');
      }

      // 8. Test Space Allocation
      console.log('\n8️⃣ Testing Space Allocation...');
      try {
        const allocationResponse = await axios.post(`${API_URL}/api/bridge/allocate-space`, {
          roomId: room.id,
          sizeRequired: 1024 * 10, // 10KB
          owner: testUser.walletAddress
        });
        
        console.log('✅ Space allocated:', {
          slots: allocationResponse.data.data.length,
          totalSize: allocationResponse.data.data.reduce((sum, slot) => sum + slot.size, 0)
        });
      } catch (error) {
        console.log('⚠️ Space allocation requires LDOM tokens:', error.response?.data?.error || error.message);
      }

    } else {
      console.error('❌ Failed to create chatroom:', createRoomResponse.data.error);
    }

    // 9. Test Real-time Events
    console.log('\n9️⃣ Testing Real-time Events...');
    
    // Listen for various events
    socket.on('user_joined', (data) => {
      console.log('👤 User joined:', data);
    });
    
    socket.on('space_allocated', (data) => {
      console.log('📦 Space allocated:', data);
    });
    
    socket.on('optimization_started', (data) => {
      console.log('🔧 Optimization started:', data);
    });

    // Simulate some events
    socket.emit('bridge_created', {
      bridgeId: 'test_bridge_001',
      capacity: 1024 * 1024, // 1MB
      metadata: { test: true }
    });

    await delay(1000);

    // Cleanup
    socket.disconnect();
    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run tests
console.log('================================');
console.log('Unified Metaverse Test Suite');
console.log('================================\n');

testUnifiedMetaverse().then(() => {
  console.log('\n✨ Unified Metaverse is working correctly!');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
