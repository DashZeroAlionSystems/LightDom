# API Quick Start Guide

## Starting the API Server

```bash
# Development (database disabled)
PORT=3001 DB_DISABLED=true node src/api-server.js

# Development (with database)
PORT=3001 node src/api-server.js

# Production
NODE_ENV=production PORT=3001 node src/api-server.js
```

## Testing Endpoints

```bash
# Health check
curl http://localhost:3001/health

# API info
curl http://localhost:3001/api

# Health with system info
curl http://localhost:3001/api/health/system

# With authentication
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/resource

# With API key
curl -H "X-API-Key: YOUR_KEY" http://localhost:3001/api/resource
```

## Creating a New Endpoint

### 1. Create Route File

**File:** `src/api/routes/myfeature.routes.js`

```javascript
import express from 'express';
import { catchAsync } from '../utils/response.js';
import { auth } from '../middlewares/auth.js';
import * as controller from '../controllers/myfeature.controller.js';

const router = express.Router();

router.get('/', catchAsync(controller.list));
router.post('/', auth, catchAsync(controller.create));
router.get('/:id', catchAsync(controller.getById));
router.put('/:id', auth, catchAsync(controller.update));
router.delete('/:id', auth, catchAsync(controller.remove));

export default router;
```

### 2. Create Controller

**File:** `src/api/controllers/myfeature.controller.js`

```javascript
import { successResponse, createdResponse } from '../utils/response.js';
import { ApiError } from '../utils/ApiError.js';

export const list = async (req, res) => {
  // TODO: Get from service/database
  const items = [];
  successResponse(res, items, 'Items retrieved');
};

export const create = async (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    throw new ApiError(400, 'Name is required');
  }
  
  // TODO: Create via service
  const newItem = { id: 1, name, description };
  createdResponse(res, newItem, 'Item created');
};

export const getById = async (req, res) => {
  const { id } = req.params;
  
  // TODO: Get from service/database
  const item = { id };
  
  if (!item) {
    throw new ApiError(404, 'Item not found');
  }
  
  successResponse(res, item, 'Item retrieved');
};

export const update = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // TODO: Update via service
  const updated = { id, ...updates };
  successResponse(res, updated, 'Item updated');
};

export const remove = async (req, res) => {
  const { id } = req.params;
  
  // TODO: Delete via service
  successResponse(res, { id }, 'Item deleted');
};
```

### 3. Register Route

**File:** `src/api-server.js`

```javascript
// Import at top
import myfeatureRoutes from './api/routes/myfeature.routes.js';

// In setupRoutes() method
this.app.use('/api/myfeature', myfeatureRoutes);
```

### 4. Test

```bash
# List items
curl http://localhost:3001/api/myfeature

# Create item (with auth)
curl -X POST http://localhost:3001/api/myfeature \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Description"}'

# Get by ID
curl http://localhost:3001/api/myfeature/1

# Update (with auth)
curl -X PUT http://localhost:3001/api/myfeature/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated"}'

# Delete (with auth)
curl -X DELETE http://localhost:3001/api/myfeature/1 \
  -H "Authorization: Bearer TOKEN"
```

## Common Patterns

### Protected Route
```javascript
router.get('/protected', auth, catchAsync(controller.handler));
```

### Admin Only Route
```javascript
import { adminAuth } from '../middlewares/auth.js';
router.post('/admin', adminAuth, catchAsync(controller.handler));
```

### API Key Route
```javascript
import { apiKeyAuth } from '../middlewares/auth.js';
router.post('/external', apiKeyAuth, catchAsync(controller.handler));
```

### Optional Auth
```javascript
import { optionalAuth } from '../middlewares/auth.js';
router.get('/public', optionalAuth, catchAsync(controller.handler));
```

### Paginated Response
```javascript
export const list = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const items = []; // Get from database
  const total = 100; // Get total count
  
  paginatedResponse(res, items, {
    page: parseInt(page),
    limit: parseInt(limit),
    total
  }, 'Items retrieved');
};
```

## Error Handling

### Throwing Errors
```javascript
import { ApiError, httpErrors } from '../utils/ApiError.js';

// Custom error
throw new ApiError(400, 'Custom error message');

// Pre-defined errors
throw httpErrors.badRequest('Invalid input');
throw httpErrors.unauthorized();
throw httpErrors.forbidden();
throw httpErrors.notFound('Resource not found');
throw httpErrors.conflict('Resource already exists');
throw httpErrors.internal('Something went wrong');
```

### Error Response Format
```json
{
  "success": false,
  "code": 400,
  "message": "Error description",
  "stack": "..." // Only in development
}
```

## Response Utilities

```javascript
import { 
  successResponse, 
  createdResponse, 
  paginatedResponse,
  noContentResponse 
} from '../utils/response.js';

// Standard success (200)
successResponse(res, data, 'Message');

// Created (201)
createdResponse(res, newResource);

// No content (204)
noContentResponse(res);

// Paginated
paginatedResponse(res, items, { page, limit, total });
```

## Middleware Usage

### In Routes
```javascript
import { auth, apiKeyAuth, adminAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';

// Single middleware
router.post('/', auth, catchAsync(controller.create));

// Multiple middleware
router.post('/', [auth, validate(schema)], catchAsync(controller.create));
```

### Global Middleware
Already applied in `src/api-server.js`:
- Helmet (security headers)
- CORS
- Compression
- Rate limiting
- Body parsing
- Logging

## Configuration

Access configuration anywhere:
```javascript
import config from './config/index.js';

console.log(config.server.port);
console.log(config.database.host);
console.log(config.blockchain.enabled);
console.log(config.security.jwtSecret);
```

## Database Access

```javascript
import { getDatabase } from './config/database.js';

export const list = async (req, res) => {
  const db = getDatabase();
  const result = await db.query('SELECT * FROM items');
  
  successResponse(res, result.rows, 'Items retrieved');
};
```

## WebSocket Usage

```javascript
// From within the API server class
this.broadcast('event:name', { data });

// To specific room
this.broadcastToRoom('room:name', 'event:name', { data });

// Client subscribes
socket.emit('crawler:subscribe', { sessionId: '123' });
```

## Environment Variables

Create `.env` file:
```bash
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=password
DB_DISABLED=false

# Security
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# Blockchain
BLOCKCHAIN_ENABLED=true
RPC_URL=http://localhost:8545
PRIVATE_KEY=0x...

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

## Testing Tips

```bash
# Pretty print JSON with jq
curl http://localhost:3001/api/health | jq '.'

# Save response to file
curl http://localhost:3001/api/resource > response.json

# Include headers in output
curl -i http://localhost:3001/api/health

# Verbose output for debugging
curl -v http://localhost:3001/api/health

# POST with JSON
curl -X POST http://localhost:3001/api/resource \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

## Troubleshooting

### Server won't start
- Check if port is already in use: `lsof -i :3001`
- Check environment variables
- Check database connection if enabled

### 401 Unauthorized
- Check JWT token is valid
- Check token is in Authorization header
- Check API key is in X-API-Key header

### 500 Internal Server Error
- Check server logs
- Check database connection
- Check stack trace in development mode

## Next Steps

1. Read full documentation: `docs/API_ARCHITECTURE.md`
2. Explore existing routes: `src/api/routes/`
3. Check examples: `src/api/controllers/`
4. Review middleware: `src/api/middlewares/`

## Support

For questions or issues:
1. Check documentation in `docs/`
2. Review existing code for examples
3. Check console logs for errors
4. Test with `curl` or Postman
