/**
 * Unified Space Bridge Service
 * Combines real-time socket.io communication with space allocation management
 * Bridges optimized web space to metaverse infrastructure with live updates
 */

import { EventEmitter } from 'events';
import { io, Socket } from 'socket.io-client';
import { crawlerPersistence, CrawledSite, LightDomSlot } from './CrawlerPersistenceService';
import { metaverseChatService, MetaverseChatRoom } from './MetaverseChatService';
import { ldomEconomy } from './LDOMEconomyService';
import { serviceHub } from './ServiceHub';
import { databaseIntegration } from './DatabaseIntegration';

// Interfaces from newer implementation
export interface SpaceBridge {
  id: string;
  bridge_id: string; // For compatibility with socket.io version
  sourceUrl: string;
  sourceSiteId: string;
  source_chain?: string; // From socket.io version
  target_chain?: string; // From socket.io version
  spaceAvailable: number; // bytes
  spaceUsed: number;
  slots: BridgedSlot[];
  chatRooms: string[]; // room IDs using this bridge
  efficiency: number; // 0-100%
  lastOptimized: Date;
  metadata: BridgeMetadata;
  // Real-time properties
  is_operational: boolean;
  validator_count: number;
  status: 'active' | 'inactive' | 'maintenance' | 'upgrading';
  current_volume: number;
  bridge_capacity: number;
}

export interface BridgedSlot {
  slotId: string;
  size: number;
  type: 'active' | 'archived' | 'compressed';
  compressionRatio?: number;
  chatRoomId?: string;
  bridgedAt: Date;
}

export interface BridgeMetadata {
  originalSize: number;
  optimizedSize: number;
  compressionTechnique: string;
  seoScore: number;
  domain: string;
  infrastructure: {
    storage: number;
    compute: number;
    bandwidth: number;
  };
}

// Interfaces from socket.io implementation
export interface BridgeMessage {
  id: string;
  message_id: string;
  bridge_id: string;
  user_name: string;
  user_id?: string;
  message_text: string;
  message_type: 'text' | 'system' | 'optimization' | 'space_mined' | 'bridge_event';
  metadata?: any;
  created_at: Date;
}

export interface BridgeStats {
  total_messages: number;
  active_participants: number;
  total_space_connected: number;
  last_message_at?: Date;
  bridge_capacity: number;
  current_volume: number;
}

export interface SpaceAllocationRequest {
  requester: string; // wallet address
  purpose: 'chatroom' | 'storage' | 'compute' | 'archive';
  sizeRequired: number; // bytes
  duration: number; // hours
  priority: 'low' | 'medium' | 'high';
}

export class UnifiedSpaceBridgeService extends EventEmitter {
  private bridges: Map<string, SpaceBridge> = new Map();
  private activeConnections: Map<string, Set<string>> = new Map(); // bridgeId -> Set<userId>
  private allocationQueue: SpaceAllocationRequest[] = [];
  private optimizationSchedule: Map<string, Date> = new Map();
  private bridgeEfficiency: Map<string, number> = new Map();
  
  // Socket.io properties
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private messageBuffer: BridgeMessage[] = [];
  private currentBridgeId: string | null = null;

  constructor() {
    super();
    this.initializeBridges();
    this.startOptimizationScheduler();
    this.startAllocationProcessor();
    this.setupSocketConnection();
  }

  /**
   * Initialize bridges from crawled sites
   */
  private async initializeBridges() {
    console.log('🌉 Initializing Unified Space Bridges...');
    
    try {
      await databaseIntegration.initialize();
      
      // Load existing bridges from database
      const bridgeData = await databaseIntegration.query(
        'SELECT * FROM space_bridges WHERE status = $1',
        ['active']
      );
      
      for (const row of bridgeData.rows) {
        const bridge: SpaceBridge = {
          ...row,
          slots: JSON.parse(row.slots || '[]'),
          chatRooms: JSON.parse(row.chat_rooms || '[]'),
          metadata: JSON.parse(row.metadata || '{}'),
          lastOptimized: new Date(row.last_optimized),
          is_operational: true,
          validator_count: row.validator_count || 0,
          status: row.status || 'active',
          current_volume: row.current_volume || 0,
          bridge_capacity: row.bridge_capacity || row.spaceAvailable
        };
        
        this.bridges.set(bridge.id, bridge);
      }
      
      // Get all crawled sites with reclaimed space
      const sites = await crawlerPersistence['crawledSites'];
      
      for (const [siteId, site] of sites) {
        if (site.spaceReclaimed > 0 && !this.bridges.has(`bridge_${site.id}`)) {
          await this.createBridge(site);
        }
      }
      
      console.log(`✅ Initialized ${this.bridges.size} unified space bridges`);
    } catch (error) {
      console.error('Failed to initialize bridges:', error);
    }
  }

