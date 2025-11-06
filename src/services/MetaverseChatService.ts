/**
 * Metaverse Chat Service
 * Creates a decentralized chat system using LightDOM slots
 * Each chatroom occupies optimized space from crawled sites
 */

import { crawlerPersistence, LightDomSlot } from './CrawlerPersistenceService';
import { serviceHub } from './ServiceHub';
import { databaseIntegration } from './DatabaseIntegration';
import { EventEmitter } from 'events';
import { unifiedSpaceBridgeService } from './UnifiedSpaceBridgeService';

export interface MetaverseChatRoom {
  id: string;
  name: string;
  description: string;
  owner: string; // wallet address
  slotIds: string[]; // LightDOM slots occupied
  totalSpace: number; // total bytes allocated
  participants: ChatParticipant[];
  messages: ChatMessage[];
  settings: ChatRoomSettings;
  price: string; // LDOM tokens to join
  revenue: string; // LDOM tokens earned
  createdAt: Date;
  expiresAt?: Date;
  coordinates: MetaverseCoordinates; // Position in metaverse
}

export interface ChatParticipant {
  walletAddress: string;
  username: string;
  role: 'owner' | 'moderator' | 'member' | 'guest';
  joinedAt: Date;
  lastActive: Date;
  messageCount: number;
  reputation: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: string; // wallet address
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  timestamp: Date;
  reactions: Record<string, string[]>; // emoji -> [wallet addresses]
  replyTo?: string; // message id
  edited?: boolean;
  metadata?: any;
}

export interface ChatRoomSettings {
  public: boolean;
  maxParticipants: number;
  minReputation: number;
  allowGuests: boolean;
  messageRetention: number; // days
  moderated: boolean;
  encryptMessages: boolean;
  theme: ChatTheme;
}

export interface ChatTheme {
  primaryColor: string;
  backgroundColor: string;
  style: 'modern' | 'retro' | 'space' | 'custom';
  customCSS?: string;
}

export interface MetaverseCoordinates {
  x: number;
  y: number;
  z: number;
  sector: string; // e.g., 'tech', 'social', 'gaming', 'business'
}

export interface MetaversePortal {
  fromRoom: string;
  toRoom: string;
  bidirectional: boolean;
  price: string; // LDOM to use portal
}

