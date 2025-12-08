# Service Integration Guide

This guide explains how to integrate new services into the LightDom platform using the centralized ServiceManager pattern.

## Overview

The ServiceManager provides a consistent pattern for:
- ✅ Service registration with explicit dependencies
- ✅ Ordered initialization (dependency graph via topological sort)
- ✅ Health checks and monitoring
- ✅ Graceful shutdown in reverse dependency order
- ✅ Type-safe service access

---

## Step-by-Step Guide: Adding a New Service

### Step 1: Create Your Service Class

Create your service in the appropriate directory under `src/services/`.

```typescript
// src/services/MyNewService.ts

/**
 * MyNewService
 * 
 * Brief description of what this service does.
 * 
 * @module MyNewService
 */

export interface MyNewServiceConfig {
  // Define any configuration options
  apiKey?: string;
  timeout?: number;
}

export class MyNewService {
  private config: MyNewServiceConfig;
  private initialized = false;

  constructor(config: MyNewServiceConfig = {}) {
    this.config = {
      timeout: 5000,
      ...config,
    };
  }

  /**
   * Initialize the service (required for ServiceManager)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    // Perform any async initialization here
    // e.g., connect to external APIs, load data, etc.
    
    this.initialized = true;
  }

  /**
   * Health check method (required for ServiceManager)
   */
  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    if (!this.initialized) {
      return { healthy: false, message: 'Service not initialized' };
    }
    
    // Perform actual health check logic
    return { healthy: true, message: 'Service is healthy' };
  }

  /**
   * Shutdown the service gracefully (optional but recommended)
   */
  async shutdown(): Promise<void> {
    // Clean up resources, close connections, etc.
    this.initialized = false;
  }

  // Add your service methods here
  async doSomething(): Promise<any> {
    if (!this.initialized) {
      throw new Error('MyNewService is not initialized');
    }
    // Implementation
  }
}

// Optional: Export a singleton getter for convenience
let instance: MyNewService | null = null;

export function getMyNewService(config?: MyNewServiceConfig): MyNewService {
  if (!instance) {
    instance = new MyNewService(config);
  }
  return instance;
}

export default MyNewService;
```

### Step 2: Register Your Service in ServiceRegistry

Open `src/services/ServiceRegistry.ts` and add your service.

#### 2.1 Import Your Service

```typescript
// At the top of ServiceRegistry.ts
import { MyNewService, getMyNewService } from './MyNewService.js';
```

#### 2.2 Define Your Service Configuration

Add your service to the appropriate category array, or create a new category:

```typescript
/**
 * My category of services
 */
const myServices: ServiceConfig[] = [
  {
    // REQUIRED: Unique name for this service
    name: 'myNewService',
    
    // RECOMMENDED: Human-readable description
    description: 'Brief description of what this service does',
    
    // REQUIRED: List of service names this depends on
    // Use empty array [] if no dependencies
    dependencies: ['database', 'validation'],
    
    // RECOMMENDED: Tags for categorization
    tags: ['category', 'subcategory'],
    
    // OPTIONAL: Is this service critical? (default: true)
    // If false, failures won't stop system initialization
    required: false,
    
    // REQUIRED: Factory function to create the instance
    factory: () => getMyNewService({
      apiKey: process.env.MY_API_KEY,
      timeout: 10000,
    }),
    
    // OPTIONAL: Custom initialization after factory
    initialize: async (service: MyNewService) => {
      await service.initialize();
    },
    
    // RECOMMENDED: Health check function
    healthCheck: async (service: MyNewService) => {
      const result = await service.healthCheck();
      return {
        healthy: result.healthy,
        message: result.message,
      };
    },
    
    // RECOMMENDED: Shutdown function for graceful cleanup
    shutdown: async (service: MyNewService) => {
      await service.shutdown();
    },
  },
];
```

#### 2.3 Add to allServiceConfigs

```typescript
export const allServiceConfigs: ServiceConfig[] = [
  ...coreServices,
  ...dataServices,
  ...analysisServices,
  ...apiServices,
  ...blockchainServices,
  ...myServices,  // Add your category
];
```

#### 2.4 Add Typed Getter (Optional but Recommended)

```typescript
// In the services object at the bottom
export const services = {
  // ... existing services
  
  get myNewService(): MyNewService {
    return requireService<MyNewService>('myNewService');
  },
};
```

