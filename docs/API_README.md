# LightDom API - Modern RESTful Architecture

A professionally structured Express.js API following industry best practices from top Node.js boilerplates.

## 🚀 Quick Start

```bash
# Start the API server (database disabled for testing)
PORT=3001 DB_DISABLED=true node src/api-server.js

# Test the health endpoint
curl http://localhost:3001/health

# Test API info
curl http://localhost:3001/api
```

## 📁 Project Structure

```
src/
├── api/
│   ├── controllers/     # Request/response handlers
│   ├── middlewares/     # Auth, validation, error handling
│   ├── routes/          # Route definitions
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── validations/     # Input validation schemas
├── config/              # Configuration management
└── api-server.js        # Main server class
```

## ✨ Features

### Architecture
- ✅ **MVC Pattern** - Clean separation of concerns
- ✅ **Modular Routes** - Easy to add and maintain endpoints
- ✅ **Service Layer** - Business logic separated from HTTP layer
- ✅ **Middleware Stack** - Reusable authentication, validation, error handling

### Security
- ✅ **Helmet** - Security headers
- ✅ **CORS** - Cross-origin resource sharing
- ✅ **Rate Limiting** - Prevent API abuse
- ✅ **JWT Authentication** - Secure user authentication
- ✅ **API Key Auth** - Service-to-service authentication
- ✅ **Input Validation** - Prevent injection attacks

### Developer Experience
- ✅ **Centralized Configuration** - Environment-based settings
- ✅ **Standardized Responses** - Consistent API responses
- ✅ **Error Handling** - Proper HTTP status codes
- ✅ **WebSocket Support** - Real-time updates
- ✅ **Graceful Shutdown** - Clean process termination
- ✅ **Comprehensive Logging** - Request/error logging with Morgan

## 📖 Documentation

- **[API Architecture](./API_ARCHITECTURE.md)** - Complete architecture documentation
- **[Quick Start Guide](./API_QUICK_START.md)** - Get started in minutes
- **[API Endpoints](./API_ENDPOINTS.md)** - Endpoint reference

## 🎯 Core Endpoints

### Health & Status
```bash
GET  /health                    # Basic health check
GET  /api/health                # Detailed health
GET  /api/health/database       # Database health
GET  /api/health/system         # System metrics
```

### Crawler (Example)
```bash
POST /api/crawler/start         # Start crawling (requires API key)
POST /api/crawler/stop          # Stop crawling (requires API key)
GET  /api/crawler/status        # Get crawler status
POST /api/crawler/crawl-once    # Single page crawl (requires API key)
```

## 🔧 Configuration

Configuration is managed through environment variables. See `.env.example`:

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
```

## 🛠️ Development

### Creating a New Endpoint

1. **Create route file**: `src/api/routes/feature.routes.js`
2. **Create controller**: `src/api/controllers/feature.controller.js`
3. **Register in server**: Import and mount in `src/api-server.js`

Example:
```javascript
// 1. Route
import express from 'express';
import * as controller from '../controllers/feature.controller.js';

const router = express.Router();
router.get('/', controller.list);
export default router;

// 2. Controller
import { successResponse } from '../utils/response.js';

export const list = async (req, res) => {
  const data = []; // Get from service
  successResponse(res, data, 'Success');
};

// 3. Register
import featureRoutes from './api/routes/feature.routes.js';
this.app.use('/api/feature', featureRoutes);
```

### Middleware Usage

```javascript
import { auth, apiKeyAuth, adminAuth } from '../middlewares/auth.js';

// Protected route
router.get('/protected', auth, controller.handler);

// Admin only
router.post('/admin', adminAuth, controller.handler);

// API key required
router.post('/external', apiKeyAuth, controller.handler);
```

### Error Handling

```javascript
import { ApiError, httpErrors } from '../utils/ApiError.js';

// Throw errors
throw new ApiError(400, 'Custom message');
throw httpErrors.notFound('Resource not found');
throw httpErrors.unauthorized();

// Errors are caught and formatted automatically
```

### Response Utilities

```javascript
import { 
  successResponse, 
  createdResponse, 
  paginatedResponse 
} from '../utils/response.js';

// Standard response
successResponse(res, data, 'Message');

// Created (201)
createdResponse(res, newResource);

// Paginated
paginatedResponse(res, items, { page, limit, total });
```

## 🔐 Authentication

### JWT Authentication
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/resource
```

### API Key Authentication
```bash
curl -H "X-API-Key: YOUR_KEY" http://localhost:3001/api/resource
```

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:3001/health | jq '.'

# Test with authentication
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/resource

# Test POST request
curl -X POST http://localhost:3001/api/resource \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
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

## 🌐 WebSocket Support

The API server includes integrated WebSocket support via Socket.IO:

```javascript
// Server broadcasts
this.broadcast('event', data);
this.broadcastToRoom('room:name', 'event', data);

// Client connects
const socket = io('http://localhost:3001');
socket.emit('crawler:subscribe', { sessionId });
```

## 🔄 Migration from Old API

The old monolithic `api-server-express.js` (9000+ lines) is being migrated to this modular structure:

- ✅ Core infrastructure ready
- ✅ Configuration system implemented
- ✅ Middleware stack complete
- ✅ Example routes created
- 🚧 Migrating remaining routes
- 📋 Adding service layer
- 📋 Creating validation schemas

## 🏗️ Built With

- **Express 4.x** - Fast, unopinionated web framework
- **Socket.IO** - Real-time bidirectional communication
- **PostgreSQL** - Robust relational database
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **JWT** - JSON Web Tokens for authentication

## 📚 Architecture Inspiration

This API structure is based on best practices from:
- [hagopj13/node-express-boilerplate](https://github.com/hagopj13/node-express-boilerplate) (7500+ ⭐)
- [santiq/bulletproof-nodejs](https://github.com/santiq/bulletproof-nodejs) (5680+ ⭐)
- Industry best practices for Node.js/Express (2024)

## 🎓 Benefits

- **Maintainability** - Clear structure makes code easy to understand
- **Scalability** - Add new features without touching existing code
- **Testability** - Isolated components are easy to test
- **Security** - Built-in security best practices
- **Performance** - Optimized with compression and caching
- **Developer Experience** - Clear patterns and conventions

## 📝 License

This project is part of the LightDom platform.

## 🤝 Contributing

When adding new endpoints:
1. Follow the existing structure
2. Use provided utilities and middleware
3. Add proper error handling
4. Document your endpoints
5. Test thoroughly

## 📞 Support

- **Documentation**: `docs/` directory
- **Examples**: Check existing routes and controllers
- **Issues**: Create GitHub issue

---

Built with ❤️ following industry best practices for scalable Node.js APIs.
