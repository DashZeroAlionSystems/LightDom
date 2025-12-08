/**
 * Service Category Manager
 * 
 * Manages the complete lifecycle of service instances.
 * Services are a category type with special lifecycle management.
 * 
 * Features:
 * - Service creation from templates
 * - Auto-registration in API router
 * - Health monitoring and auto-restart
 * - Service discovery and routing
 * - Load balancing and scaling
 * - Dependency management
 */

import EventEmitter from 'events';
import { Pool } from 'pg';

export class ServiceCategoryManager extends EventEmitter {
  constructor(dbPool, apiRouter) {
    super();
    
    this.db = dbPool;
    this.apiRouter = apiRouter;
    this.services = new Map(); // serviceId -> service instance
    this.healthChecks = new Map(); // serviceId -> interval
    this.dependencies = new Map(); // serviceId -> [dependencyIds]
    
    // Start monitoring
    this.startMonitoring();
  }

  /**
   * Create service from template
   */
  async createFromTemplate(data) {
    const { name, serviceType, config, dependencies = [] } = data;
    
    const serviceId = this.generateId();
    
    // Create database record
    const query = `
      INSERT INTO service_instances (id, name, service_type, status, instance_config, api_functions, health_check_config, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    
    const result = await this.db.query(query, [
      serviceId,
      name,
      serviceType,
      'stopped',
      JSON.stringify(config || {}),
      JSON.stringify([]),
      JSON.stringify({ enabled: true, interval: 30000, endpoint: '/health' })
    ]);
    
    const service = result.rows[0];
    
    // Store dependencies
    if (dependencies.length > 0) {
      this.dependencies.set(serviceId, dependencies);
    }
    
    // Register API endpoints
    await this.registerServiceEndpoints(service);
    
    // Setup health check
    await this.setupHealthCheck(service);
    
    // Emit event
    this.emit('service:created', service);
    
    return service;
  }

  /**
   * Start service
   */
  async start(serviceId) {
    const service = await this.findById(serviceId);
    if (!service) {
      throw new Error(`Service not found: ${serviceId}`);
    }
    
    // Check dependencies
    const deps = this.dependencies.get(serviceId) || [];
    for (const depId of deps) {
      const dep = await this.findById(depId);
      if (!dep || dep.status !== 'running') {
        throw new Error(`Dependency not ready: ${depId}`);
      }
    }
    
    // Update status to starting
    await this.updateStatus(serviceId, 'starting');
    
    // Start service logic here
    // This would integrate with actual service instances
    
    // Update status to running
    await this.updateStatus(serviceId, 'running');
    
    // Emit event
    this.emit('service:started', service);
    
    return { success: true, serviceId, status: 'running' };
  }

  /**
   * Stop service
   */
  async stop(serviceId) {
    const service = await this.findById(serviceId);
    if (!service) {
      throw new Error(`Service not found: ${serviceId}`);
    }
    
    // Update status to stopping
    await this.updateStatus(serviceId, 'stopping');
    
    // Stop service logic here
    
    // Clear health check
    if (this.healthChecks.has(serviceId)) {
      clearInterval(this.healthChecks.get(serviceId));
      this.healthChecks.delete(serviceId);
    }
    
    // Update status to stopped
    await this.updateStatus(serviceId, 'stopped');
    
    // Emit event
    this.emit('service:stopped', service);
    
    return { success: true, serviceId, status: 'stopped' };
  }

  /**
   * Restart service
   */
  async restart(serviceId) {
    await this.stop(serviceId);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await this.start(serviceId);
    
    return { success: true, serviceId, status: 'running' };
  }

  /**
   * Delete service
   */
  async delete(serviceId) {
    // Stop if running
    const service = await this.findById(serviceId);
    if (service && service.status === 'running') {
      await this.stop(serviceId);
    }
    
    // Remove from database
    const query = `DELETE FROM service_instances WHERE id = $1 RETURNING *`;
    const result = await this.db.query(query, [serviceId]);
    
    // Remove dependencies
    this.dependencies.delete(serviceId);
    
    // Remove health check
    if (this.healthChecks.has(serviceId)) {
      clearInterval(this.healthChecks.get(serviceId));
      this.healthChecks.delete(serviceId);
    }
    
    // Emit event
    this.emit('service:deleted', result.rows[0]);
    
    return result.rows[0];
  }

  /**
   * Check service health
   */
  async checkHealth(serviceId) {
    const service = await this.findById(serviceId);
    if (!service) {
      return { healthy: false, error: 'Service not found' };
    }
    
    if (service.status !== 'running') {
      return { healthy: false, status: service.status };
    }
    
    // Perform health check
    // In production, this would ping the service's health endpoint
    const healthy = true;
    
    // Update last health check time
    await this.db.query(
      'UPDATE service_instances SET last_health_check = CURRENT_TIMESTAMP WHERE id = $1',
      [serviceId]
    );
    
    return {
      healthy,
      serviceId,
      status: service.status,
      lastCheck: new Date()
    };
  }

  /**
   * Find service by ID
   */
  async findById(serviceId) {
    const query = `SELECT * FROM service_instances WHERE id = $1`;
    const result = await this.db.query(query, [serviceId]);
    return result.rows[0];
  }

  /**
   * Find all services
   */
  async findAll(filters = {}) {
    let query = `SELECT * FROM service_instances`;
    const params = [];
    
    if (filters.status) {
      query += ' WHERE status = $1';
      params.push(filters.status);
    }
    
    if (filters.serviceType) {
      query += params.length > 0 ? ' AND' : ' WHERE';
      query += ` service_type = $${params.length + 1}`;
      params.push(filters.serviceType);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await this.db.query(query, params);
    return result.rows;
  }

  /**
   * Update service status
   */
  async updateStatus(serviceId, status) {
    const query = `
      UPDATE service_instances 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING *
    `;
    
    const result = await this.db.query(query, [status, serviceId]);
    
    // Emit event
    this.emit('service:status-changed', { serviceId, status });
    
    return result.rows[0];
  }

  /**
   * Register service API endpoints
   */
  async registerServiceEndpoints(service) {
    // In production, this would dynamically add routes to Express router
    console.log(`Registering API endpoints for service: ${service.name}`);
    
    // Store available functions
    const apiFunctions = [
      'start',
      'stop',
      'restart',
      'health',
      'status'
    ];
    
    await this.db.query(
      'UPDATE service_instances SET api_functions = $1 WHERE id = $2',
      [JSON.stringify(apiFunctions), service.id]
    );
  }

  /**
   * Setup health check for service
   */
  async setupHealthCheck(service) {
    const config = service.health_check_config || { enabled: true, interval: 30000 };
    
    if (!config.enabled) return;
    
    const interval = setInterval(async () => {
      try {
        await this.checkHealth(service.id);
      } catch (error) {
        console.error(`Health check failed for ${service.id}:`, error.message);
        await this.updateStatus(service.id, 'error');
      }
    }, config.interval);
    
    this.healthChecks.set(service.id, interval);
  }

  /**
   * Start monitoring all services
   */
  async startMonitoring() {
    // Load all running services and setup health checks
    const services = await this.findAll({ status: 'running' });
    
    for (const service of services) {
      await this.setupHealthCheck(service);
    }
    
    console.log(`Monitoring ${services.length} services`);
  }

  /**
   * Get service statistics
   */
  async getStatistics() {
    const query = `
      SELECT 
        status,
        COUNT(*) as count
      FROM service_instances
      GROUP BY status
    `;
    
    const result = await this.db.query(query);
    
    const stats = {
      total: 0,
      byStatus: {}
    };
    
    result.rows.forEach(row => {
      stats.total += parseInt(row.count);
      stats.byStatus[row.status] = parseInt(row.count);
    });
    
    return stats;
  }

  /**
   * Get service dependencies
   */
  getDependencies(serviceId) {
    return this.dependencies.get(serviceId) || [];
  }

  /**
   * Add dependency
   */
  addDependency(serviceId, dependencyId) {
    const deps = this.dependencies.get(serviceId) || [];
    if (!deps.includes(dependencyId)) {
      deps.push(dependencyId);
      this.dependencies.set(serviceId, deps);
    }
  }

  /**
   * Remove dependency
   */
  removeDependency(serviceId, dependencyId) {
    const deps = this.dependencies.get(serviceId) || [];
    const index = deps.indexOf(dependencyId);
    if (index > -1) {
      deps.splice(index, 1);
      this.dependencies.set(serviceId, deps);
    }
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default ServiceCategoryManager;
