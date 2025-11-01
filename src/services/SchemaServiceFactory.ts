/**
 * Schema Service Factory
 * Creates dynamic services based on service schemas
 * Supports workers, background workers, API services, and headless services
 */

import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import { Logger } from '../utils/Logger';
import WorkerPoolManager from './WorkerPoolManager';

export interface ServiceSchema {
  '@context': string;
  '@type': string;
  '@id': string;
  name: string;
  description: string;
  
  // LightDom service extensions
  'lightdom:serviceType': 'worker' | 'background' | 'api' | 'headless';
  'lightdom:config': ServiceConfig;
  'lightdom:linkedServices': string[];
  'lightdom:tasks': TaskSchema[];
  'lightdom:enabled': boolean;
  'lightdom:autoStart': boolean;
  'lightdom:priority': number;
}

export interface ServiceConfig {
  workers?: {
    type: 'puppeteer' | 'playwright' | 'node';
    count: number;
    pooling: boolean;
    strategy?: 'round-robin' | 'least-busy' | 'random';
  };
  queue?: {
    type: 'redis' | 'memory';
    concurrency: number;
    retries: number;
    timeout: number;
  };
  browser?: {
    headless: boolean;
    args: string[];
    viewport?: {
      width: number;
      height: number;
    };
  };
  api?: {
    port: number;
    cors: boolean;
    rateLimit?: {
      windowMs: number;
      max: number;
    };
  };
}

export interface TaskSchema {
  id: string;
  type: string;
  description: string;
  schedule?: string; // Cron format
  enabled: boolean;
}

export interface ServiceInstance {
  id: string;
  schema: ServiceSchema;
  instance: any;
  status: 'initializing' | 'running' | 'stopped' | 'error';
  startedAt?: Date;
  stoppedAt?: Date;
  error?: Error;
}

export class SchemaServiceFactory extends EventEmitter {
  private schemas: Map<string, ServiceSchema> = new Map();
  private services: Map<string, ServiceInstance> = new Map();
  private schemaDir: string;
  private logger: Logger;

  constructor(schemaDir?: string) {
    super();
    this.schemaDir = schemaDir || path.join(process.cwd(), 'schemas', 'services');
    this.logger = new Logger('SchemaServiceFactory');
  }

  /**
   * Initialize the factory
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Schema Service Factory...');

    // Load service schemas
    await this.loadSchemas();

    // Auto-start enabled services
    await this.autoStartServices();

    this.logger.info('Schema Service Factory initialized', {
      schemasLoaded: this.schemas.size,
      servicesRunning: this.getRunningServices().length,
    });
  }

  /**
   * Load service schemas from directory
   */
  private async loadSchemas(): Promise<void> {
    try {
      // Create schema directory if it doesn't exist
      if (!fs.existsSync(this.schemaDir)) {
        fs.mkdirSync(this.schemaDir, { recursive: true });
        this.logger.info('Created schema directory', { dir: this.schemaDir });
        
        // Create default service schemas
        await this.createDefaultSchemas();
      }

      // Read all JSON files from schema directory
      const files = fs.readdirSync(this.schemaDir)
        .filter(file => file.endsWith('.json'));

      for (const file of files) {
        try {
          const filePath = path.join(this.schemaDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const schema = JSON.parse(content) as ServiceSchema;

          this.schemas.set(schema['@id'], schema);
          this.logger.debug('Loaded service schema', { id: schema['@id'], name: schema.name });
        } catch (error) {
          this.logger.error('Failed to load schema file', { file, error });
        }
      }
    } catch (error) {
      this.logger.error('Failed to load schemas', { error });
    }
  }

  /**
   * Create default service schemas
   */
  private async createDefaultSchemas(): Promise<void> {
    const defaultSchemas: ServiceSchema[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': 'lightdom:crawler-service',
        name: 'Web Crawler Service',
        description: 'Headless browser-based web crawling service',
        'lightdom:serviceType': 'worker',
        'lightdom:config': {
          workers: {
            type: 'puppeteer',
            count: 4,
            pooling: true,
            strategy: 'least-busy',
          },
          queue: {
            type: 'redis',
            concurrency: 10,
            retries: 3,
            timeout: 60000,
          },
          browser: {
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
            ],
          },
        },
        'lightdom:linkedServices': ['lightdom:optimization-service'],
        'lightdom:tasks': [
          {
            id: 'crawl-website',
            type: 'crawl',
            description: 'Crawl a website and extract data',
            enabled: true,
          },
          {
            id: 'take-screenshot',
            type: 'screenshot',
            description: 'Take a screenshot of a webpage',
            enabled: true,
          },
        ],
        'lightdom:enabled': true,
        'lightdom:autoStart': false,
        'lightdom:priority': 8,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': 'lightdom:optimization-service',
        name: 'DOM Optimization Service',
        description: 'Analyzes and optimizes website DOM structures',
        'lightdom:serviceType': 'background',
        'lightdom:config': {
          queue: {
            type: 'redis',
            concurrency: 5,
            retries: 2,
            timeout: 120000,
          },
        },
        'lightdom:linkedServices': ['lightdom:crawler-service'],
        'lightdom:tasks': [
          {
            id: 'analyze-dom',
            type: 'analyze',
            description: 'Analyze DOM structure for optimization',
            enabled: true,
          },
          {
            id: 'optimize-dom',
            type: 'optimize',
            description: 'Optimize DOM structure',
            enabled: true,
          },
        ],
        'lightdom:enabled': true,
        'lightdom:autoStart': false,
        'lightdom:priority': 7,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': 'lightdom:api-gateway',
        name: 'API Gateway Service',
        description: 'Unified API gateway for all services',
        'lightdom:serviceType': 'api',
        'lightdom:config': {
          api: {
            port: 3200,
            cors: true,
            rateLimit: {
              windowMs: 60000,
              max: 100,
            },
          },
        },
        'lightdom:linkedServices': [
          'lightdom:crawler-service',
          'lightdom:optimization-service',
        ],
        'lightdom:tasks': [],
        'lightdom:enabled': true,
        'lightdom:autoStart': true,
        'lightdom:priority': 9,
      },
    ];

