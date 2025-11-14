# API Documentation Style Guide - Swagger/OpenAPI Standards

## Overview

This document outlines the standards for API documentation using Swagger/OpenAPI in the LightDom project. All API endpoints should follow these conventions to ensure consistency and clarity.

## Swagger/OpenAPI Version

We use **OpenAPI 3.0.0** specification for all API documentation.

## General Principles

1. **Complete Documentation**: Every endpoint must have complete documentation including request/response schemas
2. **Consistent Formatting**: Use consistent naming conventions and formatting across all endpoints
3. **Examples**: Provide realistic examples for all request and response bodies
4. **Error Responses**: Document all possible error responses with appropriate status codes
5. **Authentication**: Clearly indicate authentication requirements for each endpoint

## API Documentation Structure

### 1. Endpoint Documentation

Each API endpoint should include:

```javascript
/**
 * @swagger
 * /api/resource:
 *   get:
 *     summary: Brief description of the endpoint
 *     description: Detailed description of what this endpoint does
 *     tags: [ResourceName]
 *     parameters:
 *       - in: query
 *         name: paramName
 *         required: false
 *         schema:
 *           type: string
 *         description: Parameter description
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResourceResponse'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Resource not found
 *       500:
 *         description: Internal server error
 */
router.get('/resource', async (req, res) => {
  // Implementation
});
```

### 2. Schema Definitions

Define reusable schemas in the components section:

```javascript
/**
 * @swagger
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier
 *           example: "resource_123"
 *         name:
 *           type: string
 *           description: Resource name
 *           example: "My Resource"
 *         status:
 *           type: string
 *           enum: [active, inactive, archived]
 *           default: active
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 */
```

### 3. Auto-Generated Category CRUD APIs

For auto-generated CRUD APIs, the system automatically creates Swagger documentation. Ensure categories have proper schema definitions:

```javascript
const categoryConfig = {
  name: 'workflows',
  display_name: 'Workflows',
  description: 'Workflow automation and orchestration',
  schema_definition: {
    fields: [
      { name: 'name', type: 'string', required: true },
      { name: 'description', type: 'text', required: false },
      { name: 'status', type: 'string', default: 'active' }
    ]
  }
};
```

## HTTP Methods and Status Codes

### Standard HTTP Methods

- **GET**: Retrieve resource(s)
- **POST**: Create new resource
- **PUT**: Update existing resource (full update)
- **PATCH**: Partially update existing resource
- **DELETE**: Delete resource

### Status Codes

Use appropriate HTTP status codes:

- `200 OK`: Successful GET, PUT, PATCH, DELETE
- `201 Created`: Successful POST (resource created)
- `204 No Content`: Successful DELETE with no response body
- `400 Bad Request`: Invalid request parameters or body
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource not found
- `409 Conflict`: Conflict (e.g., duplicate resource)
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

## Request/Response Format Standards

### Successful Response Format

```json
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Optional success message"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* optional error details */ }
}
```

### Pagination Format

```json
{
  "success": true,
  "data": [ /* array of resources */ ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "totalPages": 20
  }
}
```

## CRUD Endpoint Conventions

### 1. Create (POST)

```
POST /api/resource
```

**Request Body**: Complete resource object
**Response**: 201 Created with created resource
**Documentation**: Include all required fields

### 2. Read All (GET)

```
GET /api/resource?page=1&limit=50&search=query&sort=field&order=DESC
```

**Query Parameters**:
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 50, max: 100)
- `search` (string): Search query
- `sort` (string): Sort field
- `order` (string): Sort order (ASC/DESC)

**Response**: 200 OK with array of resources and pagination info

### 3. Read One (GET)

```
GET /api/resource/:id
```

**Path Parameters**: `id` (resource identifier)
**Response**: 200 OK with resource object, or 404 Not Found

### 4. Update (PUT)

```
PUT /api/resource/:id
```

**Path Parameters**: `id` (resource identifier)
**Request Body**: Updated resource object
**Response**: 200 OK with updated resource, or 404 Not Found

### 5. Delete (DELETE)

```
DELETE /api/resource/:id
```

**Path Parameters**: `id` (resource identifier)
**Response**: 200 OK with success message, or 404 Not Found

## Tags and Grouping

Group related endpoints using tags:

