# Migration Guide: Old API to New Modular Structure

This guide helps migrate endpoints from the old monolithic `api-server-express.js` (9000+ lines) to the new modular structure.

## Overview

### Old Structure (Monolithic)
```
api-server-express.js (9069 lines)
├── setup methods (20+)
├── inline route handlers
├── mixed concerns
└── hard to maintain
```

### New Structure (Modular)
```
src/
├── api-server.js (main server)
├── api/
│   ├── routes/      (route definitions)
│   ├── controllers/ (handlers)
│   ├── services/    (business logic)
│   └── middlewares/ (auth, validation)
└── config/          (configuration)
```

## Migration Process

### Step 1: Identify Routes in Old Server

The old server has routes in setup methods:
- `setupRoutes()`
- `setupBlockchainRoutes()`
- `setupOptimizationRoutes()`
- `setupWebsiteRoutes()`
- `setupAnalyticsRoutes()`
- `setupSEORoutes()`
- `setupAIContentGenerationRoutes()`
- `setupAuthRoutes()`
- `setupMiningRoutes()`
- `setupCrawlerAdminRoutes()`
- `setupTrainingControlRoutes()`
- `setupWalletRoutes()`
- `setupDataIntegrationRoutes()`
- `setupSpaceMiningRoutes()`
- `setupMetaverseMiningRoutes()`
- `setupMetaverseMarketplaceRoutes()`
- `setupMetaverseMiningRewardsRoutes()`
- `setupWorkflowRoutes()`
- `setupTestingRoutes()`
- `setupAdvancedNodeRoutes()`
- `setupSEOServiceRoutes()`

### Step 2: Extract Route Logic

For each setup method, extract:
1. Route path
2. HTTP method
3. Middleware (auth, validation)
4. Handler logic
5. Dependencies

Example from old server:
```javascript
// OLD: In setupCrawlerRoutes()
this.app.post('/api/crawler/start', async (req, res) => {
  try {
    const config = {
      maxConcurrency: req.body.maxConcurrency || 5,
      requestDelay: req.body.requestDelay || 2000,
    };
    
    if (this.crawlerSystem && this.crawlerSystem.isRunning) {
      return res.status(400).json({ 
        error: 'Crawler is already running',
        sessionId: this.crawlerSystem.sessionId 
      });
    }
    
    this.crawlerSystem = new RealWebCrawlerSystem(config);
    const sessionId = await this.crawlerSystem.start();
    
    res.json({ 
      success: true,
      sessionId,
      message: 'Crawler started' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Step 3: Create New Route File

Create `src/api/routes/crawler.routes.js`:
```javascript
import express from 'express';
import { catchAsync } from '../utils/response.js';
import { apiKeyAuth } from '../middlewares/auth.js';
import * as controller from '../controllers/crawler.controller.js';

const router = express.Router();

router.post('/start', apiKeyAuth, catchAsync(controller.startCrawler));
router.post('/stop', apiKeyAuth, catchAsync(controller.stopCrawler));
router.get('/status', catchAsync(controller.getStatus));

export default router;
```

### Step 4: Create Controller

Create `src/api/controllers/crawler.controller.js`:
```javascript
import { successResponse, createdResponse } from '../utils/response.js';
import { ApiError } from '../utils/ApiError.js';
import * as crawlerService from '../services/crawler.service.js';

export const startCrawler = async (req, res) => {
  const config = {
    maxConcurrency: req.body.maxConcurrency || 5,
    requestDelay: req.body.requestDelay || 2000,
  };
  
  const sessionId = await crawlerService.startCrawler(config);
  createdResponse(res, { sessionId }, 'Crawler started');
};

export const stopCrawler = async (req, res) => {
  const { sessionId } = req.body;
  await crawlerService.stopCrawler(sessionId);
  successResponse(res, { sessionId }, 'Crawler stopped');
};

export const getStatus = async (req, res) => {
  const status = await crawlerService.getStatus();
  successResponse(res, status, 'Status retrieved');
};
```

### Step 5: Create Service (if needed)

Create `src/api/services/crawler.service.js`:
```javascript
import { RealWebCrawlerSystem } from '../../crawler/RealWebCrawlerSystem.js';
import { ApiError } from '../utils/ApiError.js';

