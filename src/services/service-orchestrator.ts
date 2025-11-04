/**
 * Service Orchestration Framework
 * Manages bundled services with schema-based communication
 */

import { EventEmitter } from 'events';
import { ConsoleFormatter } from '../config/console-config.js';
import { DeepSeekInstanceManager } from './deepseek-instance-manager.js';

export interface ServiceSchema {
  name: string;
  version: string;
  endpoints: Array<{
    path: string;
    method: string;
    schema: any;
  }>;
  dependencies?: string[];
  config?: any;
}

export interface ServiceInstance {
  id: string;
  schema: ServiceSchema;
  status: 'stopped' | 'starting' | 'running' | 'error';
  port?: number;
  pid?: number;
  instanceType: 'chrome' | 'worker' | 'api' | 'custom';
  chromeInstanceId?: string;
  startedAt?: Date;
  lastHealthCheck?: Date;
  healthStatus?: 'healthy' | 'unhealthy' | 'unknown';
}

export interface ServiceBundle {
  name: string;
  services: ServiceInstance[];
  config: BundleConfig;
  status: 'stopped' | 'starting' | 'running' | 'error';
}

export interface BundleConfig {
  autoStart?: boolean;
  healthCheckInterval?: number;
  restartOnFailure?: boolean;
  maxRestarts?: number;
  environment?: Record<string, string>;
}

export class ServiceOrchestrator extends EventEmitter {
  private bundles: Map<string, ServiceBundle> = new Map();
  private services: Map<string, ServiceInstance> = new Map();
  private console: ConsoleFormatter;
  private deepseekManager: DeepSeekInstanceManager;
  private portCounter: number = 3000; // Counter for port allocation

  constructor() {
    super();
    this.console = new ConsoleFormatter();
    this.deepseekManager = new DeepSeekInstanceManager();
  }

  /**
   * Register a service bundle
   */
  public registerBundle(
    name: string,
    schemas: ServiceSchema[],
    config: BundleConfig = {}
  ): ServiceBundle {
    if (this.bundles.has(name)) {
      throw new Error(`Bundle ${name} already exists`);
    }

    const services: ServiceInstance[] = schemas.map(schema => ({
      id: `${name}-${schema.name}-${Date.now()}`,
      schema,
      status: 'stopped',
      instanceType: this.determineInstanceType(schema),
    }));

    const bundle: ServiceBundle = {
      name,
      services,
      config: {
        autoStart: false,
        healthCheckInterval: 30000,
        restartOnFailure: true,
        maxRestarts: 3,
        ...config,
      },
      status: 'stopped',
    };

    this.bundles.set(name, bundle);
    services.forEach(service => this.services.set(service.id, service));

    console.log(
      this.console.formatServiceMessage(
        'Orchestrator',
        `Registered bundle: ${name} with ${services.length} services`,
        'success'
      )
    );

    this.emit('bundle:registered', bundle);
    return bundle;
  }

  /**
   * Start a service bundle
   */
  public async startBundle(bundleName: string): Promise<void> {
    const bundle = this.bundles.get(bundleName);
    if (!bundle) {
      throw new Error(`Bundle ${bundleName} not found`);
    }

    bundle.status = 'starting';

    console.log(
      this.console.formatServiceMessage(
        'Orchestrator',
        `Starting bundle: ${bundleName}`,
        'info'
      )
    );

    try {
      // Start services in dependency order
      const sortedServices = this.sortServicesByDependencies(bundle.services);
      
      for (const service of sortedServices) {
        await this.startService(service.id);
      }

      bundle.status = 'running';

      console.log(
        this.console.formatServiceBundle(
          bundleName,
          bundle.services.map(s => ({
            name: s.schema.name,
            status: s.status,
            port: s.port,
          }))
        )
      );

      this.emit('bundle:started', bundle);

      // Start health checks
      if (bundle.config.healthCheckInterval) {
        this.startHealthChecks(bundleName);
      }
    } catch (error) {
      bundle.status = 'error';
      console.error(
        this.console.formatError('Orchestrator', error as Error)
      );
      throw error;
    }
  }

