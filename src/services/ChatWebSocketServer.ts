/**
 * Chat WebSocket Server - Real-time communication for metaverse chat nodes
 * Handles Socket.IO connections, message broadcasting, and presence tracking
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { chatNodeManager } from '../core/ChatNodeManager';

export interface SocketUser {
  id: string;
  address: string;
  name: string;
  joinedNodes: Set<string>;
  lastActivity: number;
}

export class ChatWebSocketServer {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private nodeConnections: Map<string, Set<string>> = new Map(); // nodeId -> socketIds
  private userSockets: Map<string, string> = new Map(); // userAddress -> socketId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    });

    this.setupEventHandlers();
    this.setupChatNodeManagerEvents();
    console.log('🔌 Chat WebSocket server initialized');
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`🔗 Client connected: ${socket.id}`);

      // User authentication
      socket.on('authenticate', async (data: { address: string; name: string; signature?: string }) => {
        try {
          // TODO: Verify signature in production
          const user: SocketUser = {
            id: socket.id,
            address: data.address,
            name: data.name,
            joinedNodes: new Set(),
            lastActivity: Date.now()
          };

          this.connectedUsers.set(socket.id, user);
          this.userSockets.set(data.address, socket.id);

          socket.emit('authenticated', { success: true, user: { address: user.address, name: user.name } });
          console.log(`✅ User authenticated: ${data.name} (${data.address})`);

        } catch (error) {
          socket.emit('authenticated', { success: false, error: 'Authentication failed' });
          console.error('❌ Authentication failed:', error);
        }
      });

      // Join chat node
      socket.on('join_node', async (data: { nodeId: string }) => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (!user) {
            socket.emit('error', { message: 'User not authenticated' });
            return;
          }

          // Join the chat node
          await chatNodeManager.joinChatNode(data.nodeId, user.address, user.name);

          // Add to socket room
          socket.join(data.nodeId);
          user.joinedNodes.add(data.nodeId);

          // Track connection
          if (!this.nodeConnections.has(data.nodeId)) {
            this.nodeConnections.set(data.nodeId, new Set());
          }
          this.nodeConnections.get(data.nodeId)!.add(socket.id);

          // Get chat node info
          const chatNode = chatNodeManager.getChatNode(data.nodeId);
          if (chatNode) {
            socket.emit('node_joined', {
              nodeId: data.nodeId,
              nodeName: chatNode.name,
              participantCount: chatNode.participants.size,
              activeParticipants: chatNode.statistics.activeParticipants
            });

            // Notify other users in the node
            socket.to(data.nodeId).emit('user_joined', {
              nodeId: data.nodeId,
              user: { address: user.address, name: user.name }
            });

            // Send recent messages
            const recentMessages = chatNode.messageHistory.slice(-20).map(msg => ({
              id: msg.id,
              senderId: msg.senderId,
              senderName: msg.senderName,
              content: msg.content,
              messageType: msg.messageType,
              timestamp: msg.timestamp,
              replyTo: msg.replyTo,
              reactions: msg.reactions
            }));

            socket.emit('recent_messages', { nodeId: data.nodeId, messages: recentMessages });
          }

          console.log(`👥 User ${user.name} joined node: ${data.nodeId}`);

        } catch (error) {
          socket.emit('error', { message: error instanceof Error ? error.message : 'Failed to join node' });
          console.error('❌ Failed to join node:', error);
        }
      });

      // Leave chat node
      socket.on('leave_node', (data: { nodeId: string }) => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (!user) return;

          socket.leave(data.nodeId);
          user.joinedNodes.delete(data.nodeId);

          // Remove from tracking
          this.nodeConnections.get(data.nodeId)?.delete(socket.id);

          // Notify other users
          socket.to(data.nodeId).emit('user_left', {
            nodeId: data.nodeId,
            user: { address: user.address, name: user.name }
          });

          socket.emit('node_left', { nodeId: data.nodeId });
          console.log(`👋 User ${user.name} left node: ${data.nodeId}`);

        } catch (error) {
          console.error('❌ Failed to leave node:', error);
        }
      });

      // Send message
      socket.on('send_message', async (data: { 
        nodeId: string; 
        content: string; 
        messageType?: string; 
        replyTo?: string 
      }) => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (!user) {
            socket.emit('error', { message: 'User not authenticated' });
            return;
          }

          if (!user.joinedNodes.has(data.nodeId)) {
            socket.emit('error', { message: 'User not joined to this node' });
            return;
          }

          // Send message through chat node manager
          const message = await chatNodeManager.sendMessage(
            data.nodeId,
            user.address,
            data.content,
            data.messageType as any,
            undefined,
            data.replyTo
          );

          // Broadcast message to all users in the node
          const messageData = {
            id: message.id,
            nodeId: message.nodeId,
            senderId: message.senderId,
            senderName: message.senderName,
            content: message.content,
            messageType: message.messageType,
            timestamp: message.timestamp,
            replyTo: message.replyTo,
            reactions: message.reactions
          };

          this.io.to(data.nodeId).emit('new_message', messageData);

          // Update user activity
          user.lastActivity = Date.now();

          console.log(`💬 Message sent in ${data.nodeId} by ${user.name}: ${data.content.substring(0, 50)}...`);

        } catch (error) {
          socket.emit('error', { message: error instanceof Error ? error.message : 'Failed to send message' });
          console.error('❌ Failed to send message:', error);
        }
      });

      // Typing indicator
      socket.on('typing_start', (data: { nodeId: string }) => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (!user || !user.joinedNodes.has(data.nodeId)) return;

          chatNodeManager.setTypingIndicator(data.nodeId, user.address);
          socket.to(data.nodeId).emit('user_typing', {
            nodeId: data.nodeId,
            user: { address: user.address, name: user.name }
          });

        } catch (error) {
          console.error('❌ Failed to set typing indicator:', error);
        }
      });

      socket.on('typing_stop', (data: { nodeId: string }) => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (!user || !user.joinedNodes.has(data.nodeId)) return;

          chatNodeManager.clearTypingIndicator(data.nodeId, user.address);
          socket.to(data.nodeId).emit('user_stopped_typing', {
            nodeId: data.nodeId,
            user: { address: user.address, name: user.name }
          });

        } catch (error) {
          console.error('❌ Failed to clear typing indicator:', error);
        }
      });

      // Get node participants
      socket.on('get_participants', (data: { nodeId: string }) => {
        try {
          const chatNode = chatNodeManager.getChatNode(data.nodeId);
          if (!chatNode) {
            socket.emit('error', { message: 'Chat node not found' });
            return;
          }

          const participants = Array.from(chatNode.participants.values()).map(p => ({
            address: p.address,
            name: p.name,
            role: p.role,
            reputation: p.reputation,
            lastActive: p.lastActive,
            isOnline: this.userSockets.has(p.address)
          }));

          socket.emit('node_participants', { nodeId: data.nodeId, participants });

        } catch (error) {
          socket.emit('error', { message: 'Failed to get participants' });
          console.error('❌ Failed to get participants:', error);
        }
      });

      // Message reactions
      socket.on('add_reaction', async (data: { nodeId: string; messageId: string; emoji: string }) => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (!user || !user.joinedNodes.has(data.nodeId)) return;

          const chatNode = chatNodeManager.getChatNode(data.nodeId);
          if (!chatNode) return;

          const message = chatNode.messageHistory.find(m => m.id === data.messageId);
          if (!message) return;

          // Add or update reaction
          if (!message.reactions) message.reactions = [];
          
          const existingReaction = message.reactions.find(r => r.userAddress === user.address && r.emoji === data.emoji);
          if (!existingReaction) {
            message.reactions.push({
              emoji: data.emoji,
              userAddress: user.address,
              timestamp: Date.now()
            });

            // Broadcast reaction
            this.io.to(data.nodeId).emit('reaction_added', {
              nodeId: data.nodeId,
              messageId: data.messageId,
              emoji: data.emoji,
              user: { address: user.address, name: user.name }
            });
          }

        } catch (error) {
          console.error('❌ Failed to add reaction:', error);
        }
      });

      // Disconnect handler
      socket.on('disconnect', () => {
        try {
          const user = this.connectedUsers.get(socket.id);
          if (user) {
            // Remove from all joined nodes
            user.joinedNodes.forEach(nodeId => {
              socket.to(nodeId).emit('user_left', {
                nodeId,
                user: { address: user.address, name: user.name }
              });
              this.nodeConnections.get(nodeId)?.delete(socket.id);
            });

            // Clean up
            this.connectedUsers.delete(socket.id);
            this.userSockets.delete(user.address);

            console.log(`🔌 User disconnected: ${user.name} (${socket.id})`);
          } else {
            console.log(`🔌 Client disconnected: ${socket.id}`);
          }

        } catch (error) {
          console.error('❌ Error handling disconnect:', error);
        }
      });
    });
  }

  /**
   * Setup chat node manager event listeners
   */
  private setupChatNodeManagerEvents(): void {
    // Chat node created
    chatNodeManager.on('chatNodeCreated', (chatNode) => {
      this.io.emit('chat_node_created', {
        id: chatNode.id,
        itemId: chatNode.itemId,
        itemType: chatNode.itemType,
        name: chatNode.name,
        chatType: chatNode.chatType,
        securityLevel: chatNode.securityLevel
      });
    });

    // Chat node deleted
    chatNodeManager.on('chatNodeDeleted', (nodeId) => {
      this.io.to(nodeId).emit('chat_node_deleted', { nodeId });
      // Remove all connections for this node
      this.nodeConnections.delete(nodeId);
    });

    // User joined
    chatNodeManager.on('userJoined', ({ nodeId, userAddress, userName }) => {
      this.io.to(nodeId).emit('user_joined', {
        nodeId,
        user: { address: userAddress, name: userName }
      });
    });

    // Message received (from API or other sources)
    chatNodeManager.on('messageReceived', ({ nodeId, message }) => {
      const messageData = {
        id: message.id,
        nodeId: message.nodeId,
        senderId: message.senderId,
        senderName: message.senderName,
        content: message.content,
        messageType: message.messageType,
        timestamp: message.timestamp,
        replyTo: message.replyTo,
        reactions: message.reactions
      };

      this.io.to(nodeId).emit('new_message', messageData);
    });

    // Typing updates
    chatNodeManager.on('typingUpdate', ({ nodeId, indicators }) => {
      this.io.to(nodeId).emit('typing_update', {
        nodeId,
        typingUsers: indicators.map(i => ({ userId: i.userId }))
      });
    });

    // Statistics updates
    chatNodeManager.on('statisticsUpdate', ({ nodeId, statistics }) => {
      this.io.to(nodeId).emit('statistics_update', { nodeId, statistics });
    });
  }

  /**
   * Get connected user count
   */
  getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get active node count
   */
  getActiveNodeCount(): number {
    return this.nodeConnections.size;
  }

  /**
   * Get server statistics
   */
  getServerStatistics() {
    return {
      connectedUsers: this.connectedUsers.size,
      activeNodes: this.nodeConnections.size,
      totalConnections: Array.from(this.nodeConnections.values()).reduce((sum, set) => sum + set.size, 0)
    };
  }

  /**
   * Broadcast system message to all connected users
   */
  broadcastSystemMessage(message: string): void {
    this.io.emit('system_message', { message, timestamp: Date.now() });
  }

  /**
   * Send message to specific user
   */
  sendToUser(userAddress: string, event: string, data: any): void {
    const socketId = this.userSockets.get(userAddress);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  /**
   * Broadcast to specific node
   */
  broadcastToNode(nodeId: string, event: string, data: any): void {
    this.io.to(nodeId).emit(event, data);
  }
}

// Export singleton instance
let chatWebSocketServer: ChatWebSocketServer | null = null;

export function initializeChatWebSocketServer(httpServer: HTTPServer): ChatWebSocketServer {
  if (!chatWebSocketServer) {
    chatWebSocketServer = new ChatWebSocketServer(httpServer);
  }
  return chatWebSocketServer;
}

export function getChatWebSocketServer(): ChatWebSocketServer | null {
  return chatWebSocketServer;
}