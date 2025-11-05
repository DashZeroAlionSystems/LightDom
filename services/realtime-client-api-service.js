/**
 * Real-Time Client API Service
 * 
 * Provides two-way communication between LightDom server and client sites.
 * Enables live monitoring, real-time optimization, and self-generating content delivery.
 * 
 * Features:
 * - WebSocket/SSE bidirectional communication
 * - Live site monitoring and metrics
 * - Real-time DOM updates and optimization
 * - Self-generating content streaming
 * - Multi-site orchestration
 * - Staging/production environment sync
 */

import { EventEmitter } from 'events';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

export class RealTimeClientAPIService extends EventEmitter {
  constructor(httpServer, options = {}) {
    super();
    
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: options.allowedOrigins || '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      ...options.socketIO
    });
    
    this.connectedClients = new Map(); // clientId -> clientInfo
    this.siteMonitors = new Map(); // siteId -> monitorData
    this.contentStreams = new Map(); // streamId -> streamInfo
    
    this.config = {
      heartbeatInterval: options.heartbeatInterval || 30000,
      maxConnectionsPerSite: options.maxConnectionsPerSite || 100,
      enableMetrics: options.enableMetrics !== false,
      enableOptimization: options.enableOptimization !== false,
      enableContentGeneration: options.enableContentGeneration !== false,
      ...options
    };
    
    this.setupSocketHandlers();
    this.startHeartbeat();
  }

  /**
   * Setup Socket.IO event handlers
   */
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);
      
      // Handle client registration
      socket.on('client:register', (data) => this.handleClientRegister(socket, data));
      
      // Handle site metrics
      socket.on('metrics:send', (data) => this.handleMetrics(socket, data));
      
      // Handle optimization requests
      socket.on('optimization:request', (data) => this.handleOptimizationRequest(socket, data));
      
      // Handle content requests
      socket.on('content:request', (data) => this.handleContentRequest(socket, data));
      
      // Handle DOM updates
      socket.on('dom:update', (data) => this.handleDOMUpdate(socket, data));
      
      // Handle pattern detection
      socket.on('pattern:detect', (data) => this.handlePatternDetection(socket, data));
      
      // Handle staging sync
      socket.on('staging:sync', (data) => this.handleStagingSync(socket, data));
      
      // Handle disconnection
      socket.on('disconnect', () => this.handleDisconnect(socket));
      
      // Handle errors
      socket.on('error', (error) => this.handleSocketError(socket, error));
    });
  }

  /**
   * Handle client registration
   */
  handleClientRegister(socket, data) {
    const clientInfo = {
      id: socket.id,
      siteId: data.siteId,
      siteDomain: data.siteDomain,
      environment: data.environment || 'production', // production | staging
      version: data.version,
      capabilities: data.capabilities || [],
      connectedAt: Date.now(),
      lastHeartbeat: Date.now(),
      metrics: {
        pageViews: 0,
        optimizationsApplied: 0,
        contentGenerated: 0,
        errors: 0
      }
    };
    
    this.connectedClients.set(socket.id, clientInfo);
    
    // Initialize site monitor if not exists
    if (!this.siteMonitors.has(data.siteId)) {
      this.siteMonitors.set(data.siteId, {
        siteId: data.siteId,
        domains: new Set([data.siteDomain]),
        clients: new Set([socket.id]),
        production: new Set(),
        staging: new Set(),
        metrics: {
          totalPageViews: 0,
          avgLoadTime: 0,
          optimizationScore: 0,
          lastUpdate: Date.now()
        }
      });
    }
    
    const monitor = this.siteMonitors.get(data.siteId);
    monitor.clients.add(socket.id);
    monitor[data.environment].add(socket.id);
    
    // Send welcome message
    socket.emit('client:registered', {
      clientId: socket.id,
      serverTime: Date.now(),
      config: this.getClientConfig(clientInfo)
    });
    
    // Notify other clients
    this.broadcastToSite(data.siteId, 'site:client:connected', {
      clientId: socket.id,
      environment: data.environment,
      domain: data.siteDomain
    }, socket.id);
    
    console.log(`✅ Client registered: ${data.siteDomain} (${data.environment})`);
    this.emit('client:registered', clientInfo);
  }

  /**
   * Handle site metrics
   */
  handleMetrics(socket, data) {
    const client = this.connectedClients.get(socket.id);
    if (!client) return;
    
    // Update client metrics
    client.metrics = {
      ...client.metrics,
      ...data.metrics,
      lastUpdate: Date.now()
    };
    
    // Update site monitor
    const monitor = this.siteMonitors.get(client.siteId);
    if (monitor) {
      monitor.metrics = {
        totalPageViews: monitor.metrics.totalPageViews + (data.metrics.pageViews || 0),
        avgLoadTime: this.calculateAvgLoadTime(monitor, data.metrics.loadTime),
        optimizationScore: data.metrics.optimizationScore || monitor.metrics.optimizationScore,
        lastUpdate: Date.now()
      };
      
      // Broadcast metrics to monitoring dashboard
      this.io.to(`monitor:${client.siteId}`).emit('site:metrics:update', {
        siteId: client.siteId,
        metrics: monitor.metrics,
        client: {
          id: socket.id,
          domain: client.siteDomain,
          environment: client.environment
        }
      });
    }
    
    this.emit('metrics:received', {
      clientId: socket.id,
      siteId: client.siteId,
      metrics: data.metrics
    });
  }

  /**
   * Handle optimization request from client
   */
  async handleOptimizationRequest(socket, data) {
    const client = this.connectedClients.get(socket.id);
    if (!client) return;
    
    console.log(`🔧 Optimization request from ${client.siteDomain}`);
    
    try {
      // Emit event for optimization engine to handle
      const optimizationId = uuidv4();
      
      this.emit('optimization:requested', {
        id: optimizationId,
        clientId: socket.id,
        siteId: client.siteId,
        domain: client.siteDomain,
        data: data.domAnalysis || {},
        options: data.options || {}
      });
      
      // Send acknowledgment
      socket.emit('optimization:queued', {
        optimizationId,
        estimatedTime: 5000 // 5 seconds
      });
      
    } catch (error) {
      socket.emit('optimization:error', {
        error: error.message
      });
    }
  }

  /**
   * Send optimization result to client
   */
  sendOptimizationResult(clientId, optimizationData) {
    const socket = this.io.sockets.sockets.get(clientId);
    if (!socket) return;
    
    const client = this.connectedClients.get(clientId);
    if (client) {
      client.metrics.optimizationsApplied++;
    }
    
    socket.emit('optimization:result', optimizationData);
    
    console.log(`✅ Optimization sent to ${client?.siteDomain}`);
  }

  /**
   * Handle content request
   */
  async handleContentRequest(socket, data) {
    const client = this.connectedClients.get(socket.id);
    if (!client) return;
    
    console.log(`📄 Content request from ${client.siteDomain}: ${data.contentType}`);
    
    try {
      const streamId = uuidv4();
      
      // Create content stream
      this.contentStreams.set(streamId, {
        id: streamId,
        clientId: socket.id,
        siteId: client.siteId,
        contentType: data.contentType,
        parameters: data.parameters || {},
        startedAt: Date.now(),
        status: 'active'
      });
      
      // Emit event for content generator
      this.emit('content:requested', {
        streamId,
        clientId: socket.id,
        siteId: client.siteId,
        contentType: data.contentType,
        parameters: data.parameters
      });
      
      // Send stream started
      socket.emit('content:stream:started', {
        streamId,
        contentType: data.contentType
      });
      
    } catch (error) {
      socket.emit('content:error', {
        error: error.message
      });
    }
  }

  /**
   * Stream content chunk to client
   */
  streamContentChunk(streamId, chunk) {
    const stream = this.contentStreams.get(streamId);
    if (!stream || stream.status !== 'active') return;
    
    const socket = this.io.sockets.sockets.get(stream.clientId);
    if (!socket) return;
    
    socket.emit('content:chunk', {
      streamId,
      chunk,
      timestamp: Date.now()
    });
  }

  /**
   * Complete content stream
   */
  completeContentStream(streamId, metadata) {
    const stream = this.contentStreams.get(streamId);
    if (!stream) return;
    
    stream.status = 'completed';
    stream.completedAt = Date.now();
    
    const socket = this.io.sockets.sockets.get(stream.clientId);
    if (socket) {
      socket.emit('content:stream:complete', {
        streamId,
        metadata,
        duration: stream.completedAt - stream.startedAt
      });
      
      const client = this.connectedClients.get(stream.clientId);
      if (client) {
        client.metrics.contentGenerated++;
      }
    }
    
    // Clean up old stream after delay
    setTimeout(() => this.contentStreams.delete(streamId), 60000);
  }

  /**
   * Handle DOM update from client
   */
  handleDOMUpdate(socket, data) {
    const client = this.connectedClients.get(socket.id);
    if (!client) return;
    
    this.emit('dom:updated', {
      clientId: socket.id,
      siteId: client.siteId,
      update: data
    });
    
    // Optionally broadcast to other clients in staging
    if (client.environment === 'staging') {
      this.broadcastToEnvironment(client.siteId, 'staging', 'dom:update:sync', data, socket.id);
    }
  }

  /**
   * Handle pattern detection
   */
  handlePatternDetection(socket, data) {
    const client = this.connectedClients.get(socket.id);
    if (!client) return;
    
    console.log(`🔍 Pattern detected on ${client.siteDomain}`);
    
    this.emit('pattern:detected', {
      clientId: socket.id,
      siteId: client.siteId,
      pattern: data
    });
    
    // Broadcast to monitoring dashboard
    this.io.to(`monitor:${client.siteId}`).emit('site:pattern:detected', {
      siteId: client.siteId,
      client: client.siteDomain,
      pattern: data
    });
  }

  /**
   * Handle staging/production sync
   */
  handleStagingSync(socket, data) {
    const client = this.connectedClients.get(socket.id);
    if (!client) return;
    
    const monitor = this.siteMonitors.get(client.siteId);
    if (!monitor) return;
    
    // Sync data between staging and production
    const targetEnv = data.targetEnvironment || 'production';
    const targetClients = monitor[targetEnv];
    
    targetClients.forEach(clientId => {
      if (clientId !== socket.id) {
        const targetSocket = this.io.sockets.sockets.get(clientId);
        if (targetSocket) {
          targetSocket.emit('staging:sync:received', {
            sourceEnvironment: client.environment,
            data: data.syncData,
            timestamp: Date.now()
          });
        }
      }
    });
    
    console.log(`🔄 Synced data from ${client.environment} to ${targetEnv}`);
  }

  /**
   * Handle client disconnect
   */
  handleDisconnect(socket) {
    const client = this.connectedClients.get(socket.id);
    if (!client) return;
    
    console.log(`🔌 Client disconnected: ${client.siteDomain}`);
    
    // Remove from site monitor
    const monitor = this.siteMonitors.get(client.siteId);
    if (monitor) {
      monitor.clients.delete(socket.id);
      monitor[client.environment].delete(socket.id);
      
      // Notify other clients
      this.broadcastToSite(client.siteId, 'site:client:disconnected', {
        clientId: socket.id,
        environment: client.environment,
        domain: client.siteDomain
      });
    }
    
    this.connectedClients.delete(socket.id);
    this.emit('client:disconnected', client);
  }

  /**
   * Handle socket errors
   */
  handleSocketError(socket, error) {
    console.error(`Socket error for ${socket.id}:`, error);
    
    const client = this.connectedClients.get(socket.id);
    if (client) {
      client.metrics.errors++;
    }
  }

  /**
   * Start heartbeat monitoring
   */
  startHeartbeat() {
    setInterval(() => {
      const now = Date.now();
      
      this.connectedClients.forEach((client, clientId) => {
        const socket = this.io.sockets.sockets.get(clientId);
        if (socket) {
          socket.emit('heartbeat', { serverTime: now });
          
          // Check for stale connections
          if (now - client.lastHeartbeat > this.config.heartbeatInterval * 3) {
            console.warn(`⚠️  Stale connection detected: ${client.siteDomain}`);
            socket.disconnect(true);
          }
        }
      });
    }, this.config.heartbeatInterval);
  }

  /**
   * Broadcast message to all clients of a site
   */
  broadcastToSite(siteId, event, data, excludeClientId = null) {
    const monitor = this.siteMonitors.get(siteId);
    if (!monitor) return;
    
    monitor.clients.forEach(clientId => {
      if (clientId !== excludeClientId) {
        const socket = this.io.sockets.sockets.get(clientId);
        if (socket) {
          socket.emit(event, data);
        }
      }
    });
  }

  /**
   * Broadcast to specific environment (staging/production)
   */
  broadcastToEnvironment(siteId, environment, event, data, excludeClientId = null) {
    const monitor = this.siteMonitors.get(siteId);
    if (!monitor) return;
    
    monitor[environment].forEach(clientId => {
      if (clientId !== excludeClientId) {
        const socket = this.io.sockets.sockets.get(clientId);
        if (socket) {
          socket.emit(event, data);
        }
      }
    });
  }

  /**
   * Send command to client
   */
  sendCommand(clientId, command, data) {
    const socket = this.io.sockets.sockets.get(clientId);
    if (!socket) {
      throw new Error(`Client ${clientId} not connected`);
    }
    
    socket.emit('command', {
      type: command,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get client configuration
   */
  getClientConfig(clientInfo) {
    return {
      enableMetrics: this.config.enableMetrics,
      enableOptimization: this.config.enableOptimization,
      enableContentGeneration: this.config.enableContentGeneration,
      heartbeatInterval: this.config.heartbeatInterval,
      features: {
        realTimeOptimization: true,
        contentStreaming: true,
        stagingSync: clientInfo.environment === 'staging',
        patternDetection: true
      }
    };
  }

  /**
   * Calculate average load time
   */
  calculateAvgLoadTime(monitor, newLoadTime) {
    if (!monitor.metrics.avgLoadTime) {
      return newLoadTime || 0;
    }
    
    // Weighted average
    return (monitor.metrics.avgLoadTime * 0.9 + (newLoadTime || 0) * 0.1);
  }

  /**
   * Get connected clients
   */
  getConnectedClients(siteId = null) {
    if (siteId) {
      const clients = [];
      this.connectedClients.forEach(client => {
        if (client.siteId === siteId) {
          clients.push(client);
        }
      });
      return clients;
    }
    
    return Array.from(this.connectedClients.values());
  }

  /**
   * Get site monitor data
   */
  getSiteMonitor(siteId) {
    const monitor = this.siteMonitors.get(siteId);
    if (!monitor) return null;
    
    return {
      ...monitor,
      domains: Array.from(monitor.domains),
      clients: Array.from(monitor.clients),
      production: Array.from(monitor.production),
      staging: Array.from(monitor.staging)
    };
  }

  /**
   * Get all site monitors
   */
  getAllSiteMonitors() {
    const monitors = [];
    this.siteMonitors.forEach((monitor, siteId) => {
      monitors.push(this.getSiteMonitor(siteId));
    });
    return monitors;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      connectedClients: this.connectedClients.size,
      activeSites: this.siteMonitors.size,
      activeStreams: this.contentStreams.size,
      environments: {
        production: Array.from(this.connectedClients.values())
          .filter(c => c.environment === 'production').length,
        staging: Array.from(this.connectedClients.values())
          .filter(c => c.environment === 'staging').length
      },
      totalMetrics: {
        pageViews: Array.from(this.connectedClients.values())
          .reduce((sum, c) => sum + c.metrics.pageViews, 0),
        optimizations: Array.from(this.connectedClients.values())
          .reduce((sum, c) => sum + c.metrics.optimizationsApplied, 0),
        contentGenerated: Array.from(this.connectedClients.values())
          .reduce((sum, c) => sum + c.metrics.contentGenerated, 0)
      }
    };
  }

  /**
   * Shutdown service
   */
  async shutdown() {
    console.log('🛑 Shutting down Real-Time Client API Service...');
    
    // Notify all clients
    this.io.emit('server:shutdown', {
      message: 'Server is shutting down',
      timestamp: Date.now()
    });
    
    // Wait for notifications to send
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Close all connections
    this.io.close();
    
    console.log('✅ Real-Time Client API Service shut down');
  }
}

export default RealTimeClientAPIService;
