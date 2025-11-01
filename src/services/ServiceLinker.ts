/**
 * Service Linker
 * Manages dependencies and relationships between services
 * Handles service orchestration and communication
 */

import { EventEmitter } from 'events';
import { Logger } from '../utils/Logger';
import SchemaServiceFactory, { ServiceSchema, ServiceInstance } from './SchemaServiceFactory';

export interface ServiceLink {
  from: string;
  to: string;
  type: 'depends-on' | 'provides-data' | 'subscribes-to';
  enabled: boolean;
}

export interface ServiceGraph {
  nodes: Map<string, ServiceSchema>;
  edges: ServiceLink[];
  dependencyOrder: string[];
}

export class ServiceLinker extends EventEmitter {
  private serviceFactory: SchemaServiceFactory;
  private links: ServiceLink[] = [];
  private logger: Logger;

  constructor(serviceFactory: SchemaServiceFactory) {
    super();
    this.serviceFactory = serviceFactory;
    this.logger = new Logger('ServiceLinker');
  }

  /**
   * Initialize the service linker
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Service Linker...');

    // Build links from service schemas
    await this.buildLinksFromSchemas();

    // Validate dependency graph
    this.validateDependencyGraph();

    this.logger.info('Service Linker initialized', {
      linksCreated: this.links.length,
    });
  }

  /**
   * Build links from service schemas
   */
  private async buildLinksFromSchemas(): Promise<void> {
    const schemas = this.serviceFactory.getAllSchemas();

    for (const schema of schemas) {
      const linkedServices = schema['lightdom:linkedServices'] || [];

      for (const linkedServiceId of linkedServices) {
        // Create a dependency link
        this.addLink({
          from: schema['@id'],
          to: linkedServiceId,
          type: 'depends-on',
          enabled: true,
        });
      }
    }

    this.logger.debug('Built links from schemas', { count: this.links.length });
  }

  /**
   * Add a service link
   */
  addLink(link: ServiceLink): void {
    // Check if link already exists
    const exists = this.links.some(
      l => l.from === link.from && l.to === link.to && l.type === link.type
    );

    if (!exists) {
      this.links.push(link);
      this.emit('linkAdded', link);
      this.logger.debug('Link added', link);
    }
  }

  /**
   * Remove a service link
   */
  removeLink(from: string, to: string, type: ServiceLink['type']): void {
    const index = this.links.findIndex(
      l => l.from === from && l.to === to && l.type === type
    );

    if (index !== -1) {
      const link = this.links[index];
      this.links.splice(index, 1);
      this.emit('linkRemoved', link);
      this.logger.debug('Link removed', link);
    }
  }

  /**
   * Get links for a service
   */
  getLinksForService(serviceId: string): {
    dependencies: string[];
    dependents: string[];
    provides: string[];
    subscribes: string[];
  } {
    const dependencies = this.links
      .filter(l => l.from === serviceId && l.type === 'depends-on' && l.enabled)
      .map(l => l.to);

    const dependents = this.links
      .filter(l => l.to === serviceId && l.type === 'depends-on' && l.enabled)
      .map(l => l.from);

    const provides = this.links
      .filter(l => l.from === serviceId && l.type === 'provides-data' && l.enabled)
      .map(l => l.to);

    const subscribes = this.links
      .filter(l => l.from === serviceId && l.type === 'subscribes-to' && l.enabled)
      .map(l => l.to);

    return { dependencies, dependents, provides, subscribes };
  }

  /**
   * Build service dependency graph
   */
  buildDependencyGraph(): ServiceGraph {
    const schemas = this.serviceFactory.getAllSchemas();
    const nodes = new Map<string, ServiceSchema>();

    schemas.forEach(schema => {
      nodes.set(schema['@id'], schema);
    });

    // Calculate dependency order using topological sort
    const dependencyOrder = this.topologicalSort(Array.from(nodes.keys()));

    return {
      nodes,
      edges: this.links,
      dependencyOrder,
    };
  }

  /**
   * Topological sort for dependency resolution
   */
  private topologicalSort(serviceIds: string[]): string[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: string[] = [];

    const visit = (serviceId: string) => {
      if (temp.has(serviceId)) {
        throw new Error(`Circular dependency detected involving: ${serviceId}`);
      }

      if (!visited.has(serviceId)) {
        temp.add(serviceId);

        const links = this.getLinksForService(serviceId);
        
        // Visit dependencies first
        for (const dep of links.dependencies) {
          if (serviceIds.includes(dep)) {
            visit(dep);
          }
        }

        temp.delete(serviceId);
        visited.add(serviceId);
        result.push(serviceId);
      }
    };

    for (const serviceId of serviceIds) {
      if (!visited.has(serviceId)) {
        visit(serviceId);
      }
    }

    return result;
  }

  /**
   * Validate dependency graph for cycles
   */
  validateDependencyGraph(): boolean {
    try {
      const schemas = this.serviceFactory.getAllSchemas();
      const serviceIds = schemas.map(s => s['@id']);
      
      this.topologicalSort(serviceIds);
      
      this.logger.info('Dependency graph validated - no cycles detected');
      return true;
    } catch (error) {
      this.logger.error('Dependency graph validation failed', { error });
      throw error;
    }
  }

