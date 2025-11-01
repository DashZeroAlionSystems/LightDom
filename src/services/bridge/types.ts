/**
 * Space Bridge Service Type Definitions
 * Extracted from UnifiedSpaceBridgeService.ts for better separation of concerns
 */

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

export interface BridgeMessageMetadata {
  [key: string]: string | number | boolean | undefined;
}

export interface BridgeMessage {
  id: string;
  message_id: string;
  bridge_id: string;
  user_name: string;
  user_id?: string;
  message_text: string;
  message_type: 'text' | 'system' | 'optimization' | 'space_mined' | 'bridge_event';
  metadata?: BridgeMessageMetadata;
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
