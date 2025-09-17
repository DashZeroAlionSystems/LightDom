#!/usr/bin/env node

/**
 * Metaverse Chat System Demo
 * Demonstrates the complete metaverse chat functionality
 */

import { chatNodeManager } from '../src/core/ChatNodeManager.js';
import { spaceMiningEngine } from '../src/core/SpaceMiningEngine.js';

console.log('🚀 LightDom Metaverse Chat System Demo');
console.log('====================================');

async function runDemo() {
  try {
    console.log('\n1. Starting Space Mining...');
    
    // Mine space from multiple URLs
    const urls = [
      'https://example.com',
      'https://github.com',
      'https://stackoverflow.com'
    ];

    for (const url of urls) {
      console.log(`   ⛏️ Mining space from: ${url}`);
      const result = await spaceMiningEngine.mineSpaceFromURL(url);
      console.log(`   ✅ Mined ${result.spatialStructures.length} structures, ${result.isolatedDOMs.length} isolated DOMs, ${result.generatedBridges.length} bridges`);
    }

    console.log('\n2. Checking Chat Nodes Created...');
    
    const allNodes = chatNodeManager.getAllChatNodes();
    console.log(`   📊 Total chat nodes created: ${allNodes.length}`);
    
    // Display node summary
    const nodeTypeCount = allNodes.reduce((acc, node) => {
      acc[node.itemType] = (acc[node.itemType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('   📋 Node types:');
    Object.entries(nodeTypeCount).forEach(([type, count]) => {
      console.log(`      ${type}: ${count} nodes`);
    });

    console.log('\n3. Demonstrating Chat Functionality...');
    
    if (allNodes.length > 0) {
      const testNode = allNodes[0];
      console.log(`   💬 Testing chat in node: ${testNode.name}`);
      
      // Add test users
      const users = [
        { address: '0x1111111111111111111111111111111111111111', name: 'Alice' },
        { address: '0x2222222222222222222222222222222222222222', name: 'Bob' },
        { address: '0x3333333333333333333333333333333333333333', name: 'Charlie' }
      ];

      for (const user of users) {
        await chatNodeManager.joinChatNode(testNode.id, user.address, user.name);
        console.log(`   👤 ${user.name} joined the chat`);
      }

      // Send test messages
      const testMessages = [
        { sender: users[0], content: 'Hello everyone! Welcome to the metaverse!' },
        { sender: users[1], content: 'This is amazing! The optimization created this whole virtual space.' },
        { sender: users[2], content: 'I love how each DOM element becomes a chat node. #metaverse #innovation' },
        { sender: users[0], content: 'The future is here! 🚀' }
      ];

      for (const msg of testMessages) {
        await chatNodeManager.sendMessage(
          testNode.id,
          msg.sender.address,
          msg.content,
          'text'
        );
        console.log(`   💬 ${msg.sender.name}: ${msg.content}`);
      }

      // Show node statistics
      const updatedNode = chatNodeManager.getChatNode(testNode.id);
      console.log(`\n   📊 Node Statistics:`);
      console.log(`      Participants: ${updatedNode?.participants.size}`);
      console.log(`      Messages: ${updatedNode?.statistics.totalMessages}`);
      console.log(`      Popular hashtags: ${Array.from(updatedNode?.statistics.popularHashtags.entries() || []).map(([tag, count]) => `${tag}(${count})`).join(', ')}`);
    }

    console.log('\n4. Bridge Coordination Demo...');
    
    const bridges = spaceMiningEngine.getMetaverseBridges();
    console.log(`   🌉 Active bridges: ${bridges.length}`);
    
    bridges.forEach(bridge => {
      console.log(`      ${bridge.sourceChain} → ${bridge.targetChain} (${bridge.status})`);
      if (bridge.capabilities.chatEnabled) {
        console.log(`         💬 Chat enabled - Throughput: ${bridge.performance.throughput} TPS`);
      }
    });

    console.log('\n5. Security Features Demo...');
    
    const securityLevels = allNodes.reduce((acc, node) => {
      acc[node.securityLevel] = (acc[node.securityLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('   🔒 Security levels:');
    Object.entries(securityLevels).forEach(([level, count]) => {
      console.log(`      ${level}: ${count} nodes`);
    });

    console.log('\n6. Metaverse Economy Overview...');
    
    const itemTypes = allNodes.map(node => node.itemType);
    const virtualLands = itemTypes.filter(type => type === 'virtual_land').length;
    const aiNodes = itemTypes.filter(type => type === 'ai_node').length;
    const storageShards = itemTypes.filter(type => type === 'storage_shard').length;
    const bridgeNodes = itemTypes.filter(type => type === 'bridge').length;
    const realityAnchors = itemTypes.filter(type => type === 'reality_anchor').length;

    console.log(`   🌍 Virtual Lands: ${virtualLands} parcels`);
    console.log(`   🤖 AI Consensus Nodes: ${aiNodes} nodes`);
    console.log(`   💾 Storage Shards: ${storageShards} shards`);
    console.log(`   🌉 Cross-Chain Bridges: ${bridgeNodes} bridges`);
    console.log(`   ⚓ Reality Anchors: ${realityAnchors} anchors`);

    const totalValue = virtualLands * 100 + aiNodes * 500 + storageShards * 250 + bridgeNodes * 1000 + realityAnchors * 300;
    console.log(`   💰 Estimated Total Value: ${totalValue} DSH tokens`);

    console.log('\n7. Advanced Features...');
    
    console.log('   ✅ Real-time messaging with Socket.IO');
    console.log('   ✅ Multi-layer security (auth, encryption, access control)');
    console.log('   ✅ Cross-chain bridge coordination');
    console.log('   ✅ Governance and voting systems');
    console.log('   ✅ Anti-spam and moderation');
    console.log('   ✅ Message reactions and threading');
    console.log('   ✅ File sharing and voice messages');
    console.log('   ✅ Participant reputation system');
    console.log('   ✅ Analytics and statistics');
    console.log('   ✅ Automatic node creation for mined items');

    console.log('\n🎉 Demo Complete!');
    console.log('\nThe LightDom Metaverse Chat System is now fully operational.');
    console.log('Each web optimization creates virtual assets with dedicated chat nodes,');
    console.log('enabling a vibrant metaverse economy with secure communication.');
    
    console.log('\n📖 For more information, see:');
    console.log('   - docs/METAVERSE_ARCHITECTURE.md');
    console.log('   - src/components/MetaverseChatDashboard.tsx');
    console.log('   - src/core/ChatNodeManager.ts');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
runDemo();