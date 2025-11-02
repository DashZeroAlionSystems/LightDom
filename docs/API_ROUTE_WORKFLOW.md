# API Route Development Workflow

This guide follows n8n-style workflow patterns for adding new API endpoints to the LightDom platform.

## Workflow Overview

```
┌─────────────────┐
│  1. Plan Route  │
│  [Define Spec]  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Create Route │
│  [Route File]   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│3. Add Controller│
│  [Handler]      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 4. Add Service  │
│[Business Logic] │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. Add Swagger  │
│ [Documentation] │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  6. Register    │
│  [Main Server]  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   7. Test       │
│  [Validation]   │
└─────────────────┘
```

## Node 1: Plan Route

**Task**: Define API specification
**Input**: Feature requirements
**Output**: Route specification document

### Sub-Tasks:
1. Define endpoint path (e.g., `/api/feature/action`)
2. Choose HTTP method (GET, POST, PUT, DELETE)
3. Define request schema (body, query, params)
4. Define response schema
5. Identify authentication needs
6. List validations required

### Template:
```yaml
endpoint: /api/feature/action
method: POST
authentication: bearerAuth
request:
  body:
    field1: string (required)
    field2: number (optional)
response:
  success:
    status: 201
    schema: { id, field1, createdAt }
  error:
    status: 400
    message: "Validation error"
```

---

## Node 2: Create Route File

**Task**: Create route definition
**Input**: Route specification
**Output**: Route file (`src/api/routes/feature.routes.js`)

### Template:
```javascript
/**
 * Feature Routes
 * Description of what this feature does
 */

import express from 'express';
import { catchAsync } from '../utils/response.js';
import { auth, apiKeyAuth } from '../middlewares/auth.js';
import * as controller from '../controllers/feature.controller.js';

const router = express.Router();

/**
 * @openapi
 * /api/feature/action:
 *   post:
 *     tags: [Feature]
 *     summary: Action description
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [field1]
 *             properties:
 *               field1:
 *                 type: string
 *     responses:
 *       201:
 *         description: Success
 */
router.post('/action', auth, catchAsync(controller.doAction));

export default router;
```

---

## Node 3: Add Controller

**Task**: Create request handler
**Input**: Route definition
**Output**: Controller file (`src/api/controllers/feature.controller.js`)

### Template:
```javascript
/**
 * Feature Controllers
 * Handle feature-related requests
 */

import { successResponse, createdResponse } from '../utils/response.js';
import { ApiError } from '../utils/ApiError.js';
import * as featureService from '../services/feature.service.js';

/**
 * Do action
 */
export const doAction = async (req, res) => {
  const { field1, field2 } = req.body;
  
  // Validation
  if (!field1) {
    throw new ApiError(400, 'field1 is required');
  }
  
  // Call service
  const result = await featureService.performAction({
    field1,
    field2,
    userId: req.user.id
  });
  
  // Send response
  createdResponse(res, result, 'Action completed successfully');
};

export default {
  doAction,
};
```

### Sub-Tasks:
1. Extract and validate request data
2. Call service layer
3. Format response
4. Handle errors (throw ApiError)

---

## Node 4: Add Service

**Task**: Implement business logic
**Input**: Controller requirements
**Output**: Service file (`src/api/services/feature.service.js`)

### Template:
```javascript
/**
 * Feature Service
 * Business logic for feature operations
 */

import { ApiError } from '../utils/ApiError.js';
import { getDatabase } from '../../config/database.js';

/**
 * Perform action
 */
export const performAction = async ({ field1, field2, userId }) => {
  const db = getDatabase();
  
  // Business logic
  // 1. Validate business rules
  // 2. Process data
  // 3. Database operations
  // 4. External API calls if needed
  
  // Example database query
  const result = await db.query(
    'INSERT INTO features (field1, field2, user_id) VALUES ($1, $2, $3) RETURNING *',
    [field1, field2, userId]
  );
  
  return result.rows[0];
};

export default {
  performAction,
};
```

### Sub-Tasks:
1. Implement business rules
2. Database operations
3. External integrations
4. Return data (no HTTP responses)

---

## Node 5: Add Swagger Documentation

**Task**: Document API in OpenAPI spec
**Input**: Route and schema details
**Output**: Updated `docs/openapi.json`

### Template Addition:
```json
{
  "paths": {
    "/api/feature/action": {
      "post": {
        "tags": ["Feature"],
        "summary": "Perform action",
        "security": [{"bearerAuth": []}],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["field1"],
                "properties": {
                  "field1": {"type": "string"},
                  "field2": {"type": "number"}
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Action completed",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/SuccessResponse"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## Node 6: Register Route

**Task**: Mount route in main server
**Input**: Route file
**Output**: Updated `src/api-server.js`

### Steps:
1. Import route:
```javascript
import featureRoutes from './api/routes/feature.routes.js';
```

2. Mount in `setupRoutes()`:
```javascript
this.app.use('/api/feature', featureRoutes);
```

---

## Node 7: Test Endpoint

**Task**: Validate implementation
**Input**: Running server
**Output**: Test results

### Test Checklist:
```bash
# 1. Start server
PORT=3001 JWT_SECRET=test-secret-32-chars-minimum DB_DISABLED=true node src/api-server.js

# 2. Test endpoint
curl -X POST http://localhost:3001/api/feature/action \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field1":"value"}'

# 3. Verify Swagger docs
curl http://localhost:3001/api-docs

