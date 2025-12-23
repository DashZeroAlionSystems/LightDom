# Service Bundling with Data Streams

A comprehensive system for creating services that bundle API endpoints together with data streams, enabling modular service composition and dynamic routing.

## 🎯 Overview

This system allows you to:
- **Create Services**: Bundle multiple API endpoints into a cohesive service
- **Manage Data Streams**: Connect services through data streams
- **Dynamic Routing**: Access bundled endpoints through a unified service interface
- **Endpoint Registry**: Auto-discover and register all API endpoints
- **Service Composition**: Build complex workflows from simple service building blocks

## 📋 Table of Contents

- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [UI Components](#ui-components)
- [Usage Examples](#usage-examples)
- [Dynamic Routing](#dynamic-routing)
- [Integration Guide](#integration-guide)

## 🏗️ Architecture

### Components

1. **Endpoint Registry Service** (`services/endpoint-registry-service.js`)
   - Discovers and registers API endpoints
   - Maintains endpoint metadata
   - Auto-registers on server startup

2. **Service Management Routes** (`api/service-management-routes.js`)
   - CRUD operations for services
   - Endpoint binding management
   - Service-endpoint associations

3. **Dynamic Service Router** (`api/dynamic-service-router.js`)
   - Dynamic routing based on service name and endpoint
   - Service-based endpoint access
   - Execution logging

4. **Service Management UI** (`src/components/ServiceManagement.tsx`)
   - Create/edit services
   - Multi-select endpoint picker
   - View service details and metrics

### Data Flow

```
┌──────────────────┐
│  API Endpoints   │
│   (Registered)   │
└────────┬─────────┘
         │
         │ Bundle into
         ▼
┌──────────────────┐     ┌──────────────────┐
│    Services      │────▶│  Data Streams    │
│ (with Endpoints) │     │  (Connections)   │
└────────┬─────────┘     └──────────────────┘
         │
         │ Access via
         ▼
┌──────────────────┐
│ Dynamic Router   │
│ /api/service/... │
└──────────────────┘
```

## 🗄️ Database Schema

### Key Tables

#### 1. `api_endpoints`
Stores all registered API endpoints with metadata.

```sql
CREATE TABLE api_endpoints (
    id SERIAL PRIMARY KEY,
    endpoint_id VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    service_type VARCHAR(100),
    is_public BOOLEAN DEFAULT FALSE,
    requires_auth BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);
```

#### 2. `workflow_services`
Defines services with their bundled endpoints.

```sql
CREATE TABLE workflow_services (
    id SERIAL PRIMARY KEY,
    service_id VARCHAR(255) UNIQUE NOT NULL,
    workflow_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    service_type VARCHAR(100) NOT NULL,
    bundled_endpoints JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE
);
```

#### 3. `service_endpoint_bindings`
Links endpoints to services with configuration.

```sql
CREATE TABLE service_endpoint_bindings (
    id SERIAL PRIMARY KEY,
    binding_id VARCHAR(255) UNIQUE NOT NULL,
    service_id VARCHAR(255) REFERENCES workflow_services(service_id),
    endpoint_id VARCHAR(255) REFERENCES api_endpoints(endpoint_id),
    binding_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT TRUE,
    input_mapping JSONB DEFAULT '{}',
    output_mapping JSONB DEFAULT '{}'
);
```

#### 4. `data_streams`
Defines data streams between services.

```sql
CREATE TABLE data_streams (
    id SERIAL PRIMARY KEY,
    stream_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    source_service_id VARCHAR(255),
    destination_service_id VARCHAR(255),
    stream_type VARCHAR(100) NOT NULL,
    direction VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
```

## 🔌 API Endpoints

### Service Management

#### List Services
```http
GET /api/services
```

Query Parameters:
- `service_type` - Filter by service type
- `status` - Filter by status (active/inactive)
- `search` - Search by name or description
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 50)

Response:
```json
{
  "success": true,
  "data": [
    {
      "service_id": "service-123",
      "name": "User Management",
      "service_type": "api",
      "endpoint_count": 5,
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

#### Create Service
```http
POST /api/services
```

Request Body:
```json
{
  "name": "User Management Service",
  "description": "Handles user authentication and profile management",
  "service_type": "api",
  "bundled_endpoints": [
    { "endpoint_id": "data-streams-list" },
    { "endpoint_id": "data-streams-create" },
    { "endpoint_id": "data-streams-get" }
  ],
  "supports_realtime": true
}
```

#### Get Service Details
```http
GET /api/services/:serviceId
```

Response:
```json
{
  "success": true,
  "data": {
    "service_id": "service-123",
    "name": "User Management",
    "bundled_endpoints": [
      {
        "endpoint_id": "data-streams-list",
        "title": "List Data Streams",
        "path": "/api/data-streams",
        "method": "GET"
      }
    ],
    "data_streams": []
  }
}
```

#### Update Service
```http
PUT /api/services/:serviceId
```

#### Delete Service
```http
DELETE /api/services/:serviceId
```

### Endpoint Management

#### Get Available Endpoints
```http
GET /api/services/available/endpoints
```

Query Parameters:
- `category` - Filter by category
- `service_type` - Filter by service type
- `method` - Filter by HTTP method

#### Add Endpoint to Service
```http
POST /api/services/:serviceId/endpoints
```

Request Body:
```json
{
  "endpoint_id": "data-streams-create",
  "binding_order": 1,
  "is_required": true,
  "input_mapping": {},
  "output_mapping": {}
}
```

#### Remove Endpoint from Service
```http
DELETE /api/services/:serviceId/endpoints/:bindingId
```

## 🎨 UI Components

### ServiceManagement Component

Located at `src/components/ServiceManagement.tsx`

Features:
- Service listing with filtering
- Create/edit service modal
- Multi-select endpoint picker (Transfer component)
- Service details drawer
- Endpoint and data stream tabs
- Service metrics

Usage:
```tsx
import ServiceManagement from '@/components/ServiceManagement';

function App() {
  return <ServiceManagement />;
}
```

## 💡 Usage Examples

### Example 1: Create a Data Processing Service

```javascript
// Create service via API
const response = await fetch('/api/services', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Data Processing Service',
    description: 'Processes and transforms data streams',
    service_type: 'data-processor',
    bundled_endpoints: [
      { endpoint_id: 'data-streams-list' },
      { endpoint_id: 'data-streams-create' },
      { endpoint_id: 'data-streams-start' },
      { endpoint_id: 'data-streams-stop' }
    ]
  })
});
```

### Example 2: Access Service Endpoints

```javascript
// List all endpoints for a service
const endpoints = await fetch('/api/service/Data Processing Service/endpoints');

