/**
 * Enterprise Swagger Configuration System
 * 
 * This module provides a comprehensive Swagger/OpenAPI configuration
 * for the LightDom API with support for:
 * - Dynamic API endpoints
 * - Per-client Swagger instances
 * - Security schemes and authentication
 * - Example configurations for all endpoints
 * - Client-specific service loading
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Base Swagger configuration
 */
export const baseSwaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LightDom Space Bridge Platform API',
      version: '1.0.0',
      description: `
        Enterprise-grade API for DOM optimization, blockchain mining, and SEO enhancement.
        
        ## Features
        - DOM Space Harvesting and Optimization
        - Blockchain-based Proof of Optimization
        - AI-powered SEO Strategy Injection
        - Real-time Web Crawler System
        - Metaverse Integration
        - RAG-based Chat System
        
        ## Authentication
        Most endpoints require authentication via API Key or JWT token.
        Configure your credentials in the security section below.
      `,
      contact: {
        name: 'LightDom API Support',
        email: 'support@lightdom.io',
        url: 'https://lightdom.io/support'
      },
      license: {
        name: 'Private Use',
        url: 'https://lightdom.io/license'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.lightdom.io',
        description: 'Production server'
      },
      {
        url: 'https://staging-api.lightdom.io',
        description: 'Staging server'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for client authentication'
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token for user authentication'
        },
        ClientIdAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Client-Id',
          description: 'Client ID for multi-tenant access control'
        },
        OAuth2: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://auth.lightdom.io/oauth/authorize',
              tokenUrl: 'https://auth.lightdom.io/oauth/token',
              scopes: {
                'read:api': 'Read access to API',
                'write:api': 'Write access to API',
                'admin:api': 'Admin access to API',
                'seo:inject': 'Access to SEO injection service',
                'crawler:manage': 'Manage crawler operations',
                'blockchain:mine': 'Access blockchain mining operations'
              }
            }
          }
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code'
            },
            details: {
              type: 'object',
              description: 'Additional error details'
            }
          },
          required: ['error']
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1
            },
            perPage: {
              type: 'integer',
              example: 20
            },
            total: {
              type: 'integer',
              example: 100
            },
            totalPages: {
              type: 'integer',
              example: 5
            }
          }
        },
        SEOStrategy: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'seo-strategy-123'
            },
            clientId: {
              type: 'string',
              example: 'client-abc-456'
            },
            scriptUrl: {
              type: 'string',
              example: 'https://cdn.lightdom.io/seo-scripts/client-abc-456.js'
            },
            enabled: {
              type: 'boolean',
              example: true
            },
            strategy: {
              type: 'object',
              properties: {
                keywords: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['web optimization', 'dom harvesting', 'seo enhancement']
                },
                metadata: {
                  type: 'object',
                  example: {
                    title: 'Enhanced with LightDom',
                    description: 'Optimized web experience'
                  }
                },
                structuredData: {
                  type: 'object',
                  example: {
                    '@context': 'https://schema.org',
                    '@type': 'WebPage'
                  }
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-03T20:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-03T20:00:00Z'
            }
          }
        }
      },
      parameters: {
        ClientIdHeader: {
          name: 'X-Client-Id',
          in: 'header',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Client identifier for multi-tenant access'
        },
        PageParam: {
          name: 'page',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          },
          description: 'Page number for pagination'
        },
        PerPageParam: {
          name: 'perPage',
          in: 'query',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 20
          },
          description: 'Number of items per page'
        }
      },
      responses: {
        Unauthorized: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Unauthorized',
                code: 'AUTH_REQUIRED'
              }
            }
          }
        },
        Forbidden: {
          description: 'Access forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Forbidden',
                code: 'ACCESS_DENIED'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Not Found',
                code: 'RESOURCE_NOT_FOUND'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Internal Server Error',
                code: 'INTERNAL_ERROR'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'SEO',
        description: 'SEO optimization and header script injection endpoints'
      },
      {
        name: 'Client Services',
        description: 'Per-client service management and configuration'
      },
      {
        name: 'Crawler',
        description: 'Web crawler and DOM harvesting operations'
      },
      {
        name: 'Blockchain',
        description: 'Blockchain mining and proof of optimization'
      },
      {
        name: 'Analytics',
        description: 'Analytics and metrics endpoints'
      },
      {
        name: 'RAG',
        description: 'Retrieval Augmented Generation chat system'
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints'
      }
    ]
  },
  apis: [
    path.join(__dirname, '../api/**/*.js'),
    path.join(__dirname, '../api-server-express.js'),
    path.join(__dirname, '../services/**/*.js')
  ]
};

/**
 * Client-specific Swagger configuration
 */