  /**
   * Setup socket.io connection for real-time features
   */
  private setupSocketConnection() {
    const socketUrl = process.env.VITE_SOCKET_URL || 'http://localhost:3001';
    
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to bridge socket server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      
      // Rejoin active bridges
      this.bridges.forEach(bridge => {
        if (bridge.is_operational) {
          this.socket?.emit('join_bridge', { bridgeId: bridge.bridge_id });
        }
      });
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from bridge socket server');
      this.isConnected = false;
      this.emit('disconnected');
    });

    // Bridge events
    this.socket.on('bridge_message', (data: BridgeMessage) => {
      this.handleBridgeMessage(data);
    });

    this.socket.on('bridge_status_update', (data: any) => {
      this.handleBridgeStatusUpdate(data);
    });

    this.socket.on('space_allocation_update', (data: any) => {
      this.handleSpaceAllocationUpdate(data);
    });

    this.socket.on('optimization_complete', (data: any) => {
      this.handleOptimizationComplete(data);
    });
  }

  /**
   * Create a bridge from crawled site to metaverse
   */
  async createBridge(site: CrawledSite): Promise<SpaceBridge> {
    const bridge: SpaceBridge = {
      id: `bridge_${site.id}`,
      bridge_id: `bridge_${site.id}`, // Compatibility
      sourceUrl: site.url,
      sourceSiteId: site.id,
      source_chain: 'lightdom',
      target_chain: 'metaverse',
      spaceAvailable: site.spaceReclaimed,
      spaceUsed: 0,
      slots: [],
      chatRooms: [],
      efficiency: this.calculateEfficiency(site),
      lastOptimized: site.lastCrawled,
      metadata: {
        originalSize: site.currentSize,
        optimizedSize: site.optimizedSize,
        compressionTechnique: 'lightdom-optimization',
        seoScore: site.seoScore,
        domain: site.domain,
        infrastructure: this.calculateInfrastructure(site.spaceReclaimed)
      },
      is_operational: true,
      validator_count: 1,
      status: 'active',
      current_volume: 0,
      bridge_capacity: site.spaceReclaimed
    };

    // Create bridged slots
    const slots = await this.createBridgedSlots(site, bridge);
    bridge.slots = slots;

    // Save bridge
    this.bridges.set(bridge.id, bridge);
    await this.persistBridge(bridge);

    // Schedule re-optimization
    this.scheduleOptimization(bridge);

    // Emit events
    this.emit('bridgeCreated', bridge);
    
    // Notify via socket
    if (this.socket && this.isConnected) {
      this.socket.emit('bridge_created', {
        bridgeId: bridge.bridge_id,
        capacity: bridge.bridge_capacity,
        metadata: bridge.metadata
      });
    }

    return bridge;
  }

  /**
   * Allocate space for a chatroom with real-time updates
   */
  async allocateSpaceForChatRoom(
    roomId: string,
    sizeRequired: number,
    owner: string
  ): Promise<BridgedSlot[]> {
    const room = metaverseChatService['chatRooms'].get(roomId);
    if (!room || room.owner !== owner) {
      throw new Error('Invalid room or not the owner');
    }

    // Emit allocation start event
    if (this.socket && this.isConnected) {
      this.socket.emit('allocation_started', {
        roomId,
        sizeRequired,
        owner
      });
    }

    // Find best bridges for allocation
    const bridges = this.findBestBridges(sizeRequired);
    const allocatedSlots: BridgedSlot[] = [];
    let remainingSize = sizeRequired;

    for (const bridge of bridges) {
      if (remainingSize <= 0) break;

      const availableInBridge = bridge.spaceAvailable - bridge.spaceUsed;
      const allocateFromBridge = Math.min(availableInBridge, remainingSize);

      if (allocateFromBridge > 0) {
        // Create allocation
        const slot: BridgedSlot = {
          slotId: this.generateSlotId(),
          size: allocateFromBridge,
          type: 'active',
          chatRoomId: roomId,
          bridgedAt: new Date()
        };

        // Update bridge
        bridge.spaceUsed += allocateFromBridge;
        bridge.chatRooms.push(roomId);
        bridge.slots.push(slot);
        bridge.current_volume += allocateFromBridge;
        
        allocatedSlots.push(slot);
        remainingSize -= allocateFromBridge;

        // Apply compression if efficient
        if (bridge.efficiency > 80) {
          slot.compressionRatio = 1.5; // 50% more space due to efficiency
          remainingSize -= allocateFromBridge * 0.5;
        }

        // Emit real-time update
        if (this.socket && this.isConnected) {
          this.socket.emit('space_allocated', {
            bridgeId: bridge.bridge_id,
            slotId: slot.slotId,
            size: slot.size,
            roomId
          });
        }
      }
    }

    if (remainingSize > 0) {
      throw new Error(`Could not allocate enough space. Short by ${remainingSize} bytes`);
    }

    // Process payment
    const totalCost = this.calculateAllocationCost(allocatedSlots);
    await ldomEconomy.purchaseChatRoomSpace(owner, sizeRequired / 1024, roomId);

    // Persist changes
    for (const bridge of bridges) {
      await this.persistBridge(bridge);
    }

    // Send system message about allocation
    if (this.socket && this.isConnected) {
      const message: BridgeMessage = {
        id: this.generateMessageId(),
        message_id: this.generateMessageId(),
        bridge_id: bridges[0].bridge_id,
        user_name: 'System',
        message_text: `Space allocated for room ${room.name}: ${(sizeRequired / 1024).toFixed(2)}KB across ${bridges.length} bridges`,
        message_type: 'space_mined',
        metadata: { roomId, allocatedSlots },
        created_at: new Date()
      };
      
      this.socket.emit('send_message', message);
    }

    return allocatedSlots;
  }

  /**
   * Join a bridge chat room
   */
  async joinBridge(bridgeId: string, userId: string): Promise<BridgeStats> {
    const bridge = this.bridges.get(bridgeId);
    if (!bridge) {
      throw new Error('Bridge not found');
    }

    if (!bridge.is_operational) {
      throw new Error('Bridge is not operational');
    }

    // Add to active connections
    if (!this.activeConnections.has(bridgeId)) {
      this.activeConnections.set(bridgeId, new Set());
    }
    this.activeConnections.get(bridgeId)!.add(userId);

    // Join via socket
    if (this.socket && this.isConnected) {
      this.socket.emit('join_bridge', { bridgeId, userId });
    }

    this.currentBridgeId = bridgeId;

    // Get bridge stats
    const stats = await this.getBridgeStats(bridgeId);
    
    // Send join notification
    const joinMessage: BridgeMessage = {
      id: this.generateMessageId(),
      message_id: this.generateMessageId(),
      bridge_id: bridgeId,
      user_name: 'System',
      user_id: userId,
      message_text: `User joined the bridge`,
      message_type: 'system',
      created_at: new Date()
    };
    
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', joinMessage);
    }

    return stats;
  }

  /**
   * Send a message to bridge chat
   */
  async sendBridgeMessage(
    bridgeId: string,
    userId: string,
    userName: string,
    messageText: string,
    messageType: BridgeMessage['message_type'] = 'text'
  ): Promise<BridgeMessage> {
    const bridge = this.bridges.get(bridgeId);
    if (!bridge || !bridge.is_operational) {
      throw new Error('Bridge not available');
    }

    const message: BridgeMessage = {
      id: this.generateMessageId(),
      message_id: this.generateMessageId(),
      bridge_id: bridgeId,
      user_name: userName,
      user_id: userId,
      message_text: messageText,
      message_type: messageType,
      created_at: new Date()
    };

    // Buffer message if not connected
    if (!this.socket || !this.isConnected) {
      this.messageBuffer.push(message);
    } else {
      this.socket.emit('send_message', message);
      
      // Flush buffer if reconnected
      if (this.messageBuffer.length > 0) {
        this.messageBuffer.forEach(bufferedMsg => {
          this.socket!.emit('send_message', bufferedMsg);
        });
        this.messageBuffer = [];
      }
    }

    // Save to database
    await this.persistBridgeMessage(message);
    
    return message;
  }

  /**
   * Get bridge statistics
   */
  async getBridgeStats(bridgeId: string): Promise<BridgeStats> {
    const bridge = this.bridges.get(bridgeId);
    if (!bridge) {
      throw new Error('Bridge not found');
    }

    try {
      const stats = await databaseIntegration.query(
        `SELECT 
          COUNT(DISTINCT id) as total_messages,
          COUNT(DISTINCT user_id) as active_participants,
          MAX(created_at) as last_message_at
         FROM bridge_messages 
         WHERE bridge_id = $1`,
        [bridgeId]
      );

      const connections = this.activeConnections.get(bridgeId)?.size || 0;

      return {
        total_messages: parseInt(stats.rows[0]?.total_messages || '0'),
        active_participants: Math.max(connections, parseInt(stats.rows[0]?.active_participants || '0')),
        total_space_connected: bridge.spaceAvailable,
        last_message_at: stats.rows[0]?.last_message_at,
        bridge_capacity: bridge.bridge_capacity,
        current_volume: bridge.current_volume
      };
    } catch (error) {
      console.error('Failed to get bridge stats:', error);
      return {
        total_messages: 0,
        active_participants: this.activeConnections.get(bridgeId)?.size || 0,
        total_space_connected: bridge.spaceAvailable,
        bridge_capacity: bridge.bridge_capacity,
        current_volume: bridge.current_volume
      };
    }
  }

  /**
   * Optimize existing bridges with real-time progress
   */
  async optimizeBridges(): Promise<void> {
    console.log('🔧 Optimizing space bridges...');
    
    for (const [bridgeId, bridge] of this.bridges) {
      // Check if optimization is due
      const nextOptimization = this.optimizationSchedule.get(bridgeId);
      if (!nextOptimization || nextOptimization > new Date()) {
        continue;
      }

      // Emit optimization start
      if (this.socket && this.isConnected) {
        this.socket.emit('optimization_started', {
          bridgeId: bridge.bridge_id,
          currentEfficiency: bridge.efficiency
        });
      }

      try {
        // Re-crawl and optimize source
        const crawler = serviceHub.getWebCrawler();
        if (crawler) {
          const result = await crawler.crawlUrl(bridge.sourceUrl);
          
          // Update bridge with new optimization data
          if (result && result.spaceReclaimed > bridge.spaceAvailable) {
            const additionalSpace = result.spaceReclaimed - bridge.spaceAvailable;
            bridge.spaceAvailable += additionalSpace;
            bridge.bridge_capacity += additionalSpace;
            
            // Create new slots from additional space
            const newSlots = await this.createAdditionalSlots(bridge, additionalSpace);
            bridge.slots.push(...newSlots);
            
            // Update efficiency
            bridge.efficiency = this.calculateEfficiency(result);
            bridge.lastOptimized = new Date();
            
            await this.persistBridge(bridge);
            
            // Emit optimization complete
            if (this.socket && this.isConnected) {
              this.socket.emit('optimization_complete', {
                bridgeId: bridge.bridge_id,
                additionalSpace,
                newEfficiency: bridge.efficiency
              });
            }
            
            console.log(`✅ Optimized bridge ${bridgeId}: +${additionalSpace} bytes`);
          }
        }
      } catch (error) {
        console.error(`Failed to optimize bridge ${bridgeId}:`, error);
        
        // Emit optimization error
        if (this.socket && this.isConnected) {
          this.socket.emit('optimization_error', {
            bridgeId: bridge.bridge_id,
            error: error.message
          });
        }
      }

      // Schedule next optimization
      this.scheduleOptimization(bridge);
    }
  }

  /**
   * Handle incoming bridge messages
   */
  private handleBridgeMessage(message: BridgeMessage) {
    this.emit('bridge_message', message);
    
    // Update last message timestamp
    const bridge = Array.from(this.bridges.values()).find(b => b.bridge_id === message.bridge_id);
    if (bridge) {
      bridge.metadata.lastMessageAt = message.created_at;
    }
  }

  /**
   * Handle bridge status updates
   */
  private handleBridgeStatusUpdate(data: any) {
    const bridge = this.bridges.get(data.bridgeId);
    if (bridge) {
      bridge.status = data.status;
      bridge.is_operational = data.status === 'active';
      bridge.validator_count = data.validator_count || bridge.validator_count;
      
      this.emit('bridge_status_changed', {
        bridgeId: data.bridgeId,
        status: data.status,
        operational: bridge.is_operational
      });
    }
  }

  /**
   * Handle space allocation updates
   */
  private handleSpaceAllocationUpdate(data: any) {
    const bridge = this.bridges.get(data.bridgeId);
    if (bridge) {
      bridge.current_volume = data.current_volume;
      bridge.spaceUsed = data.space_used;
      
      this.emit('space_allocation_changed', {
        bridgeId: data.bridgeId,
        spaceUsed: data.space_used,
        spaceAvailable: bridge.spaceAvailable - data.space_used
      });
    }
  }

  /**
   * Handle optimization completion
   */
  private handleOptimizationComplete(data: any) {
    const bridge = this.bridges.get(data.bridgeId);
    if (bridge) {
      bridge.efficiency = data.newEfficiency;
      bridge.spaceAvailable += data.additionalSpace;
      bridge.lastOptimized = new Date();
      
      this.emit('optimization_complete', {
        bridgeId: data.bridgeId,
        additionalSpace: data.additionalSpace,
        newEfficiency: data.newEfficiency
      });
    }
  }

  /**
   * Get analytics for all bridges
   */
  getBridgeAnalytics(): any {
    const analytics = {
      totalBridges: this.bridges.size,
      operationalBridges: 0,
      totalSpace: 0,
      usedSpace: 0,
      efficiency: 0,
      activeConnections: 0,
      topDomains: new Map<string, number>(),
      infrastructureBreakdown: {
        storage: 0,
        compute: 0,
        bandwidth: 0
      }
    };

    for (const bridge of this.bridges.values()) {
      if (bridge.is_operational) analytics.operationalBridges++;
      analytics.totalSpace += bridge.spaceAvailable;
      analytics.usedSpace += bridge.spaceUsed;
      analytics.efficiency += bridge.efficiency;
      analytics.activeConnections += this.activeConnections.get(bridge.id)?.size || 0;
      
      // Track domains
      const domain = bridge.metadata.domain;
      analytics.topDomains.set(
        domain,
        (analytics.topDomains.get(domain) || 0) + bridge.spaceAvailable
      );
      
      // Infrastructure
      analytics.infrastructureBreakdown.storage += bridge.metadata.infrastructure.storage;
      analytics.infrastructureBreakdown.compute += bridge.metadata.infrastructure.compute;
      analytics.infrastructureBreakdown.bandwidth += bridge.metadata.infrastructure.bandwidth;
    }

    analytics.efficiency /= this.bridges.size;

    // Convert top domains to array
    const topDomainsArray = Array.from(analytics.topDomains.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([domain, space]) => ({ domain, space }));

    return {
      ...analytics,
      topDomains: topDomainsArray,
      utilizationRate: (analytics.usedSpace / analytics.totalSpace) * 100,
      socketConnected: this.isConnected
    };
  }

  /**
   * Calculate bridge efficiency
   */
  private calculateEfficiency(site: CrawledSite | any): number {
    const compressionRatio = site.currentSize / site.optimizedSize;
    const seoFactor = site.seoScore / 100;
    const sizeFactor = Math.min(site.spaceReclaimed / (100 * 1024), 1); // 100KB = max factor
    
    return Math.round((compressionRatio * 0.4 + seoFactor * 0.3 + sizeFactor * 0.3) * 100);
  }

  /**
   * Calculate infrastructure allocation
   */
  private calculateInfrastructure(spaceReclaimed: number): any {
    const totalUnits = spaceReclaimed / 1024; // KB units
    
    return {
      storage: Math.floor(totalUnits * 0.6),
      compute: Math.floor(totalUnits * 0.3),
      bandwidth: Math.floor(totalUnits * 0.1)
    };
  }

  /**
   * Create bridged slots from site
   */
  private async createBridgedSlots(
    site: CrawledSite,
    bridge: SpaceBridge
  ): Promise<BridgedSlot[]> {
    const slots: BridgedSlot[] = [];
    const slotSize = 10 * 1024; // 10KB per slot
    const numSlots = Math.floor(site.spaceReclaimed / slotSize);
    
    for (let i = 0; i < numSlots; i++) {
      slots.push({
        slotId: this.generateSlotId(),
        size: slotSize,
        type: 'active',
        bridgedAt: new Date()
      });
    }
    
    // Handle remainder
    const remainder = site.spaceReclaimed % slotSize;
    if (remainder > 1024) { // Only create slot if > 1KB
      slots.push({
        slotId: this.generateSlotId(),
        size: remainder,
        type: 'active',
        bridgedAt: new Date()
      });
    }
    
    return slots;
  }

  /**
   * Create additional slots from new space
   */
  private async createAdditionalSlots(
    bridge: SpaceBridge,
    additionalSpace: number
  ): Promise<BridgedSlot[]> {
    const slots: BridgedSlot[] = [];
    const slotSize = 10 * 1024;
    const numSlots = Math.floor(additionalSpace / slotSize);
    
    for (let i = 0; i < numSlots; i++) {
      slots.push({
        slotId: this.generateSlotId(),
        size: slotSize,
        type: 'active',
        compressionRatio: bridge.efficiency > 80 ? 1.5 : undefined,
        bridgedAt: new Date()
      });
    }
    
    return slots;
  }

  /**
   * Find best bridges for allocation
   */
  private findBestBridges(sizeRequired: number): SpaceBridge[] {
    return Array.from(this.bridges.values())
      .filter(bridge => bridge.is_operational && bridge.spaceAvailable - bridge.spaceUsed > 0)
      .sort((a, b) => {
        // Sort by efficiency and available space
        const scoreA = a.efficiency * (a.spaceAvailable - a.spaceUsed);
        const scoreB = b.efficiency * (b.spaceAvailable - b.spaceUsed);
        return scoreB - scoreA;
      })
      .slice(0, 5); // Top 5 bridges
  }

  /**
   * Calculate allocation cost
   */
  private calculateAllocationCost(slots: BridgedSlot[]): number {
    let totalCost = 0;
    
    for (const slot of slots) {
      const basePrice = (slot.size / 1024) * 1; // 1 LDOM per KB
      const efficiencyDiscount = slot.compressionRatio ? 0.8 : 1; // 20% discount for compressed
      totalCost += basePrice * efficiencyDiscount;
    }
    
    return totalCost;
  }

  /**
   * Schedule bridge optimization
   */
  private scheduleOptimization(bridge: SpaceBridge) {
    // Schedule based on efficiency and usage
    const baseInterval = 24 * 60 * 60 * 1000; // 24 hours
    const efficiencyFactor = bridge.efficiency / 100;
    const usageFactor = bridge.spaceUsed / bridge.spaceAvailable;
    
    const interval = baseInterval * (2 - efficiencyFactor - usageFactor);
    const nextOptimization = new Date(Date.now() + interval);
    
    this.optimizationSchedule.set(bridge.id, nextOptimization);
  }

  /**
   * Start optimization scheduler
   */
  private startOptimizationScheduler() {
    setInterval(() => {
      this.optimizeBridges();
    }, 60 * 60 * 1000); // Check every hour
  }

  /**
   * Start allocation processor
   */
  private startAllocationProcessor() {
    setInterval(() => {
      this.processAllocationQueue();
    }, 10 * 1000); // Process every 10 seconds
  }

  /**
   * Process allocation queue
   */
  private async processAllocationQueue() {
    while (this.allocationQueue.length > 0) {
      const request = this.allocationQueue.shift()!;
      
      try {
        // Process based on priority
        if (request.priority === 'high' || this.canAllocate(request.sizeRequired)) {
          // Allocate space
          console.log(`📦 Processing allocation request: ${request.sizeRequired} bytes`);
          
          // Emit processing event
          if (this.socket && this.isConnected) {
            this.socket.emit('allocation_processing', request);
          }
        }
      } catch (error) {
        console.error('Failed to process allocation:', error);
      }
    }
  }

  /**
   * Check if allocation is possible
   */
  private canAllocate(sizeRequired: number): boolean {
    let totalAvailable = 0;
    
    for (const bridge of this.bridges.values()) {
      if (bridge.is_operational) {
        totalAvailable += bridge.spaceAvailable - bridge.spaceUsed;
      }
    }
    
    return totalAvailable >= sizeRequired;
  }

  /**
   * Persist bridge to database
   */
  private async persistBridge(bridge: SpaceBridge) {
    try {
      await databaseIntegration.query(
        `INSERT INTO space_bridges (
          id, bridge_id, source_url, source_site_id, source_chain, target_chain,
          space_available, space_used, slots, chat_rooms, efficiency,
          last_optimized, metadata, is_operational, validator_count,
          status, current_volume, bridge_capacity
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT (id) DO UPDATE SET
          space_used = $8, slots = $9, chat_rooms = $10, efficiency = $11,
          last_optimized = $12, metadata = $13, is_operational = $14,
          validator_count = $15, status = $16, current_volume = $17`,
        [
          bridge.id, bridge.bridge_id, bridge.sourceUrl, bridge.sourceSiteId,
          bridge.source_chain, bridge.target_chain, bridge.spaceAvailable,
          bridge.spaceUsed, JSON.stringify(bridge.slots),
          JSON.stringify(bridge.chatRooms), bridge.efficiency,
          bridge.lastOptimized, JSON.stringify(bridge.metadata),
          bridge.is_operational, bridge.validator_count, bridge.status,
          bridge.current_volume, bridge.bridge_capacity
        ]
      );
    } catch (error) {
      console.error(`Failed to persist bridge ${bridge.id}:`, error);
    }
  }

  /**
   * Persist bridge message
   */
  private async persistBridgeMessage(message: BridgeMessage) {
    try {
      await databaseIntegration.query(
        `INSERT INTO bridge_messages (
          id, message_id, bridge_id, user_name, user_id,
          message_text, message_type, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          message.id, message.message_id, message.bridge_id,
          message.user_name, message.user_id, message.message_text,
          message.message_type, JSON.stringify(message.metadata),
          message.created_at
        ]
      );
    } catch (error) {
      console.error('Failed to persist bridge message:', error);
    }
  }

  /**
   * Generate unique IDs
   */
  private generateSlotId(): string {
    return `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get bridges for a specific URL
   */
  getBridgeForUrl(url: string): SpaceBridge | undefined {
    return Array.from(this.bridges.values()).find(
      bridge => bridge.sourceUrl === url
    );
  }

  /**
   * Get bridges for a chatroom
   */
  getBridgesForChatRoom(roomId: string): SpaceBridge[] {
    return Array.from(this.bridges.values()).filter(
      bridge => bridge.chatRooms.includes(roomId)
    );
  }

  /**
   * Archive unused bridge space
   */
  async archiveUnusedSpace(minAge: number = 30): Promise<number> {
    let archivedSpace = 0;
    
    for (const bridge of this.bridges.values()) {
      const ageInDays = (Date.now() - bridge.lastOptimized.getTime()) / (1000 * 60 * 60 * 24);
      
      if (ageInDays > minAge && bridge.spaceUsed < bridge.spaceAvailable * 0.1) {
        // Archive unused slots
        for (const slot of bridge.slots) {
          if (!slot.chatRoomId && slot.type === 'active') {
            slot.type = 'archived';
            slot.compressionRatio = 2; // Double compression for archives
            archivedSpace += slot.size;
          }
        }
        
        await this.persistBridge(bridge);
        
        // Emit archive event
        if (this.socket && this.isConnected) {
          this.socket.emit('space_archived', {
            bridgeId: bridge.bridge_id,
            archivedSpace
          });
        }
      }
    }
    
    console.log(`📦 Archived ${archivedSpace} bytes of unused space`);
    return archivedSpace;
  }

  /**
   * Cleanup and shutdown
   */
  shutdown() {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    // Clear intervals
    this.removeAllListeners();
  }
}

// Export singleton
export const unifiedSpaceBridgeService = new UnifiedSpaceBridgeService();
