/**
 * Swagger Service - Dynamic API Documentation Generator
 * 
 * Provides enterprise-level Swagger/OpenAPI documentation with:
 * - Dynamic endpoint discovery
 * - Per-client Swagger instances
 * - Security and access control
 * - Real-time API specification updates
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import {
  baseSwaggerConfig,
  ClientSwaggerConfig,
  serviceConfigurations,
  getClientConfig,
  swaggerUiOptions
} from '../config/swagger-config.js';

/**
 * Swagger Service class
 */
export class SwaggerService {
  constructor(app, options = {}) {
    this.app = app;
    this.options = options;
    this.baseSpec = null;
    this.clientSpecs = new Map();
    this.dynamicEndpoints = new Map();
  }

  /**
   * Initialize Swagger documentation
   */
  async initialize() {
    console.log('🔧 Initializing Swagger documentation...');

    try {
      // Generate base OpenAPI specification
      this.baseSpec = swaggerJsdoc(baseSwaggerConfig);
      
      // Add dynamic endpoints
      this.addDynamicEndpoints();

      // Setup main Swagger UI endpoint
      this.setupMainSwaggerUI();

      // Setup client-specific Swagger endpoints
      this.setupClientSwaggerEndpoints();

      // Setup Swagger JSON endpoints
      this.setupSwaggerJsonEndpoints();

      // Setup service-specific Swagger endpoints
      this.setupServiceSwaggerEndpoints();

      console.log('✅ Swagger documentation initialized successfully');
      console.log('📚 Main Swagger UI available at: /api-docs');
      console.log('📚 Swagger JSON available at: /api-docs/swagger.json');
      console.log('📚 Client-specific docs available at: /api-docs/client/:clientId');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Swagger documentation:', error);
      return false;
    }
  }