export class ClientSwaggerConfig {
  constructor(clientId, clientConfig = {}) {
    this.clientId = clientId;
    this.config = clientConfig;
    this.allowClientSwagger = clientConfig.allowClientSwagger !== false;
    this.enabledServices = clientConfig.enabledServices || ['seo', 'analytics'];
  }

  /**
   * Generate client-specific Swagger spec
   */
  generateSpec(baseSpec) {
    if (!this.allowClientSwagger) {
      return null;
    }

    // Clone base spec
    const clientSpec = JSON.parse(JSON.stringify(baseSpec));

    // Update info for client
    clientSpec.info.title = `${clientSpec.info.title} - Client: ${this.clientId}`;
    clientSpec.info.description += `\n\n## Client Configuration\n- Client ID: ${this.clientId}\n- Enabled Services: ${this.enabledServices.join(', ')}`;

    // Filter paths based on enabled services
    const filteredPaths = {};
    Object.entries(clientSpec.paths || {}).forEach(([path, methods]) => {
      // Check if path belongs to enabled services
      const pathService = this.getServiceFromPath(path);
      if (!pathService || this.enabledServices.includes(pathService)) {
        filteredPaths[path] = methods;
      }
    });
    clientSpec.paths = filteredPaths;

    // Add client-specific server
    clientSpec.servers = [
      {
        url: `http://localhost:3001/client/${this.clientId}`,
        description: `Client ${this.clientId} endpoint`
      },
      ...clientSpec.servers
    ];

    return clientSpec;
  }

  /**
   * Determine service from API path
   */
  getServiceFromPath(path) {
    if (path.includes('/seo')) return 'seo';
    if (path.includes('/crawler')) return 'crawler';
    if (path.includes('/blockchain')) return 'blockchain';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/rag')) return 'rag';
    if (path.includes('/admin')) return 'admin';
    return null;
  }
}

/**
 * Service configurations for different client types
 */
export const serviceConfigurations = {
  seo: {
    name: 'SEO Header Script Injection',
    description: 'Inject SEO optimization scripts into client websites',
    endpoints: [
      '/api/seo/header-script',
      '/api/seo/strategy',
      '/api/seo/inject',
      '/api/seo/analytics'
    ],
    requiredAuth: ['ApiKeyAuth', 'ClientIdAuth']
  },
  crawler: {
    name: 'Web Crawler Service',
    description: 'DOM harvesting and web crawling operations',
    endpoints: [
      '/api/crawler/start',
      '/api/crawler/status',
      '/api/crawler/results'
    ],
    requiredAuth: ['ApiKeyAuth']
  },
  blockchain: {
    name: 'Blockchain Mining',
    description: 'Proof of optimization blockchain operations',
    endpoints: [
      '/api/blockchain/mine',
      '/api/blockchain/status',
      '/api/blockchain/rewards'
    ],
    requiredAuth: ['ApiKeyAuth', 'BearerAuth']
  },
  analytics: {
    name: 'Analytics Service',
    description: 'Usage analytics and metrics',
    endpoints: [
      '/api/analytics/metrics',
      '/api/analytics/reports',
      '/api/analytics/dashboard'
    ],
    requiredAuth: ['BearerAuth']
  },
  rag: {
    name: 'RAG Chat System',
    description: 'AI-powered retrieval augmented generation',
    endpoints: [
      '/api/rag/chat',
      '/api/rag/history',
      '/api/rag/context'
    ],
    requiredAuth: ['BearerAuth']
  }
};

/**
 * Get client configuration by ID
 */
export function getClientConfig(clientId) {
  // Import client configurations
  import('./client-configurations.js')
    .then(mod => {
      return mod.getClientConfiguration(clientId);
    })
    .catch(err => {
      console.warn('Failed to load client configurations:', err.message);
      return getDefaultClientConfig(clientId);
    });
  
  // Return default while loading
  return getDefaultClientConfig(clientId);
}

/**
 * Get default client configuration
 */
function getDefaultClientConfig(clientId) {
  // In a real implementation, this would fetch from database
  // For now, return a default configuration
  return {
    allowClientSwagger: true,
    enabledServices: ['seo', 'analytics'],
    apiKey: process.env[`CLIENT_${clientId.toUpperCase().replace(/-/g, '_')}_API_KEY`],
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 100
    }
  };
}

/**
 * Swagger UI options
 */
export const swaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .scheme-container { background: #fafafa; padding: 20px; margin-bottom: 20px; }
  `,
  customSiteTitle: 'LightDom API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    docExpansion: 'list',
    deepLinking: true
  }
};

export default {
  baseSwaggerConfig,
  ClientSwaggerConfig,
  serviceConfigurations,
  getClientConfig,
  swaggerUiOptions
};
