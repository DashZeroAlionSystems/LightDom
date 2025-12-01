# API Management Service - Complete Guide

## Overview

The API Management Service is a comprehensive system for discovering, bundling, and orchestrating API endpoints into reusable services and campaigns. It enables dynamic service creation, real-time endpoint monitoring, and automated workflow generation.

## Table of Contents

1. [Architecture](#architecture)
2. [Core Concepts](#core-concepts)
3. [Database Schema](#database-schema)
4. [API Discovery](#api-discovery)
5. [Service Bundling](#service-bundling)
6. [Service Router](#service-router)
7. [Real-time Endpoint Watcher](#real-time-endpoint-watcher)
8. [Configuration System](#configuration-system)
9. [API Reference](#api-reference)
10. [Usage Examples](#usage-examples)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     API Management Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Endpoint   │  │   Service    │  │   Campaign   │          │
│  │   Discovery  │  │   Bundler    │  │  Orchestrator│          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Service Router Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Dynamic    │  │  Middleware  │  │    Route     │          │
│  │   Routing    │  │    Chain     │  │  Validation  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   Real-time Watcher Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   File       │  │  Code Path   │  │   Database   │          │
│  │   Watcher    │  │   Scanner    │  │    Monitor   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Configuration Store                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Endpoints  │  │   Services   │  │  Campaigns   │          │
│  │   Registry   │  │   Bundles    │  │    Config    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Concepts

### 1. **API Endpoint**
A single API route with metadata:
- **Method**: GET, POST, PUT, DELETE, PATCH
- **Path**: URL path pattern (e.g., `/api/users/:id`)
- **Handler**: Controller function
- **Middleware**: Authentication, validation, rate limiting
- **Schema**: Input/output validation schemas
- **Metadata**: Description, tags, versioning

### 2. **Service Bundle**
A collection of related endpoints grouped together:
- **Name**: Service identifier
- **Endpoints**: List of API endpoints
- **Base Path**: Common URL prefix
- **Configuration**: Service-level settings
- **Metadata**: Description, owner, tags

### 3. **Campaign**
A workflow orchestrating multiple services:
- **Services**: Collection of service bundles
- **Workflow**: Execution flow (sequential, parallel, DAG)
- **Configuration**: Campaign-level settings
- **Triggers**: Event-based activation
- **Metadata**: Description, goals, metrics

### 4. **Attributes & Configuration**
Schema-driven configuration system:
- **Attribute Schema**: JSON schema for configuration
- **Validation**: Automatic validation
- **Defaults**: Default values
- **Environment Overrides**: Environment-specific settings
- **Hot Reload**: Runtime configuration updates

---

## Database Schema

### Endpoints Registry

```sql
-- API Endpoints Registry
CREATE TABLE IF NOT EXISTS api_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
    path VARCHAR(500) NOT NULL,
    handler_path VARCHAR(500) NOT NULL,
    description TEXT,
    tags TEXT[],
    version VARCHAR(50) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    auth_required BOOLEAN DEFAULT true,
    rate_limit INTEGER DEFAULT 100,
    schema_id UUID REFERENCES schemas(id),
    middleware_chain JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    UNIQUE(method, path, version)
);

-- Service Bundles
CREATE TABLE IF NOT EXISTS service_bundles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    base_path VARCHAR(255) NOT NULL,
    version VARCHAR(50) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- Service Endpoint Mapping
CREATE TABLE IF NOT EXISTS service_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES service_bundles(id) ON DELETE CASCADE,
    endpoint_id UUID NOT NULL REFERENCES api_endpoints(id) ON DELETE CASCADE,
    service_path VARCHAR(500),
    order_index INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(service_id, endpoint_id)
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    description TEXT,
    campaign_type VARCHAR(100) DEFAULT 'workflow',
    is_active BOOLEAN DEFAULT true,
    workflow_config JSONB DEFAULT '{}',
    trigger_config JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- Campaign Services Mapping
CREATE TABLE IF NOT EXISTS campaign_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES service_bundles(id) ON DELETE CASCADE,
    execution_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, service_id)
);

-- Endpoint Change Log (for real-time watcher)
CREATE TABLE IF NOT EXISTS endpoint_changelog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint_id UUID REFERENCES api_endpoints(id) ON DELETE SET NULL,
    change_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted'
    old_value JSONB,
    new_value JSONB,
    detected_by VARCHAR(100), -- 'file_watcher', 'code_scanner', 'manual'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_api_endpoints_method_path ON api_endpoints(method, path);
CREATE INDEX idx_api_endpoints_tags ON api_endpoints USING gin(tags);
CREATE INDEX idx_api_endpoints_is_active ON api_endpoints(is_active);
CREATE INDEX idx_service_bundles_name ON service_bundles(name);
CREATE INDEX idx_service_bundles_is_active ON service_bundles(is_active);
CREATE INDEX idx_campaigns_name ON campaigns(name);
CREATE INDEX idx_campaigns_is_active ON campaigns(is_active);
CREATE INDEX idx_endpoint_changelog_endpoint_id ON endpoint_changelog(endpoint_id);
CREATE INDEX idx_endpoint_changelog_change_type ON endpoint_changelog(change_type);

-- Update timestamp triggers
CREATE TRIGGER update_api_endpoints_updated_at BEFORE UPDATE ON api_endpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_bundles_updated_at BEFORE UPDATE ON service_bundles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## API Discovery

### Automatic Endpoint Discovery

The API Discovery service automatically finds and registers endpoints from:

1. **Code Files**: Scan Express route files
2. **Database**: Query existing route configurations
3. **Documentation**: Parse OpenAPI/Swagger specs
4. **Runtime**: Monitor registered routes

### Implementation

```javascript
// services/api-discovery-service.js
import fs from 'fs/promises';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

export class APIDiscoveryService {
  constructor(dbPool) {
    this.db = dbPool;
    this.discoveredEndpoints = new Map();
  }

  /**
   * Scan directory for route files
   */
  async scanDirectory(dirPath, options = {}) {
    const {
      patterns = ['*-routes.js', '*-api.js', 'routes/*.js'],
      exclude = ['node_modules', 'test', 'dist']
    } = options;

    const endpoints = [];
    const files = await this.findRouteFiles(dirPath, patterns, exclude);

    for (const file of files) {
      const fileEndpoints = await this.parseRouteFile(file);
      endpoints.push(...fileEndpoints);
    }

    return endpoints;
  }

  /**
   * Parse a route file to extract endpoints
   */
  async parseRouteFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });

    const endpoints = [];
    const self = this;

    traverse(ast, {
      CallExpression(path) {
        // Look for app.get(), app.post(), router.get(), etc.
        if (
          path.node.callee.type === 'MemberExpression' &&
          path.node.callee.property.type === 'Identifier'
        ) {
          const method = path.node.callee.property.name.toUpperCase();
          const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

          if (validMethods.includes(method)) {
            const args = path.node.arguments;
            if (args.length >= 2 && args[0].type === 'StringLiteral') {
              const routePath = args[0].value;
              endpoints.push({
                method,
                path: routePath,
                handler_path: filePath,
                detected_by: 'code_scanner'
              });
            }
          }
        }
      }
    });

    return endpoints;
  }

  /**
   * Register discovered endpoints in database
   */
  async registerEndpoints(endpoints) {
    const registered = [];

    for (const endpoint of endpoints) {
      try {
        const result = await this.db.query(
          `INSERT INTO api_endpoints 
           (name, method, path, handler_path, metadata)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (method, path, version) 
           DO UPDATE SET 
             handler_path = EXCLUDED.handler_path,
             updated_at = CURRENT_TIMESTAMP
           RETURNING *`,
          [
            endpoint.name || `${endpoint.method}_${endpoint.path}`,
            endpoint.method,
            endpoint.path,
            endpoint.handler_path,
            JSON.stringify({ detected_by: endpoint.detected_by })
          ]
        );
        registered.push(result.rows[0]);
      } catch (error) {
        console.error(`Failed to register endpoint ${endpoint.path}:`, error);
      }
    }

    return registered;
  }

  /**
   * Get all registered endpoints
   */
  async getAllEndpoints(filters = {}) {
    const { method, tags, is_active = true } = filters;
    
    let query = 'SELECT * FROM api_endpoints WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (method) {
      query += ` AND method = $${paramCount++}`;
      params.push(method);
    }

    if (tags && tags.length > 0) {
      query += ` AND tags && $${paramCount++}`;
      params.push(tags);
    }

    if (is_active !== undefined) {
      query += ` AND is_active = $${paramCount++}`;
      params.push(is_active);
    }

    query += ' ORDER BY path';

    const result = await this.db.query(query, params);
    return result.rows;
  }
}
```

---

## Service Bundling

### Creating Service Bundles

Service bundles group related endpoints under a common namespace:

```javascript
// services/service-bundler.js
export class ServiceBundler {
  constructor(dbPool) {
    this.db = dbPool;
  }

  /**
   * Create a new service bundle
   */
  async createService(serviceData) {
    const {
      name,
      display_name,
      description,
      base_path,
      endpoints = [],
      config = {}
    } = serviceData;

    // Create service bundle
    const serviceResult = await this.db.query(
      `INSERT INTO service_bundles 
       (name, display_name, description, base_path, config)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, display_name, description, base_path, JSON.stringify(config)]
    );

    const service = serviceResult.rows[0];

    // Add endpoints to service
    if (endpoints.length > 0) {
      await this.addEndpointsToService(service.id, endpoints);
    }

    return service;
  }

  /**
   * Add endpoints to existing service
   */
  async addEndpointsToService(serviceId, endpoints) {
    const mappings = [];

    for (const endpoint of endpoints) {
      const result = await this.db.query(
        `INSERT INTO service_endpoints 
         (service_id, endpoint_id, service_path, order_index, config)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (service_id, endpoint_id) DO NOTHING
         RETURNING *`,
        [
          serviceId,
          endpoint.id,
          endpoint.service_path || null,
          endpoint.order_index || 0,
          JSON.stringify(endpoint.config || {})
        ]
      );
      
      if (result.rows.length > 0) {
        mappings.push(result.rows[0]);
      }
    }

    return mappings;
  }

  /**
   * Get service with endpoints
   */
  async getService(serviceId) {
    const serviceResult = await this.db.query(
      'SELECT * FROM service_bundles WHERE id = $1',
      [serviceId]
    );

    if (serviceResult.rows.length === 0) {
      throw new Error('Service not found');
    }

    const service = serviceResult.rows[0];

    // Get endpoints
    const endpointsResult = await this.db.query(
      `SELECT 
        ae.*,
        se.service_path,
        se.order_index,
        se.config as mapping_config
       FROM service_endpoints se
       JOIN api_endpoints ae ON ae.id = se.endpoint_id
       WHERE se.service_id = $1
       ORDER BY se.order_index`,
      [serviceId]
    );

    service.endpoints = endpointsResult.rows;

    return service;
  }

  /**
   * Generate service router dynamically
   */
  async generateServiceRouter(serviceId) {
    const service = await this.getService(serviceId);
    
    return {
      basePath: service.base_path,
      routes: service.endpoints.map(endpoint => ({
        method: endpoint.method,
        path: endpoint.service_path || endpoint.path,
        handler: endpoint.handler_path,
        middleware: endpoint.middleware_chain || [],
        schema: endpoint.schema_id
      }))
    };
  }
}
```

---

## Service Router

### Dynamic Route Registration

```javascript
// services/service-router.js
import express from 'express';

export class ServiceRouter {
  constructor(app, serviceBundler) {
    this.app = app;
    this.bundler = serviceBundler;
    this.registeredServices = new Map();
  }

  /**
   * Register a service and its routes
   */
  async registerService(serviceId) {
    const routerConfig = await this.bundler.generateServiceRouter(serviceId);
    const router = express.Router();

    for (const route of routerConfig.routes) {
      const { method, path, handler, middleware } = route;
      
      // Load handler dynamically
      const handlerModule = await import(handler);
      const handlerFn = handlerModule.default || handlerModule[method.toLowerCase()];

      // Register route with middleware
      router[method.toLowerCase()](
        path,
        ...middleware,
        handlerFn
      );
    }

    // Mount router at base path
    this.app.use(routerConfig.basePath, router);
    this.registeredServices.set(serviceId, routerConfig);

    return routerConfig;
  }

  /**
   * Unregister a service
   */
  unregisterService(serviceId) {
    // Note: Express doesn't support dynamic route removal easily
    // This would require router stack manipulation
    this.registeredServices.delete(serviceId);
  }

  /**
   * Get all registered services
   */
  getRegisteredServices() {
    return Array.from(this.registeredServices.values());
  }
}
```

---

## Real-time Endpoint Watcher

### File Watcher Implementation

```javascript
// services/endpoint-watcher.js
import chokidar from 'chokidar';
import { EventEmitter } from 'events';

export class EndpointWatcher extends EventEmitter {
  constructor(dbPool, discoveryService) {
    super();
    this.db = dbPool;
    this.discovery = discoveryService;
    this.watcher = null;
  }

  /**
   * Start watching for endpoint changes
   */
  start(watchPaths = ['./api', './services']) {
    this.watcher = chokidar.watch(watchPaths, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true
    });

    this.watcher
      .on('add', path => this.handleFileChange(path, 'created'))
      .on('change', path => this.handleFileChange(path, 'updated'))
      .on('unlink', path => this.handleFileChange(path, 'deleted'));

    console.log(`Watching for endpoint changes in: ${watchPaths.join(', ')}`);
  }

  /**
   * Handle file changes
   */
  async handleFileChange(filePath, changeType) {
    if (!filePath.match(/\-routes\.js$|\-api\.js$/)) {
      return; // Only process route files
    }

    console.log(`File ${changeType}: ${filePath}`);

    if (changeType === 'deleted') {
      await this.handleEndpointDeletion(filePath);
    } else {
      await this.handleEndpointUpdate(filePath, changeType);
    }
  }

  /**
   * Handle endpoint updates
   */
  async handleEndpointUpdate(filePath, changeType) {
    try {
      const endpoints = await this.discovery.parseRouteFile(filePath);
      const registered = await this.discovery.registerEndpoints(endpoints);

      // Log changes
      for (const endpoint of registered) {
        await this.logChange(endpoint.id, changeType, null, endpoint);
      }

      this.emit('endpoints:updated', { filePath, endpoints: registered });
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }

  /**
   * Handle endpoint deletion
   */
  async handleEndpointDeletion(filePath) {
    try {
      const result = await this.db.query(
        `UPDATE api_endpoints 
         SET is_active = false 
         WHERE handler_path = $1
         RETURNING *`,
        [filePath]
      );

      for (const endpoint of result.rows) {
        await this.logChange(endpoint.id, 'deleted', endpoint, null);
      }

      this.emit('endpoints:deleted', { filePath, count: result.rows.length });
    } catch (error) {
      console.error(`Error handling deletion of ${filePath}:`, error);
    }
  }

  /**
   * Log endpoint changes
   */
  async logChange(endpointId, changeType, oldValue, newValue) {
    await this.db.query(
      `INSERT INTO endpoint_changelog 
       (endpoint_id, change_type, old_value, new_value, detected_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        endpointId,
        changeType,
        oldValue ? JSON.stringify(oldValue) : null,
        newValue ? JSON.stringify(newValue) : null,
        'file_watcher'
      ]
    );
  }

  /**
   * Stop watching
   */
  stop() {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}
```

---

## Configuration System

### Schema-Driven Configuration

```javascript
// services/config-manager.js
import Ajv from 'ajv';

export class ConfigManager {
  constructor(dbPool) {
    this.db = dbPool;
    this.ajv = new Ajv();
    this.configCache = new Map();
  }

  /**
   * Define configuration schema
   */
  async defineSchema(entityType, schema) {
    const result = await this.db.query(
      `INSERT INTO schemas (name, entity_type, schema_definition)
       VALUES ($1, $2, $3)
       ON CONFLICT (entity_type) DO UPDATE SET schema_definition = EXCLUDED.schema_definition
       RETURNING *`,
      [`${entityType}_config`, entityType, JSON.stringify(schema)]
    );

    return result.rows[0];
  }

  /**
   * Validate configuration
   */
  validateConfig(schema, config) {
    const validate = this.ajv.compile(schema);
    const valid = validate(config);

    if (!valid) {
      throw new Error(`Configuration validation failed: ${JSON.stringify(validate.errors)}`);
    }

    return true;
  }

  /**
   * Get configuration with defaults
   */
  async getConfig(entityType, entityId, defaults = {}) {
    const cacheKey = `${entityType}:${entityId}`;
    
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey);
    }

    // Get schema
    const schemaResult = await this.db.query(
      'SELECT schema_definition FROM schemas WHERE entity_type = $1',
      [entityType]
    );

    const schema = schemaResult.rows[0]?.schema_definition || {};

    // Get entity config
    const tableName = entityType === 'endpoint' ? 'api_endpoints' :
                      entityType === 'service' ? 'service_bundles' :
                      'campaigns';

    const entityResult = await this.db.query(
      `SELECT config, metadata FROM ${tableName} WHERE id = $1`,
      [entityId]
    );

    const entityConfig = entityResult.rows[0]?.config || {};
    const metadata = entityResult.rows[0]?.metadata || {};

    // Merge with defaults
    const finalConfig = {
      ...defaults,
      ...entityConfig,
      metadata
    };

    // Validate
    if (schema.properties) {
      this.validateConfig(schema, finalConfig);
    }

    this.configCache.set(cacheKey, finalConfig);
    return finalConfig;
  }

  /**
   * Update configuration
   */
  async updateConfig(entityType, entityId, config) {
    const tableName = entityType === 'endpoint' ? 'api_endpoints' :
                      entityType === 'service' ? 'service_bundles' :
                      'campaigns';

    const result = await this.db.query(
      `UPDATE ${tableName} 
       SET config = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [JSON.stringify(config), entityId]
    );

    // Clear cache
    this.configCache.delete(`${entityType}:${entityId}`);

    return result.rows[0];
  }
}
```

---

## API Reference

### REST Endpoints

#### Endpoint Management

```
GET    /api/management/endpoints
POST   /api/management/endpoints
GET    /api/management/endpoints/:id
PUT    /api/management/endpoints/:id
DELETE /api/management/endpoints/:id

POST   /api/management/endpoints/discover
GET    /api/management/endpoints/changelog
```

#### Service Bundles

```
GET    /api/management/services
POST   /api/management/services
GET    /api/management/services/:id
PUT    /api/management/services/:id
DELETE /api/management/services/:id

POST   /api/management/services/:id/endpoints
GET    /api/management/services/:id/router
POST   /api/management/services/:id/deploy
```

#### Campaigns

```
GET    /api/management/campaigns
POST   /api/management/campaigns
GET    /api/management/campaigns/:id
PUT    /api/management/campaigns/:id
DELETE /api/management/campaigns/:id

POST   /api/management/campaigns/:id/services
POST   /api/management/campaigns/:id/execute
GET    /api/management/campaigns/:id/status
```

---

## Usage Examples

### Example 1: Discover and Register Endpoints

```javascript
const discovery = new APIDiscoveryService(db);

// Scan for endpoints
const endpoints = await discovery.scanDirectory('./api');

// Register them
const registered = await discovery.registerEndpoints(endpoints);

console.log(`Registered ${registered.length} endpoints`);
```

### Example 2: Create a Service Bundle

```javascript
const bundler = new ServiceBundler(db);

// Get endpoints
const userEndpoints = await discovery.getAllEndpoints({ 
  tags: ['user'] 
});

// Create service
const service = await bundler.createService({
  name: 'user-management',
  display_name: 'User Management Service',
  description: 'Complete user CRUD operations',
  base_path: '/services/users',
  endpoints: userEndpoints,
  config: {
    auth_required: true,
    rate_limit: 100
  }
});
```

### Example 3: Watch for Changes

```javascript
const watcher = new EndpointWatcher(db, discovery);

watcher.on('endpoints:updated', ({ filePath, endpoints }) => {
  console.log(`Updated ${endpoints.length} endpoints from ${filePath}`);
});

watcher.start(['./api', './services']);
```

### Example 4: Create a Campaign

```javascript
// Create user management campaign
const campaign = await db.query(
  `INSERT INTO campaigns 
   (name, display_name, description, workflow_config)
   VALUES ($1, $2, $3, $4)
   RETURNING *`,
  [
    'user-onboarding',
    'User Onboarding Campaign',
    'Complete user registration and onboarding workflow',
    JSON.stringify({
      steps: [
        { service: 'user-management', action: 'create' },
        { service: 'email-service', action: 'send-welcome' },
        { service: 'stripe-service', action: 'setup-billing' },
        { service: 'sso-service', action: 'link-accounts' }
      ],
      execution_mode: 'sequential'
    })
  ]
);
```

---

## Best Practices

1. **Use Tags**: Tag endpoints for easy discovery and grouping
2. **Version APIs**: Always version your endpoints
3. **Schema Validation**: Define schemas for all endpoints
4. **Configuration**: Use config schemas for flexible services
5. **Monitoring**: Track endpoint usage and performance
6. **Documentation**: Auto-generate docs from registered endpoints
7. **Testing**: Test service bundles independently
8. **Security**: Always validate and sanitize inputs
9. **Rate Limiting**: Set appropriate rate limits
10. **Error Handling**: Implement consistent error responses

---

## Next Steps

- Implement [User Creation Workflow](./USER_CREATION_WORKFLOW.md)
- Setup [SSO Integration](./SSO_INTEGRATION_GUIDE.md)
- Configure [Stripe Payments](./STRIPE_INTEGRATION_GUIDE.md)
- Setup [Error Handling](./ERROR_HANDLING_GUIDE.md)
- Create [n8n Workflows](./N8N_WORKFLOW_TEMPLATES.md)
