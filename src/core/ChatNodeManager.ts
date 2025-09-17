/**
 * Chat Node System - Core chat functionality for metaverse items
 * Each metaverse item gets its own dedicated chat node with security and governance features
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export type MetaverseItemType = 'virtual_land' | 'ai_node' | 'storage_shard' | 'bridge' | 'reality_anchor';
export type ChatType = 'public' | 'private' | 'governance' | 'technical' | 'bridge_coordination';
export type SecurityLevel = 'open' | 'restricted' | 'encrypted' | 'token_gated';
export type MessageType = 'text' | 'system' | 'governance' | 'file' | 'voice' | 'reaction';

export interface ChatMessage {
  id: string;
  nodeId: string;
  senderId: string;
  senderAddress: string;
  senderName: string;
  content: string;
  messageType: MessageType;
  timestamp: number;
  encrypted: boolean;
  bridgeOrigin?: string;
  attachments?: ChatAttachment[];
  reactions?: ChatReaction[];
  replyTo?: string;
  editHistory?: ChatEdit[];
}

export interface ChatAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  ipfsHash: string;
  uploadTimestamp: number;
}

export interface ChatReaction {
  emoji: string;
  userAddress: string;
  timestamp: number;
}

export interface ChatEdit {
  previousContent: string;
  editTimestamp: number;
  reason?: string;
}

export interface ChatParticipant {
  address: string;
  name: string;
  role: 'owner' | 'moderator' | 'member' | 'guest';
  joinedAt: number;
  lastActive: number;
  reputation: number;
  permissions: ChatPermission[];
}

export interface ChatPermission {
  action: 'send_message' | 'delete_message' | 'moderate' | 'invite' | 'vote' | 'upload_file';
  granted: boolean;
  grantedBy: string;
  grantedAt: number;
}

export interface ChatNode {
  id: string;
  itemId: string;
  itemType: MetaverseItemType;
  itemData: any; // Metaverse item specific data
  chatType: ChatType;
  securityLevel: SecurityLevel;
  name: string;
  description: string;
  createdAt: number;
  createdBy: string;
  participants: Map<string, ChatParticipant>;
  moderators: string[];
  messageHistory: ChatMessage[];
  bridgeConnections: string[];
  settings: ChatNodeSettings;
  governance: GovernanceConfig;
  security: SecurityConfig;
  statistics: ChatStatistics;
}

export interface ChatNodeSettings {
  maxParticipants: number;
  messageRetention: number; // Days to keep messages
  allowFileUploads: boolean;
  maxFileSize: number; // Bytes
  allowVoiceMessages: boolean;
  requireModeration: boolean;
  allowBridgeMessages: boolean;
  rateLimitPerMinute: number;
  autoModeration: AutoModerationConfig;
}

export interface AutoModerationConfig {
  enabled: boolean;
  spamDetection: boolean;
  profanityFilter: boolean;
  linkWhitelist: string[];
  maxMessageLength: number;
  cooldownPeriod: number; // Seconds between messages
}

export interface GovernanceConfig {
  enabled: boolean;
  votingPower: 'equal' | 'token_weighted' | 'reputation_weighted';
  proposalThreshold: number; // Minimum tokens/reputation to create proposal
  votingPeriod: number; // Hours
  executionDelay: number; // Hours after vote passes
  quorumRequired: number; // Percentage of participants needed
}

export interface SecurityConfig {
  encryption: {
    enabled: boolean;
    algorithm: string;
    keyRotationInterval: number; // Hours
  };
  authentication: {
    requireSignature: boolean;
    sessionTimeout: number; // Minutes
    maxLoginAttempts: number;
  };
  access: {
    whitelist: string[];
    blacklist: string[];
    requireInvite: boolean;
    tokenGating: TokenGatingConfig;
  };
}

export interface TokenGatingConfig {
  enabled: boolean;
  requiredToken: string; // Contract address
  minimumBalance: string; // Wei amount
  nftRequirement?: {
    contract: string;
    tokenIds?: number[];
  };
}

export interface ChatStatistics {
  totalMessages: number;
  totalParticipants: number;
  messagesPerDay: number[];
  activeParticipants: number;
  lastActivityTimestamp: number;
  popularHashtags: Map<string, number>;
  averageMessageLength: number;
  filesSharingCount: number;
  governanceProposals: number;
  crossBridgeMessages: number;
}

export interface TypingIndicator {
  userId: string;
  nodeId: string;
  timestamp: number;
}

export interface ChatNodeCreateOptions {
  itemId: string;
  itemType: MetaverseItemType;
  itemData: any;
  creatorAddress: string;
  name: string;
  description?: string;
  chatType?: ChatType;
  securityLevel?: SecurityLevel;
  settings?: Partial<ChatNodeSettings>;
  governance?: Partial<GovernanceConfig>;
}

export class ChatNodeManager extends EventEmitter {
  private chatNodes: Map<string, ChatNode> = new Map();
  private activeConnections: Map<string, Set<string>> = new Map(); // nodeId -> userAddresses
  private typingIndicators: Map<string, TypingIndicator[]> = new Map();
  private messageQueue: Map<string, ChatMessage[]> = new Map(); // For offline delivery
  private encryptionKeys: Map<string, string> = new Map(); // nodeId -> encryption key

  constructor() {
    super();
    this.setupCleanupTasks();
  }

  /**
   * Create a new chat node for a metaverse item
   */
  async createChatNode(options: ChatNodeCreateOptions): Promise<ChatNode> {
    const nodeId = `chat_${options.itemType}_${uuidv4()}`;
    
    const defaultSettings: ChatNodeSettings = {
      maxParticipants: this.getDefaultMaxParticipants(options.itemType),
      messageRetention: 365, // 1 year
      allowFileUploads: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowVoiceMessages: true,
      requireModeration: options.securityLevel === 'restricted',
      allowBridgeMessages: options.itemType === 'bridge',
      rateLimitPerMinute: 30,
      autoModeration: {
        enabled: true,
        spamDetection: true,
        profanityFilter: true,
        linkWhitelist: [],
        maxMessageLength: 2000,
        cooldownPeriod: 1
      }
    };

    const defaultGovernance: GovernanceConfig = {
      enabled: options.chatType === 'governance',
      votingPower: 'token_weighted',
      proposalThreshold: 1000, // DSH tokens
      votingPeriod: 72, // 3 days
      executionDelay: 24, // 1 day
      quorumRequired: 20 // 20% participation
    };

    const defaultSecurity: SecurityConfig = {
      encryption: {
        enabled: options.securityLevel === 'encrypted',
        algorithm: 'AES-256-GCM',
        keyRotationInterval: 168 // 1 week
      },
      authentication: {
        requireSignature: true,
        sessionTimeout: 720, // 12 hours
        maxLoginAttempts: 5
      },
      access: {
        whitelist: [],
        blacklist: [],
        requireInvite: options.securityLevel === 'restricted',
        tokenGating: {
          enabled: options.securityLevel === 'token_gated',
          requiredToken: process.env.DSH_TOKEN_ADDRESS || '',
          minimumBalance: '1000000000000000000' // 1 DSH
        }
      }
    };

    const chatNode: ChatNode = {
      id: nodeId,
      itemId: options.itemId,
      itemType: options.itemType,
      itemData: options.itemData,
      chatType: options.chatType || 'public',
      securityLevel: options.securityLevel || 'open',
      name: options.name,
      description: options.description || `Chat for ${options.itemType} ${options.itemId}`,
      createdAt: Date.now(),
      createdBy: options.creatorAddress,
      participants: new Map(),
      moderators: [options.creatorAddress],
      messageHistory: [],
      bridgeConnections: [],
      settings: { ...defaultSettings, ...options.settings },
      governance: { ...defaultGovernance, ...options.governance },
      security: { ...defaultSecurity },
      statistics: {
        totalMessages: 0,
        totalParticipants: 0,
        messagesPerDay: new Array(30).fill(0),
        activeParticipants: 0,
        lastActivityTimestamp: Date.now(),
        popularHashtags: new Map(),
        averageMessageLength: 0,
        filesSharingCount: 0,
        governanceProposals: 0,
        crossBridgeMessages: 0
      }
    };

    // Add creator as first participant
    const creatorParticipant: ChatParticipant = {
      address: options.creatorAddress,
      name: 'Creator',
      role: 'owner',
      joinedAt: Date.now(),
      lastActive: Date.now(),
      reputation: 100,
      permissions: [
        { action: 'send_message', granted: true, grantedBy: 'system', grantedAt: Date.now() },
        { action: 'delete_message', granted: true, grantedBy: 'system', grantedAt: Date.now() },
        { action: 'moderate', granted: true, grantedBy: 'system', grantedAt: Date.now() },
        { action: 'invite', granted: true, grantedBy: 'system', grantedAt: Date.now() },
        { action: 'vote', granted: true, grantedBy: 'system', grantedAt: Date.now() },
        { action: 'upload_file', granted: true, grantedBy: 'system', grantedAt: Date.now() }
      ]
    };

    chatNode.participants.set(options.creatorAddress, creatorParticipant);
    chatNode.statistics.totalParticipants = 1;

    // Generate encryption key if needed
    if (chatNode.security.encryption.enabled) {
      this.encryptionKeys.set(nodeId, this.generateEncryptionKey());
    }

    // Store the chat node
    this.chatNodes.set(nodeId, chatNode);
    this.activeConnections.set(nodeId, new Set());
    this.typingIndicators.set(nodeId, []);
    this.messageQueue.set(nodeId, []);

    // Send system message
    const welcomeMessage: ChatMessage = {
      id: uuidv4(),
      nodeId: nodeId,
      senderId: 'system',
      senderAddress: 'system',
      senderName: 'System',
      content: `Welcome to the ${chatNode.name} chat! This chat node is associated with ${chatNode.itemType} "${chatNode.itemId}".`,
      messageType: 'system',
      timestamp: Date.now(),
      encrypted: false
    };

    chatNode.messageHistory.push(welcomeMessage);
    chatNode.statistics.totalMessages = 1;

    this.emit('chatNodeCreated', chatNode);
    console.log(`✅ Created chat node: ${nodeId} for ${options.itemType} ${options.itemId}`);

    return chatNode;
  }

  /**
   * Get default max participants based on item type
   */
  private getDefaultMaxParticipants(itemType: MetaverseItemType): number {
    switch (itemType) {
      case 'virtual_land': return 100;
      case 'ai_node': return 50;
      case 'storage_shard': return 25;
      case 'bridge': return 200;
      case 'reality_anchor': return 150;
      default: return 50;
    }
  }

  /**
   * Join a chat node
   */
  async joinChatNode(nodeId: string, userAddress: string, userName: string): Promise<boolean> {
    const node = this.chatNodes.get(nodeId);
    if (!node) {
      throw new Error(`Chat node ${nodeId} not found`);
    }

    // Check access permissions
    if (!await this.checkAccessPermissions(node, userAddress)) {
      throw new Error('Access denied to chat node');
    }

    // Check participant limit
    if (node.participants.size >= node.settings.maxParticipants) {
      throw new Error('Chat node is at maximum capacity');
    }

    // Add participant if not already present
    if (!node.participants.has(userAddress)) {
      const participant: ChatParticipant = {
        address: userAddress,
        name: userName,
        role: 'member',
        joinedAt: Date.now(),
        lastActive: Date.now(),
        reputation: 50, // Starting reputation
        permissions: [
          { action: 'send_message', granted: true, grantedBy: 'system', grantedAt: Date.now() },
          { action: 'vote', granted: true, grantedBy: 'system', grantedAt: Date.now() },
          { action: 'upload_file', granted: true, grantedBy: 'system', grantedAt: Date.now() }
        ]
      };

      node.participants.set(userAddress, participant);
      node.statistics.totalParticipants = node.participants.size;

      // Send join notification
      const joinMessage: ChatMessage = {
        id: uuidv4(),
        nodeId: nodeId,
        senderId: 'system',
        senderAddress: 'system',
        senderName: 'System',
        content: `${userName} joined the chat`,
        messageType: 'system',
        timestamp: Date.now(),
        encrypted: false
      };

      node.messageHistory.push(joinMessage);
      node.statistics.totalMessages++;
      
      this.emit('userJoined', { nodeId, userAddress, userName });
    }

    // Add to active connections
    this.activeConnections.get(nodeId)?.add(userAddress);
    node.statistics.activeParticipants = this.activeConnections.get(nodeId)?.size || 0;

    return true;
  }

  /**
   * Send a message to a chat node
   */
  async sendMessage(
    nodeId: string,
    senderAddress: string,
    content: string,
    messageType: MessageType = 'text',
    attachments?: ChatAttachment[],
    replyTo?: string
  ): Promise<ChatMessage> {
    const node = this.chatNodes.get(nodeId);
    if (!node) {
      throw new Error(`Chat node ${nodeId} not found`);
    }

    const participant = node.participants.get(senderAddress);
    if (!participant) {
      throw new Error('User is not a participant in this chat node');
    }

    // Check send message permission
    const canSend = participant.permissions.some(p => p.action === 'send_message' && p.granted);
    if (!canSend) {
      throw new Error('User does not have permission to send messages');
    }

    // Rate limiting check
    if (!this.checkRateLimit(nodeId, senderAddress)) {
      throw new Error('Rate limit exceeded');
    }

    // Auto-moderation checks
    if (node.settings.autoModeration.enabled) {
      if (!this.passesAutoModeration(content, node.settings.autoModeration)) {
        throw new Error('Message blocked by auto-moderation');
      }
    }

    // Create message
    const messageId = uuidv4();
    const message: ChatMessage = {
      id: messageId,
      nodeId: nodeId,
      senderId: senderAddress,
      senderAddress: senderAddress,
      senderName: participant.name,
      content: content,
      messageType: messageType,
      timestamp: Date.now(),
      encrypted: node.security.encryption.enabled,
      attachments: attachments || [],
      reactions: [],
      replyTo: replyTo
    };

    // Encrypt message if required
    if (node.security.encryption.enabled) {
      message.content = await this.encryptMessage(nodeId, content);
    }

    // Add to message history
    node.messageHistory.push(message);
    node.statistics.totalMessages++;
    node.statistics.lastActivityTimestamp = Date.now();

    // Update statistics
    this.updateMessageStatistics(node, message);

    // Update participant activity
    participant.lastActive = Date.now();

    // Clear typing indicator
    this.clearTypingIndicator(nodeId, senderAddress);

    // Emit message event
    this.emit('messageReceived', { nodeId, message });

    // Queue message for offline participants
    this.queueMessageForOfflineUsers(nodeId, message);

    console.log(`📨 Message sent in ${nodeId} by ${participant.name}: ${content.substring(0, 50)}...`);

    return message;
  }

  /**
   * Get chat node by ID
   */
  getChatNode(nodeId: string): ChatNode | undefined {
    return this.chatNodes.get(nodeId);
  }

  /**
   * Get chat nodes for a metaverse item
   */
  getChatNodesForItem(itemId: string): ChatNode[] {
    return Array.from(this.chatNodes.values()).filter(node => node.itemId === itemId);
  }

  /**
   * Get all chat nodes
   */
  getAllChatNodes(): ChatNode[] {
    return Array.from(this.chatNodes.values());
  }

  /**
   * Delete a chat node
   */
  async deleteChatNode(nodeId: string, userAddress: string): Promise<boolean> {
    const node = this.chatNodes.get(nodeId);
    if (!node) {
      return false;
    }

    // Only owner can delete
    if (node.createdBy !== userAddress) {
      throw new Error('Only the creator can delete this chat node');
    }

    // Send deletion notice
    const deleteMessage: ChatMessage = {
      id: uuidv4(),
      nodeId: nodeId,
      senderId: 'system',
      senderAddress: 'system',
      senderName: 'System',
      content: 'This chat node has been deleted by the owner',
      messageType: 'system',
      timestamp: Date.now(),
      encrypted: false
    };

    this.emit('messageReceived', { nodeId, message: deleteMessage });

    // Clean up
    this.chatNodes.delete(nodeId);
    this.activeConnections.delete(nodeId);
    this.typingIndicators.delete(nodeId);
    this.messageQueue.delete(nodeId);
    this.encryptionKeys.delete(nodeId);

    this.emit('chatNodeDeleted', nodeId);
    console.log(`🗑️ Chat node deleted: ${nodeId}`);

    return true;
  }

  /**
   * Set typing indicator
   */
  setTypingIndicator(nodeId: string, userAddress: string): void {
    const indicators = this.typingIndicators.get(nodeId) || [];
    const existingIndex = indicators.findIndex(i => i.userId === userAddress);
    
    const indicator: TypingIndicator = {
      userId: userAddress,
      nodeId: nodeId,
      timestamp: Date.now()
    };

    if (existingIndex >= 0) {
      indicators[existingIndex] = indicator;
    } else {
      indicators.push(indicator);
    }

    this.typingIndicators.set(nodeId, indicators);
    this.emit('typingUpdate', { nodeId, indicators });
  }

  /**
   * Clear typing indicator
   */
  clearTypingIndicator(nodeId: string, userAddress: string): void {
    const indicators = this.typingIndicators.get(nodeId) || [];
    const filtered = indicators.filter(i => i.userId !== userAddress);
    this.typingIndicators.set(nodeId, filtered);
    this.emit('typingUpdate', { nodeId, indicators: filtered });
  }

  /**
   * Private helper methods
   */

  private async checkAccessPermissions(node: ChatNode, userAddress: string): Promise<boolean> {
    // Check blacklist
    if (node.security.access.blacklist.includes(userAddress)) {
      return false;
    }

    // Check whitelist (if enabled)
    if (node.security.access.whitelist.length > 0 && !node.security.access.whitelist.includes(userAddress)) {
      return false;
    }

    // Check token gating
    if (node.security.access.tokenGating.enabled) {
      // TODO: Implement actual token balance check
      // For now, return true for testing
      return true;
    }

    return true;
  }

  private checkRateLimit(nodeId: string, userAddress: string): boolean {
    // TODO: Implement rate limiting logic
    // For now, return true
    return true;
  }

  private passesAutoModeration(content: string, config: AutoModerationConfig): boolean {
    if (content.length > config.maxMessageLength) {
      return false;
    }

    if (config.spamDetection && this.isSpam(content)) {
      return false;
    }

    if (config.profanityFilter && this.containsProfanity(content)) {
      return false;
    }

    return true;
  }

  private isSpam(content: string): boolean {
    // Simple spam detection
    const repeatedChars = /(.)\1{10,}/g;
    const allCaps = /^[A-Z\s!]+$/;
    return repeatedChars.test(content) || (content.length > 20 && allCaps.test(content));
  }

  private containsProfanity(content: string): boolean {
    // Basic profanity filter - in production, use a proper library
    const profanityWords = ['spam', 'scam']; // Minimal list for testing
    const lowerContent = content.toLowerCase();
    return profanityWords.some(word => lowerContent.includes(word));
  }

  private async encryptMessage(nodeId: string, content: string): Promise<string> {
    // TODO: Implement actual encryption
    // For now, return base64 encoded content
    return Buffer.from(content).toString('base64');
  }

  private generateEncryptionKey(): string {
    // TODO: Generate proper encryption key
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private updateMessageStatistics(node: ChatNode, message: ChatMessage): void {
    // Update messages per day (last 30 days)
    const today = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const dayIndex = today % 30;
    node.statistics.messagesPerDay[dayIndex]++;

    // Update average message length
    const totalLength = node.messageHistory.reduce((sum, msg) => sum + msg.content.length, 0);
    node.statistics.averageMessageLength = Math.round(totalLength / node.statistics.totalMessages);

    // Update hashtags
    const hashtags = message.content.match(/#\w+/g) || [];
    hashtags.forEach(tag => {
      const current = node.statistics.popularHashtags.get(tag) || 0;
      node.statistics.popularHashtags.set(tag, current + 1);
    });

    // Count file attachments
    if (message.attachments && message.attachments.length > 0) {
      node.statistics.filesSharingCount++;
    }
  }

  private queueMessageForOfflineUsers(nodeId: string, message: ChatMessage): void {
    const queue = this.messageQueue.get(nodeId) || [];
    queue.push(message);
    
    // Keep only last 100 messages in queue
    if (queue.length > 100) {
      queue.splice(0, queue.length - 100);
    }
    
    this.messageQueue.set(nodeId, queue);
  }

  private setupCleanupTasks(): void {
    // Clean up old typing indicators every 10 seconds
    setInterval(() => {
      const cutoff = Date.now() - 10000; // 10 seconds ago
      
      for (const [nodeId, indicators] of this.typingIndicators) {
        const active = indicators.filter(i => i.timestamp > cutoff);
        if (active.length !== indicators.length) {
          this.typingIndicators.set(nodeId, active);
          this.emit('typingUpdate', { nodeId, indicators: active });
        }
      }
    }, 10000);

    // Update active participant counts every minute
    setInterval(() => {
      for (const [nodeId, node] of this.chatNodes) {
        const activeConnections = this.activeConnections.get(nodeId)?.size || 0;
        if (node.statistics.activeParticipants !== activeConnections) {
          node.statistics.activeParticipants = activeConnections;
          this.emit('statisticsUpdate', { nodeId, statistics: node.statistics });
        }
      }
    }, 60000);
  }
}

// Export singleton instance
export const chatNodeManager = new ChatNodeManager();