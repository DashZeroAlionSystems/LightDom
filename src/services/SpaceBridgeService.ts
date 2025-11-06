/**
 * Space Bridge Service
 * Bridges optimized space from web crawling to metaverse chatrooms
 * Manages the conversion of saved bytes into usable metaverse infrastructure
 */

import { crawlerPersistence, CrawledSite, LightDomSlot } from './CrawlerPersistenceService';
import { metaverseChatService, MetaverseChatRoom } from './MetaverseChatService';
import { ldomEconomy } from './LDOMEconomyService';
import { serviceHub } from './ServiceHub';
import { EventEmitter } from 'events';

export interface SpaceBridge {
  id: string;
  sourceUrl: string;
  sourceSiteId: string;
  spaceAvailable: number; // bytes
  spaceUsed: number;
  slots: BridgedSlot[];
  chatRooms: string[]; // room IDs using this bridge
  efficiency: number; // 0-100%
  lastOptimized: Date;
  metadata: BridgeMetadata;
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

export interface SpaceAllocationRequest {
  requester: string; // wallet address
  purpose: 'chatroom' | 'storage' | 'compute' | 'archive';
  sizeRequired: number; // bytes
  duration: number; // hours
  priority: 'low' | 'medium' | 'high';
}

export class SpaceBridgeService extends EventEmitter {
  private bridges: Map<string, SpaceBridge> = new Map();
  private allocationQueue: SpaceAllocationRequest[] = [];
  private optimizationSchedule: Map<string, Date> = new Map();
  private bridgeEfficiency: Map<string, number> = new Map();

  constructor() {
    super();
    this.initializeBridges();
    this.startOptimizationScheduler();
    this.startAllocationProcessor();
  }

  /**
   * Initialize bridges from crawled sites
   */
  private async initializeBridges() {
    console.log('🌉 Initializing Space Bridges...');
    
    // Get all crawled sites with reclaimed space
    const sites = await crawlerPersistence['crawledSites'];
    
    for (const [siteId, site] of sites) {
      if (site.spaceReclaimed > 0) {
        await this.createBridge(site);
      }
    }
    
    console.log(`✅ Initialized ${this.bridges.size} space bridges`);
  }

  /**
   * Create a bridge from crawled site to metaverse
   */
  async createBridge(site: CrawledSite): Promise<SpaceBridge> {
    const bridge: SpaceBridge = {
      id: `bridge_${site.id}`,
      sourceUrl: site.url,
      sourceSiteId: site.id,
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
      }
    };

    // Create bridged slots
    const slots = await this.createBridgedSlots(site, bridge);
    bridge.slots = slots;

    // Save bridge
    this.bridges.set(bridge.id, bridge);
    await this.persistBridge(bridge);

    // Schedule re-optimization
    this.scheduleOptimization(bridge);

    // Emit event
    this.emit('bridgeCreated', bridge);

    return bridge;
  }

  /**
   * Allocate space for a chatroom
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
        
        allocatedSlots.push(slot);
        remainingSize -= allocateFromBridge;

        // Apply compression if efficient
        if (bridge.efficiency > 80) {
          slot.compressionRatio = 1.5; // 50% more space due to efficiency
          remainingSize -= allocateFromBridge * 0.5;
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

    return allocatedSlots;
  }

  /**
   * Optimize existing bridges
   */
  async optimizeBridges(): Promise<void> {
    console.log('🔧 Optimizing space bridges...');
    
    for (const [bridgeId, bridge] of this.bridges) {
      // Check if optimization is due
      const nextOptimization = this.optimizationSchedule.get(bridgeId);
      if (!nextOptimization || nextOptimization > new Date()) {
        continue;
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
            
            // Create new slots from additional space
            const newSlots = await this.createAdditionalSlots(bridge, additionalSpace);
            bridge.slots.push(...newSlots);
            
            // Update efficiency
            bridge.efficiency = this.calculateEfficiency(result);
            bridge.lastOptimized = new Date();
            
            await this.persistBridge(bridge);
            
            console.log(`✅ Optimized bridge ${bridgeId}: +${additionalSpace} bytes`);
          }
        }
      } catch (error) {
        console.error(`Failed to optimize bridge ${bridgeId}:`, error);
      }

      // Schedule next optimization
      this.scheduleOptimization(bridge);
    }
  }

  /**
   * Get bridge analytics
   */
  getBridgeAnalytics(): any {
    const analytics = {
      totalBridges: this.bridges.size,
      totalSpace: 0,
      usedSpace: 0,
      efficiency: 0,
      topDomains: new Map<string, number>(),
      infrastructureBreakdown: {
        storage: 0,
        compute: 0,
        bandwidth: 0
      }
    };

    for (const bridge of this.bridges.values()) {
      analytics.totalSpace += bridge.spaceAvailable;
      analytics.usedSpace += bridge.spaceUsed;
      analytics.efficiency += bridge.efficiency;
      
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
      utilizationRate: (analytics.usedSpace / analytics.totalSpace) * 100
    };
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
      }
    }
    
    console.log(`📦 Archived ${archivedSpace} bytes of unused space`);
    return archivedSpace;
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
      .filter(bridge => bridge.spaceAvailable - bridge.spaceUsed > 0)
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
          // Implementation depends on purpose
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
      totalAvailable += bridge.spaceAvailable - bridge.spaceUsed;
    }
    
    return totalAvailable >= sizeRequired;
  }

  /**
   * Persist bridge to database
   */
  private async persistBridge(bridge: SpaceBridge) {
    // TODO: Implement database persistence
    console.log(`💾 Persisting bridge ${bridge.id}`);
  }

  /**
   * Generate unique slot ID
   */
  private generateSlotId(): string {
    return `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get bridge for a URL
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
}

// Export singleton
export const spaceBridgeService = new SpaceBridgeService();