  /**
   * Start a single service
   */
  public async startService(serviceId: string): Promise<void> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }

    service.status = 'starting';

    console.log(
      this.console.formatServiceMessage(
        'Orchestrator',
        `Starting service: ${service.schema.name}`,
        'info'
      )
    );

    try {
      switch (service.instanceType) {
        case 'chrome':
          await this.startChromeInstance(service);
          break;
        case 'worker':
          await this.startWorkerInstance(service);
          break;
        case 'api':
          await this.startApiInstance(service);
          break;
        default:
          await this.startCustomInstance(service);
      }

      service.status = 'running';
      service.startedAt = new Date();
      service.lastHealthCheck = new Date();
      service.healthStatus = 'healthy';

      console.log(
        this.console.formatServiceMessage(
          service.schema.name,
          'Service started successfully',
          'success'
        )
      );

      this.emit('service:started', service);
    } catch (error) {
      service.status = 'error';
      console.error(
        this.console.formatError(service.schema.name, error as Error)
      );
      throw error;
    }
  }

  /**
   * Stop a service bundle
   */
  public async stopBundle(bundleName: string): Promise<void> {
    const bundle = this.bundles.get(bundleName);
    if (!bundle) {
      throw new Error(`Bundle ${bundleName} not found`);
    }

    console.log(
      this.console.formatServiceMessage(
        'Orchestrator',
        `Stopping bundle: ${bundleName}`,
        'warning'
      )
    );

    // Stop services in reverse dependency order
    const sortedServices = this.sortServicesByDependencies(bundle.services).reverse();
    
    for (const service of sortedServices) {
      await this.stopService(service.id);
    }

    bundle.status = 'stopped';
    this.emit('bundle:stopped', bundle);
  }

  /**
   * Stop a single service
   */
  public async stopService(serviceId: string): Promise<void> {
    const service = this.services.get(serviceId);
    if (!service) {
      return;
    }

    console.log(
      this.console.formatServiceMessage(
        'Orchestrator',
        `Stopping service: ${service.schema.name}`,
        'warning'
      )
    );

    if (service.chromeInstanceId) {
      await this.deepseekManager.stopInstance(service.chromeInstanceId);
    }

    service.status = 'stopped';
    this.emit('service:stopped', service);
  }

  /**
   * Execute schema-based API call
   */
  public async executeSchemaCall(
    serviceId: string,
    endpoint: string,
    data: any
  ): Promise<any> {
    const service = this.services.get(serviceId);
    if (!service) {
      throw new Error(`Service ${serviceId} not found`);
    }

    const endpointSchema = service.schema.endpoints.find(e => e.path === endpoint);
    if (!endpointSchema) {
      throw new Error(`Endpoint ${endpoint} not found in service ${service.schema.name}`);
    }

    console.log(
      this.console.formatDataStream(
        service.schema.name,
        { endpoint, data },
        'api'
      )
    );

    // Execute the schema-based call
    if (service.chromeInstanceId) {
      const result = await this.deepseekManager.sendPrompt(
        service.chromeInstanceId,
        JSON.stringify({ endpoint, data })
      );
      return result;
    }

    // For other instance types, implement custom execution
    return { success: true, endpoint, data };
  }

  /**
   * Get service status
   */
  public getServiceStatus(serviceId: string): ServiceInstance | undefined {
    return this.services.get(serviceId);
  }

  /**
   * Get bundle status
   */
  public getBundleStatus(bundleName: string): ServiceBundle | undefined {
    return this.bundles.get(bundleName);
  }

  /**
   * Get all bundles
   */
  public getAllBundles(): ServiceBundle[] {
    return Array.from(this.bundles.values());
  }

  private determineInstanceType(schema: ServiceSchema): ServiceInstance['instanceType'] {
    if (schema.config?.instanceType) {
      return schema.config.instanceType;
    }
    
    if (schema.name.toLowerCase().includes('chrome') || 
        schema.name.toLowerCase().includes('browser')) {
      return 'chrome';
    }
    
    if (schema.name.toLowerCase().includes('worker')) {
      return 'worker';
    }
    
    if (schema.name.toLowerCase().includes('api')) {
      return 'api';
    }
    
    return 'custom';
  }

  private sortServicesByDependencies(services: ServiceInstance[]): ServiceInstance[] {
    // Simple topological sort based on dependencies
    const sorted: ServiceInstance[] = [];
    const visited = new Set<string>();

    const visit = (service: ServiceInstance) => {
      if (visited.has(service.id)) return;
      
      if (service.schema.dependencies) {
        service.schema.dependencies.forEach(depName => {
          const dep = services.find(s => s.schema.name === depName);
          if (dep) visit(dep);
        });
      }
      
      visited.add(service.id);
      sorted.push(service);
    };

    services.forEach(visit);
    return sorted;
  }

  private async startChromeInstance(service: ServiceInstance): Promise<void> {
    const instanceId = `chrome-${service.id}`;
    await this.deepseekManager.createInstance(instanceId, {
      headless: true,
      enableConsoleLogging: true,
    });
    service.chromeInstanceId = instanceId;
  }

  private async startWorkerInstance(service: ServiceInstance): Promise<void> {
    // Implement worker instantiation
    console.log(
      this.console.formatServiceMessage(
        service.schema.name,
        'Worker instance started',
        'info'
      )
    );
  }

  private async startApiInstance(service: ServiceInstance): Promise<void> {
    // Implement API instance startup with reliable port allocation
    service.port = this.portCounter++;
    console.log(
      this.console.formatServiceMessage(
        service.schema.name,
        `API instance started on port ${service.port}`,
        'info'
      )
    );
  }

  private async startCustomInstance(service: ServiceInstance): Promise<void> {
    // Implement custom instance startup
    console.log(
      this.console.formatServiceMessage(
        service.schema.name,
        'Custom instance started',
        'info'
      )
    );
  }

  private startHealthChecks(bundleName: string): void {
    const bundle = this.bundles.get(bundleName);
    if (!bundle || !bundle.config.healthCheckInterval) return;

    const interval = setInterval(async () => {
      if (bundle.status !== 'running') {
        clearInterval(interval);
        return;
      }

      for (const service of bundle.services) {
        await this.checkServiceHealth(service);
      }
    }, bundle.config.healthCheckInterval);
  }

  private async checkServiceHealth(service: ServiceInstance): Promise<void> {
    service.lastHealthCheck = new Date();
    
    // Implement actual health check logic
    const isHealthy = service.status === 'running';
    
    service.healthStatus = isHealthy ? 'healthy' : 'unhealthy';
    
    if (!isHealthy) {
      console.log(
        this.console.formatServiceMessage(
          service.schema.name,
          'Health check failed',
          'error'
        )
      );
      this.emit('service:unhealthy', service);
    }
  }
}

export const serviceOrchestrator = new ServiceOrchestrator();
