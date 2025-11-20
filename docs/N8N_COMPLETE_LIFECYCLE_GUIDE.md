# N8N Workflow Complete Lifecycle Documentation

## Overview

This documentation covers the complete N8N workflow lifecycle system with deep integration for DeepSeek AI to manage, monitor, and optimize workflows.

## Workflow Stages - Complete N8N Architecture

### 1. Triggers (How Workflows Start)

#### Webhook Trigger
- **Type**: `n8n-nodes-base.webhook`
- **Use**: Receive HTTP requests to start workflows
- **Configuration**: HTTP method, path, response mode
- **Example**: API endpoint integration, form submissions

#### Schedule Trigger (Cron)
- **Type**: `n8n-nodes-base.cron`
- **Use**: Run workflows on schedule
- **Configuration**: Cron expression
- **Example**: Daily reports, periodic data sync

#### Manual Trigger
- **Type**: `n8n-nodes-base.manualTrigger`
- **Use**: Start workflows manually
- **Configuration**: None
- **Example**: Testing, one-time operations

#### Event Triggers
- **Email Trigger**: `n8n-nodes-base.emailReadImap`
- **File Trigger**: `n8n-nodes-base.localFileTrigger`
- **Database Trigger**: `n8n-nodes-base.postgresTrigger`
- **SSE Trigger**: `n8n-nodes-base.sse`

### 2. Actions (What Workflows Do)

#### HTTP Request
- **Type**: `n8n-nodes-base.httpRequest`
- **Use**: Call external APIs
- **Features**: Retries, timeouts, authentication
- **Example**: Fetch data from third-party services

#### Database Operations
- **Type**: `n8n-nodes-base.postgres`
- **Use**: CRUD operations on database
- **Operations**: INSERT, UPDATE, DELETE, SELECT
- **Example**: Store workflow results

#### Function/Code Execution
- **Type**: `n8n-nodes-base.function` or `n8n-nodes-base.code`
- **Use**: Custom JavaScript logic
- **Features**: Access to node data, libraries
- **Example**: Data transformation, business logic

#### File Operations
- **Write**: `n8n-nodes-base.writeBinaryFile`
- **Read**: Various file nodes
- **Example**: Generate reports, process uploads

#### Email Send
- **Type**: `n8n-nodes-base.emailSend`
- **Use**: Send email notifications
- **Example**: Alert on errors, send reports

### 3. Flow Control (How Workflows Branch)

#### IF Condition
- **Type**: `n8n-nodes-base.if`
- **Use**: Simple true/false branching
- **Configuration**: Comparison rules
- **Example**: Different actions based on value

#### Switch
- **Type**: `n8n-nodes-base.switch`
- **Use**: Multiple conditional paths
- **Configuration**: Multiple rules with outputs
- **Example**: Route by event type, status code

#### Merge
- **Type**: `n8n-nodes-base.merge`
- **Use**: Combine data from multiple paths
- **Modes**: Combine all, wait for all, append
- **Example**: Aggregate parallel task results

#### Split in Batches
- **Type**: `n8n-nodes-base.splitInBatches`
- **Use**: Process large datasets in chunks
- **Configuration**: Batch size
- **Example**: Process 1000 records in batches of 10

### 4. Error Handling (Managing Failures)

#### Error Trigger
- **Type**: `n8n-nodes-base.errorTrigger`
- **Use**: Catch workflow errors
- **Configuration**: Error workflow
- **Example**: Log errors, send notifications

#### Node-Level Error Handling
- **continueOnFail**: Continue workflow even if node fails
- **alwaysOutputData**: Output data even on error
- **retryOnFail**: Automatically retry failed nodes
- **maxTries**: Maximum retry attempts
- **waitBetweenTries**: Delay between retries

#### Stop and Error
- **Type**: `n8n-nodes-base.stopAndError`
- **Use**: Explicitly stop with error
- **Example**: Validation failures

### 5. Sub-Workflows (Workflow Composition)

#### Execute Workflow
- **Type**: `n8n-nodes-base.executeWorkflow`
- **Use**: Call other workflows
- **Configuration**: Workflow ID, wait for completion
- **Example**: Modular workflow design, reusable components

#### Wait
- **Type**: `n8n-nodes-base.wait`
- **Use**: Pause workflow execution
- **Configuration**: Duration or until webhook
- **Example**: Rate limiting, human approvals

### 6. Data Transformation

#### Set
- **Type**: `n8n-nodes-base.set`
- **Use**: Create/modify data fields
- **Example**: Format data for next node

#### Filter
- **Type**: `n8n-nodes-base.filter`
- **Use**: Remove items that don't match criteria
- **Example**: Filter valid records

#### Aggregate
- **Type**: `n8n-nodes-base.aggregate`
- **Use**: Combine/summarize data
- **Operations**: Sum, average, count, concat
- **Example**: Calculate totals

