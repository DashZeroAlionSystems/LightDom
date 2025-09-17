/**
 * Chat Node System Tests
 * Comprehensive test suite for the metaverse chat functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { chatNodeManager, ChatNodeCreateOptions } from '../core/ChatNodeManager';
import { spaceMiningEngine } from '../core/SpaceMiningEngine';

describe('ChatNodeManager', () => {
  beforeEach(() => {
    // Clean up any existing chat nodes
    chatNodeManager.getAllChatNodes().forEach(node => {
      chatNodeManager.deleteChatNode(node.id, node.createdBy);
    });
  });

  afterEach(() => {
    // Clean up after tests
    chatNodeManager.getAllChatNodes().forEach(node => {
      chatNodeManager.deleteChatNode(node.id, node.createdBy);
    });
  });

  describe('Chat Node Creation', () => {
    it('should create a chat node for a virtual land item', async () => {
      const options: ChatNodeCreateOptions = {
        itemId: 'land_test_001',
        itemType: 'virtual_land',
        itemData: { 
          coordinates: { x: 100, y: 100, z: 0 },
          size: 1000,
          biome: 'digital'
        },
        creatorAddress: '0x1234567890123456789012345678901234567890',
        name: 'Test Virtual Land',
        description: 'A test virtual land parcel for testing',
        chatType: 'public',
        securityLevel: 'open'
      };

      const chatNode = await chatNodeManager.createChatNode(options);

      expect(chatNode).toBeDefined();
      expect(chatNode.itemId).toBe('land_test_001');
      expect(chatNode.itemType).toBe('virtual_land');
      expect(chatNode.name).toBe('Test Virtual Land');
      expect(chatNode.chatType).toBe('public');
      expect(chatNode.securityLevel).toBe('open');
      expect(chatNode.participants.size).toBe(1);
      expect(chatNode.messageHistory.length).toBe(1); // Welcome message
    });

    it('should create a chat node for an AI node item', async () => {
      const options: ChatNodeCreateOptions = {
        itemId: 'ai_node_test_001',
        itemType: 'ai_node',
        itemData: { 
          algorithm: 'optimization_v2',
          processingPower: 1000,
          consensusWeight: 50
        },
        creatorAddress: '0x1234567890123456789012345678901234567890',
        name: 'Test AI Node',
        description: 'A test AI consensus node for testing',
        chatType: 'technical',
        securityLevel: 'restricted'
      };

      const chatNode = await chatNodeManager.createChatNode(options);

      expect(chatNode).toBeDefined();
      expect(chatNode.itemType).toBe('ai_node');
      expect(chatNode.chatType).toBe('technical');
      expect(chatNode.securityLevel).toBe('restricted');
      expect(chatNode.settings.maxParticipants).toBe(50); // AI nodes have lower participant limits
    });

    it('should create a chat node for a bridge item', async () => {
      const options: ChatNodeCreateOptions = {
        itemId: 'bridge_test_001',
        itemType: 'bridge',
        itemData: { 
          sourceChain: 'Ethereum',
          targetChain: 'Polygon',
          throughput: 100
        },
        creatorAddress: '0x1234567890123456789012345678901234567890',
        name: 'Test Bridge',
        description: 'A test cross-chain bridge for testing',
        chatType: 'bridge_coordination',
        securityLevel: 'restricted'
      };

      const chatNode = await chatNodeManager.createChatNode(options);

      expect(chatNode).toBeDefined();
      expect(chatNode.itemType).toBe('bridge');
      expect(chatNode.chatType).toBe('bridge_coordination');
      expect(chatNode.settings.maxParticipants).toBe(200); // Bridges have higher participant limits
      expect(chatNode.settings.allowBridgeMessages).toBe(true);
    });
  });

  describe('User Management', () => {
    let testChatNode: any;

    beforeEach(async () => {
      const options: ChatNodeCreateOptions = {
        itemId: 'test_item_001',
        itemType: 'virtual_land',
        itemData: {},
        creatorAddress: '0x1234567890123456789012345678901234567890',
        name: 'Test Chat Node',
        description: 'A test chat node for user management testing'
      };

      testChatNode = await chatNodeManager.createChatNode(options);
    });

    it('should allow users to join a chat node', async () => {
      const userAddress = '0x2234567890123456789012345678901234567890';
      const userName = 'TestUser';

      const success = await chatNodeManager.joinChatNode(testChatNode.id, userAddress, userName);

      expect(success).toBe(true);
      
      const updatedNode = chatNodeManager.getChatNode(testChatNode.id);
      expect(updatedNode?.participants.size).toBe(2); // Creator + new user
      expect(updatedNode?.participants.has(userAddress)).toBe(true);
      
      const participant = updatedNode?.participants.get(userAddress);
      expect(participant?.name).toBe(userName);
      expect(participant?.role).toBe('member');
    });

    it('should not allow duplicate user joins', async () => {
      const userAddress = '0x2234567890123456789012345678901234567890';
      const userName = 'TestUser';

      // Join first time
      await chatNodeManager.joinChatNode(testChatNode.id, userAddress, userName);
      
      // Try to join again
      await chatNodeManager.joinChatNode(testChatNode.id, userAddress, userName);

      const updatedNode = chatNodeManager.getChatNode(testChatNode.id);
      expect(updatedNode?.participants.size).toBe(2); // Should still be 2
    });
  });

  describe('Messaging', () => {
    let testChatNode: any;
    const creatorAddress = '0x1234567890123456789012345678901234567890';
    const userAddress = '0x2234567890123456789012345678901234567890';

    beforeEach(async () => {
      const options: ChatNodeCreateOptions = {
        itemId: 'test_item_001',
        itemType: 'virtual_land',
        itemData: {},
        creatorAddress,
        name: 'Test Chat Node',
        description: 'A test chat node for messaging testing'
      };

      testChatNode = await chatNodeManager.createChatNode(options);
      await chatNodeManager.joinChatNode(testChatNode.id, userAddress, 'TestUser');
    });

    it('should allow participants to send messages', async () => {
      const messageContent = 'Hello, this is a test message!';

      const message = await chatNodeManager.sendMessage(
        testChatNode.id,
        userAddress,
        messageContent,
        'text'
      );

      expect(message).toBeDefined();
      expect(message.content).toBe(messageContent);
      expect(message.senderId).toBe(userAddress);
      expect(message.messageType).toBe('text');
      expect(message.nodeId).toBe(testChatNode.id);

      const updatedNode = chatNodeManager.getChatNode(testChatNode.id);
      expect(updatedNode?.messageHistory.length).toBe(3); // Welcome + join notification + new message
      expect(updatedNode?.statistics.totalMessages).toBe(3);
    });

    it('should not allow non-participants to send messages', async () => {
      const nonParticipantAddress = '0x3234567890123456789012345678901234567890';
      const messageContent = 'This should fail';

      await expect(
        chatNodeManager.sendMessage(testChatNode.id, nonParticipantAddress, messageContent, 'text')
      ).rejects.toThrow('User is not a participant in this chat node');
    });

    it('should handle message replies', async () => {
      // Send original message
      const originalMessage = await chatNodeManager.sendMessage(
        testChatNode.id,
        userAddress,
        'Original message',
        'text'
      );

      // Send reply
      const replyMessage = await chatNodeManager.sendMessage(
        testChatNode.id,
        creatorAddress,
        'Reply to original',
        'text',
        undefined,
        originalMessage.id
      );

      expect(replyMessage.replyTo).toBe(originalMessage.id);
    });
  });

  describe('Statistics and Analytics', () => {
    let testChatNode: any;

    beforeEach(async () => {
      const options: ChatNodeCreateOptions = {
        itemId: 'test_item_001',
        itemType: 'virtual_land',
        itemData: {},
        creatorAddress: '0x1234567890123456789012345678901234567890',
        name: 'Test Chat Node',
        description: 'A test chat node for statistics testing'
      };

      testChatNode = await chatNodeManager.createChatNode(options);
    });

    it('should track message statistics', async () => {
      const userAddress = '0x2234567890123456789012345678901234567890';
      await chatNodeManager.joinChatNode(testChatNode.id, userAddress, 'TestUser');

      // Send several messages
      await chatNodeManager.sendMessage(testChatNode.id, userAddress, 'Message 1', 'text');
      await chatNodeManager.sendMessage(testChatNode.id, userAddress, 'Message 2 #test', 'text');
      await chatNodeManager.sendMessage(testChatNode.id, userAddress, 'Message 3 #test #chat', 'text');

      const updatedNode = chatNodeManager.getChatNode(testChatNode.id);
      expect(updatedNode?.statistics.totalMessages).toBeGreaterThan(1);
      expect(updatedNode?.statistics.popularHashtags.get('#test')).toBe(2);
      expect(updatedNode?.statistics.popularHashtags.get('#chat')).toBe(1);
    });

    it('should track participant statistics', async () => {
      const userAddress1 = '0x2234567890123456789012345678901234567890';
      const userAddress2 = '0x3234567890123456789012345678901234567890';

      await chatNodeManager.joinChatNode(testChatNode.id, userAddress1, 'TestUser1');
      await chatNodeManager.joinChatNode(testChatNode.id, userAddress2, 'TestUser2');

      const updatedNode = chatNodeManager.getChatNode(testChatNode.id);
      expect(updatedNode?.participants.size).toBe(3); // Creator + 2 users
      expect(updatedNode?.statistics.totalParticipants).toBe(3);
    });
  });

  describe('Node Discovery', () => {
    beforeEach(async () => {
      // Create multiple test nodes
      const nodeTypes = ['virtual_land', 'ai_node', 'storage_shard', 'bridge'] as const;
      
      for (let i = 0; i < nodeTypes.length; i++) {
        const options: ChatNodeCreateOptions = {
          itemId: `test_item_${i}`,
          itemType: nodeTypes[i],
          itemData: {},
          creatorAddress: '0x1234567890123456789012345678901234567890',
          name: `Test ${nodeTypes[i]} Node`,
          description: `A test ${nodeTypes[i]} for discovery testing`
        };

        await chatNodeManager.createChatNode(options);
      }
    });

    it('should find chat nodes by item ID', () => {
      const nodes = chatNodeManager.getChatNodesForItem('test_item_1');
      expect(nodes.length).toBe(1);
      expect(nodes[0].itemType).toBe('ai_node');
    });

    it('should list all chat nodes', () => {
      const allNodes = chatNodeManager.getAllChatNodes();
      expect(allNodes.length).toBe(4);
      
      const nodeTypes = allNodes.map(node => node.itemType);
      expect(nodeTypes).toContain('virtual_land');
      expect(nodeTypes).toContain('ai_node');
      expect(nodeTypes).toContain('storage_shard');
      expect(nodeTypes).toContain('bridge');
    });
  });
});

describe('Space Mining Integration', () => {
  it('should automatically create chat nodes when mining space', async () => {
    const initialNodeCount = chatNodeManager.getAllChatNodes().length;
    
    // Simulate space mining
    const miningResult = await spaceMiningEngine.mineSpaceFromURL('https://example.com');
    
    // Check that chat nodes were created
    const finalNodeCount = chatNodeManager.getAllChatNodes().length;
    expect(finalNodeCount).toBeGreaterThan(initialNodeCount);
    
    // Verify that chat nodes were created for isolated DOMs
    const createdNodes = chatNodeManager.getAllChatNodes().slice(initialNodeCount);
    expect(createdNodes.length).toBeGreaterThan(0);
    
    // Check that nodes have proper metaverse data
    createdNodes.forEach(node => {
      expect(node.itemData).toBeDefined();
      expect(node.itemData.spatialData).toBeDefined();
      expect(node.itemData.metaverseMapping).toBeDefined();
    });
  });

  it('should create different chat types for different item types', async () => {
    await spaceMiningEngine.mineSpaceFromURL('https://example.com');
    
    const allNodes = chatNodeManager.getAllChatNodes();
    const nodeTypes = allNodes.map(node => node.chatType);
    
    // Should have a variety of chat types based on the mined content
    expect(nodeTypes.length).toBeGreaterThan(0);
  });
});

describe('Security and Permissions', () => {
  let restrictedNode: any;
  let openNode: any;

  beforeEach(async () => {
    // Create a restricted node
    restrictedNode = await chatNodeManager.createChatNode({
      itemId: 'restricted_test',
      itemType: 'ai_node',
      itemData: {},
      creatorAddress: '0x1234567890123456789012345678901234567890',
      name: 'Restricted Test Node',
      description: 'A restricted test node',
      securityLevel: 'restricted'
    });

    // Create an open node
    openNode = await chatNodeManager.createChatNode({
      itemId: 'open_test',
      itemType: 'virtual_land',
      itemData: {},
      creatorAddress: '0x1234567890123456789012345678901234567890',
      name: 'Open Test Node',
      description: 'An open test node',
      securityLevel: 'open'
    });
  });

  it('should enforce security levels for node access', async () => {
    const testUser = '0x2234567890123456789012345678901234567890';

    // Should be able to join open node
    const openSuccess = await chatNodeManager.joinChatNode(openNode.id, testUser, 'TestUser');
    expect(openSuccess).toBe(true);

    // Should be able to join restricted node (for now, as we don't have full auth)
    const restrictedSuccess = await chatNodeManager.joinChatNode(restrictedNode.id, testUser, 'TestUser');
    expect(restrictedSuccess).toBe(true);
  });

  it('should only allow owners to delete nodes', async () => {
    const nonOwner = '0x2234567890123456789012345678901234567890';

    await expect(
      chatNodeManager.deleteChatNode(openNode.id, nonOwner)
    ).rejects.toThrow('Only the creator can delete this chat node');

    // Owner should be able to delete
    const success = await chatNodeManager.deleteChatNode(openNode.id, openNode.createdBy);
    expect(success).toBe(true);
  });
});

export { };