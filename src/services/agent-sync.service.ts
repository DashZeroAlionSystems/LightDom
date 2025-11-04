/**
 * Agent Synchronization Service
 * 
 * Provides real-time two-way communication between agents and data sources,
 * state synchronization, conflict resolution, and simulation result propagation.
 */

import { Pool } from 'pg';

export interface SyncChannel {
  channel_id: string;
  name: string;
  description?: string;
  channel_type: 'unidirectional' | 'bidirectional' | 'broadcast';
  sync_strategy: 'immediate' | 'batched' | 'scheduled';
  config: any;
  created_at: Date;
}

export interface SyncEvent {
  event_id: string;
  channel_id: string;
  source_agent_id?: string;
  event_type: string;
  data: any;
  timestamp: Date;
  processed: boolean;
}

export interface AgentStateSnapshot {
  snapshot_id: string;
  agent_id: string;
  state_data: any;
  version: number;
  snapshot_time: Date;
  metadata?: any;
}

export class AgentSyncService {
  constructor(private pool: Pool) {}

  /**
   * Create a new synchronization channel for two-way communication
   */
  async createSyncChannel(data: {
    name: string;
    description?: string;
    channel_type: 'unidirectional' | 'bidirectional' | 'broadcast';
    sync_strategy: 'immediate' | 'batched' | 'scheduled';
    config?: any;
  }): Promise<SyncChannel> {
    const result = await this.pool.query(
      `INSERT INTO agent_sync_channels (name, description, channel_type, sync_strategy, config)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.name, data.description, data.channel_type, data.sync_strategy, data.config || {}]
    );
    return result.rows[0];
  }

  /**
   * Subscribe an agent to a sync channel
   */
  async subscribeAgentToChannel(agentId: string, channelId: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO agent_channel_subscriptions (agent_id, channel_id)
       VALUES ($1, $2)
       ON CONFLICT (agent_id, channel_id) DO NOTHING`,
      [agentId, channelId]
    );
  }

  /**
   * Unsubscribe an agent from a sync channel
   */
  async unsubscribeAgentFromChannel(agentId: string, channelId: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM agent_channel_subscriptions
       WHERE agent_id = $1 AND channel_id = $2`,
      [agentId, channelId]
    );
  }

  /**
   * Publish a sync event to a channel (agent → system)
   */
  async publishSyncEvent(channelId: string, event: {
    source_agent_id?: string;
    event_type: string;
    data: any;
  }): Promise<SyncEvent> {
    const result = await this.pool.query(
      `INSERT INTO agent_sync_events (channel_id, source_agent_id, event_type, data)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [channelId, event.source_agent_id, event.event_type, event.data]
    );

    const syncEvent = result.rows[0];

    // If immediate sync, broadcast to subscribers
    const channel = await this.getSyncChannel(channelId);
    if (channel.sync_strategy === 'immediate') {
      await this.broadcastToChannel(channelId, {
        event_type: event.event_type,
        data: event.data,
        source_agent_id: event.source_agent_id
      });
    }

