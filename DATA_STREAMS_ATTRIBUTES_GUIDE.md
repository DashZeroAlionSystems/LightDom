# Data Streams with Attributes Management - Feature Documentation

## Overview

This feature provides a comprehensive system for managing data streams with flexible attribute configurations. Users can create, configure, and monitor data streams where attributes can be dynamically included or excluded from services.

## What's New

This implementation adds:
- **CRUD operations** for data streams
- **Attribute relationship management** with many-to-many associations
- **Inclusion/exclusion controls** for individual attributes
- **Attribute lists** for reusable attribute bundles
- **Stream control** with start/stop capabilities
- **Processing metrics** and audit trails
- **Web UI** for visual management

## Database Schema

### New Tables

The migration `220-data-streams-with-attributes.sql` creates:

1. **data_streams** - Core stream configuration (enhanced existing table)
2. **data_stream_attributes** - Junction table for stream-attribute relationships
3. **attribute_lists** - Predefined attribute bundles
4. **attribute_list_items** - Items within attribute lists
5. **data_stream_attribute_lists** - Junction for stream-list relationships
6. **data_stream_processing_log** - Audit trail

### Views

- **data_streams_with_attributes** - Streams with their attributes
- **attribute_lists_with_items** - Lists with their items

## API Endpoints

### Data Streams CRUD

```
GET    /api/data-streams              - List all streams
GET    /api/data-streams/:id          - Get single stream
POST   /api/data-streams              - Create stream
PUT    /api/data-streams/:id          - Update stream
DELETE /api/data-streams/:id          - Delete stream
```

### Attribute Management

```
GET    /api/data-streams/:id/attributes                - List attributes
POST   /api/data-streams/:id/attributes                - Add attribute
PUT    /api/data-streams/:streamId/attributes/:attrId  - Update attribute
DELETE /api/data-streams/:streamId/attributes/:attrId  - Remove attribute
```

### Attribute Lists

```
GET  /api/data-streams/lists/all     - List all attribute lists
POST /api/data-streams/lists          - Create attribute list
POST /api/data-streams/:streamId/attribute-lists/:listId - Associate list
```

### Stream Control

```
POST /api/data-streams/:id/start    - Start stream
POST /api/data-streams/:id/stop     - Stop stream
GET  /api/data-streams/:id/metrics  - Get metrics
```

## Frontend Component

### Location
`src/components/DataStreamsManagement.tsx`

### Features
- List view with filtering, search, and pagination
- Create/edit modal for stream configuration
- Detailed drawer with tabs:
  - **Information**: Stream metadata
  - **Attributes**: Add/remove/toggle attributes
  - **Metrics**: Processing statistics
- Real-time status indicators
- Stream control buttons

### Routes
- `/dashboard/data-streams` - User interface
- `/admin/data-streams` - Admin interface

## Usage Examples

### Create a Data Stream

```javascript
POST /api/data-streams
{
  "name": "User Analytics Stream",
  "description": "Real-time user behavior analytics",
  "source_type": "api",
  "destination_type": "database",
  "data_format": "json",
  "attributes": [
    {
      "attribute_name": "user_id",
      "attribute_type": "string",
      "is_required": true,
      "position": 0
    },
    {
      "attribute_name": "event_type",
      "attribute_type": "string",
      "is_required": true,
      "position": 1
    }
  ]
}
```

### Add an Attribute

```javascript
POST /api/data-streams/{streamId}/attributes
{
  "attribute_name": "timestamp",
  "attribute_type": "date",
  "is_required": true,
  "transformation_config": {
    "format": "ISO8601"
  }
}
```

### Toggle Attribute Inclusion

```javascript
PUT /api/data-streams/{streamId}/attributes/{attrId}
{
  "is_included": false
}
```

### Start a Stream

```javascript
POST /api/data-streams/{streamId}/start
```

## Installation

### 1. Run Database Migration

```bash
psql -d dom_space_harvester -f database/migrations/220-data-streams-with-attributes.sql
```

### 2. Restart API Server

The routes are automatically loaded by the API server.

### 3. Access UI

Navigate to `/dashboard/data-streams` in your browser.

## Key Features

### 1. Many-to-Many Relationships

Streams can have multiple attributes with specific configurations per stream.

### 2. Inclusion/Exclusion Pattern

Attributes are toggled with `is_included` flag instead of deleting, preserving history.

### 3. Position-Based Ordering

Attributes have a `position` field for consistent ordering.

### 4. Attribute Lists

Create reusable attribute bundles for common configurations.

### 5. Audit Trail

All stream operations are logged in `data_stream_processing_log`.

## Testing

Run tests with:
```bash
npm test test/data-streams.test.js
```

Tests cover:
- CRUD operations
- Attribute management
- Stream control
- Data validation
- View integration

## Troubleshooting

### Stream Won't Start
- Check database connectivity
- Verify configurations
- Ensure at least one attribute is included
- Check logs for errors

### Attributes Not Appearing
- Refresh the page
- Check `is_included` flag
- Verify attribute was added successfully
- Check browser console

## Related Documentation

- **DATA_STREAMS_GUIDE.md** - Real-time streaming documentation
- **WORKFLOW_BUILDER_QUICKSTART.md** - Workflow integration
- **API docs** - Full API reference (coming soon)

## Architecture Decisions

### Why Junction Tables?
Flexible many-to-many relationships with per-relationship configuration.

### Why Inclusion Flag vs Deletion?
Preserves history, enables easy re-enabling, and supports audit trails.

### Why Views?
Simplifies queries, improves performance, reduces JOIN complexity.

## Future Enhancements

1. **Real-time Monitoring Dashboard** - Live metrics with WebSocket updates
2. **Visual Transformation Builder** - Drag-and-drop transformations
3. **Attribute Templates** - Industry-specific presets
4. **Stream Scheduling** - Cron-based activation
5. **Data Quality Monitoring** - Validation metrics and anomaly detection
6. **Stream Cloning** - Duplicate configurations quickly

## Support

For issues:
1. Check application logs
2. Verify database migration
3. Test API endpoints
4. Review browser console
5. Check `api/data-streams-routes.js` for backend logic

## License

Part of the LightDom platform.