// Access specific endpoint through service
const result = await fetch(
  '/api/service/Data Processing Service/data-stream/data-streams-list'
);
```

### Example 3: Create Service with Data Streams

```javascript
const service = {
  name: 'Real-time Analytics',
  service_type: 'data-processor',
  bundled_endpoints: [
    { endpoint_id: 'data-streams-metrics' }
  ],
  data_streams: [
    {
      name: 'Analytics Stream',
      stream_type: 'websocket',
      direction: 'bidirectional',
      data_format: 'json'
    }
  ],
  supports_realtime: true
};

await fetch('/api/services', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(service)
});
```

## 🔀 Dynamic Routing

The system provides dynamic routing for accessing service endpoints:

### Pattern
```
/api/service/:serviceName/data-stream/:endpointName
```

### Examples

1. **Access endpoint by service and endpoint name:**
```http
GET /api/service/User Management/data-stream/data-streams-list
```

2. **List all endpoints for a service:**
```http
GET /api/service/User Management/endpoints
```

Response:
```json
{
  "success": true,
  "data": {
    "service": {
      "name": "User Management",
      "service_type": "api"
    },
    "endpoints": [
      {
        "endpoint_id": "data-streams-list",
        "title": "List Data Streams",
        "method": "GET",
        "access_url": "/api/service/User Management/data-stream/data-streams-list"
      }
    ]
  }
}
```

### Features

- ✅ Method validation
- ✅ Service-endpoint resolution
- ✅ Execution logging
- ✅ Error handling
- ✅ Activity tracking

## 🔧 Integration Guide

### 1. Auto-Registration

Endpoints are automatically registered on server startup. To add custom endpoints:

```javascript
// In endpoint-registry-service.js
const customEndpoints = [
  {
    endpoint_id: 'my-custom-endpoint',
    title: 'My Custom Endpoint',
    path: '/api/custom',
    method: 'GET',
    description: 'Custom functionality',
    category: 'custom',
    service_type: 'api'
  }
];
```

### 2. Create Services Programmatically

```javascript
import EndpointRegistryService from './services/endpoint-registry-service.js';