#### Sort
- **Type**: `n8n-nodes-base.sort`
- **Use**: Order items
- **Example**: Sort by date, priority

### 7. Response (How Workflows End)

#### Respond to Webhook
- **Type**: `n8n-nodes-base.respondToWebhook`
- **Use**: Send HTTP response
- **Configuration**: Response code, body, headers
- **Example**: API endpoint responses

## DeepSeek Integration for Workflow Management

### Error Logging and Analysis

All workflow errors are logged with standardized format:

```json
{
  "timestamp": "2025-11-18T16:05:00.000Z",
  "workflowId": "wf_abc123",
  "executionId": "exec_xyz789",
  "error": {
    "message": "Connection timeout",
    "stack": "...",
    "code": "ETIMEDOUT",
    "type": "Error"
  },
  "context": {
    "nodeType": "httpRequest",
    "nodeName": "Call External API"
  },
  "severity": "high",
  "message": "[workflow][execution][error] - error - Workflow wf_abc123 failed: Connection timeout"
}
```

### DeepSeek Capabilities

DeepSeek can:

1. **Analyze Errors**
   - Root cause analysis
   - Suggested fixes
   - Prevention strategies
   - Priority assessment

2. **Monitor Workflows**
   - Health score calculation
   - Performance metrics
   - Success rate tracking
   - Execution time analysis

3. **Generate Recommendations**
   - Optimize slow workflows
   - Improve error handling
   - Add retry logic
   - Suggest refactoring

4. **Manage Workflows**
   - Enable/disable workflows
   - Create from templates
   - Modify configurations
   - Fix identified issues

### API Endpoints for DeepSeek

#### Create Complete Workflow
```bash
POST /api/deepseek-workflows/create-complete
```

Create workflow with all stages specified:

```json
{
  "name": "Data Processing Workflow",
  "trigger": {
    "type": "WEBHOOK",
    "parameters": {
      "httpMethod": "POST",
      "path": "data-process"
    }
  },
  "actions": [
    {
      "name": "Fetch Data",
      "type": "HTTP_REQUEST",
      "parameters": {
        "method": "GET",
        "url": "https://api.example.com/data"
      },
      "retry": {
        "enabled": true,
        "maxAttempts": 3,
        "waitTime": 1000
      },
      "canFail": true
    },
    {
      "name": "Store Data",
      "type": "DATABASE",
      "parameters": {
        "operation": "insert",
        "table": "data_items"
      }
    }
  ],
  "conditions": [],
  "errorHandling": {
    "enabled": true,
    "notify": true
  },
  "response": {
    "type": "json"
  }
}
```

#### Get Errors for Analysis
```bash
GET /api/deepseek-workflows/errors?severity=high&limit=50
```

Returns errors with:
- Timestamp
- Workflow/execution IDs
- Error details
- Context
- Severity
- DeepSeek analysis (if available)

#### Get Workflow Statistics
```bash
GET /api/deepseek-workflows/:workflowId/stats
```

Returns:
- Execution stats (total, success, failed)
- Performance metrics
- Error summary
- Health score
- Recommendations

#### Analyze Specific Error
```bash
POST /api/deepseek-workflows/:workflowId/analyze-error
```

Request DeepSeek to analyze an error:

```json
{
  "errorId": "exec_xyz789"
}
```

Response includes:
- Root cause
- Suggested fix
- Prevention strategies
- Priority level

#### Enable DeepSeek Management
```bash
POST /api/deepseek-workflows/:workflowId/enable-management
```

Enables DeepSeek to:
- Analyze errors automatically
- Optimize performance
- Auto-fix issues
- Proactive monitoring

#### Get Enhanced Templates
```bash
GET /api/deepseek-workflows/enhanced-templates
```

Returns templates showing all stages:
- complete_api_workflow
- scheduled_data_processor
- event_driven_router

#### Create from Enhanced Template
```bash
POST /api/deepseek-workflows/from-enhanced-template
```

```json
{
  "templateId": "complete_api_workflow",
  "config": {
    "webhookPath": "my-endpoint",
    "apiUrl": "https://api.example.com",
    "enableRetry": true,
    "maxRetries": 3,
    "notifyOnError": true
  },
  "name": "My API Integration"
}
```

#### Get All Stage Types
```bash
GET /api/deepseek-workflows/stage-types
```

Returns complete list of N8N node types by category:
- TRIGGERS
- ACTIONS
- FLOW_CONTROL
- ERROR_HANDLING
- SUB_WORKFLOWS
- DATA
- RESPONSE

## Complete Workflow Example

Here's a complete workflow showing all stages:

