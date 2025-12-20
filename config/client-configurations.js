/**
 * Example Client Configurations
 * 
 * This file contains example configurations for different client types
 * demonstrating how to configure per-client Swagger access and services.
 */

export const exampleClientConfigurations = {
  // Premium Client - Full Access
  'premium-client-123': {
    clientId: 'premium-client-123',
    allowClientSwagger: true,
    enabledServices: ['seo', 'analytics', 'crawler', 'blockchain', 'rag'],
    apiKey: process.env.PREMIUM_CLIENT_123_API_KEY || 'premium-api-key-12345678',
    rateLimit: {
      windowMs: 60000, // 1 minute
      max: 1000 // 1000 requests per minute
    },
    features: {
      advancedAnalytics: true,
      blockchainMining: true,
      aiChat: true,
      customDomain: true
    }
  },

  // Standard Client - Standard Access
  'standard-client-456': {
    clientId: 'standard-client-456',
    allowClientSwagger: true,
    enabledServices: ['seo', 'analytics', 'crawler'],
    apiKey: process.env.STANDARD_CLIENT_456_API_KEY || 'standard-api-key-87654321',
    rateLimit: {
      windowMs: 900000, // 15 minutes
      max: 500 // 500 requests per 15 minutes
    },
    features: {
      advancedAnalytics: false,
      blockchainMining: false,
      aiChat: false,
      customDomain: false
    }
  },

  // Basic Client - Limited Access (Swagger Disabled)
  'basic-client-789': {
    clientId: 'basic-client-789',
    allowClientSwagger: false, // Swagger UI disabled for this client
    enabledServices: ['seo'], // Only SEO service enabled
    apiKey: process.env.BASIC_CLIENT_789_API_KEY || 'basic-api-key-11223344',
    rateLimit: {
      windowMs: 900000, // 15 minutes
      max: 100 // 100 requests per 15 minutes
    },
    features: {
      advancedAnalytics: false,
      blockchainMining: false,
      aiChat: false,
      customDomain: false
    }
  },

  // Enterprise Client - Full Custom Access
  'enterprise-client-abc': {
    clientId: 'enterprise-client-abc',
    allowClientSwagger: true,
    enabledServices: ['seo', 'analytics', 'crawler', 'blockchain', 'rag', 'admin'],
    apiKey: process.env.ENTERPRISE_CLIENT_ABC_API_KEY || 'enterprise-api-key-abcdef12',
    rateLimit: {
      windowMs: 60000, // 1 minute
      max: 5000 // 5000 requests per minute
    },
    features: {
      advancedAnalytics: true,
      blockchainMining: true,
      aiChat: true,
      customDomain: true,
      whiteLabel: true,
      dedicatedSupport: true,
      customIntegrations: true
    },
    customization: {
      brandName: 'Enterprise Corp',
      logoUrl: 'https://example.com/logo.png',
      primaryColor: '#007bff',
      secondaryColor: '#6c757d'
    }
  },

  // Developer/Testing Client - Full Access with Verbose Logging
  'dev-client-test': {
    clientId: 'dev-client-test',
    allowClientSwagger: true,
    enabledServices: ['seo', 'analytics', 'crawler', 'blockchain', 'rag'],
    apiKey: process.env.DEV_CLIENT_TEST_API_KEY || 'dev-api-key-test1234',
    rateLimit: {
      windowMs: 60000, // 1 minute
      max: 10000 // Very high limit for testing
    },
    features: {
      advancedAnalytics: true,
      blockchainMining: true,
      aiChat: true,
      customDomain: false,
      verboseLogging: true,
      debugMode: true
    },
    development: {
      enableTestEndpoints: true,
      mockData: false,
      logAllRequests: true
    }
  }
};

/**
 * Get client configuration by ID
 * 
 * In production, this would fetch from a database.
 * For now, it returns from the example configurations above.
 */
export function getClientConfiguration(clientId) {
  const config = exampleClientConfigurations[clientId];
  
  if (!config) {
    // Return default configuration for unknown clients
    return {
      clientId,
      allowClientSwagger: false,
      enabledServices: ['seo'],
      apiKey: null,
      rateLimit: {
        windowMs: 900000,
        max: 50
      },
      features: {
        advancedAnalytics: false,
        blockchainMining: false,
        aiChat: false,
        customDomain: false
      }
    };
  }
  
  return config;
}

/**
 * Validate client API key
 */
export function validateClientApiKey(clientId, apiKey) {
  const config = getClientConfiguration(clientId);
  return config && config.apiKey === apiKey;
}

/**
 * Check if client has access to a specific service
 */
export function clientHasServiceAccess(clientId, serviceName) {
  const config = getClientConfiguration(clientId);
  return config && config.enabledServices.includes(serviceName);
}

/**
 * Get client rate limit configuration
 */
export function getClientRateLimit(clientId) {
  const config = getClientConfiguration(clientId);
  return config ? config.rateLimit : {
    windowMs: 900000,
    max: 100
  };
}

/**
 * List all available services
 */
export const availableServices = [
  {
    id: 'seo',
    name: 'SEO Optimization',
    description: 'Header script injection and SEO optimization tools',
    endpoints: [
      '/api/seo/header-script/inject',
      '/api/seo/header-script/strategy/{clientId}',
      '/api/seo/header-script/health'
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Usage analytics and metrics tracking',
    endpoints: [
      '/api/analytics/metrics',
      '/api/analytics/reports',
      '/api/analytics/dashboard'
    ]
  },
  {
    id: 'crawler',
    name: 'Web Crawler',
    description: 'DOM harvesting and web crawling operations',
    endpoints: [
      '/api/crawler/start',
      '/api/crawler/status',
      '/api/crawler/results'
    ]
  },
  {
    id: 'blockchain',
    name: 'Blockchain Mining',
    description: 'Proof of optimization blockchain operations',
    endpoints: [
      '/api/blockchain/mine',
      '/api/blockchain/status',
      '/api/blockchain/rewards'
    ]
  },
  {
    id: 'rag',
    name: 'RAG Chat',
    description: 'AI-powered retrieval augmented generation',
    endpoints: [
      '/api/rag/chat',
      '/api/rag/history',
      '/api/rag/context'
    ]
  }
];

export default {
  exampleClientConfigurations,
  getClientConfiguration,
  validateClientApiKey,
  clientHasServiceAccess,
  getClientRateLimit,
  availableServices
};