### Step 3: Define Dependencies Correctly

The ServiceManager uses topological sorting to ensure services start in the correct order. Follow these rules:

| Dependency Type | How to Handle |
|-----------------|---------------|
| **No dependencies** | `dependencies: []` |
| **Database required** | `dependencies: ['database']` |
| **Multiple dependencies** | `dependencies: ['database', 'validation']` |
| **Depends on optional service** | Make your service also optional with `required: false` |

⚠️ **Avoid circular dependencies!** The ServiceManager will throw an error if detected.

### Step 4: Implement Required Methods

Your service class should implement these patterns:

```typescript
export class MyNewService {
  // 1. Track initialization state
  private initialized = false;

  // 2. Async initialization
  async initialize(): Promise<void> {
    if (this.initialized) return; // Idempotent
    // ... setup logic
    this.initialized = true;
  }

  // 3. Health check (returns health status)
  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    // Return actual health status
  }

  // 4. Graceful shutdown
  async shutdown(): Promise<void> {
    // Close connections, save state, cleanup
    this.initialized = false;
  }
}
```

---

## Service Configuration Reference

### ServiceConfig Interface

```typescript
interface ServiceConfig {
  name: string;           // Unique identifier
  description?: string;   // Human-readable description
  dependencies?: string[]; // Services this depends on
  factory: () => any;     // Creates the service instance
  initialize?: (instance) => Promise<void>;  // Custom init
  healthCheck?: (instance) => Promise<HealthCheckResult>;
  shutdown?: (instance) => Promise<void>;
  required?: boolean;     // Critical service? (default: true)
  tags?: string[];        // Categorization tags
}
```

### HealthCheckResult Interface

```typescript
interface HealthCheckResult {
  healthy: boolean;       // Is the service working?
  message?: string;       // Human-readable status
  details?: object;       // Additional diagnostic info
  latencyMs?: number;     // Check latency
}
```

---

## Service Categories

Organize services by their purpose:

| Category | Tags | Examples |
|----------|------|----------|
| Core | `core`, `infrastructure` | database, validation |
| Data | `data`, `content` | wiki, componentLibrary |
| Analysis | `analysis`, `intelligence` | analysis, planning |
| API | `api`, `gateway` | apiGateway |
| Blockchain | `blockchain`, `web3` | blockchain, mining |
| Crawling | `crawler`, `seo` | webcrawler, seoAnalytics |
| AI | `ai`, `ml` | ollama, tensorflow |

---

## Best Practices

### ✅ DO

1. **Make services idempotent** - Calling `initialize()` twice should be safe
2. **Handle errors gracefully** - Use try/catch in health checks
3. **Log meaningfully** - Use `console.log` with emoji prefixes for visibility
4. **Use environment variables** - For configuration (API keys, URLs, etc.)
5. **Provide default values** - For optional configuration
6. **Clean up in shutdown** - Close connections, save state
7. **Set `required: false`** - For non-critical services
8. **Export both class and singleton** - For flexibility

### ❌ DON'T

1. **Don't create circular dependencies** - ServiceManager will throw
2. **Don't hardcode secrets** - Use environment variables
3. **Don't skip health checks** - They're used for monitoring
4. **Don't forget shutdown** - Causes resource leaks
5. **Don't throw in non-required service init** - Use warnings instead

---

## Accessing Services

### After Initialization

```typescript
import { services, getService, requireService } from './ServiceRegistry';

// Option 1: Typed getter (recommended)
const db = services.database;
await db.query('SELECT 1');

// Option 2: Generic getter (returns null if not ready)
const wiki = getService<WikiService>('wiki');
if (wiki) {
  await wiki.loadTopics();
}

// Option 3: Require (throws if not ready)
const analysis = requireService<AnalysisService>('analysis');
```

### Checking Service Status

```typescript
import { getServiceManager } from './ServiceManager';

const manager = getServiceManager();

// Check if ready
if (manager.isServiceReady('myNewService')) {
  // Safe to use
}

// Get status
const status = manager.getServiceStatus('myNewService');
// 'registered' | 'initializing' | 'ready' | 'error' | 'stopping' | 'stopped'

// Get system health
const health = await manager.getSystemHealth();
console.log(health.status); // 'healthy' | 'degraded' | 'unhealthy'
```

