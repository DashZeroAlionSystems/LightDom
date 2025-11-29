# Data Streams Guide: Two-Way Real-Time Communication

## Overview

Data streams in LightDom enable real-time, bidirectional communication between services within a workflow. This guide provides comprehensive documentation on setting up, managing, and monitoring data streams for large-scale campaigns.

## Table of Contents

1. [Data Stream Architecture](#data-stream-architecture)
2. [Stream Types and Protocols](#stream-types-and-protocols)
3. [Data Flow Specifications](#data-flow-specifications)
4. [Setup Procedures](#setup-procedures)
5. [Configuration Examples](#configuration-examples)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Data Stream Architecture

### Core Concepts

A **Data Stream** is a real-time communication channel between two services that:
- Transfers structured data from source to destination
- Supports bidirectional communication
- Validates data against schemas
- Buffers messages for reliability
- Tracks message flow and metrics

### Stream Components

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Source    │────────▶│ Data Stream  │────────▶│ Destination │
│   Service   │◀────────│   (Channel)  │◀────────│   Service   │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                        │
      │                        │                        │
   Input                   Attribute                Output
  Attributes               Bindings                Attributes
```

---

## Stream Types and Protocols

### 1. WebSocket Streams (`stream_type: 'websocket'`)

**Use Case:** Real-time bidirectional communication with low latency

**Protocol:** WebSocket (ws:// or wss://)

**Characteristics:**
- Full-duplex communication
- Persistent connection
- Low overhead
- Event-driven messaging

**Data Specification:**
```json
{
  "stream_type": "websocket",
  "realtime_protocol": "wss",
  "data_format": "json",
  "direction": "bidirectional",
  "buffer_size": 100,
  "retry_policy": {
    "max_retries": 3,
    "backoff_ms": 1000,
    "max_backoff_ms": 10000
  }
}
```

**Message Structure:**
```json
{
  "stream_id": "stream_abc123",
  "timestamp": "2025-11-06T13:00:00Z",
  "message_id": "msg_xyz789",
  "data": {
    "attribute1": "value1",
    "attribute2": 123,
    "attribute3": { "nested": "object" }
  },
  "metadata": {
    "source_service_id": "svc_source",
    "correlation_id": "corr_456"
  }
}
```

### 2. Server-Sent Events (SSE) (`stream_type: 'sse'`)

**Use Case:** Server-to-client streaming, unidirectional updates

**Protocol:** HTTP-based Server-Sent Events

**Characteristics:**
- Unidirectional (server → client)
- Automatic reconnection
- Text-based protocol
- Built on HTTP

**Data Specification:**
```json
{
  "stream_type": "sse",
  "realtime_protocol": "http-sse",
  "data_format": "json",
  "direction": "source-to-destination",
  "polling_interval_ms": null
}
```

**Event Format:**
```
event: data_update
id: msg_123
data: {"attribute1": "value", "attribute2": 456}

event: status_change
id: msg_124
data: {"status": "active", "message": "Service ready"}
```

### 3. HTTP Polling (`stream_type: 'polling'`)

**Use Case:** Periodic data synchronization, compatible with all HTTP servers

**Protocol:** HTTP GET/POST

**Characteristics:**
- Simple implementation
- Periodic requests
- Higher latency
- Compatible with legacy systems

**Data Specification:**
```json
{
  "stream_type": "polling",
  "realtime_protocol": "http-polling",
  "polling_interval_ms": 5000,
  "data_format": "json",
  "direction": "source-to-destination",
  "buffer_size": 50
}
```

**Request/Response:**
```http
GET /api/services/{service_id}/stream-data?since=timestamp
Authorization: Bearer {token}

Response:
{
  "messages": [
    {
      "id": "msg_1",
      "timestamp": "2025-11-06T13:00:01Z",
      "data": { "attribute1": "value1" }
    },
    {
      "id": "msg_2",
      "timestamp": "2025-11-06T13:00:02Z",
      "data": { "attribute2": "value2" }
    }
  ],
  "next_poll_after_ms": 5000
}
```

### 4. Webhook (`stream_type: 'webhook'`)

**Use Case:** Event-driven communication, external integrations

**Protocol:** HTTP POST callbacks

**Characteristics:**
- Push-based
- Event-triggered
- Requires public endpoint
- Async processing

**Data Specification:**
```json
{
  "stream_type": "webhook",
  "realtime_protocol": "https",
  "data_format": "json",
  "direction": "source-to-destination",
  "retry_policy": {
    "max_retries": 5,
    "backoff_ms": 2000
  }
}
```

**Webhook Payload:**
```json
{
  "webhook_id": "wh_abc123",
  "event_type": "data.updated",
  "timestamp": "2025-11-06T13:00:00Z",
  "stream_id": "stream_xyz",
  "data": {
    "attribute1": "value1",
    "attribute2": 123
  },
  "signature": "sha256=abc123..."
}
```

---

## Data Flow Specifications

### Attribute Bindings

Attribute bindings define which data flows through a stream:

```json
{
  "attribute_bindings": [
    {
      "source_attribute": "user_data.email",
      "destination_attribute": "contact.email",
      "transform": "lowercase",
      "required": true
    },
    {
      "source_attribute": "analytics.page_views",
      "destination_attribute": "metrics.views",
      "transform": "sum",
      "aggregation_window_ms": 60000
    },
    {
      "source_attribute": "status",
      "destination_attribute": "system_status",
      "transform": "passthrough",
      "required": true
    }
  ]
}
```

### Data Schema Validation

Every stream enforces a JSON schema for data validation:

```json
{
  "data_schema": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["user_id", "event_type"],
    "properties": {
      "user_id": {
        "type": "string",
        "pattern": "^usr_[a-z0-9]+$"
      },
      "event_type": {
        "type": "string",
        "enum": ["click", "view", "conversion"]
      },
      "timestamp": {
        "type": "string",
        "format": "date-time"
      },
      "metadata": {
        "type": "object",
        "additionalProperties": true
      }
    }
  }
}
```

### Transform Functions

Available data transformations:

| Transform | Description | Example |
|-----------|-------------|---------|
| `passthrough` | No transformation | `value` → `value` |
| `lowercase` | Convert to lowercase | `"Hello"` → `"hello"` |
| `uppercase` | Convert to uppercase | `"Hello"` → `"HELLO"` |
| `sum` | Aggregate sum | `[1,2,3]` → `6` |
| `average` | Calculate average | `[10,20,30]` → `20` |
| `count` | Count items | `[a,b,c]` → `3` |
| `filter` | Filter by condition | Apply predicate |
| `map` | Transform each item | Apply function |
| `flatten` | Flatten nested arrays | `[[1,2],[3,4]]` → `[1,2,3,4]` |
| `json_parse` | Parse JSON string | `"{\"a\":1}"` → `{a:1}` |
| `json_stringify` | Convert to JSON | `{a:1}` → `"{\"a\":1}"` |

---

## Setup Procedures

### Procedure 1: Create WebSocket Data Stream (Bidirectional)

**Scenario:** Real-time analytics data flowing between crawler and AI service

**Step 1: Define Source Service**
```bash
POST /api/workflow-hierarchy/services
{
  "name": "Web Crawler Service",
  "service_type": "data-processor",
  "workflow_id": "wf_campaign_123",
  "output_attributes": [
    {"name": "page_url", "type": "string"},
    {"name": "page_content", "type": "string"},
    {"name": "meta_data", "type": "object"}
  ],
  "supports_realtime": true,
  "stream_direction": "outbound"
}
```

**Step 2: Define Destination Service**
```bash
POST /api/workflow-hierarchy/services
{
  "name": "AI Analysis Service",
  "service_type": "ai-engine",
  "workflow_id": "wf_campaign_123",
  "input_attributes": [
    {"name": "page_url", "type": "string"},
    {"name": "content", "type": "string"},
    {"name": "metadata", "type": "object"}
  ],
  "output_attributes": [
    {"name": "analysis_result", "type": "object"},
    {"name": "confidence_score", "type": "number"}
  ],
  "supports_realtime": true,
  "stream_direction": "bidirectional"
}
```

**Step 3: Create Data Stream**
```bash
POST /api/workflow-hierarchy/streams
{
  "name": "Crawler to AI Stream",
  "source_service_id": "svc_crawler_xyz",
  "destination_service_id": "svc_ai_abc",
  "stream_type": "websocket",
  "direction": "bidirectional",
  "data_format": "json",
  "realtime_protocol": "wss",
  "buffer_size": 100,
  "attribute_bindings": [
    {
      "source_attribute": "page_url",
      "destination_attribute": "page_url",
      "transform": "passthrough"
    },
    {
      "source_attribute": "page_content",
      "destination_attribute": "content",
      "transform": "passthrough"
    },
    {
      "source_attribute": "meta_data",
      "destination_attribute": "metadata",
      "transform": "passthrough"
    }
  ],
  "data_schema": {
    "type": "object",
    "required": ["page_url", "content"],
    "properties": {
      "page_url": {"type": "string", "format": "uri"},
      "content": {"type": "string"},
      "metadata": {"type": "object"}
    }
  },
  "retry_policy": {
    "max_retries": 3,
    "backoff_ms": 1000
  }
}
```

**Step 4: Establish Connection (Backend Implementation)**

WebSocket connection setup in service:
```typescript
// Source Service (Crawler)
const ws = new WebSocket('wss://api.example.com/streams/stream_xyz');

ws.on('open', () => {
  console.log('Stream connected');
  
  // Send data
  ws.send(JSON.stringify({
    stream_id: 'stream_xyz',
    message_id: 'msg_' + Date.now(),
    data: {
      page_url: 'https://example.com',
      page_content: '<html>...</html>',
      meta_data: { title: 'Example' }
    }
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Received from AI:', message.data.analysis_result);
});

// Destination Service (AI)
// Listens on WebSocket server endpoint
wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    const message = JSON.parse(data);
    
    // Process with AI
    const result = await analyzeContent(message.data.content);
    
    // Send back result
    ws.send(JSON.stringify({
      stream_id: message.stream_id,
      message_id: 'response_' + Date.now(),
      data: {
        analysis_result: result,
        confidence_score: 0.95
      }
    }));
  });
});
```

### Procedure 2: Create HTTP Polling Stream (Unidirectional)

**Scenario:** Periodic status updates from external API

**Step 1: Create Stream**
```bash
POST /api/workflow-hierarchy/streams
{
  "name": "External API Polling",
  "source_service_id": "svc_external_api",
  "destination_service_id": "svc_database",
  "stream_type": "polling",
  "direction": "source-to-destination",
  "polling_interval_ms": 10000,
  "data_format": "json",
  "attribute_bindings": [
    {
      "source_attribute": "api_response.data",
      "destination_attribute": "external_data",
      "transform": "passthrough"
    }
  ]
}
```

**Step 2: Implement Polling Logic**
```typescript
class PollingStream {
  private intervalId: NodeJS.Timer;
  
  start() {
    this.intervalId = setInterval(async () => {
      try {
        const response = await fetch(sourceEndpoint);
        const data = await response.json();
        
        // Validate against schema
        if (validateSchema(data, stream.data_schema)) {
          // Transform and send to destination
          await sendToDestination(transform(data));
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, stream.polling_interval_ms);
  }
  
  stop() {
    clearInterval(this.intervalId);
  }
}
```

### Procedure 3: Create Webhook Stream (Event-Driven)

**Step 1: Register Webhook**
```bash
POST /api/workflow-hierarchy/streams
{
  "name": "Payment Webhook Stream",
  "source_service_id": "svc_payment_gateway",
  "destination_service_id": "svc_order_processor",
  "stream_type": "webhook",
  "direction": "source-to-destination",
  "data_format": "json",
  "realtime_protocol": "https",
  "attribute_bindings": [
    {
      "source_attribute": "transaction.id",
      "destination_attribute": "transaction_id",
      "transform": "passthrough"
    },
    {
      "source_attribute": "transaction.amount",
      "destination_attribute": "payment_amount",
      "transform": "passthrough"
    }
  ],
  "retry_policy": {
    "max_retries": 5,
    "backoff_ms": 2000
  }
}
```

**Step 2: Webhook Endpoint Implementation**
```typescript
app.post('/webhooks/stream/:stream_id', async (req, res) => {
  const { stream_id } = req.params;
  const payload = req.body;
  
  // Verify signature
  if (!verifyWebhookSignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Get stream configuration
  const stream = await getDataStream(stream_id);
  
  // Validate payload
  if (!validateSchema(payload.data, stream.data_schema)) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  
  // Transform and forward
  const transformed = transformData(payload.data, stream.attribute_bindings);
  await forwardToDestination(stream.destination_service_id, transformed);
  
  // Acknowledge receipt
  res.status(200).json({ received: true, message_id: payload.message_id });
});
```

---

## Configuration Examples

### Example 1: Multi-Stream Campaign Workflow

```json
{
  "workflow": {
    "name": "SEO Campaign Workflow",
    "workflow_type": "composite",
    "category": "seo"
  },
  "services": [
    {
      "service_id": "svc_crawler",
      "name": "Web Crawler",
      "service_type": "data-processor"
    },
    {
      "service_id": "svc_analyzer",
      "name": "SEO Analyzer",
      "service_type": "ai-engine"
    },
    {
      "service_id": "svc_database",
      "name": "Results Database",
      "service_type": "database"
    },
    {
      "service_id": "svc_dashboard",
      "name": "Live Dashboard",
      "service_type": "api"
    }
  ],
  "streams": [
    {
      "stream_id": "stream_1",
      "name": "Crawler → Analyzer",
      "source_service_id": "svc_crawler",
      "destination_service_id": "svc_analyzer",
      "stream_type": "websocket",
      "direction": "source-to-destination"
    },
    {
      "stream_id": "stream_2",
      "name": "Analyzer → Database",
      "source_service_id": "svc_analyzer",
      "destination_service_id": "svc_database",
      "stream_type": "websocket",
      "direction": "source-to-destination"
    },
    {
      "stream_id": "stream_3",
      "name": "Database ↔ Dashboard",
      "source_service_id": "svc_database",
      "destination_service_id": "svc_dashboard",
      "stream_type": "websocket",
      "direction": "bidirectional"
    }
  ]
}
```

---

## Best Practices

### 1. Stream Naming Conventions
- Use descriptive names: `{Source} → {Destination} [{Data Type}]`
- Examples: `"Crawler → AI [SEO Data]"`, `"Dashboard ↔ API [User Events]"`

### 2. Buffer Sizing
- **Small messages (<1KB):** buffer_size: 100-500
- **Medium messages (1-10KB):** buffer_size: 50-100
- **Large messages (>10KB):** buffer_size: 10-50

### 3. Retry Policies
```json
{
  "retry_policy": {
    "max_retries": 3,
    "backoff_ms": 1000,
    "max_backoff_ms": 30000,
    "exponential": true,
    "jitter": true
  }
}
```

### 4. Schema Versioning
- Always version your data schemas
- Use semantic versioning: `v1.0.0`, `v1.1.0`, `v2.0.0`
- Maintain backward compatibility when possible

### 5. Monitoring
Track these metrics for each stream:
- `total_messages_sent`
- `total_messages_received`
- `last_data_received_at`
- `error_rate`
- `average_latency_ms`

---

## Troubleshooting

### Issue: Stream Not Receiving Data

**Diagnosis:**
1. Check stream `is_active` status
2. Verify source service is sending data
3. Check schema validation errors
4. Review attribute bindings

**Solution:**
```sql
-- Check stream status
SELECT stream_id, is_active, last_data_received_at 
FROM data_streams 
WHERE stream_id = 'stream_xyz';

-- Check recent errors
SELECT * FROM stream_errors 
WHERE stream_id = 'stream_xyz' 
ORDER BY created_at DESC LIMIT 10;
```

### Issue: High Latency

**Diagnosis:**
- Check buffer_size (too small = high latency)
- Review polling_interval_ms (too high = latency)
- Verify network connectivity

**Solution:**
- Increase buffer_size for batch processing
- Decrease polling_interval_ms
- Use WebSocket instead of polling
- Add stream monitoring

### Issue: Data Validation Failures

**Diagnosis:**
- Schema mismatch between source and stream
- Incorrect attribute bindings
- Transform function errors

**Solution:**
```typescript
// Enable schema validation logging
const validateAndLog = (data, schema) => {
  const result = validateSchema(data, schema);
  if (!result.valid) {
    console.error('Validation failed:', result.errors);
    // Log to database for analysis
    logValidationError(stream_id, data, result.errors);
  }
  return result.valid;
};
```

---

## Advanced Topics

### Stream Multiplexing

Send data to multiple destinations:

```json
{
  "stream_type": "websocket",
  "multiplexing": {
    "enabled": true,
    "destinations": [
      "svc_analyzer_1",
      "svc_analyzer_2",
      "svc_backup"
    ],
    "strategy": "round-robin"
  }
}
```

### Stream Aggregation

Combine multiple sources:

```json
{
  "aggregation": {
    "enabled": true,
    "sources": ["svc_crawler_1", "svc_crawler_2"],
    "merge_strategy": "merge",
    "deduplication": true,
    "dedup_key": "page_url"
  }
}
```

### Dead Letter Queue

Handle failed messages:

```json
{
  "dead_letter_queue": {
    "enabled": true,
    "max_retries": 3,
    "queue_service_id": "svc_dlq",
    "retention_hours": 168
  }
}
```

---

## Summary

This guide provides complete specifications for:
- ✅ Four stream types (WebSocket, SSE, Polling, Webhook)
- ✅ Data flow specifications with schemas
- ✅ Step-by-step setup procedures
- ✅ Configuration examples
- ✅ Best practices and troubleshooting
- ✅ Advanced features

For additional support, see:
- API Reference: `/api/workflow-hierarchy/streams`
- Schema documentation: `migrations/workflow-hierarchy-schema.sql`
- Live examples: `WORKFLOW_BUILDER_QUICKSTART.md`
