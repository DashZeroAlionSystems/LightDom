# Workflow Rules and Procedures

## Overview

This document defines the comprehensive rules, procedures, and best practices for creating, managing, and operating workflows in LightDom. These rules ensure consistency, reliability, and scalability across all workflow implementations.

## Table of Contents

1. [Workflow Design Rules](#workflow-design-rules)
2. [Service Coupling Rules](#service-coupling-rules)
3. [Data Stream Rules](#data-stream-rules)
4. [Campaign Management Procedures](#campaign-management-procedures)
5. [Schema Requirements](#schema-requirements)
6. [Error Handling Standards](#error-handling-standards)
7. [Performance Guidelines](#performance-guidelines)

---

## Workflow Design Rules

### Rule 1: Workflow Hierarchy Constraints

**MUST:**
- Every workflow MUST have a unique `workflow_id`
- Root workflows MUST NOT have a `parent_workflow_id`
- Composite workflows MUST have at least 2 child workflows or services
- Atomic workflows MUST NOT have child workflows

**MUST NOT:**
- Workflows MUST NOT create circular parent-child references
- Workflow hierarchy depth MUST NOT exceed 10 levels
- Workflow names MUST NOT exceed 255 characters

**Example Valid Hierarchy:**
```
Campaign Root (level 0)
├── Data Collection (level 1, composite)
│   ├── Web Crawler (level 2, atomic)
│   └── API Fetcher (level 2, atomic)
└── Analysis (level 1, composite)
    ├── SEO Analyzer (level 2, atomic)
    └── Content Scorer (level 2, atomic)
```

**Example Invalid Hierarchy:**
```
Campaign A
└── Sub-Campaign
    └── Campaign A  ❌ CIRCULAR REFERENCE
```

### Rule 2: Workflow Lifecycle States

**State Transition Rules:**
```
draft → active → paused → active → archived
         ↓
      archived
```

**MUST:**
- New workflows MUST start in `draft` state
- Only `draft` workflows CAN be deleted
- `active` workflows MUST be paused before archiving
- `archived` workflows CANNOT be modified

**MUST NOT:**
- Cannot transition from `archived` to any other state
- Cannot skip intermediate states (draft → archived directly)

### Rule 3: Workflow Categorization

**Required Categories:**
- `seo` - SEO and search optimization
- `data-mining` - Web scraping and data extraction
- `ai-content` - AI-powered content generation
- `analytics` - Data analysis and reporting
- `automation` - Process automation
- `monitoring` - System and service monitoring
- `notification` - Alert and notification systems

**Custom Categories:**
- MUST follow snake_case naming: `custom_category`
- MUST NOT conflict with reserved categories
- MUST be documented in workflow metadata

### Rule 4: Workflow Configuration Schema

**Required Configuration Fields:**
```json
{
  "config": {
    "execution_mode": "sequential|parallel|dag",
    "max_concurrent_tasks": 10,
    "timeout_seconds": 3600,
    "retry_policy": {
      "enabled": true,
      "max_retries": 3,
      "backoff_strategy": "exponential"
    },
    "error_handling": {
      "on_error": "stop|continue|skip",
      "notify_on_error": true,
      "error_channels": ["email", "slack"]
    },
    "scheduling": {
      "enabled": false,
      "cron_expression": "0 0 * * *",
      "timezone": "UTC"
    }
  }
}
```

---

## Service Coupling Rules

### Rule 5: Service Dependency Management

**MUST:**
- Services MUST declare all dependencies explicitly
- Service startup order MUST respect dependency graph
- Circular dependencies MUST be detected and rejected

**Dependency Declaration:**
```json
{
  "service_id": "svc_analyzer",
  "dependencies": [
    {
      "service_id": "svc_database",
      "type": "required",
      "wait_for_ready": true,
      "timeout_seconds": 30
    },
    {
      "service_id": "svc_cache",
      "type": "optional",
      "fallback_strategy": "continue_without"
    }
  ]
}
```

**Dependency Types:**
- `required` - Service cannot start without dependency
- `optional` - Service can start but with reduced functionality
- `runtime` - Dependency resolved at execution time

### Rule 6: Service Communication Patterns

**Allowed Patterns:**
1. **Request-Response** - Synchronous, blocking
2. **Publish-Subscribe** - Asynchronous, many-to-many
3. **Data Stream** - Continuous, real-time
4. **Event-Driven** - Triggered by events

**Pattern Selection Matrix:**

| Use Case | Pattern | Rationale |
|----------|---------|-----------|
| Data validation | Request-Response | Immediate feedback needed |
| Status updates | Publish-Subscribe | Multiple subscribers |
| Real-time analytics | Data Stream | Continuous data flow |
| Webhook processing | Event-Driven | Triggered externally |

### Rule 7: Service Attribute Mapping

**Input/Output Attribute Rules:**

**MUST:**
- All input attributes MUST be documented
- Output attributes MUST match declared schema
- Attribute names MUST use snake_case
- Required attributes MUST be marked explicitly

**Example:**
```json
{
  "input_attributes": [
    {
      "name": "page_url",
      "type": "string",
      "format": "uri",
      "required": true,
      "description": "URL of page to analyze"
    },
    {
      "name": "options",
      "type": "object",
      "required": false,
      "default": {},
      "description": "Analysis options"
    }
  ],
  "output_attributes": [
    {
      "name": "seo_score",
      "type": "number",
      "minimum": 0,
      "maximum": 100,
      "description": "Overall SEO score"
    },
    {
      "name": "recommendations",
      "type": "array",
      "items": {"type": "string"},
      "description": "List of SEO recommendations"
    }
  ],
  "attribute_mappings": {
    "page_url": {
      "validate": "url",
      "transform": "normalize_url",
      "cache_key": true
    }
  }
}
```

---

## Data Stream Rules

### Rule 8: Stream Connection Requirements

**MUST:**
- Both source and destination services MUST exist before creating stream
- Source service MUST have compatible output attributes
- Destination service MUST have compatible input attributes
- Stream MUST validate attribute type compatibility

**Compatibility Check:**
```typescript
function validateStreamCompatibility(stream, sourceService, destService) {
  for (const binding of stream.attribute_bindings) {
    const sourceAttr = findAttribute(
      sourceService.output_attributes,
      binding.source_attribute
    );
    const destAttr = findAttribute(
      destService.input_attributes,
      binding.destination_attribute
    );
    
    if (!sourceAttr) {
      throw new Error(`Source attribute not found: ${binding.source_attribute}`);
    }
    if (!destAttr) {
      throw new Error(`Destination attribute not found: ${binding.destination_attribute}`);
    }
    if (!typesCompatible(sourceAttr.type, destAttr.type)) {
      throw new Error(`Incompatible types: ${sourceAttr.type} → ${destAttr.type}`);
    }
  }
  return true;
}
```

### Rule 9: Stream Protocol Selection

**Protocol Requirements:**

| Stream Type | Min Latency | Max Throughput | Reliability | Use When |
|-------------|-------------|----------------|-------------|----------|
| WebSocket | <100ms | High | Medium | Real-time bidirectional |
| SSE | <500ms | Medium | High | Server push only |
| HTTP Polling | Variable | Low-Medium | High | Simple, compatible |
| Webhook | <1s | Low | Medium | Event-driven |

**Selection Rule:**
```
IF bidirectional_required THEN use WebSocket
ELSE IF server_push_only THEN use SSE
ELSE IF event_triggered THEN use Webhook
ELSE use HTTP Polling
```

### Rule 10: Stream Buffer Management

**Buffer Sizing Formula:**
```
buffer_size = (avg_message_size_kb * messages_per_second * buffer_seconds) / 1024
```

**Example:**
- Average message: 5KB
- Rate: 10 messages/second
- Buffer window: 10 seconds
- Result: `buffer_size = (5 * 10 * 10) / 1024 ≈ 50`

**Limits:**
- Minimum buffer_size: 10
- Maximum buffer_size: 10000
- Default: 100

---

## Campaign Management Procedures

### Procedure 1: Creating a Large-Scale Campaign

**Step 1: Define Campaign Structure**
```json
{
  "workflow": {
    "name": "Q4 Marketing Campaign",
    "workflow_type": "root",
    "category": "seo",
    "config": {
      "execution_mode": "parallel",
      "max_concurrent_tasks": 50
    }
  }
}
```

**Step 2: Create Service Groups**
```json
{
  "service_groups": [
    {
      "name": "Data Collection",
      "services": ["crawler_1", "crawler_2", "api_fetcher"]
    },
    {
      "name": "Processing",
      "services": ["seo_analyzer", "content_scorer", "link_checker"]
    },
    {
      "name": "Storage",
      "services": ["primary_db", "cache_service", "backup_db"]
    },
    {
      "name": "Notification",
      "services": ["email_service", "slack_notifier", "dashboard_api"]
    }
  ]
}
```

**Step 3: Connect Services with Streams**
```javascript
// Connect all crawlers to analyzers (fan-out pattern)
const crawlers = ['crawler_1', 'crawler_2', 'api_fetcher'];
const analyzers = ['seo_analyzer', 'content_scorer'];

for (const crawler of crawlers) {
  for (const analyzer of analyzers) {
    await createDataStream({
      name: `${crawler} → ${analyzer}`,
      source_service_id: crawler,
      destination_service_id: analyzer,
      stream_type: 'websocket',
      direction: 'source-to-destination'
    });
  }
}

// Connect analyzers to databases (fan-in pattern)
for (const analyzer of analyzers) {
  await createDataStream({
    name: `${analyzer} → Database`,
    source_service_id: analyzer,
    destination_service_id: 'primary_db',
    stream_type: 'websocket',
    direction: 'source-to-destination'
  });
}
```

**Step 4: Create Dashboard**
```json
{
  "dashboard": {
    "name": "Campaign Control Center",
    "dashboard_type": "monitoring",
    "workflow_id": "wf_q4_campaign",
    "connected_services": [
      "primary_db",
      "seo_analyzer",
      "content_scorer"
    ],
    "widget_config": [
      {
        "type": "stat_card",
        "title": "Pages Analyzed",
        "source": "primary_db",
        "query": "SELECT COUNT(*) FROM analyzed_pages",
        "refresh_interval_ms": 5000
      },
      {
        "type": "line_chart",
        "title": "SEO Score Trend",
        "source": "primary_db",
        "query": "SELECT timestamp, AVG(seo_score) FROM scores GROUP BY hour",
        "refresh_interval_ms": 10000
      }
    ],
    "supports_realtime": true
  }
}
```

### Procedure 2: Coupling Services for Multi-Stage Processing

**Pipeline Pattern:**
```
Input → Transform → Enrich → Validate → Store → Notify
```

**Implementation:**
```typescript
class ServicePipeline {
  private stages: Service[];
  private streams: DataStream[];
  
  async createPipeline(stages: ServiceConfig[]) {
    // Create services
    this.stages = await Promise.all(
      stages.map(config => this.createService(config))
    );
    
    // Connect sequential streams
    for (let i = 0; i < this.stages.length - 1; i++) {
      const stream = await this.createDataStream({
        name: `Stage ${i} → Stage ${i+1}`,
        source_service_id: this.stages[i].service_id,
        destination_service_id: this.stages[i+1].service_id,
        stream_type: 'websocket',
        direction: 'source-to-destination',
        attribute_bindings: this.mapAttributes(
          this.stages[i].output_attributes,
          this.stages[i+1].input_attributes
        )
      });
      this.streams.push(stream);
    }
    
    return {
      stages: this.stages,
      streams: this.streams
    };
  }
  
  private mapAttributes(outputs, inputs) {
    return outputs.map((output, index) => ({
      source_attribute: output.name,
      destination_attribute: inputs[index]?.name || output.name,
      transform: 'passthrough'
    }));
  }
}
```

---

## Schema Requirements

### Rule 11: Automatic Schema Generation

**ALL entities MUST have auto-generated schemas:**

1. **Workflows** - Generated when created/updated
2. **Services** - Generated based on attributes
3. **Data Streams** - Generated from attribute bindings
4. **Dashboards** - Generated from widget configuration

**Schema Generation Triggers:**
- Entity creation
- Configuration change
- Attribute modification
- Version update

**Schema Storage:**
```sql
INSERT INTO auto_schema_generations (
  generation_id,
  entity_type,
  entity_id,
  schema_content,
  generation_method,
  confidence_score,
  generated_by
) VALUES (
  'gen_' || gen_random_uuid(),
  'workflow',
  'wf_123',
  '{"$schema": "...", "properties": {...}}',
  'auto-inferred',
  0.95,
  'system'
);
```

### Rule 12: Schema Versioning

**Version Format:** `MAJOR.MINOR.PATCH`

**Version Increment Rules:**
- **MAJOR:** Breaking changes (incompatible attribute types)
- **MINOR:** New attributes added (backward compatible)
- **PATCH:** Documentation or validation updates

**Example:**
```
v1.0.0 - Initial schema
v1.1.0 - Added optional 'tags' field
v1.1.1 - Updated description
v2.0.0 - Changed 'status' from string to enum (BREAKING)
```

### Rule 13: Schema Validation

**Validation Levels:**
1. **Strict** - All fields required, no additional properties
2. **Moderate** - Required fields enforced, additional properties allowed
3. **Lenient** - All fields optional, any additional properties

**Default:** Moderate

**Configuration:**
```json
{
  "schema_validation": {
    "level": "moderate",
    "fail_on_invalid": false,
    "log_validation_errors": true,
    "auto_migrate_on_version_change": true
  }
}
```

---

## Error Handling Standards

### Rule 14: Error Classification

**Error Types:**
- **FATAL** - Service cannot continue
- **ERROR** - Operation failed, retry possible
- **WARNING** - Non-critical issue
- **INFO** - Informational message

**Error Response Format:**
```json
{
  "error": {
    "type": "ERROR",
    "code": "VALIDATION_FAILED",
    "message": "Invalid attribute type",
    "details": {
      "attribute": "page_url",
      "expected": "string",
      "received": "number"
    },
    "timestamp": "2025-11-06T13:00:00Z",
    "service_id": "svc_analyzer",
    "correlation_id": "corr_abc123"
  }
}
```

### Rule 15: Retry Strategies

**Exponential Backoff:**
```typescript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = Math.min(
        1000 * Math.pow(2, attempt) + Math.random() * 1000,
        30000
      );
      await sleep(delay);
    }
  }
}
```

**Circuit Breaker:**
```typescript
class CircuitBreaker {
  private failures = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private threshold = 5;
  private timeout = 60000;
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      throw new Error('Circuit breaker OPEN');
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      setTimeout(() => {
        this.state = 'HALF_OPEN';
        this.failures = 0;
      }, this.timeout);
    }
  }
}
```

---

## Performance Guidelines

### Rule 16: Resource Limits

**Per-Workflow Limits:**
- Max services: 100
- Max data streams: 200
- Max concurrent executions: 50
- Max execution time: 24 hours
- Max memory per service: 2GB

**Per-Service Limits:**
- Max input attributes: 50
- Max output attributes: 50
- Max API calls per minute: 1000
- Max message size: 10MB

### Rule 17: Optimization Requirements

**MUST Optimize:**
- Database queries (add indexes)
- Stream buffer sizes
- Attribute transformations
- Schema validation

**Optimization Checklist:**
```
✓ Database indexes on foreign keys
✓ Connection pooling enabled
✓ Caching for repeated queries
✓ Batch processing for bulk operations
✓ Lazy loading for large datasets
✓ Stream compression enabled
✓ Monitoring and alerting configured
```

---

## Summary Checklist

**Before Creating a Workflow:**
- [ ] Workflow hierarchy defined
- [ ] Category selected
- [ ] Configuration schema complete
- [ ] Error handling defined
- [ ] Resource limits considered

**Before Creating a Service:**
- [ ] Input/output attributes documented
- [ ] Dependencies declared
- [ ] Auto-schema generation enabled
- [ ] Error handling implemented
- [ ] Performance limits set

**Before Creating a Data Stream:**
- [ ] Source and destination services exist
- [ ] Attribute compatibility verified
- [ ] Stream type selected appropriately
- [ ] Buffer size calculated
- [ ] Schema validation configured
- [ ] Retry policy defined

**Before Launching a Campaign:**
- [ ] All services tested individually
- [ ] Streams validated end-to-end
- [ ] Dashboard configured
- [ ] Monitoring enabled
- [ ] Error notifications set up
- [ ] Rollback procedure documented

---

## Compliance

**All workflows, services, and streams MUST comply with these rules.**

**Non-compliance will result in:**
- Creation/update rejection
- Automatic deactivation
- Error notifications
- Workflow quarantine

**To request an exemption:**
1. Document the specific rule
2. Explain why compliance is not possible
3. Propose alternative approach
4. Submit for review

Contact: workflow-governance@lightdom.io
