# API Endpoints Documentation

## Component Bundles API

Base URL: `/api/component-generator`

### Get All Bundles
```http
GET /api/component-generator/bundles
```

### Get Single Bundle
```http
GET /api/component-generator/bundles/:id
```

### Create Bundle
```http
POST /api/component-generator/bundles
Content-Type: application/json

{
  "name": "Analytics Dashboard",
  "description": "Complete analytics",
  "components": ["stat-card", "line-chart"],
  "config": {...},
  "mockDataEnabled": true
}
```

### Update Bundle
```http
PUT /api/component-generator/bundles/:id
```

### Delete Bundle
```http
DELETE /api/component-generator/bundles/:id
```

### Generate with AI
```http
POST /api/component-generator/generate

{
  "prompt": "Create analytics dashboard",
  "selectedComponents": ["stat-card", "line-chart"],
  "mockDataEnabled": true
}
```

## WebSocket Events

- `component-bundle:created`
- `component-bundle:updated`
- `component-bundle:deleted`