    for (const schema of defaultSchemas) {
      const filePath = path.join(this.schemaDir, `${schema['@id'].replace('lightdom:', '')}.json`);
      fs.writeFileSync(filePath, JSON.stringify(schema, null, 2));
      this.logger.debug('Created default service schema', { id: schema['@id'] });
    }
  }

  /**
   * Auto-start services that are enabled and have autoStart = true
   */
  private async autoStartServices(): Promise<void> {
    const autoStartSchemas = Array.from(this.schemas.values())
      .filter(schema => schema['lightdom:enabled'] && schema['lightdom:autoStart'])
      .sort((a, b) => b['lightdom:priority'] - a['lightdom:priority']);

    for (const schema of autoStartSchemas) {
      try {
        await this.createService(schema['@id']);
        this.logger.info('Auto-started service', { id: schema['@id'], name: schema.name });
      } catch (error) {
        this.logger.error('Failed to auto-start service', { id: schema['@id'], error });
      }
    }
  }

  /**
   * Create a service from schema
   */
  async createService(schemaId: string): Promise<ServiceInstance> {
    const schema = this.schemas.get(schemaId);
    
    if (!schema) {
      throw new Error(`Schema not found: ${schemaId}`);
    }

    if (this.services.has(schemaId)) {
      this.logger.warn('Service already exists', { schemaId });
      return this.services.get(schemaId)!;
    }

    this.logger.info('Creating service', { schemaId, name: schema.name });

    const serviceInstance: ServiceInstance = {
      id: schemaId,
      schema,
      instance: null,
      status: 'initializing',
    };

    try {
      // Create service based on type
      switch (schema['lightdom:serviceType']) {
        case 'worker':
          serviceInstance.instance = await this.createWorkerService(schema);
          break;
        
        case 'background':
          serviceInstance.instance = await this.createBackgroundService(schema);
          break;
        
        case 'api':
          serviceInstance.instance = await this.createAPIService(schema);
          break;
        
        case 'headless':
          serviceInstance.instance = await this.createHeadlessService(schema);
          break;
        
        default:
          throw new Error(`Unknown service type: ${schema['lightdom:serviceType']}`);
      }

      serviceInstance.status = 'running';
      serviceInstance.startedAt = new Date();
      
      this.services.set(schemaId, serviceInstance);
      this.emit('serviceCreated', serviceInstance);

      this.logger.info('Service created successfully', { schemaId, name: schema.name });

      return serviceInstance;
    } catch (error) {
      serviceInstance.status = 'error';
      serviceInstance.error = error as Error;
      
      this.services.set(schemaId, serviceInstance);
      this.emit('serviceError', { schemaId, error });

      throw error;
    }
  }

  /**
   * Create worker service
   */
  private async createWorkerService(schema: ServiceSchema): Promise<any> {
    const workerConfig = schema['lightdom:config'].workers;
    
    if (!workerConfig) {
      throw new Error('Worker configuration missing in schema');
    }

    const pool = new WorkerPoolManager({
      type: workerConfig.type,
      maxWorkers: workerConfig.count,
      minWorkers: Math.max(1, Math.floor(workerConfig.count / 2)),
      poolingStrategy: workerConfig.strategy || 'least-busy',
      timeout: schema['lightdom:config'].queue?.timeout || 60000,
      retries: schema['lightdom:config'].queue?.retries || 3,
    });

    await pool.initialize();

    // Setup task handlers for each task in schema
    for (const task of schema['lightdom:tasks']) {
      if (task.enabled) {
        this.logger.debug('Registered task', { task: task.id, service: schema['@id'] });
      }
    }

    return pool;
  }

  /**
   * Create background service
   */
  private async createBackgroundService(schema: ServiceSchema): Promise<any> {
    // Placeholder for background service
    // This would integrate with existing BackgroundWorkerService
    this.logger.debug('Creating background service', { schema: schema['@id'] });
    
    return {
      type: 'background',
      schema,
      tasks: schema['lightdom:tasks'],
    };
  }

  /**
   * Create API service
   */
  private async createAPIService(schema: ServiceSchema): Promise<any> {
    // Placeholder for API service
    // This would create an Express server with specified config
    this.logger.debug('Creating API service', { schema: schema['@id'] });
    
    return {
      type: 'api',
      schema,
      port: schema['lightdom:config'].api?.port,
    };
  }

  /**
   * Create headless service
   */
  private async createHeadlessService(schema: ServiceSchema): Promise<any> {
    // Placeholder for headless service
    // This would integrate with HeadlessBrowserService
    this.logger.debug('Creating headless service', { schema: schema['@id'] });
    
    return {
      type: 'headless',
      schema,
      browser: schema['lightdom:config'].browser,
    };
  }

  /**
   * Stop a service
   */
  async stopService(schemaId: string): Promise<void> {
    const serviceInstance = this.services.get(schemaId);
    
    if (!serviceInstance) {
      throw new Error(`Service not found: ${schemaId}`);
    }

    this.logger.info('Stopping service', { schemaId });

    try {
      // Stop based on service type
      if (serviceInstance.instance?.shutdown) {
        await serviceInstance.instance.shutdown();
      } else if (serviceInstance.instance?.stop) {
        await serviceInstance.instance.stop();
      }

      serviceInstance.status = 'stopped';
      serviceInstance.stoppedAt = new Date();

      this.emit('serviceStopped', serviceInstance);

      this.logger.info('Service stopped', { schemaId });
    } catch (error) {
      this.logger.error('Failed to stop service', { schemaId, error });
      throw error;
    }
  }

  /**
   * Get service by ID
   */
  getService(schemaId: string): ServiceInstance | undefined {
    return this.services.get(schemaId);
  }

  /**
   * Get all services
   */
  getAllServices(): ServiceInstance[] {
    return Array.from(this.services.values());
  }

  /**
   * Get running services
   */
  getRunningServices(): ServiceInstance[] {
    return Array.from(this.services.values())
      .filter(service => service.status === 'running');
  }

  /**
   * Get service schema
   */
  getSchema(schemaId: string): ServiceSchema | undefined {
    return this.schemas.get(schemaId);
  }

  /**
   * Get all schemas
   */
  getAllSchemas(): ServiceSchema[] {
    return Array.from(this.schemas.values());
  }

  /**
   * Save schema
   */
  async saveSchema(schema: ServiceSchema): Promise<void> {
    this.schemas.set(schema['@id'], schema);

    const filePath = path.join(
      this.schemaDir,
      `${schema['@id'].replace('lightdom:', '')}.json`
    );

    fs.writeFileSync(filePath, JSON.stringify(schema, null, 2));

    this.logger.info('Schema saved', { id: schema['@id'] });
    this.emit('schemaUpdated', schema);
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSchemas: number;
    totalServices: number;
    runningServices: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  } {
    const schemas = Array.from(this.schemas.values());
    const services = Array.from(this.services.values());

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    schemas.forEach(schema => {
      byType[schema['lightdom:serviceType']] = 
        (byType[schema['lightdom:serviceType']] || 0) + 1;
    });

    services.forEach(service => {
      byStatus[service.status] = (byStatus[service.status] || 0) + 1;
    });

    return {
      totalSchemas: schemas.length,
      totalServices: services.length,
      runningServices: this.getRunningServices().length,
      byType,
      byStatus,
    };
  }

  /**
   * Shutdown all services
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down all services...');

    const runningServices = this.getRunningServices();

    for (const service of runningServices) {
      try {
        await this.stopService(service.id);
      } catch (error) {
        this.logger.error('Failed to stop service during shutdown', {
          service: service.id,
          error,
        });
      }
    }

    this.logger.info('All services shutdown complete');
  }
}

export default SchemaServiceFactory;
