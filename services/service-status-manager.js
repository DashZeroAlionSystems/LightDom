/**
 * Service Status Manager
 * 
 * Manages and tracks service status for the LightDom platform
 * Formats status messages as: [campaign][service][servicename] - [error level] - message
 */

import { EventEmitter } from 'events';

export class ServiceStatusManager extends EventEmitter {
  constructor() {
    super();
    this.services = new Map();
    this.requiredServices = new Map();
  }

  /**
   * Register a service with its requirements
   */
  registerService(config) {
    const {
      id,
      name,
      category,
      campaign = 'workflow',
      healthCheckFn,
      requiredFor = [],
      dependencies = []
    } = config;

    this.services.set(id, {
      id,
      name,
      category,
      campaign,
      status: 'unknown',
      lastCheck: null,
      healthCheckFn,
      requiredFor,
      dependencies,
      message: null,
      error: null
    });

    // Track which features require which services
    for (const feature of requiredFor) {
      if (!this.requiredServices.has(feature)) {
        this.requiredServices.set(feature, []);
      }
      this.requiredServices.get(feature).push(id);
    }

    return this;
  }

  /**
   * Check health of a specific service
   */
  async checkService(serviceId) {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service not found: ${serviceId}`);
    }

    try {
      const result = await service.healthCheckFn();
      const level = result.healthy ? 'info' : 'error';
      const message = this.formatMessage(service.campaign, service.category, service.name, level, result.message);

      service.status = result.healthy ? 'running' : 'stopped';
      service.lastCheck = new Date();
      service.message = message;
      service.error = result.error || null;

      this.emit('service-status-change', {
        serviceId,
        status: service.status,
        message
      });

      return {
        id: serviceId,
        name: service.name,
        status: service.status,
        message,
        lastCheck: service.lastCheck,
        requiredFor: service.requiredFor
      };
    } catch (error) {
      const message = this.formatMessage(
        service.campaign,
        service.category,
        service.name,
        'error',
        error.message
      );

      service.status = 'error';
      service.lastCheck = new Date();
      service.message = message;
      service.error = error.message;

      this.emit('service-status-change', {
        serviceId,
        status: 'error',
        message
      });

      return {
        id: serviceId,
        name: service.name,
        status: 'error',
        message,
        lastCheck: service.lastCheck,
        requiredFor: service.requiredFor,
        error: error.message
      };
    }
  }

  /**
   * Check all registered services
   */
  async checkAllServices() {
    const results = await Promise.allSettled(
      Array.from(this.services.keys()).map(id => this.checkService(id))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const serviceId = Array.from(this.services.keys())[index];
        const service = this.services.get(serviceId);
        return {
          id: serviceId,
          name: service.name,
          status: 'error',
          message: this.formatMessage(
            service.campaign,
            service.category,
            service.name,
            'error',
            result.reason.message
          ),
          error: result.reason.message
        };
      }
    });
  }

  /**
   * Get status of services required for a feature
   */
  async getServicesForFeature(feature) {
    const serviceIds = this.requiredServices.get(feature) || [];
    const statuses = await Promise.all(
      serviceIds.map(id => this.getServiceStatus(id))
    );

    const allHealthy = statuses.every(s => s.status === 'running');
    
    return {
      feature,
      available: allHealthy,
      services: statuses,
      message: allHealthy 
        ? `All required services for ${feature} are running`
        : `Some services required for ${feature} are not available`
    };
  }

  /**
   * Get current status of a service (cached)
   */
  async getServiceStatus(serviceId) {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service not found: ${serviceId}`);
    }

    // If never checked or last check was more than 5 minutes ago, check again
    if (!service.lastCheck || (Date.now() - service.lastCheck.getTime()) > 300000) {
      return await this.checkService(serviceId);
    }

    return {
      id: serviceId,
      name: service.name,
      status: service.status,
      message: service.message,
      lastCheck: service.lastCheck,
      requiredFor: service.requiredFor,
      error: service.error
    };
  }

  /**
   * Get all service statuses
   */
  async getAllStatuses(forceRefresh = false) {
    if (forceRefresh) {
      return await this.checkAllServices();
    }

    return await Promise.all(
      Array.from(this.services.keys()).map(id => this.getServiceStatus(id))
    );
  }

  /**
   * Get services grouped by campaign
   */
  async getServicesByCampaign() {
    const statuses = await this.getAllStatuses();
    const byCampaign = {};

    for (const status of statuses) {
      const service = this.services.get(status.id);
      if (!byCampaign[service.campaign]) {
        byCampaign[service.campaign] = [];
      }
      byCampaign[service.campaign].push(status);
    }

    return byCampaign;
  }

  /**
   * Format status message according to the specified format
   * Format: [campaign][service][servicename] - [error level] - message
   */
  formatMessage(campaign, category, serviceName, level, message) {
    return `[${campaign}][${category}][${serviceName}] - ${level} - ${message}`;
  }

  /**
   * Start monitoring services at regular interval
   */
  startMonitoring(intervalMs = 60000) {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      await this.checkAllServices();
    }, intervalMs);

    // Do initial check
    this.checkAllServices();

    return this;
  }

  /**
   * Stop monitoring services
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    return this;
  }

  /**
   * Get feature availability map
   */
  async getFeatureAvailability() {
    const features = Array.from(this.requiredServices.keys());
    const availability = {};

    for (const feature of features) {
      const featureStatus = await this.getServicesForFeature(feature);
      availability[feature] = featureStatus;
    }

    return availability;
  }
}

export default ServiceStatusManager;
