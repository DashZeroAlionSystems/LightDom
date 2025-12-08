#!/usr/bin/env node

/**
 * Scraper Manager and DeepSeek Chat Demo
 * Demonstrates the complete system functionality
 */

import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testScraperManager() {
  console.log('\n🔧 Testing Scraper Manager Service\n');
  console.log('=' .repeat(60));
  
  try {
    // 1. Check status
    console.log('\n1. Checking scraper manager status...');
    const statusRes = await axios.get(`${API_BASE}/scraper-manager/status`);
    console.log('✅ Status:', JSON.stringify(statusRes.data, null, 2));
    
    // 2. Create a mining instance
    console.log('\n2. Creating mining instance...');
    const createRes = await axios.post(`${API_BASE}/scraper-manager/instances`, {
      name: 'Material Design Scraper',
      config: {
        maxConcurrency: 5,
        timeout: 30000,
      },
    });
    console.log('✅ Instance created:', createRes.data.instance.id);
    const instanceId = createRes.data.instance.id;
    
    // 3. Add URL seeds
    console.log('\n3. Adding URL seeds...');
    const seedsRes = await axios.post(`${API_BASE}/scraper-manager/instances/${instanceId}/seeds/bulk`, {
      urls: [
        { url: 'https://material.io', priority: 10, tags: ['material-design', 'components'] },
        { url: 'https://www.tensorflow.org', priority: 10, tags: ['tensorflow', 'ml'] },
        { url: 'https://www.kaggle.com', priority: 8, tags: ['kaggle', 'data-science'] },
        { url: 'https://animejs.com', priority: 9, tags: ['animation', 'ux'] },
      ],
    });
    console.log(`✅ Added ${seedsRes.data.count} URL seeds`);
    
    // 4. Get instance details
    console.log('\n4. Getting instance details...');
    const instanceRes = await axios.get(`${API_BASE}/scraper-manager/instances/${instanceId}`);
    console.log('✅ Instance:', instanceRes.data.instance.name);
    
    // 5. Get instance seeds
    console.log('\n5. Getting instance seeds...');
    const seedsListRes = await axios.get(`${API_BASE}/scraper-manager/instances/${instanceId}/seeds`);
    console.log(`✅ Found ${seedsListRes.data.seeds.length} seeds`);
    
    // 6. Start the instance
    console.log('\n6. Starting instance...');
    const startRes = await axios.post(`${API_BASE}/scraper-manager/instances/${instanceId}/start`);
    console.log('✅ Instance started:', startRes.data.instance.status);
    
    await delay(2000);
    
    // 7. Get instance stats
    console.log('\n7. Getting instance statistics...');
    const statsRes = await axios.get(`${API_BASE}/scraper-manager/instances/${instanceId}/stats`);
    console.log('✅ Stats:', JSON.stringify(statsRes.data.stats, null, 2));
    
    // 8. Stop the instance
    console.log('\n8. Stopping instance...');
    const stopRes = await axios.post(`${API_BASE}/scraper-manager/instances/${instanceId}/stop`);
    console.log('✅ Instance stopped:', stopRes.data.instance.status);
    
    // 9. List all instances
    console.log('\n9. Listing all instances...');
    const listRes = await axios.get(`${API_BASE}/scraper-manager/instances`);
    console.log(`✅ Total instances: ${listRes.data.instances.length}`);
    
    console.log('\n✅ Scraper Manager test completed successfully!');
    
  } catch (error) {
    console.error('❌ Scraper Manager test failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testDeepSeekChat() {
  console.log('\n\n🤖 Testing DeepSeek Chat Service\n');
  console.log('=' .repeat(60));
  
  try {
    // 1. Check status
    console.log('\n1. Checking chat service status...');
    const statusRes = await axios.get(`${API_BASE}/chat/status`);
    console.log('✅ Status:', JSON.stringify(statusRes.data.status, null, 2));
    
    if (!statusRes.data.status.ollamaConnected) {
      console.warn('⚠️  Ollama is not connected. Skipping chat tests.');
      console.warn('   Start Ollama with: ollama serve');
      console.warn('   Pull DeepSeek: ollama pull deepseek-r1:latest');
      return;
    }
    
    // 2. Create a conversation
    console.log('\n2. Creating conversation...');
    const createRes = await axios.post(`${API_BASE}/chat/conversations`, {
      title: 'Design System Discussion',
      userId: 'demo-user',
      context: { topic: 'component-design' },
    });
    console.log('✅ Conversation created:', createRes.data.conversation.id);
    const conversationId = createRes.data.conversation.id;
    
    // 3. Send a message
    console.log('\n3. Sending message to DeepSeek...');
    const messageRes = await axios.post(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
      message: 'What are the key principles of Material Design?',
    });
    console.log('✅ User message sent');
    console.log('📝 DeepSeek response:', messageRes.data.aiMessage.content.substring(0, 200) + '...');
    
    // 4. Send another message
    console.log('\n4. Sending follow-up message...');
    const followupRes = await axios.post(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
      message: 'Can you explain the difference between atoms, molecules, and organisms in atomic design?',
    });
    console.log('✅ Follow-up sent');
    console.log('📝 DeepSeek response:', followupRes.data.aiMessage.content.substring(0, 200) + '...');
    
    // 5. Get conversation history
    console.log('\n5. Getting conversation history...');
    const convRes = await axios.get(`${API_BASE}/chat/conversations/${conversationId}`);
    console.log(`✅ Conversation has ${convRes.data.conversation.messages.length} messages`);
    
    // 6. List all conversations
    console.log('\n6. Listing all conversations...');
    const listRes = await axios.get(`${API_BASE}/chat/conversations`);
    console.log(`✅ Total conversations: ${listRes.data.conversations.length}`);
    
    console.log('\n✅ DeepSeek Chat test completed successfully!');
    
  } catch (error) {
    console.error('❌ DeepSeek Chat test failed:', error.response?.data || error.message);
    if (error.response?.data?.error?.includes('Ollama')) {
      console.warn('\n⚠️  Make sure Ollama is running:');
      console.warn('   1. Start Ollama: ollama serve');
      console.warn('   2. Pull model: ollama pull deepseek-r1:latest');
    }
    throw error;
  }
}