export class MetaverseChatService extends EventEmitter {
  private chatRooms: Map<string, MetaverseChatRoom> = new Map();
  private activeConnections: Map<string, Set<string>> = new Map(); // roomId -> Set<walletAddress>
  private portals: Map<string, MetaversePortal> = new Map();
  private messageBuffer: Map<string, ChatMessage[]> = new Map();
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.loadPersistedData();
    this.startMessageFlusher();
    this.setupCleanupJob();
  }

  /**
   * Load persisted chat data
   */
  private async loadPersistedData() {
    try {
      await databaseIntegration.initialize();
      
      // Load chat rooms
      const rooms = await databaseIntegration.query(
        'SELECT * FROM metaverse_chatrooms WHERE expires_at IS NULL OR expires_at > NOW()',
        []
      );

      for (const room of rooms.rows) {
        const chatRoom: MetaverseChatRoom = {
          ...room,
          participants: JSON.parse(room.participants || '[]'),
          messages: [], // Load messages on demand
          settings: JSON.parse(room.settings || '{}'),
          coordinates: JSON.parse(room.coordinates || '{}'),
          createdAt: new Date(room.created_at),
          expiresAt: room.expires_at ? new Date(room.expires_at) : undefined
        };
        
        this.chatRooms.set(chatRoom.id, chatRoom);
      }

      // Load portals
      const portals = await databaseIntegration.query(
        'SELECT * FROM metaverse_portals',
        []
      );

      portals.rows.forEach(portal => {
        this.portals.set(`${portal.from_room}-${portal.to_room}`, portal);
      });

      console.log(`✅ Loaded ${this.chatRooms.size} chat rooms`);
    } catch (error) {
      console.error('Failed to load chat data:', error);
    }
  }

  /**
   * Create a new metaverse chatroom
   */
  async createChatRoom(
    owner: string,
    name: string,
    description: string,
    spaceRequired: number,
    settings: Partial<ChatRoomSettings> = {}
  ): Promise<MetaverseChatRoom> {
    // Find available slots
    const availableSlots = await crawlerPersistence.getAvailableSlots('chat');
    
    // Calculate how many slots needed
    const slotsNeeded = Math.ceil(spaceRequired / (10 * 1024)); // 10KB per slot
    
    if (availableSlots.length < slotsNeeded) {
      throw new Error(`Not enough space available. Need ${slotsNeeded} slots, found ${availableSlots.length}`);
    }

    // Select cheapest slots
    const selectedSlots = availableSlots
      .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
      .slice(0, slotsNeeded);

    // Calculate total cost
    const totalCost = selectedSlots.reduce((sum, slot) => 
      sum + parseFloat(slot.price), 0
    );

    // Process payment (integrate with blockchain)
    const blockchain = serviceHub.getBlockchain();
    if (blockchain) {
      // TODO: Deduct LDOM tokens from owner
      console.log(`💰 Processing payment of ${totalCost} LDOM for chatroom`);
    }

    // Rent slots
    const rentedSlotIds: string[] = [];
    for (const slot of selectedSlots) {
      const success = await crawlerPersistence.rentSlot(slot.id, owner, 24 * 30); // 30 days
      if (success) {
        rentedSlotIds.push(slot.id);
      }
    }

    // Create chatroom
    const chatRoom: MetaverseChatRoom = {
      id: this.generateRoomId(),
      name,
      description,
      owner,
      slotIds: rentedSlotIds,
      totalSpace: spaceRequired,
      participants: [{
        walletAddress: owner,
        username: `User_${owner.slice(-6)}`,
        role: 'owner',
        joinedAt: new Date(),
        lastActive: new Date(),
        messageCount: 0,
        reputation: 100
      }],
      messages: [],
      settings: {
        public: true,
        maxParticipants: 100,
        minReputation: 0,
        allowGuests: true,
        messageRetention: 30,
        moderated: false,
        encryptMessages: false,
        theme: {
          primaryColor: '#0ea5e9',
          backgroundColor: '#1e293b',
          style: 'modern'
        },
        ...settings
      },
      price: '0', // Free to join by default
      revenue: '0',
      createdAt: new Date(),
      coordinates: this.assignCoordinates(name, description)
    };

    // Persist chatroom
    await this.persistChatRoom(chatRoom);
    
    // Add to memory
    this.chatRooms.set(chatRoom.id, chatRoom);
    
    // Emit event
    this.emit('roomCreated', chatRoom);
    
    return chatRoom;
  }

  /**
   * Join a chatroom
   */
  async joinChatRoom(roomId: string, walletAddress: string, username?: string): Promise<boolean> {
    const room = this.chatRooms.get(roomId);
    if (!room) return false;

    // Check if already a participant
    if (room.participants.find(p => p.walletAddress === walletAddress)) {
      return true;
    }

    // Check room capacity
    if (room.participants.length >= room.settings.maxParticipants) {
      throw new Error('Room is full');
    }

    // Check reputation requirement
    const userStats = await databaseIntegration.getUserStats(walletAddress);
    const reputation = userStats?.reputation_score || 0;
    
    if (reputation < room.settings.minReputation) {
      throw new Error(`Minimum reputation of ${room.settings.minReputation} required`);
    }

    // Process joining fee if any
    if (parseFloat(room.price) > 0) {
      // TODO: Process LDOM payment
      room.revenue = (parseFloat(room.revenue) + parseFloat(room.price)).toString();
    }

    // Add participant
    const participant: ChatParticipant = {
      walletAddress,
      username: username || `User_${walletAddress.slice(-6)}`,
      role: 'member',
      joinedAt: new Date(),
      lastActive: new Date(),
      messageCount: 0,
      reputation
    };

    room.participants.push(participant);
    
    // Add to active connections
    if (!this.activeConnections.has(roomId)) {
      this.activeConnections.set(roomId, new Set());
    }
    this.activeConnections.get(roomId)!.add(walletAddress);

    // Send system message
    await this.sendMessage(roomId, 'system', {
      content: `${participant.username} joined the room`,
      type: 'system'
    });

    // Persist update
    await this.persistChatRoom(room);
    
    // Emit event
    this.emit('userJoined', { roomId, participant });
    
    return true;
  }

  /**
   * Send a message in a chatroom
   */
  async sendMessage(
    roomId: string,
    sender: string,
    messageData: Partial<ChatMessage>
  ): Promise<ChatMessage> {
    const room = this.chatRooms.get(roomId);
    if (!room) throw new Error('Room not found');

    // Verify sender is participant (unless system message)
    if (sender !== 'system') {
      const participant = room.participants.find(p => p.walletAddress === sender);
      if (!participant) throw new Error('Not a room participant');
      
      // Update participant stats
      participant.messageCount++;
      participant.lastActive = new Date();
    }

    // Create message
    const message: ChatMessage = {
      id: this.generateMessageId(),
      roomId,
      sender,
      content: messageData.content || '',
      type: messageData.type || 'text',
      timestamp: new Date(),
      reactions: {},
      ...messageData
    };

    // Add to room messages (keep last 100 in memory)
    room.messages.push(message);
    if (room.messages.length > 100) {
      room.messages = room.messages.slice(-100);
    }

    // Add to buffer for batch persistence
    if (!this.messageBuffer.has(roomId)) {
      this.messageBuffer.set(roomId, []);
    }
    this.messageBuffer.get(roomId)!.push(message);

    // Broadcast to active connections
    this.broadcastToRoom(roomId, 'message', message);

    return message;
  }

  /**
   * Create a portal between two rooms
   */
  async createPortal(
    fromRoomId: string,
    toRoomId: string,
    bidirectional: boolean = true,
    price: string = '0'
  ): Promise<MetaversePortal> {
    const fromRoom = this.chatRooms.get(fromRoomId);
    const toRoom = this.chatRooms.get(toRoomId);
    
    if (!fromRoom || !toRoom) {
      throw new Error('One or both rooms not found');
    }

    const portal: MetaversePortal = {
      fromRoom: fromRoomId,
      toRoom: toRoomId,
      bidirectional,
      price
    };

    // Save portal
    this.portals.set(`${fromRoomId}-${toRoomId}`, portal);
    
    if (bidirectional) {
      this.portals.set(`${toRoomId}-${fromRoomId}`, {
        ...portal,
        fromRoom: toRoomId,
        toRoom: fromRoomId
      });
    }

    // Persist portal
    await databaseIntegration.query(
      `INSERT INTO metaverse_portals (from_room, to_room, bidirectional, price)
       VALUES ($1, $2, $3, $4)`,
      [fromRoomId, toRoomId, bidirectional, price]
    );

    // Notify rooms
    await this.sendMessage(fromRoomId, 'system', {
      content: `Portal created to ${toRoom.name}`,
      type: 'system',
      metadata: { portalTo: toRoomId }
    });

    if (bidirectional) {
      await this.sendMessage(toRoomId, 'system', {
        content: `Portal created to ${fromRoom.name}`,
        type: 'system',
        metadata: { portalTo: fromRoomId }
      });
    }

    return portal;
  }

  /**
   * Travel through a portal
   */
  async travelPortal(
    walletAddress: string,
    fromRoomId: string,
    toRoomId: string
  ): Promise<boolean> {
    const portal = this.portals.get(`${fromRoomId}-${toRoomId}`);
    if (!portal) {
      throw new Error('Portal not found');
    }

    // Leave current room
    await this.leaveChatRoom(fromRoomId, walletAddress);

    // Process portal fee if any
    if (parseFloat(portal.price) > 0) {
      // TODO: Process LDOM payment
      console.log(`💰 Portal fee: ${portal.price} LDOM`);
    }

    // Join destination room
    await this.joinChatRoom(toRoomId, walletAddress);

    return true;
  }

  /**
   * Get metaverse map
   */
  getMetaverseMap(): any {
    const map = {
      sectors: {} as Record<string, any[]>,
      portals: Array.from(this.portals.values()),
      totalRooms: this.chatRooms.size,
      activeUsers: 0
    };

    // Group rooms by sector
    this.chatRooms.forEach(room => {
      const sector = room.coordinates.sector;
      if (!map.sectors[sector]) {
        map.sectors[sector] = [];
      }
      
      map.sectors[sector].push({
        id: room.id,
        name: room.name,
        coordinates: room.coordinates,
        participants: room.participants.length,
        public: room.settings.public
      });
    });

    // Count active users
    this.activeConnections.forEach(connections => {
      map.activeUsers += connections.size;
    });

    return map;
  }

  /**
   * Search for chatrooms
   */
  searchChatRooms(query: string, filters?: {
    sector?: string;
    maxPrice?: number;
    minReputation?: number;
    publicOnly?: boolean;
  }): MetaverseChatRoom[] {
    let results = Array.from(this.chatRooms.values());

    // Text search
    if (query) {
      const searchLower = query.toLowerCase();
      results = results.filter(room => 
        room.name.toLowerCase().includes(searchLower) ||
        room.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (filters) {
      if (filters.sector) {
        results = results.filter(room => room.coordinates.sector === filters.sector);
      }
      
      if (filters.maxPrice !== undefined) {
        results = results.filter(room => parseFloat(room.price) <= filters.maxPrice);
      }
      
      if (filters.minReputation !== undefined) {
        results = results.filter(room => room.settings.minReputation >= filters.minReputation);
      }
      
      if (filters.publicOnly) {
        results = results.filter(room => room.settings.public);
      }
    }

    return results;
  }

  /**
   * Get room space utilization
   */
  async getRoomSpaceUtilization(roomId: string): Promise<any> {
    const room = this.chatRooms.get(roomId);
    if (!room) return null;

    const messageCount = room.messages.length;
    const avgMessageSize = 100; // bytes
    const usedSpace = messageCount * avgMessageSize;
    const utilizationPercent = (usedSpace / room.totalSpace) * 100;

    return {
      totalSpace: room.totalSpace,
      usedSpace,
      availableSpace: room.totalSpace - usedSpace,
      utilizationPercent,
      messageCount,
      slotCount: room.slotIds.length
    };
  }

  /**
   * Persist chatroom to database
   */
  private async persistChatRoom(room: MetaverseChatRoom) {
    await databaseIntegration.query(
      `INSERT INTO metaverse_chatrooms (
        id, name, description, owner, slot_ids, total_space,
        participants, settings, price, revenue, created_at,
        expires_at, coordinates
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
        participants = $7, settings = $8, revenue = $10`,
      [
        room.id, room.name, room.description, room.owner,
        JSON.stringify(room.slotIds), room.totalSpace,
        JSON.stringify(room.participants), JSON.stringify(room.settings),
        room.price, room.revenue, room.createdAt,
        room.expiresAt, JSON.stringify(room.coordinates)
      ]
    );
  }

  /**
   * Flush message buffer to database
   */
  private async flushMessageBuffer() {
    for (const [roomId, messages] of this.messageBuffer) {
      if (messages.length === 0) continue;

      try {
        // Batch insert messages
        const values = messages.map(msg => [
          msg.id, msg.roomId, msg.sender, msg.content,
          msg.type, msg.timestamp, JSON.stringify(msg.reactions),
          msg.replyTo, msg.edited, JSON.stringify(msg.metadata)
        ]);

        await databaseIntegration.query(
          `INSERT INTO chat_messages (
            id, room_id, sender, content, type, timestamp,
            reactions, reply_to, edited, metadata
          ) VALUES ${values.map((_, i) => 
            `($${i*10+1}, $${i*10+2}, $${i*10+3}, $${i*10+4}, $${i*10+5}, 
              $${i*10+6}, $${i*10+7}, $${i*10+8}, $${i*10+9}, $${i*10+10})`
          ).join(', ')}`,
          values.flat()
        );

        // Clear buffer
        this.messageBuffer.set(roomId, []);
      } catch (error) {
        console.error(`Failed to flush messages for room ${roomId}:`, error);
      }
    }
  }

  /**
   * Start message flusher
   */
  private startMessageFlusher() {
    // Flush messages every 10 seconds
    this.flushInterval = setInterval(() => {
      this.flushMessageBuffer();
    }, 10000);
  }

  /**
   * Setup cleanup job
   */
  private setupCleanupJob() {
    // Clean up expired rooms and messages daily
    setInterval(() => {
      this.cleanupExpiredData();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Clean up expired data
   */
  private async cleanupExpiredData() {
    const now = new Date();
    
    // Remove expired rooms
    for (const [roomId, room] of this.chatRooms) {
      if (room.expiresAt && room.expiresAt < now) {
        // Release slots
        for (const slotId of room.slotIds) {
          // Slots are automatically released when expired
        }
        
        // Remove room
        this.chatRooms.delete(roomId);
        
        // Clean from database
        await databaseIntegration.query(
          'DELETE FROM metaverse_chatrooms WHERE id = $1',
          [roomId]
        );
      }
    }

    // Clean old messages based on retention policy
    for (const room of this.chatRooms.values()) {
      const retentionDate = new Date();
      retentionDate.setDate(retentionDate.getDate() - room.settings.messageRetention);
      
      await databaseIntegration.query(
        'DELETE FROM chat_messages WHERE room_id = $1 AND timestamp < $2',
        [room.id, retentionDate]
      );
    }
  }

  /**
   * Leave a chatroom
   */
  private async leaveChatRoom(roomId: string, walletAddress: string) {
    const room = this.chatRooms.get(roomId);
    if (!room) return;

    // Remove from participants
    room.participants = room.participants.filter(p => p.walletAddress !== walletAddress);
    
    // Remove from active connections
    this.activeConnections.get(roomId)?.delete(walletAddress);
    
    // Send system message
    await this.sendMessage(roomId, 'system', {
      content: `User left the room`,
      type: 'system'
    });
  }

  /**
   * Broadcast to all users in a room
   */
  private broadcastToRoom(roomId: string, event: string, data: any) {
    const connections = this.activeConnections.get(roomId);
    if (!connections) return;

    this.emit('broadcast', {
      roomId,
      event,
      data,
      recipients: Array.from(connections)
    });
  }

  /**
   * Assign coordinates based on room characteristics
   */
  private assignCoordinates(name: string, description: string): MetaverseCoordinates {
    // Simple sector assignment based on keywords
    const text = `${name} ${description}`.toLowerCase();
    let sector = 'social'; // default
    
    if (text.includes('tech') || text.includes('code') || text.includes('dev')) {
      sector = 'tech';
    } else if (text.includes('game') || text.includes('play') || text.includes('fun')) {
      sector = 'gaming';
    } else if (text.includes('business') || text.includes('trade') || text.includes('market')) {
      sector = 'business';
    }

    // Random coordinates within sector
    const sectorOffsets = {
      tech: { x: 0, y: 0 },
      social: { x: 1000, y: 0 },
      gaming: { x: 0, y: 1000 },
      business: { x: 1000, y: 1000 }
    };

    const offset = sectorOffsets[sector as keyof typeof sectorOffsets];
    
    return {
      x: offset.x + Math.random() * 1000,
      y: offset.y + Math.random() * 1000,
      z: Math.random() * 100,
      sector
    };
  }

  /**
   * Generate unique room ID
   */
  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Shutdown service
   */
  shutdown() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushMessageBuffer();
  }
}

// Export singleton
export const metaverseChatService = new MetaverseChatService();


