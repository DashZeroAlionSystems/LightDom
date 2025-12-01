/**
 * ServiceManager - Centralized Service Registration and Lifecycle Management
 *
 * This module provides a consistent, well-structured pattern for:
 * - Service registration with dependencies
 * - Ordered initialization based on dependency graph
 * - Health checks and status monitoring
 * - Graceful shutdown in reverse dependency order
 *
 * Usage Pattern:
 * 1. Register services with their dependencies
 * 2. Call initialize() to start all services in order
 * 3. Use getService() to access initialized services
 * 4. Call shutdown() for graceful cleanup
 *
 * @module ServiceManager
 */

import { EventEmitter } from 'events';

/**
 * Service lifecycle states
 */
export type ServiceStatus =
  | 'registered'
  | 'initializing'
  | 'ready'
  | 'error'
  | 'stopping'
  | 'stopped';

/**
 * Configuration for a registered service
 */
export interface ServiceConfig {
  /** Unique identifier for the service */
  name: string;
  /** Human-readable description */
  description?: string;
  /** List of service names this service depends on */
  dependencies?: string[];
  /** Factory function that creates the service instance */
  factory: () => any | Promise<any>;
  /** Optional initialization function called after factory */
  initialize?: (instance: any) => Promise<void>;
  /** Optional health check function */
  healthCheck?: (instance: any) => Promise<HealthCheckResult>;
  /** Optional shutdown function */
  shutdown?: (instance: any) => Promise<void>;
  /** Whether this service is required for the system to function */
  required?: boolean;
  /** Tags for categorizing services */
  tags?: string[];
}

/**
 * Represents a registered service with its current state
 */
export interface RegisteredService {
  config: ServiceConfig;
  instance: any | null;
  status: ServiceStatus;
  error?: Error;
  initializedAt?: Date;
  lastHealthCheck?: Date;
  healthStatus?: HealthCheckResult;
}

/**
 * Result of a health check operation
 */
export interface HealthCheckResult {
  healthy: boolean;
  message?: string;
  details?: Record<string, any>;
  latencyMs?: number;
}

/**
 * System-wide health status
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<
    string,
    {
      status: ServiceStatus;
      healthy: boolean;
      message?: string;
    }
  >;
  timestamp: string;
}

/**
 * ServiceManager - Manages the lifecycle of all application services
 */