const registry = new EndpointRegistryService(db);

// Get available endpoints
const endpoints = await registry.getEndpoints({ category: 'data-streams' });

// Create service with selected endpoints
const service = {
  name: 'My Service',
  service_type: 'data-processor',
  bundled_endpoints: endpoints.slice(0, 3).map(e => ({
    endpoint_id: e.endpoint_id
  }))
};
```

### 3. Use in Frontend

```tsx
import { useState, useEffect } from 'react';

function MyComponent() {
  const [services, setServices] = useState([]);
  
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setServices(data.data));
  }, []);
  
  return (
    <div>
      {services.map(service => (
        <div key={service.service_id}>
          <h3>{service.name}</h3>
          <p>{service.endpoint_count} endpoints</p>
        </div>
      ))}
    </div>
  );
}
```

## 📊 Monitoring

### Execution Logs

All endpoint accesses through the dynamic router are logged in `endpoint_execution_logs`:

```sql
SELECT 
  eel.execution_id,
  ae.title as endpoint_title,
  eel.request_method,
  eel.status,
  eel.started_at
FROM endpoint_execution_logs eel
JOIN api_endpoints ae ON eel.endpoint_id = ae.endpoint_id
WHERE eel.status = 'success'
ORDER BY eel.started_at DESC
LIMIT 10;
```

### Service Metrics

Query service usage:

```sql
SELECT 
  ws.name,
  COUNT(DISTINCT seb.endpoint_id) as endpoint_count,
  COUNT(ds.id) as stream_count
FROM workflow_services ws
LEFT JOIN service_endpoint_bindings seb ON ws.service_id = seb.service_id
LEFT JOIN data_streams ds ON ws.service_id = ds.source_service_id
GROUP BY ws.service_id, ws.name;
```

## 🚀 Getting Started

1. **Start the server** - Endpoints are auto-registered on startup
2. **Access the UI** - Navigate to ServiceManagement component
3. **Create a service** - Use the multi-select picker to bundle endpoints
4. **Test dynamic routing** - Access endpoints via `/api/service/:name/data-stream/:endpoint`

## 📝 Notes

- Services must have unique names
- Endpoint IDs are used for binding, not titles
- Data streams can connect services bidirectionally
- Dynamic routing validates HTTP methods
- All operations are logged for auditing

## 🔮 Future Enhancements

- [ ] Service versioning
- [ ] Endpoint rate limiting per service
- [ ] Service health checks
- [ ] Automatic service discovery
- [ ] Service orchestration workflows
- [ ] Real-time monitoring dashboard
- [ ] Service dependency graphs

## 🤝 Contributing

When adding new API endpoints:
1. Add endpoint definition to `endpoint-registry-service.js`
2. Server will auto-register on next startup
3. Endpoint becomes available for bundling in services

## 📖 Related Documentation

- [Data Streams Guide](./DATA_STREAMS_GUIDE.md)
- [Workflow System](./WORKFLOW_SYSTEM_README.md)
- [API Endpoint Registry](./API_ENDPOINT_REGISTRY_SYSTEM.md)

---

**Built with ❤️ for LightDom Platform**