---

## Example: Complete Service Implementation

Here's a complete example following all best practices:

```typescript
// src/services/NotificationService.ts

/**
 * NotificationService
 * Handles sending notifications via various channels (email, push, SMS)
 * 
 * @module NotificationService
 */

export interface NotificationConfig {
  emailProvider?: string;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
}

export interface Notification {
  type: 'email' | 'push' | 'sms';
  recipient: string;
  subject: string;
  body: string;
}

export class NotificationService {
  private config: NotificationConfig;
  private initialized = false;
  private sentCount = 0;

  constructor(config: NotificationConfig = {}) {
    this.config = {
      emailProvider: 'smtp',
      pushEnabled: true,
      smsEnabled: false,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    console.log('   🔔 Setting up notification channels...');
    // Connect to email provider, etc.
    
    this.initialized = true;
  }

  async healthCheck(): Promise<{ healthy: boolean; message: string; details?: any }> {
    if (!this.initialized) {
      return { healthy: false, message: 'Not initialized' };
    }

    return {
      healthy: true,
      message: `${this.sentCount} notifications sent`,
      details: {
        sentCount: this.sentCount,
        emailProvider: this.config.emailProvider,
        pushEnabled: this.config.pushEnabled,
        smsEnabled: this.config.smsEnabled,
      },
    };
  }

  async shutdown(): Promise<void> {
    console.log('   🔔 Closing notification channels...');
    // Disconnect, flush queues, etc.
    this.initialized = false;
  }

  async send(notification: Notification): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('NotificationService not initialized');
    }

    // Send notification logic here
    this.sentCount++;
    return true;
  }
}

// Singleton pattern
let instance: NotificationService | null = null;

export function getNotificationService(config?: NotificationConfig): NotificationService {
  if (!instance) {
    instance = new NotificationService(config);
  }
  return instance;
}

export default NotificationService;
```

Then register it:

```typescript
// In ServiceRegistry.ts

import { NotificationService, getNotificationService } from './NotificationService.js';

const notificationServices: ServiceConfig[] = [
  {
    name: 'notifications',
    description: 'Multi-channel notification service',
    dependencies: ['database'], // Needs DB for user preferences
    tags: ['notifications', 'messaging'],
    required: false,
    factory: () => getNotificationService({
      emailProvider: process.env.EMAIL_PROVIDER || 'smtp',
      pushEnabled: process.env.PUSH_ENABLED === 'true',
      smsEnabled: process.env.SMS_ENABLED === 'true',
    }),
    initialize: async (svc: NotificationService) => {
      await svc.initialize();
    },
    healthCheck: async (svc: NotificationService) => {
      const result = await svc.healthCheck();
      return {
        healthy: result.healthy,
        message: result.message,
        details: result.details,
      };
    },
    shutdown: async (svc: NotificationService) => {
      await svc.shutdown();
    },
  },
];

// Add to allServiceConfigs
export const allServiceConfigs: ServiceConfig[] = [
  ...coreServices,
  // ...other categories
  ...notificationServices,
];

// Add typed getter
export const services = {
  // ...existing
  get notifications(): NotificationService {
    return requireService<NotificationService>('notifications');
  },
};
```

---

## Testing Your Service

Run these commands to verify your service works:

```bash
# Show all registered services
npm run services:status

# Initialize all services (requires database)
npm run services:init

# Run the demo to see the pattern in action
npm run services:demo
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Circular dependency detected" | Review your dependencies and break the cycle |
| "Unknown service dependency" | Check spelling and that the dependency is registered |
| "Service not ready" | Ensure dependencies are registered first |
| Service fails silently | Check if `required: false` is set |
| Health check fails | Implement proper error handling in healthCheck() |

---

## Summary Checklist

When adding a new service, ensure you:

- [ ] Create service class with `initialize()`, `healthCheck()`, `shutdown()` methods
- [ ] Export both the class and a singleton getter
- [ ] Add import to `ServiceRegistry.ts`
- [ ] Define `ServiceConfig` with proper dependencies
- [ ] Add to `allServiceConfigs` array
- [ ] Add typed getter to `services` object
- [ ] Test with `npm run services:status`
- [ ] Document any environment variables needed