```javascript
/**
 * @swagger
 * tags:
 *   - name: Workflows
 *     description: Workflow management endpoints
 *   - name: Services
 *     description: Service management endpoints
 *   - name: Category Management
 *     description: Dynamic category and CRUD management
 */
```

## Authentication Documentation

Document authentication requirements:

```javascript
/**
 * @swagger
 * /api/protected-resource:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Protected endpoint
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
```

## Examples and Descriptions

Always provide:

1. **Clear Summaries**: One-line description of what the endpoint does
2. **Detailed Descriptions**: More comprehensive explanation when needed
3. **Parameter Descriptions**: Explain what each parameter does
4. **Example Values**: Realistic example values for all fields
5. **Use Cases**: When the endpoint should be used

## Auto-Generated CRUD API Documentation

The Category CRUD Auto-Generator automatically creates Swagger documentation for all categories with `auto_generate_crud_api` enabled.

### Accessing Auto-Generated Documentation

1. **Full API Documentation**: `/api-docs` - Includes all endpoints
2. **Category APIs Only**: `/api-docs/categories.json` - Just auto-generated category APIs
3. **Full OpenAPI Spec**: `/api-docs.json` - Complete OpenAPI specification

### Category Configuration for Best Documentation

```javascript
{
  name: 'workflows',
  display_name: 'Workflows',
  description: 'Comprehensive workflow automation and orchestration system',
  category_type: 'workflow',
  auto_generate_crud_api: true,
  api_config: {
    crud_enabled: true,
    use_cases: ['execute', 'pause', 'resume'],
    search_fields: ['name', 'description', 'tags'],
    filter_fields: ['status', 'category_type', 'owner']
  },
  schema_definition: {
    fields: [
      { 
        name: 'name', 
        type: 'string', 
        required: true,
        description: 'Workflow name',
        example: 'My Automation Workflow'
      },
      { 
        name: 'description', 
        type: 'text', 
        required: false,
        description: 'Detailed workflow description',
        example: 'This workflow automates...'
      },
      { 
        name: 'status', 
        type: 'string', 
        enum: ['active', 'inactive', 'paused'],
        default: 'active',
        description: 'Current workflow status'
      }
    ]
  }
}
```

## Testing API Documentation

1. **Validate OpenAPI Spec**: Use online validators or swagger-cli
2. **Test in Swagger UI**: Verify all endpoints work in the UI
3. **Check Examples**: Ensure all examples are valid and realistic
4. **Review Generated Docs**: Check auto-generated documentation quality

## Tools and Resources

- **Swagger UI**: Interactive API documentation at `/api-docs`
- **OpenAPI Specification**: https://swagger.io/specification/
- **Swagger Editor**: https://editor.swagger.io/
- **API Design Guidelines**: Follow REST API best practices

## Best Practices

1. **Keep Documentation Up to Date**: Update docs when changing endpoints
2. **Use Descriptive Names**: Clear, self-explanatory endpoint and parameter names
3. **Version Your API**: Include version in URL or headers
4. **Deprecation Warnings**: Mark deprecated endpoints clearly
5. **Security First**: Document security requirements and considerations
6. **Consistent Formatting**: Follow the same patterns across all endpoints
7. **Test Documentation**: Regularly test that documentation matches implementation

## Example: Complete Endpoint Documentation

```javascript
/**
 * @swagger
 * /api/workflows:
 *   post:
 *     summary: Create a new workflow
 *     description: |
 *       Creates a new workflow with the specified configuration.
 *       The workflow will be in 'draft' status initially.
 *     tags: [Workflows]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 description: Workflow name
 *                 example: "Data Processing Pipeline"
 *               description:
 *                 type: string
 *                 description: Workflow description
 *                 example: "Processes incoming data and stores results"
 *               type:
 *                 type: string
 *                 enum: [datamining, automation, seo]
 *                 description: Workflow type
 *                 example: "datamining"
 *               config:
 *                 type: object
 *                 description: Workflow configuration
 *                 example: { "timeout": 300, "retries": 3 }
 *     responses:
 *       201:
 *         description: Workflow created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Workflow'
 *                 message:
 *                   type: string
 *                   example: "Workflow created successfully"
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 */
router.post('/workflows', async (req, res) => {
  // Implementation
});
```

## Conclusion

Following these standards ensures that all API documentation is consistent, comprehensive, and useful for developers integrating with the LightDom API. The auto-generated CRUD system makes it easy to maintain documentation as categories evolve.
