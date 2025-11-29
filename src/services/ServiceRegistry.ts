/**
 * ServiceRegistry - Defines and registers all application services
 *
 * This module provides a centralized registry of all services in the application.
 * Each service is defined with its dependencies, factory function, and lifecycle hooks.
 *
 * Pattern used:
 * 1. Define service configurations with clear dependencies
 * 2. Register services with the ServiceManager
 * 3. Services are initialized in dependency order
 * 4. Services can be accessed via ServiceManager.getService()
 *
 * @module ServiceRegistry
 */

import { ServiceConfig, getServiceManager } from './ServiceManager.js';

// Import service classes/modules
// Note: Using .js extensions for ESM compatibility
import { getDatabaseService, DatabaseService } from './DatabaseService.js';
import { ValidationService, validationService } from './ValidationService.js';
// WikiService is in a different location structure
import WikiService from './WikiService.js';
// ComponentLibraryService
import ComponentLibraryService from './ComponentLibraryService.js';
import { AnalysisService, analysisService } from './AnalysisService.js';
import { PlanningService, planningService } from './PlanningService.js';
import {
  ApiGatewayService,
  initializeApiGateway,
} from './ApiGatewayService.js';

/**
 * Core services that form the foundation of the application
 */
const coreServices: ServiceConfig[] = [
  {
    name: 'database',
    description: 'PostgreSQL database connection and query service',
    dependencies: [],
    tags: ['core', 'infrastructure'],
    required: true,
    factory: () => getDatabaseService(),
    initialize: async (db: DatabaseService) => {
      await db.initialize();
    },
    healthCheck: async (db: DatabaseService) => {
      const result = await db.healthCheck();
      return {
        healthy: result.healthy,
        message: result.error || 'Database connection healthy',
        latencyMs: result.latency,
        details: db.getStats() || undefined,
      };
    },
    shutdown: async (db: DatabaseService) => {
      await db.close();
    },
  },
  {
    name: 'validation',
    description: 'Schema validation using Zod',
    dependencies: [],
    tags: ['core', 'utility'],
    required: true,
    factory: () => validationService,
    // ValidationService is stateless, no init needed
    healthCheck: async () => ({ healthy: true }),
  },
];

/**
 * Data services that handle content and knowledge
 */
const dataServices: ServiceConfig[] = [
  {
    name: 'wiki',
    description: 'Research topics and knowledge graph service',
    dependencies: ['database'],
    tags: ['data', 'content'],
    required: false,
    factory: () => new WikiService(),
    initialize: async (wiki: WikiService) => {
      // Load topics from filesystem on startup
      try {
        await wiki.loadTopics();
      } catch (error) {
        console.warn('   ⚠️  Could not load wiki topics:', (error as Error).message);
      }
    },
    healthCheck: async (wiki: WikiService) => {
      try {
        const topics = await wiki.getAllTopics();
        return {
          healthy: true,
          message: `${topics.length} topics loaded`,
          details: { topicCount: topics.length },
        };
      } catch (error) {
        return {
          healthy: false,
          message: (error as Error).message,
        };
      }
    },
  },
  {
    name: 'componentLibrary',
    description: 'Component schema library service',
    dependencies: ['database'],
    tags: ['data', 'components'],
    required: false,
    factory: () => new ComponentLibraryService(),
    initialize: async (lib: ComponentLibraryService) => {
      try {
        await lib.loadDefaultComponents();
        await lib.loadAtomicSchemasFromFiles();
      } catch (error) {
        console.warn(
          '   ⚠️  Could not load component schemas:',
          (error as Error).message
        );
      }
    },
    healthCheck: async (lib: ComponentLibraryService) => {
      try {
        const components = await lib.getAtomicComponents();
        return {
          healthy: true,
          message: `${components.length} atomic components loaded`,
          details: { componentCount: components.length },
        };
      } catch (error) {
        return {
          healthy: false,
          message: (error as Error).message,
        };
      }
    },
  },
];

/**
 * Analysis and planning services
 */
const analysisServices: ServiceConfig[] = [
  {
    name: 'analysis',
    description: 'Competitive analysis and schema comparison',
    dependencies: ['database'],
    tags: ['analysis', 'intelligence'],
    required: false,
    factory: () => analysisService,
    healthCheck: async () => ({ healthy: true }),
  },
  {
    name: 'planning',
    description: 'AI-powered execution planning service',
    dependencies: ['database', 'validation'],
    tags: ['planning', 'ai'],
    required: false,
    factory: () => planningService,
    healthCheck: async () => ({ healthy: true }),
  },
];

/**
 * API and gateway services
 */
const apiServices: ServiceConfig[] = [
  {
    name: 'apiGateway',
    description: 'GraphQL API gateway service',
    dependencies: ['wiki', 'componentLibrary'],
    tags: ['api', 'gateway'],
    required: false,
    factory: () => initializeApiGateway(),
    healthCheck: async (gateway: ApiGatewayService) => {
      try {
        const schema = gateway.buildSchema();
        return {
          healthy: !!schema,
          message: 'GraphQL schema built successfully',
        };
      } catch (error) {
        return {
          healthy: false,
          message: (error as Error).message,
        };
      }
    },
  },
];

/**
 * All service configurations combined
 */
export const allServiceConfigs: ServiceConfig[] = [
  ...coreServices,
  ...dataServices,
  ...analysisServices,
  ...apiServices,
];

/**
 * Register all services with the ServiceManager
 */
export function registerAllServices(): void {
  const manager = getServiceManager();
  manager.registerAll(allServiceConfigs);
}

/**
 * Initialize all registered services
 */
export async function initializeAllServices(): Promise<void> {
  const manager = getServiceManager();
  await manager.initialize();
}

/**
 * Shutdown all services gracefully
 */
export async function shutdownAllServices(): Promise<void> {
  const manager = getServiceManager();
  await manager.shutdown();
}

/**
 * Get a typed service instance
 */
export function getService<T>(name: string): T | null {
  return getServiceManager().getService<T>(name);
}

/**
 * Get a typed service instance, throw if not available
 */
export function requireService<T>(name: string): T {
  return getServiceManager().requireService<T>(name);
}

// Convenience typed getters for commonly used services
export const services = {
  get database(): DatabaseService {
    return requireService<DatabaseService>('database');
  },
  get validation(): ValidationService {
    return requireService<ValidationService>('validation');
  },
  get wiki(): WikiService {
    return requireService<WikiService>('wiki');
  },
  get componentLibrary(): ComponentLibraryService {
    return requireService<ComponentLibraryService>('componentLibrary');
  },
  get analysis(): AnalysisService {
    return requireService<AnalysisService>('analysis');
  },
  get planning(): PlanningService {
    return requireService<PlanningService>('planning');
  },
  get apiGateway(): ApiGatewayService {
    return requireService<ApiGatewayService>('apiGateway');
  },
};

export default {
  registerAllServices,
  initializeAllServices,
  shutdownAllServices,
  getService,
  requireService,
  services,
  allServiceConfigs,
};
