/**
 * Chat Node API - RESTful endpoints for chat node management
 * Handles creation, joining, messaging, and management of chat nodes
 */

import { Request, Response } from 'express';
import { chatNodeManager, ChatNodeCreateOptions, MetaverseItemType, ChatType, SecurityLevel } from '../core/ChatNodeManager';

export class ChatNodeAPI {

  /**
   * Create a new chat node for a metaverse item
   * POST /api/chat/nodes
   */
  async createChatNode(req: Request, res: Response): Promise<void> {
    try {
      const {
        itemId,
        itemType,
        itemData,
        creatorAddress,
        name,
        description,
        chatType,
        securityLevel,
        settings,
        governance
      } = req.body;

      if (!itemId || !itemType || !creatorAddress || !name) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'itemId, itemType, creatorAddress, and name are required'
        });
        return;
      }

      const options: ChatNodeCreateOptions = {
        itemId,
        itemType: itemType as MetaverseItemType,
        itemData: itemData || {},
        creatorAddress,
        name,
        description,
        chatType: chatType as ChatType,
        securityLevel: securityLevel as SecurityLevel,
        settings,
        governance
      };

      const chatNode = await chatNodeManager.createChatNode(options);

      res.json({
        success: true,
        data: {
          nodeId: chatNode.id,
          itemId: chatNode.itemId,
          itemType: chatNode.itemType,
          name: chatNode.name,
          chatType: chatNode.chatType,
          securityLevel: chatNode.securityLevel,
          createdAt: chatNode.createdAt,
          participantCount: chatNode.participants.size
        }
      });

    } catch (error) {
      console.error('Error creating chat node:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Join a chat node
   * POST /api/chat/nodes/:nodeId/join
   */
  async joinChatNode(req: Request, res: Response): Promise<void> {
    try {
      const { nodeId } = req.params;
      const { userAddress, userName } = req.body;

      if (!userAddress || !userName) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'userAddress and userName are required'
        });
        return;
      }

      const success = await chatNodeManager.joinChatNode(nodeId, userAddress, userName);

      if (success) {
        const chatNode = chatNodeManager.getChatNode(nodeId);
        res.json({
          success: true,
          message: 'Successfully joined chat node',
          data: {
            nodeId,
            participantCount: chatNode?.participants.size || 0,
            activeParticipants: chatNode?.statistics.activeParticipants || 0
          }
        });
      } else {
        res.status(400).json({
          error: 'Failed to join chat node',
          message: 'Unable to join the chat node'
        });
      }

    } catch (error) {
      console.error('Error joining chat node:', error);
      res.status(error instanceof Error && error.message.includes('Access denied') ? 403 : 500).json({
        error: error instanceof Error && error.message.includes('Access denied') ? 'Access denied' : 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Send a message to a chat node
   * POST /api/chat/nodes/:nodeId/messages
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { nodeId } = req.params;
      const { senderAddress, content, messageType, attachments, replyTo } = req.body;

      if (!senderAddress || !content) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'senderAddress and content are required'
        });
        return;
      }

      const message = await chatNodeManager.sendMessage(
        nodeId,
        senderAddress,
        content,
        messageType || 'text',
        attachments,
        replyTo
      );

      res.json({
        success: true,
        data: {
          messageId: message.id,
          timestamp: message.timestamp,
          content: message.content,
          messageType: message.messageType
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      res.status(error instanceof Error && error.message.includes('permission') ? 403 : 500).json({
        error: error instanceof Error && error.message.includes('permission') ? 'Permission denied' : 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get chat node details
   * GET /api/chat/nodes/:nodeId
   */
  async getChatNode(req: Request, res: Response): Promise<void> {
    try {
      const { nodeId } = req.params;
      const { userAddress } = req.query;

      const chatNode = chatNodeManager.getChatNode(nodeId);
      if (!chatNode) {
        res.status(404).json({
          error: 'Chat node not found',
          message: `Chat node with ID ${nodeId} does not exist`
        });
        return;
      }

      // Check if user is a participant or if it's a public node
      const isParticipant = userAddress && chatNode.participants.has(userAddress as string);
      const isPublic = chatNode.securityLevel === 'open';

      if (!isParticipant && !isPublic) {
        res.status(403).json({
          error: 'Access denied',
          message: 'You do not have access to this chat node'
        });
        return;
      }

      // Return different levels of detail based on access
      const responseData = {
        id: chatNode.id,
        itemId: chatNode.itemId,
        itemType: chatNode.itemType,
        name: chatNode.name,
        description: chatNode.description,
        chatType: chatNode.chatType,
        securityLevel: chatNode.securityLevel,
        createdAt: chatNode.createdAt,
        participantCount: chatNode.participants.size,
        statistics: chatNode.statistics,
        ...(isParticipant && {
          participants: Array.from(chatNode.participants.values()).map(p => ({
            address: p.address,
            name: p.name,
            role: p.role,
            joinedAt: p.joinedAt,
            reputation: p.reputation
          })),
          settings: chatNode.settings,
          governance: chatNode.governance
        })
      };

      res.json({
        success: true,
        data: responseData
      });

    } catch (error) {
      console.error('Error getting chat node:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get messages from a chat node
   * GET /api/chat/nodes/:nodeId/messages
   */
  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { nodeId } = req.params;
      const { userAddress, limit = 50, offset = 0 } = req.query;

      const chatNode = chatNodeManager.getChatNode(nodeId);
      if (!chatNode) {
        res.status(404).json({
          error: 'Chat node not found',
          message: `Chat node with ID ${nodeId} does not exist`
        });
        return;
      }

      // Check access permissions
      const isParticipant = userAddress && chatNode.participants.has(userAddress as string);
      const isPublic = chatNode.securityLevel === 'open';

      if (!isParticipant && !isPublic) {
        res.status(403).json({
          error: 'Access denied',
          message: 'You do not have access to this chat node'
        });
        return;
      }

      const limitNum = Math.min(parseInt(limit as string) || 50, 100);
      const offsetNum = parseInt(offset as string) || 0;

      const messages = chatNode.messageHistory
        .slice(-limitNum - offsetNum)
        .slice(-limitNum)
        .map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          senderName: msg.senderName,
          content: msg.content,
          messageType: msg.messageType,
          timestamp: msg.timestamp,
          replyTo: msg.replyTo,
          reactions: msg.reactions,
          attachments: msg.attachments?.map(att => ({
            id: att.id,
            fileName: att.fileName,
            fileType: att.fileType,
            fileSize: att.fileSize
          }))
        }));

      res.json({
        success: true,
        data: {
          messages,
          total: chatNode.messageHistory.length,
          hasMore: chatNode.messageHistory.length > limitNum + offsetNum
        }
      });

    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get chat nodes for a metaverse item
   * GET /api/chat/items/:itemId/nodes
   */
  async getChatNodesForItem(req: Request, res: Response): Promise<void> {
    try {
      const { itemId } = req.params;
      const { userAddress } = req.query;

      const chatNodes = chatNodeManager.getChatNodesForItem(itemId);

      // Filter nodes based on access permissions
      const accessibleNodes = chatNodes.filter(node => {
        const isParticipant = userAddress && node.participants.has(userAddress as string);
        const isPublic = node.securityLevel === 'open';
        return isParticipant || isPublic;
      });

      const nodeData = accessibleNodes.map(node => ({
        id: node.id,
        name: node.name,
        description: node.description,
        chatType: node.chatType,
        securityLevel: node.securityLevel,
        participantCount: node.participants.size,
        activeParticipants: node.statistics.activeParticipants,
        lastActivity: node.statistics.lastActivityTimestamp,
        messageCount: node.statistics.totalMessages
      }));

      res.json({
        success: true,
        data: {
          itemId,
          nodes: nodeData,
          totalNodes: nodeData.length
        }
      });

    } catch (error) {
      console.error('Error getting chat nodes for item:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all accessible chat nodes for a user
   * GET /api/chat/nodes
   */
  async getAllChatNodes(req: Request, res: Response): Promise<void> {
    try {
      const { userAddress, itemType, chatType, limit = 20, offset = 0 } = req.query;

      let allNodes = chatNodeManager.getAllChatNodes();

      // Filter by item type if specified
      if (itemType) {
        allNodes = allNodes.filter(node => node.itemType === itemType);
      }

      // Filter by chat type if specified
      if (chatType) {
        allNodes = allNodes.filter(node => node.chatType === chatType);
      }

      // Filter by access permissions
      const accessibleNodes = allNodes.filter(node => {
        const isParticipant = userAddress && node.participants.has(userAddress as string);
        const isPublic = node.securityLevel === 'open';
        return isParticipant || isPublic;
      });

      // Apply pagination
      const limitNum = Math.min(parseInt(limit as string) || 20, 50);
      const offsetNum = parseInt(offset as string) || 0;
      const paginatedNodes = accessibleNodes.slice(offsetNum, offsetNum + limitNum);

      const nodeData = paginatedNodes.map(node => ({
        id: node.id,
        itemId: node.itemId,
        itemType: node.itemType,
        name: node.name,
        description: node.description,
        chatType: node.chatType,
        securityLevel: node.securityLevel,
        participantCount: node.participants.size,
        activeParticipants: node.statistics.activeParticipants,
        lastActivity: node.statistics.lastActivityTimestamp,
        messageCount: node.statistics.totalMessages,
        isParticipant: userAddress ? node.participants.has(userAddress as string) : false
      }));

      res.json({
        success: true,
        data: {
          nodes: nodeData,
          total: accessibleNodes.length,
          hasMore: accessibleNodes.length > offsetNum + limitNum
        }
      });

    } catch (error) {
      console.error('Error getting all chat nodes:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Set typing indicator
   * POST /api/chat/nodes/:nodeId/typing
   */
  async setTypingIndicator(req: Request, res: Response): Promise<void> {
    try {
      const { nodeId } = req.params;
      const { userAddress } = req.body;

      if (!userAddress) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'userAddress is required'
        });
        return;
      }

      const chatNode = chatNodeManager.getChatNode(nodeId);
      if (!chatNode) {
        res.status(404).json({
          error: 'Chat node not found',
          message: `Chat node with ID ${nodeId} does not exist`
        });
        return;
      }

      if (!chatNode.participants.has(userAddress)) {
        res.status(403).json({
          error: 'Access denied',
          message: 'You are not a participant in this chat node'
        });
        return;
      }

      chatNodeManager.setTypingIndicator(nodeId, userAddress);

      res.json({
        success: true,
        message: 'Typing indicator set'
      });

    } catch (error) {
      console.error('Error setting typing indicator:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Clear typing indicator
   * DELETE /api/chat/nodes/:nodeId/typing
   */
  async clearTypingIndicator(req: Request, res: Response): Promise<void> {
    try {
      const { nodeId } = req.params;
      const { userAddress } = req.body;

      if (!userAddress) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'userAddress is required'
        });
        return;
      }

      chatNodeManager.clearTypingIndicator(nodeId, userAddress);

      res.json({
        success: true,
        message: 'Typing indicator cleared'
      });

    } catch (error) {
      console.error('Error clearing typing indicator:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete a chat node (owner only)
   * DELETE /api/chat/nodes/:nodeId
   */
  async deleteChatNode(req: Request, res: Response): Promise<void> {
    try {
      const { nodeId } = req.params;
      const { userAddress } = req.body;

      if (!userAddress) {
        res.status(400).json({
          error: 'Missing required fields',
          message: 'userAddress is required'
        });
        return;
      }

      const success = await chatNodeManager.deleteChatNode(nodeId, userAddress);

      if (success) {
        res.json({
          success: true,
          message: 'Chat node deleted successfully'
        });
      } else {
        res.status(404).json({
          error: 'Chat node not found',
          message: `Chat node with ID ${nodeId} does not exist`
        });
      }

    } catch (error) {
      console.error('Error deleting chat node:', error);
      res.status(error instanceof Error && error.message.includes('Only the creator') ? 403 : 500).json({
        error: error instanceof Error && error.message.includes('Only the creator') ? 'Permission denied' : 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get chat node statistics
   * GET /api/chat/nodes/:nodeId/statistics
   */
  async getChatNodeStatistics(req: Request, res: Response): Promise<void> {
    try {
      const { nodeId } = req.params;

      const chatNode = chatNodeManager.getChatNode(nodeId);
      if (!chatNode) {
        res.status(404).json({
          error: 'Chat node not found',
          message: `Chat node with ID ${nodeId} does not exist`
        });
        return;
      }

      res.json({
        success: true,
        data: {
          nodeId,
          statistics: {
            ...chatNode.statistics,
            popularHashtags: Array.from(chatNode.statistics.popularHashtags.entries())
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([tag, count]) => ({ tag, count }))
          }
        }
      });

    } catch (error) {
      console.error('Error getting chat node statistics:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Export singleton instance
export const chatNodeAPI = new ChatNodeAPI();