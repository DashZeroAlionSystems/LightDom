# API Architecture Documentation

## Overview

This document describes the new modular API architecture for the LightDom platform. The structure follows industry best practices from top Node.js/Express boilerplates and implements a clean separation of concerns.

## Architecture Pattern

The API follows the **MVC (Model-View-Controller)** pattern with an additional **Service Layer** for business logic:

```
Request → Routes → Controllers → Services → Models → Database
                         ↓
                    Response
```

## Directory Structure

```
src/
├── api/
│   ├── controllers/          # Request/response handlers
│   │   ├── health.controller.js
│   │   ├── crawler.controller.js
│   │   └── ...
│   │
│   ├── middlewares/          # Custom Express middleware
│   │   ├── auth.js          # Authentication (JWT, API Key, Admin)
│   │   ├── error.js         # Error handling & conversion
│   │   └── validate.js      # Request validation
│   │
│   ├── routes/              # Route definitions
│   │   ├── health.routes.js
│   │   ├── crawler.routes.js
│   │   └── ...
│   │
│   ├── services/            # Business logic layer
│   │   └── (to be created)
│   │
│   ├── utils/               # Helper utilities
│   │   ├── ApiError.js     # Custom error class
│   │   └── response.js     # Standardized responses
│   │
│   └── validations/         # Input validation schemas
│       └── (to be created)
│
├── config/                  # Configuration management
│   ├── index.js            # Main configuration
│   └── database.js         # Database connection pool
│
└── api-server.js           # Main API server class
```

## Key Components

### 1. Configuration (`src/config/`)

Centralized configuration management with environment variable support.

**Features:**
- Environment-based configuration
- Configuration validation
- Separate modules for database, blockchain, etc.
- Type-safe with sensible defaults

**Usage:**
```javascript
import config from './config/index.js';

console.log(config.server.port);
console.log(config.database.host);
```

### 2. Routes (`src/api/routes/`)

Define API endpoints and map them to controllers.

**Structure:**
```javascript
import express from 'express';
import { catchAsync } from '../utils/response.js';
import { auth } from '../middlewares/auth.js';
import * as controller from '../controllers/name.controller.js';

const router = express.Router();

router.get('/', catchAsync(controller.getAll));
router.post('/', auth, catchAsync(controller.create));

export default router;
```

**Best Practices:**
- One router per resource/feature
- Use `catchAsync` wrapper for async handlers
- Apply middleware at route level
- Document each route with JSDoc comments

### 3. Controllers (`src/api/controllers/`)

Handle HTTP requests and responses. Controllers should be thin - they parse requests, call services, and format responses.

**Structure:**
```javascript
import { successResponse } from '../utils/response.js';
import { ApiError } from '../utils/ApiError.js';

export const getResource = async (req, res) => {
  const { id } = req.params;
  
  // Validation
  if (!id) {
    throw new ApiError(400, 'ID is required');
  }
  
  // Call service
  const data = await someService.getById(id);
  
  // Send response
  successResponse(res, data, 'Resource retrieved');
};
```

**Best Practices:**
- Keep controllers thin - delegate to services
- Use standardized response utilities
- Throw `ApiError` for expected errors
- Let `catchAsync` handle async errors

### 4. Services (`src/api/services/`)

Contains business logic, external API calls, and complex operations.

**Purpose:**
- Business logic implementation
- Data transformation
- External service integration
- Complex computations

**Best Practices:**
- One service per domain (e.g., UserService, CrawlerService)
- Services should be independent of HTTP layer
- Return data, not HTTP responses
- Throw errors that controllers can catch

### 5. Middleware (`src/api/middlewares/`)

#### Authentication Middleware (`auth.js`)
- `auth()` - Verify JWT token
- `apiKeyAuth()` - Verify API key from database
- `adminAuth()` - Verify admin privileges
- `optionalAuth()` - Allow both authenticated and unauthenticated

#### Error Handling (`error.js`)
- `errorConverter` - Convert non-ApiError to ApiError
- `errorHandler` - Send error response to client
- `notFound` - Handle 404 routes

#### Validation (`validate.js`)
- `validate(schema)` - Validate request body
- `validateQuery(schema)` - Validate query parameters
- `validateParams(schema)` - Validate URL parameters