async function testStorybookMining() {
  console.log('\n\n📖 Testing Storybook Mining Service\n');
  console.log('=' .repeat(60));
  
  try {
    // 1. Check status
    console.log('\n1. Checking mining service status...');
    const statusRes = await axios.get(`${API_BASE}/storybook-mining/status`);
    console.log('✅ Status:', JSON.stringify(statusRes.data.status, null, 2));
    
    // 2. Mine a single website
    console.log('\n2. Mining components from anime.js...');
    const mineRes = await axios.post(`${API_BASE}/storybook-mining/mine`, {
      url: 'https://animejs.com',
    });
    console.log(`✅ Mined ${mineRes.data.count} components`);
    
    if (mineRes.data.components.length > 0) {
      const firstComponent = mineRes.data.components[0];
      console.log('\n   First component details:');
      console.log(`   - Selector: ${firstComponent.selector}`);
      console.log(`   - Type: ${firstComponent.componentType || 'Unknown'}`);
      
      // 3. Get component attributes
      if (firstComponent.id) {
        console.log('\n3. Getting component attributes...');
        const attrsRes = await axios.get(`${API_BASE}/storybook-mining/components/${firstComponent.id}/attributes`);
        console.log(`✅ Component has ${attrsRes.data.attributes.length} attributes`);
      }
    }
    
    // 4. Get data streams
    console.log('\n4. Getting data streams...');
    const streamsRes = await axios.get(`${API_BASE}/storybook-mining/data-streams`);
    console.log(`✅ Found ${streamsRes.data.dataStreams.length} data streams:`);
    streamsRes.data.dataStreams.forEach(stream => {
      console.log(`   - ${stream.data_stream} (${stream.collection}): ${stream.attribute_count} attributes`);
    });
    
    // 5. List mined components
    console.log('\n5. Listing mined components...');
    const componentsRes = await axios.get(`${API_BASE}/storybook-mining/components?limit=10`);
    console.log(`✅ Total components in database: ${componentsRes.data.components.length}`);
    
    console.log('\n✅ Storybook Mining test completed successfully!');
    
  } catch (error) {
    console.error('❌ Storybook Mining test failed:', error.response?.data || error.message);
    throw error;
  }
}

async function main() {
  console.log('\n🚀 LightDom System Integration Demo');
  console.log('=' .repeat(60));
  console.log('\nThis demo tests the following services:');
  console.log('  1. Scraper Manager (mining instances with URL seeding)');
  console.log('  2. DeepSeek Chat (AI conversations via Ollama)');
  console.log('  3. Storybook Mining (component extraction from design sites)');
  console.log('\nMake sure the API server is running on http://localhost:3001');
  console.log('\n');
  
  try {
    // Wait for API server to be ready
    console.log('Waiting for API server...');
    let retries = 5;
    while (retries > 0) {
      try {
        await axios.get(`${API_BASE.replace('/api', '')}/health`);
        console.log('✅ API server is ready\n');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error('API server is not responding. Please start it with: node api-server-express.js');
        }
        await delay(2000);
      }
    }
    
    // Run tests
    await testScraperManager();
    await delay(1000);
    
    await testDeepSeekChat();
    await delay(1000);
    
    await testStorybookMining();
    
    console.log('\n\n🎉 All tests completed successfully!');
    console.log('\n📍 Next steps:');
    console.log('  1. Visit http://localhost:3000/dashboard/scraper-manager to manage scrapers');
    console.log('  2. Visit http://localhost:3000/dashboard/chat to chat with DeepSeek');
    console.log('  3. Visit http://localhost:6006 to view generated Storybook stories');
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    process.exit(1);
  }
}

main();