let crawlerSystem = null;

export const startCrawler = async (config) => {
  if (crawlerSystem && crawlerSystem.isRunning) {
    throw new ApiError(400, 'Crawler is already running');
  }
  
  crawlerSystem = new RealWebCrawlerSystem(config);
  const sessionId = await crawlerSystem.start();
  return sessionId;
};

export const stopCrawler = async (sessionId) => {
  if (!crawlerSystem) {
    throw new ApiError(400, 'No crawler running');
  }
  
  await crawlerSystem.stop();
  return { sessionId };
};

export const getStatus = async () => {
  return {
    running: crawlerSystem?.isRunning || false,
    sessionId: crawlerSystem?.sessionId || null,
  };
};
```

### Step 6: Register Route

In `src/api-server.js`:
```javascript
import crawlerRoutes from './api/routes/crawler.routes.js';

// In setupRoutes()
this.app.use('/api/crawler', crawlerRoutes);
```

## Common Migration Patterns

### Pattern 1: Simple GET Route

**Old:**
```javascript
this.app.get('/api/resource', async (req, res) => {
  try {
    const data = await getDataFromDatabase();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**New:**
```javascript
// Route
router.get('/', catchAsync(controller.getAll));

// Controller
export const getAll = async (req, res) => {
  const data = await service.getAll();
  successResponse(res, data);
};

// Service
export const getAll = async () => {
  return await getDataFromDatabase();
};
```

### Pattern 2: POST with Validation

**Old:**
```javascript
this.app.post('/api/resource', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    
    const result = await createResource({ name, email });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**New:**
```javascript
// Route
router.post('/', validate(schema), catchAsync(controller.create));

// Validation schema
const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
});

// Controller
export const create = async (req, res) => {
  const result = await service.create(req.body);
  createdResponse(res, result);
};
```

### Pattern 3: Protected Route

**Old:**
```javascript
const checkAuth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

this.app.get('/api/protected', checkAuth, async (req, res) => {
  // handler
});
```

**New:**
```javascript
import { auth } from '../middlewares/auth.js';

router.get('/protected', auth, catchAsync(controller.handler));
```

### Pattern 4: Admin Route

**Old:**
```javascript
const adminAuth = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

this.app.post('/api/admin/action', adminAuth, async (req, res) => {
  // handler
});
```

**New:**
```javascript
import { adminAuth } from '../middlewares/auth.js';

router.post('/admin/action', adminAuth, catchAsync(controller.action));
```

### Pattern 5: API Key Route

**Old:**
```javascript
const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  // validate key...
  next();
};

this.app.post('/api/external', apiKeyAuth, async (req, res) => {
  // handler
});
```

**New:**
```javascript
import { apiKeyAuth } from '../middlewares/auth.js';

router.post('/external', apiKeyAuth, catchAsync(controller.handler));
```

## Migration Checklist

For each route being migrated:

- [ ] Identify route path and HTTP method
- [ ] Extract handler logic
- [ ] Identify dependencies (services, models)
- [ ] Create route file if doesn't exist
- [ ] Create controller method
- [ ] Move business logic to service if complex
- [ ] Add validation schema if needed
- [ ] Apply appropriate middleware
- [ ] Register route in main server
- [ ] Test the endpoint
- [ ] Update documentation

## Testing Migrated Routes

After migration, test each endpoint:

```bash
# Test GET
curl http://localhost:3001/api/resource

# Test POST
curl -X POST http://localhost:3001/api/resource \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'

# Test with auth
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/resource

# Test with API key
curl -H "X-API-Key: KEY" http://localhost:3001/api/resource
```

## Handling State

### Old Server State
The old server stores state in class properties:
```javascript
this.crawlerSystem = new RealWebCrawlerSystem();
this.connectedClients = new Set();
```

### New Approach

**Option 1: Service State**
```javascript
// In service file
let crawlerSystem = null;

export const getCrawlerSystem = () => {
  if (!crawlerSystem) {
    crawlerSystem = new RealWebCrawlerSystem();
  }
  return crawlerSystem;
};
```

**Option 2: Singleton Service**
```javascript
// crawler.service.js
class CrawlerService {
  constructor() {
    this.system = null;
  }
  
  start(config) {
    this.system = new RealWebCrawlerSystem(config);
    return this.system.start();
  }
}