### 6. Utilities (`src/api/utils/`)

#### ApiError Class
```javascript
import { ApiError } from '../utils/ApiError.js';

throw new ApiError(404, 'Resource not found');
```

**Common HTTP Errors:**
```javascript
import { httpErrors } from '../utils/ApiError.js';

throw httpErrors.badRequest('Invalid input');
throw httpErrors.unauthorized();
throw httpErrors.notFound('User not found');
```

#### Response Utilities
```javascript
import { 
  successResponse, 
  createdResponse, 
  paginatedResponse 
} from '../utils/response.js';

// Success response
successResponse(res, data, 'Success message');

// Created (201) response
createdResponse(res, newResource, 'Resource created');

// Paginated response
paginatedResponse(res, items, {
  page: 1,
  limit: 10,
  total: 100
});
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "code": 400,
  "message": "Error description",
  "stack": "..." // Only in development
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Items retrieved",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## Creating New Endpoints

### Step 1: Create Route File
```javascript
// src/api/routes/example.routes.js
import express from 'express';
import { catchAsync } from '../utils/response.js';
import * as controller from '../controllers/example.controller.js';

const router = express.Router();

router.get('/', catchAsync(controller.getAll));
router.post('/', catchAsync(controller.create));

export default router;
```

### Step 2: Create Controller
```javascript
// src/api/controllers/example.controller.js
import { successResponse } from '../utils/response.js';

export const getAll = async (req, res) => {
  const data = []; // Get from service
  successResponse(res, data);
};

export const create = async (req, res) => {
  const newItem = {}; // Create via service
  createdResponse(res, newItem);
};
```

### Step 3: Register Route in Server
```javascript
// src/api-server.js
import exampleRoutes from './api/routes/example.routes.js';

// In setupRoutes()
this.app.use('/api/example', exampleRoutes);
```

## Error Handling

Errors are handled centrally through middleware:

1. **Throw ApiError in controllers**
   ```javascript
   throw new ApiError(400, 'Invalid input');
   ```

2. **Error converter** catches all errors
3. **Error handler** sends formatted response

## Security Features

- **Helmet** - Secure HTTP headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent abuse
- **JWT Authentication** - Secure API access
- **API Key Authentication** - Service-to-service auth
- **Input Validation** - Prevent injection attacks

## Testing

### Testing Routes
```javascript
// Test with curl
curl http://localhost:3001/api/health
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/resource
```

### Integration Tests
```javascript
import request from 'supertest';
import server from '../src/api-server.js';

test('GET /api/health returns 200', async () => {
  const response = await request(server.app).get('/api/health');
  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
});
```

## Environment Variables

Required environment variables:

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dom_space_harvester
DB_USER=postgres
DB_PASSWORD=password
DB_DISABLED=false

# Security
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Blockchain
BLOCKCHAIN_ENABLED=true
RPC_URL=http://localhost:8545
PRIVATE_KEY=0x...

# CORS
FRONTEND_URL=http://localhost:3000
```

## Migration from Old API

The old monolithic `api-server-express.js` is being migrated to the new modular structure:

1. **Extract route handlers** from setup methods
2. **Create controllers** for business logic
3. **Move to services** if complex
4. **Apply proper middleware**
5. **Test thoroughly**

## Benefits

✅ **Maintainability** - Clear separation of concerns  
✅ **Scalability** - Easy to add new endpoints  
✅ **Testability** - Controllers and services are isolated  
✅ **Security** - Built-in authentication and validation  
✅ **Documentation** - Self-documenting structure  
✅ **Team Collaboration** - Clear responsibilities  
✅ **Error Handling** - Consistent error responses  

## Next Steps

1. Migrate remaining routes from old server
2. Create service layer for business logic
3. Add input validation schemas
4. Write comprehensive tests
5. Add API documentation (Swagger/OpenAPI)
6. Performance optimization

## References

- [hagopj13/node-express-boilerplate](https://github.com/hagopj13/node-express-boilerplate)
- [santiq/bulletproof-nodejs](https://github.com/santiq/bulletproof-nodejs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