export class ServiceManager extends EventEmitter {
  private static instance: ServiceManager;
  private services: Map<string, RegisteredService> = new Map();
  private initializationOrder: string[] = [];
  private initialized: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
  }

  /**
   * Get the singleton instance of ServiceManager
   */
  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  /**
   * Register a service with the manager
   * @param config Service configuration
   */
  register(config: ServiceConfig): void {
    if (this.services.has(config.name)) {
      console.warn(
        `⚠️  Service '${config.name}' is already registered. Skipping.`
      );
      return;
    }

    this.services.set(config.name, {
      config,
      instance: null,
      status: 'registered',
    });

    console.log(
      `📦 Registered service: ${config.name}${config.description ? ` - ${config.description}` : ''}`
    );
    this.emit('service:registered', config.name);
  }

  /**
   * Register multiple services at once
   * @param configs Array of service configurations
   */
  registerAll(configs: ServiceConfig[]): void {
    for (const config of configs) {
      this.register(config);
    }
  }

  /**
   * Compute the initialization order based on dependencies
   * Uses topological sort to ensure dependencies are initialized first
   */
  private computeInitializationOrder(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (name: string): void => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(
          `Circular dependency detected involving service: ${name}`
        );
      }

      const service = this.services.get(name);
      if (!service) {
        const availableServices = Array.from(this.services.keys());
        console.warn(
          `⚠️  Unknown service dependency: ${name}. Available services: ${availableServices.join(', ')}`
        );
        return;
      }

      visiting.add(name);

      // Visit dependencies first
      for (const dep of service.config.dependencies || []) {
        visit(dep);
      }

      visiting.delete(name);
      visited.add(name);
      order.push(name);
    };

    // Visit all services
    for (const name of this.services.keys()) {
      visit(name);
    }

    return order;
  }

  /**
   * Initialize all registered services in dependency order
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('ServiceManager already initialized');
      return;
    }

    console.log('\n🚀 Initializing ServiceManager...\n');
    console.log('='.repeat(60));

    try {
      // Compute initialization order
      this.initializationOrder = this.computeInitializationOrder();
      console.log(
        `📋 Initialization order: ${this.initializationOrder.join(' → ')}\n`
      );

      // Initialize services in order
      for (const name of this.initializationOrder) {
        await this.initializeService(name);
      }

      this.initialized = true;
      console.log('\n' + '='.repeat(60));
      console.log('✅ All services initialized successfully!\n');
      this.emit('manager:initialized');

      // Start health check monitoring
      this.startHealthChecks(60000); // Every 60 seconds
    } catch (error) {
      console.error('\n❌ Service initialization failed:', error);
      this.emit('manager:error', error);
      throw error;
    }
  }

  /**
   * Initialize a single service
   */
  private async initializeService(name: string): Promise<void> {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not found`);
    }

    if (service.status === 'ready') {
      return; // Already initialized
    }

    console.log(`🔧 Initializing: ${name}...`);
    service.status = 'initializing';
    this.emit('service:initializing', name);

    try {
      // Check if dependencies are ready
      for (const dep of service.config.dependencies || []) {
        const depService = this.services.get(dep);
        if (!depService || depService.status !== 'ready') {
          throw new Error(
            `Dependency '${dep}' is not ready for service '${name}'`
          );
        }
      }

      // Create the service instance
      const instance = await service.config.factory();
      service.instance = instance;

      // Run custom initialization if provided
      if (service.config.initialize) {
        await service.config.initialize(instance);
      }

      service.status = 'ready';
      service.initializedAt = new Date();
      console.log(`   ✅ ${name} ready`);
      this.emit('service:ready', name, instance);
    } catch (error) {
      service.status = 'error';
      service.error = error as Error;
      console.error(`   ❌ ${name} failed:`, (error as Error).message);
      this.emit('service:error', name, error);

      // If the service is marked as required (default is true), throw the error
      const isRequired = service.config.required !== false;
      if (isRequired) {
        throw error;
      }
    }
  }

  /**
   * Get a service instance by name
   * @param name Service name
   * @returns The service instance or null if not found/ready
   */
  getService<T = any>(name: string): T | null {
    const service = this.services.get(name);
    if (!service || service.status !== 'ready') {
      return null;
    }
    return service.instance as T;
  }

  /**
   * Get a service instance, throwing if not available
   * @param name Service name
   * @returns The service instance
   * @throws Error if service is not available
   */
  requireService<T = any>(name: string): T {
    const instance = this.getService<T>(name);
    if (!instance) {
      throw new Error(
        `Required service '${name}' is not available. Status: ${this.services.get(name)?.status || 'not registered'}`
      );
    }
    return instance;
  }

  /**
   * Check if a service is ready
   */
  isServiceReady(name: string): boolean {
    const service = this.services.get(name);
    return service?.status === 'ready';
  }

  /**
   * Get the status of a service
   */
  getServiceStatus(name: string): ServiceStatus | undefined {
    return this.services.get(name)?.status;
  }

  /**
   * Get all registered service names
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Get all ready service names
   */
  getReadyServices(): string[] {
    return Array.from(this.services.entries())
      .filter(([_, service]) => service.status === 'ready')
      .map(([name, _]) => name);
  }

  /**
   * Perform health check on a single service
   */
  async checkServiceHealth(name: string): Promise<HealthCheckResult> {
    const service = this.services.get(name);
    if (!service) {
      return { healthy: false, message: 'Service not found' };
    }

    if (service.status !== 'ready') {
      return { healthy: false, message: `Service status: ${service.status}` };
    }

    if (!service.config.healthCheck) {
      // No health check defined, assume healthy if ready
      return { healthy: true, message: 'No health check defined' };
    }

    const startTime = Date.now();
    try {
      const result = await service.config.healthCheck(service.instance);
      result.latencyMs = Date.now() - startTime;
      service.lastHealthCheck = new Date();
      service.healthStatus = result;
      return result;
    } catch (error) {
      const result: HealthCheckResult = {
        healthy: false,
        message: (error as Error).message,
        latencyMs: Date.now() - startTime,
      };
      service.lastHealthCheck = new Date();
      service.healthStatus = result;
      return result;
    }
  }

  /**
   * Perform health check on all services
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const services: SystemHealth['services'] = {};
    let allHealthy = true;
    let anyHealthy = false;

    for (const [name, service] of this.services) {
      if (service.status !== 'ready') {
        services[name] = {
          status: service.status,
          healthy: false,
          message: service.error?.message,
        };
        allHealthy = false;
        continue;
      }

      const health = await this.checkServiceHealth(name);
      services[name] = {
        status: service.status,
        healthy: health.healthy,
        message: health.message,
      };

      if (health.healthy) {
        anyHealthy = true;
      } else {
        allHealthy = false;
      }
    }

    return {
      status: allHealthy ? 'healthy' : anyHealthy ? 'degraded' : 'unhealthy',
      services,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(intervalMs: number): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      const health = await this.getSystemHealth();
      if (health.status !== 'healthy') {
        console.warn(`⚠️  System health: ${health.status}`);
        this.emit('health:degraded', health);
      }
    }, intervalMs);
  }

  /**
   * Stop periodic health checks
   */
  private stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Shutdown all services in reverse dependency order
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    console.log('\n🛑 Shutting down ServiceManager...\n');

    // Stop health checks
    this.stopHealthChecks();

    // Shutdown in reverse order
    const shutdownOrder = [...this.initializationOrder].reverse();

    for (const name of shutdownOrder) {
      const service = this.services.get(name);
      if (!service || service.status !== 'ready') {
        continue;
      }

      console.log(`   🔄 Stopping: ${name}...`);
      service.status = 'stopping';
      this.emit('service:stopping', name);

      try {
        if (service.config.shutdown) {
          await service.config.shutdown(service.instance);
        }
        service.status = 'stopped';
        console.log(`   ✅ ${name} stopped`);
        this.emit('service:stopped', name);
      } catch (error) {
        console.error(`   ❌ Error stopping ${name}:`, error);
        service.status = 'error';
        service.error = error as Error;
      }
    }

    this.initialized = false;
    console.log('\n✅ ServiceManager shutdown complete\n');
    this.emit('manager:shutdown');
  }

  /**
   * Get a summary of all services and their states
   */
  getSummary(): Record<
    string,
    {
      status: ServiceStatus;
      dependencies: string[];
      tags: string[];
      initializedAt?: Date;
      error?: string;
    }
  > {
    const summary: Record<string, any> = {};

    for (const [name, service] of this.services) {
      summary[name] = {
        status: service.status,
        dependencies: service.config.dependencies || [],
        tags: service.config.tags || [],
        initializedAt: service.initializedAt,
        error: service.error?.message,
      };
    }

    return summary;
  }

  /**
   * Print a formatted status report to console
   */
  printStatus(): void {
    console.log('\n📊 Service Status Report\n');
    console.log('='.repeat(60));

    const byStatus: Record<string, string[]> = {};

    for (const [name, service] of this.services) {
      const status = service.status;
      if (!byStatus[status]) {
        byStatus[status] = [];
      }
      byStatus[status].push(name);
    }

    const statusIcons: Record<ServiceStatus, string> = {
      registered: '📝',
      initializing: '🔧',
      ready: '✅',
      error: '❌',
      stopping: '🔄',
      stopped: '⏹️',
    };

    for (const [status, names] of Object.entries(byStatus)) {
      const icon = statusIcons[status as ServiceStatus] || '❓';
      console.log(`${icon} ${status.toUpperCase()}: ${names.join(', ')}`);
    }

    console.log('='.repeat(60));
    console.log(
      `Total: ${this.services.size} services | Ready: ${this.getReadyServices().length}`
    );
    console.log('');
  }

  /**
   * Reset the ServiceManager (useful for testing)
   */
  reset(): void {
    this.stopHealthChecks();
    this.services.clear();
    this.initializationOrder = [];
    this.initialized = false;
    this.removeAllListeners();
  }
}

// Export singleton instance getter
export const getServiceManager = (): ServiceManager =>
  ServiceManager.getInstance();

export default ServiceManager;
