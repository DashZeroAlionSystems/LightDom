/**
 * Bidirectional Health Check Service
 * 
 * Real-time bidirectional health monitoring with WebSocket streaming
 * - Monitors all services defined in service-dependencies.json
 * - Validates service health before API consumption
 * - Streams health status updates in real-time
 * - Checks sub-service dependencies based on configuration
 * 
 * @module services/bidirectional-health-check
 */

import { EventEmitter } from 'events';
import axios from 'axios';
import { WebSocketServer } from 'ws';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class BidirectionalHealthCheckService extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      configPath: config.configPath || path.join(process.cwd(), 'config', 'service-dependencies.json'),
      wsPort: config.wsPort || 3002,
      checkInterval: config.checkInterval || 30000,
      enableBidirectionalStream: config.enableBidirectionalStream !== false,
      ...config,
    };
    
    this.serviceConfig = null;
    this.healthStatus = new Map();
    this.wsServer = null;
    this.wsClients = new Set();
    this.checkIntervals = new Map();
    this.isRunning = false;
  }
  
  /**
   * Initialize the health check service
   */
  async initialize() {
    console.log('🏥 Initializing Bidirectional Health Check Service...');
    
    // Load service configuration
    await this.loadServiceConfig();
    
    // Start WebSocket server if enabled
    if (this.config.enableBidirectionalStream) {
      await this.startWebSocketServer();
    }
    
    // Initialize health status for all services
    this.initializeHealthStatus();
    
    // Start health checks
    this.startHealthChecks();
    
    this.isRunning = true;
    console.log('✅ Health Check Service initialized');
    
    this.emit('initialized');
    
    return this;
  }
  
  /**
   * Load service configuration from JSON
   */
  async loadServiceConfig() {
    try {
      const configData = await fs.readFile(this.config.configPath, 'utf-8');
      this.serviceConfig = JSON.parse(configData);
      console.log(`📋 Loaded configuration for ${Object.keys(this.serviceConfig.services).length} services`);
    } catch (error) {
      console.error('Failed to load service configuration:', error);
      throw error;
    }
  }
  
  /**
   * Initialize health status tracking
   */
  initializeHealthStatus() {
    for (const [serviceId, serviceInfo] of Object.entries(this.serviceConfig.services)) {
      this.healthStatus.set(serviceId, {
        service: serviceId,
        name: serviceInfo.name,
        status: 'unknown',
        healthy: false,
        lastCheck: null,
        lastSuccess: null,
        consecutiveFailures: 0,
        subServices: {},
        dependencies: serviceInfo.dependencies,
        required: serviceInfo.required,
      });
      
      // Initialize sub-service status
      if (serviceInfo.subServices && serviceInfo.subServices.length > 0) {
        for (const subService of serviceInfo.subServices) {
          this.healthStatus.get(serviceId).subServices[subService] = {
            status: 'unknown',
            healthy: false,
            enabled: true,
          };
        }
      }
    }
  }
  
  /**
   * Start WebSocket server for bidirectional streaming
   */
  async startWebSocketServer() {
    return new Promise((resolve) => {
      this.wsServer = new WebSocketServer({ 
        port: this.config.wsPort,
        path: '/health-stream'
      });
      
      this.wsServer.on('connection', (ws, req) => {
        console.log(`🔌 WebSocket client connected from ${req.socket.remoteAddress}`);
        this.wsClients.add(ws);
        
        // Send current health status immediately
        ws.send(JSON.stringify({
          type: 'initial',
          timestamp: new Date().toISOString(),
          services: Array.from(this.healthStatus.values()),
        }));
        
        ws.on('close', () => {
          console.log('🔌 WebSocket client disconnected');
          this.wsClients.delete(ws);
        });
        
        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.wsClients.delete(ws);
        });
        
        // Handle incoming messages (client can request immediate check)
        ws.on('message', async (message) => {
          try {
            const data = JSON.parse(message);
            if (data.type === 'check' && data.service) {
              await this.checkServiceHealth(data.service);
            } else if (data.type === 'check-all') {
              await this.checkAllServices();
            }
          } catch (error) {
            console.error('Error handling WebSocket message:', error);
          }
        });
      });
      
      this.wsServer.on('listening', () => {
        console.log(`🌐 WebSocket server listening on port ${this.config.wsPort}`);
        resolve();
      });
    });
  }
  
  /**
   * Start periodic health checks for all services
   */
  startHealthChecks() {
    for (const [serviceId, serviceInfo] of Object.entries(this.serviceConfig.services)) {
      const interval = serviceInfo.healthCheck?.interval || this.config.checkInterval;
      
      // Perform initial check immediately
      this.checkServiceHealth(serviceId);
      
      // Schedule periodic checks
      const intervalId = setInterval(() => {
        this.checkServiceHealth(serviceId);
      }, interval);
      
      this.checkIntervals.set(serviceId, intervalId);
    }
  }
  
  /**
   * Check health of a specific service
   */
  async checkServiceHealth(serviceId) {
    const serviceInfo = this.serviceConfig.services[serviceId];
    if (!serviceInfo) {
      console.warn(`Service ${serviceId} not found in configuration`);
      return;
    }
    
    const healthCheck = serviceInfo.healthCheck;
    const status = this.healthStatus.get(serviceId);
    
    status.lastCheck = new Date().toISOString();
    
    try {
      let healthy = false;
      
      if (healthCheck.endpoint) {
        // HTTP health check
        healthy = await this.performHttpHealthCheck(serviceId, healthCheck);
      } else if (healthCheck.command) {
        // Command-based health check (for containers)
        healthy = await this.performCommandHealthCheck(serviceId, healthCheck);
      }
      
      if (healthy) {
        status.status = 'healthy';
        status.healthy = true;
        status.lastSuccess = new Date().toISOString();
        status.consecutiveFailures = 0;
        
        // Check sub-services if parent is healthy
        if (serviceInfo.subServices && serviceInfo.subServices.length > 0) {
          await this.checkSubServices(serviceId);
        }
      } else {
        status.status = 'unhealthy';
        status.healthy = false;
        status.consecutiveFailures++;
      }
      
    } catch (error) {
      status.status = 'error';
      status.healthy = false;
      status.consecutiveFailures++;
      status.error = error.message;
    }
    
    // Emit event and broadcast to WebSocket clients
    this.emit('health:update', { serviceId, status });
    this.broadcastHealthUpdate(serviceId, status);
    
    return status;
  }
  
  /**
   * Perform HTTP-based health check
   */
  async performHttpHealthCheck(serviceId, healthCheck) {
    const serviceInfo = this.serviceConfig.services[serviceId];
    const url = `http://localhost:${serviceInfo.port}${healthCheck.endpoint}`;
    const timeout = healthCheck.timeout || 5000;
    const expectedStatus = healthCheck.expectedStatus || 200;
    
    try {
      const response = await axios({
        method: healthCheck.method || 'GET',
        url,
        timeout,
        validateStatus: (status) => status === expectedStatus,
      });
      
      return response.status === expectedStatus;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.debug(`Service ${serviceId} not reachable at ${url}`);
      }
      return false;
    }
  }
  
  /**
   * Perform command-based health check
   */
  async performCommandHealthCheck(serviceId, healthCheck) {
    // For command-based checks, we'd need to exec the command
    // This is a placeholder - in production, you'd use docker exec or similar
    console.debug(`Command health check for ${serviceId}: ${healthCheck.command}`);
    
    // For now, assume it's healthy if it's a database/redis and we can connect
    // This would need proper implementation with docker SDK or exec
    return true;
  }
  
  /**
   * Check sub-services based on configuration
   */
  async checkSubServices(serviceId) {
    const serviceInfo = this.serviceConfig.services[serviceId];
    const relationships = this.serviceConfig.serviceRelationships[serviceId];
    const status = this.healthStatus.get(serviceId);
    
    if (!relationships?.subServiceConditions) {
      return;
    }
    
    for (const [subServiceName, conditions] of Object.entries(relationships.subServiceConditions)) {
      // Check if all required dependencies are healthy
      const dependenciesHealthy = conditions.requires.every(depId => {
        const depStatus = this.healthStatus.get(depId);
        return depStatus && depStatus.healthy;
      });
      
      status.subServices[subServiceName] = {
        status: dependenciesHealthy ? 'healthy' : 'dependencies-unhealthy',
        healthy: dependenciesHealthy,
        enabled: conditions.enabled,
        dependencies: conditions.requires,
      };
    }
  }
  
  /**
   * Check all services
   */
  async checkAllServices() {
    const promises = [];
    
    for (const serviceId of Object.keys(this.serviceConfig.services)) {
      promises.push(this.checkServiceHealth(serviceId));
    }
    
    await Promise.all(promises);
  }
  
  /**
   * Broadcast health update to all WebSocket clients
   */
  broadcastHealthUpdate(serviceId, status) {
    if (!this.config.enableBidirectionalStream || this.wsClients.size === 0) {
      return;
    }
    
    const message = JSON.stringify({
      type: 'update',
      timestamp: new Date().toISOString(),
      serviceId,
      status,
    });
    
    this.wsClients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }
  
  /**
   * Wait for a service to be healthy
   */
  async waitForServiceHealth(serviceId, options = {}) {
    const maxWaitTime = options.maxWaitTime || 60000;
    const checkInterval = options.checkInterval || 2000;
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.checkServiceHealth(serviceId);
      
      if (status.healthy) {
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    return false;
  }
  
  /**
   * Check if it's safe to consume a service API
   */
  async canConsumeService(serviceId) {
    const serviceInfo = this.serviceConfig.services[serviceId];
    const healthCheck = serviceInfo?.healthCheck;
    
    // Check if we should validate health before consumption
    if (healthCheck?.defaults?.checkBeforeConsume) {
      const status = this.healthStatus.get(serviceId);
      
      // If we should wait for healthy and it's not healthy yet
      if (healthCheck.defaults.waitForHealthy && !status?.healthy) {
        console.log(`⏳ Waiting for ${serviceId} to be healthy...`);
        const isHealthy = await this.waitForServiceHealth(
          serviceId,
          { maxWaitTime: healthCheck.defaults.maxWaitTime }
        );
        
        if (!isHealthy) {
          throw new Error(`Service ${serviceId} failed to become healthy within timeout`);
        }
      }
      
      // Check dependencies
      if (serviceInfo.dependencies && serviceInfo.dependencies.length > 0) {
        for (const depId of serviceInfo.dependencies) {
          const depStatus = this.healthStatus.get(depId);
          if (!depStatus?.healthy) {
            throw new Error(`Service ${serviceId} dependency ${depId} is not healthy`);
          }
        }
      }
      
      return status?.healthy || false;
    }
    
    // If no health check required, assume it's safe
    return true;
  }
  
  /**
   * Get current health status for all services
   */
  getHealthStatus() {
    return {
      timestamp: new Date().toISOString(),
      services: Array.from(this.healthStatus.values()),
      summary: {
        total: this.healthStatus.size,
        healthy: Array.from(this.healthStatus.values()).filter(s => s.healthy).length,
        unhealthy: Array.from(this.healthStatus.values()).filter(s => !s.healthy && s.status !== 'unknown').length,
        unknown: Array.from(this.healthStatus.values()).filter(s => s.status === 'unknown').length,
      },
    };
  }
  
  /**
   * Get health status for a specific service
   */
  getServiceStatus(serviceId) {
    const status = this.healthStatus.get(serviceId);
    if (!status) {
      throw new Error(`Service ${serviceId} not found`);
    }
    return status;
  }
  
  /**
   * Check if sub-services should be running for a service
   */
  getRequiredSubServices(serviceId) {
    const relationships = this.serviceConfig.serviceRelationships[serviceId];
    if (!relationships?.subServiceConditions) {
      return [];
    }
    
    const required = [];
    for (const [subServiceName, conditions] of Object.entries(relationships.subServiceConditions)) {
      if (conditions.enabled) {
        required.push({
          name: subServiceName,
          dependencies: conditions.requires,
        });
      }
    }
    
    return required;
  }
  
  /**
   * Shutdown the health check service
   */
  async shutdown() {
    console.log('🛑 Shutting down Health Check Service...');
    
    this.isRunning = false;
    
    // Stop all check intervals
    for (const intervalId of this.checkIntervals.values()) {
      clearInterval(intervalId);
    }
    this.checkIntervals.clear();
    
    // Close all WebSocket connections
    if (this.wsServer) {
      this.wsClients.forEach((client) => {
        client.close();
      });
      this.wsClients.clear();
      
      this.wsServer.close();
    }
    
    console.log('✅ Health Check Service shut down');
    this.emit('shutdown');
  }
}

// Express middleware for health checks
export function createHealthCheckMiddleware(healthCheckService) {
  return async (req, res, next) => {
    const serviceId = req.headers['x-service-id'];
    
    if (!serviceId) {
      return next();
    }
    
    try {
      const canConsume = await healthCheckService.canConsumeService(serviceId);
      
      if (!canConsume) {
        return res.status(503).json({
          error: 'Service unavailable',
          message: `Service ${serviceId} is not healthy`,
          status: healthCheckService.getServiceStatus(serviceId),
        });
      }
      
      next();
    } catch (error) {
      return res.status(503).json({
        error: 'Service check failed',
        message: error.message,
      });
    }
  };
}

// Singleton instance
let healthCheckServiceInstance = null;

export function getHealthCheckService(config) {
  if (!healthCheckServiceInstance) {
    healthCheckServiceInstance = new BidirectionalHealthCheckService(config);
  }
  return healthCheckServiceInstance;
}