  /**
   * Start services in dependency order
   */
  async startServicesInOrder(): Promise<void> {
    this.logger.info('Starting services in dependency order...');

    const graph = this.buildDependencyGraph();
    const enabledSchemas = Array.from(graph.nodes.values())
      .filter(schema => schema['lightdom:enabled']);

    // Sort by dependency order
    const sortedSchemas = graph.dependencyOrder
      .map(id => graph.nodes.get(id))
      .filter(schema => schema && enabledSchemas.includes(schema)) as ServiceSchema[];

    for (const schema of sortedSchemas) {
      try {
        // Check if all dependencies are running
        const links = this.getLinksForService(schema['@id']);
        const allDepsRunning = links.dependencies.every(depId => {
          const service = this.serviceFactory.getService(depId);
          return service && service.status === 'running';
        });

        if (allDepsRunning || links.dependencies.length === 0) {
          await this.serviceFactory.createService(schema['@id']);
          this.logger.info('Started service', { id: schema['@id'], name: schema.name });
        } else {
          this.logger.warn('Skipping service - dependencies not ready', {
            id: schema['@id'],
            dependencies: links.dependencies,
          });
        }
      } catch (error) {
        this.logger.error('Failed to start service', {
          id: schema['@id'],
          error,
        });
      }
    }

    this.logger.info('Services started in dependency order');
  }

  /**
   * Stop services in reverse dependency order
   */
  async stopServicesInOrder(): Promise<void> {
    this.logger.info('Stopping services in reverse dependency order...');

    const graph = this.buildDependencyGraph();
    const runningServices = this.serviceFactory.getRunningServices();

    // Reverse the dependency order for shutdown
    const reversedOrder = [...graph.dependencyOrder].reverse();
    
    const servicesToStop = reversedOrder
      .filter(id => runningServices.some(s => s.id === id));

    for (const serviceId of servicesToStop) {
      try {
        await this.serviceFactory.stopService(serviceId);
        this.logger.info('Stopped service', { id: serviceId });
      } catch (error) {
        this.logger.error('Failed to stop service', { id: serviceId, error });
      }
    }

    this.logger.info('Services stopped in reverse dependency order');
  }

  /**
   * Get service health status including dependencies
   */
  getServiceHealth(serviceId: string): {
    service: ServiceInstance | undefined;
    dependencies: Array<{ id: string; status: string; healthy: boolean }>;
    dependents: Array<{ id: string; status: string }>;
    healthy: boolean;
  } {
    const service = this.serviceFactory.getService(serviceId);
    const links = this.getLinksForService(serviceId);

    const dependencies = links.dependencies.map(depId => {
      const depService = this.serviceFactory.getService(depId);
      return {
        id: depId,
        status: depService?.status || 'not-found',
        healthy: depService?.status === 'running',
      };
    });

    const dependents = links.dependents.map(depId => {
      const depService = this.serviceFactory.getService(depId);
      return {
        id: depId,
        status: depService?.status || 'not-found',
      };
    });

    const healthy = 
      service?.status === 'running' &&
      dependencies.every(dep => dep.healthy);

    return {
      service,
      dependencies,
      dependents,
      healthy,
    };
  }

  /**
   * Get all links
   */
  getAllLinks(): ServiceLink[] {
    return [...this.links];
  }

  /**
   * Get graph visualization data
   */
  getGraphVisualization(): {
    nodes: Array<{ id: string; label: string; type: string; status?: string }>;
    edges: Array<{ from: string; to: string; label: string }>;
  } {
    const schemas = this.serviceFactory.getAllSchemas();
    const services = this.serviceFactory.getAllServices();

    const nodes = schemas.map(schema => ({
      id: schema['@id'],
      label: schema.name,
      type: schema['lightdom:serviceType'],
      status: services.find(s => s.id === schema['@id'])?.status,
    }));

    const edges = this.links
      .filter(link => link.enabled)
      .map(link => ({
        from: link.from,
        to: link.to,
        label: link.type,
      }));

    return { nodes, edges };
  }

  /**
   * Check if service can be started (all dependencies met)
   */
  canStartService(serviceId: string): {
    canStart: boolean;
    reasons: string[];
  } {
    const links = this.getLinksForService(serviceId);
    const reasons: string[] = [];

    // Check if service already running
    const service = this.serviceFactory.getService(serviceId);
    if (service && service.status === 'running') {
      reasons.push('Service is already running');
      return { canStart: false, reasons };
    }

    // Check dependencies
    for (const depId of links.dependencies) {
      const depService = this.serviceFactory.getService(depId);
      
      if (!depService) {
        reasons.push(`Dependency not created: ${depId}`);
      } else if (depService.status !== 'running') {
        reasons.push(`Dependency not running: ${depId} (status: ${depService.status})`);
      }
    }

    return {
      canStart: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalLinks: number;
    byType: Record<string, number>;
    circularDependencies: boolean;
    maxDependencyDepth: number;
  } {
    const byType: Record<string, number> = {};

    this.links.forEach(link => {
      byType[link.type] = (byType[link.type] || 0) + 1;
    });

    let circularDependencies = false;
    try {
      this.validateDependencyGraph();
    } catch (error) {
      circularDependencies = true;
    }

    // Calculate max dependency depth
    const maxDependencyDepth = this.calculateMaxDependencyDepth();

    return {
      totalLinks: this.links.length,
      byType,
      circularDependencies,
      maxDependencyDepth,
    };
  }

  /**
   * Calculate maximum dependency depth
   */
  private calculateMaxDependencyDepth(): number {
    const schemas = this.serviceFactory.getAllSchemas();
    const serviceIds = schemas.map(s => s['@id']);

    const getDepth = (serviceId: string, visited = new Set<string>()): number => {
      if (visited.has(serviceId)) return 0;
      
      visited.add(serviceId);
      const links = this.getLinksForService(serviceId);
      
      if (links.dependencies.length === 0) return 0;

      const depths = links.dependencies.map(depId => {
        if (serviceIds.includes(depId)) {
          return 1 + getDepth(depId, new Set(visited));
        }
        return 0;
      });

      return Math.max(...depths);
    };

    const depths = serviceIds.map(id => getDepth(id));
    return depths.length > 0 ? Math.max(...depths) : 0;
  }
}

export default ServiceLinker;