export default new CrawlerService();
```

**Option 3: Database/Redis**
For shared state across instances, use database or Redis.

## WebSocket Migration

### Old Server
```javascript
this.io.on('connection', (socket) => {
  socket.on('crawler:subscribe', (data) => {
    // handle
  });
});
```

### New Server
WebSocket handlers remain in main server class:
```javascript
// In src/api-server.js
setupCrawlerSocketHandlers(socket) {
  socket.on('crawler:subscribe', (data) => {
    socket.join(`crawler:${data.sessionId}`);
  });
}
```

Controllers can broadcast via server instance:
```javascript
// In controller
export const startCrawler = async (req, res) => {
  const sessionId = await service.startCrawler();
  
  // Broadcast via req.app (server instance)
  req.app.io.to(`crawler:${sessionId}`).emit('started', { sessionId });
  
  createdResponse(res, { sessionId });
};
```

## Priority Order for Migration

Recommended migration order:

1. **Health & Status** (✅ Done)
2. **Authentication** (High priority)
3. **Crawler API** (Core feature)
4. **Blockchain API** (Core feature)
5. **Analytics** (Important)
6. **SEO** (Important)
7. **Metaverse** (Feature set)
8. **Workflow** (Feature set)
9. **Admin** (Management)
10. **Testing/Debug** (Development)

## Benefits After Migration

✅ **Easier to understand** - Clear structure  
✅ **Easier to test** - Isolated components  
✅ **Easier to maintain** - Separation of concerns  
✅ **Easier to extend** - Add new routes without touching old ones  
✅ **Better error handling** - Consistent error responses  
✅ **Better security** - Standardized authentication  
✅ **Better documentation** - Self-documenting structure  

## Getting Help

- Check `docs/API_ARCHITECTURE.md` for architecture details
- Check `docs/API_QUICK_START.md` for examples
- Look at existing migrated routes for patterns
- Test with `curl` or Postman

## Example: Complete Migration

Let's migrate the analytics routes as a complete example:

### 1. Old Code (api-server-express.js)
```javascript
setupAnalyticsRoutes() {
  this.app.get('/api/stats/dashboard', async (req, res) => {
    try {
      const stats = await this.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  this.app.get('/api/stats/optimizations', async (req, res) => {
    try {
      const optimizations = await this.getOptimizations();
      res.json({ success: true, data: optimizations });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
```

### 2. Create Routes (src/api/routes/analytics.routes.js)
```javascript
import express from 'express';
import { catchAsync } from '../utils/response.js';
import * as controller from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/dashboard', catchAsync(controller.getDashboard));
router.get('/optimizations', catchAsync(controller.getOptimizations));

export default router;
```

### 3. Create Controller (src/api/controllers/analytics.controller.js)
```javascript
import { successResponse } from '../utils/response.js';
import * as analyticsService from '../services/analytics.service.js';

export const getDashboard = async (req, res) => {
  const stats = await analyticsService.getDashboardStats();
  successResponse(res, stats, 'Dashboard stats retrieved');
};

export const getOptimizations = async (req, res) => {
  const data = await analyticsService.getOptimizations();
  successResponse(res, data, 'Optimizations retrieved');
};
```

### 4. Create Service (src/api/services/analytics.service.js)
```javascript
import { getDatabase } from '../../config/database.js';

export const getDashboardStats = async () => {
  const db = getDatabase();
  
  const totalOptimizations = await db.query(
    'SELECT COUNT(*) FROM optimizations'
  );
  
  return {
    totalOptimizations: parseInt(totalOptimizations.rows[0].count),
    // ... more stats
  };
};

export const getOptimizations = async () => {
  const db = getDatabase();
  const result = await db.query(
    'SELECT * FROM optimizations ORDER BY created_at DESC LIMIT 10'
  );
  return result.rows;
};
```

### 5. Register Route (src/api-server.js)
```javascript
import analyticsRoutes from './api/routes/analytics.routes.js';

// In setupRoutes()
this.app.use('/api/stats', analyticsRoutes);
```

### 6. Test
```bash
curl http://localhost:3001/api/stats/dashboard
curl http://localhost:3001/api/stats/optimizations
```

Done! The analytics routes are now migrated to the new structure.
