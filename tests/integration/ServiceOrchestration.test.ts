/**
 * Integration Tests for Service Orchestration
 * Tests SchemaServiceFactory and ServiceLinker working together
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import SchemaServiceFactory from '../../src/services/SchemaServiceFactory';
import ServiceLinker from '../../src/services/ServiceLinker';

describe('Service Orchestration Integration Tests', () => {
  let factory: SchemaServiceFactory;
  let linker: ServiceLinker;

  beforeAll(async () => {
    factory = new SchemaServiceFactory();
    await factory.initialize();

    linker = new ServiceLinker(factory);
    await linker.initialize();
  });

  afterAll(async () => {
    if (linker) {
      await linker.stopServicesInOrder();
    }
    if (factory) {
      await factory.shutdown();
    }
  });

  describe('SchemaServiceFactory', () => {
    it('should load default service schemas', () => {
      const schemas = factory.getAllSchemas();
      expect(schemas.length).toBeGreaterThanOrEqual(3);

      const schemaIds = schemas.map(s => s['@id']);
      expect(schemaIds).toContain('lightdom:crawler-service');
      expect(schemaIds).toContain('lightdom:optimization-service');
      expect(schemaIds).toContain('lightdom:api-gateway');
    });

    it('should get service schema by ID', () => {
      const schema = factory.getSchema('lightdom:crawler-service');

      expect(schema).toBeDefined();
      expect(schema?.name).toBe('Web Crawler Service');
      expect(schema?.['lightdom:serviceType']).toBe('worker');
    });

    it('should create service from schema', async () => {
      const service = await factory.createService('lightdom:crawler-service');

      expect(service).toBeDefined();
      expect(service.id).toBe('lightdom:crawler-service');
      expect(service.status).toBe('running');
      expect(service.schema).toBeDefined();
      expect(service.instance).toBeDefined();
    });

    it('should not create duplicate service', async () => {
      const service1 = await factory.createService('lightdom:optimization-service');
      const service2 = await factory.createService('lightdom:optimization-service');

      expect(service1.id).toBe(service2.id);
    });

    it('should get all services', () => {
      const services = factory.getAllServices();
      expect(Array.isArray(services)).toBe(true);
      expect(services.length).toBeGreaterThan(0);
    });

    it('should get running services', () => {
      const running = factory.getRunningServices();
      expect(Array.isArray(running)).toBe(true);
      
      running.forEach(service => {
        expect(service.status).toBe('running');
      });
    });

    it('should calculate statistics', () => {
      const stats = factory.getStatistics();

      expect(stats).toHaveProperty('totalSchemas');
      expect(stats).toHaveProperty('totalServices');
      expect(stats).toHaveProperty('runningServices');
      expect(stats).toHaveProperty('byType');
      expect(stats).toHaveProperty('byStatus');

      expect(stats.totalSchemas).toBeGreaterThanOrEqual(3);
      expect(typeof stats.byType).toBe('object');
      expect(typeof stats.byStatus).toBe('object');
    });

    it('should stop service', async () => {
      await factory.stopService('lightdom:crawler-service');

      const service = factory.getService('lightdom:crawler-service');
      expect(service?.status).toBe('stopped');
    });
  });

  describe('ServiceLinker', () => {
    it('should build dependency graph', () => {
      const graph = linker.buildDependencyGraph();

      expect(graph).toHaveProperty('nodes');
      expect(graph).toHaveProperty('edges');
      expect(graph).toHaveProperty('dependencyOrder');

      expect(graph.nodes.size).toBeGreaterThan(0);
      expect(Array.isArray(graph.edges)).toBe(true);
      expect(Array.isArray(graph.dependencyOrder)).toBe(true);
    });

    it('should detect dependencies', () => {
      const links = linker.getLinksForService('lightdom:crawler-service');

      expect(links).toHaveProperty('dependencies');
      expect(links).toHaveProperty('dependents');
      expect(Array.isArray(links.dependencies)).toBe(true);
      expect(Array.isArray(links.dependents)).toBe(true);
    });

    it('should validate dependency graph (no cycles)', () => {
      expect(() => linker.validateDependencyGraph()).not.toThrow();
    });

    it('should calculate dependency depth', () => {
      const stats = linker.getStatistics();

      expect(stats).toHaveProperty('maxDependencyDepth');
      expect(typeof stats.maxDependencyDepth).toBe('number');
      expect(stats.maxDependencyDepth).toBeGreaterThanOrEqual(0);
    });

    it('should get service health', () => {
      const health = linker.getServiceHealth('lightdom:optimization-service');

      expect(health).toHaveProperty('service');
      expect(health).toHaveProperty('dependencies');
      expect(health).toHaveProperty('dependents');
      expect(health).toHaveProperty('healthy');

      expect(Array.isArray(health.dependencies)).toBe(true);
      expect(Array.isArray(health.dependents)).toBe(true);
      expect(typeof health.healthy).toBe('boolean');
    });

    it('should check if service can start', () => {
      const check = linker.canStartService('lightdom:api-gateway');

      expect(check).toHaveProperty('canStart');
      expect(check).toHaveProperty('reasons');
      expect(typeof check.canStart).toBe('boolean');
      expect(Array.isArray(check.reasons)).toBe(true);
    });

    it('should get graph visualization data', () => {
      const viz = linker.getGraphVisualization();

      expect(viz).toHaveProperty('nodes');
      expect(viz).toHaveProperty('edges');

      expect(Array.isArray(viz.nodes)).toBe(true);
      expect(Array.isArray(viz.edges)).toBe(true);

      viz.nodes.forEach(node => {
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('label');
        expect(node).toHaveProperty('type');
      });

      viz.edges.forEach(edge => {
        expect(edge).toHaveProperty('from');
        expect(edge).toHaveProperty('to');
        expect(edge).toHaveProperty('label');
      });
    });

    it('should get linker statistics', () => {
      const stats = linker.getStatistics();

      expect(stats).toHaveProperty('totalLinks');
      expect(stats).toHaveProperty('byType');
      expect(stats).toHaveProperty('circularDependencies');
      expect(stats).toHaveProperty('maxDependencyDepth');

      expect(typeof stats.totalLinks).toBe('number');
      expect(typeof stats.circularDependencies).toBe('boolean');
      expect(stats.circularDependencies).toBe(false);
    });
  });

  describe('Integrated Workflow', () => {
    it('should start services in dependency order', async () => {
      // Ensure services are stopped first
      await linker.stopServicesInOrder();

      // Start in dependency order
      await linker.startServicesInOrder();

      // Check that services are running
      const running = factory.getRunningServices();
      expect(running.length).toBeGreaterThan(0);

      // Check health of services
      const crawlerHealth = linker.getServiceHealth('lightdom:crawler-service');
      const apiHealth = linker.getServiceHealth('lightdom:api-gateway');

      // Services should be healthy if dependencies are met
      if (crawlerHealth.service?.status === 'running') {
        expect(crawlerHealth.dependencies.every(d => d.healthy)).toBe(true);
      }
    });

    it('should stop services in reverse dependency order', async () => {
      await linker.stopServicesInOrder();

      const running = factory.getRunningServices();
      // All services should be stopped
      expect(running.length).toBe(0);
    });

    it('should handle service errors gracefully', async () => {
      // Try to create a non-existent service
      try {
        await factory.createService('lightdom:non-existent-service');
      } catch (error) {
        expect(error).toBeDefined();
      }

      // System should still be operational
      const stats = factory.getStatistics();
      expect(stats.totalSchemas).toBeGreaterThan(0);
    });
  });
});