```javascript
{
  "name": "Complete E-Commerce Order Processing",
  "nodes": [
    // 1. TRIGGER: Webhook receives order
    {
      "name": "Order Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "orders"
      }
    },
    
    // 2. VALIDATION: Check order data
    {
      "name": "Validate Order",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.orderId}}",
              "operation": "isNotEmpty"
            }
          ]
        }
      }
    },
    
    // 3. ACTION: Check inventory via API
    {
      "name": "Check Inventory",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://inventory.example.com/check"
      },
      "retryOnFail": true,
      "maxTries": 3
    },
    
    // 4. CONDITION: Route based on availability
    {
      "name": "Check Availability",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "boolean": [
            {
              "value1": "={{$json.available}}",
              "value2": true
            }
          ]
        }
      }
    },
    
    // 5a. ACTION: Process payment (if available)
    {
      "name": "Process Payment",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://payment.example.com/charge"
      },
      "continueOnFail": false
    },
    
    // 6. SUB-WORKFLOW: Shipping workflow
    {
      "name": "Create Shipment",
      "type": "n8n-nodes-base.executeWorkflow",
      "parameters": {
        "workflowId": "shipping-workflow-id",
        "waitForSubWorkflow": true
      }
    },
    
    // 7. ACTION: Update database
    {
      "name": "Save Order",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "orders"
      }
    },
    
    // 8. ACTION: Send confirmation email
    {
      "name": "Send Confirmation",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "toEmail": "={{$json.customerEmail}}",
        "subject": "Order Confirmed"
      }
    },
    
    // 9. RESPONSE: Return to webhook caller
    {
      "name": "Order Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{$json}}"
      }
    },
    
    // 5b. ACTION: Send out-of-stock notification (if unavailable)
    {
      "name": "Out of Stock Notification",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "toEmail": "={{$json.customerEmail}}",
        "subject": "Item Out of Stock"
      }
    },
    
    // ERROR HANDLING: Global error handler
    {
      "name": "Error Handler",
      "type": "n8n-nodes-base.errorTrigger",
      "parameters": {}
    },
    
    // Log error to database
    {
      "name": "Log Error",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "workflow_errors"
      }
    },
    
    // Notify DeepSeek about error
    {
      "name": "Notify DeepSeek",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "http://localhost:3001/api/deepseek-workflows/log-error",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "workflowId",
              "value": "={{$workflow.id}}"
            },
            {
              "name": "executionId",
              "value": "={{$execution.id}}"
            },
            {
              "name": "error",
              "value": "={{$json.error}}"
            }
          ]
        }
      }
    }
  ],
  "connections": {
    "Order Webhook": {
      "main": [["Validate Order"]]
    },
    "Validate Order": {
      "main": [
        ["Check Inventory"],  // True path
        ["Order Response"]     // False path (validation failed)
      ]
    },
    "Check Inventory": {
      "main": [["Check Availability"]]
    },
    "Check Availability": {
      "main": [
        ["Process Payment"],           // Available
        ["Out of Stock Notification"]  // Unavailable
      ]
    },
    "Process Payment": {
      "main": [["Create Shipment"]]
    },
    "Create Shipment": {
      "main": [["Save Order"]]
    },
    "Save Order": {
      "main": [["Send Confirmation"]]
    },
    "Send Confirmation": {
      "main": [["Order Response"]]
    },
    "Out of Stock Notification": {
      "main": [["Order Response"]]
    },
    "Error Handler": {
      "main": [["Log Error"]]
    },
    "Log Error": {
      "main": [["Notify DeepSeek"]]
    }
  }
}
```

## Message Service Integration

All workflow events use standardized message format:

```
[campaign][service][servicename] - [level] - message
```

Examples:
```
[workflow][lifecycle][create] - info - Workflow created with 15 nodes
[workflow][execution][error] - error - Workflow wf_abc123 failed: Connection timeout
[workflow][deepseek][analysis] - info - Error analyzed by DeepSeek
[workflow][deepseek][management] - info - DeepSeek management enabled for workflow wf_abc123
[workflow][deepseek][create] - info - Complete workflow created
[workflow][deepseek][templates] - info - Retrieved 3 enhanced template(s)
```

## Best Practices for DeepSeek

1. **Always enable error handling** in workflows
2. **Use retry logic** for unreliable operations
3. **Log all errors** to DeepSeek for analysis
4. **Monitor health scores** regularly
5. **Apply DeepSeek recommendations** for optimization
6. **Use enhanced templates** for consistency
7. **Enable DeepSeek management** for critical workflows
8. **Review error logs** daily
9. **Set up notifications** for critical errors
10. **Document workflow stages** in metadata

## Performance Optimization

DeepSeek can identify and fix:

- Slow HTTP requests (increase timeout, add retries)
- Database bottlenecks (batch operations, indexes)
- Memory issues (split in batches)
- Sequential operations that could be parallel
- Missing error handling
- Inefficient data transformations

## Next Steps

1. Review error logs via DeepSeek API
2. Enable DeepSeek management for existing workflows
3. Create workflows from enhanced templates
4. Monitor health scores and apply recommendations
5. Set up automatic error analysis
6. Implement suggested optimizations