# 4. Check error cases
curl -X POST http://localhost:3001/api/feature/action \
  -H "Content-Type: application/json" \
  -d '{}' # Missing auth and field1

# 5. Test validation
# 6. Test authorization
# 7. Test edge cases
```

---

## Frontend Integration Schema

### Component Consumption Pattern

**Schema Definition:**
```typescript
// src/api/schemas/feature.schema.ts
export interface FeatureActionRequest {
  field1: string;
  field2?: number;
}

export interface FeatureActionResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    field1: string;
    createdAt: string;
  };
}
```

**API Hook:**
```typescript
// src/hooks/useFeature.ts
import { useState } from 'react';
import { api } from '../api/client';
import { FeatureActionRequest, FeatureActionResponse } from '../api/schemas/feature.schema';

export const useFeature = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAction = async (data: FeatureActionRequest): Promise<FeatureActionResponse> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post<FeatureActionResponse>('/api/feature/action', data);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { performAction, loading, error };
};
```

**Component Usage:**
```typescript
// src/components/FeatureComponent.tsx
import { useFeature } from '../hooks/useFeature';

export const FeatureComponent = () => {
  const { performAction, loading, error } = useFeature();

  const handleAction = async () => {
    try {
      const result = await performAction({
        field1: 'value',
        field2: 123
      });
      console.log('Success:', result);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <button onClick={handleAction} disabled={loading}>
      {loading ? 'Processing...' : 'Perform Action'}
    </button>
  );
};
```

---

## n8n-Style Workflow JSON

For automation and documentation purposes, here's the n8n-compatible workflow:

```json
{
  "name": "Add New API Route",
  "nodes": [
    {
      "parameters": {},
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "position": [250, 300]
    },
    {
      "parameters": {
        "values": {
          "string": [
            {"name": "endpoint", "value": "/api/feature/action"},
            {"name": "method", "value": "POST"}
          ]
        }
      },
      "name": "Define Route Spec",
      "type": "n8n-nodes-base.set",
      "position": [450, 300]
    },
    {
      "parameters": {
        "functionCode": "// Create route file\nreturn items;"
      },
      "name": "Create Route File",
      "type": "n8n-nodes-base.code",
      "position": [650, 300]
    },
    {
      "parameters": {},
      "name": "Add Controller",
      "type": "n8n-nodes-base.code",
      "position": [850, 300]
    },
    {
      "parameters": {},
      "name": "Add Service",
      "type": "n8n-nodes-base.code",
      "position": [1050, 300]
    },
    {
      "parameters": {},
      "name": "Update Swagger",
      "type": "n8n-nodes-base.code",
      "position": [1250, 300]
    },
    {
      "parameters": {},
      "name": "Register Route",
      "type": "n8n-nodes-base.code",
      "position": [1450, 300]
    },
    {
      "parameters": {},
      "name": "Test",
      "type": "n8n-nodes-base.httpRequest",
      "position": [1650, 300]
    }
  ],
  "connections": {
    "Start": {"main": [[{"node": "Define Route Spec"}]]},
    "Define Route Spec": {"main": [[{"node": "Create Route File"}]]},
    "Create Route File": {"main": [[{"node": "Add Controller"}]]},
    "Add Controller": {"main": [[{"node": "Add Service"}]]},
    "Add Service": {"main": [[{"node": "Update Swagger"}]]},
    "Update Swagger": {"main": [[{"node": "Register Route"}]]},
    "Register Route": {"main": [[{"node": "Test"}]]}
  }
}
```

---

## Quick Reference Checklist

- [ ] Route file created in `src/api/routes/`
- [ ] Controller created in `src/api/controllers/`
- [ ] Service created in `src/api/services/` (if needed)
- [ ] OpenAPI spec updated in `docs/openapi.json`
- [ ] Route registered in `src/api-server.js`
- [ ] TypeScript types defined (if using TypeScript)
- [ ] Tests written
- [ ] Documentation updated
- [ ] Frontend hook created (if needed)
- [ ] Swagger docs verified at `/api-docs`

---

## Common Patterns

### GET List
```javascript
router.get('/', catchAsync(controller.getAll));
// Pagination, filtering, sorting
```

### GET Single
```javascript
router.get('/:id', catchAsync(controller.getById));
// Parameter validation
```

### POST Create
```javascript
router.post('/', auth, catchAsync(controller.create));
// Body validation, authentication
```

### PUT Update
```javascript
router.put('/:id', auth, catchAsync(controller.update));
// Ownership check, partial updates
```

### DELETE Remove
```javascript
router.delete('/:id', auth, catchAsync(controller.remove));
// Soft delete vs hard delete
```

---

## Error Handling

All errors should use `ApiError`:

```javascript
throw new ApiError(400, 'Custom message');
throw httpErrors.badRequest('Invalid input');
throw httpErrors.notFound('Resource not found');
throw httpErrors.unauthorized();
```

---

## Authentication Patterns

```javascript
// Public route
router.get('/public', catchAsync(controller.handler));

// Protected route (JWT)
router.get('/protected', auth, catchAsync(controller.handler));

// Admin only
router.post('/admin', adminAuth, catchAsync(controller.handler));

// API key
router.post('/external', apiKeyAuth, catchAsync(controller.handler));

// Optional auth
router.get('/flexible', optionalAuth, catchAsync(controller.handler));
```

---

## Next Steps

After adding your route:
1. Update API documentation
2. Notify frontend team
3. Add to Postman collection
4. Update integration tests
5. Deploy to staging
6. Monitor logs