    return syncEvent;
  }

  /**
   * Broadcast event to all subscribed agents (system → agents)
   */
  async broadcastToChannel(channelId: string, event: {
    event_type: string;
    data: any;
    source_agent_id?: string;
  }): Promise<void> {
    const subscribers = await this.pool.query(
      `SELECT agent_id FROM agent_channel_subscriptions
       WHERE channel_id = $1 AND active = true`,
      [channelId]
    );

    // In a real implementation, this would use WebSocket or SSE
    // For now, we log the broadcast event
    for (const sub of subscribers.rows) {
      console.log(`Broadcasting to agent ${sub.agent_id}:`, event);
      
      // Store event for agent retrieval
      await this.pool.query(
        `INSERT INTO agent_sync_events (channel_id, event_type, data, processed)
         VALUES ($1, $2, $3, false)`,
        [channelId, `broadcast_${event.event_type}`, { ...event.data, target_agent_id: sub.agent_id }]
      );
    }
  }

  /**
   * Get sync channel by ID
   */
  async getSyncChannel(channelId: string): Promise<SyncChannel> {
    const result = await this.pool.query(
      `SELECT * FROM agent_sync_channels WHERE channel_id = $1`,
      [channelId]
    );
    if (result.rows.length === 0) {
      throw new Error(`Sync channel not found: ${channelId}`);
    }
    return result.rows[0];
  }

  /**
   * Get events for an agent from subscribed channels
   */
  async getAgentEvents(agentId: string, processed: boolean = false): Promise<SyncEvent[]> {
    const result = await this.pool.query(
      `SELECT e.* FROM agent_sync_events e
       JOIN agent_channel_subscriptions s ON e.channel_id = s.channel_id
       WHERE s.agent_id = $1 AND e.processed = $2
       ORDER BY e.timestamp DESC
       LIMIT 100`,
      [agentId, processed]
    );
    return result.rows;
  }

  /**
   * Mark event as processed
   */
  async markEventProcessed(eventId: string): Promise<void> {
    await this.pool.query(
      `UPDATE agent_sync_events SET processed = true WHERE event_id = $1`,
      [eventId]
    );
  }

  /**
   * Create a state snapshot for an agent
   */
  async createStateSnapshot(agentId: string, stateData: any, metadata?: any): Promise<AgentStateSnapshot> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get current version
      const versionResult = await client.query(
        `SELECT COALESCE(MAX(version), 0) + 1 as next_version
         FROM agent_state_snapshots
         WHERE agent_id = $1`,
        [agentId]
      );
      const version = versionResult.rows[0].next_version;

      // Create snapshot
      const result = await client.query(
        `INSERT INTO agent_state_snapshots (agent_id, state_data, version, metadata)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [agentId, stateData, version, metadata]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get current state for an agent (latest snapshot)
   */
  async getCurrentState(agentId: string): Promise<AgentStateSnapshot | null> {
    const result = await this.pool.query(
      `SELECT * FROM agent_state_snapshots
       WHERE agent_id = $1
       ORDER BY version DESC
       LIMIT 1`,
      [agentId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get state snapshot by version
   */
  async getStateSnapshot(agentId: string, version: number): Promise<AgentStateSnapshot | null> {
    const result = await this.pool.query(
      `SELECT * FROM agent_state_snapshots
       WHERE agent_id = $1 AND version = $2`,
      [agentId, version]
    );
    return result.rows[0] || null;
  }

  /**
   * Reconcile conflicting states between agents
   */
  async reconcileStates(
    agentId: string,
    strategy: 'merge' | 'latest_wins' | 'manual',
    conflictData?: any
  ): Promise<AgentStateSnapshot> {
    const currentState = await this.getCurrentState(agentId);
    
    if (!currentState) {
      throw new Error(`No state found for agent: ${agentId}`);
    }

    let reconciledData: any;

    switch (strategy) {
      case 'latest_wins':
        // Keep current state
        reconciledData = currentState.state_data;
        break;

      case 'merge':
        // Merge conflict data with current state
        reconciledData = {
          ...currentState.state_data,
          ...conflictData,
          _reconciled_at: new Date().toISOString(),
          _strategy: 'merge'
        };
        break;

      case 'manual':
        // Use provided conflict data as-is
        reconciledData = conflictData;
        break;

      default:
        throw new Error(`Unknown reconciliation strategy: ${strategy}`);
    }

    // Create new snapshot with reconciled data
    return await this.createStateSnapshot(agentId, reconciledData, {
      reconciliation_strategy: strategy,
      previous_version: currentState.version
    });
  }

  /**
   * Propagate simulation results to agents
   */
  async propagateSimulationResults(
    simulationId: string,
    results: any,
    targetAgentIds?: string[]
  ): Promise<void> {
    // Get or create simulation channel
    let channel: SyncChannel;
    try {
      const channelResult = await this.pool.query(
        `SELECT * FROM agent_sync_channels WHERE name = $1`,
        [`simulation_${simulationId}`]
      );
      
      if (channelResult.rows.length === 0) {
        channel = await this.createSyncChannel({
          name: `simulation_${simulationId}`,
          description: 'Simulation results propagation',
          channel_type: 'broadcast',
          sync_strategy: 'immediate'
        });
      } else {
        channel = channelResult.rows[0];
      }
    } catch (error) {
      throw new Error(`Failed to setup simulation channel: ${error.message}`);
    }

    // If specific agents targeted, subscribe them
    if (targetAgentIds && targetAgentIds.length > 0) {
      for (const agentId of targetAgentIds) {
        await this.subscribeAgentToChannel(agentId, channel.channel_id);
      }
    }

    // Broadcast results
    await this.broadcastToChannel(channel.channel_id, {
      event_type: 'simulation_complete',
      data: {
        simulation_id: simulationId,
        results: results,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Get sync statistics for monitoring
   */
  async getSyncStatistics(channelId?: string): Promise<any> {
    const whereClause = channelId ? `WHERE channel_id = $1` : '';
    const params = channelId ? [channelId] : [];

    const result = await this.pool.query(
      `SELECT 
         channel_id,
         COUNT(*) as total_events,
         COUNT(*) FILTER (WHERE processed = true) as processed_events,
         COUNT(*) FILTER (WHERE processed = false) as pending_events,
         COUNT(DISTINCT source_agent_id) as unique_sources
       FROM agent_sync_events
       ${whereClause}
       GROUP BY channel_id`,
      params
    );

    return result.rows;
  }
}