  /**
   * Add dynamic endpoints to specification
   */
  addDynamicEndpoints() {
    // SEO Header Script Injection endpoints
    this.addEndpointDocs('/api/seo/header-script/inject', {
      post: {
        tags: ['SEO'],
        summary: 'Inject SEO header script for client',
        description: `
          Generates and injects a customized SEO optimization script into the client's website.
          The script includes:
          - Meta tag optimization
          - Structured data injection
          - Performance monitoring
          - Analytics integration
        `,
        operationId: 'injectSeoScript',
        security: [
          { ApiKeyAuth: [] },
          { ClientIdAuth: [] }
        ],
        parameters: [
          {
            $ref: '#/components/parameters/ClientIdHeader'
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['domain', 'strategy'],
                properties: {
                  domain: {
                    type: 'string',
                    example: 'example.com',
                    description: 'Target domain for script injection'
                  },
                  strategy: {
                    type: 'object',
                    description: 'SEO strategy configuration',
                    properties: {
                      keywords: {
                        type: 'array',
                        items: { type: 'string' },
                        example: ['web optimization', 'performance', 'seo']
                      },
                      metadata: {
                        type: 'object',
                        example: {
                          title: 'Example Site - Optimized',
                          description: 'High-performance website'
                        }
                      },
                      structuredData: {
                        type: 'object',
                        example: {
                          '@context': 'https://schema.org',
                          '@type': 'WebSite',
                          name: 'Example Site',
                          url: 'https://example.com'
                        }
                      }
                    }
                  },
                  options: {
                    type: 'object',
                    properties: {
                      async: {
                        type: 'boolean',
                        default: true,
                        description: 'Load script asynchronously'
                      },
                      defer: {
                        type: 'boolean',
                        default: false,
                        description: 'Defer script execution'
                      },
                      position: {
                        type: 'string',
                        enum: ['head', 'body-start', 'body-end'],
                        default: 'head',
                        description: 'Script injection position'
                      }
                    }
                  }
                }
              },
              examples: {
                basic: {
                  summary: 'Basic SEO injection',
                  value: {
                    domain: 'example.com',
                    strategy: {
                      keywords: ['web optimization', 'performance'],
                      metadata: {
                        title: 'Example Site',
                        description: 'High-performance website'
                      }
                    }
                  }
                },
                advanced: {
                  summary: 'Advanced with structured data',
                  value: {
                    domain: 'example.com',
                    strategy: {
                      keywords: ['e-commerce', 'shopping', 'products'],
                      metadata: {
                        title: 'Example Shop',
                        description: 'Premium online store'
                      },
                      structuredData: {
                        '@context': 'https://schema.org',
                        '@type': 'Store',
                        name: 'Example Shop',
                        url: 'https://example.com'
                      }
                    },
                    options: {
                      async: true,
                      position: 'head'
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Script injected successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    scriptUrl: {
                      type: 'string',
                      example: 'https://cdn.lightdom.io/seo-scripts/client-abc-456.js'
                    },
                    scriptTag: {
                      type: 'string',
                      example: '<script async src="https://cdn.lightdom.io/seo-scripts/client-abc-456.js"></script>'
                    },
                    strategyId: {
                      type: 'string',
                      example: 'seo-strategy-789'
                    },
                    message: {
                      type: 'string',
                      example: 'SEO script injected successfully'
                    }
                  }
                }
              }
            }
          },
          400: {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: {
                  error: 'Invalid domain format',
                  code: 'INVALID_REQUEST'
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    });

    // Get SEO Strategy endpoint
    this.addEndpointDocs('/api/seo/strategy/{clientId}', {
      get: {
        tags: ['SEO'],
        summary: 'Get SEO strategy for client',
        description: 'Retrieve the current SEO optimization strategy for a specific client',
        operationId: 'getSeoStrategy',
        security: [
          { ApiKeyAuth: [] },
          { ClientIdAuth: [] }
        ],
        parameters: [
          {
            name: 'clientId',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'Client identifier',
            example: 'client-abc-456'
          }
        ],
        responses: {
          200: {
            description: 'SEO strategy retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SEOStrategy'
                }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' },
          401: { $ref: '#/components/responses/Unauthorized' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    });

    // Health check endpoint
    this.addEndpointDocs('/api/health', {
      get: {
        tags: ['Admin'],
        summary: 'Health check endpoint',
        description: 'Check API health status',
        operationId: 'healthCheck',
        responses: {
          200: {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok'
                    },
                    timestamp: {
                      type: 'string',
                      format: 'date-time'
                    },
                    version: {
                      type: 'string',
                      example: '1.0.0'
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  /**
   * Add endpoint documentation dynamically
   */
  addEndpointDocs(path, docs) {
    if (!this.baseSpec.paths) {
      this.baseSpec.paths = {};
    }
    this.baseSpec.paths[path] = docs;
    this.dynamicEndpoints.set(path, docs);
  }

  /**
   * Setup main Swagger UI
   */
  setupMainSwaggerUI() {
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(this.baseSpec, swaggerUiOptions)
    );
  }

  /**
   * Setup client-specific Swagger endpoints
   */
  setupClientSwaggerEndpoints() {
    // Dynamic client swagger endpoint
    this.app.get('/api-docs/client/:clientId', async (req, res) => {
      try {
        const { clientId } = req.params;
        
        // Check if client has swagger enabled
        const clientConfig = getClientConfig(clientId);
        
        if (!clientConfig.allowClientSwagger) {
          return res.status(403).json({
            error: 'Swagger documentation not enabled for this client',
            code: 'SWAGGER_DISABLED'
          });
        }

        // Generate or retrieve cached client spec
        let clientSpec = this.clientSpecs.get(clientId);
        
        if (!clientSpec) {
          const swaggerConfig = new ClientSwaggerConfig(clientId, clientConfig);
          clientSpec = swaggerConfig.generateSpec(this.baseSpec);
          this.clientSpecs.set(clientId, clientSpec);
        }

        // Serve client-specific Swagger UI
        const html = swaggerUi.generateHTML(clientSpec, swaggerUiOptions);
        res.send(html);
      } catch (error) {
        console.error('Error serving client Swagger:', error);
        res.status(500).json({
          error: 'Failed to generate Swagger documentation',
          code: 'SWAGGER_ERROR',
          details: error.message
        });
      }
    });

    // Client Swagger JSON endpoint
    this.app.get('/api-docs/client/:clientId/swagger.json', async (req, res) => {
      try {
        const { clientId } = req.params;
        const clientConfig = getClientConfig(clientId);
        
        if (!clientConfig.allowClientSwagger) {
          return res.status(403).json({
            error: 'Swagger documentation not enabled for this client'
          });
        }

        let clientSpec = this.clientSpecs.get(clientId);
        
        if (!clientSpec) {
          const swaggerConfig = new ClientSwaggerConfig(clientId, clientConfig);
          clientSpec = swaggerConfig.generateSpec(this.baseSpec);
          this.clientSpecs.set(clientId, clientSpec);
        }

        res.json(clientSpec);
      } catch (error) {
        console.error('Error serving client Swagger JSON:', error);
        res.status(500).json({
          error: 'Failed to generate Swagger specification',
          details: error.message
        });
      }
    });
  }

  /**
   * Setup Swagger JSON endpoints
   */
  setupSwaggerJsonEndpoints() {
    // Main Swagger JSON
    this.app.get('/api-docs/swagger.json', (req, res) => {
      res.json(this.baseSpec);
    });

    // OpenAPI spec endpoint
    this.app.get('/api/openapi.json', (req, res) => {
      res.json(this.baseSpec);
    });
  }

  /**
   * Setup service-specific Swagger endpoints
   */
  setupServiceSwaggerEndpoints() {
    Object.entries(serviceConfigurations).forEach(([serviceName, config]) => {
      this.app.get(`/api-docs/service/${serviceName}`, (req, res) => {
        try {
          // Filter spec to only include endpoints for this service
          const serviceSpec = this.filterSpecByService(serviceName, config);
          const html = swaggerUi.generateHTML(serviceSpec, swaggerUiOptions);
          res.send(html);
        } catch (error) {
          console.error(`Error serving ${serviceName} Swagger:`, error);
          res.status(500).json({
            error: 'Failed to generate service documentation',
            service: serviceName
          });
        }
      });
    });
  }

  /**
   * Filter specification by service
   */
  filterSpecByService(serviceName, serviceConfig) {
    const serviceSpec = JSON.parse(JSON.stringify(this.baseSpec));
    
    // Update info
    serviceSpec.info.title = `${serviceConfig.name} API`;
    serviceSpec.info.description = serviceConfig.description;

    // Filter paths
    const filteredPaths = {};
    Object.entries(serviceSpec.paths || {}).forEach(([path, methods]) => {
      if (serviceConfig.endpoints.some(endpoint => path.startsWith(endpoint))) {
        filteredPaths[path] = methods;
      }
    });
    serviceSpec.paths = filteredPaths;

    return serviceSpec;
  }

  /**
   * Refresh Swagger specification
   */
  async refresh() {
    console.log('🔄 Refreshing Swagger documentation...');
    this.baseSpec = swaggerJsdoc(baseSwaggerConfig);
    this.addDynamicEndpoints();
    this.clientSpecs.clear();
    console.log('✅ Swagger documentation refreshed');
  }

  /**
   * Get list of available service documentation
   */
  getAvailableServices() {
    return Object.entries(serviceConfigurations).map(([key, config]) => ({
      name: key,
      title: config.name,
      description: config.description,
      docsUrl: `/api-docs/service/${key}`,
      endpoints: config.endpoints
    }));
  }
}

/**
 * Create and initialize Swagger service
 */
export async function setupSwagger(app, options = {}) {
  const swaggerService = new SwaggerService(app, options);
  await swaggerService.initialize();
  return swaggerService;
}

export default SwaggerService;
